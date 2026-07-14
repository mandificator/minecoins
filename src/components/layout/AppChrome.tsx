"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import type { MetaPage } from "@/lib/docs";

/**
 * The homepage is a full-bleed, self-contained composition (its own header +
 * bottom menu) with no left sidebar / footer. Every other route keeps the
 * normal Sidebar + ml-[22rem] offset + Footer chrome.
 */
export default function AppChrome({
  docs,
  children,
}: {
  docs: MetaPage[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/") {
    // Still needs the #page-content id — that's what CRTEffect targets for
    // the glitch filter. No sidebar offset/classes needed here, HomeClient
    // already lays itself out full-bleed.
    return <div id="page-content">{children}</div>;
  }

  return (
    <>
      <Sidebar docs={docs} />
      <div id="page-content" className="flex min-h-screen flex-col lg:ml-[22rem]">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
