const OFFSET_BASIS = 0x811c9dc5;
const PRIME = 0x01000193;

// FNV-1a over the four bytes of each distance, least significant first. Hashing the bytes explicitly rather than
// through a Uint8Array view of the buffer keeps the digest independent of the platform's endianness, so two processes
// agree on it for the reason the comparison intends rather than by accident.
export function fnv1aHex(values: Int32Array): string {
  let hash = OFFSET_BASIS;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    for (let shift = 0; shift < 32; shift += 8) {
      hash = Math.imul(hash ^ ((value >>> shift) & 0xff), PRIME);
    }
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
