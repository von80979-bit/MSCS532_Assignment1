# Design Specification — Real-Time Keyed Event Queue

Status: LOCKED (resolves ticket 01-core-design-spec). Source of truth for all phases.

## 1. Application

**Problem.** Many systems apply a stream of state-changing operations to shared entities
where order matters per entity but not globally (transactions or operations keyed by an
account, order, or customer id). Operations on the same entity must apply in arrival
order, yet processing the whole stream in one global sequence is far too slow and the
downstream API offers no ordering guarantee, so naive concurrency risks out-of-order
application and corrupted state. The keyed event queue gives strict per-entity FIFO while
different entities run concurrently (ordering where it matters plus parallelism),
ack-gating enforces the order the API does not, and events make failures retryable (an
unacked event is redispatched at its lane head without advancing past it). Grounds:
Nowacki (2021) ack-before-removal; Ratra et al. (2025) idempotent consumers / dead-letter
queues / event replay.

A real-time, keyed event-processing engine: the in-process analog of a Node.js
EventStream. Events carry an ordering key; events sharing a key are processed in
strict FIFO order, while events with different keys are processed concurrently.
Each event is acknowledged after simulated work, and the acknowledgment gates the
next event in that key's lane (backpressure). The demo logs dispatch/consume order
to the terminal to make the ordering and concurrency visible.

## 2. Runtime & packaging

- **Language:** JavaScript / Node.js (professor-approved deviation from the
  assignment's stated Python; document that approval in the README/report).
- **Single process**, single event loop. NOT distributed — no networked nodes,
  no replication. (Distributed multi-node + replication is Phase 3 future work,
  cited to Nowacki 2021 and Ratra 2025.)
- **Docker:** one `Dockerfile` running the demo driver, for a reproducible run.
- **Concurrency, not parallelism.** One event loop interleaves lanes. True
  parallelism (`worker_threads`/`cluster`) is a Phase 3 optimization topic only.

## 3. Event schema

`Event { key, eventId, payload, seq, queue }`
- `key` — ordering key; selects the lane (which Queue in the Map).
- `eventId` — unique id; names exactly which event an ack completes.
- `payload` — the simulated work duration the consumer sleeps for.
- `seq` — monotonic arrival index; used only to log/verify per-key FIFO order.
- `queue` — back-reference set on enqueue, so `ack()` can call its own queue.
- `ack()` — the only method; calls `this.queue.dequeue()`.

Timestamps are NOT stored on the event; the consumer tags the receive time at runtime.

## 4. Components & responsibilities

1. **Event** — data + `ack()` (calls `this.queue.dequeue()`).
2. **Queue** (custom, one per key) — a linked-list FIFO (head/tail pointers) for
   O(1) enqueue/dequeue; NOT `Array.shift` (O(n)).
   - `enqueue(event)` — append to tail; set `event.queue = this`; increment the
     shared counter; if this event is now the head (queue was empty), `dispatch()`.
   - `dispatch()` — peek the head *by reference* (no removal) and emit it on the
     stream for the consumer.
   - `dequeue()` — remove the head (the just-acked event); decrement the shared
     counter; if the queue is non-empty, `dispatch()` the new head.
3. **EventQueueManager** (the Map layer) — owns `Map<string, Queue>`, the shared
   `EventEmitter`, and the pending counter. `enqueue(event)` looks up or creates the
   Queue for `event.key` and enqueues. Sets `producerDone` and watches for completion.
4. **EventEmitter** (Node built-in) — the "event stream"; `dispatch()` emits, the
   consumer reacts. This is what makes dispatch + consumption concurrent across keys.
5. **Consumer** — emitter listener: tag receive time, log
   `receive_time, key, eventId, seq`, `await sleep(payload)`, then `event.ack()`.
6. **Producer / driver** — holds the input event list; loops and calls
   `manager.enqueue(event)` for each.
7. **Shared pending counter** — manager-owned; `+1` on enqueue, `−1` on dequeue.
8. **Support** — `sleep` (promise delay), `logger` (structured lines), `Dockerfile`.

Note: a busy-key Set is NOT needed — the un-removed head is itself the "lane busy"
marker (enqueue only auto-dispatches when the queue was empty).

## 5. Dispatch / ack / backpressure flow

Per key, exactly one event is in flight (dispatched, not yet acked) at a time:
enqueue auto-dispatches only the head → consumer processes → `ack()` → `dequeue()`
removes it and dispatches the next head. Cross-key: many lanes' consumers interleave
on the event loop while each lane stays strictly ordered. Backpressure = the next
event in a lane cannot start until the current one acks.

## 6. Termination (race-guarded)

Completion = `count === 0 && producerDone`. The manager sets `producerDone = true`
after the enqueue loop; only then does a zero count emit `done`, close the emitter,
and exit. The guard prevents a false "done" when a lane transiently drains to 0
before all events are enqueued (matters if the producer streams events over time;
a synchronous burst loop is safe on its own but the guard covers both).

## 7. Complexity & space (to justify in the report)

- Key lookup/insert/delete in `Map`: O(1) average.
- Queue enqueue/dispatch/dequeue: O(1) each (linked list) — contrast with O(n)
  `Array.shift`.
- Space: O(active keys + buffered events); draining a lane can drop its Map entry
  to keep space at O(active keys) — a Phase 3 optimization.

## 8. Source mapping (exactly four, verified notes in resources/notes/)

- **Hanif et al. (2020)** — backpressure / ack-gated dispatch.
- **Liu et al. (2024)** — key partitioning → per-key lanes and ordering.
- **Nowacki et al. (2021)** — distributed event queue w/ Ack Manager; ack-before-remove
  model; target architecture for distributed future work.
- **Ratra et al. (2025)** — high-throughput EDA, partitioning/hot-spots, replication/DLQ;
  scaling context and future work.

Reference caveats: Hanif DOI (10.1109/ICOIN48656.2020.9016513) confirmed via IEEE
Xplore though not printed in the PDF; Nowacki page range and Liu issue number not
printed in their PDFs.
