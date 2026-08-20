-- "categoria" nunca se uso para nada (ni en el calculo de puntaje, ni para
-- agrupar en la UI): el agrupamiento real de la encuesta es por "seccion".
-- Se quita para no confundir en el panel de configuracion.

alter table preguntas drop column categoria;
