import { NavHeader } from "@/components/ambient-ui/nav-header"
import { HeroSection } from "@/components/ambient-ui/hero-section"
import { NarrativeSection } from "@/components/ambient-ui/narrative-section"
import { DriverCard } from "@/components/ambient-ui/driver-card"
import { VarianceCard } from "@/components/ambient-ui/variance-card"
import { ScenarioCard } from "@/components/ambient-ui/scenario-card"
import { FooterSection } from "@/components/ambient-ui/footer-section"

export default function Page() {
  return (
    <main className="min-h-screen selection:bg-cyan-500/30 relative overflow-hidden">
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[#0a2e38] via-[#0d414f] to-[#061e26]" />

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 -z-10 opacity-60">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute bottom-1/4 right-1/3 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[140px] animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-emerald-400/15 rounded-full blur-[90px] animate-pulse-slow" />
      </div>

      {/* Subtle overlay texture */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-black/20 via-transparent to-cyan-500/5 pointer-events-none" />
      {/* </CHANGE> */}

      <NavHeader />

      <HeroSection />

      <NarrativeSection />

      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DriverCard />
          <VarianceCard />
          <ScenarioCard />
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
