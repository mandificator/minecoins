// Data source for /dashboard (Network Observatory).
// Live reads come from GET /api/dashboard (server-side: prom-decay indexer +
// Promethium RPC + pool stats + bridge intents). If that endpoint is
// unreachable or returns an empty snapshot, we fall back to SIMULATED below so
// the page never renders a broken zeroed-out state.

export const HALF_LIFE_HOURS = 17.7;

export type DashboardData = {
  /** true while the numbers below are a simulation, not chain telemetry */
  simulated: boolean;
  /** total PROM ever mined */
  minedProm: number;
  /** total PROM decayed at the surface */
  decayedProm: number;
  /** live drift rates (PROM/s) so the heroes tick between refetches; 0 freezes them */
  minedPerSec: number;
  decayedPerSec: number;
  miners: number;
  nodes: number;
  blockHeight: number;
  /** network hashrate in H/s */
  networkHashps: number;
  /** x402 USDC micropayments settled across Promethium services */
  x402Count: number;
};

// SIMULATED SNAPSHOT — fallback only, used if /api/dashboard fails.
const SIMULATED: DashboardData = {
  simulated: true,
  minedProm: 1_847_203.42718305,
  decayedProm: 1_102_847.55912348,
  minedPerSec: 25 / 60,
  decayedPerSec: 3.2691,
  miners: 128,
  nodes: 17,
  blockHeight: 51_842,
  networkHashps: 3.42e12,
  x402Count: 7_600,
};

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const r = await fetch("/api/dashboard", { cache: "no-store" });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const d = (await r.json()) as Partial<DashboardData>;
    // sanity: a real feed always has a positive mined total
    if (!d || !d.minedProm || d.minedProm <= 0) throw new Error("empty feed");
    return { ...SIMULATED, ...d, simulated: d.simulated ?? false };
  } catch {
    return SIMULATED;
  }
}
