# Design Specification — A Distributed Event Queue

Status: LOCKED (resolves ticket 01-core-design-spec). Source of truth for all phases.

## 1. Application

**Problem.** Many systems apply a stream of state-changing operations to shared entities
where order matters per entity but not globally (transactions or operations that carry an
ordering key such as an account, order, or customer id). Operations on the same entity must apply in arrival
order, yet processing the whole stream in one global sequence is far too slow and the
downstream API offers no ordering guarantee, so naive concurrency risks out-of-order
application and corrupted state. Partitioning by ordering key gives strict per-entity FIFO while
different entities run concurrently (ordering where it matters plus parallelism),
ack-gating enforces the order the API does not, and events make failures retryable (an
unacked event is redispatched at its queue head without advancing past it). Grounds:
Nowacki (2021) ack-before-removal; Ratra et al. (2025) idempotent consumers / dead-letter
queues / event replay.

A real-time event-processing engine: the in-process analog of a Node.js
EventStream. Events carry an ordering key; events sharing a key are processed in
strict FIFO order, while events with different keys are processed concurrently.
Each event is acknowledged after simulated work, and the acknowledgment gates the
next event in that key's queue (backpressure). The demo logs dispatch/consume order
to the terminal to make the ordering and concurrency visible.

## 2. Runtime & packaging

- **Language:** JavaScript / Node.js (professor-approved deviation from the
  assignment's stated Python).
- **Single process**, single event loop. NOT distributed — no networked nodes,
  no replication. (Distributed multi-node + replication is Phase 3 future work,
  cited to Nowacki 2021 and Ratra 2025.)
- **Docker:** one `Dockerfile` running the demo driver, for a reproducible run.
- **Concurrency, not parallelism.** One event loop interleaves queues. True
  parallelism (`worker_threads`/`cluster`) is a Phase 3 optimization topic only.

## 3. Event schema

`Event { key, eventId, payload, seq, type }`
- `key` — ordering key; selects the queue (which Queue in the Map).
- `eventId` — unique id; names exactly which event an ack completes.
- `payload` — the simulated work duration the consumer sleeps for.
- `seq` — monotonic arrival index; used only to log/verify per-key FIFO order.
- `type` — optional demo annotation (e.g. `transaction-created`) for readable log
  output; carries no dispatch or ordering semantics.
- `ack()` — the only method; routes to the owning consumer (`consumer.ack(this)`),
  which forwards to the manager. The event holds NO reference to its Queue; the
  manager re-looks-up the queue by `key`.

The consumer reference is set when the event is dispatched — the consumer adopts each event in
`_consume`, not at submit time (the producer no longer owns the event). Timestamps are NOT stored
on the event; the consumer tags the receive time at runtime.

## 4. Components & responsibilities

1. **Event** — data + `ack()`. `ack()` calls `consumer.ack(this)`; it never touches
   a Queue. Guards against double-ack.
2. **Queue** (custom, one per key) — a PURE linked-list FIFO (head/tail pointers) for
   O(1) enqueue/dequeue; NOT `Array.shift` (O(n)). Methods: `enqueue`, `dequeue`,
   `peek`, `isEmpty`, `size`, `clear`. It knows nothing about dispatch, the emitter,
   or the counter — it is a plain data structure.
3. **EventQueueManager** (the Map layer + the dispatcher) — owns `Map<string, Queue>` and the
   pending counter, and IS the event stream: it extends Node's `EventEmitter` (mirroring the
   LeaseManager in the SF Pub/Sub reference). Created by the driver and shared with the producer
   and consumer. It is the ONLY component that dispatches, and it emits two events: `event` (a
   dispatched queue head) and `done` (all queues drained).
   - `enqueue(event)` — look up or create the Queue for `event.key`, `enqueue` it,
     increment the counter, then `dispense(event)`.
   - `dispense(event)` — the dispatch gate: look up the queue, and if
     `queue.peek() === event` (this event is the head), `emit('event', event)` on the stream.
     Deferred via `process.nextTick` to avoid re-entering the manager mid-op.
   - `remove(event)` — the ack path: `dequeue()` the head, decrement the counter,
     then `dispense(queue.peek())` (the next head). Checks termination.
4. **Event stream** — the manager's own `EventEmitter` interface; `dispense()` emits, the consumer
   reacts. Makes dispatch + consumption concurrent across keys.
5. **Producer** — a separate component (`producer.js`) handed the shared manager. `submit(event)`
   hands the event to `manager.enqueue`; `producerDone()` calls `manager.markProducerDone()`. It
   does not own or process events — producing and consuming are distinct roles.
6. **Consumer** — extends `EventEmitter` and is handed the shared manager (does NOT own it).
   `subscribe()` listens on `manager.on('event', ...)`. On each dispatched head it ADOPTS the event
   (sets the consumer back-reference in `_consume`, not at submit), tags receive time, logs
   `receive_time, key, eventId, seq`, `await sleep(payload)`, `event.ack()`, then emits `consumed`.
   Exposes `ack(event)` → `manager.remove(event)`.
7. **Driver** — creates one shared `EventQueueManager`, hands it to a `Producer` and a `Consumer`,
   holds the input event list, loops calling `producer.submit(event)`, then `producer.producerDone()`,
   and awaits `manager.whenDone()`.
8. **Shared pending counter** — manager-owned; `+1` on enqueue, `−1` on remove.
9. **Support** — `sleep` (promise delay), `logger` (structured lines), `Dockerfile`.

Note: the un-removed head is the "queue busy" marker — `dispense` only emits when the
event IS the current head, so exactly one event per queue is ever in flight.

## 5. Dispatch / ack / backpressure flow

Per key, exactly one event is in flight (dispatched, not yet acked) at a time:
`enqueue` → `dispense` emits only if the event is the queue head → consumer processes
→ `event.ack()` → `consumer.ack()` → `manager.remove()` dequeues the head and
`dispense`s the next head. Cross-key: many queues' consumers interleave on the event
loop while each queue stays strictly ordered. Backpressure = the next event in a queue
cannot start until the current one acks (its predecessor is still the head, so
`dispense` will not emit it).

## 6. Termination (race-guarded)

Completion = `count === 0 && producerDone`. The manager sets `producerDone = true`
after the enqueue loop; only then does a zero count emit `done`, close the emitter,
and exit. The guard prevents a false "done" when a queue transiently drains to 0
before all events are enqueued (matters if the producer streams events over time;
a synchronous burst loop is safe on its own but the guard covers both).

## 7. Complexity & space (to justify in the report)

- Key lookup/insert/delete in `Map`: O(1) average.
- Queue enqueue/dispatch/dequeue: O(1) each (linked list) — contrast with O(n)
  `Array.shift`.
- Space: O(active keys + buffered events); draining a queue can drop its Map entry
  to keep space at O(active keys) — a Phase 3 optimization.

## 8. Source mapping (exactly four, verified notes in resources/notes/)

- **Hanif et al. (2020)** — backpressure / ack-gated dispatch.
- **Liu et al. (2024)** — key partitioning → per-key queues and ordering.
- **Nowacki et al. (2021)** — distributed event queue w/ Ack Manager; ack-before-remove
  model; target architecture for distributed future work.
- **Ratra et al. (2025)** — high-throughput EDA, partitioning/hot-spots, replication/DLQ;
  scaling context and future work.

Reference caveats: Hanif DOI (10.1109/ICOIN48656.2020.9016513) confirmed via IEEE
Xplore though not printed in the PDF; Nowacki page range and Liu issue number not
printed in their PDFs.
