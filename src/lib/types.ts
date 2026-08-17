export type TipoPregunta = "unica" | "multiple" | "texto" | "fecha" | "numero";

export type Rol = "admin" | "user";

export interface Profile {
  id: string;
  username: string;
  // correo de contacto real (opcional) -- NO se usa para iniciar sesion,
  // el login es por username (ver src/lib/config.ts).
  email: string | null;
  nombre: string | null;
  role: Rol;
  activo: boolean;
}

export interface TipoDiscapacidad {
  id: string;
  etiqueta: string;
}

export interface OpcionPregunta {
  id: string;
  texto: string;
  puntos: number; // una opcion puede no otorgar puntos (0)
}

export interface Pregunta {
  id: string;
  texto: string;
  categoria: string;
  // seccion de la encuesta, ej. "I. Datos generales del paciente".
  // el orden de las secciones sigue el orden del array `preguntas`.
  seccion: string;
  peso: number; // multiplicador de puntos de esta pregunta
  tipo: TipoPregunta;
  // vacio/undefined = se muestra siempre. Si tiene valores, solo se
  // muestra cuando la discapacidad seleccionada esta en la lista.
  mostrarSiDiscapacidad?: string[];
  // solo aplica a tipo "unica" | "multiple". Vacio para texto/fecha/numero.
  opciones: OpcionPregunta[];
}

export interface RangoNivel {
  id: string;
  nombre: string;
  min: number;
  max: number;
  color: string; // clase tailwind de fondo
}

export type DireccionPuntaje = "mayor_es_mas_vulnerable" | "menor_es_mas_vulnerable";

export interface ConfiguracionPuntuacion {
  direccion: DireccionPuntaje;
  puntajeMinimo: number;
  puntajeMaximo: number;
  rangosNivel: RangoNivel[];
}

export interface Configuracion {
  demo: boolean;
  tiposDiscapacidad: TipoDiscapacidad[];
  preguntas: Pregunta[];
  puntuacion: ConfiguracionPuntuacion;
}

export interface RespuestaPregunta {
  preguntaId: string;
  opcionIds: string[];
  // usado solo por tipo "texto" | "fecha" | "numero" (opcionIds queda vacio).
  valorTexto?: string;
  puntos: number; // ya con el peso aplicado
}

export interface Encuesta {
  id: string;
  // nombre de quien realiza la encuesta (staff/voluntario), no del encuestado.
  encuestador: string;
  participante: string;
  edad: number | null;
  // ya no se elige en un paso aparte -- la seccion II de preguntas
  // (q_discapacidad_detalle) ya cubre este dato como texto libre.
  discapacidad: string | null;
  fecha: string; // ISO
  respuestas: RespuestaPregunta[];
  puntajeTotal: number;
  nivelId: string | null;
  prioridad: number | null;
}
