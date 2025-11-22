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
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { X } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-[#F5EEDC] backdrop-blur-md">
        {/* use min-h instead of fixed h so logo can breathe */}
        <div className="container mx-auto flex min-h-20 items-center justify-between px-4 py-2">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            {/* Wrapper controls logo size responsively */}
            <div className="relative h-12 w-36 md:h-14 md:w-40">
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
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600"
            >
              Feed
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600"
            >
              Dashboard
            </Link>
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

      {/* MODAL — unchanged */}
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

            {/* form continues… (unchanged) */}
          </div>
        </div>
      )}
    </>
  );
}
