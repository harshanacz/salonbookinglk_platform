export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      type: string;
    };
  }
}

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route patterns and their allowed user types
const ROUTE_CONFIG = {
  public: {
    pattern: createRouteMatcher(["/((?!salon-owner|super-admin).*)"]),
    allowedTypes: ["CUSTOMER"], // Only customers can access public routes when logged in
  },
  salonOwner: {
    pattern: createRouteMatcher(["/salon-owner(.*)"]),
    allowedTypes: ["SALON_OWNER"],
    redirectPath: "/salon-owner/profile",
  },
  superAdmin: {
    pattern: createRouteMatcher(["/super-admin(.*)"]),
    allowedTypes: ["SUPER_ADMIN"],
    redirectPath: "/super-admin",
  },
};

// Get the designated route for a user type
const getHomeRouteForUserType = (type: string): string => {
  switch (type) {
    case "SUPER_ADMIN":
      return "/super-admin";
    case "SALON_OWNER":
      return "/salon-owner/profile";
    case "CUSTOMER":
      return "/"; // Customers can access public routes
    default:
      return "/";
  }
};

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();

  // Handle unauthenticated users
  if (!authObject.userId) {
    // Only allow public routes for unauthenticated users
    if (!ROUTE_CONFIG.public.pattern(req)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  const { sessionClaims } = authObject;
  const userType = sessionClaims?.metadata?.type as string;

  console.log(userType);

  // Find which route pattern matches the current request
  for (const [key, config] of Object.entries(ROUTE_CONFIG)) {
    if (config.pattern(req)) {
      // If user type is not allowed for this route pattern, redirect them
      if (!config.allowedTypes.includes(userType)) {
        return NextResponse.redirect(new URL(getHomeRouteForUserType(userType), req.url));
      }
      return NextResponse.next();
    }
  }

  // If no route pattern matched, redirect to user's home route
  return NextResponse.redirect(new URL(getHomeRouteForUserType(userType), req.url));
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
