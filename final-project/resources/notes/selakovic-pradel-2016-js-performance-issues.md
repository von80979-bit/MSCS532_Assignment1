# Performance Issues and Optimizations in JavaScript: An Empirical Study

**APA 7 reference**
Selakovic, M., & Pradel, M. (2016). Performance issues and optimizations in JavaScript: An empirical study. In *Proceedings of the 38th International Conference on Software Engineering* (pp. 61–72). ACM. https://doi.org/10.1145/2884781.2884829

*Verification.* Every bibliographic field verified against three independent authoritative records, all of which agree. The Crossref REST API record for DOI `10.1145/2884781.2884829` gives type `proceedings-article`, title "Performance issues and optimizations in JavaScript" with subtitle "an empirical study", authors Marija Selakovic and Michael Pradel (both TU Darmstadt, Germany), container title *Proceedings of the 38th International Conference on Software Engineering*, publisher ACM, publisher location New York, NY, USA, pages 61–72, published 14 May 2016, and event `ICSE '16: 38th International Conference on Software Engineering`, Austin, Texas, sponsored by ACM SIGSOFT and IEEE-CS TCSE. DBLP record `conf/icse/SelakovicP16` independently gives venue ICSE, pages 61–72, year 2016. The authors' PDF at https://software-lab.org/publications/icse2016-perf.pdf carries its own footer line "ICSE '16, May 14 - 22, 2016, Austin, TX, USA", ISBN 978-1-4503-3900-1/16/05, and the same DOI, which closes the loop between the metadata and the artifact.

Full text was reached and read end to end. The PDF is 12 pages and the proceedings range 61–72 is exactly 12 pages, so **PDF page *n* corresponds to proceedings page *60 + n***. Every location below gives the section plus both page numbers, so a reader can find the passage in either copy.

One caveat on the quotations. They are transcribed from `pdftotext` output of the authors' own PDF, so mathematical subscripts appear flattened (the paper's *N*<sub>warmUp</sub> reads as `NwarmUp`). Where that happens it is flagged inline. Nothing else was normalised; oddities of punctuation in the quotations, such as the stray comma in the 52% sentence, are the paper's own.

DBLP also lists a second record, `conf/se/SelakovicP17`, a one-page abstract of the same work reprinted in the German *Software Engineering* 2017 proceedings. That is not the paper to cite. The ICSE 2016 entry above is the peer-reviewed full paper.

---

## Study design

- **Corpus.** 98 fixed performance issues drawn from **16 open-source JavaScript projects**, spanning client-side, server-side, and dual-target code, totalling **63,951 lines of JavaScript**. Table 1 lists all sixteen with their platform and issue counts: Angular.js (27 issues), Underscore (12), Ember.js (11), jQuery (9), Cheerio (9), React (5), Backbone (5), Underscore.string (3), EJS (3), Moment (3), Chalk (3), Mocha (2), Request (2), Socket.io (2), NodeLruCache (1), Q (1). (Sec. 2.1 and Table 1, PDF p. 2–3 / proc. p. 62–63.)
- **Selection.** Issues were found by keyword search of bug-tracker titles, descriptions, and comments ("performance", "optimization", "responsive", "fast", "slow"), or by explicit performance labels in Angular.js. An issue was kept only if the fix had been accepted and merged, only if the authors could reproduce it with a runnable test, and only if the fix produced a statistically significant improvement on at least one engine. Issues fixed by several independent optimizations were split into one issue per optimization. (Sec. 2.2, PDF p. 2–3 / proc. p. 62–63.)
- **Measurement protocol.** Each test runs in *N*<sub>VM</sub> = 5 freshly launched VM instances, with *N*<sub>warmUp</sub> = 5 warm-up executions per instance to warm the JIT, followed by *N*<sub>measure</sub> = 10 measured executions. A difference counts as significant only if the 95% confidence intervals of the before-set and after-set do not overlap. Tests too short to time accurately are wrapped in a loop so each run lasts at least 5 ms. Hardware: Intel Core i7-4600U at 2.10 GHz, 16 GB RAM, Ubuntu 14.04 64-bit. The methodology is adapted from prior work on Java benchmarking. (Sec. 2.3, PDF p. 3 / proc. p. 63.)
- **Engines.** SpiderMonkey 24, 31, 39 and V8 3.14, 3.19, 3.6, 4.2, chosen to span multiple years and to include only post-JIT versions plus the then-current release. (Sec. 2.4 and Table 2, PDF p. 3–4 / proc. p. 63–64.)
- **Research questions.** RQ1 root causes, RQ2 complexity of the optimizing changes, RQ3 performance impact, RQ4 consistency across engines and versions, RQ5 recurring optimization patterns. (Sec. 1, PDF p. 1 / proc. p. 61.)
- **Replication package.** https://github.com/marijaselakovic/JavaScriptIssuesStudy (Sec. 1, PDF p. 2 / proc. p. 62.)

