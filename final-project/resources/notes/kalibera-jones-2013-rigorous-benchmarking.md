# Rigorous Benchmarking in Reasonable Time

**APA 7 reference**

Kalibera, T., & Jones, R. (2013). Rigorous benchmarking in reasonable time. In *ISMM '13: Proceedings of the 2013 International Symposium on Memory Management* (pp. 63–74). Association for Computing Machinery. https://doi.org/10.1145/2464157.2464160

Alternative form, if the report prefers to cite the *SIGPLAN Notices* issue in which the ISMM '13 proceedings were distributed. Use one or the other, never a mixture:

Kalibera, T., & Jones, R. (2013). Rigorous benchmarking in reasonable time. *ACM SIGPLAN Notices*, *48*(11), 63–74. https://doi.org/10.1145/2555670.2464160

*Verification.* The believed DOI verified cleanly on the first attempt, so no substitution was needed. The Crossref REST API returns `10.1145/2464157.2464160` as a `proceedings-article` titled "Rigorous benchmarking in reasonable time", authors Tomas Kalibera and Richard Jones (both University of Kent, Canterbury, United Kingdom), pages 63–74, container title *Proceedings of the 2013 international symposium on memory management*, event "ISMM '13: International Symposium on Memory Management", Seattle, Washington, USA, published 2013-06-20, publisher ACM, New York. DBLP records the same paper at ISMM 2013, pages 63–74, authors Tomas Kalibera and Richard E. Jones. DBLP attaches DOI `10.1145/2491894.2464160`; that DOI is also live in Crossref and returns identical metadata, so it is a second registered identifier for the same proceedings article rather than a contradiction. The Kent Academic Repository record at https://kar.kent.ac.uk/33611/, deposited by the authors' own institution, gives title "Rigorous Benchmarking in Reasonable Time", creators "Kalibera, Tomas" and "Jones, Richard E.", publication "ACM SIGPLAN International Symposium on Memory Management (ISMM 2013)", publisher ACM, place of publication New York, page range 63–74, event location Seattle, Washington, USA, and `id_number` 10.1145/2464157.2464160. Three independent records therefore agree on authors, year, title, venue, pages, and publisher. The ACM Digital Library landing page could not be retrieved (HTTP 403 from an automated client), so no field depends on it.

**A second registered identity, as with Georges et al.** Crossref also holds a `journal-article` record under DOI `10.1145/2555670.2464160`: *ACM SIGPLAN Notices*, volume 48, issue 11, pages 63–74, ISSN 0362-1340 / 1558-1160. The ISMM '13 proceedings were distributed as that *SIGPLAN Notices* issue. Both forms are legitimate. The proceedings form is recommended here because it is the identity the authors' own repository designates as the version of record, and because it is the form DBLP indexes. As with the Georges reference, **the DOI must match the venue named in the same entry**; pairing "ISMM '13 proceedings" with `10.1145/2555670.2464160`, or "*SIGPLAN Notices* 48(11)" with `10.1145/2464157.2464160`, would send a checker to a record that does not display the fields being claimed.

**Author initial.** The published byline on page 1 of the paper reads "Tomas Kalibera / Richard Jones", and Crossref records `given: "Richard"`. DBLP and the Kent repository both normalise to "Richard E. Jones". APA 7 takes the form given in the work itself, so `Jones, R.` is correct; `Jones, R. E.` is also defensible and is what a DBLP-driven citation manager will emit. Pick one and use it consistently across the reference list.

**Full text.** Obtained and read in full. The copy used is the Author's Accepted Manuscript deposited at https://kar.kent.ac.uk/33611/45/p63-kaliber.pdf. It carries the ISMM '13 copyright block ("ISMM'13, June 20–21, 2013, Seattle, Washington, USA. Copyright © 2013 ACM 978-1-4503-2100-6/13/06"), which independently confirms venue, dates, and ISBN. **Page numbers cannot be mapped reliably.** The PDF is 12 pages, of which page 1 is a Kent repository cover sheet, leaving 11 pages of paper; the published range 63–74 spans 12 pages, and the repository's own metadata records the deposited item as 11 pages. Because this is a pre-typesetting accepted manuscript, its pagination does not line up with the published range, and inventing a mapping would be a fabrication. Locations below are therefore given as **section number plus AAM PDF page**, which is unambiguous and checkable in the linked file. The article's section structure is: 1 Introduction, 2 Related Work, 3 The Challenge of Reasonable Repetition, 4 The Challenge of Summarising Results, 5 Benchmarks and Platforms, 6 Repeating Iterations, 7 Repeating Executions, 8 Repeating Compilation, 9 Multi-level Repetition, 10 Measuring Speedup, 11 Good Repetition Counts, 12 Summary.

