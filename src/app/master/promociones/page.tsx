"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Plus, PauseCircle, PlayCircle, Tag, RefreshCw, Layers } from "lucide-react";
import {
  fetchMasterPromotionsAction,
  createMasterPromotionAction,
  toggleMasterPromotionAction,
} from "@/app/actions/master";

export default function MasterPromotionsPage() {
  const [promos, setPromos] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [newCode, setNewCode] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newDiscountType, setNewDiscountType] = React.useState<"percentage" | "fixed">("percentage");
  const [newDiscountValue, setNewDiscountValue] = React.useState("20");
  const [newMaxUses, setNewMaxUses] = React.useState("50");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadPromotions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMasterPromotionsAction();
      setPromos(data);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al cargar promociones.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createMasterPromotionAction({
        code: newCode.trim().toUpperCase(),
        description: newDescription.trim() || `Cupón ${newCode.trim().toUpperCase()}`,
        discountType: newDiscountType,
        discountValue: parseFloat(newDiscountValue) || 10,
        applicablePlans: ["business", "enterprise"],
        maxUses: newMaxUses ? parseInt(newMaxUses) : undefined,
      });

      setFeedback({
        type: "success",
        message: `Cupón '${newCode.trim().toUpperCase()}' creado y habilitado en Neon PostgreSQL.`,
      });

      setIsModalOpen(false);
      setNewCode("");
      setNewDescription("");
      await loadPromotions();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al crear la promoción.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleMasterPromotionAction(id);
      setFeedback({
        type: "success",
        message: `Cupón '${res.code}' ahora se encuentra ${res.isActive ? "activo" : "pausado"}.`,
      });
      await loadPromotions();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al cambiar estado del cupón.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#261f18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-400" />
            Gestión de Promociones y Cupones Demo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configura códigos de descuento para el checkout simulado del portafolio.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadPromotions}
            disabled={isLoading}
            className="text-xs font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refrescar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-mono"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Crear Promoción
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "Operación Exitosa" : "Error"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Promos Table */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              Cargando promociones desde Neon PostgreSQL...
            </div>
          ) : !promos.length ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              No hay cupones configurados. Crea uno con el botón superior.
            </div>
          ) : (
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#18130e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#292017]">
                <tr>
                  <th className="p-3.5">Código / Descripción</th>
                  <th className="p-3.5">Descuento</th>
                  <th className="p-3.5">Planes Elegibles</th>
                  <th className="p-3.5">Usos / Límite</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#211a13] text-slate-200">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-[#1a140f] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        {promo.code}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{promo.description}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[#00ff66] font-bold text-sm">
                        {promo.discountType === "percentage"
                          ? `${parseFloat(promo.discountValue)}% OFF`
                          : `$${parseFloat(promo.discountValue).toFixed(2)} USD OFF`}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {(promo.applicablePlans as string[])?.join(", ") || "Todos"}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white">{promo.timesUsed}</span>
                      <span className="text-slate-500"> / {promo.maxUses ?? "Ilimitado"}</span>
                    </td>
                    <td className="p-3.5">
                      {promo.isActive ? (
                        <Badge variant="neon" className="text-[9px]">Activo</Badge>
                      ) : (
                        <Badge variant="neutral" className="text-[9px] text-slate-400 border-slate-700">
                          Pausado
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs ${
                          promo.isActive
                            ? "text-amber-400 hover:text-amber-300"
                            : "text-[#00ff66] hover:text-[#00e575]"
                        }`}
                        onClick={() => handleToggleStatus(promo.id)}
                      >
                        {promo.isActive ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 mr-1" />
                            Activar
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Promoción para Checkout Demo"
        description="Generación de cupones de demostración con trazabilidad de auditoría"
      >
        <form onSubmit={handleCreatePromo} className="space-y-4">
          <Input
            label="Código del Cupón (Ej. CYCLON50)"
            placeholder="CYBERP2P"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            className="uppercase font-mono text-xs"
            required
          />

          <Input
            label="Descripción del Cupón"
            placeholder="Descuento promocional de portafolio..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="text-xs"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Tipo de Descuento</label>
              <Select
                value={newDiscountType}
                onChange={(e) => setNewDiscountType(e.target.value as any)}
                className="text-xs"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo (USD)</option>
              </Select>
            </div>

            <Input
              label={newDiscountType === "percentage" ? "Valor (%)" : "Valor ($ USD)"}
              type="number"
              value={newDiscountValue}
              onChange={(e) => setNewDiscountValue(e.target.value)}
              className="text-xs font-mono"
              required
            />
          </div>

          <Input
            label="Límite Máximo de Usos (Opcional)"
            type="number"
            value={newMaxUses}
            onChange={(e) => setNewMaxUses(e.target.value)}
            className="text-xs font-mono"
            placeholder="Dejar vacío para ilimitado"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !newCode.trim()}
            >
              {isSubmitting ? "Guardando en Neon..." : "Crear Promoción"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
