"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Star, Scissors, Award } from "lucide-react";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Animate in after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className={`relative w-full overflow-hidden bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white py-12 sm:py-16 my-8 sm:my-12
      transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} rounded-[20px] shadow-lg`}>
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/HomeScreen/HeroImg.webp"
          alt="Promo background" 
          fill
          className="object-cover opacity-[0.08] scale-110"
        />
        
        {/* Geometric shapes */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
        
        {/* Small decorative elements */}
        <div className="absolute top-10 left-[10%] w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-700/30 blur-sm"></div>
        <div className="absolute bottom-12 right-[15%] w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-700/30 blur-sm"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
            <span className="text-sm font-medium">Sri Lanka's #1 Beauty Platform</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Join the Sri Lanka's Largest Beauty Service Marketplace
          </h2>
          
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-xl">
            Connect with top professionals, book appointments easily, and discover amazing services all in one place.
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Link href="/sign-up?role=customer">
              <Button className="border-2 border-white/70 text-white hover:bg-white/10 transition-all duration-300 px-6 py-6 font-semibold text-base rounded-full">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="hidden md:flex flex-col gap-3 min-w-[320px]">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl transform transition-all hover:bg-white/20 hover:translate-x-1 cursor-default">
            <div className="bg-purple-500/30 p-2 rounded-lg">
              <Star className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <p className="font-medium">Top-rated professionals</p>
              <p className="text-sm text-white/70">Verified reviews from real customers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl transform transition-all hover:bg-white/20 hover:translate-x-1 cursor-default">
            <div className="bg-purple-500/30 p-2 rounded-lg">
              <Scissors className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <p className="font-medium">100+ Service Categories</p>
              <p className="text-sm text-white/70">All your beauty needs in one place</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl transform transition-all hover:bg-white/20 hover:translate-x-1 cursor-default">
            <div className="bg-purple-500/30 p-2 rounded-lg">
              <Award className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <p className="font-medium">Best Price Guarantee</p>
              <p className="text-sm text-white/70">Exclusive deals and discounts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
