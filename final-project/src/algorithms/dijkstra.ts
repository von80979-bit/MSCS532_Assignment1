import type { CompressedSparseRowGraph } from "../graph/compressed-sparse-row-graph.ts";
import type { VisitOrder } from "../visit-order/visit-order.ts";

export const INFINITE_DISTANCE = 0x7fffffff;

// The one relaxation loop. Which VisitOrder is passed in decides whether it runs as BFS, naive Dijkstra, or heap Dijkstra.
export function dijkstra(graph: CompressedSparseRowGraph, source: number, order: VisitOrder): Int32Array {
  const distance = new Int32Array(graph.vertexCount).fill(INFINITE_DISTANCE);
  const settled = new Uint8Array(graph.vertexCount);

  distance[source] = 0;
  order.add(source, 0);

  while (order.next()) {
    const u = order.node;
    if (settled[u]) {
      continue;              // a stale entry from the heap's lazy deletion; the linear scan never produces one
    }
    settled[u] = 1;

    const end = graph.rowOffset[u + 1];
    for (let i = graph.rowOffset[u]; i < end; i++) {
      const v = graph.columnIndex[i];
      const candidate = distance[u] + graph.weight[i];
      // !settled[v] is what separates the FIFO run from SPFA, a queue-based Bellman-Ford refinement. Dropping it
      // re-opens a settled vertex whose distance later improves, which is correct on weighted graphs and is not BFS.
      // BFS fixes a vertex at first discovery and never revises it, and this guard is exactly that property.
      if (!settled[v] && candidate < distance[v]) {
        distance[v] = candidate;
        order.add(v, candidate);
      }
    }
  }

  return distance;
}
