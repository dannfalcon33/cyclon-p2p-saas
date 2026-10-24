"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="glass-panel border-[#1f2533]">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-[#00ff66]" />
              </div>
              <CardTitle className="text-2xl justify-center">Verificación de Correo</CardTitle>
              <CardDescription>
                Estado de activación de tu cuenta de comerciante
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1f2533] text-center space-y-2">
                <Mail className="w-8 h-8 text-[#00ff66] mx-auto mb-1" />
                <p className="text-sm font-medium text-white">
                  Tu correo electrónico ha sido procesado
                </p>
                <p className="text-xs text-slate-400">
                  En el entorno actual de desarrollo y demostración, tu espacio de trabajo y prueba gratuita de 7 días ya se encuentran listos para operar.
                </p>
              </div>

              <Link href="/app">
                <Button variant="primary" className="w-full">
                  Continuar al Dashboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
