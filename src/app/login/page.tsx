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
import { Mail, Lock, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        // Mensaje genérico para evitar enumeración de usuarios
        if (res.error.message?.toLowerCase().includes("suspended")) {
          setError("Tu cuenta se encuentra suspendida por el administrador.");
        } else {
          setError("Credenciales inválidas o correo no registrado.");
        }
        setIsLoading(false);
        return;
      }

      // Redirección por rol
      const user = res.data?.user as any;
      if (user?.role === "platform_owner") {
        router.push("/master");
      } else {
        router.push("/app");
      }
      router.refresh();
    } catch (err: any) {
      setError("Error de conexión con el servicio de autenticación.");
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
              <CardTitle className="text-2xl justify-center">Iniciar Sesión</CardTitle>
              <CardDescription>
                Accede a tu bitácora y métricas de operaciones P2P
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="comerciante@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Contraseña
                    </label>
                    <Link
                      href="/recuperar-clave"
                      className="text-xs text-[#00ff66] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Entrar a la Plataforma
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#1c212e] text-center text-xs text-slate-400">
                ¿No tienes una cuenta aún?{" "}
                <Link href="/registro" className="text-[#00ff66] font-semibold hover:underline">
                  Regístrate aquí (Prueba 7 días)
                </Link>
              </div>

              {/* Credenciales Demo Rápidas */}
              <div className="mt-4 p-3 rounded-xl bg-[#0e1017] border border-[#1f2533] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>ACCESO RÁPIDO DEMO</span>
                  <span className="text-[#00ff66] font-semibold">Base de Datos Neon</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("demo@cyclonp2p.com");
                      setPassword("Password123!");
                    }}
                    className="p-2 rounded-lg bg-[#141722] hover:bg-[#1b2030] border border-[#232b3d] text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-xs font-semibold text-[#00ff66]">Comerciante Demo</span>
                    <span className="block text-[10px] font-mono text-slate-400 truncate">demo@cyclonp2p.com</span>
                    <span className="block text-[9px] text-slate-400">Password123!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail("master@cyclonp2p.com");
                      setPassword("MasterPassword123!");
                    }}
                    className="p-2 rounded-lg bg-[#1a140e] hover:bg-[#261d14] border border-[#3d2b1a] text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-xs font-semibold text-amber-400">Propietario Master</span>
                    <span className="block text-[10px] font-mono text-amber-200/70 truncate">master@cyclonp2p.com</span>
                    <span className="block text-[9px] text-slate-400">MasterPassword123!</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
