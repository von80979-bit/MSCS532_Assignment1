import type { MeasurementRecord } from "../child.ts";
import type { Axis } from "../configurations.ts";
import type { ConfigurationMeasurement } from "../console-table.ts";
import { writeResultsArtifact } from "../results-file.ts";
import { speedupOf, toMilliseconds } from "../statistics.ts";
import { errorBar, legend, line, logarithmicScale, logarithmicTicks, marker, paddedDomain, polyline, svgDocument, text, type LegendEntry, type Point, type Scale, type TextOptions, type Tick } from "./svg.ts";

const WIDTH = 900;
const HEIGHT = 560;

const PLOT_LEFT = 84;
const PLOT_RIGHT = 872;
const PLOT_TOP = 56;
const PLOT_BOTTOM = 480;

// The legend sits above the plot rather than inside it, where no series can ever grow into it. There is no title:
// methodology section 9 asks for two labelled axes and a legend, and the report captions its own figures.
const LEGEND_BASELINE = 30;
const HORIZONTAL_LABEL_BASELINE = 528;
const VERTICAL_LABEL_LEFT = 26;

// A vertical tick label sits left of the plot and is raised half its own cap height to centre on its gridline; a
// horizontal one sits below the plot.
const TICK_LABEL_GAP = 10;
const TICK_LABEL_RISE = 4;

// Horizontal tick labels sit on one of two rows below the plot. The speedup chart's last two configurations are a tenth
// of a decade apart, which is narrower than a four-digit label, so a label too close to the last one on its row takes
// the other row rather than being dropped or overprinted.
const TICK_LABEL_ROW_DROP = [22, 40] as const;
const MINIMUM_TICK_LABEL_PITCH = 34;

const AXIS_COLOR = "#333333";
const GRID_COLOR = "#e2e2e2";

const HEAP_COLOR = "#1f5fa9";

// Both variants of one configuration arrive as a pair, so a chart names the field it wants rather than filtering a flat
// list, and the speedup chart's ratio is read off two records already known to describe the same graph.
const VARIANTS: readonly (LegendEntry & { recordOf: (measurement: ConfigurationMeasurement) => MeasurementRecord })[] = [
  { label: "Linear scan", color: "#b3352d", recordOf: ({ linearScan }) => linearScan },
  { label: "Binary heap", color: HEAP_COLOR, recordOf: ({ binaryHeap }) => binaryHeap },
];

// The ratio is the heap's advantage, so it carries the heap's colour across all three charts. The excursion past the
// densest series configuration is the same quantity measured outside the sparse regime, so it keeps that colour and
// says what it is with a dashed connector and open markers instead.
const DENSITY_SERIES: LegendEntry = { label: "Density series", color: HEAP_COLOR };
const CROSSOVER_EXCURSION: LegendEntry = { label: "Crossover configurations", color: HEAP_COLOR, dashed: true, openMarkers: true };

// The reference line. Above it the heap is the faster of the two, below it the linear scan is, and the whole finding is
// how far right the curve travels before it arrives.
const PARITY_SPEEDUP = 1;
const PARITY_LABEL_GAP = 8;

// A tenth of a decade of air at each end of both axes, so no mark is drawn on the frame. Rounding the vertical axis out
// to whole decades instead would spend half the density chart's height on a decade nothing reaches.
const PADDING_DECADES = 0.1;

// `horizontalValue` is vertexCount on one chart and averageTotalDegree on the other, which is the only difference
// between them.
interface SeriesPoint {
  readonly horizontalValue: number;
  readonly medianMs: number;
  readonly minMs: number;
  readonly maxMs: number;
}

interface Series extends LegendEntry {
  readonly points: readonly SeriesPoint[];
}

interface SpeedupPoint {
  readonly averageTotalDegree: number;
  readonly speedup: number;
}

// Everything the frame draws that is not the data itself.
interface ChartFrame {
  readonly horizontalAxisLabel: string;
  readonly verticalAxisLabel: string;
  readonly horizontal: Scale;
  readonly vertical: Scale;
  readonly legendEntries: readonly LegendEntry[];
  readonly marks: readonly string[];
}

// Selecting by axis is what keeps the crossover configurations out of both time charts: they carry axis
// `crossover-probe` and appear only in the speedup chart, where their distinct markers say they are an excursion.
function measurementsOn(measurements: readonly ConfigurationMeasurement[], axis: Axis): ConfigurationMeasurement[] {
  return measurements.filter(({ configuration }) => configuration.axis === axis);
}

// One line per variant, over the configurations of one axis.
function seriesByVariant(measurements: readonly ConfigurationMeasurement[], horizontalValue: (record: MeasurementRecord) => number): Series[] {
  return VARIANTS.map(({ label, color, recordOf }) => ({
    label,
    color,
    points: measurements
      .map(recordOf)
      .map((record) => ({ horizontalValue: horizontalValue(record), medianMs: toMilliseconds(record.medianNs), minMs: toMilliseconds(record.minNs), maxMs: toMilliseconds(record.maxNs) }))
      .sort((first, second) => first.horizontalValue - second.horizontalValue),
  }));
}