**Fabrication check.** The work exists, the bibliographic fields are as stated, and the paper does say what it is cited for. It does address how many repetitions are actually needed and how warm-up should be detected, and it does test and criticise automated warm-up heuristics, including the coefficient-of-variation method from Georges et al.

---

## Key claims the report will draw on

- **The state of practice is worse than "occasionally sloppy".** Surveying 122 papers from PLDI, ASPLOS, ISMM, TOPLAS (nos. 1–4), and TACO (nos. 1–2) in 2011, 90 measured execution time, and of those, **71 reported no measure of variation of any kind**. Only 3 attempted a confidence interval for a speedup ratio, though 65 reported execution-time ratios. (Sec. 1, AAM PDF p. 2; Sec. 10, AAM PDF p. 10.)

- **Why that matters is a matter of effect size.** Reported improvements in the field are often around 10% (citing Mytkowicz et al.), which is small enough to fall inside measurement error. Even a large speedup should carry an error bound so that studies can be compared. (Sec. 1, AAM PDF p. 2; Sec. 4, AAM PDF p. 4.)

- **Repetition happens at *levels*, and the levels are not interchangeable.** They name three for a JVM experiment: compilation (rebuilding the VM or benchmark binary), execution (a fresh VM invocation), and iteration (one run of the workload inside an invocation). The highest level is the first source of variation in the experimental sequence. **Repetition must occur at the highest level that has random variation, to avoid bias**; repeating at lower levels is an optimisation of experiment time only, never a substitute. (Sec. 3, AAM PDF p. 4.)

- **Two thresholds replace the vague word "steady".** A state is **initialised** when iterations are no longer subject to obvious, significant initialisation overhead from dynamic linking, I/O buffer filling, or JIT compilation. A state is **independent** when iteration times are statistically independent and identically distributed. Independent implies initialised. They propose i.i.d. as a well-defined sufficient condition for steady state, and "initialised" as a necessary one. (Sec. 6, AAM PDF p. 5.)

- **Pooling non-independent measurements biases the interval.** If measurements are not i.i.d., variance and confidence-interval estimates are biased. This is the formal reason warm-up detection is not cosmetic. They also note, pointing at Georges et al., that averaging dependent iterations and treating the average as a datum is not strictly incorrect but silently redefines what is measured, turning "how long does one iteration take" into "how long do ten iterations take, divided by ten", and it still requires repetition at a higher level to form the interval. They discourage the practice. (Sec. 6, AAM PDF p. 5.)

- **How warm-up should actually be found: manual inspection, once.** Their procedure is three executions of 300 iterations each, then visual inspection of run-sequence plots to find where the data stabilise, then lag plots (lags 1–4) and autocorrelation plots to test whether the remainder is independent, with each plot shown alongside a randomly reordered version of the same data so the analyst can look for a systematic difference. With practice this takes under a minute per benchmark. The recommendation is to do this **once per benchmark/VM/platform combination**, not per experiment. (Sec. 6.1, AAM PDF p. 5–6.)

- **Many benchmarks never reach independence in reasonable time.** Just over half the DaCapo/OpenJDK benchmarks reach an independent state. For those that do not, the guidance is to run to the *initialised* state and take **the same iteration from each run**, because the auto-dependence patterns (drift, trends, abrupt state changes, odd/even alternation) are consistent across runs, and choosing iterations opportunistically can shift the result by tens of percent. (Sec. 6.1–6.2, AAM PDF p. 6; Table 2, AAM PDF p. 7.)

