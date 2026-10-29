import QRCode from "qrcode";

/** Server-side only: renders `text` as an SVG QR code string. */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 1 });
}
