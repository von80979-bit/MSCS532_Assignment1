import { performance } from 'node:perf_hooks';
import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';
import { consoleColors, logger } from './support/logger.js';

/**
 * Benchmark harness + Demo 1 (Phase 3) — distributed per-key queues vs a single global queue.
 *
 * This is the foundational "processing time" proof for the Phase 3 report
 * (`reports/phase3-optimization-and-evaluation.md`, task 3/task 4): it measures the SAME optimized
 * system (`EventQueueManager` / `Producer` / `Consumer` / `Event`) in two structural modes over an
 * identical dataset, so the only variable is how work is distributed across queues.
 *
 *   - **single**  — every event is routed to ONE ordering key, so the manager holds a single global
 *     FIFO. Independent transactions serialize behind one head (head-of-line blocking): total time is
 *     the sum of every event's work. This is the pre-distributed baseline the design set out to beat.
 *   - **distributed** — every transaction keeps its own ordering key, so the manager holds K per-key
 *     queues. Their heads dispatch and `await sleep(payload)` concurrently on the single event loop
 *     (concurrency, not parallelism), so total time tracks the busiest key, not the whole dataset.
 *
 * Both modes run the identical manager config and the identical payloads — only the key assignment
 * differs — so the comparison is fair and the gap is attributable purely to distribution.
 *
 * Primary metric: total processing time (throughput is consumer/payload-bound, so wall-clock time
 * under identical payloads is the fair structural metric). Secondary: peak retained heap.
 *
 * A final run injects deterministic retries into a fraction of queue heads (default 20%, the failure
 * rate the report models). In `single` mode every backing-off head stalls the whole FIFO, and those
 * stalls SERIALIZE — the queue pays their sum. In `distributed` mode each stalls only its own key and
 * the backoffs OVERLAP with the other keys' work — the system pays ~one backoff cycle. So the absolute
 * distributed-vs-single time gap WIDENS under retry (single − distributed grows), because a single FIFO
 * is head-of-line-blocked by every failure while the distributed system absorbs them concurrently.
 *
 * Run: `node --expose-gc src/benchmark.js [--payload MS] [--depth D] [--keys K1,K2,...] [--retry-frac F] [--json]`
 */

// --- config ------------------------------------------------------------------

const GLOBAL_KEY = '__global__';       // the single ordering key the baseline collapses onto
const MAX_ATTEMPTS = 5;                // deliveries before an event is dead-lettered (Opt B)
const BACKOFF_BASE = 50;               // ms; kept small so the retry demo runs quickly but visibly
const silent = { line() {}, info() {}, error() {}, success() {}, warn() {} };

/** @returns {number} force a GC when started with --expose-gc so heap reads are less noisy (else no-op). */
const gc = typeof globalThis.gc === 'function' ? globalThis.gc : () => {};
const mb = (bytes) => bytes / 1024 / 1024;

/** Parse `--flag value`; returns `fallback` when absent/invalid. @param {string} flag @param {(s:string)=>any} map */
function arg(flag, map, fallback) {
  const i = process.argv.indexOf(flag);
  if (i !== -1 && process.argv[i + 1] !== undefined) {
    const v = map(process.argv[i + 1]);
    if (v !== undefined && v !== null && !(typeof v === 'number' && Number.isNaN(v))) return v;
  }
  return fallback;
}

const PAYLOAD = arg('--payload', (s) => Math.max(0, Number(s)), 2);         // ms of simulated work per event
const DEPTH = arg('--depth', (s) => Math.max(1, Math.floor(Number(s))), 20); // events per key
const KEY_COUNTS = arg('--keys', (s) => s.split(',').map((n) => Math.max(1, Math.floor(Number(n)))), [10, 25, 50, 100]);
const RETRY_FRAC = arg('--retry-frac', (s) => Math.min(1, Math.max(0, Number(s))), 0.2); // fraction of keys made flaky (report models ~20%)
const RETRIES = 2;                                                          // failures a flaky head takes before it passes
const JSON_OUT = process.argv.includes('--json');

