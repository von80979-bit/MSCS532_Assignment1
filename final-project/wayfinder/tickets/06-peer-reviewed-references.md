# Gather and verify the peer-reviewed references

Labels: wayfinder:research
Type: AFK
Status: closed
Blocked by: [Justify the optimization technique against the study](02-technique-justification.md)
Assignee: agent (references re-run, 2026-08-01)

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

---

## Added constraint on the re-run (2026-08-01)

An earlier pass resolved this ticket with ten references. The user reopened it with a sourcing rule that the earlier set did not meet: **peer-reviewed papers dated 2017 to today, with genuinely free access, meaning the full text is actually fetched and read rather than reconstructed from training data.** Only one of the earlier eight peer-reviewed sources was inside that window. This resolution re-runs the search under the rule.

**Assumption stated and acted on.** Some claims cannot be carried by a recent paper at all: the algorithm's 1959 origin, and the O(V²) and O((V + E) lg V) bounds Experiment 1 tests. Those three works are retained and clearly marked as **not** counting toward the peer-reviewed three. Everything that does count is 2017 or later and was read in session.

## Resolution

**Six core sources, all peer-reviewed, all 2017 or later, all fetched and read end to end in session.** Consolidated list at `final-project/resources/references.md`; per-source notes in `final-project/resources/notes/`. Nine references total against a requirement of six with three peer-reviewed.

| Source | Year | Venue | Access route, verified by download | Read |
| --- | --- | --- | --- | --- |
| Azad, Iqbal, Hassan & Roy | 2023 | MSR (IEEE/ACM) | Authors' free PDF, `foyzulhassan.github.io` | 13 pp. |
| Barrett, Bolz-Tereick, Killick, Mount & Tratt | 2017 | PACMPL / OOPSLA | ACM gold OA, CC BY 4.0; read via arXiv 1602.00602 | 40 pp. |
| Duan, Mao, Mao, Shu & Yin | 2025 | ACM STOC | arXiv 2504.17033 | 17 pp. |
| Elafrou, Goumas & Koziris | 2017 | IEEE ICPP | arXiv 1711.05487 | 10 pp. |
| Qian, Childers, Huang, Guo & Wang | 2018 | *Electronics* | MDPI gold OA, CC BY 4.0, version of record | 24 pp. |
| Traini, Cortellessa, Di Pompeo & Tucci | 2023 | *Empirical Software Engineering* | Springer OA, CC BY 4.0, version of record | 57 pp. |

Retained as foundational, not counted toward the peer-reviewed three: Cormen et al. (2022), Dijkstra (1959), Saad (2003).

### How each argument point is now covered

- **Dijkstra's cost as a function of the priority queue** — Duan et al. (2025). They describe Dijkstra as working "via a priority queue", give O(m + n log n) for the Fibonacci-heap combination, and attribute the Θ(n log n) explicitly to needing "to maintain a total order between a large number of vertices". A 2025 STOC paper stating the report's own thesis is a considerably better citation than the textbook assertion it replaces. The specific bounds Experiment 1 tests still come from Cormen et al.
- **CSR, layout and locality** — Qian et al. (2018) as primary, Elafrou et al. (2017) as corroboration. Qian et al. is the find: CSR "the de facto representation for sparse graphs", the three-array graph layout with the row-pointer trick, BFS-over-CSR pseudocode matching the project's loop, and measured locality on nine real graphs at roughly 90% stall rate and 58.9% L1 miss rate. It supports layout and locality without touching cache-miss measurement on V8, exactly as the ticket required.
- **Data-structure choice as an HPC performance-engineering concern** — Azad et al. (2023), the assigned study, reinforced by Elafrou et al. (2017).
- **Benchmarking managed and JIT-compiled runtimes** — Barrett et al. (2017) and Traini et al. (2023). Barrett et al. is load-bearing in a way the earlier methodology sources were not, because **it benchmarked V8 itself**, listing "V8 5.4.500.43 (a JIT compiling VM for JavaScript)" among its seven VMs. The TypeScript defence no longer transfers a Java result by analogy; it cites a study of the project's own runtime.

### What the verification changed

- **Six older sources were displaced, with reasons recorded** in the "Sources considered and set aside" table in `references.md`. Georges et al. (2007) and Kalibera & Jones (2013) are superseded by Barrett et al., which cites both and tests Georges et al.'s coefficient-of-variation heuristic directly, finding it reports steady states for **78.1% of executions it classifies as never reaching one**. Beamer et al. (2015) and Bell & Garland (2009) are displaced by the two CSR papers. Fredman & Tarjan (1987) is displaced by Duan et al., which cites it for exactly the claim wanted. Selakovic & Pradel (2016) misses the window by one year and is covered by Barrett et al. Their notes files remain on disk and remain accurate.
- **Barrett et al.'s article number rests on DBLP alone.** Crossref and OpenAlex both render the location as pages 1–27; only DBLP gives `52:1-52:27`, which is Article 52 in 27 pages. ACM's landing page returns HTTP 403 to automated requests and could not be opened to confirm. PACMPL numbers articles and starts each at page 1, so the records agree rather than conflict. `*1*(OOPSLA), 1–27` is the fallback if a checker objects.
- **Two year discrepancies resolved against the record, not guessed.** Semantic Scholar dates Barrett et al. to 2016, which is the arXiv posting year leaking in; Crossref, DBLP and OpenAlex all give 2017. Crossref dates Traini et al. to 2022 online-first while DBLP and the article's own running header give the 2023 volume. Cite 2017 and 2023.
- **Three sources were read as author copies or extended versions with pagination that does not match the published article** — Barrett et al. (40 pp. vs. 27), Duan et al. (17 pp. vs. 9), Elafrou et al. (author's arXiv copy). Their notes cite by **section number only**. Qian et al. and Traini et al. were read at published pagination.
- **Qian et al. is not in DBLP**, since that MDPI journal was not indexed for 2018. Verified against Crossref, OpenAlex and Semantic Scholar plus the article's own footer instead. The absence is recorded rather than papered over.

### Standing cautions the writing session must read first

Full list in `references.md`. The load-bearing ones:

- **Duan et al. is pure theory** — no implementation, no benchmark, comparison-addition model, constant-degree graph transformation. Cite for framing and for the O(m + n log n) reference point. Never imply the project implemented it. It gives neither the binary-heap nor the array-scan bound.
- **Qian et al. never compare CSR against an adjacency list.** That comparison is the project's own contribution and must be presented as such. Their 90% stall rate and 58.9% L1 miss rate come from a simulated CPU-plus-HMC system running C, not from V8.
- **Barrett et al. measured V8; Traini et al. measured the JVM.** Only Barrett et al. supports "a peer-reviewed study benchmarked the runtime this project uses."
- **Do not lead with Traini et al.'s 123,937% mean** — heavy-tailed and driven by a few projects. The median of 41% is the figure to use. Do not quote their 89.1% fork figure without the 43.5% benchmark figure.
- **Do not use a coefficient-of-variation warm-up detector and cite Barrett et al. as support.** Their §8 is a direct criticism of that heuristic.
- **The project's benchmarking will fall far short of both methodology papers.** Barrett et al. used a dedicated runner with OS-level controls, 30 process executions, 2000 iterations; Traini et al. ran 93 days. The project has a two-minute Docker budget. Cite the standard, state the shortfall, claim no compliance.
- **Dijkstra (1959) contains no complexity analysis and never states the non-negative-weight condition.** Duan et al. do state that condition, in both the abstract and §2, and are the better citation for it.
