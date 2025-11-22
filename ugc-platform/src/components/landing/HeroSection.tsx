"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/contexts/ThemeContext"

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
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

    if (titleRef.current) {
      observer.observe(titleRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const textColor = theme === "light" 
    ? "text-transparent bg-clip-text bg-gradient-to-b from-[#0F1F3A] to-[#1B3C73]"
    : "text-transparent bg-clip-text bg-gradient-to-b from-[#93C5FD] to-[#60A5FA]"
  
  const textShadow = theme === "light"
    ? { textShadow: "0 2px 8px rgba(15, 31, 58, 0.15), 0 1px 2px rgba(15, 31, 58, 0.2)" }
    : { textShadow: "0 2px 12px rgba(96, 165, 250, 0.4), 0 0 20px rgba(96, 165, 250, 0.2)" }

  const subtextColor = theme === "light"
    ? "text-[#2E3A47]"
    : "text-[#F5F8FC]"

  return (
    <section className="relative pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="max-w-4xl">
        <h1
          ref={titleRef}
          className={`font-serif text-6xl md:text-8xl lg:text-9xl leading-[1.1] ${textColor} mb-16 italic tracking-tight opacity-0 pb-4`}
          style={{ lineHeight: "1.1", ...textShadow }}
        >
          bountea <br />
          UGC Platform
        </h1>

        <div className="max-w-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <p className={`font-serif text-xl md:text-3xl leading-snug ${subtextColor} opacity-90`}>
            Connect creators with brands. <br />
            Earn money by creating content that <span className="italic">matters</span>—get paid for every view you generate.
          </p>
        </div>
      </div>
    </section>
  )
}

