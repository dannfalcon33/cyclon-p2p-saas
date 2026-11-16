"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type PlanCodeOption } from "@/components/plans/PlanCheckoutModal";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  const { t } = useLanguage();

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
            <span>{t.pricing.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t.pricing.title}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            {t.pricing.subtitle}
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
                  <h3 className="text-lg font-bold text-white">
                    {t.pricing.trialName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.pricing.trialBadge}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] font-mono text-[10px] font-bold uppercase">
                  {t.pricing.trialPeriod}
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-extrabold text-white">
                  {t.pricing.trialPrice}
                </span>
                <span className="text-xs text-slate-400">
                  {t.pricing.trialPeriod}
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 pt-2 border-t border-[#182030]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.trialItem1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.trialItem2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.trialItem3}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6">
              <Button
                variant="secondary"
                className="w-full bg-[#131926] border-[#263147] hover:border-[#00ff66]/50 text-white"
                onClick={() => onSelectPlan("free_trial")}
              >
                {t.pricing.trialBtn}
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
                  <h3 className="text-lg font-bold text-white">
                    {t.pricing.businessName}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {t.pricing.recommendedBadge}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00ff66] text-[#08090d] font-mono text-[10px] font-extrabold uppercase tracking-wider">
                  {t.pricing.popularBadge}
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-extrabold text-[#00ff66]">
                  {t.pricing.businessPrice}
                </span>
                <span className="text-xs text-slate-400">
                  {t.pricing.businessPeriod}
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-200 pt-2 border-t border-[#1e293d]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.businessItem1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.businessItem2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.businessItem3}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.businessItem4}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6">
              <Button
                variant="primary"
                className="w-full font-bold text-sm shadow-[0_0_25px_rgba(0,255,102,0.3)]"
                onClick={() => onSelectPlan("business")}
              >
                {t.pricing.businessBtn}
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
                  <h3 className="text-lg font-bold text-white">
                    {t.pricing.enterpriseName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.pricing.advancedBadge}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] font-bold uppercase">
                  {t.pricing.advancedBadge}
                </span>
              </div>

              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-extrabold text-white">
                  {t.pricing.enterprisePrice}
                </span>
                <span className="text-xs text-slate-400">
                  {t.pricing.enterprisePeriod}
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 pt-2 border-t border-[#182030]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                  <span>{t.pricing.enterpriseItem1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span>{t.pricing.enterpriseItem2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span>{t.pricing.enterpriseItem3}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span>{t.pricing.enterpriseItem4}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6">
              <Button
                variant="secondary"
                className="w-full bg-[#131926] border-[#263147] hover:border-[#00f0ff]/60 text-white"
                onClick={() => onSelectPlan("enterprise")}
              >
                {t.pricing.enterpriseBtn}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
