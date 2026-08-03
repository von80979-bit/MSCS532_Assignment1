import { dijkstra } from "../algorithms/dijkstra.ts";
import { findOptimalityViolation } from "../algorithms/optimality-conditions.ts";
import { describeGraphRequest, generateGraph, SOURCE_VERTEX } from "../generation/graph-builder.ts";
import { CompressedSparseRowGraph } from "../graph/compressed-sparse-row-graph.ts";
import { fnv1aHex } from "../support/fnv1a.ts";
import type { VisitOrder } from "../visit-order/visit-order.ts";
import type { Axis, Variant } from "./configurations.ts";
import { summarizeTrials } from "./statistics.ts";

const WARMUP_ITERATIONS = 10;
const TIMED_TRIALS = 10;

// One configuration and variant, which is everything a measuring process is told and everything it needs.
export interface Assignment {
  readonly axis: Axis;
  readonly vertexCount: number;
  readonly averageTotalDegree: number;
  readonly seed: number;
  readonly variant: Variant;
}

// Methodology section 8.2, field for field. All ten raw trials are kept alongside the five derived statistics, so a
// later question about spread or an outlier never forces a re-run.
export interface MeasurementRecord {
  readonly axis: Axis;
  readonly vertexCount: number;
  readonly averageTotalDegree: number;
  readonly arcCount: number;
  readonly seed: number;
  readonly variant: Variant;
  readonly trials: readonly number[];
  readonly medianNs: number;
  readonly minNs: number;
  readonly maxNs: number;
  readonly meanNs: number;
  readonly stddevNs: number;
  readonly distanceHash: string;
}

// The generated record dies at this return: the rejection set and the three arrays it filled are unreachable once the
// representation holds its own copies, so the 287 MB peak of the densest configuration can be reclaimed during warm-up
// rather than inside a timed trial. Nothing here may be hoisted into module scope or closed over.
function buildGraph({ vertexCount, averageTotalDegree, seed }: Assignment): CompressedSparseRowGraph {
  const generated = generateGraph({ vertexCount, averageTotalDegree, seed });
  return CompressedSparseRowGraph.fromArcs(generated.vertexCount, generated.arcSource, generated.arcTarget, generated.arcWeight);
}

// Only the assigned implementation is imported, so this process sees one receiver shape at the loop's single interface
// call site and V8 inlines it. Loading both would de-optimize that site and penalise whichever variant ran second for
// reasons that have nothing to do with the data structure.
async function loadVisitOrderFactory(variant: Variant, graph: CompressedSparseRowGraph): Promise<() => VisitOrder> {
  if (variant === "linear-scan") {
    const { LinearScanVisitOrder } = await import("../visit-order/linear-scan.ts");
    return () => new LinearScanVisitOrder(graph.vertexCount);
  }
  const { BinaryHeapVisitOrder } = await import("../visit-order/binary-heap.ts");
  return () => new BinaryHeapVisitOrder(graph.arcCount + 1);
}

async function measure(assignment: Assignment): Promise<MeasurementRecord> {
  const graph = buildGraph(assignment);
  const newVisitOrder = await loadVisitOrderFactory(assignment.variant, graph);

  // Ten iterations on the real graph, discarded. They tier the loop up out of the interpreter, and they sit here so
  // that the generator's peak is collectable while nothing is being measured.
  for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration++) {
    dijkstra(graph, SOURCE_VERTEX, newVisitOrder());
  }

  const trials: number[] = [];
  let distance!: Int32Array;
  for (let trial = 0; trial < TIMED_TRIALS; trial++) {
    const order = newVisitOrder();                     // allocation is setup, so it is bracketed out
    const startedAt = process.hrtime.bigint();
    distance = dijkstra(graph, SOURCE_VERTEX, order);
    const elapsed = process.hrtime.bigint() - startedAt;
    trials.push(Number(elapsed));
  }

  const violation = findOptimalityViolation(graph, SOURCE_VERTEX, distance);
  if (violation !== undefined) {
    console.error(`\nFAILED: ${describeGraphRequest(assignment)} ${assignment.variant}: ${violation}`);
    process.exit(1);
  }

  return {
    axis: assignment.axis,
    vertexCount: assignment.vertexCount,
    averageTotalDegree: assignment.averageTotalDegree,
    arcCount: graph.arcCount,
    seed: assignment.seed,
    variant: assignment.variant,
    trials,
    ...summarizeTrials(trials),
    distanceHash: fnv1aHex(distance),
  };
}

// Forked with one assignment on the command line and an inter-process channel to answer on. Neither is optional, and
// running this file directly gets the message rather than a crash halfway through a measurement.
function connectToParent(): { assignment: Assignment; report: (record: MeasurementRecord) => void } {
  const encoded = process.argv[2];
  const send = process.send?.bind(process);
  if (encoded === undefined || send === undefined) {
    console.error("child.ts is forked by the benchmark parent with an assignment; it is not run directly.");
    process.exit(1);
  }
  return { assignment: JSON.parse(encoded) as Assignment, report: (record) => void send(record) };
}

const { assignment, report } = connectToParent();
report(await measure(assignment));
