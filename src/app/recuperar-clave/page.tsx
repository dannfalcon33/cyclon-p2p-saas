"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: "/recuperar-clave/reset",
      });
    } catch (err) {
      // Ignorar error intencionalmente para evitar enumeración de usuarios
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="glass-panel border-[#1f2533]">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6 text-[#00ff66]" />
              </div>
              <CardTitle className="text-2xl justify-center">Recuperar Contraseña</CardTitle>
              <CardDescription>
                Ingresa tu correo para recibir un enlace de restablecimiento
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSubmitted ? (
                <div className="space-y-4">
                  <Alert
                    variant="success"
                    title="Enlace de recuperación enviado"
                  >
                    Si la dirección <strong>{email}</strong> está registrada en Cyclon P2P, recibirás un enlace seguro para restablecer tu acceso.
                  </Alert>

                  <div className="pt-2 text-center">
                    <Link href="/login">
                      <Button variant="secondary" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Volver a Iniciar Sesión
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
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

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={isLoading}
                  >
                    Enviar Enlace de Recuperación
                  </Button>

                  <div className="pt-2 text-center">
                    <Link
                      href="/login"
                      className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Regresar al inicio de sesión
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
