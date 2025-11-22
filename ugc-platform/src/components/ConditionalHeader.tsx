"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import { LandingNav } from "./landing/LandingNav";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Show LandingNav on landing page, Header on all other pages
  if (pathname === "/") {
    return <LandingNav />;
  }
  
  return <Header />;
}

