-- Vista publica minima para el selector de "encuestador" en /encuesta
-- (formulario anonimo). Expone SOLO id + nombre de usuarios activos --
-- nunca username, email, rol ni nada sensible. La tabla profiles en si
-- sigue protegida por su RLS normal (solo el propio usuario o un admin).
create view public.encuestadores as
  select id, nombre
  from public.profiles
  where activo = true and nombre is not null and nombre <> '';

grant select on public.encuestadores to anon, authenticated;
