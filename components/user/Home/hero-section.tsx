"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define categories with display names and URL slugs
const categories = [
  { display: "Hair Cuts", slug: "hair-cuts" },
  { display: "Coloring", slug: "coloring" },
  { display: "Styling", slug: "styling" },
  { display: "Facial", slug: "facial" },
  { display: "Massage", slug: "massage" },
  { display: "Nails", slug: "nails" },
  { display: "Skin Care", slug: "skin-care" },
];

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/categories/${categorySlug}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="relative h-[500px] w-full overflow-hidden rounded-[30px] mt-5">
      <Image
        src="/images/HomeScreen/HeroImg.webp" 
        alt="Salon background"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-purple-900 bg-opacity-20" />

      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-white">
        <h1 className="mb-8 text-center text-4xl font-semibold md:text-5xl lg:text-6xl">
          Book Your Salon, Anytime.
        </h1>
        <form onSubmit={handleSearch} className="relative w-full max-w-3xl">
          <input
            type="text"
            placeholder="Search For Any Service ..."
            className="w-full rounded-[20px] bg-white/90 py-3 pl-6 pr-12 text-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-[20px] bg-purple-900 p-3 text-white hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Search size={24} />
          </button>
        </form>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category.display}
              onClick={() => handleCategoryClick(category.slug)}
              className="rounded-full bg-white/20 px-6 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {category.display}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
