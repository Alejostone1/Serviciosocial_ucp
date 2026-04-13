import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';

export interface UploadedFile {
    nombre: string;
    url: string;
    tipo: string;
    tamaño: number;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
    try {
        // Validar tipo de archivo
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Tipo de archivo no permitido: ${file.type}`);
        }

        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error(`Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo 5MB)`);
        }

        // Generar nombre único
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${extension}`;

        // Asegurar que el directorio uploads exista
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Guardar archivo
        const filePath = join(uploadsDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Retornar información del archivo
        return {
            nombre: file.name,
            url: `/uploads/${fileName}`,
            tipo: file.type,
            tamaño: file.size
        };

    } catch (error) {
        console.error('Error subiendo archivo:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al subir el archivo');
    }
}

/**
 * Subir archivo con estructura segura por usuario y reporte
 * Estructura: /uploads/reportes-horas/{userId}/{reporteId}/{fileName}
 */
export async function uploadFileForReporte(
    file: File,
    userId: string,
    reporteId: string
): Promise<UploadedFile> {
    try {
        // Validar tipo de archivo
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Tipo de archivo no permitido: ${file.type}`);
        }

        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error(`Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo 5MB)`);
        }

        // Generar nombre único con crypto
        const timestamp = Date.now();
        const random = randomBytes(3).toString('hex');
        const extension = file.name.split('.').pop();
        const fileName = `${timestamp}-${random}.${extension}`;

        // Crear directorio estructurado
        const uploadsDir = join(
            process.cwd(), 
            'public', 
            'uploads', 
            'reportes-horas',
            userId,
            reporteId
        );
        
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Guardar archivo
        const filePath = join(uploadsDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Retornar URL relativa
        return {
            nombre: file.name,
            url: `/uploads/reportes-horas/${userId}/${reporteId}/${fileName}`,
            tipo: file.type,
            tamaño: file.size
        };

    } catch (error) {
        console.error('Error subiendo archivo para reporte:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al subir el archivo');
    }
}

export async function uploadMultipleFiles(files: File[]): Promise<UploadedFile[]> {
    const uploadedFiles: UploadedFile[] = [];
    
    for (const file of files) {
        try {
            const uploadedFile = await uploadFile(file);
            uploadedFiles.push(uploadedFile);
        } catch (error) {
            console.error(`Error subiendo archivo ${file.name}:`, error);
            // Continuar con los demás archivos
        }
    }
    
    return uploadedFiles;
}

/**
 * Subir múltiples archivos con estructura segura por usuario y reporte
 */
export async function uploadMultipleFilesForReporte(
    files: File[],
    userId: string,
    reporteId: string
): Promise<UploadedFile[]> {
    const uploadedFiles: UploadedFile[] = [];
    
    for (const file of files) {
        try {
            const uploadedFile = await uploadFileForReporte(file, userId, reporteId);
            uploadedFiles.push(uploadedFile);
        } catch (error) {
            console.error(`Error subiendo archivo ${file.name}:`, error);
            // Continuar con los demás archivos
        }
    }
    
    return uploadedFiles;
}

export function validateFileType(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
