"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [mounted, setMounted] = useState(false);
  
  // For the subtle animation effects
  useEffect(() => {
    setMounted(true);
  }, []);

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
    <header className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] w-full overflow-hidden rounded-2xl sm:rounded-[40px] mt-4 sm:mt-8 shadow-2xl">
      <div className={`transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <Image
          src="/images/HomeScreen/HeroImg.webp" 
          alt="Salon background"
          fill
          className="object-cover scale-105 filter contrast-[1.1] saturate-[1.1] transition-transform duration-1000 ease-out"
          priority
          quality={100}
        />

        {/* Gradient overlay with modern glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        
        {/* Enhanced gradient overlay at bottom */}
        <div className="absolute bottom-0 h-1/3 w-full bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-white">
        <h1 className={`mb-6 sm:mb-8 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight drop-shadow-lg
          transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Book Your Salon, Anytime.
          </span>
        </h1>
        
        <form onSubmit={handleSearch} className={`relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl group 
          transition-all duration-700 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* Glowing effect behind search box */}
          <div className="absolute inset-0 bg-white/20 rounded-[30px] blur-md group-hover:bg-white/30 group-hover:blur-xl transition-all duration-500"></div>
          
          <input
            type="text"
            placeholder="Search For Any Service ..."
            className="w-full h-12 sm:h-16 rounded-[30px] bg-white/90 backdrop-blur-md py-3 sm:py-4 pl-6 sm:pl-8 pr-12 sm:pr-16 
              text-base sm:text-xl text-gray-800 placeholder-gray-500 shadow-lg border border-white/20 
              focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-300 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[25px] bg-gradient-to-r 
              from-purple-700 to-purple-900 p-3 sm:p-4 text-white shadow-lg 
              hover:from-purple-600 hover:to-purple-800 hover:shadow-purple-500/50 transition-all duration-300 
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Search"
          >
            <Search className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
          </button>
        </form>
        
        <div className={`mt-8 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-4
          transition-all duration-700 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {categories.map((category, index) => (
            <button
              key={category.display}
              onClick={() => handleCategoryClick(category.slug)}
              className="rounded-full bg-white/10 border border-white/20 backdrop-blur-md 
                px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium 
                hover:bg-white/20 hover:shadow-lg hover:shadow-white/10 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-white/30
                transition-all duration-300 transform opacity-0"
              style={{ 
                animation: mounted ? `fadeIn 0.5s ease-out forwards ${0.6 + index * 0.1}s` : 'none'
              }}
            >
              {category.display}
            </button>
          ))}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 w-16 h-16 sm:w-20 sm:h-20 border border-white/20 rounded-full backdrop-blur-sm opacity-20"></div>
      <div className="absolute top-20 right-20 w-24 h-24 sm:w-32 sm:h-32 border border-white/10 rounded-full backdrop-blur-sm opacity-10"></div>
    </header>
  );
}
