-- Verificar códigos estudiantiles existentes
SELECT u.primer_nombre, u.primer_apellido, pe.codigo_estudiantil, u.correo
FROM PerfilEstudiante pe
JOIN Usuario u ON pe.id_usuario = u.id
WHERE u.rol = 'ESTUDIANTE';
