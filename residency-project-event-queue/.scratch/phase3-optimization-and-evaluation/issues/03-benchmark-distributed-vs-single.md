# 03 — Benchmark harness + distributed-vs-single time demo (Demo 1)

**What to build:** The benchmark that proves the core value — distributed per-key queues vs
a single global queue for all transactions. A single-global-queue baseline mode processes
everything in one FIFO; the distributed mode is the optimized system from tickets 01–02. The
harness runs both over progressively larger datasets (growing event count N and key count K)
with identical payloads, capturing total processing time (primary metric) and peak memory. It
prints the comparison, including the case where injected retries widen the gap. This is the
foundational "Demo 1" whose numbers feed the report's evaluation and application-context
framing.

Context: implements the benchmark + Demo 1 of the locked Phase 3 outline
(`wayfinder/tickets/04-phase3-report-outline.md`). Throughput is consumer/payload-bound, so
total processing time under identical payloads is the fair structural metric.

**Blocked by:** 01, 02 (measures the complete optimized system).

**Status:** done

- [x] A single-global-queue baseline mode exists alongside the distributed mode
- [x] Harness runs both across a configurable sweep of dataset sizes (N events / K keys), payloads held identical between modes
- [x] Captures and prints total processing time and peak memory per mode per size
- [x] Includes a run showing the retry scenario widening the distributed-vs-single gap
- [x] Output is in a form the report can cite (table or structured log)

**When done:** tick the acceptance criteria above and set `Status: done`.

---

**Implemented:** `src/benchmark.js` (npm run `demo:benchmark`; `node --expose-gc src/benchmark.js`).

- **Two modes, same optimized system, only key assignment differs.** Both modes run one
  `EventQueueManager` (eviction + recoverability on). `single` routes every event to one ordering
  key → one global FIFO (head-of-line blocking); `distributed` keeps per-transaction keys → K queues
  whose heads `await sleep(payload)` concurrently. Payloads are held identical (same dataset), so the
  gap is attributable purely to distribution. Flow control is left off so timing reflects pure consume
  concurrency, not producer suspension (that lever is Demo 3's subject).
- **Configurable sweep** via `--keys`, `--depth`, `--payload`; dataset is `N = K × depth` laid out
  round-robin. Default sweep K = 10/25/50/100 (N = 200…2000).
- **Primary metric total processing time** (`performance.now`), **secondary peak retained heap**
  (sampled `heapUsed`, `--expose-gc` for cleaner reads), printed per mode per size.
- **Retry run:** a fraction of heads (`--retry-frac`, default 20% — the failure rate the report
  models) fail twice then succeed. The **gap is the absolute time difference (single − distributed)**;
  it WIDENS under retry because single serializes every backoff (pays their sum) while distributed
  overlaps them with other keys' work. The ratio can't widen here (distributed is too fast for a fixed
  backoff to move it proportionally), so absolute gap is the honest metric.
- **Citable output:** aligned table + per-row `DATA …` structured log lines + optional `--json`.

Representative run (payload 2ms, depth 20): speedup 10× (N=200) → 78× (N=2000); retry gap
2268ms → 3705ms (single retry cost +1590ms serialized vs distributed +153ms overlapped), zero loss.
Numbers are machine-dependent; the report should cite a fresh run.
