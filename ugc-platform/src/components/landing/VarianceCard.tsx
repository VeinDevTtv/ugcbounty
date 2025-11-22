"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { TrendingDown } from "lucide-react"
import { useEffect, useRef } from "react"
import { useTheme } from "@/contexts/ThemeContext"

export function VarianceCard() {
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
      className={`col-span-1 min-h-[400px] flex flex-col opacity-0 transition-all duration-500 ${
        theme === "light" 
          ? "hover:border-[#1B3C73]/30" 
          : "hover:border-[#60A5FA]/30"
      }`}
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-1 rounded ${
          theme === "light" 
            ? "bg-[#1B3C73]/20 text-[#1B3C73]" 
            : "bg-[#60A5FA]/20 text-[#60A5FA]"
        }`}>
          <TrendingDown className="w-4 h-4" />
        </div>
        <h3 className={`font-serif text-2xl ${
          theme === "light" ? "text-[#1B3C73]" : "text-white"
        }`}>
          <span className="italic">Earnings</span> Tracking
        </h3>
      </div>

      <div className={`mb-6 font-mono text-xs leading-relaxed ${
        theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
      }`}>
        Track your earnings across all submissions. See how much you've earned from each bounty,
        monitor pending payouts, and get insights into your best-performing content.
      </div>

      <div className={`flex-1 border rounded-lg p-4 relative overflow-hidden group transition-colors duration-300 ${
        theme === "light"
          ? "bg-white/10 border-[#C8D1E0]/20 hover:bg-white/15 hover:border-[#C8D1E0]/30"
          : "bg-black/20 border-white/5 hover:bg-black/30 hover:border-white/10"
      }`}>
        <div className="mb-4">
          <h4 className={`font-sans font-medium text-sm mb-4 ${
            theme === "light" ? "text-[#2E3A47]" : "text-white"
          }`}>This Month</h4>

          <div className={`grid grid-cols-[1fr_auto_auto] gap-4 text-[10px] font-mono mb-2 border-b pb-2 ${
            theme === "light"
              ? "text-[#52677C]/60 border-[#C8D1E0]/20"
              : "text-[#B8C5D6]/50 border-white/5"
          }`}>
            <div>Bounty</div>
            <div className="text-right">Views</div>
            <div className="text-right">Earned</div>
          </div>

          <div className="space-y-3 font-mono text-[10px]">
            <div className={`grid grid-cols-[1fr_auto_auto] gap-4 p-1 -mx-1 rounded transition-colors ${
              theme === "light"
                ? "text-[#2E3A47]/90 hover:bg-white/10"
                : "text-[#F5F8FC]/80 hover:bg-white/5"
            }`}>
              <div>TikTok Challenge</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>125K</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
              }`}>$625</div>
            </div>
            <div className={`grid grid-cols-[1fr_auto_auto] gap-4 p-1 -mx-1 rounded transition-colors ${
              theme === "light"
                ? "text-[#2E3A47]/90 hover:bg-white/10"
                : "text-[#F5F8FC]/80 hover:bg-white/5"
            }`}>
              <div>Product Review</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>85K</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
              }`}>$722</div>
            </div>
            <div className={`grid grid-cols-[1fr_auto_auto] gap-4 p-1 -mx-1 rounded transition-colors ${
              theme === "light"
                ? "text-[#2E3A47]/90 hover:bg-white/10"
                : "text-[#F5F8FC]/80 hover:bg-white/5"
            }`}>
              <div>Brand Story</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
              }`}>42K</div>
              <div className={`text-right ${
                theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
              }`}>$504</div>
            </div>
          </div>
        </div>

        {/* Tooltip Overlay - Animated */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 border rounded-md p-3 shadow-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-none transform group-hover:translate-y-[-55%] ${
          theme === "light"
            ? "bg-white/95 border-[#C8D1E0] text-[#2E3A47]"
            : "bg-[#0D1419] border-white/10 text-cyan-50"
        }`}>
          <div className={`text-[10px] font-mono leading-tight ${
            theme === "light" ? "text-[#2E3A47]" : "text-cyan-50"
          }`}>
            Total earnings increased by 15% this month compared to last month
          </div>
          {/* Connector line */}
          <div className={`absolute -top-6 left-4 w-[1px] h-6 bg-gradient-to-t ${
            theme === "light"
              ? "from-[#1B3C73]/50 to-transparent"
              : "from-[#60A5FA]/50 to-transparent"
          }`}></div>
        </div>
      </div>
    </GlassCard>
  )
}

