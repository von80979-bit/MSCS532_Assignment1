# 02 — Build the HTML presentation deck

**What to build:** A self-contained HTML slide deck (opens offline in a browser) for the
10-minute team presentation with a live terminal demo. Content is drawn from the polished
`reports/final.md` and the figures in `resources/`. The introduction absorbs the application
context (kept brief); the DSA content takes most of the 10 minutes.

**Blocked by:** 01 — Polish `reports/final.md` (soft dependency: keeps slide numbers and
framing consistent with the final report).

**Status:** ready-for-agent

Structure and time budget (~10 min, four speakers):
- [ ] **Introduction** (application context folded in) — Monalisa, ~1.5 min. Problem +
      why key-partitioning, condensed to motivate the design rather than a standalone section.
- [ ] **DSA — the bulk (~7 min):**
      - Design: hash map + per-key FIFO queue, ack-gating, architecture — Parthasarathi.
      - Complexity: O(1) routing + queue operations, linked list vs `Array.shift` — Saketh.
      - Live demo + optimizations (bounding memory, restoring recoverability) — Nguyen.
- [ ] **Close (~1.5 min):** scaling (managed broker / Pub/Sub) + evaluation + the four
      guarantees, folded in. Resolve the Scaling/Evaluation/Conclusion speaker owner at build.

Demo:
- [ ] Demo slide runs the 3-queue ordering/concurrency demo live (Figure 1 scenario): per-key
      FIFO preserved while queue-2/3 interleave, ending on the drained-with-pending-0 banner.
- [ ] A pre-recorded screen capture of the same run is available as backup (Docker/timing
      insurance).
- [ ] Recovery (Figure 3) and memory (Figure 4) appear as charts, not run live.

Verification:
- [ ] Deck opens and navigates offline in a browser (no network dependency).
- [ ] Every report section is represented; figures embedded as charts.
- [ ] Slide timings sum to approximately 10 minutes; each speaker's section is marked.
