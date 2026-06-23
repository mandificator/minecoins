import Image from "next/image";
import { SiTelegram, SiX } from "react-icons/si";
import ogImage from "./opengraph-image.png";
import HeroGlitch from "@/components/effects/HeroGlitch";

export default function HomePage() {
  return (
    <div
      id="og-hero"
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-bg"
    >
      <HeroGlitch targetId="og-hero" />
      <Image
        src={ogImage}
        alt="Promethium — Agentic Mining Company"
        priority
        className="h-auto w-1/3"
      />
      <div className="flex gap-6">
        <a
          href="https://x.com/promethium_work"
          target="_blank"
          rel="noopener noreferrer"
          className="text-title hover:opacity-80"
          aria-label="Promethium on X"
        >
          <SiX size={20} />
        </a>
        <a
          href="https://t.me/Promethium_portal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-title hover:opacity-80"
          aria-label="Promethium on Telegram"
        >
          <SiTelegram size={20} />
        </a>
      </div>
    </div>
  );
}
