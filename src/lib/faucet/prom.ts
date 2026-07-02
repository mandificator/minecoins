// Promethium address validation.
// PROM Chain addresses are bech32/bech32m with the human-readable prefix "prom"
// (e.g. prom1q…). A base58 check is WRONG here — bech32 uses characters base58
// forbids (0, l) so it rejects perfectly valid addresses. This validates the
// bech32/bech32m checksum for the "prom" HRP, matching the node's validateaddress.

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const HRP = "prom";

function polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= GEN[i];
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function verifyChecksum(hrp: string, data: number[]): "bech32" | "bech32m" | null {
  const c = polymod(hrpExpand(hrp).concat(data));
  if (c === 1) return "bech32"; // witness v0
  if (c === 0x2bc830a3) return "bech32m"; // witness v1+
  return null;
}

export function isValidPromAddress(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const s = input.trim();
  if (s.length < 14 || s.length > 90) return false;
  // bech32 forbids mixed case
  if (s !== s.toLowerCase() && s !== s.toUpperCase()) return false;
  const a = s.toLowerCase();
  const pos = a.lastIndexOf("1"); // separator
  if (pos < 1) return false;
  if (a.slice(0, pos) !== HRP) return false;
  const dataPart = a.slice(pos + 1);
  if (dataPart.length < 6) return false; // must include the 6-char checksum
  const data: number[] = [];
  for (const ch of dataPart) {
    const d = CHARSET.indexOf(ch);
    if (d === -1) return false;
    data.push(d);
  }
  return verifyChecksum(HRP, data) !== null;
}
