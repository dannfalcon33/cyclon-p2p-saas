"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PromoCarouselBanner } from "@/components/landing/PromoCarouselBanner";
import { HeroDashboardSection } from "@/components/landing/HeroDashboardSection";
import { CompatibilityBar } from "@/components/landing/CompatibilityBar";
import { FeaturesGridSection } from "@/components/landing/FeaturesGridSection";
import { OperationalViewSection } from "@/components/landing/OperationalViewSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { FaqSection } from "@/components/landing/FaqSection";
import {
  PlanCheckoutModal,
  type PlanCodeOption,
} from "@/components/plans/PlanCheckoutModal";

export default function HomePage() {
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

      {/* Cintillo de Carrusel con la única Promoción Activa (debajo del Header) */}
      <PromoCarouselBanner onApplyPromo={handleApplyBannerPromo} />

      <main className="flex-1">
        {/* 1. Hero con Dashboard Operativo Realista */}
        <HeroDashboardSection onSelectPlan={handleOpenPlan} />

        {/* 2. Barra de Compatibilidad (Exchanges & Criptomonedas) */}
        <CompatibilityBar />

        {/* 3. Sección de Funcionalidades (4 bloques principales) */}
        <FeaturesGridSection />

        {/* 4. Vista Operativa (Distribución de volumen, rentabilidad y trazabilidad) */}
        <OperationalViewSection />

        {/* 5. Planes Comerciales (Free Trial, Business destacado, Enterprise) */}
        <PricingSection onSelectPlan={handleOpenPlan} />

        {/* 6. Seguridad Non-Custodial */}
        <SecuritySection />

        {/* 7. Testimonios y Preguntas Frecuentes (FAQ) */}
        <FaqSection />
      </main>

      {/* Modal de Registro de Usuario + Checkout Demo */}
      <PlanCheckoutModal
        isOpen={selectedPlanCode !== null}
        onClose={() => {
          setSelectedPlanCode(null);
          setSelectedCouponCode(null);
        }}
        initialPlanCode={selectedPlanCode}
        initialCouponCode={selectedCouponCode}
      />

      {/* 8. Footer Ampliado */}
      <Footer />
    </div>
  );
}
