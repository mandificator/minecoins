"use client";

import { useEffect, useState } from "react";

/* ---------------- split-flap board ----------------
   Every digit sits on its own plate (stock-exchange flap
   board); a plate flips when its digit changes. Separators
   (, .) are printed between plates, not on them. */

export function Flaps({ text }: { text: string }) {
  return (
    <span className="dash-flaps">
      {text.split("").map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <span key={i} className="dash-flap">
            <span key={ch} className="dash-flap-inner">
              {ch}
            </span>
          </span>
        ) : (
          <span key={i} className="dash-flap-sep">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

/* ---------------- UTC clock ---------------- */

export function UtcClock() {
  const [s, setS] = useState("");
  useEffect(() => {
    const f = () =>
      setS(new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{s}</span>;
}
