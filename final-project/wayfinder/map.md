# Map: HPC Optimization Techniques Demonstrated on Shortest-Path Algorithms

Labels: wayfinder:map
Status: open

## Destination

A complete, submittable MSCS-532 final project: the APA 7 report (6+ pages of content plus title and reference pages), the hand-written TypeScript implementation packaged in Docker, the benchmark results it produces, and the HTML presentation deck. Every design, methodology, and structural decision is locked on this map before the corresponding execution session starts, so no implementation or writing session has to decide *what* to build or *how* the report is structured.

## Notes

**The assignment.** Requirements at `final-project/wayfinder/project-requirements.md`. Two parts. Part 1 is a report that assesses optimization techniques from a named empirical study, selects one, justifies the choice, discusses its strengths and weaknesses for data-structure optimization, and demonstrates it with a working prototype whose measured results are compared against the study's theoretical expectations. Part 2 is a 10-minute narrated presentation, minimum 5 slides plus title and reference slides. The assigned study is *An Empirical Study of High Performance Computing (HPC) Performance Bugs* (MSR 2023), at https://foyzulhassan.github.io/files/MSR23_HPC.pdf.

**Domain.** Single-source shortest paths on graphs, used as the vehicle for demonstrating HPC data-structure optimization. The report's argument is that the data structure *is* the algorithm: the same relaxation loop becomes BFS, naive Dijkstra, or heap Dijkstra depending only on which container answers "what do I process next," and the choice of container decides the asymptotic cost.

**The narrative arc (five steps, confirmed).** Steps 1-3 are exposition, roughly a page and a half. Steps 4-5 carry the empirical contribution and the bulk of the pages.

1. BFS introduces the shortest-path problem on an unweighted graph, solved with a FIFO queue.
2. Edge weights break BFS. Fewest hops stops being shortest distance, and BFS returns a wrong answer. Worth a small figure showing a concrete graph where it fails.
3. Dijkstra generalizes BFS by swapping the FIFO for a priority queue. **This is a generalization, not a speedup.** BFS is strictly faster at O(V+E); Dijkstra pays a log factor to buy correctness on weighted graphs. The report must never call Dijkstra an optimization of BFS.
4. Within Dijkstra, the choice of extract-min implementation is free. Linear scan gives O(V^2); a binary heap gives O((V+E) log V). **Experiment 1, the time axis.**
5. Same algorithm, same heap, different memory layout: adjacency list against CSR. **Experiment 2, the memory axis.**

**Experiments (one metric each, to fit the 6-page budget).** Experiment 1 measures time and varies the extract-min data structure. Experiment 2 measures memory and varies the graph representation, holding the algorithm and priority queue fixed. Each isolates exactly one variable so the report can make a causal rather than correlational claim. All variants must emit identical distance vectors; that equality is the correctness control, and it is what lets the report claim the speedup is free rather than bought with wrong answers. BFS is implemented and serves as a free correctness oracle on unit-weight graphs, but is expository and carries no timing series.

**Language and tooling.** TypeScript on Node, packaged as a Docker image so the professor builds once and runs. The requirements permit a language other than Python, so no deviation note is needed anywhere. **Zero runtime dependencies** — all four data structures are hand-written to textbook form: binary min-heap priority queue (sift-up/sift-down, lazy deletion), FIFO queue (head-index or ring buffer, never `Array.shift`, which is O(n) and would silently sabotage BFS), adjacency list, and CSR. TypeScript itself stays a devDependency. The consequence accepted: the report defends the heap's quality by inspection of the sift code rather than by benchmark against a library.

**Priority-queue design constraint.** Textbook Dijkstra uses decrease-key. The hand-written heap uses the **lazy-deletion variant** instead: push a fresh `(node, dist)` entry on every improvement and discard stale pops. Complexity stays O((V+E) log V), and it is what production code generally does, but the report must state this explicitly or the stated complexity will not match the shipped code.

**Graph sizing (revised down; ~500K edges is the ceiling anywhere in the project).** The linear-scan/heap crossover depends on `V / log V`, not `V^2`. Equating `c1*V^2` with `c2*(V+E)*log V` at average degree `d` gives `c1*V ~ c2*(1 + d/2)*log V`, which at V = 2,000 lands the crossover near average degree 30-40, roughly 30,000 edges.

- **Sweep A (size axis, Experiment 1).** Average degree fixed at 8; V doubling from 1K to 32K. Max ~128K edges. Cap at 16K if the total run time gets uncomfortable, since the O(V^2) scan dominates the wall clock.
- **Sweep B (density axis, Experiment 1).** V fixed at 2,000; average degree doubling from 4 to 512. Max ~512K edges. Brackets the predicted crossover by an order of magnitude on both sides.
- **Experiment 2 (memory).** Sparse, V = 100K at degree 8, roughly 400K edges. Large enough that the representation gap dwarfs V8 baseline heap noise.

