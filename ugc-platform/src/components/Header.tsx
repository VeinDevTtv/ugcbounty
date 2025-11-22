"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
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

  // 👇 Just add My Profile here
  const navItems = [
    { href: "/", label: "Feed" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "My Profile" }, // change href if your route is different
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-[#F5EEDC] backdrop-blur-md">
        <div className="container mx-auto flex min-h-24 items-center justify-between px-4 py-3">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-16 w-44 md:h-20 md:w-52">
              <Image
                src="/bountea.png"
                alt="Bountea Logo"
                fill
                priority
                className="object-contain rounded-md"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3 bg-white/40 px-3 py-1 rounded-full shadow-sm">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm lg:text-base font-semibold px-4 py-2 rounded-full transition-all
                  ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-zinc-700 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button
                onClick={() => setShowCreateModal(true)}
                size="sm"
                className="hidden md:flex"
              >
                Create Bounty
              </Button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-2xl max-w-lg w-full rounded-lg border border-zinc-200">
            <div className="flex justify-between items-start p-6 border-b border-zinc-200">
              <h2 className="text-2xl font-bold text-zinc-900">
                Create New Bounty
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* form continues… */}
          </div>
        </div>
      )}
    </>
  );
}
