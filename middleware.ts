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
    redirectPath: "/salon-owner/create-profile",
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

// Routes excluded from profile check
const PROFILE_CHECK_EXCLUDED_ROUTES = [
  "/salon-owner/create-profile",
  "/user/complete-profile",
  "/api/",
  "/sign-in",
  "/sign-up"
];

// Get the designated route for a user type
const getHomeRouteForUserType = (type: string): string => {
  switch (type) {
    case "SUPER_ADMIN":
      return "/super-admin";
    case "SALON_OWNER":
      return "/salon-owner/profile"; // Change default landing page to /profile
    case "ADMIN":
      return "/admin";
    case "CUSTOMER":
      return "/user/profile";
    case undefined:
    case null:
      return "/";
    default:
      return "/";
  }
};

// Check if a salon owner has completed their profile
const checkSalonOwnerProfile = async (req: Request): Promise<boolean> => {
  try {
    // Call our API endpoint to check profile status
    const baseUrl = new URL(req.url).origin;
    const response = await fetch(`${baseUrl}/api/salon-owner/profile-check`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.isComplete;
  } catch (error) {
    console.error("[MIDDLEWARE_PROFILE_CHECK]", error);
    return false;
  }
};

// Check if a customer has completed their profile
const checkCustomerProfile = async (req: Request): Promise<boolean> => {
  try {
    // Call our API endpoint to check profile status
    const baseUrl = new URL(req.url).origin;
    const response = await fetch(`${baseUrl}/api/user/profile-check`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.isComplete;
  } catch (error) {
    console.error("[MIDDLEWARE_CUSTOMER_PROFILE_CHECK]", error);
    return false;
  }
};

// Check and reactivate user account if deactivated
const checkAndReactivateAccount = async (req: Request): Promise<void> => {
  try {
    const baseUrl = new URL(req.url).origin;
    await fetch(`${baseUrl}/api/user/reactivate`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });
    // We don't need to handle the response as this is just a background check
  } catch (error) {
    console.error("[MIDDLEWARE_REACTIVATE_CHECK]", error);
    // Continue silently if reactivation check fails
  }
};

export default clerkMiddleware(async (auth, req) => {
  // Skip user-type-based redirects for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const authObject = await auth();

  // Check if the current route is a protected route
  const isProtectedRoute = Object.values(ROUTE_CONFIG).some((config) =>
    config.pattern(req)
  );
  
  // Also consider all /user/ routes as protected
  const isUserRoute = req.nextUrl.pathname.startsWith("/user/");
  
  // If not authenticated and trying to access protected routes or user routes
  if (!authObject.userId && (isProtectedRoute || isUserRoute)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If authenticated, handle user type specific redirects
  if (authObject.userId) {
    const { sessionClaims } = authObject;
    const userType = sessionClaims?.metadata?.type as string | undefined;

    console.log("User type:", userType);

    // Check and reactivate account for customers if needed (but not on deactivation page)
    if (userType === "CUSTOMER" && !req.nextUrl.pathname.includes("/deactivate-account")) {
      await checkAndReactivateAccount(req);
    }

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

    // Check if salon owner has completed profile
    if (userType === "SALON_OWNER" && 
        req.nextUrl.pathname.startsWith("/salon-owner") && 
        !PROFILE_CHECK_EXCLUDED_ROUTES.some(path => req.nextUrl.pathname.startsWith(path))) {
      
      const isProfileComplete = await checkSalonOwnerProfile(req);
      
      if (!isProfileComplete && !req.nextUrl.pathname.startsWith("/salon-owner/create-profile")) {
        return NextResponse.redirect(
          new URL("/salon-owner/create-profile", req.url)
        );
      }
    }
    
    // Check if customer has completed profile - for ALL customer routes
    if (userType === "CUSTOMER" && 
        !PROFILE_CHECK_EXCLUDED_ROUTES.some(path => req.nextUrl.pathname.startsWith(path))) {
      
      const isProfileComplete = await checkCustomerProfile(req);
      
      if (!isProfileComplete) {
        return NextResponse.redirect(
          new URL("/user/complete-profile", req.url)
        );
      }
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
  runtime: 'nodejs',
};
