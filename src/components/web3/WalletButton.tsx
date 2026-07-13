"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";

function short(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function WalletButton({
  className = "",
}: {
  className?: string;
}) {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const onClick = useCallback(() => {
    if (connected) {
      disconnect().catch(() => {});
    } else {
      setVisible(true);
    }
  }, [connected, disconnect, setVisible]);

  const label = connecting
    ? "CONNECTING…"
    : connected && publicKey
    ? short(publicKey.toBase58())
    : "CONNECT WALLET";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 border border-bg/30 bg-title px-3 py-1.5 font-mono uppercase tracking-wider text-bg transition-colors duration-150 hover:bg-[#a9c6ff] ${className}`}
      title={connected ? "Click to disconnect" : "Connect your Solana wallet"}
    >
      <span className="text-bg/50">[</span>
      <span
        className={`inline-block h-1.5 w-1.5 ${
          connected ? "bg-bg" : "bg-bg/40"
        }`}
      />
      {connected ? (
        label
      ) : (
        <>
          <span className="group-hover:hidden">{label}</span>
          <span className="hidden group-hover:inline">COMING SOON</span>
        </>
      )}
      <span className="text-bg/50">]</span>
    </button>
  );
}
