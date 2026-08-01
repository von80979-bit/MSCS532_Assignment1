# Statistically Rigorous Java Performance Evaluation

**APA 7 reference**

Recommended form (proceedings published in journal format):

Georges, A., Buytaert, D., & Eeckhout, L. (2007). Statistically rigorous Java performance evaluation. *ACM SIGPLAN Notices*, *42*(10), 57–76. https://doi.org/10.1145/1297105.1297033

Equally defensible alternative (proceedings form). Use one or the other, never a mixture:

Georges, A., Buytaert, D., & Eeckhout, L. (2007). Statistically rigorous Java performance evaluation. In *Proceedings of the 22nd annual ACM SIGPLAN conference on Object-oriented programming systems, languages and applications* (pp. 57–76). Association for Computing Machinery. https://doi.org/10.1145/1297027.1297033

*Verification.* Every field was checked against three independent records and the paper itself. The Crossref REST API returns two distinct registered works for this article. One is a `proceedings-article` under DOI `10.1145/1297027.1297033`, container title *Proceedings of the 22nd annual ACM SIGPLAN conference on Object-oriented programming systems, languages and applications*, pages 57–76, event "OOPSLA07 … Montreal Quebec Canada", published 2007-10-21, ISBN 978-1-59593-786-5 (from the parent proceedings record `10.1145/1297027`). The other is a `journal-article` under DOI `10.1145/1297105.1297033`, container title *ACM SIGPLAN Notices*, volume 42, issue 10, pages 57–76, ISSN 0362-1340 / 1558-1160. DBLP (`conf/oopsla/GeorgesBE07`) records the conference identity only, with authors Andy Georges, Dries Buytaert, Lieven Eeckhout, pages 57–76, year 2007, DOI `10.1145/1297027.1297033`. Author list, spelling, initials, and title capitalization were then read directly off page 1 of the PDF, which gives "Andy Georges, Dries Buytaert, Lieven Eeckhout, Department of Electronics and Information Systems, Ghent University, Belgium." The ACM Digital Library landing page could not be retrieved (HTTP 403 from an automated client), so no field rests on it; each field above is corroborated by at least two of Crossref, DBLP, and the PDF.

**Resolving the proceedings-versus-*SIGPLAN Notices* question.** Both identities are real, and the choice is a citation-style question rather than a factual one. The OOPSLA '07 proceedings were distributed to ACM SIGPLAN members as *ACM SIGPLAN Notices* 42(10), which is why the same article carries a volume, an issue, an ISSN, and its own journal DOI. APA 7 (§10.5) directs that proceedings published in journal format be cited using the journal-article template and that proceedings published in book form use the edited-book template, so the *SIGPLAN Notices* form is the one APA's own rule points at, and it is the form that yields the volume/issue/page triple the report already had. The proceedings form is not wrong; DBLP indexes it, and Kalibera and Jones themselves cite the paper that way in their reference [9]. The one combination that is indefensible is the one the project brief started from: venue given as *ACM SIGPLAN Notices*, 42(10), 57–76 with DOI 10.1145/1297027.1297033. That DOI resolves to the proceedings record, which carries no volume or issue, so the reference would point a checker at a page that does not show the fields being claimed. Whichever form the report picks, **the DOI must match the venue named in the same entry.**

**Full text.** Obtained and read in full. The copy used is the camera-ready PDF hosted by co-author Dries Buytaert at https://buytaert.net/files/oopsla07-georges.pdf, produced by pdfeTeX on 1 October 2007 and carrying the OOPSLA '07 copyright block ("OOPSLA'07, October 21–25, 2007, Montréal, Québec, Canada. Copyright © 2007 ACM 978-1-59593-786-5/07/0010"), which independently confirms the venue, dates, and ISBN. The PDF is exactly 20 pages and the published range 57–76 is exactly 20 pages, and the article's opening and closing material fall on the first and last PDF pages, so **PDF page *n* corresponds to published page *56 + n***. Locations below are given as `PDF p. n / pub. p. m` plus the section, and the mapping is inferred from page count rather than from printed folios, which the camera-ready does not carry.

**Fabrication check.** The work exists, the authors and venue are as stated, and the paper does say what it is cited for. The start-up/steady-state distinction, the multiple-VM-invocations recommendation, the confidence-interval machinery, and the survey finding about single-number reporting are all present in the text and are quoted verbatim below.

---

## Key claims the report will draw on

- **The problem is data analysis, not just experimental design.** The paper separates *experimental design* (how the runs are set up) from *data analysis* (how the numbers are summarised) and argues both matter equally. Its target is the second. (Sec. 2.1, PDF p. 4 / pub. p. 60.)

