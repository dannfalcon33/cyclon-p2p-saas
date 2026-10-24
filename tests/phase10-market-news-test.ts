import {
  getLiveCryptoTickers,
  getLiveCryptoKlines,
  getLiveCryptoNews,
  getLatamP2POverview,
} from "../src/lib/services/crypto-market-service";

async function runPhase10Tests() {
  console.log("=== INICIANDO TEST: FASE 10 - SERVICIO DE MERCADO CRIPTO Y NOTICIAS ENTERPRISE ===\n");

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

  // 1. Tickers en tiempo real de Binance Spot
  console.log("1. Probando cotizaciones en tiempo real (BTC, ETH, SOL, BNB)...");
  const tickers = await getLiveCryptoTickers();
  assert(tickers.length === 4, `Retorna 4 activos (obtenidos: ${tickers.length})`);

  const btc = tickers.find((t) => t.symbol === "BTC");
  assert(!!btc, "Contiene ticker BTC");
  assert(btc!.priceUsd > 10000, `Precio de BTC coherente (>10,000, obtenido: $${btc?.priceUsd})`);
  assert(typeof btc!.change24h === "number", `change24h es numérico (${btc?.change24h}%)`);
  assert(btc!.formattedPrice.startsWith("$"), `formattedPrice tiene formato USD (${btc?.formattedPrice})`);

  const eth = tickers.find((t) => t.symbol === "ETH");
  assert(eth!.priceUsd > 1000, `Precio de ETH coherente (>1,000, obtenido: $${eth?.priceUsd})`);

  // 2. Klines para Gráfico Técnico
  console.log("\n2. Probando Klines de Binance para gráfico técnico...");
  const chart1D = await getLiveCryptoKlines("BTC", "1D");
  assert(chart1D.symbol === "BTC", "Símbolo de gráfico es BTC");
  assert(chart1D.points.length >= 10, `Puntos de gráfico 1D suficientes (obtenidos: ${chart1D.points.length})`);
  assert(chart1D.minPrice > 0, `Precio mínimo > 0 (${chart1D.minPrice})`);
  assert(chart1D.maxPrice >= chart1D.minPrice, `maxPrice (${chart1D.maxPrice}) >= minPrice (${chart1D.minPrice})`);

  const chart7D = await getLiveCryptoKlines("ETH", "7D");
  assert(chart7D.points.length >= 10, `Puntos de gráfico 7D suficientes (obtenidos: ${chart7D.points.length})`);

  // 3. Feed de Noticias Cripto (CriptoNoticias RSS)
  console.log("\n3. Probando feed de noticias en español (CriptoNoticias RSS)...");
  const news = await getLiveCryptoNews();
  assert(news.length > 0, `Obtiene noticias (obtenidas: ${news.length})`);
  assert(news[0].title.length > 10, `Titular válido: "${news[0].title.slice(0, 40)}..."`);
  assert(news[0].link.startsWith("http"), `Enlace web válido: ${news[0].link}`);
  assert(news[0].source === "CriptoNoticias", `Fuente identificada: ${news[0].source}`);

  // 4. Arbitraje P2P LATAM
  console.log("\n4. Probando monitor de arbitraje P2P LATAM...");
  const p2pLatam = await getLatamP2POverview();
  assert(p2pLatam.length === 6, `Cubre 6 países LATAM (obtenidos: ${p2pLatam.length})`);
  const ves = p2pLatam.find((p) => p.fiat === "VES");
  assert(!!ves && ves.buyAvg > 0, `VES tiene cotización P2P activa (${ves?.buyAvg} VES)`);

  console.log(`\n========================================`);
  console.log(`RESULTADO FINAL: ${passed}/${total} pruebas superadas.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase10Tests().catch((err) => {
  console.error("Error fatal en test Fase 10:", err);
  process.exit(1);
});
