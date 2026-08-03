import { breadthFirstHopCounts } from "./algorithms/bfs.ts";
import { dijkstra } from "./algorithms/dijkstra.ts";
import { findOptimalityViolation } from "./algorithms/optimality-conditions.ts";
import { runBfsFailureFigure, TARGET_VERTEX, type VisitOrderName } from "./figures/bfs-failure.ts";
import { describeGraphRequest, generateGraph, SOURCE_VERTEX, type GraphRequest } from "./generation/graph-builder.ts";
import { CompressedSparseRowGraph } from "./graph/compressed-sparse-row-graph.ts";
import { BinaryHeapVisitOrder } from "./visit-order/binary-heap.ts";
import { LinearScanVisitOrder } from "./visit-order/linear-scan.ts";

// The FIFO settles the target on the one-hop arc and reports 8; both minimum-key orders report 3. Anything else means
// the shared loop, a visit order, or the relax guard changed, and there is no counterexample any more.
const EXPECTED_TARGET_DISTANCE: Record<VisitOrderName, number> = {
  FifoVisitOrder: 8,
  LinearScanVisitOrder: 3,
  BinaryHeapVisitOrder: 3,
};

// Small enough that every gate finishes in seconds, which is what keeps verify runnable before every benchmark. The
// unit-weight graph is the one the hop-count oracle can speak about; on weighted graphs hop counts are not distances.
const VERIFICATION_GRAPHS: readonly Omit<GraphRequest, "seed">[] = [
  { vertexCount: 1000, averageTotalDegree: 8 },
  { vertexCount: 2000, averageTotalDegree: 8 },
  { vertexCount: 1000, averageTotalDegree: 8, unitWeights: true },
];

function failGate(detail: string): never {
  console.error(`\nFAILED: ${detail}`);
  process.exit(1);
}

// Gates 1 and 2, which differ only in what the canonical vector is checked against. Integers, so exact equality with no
// tolerance, and the first differing vertex is what the diagnostic of implementation requirements section 6.4 names.
function requireIdenticalDistances(request: GraphRequest, distance: Int32Array, against: Int32Array, againstName: string): void {
  for (let v = 0; v < distance.length; v++) {
    if (distance[v] !== against[v]) {
      failGate(`${describeGraphRequest(request)} BinaryHeapVisitOrder against ${againstName}: first differ at vertex ${v}, ${distance[v]} against ${against[v]}`);
    }
  }
}

// The generated record dies at the return: the rejection set and the three arrays it filled are unreachable once the
// representation holds its own copies, so nothing survives to be collected inside a timed region later.
function buildGraph(request: GraphRequest): CompressedSparseRowGraph {
  const generated = generateGraph(request);
  return CompressedSparseRowGraph.fromArcs(generated.vertexCount, generated.arcSource, generated.arcTarget, generated.arcWeight);
}

export function verify(seed: number): void {
  console.log("\nThe counterexample\n");

  for (const run of runBfsFailureFigure()) {
    const expected = EXPECTED_TARGET_DISTANCE[run.visitOrderName];
    const actual = run.distance[TARGET_VERTEX];
    if (actual !== expected) {
      failGate(`${run.visitOrderName} reported ${actual} at vertex ${TARGET_VERTEX}, expected ${expected}`);
    }
  }

  console.log("\n\nThe gates on generated graphs\n");

  const gatesRun = new Set<string>();

  for (const shape of VERIFICATION_GRAPHS) {
    const request: GraphRequest = { ...shape, seed };
    const graph = buildGraph(request);

    const heapDistance = dijkstra(graph, SOURCE_VERTEX, new BinaryHeapVisitOrder(graph.arcCount + 1));
    const scanDistance = dijkstra(graph, SOURCE_VERTEX, new LinearScanVisitOrder(graph.vertexCount));

    requireIdenticalDistances(request, heapDistance, scanDistance, "LinearScanVisitOrder");

    const violation = findOptimalityViolation(graph, SOURCE_VERTEX, heapDistance);
    if (violation !== undefined) {
      failGate(`${describeGraphRequest(request)} BinaryHeapVisitOrder: ${violation}`);
    }

    const gatesPassed = ["cross-variant equality", "the optimality conditions"];

    // The oracle is the only gate that can catch a bug the shared loop would hand to both variants alike, and it has
    // nothing to say about a weighted graph, where a hop count is not a distance.
    if (request.unitWeights) {
      requireIdenticalDistances(request, heapDistance, breadthFirstHopCounts(graph, SOURCE_VERTEX), "the standalone breadth-first search");
      gatesPassed.push("the breadth-first oracle");
    }

    for (const gate of gatesPassed) {
      gatesRun.add(gate);
    }
    console.log(`  ${graph.vertexCount} vertices, ${graph.arcCount} arcs, seed ${seed}${request.unitWeights ? ", unit weights" : ""}: ${gatesPassed.join(", ")}`);
  }

  console.log(`\nPassed: the counterexample, ${[...gatesRun].join(", ")}.`);
}
