import Link from "next/link";
import { Zap } from "lucide-react";

const SUPPORTED_COUNTRIES = [
  { code: "VE", name: "Venezuela", currency: "VES", flag: "🇻🇪" },
  { code: "CO", name: "Colombia", currency: "COP", flag: "🇨🇴" },
  { code: "BR", name: "Brasil", currency: "BRL", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", currency: "ARS", flag: "🇦🇷" },
  { code: "EC", name: "Ecuador", currency: "USD", flag: "🇪🇨" },
  { code: "PE", name: "Perú", currency: "PEN", flag: "🇵🇪" },
  { code: "CL", name: "Chile", currency: "CLP", flag: "🇨🇱" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-[#182030] bg-[#05070b] text-slate-400 py-14 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
        {/* Columna 1: Marca y Propuesta */}
        <div className="sm:col-span-2 lg:col-span-4 space-y-4 pr-0 lg:pr-6">
          <div className="flex items-center gap-2.5 font-mono font-extrabold text-white text-base">
            <div className="w-7 h-7 rounded-lg bg-[#00ff66]/15 border border-[#00ff66]/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#00ff66]" />
            </div>
            <span>
              CYCLON <span className="text-[#00ff66]">P2P</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu plataforma de control operativo, auditoría de comisiones y
            trazabilidad contable P2P para operar con confianza en múltiples
            exchanges y países.
          </p>
          <div className="p-3 rounded-xl bg-[#0b0e15] border border-[#1a2232] text-[11px] text-amber-300/90 leading-relaxed">
            ⚠️ <strong>Aviso legal del MVP:</strong> Cyclon P2P es una
            herramienta externa de control operativo y bitácora analítica. No
            custodia fondos, no solicita claves privadas y no ejecuta órdenes en
            exchanges.
          </div>
        </div>

        {/* Columna 2: Producto */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider mb-4">
            Producto
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                href="/#features"
                className="hover:text-[#00ff66] transition-colors"
              >
                Características
              </Link>
            </li>
            <li>
              <Link
                href="/#operativa"
                className="hover:text-[#00ff66] transition-colors"
              >
                Vista Operativa
              </Link>
            </li>
            <li>
              <Link
                href="/#pricing"
                className="hover:text-[#00ff66] transition-colors"
              >
                Precios
              </Link>
            </li>
            <li>
              <Link
                href="/app"
                prefetch={false}
                className="hover:text-[#00ff66] transition-colors"
              >
                Demo Interactiva
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Recursos */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider mb-4">
            Recursos
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                href="/registro"
                className="hover:text-[#00ff66] transition-colors"
              >
                Guía de Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/precios"
                className="hover:text-[#00ff66] transition-colors"
              >
                Simulador de Planes
              </Link>
            </li>
            <li>
              <Link
                href="/#seguridad"
                className="hover:text-[#00ff66] transition-colors"
              >
                Arquitectura Sin Custodia
              </Link>
            </li>
            <li>
              <Link
                href="/#faq"
                className="hover:text-[#00ff66] transition-colors"
              >
                Preguntas Frecuentes (FAQ)
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 4: Legal */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider mb-4">
            Legal
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                href="/terminos"
                className="hover:text-[#00ff66] transition-colors"
              >
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link
                href="/privacidad"
                className="hover:text-[#00ff66] transition-colors"
              >
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/transparencia"
                className="hover:text-[#00ff66] transition-colors"
              >
                Transparencia No-Custodial
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="hover:text-[#00ff66] transition-colors"
              >
                Acceso Comerciantes
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 5: Países Soportados */}
        <div className="sm:col-span-2 lg:col-span-2">
          <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider mb-4">
            Países soportados
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_COUNTRIES.map((country) => (
              <div
                key={country.code}
                title={`${country.name} (${country.currency})`}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0d111a] border border-[#1d2436] text-[11px] font-mono text-slate-200"
              >
                <span>{country.flag}</span>
                <span className="font-bold text-white">{country.code}</span>
                <span className="text-[10px] text-[#00ff66]">
                  {country.currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra Inferior de Copyright */}
      <div className="max-w-7xl mx-auto border-t border-[#141a26] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>
          © 2026 Cyclon P2P. Todos los derechos reservados. Control operativo y
          trazabilidad para comerciantes P2P.
        </p>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-[#00ff66]">● Sistema Operativo</span>
          <span>•</span>
          <span>Modo Demo Portafolio</span>
        </div>
      </div>
    </footer>
  );
}
