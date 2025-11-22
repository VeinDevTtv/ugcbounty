"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { NarrativeSection } from "@/components/landing/NarrativeSection";
import { DriverCard } from "@/components/landing/DriverCard";
import { VarianceCard } from "@/components/landing/VarianceCard";
import { ScenarioCard } from "@/components/landing/ScenarioCard";
import { FooterSection } from "@/components/landing/FooterSection";
import { useTheme } from "@/contexts/ThemeContext";
import { Trophy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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

      {/* Right Sidebar */}
      <aside className="hidden lg:block fixed right-6 top-24 w-64 z-30">
        <div className={`sticky top-24 border rounded-lg p-6 ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <h2 className={`text-lg font-bold mb-4 ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            Your Progress
          </h2>
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full justify-between gap-2 ${
                theme === "light"
                  ? "bg-[#1B3C73] text-white hover:bg-[#102B52]"
                  : "bg-[#60A5FA] text-white hover:bg-[#3B82F6]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`} />
            </Button>
            {isDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-2 z-50 border rounded-lg shadow-lg ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <Link
                  href="/badges"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    theme === "light"
                      ? "text-[#2E3A47] hover:bg-[#E8ECF3]"
                      : "text-[#F5F8FC] hover:bg-[#1A2332]"
                  }`}
                >
                  View All
                </Link>
                <Link
                  href="/badges#levels"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg border-t ${
                    theme === "light"
                      ? "text-[#2E3A47] hover:bg-[#E8ECF3] border-[#C8D1E0]"
                      : "text-[#F5F8FC] hover:bg-[#1A2332] border-[#1A2332]"
                  }`}
                >
                  Levels
                </Link>
                <Link
                  href="/badges#badges"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg border-t ${
                    theme === "light"
                      ? "text-[#2E3A47] hover:bg-[#E8ECF3] border-[#C8D1E0]"
                      : "text-[#F5F8FC] hover:bg-[#1A2332] border-[#1A2332]"
                  }`}
                >
                  Badges
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      <LandingNav />

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
