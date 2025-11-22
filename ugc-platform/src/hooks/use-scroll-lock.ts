"use client";

import { useEffect } from "react";

/**
 * Hook to lock/unlock body scroll while preserving scroll position
 * Prevents background scrolling when modals are open
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    // Save current scroll position
    const scrollY = window.scrollY;
    
    // Lock scroll by setting overflow hidden and preserving position
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      // Restore scroll position and unlock
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

