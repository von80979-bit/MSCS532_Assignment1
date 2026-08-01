# Reference list

Drop-in APA 7 reference list for the final report. Alphabetical by first author surname, as APA 7 requires. In the Word document each entry takes a hanging indent of 0.5 inch, and the page is titled **References**, centred and bold.

Every entry below was verified against the source document plus at least two independent bibliographic records. The per-source notes files in `notes/` carry the verification trail, the claims each source supports, and the locations to cite. **Do not cite anything from this list without reading its notes file first** — several sources support a narrower claim than their titles suggest, and those limits are recorded there.

## The list

Azad, M. A. K., Iqbal, N., Hassan, F., & Roy, P. (2023). An empirical study of high performance computing (HPC) performance bugs. In *2023 IEEE/ACM 20th International Conference on Mining Software Repositories (MSR)* (pp. 194–206). IEEE. https://doi.org/10.1109/MSR59073.2023.00037

Beamer, S., Asanović, K., & Patterson, D. (2015). Locality exists in graph processing: Workload characterization on an Ivy Bridge server. In *2015 IEEE International Symposium on Workload Characterization* (pp. 56–65). IEEE. https://doi.org/10.1109/IISWC.2015.12

Bell, N., & Garland, M. (2009). Implementing sparse matrix-vector multiplication on throughput-oriented processors. In *Proceedings of the Conference on High Performance Computing Networking, Storage and Analysis* (pp. 1–11). Association for Computing Machinery. https://doi.org/10.1145/1654059.1654078

Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to algorithms* (4th ed.). The MIT Press.

Dijkstra, E. W. (1959). A note on two problems in connexion with graphs. *Numerische Mathematik, 1*, 269–271. https://doi.org/10.1007/BF01386390

Fredman, M. L., & Tarjan, R. E. (1987). Fibonacci heaps and their uses in improved network optimization algorithms. *Journal of the ACM, 34*(3), 596–615. https://doi.org/10.1145/28869.28874

Georges, A., Buytaert, D., & Eeckhout, L. (2007). Statistically rigorous Java performance evaluation. *ACM SIGPLAN Notices, 42*(10), 57–76. https://doi.org/10.1145/1297105.1297033

Kalibera, T., & Jones, R. (2013). Rigorous benchmarking in reasonable time. In *ISMM '13: Proceedings of the 2013 International Symposium on Memory Management* (pp. 63–74). Association for Computing Machinery. https://doi.org/10.1145/2464157.2464160

Saad, Y. (2003). *Iterative methods for sparse linear systems* (2nd ed.). Society for Industrial and Applied Mathematics. https://doi.org/10.1137/1.9780898718003

Selakovic, M., & Pradel, M. (2016). Performance issues and optimizations in JavaScript: An empirical study. In *Proceedings of the 38th International Conference on Software Engineering* (pp. 61–72). Association for Computing Machinery. https://doi.org/10.1145/2884781.2884829

## Requirement check

The assignment requires **at least 6 references, of which at least 3 are scholarly peer-reviewed articles**. This list carries **10 references, 8 of them peer-reviewed**, so both thresholds clear with room to spare.

