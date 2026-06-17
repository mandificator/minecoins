import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Three-colour palette: electric blue bg, white text, light blue accents.
        // Every former accent token now maps to the single light blue so the
        // whole UI stays within the allowed palette without per-file edits.
        bg: "#0a2bd6", // electric blue
        "bg-alt": "#0a27bd", // faint inset
        fg: "#ffffff", // white text
        "fg-dim": "rgba(255,255,255,0.62)", // faded white (secondary)
        "neon-green": "#bcd4ff", // -> light blue
        "neon-cyan": "#bcd4ff", // -> light blue
        "neon-magenta": "#bcd4ff", // -> light blue
        amber: "#bcd4ff", // -> light blue
        title: "#bcd4ff", // light blue (titles)
        border: "#6f8ce6", // light-blue hairline
      },
      fontFamily: {
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        none: "0",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-1px, 1px)" },
          "40%": { transform: "translate(-1px, -1px)" },
          "60%": { transform: "translate(1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
          "100%": { transform: "translate(0)" },
        },
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
        glitch: "glitch 0.25s linear",
      },
    },
  },
  plugins: [],
};

export default config;
