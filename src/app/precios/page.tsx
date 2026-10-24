"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import { CheckCircle2, ShieldAlert, Tag } from "lucide-react";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = React.useState<{
    id: string;
    name: string;
    price: number;
    billingPeriod: string;
  } | null>(null);

  const [couponCode, setCouponCode] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] = React.useState<number | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = React.useState<string | null>(null);

  // Simulated checkout state
  const [simulatedOutcome, setSimulatedOutcome] = React.useState<
    "idle" | "approved" | "pending" | "failed"
  >("idle");

  const openCheckout = (plan: { id: string; name: string; price: number; billingPeriod: string }) => {
    setSelectedPlan(plan);
    setCouponCode("");
    setAppliedDiscount(null);
    setCouponError(null);
    setCouponSuccess(null);
    setSimulatedOutcome("idle");
  };

  const closeCheckout = () => {
    setSelectedPlan(null);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === "CYCLON50") {
      setAppliedDiscount(0.5); // 50% off
      setCouponSuccess("Cupón CYCLON50 aplicado: 50% de descuento ilustrativo.");
    } else if (cleanCode === "PORTAFOLIO") {
      setAppliedDiscount(1.0); // 100% off
      setCouponSuccess("Cupón PORTAFOLIO aplicado: 100% de descuento de prueba.");
    } else if (!cleanCode) {
      setCouponError("Ingresa un código promocional.");
    } else {
      setCouponError("Código inválido o no aplicable para esta simulación.");
      setAppliedDiscount(null);
    }
  };

  const getFinalPrice = () => {
    if (!selectedPlan) return 0;
    if (appliedDiscount === null) return selectedPlan.price;
    return Math.max(0, selectedPlan.price * (1 - appliedDiscount));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <DemoNoticeBadge />
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Planes y Checkout Simulado
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Explora las capacidades de cada plan y experimenta el flujo de checkout de demostración. 
            Esta pasarela es 100% interactiva para fines de portafolio y no procesa cobros reales.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Trial */}
          <Card className="flex flex-col bg-[#101218] border-[#1f2533]">
            <CardHeader>
              <Badge variant="neutral" className="w-fit mb-2">Prueba</Badge>
              <CardTitle>Free Trial</CardTitle>
              <div className="mt-4 font-mono">
                <span className="text-3xl font-bold text-white">$0.00</span>
                <span className="text-xs text-slate-400 ml-1">/ 7 días</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between text-xs space-y-4">
              <ul className="space-y-2.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Todas las funciones de Business por 7 días
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Registro sin tarjeta de crédito
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Datos preservados al expirar
                </li>
              </ul>
              <Button
                variant="secondary"
                className="w-full mt-6"
                onClick={() =>
                  openCheckout({
                    id: "free_trial",
                    name: "Free Trial (7 Días)",
                    price: 0,
                    billingPeriod: "7 días",
                  })
                }
              >
                Activar Trial Demo
              </Button>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="flex flex-col bg-[#121622] border-[#00ff66]/50 relative shadow-[0_0_25px_rgba(0,255,102,0.1)]">
            <div className="absolute top-0 right-0 bg-[#00ff66] text-black text-[10px] font-mono font-bold px-3 py-1 rounded-bl-lg uppercase">
              Más Popular
            </div>
            <CardHeader>
              <Badge variant="neon" className="w-fit mb-2">Recomendado</Badge>
              <CardTitle>Business</CardTitle>
              <div className="mt-4 font-mono">
                <span className="text-3xl font-bold text-[#00ff66]">$29.00</span>
                <span className="text-xs text-slate-400 ml-1">/ mes (Ilustrativo)</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between text-xs space-y-4">
              <ul className="space-y-2.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Bitácora de operaciones ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Comisiones personalizadas para 7 países
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Exportaciones contables en Excel (.xlsx)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  Catálogo privado de bancos y métodos
                </li>
              </ul>
              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={() =>
                  openCheckout({
                    id: "business",
                    name: "Business",
                    price: 29,
                    billingPeriod: "mes",
                  })
                }
              >
                Simular Checkout Business
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="flex flex-col bg-[#101218] border-[#1f2533]">
            <CardHeader>
              <Badge variant="cyber" className="w-fit mb-2">Avanzado</Badge>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-4 font-mono">
                <span className="text-3xl font-bold text-[#00f0ff]">$79.00</span>
                <span className="text-xs text-slate-400 ml-1">/ mes (Ilustrativo)</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between text-xs space-y-4">
              <ul className="space-y-2.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                  Todo lo incluido en Business
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                  Módulo de Mercado: Gráficos BTC, ETH, SOL, BNB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                  Feed de noticias de la industria en tiempo real
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() =>
                  openCheckout({
                    id: "enterprise",
                    name: "Enterprise",
                    price: 79,
                    billingPeriod: "mes",
                  })
                }
              >
                Simular Checkout Enterprise
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal: Interactive Demo Checkout */}
        <Dialog
          isOpen={!!selectedPlan}
          onClose={closeCheckout}
          title={`Checkout Demo: Plan ${selectedPlan?.name}`}
          description="Simulación de pasarela de pago para evaluación técnica"
        >
          {selectedPlan && (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>AVISO DEMO IMPORTANTE:</strong> Esta pasarela no procesa pagos con dinero real ni requiere ingresar datos de tarjeta o CVV. Todas las transacciones llevan la marca <code>simulated=true</code>.
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-[#0c0e14] border border-[#1d222e] space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Plan seleccionado:</span>
                  <span className="text-white font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Precio de demo base:</span>
                  <span className={appliedDiscount ? "line-through text-slate-500" : "text-white"}>
                    ${selectedPlan.price.toFixed(2)} USD
                  </span>
                </div>

                {appliedDiscount !== null && (
                  <div className="flex justify-between text-[#00ff66]">
                    <span>Descuento cupón ({appliedDiscount * 100}%):</span>
                    <span>-${(selectedPlan.price * appliedDiscount).toFixed(2)} USD</span>
                  </div>
                )}

                <div className="border-t border-[#1d222e] pt-3 flex justify-between text-sm font-bold text-white">
                  <span>Total a simular:</span>
                  <span className="text-[#00ff66] text-base">${getFinalPrice().toFixed(2)} USD</span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Código (ej. CYCLON50 o PORTAFOLIO)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    leftIcon={<Tag className="w-4 h-4" />}
                    className="font-mono uppercase text-xs"
                  />
                  <Button type="submit" variant="secondary" size="md">
                    Aplicar
                  </Button>
                </div>
                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-[#00ff66]">{couponSuccess}</p>}
              </form>

              {/* Simulated Outcome Options */}
              {simulatedOutcome === "idle" ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                    Selecciona el resultado a simular:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSimulatedOutcome("approved")}
                    >
                      Aprobar (Demo)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                      onClick={() => setSimulatedOutcome("pending")}
                    >
                      Pendiente
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSimulatedOutcome("failed")}
                    >
                      Fallido
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {simulatedOutcome === "approved" && (
                    <Alert
                      variant="success"
                      title="¡Suscripción Simulada Aprobada!"
                    >
                      Se ha generado el evento con identificador ficticio <code>DEMO-CHK-84920</code>. El plan {selectedPlan.name} ha sido activado en modo demostración.
                    </Alert>
                  )}
                  {simulatedOutcome === "pending" && (
                    <Alert
                      variant="warning"
                      title="Transacción Simulada Pendiente"
                    >
                      El pago simulado quedó en espera de confirmación. El plan no se activa hasta recibir estado aprobado.
                    </Alert>
                  )}
                  {simulatedOutcome === "failed" && (
                    <Alert
                      variant="error"
                      title="Transacción Simulada Rechazada"
                    >
                      El checkout simulado finalizó con error. Puedes intentar con otro método o reintentar la simulación.
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSimulatedOutcome("idle")}
                    >
                      Probar otro resultado
                    </Button>
                    <Button variant="secondary" size="sm" onClick={closeCheckout}>
                      Cerrar Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
