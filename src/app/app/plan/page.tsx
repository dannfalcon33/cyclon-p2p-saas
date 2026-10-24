"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Tag,
  CreditCard,
  XCircle,
  Clock,
  Layers,
} from "lucide-react";
import {
  fetchWorkspaceSubscriptionAction,
  validatePromotionCouponAction,
  simulatePlanCheckoutAction,
} from "@/app/actions/plans";

export default function MerchantPlanPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Modal checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = React.useState<"business" | "enterprise">("business");
  const [outcome, setOutcome] = React.useState<"approved" | "pending" | "failed">("approved");
  const [couponCode, setCouponCode] = React.useState("");
  const [couponDiscount, setCouponDiscount] = React.useState<{
    valid: boolean;
    message: string;
    discountAmount: number;
    finalPrice: number;
    originalPrice: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = React.useState(false);
  const [checkoutResult, setCheckoutResult] = React.useState<{
    success: boolean;
    outcome: string;
    demoReference: string;
    message: string;
    amountDisplayed: string;
    planName: string;
  } | null>(null);

  const loadSubscription = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchWorkspaceSubscriptionAction();
      setData(res);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al cargar la información de suscripción.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleOpenCheckout = (planCode: "business" | "enterprise") => {
    setSelectedPlanCode(planCode);
    setOutcome("approved");
    setCouponCode("");
    setCouponDiscount(null);
    setCheckoutResult(null);
    setIsCheckoutOpen(true);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const res = await validatePromotionCouponAction({
        couponCode: couponCode.trim(),
        planCode: selectedPlanCode,
      });

      if (res.valid) {
        setCouponDiscount({
          valid: true,
          message: res.message,
          discountAmount: res.discountAmount,
          finalPrice: res.finalPrice,
          originalPrice: res.originalPrice,
        });
      } else {
        setCouponDiscount({
          valid: false,
          message: res.message,
          discountAmount: 0,
          finalPrice: res.originalPrice,
          originalPrice: res.originalPrice,
        });
      }
    } catch (err: any) {
      setCouponDiscount({
        valid: false,
        message: err.message || "Error al validar el cupón.",
        discountAmount: 0,
        finalPrice: selectedPlanCode === "business" ? 29 : 79,
        originalPrice: selectedPlanCode === "business" ? 29 : 79,
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCheckout(true);
    try {
      const result = await simulatePlanCheckoutAction({
        planCode: selectedPlanCode,
        outcome,
        couponCode: couponDiscount?.valid ? couponCode.trim() : undefined,
      });

      setCheckoutResult(result);
      if (result.success) {
        await loadSubscription();
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al ejecutar el checkout simulado.",
      });
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const sub = data?.subscription;
  const isExpired = sub?.isExpired;
  const planCode = sub?.planCode;

  const getPlanBadge = () => {
    if (isExpired) {
      return <Badge variant="error">PRUEBA EXPIRADA</Badge>;
    }
    if (planCode === "enterprise") {
      return <Badge variant="cyber">ENTERPRISE ACTIVO</Badge>;
    }
    if (planCode === "business") {
      return <Badge variant="neon">BUSINESS ACTIVO</Badge>;
    }
    return <Badge variant="neon">FREE TRIAL (7 DÍAS)</Badge>;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#1c2230]">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#00ff66]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Mi Plan, Capacidades y Facturación Simulada
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Supervisa el estado de tu período de prueba, las funciones habilitadas de tu espacio y experimenta la activación de planes en modo demo.
        </p>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "Operación Exitosa" : "Atención"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Trial Expired Alert Banner */}
      {isExpired && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            Tu período de prueba gratuita de 7 días ha finalizado
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            De acuerdo con nuestra política de integridad, <strong>tu historial de operaciones y la exportación completa a Excel (.xlsx) permanecen 100% disponibles</strong>. Para desbloquear el registro de nuevas transacciones P2P, simula la activación de un plan Business o Enterprise a continuación.
          </p>
        </div>
      )}

      {/* Current Plan Status Card */}
      {isLoading ? (
        <Card className="bg-[#10131a] border-[#1e2433] p-8 text-center text-xs font-mono text-slate-400">
          Cargando capacidades de suscripción desde Neon PostgreSQL...
        </Card>
      ) : (
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {getPlanBadge()}
                  <span className={`text-xs font-mono ${isExpired ? "text-rose-400" : "text-emerald-400"}`}>
                    {isExpired ? "Restringido (Solo lectura / exportación)" : "Activo"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#181d29] text-slate-400 font-mono">
                    Modo Demo
                  </span>
                </div>
                <CardTitle className="text-xl mt-2">{sub?.planName || "Plan Comercial"}</CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  {planCode === "enterprise"
                    ? "Acceso total a bitácora P2P, cotizaciones en vivo BTC/ETH/SOL/BNB y feed de noticias del mercado."
                    : planCode === "business"
                    ? "Bitácora completa con operaciones ilimitadas, comisiones por país y generador Excel multilibro."
                    : "Tu período de prueba de 7 días con acceso a funciones de Business."}
                </p>
              </div>

              <div className="text-left sm:text-right font-mono">
                <span className="text-xs text-slate-400 block">Vigencia:</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-[#00ff66]" />
                  {isExpired
                    ? "Expirado"
                    : sub?.remainingDays !== undefined
                    ? `${sub.remainingDays} días restantes`
                    : "Ilimitado"}
                </span>
                {sub?.endsAt && (
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Hasta: {new Date(sub.endsAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="border-t border-[#181d29] pt-4 space-y-4">
            <div className="p-3.5 rounded-lg bg-[#0c0e14] border border-[#1d222e] text-xs text-slate-300 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#00ff66] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-white">Política de retención de datos inmutable:</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Si tu período de prueba finaliza sin activar un plan, <strong>tus datos y operaciones registradas nunca serán eliminados ni purgados</strong>. Podrás seguir consultando tus métricas y exportando tu historial a libros Excel en cualquier momento.
                </p>
              </div>
            </div>

            {/* Active Features Checklist */}
            <div className="pt-2">
              <span className="text-xs font-mono text-slate-400 block mb-2 font-semibold">
                Capacidades Habilitadas en tu Espacio:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  <span>Dashboard & Métricas P2P</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  <span>Reportes Excel (.xlsx) Multilibro</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  <span>Comisiones de 7 Países LATAM</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                  <span>Bancos y Métodos Privados</span>
                </div>
                <div className="flex items-center gap-2">
                  {!isExpired ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      <span className="text-slate-300">Registro de Nuevas Operaciones</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400 line-through">Registro de Nuevas Operaciones</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {sub?.features?.includes("enterprise_market_charts") ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                      <span className="text-cyan-300">Cotizaciones Cripto en Tiempo Real</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-500">Cotizaciones Cripto (Solo Enterprise)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans to Upgrade */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00ff66]" />
          Planes Disponibles para Simulación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Upgrade */}
          <Card
            className={`bg-[#121622] flex flex-col justify-between transition-all ${
              planCode === "business" && !isExpired
                ? "border-[#00ff66] ring-1 ring-[#00ff66]/30"
                : "border-[#00ff66]/40 hover:border-[#00ff66]"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <Badge variant="neon">Recomendado Comerciantes</Badge>
                {planCode === "business" && !isExpired ? (
                  <Badge variant="success">Tu Plan Actual</Badge>
                ) : (
                  <span className="text-xs font-mono text-slate-400">Demo</span>
                )}
              </div>
              <CardTitle className="text-xl mt-2">Business</CardTitle>
              <div className="font-mono mt-2">
                <span className="text-3xl font-bold text-white">$29.00</span>
                <span className="text-xs text-slate-400 ml-1">/ mes simulado</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Para comerciantes activos que necesitan bitácora sin límites, comisiones por país y reportes Excel multilibro.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                  Operaciones P2P ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                  Reglas de comisión por país (VE, CO, BR, AR, EC, PE, CL)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                  Catálogo privado de bancos y métodos de pago
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                  Exportaciones multilibro en Excel (.xlsx) sanitizadas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66]" />
                  Soporte prioritario
                </li>
              </ul>

              <Button
                variant={planCode === "business" && !isExpired ? "secondary" : "primary"}
                className="w-full text-xs"
                onClick={() => handleOpenCheckout("business")}
              >
                {planCode === "business" && !isExpired
                  ? "Reactivar / Renovar Business Demo"
                  : "Simular Activación Business ($29/mes)"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Upgrade */}
          <Card
            className={`bg-[#10131a] flex flex-col justify-between transition-all ${
              planCode === "enterprise" && !isExpired
                ? "border-cyan-400 ring-1 ring-cyan-400/30"
                : "border-[#1e2433] hover:border-cyan-500/50"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <Badge variant="cyber">Avanzado / Portafolio</Badge>
                {planCode === "enterprise" && !isExpired ? (
                  <Badge variant="cyber">Tu Plan Actual</Badge>
                ) : (
                  <span className="text-xs font-mono text-slate-400">Demo</span>
                )}
              </div>
              <CardTitle className="text-xl mt-2">Enterprise</CardTitle>
              <div className="font-mono mt-2">
                <span className="text-3xl font-bold text-[#00f0ff]">$79.00</span>
                <span className="text-xs text-slate-400 ml-1">/ mes simulado</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Todo lo de Business más cotizaciones en tiempo real BTC/ETH/SOL/BNB y feed de noticias especializadas para arbitraje.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <strong>Todo lo incluido en Business</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Gráficos de cotizaciones en tiempo real BTC/ETH/SOL/BNB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Feed de noticias del mercado cripto y arbitraje P2P
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Auditoría avanzada y reportes consolidados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Atención directa para mesas de dinero
                </li>
              </ul>

              <Button
                variant="outline"
                className="w-full text-xs border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => handleOpenCheckout("enterprise")}
              >
                {planCode === "enterprise" && !isExpired
                  ? "Reactivar / Renovar Enterprise Demo"
                  : "Simular Activación Enterprise ($79/mes)"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Simulation Modal (DemoBillingProvider) */}
      <Dialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={`Checkout Simulado: Plan ${selectedPlanCode.toUpperCase()}`}
        description="Pasarela de Facturación de Demostración (DemoBillingProvider)"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            ⚠️ <strong>FACTURACIÓN SIMULADA:</strong> No se solicitan datos de tarjeta ni pagos reales. Se registrará un evento simulado con identificador ficticio en base de datos (<code>is_simulated = true</code>).
          </div>

          {!checkoutResult ? (
            <form onSubmit={handleExecuteCheckout} className="space-y-4">
              {/* Plan Details Box */}
              <div className="p-3.5 rounded-lg bg-[#0c0e14] border border-[#1e2433] font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Plan Seleccionado:</span>
                  <span className="text-white font-bold">{selectedPlanCode.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Precio Base de Lista:</span>
                  <span className="text-white">
                    {selectedPlanCode === "business" ? "$29.00 USD" : "$79.00 USD"}
                  </span>
                </div>

                {couponDiscount?.valid && (
                  <div className="flex justify-between text-emerald-400 font-semibold border-t border-[#1a1f2b] pt-1">
                    <span>Descuento Cupón ({couponCode.toUpperCase()}):</span>
                    <span>-${couponDiscount.discountAmount.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex justify-between text-white font-bold border-t border-[#1a1f2b] pt-2 text-sm">
                  <span>Total a Simular:</span>
                  <span className="text-[#00ff66]">
                    ${couponDiscount?.valid
                      ? couponDiscount.finalPrice.toFixed(2)
                      : selectedPlanCode === "business"
                      ? "29.00"
                      : "79.00"}{" "}
                    USD
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#00ff66]" />
                    ¿Tienes un cupón de demostración?
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Sugerido: <code className="text-[#00ff66]">CYCLON50</code> (50% OFF)
                  </span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Código (ej. CYCLON50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="text-xs uppercase font-mono"
                    disabled={couponDiscount?.valid}
                  />
                  {couponDiscount?.valid ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="text-xs text-rose-400 hover:text-rose-300"
                      onClick={() => {
                        setCouponDiscount(null);
                        setCouponCode("");
                      }}
                    >
                      Quitar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="text-xs font-mono"
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                    >
                      {isValidatingCoupon ? "Validando..." : "Aplicar"}
                    </Button>
                  )}
                </div>

                {couponDiscount && (
                  <p
                    className={`text-[11px] font-mono mt-1 ${
                      couponDiscount.valid ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {couponDiscount.message}
                  </p>
                )}
              </div>

              {/* Simulation Outcome Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#00ff66]" />
                  Simular Resultado de la Transacción:
                </label>
                <Select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as any)}
                  className="text-xs font-mono"
                >
                  <option value="approved">Aprobado (Simular Cobro Exitoso)</option>
                  <option value="pending">Pendiente (Simular Pago en Verificación)</option>
                  <option value="failed">Fallido (Simular Rechazo de Tarjeta / Fondos)</option>
                </Select>
                <p className="text-[10px] text-slate-400">
                  Permite comprobar el comportamiento del sistema ante cada respuesta de la pasarela.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={isSubmittingCheckout}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingCheckout}
                >
                  {isSubmittingCheckout ? "Procesando Simulación..." : "Confirmar Checkout Demo"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert
                variant={
                  checkoutResult.outcome === "approved"
                    ? "success"
                    : checkoutResult.outcome === "pending"
                    ? "warning"
                    : "error"
                }
                title={
                  checkoutResult.outcome === "approved"
                    ? "¡Plan Activado en Modo Demo!"
                    : checkoutResult.outcome === "pending"
                    ? "Pago en Estado Pendiente"
                    : "Pago Simulado Rechazado"
                }
              >
                {checkoutResult.message}
              </Alert>

              <div className="p-3 rounded-lg bg-[#0c0e14] border border-[#1e2433] text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Referencia Demo:</span>
                  <span className="text-white font-bold">{checkoutResult.demoReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="text-white">{checkoutResult.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Mostrado:</span>
                  <span className="text-[#00ff66]">${checkoutResult.amountDisplayed} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estado en Base de Datos:</span>
                  <span className="text-cyan-400 uppercase font-semibold">
                    {checkoutResult.outcome}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
