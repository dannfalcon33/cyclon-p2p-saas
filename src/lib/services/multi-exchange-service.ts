/**
 * Servicio Multi-Exchange en Tiempo Real (APIs 100% Públicas y Gratuitas, 0-Key)
 *
 * Soporta los 4 exchanges seleccionados:
 * 1. Binance (P2P + Spot)
 * 2. Bybit (P2P + Spot V5)
 * 3. Kraken (Spot Public Ticker Bid/Ask)
 * 4. Bitget (Spot Public V2 Ticker Bid/Ask)
 *
 * Incluye cálculo de oportunidades de arbitraje inter-exchange y caché en memoria (TTL).
 */

import { getBinanceUSDTMarketRates } from "./binance-p2p-service";

export interface ExchangeP2PRate {
  exchange: "binance" | "bybit";
  exchangeName: string;
  asset: string;
  fiat: string;
  buyAvg: number;
  sellAvg: number;
  spreadPercent: number;
  isAvailable: boolean;
  orderCount: number;
}

export interface MultiExchangeP2PComparison {
  fiat: string;
  asset: string;
  exchanges: ExchangeP2PRate[];
  bestBuy: { exchange: string; exchangeName: string; price: number };
  bestSell: { exchange: string; exchangeName: string; price: number };
  arbitrageSpreadPercent: number;
  updatedAt: string;
}

export interface ExchangeSpotRate {
  exchange: "binance" | "bybit" | "kraken" | "bitget";
  exchangeName: string;
  symbol: string;
  buyPrice: number; // Ask / precio para comprar
  sellPrice: number; // Bid / precio para vender
  lastPrice: number;
  spreadPercent: number;
  isAvailable: boolean;
  statusMessage?: string;
}

export interface MultiExchangeSpotComparison {
  symbol: "BTC" | "ETH" | "SOL" | "BNB";
  exchanges: ExchangeSpotRate[];
  lowestAsk: { exchange: string; exchangeName: string; price: number };
  highestBid: { exchange: string; exchangeName: string; price: number };
  arbitrageSpreadPercent: number;
  updatedAt: string;
}

// ------------------- Caches en Memoria -------------------
const P2P_CACHE_TTL_MS = 45 * 1000; // 45s
const p2pComparisonCache = new Map<string, { data: MultiExchangeP2PComparison; timestamp: number }>();

const SPOT_CACHE_TTL_MS = 25 * 1000; // 25s
const spotComparisonCache = new Map<string, { data: MultiExchangeSpotComparison; timestamp: number }>();

// ------------------- Consultas P2P -------------------

/**
 * Consulta Bybit P2P (BAPI pública sin API key)
 */
async function fetchBybitP2PRates(fiat: string): Promise<ExchangeP2PRate> {
  const defaultRes: ExchangeP2PRate = {
    exchange: "bybit",
    exchangeName: "Bybit P2P",
    asset: "USDT",
    fiat: fiat.toUpperCase(),
    buyAvg: 0,
    sellAvg: 0,
    spreadPercent: 0,
    isAvailable: false,
    orderCount: 0,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3800);

    const [buyRes, sellRes] = await Promise.all([
      fetch("https://api2.bybit.com/fiat/otc/item/online", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          tokenId: "USDT",
          currencyId: fiat.toUpperCase(),
          side: "1", // compras
          size: "5",
          page: "1",
        }),
        signal: controller.signal,
      }).then((r) => r.json()),
      fetch("https://api2.bybit.com/fiat/otc/item/online", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          tokenId: "USDT",
          currencyId: fiat.toUpperCase(),
          side: "0", // ventas
          size: "5",
          page: "1",
        }),
        signal: controller.signal,
      }).then((r) => r.json()),
    ]);

    clearTimeout(timeout);

    const buyPrices: number[] =
      buyRes?.result?.items?.map((i: any) => parseFloat(i.price)).filter((p: number) => !isNaN(p) && p > 0) || [];
    const sellPrices: number[] =
      sellRes?.result?.items?.map((i: any) => parseFloat(i.price)).filter((p: number) => !isNaN(p) && p > 0) || [];

    const buyAvg = buyPrices.length ? buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length : 0;
    const sellAvg = sellPrices.length ? sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length : 0;

    const spreadPercent =
      buyAvg > 0 && sellAvg > 0 ? parseFloat(Math.abs(((sellAvg - buyAvg) / buyAvg) * 100).toFixed(2)) : 0;

    return {
      exchange: "bybit",
      exchangeName: "Bybit P2P",
      asset: "USDT",
      fiat: fiat.toUpperCase(),
      buyAvg: parseFloat(buyAvg.toFixed(4)),
      sellAvg: parseFloat(sellAvg.toFixed(4)),
      spreadPercent,
      isAvailable: buyAvg > 0 || sellAvg > 0,
      orderCount: buyPrices.length + sellPrices.length,
    };
  } catch {
    return defaultRes;
  }
}

