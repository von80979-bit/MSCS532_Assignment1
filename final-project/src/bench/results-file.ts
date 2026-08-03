import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { MeasurementRecord } from "./child.ts";

// /app/results in the image, and final-project/results on a host checkout. Resolved from this module rather than from
// the working directory, so the destination does not depend on where the process was started, and written to whether
// or not anything is mounted over it: a mount is invisible from inside the container, so there is nothing to detect.
const RESULTS_DIRECTORY = fileURLToPath(new URL("../../results/", import.meta.url));

// One entry per graph, carrying the hash the two children agreed on. This is the reading of design spec section 6.2
// that costs nothing: the measuring processes already computed the vector, so no graph is generated a third time.
export interface VerifiedGraph {
  readonly vertexCount: number;
  readonly averageTotalDegree: number;
  readonly seed: number;
  readonly distanceHash: string;
}

export interface ResultsFile {
  readonly verification: {
    // The gates a benchmark run still carries: the optimality conditions inside every measuring child, and agreement
    // between the two variants on every graph below. The counterexample and the BFS oracle belong to verify, which a
    // benchmark run no longer calls, so this flag is narrower than it was before implementation requirements 6.2.
    readonly gatesPassed: boolean;
    readonly graphs: readonly VerifiedGraph[];
  };
  readonly measurements: readonly MeasurementRecord[];
}

// The results file and the charts all land in the same place, so one module knows where that is and returns the
// absolute path it wrote, which is what the parent prints.
export function writeResultsArtifact(fileName: string, contents: string): string {
  mkdirSync(RESULTS_DIRECTORY, { recursive: true });
  const path = join(RESULTS_DIRECTORY, fileName);
  writeFileSync(path, contents);
  return path;
}

// Called once, after every child has succeeded and every hash has matched. A run that failed a gate never reaches
// here, which is what implementation requirements section 6.4 means by no partial results file.
export function writeResultsFile(results: ResultsFile): string {
  return writeResultsArtifact("results.json", `${JSON.stringify(results, undefined, 2)}\n`);
}
