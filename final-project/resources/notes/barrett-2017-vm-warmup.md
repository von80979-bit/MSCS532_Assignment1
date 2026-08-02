# Virtual Machine Warmup Blows Hot and Cold

**APA 7 reference**
Barrett, E., Bolz-Tereick, C. F., Killick, R., Mount, S., & Tratt, L. (2017). Virtual machine warmup blows hot and cold. *Proceedings of the ACM on Programming Languages, 1*(OOPSLA), Article 52. https://doi.org/10.1145/3133876

**Recency and access.** Published 12 October 2017, inside the 2017-to-today window. The ACM version is **gold open access under CC BY 4.0** (Crossref and OpenAlex both record the licence), and the authors' full version is freely readable at https://arxiv.org/abs/1602.00602 with no paywall or login.

*Verification.* Every field checked against four independent records, which agree.

- **Crossref REST API** for `10.1145/3133876` returns type `journal-article`, title "Virtual machine warmup blows hot and cold", the five authors Edd **Barrett**, Carl Friedrich **Bolz-Tereick**, Rebecca **Killick**, Sarah **Mount**, Laurence **Tratt** in that order, container title *Proceedings of the ACM on Programming Languages*, volume **1**, issue **OOPSLA**, pages 1-27, publisher ACM, issued 12 October 2017, ISSN 2475-1421, licence `https://creativecommons.org/licenses/by/4.0/`.
- **DBLP** independently returns *Proc. ACM Program. Lang.* volume 1, issue OOPSLA, pages **52:1-52:27**, year 2017, the same DOI. That `52:1-52:27` form is DBLP's notation for **Article 52, 27 pages**, which is what fixes the article number. DBLP separately lists `CoRR abs/1602.00602` as the same work.
- **OpenAlex** independently returns the same title, the same five authors, publication date 2017-10-12, venue *Proceedings of the ACM on Programming Languages*, ISSN-L 2475-1421, volume 1, issue OOPSLA, and licence cc-by.
- **Semantic Scholar** independently returns the same title, the same authors, and the same venue and volume.

**On the article number.** Crossref and OpenAlex both render the location as pages 1–27 rather than as an article number; only DBLP gives `52:1-52:27`. ACM's own landing page could not be opened to confirm directly, since `dl.acm.org` returns HTTP 403 to automated requests. **The reference above uses "Article 52" on DBLP's authority.** PACMPL is an article-numbered journal in which every article's page range starts at 1, which is exactly why Crossref's "1-27" appears, so the two records are consistent rather than in conflict. If a checker objects, `*1*(OOPSLA), 1–27` is the defensible fallback.

**On the year.** Semantic Scholar reports 2016. That is the arXiv first-posting year leaking into its record. Crossref, DBLP and OpenAlex all give **2017**, which is the publication year of the OOPSLA volume and the year to cite.

**Full text.** Read in full from arXiv v6 (`arXiv:1602.00602v6 [cs.PL]`, dated 6 October 2017, **40 pages**). This copy labels itself "Draft, Vol. 0, No. 0, Article 0" and is longer than the 27-page published article, so **pagination does not correspond**. All locations below are given as **section numbers**, which are stable across both versions.

**Fabrication check.** The paper exists, the DOI resolves, and it says exactly what it is being cited for. It runs a large, heavily controlled benchmarking experiment across seven JIT-compiling virtual machines, **including V8 for JavaScript**, and reports that a large fraction of virtual-machine and benchmark pairs never reach a steady state of peak performance.

---

## Study design

- **Scale.** 3,660 process executions and **7,320,000 in-process iterations**, from benchmarks run for **2000 in-process iterations** repeated over **30 process executions**, on three different machines and two operating systems (Linux and OpenBSD). (Abstract, §1.1, §5.)
- **The seven VMs.** Graal, HHVM 3.15.3 (PHP), JRuby+Truffle, HotSpot, LuaJIT 2.0.4, PyPy 5.6.0, and **V8 5.4.500.43, described in the paper as "a JIT compiling VM for JavaScript."** (§3.3.)
- **The benchmarks.** Small, deterministic, widely studied microbenchmarks, provided in **C, Java, JavaScript, Python, Lua, PHP, and Ruby**. Determinism was enforced by comparing control-flow graphs across executions. (§3.1, §3.1.1.)
- **Classification method.** Changepoint analysis on the time series of iteration timings, classifying each process execution as one of four outcomes: **no steady state, flat, warmup, or slowdown**. Outliers are identified first, and the first 200 iterations are excluded from outlier detection so that genuine warmup data is not discarded as noise. (§1.1, §4.)
- **Controls.** A dedicated benchmark runner, Krun, with platform-independent and OS-specific controls over system state; measurements written to stdout only after all iterations complete, to keep I/O out of the timed region. (§3.5, §3.5.4.)

