# Gather and verify the peer-reviewed references

Labels: wayfinder:research
Type: AFK
Status: closed
Blocked by: [Justify the optimization technique against the study](02-technique-justification.md)
Assignee: agent (claimed 2026-08-01)

## Question

The report needs **at least 6 references, of which at least 3 are scholarly peer-reviewed articles**, all in APA 7. The MSR'23 study is one of the peer-reviewed three, so at least two more are required, and realistically more to support the argument properly. Gather them, verify them, and record why each one earns its place.

This ticket runs in parallel with the design and methodology tickets; it depends only on the technique being locked, since the technique decides what the sources must support.

**The technique is now locked** — see [Justify the optimization technique against the study](02-technique-justification.md). Two consequences for the search. First, the **benchmarking-methodology-for-managed-runtimes** source is load-bearing rather than optional: the report's TypeScript defence argues that a JIT and a garbage collector make the runtime a *harder* test of an architecture-agnostic claim, and that argument needs a citable standard for measuring managed runtimes credibly. Second, the CSR source must support **layout and locality**, not cache-miss measurement, since the report explicitly declines to claim it measured the mechanism on V8.

Resolve:

- **What each source has to do.** The argument needs support at several distinct points, and a reference that supports none of them does not belong. At minimum: Dijkstra's algorithm and its complexity with different priority-queue implementations; sparse-matrix and CSR representations and their cache behaviour; data-structure choice as a performance-engineering concern in HPC; and something on benchmarking methodology in managed or JIT-compiled runtimes, which is what defends the warm-up and trial protocol against a skeptical reader.
- **Candidate classes worth searching.** The original Dijkstra 1959 paper; Fredman and Tarjan on Fibonacci heaps for the decrease-key complexity result the lazy-deletion choice trades away; graph-processing and sparse-linear-algebra literature on CSR and locality; SPEC or benchmarking-methodology work on measuring managed runtimes correctly. Textbook material such as CLRS is legitimate as a reference but does **not** count toward the three peer-reviewed articles.
- **Verification.** Every citation checked against the actual source rather than a citation generator or a search-result snippet. Confirm authors, year, venue, volume and issue, pages, and DOI. Note any field that is genuinely unavailable rather than inventing it.
- **Per-source notes.** For each reference, a short notes file capturing the specific claims the report will draw on, with locations, so the writing session cites accurately without re-reading. Follow the pattern in `residency-project-event-queue/resources/notes/`.
- **Fabrication check.** Confirm every source actually exists and says what it is being cited for. A hallucinated or misattributed reference in a graded APA report is a serious failure, worse than having only the minimum six.

Output: notes files under `final-project/resources/notes/`, plus a consolidated APA 7 reference list ready to drop into the report.

This ticket contributes to [Lock the report outline](07-report-outline.md).

## Resolution

**Ten references, eight peer-reviewed.** The requirement is six with three peer-reviewed, so both thresholds clear comfortably. Consolidated list at `final-project/resources/references.md`, per-source notes at `final-project/resources/notes/`. Every entry was verified against the source document plus at least two independent bibliographic records, and full text was obtained and read for all eight articles.

### The final list

| Source | Status | The job it does |
| --- | --- | --- |
| Azad, Iqbal, Hassan & Roy (2023), MSR | peer-reviewed | The assigned study. Taxonomy, both fix categories, the mlpack and CGAL commits, the RQ4 expertise finding. |
| Dijkstra (1959), *Numerische Mathematik* | peer-reviewed | Origin of the algorithm, and the primary evidence that its own Step 2 names no data structure. |
| Fredman & Tarjan (1987), *JACM* | peer-reviewed | Dijkstra analysed purely by counting heap operations, with non-heap work fixed at O(n + m). Also the non-negative-weight condition and decrease-key. |
| Cormen, Leiserson, Rivest & Stein (2022), 4th ed. | book | Both bounds Experiment 1 tests, plus the crossover condition. Heaps, priority queues, BFS, graph representations. |
| Saad (2003), SIAM, 2nd ed. | book | The three-array CSR definition, and storage format tied directly to high performance computing. |
| Bell & Garland (2009), SC '09 | peer-reviewed | Sparse storage format as a first-order performance decision, CSR among the formats compared. Carries Experiment 2's peer-reviewed weight. |
| Beamer, Asanović & Patterson (2015), IISWC | peer-reviewed | Locality as a real concern in graph workloads specifically. |
| Georges, Buytaert & Eeckhout (2007), OOPSLA | peer-reviewed | The benchmark protocol's defence, and the explicit licence to apply it beyond Java. |
| Kalibera & Jones (2013), ISMM | peer-reviewed | How many repetitions are actually needed, and why a warm-up heuristic can be badly wrong. |
| Selakovic & Pradel (2016), ICSE | peer-reviewed | The HPC-to-JavaScript transfer warrant, the harder-test number, and a protocol run on V8 itself. |

### What verification changed

Four findings altered the plan rather than confirming it, and the writing session must not undo them.

