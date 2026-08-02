# Breaking the Sorting Barrier for Directed Single-Source Shortest Paths

**APA 7 reference**
Duan, R., Mao, J., Mao, X., Shu, X., & Yin, L. (2025). Breaking the sorting barrier for directed single-source shortest paths. In *Proceedings of the 57th Annual ACM Symposium on Theory of Computing* (pp. 36–44). Association for Computing Machinery. https://doi.org/10.1145/3717823.3718179

**Recency and access.** Published 2025, inside the 2017-to-today window. Full text is freely readable at https://arxiv.org/abs/2504.17033 with no paywall, login, or institutional access.

*Verification.* Checked against two independent records, which agree.

- **Crossref REST API** for `10.1145/3717823.3718179` returns type `proceedings-article`, title "Breaking the Sorting Barrier for Directed Single-Source Shortest Paths", the five authors Ran **Duan**, Jiayi **Mao**, Xiao **Mao**, Xinkai **Shu**, Longhui **Yin** in that order, container title *Proceedings of the 57th Annual ACM Symposium on Theory of Computing*, pages **36–44**, publisher ACM, issued 15 June 2025, event "STOC '25: 57th Annual ACM Symposium on Theory of Computing" in Prague, Czechia.
- **DBLP** independently returns venue STOC, year 2025, pages 36-44, the same DOI, and the same five authors (its first author is disambiguated as "Ran Duan 0003"). DBLP also carries the arXiv version as `CoRR abs/2504.17033`, confirming that the freely readable copy and the STOC paper are the same work.

**Full text.** Read in full from arXiv (`arXiv:2504.17033v2 [cs.DS]`, dated 30 July 2025, 17 pages). **The arXiv version and the STOC version do not share pagination**: the STOC paper occupies 9 printed pages (36–44) while the arXiv copy runs to 17. Every location below therefore cites a **section or theorem number**, which is stable across both, and never a page number.

**Fabrication check.** The paper exists, the DOI resolves, and it says what it is being cited for. It is a theory paper whose stated result is a deterministic O(m log^(2/3) n)-time SSSP algorithm for directed graphs with real non-negative weights, presented explicitly as the first algorithm to beat the O(m + n log n) bound of Dijkstra's algorithm on sparse graphs.

---

## Key claims the report will draw on

- **Dijkstra's complexity is stated as a property of the data structure it is combined with.** The paper's own framing of the textbook result is that Dijkstra's algorithm "combined with advanced data structures such as the Fibonacci heap or the relaxed heap, solves SSSP in O(m+n log n) time." The algorithm and the container are named as separate ingredients, and only the container carries the log factor. This is peer-reviewed, 2025 support for the report's central thesis that the data structure decides the cost. (§1.)
- **The priority queue is named as the bottleneck, by the authors, in those words.** The technical overview describes Dijkstra as working "via a priority queue" that each time extracts the minimum-distance vertex and relaxes its outgoing edges, and states that because it sorts vertices by distance this results "in a time complexity of at least Θ(n log n)." §1's bottleneck discussion says the running-time bottleneck comes from the frontier sometimes containing Θ(n) vertices, so that maintaining a total order over them makes the Ω(n log n) sorting barrier unbreakable by that route. (§1, Technical Overview.)
- **The relaxation loop is separable from the container.** The paper's description of Dijkstra is precisely the report's step 3: extract the minimum, relax the outgoing edges, repeat. Nothing in the description fixes how the extract-min is implemented, which is exactly the freedom Experiment 1 exploits. (§1, Technical Overview.)
- **Non-negative weights are stated as a condition.** The problem is posed throughout on a graph with weight function w: E → R≥0, and the abstract repeats "real non-negative edge weights." This is a clean, citable statement of the precondition that BFS-to-Dijkstra exposition needs, and it is a condition Dijkstra's own 1959 paper never states. (Abstract; §2 Preliminaries.)
- **Dijkstra's algorithm is not optimal for SSSP.** The abstract's closing clause says the result shows "Dijkstra's algorithm is not optimal for SSSP." This is a valuable and honest caution for the report's weaknesses section: the heap-based Dijkstra the project implements is the practical standard, not a proven optimum.
- **There is a precise sense in which Dijkstra *is* optimal, and the paper states it.** §1 records that Haeupler, Hladík, Rozhoň, Tarjan and Tětek showed Dijkstra's algorithm is optimal if the algorithm is required to output the vertices in order of distance from the source. The distinction is that Dijkstra produces that ordering as a byproduct, and it is the ordering, not the distances, that costs the sorting term. The report can use this to explain *why* the priority queue costs what it costs.
- **Bellman-Ford is the named contrast that needs no sorting.** §1 describes Bellman-Ford as relaxing all edges for several steps and finding shortest paths with at most k edges in O(mk) time "without requiring sorting." Useful if the report wants one sentence on why the FIFO-versus-priority-queue distinction is the interesting one.

---

## Verbatim quotations, with locations

