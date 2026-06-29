"use client";

import { useEffect, useState } from "react";

/**
 * CRT / digital-signal glitch overlay.
 *
 * Between bursts the page is clean (just scanlines + vignette). Every few
 * seconds a SHORT, violent glitch fires on #page-content via `filter: url()`
 * (works in Chrome/Brave). Each frame randomises:
 *   - RGB channel split  (feOffset on isolated R/B channels → chromatic aberration)
 *   - horizontal slice tearing (feTurbulence + feDisplacementMap, hi vertical freq)
 *   - screen shake (transform jitter)
 * Occasionally a "major" burst is longer and more extreme, with corruption bars.
 * Disabled under prefers-reduced-motion.
 */
export default function CRTEffect() {
  const [bars, setBars] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const content = document.getElementById("page-content");
    const turb = document.getElementById("glTurb");
    const disp = document.getElementById("glDisp");
    const rOff = document.getElementById("glR");
    const bOff = document.getElementById("glB");
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
      // slow playback: long burst duration + long step interval below
      const dur = major ? rnd(1500, 2800) : rnd(520, 1100);
      if (major) setBars(true);
      content.style.filter = "url(#glitch)";
      content.style.willChange = "filter, transform";

      const start = performance.now();
      let last = 0;
      const tick = (now: number) => {
        if (cancelled || now - start >= dur) {
          reset();
          setBars(false);
          return;
        }
        // step every ~95–210ms for a chunky, stuttering feel (much slower)
        if (now - last > rnd(95, 210)) {
          last = now;
          if (Math.random() < 0.18) {
            // a clean frame — makes the glitch stutter instead of buzz
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
      const gap = rnd(4000, 11000); // 4–11s between glitches
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
  }, []);

  return (
    <div className="crt" aria-hidden>
      <svg className="crt-defs" width="0" height="0">
        <defs>
          <filter
            id="glitch"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            {/* horizontal slice tearing */}
            <feTurbulence
              id="glTurb"
              type="fractalNoise"
              baseFrequency="0.00001 0.4"
              numOctaves="1"
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              id="glDisp"
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="disp"
            />
            {/* RGB channel split → chromatic aberration */}
            <feOffset id="glR" in="disp" dx="0" dy="0" result="ro" />
            <feColorMatrix
              in="ro"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="rc"
            />
            <feOffset id="glB" in="disp" dx="0" dy="0" result="bo" />
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

      {/* corruption bars (only during a major burst) */}
      {bars && <div className="crt-glitchbars" />}

      {/* static CRT ambiance */}
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
      <div className="crt-flicker" />
    </div>
  );
}
