import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestNews() {
  try {
    // Create a test news item
    const noticia = await prisma.noticia.create({
      data: {
        titulo: 'Capacitación en Primeros Auxilios',
        slug: 'capacitacion-en-primeros-auxilios',
        resumen: 'Aprende las técnicas básicas de primeros auxilios que pueden salvar vidas en situaciones de emergencia.',
        contenido: `# Capacitación en Primeros Auxilios

La Universidad Católica de Pereira, a través de su programa de Servicio Social, invita a toda la comunidad estudiantil a participar en la capacitación sobre primeros auxilios.

## ¿Qué aprenderás?

- **RCP básica**: Técnicas de reanimación cardiopulmonar
- **Maniobra de Heimlich**: Cómo ayudar a alguien que se ahoga
- **Control de hemorragias**: Métodos para detener sangrados
- **Inmovilizaciones**: Cómo inmoviliar fracturas y lesiones
- **Evaluación inicial**: Cómo evaluar una emergencia

## ¿Cuándo y dónde?

**Fecha:** 15 de marzo de 2024
**Hora:** 2:00 PM - 5:00 PM
**Lugar:** Auditorio Principal, Bloque A

## ¿Para quién es?

- Estudiantes de todos los programas
- Personal administrativo
- Cualquier miembro de la comunidad UCP

## Certificación

Todos los participantes recibirán un certificado de asistencia válido para horas de servicio social.

¡No te pierdas esta oportunidad de aprender habilidades que pueden salvar vidas!`,
        autor: 'Dirección de Servicio Social',
        publicada: true,
        fecha_publicacion: new Date('2024-03-01T10:00:00Z'),
      },
    });

    console.log('Noticia de prueba creada:', noticia);
    console.log('ID:', noticia.id);
    console.log('Slug:', noticia.slug);
  } catch (error) {
    console.error('Error al crear noticia de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNews();
