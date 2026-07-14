import Link from "next/link";
import { SiTelegram, SiX } from "react-icons/si";
import BlinkCursor from "@/components/effects/BlinkCursor";
import GlitchToggle from "@/components/effects/GlitchToggle";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="neon-green font-bold tracking-[0.2em]">PROMETHIUM</div>
            <p className="mt-2 max-w-md text-xs text-fg-dim">
              Promethium is experimental software. Fair launch, no pre-mine. Verify all
              addresses on promethium.work.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-xs">
            <Link href="/docs" className="glitch-hover hover:text-neon-cyan">
              ▸ Docs
            </Link>
            <Link href="/explorer" className="glitch-hover hover:text-neon-cyan">
              ▸ Explorer
            </Link>
            <Link
              href="/agentic-mining"
              className="glitch-hover hover:text-neon-cyan"
            >
              ▸ Agentic Mining
            </Link>
          </nav>
          <div className="flex gap-4 text-xs">
            <a
              href="https://x.com/promethium_work"
              target="_blank"
              rel="noopener noreferrer"
              className="glitch-hover flex items-center gap-2 hover:text-neon-cyan"
              aria-label="Promethium on X"
            >
              <SiX size={14} />
            </a>
            <a
              href="https://t.me/+eCkRAGS5pNwwNzlk"
              target="_blank"
              rel="noopener noreferrer"
              className="glitch-hover flex flex-col items-center gap-1 hover:text-neon-cyan"
              aria-label="Promethium on Telegram"
            >
              <SiTelegram size={14} />
              <span className="text-[10px] tracking-wider">Telegram</span>
            </a>
            <GlitchToggle />
          </div>
        </div>
        <div className="mt-6 text-xs text-neon-green">
          &gt; connection secure <BlinkCursor />
        </div>
      </div>
    </footer>
  );
}
