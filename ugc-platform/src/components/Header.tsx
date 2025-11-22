"use client";

import {
  SignInButton,
  SignUpButton,
  useUser,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/Button";
import { X } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      {/* NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#1B263B] bg-[#0D1B2A] backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex min-h-24 items-center justify-between px-4 py-3">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-16 w-44 md:h-20 md:w-52">
              <Image
                src="/bountea.png"
                alt="Bountea Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* NAVIGATION LINKS (Desktop) */}
          <div className="hidden md:flex items-center gap-3 bg-[#1B263B]/80 px-3 py-1 rounded-full shadow-sm">
            {[
              { href: "/", label: "Feed" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/profile", label: "My Profile" },
            ].map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-2 text-sm lg:text-base font-semibold rounded-full transition-all ${
                    isActive
                      ? "bg-[#415A77] text-white shadow-sm border border-[#1B263B]"
                      : "text-[#E0E5EB] hover:text-[#AFC6E9] hover:bg-[#1B263B]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDE AUTH + BUTTONS */}
          <div className="flex items-center gap-3">
            {isLoaded && (
              <>
                {/* CREATE BOUNTY BUTTON */}
                <SignedIn>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    size="sm"
                    className="rounded-full bg-[#778DA9] text-[#0D1B2A] px-6 py-2 text-sm font-semibold shadow-sm hover:bg-[#5A6F87]"
                  >
                    Create Bounty
                  </Button>
                </SignedIn>

                {/* SIGN IN / SIGN UP */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-[#E0E5EB] hover:text-white hover:bg-[#1B263B]"
                    >
                      Sign In
                    </Button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <Button
                      size="sm"
                      className="rounded-full bg-[#778DA9] text-[#0D1B2A] hover:bg-[#5A6F87]"
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>

                {/* USER PFP */}
                <SignedIn>
                  <Link href="/profile">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="Profile"
                          className="h-9 w-9 rounded-full border-2 border-[#1B263B] bg-[#1B263B]"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#1B263B] flex items-center justify-center text-[#E0E5EB] font-semibold text-sm border-2 border-[#415A77]">
                          {user?.username?.[0]?.toUpperCase() ||
                            user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ||
                            "U"}
                        </div>
                      )}
                    </div>
                  </Link>
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Create Modal - unchanged */}
    </>
  );
}
