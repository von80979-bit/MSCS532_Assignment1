import test from 'node:test';
import assert from 'node:assert/strict';
import { EventQueueManager } from './event-queue-manager.js';
import { Event } from './event.js';

const ev = (key, id, seq) => new Event({ key, eventId: id, payload: 0, seq });
// dispense defers its emit with process.nextTick; flush lets those emissions fire.
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('backpressure: the next queue event dispatches only after remove', async () => {
  const manager = new EventQueueManager();
  const dispatched = [];
  manager.on('event', (e) => dispatched.push(e.eventId));

  const a = ev('k', 'a', 0);
  const b = ev('k', 'b', 1);
  manager.enqueue(a);
  manager.enqueue(b);
  await flush();
  assert.deepEqual(dispatched, ['a']); // b is held behind a
  assert.equal(manager.pending(), 2);

  manager.remove(a);
  await flush();
  assert.deepEqual(dispatched, ['a', 'b']); // remove(a) released b
  manager.remove(b);
  assert.equal(manager.pending(), 0);
});

test('different keys each dispatch immediately on independent queues', async () => {
  const manager = new EventQueueManager();
  const dispatched = [];
  manager.on('event', (e) => dispatched.push(e.eventId));

  manager.enqueue(ev('k1', 'a', 0));
  manager.enqueue(ev('k2', 'b', 1));
  await flush();
  assert.deepEqual([...dispatched].sort(), ['a', 'b']);
  assert.equal(manager.queueCount(), 2);
});

test('termination guard: draining to 0 before producerDone does not fire done', () => {
  const manager = new EventQueueManager();
  let done = false;
  manager.once('done', () => { done = true; });

  const a = ev('k', 'a', 0);
  manager.enqueue(a);
  manager.remove(a); // count hits 0 but the producer is not finished
  assert.equal(done, false);

  manager.markProducerDone();
  assert.equal(done, true);
});

test('empty input completes immediately once the producer is done', async () => {
  const manager = new EventQueueManager();
  const p = manager.whenDone();
  manager.markProducerDone();
  await p;
  assert.equal(manager.pending(), 0);
});

test('done fires exactly once', () => {
  const manager = new EventQueueManager();
  let count = 0;
  manager.on('done', () => { count += 1; });

  const a = ev('k', 'a', 0);
  manager.enqueue(a);
  manager.markProducerDone(); // not done yet: a still pending
  manager.remove(a); // drains -> done
  manager.markProducerDone(); // idempotent
  assert.equal(count, 1);
});
