"use server";

import { z } from "zod";
import { getAuthenticatedWorkspace } from "@/lib/auth/session";
import { getWorkspaceSubscriptionDetails } from "@/lib/services/plan-service";
import {
  getMultiExchangeP2PComparison,
  getMultiExchangeSpotComparison,
  MultiExchangeP2PComparison,
  MultiExchangeSpotComparison,
} from "@/lib/services/multi-exchange-service";

const fiatSchema = z.object({
  fiatCurrency: z.string().min(2).max(5),
});

const spotSchema = z.object({
  symbol: z.enum(["BTC", "ETH", "SOL", "BNB"]).default("BTC"),
});

/**
 * Valida que el workspace tenga plan Enterprise activo
 */
async function verifyEnterprise(): Promise<void> {
  const { workspace } = await getAuthenticatedWorkspace();
  const sub = await getWorkspaceSubscriptionDetails(workspace.id);
  if (!sub.features.includes("enterprise_market_charts") && sub.planCode !== "enterprise") {
    throw new Error("Acceso restringido: Esta funcionalidad requiere el plan Enterprise.");
  }
}

/**
 * Obtiene la comparativa P2P en tiempo real entre Binance, Bybit y OKX
 */
export async function fetchMultiExchangeP2PAction(
  fiatCurrency: string
): Promise<MultiExchangeP2PComparison> {
  const parsed = fiatSchema.parse({ fiatCurrency });
  return getMultiExchangeP2PComparison(parsed.fiatCurrency);
}

/**
 * Obtiene la matriz comparativa Spot en tiempo real entre los 6 exchanges:
 * Binance, Bybit, OKX, Coinbase, Kraken y Bitget
 */
export async function fetchMultiExchangeSpotAction(
  symbol: "BTC" | "ETH" | "SOL" | "BNB" = "BTC"
): Promise<MultiExchangeSpotComparison> {
  const parsed = spotSchema.parse({ symbol });
  return getMultiExchangeSpotComparison(parsed.symbol);
}
