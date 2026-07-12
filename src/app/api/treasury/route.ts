import { NextResponse } from "next/server";
import { promRpc, CHAIN_LAUNCHING } from "@/lib/promRpc";

export const dynamic = "force-dynamic";

// Known protocol-controlled addresses (see public/downloads/bridge-skill.md
// and battery-stake-skill.md — these are already public). This route just
// aggregates their live balances in one place for an internal treasury view.
const PROM_BRIDGE_DEPOSIT = "prom1qhpup76k3d8hr7aydl6cl4s8q4s8z7upr4pdvt7";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const PROM_MINT = "promP7gZmjt3fMVWfx47swYBpfwrjb2m3TX4c3woDBu";

const SOLANA_ADDRESSES = [
  { role: "Dev — 1 USDC service fees", address: "AFAGicmTvYxtuEsUBwet2EYtbB1r7C6TZCWkm9gbGexa" },
  { role: "Bridge fee — 2% of healthy PROM", address: "EPRPcLNMH65nxfSjWi6bdMkcifeym3DMbt5JTJ23HvHH" },
  { role: "Relief battery — decayed PROM", address: "2Cd8YiSbw6G5S1VgUGFdd3E6oeKYoQqt2Aemoey1GoZT" },
  { role: "Battery-stake — user deposits", address: "GQ75fQr1FpdqQj2rprsTCbav62Jsnvmbtn3io3hVamXX" },
];

const SOL_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

async function solRpc<T = any>(method: string, params: any[]): Promise<T> {
  const res = await fetch(SOL_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const j = await res.json();
  if (j.error) throw new Error(j.error.message || String(j.error));
  return j.result as T;
}

async function solBalance(address: string): Promise<number> {
  const r = await solRpc<any>("getBalance", [address]).catch(() => null);
  return (r?.value ?? 0) / 1e9;
}

async function tokenBalance(owner: string, mint: string): Promise<number> {
  const r = await solRpc<any>("getTokenAccountsByOwner", [
    owner,
    { mint },
    { encoding: "jsonParsed" },
  ]).catch(() => null);
  const accs = r?.value || [];
  return accs.reduce((sum: number, a: any) => {
    const ui = a?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
    return sum + (ui || 0);
  }, 0);
}

async function mintSupply(mint: string): Promise<number> {
  const r = await solRpc<any>("getTokenSupply", [mint]).catch(() => null);
  return r?.value?.uiAmount ?? 0;
}

export async function GET() {
  // PROM chain side — bridge deposit balance, from the live UTXO set.
  let prom: any;
  try {
    await promRpc("getblockchaininfo");
    const scan = await promRpc<any>("scantxoutset", ["start", [`addr(${PROM_BRIDGE_DEPOSIT})`]]);
    prom = {
      online: true,
      bridgeDeposit: {
        address: PROM_BRIDGE_DEPOSIT,
        balance: scan?.total_amount ?? 0,
        utxos: (scan?.unspents || []).length,
      },
    };
  } catch {
    prom = CHAIN_LAUNCHING;
  }

  // Solana side — SOL + USDC + $PROM per known address, plus mint supply.
  const addresses = await Promise.all(
    SOLANA_ADDRESSES.map(async ({ role, address }) => ({
      role,
      address,
      sol: await solBalance(address),
      usdc: await tokenBalance(address, USDC_MINT),
      prom: await tokenBalance(address, PROM_MINT),
    })),
  );
  const supply = await mintSupply(PROM_MINT);
  const held = addresses.reduce((s, a) => s + a.prom, 0);

  return NextResponse.json({
    prom,
    solana: {
      mint: PROM_MINT,
      supply,
      addresses,
      inTheWild: Math.max(0, supply - held),
    },
  });
}
