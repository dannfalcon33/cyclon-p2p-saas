import {
  getMultiExchangeP2PComparison,
  getMultiExchangeSpotComparison,
} from "../src/lib/services/multi-exchange-service";
import {
  fetchMultiExchangeP2PAction,
  fetchMultiExchangeSpotAction,
} from "../src/app/actions/multi-exchange";

async function runMultiExchangeTests() {
  console.log("=== INICIANDO TEST: COMPARATIVA MULTI-EXCHANGE (BINANCE, BYBIT, KRAKEN, BITGET) ===\n");

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

  // 1. Comparativa P2P Multi-Exchange (Binance vs Bybit) para VES
  console.log("1. Probando comparativa P2P para VES (Binance vs Bybit)...");
  const p2pVES = await getMultiExchangeP2PComparison("VES");
  assert(p2pVES.fiat === "VES", "Divisa evaluada es VES");
  assert(p2pVES.exchanges.length === 2, `Incluye 2 exchanges P2P (obtenidos: ${p2pVES.exchanges.length})`);

  const binanceP2P = p2pVES.exchanges.find((e) => e.exchange === "binance");
  assert(!!binanceP2P && binanceP2P.buyAvg > 0, `Binance P2P buyAvg activo (${binanceP2P?.buyAvg})`);

  const bybitP2P = p2pVES.exchanges.find((e) => e.exchange === "bybit");
  assert(!!bybitP2P && bybitP2P.buyAvg > 0, `Bybit P2P buyAvg activo (${bybitP2P?.buyAvg})`);

  assert(p2pVES.bestBuy.price > 0, `Mejor tasa de compra identificada: ${p2pVES.bestBuy.exchangeName} a ${p2pVES.bestBuy.price}`);
  assert(p2pVES.bestSell.price > 0, `Mejor tasa de venta identificada: ${p2pVES.bestSell.exchangeName} a ${p2pVES.bestSell.price}`);

  // 2. Comparativa Spot Multi-Exchange (Binance, Bybit, Kraken, Bitget) para BTC
  console.log("\n2. Probando matriz Spot para BTC entre los 4 exchanges seleccionados...");
  const spotBTC = await getMultiExchangeSpotComparison("BTC");
  assert(spotBTC.symbol === "BTC", "Activo evaluado es BTC");
  assert(spotBTC.exchanges.length === 4, `Incluye 4 exchanges (obtenidos: ${spotBTC.exchanges.length})`);

  const activeSpot = spotBTC.exchanges.filter((e) => e.isAvailable && e.buyPrice > 0);
  assert(activeSpot.length === 4, `Los 4 exchanges respondieron cotización activa (${activeSpot.length}/4)`);

  for (const ex of activeSpot) {
    console.log(`     * ${ex.exchangeName}: Compra (Ask) $${ex.buyPrice.toLocaleString()} | Venta (Bid) $${ex.sellPrice.toLocaleString()} | Spread: ${ex.spreadPercent}%`);
    assert(ex.buyPrice > 50000, `${ex.exchangeName} precio coherente (> $50,000)`);
  }

  assert(spotBTC.lowestAsk.price > 0, `Ask más bajo identificado: ${spotBTC.lowestAsk.exchangeName} ($${spotBTC.lowestAsk.price})`);
  assert(spotBTC.highestBid.price > 0, `Bid más alto identificado: ${spotBTC.highestBid.exchangeName} ($${spotBTC.highestBid.price})`);

  // 3. Matriz Spot para ETH
  console.log("\n3. Probando matriz Spot para ETH...");
  const spotETH = await getMultiExchangeSpotComparison("ETH");
  const ethActive = spotETH.exchanges.filter((e) => e.isAvailable && e.buyPrice > 0);
  assert(ethActive.length === 4, `Cotizaciones activas de ETH en 4/4 exchanges`);

  console.log(`\n========================================`);
  console.log(`RESULTADO FINAL: ${passed}/${total} pruebas superadas.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runMultiExchangeTests().catch((err) => {
  console.error("Error fatal en test Multi-Exchange:", err);
  process.exit(1);
});
