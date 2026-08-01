# An Empirical Study of High Performance Computing (HPC) Performance Bugs

**APA 7 reference**
Azad, M. A. K., Iqbal, N., Hassan, F., & Roy, P. (2023). An empirical study of high performance computing (HPC) performance bugs. In *2023 IEEE/ACM 20th International Conference on Mining Software Repositories (MSR)* (pp. 194–206). IEEE. https://doi.org/10.1109/MSR59073.2023.00037

*Verification.* Author names, affiliation (Department of Computer and Information Science, University of Michigan – Dearborn), and title read off page 1 of the PDF at https://foyzulhassan.github.io/files/MSR23_HPC.pdf. The PDF is the authors' preprint and carries no venue line, page numbers, or DOI, so venue, pages, and DOI were confirmed against two independent authoritative records rather than the PDF: DBLP (`conf/msr/AzadIHR23`, pages 194–206, DOI 10.1109/MSR59073.2023.00037) and the Crossref API (container title *2023 IEEE/ACM 20th International Conference on Mining Software Repositories (MSR)*, publisher IEEE, pages 194–206, published May 2023). Both agree. The preprint is exactly 13 pages and 194–206 is exactly 13 pages, so **PDF page *n* corresponds to proceedings page *193 + n***. Every location below is given as `PDF p. n / proc. p. m`, plus the section, so a reader can find it in either copy.

Note the author's own file spells the first author "Md Abul Kalam Azad" on the PDF; DBLP normalises it to "Md. Abul Kalam Azad". APA initials are unaffected.

---

## Study design

- **Corpus.** 23 open-source HPC projects, manually curated from national labs (LLNL, ORNL, NERSC), the Department of Defense, and academia, filtered to projects with **more than 1000 commits and more than 20 stars**. Domains span molecular dynamics, linear algebra, finite element, Monte Carlo, machine learning, and programming models. Table I lists all 23 with commit and star counts, including mlpack, LAMMPS, OpenBLAS, CGAL, FFTW3, ArrayFire, OpenFOAM, OpenMM, MFEM, Kokkos, GROMACS, CasADi, libMesh, TileDB, QMCPACK, preCICE, HYPRE, lattice-QUDA, Ginkgo, GlobalArrays, GOMC, Qbox, Elemental. (Sec. II-A and Table I, PDF p. 3 / proc. p. 196.)
- **Mining.** A JGit-based tool searched commit titles and descriptions for performance keywords (*performance, speed up, accelerate, fast, efficient, optimize*, and similar), yielding **1729 candidate performance commits**. (Sec. II-B, PDF p. 2–3 / proc. p. 195–196.)
- **Manual analysis.** Two iterations over roughly **seven months** and **over 1900 man-hours** (about 480 hours each across four authors), reducing 1729 candidates to **186 confirmed performance bugs**. Commits touching more than 20 source files were dropped as tangled. Inter-rater agreement by Fleiss' kappa was **0.64** for the performance/non-performance decision and **0.72** for root-cause classification, both "substantial." (Sec. II-C, PDF p. 3 / proc. p. 196.)
- **Research questions.** RQ1 causes of inefficiency, RQ2 how bugs are optimized, RQ3 bug-fixing effort, RQ4 developer expertise. (Sec. I, PDF p. 1 / proc. p. 194.)
- **Replication package.** https://figshare.com/s/00c24aae3177e45db7ab (Sec. I, PDF p. 2 / proc. p. 195.)

Language is not reported as a dimension. The projects are overwhelmingly C/C++ with CUDA and OpenMP, which is visible from the code listings, but the paper never states a language breakdown, so the report must not claim one.

---

## Root-cause taxonomy (RQ1)

The paper builds "an HPC performance bug taxonomy with **10 main categories**" (Sec. I, PDF p. 2 / proc. p. 195; restated as "10 major categories," Sec. III, PDF p. 3 / proc. p. 196). Figure 2 (PDF p. 4 / proc. p. 197) is the authoritative picture. Category names below are **verbatim**, with the paper's own abbreviations where it gives them.

Top-level counts, as printed in Figure 2 (n = 186):

