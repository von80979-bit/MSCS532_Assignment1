import test from 'node:test';
import assert from 'node:assert/strict';
import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';

// Opt B — recoverability: redelivery at the queue head, exponential backoff, and a per-key dead-letter list.
// These assertions cover the four points the Phase 3 outline calls out: retry-exactness (a recoverable event is
// redelivered in place and removed exactly once), the backoff schedule, dlq-once (an exhausted event is
// dead-lettered exactly once), and no cross-queue stall (a failing queue never blocks another).

const silent = { line() {}, info() {}, error() {}, success() {}, warn() {} };
// dispense defers its emit with process.nextTick; setImmediate turns let those emissions, the sleep(0) macrotasks,
// and any gate microtasks settle before we assert.
const settle = async (turns = 12) => { for (let i = 0; i < turns; i++) await new Promise((r) => setImmediate(r)); };

/** A scheduler that runs each backoff immediately, recording the requested delay so tests can assert the schedule. */
function immediateScheduler() {
  const delays = [];
  const schedule = (fn, ms) => { delays.push(ms); fn(); };
  return { schedule, delays };
}

/** A scheduler that captures backoffs without running them, so a test can hold a queue mid-retry then release it. */
function manualScheduler() {
  let pending = [];
  const schedule = (fn) => { pending.push(fn); };
  // Fire the currently-parked retries once. A retry re-dispatches its head via process.nextTick, so the resulting
  // failure (and its next parked retry) only lands after an event-loop turn — callers loop with `settle()`.
  const fire = () => { const batch = pending; pending = []; batch.forEach((fn) => fn()); };
  return { schedule, fire, hasPending: () => pending.length > 0 };
}

// --- retry-exactness ---------------------------------------------------------

test('a recoverable event is redelivered at its head and removed exactly once', async () => {
  const { schedule } = immediateScheduler();
  const manager = new EventQueueManager({ schedule, backoffBase: 1 });
  // Fail the first two deliveries, succeed on the third.
  let calls = 0;
  const consumer = new Consumer(manager, { log: silent, fail: () => calls++ < 2 });
  const consumed = [];
  const failed = [];
  consumer.on('consumed', (e) => consumed.push(e.eventId));
  consumer.on('failed', (e) => failed.push(e.attempts));
  consumer.subscribe();

  const producer = new Producer(manager);
  await producer.submit(new Event({ key: 'k', eventId: 'a', payload: 0, seq: 0 }));
  producer.producerDone();
  await manager.whenDone();

  assert.deepEqual(consumed, ['a']);   // delivered three times, but succeeds — and is consumed — exactly once
  assert.deepEqual(failed, [1, 2]);    // two failed deliveries, attempts recorded 1 then 2
  assert.equal(manager.dlqCount(), 0); // recovered before exhaustion — nothing dead-lettered
  assert.equal(manager.pending(), 0);
  assert.equal(manager.queueCount(), 0); // drained + evicted
});

test('a redelivered head keeps strict FIFO: the next event waits behind it until it succeeds', async () => {
  const { schedule } = immediateScheduler();
  const manager = new EventQueueManager({ schedule, backoffBase: 1 });
  let calls = 0;
  const consumer = new Consumer(manager, { log: silent, fail: () => calls++ < 2 }); // 'a' fails twice first
  const consumed = [];
  consumer.on('consumed', (e) => consumed.push(e.eventId));
  consumer.subscribe();

  const producer = new Producer(manager);
  await producer.submit(new Event({ key: 'k', eventId: 'a', payload: 0, seq: 0 }));
  await producer.submit(new Event({ key: 'k', eventId: 'b', payload: 0, seq: 1 }));
  producer.producerDone();
  await manager.whenDone();

  assert.deepEqual(consumed, ['a', 'b']); // 'b' never jumps ahead of the retrying head 'a'
});

// --- backoff schedule --------------------------------------------------------

test('backoff doubles each retry', async () => {
  const { schedule, delays } = immediateScheduler();
  const manager = new EventQueueManager({ schedule, maxAttempts: 5, backoffBase: 100, backoffCap: 30000 });
  const consumer = new Consumer(manager, { log: silent, fail: () => true }); // always fails -> exhausts
  consumer.subscribe();

  const producer = new Producer(manager);
  await producer.submit(new Event({ key: 'k', eventId: 'a', payload: 0, seq: 0 }));
  producer.producerDone();
  await manager.whenDone();

  // Failures 1..4 schedule retries; the 5th failure dead-letters (no retry) -> four backoffs.
  assert.deepEqual(delays, [100, 200, 400, 800]);
});

test('backoff is capped at backoffCap', async () => {
  const { schedule, delays } = immediateScheduler();
  const manager = new EventQueueManager({ schedule, maxAttempts: 5, backoffBase: 20000, backoffCap: 30000 });
  const consumer = new Consumer(manager, { log: silent, fail: () => true });
  consumer.subscribe();

  const producer = new Producer(manager);
  await producer.submit(new Event({ key: 'k', eventId: 'a', payload: 0, seq: 0 }));
  producer.producerDone();
  await manager.whenDone();

  // 20000, then 40000/80000/160000 all clamped to the 30s ceiling.
  assert.deepEqual(delays, [20000, 30000, 30000, 30000]);
});

