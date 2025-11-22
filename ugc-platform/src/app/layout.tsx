import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import "./globals.css"; // Standard Next.js global css
import Header from "@/components/Header";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Dynamically import Cursor component to avoid SSR issues
const Cursor = dynamic(() => import("@/components/Cursor"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BountyHunted | UGC Platform",
  description: "Find and create content for brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your environment variables. ' +
      'Get your key at https://dashboard.clerk.com/last-active?path=api-keys'
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ThemeProvider>
        <html lang="en">
          <body className={`${inter.className} min-h-screen`}>
            <Cursor />
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
