import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';
import { logger } from './support/logger.js';

/**
 * Demo driver. Creates one shared `EventQueueManager` and hands it to both a `Producer` (submits events) and a
 * `Consumer` (processes them). The producer submits a fixed event list across three keys, then marks itself done;
 * the driver waits for every queue to drain. Watch the terminal: events on the SAME key are consumed strictly in
 * submit (seq) order, while events on DIFFERENT keys interleave — the payload (sleep ms) is deliberately varied so a
 * short queue can finish ahead of a long one.
 */
async function main() {
  const manager = new EventQueueManager();
  const producer = new Producer(manager);
  const consumer = new Consumer(manager);
  consumer.subscribe();

  const scaleMagnitude = 10
  const input = [
    { key: 'queue-1', payload: 250 * scaleMagnitude, type: 'transaction-created', seq:'transaction-1-0'},
    { key: 'queue-1', payload: 300 * scaleMagnitude, type: 'transaction-payment-confirmed', seq: 'transaction-1-1'},
    { key: 'queue-1', payload: 350 * scaleMagnitude, type: 'inventory-dispatched', seq: 'transaction-1-2'},
    { key: 'queue-2', payload: 300 * scaleMagnitude, type: 'transaction-created', seq: 'transaction-2-0' },
    { key: 'queue-3', payload: 500 * scaleMagnitude, type: 'transaction-created', seq: 'transaction-3-0' },
    { key: 'queue-3', payload: 480 * scaleMagnitude, type: 'transaction-payment-confirmed',seq: 'transaction-3-1' },
    { key: 'queue-3', payload: 510 * scaleMagnitude, type: 'inventory-dispatched', seq: 'transaction-3-2'},
    { key: 'queue-2', payload: 340 * scaleMagnitude, type: 'transaction-payment-confirmed', seq: 'transaction-2-1' },
    { key: 'queue-1', payload: 420 * scaleMagnitude, type: 'transaction-shipped', seq: 'transaction-1-3' },
    { key: 'queue-2', payload: 320 * scaleMagnitude, type: 'inventory-dispatched', seq: 'transaction-2-2'},
  ];

  logger.warn('=== submit (enqueue) transaction ===');
  input.forEach((spec, idx) => {
    producer.submit(new Event({ ...spec, eventId: `${spec.key}-${idx}`}));
    logger.info(`  Submitted an event to '${spec.key}' with a chronological sequence of '${spec.seq}' of type: '${spec.type}'`);
  });
  logger.warn('=== consume transaction (interleaved across keys) ===');

  producer.producerDone();

  await manager.whenDone();
  logger.warn(`=== all ${manager.queueCount()} queues drained; pending=${manager.pending()} ===`);
}

main().catch((err) => {
  logger.error(err.stack || String(err));
  process.exit(1);
});
