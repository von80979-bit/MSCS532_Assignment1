# Event Queue — Design Overview 

## Summary

A single-process, real-time **event-processing engine** in Node.js (packaged in
Docker). Every event has an **ordering key**. A hash map routes each key to its own
**FIFO queue**. Events with the **same key** are processed in strict sequential order; events with
**different keys** run concurrently. A consumer processes one event
per key at a time: it logs the event, does simulated work (`sleep`), then **acknowledges**
it. When an event ack, it is removed from the queue and the queue releases the next one in its queue — this is the
backpressure mechanism. The program ends when every event has been acknowledged.

- **Concurrency, not parallelism** (one event loop). True parallelism is future work.
- Core data structures: native `Map` (O(1) routing) + a **custom O(1) linked-list Queue**
  (not `Array.shift`, which is O(n)).

## Conrete Example

Imagine processing a stream of **account transactions** against a downstream payments API.
Each event is an operation on an account, with the **account id** as its ordering key:

- Operations on the **same account** must apply in order — a `deposit` must not overtake
  the `create` it depends on, and a `withdraw` must see the prior balance.
- Doing the **whole stream one-at-a-time** (global order) is correct but far too slow.
- The **API gives no ordering guarantee**, so firing everything concurrently risks
  out-of-order application and corrupted balances.

Partitioning events by ordering key gives the best of both: **order per account, parallelism across
accounts.** Say the input list is:

```
e1: acct-A create   e2: acct-B create   e3: acct-A deposit
e4: acct-A withdraw e5: acct-B deposit
```

The Map creates one queue per account: `A -> [create, deposit, withdraw]`,
`B -> [create, deposit]`. A possible interleaved log:

```
t0  A create   dispatched      t0  B create   dispatched     # different keys run together
t1  B create   ack -> B deposit dispatched
t2  A create   ack -> A deposit dispatched
t3  B deposit  ack -> B queue done
t4  A deposit  ack -> A withdraw dispatched
t5  A withdraw ack -> A queue done            -> all queues drained -> DONE
```

Account A's three operations never reorder; account B runs in parallel with A.

**Retries fall out for free:** if `A withdraw` fails, it simply is not acked, so it is
redispatched at the head of A's queue and A does not advance — while B is unaffected.
This is where the four papers connect: ack-gating and backpressure (Hanif, 2020;
Nowacki, 2021), key partitioning for per-key order (Liu et al., 2024), and idempotent
retries / dead-letter handling at scale (Ratra et al., 2025).

## Architecture

```
                 Producer  (loops an event list)
                     |
                     |  manager.enqueue(event)
                     v
             EventQueueManager
             - Map<key, Queue>          (O(1) key routing)
             - EventEmitter  (stream)   (concurrent dispatch)
             - pendingCount + producerDone   (termination)
                     |
     route by key    |
        +------------+------------+
        v            v            v
     Queue "A"    Queue "B"    Queue "C"     custom O(1) FIFO (head/tail)
     [e1, e4]     [e2]         [e3, e5, e6]  only the HEAD is dispatched
        \___________ dispatch head (emit) __________/
                     |
                     v   EventEmitter fires
                  Consumer
                  1. log(receiveTime, key, eventId, seq)
                  2. await sleep(payload)
                  3. event.ack()  ->  queue.dequeue()  ->  dispatch next head
```

Per key, exactly one event is "in flight" (dispatched, not yet acked) at a time. The
un-removed head is itself the "queue busy" marker, so no separate busy-set is needed.

## High-level pseudocode

```
class Event:
    fields: key, eventId, payload, seq, type, consumer
    ack():
        consumer.ack(this)            # route to owning consumer -> manager; I hold no Queue

class Queue:                          # one per key; PURE O(1) linked list
    enqueue(event):  append event to tail
    dequeue():       remove and return head
    peek():          return head (by reference, NOT removed)
    isEmpty() / size() / clear()      # plain data structure; no dispatch, no emit

class EventQueueManager(EventEmitter): # the Map layer AND the sole dispatcher/stream
    map = Map<key, Queue>
    enqueue(event):
        q = map.get(event.key) or create+store new Queue
        q.enqueue(event)
        pendingCount += 1
        this.dispense(event)          # try to dispatch the head

    dispense(event):
        if event is null: return
        q = map.get(event.key)
        if q.peek() == event:         # only the current head is dispatched
            process.nextTick(() => emit('event', event))  # deferred: avoid re-entry mid-op

    remove(event):                    # the ack path
        q = map.get(event.key)
        q.dequeue()                   # remove the head
        pendingCount -= 1
        this.dispense(q.peek())       # release the next head (if any)
        this.checkDone()

    checkDone():
        if pendingCount == 0 and producerDone:
            emit('done'); close()

# Consumer (reacts concurrently via the manager's event stream)
on manager 'event' (event):
    event.consumer = this             # adopt the event
    log(now(), event.key, event.eventId, event.seq)
    await sleep(event.payload)
    event.ack()                       # -> consumer.ack(event) -> manager.remove(event)

# Producer / driver
for event in eventList:
    producer.submit(event)            # -> manager.enqueue(event)
producer.producerDone()               # -> manager.markProducerDone()
manager.checkDone()
```
