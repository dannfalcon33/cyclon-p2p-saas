export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface AuthEmailPayload {
  to: string;
  name?: string;
  url: string;
  token?: string;
}

export const emailService = {
  async send(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    const provider = process.env.EMAIL_PROVIDER || "console";
    const from = process.env.EMAIL_FROM || "no-reply@cyclonp2p.com";

    try {
      if (provider === "console" || !process.env.RESEND_API_KEY) {
        // Modo seguro de consola para desarrollo / demo
        console.log("\n=======================================================");
        console.log("📨 [EMAIL ADAPTER - CONSOLE / DEMO]");
        console.log(`De: ${from}`);
        console.log(`Para: ${options.to}`);
        console.log(`Asunto: ${options.subject}`);
        console.log("-------------------------------------------------------");
        console.log(options.text);
        console.log("=======================================================\n");
        return { success: true };
      }

      if (provider === "resend" && process.env.RESEND_API_KEY) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from,
            to: options.to,
            subject: options.subject,
            html: options.html || options.text,
            text: options.text,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error("Error al enviar correo vía Resend:", err);
          return { success: false, error: "Fallo al enviar correo mediante Resend" };
        }

        return { success: true };
      }

      // Si no coincide ningún proveedor válido
      console.warn(`Proveedor de email '${provider}' no configurado, utilizando fallback de consola.`);
      return { success: true };
    } catch (err: any) {
      console.error("Excepción en EmailService:", err);
      return { success: false, error: err.message || "Error inesperado al enviar correo" };
    }
  },

  async sendVerificationEmail(payload: AuthEmailPayload): Promise<{ success: boolean; error?: string }> {
    const subject = "Verifica tu cuenta en Cyclon P2P";
    const text = `Hola ${payload.name || "Comerciante"},\n\nGracias por unirte a Cyclon P2P. Por favor verifica tu correo haciendo clic en el siguiente enlace:\n\n${payload.url}\n\nSi no creaste esta cuenta, puedes ignorar este mensaje.\n\nEquipo Cyclon P2P`;
    const html = `
      <div style="font-family: sans-serif; background-color: #08090d; color: #f1f5f9; padding: 24px; border-radius: 8px;">
        <h2 style="color: #00ff66;">Cyclon P2P</h2>
        <p>Hola <strong>${payload.name || "Comerciante"}</strong>,</p>
        <p>Gracias por registrarte. Haz clic en el botón para activar tu cuenta de demostración y tu espacio de trabajo:</p>
        <div style="margin: 24px 0;">
          <a href="${payload.url}" style="background-color: #00ff66; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Verificar mi Correo</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">O copia y pega este enlace en tu navegador:<br/>${payload.url}</p>
      </div>
    `;
    return this.send({ to: payload.to, subject, text, html });
  },

  async sendPasswordResetEmail(payload: AuthEmailPayload): Promise<{ success: boolean; error?: string }> {
    const subject = "Recuperación de contraseña — Cyclon P2P";
    const text = `Hola,\n\nHas solicitado restablecer tu contraseña en Cyclon P2P. Utiliza el siguiente enlace para crear una nueva clave:\n\n${payload.url}\n\nEste enlace expirará pronto. Si no solicitaste este cambio, ignora este correo.\n\nEquipo Cyclon P2P`;
    const html = `
      <div style="font-family: sans-serif; background-color: #08090d; color: #f1f5f9; padding: 24px; border-radius: 8px;">
        <h2 style="color: #00ff66;">Cyclon P2P</h2>
        <p>Has solicitado restablecer la contraseña de tu cuenta de comerciante.</p>
        <div style="margin: 24px 0;">
          <a href="${payload.url}" style="background-color: #00ff66; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
      </div>
    `;
    return this.send({ to: payload.to, subject, text, html });
  },
};
