"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Tag,
  ClipboardList,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="w-64 border-r border-[#261f18] bg-[#0c0906] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header with Amber Warning Styling */}
      <div className="h-16 border-b border-[#261f18] px-6 flex items-center justify-between">
        <Link href="/master" className="flex items-center gap-2.5">
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

      {/* Return to Merchant App */}
      <div className="p-4 border-t border-[#261f18]">
        <Link
          href="/app"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-[#17120e] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}
