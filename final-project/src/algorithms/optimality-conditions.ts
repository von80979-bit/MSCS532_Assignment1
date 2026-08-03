import type { CompressedSparseRowGraph } from "../graph/compressed-sparse-row-graph.ts";

// Gate 3, which consults no second implementation: every arc satisfies the triangle bound and every non-source vertex
// sits tight on one incoming arc. The arc list is walked out of the representation's own arrays rather than the
// generator's, so the check reads the structure the loop actually ran on and needs nothing kept alive to run it.
export function findOptimalityViolation(graph: CompressedSparseRowGraph, source: number, distance: Int32Array): string | undefined {
  const tight = new Uint8Array(graph.vertexCount);

  for (let u = 0; u < graph.vertexCount; u++) {
    const end = graph.rowOffset[u + 1];
    for (let i = graph.rowOffset[u]; i < end; i++) {
      const v = graph.columnIndex[i];
      const bound = distance[u] + graph.weight[i];
      if (distance[v] > bound) {
        return `arc ${u} -> ${v} of weight ${graph.weight[i]} breaks the triangle bound, distance ${distance[v]} against ${bound}`;
      }
      if (distance[v] === bound) {
        tight[v] = 1;
      }
    }
  }

  for (let v = 0; v < graph.vertexCount; v++) {
    if (v !== source && tight[v] === 0) {
      return `vertex ${v} at distance ${distance[v]} has no incoming arc on which the bound is tight`;
    }
  }

  return undefined;
}
