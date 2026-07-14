import Image from "next/image";
import Link from "next/link";

type Building = {
  label: string;
  href: string;
  icon: string;
  underConstruction?: boolean;
};

const BUILDINGS: Building[] = [
  { label: "STABILIZATION PLANT", href: "/bridge", icon: "/img/docs/stabilization-plant.png" },
  { label: "R&D INSTITUTE", href: "/staking/rd-institute", icon: "/img/docs/rd-institute.png" },
  {
    label: "RECRUITMENT OFFICE",
    href: "/docs/recruitment-office",
    icon: "/img/docs/recruitment-office.png",
  },
  { label: "RELIEF FUND", href: "/staking/relief-fund", icon: "/img/docs/relief-fund.png" },
  {
    label: "HIRING HALL",
    href: "/rent-a-miner",
    icon: "/img/docs/hiring-hall.png",
    underConstruction: true,
  },
];

export default function HomeHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-4 py-3 sm:px-8">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Image
          src="/img/promethium-logo.png"
          alt="Promethium"
          width={64}
          height={64}
          priority
          className="h-7 w-7 border border-border"
        />
        <span className="dash-label">PROMETHIUM</span>
      </Link>

      <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
        {BUILDINGS.map((b) => (
          <div key={b.href} className="group relative">
            <Link
              href={b.href}
              className="flex items-center gap-2 border border-transparent px-2 py-1.5 transition-colors hover:border-line hover:bg-white/[0.04]"
            >
              <Image
                src={b.icon}
                alt=""
                aria-hidden
                width={56}
                height={50}
                className="h-6 w-6 object-contain sm:h-7 sm:w-7"
              />
              <span className="dash-note hidden md:inline">{b.label}</span>
            </Link>
            {b.underConstruction && (
              <div className="dash-note pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 border border-line bg-bg px-2 py-1 text-title opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                under construction
              </div>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}
