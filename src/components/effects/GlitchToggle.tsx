"use client";

import { useGlitch } from "@/components/effects/GlitchProvider";

/** Small, subtle, always-in-the-corner control — replaces the old sidebar nav-item version. */
export default function GlitchToggle() {
  const { enabled, toggle } = useGlitch();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      title={enabled ? "Turn off glitch FX" : "Turn on glitch FX"}
      className="dash-note fixed bottom-4 right-4 z-[10000] flex items-center gap-1.5 border border-line bg-bg/70 px-2 py-1 opacity-60 backdrop-blur-sm transition-opacity hover:opacity-100"
    >
      <span className={enabled ? "text-title" : ""}>●</span>
      FX
    </button>
  );
}
