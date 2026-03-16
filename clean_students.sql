-- Limpiar perfiles de estudiantes existentes para evitar conflictos
DELETE FROM PerfilEstudiante WHERE id_usuario IN (
  SELECT id FROM Usuario WHERE rol = 'ESTUDIANTE'
);

-- Limpiar usuarios estudiantes existentes
DELETE FROM Usuario WHERE rol = 'ESTUDIANTE';
