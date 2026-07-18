/**
 * A single event in the stream.
 *
 * Schema: `{ key, eventId, payload, seq }`. The event exposes an `ack()` and a `nack()`, both of which route to the
 * consumer that adopted it. On acknowledge the consumer forwards to the manager, which removes the event from its
 * queue and dispatches the next event. On negative-acknowledge (Opt B — recoverability) the consumer forwards to the
 * manager, which redelivers this same event at its queue head after a backoff, or dead-letters it once its
 * `attempts` are exhausted. `ack()`/`nack()` are terminal for the *current* delivery only; a redelivery re-adopts
 * the event, so `reset()` clears the per-delivery guard while `attempts` accrues across deliveries.
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
    /** @type {{ack: (event: Event) => unknown, nack: (event: Event) => unknown}|null} - Set when a consumer adopts the event. */
    this.consumer = null;

    /** number of delivery attempts that have failed so far — drives backoff and dead-lettering (Opt B). */
    this.attempts = 0;

    /** @private guards a single delivery: ack or nack resolves it exactly once, until `reset()` re-arms it. */
    this._settled = false;
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
    if (this._settled) {
      throw new Error(`Event ${this.eventId} was already acked`);
    }
    this._settled = true;
    return this.consumer.ack(this);
  }

  /**
   * Negative-acknowledge this delivery: the consumer failed to process the event. Routes to the owning consumer,
   * which forwards to the manager to redeliver this same event at its queue head (after a backoff) or dead-letter it
   * once its attempts are exhausted. Terminal for the current delivery only — a redelivery re-adopts the event.
   * @returns {unknown}
   */
  nack() {
    if (!this.consumer) {
      throw new Error(`Event ${this.eventId} cannot be nacked before it is dispatched`);
    }
    if (this._settled) {
      throw new Error(`Event ${this.eventId} delivery was already settled`);
    }
    this._settled = true;
    return this.consumer.nack(this);
  }

  /**
   * @private Re-arm this event for another delivery. Clears the per-delivery settle guard so the manager can
   * re-dispatch the same event at its queue head. `attempts` is intentionally preserved — it accrues across
   * redeliveries and is what the manager compares against its max.
   */
  reset() {
    this._settled = false;
  }
}
