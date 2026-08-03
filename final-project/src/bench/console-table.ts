import type { MeasurementRecord } from "./child.ts";
import type { Configuration } from "./configurations.ts";
import { speedupOf, toMilliseconds } from "./statistics.ts";

// One row of the table: a configuration and both of its variants, which is also the unit the parent compares hashes
// over, since the two children measure the same graph.
export interface ConfigurationMeasurement {
  readonly configuration: Configuration;
  readonly linearScan: MeasurementRecord;
  readonly binaryHeap: MeasurementRecord;
}

const HEADINGS = ["axis", "vertexCount", "averageTotalDegree", "arcCount", "linearScanMs", "binaryHeapMs", "speedup"];

const COLUMN_GAP = "  ";

// Milliseconds to three places are what methodology section 8.4 prints, and three places still resolve the fastest
// configuration to about one part in a hundred.
function formatMilliseconds(nanoseconds: number): string {
  return toMilliseconds(nanoseconds).toFixed(3);
}

function cellsFor({ configuration, linearScan, binaryHeap }: ConfigurationMeasurement): string[] {
  return [
    configuration.axis,
    String(configuration.vertexCount),
    String(configuration.averageTotalDegree),
    String(linearScan.arcCount),
    formatMilliseconds(linearScan.medianNs),
    formatMilliseconds(binaryHeap.medianNs),
    `${speedupOf(linearScan.medianNs, binaryHeap.medianNs).toFixed(2)}x`,
  ];
}

// Widths are read off the rows rather than fixed, because "crossover-probe" is wider than its own heading and a table
// whose digits do not line up is not worth the screenshot it exists for.
function rowFormatterFor(rows: readonly (readonly string[])[]): (cells: readonly string[]) => string {
  const widths = HEADINGS.map((heading, column) => Math.max(heading.length, ...rows.map((cells) => cells[column].length)));
  return (cells) =>
    cells
      .map((cell, column) => (column === 0 ? cell.padEnd(widths[column]) : cell.padStart(widths[column])))
      .join(COLUMN_GAP);
}

export function printConsoleTable(measurements: readonly ConfigurationMeasurement[]): void {
  const rows = measurements.map(cellsFor);
  const format = rowFormatterFor(rows);

  console.log(format(HEADINGS));
  for (const cells of rows) {
    console.log(format(cells));
  }
}
