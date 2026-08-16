export type TipoPregunta = "unica" | "multiple" | "texto" | "fecha" | "numero";

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
  participante: string;
  edad: number | null;
  discapacidad: string;
  fecha: string; // ISO
  respuestas: RespuestaPregunta[];
  puntajeTotal: number;
  nivelId: string | null;
  prioridad: number | null;
}
