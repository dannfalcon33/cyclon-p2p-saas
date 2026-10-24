"use server";

import { z } from "zod";
import { getBinanceUSDTMarketRates, BinanceP2PRateResult } from "@/lib/services/binance-p2p-service";

const querySchema = z.object({
  fiatCurrency: z.string().min(2).max(5),
});

/**
 * Obtiene el promedio de compra y venta de USDT en tiempo real desde Binance P2P.
 * No requiere autenticación especial (datos públicos de mercado).
 */
export async function fetchBinanceUSDTMarketRatesAction(
  fiatCurrency: string
): Promise<BinanceP2PRateResult> {
  const parsed = querySchema.parse({ fiatCurrency });
  return getBinanceUSDTMarketRates(parsed.fiatCurrency);
}
