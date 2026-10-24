"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, RefreshCw, ShieldCheck, FileText } from "lucide-react";
import { fetchMasterAuditLogsAction } from "@/app/actions/master";

export default function MasterAuditPage() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadAuditLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMasterAuditLogsAction();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar la bitácora de auditoría.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#261f18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" />
            Bitácora de Auditoría Administrativa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro inmutable (append-only) de todas las acciones sensibles realizadas por el propietario de la plataforma.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadAuditLogs}
          disabled={isLoading}
          className="text-xs font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refrescar Bitácora
        </Button>
      </div>

      <div className="p-3.5 rounded-xl bg-[#120f0b] border border-[#292017] flex items-center gap-3 text-xs text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <strong>Garantía de Inmutabilidad Criptográfica:</strong> Los registros de auditoría no pueden ser alterados ni eliminados desde la aplicación. Cada suspensión, reactivación o cambio de cupón queda sellado con timestamp UTC, actor responsable y motivo administrativo.
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              Consultando bitácora de auditoría desde Neon PostgreSQL...
            </div>
          ) : !logs.length ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              No hay registros de auditoría aún. Las acciones de suspensión, reactivación y cupones se registrarán aquí.
            </div>
          ) : (
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#18130e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#292017]">
                <tr>
                  <th className="p-3.5">ID / Timestamp UTC</th>
                  <th className="p-3.5">Actor Responsable</th>
                  <th className="p-3.5">Acción</th>
                  <th className="p-3.5">Entidad Afectada</th>
                  <th className="p-3.5">Motivo Administrativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#211a13] text-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1a140f] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-[11px] truncate max-w-[120px]">
                        {log.id}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toISOString().replace("T", " ").substring(0, 19)}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-amber-300 font-semibold block">{log.actorName}</span>
                      <span className="text-[10px] text-slate-500">{log.actorEmail}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.action.includes("SUSPEND")
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : log.action.includes("REACTIVATE")
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-400 uppercase text-[10px] block">
                        {log.targetType}
                      </span>
                      <span className="text-white font-bold text-[11px] truncate max-w-[180px] block">
                        {log.targetId}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <div className="text-slate-300 leading-snug">{log.reason}</div>
                      {log.diffPayload && (
                        <details className="mt-1">
                          <summary className="text-[10px] text-amber-400 cursor-pointer hover:underline">
                            Ver detalles (diff)
                          </summary>
                          <pre className="text-[9px] bg-[#090705] p-2 rounded border border-[#231b14] mt-1 text-slate-400 overflow-x-auto">
                            {JSON.stringify(log.diffPayload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
