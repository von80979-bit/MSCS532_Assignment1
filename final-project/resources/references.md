# Reference list

Drop-in APA 7 reference list for the final report. Alphabetical by first author surname, as APA 7 requires. In the Word document each entry takes a hanging indent of 0.5 inch, and the page is titled **References**, centred and bold.

## The sourcing rule this list was built under

Every entry marked **[core]** below satisfies all three of the following, and each was checked individually rather than assumed:

1. **Peer-reviewed** in an established venue.
2. **Published 2017 or later.**
3. **Full text actually fetched and read during the research session**, from a URL that needs no paywall, login, or institutional access. Nothing in the core set is reconstructed from memory or from a search-result snippet.

The core set is **six papers, all peer-reviewed, all 2017 or later, all read end to end**. That alone clears the assignment's threshold of six references with three peer-reviewed. Three older works are retained as **[foundational]** because they carry claims no recent paper supplies; they are clearly marked and are not counted toward the peer-reviewed three.

**Do not cite anything from this list without reading its notes file in `notes/` first.** Several sources support a narrower claim than their titles suggest, and every notes file ends with a Cautions section recording exactly what its source is *not* entitled to say.

---

## The list

Azad, M. A. K., Iqbal, N., Hassan, F., & Roy, P. (2023). An empirical study of high performance computing (HPC) performance bugs. In *2023 IEEE/ACM 20th International Conference on Mining Software Repositories (MSR)* (pp. 194–206). IEEE. https://doi.org/10.1109/MSR59073.2023.00037

Barrett, E., Bolz-Tereick, C. F., Killick, R., Mount, S., & Tratt, L. (2017). Virtual machine warmup blows hot and cold. *Proceedings of the ACM on Programming Languages, 1*(OOPSLA), Article 52. https://doi.org/10.1145/3133876

Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to algorithms* (4th ed.). The MIT Press.

Dijkstra, E. W. (1959). A note on two problems in connexion with graphs. *Numerische Mathematik, 1*, 269–271. https://doi.org/10.1007/BF01386390

Duan, R., Mao, J., Mao, X., Shu, X., & Yin, L. (2025). Breaking the sorting barrier for directed single-source shortest paths. In *Proceedings of the 57th Annual ACM Symposium on Theory of Computing* (pp. 36–44). Association for Computing Machinery. https://doi.org/10.1145/3717823.3718179

Elafrou, A., Goumas, G., & Koziris, N. (2017). Performance analysis and optimization of sparse matrix-vector multiplication on modern multi- and many-core processors. In *2017 46th International Conference on Parallel Processing (ICPP)* (pp. 292–301). IEEE. https://doi.org/10.1109/ICPP.2017.38

Qian, C., Childers, B., Huang, L., Guo, H., & Wang, Z. (2018). CGAcc: A compressed sparse row representation-based BFS graph traversal accelerator on hybrid memory cube. *Electronics, 7*(11), Article 307. https://doi.org/10.3390/electronics7110307

Saad, Y. (2003). *Iterative methods for sparse linear systems* (2nd ed.). Society for Industrial and Applied Mathematics. https://doi.org/10.1137/1.9780898718003

Traini, L., Cortellessa, V., Di Pompeo, D., & Tucci, M. (2023). Towards effective assessment of steady state performance in Java software: Are we there yet? *Empirical Software Engineering, 28*(1), Article 13. https://doi.org/10.1007/s10664-022-10247-x

---

## Requirement check

The assignment requires **at least 6 references, of which at least 3 are scholarly peer-reviewed articles**. This list carries **9 references, 6 of them peer-reviewed articles published 2017 or later and read in full**. Both thresholds clear with room to spare, and the peer-reviewed six are all recent and all verifiable by anyone with a browser.

| # | Source | Year | Peer-reviewed | Access route used | Read |
| --- | --- | --- | --- | --- | --- |
| 1 | Azad et al. | 2023 | Yes, MSR (IEEE/ACM) | Authors' free PDF, `foyzulhassan.github.io` | Full, 13 pp. |
| 2 | Barrett et al. | 2017 | Yes, PACMPL / OOPSLA | ACM gold OA (CC BY 4.0); read via arXiv 1602.00602 | Full, 40 pp. |
| 3 | Duan et al. | 2025 | Yes, ACM STOC | arXiv 2504.17033 | Full, 17 pp. |
| 4 | Elafrou et al. | 2017 | Yes, IEEE ICPP | arXiv 1711.05487 | Full, 10 pp. |
| 5 | Qian et al. | 2018 | Yes, *Electronics* | MDPI gold OA (CC BY 4.0), version of record | Full, 24 pp. |
| 6 | Traini et al. | 2023 | Yes, *Empir. Softw. Eng.* | Springer OA (CC BY 4.0), version of record | Full, 57 pp. |
| 7 | Cormen et al. | 2022 | No, textbook | — | Consulted |
| 8 | Dijkstra | 1959 | Yes, but pre-2017 | — | Consulted |
| 9 | Saad | 2003 | No, textbook | — | Consulted |

