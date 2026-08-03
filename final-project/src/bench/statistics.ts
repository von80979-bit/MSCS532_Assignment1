// Every record is in nanoseconds and every human-facing number is in milliseconds, so the one divisor lives here rather
// than once in the table and once in the charts.
export function toMilliseconds(nanoseconds: number): number {
  return nanoseconds / 1e6;
}

// The report's central quantity, defined once for the same reason: how many times the linear scan's median run is the
// heap's. The table prints it and the speedup chart plots it, and neither owns it.
export function speedupOf(linearScanMedianNs: number, binaryHeapMedianNs: number): number {
  return linearScanMedianNs / binaryHeapMedianNs;
}

export interface TrialStatistics {
  readonly medianNs: number;
  readonly minNs: number;
  readonly maxNs: number;
  readonly meanNs: number;
  readonly stddevNs: number;
}

// The reported statistic is the median; the other four describe the spread the raw trials are published for. Everything
// is rounded to whole nanoseconds, because the timer resolves to about 53 ns and a fractional digit would report
// precision the clock does not have.
export function summarizeTrials(trials: readonly number[]): TrialStatistics {
  const sorted = [...trials].sort((first, second) => first - second);
  const mean = sorted.reduce((total, trial) => total + trial, 0) / sorted.length;

  return {
    medianNs: Math.round(medianOf(sorted)),
    minNs: sorted[0],
    maxNs: sorted[sorted.length - 1],
    meanNs: Math.round(mean),
    stddevNs: Math.round(standardDeviation(sorted, mean)),
  };
}

function medianOf(sorted: readonly number[]): number {
  const half = sorted.length >> 1;
  return sorted.length % 2 === 1 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
}

// Divided by n - 1: the trials are draws from the run's timing distribution rather than a population in their own right.
function standardDeviation(trials: readonly number[], mean: number): number {
  if (trials.length < 2) {
    return 0;
  }
  const sumOfSquares = trials.reduce((total, trial) => total + (trial - mean) ** 2, 0);
  return Math.sqrt(sumOfSquares / (trials.length - 1));
}
