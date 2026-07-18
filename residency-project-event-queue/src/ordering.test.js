import test from 'node:test';
import assert from 'node:assert/strict';
import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';

const silent = { line() {}, info() {}, error() {} };

/** Submit events through a real producer/consumer pair and record the consume-completion order. */
function runConsumed(input) {
  const manager = new EventQueueManager();
  const producer = new Producer(manager);
  const consumer = new Consumer(manager, { log: silent });
  const consumed = [];
  consumer.on('consumed', (event) => consumed.push(event.eventId)); // record at consume-completion time
  consumer.subscribe();
  input.forEach((spec, seq) => {
    producer.submit(new Event({ ...spec, eventId: `${spec.key}#${seq}`, seq }));
  });
  producer.producerDone();
  return manager.whenDone().then(() => consumed);
}

test('same key is consumed in strict FIFO order regardless of payload', async () => {
  // Decreasing payloads: were the queue not serialized, later (shorter) events would
  // finish first. FIFO must hold anyway.
  const consumed = await runConsumed([
    { key: 'k', payload: 60 },
    { key: 'k', payload: 30 },
    { key: 'k', payload: 5 },
  ]);
  assert.deepEqual(consumed, ['k#0', 'k#1', 'k#2']);
});

test('different keys run concurrently: a short queue finishes before a long one', async () => {
  const consumed = await runConsumed([
    { key: 'slow', payload: 80 }, // dispatched first, but slow
    { key: 'fast', payload: 10 }, // dispatched second, but finishes first
  ]);
  assert.deepEqual(consumed, ['fast#1', 'slow#0']);
});

test('mixed workload drains every queue and preserves per-key order', async () => {
  const consumed = await runConsumed([
    { key: 'a', payload: 40 },
    { key: 'b', payload: 15 },
    { key: 'a', payload: 5 },
    { key: 'b', payload: 15 },
  ]);
  assert.deepEqual(consumed.filter((id) => id.startsWith('a')), ['a#0', 'a#2']);
  assert.deepEqual(consumed.filter((id) => id.startsWith('b')), ['b#1', 'b#3']);
  assert.equal(consumed.length, 4);
});
