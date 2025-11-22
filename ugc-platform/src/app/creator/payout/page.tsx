"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/contexts/ThemeContext";
import { DollarSign, CreditCard, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PayoutPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const [userRole, setUserRole] = useState<'creator' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance] = useState(0.00); // Placeholder balance

  // Fetch user role and verify it's creator
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !isLoaded) {
        return;
      }

      try {
        const response = await fetch('/api/sync-user-profile');
        if (response.ok) {
          const result = await response.json();
          const role = result?.data?.role || null;
          setUserRole(role);

          // Redirect if not a creator
          if (role !== 'creator') {
            if (role === 'business') {
              router.replace('/dashboard');
            } else {
              router.replace('/feed');
            }
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user, isLoaded, router]);

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className={`min-h-screen transition-colors flex items-center justify-center ${
        theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
      }`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          theme === "light" ? "border-[#1B3C73]" : "border-[#60A5FA]"
        }`}></div>
      </div>
    );
  }

  // Don't render if wrong role (redirect is in progress)
  if (userRole !== 'creator') {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors ${
      theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Banner */}
        <div className={`mb-6 rounded-lg border p-4 flex items-start gap-3 ${
          theme === "light"
            ? "bg-amber-50 border-amber-200"
            : "bg-amber-900/20 border-amber-500/30"
        }`}>
          <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
            theme === "light" ? "text-amber-600" : "text-amber-400"
          }`} />
          <div>
            <p className={`text-sm font-medium ${
              theme === "light" ? "text-amber-800" : "text-amber-300"
            }`}>
              Demo UI - Payments not live yet
            </p>
            <p className={`text-xs mt-1 ${
              theme === "light" ? "text-amber-700" : "text-amber-400"
            }`}>
              This is a preview interface. No real payments or payouts are processed.
            </p>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
          }`}>
            Payouts
          </h1>
          <p className={`mt-2 ${
            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
          }`}>
            Manage your earnings and payout methods
          </p>
        </div>

        {/* Current Balance Section */}
        <div className={`border rounded-lg p-6 mb-8 ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm mb-2 ${
                theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
              }`}>
                Available Balance
              </p>
              <p className={`text-4xl font-bold ${
                theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
              }`}>
                ${balance.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${
              theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
            }`}>
              <DollarSign className={`h-8 w-8 ${
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
              }`} />
            </div>
          </div>
        </div>

        {/* Payout Method Section */}
        <div className={`border rounded-lg p-6 mb-8 ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <h2 className={`text-xl font-bold mb-6 ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            Payout Method
          </h2>

          {/* Payment Method Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              className={cn(
                "flex-1 p-4 rounded-lg border text-left transition-all",
                theme === "light"
                  ? "bg-white border-[#C8D1E0] hover:border-[#1B3C73]"
                  : "bg-[#0A0F17] border-[#1A2332] hover:border-[#60A5FA]"
              )}
            >
              <Building2 className={`h-5 w-5 mb-2 ${
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
              }`} />
              <p className={`font-medium ${
                theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
              }`}>
                Bank Account
              </p>
            </button>
            <button
              className={cn(
                "flex-1 p-4 rounded-lg border text-left transition-all",
                theme === "light"
                  ? "bg-white border-[#C8D1E0] hover:border-[#1B3C73]"
                  : "bg-[#0A0F17] border-[#1A2332] hover:border-[#60A5FA]"
              )}
            >
              <CreditCard className={`h-5 w-5 mb-2 ${
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
              }`} />
              <p className={`font-medium ${
                theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
              }`}>
                Stripe Connect
              </p>
            </button>
          </div>

          {/* Bank Account Form Fields */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === "light" ? "text-[#52677C]" : "text-[#F5F8FC]"
              }`}>
                IBAN
              </label>
              <input
                type="text"
                placeholder="GB82 WEST 1234 5698 7654 32"
                disabled
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  theme === "light"
                    ? "border-[#C8D1E0] bg-[#F7FAFC] text-[#2E3A47] placeholder:text-[#6B7A8F] focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                    : "border-[#1A2332] bg-[#0A0F17] text-[#F5F8FC] placeholder:text-[#64748B] focus:ring-[#60A5FA]/20 focus:border-[#60A5FA]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-[#52677C]" : "text-[#F5F8FC]"
                }`}>
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="12345678"
                  disabled
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "light"
                      ? "border-[#C8D1E0] bg-[#F7FAFC] text-[#2E3A47] placeholder:text-[#6B7A8F] focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                      : "border-[#1A2332] bg-[#0A0F17] text-[#F5F8FC] placeholder:text-[#64748B] focus:ring-[#60A5FA]/20 focus:border-[#60A5FA]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-[#52677C]" : "text-[#F5F8FC]"
                }`}>
                  Sort Code
                </label>
                <input
                  type="text"
                  placeholder="12-34-56"
                  disabled
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    theme === "light"
                      ? "border-[#C8D1E0] bg-[#F7FAFC] text-[#2E3A47] placeholder:text-[#6B7A8F] focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                      : "border-[#1A2332] bg-[#0A0F17] text-[#F5F8FC] placeholder:text-[#64748B] focus:ring-[#60A5FA]/20 focus:border-[#60A5FA]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Stripe Connect Button */}
          <div className="mt-6 pt-6 border-t border-[#1A2332]/50">
            <Button
              disabled
              className={`w-full rounded-lg ${
                theme === "light"
                  ? "bg-[#1B3C73] text-white hover:bg-[#102B52]"
                  : "bg-[#141B23] text-white border border-[#1A2332] hover:bg-[#1F2937]"
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Connect Stripe Account
            </Button>
            <p className={`text-xs mt-2 text-center ${
              theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
            }`}>
              Connect your Stripe account for instant payouts
            </p>
          </div>
        </div>

        {/* Payout History Section */}
        <div className={`border rounded-lg overflow-hidden ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <div className={`px-6 py-4 border-b ${
            theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
          }`}>
            <h2 className={`text-xl font-bold ${
              theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
            }`}>
              Payout History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`border-b ${
                theme === "light" ? "bg-gray-50 border-[#C8D1E0]" : "bg-[#0A0F17] border-[#1A2332]"
              }`}>
                <tr>
                  <th className={`px-6 py-4 font-medium ${
                    theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-4 font-medium ${
                    theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                  }`}>
                    Amount
                  </th>
                  <th className={`px-6 py-4 font-medium ${
                    theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                  }`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={theme === "light" ? "divide-y divide-gray-200" : "divide-y divide-gray-800"}>
                <tr>
                  <td colSpan={3} className={`px-6 py-12 text-center ${
                    theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                  }`}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <DollarSign className={`h-8 w-8 ${
                        theme === "light" ? "text-gray-400" : "text-[#B8C5D6]"
                      }`} />
                      <p>No payouts yet</p>
                      <p className={`text-sm ${
                        theme === "light" ? "text-gray-500" : "text-[#64748B]"
                      }`}>
                        Your payout history will appear here once you start earning
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

