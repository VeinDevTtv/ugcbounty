"use client"

import { useEffect, useRef } from "react"

export function NarrativeSection() {
  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)

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

  return (
    <section className="relative px-6 md:px-12 max-w-7xl mx-auto py-20 space-y-32">
      {/* First Block - Right Aligned */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div ref={section1Ref} className="md:col-span-6 md:col-start-7 space-y-6 opacity-0">
          <h2 className="font-serif text-4xl md:text-5xl text-cyan-50">
            <span className="italic">Real</span> intelligence becomes one with you.
          </h2>
          <p className="font-mono text-sm leading-relaxed text-cyan-200/70 max-w-md">
            It's deeply embedded in your workflows, so it can understand your intent — not through conversation, but
            through the way you use your product in your day-to-day life. It augments your capabilities and shows how
            you can do more — wherever you are.
          </p>
        </div>
      </div>

      {/* Second Block - Left Aligned */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div ref={section2Ref} className="md:col-span-6 space-y-6 opacity-0">
          <h2 className="font-serif text-4xl md:text-5xl text-cyan-50">
            Ambient Intelligence is the <span className="italic">next evolution</span>, working quietly in the
            background.
          </h2>
          <p className="font-mono text-sm leading-relaxed text-cyan-200/70 max-w-md">
            It understands how your business data, model structure, and future plans fit together — and what might be of
            interest to you. It automatically highlights deviations from forecasts, explains terms, and surfaces deep
            insights. So you can unlock your best decisions faster, effortlessly.
          </p>
        </div>
      </div>
    </section>
  )
}
