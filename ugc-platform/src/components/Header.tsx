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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      setError(null);
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBounty = async () => {
    if (!bountyName || !bountyDescription || !totalBounty || !ratePer1k) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      let logoUrl = null;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const uploadResponse = await fetch("/api/upload-logo", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || "Failed to upload logo");
        }

        const uploadResult = await uploadResponse.json();
        logoUrl = uploadResult.url;
      }

      const response = await fetch("/api/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bountyName,
          description: bountyDescription,
          totalBounty: parseFloat(totalBounty),
          ratePer1kViews: parseFloat(ratePer1k),
          companyName: companyName || null,
          logoUrl: logoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create bounty");
      }

      setBountyName("");
      setBountyDescription("");
      setTotalBounty("");
      setRatePer1k("");
      setCompanyName("");
      setLogoFile(null);
      setLogoPreview(null);
      setShowCreateModal(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating bounty:", error);
      setError(error instanceof Error ? error.message : "Failed to create bounty. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setError(null);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9">
              <Image
                src="/mnt/data/11a341fc-04a2-44ae-9c4a-e0874d0e67e6.png"
                alt="Bountea Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Bountea
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-emerald-600">
              Feed
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-emerald-600">
              Dashboard
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button onClick={handleCreateClick} size="sm" className="hidden md:flex">
                Create Bounty
              </Button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign In</Button>
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
