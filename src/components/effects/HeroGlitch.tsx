"use client";

import { useEffect } from "react";

/**
 * Standalone version of CRTEffect's glitch burst, scoped to a single target
 * element with its own filter defs (so it doesn't fight the global CRTEffect
 * instance mounted in layout.tsx). Used by the temporary splash homepage —
 * fires twice as often as the site-wide default (2-5.5s gap vs 4-11s).
 */
export default function HeroGlitch({ targetId }: { targetId: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const content = document.getElementById(targetId);
    const turb = document.getElementById("heroGlTurb");
    const disp = document.getElementById("heroGlDisp");
    const rOff = document.getElementById("heroGlR");
    const bOff = document.getElementById("heroGlB");
    if (!content || !turb || !disp || !rOff || !bOff) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let raf = 0;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const reset = () => {
      content.style.filter = "";
      content.style.transform = "";
      content.style.willChange = "";
      disp.setAttribute("scale", "0");
      rOff.setAttribute("dx", "0");
      bOff.setAttribute("dx", "0");
    };

    const burst = () => {
      const major = Math.random() < 0.3;
      const dur = major ? rnd(380, 720) : rnd(130, 280);
      content.style.filter = "url(#hero-glitch)";
      content.style.willChange = "filter, transform";

      const start = performance.now();
      let last = 0;
      const tick = (now: number) => {
        if (cancelled || now - start >= dur) {
          reset();
          return;
        }
        if (now - last > rnd(22, 55)) {
          last = now;
          if (Math.random() < 0.18) {
            disp.setAttribute("scale", "0");
            rOff.setAttribute("dx", "0");
            bOff.setAttribute("dx", "0");
            content.style.transform = "";
          } else {
            const amp = major ? 1 : 0.45;
            const off = rnd(3, 16) * amp;
            rOff.setAttribute("dx", off.toFixed(1));
            bOff.setAttribute("dx", (-off * 0.85).toFixed(1));
            disp.setAttribute("scale", (rnd(8, 70) * amp).toFixed(1));
            turb.setAttribute("seed", String(Math.floor(rnd(0, 999))));
            const jx = (Math.random() - 0.5) * (major ? 12 : 3);
            const jy = (Math.random() - 0.5) * (major ? 7 : 2);
            content.style.transform = `translate(${jx.toFixed(1)}px, ${jy.toFixed(1)}px)`;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const loop = () => {
      const gap = rnd(2000, 5500); // 2-5.5s — twice as often as the site default
      timer = setTimeout(() => {
        if (cancelled) return;
        burst();
        loop();
      }, gap);
    };
    loop();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      reset();
    };
  }, [targetId]);

  return (
    <svg className="absolute h-0 w-0" aria-hidden>
      <defs>
        <filter
          id="hero-glitch"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            id="heroGlTurb"
            type="fractalNoise"
            baseFrequency="0.00001 0.4"
            numOctaves="1"
            seed="1"
            result="noise"
          />
          <feDisplacementMap
            id="heroGlDisp"
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="disp"
          />
          <feOffset id="heroGlR" in="disp" dx="0" dy="0" result="ro" />
          <feColorMatrix
            in="ro"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="rc"
          />
          <feOffset id="heroGlB" in="disp" dx="0" dy="0" result="bo" />
          <feColorMatrix
            in="bo"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="bc"
          />
          <feColorMatrix
            in="disp"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="gc"
          />
          <feBlend in="rc" in2="gc" mode="screen" result="rg" />
          <feBlend in="rg" in2="bc" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
