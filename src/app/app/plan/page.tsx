"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function MerchantPlanPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [planToUpgrade, setPlanToUpgrade] = React.useState<"business" | "enterprise">("business");
  const [outcome, setOutcome] = React.useState<"idle" | "success">("idle");

  const handleSimulateUpgrade = (p: "business" | "enterprise") => {
    setPlanToUpgrade(p);
    setOutcome("idle");
    setIsCheckoutOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#1c2230]">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Mi Suscripción y Capacidades
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Estado actual de tu prueba, capacidades del plan y pasarela de simulación.
        </p>
      </div>

      {/* Current Plan Status Card */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="neon">FREE TRIAL (7 DÍAS)</Badge>
                <span className="text-xs font-mono text-emerald-400">Activo</span>
              </div>
              <CardTitle className="text-xl mt-2">Prueba Gratuita en Curso</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Tu período de prueba incluye acceso a todas las funciones del plan <strong>Business</strong>.
              </p>
            </div>

            <div className="text-left sm:text-right font-mono">
              <span className="text-xs text-slate-400 block">Vencimiento:</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-[#00ff66]" />
                28 Octubre 2026 (5 días restantes)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-t border-[#181d29] pt-4">
          <div className="p-3 rounded-lg bg-[#0c0e14] border border-[#1d222e] text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#00ff66] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">Política de retención de datos inmutable:</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Si tu período de prueba finaliza sin activar un plan, <strong>tus datos y operaciones registradas nunca serán eliminados</strong>. Podrás seguir consultando y exportando tu historial a Excel en cualquier momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans to Upgrade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Business Upgrade */}
        <Card className="bg-[#121622] border-[#00ff66]/40 flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge variant="neon">Plan Recomendado</Badge>
              <span className="text-xs font-mono text-slate-400">Demo</span>
            </div>
            <CardTitle className="text-lg mt-2">Business</CardTitle>
            <div className="font-mono mt-2">
              <span className="text-2xl font-bold text-white">$29.00</span>
              <span className="text-xs text-slate-400 ml-1">/ mes</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Operaciones ilimitadas, reportes Excel multi-hoja, comisiones por país y soporte.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => handleSimulateUpgrade("business")}
            >
              Simular Activación Business
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Upgrade */}
        <Card className="bg-[#10131a] border-[#1e2433] flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge variant="cyber">Avanzado</Badge>
              <span className="text-xs font-mono text-slate-400">Demo</span>
            </div>
            <CardTitle className="text-lg mt-2">Enterprise</CardTitle>
            <div className="font-mono mt-2">
              <span className="text-2xl font-bold text-[#00f0ff]">$79.00</span>
              <span className="text-xs text-slate-400 ml-1">/ mes</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Todo Business + Gráficos de cotizaciones en tiempo real (BTC/ETH/SOL/BNB) y noticias.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
              onClick={() => handleSimulateUpgrade("enterprise")}
            >
              Simular Activación Enterprise
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Simulation Modal */}
      <Dialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={`Checkout Simulado: Plan ${planToUpgrade.toUpperCase()}`}
        description="Prueba del adaptador DemoBillingProvider"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            ⚠️ <strong>AVISO:</strong> No se solicitan datos de tarjeta ni pagos reales. Se registrará un evento simulado con identificador ficticio en base de datos.
          </div>

          {outcome === "idle" ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#0c0e14] border border-[#1e2433] font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Plan:</span>
                  <span className="text-white font-bold">{planToUpgrade.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Precio de demo:</span>
                  <span className="text-[#00ff66]">
                    {planToUpgrade === "business" ? "$29.00 USD" : "$79.00 USD"}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => setOutcome("success")}
              >
                Confirmar Activación Demo Aprobada
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="success" title="¡Plan Activado en Modo Demo!">
                Se ha registrado la transacción simulada <code>DEMO-CHK-68210</code> y tus capacidades se han actualizado.
              </Alert>
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
