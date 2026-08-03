import { dijkstra } from "../algorithms/dijkstra.ts";
import { CompressedSparseRowGraph } from "../graph/compressed-sparse-row-graph.ts";
import { BinaryHeapVisitOrder } from "../visit-order/binary-heap.ts";
import { FifoVisitOrder } from "../visit-order/fifo.ts";
import { LinearScanVisitOrder } from "../visit-order/linear-scan.ts";

export const SOURCE_VERTEX = 0;
export const TARGET_VERTEX = 3;

export type VisitOrderName = "FifoVisitOrder" | "LinearScanVisitOrder" | "BinaryHeapVisitOrder";

export interface CounterexampleRun {
  readonly visitOrderName: VisitOrderName;
  readonly distance: Int32Array;
}

const VERTEX_NAMES = ["S", "A", "B", "T"];

// S->A (1), S->T (8), A->B (1), B->T (1), grouped by source. Four vertices and four arcs are small enough to write
// out, so the figure needs no generator.
const COUNTEREXAMPLE = new CompressedSparseRowGraph(
  4,
  Int32Array.of(0, 2, 3, 4, 4),
  Int32Array.of(1, 3, 2, 3),
  Int32Array.of(1, 8, 1, 1),
);

const VISIT_ORDER_CAPACITY = COUNTEREXAMPLE.arcCount + 1;
const NAME_WIDTH = 22;
const DISTANCE_WIDTH = 5;

export function runBfsFailureFigure(): CounterexampleRun[] {
  const runs: CounterexampleRun[] = [
    { name: "FifoVisitOrder" as const, order: new FifoVisitOrder(VISIT_ORDER_CAPACITY) },
    { name: "LinearScanVisitOrder" as const, order: new LinearScanVisitOrder(COUNTEREXAMPLE.vertexCount) },
    { name: "BinaryHeapVisitOrder" as const, order: new BinaryHeapVisitOrder(VISIT_ORDER_CAPACITY) },
  ].map(({ name, order }) => ({ visitOrderName: name, distance: dijkstra(COUNTEREXAMPLE, SOURCE_VERTEX, order) }));

  console.log("One relaxation loop, three visit orders, one weighted graph.\n");
  console.log("  S -> A (1)    A -> B (1)    B -> T (1)    S -> T (8)\n");
  console.log(`  ${"visit order".padEnd(NAME_WIDTH)}${VERTEX_NAMES.map((name) => name.padStart(DISTANCE_WIDTH)).join("")}`);
  for (const run of runs) {
    const distances = Array.from(run.distance, (value) => String(value).padStart(DISTANCE_WIDTH)).join("");
    console.log(`  ${run.visitOrderName.padEnd(NAME_WIDTH)}${distances}`);
  }
  console.log("\n  The FIFO settles T on the one-hop arc of weight 8 and never revises it. The shortest path is S -> A -> B -> T at 3.");

  return runs;
}