- **Survey of 50 papers from OOPSLA, PLDI, VEE, ISMM, and CGO, published 2000 onwards.** Sixteen of the 50 do not state their methodology at all. Only 4 of 50 report confidence intervals; the rest report a single number. The most common summaries are "average" (8 papers) and "best" (10 papers); median, second best, and worst account for 4, 4, and 3. Replay compilation is used in 7 of the 50. (Sec. 2 and 2.1.1, PDF p. 3–4 / pub. p. 59–60.)

- **Sources of non-determinism in a managed runtime.** JIT compilation driven by timer-based method sampling, thread scheduling in the OS and VM, garbage collection timing (itself perturbed by the first two, and in turn perturbing program locality), and general system effects such as interrupts. The first three are specific to managed runtimes; the last is not. (Sec. 1, PDF p. 2 / pub. p. 58.)

- **Start-up versus steady-state.** Two differences are stated explicitly: start-up includes class loading and steady-state does not, and start-up is affected by JIT compilation substantially more than steady-state is. (Sec. 4.1, PDF p. 9 / pub. p. 65.)

- **Recommended protocol for start-up (two steps).** (1) Time multiple VM invocations, each running a *single* benchmark iteration, giving *p* measurements. (2) Compute a confidence interval; use the normal *z*-statistic above 30 measurements and the Student *t*-statistic below. The **first VM invocation is discarded** to restore independence, because it warms shared system state such as dynamically loaded libraries in physical memory and data in the disk cache. (Sec. 4.1, PDF p. 9 / pub. p. 65.)

- **Recommended protocol for steady-state (four steps).** (1) Run *p* VM invocations of at most *q* iterations each, retaining *k* per invocation. (2) Per invocation, find the iteration *s_i* at which the coefficient of variation of the last *k* iterations drops below a preset threshold, "say 0.01 or 0.02". (3) Take the mean of those *k* iterations within each invocation. (4) Compute the confidence interval **across the per-invocation means**, not across raw iterations. (Sec. 4.2, PDF p. 10 / pub. p. 66.)

- **Why multiple invocations rather than more iterations inside one invocation.** This is the load-bearing methodological point. Iterations within a single VM invocation are *not statistically independent*; the per-invocation means across invocations *are*. Confidence intervals computed over dependent measurements are not valid, so the independence has to be manufactured by the two-stage structure. Separately, different invocations can settle into genuinely different steady states because different methods get optimised to different levels, so a single invocation cannot represent the distribution. (Sec. 4.2, PDF p. 10 / pub. p. 66.)

- **How badly prevalent methods do.** For start-up on three hardware platforms, prevalent single-number methods are misleading in up to 16% of pairwise comparisons and flatly incorrect in more than 3% for some methods. Mean and median are consistently better than best, second best, and worst; the accuracy of mean and median improves with more measurements while best/second best/worst do not. For steady-state, prevalent methods mislead in over 20% of cases at a 1% threshold, over 10% at 2%, and over 5% at 3%. (Sec. 6.2.1, PDF p. 13 / pub. p. 69; Sec. 6.2.2, PDF p. 16 / pub. p. 72.)

- **Effect size determines how much the rigour matters.** Where the true difference is large, a rigorous method will not change the conclusion. Where it is small enough to sit inside experimental error, skipping the rigour can invert the conclusion. (Sec. 7, PDF p. 19–20 / pub. p. 75–76.)

- **The number of runs needed is not a constant.** Confidence-interval width as a function of measurement count varies by benchmark, by garbage collector, and by heap size. For one benchmark/collector pair the 95% interval is still wider than 3% of the mean after 30 measurements; for another it is around 1% after fewer than 10. This motivated their tool, JavaStats, which keeps sampling until a target interval width is reached or a cap (for example *p* = 30 invocations) is hit. (Sec. 6.3, PDF p. 18–19 / pub. p. 74–75; Sec. 4.3, PDF p. 10 / pub. p. 66.)

- **A budget-constrained fallback is explicitly sanctioned.** Rigorous analysis on a small number of measurements is still rigorous; it simply yields looser intervals. (Sec. 4.3, PDF p. 10 / pub. p. 66.)

- **The authors themselves scope the generalisation.** They state that the issues apply beyond Java to other languages built on a managed runtime system. This sentence, and not any measurement in the paper, is the citable warrant for carrying the discipline over to Node. (Abstract, PDF p. 1 / pub. p. 57.)

---

## Quotable sentences

