"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type PlanCodeOption } from "@/components/plans/PlanCheckoutModal";
import { CheckCircle2 } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan: (plan: PlanCodeOption) => void;
}

const pricingGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const planCardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="py-16 lg:py-24 relative border-t border-[#161c2a]"
    >
      {/* Glow ambiental */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] rounded-full bg-[#00ff66]/10 blur-[140px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-xs font-mono text-[#00ff66]">
            <span>Planes flexibles</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Planes transparentes para cada escala
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Elige el plan que se adapte a tu operación, introduce tus datos de
            usuario y activa tu cuenta hoy mismo mediante checkout Demo sin
            cobros reales.
          </p>
        </motion.div>

        {/* Grid de 3 Planes */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch"
          variants={pricingGridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Plan 1: Free Trial */}
          <motion.div
            variants={planCardVariants}
            whileHover={{ y: -6 }}
            className="rounded-2xl bg-[#0d111a]/90 border border-[#1d2436] p-6 flex flex-col justify-between transition-colors hover:border-slate-600"
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Free Trial</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluación operativa completa
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] font-mono text-[10px] font-bold uppercase">
                  7 Días Gratis
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-extrabold text-white">$0.00</span>
                <span className="text-xs text-slate-400">/ 7 días</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 pt-2 border-t border-[#182030]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Acceso completo al dashboard y bitácora</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Comisiones configurables para 7 países</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Reportes básicos en Excel (.xlsx)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Catálogo privado de bancos y métodos</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6">
              <Button
                variant="secondary"
                className="w-full bg-[#131926] border-[#263147] hover:border-[#00ff66]/50 text-white"
                onClick={() => onSelectPlan("free_trial")}
              >
                Comenzar prueba
              </Button>
            </div>
          </motion.div>

          {/* Plan 2: Business (Destacado) */}
          <motion.div
            variants={planCardVariants}
            whileHover={{ y: -8, scale: 1.01 }}
            className="rounded-2xl bg-[#101624] border-2 border-[#00ff66] p-6 flex flex-col justify-between relative shadow-[0_0_40px_rgba(0,255,102,0.16)] lg:-translate-y-1"
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Business</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Control operativo y contable continuo
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00ff66] text-[#08090d] font-mono text-[10px] font-extrabold uppercase tracking-wider">
                  Más Popular
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-extrabold text-[#00ff66]">
                  $29.00
                </span>
                <span className="text-xs text-slate-400">/ mes (Demo)</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-200 pt-2 border-t border-[#1e293d]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Todas las funcionalidades operativas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Reportes avanzados Excel (.xlsx) multihop</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Trazabilidad histórica sin expiración</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Soporte prioritario y auditoría de márgenes</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6">
              <Button
                variant="primary"
                className="w-full font-bold text-sm shadow-[0_0_25px_rgba(0,255,102,0.3)]"
                onClick={() => onSelectPlan("business")}
              >
                Probar Business
              </Button>
            </div>
          </motion.div>

          {/* Plan 3: Enterprise */}
          <motion.div
            variants={planCardVariants}
            whileHover={{ y: -6 }}
            className="rounded-2xl bg-[#0d111a]/90 border border-[#1d2436] p-6 flex flex-col justify-between transition-colors hover:border-[#00f0ff]/50"
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Enterprise</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inteligencia de mercado y alto volumen
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] font-bold uppercase">
                  Avanzado
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-extrabold text-white">
                  $79.00
                </span>
                <span className="text-xs text-slate-400">/ mes (Demo)</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 pt-2 border-t border-[#182030]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>Todo lo incluido en el plan Business</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span>Módulo de Mercado: Gráficos BTC, ETH, SOL, BNB</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span>Feed de noticias cripto y alertas en vivo</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span>Soporte dedicado y acuerdo empresarial</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6">
              <Button
                variant="secondary"
                className="w-full bg-[#131926] border-[#263147] hover:border-[#00f0ff]/60 text-white"
                onClick={() => onSelectPlan("enterprise")}
              >
                Probar Enterprise
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
