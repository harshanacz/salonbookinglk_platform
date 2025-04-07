import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function PromoBanner() {
  return (
    <section className="relative w-full bg-purple-900 text-white py-10">
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=400&width=1600"
          alt="Promo background"
          fill
          className="object-cover opacity-40"
        />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Get 30% Off on Your First Booking!
        </h2>
        <Link href="/sign-up">
          <Button
            variant="outline"
            className="bg-white text-purple-900 hover:bg-gray-100"
          >
            Sign Up
          </Button>
        </Link>
      </div>
    </section>
  );
}
