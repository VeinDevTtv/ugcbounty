"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/Modal"; 
import { PlusCircle, LayoutDashboard, Compass, LogIn, UploadCloud, Bell, Menu } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    platform: "TikTok",
    notes: ""
  });

  // --- HANDLERS ---
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ url: "", platform: "TikTok", notes: "" });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-2 group">
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
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <Compass className="h-4 w-4" /> Feed
            </Link>

            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          {/* Auth + Actions */}
          <div className="flex items-center gap-4">
            {!isLoaded ? (
              <div className="h-8 w-8 bg-zinc-100 rounded-full animate-pulse" />
            ) : isSignedIn ? (
              <>
                <Button 
                  size="sm" 
                  onClick={() => setIsModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Submit Work</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hidden sm:flex">
                  <Bell className="h-5 w-5 text-zinc-600" />
                </Button>

                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">Log in</Button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <Button size="sm" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" className="md:hidden p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Your Work"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">Content URL</label>
            <input
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              required
              type="url"
              placeholder="https://tiktok.com/@user/video/..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:bor
