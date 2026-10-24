"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import { User, Mail, Lock, Zap, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { signUp } from "@/lib/auth/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

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
      const res = await signUp.email({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      });

      if (res.error) {
        if (res.error.message?.includes("already exists") || res.error.status === 409) {
          setError("Ya existe una cuenta con este correo electrónico.");
        } else {
          setError(res.error.message || "Error al registrar la cuenta. Inténtalo de nuevo.");
        }
        setIsLoading(false);
        return;
      }

      // Registro exitoso: workspace y trial aprovisionados automáticamente
      router.push("/app");
      router.refresh();
    } catch (err: any) {
      setError("Ocurrió un error inesperado al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <DemoNoticeBadge />
          </div>

          <Card className="glass-panel border-[#1f2533]">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-[#00ff66]" />
              </div>
              <CardTitle className="text-2xl justify-center">Crear Cuenta Comerciante</CardTitle>
              <CardDescription>
                Empieza tu prueba gratuita de 7 días con acceso a todas las funciones
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
                    Workspace privado aislado, 7 días de Free Trial automático y configuración personalizada de bancos y métodos para tu país.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Registrarse e Iniciar Trial
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#1c212e] text-center text-xs text-slate-400">
                ¿Ya tienes una cuenta registrada?{" "}
                <Link href="/login" className="text-[#00ff66] font-semibold hover:underline">
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
