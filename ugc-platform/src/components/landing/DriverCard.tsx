"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Command } from "lucide-react"
import { useEffect, useRef } from "react"
import { useTheme } from "@/contexts/ThemeContext"

export function DriverCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <GlassCard
      ref={cardRef}
      className={`col-span-1 md:col-span-2 min-h-[400px] flex flex-col md:flex-row gap-8 opacity-0 transition-all duration-500 ${
        theme === "light" 
          ? "hover:border-[#1B3C73]/30" 
          : "hover:border-[#60A5FA]/30"
      }`}
    >
      {/* Left side: Bounty List UI */}
      <div className="flex-1 space-y-4">
        <div className={`overflow-hidden rounded-lg border ${
          theme === "light" 
            ? "border-[#C8D1E0]/20 bg-white/10" 
            : "border-white/5 bg-black/20"
        }`}>
          <div className={`grid grid-cols-3 gap-4 p-4 border-b text-[10px] uppercase tracking-wider font-mono ${
            theme === "light" 
              ? "border-[#C8D1E0]/20 bg-white/10 text-[#1B3C73]/70" 
              : "border-white/5 bg-white/5 text-[#60A5FA]/50"
          }`}>
            <div>Bounty Name</div>
            <div className="text-right">Rate/1K</div>
            <div className="text-right">Status</div>
          </div>
          <div className="p-2 space-y-1 font-mono text-xs">
            <div className={`grid grid-cols-3 gap-4 p-2 rounded cursor-pointer group transition-all duration-200 ${
              theme === "light" ? "hover:bg-white/10" : "hover:bg-white/5"
            }`}>
              <div className={`transition-colors ${
                theme === "light" 
                  ? "text-[#1B3C73] group-hover:text-[#1B3C73]" 
                  : "text-[#60A5FA]/80 group-hover:text-white"
              }`}>TikTok Dance Challenge</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>$5.00</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>Active</div>
            </div>
            <div className={`grid grid-cols-3 gap-4 p-2 rounded cursor-pointer relative transition-all duration-200 ${
              theme === "light" ? "hover:bg-white/10" : "hover:bg-white/5"
            }`}>
              <div className={
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]/80"
              }>Product Review</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>$8.50</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>Active</div>

              {/* Loading Spinner overlay */}
              <div className="absolute left-[30%] top-1/2 -translate-y-1/2">
                <div className={`w-4 h-4 rounded-full border animate-spin ${
                  theme === "light"
                    ? "border-[#1B3C73]/30 border-t-[#1B3C73]"
                    : "border-[#60A5FA]/30 border-t-[#60A5FA]"
                }`} />
              </div>
            </div>
            <div className={`grid grid-cols-3 gap-4 p-2 rounded cursor-pointer group transition-all duration-200 ${
              theme === "light" ? "hover:bg-white/10" : "hover:bg-white/5"
            }`}>
              <div className={`transition-colors ${
                theme === "light" 
                  ? "text-[#1B3C73] group-hover:text-[#1B3C73]" 
                  : "text-[#60A5FA]/80 group-hover:text-white"
              }`}>Brand Story</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>$12.00</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>Active</div>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 text-xs font-mono pt-2 pl-1 cursor-pointer transition-colors ${
          theme === "light" 
            ? "text-[#52677C]/70 hover:text-[#52677C]" 
            : "text-[#B8C5D6]/50 hover:text-[#B8C5D6]/70"
        }`}>
          <span>+ Browse more bounties</span>
        </div>

        {/* Command Palette Mock */}
        <div className="mt-8 relative">
          <div className={`rounded-lg p-3 flex items-center gap-3 w-48 mx-auto shadow-2xl transition-all duration-300 ${
            theme === "light" 
              ? "bg-white/20 backdrop-blur-xl border border-[#C8D1E0]/30 hover:border-[#1B3C73]/30" 
              : "bg-black/40 backdrop-blur-xl border border-white/10 hover:border-[#60A5FA]/30"
          }`}>
            <Command className={`w-3 h-3 ${
              theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
            }`} />
            <span className={`text-[10px] font-mono ${
              theme === "light" ? "text-[#1B3C73]" : "text-cyan-100"
            }`}>search</span>
            <span className={`text-[10px] ml-auto ${
              theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
            }`}>/</span>
            <span className={`text-[10px] px-1 rounded ${
              theme === "light" 
                ? "text-[#1B3C73] bg-white/20" 
                : "text-cyan-100 bg-white/10"
            }`}>K</span>
          </div>
        </div>
      </div>

      {/* Right side: Explanation */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-1.5 rounded ${
            theme === "light" 
              ? "bg-[#1B3C73]/20 text-[#1B3C73]" 
              : "bg-[#60A5FA]/20 text-[#60A5FA]"
          }`}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className={`font-serif italic text-3xl ${
            theme === "light" ? "text-[#1B3C73]" : "text-white"
          }`}>Bounty Discovery</h3>
        </div>
        <p className={`font-mono text-xs leading-relaxed ${
          theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
        }`}>
          Browse through hundreds of active bounties from brands looking for creators. Each bounty shows the payout rate,
          requirements, and current status. Filter by platform, payout rate, or brand to find opportunities that match your style.
        </p>
      </div>
    </GlassCard>
  )
}

