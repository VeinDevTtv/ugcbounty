"use client";

import { SignInButton, SignUpButton, UserButton, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { X } from "lucide-react";

export default function Header() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // modal and form state…
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bountyName, setBountyName] = useState("");
  const [bountyDescription, setBountyDescription] = useState("");
  const [totalBounty, setTotalBounty] = useState("");
  const [ratePer1k, setRatePer1k] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateClick = () => {
    if (!user) {
      alert("Please sign in to create a bounty");
      return;
    }
    setShowCreateModal(true);
    setError(null);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200" 
           style={{ backgroundColor: "#F5EEDC" }}> 
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* LOGO — replaced emoji + text */}
          <Link href="/" className="flex items-center">
            <Image
              src="/mnt/data/ecef494b-4074-4438-be6a-6fe902dd54d9.png"
              alt="Bountea Logo"
              width={42}
              height={42}
              className="object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-700 hover:text-emerald-600">
              Feed
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-700 hover:text-emerald-600">
              Dashboard
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button onClick={handleCreateClick} size="sm" className="hidden md:flex">
                Create Bounty
              </Button>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign In</Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
          </div>

        </div>
      </nav>

      {/* The modal stays the same… */}
    </>
  );
}
