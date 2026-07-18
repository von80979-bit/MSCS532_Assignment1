# Distributed Event Queue — Proof of Concept

A real-time event-processing engine, the in-process analog of a Node.js EventStream. Events carry an ordering key: events sharing a key are processed in strict FIFO order, while events with different keys are processed concurrently on a single event loop. Each event is acknowledged after simulated work, and that acknowledgment gates the next event in the queue of event with the same key (backpressure). 

## Requirements

- Install [Docker](https://docs.docker.com/get-docker/)

## 1. Build the image

From this folder (`residency-project-event-queue/`):

```bash
docker build -t event-queue .
```

This produces an image tagged `event-queue` containing the source, the demo driver, and the test suite (all under `src/`).

## 2. Run the demo with log

The image's default command runs the demo driver:

```bash
docker run --rm event-queue
```

## 3. Run the demo with visualization 

The image's default command runs the demo driver:

```bash
docker run --rm -it event-queue npm run demo:viz
```

## 4. Run the tests

Override the default command with the test script:

```bash
docker run --rm event-queue npm test
```
## Optimization demos & benchmark

These reproduce the three results cited in the report.
Each can be run with Docker (no local Node needed) or directly with Node.js 20+. The `--expose-gc`
flag needed for the memory/benchmark reads is already baked into the npm scripts.

### Recovery demo — redelivery, backoff, DLQ (report Figure 3)

Drives random and poison-pill failures; surfaces the per-key dead-letter section in the dashboard.

```bash
# Docker (interactive TUI — needs -it)
docker run --rm -it event-queue npm run demo:recovery

```

### Memory demo — eviction + flow control (report Figure 4)

Compares peak queue size and retained queues/heap with vs without the optimization. Configure the
event count per run with `--n` (the report cites `--n 30000`).
- `--n`: number of events

```bash
# Docker
docker run --rm event-queue npm run demo:memory -- --n 30000

```

### Benchmark — distributed vs single queue (report Figure 2)

Sweeps growing datasets, printing total processing time per mode plus the retry scenario. Optional
flags:   `--payload`, `--retry-frac`, `--json`.
- `--key`: number of unique ordering keys
- `--depth`: number of events per ordering key
- `--retry-frac`:  the failure rate default to 20%
- `--json`: return the json report

```bash
# Docker
docker run --rm event-queue npm run demo:benchmark -- --payload 5 --depth 30

```

## Project layout

```
residency-project-event-queue/
├── src/
│   ├── event.js                  # event data + ack()
│   ├── queue.js                  # Queue - using linked-list (O(1) enqueue/dequeue)
│   ├── event-queue-manager.js    # EventEmitter: Map<key, Queue> + dispatch + termination (event/done)
│   ├── producer.js               # submits events 
│   ├── consumer.js               # subscribe to listen to event published by publisher and dispatched by the queue manager
│   ├── main.js                   # entrypoint
│   ├── support/                  # sleep + structured logger
│   └── *.test.js                 # unit test suite
└── Dockerfile
```

## Running without Docker (optional)

With Node.js 20+ installed locally:

```bash
npm start   # run the demo
npm test    # run the tests
npm run demo:viz # run the main demo with visualization
npm run demo:benchmark # run the benchmark
npm run demo:memory -- --n 30000 # run the memory optimization demo
npm run demo:recovery -- --payload 5 --depth 30 # run the recovery optimization demo
```
