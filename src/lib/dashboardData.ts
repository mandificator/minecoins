// Data source for /dashboard — currently a SIMULATED snapshot (pre-mainnet).
//
// To go live, replace the body of fetchDashboardData() with real reads.
// Field-by-field mapping to data that already exists:
//   minedProm     -> GET /api/explorer/richlist  -> totalMined
//   blockHeight   -> GET /api/explorer/chain     -> height
//   networkHashps -> GET /api/explorer/chain     -> networkHashps
//   minedPerSec   -> blockReward / avgBlockTime  (avgBlockTime from /api/explorer/chain)
//   miners        -> pool stats (GET /api/pool) + distinct miner addresses in recent blocks
// Still needs a node-side export (no endpoint yet):
//   decayedProm   -> cumulative decayed PROM (sum of expired surface outputs)
//   decayedPerSec -> aliveSupply * ln(2) / (17.7 * 3600)
//   nodes         -> RPC getconnectioncount / peer census

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
};

export async function fetchDashboardData(): Promise<DashboardData> {
  // SIMULATED SNAPSHOT — plausible mainnet-scale numbers.
  return {
    simulated: true,
    minedProm: 1_847_203.42718305,
    decayedProm: 1_102_847.55912348,
    minedPerSec: 25 / 60, // 25 PROM reward / 60s target block
    decayedPerSec: 3.2691, // ~740k alive * ln2 / t½
    miners: 128,
    nodes: 17,
    blockHeight: 51_842,
    networkHashps: 3.42e12,
  };
}