**Counting toward the peer-reviewed three: entries 1 through 6.** Entry 8 is a peer-reviewed journal article but falls outside the 2017-to-today window, so it is not counted even though it would qualify on venue. Entries 7 and 9 are books and never counted.

---

## What each source is for

| Source | The job it does |
| --- | --- |
| Azad et al. (2023) | **The assigned study.** The taxonomy, the two fix categories the experiments land in, the mlpack priority-queue commit and the CGAL list-to-vector commit, and the RQ4 expertise finding behind the code-complexity weakness. |
| Duan et al. (2025) | The report's central thesis, stated by theorists in 2025: Dijkstra "combined with advanced data structures such as the Fibonacci heap" gives O(m + n log n), the priority queue is named as the bottleneck, and the Θ(n log n) is attributed to maintaining a total order. Also the weaknesses section's sharpest line, that Dijkstra is provably not optimal for SSSP. |
| Cormen et al. (2022) | The two bounds Experiment 1 actually tests, O(V² + E) for the array scan and O((V + E) lg V) for the binary heap, plus the crossover condition E = o(V²/lg V). Duan et al. give neither of these, so the textbook stays. |
| Qian et al. (2018) | **Experiment 2's primary source.** CSR as "the de facto representation for sparse graphs", the three-array graph layout with the row-pointer trick, BFS-over-CSR pseudocode, and measured locality on nine real graphs: roughly 90% stall rate and 58.9% L1 miss rate. |
| Elafrou et al. (2017) | CSR defined in the matrix vocabulary as "the most widely-used general-purpose sparse matrix storage format"; the memory-bound framing; the honest note that rowptr and colind cost traffic; and above all the weaknesses evidence that there is "no one-size-fits-all solution" and that "blindly applying optimizations can actually hinder performance." |
| Saad (2003) | The classical three-array CSR definition. Now largely redundant given entries 5 and 6, retained as corroboration only. |
| Barrett et al. (2017) | **The benchmark protocol's defence, and the only source here that measured V8.** At most 43.5% of VM/benchmark pairs reach a steady state of peak performance; no VM was exempt; fixed warmup counts are indefensible; each process execution must be analysed separately; concrete 0.5s target and 0.1s floor for a timed unit. |
| Traini et al. (2023) | The large-scale confirmation that developers mis-estimate warmup: 586 benchmarks, ~9.056 billion invocations, 89.1% of forks steady but 43.5% of benchmarks inconsistent, median 41% distortion from measuring too early, and the "at least 5 forks" recommendation. |
| Dijkstra (1959) | The algorithm's origin, and the primary evidence that its own Step 2 names no data structure. Retained for the historical framing only. |

---

## Standing cautions for the writing session

Each of these is a claim the report is **not** entitled to make. Detail sits in the notes files, every one of which ends with its own Cautions section.

