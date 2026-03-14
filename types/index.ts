// News Types
export interface Noticia {
    id: string;
    titulo: string;
    slug: string;
    resumen: string;
    contenido: string;
    autor: string;
    publicada: boolean;
    fecha_publicacion: string | null;
    creado_en: string;
    actualizado_en: string;
    imagenes: ImagenNoticia[];
}

export interface ImagenNoticia {
    id: string;
    id_noticia: string;
    url_imagen: string;
    public_id_cloudinary: string;
    orden: number;
    creado_en: string;
}

export interface NoticiaForm {
    titulo: string;
    resumen: string;
    contenido: string;
    autor: string;
    publicada: boolean;
    fecha_publicacion?: string;
}