---

## Key claims the report will draw on

### Root causes (RQ1): eight categories, API-dominated

The authors identify **eight root causes** across the 98 issues and assign each issue to one or more of them. Figure 1a is the authoritative picture. (Sec. 3, PDF p. 4 / proc. p. 64.)

- **65 of the 98 issues are API-related**, split across three of the eight causes. (Sec. 3.1, PDF p. 4 / proc. p. 64.)
- **Inefficient API usage: 52% of all issues, 50 issues, the single most prevalent cause.** The pattern is that an API offers several functionally equivalent routes to the same result and the client picks a slower one. The worked example replaces `str.split("'").join("\\'")` with `str.replace(/'/g, "\\'")`. (Sec. 3.1, PDF p. 4 / proc. p. 64.)
- Within inefficient API usage, Figure 1b ranks the misused APIs: **reflection APIs first** (runtime type checks, invoking function objects, property-existence checks), **string operations second**, then DOM, arrays, project-internal APIs, other built-ins, and third-party APIs. (Sec. 3.1 and Fig. 1b, PDF p. 4 / proc. p. 64.)
- **Inefficient reimplementation: 8%.** The program hand-rolls something the built-in API already does faster; the fix is to call the built-in. Example: Angular.js dropped its own `map()` for `Array.prototype.map()`. (Sec. 3.1, PDF p. 4 / proc. p. 64.)
- **Generic API is inefficient: 7%.** The program calls an API that is more general, and therefore slower, than the situation needs. Example: `arr.slice(n)[0]` replaced by `arr[arr.length + n]`, because `slice()` copies a whole sub-array to yield one element. (Sec. 3.1, PDF p. 4 / proc. p. 64.)
- **Inefficient iteration: 18%.** Choosing among `for`, `for-in`, and `Array.prototype.forEach()` badly. The canonical fix hoists `Object.keys()` out and iterates with an indexed `for` loop. (Sec. 3.2, PDF p. 4–5 / proc. p. 64–65.)
- **Repeated execution of the same operations: 13%.** Example: rebuilding the same regular expression on every call, fixed by hoisting it into a variable. (Sec. 3.2, PDF p. 5 / proc. p. 65.)
- **Unnecessary or inefficient copying of data: 12%.** This is the one category that touches data structures directly. Example: Angular.js copied an array by iterating and appending element by element, replaced by `Array.prototype.slice()`. (Sec. 3.2, PDF p. 5 / proc. p. 65.)
- **A computation can be simplified or avoided in special cases: 10%.** Example: replacing `JSON.stringify(value)` with `"" + value` when the value is known to be a number. (Sec. 3.2, PDF p. 5 / proc. p. 65.)
- **Repeated checks of the same condition: 8%.** Example: hoisting an `isFunction()` check out of a `map()` callback. (Sec. 3.2, PDF p. 5 / proc. p. 65.)

### Complexity of the fixes (RQ2)

- Optimizations affect between **2 and 145 lines**, median **10**. **28% touch fewer than 5 lines and 73% touch fewer than 20**, measured on pretty-printed, comment-stripped source so formatting style cannot skew the count. (Sec. 4.1 and Fig. 2, PDF p. 5 / proc. p. 65.)
- **37.11% of optimizations leave the statement count unchanged and 47.42% leave cyclomatic complexity unchanged.** A further 19.59% reduce statement count and 14.43% reduce cyclomatic complexity. The authors read this as evidence against the folklore that speed is bought with readability. (Sec. 4.2 and Fig. 3, PDF p. 6 / proc. p. 66.)

