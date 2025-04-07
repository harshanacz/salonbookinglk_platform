"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl text-black">
            SalonBooking.lk
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center text-sm font-medium text-gray-600 hover:text-black">
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="absolute left-0 md:left-auto md:right-0"> {/* Adjusted positioning */}
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <ListItem href="/services/hair-cuts" title="Hair Cuts">
                        Men's and women's haircuts, styling, and treatments
                      </ListItem>
                      <ListItem href="/services/nail-arts" title="Nail Arts">
                        Manicures, pedicures, nail extensions, and nail art
                      </ListItem>
                      <ListItem href="/services/skin-care" title="Skin Care">
                        Facials, skin treatments, and skin consultations
                      </ListItem>
                      <ListItem
                        href="/services/brows-lashes"
                        title="Brows & Lashes"
                      >
                        Eyebrow shaping, tinting, and eyelash extensions
                      </ListItem>
                      <ListItem href="/services/makeup" title="Makeup">
                        Professional makeup for events and occasions
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/for-business" legacyBehavior passHref>
                    <NavigationMenuLink className="text-sm font-medium text-gray-600 hover:text-black px-3 py-2">
                      For Business
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-white text-white hover:bg-gray-100 border border-gray-300 rounded-[15px] font-medium">
                Join
              </Button>
            </Link>
          </div>
        </div>
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
              <Link
                href="/services"
                className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/for-business"
                className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                For Business
              </Link>
              <hr className="my-2" />
              <Link
                href="/sign-in"
                className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300">
                  Join
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