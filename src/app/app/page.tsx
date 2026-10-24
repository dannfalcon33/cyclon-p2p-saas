import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowLeftRight,
  PlusCircle,
  Sliders,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";

export default function MerchantDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2230]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Panel de Operaciones P2P
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resumen en tiempo real de tus compras, ventas y márgenes operativos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/operaciones">
            <Button variant="secondary" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#00ff66]" />
              Exportar Excel
            </Button>
          </Link>
          <Link href="/app/operaciones/nueva">
            <Button variant="primary" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Nueva Operación
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards: Separated by State and Fiat Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Completed */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Operaciones Completadas</span>
            <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">142</div>
            <p className="text-[11px] text-slate-400 mt-1">
              +18 órdenes registradas esta semana
            </p>
          </CardContent>
        </Card>

        {/* Volume Cripto USDT */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Volumen Cripto (USDT)</span>
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-cyan-400">48,250.00 <span className="text-xs text-slate-400">USDT</span></div>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 flex items-center">
                <ArrowDownRight className="w-3 h-3" /> 26,400 Compras
              </span>
              <span>•</span>
              <span className="text-blue-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 21,850 Ventas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Volume Fiat (VES) */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Volumen Fiat (VES)</span>
            <span className="text-xs font-mono font-bold text-amber-400">VE</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">1,864,200.00 <span className="text-xs text-slate-400">VES</span></div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tasa promedio: <strong className="text-slate-200 font-mono">38.65 VES/USDT</strong>
            </p>
          </CardContent>
        </Card>

        {/* Comisiones del Comerciante */}
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Comisiones Generadas</span>
            <Sliders className="w-4 h-4 text-[#00ff66]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#00ff66]">18,642.00 <span className="text-xs text-slate-400">VES</span></div>
            <p className="text-[11px] text-slate-400 mt-1">
              Desglose: 32.50 USD + 18,642 VES
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Fiat Segregation Rule Notice */}
      <div className="p-3.5 rounded-xl bg-[#0e1017] border border-[#1f2637] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
          <span>
            <strong>Aislamiento de Divisas:</strong> Los importes fiat se agrupan estrictamente por moneda (VES, COP, BRL, ARS, USD, PEN, CLP) para evitar balances combinados erróneos.
          </span>
        </div>
        <Link href="/app/configuracion" className="text-[#00ff66] font-mono hover:underline shrink-0 ml-4">
          Ajustar Perfiles &rarr;
        </Link>
      </div>

      {/* Recent Operations Summary Table */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Operaciones Recientes</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Últimas transacciones registradas en tu workspace</p>
          </div>
          <Link href="/app/operaciones">
            <Button variant="ghost" size="sm" className="text-xs font-mono text-[#00ff66]">
              Ver todas &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-[#141722] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1f2637]">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Exchange</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Activo</th>
                  <th className="p-3">Importe Fiat</th>
                  <th className="p-3">Tasa Unitaria</th>
                  <th className="p-3">Comisión</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#191f2c] text-slate-200">
                <tr className="hover:bg-[#141824] transition-colors">
                  <td className="p-3 text-slate-400">Hoy, 10:24 AM</td>
                  <td className="p-3 font-semibold text-white">Binance P2P</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      COMPRA
                    </span>
                  </td>
                  <td className="p-3 text-[#00ff66]">500.00 USDT</td>
                  <td className="p-3 font-bold text-white">19,325.00 VES</td>
                  <td className="p-3 text-slate-300">38.65 VES</td>
                  <td className="p-3 text-slate-400">193.25 VES</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] text-[10px]">
                      Completada
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#141824] transition-colors">
                  <td className="p-3 text-slate-400">Ayer, 04:15 PM</td>
                  <td className="p-3 font-semibold text-white">Bybit P2P</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      VENTA
                    </span>
                  </td>
                  <td className="p-3 text-cyan-400">1,200.00 USDT</td>
                  <td className="p-3 font-bold text-white">4,860,000 COP</td>
                  <td className="p-3 text-slate-300">4,050 COP</td>
                  <td className="p-3 text-slate-400">24,300 COP</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] text-[10px]">
                      Completada
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#141824] transition-colors">
                  <td className="p-3 text-slate-400">20 Oct, 02:00 PM</td>
                  <td className="p-3 font-semibold text-white">Bitget P2P</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      COMPRA
                    </span>
                  </td>
                  <td className="p-3 text-[#00ff66]">0.025 BTC</td>
                  <td className="p-3 font-bold text-white">1,680.00 USD</td>
                  <td className="p-3 text-slate-300">67,200 USD</td>
                  <td className="p-3 text-slate-400">8.40 USD</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] text-[10px]">
                      Completada
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
