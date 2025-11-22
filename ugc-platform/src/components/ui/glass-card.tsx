import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl",
        "transition-all duration-500 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-[0_0_40px_rgba(0,0,0,0.2)]",
        className,
      )}
      {...props}
    >
      {/* Noise texture overlay could go here */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6 h-full">{children}</div>
    </div>
  )
})
GlassCard.displayName = "GlassCard"

