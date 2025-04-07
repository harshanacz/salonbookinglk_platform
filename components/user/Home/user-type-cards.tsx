import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function UserTypeCards() {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center text-center">
          <div className="relative w-full h-48 mb-4">
            <Image
              src="https://i.ibb.co/Cs3vY3CX/2.png"
              alt="Find and book appointment"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Find & Book an Appointment
          </h3>
          <p className="text-gray-600 mb-4">
            Easily find salons and book your next beauty appointment in minutes
          </p>
          <Link href="/sign-up">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Register
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center text-center">
          <div className="relative w-full h-48 mb-4">
            <Image
              src="https://i.ibb.co/KJzFnk6/1.png"
              alt="Grow your business"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Grow Your Business</h3>
          <p className="text-gray-600 mb-4">
            List your salon and services to reach more customers and grow your
            business
          </p>
          <Link href="/sign-up">
            <Button variant="default">Grow Business</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
