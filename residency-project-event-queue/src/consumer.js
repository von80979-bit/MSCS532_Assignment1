import { EventEmitter } from 'node:events';
import { sleep } from './support/sleep.js';
import { consoleColors, logger } from './support/logger.js';

/**
 * The consumer subscribes to a shared `EventQueueManager` (the event stream) and processes each dispatched queue
 * head: adopt the event, log receive -> `sleep(payload)` -> ack. It is itself an `EventEmitter` (mirroring the
 * Subscriber in the SF Pub/Sub reference), emitting `consumed` after each ack so drivers and tests can observe the
 * consume-completion order. Because each `_consume` yields at `await sleep`, many queues' consumers interleave on the
 * single event loop (concurrency, not parallelism).
 */
export class Consumer extends EventEmitter {
  /**
   * @param {import('./event-queue-manager.js').EventQueueManager} manager - the shared manager / event stream.
   * @param {object} [deps]
   * @param {typeof logger} [deps.log]  - injectable logger (tests pass a spy).
   * @param {() => number} [deps.clock] - injectable clock (tests make it deterministic).
   */
  constructor(manager, { log = logger, clock = () => Date.now() } = {}) {
    super();
    this.manager = manager;
    this.log = log;
    this.clock = clock;
  }

  /** Start listening on the manager's event stream. */
  subscribe() {
    this.manager.on('event', (event) => this._consume(event));
  }

  /**
   * The ack sink. Called by `Event.ack()`; forwards to the manager to dequeue the event's queue head and release the
   * next event in that queue.
   * @param {import('./event.js').Event} event
   */
  ack(event) {
    return this.manager.remove(event);
  }

  /**
   * Process one dispatched event: tag receive time, log it, do the simulated work, then acknowledge (which
   * gates the next event in the queue) and emit `consumed`.
   * @private
   * @param {import('./event.js').Event} event
   */
  async _consume(event) {
    event.consumer = this;
    const receiveTime = this.clock()
    let time = new Date(receiveTime).toISOString();
    const colorCodedEvent = {
      'queue-1': consoleColors.fgRed,
      'queue-2': consoleColors.fgGreen,
      'queue-3': consoleColors.fgMagenta
    }
    const consoleColor = colorCodedEvent[event.key] ?? consoleColors.fgYellow
    console.log(consoleColor, `[${time}] Received event '${event.type}' from '${event.key}' and its chronological sequence is ${event.seq}`)

    try {
      await sleep(event.payload);
      const finishTime = this.clock()
      time = new Date(finishTime).toISOString()
       console.log(consoleColor, `[${time}] \t Finished processing event '${event.type}' from '${event.key}' after ${finishTime - receiveTime}ms`)
      event.ack();
      this.emit('consumed', event);
    } catch (err) {
      // A failed consume leaves the event unacked at its queue head — the queue stalls rather than advancing past it.
      // Redispatch-on-timeout is next-steps.
      this.log.error(`consume failed for ${event.eventId}: ${err.message}`);
    }
  }
}