function everyPoint(series: readonly Series[]): readonly SeriesPoint[] {
  return series.flatMap(({ points }) => points);
}

// The measured configurations themselves, which are the only horizontal positions a chart has anything to say about.
function horizontalTicks(values: readonly number[]): Tick[] {
  return [...new Set(values)].sort((first, second) => first - second).map((value) => ({ value, label: String(value) }));
}

// Every axis on all three charts is logarithmic and padded the same way, and the two differ only in which end of the
// plot they run between and in whether their ticks are the measured configurations or round numbers.
function horizontalScale(values: readonly number[]): Scale {
  return logarithmicScale(paddedDomain(values, PADDING_DECADES), [PLOT_LEFT, PLOT_RIGHT], horizontalTicks(values));
}

function verticalScale(values: readonly number[]): Scale {
  const domain = paddedDomain(values, PADDING_DECADES);
  return logarithmicScale(domain, [PLOT_BOTTOM, PLOT_TOP], logarithmicTicks(domain));
}

// A tick on either axis is a gridline across the plot and a label outside it, so both axes are drawn through here and
// differ only in where the two ends and the label fall.
function gridLineWithLabel(from: Point, to: Point, labelAt: Point, label: string, anchor: TextOptions["anchor"]): string[] {
  return [line(from, to, GRID_COLOR), text(labelAt, label, { anchor })];
}

function axesAndGrid(horizontal: Scale, vertical: Scale): string[] {
  // The first row unless the last label on it is nearer than a label is wide, and then the second row on the same test,
  // so a run of crowded labels alternates rather than piling every one of them onto one row.
  const lastLabelledAt = [-Infinity, -Infinity];
  const rowFor = (x: number): number => (x - lastLabelledAt[0] >= MINIMUM_TICK_LABEL_PITCH || x - lastLabelledAt[1] < MINIMUM_TICK_LABEL_PITCH ? 0 : 1);

  const gridAndTicks = [
    ...vertical.ticks.flatMap(({ value, label }) => {
      const y = vertical.project(value);
      return gridLineWithLabel({ x: PLOT_LEFT, y }, { x: PLOT_RIGHT, y }, { x: PLOT_LEFT - TICK_LABEL_GAP, y: y + TICK_LABEL_RISE }, label, "end");
    }),
    ...horizontal.ticks.flatMap(({ value, label }) => {
      const x = horizontal.project(value);
      const row = rowFor(x);
      lastLabelledAt[row] = x;
      return gridLineWithLabel({ x, y: PLOT_TOP }, { x, y: PLOT_BOTTOM }, { x, y: PLOT_BOTTOM + TICK_LABEL_ROW_DROP[row] }, label, "middle");
    }),
  ];

  return [
    ...gridAndTicks,
    line({ x: PLOT_LEFT, y: PLOT_TOP }, { x: PLOT_LEFT, y: PLOT_BOTTOM }, AXIS_COLOR),
    line({ x: PLOT_LEFT, y: PLOT_BOTTOM }, { x: PLOT_RIGHT, y: PLOT_BOTTOM }, AXIS_COLOR),
  ];
}

// The one frame all three charts are drawn in: same size, same plot rectangle, same legend above it, same labelled
// logarithmic axes. They differ in their scales and in what they draw inside.
function renderChart({ horizontalAxisLabel, verticalAxisLabel, horizontal, vertical, legendEntries, marks }: ChartFrame): string {
  return svgDocument(WIDTH, HEIGHT, [
    legend({ x: PLOT_LEFT, y: LEGEND_BASELINE }, legendEntries),
    ...axesAndGrid(horizontal, vertical),
    ...marks,
    text({ x: (PLOT_LEFT + PLOT_RIGHT) / 2, y: HORIZONTAL_LABEL_BASELINE }, horizontalAxisLabel, { anchor: "middle" }),
    text({ x: VERTICAL_LABEL_LEFT, y: (PLOT_TOP + PLOT_BOTTOM) / 2 }, verticalAxisLabel, { anchor: "middle", rotated: true }),
  ]);
}

// Bars first, then the line, then the markers, so a marker is never half-hidden under the bar it belongs to.
function drawEverySeries(everySeries: readonly Series[], horizontal: Scale, vertical: Scale): string[] {
  return everySeries.flatMap((series) => {
    const medians: Point[] = series.points.map(({ horizontalValue, medianMs }) => ({ x: horizontal.project(horizontalValue), y: vertical.project(medianMs) }));

    return [
      ...series.points.map(({ horizontalValue, minMs, maxMs }) => {
        const x = horizontal.project(horizontalValue);
        return errorBar({ x, y: vertical.project(minMs) }, { x, y: vertical.project(maxMs) }, series.color);
      }),
      polyline(medians, series),
      ...medians.map((point) => marker(point, series)),
    ];
  });
}

