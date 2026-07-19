# 02 — Opt B: recoverability (redelivery + backoff + DLQ)

**What to build:** A failing event no longer blocks its queue. When a consumer errors, the
event is redelivered at its queue head after an exponential backoff (capped at 30s, with a
small configurable base for demos), up to a max of 5 delivery attempts. Failures occur
randomly at 20% per attempt in the demo. An event that exhausts its attempts is moved to
that queue's dead-letter list (`dlq`) and the queue advances. Other queues are never stalled
by one queue's retries. A recovery demo drives failures and surfaces the `dlq` in the viz.

Context: implements Opt B of the locked Phase 3 outline
(`wayfinder/tickets/04-phase3-report-outline.md`). Grounds in Nowacki (ack-before-removal,
retry-at-head) and Ratra (dead-letter, replay).

**Blocked by:** 01 (shares the manager dispatch/ack path — sequence after it to avoid
same-branch conflicts).

**Status:** done

- [x] Consumer error redelivers at the queue head (does not advance past it) with exponential backoff, capped 30s, configurable base
- [x] Max 5 delivery attempts; 20% random failure per attempt in the demo config
- [x] Exhausted event moved to the queue's `dlq` exactly once, then the queue advances
- [x] A successful event is removed exactly once; no duplicates in final state
- [x] Other queues keep processing while one queue retries / backs off
- [x] Tests assert retry-exactness, dlq-once, and no cross-queue stall
- [x] Recovery demo surfaces the `dlq` in the viz

**When done:** tick the acceptance criteria above and set `Status: done`.

---

**Implementation notes**

- Symmetric nack path mirrors ack: `Event.nack()` → `Consumer.nack()` → `EventQueueManager.fail()`. The
  retry/backoff/dead-letter policy lives in the manager (it owns queue-advance + the ack path); `Event` gained an
  `attempts` counter and a per-delivery settle guard with `reset()` for redelivery.
- `manager.fail(event)` increments attempts; below `maxAttempts` (default 5) it re-dispatches the *unchanged* head
  after `min(backoffCap, backoffBase·2^(n-1))` via an injectable `schedule` (default `setTimeout`; tests inject a
  deterministic one). On the final failure it moves the head to the key's dead-letter list exactly once, then
  advances (evict or dispatch next). The head can't change while it backs off (only an ack removes it), so redelivery
  is safe and strict FIFO holds.
- DLQ is keyed on the manager (`dlqs: Map<key, Event[]>`, accessors `dlq(key)` / `dlqCount()`) so it survives Opt-A
  eviction. A stale/duplicate nack is ignored via a `queue.peek() === event` guard (dlq-once).
- Consumer failure is an injectable `fail(event)` predicate (default never). Recovery demo trips it at 20%/attempt.
- New: `src/recoverability.test.js` (retry-exactness, FIFO-under-retry, backoff schedule + cap, dlq-once + stray-nack
  ignored, no cross-queue stall, conservation). Full suite: 33 pass.
- New: `src/demo-recovery.js` (`npm run demo:recovery [-- --scale N]`) — same boxed dashboard as `demo-viz` (PRODUCER
  / MANAGER cards, sliding token, per-queue INCOMING → PROCESSING → FINISHED), extended with an attempt counter, an
  amber BACKOFF countdown bar on a failed head, and a per-queue DEAD-LETTER section. Since 20%^5 ≈ 0.03% makes natural
  exhaustion vanishingly rare, a couple of poison-pill events (always fail) guarantee the dlq populates — the classic
  dead-letter scenario alongside the transient 20% flakiness. Closing summary proves conservation (consumed +
  dead-lettered = submitted). Uses `Math.random` for the transient failures (determinism lives in the tests).
