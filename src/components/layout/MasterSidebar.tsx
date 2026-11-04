"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Tag,
  ClipboardList,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/components/ui/page-loader";

const MASTER_NAV = [
  {
    name: "Métricas Globales",
    href: "/master",
    icon: LayoutDashboard,
  },
  {
    name: "Clientes SaaS",
    href: "/master/clientes",
    icon: Users,
  },
  {
    name: "Promociones Demo",
    href: "/master/promociones",
    icon: Tag,
  },
  {
    name: "Auditoría Master",
    href: "/master/auditoria",
    icon: ClipboardList,
  },
];

export function MasterSidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  usePageLoading(isLoggingOut, "Cerrando sesión administrativa Master...");

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Error cerrando sesión Master:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="w-64 border-r border-[#261f18] bg-[#0c0906] flex flex-col h-screen sticky top-0 shrink-0">
        {/* Brand Header with Amber Warning Styling */}
        <div className="h-16 border-b border-[#261f18] px-6 flex items-center justify-between">
          <Link href="/master" prefetch={false} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-mono font-bold text-sm tracking-wider text-white">
              MASTER <span className="text-amber-400">PANEL</span>
            </span>
          </Link>
        </div>

        {/* Role Notice */}
        <div className="p-4">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
            Rol: <strong>platform_owner</strong>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Acceso administrativo global</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {MASTER_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#14100c]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-amber-400" : "text-slate-400"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to Merchant App & Logout */}
        <div className="p-4 border-t border-[#261f18] space-y-2">
          <Link
            href="/app"
            prefetch={false}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-[#17120e] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-amber-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Modal de Confirmación para Cerrar Sesión Master */}
      <Dialog
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        title="Confirmar Cierre de Sesión (Master)"
        description="Verifica si realmente deseas salir de la consola administrativa de Cyclon P2P."
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-slate-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                ¿Deseas cerrar tu sesión de propietario (platform_owner)?
              </p>
              <p className="text-slate-400 leading-relaxed">
                Se cerrará el acceso administrativo global en este navegador y serás redirigido a la pantalla de inicio de sesión.
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
