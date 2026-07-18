import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';
import { consoleColors } from './support/logger.js';

/**
 * Live terminal visualizer for Opt B — recoverability (Phase 3, Demo 2).
 *
 * Same shape as `demo-viz.js` (a driver + observer over the real, unmodified
 * `EventQueueManager` / `Producer` / `Consumer` / `Event`), extended to show recovery. Each queue box gains an
 * attempt counter on the in-flight head, an amber BACKOFF countdown bar while a failed head waits to be redelivered,
 * and a DEAD-LETTER row listing events that exhausted their attempts. Two failure sources drive it:
 *   - Transient flakiness: every delivery fails with probability FAILURE_RATE (0.2) — the outline's config. These are
 *     almost always redelivered successfully, so they exercise retry-with-backoff.
 *   - Poison pills: a couple of events (marked `poison`) fail every attempt. Natural exhaustion at 0.2^5 ≈ 0.03% is
 *     far too rare to ever show a dead-letter, so the poison pills guarantee the `dlq` populates (the classic
 *     dead-letter scenario: a message that can never be processed).
 *
 * A retrying head never lets the next event pass it (strict FIFO), and one queue backing off never stalls another.
 *
 * Run: `node src/demo-recovery.js [--scale N]`  (default scale 8; `--scale` tunes processing speed).
 */

// --- config -----------------------------------------------------------------

