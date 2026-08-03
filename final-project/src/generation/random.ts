// mulberry32, hand-written: no dependency, and the same stream on every platform and Node version, which is what makes
// (vertexCount, averageTotalDegree, seed) reproduce a graph exactly now that nothing is cached on disk.
export class Random {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  nextFloat(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let z = this.state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  }

  // Uniform in [low, high]. The modulo bias this carries is far below anything a degree distribution could show.
  nextInteger(low: number, high: number): number {
    return low + Math.floor(this.nextFloat() * (high - low + 1));
  }
}
