# Gather and verify the peer-reviewed references

Labels: wayfinder:research
Type: AFK
Status: open
Blocked by: [Justify the optimization technique against the study](02-technique-justification.md)
Assignee: (unclaimed)

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
