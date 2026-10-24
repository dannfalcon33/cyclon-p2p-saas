"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#11131a] border border-[#262c3d] space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Error de Ejecución</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ocurrió un problema inesperado al procesar la solicitud.
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => reset()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Reintentar
          </Button>
          <Link href="/">
            <Button variant="primary" size="sm">
              <Home className="w-4 h-4 mr-1.5" />
              Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
