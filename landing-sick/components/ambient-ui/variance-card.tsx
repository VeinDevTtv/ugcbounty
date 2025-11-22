"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { TrendingDown } from "lucide-react"
import { useEffect, useRef } from "react"

export function VarianceCard() {
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
      className="col-span-1 min-h-[400px] flex flex-col opacity-0 hover:border-cyan-400/30 transition-all duration-500"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1 rounded bg-cyan-500/20 text-cyan-300">
          <TrendingDown className="w-4 h-4" />
        </div>
        <h3 className="font-serif text-2xl text-white">
          <span className="italic">BvA</span> Variance
        </h3>
      </div>

      <div className="mb-6 font-mono text-xs leading-relaxed text-cyan-200/70">
        Runway automatically analyzes your Budgets vs. Actuals and highlights variances without the need for manual
        intervention. Maintain a clear and accurate financial overview.
      </div>

      <div className="flex-1 bg-black/20 border border-white/5 rounded-lg p-4 relative overflow-hidden group transition-colors duration-300 hover:bg-black/30 hover:border-white/10">
        <div className="mb-4">
          <h4 className="font-sans font-medium text-sm text-white mb-4">Sales & marketing</h4>

          <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-[10px] text-cyan-200/50 font-mono mb-2 border-b border-white/5 pb-2">
            <div>Driver</div>
            <div className="text-right">Main Scen...</div>
            <div className="text-right">Nov '23 clo...</div>
          </div>

          <div className="space-y-3 font-mono text-[10px]">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-cyan-100/80 group/row hover:bg-white/5 p-1 -mx-1 rounded transition-colors">
              <div>Leads</div>
              <div className="text-right">105</div>
              <div className="text-right text-cyan-200/40">--</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-cyan-100/80 group/row hover:bg-white/5 p-1 -mx-1 rounded transition-colors">
              <div>Marketing spend</div>
              <div className="text-right">$50,000</div>
              <div className="text-right text-cyan-200/40">$10,000</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-cyan-100/80 group/row hover:bg-white/5 p-1 -mx-1 rounded transition-colors">
              <div>Cost per lead</div>
              <div className="text-right">$473</div>
              <div className="text-right text-cyan-200/40">$900</div>
            </div>
          </div>
        </div>

        {/* Tooltip Overlay - Animated */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 bg-[#0D1214] border border-white/10 rounded-md p-3 shadow-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-none transform group-hover:translate-y-[-55%]">
          <div className="text-[10px] font-mono text-cyan-50 leading-tight">
            Cost per lead decreased by 5.4% in Main Scenario compared to Nov '23 close
          </div>
          {/* Connector line */}
          <div className="absolute -top-6 left-4 w-[1px] h-6 bg-gradient-to-t from-cyan-500/50 to-transparent"></div>
        </div>
      </div>
    </GlassCard>
  )
}