**Finding the crossover is the project's most valuable result.** The assignment explicitly asks for the technique's weaknesses, and a measured point where the optimization stops paying off is a far stronger answer than speculation. It also echoes the study's finding that HPC fixes are context-dependent rather than universal.

**Graph generation and caching.** A seeded generator, hand-written PRNG to preserve the zero-dependency rule. Build a random spanning tree first so the source reaches every node and results are not trivially truncated, then add random edges to hit the target density. Graphs are cached to a gitignored `data/` directory keyed by `(V, density, seed)`, generated at **run time** rather than build time, with a `--regenerate` flag. Format is **JSON with flat parallel arrays** — `{ "v": 100000, "src": [...], "dst": [...], "w": [...] }` — not an array of edge objects, which costs roughly 4x the bytes. A committed `manifest.json` records generator version, V, density, seed, edge count, and a checksum so the professor can verify a regenerated graph matches without committing large files to git.

**The measurement trap.** `JSON.parse` leaves a large intermediate on the heap. Measuring `heapUsed` while it is still reachable measures the parsed JSON rather than the data structure, making both representations look nearly identical and destroying Experiment 2. The protocol must be: parse, build the representation, drop every reference to the parsed data, force GC under `--expose-gc`, then measure.

**Budget.** A full `docker run` should complete in roughly 2 minutes. Sweeps are sized to fit.

**Writing standards.** All report prose follows `final-project/WRITING_STANDARD.md`: APA 7 applied strictly, paragraphs of roughly 240-300 words, no em dash or hyphen splicing two independent clauses, no AI-tell vocabulary, citations synthesized and grouped rather than closing every sentence, and varied across narrative, parenthetical, and quoted forms. Minimum 6 references, at least 3 scholarly peer-reviewed.

**Code standards.** Clean-code practices throughout. Comments only where genuinely necessary, and concise when present; no lengthy comment blocks. The MS Word deliverable is this documented source plus screenshots, so the code comments *are* the documentation. **Do not wrap text early** in either code or prose.

**Scope override.** This map carries execution, not just planning. The destination is the submitted assignment. Decision tickets come first; implementation, the benchmark run, report prose, and the deck follow as tickets graduating from the fog.

**Deadline (surfaced 2026-08-01, during [Justify the optimization technique against the study](tickets/02-technique-justification.md)).** The assignment is due **the next day**. Remaining decision tickets should be **compressed rather than worked one at a time**: draft the full answer, put it to the user for correction in a single pass, and close. The binding constraint on delivery is the **narrated presentation**, which needs the user's own recording time, not the code, which agents can produce quickly. Sequence accordingly — get the report finished early enough that the deck and its narration are not squeezed.

**Naming discipline (locked).** Refer to the study's categories by their **verbatim names**, never by letter. *Domain and architecture agnostic algorithm and data-structure optimization*; *Micro-architecture specific optimization*; for the root cause, *Inefficient algorithm, data structure, computational kernel, and their implementation*, held in that one form throughout. The map's old shorthand "inefficient-data-structure-or-algorithm category" is not verbatim and must not appear in the report.

**Skills to consult.** `/grilling` and `/domain-modeling` for every decision ticket; `/research` for the study and the reference gathering; `/prototype` if a design question needs a concrete artifact to react to.

**Working split.** Agents chart, decide, implement, and write. The user runs the benchmark and collects the metrics personally.

## Decisions so far

<!-- one line per closed ticket -->