- **Automated warm-up heuristics are shown to be unreliable, including the one from Georges et al.** They compare the DaCapo '09 harness heuristic and Georges' coefficient-of-variation method against their manually established warm-up points. Both sometimes overshoot the independent warm-up, wasting time, and sometimes fall short of the initialised warm-up, which leaves results contaminated by initialisation noise and therefore unusable. Their diagnosis is structural: on-line heuristics must decide after a few iterations because they are designed to run inside real experiments, whereas the manual method inspects 300. Read from their Table 3 (AAM PDF p. 7), `avrora9` on platform P1 is initialised by iteration 2 but does not become independent until iteration 128, while the DaCapo harness reports 4 and Georges' method reports 1. (Sec. 6.3, AAM PDF p. 7.)

- **The counts themselves are platform-, VM-, and benchmark-dependent.** Their Table 6 gives per-benchmark warm-up, execution, and iteration counts for DaCapo on OpenJDK/P1, with warm-ups ranging from 0 to 11 iterations across 22 benchmarks. They decline to report fewer than 5 executions at the top level, "as they could hardly be used to get the variance estimate right", since the interval depends on the variance estimate at the highest level only. (Sec. 11, AAM PDF p. 11.)

- **Repetition should be *dimensioned*, not guessed.** They model experiment cost mathematically and derive the repetition count at each level that is necessary and sufficient for a target precision within a given time budget. The dimensioning experiment is expensive but is a one-off per benchmark/VM/platform, amortised over the years a research group typically keeps the same setup. (Sec. 9, AAM PDF p. 9; Sec. 12, AAM PDF p. 12.)

- **Report effect-size confidence intervals, not significance tests.** They set out the standard objections to null-hypothesis significance testing: it does not estimate the quantity of interest, it is sensitive to sample size so that any difference becomes "significant" with enough measurements, and it is widely misinterpreted. They also note the overlapping-intervals visual test is conservative and lacks known error. Their alternative is a Fieller confidence interval for the ratio of execution times, which they say has been known since the 1950s but has not to their knowledge previously been used for computer performance evaluation. (Sec. 4, AAM PDF p. 4; Sec. 10, AAM PDF p. 10.)

---

## Quotable sentences

- "Because modern systems are complex and non-deterministic, good experimental methodology demands that researchers account for uncertainty." (Abstract, AAM PDF p. 2)

- "Currently, many evaluations give up on sufficient repetition or rigorous statistical methods, or even run benchmarks only in training sizes. The results reported often lack proper variation estimates and, when a small difference between two systems is reported, some are simply unreliable." (Abstract, AAM PDF p. 2)

- "We focus on execution time, the key measurement in, for example, 90 out of 122 papers presented in 2011 at PLDI, ASPLOS and ISMM, or published in TOPLAS (nos. 1–4) and TACO (nos. 1–2). Unfortunately, the overwhelming majority of these papers reported results in ways that seem to make their work impossible to repeat, or did not convincingly demonstrate their claims for performance improvement: 71 failed to provide any measure of variation (such as variance or a confidence interval) for their results. This is unparalleled in most other scientific and social scientific fields." (Sec. 1, AAM PDF p. 2)

- "Advances in performance in our field are often small (Mytkowicz et al [20] report a median of 10%) and so can fall within the bounds of measurement error." (Sec. 1, AAM PDF p. 2)

- "At the very least, repetition must be done at the highest level that has random variation to avoid bias, but sometimes repeating at lower levels can reduce experimentation time without sacrificing precision." (Sec. 3, AAM PDF p. 4)

- "We call a state independent if the execution times of the benchmark iterations are (statistically) independent and identically distributed. A state is initialised — the lower bar — when iterations are no longer subject to obvious and significant initialisation overhead." (Sec. 6, AAM PDF p. 5)

