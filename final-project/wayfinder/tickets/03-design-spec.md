# Lock the design specification

Labels: wayfinder:grilling
Type: HITL
Status: open
Blocked by: [Justify the optimization technique against the study](02-technique-justification.md)
Assignee: (unclaimed)

## Question

Produce the design specification every implementation and writing session builds on, so nothing downstream has to re-decide *what* the system is. Output: a design-spec markdown file under `final-project/`.

### Already settled during charting (confirm, do not re-litigate)

- Four hand-written structures, zero runtime dependencies: binary min-heap priority queue with sift-up/sift-down, FIFO queue with a head index or ring buffer (never `Array.shift`), adjacency list, CSR.
- The heap uses **lazy deletion** rather than decrease-key: push a fresh entry on every improvement, discard stale pops. The report states this explicitly so the claimed complexity matches the shipped code.
- Three algorithm variants sharing one relaxation loop: BFS with the FIFO, Dijkstra with linear-scan extract-min, Dijkstra with the heap.
- All variants emit identical distance vectors. BFS on unit weights is the correctness oracle.
- Seeded generator, spanning tree first for connectivity, then random edges to hit target density.

### To resolve

- **Graph model.** Directed or undirected, and why. Weight range and distribution, and whether integer or floating point. Whether self-loops and parallel edges are permitted, and how the generator avoids or handles them. How the source vertex is chosen and whether it is fixed across variants (it must be, for the distance vectors to be comparable).
- **CSR construction.** The exact arrays and their types: row offsets, column indices, weights. Whether weights live in `Float64Array` or `Int32Array`, which follows from the weight decision above. How CSR is built from the parsed JSON, and whether construction time counts as measured time or setup.
- **Adjacency-list representation.** What the "unoptimized" baseline concretely is, since this decides how dramatic Experiment 2 looks. An array of arrays of small objects, a `Map` of arrays, or something else. It must be a *plausible* implementation a competent developer would write, not a strawman — the report's honesty depends on this. **Stakes raised by [Justify the optimization technique against the study](02-technique-justification.md):** CSR is now load-bearing for the report's defence against the assignment's "especially in data structure optimization" wording, because it is the one experiment with no algorithmic story to confuse it with. A strawman baseline would collapse that defence, so this item is no longer a matter of taste.
- **Module boundaries.** What files exist and what each owns. The shared relaxation loop needs a shape that lets the container and the graph representation vary independently without duplicating the algorithm, since duplicated loops would let implementation differences leak into the measurements.
- **The BFS failure figure.** The specific small weighted graph where BFS reports a wrong distance, for step 2 of the narrative arc. Small enough to draw, unambiguous enough that the error is obvious.
- **Correctness checking.** How distance-vector equality is asserted across variants, and whether that check runs inside the benchmark or as a separate verification step.

This ticket blocks [Lock the benchmark methodology](04-benchmark-methodology.md) and [Specify the implementation requirements](05-implementation-requirements.md).
