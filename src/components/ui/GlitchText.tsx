import type { ReactNode } from "react";

export default function GlitchText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`glitch-hover ${className}`}>{children}</span>;
}
