# Towards Effective Assessment of Steady State Performance in Java Software: Are We There Yet?

**APA 7 reference**
Traini, L., Cortellessa, V., Di Pompeo, D., & Tucci, M. (2023). Towards effective assessment of steady state performance in Java software: Are we there yet? *Empirical Software Engineering, 28*(1), Article 13. https://doi.org/10.1007/s10664-022-10247-x

**Recency and access.** Published online 28 November 2022 in the 2023 volume, inside the 2017-to-today window. **Open access under CC BY 4.0.** The publisher's version of record was downloaded from Springer and read in full; no paywall, login, or institutional access.

*Verification.* Every field checked against three independent records plus the article itself, and they agree.

- **Crossref REST API** for `10.1007/s10664-022-10247-x` returns type `journal-article`, title "Towards effective assessment of steady state performance in Java software: are we there yet?", the four authors Luca **Traini**, Vittorio **Cortellessa**, Daniele **Di Pompeo**, Michele **Tucci** in that order, container title *Empirical Software Engineering*, volume **28**, issue **1**, **article number 13**, publisher Springer, issued 28 November 2022, ISSN 1382-3256 and 1573-7616, licence `https://creativecommons.org/licenses/by/4.0`.
- **DBLP** independently returns *Empir. Softw. Eng.* volume 28, number 1, pages 13, year **2023**, the same DOI, and the same four authors (disambiguating the last as "Michele Tucci 0001"). DBLP separately lists `CoRR abs/2209.15369` as the preprint of the same work.
- **OpenAlex** independently returns the same title, the same four authors, venue *Empirical Software Engineering*, volume 28, issue 1, and open-access status with a Springer PDF.
- **The article itself** carries the running header "Empir Software Eng (2023) 28:13" on every page, the line "Accepted: 30 September 2022 / Published online: 28 November 2022", and "© The Author(s) 2022".

**On the year.** Crossref's issued date is 2022 (online-first) while DBLP and the article's own running header give the **2023** volume. **Cite 2023**, which is the volume year and the year the article header prints.

**Full text.** Read in full from the publisher's version of record, **57 pages** (the running footers read "Page *n* of 57"). Locations below give the section number and the article page, both of which are exact for this copy.

**Fabrication check.** The paper exists, the DOI resolves, and it says exactly what it is being cited for. It is a large empirical study of whether Java microbenchmarks reach a steady state and whether developers estimate warmup correctly, and it applies Barrett et al.'s changepoint technique to do so.

---

## Study design

- **Scale.** **586 JMH benchmarks from 30 Java systems**, involving approximately **9.056 billion benchmark invocations** and roughly **93 days** of total execution time. (§1, p. 3.)
- **Detection method.** Steady state determined with "an automated statistical approach by Barrett et al. (2017) based on changepoint analysis (Killick et al. 2012)", described as "one of the most advanced automated technique to determine steady state execution in Java benchmarks." (§1, p. 3.)
- **Repetition structure.** JMH provides three nested levels of repetition: **invocations**, **iterations**, and **forks**, where a fork is a fresh JVM instantiation. Classification is performed first at fork level and then combined to a benchmark-level label. (§2.2, pp. 7–8; §4.3.)
- **Research questions.** RQ1 whether benchmarks reach a steady state; RQ2 how steady state impacts measured performance; RQ3 effectiveness of developer static configurations; RQ4 and RQ5 effectiveness of dynamic reconfiguration. (§3, p. 10.)

---

## Key claims the report will draw on

