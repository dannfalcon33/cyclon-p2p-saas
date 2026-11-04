import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  CreditCard,
  Code2,
  Scale,
  ArrowLeft,
  ShieldCheck,
  Lock,
} from "lucide-react";

const LEGAL_SECTIONS = [
  {
    icon: Code2,
    number: "01",
    title: "Naturaleza del Proyecto (Demostración de Portafolio)",
    content: [
      "Cyclon P2P es un proyecto demostrativo de ingeniería de software (Full-Stack SaaS MVP) desarrollado exclusivamente con fines de portafolio técnico, exhibición arquitectónica y evaluación profesional.",
      "Esta plataforma NO constituye una empresa constituida, un servicio comercial en producción, una entidad financiera, ni un proveedor de servicios de activos virtuales (PSAV / VASP).",
    ],
  },
  {
    icon: ShieldAlert,
    number: "02",
    title: "Inexistencia de Servicios Financieros o de Custodia",
    content: [
      "Cyclon P2P simula una bitácora analítica y calculadora contable externa para comerciantes de arbitraje y mercados P2P. En ningún momento recibe, almacena, transfiere, custodia ni intermedia criptomonedas ni dinero fiduciario (fíat).",
      "La aplicación no ejecuta órdenes de compra o venta en ningún exchange (como Binance, Bybit, Bitget o Kraken), ni ofrece asesoría financiera, contable, tributaria o de inversión.",
    ],
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Suscripciones, Planes y Checkout 100% Simulados",
    content: [
      "Todos los planes mostrados en la plataforma (Free Trial, Business y Enterprise), así como sus precios en dólares estadounidenses (USD), cupones promocionales y flujos de pago operan estrictamente en modo demostración (BILLING_MODE=demo).",
      "No existe ninguna pasarela de cobro real conectada (ni Stripe, ni PayPal, ni procesadores cripto). Ningún usuario será cobrado bajo ninguna circunstancia ni se solicitan datos de tarjetas bancarias reales.",
    ],
  },
  {
    icon: FileText,
    number: "04",
    title: "Uso Aceptable del Entorno de Demostración",
    content: [
      "Cualquier visitante, reclutador o evaluador técnico puede crear cuentas de prueba, registrar operaciones ficticias, probar los cálculos de comisiones multi-país y exportar reportes en Excel (.xlsx) para explorar las capacidades del sistema.",
      "Dado el carácter público de demostración, el usuario se compromete a no utilizar la plataforma para almacenar información confidencial real de terceros ni realizar pruebas de denegación de servicio que afecten la disponibilidad de la demo.",
    ],
  },
  {
    icon: Scale,
    number: "05",
    title: "Propiedad Intelectual y Marcas de Terceros",
    content: [
      "El diseño de interfaz, arquitectura de base de datos, lógica de cálculo contable y código fuente de Cyclon P2P forman parte del portafolio profesional de su autor.",
      "Las referencias a nombres de exchanges (Binance, Bybit, Bitget, Kraken), monedas fiduciarias o criptoactivos (USDT, USDC, BTC, ETH) tienen un propósito meramente descriptivo y de simulación de compatibilidad operativa, sin que exista afiliación, patrocinio ni respaldo oficial por parte de dichas marcas.",
    ],
  },
  {
    icon: AlertTriangle,
    number: "06",
    title: "Exclusión de Garantías y Limitación de Responsabilidad",
    content: [
      "El software se proporciona «tal cual» (AS-IS), con fines exclusivamente demostrativos y educativos, sin garantías de disponibilidad continua ni respaldo de datos a largo plazo.",
      "Los datos de prueba ingresados en el entorno de demostración pueden ser reiniciados o depurados periódicamente para mantener el rendimiento del servidor de demostración.",
    ],
  },
];

export default function TerminosPage() {
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
              className="px-3 py-1.5 rounded-lg bg-[#00ff66]/15 border border-[#00ff66]/50 text-[#00ff66] font-bold"
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
              className="px-3 py-1.5 rounded-lg bg-[#10141f] border border-[#1d2538] text-slate-300 hover:border-[#00ff66]/40 hover:text-white transition-colors"
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Última actualización: Noviembre 2026 • Versión Demo de Portafolio
              </p>
            </div>
          </div>
        </div>

        {/* Aviso Destacado de Portafolio */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/35 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Aviso Importante: Proyecto de Demostración para Portafolio</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong>Cyclon P2P no es un producto comercial real.</strong> Es una
            aplicación web Full-Stack funcional creada como caso de estudio y
            demostración de portafolio de desarrollo de software. Todos los
            flujos de suscripción, facturación, saldos y registros contables son
            simulaciones diseñadas para demostrar arquitectura multi-tenant,
            autenticación moderna, cálculos financieros de precisión y
            exportación de reportes.
          </p>
        </div>

        {/* Secciones de Términos Estándar */}
        <div className="grid grid-cols-1 gap-6">
          {LEGAL_SECTIONS.map((section) => {
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
              Consulta también nuestra política de manejo de datos de prueba y la
              arquitectura sin custodia.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacidad"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#131824] border border-[#222b3d] text-xs font-medium text-slate-200 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>Política de Privacidad</span>
            </Link>
            <Link
              href="/transparencia"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#131824] border border-[#222b3d] text-xs font-medium text-slate-200 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>Transparencia No-Custodial</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