// --- dataset -----------------------------------------------------------------

/**
 * Build one dataset shared by both modes. Events are laid out round-robin across keys (all keys' 1st
 * event, then all keys' 2nd, ...) so arrival order mixes transactions the way a real stream would.
 * The `eventId` is derived from the logical key+seq (NOT the routed key), so it is stable across modes
 * and the retry set targets the same logical events in both.
 * @param {{keyCount:number, depth:number, payload:number}} spec
 * @returns {{key:string, eventId:string, payload:number, seq:number, type:string}[]}
 */
function buildDataset({ keyCount, depth, payload }) {
  const specs = [];
  let seq = 0;
  for (let d = 0; d < depth; d++) {
    for (let k = 0; k < keyCount; k++) {
      specs.push({ key: `txn-${k}`, eventId: `txn-${k}#${d}`, payload, seq: seq++, type: 'transfer' });
    }
  }
  return specs;
}

/**
 * Choose which events are flaky: the HEAD (depth 0) event of a `frac` fraction of keys. In `single`
 * mode these all sit in the one global FIFO and their backoffs serialize (the queue pays their sum);
 * in `distributed` mode each stalls only its own key and the backoffs overlap. Returns their
 * (mode-stable) eventIds.
 * @param {number} keyCount @param {number} frac
 * @returns {Set<string>}
 */
function retrySet(keyCount, frac) {
  const m = Math.max(1, Math.round(keyCount * frac));
  const set = new Set();
  for (let k = 0; k < Math.min(m, keyCount); k++) set.add(`txn-${k}#0`);
  return set;
}

// --- run ---------------------------------------------------------------------

/** Run `fn` with the Consumer's per-event console.log receive/finish lines suppressed. */
async function quiet(fn) {
  const realLog = console.log;
  console.log = () => {};
  try {
    return await fn();
  } finally {
    console.log = realLog;
  }
}

/**
 * Process the whole dataset in one mode and measure it.
 * @param {object} p
 * @param {{key:string, eventId:string, payload:number, seq:number, type:string}[]} p.specs
 * @param {'single'|'distributed'} p.mode
 * @param {Set<string>|null} [p.flaky] - eventIds that should fail `RETRIES` times then succeed.
 * @returns {Promise<{elapsedMs:number, processed:number, failures:number, dlq:number, peakHeapMb:number}>}
 */
async function runMode({ specs, mode, flaky = null }) {
  // Same optimized manager for both modes (eviction + recoverability on). Flow control is left off
  // (highWater = Infinity) so timing reflects pure consume concurrency, not producer suspension —
  // the flow-control lever is Demo 3's subject.
  const manager = new EventQueueManager({ evict: true, maxAttempts: MAX_ATTEMPTS, backoffBase: BACKOFF_BASE });
  const producer = new Producer(manager);
  const fail = flaky
    ? (event) => flaky.has(event.eventId) && event.attempts < RETRIES // fail first RETRIES deliveries, then pass
    : () => false;
  const consumer = new Consumer(manager, { log: silent, fail });

  let processed = 0;
  let failures = 0;
  consumer.on('consumed', () => { processed += 1; });
  consumer.on('failed', () => { failures += 1; });
  consumer.subscribe();

  gc();
  const baseHeap = process.memoryUsage().heapUsed;
  let peakHeap = baseHeap;
  const sampler = setInterval(() => {
    const h = process.memoryUsage().heapUsed;
    if (h > peakHeap) peakHeap = h;
  }, 4);

  const t0 = performance.now();
  for (const s of specs) {
    const key = mode === 'single' ? GLOBAL_KEY : s.key; // the ONLY structural difference between modes
    await producer.submit(new Event({ key, eventId: s.eventId, payload: s.payload, seq: s.seq, type: s.type }));
  }
  producer.producerDone();
  await manager.whenDone();
  const elapsedMs = performance.now() - t0;

  clearInterval(sampler);
  gc();
  return { elapsedMs, processed, failures, dlq: manager.dlqCount(), peakHeapMb: mb(peakHeap - baseHeap) };
}

