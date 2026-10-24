import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: DATABASE_URL no está configurada en las variables de entorno.");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Iniciando siembra idempotente de catálogos base para Cyclon P2P...");

  // 1. Países Habilitados en el MVP (7 Países Oficiales)
  const initialCountries = [
    { code: "VE", name: "Venezuela", defaultFiat: "VES", isActive: true },
    { code: "CO", name: "Colombia", defaultFiat: "COP", isActive: true },
    { code: "BR", name: "Brasil", defaultFiat: "BRL", isActive: true },
    { code: "AR", name: "Argentina", defaultFiat: "ARS", isActive: true },
    { code: "EC", name: "Ecuador", defaultFiat: "USD", isActive: true },
    { code: "PE", name: "Perú", defaultFiat: "PEN", isActive: true },
    { code: "CL", name: "Chile", defaultFiat: "CLP", isActive: true },
  ];

  console.log("-> Sembrando países...");
  for (const c of initialCountries) {
    await db
      .insert(schema.countries)
      .values(c)
      .onConflictDoUpdate({
        target: schema.countries.code,
        set: { name: c.name, defaultFiat: c.defaultFiat, isActive: c.isActive },
      });
  }

  // 2. Monedas Fiat Estándar ISO 4217
  const initialFiat = [
    { code: "VES", name: "Bolívar venezolano", symbol: "Bs.", decimals: 2, isActive: true },
    { code: "COP", name: "Peso colombiano", symbol: "$", decimals: 2, isActive: true },
    { code: "BRL", name: "Real brasileño", symbol: "R$", decimals: 2, isActive: true },
    { code: "ARS", name: "Peso argentino", symbol: "$", decimals: 2, isActive: true },
    { code: "USD", name: "Dólar estadounidense", symbol: "$", decimals: 2, isActive: true },
    { code: "PEN", name: "Sol peruano", symbol: "S/", decimals: 2, isActive: true },
    { code: "CLP", name: "Peso chileno", symbol: "$", decimals: 2, isActive: true },
  ];

  console.log("-> Sembrando monedas fiat...");
  for (const f of initialFiat) {
    await db
      .insert(schema.fiatCurrencies)
      .values(f)
      .onConflictDoUpdate({
        target: schema.fiatCurrencies.code,
        set: { name: f.name, symbol: f.symbol, decimals: f.decimals, isActive: f.isActive },
      });
  }

  // 3. Activos Cripto Soportados
  const initialAssets = [
    { symbol: "USDT", name: "Tether USD", decimals: 8, isActive: true },
    { symbol: "USDC", name: "USD Coin", decimals: 8, isActive: true },
    { symbol: "BTC", name: "Bitcoin", decimals: 8, isActive: true },
    { symbol: "ETH", name: "Ethereum", decimals: 8, isActive: true },
    { symbol: "SOL", name: "Solana", decimals: 8, isActive: true },
    { symbol: "BNB", name: "BNB Chain", decimals: 8, isActive: true },
  ];

  console.log("-> Sembrando criptoactivos...");
  for (const a of initialAssets) {
    await db
      .insert(schema.assets)
      .values(a)
      .onConflictDoUpdate({
        target: schema.assets.symbol,
        set: { name: a.name, decimals: a.decimals, isActive: a.isActive },
      });
  }

  // 4. Exchanges P2P Soportados
  const initialExchanges = [
    { code: "binance", name: "Binance P2P", isActive: true },
    { code: "bybit", name: "Bybit P2P", isActive: true },
    { code: "bitget", name: "Bitget P2P", isActive: true },
    { code: "custom", name: "Exchange Personalizado", isActive: true },
  ];

  console.log("-> Sembrando exchanges...");
  for (const e of initialExchanges) {
    await db
      .insert(schema.exchanges)
      .values(e)
      .onConflictDoUpdate({
        target: schema.exchanges.code,
        set: { name: e.name, isActive: e.isActive },
      });
  }

  // 5. Planes Comerciales y de Demostración
  const initialPlans = [
    {
      code: "free_trial",
      name: "Free Trial (7 Días)",
      description: "Prueba de 7 días con acceso a funciones de Business.",
      features: [
        "dashboard_access",
        "p2p_operations_unlimited",
        "country_commissions_7_countries",
        "custom_banks_and_methods",
        "excel_export_basic",
      ],
      trialDays: 7,
      demoPriceUsd: "0.00",
      isActive: true,
    },
    {
      code: "business",
      name: "Business",
      description: "Bitácora completa, reportes Excel multi-hoja y comisiones avanzadas.",
      features: [
        "dashboard_access",
        "p2p_operations_unlimited",
        "country_commissions_7_countries",
        "custom_banks_and_methods",
        "excel_export_multihop_full",
        "priority_support",
      ],
      trialDays: 0,
      demoPriceUsd: "29.00",
      isActive: true,
    },
    {
      code: "enterprise",
      name: "Enterprise",
      description: "Todo Business más cotizaciones en tiempo real BTC/ETH/SOL/BNB y feed de noticias.",
      features: [
        "dashboard_access",
        "p2p_operations_unlimited",
        "country_commissions_7_countries",
        "custom_banks_and_methods",
        "excel_export_multihop_full",
        "enterprise_market_charts",
        "enterprise_crypto_news",
      ],
      trialDays: 0,
      demoPriceUsd: "79.00",
      isActive: true,
    },
  ];

  console.log("-> Sembrando planes comerciales...");
  for (const p of initialPlans) {
    await db
      .insert(schema.plans)
      .values(p)
      .onConflictDoUpdate({
        target: schema.plans.code,
        set: {
          name: p.name,
          description: p.description,
          features: p.features,
          trialDays: p.trialDays,
          demoPriceUsd: p.demoPriceUsd,
          isActive: p.isActive,
        },
      });
  }

  // 6. Promociones de Demostración Iniciales
  const initialPromotions = [
    {
      code: "CYCLON50",
      description: "Descuento del 50% de demostración para checkout de portafolio",
      discountType: "percentage",
      discountValue: "50.00",
      applicablePlans: ["business", "enterprise"],
      maxUses: 100,
      isActive: true,
    },
    {
      code: "PORTAFOLIO",
      description: "Acceso bonificado al 100% para evaluadores técnicos",
      discountType: "percentage",
      discountValue: "100.00",
      applicablePlans: ["business", "enterprise"],
      maxUses: 50,
      isActive: true,
    },
  ];

  console.log("-> Sembrando promociones demo...");
  for (const promo of initialPromotions) {
    await db
      .insert(schema.promotions)
      .values(promo)
      .onConflictDoUpdate({
        target: schema.promotions.code,
        set: {
          description: promo.description,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          applicablePlans: promo.applicablePlans,
          maxUses: promo.maxUses,
          isActive: promo.isActive,
        },
      });
  }

  console.log("✅ Siembra completada exitosamente sin duplicar registros ni credenciales fijas.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error ejecutando seed:", err);
    process.exit(1);
  });
