"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"

export function FooterSection() {
  const { theme } = useTheme()

  const headingColor = theme === "light"
    ? "text-transparent bg-clip-text bg-gradient-to-br from-[#1B3C73] to-[#2E3A47]"
    : "text-transparent bg-clip-text bg-gradient-to-br from-[#60A5FA] to-[#B8C5D6]"

  const buttonBg = theme === "light"
    ? "bg-[#1B3C73] text-white hover:bg-[#102B52] hover:shadow-[0_0_30px_rgba(27,60,115,0.5)]"
    : "bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:shadow-[0_0_30px_rgba(96,165,250,0.5)]"

  const footerText = theme === "light"
    ? "text-[#52677C]/40"
    : "text-[#B8C5D6]/40"

  return (
    <footer className={`relative px-6 md:px-12 max-w-7xl mx-auto py-32 mt-12 border-t ${
      theme === "light" ? "border-[#C8D1E0]/20" : "border-white/5"
    }`}>
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 mb-20">
        <SignedOut>
          <h2
            className={`font-serif italic text-6xl md:text-8xl lg:text-[8rem] leading-[1.1] ${headingColor} pb-4`}
            style={{ lineHeight: "1.1" }}
          >
            Get started <br className="hidden md:block" /> today
          </h2>
          <SignUpButton mode="modal">
            <button
              className={`${buttonBg} rounded-full p-4 md:p-6 hover:scale-110 transition-all duration-300 cursor-pointer hover:rotate-12`}
            >
              <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12" />
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <h2
            className={`font-serif italic text-6xl md:text-8xl lg:text-[8rem] leading-[1.1] ${headingColor} pb-4`}
            style={{ lineHeight: "1.1" }}
          >
            Continue the <br className="hidden md:block" /> hunting
          </h2>
          <Link href="/feed">
            <button
              className={`${buttonBg} rounded-full p-4 md:p-6 hover:scale-110 transition-all duration-300 cursor-pointer hover:rotate-12`}
            >
              <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12" />
            </button>
          </Link>
        </SignedIn>
      </div>

      <div className={`flex flex-col md:flex-row justify-between items-end text-[10px] font-mono tracking-widest uppercase ${footerText}`}>
        <div className="flex items-center gap-2">
          <span>©2025</span>
          <span>+</span>
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <span>BOUNTEA</span>
          </Link>
        </div>
        <div className={`writing-vertical-lr rotate-180 hidden md:block opacity-50 ${
          theme === "light" ? "text-[#52677C]/30" : "text-[#B8C5D6]/30"
        }`}>CREATORS</div>
      </div>
    </footer>
  )
}

