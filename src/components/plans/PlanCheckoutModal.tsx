"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Tag,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Wallet,
  Building2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { signIn, signUp, signOut, useSession } from "@/lib/auth/client";
import {
  validatePromotionCouponAction,
  simulatePlanCheckoutAction,
  fetchActivePromotionBannerAction,
} from "@/app/actions/plans";
import type { ActiveBannerPromotion } from "@/lib/services/plan-service";

export type PlanCodeOption = "free_trial" | "business" | "enterprise";

export interface PlanOptionInfo {
  code: PlanCodeOption;
  name: string;
  price: number;
  billingPeriod: string;
  badge: string;
}

export const CATALOG_PLANS: Record<PlanCodeOption, PlanOptionInfo> = {
  free_trial: {
    code: "free_trial",
    name: "Free Trial (7 Días)",
    price: 0,
    billingPeriod: "7 días",
    badge: "Prueba Gratis",
  },
  business: {
    code: "business",
    name: "Business",
    price: 29,
    billingPeriod: "30 días",
    badge: "Más Popular",
  },
  enterprise: {
    code: "enterprise",
    name: "Enterprise",
    price: 79,
    billingPeriod: "30 días",
    badge: "Avanzado",
  },
};

interface PlanCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanCode: PlanCodeOption | null;
  initialCouponCode?: string | null;
}

