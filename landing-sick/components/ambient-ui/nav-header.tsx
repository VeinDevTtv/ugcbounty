import { ArrowUpRight } from "lucide-react"

export function NavHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
      <div className="flex items-center">
        <div className="bg-white/10 p-1.5 rounded-md backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
          <ArrowUpRight className="w-5 h-5 text-cyan-100" />
        </div>
      </div>
      <div className="text-xs font-mono tracking-widest text-cyan-200/80 uppercase">Join the Waitlist</div>
    </header>
  )
}
