# 01 — Opt A: memory management (eviction + flow-control gate)

**What to build:** The distributed event queue keeps memory bounded under load. When a
queue drains, the manager releases its `Map` entry so memory tracks active keys only. Each
queue enforces backpressure: once it reaches a high-water mark the producer is suspended
(`submit()` awaits) and resumes when the queue drains below a low-water mark, so a fast
producer or a hot key never grows a queue without bound and no events are dropped. A memory
demo shows heap / queue count staying bounded *with* the optimization versus growing
*without* it.

Context: implements Opt A of the locked Phase 3 outline
(`wayfinder/tickets/04-phase3-report-outline.md`). `EventEmitter` has no native
pause/resume, so the gate is a Promise the producer awaits (emulates Node Streams
backpressure). Reuse the existing test infra (`node --test`, injected clock/logger).

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Manager deletes a key's `Map` entry when its queue becomes empty (verifiable via `queueCount`)
- [x] `submit()` returns a Promise: resolves immediately below the high-water mark, stays pending at/above it, resolves once the queue drains to/below the low-water mark (strictly-below would deadlock at the default `lowWater=0`)
- [x] Producer awaits `submit()`; no events dropped (conservation: submitted == processed)
- [x] Tests cover eviction, pause/resume gating, and conservation
- [x] A memory demo captures/prints memory (or queue count) with vs without the optimization

**When done:** tick the acceptance criteria above and set `Status: done`.
