import test from 'node:test';
import assert from 'node:assert/strict';
import { Event } from './event.js';

test('constructor rejects missing key / eventId / bad payload', () => {
  assert.throws(() => new Event({ eventId: 'a', payload: 0, seq: 0 }), /key/);
  assert.throws(() => new Event({ key: 'k', payload: 0, seq: 0 }), /eventId/);
  assert.throws(() => new Event({ key: 'k', eventId: 'a', payload: -1, seq: 0 }), /payload/);
  assert.throws(() => new Event({ key: 'k', eventId: 'a', payload: 'x', seq: 0 }), /payload/);
});

test('ack before dispatch throws (no consumer set)', () => {
  const e = new Event({ key: 'k', eventId: 'a', payload: 0, seq: 0 });
  assert.throws(() => e.ack(), /before it is dispatched/);
});

test('ack routes to the owning consumer exactly once', () => {
  const e = new Event({ key: 'k', eventId: 'a', payload: 0, seq: 0 });
  const acked = [];
  e.consumer = { ack: (event) => acked.push(event.eventId) };
  e.ack();
  assert.deepEqual(acked, ['a']);
  assert.throws(() => e.ack(), /already acked/); // double ack rejected
});
