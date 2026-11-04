import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import {
  ShieldCheck,
  KeyRound,
  Server,
  Globe,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Lock,
} from "lucide-react";

const TRANSPARENCY_PILLARS = [
  {
    icon: KeyRound,
    number: "01",
    title: "Cero Custodia de Fondos y Cero Claves Privadas",
    content: [
      "Cyclon P2P está diseñado bajo un modelo estrictamente No-Custodial (Non-Custodial). La aplicación funciona exclusivamente como una bitácora analítica y calculadora contable externa donde el usuario registra los datos de sus órdenes de compra y venta.",
      "El sistema no integra contratos inteligentes de depósito, no solicita conexión de billeteras Web3 (como MetaMask, Trust Wallet o Phantom) ni pide llaves API privadas de retiro o trading de ningún exchange.",
    ],
  },
  {
    icon: Globe,
    number: "02",
    title: "Consulta de Datos de Mercado Mediante Endpoints Públicos",
    content: [
      "Los módulos de cotizaciones Spot, gráficos de velas (Klines), libros de órdenes P2P de referencia y noticias del ecosistema cripto consumen únicamente endpoints públicos de solo lectura (sin autenticación de cuenta del usuario).",
      "Esto permite consultar precios referenciales de mercado en tiempo real sin exponer cuentas de exchanges ni comprometer credenciales de terceros.",
    ],
  },
  {
    icon: Server,
    number: "03",
    title: "Propósito Real del Sistema: Proyecto Demo para Portafolio",
    content: [
      "En aras de la máxima transparencia hacia visitantes, clientes y reclutadores: Cyclon P2P NO es un producto financiero real en operación comercial, sino una demostración técnica de portafolio de ingeniería de software.",
      "Su objetivo es demostrar el diseño y construcción de un SaaS moderno de principio a fin (Next.js App Router, TypeScript, Drizzle ORM, PostgreSQL en Neon, Better Auth, control de acceso basado en roles y exportación contable en Excel).",
    ],
  },
  {
    icon: Layers,
    number: "04",
    title: "Transparencia en Facturación Simulada y Auditoría",
    content: [
      "El motor de suscripciones opera permanentemente bajo la bandera BILLING_MODE=demo. Todos los cobros, activaciones de planes (Free Trial, Business, Enterprise) y descuentos por cupones son simulaciones instantáneas de base de datos sin movimiento real de dinero.",
      "Cada operación registrada dentro de la demo calcula de forma transparente el desglose exacto entre monto bruto, comisión porcentual de plataforma, comisión fija bancaria y utilidad neta auditable.",
    ],
  },
];

const NON_CUSTODIAL_GUARANTEES = [
  "No es un exchange ni un bróker de criptoactivos",
  "No recibe depósitos ni procesa retiros de dinero real",
  "No solicita API Keys privadas de Binance, Bybit, Bitget ni Kraken",
  "No almacena tarjetas bancarias ni ejecuta cobros reales",
  "Código y arquitectura creados 100% como demostración de portafolio",
  "Aislamiento de datos de prueba por Workspace independiente",
];

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">
        {/* Navegación superior y pestañas legales */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#192030] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#00ff66] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <Link
              href="/terminos"
              className="px-3 py-1.5 rounded-lg bg-[#10141f] border border-[#1d2538] text-slate-300 hover:border-[#00ff66]/40 hover:text-white transition-colors"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/privacidad"
              className="px-3 py-1.5 rounded-lg bg-[#10141f] border border-[#1d2538] text-slate-300 hover:border-[#00ff66]/40 hover:text-white transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/transparencia"
              className="px-3 py-1.5 rounded-lg bg-[#00ff66]/15 border border-[#00ff66]/50 text-[#00ff66] font-bold"
            >
              Transparencia No-Custodial
            </Link>
          </div>
        </div>

        {/* Encabezado Principal */}
        <div className="space-y-4">
          <DemoNoticeBadge />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Transparencia No-Custodial
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Arquitectura Sin Custodia y Declaración de Proyecto de Portafolio
              </p>
            </div>
          </div>
        </div>

        {/* Aviso Destacado de Portafolio */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/35 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Declaración de Transparencia: Demo de Portafolio</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong>Cyclon P2P no es un producto comercial ni financiero real.</strong>{" "}
            Esta plataforma ha sido construida como demostración interactiva para
            un portafolio profesional de desarrollo de software, simulando una
            herramienta SaaS de control operativo P2P bajo principios de
            arquitectura 100% No-Custodial.
          </p>
        </div>

        {/* Checklist Resumen de Garantías */}
        <div className="rounded-2xl bg-[#0b101b] border border-[#00ff66]/30 p-6 space-y-4 shadow-[0_0_30px_rgba(0,255,102,0.06)]">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#00ff66] font-bold">
            Garantías Técnicas del Entorno Demostrativo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NON_CUSTODIAL_GUARANTEES.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 bg-[#0f1523] border border-[#1c263b] rounded-xl p-3"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pilares de Transparencia */}
        <div className="grid grid-cols-1 gap-6">
          {TRANSPARENCY_PILLARS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.number}
                className="rounded-2xl bg-[#0c1018]/90 border border-[#1a2234] p-6 space-y-3 hover:border-[#00ff66]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 rounded">
                      {section.number}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="space-y-2.5 pl-0 sm:pl-12 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Enlaces cruzados inferiores */}
        <div className="rounded-2xl bg-[#0b0e16] border border-[#192234] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Documentación Legal Complementaria de la Demo
            </h3>
            <p className="text-xs text-slate-400">
              Consulta también los términos de uso del proyecto y nuestra
              política de privacidad para datos de prueba.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/terminos"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#131824] border border-[#222b3d] text-xs font-medium text-slate-200 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>Términos y Condiciones</span>
            </Link>
            <Link
              href="/privacidad"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#131824] border border-[#222b3d] text-xs font-medium text-slate-200 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>Política de Privacidad</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

