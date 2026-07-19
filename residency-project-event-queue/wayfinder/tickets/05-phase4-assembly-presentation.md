# Phase 4 assembly + presentation plan

Labels: wayfinder:grilling
Type: HITL
Status: closed
Blocked by: 02-phase1-report-outline, 03-phase2-report-outline, 04-phase3-report-outline
Assignee: nguyen.vo

## Question

Define how Phase 4 turns the three phase reports into the final cumulative deliverable.
Resolve:

- **Assembly plan** — how Phases 1-3 stitch into one APA document: a unifying
  introduction and conclusion, a single de-duplicated reference list, section
  renumbering, and removing redundant context across phases.
  - **Cohesion note (from Phase 3 grilling):** the single-global-queue *bottleneck
    framing* (independent transactions forced to wait behind unrelated prior events,
    worse under retry) is introduced in Phase 3 §Optimization, but for a cohesive
    assembled report it should surface **early — in the Application Context (Phase 1)** —
    so the whole document motivates the distributed design from the outset rather than
    only at the optimization stage. Reconcile/de-duplicate the two mentions during assembly,
    and **cite the Phase 3 distributed-vs-single-queue time result** in Application Context to
    support the framing empirically (don't leave that measured result referenced only in the
    evaluation section).
- **Presentation** — the presentation deliverable's format (slides, live demo vs.
  recording), slide structure, and which parts of the terminal demo to show.

Deliverable: an assembly checklist plus a presentation outline. Depends on all three
phase outlines existing so the final structure is known.

## Resolution

Phases 1-3 are assembled into `reports/final.md` (single APA doc: unified Overview,
de-duplicated reference list, Figures 1-4, one References section). Review confirmed it
cohesive and comprehensive — DAG order holds, no quotation marks, every paragraph ≤300
words (longest 284). The assembly checklist below and the presentation outline are the
remaining execution work; **edits and the HTML deck are deferred to an execution session
(not applied here).**

### Assembly / polish checklist (edits to apply to `reports/final.md`)

APA:
- Number style — standardize to APA 7 (numerals for ≥10). Fix spelled-out counts:
  `three hundred`→`300`, `three thousand`→`3,000`, `thirty thousand`→`30,000`,
  `thirty-two`→`32`, `thirty seconds`→`30 seconds`, `eleven`→`11`, `thirty-three`→`33`.
  `ten submitted`→`10` for parallelism (five/eight/two <10 may stay words).
- Line 113: remove stray backslash in `(Nowacki et al., 2021\)`.
- Hanif reference (line 125): replace informal `In *ICOIN* *2020*` with full proceedings
  title — `In 2020 International Conference on Information Networking (ICOIN) (pp. 713–716). IEEE.`
- Figure caption style (optional): **Figure N** bold on its own line, then italic title.

Figures:
- **Add a one-sentence lead-in before each of Figures 2, 3, and 4** — currently they are
  inserted with no introductory sentence and only referenced parenthetically *after* the
  image (lines 108, 113, 118). Figure 1 already has an in-paragraph intro (line 43).
- Figure 4 caption (line 116): replace terse `Stress test.` with a parallel descriptive
  caption, e.g. *Peak queue size and retained heap with and without the memory optimization.*

Cohesion:
- Overview already surfaces the single-global-queue bottleneck framing early (line 13) ✓.
- **Add** to the Application Context/Overview a forward clause citing the measured
  distributed-vs-single time result (currently only at line 108), e.g. "a gap this report
  later measures at roughly 10 to 90 times."
- De-duplicate the component enumeration across the seam: `Component Architecture` (line 34)
  and `Core Data Structures and Operations` (line 38) both list Event/Queue/Manager/Producer/
  Consumer. Reframe line 34 as design-intent one-liners; let line 38 carry realized-code detail.
- `Implementation and Next Steps` (line 82) frames redelivery/NACK/DLQ/benchmarks as future
  work, then the next section delivers them. Soften into a transition ("the sections that
  follow realize several of these") rather than future work.

Consistency:
- `NodeJs` (line 22) → `Node.js`. `en-queue` (line 38) → `enqueue`.

### Presentation outline — 10 min + live demo

Format: **brief HTML slide deck** (self-contained, runs in a browser).

Speaker assignment (per user):
- **Monalisa** — Introduction (problem / application context).
- **Parthasarathi** — Design (hash map + per-key FIFO queue, ack-gating, architecture).
- **Saketh** — Complexity (O(1) routing + queue ops; linked-list vs `Array.shift`).
- **Nguyen** — live Demo + Optimizations.

Coverage gap to resolve when building: Scaling, Evaluation, and Conclusion have no explicit
owner yet. Proposed fold for a *brief* deck — Nguyen carries Scaling + Evaluation (they flow
from the optimizations/demo) and Conclusion; or give Evaluation to Saketh (numbers theme).
Confirm at build time.

Demo plan:
- Run the 3-queue ordering/concurrency demo live (Figure 1 scenario): per-key FIFO preserved
  while queue-2/3 interleave, ending on the drained-with-pending-0 banner.
- Keep a pre-recorded screen capture as backup (Docker/timing insurance).
- Recovery (Fig 3) and memory (Fig 4) stay as charts, not run live.
