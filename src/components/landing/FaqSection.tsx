"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Carlos M.",
    role: "Trader P2P • Venezuela / Colombia",
    initials: "CM",
    color: "bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40",
    quote:
      "Cyclon P2P me dio el control operativo que necesitaba. Por fin veo mis márgenes netos en VES y COP sin mezclar monedas.",
  },
  {
    name: "María G.",
    role: "Comerciante P2P • Brasil / Argentina",
    initials: "MG",
    color: "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40",
    quote:
      "El desglose de comisiones por banco y exchange es impecable. Cada orden guarda su snapshot y mi contabilidad cierra al centavo.",
  },
  {
    name: "Andrés R.",
    role: "Mesa P2P Profesional • Perú / Chile",
    initials: "AR",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/40",
    quote:
      "Excelente herramienta para escalar operaciones en Binance y Bybit. La exportación a Excel multihop nos ahorra horas cada semana.",
  },
];

const FAQ_ITEMS = [
  {
    question: "¿Qué exchanges y criptomonedas son compatibles?",
    answer:
      "Cyclon P2P soporta el registro y auditoría de órdenes en Binance, Bybit, Bitget y operaciones OTC directas, trabajando con USDT, USDC, BTC, ETH, BNB y SOL en 7 países de Latinoamérica.",
  },
  {
    question: "¿Cómo se calculan y auditan las comisiones?",
    answer:
      "Puedes configurar perfiles de comisión por país, método de pago y lado (compra/venta). Cada orden desglosa 3 niveles (comisión de exchange, impuesto/cargo bancario y comisión propia) y guarda un snapshot histórico inmutable.",
  },
  {
    question: "¿Se mantienen o custodian mis fondos dentro de la plataforma?",
    answer:
      "No. Cyclon P2P es una plataforma 100% no-custodial de control operativo y trazabilidad contable. Nunca solicitamos tus claves privadas ni llaves API de retiro.",
  },
  {
    question: "¿Qué formatos de exportación contable están disponibles?",
    answer:
      "Puedes exportar tus operaciones filtradas en libros Excel (.XLSX) nativos con hojas separadas de Operaciones, Resumen por Divisa Fiat y Desglose de Comisiones, protegidos contra inyección de fórmulas.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-16 lg:py-24 relative border-t border-[#161c2a]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Columna Izquierda: Lo que dicen nuestros usuarios */}
          <motion.div
            className="lg:col-span-7 space-y-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Lo que dicen nuestros usuarios
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Comerciantes P2P que profesionalizaron su control operativo y
                trazabilidad diaria.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t, idx) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.12 }}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl bg-[#0d111a]/90 border border-[#1d2436] p-4 flex flex-col justify-between space-y-4 hover:border-[#00ff66]/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${t.color}`}
                      >
                        {t.initials}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className="w-3.5 h-3.5 fill-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#171e2d]">
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {t.role}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Columna Derecha: Preguntas Frecuentes (FAQ) con AnimatePresence */}
          <motion.div
            className="lg:col-span-5 space-y-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Preguntas frecuentes
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Resuelve tus dudas antes de activar tu prueba gratuita.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <motion.div
                    key={item.question}
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                    className={`rounded-xl border transition-colors overflow-hidden ${
                      isOpen
                        ? "bg-[#101522] border-[#00ff66]/50 shadow-[0_0_20px_rgba(0,255,102,0.08)]"
                        : "bg-[#0d111a] border-[#1d2436] hover:border-slate-600"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {item.question}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-[#161d2e] border border-[#242e44] flex items-center justify-center text-[#00ff66] shrink-0">
                        {isOpen ? (
                          <Minus className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-[#1a2233] pt-3">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
