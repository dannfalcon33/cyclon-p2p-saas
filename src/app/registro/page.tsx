"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import {
  User,
  Mail,
  Lock,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Tag,
  Sparkles,
} from "lucide-react";
import { signUp, signIn, signOut, useSession } from "@/lib/auth/client";
import { usePageLoading } from "@/components/ui/page-loader";
import {
  CATALOG_PLANS,
  type PlanCodeOption,
} from "@/components/plans/PlanCheckoutModal";
import {
  validatePromotionCouponAction,
  simulatePlanCheckoutAction,
} from "@/app/actions/plans";

export default function RegisterPage() {
  const { data: sessionData } = useSession();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [selectedPlan, setSelectedPlan] =
    React.useState<PlanCodeOption>("free_trial");
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);

  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  usePageLoading(isLoading, "Creando cuenta y activando plan...");

  const currentPlan = CATALOG_PLANS[selectedPlan];
  const finalPrice = appliedCoupon
    ? appliedCoupon.finalPrice
    : currentPlan.price;

  const handlePlanChange = (code: PlanCodeOption) => {
    setSelectedPlan(code);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleValidateCoupon = async (codeToUse: string) => {
    const clean = codeToUse.trim().toUpperCase();
    if (!clean) {
      setCouponError("Ingresa un código promocional.");
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await validatePromotionCouponAction({
        couponCode: clean,
        planCode: selectedPlan,
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
      setCouponError("No se pudo validar el cupón.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (
        sessionData?.user?.email &&
        sessionData.user.email.toLowerCase() !== cleanEmail
      ) {
        await signOut();
      }

      const res = await signUp.email({
        email: cleanEmail,
        password,
        name: name.trim(),
      });

      if (res.error) {
        if (
          res.error.message?.toLowerCase().includes("already exists") ||
          res.error.status === 409
        ) {
          const signInFallback = await signIn.email({
            email: cleanEmail,
            password,
          });
          if (signInFallback.error) {
            setError(
              "Ya existe una cuenta con este correo electrónico y otra contraseña."
            );
            setIsLoading(false);
            return;
          }
        } else {
          setError(
            res.error.message ||
              "Error al registrar la cuenta. Inténtalo de nuevo."
          );
          setIsLoading(false);
          return;
        }
      }

      // Activar el plan seleccionado en modo Demo (Free Trial, Business o Enterprise)
      await simulatePlanCheckoutAction({
        planCode: selectedPlan,
        outcome: "approved",
        couponCode: appliedCoupon?.code,
      });

      window.location.href = "/app";
    } catch {
      setError("Ocurrió un error inesperado al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="flex justify-center">
            <DemoNoticeBadge />
          </div>

          <Card className="glass-panel border-[#1f2533]">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-[#00ff66]" />
              </div>
              <CardTitle className="text-2xl justify-center">
                Crear Cuenta Comerciante
              </CardTitle>
              <CardDescription>
                Introduce tus datos, elige tu plan y simula el pago en modo DEMO para acceder a la plataforma
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre o Alias Comercial"
                  placeholder="Ej. Crypto Trader VE"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="comerciante@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />
                </div>

                {/* Selección de Plan y Pago Demo */}
                <div className="p-3.5 rounded-xl bg-[#0c0e14] border border-[#1f2533] space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Plan a Activar (Modo Demo — Sin cobro real)
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      ["free_trial", "business", "enterprise"] as PlanCodeOption[]
                    ).map((code) => {
                      const p = CATALOG_PLANS[code];
                      const active = selectedPlan === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handlePlanChange(code)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            active
                              ? "bg-[#00ff66]/10 border-[#00ff66] text-white"
                              : "bg-[#11131a] border-[#1f2533] text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <div className="text-xs font-bold truncate">
                            {p.name}
                          </div>
                          <div className="text-xs font-mono text-[#00ff66] font-bold mt-0.5">
                            ${p.price.toFixed(2)}
                            <span className="text-[10px] text-slate-400 font-normal">
                              /{p.billingPeriod}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPlan !== "free_trial" && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Cupón promo (CYCLON50 o PORTAFOLIO)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          leftIcon={<Tag className="w-4 h-4" />}
                          className="font-mono uppercase text-xs"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="md"
                          isLoading={isValidatingCoupon}
                          onClick={() => handleValidateCoupon(couponCode)}
                        >
                          Aplicar
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-[#00ff66]" />
                        <span>Probar cupón:</span>
                        <button
                          type="button"
                          onClick={() => handleValidateCoupon("CYCLON50")}
                          className="text-[#00ff66] font-mono hover:underline"
                        >
                          CYCLON50 (-50%)
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleValidateCoupon("PORTAFOLIO")}
                          className="text-cyan-400 font-mono hover:underline"
                        >
                          PORTAFOLIO (-100%)
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-400">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <p className="text-xs text-[#00ff66]">
                          {appliedCoupon.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#1d222e] text-xs font-mono">
                    <span className="text-slate-400">
                      Total Pago Simulado ({currentPlan.name}):
                    </span>
                    <span className="text-sm font-bold text-[#00ff66]">
                      ${finalPrice.toFixed(2)} USD (DEMO)
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[#0e1017] border border-[#1f2533] text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#00ff66]" />
                    <span>Tu espacio de trabajo incluye:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Workspace privado aislado, activación inmediata del plan elegido en modo Demo y configuración personalizada de bancos y métodos para tu país.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Crear Usuario, Pagar Demo (${finalPrice.toFixed(2)}) e Iniciar
                  Sesión
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#1c212e] text-center text-xs text-slate-400">
                ¿Ya tienes una cuenta registrada?{" "}
                <Link
                  href="/login"
                  className="text-[#00ff66] font-semibold hover:underline"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
