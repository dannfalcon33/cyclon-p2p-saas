import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export type PeriodFilter = "today" | "7d" | "30d" | "month" | "all";

export interface DashboardMetricsOptions {
  period?: PeriodFilter;
  fiatCurrency?: string; // Si se especifica, filtra las métricas fiat a esa divisa
}

export interface CryptoAssetVolume {
  symbol: string;
  totalAsset: string;
  buyAsset: string;
  sellAsset: string;
  operationsCount: number;
}

export interface FiatCurrencyMetrics {
  currency: string;
  totalFiat: string;
  buyFiat: string;
  sellFiat: string;
  operationsCount: number;
  merchantFee: string;
  exchangeFee: string;
  paymentCharge: string;
  totalFees: string;
  // Tasas promedio ponderadas (fiat / cripto) por activo para esta divisa
  ratesByAsset: Record<
    string,
    {
      buyAvgRate: string | null;
      sellAvgRate: string | null;
      overallAvgRate: string | null;
      grossSpread: string | null;
    }
  >;
}

export interface ExchangeDistribution {
  exchangeCode: string;
  name: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodDistribution {
  methodName: string;
  count: number;
  percentage: number;
}

export interface RecentOperationItem {
  id: string;
  occurredAt: string;
  exchangeCode: string;
  operationSide: "buy" | "sell";
  assetSymbol: string;
  assetAmount: string;
  fiatCurrency: string;
  fiatAmount: string;
  unitRate: string;
  status: "completed" | "pending" | "cancelled";
  paymentMethodName: string | null;
}

export interface MerchantDashboardMetrics {
  period: PeriodFilter;
  periodLabel: string;
  selectedFiatCurrency: string;
  availableFiatCurrencies: string[];
  kpis: {
    totalOperations: number;
    completedOperations: number;
    pendingOperations: number;
    cancelledOperations: number;
  };
  cryptoVolumes: CryptoAssetVolume[];
  fiatMetrics: Record<string, FiatCurrencyMetrics>;
  activeFiatMetric: FiatCurrencyMetrics | null;
  exchangeDistribution: ExchangeDistribution[];
  paymentMethodDistribution: PaymentMethodDistribution[];
  recentOperations: RecentOperationItem[];
  hasOperations: boolean;
}

/**
 * Calcula la fecha de inicio según el período seleccionado
 */
function getStartDateForPeriod(period: PeriodFilter): Date | null {
  const now = new Date();
  switch (period) {
    case "today": {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return today;
    }
    case "7d": {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    case "30d": {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }
    case "all":
    default:
      return null;
  }
}

function getPeriodLabel(period: PeriodFilter): string {
  switch (period) {
    case "today":
      return "Hoy";
    case "7d":
      return "Últimos 7 días";
    case "30d":
      return "Últimos 30 días";
    case "month":
      return "Este mes";
    case "all":
    default:
      return "Todo el historial";
  }
}

/**
 * Helper de formateo decimal seguro
 */
function toFixedStr(num: number, decimals: number): string {
  if (isNaN(num) || !isFinite(num)) return "0." + "0".repeat(decimals);
  return num.toFixed(decimals);
}

/**
 * Servicio centralizado para calcular métricas del Dashboard de Comerciante
 * Reglas mandatorias del MVP:
 * 1. Cada divisa fiat se totaliza por separado (cero mezclas de VES, USD, COP, BRL, ARS, etc.).
 * 2. Las operaciones canceladas se contabilizan para auditoría pero se EXCLUYEN de volúmenes operativos.
 * 3. Las tasas promedio son ponderadas por volumen: SUM(fiat) / SUM(asset).
 * 4. Aislamiento total por workspaceId.
 */
export async function getMerchantDashboardMetrics(
  workspaceId: string,
  options: DashboardMetricsOptions = {}
): Promise<MerchantDashboardMetrics> {
  const period: PeriodFilter = options.period || "30d";
  const startDate = getStartDateForPeriod(period);

  // 1. Construir condiciones de filtro de fecha y workspace
  const conditions = [eq(schema.p2pOperations.workspaceId, workspaceId)];
  if (startDate) {
    conditions.push(gte(schema.p2pOperations.occurredAt, startDate));
  }

  // 2. Obtener todas las operaciones dentro del rango para este workspace
  const operations = await db.query.p2pOperations.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.p2pOperations.occurredAt)],
  });

  // 3. Obtener monedas fiat configuradas en el workspace
  const settings = await db.query.workspaceSettings.findFirst({
    where: eq(schema.workspaceSettings.workspaceId, workspaceId),
  });
  const configuredFiats = (settings?.enabledFiatCurrencies as string[]) || ["VES", "USD"];

  // Conjunto de divisas observadas en operaciones + configuradas
  const fiatSet = new Set<string>(configuredFiats);
  for (const op of operations) {
    if (op.fiatCurrency) fiatSet.add(op.fiatCurrency);
  }
  const availableFiatCurrencies = Array.from(fiatSet);

  // Divisa activa seleccionada (prioridad: opción enviada -> moneda principal -> primera disponible -> 'VES')
  const selectedFiat =
    options.fiatCurrency && availableFiatCurrencies.includes(options.fiatCurrency)
      ? options.fiatCurrency
      : availableFiatCurrencies[0] || "VES";

  // 4. Conteo de operaciones por estado
  let totalCount = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  for (const op of operations) {
    totalCount++;
    if (op.status === "completed") completedCount++;
    else if (op.status === "pending") pendingCount++;
    else if (op.status === "cancelled") cancelledCount++;
  }

  // 5. Agrupaciones para operaciones COMPLETADAS
  // (Regla: sólo las operaciones completadas suman a volúmenes y tasas)
  const completedOps = operations.filter((op) => op.status === "completed");

  // A) Volúmenes Cripto
  const cryptoMap: Record<
    string,
    { total: number; buy: number; sell: number; count: number }
  > = {};

  // B) Métricas Fiat (estrictamente aisladas por divisa)
  const fiatMap: Record<
    string,
    {
      total: number;
      buy: number;
      sell: number;
      count: number;
      merchantFee: number;
      exchangeFee: number;
      paymentCharge: number;
      // Para promedios ponderados por criptoactivo
      ratesAccumulator: Record<
        string,
        {
          buyFiat: number;
          buyAsset: number;
          sellFiat: number;
          sellAsset: number;
          totalFiat: number;
          totalAsset: number;
        }
      >;
    }
  > = {};

  // Inicializar todas las divisas disponibles
  for (const f of availableFiatCurrencies) {
    fiatMap[f] = {
      total: 0,
      buy: 0,
      sell: 0,
      count: 0,
      merchantFee: 0,
      exchangeFee: 0,
      paymentCharge: 0,
      ratesAccumulator: {},
    };
  }

  // C) Distribución por Exchange
  const exchangeCounts: Record<string, number> = {};

  // D) Distribución por Método de Pago
  const methodCounts: Record<string, number> = {};

  for (const op of completedOps) {
    const asset = op.assetSymbol.toUpperCase();
    const fiat = op.fiatCurrency.toUpperCase();
    const assetAmt = parseFloat(op.assetAmount || "0");
    const fiatAmt = parseFloat(op.fiatAmount || "0");
    const merchFee = parseFloat(op.merchantFee || "0");
    const exchFee = parseFloat(op.exchangeFee || "0");
    const payCharge = parseFloat(op.paymentCharge || "0");
    const side = op.operationSide;

    // Cripto
    if (!cryptoMap[asset]) {
      cryptoMap[asset] = { total: 0, buy: 0, sell: 0, count: 0 };
    }
    cryptoMap[asset].total += assetAmt;
    cryptoMap[asset].count += 1;
    if (side === "buy") cryptoMap[asset].buy += assetAmt;
    if (side === "sell") cryptoMap[asset].sell += assetAmt;

    // Fiat
    if (!fiatMap[fiat]) {
      fiatMap[fiat] = {
        total: 0,
        buy: 0,
        sell: 0,
        count: 0,
        merchantFee: 0,
        exchangeFee: 0,
        paymentCharge: 0,
        ratesAccumulator: {},
      };
    }
    fiatMap[fiat].total += fiatAmt;
    fiatMap[fiat].count += 1;
    fiatMap[fiat].merchantFee += merchFee;
    fiatMap[fiat].exchangeFee += exchFee;
    fiatMap[fiat].paymentCharge += payCharge;

    if (side === "buy") fiatMap[fiat].buy += fiatAmt;
    if (side === "sell") fiatMap[fiat].sell += fiatAmt;

    // Acumulador de tasas ponderadas: fiat / asset
    if (!fiatMap[fiat].ratesAccumulator[asset]) {
      fiatMap[fiat].ratesAccumulator[asset] = {
        buyFiat: 0,
        buyAsset: 0,
        sellFiat: 0,
        sellAsset: 0,
        totalFiat: 0,
        totalAsset: 0,
      };
    }
    const acc = fiatMap[fiat].ratesAccumulator[asset];
    acc.totalFiat += fiatAmt;
    acc.totalAsset += assetAmt;
    if (side === "buy") {
      acc.buyFiat += fiatAmt;
      acc.buyAsset += assetAmt;
    } else if (side === "sell") {
      acc.sellFiat += fiatAmt;
      acc.sellAsset += assetAmt;
    }

    // Exchange
    const ex = op.exchangeCode || "other";
    exchangeCounts[ex] = (exchangeCounts[ex] || 0) + 1;

    // Método
    const methodName = op.paymentMethodNameSnapshot || "Otro método";
    methodCounts[methodName] = (methodCounts[methodName] || 0) + 1;
  }

  // 6. Formatear Volúmenes Cripto
  const cryptoVolumes: CryptoAssetVolume[] = Object.keys(cryptoMap).map((sym) => ({
    symbol: sym,
    totalAsset: toFixedStr(cryptoMap[sym].total, 8),
    buyAsset: toFixedStr(cryptoMap[sym].buy, 8),
    sellAsset: toFixedStr(cryptoMap[sym].sell, 8),
    operationsCount: cryptoMap[sym].count,
  }));

  // Ordenar cripto por conteo descendente
  cryptoVolumes.sort((a, b) => b.operationsCount - a.operationsCount);

  // 7. Formatear Métricas Fiat
  const formattedFiatMetrics: Record<string, FiatCurrencyMetrics> = {};
  for (const f of Object.keys(fiatMap)) {
    const raw = fiatMap[f];
    const ratesByAsset: Record<
      string,
      {
        buyAvgRate: string | null;
        sellAvgRate: string | null;
        overallAvgRate: string | null;
        grossSpread: string | null;
      }
    > = {};

    for (const asset of Object.keys(raw.ratesAccumulator)) {
      const r = raw.ratesAccumulator[asset];
      const buyAvg = r.buyAsset > 0 ? r.buyFiat / r.buyAsset : null;
      const sellAvg = r.sellAsset > 0 ? r.sellFiat / r.sellAsset : null;
      const overallAvg = r.totalAsset > 0 ? r.totalFiat / r.totalAsset : null;
      const spread = buyAvg !== null && sellAvg !== null ? sellAvg - buyAvg : null;

      ratesByAsset[asset] = {
        buyAvgRate: buyAvg !== null ? toFixedStr(buyAvg, 4) : null,
        sellAvgRate: sellAvg !== null ? toFixedStr(sellAvg, 4) : null,
        overallAvgRate: overallAvg !== null ? toFixedStr(overallAvg, 4) : null,
        grossSpread: spread !== null ? toFixedStr(spread, 4) : null,
      };
    }

    const totalFees = raw.merchantFee + raw.exchangeFee + raw.paymentCharge;

    formattedFiatMetrics[f] = {
      currency: f,
      totalFiat: toFixedStr(raw.total, 2),
      buyFiat: toFixedStr(raw.buy, 2),
      sellFiat: toFixedStr(raw.sell, 2),
      operationsCount: raw.count,
      merchantFee: toFixedStr(raw.merchantFee, 2),
      exchangeFee: toFixedStr(raw.exchangeFee, 2),
      paymentCharge: toFixedStr(raw.paymentCharge, 2),
      totalFees: toFixedStr(totalFees, 2),
      ratesByAsset,
    };
  }

  // 8. Formatear Distribución por Exchange
  const exchangeNames: Record<string, string> = {
    binance: "Binance P2P",
    bybit: "Bybit P2P",
    bitget: "Bitget P2P",
  };
  const totalCompleted = completedOps.length;
  const exchangeDistribution: ExchangeDistribution[] = Object.keys(exchangeCounts).map(
    (code) => ({
      exchangeCode: code,
      name: exchangeNames[code.toLowerCase()] || code.toUpperCase(),
      count: exchangeCounts[code],
      percentage:
        totalCompleted > 0
          ? Math.round((exchangeCounts[code] / totalCompleted) * 100)
          : 0,
    })
  );
  exchangeDistribution.sort((a, b) => b.count - a.count);

  // 9. Formatear Distribución por Método de Pago
  const paymentMethodDistribution: PaymentMethodDistribution[] = Object.keys(methodCounts).map(
    (name) => ({
      methodName: name,
      count: methodCounts[name],
      percentage:
        totalCompleted > 0
          ? Math.round((methodCounts[name] / totalCompleted) * 100)
          : 0,
    })
  );
  paymentMethodDistribution.sort((a, b) => b.count - a.count);

  // 10. Operaciones Recientes (Top 5)
  const recentOperations: RecentOperationItem[] = operations.slice(0, 5).map((op) => ({
    id: op.id,
    occurredAt: op.occurredAt.toISOString(),
    exchangeCode: op.exchangeCode,
    operationSide: op.operationSide as "buy" | "sell",
    assetSymbol: op.assetSymbol,
    assetAmount: toFixedStr(parseFloat(op.assetAmount || "0"), 4),
    fiatCurrency: op.fiatCurrency,
    fiatAmount: toFixedStr(parseFloat(op.fiatAmount || "0"), 2),
    unitRate: toFixedStr(parseFloat(op.unitRate || "0"), 2),
    status: op.status as "completed" | "pending" | "cancelled",
    paymentMethodName: op.paymentMethodNameSnapshot || null,
  }));

  return {
    period,
    periodLabel: getPeriodLabel(period),
    selectedFiatCurrency: selectedFiat,
    availableFiatCurrencies,
    kpis: {
      totalOperations: totalCount,
      completedOperations: completedCount,
      pendingOperations: pendingCount,
      cancelledOperations: cancelledCount,
    },
    cryptoVolumes,
    fiatMetrics: formattedFiatMetrics,
    activeFiatMetric: formattedFiatMetrics[selectedFiat] || null,
    exchangeDistribution,
    paymentMethodDistribution,
    recentOperations,
    hasOperations: operations.length > 0,
  };
}
