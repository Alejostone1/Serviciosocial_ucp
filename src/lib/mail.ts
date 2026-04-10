import nodemailer from 'nodemailer';
import { getEnv } from './env';

const env = getEnv();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para puerto 465
    auth: {
        user: env.email.user,
        pass: env.email.pass,
    },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string, nombre: string) {
    const mailOptions = {
        from: {
            name: 'UCP Servicio Social',
            address: env.email.from || 'ucpserviciosocial@gmail.com',
        },
        to,
        subject: 'Recuperación de Contraseña - UCP Servicio Social',
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #8B1E1E 0%, #6b1515 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        .message {
            color: #4a5568;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #8B1E1E 0%, #6b1515 100%);
            color: white !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(135deg, #6b1515 0%, #8B1E1E 100%);
        }
        .footer {
            background-color: #f7fafc;
            padding: 20px 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .warning {
            background-color: #fffaf0;
            border-left: 4px solid #ed8936;
            padding: 15px;
            margin: 20px 0;
            color: #c05621;
            font-size: 14px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .logo-sub {
            font-size: 12px;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">UCP</div>
            <div class="logo-sub">SERVICIO SOCIAL</div>
            <h1>Recuperación de Contraseña</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hola ${nombre},</div>
            
            <div class="message">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en la plataforma UCP Servicio Social.
            </div>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <div class="warning">
                <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad. Si no solicitaste este cambio, puedes ignorar este correo.
            </div>
            
            <div style="color: #718096; font-size: 14px; margin-top: 30px;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color: #8B1E1E; word-break: break-all;">${resetUrl}</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Universidad Católica de Pereira</strong></p>
            <p>Sistema de Gestión de Servicio Social</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Este es un correo automático, por favor no responder.<br>
                © ${new Date().getFullYear()} UCP - Todos los derechos reservados.
            </p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Hola ${nombre},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en la plataforma UCP Servicio Social.

Para restablecer tu contraseña, visita el siguiente enlace:
${resetUrl}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo.

---
Universidad Católica de Pereira
Sistema de Gestión de Servicio Social
        `,
    };

    return transporter.sendMail(mailOptions);
}
