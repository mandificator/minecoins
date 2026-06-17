"use client";

import { useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { solanaConfig } from "@/lib/solana/config";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = solanaConfig.rpc;
  // Phantom & Solflare register themselves via the Wallet Standard, so no
  // explicit adapters are needed — this also avoids pulling the heavy
  // walletconnect/pino dependency chain into the bundle.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
