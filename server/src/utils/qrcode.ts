import QRCode from "qrcode";

/**
 * Genera una imagen QR en formato data URL (PNG en base64) a partir de un token.
 * El token en sí (Registration.qrToken) ya es único; esto solo lo codifica visualmente
 * para que el asistente pueda mostrarlo o descargarlo como ticket.
 */
export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });
}