---

## Key claims the report will draw on

- **The two-phase model of JIT execution is the assumption being tested, and it fails.** The traditional view is that a program is slow during warmup and fast afterwards, and this "underlies nearly all JIT compiler benchmarking methodologies." The paper's hypothesis H1, "Small, deterministic programs reach a steady state of peak performance," is not supported. (§1, §1.1.)
- **The headline number.** "At most 43.5% of ⟨VM, benchmark⟩ pairs consistently reach a steady state of peak performance", and depending on machine and OS the figure is **30.0–43.5%**. (Abstract, §1.1.)
- **No VM was exempt, V8 included.** "Of the seven VMs we studied, none consistently reached a steady state of peak performance." (§1.1.)
- **Some programs get slower over time.** The four-way classification exists because real executions include *slowdown*, a measured decrease in performance over the run, alongside cases that never settle at all. (§1.1, §4.)
- **Discarding a fixed number of warmup iterations is not defensible.** "Even if one were to pick a very high number of initial in-process iterations to discard, there is no guarantee that the remainder would represent the steady state." (§9.)
- **One run does not represent another.** "one cannot assume that one process execution of a ⟨VM, benchmark⟩ pair is representative of others: each process execution must be analysed individually." This is the published argument for repeating whole process launches rather than only repeating iterations inside one. (§9.)
- **The widely used coefficient-of-variation warmup heuristic is measurably wrong.** Applying Georges et al.'s heuristic at the more conservative 0.01 threshold to their own data, "it also finds steady states for 78.1% of the process executions we classify as no steady state." They record this as confirming Kalibera and Jones's finding that simple heuristics mislead in VM benchmarking. (§8.)
- **Benchmarks must run long enough to clear the noise floor, with concrete targets.** Published benchmarks running for 0.001s or less are vulnerable to context switches; the suggested target is that "the fastest in-process iterations should run for around 0.5s", with **0.1s as the stated minimum acceptable**. (§9.)
- **Short runs are insufficient.** "Traditional VM experiments often run for 5 or 10 in-process iterations. Our results clearly show that, when a statistically robust analysis is desired, such short runs are insufficient." (§9.1.)
- **Report the classification, not just a single number.** They ask future work to report the benchmark's classification, when the steady state was reached, and its steady-state performance, because presenting steady-state numbers alone "is hard to defend": two VMs can be within 2× at steady state while warmup differs by 100-1000×. (§9.)

---

## Verbatim quotations, with locations

- "Virtual Machines (VMs) with Just-In-Time (JIT) compilers are traditionally thought to execute programs in two phases: the initial warmup phase determines which parts of a program would most benefit from dynamic compilation, before JIT compiling those parts into machine code; subsequently the program is said to be at a steady state of peak performance." (Abstract.)
- "Measurement methodologies almost always discard data collected during the warmup phase such that reported measurements focus entirely on peak performance." (Abstract.)
- "we show that even when run in the most controlled of circumstances, small, deterministic, widely studied microbenchmarks often fail to reach a steady state of peak performance on a variety of common VMs." (Abstract.)
- "Repeating our experiment on 3 different machines, we found that at most 43.5% of ⟨VM, benchmark⟩ pairs consistently reach a steady state of peak performance." (Abstract.)
- "Of the seven VMs we studied, none consistently reached a steady state of peak performance." (§1.1.)
- "V8 5.4.500.43 (a JIT compiling VM for JavaScript)." (§3.3.)
- "For each benchmark, we provide versions in C, Java, JavaScript, Python, Lua, PHP, and Ruby." (§3.1.)
- "our results undermine the previous VM benchmarking orthodoxy of benchmarks quickly and consistently reaching a steady state after a fixed number of iterations." (§9.)
- "It is clear that many benchmarks take considerable time to reach a steady state; that different process executions of the same benchmark reach a steady state at different points; and that some process executions do not ever reach a steady state." (§9.)
- "Even if one were to pick a very high number of initial in-process iterations to discard, there is no guarantee that the remainder would represent the steady state." (§9.)
- "our results also show that one cannot assume that one process execution of a ⟨VM, benchmark⟩ pair is representative of others: each process execution must be analysed individually to determine if, and when, a steady state is reached." (§9.)
- "Probably the most widely used method for detecting a steady state is that of Georges et al. [2007] which looks for in-process iterations where the coefficient of variance (standard deviation divided by the mean of the relevant measurements) falls below a threshold." (§8.)
- "However, it also finds steady states for 78.1% of the process executions we classify as no steady state, including Figure 2. This confirms the findings from [Kalibera and Jones 2013] that simple heuristics can often give misleading statistics for VM benchmarking." (§8.)
- "When possible, we suggest that the fastest in-process iterations should run for around 0.5s. ... In such cases we suggest the minimum acceptable time for an in-process iteration is 0.1s." (§9.)
- "Traditional VM experiments often run for 5 or 10 in-process iterations. Our results clearly show that, when a statistically robust analysis is desired, such short runs are insufficient." (§9.1.)
- "we believe that the traditional practise of presenting only steady state numbers is hard to defend. There are cases in our results where, for a given benchmark, two or more VMs have steady state performance within 2x of each other, but warmup differs by 100-1000x." (§9.)

