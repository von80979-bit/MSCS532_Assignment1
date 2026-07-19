import test from 'node:test';
import assert from 'node:assert/strict';
import { Queue } from './queue.js';

const ev = (id) => ({ eventId: id });

test('enqueue then dequeue yields FIFO order', () => {
  const q = new Queue();
  assert.ok(q.isEmpty());
  q.enqueue(ev('a'));
  q.enqueue(ev('b'));
  q.enqueue(ev('c'));
  assert.equal(q.size, 3);
  assert.equal(q.dequeue().eventId, 'a');
  assert.equal(q.dequeue().eventId, 'b');
  assert.equal(q.dequeue().eventId, 'c');
  assert.equal(q.dequeue(), null); // draining an empty queue is a no-op
  assert.ok(q.isEmpty());
});

test('peek returns the head without removing it', () => {
  const q = new Queue();
  q.enqueue(ev('a'));
  q.enqueue(ev('b'));
  assert.equal(q.peek().eventId, 'a');
  assert.equal(q.size, 2);
});

test('peek and dequeue on an empty queue return null', () => {
  const q = new Queue();
  assert.equal(q.peek(), null);
  assert.equal(q.dequeue(), null);
});

test('clear resets the queue', () => {
  const q = new Queue();
  q.enqueue(ev('a'));
  q.enqueue(ev('b'));
  q.clear();
  assert.ok(q.isEmpty());
  assert.equal(q.size, 0);
  assert.equal(q.peek(), null);
});
