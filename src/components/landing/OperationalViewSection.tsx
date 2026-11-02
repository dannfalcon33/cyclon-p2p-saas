"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { CheckCircle2, TrendingUp } from "lucide-react";

const OPERATIONAL_BENEFITS = [
  "Historial unificado de órdenes con snapshot inmutable de comisión",
  "Filtros avanzados por exchange, país, divisa fiat y método de pago",
  "Cálculo exacto de ganancias y comisiones sin mezclar monedas",
  "Trazabilidad 100% auditable lista para conciliación contable",
];

const rightColumnVariants: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.12,
    },
  },
};

const rightItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function OperationalViewSection() {
  return (
    <section
      id="operativa"
      className="py-16 lg:py-24 relative overflow-hidden border-t border-[#161c2a]"
    >
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#00ff66]/8 blur-[130px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Columna Izquierda: Panel Visual de Distribución de Volumen y Rentabilidad */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -35, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#00ff66]/40 via-[#1d2536] to-purple-500/30 shadow-[0_0_40px_rgba(0,255,102,0.08)]">
              <div className="rounded-2xl bg-[#0b0e16]/95 border border-[#1b2233] p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Bloque 1: Distribución de Volumen (Donut + Leyenda) */}
                  <div className="sm:col-span-5 space-y-4 border-b sm:border-b-0 sm:border-r border-[#1a2233] pb-5 sm:pb-0 sm:pr-5">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Distribución de Volumen
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Trazabilidad por plataforma
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Donut Chart SVG */}
                      <motion.div
                        className="relative w-28 h-28 shrink-0"
                        initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                        whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                      >
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="transparent"
                            stroke="#182030"
                            strokeWidth="5"
                          />
                          {/* Binance 42% */}
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="transparent"
                            stroke="#00ff66"
                            strokeWidth="5"
                            strokeDasharray="37 88"
                            strokeDashoffset="0"
                          />
                          {/* Bybit 33% */}
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="transparent"
                            stroke="#00f0ff"
                            strokeWidth="5"
                            strokeDasharray="29 88"
                            strokeDashoffset="-37"
                          />
                          {/* Bitget 25% */}
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="transparent"
                            stroke="#a855f7"
                            strokeWidth="5"
                            strokeDasharray="22 88"
                            strokeDashoffset="-66"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-mono text-slate-400">
                            Total
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            100%
                          </span>
                        </div>
                      </motion.div>

                      {/* Leyenda */}
                      <div className="space-y-2.5 text-xs font-mono flex-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#00ff66]" />
                            Binance
                          </span>
                          <span className="text-[#00ff66] font-bold">42%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#00f0ff]" />
                            Bybit
                          </span>
                          <span className="text-[#00f0ff] font-bold">33%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                            Bitget
                          </span>
                          <span className="text-purple-400 font-bold">25%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 2: Curva de Rentabilidad y Control de Ganancia Neta */}
                  <div className="sm:col-span-7 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Curva de Rentabilidad Auditada
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Margen real descontando 3 niveles de comisión
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                        <TrendingUp className="w-3.5 h-3.5" /> +12.5%
                      </span>
                    </div>

                    {/* Gráfico SVG con barras y línea ascendente */}
                    <div className="relative pt-2">
                      <svg
                        viewBox="0 0 320 140"
                        className="w-full h-36 overflow-visible"
                      >
                        <defs>
                          <linearGradient
                            id="opLineGlow"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#00ff66"
                              stopOpacity="0.28"
                            />
                            <stop
                              offset="100%"
                              stopColor="#00ff66"
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>

                        {/* Líneas guía horizontales */}
                        <line
                          x1="0"
                          y1="30"
                          x2="320"
                          y2="30"
                          stroke="#182032"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1="0"
                          y1="70"
                          x2="320"
                          y2="70"
                          stroke="#182032"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1="0"
                          y1="110"
                          x2="320"
                          y2="110"
                          stroke="#182032"
                          strokeDasharray="3 3"
                        />

                        {/* Barras de volumen de fondo */}
                        {[
                          { x: 20, h: 35 },
                          { x: 65, h: 52 },
                          { x: 110, h: 46 },
                          { x: 155, h: 70 },
                          { x: 200, h: 64 },
                          { x: 245, h: 92 },
                          { x: 290, h: 110 },
                        ].map((bar, idx) => (
                          <rect
                            key={idx}
                            x={bar.x}
                            y={125 - bar.h}
                            width="16"
                            height={bar.h}
                            rx="3"
                            fill="#00ff66"
                            fillOpacity={idx === 6 ? "0.35" : "0.14"}
                          />
                        ))}

                        {/* Área y curva de ganancia */}
                        <motion.path
                          d="M28 100 L73 82 L118 88 L163 58 L208 64 L253 34 L298 14 L298 125 L28 125 Z"
                          fill="url(#opLineGlow)"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: 0.45 }}
                        />
                        <motion.path
                          d="M28 100 L73 82 L118 88 L163 58 L208 64 L253 34 L298 14"
                          fill="none"
                          stroke="#00ff66"
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.3, delay: 0.25 }}
                        />
                        <circle
                          cx="298"
                          cy="14"
                          r="5"
                          fill="#00ff66"
                          className="animate-pulse"
                        />
                      </svg>

                      {/* Tarjeta Flotante de Ganancia Neta */}
                      <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.55 }}
                        whileHover={{ scale: 1.03 }}
                        className="sm:absolute sm:bottom-2 sm:right-2 mt-2 sm:mt-0 p-3 rounded-xl bg-[#0e131f]/95 border border-[#00ff66]/40 shadow-[0_0_25px_rgba(0,255,102,0.15)] backdrop-blur-md"
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          Ganancia Neta Conciliada
                        </div>
                        <div className="text-xl font-mono font-extrabold text-white mt-0.5">
                          $12,540.30{" "}
                          <span className="text-xs font-normal text-[#00ff66]">
                            USDT
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Narrativa de Control Operativo y Trazabilidad */}
          <motion.div
            className="lg:col-span-5 space-y-5"
            variants={rightColumnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div
              variants={rightItemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-xs font-mono text-[#00ff66]"
            >
              <span>Potencia tu negocio P2P</span>
            </motion.div>

            <motion.h2
              variants={rightItemVariants}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight"
            >
              Opera con precisión y maximiza tus ganancias
            </motion.h2>

            <motion.p
              variants={rightItemVariants}
              className="text-sm sm:text-base text-slate-300 leading-relaxed"
            >
              Obtén control operativo real sobre tu actividad P2P. A diferencia
              de una hoja de cálculo común, Cyclon P2P audita cada orden y
              preserva la trazabilidad exacta de tus márgenes por país, banco y
              plataforma.
            </motion.p>

            <motion.ul
              variants={rightItemVariants}
              className="space-y-3 pt-1"
            >
              {OPERATIONAL_BENEFITS.map((item, idx) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.25 + idx * 0.1 }}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
