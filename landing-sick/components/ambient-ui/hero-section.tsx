"use client"

import { useEffect, useRef } from "react"

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)

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

  return (
    <section className="relative pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="max-w-4xl">
        <h1
          ref={titleRef}
          className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-cyan-50 to-cyan-200/80 mb-16 italic tracking-tight opacity-0 pb-4"
          style={{ lineHeight: "1.1" }}
        >
          Ambient <br />
          Intelligence
        </h1>

        <div className="max-w-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <p className="font-serif text-xl md:text-3xl leading-snug text-cyan-50/90">
            Today's AI is disconnected. <br />
            It's a tool that has to be switched <span className="italic">on</span>, and given a task—not an extension of
            your mind that automatically anticipates your needs.
          </p>
        </div>
      </div>
    </section>
  )
}
