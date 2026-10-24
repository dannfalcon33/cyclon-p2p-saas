import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-6 text-center cyber-grid-bg">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#11131a] border border-[#262c3d] space-y-4">
        <div className="text-5xl font-extrabold font-mono text-[#00ff66]">404</div>
        <h2 className="text-xl font-bold text-white">Ruta no encontrada</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          La pantalla o recurso que estás buscando no existe o fue reubicado.
        </p>

        <div className="pt-4 flex justify-center">
          <Link href="/">
            <Button variant="primary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Regresar al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
