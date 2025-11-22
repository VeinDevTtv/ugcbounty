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
import React from "react";

export default function Header() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [bountyName, setBountyName] = useState("");
  const [bountyDescription, setBountyDescription] = useState("");
  const [totalBounty, setTotalBounty] = useState("");
  const [ratePer1k, setRatePer1k] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems = [
    { href: "/", label: "Feed" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "My Profile" },
  ];

  return (
    <>
     {/* HEADER / NAVBAR */}
<nav className="sticky top-0 z-50 w-full border-b border-[#4A4A4A] bg-[#E5E5E5] backdrop-blur-md shadow-sm">
  <div className="container mx-auto flex min-h-24 items-center justify-between px-4 py-3 font-sans">
    
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

    {/* NAV PILLS (desktop) */}
    <div className="hidden md:flex items-center gap-3 bg-[#D1D1D1] px-3 py-1 rounded-full shadow-sm">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-5 py-2 text-sm lg:text-base font-semibold rounded-full transition-all ${
              isActive
                ? "bg-[#C9C9C9] text-[#1F1F1F] shadow-sm border border-[#B5B5B5]"
                : "text-[#3A3A3A] hover:text-black hover:bg-[#CFCFCF]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-3">
      {isLoaded && (
        <>
          {/* CREATE BOUNTY BUTTON */}
          <SignedIn>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              variant="ghost"
              className="rounded-full bg-[#C9C9C9] text-[#1F1F1F] px-6 py-2 text-sm font-semibold shadow-sm hover:bg-[#BEBEBE]"
            >
              Create Bounty
            </Button>
          </SignedIn>

          {/* AUTH BUTTONS */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-[#1F1F1F] hover:bg-[#CFCFCF]"
              >
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="rounded-full bg-[#C9C9C9] text-[#1F1F1F] border border-[#C9C9C9] hover:bg-[#BEBEBE]"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          {/* USER AVATAR */}
          <SignedIn>
            <Link href="/profile">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border-2 border-[#A5A5A5] bg-[#D1D1D1]"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#BBBBBB] flex items-center justify-center text-[#1F1F1F] font-semibold text-sm border-2 border-[#A5A5A5]">
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

      {/* CREATE BOUNTY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#25160F] shadow-2xl max-w-lg w-full rounded-lg border border-[#3A2518]">
            <div className="flex justify-between items-start p-6 border-b border-[#3A2518]">
              <h2 className="text-2xl font-bold text-[#F7F1E8]">
                Create New Bounty
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#CBB8A4] hover:text-[#F7F1E8] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBounty} className="p-6 space-y-4">
              {error && (
                <div className="rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Bounty Name */}
              <div>
                <label className="block text-sm font-medium text-[#F7F1E8] mb-2">
                  Bounty Name *
                </label>
                <input
                  type="text"
                  value={bountyName}
                  onChange={(e) => setBountyName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#3A2518] bg-[#140E0B] text-[#F7F1E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47A53]/20 focus:border-[#C47A53] placeholder:text-[#A38E7A]"
                  placeholder="e.g., Duo World Voices Campaign"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#F7F1E8] mb-2">
                  Description *
                </label>
                <textarea
                  value={bountyDescription}
                  onChange={(e) => setBountyDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-[#3A2518] bg-[#140E0B] text-[#F7F1E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47A53]/20 focus:border-[#C47A53] placeholder:text-[#A38E7A]"
                  placeholder="Describe what creators should create..."
                />
              </div>

              {/* Money fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F7F1E8] mb-2">
                    Total Bounty ($) *
                  </label>
                  <input
                    type="number"
                    value={totalBounty}
                    onChange={(e) => setTotalBounty(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-[#3A2518] bg-[#140E0B] text-[#F7F1E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47A53]/20 focus:border-[#C47A53] placeholder:text-[#A38E7A]"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F7F1E8] mb-2">
                    Rate per 1k Views ($) *
                  </label>
                  <input
                    type="number"
                    value={ratePer1k}
                    onChange={(e) => setRatePer1k(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-[#3A2518] bg-[#140E0B] text-[#F7F1E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47A53]/20 focus:border-[#C47A53] placeholder:text-[#A38E7A]"
                    placeholder="25.00"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-[#F7F1E8] mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#3A2518] bg-[#140E0B] text-[#F7F1E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47A53]/20 focus:border-[#C47A53] placeholder:text-[#A38E7A]"
                  placeholder="Duolingo"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-[#F7F1E8] mb-2">
                  Logo (Optional, max 5MB)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleLogoChange}
                    className="w-full px-4 py-2 border border-[#3A2518] bg-[#140E0B] text-[#F7F1E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47A53]/20 focus:border-[#C47A53] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#E7D0B0] file:text-[#3B2415] hover:file:bg-[#D4BA96]"
                  />
                  {logoPreview && (
                    <div className="relative w-32 h-32 border border-[#3A2518] rounded-lg overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#3A2518]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={isCreating}
                  className="rounded-full border-[#3A2518] text-[#F7F1E8] hover:bg-[#25160F]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isCreating ||
                    !bountyName.trim() ||
                    !bountyDescription.trim() ||
                    !totalBounty ||
                    !ratePer1k ||
                    Number(totalBounty) <= 0 ||
                    Number(ratePer1k) <= 0
                  }
                  className="rounded-full px-6 bg-[#E7D0B0] text-[#3B2415] hover:bg-[#D4BA96]"
                >
                  {isCreating ? "Creating..." : "Create Bounty"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  // === helpers ===

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setLogoFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setBountyName("");
    setBountyDescription("");
    setTotalBounty("");
    setRatePer1k("");
    setCompanyName("");
    setLogoFile(null);
    setLogoPreview(null);
    setError(null);
  }

  async function handleCreateBounty(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      let logoUrl: string | null = null;

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

        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      const response = await fetch("/api/bounties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: bountyName.trim(),
          description: bountyDescription.trim(),
          totalBounty: Number(totalBounty),
          ratePer1kViews: Number(ratePer1k),
          companyName: companyName.trim() || undefined,
          logoUrl: logoUrl || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create bounty");
      }

      resetForm();
      setShowCreateModal(false);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the bounty"
      );
    } finally {
      setIsCreating(false);
    }
  }
}
