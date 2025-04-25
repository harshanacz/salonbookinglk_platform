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

// All routes except salon owner and customer routes are public
const isPublicRoute = createRouteMatcher([
  "/((?!salon-owner|user|super-admin).*)",
]);

const isSalonOwnerRoute = createRouteMatcher(["/salon-owner(.*)"]);

const isCustomerRoute = createRouteMatcher(["/user(.*)"]);

const isSuperAdminRoute = createRouteMatcher(["/super-admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const authObject = await auth();

  // If not authenticated, allow access to public routes
  if (!authObject.userId) {
    return NextResponse.next();
  }

  const { sessionClaims } = authObject;
  const type = sessionClaims?.metadata?.type as string;

  console.log(type);

  // Handle SUPER_ADMIN routes
  if (type === "SUPER_ADMIN") {
    if (!isSuperAdminRoute(req)) {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }
    return NextResponse.next();
  }

  // Handle SALON_OWNER routes
  if (type === "SALON_OWNER") {
    if (!isSalonOwnerRoute(req)) {
      return NextResponse.redirect(new URL("/salon-owner/profile", req.url));
    }
    return NextResponse.next();
  }

  // Handle CUSTOMER routes
  if (type === "CUSTOMER" && isSalonOwnerRoute(req)) {
    return NextResponse.redirect(new URL("/user/profile", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
