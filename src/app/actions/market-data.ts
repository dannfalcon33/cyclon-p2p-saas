"use server";

import { z } from "zod";
import { getAuthenticatedWorkspace } from "@/lib/auth/session";
import { getWorkspaceSubscriptionDetails } from "@/lib/services/plan-service";
import {
  getLiveCryptoTickers,
  getLiveCryptoKlines,
  getLiveCryptoNews,
  getLatamP2POverview,
  CryptoTickerData,
  CryptoChartData,
  CryptoNewsItem,
  LatamP2POpportunity,
} from "@/lib/services/crypto-market-service";

const chartSchema = z.object({
  symbol: z.enum(["BTC", "ETH", "SOL", "BNB"]),
  range: z.enum(["1D", "7D", "1M"]).default("1D"),
});

/**
 * Valida que el usuario tenga acceso al módulo Enterprise antes de despachar datos
 */
async function verifyEnterpriseCapability(): Promise<void> {
  const { workspace } = await getAuthenticatedWorkspace();
  const sub = await getWorkspaceSubscriptionDetails(workspace.id);
  if (!sub.features.includes("enterprise_market_charts") && sub.planCode !== "enterprise") {
    throw new Error("Acceso restringido: Este módulo requiere suscripción Enterprise activa.");
  }
}

/**
 * Obtiene los tickers 24h en tiempo real de Binance para BTC, ETH, SOL y BNB
 */
export async function fetchLiveMarketTickersAction(): Promise<CryptoTickerData[]> {
  await verifyEnterpriseCapability();
  return getLiveCryptoTickers();
}

/**
 * Obtiene la serie histórica de precios para graficar el activo seleccionado
 */
export async function fetchLiveMarketChartAction(params: {
  symbol: "BTC" | "ETH" | "SOL" | "BNB";
  range?: "1D" | "7D" | "1M";
}): Promise<CryptoChartData> {
  await verifyEnterpriseCapability();
  const parsed = chartSchema.parse(params);
  return getLiveCryptoKlines(parsed.symbol, parsed.range);
}

/**
 * Obtiene el feed curado de noticias en español desde CriptoNoticias RSS
 */
export async function fetchLiveMarketNewsAction(): Promise<CryptoNewsItem[]> {
  await verifyEnterpriseCapability();
  return getLiveCryptoNews();
}

/**
 * Obtiene el monitor comparativo de arbitraje P2P en toda Latinoamérica
 */
export async function fetchLatamP2POverviewAction(): Promise<LatamP2POpportunity[]> {
  await verifyEnterpriseCapability();
  return getLatamP2POverview();
}
