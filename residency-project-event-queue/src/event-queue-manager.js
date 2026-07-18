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
 */
export class EventQueueManager extends EventEmitter {
  /**
   * @param {object} [opts]
   * @param {number}  [opts.highWater=Infinity] - per-queue size at/above which `enqueue` suspends the producer.
   * @param {number}  [opts.lowWater=0]         - per-queue size at/below which a suspended producer resumes.
   * @param {boolean} [opts.evict=true]         - release a queue's `Map` entry when it drains (set false for the naive baseline).
   */
  constructor({ highWater = Infinity, lowWater = 0, evict = true } = {}) {
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

    /** @private key -> { promise, resolve } for a producer suspended on a full queue. */
    this._gates = new Map();

    /** @private count of distinct keys ever seen — survives eviction, unlike queueCount(). */
    this._keysSeen = 0;
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
}
