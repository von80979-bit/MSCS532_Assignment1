# Introduction to Algorithms (4th ed.)

**APA 7 reference**
Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to algorithms* (4th ed.). The MIT Press.

*Verification.* Edition, year, and publisher were confirmed against the Library of Congress MARC record for LCCN 2021037260 (retrieved from https://lccn.loc.gov/2021037260/marcxml), which gives statement of responsibility "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein", edition "Fourth edition.", imprint "Cambridge, Massachusett : The MIT Press, [2022]", extent "xx, 1291 pages", ISBN 9780262046305, and call number QA76.6 .C662 2022. Open Library's record for the same ISBN independently reports MIT Press, 2022, LCCN 2021037260, OCLC 1264174621. The Penguin Random House catalogue page, Penguin Random House being MIT Press's trade distributor, gives an on-sale date of **5 April 2022**, and Thomas Cormen's own faculty page at Dartmouth states that "The fourth edition was released on 5 April 2022." The book's copyright page confirms "© 2022 Massachusetts Institute of Technology" and the title-page publisher line "The MIT Press, Cambridge, Massachusetts, London, England", and its CIP block repeats LCCN 2021037260 and ISBN 9780262046305.

**ISBN.** 9780262046305 (hardcover), confirmed three ways: LoC, Open Library, and the book's own CIP block. Publisher listings also advertise an ebook, and the O'Reilly platform indexes it under 9780262367509, but that ebook ISBN could not be confirmed from a publisher or library record, so it is not asserted here. APA 7 does not carry ISBNs in the reference entry in any case.

**Page count.** The authoritative library figure is the LoC's "xx, 1291 pages". Retail listings say 1312 and Open Library says 1332; those are trim-inclusive counts and disagree with each other. Where the report needs a figure, use the LoC one.

**Chapter and section numbers.** No citation generator or search-result snippet was trusted for these. The MIT Press product page returns HTTP 403 to automated retrieval, retailer pages carry only an unnumbered partial contents list, and no library record for this title carries a MARC 505 contents note, so none of those could settle the numbering. The numbering below therefore comes from the **fourth edition's own table of contents** (pages v–xiii), read from a scanned and OCR'd copy of the fourth edition held on the Internet Archive (item `introduction-to-algorithms_202604`, whose front matter matches the verified LoC record: title page "Introduction to Algorithms, Fourth Edition", "The MIT Press, Cambridge, Massachusetts", "© 2022 Massachusetts Institute of Technology", CIP block with LCCN 2021037260 and ISBN 9780262046305). Every number cited was cross-checked against the section heading and the running head in the body text, and the TOC entry and the in-text heading agree in every case. Page numbers below are the fourth edition's own printed page numbers as they appear in the running heads.

Because the body text was read through OCR rather than from print, quotations were chosen from passages that came through cleanly, and the one place where a symbol could not be read with confidence is flagged at the point of use. Anyone quoting from these notes verbatim in the report should spot-check against a print or publisher copy.

Nothing in this file reuses third-edition numbering. The move is substantial: what was Chapter 22 "Elementary Graph Algorithms" in the third edition is **Chapter 20** in the fourth, and what was Chapter 24 "Single-Source Shortest Paths" is **Chapter 22**. Heapsort stays at Chapter 6. Anyone checking these notes against a third-edition copy will find the graph chapters two apart.

---

## Verified fourth-edition locations

| Topic the report needs | 4th ed. location | Printed page |
| --- | --- | --- |
| Binary heaps, array layout, `PARENT`/`LEFT`/`RIGHT` | Sec. 6.1, "Heaps" | 161 |
| Sift-down (`MAX-HEAPIFY`) | Sec. 6.2, "Maintaining the heap property" | 164 |
| Bottom-up heap construction | Sec. 6.3, "Building a heap" | 167 |
| Heapsort itself | Sec. 6.4, "The heapsort algorithm" | 170 |
| Priority queues, sift-up, `EXTRACT-MAX`, `INSERT`, `DECREASE-KEY` | Sec. 6.5, "Priority queues" | 172 |
| Array-backed FIFO queue with wraparound | Sec. 10.1.3, "Stacks and queues" | 254 |
| Whole graph chapter | Ch. 20, "Elementary Graph Algorithms" | 549 |
| Adjacency list vs. adjacency matrix | Sec. 20.1, "Representations of graphs" | 549 |
| Breadth-first search | Sec. 20.2, "Breadth-first search" | 554 |
| Whole SSSP chapter | Ch. 22, "Single-Source Shortest Paths" | 604 |
| Dijkstra's algorithm and its running times | Sec. 22.3, "Dijkstra's algorithm" | 620 |

For orientation, the surrounding fourth-edition graph chapters are 21 "Minimum Spanning Trees" (p. 585) and 23 "All-Pairs Shortest Paths"; Part VI "Graph Algorithms" opens at p. 547.

---

## Key claims the report will draw on

### Binary heaps (Ch. 6)

- A heap is stored in an array, and index arithmetic replaces pointers: `PARENT(i)` returns ⌊*i*/2⌋, `LEFT(i)` returns 2*i*, `RIGHT(i)` returns 2*i* + 1. The text notes that all three reduce to bit shifts on most machines and that good heapsort implementations inline them. (Sec. 6.1, p. 162.)
- The min-heap property is that *A*[`PARENT(i)`] ≤ *A*[*i*] for every node other than the root, so the smallest element sits at the root. CLRS develops the chapter with max-heaps and states directly that "Min-heaps commonly implement priority queues." (Sec. 6.1, p. 163.)
- A heap of *n* elements is based on a complete binary tree, so its height is logarithmic in *n*, and the basic operations run in time at most proportional to that height, hence O(lg *n*). (Sec. 6.1, p. 163, with Exercise 6.1-2.)
- `MAX-HEAPIFY`, the sift-down operation, satisfies *T*(*n*) ≤ *T*(2*n*/3) + Θ(1), which resolves by case 2 of the master theorem to O(lg *n*); equivalently O(*h*) on a node of height *h*. (Sec. 6.2, p. 166.)
- `BUILD-MAX-HEAP` runs in linear time. (Sec. 6.1, p. 163, and Sec. 6.3.)
- The sift-up operation is the `while` loop inside `MAX-HEAP-INCREASE-KEY`, which walks from the updated node to the root and therefore costs O(lg *n*). `MAX-HEAP-INSERT` appends a sentinel key and then calls it. (Sec. 6.5, p. 175.)
- The summary bound: a heap supports any priority-queue operation on a set of size *n* in O(lg *n*) time, **plus the overhead of mapping priority-queue objects to array indices**. That qualifier is the crux of the report's lazy-deletion design decision. (Sec. 6.5, p. 175.)
- CLRS flags the monotone-`EXTRACT-MIN` case that Dijkstra creates and states that for Dijkstra "it is particularly important that the DECREASE-KEY operation be implemented efficiently." (Chapter notes to Ch. 6, p. 180.)

### FIFO queues (Sec. 10.1.3)

- The queue is an array `Q[1:n]` with a `head` index and a `tail` index, where "we 'wrap around' in the sense that location 1 immediately follows location *n* in a circular order." This is precisely the ring buffer the report's BFS needs. (Sec. 10.1.3, p. 256.)
- `ENQUEUE` and `DEQUEUE` are four-line procedures and "Each operation takes O(1) time." (Sec. 10.1.3, p. 257.)

### Graph representations (Sec. 20.1)

- Adjacency list: an array `Adj` of |*V*| lists. Summed list length is |*E*| for directed graphs and 2|*E*| for undirected. Memory is O(*V* + *E*). Edge weights are stored alongside the neighbour in the list. (Sec. 20.1, pp. 550–551.)
- Adjacency matrix: a |*V*| × |*V*| matrix requiring Θ(*V*²) memory "independent of the number of edges in the graph," and Θ(*V*²) time to enumerate all edges. (Sec. 20.1, p. 551.)
- The trade-off is stated as a preference rule: adjacency lists for sparse graphs where |*E*| is much less than |*V*|², adjacency matrices when the graph is dense or when constant-time edge lookup is needed. CLRS also concedes that "adjacency matrices are simpler, and so you might prefer them when graphs are reasonably small," and that for unweighted graphs a matrix needs only one bit per entry. (Sec. 20.1, pp. 549–552.)

### Breadth-first search (Sec. 20.2)

- BFS "uses a single first-in, first-out queue (see Section 10.1.3)", holding vertices from at most two consecutive distance waves at any moment. (Sec. 20.2, p. 554.)
- The running time is O(*V* + *E*), derived by aggregate analysis: each vertex is enqueued and dequeued at most once for O(*V*) total queue time, each adjacency list is scanned at most once for O(*E*), plus O(*V*) initialisation. CLRS says BFS "runs in time linear in the size of the adjacency-list representation of *G*." (Sec. 20.2, p. 558.)
- BFS is named as the ancestor of both Prim's algorithm and Dijkstra's. (Sec. 20.2, p. 554.)

### Dijkstra's algorithm (Sec. 22.3)

- Dijkstra solves SSSP on a weighted directed graph "but it requires nonnegative weights on all edges." It replaces the FIFO queue of BFS with a min-priority queue keyed on the shortest-path estimate *d*. (Sec. 22.3, p. 620.)
- Operation counts: `INSERT` once per vertex, `EXTRACT-MIN` once per vertex, and `DECREASE-KEY` at most |*E*| times overall, by aggregate analysis over the adjacency lists. (Sec. 22.3, p. 623.)
- **Array implementation.** Store *v.d* in the *v*th entry of an array. `INSERT` and `DECREASE-KEY` are O(1), `EXTRACT-MIN` is O(*V*) because it scans the whole array, for a total of O(*V*² + *E*) = O(*V*²). This is exactly the report's Experiment 1 baseline. (Sec. 22.3, p. 623.)
- **Binary min-heap implementation.** With a heap "that includes a way to map between vertices and their corresponding heap elements", `EXTRACT-MIN` and `DECREASE-KEY` are each O(lg *V*), the heap is built in O(*V*), and the total is **O((*V* + *E*) lg *V*)**, which is O(*E* lg *V*) in the typical case |*E*| = Ω(*V*). (Sec. 22.3, p. 623.)
- **The crossover condition, stated explicitly.** The heap implementation improves on the O(*V*²) one "if *E* = o(*V*²/lg *V*)", that is, on sufficiently sparse graphs. (Sec. 22.3, p. 623.)
- **Fibonacci heap implementation.** O(*V* lg *V* + *E*), with `DECREASE-KEY` at O(1) amortised. CLRS adds the historical note that Fibonacci heaps were invented precisely because Dijkstra makes many more `DECREASE-KEY` calls than `EXTRACT-MIN` calls. (Sec. 22.3, p. 624.)

---

## Quotable sentences

- "the basic operations on heaps run in time at most proportional to the height of the tree and thus take O(lg *n*) time." (Sec. 6.1, p. 163. The immediately preceding clause bounds the height of an *n*-element heap and cites Exercise 6.1-2; whether the book sets that bound as O or Θ could not be read with confidence from the copy consulted, so it is left out of the quotation. Confirm from a print copy before quoting the height clause.)
- "The MAX-HEAPIFY procedure, which runs in O(lg *n*) time, is the key to maintaining the max-heap property." (Sec. 6.1, p. 163)
- "Min-heaps commonly implement priority queues, which we discuss in Section 6.5." (Sec. 6.1, p. 163)
- "In summary, a heap can support any priority-queue operation on a set of size *n* in O(lg *n*) time, plus the overhead for mapping priority queue objects to array indices." (Sec. 6.5, p. 175)
- "For Dijkstra's algorithm it is particularly important that the DECREASE-KEY operation be implemented efficiently." (Chapter notes to Ch. 6, p. 180)
- "Each operation takes O(1) time." (Sec. 10.1.3, p. 257, on ENQUEUE and DEQUEUE)
- "For both directed and undirected graphs, the adjacency-list representation has the desirable property that the amount of memory it requires is O(*V* + *E*)." (Sec. 20.1, p. 551)
- "The adjacency matrix of a graph requires Θ(*V*²) memory, independent of the number of edges in the graph." (Sec. 20.1, p. 551)
- "Although the adjacency-list representation is asymptotically at least as space-efficient as the adjacency-matrix representation, adjacency matrices are simpler, and so you might prefer them when graphs are reasonably small." (Sec. 20.1, p. 552)
- "Instead, it uses a single first-in, first-out queue (see Section 10.1.3) containing some vertices at a distance *k*, possibly followed by some vertices at distance *k* + 1." (Sec. 20.2, p. 554)
- "The operations of enqueuing and dequeuing take O(1) time, and so the total time devoted to queue operations is O(*V*)." (Sec. 20.2, p. 558)
- "The overhead for initialization is O(*V*), and thus the total running time of the BFS procedure is O(*V* + *E*). Thus, breadth-first search runs in time linear in the size of the adjacency-list representation of *G*." (Sec. 20.2, p. 558)
- "Because a shortest path in a weighted graph might not have the fewest edges, a simple, first-in, first-out queue won't suffice for choosing the next vertex from which to send out a wave." (Sec. 22.3, p. 620)
- "Each INSERT and DECREASE-KEY operation takes O(1) time, and each EXTRACT-MIN operation takes O(*V*) time (since it has to search through the entire array), for a total time of O(*V*² + *E*) = O(*V*²)." (Sec. 22.3, p. 623)
- "The total running time is therefore O((*V* + *E*) lg *V*), which is O(*E* lg *V*) in the typical case that |*E*| = Ω(*V*). This running time improves upon the straightforward O(*V*²)-time implementation if *E* = o(*V*²/lg *V*)." (Sec. 22.3, p. 623)

Typographic note: the printed book sets asymptotic notation in italics with proper Θ and Ω glyphs and uses small caps for procedure names. The quotations above preserve the wording exactly and normalise only the typography.

---

## Relevance to this project

- **It is the authority for all four hand-written data structures.** The binary min-heap comes from Sec. 6.1 through 6.5, the FIFO queue from Sec. 10.1.3 including the wraparound ring buffer, and the adjacency list from Sec. 20.1. Building each to CLRS's pseudocode is what lets the report call them "textbook form" and mean something checkable.
- **It supplies both halves of Experiment 1 from a single section.** Sec. 22.3 p. 623 states O(*V*² + *E*) = O(*V*²) for the array-with-linear-scan priority queue and O((*V* + *E*) lg *V*) for the binary min-heap, in consecutive paragraphs, for the same algorithm. The report does not need to assemble the comparison from two sources.
- **It gives the experiment a falsifiable prediction rather than a vague expectation.** The condition *E* = o(*V*²/lg *V*) tells the report in advance which graphs should show a heap advantage and which should not. A benchmark that sweeps density across that boundary and finds the crossover roughly where CLRS says it should be is a much stronger result than one that reports a single speedup number on one graph.
- **It justifies the FIFO-queue discipline in BFS.** Sec. 20.2's O(*V* + *E*) bound is derived from the assumption that enqueue and dequeue are O(1), which Sec. 10.1.3 establishes for the array-with-indices implementation. That is the precise reason `Array.shift` is disqualified: it breaks the O(1) premise the textbook bound is built on, and BFS silently degrades to O(*V*² + *E*). The report can state the mechanism instead of just asserting that `shift` is slow.
- **It anchors the architecture-agnostic claim.** The bounds in Sec. 22.3 are stated over abstract operation counts, with no reference to cache lines, memory hierarchy, or instruction set. That is what makes them portable to a managed JIT runtime, and it is the theoretical basis for the report's argument that measuring them on Node is a legitimate, and harder, test.
- **It marks the boundary of the heap design.** The O(lg *n*) priority-queue guarantee in Sec. 6.5 is stated "plus the overhead for mapping priority queue objects to array indices", and the Dijkstra analysis explicitly assumes a heap "that includes a way to map between vertices and their corresponding heap elements". The report's lazy-deletion heap deliberately declines to pay that overhead. CLRS is the source that makes the trade-off visible enough to defend.

---

## Cautions

- **This source does not count toward the report's peer-reviewed minimum.** It is a textbook, not a peer-reviewed research article in a journal or conference proceedings. Its copyright page does thank "the anonymous peer reviewers who provided comments on drafts of this book", which is MIT Press's editorial review of a book manuscript; that is not the same thing as peer review of a research contribution, and it does not change the classification. Every claim the report needs to attribute to peer-reviewed literature must rest on the MSR 2023 study, the ICSE 2016 study, or another article.
- **CLRS never uses the words "sift-up" or "sift-down."** A full-text search of the fourth edition returns no occurrence of "sift" in any form. CLRS calls the downward operation `MAX-HEAPIFY` or `MIN-HEAPIFY` (Sec. 6.2) and gives the upward operation no name of its own, since it lives inside `MAX-HEAP-INCREASE-KEY` (Sec. 6.5). The report may use the sift vocabulary, which is standard elsewhere, but must not put it in CLRS's mouth or quote it as CLRS's term.
- **CLRS 4e does not cover CSR.** "Compressed sparse row", "CSR", and any equivalent are absent from the fourth edition; a full-text search finds no occurrence. CLRS covers adjacency lists and adjacency matrices only, and Exercise 20.1-8 gestures at variants without naming CSR. **Do not cite CLRS for the CSR representation in Experiment 2.** CLRS supports only the adjacency-list side of that comparison and the general Θ(*V*²) versus O(*V* + *E*) framing. The CSR side needs its own source.
- **CLRS's O((*V* + *E*) lg *V*) bound is not the bound for a lazy-deletion heap.** The textbook analysis assumes a `DECREASE-KEY` operation and a vertex-to-heap-index map. A lazy-deletion heap has neither: it pushes a duplicate entry on every successful relaxation and discards stale pops, so the heap can hold up to |*E*| + |*V*| entries and each operation costs O(lg *E*). For a simple graph |*E*| < |*V*|², so lg *E* < 2 lg *V* and the bound is O((*V* + *E*) lg *V*) again, but only after that argument is made. The report must present the equivalence as its own reasoning, not as something CLRS states. CLRS's own note on Dijkstra's `DECREASE-KEY`-heavy operation mix (p. 624) is a fair thing to cite when explaining why the choice matters.
- **Do not claim CLRS predicts the heap will win.** It predicts the opposite for dense graphs: below the *E* = o(*V*²/lg *V*) threshold the O(*V*²) implementation is competitive or better. If the benchmark runs on dense graphs and the heap loses, that confirms CLRS rather than contradicting it, and the report should say so.
- **Dijkstra in CLRS requires nonnegative edge weights** (Sec. 22.3, p. 620). Generated benchmark graphs must respect that, and the report should state the constraint rather than leave it implicit.
- **Never cite third-edition numbering.** Chapter 22 in the fourth edition is Single-Source Shortest Paths, not Elementary Graph Algorithms. A reader with a third-edition copy who follows a mis-numbered citation lands in the wrong chapter entirely.
- **APA 7 in-text citations for a specific passage need a page number**, for example (Cormen et al., 2022, p. 623). Section numbers alone are not APA form, though they are useful alongside the page for the reader's benefit.
- **Page numbers here are from the fourth edition's own pagination.** They were read from the printed table of contents and confirmed against running heads in the body. Later printings correct errata without repaginating, so these should hold across printings, but a reader with a different printing should confirm from the section heading rather than the page number alone.
