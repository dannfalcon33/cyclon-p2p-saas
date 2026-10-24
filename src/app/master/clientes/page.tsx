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
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  country: string;
  plan: "free_trial" | "business" | "enterprise";
  status: "active" | "suspended" | "pending_verification";
  registeredAt: string;
  trialEndsAt: string;
  operationsCount: number;
  suspensionReason?: string;
}

const INITIAL_CLIENTS: Client[] = [
  {
    id: "USR-001",
    name: "Carlos Mendoza P2P",
    email: "carlos.p2p@gmail.com",
    country: "VE",
    plan: "business",
    status: "active",
    registeredAt: "2026-09-12",
    trialEndsAt: "2026-09-19",
    operationsCount: 142,
  },
  {
    id: "USR-002",
    name: "Bogota Arbitrage Desk",
    email: "desk@bogotacrypto.co",
    country: "CO",
    plan: "enterprise",
    status: "active",
    registeredAt: "2026-10-01",
    trialEndsAt: "2026-10-08",
    operationsCount: 89,
  },
  {
    id: "USR-003",
    name: "Sampa Trader Brasil",
    email: "lucas.pix@bol.com.br",
    country: "BR",
    plan: "free_trial",
    status: "active",
    registeredAt: "2026-10-18",
    trialEndsAt: "2026-10-25",
    operationsCount: 12,
  },
  {
    id: "USR-004",
    name: "Trader Suspicious Arg",
    email: "anonimo@trader.ar",
    country: "AR",
    plan: "free_trial",
    status: "suspended",
    registeredAt: "2026-10-05",
    trialEndsAt: "2026-10-12",
    operationsCount: 4,
    suspensionReason: "Sospecha de actividad contraria a términos de servicio.",
  },
];

export default function MasterClientsPage() {
  const [clients, setClients] = React.useState<Client[]>(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [planFilter, setPlanFilter] = React.useState("ALL");

  // Selected client for suspension/reactivation
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [actionType, setActionType] = React.useState<"suspend" | "reactivate">("suspend");
  const [adminReason, setAdminReason] = React.useState("");
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesPlan = planFilter === "ALL" || c.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleOpenAction = (client: Client, type: "suspend" | "reactivate") => {
    setSelectedClient(client);
    setActionType(type);
    setAdminReason("");
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    if (actionType === "suspend" && !adminReason.trim()) {
      alert("Es obligatorio registrar un motivo administrativo para suspender la cuenta.");
      return;
    }

    setClients((prev) =>
      prev.map((c) =>
        c.id === selectedClient.id
          ? {
              ...c,
              status: actionType === "suspend" ? "suspended" : "active",
              suspensionReason: actionType === "suspend" ? adminReason : undefined,
            }
          : c
      )
    );

    const message =
      actionType === "suspend"
        ? `Cuenta ${selectedClient.email} suspendida exitosamente. Acceso revocado y datos preservados.`
        : `Cuenta ${selectedClient.email} reactivada exitosamente.`;

    setActionFeedback(message);
    setSelectedClient(null);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#261f18]">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Gestión de Clientes SaaS
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Búsqueda, auditoría de suscripciones y acciones de suspensión lógica con motivo administrativo.
        </p>
      </div>

      {actionFeedback && (
        <Alert variant="success" title="Acción Administrativa Registrada">
          {actionFeedback}
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#120f0b] border border-[#292017] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Buscar por nombre, correo, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="text-xs"
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
          </Select>

          <Select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">Todos los Planes</option>
            <option value="free_trial">Free Trial</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </Select>
        </div>
      </div>

      {/* Clients Table */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-0">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#18130e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#292017]">
              <tr>
                <th className="p-3.5">Cliente / ID</th>
                <th className="p-3.5">País</th>
                <th className="p-3.5">Plan Actual</th>
                <th className="p-3.5">Operaciones</th>
                <th className="p-3.5">Registro</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#211a13] text-slate-200">
              {filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-[#1a140f] transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.email}</div>
                  </td>
                  <td className="p-3.5 font-bold text-amber-300">{c.country}</td>
                  <td className="p-3.5">
                    {c.plan === "free_trial" && (
                      <Badge variant="neutral" className="text-[9px]">Trial (7d)</Badge>
                    )}
                    {c.plan === "business" && (
                      <Badge variant="neon" className="text-[9px]">Business</Badge>
                    )}
                    {c.plan === "enterprise" && (
                      <Badge variant="cyber" className="text-[9px]">Enterprise</Badge>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-slate-300">
                    {c.operationsCount} ops
                  </td>
                  <td className="p-3.5 text-slate-400">{c.registeredAt}</td>
                  <td className="p-3.5">
                    {c.status === "active" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/30">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] border border-red-500/30">
                        Suspendido
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {c.status === "active" ? (
                      <Button
                        variant="danger"
                        size="sm"
                        className="text-[10px] py-1 px-2.5"
                        onClick={() => handleOpenAction(c, "suspend")}
                      >
                        <UserX className="w-3 h-3 mr-1" />
                        Suspender
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px] py-1 px-2.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                        onClick={() => handleOpenAction(c, "reactivate")}
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Reactivar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal: Administrative Action Confirmation */}
      <Dialog
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={
          actionType === "suspend"
            ? `Suspender Cuenta: ${selectedClient?.name}`
            : `Reactivar Cuenta: ${selectedClient?.name}`
        }
        description="Esta acción afectará el acceso del comerciante y quedará registrada en auditoría."
      >
        {selectedClient && (
          <form onSubmit={handleConfirmAction} className="space-y-4">
            <div className="p-3 rounded-lg bg-[#0e0b08] border border-[#2b2118] text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Cliente:</span>
                <span className="text-white font-bold">{selectedClient.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Correo:</span>
                <span className="text-white">{selectedClient.email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Plan:</span>
                <span className="text-amber-300">{selectedClient.plan.toUpperCase()}</span>
              </div>
            </div>

            {actionType === "suspend" ? (
              <div className="space-y-2">
                <Input
                  label="Motivo Administrativo Obligatorio"
                  placeholder="Detalla la razón de la suspensión (ej. actividad irregular, solicitud del titular)"
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  required
                />
                <p className="text-[11px] text-slate-400">
                  ⚠️ La suspensión revoca las sesiones del usuario y bloquea su acceso al área privada. Los datos históricos y operaciones del comerciante se conservan intactos.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Al reactivar la cuenta, el comerciante podrá iniciar sesión nuevamente. Su historial y configuraciones permanecen intactos.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#261f18]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedClient(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant={actionType === "suspend" ? "danger" : "primary"}
              >
                {actionType === "suspend" ? "Confirmar Suspensión" : "Confirmar Reactivación"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
