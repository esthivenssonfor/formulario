-- La encuesta completa ahora requiere login (ya no es publica/anonima).
-- El encuestador se toma de la sesion, no de un selector -- se descarta
-- la vista publica que exponia nombres para ese selector.
drop view if exists public.encuestadores;

drop policy if exists e_insert on encuestas;
create policy e_insert on encuestas for insert to authenticated with check (true);

drop policy if exists r_insert on respuestas;
create policy r_insert on respuestas for insert to authenticated with check (true);

revoke insert on encuestas, respuestas from anon;
