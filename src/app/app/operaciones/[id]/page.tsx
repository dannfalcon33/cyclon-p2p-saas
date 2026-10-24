"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  ArrowLeft,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  Landmark,
  CreditCard,
  Calculator,
  ShieldCheck,
  FileText,
  User,
  Hash,
  Globe2,
} from "lucide-react";
import { fetchOperationDetailAction, cancelOperationAction } from "@/app/actions/operations";

export default function OperationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [operation, setOperation] = React.useState<any | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadDetail = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOperationDetailAction(operationId);
      setOperation(data);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Error al cargar la operación." });
    } finally {
      setIsLoading(false);
    }
  }, [operationId]);

  React.useEffect(() => {
    if (operationId) {
      loadDetail();
    }
  }, [operationId, loadDetail]);

  const handleCancelOperation = async () => {
    setIsCancelling(true);
    try {
      await cancelOperationAction(operationId, cancelReason);
      setFeedback({ type: "success", message: "Operación cancelada exitosamente." });
      setIsCancelDialogOpen(false);
      await loadDetail();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Error al cancelar." });
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs font-mono text-slate-500 bg-[#10131a] rounded-xl border border-[#1e2433] max-w-4xl mx-auto">
        Cargando detalles de la operación desde Neon PostgreSQL...
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Alert variant="error" title="No encontrada">
          La operación solicitada no existe o no pertenece a tu espacio de trabajo.
        </Alert>
        <Link href="/app/operaciones">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Listado
          </Button>
        </Link>
      </div>
    );
  }

  const isBuy = operation.operationSide === "buy";
  const bankName = operation.bank?.name || operation.bankNameSnapshot || "N/A";
  const methodName = operation.paymentMethod?.name || operation.paymentMethodNameSnapshot || "N/A";
  const ruleSnapshot = operation.commissionRuleSnapshot as any;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2230]">
        <div className="flex items-center gap-3">
          <Link href="/app/operaciones">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                Operación #{operation.id.slice(0, 8)}
              </h1>
              {operation.status === "completed" && (
                <Badge variant="success" className="text-[10px]">
                  Completada
                </Badge>
              )}
              {operation.status === "pending" && (
                <Badge variant="warning" className="text-[10px]">
                  Pendiente
                </Badge>
              )}
              {operation.status === "cancelled" && (
                <Badge variant="error" className="text-[10px]">
                  Cancelada
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Registrada el {formatDate(operation.occurredAt)}
            </p>
          </div>
        </div>

        {operation.status !== "cancelled" && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setCancelReason("");
              setIsCancelDialogOpen(true);
            }}
            className="text-xs"
          >
            <Ban className="w-3.5 h-3.5 mr-1.5" />
            Cancelar Operación
          </Button>
        )}
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "Acción Completada" : "Error"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Grid of Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Core Financial Values */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="pb-3 border-b border-[#181d28]">
            <CardTitle className="text-sm flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#00ff66]" />
                Montos y Tasa Unitaria
              </span>
              <Badge variant={isBuy ? "success" : "info"} className="text-[9px]">
                {isBuy ? "COMPRA" : "VENTA"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Activo Cripto:</span>
              <span className="text-white font-bold">
                {parseFloat(operation.assetAmount).toFixed(8)} {operation.assetSymbol}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Importe Fiat:</span>
              <span className="text-white font-bold">
                {parseFloat(operation.fiatAmount).toFixed(2)} {operation.fiatCurrency}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Tasa Unitaria Calculada:</span>
              <span className="text-[#00ff66] font-bold">
                {parseFloat(operation.unitRate).toFixed(4)} {operation.fiatCurrency}/{operation.assetSymbol}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Exchange P2P:</span>
              <span className="text-white capitalize font-semibold">{operation.exchangeCode}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">País de Operación:</span>
              <span className="text-white font-semibold flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-[#00ff66]" />
                {operation.countryCode}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Commission Breakdown and Snapshot */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="pb-3 border-b border-[#181d28]">
            <CardTitle className="text-sm flex items-center gap-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-[#00ff66]" />
              Desglose de Cargos e Instantánea
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Comisión Comerciante:</span>
              <span className="text-emerald-400 font-bold">
                {parseFloat(operation.merchantFee).toFixed(2)} {operation.fiatCurrency}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Tarifa del Exchange:</span>
              <span className="text-slate-200">
                {parseFloat(operation.exchangeFee).toFixed(2)} {operation.fiatCurrency}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Cargo Método de Pago:</span>
              <span className="text-slate-200">
                {parseFloat(operation.paymentCharge).toFixed(2)} {operation.fiatCurrency}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#1e2433] space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                Instantánea Inmutable de Regla de Comisión
              </div>
              {ruleSnapshot?.ruleId ? (
                <div className="text-[11px] text-slate-300">
                  Regla aplicada:{" "}
                  <strong className="text-emerald-400">
                    {(parseFloat(ruleSnapshot.percentage) * 100).toFixed(2)}%
                  </strong>{" "}
                  + {ruleSnapshot.fixedFee} {operation.fiatCurrency} ({ruleSnapshot.operationSide})
                </div>
              ) : (
                <div className="text-[11px] text-amber-400">
                  Sobrescritura manual libre al momento del registro.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Banking & Counterparty */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="pb-3 border-b border-[#181d28]">
            <CardTitle className="text-sm flex items-center gap-2 font-mono">
              <CreditCard className="w-4 h-4 text-[#00ff66]" />
              Método de Pago y Contraparte
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Método de Pago:</span>
              <span className="text-white font-semibold">{methodName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Banco / Entidad:</span>
              <span className="text-white font-semibold">{bankName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Referencia Externa:</span>
              <span className="text-slate-200">{operation.externalReference || "No especificada"}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Alias de Contraparte:</span>
              <span className="text-slate-200">{operation.counterpartyAlias || "Anónimo"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Audit & Notes */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="pb-3 border-b border-[#181d28]">
            <CardTitle className="text-sm flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4 text-[#00ff66]" />
              Auditoría y Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">ID Único (UUID):</span>
              <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">
                {operation.id}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Creado en Neon DB:</span>
              <span className="text-slate-300">{formatDate(operation.createdAt)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#181d28]">
              <span className="text-slate-400">Última Actualización:</span>
              <span className="text-slate-300">{formatDate(operation.updatedAt)}</span>
            </div>

            <div className="pt-1">
              <span className="text-slate-400 block mb-1">Notas de la Operación:</span>
              <p className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#1e2433] text-slate-300 text-[11px]">
                {operation.notes || "Sin observaciones adicionales."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Dialog */}
      <Dialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        title="Cancelar Operación P2P"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-slate-300">
            ¿Confirmas la cancelación de la operación{" "}
            <strong className="text-white">#{operation.id.slice(0, 8)}</strong>?
          </p>

          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
            ⚠️ La operación no se eliminará físicamente para preservar los registros de auditoría y tus reportes de Excel.
          </div>

          <Input
            label="Motivo de la Cancelación"
            placeholder="Ej. Contraparte canceló en el exchange / no se verificó el pago"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCancelDialogOpen(false)}>
              Volver
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancelOperation}
            >
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
