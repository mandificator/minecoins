import Link from "next/link";
import { SiTelegram, SiX } from "react-icons/si";
import GlitchToggle from "@/components/effects/GlitchToggle";

const MENU: { label: string; href: string; external?: boolean }[] = [
  { label: "MINE PROM", href: "/docs/get-started" },
  { label: "STABILIZE PROM", href: "/bridge" },
  {
    label: "BUY PROM",
    href: "https://www.meteora.ag/dlmm/3G5YAWvPiPutUhuAj7ZMzk2mkvD93iCrvfHp3pCxZkyk",
    external: true,
  },
  { label: "DOCUMENTATION", href: "/docs" },
];

export default function HomeBottomMenu() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-line px-4 py-5 sm:justify-between sm:px-8">
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {MENU.map((m) =>
          m.external ? (
            <a
              key={m.label}
              href={m.href}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-label glitch-hover"
            >
              {m.label}
            </a>
          ) : (
            <Link key={m.label} href={m.href} className="dash-label glitch-hover">
              {m.label}
            </Link>
          ),
        )}
      </nav>
      <div className="flex items-center gap-4">
        <a
          href="https://x.com/promethium_work"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Promethium on X"
          className="glitch-hover text-fg-dim hover:text-title"
        >
          <SiX size={16} />
        </a>
        <a
          href="https://t.me/+eCkRAGS5pNwwNzlk"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Promethium on Telegram"
          className="glitch-hover text-fg-dim hover:text-title"
        >
          <SiTelegram size={16} />
        </a>
        <GlitchToggle />
      </div>
    </footer>
  );
}
