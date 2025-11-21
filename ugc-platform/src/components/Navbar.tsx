import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Button } from "./ui/Button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                        B
                    </div>
                    <span className="text-xl font-bold tracking-tight text-zinc-900">BountyHunted</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-indigo-600">
                        Feed
                    </Link>
                    <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-indigo-600">
                        Dashboard
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <Button variant="ghost" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