- "This paper shows that prevalent methodologies can be misleading, and can even lead to incorrect conclusions. The reason is that the data analysis is not statistically rigorous." (Abstract, PDF p. 1 / pub. p. 57)

- "Although this paper focuses on Java performance evaluation, many of the issues addressed in this paper also apply to other programming languages and systems that build on a managed runtime system." (Abstract, PDF p. 1 / pub. p. 57)

- "Managed runtime systems are particularly challenging to benchmark because there are numerous factors affecting overall performance, which is of lesser concern when it comes to benchmarking compiled programming languages such as C." (Sec. 1, PDF p. 1 / pub. p. 57)

- "One potential source of non-determinism is Just-In-Time (JIT) compilation. A virtual machine (VM) that uses timer-based sampling to drive the VM compilation and optimization subsystem may lead to non-determinism and execution time variability: different executions of the same program may result in different samples being taken and, by consequence, different methods being compiled and optimized to different levels of optimization." (Sec. 1, PDF p. 2 / pub. p. 58)

- "Surprisingly enough, about one third of the papers (16 out of the 50 papers) does not specify the methodology used in the paper." (Sec. 2, PDF p. 3 / pub. p. 59)

- "In only a small minority of the research papers (4 out of 50), confidence intervals are reported to characterize the variability across multiple runs. The others papers though report a single performance number." (Sec. 2.1.1, PDF p. 4 / pub. p. 60) [The phrase "The others papers" is the paper's own slip; quote with *sic* or paraphrase.]

- "There are two key differences between startup and steady-state performance. First, startup performance includes class loading whereas steady-state performance does not, and, second, startup performance is affected by JIT compilation, substantially more than steady-state performance." (Sec. 4.1, PDF p. 9 / pub. p. 65)

- "Measure the execution time of multiple VM invocations, each VM invocation running a single benchmark iteration." (Sec. 4.1, PDF p. 9 / pub. p. 65)

- "If there are more than 30 measurements, use the standard normal z-statistic; otherwise use the Student t-statistic." (Sec. 4.1, PDF p. 9 / pub. p. 65)

- "To reach independence, we discard the first VM invocation for each benchmark from our measurements and only retain the subsequent measurements, as done by several other researchers; this assumes that the libraries are loaded when doing the measurements." (Sec. 4.1, PDF p. 9 / pub. p. 65)

- "For each VM invocation i, determine the iteration si where steady-state performance is reached, i.e., once the coefficient of variation (CoV) of the k iterations (si − k to si) falls below a preset threshold, say 0.01 or 0.02." (Sec. 4.2, PDF p. 10 / pub. p. 66)

- "The reason for doing so is to reach independence across the measurements from which we compute the confidence interval: the various iterations within a single VM invocation are not independent, however, the mean values x̄i across multiple VM invocations are independent." (Sec. 4.2, PDF p. 10 / pub. p. 66)

- "Under time pressure, statistically rigorous data analysis can still be applied considering a limited number of measurements, however, the confidence intervals will be looser." (Sec. 4.3, PDF p. 10 / pub. p. 66)

- "First of all, prevalent methods can be misleading in a substantial fraction of comparisons between alternatives, i.e., the total fraction misleading comparisons ranges up to 16%. In other words, in up to 16% of the comparisons, the prevalent methodology makes too strong a statement saying that one alternative is better than another." (Sec. 6.2.1, PDF p. 13 / pub. p. 69)

- "In particular, mean and median are consistently better than best, second best and worst. The accuracy of the mean and median methods seems to improve with the number of measurements, whereas the best, second best and worst methods do not." (Sec. 6.2.1, PDF p. 13 / pub. p. 69)

- "The interesting observation here is that the width of the confidence interval largely depends on both the benchmark and the garbage collector." (Sec. 6.3, PDF p. 19 / pub. p. 75)

- "Non-determinism due to JIT compilation, thread scheduling, garbage collection and various system effects, makes quantifying Java performance far from being straightforward." (Sec. 7, PDF p. 19 / pub. p. 75)

- "Most likely, if the performance differences between the alternatives are large, a statistically rigorous method will not alter the overall picture nor affect the general conclusions obtained using prevalent methods. However, for relatively small performance differences (that are within the margin of experimental error), not using statistical rigor may lead to incorrect conclusions." (Sec. 7, PDF p. 19–20 / pub. p. 75–76)

---

## Relevance to this project

- **It supplies the protocol the report's benchmark section is already reaching for.** Warm-up iterations, multiple trials, and a reported distribution are not stylistic preferences invented for this assignment. Georges et al. give each of them a stated purpose: warm-up because early iterations carry loading and JIT cost, multiple invocations because within-invocation iterations are not independent, and confidence intervals because they are what distinguishes a real difference from a random fluctuation. Every design choice in the report's methodology can be traced to a specific sentence here rather than defended as taste.

- **It converts "V8 sits between the code and the hardware" from a liability into the paper's own premise.** The paper opens by saying managed runtimes are *harder* to benchmark than compiled languages, precisely because of the extra layers. The report's argument is the same argument run forward: because the layers add noise rather than remove it, a data-structure improvement that survives them is more credible, not less. The paper's closing sentence about large versus small differences reinforces this. A heap-versus-linear-scan change in Dijkstra should produce an asymptotic difference large enough that rigorous analysis confirms rather than rescues the conclusion, and the report can say so while still doing the analysis.

- **It licenses the transfer explicitly, and only in general terms.** The abstract's statement that the issues "also apply to other programming languages and systems that build on a managed runtime system" is what permits citing a Java paper in a Node project. It is a claim about the *class* of managed runtimes, so it supports carrying the discipline across and supports nothing more.

- **The four sources of non-determinism map cleanly onto Node.** JIT compilation and tiering, garbage collection timing, thread scheduling, and system effects all exist under V8 and libuv. The report can present that mapping as a structural correspondence while being clear it is a correspondence the report is drawing, not a measurement either paper made.

- **It justifies process-level repetition specifically.** The strongest concrete recommendation for this project is that each trial should be a fresh `node` process, with the first discarded, rather than a loop inside one long-lived process. Georges et al. give the independence argument for that at Sec. 4.2, and the paper's own start-up protocol is exactly one-invocation-one-iteration.

- **It pre-answers the "why not just report the fastest run?" objection.** The survey shows "best of N" is the single most common practice in the literature, and the evaluation shows it is the practice that fails most often and does not improve as N grows. That is a citable reason for the report to present means with intervals instead of a headline best time.

- **It sets a defensible floor when time is short.** The paper's own statement that a limited number of measurements still permits rigorous analysis, with looser intervals, lets the report run a modest trial count honestly rather than overclaiming or pretending to a 30-invocation budget it did not spend.

---

## Cautions

- **The paper never measured V8, Node, or JavaScript.** Its subject VM is Jikes RVM, an open-source JVM written in Java, running SPECjvm98 and DaCapo on an AMD Athlon, an Intel Pentium 4, and a PowerPC G4. Nothing in it is evidence about V8's behaviour. The report may cite it for *how to measure*, never for *how V8 behaves*.

- **No number in the paper transfers.** The 30 VM invocations, the CoV threshold of 0.01 to 0.02, the *k* = 10 retained iterations, the 2% target interval width, the "more than 10 iterations before steady state" observation for a specific benchmark, and the 16% and 20% misleading-conclusion rates are all properties of that VM, those benchmarks, those collectors, those heap sizes, and that hardware. If the report adopts, say, 30 trials, it should present that as following the paper's *shape* and its z-versus-t threshold, not as a value the paper validated for Node.

- **The start-up/steady-state distinction does not carry over term for term.** The paper's definition of start-up rests on class loading plus heavy JIT activity. Node has parse, compile, and module resolution costs that play a loosely analogous role, but they are not class loading, and V8's tiering pipeline is not Jikes RVM's timer-based method sampling with its recompilation levels. The report should describe the analogy as an analogy.

- **The CoV convergence heuristic is the weakest part of the recommendation, and later work says so.** Kalibera and Jones (2013) test this exact method against manually established warm-up points and find it can report convergence far too early. The report should not present a CoV threshold as an authoritative warm-up detector; see the companion note on that paper.

- **Confidence intervals here assume the measurements being pooled are independent.** That assumption is what the two-stage per-invocation-mean structure exists to satisfy. If the report computes an interval over repeated iterations inside a single Node process, it inherits exactly the bias the paper warns about, and the citation would then be supporting a protocol the paper argues against.

- **The paper is about comparing whole-system alternatives, mostly garbage collectors, at the level of whole-benchmark execution time.** The project measures a data structure inside an algorithm inside one process. The measurement discipline transfers; the unit of analysis does not, and the report should not imply the paper endorses in-process micro-timing of a single function.

- **V8-specific measurement hazards are entirely out of scope here.** Dead-code elimination by TurboFan, inline-cache and hidden-class degeneration, and the resolution and clamping behaviour of `performance.now()` are real threats to this project's numbers, and neither this paper nor its 2007 context has anything to say about them. They need a different source or a documented experiment.

- **Citation hygiene.** Do not pair the *SIGPLAN Notices* venue string with the proceedings DOI. See the *Verification* section above.
