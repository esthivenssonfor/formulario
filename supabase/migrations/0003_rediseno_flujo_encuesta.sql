-- Rediseno del flujo de la encuesta (aplicada ya via MCP el 2026-08-17):
--   1. encuestas.discapacidad pasa a ser opcional -- ya no se elige en un
--      paso aparte del formulario, la seccion II (pregunta
--      q_discapacidad_detalle) la cubre como texto libre.
--   2. encuestas.encuestador (nuevo) -- nombre de quien realiza la
--      encuesta (staff/voluntario), distinto de `participante` (el
--      encuestado).
--   3. q_apodo eliminada del catalogo de preguntas (pedido del cliente).
--   4. q_nacionalidad pasa de texto libre a opcion unica (menu), con
--      opciones fijas y "Dominicana" como default en el formulario.

alter table encuestas alter column discapacidad drop not null;
alter table encuestas drop constraint if exists encuestas_discapacidad_fkey;
alter table encuestas add column if not exists encuestador text;

delete from respuestas where pregunta_id = 'q_apodo';
delete from opciones_pregunta where pregunta_id = 'q_apodo';
delete from preguntas where id = 'q_apodo';

-- Nacionalidad: solo "Dominicana" (predeterminada en el formulario) y
-- "Otra" -- al elegir "Otra" el formulario pide especificar cual (texto
-- libre, ver logica generica de "Otra" en src/app/encuesta/page.tsx).
update preguntas set tipo = 'unica' where id = 'q_nacionalidad';
insert into opciones_pregunta (id, pregunta_id, texto, puntos, orden) values
  ('q_nacionalidad_dominicana', 'q_nacionalidad', 'Dominicana', 0, 0),
  ('q_nacionalidad_otra', 'q_nacionalidad', 'Otra', 0, 1)
on conflict (pregunta_id, id) do nothing;
