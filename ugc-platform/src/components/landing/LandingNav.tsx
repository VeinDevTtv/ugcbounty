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
        {/* Navigation Links - Only show when signed in */}
        <SignedIn>
          <nav className="hidden md:flex items-center gap-3">
            <Link
              href="/feed"
              className={`px-4 py-2.5 text-base font-semibold rounded-lg transition-all duration-200 ${
                theme === "light"
                  ? "bg-[#1B3C73] text-white hover:bg-[#102B52] hover:shadow-md"
                  : "bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:shadow-md"
              }`}
            >
              Feed
            </Link>
            <Link
              href="/dashboard"
              className={`px-4 py-2.5 text-base font-semibold rounded-lg transition-all duration-200 ${
                theme === "light"
                  ? "bg-[#1B3C73] text-white hover:bg-[#102B52] hover:shadow-md"
                  : "bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:shadow-md"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2.5 text-base font-semibold rounded-lg transition-all duration-200 ${
                theme === "light"
                  ? "bg-[#1B3C73] text-white hover:bg-[#102B52] hover:shadow-md"
                  : "bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:shadow-md"
              }`}
            >
              My Profile
            </Link>
          </nav>
        </SignedIn>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Auth Buttons */}
        <SignedOut>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  theme === "light"
                    ? "border border-[#1B3C73] text-[#1B3C73] bg-transparent hover:bg-[#1B3C73] hover:text-white hover:shadow-md"
                    : "border border-[#60A5FA] text-[#60A5FA] bg-transparent hover:bg-[#60A5FA] hover:text-white hover:shadow-md"
                }`}
              >
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm ${
                  theme === "light"
                    ? "bg-[#1B3C73] text-white hover:bg-[#102B52] hover:shadow-md"
                    : "bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:shadow-md"
                }`}
              >
                Sign Up
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

