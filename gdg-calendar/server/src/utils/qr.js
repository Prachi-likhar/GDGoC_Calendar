import { nanoid } from 'nanoid';
import QRCode from 'qrcode';

export function generateQrToken() {
  return nanoid(21);
}

export async function generateQrDataUrl(qrToken) {
  return QRCode.toDataURL(qrToken, {
    width: 320,
    margin: 2,
  });
}

