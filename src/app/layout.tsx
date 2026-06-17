import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GridBackground from "@/components/effects/GridBackground";
import CRTEffect from "@/components/effects/CRTEffect";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import SolanaProvider from "@/components/web3/WalletProvider";
import { listDocs } from "@/lib/docs";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promethium — the element that doesn't want to exist",
  description:
    "A real Proof-of-Work coin on Promethium Chain that decays at the surface (17.7h half-life). Mine it, haul it, and bridge it to Solana as $PROM before it fades.",
  metadataBase: new URL("https://minecoins.work"),
  openGraph: {
    title: "Promethium — mine it, race it, stabilize it",
    description:
      "Mine Promethium with Proof-of-Work, beat the 17.7h decay, and bridge to Solana as $PROM. Stake $PROM to mine easier.",
    url: "https://minecoins.work",
    siteName: "Promethium",
  },
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
          <Sidebar docs={docs} />
          <div id="page-content" className="flex min-h-screen flex-col lg:ml-[20rem]">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SolanaProvider>
        <CRTEffect />
      </body>
    </html>
  );
}
