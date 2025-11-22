"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import RoleSelection from "@/components/onboarding/RoleSelection";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSettingRole, setIsSettingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectingRef = useRef(false);

  // Check if user has a role
  useEffect(() => {
    const checkUserRole = async () => {
      // Prevent re-running if redirect is already in progress
      if (redirectingRef.current) {
        return;
      }

      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Use sync-user-profile API to get current user profile
        const response = await fetch('/api/sync-user-profile');
        if (response.ok) {
          const result = await response.json();
          const role = result?.data?.role || null;
          setUserRole(role);

          // If user already has a role, redirect to appropriate page
          if (role === 'creator') {
            redirectingRef.current = true;
            router.replace('/feed');
            return;
          } else if (role === 'business') {
            redirectingRef.current = true;
            router.replace('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // Don't show error for role check - just allow user to proceed
        // The set-role API will handle profile creation if needed
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [user, isLoaded, router]);

  const handleRoleSelected = async (role: 'creator' | 'business') => {
    setIsSettingRole(true);
    setError(null);
    redirectingRef.current = true;
    
    try {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setIsSettingRole(false);
        redirectingRef.current = false;
        setError('Request timed out. Please check your connection and try again.');
      }, 10000); // 10 second timeout

      const response = await fetch('/api/onboarding/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || errorData.details || 'Failed to set role';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Verify the role was set successfully
      if (!result.success || !result.data) {
        throw new Error('Role was not set successfully. Please try again.');
      }

      // Small delay to ensure state is updated before redirect
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on role using replace to avoid history issues
      if (role === 'creator') {
        router.replace('/feed');
      } else {
        router.replace('/dashboard');
      }
      // Note: isSettingRole will remain true but component will unmount on redirect
    } catch (error) {
      console.error('Error setting role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to set role. Please try again.';
      setError(errorMessage);
      setIsSettingRole(false);
      redirectingRef.current = false;
    }
  };

  // Show loading state while checking authentication or role
  if (!isLoaded || isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
      }`}>
        <div className="text-center">
          <Loader2 className={`h-8 w-8 animate-spin mx-auto mb-4 ${
            theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
          }`} />
          <p className={theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in
  if (!user) {
    router.push('/sign-in');
    return null;
  }

  // If user already has a role, they shouldn't be here (redirect handled in useEffect)
  if (userRole) {
    return null;
  }

  // Show role selection
  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 ${
      theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
    }`}>
      <div className="w-full max-w-4xl">
        {error && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border flex items-start gap-3",
            theme === "light" 
              ? "bg-red-50 border-red-200 text-red-800" 
              : "bg-red-900/20 border-red-800 text-red-300"
          )}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className={cn(
                "text-sm underline",
                theme === "light" ? "text-red-600" : "text-red-400"
              )}
            >
              Dismiss
            </button>
          </div>
        )}
        <RoleSelection 
          onRoleSelected={handleRoleSelected}
          isLoading={isSettingRole}
        />
      </div>
    </div>
  );
}

