import test from 'node:test';
import assert from 'node:assert/strict';
import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';

// Opt A — memory management: empty-queue eviction + the flow-control (backpressure) gate.
// These assertions cover the three points the Phase 3 outline calls out for this optimization:
// eviction on drain, submit() pause/resume gating, and conservation (no dropped events).

const ev = (key, id, seq) => new Event({ key, eventId: id, payload: 0, seq });
const silent = { line() {}, info() {}, error() {}, success() {}, warn() {} };

// dispense defers its emit with process.nextTick; a macrotask turn lets those emissions
// and any pending microtasks (gate resolutions) settle before we assert.
const flush = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Observe whether a promise has resolved without blocking on it. Returns a getter; call it
 * after `await flush()` so the promise's `.then` microtask (if any) has already run.
 */
function probe(promise) {
  let state = 'pending';
  promise.then(() => { state = 'resolved'; });
  return () => state;
}

// --- eviction ----------------------------------------------------------------

test('eviction: draining a key removes its Map entry so queueCount tracks active keys', () => {
  const manager = new EventQueueManager();
  const a = ev('k', 'a', 0);
  manager.enqueue(a);
  assert.equal(manager.queueCount(), 1);

  manager.remove(a); // queue drains to empty -> evicted
  assert.equal(manager.queueCount(), 0);
});

test('eviction fires only when the queue is fully drained, not on every remove', () => {
  const manager = new EventQueueManager();
  const a = ev('k', 'a', 0);
  const b = ev('k', 'b', 1);
  manager.enqueue(a);
  manager.enqueue(b);
  assert.equal(manager.queueCount(), 1);

  manager.remove(a); // b still queued -> entry stays
  assert.equal(manager.queueCount(), 1);
  manager.remove(b); // now empty -> evicted
  assert.equal(manager.queueCount(), 0);
});

test('a re-seen key after eviction gets a fresh queue', async () => {
  const manager = new EventQueueManager();
  const a = ev('k', 'a', 0);
  manager.enqueue(a);
  manager.remove(a);
  assert.equal(manager.queueCount(), 0);

  manager.enqueue(ev('k', 'a2', 1));
  assert.equal(manager.queueCount(), 1);
});

// --- flow-control gate -------------------------------------------------------

test('submit resolves immediately below the high-water mark', async () => {
  const manager = new EventQueueManager({ highWater: 3, lowWater: 1 });
  const state = probe(manager.enqueue(ev('k', 'a', 0))); // size 1 < 3
  await flush();
  assert.equal(state(), 'resolved');
});

test('submit stays pending at the high-water mark and resumes below the low-water mark', async () => {
  const manager = new EventQueueManager({ highWater: 2, lowWater: 1 });
  const a = ev('k', 'a', 0);
  const b = ev('k', 'b', 1);
  manager.enqueue(a);             // size 1 — below the mark
  const gate = manager.enqueue(b); // size 2 — at the high-water mark -> suspend
  const state = probe(gate);
  await flush();
  assert.equal(state(), 'pending');

  manager.remove(a);   // size drops to 1 (<= lowWater) -> resume
  await flush();
  assert.equal(state(), 'resolved');
});

test('the gate is per-key: a hot key suspending does not block a cold key', async () => {
  const manager = new EventQueueManager({ highWater: 2, lowWater: 1 });
  manager.enqueue(ev('hot', 'h0', 0));
  const hotGate = probe(manager.enqueue(ev('hot', 'h1', 1))); // suspends on 'hot'
  const coldGate = probe(manager.enqueue(ev('cold', 'c0', 2))); // 'cold' size 1 -> free
  await flush();
  assert.equal(hotGate(), 'pending');
  assert.equal(coldGate(), 'resolved');
});

// --- conservation (no dropped events) ----------------------------------------

test('conservation: a hot key under backpressure processes every event exactly once', async () => {
  const manager = new EventQueueManager({ highWater: 4, lowWater: 2 });
  const producer = new Producer(manager);
  const consumer = new Consumer(manager, { log: silent });
  const processed = [];
  consumer.on('consumed', (e) => processed.push(e.eventId));
  consumer.subscribe();

  const N = 50;
  for (let i = 0; i < N; i++) {
    await producer.submit(new Event({ key: 'hot', eventId: `e${i}`, payload: 0, seq: i }));
  }
  producer.producerDone();
  await manager.whenDone();

  assert.equal(processed.length, N);                 // nothing dropped
  assert.deepEqual(processed, processed.slice().sort( // strict FIFO preserved under the gate
    (x, y) => Number(x.slice(1)) - Number(y.slice(1))
  ));
  assert.equal(manager.pending(), 0);
  assert.equal(manager.queueCount(), 0);             // evicted after drain
});

test('conservation holds across many keys with eviction + backpressure', async () => {
  const manager = new EventQueueManager({ highWater: 3, lowWater: 1 });
  const producer = new Producer(manager);
  const consumer = new Consumer(manager, { log: silent });
  let processed = 0;
  consumer.on('consumed', () => { processed += 1; });
  consumer.subscribe();

  const keys = 20;
  const perKey = 10;
  let submitted = 0;
  for (let i = 0; i < keys * perKey; i++) {
    const key = `k${i % keys}`;
    await producer.submit(new Event({ key, eventId: `${key}#${i}`, payload: 0, seq: i }));
    submitted += 1;
  }
  producer.producerDone();
  await manager.whenDone();

  assert.equal(processed, submitted);
  assert.equal(manager.pending(), 0);
  assert.equal(manager.queueCount(), 0);
});
