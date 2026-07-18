# Phase 3 report outline — Optimization & Evaluation

Labels: wayfinder:grilling
Type: HITL
Status: closed
Blocked by: 01-core-design-spec
Assignee: nguyen.vo

## Question

Produce the APA section outline for the Phase 3 report: *Optimization and Evaluation*,
written as cumulative sections building on Phases 1-2. Confirm the section list with
the user.

Map the outline to the official Phase 3 tasks:

1. **Optimization of Data Structures** — analyze Phase 2 performance (time complexity,
   space efficiency, scalability); identify bottlenecks; apply optimizations (caching,
   memoization, more efficient structures) — e.g. empty-queue cleanup keeping space at
   O(active keys), and the map-vs-naive-baseline comparison.
2. **Scaling for Large Datasets** — larger/more complex inputs; maintaining acceptable
   performance as size grows; memory management; the `multiprocessing` parallelism
   angle deferred from the design.
3. **Advanced Testing and Validation** — comprehensive tests for performance and
   correctness; stress testing under extreme/unexpected input; scalability validation
   on progressively larger datasets.
4. **Final Evaluation and Performance Analysis** — optimized vs. PoC comparison;
   trade-offs (time vs. space, accuracy vs. speed); strengths, limitations, future work.

Note: this ticket's resolution likely graduates the benchmark-harness/dataset-size fog
into its own ticket.

Deliverable: an ordered section outline with per-section points and source support.

## Resolution

Phase 3 outline LOCKED (user-confirmed) for a NEW file
`reports/phase3-optimization-and-evaluation.md`, cumulative on Phases 1-2 (earlier phases
not collapsed). Reader-friendly headings with `(task N)` traceability (Phase 2 style).
Canonical terms: distributed event queue, queue (not "lane"), ordering key, event broker.
DAG treated as a loose-but-real guide.

**Sources: five** — Hanif (2020), Liu (2024), Nowacki (2021), Ratra (2025) + **Google Cloud
Pub/Sub documentation** (new; relaxes the prior four-source rule — needs a proper APA 7 web
citation + fact verification in `resources/notes/`).

Each optimization is justified by the problem it solves.

1. **Bridge** — from the Phase 2 PoC to Phase 3 (optimize -> scale -> test -> evaluate).

2. **Optimizing the Data Structures** *(task 1: Optimization of Data Structures)*
   - *Bottleneck framing:* a single global queue serializes independent transactions
     (head-of-line blocking), worse under retry -> motivates the distributed design.
     (For the assembled report this surfaces early in Application Context — see Phase 4 ticket.)
   - **Opt A — Memory management** (folds empty-queue cleanup + flow control): eviction
     releases a queue's `Map` entry on drain (O(active keys), less GC); flow control bounds
     each queue via high/low-water marks + an awaitable `submit()` gate that suspends the
     producer (emulates Node Streams backpressure with a Promise; `EventEmitter` has no native
     pause/resume). *Problem solved:* unbounded memory — drained queues accumulating, and a
     hot key's queue growing without bound. *Support: Liu, Hanif.*
   - **Opt B — Recoverability**: redelivery at the queue head, exponential backoff (30s cap),
     max 5 attempts, 20% failure/attempt so some events exhaust -> per-queue `dlq` array.
     *Problem solved:* a failing event blocking its queue and losing recoverability.
     *Support: Nowacki, Ratra.*

3. **Scaling for Large Datasets** *(task 2)*
   - Memory under growth: cleanup + flow-control bounds keep memory ~O(active keys).
   - *Production-grade path:* frame the distributed event queue AS a managed event broker
     (Pub/Sub), mapping the major components — EventQueueManager+`Map` -> the **event broker**
     (black-box orchestration); Producer -> publisher; Consumer -> subscriber; per-key Queue ->
     ordered delivery with ordering key; ack -> ack/lease; `dlq` -> dead-letter topic; in-memory
     -> durable store. Each component becomes an independently scalable service -> horizontal
     scale + availability (no SPOF, durability). Major components only, high-level.
     `worker_threads` dropped entirely (subsumed by per-service scaling). *Support: Nowacki,
     Ratra, Pub/Sub docs.*

4. **Validating the Optimizations** *(task 3: Advanced Testing and Validation)*
   - Reuses only the existing test infrastructure (injected clock/logger, `node --test`); does
     NOT re-document the 18 Phase 2 tests.
   - New optimization assertions: flow-control pause/resume (producer suspends at high-water,
     resumes on drain, zero drops -> conservation); empty-queue eviction (`Map` entry removed on
     drain); redelivery/backoff/DLQ retry-exactness (exhausted event -> `dlq` exactly once, other
     queues never stall).
   - Three demos, each proving one point (every result is used):
     1. **Distributed vs single queue — total processing time** (FIRST demo; foundational
        bottleneck proof; result cited back in Application Context during assembly).
     2. **Recovery** — redelivery/backoff/DLQ, `dlq` surfaced in the viz.
     3. **Memory with vs without the optimization** — eviction + flow control; captures the
        memory comparison.
   - *Support: Liu, Hanif.*

5. **Final Evaluation and Performance Analysis** *(task 4)*
   - Time (demo 1): distributed vs single total processing time proves the concurrency benefit;
     **concurrency-vs-deferred-parallelism folded into this discussion** (single-core ceiling
     noted here, not a standalone paragraph).
   - Memory (demo 3): with-vs-without comparison proves the memory optimization.
   - Robustness (demo 2): retry count + DLQ count + zero-loss (conservation).
   - Trade-offs: time vs space; robustness vs backpressure/redelivery complexity. Strengths;
     limitations (in-memory/no durability, single-process, consumer-bound throughput); future
     work -> managed-broker path.

6. **References** — five sources.

### Deferred to writing/execution (downstream of this outline)

- Implement Opt A (eviction + flow-control gate) and Opt B (redelivery + backoff + DLQ).
- Build the three demos and extend the test suite with the optimization assertions.
- Build the benchmark harness (distributed vs single; choose actual N/K sizes) and run it.
- Write the Phase 3 prose per WRITING-REQUIREMENTS; add + verify the Pub/Sub citation.
- (Assembly) surface the bottleneck framing + cite the demo-1 time result in Application
  Context — see Phase 4 ticket.
