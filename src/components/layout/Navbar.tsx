import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1c212e] bg-[#08090d]/80 backdrop-blur-md">
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
              Arbitrage & Ledger
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link
            href="/#features"
            className="hover:text-[#00ff66] transition-colors"
          >
            Funcionalidades
          </Link>
          <Link
            href="/#exchanges"
            className="hover:text-[#00ff66] transition-colors"
          >
            Exchanges & Países
          </Link>
          <Link
            href="/precios"
            className="hover:text-[#00ff66] transition-colors"
          >
            Planes & Precios
          </Link>
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/registro">
            <Button variant="primary" size="sm" className="hidden sm:inline-flex">
              Prueba Gratuita 7 Días
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
