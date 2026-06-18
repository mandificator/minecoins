import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = "Promethium — Agentic Mining Company";

// Shared social-card renderer used by both the Open Graph and Twitter image
// routes. Electric-blue cyberpunk theme, matching the site.
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a2bd6",
          color: "#ffffff",
          fontFamily: "monospace",
          padding: 64,
          border: "8px solid #6f8ce6",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#bcd4ff", letterSpacing: 4 }}>
          ┌─[ PROMETHIUM ]─┐
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, color: "#bcd4ff", letterSpacing: 6 }}>
            PROMETHIUM
          </div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 12, color: "#ffffff" }}>
            Agentic Mining Company
          </div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 10, color: "rgba(255,255,255,0.72)" }}>
            Real Proof-of-Work tokens on Solana.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#bcd4ff" }}>
            &gt; prom mine --algo sha256 | prom stabilize
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#bcd4ff", letterSpacing: 2 }}>
            promethium.work
          </div>
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
