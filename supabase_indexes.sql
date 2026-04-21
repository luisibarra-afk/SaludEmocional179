-- =============================================
-- ÍNDICES DE RENDIMIENTO — ejecutar en Supabase SQL Editor
-- Críticos para escalar a miles de usuarios
-- =============================================

-- alumnos: login busca por pin
create index if not exists idx_alumnos_pin   on alumnos(pin);
create index if not exists idx_alumnos_grupo on alumnos(grupo);

-- checkins: filtros por fecha y alumno (queries más frecuentes)
create index if not exists idx_checkins_fecha      on checkins(fecha desc);
create index if not exists idx_checkins_no_control on checkins(no_control);
create index if not exists idx_checkins_fecha_hora on checkins(fecha_hora desc);

-- evidencias: ordenar por fecha + filtrar por alumno o ámbito
create index if not exists idx_evidencias_created_at on evidencias(created_at desc);
create index if not exists idx_evidencias_no_control on evidencias(no_control);
create index if not exists idx_evidencias_ambito_id  on evidencias(ambito_id);

-- estado_alumno: no_control ya es PK (índice implícito), pero agregamos updated_at
create index if not exists idx_estado_updated on estado_alumno(updated_at desc);
