# ADR 0001: Selección del Stack Tecnológico Principal

**Fecha:** 2026-10-21  
**Estado:** Aceptado  
**Contexto:**
Cyclon P2P requiere una arquitectura full-stack moderna, reactiva, accesible y optimizada para despliegue en Vercel con persistencia serverless en Neon (PostgreSQL).

## Decisión

1. **Framework:** Next.js (App Router) con TypeScript.
   - *Motivo:* Soporte nativo para Server Components, Server Actions, streaming, excelente integración con Vercel y seguridad de tipos de extremo a extremo.
2. **Estilizado y UI:** Tailwind CSS con variables CSS personalizadas y diseño de componentes Cyberpunk minimalista (paleta negro carbón/grafito `#0a0b0e`, verde neón `#00FF66`).
   - *Motivo:* Control total del diseño responsive, accesibilidad WCAG y consistencia visual sin depender de librerías prediseñadas monolíticas.
3. **Base de Datos y ORM:** PostgreSQL en Neon junto con Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`).
   - *Motivo:* Drizzle ofrece esquemas TypeScript puros, consultas parametrizadas rápidas, migraciones reproducibles y soporte nativo para el connection pooling serverless de Neon.
4. **Autenticación:** Better Auth (`better-auth`) con adaptador PostgreSQL.
   - *Motivo:* Arquitectura modular moderna para Next.js, soporte para correo/contraseña, verificación de email y sesiones HTTP-only en base de datos.
5. **Validación:** Zod.
   - *Motivo:* Tipado estricto e inferencia de tipos compartida entre cliente y servidor.
6. **Testing:** Vitest para pruebas unitarias y de integración.
   - *Motivo:* Rápido, compatible nativamente con ESM y TypeScript.
7. **Exportación Excel:** `exceljs`.
   - *Motivo:* Permite generar libros `.xlsx` complejos con múltiples hojas, estilos numéricos precisos y prevención de formula injection.

## Consecuencias
- Todo el código backend reside en Server Actions y Route Handlers en Next.js.
- Se mantendrán tipos numéricos precisos (`numeric`) en base de datos para todas las cifras fiat y cripto.