- "Note that it does not makes sense to repeat measurements unless the system has reached an independent state. If measurements are not i.i.d., the variance and confidence interval estimates will be biased." (Sec. 6, AAM PDF p. 5) [The phrase "does not makes" is the manuscript's own slip; quote with *sic* or paraphrase.]

- "Over half the DaCapo/OpenJDK benchmarks reach an independent state." (Sec. 6.1, AAM PDF p. 6)

- "RECOMMENDATION: Use this manual procedure just once to find how many iterations each benchmark, VM and platform combination requires to reach an independent state." (Sec. 6.1, AAM PDF p. 6)

- "Many benchmarks do not reach an independent state in reasonable time." (Sec. 6.2, AAM PDF p. 6)

- "RECOMMENDATION: If a benchmark does not reach an independent state in a reasonable time, take the same iteration from each run." (Sec. 6.2, AAM PDF p. 6)

- "We observe that the heuristics do not do very well. There are cases when they give a warmup longer than the independent warmup (e.g. lusearch9 on P1), which would waste experimentation time. In other cases they give a warmup shorter than the initialised warmup (e.g. luindex6 on P2), making any results prone to initialisation noise and hence unusable." (Sec. 6.3, AAM PDF p. 7)

- "Automated on-line heuristics attempt to take a decision after a few iterations, as they are designed for real runs. This renders them less reliable than our once per benchmark/JVM/platform manual method where we look at 300 iterations." (Sec. 6.3, AAM PDF p. 7)

- "The larger the sample size is (the more measurements we have), the more unlikely even a very small difference becomes. In practice this means that a large sample size (and in our field it is easy to generate very large samples) will nearly always lead to the decision that there is a 'statistically significant' difference in performance, even if the true difference is so small that it is of little interest; statistical significance methods confuse sample size and practical relevance." (Sec. 4, AAM PDF p. 4)

- "Summaries can be as simple as 'we are 95% confident that system A is faster than system B by 5.5% ± 2.5%'." (Sec. 4, AAM PDF p. 4)

- "RECOMMENDATION: Analysis of results should be statistically rigorous and in particular should quantify any variation. Report performance changes with effect size confidence intervals." (Sec. 4, AAM PDF p. 4)

- "As we have shown, the required and optimum numbers of repetitions depend on the platform, VM, and benchmark." (Sec. 11, AAM PDF p. 11)

- "We do not show counts of fewer than 5 executions as they could hardly be used to get the variance estimate right (the confidence interval uses only the variance estimate at the highest level, so it is fine to have smaller repetition counts at the other levels)." (Sec. 11, AAM PDF p. 11)

- "However, it is essential that experimenters do not use our dimensioning results at face value but apply our method to their systems, where their results are likely to differ." (Sec. 12, AAM PDF p. 12)

- "We believe that currently proposed or implemented heuristics have proved insufficient to detect independence accurately. We show that manual identification of independence is both necessary and provides a feasible technique, when applied as a one-off analysis for each system. Accurate and robust automation of this inspection is an open problem." (Sec. 12, AAM PDF p. 12)

---

## Relevance to this project

- **It is the honest counterweight to Georges et al., and citing both is stronger than citing either.** Georges et al. give the protocol; Kalibera and Jones test the automated part of that protocol and find it wanting. A report that cites only the 2007 paper and adopts a coefficient-of-variation warm-up cutoff is citing a method that a later paper in the same literature specifically measured and criticised. Acknowledging that in the methodology section is exactly the kind of move that survives a skeptical read.

- **It sets the standard for how the headline result should be phrased.** The project's core claim is comparative: heap-based Dijkstra against linear scan, CSR against adjacency list. Kalibera and Jones show that a bare ratio is the most common and least defensible way to report that, and that the right form is an effect-size confidence interval. "We are 95% confident that the heap version is faster by X% ± Y%" is a directly modellable sentence, and the paper is the citation for why it beats both a bare speedup number and a *p*-value.

- **It supplies the argument for a fresh process per trial in language the report can reuse.** Their "repetition must be done at the highest level that has random variation" is the general principle behind the specific practice. In this project the levels collapse to two, a fresh `node` process and an in-process iteration, since there is no separate compilation step to randomise. That collapse is itself worth stating: the report should say which levels exist in its setup and why, rather than importing a three-level scheme that does not apply.

- **It reframes the warm-up question correctly.** The question is not "how many warm-up iterations should we discard" but "has the measured series become independent, and if it never does, are we taking the same iteration index from every run?" That second option is the practical one for a student project on a short budget, and the paper recommends it explicitly for benchmarks that do not converge. It is a defensible protocol precisely because it is what the paper prescribes for the hard case.

- **It gives a floor on trial count with a stated reason.** Their refusal to report fewer than 5 top-level repetitions, because the variance estimate at the highest level is the only one the interval uses, is a citable justification for whatever minimum the report adopts. The reason matters more than the number.

- **It strengthens the "V8 is a harder test" argument by raising the bar rather than lowering it.** The paper's position is that non-determinism is real, is often larger than the effects being measured, and must be quantified rather than assumed away. If the report's measured improvement is large enough to sit clearly outside its own confidence interval on a JIT-and-GC runtime, that is a stronger result under this paper's standard than the same improvement measured on a quiet, deterministic target. The report can say so and cite this paper for the standard being applied.

- **It also supplies a note of restraint.** Their survey finding that most published work in top venues does not report variation is a useful, honest framing for why the report is doing something better than common practice without claiming to do something novel.

---

## Cautions

- **Neither this paper nor Georges et al. measured V8, Node, or JavaScript.** The systems here are OpenJDK 7 (7u2, build 13) and Jikes RVM running DaCapo 2006 and 2009, plus gcc 4.7 with SPEC CPU2006 CINT, across five Linux platforms (AMD Opteron, Intel Xeon, Core i7, Core 2, Pentium 4). Nothing in either paper is evidence about V8's warm-up behaviour, its tiering, or its garbage collector.

- **The authors themselves forbid taking their numbers at face value.** Sec. 12 states plainly that experimenters should apply the method to their own systems rather than reuse the dimensioning results, and that results are likely to differ. Every concrete count in the paper is therefore off-limits as a value for this project: the 300 iterations, the 30 executions, the warm-ups in Tables 3 and 6, the 128-iteration independence point for `avrora9`, and the suggested repetition counts. What transfers is the procedure and the reasoning, not the constants.

- **A JVM warm-up curve is not a V8 warm-up curve.** OpenJDK's tiered compilation with on-stack replacement, and Jikes RVM's timer-based sampling, are different machinery from V8's Ignition, Sparkplug, Maglev, and TurboFan pipeline, with different deoptimisation and re-optimisation behaviour. The *shape* of the problem carries over. Any statement about how many iterations V8 needs must come from the project's own measurements.

- **The full manual procedure is probably out of budget, and the report should say so rather than imply it was done.** Lag plots, autocorrelation plots, and randomly reordered comparison plots across 300 iterations per benchmark is a real piece of work. If the report only inspects run-sequence plots, or only discards a fixed warm-up, it should describe that as a reduced version of the paper's procedure and name the limitation.

- **The Fieller effect-size interval is not a drop-in formula.** It depends on the variance estimators derived from their multi-level ANOVA-based model, with the full derivation deferred to their technical report (Kalibera & Jones, 2012, Technical Report 4–12, University of Kent). If the report uses a simpler interval, it should present that as its own choice and cite this paper for the *principle* of reporting an effect-size interval, not for the specific estimator.

- **Their claim that automated warm-up detection is unreliable is evidence about two specific heuristics on JVM benchmarks.** It is a well-founded reason for caution, and they call robust automation an open problem, but it is not a proof that no automated detector can work on V8. Phrase it as their finding, not as a general theorem.

- **Their multi-level cost model assumes levels the project may not have.** With no VM rebuild and no compilation-plan randomisation, the code-layout and compilation-level analysis is not applicable here, and importing that vocabulary wholesale would be padding.

- **V8-specific measurement hazards are outside this paper's scope.** Dead-code elimination by the optimising compiler, hidden-class and inline-cache degeneration, and timer resolution or clamping in `performance.now()` are genuine threats to the project's numbers and are not addressed by either source. They need a separate citation or a documented experiment.

- **Citation hygiene.** Do not pair the ISMM '13 proceedings venue string with the *SIGPLAN Notices* DOI, or the reverse. See the *Verification* section above.
