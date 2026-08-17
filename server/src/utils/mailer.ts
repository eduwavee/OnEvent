import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const isConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

/**
 * Envía un correo si hay SMTP configurado en .env; si no, solo lo loguea en consola.
 * Así el proyecto funciona out-of-the-box sin necesitar credenciales de correo reales.
 */
export async function sendNotification(to: string, subject: string, text: string): Promise<void> {
  if (!transporter) {
    console.log(`[mailer] (SMTP no configurado, log únicamente)\nPara: ${to}\nAsunto: ${subject}\n${text}\n`);
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM || "Gestion de Eventos <no-reply@eventos.local>",
    to,
    subject,
    text,
  });
}