**Peer-reviewed (8).** Azad et al. (MSR 2023), Beamer et al. (IISWC 2015), Bell and Garland (SC '09), Dijkstra (*Numerische Mathematik*), Fredman and Tarjan (*Journal of the ACM*), Georges et al. (OOPSLA '07, distributed as *SIGPLAN Notices*), Kalibera and Jones (ISMM '13), Selakovic and Pradel (ICSE 2016).

**Books, which do not count toward the peer-reviewed three (2).** Cormen et al. and Saad. Both are legitimate references and both are load-bearing, but neither is a peer-reviewed article and the report should not present them as such.

## What each source is for

| Source | The job it does |
| --- | --- |
| Azad et al. (2023) | The assigned study. The taxonomy, the two fix categories the experiments land in, the mlpack priority-queue commit and the CGAL list-to-vector commit, and the RQ4 expertise finding behind the code-complexity weakness. |
| Dijkstra (1959) | The algorithm's origin, and the primary evidence that its own Step 2 names no data structure. The near end of the "the data structure is the algorithm" argument. |
| Fredman and Tarjan (1987) | The far end of that argument: they analyse Dijkstra purely by counting heap operations and fix the non-heap work at O(n + m), so only the container term moves. Also the source for the non-negative-weight condition and for decrease-key as the operation lazy deletion gives up. |
| Cormen et al. (2022) | The two bounds Experiment 1 tests, O(V² + E) for the array scan and O((V + E) lg V) for the binary heap, plus the crossover condition E = o(V²/lg V). Also heaps, priority queues, BFS, and graph representations. |
| Saad (2003) | What CSR actually is: the three-array definition. Also the line tying storage-format choice to high performance computing directly. |
| Bell and Garland (2009) | The peer-reviewed statement that sparse storage format is a first-order performance decision, with CSR among the formats compared. Carries Experiment 2's peer-reviewed weight, which Saad cannot. |
| Beamer et al. (2015) | Locality as a real concern in graph workloads specifically, and the spatial-locality mechanism behind it. |
| Georges et al. (2007) | The benchmark protocol's defence: start-up versus steady-state, multiple invocations rather than multiple iterations, confidence intervals instead of a single number. Its abstract carries the explicit licence to apply this beyond Java. |
| Kalibera and Jones (2013) | How many repetitions are actually needed, and why an automated warm-up heuristic can be badly wrong. |
| Selakovic and Pradel (2016) | The warrant for moving an HPC finding into JavaScript, and the harder-test framing with a number behind it. Also a citable measurement protocol run on V8 itself. |

## Standing cautions for the writing session

These came out of verification and each one is a claim the report is **not** entitled to make. The detail sits in the notes files.

- **Dijkstra (1959) contains no complexity analysis.** No asymptotic notation, no operation count, only a storage argument and the remark that the work "seems to be considerably less." The O(V²) figure is a later attribution, so cite Cormen et al. for it. The paper also never states the non-negative-weight condition, and its Problem 2 is posed point to point rather than single source.
- **Fredman and Tarjan's "lazy deletion" is a different construction.** Their Section 3 lazy deletion is vacant-node deletion in an F-heap, credited to Cheriton and Tarjan, not the duplicate-entry scheme this project uses in a binary heap. Same name, different thing. They also never state the binary-heap bound; their baseline is Johnson's d-ary result.
- **Cormen et al.'s O((V + E) lg V) assumes DECREASE-KEY and a vertex-to-heap-index map**, and lazy deletion has neither. The bound still lands in the same place for simple graphs, but that reasoning is the report's to supply and must not be attributed to the book. Note also that CLRS never uses the word "sift", and contains no CSR at all.
- **Beamer et al. never mention CSR, adjacency lists, or representation choice.** Their claim is a correction of an overstatement, supported by a moderately high hit rate, and it must not be flattened into "graph processing has good locality" or blurred into Bell and Garland's territory.
- **Bell and Garland measured sparse matrix-vector multiplication on GPUs in CUDA.** Cite them for the principle that format choice matters and that CSR is the standard compact option. Do not borrow their speedup ratios or their bytes-per-FLOP figures, which the authors themselves call rough approximations, and do not imply this project reproduced any of it. They never compare CSR against an array-of-objects adjacency list, and they never discuss graphs as an application.
- **Neither Georges et al. nor Kalibera and Jones measured V8.** The measurement discipline transfers; no constant does. Kalibera and Jones directly test and criticise the coefficient-of-variation warm-up heuristic, so the report must not present a CoV threshold as an authoritative warm-up detector.
- **Selakovic and Pradel have no "inefficient data structure" root cause.** Their taxonomy is API-centric and nothing in it concerns asymptotic complexity, so they cannot serve as JavaScript-side evidence for data-structure optimization. Their role is the transfer warrant, the cross-engine instability finding, and the protocol.
- **DOIs must match the venue named in the same entry.** Both Georges et al. and Kalibera and Jones exist as two separately registered works, one journal and one proceedings. The pairings above are correct. Swapping a venue without swapping its DOI points a checker at a record that does not show the fields being claimed.
- **Two fields are deliberately absent rather than guessed.** Dijkstra carries no issue number, because the printed article has none and Crossref's `1(1)` is a back-file artifact. Bell and Garland carry a page range rather than an article number, because the article number could not be confirmed without a browser.
