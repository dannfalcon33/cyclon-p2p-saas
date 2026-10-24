"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  timestamp: string;
}

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "LOG-902",
    actor: "platform_owner (Admin)",
    action: "SUSPEND_CLIENT",
    targetType: "user",
    targetId: "USR-004",
    reason: "Sospecha de actividad contraria a términos de servicio.",
    timestamp: "2026-10-21 08:35:10",
  },
  {
    id: "LOG-901",
    actor: "platform_owner (Admin)",
    action: "CREATE_PROMOTION",
    targetType: "promotion",
    targetId: "PRM-CYCLON50",
    reason: "Creación de cupón de portafolio para checkout demo.",
    timestamp: "2026-10-20 14:12:00",
  },
  {
    id: "LOG-900",
    actor: "system_bootstrap",
    action: "BOOTSTRAP_OWNER_ROLE",
    targetType: "user",
    targetId: "USR-000",
    reason: "Aprovisionamiento inicial de cuenta propietaria en entorno confiable.",
    timestamp: "2026-10-15 10:00:00",
  },
];

export default function MasterAuditPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#261f18]">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Bitácora de Auditoría Administrativa
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registro inmutable (append-only) de todas las acciones sensibles del propietario de la plataforma.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-[#120f0b] border border-[#292017] flex items-center gap-3 text-xs text-amber-200">
        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <strong>Garantía de Inmutabilidad:</strong> Los registros de auditoría no pueden ser editados ni eliminados desde la interfaz. Cada suspensión, reactivación o cambio de promoción queda sellado con timestamp UTC y motivo.
        </div>
      </div>

      {/* Logs Table */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-0">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#18130e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#292017]">
              <tr>
                <th className="p-3.5">ID / Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Acción</th>
                <th className="p-3.5">Entidad Afectada</th>
                <th className="p-3.5">Motivo Administrativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#211a13] text-slate-200">
              {INITIAL_AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-[#1a140f] transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white">{log.id}</div>
                    <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  </td>
                  <td className="p-3.5 text-amber-300 font-semibold">{log.actor}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <span className="text-slate-400 uppercase text-[10px] block">
                      {log.targetType}
                    </span>
                    <strong className="text-white">{log.targetId}</strong>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-xs">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