- [Extract the MSR'23 performance-bug taxonomy](tickets/01-msr23-taxonomy-research.md) — Paper read in full and captured at `final-project/resources/notes/msr23-hpc-performance-bugs.md`; citation verified (pp. 194–206, DOI 10.1109/MSR59073.2023.00037). The two axes map to **two different fix categories** sharing one root-cause family: the heap is *Domain and architecture agnostic algorithm and data-structure optimization* (9.1%), whose own example is a commit introducing a priority queue; CSR is *Micro-architecture specific optimization* (34.4%), sub-category data structure optimization, whose example is changing STL lists to vectors. The paper quantifies **neither** — both are reported asymptotically or qualitatively only, so measurement is this project's contribution.
- [Justify the optimization technique against the study](tickets/02-technique-justification.md) — **One technique: data-structure optimization**, demonstrated at two levels of the memory hierarchy, defensible under "select one" because the study uses that phrase verbatim in both fix categories. **The heap leads** and CSR follows as the same technique one level down, because *Domain and architecture agnostic algorithm and data-structure optimization* is architecture agnostic by its own name and therefore the claim that survives V8. CSR stays because the heap alone is exposed to the "especially in data structure optimization" reading — CSR is the experiment with no algorithmic story to confuse it with. Justification is by elimination: of the seven fix categories, this is the only one whose mechanism survives a managed runtime. Weaknesses lead with the density crossover; TypeScript is defended as a *harder* test of an architecture-agnostic claim, not apologised for. Full argument in the ticket, ready to expand into prose.

- [Gather and verify the peer-reviewed references](tickets/06-peer-reviewed-references.md) — Re-run under a sourcing rule the user added: **peer-reviewed, 2017 to today, full text actually fetched and read, not recalled**. Result is **nine references, six of them peer-reviewed and inside the window**, all six downloaded and read end to end: Azad et al. (2023, the assigned study), Barrett et al. (2017), Duan et al. (2025), Elafrou et al. (2017), Qian et al. (2018), Traini et al. (2023). List at `final-project/resources/references.md`, per-source notes at `final-project/resources/notes/`. Two finds change the report's footing. **Barrett et al. benchmarked V8 itself**, so the TypeScript defence now cites a study of the project's own runtime rather than transferring a Java result by analogy; at most 43.5% of VM/benchmark pairs reach a steady state of peak performance, and their §8 shows the standard coefficient-of-variation warm-up heuristic reports steady states for 78.1% of executions that never reach one. **Qian et al. is CSR on graphs specifically** — "the de facto representation for sparse graphs", the three-array layout, BFS-over-CSR pseudocode matching the project's loop, and ~90% stall rate with 58.9% L1 miss rate on nine real graphs — which is what Beamer et al. could never do. **Duan et al. (STOC 2025) states the report's own thesis**: Dijkstra works "via a priority queue", the Fibonacci-heap combination gives O(m + n log n), and the Θ(n log n) is attributed to maintaining a total order; it also supplies the weaknesses section's sharpest line, that Dijkstra is provably not optimal for SSSP. Six older sources were displaced with reasons recorded, including Georges et al. and Kalibera & Jones, both superseded by Barrett et al. Cormen et al., Dijkstra (1959) and Saad stay as foundational, explicitly not counted toward the peer-reviewed three. The ticket's `Standing cautions` list is a guardrail the writing session must read before drafting.

## Not yet specified

- **Building the implementation.** Graduates once [Specify the implementation requirements](tickets/05-implementation-requirements.md) closes. Likely more than one ticket: the data structures and algorithms, the generator and cache, the benchmark harness, and the Docker packaging may split.
- **The benchmark run and metric collection.** The user runs the code personally and returns the numbers. Shape depends on what the methodology ticket specifies as output.
- **Writing the report prose.** An agent writes from the collected metrics plus the locked outline plus the verified references, following `WRITING_STANDARD.md`. Graduates once the outline is locked and the numbers exist.
- **Packaging the MS Word source-code deliverable.** Documented source plus screenshots. Light packaging work; shape depends on what the implementation produces and which runs are worth screenshotting.
- **The HTML presentation deck.** A follow-up grilling ticket the user wants raised *after* the report is finished, planning the deck from the finished report. HTML preferred. 10 minutes, minimum 5 content slides plus title and reference slides, with narration.
- **Figure production.** Charts for both experiments have to come from somewhere, and the zero-dependency rule rules out a charting library. Whether the harness emits SVG directly, renders an HTML page, or just emits data for external charting is likely settled inside the methodology or implementation-requirements ticket, but it is not yet decided.

## Out of scope

<!-- beyond this map's destination; ruled out consciously -->

- **Parallelization as the demonstrated technique.** A real category in the study, but the chosen techniques are the data-structure and memory-layout axes. Node `worker_threads` would mean fighting the runtime rather than demonstrating the technique, and the report cannot cover three axes in 6 pages.
- **Real-world graph datasets** (DIMACS road networks, SNAP). They would add external validity, but they break the seeded-reproducibility story, require shipping or downloading large files, and cost pages. Accepted instead as a stated limitation in the report, in one sentence.
- **A Python implementation.** The requirements permit another suitable language and TypeScript is the choice; there is no dual implementation and no deviation note.
- **Benchmarking against a third-party data-structure library.** `@datastructures-js/*` was considered as a sanity baseline proving the hand-written heap is in the same performance class. Dropped in favour of the zero-dependency rule; the heap is defended by inspection instead.
