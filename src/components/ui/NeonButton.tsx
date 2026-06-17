import Link from "next/link";
import type { ReactNode } from "react";

// The colour prop is kept for call-site compatibility but every variant renders
// in the single light-blue accent — the palette allows no other colours.
type Color = "green" | "cyan" | "magenta" | "amber";

const colorMap: Record<Color, string> = {
  green: "",
  cyan: "",
  magenta: "",
  amber: "",
};

const base =
  "inline-flex items-center justify-center gap-2 border border-border px-4 py-2 font-mono uppercase tracking-wider text-title transition-colors duration-150 bg-transparent hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent";

type CommonProps = {
  children: ReactNode;
  color?: Color;
  className?: string;
};

/** Renders `[ LABEL ]` bracketed terminal-style button text. */
function Bracketed({ children }: { children: ReactNode }) {
  return (
    <span>
      <span className="text-fg-dim">[ </span>
      {children}
      <span className="text-fg-dim"> ]</span>
    </span>
  );
}

export function NeonLink({
  href,
  children,
  color = "green",
  className = "",
  external = false,
}: CommonProps & { href: string; external?: boolean }) {
  const cls = `${base} ${colorMap[color]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <Bracketed>{children}</Bracketed>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      <Bracketed>{children}</Bracketed>
    </Link>
  );
}

export function NeonButton({
  children,
  color = "green",
  className = "",
  onClick,
  disabled,
  type = "button",
  title,
}: CommonProps & {
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${colorMap[color]} ${className}`}
    >
      <Bracketed>{children}</Bracketed>
    </button>
  );
}

export default NeonButton;
