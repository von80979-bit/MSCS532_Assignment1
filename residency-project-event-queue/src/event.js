/**
 * A single event in the stream.
 *
 * Schema: `{ key, eventId, payload, seq }`. The event exposes an `ack()`, which
 * routes to the consumer that listen to it. On acknowledge the consumer forwards to the manager, which removes the event from its
 * queue using the `key` and dispatches the next event in that queue.
 */
export class Event {
  /**
   * @param {object}  spec
   * @param {string}  spec.key     - ordering key - reference the queue
   * @param {string}  spec.eventId - unique event id.
   * @param {number}  spec.payload - simulated work duration (ms)
   * @param {number}  spec.seq     - monotonic arrival index - used to verify per-key order.
   * @param {string}  spec.type    - event type - for context purposes
   */
  constructor({ key, eventId, payload, seq , type}) {
    if (key === undefined || key === null || key === '') {
      throw new Error('Event requires a non-empty key');
    }
    if (eventId === undefined || eventId === null || eventId === '') {
      throw new Error('Event requires a non-empty eventId');
    }
    if (typeof payload !== 'number' || Number.isNaN(payload) || payload < 0) {
      throw new Error('Event payload must be a non-negative number (sleep ms)');
    }

    this.key = key;
    this.eventId = eventId;
    this.payload = payload;
    this.seq = seq;
    this.type = type
    /** @type {{ack: (event: Event) => unknown}|null} - Set when consumer consumes event*/
    this.consumer = null;

    /** @private guards against double-ack. */
    this._acked = false;
  }

  /**
   * Acknowledge this event. Routes to the consumer that adopted it, which forwards to the manager to dequeue this
   * event and dispatch the next head.
   * @returns {unknown}
   */
  ack() {
    if (!this.consumer) {
      throw new Error(`Event ${this.eventId} cannot be acked before it is dispatched`);
    }
    if (this._acked) {
      throw new Error(`Event ${this.eventId} was already acked`);
    }
    this._acked = true;
    return this.consumer.ack(this);
  }
}
