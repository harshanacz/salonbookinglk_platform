import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">salonbooking.lk</h3>
            <p className="text-sm text-gray-600">
              SalonBooking (PVT) Limited.
              <br />
              Your one-stop shop for beauty bookings. Discover top salons in Sri
              Lanka and book your perfect pampering session with
              salonbooking.lk.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Access</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/most-popular"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Most Popular
                </Link>
              </li>
              <li>
                <Link
                  href="/new-salons"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  New Salons
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  href="/referral"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Referral
                </Link>
              </li>
              <li>
                <Link
                  href="/gift-cards"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  GiftCards
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Main Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services/hair-cuts"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Hair Cuts
                </Link>
              </li>
              <li>
                <Link
                  href="/services/nail-arts"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Nail Arts
                </Link>
              </li>
              <li>
                <Link
                  href="/services/skin-care"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Skin Care
                </Link>
              </li>
              <li>
                <Link
                  href="/services/brows-lashes"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Brows & Lashes
                </Link>
              </li>
              <li>
                <Link
                  href="/services/waxing"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Waxing
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about-us"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
            <div className="flex space-x-4 pt-2">
              <Link
                href="https://twitter.com/salonbookinglk"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-gray-600 hover:text-gray-900" />
              </Link>
              <Link
                href="https://instagram.com/salonbookinglk"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-gray-600 hover:text-gray-900" />
              </Link>
              <Link
                href="https://facebook.com/salonbookinglk"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-600 hover:text-gray-900" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