| Category (verbatim) | Count | Share |
| --- | --- | --- |
| Algorithm /data-structure (73) — full name **"Inefficient algorithm, data structure, computational kernel, and their implementation (IAD)"** | 73 | 39.3% |
| **Micro-architectural (58)** — full name **"Inefficient code for underlying micro-architecture (MA)"** | 58 | 31.2% |
| **Inefficient parallelization (15)** — section heading **"Inefficient parallelization (PO)"** | 15 | — |
| **Memory management (13)** — section heading **"Inefficient memory management (IMM)"** | 13 | 7% |
| **Missing Parallelism (12)** — section heading **"Missing parallelism (MP)"** | 12 | — |
| **Concurrency control (7)** — section heading **"Inefficient Concurrency control (ICS)"** | 7 | 3.8% |
| **Logical error (3)** — "unintentional programming logic error (PE)" | 3 | — |
| **I/O (2)** — "IO inefficiency (IO)" | 2 | — |
| **Communication overhead (2)** — "unnecessary process communication (UPC)" | 2 | — |
| **Compiler regression (1)** — "compiler regression (CR)" | 1 | — |

The abstract's headline sentence (PDF p. 1 / proc. p. 194): "inefficient algorithm implementation (39.3%), inefficient code for target micro-architecture (31.2%), and missing parallelism and inefficient parallelization (14.5%) are the top three most prevalent categories." The third figure combines Missing Parallelism (12) and Inefficient parallelization (15) = 27, which is 14.5%.

### Sub-categories of the top category, IAD (73 commits, 39.3%)

Verbatim from Sec. III-A (PDF p. 3–5 / proc. p. 196–198) and Figure 2: computationally expensive operations (29), redundant operations (16), unnecessary operations (13), **use of inefficient data structure (9)**, repeated function calls (3), and use of improper data types (3).

- **Computationally expensive operation (29).** "Applications with this inefficiency pattern perform a set of operations that incurs high-computational overhead at the runtime. Some sources of these expensive operations include using an **inefficient algorithm or computational kernel**, expensive runtime evaluation instead of compile-time evaluation, **expensive data-structure traversals**, and higher-precision arithmetic operations." Named remedies: "compile-time evaluation, algorithmic strength reduction or approximation, caching, and reduced precision arithmetic." (PDF p. 3–4 / proc. p. 196–197.)
- **Inefficient data-structure (9).** "We found that **7 out of 9 commits of this category fix performance bugs originating from choosing an inefficient data structure library**." The worked example is TileDB-d51b082: a read query built on C++ STL `forward_list` is slow because "the `forward_list` implements a linked list data structure. As a result, traversing `forward_list` results in a **poor data locality compared to other cache-efficient data structures such as STL's `vector`**." (Sec. III-A-4, PDF p. 5 / proc. p. 198.)

### Sub-categories of MA (58 commits)

Sec. III-B (PDF p. 5–6 / proc. p. 198–199):

- **Inefficiency due to memory/data locality — 36 commits (19.4%).** Split into **inefficient cache access (18)** and **inefficient GPU-memory access (18, 9.7%)**. The cache-access discussion is a plain statement of the locality principle: "a cache-line, the basic building block of a cache, holds consecutive memory addresses. Any high-performance application traverses memory non-linearly will fail to utilize the cache-line locality and incur significant memory latency." Examples are false sharing (Kokkos-75fd8bc) and poor spatial locality from non-linear access (cp2k-7b34ac6).
- **Sub-optimal code generation by compiler — 9 commits (4.8%),** covering loop unrolling (5) and function inlining (3).

---

## Fix-strategy taxonomy (RQ2)

Section IV (PDF p. 7–9 / proc. p. 200–202) presents the "performance optimization catalog" in **seven lettered subsections**:

| Fix category (verbatim heading) | Count | Share | Location |
| --- | --- | --- | --- |
| A. **Micro-architecture specific optimization** | 64 | 34.4% | PDF p. 7 / proc. p. 200 |
| B. **Domain specific optimization** | 27 | 14.5% | PDF p. 8 / proc. p. 201 |
| C. **Guiding the compiler for missed optimization** | 27 | 14.5% | PDF p. 8 / proc. p. 201 |
| D. **Domain and architecture agnostic algorithm and data-structure optimization** | 17 | 9.1% | PDF p. 8 / proc. p. 201 |
| E. **Introduce parallelism and Balancing parallel load** | 17 introduce parallelism (9.1%) + 11 load balance (5.9%) | — | PDF p. 9 / proc. p. 202 |
| F. **Memory management** | 13 | 7% | PDF p. 9 / proc. p. 202 |
| G. **Eliminate unnecessary synchronization/barrier** | 7 | 3.8% | PDF p. 9 / proc. p. 202 |

