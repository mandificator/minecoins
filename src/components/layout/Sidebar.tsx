"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import WalletButton from "@/components/web3/WalletButton";
import { useGlitch } from "@/components/effects/GlitchProvider";
import type { MetaPage } from "@/lib/docs";

type Item = { href: string; label: string };

const TOP: Item[] = [
  { href: "/", label: "ABOUT" },
  { href: "/agentic-mining", label: "AGENTIC MINING" },
  { href: "/explorer", label: "EXPLORER" },
  { href: "/imprints", label: "IMPRINTS" },
];
const BOTTOM: Item[] = [
  { href: "/bridge", label: "STABILIZATION PLANT" },
  { href: "/rent-a-miner", label: "HIRING HALL" },
  { href: "/faucet", label: "FAUCET" },
];

const INVESTMENT_CHILDREN: Item[] = [
  { href: "/staking/rd-institute", label: "R&D Institute" },
  { href: "/staking/relief-fund", label: "Relief Fund" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ docs }: { docs: MetaPage[] }) {
  const pathname = usePathname();
  const { enabled: glitchOn, toggle: toggleGlitch } = useGlitch();
  const onDocs = pathname.startsWith("/docs");
  const [docsOpen, setDocsOpen] = useState(onDocs);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (onDocs) setDocsOpen(true);
  }, [onDocs]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const link = (it: Item) => {
    const active = isActive(pathname, it.href);
    return (
      <Link
        key={it.href}
        href={it.href}
        className={`block whitespace-nowrap py-1.5 hover:underline ${
          active ? "font-bold underline" : ""
        }`}
      >
        <span className="text-bg/50">{active ? "› " : "  "}</span>
        {it.label}
      </Link>
    );
  };

  const nav = (
    <nav className="flex h-full flex-col">
      <Link
        href="/"
        className="mb-8 inline-block whitespace-nowrap font-bold tracking-[0.15em]"
      >
        PROMETHIUM
      </Link>

      <div className="flex-1">
        {TOP.map(link)}

        {/* DOCS — expandable submenu */}
        <div>
          <button
            type="button"
            onClick={() => setDocsOpen((v) => !v)}
            className={`flex w-full items-center justify-between whitespace-nowrap py-1.5 text-left hover:underline ${
              onDocs ? "font-bold" : ""
            }`}
            aria-expanded={docsOpen}
          >
            <span>
              <span className="text-bg/50">{onDocs ? "› " : "  "}</span>
              DOCS
            </span>
            <span className="text-bg/50">{docsOpen ? "▾" : "▸"}</span>
          </button>
          {docsOpen && (
            <ul className="mb-1 ml-3 border-l border-bg/25 pl-3">
              {docs.map((p, i) => {
                const href = `/docs/${p.slug}`;
                const active = pathname === href;
                return (
                  <li key={p.slug}>
                    <Link
                      href={href}
                      className={`block whitespace-nowrap py-1 hover:underline ${
                        active ? "font-bold underline" : "text-bg/80"
                      }`}
                    >
                      <span className="text-bg/45">
                        {String(i + 1).padStart(2, "0")}{" "}
                      </span>
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* INVESTMENT — parent + always-visible R&D Institute / Relief Fund children */}
        <div>
          <Link
            href="/staking"
            className={`block whitespace-nowrap py-1.5 hover:underline ${
              pathname === "/staking" ? "font-bold underline" : ""
            }`}
          >
            <span className="text-bg/50">
              {pathname.startsWith("/staking") ? "› " : "  "}
            </span>
            INVESTMENT
          </Link>
          <ul className="mb-1 ml-3 border-l border-bg/25 pl-3">
            {INVESTMENT_CHILDREN.map((it) => {
              const active = pathname === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`block whitespace-nowrap py-1 hover:underline ${
                      active ? "font-bold underline" : "text-bg/80"
                    }`}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {BOTTOM.map(link)}

        <button
          type="button"
          onClick={toggleGlitch}
          aria-pressed={glitchOn}
          className="mt-3 flex w-full items-center justify-between whitespace-nowrap border-t border-bg/25 pt-3 text-left hover:underline"
        >
          <span>GLITCH FX</span>
          <span className="text-bg/60">{glitchOn ? "ON" : "OFF"}</span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Connect — fixed top-right (desktop), same colours as the sidebar.
          z above the zoom overlay (9999) so it stays visible/clickable. */}
      <div className="fixed right-5 top-4 z-[10000] hidden lg:block">
        <WalletButton />
      </div>

      {/* Mobile top bar (also above the zoom overlay) */}
      <div className="sticky top-0 z-[10000] flex items-center justify-between border-b border-bg/30 bg-title px-4 py-3 text-bg lg:hidden">
        <Link href="/" className="font-bold tracking-[0.15em]">
          PROMETHIUM
        </Link>
        <div className="flex items-center gap-2">
          <WalletButton />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="border border-bg/30 px-3 py-1"
          >
            {mobileOpen ? "✕" : "≡"}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[3.25rem] z-40 overflow-y-auto border-t border-bg/30 bg-title px-6 py-6 text-bg lg:hidden">
          {nav}
        </div>
      )}

      {/* Desktop fixed left sidebar — light-blue bg, blue text */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[22rem] overflow-y-auto bg-title px-7 py-7 text-bg lg:block">
        {nav}
      </aside>
    </>
  );
}
