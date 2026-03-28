'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Award, Calendar, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generarPDFEstudiante } from '../certificados/actions-client';

interface Certificado {
  id: string;
  titulo: string;
  descripcion: string;
  total_horas: number;
  periodo_desde: Date | null;
  periodo_hasta: Date | null;
  nombre_convocatoria: string;
  nombre_aliado: string;
  emitido_en: Date;
  esta_vigente: boolean;
  url_pdf: string | null;
}

export default function MisCertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      cargarCertificados();
    }
  }, [user?.id]);

  const cargarCertificados = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certificados');
      if (!response.ok) {
        throw new Error('Error al cargar certificados');
      }
      const data = await response.json();
      setCertificados(data.certificados || []);
    } catch (error) {
      console.error('Error cargando certificados:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los certificados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const descargarCertificado = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDownloading(id);
      const toastId = String(toast.loading('Generando PDF del certificado...'));

      // Usar la misma acción server del estudiante
      const pdfBase64 = await generarPDFEstudiante(id);

      // Convert Base64 to Blob (igual admin dashboard)
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificado-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('✅ PDF descargado exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error descargando certificado:', error);
      toast.error('Error al generar PDF: ' + (error as Error).message, { id: String(toast.loading('')) });
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#8B1E1E]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
        <p className="text-gray-600 mt-2">
          Descarga tus certificados de servicio social completados
        </p>
      </div>

      {certificados.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No tienes certificados disponibles</p>
            <p className="text-gray-400 text-sm mt-2">
              Los certificados aparecerán aquí cuando completes tus horas de servicio social
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificados.map((certificado) => (
            <Card key={certificado.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-[#8B1E1E] to-[#a52a2a] text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <CardTitle className="text-lg font-semibold">
                    Certificado de Servicio Social
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {certificado.nombre_convocatoria}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {certificado.descripcion || 'Certificado de cumplimiento de servicio social'}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span><strong>{certificado.total_horas}</strong> horas completadas</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {certificado.periodo_desde && certificado.periodo_hasta
                        ? `${new Date(certificado.periodo_desde).toLocaleDateString('es-CO')} - ${new Date(certificado.periodo_hasta).toLocaleDateString('es-CO')}`
                        : 'Período no especificado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>Emitido: {new Date(certificado.emitido_en).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>

                <Button
                  onClick={(e) => descargarCertificado(e, certificado.id)}
                  disabled={downloading === certificado.id}
                  className="w-full bg-[#8B1E1E] hover:bg-[#6b1717]"
                >
                  {downloading === certificado.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
