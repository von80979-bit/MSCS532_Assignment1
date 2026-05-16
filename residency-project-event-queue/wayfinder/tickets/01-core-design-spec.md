# Lock the core design specification

Labels: wayfinder:grilling
Type: HITL
Status: CLOSED (resolved)
Blocked by: (none — frontier)
Assignee: nguyen.vo

## Resolution

Design locked in `residency-project-event-queue/design-spec.md`. Key decisions:
JS/Node.js + single Docker container (single process, NOT distributed); native
`Map<string,Queue>` + hand-written O(1) linked-list `Queue` (enqueue/dispatch/dequeue);
`Event.ack()` calls its own queue's `dequeue()`; native `EventEmitter` as the event
stream giving per-key FIFO ordering + cross-key concurrency; enqueue auto-dispatches
the head; no busy-set (head-in-queue is the busy marker); termination via manager-owned
shared counter guarded by `producerDone` (done = count===0 && producerDone). Four
sources locked (Hanif, Liu, Nowacki, Ratra — no Pacaci), notes fact-checked in
`resources/notes/`.

## Question

Define and lock the event-queue data-structure design that every phase builds on,
so no downstream ticket has to re-decide *what* the system is. Resolve, via
`/grilling` + `/domain-modeling`:

- **Event schema** — fields on an event, especially the ordering key; any timestamp
  or payload; how events arrive (the initial list).
- **Structure** — the hash map (key → FIFO queue); which JS structures back each
  (`Map` + a proper O(1) queue such as a linked-list or head-index queue, NOT
  `Array.shift` which is O(n)) and why.
- **Dispatch algorithm** — per-key strict FIFO ordering; cross-key concurrency on one
  `asyncio` loop; how a lane advances (ack-gated); how completion (all queues drained)
  is detected.
- **Ack / backpressure** — how acknowledgment gates the next dispatch; what happens on
  slow/failed consumers.
- **Complexity + space table** — Big-O for enqueue, key lookup, dispatch, ack/removal;
  space as O(active keys + buffered events); the empty-queue cleanup that keeps space
  bounded. Tie each claim to a source (2 IEEE + Hanif et al. 2020 + Pacaci & Özsu 2018).

Output: a design-spec markdown file under `residency-project-event-queue/` that the
three report-outline tickets reference. This ticket blocks all of them.
