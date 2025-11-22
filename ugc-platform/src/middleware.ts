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
    // Check if user has a role with retry logic to handle race conditions
    let userRole = await getUserRole(userId);
    
    // If no role found and user might have just set it, retry with exponential backoff
    if (!userRole) {
      const referer = req.headers.get('referer');
      const isFromOnboarding = referer?.includes('/onboarding');
      
      // If coming from onboarding, give database a moment to sync
      if (isFromOnboarding) {
        console.log('[Middleware] User from onboarding, retrying role check...');
        await new Promise(resolve => setTimeout(resolve, 300));
        userRole = await getUserRole(userId);
        
        // Second retry if still no role
        if (!userRole) {
          await new Promise(resolve => setTimeout(resolve, 500));
          userRole = await getUserRole(userId);
        }
      }
    }
    
    // If user doesn't have a role after retries, redirect to onboarding
    if (!userRole) {
      console.log('[Middleware] No role found for user, redirecting to onboarding');
      const onboardingUrl = new URL('/onboarding', req.url);
      return NextResponse.redirect(onboardingUrl);
    } else {
      console.log('[Middleware] User has role:', userRole);
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

