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

**Domain.** Real-time, distributed event queue with orderking key, implemented in **Node.js /
JavaScript** (the user's original EventStream prototype) and packaged as a **Docker
image** so the demo runs reproducibly. A hash table (JS `Map`) keys each event's
ordering key to its own FIFO queue. Events sharing a key are processed strictly in
order; events with different keys run on concurrent lanes on Node's single-threaded
event loop. A consumer receives an event, logs it (terminal), awaits a timer for
simulated work (payload = sleep duration), then acknowledges — the ack gates dispatch
of the next event in that key's queue (backpressure). Processing continues until every
queue drains.

**Problem solved (application context).** Many systems apply a stream of state-changing
operations to shared entities where order matters *per entity* but not globally — for
example transactions or operations ordered by an account, order, or customer id. Two
constraints collide: (1) operations on the *same* entity must apply in arrival order (an
update must not overtake the create it depends on); (2) processing the whole stream in one
global sequence is correct but far too slow, and the downstream API gives no ordering
guarantee, so firing concurrent requests risks out-of-order application and corrupted
state. The event queue resolves this: partitioning by the ordering key gives strict
per-entity FIFO while different entities run concurrently (ordering where it matters *plus*
parallelism), ack-gating enforces the order the API does not, and modeling each unit as an
event makes failures retryable (an unacked event can be redispatched at its lane head
without advancing past it). Groundable in Nowacki (2021) (ack before removal) and Ratra
et al. (2025) (idempotent consumers, dead-letter queues, event replay).

**Language.** JavaScript / Node.js + Docker. This is a professor-approved deviation
from the assignment's stated Python requirement; keep that approval documented in the
README/report. Each lane uses a proper O(1) queue (linked-list or head-index), not
`Array.shift` (which is O(n)).

**Concurrency vs. parallelism.** The PoC delivers *concurrency* (interleaved lanes on
one event loop), not true parallelism. True parallelism (Node `worker_threads` /
`cluster`) is treated as a Phase 3 optimization/scaling topic, never claimed by the PoC.

**Sources (exactly four — no others).**
1. Ratra, Seth, Verma, & Burman (2025, IEMCON) — IEEE doc 11381226 — high-throughput EDA.
2. Nowacki, Roszczyk, & Krupa (2021, CPEE) — IEEE doc 9585262 — distributed event queue.
3. Hanif, Yoon, & Lee (2020, ICOIN) — IEEE doc 9016513 — backpressure mitigation.
4. Liu, Wang, Zhou, & Mao (2024, CCF THPC) — adaptive key partitioning.
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
  outline LOCKED (user-confirmed): Application Context → Data Structure Design (Hash Map
  for Key Partitioning; Custom FIFO Queue and Ack-Gated Ordering) → Complexity and Space
  Efficiency → Implementation Framing. Prose drafted to WRITING-REQUIREMENTS at
  `reports/phase1-data-structure-design.md`. **Follow-up: revise the Application Context
  section to add the transaction ordering problem framing — see design-spec.md §1
  and Notes "Problem solved".**
- [Phase 2 report outline — Proof of Concept Implementation](tickets/03-phase2-report-outline.md) —
  outline LOCKED, mirrors the four official Phase 2 tasks (Partial Implementation →
  Demonstration of Key Operations → Documentation of Process → Code Quality), cumulative
  on Phase 1. PoC built and reproducible: `src/` (Map + O(1) linked-list Queue, manager,
  producer/consumer, unit tests), `demo:viz` TUI, `Dockerfile`, `README.md`. Report prose
  is downstream.

## Not yet specified

- Benchmark harness design and dataset sizes for the Phase 3 evaluation (graduates
  once the core design spec fixes the operations and the map-vs-baseline comparison).
- Presentation format/tooling for Phase 4 (slides, live demo vs. recording).

## Out of scope

<!-- beyond this map's destination; done in later execution sessions -->

- Writing the actual APA report prose for any phase — happens after the outlines are locked.
- Implementing the Python event queue and demo script — Phase 2 execution work.
- Running the actual benchmarks / stress tests and collecting numbers — Phase 3 execution work.