// The two time charts. They differ in their horizontal quantity and in nothing else: same log-log axes, same two
// variants in the same two colours, same minimum-to-maximum bars.
function renderSeriesChart(horizontalAxisLabel: string, series: readonly Series[]): string {
  const points = everyPoint(series);
  const horizontal = horizontalScale(points.map(({ horizontalValue }) => horizontalValue));

  // The whole of every error bar is inside the vertical domain, not just the medians the line connects.
  const vertical = verticalScale(points.flatMap(({ minMs, maxMs }) => [minMs, maxMs]));

  return renderChart({
    horizontalAxisLabel,
    verticalAxisLabel: "median time in milliseconds (log scale)",
    horizontal,
    vertical,
    legendEntries: series,
    marks: drawEverySeries(series, horizontal, vertical),
  });
}

// One ratio per configuration, off the two records the pair already holds for the same graph.
function speedupPoints(measurements: readonly ConfigurationMeasurement[]): SpeedupPoint[] {
  return measurements
    .map(({ configuration, linearScan, binaryHeap }) => ({ averageTotalDegree: configuration.averageTotalDegree, speedup: speedupOf(linearScan.medianNs, binaryHeap.medianNs) }))
    .sort((first, second) => first.averageTotalDegree - second.averageTotalDegree);
}

// The excursion continues the series rather than starting beside it, so its dashed connector begins at the densest
// series point. That point keeps the series' own filled marker; only the two crossover configurations are drawn open.
function drawSpeedup(densityPoints: readonly Point[], excursionPoints: readonly Point[]): string[] {
  return [
    polyline([densityPoints[densityPoints.length - 1], ...excursionPoints], CROSSOVER_EXCURSION),
    polyline(densityPoints, DENSITY_SERIES),
    ...densityPoints.map((point) => marker(point, DENSITY_SERIES)),
    ...excursionPoints.map((point) => marker(point, CROSSOVER_EXCURSION)),
  ];
}

// A dashed rule across the plot at 1.0. It is named at the left, where the curve is at its highest above it: the right
// end is exactly where the excursion arrives, which is the one place a label must not be.
function drawParityReference(vertical: Scale): string[] {
  const y = vertical.project(PARITY_SPEEDUP);
  return [
    line({ x: PLOT_LEFT, y }, { x: PLOT_RIGHT, y }, AXIS_COLOR, { dashed: true }),
    text({ x: PLOT_LEFT + PARITY_LABEL_GAP, y: y - PARITY_LABEL_GAP }, "parity, the two variants equal", { anchor: "start" }),
  ];
}

// The report's central exhibit. Reading the decay off the density chart's two converging log-scale lines takes effort
// that this removes, and it is the one chart where the crossover configurations appear.
function renderSpeedupChart(density: readonly SpeedupPoint[], crossover: readonly SpeedupPoint[]): string {
  const everySpeedup = [...density, ...crossover];
  const horizontal = horizontalScale(everySpeedup.map(({ averageTotalDegree }) => averageTotalDegree));

  // Parity joins the data in the domain, so the reference line is on the chart whether or not the curve reaches it.
  const vertical = verticalScale([...everySpeedup.map(({ speedup }) => speedup), PARITY_SPEEDUP]);

  const project = ({ averageTotalDegree, speedup }: SpeedupPoint): Point => ({ x: horizontal.project(averageTotalDegree), y: vertical.project(speedup) });

  return renderChart({
    horizontalAxisLabel: "averageTotalDegree (log scale)",
    verticalAxisLabel: "speedup, linear scan median / binary heap median (log scale)",
    horizontal,
    vertical,
    legendEntries: [DENSITY_SERIES, CROSSOVER_EXCURSION],
    marks: [...drawParityReference(vertical), ...drawSpeedup(density.map(project), crossover.map(project))],
  });
}

// All three charts, from the records the results file carries, written beside it on the same run.
export function writeCharts(measurements: readonly ConfigurationMeasurement[]): string[] {
  const density = measurementsOn(measurements, "density");

  const sizeSeries = renderSeriesChart("vertexCount (log scale)", seriesByVariant(measurementsOn(measurements, "size"), (record) => record.vertexCount));
  const densitySeries = renderSeriesChart("averageTotalDegree (log scale)", seriesByVariant(density, (record) => record.averageTotalDegree));
  const speedupByDensity = renderSpeedupChart(speedupPoints(density), speedupPoints(measurementsOn(measurements, "crossover-probe")));

  return [
    writeResultsArtifact("size-series.svg", sizeSeries),
    writeResultsArtifact("density-series.svg", densitySeries),
    writeResultsArtifact("speedup-by-density.svg", speedupByDensity),
  ];
}
