import Image from "next/image";
import { Search } from "lucide-react";

const categories = [
  "Hair Cuts",
  "Nail Arts",
  "Skin Cares",
  "Brows & Lashes",
  "Makeup",
];

export default function Header() {
  return (
    <header className="relative h-[500px] w-full overflow-hidden rounded-[30px] mt-5">
      <Image
        src="/images/HomeScreen/HeroImg.webp"
        alt="Salon background"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-purple-900 bg-opacity-60" />

      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-white">
        <h1 className="mb-8 text-center text-4xl font-semibold md:text-5xl lg:text-6xl">
          Book Your Salon, Anytime.
        </h1>
        <div className="relative w-full max-w-3xl">
          <input
            type="text"
            placeholder="Search For Any Service ..."
            className="w-full rounded-[20px] bg-white/90 py-3 pl-6 pr-12 text-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-[20px] bg-[var(--primary)] p-3 text-white hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
            <Search size={24} />
          </button>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              className="rounded-full bg-white/20 px-6 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