// --- dlq-once ----------------------------------------------------------------

test('an exhausted event is dead-lettered exactly once and the queue advances', async () => {
  const { schedule } = immediateScheduler();
  const manager = new EventQueueManager({ schedule, maxAttempts: 3, backoffBase: 1 });
  const consumer = new Consumer(manager, { log: silent, fail: (e) => e.eventId === 'a' }); // only 'a' fails
  let failed = 0;
  consumer.on('failed', () => { failed += 1; });
  const consumed = [];
  consumer.on('consumed', (e) => consumed.push(e.eventId));
  consumer.subscribe();

  const producer = new Producer(manager);
  const doomed = new Event({ key: 'k', eventId: 'a', payload: 0, seq: 0 });
  await producer.submit(doomed);
  await producer.submit(new Event({ key: 'k', eventId: 'b', payload: 0, seq: 1 })); // must still get processed
  producer.producerDone();
  await manager.whenDone();

  assert.deepEqual(consumed, ['b']);               // 'b' processed after 'a' was dead-lettered
  assert.equal(failed, 3);                         // exactly maxAttempts failed deliveries for 'a'
  assert.deepEqual(manager.dlq('k').map((e) => e.eventId), ['a']); // dead-lettered exactly once
  assert.equal(manager.dlqCount(), 1);
  assert.equal(doomed.attempts, 3);
  assert.equal(manager.pending(), 0);              // queue advanced past 'a'

  // A stray late nack for an already-dead-lettered event is ignored (not double-added).
  manager.fail(doomed);
  assert.equal(manager.dlqCount(), 1);
});

// --- no cross-queue stall ----------------------------------------------------

test('a failing/backing-off queue does not stall another queue', async () => {
  const sched = manualScheduler();
  const manager = new EventQueueManager({ schedule: sched.schedule, maxAttempts: 5, backoffBase: 1 });
  // Key 'A' always fails; key 'B' always succeeds.
  const consumer = new Consumer(manager, { log: silent, fail: (e) => e.key === 'A' });
  const consumed = [];
  consumer.on('consumed', (e) => consumed.push(e.eventId));
  consumer.subscribe();
  // Resolves exactly when B's last event is consumed — deterministic proof B drained, no turn-count guessing.
  const bDrained = new Promise((res) => consumer.on('consumed', (e) => { if (e.eventId === 'b1') res(); }));

  const producer = new Producer(manager);
  await producer.submit(new Event({ key: 'A', eventId: 'a', payload: 0, seq: 0 }));
  await producer.submit(new Event({ key: 'B', eventId: 'b0', payload: 0, seq: 1 }));
  await producer.submit(new Event({ key: 'B', eventId: 'b1', payload: 0, seq: 2 }));
  producer.producerDone();

  await bDrained; // 'A' failed once and parked a retry (held by the manual scheduler); 'B' ran to completion meanwhile

  assert.deepEqual(consumed, ['b0', 'b1']); // B fully drained WHILE A is stuck backing off — no cross-queue stall
  assert.equal(manager.dlqCount(), 0);      // A hasn't exhausted yet; its retries are still parked
  assert.ok(sched.hasPending());

  // Release A's parked retries, turn by turn, until it exhausts and dead-letters.
  while (manager.pending() > 0) {
    sched.fire();
    await settle();
  }
  await manager.whenDone();
  assert.deepEqual(manager.dlq('A').map((e) => e.eventId), ['a']);
});

// --- conservation with failures ----------------------------------------------

test('conservation: every event is either consumed or dead-lettered, exactly once', async () => {
  const { schedule } = immediateScheduler();
  const manager = new EventQueueManager({ schedule, maxAttempts: 3, backoffBase: 1 });
  // Deterministic mix: events whose id ends in an odd digit fail forever; others always succeed.
  const consumer = new Consumer(manager, { log: silent, fail: (e) => Number(e.eventId.slice(1)) % 2 === 1 });
  const consumed = [];
  consumer.on('consumed', (e) => consumed.push(e.eventId));
  consumer.subscribe();

  const producer = new Producer(manager);
  const N = 30;
  for (let i = 0; i < N; i++) {
    await producer.submit(new Event({ key: `k${i % 4}`, eventId: `e${i}`, payload: 0, seq: i }));
  }
  producer.producerDone();
  await manager.whenDone();

  assert.equal(consumed.length + manager.dlqCount(), N); // conservation: nothing lost, nothing duplicated
  assert.equal(manager.pending(), 0);
  const survivors = consumed.slice().sort();
  assert.equal(new Set(survivors).size, survivors.length); // each consumed event appears once
});
