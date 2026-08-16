-- Esquema de referencia para cuando se provisione el proyecto Supabase real.
-- Hoy la app persiste en localStorage (ver src/lib/storage.ts); este esquema
-- refleja exactamente los mismos tipos (src/lib/types.ts) para que migrar sea
-- solo cambiar la implementacion del adaptador, no el modelo de datos.

create table tipos_discapacidad (
  id text primary key,
  etiqueta text not null
);

create table preguntas (
  id text primary key,
  texto text not null,
  categoria text not null,
  seccion text not null,
  peso numeric not null default 1,
  tipo text not null check (tipo in ('unica', 'multiple', 'texto', 'fecha', 'numero')),
  mostrar_si_discapacidad text[] -- null/vacio = siempre visible
);

create table opciones_pregunta (
  id text not null,
  pregunta_id text not null references preguntas(id) on delete cascade,
  texto text not null,
  puntos numeric not null default 0, -- una opcion puede no otorgar puntos
  primary key (pregunta_id, id)
);

create table rangos_nivel (
  id text primary key,
  nombre text not null,
  min numeric not null,
  max numeric not null,
  color text not null
);

create table configuracion_puntuacion (
  id boolean primary key default true check (id), -- fila unica
  direccion text not null check (direccion in ('mayor_es_mas_vulnerable', 'menor_es_mas_vulnerable')),
  puntaje_minimo numeric not null default 0,
  puntaje_maximo numeric not null default 100
);

create table encuestas (
  id uuid primary key default gen_random_uuid(),
  participante text not null,
  edad int,
  discapacidad text not null references tipos_discapacidad(id),
  fecha timestamptz not null default now(),
  puntaje_total numeric not null,
  nivel_id text references rangos_nivel(id)
  -- prioridad NO se guarda: se calcula al consultar, es relativa al conjunto
  -- de encuestas y a la direccion configurada (ver src/lib/scoring.ts).
);

create table respuestas (
  id uuid primary key default gen_random_uuid(),
  encuesta_id uuid not null references encuestas(id) on delete cascade,
  pregunta_id text not null references preguntas(id),
  opcion_ids text[] not null default '{}',
  valor_texto text, -- solo para preguntas tipo texto/fecha/numero
  puntos numeric not null
);

alter table encuestas enable row level security;
alter table respuestas enable row level security;
-- Politicas RLS pendientes de definir segun el modelo de autenticacion del
-- panel admin (hoy no hay auth -- ver AG-CORE-004/AG-SEC-STD-01 antes de
-- exponer este proyecto en produccion).
