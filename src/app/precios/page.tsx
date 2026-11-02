"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PromoCarouselBanner } from "@/components/landing/PromoCarouselBanner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import {
  PlanCheckoutModal,
  type PlanCodeOption,
} from "@/components/plans/PlanCheckoutModal";
import { CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  const [selectedPlanCode, setSelectedPlanCode] =
    React.useState<PlanCodeOption | null>(null);
  const [selectedCouponCode, setSelectedCouponCode] = React.useState<
    string | null
  >(null);

  const handleOpenPlan = (plan: PlanCodeOption) => {
    setSelectedCouponCode(null);
    setSelectedPlanCode(plan);
  };

  const handleApplyBannerPromo = (couponCode: string) => {
    setSelectedCouponCode(couponCode);
    setSelectedPlanCode("business");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      {/* Cintillo de Carrusel con la Promoción Activa */}
      <PromoCarouselBanner onApplyPromo={handleApplyBannerPromo} />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <DemoNoticeBadge />
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Planes, Registro y Checkout Simulado
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Elige el plan que deseas probar, registra los datos de tu usuario comerciante y completa el pago en modo DEMO para acceder inmediatamente a tu panel operativo.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Trial */}
          <Card className="flex flex-col bg-[#101218] border-[#1f2533]">
            <CardHeader>
              <Badge variant="neutral" className="w-fit mb-2">Prueba</Badge>
              <CardTitle>Free Trial</CardTitle>
              <div className="mt-4 font-mono">
                <span className="text-3xl font-bold text-white">$0.00</span>
                <span className="text-xs text-slate-400 ml-1">/ 7 días</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between text-xs space-y-4">
              <ul className="space-y-2.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Todas las funciones de Business por 7 días
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Registro inmediato sin tarjeta real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Datos preservados al expirar
                </li>
              </ul>
              <Button
                variant="secondary"
                className="w-full mt-6"
                onClick={() => handleOpenPlan("free_trial")}
              >
                Elegir Free Trial y Crear Usuario
              </Button>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="flex flex-col bg-[#121622] border-[#00ff66]/50 relative shadow-[0_0_25px_rgba(0,255,102,0.1)]">
            <div className="absolute top-0 right-0 bg-[#00ff66] text-black text-[10px] font-mono font-bold px-3 py-1 rounded-bl-lg uppercase">
              Más Popular
            </div>
            <CardHeader>
              <Badge variant="neon" className="w-fit mb-2">Recomendado</Badge>
              <CardTitle>Business</CardTitle>
              <div className="mt-4 font-mono">
                <span className="text-3xl font-bold text-[#00ff66]">$29.00</span>
                <span className="text-xs text-slate-400 ml-1">/ mes (Ilustrativo)</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between text-xs space-y-4">
              <ul className="space-y-2.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Bitácora de operaciones ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Comisiones personalizadas para 7 países
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Exportaciones contables en Excel (.xlsx)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Catálogo privado de bancos y métodos
                </li>
              </ul>
              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={() => handleOpenPlan("business")}
              >
                Elegir Business y Pagar en Demo
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="flex flex-col bg-[#101218] border-[#1f2533]">
            <CardHeader>
              <Badge variant="cyber" className="w-fit mb-2">Avanzado</Badge>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-4 font-mono">
                <span className="text-3xl font-bold text-[#00f0ff]">$79.00</span>
                <span className="text-xs text-slate-400 ml-1">/ mes (Ilustrativo)</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between text-xs space-y-4">
              <ul className="space-y-2.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                  Todo lo incluido en Business
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                  Módulo de Mercado: Gráficos BTC, ETH, SOL, BNB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                  Feed de noticias de la industria en tiempo real
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => handleOpenPlan("enterprise")}
              >
                Elegir Enterprise y Pagar en Demo
              </Button>
            </CardContent>
          </Card>
        </div>

        <PlanCheckoutModal
          isOpen={selectedPlanCode !== null}
          onClose={() => {
            setSelectedPlanCode(null);
            setSelectedCouponCode(null);
          }}
          initialPlanCode={selectedPlanCode}
          initialCouponCode={selectedCouponCode}
        />
      </main>

      <Footer />
    </div>
  );
}
