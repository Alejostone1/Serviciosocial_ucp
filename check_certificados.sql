-- Verificar certificados existentes
SELECT 
    c.id,
    c.codigo_verificacion,
    c.total_horas,
    c.emitido_en,
    u.primer_nombre,
    u.primer_apellido,
    conv.titulo as convocatoria_titulo
FROM certificados c
JOIN usuarios u ON c.id_estudiante = u.id
LEFT JOIN convocatorias conv ON c.id_convocatoria = conv.id
ORDER BY c.emitido_en DESC;
