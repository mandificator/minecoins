import type { ReactNode } from "react";

type Accent = "green" | "cyan" | "magenta" | "amber";

const accentText: Record<Accent, string> = {
  green: "text-neon-green",
  cyan: "text-neon-cyan",
  magenta: "text-neon-magenta",
  amber: "text-amber",
};

/**
 * A "terminal window" card with a fake ASCII title bar:
 *   ┌─[ TITLE ]──────────────┐
 *   │  ...content...         │
 *   └────────────────────────┘
 */
export default function TerminalCard({
  title,
  accent = "green",
  children,
  className = "",
}: {
  title?: string;
  accent?: Accent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-border bg-bg-alt/60 backdrop-blur-[1px] ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-xs">
          <span className="text-fg-dim select-none">┌─[</span>
          <span className={`uppercase tracking-widest ${accentText[accent]}`}>
            {title}
          </span>
          <span className="text-fg-dim select-none">]</span>
          <span className="text-fg-dim select-none flex-1 overflow-hidden whitespace-nowrap">
            {"─".repeat(120)}
          </span>
          <span className="text-fg-dim select-none">┐</span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
