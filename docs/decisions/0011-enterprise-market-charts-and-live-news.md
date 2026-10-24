# ADR-0011: Módulo Enterprise de Mercado Cripto y Noticias en Tiempo Real

## Estado
Aceptado e Implementado (Fase 10)

## Contexto
El plan Enterprise de Cyclon P2P ofrece como propuesta de valor exclusiva un panel analítico en tiempo real para comerciantes de arbitraje P2P. La implementación requería:
1. Cotizaciones en vivo para los 4 activos principales del ecosistema (`BTC`, `ETH`, `SOL`, `BNB`), con variación 24h, máximos, mínimos y precios exactos en USD.
2. Gráfico técnico interactivo con series históricas reales de velas (Klines) para rangos de 1D, 7D y 1M.
3. Monitor en vivo de arbitraje P2P en Latinoamérica (`VES`, `COP`, `ARS`, `BRL`, `PEN`, `CLP`), calculando promedios de compra, venta y spread porcentual.
4. Feed curado de noticias cripto de última hora en español.
5. Requisito fundamental: **Cero costos de suscripción externa / APIs 100% gratuitas sin necesidad de API Keys ni vencimientos de cuotas**.

## Decisión
1. **APIs Públicas de Mercado (0-Key)**:
   - **Binance Public Spot API v3**: Se consume `https://api.binance.com/api/v3/ticker/24hr` para las métricas de 24h de BTCUSDT, ETHUSDT, SOLUSDT y BNBUSDT.
   - **Binance Klines API**: Se consume `https://api.binance.com/api/v3/klines` con intervalos `1h` (1D), `4h` (7D) y `1d` (1M) para alimentar la curva SVG dinámica.
   - **Binance P2P BAPI**: Se consume `https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search` para monitorear en vivo las tasas promedio de compra, venta y spread en los mercados P2P de Venezuela, Colombia, Argentina, Brasil, Perú y Chile.
   - **CriptoNoticias RSS**: Se parsea directamente el feed oficial XML en español (`https://www.criptonoticias.com/feed/`) para ofrecer noticias de actualidad con enlaces externos seguros.
2. **Caché en Memoria y Resiliencia**:
   - Tickers Spot: TTL de 25 segundos.
   - Gráficos Klines: TTL de 60 segundos por símbolo y rango.
   - Noticias RSS: TTL de 5 minutos.
   - Tasas P2P LATAM: TTL de 60 segundos.
   - En caso de desconexión o fallo de red, el sistema responde con snapshots defensivos previos sin interrumpir la experiencia del usuario.
3. **Verificación de Capacidades en Servidor**:
   - Todas las Server Actions (`fetchLiveMarketTickersAction`, `fetchLiveMarketChartAction`, `fetchLiveMarketNewsAction`, `fetchLatamP2POverviewAction`) validan en Neon PostgreSQL que el espacio de trabajo del usuario posea la capacidad `enterprise_market_charts` o el plan `enterprise`. De lo contrario, rechazan la petición.

## Consecuencias
- Cero costos operativos por proveedores de datos de mercado.
- Los comerciantes Enterprise cuentan con cotizaciones reales, gráficos técnicos dinámicos y titulares de noticias actualizados al minuto.
- Resiliencia y latencia óptima (<10ms para peticiones con caché).
