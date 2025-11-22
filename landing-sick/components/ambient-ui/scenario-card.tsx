"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Split } from "lucide-react"
import { useEffect, useRef } from "react"

export function ScenarioCard() {
  const cardRef = useRef<HTMLDivElement>(null)

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
      className="col-span-1 min-h-[400px] flex flex-col opacity-0 hover:border-cyan-400/30 transition-all duration-500"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1 rounded bg-cyan-500/20 text-cyan-300">
          <Split className="w-4 h-4" />
        </div>
        <h3 className="font-serif text-2xl text-white">
          <span className="italic">Scenario</span> Comparisons
        </h3>
      </div>

      <div className="mb-6 font-mono text-xs leading-relaxed text-cyan-200/70">
        Runway proactively summarizes differences between your different scenarios. Accelerate your business planning
        with deeper insights and clearer perspectives.
      </div>

      <div className="flex-1 flex gap-2 overflow-hidden">
        {/* Scenario A */}
        <div className="flex-1 bg-cyan-900/20 rounded border border-white/5 p-3 space-y-2 transition-all duration-300 hover:bg-cyan-900/30 hover:flex-[1.2] group">
          <div className="text-[10px] font-sans font-medium text-cyan-100 group-hover:text-white transition-colors">
            Increase Google Ad Spend
          </div>
          <div className="h-[1px] bg-white/5 w-full my-2 group-hover:bg-white/10 transition-colors" />
          <p className="text-[9px] font-mono text-cyan-200/60 leading-relaxed group-hover:text-cyan-100/80 transition-colors">
            John's summer budget scenario increases{" "}
            <span className="text-cyan-200 underline decoration-cyan-500/30 group-hover:decoration-cyan-400 transition-colors">
              Google
            </span>{" "}
            Ad Spend...
          </p>
        </div>

        {/* Scenario B */}
        <div className="flex-1 bg-cyan-900/10 rounded border border-white/5 p-3 space-y-2 transition-all duration-300 hover:bg-cyan-900/20 hover:flex-[1.2] group">
          <div className="text-[10px] font-sans font-medium text-cyan-100 group-hover:text-white transition-colors">
            Main Scenario
          </div>
          <div className="h-[1px] bg-white/5 w-full my-2 group-hover:bg-white/10 transition-colors" />
          <p className="text-[9px] font-mono text-cyan-200/60 leading-relaxed group-hover:text-cyan-100/80 transition-colors">
            Compared to the baseline, this impacts revenue by adding $10k in sales, increasing profit...
          </p>
        </div>
      </div>
    </GlassCard>
  )
}
