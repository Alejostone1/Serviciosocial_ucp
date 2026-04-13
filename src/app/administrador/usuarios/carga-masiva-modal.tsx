'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { btn } from '@/lib/btn-variants';
import { cn } from '@/lib/utils';

interface ImportResult {
  total: number;
  exitosos: number;
  fallidos: number;
  errores: Array<{
    fila: number;
    numero_documento?: string;
    correo?: string;
    errores: string[];
  }>;
  usuariosCreados: string[];
}

interface CargaMasivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CargaMasivaModal({ isOpen, onClose, onSuccess }: CargaMasivaModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [generarContrasena, setGenerarContrasena] = useState(true);
  const [requerirCambioClave, setRequerirCambioClave] = useState(true);
  const [crearPerfilEstudiante, setCrearPerfilEstudiante] = useState(true);

  useEffect(() => {
    console.log('🔓 Modal state changed:', isOpen);
  }, [isOpen]);

  const handleDownloadTemplate = async () => {
    console.log('📥 Iniciando descarga de plantilla...');
    try {
      const response = await fetch('/api/usuarios/carga-masiva');
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('📥 Error response:', errorData);
        throw new Error(errorData.error || 'Error al descargar plantilla');
      }
      
      const blob = await response.blob();
      console.log('📥 Blob size:', blob.size);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_usuarios_ucp.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Plantilla descargada correctamente');
    } catch (error) {
      console.error('📥 Error completo:', error);
      toast.error(error instanceof Error ? error.message : 'Error al descargar la plantilla');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File change triggered');
    const selectedFile = e.target.files?.[0];
    console.log('📁 Selected file:', selectedFile);
    
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        console.error('📁 Invalid file type:', selectedFile.name);
        toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        console.error('📁 File too large:', selectedFile.size);
        toast.error('El archivo excede el tamaño máximo de 10MB');
        return;
      }
      console.log('📁 File accepted:', selectedFile.name, selectedFile.size);
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('modoVistaPrevia', preview.toString());
    formData.append('generarContrasena', generarContrasena.toString());
    formData.append('requerirCambioClave', requerirCambioClave.toString());
    formData.append('crearPerfilEstudiante', crearPerfilEstudiante.toString());

    try {
      const response = await fetch('/api/usuarios/carga-masiva', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al importar usuarios');
      }

      const data: ImportResult = await response.json();
      setResult(data);

      if (preview) {
        toast.success(`Vista previa: ${data.exitosos} usuarios válidos`);
      } else {
        if (data.fallidos === 0) {
          toast.success(`¡Éxito! ${data.exitosos} usuarios importados correctamente`);
          onSuccess?.();
          setTimeout(() => onClose(), 2000);
        } else {
          toast.warning(`Importación parcial: ${data.exitosos} exitosos, ${data.fallidos} con errores`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar la importación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-gradient-to-r from-[#8B1E1E] to-[#6B1818]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Carga Masiva de Usuarios</h2>
              <p className="text-sm text-white/80">Importación desde archivo Excel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Paso 1: Descargar plantilla */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Paso 1: Descargar Plantilla</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Descarga la plantilla Excel con el formato correcto para llenar los datos de los usuarios.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar Plantilla Excel
                </button>
              </div>
            </div>
          </div>

          {/* Paso 2: Subir archivo */}
          {!result && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 mb-1">Paso 2: Subir Archivo</h3>
                  <p className="text-sm text-emerald-700 mb-3">
                    Sube el archivo Excel llenado con los datos de los usuarios.
                  </p>
                  
                  {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-300 rounded-2xl cursor-pointer hover:bg-emerald-100/50 transition-colors">
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium text-emerald-700">
                          Click para seleccionar archivo
                        </p>
                        <p className="text-xs text-emerald-500 mt-1">
                          Excel (.xlsx, .xls) - Máx. 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-emerald-200">
                      <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                      <div className="flex-1">
                        <p className="font-medium text-emerald-900">{file.name}</p>
                        <p className="text-xs text-emerald-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Opciones */}
          {file && !result && (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <h3 className="font-bold text-stone-900 mb-4">Opciones de Importación</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preview}
                    onChange={(e) => setPreview(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#8B1E1E] focus:ring-[#8B1E1E]"
                  />
                  <span className="text-sm text-stone-700">
                    Modo vista previa (solo validar sin crear usuarios)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generarContrasena}
                    onChange={(e) => setGenerarContrasena(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#8B1E1E] focus:ring-[#8B1E1E]"
                  />
                  <span className="text-sm text-stone-700">
                    Generar contraseña automática (12 caracteres)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requerirCambioClave}
                    onChange={(e) => setRequerirCambioClave(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#8B1E1E] focus:ring-[#8B1E1E]"
                  />
                  <span className="text-sm text-stone-700">
                    Requerir cambio de contraseña en primer login
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crearPerfilEstudiante}
                    onChange={(e) => setCrearPerfilEstudiante(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#8B1E1E] focus:ring-[#8B1E1E]"
                  />
                  <span className="text-sm text-stone-700">
                    Crear perfil de estudiante (para rol ESTUDIANTE)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Resultados */}
          {result && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-900">{result.total}</p>
                  <p className="text-xs text-blue-600">Total</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-900">{result.exitosos}</p>
                  <p className="text-xs text-emerald-600">Exitosos</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <p className="text-2xl font-bold text-red-900">{result.fallidos}</p>
                  <p className="text-xs text-red-600">Fallidos</p>
                </div>
              </div>

              {/* Errores */}
              {result.errores.length > 0 && (
                <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                  <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Errores Detectados ({result.errores.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.errores.map((error, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-red-200">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">
                              Fila {error.fila}: {error.correo || error.numero_documento}
                            </p>
                            <ul className="text-xs text-red-700 mt-1 space-y-1">
                              {error.errores.map((err, i) => (
                                <li key={i} className="list-disc list-inside">{err}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exitosos */}
              {result.usuariosCreados.length > 0 && (
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                  <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Usuarios Creados ({result.usuariosCreados.length})
                  </h3>
                  <div className="bg-white rounded-xl p-3 max-h-40 overflow-y-auto">
                    <ul className="text-xs text-emerald-700 space-y-1">
                      {result.usuariosCreados.map((correo, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          {correo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Acciones después de resultado */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 bg-stone-200 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-300 transition-all"
                >
                  Importar otro archivo
                </button>
                {!preview && result.fallidos === 0 && (
                  <button
                    onClick={() => {
                      onSuccess?.();
                      onClose();
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#8B1E1E] text-white rounded-xl font-bold text-sm hover:bg-[#721818] transition-all"
                  >
                    Finalizar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex items-center justify-between p-6 border-t border-stone-200 bg-stone-50">
            <p className="text-xs text-stone-500">
              Los campos marcados con * son obligatorios. Máximo 10MB por archivo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-100 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="px-6 py-2.5 bg-[#8B1E1E] text-white rounded-xl font-bold text-sm hover:bg-[#721818] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : preview ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Validar
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar Usuarios
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
