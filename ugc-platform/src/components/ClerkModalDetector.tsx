"use client";

import { useClerkModalDetection } from "@/hooks/use-clerk-modal-detection";

/**
 * Client component to detect Clerk modals and lock scroll
 * This component doesn't render anything, it just runs the detection hook
 */
export default function ClerkModalDetector() {
  useClerkModalDetection();
  return null;
}

