export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role: string;
    };
  }
}

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// All routes except salon owner and customer routes are public
const isPublicRoute = createRouteMatcher(["/((?!salon-owner|user).*)"]);

const isSalonOwnerRoute = createRouteMatcher(["/salon-owner(.*)"]);

const isCustomerRoute = createRouteMatcher(["/user(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();

    const authObject = await auth();
    const { sessionClaims } = authObject;

    const role = sessionClaims?.metadata?.role as string;

    if (role === "salon-owner" && isCustomerRoute(req)) {
      return NextResponse.redirect(new URL("/salon-owner/profile", req.url));
    }

    if (role === "customer" && isSalonOwnerRoute(req)) {
      return NextResponse.redirect(new URL("/user/profile", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