/** @returns {number} the time-scale multiplier applied to every payload (CLI `--scale N`, default 8). */
function parseScale() {
  const i = process.argv.indexOf('--scale');
  if (i !== -1 && process.argv[i + 1]) {
    const n = Number(process.argv[i + 1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 8;
}

const scaleMagnitude = parseScale();

const FAILURE_RATE = 0.2;   // transient failure probability per delivery attempt (outline config)
const MAX_ATTEMPTS = 5;     // deliveries before an event is dead-lettered
const BACKOFF_BASE = 350;   // ms; small so the demo finishes quickly while the backoff stays visible
const BACKOFF_CAP = 30000;  // ms (30s ceiling)

// Its own driver (like demo-viz). `poison: true` marks an event that fails every attempt -> it exhausts into the dlq.
const input = [
  { key: 'queue-1', payload: 250, type: 'transaction-created', seq: 'transaction-1-0' },
  { key: 'queue-1', payload: 300, type: 'transaction-payment-confirmed', seq: 'transaction-1-1' },
  { key: 'queue-1', payload: 350, type: 'inventory-dispatched', seq: 'transaction-1-2' },
  { key: 'queue-2', payload: 300, type: 'transaction-created', seq: 'transaction-2-0' },
  { key: 'queue-2', payload: 320, type: 'payment-declined', seq: 'transaction-2-1', poison: true },
  { key: 'queue-2', payload: 340, type: 'inventory-dispatched', seq: 'transaction-2-2' },
  { key: 'queue-3', payload: 500, type: 'transaction-created', seq: 'transaction-3-0' },
  { key: 'queue-3', payload: 480, type: 'transaction-payment-confirmed', seq: 'transaction-3-1' },
  { key: 'queue-3', payload: 300, type: 'malformed-address', seq: 'transaction-3-2', poison: true },
  { key: 'queue-3', payload: 510, type: 'transaction-shipped', seq: 'transaction-3-3' },
];

const QUEUE_KEYS = ['queue-1', 'queue-2', 'queue-3'];
const poisonIds = new Set();

// Basic ANSI codes (via the project's own logger palette) — consistent with what the consumer prints.
const C = {
  red: consoleColors.fgRed,
  green: consoleColors.fgGreen,
  magenta: consoleColors.fgMagenta,
  amber: consoleColors.fgYellow,
  cyan: consoleColors.fgCyan,
};
const QUEUE_COLOR = { 'queue-1': C.red, 'queue-2': C.green, 'queue-3': C.magenta };
const COLOR_NAME = { 'queue-1': 'red', 'queue-2': 'green', 'queue-3': 'magenta' };

// Queue geometry (shared with demo-viz for a consistent look).
const INNER = 34;                 // printable width inside each queue box
const BAR = 22;                   // progress-bar cell count
const LW = INNER + 4;             // full queue-block width (title row width)
const GAPN = 2;                   // columns between queues
const FW = QUEUE_KEYS.length * LW + (QUEUE_KEYS.length - 1) * GAPN; // full dashboard width

// Top-panel geometry: PRODUCER card | arrow track | MANAGER card, summing to FW.
const WP = 30;                    // producer card width
const WA = 12;                    // arrow-track width (token slides here)
const WM = FW - WP - WA - 2 * GAPN; // manager card width fills the rest

const CONNECTOR_H = 4;            // rows of vertical arrow (│ shaft) below the panel, ending in a ▼ head
const STEP_DWELL = 320;           // ms per orchestration beat (paced independently of --scale)
const TOKEN = (seq) => `[${seq}]`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Section heights.
const maxQueue = Math.max(...QUEUE_KEYS.map((k) => input.filter((e) => e.key === k).length));
const maxDlq = Math.max(1, ...QUEUE_KEYS.map((k) => input.filter((e) => e.key === k && e.poison).length));

// --- ansi helpers -----------------------------------------------------------

const { reset } = consoleColors;
const HOME = '\x1b[H';
const CLEAR = '\x1b[2J';
const CLEAR_DOWN = '\x1b[0J';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

/** Pad or truncate `s` to exactly `w` printable columns (…-elided when too long). */
function fit(s, w = INNER) {
  s = String(s);
  if (s.length > w) return s.slice(0, Math.max(0, w - 1)) + '…';
  return s + ' '.repeat(w - s.length);
}

/** Wrap `s` in a color, resetting after (safe for width math: applied to already-padded text). */
function paint(color, s) {
  return `${color}${s}${reset}`;
}

/** Display-only compaction: drop the repeated `transaction-` prefix so cards fit the queue width. */
const shortSeq = (e) => e.seq.replace('transaction-', '');
const shortType = (e) => e.type.replace('transaction-', '');
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// --- observed / orchestration state -----------------------------------------

/**
 * Per-queue view model: incoming (submitted, not yet dispatched), the single in-flight head with its attempt number
 * and backoff window, finished, and a running retry tally. The dead-letter list is read live from the manager.
 */
const queues = new Map(
  QUEUE_KEYS.map((key) => [key, {
    incoming: [], processing: null, startedAt: 0, attempt: 0,
    backoffUntil: 0, backoffTotal: 0, retries: 0, finished: [],
  }])
);

/** Live handles so the renderer can read real manager stats (pending / dead-letter counts). */
let mgr = null;

/** Text shown in the PRODUCER and MANAGER cards. */
const orchestration = {
  producer: { holding: '—', type: '', submitted: 0 },
  manager: { route: '—', dispatched: '—' },
};

/** The animated token: which event is mid-flight and where it is. */
const flight = { active: false, key: null, seq: '', phase: 'idle', startedAt: 0 };
const progress = () => clamp01((Date.now() - flight.startedAt) / STEP_DWELL);

/** @returns {number} expected backoff (ms) for the Nth attempt — mirrors the manager, for the countdown display. */
const backoffFor = (attempt) => Math.min(BACKOFF_CAP, BACKOFF_BASE * 2 ** (attempt - 1));

// --- rendering: queues -------------------------------------------------------

const stdout = process.stdout;
const queueCenter = (i) => i * (LW + GAPN) + Math.floor(LW / 2);

/** Build the boxed, colored block of lines for one queue (all queues share the same line count). */
function renderQueue(key) {
  const color = QUEUE_COLOR[key];
  const queue = queues.get(key);
  const dlq = mgr ? mgr.dlq(key) : [];
  const rows = [];

  const border = (l, m, r) => paint(color, l + m.repeat(INNER + 2) + r);
  const line = (text) => paint(color, `│ ${fit(text)} │`);
  const lineRaw = (painted, plain) => paint(color, '│ ') + painted + paint(color, `${' '.repeat(Math.max(0, INNER - plain.length))} │`);

  rows.push(paint(color, fit(`${key} (${COLOR_NAME[key]})`, LW)));
  rows.push(border('┌', '─', '┐'));

  rows.push(line('INCOMING'));
  for (let i = 0; i < maxQueue; i++) {
    const e = queue.incoming[i];
    rows.push(line(e ? `  ${shortSeq(e)}  ${shortType(e)}` : ''));
  }

  rows.push(line('PROCESSING'));
  if (queue.processing) {
    const e = queue.processing;
    const now = Date.now();
    if (queue.backoffUntil > now) {
      // Backing off: an amber countdown bar filling toward the next redelivery.
      const prog = clamp01(1 - (queue.backoffUntil - now) / (queue.backoffTotal || 1));
      const filled = Math.round(prog * BAR);
      const bar = '█'.repeat(filled) + '░'.repeat(BAR - filled);
      const secs = ((queue.backoffUntil - now) / 1000).toFixed(1);
      const head = `⚠ ${shortSeq(e)}  ${shortType(e)}  att ${queue.attempt}/${MAX_ATTEMPTS} FAILED`;
      rows.push(lineRaw(paint(C.amber, fit(head)), fit(head)));
      const backoff = `  ${bar} retry in ${secs}s`;
      rows.push(lineRaw(paint(C.amber, fit(backoff)), fit(backoff)));
    } else {
      const prog = e.payload > 0 ? clamp01((now - queue.startedAt) / e.payload) : 1;
      const filled = Math.round(prog * BAR);
      const bar = '█'.repeat(filled) + '░'.repeat(BAR - filled);
      rows.push(line(`▶ ${shortSeq(e)}  ${shortType(e)}  att ${queue.attempt}/${MAX_ATTEMPTS}`));
      rows.push(line(`  ${bar} ${String(Math.round(prog * 100)).padStart(3)}%`));
    }
  } else {
    rows.push(line('  —'));
    rows.push(line(''));
  }

  rows.push(line('FINISHED'));
  for (let i = 0; i < maxQueue; i++) {
    const e = queue.finished[i];
    rows.push(line(e ? `  ✓ ${shortSeq(e)}  ${shortType(e)}` : ''));
  }

  rows.push(lineRaw(paint(C.amber, fit('DEAD-LETTER')), fit('DEAD-LETTER')));
  for (let i = 0; i < maxDlq; i++) {
    const e = dlq[i];
    if (e) {
      const txt = `  ☠ ${shortSeq(e)}  ${shortType(e)}`;
      rows.push(lineRaw(paint(C.amber, fit(txt)), fit(txt)));
    } else {
      rows.push(line(''));
    }
  }

  const total = queue.finished.length + queue.incoming.length + (queue.processing ? 1 : 0) + dlq.length;
  rows.push(line(`done: ${queue.finished.length} / ${total}   retries: ${queue.retries}   dlq: ${dlq.length}`));
  rows.push(border('└', '─', '┘'));
  return rows;
}

// --- rendering: top panel (producer / manager cards + arrow + drop) ---------

/** A fixed-width card: colored title row, plain content rows, bottom border. Height = content + 2. */
function card(title, contentLines, w) {
  const t = ` ${title} `;
  const rows = [paint(C.amber, '┌' + t + '─'.repeat(Math.max(0, w - 2 - t.length)) + '┐')];
  for (const text of contentLines) rows.push('│' + fit(' ' + text, w - 2) + '│');
  rows.push('└' + '─'.repeat(w - 2) + '┘');
  return rows;
}

/** The horizontal arrow track between the cards, with the token sliding across during the toManager beat. */
function arrowRow() {
  const chars = ('─'.repeat(WA - 1) + '▶').split('');
  let tStart = -1;
  let tEnd = -1;
  if (flight.active && flight.phase === 'toManager') {
    const tok = TOKEN(flight.seq);
    const pos = Math.min(WA - tok.length, Math.max(0, Math.round(progress() * (WA - tok.length))));
    for (let k = 0; k < tok.length; k++) chars[pos + k] = tok[k];
    tStart = pos;
    tEnd = pos + tok.length;
  }
  const plain = chars.join('');
  if (tStart < 0) return plain;
  return plain.slice(0, tStart) + paint(QUEUE_COLOR[flight.key], plain.slice(tStart, tEnd)) + plain.slice(tEnd);
}

/**
 * One row of the vertical arrow below the cards: a `│` shaft under each queue, or a `▼` head on the last
 * row, plus the token dropping down the shaft into its queue during the drop beat.
 */
function connectorRow(rowIndex) {
  const cells = new Array(FW).fill(' ');
  const glyph = rowIndex === CONNECTOR_H - 1 ? '▼' : '│';
  QUEUE_KEYS.forEach((k, i) => { cells[queueCenter(i)] = paint(QUEUE_COLOR[k], glyph); });

  if (flight.active && flight.phase === 'drop') {
    const activeRow = Math.min(CONNECTOR_H - 1, Math.floor(progress() * CONNECTOR_H));
    if (rowIndex === activeRow) {
      const c = queueCenter(QUEUE_KEYS.indexOf(flight.key));
      const tok = TOKEN(flight.seq);
      const start = c - Math.floor(tok.length / 2);
      for (let k = 0; k < tok.length; k++) {
        const idx = start + k;
        if (idx >= 0 && idx < FW) cells[idx] = paint(QUEUE_COLOR[flight.key], tok[k]);
      }
    }
  }
  return cells.join('');
}

/** Assemble PRODUCER card + arrow track + MANAGER card into a row of blocks. */
function topPanel() {
  const p = orchestration.producer;
  const m = orchestration.manager;
  const producer = card('PRODUCER', [
    `holding:  ${p.holding}`,
    `          ${p.type}`,
    `submitted:  ${p.submitted} / ${input.length}`,
  ], WP);
  const manager = card('MANAGER · dispatcher', [
    `route by key  →  ${m.route}`,
    `pending: ${mgr ? mgr.pending() : 0}    dead-lettered: ${mgr ? mgr.dlqCount() : 0}`,
    `dispatch head →  ${m.dispatched}`,
  ], WM);

  const rows = [];
  for (let r = 0; r < producer.length; r++) {
    const mid = r === 2 ? arrowRow() : ' '.repeat(WA);
    rows.push(producer[r] + ' '.repeat(GAPN) + mid + ' '.repeat(GAPN) + manager[r]);
  }
  return rows;
}

/** Repaint the whole dashboard. */
function render() {
  const lines = [];
  lines.push(paint(C.amber, 'Distributed Event Queue — Recovery Demo (Opt B)') + `   scale=${scaleMagnitude}`);
  lines.push(`redelivery + exponential backoff (base ${BACKOFF_BASE}ms, cap ${BACKOFF_CAP / 1000}s, max ${MAX_ATTEMPTS} attempts)   ·   ${FAILURE_RATE * 100}% transient failure/attempt`);
  lines.push('a failing head is retried in place (FIFO holds)  ·  poison events exhaust into the dead-letter list  ·  other queues never stall');
  lines.push('');
  lines.push(...topPanel());
  for (let r = 0; r < CONNECTOR_H; r++) lines.push(connectorRow(r));

  const blocks = QUEUE_KEYS.map(renderQueue);
  for (let r = 0; r < blocks[0].length; r++) {
    lines.push(blocks.map((b) => b[r]).join(' '.repeat(GAPN)));
  }
  stdout.write(HOME + lines.join('\n') + '\n' + CLEAR_DOWN);
}

// --- intro / lifecycle ------------------------------------------------------

/** Print the one-time intro + legend and wait for Enter (auto-starts when stdin is not a TTY). */
function intro() {
  const p = (c, s) => paint(c, s);
  const legend =
    `Legend:  ▶ processing   ${p(C.amber, '⚠ backing off / retrying')}   ✓ finished   ${p(C.amber, '☠ dead-lettered')}\n` +
    `Queues:   ${p(QUEUE_COLOR['queue-1'], 'queue-1 (red)')}   ` +
    `${p(QUEUE_COLOR['queue-2'], 'queue-2 (green)')}   ` +
    `${p(QUEUE_COLOR['queue-3'], 'queue-3 (magenta)')}`;

  stdout.write(
    CLEAR + HOME +
    p(C.amber, 'Distributed Event Queue — Recovery Demo (Opt B)') + '\n\n' +
    'Same distributed queue as the main viz, now under failure. Each delivery may fail\n' +
    `(${FAILURE_RATE * 100}% per attempt); a failed head is redelivered in place after an exponential\n` +
    'backoff, up to 5 attempts, so transient failures self-heal while strict per-key\n' +
    'order still holds. A couple of poison events fail every attempt and, once exhausted,\n' +
    'are moved to their queue\'s DEAD-LETTER list — while every other queue keeps running.\n\n' +
    legend + '\n\n' +
    `scale=${scaleMagnitude}  (payloads ×${scaleMagnitude})\n\n` +
    (process.stdin.isTTY ? 'Press Enter to start…' : 'Starting…')
  );

  if (!process.stdin.isTTY) return Promise.resolve();
  return new Promise((resolve) => {
    const onData = () => { process.stdin.pause(); process.stdin.off('data', onData); resolve(); };
    process.stdin.resume();
    process.stdin.once('data', onData);
  });
}

async function run() {
  await intro();

  const manager = new EventQueueManager({
    maxAttempts: MAX_ATTEMPTS, backoffBase: BACKOFF_BASE, backoffCap: BACKOFF_CAP,
  });
  const producer = new Producer(manager);
  const consumer = new Consumer(manager, {
    // A delivery fails if the event is a poison pill, or by the transient failure rate.
    fail: (e) => poisonIds.has(e.eventId) || Math.random() < FAILURE_RATE,
  });
  mgr = manager;
  consumer.subscribe();

  // Observe the real stream. `event` = a head dispatched (attempt = attempts+1) → PROCESSING; `failed` = a nack
  // (retry parked with backoff, or dead-lettered on the final attempt); `consumed` = acked → FINISHED.
  manager.on('event', (event) => {
    const queue = queues.get(event.key);
    queue.incoming = queue.incoming.filter((e) => e !== event);
    queue.processing = event;
    queue.attempt = event.attempts + 1;
    queue.startedAt = Date.now();
    queue.backoffUntil = 0;
    orchestration.manager.dispatched = `${event.key}  ${shortSeq(event)} (att ${queue.attempt})`;
  });
  consumer.on('failed', (event) => {
    const queue = queues.get(event.key);
    queue.retries += 1;
    if (event.attempts >= MAX_ATTEMPTS) {
      queue.processing = null;            // exhausted → manager moved it to the dlq; the queue advances
      queue.backoffUntil = 0;
    } else {
      queue.backoffTotal = backoffFor(event.attempts);
      queue.backoffUntil = Date.now() + queue.backoffTotal; // parked, waiting for redelivery
    }
  });
  consumer.on('consumed', (event) => {
    const queue = queues.get(event.key);
    if (queue.processing === event) queue.processing = null;
    queue.backoffUntil = 0;
    queue.finished.push(event);
  });

  // Silence the consumer's own console output so it can't corrupt the redraw (src stays untouched).
  const realLog = console.log;
  const realErr = console.error;
  console.log = () => {};
  console.error = () => {};

  stdout.write(HIDE_CURSOR + CLEAR);
  const events = input.map((spec, idx) => {
    const eventId = `${spec.key}-${idx}`;
    if (spec.poison) poisonIds.add(eventId);
    return new Event({
      key: spec.key, eventId, payload: spec.payload * scaleMagnitude, type: spec.type, seq: spec.seq,
    });
  });
  const timer = setInterval(render, 120);
  render();

  // Paced, animated submission: each event is held by the producer, slides to the manager (which routes it by key),
  // then drops into its queue. The real submit fires on landing; retries/backoffs then play out on their own timers.
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    orchestration.producer = { holding: shortSeq(e), type: shortType(e), submitted: i + 1 };
    flight.key = e.key; flight.seq = shortSeq(e); flight.active = true;

    flight.phase = 'toManager'; flight.startedAt = Date.now();
    await wait(STEP_DWELL);

    orchestration.manager.route = e.key;
    flight.phase = 'drop'; flight.startedAt = Date.now();
    await wait(STEP_DWELL);

    queues.get(e.key).incoming.push(e); // reflect the enqueue in the queue's INCOMING
    await producer.submit(e);           // real submit → real manager.enqueue → real dispatch
    flight.active = false;
  }
  producer.producerDone();
  orchestration.producer = { holding: 'done', type: '', submitted: events.length };
  orchestration.manager.route = 'producerDone — draining';

  await manager.whenDone();
  clearInterval(timer);
  orchestration.manager.route = 'all queues drained';
  render();

  console.log = realLog;
  console.error = realErr;

  const consumed = [...queues.values()].reduce((s, q) => s + q.finished.length, 0);
  const retries = [...queues.values()].reduce((s, q) => s + q.retries, 0);
  const dead = manager.dlqCount();
  const ok = consumed + dead === events.length;
  stdout.write(SHOW_CURSOR + '\n' +
    paint(ok ? C.green : C.red,
      `✓ recovery complete — ${consumed} consumed + ${dead} dead-lettered = ${events.length} submitted` +
      `  (${retries} redeliveries, ${MAX_ATTEMPTS}-attempt cap); conservation ${ok ? 'holds' : 'FAILED'}.`) +
    '\n');
}

run().catch((err) => {
  process.stdout.write(SHOW_CURSOR);
  console.error(err.stack || String(err));
  process.exit(1);
});
