-- Reglas criticas: fuerzan un nivel de vulnerabilidad sin importar el
-- puntaje acumulado, cuando el encuestado respondio una opcion critica
-- (ej. "no puede conseguir sus medicamentos"). Ver src/lib/scoring.ts.
-- Tambien quita la pregunta manual "Nivel de prioridad del caso": el nivel
-- ya no se elige a mano, se calcula solo (puntaje + reglas criticas).

create table reglas_criticas (
  id text primary key,
  descripcion text not null,
  pregunta_id text not null references preguntas(id) on delete cascade,
  opcion_ids text[] not null default '{}',
  nivel_forzado text not null references rangos_nivel(id),
  orden int not null default 0
);

alter table reglas_criticas enable row level security;

create policy rc_select on reglas_criticas for select using (true);
create policy rc_insert on reglas_criticas for insert to authenticated with check (true);
create policy rc_update on reglas_criticas for update to authenticated using (true) with check (true);
create policy rc_delete on reglas_criticas for delete to authenticated using (true);

grant select on reglas_criticas to anon, authenticated;
grant insert, update, delete on reglas_criticas to authenticated;

alter table encuestas add column factores_criticos text[] not null default '{}';

-- borra la pregunta manual de prioridad (y sus respuestas/opciones) si existe
-- de una configuracion previa -- el nivel ahora se calcula solo.
delete from respuestas where pregunta_id = 'q_prioridad_caso';
delete from preguntas where id = 'q_prioridad_caso';
