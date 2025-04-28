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
  admin: {
    pattern: createRouteMatcher(["/admin(.*)"]),
    allowedTypes: ["ADMIN"],
    redirectPath: "/admin",
  },
};

// Get the designated route for a user type
const getHomeRouteForUserType = (type: string): string => {
  switch (type) {
    case "SUPER_ADMIN":
      return "/super-admin";
    case "SALON_OWNER":
      return "/salon-owner/profile";
    case "ADMIN":
      return "/admin";
    case "CUSTOMER":
    case undefined:
    case null:
      return "/";
    default:
      return "/";
  }
};

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();

  // Check if the current route is a protected route
  const isProtectedRoute = Object.values(ROUTE_CONFIG).some((config) =>
    config.pattern(req)
  );

  // If authenticated, handle user type specific redirects
  if (authObject.userId) {
    const { sessionClaims } = authObject;
    const userType = sessionClaims?.metadata?.type as string | undefined;

    console.log("User type:", userType);
    // If user type is not set, treat them as a customer
    // This helps during initial sign up before the type is set
    if (!userType) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // If it's not a protected route and user is not a customer,
    // redirect them to their respective section
    if (!isProtectedRoute && userType !== "CUSTOMER") {
      return NextResponse.redirect(
        new URL(getHomeRouteForUserType(userType), req.url)
      );
    }

    // For protected routes, check permissions
    if (isProtectedRoute) {
      for (const [key, config] of Object.entries(ROUTE_CONFIG)) {
        if (config.pattern(req)) {
          if (!config.allowedTypes.includes(userType)) {
            return NextResponse.redirect(
              new URL(getHomeRouteForUserType(userType), req.url)
            );
          }
          return NextResponse.next();
        }
      }
    }
  } else if (isProtectedRoute) {
    // If not authenticated and trying to access protected route
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
