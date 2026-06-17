"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders a monospace ASCII diagram that always fits its container width with
 * NO horizontal scroll. It measures the diagram's natural width at a reference
 * size and scales the font down to fit (capped at a comfortable maximum), so
 * box-drawing characters stay perfectly aligned at any screen width.
 *
 * Diagrams must use 1-cell glyphs only (box-drawing `─│┌┐└┘├┤┬┴┼` + ASCII
 * arrowheads `> < ^ v`) — geometric-triangle arrows are not fixed-width in most
 * monospace fonts and would misalign.
 */
const MAX_PX = 16;
const MIN_PX = 6;

export default function AsciiDiagram({
  text,
  className = "",
  center = false,
}: {
  text: string;
  className?: string;
  center?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [fontPx, setFontPx] = useState(MAX_PX);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pre = preRef.current;
    if (!wrap || !pre) return;

    const fit = () => {
      // Measure natural width at the reference size, then scale to fit.
      pre.style.fontSize = `${MAX_PX}px`;
      const natural = pre.scrollWidth;
      const avail = wrap.clientWidth;
      if (natural <= 0 || avail <= 0) return;
      let size = MAX_PX;
      if (natural > avail) {
        size = Math.max(MIN_PX, Math.floor((MAX_PX * avail) / natural) - 0.5);
      }
      setFontPx(size);
      pre.style.fontSize = `${size}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      ref={wrapRef}
      className={`w-full overflow-hidden ${center ? "flex justify-center" : ""} ${className}`}
    >
      <pre
        ref={preRef}
        className="ascii-diagram"
        style={{ fontSize: `${fontPx}px` }}
      >
        {text}
      </pre>
    </div>
  );
}