- "We give a deterministic O(m log^(2/3) n)-time algorithm for single-source shortest paths (SSSP) on directed graphs with real non-negative edge weights in the comparison-addition model. This is the first result to break the O(m + n log n) time bound of Dijkstra's algorithm on sparse graphs, showing that Dijkstra's algorithm is not optimal for SSSP." (Abstract. **The exponent is a typeset superscript** and text extraction detaches it, so the raw extracted abstract reads "O(m log n)" with a stray "2/3" on the line above. The exponent is confirmed by Theorem 1.1, which renders it inline as "O(m log^(2/3) (n)) time", and by §1.1's statement that the algorithm "breaks the sorting bottleneck on sparse graphs". Quote it as m log^(2/3) n.)
- "The textbook Dijkstra's algorithm [Dij59], combined with advanced data structures such as the Fibonacci heap [FT87] or the relaxed heap [DGST88], solves SSSP in O(m+n log n) time." (§1.)
- "Dijkstra's algorithm [Dij59]: via a priority queue, it each time extracts a vertex u with the minimum distance from the source, and from u relaxes its outgoing edges. It typically sorts vertices by their distances from the source, resulting in a time complexity of at least Θ(n log n)." (§1, Technical Overview.)
- "The running time bottleneck comes from the fact that sometimes the frontier may contain Θ(n) vertices. Since we constantly need to pick the vertex closest to source, we essentially need to maintain a total order between a large number of vertices, and are thus unable to break the Ω(n log n) sorting barrier." (§1, Technical Overview.)
- "Dijkstra's algorithm also produces an ordering of vertices by distances from the source as a byproduct. A recent contribution by Haeupler, Hladík, Rozhoň, Tarjan and Tětek [HHR+ 24] showed that Dijkstra's algorithm is optimal if we require the algorithm to output the order of vertices by distances." (§1.)
- "Bellman-Ford algorithm [Bel58]: based on dynamic programming, it relaxes all edges for several steps. For finding shortest paths with at most k edges, the Bellman-Ford algorithm can achieve this in O(mk) time without requiring sorting." (§1, Technical Overview.)
- "Based on the lower bound of Ω(n log n) for comparison-based sorting algorithms, it was generally believed that such sorting barrier exists for SSSP and many similar problems." (§1.2.)
- "Designing faster algorithms for SSSP is one of the most fundamental problems in graph theory, with exciting improvements since the 50s." (§1.)

---

## Relevance to this project

- **It is the modern, peer-reviewed statement of the report's thesis.** The report argues that the relaxation loop is fixed and the container is the variable. Duan et al. open by describing exactly that decomposition, and their entire contribution is obtained by changing how the frontier is managed rather than by changing what relaxation does. A 2025 STOC paper making the report's structural point is stronger evidence than a textbook assertion.
- **It supplies the O(m + n log n) reference point for Experiment 1's upper end.** The report's heap variant is a binary heap, not a Fibonacci heap, so the bound it tests is CLRS's O((V + E) lg V) rather than this one. But quoting the Fibonacci-heap bound alongside it lets the report show a *range* of container choices producing a range of bounds, which is the point Experiment 1 exists to make.
- **It gives the weaknesses section a genuinely current caution.** The assignment asks for the weaknesses of the chosen technique. "The optimization the project demonstrates is not the end of the story, and as of 2025 Dijkstra's algorithm is provably not optimal for this problem" is a much sharper closing observation than a generic remark about tradeoffs.
- **It licenses the report's treatment of the priority queue as the object of study.** Because the authors themselves attribute the Θ(n log n) to the need to maintain a total order, the report can say that Experiment 1 measures the cost of the ordering mechanism, and cite this for the framing rather than asserting it.

---

## Cautions

- **This is a theory paper. It contains no implementation, no benchmark, and no measured runtime.** Do not cite it for anything empirical, and do not imply that the O(m log^(2/3) n) algorithm has been shown to be fast in practice. The report's measured results have no relationship to this paper's result.
- **Do not imply the project implements this algorithm.** The project implements linear-scan Dijkstra and binary-heap Dijkstra. The recursive partitioning scheme described in §1 is not part of the codebase and should be discussed as context only.
- **The model is the comparison-addition model, and §2 assumes a constant-degree graph** obtained by a vertex-splitting transformation. These are theoretical conveniences. Do not present the bound as directly applicable to the project's generated graphs without stating the model.
- **The paper does not give the binary-heap bound or the array-scan bound.** It names the Fibonacci heap and the relaxed heap only. O(V²) and O((V + E) lg V) must be cited to Cormen et al., not to this paper.
- **It does not discuss graph representation, memory layout, CSR, or cache behaviour at all.** It is irrelevant to Experiment 2. Do not stretch it.
- **"Sorting barrier" is about asymptotics, not about wall-clock time.** The report must not paraphrase this as "sorting is slow" or connect it to the constant factors it actually measures.
- **Cite the STOC 2025 paper, and read the arXiv copy.** They are the same work but the STOC version is condensed to 9 pages. Because pagination differs, cite sections or theorems, never page numbers, and never quote a page number from the arXiv copy as though it were the published one.
- **This source counts toward the peer-reviewed minimum.** STOC is the ACM Symposium on Theory of Computing, a top-tier peer-reviewed conference, and this is a full paper in its main track.
