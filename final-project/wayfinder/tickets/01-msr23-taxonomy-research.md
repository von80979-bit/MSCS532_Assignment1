# Extract the MSR'23 performance-bug taxonomy

Labels: wayfinder:research
Type: AFK
Status: closed
Blocked by: (none — frontier)
Assignee: agent

## Question

Read the assigned empirical study and capture what it actually says, so that every downstream claim cites the paper rather than a paraphrase. The technique justification cannot be written against a summary from memory.

Source: *An Empirical Study of High Performance Computing (HPC) Performance Bugs*, MSR 2023, https://foyzulhassan.github.io/files/MSR23_HPC.pdf

Extract and record:

- **Study design.** What corpus was studied, how many bugs, drawn from which projects and languages, and by what method. The report needs this to describe the study credibly in a paragraph.
- **Root-cause taxonomy.** The paper's own category names, verbatim, with their definitions and the reported frequency or proportion of each. Do not rename or merge categories.
- **Fix-strategy taxonomy.** Likewise: the categories of fix the paper identifies, verbatim, with frequencies.
- **Which categories cover this project's two axes.** Map precisely: (a) replacing a linear scan with a heap-backed priority queue, and (b) replacing a pointer-chasing adjacency list with a contiguous CSR layout. Name the exact category each falls under. If the paper splits or combines them differently than expected, say so plainly — the map's framing bends to the paper, not the reverse.
- **Quotable findings.** Specific sentences or statistics usable in the report, each with its page or section location, especially anything about fixes being context-dependent rather than universally beneficial. That claim is what the density-crossover result speaks to directly.
- **Theoretical expectations.** Anything the paper says about expected or observed magnitude of improvement. The assignment requires comparing the measured results against the study's theoretical expectations, so this is what the "lessons learned" section is measured against.
- **Verified APA 7 citation.** Full authors, year, title, proceedings name, pages, DOI or URL, checked against the PDF itself rather than a citation generator.

Output: a notes file at `final-project/resources/notes/msr23-hpc-performance-bugs.md`, every fact traceable to a location in the PDF. Follow the per-source verified-notes pattern used in `residency-project-event-queue/resources/notes/`.

This ticket blocks [Justify the optimization technique against the study](02-technique-justification.md).

## Resolution

Notes file written to `final-project/resources/notes/msr23-hpc-performance-bugs.md`. The full 13-page PDF was read end to end, not summarized from memory, and every fact in the notes carries a section plus a page location.

**Citation, verified.** Azad, M. A. K., Iqbal, N., Hassan, F., & Roy, P. (2023). An empirical study of high performance computing (HPC) performance bugs. In *2023 IEEE/ACM 20th International Conference on Mining Software Repositories (MSR)* (pp. 194–206). IEEE. https://doi.org/10.1109/MSR59073.2023.00037

The PDF at the assigned URL is the authors' preprint: no venue line, no page numbers, no DOI. Authors, title, and affiliation came off page 1 of the PDF; venue, pages, and DOI were confirmed against DBLP (`conf/msr/AzadIHR23`) and the Crossref API independently, and both agree. The preprint is exactly 13 pages and 194–206 is exactly 13 pages, so **PDF page n maps to proceedings page 193 + n**; the notes give both numbers for every location so either copy can be checked.

**Study design.** 1729 candidate performance commits mined by keyword from 23 open-source HPC projects (>1000 commits, >20 stars, curated from LLNL/ORNL/NERSC, DoD, and academia), reduced by two iterations of manual analysis over roughly seven months and 1900+ man-hours to **186 confirmed performance bugs**. Fleiss' kappa 0.64 on the performance/non-performance decision and 0.72 on root-cause classification. The paper never reports a language breakdown, so the report must not claim one; the corpus is visibly C/C++/CUDA/OpenMP from the listings.

**Root-cause taxonomy: 10 categories.** Top three by Figure 2 count — Algorithm/data-structure (73, 39.3%), Micro-architectural (58, 31.2%), and the parallelism family (Missing Parallelism 12 + Inefficient parallelization 15 = 27, 14.5%). Full verbatim names, all ten counts, and the sub-category breakdowns are in the notes.

