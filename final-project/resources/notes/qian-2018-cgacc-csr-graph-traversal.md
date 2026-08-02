# CGAcc: A Compressed Sparse Row Representation-Based BFS Graph Traversal Accelerator on Hybrid Memory Cube

**APA 7 reference**
Qian, C., Childers, B., Huang, L., Guo, H., & Wang, Z. (2018). CGAcc: A compressed sparse row representation-based BFS graph traversal accelerator on hybrid memory cube. *Electronics, 7*(11), Article 307. https://doi.org/10.3390/electronics7110307

**Recency and access.** Published 7 November 2018, inside the 2017-to-today window. **Gold open access under CC BY 4.0.** The published version of record was downloaded and read in full; there is no paywall and no author-version caveat.

*Verification.* Every field checked against three independent records plus the article itself, and they agree.

- **Crossref REST API** for `10.3390/electronics7110307` returns type `journal-article`, the full title above, the five authors Cheng **Qian**, Bruce **Childers**, Libo **Huang**, Hui **Guo**, Zhiying **Wang** in that order, container title *Electronics*, volume **7**, issue **11**, page/article **307**, publisher MDPI AG, issued 7 November 2018, ISSN 2079-9292, licence `https://creativecommons.org/licenses/by/4.0/`.
- **OpenAlex** independently returns the same title, year 2018, publication date 2018-11-07, the same five authors (rendering the second as "Bruce R. Childers"), venue *Electronics*, volume 7, issue 11, first and last page 307, OA status **gold**, licence cc-by.
- **Semantic Scholar** independently returns the same title, year 2018, venue *Electronics*, and the same five authors.
- **The article itself** carries the line "Electronics 2018, 7, 307; doi:10.3390/electronics7110307" in its own footer, and a dateline reading "Received: 1 October 2018; Accepted: 2 November 2018; Published: 7 November 2018". This closes the loop between the metadata and the artifact.
- **Not in DBLP.** DBLP does not index this MDPI journal for 2018, so no DBLP record exists. Three independent records plus the article's own footer is sufficient; the absence is recorded here rather than hidden.

**Full text.** Read in full. The PDF is the publisher's version of record and runs to **24 pages**, numbered "Electronics 2018, 7, 307" with "n of 24" footers, so PDF page *n* is article page *n* and locations below are exact.

**Fabrication check.** The paper exists, the DOI resolves, and it says exactly what it is being cited for. It is a hardware architecture paper that builds a BFS graph-traversal accelerator on the Hybrid Memory Cube, and it does so specifically on top of the Compressed Sparse Row representation, which it defines and whose traversal loop it gives in pseudocode. It also measures the cache behaviour of CSR graph traversal on conventional memory, which is the part the report needs.

---

## Key claims the report will draw on

- **CSR is stated to be the standard graph representation, in the authors' own words.** §1 says the authors use CSR "because it is the de facto representation for sparse graphs, which applies for almost all realistic large-scale graph applications." This is the peer-reviewed sentence Experiment 2 needs and could not previously get: a claim about CSR *for graphs*, not for matrices. (§1, p. 3.)
- **CSR is motivated by storage cost, which is exactly Experiment 2's metric.** §2.2 opens "To reduce capacity cost and improve storage efficiency, CSR representation is widely used to represent graphs." The report measures memory footprint, and here is a published statement that footprint is why the representation is used. (§2.2, p. 4.)
- **Their CSR-for-graphs layout matches the project's implementation.** §2.2 states that a CSR-based graph uses three arrays, vertex, edge and visited, and that "These arrays hold indexes rather than pointers." The traversal reads the work vertex's index into the vertex array at positions *Index* and *Index + 1*, and those two values delimit the range to read from the edge array. That is precisely the row-pointer scheme the project implements, described for graphs rather than for matrices. (§2.2, pp. 4–5.)
- **The pseudocode is BFS over CSR, and it is the report's own loop.** The listing in §2.3 pops a vertex, reads `Edge_Start = Vertex_List[Vertex_Index]` and `Edge_End = Vertex_List[Vertex_Index + 1]`, iterates the edge range, checks the visited array, and pushes unvisited neighbours. The report's BFS-over-CSR is structurally the same program. (§2.3 listing, p. 6.)
- **Graph traversal has poor spatial locality, and the paper says where the little locality there is comes from.** §2.4 opens "Graph traversal suffers from memory stalls and cache misses due to limited spatial locality. Spatial locality for traversal only exists in certain edge lists for a vertex." That second sentence is the mechanism behind CSR's benefit: contiguous edge lists are the one place locality lives. (§2.4, p. 6.)
- **Measured locality numbers on nine real graphs.** Evaluated on nine SNAP graph benchmarks (Table 1 lists them with vertex and edge counts, including Wiki at 2,394,385 vertices and 5,021,410 edges). The measured stall rate "approaches 90% on average", and "On average, the L1 miss rate was 58.9%." (§2.4, pp. 6–7 and Figs. 4–6.)
- **Prefetching does not rescue it, which is why layout matters.** Stream prefetching gave "a small speedup of 6.5% in the best case", improved the L1 miss rate by only 7.2%, and changed the stall ratio by "less than 0.1%". Stride prefetch is reported as inefficient and able to "even cause performance degradation" on this access pattern. (§2.3–§2.4, pp. 5–7.)
- **Where the misses are concentrated.** "In most cases, the edge array is several times larger than the visited and vertex arrays, which contributes to most of the misses." The remaining arrays still miss because they are accessed in a data-dependent order. Useful if the report wants to explain which part of a CSR graph dominates the footprint. (§2.4, p. 7.)
- **The accelerator result, for context only.** CGAcc achieved "an average 3.51× speedup (up to 7.4× speedup)" over a standard HMC with a stream prefetcher. (Abstract and §1, pp. 1 and 3.)

