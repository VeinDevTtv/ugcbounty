"use client";

import { usePathname } from "next/navigation";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Landing page handles its own layout
  if (pathname === "/") {
    return <>{children}</>;
  }
  
  // Other pages use the container layout
  return (
    <main className="container mx-auto px-4 py-8">
      {children}
    </main>
  );
}

