"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import { type PlanCodeOption } from "@/components/plans/PlanCheckoutModal";
import {
  Zap,
  ArrowRight,
  Play,
  ShieldCheck,
  Activity,
  Layers,
  LayoutDashboard,
  ListOrdered,
  Percent,
  Wallet,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

interface HeroDashboardSectionProps {
  onSelectPlan: (plan: PlanCodeOption) => void;
}

const RECENT_ORDERS = [
  {
    date: "01/11/2026",
    id: "#78425",
    country: "Venezuela",
    fiat: "VES",
    crypto: "USDT",
    amount: "$1,250.00",
    fee: "$37.50",
    profit: "+$62.50",
    status: "Completada",
    statusColor: "text-[#00ff66] bg-[#00ff66]/10 border-[#00ff66]/30",
    dotColor: "bg-[#00ff66]",
  },
  {
    date: "01/11/2026",
    id: "#78424",
    country: "Colombia",
    fiat: "COP",
    crypto: "USDT",
    amount: "$980.00",
    fee: "$29.40",
    profit: "+$48.20",
    status: "Completada",
    statusColor: "text-[#00ff66] bg-[#00ff66]/10 border-[#00ff66]/30",
    dotColor: "bg-[#00ff66]",
  },
  {
    date: "01/11/2026",
    id: "#78423",
    country: "Brasil",
    fiat: "BRL",
    crypto: "USDT",
    amount: "$1,530.00",
    fee: "$33.00",
    profit: "+$67.10",
    status: "En proceso",
    statusColor: "text-amber-300 bg-amber-500/10 border-amber-500/30",
    dotColor: "bg-amber-400",
  },
];

const leftContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUpItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const kpiContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.35,
    },
  },
};

const kpiCardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function HeroDashboardSection({
  onSelectPlan,
}: HeroDashboardSectionProps) {
  return (
    <section
      id="producto"
      className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden radial-glow-green"
    >
      {/* Efectos ambientales de iluminación */}
      <div className="pointer-events-none absolute -top-24 right-1/4 w-[480px] h-[480px] rounded-full bg-[#00ff66]/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full bg-[#00f0ff]/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Columna Izquierda: Propuesta de Valor & CTAs con aparición escalonada */}
          <motion.div
            className="lg:col-span-5 space-y-6 text-left"
            variants={leftContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUpItemVariants}
              className="flex flex-wrap items-center gap-2.5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-xs font-mono text-[#00ff66]">
                <Zap className="w-3.5 h-3.5" />
                <span>Control Operativo & Trazabilidad P2P</span>
              </div>
              <DemoNoticeBadge />
            </motion.div>

            <motion.h1
              variants={fadeUpItemVariants}
              className="text-4xl sm:text-5xl xl:text-[54px] font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Control total de tus operaciones{" "}
              <span className="text-[#00ff66] neon-text-glow">P2P</span>
            </motion.h1>

            <motion.p
              variants={fadeUpItemVariants}
              className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl"
            >
              Centraliza tus órdenes, comisiones por país, balances multimoneda y{" "}
              <strong className="text-white">trazabilidad contable</strong> en un
              solo panel auditable, con soporte para{" "}
              <strong className="text-white">Binance, Bybit y Bitget</strong>.
            </motion.p>

            {/* Botones CTA */}
            <motion.div
              variants={fadeUpItemVariants}
              className="flex flex-wrap items-center gap-3.5 pt-1"
            >
              <Button
                id="hero-cta-trial"
                variant="primary"
                size="lg"
                className="text-sm sm:text-base font-bold px-6 shadow-[0_0_25px_rgba(0,255,102,0.3)]"
                onClick={() => onSelectPlan("free_trial")}
              >
                Iniciar prueba gratis
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <Link href="/app" id="hero-cta-demo" prefetch={false}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-sm sm:text-base bg-[#111520]/90 border-[#263044] hover:border-[#00ff66]/50 px-5"
                >
                  <Play className="w-4 h-4 mr-1.5 text-[#00ff66] fill-[#00ff66]" />
                  Ver demo
                </Button>
              </Link>
            </motion.div>

            {/* Micro-indicadores de confianza */}
            <motion.div
              variants={fadeUpItemVariants}
              className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00ff66]" />
                <span>Sin custodia de fondos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#00f0ff]" />
                <span>Trazabilidad en tiempo real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Sin mezcla de divisas</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Columna Derecha: Mockup de Dashboard Operativo Realista */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-[#00ff66]/50 via-[#1f293d] to-[#00f0ff]/40 shadow-[0_0_50px_rgba(0,255,102,0.12)]">
              <div className="rounded-2xl bg-[#0b0e16]/95 backdrop-blur-xl border border-[#1c2333] overflow-hidden">
                {/* Barra Superior del Dashboard Mockup */}
                <div className="px-3.5 py-2.5 border-b border-[#181f2e] bg-[#080b11] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#00ff66]/15 border border-[#00ff66]/40 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-[#00ff66]" />
                    </div>
                    <span className="font-mono font-bold text-xs tracking-wider text-white">
                      CYCLON <span className="text-[#00ff66]">P2P</span>
                    </span>
                  </div>

                  {/* Filtros simulados */}
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                    <span className="px-2 py-1 rounded bg-[#121723] border border-[#222a3a] flex items-center gap-1">
                      Todos los exchanges <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="px-2 py-1 rounded bg-[#121723] border border-[#222a3a] flex items-center gap-1">
                      7 Países <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="px-2 py-1 rounded bg-[#121723] border border-[#00ff66]/30 text-[#00ff66] flex items-center gap-1">
                      USDT <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="hidden md:inline-flex px-2 py-0.5 rounded bg-[#121723] border border-[#222a3a] text-slate-400">
                      Últimos 30 días
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                      Auditado
                    </span>
                  </div>
                </div>

                {/* Cuerpo del Dashboard: Sidebar + Panel Principal */}
                <div className="grid grid-cols-12">
                  {/* Mini Sidebar Izquierda */}
                  <div className="hidden sm:flex sm:col-span-3 lg:col-span-2 border-r border-[#181f2e] bg-[#090c13] p-2.5 flex-col gap-1 text-[11px]">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#00ff66]/15 text-[#00ff66] font-semibold border border-[#00ff66]/30">
                      <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200">
                      <ListOrdered className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Órdenes</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200">
                      <Percent className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Comisiones</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200">
                      <Wallet className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Balances</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200">
                      <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Reportes</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 mt-auto">
                      <Settings className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Ajustes</span>
                    </div>
                  </div>

                  {/* Contenido Central del Mockup */}
                  <div className="col-span-12 sm:col-span-9 lg:col-span-10 p-3.5 sm:p-4 space-y-3.5">
                    {/* Fila de 3 KPIs con Sparklines */}
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                      variants={kpiContainerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* KPI 1 */}
                      <motion.div
                        variants={kpiCardVariants}
                        whileHover={{ y: -2 }}
                        className="p-3 rounded-xl bg-[#101420] border border-[#1d2538] relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Volumen operado</span>
                          <span className="font-mono text-[10px] text-[#00ff66]">USDT</span>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold font-mono text-white mt-0.5">
                          $248,760.50
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] font-mono text-[#00ff66] flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +12.5%
                          </span>
                          <svg className="w-16 h-5 stroke-[#00ff66] fill-none" viewBox="0 0 64 20">
                            <motion.path
                              d="M2 16 L14 12 L26 14 L38 7 L50 9 L62 2"
                              strokeWidth="2"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.2, delay: 0.5 }}
                            />
                          </svg>
                        </div>
                      </motion.div>

                      {/* KPI 2 */}
                      <motion.div
                        variants={kpiCardVariants}
                        whileHover={{ y: -2 }}
                        className="p-3 rounded-xl bg-[#101420] border border-[#1d2538] relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Órdenes trazadas</span>
                          <span className="font-mono text-[10px] text-[#00f0ff]">3 Exchanges</span>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold font-mono text-white mt-0.5">
                          1,248
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] font-mono text-[#00f0ff] flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +8.3%
                          </span>
                          <svg className="w-16 h-5 stroke-[#00f0ff] fill-none" viewBox="0 0 64 20">
                            <motion.path
                              d="M2 15 L15 14 L28 9 L40 11 L52 5 L62 3"
                              strokeWidth="2"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.2, delay: 0.65 }}
                            />
                          </svg>
                        </div>
                      </motion.div>

                      {/* KPI 3 */}
                      <motion.div
                        variants={kpiCardVariants}
                        whileHover={{ y: -2 }}
                        className="p-3 rounded-xl bg-[#101420] border border-[#1d2538] relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Ganancia neta</span>
                          <span className="font-mono text-[10px] text-purple-400">Post-comisión</span>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold font-mono text-[#00ff66] mt-0.5">
                          $12,540.30
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] font-mono text-purple-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +15.2%
                          </span>
                          <svg className="w-16 h-5 stroke-purple-400 fill-none" viewBox="0 0 64 20">
                            <motion.path
                              d="M2 17 L16 13 L28 12 L42 6 L54 7 L62 2"
                              strokeWidth="2"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.2, delay: 0.8 }}
                            />
                          </svg>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Fila Inferior: Tabla de Actividad Reciente + Gráfico de Volumen */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                      {/* Tabla de órdenes auditadas */}
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.55 }}
                        className="xl:col-span-8 rounded-xl bg-[#0d111a] border border-[#1b2233] p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-white">
                            Actividad reciente y desglose de comisiones
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Snapshot inmutable
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#181f2e] text-[10px] font-mono text-slate-400">
                                <th className="py-1.5 pr-2">Orden</th>
                                <th className="py-1.5 px-2">País</th>
                                <th className="py-1.5 px-2">Monto</th>
                                <th className="py-1.5 px-2">Comisión</th>
                                <th className="py-1.5 px-2">Ganancia</th>
                                <th className="py-1.5 pl-2 text-right">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#151b28] text-[11px] font-mono">
                              {RECENT_ORDERS.map((row, index) => (
                                <motion.tr
                                  key={row.id}
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    delay: 0.65 + index * 0.12,
                                  }}
                                  className="hover:bg-[#131926]/60"
                                >
                                  <td className="py-2 pr-2 text-slate-300">
                                    <span className="text-white font-semibold">{row.id}</span>
                                    <span className="block text-[9px] text-slate-500">
                                      {row.date}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-slate-200">
                                    {row.country}
                                    <span className="ml-1 text-[9px] text-slate-400">
                                      ({row.fiat})
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-white font-semibold">
                                    {row.amount}
                                  </td>
                                  <td className="py-2 px-2 text-amber-300">
                                    -{row.fee}
                                  </td>
                                  <td className="py-2 px-2 text-[#00ff66] font-semibold">
                                    {row.profit}
                                  </td>
                                  <td className="py-2 pl-2 text-right">
                                    <span
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] border ${row.statusColor}`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`}
                                      />
                                      {row.status}
                                    </span>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>

                      {/* Mini Gráfico de Volumen (USD) */}
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.7 }}
                        className="xl:col-span-4 rounded-xl bg-[#0d111a] border border-[#1b2233] p-3 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-white">
                              Volumen (USDT)
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Crecimiento mensual
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-[#00ff66]/15 border border-[#00ff66]/30 text-[#00ff66] font-mono text-[10px] font-bold">
                            +12.5%
                          </span>
                        </div>

                        <div className="my-2">
                          <svg
                            viewBox="0 0 180 85"
                            className="w-full h-24 overflow-visible"
                          >
                            <defs>
                              <linearGradient
                                id="heroVolGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#00ff66"
                                  stopOpacity="0.35"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#00ff66"
                                  stopOpacity="0.0"
                                />
                              </linearGradient>
                            </defs>
                            <motion.path
                              d="M5 72 L35 54 L65 60 L95 36 L125 42 L155 18 L175 10 L175 80 L5 80 Z"
                              fill="url(#heroVolGrad)"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.9, delay: 0.9 }}
                            />
                            <motion.path
                              d="M5 72 L35 54 L65 60 L95 36 L125 42 L155 18 L175 10"
                              fill="none"
                              stroke="#00ff66"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.3, delay: 0.75 }}
                            />
                            <motion.circle
                              cx="175"
                              cy="10"
                              r="3.5"
                              fill="#00ff66"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 1.8 }}
                            />
                          </svg>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-[#181f2e] pt-1.5">
                          <span>Sem 1</span>
                          <span>Sem 2</span>
                          <span>Sem 3</span>
                          <span className="text-[#00ff66]">Actual</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
