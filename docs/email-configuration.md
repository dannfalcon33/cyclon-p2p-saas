# Configuración y Pruebas del Adaptador de Correo (Cyclon P2P)

Este documento describe la arquitectura desacoplada del adaptador de correo electrónico implementado en Cyclon P2P para la autenticación, verificación de cuentas y recuperación de contraseñas.

---

## 1. Arquitectura Desacoplada

El sistema implementa la interfaz `emailService` en `src/lib/email/index.ts`, desacoplando la lógica de negocio de proveedores externos específicos (Resend, SendGrid, SMTP local o de producción).

### Variables de Entorno

| Variable | Tipo / Valores | Descripción |
| :--- | :--- | :--- |
| `EMAIL_PROVIDER` | `console` \| `resend` \| `smtp` | Proveedor activo. Por defecto `console` en desarrollo y tests. |
| `EMAIL_FROM` | string (ej. `no-reply@cyclonp2p.com`) | Dirección remitente mostrada en los correos. |
| `RESEND_API_KEY` | string (secreto) | Clave API requerida si `EMAIL_PROVIDER=resend`. |
| `SMTP_HOST` | string | Host del servidor SMTP (ej. `smtp.resend.com` o servidor corporativo). |
| `SMTP_PORT` | number | Puerto SMTP (ej. `587` o `465`). |
| `SMTP_USER` | string | Usuario de autenticación SMTP. |
| `SMTP_PASSWORD` | string (secreto) | Contraseña de autenticación SMTP. |

---

## 2. Modos de Operación y Pruebas

### Modo Consola / Desarrollo Local (`EMAIL_PROVIDER=console`)
- **Objetivo:** Permite ejecutar y probar el 100% de los flujos de registro, verificación y restablecimiento de contraseña sin depender de servicios externos ni consumir cuotas de envío.
- **Comportamiento:** Cada vez que el sistema genera un correo de verificación o recuperación, imprime en la salida estándar del servidor el destinatario, asunto y el enlace seguro con su respectivo token.
- **Protección de Secretos:** Nunca expone contraseñas en los logs.

### Modo Resend (`EMAIL_PROVIDER=resend`)
1. Crear cuenta en [Resend](https://resend.com) y verificar el dominio de envío.
2. Obtener una API Key y agregarla a `.env.local`:
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_123456789...
   EMAIL_FROM=seguridad@tudominio.com
   ```
3. Los correos se enviarán formateados en HTML con estética cyberpunk (fondo oscuro, acentos verdes `#00ff66`).

### Modo SMTP Compatible (`EMAIL_PROVIDER=smtp`)
- Compatible con cualquier servidor de correo corporativo o de infraestructura propia.

---

## 3. Seguridad y Privacidad en el Flujo de Correo

1. **Prevención de Enumeración de Usuarios:**
   - La pantalla de recuperación de contraseña (`/recuperar-clave`) responde siempre con el mismo mensaje de confirmación, independientemente de si la dirección introducida existe o no en la base de datos.
2. **Tokens de Un Solo Uso:**
   - Los tokens de recuperación y verificación se almacenan en la tabla `verifications` con expiración temporal estricta y se invalidan tras su primer consumo.
3. **Manejo Honesto de Fallos:**
   - Si un proveedor externo falla al despachar un correo, la excepción se captura limpiamente devolviendo un resultado `{ success: false, error: ... }`, evitando caídas del servidor y permitiendo al usuario reintentar la acción.
