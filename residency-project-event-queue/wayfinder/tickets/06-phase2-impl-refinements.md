# Phase 2 PoC implementation refinements — producer split, EventEmitter, formatting

Labels: wayfinder:task
Type: AFK
Status: done
Blocked by: (none)
Assignee: (unclaimed)

## Task

Refine the Phase 2 proof-of-concept implementation (JS/Node, under `src/`) to sharpen component
responsibilities before the Phase 2 report documents them. Concrete code changes to make:

1. Extract producer concerns out of the Consumer into a dedicated `Producer` class
   (`src/producer.js`). Producing (submitting events) and consuming (processing them) are distinct
   roles; bundling `submit`/`producerDone` in the Consumer is misleading. The driver
   (`src/main.js`) creates one shared `EventQueueManager` and hands it to both a `Producer` and a
   `Consumer`.
2. `EventQueueManager` and `Consumer` both extend Node's `EventEmitter` (mirrors the SF Pub/Sub
   reference in `example/`, where LeaseManager and Subscriber are emitters). Manager emits
   `event` (a dispatched head) and `done` (all queues drained); Consumer emits `consumed` after each
   ack. Consumers listen on the manager directly (`manager.on('event', ...)`), replacing the
   internal `this.emitter` field.
3. Because the Producer no longer owns the event, the Consumer adopts each event on dispatch (sets
   its consumer back-reference in `_consume`) instead of at submit time — so `event.ack()` still
   routes consumer -> `manager.remove`.
4. Reflow all code comments and the README to 120-column width (no early ~80-column wraps).
5. Update design-spec §3 (consumer reference set on dispatch, not submit) and §4 (add the Producer
   component; note that the manager and consumer extend EventEmitter; the manager is created by the
   driver and shared). Update tests to listen on `manager` directly and to record via the consumer's
   `consumed` event; add a `producer.test.js`.

## Context — Phase 2 implementation decisions so far

Implementation is execution work (out of scope of the map's report-outline destination) but tracked
here for traceability. Decisions locked while building the PoC:

- Language/runtime: JS/Node + single Docker container (professor-approved deviation from Python).
- Responsibility split, aligned to the SF Pub/Sub example in `example/`:
  - Queue = PURE linked-list FIFO (`enqueue/dequeue/peek/isEmpty/size/clear`), O(1); no dispatch,
    no emitter, no counter.
  - EventQueueManager = `Map<key,Queue>` + the ONLY dispatcher: `enqueue` routes then `dispense`;
    `dispense` emits only if the event is the queue head (peek-identity gate), deferred via
    `process.nextTick`; `remove` (ack path) dequeues then dispenses the next head; race-guarded
    termination (`count===0 && producerDone`), `done` fires once.
  - Event = `{key,eventId,payload,seq}` + `ack()`; holds NO Queue reference. The consumer adopts
    the event on dispatch and `ack()` routes consumer -> `manager.remove` (queue looked up by key).
  - Consumer processes: log receive -> `sleep(payload)` -> `ack` (the per-queue backpressure gate).
- Out of scope / future work (documented as report next-steps): ack-deadline auto-ack timer,
  nack / delivery-attempts, flow-control full/free pause-resume, empty-queue / TTL eviction.
- Code conventions: all JS under `src/`, snake_case filenames, tests `src/*.test.js` run via
  `node --test`.

Deliverable: the adjusted code with passing tests and a working demo.

## Follow-up — terminology alignment + test fix (2026-07-18)

Two tests failed with `TypeError: manager.laneCount is not a function` — `manager.test.js` (different
keys each dispatch immediately) and `producer.test.js` (submit routes the event into the shared
manager). Root cause: the manager exposes `queueCount()`, but the tests referenced `laneCount()`, a
leftover from before the `lane` -> `queue` term standardization. Fixes applied:

- Standardized the `lane` -> `queue` terminology across all Phase 2 code and comments (`src/`), the
  design-spec, README, and OVERVIEW. `queue` is the canonical name for the per-key structure; `lane`
  is retired. Canonical terms kept as-is: Distributed Event Queue, Queue, Event, EventQueueManager,
  Producer, Consumer, ordering key, ack, backpressure, dispatch/dispense, event stream.
- Updated the two stale test references `laneCount()` -> `queueCount()`. All 18 tests now pass
  (`node --test 'src/*.test.js'`).
- Fixed a `main.js` demo bug: three input entries had a duplicate `type:` key that clobbered `seq`,
  so those events logged an undefined chronological sequence. The second key on each is now `seq:`.
