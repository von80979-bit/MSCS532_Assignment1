import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describeGraphRequest } from "../generation/graph-builder.ts";
import type { Assignment, MeasurementRecord } from "./child.ts";
import { writeCharts } from "./charts/series-charts.ts";
import { CONFIGURATIONS, type Configuration } from "./configurations.ts";
import { printConsoleTable, type ConfigurationMeasurement } from "./console-table.ts";
import { writeResultsFile, type VerifiedGraph } from "./results-file.ts";

const CHILD_PATH = fileURLToPath(new URL("./child.ts", import.meta.url));

interface Run {
  readonly measurements: readonly ConfigurationMeasurement[];
  readonly graphs: readonly VerifiedGraph[];
}

function describeAssignment(assignment: Assignment): string {
  return `${describeGraphRequest(assignment)} ${assignment.variant}`;
}

// The record arrives as a structured object over the inter-process channel rather than by parsing the child's standard
// output, which leaves the child's stdout free for progress and means no stray log can corrupt a result.
function measureInChild(assignment: Assignment): Promise<MeasurementRecord> {
  return new Promise((resolve, reject) => {
    const child = fork(CHILD_PATH, [JSON.stringify(assignment)]);
    let record: MeasurementRecord | undefined;

    child.on("message", (message) => {
      record = message as MeasurementRecord;
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code !== 0) {
        reject(new Error(`${describeAssignment(assignment)} exited ${signal ?? code}`));
      } else if (record === undefined) {
        reject(new Error(`${describeAssignment(assignment)} exited 0 without sending a record`));
      } else {
        resolve(record);
      }
    });
  });
}

// Cross-variant equality at full scale, per implementation requirements section 6.3. The first child to measure a
// graph records its hash and every later child is compared against it; keying by the graph rather than by the
// configuration checks the (2000, 8) both series carry across all four of its processes rather than twice within each.
class DistanceHashes {
  private readonly byGraph = new Map<string, VerifiedGraph>();

  requireAgreement(record: MeasurementRecord): void {
    const key = describeGraphRequest(record);
    const recorded = this.byGraph.get(key);
    if (recorded === undefined) {
      const { vertexCount, averageTotalDegree, seed, distanceHash } = record;
      this.byGraph.set(key, { vertexCount, averageTotalDegree, seed, distanceHash });
    } else if (recorded.distanceHash !== record.distanceHash) {
      throw new Error(`${key} ${record.variant}: distance hash ${record.distanceHash} against the ${recorded.distanceHash} an earlier child recorded for this graph`);
    }
  }

  get graphs(): readonly VerifiedGraph[] {
    return [...this.byGraph.values()];
  }
}

// The run is seventy seconds of otherwise silent work, so each configuration announces itself before its children are
// forked. It carries no timing: numbers appear only once the whole run has passed.
function announce(configuration: Configuration, position: number): void {
  const counter = `${position}`.padStart(`${CONFIGURATIONS.length}`.length);
  console.log(`  ${counter}/${CONFIGURATIONS.length}  ${configuration.axis}, vertexCount ${configuration.vertexCount}, averageTotalDegree ${configuration.averageTotalDegree}`);
}

// Both variants of one configuration, the second child forked only after the first has exited.
async function measureConfiguration(configuration: Configuration, seed: number, hashes: DistanceHashes): Promise<ConfigurationMeasurement> {
  const linearScan = await measureInChild({ ...configuration, seed, variant: "linear-scan" });
  hashes.requireAgreement(linearScan);

  const binaryHeap = await measureInChild({ ...configuration, seed, variant: "binary-heap" });
  hashes.requireAgreement(binaryHeap);

  return { configuration, linearScan, binaryHeap };
}

// One child per configuration and variant, each awaited before the next is forked, so at no instant does a second
// benchmark process exist. Running them concurrently would measure scheduler contention rather than a data structure.
async function measureEveryConfiguration(seed: number): Promise<Run> {
  const measurements: ConfigurationMeasurement[] = [];
  const hashes = new DistanceHashes();

  for (const [index, configuration] of CONFIGURATIONS.entries()) {
    announce(configuration, index + 1);
    measurements.push(await measureConfiguration(configuration, seed, hashes));
  }

  return { measurements, graphs: hashes.graphs };
}

// Measurement alone, per implementation requirements section 6.2. The parent no longer runs verify: the run that
// produces the report's numbers does nothing but measure. What still guards those numbers rides inside the children,
// and no flag was added here — the call was deleted, so there is no second way to run this.
export async function benchmark(seed: number): Promise<void> {
  console.log("\n\nThe measurement\n");

  // Nothing is reported until every child has succeeded and every hash has matched. A run that reports the variant that
  // passed alongside the news that the other one failed is worse than a run that reports nothing, and that holds for
  // the eighteenth configuration failing after seventeen have passed exactly as it does for the first.
  let run: Run;
  try {
    run = await measureEveryConfiguration(seed);
  } catch (error) {
    console.error(`\nFAILED: ${(error as Error).message}`);
    console.error("A failed gate fails the run: no timing is reported and no results file is written.");
    process.exit(1);
  }

  console.log("");
  printConsoleTable(run.measurements);

  // The charts are drawn from the same measurements the results file carries, on the run that produced them, so there
  // is no manual charting step anywhere and no re-run can leave a figure describing an older measurement.
  // Reaching here is what gatesPassed records: every child's optimality conditions held on its own graph, and both
  // variants of every configuration agreed on their distance hash. Either failing throws above and writes nothing.
  const artifacts = [
    writeResultsFile({ verification: { gatesPassed: true, graphs: run.graphs }, measurements: run.measurements.flatMap(({ linearScan, binaryHeap }) => [linearScan, binaryHeap]) }),
    ...writeCharts(run.measurements),
  ];

  // The last lines, so the operator knows where the files landed without guessing whether a mount took effect.
  console.log("");
  for (const path of artifacts) {
    console.log(path);
  }
}
