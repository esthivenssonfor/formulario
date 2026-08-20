-- Esquema real del proyecto Supabase (aplicado via Management API).
-- Refleja los tipos de src/lib/types.ts; el adaptador vive en src/lib/storage.ts.

create table tipos_discapacidad (
  id text primary key,
  etiqueta text not null
);

create table preguntas (
  id text primary key,
  texto text not null,
  seccion text not null,
  peso numeric not null default 1,
  tipo text not null check (tipo in ('unica', 'multiple', 'texto', 'fecha', 'numero')),
  mostrar_si_discapacidad text[], -- null/vacio = siempre visible
  orden int not null default 0 -- orden de aparicion en la encuesta
);

create table opciones_pregunta (
  id text not null,
  pregunta_id text not null references preguntas(id) on delete cascade,
  texto text not null,
  puntos numeric not null default 0, -- una opcion puede no otorgar puntos
  orden int not null default 0,
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

create table reglas_criticas (
  id text primary key,
  descripcion text not null,
  pregunta_id text not null references preguntas(id) on delete cascade,
  opcion_ids text[] not null default '{}',
  nivel_forzado text not null references rangos_nivel(id),
  orden int not null default 0
);

create table encuestas (
  id uuid primary key default gen_random_uuid(),
  encuestador text,
  participante text not null,
  edad int,
  discapacidad text references tipos_discapacidad(id),
  fecha timestamptz not null default now(),
  puntaje_total numeric not null,
  nivel_id text references rangos_nivel(id),
  factores_criticos text[] not null default '{}'
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

-- RLS: las tablas de configuracion (preguntas/opciones/tipos/rangos/puntuacion)
-- son de lectura publica (las necesita la encuesta anonima) pero solo el
-- panel admin autenticado (Supabase Auth) puede escribirlas. encuestas y
-- respuestas aceptan insert anonimo (enviar la encuesta) pero solo el admin
-- autenticado puede leerlas/editarlas/borrarlas -- ahi vive el PII sensible.

alter table tipos_discapacidad enable row level security;
alter table preguntas enable row level security;
alter table opciones_pregunta enable row level security;
alter table rangos_nivel enable row level security;
alter table configuracion_puntuacion enable row level security;
alter table encuestas enable row level security;
alter table respuestas enable row level security;

create policy td_select on tipos_discapacidad for select using (true);
create policy td_insert on tipos_discapacidad for insert to authenticated with check (true);
create policy td_update on tipos_discapacidad for update to authenticated using (true) with check (true);
create policy td_delete on tipos_discapacidad for delete to authenticated using (true);

create policy p_select on preguntas for select using (true);
create policy p_insert on preguntas for insert to authenticated with check (true);
create policy p_update on preguntas for update to authenticated using (true) with check (true);
create policy p_delete on preguntas for delete to authenticated using (true);

create policy op_select on opciones_pregunta for select using (true);
create policy op_insert on opciones_pregunta for insert to authenticated with check (true);
create policy op_update on opciones_pregunta for update to authenticated using (true) with check (true);
create policy op_delete on opciones_pregunta for delete to authenticated using (true);

create policy rn_select on rangos_nivel for select using (true);
create policy rn_insert on rangos_nivel for insert to authenticated with check (true);
create policy rn_update on rangos_nivel for update to authenticated using (true) with check (true);
create policy rn_delete on rangos_nivel for delete to authenticated using (true);

create policy cp_select on configuracion_puntuacion for select using (true);
create policy cp_insert on configuracion_puntuacion for insert to authenticated with check (true);
create policy cp_update on configuracion_puntuacion for update to authenticated using (true) with check (true);

create policy e_insert on encuestas for insert to anon, authenticated with check (true);
create policy e_select on encuestas for select to authenticated using (true);
create policy e_update on encuestas for update to authenticated using (true) with check (true);
create policy e_delete on encuestas for delete to authenticated using (true);

create policy r_insert on respuestas for insert to anon, authenticated with check (true);
create policy r_select on respuestas for select to authenticated using (true);
create policy r_update on respuestas for update to authenticated using (true) with check (true);
create policy r_delete on respuestas for delete to authenticated using (true);

-- RLS filtra filas, pero primero hace falta el GRANT de tabla base.
grant usage on schema public to anon, authenticated;

grant select on tipos_discapacidad, preguntas, opciones_pregunta, rangos_nivel, configuracion_puntuacion to anon, authenticated;
grant insert, update, delete on tipos_discapacidad, preguntas, opciones_pregunta, rangos_nivel, configuracion_puntuacion to authenticated;

grant insert on encuestas, respuestas to anon, authenticated;
grant select, update, delete on encuestas, respuestas to authenticated;
