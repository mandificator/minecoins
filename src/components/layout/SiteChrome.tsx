"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import type { MetaPage } from "@/lib/docs";

/**
 * TEMP (OG splash homepage): "/" runs bare — no sidebar, no footer, no
 * Connect Wallet — while the real homepage is parked at page.original.tsx.
 * Remove this `bare` branch (always render Sidebar + the ml-[22rem] wrapper +
 * Footer) when restoring the real homepage.
 */
export default function SiteChrome({
  docs,
  children,
}: {
  docs: MetaPage[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = pathname === "/";

  if (bare) {
    return (
      <div id="page-content">
        <main>{children}</main>
      </div>
    );
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
