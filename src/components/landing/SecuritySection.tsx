"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, Eye, CloudDownload, CheckCircle2 } from "lucide-react";

const SECURITY_CHECKLIST = [
  "Sin custodia de fondos ni conexión a billeteras",
  "Compatibilidad con múltiples exchanges (Binance, Bybit, Bitget)",
  "Conexión segura y aislamiento por Workspace",
  "Privacidad financiera y trazabilidad garantizada",
];

export function SecuritySection() {
  return (
    <section
      id="seguridad"
      className="py-16 lg:py-24 relative border-t border-[#161c2a] bg-[#070a10] overflow-hidden"
    >
      {/* Glow verde de fondo */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#00ff66]/10 blur-[130px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Columna 1: Escudo Visual con Monedas Flotantes Animadas */}
          <motion.div
            className="lg:col-span-4 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Anillos de energía */}
              <div className="absolute inset-2 rounded-full border border-[#00ff66]/20 animate-pulse" />
              <div className="absolute inset-8 rounded-full border border-[#00f0ff]/20" />

              {/* Monedas flotantes con movimiento continuo suave */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-3 right-4 w-11 h-11 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-mono font-extrabold text-base shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                ₿
              </motion.div>
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
                className="absolute bottom-6 left-2 w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-indigo-300 font-mono font-extrabold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                Ξ
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 2.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
                className="absolute bottom-4 right-6 w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-mono font-extrabold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                ₮
              </motion.div>

              {/* Escudo Central */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-36 h-40 rounded-3xl bg-gradient-to-b from-[#00ff66]/25 via-[#0e1726] to-[#090d16] border-2 border-[#00ff66] shadow-[0_0_45px_rgba(0,255,102,0.28)] flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#00ff66]/15 border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66]">
                  <Lock className="w-9 h-9" />
                </div>
                <span className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[#00ff66] font-bold">
                  Non-Custodial
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Columna 2: Explicación Central y 3 Pilares */}
          <motion.div
            className="lg:col-span-5 space-y-5 text-center lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-xs font-mono text-[#00ff66]">
              <span>Seguridad ante todo</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Tus claves y fondos permanecen bajo tu control
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">CYCLON P2P</strong> es una capa de
              control operativo, análisis y reportes contables externa.{" "}
              <strong className="text-[#00ff66]">
                No custodiamos tus fondos ni solicitamos claves privadas
              </strong>{" "}
              o llaves API de retiro de Binance, Bybit ni Bitget.
            </p>

            {/* 3 Iconos de arquitectura */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <motion.div
                whileHover={{ y: -4 }}
                className="p-3 rounded-xl bg-[#0d121d] border border-[#1c2436] flex flex-col items-center text-center gap-1.5"
              >
                <Lock className="w-5 h-5 text-[#00ff66]" />
                <span className="text-[11px] font-medium text-slate-200 leading-tight">
                  Sin claves privadas
                </span>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-3 rounded-xl bg-[#0d121d] border border-[#1c2436] flex flex-col items-center text-center gap-1.5"
              >
                <Eye className="w-5 h-5 text-[#00f0ff]" />
                <span className="text-[11px] font-medium text-slate-200 leading-tight">
                  Bitácora y auditoría
                </span>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-3 rounded-xl bg-[#0d121d] border border-[#1c2436] flex flex-col items-center text-center gap-1.5"
              >
                <CloudDownload className="w-5 h-5 text-purple-400" />
                <span className="text-[11px] font-medium text-slate-200 leading-tight">
                  Datos exportables
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Columna 3: Lista de Garantías */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl bg-[#0d111a]/90 border border-[#1c2436] p-5 space-y-3.5">
              {SECURITY_CHECKLIST.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.25 + idx * 0.1 }}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
