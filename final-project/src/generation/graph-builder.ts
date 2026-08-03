import { Random } from "./random.ts";

export const GENERATOR_VERSION = 1;
export const SOURCE_VERTEX = 0;

const MAXIMUM_WEIGHT = 1000;

export interface GraphRequest {
  readonly vertexCount: number;
  readonly averageTotalDegree: number;
  readonly seed: number;
  readonly unitWeights?: boolean;
}

// The generator's in-memory output, consumed directly by the counting-sort construction of the representation.
export interface GeneratedGraph {
  readonly generatorVersion: number;
  readonly vertexCount: number;
  readonly averageTotalDegree: number;
  readonly arcCount: number;
  readonly seed: number;
  readonly sourceVertex: number;
  readonly unitWeights: boolean;
  readonly arcSource: Int32Array;
  readonly arcTarget: Int32Array;
  readonly arcWeight: Int32Array;
}

// The graph key of implementation requirements section 6.4, so a failure in verify and a failure in a measuring child
// name the same graph the same way.
export function describeGraphRequest({ vertexCount, averageTotalDegree, seed, unitWeights }: GraphRequest): string {
  return `(vertexCount ${vertexCount}, averageTotalDegree ${averageTotalDegree}, seed ${seed}${unitWeights ? ", unit weights" : ""})`;
}

// averageTotalDegree is total degree, so the average out-degree is half of it. Reading it as out-degree doubles every
// graph in the project, which is why the field is never called degree.
function arcCountFor(vertexCount: number, averageTotalDegree: number): number {
  return Math.floor((vertexCount * averageTotalDegree) / 2);
}

export function generateGraph({ vertexCount, averageTotalDegree, seed, unitWeights = false }: GraphRequest): GeneratedGraph {
  const arcCount = arcCountFor(vertexCount, averageTotalDegree);
  if (arcCount < vertexCount - 1) {
    throw new RangeError(`${arcCount} arcs is below the ${vertexCount - 1} the spanning out-tree needs`);
  }
  // Rejection sampling above the ceiling of distinct arcs never terminates, and it degrades well before it.
  if (arcCount > vertexCount * (vertexCount - 1)) {
    throw new RangeError(`${arcCount} arcs is above the ${vertexCount * (vertexCount - 1)} distinct arcs ${vertexCount} vertices allow`);
  }

  const random = new Random(seed);
  const arcSource = new Int32Array(arcCount);
  const arcTarget = new Int32Array(arcCount);
  const arcWeight = new Int32Array(arcCount);
  const emitted = new Set<number>();

  const label = labelPermutation(random, vertexCount);

  // A spanning out-tree rooted at the source, so every vertex is reachable and no distance is infinite. Each position
  // takes a parent from the positions before it, which is a tree in O(V) with no rejection.
  for (let position = 1; position < vertexCount; position++) {
    const tail = label[random.nextInteger(0, position - 1)];
    const head = label[position];
    arcSource[position - 1] = tail;
    arcTarget[position - 1] = head;
    emitted.add(tail * vertexCount + head);
  }

  for (let index = Math.max(vertexCount - 1, 0); index < arcCount; index++) {
    for (;;) {
      const tail = random.nextInteger(0, vertexCount - 1);
      const head = random.nextInteger(0, vertexCount - 1);
      if (tail === head) {
        continue;                                        // no self-loop can lie on a shortest path
      }
      const key = tail * vertexCount + head;             // packed, well inside the safe integer range at every configuration
      if (emitted.has(key)) {
        continue;                                        // among parallel arcs only the lightest could matter
      }
      emitted.add(key);
      arcSource[index] = tail;
      arcTarget[index] = head;
      break;
    }
  }

  for (let index = 0; index < arcCount; index++) {
    arcWeight[index] = unitWeights ? 1 : random.nextInteger(1, MAXIMUM_WEIGHT);
  }

  return {
    generatorVersion: GENERATOR_VERSION,
    vertexCount,
    averageTotalDegree,
    arcCount,
    seed,
    sourceVertex: SOURCE_VERTEX,
    unitWeights,
    arcSource,
    arcTarget,
    arcWeight,
  };
}

// Fisher-Yates over labels 1 to V-1, leaving label 0 pinned. Without it, low indices would always be ancestors and the
// run would measure the construction rather than the graph; pinning keeps the source at vertex 0.
function labelPermutation(random: Random, vertexCount: number): Int32Array {
  const label = new Int32Array(vertexCount);
  for (let index = 0; index < vertexCount; index++) {
    label[index] = index;
  }
  for (let index = vertexCount - 1; index >= 2; index--) {
    const swap = random.nextInteger(1, index);
    const held = label[index];
    label[index] = label[swap];
    label[swap] = held;
  }
  return label;
}