- **Duan et al. is pure theory.** No implementation, no benchmark, no measured runtime, and a comparison-addition model with a constant-degree graph transformation. Cite it for the framing and the O(m + n log n) reference point. Never imply the project implemented it or that its algorithm is fast in practice. It also gives neither the binary-heap nor the array-scan bound; those are Cormen et al.
- **Qian et al. never compare CSR against an adjacency list.** They take CSR as given. They support the claim that CSR is the standard graph representation and that its edge lists are contiguous. **The CSR-versus-adjacency-list comparison is the project's own contribution and must be presented as such.** Their 90% stall rate and 58.9% L1 miss rate are from a simulated CPU-plus-HMC system running C, not from V8, and must not be presented as the project's own numbers.
- **Elafrou et al. is SpMV on x86 and Xeon Phi against Intel MKL.** Not graphs, not shortest paths, not managed runtimes. Cite the CSR definition, the memory-bound framing, and the no-universal-optimization finding. Borrow none of its speedups, and do not cite it for a format-versus-format ranking, since it compares optimizations applied to CSR rather than storage formats.
- **Barrett et al. measured V8; Traini et al. measured the JVM.** Keep this straight. The claim "a peer-reviewed study benchmarked the runtime this project uses" belongs to Barrett et al. alone. Traini et al. transfer by analogy and the report must say so.
- **Do not lead with Traini et al.'s 123,937% mean.** It is a heavy-tailed arithmetic mean driven by a few projects. **The median of 41% is the number to lead with.** Likewise, do not quote their 89.1% fork figure without the 43.5% benchmark figure, or vice versa.
- **Do not use a coefficient-of-variation warmup detector and cite Barrett et al. as support.** Their §8 is a direct criticism of exactly that heuristic, finding it reports steady states for 78.1% of executions they classify as never reaching one.
- **The project's benchmarking will fall far short of both methodology papers, and the report should say so plainly.** Barrett et al. use a dedicated runner with OS-level controls, 30 process executions and 2000 iterations; Traini et al. ran 93 days of execution. The project has a two-minute Docker budget. Cite the standard, state the shortfall, do not claim compliance.
- **Neither methodology paper is about data structures.** No heaps, no priority queues, no graph representations, no asymptotics. Methodological use only.
- **Dijkstra (1959) contains no complexity analysis.** No asymptotic notation, no operation count. The O(V²) figure is a later attribution and belongs to Cormen et al. The paper also never states the non-negative-weight condition; **Duan et al. do state it**, in both the abstract and §2, and are the better citation for it.
- **Cormen et al.'s O((V + E) lg V) assumes DECREASE-KEY and a vertex-to-heap-index map**, and the project's lazy-deletion heap has neither. The bound still lands in the same place for simple graphs, but that reasoning is the report's to supply and must not be attributed to the book. CLRS also contains no CSR at all.
- **Version and pagination discipline.** Three core sources were read as author copies or extended versions whose pagination does not match the published article: Barrett et al. (arXiv 40 pp. vs. published 27 pp.), Duan et al. (arXiv 17 pp. vs. STOC 9 pp.), Elafrou et al. (arXiv author copy). **Quote these by section number, never by page.** Qian et al., Traini et al. and Azad et al. were read at their published pagination, or with a stated offset in Azad's case.
- **Two metadata judgements are recorded rather than hidden.** Barrett et al.'s "Article 52" rests on DBLP alone, because ACM's page returns HTTP 403 to automated requests; `*1*(OOPSLA), 1–27` is the fallback if a checker objects. Traini et al. is cited as 2023, the volume year printed in the article header, though Crossref's online-first date is 2022.

---

## Sources considered and set aside

Recorded so the decision is auditable, and so nobody re-adds them without reason. All were verified and read in an earlier pass; each was displaced by a source that is both more recent and freely readable.

| Set aside | Displaced by | Why |
| --- | --- | --- |
| Georges et al. (2007), *Statistically rigorous Java performance evaluation* | Barrett et al. (2017) | Barrett et al. cite it and then test its coefficient-of-variation heuristic directly, finding it reports steady states for 78.1% of executions that never reach one. Citing the superseded heuristic as authoritative would be a mistake. |
| Kalibera & Jones (2013), *Rigorous benchmarking in reasonable time* | Barrett et al. (2017), Traini et al. (2023) | Both newer papers cite it and carry its conclusion forward on larger corpora, one of them including V8. |
| Beamer et al. (2015), *Locality exists in graph processing* | Qian et al. (2018) | Beamer et al. never mention CSR, adjacency lists, or representation choice at all, which made it a poor fit for Experiment 2. Qian et al. are about CSR on graphs specifically. |
| Bell & Garland (2009), *Implementing sparse matrix-vector multiplication on throughput-oriented processors* | Elafrou et al. (2017), Qian et al. (2018) | A strong source, but 2009 and GPU/CUDA. The two newer papers cover CSR's definition and standing between them. |
| Fredman & Tarjan (1987), *Fibonacci heaps* | Duan et al. (2025) | Duan et al. cite it for exactly the claim the report wanted, that Dijkstra with a Fibonacci heap runs in O(m + n log n), from within the 2017-to-today window. Their §3 "lazy deletion" is in any case a different construction from the project's duplicate-entry binary heap. |
| Selakovic & Pradel (2016), *Performance issues and optimizations in JavaScript* | Barrett et al. (2017) | 2016, just outside the window. Its JavaScript measurement protocol and cross-engine instability finding are covered by Barrett et al., which also measured V8 and is inside the window. |

The notes files for all six remain in `notes/` and are still accurate. If the report later needs one of these claims and no in-window source carries it, the source can be restored to the list, but the recency and access rule at the top of this file should then be restated to say so.
