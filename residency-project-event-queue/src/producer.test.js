import test from 'node:test';
import assert from 'node:assert/strict';
import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Event } from './event.js';

const ev = (key, id, seq) => new Event({ key, eventId: id, payload: 0, seq });

test('submit routes the event into the shared manager', () => {
  const manager = new EventQueueManager();
  const producer = new Producer(manager);
  producer.submit(ev('k', 'a', 0));
  assert.equal(manager.queueCount(), 1);
  assert.equal(manager.pending(), 1);
});

test('producerDone arms termination so a drained manager fires done', () => {
  const manager = new EventQueueManager();
  const producer = new Producer(manager);
  let done = false;
  manager.once('done', () => { done = true; });

  const a = ev('k', 'a', 0);
  producer.submit(a);
  manager.remove(a); // drain the only event; count hits 0 but producer is not finished
  assert.equal(done, false);

  producer.producerDone();
  assert.equal(done, true);
});

test('an empty producer completes immediately on producerDone', async () => {
  const manager = new EventQueueManager();
  const producer = new Producer(manager);
  const p = manager.whenDone();
  producer.producerDone();
  await p;
  assert.equal(manager.pending(), 0);
});