### A. Micro-architecture specific optimization (64, 34.4%) — the layout axis

Breakdown, verbatim: "locality optimization for cache and memory (42), strength reduction (6), use of data types that reduces computation and memory overhead (4), using architecture-specific fast instruction (3), architecture-specific logic modification (3), choosing architecture specific fast kernel (3), and reduced precision arithmetic (3)."

**Data locality optimization — 42 commits (21%)**, itself broken into "**data structure optimization (7)**, tuning computational kernel size (6), reordering memory reference to improve temporal and spatial locality (5), reducing GPU-global memory access (5), thread-aware data access (3), improve register/cache utilization via blocking (2), avoid memory de-reference by storing data in register (2), memory pre-fetching and pinning (2)."

**Data structure optimization** is the sub-sub-category this project's Experiment 2 sits in, and its definition is close to a description of CSR (Sec. IV-A-1-a, PDF p. 7 / proc. p. 200):

> "Data structures that promote regular memory access improves spatial locality and thus lower the memory access latency. C++'s STL library provides `std::vector` and `std::array`. Both of the containers store objects in contiguous memory locations and thus cache efficient when accessed sequentially. On the other hand, STL's `std::list` is a doubly linked list and may incur a significant performance bottleneck in the cache. As a result, the CGAL-8855eb5 commit reported that it changed the lists to vectors in the code and observed performance improvement."

### D. Domain and architecture agnostic algorithm and data-structure optimization (17, 9.1%) — the priority-queue axis

Three named sub-strategies (Sec. IV-D, PDF p. 8 / proc. p. 201):

- **"Reducing asymptotic complexity of search algorithm."** Two examples, and the second is this project's exact move: "the GROMACS-a711d41 commit that implements binary search for molecule lookup in `atoms_to_settles` function, reducing the time-complexity of lookup to O(log n). In another instance, the **mlpack-198cec8 commit implements a priority queue for neighbor search algorithm where it performs the 'peek' operation at O(1) time**."
- **"Use of fast data structure interface."** `std::array` versus `std::vector`, ArrayFire-ee30e27.
- **"Caching/Memoization/Lookup table"** (3 caching/memoization, 2 static lookup tables), CGAL-351249b.

---

## Where this project's two axes land

The mapping is clean, and it is **asymmetric between root cause and fix** — both axes share a root cause but split across two different fix categories. That asymmetry is the most useful structural fact in this document, because it is what lets the report present a single technique applied at two levels rather than two unrelated techniques.

**Axis (a): replacing linear-scan extract-min with a binary heap.**

- *Root cause:* **Inefficient algorithm, data structure, computational kernel, and their implementation (IAD)**, 73 commits, 39.3%, the paper's largest category. Within it, the linear scan is a **computationally expensive operation** (29) by the paper's own definition, which names "using an inefficient algorithm or computational kernel" and "expensive data-structure traversals" as sources. It is *not* best filed under "use of inefficient data structure (9)", since that sub-category is specifically about picking the wrong library container (7 of its 9 commits).
- *Fix:* **Domain and architecture agnostic algorithm and data-structure optimization (D)**, 17 commits, 9.1%, sub-strategy **"Reducing asymptotic complexity of search algorithm."** The paper's own example under this exact heading is a commit that **introduces a priority queue** to a search algorithm. This is as close to a direct precedent as the paper offers.

**Axis (b): replacing a pointer-chasing adjacency list with contiguous CSR.**

- *Root cause:* **Inefficient code for underlying micro-architecture (MA)**, 58 commits, 31.2%, specifically **inefficiency due to memory/data locality** (36, 19.4%) and within that **inefficient cache access** (18). The paper's TileDB `forward_list` example under IAD's "inefficient data-structure" describes the same failure mode in different words, so this axis genuinely straddles the two root-cause categories; the report should say so rather than pretend the taxonomy is disjoint here.
- *Fix:* **Micro-architecture specific optimization (A)**, 64 commits, 34.4%, sub-category **data locality optimization** (42, 21%), sub-sub-category **data structure optimization** (7). The CGAL list-to-vector commit is the paper's example, and pointer-chasing linked structure to contiguous array is precisely adjacency list to CSR.