---

## Verbatim quotations, with locations

- "We use the Compressed Sparse Row (CSR) because it is the de facto representation for sparse graphs, which applies for almost all realistic large-scale graph applications. Some prior work has shown the efficiency of CSR compared to other formats." (§1, p. 3.)
- "To reduce capacity cost and improve storage efficiency, CSR representation is widely used to represent graphs [24]. For a CSR-based graph, three arrays (i.e., vertex, edge, visited) are used. ... These arrays hold indexes rather than pointers." (§2.2, pp. 4–5. The sentence is interrupted by a page break between pp. 4 and 5, marked by the ellipsis.)
- "The index of a work vertex leads to the corresponding two locations (Index and Index + 1) in the vertex array. These two values, which are fetched from vertex arrays, illustrate the range that the data should take from the edge array." (§2.2, p. 5.)
- "Graph traversal suffers from memory stalls and cache misses due to limited spatial locality. Spatial locality for traversal only exists in certain edge lists for a vertex." (§2.4, p. 6.)
- "The figure shows that nearly all of the ... benchmarks had a high stall rate, which approaches 90% on average." (§2.4, pp. 6–7. The sentence straddles the page break between pp. 6 and 7, marked by the ellipsis.)
- "Figure 6 shows the high L1 miss rate of the benchmarks as well. On average, the L1 miss rate was 58.9%. With stream prefetching, there was only a 7.2% improvement." (§2.4, p. 7.)
- "In turn, the high cache miss rate for graph traversal directly leads to poor performance." (§2.4, p. 7.)
- "This also means that such applications may not enjoy the benefits of high bandwidth, which the prefetch technique and parallel architecture rely on. These applications do not work very well due to their unpredictable access patterns, poor spatial locality and sometimes data-dependent accesses. Graph traversal is such an application that has an irregular access pattern." (§1, p. 2.)
- "Stride prefetch works well for sequential access patterns such as arrays and matrices. However, graph traversal is irregular and data-dependent, which causes stride prefetch to be inefficient. Stride prefetch can even cause performance degradation." (§2.3, p. 5.)
- "The graph shows that stream prefetch had a small speedup of 6.5% in the best case." (§2.3, p. 5.)

---

## Relevance to this project

- **It carries Experiment 2's peer-reviewed weight, and it does so better than a sparse-matrix source can.** The report's second experiment swaps an adjacency-list representation for CSR on a *graph*. This paper is about CSR on graphs specifically, defines the three-array layout for graphs, gives the BFS traversal over it, and states that CSR is the de facto choice. Nothing has to be borrowed from the matrix literature and re-aimed at graphs.
- **It supplies the locality argument the report is entitled to make.** The report explicitly declines to claim it measured cache misses on V8. What it can claim is that graph traversal is a workload with poor spatial locality, that the locality it does have lives in contiguous edge lists, and that a representation storing edges contiguously is therefore the sensible one. All three of those come from §2.4 and §2.2 with numbers attached.
- **It grounds the memory-footprint metric in a published motivation.** "To reduce capacity cost and improve storage efficiency" is the reason the authors give for CSR's popularity. Experiment 2 measures exactly that quantity, so the experiment is testing a stated rationale rather than an invented one.
- **It gives real-world scale for the limitations paragraph.** Table 1's nine SNAP graphs run to millions of vertices and edges, against the project's ceiling of roughly 500K edges. The report's stated limitation about synthetic graphs can cite a concrete sense of what production sizes look like.

---

## Cautions

- **This is a hardware architecture paper.** Its contribution is a prefetching accelerator in the logic layer of a Hybrid Memory Cube, simulated, not a software study. Cite it for the CSR representation, the traversal loop, and the measured locality characterisation of the baseline. Do not cite CGAcc's design or its 3.51× speedup as though it bore on the project's results.
- **The measurements are on a simulated CPU-plus-HMC system running C-level traversal code, not on V8.** The 90% stall rate and 58.9% L1 miss rate are properties of that setup. The report must not present them as the behaviour of its own TypeScript benchmark, and must not imply it reproduced them.
- **The paper never compares CSR against an adjacency list.** It takes CSR as given from the outset. It supports the claim that CSR is the standard and that its edge lists are contiguous; it does **not** supply a measured CSR-versus-adjacency-list comparison. That comparison is the project's own contribution, and the report must present it as such.
- **The paper gives no byte counts or footprint figures for CSR.** "Reduce capacity cost and improve storage efficiency" is a qualitative motivation. Any quantitative footprint claim in the report must come from the project's own measurement.
- **Its BFS is unweighted traversal, not Dijkstra.** It is a correct citation for the BFS-over-CSR structure, and it says nothing at all about priority queues, heaps, or weighted shortest paths. Keep it out of Experiment 1.
- **"De facto representation for sparse graphs" is the authors' assertion, supported by a gesture at prior work rather than by a survey.** It is a legitimate thing to quote and attribute, and the report should attribute it rather than state it as an unsourced fact.
- **Do not confuse its three arrays with the matrix CSR triple.** Here the arrays are vertex, edge and visited, where the visited array is a BFS working structure rather than part of the representation. The matrix formulation is `ptr`, `indices`, `data`. The report should pick one vocabulary and stay in it.
- **MDPI *Electronics* is a peer-reviewed journal and the article carries received, accepted and published dates.** It counts toward the peer-reviewed minimum. It is a journal article rather than a conference paper, so the APA entry uses volume, issue and article number.
