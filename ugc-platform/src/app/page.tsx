"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { HeroSection } from "@/components/landing/HeroSection";
import { NarrativeSection } from "@/components/landing/NarrativeSection";
import { DriverCard } from "@/components/landing/DriverCard";
import { VarianceCard } from "@/components/landing/VarianceCard";
import { ScenarioCard } from "@/components/landing/ScenarioCard";
import { FooterSection } from "@/components/landing/FooterSection";
import { useTheme } from "@/contexts/ThemeContext";

export default function LandingPage() {
  const { theme } = useTheme();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Only redirect users without roles to onboarding
  // Allow authenticated users with roles to view landing page if they navigate to it
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!isLoaded) {
        return;
      }

      // If user is not authenticated, show landing page
      if (!user) {
        setIsChecking(false);
        return;
      }

      // If user is authenticated, check if they have a role
      // Only redirect to onboarding if they don't have a role
      // Users with roles can view the landing page if they navigate to it explicitly
      try {
        const response = await fetch('/api/sync-user-profile');
        if (response.ok) {
          const result = await response.json();
          const role = result?.data?.role || null;

          // Only redirect users without roles to onboarding
          // Middleware will also handle this, but we do it here for better UX
          if (!role) {
            router.push('/onboarding');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAndRedirect();
  }, [user, isLoaded, router]);

  // Show loading state while checking (for authenticated users without roles)
  if (isChecking && user) {
    return null; // Will redirect if no role, so show nothing
  }

  const bgGradient = theme === "light"
    ? "bg-gradient-to-b from-[#E8ECF3] via-[#E0E8F0] to-[#D9E1EF]"
    : "bg-gradient-to-b from-[#0A0F17] via-[#0D1419] to-[#06101A]";

  const orbColor1 = theme === "light"
    ? "bg-[#1B3C73]/20"
    : "bg-[#60A5FA]/30";
  const orbColor2 = theme === "light"
    ? "bg-[#1B3C73]/15"
    : "bg-[#60A5FA]/20";
  const orbColor3 = theme === "light"
    ? "bg-[#1B3C73]/10"
    : "bg-[#60A5FA]/20";
  const orbColor4 = theme === "light"
    ? "bg-[#1B3C73]/8"
    : "bg-[#60A5FA]/15";

  return (
    <main className={`min-h-screen selection:bg-[#1B3C73]/30 relative overflow-hidden ${bgGradient}`}>
      <div className={`fixed inset-0 -z-20 ${bgGradient}`} />

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 -z-10 opacity-60">
        <div className={`absolute top-0 right-1/4 w-[600px] h-[600px] ${orbColor1} rounded-full blur-[120px] animate-float`} />
        <div className={`absolute top-1/3 left-1/4 w-[500px] h-[500px] ${orbColor2} rounded-full blur-[100px] animate-float-delayed`} />
        <div className={`absolute bottom-1/4 right-1/3 w-[700px] h-[700px] ${orbColor3} rounded-full blur-[140px] animate-float-slow`} />
        <div className={`absolute top-1/2 left-1/2 w-[400px] h-[400px] ${orbColor4} rounded-full blur-[90px] animate-pulse-slow`} />
      </div>

      {/* Subtle overlay texture */}
      <div className={`fixed inset-0 -z-10 bg-gradient-to-t pointer-events-none ${
        theme === "light"
          ? "from-[#1B3C73]/10 via-transparent to-transparent"
          : "from-black/20 via-transparent to-[#60A5FA]/5"
      }`} />

      <HeroSection />

      <NarrativeSection />

      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DriverCard />
          <VarianceCard />
          <ScenarioCard />
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
