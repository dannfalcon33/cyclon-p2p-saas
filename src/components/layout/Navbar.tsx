import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#192030] bg-[#08090d]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#00ff66] group-hover:shadow-[0_0_15px_rgba(0,255,102,0.3)]">
            <Zap className="w-5 h-5 text-[#00ff66] transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5 font-mono">
              CYCLON <span className="text-[#00ff66]">P2P</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Control & Trazabilidad
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link
            href="/#producto"
            className="hover:text-[#00ff66] transition-colors"
          >
            Producto
          </Link>
          <Link
            href="/#features"
            className="hover:text-[#00ff66] transition-colors"
          >
            Funcionalidades
          </Link>
          <Link
            href="/#pricing"
            className="hover:text-[#00ff66] transition-colors"
          >
            Precios
          </Link>
          <Link
            href="/#faq"
            className="hover:text-[#00ff66] transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00ff66]/50 select-none cursor-pointer bg-transparent text-slate-300 hover:bg-[#161922] hover:text-white text-xs sm:text-sm px-3 py-1.5"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00ff66]/50 select-none cursor-pointer bg-[#00ff66] text-[#08090d] font-bold hover:bg-[#00e55b] hover:shadow-[0_0_20px_rgba(0,255,102,0.35)] active:scale-[0.98] text-xs sm:text-sm px-4 py-2 gap-1.5"
          >
            <span>Prueba gratis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
