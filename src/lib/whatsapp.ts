interface WhatsAppOptions {
  to: string;
  message: string;
}

class WhatsAppService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.baseUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com';
  }

  async sendMessage(options: WhatsAppOptions): Promise<{ success: boolean; error?: string }> {
    try {
      // Usar número de teléfono manual para desarrollo/pruebas
      const phoneNumber = options.to.startsWith('+') ? options.to : `+57${options.to.replace(/[^\d]/g, '')}`;
      
      console.log(`[WHATSAPP] Enviando mensaje a ${phoneNumber}:`);
      console.log(`[WHATSAPP] Mensaje: ${options.message}`);

      // Simulación de envío para desarrollo
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        console.log('[WHATSAPP] Modo simulación - mensaje enviado exitosamente');
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
      }

      // Ejemplo de implementación con WhatsApp Business API
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber.replace(/[^\d]/g, ''), // Limpiar número
          type: 'text',
          text: {
            body: options.message,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al enviar mensaje');
      }

      const data = await response.json();
      console.log('[WHATSAPP] Mensaje enviado:', data);
      
      return { success: true };
    } catch (error) {
      console.error('[WHATSAPP] Error al enviar mensaje:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  async sendNotificationMessage(
    to: string,
    message: string,
    variables?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    // Reemplazar variables en el mensaje
    let processedMessage = message;

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }

    // Limitar mensaje a 1600 caracteres (límite WhatsApp)
    if (processedMessage.length > 1600) {
      processedMessage = processedMessage.substring(0, 1597) + '...';
    }

    return this.sendMessage({
      to,
      message: processedMessage,
    });
  }

  // Método para validar formato de número
  validatePhoneNumber(phone: string): boolean {
    // Remover caracteres no numéricos
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Validar longitud (entre 10 y 15 dígitos)
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  // Método para formatear número
  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Si empieza con 0, reemplazar con código del país
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      return `57${cleanPhone.substring(1)}`; // Colombia por defecto
    }
    
    // Si no tiene código de país, agregar Colombia
    if (cleanPhone.length === 10) {
      return `57${cleanPhone}`;
    }
    
    return cleanPhone;
  }
}

export const whatsappService = new WhatsAppService();
