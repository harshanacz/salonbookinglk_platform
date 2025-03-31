"use client";

import React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            SalonBooking.lk
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
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
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    For Business
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden md:block">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up" className="hidden md:block">
            <Button size="sm">Sign Up</Button>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="font-semibold text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  SalonBooking.lk
                </Link>
                <Link
                  href="/services/hair-cuts"
                  onClick={() => setIsOpen(false)}
                >
                  Hair Cuts
                </Link>
                <Link
                  href="/services/nail-arts"
                  onClick={() => setIsOpen(false)}
                >
                  Nail Arts
                </Link>
                <Link
                  href="/services/skin-care"
                  onClick={() => setIsOpen(false)}
                >
                  Skin Care
                </Link>
                <Link
                  href="/services/brows-lashes"
                  onClick={() => setIsOpen(false)}
                >
                  Brows & Lashes
                </Link>
                <Link href="/services/makeup" onClick={() => setIsOpen(false)}>
                  Makeup
                </Link>
                <Link href="/for-business" onClick={() => setIsOpen(false)}>
                  For Business
                </Link>
                <hr className="my-2" />
                <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
