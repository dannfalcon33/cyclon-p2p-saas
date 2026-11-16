"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const testimonials = [
    {
      name: "Carlos M.",
      role: "Trader P2P • Venezuela / Colombia",
      initials: "CM",
      color: "bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40",
      quote: t.faq.testimonial1Quote,
    },
    {
      name: "María G.",
      role: "Comerciante P2P • Brasil / Argentina",
      initials: "MG",
      color: "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40",
      quote: t.faq.testimonial2Quote,
    },
    {
      name: "Andrés R.",
      role: "Mesa P2P Profesional • Perú / Chile",
      initials: "AR",
      color: "bg-purple-500/15 text-purple-400 border-purple-500/40",
      quote: t.faq.testimonial3Quote,
    },
  ];

  const faqItems = [
    {
      question: t.faq.q1,
      answer: t.faq.a1,
    },
    {
      question: t.faq.q2,
      answer: t.faq.a2,
    },
    {
      question: t.faq.q3,
      answer: t.faq.a3,
    },
    {
      question: t.faq.q4,
      answer: t.faq.a4,
    },
    {
      question: t.faq.q5,
      answer: t.faq.a5,
    },
  ];

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
                {t.faq.testimonialsTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {t.faq.testimonialsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {testimonials.map((item, idx) => (
                <motion.div
                  key={item.name}
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
                        className={`w-9 h-9 rounded-full border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${item.color}`}
                      >
                        {item.initials}
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
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#171e2d]">
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {item.role}
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
                {t.faq.faqTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {t.faq.faqSubtitle}
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => {
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
                      className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
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