### Performance impact (RQ3)

- Running all 98 optimizations on every applicable engine yields **568 performance-improvement results**. The **majority of optimizations save between 25% and 70% of execution time**, with a wide spread and some outright regressions. (Sec. 5 and Fig. 4, PDF p. 6 / proc. p. 66.)
- **There is no correlation between the size of a change and the speedup it buys** (Pearson's *r* = 5.85%). (Sec. 5 and Fig. 5, PDF p. 6 / proc. p. 66.)

### Consistency across engines (RQ4)

- Restricting to the **82 issues** runnable on both V8 and SpiderMonkey, **only 42.68% of changes speed the program up on every version of both engines**. **15.85% degrade performance on at least one engine.** 4.9% help on all SpiderMonkey versions while hurting on at least one V8 version. (Sec. 6.1 and Table 3, PDF p. 7 / proc. p. 67.)
- Across versions of a single engine the effect can invert and re-invert. One change gives an almost 80% speedup on V8 3.6 and a non-negligible slowdown on V8 4.2. (Sec. 6.2 and Fig. 6, PDF p. 8 / proc. p. 68.)

### Recurring patterns (RQ5)

- **29 of the 98 studied optimizations** are instances of just **10 recurring patterns**; AST-based static analyses then found **139 previously unreported instances** of those patterns in the current versions of the same projects. Patterns recur both within a project and across projects. (Sec. 7.1, Tables 4 and 5, PDF p. 8–9 / proc. p. 68–69.)

---

## Quotable sentences

- "We identify eight root causes of issues and show that inefficient usage of APIs is the most prevalent root cause." (Abstract, PDF p. 1 / proc. p. 61)
- "The most common root cause (52% of all issues), is that an API provides multiple functionally equivalent ways to achieve the same goal, but the API client does not use the most efficient way to achieve its goal." (Sec. 3.1, PDF p. 4 / proc. p. 64)
- "Another recurrent root cause (12% of all issues) is to copy data from one data structure into another in an inefficient or redundant way." (Sec. 3.2, PDF p. 5 / proc. p. 65)
- "We find that optimizations affect between 2 and 145 lines of JavaScript source code, with a median value of 10." (Sec. 4.1, PDF p. 5 / proc. p. 65)
- "The figure illustrates that optimizations lead to a wide range of improvements, with the majority of optimizations saving between 25% and 70% of the execution time." (Sec. 5, PDF p. 6 / proc. p. 66)
- "We find that only 42.68% of all changes speed up the program in all versions of both engines, which is what developers hope for when applying an optimization." (Sec. 6.1, PDF p. 7 / proc. p. 67)
- "Even worse, 15.85% of all changes degrade the performance in at least one engine, i.e., a change supposed to speed up the program may have the opposite effect." (Sec. 6.1, PDF p. 7 / proc. p. 67)
- "In summary, our results show that performance is a moving target." (Sec. 6.2, PDF p. 8 / proc. p. 68)
- "Despite the effectiveness of JIT compilation, developers still apply optimizations to address performance issues in their code, and future improvements of JavaScript engines are unlikely to completely erase the need for manual performance optimizations." (Sec. 1, PDF p. 1 / proc. p. 61)
- "we are the first to study performance issues in JavaScript, which differs from C, C++, and Java both on the language and the language implementation level." (Sec. 9.1, PDF p. 10 / proc. p. 70)
- "At first, we perform NwarmUp test executions in each VM instance to warm up the JIT compiler." (Sec. 2.3, PDF p. 3 / proc. p. 63; the paper prints *N* with a subscript "warmUp", flattened here by text extraction)
- "as we consider projects written in JavaScript, our conclusions are valid for this language only." (Sec. 8, PDF p. 10 / proc. p. 70)

---

## Relevance to this project

- **It is the bridge, and the authors themselves frame it as one.** The sentence in Sec. 9.1 states plainly that JavaScript "differs from C, C++, and Java both on the language and the language implementation level." That is the clean warrant for the report's move from the MSR 2023 HPC study, whose corpus is C/C++ with CUDA and OpenMP, into a TypeScript-on-Node setting: the report is not assuming the HPC findings transfer, it is testing whether one of them does in a runtime that the literature marks as materially different.
- **It supplies peer-reviewed evidence that manual optimization still pays under a JIT.** Sec. 1 says future engine improvements "are unlikely to completely erase the need for manual performance optimizations," and RQ3 shows the median optimization in the corpus saving a large fraction of execution time. The report's premise, that a data-structure change is worth making even on V8, rests on a published finding rather than on assertion.
- **It is the strongest available support for the "harder test" framing, and it makes the framing sharper than the report currently has it.** Only 42.68% of real, developer-authored, merged optimizations held up across every engine version, and 15.85% backfired somewhere. The report can therefore argue that a managed JIT runtime is a hostile environment for constant-factor tricks, which is exactly why an *asymptotic* change is the right thing to demonstrate there. If the O(V²) to O((V+E) log V) gap survives V8's optimizer, that is a stronger result than the same gap measured in C, because the substrate is actively working to blur it.
- **The measurement protocol in Sec. 2.3 is directly reusable and citable for the benchmark methodology.** Fresh VM instances per configuration, an explicit JIT warm-up phase before any timed run, repeated measured runs, non-overlapping 95% confidence intervals as the significance test, and a minimum work quantum so the timer resolution does not dominate. Adopting that shape and citing it gives the report's methodology a peer-reviewed provenance instead of an ad-hoc one.
- **Sec. 4.2 supports a secondary point about the cost of the optimization.** Nearly half of the studied optimizations did not increase cyclomatic complexity. A hand-written binary min-heap does add code relative to a linear scan, so the report should not overclaim here, but the finding is available if the report wants to argue that performance work and maintainability are not automatically in tension.

---

## Cautions

- **The paper has no "inefficient data structure" root cause.** Do not cite it as evidence that data-structure choice is a leading cause of JavaScript performance problems. The taxonomy is API-centric. The nearest category, "unnecessary or inefficient copying of data" at 12%, is about *how* data moves between structures, not about *which* structure was chosen. The data-structure framing of the report comes from the MSR 2023 HPC study, which does have an explicit "use of inefficient data structure" category. Keep the two sources doing their own jobs.
- **Nothing in this paper is about asymptotic complexity.** The 98 optimizations are overwhelmingly constant-factor API substitutions, hoisting, and memoization. The paper offers no support for a claim that changing an algorithm's complexity class is a common or typical JavaScript fix. The report's Experiment 1 is not an instance of anything this paper counted.
- **Do not cite this paper for `Array.shift`.** It says nothing about `Array.prototype.shift`, about queue implementations, about heaps, or about graph representations. The claim that `Array.shift` is O(n) and would sabotage BFS needs a different source or a measured demonstration.
- **Do not quote a single headline speedup number.** The paper reports a distribution, not a mean. "The majority of optimizations saving between 25% and 70% of the execution time" is the correct form and it is the authors' own description of a box plot. Any tighter number would be invented.
- **The engines are historical.** V8 3.14 through 4.2 and SpiderMonkey 24 through 39 are 2013 to 2015 releases. Nothing here licenses a claim about the behaviour of a current Node.js or a current V8. The report should present the cross-engine inconsistency finding as evidence that JIT behaviour is unstable in general, not as a measurement of today's runtime.
- **JavaScript, not TypeScript.** The corpus is plain JavaScript. Since the report's implementation is TypeScript compiled to JavaScript on Node, the connection holds at the runtime level, but the report should not imply the study covered TypeScript.
- **The authors' own scope limit.** Sec. 8 states the conclusions "are valid for this language only" and that the 16 open-source projects may not represent closed-source or other open-source code. Do not generalise the 52% figure to software at large.
- **Cite the ICSE 2016 paper, not the 2017 reprint.** DBLP carries a one-page *Software Engineering* 2017 abstract of the same work; it is not the peer-reviewed full paper and has different pagination.
- **This source counts toward the peer-reviewed minimum.** It is a full research paper in the main technical track of ICSE, a top-tier peer-reviewed software engineering conference.
