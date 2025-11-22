"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/contexts/ThemeContext"

export function NarrativeSection() {
  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
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
      { threshold: 0.2 },
    )

    if (section1Ref.current) observer.observe(section1Ref.current)
    if (section2Ref.current) observer.observe(section2Ref.current)

    return () => observer.disconnect()
  }, [])

  const headingColor = theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
  const textColor = theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"

  return (
    <section className="relative px-6 md:px-12 max-w-7xl mx-auto py-20 space-y-32">
      {/* First Block - Right Aligned */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div ref={section1Ref} className="md:col-span-6 md:col-start-7 space-y-6 opacity-0">
          <h2 className={`font-serif text-4xl md:text-5xl ${headingColor}`}>
            <span className="italic">Real</span> opportunities for real creators.
          </h2>
          <p className={`font-mono text-sm leading-relaxed ${textColor} opacity-70 max-w-md`}>
            Brands post bounties with clear requirements and pay rates. You create content that matches their vision,
            submit it, and get paid based on performance. No middlemen, no delays—just direct creator-brand connections.
          </p>
        </div>
      </div>

      {/* Second Block - Left Aligned */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div ref={section2Ref} className="md:col-span-6 space-y-6 opacity-0">
          <h2 className={`font-serif text-4xl md:text-5xl ${headingColor}`}>
            bountea is the <span className="italic">next evolution</span> of creator monetization.
          </h2>
          <p className={`font-mono text-sm leading-relaxed ${textColor} opacity-70 max-w-md`}>
            Track your earnings, manage submissions, and discover new opportunities all in one place. Whether you're
            a TikTok star, YouTube creator, or Instagram influencer, we've got bounties waiting for you.
          </p>
        </div>
      </div>
    </section>
  )
}

