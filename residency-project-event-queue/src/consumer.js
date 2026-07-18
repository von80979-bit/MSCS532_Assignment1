import { EventEmitter } from 'node:events';
import { sleep } from './support/sleep.js';
import { consoleColors, logger } from './support/logger.js';

/**
 * The consumer subscribes to a shared `EventQueueManager` (the event stream) and processes each dispatched queue
 * head: adopt the event, log receive -> `sleep(payload)` -> ack. It is itself an `EventEmitter`
 * emitting `consumed` signal after each ack so drivers and tests can observe the
 * consume-completion order. Because each `_consume` yields at `await sleep`, many queues' consumers interleave on the
 * single event loop (concurrency, not parallelism).
 *
 * Opt B (recoverability): a delivery can fail. The injectable `fail(event)` predicate models flaky processing (the
 * recovery demo trips it ~20% per attempt); a failed delivery is nacked back to the manager, which redelivers the
 * head after a backoff or dead-letters it once attempts are exhausted. The consumer emits `failed` per failed
 * delivery, mirroring `consumed` for successful ones.
 */
export class Consumer extends EventEmitter {
  /**
   * @param {import('./event-queue-manager.js').EventQueueManager} manager - the shared manager / event stream.
   * @param {object} [deps]
   * @param {typeof logger} [deps.log]  - injectable logger (tests pass a spy).
   * @param {() => number} [deps.clock] - injectable clock (tests make it deterministic).
   * @param {(event: import('./event.js').Event) => boolean} [deps.fail] - returns true to fail this delivery (default never; demo trips it randomly).
   */
  constructor(manager, { log = logger, clock = () => Date.now(), fail = () => false } = {}) {
    super();
    this.manager = manager;
    this.log = log;
    this.clock = clock;
    this.fail = fail;
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
   * The nack sink. Called by `Event.nack()` when a delivery fails; forwards to the manager to redeliver the head
   * (after backoff) or dead-letter it once its attempts are exhausted.
   * @param {import('./event.js').Event} event
   */
  nack(event) {
    return this.manager.fail(event);
  }

  /**
   * Process one dispatched event: tag receive time, log it, do the simulated work, then either acknowledge (which
   * gates the next event in the queue) and emit `consumed`, or — if the work fails — nack (handing the event back
   * to the manager for redelivery/dead-lettering) and emit `failed`.
   * @private
   * @param {import('./event.js').Event} event
   */
  async _consume(event) {
    event.consumer = this;
    const attempt = event.attempts + 1; // 1-based delivery number for this pass
    const receiveTime = this.clock()
    let time = new Date(receiveTime).toISOString();
    const colorCodedEvent = {
      'queue-1': consoleColors.fgRed,
      'queue-2': consoleColors.fgGreen,
      'queue-3': consoleColors.fgMagenta
    }
    const consoleColor = colorCodedEvent[event.key] ?? consoleColors.fgYellow
    console.log(consoleColor, `[${time}] Received event '${event.type}' from '${event.key}' (attempt ${attempt}) and its chronological sequence is ${event.seq}`)

    let failed = false;
    try {
      await sleep(event.payload);
      failed = this.fail(event); // simulated flaky processing (demo: ~20% per attempt)
    } catch (err) {
      // An unexpected throw in the work path is treated as a failed delivery, not a lost event.
      this.log.error(`consume threw for ${event.eventId}: ${err.message}`);
      failed = true;
    }

    const finishTime = this.clock()
    time = new Date(finishTime).toISOString()
    if (failed) {
      console.log(consoleColor, `[${time}] \t Failed processing event '${event.type}' from '${event.key}' on attempt ${attempt}`)
      event.nack(); // manager redelivers the head (after backoff) or dead-letters it once attempts are exhausted
      this.emit('failed', event);
      return;
    }

    console.log(consoleColor, `[${time}] \t Finished processing event '${event.type}' from '${event.key}' after ${finishTime - receiveTime}ms`)
    event.ack();
    this.emit('consumed', event);
  }
}