- **The two assumptions behind normal practice are named and both are found wanting.** The abstract states that discarding warmup and analysing the rest rests on two strong assumptions, "(i) benchmarks always reach a steady state of performance and (ii) developers accurately estimate warmup", and reports that Java microbenchmarks "do not always reach a steady state, and often developers fail to accurately estimate the end of the warmup phase." (Abstract.)
- **Fork-level and benchmark-level results differ, and the benchmark-level one is the sobering one.** Globally **89.1% of individual forks reached a steady state**, ranging from 69% (JCTools) to 98.9% (cantaloupe). But because a single non-steady fork flips a benchmark's label, **43.5% of benchmarks are classified as inconsistent**, and the share of fully steady benchmarks varies from **20% (JCTools) to 95% (rdf4j)**, with only 5 of 30 systems above 80%. (§5.1, pp. 22–24.)
- **No benchmark failed entirely.** They "didn't find any benchmark classified as such" for the no-steady-state label, so every benchmark had at least one fork settle. This is a genuine difference from Barrett et al.'s harsher picture and the report should represent it honestly. (§5.1, p. 24.)
- **Measuring before the steady state distorts results severely.** Within forks, the relative performance deviation between steady and non-steady phases has "an average RPD of 123,937% and a median of 41% (IQR 14–195%)." Even the better-behaved projects show averages of 36% to 57%. (§5.2, p. 25.)
- **A small amount of contamination is enough to matter.** "given these large magnitudes, even a tiny portion of non-steady measurements can substantially distort performance indices". (§5.2, p. 26.)
- **Across forks the deviation is smaller but not negligible.** Average RPD between steady and non-steady forks is **5%**, median **2%** (IQR 0–5%), reaching averages of 13% to 19% on byte-buddy, JCTools and RxJava. The authors note that in Java microbenchmarking even a 5% regression can be enough to reject a code revision. (§5.2, pp. 26–27.)
- **Time to steady state cannot be generalised.** The time taken "considerably varies, even within a single system, therefore it can hardly be generalized", because reaching a steady state depends on the nature of the benchmark. (§5.1, p. 25.)
- **The practical recommendation on repetition count.** "we always recommend to run at least 5 forks (i.e., the default in JMH) to mitigate the impact of non-steady measurements", while noting practitioners may run fewer under time pressure and should be aware of the consequences. (§6, p. 49.)
- **Automated stability heuristics remain imperfect.** Dynamic reconfiguration significantly improves on developer static configurations but "still produce inaccurate estimates of the warmup time, hence causing time-consuming benchmark executions and distorted results", with CV- and KLD-based criteria inducing median performance deviations of 9% and 10% respectively. (§1, p. 3; §6, p. 49.)

---

## Verbatim quotations, with locations

- "Due to Java Virtual Machine optimizations, microbenchmarks are usually subject to severe performance fluctuations in the first phase of their execution (also known as warmup). For this reason, software developers typically discard measurements of this phase and focus their analysis when benchmarks reach a steady state of performance." (Abstract.)
- "Unfortunately, this approach is based on two strong assumptions: (i) benchmarks always reach a steady state of performance and (ii) developers accurately estimate warmup. In this paper, we show that Java microbenchmarks do not always reach a steady state, and often developers fail to accurately estimate the end of the warmup phase." (Abstract.)
- "We found that a considerable portion of studied benchmarks do not hit the steady state, and warmup estimates provided by software developers are often inaccurate (with a large error). This has significant implications both in terms of results quality and time-effort." (Abstract.)
- "After an extensive experimentation of 586 JMH benchmarks from 30 Java systems, involving ∼9.056 billion benchmark invocations for an overall execution time of ∼93 days, we determined whether and when each benchmark reaches a steady state using an automated statistical approach by Barrett et al. (2017) based on changepoint analysis (Killick et al. 2012)." (§1, p. 3.)
- "Our results show that JMH benchmarks do not always reach a steady state of performance, thereby demystifying the current cornerstone of Java microbenchmarking, i.e., the two-phase assumption. This finding implies that practitioners may rely on measurements that are not representative of “actual” steady state performance." (§1, p. 4.)
- "our results suggest that developer static configurations are often ineffective for warmup estimation, and may cause either improperly long execution times or misleading performance assessment." (§1, p. 4.)
- "The percentage of forks that reached steady state varies between 69% (JCTools) and 98.9% (cantaloupe)." (§5.1, pp. 22–23.)
- "Globally, in most cases (89.1% in the last row of Fig. 6a), individual forks were able to reach a steady state according to our detection technique." (§5.1, p. 23.)
- "the percentage of steady state benchmarks varies between 20% (JCTools) and 95%(rdf4j). Only 5 systems overcome a 80% percentage" (§5.1, p. 23.)
- "all the remaining benchmarks are classified as inconsistent (43.5%), which means that their forks showed mixed behavior." (§5.1, p. 24.)
- "The figure highlights strong performance deviations when the steady state is reached, with an average RPD of 123,937% and a median of 41% (IQR 14–195%)." (§5.2, p. 25.)
- "The above results suggest that performance substantially changes when forks reach a steady state of performance, and provide empirical evidence on the danger of using non-steady measurements during performance assessment. Indeed, given these large magnitudes, even a tiny portion of non-steady measurements can substantially distort performance indices, with significant implications on performance assessment." (§5.2, pp. 25–26.)
- "The average RPD between steady and non-steady forks is 5%, while the median RPD is 2% (IQR 0-5%)." (§5.2, p. 26.)
- "We can observe that the time spent considerably varies, even within a single system, therefore it can hardly be generalized. This result is not surprising, because the attainment of a steady state inherently depends on the nature of the benchmark." (§5.1, p. 25.)
- "Nonetheless, we always recommend to run at least 5 forks (i.e., the default in JMH) to mitigate the impact of non-steady measurements." (§6, p. 49.)

