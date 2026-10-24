"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  RefreshCw,
  ExternalLink,
  Newspaper,
  Lock,
  ArrowRight,
  TrendingUp,
  Globe2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ArrowLeftRight,
  CheckCircle2,
  Building2,
  Sparkles,
} from "lucide-react";
import { fetchWorkspaceSubscriptionAction } from "@/app/actions/plans";
import {
  fetchLiveMarketTickersAction,
  fetchLiveMarketChartAction,
  fetchLiveMarketNewsAction,
  fetchLatamP2POverviewAction,
} from "@/app/actions/market-data";
import {
  fetchMultiExchangeP2PAction,
  fetchMultiExchangeSpotAction,
} from "@/app/actions/multi-exchange";
import type {
  CryptoTickerData,
  CryptoChartData,
  CryptoNewsItem,
  LatamP2POpportunity,
} from "@/lib/services/crypto-market-service";
import type {
  MultiExchangeP2PComparison,
  MultiExchangeSpotComparison,
} from "@/lib/services/multi-exchange-service";

export default function EnterpriseMarketPage() {
  const [subscriptionData, setSubscriptionData] = React.useState<any>(null);
  const [isCheckingAccess, setIsCheckingAccess] = React.useState(true);

  // Active UI Controls
  const [selectedAsset, setSelectedAsset] = React.useState<"BTC" | "ETH" | "SOL" | "BNB">("BTC");
  const [selectedRange, setSelectedRange] = React.useState<"1D" | "7D" | "1M">("1D");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<string>("Sincronizando...");

  // Multi-Exchange Comparative Controls
  const [multiP2PFiat, setMultiP2PFiat] = React.useState<string>("VES");
  const [multiExchangeView, setMultiExchangeView] = React.useState<"p2p" | "spot">("p2p");

  // Real Market Data States
  const [tickers, setTickers] = React.useState<CryptoTickerData[]>([]);
  const [isLoadingTickers, setIsLoadingTickers] = React.useState(true);

  const [chartData, setChartData] = React.useState<CryptoChartData | null>(null);
  const [isLoadingChart, setIsLoadingChart] = React.useState(true);

  const [newsFeed, setNewsFeed] = React.useState<CryptoNewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = React.useState(true);

  const [latamRates, setLatamRates] = React.useState<LatamP2POpportunity[]>([]);
  const [isLoadingLatam, setIsLoadingLatam] = React.useState(true);

  // Multi-Exchange Comparison States
  const [multiP2PData, setMultiP2PData] = React.useState<MultiExchangeP2PComparison | null>(null);
  const [isLoadingMultiP2P, setIsLoadingMultiP2P] = React.useState(true);

  const [spotMatrix, setSpotMatrix] = React.useState<MultiExchangeSpotComparison | null>(null);
  const [isLoadingSpotMatrix, setIsLoadingSpotMatrix] = React.useState(true);

  // 1. Verificar acceso Enterprise
  React.useEffect(() => {
    async function checkAccess() {
      try {
        setIsCheckingAccess(true);
        const res = await fetchWorkspaceSubscriptionAction();
        setSubscriptionData(res);
      } catch (err) {
        console.error("Error al verificar plan para módulo Enterprise:", err);
      } finally {
        setIsCheckingAccess(false);
      }
    }
    checkAccess();
  }, []);

  const hasEnterprise =
    subscriptionData?.subscription?.features?.includes("enterprise_market_charts") ||
    subscriptionData?.subscription?.planCode === "enterprise";

  // 2. Cargar datos principales del mercado
  const loadMarketData = React.useCallback(async () => {
    if (!hasEnterprise) return;

    try {
      setIsRefreshing(true);
      const [tRes, nRes, lRes] = await Promise.all([
        fetchLiveMarketTickersAction().catch(() => []),
        fetchLiveMarketNewsAction().catch(() => []),
        fetchLatamP2POverviewAction().catch(() => []),
      ]);

      setTickers(tRes);
      setNewsFeed(nRes);
      setLatamRates(lRes);

      const d = new Date();
      setLastUpdated(
        `Hoy a las ${d.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`
      );
    } catch (err) {
      console.error("Error al sincronizar datos del mercado en vivo:", err);
    } finally {
      setIsLoadingTickers(false);
      setIsLoadingNews(false);
      setIsLoadingLatam(false);
      setIsRefreshing(false);
    }
  }, [hasEnterprise]);

  // Cargar al montar
  React.useEffect(() => {
    if (hasEnterprise) {
      loadMarketData();
    }
  }, [hasEnterprise, loadMarketData]);

  // 3. Cargar gráfico técnico cuando cambia activo o rango
  React.useEffect(() => {
    if (!hasEnterprise) return;

    let isMounted = true;
    async function loadChart() {
      try {
        setIsLoadingChart(true);
        const cRes = await fetchLiveMarketChartAction({
          symbol: selectedAsset,
          range: selectedRange,
        });
        if (isMounted) setChartData(cRes);
      } catch (err) {
        console.error("Error al cargar serie de Klines:", err);
      } finally {
        if (isMounted) setIsLoadingChart(false);
      }
    }

    loadChart();
    return () => {
      isMounted = false;
    };
  }, [hasEnterprise, selectedAsset, selectedRange]);

  // 4. Cargar comparativa P2P Multi-Exchange cuando cambia la divisa
  React.useEffect(() => {
    if (!hasEnterprise) return;

    let isMounted = true;
    async function loadP2PComp() {
      try {
        setIsLoadingMultiP2P(true);
        const res = await fetchMultiExchangeP2PAction(multiP2PFiat);
        if (isMounted) setMultiP2PData(res);
      } catch (err) {
        console.error("Error al cargar comparativa P2P:", err);
      } finally {
        if (isMounted) setIsLoadingMultiP2P(false);
      }
    }

    loadP2PComp();
    return () => {
      isMounted = false;
    };
  }, [hasEnterprise, multiP2PFiat]);

  // 5. Cargar matriz Spot Multi-Exchange (6 exchanges)
  React.useEffect(() => {
    if (!hasEnterprise) return;

    let isMounted = true;
    async function loadSpotComp() {
      try {
        setIsLoadingSpotMatrix(true);
        const res = await fetchMultiExchangeSpotAction(selectedAsset);
        if (isMounted) setSpotMatrix(res);
      } catch (err) {
        console.error("Error al cargar matriz Spot:", err);
      } finally {
        if (isMounted) setIsLoadingSpotMatrix(false);
      }
    }

    loadSpotComp();
    return () => {
      isMounted = false;
    };
  }, [hasEnterprise, selectedAsset]);

  // Render SVG Chart Paths
  const svgChart = React.useMemo(() => {
    if (!chartData || !chartData.points || chartData.points.length < 2) return null;

    const width = 800;
    const height = 180;
    const paddingY = 24;

    const minPrice = chartData.minPrice;
    const maxPrice = chartData.maxPrice;
    const range = maxPrice - minPrice || 1;

    const coords = chartData.points.map((p, i) => {
      const x = (i / (chartData.points.length - 1)) * width;
      const y = height - paddingY - ((p.close - minPrice) / range) * (height - 2 * paddingY);
      return { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)), ...p };
    });

    const linePath = coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
    }, "");

    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
    const lastCoord = coords[coords.length - 1];

    return { coords, linePath, areaPath, lastCoord, width, height };
  }, [chartData]);

  if (isCheckingAccess) {
    return (
      <div className="p-16 text-center text-xs font-mono text-slate-500 bg-[#10131a] rounded-xl border border-[#1e2433]">
        <RefreshCw className="w-5 h-5 mx-auto mb-3 animate-spin text-[#00f0ff]" />
        Verificando credenciales Enterprise en Neon PostgreSQL...
      </div>
    );
  }

  // Paywall si no es Enterprise
  if (!hasEnterprise) {
    const currentPlanName = subscriptionData?.subscription?.planName || "Plan Actual";
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-[#10141f] to-[#0c0e15] border border-cyan-500/30 text-center space-y-6 shadow-[0_0_50px_rgba(0,240,255,0.08)]">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <Badge variant="cyber">FUNCIONALIDAD ENTERPRISE</Badge>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Mercado Cripto y Multi-Exchange en Tiempo Real
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              El panel de cotizaciones en tiempo real (Binance, Bybit, Kraken, Bitget), análisis de arbitraje inter-exchange y feed de noticias es exclusivo para el plan <strong>Enterprise</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090b10] border border-[#1a1f2b] max-w-md mx-auto text-xs font-mono flex items-center justify-between">
            <span className="text-slate-400">Tu plan actual:</span>
            <span className="text-white font-bold">{currentPlanName}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/app/plan">
              <Button variant="primary" className="text-xs">
                Ir a Mi Plan y Simular Activación Enterprise ($79/mes)
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/app">
              <Button variant="ghost" className="text-xs text-slate-400 hover:text-white">
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeTicker = tickers.find((t) => t.symbol === selectedAsset);

  return (
    <div className="space-y-8">
      {/* 1. Header con estado en tiempo real */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2230]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyber">MÓDULO EXCLUSIVO ENTERPRISE</Badge>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              4 Exchanges Conectados (0-Key APIs)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Mercado Cripto & Multi-Exchange en Tiempo Real
          </h1>
          <p className="text-xs text-slate-400">
            Cotizaciones oficiales y arbitraje en vivo entre Binance, Bybit, Kraken y Bitget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Última sync: <strong className="text-slate-200">{lastUpdated}</strong>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadMarketData}
            isLoading={isRefreshing}
            className="font-mono text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 text-[#00f0ff] ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Cotización Spot en Tiempo Real (BTC, ETH, SOL, BNB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingTickers && tickers.length === 0 ? (
          <>
            <Skeleton className="h-28 rounded-xl bg-[#10131a]" />
            <Skeleton className="h-28 rounded-xl bg-[#10131a]" />
            <Skeleton className="h-28 rounded-xl bg-[#10131a]" />
            <Skeleton className="h-28 rounded-xl bg-[#10131a]" />
          </>
        ) : (
          tickers.map((item) => {
            const isSelected = selectedAsset === item.symbol;
            return (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setSelectedAsset(item.symbol)}
                className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-[#121926] border-cyan-500 shadow-[0_0_25px_rgba(0,240,255,0.18)]"
                    : "bg-[#10131a] border-[#1e2433] hover:border-[#283244] hover:bg-[#121620]"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#00f0ff] rounded-bl-sm" />
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-white">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center ${
                      item.isPositive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {item.isPositive ? (
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    )}
                    {item.formattedChange}
                  </span>
                </div>

                <div className="text-xl font-bold font-mono text-white mt-2.5">
                  {item.formattedPrice}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#1a1f2b]">
                  <span>24h Máx: <strong className="text-slate-300">{item.high24h}</strong></span>
                  <span>Mín: <strong className="text-slate-300">{item.low24h}</strong></span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 3. Gráfico Técnico Dinámico con Datos Reales de Binance Klines */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <LineChart className="w-4 h-4 text-[#00f0ff]" />
              Cotización Spot: {selectedAsset}/USDT en Tiempo Real
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Serie temporal de velas generada desde la API pública de Binance con escala interactiva.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Rango:</span>
            {(["1D", "7D", "1M"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRange === r
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    : "bg-[#141824] text-slate-400 border border-transparent hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-72 w-full rounded-xl bg-[#090b10] border border-[#1b2230] p-5 flex flex-col justify-between relative overflow-hidden">
            {/* Encabezado del gráfico con precios reales */}
            <div className="flex justify-between items-start z-10 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">
                  Activo Seleccionado
                </span>
                <div className="text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
                  {selectedAsset}
                  {activeTicker && (
                    <span className="text-lg text-cyan-400 font-bold">
                      {activeTicker.formattedPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase block">
                  Rango de Precios ({selectedRange})
                </span>
                <div className="text-xs text-slate-300 mt-0.5">
                  Máx: <strong className="text-emerald-400 font-bold">${chartData?.maxPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "—"}</strong>
                  {" • "}
                  Mín: <strong className="text-red-400 font-bold">${chartData?.minPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "—"}</strong>
                </div>
              </div>
            </div>

            {/* Canvas SVG con la serie real de precios */}
            {isLoadingChart ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#090b10]/80 z-20">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Graficando velas de Binance para {selectedAsset} ({selectedRange})...
                </div>
              </div>
            ) : svgChart ? (
              <div className="absolute inset-0 flex items-center justify-center pt-10 pb-6 px-4">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${svgChart.width} ${svgChart.height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="cyber-chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
                      <stop offset="60%" stopColor="#00f0ff" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path d={svgChart.areaPath} fill="url(#cyber-chart-grad)" />

                  <path
                    d={svgChart.linePath}
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {svgChart.lastCoord && (
                    <>
                      <circle
                        cx={svgChart.lastCoord.x}
                        cy={svgChart.lastCoord.y}
                        r="6"
                        fill="#00f0ff"
                        className="animate-ping opacity-75"
                      />
                      <circle
                        cx={svgChart.lastCoord.x}
                        cy={svgChart.lastCoord.y}
                        r="4"
                        fill="#ffffff"
                        stroke="#00f0ff"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </svg>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500 text-center py-12">
                Sin datos de Klines disponibles para este activo.
              </div>
            )}

            <div className="flex justify-between text-[11px] font-mono text-slate-400 z-10 border-t border-[#1b2230] pt-2 mt-auto">
              {chartData?.points && chartData.points.length > 0 ? (
                <>
                  <span>{chartData.points[0]?.timeLabel}</span>
                  <span>{chartData.points[Math.floor(chartData.points.length * 0.25)]?.timeLabel}</span>
                  <span>{chartData.points[Math.floor(chartData.points.length * 0.5)]?.timeLabel}</span>
                  <span>{chartData.points[Math.floor(chartData.points.length * 0.75)]?.timeLabel}</span>
                  <span className="text-cyan-400 font-bold">Ahora (UTC)</span>
                </>
              ) : (
                <span>Cargando escala temporal...</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. MODULO MULTI-EXCHANGE: Arbitraje P2P (Binance vs Bybit vs OKX) y Matriz Spot (6 Exchanges) */}
      <Card className="bg-[#10131a] border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.06)]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1c2230]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <CardTitle className="text-base text-white">
                Comparativa Multi-Exchange & Arbitraje en Tiempo Real
              </CardTitle>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoreo simultáneo de libros de órdenes de <strong>Binance, Bybit, Kraken y Bitget</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0c0e14] p-1 rounded-xl border border-[#1e2535]">
            <button
              type="button"
              onClick={() => setMultiExchangeView("p2p")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                multiExchangeView === "p2p"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Arbitraje P2P (Binance · Bybit)
            </button>
            <button
              type="button"
              onClick={() => setMultiExchangeView("spot")}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                multiExchangeView === "spot"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Matriz Spot (4 Exchanges)
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {multiExchangeView === "p2p" ? (
            /* Vista 1: Comparativa P2P */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0d13] p-3 rounded-xl border border-[#1b2333]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">Divisa P2P:</span>
                  {(["VES", "COP", "ARS", "BRL", "PEN", "CLP"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setMultiP2PFiat(f)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        multiP2PFiat === f
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-slate-400 hover:text-white hover:bg-[#161c28]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Banner de oportunidad de arbitraje inter-exchange */}
                {multiP2PData && multiP2PData.arbitrageSpreadPercent > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Arbitraje Inter-Exchange: Compra en <strong>{multiP2PData.bestBuy.exchangeName}</strong> ({multiP2PData.bestBuy.price.toFixed(2)}) y vende en <strong>{multiP2PData.bestSell.exchangeName}</strong> ({multiP2PData.bestSell.price.toFixed(2)}) &rarr; <strong className="text-[#00ff66]">+{multiP2PData.arbitrageSpreadPercent}%</strong>
                    </span>
                  </div>
                )}
              </div>

              {isLoadingMultiP2P && !multiP2PData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  <Skeleton className="h-36 rounded-xl bg-[#141824]" />
                  <Skeleton className="h-36 rounded-xl bg-[#141824]" />
                </div>
              ) : multiP2PData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {multiP2PData.exchanges.map((ex) => {
                    const isBestBuy = ex.exchange === multiP2PData.bestBuy.exchange;
                    const isBestSell = ex.exchange === multiP2PData.bestSell.exchange;

                    return (
                      <div
                        key={ex.exchange}
                        className={`p-4 rounded-xl border transition-all relative ${
                          isBestBuy
                            ? "bg-[#0e1620] border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : isBestSell
                            ? "bg-[#0e1422] border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                            : "bg-[#0b0e14] border-[#1c2230]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-white">
                            {ex.exchangeName}
                          </span>
                          {isBestBuy && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Mejor Compra
                            </span>
                          )}
                          {isBestSell && !isBestBuy && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
                              Mejor Venta
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-3">
                          <div className="p-2 rounded-lg bg-[#141824] border border-[#1f2638]">
                            <span className="text-[10px] text-slate-400 block uppercase">Promedio Compra</span>
                            <span className="text-emerald-400 font-bold text-sm">
                              {ex.buyAvg > 0 ? `${ex.buyAvg.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#141824] border border-[#1f2638]">
                            <span className="text-[10px] text-slate-400 block uppercase">Promedio Venta</span>
                            <span className="text-blue-400 font-bold text-sm">
                              {ex.sellAvg > 0 ? `${ex.sellAvg.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-[#1a1f2b]">
                          <span>Spread P2P:</span>
                          <span className="text-amber-300 font-bold">+{ex.spreadPercent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            /* Vista 2: Matriz Spot 6 Exchanges */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono bg-[#0a0d13] p-3 rounded-xl border border-[#1b2333]">
                <span className="text-slate-400">
                  Activo en Matriz: <strong className="text-white">{selectedAsset}/USD(T)</strong>
                </span>
                {spotMatrix && spotMatrix.arbitrageSpreadPercent > 0 && (
                  <span className="text-emerald-400 font-bold">
                    Diferencial Máx entre Exchanges: +{spotMatrix.arbitrageSpreadPercent}%
                  </span>
                )}
              </div>

              {isLoadingSpotMatrix && !spotMatrix ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-10 w-full bg-[#141824]" />
                  <Skeleton className="h-10 w-full bg-[#141824]" />
                  <Skeleton className="h-10 w-full bg-[#141824]" />
                </div>
              ) : spotMatrix ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#1c2230] text-slate-400 uppercase text-[10px]">
                        <th className="pb-2.5">Exchange</th>
                        <th className="pb-2.5">Precio Compra (Ask)</th>
                        <th className="pb-2.5">Precio Venta (Bid)</th>
                        <th className="pb-2.5">Último Precio</th>
                        <th className="pb-2.5">Spread del Libro</th>
                        <th className="pb-2.5 text-right">Estado API</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181d28]">
                      {spotMatrix.exchanges.map((ex) => {
                        const isLowestAsk = ex.exchange === spotMatrix.lowestAsk.exchange;
                        const isHighestBid = ex.exchange === spotMatrix.highestBid.exchange;

                        return (
                          <tr key={ex.exchange} className="hover:bg-[#141824]/50 transition-colors">
                            <td className="py-3 font-bold text-white flex items-center gap-2">
                              {ex.exchangeName}
                              {isLowestAsk && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Menor Ask
                                </span>
                              )}
                              {isHighestBid && !isLowestAsk && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  Mayor Bid
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-emerald-400 font-bold">
                              {ex.isAvailable && ex.buyPrice > 0 ? `$${ex.buyPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className="py-3 text-blue-400 font-bold">
                              {ex.isAvailable && ex.sellPrice > 0 ? `$${ex.sellPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className="py-3 text-slate-200">
                              {ex.isAvailable && ex.lastPrice > 0 ? `$${ex.lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                            </td>
                            <td className="py-3 text-slate-400">
                              {ex.isAvailable ? `+${ex.spreadPercent}%` : "—"}
                            </td>
                            <td className="py-3 text-right">
                              {ex.isAvailable ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  En Vivo (0-Key)
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {ex.statusMessage || "Inactivo"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Monitor de Arbitraje P2P en Latinoamérica (USDT) */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#f3ba2f]" />
              Monitor Regional P2P en Latinoamérica (USDT)
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Cotizaciones de compra, venta y spread en tiempo real tomadas del libro de órdenes de Binance P2P.
            </p>
          </div>
          <Badge variant="neutral" className="font-mono text-[10px] text-[#f3ba2f] border-[#f3ba2f]/30 bg-[#f3ba2f]/10">
            Libro P2P BAPI
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoadingLatam && latamRates.length === 0 ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full bg-[#141824]" />
              <Skeleton className="h-10 w-full bg-[#141824]" />
              <Skeleton className="h-10 w-full bg-[#141824]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1c2230] text-slate-400 uppercase text-[10px]">
                    <th className="pb-2.5">País</th>
                    <th className="pb-2.5">Divisa Fiat</th>
                    <th className="pb-2.5">Promedio Compra P2P</th>
                    <th className="pb-2.5">Promedio Venta P2P</th>
                    <th className="pb-2.5">Spread Mercado</th>
                    <th className="pb-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181d28]">
                  {latamRates.map((row) => (
                    <tr key={row.fiat} className="hover:bg-[#141824]/50 transition-colors">
                      <td className="py-3 font-bold text-white">
                        {row.countryName}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                          {row.fiat}
                        </span>
                      </td>
                      <td className="py-3 text-emerald-400 font-bold">
                        {row.buyAvg > 0
                          ? `${row.buyAvg.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${row.fiat}`
                          : "—"}
                      </td>
                      <td className="py-3 text-blue-400 font-bold">
                        {row.sellAvg > 0
                          ? `${row.sellAvg.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${row.fiat}`
                          : "—"}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-[#161d2b] text-slate-200 border border-[#222a3d]">
                          +{row.spreadPercent}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/app/operaciones/nueva`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[11px] h-7 px-2.5 hover:text-[#00ff66]"
                          >
                            <Zap className="w-3 h-3 mr-1 text-[#f3ba2f]" />
                            Operar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Feed de Noticias Cripto en Tiempo Real (CriptoNoticias RSS) */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#00ff66]" />
              Noticias Cripto en Tiempo Real (En Español)
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Titulares de última hora sindicados vía RSS desde fuentes especializadas de la industria.
            </p>
          </div>
          <Badge variant="neutral" className="font-mono text-xs">
            CriptoNoticias RSS Oficial
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoadingNews && newsFeed.length === 0 ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-16 w-full bg-[#121622]" />
              <Skeleton className="h-16 w-full bg-[#121622]" />
              <Skeleton className="h-16 w-full bg-[#121622]" />
            </div>
          ) : (
            <div className="space-y-3">
              {newsFeed.map((news) => (
                <div
                  key={news.id}
                  className="p-3.5 rounded-xl bg-[#0c0e14] border border-[#1a1f2b] hover:border-cyan-500/40 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#161a24] text-cyan-300 border border-cyan-500/20">
                        {news.category}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[#00ff66] font-semibold">{news.source}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{news.date}</span>
                    </div>
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white leading-snug hover:text-cyan-400 transition-colors block"
                    >
                      {news.title}
                    </a>
                  </div>
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Leer artículo completo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
