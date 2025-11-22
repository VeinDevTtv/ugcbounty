import { ArrowUpRight } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="relative px-6 md:px-12 max-w-7xl mx-auto py-32 mt-12 border-t border-white/5">
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 mb-20">
        <h2
          className="font-serif italic text-6xl md:text-8xl lg:text-[8rem] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-cyan-50 to-cyan-300 pb-4"
          style={{ lineHeight: "1.1" }}
        >
          Get early <br className="hidden md:block" /> access
        </h2>
        <div className="bg-cyan-400 text-cyan-950 rounded-full p-4 md:p-6 hover:scale-110 transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:rotate-12">
          <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end text-[10px] font-mono tracking-widest uppercase text-cyan-200/40">
        <div className="flex items-center gap-2">
          <span>©2024</span>
          <span>+</span>
          <span>RUNWAY</span>
        </div>
        <div className="writing-vertical-lr rotate-180 hidden md:block opacity-50">VIBES</div>
      </div>
    </footer>
  )
}
