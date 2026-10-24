"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileText,
  Activity,
} from "lucide-react";
import { fetchMasterDashboardAction } from "@/app/actions/master";

export default function MasterDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadMetrics = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const metrics = await fetchMasterDashboardAction();
      setData(metrics);
    } catch (err: any) {
      setError(err.message || "Error al cargar métricas de la consola Master.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return (
    <div className="space-y-8">
      {/* Top Banner: Strict Real vs Simulated Revenue Separation */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="text-white">REGLA CONTABLE DE DEMOSTRACIÓN:</strong> Este MVP no procesa dinero real.
            Los importes de facturación aquí mostrados provienen de eventos de simulación del checkout de portafolio y no constituyen ingresos fiscales reales.
          </div>
        </div>
        <Link href="/master/auditoria">
          <Button variant="secondary" size="sm" className="text-xs shrink-0 border-amber-500/30 text-amber-300">
            Ver Auditoría
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Métricas Globales de la Plataforma
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visión centralizada de cuentas de comerciantes, estado de suscripciones y uso de la aplicación.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadMetrics}
          disabled={isLoading}
          className="text-xs font-mono"
        >
          {isLoading ? "Actualizando..." : "Refrescar Métricas"}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Clientes Totales</span>
            <Users className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">
              {isLoading ? "..." : data?.totalMerchants ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {data?.activeMerchants ?? 0} Activos • {data?.activeTrials ?? 0} Trials •{" "}
              {data?.suspendedMerchants ?? 0} Suspendidos
            </p>
          </CardContent>
        </Card>

        {/* Active Trials */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Trials en Curso</span>
            <Clock className="w-4 h-4 text-[#00ff66]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#00ff66]">
              {isLoading ? "..." : data?.activeTrials ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Período de prueba de 7 días activo
            </p>
          </CardContent>
        </Card>

        {/* Real Revenue (Explicitly $0.00) */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Ingresos Reales</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              MVP
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-400">$0.00 USD</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sin pasarela real conectada
            </p>
          </CardContent>
        </Card>

        {/* Simulated MRR */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">MRR Estimado (Demo)</span>
            <Badge variant="warning" className="text-[9px]">Simulado</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-300">
              ${isLoading ? "..." : data?.simulatedMrrUsd ?? "0.00"} USD
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Basado en planes Business ($29) y Enterprise ($79)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution and Simulated Billing Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#120f0b] border-[#292017] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Distribución de Clientes por Plan Comercial
              </span>
              <span className="text-xs font-mono text-slate-400">
                Total: {data?.totalMerchants ?? 0} comerciantes
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Free Trial (7 Días)</span>
                  <span className="text-[#00ff66] font-bold">
                    {data?.subscriptionsByPlan?.freeTrial ?? 0} comerciantes
                  </span>
                </div>
                <div className="w-full bg-[#1b1510] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00ff66] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        data?.totalMerchants
                          ? ((data.subscriptionsByPlan.freeTrial || 0) / data.totalMerchants) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Business ($29 USD/mes demo)</span>
                  <span className="text-amber-400 font-bold">
                    {data?.subscriptionsByPlan?.business ?? 0} comerciantes
                  </span>
                </div>
                <div className="w-full bg-[#1b1510] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        data?.totalMerchants
                          ? ((data.subscriptionsByPlan.business || 0) / data.totalMerchants) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Enterprise ($79 USD/mes demo)</span>
                  <span className="text-cyan-400 font-bold">
                    {data?.subscriptionsByPlan?.enterprise ?? 0} comerciantes
                  </span>
                </div>
                <div className="w-full bg-[#1b1510] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        data?.totalMerchants
                          ? ((data.subscriptionsByPlan.enterprise || 0) / data.totalMerchants) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0a0806] border border-[#231b14] text-xs font-mono flex items-center justify-between text-slate-400">
              <span>Facturación Total Aprobada en Demo:</span>
              <strong className="text-white">${data?.simulatedTotalBilledUsd ?? "0.00"} USD</strong>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="bg-[#120f0b] border-[#292017] flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Gestión Administrativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Link href="/master/clientes" className="block">
              <Button variant="secondary" className="w-full justify-between text-xs border-[#2e241a] text-slate-200">
                <span>Directorio de Clientes</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Button>
            </Link>

            <Link href="/master/promociones" className="block">
              <Button variant="secondary" className="w-full justify-between text-xs border-[#2e241a] text-slate-200">
                <span>Gestionar Cupones Demo</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Button>
            </Link>

            <Link href="/master/auditoria" className="block">
              <Button variant="secondary" className="w-full justify-between text-xs border-[#2e241a] text-slate-200">
                <span>Bitácora de Auditoría</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients & Audit Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Merchants */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Últimos Comerciantes Registrados
            </CardTitle>
            <Link href="/master/clientes" className="text-xs font-mono text-amber-400 hover:underline">
              Ver todos &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#211a13] text-xs font-mono">
              {!data?.recentClients?.length ? (
                <div className="p-6 text-center text-slate-500">No hay comerciantes registrados aún.</div>
              ) : (
                data.recentClients.map((client: any) => (
                  <div key={client.id} className="p-3.5 flex items-center justify-between hover:bg-[#1a140f] transition-colors">
                    <div>
                      <div className="font-bold text-white">{client.name}</div>
                      <div className="text-[11px] text-slate-400">{client.email}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : client.status === "suspended"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {client.status.toUpperCase()}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {client.planName} • {client.operationsCount} ops
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit Logs */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Eventos Recientes de Auditoría
            </CardTitle>
            <Link href="/master/auditoria" className="text-xs font-mono text-amber-400 hover:underline">
              Ver bitácora &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#211a13] text-xs font-mono">
              {!data?.recentAuditLogs?.length ? (
                <div className="p-6 text-center text-slate-500">No hay registros de auditoría recientes.</div>
              ) : (
                data.recentAuditLogs.map((log: any) => (
                  <div key={log.id} className="p-3.5 flex items-center justify-between hover:bg-[#1a140f] transition-colors">
                    <div className="max-w-[70%]">
                      <div className="text-amber-400 font-bold text-[11px]">{log.action}</div>
                      <div className="text-slate-400 text-[10px] truncate">{log.reason}</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
