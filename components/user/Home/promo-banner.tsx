import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function PromoBanner() {
  return (
    <section className="relative w-full bg-purple-900 text-white py-10">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/HomeScreen/HeroImg.webp"
          alt="Promo background" 
          fill
          className="object-cover opacity-20"
        />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Join the Sri Lankans Largest Beauty Service Marketplace
        </h2>
        <Link href="/sign-up">
  <Button
    variant="outline"
    className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-purple-900 transition-all duration-300 px-6 py-2 font-semibold text-lg rounded-full"
  >
    Join Now
  </Button>
</Link>
      </div>
    </section>
  );
}
