# Lock the report outline

Labels: wayfinder:grilling
Type: HITL
Status: open
Blocked by: [Justify the optimization technique against the study](02-technique-justification.md), [Lock the benchmark methodology](04-benchmark-methodology.md), [Gather and verify the peer-reviewed references](06-peer-reviewed-references.md)
Assignee: (unclaimed)

## Question

Lock the report's section-by-section structure so the writing session expands prose into a fixed skeleton rather than inventing one. The outline is written before the numbers exist, so it must specify what each section *argues* and where results slot in, not what the results are.

Constraints from the assignment: no fewer than 6 pages of content plus a title page and a reference sheet, APA 7 throughout, at least 6 references with 3 peer-reviewed, and supporting diagrams and illustrations. Prose follows `final-project/WRITING_STANDARD.md`.

Resolve:

- **Section list and order**, arranged so each section depends only on ones before it. Every required element of the assignment maps to a section, with traceability recorded, since the grader is checking against the requirements list.
- **Per-section content.** The points each section makes, the sources it cites, and its approximate length. Paragraphs run 240-300 words, which makes the page budget countable in advance rather than discovered late.
- **Where the narrative arc lives.** Steps 1-3 of the arc, meaning BFS, the weighted-graph failure, and the generalization to Dijkstra, are exposition worth about a page and a half. Steps 4-5, the two experiments, carry the bulk. Confirm that split survives contact with the full section list, and cut exposition first if the page budget tightens.
- **Figure placement.** The BFS failure diagram, the Experiment 1 charts for both sweeps, and the Experiment 2 memory chart. Numbered, captioned, and each introduced by a sentence of lead-in rather than dropped in cold.
- **The lessons-learned section.** The assignment specifically requires comparing the measured results against the study's theoretical expectations. Decide what that comparison covers: where measurement matched theory, where constant factors or V8 behaviour diverged from asymptotic prediction, and what the density crossover says about the technique's limits. This section is where the project's most interesting result lands, so it should not be a postscript.
- **Problems encountered.** Also explicitly required. Decide whether this is its own section or folded into lessons learned, and what it covers. The lazy-deletion trade-off, the JSON-intermediate measurement trap, and the V8 warm-up problem are genuine candidates rather than manufactured difficulties.
- **Handling results that have not arrived.** The outline is locked before the benchmark runs, so it must say what each results section claims *conditionally*, and which parts of the argument would need revisiting if, for instance, the crossover falls outside Sweep B's range or CSR shows a smaller memory win than expected.

Once this closes, writing the report prose graduates from the map's **Not yet specified** section, gated on the user's benchmark numbers arriving.
