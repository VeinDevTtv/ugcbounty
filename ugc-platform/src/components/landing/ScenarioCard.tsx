"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Split } from "lucide-react"
import { useEffect, useRef } from "react"
import { useTheme } from "@/contexts/ThemeContext"

export function ScenarioCard() {
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
      { threshold: 0.1, delay: 200 },
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
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-1 rounded ${
          theme === "light" 
            ? "bg-[#1B3C73]/20 text-[#1B3C73]" 
            : "bg-[#60A5FA]/20 text-[#60A5FA]"
        }`}>
          <Split className="w-4 h-4" />
        </div>
        <h3 className={`font-serif text-2xl ${
          theme === "light" ? "text-[#1B3C73]" : "text-white"
        }`}>
          <span className="italic">Platform</span> Comparison
        </h3>
      </div>

      <div className={`mb-6 font-mono text-xs leading-relaxed ${
        theme === "light" ? "text-[#52677C]/80" : "text-[#B8C5D6]/70"
      }`}>
        Compare earnings across different platforms. See which platforms offer the best rates
        and which content types perform best for your audience.
      </div>

      <div className="flex-1 flex gap-2 overflow-hidden">
        {/* Platform A */}
        <div className={`flex-1 rounded border p-3 space-y-2 transition-all duration-300 hover:flex-[1.2] group ${
          theme === "light"
            ? "bg-[#1B3C73]/10 border-[#C8D1E0]/20 hover:bg-[#1B3C73]/15"
            : "bg-[#60A5FA]/20 border-white/5 hover:bg-[#60A5FA]/30"
        }`}>
          <div className={`text-[10px] font-sans font-medium transition-colors ${
            theme === "light"
              ? "text-[#1B3C73] group-hover:text-[#1B3C73]"
              : "text-[#60A5FA] group-hover:text-white"
          }`}>
            TikTok
          </div>
          <div className={`h-[1px] w-full my-2 transition-colors ${
            theme === "light"
              ? "bg-[#C8D1E0]/20 group-hover:bg-[#C8D1E0]/30"
              : "bg-white/5 group-hover:bg-white/10"
          }`} />
          <p className={`text-[9px] font-mono leading-relaxed transition-colors ${
            theme === "light"
              ? "text-[#52677C]/70 group-hover:text-[#52677C]/90"
              : "text-[#B8C5D6]/60 group-hover:text-[#B8C5D6]/80"
          }`}>
            Highest engagement rates with{" "}
            <span className={`underline transition-colors ${
              theme === "light"
                ? "decoration-[#1B3C73]/30 group-hover:decoration-[#1B3C73]/50"
                : "decoration-[#60A5FA]/30 group-hover:decoration-[#60A5FA]"
            }`}>
              short-form
            </span>{" "}
            content. Average rate: $5-8 per 1K views.
          </p>
        </div>

        {/* Platform B */}
        <div className={`flex-1 rounded border p-3 space-y-2 transition-all duration-300 hover:flex-[1.2] group ${
          theme === "light"
            ? "bg-white/5 border-[#C8D1E0]/20 hover:bg-white/10"
            : "bg-[#60A5FA]/10 border-white/5 hover:bg-[#60A5FA]/20"
        }`}>
          <div className={`text-[10px] font-sans font-medium transition-colors ${
            theme === "light"
              ? "text-[#1B3C73] group-hover:text-[#1B3C73]"
              : "text-[#60A5FA] group-hover:text-white"
          }`}>
            YouTube
          </div>
          <div className={`h-[1px] w-full my-2 transition-colors ${
            theme === "light"
              ? "bg-[#C8D1E0]/20 group-hover:bg-[#C8D1E0]/30"
              : "bg-white/5 group-hover:bg-white/10"
          }`} />
          <p className={`text-[9px] font-mono leading-relaxed transition-colors ${
            theme === "light"
              ? "text-[#52677C]/70 group-hover:text-[#52677C]/90"
              : "text-[#B8C5D6]/60 group-hover:text-[#B8C5D6]/80"
          }`}>
            Best for longer-form content and{" "}
            <span className={`underline transition-colors ${
              theme === "light"
                ? "decoration-[#1B3C73]/30 group-hover:decoration-[#1B3C73]/50"
                : "decoration-[#60A5FA]/30 group-hover:decoration-[#60A5FA]"
            }`}>
              tutorials
            </span>
            . Average rate: $8-12 per 1K views.
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

