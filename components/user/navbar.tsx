"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left section: Logo + Services */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-black">
            SalonBooking.lk
          </Link>

          {/* Services Dropdown (Desktop Only) */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center text-sm font-medium text-gray-600 hover:text-black">
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="absolute left-0 md:left-auto md:right-0">
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <ListItem href="/categories/hair-cuts" title="Hair Cuts">
                        Men's and women's haircuts, styling, and treatments
                      </ListItem>
                      <ListItem href="/categories/nail-arts" title="Nail Arts">
                        Manicures, pedicures, nail extensions, and nail art
                      </ListItem>
                      <ListItem href="/categories/skin-care" title="Skin Care">
                        Facials, skin treatments, and skin consultations
                      </ListItem>
                      <ListItem
                        href="/categories/brows-lashes"
                        title="Brows & Lashes"
                      >
                        Eyebrow shaping, tinting, and eyelash extensions
                      </ListItem>
                      <ListItem href="/categories/makeup" title="Makeup">
                        Professional makeup for events and occasions
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right section: For Business + Sign In + Join */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/sign-in">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-black font-medium"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up?role=customer">
            <Button
              size="sm"
              className="bg-white text-black hover:bg-gray-100 border border-gray-300 rounded-[15px] font-medium"
            >
              Join as Customer
            </Button>
          </Link>
          <Link href="/sign-up?role=salon-owner">
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-primary/90 rounded-[15px] font-medium"
            >
              Join as Salon Owner
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="border-gray-200">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="font-bold text-xl"
                onClick={() => setIsOpen(false)}
              >
                SalonBooking.lk
              </Link>

              {/* Mobile Services Dropdown */}
              <div>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="flex justify-between items-center font-medium w-full text-left"
                >
                  Services
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isServicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isServicesOpen && (
                  <div className="ml-4 mt-2 flex flex-col gap-2 text-sm text-gray-600">
                    <Link
                      href="/categories/hair-cuts"
                      onClick={() => setIsOpen(false)}
                    >
                      Hair Cuts
                    </Link>
                    <Link
                      href="/categories/nail-arts"
                      onClick={() => setIsOpen(false)}
                    >
                      Nail Arts
                    </Link>
                    <Link
                      href="/categories/skin-care"
                      onClick={() => setIsOpen(false)}
                    >
                      Skin Care
                    </Link>
                    <Link
                      href="/categories/brows-lashes"
                      onClick={() => setIsOpen(false)}
                    >
                      Brows & Lashes
                    </Link>
                    <Link
                      href="/categories/makeup"
                      onClick={() => setIsOpen(false)}
                    >
                      Makeup
                    </Link>
                  </div>
                )}
              </div>

              <hr className="my-2" />

              <Link
                href="/sign-in"
                className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link href="/sign-up?role=customer" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300 mb-2">
                  Join as Customer
                </Button>
              </Link>
              <Link href="/sign-up?role=salon-owner" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary text-white hover:bg-primary/90">
                  Join as Salon Owner
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-500">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