1. **Dijkstra (1959) contains no complexity analysis at all.** No asymptotic notation, no operation count, only a storage argument and the remark that the work "seems to be considerably less." The O(V²) figure is a later attribution and belongs to Cormen et al. The paper also never states the non-negative-weight condition, and its Problem 2 is posed point to point rather than single source. Citing O(V²) to Dijkstra would have been a fabrication in a graded report.
2. **Fredman & Tarjan's "lazy deletion" is not this project's lazy deletion.** Their Section 3 describes vacant-node deletion in an F-heap, credited to Cheriton and Tarjan, not the duplicate-entry scheme the report's binary heap uses. Same name, different construction. They also never state the binary-heap bound, so O((V + E) lg V) comes from Cormen et al. instead.
3. **A DOI-to-venue mismatch was caught and corrected.** Both Georges et al. and Kalibera & Jones exist as two separately registered Crossref works, one journal and one proceedings. The pairing this ticket started from named *SIGPLAN Notices* 42(10) alongside the proceedings DOI, which carries no volume or issue, so a grader following it would have landed on a record not showing the fields being claimed. Confirmed directly: `10.1145/1297105.1297033` returns the journal record, `10.1145/1297027.1297033` the proceedings one. The list uses journal form for Georges (APA 7 §10.5) and proceedings form for Kalibera & Jones.
4. **Two sources support narrower claims than their titles suggest.** Beamer et al. never mention CSR, adjacency lists, or representation choice anywhere, so Experiment 2 needed its own peer-reviewed anchor and Bell & Garland was added to supply it. Selakovic & Pradel have no "inefficient data structure" root cause and nothing on asymptotic complexity, so they cannot be JavaScript-side evidence for data-structure optimization; their role is the transfer warrant, the cross-engine instability finding, and the protocol.

### The two best passages found

**Cormen et al. §22.3, p. 623** gives both halves of Experiment 1 in consecutive paragraphs, O(V² + E) for the array scan and O((V + E) lg V) for the binary heap, and then states the crossover condition **E = o(V²/lg V)**. That is a published theoretical prediction for the density crossover Sweep B is built to locate, which upgrades the crossover from an observation into a confirmed or refuted prediction. Fourth-edition numbering was confirmed against the book's own table of contents; the graph chapters moved down two from the third edition, so third-edition numbers would have been wrong.

**Fredman & Tarjan p. 610** analyse Dijkstra by counting heap operations alone (one make-heap, *n* insert, *n* delete-min, at most *m* decrease-key) and then note that "the time for other tasks is O(n + m)." The non-heap work is fixed and linear; only the container term moves. Paired with **Dijkstra p. 270**, where Step 2 asks for "the node with minimum distance" and names no structure, that is a primary citation at each end of the report's "the data structure is the algorithm" thesis.

### Supporting numbers now available

- **Selakovic & Pradel:** 98 fixed issues across 16 projects; only **42.68%** of real merged optimizations improved on all versions of both V8 and SpiderMonkey, and **15.85%** degraded somewhere. This puts a measured number behind the harder-test framing in section 7 of [Justify the optimization technique against the study](02-technique-justification.md).
- **Georges et al.:** the abstract's transfer licence, that the issues "also apply to other programming languages and systems that build on a managed runtime system." That sentence, not any measurement, is what warrants citing a Java paper in a Node project.
- **Kalibera & Jones:** their Table 3 shows `avrora9` initialised by iteration 2 but not independent until iteration **128**, where the DaCapo harness reports 4 and the Georges method reports 1. The two methodology sources are mutually reinforcing rather than redundant, and the report must not present a coefficient-of-variation threshold as an authoritative warm-up detector.
- **Bell & Garland:** Table 1 gives bytes moved per FLOP by format, a 2× range attributable to representation alone. Their §4.3 and §6 also state that on unstructured matrices no single format wins, which is the honest framing if Experiment 2 finds CSR smaller but not uniformly faster.
- **Saad §3.5:** "data structures may have to change to improve performance when dealing with high performance computers," which ties the CSR definition straight to the study's *data structure optimization* sub-category.

### Fields deliberately absent rather than guessed

Dijkstra carries no issue number: the printed article has none, Springer's own recommended citation, zbMATH, EuDML and DBLP all omit it, and Crossref's `1(1)` is a provable back-file artifact, since all 24 articles in volume 1 are labelled issue 1. Bell & Garland carry a page range rather than an ACM article number, which could not be confirmed without a browser. CLRS omits its ISBN, which APA does not carry anyway, and its page count is contested across records.

### Consequences for downstream tickets

- **[Lock the report outline](07-report-outline.md)** now has its citation map. The crossover condition E = o(V²/lg V) is available as a stated prediction for the Experiment 1 section, which changes how the weaknesses discussion can be framed.
- **[Lock the benchmark methodology](04-benchmark-methodology.md)** has its defensible protocol sources, including one, Selakovic & Pradel §2.3, that was run on V8 rather than a JVM.
- No new tickets and no fog graduated. The `## Standing cautions for the writing session` block in `references.md` is the guardrail list; the writing session should read it before drafting.
