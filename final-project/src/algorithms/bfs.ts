import type { CompressedSparseRowGraph } from "../graph/compressed-sparse-row-graph.ts";

const UNREACHED = 0x7fffffff;   // its own copy of the shared loop's infinity, so an unreachable vertex compares equal rather than failing the gate

// The oracle for the unit-weight gate, deliberately duplicating the queue and the loop rather than reaching for
// FifoVisitOrder and the shared relaxation loop: an oracle that shares the code it checks agrees with that code's bugs.
// Weights are not read at all, which is what makes this a hop count and not a second Dijkstra.
export function breadthFirstHopCounts(graph: CompressedSparseRowGraph, source: number): Int32Array {
  const hopCount = new Int32Array(graph.vertexCount).fill(UNREACHED);
  const queue = new Int32Array(graph.vertexCount);   // a vertex enters once, so vertexCount slots never wrap
  let head = 0;
  let tail = 0;

  hopCount[source] = 0;
  queue[tail++] = source;

  while (head < tail) {
    const u = queue[head++];
    const end = graph.rowOffset[u + 1];
    for (let i = graph.rowOffset[u]; i < end; i++) {
      const v = graph.columnIndex[i];
      if (hopCount[v] === UNREACHED) {
        hopCount[v] = hopCount[u] + 1;
        queue[tail++] = v;
      }
    }
  }

  return hopCount;
}
