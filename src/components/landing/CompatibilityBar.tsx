"use client";

import * as React from "react";
import { motion } from "framer-motion";

const EXCHANGES = [
  {
    name: "BINANCE",
    color: "text-[#F3BA2F]",
    dot: "bg-[#F3BA2F]",
    border: "border-[#F3BA2F]/30 bg-[#F3BA2F]/5",
  },
  {
    name: "BYBIT",
    color: "text-white",
    dot: "bg-amber-400",
    border: "border-slate-700/80 bg-[#121622]",
  },
  {
    name: "BITGET",
    color: "text-[#00f0ff]",
    dot: "bg-[#00f0ff]",
    border: "border-[#00f0ff]/30 bg-[#00f0ff]/5",
  },
];

const CRYPTOS = [
  {
    code: "USDT",
    symbol: "₮",
    bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    iconBg: "bg-emerald-500 text-black",
  },
  {
    code: "USDC",
    symbol: "$",
    bg: "bg-sky-500/15 border-sky-500/40 text-sky-300",
    iconBg: "bg-sky-400 text-black",
  },
  {
    code: "BTC",
    symbol: "₿",
    bg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    iconBg: "bg-amber-400 text-black",
  },
  {
    code: "ETH",
    symbol: "Ξ",
    bg: "bg-indigo-500/15 border-indigo-500/40 text-indigo-300",
    iconBg: "bg-indigo-400 text-black",
  },
  {
    code: "BNB",
    symbol: "◆",
    bg: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
    iconBg: "bg-yellow-400 text-black",
  },
  {
    code: "SOL",
    symbol: "◎",
    bg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    iconBg: "bg-purple-400 text-black",
  },
];

export function CompatibilityBar() {
  return (
    <motion.section
      id="exchanges"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full border-y border-[#1a2130] bg-[#0a0d14]/90 backdrop-blur-md py-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Exchanges Soportados */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Exchanges soportados:
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {EXCHANGES.map((ex, idx) => (
              <motion.div
                key={ex.name}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ y: -2, scale: 1.04 }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-extrabold tracking-wider ${ex.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${ex.dot}`} />
                <span className={ex.color}>{ex.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block h-6 w-[1px] bg-[#1e2638]" />

        {/* Criptomonedas Soportadas */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Criptomonedas:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {CRYPTOS.map((coin, idx) => (
              <motion.div
                key={coin.code}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.15 + idx * 0.06 }}
                whileHover={{ y: -2, scale: 1.05 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${coin.bg}`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${coin.iconBg}`}
                >
                  {coin.symbol}
                </span>
                <span>{coin.code}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
