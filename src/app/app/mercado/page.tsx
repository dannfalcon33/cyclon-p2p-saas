"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  RefreshCw,
  ExternalLink,
  Newspaper,
  Lock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { fetchWorkspaceSubscriptionAction } from "@/app/actions/plans";

export default function EnterpriseMarketPage() {
  const [subscriptionData, setSubscriptionData] = React.useState<any>(null);
  const [isCheckingAccess, setIsCheckingAccess] = React.useState(true);
  const [selectedAsset, setSelectedAsset] = React.useState<"BTC" | "ETH" | "SOL" | "BNB">("BTC");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState("Hoy a las 10:30 AM");

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated("Hace unos segundos");
    }, 600);
  };

  const ASSETS = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: "$67,420.00",
      change: "+2.4%",
      isPositive: true,
      high24: "$68,100",
      low24: "$65,800",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: "$2,640.50",
      change: "+1.8%",
      isPositive: true,
      high24: "$2,690",
      low24: "$2,580",
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: "$168.20",
      change: "-0.5%",
      isPositive: false,
      high24: "$172",
      low24: "$164",
    },
    {
      symbol: "BNB",
      name: "BNB Chain",
      price: "$595.00",
      change: "+0.9%",
      isPositive: true,
      high24: "$602",
      low24: "$588",
    },
  ];

  const NEWS_FEED = [
    {
      id: "1",
      title: "Adopción de USDT en Latinoamérica alcanza nuevo máximo histórico en transacciones P2P",
      source: "CriptoNoticias",
      date: "Hace 2 horas",
      category: "Adopción",
    },
    {
      id: "2",
      title: "Binance actualiza políticas de seguridad y límites de apelación para comerciantes verificados",
      source: "CoinDesk",
      date: "Hace 5 horas",
      category: "Exchanges",
    },
    {
      id: "3",
      title: "Volumen de negociación P2P en Colombia y Brasil reporta crecimiento sostenido en Q4",
      source: "Bloomberg Cripto",
      date: "Ayer",
      category: "Mercados",
    },
  ];

  if (isCheckingAccess) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500">
        Verificando capacidades Enterprise de tu suscripción en Neon PostgreSQL...
      </div>
    );
  }

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
              Mercado Cripto y Noticias en Tiempo Real
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              El panel de cotizaciones de activos en tiempo real (BTC, ETH, SOL, BNB), análisis de spreads y agregador curado de noticias especializadas para arbitraje P2P es exclusivo para el plan <strong>Enterprise</strong>.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2230]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyber">MÓDULO EXCLUSIVO ENTERPRISE</Badge>
            <span className="text-xs font-mono text-slate-400">Proveedor Desacoplado</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Mercado Cripto & Noticias en Tiempo Real
          </h1>
          <p className="text-xs text-slate-400">
            Monitoreo de precios de referencia para arbitraje y feed curado de noticias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Última sync: <strong className="text-slate-200">{lastUpdated}</strong>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#00f0ff]" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* 4 Asset Ticker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSETS.map((item) => (
          <button
            key={item.symbol}
            type="button"
            onClick={() => setSelectedAsset(item.symbol as "BTC" | "ETH" | "SOL" | "BNB")}
            className={`p-4 rounded-xl text-left border transition-all ${
              selectedAsset === item.symbol
                ? "bg-[#141b27] border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                : "bg-[#10131a] border-[#1e2433] hover:border-[#283244]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-white">
                {item.symbol}
              </span>
              <span
                className={`text-xs font-mono font-semibold ${
                  item.isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.change}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-2">
              {item.price}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-[#1a1f2b]">
              <span>24h Max: {item.high24}</span>
              <span>Min: {item.low24}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <LineChart className="w-4 h-4 text-[#00f0ff]" />
              Cotización de Referencia: {selectedAsset}/USD
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Datos obtenidos a través del adaptador de mercado (CoinGecko / Binance Public API)
            </p>
          </div>
          <div className="flex gap-1.5 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              1D
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161a24] text-slate-400">
              7D
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161a24] text-slate-400">
              1M
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cyberpunk Chart Mockup / Placeholder Visual */}
          <div className="h-64 w-full rounded-lg bg-[#0a0c12] border border-[#1a1f2b] p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start z-10 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Activo en visualización</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {selectedAsset} · Gráfico Técnico
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase">Rango 24h</span>
                <div className="text-sm font-bold text-[#00ff66] mt-0.5">
                  Estable (+1.4%)
                </div>
              </div>
            </div>

            {/* Glowing wave graphic representation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <svg className="w-full h-36" preserveAspectRatio="none" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="cyber-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 Q70,40 140,70 T280,50 T420,90 L500,60 L500,150 L0,150 Z"
                  fill="url(#cyber-grad)"
                />
                <path
                  d="M0,80 Q70,40 140,70 T280,50 T420,90 L500,60"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400 z-10 border-t border-[#1a1f2b] pt-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>Ahora (UTC-4)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Feed Section */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#00ff66]" />
            Noticias Seleccionadas de la Industria P2P
          </CardTitle>
          <p className="text-xs text-slate-400">
            Titulares relevantes para comerciantes y analistas de arbitraje
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {NEWS_FEED.map((news) => (
              <div
                key={news.id}
                className="p-3.5 rounded-xl bg-[#0c0e14] border border-[#1a1f2b] hover:border-[#252c3d] transition-all flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#161a24] text-slate-300">
                      {news.category}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[#00ff66] font-semibold">{news.source}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400">{news.date}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white leading-snug hover:text-[#00ff66] transition-colors cursor-pointer">
                    {news.title}
                  </h4>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
