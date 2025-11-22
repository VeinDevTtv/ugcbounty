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
import { X, Upload } from "lucide-react";
import Image from "next/image";

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
                onClick={() => {
                  if (!user) {
                    alert("Please sign in to create a bounty");
                    return;
                  }
                  setShowCreateModal(true);
                }}
                size="sm"
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
              <Link href="/profile">
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.username || user.emailAddresses[0]?.emailAddress || "Profile"}
                      className="h-8 w-8 rounded-full border-2 border-zinc-300"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-zinc-300">
                      {user?.username?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </Link>
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

            {/* Form */}
            <form
              onSubmit={handleCreateBounty}
              className="p-6 space-y-4"
            >
              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Bounty Name *
                </label>
                <input
                  type="text"
                  value={bountyName}
                  onChange={(e) => setBountyName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Summer Campaign 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Description *
                </label>
                <textarea
                  value={bountyDescription}
                  onChange={(e) => setBountyDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe what creators should create..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Total Bounty ($) *
                  </label>
                  <input
                    type="number"
                    value={totalBounty}
                    onChange={(e) => setTotalBounty(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Rate per 1k Views ($) *
                  </label>
                  <input
                    type="number"
                    value={ratePer1k}
                    onChange={(e) => setRatePer1k(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="25.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Logo (Optional, max 5MB)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleLogoChange}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {logoPreview && (
                    <div className="relative w-32 h-32 border border-zinc-300 rounded-lg overflow-hidden">
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

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={isCreating}
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

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setLogoFile(file);
    setError(null);

    // Create preview
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

      // Upload logo if provided
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);

        const uploadResponse = await fetch('/api/upload-logo', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Failed to upload logo');
        }

        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      // Create bounty
      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error(errorData.error || 'Failed to create bounty');
      }

      // Success - reset form and close modal
      resetForm();
      setShowCreateModal(false);
      
      // Redirect to home page to show new bounty (like og/)
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the bounty');
    } finally {
      setIsCreating(false);
    }
  }
}
