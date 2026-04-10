import nodemailer from 'nodemailer';
import { getEnv } from './env';

const env = getEnv();

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.email.host || 'localhost',
      port: env.email.port || 587,
      secure: env.email.port === 465, // El esquema actual suele usar 465 para secure
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });

    // Verificar conexión en desarrollo
    if (env.isDevelopment) {
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('[EMAIL] Error en configuración:', error);
        } else {
          console.log('[EMAIL] Servidor listo para enviar correos');
        }
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const mailOptions = {
        from: `"${env.app.name || 'Sistema UCP'}" <${env.email.from || env.email.user}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('[EMAIL] Correo enviado:', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] Error al enviar correo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  async sendNotificationEmail(
    to: string | string[],
    subject: string,
    content: string,
    variables?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    // Reemplazar variables en el contenido
    let processedContent = content;
    let processedSubject = subject;

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value));
        processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }

    // Generar HTML básico si solo se proporciona texto
    const html = this.generateBasicHTML(processedContent);

    return this.sendEmail({
      to,
      subject: processedSubject,
      html,
      text: processedContent,
    });
  }

  private generateBasicHTML(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación - UCP Servicio Social</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #8B1E1E;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            color: #8B1E1E;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            white-space: pre-wrap;
            font-size: 16px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">UCP Servicio Social</div>
          </div>
          <div class="content">${content}</div>
          <div class="footer">
            <p>Este es un mensaje automático del Sistema de Servicio Social de la Universidad Católica de Pereira.</p>
            <p>Si no solicitaste esta notificación, por favor contacta al administrador del sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
