-- Funcion server-side para medir el uso REAL de almacenamiento de la base de
-- datos (pg_database_size = bytes en disco de toda la base, igual a lo que
-- reporta el dashboard de Supabase). No cuenta filas de "encuestas": el
-- tamano real depende de todas las tablas/indices, no de una cantidad fija
-- de registros, asi que sigue funcionando igual despues de exportar,
-- eliminar, insertar o vaciar tablas.
--
-- Se llama unicamente desde src/app/api/admin/storage/route.ts con el
-- service_role key (nunca desde el navegador) -- por eso el execute se
-- revoca de anon/authenticated y solo se otorga a service_role.

create or replace function public.get_database_size_bytes()
returns bigint
language sql
security definer
set search_path = public
as $$
  select pg_database_size(current_database());
$$;

revoke execute on function public.get_database_size_bytes() from public, anon, authenticated;
grant execute on function public.get_database_size_bytes() to service_role;
