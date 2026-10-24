import Link from "next/link";
import { Zap, Shield, FileSpreadsheet, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#1c212e] bg-[#06070a] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono font-bold text-white">
            <Zap className="w-5 h-5 text-[#00ff66]" />
            <span>CYCLON P2P</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plataforma SaaS para el registro, control contable y analítica de operaciones P2P. Diseñada para comerciantes de Latinoamérica y el mundo.
          </p>
          <div className="p-3 rounded-lg bg-[#0d0f14] border border-[#1c212e] text-[11px] text-amber-300/90 leading-tight">
            ⚠️ <strong>Aviso legal del MVP:</strong> Cyclon P2P es una herramienta analítica de portafolio y bitácora. No custodia fondos, no ejecuta órdenes en exchanges y no calcula impuestos automáticamente.
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-200 tracking-wider mb-4">
            Plataforma
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/app" className="hover:text-[#00ff66] transition-colors">
                Dashboard Comerciante
              </Link>
            </li>
            <li>
              <Link href="/app/operaciones" className="hover:text-[#00ff66] transition-colors">
                Bitácora de Operaciones
              </Link>
            </li>
            <li>
              <Link href="/app/configuracion" className="hover:text-[#00ff66] transition-colors">
                Comisiones por País
              </Link>
            </li>
            <li>
              <Link href="/app/mercado" className="hover:text-[#00ff66] transition-colors">
                Módulo Mercado (Enterprise)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-200 tracking-wider mb-4">
            Países Iniciales
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
              Venezuela (VES) & Colombia (COP)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
              Brasil (BRL) & Argentina (ARS)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
              Ecuador (USD) & Perú (PEN)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
              Chile (CLP)
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-200 tracking-wider mb-4">
            Transparencia & Seguridad
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#00ff66]" />
              Sin claves API de exchanges
            </li>
            <li className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#00ff66]" />
              Exportación limpia en Excel (.xlsx)
            </li>
            <li className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#00ff66]" />
              Aislamiento estricto por Workspace
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#161a24] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 Cyclon P2P. Todos los derechos reservados. Desarrollado como MVP de portafolio SaaS.</p>
        <div className="flex gap-4">
          <span className="text-slate-400">Términos de Servicio (Borrador)</span>
          <span className="text-slate-400">Privacidad (Borrador)</span>
        </div>
      </div>
    </footer>
  );
}
