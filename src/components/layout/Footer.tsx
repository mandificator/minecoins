import Link from "next/link";
import BlinkCursor from "@/components/effects/BlinkCursor";
import { IconTelegram, IconX } from "@/components/icons/PixelSocialIcons";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <pre className="ascii mb-4 text-fg-dim text-[10px] leading-none overflow-hidden">
{`└──────────────────────────────────────────────────────────────────────────┘`}
        </pre>
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
              <IconX size={2} />X
            </a>
            <span
              className="flex items-center gap-2 text-fg-dim"
              title="Telegram channel coming soon"
              aria-label="Telegram — coming soon"
            >
              <IconTelegram size={2} />TG
            </span>
          </div>
        </div>
        <div className="mt-6 text-xs text-neon-green">
          &gt; connection secure <BlinkCursor />
        </div>
      </div>
    </footer>
  );
}
