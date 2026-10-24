import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import {
  ArrowRight,
  Shield,
  FileSpreadsheet,
  DollarSign,
  CheckCircle2,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden radial-glow-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Demo Notice */}
            <div className="flex justify-center mb-6">
              <DemoNoticeBadge />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161922] border border-[#232938] text-xs font-mono text-slate-300 mb-6">
              <Sparkles className="w-4 h-4 text-[#00ff66]" />
              <span>MVP Mini-SaaS de Demostración para Comerciantes P2P</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
              El Centro de Mando para tus Operaciones{" "}
              <span className="text-[#00ff66] neon-text-glow">P2P de Cripto</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Registra, analiza y audita tus órdenes de compra y venta en{" "}
              <strong className="text-white">Binance, Bybit y Bitget</strong>. Configura tus comisiones por país, monitorea volúmenes sin mezclar divisas fiat y exporta reportes contables en Excel.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/registro" id="hero-cta-trial">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-base">
                  Iniciar Prueba de 7 Días
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/app" id="hero-cta-demo">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                  Explorar Dashboard Demo
                </Button>
              </Link>
            </div>

            {/* Supported Exchanges & Metrics Preview Banner */}
            <div className="mt-16 pt-8 border-t border-[#181d29] max-w-5xl mx-auto">
              <p className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-6">
                Compatibilidad Multi-Exchange y Monedas Oficiales
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#11131a]/80 border border-[#1f2533] text-left">
                  <div className="text-xs text-slate-400 font-mono">Exchanges</div>
                  <div className="text-sm font-bold text-white mt-1">Binance • Bybit • Bitget</div>
                </div>
                <div className="p-4 rounded-xl bg-[#11131a]/80 border border-[#1f2533] text-left">
                  <div className="text-xs text-slate-400 font-mono">Activos Cripto</div>
                  <div className="text-sm font-bold text-[#00ff66] mt-1 font-mono">USDT, USDC, BTC, ETH...</div>
                </div>
                <div className="p-4 rounded-xl bg-[#11131a]/80 border border-[#1f2533] text-left">
                  <div className="text-xs text-slate-400 font-mono">Países Soportados</div>
                  <div className="text-sm font-bold text-white mt-1">VE, CO, BR, AR, EC, PE, CL</div>
                </div>
                <div className="p-4 rounded-xl bg-[#11131a]/80 border border-[#1f2533] text-left">
                  <div className="text-xs text-slate-400 font-mono">Reportes</div>
                  <div className="text-sm font-bold text-[#00f0ff] mt-1 font-mono">Excel .XLSX Multihop</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars / Problem Solved */}
        <section id="features" className="py-20 bg-[#0b0d13] border-y border-[#181d29]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="neon" className="mb-3">
                Arquitectura Limpia
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Diseñado para la Realidad del Comerciante P2P
              </h2>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                Elimina las hojas de cálculo desordenadas. Cyclon P2P aísla cada concepto financiero para que nunca confundas comisiones bancarias, tarifas del exchange o márgenes propios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card hoverable className="glass-panel">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66] mb-3">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <CardTitle>Comisiones por País Configurables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <p>
                    No existen tarifas mágicas universales. Cada país, banco y lado de operación (compra o venta) tiene su propia regla porcentual o fija definida por ti.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                      Desglose de 3 cargos transparentes
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                      Snapshot histórico inmutable
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card hoverable className="glass-panel">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <CardTitle>Cero Mezcla Engañosa de Monedas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <p>
                    Otras herramientas suman dólares, pesos y bolívares en una sola cifra falsa. Cyclon P2P respeta la segregación estricta de divisas en cada reporte analítico.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      VES, COP, BRL, ARS, USD, PEN, CLP
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      Tasas promedio ponderadas
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card hoverable className="glass-panel">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <CardTitle>Exportación Excel Contable</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-400 leading-relaxed">
                  <p>
                    Genera libros `.xlsx` estructurados con hojas separadas de Operaciones, Resumen por Divisa y Comisiones, listos para tu contador.
                  </p>
                  <ul className="space-y-1.5 text-slate-300 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      Celdas numéricas nativas
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      Protección contra Formula Injection
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing / Plans Section */}
        <section id="pricing" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="warning" className="mb-3">
                Simulación de Suscripciones
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Planes Transparentes para Cada Escala
              </h2>
              <p className="mt-3 text-slate-400 text-sm">
                Precios ilustrativos de demostración. Puedes probar el flujo de checkout simulado sin introducir tarjetas ni cobros reales.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Plan 1: Free Trial */}
              <Card className="flex flex-col border-[#1f2533] bg-[#0e1017]">
                <CardHeader>
                  <Badge variant="neutral" className="w-fit mb-2">
                    7 Días Gratis
                  </Badge>
                  <CardTitle>Free Trial</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-white">$0.00</span>
                    <span className="text-xs text-slate-400">/ 7 días</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 text-xs text-slate-300">
                  <p className="text-slate-400">
                    Acceso completo para evaluar la plataforma y organizar tus operaciones iniciales.
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Operaciones y filtros ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Catálogo propio de bancos y métodos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Comisiones para 7 países
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Exportación Excel básica
                    </li>
                  </ul>
                  <div className="pt-6 mt-auto">
                    <Link href="/registro" className="w-full block">
                      <Button variant="secondary" className="w-full">
                        Comenzar Prueba
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Plan 2: Business (Featured) */}
              <Card className="flex flex-col border-[#00ff66]/50 bg-[#121620] relative shadow-[0_0_30px_rgba(0,255,102,0.1)]">
                <div className="absolute top-0 right-0 bg-[#00ff66] text-black text-[10px] font-mono font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Recomendado
                </div>
                <CardHeader>
                  <Badge variant="neon" className="w-fit mb-2">
                    Popular
                  </Badge>
                  <CardTitle>Business</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-[#00ff66]">$29.00</span>
                    <span className="text-xs text-slate-400">/ mes (Demo)</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 text-xs text-slate-300">
                  <p className="text-slate-400">
                    Para comerciantes activos con volumen recurrente que requieren auditoría y exportaciones continuas.
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Todo lo incluido en Free Trial
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Exportaciones Excel ilimitadas y filtradas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Soporte prioritario y notas de auditoría
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      Sin expiración de historial
                    </li>
                  </ul>
                  <div className="pt-6 mt-auto">
                    <Link href="/precios" className="w-full block">
                      <Button variant="primary" className="w-full">
                        Probar Checkout Demo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Plan 3: Enterprise */}
              <Card className="flex flex-col border-[#1f2533] bg-[#0e1017]">
                <CardHeader>
                  <Badge variant="cyber" className="w-fit mb-2">
                    Avanzado
                  </Badge>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-[#00f0ff]">$79.00</span>
                    <span className="text-xs text-slate-400">/ mes (Demo)</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 text-xs text-slate-300">
                  <p className="text-slate-400">
                    Monitoreo en tiempo real con cotizaciones de mercado y noticias especializadas.
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                      Todo lo incluido en Business
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                      Gráficos de mercado para BTC, ETH, SOL, BNB
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                      Feed de noticias cripto seleccionadas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                      Caché y adaptadores de alta disponibilidad
                    </li>
                  </ul>
                  <div className="pt-6 mt-auto">
                    <Link href="/precios" className="w-full block">
                      <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                        Probar Enterprise Demo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Non-Custodial Assurance */}
        <section className="py-16 bg-[#0a0c11] border-t border-[#181d29]">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-[#00ff66]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">Privacidad y Seguridad Garantizada</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Cyclon P2P <strong>no almacena claves privadas ni claves API de Binance, Bybit ni Bitget</strong>. Es una bitácora contable externa e independiente. Tus credenciales de exchanges nunca tocan nuestros servidores.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
