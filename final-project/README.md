# Shortest-Path Visit Order — HPC Data-Structure Optimization

One relaxation loop, three hand-written containers. Which container answers "which vertex is settled
next" decides whether the loop is BFS, naive Dijkstra, or heap Dijkstra, and decides its asymptotic cost.

## Requirements

- [Docker](https://docs.docker.com/get-docker/), with at least 2 GB of memory available to it.

## 1. Build the image

From this folder (`final-project/`):

```bash
docker build -t shortest-path .
```

## 2. Run

```bash
docker run --rm -it -v "$(pwd)/results:/app/results" shortest-path
```

On PowerShell, use `${PWD}` in place of `$(pwd)`.

The program prints two options:

- **1) verify** — the correctness demonstration. Runs the four-vertex counterexample on which BFS
  returns the wrong distance, then the three correctness gates. A few seconds. Console output only.
- **2) benchmark** — the full measurement, 18 configurations across two variants in 36 sequential
  child processes. Roughly 70 seconds. Writes `results.json` and three SVG charts into `results/`.

The report cites a second seed as an independent replication, because the crossover result is seed-sensitive.
Same 18 configurations and same arc counts; different random graphs. To reproduce it:

```bash
docker run --rm -it -v "$(pwd)/results:/app/results" shortest-path --seed 7
```

## 3. Output

| File | What it is |
| --- | --- |
| `results/results.json` | every configuration, both variants, all ten raw trials |
| `results/size-series.svg` | median time against vertex count, log-log |
| `results/density-series.svg` | median time against average total degree, log-log |
| `results/speedup-by-density.svg` | the ratio, with a reference line at 1.0 — the central finding |

Timings will not match the report's tables. They were produced on one machine, and the report names it.
Ratios travel between machines; absolute times do not.
