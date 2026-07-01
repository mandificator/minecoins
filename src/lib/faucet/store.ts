import fs from "node:fs";
import path from "node:path";

// Submission storage. Appends JSONL on a writable filesystem and always
// console.logs each record (reliable on serverless — visible in Vercel logs).
// For production, swap for a real database.

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
};

const DIR =
  process.env.FAUCET_DATA_DIR ||
  (process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data"));
const FILE = path.join(DIR, "faucet-submissions.jsonl");

export async function saveSubmission(s: Submission): Promise<void> {
  console.log("[faucet:submission]", JSON.stringify(s));
  // TODO(handoff): replace with a durable DB insert for production.
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.appendFileSync(FILE, JSON.stringify(s) + "\n");
  } catch (e) {
    console.warn("[faucet] file store unavailable:", (e as Error).message);
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Submission);
  } catch {
    return [];
  }
}

export async function hasAddress(address: string): Promise<boolean> {
  const all = await getSubmissions();
  return all.some((s) => s.address === address);
}
