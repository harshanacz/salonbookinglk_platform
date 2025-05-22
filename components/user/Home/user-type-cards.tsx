import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export function UserTypeCards() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 
        transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">
          Start Your Beauty Journey Today
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Customer Card */}
        <div className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl 
          transition-all duration-500 transform hover:-translate-y-1 
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: "200ms" }}
        >
          {/* Gradient background for the card */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white z-0"></div>
          
          {/* Card content */}
          <div className="relative z-10 p-6 sm:p-8">
            <div className="relative w-full h-48 sm:h-56 mb-6 group-hover:scale-105 transition-transform duration-500">
              <Image
                src="https://i.ibb.co/Cs3vY3CX/2.png"
                alt="Find and book appointment"
                fill
                className="object-contain"
              />
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-100 rounded-full opacity-60 
                group-hover:scale-150 group-hover:opacity-30 transition-all duration-700"></div>
              <div className="absolute top-4 -left-4 w-16 h-16 bg-purple-200 rounded-full opacity-40 
                group-hover:scale-150 group-hover:opacity-20 transition-all duration-700"></div>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-purple-900 
              group-hover:text-purple-700 transition-colors duration-300">
              Find & Book an Appointment
            </h3>
            
            <p className="text-gray-600 mb-6 text-base sm:text-lg">
              Easily find salons and book your next beauty appointment in minutes. 
              Get personalized service recommendations that match your style and preferences.
            </p>
            
            <Link href="/sign-up?role=customer" className="block">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 
                hover:to-purple-700 transform transition-all duration-300 py-6 font-semibold text-base">
                Register as Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Business Owner Card */}
        <div className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl 
          transition-all duration-500 transform hover:-translate-y-1 
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: "400ms" }}
        >
          {/* Gradient background for the card */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white z-0"></div>
          
          {/* Card content */}
          <div className="relative z-10 p-6 sm:p-8">
            <div className="relative w-full h-48 sm:h-56 mb-6 group-hover:scale-105 transition-transform duration-500">
              <Image
                src="https://i.ibb.co/KJzFnk6/1.png"
                alt="Grow your business"
                fill
                className="object-contain"
              />
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-100 rounded-full opacity-60 
                group-hover:scale-150 group-hover:opacity-30 transition-all duration-700"></div>
              <div className="absolute top-4 -right-4 w-16 h-16 bg-blue-200 rounded-full opacity-40 
                group-hover:scale-150 group-hover:opacity-20 transition-all duration-700"></div>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-blue-900 
              group-hover:text-blue-700 transition-colors duration-300">
              Grow Your Business
            </h3>
            
            <p className="text-gray-600 mb-6 text-base sm:text-lg">
              List your salon and services to reach more customers. Manage bookings, 
              streamline operations, and watch your business flourish with our platform.
            </p>
            
            <Link href="/sign-up?role=salon-owner" className="block">
              <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-700 
                hover:bg-blue-50 transform transition-all duration-300 py-6 font-semibold text-base">
                Register as Business Owner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
