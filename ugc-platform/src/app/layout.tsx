import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bount-tea | UGC Bounty Platform",
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
      <html lang="en">
        <body className={`${inter.className} antialiased bg-zinc-50`}>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
