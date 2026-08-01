# Lock the benchmark methodology

Labels: wayfinder:grilling
Type: HITL
Status: open
Blocked by: [Lock the design specification](03-design-spec.md)
Assignee: (unclaimed)

## Question

This is the project's highest-risk decision. Bad methodology does not produce weak results, it produces *invalid* ones, and the entire report rests on the numbers being trustworthy. Lock how measurement works before any harness is written.

### Already settled during charting (confirm, do not re-litigate)

- Experiment 1 measures time, varying extract-min. Experiment 2 measures memory, varying graph representation.
- Sweep A: degree 8 fixed, V doubling 1K to 32K, capped at 16K if the run gets long. Sweep B: V fixed at 2,000, average degree doubling 4 to 512. Experiment 2: V = 100K at degree 8.
- Memory protocol: parse, build, drop all references to the parsed data, force GC under `--expose-gc`, then measure.
- Full `docker run` targets roughly 2 minutes.

### To resolve

- **V8 warm-up.** Un-warmed benchmarks in Node measure the interpreter rather than optimized code, and the effect is large enough to invert results. Decide the warm-up iteration count, whether warm-up runs on a smaller graph or the real one, and how to confirm warm-up actually happened rather than assuming it.
- **Trials and aggregation.** How many timed trials per configuration. Whether the reported statistic is median, mean, or minimum, and the argument for it — minimum is standard for benchmarking because it suppresses scheduler noise, median is more defensible to a general reader. Whether variance or a confidence interval is reported, and whether the report shows error bars.
- **Timer.** `performance.now()` against `process.hrtime.bigint()`, and what resolution the fastest configuration actually needs.
- **Isolation.** Whether each variant runs in a fresh process. This matters more than it appears: V8 de-optimizes polymorphic call sites, so running the linear-scan and heap variants in one process can make whichever runs second look worse for reasons unrelated to the technique. Fresh processes per variant is the safe default, at some cost in orchestration.
- **Memory measurement.** `process.memoryUsage().heapUsed` against `v8.getHeapStatistics()`, how many forced GC passes before reading, and whether a baseline measurement is subtracted. Also whether retained size is measured any other way, since typed arrays live outside the V8 object heap and may not appear where expected — a real hazard for CSR, whose entire advantage could be invisible to the wrong counter.
- **Output format.** What the harness emits: a JSON results file, a console table, or both. This is what the user hands back after running the benchmark, so it must be complete enough to write a report from without re-running anything.
- **Figures.** Which charts each experiment produces, and how they are generated given the zero-dependency rule. Options: emit SVG directly from the harness, render an HTML page with inline chart markup, or emit data for charting elsewhere. This is currently in the map's fog and could be settled here.
- **What the report claims from all this.** Which specific comparisons the numbers license, and which they do not. In particular, whether the density crossover can be *located* or only *bracketed* by Sweep B's resolution.

This ticket blocks [Specify the implementation requirements](05-implementation-requirements.md) and contributes to [Lock the report outline](07-report-outline.md).
