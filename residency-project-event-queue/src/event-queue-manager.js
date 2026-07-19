import { EventEmitter } from 'node:events';
import { Queue } from './queue.js';

/**
 * The Map layer AND the dispatcher, and itself the event stream. Owns `Map<key, Queue>` and the shared pending counter.
 * It is the component that routes each event to its queue, decides when a queue head may be emitted, tracks how
 * many events are outstanding, and signals completion once every queue has drained AND the producer is finished.
 * It emits `event` (a dispatched queue head) and `done` (all queues drained); consumers listen on it directly.
 *
 * Opt A (Phase 3) — memory management. Two levers keep memory bounded under load:
 *   - Eviction: a queue's `Map` entry is released the moment it drains, so `queueCount` tracks
 *     active keys (O(active keys)) rather than every key ever seen.
 *   - Flow control: each queue carries a high/low-water mark. `enqueue` returns a Promise; once a
 *     queue reaches its high-water mark the Promise stays pending (suspending a producer that awaits
 *     it) and only resolves once that queue drains below the low-water mark. `EventEmitter` has no
 *     native pause/resume, so this Promise gate emulates Node Streams backpressure — a fast producer
 *     or a hot key can never grow a queue without bound, and no events are dropped.
 *
 * Opt B (Phase 3) — recoverability. A failing head no longer stalls its queue. On `fail` (a consumer nack) the
 * head is redelivered in place after an exponential backoff (capped), up to `maxAttempts` deliveries; an event
 * that exhausts its attempts is moved to its queue's dead-letter list (`dlq`) exactly once and the queue advances.
 * Only the failing queue backs off — every other queue keeps dispatching, so one bad event never stalls the system.
 */
export class EventQueueManager extends EventEmitter {
  /**
   * @param {object} [opts]
   * @param {number}  [opts.highWater=Infinity] - per-queue size at/above which `enqueue` suspends the producer.
   * @param {number}  [opts.lowWater=0]         - per-queue size at/below which a suspended producer resumes.
   * @param {boolean} [opts.evict=true]         - release a queue's `Map` entry when it drains (set false for the naive baseline).
   * @param {number}  [opts.maxAttempts=5]      - deliveries a failing head gets before it is dead-lettered.
   * @param {number}  [opts.backoffBase=100]    - base backoff in ms; the Nth retry waits `backoffBase * 2^(N-1)`.
   * @param {number}  [opts.backoffCap=30000]   - backoff ceiling in ms (30s).
   * @param {(fn: () => void, ms: number) => void} [opts.schedule] - timer used for backoff (tests inject a deterministic one).
   */
  constructor({
    highWater = Infinity, lowWater = 0, evict = true,
    maxAttempts = 5, backoffBase = 100, backoffCap = 30000,
    schedule = (fn, ms) => setTimeout(fn, ms),
  } = {}) {
    super();

    /** @type {Map<string, Queue>} one queue per ordering key. */
    this.queues = new Map();

    /** @private total events enqueued but not yet processed. */
    this.count = 0;

    /** @private set true after the producer's submit loop completes. */
    this.producerDone = false;

    /** @private ensures `done` fires exactly once. */
    this._done = false;

    /** @private high-water mark: a queue at/above this size suspends its producer. */
    this.highWater = highWater;

    /** @private low-water mark: a suspended producer resumes once its queue drains to/below this size. */
    this.lowWater = lowWater;

    /** @private whether to release a queue's `Map` entry on drain. */
    this.evict = evict;

    /** @private key -> { promise, resolve } for a producer suspended on a full queue. Ideally we can make the EventQueueManager to extend the Stream library
     * but it would require more changes
     */
    this._gates = new Map();

    /** @private count of distinct keys ever seen — survives eviction, unlike queueCount(). */
    this._keysSeen = 0;

    /** @private max deliveries before a head is dead-lettered (Opt B). */
    this.maxAttempts = maxAttempts;

    /** @private base backoff (ms) doubled each retry. */
    this.backoffBase = backoffBase;

    /** @private backoff ceiling (ms). */
    this.backoffCap = backoffCap;

    /** @private timer used to defer a redelivery (injectable for deterministic tests). */
    this.schedule = schedule;

    /** @private key -> array of dead-lettered events. Keyed here (not on the Queue) so it survives eviction. */
    this.dlqs = new Map();
  }

  /**
   * Route an event to its queue (creating the queue on first sighting), enqueue it, bump the pending counter, then try
   * to dispatch it. Returns a flow-control gate: a Promise that resolves immediately while the queue is below its
   * high-water mark, but stays pending once the queue fills — so a producer that awaits it is suspended until the
   * queue drains below the low-water mark.
   * @param {import('./event.js').Event} event
   * @returns {Promise<void>} the backpressure gate for the producer to await.
   */
  enqueue(event) {
    let queue = this.queues.get(event.key);
    if (!queue) {
      queue = new Queue();
      this.queues.set(event.key, queue);
      this._keysSeen += 1;
    }
    queue.enqueue(event);
    this.count += 1;
    this.dispense(event);
    if (queue.size >= this.highWater) {
      return this._suspend(event.key);
    }
    return Promise.resolve();
  }

  /**
   * @private Open (or reuse) a producer-suspending gate for a key. Returns a Promise that resolves when the key's
   * queue later drains below the low-water mark. Idempotent per key: a second call while still full returns the same
   * gate rather than stacking Promises.
   * @param {string} key
   * @returns {Promise<void>}
   */
  _suspend(key) {
    const existing = this._gates.get(key);
    if (existing) return existing.promise;
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    this._gates.set(key, { promise, resolve });
    return promise;
  }

