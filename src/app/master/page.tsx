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
} from "lucide-react";

export default function MasterDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Banner: Strict Real vs Simulated Revenue Separation */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="text-white">REGLA CONTABLE DE DEMOSTRACIÓN:</strong> Este MVP no procesa dinero real. 
            Los importes de facturación aquí mostrados provienen de eventos de simulación del checkout de portafolio y no constituyen ingresos reales.
          </div>
        </div>
        <Link href="/master/auditoria">
          <Button variant="secondary" size="sm" className="text-xs shrink-0 border-amber-500/30 text-amber-300">
            Ver Auditoría
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Métricas Globales de la Plataforma
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Visión centralizada de cuentas de comerciantes, estado de suscripciones y uso de la aplicación.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Clientes Totales</span>
            <Users className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">48</div>
            <p className="text-[11px] text-slate-400 mt-1">
              42 Activos • 4 Trials • 2 Suspendidos
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
            <div className="text-2xl font-bold font-mono text-[#00ff66]">14</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Periodo de prueba de 7 días activo
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
            <div className="text-2xl font-bold font-mono text-amber-300">$1,420.00 USD</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Basado en precios ilustrativos configurados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown & Quick Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plans Distribution */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Distribución de Suscripciones Activas</span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Free Trial (7 Días)</span>
                <span className="text-white font-bold">14 comerciantes (29%)</span>
              </div>
              <div className="w-full bg-[#1e1913] h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full w-[29%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#00ff66]">Business ($29/mes demo)</span>
                <span className="text-white font-bold">24 comerciantes (50%)</span>
              </div>
              <div className="w-full bg-[#1e1913] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00ff66] h-full w-[50%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400">Enterprise ($79/mes demo)</span>
                <span className="text-white font-bold">10 comerciantes (21%)</span>
              </div>
              <div className="w-full bg-[#1e1913] h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[21%]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links & Platform Actions */}
        <Card className="bg-[#120f0b] border-[#292017]">
          <CardHeader>
            <CardTitle className="text-sm">Gestión Administrativa Inmediata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/master/clientes"
              className="p-3 rounded-lg bg-[#18130e] border border-[#2b2118] hover:border-amber-500/50 flex items-center justify-between transition-all"
            >
              <div>
                <div className="text-xs font-semibold text-white">Inspeccionar Clientes</div>
                <div className="text-[11px] text-slate-400">Filtra cuentas, revisa planes y gestiona suspensiones</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>

            <Link
              href="/master/promociones"
              className="p-3 rounded-lg bg-[#18130e] border border-[#2b2118] hover:border-amber-500/50 flex items-center justify-between transition-all"
            >
              <div>
                <div className="text-xs font-semibold text-white">Crear Cupones de Demostración</div>
                <div className="text-[11px] text-slate-400">Define descuentos porcentuales o fijos para el checkout</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>

            <Link
              href="/master/auditoria"
              className="p-3 rounded-lg bg-[#18130e] border border-[#2b2118] hover:border-amber-500/50 flex items-center justify-between transition-all"
            >
              <div>
                <div className="text-xs font-semibold text-white">Bitácora de Auditoría Master</div>
                <div className="text-[11px] text-slate-400">Registro inmutable append-only de intervenciones</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
