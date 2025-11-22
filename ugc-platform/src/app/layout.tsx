import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css"; // Standard Next.js global css
import ConditionalHeader from "@/components/ConditionalHeader";
import ConditionalMain from "@/components/ConditionalMain";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CursorWrapper from "@/components/CursorWrapper";
import ClerkModalDetector from "@/components/ClerkModalDetector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "bountea | UGC Platform",
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
    <ClerkProvider 
      publishableKey={publishableKey}
      signUpFallbackRedirectUrl="/onboarding"
      afterSignUpUrl="/onboarding"
      afterSignInUrl="/onboarding"
    >
      <ThemeProvider>
        <html lang="en">
          <body className={`${inter.className} min-h-screen`}>
            <CursorWrapper />
            <ClerkModalDetector />
            <ConditionalHeader />
            <ConditionalMain>
              {children}
            </ConditionalMain>
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
