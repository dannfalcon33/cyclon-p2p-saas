"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Zap, Globe, Scale, BarChart3 } from "lucide-react";

const CORE_FEATURES = [
  {
    title: "Bitácora de operaciones",
    description:
      "Registra y audita el historial completo de tus órdenes de compra y venta con filtros por exchange, país, banco y estado.",
    icon: Zap,
    accentBorder: "hover:border-[#00ff66]/50",
    iconBox:
      "bg-[#00ff66]/10 border-[#00ff66]/30 text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.15)]",
  },
  {
    title: "Comisiones por país y exchange",
    description:
      "Analiza tus costos reales con desglose de 3 cargos (exchange, banco y comisión propia) e historial inmutable por orden.",
    icon: Globe,
    accentBorder: "hover:border-[#00f0ff]/50",
    iconBox:
      "bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)]",
  },
  {
    title: "Control de balances",
    description:
      "Gestiona tus fondos cripto y divisas fiat por separado (VES, COP, BRL, ARS, USD, PEN, CLP) sin sumas engañosas.",
    icon: Scale,
    accentBorder: "hover:border-purple-500/50",
    iconBox:
      "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  },
  {
    title: "Reportes en Excel",
    description:
      "Exporta libros .XLSX multihop detallados con hojas de operaciones, resumen por moneda y comisiones para tu contabilidad.",
    icon: BarChart3,
    accentBorder: "hover:border-[#00ff66]/50",
    iconBox:
      "bg-[#00ff66]/10 border-[#00ff66]/30 text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.15)]",
  },
];

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FeaturesGridSection() {
  return (
    <section id="features" className="py-14 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {CORE_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.015 }}
                className={`group rounded-2xl bg-[#0e121b]/90 border border-[#1d2436] p-5 transition-colors duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${feat.accentBorder}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${feat.iconBox}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