  /**
   * @private Resume a producer suspended on this key once its queue has drained to/below the low-water mark.
   * The gates is what we mimic the Stream pause and resume. The promise will be resolve as long as the queue size is below
   * the low water mark this give the consumer a buffer of highWaterMark - lowWarterMark events
   * @param {string} key
   * @param {Queue} queue
   */
  _resumeIfDrained(key, queue) {
    const gate = this._gates.get(key);
    if (gate && queue.size <= this.lowWater) {
      this._gates.delete(key);
      gate.resolve();
    }
  }

  /**
   * The dispatch gate. Emit `event` on the stream only if it is its queue's head — i.e. nothing ahead of it is still
   * in flight. Deferred with `process.nextTick` so it never re-enters the manager mid-`enqueue`/`remove`.
   * @param {import('./event.js').Event|null} event
   */
  dispense(event) {
    if (!event) return;
    const queue = this.queues.get(event.key);
    if (!queue) return;
    if (queue.peek() === event) {
      process.nextTick(() => this.emit('event', event));
    }
  }

  /**
   * The ack path. Remove the just-acked event head, drop the pending counter, then dispatch the new head.
   * Checks for termination.
   * @param {import('./event.js').Event} event
   */
  remove(event) {
    const queue = this.queues.get(event.key);
    if (queue && !queue.isEmpty()) {
      queue.dequeue();
      this.count -= 1;
      this._resumeIfDrained(event.key, queue);
      if (this.evict && queue.isEmpty()) {
        this.queues.delete(event.key); // eviction: release the drained queue so memory tracks active keys only
      } else {
        this.dispense(queue.peek());
      }
    }
    this._checkDone();
  }

  /**
   * The failure (nack) path — Opt B. A consumer errored on the queue head. The head is NOT advanced past: it is
   * redelivered in place after an exponential backoff (capped at `backoffCap`), up to `maxAttempts` deliveries.
   * On the final failure the exhausted event is moved to its queue's dead-letter list exactly once and the queue
   * advances (evict or dispatch the next head). The backoff is scheduled off the event loop, so every other queue
   * keeps dispatching while this one waits — one bad event never stalls the system.
   * @param {import('./event.js').Event} event
   */
  fail(event) {
    const queue = this.queues.get(event.key);
    if (!queue || queue.peek() !== event) return; // stale/duplicate nack — the head already moved on; ignore just for safety. This never happen
    event.attempts += 1;
    if (event.attempts >= this.maxAttempts) {
      queue.dequeue();                 // exhausted: drop the head...
      this.count -= 1;
      this._deadLetter(event);         // ...into the dead-letter list exactly once...
      this._resumeIfDrained(event.key, queue);
      if (this.evict && queue.isEmpty()) {
        this.queues.delete(event.key); // ...and advance: evict the drained queue...
      } else {
        this.dispense(queue.peek());   // ...or dispatch the next head.
      }
      this._checkDone();
    } else {
      // Redeliver the same, still-at-head event after a backoff. The head cannot change while it waits (only an ack
      // removes it, and it was nacked, not acked), so re-dispatch is safe.
      this.schedule(() => {
        event.reset();          // re-arm the per-delivery guard so the head can be consumed again
        this.dispense(event);   // re-emit the unchanged head; other queues ran freely during the wait
      }, this._backoffFor(event.attempts));
    }
  }

  /** @private exponential backoff (ms) for the Nth delivery attempt (1-based), capped at `backoffCap`. */
  _backoffFor(attempt) {
    return Math.min(this.backoffCap, this.backoffBase * 2 ** (attempt - 1));
  }

  /** @private append an exhausted event to its key's dead-letter list, creating the list on first sighting. */
  _deadLetter(event) {
    let dlq = this.dlqs.get(event.key);
    if (!dlq) {
      dlq = [];
      this.dlqs.set(event.key, dlq);
    }
    dlq.push(event);
  }

  /**
   * Signal that the producer has submitted its last event. Only after this can a zero pending count be treated as
   * real completion.
   */
  markProducerDone() {
    this.producerDone = true;
    this._checkDone();
  }

  /** @private emit `done` once, when everything has drained and the producer is finished. */
  _checkDone() {
    if (!this._done && this.count === 0 && this.producerDone) {
      this._done = true;
      this.emit('done');
    }
  }

  /** @returns {Promise<void>} resolves when all queues have drained. */
  whenDone() {
    if (this._done) return Promise.resolve();
    return new Promise((resolve) => this.once('done', resolve));
  }

  /** @returns {number} number of active (non-evicted) queues — tracks live keys, O(active keys). */
  queueCount() {
    return this.queues.size;
  }

  /** @returns {number} total distinct keys ever routed, including ones whose queues have since been evicted. */
  keysSeenCount() {
    return this._keysSeen;
  }

  /** @returns {number} events enqueued but not yet acked. */
  pending() {
    return this.count;
  }

  /**
   * @param {string} key
   * @returns {import('./event.js').Event[]} the key's dead-letter list — events that exhausted their attempts (empty if none).
   */
  dlq(key) {
    return this.dlqs.get(key) ?? [];
  }

  /** @returns {number} total dead-lettered events across all keys. */
  dlqCount() {
    let total = 0;
    for (const list of this.dlqs.values()) total += list.length;
    return total;
  }
}
