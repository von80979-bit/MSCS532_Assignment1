// The prose calls these the size series, the density series, and the crossover configurations. The record keeps the
// original axis values, and methodology section 6 says that mismatch is deliberate and must not be reconciled.
export type Axis = "size" | "density" | "crossover-probe";

export type Variant = "linear-scan" | "binary-heap";

// A graph. The seed is not part of it: one seed is chosen for the whole run, so it arrives with the assignment rather
// than sitting on eighteen rows that would all repeat it.
export interface Configuration {
  readonly axis: Axis;
  readonly vertexCount: number;
  readonly averageTotalDegree: number;
}

// The eighteen of methodology section 6, written out rather than produced by a doubling loop, so a reader checks this
// list against that table row by row. Both variants of each is the 36 children of section 6.4, and the (2000, 8) the
// two series share is the free cross-process reproducibility check that section names.
export const CONFIGURATIONS: readonly Configuration[] = [
  { axis: "size", vertexCount: 1000, averageTotalDegree: 8 },
  { axis: "size", vertexCount: 2000, averageTotalDegree: 8 },
  { axis: "size", vertexCount: 4000, averageTotalDegree: 8 },
  { axis: "size", vertexCount: 8000, averageTotalDegree: 8 },
  { axis: "size", vertexCount: 16000, averageTotalDegree: 8 },
  { axis: "size", vertexCount: 32000, averageTotalDegree: 8 },

  { axis: "density", vertexCount: 2000, averageTotalDegree: 4 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 8 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 16 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 32 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 64 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 128 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 256 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 512 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 1024 },
  { axis: "density", vertexCount: 2000, averageTotalDegree: 2048 },

  // Deliberately outside the sparse regime, at 76.8% and 97.5% of the arc ceiling. Reported, and kept out of the two
  // time charts.
  { axis: "crossover-probe", vertexCount: 2000, averageTotalDegree: 3072 },
  { axis: "crossover-probe", vertexCount: 2000, averageTotalDegree: 3900 },
];
