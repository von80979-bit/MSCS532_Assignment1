import { EventQueueManager } from './event-queue-manager.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';
import { Event } from './event.js';
import { consoleColors } from './support/logger.js';

/**
 * Live terminal visualizer for the Distributed Event Queue demo.
 *
 * This is a *driver + observer*, not a re-implementation: it stands up the real, unmodified
 * `EventQueueManager` / `Producer` / `Consumer` / `Event` and watches them run. The top of the screen shows
 * the orchestration as two cards — a PRODUCER card holding the event in hand and a MANAGER card showing the
 * routing/dispatch decision — with the current event animated as a token that slides PRODUCER → MANAGER and
 * then drops into the target queue. Below, three queues render each key's queue as INCOMING → PROCESSING →
 * FINISHED. State comes from two real signals: the manager's `event` emission (a head was dispatched →
 * PROCESSING, `payload` = work duration) and the consumer's `consumed` emission (acked → FINISHED).
 *
 * Run: `node src/demo-viz.js [--scale N]`  (default scale 10). `--scale` tunes processing speed; the
 * orchestration animation is paced separately by STEP_DWELL so the producer/manager handoff stays readable.
 */

// --- config -----------------------------------------------------------------

/** @returns {number} the time-scale multiplier applied to every payload (CLI `--scale N`, default 10). */
function parseScale() {
  const i = process.argv.indexOf('--scale');
  if (i !== -1 && process.argv[i + 1]) {
    const n = Number(process.argv[i + 1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 10;
}

const scaleMagnitude = parseScale();

// Duplicated from main.js on purpose (the viz is its own driver); base payloads are scaled below.
const input = [
  { key: 'queue-1', payload: 250, type: 'transaction-created', seq: 'transaction-1-0' },
  { key: 'queue-1', payload: 300, type: 'transaction-payment-confirmed', seq: 'transaction-1-1' },
  { key: 'queue-2', payload: 300, type: 'transaction-created', seq: 'transaction-2-0' },
  { key: 'queue-3', payload: 500, type: 'transaction-created', seq: 'transaction-3-0' },
  { key: 'queue-2', payload: 340, type: 'transaction-payment-confirmed', seq: 'transaction-2-1' },
  { key: 'queue-3', payload: 480, type: 'transaction-payment-confirmed', seq: 'transaction-3-1' },
  { key: 'queue-1', payload: 350, type: 'inventory-dispatched', seq: 'transaction-1-2' },
  { key: 'queue-3', payload: 510, type: 'inventory-dispatched', seq: 'transaction-3-2' },
  { key: 'queue-2', payload: 320, type: 'inventory-dispatched', seq: 'transaction-2-2' },
  { key: 'queue-3', payload: 510, type: 'transaction-shipped', seq: 'transaction-3-3' },
  { key: 'queue-1', payload: 420, type: 'transaction-shipped', seq: 'transaction-1-3' },
  { key: 'queue-2', payload: 320, type: 'transaction-shipped', seq: 'transaction-2-3' },
];

const QUEUE_KEYS = ['queue-1', 'queue-2', 'queue-3'];

// Basic ANSI codes (via the project's own logger palette) — consistent with what the consumer prints.
const C = {
  red: consoleColors.fgRed,
  green: consoleColors.fgGreen,
  magenta: consoleColors.fgMagenta,
  amber: consoleColors.fgYellow,
};
const QUEUE_COLOR = { 'queue-1': C.red, 'queue-2': C.green, 'queue-3': C.magenta };
const COLOR_NAME = { 'queue-1': 'red', 'queue-2': 'green', 'queue-3': 'magenta' };

// Queue geometry
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
const STEP_DWELL = 350;           // ms per orchestration beat (paced independently of --scale)
const TOKEN = (seq) => `[${seq}]`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

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

// --- observed / orchestration state -----------------------------------------

/** Per-queue view model: incoming (submitted, not yet dispatched), the single in-flight head, finished. */
const queues = new Map(
  QUEUE_KEYS.map((key) => [key, { incoming: [], processing: null, startedAt: 0, finished: [] }])
);
const maxQueue = Math.max(...QUEUE_KEYS.map((k) => input.filter((e) => e.key === k).length));

/** Live handles so the renderer can read real manager stats (pending / queue count). */
let mgr = null;

/** Text shown in the PRODUCER and MANAGER cards. */
const orchestration = {
  producer: { holding: '—', type: '', submitted: 0 },
  manager: { route: '—', dispatched: '—' },
};

/** The animated token: which event is mid-flight and where it is. */
const flight = { active: false, key: null, seq: '', phase: 'idle', startedAt: 0 };
const progress = () => Math.min(1, Math.max(0, (Date.now() - flight.startedAt) / STEP_DWELL));

// --- rendering: queues -------------------------------------------------------

const stdout = process.stdout;
const queueCenter = (i) => i * (LW + GAPN) + Math.floor(LW / 2);

/** Build the boxed, colored block of lines for one queue (all queues share the same line count). */
function renderQueue(key) {
  const color = QUEUE_COLOR[key];
  const queue = queues.get(key);
  const rows = [];

  const border = (l, m, r) => paint(color, l + m.repeat(INNER + 2) + r);
  const line = (text) => paint(color, `│ ${fit(text)} │`);

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
    const prog = e.payload > 0 ? Math.min(1, (Date.now() - queue.startedAt) / e.payload) : 1;
    const filled = Math.round(prog * BAR);
    const bar = '█'.repeat(filled) + '░'.repeat(BAR - filled);
    rows.push(line(`▶ ${shortSeq(e)}  ${shortType(e)}`));
    rows.push(line(`  ${bar} ${String(Math.round(prog * 100)).padStart(3)}%`));
  } else {
    rows.push(line('  —'));
    rows.push(line(''));
  }

  rows.push(line('FINISHED'));
  for (let i = 0; i < maxQueue; i++) {
    const e = queue.finished[i];
    rows.push(line(e ? `  ✓ ${shortSeq(e)}  ${shortType(e)}` : ''));
  }

  const total = queue.finished.length + queue.incoming.length + (queue.processing ? 1 : 0);
  rows.push(line(`done: ${queue.finished.length} / ${total}`));
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
    `pending: ${mgr ? mgr.pending() : 0}    queues: ${mgr ? mgr.queueCount() : 0}`,
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
  lines.push(paint(C.amber, 'Distributed Event Queue — Live Demo') + `   scale=${scaleMagnitude}`);
  lines.push('same key → go to same queue with strict FIFO order   ·   different keys → run concurrently');
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

/** Print the one-time intro + legend and wait for Enter (the "run" trigger). */
function intro() {
  const p = (c, s) => paint(c, s);
  const legend =
    `Legend:  ▶ processing   ✓ finished   ███ progress (simulated work / sleep)\n` +
    `Queues:   ${p(QUEUE_COLOR['queue-1'], 'queue-1 (red)')}   ` +
    `${p(QUEUE_COLOR['queue-2'], 'queue-2 (green)')}   ` +
    `${p(QUEUE_COLOR['queue-3'], 'queue-3 (magenta)')}`;

  stdout.write(
    CLEAR + HOME +
    p(C.amber, 'Distributed Event Queue — Live Demo') + '\n\n' +
    'Each event carries a key. The producer submits events one at a time; the manager\n' +
    'routes each one (hash map keyed by `key`) into that key\'s own FIFO queue. Watch the\n' +
    'token travel PRODUCER → MANAGER → its queue, then process: same-key events run in\n' +
    'strict submit order while different keys run concurrently on a single event loop.\n\n' +
    legend + '\n\n' +
    `scale=${scaleMagnitude}  (payloads ×${scaleMagnitude}; ≈${estimateSeconds()}s of processing)\n\n` +
    'Press Enter to start…'
  );

  return new Promise((resolve) => {
    const onData = () => { process.stdin.pause(); process.stdin.off('data', onData); resolve(); };
    process.stdin.resume();
    process.stdin.once('data', onData);
  });
}

/** Rough estimate: the slowest queue's summed (scaled) payloads, since queues run concurrently. */
function estimateSeconds() {
  const perQueue = QUEUE_KEYS.map((k) =>
    input.filter((e) => e.key === k).reduce((s, e) => s + e.payload * scaleMagnitude, 0)
  );
  return Math.round(Math.max(...perQueue) / 1000);
}

async function run() {
  await intro();

  const manager = new EventQueueManager();
  const producer = new Producer(manager);
  const consumer = new Consumer(manager);
  mgr = manager;
  consumer.subscribe();

  // Observe the real stream. `event` = dispatched head → PROCESSING; `consumed` = acked → FINISHED.
  manager.on('event', (event) => {
    const queue = queues.get(event.key);
    queue.incoming = queue.incoming.filter((e) => e !== event);
    queue.processing = event;
    queue.startedAt = Date.now();
    orchestration.manager.dispatched = `${event.key}  ${shortSeq(event)}`;
  });
  consumer.on('consumed', (event) => {
    const queue = queues.get(event.key);
    if (queue.processing === event) queue.processing = null;
    queue.finished.push(event);
  });

  // Silence the consumer's own console output so it can't corrupt the redraw (src stays untouched).
  const realLog = console.log;
  const realErr = console.error;
  console.log = () => {};
  console.error = () => {};

  stdout.write(HIDE_CURSOR + CLEAR);
  const events = input.map((spec, idx) =>
    new Event({ ...spec, payload: spec.payload * scaleMagnitude, eventId: `${spec.key}-${idx}` })
  );
  const timer = setInterval(render, 150);
  render();

  // Paced, animated submission: each event is held by the producer, slides to the manager (which routes it
  // by key), then drops into its queue. The real submit fires on landing; the real manager then dispatches
  // the head on process.nextTick, so early queues start processing while later events are still streaming in.
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
    producer.submit(e);                // real submit → real manager.enqueue → real dispatch
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
  // queueCount is 0 here now that drained queues are evicted (Opt A); report distinct keys seen instead.
  stdout.write(SHOW_CURSOR + '\n' +
    paint(C.amber, `✓ all ${manager.keysSeenCount()} queues drained — ${input.length} events processed, pending=${manager.pending()}`) +
    '\n');
}

run().catch((err) => {
  process.stdout.write(SHOW_CURSOR);
  console.error(err.stack || String(err));
  process.exit(1);
});
