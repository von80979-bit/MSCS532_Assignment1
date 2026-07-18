# Map: Event-Queue Design & Report-Structure Specification

Labels: wayfinder:map
Status: open

## Destination

A design-and-report specification for the event-queue residency project (MSCS-532):
the locked data-structure design (justified on time complexity, space efficiency,
application fit, and recent research) and an APA section outline for each of Phases
1-3, with Phase 4 defined as the cumulative assembly plus presentation. When this map
is complete, implementation and writing sessions can start with nothing left to
decide about *what* to build or *how* each report is structured.

## Notes

**Domain.** Real-time, distributed event queue with an ordering key, implemented in **Node.js /
JavaScript** (the user's original EventStream prototype) and packaged as a **Docker
image** so the demo runs reproducibly. A hash table (JS `Map`) keys each event's
ordering key to its own FIFO queue. Events sharing a key are processed strictly in
order; events with different keys run concurrently on Node's single-threaded
event loop. A consumer receives an event, logs it (terminal), awaits a timer for
simulated work (payload = sleep duration), then acknowledges — the ack gates dispatch
of the next event in that key's queue (backpressure). Processing continues until every
queue drains.

**Problem solved (application context).** The prototype is an in-memory event broker whose
focus is **event ordering**. Many systems process operations whose outcomes depend on one
another, so the resulting transactions must be applied in the order the dependencies require
(concrete case: an order-shipped transaction depends on an earlier inventory-reserved one).
Ordering matters *per dependency group*; independent transactions carry no shared order. Two
approaches scale poorly: (1) processing every transaction in one global sequential order
preserves order but drives latency too high as volume grows; (2) having the caller orchestrate
the transactions across consumers preserves order but tightly couples the services. Partitioning
by an ordering key resolves this — strict per-key FIFO where dependencies matter, concurrency
across independent keys — while ack-gating enforces the order and makes failures retryable (an
unacked event redispatches at its queue head without advancing past it). Groundable in Nowacki
(2021) (ack before removal) and Ratra et al. (2025) (idempotent consumers, dead-letter queues,
event replay). *Note: the finished report replaced the earlier "downstream API gives no ordering
guarantee" framing with the caller-orchestration coupling tension above.*

**Language.** JavaScript / Node.js + Docker. This is a professor-approved deviation
from the assignment's stated Python requirement, but per the user the deviation note
must appear in NEITHER the report NOR the code (kept only in internal planning docs).
Each key uses a proper O(1) queue (linked-list or head-index), not `Array.shift`
(which is O(n)).

**Concurrency vs. parallelism.** The PoC delivers *concurrency* (interleaved queues on
one event loop), not true parallelism. True parallelism (Node `worker_threads` /
`cluster`) is treated as a Phase 3 optimization/scaling topic, never claimed by the PoC.

**Sources (five — the four papers + Pub/Sub docs).**
1. Ratra, Seth, Verma, & Burman (2025, IEMCON) — IEEE doc 11381226 — high-throughput EDA.
2. Nowacki, Roszczyk, & Krupa (2021, CPEE) — IEEE doc 9585262 — distributed event queue.
3. Hanif, Yoon, & Lee (2020, ICOIN) — IEEE doc 9016513 — backpressure mitigation.
4. Liu, Wang, Zhou, & Mao (2024, CCF THPC) — adaptive key partitioning.
5. Google Cloud Pub/Sub documentation — **added in Phase 3** for the managed-broker scaling
   framing (ordering keys, redelivery, dead-letter topics). Relaxes the prior four-source rule;
   needs a proper APA 7 web citation + fact verification in `resources/notes/` (downstream).
Pacaci & Özsu was dropped. Per-paper verified notes live in `resources/notes/`
(each fact-checked against its PDF). Open reference caveats: Hanif DOI
(10.1109/ICOIN48656.2020.9016513) confirmed by user via IEEE Xplore though not printed
in the PDF; Nowacki page range not printed; Liu issue number not printed.

**Standing constraints.** Every phase report maps to that phase's *official*
assignment task list (captured in the report-outline tickets). Formatting follows
`resources/WRITING-REQUIREMENTS.md` (APA 7, ~4 pages, 240-300 words/paragraph,
no quotation marks, no inter-sentence hyphens, DAG-ordered sections, sections
confirmed with the user).

**Scope override.** This effort carries the report *outlines* into the map — an
outline (sections + order + per-section points) is a destination deliverable, not
just planning scaffolding. Prose writing, code, and running benchmarks are downstream.

**Skills to consult.** `/grilling` + `/domain-modeling` for the design-spec and
outline tickets; `/research` for source work; `/proofreading` later (out of scope here).

## Decisions so far

<!-- one line per closed ticket -->

- [Lock the core design specification](tickets/01-core-design-spec.md) — design LOCKED
  in `design-spec.md`: JS/Node + single Docker container, native `Map` + custom O(1)
  linked-list `Queue`, `Event.ack()`→`dequeue()`, native `EventEmitter` for per-key
  ordering + cross-key concurrency, manager-owned counter + `producerDone` termination
  guard. Four verified sources (Hanif, Liu, Nowacki, Ratra). **Unblocks all three
  phase-outline tickets.**
- [Phase 1 report outline — Data Structure Design](tickets/02-phase1-report-outline.md) —
  outline LOCKED and **Phase 1 report FINALIZED** at `reports/phase1-data-structure-design.md`:
  Application Context → Data Structure Design (Hash Map for Key Partitioning; Custom FIFO
  Queue and Ack-Gated Ordering) → Complexity and Space Efficiency → Implementation Framing.
  Prose proofread to WRITING-REQUIREMENTS; the Application Context follow-up (dependency-driven
  ordering framing) is done; Liu block quote converted to a paraphrase (no block quotes);
  lane→queue terminology standardized; two fact-check fixes applied (Liu ordering attribution,
  Ratra replication→idempotent consumers).
- [Phase 2 report outline — Proof of Concept Implementation](tickets/03-phase2-report-outline.md) —
  outline LOCKED for a NEW file `reports/phase2-proof-of-concept.md` (cumulative on Phase 1),
  reader-friendly headings: Core Data Structures and Operations → Demonstrating Ordering and
  Concurrency (Figure 1 = `resources/demo.png`; chronological-vs-processing-order analysis +
  light-touch Node.js event loop) → Code Quality and Best Practices → Implementation Process and
  Next Steps → References. Phase 1's "Implementation Framing" is renamed **Component Architecture**
  and reworked to the aligned design; the Python-deviation note stays out of the report + code.
  **Writing the prose (Phase 2 + the Phase 1 rework), plus the OVERVIEW/design-spec cleanups, is
  deferred to a writing/execution session** (see the ticket's Deferred section).
- [Phase 3 report outline — Optimization & Evaluation](tickets/04-phase3-report-outline.md) —
  outline LOCKED for a NEW file `reports/phase3-optimization-and-evaluation.md` (cumulative on
  Phases 1-2), reader-friendly headings with `(task N)` traceability: Bridge → Optimizing the
  Data Structures (single-queue bottleneck framing; **Opt A memory management** = empty-queue
  eviction + flow control; **Opt B recoverability** = redelivery + backoff + per-queue `dlq`) →
  Scaling (frame the distributed event queue AS a managed **event broker** / Pub/Sub, mapping the
  major components; `worker_threads` dropped) → Validating the Optimizations (new opt assertions +
  three demos: distributed-vs-single time [1st], recovery, memory with/without) → Final Evaluation
  (time, memory, robustness metrics; concurrency-vs-parallelism folded into the time discussion) →
  References. **Added a 5th source: Google Cloud Pub/Sub docs.** Implementation, demos, benchmark
  run, and prose are downstream (see the ticket's Deferred section).

## Not yet specified

- Presentation format/tooling for Phase 4 (slides, live demo vs. recording).

<!-- benchmark-harness fog resolved by the Phase 3 outline: measurement design is fixed
     (distributed vs single queue; total processing time + peak memory; growing N/K with
     identical payloads). Only the exact dataset sizes + harness code remain, and those are
     execution work (out of scope — see below). -->

## Out of scope

<!-- beyond this map's destination; done in later execution sessions -->

- Writing the actual APA report prose for any phase — happens after the outlines are locked.
- Implementing the Python event queue and demo script — Phase 2 execution work.
- Running the actual benchmarks / stress tests and collecting numbers — Phase 3 execution work.
