import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/role-utils";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',                    // Landing page
  '/sign-in(.*)',         // Clerk sign-in routes
  '/sign-up(.*)',         // Clerk sign-up routes
  '/api(.*)',             // API routes handle their own authentication
]);

// Define onboarding route (accessible without role)
const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // If user is authenticated and not on a public route or onboarding route
  if (userId && !isPublicRoute(req) && !isOnboardingRoute(req)) {
    // Check if user has a role
    const userRole = await getUserRole(userId);
    
    // If user doesn't have a role, redirect to onboarding
    if (!userRole) {
      const onboardingUrl = new URL('/onboarding', req.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

