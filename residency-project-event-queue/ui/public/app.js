// Lightweight, dependency-free view over the event-queue SSE stream published
// by ui/server.js. Each ordering key gets one track (one row). A token is a
// literal moving DOM element: it starts at the track's left edge and glides
// to the right over the event's real payload duration (`left` transitions,
// duration set inline per-token), so motion itself demonstrates processing —
// not a static bar fill. Only one token travels per track at a time (mirrors
// the manager's one-in-flight-per-key rule); the rest wait as dots in the
// FIFO stack left of the track. Multiple tracks travel simultaneously and
// independently, which is what makes cross-key concurrency visible at a
// glance, while a single track only ever moves one token at a time, which is
// what makes same-key ordering visible.

// Fixed categorical order from the validated production palette (8 hues,
// CVD-safe adjacent pairs — see dataviz skill references/palette.md). Keys
// are assigned the next unused slot in this order the first time they're
// seen, then keep that color for the run — identity follows the entity, the
// order itself is never reshuffled.
const CATEGORICAL_ORDER = [
  '#2a78d6', // blue
  '#008300', // green
  '#e87ba4', // magenta
  '#eda100', // yellow
  '#1baf7a', // aqua
  '#eb6834', // orange
  '#4a3aa7', // violet
  '#e34948', // red
];
let nextSlot = 0;
const assignedColors = new Map();

const lanesEl = document.getElementById('lanes');
const logEl = document.getElementById('log');
const bannerEl = document.getElementById('banner');
const runBtn = document.getElementById('run-btn');

/** @type {Map<string, {el: HTMLElement, waitingStack: HTMLElement, track: HTMLElement, doneStack: HTMLElement, counts: HTMLElement, queuedCount: number, doneCount: number, currentEventId: string|null}>} */
const lanes = new Map();

function colorFor(key) {
  if (!assignedColors.has(key)) {
    assignedColors.set(key, CATEGORICAL_ORDER[nextSlot++ % CATEGORICAL_ORDER.length]);
  }
  return assignedColors.get(key);
}

function shortLabel(text) {
  return text.replace(/^transaction-/, '');
}

function ensureLane(key) {
  let lane = lanes.get(key);
  if (lane) return lane;

  const el = document.createElement('div');
  el.className = 'lane';
  el.style.setProperty('--lane-color', colorFor(key));
  el.innerHTML = `
    <div class="lane-header">
      <span class="dot" style="background:${colorFor(key)}"></span>
      <span>${key}</span>
      <span class="lane-counts">0 waiting &middot; 0 done</span>
    </div>
    <div class="lane-row">
      <div class="waiting-stack"></div>
      <div class="track"><div class="track-line"></div></div>
      <div class="done-stack"></div>
    </div>
  `;
  lanesEl.appendChild(el);

  lane = {
    el,
    waitingStack: el.querySelector('.waiting-stack'),
    track: el.querySelector('.track'),
    doneStack: el.querySelector('.done-stack'),
    counts: el.querySelector('.lane-counts'),
    queuedCount: 0,
    doneCount: 0,
    currentEventId: null,
  };
  lanes.set(key, lane);
  return lane;
}

function updateCounts(lane) {
  lane.counts.textContent = `${lane.queuedCount} waiting · ${lane.doneCount} done`;
}

function appendLog(text) {
  const line = document.createElement('div');
  line.textContent = text;
  logEl.appendChild(line);
  while (logEl.children.length > 200) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}

function resetView() {
  lanes.clear();
  lanesEl.innerHTML = '';
  logEl.innerHTML = '';
  bannerEl.classList.remove('show');
  bannerEl.textContent = '';
  nextSlot = 0;
  assignedColors.clear();
}

function onQueued(msg) {
  const lane = ensureLane(msg.key);
  const dot = document.createElement('span');
  dot.className = 'waiting-dot';
  dot.dataset.eventId = msg.eventId;
  dot.title = `${msg.eventType} (${msg.seq})`;
  lane.waitingStack.appendChild(dot);
  lane.queuedCount += 1;
  updateCounts(lane);
  appendLog(`queued    ${msg.key} / ${msg.eventType} (${msg.seq})`);
}

function onProcessing(msg) {
  const lane = ensureLane(msg.key);
  const dot = lane.waitingStack.querySelector(`[data-event-id="${msg.eventId}"]`);
  if (dot) {
    dot.remove();
    lane.queuedCount = Math.max(0, lane.queuedCount - 1);
    updateCounts(lane);
  }

  // Defensive: a track must only ever show one token. If the previous
  // occupant's done-cleanup timeout hasn't fired yet (back-to-back events on
  // the same key), clear it now rather than letting it orphan in the DOM.
  lane.track.querySelectorAll('.token').forEach((stale) => stale.remove());

  lane.currentEventId = msg.eventId;
  const token = document.createElement('div');
  token.className = 'token';
  token.dataset.eventId = msg.eventId;
  token.innerHTML = `<span class="label">${shortLabel(msg.eventType)}</span><span class="seq">${shortLabel(msg.seq)}</span>`;
  lane.track.appendChild(token);

  token.style.left = '6px';
  token.style.transitionDuration = `${msg.payloadMs}ms`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    token.style.left = 'calc(100% - 140px)';
  }));
  appendLog(`processing ${msg.key} / ${msg.eventType} (${msg.seq}) — ${msg.payloadMs}ms`);
}

function onDone(msg) {
  const lane = ensureLane(msg.key);
  const token = lane.track.querySelector(`[data-event-id="${msg.eventId}"]`);
  if (token) {
    token.classList.add('done');
    token.style.transitionDuration = '150ms';
    token.style.left = 'calc(100% - 140px)';
  }
  lane.doneCount += 1;
  updateCounts(lane);

  const check = document.createElement('span');
  check.className = 'check';
  check.title = `${msg.eventType} (${msg.seq})`;
  check.textContent = '✓';
  lane.doneStack.appendChild(check);

  // Bound to this exact element (not lane.currentEventId) so a fast-arriving
  // next event can't leave this one's cleanup pointing at the wrong token.
  if (token) {
    setTimeout(() => {
      token.remove();
      if (lane.currentEventId === msg.eventId) lane.currentEventId = null;
    }, 400);
  }

  appendLog(`done      ${msg.key} / ${msg.eventType} (${msg.seq})`);
}

function onComplete(msg) {
  bannerEl.textContent = `All ${msg.queueCount} queues drained · pending ${msg.pending}`;
  bannerEl.classList.add('show');
  runBtn.disabled = false;
  appendLog(`=== all ${msg.queueCount} queues drained; pending=${msg.pending} ===`);
}

const source = new EventSource('/stream');
source.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  switch (msg.state) {
    case 'reset': resetView(); break;
    case 'queued': onQueued(msg); break;
    case 'processing': onProcessing(msg); break;
    case 'done': onDone(msg); break;
    case 'complete': onComplete(msg); break;
  }
};

runBtn.addEventListener('click', () => {
  runBtn.disabled = true;
  fetch('/run', { method: 'POST' }).catch(() => {
    runBtn.disabled = false;
  });
});
