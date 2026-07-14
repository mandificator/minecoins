"use client";

import { useGlitch } from "@/components/effects/GlitchProvider";

/**
 * Small, subtle toggle — rendered in-flow next to the X/Telegram icons
 * (Footer.tsx and HomeBottomMenu.tsx), not as a fixed overlay, so it can
 * never collide with other corner content at any viewport height.
 */
export default function GlitchToggle() {
  const { enabled, toggle } = useGlitch();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      title={enabled ? "Turn off glitch FX" : "Turn on glitch FX"}
      className="dash-note flex shrink-0 items-center gap-1.5 border border-line px-2 py-1 opacity-60 transition-opacity hover:opacity-100"
    >
      <span className={enabled ? "text-title" : ""}>●</span>
      FX
    </button>
  );
}
