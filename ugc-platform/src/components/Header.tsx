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
  const [bountyName, setBountyName] = useState("");
  const [bountyDescription, setBountyDescription] = useState("");
  const [bountyInstructions, setBountyInstructions] = useState("");
  const [totalBounty, setTotalBounty] = useState("");
  const [ratePer1k, setRatePer1k] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBounty = async () => {
    if (bountyName && bountyDescription && totalBounty && ratePer1k) {
      try {
        setIsCreating(true);

        let logoUrl = null;
        if (logoFile) {
          const formData = new FormData();
          formData.append('file', logoFile);
          
          const uploadResponse = await fetch('/api/upload-logo', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            logoUrl = uploadResult.url;
          }
        }

        const response = await fetch("/api/bounties", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: bountyName,
            description: bountyDescription,
            instructions: bountyInstructions.trim() || null,
            totalBounty: parseFloat(totalBounty),
            ratePer1kViews: parseFloat(ratePer1k),
            companyName: companyName || null,
            logoUrl: logoUrl,
          }),
        });

        if (response.ok) {
          setBountyName("");
          setBountyDescription("");
          setBountyInstructions("");
          setTotalBounty("");
          setRatePer1k("");
          setCompanyName("");
          setLogoFile(null);
          setLogoPreview(null);
          setShowCreateModal(false);
          
          router.push("/");
          router.refresh();
        } else {
          const error = await response.json();
          alert(`Failed to create bounty: ${error.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error creating bounty:", error);
        alert("Failed to create bounty. Please try again.");
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <>
      {/* NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#C8D1E0] bg-[#E8ECF3] backdrop-blur-md shadow">
        <div className="container mx-auto flex min-h-24 items-center justify-between px-4 py-3">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-20 w-48 md:h-24 md:w-56">
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
          <div className="hidden md:flex items-center gap-3 bg-white/60 px-3 py-1 rounded-full shadow-sm border border-[#D9E1EF]">
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
                      ? "bg-[#1B3C73] text-white shadow border border-[#102B52]"
                      : "text-[#2E3A47] hover:text-[#4F6FA8] hover:bg-[#DDE5F2]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex items-center gap-3">
            {isLoaded && (
              <>
                {/* CREATE BOUNTY BUTTON */}
                <SignedIn>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    size="sm"
                    className="rounded-full bg-[#7A8CB3] text-white px-6 py-2 text-sm font-semibold shadow-sm hover:bg-[#6A7AA0]"
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
                      className="rounded-full text-[#2E3A47] hover:text-[#1B3C73] hover:bg-[#DDE5F2]"
                    >
                      Sign In
                    </Button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <Button
                      size="sm"
                      className="rounded-full bg-[#7A8CB3] text-white hover:bg-[#6A7AA0]"
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
                          className="h-9 w-9 rounded-full border-2 border-[#C8D1E0]"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#A7B7D1] flex items-center justify-center text-white font-semibold text-sm border-2 border-[#7A8CB3]">
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
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div 
            className="bg-white shadow-2xl max-w-lg w-full p-6 rounded-lg border border-[#C8D1E0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#2E3A47]">
                Create New Bounty
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#52677C] hover:text-[#2E3A47] text-2xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#52677C] mb-2">
                  Bounty Name
                </label>
                <input
                  type="text"
                  value={bountyName}
                  onChange={(e) => setBountyName(e.target.value)}
                  placeholder="e.g., Sushi Hat Challenge"
                  className="w-full px-4 py-2 border border-[#C8D1E0] bg-white text-[#2E3A47] placeholder-[#6B7A8F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#52677C] mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-2 border border-[#C8D1E0] bg-white text-[#2E3A47] placeholder-[#6B7A8F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#52677C] mb-2">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-2 border border-[#C8D1E0] bg-white text-[#2E3A47] rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#7A8CB3] file:text-white file:font-semibold file:rounded-lg hover:file:bg-[#6A7AA0] file:cursor-pointer cursor-pointer"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-contain border border-[#C8D1E0] rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#52677C] mb-2">
                  Description
                </label>
                <textarea
                  value={bountyDescription}
                  onChange={(e) => setBountyDescription(e.target.value)}
                  placeholder="Describe what creators should do..."
                  rows={3}
                  className="w-full px-4 py-2 border border-[#C8D1E0] bg-white text-[#2E3A47] placeholder-[#6B7A8F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#52677C] mb-2">
                  Instructions (Optional)
                </label>
                <textarea
                  value={bountyInstructions}
                  onChange={(e) => setBountyInstructions(e.target.value)}
                  placeholder="Exact requirements that submitted videos must meet to be accepted..."
                  rows={3}
                  className="w-full px-4 py-2 border border-[#C8D1E0] bg-white text-[#2E3A47] placeholder-[#6B7A8F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3] resize-none"
                />
                <p className="text-xs text-[#6B7A8F] mt-1">
                  These instructions will be used for video validation. If left empty, the description will be used.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#52677C] mb-2">
                  Total Bounty ($)
                </label>
                <input
                  type="number"
                  value={totalBounty}
                  onChange={(e) => setTotalBounty(e.target.value)}
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#C8D1E0] bg-white text-[#2E3A47] placeholder-[#6B7A8F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#52677C] mb-2">
                  Rate per 1k Views ($)
                </label>
                <input
                  type="number"
                  value={ratePer1k}
                  onChange={(e) => setRatePer1k(e.target.value)}
                  placeholder="8"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-[#C8D1E0] bg-white text-[#2E3A47] placeholder-[#6B7A8F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateBounty}
                  disabled={
                    !bountyName ||
                    !bountyDescription ||
                    !totalBounty ||
                    !ratePer1k ||
                    isCreating
                  }
                  className="w-full bg-[#7A8CB3] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#6A7AA0] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7A8CB3]"
                >
                  {isCreating ? "Creating..." : "Create Bounty"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