**Fix taxonomy: seven lettered categories** in Section IV — Micro-architecture specific optimization (64, 34.4%), Domain specific (27, 14.5%), Guiding the compiler (27, 14.5%), Domain and architecture agnostic algorithm and data-structure optimization (17, 9.1%), Introduce parallelism and balance load, Memory management (13, 7%), Eliminate unnecessary synchronization (7, 3.8%).

**The two axes map cleanly, and asymmetrically.** This is the most consequential finding for the map.

- **Heap replacing linear scan.** Root cause: *Inefficient algorithm, data structure, computational kernel, and their implementation (IAD)*, 39.3%, specifically the "computationally expensive operation" sub-category (29), whose definition names "using an inefficient algorithm or computational kernel" and "expensive data-structure traversals." Fix: category **D, Domain and architecture agnostic algorithm and data-structure optimization** (17, 9.1%), sub-strategy "Reducing asymptotic complexity of search algorithm." The paper's own example under that exact heading is **mlpack-198cec8, a commit that introduces a priority queue** to a neighbor-search algorithm. A direct precedent, not an analogy.
- **CSR replacing adjacency list.** Root cause: *Inefficient code for underlying micro-architecture (MA)*, 31.2%, sub-category memory/data locality (36, 19.4%), sub-sub inefficient cache access (18). Fix: category **A, Micro-architecture specific optimization** (64, 34.4%), sub-category data locality optimization (42, 21%), sub-sub-category **data structure optimization (7)**, whose worked example is **CGAL-8855eb5, changing STL lists to vectors** — pointer-chasing to contiguous, which is adjacency list to CSR in different words.

Two consequences the framing must absorb. First, the assignment's "technique" is a **fix** category, not a root cause, and the two axes sit in **two different fix categories** (D and A) that share a root-cause family. That is the material input to *Justify the optimization technique against the study* and it argues for the "one headline technique applied at two levels of the memory hierarchy" framing, since neither fix category subsumes the other. Second, the paper's TileDB `forward_list` example files a locality problem under IAD rather than MA, so the two root-cause categories are not disjoint here and the report should say so rather than pretend otherwise.

**Naming.** The map's shorthand "inefficient-data-structure-or-algorithm category" is not verbatim. The paper uses three forms for the same category — the full IAD name, Figure 2's "Algorithm /data-structure", and the abstract's "inefficient algorithm implementation." Pick one and hold it.

**Theoretical expectations, and the gap this project fills.** The paper reports **no measured magnitude for either of this project's two changes**. mlpack's priority queue is reported only as "peek at O(1)"; CGAL's list-to-vector is reported only as "observed performance improvement." Where the paper does give numbers they are quoted from commit messages and span 1.2× to 200×, none of them on the priority-queue or layout strategies. So the study's expectation for both axes is **asymptotic and directional, never numeric**, which is a strong and defensible framing for the whole report: measurement is the contribution, and any claim that the study predicts a specific speedup would misread it.

**Context-dependence, the density crossover's anchor.** Four independent passages support it. The best is Section IV-D-b, PDF p. 8 / proc. p. 201: *"the efficiency of the data structures depends on the use case."* Also the conditional framing of `std::array` versus `std::vector`, the inlining passage ("not always obvious and depends on the function, and it's invocation pattern"), and the GPU memory-space passage. The measured crossover locates something the paper explicitly gestures at but never pins down.

**Discrepancies inside the paper**, recorded so no writing session gets caught contradicting the source: the MA share is 31.2% in the abstract but 31.8% in Section III-B (58/186 = 31.2%, the section is a typo); the abstract claims **eight** fix types while the conclusion and Section IV both show **seven**; Figure 2's parallelism counts (12 and 15) disagree with Sections III-C and III-D (13 and 13). The notes say which number to cite in each case. None of these touch the figures this project depends on.

Also captured for later use: effort findings (median patch 35 LOC, mean ~80 versus <50 for non-performance bugs, Mann-Whitney p = 0.00001), expertise findings (median skill 2.245 versus 0.301, only 4.4% of developers above that), and the paper's own declared threats to validity, which double as cover for this project's narrower scope.

No new tickets and no fog graduated: the map already holds the questions this answer feeds, and the finding lands squarely inside *Justify the optimization technique against the study*, which is now unblocked.
