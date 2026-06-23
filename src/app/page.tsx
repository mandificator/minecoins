import Image from "next/image";
import ogImage from "./opengraph-image.png";
import HeroGlitch from "@/components/effects/HeroGlitch";

export default function HomePage() {
  return (
    <div
      id="og-hero"
      className="relative flex min-h-[80vh] items-center justify-center bg-bg"
    >
      <HeroGlitch targetId="og-hero" />
      <Image
        src={ogImage}
        alt="Promethium — Agentic Mining Company"
        priority
        className="h-auto w-full max-w-3xl px-6"
      />
    </div>
  );
}
