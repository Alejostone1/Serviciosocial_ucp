'use client';

import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const tamañoMaximo = 5 * 1024 * 1024; // 5MB

export interface ArchivoInfo {
  id: string;
  file: File;
  estado: 'pendiente' | 'subiendo' | 'exitoso' | 'error';
  error?: string | undefined;
}

interface ArchivosUploaderProps {
  archivos: ArchivoInfo[];
  onChange: (archivos: ArchivoInfo[]) => void;
  maxArchivos?: number;
}

export function ArchivosUploader({
  archivos,
  onChange,
  maxArchivos = 5
}: ArchivosUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validarArchivo = useCallback((file: File): string | undefined => {
    if (!tiposPermitidos.includes(file.type)) {
      return 'Solo se permiten PDF, JPG y PNG';
    }
    if (file.size > tamañoMaximo) {
      return 'El archivo supera los 5MB';
    }
    return undefined;
  }, []);

  const agregarArchivos = useCallback((files: File[]) => {
    if (archivos.length + files.length > maxArchivos) {
      alert(`Máximo ${maxArchivos} archivos`);
      return;
    }

    const nuevosArchivos: ArchivoInfo[] = files.map(file => {
      const error = validarArchivo(file);
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        estado: error ? 'error' : 'pendiente',
        error
      };
    });

    onChange([...archivos, ...nuevosArchivos]);
  }, [archivos, maxArchivos, onChange, validarArchivo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    agregarArchivos(files);
  }, [agregarArchivos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    agregarArchivos(files);
    e.target.value = ''; // Reset
  };

  const eliminarArchivo = (id: string) => {
    onChange(archivos.filter(a => a.id !== id));
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const obtenerIcono = (tipo: string) => {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {archivos.length < maxArchivos && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all
            ${isDragging
              ? 'border-[#8B1E1E] bg-[#8B1E1E]/5'
              : 'border-slate-300 hover:border-slate-400'
            }
          `}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-bold text-slate-700 mb-1">
            Arrastra archivos aquí o haz click
          </p>
          <p className="text-xs text-slate-500">
            PDF, JPG, PNG · Máx 5MB · Máx {maxArchivos} archivos
          </p>
        </div>
      )}

      {/* Lista de archivos */}
      {archivos.length > 0 && (
        <div className="space-y-2">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg"
            >
              {/* Icono */}
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                {obtenerIcono(archivo.file.type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {archivo.file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatearTamaño(archivo.file.size)}
                </p>
              </div>

              {/* Estado */}
              {archivo.estado === 'error' && (
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">{archivo.error}</span>
                </div>
              )}

              {archivo.estado === 'pendiente' && (
                <div className="flex items-center gap-2 text-slate-400">
                  <File className="w-4 h-4" />
                  <span className="text-xs">Pendiente</span>
                </div>
              )}

              {/* Botón eliminar */}
              <button
                onClick={() => eliminarArchivo(archivo.id)}
                type="button"
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contador */}
      <p className="text-xs text-slate-500 text-center">
        {archivos.length}/{maxArchivos} archivos
      </p>
    </div>
  );
}
