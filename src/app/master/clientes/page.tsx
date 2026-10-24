"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import {
  Search,
  UserCheck,
  UserX,
  ShieldAlert,
  Calendar,
  Globe2,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  fetchMasterClientsAction,
  suspendMerchantAction,
  reactivateMerchantAction,
} from "@/app/actions/master";

export default function MasterClientsPage() {
  const [clients, setClients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [planFilter, setPlanFilter] = React.useState("ALL");

  // Selected client for suspension/reactivation
  const [selectedClient, setSelectedClient] = React.useState<any>(null);
  const [actionType, setActionType] = React.useState<"suspend" | "reactivate">("suspend");
  const [adminReason, setAdminReason] = React.useState("");
  const [isSubmittingAction, setIsSubmittingAction] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadClients = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMasterClientsAction({
        search: searchTerm,
        status: statusFilter,
        plan: planFilter,
      });
      setClients(data);
    } catch (err: any) {
      setActionFeedback({
        type: "error",
        message: err.message || "Error al cargar la lista de comerciantes.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, planFilter]);

  React.useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleOpenActionModal = (client: any, type: "suspend" | "reactivate") => {
    setSelectedClient(client);
    setActionType(type);
    setAdminReason("");
    setActionFeedback(null);
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !adminReason.trim()) return;

    setIsSubmittingAction(true);
    setActionFeedback(null);

    try {
      if (actionType === "suspend") {
        const res = await suspendMerchantAction({
          userId: selectedClient.id,
          reason: adminReason.trim(),
        });
        setActionFeedback({ type: "success", message: res.message });
      } else {
        const res = await reactivateMerchantAction({
          userId: selectedClient.id,
          reason: adminReason.trim(),
        });
        setActionFeedback({ type: "success", message: res.message });
      }

      setSelectedClient(null);
      await loadClients();
    } catch (err: any) {
      setActionFeedback({
        type: "error",
        message: err.message || "Error al procesar la acción administrativa.",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#261f18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Directorio de Comerciantes Registrados
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisa cuentas de clientes, audita actividad P2P y ejecuta suspensiones o reactivaciones con trazabilidad obligatoria.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadClients}
          disabled={isLoading}
          className="text-xs font-mono shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refrescar Lista
        </Button>
      </div>

      {actionFeedback && (
        <Alert
          variant={actionFeedback.type === "success" ? "success" : "error"}
          title={actionFeedback.type === "success" ? "Acción Completada" : "Error"}
        >
          {actionFeedback.message}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <Input
              placeholder="Buscar por nombre, correo electrónico o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs bg-[#19140f] border-[#292017]"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 text-xs bg-[#19140f] border-[#292017]"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
              <option value="pending_verification">Pendientes</option>
            </Select>

            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-36 text-xs bg-[#19140f] border-[#292017]"
            >
              <option value="ALL">Todos los Planes</option>
              <option value="free_trial">Free Trial</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              Consultando comerciantes desde la base de datos de Neon...
            </div>
          ) : !clients.length ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              No se encontraron comerciantes que coincidan con los filtros activos.
            </div>
          ) : (
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#18130e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#292017]">
                <tr>
                  <th className="p-3.5">Comerciante / ID</th>
                  <th className="p-3.5">País / Workspace</th>
                  <th className="p-3.5">Plan Activo</th>
                  <th className="p-3.5">Operaciones</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Acción Administrativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#211a13] text-slate-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#1a140f] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{client.name}</div>
                      <div className="text-[11px] text-slate-400">{client.email}</div>
                      <div className="text-[9px] text-slate-600 truncate max-w-xs">{client.id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span className="w-5 h-5 rounded bg-[#1e1711] flex items-center justify-center text-[10px] border border-[#2b2118]">
                          {client.country}
                        </span>
                        <span className="truncate max-w-[150px]">{client.workspaceName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Registrado: {new Date(client.registeredAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.planCode === "enterprise"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                          : client.planCode === "business"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {client.planName}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white">{client.operationsCount}</span>
                      <span className="text-[10px] text-slate-500 block">registros P2P</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        client.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : client.status === "suspended"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {client.status.toUpperCase()}
                      </span>
                      {client.statusReason && (
                        <span className="text-[9px] text-rose-300 block mt-1 truncate max-w-xs" title={client.statusReason}>
                          Motivo: {client.statusReason}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {client.status === "suspended" ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[11px] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => handleOpenActionModal(client, "reactivate")}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Reactivar
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[11px] border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => handleOpenActionModal(client, "suspend")}
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" />
                          Suspender
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Suspension / Reactivation Modal */}
      <Dialog
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={
          actionType === "suspend"
            ? `Suspender Acceso: ${selectedClient?.name}`
            : `Reactivar Acceso: ${selectedClient?.name}`
        }
        description="Gestión del estado de cuenta de comerciante"
      >
        <form onSubmit={handleConfirmAction} className="space-y-4">
          <div
            className={`p-3 rounded-lg border text-xs ${
              actionType === "suspend"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
            }`}
          >
            {actionType === "suspend" ? (
              <div className="space-y-1">
                <strong>ATENCIÓN — SUSPENSIÓN ADMINISTRATIVA:</strong>
                <p className="text-[11px] opacity-90">
                  Al suspender la cuenta, el usuario perderá acceso inmediato a la aplicación privada (/app). Esta acción quedará sellada permanentemente en la bitácora de auditoría inmutable.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <strong>REACTIVACIÓN DE CUENTA:</strong>
                <p className="text-[11px] opacity-90">
                  El comerciante recuperará el acceso regular a su espacio de trabajo y operaciones.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-[#0c0e14] border border-[#1e2433] text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Comerciante:</span>
              <span className="text-white font-bold">{selectedClient?.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Correo electrónico:</span>
              <span className="text-white">{selectedClient?.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Workspace:</span>
              <span className="text-white">{selectedClient?.workspaceName}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 block font-semibold">
              Motivo Administrativo Obligatorio (Auditable):
            </label>
            <textarea
              required
              rows={3}
              value={adminReason}
              onChange={(e) => setAdminReason(e.target.value)}
              placeholder={
                actionType === "suspend"
                  ? "Indica la razón obligatoria de suspensión (ej. Incumplimiento de términos, reporte de fraude, verificación pendiente)..."
                  : "Indica el motivo de la reactivación (ej. Documentación aclarada, verificación completada exitosamente)..."
              }
              className="w-full text-xs font-mono bg-[#14100c] border border-[#2b2118] rounded-lg p-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
            <p className="text-[10px] text-slate-500">
              Mínimo 5 caracteres. Este texto será guardado en <code>platform_admin_audit_logs</code>.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedClient(null)}
              disabled={isSubmittingAction}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={actionType === "suspend" ? "danger" : "primary"}
              size="sm"
              disabled={isSubmittingAction || adminReason.trim().length < 5}
              className={actionType === "suspend" ? "bg-rose-600 hover:bg-rose-500 text-white" : ""}
            >
              {isSubmittingAction
                ? "Guardando..."
                : actionType === "suspend"
                ? "Confirmar Suspensión"
                : "Confirmar Reactivación"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
