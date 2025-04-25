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
    default:
      return "/";
  }
};

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();
  
  // Check if the current route is a protected route
  const isProtectedRoute = Object.values(ROUTE_CONFIG).some(
    (config) => config.pattern(req)
  );

  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (!authObject.userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const { sessionClaims } = authObject;
  const userType = sessionClaims?.metadata?.type as string;

  console.log("User type:", userType);
  
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

  // If it's a protected route but no pattern matched (shouldn't happen), redirect to home
  return NextResponse.redirect(new URL("/", req.url));
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
