import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Faucet storage (append-only JSONL files on a writable dir).
//  - submissions: full audit log of every claim attempt that succeeded.
//  - accounts: one authoritative record per X account (id), keeping the FIRST
//    claim. Enforces one-claim-per-account, one-address-per-account, and holds
//    each account's referral code.

export type Submission = {
  createdAt: string;
  xId: string;
  username: string;
  followers: number;
  accountAgeDays: number;
  verified: boolean;
  address: string;
  reward: number;
  ranNode: boolean;
  tweetUrl: string | null;
  referralCode: string; // this claimer's own code
  referredBy: string | null; // code they used, if any
  postVerified?: boolean; // tweet confirmed via X API (vs API-unavailable fallback)
};

export type Account = {
  xId: string;
  username: string;
  address: string;
  verified: boolean;
  reward: number; // base tier + referral extra (PROM)
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
};

const DIR =
  process.env.FAUCET_DATA_DIR ||
  (process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data"));
const SUB_FILE = path.join(DIR, "faucet-submissions.jsonl");
const ACC_FILE = path.join(DIR, "faucet-accounts.jsonl");

function readJsonl<T>(file: string): T[] {
  try {
    return fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as T);
  } catch {
    return [];
  }
}

function appendJsonl(file: string, obj: unknown): void {
  fs.mkdirSync(DIR, { recursive: true });
  fs.appendFileSync(file, JSON.stringify(obj) + "\n");
}

// --- submissions (audit log) ---
export async function saveSubmission(s: Submission): Promise<void> {
  console.log("[faucet:submission]", JSON.stringify(s));
  try {
    appendJsonl(SUB_FILE, s);
  } catch (e) {
    console.warn("[faucet] submission store:", (e as Error).message);
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  return readJsonl<Submission>(SUB_FILE);
}

// --- accounts (one per X id; append-only, dedup keeping the FIRST record) ---
export function getAccounts(): Account[] {
  const seen = new Set<string>();
  const out: Account[] = [];
  for (const a of readJsonl<Account>(ACC_FILE)) {
    if (!a.xId || seen.has(a.xId)) continue;
    seen.add(a.xId);
    out.push(a);
  }
  return out;
}

export function getAccountByXId(xId: string): Account | null {
  return getAccounts().find((a) => a.xId === xId) ?? null;
}

export function getAccountByReferralCode(code: string): Account | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return getAccounts().find((a) => a.referralCode === c) ?? null;
}

export function saveAccount(a: Account): void {
  try {
    appendJsonl(ACC_FILE, a);
  } catch (e) {
    console.warn("[faucet] account store:", (e as Error).message);
  }
}

// address already used by an existing account?
export async function hasAddress(address: string): Promise<boolean> {
  return getAccounts().some((a) => a.address === address);
}

// unambiguous, uppercase, 6-char referral codes (no 0/O/1/I/L)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function genReferralCode(): string {
  const existing = new Set(getAccounts().map((a) => a.referralCode));
  for (let tries = 0; tries < 100; tries++) {
    const b = crypto.randomBytes(6);
    let c = "";
    for (let i = 0; i < 6; i++) c += CODE_CHARS[b[i] % CODE_CHARS.length];
    if (!existing.has(c)) return c;
  }
  return "P" + Date.now().toString(36).toUpperCase().slice(-5);
}
