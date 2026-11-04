import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import {
  Lock,
  Database,
  EyeOff,
  Cookie,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  FileText,
} from "lucide-react";

const PRIVACY_SECTIONS = [
  {
    icon: Database,
    number: "01",
    title: "Datos Recopilados en el Entorno de Demostración",
    content: [
      "Para permitir la prueba interactiva del sistema multi-tenant y sus paneles operativos, Cyclon P2P almacena únicamente los datos básicos que el usuario decide introducir voluntariamente durante su sesión de prueba: nombre o alias comercial, dirección de correo electrónico (que puede ser ficticia o de prueba), contraseña cifrada mediante hash criptográfico y los registros contables simulados que cree en su Workspace.",
      "Estos datos se utilizan exclusivamente para renderizar el dashboard, calcular métricas de rentabilidad en tiempo real y generar los archivos descargables de Excel (.xlsx) dentro de la demostración.",
    ],
  },
  {
    icon: EyeOff,
    number: "02",
    title: "Información que NUNCA Solicitamos ni Almacenamos",
    content: [
      "Al tratarse de una aplicación demostrativa de portafolio con arquitectura no custodial, Cyclon P2P jamás solicita, procesa ni guarda:",
      "• Números de tarjetas de crédito, débito, CVV o datos bancarios reales.\n• Claves privadas de billeteras cripto, frases semilla (seed phrases) ni llaves API con permisos de retiro o trading en exchanges.\n• Documentos de identidad oficial (KYC), fotografías biométricas ni información fiscal sensible.",
    ],
  },
  {
    icon: Cookie,
    number: "03",
    title: "Uso de Cookies Técnicas y Sesiones",
    content: [
      "La plataforma utiliza únicamente cookies técnicas y de sesión estrictamente necesarias (gestionadas mediante Better Auth con firma criptográfica HMAC) para mantener la sesión autenticada del usuario entre recargas de página y proteger las rutas privadas (/app y /master).",
      "No utilizamos cookies publicitarias, rastreadores comerciales de terceros ni perfiles de marketing ni vendemos información a ninguna entidad.",
    ],
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Seguridad Técnica y Aislamiento de Workspaces",
    content: [
      "Los datos de demostración se alojan en una base de datos PostgreSQL Serverless (Neon) con conexiones cifradas mediante TLS/SSL. Las contraseñas nunca se guardan en texto plano.",
      "Cada cuenta registrada en la demo cuenta con aislamiento lógico por Workspace (workspace_id), asegurando que los catálogos de bancos, tasas y operaciones de prueba de un usuario no se mezclen con los de otros visitantes.",
    ],
  },
  {
    icon: Trash2,
    number: "05",
    title: "Retención y Depuración de Datos de Prueba",
    content: [
      "Dado que este sitio web es una demostración técnica para portafolio profesional y no un servicio comercial de almacenamiento permanente, la base de datos de demostración puede ser reiniciada o limpiada periódicamente.",
      "Se recomienda utilizar correos electrónicos de prueba y datos operativos ficticios al explorar la plataforma.",
    ],
  },
];

export default function PrivacidadPage() {
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
              className="px-3 py-1.5 rounded-lg bg-[#00ff66]/15 border border-[#00ff66]/50 text-[#00ff66] font-bold"
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
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Política de Privacidad
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Última actualización: Noviembre 2026 • Tratamiento de Datos en Modo Portafolio
              </p>
            </div>
          </div>
        </div>

        {/* Aviso Destacado de Portafolio */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/35 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Entorno de Demostración para Portafolio (No Producto Real)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong>Cyclon P2P es una demostración técnica de portafolio</strong>{" "}
            y no un servicio comercial real. No recolectamos información
            personal con fines comerciales ni procesamos pagos reales. Para
            probar la plataforma puedes emplear credenciales ficticias o de
            prueba con total libertad.
          </p>
        </div>

        {/* Secciones de Privacidad */}
        <div className="grid grid-cols-1 gap-6">
          {PRIVACY_SECTIONS.map((section) => {
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
                <div className="space-y-2.5 pl-0 sm:pl-12 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
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
              Revisa las condiciones generales de la demo y nuestra declaración de
              arquitectura sin custodia.
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

