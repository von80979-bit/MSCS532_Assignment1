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

## 2. Run the demo

The image's default command runs the demo driver:

```bash
docker run --rm event-queue
```

## 3. Run the tests

Override the default command with the test script:

```bash
docker run --rm event-queue npm test
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
```

## Live UI (optional)

`ui/` is a standalone visualization for presentations — it does not change or wrap
anything under `src/`, it just subscribes to the same manager/consumer emissions the
CLI demo prints. It has no third-party dependencies (plain `http` + `EventSource`).

```bash
npm run ui   # serves http://localhost:4173
```

Open the URL and click "Run demo" to watch events move through queued → processing →
done per key, live, in swim lanes color-matched to the terminal output.

### Via Docker

```bash
docker build -t event-queue .
docker run --rm -p 4173:4173 event-queue npm run ui
```

The `-p 4173:4173` maps the container's port to your host — without it the server
runs but nothing outside the container can reach it. Open `http://localhost:4173`.
