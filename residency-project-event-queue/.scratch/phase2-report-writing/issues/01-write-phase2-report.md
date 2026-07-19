# 01 — Write the Phase 2 report (Phase 1 Component Architecture rework + Phase 2 draft)

**What to build:** A finished-draft Phase 2 report at `reports/phase2-proof-of-concept.md`, plus the
Phase 1 report's closing section reworked and renamed so Phase 2 reads as a cumulative continuation.
One writer, one session: rename/rework Phase 1's "Implementation Framing" -> "Component Architecture"
first (it is the bridge target), then draft all four Phase 2 sections against the locked outline.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Phase 1's final section is renamed **Implementation Framing -> Component Architecture** and
      reworked to the aligned design (see reviewed draft below); `NodeJs` -> `Node.js` fixed at the
      Hash Map and Complexity paragraphs of `reports/phase1-data-structure-design.md`.
- [x] `reports/phase2-proof-of-concept.md` created (NEW file; Phase 1 is not collapsed into it) with
      the five sections in the locked order below.
- [x] Section 2 embeds **Figure 1 = `resources/demo.png`** and narrates it, referencing the per-queue
      colors (queue-1 red, queue-2 green, queue-3 magenta).
- [x] The **chronological (submission/loop) order vs processing (completion) order** contrast is the
      analytical spine of Section 2; per-key chronological order is shown preserved, cross-key order
      shown diverging (concurrency).
- [x] A **light-touch Node.js event-loop** explanation appears in Section 2, tied to the three
      simultaneous `created` dispatches.
- [x] Prose targets WRITING-REQUIREMENTS (drafting level; the meticulous pass is ticket 02): APA 7,
      ~3-4 pages, no quotation marks, no inter-sentence hyphens.
- [x] The Python-deviation note appears **nowhere** in the report.

## Context / Handoff

### Where the truth lives
- **`design-spec.md`** — LOCKED source of truth for the design (already aligned to the code).
- **`reports/phase1-data-structure-design.md`** — the finalized Phase 1 report this one continues.
- **`resources/WRITING-REQUIREMENTS.md`** — formatting rules (APA 7, 240-300 words/paragraph, no
  quotation marks, no inter-sentence hyphens, DAG-ordered sections, varied citation styles).
- **`resources/notes/`** — per-paper fact-checked notes for the four sources; cite only what these support.
- **`resources/demo.png`** — the captured demo run = Figure 1.
- **`src/`** — the implementation being documented (Queue, EventQueueManager, Event, Producer, Consumer,
  main.js driver, support/, and the 18-test suite `*.test.js`).
- **`OVERVIEW.md`** — NOTE: its pseudocode is still STALE (fixed in ticket 02); do not copy from it.

### The four sources (exactly these; no others)
Hanif et al. (2020) backpressure; Liu et al. (2024) key partitioning / per-key ordering; Nowacki et al.
(2021) ack-before-remove + distributed successor; Ratra et al. (2025) high-throughput EDA, DLQ,
idempotent consumers, scaling.

### Locked Phase 2 outline (reader-friendly headings; official task in parens for traceability)
1. **Core Data Structures and Operations** *(task 1: Partial Implementation of Data Structures)* —
   open with the bridge from Phase 1's **Component Architecture** ("Phase 1 framed these components;
   this phase realizes them"), then the five realized components — pure O(1) linked-list Queue;
   EventQueueManager as the Map layer + sole dispatcher / event stream (extends EventEmitter); Event
   with `ack()` and no queue reference; Producer; Consumer — and the key operations as
   insertion/search/peek/delete analogs (enqueue, key lookup, dispatch, ack/dequeue), each O(1).
   *Support: Liu, Nowacki.*
2. **Demonstrating Ordering and Concurrency** *(task 2: Demonstration of Key Operations)* — the demo
   scenario is three independent orders (keys `queue-1/2/3`), each an order lifecycle
   `created -> payment-confirmed -> inventory-dispatched -> shipped`. Figure 1 = `demo.png`. Spine:
   chronological (submission/loop) order vs processing order — across queues the processing order
   diverges from submission (concurrency); within a queue the per-key chronological sequence is
   preserved (ordering); a naive engine would replay everything sequentially in submission order.
   Include the light-touch event-loop note, plus backpressure (each queue's next event is received
   only after its previous one finishes) and clean termination (`all 3 queues drained; pending=0`).
   *Support: Hanif, Liu.*
3. **Code Quality and Best Practices** *(task 4)* — modularity (one class per file), readability
   (JSDoc, 120-column), error handling (Event validation, double-ack guard, a failed consume leaves
   the event unacked at its queue head), and the 18-test suite as engineering practice (`node --test`,
   edge cases, injected clock/logger for deterministic tests).
4. **Implementation Process and Next Steps** *(task 3: Documentation of Implementation Process)* —
   framed as building the single coherent design, **no before/after deltas**: challenges and their
   solutions (`process.nextTick` re-entrancy deferral so dispatch never re-enters mid-op; the
   peek-identity backpressure gate — only the queue head is emitted; race-guarded termination
   `count===0 && producerDone`), representative code snippets with explanation, and Phase 3 next steps
   (ack-deadline redispatch, nack / dead-letter, flow-control pause/resume, `worker_threads` for true
   parallelism, benchmarks). *Support: Ratra, Nowacki.*
5. **References** — the same four sources, APA 7.

### Terminology (locked)
- **chronological order / sequence** = submission / arrival order (matches the log's "chronological
  sequence" tag). **processing order** = completion order. Use these to avoid overloading "order".

### Reviewed draft — Phase 1 "Component Architecture" (the renamed section body)
Encodes the design-alignment decision precisely; refine to fit but keep every corrected fact:

> The design maps onto a small set of modular and documented components. An Event carries its key,
> identifier, payload, and arrival sequence, and it exposes a single acknowledge method; it holds no
> reference to any queue, so acknowledgment routes through the consumer that received it rather than
> through the data structure. A Queue is a pure structure that stores the events for a single key and
> exposes only the operations needed to add, inspect, and remove them. An Event Queue Manager owns the
> hash map and a counter of pending events, and it is itself the event stream that dispatches work,
> because it locates or creates the correct queue for each arriving key and emits only the current head
> of that queue. A Consumer subscribes to the manager, adopts each dispatched event, records it, waits
> for the simulated work, and then acknowledges, which releases the next event for that key. A Producer
> is a separate component that supplies the input events and signals when the last one has been
> submitted. Completion is reached only when the pending counter returns to zero after the producer has
> finished, a guard that prevents a premature end when a queue empties before every event has arrived.
> The prototype is written in JavaScript on Node.js and packaged with a Docker container definition so
> the demonstration runs reproducibly. It delivers concurrency rather than true parallelism, because it
> runs on a single event loop rather than on separate processors, and broader scaling remains future
> work. Nowacki et al. (2021) present a distributed queue system with an Acknowledgment Manager across
> independent modules, and Ratra et al. (2025) survey partitioning, idempotent consumers, and dead
> letter queues for high throughput deployments, together outlining the path from this single process
> prototype toward a distributed successor in a later phase.

### Standing constraints
- Cumulative report: do NOT re-explain the application context (Phase 1 owns it); bridge and extend.
- Frame as a single design with no change/modification narrative (no "we changed X to Y").
- The Python-deviation note must appear in NEITHER the report NOR the code.
- Source: this outline was locked in the wayfinder ticket "Phase 2 report outline — Proof of Concept
  Implementation" (`wayfinder/tickets/03-phase2-report-outline.md`, Resolution section).
