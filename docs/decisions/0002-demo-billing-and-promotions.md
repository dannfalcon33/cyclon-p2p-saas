# ADR 0002: Modelo de Cobro Simulado (Demo Billing) y Promociones

**Fecha:** 2026-10-21  
**Estado:** Aceptado  
**Contexto:**
Cyclon P2P es un mini-SaaS / MVP de demostración y portafolio profesional. No debe procesar pagos reales ni capturar datos bancarios confidenciales (tarjetas, CVV). Sin embargo, debe ilustrar con rigor la experiencia de suscripción a un SaaS, manejo de cupones de descuento y control de capacidades.

## Decisión

1. **Aislamiento de Pagos Reales:**
   - No se integrará ninguna pasarela real (Stripe, PayPal, MercadoPago) en esta versión.
   - El entorno operará bajo `BILLING_MODE=demo`.
   - Se creará un adaptador `DemoBillingProvider`.
2. **Claridad en la Experiencia de Usuario (UI/UX):**
   - El modal/pantalla de checkout tendrá una insignia permanente: **"DEMO — No se realiza ningún cobro real"**.
   - No se solicitarán datos de tarjeta, fecha de expiración ni CVV.
   - La simulación permitirá elegir el resultado: *Aprobado*, *Pendiente*, o *Fallido*.
3. **Persistencia y Marcado de Datos:**
   - Todos los eventos de facturación (`billing_events`) y suscripciones generadas llevarán la marca booleana `is_simulated = true`.
   - Los identificadores de transacción llevarán el prefijo `DEMO-CHK-XXXXX`.
4. **Métricas en Panel Master:**
   - El Panel Master diferenciará tajantemente:
     - Ingresos reales procesados: `$0.00` / No disponible.
     - Métricas simuladas (GMV demo, MRR estimado demo): claramente rotuladas como "ESTIMADO / SIMULACIÓN".
5. **Promociones:**
   - Los cupones aplican descuentos únicamente al cálculo ilustrativo de la simulación.
   - Se validan vigencia, límite de usos y planes elegibles exclusivamente en el servidor.
