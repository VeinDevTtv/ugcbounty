"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@clerk/nextjs";
import { User, Briefcase, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectionProps {
  onRoleSelected: (role: 'creator' | 'business') => void;
  isLoading?: boolean;
}

export default function RoleSelection({ onRoleSelected, isLoading = false }: RoleSelectionProps) {
  const { theme } = useTheme();
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<'creator' | 'business' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Clear error when role is selected
  useEffect(() => {
    if (selectedRole) {
      setError(null);
    }
  }, [selectedRole]);

  const handleSelectRole = (role: 'creator' | 'business') => {
    setSelectedRole(role);
    setError(null);
    setRetryCount(0); // Reset retry count when selecting a new role
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue");
      return;
    }

    // Check if Clerk user is loaded before proceeding
    if (!isLoaded) {
      setError("Please wait for your account to finish loading...");
      return;
    }

    if (!user) {
      setError("You must be signed in to continue. Please sign in and try again.");
      return;
    }

    // Clear any previous errors
    setError(null);
    
    try {
      // Call the parent's role selection handler
      await onRoleSelected(selectedRole);
    } catch (err) {
      // This shouldn't normally catch since onRoleSelected doesn't throw,
      // but we handle it defensively
      console.error('[RoleSelection] Error in role selection:', err);
      setError("Failed to set your role. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className={cn(
          "text-3xl md:text-4xl font-bold mb-4",
          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
        )}>
          Welcome! Let's get started
        </h1>
        <p className={cn(
          "text-lg",
          theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
        )}>
          Are you a Creator or a Business?
        </p>
      </div>

      {error && (
        <div className={cn(
          "mb-6 p-4 rounded-lg border flex items-start gap-3",
          theme === "light" 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-red-900/20 border-red-800 text-red-300"
        )}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            {retryCount > 0 && (
              <p className="text-sm mt-1 opacity-75">
                Attempt {retryCount + 1} - If this persists, please refresh the page.
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setError(null);
              setRetryCount(0);
            }}
            className={cn(
              "text-sm underline",
              theme === "light" ? "text-red-600" : "text-red-400"
            )}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Creator Option */}
        <button
          onClick={() => handleSelectRole('creator')}
          disabled={isLoading}
          className={cn(
            "p-8 rounded-2xl border-2 transition-all text-left",
            "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2",
            selectedRole === 'creator'
              ? theme === "light"
                ? "border-[#1B3C73] bg-[#1B3C73]/5 shadow-md"
                : "border-[#60A5FA] bg-[#60A5FA]/10 shadow-md"
              : theme === "light"
                ? "border-[#C8D1E0] bg-white hover:border-[#7A8CB3]"
                : "border-[#1A2332] bg-[#141B23] hover:border-[#60A5FA]/50",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "p-3 rounded-xl",
              selectedRole === 'creator'
                ? theme === "light"
                  ? "bg-[#1B3C73] text-white"
                  : "bg-[#60A5FA] text-white"
                : theme === "light"
                  ? "bg-[#E8ECF3] text-[#1B3C73]"
                  : "bg-[#0A0F17] text-[#60A5FA]"
            )}>
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className={cn(
                "text-xl font-bold mb-1",
                theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
              )}>
                Creator
              </h3>
              <p className={cn(
                "text-sm",
                theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
              )}>
                Submit content to bounties
              </p>
            </div>
          </div>
          <p className={cn(
            "text-sm leading-relaxed",
            theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
          )}>
            Browse and submit your content to brand bounties. Earn money based on views and engagement.
          </p>
        </button>

        {/* Business Option */}
        <button
          onClick={() => handleSelectRole('business')}
          disabled={isLoading}
          className={cn(
            "p-8 rounded-2xl border-2 transition-all text-left",
            "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2",
            selectedRole === 'business'
              ? theme === "light"
                ? "border-[#1B3C73] bg-[#1B3C73]/5 shadow-md"
                : "border-[#60A5FA] bg-[#60A5FA]/10 shadow-md"
              : theme === "light"
                ? "border-[#C8D1E0] bg-white hover:border-[#7A8CB3]"
                : "border-[#1A2332] bg-[#141B23] hover:border-[#60A5FA]/50",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "p-3 rounded-xl",
              selectedRole === 'business'
                ? theme === "light"
                  ? "bg-[#1B3C73] text-white"
                  : "bg-[#60A5FA] text-white"
                : theme === "light"
                  ? "bg-[#E8ECF3] text-[#1B3C73]"
                  : "bg-[#0A0F17] text-[#60A5FA]"
            )}>
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h3 className={cn(
                "text-xl font-bold mb-1",
                theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
              )}>
                Business
              </h3>
              <p className={cn(
                "text-sm",
                theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
              )}>
                Create and manage bounties
              </p>
            </div>
          </div>
          <p className={cn(
            "text-sm leading-relaxed",
            theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
          )}>
            Create bounties for creators to submit content. Manage campaigns and track performance.
          </p>
        </button>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          size="lg"
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}

