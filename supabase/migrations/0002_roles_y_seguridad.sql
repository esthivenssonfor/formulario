-- Migracion: sistema de roles (admin/user) y endurecimiento de RLS.
-- Aplicar despues de supabase/schema.sql (0001, ya en produccion).
--
-- Contexto: hasta ahora cualquier usuario autenticado (via signUp publico)
-- tenia permiso de escritura total sobre preguntas/opciones/tipos/rangos/
-- puntuacion y lectura total de encuestas/respuestas. Esta migracion:
--   1. Crea `profiles` (rol admin/user) ligada 1:1 a auth.users.
--   2. Agrega is_admin() (security definer) para no depender de RLS
--      recursiva sobre profiles.
--   3. Reemplaza las policies "to authenticated" por "using (is_admin())"
--      en las tablas de configuracion y en encuestas/respuestas.
--   4. profiles NO tiene policies de insert/update/delete para
--      anon/authenticated: solo el service_role (Edge Function / API route
--      server-side) puede crear usuarios o cambiar roles. Un usuario nunca
--      puede escribirse a si mismo como admin.

-- El login del panel es por "usuario" (username), no por correo real.
-- auth.users.email igual existe (Supabase Auth lo exige) pero es un
-- correo interno sintetico bajo @fundimopla.local (ver
-- src/lib/config.ts: emailInternoDeUsuario) -- nunca se muestra ni se
-- usa para contactar a nadie. `email` en esta tabla es opcional y es el
-- correo de contacto REAL de la persona, si lo tiene.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text,
  nombre text,
  role text not null default 'user' check (role in ('admin', 'user')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- security definer: evita recursion de RLS al consultar profiles desde sus
-- propias policies, y es lo que usan el resto de policies de abajo.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and activo = true
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Cada usuario ve su propia fila; el admin ve todas. Sin policies de
-- escritura: la gestion de usuarios pasa exclusivamente por el API route
-- server-side con service_role (ver src/app/api/admin/users).
create policy profiles_select on profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

grant select on profiles to authenticated;

-- ---------------------------------------------------------------------
-- Tablas de configuracion: lectura publica igual que antes, escritura
-- ahora exige is_admin() en vez de "cualquier autenticado".
-- ---------------------------------------------------------------------

drop policy if exists td_insert on tipos_discapacidad;
drop policy if exists td_update on tipos_discapacidad;
drop policy if exists td_delete on tipos_discapacidad;
create policy td_insert on tipos_discapacidad for insert to authenticated with check (public.is_admin());
create policy td_update on tipos_discapacidad for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy td_delete on tipos_discapacidad for delete to authenticated using (public.is_admin());

drop policy if exists p_insert on preguntas;
drop policy if exists p_update on preguntas;
drop policy if exists p_delete on preguntas;
create policy p_insert on preguntas for insert to authenticated with check (public.is_admin());
create policy p_update on preguntas for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy p_delete on preguntas for delete to authenticated using (public.is_admin());

drop policy if exists op_insert on opciones_pregunta;
drop policy if exists op_update on opciones_pregunta;
drop policy if exists op_delete on opciones_pregunta;
create policy op_insert on opciones_pregunta for insert to authenticated with check (public.is_admin());
create policy op_update on opciones_pregunta for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy op_delete on opciones_pregunta for delete to authenticated using (public.is_admin());

drop policy if exists rn_insert on rangos_nivel;
drop policy if exists rn_update on rangos_nivel;
drop policy if exists rn_delete on rangos_nivel;
create policy rn_insert on rangos_nivel for insert to authenticated with check (public.is_admin());
create policy rn_update on rangos_nivel for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy rn_delete on rangos_nivel for delete to authenticated using (public.is_admin());

drop policy if exists cp_insert on configuracion_puntuacion;
drop policy if exists cp_update on configuracion_puntuacion;
create policy cp_insert on configuracion_puntuacion for insert to authenticated with check (public.is_admin());
create policy cp_update on configuracion_puntuacion for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- encuestas / respuestas: el insert anonimo (enviar la encuesta) se
-- mantiene igual. La lectura/edicion/borrado -- donde vive el PII --
-- ahora exige is_admin() en vez de "cualquier autenticado".
-- ---------------------------------------------------------------------

drop policy if exists e_select on encuestas;
drop policy if exists e_update on encuestas;
drop policy if exists e_delete on encuestas;
create policy e_select on encuestas for select to authenticated using (public.is_admin());
create policy e_update on encuestas for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy e_delete on encuestas for delete to authenticated using (public.is_admin());

drop policy if exists r_select on respuestas;
drop policy if exists r_update on respuestas;
drop policy if exists r_delete on respuestas;
create policy r_select on respuestas for select to authenticated using (public.is_admin());
create policy r_update on respuestas for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy r_delete on respuestas for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Bootstrap del primer administrador.
--
-- Supabase Auth no permite crear el primer usuario por SQL directo (el
-- password se maneja aparte, en auth.users, con hashing propio), y exige
-- un campo "email" aunque el login real del panel sea por username.
-- Pasos:
--
--   1. Dashboard de Supabase -> Authentication -> Users -> Add user.
--      Email: admin@fundimopla.local (dominio interno, no es un correo
--      real -- ver DOMINIO_INTERNO_AUTH en src/lib/config.ts). Password:
--      la contraseña inicial (cambiarla luego).
--   2. Copiar el UUID del usuario creado (columna "id" en esa tabla).
--   3. Ejecutar, reemplazando el UUID:
--
--      insert into public.profiles (id, username, nombre, role)
--      values ('<uuid-del-usuario>', 'admin', 'Administrador', 'admin');
--
--   4. En /admin/login, el admin inicial entra con Usuario: "admin".
--
-- Cualquier usuario nuevo que NO tenga fila en profiles se trata como sin
-- acceso (is_admin() = false, y el AdminLayout exige profile.role='admin'
-- para /admin y profile.activo=true para cualquier ruta autenticada).
