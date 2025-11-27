"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not loaded yet. Please try again.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Trigger form validation
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Form validation failed");
        setIsProcessing(false);
        if (onError) onError(submitError.message || "Form validation failed");
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        const errorMsg = error.message || "Payment failed";
        setErrorMessage(errorMsg);
        if (onError) onError(errorMsg);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        className={`p-4 rounded-lg border ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}
      >
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            theme === "light"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-red-900/20 text-red-400 border border-red-500/30"
          }`}
        >
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className={`w-full rounded-lg ${
          theme === "light"
            ? "bg-[#1B3C73] text-white hover:bg-[#102B52]"
            : "bg-[#60A5FA] text-white hover:bg-[#3B82F6]"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <>
            <span className="mr-2">Processing...</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

