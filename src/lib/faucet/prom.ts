// Lightweight Promethium address validation.
// $PROM lives on Solana (base58 pubkeys) and Promethium Chain is Bitcoin-style —
// both base58, so we accept a lenient base58 string in a sensible length range.
// Tighten once the canonical address format is confirmed with the team.

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function isValidPromAddress(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const s = input.trim();
  if (s.length < 26 || s.length > 64) return false;
  return BASE58.test(s);
}
