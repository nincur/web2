import QRCode from 'qrcode';
import { env } from '../env';

export class QRCodeGenerator {
  // Generate QR code as PNG buffer
  async generateTicketQR(ticketId: string): Promise<Buffer> {
    const ticketUrl = `${env.APP_URL}/ticket/${ticketId}`;

    const buffer = await QRCode.toBuffer(ticketUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    return buffer;
  }
}

export const qrGenerator = new QRCodeGenerator();
