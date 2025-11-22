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

  // Ensure animation is applied when theme changes
  useEffect(() => {
    if (titleRef.current) {
      // Check if element is already in view (has animation class or is visible)
      const hasAnimation = titleRef.current.classList.contains("animate-fade-in-up")
      const rect = titleRef.current.getBoundingClientRect()
      const isInView = rect.top < window.innerHeight && rect.bottom > 0
      
      // If element is in view but doesn't have animation class, add it
      if (isInView && !hasAnimation) {
        titleRef.current.classList.add("animate-fade-in-up")
      }
    }
  }, [theme])

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
    <section className="relative pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="max-w-4xl">
        <h1
          ref={titleRef}
          className={`font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] ${textColor} mb-10 italic tracking-tight opacity-0 pb-4`}
          style={{ lineHeight: "1.1", ...textShadow }}
        >
          Bountea <br />
          <span className="inline-block">
            <span 
              className={`inline-block text-transparent bg-clip-text ${
                theme === "light"
                  ? "bg-gradient-to-r from-[#1B3C73] via-[#3B82F6] to-[#1B3C73] animate-user-gradient-light"
                  : "bg-gradient-to-r from-[#60A5FA] via-[#93C5FD] via-[#3B82F6] to-[#60A5FA] animate-user-gradient"
              }`}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              User Generated Content
            </span>{" "}
            Platform
          </span>
        </h1>

        <div className="max-w-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <p className={`font-serif text-lg md:text-2xl leading-snug ${subtextColor} opacity-90 pb-8`}>
            Connect creators with brands. <br />
            Earn money by creating content that <span className="italic">matters</span>—get paid for every view you generate—instantly because of our{" "}
            <span className="relative inline-block align-top">
              <span className={`font-semibold ${
                theme === "light" 
                  ? "text-[#1B3C73]" 
                  : "text-[#60A5FA]"
              }`}>
                AI
              </span>
              <span 
                className={`absolute top-full left-0 mt-1 text-xs md:text-sm font-serif italic whitespace-nowrap opacity-0 animate-fade-in-up ${
                  theme === "light"
                    ? "text-[#3B82F6]"
                    : "text-[#93C5FD]"
                }`}
                style={{ 
                  animationDelay: "0.6s",
                  opacity: 0
                }}
              >
                Powered by intelligent automation
              </span>
            </span>.
          </p>
        </div>
      </div>
    </section>
  )
}

