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
    const checkForClerkModal = (): boolean => {
      // More specific check - look for Clerk modal portal/overlay that's actually visible
      // Clerk modals are typically rendered in a portal with specific structure
      const possibleModals = document.querySelectorAll('[class*="cl-rootBox"], [class*="cl-modalContent"], [data-clerk-modal]');
      
      for (const element of possibleModals) {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        // Check if element is actually visible and has significant size (modal-like)
        const isVisible = 
          style.display !== "none" && 
          style.visibility !== "hidden" && 
          parseFloat(style.opacity) > 0 &&
          rect.width > 100 && // Modals should be at least 100px wide
          rect.height > 100;  // Modals should be at least 100px tall
        
        // Also check if it's positioned as a modal (fixed or absolute, covering significant area)
        const isPositionedAsModal = 
          (style.position === "fixed" || style.position === "absolute") &&
          (rect.width > window.innerWidth * 0.3 || rect.height > window.innerHeight * 0.3);
        
        if (isVisible && isPositionedAsModal) {
          return true;
        }
      }
      
      return false;
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