export function PlanCheckoutModal({
  isOpen,
  onClose,
  initialPlanCode,
  initialCouponCode,
}: PlanCheckoutModalProps) {
  const { data: sessionData } = useSession();

  const [planCode, setPlanCode] = React.useState<PlanCodeOption>(
    initialPlanCode || "business"
  );

  // Modo de cuenta: "register" (nuevo usuario), "login" (usuario existente), "current" (sesión actual)
  const [authMode, setAuthMode] = React.useState<"register" | "login" | "current">(
    "register"
  );

  // Campos del formulario de usuario
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Método de pago demo (solo ilustrativo, sin datos sensibles reales)
  const [demoPaymentMethod, setDemoPaymentMethod] = React.useState<
    "binance_pay" | "demo_card" | "bank_transfer"
  >("binance_pay");

  // Estado de cupón promocional
  const [activePromo, setActivePromo] =
    React.useState<ActiveBannerPromotion | null>(null);
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);

  // Estado de ejecución de checkout + creación de usuario
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = React.useState<{
    outcome: "approved" | "pending" | "failed";
    demoReference: string;
    amountDisplayed: string;
    planName: string;
    message: string;
    userEmail: string;
  } | null>(null);

  const applyCouponByCode = React.useCallback(
    async (codeToValidate: string, targetPlan: PlanCodeOption) => {
      const clean = codeToValidate.trim().toUpperCase();
      if (!clean) {
        setCouponError("Ingresa un código promocional.");
        return;
      }

      setIsValidatingCoupon(true);
      setCouponError(null);

      try {
        const res = await validatePromotionCouponAction({
          couponCode: clean,
          planCode: targetPlan,
        });

        if (!res.valid) {
          setCouponError(res.message);
          setAppliedCoupon(null);
        } else {
          setCouponCode(clean);
          setAppliedCoupon({
            code: clean,
            discountAmount: res.discountAmount,
            finalPrice: res.finalPrice,
            message: res.message,
          });
        }
      } catch {
        setCouponError("No se pudo validar el cupón en este momento.");
      } finally {
        setIsValidatingCoupon(false);
      }
    },
    []
  );

  React.useEffect(() => {
    if (!isOpen) return;

    const targetPlan = initialPlanCode || "business";
    setPlanCode(targetPlan);
    setAppliedCoupon(null);
    setCouponError(null);
    setFormError(null);
    setCheckoutResult(null);

    fetchActivePromotionBannerAction()
      .then((res) => setActivePromo(res))
      .catch(() => {});

    if (initialCouponCode && targetPlan !== "free_trial") {
      setCouponCode(initialCouponCode);
      applyCouponByCode(initialCouponCode, targetPlan);
    }
  }, [initialPlanCode, initialCouponCode, isOpen, applyCouponByCode]);

  const currentPlan = CATALOG_PLANS[planCode];

  const handlePlanSwitch = (newCode: PlanCodeOption) => {
    setPlanCode(newCode);
    setAppliedCoupon(null);
    setCouponError(null);
    setCheckoutResult(null);
  };

  const handleApplyCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await applyCouponByCode(couponCode, planCode);
  };

  const finalPrice = appliedCoupon ? appliedCoupon.finalPrice : currentPlan.price;

  const handleProcessCheckout = async (
    outcome: "approved" | "pending" | "failed"
  ) => {
    setFormError(null);

    let activeUserEmail = "";

    // 1. Validar datos de usuario según el modo elegido
    if (authMode === "register") {
      if (!name.trim()) {
        setFormError("Ingresa tu nombre o alias comercial para crear tu cuenta.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setFormError("Ingresa un correo electrónico válido.");
        return;
      }
      if (password.length < 8) {
        setFormError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError("Las contraseñas no coinciden.");
        return;
      }
    } else if (authMode === "login") {
      if (!email.trim() || !email.includes("@")) {
        setFormError("Ingresa tu correo electrónico registrado.");
        return;
      }
      if (!password) {
        setFormError("Ingresa tu contraseña.");
        return;
      }
    } else if (authMode === "current") {
      if (!sessionData?.user?.email) {
        setFormError("No hay una sesión activa. Selecciona 'Nuevo Usuario'.");
        setAuthMode("register");
        return;
      }
      activeUserEmail = sessionData.user.email;
    }

    setIsSubmitting(true);

    try {
      // 2. Autenticar o registrar al usuario en PostgreSQL mediante Better Auth
      if (authMode === "register") {
        const cleanEmail = email.trim().toLowerCase();

        if (
          sessionData?.user?.email &&
          sessionData.user.email.toLowerCase() !== cleanEmail
        ) {
          await signOut();
        }

        const signUpRes = await signUp.email({
          name: name.trim(),
          email: cleanEmail,
          password,
        });

        if (signUpRes.error) {
          const alreadyExists =
            signUpRes.error.status === 409 ||
            signUpRes.error.message?.toLowerCase().includes("already exists") ||
            signUpRes.error.message?.toLowerCase().includes("user already exists");

          if (alreadyExists) {
            const signInFallback = await signIn.email({
              email: cleanEmail,
              password,
            });

            if (signInFallback.error) {
              setFormError(
                "Este correo ya está registrado con otra contraseña. Verifica tu contraseña o usa la pestaña 'Ya tengo cuenta'."
              );
              setIsSubmitting(false);
              return;
            }
          } else {
            setFormError(
              signUpRes.error.message ||
                "No se pudo registrar el usuario. Verifica los datos."
            );
            setIsSubmitting(false);
            return;
          }
        }

        activeUserEmail = cleanEmail;
      } else if (authMode === "login") {
        const cleanEmail = email.trim().toLowerCase();

        if (
          sessionData?.user?.email &&
          sessionData.user.email.toLowerCase() !== cleanEmail
        ) {
          await signOut();
        }

        const signInRes = await signIn.email({
          email: cleanEmail,
          password,
        });

        if (signInRes.error) {
          setFormError(
            "Credenciales inválidas. Verifica tu correo y contraseña o regístrate como 'Nuevo Usuario'."
          );
          setIsSubmitting(false);
          return;
        }

        activeUserEmail = cleanEmail;
      }

      // 3. Ejecutar el Checkout Simulado real en Base de Datos (billing_events + subscriptions)
      const result = await simulatePlanCheckoutAction({
        planCode,
        outcome,
        couponCode: appliedCoupon?.code,
      });

      setCheckoutResult({
        ...result,
        userEmail: activeUserEmail,
      });

      // 4. Si el pago demo fue aprobado, redirigir limpiamente al Dashboard del nuevo usuario
      if (outcome === "approved") {
        setTimeout(() => {
          window.location.href = "/app";
        }, 1000);
      }
    } catch (err: any) {
      setFormError(
        err?.message ||
          "Ocurrió un error al procesar el registro y checkout demo. Inténtalo nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Activar Plan ${currentPlan.name}`}
      description="Registro de cuenta comerciante y pasarela de pago en modo DEMO"
      className="max-w-xl"
    >
      <div className="space-y-5">
        {/* Aviso de Pasarela Demo */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>MODO DEMO — NO SE REALIZA NINGÚN COBRO:</strong> Esta pasarela crea tu usuario real en la base de datos y activa el plan elegido mediante facturación simulada (<code>is_simulated = true</code>) sin pedir tarjetas reales ni CVV.
          </div>
        </div>

        {/* Selector Rápido de Plan */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            1. Plan Seleccionado
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["free_trial", "business", "enterprise"] as PlanCodeOption[]).map(
              (code) => {
                const p = CATALOG_PLANS[code];
                const isSelected = planCode === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handlePlanSwitch(code)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-[#00ff66]/10 border-[#00ff66] text-white shadow-[0_0_15px_rgba(0,255,102,0.15)]"
                        : "bg-[#0c0e14] border-[#1f2533] text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-sm font-mono font-extrabold text-[#00ff66] mt-0.5">
                      ${p.price.toFixed(2)}
                      <span className="text-[10px] text-slate-400 font-normal">
                        /{p.billingPeriod}
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Sección 2: Datos del Usuario */}
        <div className="p-4 rounded-xl bg-[#0c0e14] border border-[#1f2533] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c212e] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              2. Datos del Usuario Comerciante
            </span>

            <div className="flex items-center gap-1 bg-[#141821] p-1 rounded-lg border border-[#232938]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setFormError(null);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  authMode === "register"
                    ? "bg-[#00ff66] text-black font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Nuevo Usuario
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setFormError(null);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  authMode === "login"
                    ? "bg-[#00ff66] text-black font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Ya tengo cuenta
              </button>
              {sessionData?.user && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("current");
                    setFormError(null);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    authMode === "current"
                      ? "bg-[#00ff66] text-black font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sesión actual
                </button>
              )}
            </div>
          </div>

          {authMode === "register" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Nombre o Alias Comercial"
                  placeholder="Ej. Crypto Trader VE"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="comerciante@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>
              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>
              <div>
                <Input
                  label="Confirmar Contraseña"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>
            </div>
          )}

          {authMode === "login" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Correo Electrónico Registrado"
                  type="email"
                  placeholder="comerciante@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Tu contraseña actual"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>
            </div>
          )}

          {authMode === "current" && sessionData?.user && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#111520] border border-[#232938] text-xs">
              <div>
                <div className="text-slate-400">Sesión iniciada como:</div>
                <div className="text-white font-semibold mt-0.5">
                  {sessionData.user.name} ({sessionData.user.email})
                </div>
              </div>
              <Badge variant="neon">Activa</Badge>
            </div>
          )}
        </div>

        {/* Sección 3: Datos de Pago Demo y Cupón */}
        <div className="p-4 rounded-xl bg-[#0c0e14] border border-[#1f2533] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              3. Pago en Demo y Resumen
            </span>
            <Badge variant="warning">Simulación Interactiva</Badge>
          </div>

          {/* Método de pago simulado */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoPaymentMethod("binance_pay")}
              className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                demoPaymentMethod === "binance_pay"
                  ? "bg-[#00ff66]/10 border-[#00ff66] text-white"
                  : "bg-[#11131a] border-[#1f2533] text-slate-400"
              }`}
            >
              <Wallet className="w-4 h-4 text-[#00ff66]" />
              <span className="font-mono text-[11px]">USDT / Pay Demo</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoPaymentMethod("demo_card")}
              className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                demoPaymentMethod === "demo_card"
                  ? "bg-[#00ff66]/10 border-[#00ff66] text-white"
                  : "bg-[#11131a] border-[#1f2533] text-slate-400"
              }`}
            >
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-[11px]">Tarjeta Demo 4242</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoPaymentMethod("bank_transfer")}
              className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                demoPaymentMethod === "bank_transfer"
                  ? "bg-[#00ff66]/10 border-[#00ff66] text-white"
                  : "bg-[#11131a] border-[#1f2533] text-slate-400"
              }`}
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-[11px]">Transferencia Demo</span>
            </button>
          </div>

          {/* Cupón promocional (para planes Business y Enterprise) */}
          {planCode !== "free_trial" && (
            <div className="space-y-2">
              <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                <Input
                  placeholder="Ingresa tu código de cupón promocional"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  leftIcon={<Tag className="w-4 h-4" />}
                  className="font-mono uppercase text-xs"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  isLoading={isValidatingCoupon}
                >
                  Aplicar
                </Button>
              </form>

              {activePromo && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-[#00ff66]" />
                  <span>Cupón activo en plataforma:</span>
                  <button
                    type="button"
                    onClick={() => applyCouponByCode(activePromo.code, planCode)}
                    className="text-[#00ff66] font-mono font-bold hover:underline cursor-pointer"
                  >
                    {activePromo.code} (
                    {activePromo.discountType === "percentage"
                      ? `-${parseFloat(activePromo.discountValue)}%`
                      : `-$${parseFloat(activePromo.discountValue).toFixed(2)} USD`}
                    )
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-red-400">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="text-xs text-[#00ff66]">{appliedCoupon.message}</p>
              )}
            </div>
          )}

          {/* Resumen financiero */}
          <div className="pt-2 border-t border-[#1d222e] space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Plan y vigencia:</span>
              <span className="text-white">
                {currentPlan.name} ({currentPlan.billingPeriod})
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Precio base demo:</span>
              <span
                className={
                  appliedCoupon ? "line-through text-slate-500" : "text-white"
                }
              >
                ${currentPlan.price.toFixed(2)} USD
              </span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-[#00ff66]">
                <span>Cupón aplicado ({appliedCoupon.code}):</span>
                <span>-${appliedCoupon.discountAmount.toFixed(2)} USD</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-[#1d222e]">
              <span>Total Demo a Simular:</span>
              <span className="text-[#00ff66]">
                ${finalPrice.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Errores de validación o autenticación */}
        {formError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Resultado o Botones de Acción */}
        {checkoutResult ? (
          <div className="space-y-4">
            {checkoutResult.outcome === "approved" && (
              <Alert
                variant="success"
                title="¡Usuario Iniciado y Plan Activado!"
              >
                <div className="space-y-1 text-xs">
                  <p>{checkoutResult.message}</p>
                  <p className="font-mono text-[11px] text-emerald-300">
                    Cuenta activa: <strong>{checkoutResult.userEmail}</strong> | Ref:{" "}
                    <code>{checkoutResult.demoReference}</code>
                  </p>
                </div>
              </Alert>
            )}

            {checkoutResult.outcome === "pending" && (
              <Alert
                variant="warning"
                title="Pago Demo en Estado Pendiente"
              >
                <div className="space-y-1 text-xs">
                  <p>{checkoutResult.message}</p>
                  <p className="font-mono text-[11px]">
                    Cuenta creada: <strong>{checkoutResult.userEmail}</strong> | Ref:{" "}
                    <code>{checkoutResult.demoReference}</code>
                  </p>
                </div>
              </Alert>
            )}

            {checkoutResult.outcome === "failed" && (
              <Alert
                variant="error"
                title="Pago Demo Simulado como Fallido"
              >
                <div className="space-y-1 text-xs">
                  <p>{checkoutResult.message}</p>
                  <p className="font-mono text-[11px]">
                    Ref: <code>{checkoutResult.demoReference}</code>
                  </p>
                </div>
              </Alert>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              {checkoutResult.outcome !== "approved" && (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={() => handleProcessCheckout("approved")}
                >
                  Aprobar Ahora y Entrar al Dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {checkoutResult.outcome === "approved" && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    window.location.href = "/app";
                  }}
                >
                  Entrar al Dashboard Ahora (/app)
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full text-sm font-bold"
              isLoading={isSubmitting}
              onClick={() => handleProcessCheckout("approved")}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {authMode === "register"
                ? `Crear Usuario, Pagar Demo ($${finalPrice.toFixed(2)}) e Iniciar Sesión`
                : `Aprobar Pago Demo ($${finalPrice.toFixed(2)}) e Iniciar Sesión`}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            {/* Botones opcionales para evaluar estados Pendiente / Fallido */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                Otros escenarios de prueba:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-[11px] h-7 px-2.5 text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                  onClick={() => handleProcessCheckout("pending")}
                >
                  Simular Pendiente
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-[11px] h-7 px-2.5"
                  onClick={() => handleProcessCheckout("failed")}
                >
                  Simular Fallido
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