---

## Relevance to this project

- **It is the peer-reviewed defence of the benchmark protocol, and unlike the older methodology literature it actually measured V8.** The report runs TypeScript on Node, which is V8. A source that includes V8 in its VM set removes the transfer argument entirely: the report is not borrowing Java-derived discipline and hoping it applies, it is citing a study that put the report's own runtime under the microscope and found it unreliable.
- **It converts the TypeScript defence from apology into argument.** The map's locked position is that a JIT and a garbage collector make V8 a *harder* test of an architecture-agnostic claim, not a weaker one. This paper is the evidence: on V8 and six other VMs, under stronger controls than the project can manage, most benchmark runs never settle at peak performance. An asymptotic gap that shows up clearly against that background noise is a robust result, not a lucky one.
- **It dictates concrete protocol decisions the report can justify by citation.** Repeat whole process launches rather than only iterations within one; do not trust a fixed warmup count; make each timed unit long enough to clear the noise floor, with 0.5s as the target and 0.1s as the floor; do not report a single steady-state number as if it were the whole story.
- **It gives the limitations section an honest and well-sourced sentence.** The project cannot run 30 process executions of 2000 iterations inside a two-minute Docker budget. Saying so, and citing the paper that shows what a statistically robust VM experiment actually costs, is far stronger than staying quiet about it.
- **It supersedes the older methodology sources on their own ground.** Georges et al. (2007) and Kalibera and Jones (2013) are both cited *inside* this paper, and §8 tests Georges et al.'s heuristic directly and finds it over-reports steady states. The report can cite Barrett et al. for the modern finding and does not need the older pair.

---

## Cautions

- **The paper is about microbenchmarks in seven VMs, not about data structures.** It says nothing about heaps, priority queues, graph representations, or asymptotic complexity. Its role is methodological only.
- **Do not present the 43.5% as a V8 figure.** It is the best case across all VM and benchmark pairs on the best machine and OS combination, and the range across configurations is 30.0–43.5%. V8-specific results live in the per-machine result tables and are not summarised by that number.
- **Do not use it to argue that JIT compilation does not work or that V8 is slow.** The finding is about the *stability and measurability* of performance, not about its level.
- **Do not adopt a coefficient-of-variation warmup detector and cite this paper as support.** §8 is a direct criticism of exactly that heuristic. Citing it while using a CoV threshold would invert the source.
- **The project's protocol will fall well short of this paper's rigour, and the report must not imply otherwise.** Barrett et al. use a dedicated benchmark runner with OS-level controls, 30 process executions, 2000 iterations, and changepoint analysis. The report should cite the paper as the standard it is aware of and state plainly where it fell short, rather than claiming compliance.
- **The VM versions are from 2016.** V8 5.4 is not a current Node.js engine. The methodological lesson transfers; no specific number does.
- **JavaScript, not TypeScript.** The benchmarks are plain JavaScript among six other languages. The connection to this project holds at the V8 runtime level, and the report should not imply TypeScript was studied.
- **Cite by section, never by page.** The freely readable arXiv copy is 40 pages and self-labels as a draft; the published article is 27. Page numbers do not correspond.
- **This source counts toward the peer-reviewed minimum.** *Proceedings of the ACM on Programming Languages* is a peer-reviewed journal, and the OOPSLA issue is the proceedings of a top-tier programming-languages conference.
