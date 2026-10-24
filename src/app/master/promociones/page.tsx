"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Plus, PauseCircle, PlayCircle } from "lucide-react";

interface Promo {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicablePlans: string;
  maxUses: number;
  timesUsed: number;
  isActive: boolean;
}

const INITIAL_PROMOS: Promo[] = [
  {
    id: "1",
    code: "CYCLON50",
    description: "Descuento 50% de demostración para evaluación",
    discountType: "percentage",
    discountValue: 50,
    applicablePlans: "Business, Enterprise",
    maxUses: 100,
    timesUsed: 18,
    isActive: true,
  },
  {
    id: "2",
    code: "PORTAFOLIO",
    description: "Acceso demostrativo 100% bonificado",
    discountType: "percentage",
    discountValue: 100,
    applicablePlans: "Business, Enterprise",
    maxUses: 50,
    timesUsed: 32,
    isActive: true,
  },
  {
    id: "3",
    code: "LAUNCH10",
    description: "Descuento fijo de $10 USD",
    discountType: "fixed",
    discountValue: 10,
    applicablePlans: "Business",
    maxUses: 20,
    timesUsed: 20,
    isActive: false,
  },
];

export default function MasterPromotionsPage() {
  const [promos, setPromos] = React.useState<Promo[]>(INITIAL_PROMOS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [newCode, setNewCode] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newDiscountType, setNewDiscountType] = React.useState<"percentage" | "fixed">("percentage");
  const [newDiscountValue, setNewDiscountValue] = React.useState("20");
  const [newMaxUses, setNewMaxUses] = React.useState("50");
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const promo: Promo = {
      id: Date.now().toString(),
      code: newCode.trim().toUpperCase(),
      description: newDescription.trim() || "Promoción de checkout demo",
      discountType: newDiscountType,
      discountValue: parseFloat(newDiscountValue) || 10,
      applicablePlans: "Business, Enterprise",
      maxUses: parseInt(newMaxUses) || 50,
      timesUsed: 0,
      isActive: true,
    };

    setPromos((prev) => [promo, ...prev]);
    setIsModalOpen(false);
    setNewCode("");
    setNewDescription("");
    setFeedback(`Promoción ${promo.code} creada con éxito para el checkout simulado.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const togglePromoStatus = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#261f18]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Promociones y Descuentos Demo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configuración de cupones aplicables en el checkout simulado de portafolio.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-black hover:bg-amber-400"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Promoción
        </Button>
      </div>

      {feedback && (
        <Alert variant="success" title="Promoción Actualizada">
          {feedback}
        </Alert>
      )}

      {/* Promos Table */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-0">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#18130e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#292017]">
              <tr>
                <th className="p-3.5">Código / Descripción</th>
                <th className="p-3.5">Descuento</th>
                <th className="p-3.5">Planes Elegibles</th>
                <th className="p-3.5">Uso / Límite</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#211a13] text-slate-200">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a140f] transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-amber-300 text-sm">{p.code}</div>
                    <div className="text-[10px] text-slate-400">{p.description}</div>
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    {p.discountType === "percentage"
                      ? `${p.discountValue}%`
                      : `$${p.discountValue} USD`}
                  </td>
                  <td className="p-3.5 text-slate-400">{p.applicablePlans}</td>
                  <td className="p-3.5">
                    <span className="text-white font-bold">{p.timesUsed}</span>
                    <span className="text-slate-400"> / {p.maxUses}</span>
                  </td>
                  <td className="p-3.5">
                    {p.isActive ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        Pausado / Expirado
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePromoStatus(p.id)}
                      className="text-slate-300 hover:text-white"
                    >
                      {p.isActive ? (
                        <PauseCircle className="w-4 h-4 text-amber-400 inline" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-emerald-400 inline" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal: Create Promotion */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Promoción (Demo Checkout)"
        description="El cupón se validará en servidor al simular una suscripción."
      >
        <form onSubmit={handleCreatePromo} className="space-y-4">
          <Input
            label="Código del Cupón"
            placeholder="Ej. BIENVENIDO30"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            required
            className="font-mono uppercase text-xs"
          />

          <Input
            label="Descripción Interna"
            placeholder="Ej. Campaña de portafolio para nuevos comerciantes"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="text-xs"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Descuento"
              value={newDiscountType}
              onChange={(e) => setNewDiscountType(e.target.value as "percentage" | "fixed")}
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($ USD)</option>
            </Select>

            <Input
              label="Valor del Descuento"
              type="number"
              value={newDiscountValue}
              onChange={(e) => setNewDiscountValue(e.target.value)}
              required
            />
          </div>

          <Input
            label="Límite Máximo de Usos Globales"
            type="number"
            value={newMaxUses}
            onChange={(e) => setNewMaxUses(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#261f18]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Promoción
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
