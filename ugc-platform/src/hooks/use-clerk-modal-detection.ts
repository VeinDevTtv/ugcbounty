"use client";

import { useEffect, useState } from "react";
import { useScrollLock } from "./use-scroll-lock";

/**
 * Hook to detect Clerk modals and lock scroll when they're open
 * Uses MutationObserver to watch for Clerk modal elements
 */
export function useClerkModalDetection() {
  const [isClerkModalOpen, setIsClerkModalOpen] = useState(false);

  useEffect(() => {
    // Clerk modals typically have these selectors
    const clerkModalSelectors = [
      '[data-clerk-modal]',
      '[id^="clerk-"]',
      '.cl-modal',
      '[class*="clerk"]',
      // Clerk's actual modal container classes
      '[class*="cl-rootBox"]',
      '[class*="cl-modalContent"]',
    ];

    const checkForClerkModal = (): boolean => {
      return clerkModalSelectors.some((selector) => {
        try {
          const element = document.querySelector(selector);
          if (element) {
            // Check if modal is visible
            const style = window.getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
          }
        } catch {
          // Ignore invalid selectors
        }
        return false;
      });
    };

    // Initial check - use setTimeout to avoid synchronous setState
    const initialCheck = () => {
      setIsClerkModalOpen(checkForClerkModal());
    };
    const timeoutId = setTimeout(initialCheck, 0);

    // Watch for changes in the DOM
    const observer = new MutationObserver(() => {
      setIsClerkModalOpen(checkForClerkModal());
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "id", "data-clerk-modal"],
    });

    // Also check periodically as a fallback
    const interval = setInterval(() => {
      setIsClerkModalOpen(checkForClerkModal());
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Lock scroll when Clerk modal is detected
  useScrollLock(isClerkModalOpen);
}

