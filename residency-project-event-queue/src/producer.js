/**
 * The producer submits events into a shared `EventQueueManager`. The producer feeds the stream and, once its input
 * is exhausted, tells the manager no more events are coming (arming race-guarded termination).
 */
export class Producer {
  /**
   * @param {import('./event_queue_manager.js').EventQueueManager} manager - the shared manager / event stream.
   */
  constructor(manager) {
    this.manager = manager;
  }

  /**
   * Submit one event: hand it to the manager to route to its queue and dispatch.
   * @param {import('./event.js').Event} event
   */
  submit(event) {
    this.manager.enqueue(event);
  }

  /** Signal that the last event has been submitted. */
  producerDone() {
    this.manager.markProducerDone();
  }
}
