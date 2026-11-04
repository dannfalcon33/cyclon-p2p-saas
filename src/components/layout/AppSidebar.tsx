"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Sliders,
  CreditCard,
  LineChart,
  LogOut,
  Zap,
  Globe2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { fetchWorkspaceSubscriptionAction } from "@/app/actions/plans";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/components/ui/page-loader";

const NAV_ITEMS = [
  {
    name: "Dashboard Resumen",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    name: "Bitácora Operaciones",
    href: "/app/operaciones",
    icon: ArrowLeftRight,
  },
  {
    name: "Nueva Operación",
    href: "/app/operaciones/nueva",
    icon: PlusCircle,
    highlight: true,
  },
  {
    name: "Comisiones & Bancos",
    href: "/app/configuracion",
    icon: Sliders,
  },
  {
    name: "Mercado Enterprise",
    href: "/app/mercado",
    icon: LineChart,
    badge: "PRO",
  },
  {
    name: "Mi Plan & Cuenta",
    href: "/app/plan",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [subData, setSubData] = React.useState<any>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  usePageLoading(isLoggingOut, "Cerrando sesión de forma segura...");

  React.useEffect(() => {
    fetchWorkspaceSubscriptionAction()
      .then((res) => setSubData(res.subscription))
      .catch((err) => console.error("Error loading sidebar subscription:", err));
  }, [pathname]);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Error cerrando sesión:", err);
      setIsLoggingOut(false);
    }
  };

  const isExpired = subData?.isExpired;
  const planCode = subData?.planCode || "free_trial";
  const remainingDays = subData?.remainingDays ?? 7;
  const isEnterprise = planCode === "enterprise";
  const isBusiness = planCode === "business";

  const progressPercent = isExpired
    ? 0
    : planCode === "free_trial"
    ? Math.min(100, Math.max(10, Math.round((remainingDays / 7) * 100)))
    : 100;

  return (
    <>
      <aside className="w-64 border-r border-[#1a1f2c] bg-[#090b10] flex flex-col h-screen sticky top-0 shrink-0">
        {/* Brand Header */}
        <div className="h-16 border-b border-[#1a1f2c] px-6 flex items-center justify-between">
          <Link href="/app" prefetch={false} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#00ff66]" />
            </div>
            <span className="font-mono font-bold text-sm tracking-wider text-white">
              CYCLON <span className="text-[#00ff66]">P2P</span>
            </span>
          </Link>
        </div>

        {/* Trial Status Card */}
        <div className="p-4">
          <div
            className={`p-3 rounded-xl border space-y-2 transition-all ${
              isExpired
                ? "bg-rose-950/20 border-rose-500/40"
                : isEnterprise
                ? "bg-cyan-950/20 border-cyan-500/40"
                : "bg-[#12151e] border-[#1f2637]"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">PLAN ACTIVO</span>
              <span
                className={`font-bold ${
                  isExpired
                    ? "text-rose-400"
                    : isEnterprise
                    ? "text-[#00f0ff]"
                    : "text-[#00ff66]"
                }`}
              >
                {isExpired
                  ? "EXPIRADO"
                  : isEnterprise
                  ? "ENTERPRISE"
                  : isBusiness
                  ? "BUSINESS"
                  : "FREE TRIAL"}
              </span>
            </div>

            <div className="w-full bg-[#1e2333] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExpired
                    ? "bg-rose-500 w-full"
                    : isEnterprise
                    ? "bg-[#00f0ff]"
                    : "bg-[#00ff66]"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>
                {isExpired
                  ? "Prueba finalizada"
                  : planCode === "free_trial"
                  ? `${remainingDays} días restantes`
                  : "Vigente (30d)"}
              </span>
              <Link
                href="/app/plan"
                prefetch={false}
                className={`font-mono hover:underline ${
                  isExpired
                    ? "text-rose-400 font-bold"
                    : isEnterprise
                    ? "text-cyan-400"
                    : "text-[#00ff66]"
                }`}
              >
                {isExpired ? "Activar Plan &rarr;" : "Mejorar &rarr;"}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 font-semibold shadow-[0_0_15px_rgba(0,255,102,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#12151e]",
                  item.highlight && !isActive && "text-[#00ff66]/90 hover:text-[#00ff66]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-[#00ff66]" : "text-slate-400",
                      item.highlight && !isActive && "text-[#00ff66]"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info & Logout */}
        <div className="p-4 border-t border-[#1a1f2c] space-y-3">
          <div className="flex items-center gap-2 px-2 text-xs text-slate-400">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px]">País: Venezuela (VE)</span>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Modal de Confirmación para Cerrar Sesión */}
      <Dialog
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        title="Confirmar Cierre de Sesión"
        description="Verifica si realmente deseas salir de tu espacio de trabajo P2P."
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-slate-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                ¿Estás seguro de que deseas cerrar sesión?
              </p>
              <p className="text-slate-400 leading-relaxed">
                Tu sesión actual se cerrará de forma segura y tendrás que volver a ingresar tus credenciales para acceder al panel.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutModalOpen(false)}
              className="text-xs font-mono"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isLoggingOut}
              disabled={isLoggingOut}
              onClick={handleConfirmLogout}
              className="text-xs font-mono"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sí, Cerrar Sesión
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
