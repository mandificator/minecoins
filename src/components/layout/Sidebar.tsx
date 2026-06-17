"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import WalletButton from "@/components/web3/WalletButton";
import type { MetaPage } from "@/lib/docs";

type Item = { href: string; label: string };

const TOP: Item[] = [{ href: "/", label: "ABOUT" }, { href: "/explorer", label: "EXPLORER" }];
const BOTTOM: Item[] = [
  { href: "/staking", label: "STAKING" },
  { href: "/bridge", label: "BRIDGE" },
  { href: "/rent-a-miner", label: "RENT-A-MINER" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ docs }: { docs: MetaPage[] }) {
  const pathname = usePathname();
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

        {BOTTOM.map(link)}
      </div>
    </nav>
  );

  return (
    <>
      {/* Connect — fixed top-right (desktop), same colours as the sidebar */}
      <div className="fixed right-5 top-4 z-40 hidden lg:block">
        <WalletButton />
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-bg/30 bg-title px-4 py-3 text-bg lg:hidden">
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
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[20rem] overflow-y-auto bg-title px-7 py-7 text-bg lg:block">
        {nav}
      </aside>
    </>
  );
}
