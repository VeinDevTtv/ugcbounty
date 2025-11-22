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
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
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
        headers: {
          "Content-Type": "application/json",
        },
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

      // Reset form and close modal
      setBountyName("");
      setBountyDescription("");
      setTotalBounty("");
      setRatePer1k("");
      setCompanyName("");
      setLogoFile(null);
      setLogoPreview(null);
      setShowCreateModal(false);
      setError(null);

      // Refresh the page to show new bounty
      router.refresh();
    } catch (error) {
      console.error("Error creating bounty:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create bounty. Please try again."
      );
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
            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-emerald-50">
              <Image
                src="/bountea-logo.png" // put the file in public/bountea-logo.png
                alt="Bount-tea logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Bountea
            </span>
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
            {isLoaded && user && (
              <Link
                href="/profile"
                className="text-sm font-medium text-zinc-600 hover:text-emerald-600"
              >
                My Profile
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button
                onClick={handleCreateClick}
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

      {/* Create Bounty Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-2xl max-w-lg w-full rounded-lg border border-zinc-200">
            <div className="flex justify-between items-start p-6 border-b border-zinc-200">
              <h2 className="text-2xl font-bold text-zinc-900">
                Create New Bounty
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-zinc-500 hover:text-zinc-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Bounty Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bountyName}
                  onChange={(e) => setBountyName(e.target.value)}
                  placeholder="e.g., Sushi Hat Challenge"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-emerald-600 file:text-white file:font-semibold hover:file:bg-emerald-700 file:cursor-pointer cursor-pointer"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain border border-zinc-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bountyDescription}
                  onChange={(e) => setBountyDescription(e.target.value)}
                  placeholder="Describe what creators should do..."
                  rows={3}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Total Bounty ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={totalBounty}
                  onChange={(e) => setTotalBounty(e.target.value)}
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Rate per 1k Views ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={ratePer1k}
                  onChange={(e) => setRatePer1k(e.target.value)}
                  placeholder="8"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleCreateBounty}
                  disabled={
                    !bountyName ||
                    !bountyDescription ||
                    !totalBounty ||
                    !ratePer1k ||
                    isCreating
                  }
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Bounty"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
