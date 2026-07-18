import { EventEmitter } from 'node:events';
import { Queue } from './queue.js';

/**
 * The Map layer AND the dispatcher, and itself the event stream. Owns `Map<key, Queue>` and the shared pending counter.
 * It is the component that routes each event to its queue, decides when a queue head may be emitted, tracks how
 * many events are outstanding, and signals completion once every queue has drained AND the producer is finished.
 * It emits `event` (a dispatched queue head) and `done` (all queues drained); consumers listen on it directly.
 */
export class EventQueueManager extends EventEmitter {
  constructor() {
    super();

    /** @type {Map<string, Queue>} one queue per ordering key. */
    this.queues = new Map();

    /** @private total events enqueued but not yet processed. */
    this.count = 0;

    /** @private set true after the producer's submit loop completes. */
    this.producerDone = false;

    /** @private ensures `done` fires exactly once. */
    this._done = false;
  }

  /**
   * Route an event to its queue (creating the queue on first sighting), enqueue it, bump the pending counter, then try
   * to dispatch it.
   * @param {import('./event.js').Event} event
   */
  enqueue(event) {
    let queue = this.queues.get(event.key);
    if (!queue) {
      queue = new Queue();
      this.queues.set(event.key, queue);
    }
    queue.enqueue(event);
    this.count += 1;
    this.dispense(event);
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
      this.dispense(queue.peek());
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

  /** @returns {number} number of active queues (keys seen). */
  queueCount() {
    return this.queues.size;
  }

  /** @returns {number} events enqueued but not yet acked. */
  pending() {
    return this.count;
  }
}
