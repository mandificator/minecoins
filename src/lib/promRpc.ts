// Read-only JSON-RPC client for the Promethium node. Server-side only.
// Credentials come from env and never reach the browser.
const RPC_URL = process.env.PROM_RPC_URL || "http://127.0.0.1:18105";
const RPC_USER = process.env.PROM_RPC_USER || "prom";
const RPC_PASS = process.env.PROM_RPC_PASS || "prom8004";

export async function promRpc<T = any>(method: string, params: any[] = []): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${RPC_USER}:${RPC_PASS}`).toString("base64"),
    },
    body: JSON.stringify({ jsonrpc: "1.0", id: "explorer", method, params }),
    cache: "no-store",
    // node is local; keep it snappy
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`rpc ${method} http ${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(j.error.message || String(j.error));
  return j.result as T;
}

// True when the Promethium node is reachable (chain is live).
export async function chainOnline(): Promise<boolean> {
  try {
    await promRpc("getblockchaininfo");
    return true;
  } catch {
    return false;
  }
}

export const CHAIN_LAUNCHING = {
  online: false,
  message: "Promethium Chain is launching — the explorer goes live with mainnet.",
};
