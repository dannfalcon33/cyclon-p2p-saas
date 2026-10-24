"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";

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

  return (
    <aside className="w-64 border-r border-[#1a1f2c] bg-[#090b10] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-[#1a1f2c] px-6 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2.5">
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
        <div className="p-3 rounded-xl bg-[#12151e] border border-[#1f2637] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">PLAN ACTIVO</span>
            <span className="text-[#00ff66] font-bold">FREE TRIAL</span>
          </div>
          <div className="w-full bg-[#1e2333] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00ff66] h-full rounded-full w-[70%]" />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>5 días restantes</span>
            <Link href="/app/plan" className="text-[#00ff66] hover:underline font-mono">
              Mejorar &rarr;
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
          onClick={async () => {
            await signOut();
            window.location.href = "/login";
          }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
