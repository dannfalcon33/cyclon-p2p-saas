"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftRight,
  PlusCircle,
  Sliders,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Ban,
  Layers,
  Coins,
  Building2,
  CreditCard,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { getDashboardMetricsAction } from "@/app/actions/metrics";
import {
  MerchantDashboardMetrics,
  PeriodFilter,
} from "@/lib/services/metrics-service";

const PERIODS: { id: PeriodFilter; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "month", label: "Este mes" },
  { id: "all", label: "Histórico" },
];

export default function MerchantDashboardPage() {
  const [period, setPeriod] = React.useState<PeriodFilter>("30d");
  const [selectedFiat, setSelectedFiat] = React.useState<string>("");
  const [metrics, setMetrics] = React.useState<MerchantDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMetrics = React.useCallback(async (p: PeriodFilter, fiat?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDashboardMetricsAction({
        period: p,
        fiatCurrency: fiat || undefined,
      });
      setMetrics(data);
      if (!fiat && data.selectedFiatCurrency) {
        setSelectedFiat(data.selectedFiatCurrency);
      }
    } catch (err: any) {
      console.error("Error al cargar métricas del dashboard:", err);
      setError("No fue posible cargar las métricas en tiempo real. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics(period, selectedFiat || undefined);
  }, [period, selectedFiat, fetchMetrics]);

  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
  };

  const handleFiatChange = (newFiat: string) => {
    setSelectedFiat(newFiat);
  };

  const activeFiatMetric = metrics?.activeFiatMetric || null;
  const primaryCrypto = metrics?.cryptoVolumes?.[0] || null;

  return (
    <div className="space-y-8">
      {/* 1. Barra de Encabezado y Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1c2230]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Panel de Operaciones P2P
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Métricas analíticas en tiempo real basadas exclusivamente en las operaciones de tu espacio de trabajo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/app/operaciones">
            <Button variant="secondary" size="sm" className="font-mono text-xs">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#00ff66]" />
              Bitácora & Reportes
            </Button>
          </Link>
          <Link href="/app/operaciones/nueva">
            <Button variant="primary" size="sm" className="font-mono text-xs">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Nueva Operación
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filtros de Período y Moneda Fiat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1017] p-3 rounded-xl border border-[#1b2230]">
        {/* Selector de Período */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#00ff66]" /> Período:
          </span>
          {PERIODS.map((p) => {
            const isSelected = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id)}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40 font-bold shadow-[0_0_10px_rgba(0,255,102,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-[#161b26] border border-transparent"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Selector de Moneda Fiat */}
        {metrics && metrics.availableFiatCurrencies.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Moneda Fiat:
            </span>
            {metrics.availableFiatCurrencies.map((fiat) => {
              const isSelected = (selectedFiat || metrics.selectedFiatCurrency) === fiat;
              return (
                <button
                  key={fiat}
                  onClick={() => handleFiatChange(fiat)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                      : "text-slate-400 hover:text-white hover:bg-[#161b26] border border-transparent"
                  }`}
                >
                  {fiat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchMetrics(period, selectedFiat || undefined)}
            className="text-xs"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* 3. Tarjetas KPI Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Operaciones Completadas */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Operaciones Completadas</span>
            <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold font-mono text-white">
                {metrics?.kpis.completedOperations ?? 0}
              </div>
            )}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {metrics?.kpis.pendingOperations ?? 0} pend.
              </span>
              <span>•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Ban className="w-3 h-3 text-red-400" /> {metrics?.kpis.cancelledOperations ?? 0} canc.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Volumen Cripto */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Volumen Cripto {primaryCrypto ? `(${primaryCrypto.symbol})` : ""}
            </span>
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : primaryCrypto ? (
              <>
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {parseFloat(primaryCrypto.totalAsset).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}{" "}
                  <span className="text-xs text-slate-400">{primaryCrypto.symbol}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400 flex items-center">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    {parseFloat(primaryCrypto.buyAsset).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    Comp.
                  </span>
                  <span>•</span>
                  <span className="text-blue-400 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {parseFloat(primaryCrypto.sellAsset).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    Vent.
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm font-mono py-2">Sin volumen</div>
            )}
          </CardContent>
        </Card>

        {/* KPI 3: Volumen Fiat (Moneda Aislada) */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Volumen Fiat ({metrics?.selectedFiatCurrency || "VES"})
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {metrics?.selectedFiatCurrency || "VES"}
            </span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-36 mb-2" />
            ) : activeFiatMetric ? (
              <>
                <div className="text-2xl font-bold font-mono text-white">
                  {parseFloat(activeFiatMetric.totalFiat).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xs text-slate-400">{activeFiatMetric.currency}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400">
                    C: {parseFloat(activeFiatMetric.buyFiat).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                  <span>•</span>
                  <span className="text-blue-400">
                    V: {parseFloat(activeFiatMetric.sellFiat).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm font-mono py-2">0.00 {metrics?.selectedFiatCurrency}</div>
            )}
          </CardContent>
        </Card>

        {/* KPI 4: Comisiones Generadas */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Comisión Comerciante ({metrics?.selectedFiatCurrency || "VES"})
            </span>
            <Sliders className="w-4 h-4 text-[#00ff66]" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28 mb-2" />
            ) : activeFiatMetric ? (
              <>
                <div className="text-2xl font-bold font-mono text-[#00ff66]">
                  {parseFloat(activeFiatMetric.merchantFee).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xs text-slate-400">{activeFiatMetric.currency}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                  Exch: {activeFiatMetric.exchangeFee} | Pagos: {activeFiatMetric.paymentCharge}
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm font-mono py-2">0.00 {metrics?.selectedFiatCurrency}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Banner de Aislamiento de Monedas Fiat */}
      <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1b2333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#00ff66] shrink-0" />
          <span>
            <strong className="text-white">Aislamiento Estricto de Divisas:</strong> Los totales y tasas mostrados corresponden a la divisa <strong className="text-amber-300">{metrics?.selectedFiatCurrency || "VES"}</strong>. Cyclon P2P no suma divisas distintas en un total combinado.
          </span>
        </div>
        <Link
          href="/app/configuracion"
          className="text-[#00ff66] hover:underline flex items-center gap-1 shrink-0"
        >
          Configurar Perfiles &rarr;
        </Link>
      </div>

      {/* 5. Tasas Promedio Ponderadas por Activo */}
      {activeFiatMetric && Object.keys(activeFiatMetric.ratesByAsset).length > 0 && (
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00ff66]" />
                Tasas Promedio Ponderadas ({activeFiatMetric.currency})
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculadas por volumen ponderado: Suma(Fiat) / Suma(Cripto) sobre operaciones completadas.
              </p>
            </div>
            <Badge variant="neutral" className="font-mono text-xs">
              {metrics?.periodLabel}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(activeFiatMetric.ratesByAsset).map(([asset, rates]) => (
                <div
                  key={asset}
                  className="p-3.5 rounded-xl bg-[#0a0d13] border border-[#1c2333] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">
                      {asset}/{activeFiatMetric.currency}
                    </span>
                    {rates.grossSpread && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Spread: +{rates.grossSpread} {activeFiatMetric.currency}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-[#121620] border border-[#1c2333]">
                      <span className="text-[10px] text-slate-400 block">Tasa Compra</span>
                      <span className="text-emerald-400 font-bold">
                        {rates.buyAvgRate ? `${rates.buyAvgRate}` : "—"}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-[#121620] border border-[#1c2333]">
                      <span className="text-[10px] text-slate-400 block">Tasa Venta</span>
                      <span className="text-blue-400 font-bold">
                        {rates.sellAvgRate ? `${rates.sellAvgRate}` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>Tasa Global:</span>
                    <strong className="text-white">
                      {rates.overallAvgRate ? `${rates.overallAvgRate} ${activeFiatMetric.currency}` : "—"}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Distribución por Exchange y Métodos de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribución por Exchange */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Actividad por Exchange
            </CardTitle>
            <span className="text-xs font-mono text-slate-400">
              {metrics?.kpis.completedOperations ?? 0} órdenes completadas
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : metrics && metrics.exchangeDistribution.length > 0 ? (
              metrics.exchangeDistribution.map((ex) => (
                <div key={ex.exchangeCode} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium">{ex.name}</span>
                    <span className="text-slate-400">
                      {ex.count} {ex.count === 1 ? "orden" : "órdenes"} ({ex.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#181d28] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(ex.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs font-mono text-slate-400 py-4 text-center">
                Sin datos de exchanges en este período.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribución por Método de Pago */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Métodos de Pago Más Utilizados
            </CardTitle>
            <span className="text-xs font-mono text-slate-400">
              {metrics?.paymentMethodDistribution.length || 0} métodos
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : metrics && metrics.paymentMethodDistribution.length > 0 ? (
              metrics.paymentMethodDistribution.map((pm) => (
                <div key={pm.methodName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium truncate max-w-[200px]">
                      {pm.methodName}
                    </span>
                    <span className="text-slate-400">
                      {pm.count} {pm.count === 1 ? "uso" : "usos"} ({pm.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#181d28] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00ff66] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(pm.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs font-mono text-slate-400 py-4 text-center">
                Sin operaciones completadas en este período.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 7. Resumen de Criptoactivos Registrados */}
      {metrics && metrics.cryptoVolumes.length > 0 && (
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00ff66]" />
              Resumen de Criptoactivos
            </CardTitle>
            <span className="text-xs font-mono text-slate-400">
              {metrics.cryptoVolumes.length} activos operados
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {metrics.cryptoVolumes.map((c) => (
                <div
                  key={c.symbol}
                  className="p-3.5 rounded-xl bg-[#090b10] border border-[#1b2333] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">
                      {c.symbol}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {c.operationsCount} {c.operationsCount === 1 ? "op" : "ops"}
                    </span>
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {parseFloat(c.totalAsset).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}{" "}
                    <span className="text-xs text-slate-400">{c.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-[#161d2b]">
                    <span className="text-emerald-400">
                      Compra: {parseFloat(c.buyAsset).toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    </span>
                    <span className="text-blue-400">
                      Venta: {parseFloat(c.sellAsset).toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8. Tabla de Operaciones Recientes o Estado Vacío */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Operaciones Recientes</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Últimas transacciones registradas en tu espacio de trabajo
            </p>
          </div>
          <Link href="/app/operaciones">
            <Button variant="ghost" size="sm" className="text-xs font-mono text-[#00ff66]">
              Ver todas en Bitácora &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : metrics && metrics.recentOperations.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-[#141722] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1f2637]">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Exchange</th>
                    <th className="p-3">Lado</th>
                    <th className="p-3">Activo Cripto</th>
                    <th className="p-3">Importe Fiat</th>
                    <th className="p-3">Tasa Unitaria</th>
                    <th className="p-3">Método / Banco</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#191f2c] text-slate-200">
                  {metrics.recentOperations.map((op) => {
                    const isBuy = op.operationSide === "buy";
                    return (
                      <tr key={op.id} className="hover:bg-[#141824] transition-colors">
                        <td className="p-3 text-slate-400 whitespace-nowrap">
                          {new Date(op.occurredAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3 font-semibold text-white whitespace-nowrap uppercase">
                          {op.exchangeCode}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isBuy
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {isBuy ? "COMPRA" : "VENTA"}
                          </span>
                        </td>
                        <td className="p-3 text-cyan-400 whitespace-nowrap">
                          {op.assetAmount} {op.assetSymbol}
                        </td>
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          {op.fiatAmount} {op.fiatCurrency}
                        </td>
                        <td className="p-3 text-slate-300 whitespace-nowrap">
                          {op.unitRate} {op.fiatCurrency}
                        </td>
                        <td className="p-3 text-slate-400 whitespace-nowrap">
                          {op.paymentMethodName || "—"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <Badge
                            variant={
                              op.status === "completed"
                                ? "success"
                                : op.status === "pending"
                                ? "warning"
                                : "error"
                            }
                          >
                            {op.status === "completed"
                              ? "Completada"
                              : op.status === "pending"
                              ? "Pendiente"
                              : "Cancelada"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <Link href={`/app/operaciones/${op.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400 hover:text-white">
                              Ver <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Estado Vacío de Operaciones */
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center mx-auto text-[#00ff66]">
                <Layers className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-white font-mono">
                  No hay operaciones registradas en este período
                </h3>
                <p className="text-xs text-slate-400">
                  Comienza a registrar tus compras y ventas P2P en Binance, Bybit o Bitget para ver aquí tus métricas de volumen, tasas promedio y comisiones.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/app/operaciones/nueva">
                  <Button variant="primary" size="sm" className="font-mono text-xs">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Registrar Primera Operación
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
