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
    <header className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-6 sm:px-10 sm:py-8">
      <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-3">
        {BUILDINGS.map((b) => (
          <div key={b.href} className="group relative">
            <Link
              href={b.href}
              className="flex items-center gap-2 border border-transparent px-3 py-2 transition-colors hover:border-line hover:bg-white/[0.04]"
            >
              <Image
                src={b.icon}
                alt={b.label}
                width={314}
                height={280}
                className="h-[300px] w-[336px] object-contain"
              />
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