---

## Relevance to this project

- **It is the modern, large-scale confirmation that warmup cannot be guessed.** The project's benchmark harness must decide how many warm-up runs to discard and how many trials to time. This paper shows, over 586 benchmarks and 9 billion invocations, that a developer's own estimate of that boundary is frequently wrong and that the cost of getting it wrong is a median 41% distortion within a run. That is the citation that makes the report's warm-up protocol a considered decision rather than an arbitrary constant.
- **It supplies the quantitative case for repeating whole process launches.** Its unit of repetition is the fork, a fresh JVM. Barrett et al. make the same argument for VMs generally; Traini et al. put a recommendation on it, "at least 5 forks." The report's harness can adopt an analogous rule for fresh Node processes and cite a published minimum.
- **It gives the report a defensible standard of evidence for its own timing claims.** Experiment 1's result is a speedup ratio. The 5% across-fork RPD figure, and the observation that a 5% regression can be enough to reject a change in practice, tell the report how large a difference has to be before it means anything. A heap-versus-linear-scan gap of several times is far above that floor, which is a point worth making explicitly.
- **It pairs with Barrett et al. rather than duplicating them.** Barrett et al. establish that steady state often is not reached, across seven VMs including V8. Traini et al. take that method to a much larger corpus, get a less alarming fork-level picture, and shift the emphasis to the practical question of estimating warmup. Citing both lets the report present a balanced view instead of a single dramatic statistic.

---

## Cautions

- **This is Java and JMH, not JavaScript and not V8.** The runtime is the JVM. The transfer to Node is by analogy, and the report must say so. **Barrett et al. (2017) is the source that actually measured V8**; use this paper for the warmup-estimation finding and the scale, not for a claim about the report's own runtime.
- **Do not conflate the fork-level and benchmark-level numbers.** "89.1% of forks reached a steady state" and "43.5% of benchmarks are inconsistent" describe the same data at different granularities. Quoting one without the other misrepresents the finding in either direction.
- **Do not quote the 123,937% mean without its context.** It is an arithmetic mean over a heavy-tailed distribution driven by a few projects reaching billions of percent. **The median of 41% is the number to lead with**, and the mean should only appear alongside the authors' own note that it is skewed.
- **It is not a criticism of JMH.** JMH is described as the de facto standard framework and its defaults as reasonable. The finding is that any single fixed configuration will suit some benchmarks and not others.
- **The paper says nothing about data structures, graphs, heaps, or complexity.** Methodological use only.
- **The project cannot approach this scale and should not pretend to.** 93 days of execution against a two-minute Docker budget. Cite the standard, state the shortfall.
- **Mind the year.** Online-first 2022, volume year 2023. Cite 2023 with volume 28, issue 1, Article 13, and do not mix the 2022 Crossref date into the entry.
- **This source counts toward the peer-reviewed minimum.** *Empirical Software Engineering* is an established peer-reviewed journal, and the article records its own review outcome with an accepted date and a communicating editor.
