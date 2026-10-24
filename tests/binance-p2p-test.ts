import { getBinanceUSDTMarketRates } from "../src/lib/services/binance-p2p-service";
import { fetchBinanceUSDTMarketRatesAction } from "../src/app/actions/market-rates";

async function runBinanceP2PTests() {
  console.log("=== INICIANDO TEST: SERVICIO DE TASAS BINANCE P2P (API GRATUITA) ===\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`  [OK] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  // Test 1: VES (Bolívares) P2P
  console.log("1. Probando consulta en vivo para VES (Bolívares)...");
  const vesRates = await getBinanceUSDTMarketRates("VES");
  assert(vesRates.asset === "USDT", "Activo es USDT");
  assert(vesRates.fiat === "VES", "Divisa fiat es VES");
  assert(vesRates.buyAvg > 0, `buyAvg > 0 (obtenido: ${vesRates.buyAvg})`);
  assert(vesRates.sellAvg > 0, `sellAvg > 0 (obtenido: ${vesRates.sellAvg})`);
  assert(vesRates.spreadPercent >= 0, `spreadPercent >= 0 (obtenido: ${vesRates.spreadPercent}%)`);
  assert(
    vesRates.source === "binance_p2p" || vesRates.source === "fallback",
    `Fuente válida: ${vesRates.source}`
  );

  // Test 2: Caché en memoria
  console.log("\n2. Probando caché en memoria (TTL 60s)...");
  const startCached = Date.now();
  const cachedRates = await getBinanceUSDTMarketRates("VES");
  const cachedDuration = Date.now() - startCached;
  assert(cachedRates.updatedAt === vesRates.updatedAt, "Timestamp idéntico al anterior (hit de caché)");
  assert(cachedDuration < 50, `Respuesta desde caché en <50ms (${cachedDuration}ms)`);

  // Test 3: COP (Pesos Colombianos)
  console.log("\n3. Probando consulta en vivo para COP (Colombia)...");
  const copRates = await getBinanceUSDTMarketRates("COP");
  assert(copRates.fiat === "COP", "Divisa fiat es COP");
  assert(copRates.buyAvg > 1000, `buyAvg coherente para COP (>1000, obtenido: ${copRates.buyAvg})`);

  // Test 4: BRL (Reales Brasileños con Binance Spot fallback)
  console.log("\n4. Probando BRL (Brasil - Binance Spot fallback)...");
  const brlRates = await getBinanceUSDTMarketRates("BRL");
  assert(brlRates.fiat === "BRL", "Divisa fiat es BRL");
  assert(brlRates.buyAvg > 3 && brlRates.buyAvg < 10, `buyAvg coherente para BRL (~5.0, obtenido: ${brlRates.buyAvg})`);

  // Test 5: Server Action
  console.log("\n5. Probando Server Action fetchBinanceUSDTMarketRatesAction...");
  const actionRes = await fetchBinanceUSDTMarketRatesAction("ARS");
  assert(actionRes.fiat === "ARS", "Action resuelve ARS correctamente");
  assert(actionRes.buyAvg > 0, `Action buyAvg > 0 (obtenido: ${actionRes.buyAvg})`);

  console.log(`\n========================================`);
  console.log(`RESULTADO FINAL: ${passed}/${total} pruebas superadas.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runBinanceP2PTests().catch((err) => {
  console.error("Error fatal en suite de pruebas Binance P2P:", err);
  process.exit(1);
});
