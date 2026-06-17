"use client";

import { useEffect, useState } from "react";
import BlinkCursor from "@/components/effects/BlinkCursor";

export default function TypedPrompt({
  text,
  className = "",
  speed = 55,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setShown(text);
      return;
    }
    let i = 0;
    setShown("");
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={`font-mono ${className}`}>
      <span className="text-neon-green">$ </span>
      <span className="text-fg">{shown}</span>
      <BlinkCursor className="text-neon-green" />
    </span>
  );
}
