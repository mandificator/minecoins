"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Renders a Mermaid diagram themed to the Promethium palette (electric-blue
 * background, white text, light-blue nodes/edges, sharp corners, mono font).
 * Mermaid is loaded dynamically (client-only) so it stays out of the initial
 * bundle until a diagram is actually shown.
 */
let mermaidReady: Promise<typeof import("mermaid").default> | null = null;

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "base",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        themeVariables: {
          background: "transparent",
          primaryColor: "#0a27bd",
          primaryBorderColor: "#bcd4ff",
          primaryTextColor: "#ffffff",
          secondaryColor: "#0a27bd",
          tertiaryColor: "#0a27bd",
          lineColor: "#bcd4ff",
          textColor: "#ffffff",
          edgeLabelBackground: "#0a2bd6",
          clusterBkg: "transparent",
          fontSize: "15px",
        },
        flowchart: {
          curve: "linear",
          htmlLabels: true,
          padding: 12,
          nodeSpacing: 42,
          rankSpacing: 48,
          useMaxWidth: true,
        },
        themeCSS: `
          .node rect, .node polygon, .node circle, .node path { rx: 0px; ry: 0px; stroke-width: 1.4px; }
          .cluster rect { rx: 0px; ry: 0px; }
          .edgeLabel, .edgeLabel rect, .edgeLabel p { background: #0a2bd6 !important; color: #ffffff !important; fill: #0a2bd6 !important; }
          .edgePath path { stroke-width: 1.4px; }
        `,
      });
      return mermaid;
    });
  }
  return mermaidReady;
}

let counter = 0;

export default function Mermaid({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const idRef = useRef(`mmd-${counter++}`);

  useEffect(() => {
    let active = true;
    loadMermaid()
      .then((m) => m.render(idRef.current, code))
      .then(({ svg }) => {
        if (active) setSvg(svg);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [code]);

  // Close the zoom overlay on Escape, lock body scroll while open.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  // Build a self-contained copy for the zoom view: give it unique ids (so its
  // markers/styles don't clash with the inline copy) and an explicit natural
  // pixel width from the viewBox (so it renders at full size — text ≈ site font
  // — instead of collapsing).
  const zoomSvg = useMemo(() => {
    if (!svg) return "";
    let out = svg.split(idRef.current).join(`${idRef.current}-z`);
    const w = svg.match(/viewBox="0 0 ([\d.]+)/)?.[1];
    if (w) {
      out = out
        .replace(
          /style="[^"]*max-width:[^"]*"/,
          `style="width:${w}px;max-width:none;height:auto"`
        )
        .replace(/width="100%"/, `width="${w}"`);
    }
    return out;
  }, [svg]);

  if (failed) {
    return (
      <pre className="diagram-block ascii-diagram" style={{ padding: "1rem" }}>
        {code}
      </pre>
    );
  }

  return (
    <>
      <div
        className="mermaid-diagram"
        role="button"
        tabIndex={0}
        title="Click to enlarge"
        onClick={() => svg && setZoom(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && svg && setZoom(true)}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {zoom && (
        <div className="mermaid-modal" onClick={() => setZoom(false)}>
          <span className="mermaid-modal-close">[ ✕ close · esc ]</span>
          <div
            className="mermaid-modal-inner"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: zoomSvg }}
          />
        </div>
      )}
    </>
  );
}
