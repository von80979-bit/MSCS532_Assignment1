import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';
import { consoleColors, logger } from './support/logger.js';

/**
 * Memory demo for Opt A — memory management (Phase 3, Demo 3).
 *
 * Proves the optimization keeps memory bounded by running the SAME real system
 * (`EventQueueManager` / `Producer` / `Consumer` / `Event`) twice per scenario — once WITH the
 * optimization and once WITHOUT — and printing the difference. The "without" is just a fearture flag on the event queue manager
 * (`evict: false`, `highWater: Infinity`).
 *
 * Two scenarios, each isolating one lever:
 *   1. Hot key + flow control — one key flooded by a fast producer. WITHOUT backpressure the single
 *      queue buffers every event at once; WITH it the queue is capped at the high-water mark.
 *      Metric: peak queue size (deterministic).
 *   2. Transient keys + eviction — many keys, one event each. WITHOUT eviction every drained queue
 *      lingers in the `Map`; WITH it the `Map` tracks only active keys. Metric: retained queueCount
 *      after drain (deterministic) + heap retained after drain.
 *
 * Every event carries `payload: 0` so the run is I/O-paced, not sleep-bound. Peak queue size /
 * retained queue count are the deterministic proofs; heap is a supportive snapshot (GC timing is
 * not deterministic — run with `node --expose-gc` for a cleaner read).
 *
 * Run: `node src/demo-memory.js [--n N]`  (default N = 2000 events per run).
 */

// --- config ------------------------------------------------------------------

/** @returns {number} event count per run (CLI `--n N`, default 2000). */
function parseN() {
  const i = process.argv.indexOf('--n');
  if (i !== -1 && process.argv[i + 1]) {
    const n = Number(process.argv[i + 1]);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return 2000;
}

const N = parseN();
const HIGH_WATER = 32; // hot-key cap when flow control is ON
const LOW_WATER = 8;   // resume threshold
const silent = { line() {}, info() {}, error() {}, success() {}, warn() {} };

/** Force a GC if the process was started with --expose-gc, so heap reads are less noisy. */
const gc = typeof globalThis.gc === 'function' ? globalThis.gc : () => {};
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

/** Run `fn` with the Consumer's own `console.log` receive/finish lines suppressed, so only the demo's table prints. */
async function quiet(fn) {
  const realLog = console.log;
  console.log = () => {};
  try {
    return await fn();
  } finally {
    console.log = realLog;
  }
}

// --- scenario 1: hot key + flow control --------------------------------------

/**
 * Flood a single key and watch how large its queue gets. Peak queue size is the deterministic proof:
 * the buffered events are exactly what backpressure bounds, so a queue capped at the high-water mark
 * is a queue whose buffered memory is capped. (Heap bytes are omitted here — each event is tiny, so
 * at this scale GC noise swamps the signal; Scenario 2 carries the heap read.)
 * @param {boolean} optimized - true = flow control on (high/low-water); false = unbounded.
 * @returns {Promise<{processed: number, peakQueueSize: number}>}
 */
async function runHotKey(optimized) {
  const manager = optimized
    ? new EventQueueManager({ highWater: HIGH_WATER, lowWater: LOW_WATER })
    : new EventQueueManager({ highWater: Infinity }); // no backpressure
  const producer = new Producer(manager);
  const consumer = new Consumer(manager, { log: silent });
  let processed = 0;
  consumer.on('consumed', () => { processed += 1; });
  consumer.subscribe();

  let peakQueueSize = 0;
  const sample = () => {
    const q = manager.queues.get('hot');
    if (q && q.size > peakQueueSize) peakQueueSize = q.size;
  };
  const timer = setInterval(sample, 2);

  for (let i = 0; i < N; i++) {
    sample();
    // Await the gate: WITHOUT flow control it resolves immediately (loop enqueues all N before any
    // drain -> queue peaks at N); WITH it the loop suspends at the high-water mark.
    await producer.submit(new Event({ key: 'hot', eventId: `e${i}`, payload: 0, seq: i }));
  }
  producer.producerDone();
  await manager.whenDone();
  clearInterval(timer);
  return { processed, peakQueueSize };
}

// --- scenario 2: transient keys + eviction -----------------------------------

/**
 * Submit N keys with one event each; measure how many queue entries linger after everything drains.
 * @param {boolean} optimized - true = eviction on; false = queues accumulate.
 * @returns {Promise<{processed: number, retainedQueues: number, heapDelta: number}>}
 */
async function runTransientKeys(optimized) {
  const manager = new EventQueueManager({ evict: optimized });
  const producer = new Producer(manager);
  const consumer = new Consumer(manager, { log: silent });
  let processed = 0;
  consumer.on('consumed', () => { processed += 1; });
  consumer.subscribe();

  gc();
  const baseHeap = process.memoryUsage().heapUsed;
  for (let i = 0; i < N; i++) {
    await producer.submit(new Event({ key: `key-${i}`, eventId: `e${i}`, payload: 0, seq: i }));
  }
  producer.producerDone();
  await manager.whenDone();

  gc();
  return {
    processed,
    retainedQueues: manager.queueCount(),
    heapDelta: process.memoryUsage().heapUsed - baseHeap,
  };
}

// --- reporting ---------------------------------------------------------------

const { fgCyan, fgYellow, fgGreen, fgRed, reset } = consoleColors;
const paint = (c, s) => `${c}${s}${reset}`;

function header(title) {
  console.log('\n' + paint(fgYellow, title));
  console.log(paint(fgYellow, '─'.repeat(title.length)));
}

async function main() {
  logger.info(`Memory demo — Opt A (eviction + flow control).  N = ${N} events per run.`);
  if (typeof globalThis.gc !== 'function') {
    logger.warn('  (heap figures are a rough snapshot; re-run with `node --expose-gc src/demo-memory.js` for cleaner reads)');
  }

  // Scenario 1 — hot key + flow control.
  header('Scenario 1 — hot key flooded by a fast producer (flow-control gate)');
  const hotOff = await quiet(() => runHotKey(false));
  const hotOn = await quiet(() => runHotKey(true));
  console.log(`  WITHOUT backpressure : peak queue size = ${paint(fgRed, String(hotOff.peakQueueSize).padStart(6))}   (processed ${hotOff.processed}/${N})`);
  console.log(`  WITH    backpressure : peak queue size = ${paint(fgGreen, String(hotOn.peakQueueSize).padStart(6))}   (processed ${hotOn.processed}/${N})`);
  console.log(paint(fgCyan, `  => queue bounded at the high-water mark (${HIGH_WATER}) instead of growing to N (${N}); zero events dropped.`));

  // Scenario 2 — transient keys + eviction.
  header('Scenario 2 — many transient keys, one event each (empty-queue eviction)');
  const evOff = await quiet(() => runTransientKeys(false));
  const evOn = await quiet(() => runTransientKeys(true));
  console.log(`  WITHOUT eviction : retained queues after drain = ${paint(fgRed, String(evOff.retainedQueues).padStart(6))}   heap retained = ${mb(evOff.heapDelta)} MB   (processed ${evOff.processed}/${N})`);
  console.log(`  WITH    eviction : retained queues after drain = ${paint(fgGreen, String(evOn.retainedQueues).padStart(6))}   heap retained = ${mb(evOn.heapDelta)} MB   (processed ${evOn.processed}/${N})`);
  console.log(paint(fgCyan, `  => Map tracks O(active keys) (${evOn.retainedQueues}) instead of every key ever seen (${evOff.retainedQueues}).`));

  console.log('');
}

main().catch((err) => {
  logger.error(err.stack || String(err));
  process.exit(1);
});
