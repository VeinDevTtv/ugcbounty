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
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export function LandingNav() {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { href: "/feed", label: "Feed" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "My Profile" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
      theme === "light" 
        ? "bg-[#E8ECF3]/80 backdrop-blur-md border-b border-[#C8D1E0]/50" 
        : "bg-[#0A0F17]/80 backdrop-blur-md border-b border-[#1A2332]/50"
    }`}>
      <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] items-center min-h-24 px-4 py-3 font-sans">
        {/* LEFT: LOGO */}
        <div className="flex items-center">
          <Logo href="/" />
        </div>

        {/* CENTER: NAVBAR PILL CONTAINER */}
        <div className="flex items-center justify-center">
          {/* Signed In: Navigation Pills */}
          <SignedIn>
            <div className={`hidden md:flex items-center gap-3 px-3 py-1 rounded-full shadow-sm ${
              theme === "light" 
                ? "bg-white/60 border border-[#D9E1EF]" 
                : "bg-[#141B23]/60"
            }`}>
              {navItems.map((item) => {
                const isActive = item.href === "/feed"
                  ? pathname === "/feed"
                  : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-5 py-2 text-sm lg:text-base font-semibold rounded-full transition-all ${
                      isActive
                        ? theme === "light"
                          ? "bg-[#1B3C73] text-white shadow border border-[#102B52]"
                          : "bg-[#141B23] text-[#F5F8FC] shadow-sm"
                        : theme === "light"
                        ? "text-[#2E3A47] hover:text-[#4F6FA8] hover:bg-[#DDE5F2]"
                        : "text-[#F5F8FC] hover:text-[#60A5FA] hover:bg-[#141B23]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SignedIn>
        </div>

        {/* RIGHT: THEME TOGGLE + AUTH BUTTONS / USER BUTTON */}
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
          
          {isLoaded && (
            <>
              {/* Signed Out: Auth Buttons */}
              <SignedOut>
                <div className={`hidden md:flex items-center gap-3 px-3 py-1 rounded-full shadow-sm ${
                  theme === "light" 
                    ? "bg-white/60 border border-[#D9E1EF]" 
                    : "bg-[#141B23]/60"
                }`}>
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full ${
                        theme === "light"
                          ? "text-[#2E3A47] hover:text-[#1B3C73] hover:bg-[#DDE5F2]"
                          : "text-[#F5F8FC] hover:bg-[#141B23]"
                      }`}
                    >
                      Sign In
                    </Button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <Button
                      size="sm"
                      className={`rounded-full ${
                        theme === "light"
                          ? "bg-[#7A8CB3] text-white hover:bg-[#6A7AA0]"
                          : "bg-[#141B23] text-white border border-[#1A2332] hover:bg-[#1F2937]"
                      }`}
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              </SignedOut>

              {/* Signed In: User Avatar */}
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

