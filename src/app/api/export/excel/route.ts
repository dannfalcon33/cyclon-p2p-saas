import { NextRequest, NextResponse, connection } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/auth/session";
import { generateOperationsExcel } from "@/lib/services/excel-export-service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    // 1. Autorización estricta por sesión y workspace
    const { workspace } = await getAuthenticatedWorkspace();

    // 2. Extraer parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as any;
    const countryCode = searchParams.get("country") || undefined;
    const fiatCurrency = searchParams.get("currency") || undefined;
    const operationSide = searchParams.get("side") as any;
    const status = searchParams.get("status") as any;
    const assetSymbol = searchParams.get("asset") || undefined;
    const exchangeCode = searchParams.get("exchange") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // 3. Generar el libro de cálculo Excel
    const buffer = await generateOperationsExcel(workspace.id, {
      period: period || "all",
      countryCode,
      fiatCurrency,
      operationSide,
      status,
      assetSymbol,
      exchangeCode,
      startDate,
      endDate,
    });

    const timestamp = new Date().toISOString().substring(0, 10);
    const filename = `cyclon_p2p_reporte_${workspace.name.replace(/\s+/g, "_").toLowerCase()}_${timestamp}.xlsx`;

    // 4. Retornar respuesta de descarga directa
    return new Response(buffer as any, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Error al exportar operaciones a Excel:", error);
    return NextResponse.json(
      {
        error: "No fue posible generar el archivo Excel.",
        message: error.message || "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}