**Where the map's framing has to bend.** The map's shorthand "inefficient-data-structure-or-algorithm category" is close but not verbatim. The paper's category is "Inefficient algorithm, data structure, computational kernel, and their implementation (IAD)", abbreviated IAD; Figure 2 labels the box "Algorithm /data-structure (73)"; the abstract calls it "inefficient algorithm implementation (39.3%)". All three are the same category and any of them can be quoted, but the report must pick one form and use it consistently. Also, the paper separates *cause* taxonomy from *fix* taxonomy, so "the technique" the assignment asks for is a **fix** category, not a root cause: the honest naming is that this project demonstrates fix category D on axis (a) and fix category A's data-structure-optimization strategy on axis (b), against a shared root cause family. Note that the two are 9.1% and 34.4% of fixes respectively, so neither is fringe.

---

## Quotable findings

Each is verbatim; location is section plus PDF page and proceedings page.

**On the prevalence of the chosen category**
- "Our analysis identifies that inefficient algorithm implementation (39.3%), inefficient code for target micro-architecture (31.2%), and missing parallelism and inefficient parallelization (14.5%) are the top three most prevalent categories of performance issues for HPC applications." (Abstract, PDF p. 1 / proc. p. 194.)
- "We found that 73 out of 186 commits (39.3%) fix the performance issues that originated from the poor algorithm and data structure design and implementation." (Sec. III-A, PDF p. 3 / proc. p. 196.)
- "We found 58 commits (31.8%) to fix the performance bugs that originated from inefficient code for underlying hardware micro-architecture." (Sec. III-B, PDF p. 5 / proc. p. 198. **Cite the abstract's 31.2% instead**; see Discrepancies.)

**On data structures and locality — the direct support for Experiment 2**
- "Data structures that promote regular memory access improves spatial locality and thus lower the memory access latency." (Sec. IV-A-1-a, PDF p. 7 / proc. p. 200.)
- "Any high-performance application traverses memory non-linearly will fail to utilize the cache-line locality and incur significant memory latency." (Sec. III-B-1, PDF p. 5 / proc. p. 198.)
- "The `forward_list` implements a linked list data structure. As a result, traversing `forward_list` results in a poor data locality compared to other cache-efficient data structures such as STL's `vector`." (Sec. III-A-4, PDF p. 5 / proc. p. 198.)
- "STL's `std::list` is a doubly linked list and may incur a significant performance bottleneck in the cache." (Sec. IV-A-1-a, PDF p. 7 / proc. p. 200.)

**On asymptotic complexity and priority queues — the direct support for Experiment 1**
- "In another instance, the mlpack-198cec8 commit implements a priority queue for neighbor search algorithm where it performs the 'peek' operation at O(1) time." (Sec. IV-D-a, PDF p. 8 / proc. p. 201.)
- "One such example is the GROMACS-a711d41 commit that implements binary search for molecule lookup in `atoms_to_settles` function, reducing the time-complexity of lookup to O(log n)." (Sec. IV-D-a, PDF p. 8 / proc. p. 201.)

**On fixes being context-dependent rather than universally beneficial — the direct support for the density crossover**

This is the strongest thread in the paper for the report's weaknesses section, and it appears in at least four independent places.

- "The data-structure libraries such as C++'s STL provides various data structure containers. **However, the efficiency of the data structures depends on the use case.**" (Sec. IV-D-b, PDF p. 8 / proc. p. 201.) — the single best sentence in the paper for this project's crossover result.
- "Applications that know the size of the contiguous memory during compile-time can benefit from low overhead `std::array` over `std::vector`." (Sec. IV-D-b, PDF p. 8 / proc. p. 201.) — the same point stated as a precondition.
- "However, the performance impact of function inlining **is not always obvious and depends on the function, and it's invocation pattern**. Previous literature has shown that function inlining optimization may or may not occur depending on the compiler version." (Sec. III-B-2-b, PDF p. 6 / proc. p. 199.) — an optimization whose payoff is conditional, in the paper's own words.
- "Depending on the data-access pattern, each type of memory has advantages and disadvantages." (Sec. III-B-1-b, PDF p. 5 / proc. p. 198.)
- The `exp()` to `__expf()` case is an explicit accepted trade-off: "`__expf()` suffers from accuracy loss compared to `exp()`. Since the algorithm can tolerate the loss of accuracy, using computationally expensive `exp()` instead of `__expf()` is causing performance inefficiency." (Sec. III-A-1, PDF p. 3–4 / proc. p. 196–197.)

**On why this matters to developers — useful for the introduction and lessons learned**
- "To fix these performance bugs, the HPC application developers need in-depth knowledge about underlying hardware architecture, parallel programming models, **data-structure libraries**, compiler optimization techniques and their limitations, resource scheduling strategies of the runtime, and finally, the problem domain for domain-specific optimization opportunities. Due to cognitive overload, it becomes challenging for HPC application developers to write efficient code." (Sec. VIII, PDF p. 11 / proc. p. 204.)
- "while performance profiling tools can identify the code regions that spend significant time, they often fail to guide the developer with a meaningful performance optimization strategy." (Sec. IX-B, PDF p. 11 / proc. p. 204.)
- "it is important to accumulate the experience to guide the scientific software engineering community to write performance-efficient code." (Abstract, PDF p. 1 / proc. p. 194.)

---

## Theoretical expectations and reported magnitudes

The assignment requires comparing measured results against the study's theoretical expectations, so this section is what the lessons-learned section is scored against.

**The critical finding for this project: the paper reports no measured speedup for the priority-queue fix.** For mlpack-198cec8 it states only the asymptotic claim, `peek` at O(1). Likewise GROMACS-a711d41 is reported only as O(log n). The paper's expectation for fix category D is therefore **purely asymptotic**, with no constant factors, no crossover, and no measured magnitude. That is exactly the gap this project's Experiment 1 fills, and it is a defensible framing for the whole report: the study says asymptotic improvement is a real and recurring fix strategy but never quantifies when it pays.

Where the paper *does* report magnitudes, they come from individual commit messages, not from controlled experiments by the authors, and they are all outside the priority-queue strategy:

| Optimization | Reported magnitude | Location |
| --- | --- | --- |
| Padding to remove false sharing (Kokkos-75fd8bc) | "200x improvement for 20 threads on the Intel Skylake machine" | Sec. III-B-1-a, PDF p. 5 / proc. p. 198 |
| Early loop bail-out on sorted data (OpenMM-8bcff36) | "runtime speedup of 19×" | Sec. IV-B-b, PDF p. 8 / proc. p. 201 |
| Function inlining (libMesh-e0374af) | "the single line enjoys 6.3× speedup" | Sec. IV-C-a, PDF p. 8 / proc. p. 201 |
| SIMD vectorization of a loop (QUDA-5f028db) | "Vectorization of the loop achieves 1.5x speedup" | Listing 5 caption, PDF p. 6 / proc. p. 199 |
| Smaller data type, `float3` to `float` (GROMACS-85c36b9) | "1.25× and 1.4× for the Ewald and RF force-only kernels on AMD Vega GPU" | Sec. IV-A-b, PDF p. 7 / proc. p. 200 |
| Loop unrolling (ArrayFire-928e77a) | "an improvement of 1.2× in runtime" | Sec. IV-C-b, PDF p. 8 / proc. p. 201 |
| Loop invariant code motion (libMesh-1ad14f2) | "O(N splits/N procs) times performance improvement" | Sec. IV-C-c, PDF p. 8 / proc. p. 201 |
| Removing an unnecessary sort (HYPRE-827e799) | "substantial performance savings" (qualitative only) | Sec. IV-B-a, PDF p. 8 / proc. p. 201 |
| List to vector (CGAL-8855eb5) | "observed performance improvement" (qualitative only) | Sec. IV-A-1-a, PDF p. 7 / proc. p. 200 |

Two things follow for the report. First, the two changes closest to this project — CGAL's list-to-vector and mlpack's priority queue — are the two reported with **no number at all**, which strengthens rather than weakens the case for measuring them. Second, the reported magnitudes span 1.2× to 200×, so any claim that the study predicts a particular speedup for a data-structure change would be a misreading; the study's expectation is directional, not numeric.

## Effort and expertise findings (RQ3, RQ4)

Useful in the introduction to argue the problem is real and hard, and in lessons learned.

- "performance bug fixes are complicated with a median patch size (LOC) of 35 lines and are mostly fixed by experienced developers." (Abstract, PDF p. 1 / proc. p. 194.)
- "on average for performance issues, bug-fixing patches require around 80 lines whereas for non-performance it requires less than 50 lines." Mann-Whitney U-test p-values 0.00001 for patch size and 0.0455 for files changed, both below 0.05. (Sec. V, PDF p. 9 / proc. p. 202.)
- Median HPC skill score of performance-fixing developers 2.245 against 0.301 for all developers, Mann-Whitney p = 0.001. "only 4.4% of the HPC developers have a skill score higher than 2.245 ... We conclude that highly skilled developers are limited in number." (Sec. VI, PDF p. 10 / proc. p. 203.)
- Note the abstract says median patch size 35 while Sec. V says average around 80. These are different statistics of the same distribution, not a contradiction, but the report must not mix them.

## Threats the paper itself declares

Worth one sentence in the report's limitations, and it doubles as cover for this project's own narrower scope.

- Internal validity: manual categorization is subjective; "we acknowledge that mistakes may inevitably occur during the manual procedure." (Sec. VII, PDF p. 10 / proc. p. 203.)
- External validity: 186 commits from 23 projects; "Our manual project selection may cause some projects with large commits to be filtered out and it is possible that we missed some of the sub-domain as well." (Sec. VII, PDF p. 10 / proc. p. 203.)

---

## Discrepancies inside the paper

Recorded so the writing session picks the defensible number and is never caught contradicting the source.

1. **MA category share: 31.2% or 31.8%?** The abstract says 31.2%; Sec. III-B says "58 commits (31.8%)". 58/186 = 31.18%, so **31.2% is correct and the section text is a typo**. Cite the abstract.
2. **Number of fix categories: seven or eight?** The abstract says the authors "categorize them into eight performance fix types"; the conclusion says "we classified the performance bugs and fixes into ten and seven categories, respectively" (PDF p. 11 / proc. p. 204), and Section IV in fact has seven lettered subsections, A through G. The likely explanation is that subsection E bundles two strategies, "Introduce parallelism" and "Balancing parallel load," which counted separately gives eight. **Say "seven fix categories" and cite Section IV**, or avoid the count entirely; do not repeat the abstract's "eight" without noting Section IV shows seven.
3. **Missing parallelism count: 12 or 13?** Figure 2 prints "Missing Parallelism (12)" with children Vector parallelism (5), GPU parallelism (2), Instruction level parallelism (1), Task parallelism (4). Sec. III-C says "around 13 commits (7%)" and lists Task parallelism as (5). Similarly Sec. III-D says inefficient parallelization is "13 commits (7%)" while Figure 2 prints 15. **Prefer Figure 2's counts** and prefer the abstract's combined 14.5% for the parallelism family, which is consistent with 12 + 15 = 27.
4. **Missing count for the false-sharing example.** Sec. III-B-1-a says 18 commits fix cache-access inefficiency and 36 (19.4%) fix locality overall; 18 + 18 = 36 checks out.

None of these affect the numbers this project relies on most (39.3%, 31.2%, 9.1%, 34.4%, 21%, 73/186, 17 commits, 7 commits), all of which are internally consistent.

---

## Relevance to this project

- The report's technique is selected from the paper's **fix** taxonomy, not its cause taxonomy, and the two axes land in two different fix categories that share a cause family. This is the fact that decides the "one technique or two" question in *Justify the optimization technique against the study*.
- The paper supplies a direct precedent for each experiment: mlpack's priority queue for Experiment 1, CGAL's list-to-vector for Experiment 2. Both are named commits in named HPC projects, so the report can argue relevance concretely rather than by analogy.
- The paper's expectation for both is **asymptotic or directional and never quantified**, so the project's contribution is measurement, and the density crossover contributes something the paper explicitly gestures at ("the efficiency of the data structures depends on the use case") but never locates.
- The corpus is C/C++ HPC code, which is the honest gap this project has to address when defending TypeScript. The paper's own micro-architectural findings, cache lines and spatial locality, are runtime-independent, but its compiler and GPU findings are not; the report should lean on the locality and asymptotic-complexity threads and stay away from claiming the compiler findings transfer to V8.
