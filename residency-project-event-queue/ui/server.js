import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { EventQueueManager } from '../src/event-queue-manager.js';
import { Producer } from '../src/producer.js';
import { Consumer } from '../src/consumer.js';
import { Event } from '../src/event.js';

/**
 * Standalone visualization server. Reuses the real EventQueueManager/Producer/Consumer
 * from src/ untouched, and rebroadcasts their existing emissions (`event`, `consumed`,
 * `done`) plus a `queued` marker (raised here, at submit time) to any connected browser
 * over Server-Sent Events. No third-party deps: plain http + EventSource.
 */

const PUBLIC_DIR = resolvePath(fileURLToPath(new URL('.', import.meta.url)), 'public');
const PORT = process.env.PORT || 4173;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const scaleMagnitude = 10;
// Same input the CLI demo (src/main.js) submits, kept local so the UI driver
// doesn't reach into main.js's module body.
const INPUT = [
  { key: 'queue-1', payload: 250 * scaleMagnitude, type: 'transaction-created', seq: 'transaction-1-0' },
  { key: 'queue-1', payload: 300 * scaleMagnitude, type: 'transaction-payment-confirmed', seq: 'transaction-1-1' },
  { key: 'queue-1', payload: 350 * scaleMagnitude, type: 'inventory-dispatched', seq: 'transaction-1-2' },
  { key: 'queue-2', payload: 300 * scaleMagnitude, type: 'transaction-created', seq: 'transaction-2-0' },
  { key: 'queue-3', payload: 500 * scaleMagnitude, type: 'transaction-created', seq: 'transaction-3-0' },
  { key: 'queue-3', payload: 480 * scaleMagnitude, type: 'transaction-payment-confirmed', seq: 'transaction-3-1' },
  { key: 'queue-3', payload: 510 * scaleMagnitude, type: 'inventory-dispatched', seq: 'transaction-3-2' },
  { key: 'queue-2', payload: 340 * scaleMagnitude, type: 'transaction-payment-confirmed', seq: 'transaction-2-1' },
  { key: 'queue-1', payload: 420 * scaleMagnitude, type: 'transaction-shipped', seq: 'transaction-1-3' },
  { key: 'queue-2', payload: 320 * scaleMagnitude, type: 'inventory-dispatched', seq: 'transaction-2-2' },
];

const clients = new Set();
let running = false;

function broadcast(msg) {
  const line = `data: ${JSON.stringify(msg)}\n\n`;
  for (const res of clients) res.write(line);
}

async function runDemo() {
  if (running) return;
  running = true;
  broadcast({ state: 'reset' });

  const manager = new EventQueueManager();
  const producer = new Producer(manager);
  const consumer = new Consumer(manager);
  consumer.subscribe();

  manager.on('event', (event) => {
    broadcast({
      state: 'processing',
      key: event.key,
      eventId: event.eventId,
      seq: event.seq,
      eventType: event.type,
      payloadMs: event.payload,
    });
  });

  consumer.on('consumed', (event) => {
    broadcast({ state: 'done', key: event.key, eventId: event.eventId, seq: event.seq, eventType: event.type });
  });

  INPUT.forEach((spec, idx) => {
    const event = new Event({ ...spec, eventId: `${spec.key}-${idx}` });
    broadcast({
      state: 'queued',
      key: event.key,
      eventId: event.eventId,
      seq: event.seq,
      eventType: event.type,
      payloadMs: event.payload,
    });
    producer.submit(event);
  });
  producer.producerDone();

  await manager.whenDone();
  broadcast({ state: 'complete', queueCount: manager.queueCount(), pending: manager.pending() });
  running = false;
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST' && req.url === '/run') {
    runDemo().catch((err) => console.error(err.stack || String(err)));
    res.writeHead(202).end();
    return;
  }

  const requestedPath = decodeURIComponent(req.url.split('?')[0]);
  const relPath = requestedPath === '/' ? '/index.html' : requestedPath;
  const filePath = resolvePath(PUBLIC_DIR, '.' + relPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Event queue UI listening on http://localhost:${PORT}`);
});
