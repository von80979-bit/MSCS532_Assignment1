// Arcs grouped by source vertex: vertex u owns columnIndex[rowOffset[u]] up to but not including columnIndex[rowOffset[u + 1]],
// with weight[i] the weight of the arc at columnIndex[i]. rowOffset has vertexCount + 1 entries.
export class CompressedSparseRowGraph {
  readonly vertexCount: number;
  readonly arcCount: number;
  readonly rowOffset: Int32Array;
  readonly columnIndex: Int32Array;
  readonly weight: Int32Array;

  constructor(vertexCount: number, rowOffset: Int32Array, columnIndex: Int32Array, weight: Int32Array) {
    this.vertexCount = vertexCount;
    this.arcCount = columnIndex.length;
    this.rowOffset = rowOffset;
    this.columnIndex = columnIndex;
    this.weight = weight;
  }

  // Counting sort in O(V + E), straight from the generator's flat arrays. An intermediate object graph would allocate
  // one object per arc for no purpose and hand the collector a large graph to trace during the run. Arcs land within a
  // vertex's block in whatever order the sort produces, because nothing in the relaxation loop depends on that order.
  static fromArcs(vertexCount: number, arcSource: Int32Array, arcTarget: Int32Array, arcWeight: Int32Array): CompressedSparseRowGraph {
    const arcCount = arcSource.length;
    const rowOffset = new Int32Array(vertexCount + 1);
    for (let i = 0; i < arcCount; i++) {
      rowOffset[arcSource[i] + 1]++;               // counted one slot high, so the prefix sum leaves the offsets in place
    }
    for (let u = 1; u <= vertexCount; u++) {
      rowOffset[u] += rowOffset[u - 1];
    }

    const cursor = rowOffset.slice(0, vertexCount);
    const columnIndex = new Int32Array(arcCount);
    const weight = new Int32Array(arcCount);
    for (let i = 0; i < arcCount; i++) {
      const slot = cursor[arcSource[i]]++;
      columnIndex[slot] = arcTarget[i];
      weight[slot] = arcWeight[i];
    }

    return new CompressedSparseRowGraph(vertexCount, rowOffset, columnIndex, weight);
  }
}
