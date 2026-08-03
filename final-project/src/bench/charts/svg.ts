// Scalable vector graphics written as text. There is no charting library, and nothing here is imported from a package.

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Tick {
  readonly value: number;
  readonly label: string;
}

export interface Scale {
  project(value: number): number;
  readonly ticks: readonly Tick[];
}

// How one series is drawn. A dashed line and open markers are what mark an excursion as distinct from the series it
// continues; both default off, so a plain series names only its colour.
export interface SeriesStyle {
  readonly color: string;
  readonly dashed?: boolean;
  readonly openMarkers?: boolean;
}

export interface LegendEntry extends SeriesStyle {
  readonly label: string;
}

const MARKER_RADIUS = 3.5;
const ERROR_BAR_CAP = 4;
const SERIES_STROKE_WIDTH = 2;
const DASH_PATTERN = "7 5";

const PAGE_COLOR = "#ffffff";

const LEGEND_SAMPLE_WIDTH = 26;
const LEGEND_LABEL_GAP = 8;
const LEGEND_ENTRY_PITCH = 150;             // fixed, since text metrics are the renderer's and not available here

// Two decimal places keep the file diffable across runs without moving a mark by anything a reader could see.
function coordinate(value: number): string {
  return value.toFixed(2);
}

// A value's position is the position of its logarithm. Domain and range are passed in rather than read off the ticks,
// because an axis may extend past its outermost tick to keep a mark off the frame.
export function logarithmicScale(domain: readonly [number, number], range: readonly [number, number], ticks: readonly Tick[]): Scale {
  const [domainStart, domainEnd] = domain;
  const [rangeStart, rangeEnd] = range;
  const decades = Math.log10(domainEnd) - Math.log10(domainStart);

  return {
    project: (value) => rangeStart + ((Math.log10(value) - Math.log10(domainStart)) / decades) * (rangeEnd - rangeStart),
    ticks,
  };
}

// The data's own range opened by a fraction of a decade at each end, so nothing is drawn on the frame.
export function paddedDomain(values: readonly number[], decades: number): [number, number] {
  return [10 ** (Math.log10(Math.min(...values)) - decades), 10 ** (Math.log10(Math.max(...values)) + decades)];
}

function tickLabel(value: number, exponent: number): string {
  return exponent < 0 ? value.toFixed(-exponent) : String(value);
}

// One, two and five in every decade the domain touches. Powers of ten alone leave the density series two gridlines
// across its whole range, which is not enough to read a value off.
export function logarithmicTicks([domainStart, domainEnd]: readonly [number, number]): Tick[] {
  const ticks: Tick[] = [];
  for (let exponent = Math.floor(Math.log10(domainStart)); exponent <= Math.ceil(Math.log10(domainEnd)); exponent++) {
    for (const mantissa of [1, 2, 5]) {
      const value = mantissa * 10 ** exponent;
      if (value >= domainStart && value <= domainEnd) {
        ticks.push({ value, label: tickLabel(value, exponent) });
      }
    }
  }
  return ticks;
}

export interface StrokeOptions {
  readonly width?: number;
  readonly dashed?: boolean;
}

function stroke(color: string, { width = 1, dashed = false }: StrokeOptions): string {
  return `stroke="${color}" stroke-width="${width}"${dashed ? ` stroke-dasharray="${DASH_PATTERN}"` : ""}`;
}

export function line(from: Point, to: Point, color: string, options: StrokeOptions = {}): string {
  return `<line x1="${coordinate(from.x)}" y1="${coordinate(from.y)}" x2="${coordinate(to.x)}" y2="${coordinate(to.y)}" ${stroke(color, options)}/>`;
}

export function polyline(points: readonly Point[], { color, dashed }: SeriesStyle): string {
  const plotted = points.map(({ x, y }) => `${coordinate(x)},${coordinate(y)}`).join(" ");
  return `<polyline points="${plotted}" fill="none" ${stroke(color, { width: SERIES_STROKE_WIDTH, dashed })}/>`;
}

// An open marker is the page showing through a ring of the series colour, so it reads as the same series without
// reading as one of its measured points.
export function marker({ x, y }: Point, { color, openMarkers = false }: SeriesStyle): string {
  const paint = openMarkers ? `fill="${PAGE_COLOR}" ${stroke(color, { width: SERIES_STROKE_WIDTH })}` : `fill="${color}"`;
  return `<circle cx="${coordinate(x)}" cy="${coordinate(y)}" r="${MARKER_RADIUS}" ${paint}/>`;
}

// Minimum to maximum across the ten trials, capped at both ends so a bar the marker would otherwise swallow still reads.
export function errorBar(low: Point, high: Point, color: string): string {
  return [
    line(low, high, color),
    line({ x: low.x - ERROR_BAR_CAP, y: low.y }, { x: low.x + ERROR_BAR_CAP, y: low.y }, color),
    line({ x: high.x - ERROR_BAR_CAP, y: high.y }, { x: high.x + ERROR_BAR_CAP, y: high.y }, color),
  ].join("");
}

export interface TextOptions {
  readonly anchor?: "start" | "middle" | "end";
  readonly size?: number;
  readonly weight?: "normal" | "bold";
  readonly rotated?: boolean;
}

const TEXT_COLOR = "#222222";

// Today's labels are constants and formatted numbers, but a document that cannot survive an ampersand in a label is a
// trap for whoever writes the next chart.
function escaped(content: string): string {
  return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function text({ x, y }: Point, content: string, options: TextOptions = {}): string {
  const { anchor = "start", size = 13, weight = "normal", rotated = false } = options;
  const transform = rotated ? ` transform="rotate(-90 ${coordinate(x)} ${coordinate(y)})"` : "";
  return `<text x="${coordinate(x)}" y="${coordinate(y)}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${TEXT_COLOR}"${transform}>${escaped(content)}</text>`;
}

// Entries run left to right from the given point, each naming one variant with a sample of the line and its marker.
export function legend(at: Point, entries: readonly LegendEntry[]): string {
  return entries
    .flatMap((entry, index) => {
      const left = at.x + index * LEGEND_ENTRY_PITCH;
      const middle = { x: left + LEGEND_SAMPLE_WIDTH / 2, y: at.y };
      return [
        line({ x: left, y: at.y }, { x: left + LEGEND_SAMPLE_WIDTH, y: at.y }, entry.color, { width: SERIES_STROKE_WIDTH, dashed: entry.dashed }),
        marker(middle, entry),
        text({ x: left + LEGEND_SAMPLE_WIDTH + LEGEND_LABEL_GAP, y: at.y + 4 }, entry.label),
      ];
    })
    .join("\n");
}

// No width or height attribute: the root element then fills whatever it is opened in and takes its aspect ratio from
// the view box, so the chart scales with the browser window and drops into the report at whatever size it is given.
export function svgDocument(width: number, height: number, body: readonly string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="Helvetica, Arial, sans-serif">
<rect x="0" y="0" width="${width}" height="${height}" fill="${PAGE_COLOR}"/>
${body.join("\n")}
</svg>
`;
}
