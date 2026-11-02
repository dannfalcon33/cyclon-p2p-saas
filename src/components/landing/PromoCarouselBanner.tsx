"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, Copy, Check, ArrowRight } from "lucide-react";
import { fetchActivePromotionBannerAction } from "@/app/actions/plans";
import type { ActiveBannerPromotion } from "@/lib/services/plan-service";

interface PromoCarouselBannerProps {
  onApplyPromo?: (couponCode: string) => void;
}

export function PromoCarouselBanner({
  onApplyPromo,
}: PromoCarouselBannerProps) {
  const [promo, setPromo] = React.useState<ActiveBannerPromotion | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    fetchActivePromotionBannerAction()
      .then((res) => {
        if (mounted) setPromo(res);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!promo) return null;

  const discountLabel =
    promo.discountType === "percentage"
      ? `${parseFloat(promo.discountValue)}% OFF`
      : `$${parseFloat(promo.discountValue).toFixed(2)} USD OFF`;

  const plansLabel =
    promo.applicablePlans?.length > 0
      ? promo.applicablePlans.map((p) => p.toUpperCase()).join(" & ")
      : "TODOS LOS PLANES";

  const remainingLabel =
    promo.maxUses !== null
      ? `${Math.max(0, promo.maxUses - promo.timesUsed)} cupos disponibles`
      : "Cupos disponibles por tiempo limitado";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tickerItems = [
    `PROMOCIÓN EXCLUSIVA ACTIVA: ${discountLabel}`,
    `USA EL CÓDIGO: ${promo.code}`,
    promo.description,
    `APLICABLE EN PLANES: ${plansLabel}`,
    remainingLabel,
  ];

  return (
    <div className="w-full border-b border-[#00ff66]/35 bg-gradient-to-r from-[#07140d] via-[#0b1c15] to-[#08131d] text-slate-100 relative overflow-hidden z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-3">
        {/* Etiqueta fija izquierda */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00ff66] text-[#06080c] font-mono text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-[0_0_15px_rgba(0,255,102,0.4)]">
          <Sparkles className="w-3 h-3" />
          <span>Promo Activa</span>
        </div>

        {/* Cintillo de Carrusel en movimiento continuo (Framer Motion) */}
        <div className="flex-1 overflow-hidden relative mask-fade-edges">
          <motion.div
            className="flex items-center gap-8 whitespace-nowrap w-max font-mono text-xs"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...tickerItems, ...tickerItems].map((text, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 text-slate-200"
              >
                <Tag className="w-3.5 h-3.5 text-[#00ff66] shrink-0" />
                <span
                  className={
                    text.includes(promo.code) || text.includes("OFF")
                      ? "text-[#00ff66] font-bold"
                      : "text-slate-200"
                  }
                >
                  {text}
                </span>
                <span className="text-slate-600 ml-4">•</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Acciones rápidas derecha: Copiar código y Aplicar en Checkout */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            title="Copiar código de cupón"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0e1722] border border-[#00ff66]/40 hover:border-[#00ff66] text-[#00ff66] font-mono text-[11px] font-bold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{promo.code}</span>
              </>
            )}
          </button>

          {onApplyPromo && (
            <button
              type="button"
              onClick={() => onApplyPromo(promo.code)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#00ff66] hover:bg-[#00e55b] text-[#06080c] font-mono text-[11px] font-extrabold transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.3)]"
            >
              <span>Canjear</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

