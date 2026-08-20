-- Soporte para el cliente Flutter offline-first: cedula, fotos, y una
-- funcion transaccional para que la sincronizacion sea idempotente de
-- verdad (encuesta + respuestas se escriben juntas o no se escribe nada).

alter table encuestas add column if not exists cedula text;

create table if not exists encuesta_fotos (
  id uuid primary key default gen_random_uuid(),
  encuesta_id uuid not null references encuestas(id) on delete cascade,
  tipo text not null check (tipo in ('cedula_frontal', 'cedula_posterior', 'foto_participante')),
  storage_path text not null,
  creado_en timestamptz not null default now(),
  -- upsert idempotente: reintentar la subida de la MISMA foto pisa la fila,
  -- nunca crea una segunda.
  unique (encuesta_id, tipo)
);

alter table encuesta_fotos enable row level security;

-- mismo patron que encuestas/respuestas: cualquier autenticado puede
-- insertar/actualizar (el encuestador subiendo su propia encuesta), solo
-- el admin puede leer/borrar (ahi vive el path hacia el bucket privado).
create policy ef_insert on encuesta_fotos for insert to authenticated with check (true);
create policy ef_update on encuesta_fotos for update to authenticated using (true) with check (true);
create policy ef_select on encuesta_fotos for select to authenticated using (public.is_admin());
create policy ef_delete on encuesta_fotos for delete to authenticated using (public.is_admin());

grant select, insert, update on encuesta_fotos to authenticated;
grant delete on encuesta_fotos to authenticated; -- filtrado por RLS a is_admin()

-- ---------------------------------------------------------------------
-- Funcion transaccional: upsert de la encuesta + reemplazo completo de
-- sus respuestas en una sola transaccion. El cliente Flutter reintenta
-- llamando esto con el MISMO id (uuid generado en el dispositivo) las
-- veces que haga falta -- como respuestas se borra-y-reinserta en la
-- misma transaccion, el resultado final es identico sin importar cuantas
-- veces se repita (nunca duplica una respuesta).
-- ---------------------------------------------------------------------
create or replace function public.upsert_encuesta_completa(payload jsonb)
returns void
language plpgsql
security invoker -- corre con los permisos/RLS del usuario autenticado que llama
set search_path = public
as $$
declare
  v_id uuid := (payload->>'id')::uuid;
begin
  insert into encuestas (
    id, encuestador, participante, edad, discapacidad, cedula, fecha,
    puntaje_total, nivel_id, factores_criticos
  )
  values (
    v_id,
    payload->>'encuestador',
    payload->>'participante',
    nullif(payload->>'edad', '')::int,
    payload->>'discapacidad',
    payload->>'cedula',
    (payload->>'fecha')::timestamptz,
    (payload->>'puntaje_total')::numeric,
    payload->>'nivel_id',
    coalesce(
      (select array_agg(value::text) from jsonb_array_elements_text(payload->'factores_criticos')),
      '{}'
    )
  )
  on conflict (id) do update set
    encuestador = excluded.encuestador,
    participante = excluded.participante,
    edad = excluded.edad,
    discapacidad = excluded.discapacidad,
    cedula = excluded.cedula,
    fecha = excluded.fecha,
    puntaje_total = excluded.puntaje_total,
    nivel_id = excluded.nivel_id,
    factores_criticos = excluded.factores_criticos;

  delete from respuestas where encuesta_id = v_id;

  insert into respuestas (encuesta_id, pregunta_id, opcion_ids, valor_texto, puntos)
  select
    v_id,
    r->>'pregunta_id',
    coalesce((select array_agg(value::text) from jsonb_array_elements_text(r->'opcion_ids')), '{}'),
    r->>'valor_texto',
    (r->>'puntos')::numeric
  from jsonb_array_elements(payload->'respuestas') as r;
end;
$$;

-- security invoker: se ejecuta con los permisos de quien llama (el
-- encuestador autenticado), asi que sigue respetando las mismas policies
-- de encuestas/respuestas de arriba -- no es una puerta trasera.
revoke execute on function public.upsert_encuesta_completa(jsonb) from public, anon;
grant execute on function public.upsert_encuesta_completa(jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- Bucket privado para fotos de identificacion. NO publico: las fotos de
-- cedula son PII sensible, solo se leen via URL firmada generada por un
-- admin (ver flutter/lib/services/... signed URL helper, pendiente en la
-- UI admin).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('identificacion', 'identificacion', false, 5242880, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

-- mismo patron que encuesta_fotos: cualquier autenticado puede subir (el
-- encuestador subiendo SU encuesta en curso), solo el admin puede
-- leer/reemplazar/borrar.
create policy identificacion_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'identificacion');

create policy identificacion_select on storage.objects
  for select to authenticated
  using (bucket_id = 'identificacion' and public.is_admin());

create policy identificacion_update on storage.objects
  for update to authenticated
  using (bucket_id = 'identificacion' and public.is_admin())
  with check (bucket_id = 'identificacion' and public.is_admin());

create policy identificacion_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'identificacion' and public.is_admin());
