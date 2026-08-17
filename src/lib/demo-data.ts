import type { Configuracion } from "./types";

// Encuesta oficial entregada por el cliente (ver "encuesta de m.docx").
// demo: false porque este ya es el cuestionario real, no un placeholder.
// Los puntos por opcion y los pesos por pregunta son una PROPUESTA inicial
// (el documento del cliente no trae rubrica de puntaje) -- ajustables desde
// el panel admin sin tocar codigo. Preguntas puramente informativas
// (nombre, cedula, telefono, direccion, etc.) tienen peso 0: no afectan el
// puntaje de vulnerabilidad, solo quedan registradas.
export const CONFIGURACION_DEMO: Configuracion = {
  demo: false,
  tiposDiscapacidad: [
    { id: "visual", etiqueta: "Persona ciega o baja vision" },
    { id: "auditiva", etiqueta: "Discapacidad auditiva" },
    { id: "motora", etiqueta: "Discapacidad motora" },
    { id: "intelectual", etiqueta: "Discapacidad intelectual" },
    { id: "ninguna", etiqueta: "Ninguna / otra" },
  ],
  preguntas: [
    // I. DATOS GENERALES DEL PACIENTE
    { id: "q_nombre", texto: "Nombre y apellido", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_fecha_nacimiento", texto: "Fecha de nacimiento", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "fecha", opciones: [] },
    { id: "q_edad", texto: "Edad (años)", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "numero", opciones: [] },
    { id: "q_cedula", texto: "Cédula de identidad", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_nacionalidad", texto: "Nacionalidad", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "unica",
      opciones: [
        { id: "q_nacionalidad_dominicana", texto: "Dominicana", puntos: 0 },
        { id: "q_nacionalidad_otra", texto: "Otra", puntos: 0 },
      ],
    },
    {
      id: "q_estado_civil", texto: "Estado civil", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "unica",
      opciones: [
        { id: "ec_soltero", texto: "Soltero/a", puntos: 0 },
        { id: "ec_casado", texto: "Casado/a", puntos: 0 },
        { id: "ec_union_libre", texto: "Unión libre", puntos: 0 },
        { id: "ec_divorciado", texto: "Divorciado/a", puntos: 0 },
        { id: "ec_viudo", texto: "Viudo/a", puntos: 0 },
        { id: "ec_otro", texto: "Otro", puntos: 0 },
      ],
    },
    {
      id: "q_nivel_academico", texto: "Nivel académico alcanzado", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "unica",
      opciones: [
        { id: "na_ninguno", texto: "Ninguno", puntos: 0 },
        { id: "na_primaria", texto: "Primaria", puntos: 0 },
        { id: "na_secundaria", texto: "Secundaria", puntos: 0 },
        { id: "na_tecnico", texto: "Técnico", puntos: 0 },
        { id: "na_universitario", texto: "Universitario", puntos: 0 },
        { id: "na_otro", texto: "Otro", puntos: 0 },
      ],
    },
    { id: "q_ocupacion", texto: "Ocupación actual", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_telefono", texto: "Número de teléfono", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_direccion", texto: "Dirección completa", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_convivencia", texto: "¿Con quién vive actualmente?", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "conv_solo", texto: "Vive solo/a", puntos: 6 },
        { id: "conv_padres", texto: "Con padres", puntos: 0 },
        { id: "conv_hijos", texto: "Con hijos", puntos: 0 },
        { id: "conv_pareja", texto: "Con pareja", puntos: 0 },
        { id: "conv_otros_familiares", texto: "Con otros familiares", puntos: 0 },
        { id: "conv_otras_personas", texto: "Con otras personas", puntos: 0 },
        { id: "conv_otro", texto: "Otro", puntos: 2 },
      ],
    },
    { id: "q_personas_hogar", texto: "¿Cuántas personas viven en el hogar, incluyendo al paciente?", categoria: "datos_generales", seccion: "I. Datos generales del paciente", peso: 0, tipo: "numero", opciones: [] },

    // II. INFORMACION SOBRE LA DISCAPACIDAD
    { id: "q_discapacidad_detalle", texto: "¿Cuál es la discapacidad que presenta?", categoria: "discapacidad", seccion: "II. Información sobre la discapacidad", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_discapacidad_desde", texto: "¿Desde cuándo tiene la discapacidad?", categoria: "discapacidad", seccion: "II. Información sobre la discapacidad", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_discapacidad_causa", texto: "¿Cuál fue la causa de la discapacidad?", categoria: "discapacidad", seccion: "II. Información sobre la discapacidad", peso: 0, tipo: "unica",
      opciones: [
        { id: "causa_nacimiento", texto: "De nacimiento", puntos: 0 },
        { id: "causa_enfermedad", texto: "Enfermedad", puntos: 0 },
        { id: "causa_accidente", texto: "Accidente", puntos: 0 },
        { id: "causa_edad", texto: "Edad avanzada", puntos: 0 },
        { id: "causa_otra", texto: "Otra", puntos: 0 },
        { id: "causa_no_sabe", texto: "No sabe", puntos: 0 },
      ],
    },
    {
      id: "q_discapacidad_duracion", texto: "¿La discapacidad es permanente o temporal?", categoria: "discapacidad", seccion: "II. Información sobre la discapacidad", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "dur_permanente", texto: "Permanente", puntos: 3 },
        { id: "dur_temporal", texto: "Temporal", puntos: 1 },
        { id: "dur_no_sabe", texto: "No sabe", puntos: 0 },
      ],
    },
    {
      id: "q_dispositivo_asistencia", texto: "¿Utiliza algún instrumento, equipo o dispositivo para su discapacidad?", categoria: "discapacidad", seccion: "II. Información sobre la discapacidad", peso: 0, tipo: "multiple",
      opciones: [
        { id: "disp_silla_ruedas", texto: "Silla de ruedas", puntos: 0 },
        { id: "disp_baston", texto: "Bastón", puntos: 0 },
        { id: "disp_muletas", texto: "Muletas", puntos: 0 },
        { id: "disp_andador", texto: "Andador", puntos: 0 },
        { id: "disp_protesis", texto: "Prótesis", puntos: 0 },
        { id: "disp_audifono", texto: "Audífono", puntos: 0 },
        { id: "disp_otro", texto: "Otro", puntos: 0 },
        { id: "disp_ninguno", texto: "Ninguno", puntos: 0 },
      ],
    },
    {
      id: "q_dispositivo_estado", texto: "¿El instrumento o equipo que utiliza se encuentra en buenas condiciones?", categoria: "discapacidad", seccion: "II. Información sobre la discapacidad", peso: 1, tipo: "unica",
      opciones: [
        { id: "estado_si", texto: "Sí", puntos: 0 },
        { id: "estado_no", texto: "No", puntos: 8 },
        { id: "estado_reparacion", texto: "Necesita reparación", puntos: 6 },
        { id: "estado_reemplazo", texto: "Necesita reemplazo", puntos: 8 },
        { id: "estado_no_aplica", texto: "No aplica", puntos: 0 },
      ],
    },
    { id: "q_dificultad_principal", texto: "¿Qué dificultad principal le ocasiona su discapacidad?", categoria: "discapacidad", seccion: "II. Información sobre la discapacidad", peso: 0, tipo: "texto", opciones: [] },

    // III. GRADO DE DEPENDENCIA Y ACTIVIDADES DIARIAS
    {
      id: "q_ayuda_banarse", texto: "¿Necesita ayuda para bañarse?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1, tipo: "unica",
      opciones: [
        { id: "ban_no", texto: "No", puntos: 0 },
        { id: "ban_ocasional", texto: "Sí, ocasionalmente", puntos: 4 },
        { id: "ban_diario", texto: "Sí, diariamente", puntos: 8 },
      ],
    },
    {
      id: "q_ayuda_vestirse", texto: "¿Necesita ayuda para vestirse?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1, tipo: "unica",
      opciones: [
        { id: "vest_no", texto: "No", puntos: 0 },
        { id: "vest_ocasional", texto: "Sí, ocasionalmente", puntos: 4 },
        { id: "vest_diario", texto: "Sí, diariamente", puntos: 8 },
      ],
    },
    {
      id: "q_ayuda_comer", texto: "¿Necesita ayuda para comer o preparar sus alimentos?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1, tipo: "unica",
      opciones: [
        { id: "com_no", texto: "No", puntos: 0 },
        { id: "com_ocasional", texto: "Sí, ocasionalmente", puntos: 4 },
        { id: "com_diario", texto: "Sí, diariamente", puntos: 8 },
      ],
    },
    {
      id: "q_ayuda_caminar", texto: "¿Necesita ayuda para caminar o desplazarse dentro de la vivienda?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1, tipo: "unica",
      opciones: [
        { id: "cam_no", texto: "No", puntos: 0 },
        { id: "cam_ocasional", texto: "Sí, ocasionalmente", puntos: 4 },
        { id: "cam_diario", texto: "Sí, diariamente", puntos: 8 },
      ],
    },
    {
      id: "q_ayuda_bano", texto: "¿Necesita ayuda para utilizar el baño?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1, tipo: "unica",
      opciones: [
        { id: "bnu_no", texto: "No", puntos: 0 },
        { id: "bnu_ocasional", texto: "Sí, ocasionalmente", puntos: 4 },
        { id: "bnu_diario", texto: "Sí, diariamente", puntos: 8 },
      ],
    },
    {
      id: "q_ayuda_levantarse", texto: "¿Necesita ayuda para levantarse o acostarse?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1, tipo: "unica",
      opciones: [
        { id: "lev_no", texto: "No", puntos: 0 },
        { id: "lev_ocasional", texto: "Sí, ocasionalmente", puntos: 4 },
        { id: "lev_diario", texto: "Sí, diariamente", puntos: 8 },
      ],
    },
    {
      id: "q_sale_sin_ayuda", texto: "¿Puede salir de la vivienda sin ayuda de otra persona?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1, tipo: "unica",
      opciones: [
        { id: "sale_si", texto: "Sí", puntos: 0 },
        { id: "sale_no", texto: "No", puntos: 8 },
        { id: "sale_algunas_veces", texto: "Algunas veces", puntos: 4 },
      ],
    },
    {
      id: "q_nivel_ayuda_general", texto: "En general, ¿qué nivel de ayuda necesita para realizar sus actividades diarias?", categoria: "dependencia", seccion: "III. Grado de dependencia y actividades diarias", peso: 1.5, tipo: "unica",
      opciones: [
        { id: "nag_sin_ayuda", texto: "Puede realizar sus actividades sin ayuda", puntos: 0 },
        { id: "nag_poca_ayuda", texto: "Necesita poca ayuda", puntos: 3 },
        { id: "nag_ayuda_frecuente", texto: "Necesita ayuda frecuente", puntos: 6 },
        { id: "nag_depende_completamente", texto: "Depende completamente de otra persona", puntos: 10 },
      ],
    },

    // IV. CUIDADOR PRINCIPAL Y RED DE APOYO
    {
      id: "q_tiene_cuidador", texto: "¿Tiene una persona que lo cuide o ayude regularmente?", categoria: "cuidador", seccion: "IV. Cuidador principal y red de apoyo", peso: 1, tipo: "unica",
      opciones: [
        { id: "tc_si", texto: "Sí", puntos: 0 },
        { id: "tc_no", texto: "No", puntos: 8 },
      ],
    },
    { id: "q_cuidador_nombre", texto: "Nombre del cuidador principal", categoria: "cuidador", seccion: "IV. Cuidador principal y red de apoyo", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_cuidador_parentesco", texto: "Parentesco o relación con el paciente", categoria: "cuidador", seccion: "IV. Cuidador principal y red de apoyo", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_cuidador_telefono", texto: "Número de teléfono del cuidador", categoria: "cuidador", seccion: "IV. Cuidador principal y red de apoyo", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_otra_persona_ayuda", texto: "¿Existe otra persona que ayude con el cuidado del paciente?", categoria: "cuidador", seccion: "IV. Cuidador principal y red de apoyo", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "opa_si", texto: "Sí", puntos: 0 },
        { id: "opa_no", texto: "No", puntos: 3 },
      ],
    },
    {
      id: "q_cuidador_necesita_apoyo", texto: "¿El cuidador considera que necesita apoyo para poder cuidar al paciente?", categoria: "cuidador", seccion: "IV. Cuidador principal y red de apoyo", peso: 1, tipo: "unica",
      opciones: [
        { id: "cna_si", texto: "Sí", puntos: 6 },
        { id: "cna_no", texto: "No", puntos: 0 },
      ],
    },
    { id: "q_cuidador_tipo_apoyo", texto: "¿Qué tipo de apoyo necesita el cuidador?", categoria: "cuidador", seccion: "IV. Cuidador principal y red de apoyo", peso: 0, tipo: "texto", opciones: [] },

    // V. INFORMACION DE SALUD
    {
      id: "q_otra_enfermedad", texto: "¿Padece alguna otra enfermedad o condición de salud?", categoria: "salud", seccion: "V. Información de salud", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "oe_si", texto: "Sí", puntos: 4 },
        { id: "oe_no", texto: "No", puntos: 0 },
      ],
    },
    { id: "q_otra_enfermedad_cual", texto: "¿Cuál/es enfermedad/es o condición/es de salud?", categoria: "salud", seccion: "V. Información de salud", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_medicamentos", texto: "¿Qué medicamentos utiliza actualmente?", categoria: "salud", seccion: "V. Información de salud", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_dificultad_medicamentos", texto: "¿Tiene dificultad para conseguir sus medicamentos?", categoria: "salud", seccion: "V. Información de salud", peso: 1, tipo: "unica",
      opciones: [
        { id: "dm_si", texto: "Sí", puntos: 8 },
        { id: "dm_no", texto: "No", puntos: 0 },
        { id: "dm_algunas_veces", texto: "Algunas veces", puntos: 4 },
      ],
    },
    {
      id: "q_atencion_medica_periodica", texto: "¿Recibe atención médica periódicamente?", categoria: "salud", seccion: "V. Información de salud", peso: 1, tipo: "unica",
      opciones: [
        { id: "amp_si", texto: "Sí", puntos: 0 },
        { id: "amp_no", texto: "No", puntos: 8 },
      ],
    },
    { id: "q_donde_atencion_medica", texto: "¿Dónde recibe atención médica?", categoria: "salud", seccion: "V. Información de salud", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_seguro_medico", texto: "¿Qué tipo de seguro médico tiene?", categoria: "salud", seccion: "V. Información de salud", peso: 1, tipo: "unica",
      opciones: [
        { id: "sm_senasa_subsidiado", texto: "SENASA subsidiado", puntos: 3 },
        { id: "sm_senasa_contributivo", texto: "SENASA contributivo", puntos: 1 },
        { id: "sm_privado", texto: "Seguro privado", puntos: 0 },
        { id: "sm_otro", texto: "Otro", puntos: 2 },
        { id: "sm_no_tiene", texto: "No tiene seguro", puntos: 8 },
      ],
    },

    // VI. REHABILITACION Y TERAPIAS
    {
      id: "q_recibe_rehabilitacion", texto: "¿Recibe actualmente algún tipo de rehabilitación o terapia?", categoria: "rehabilitacion", seccion: "VI. Rehabilitación y terapias", peso: 1, tipo: "unica",
      opciones: [
        { id: "rr_si", texto: "Sí", puntos: 0 },
        { id: "rr_no", texto: "No", puntos: 6 },
      ],
    },
    {
      id: "q_tipo_terapia", texto: "¿Qué tipo de terapia recibe?", categoria: "rehabilitacion", seccion: "VI. Rehabilitación y terapias", peso: 0, tipo: "multiple",
      opciones: [
        { id: "tt_fisioterapia", texto: "Fisioterapia", puntos: 0 },
        { id: "tt_ocupacional", texto: "Terapia ocupacional", puntos: 0 },
        { id: "tt_habla", texto: "Terapia del habla/lenguaje", puntos: 0 },
        { id: "tt_psicologica", texto: "Terapia psicológica", puntos: 0 },
        { id: "tt_educativa", texto: "Terapia educativa", puntos: 0 },
        { id: "tt_otra", texto: "Otra", puntos: 0 },
      ],
    },
    {
      id: "q_frecuencia_terapia", texto: "¿Con qué frecuencia recibe la terapia?", categoria: "rehabilitacion", seccion: "VI. Rehabilitación y terapias", peso: 0, tipo: "unica",
      opciones: [
        { id: "ft_diariamente", texto: "Diariamente", puntos: 0 },
        { id: "ft_varias_semana", texto: "Varias veces por semana", puntos: 0 },
        { id: "ft_una_semana", texto: "Una vez por semana", puntos: 0 },
        { id: "ft_algunas_mes", texto: "Algunas veces al mes", puntos: 0 },
        { id: "ft_otro", texto: "Otro", puntos: 0 },
      ],
    },
    { id: "q_donde_rehabilitacion", texto: "¿Dónde recibe la rehabilitación o terapia?", categoria: "rehabilitacion", seccion: "VI. Rehabilitación y terapias", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_necesita_rehabilitacion_no_recibe", texto: "¿Necesita algún tipo de rehabilitación o terapia que actualmente no recibe?", categoria: "rehabilitacion", seccion: "VI. Rehabilitación y terapias", peso: 1, tipo: "unica",
      opciones: [
        { id: "nrn_si", texto: "Sí", puntos: 8 },
        { id: "nrn_no", texto: "No", puntos: 0 },
        { id: "nrn_no_sabe", texto: "No sabe", puntos: 3 },
      ],
    },
    { id: "q_rehabilitacion_cual", texto: "¿Cuál rehabilitación o terapia necesita y no recibe?", categoria: "rehabilitacion", seccion: "VI. Rehabilitación y terapias", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_dificultad_rehabilitacion", texto: "¿Cuál es la principal dificultad para recibir la rehabilitación que necesita?", categoria: "rehabilitacion", seccion: "VI. Rehabilitación y terapias", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "dr_dinero", texto: "Falta de dinero", puntos: 6 },
        { id: "dr_transporte", texto: "Falta de transporte", puntos: 6 },
        { id: "dr_sin_servicio_cercano", texto: "No hay servicio cercano", puntos: 6 },
        { id: "dr_disponibilidad_citas", texto: "Falta de disponibilidad de citas", puntos: 4 },
        { id: "dr_acompanante", texto: "Falta de acompañante", puntos: 4 },
        { id: "dr_otra", texto: "Otra", puntos: 3 },
        { id: "dr_no_aplica", texto: "No aplica", puntos: 0 },
      ],
    },

    // VII. ACCESO AL TRANSPORTE
    {
      id: "q_facilidad_traslado", texto: "¿Tiene facilidad para trasladarse a citas médicas, hospitales o centros de rehabilitación?", categoria: "transporte", seccion: "VII. Acceso al transporte", peso: 1, tipo: "unica",
      opciones: [
        { id: "flt_si", texto: "Sí", puntos: 0 },
        { id: "flt_no", texto: "No", puntos: 8 },
        { id: "flt_algunas_veces", texto: "Algunas veces", puntos: 4 },
      ],
    },
    {
      id: "q_medio_transporte", texto: "¿Qué medio de transporte utiliza normalmente?", categoria: "transporte", seccion: "VII. Acceso al transporte", peso: 0, tipo: "unica",
      opciones: [
        { id: "mt_publico", texto: "Transporte público", puntos: 0 },
        { id: "mt_familiar", texto: "Vehículo familiar", puntos: 0 },
        { id: "mt_taxi", texto: "Taxi", puntos: 0 },
        { id: "mt_institucion", texto: "Transporte de una institución", puntos: 0 },
        { id: "mt_otro", texto: "Otro", puntos: 0 },
      ],
    },
    {
      id: "q_discapacidad_dificulta_transporte", texto: "¿La discapacidad dificulta el uso del transporte?", categoria: "transporte", seccion: "VII. Acceso al transporte", peso: 1, tipo: "unica",
      opciones: [
        { id: "ddt_si", texto: "Sí", puntos: 6 },
        { id: "ddt_no", texto: "No", puntos: 0 },
      ],
    },
    {
      id: "q_necesita_acompanante_transporte", texto: "¿Necesita que otra persona lo acompañe para trasladarse?", categoria: "transporte", seccion: "VII. Acceso al transporte", peso: 1, tipo: "unica",
      opciones: [
        { id: "nat_siempre", texto: "Sí, siempre", puntos: 8 },
        { id: "nat_algunas_veces", texto: "Sí, algunas veces", puntos: 4 },
        { id: "nat_no", texto: "No", puntos: 0 },
      ],
    },
    {
      id: "q_dejo_asistir_por_transporte", texto: "¿Ha dejado de asistir a citas médicas o terapias por falta de transporte?", categoria: "transporte", seccion: "VII. Acceso al transporte", peso: 1, tipo: "unica",
      opciones: [
        { id: "dap_si", texto: "Sí", puntos: 8 },
        { id: "dap_no", texto: "No", puntos: 0 },
      ],
    },
    {
      id: "q_necesita_apoyo_transporte", texto: "¿Necesita apoyo de transporte para recibir atención médica o rehabilitación?", categoria: "transporte", seccion: "VII. Acceso al transporte", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "napt_si", texto: "Sí", puntos: 6 },
        { id: "napt_no", texto: "No", puntos: 0 },
      ],
    },

    // VIII. APOYO SOCIAL Y SITUACION ECONOMICA
    {
      id: "q_apoyo_social", texto: "¿Recibe actualmente algún apoyo social?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 1, tipo: "multiple",
      opciones: [
        { id: "as_bono_gas", texto: "Bono Gas", puntos: 0 },
        { id: "as_bono_luz", texto: "Bono Luz", puntos: 0 },
        { id: "as_bono_alimentos", texto: "Bono de alimentos", puntos: 0 },
        { id: "as_otro", texto: "Otro", puntos: 0 },
        { id: "as_ninguno", texto: "No recibe ningún apoyo", puntos: 6 },
      ],
    },
    {
      id: "q_ayuda_economica_familiar", texto: "¿Recibe ayuda económica o material de algún familiar?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "aef_si", texto: "Sí", puntos: 0 },
        { id: "aef_no", texto: "No", puntos: 4 },
      ],
    },
    {
      id: "q_ayuda_institucion", texto: "¿Recibe ayuda de alguna institución, iglesia, fundación u organización?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "ai_si", texto: "Sí", puntos: 0 },
        { id: "ai_no", texto: "No", puntos: 4 },
      ],
    },
    { id: "q_ayuda_institucion_cual", texto: "¿Cuál institución le brinda ayuda?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_fuente_ingresos", texto: "¿Cuál es la principal fuente de ingresos del hogar?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 1, tipo: "unica",
      opciones: [
        { id: "fi_trabajo_paciente", texto: "Trabajo del paciente", puntos: 0 },
        { id: "fi_trabajo_familiar", texto: "Trabajo de un familiar", puntos: 2 },
        { id: "fi_pension", texto: "Pensión", puntos: 2 },
        { id: "fi_ayuda_familiares", texto: "Ayuda de familiares", puntos: 4 },
        { id: "fi_ayuda_gobierno", texto: "Ayuda del Gobierno", puntos: 4 },
        { id: "fi_ayuda_institucion", texto: "Ayuda de una institución", puntos: 4 },
        { id: "fi_sin_ingresos", texto: "No tiene ingresos", puntos: 8 },
        { id: "fi_otra", texto: "Otra", puntos: 3 },
      ],
    },
    { id: "q_personas_generan_ingresos", texto: "¿Cuántas personas del hogar generan ingresos?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 0, tipo: "numero", opciones: [] },
    {
      id: "q_ingreso_mensual", texto: "Aproximadamente, ¿cuál es el ingreso mensual total del hogar?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 1.5, tipo: "unica",
      opciones: [
        { id: "im_sin_ingresos", texto: "No tiene ingresos", puntos: 10 },
        { id: "im_menos_10000", texto: "Menos de RD$10,000", puntos: 8 },
        { id: "im_10000_20000", texto: "RD$10,000 - RD$20,000", puntos: 6 },
        { id: "im_20001_30000", texto: "RD$20,001 - RD$30,000", puntos: 4 },
        { id: "im_30001_50000", texto: "RD$30,001 - RD$50,000", puntos: 2 },
        { id: "im_mas_50000", texto: "Más de RD$50,000", puntos: 0 },
        { id: "im_prefiere_no_responder", texto: "Prefiere no responder", puntos: 0 },
      ],
    },
    {
      id: "q_ingreso_suficiente", texto: "¿El ingreso del hogar es suficiente para cubrir las necesidades básicas del paciente?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 1, tipo: "unica",
      opciones: [
        { id: "is_si", texto: "Sí", puntos: 0 },
        { id: "is_no", texto: "No", puntos: 8 },
        { id: "is_algunas_veces", texto: "Algunas veces", puntos: 4 },
      ],
    },
    {
      id: "q_dificultades_economicas", texto: "¿Cuáles son las principales dificultades económicas relacionadas con el cuidado del paciente?", categoria: "economica", seccion: "VIII. Apoyo social y situación económica", peso: 0, tipo: "multiple",
      opciones: [
        { id: "de_alimentacion", texto: "Alimentación", puntos: 0 },
        { id: "de_medicamentos", texto: "Medicamentos", puntos: 0 },
        { id: "de_transporte", texto: "Transporte", puntos: 0 },
        { id: "de_consultas_medicas", texto: "Consultas médicas", puntos: 0 },
        { id: "de_terapias", texto: "Terapias", puntos: 0 },
        { id: "de_equipos_discapacidad", texto: "Equipos para la discapacidad", puntos: 0 },
        { id: "de_higiene", texto: "Higiene y cuidado personal", puntos: 0 },
        { id: "de_vivienda", texto: "Vivienda", puntos: 0 },
        { id: "de_otra", texto: "Otra", puntos: 0 },
      ],
    },

    // IX. NECESIDADES ACTUALES DEL PACIENTE
    { id: "q_solicita_actualmente", texto: "¿Qué solicita actualmente el paciente?", categoria: "necesidades", seccion: "IX. Necesidades actuales del paciente", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_necesidad_urgente", texto: "¿Cuál considera que es la necesidad más urgente?", categoria: "necesidades", seccion: "IX. Necesidades actuales del paciente", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_tipo_ayuda_necesita", texto: "¿Qué tipo de ayuda necesita actualmente?", categoria: "necesidades", seccion: "IX. Necesidades actuales del paciente", peso: 0, tipo: "multiple",
      opciones: [
        { id: "tan_alimentos", texto: "Alimentos", puntos: 0 },
        { id: "tan_medicamentos", texto: "Medicamentos", puntos: 0 },
        { id: "tan_atencion_medica", texto: "Atención médica", puntos: 0 },
        { id: "tan_terapias", texto: "Terapias o rehabilitación", puntos: 0 },
        { id: "tan_silla_ruedas", texto: "Silla de ruedas", puntos: 0 },
        { id: "tan_baston_muletas_andador", texto: "Bastón, muletas o andador", puntos: 0 },
        { id: "tan_protesis", texto: "Prótesis u otro dispositivo", puntos: 0 },
        { id: "tan_cama", texto: "Cama", puntos: 0 },
        { id: "tan_colchon", texto: "Colchón", puntos: 0 },
        { id: "tan_ayuda_economica", texto: "Ayuda económica", puntos: 0 },
        { id: "tan_transporte", texto: "Transporte", puntos: 0 },
        { id: "tan_adaptacion_vivienda", texto: "Adaptación de vivienda", puntos: 0 },
        { id: "tan_reparacion_vivienda", texto: "Reparación de vivienda", puntos: 0 },
        { id: "tan_higiene", texto: "Higiene y cuidado personal", puntos: 0 },
        { id: "tan_apoyo_educativo", texto: "Apoyo educativo", puntos: 0 },
        { id: "tan_capacitacion_laboral", texto: "Capacitación laboral", puntos: 0 },
        { id: "tan_empleo", texto: "Empleo", puntos: 0 },
        { id: "tan_otro", texto: "Otro", puntos: 0 },
      ],
    },
    { id: "q_una_sola_ayuda", texto: "Si pudiera recibir una sola ayuda en este momento, ¿cuál sería?", categoria: "necesidades", seccion: "IX. Necesidades actuales del paciente", peso: 0, tipo: "texto", opciones: [] },

    // X. PERSONA DE REFERENCIA
    {
      id: "q_existe_persona_referencia", texto: "¿Existe una persona de referencia o contacto en caso de emergencia?", categoria: "referencia", seccion: "X. Persona de referencia", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "epr_si", texto: "Sí", puntos: 0 },
        { id: "epr_no", texto: "No", puntos: 6 },
      ],
    },
    { id: "q_referencia_nombre", texto: "Nombre completo de la persona de referencia", categoria: "referencia", seccion: "X. Persona de referencia", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_referencia_parentesco", texto: "Parentesco o relación con el paciente", categoria: "referencia", seccion: "X. Persona de referencia", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_referencia_telefono", texto: "Número de teléfono de la persona de referencia", categoria: "referencia", seccion: "X. Persona de referencia", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_referencia_direccion", texto: "Dirección de la persona de referencia, si es diferente a la del paciente", categoria: "referencia", seccion: "X. Persona de referencia", peso: 0, tipo: "texto", opciones: [] },
    {
      id: "q_referencia_participa_cuidado", texto: "¿La persona de referencia participa en el cuidado del paciente?", categoria: "referencia", seccion: "X. Persona de referencia", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "rpc_si", texto: "Sí", puntos: 0 },
        { id: "rpc_no", texto: "No", puntos: 3 },
      ],
    },

    // XI. INFORMACION SOBRE LA VIVIENDA
    {
      id: "q_vivienda_tipo", texto: "La vivienda donde reside el paciente es:", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "vt_propia", texto: "Propia", puntos: 0 },
        { id: "vt_alquilada", texto: "Alquilada", puntos: 2 },
        { id: "vt_prestada", texto: "Prestada", puntos: 3 },
        { id: "vt_otra", texto: "Otra", puntos: 3 },
      ],
    },
    {
      id: "q_material_paredes", texto: "Material predominante de las paredes", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "mp_bloques_concreto", texto: "Bloques/concreto", puntos: 0 },
        { id: "mp_madera", texto: "Madera", puntos: 3 },
        { id: "mp_zinc", texto: "Zinc", puntos: 5 },
        { id: "mp_otro", texto: "Otro", puntos: 3 },
      ],
    },
    {
      id: "q_material_techo", texto: "Material predominante del techo", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 0.5, tipo: "unica",
      opciones: [
        { id: "mtc_concreto", texto: "Concreto", puntos: 0 },
        { id: "mtc_zinc", texto: "Zinc", puntos: 3 },
        { id: "mtc_madera", texto: "Madera", puntos: 4 },
        { id: "mtc_otro", texto: "Otro", puntos: 3 },
      ],
    },
    { id: "q_habitaciones", texto: "¿Cuántas habitaciones tiene la vivienda?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 0, tipo: "numero", opciones: [] },
    { id: "q_camas", texto: "¿Cuántas camas hay en la vivienda?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 0, tipo: "numero", opciones: [] },
    {
      id: "q_cama_propia", texto: "¿El paciente tiene una cama propia?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 1, tipo: "unica",
      opciones: [
        { id: "cp_si", texto: "Sí", puntos: 0 },
        { id: "cp_no", texto: "No", puntos: 6 },
      ],
    },
    {
      id: "q_bano_ubicacion", texto: "¿El baño está dentro o fuera de la vivienda?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 1, tipo: "unica",
      opciones: [
        { id: "bu_dentro", texto: "Dentro de la vivienda", puntos: 0 },
        { id: "bu_fuera", texto: "Fuera de la vivienda", puntos: 5 },
      ],
    },
    {
      id: "q_acceso_silla_ruedas", texto: "¿La entrada de la vivienda permite el acceso de una silla de ruedas o de una persona con movilidad reducida?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 1, tipo: "unica",
      opciones: [
        { id: "asr_si", texto: "Sí", puntos: 0 },
        { id: "asr_no", texto: "No", puntos: 8 },
        { id: "asr_parcialmente", texto: "Parcialmente", puntos: 4 },
      ],
    },
    {
      id: "q_escaleras_desniveles", texto: "¿Existen escaleras o desniveles que dificulten el acceso del paciente?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 1, tipo: "unica",
      opciones: [
        { id: "ed_si", texto: "Sí", puntos: 6 },
        { id: "ed_no", texto: "No", puntos: 0 },
      ],
    },
    {
      id: "q_agua_potable", texto: "¿La vivienda cuenta con agua potable?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 1, tipo: "unica",
      opciones: [
        { id: "ap_si", texto: "Sí", puntos: 0 },
        { id: "ap_no", texto: "No", puntos: 8 },
      ],
    },
    {
      id: "q_electricidad", texto: "¿Cuenta con electricidad?", categoria: "vivienda", seccion: "XI. Información sobre la vivienda", peso: 1, tipo: "unica",
      opciones: [
        { id: "el_si", texto: "Sí", puntos: 0 },
        { id: "el_no", texto: "No", puntos: 8 },
      ],
    },

    // XII. EVALUACION Y PRIORIZACION DEL CASO
    // El nivel de prioridad ya NO se pregunta ni se elige a mano: el sistema
    // lo calcula solo a partir del puntaje de las respuestas anteriores y de
    // las reglas criticas (ver puntuacion.reglasCriticas mas abajo), y se
    // muestra bloqueado en el paso de resultado.
    { id: "q_principal_necesidad", texto: "Según la información recopilada, ¿cuál es la principal necesidad del paciente?", categoria: "evaluacion", seccion: "XII. Evaluación y priorización del caso", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_ayuda_recomendada", texto: "Tipo de ayuda que se recomienda gestionar", categoria: "evaluacion", seccion: "XII. Evaluación y priorización del caso", peso: 0, tipo: "texto", opciones: [] },
    { id: "q_observaciones", texto: "Observaciones adicionales del encuestador", categoria: "evaluacion", seccion: "XII. Evaluación y priorización del caso", peso: 0, tipo: "texto", opciones: [] },
  ],
  puntuacion: {
    direccion: "mayor_es_mas_vulnerable",
    puntajeMinimo: 0,
    puntajeMaximo: 260,
    rangosNivel: [
      { id: "baja", nombre: "Baja", min: 0, max: 40, color: "bg-emerald-600" },
      { id: "moderada", nombre: "Moderada", min: 41, max: 90, color: "bg-yellow-500" },
      { id: "alta", nombre: "Alta", min: 91, max: 150, color: "bg-orange-600" },
      { id: "muy_alta", nombre: "Muy alta", min: 151, max: 9999, color: "bg-red-700" },
    ],
    // Estas reglas fuerzan el nivel "Alta" sin importar el puntaje acumulado,
    // para que un caso urgente no quede escondido detras de un puntaje bajo.
    reglasCriticas: [
      {
        id: "rc-medicamentos",
        descripcion: "No puede conseguir sus medicamentos",
        preguntaId: "q_dificultad_medicamentos",
        opcionIds: ["dm_si"],
        nivelForzado: "alta",
      },
      {
        id: "rc-transporte-terapias",
        descripcion: "Dejo de asistir a citas medicas o terapias por falta de transporte",
        preguntaId: "q_dejo_asistir_por_transporte",
        opcionIds: ["dap_si"],
        nivelForzado: "alta",
      },
    ],
  },
};