/**
 * 1. Obtiene comparativa P2P en tiempo real entre Binance y Bybit para una divisa fiat
 */
export async function getMultiExchangeP2PComparison(
  fiatCurrency: string
): Promise<MultiExchangeP2PComparison> {
  const fiat = fiatCurrency.trim().toUpperCase();
  const now = Date.now();
  const cached = p2pComparisonCache.get(fiat);

  if (cached && now - cached.timestamp < P2P_CACHE_TTL_MS) {
    return cached.data;
  }

  // Consultar Binance y Bybit en paralelo
  const [binanceP2P, bybitP2P] = await Promise.all([
    getBinanceUSDTMarketRates(fiat).then((b) => ({
      exchange: "binance" as const,
      exchangeName: "Binance P2P",
      asset: "USDT",
      fiat,
      buyAvg: b.buyAvg,
      sellAvg: b.sellAvg,
      spreadPercent: b.spreadPercent,
      isAvailable: b.buyAvg > 0 || b.sellAvg > 0,
      orderCount: b.orderCountBuy + b.orderCountSell,
    })),
    fetchBybitP2PRates(fiat),
  ]);

  const activeExchanges = [binanceP2P, bybitP2P].filter((e) => e.isAvailable && e.buyAvg > 0);

  // Mejor precio de compra (el más barato para el usuario que quiere comprar USDT)
  let bestBuy = { exchange: "binance", exchangeName: "Binance P2P", price: binanceP2P.buyAvg };
  if (activeExchanges.length > 0) {
    const minBuy = activeExchanges.reduce((prev, curr) => (curr.buyAvg < prev.buyAvg ? curr : prev));
    bestBuy = { exchange: minBuy.exchange, exchangeName: minBuy.exchangeName, price: minBuy.buyAvg };
  }

  // Mejor precio de venta (el más alto para el usuario que quiere vender USDT)
  let bestSell = { exchange: "binance", exchangeName: "Binance P2P", price: binanceP2P.sellAvg };
  const sellExchanges = [binanceP2P, bybitP2P].filter((e) => e.isAvailable && e.sellAvg > 0);
  if (sellExchanges.length > 0) {
    const maxSell = sellExchanges.reduce((prev, curr) => (curr.sellAvg > prev.sellAvg ? curr : prev));
    bestSell = { exchange: maxSell.exchange, exchangeName: maxSell.exchangeName, price: maxSell.sellAvg };
  }

  // Oportunidad de arbitraje inter-exchange
  const arbitrageSpreadPercent =
    bestBuy.price > 0 && bestSell.price > 0
      ? parseFloat((((bestSell.price - bestBuy.price) / bestBuy.price) * 100).toFixed(2))
      : 0;

  const result: MultiExchangeP2PComparison = {
    fiat,
    asset: "USDT",
    exchanges: [binanceP2P, bybitP2P],
    bestBuy,
    bestSell,
    arbitrageSpreadPercent,
    updatedAt: new Date().toISOString(),
  };

  p2pComparisonCache.set(fiat, { data: result, timestamp: now });
  return result;
}

// ------------------- Consultas Spot Multi-Exchange -------------------

/**
 * 2. Obtiene comparativa Spot en tiempo real entre los 4 exchanges:
 * Binance, Bybit, Kraken, Bitget
 */
