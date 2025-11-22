"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Toast from "@/components/Toast";
import { useTheme } from "@/contexts/ThemeContext";
import { DollarSign, CreditCard, Building2, ArrowDownCircle, AlertCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethod = "card" | "bank" | "stripe";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: "completed" | "pending" | "failed";
}

export default function AddFundsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const [userRole, setUserRole] = useState<'creator' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance] = useState(0.00); // Placeholder balance
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [showToast, setShowToast] = useState(false);
  const [transactions] = useState<Transaction[]>([]); // Empty for now, or add placeholder data

  // Fetch user role and verify it's business
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

          // Redirect if not a business
          if (role !== 'business') {
            if (role === 'creator') {
              router.replace('/feed');
            } else {
              router.replace('/dashboard');
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

  const handleAddFunds = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    // Show success toast (no real payment)
    setShowToast(true);
    // Reset form after showing toast
    setTimeout(() => {
      setAmount("");
    }, 1000);
  };

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
  if (userRole !== 'business') {
    return null;
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return 'Card';
      case 'bank':
        return 'Bank Transfer';
      case 'stripe':
        return 'Stripe';
      default:
        return method;
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification */}
        <Toast
          message="Funds added successfully! (Demo - no real payment processed)"
          show={showToast}
          onClose={() => setShowToast(false)}
        />

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
              This is a preview interface. No real payments or transactions are processed.
            </p>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
          }`}>
            Billing & Add Funds
          </h1>
          <p className={`mt-2 ${
            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
          }`}>
            Manage your account balance and add funds to create bounties
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
                Current Balance / Credits
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
              <Wallet className={`h-8 w-8 ${
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
              }`} />
            </div>
          </div>
        </div>

        {/* Add Funds Section */}
        <div className={`border rounded-lg p-6 mb-8 ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <h2 className={`text-xl font-bold mb-6 ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            Add Funds
          </h2>

          {/* Amount Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              theme === "light" ? "text-[#52677C]" : "text-[#F5F8FC]"
            }`}>
              Amount ($)
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
              }`} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  theme === "light"
                    ? "border-[#C8D1E0] bg-white text-[#2E3A47] placeholder:text-[#6B7A8F] focus:ring-[#7A8CB3]/20 focus:border-[#7A8CB3]"
                    : "border-[#1A2332] bg-[#141B23] text-[#F5F8FC] placeholder:text-[#64748B] focus:ring-[#60A5FA]/20 focus:border-[#60A5FA]"
                }`}
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${
              theme === "light" ? "text-[#52677C]" : "text-[#F5F8FC]"
            }`}>
              Payment Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card Option */}
              <button
                onClick={() => setSelectedMethod("card")}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  selectedMethod === "card"
                    ? theme === "light"
                      ? "bg-[#E8ECF3] border-[#1B3C73] ring-2 ring-[#1B3C73]/20"
                      : "bg-[#0A0F17] border-[#60A5FA] ring-2 ring-[#60A5FA]/20"
                    : theme === "light"
                    ? "bg-white border-[#C8D1E0] hover:border-[#1B3C73]"
                    : "bg-[#141B23] border-[#1A2332] hover:border-[#60A5FA]"
                )}
              >
                <CreditCard className={`h-6 w-6 mb-2 ${
                  selectedMethod === "card"
                    ? theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
                    : theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                }`} />
                <p className={`font-medium ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  Card
                </p>
              </button>

              {/* Bank Transfer Option */}
              <button
                onClick={() => setSelectedMethod("bank")}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  selectedMethod === "bank"
                    ? theme === "light"
                      ? "bg-[#E8ECF3] border-[#1B3C73] ring-2 ring-[#1B3C73]/20"
                      : "bg-[#0A0F17] border-[#60A5FA] ring-2 ring-[#60A5FA]/20"
                    : theme === "light"
                    ? "bg-white border-[#C8D1E0] hover:border-[#1B3C73]"
                    : "bg-[#141B23] border-[#1A2332] hover:border-[#60A5FA]"
                )}
              >
                <Building2 className={`h-6 w-6 mb-2 ${
                  selectedMethod === "bank"
                    ? theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
                    : theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                }`} />
                <p className={`font-medium ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  Bank Transfer
                </p>
              </button>

              {/* Stripe Option */}
              <button
                onClick={() => setSelectedMethod("stripe")}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  selectedMethod === "stripe"
                    ? theme === "light"
                      ? "bg-[#E8ECF3] border-[#1B3C73] ring-2 ring-[#1B3C73]/20"
                      : "bg-[#0A0F17] border-[#60A5FA] ring-2 ring-[#60A5FA]/20"
                    : theme === "light"
                    ? "bg-white border-[#C8D1E0] hover:border-[#1B3C73]"
                    : "bg-[#141B23] border-[#1A2332] hover:border-[#60A5FA]"
                )}
              >
                <ArrowDownCircle className={`h-6 w-6 mb-2 ${
                  selectedMethod === "stripe"
                    ? theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
                    : theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                }`} />
                <p className={`font-medium ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  Stripe
                </p>
              </button>
            </div>
          </div>

          {/* Add Funds Button */}
          <Button
            onClick={handleAddFunds}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full rounded-lg ${
              theme === "light"
                ? "bg-[#1B3C73] text-white hover:bg-[#102B52]"
                : "bg-[#60A5FA] text-white hover:bg-[#3B82F6]"
            }`}
          >
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
        </div>

        {/* Transactions Section */}
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
              Transactions
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
                    Method
                  </th>
                  <th className={`px-6 py-4 font-medium ${
                    theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                  }`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={theme === "light" ? "divide-y divide-gray-200" : "divide-y divide-gray-800"}>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-6 py-12 text-center ${
                      theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                    }`}>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ArrowDownCircle className={`h-8 w-8 ${
                          theme === "light" ? "text-gray-400" : "text-[#B8C5D6]"
                        }`} />
                        <p>No transactions yet</p>
                        <p className={`text-sm ${
                          theme === "light" ? "text-gray-500" : "text-[#64748B]"
                        }`}>
                          Your transaction history will appear here once you add funds
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className={theme === "light" ? "hover:bg-gray-50" : "hover:bg-[#0A0F17]/50"}>
                      <td className={`px-6 py-4 ${
                        theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                      }`}>
                        {formatDate(transaction.date)}
                      </td>
                      <td className={`px-6 py-4 font-medium ${
                        theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                      }`}>
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 ${
                        theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                      }`}>
                        {getMethodLabel(transaction.method)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