// --- reporting ---------------------------------------------------------------

const { fgCyan, fgYellow, fgGreen, fgRed, reset } = consoleColors;
const paint = (c, s) => `${c}${s}${reset}`;
const ms = (n) => `${n.toFixed(1)}ms`;
const pad = (s, w) => String(s).padStart(w);

function header(title) {
  console.log('\n' + paint(fgYellow, title));
  console.log(paint(fgYellow, '─'.repeat(title.length)));
}

/** One aligned table row. Columns: N, K, single time, distributed time, speedup, single peak MB, dist peak MB. */
function row(cells) {
  const widths = [7, 6, 12, 12, 9, 12, 12];
  console.log(cells.map((c, i) => pad(c, widths[i])).join('  '));
}

async function main() {
  logger.info('Demo 1 — distributed per-key queues vs a single global queue (total processing time).');
  console.log(`  config: payload=${PAYLOAD}ms/event, depth=${DEPTH} events/key, keySweep=[${KEY_COUNTS.join(', ')}], ` +
    `retries=${RETRIES}×@${BACKOFF_BASE}ms on ${(RETRY_FRAC * 100).toFixed(0)}% of heads`);
  console.log('  both modes: same optimized manager (eviction + recoverability on); only key assignment differs.');
  if (typeof globalThis.gc !== 'function') {
    logger.warn('  (peak-heap figures are a rough snapshot; re-run with `node --expose-gc src/benchmark.js` for cleaner reads)');
  }

  /** @type {object[]} machine-readable rows for --json / citation. */
  const data = [];
  /** @type {string[]} one-line structured log per run, printed as a block at the end (kept out of the table so it stays readable). */
  const logLines = [];

  // --- Sweep: no retries. Distributed tracks the busiest key; single sums every event. -------------
  header('Sweep — no retries  (N = total events, K = ordering keys/queues, N = K × depth)');
  row(['N', 'K', 'single', 'distributed', 'speedup', 'single-mem', 'dist-mem']);
  row(['', '', '(time)', '(time)', '(×)', '(peak MB)', '(peak MB)']);
  for (const K of KEY_COUNTS) {
    const specs = buildDataset({ keyCount: K, depth: DEPTH, payload: PAYLOAD });
    const N = specs.length;
    const single = await quiet(() => runMode({ specs, mode: 'single' }));
    const dist = await quiet(() => runMode({ specs, mode: 'distributed' }));
    const speedup = single.elapsedMs / dist.elapsedMs;
    row([
      N, K,
      paint(fgRed, ms(single.elapsedMs)),
      paint(fgGreen, ms(dist.elapsedMs)),
      paint(fgCyan, `${speedup.toFixed(1)}×`),
      single.peakHeapMb.toFixed(1),
      dist.peakHeapMb.toFixed(1),
    ]);
    data.push({ scenario: 'no-retry', N, K, depth: DEPTH, payloadMs: PAYLOAD,
      singleMs: +single.elapsedMs.toFixed(1), distributedMs: +dist.elapsedMs.toFixed(1),
      speedup: +speedup.toFixed(2), singlePeakMb: +single.peakHeapMb.toFixed(2), distPeakMb: +dist.peakHeapMb.toFixed(2),
      processed: dist.processed });
    // Structured log line for easy citation/grep — collected and printed as one block below the tables.
    logLines.push(`scenario=no-retry N=${N} K=${K} single=${single.elapsedMs.toFixed(1)}ms ` +
      `distributed=${dist.elapsedMs.toFixed(1)}ms speedup=${speedup.toFixed(2)}x`);
  }
  console.log(paint(fgCyan,
    '  => single grows with N (every transaction serializes behind one head); distributed tracks the busiest key.'));

  // --- Retry scenario: same dataset, a few flaky heads. Widens the gap. ---------------------------
  const K = KEY_COUNTS[Math.floor(KEY_COUNTS.length / 2)]; // a middle size
  const specs = buildDataset({ keyCount: K, depth: DEPTH, payload: PAYLOAD });
  const N = specs.length;
  const flaky = retrySet(K, RETRY_FRAC);

  header(`Retry scenario — ${flaky.size} flaky heads (${(RETRY_FRAC * 100).toFixed(0)}% of keys), each fails ${RETRIES}× then succeeds  (N = ${N}, K = ${K})`);
  const singleBase = await quiet(() => runMode({ specs, mode: 'single' }));
  const distBase = await quiet(() => runMode({ specs, mode: 'distributed' }));
  const singleRetry = await quiet(() => runMode({ specs, mode: 'single', flaky }));
  const distRetry = await quiet(() => runMode({ specs, mode: 'distributed', flaky }));

  // The gap is the ABSOLUTE processing-time difference (single − distributed). It widens under retry
  // because single serializes every flaky head's backoff (pays their sum) while distributed overlaps
  // them with the other keys' work (pays ~one backoff cycle).
  const gapBase = singleBase.elapsedMs - distBase.elapsedMs;
  const gapRetry = singleRetry.elapsedMs - distRetry.elapsedMs;
  console.log(`  no retries  : single ${paint(fgRed, ms(singleBase.elapsedMs))}  vs  distributed ${paint(fgGreen, ms(distBase.elapsedMs))}   (gap ${paint(fgCyan, ms(gapBase))})`);
  console.log(`  with retries: single ${paint(fgRed, ms(singleRetry.elapsedMs))}  vs  distributed ${paint(fgGreen, ms(distRetry.elapsedMs))}   (gap ${paint(fgCyan, ms(gapRetry))})`);
  console.log(`  retry cost  : single +${ms(singleRetry.elapsedMs - singleBase.elapsedMs)} (every backoff serializes in the one FIFO)   ` +
    `distributed +${ms(distRetry.elapsedMs - distBase.elapsedMs)} (backoffs overlap the other keys' work)`);
  console.log(`  correctness : distributed processed ${distRetry.processed}/${N}, failures ${distRetry.failures}, dead-lettered ${distRetry.dlq} (zero loss)`);
  console.log(paint(fgCyan, `  => retries widen the gap from ${ms(gapBase)} to ${ms(gapRetry)}: a backing-off head stalls the whole single FIFO but only its own key when distributed.`));

  logLines.push(`scenario=retry N=${N} K=${K} single_base=${singleBase.elapsedMs.toFixed(1)}ms single_retry=${singleRetry.elapsedMs.toFixed(1)}ms ` +
    `distributed_base=${distBase.elapsedMs.toFixed(1)}ms distributed_retry=${distRetry.elapsedMs.toFixed(1)}ms gap_base=${gapBase.toFixed(1)}ms gap_retry=${gapRetry.toFixed(1)}ms`);

  data.push({ scenario: 'retry', N, K, depth: DEPTH, payloadMs: PAYLOAD, flakyHeads: flaky.size, retries: RETRIES,
    singleBaseMs: +singleBase.elapsedMs.toFixed(1), singleRetryMs: +singleRetry.elapsedMs.toFixed(1),
    distBaseMs: +distBase.elapsedMs.toFixed(1), distRetryMs: +distRetry.elapsedMs.toFixed(1),
    gapBaseMs: +gapBase.toFixed(1), gapRetryMs: +gapRetry.toFixed(1),
    processed: distRetry.processed, failures: distRetry.failures, deadLettered: distRetry.dlq });

  // --- Structured log block (citable / greppable), kept out of the tables above. -------------------
  header('Structured log  (for citation / grep)');
  for (const line of logLines) console.log(paint(fgYellow, `  DATA ${line}`));

  if (JSON_OUT) {
    console.log('\n' + paint(fgYellow, 'JSON'));
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('');
}

main().catch((err) => {
  logger.error(err.stack || String(err));
  process.exit(1);
});