export async function getMultiExchangeSpotComparison(
  symbol: "BTC" | "ETH" | "SOL" | "BNB" = "BTC"
): Promise<MultiExchangeSpotComparison> {
  const now = Date.now();
  const cached = spotComparisonCache.get(symbol);

  if (cached && now - cached.timestamp < SPOT_CACHE_TTL_MS) {
    return cached.data;
  }

  const usdtPair = `${symbol}USDT`;

  // Consultar los 4 exchanges en paralelo con timeout de seguridad
  const [binance, bybit, kraken, bitget] = await Promise.all([
    // 1. Binance Spot
    (async (): Promise<ExchangeSpotRate> => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${usdtPair}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        const buy = parseFloat(d.askPrice);
        const sell = parseFloat(d.bidPrice);
        const last = (buy + sell) / 2;
        return {
          exchange: "binance",
          exchangeName: "Binance Spot",
          symbol,
          buyPrice: buy,
          sellPrice: sell,
          lastPrice: parseFloat(last.toFixed(2)),
          spreadPercent: parseFloat((((buy - sell) / buy) * 100).toFixed(3)),
          isAvailable: true,
        };
      } catch {
        return {
          exchange: "binance",
          exchangeName: "Binance Spot",
          symbol,
          buyPrice: 0,
          sellPrice: 0,
          lastPrice: 0,
          spreadPercent: 0,
          isAvailable: false,
        };
      }
    })(),

    // 2. Bybit Spot V5
    (async (): Promise<ExchangeSpotRate> => {
      try {
        const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${usdtPair}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        const item = d?.result?.list?.[0];
        const buy = parseFloat(item?.ask1Price);
        const sell = parseFloat(item?.bid1Price);
        const last = parseFloat(item?.lastPrice) || (buy + sell) / 2;
        return {
          exchange: "bybit",
          exchangeName: "Bybit Spot",
          symbol,
          buyPrice: buy,
          sellPrice: sell,
          lastPrice: parseFloat(last.toFixed(2)),
          spreadPercent: parseFloat((((buy - sell) / buy) * 100).toFixed(3)),
          isAvailable: buy > 0,
        };
      } catch {
        return {
          exchange: "bybit",
          exchangeName: "Bybit Spot",
          symbol,
          buyPrice: 0,
          sellPrice: 0,
          lastPrice: 0,
          spreadPercent: 0,
          isAvailable: false,
        };
      }
    })(),

    // 3. Kraken Public Ticker
    (async (): Promise<ExchangeSpotRate> => {
      try {
        const krakenPair = symbol === "BTC" ? "XBTUSD" : `${symbol}USD`;
        const res = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${krakenPair}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        const pairKey = Object.keys(d?.result || {})[0];
        const item = d?.result?.[pairKey];
        const buy = parseFloat(item?.a?.[0]); // ask
        const sell = parseFloat(item?.b?.[0]); // bid
        const last = parseFloat(item?.c?.[0]) || (buy + sell) / 2;
        return {
          exchange: "kraken",
          exchangeName: "Kraken",
          symbol,
          buyPrice: buy,
          sellPrice: sell,
          lastPrice: parseFloat(last.toFixed(2)),
          spreadPercent: parseFloat((((buy - sell) / buy) * 100).toFixed(3)),
          isAvailable: buy > 0,
        };
      } catch {
        return {
          exchange: "kraken",
          exchangeName: "Kraken",
          symbol,
          buyPrice: 0,
          sellPrice: 0,
          lastPrice: 0,
          spreadPercent: 0,
          isAvailable: false,
        };
      }
    })(),

    // 4. Bitget V2 Ticker
    (async (): Promise<ExchangeSpotRate> => {
      try {
        const res = await fetch(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${usdtPair}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        const item = d?.data?.[0];
        const buy = parseFloat(item?.askPr);
        const sell = parseFloat(item?.bidPr);
        const last = parseFloat(item?.lastPr) || (buy + sell) / 2;
        return {
          exchange: "bitget",
          exchangeName: "Bitget Spot",
          symbol,
          buyPrice: buy,
          sellPrice: sell,
          lastPrice: parseFloat(last.toFixed(2)),
          spreadPercent: parseFloat((((buy - sell) / buy) * 100).toFixed(3)),
          isAvailable: buy > 0,
        };
      } catch {
        return {
          exchange: "bitget",
          exchangeName: "Bitget Spot",
          symbol,
          buyPrice: 0,
          sellPrice: 0,
          lastPrice: 0,
          spreadPercent: 0,
          isAvailable: false,
        };
      }
    })(),
  ]);

  const activeRates = [binance, bybit, kraken, bitget].filter(
    (e) => e.isAvailable && e.buyPrice > 0
  );

  let lowestAsk = { exchange: "binance", exchangeName: "Binance Spot", price: binance.buyPrice };
  if (activeRates.length > 0) {
    const minAsk = activeRates.reduce((prev, curr) => (curr.buyPrice < prev.buyPrice ? curr : prev));
    lowestAsk = { exchange: minAsk.exchange, exchangeName: minAsk.exchangeName, price: minAsk.buyPrice };
  }

  let highestBid = { exchange: "binance", exchangeName: "Binance Spot", price: binance.sellPrice };
  if (activeRates.length > 0) {
    const maxBid = activeRates.reduce((prev, curr) => (curr.sellPrice > prev.sellPrice ? curr : prev));
    highestBid = { exchange: maxBid.exchange, exchangeName: maxBid.exchangeName, price: maxBid.sellPrice };
  }

  const arbitrageSpreadPercent =
    lowestAsk.price > 0 && highestBid.price > 0
      ? parseFloat((((highestBid.price - lowestAsk.price) / lowestAsk.price) * 100).toFixed(3))
      : 0;

  const result: MultiExchangeSpotComparison = {
    symbol,
    exchanges: [binance, bybit, kraken, bitget],
    lowestAsk,
    highestBid,
    arbitrageSpreadPercent,
    updatedAt: new Date().toISOString(),
  };

  spotComparisonCache.set(symbol, { data: result, timestamp: now });
  return result;
}
