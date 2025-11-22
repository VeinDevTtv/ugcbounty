"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Command } from "lucide-react"
import { useEffect, useRef } from "react"

export function DriverCard() {
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
      className="col-span-1 md:col-span-2 min-h-[400px] flex flex-col md:flex-row gap-8 opacity-0 hover:border-cyan-400/30 transition-all duration-500"
    >
      {/* Left side: Table UI */}
      <div className="flex-1 space-y-4">
        <div className="overflow-hidden rounded-lg border border-white/5 bg-black/20">
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-wider font-mono text-cyan-200/50">
            <div>Driver Name</div>
            <div className="text-right">May '24</div>
            <div className="text-right">Jun '24</div>
          </div>
          <div className="p-2 space-y-1 font-mono text-xs">
            <div className="grid grid-cols-3 gap-4 p-2 rounded hover:bg-white/5 cursor-pointer group transition-all duration-200">
              <div className="text-cyan-100 group-hover:text-white transition-colors">Total Marketing Spend</div>
              <div className="text-right text-cyan-200/70">$100,000</div>
              <div className="text-right text-cyan-200/70">$105,000</div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-2 rounded hover:bg-white/5 cursor-pointer relative transition-all duration-200">
              <div className="text-cyan-100">Production</div>
              <div className="text-right text-cyan-200/70">65</div>
              <div className="text-right text-cyan-200/70">72</div>

              {/* Loading Spinner overlay mimicking the design */}
              <div className="absolute left-[30%] top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full border border-cyan-500/30 border-t-cyan-400 animate-spin" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-2 rounded hover:bg-white/5 cursor-pointer group transition-all duration-200">
              <div className="text-cyan-100 group-hover:text-white transition-colors">Cost Per Lead</div>
              <div className="text-right text-cyan-200/70">16</div>
              <div className="text-right text-cyan-200/70">18</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-200/50 pt-2 pl-1 hover:text-cyan-200/70 transition-colors cursor-pointer">
          <span>+ Add driver</span>
        </div>

        {/* Command Palette Mock */}
        <div className="mt-8 relative">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-3 flex items-center gap-3 w-48 mx-auto shadow-2xl hover:border-cyan-400/30 transition-all duration-300">
            <Command className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-mono text-cyan-100">command</span>
            <span className="text-[10px] text-cyan-500 ml-auto">+</span>
            <span className="text-[10px] text-cyan-100 bg-white/10 px-1 rounded">K</span>
          </div>
        </div>
      </div>

      {/* Right side: Explanation */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-300">
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
          <h3 className="font-serif italic text-3xl text-white">Driver Explanations</h3>
        </div>
        <p className="font-mono text-xs leading-relaxed text-cyan-200/70">
          Runway generates clear, concise explanations for all your financial drivers. Hover over terms like 'Gross
          Margin' or 'Burn' to see easy-to-understand descriptions based on your model, ensuring everyone in your
          company can quickly grasp the critical aspects of your business.
        </p>
      </div>
    </GlassCard>
  )
}
