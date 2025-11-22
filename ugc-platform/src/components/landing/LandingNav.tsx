"use client";

import {
  SignInButton,
  SignUpButton,
  useUser,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

export function LandingNav() {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 transition-colors ${
      theme === "light" 
        ? "bg-[#E8ECF3]/80 backdrop-blur-md border-b border-[#C8D1E0]/50" 
        : "bg-[#0A0F17]/80 backdrop-blur-md border-b border-[#1A2332]/50"
    }`}>
      <Link href="/" className="flex items-center">
        <div className="relative h-12 w-32 md:h-16 md:w-40">
          <Image
            src="/bountea.png"
            alt="BountyHunted Logo"
            fill
            priority
            className="object-contain"
          />
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/feed"
            className={`text-sm font-medium transition-colors ${
              theme === "light"
                ? "text-[#2E3A47] hover:text-[#1B3C73]"
                : "text-[#B8C5D6] hover:text-[#60A5FA]"
            }`}
          >
            Feed
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors ${
              theme === "light"
                ? "text-[#2E3A47] hover:text-[#1B3C73]"
                : "text-[#B8C5D6] hover:text-[#60A5FA]"
            }`}
          >
            Dashboard
          </Link>
          <SignedIn>
            <Link
              href="/profile"
              className={`text-sm font-medium transition-colors ${
                theme === "light"
                  ? "text-[#2E3A47] hover:text-[#1B3C73]"
                  : "text-[#B8C5D6] hover:text-[#60A5FA]"
              }`}
            >
              Profile
            </Link>
          </SignedIn>
        </nav>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Auth Buttons */}
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  theme === "light"
                    ? "text-[#1B3C73] hover:bg-white/60"
                    : "text-[#60A5FA] hover:bg-[#141B23]/60"
                }`}
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  theme === "light"
                    ? "bg-[#1B3C73] text-white hover:bg-[#102B52]"
                    : "bg-[#60A5FA] text-white hover:bg-[#3B82F6]"
                }`}
              >
                Get Started
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
}

