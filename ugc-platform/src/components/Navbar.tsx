"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/Modal"; 
import { PlusCircle, LayoutDashboard, Compass, LogIn, UploadCloud, Bell, Menu } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API Call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("Form Submitted:", formData);
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ url: "", platform: "TikTok", notes: "" }); // Reset form
    
    // Optional: Trigger a toast here if you have a toast context
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              🍵
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Bount-tea
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

          {/* Auth & Actions Area */}
          <div className="flex items-center gap-4">
            {!isLoaded ? (
              // Loading Skeleton
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
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu Button (Placeholder for now) */}
            <Button variant="ghost" className="md:hidden p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* --- SUBMISSION MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Your Work"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">Content URL</label>
            <div className="relative">
              <input
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                type="url"
                placeholder="https://tiktok.com/@user/video/..."
                required
                className="w-full rounded-xl border border-zinc-300 pl-4 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">Paste the direct link to your published post.</p>
          </div>

          {/* Platform Select */}
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none bg-white"
            >
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram Reels</option>
              <option value="YouTube">YouTube Shorts</option>
              <option value="Twitter">Twitter / X</option>
            </select>
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any extra details about your submission..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? 'Submitting...' : (
                <>
                  <UploadCloud className="h-4 w-4" /> Submit
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
