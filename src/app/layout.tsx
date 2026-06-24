import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GridBackground from "@/components/effects/GridBackground";
import CRTEffect from "@/components/effects/CRTEffect";
import SiteChrome from "@/components/layout/SiteChrome";
import SolanaProvider from "@/components/web3/WalletProvider";
import { Analytics } from "@vercel/analytics/next";
import { listDocs } from "@/lib/docs";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://promethium.work";
const DESCRIPTION =
  "A real Proof-of-Work coin on Promethium Chain that decays at the surface (17.7h half-life). Mine it, stabilize it to Solana as $PROM before it fades, and let an agent run your mining for you.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Promethium chain",
    template: "%s · Promethium",
  },
  description: DESCRIPTION,
  applicationName: "Promethium",
  keywords: [
    "Promethium",
    "$PROM",
    "Proof of Work",
    "Solana",
    "agentic mining",
    "crypto mining",
    "x402",
    "Promethium Chain",
  ],
  authors: [{ name: "Promethium" }],
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Promethium",
    title: "Promethium chain",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Promethium chain",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a2bd6",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = listDocs()
    .filter((d) => d.exists)
    .map(({ slug, title }) => ({ slug, title }));

  return (
    <html lang="en" className={mono.variable}>
      <body>
        <GridBackground />
        <SolanaProvider>
          <SiteChrome docs={docs}>{children}</SiteChrome>
        </SolanaProvider>
        <CRTEffect />
        <Analytics />
      </body>
    </html>
  );
}
