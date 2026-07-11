"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "prom-glitch-enabled";

const GlitchContext = createContext<{ enabled: boolean; toggle: () => void }>({
  enabled: true,
  toggle: () => {},
});

export function GlitchProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setEnabled(stored !== "0");
  }, []);

  const toggle = () =>
    setEnabled((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });

  return <GlitchContext.Provider value={{ enabled, toggle }}>{children}</GlitchContext.Provider>;
}

export function useGlitch() {
  return useContext(GlitchContext);
}
