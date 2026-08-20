import 'dart:convert';

/// Espejo de src/lib/types.ts + src/lib/storage.ts (obtenerConfiguracionDeSupabase).
/// Misma forma que usa la app Next.js, para que el calculo de puntaje de
/// acá (services/scoring.dart) se comporte identico.

class TipoDiscapacidad {
  final String id;
  final String etiqueta;
  TipoDiscapacidad({required this.id, required this.etiqueta});
  factory TipoDiscapacidad.fromMap(Map<String, dynamic> m) =>
      TipoDiscapacidad(id: m['id'] as String, etiqueta: m['etiqueta'] as String);
}

class OpcionPregunta {
  final String id;
  final String texto;
  final double puntos;
  OpcionPregunta({required this.id, required this.texto, required this.puntos});
  factory OpcionPregunta.fromMap(Map<String, dynamic> m) => OpcionPregunta(
        id: m['id'] as String,
        texto: m['texto'] as String,
        puntos: (m['puntos'] as num).toDouble(),
      );
}

enum TipoPregunta { unica, multiple, texto, fecha, numero }

TipoPregunta tipoPreguntaDesde(String v) =>
    TipoPregunta.values.firstWhere((t) => t.name == v, orElse: () => TipoPregunta.texto);

class Pregunta {
  final String id;
  final String texto;
  final String seccion;
  final double peso;
  final TipoPregunta tipo;
  final List<String>? mostrarSiDiscapacidad; // null/vacio = siempre visible
  final List<OpcionPregunta> opciones;

  Pregunta({
    required this.id,
    required this.texto,
    required this.seccion,
    required this.peso,
    required this.tipo,
    this.mostrarSiDiscapacidad,
    required this.opciones,
  });

  factory Pregunta.fromMap(Map<String, dynamic> m, List<OpcionPregunta> opciones) => Pregunta(
        id: m['id'] as String,
        texto: m['texto'] as String,
        seccion: m['seccion'] as String,
        peso: (m['peso'] as num).toDouble(),
        tipo: tipoPreguntaDesde(m['tipo'] as String),
        mostrarSiDiscapacidad: (m['mostrar_si_discapacidad'] as List?)?.cast<String>(),
        opciones: opciones,
      );
}

class RangoNivel {
  final String id;
  final String nombre;
  final double min;
  final double max;
  final String color;
  RangoNivel({required this.id, required this.nombre, required this.min, required this.max, required this.color});
  factory RangoNivel.fromMap(Map<String, dynamic> m) => RangoNivel(
        id: m['id'] as String,
        nombre: m['nombre'] as String,
        min: (m['min'] as num).toDouble(),
        max: (m['max'] as num).toDouble(),
        color: m['color'] as String,
      );
}

class ReglaCritica {
  final String id;
  final String descripcion;
  final String preguntaId;
  final List<String> opcionIds;
  final String nivelForzado;
  ReglaCritica({
    required this.id,
    required this.descripcion,
    required this.preguntaId,
    required this.opcionIds,
    required this.nivelForzado,
  });
  factory ReglaCritica.fromMap(Map<String, dynamic> m) => ReglaCritica(
        id: m['id'] as String,
        descripcion: m['descripcion'] as String,
        preguntaId: m['pregunta_id'] as String,
        opcionIds: (m['opcion_ids'] as List? ?? const []).cast<String>(),
        nivelForzado: m['nivel_forzado'] as String,
      );
}

enum DireccionPuntaje { mayorEsMasVulnerable, menorEsMasVulnerable }

class ConfiguracionPuntuacion {
  final DireccionPuntaje direccion;
  final double puntajeMinimo;
  final double puntajeMaximo;
  final List<RangoNivel> rangosNivel;
  final List<ReglaCritica> reglasCriticas;
  ConfiguracionPuntuacion({
    required this.direccion,
    required this.puntajeMinimo,
    required this.puntajeMaximo,
    required this.rangosNivel,
    required this.reglasCriticas,
  });
}

class Configuracion {
  final List<TipoDiscapacidad> tiposDiscapacidad;
  final List<Pregunta> preguntas;
  final ConfiguracionPuntuacion puntuacion;
  Configuracion({required this.tiposDiscapacidad, required this.preguntas, required this.puntuacion});

  /// Arma la Configuracion a partir de las 6 tablas de Supabase, igual que
  /// obtenerConfiguracionDeSupabase() en src/lib/storage.ts.
  factory Configuracion.desdeFilas({
    required List<Map<String, dynamic>> tipos,
    required List<Map<String, dynamic>> preguntas,
    required List<Map<String, dynamic>> opciones,
    required List<Map<String, dynamic>> rangos,
    required Map<String, dynamic>? puntuacion,
    required List<Map<String, dynamic>> reglas,
  }) {
    final preguntasParseadas = preguntas.map((p) {
      final opcionesDeLaPregunta = opciones
          .where((o) => o['pregunta_id'] == p['id'])
          .map(OpcionPregunta.fromMap)
          .toList();
      return Pregunta.fromMap(p, opcionesDeLaPregunta);
    }).toList();

    return Configuracion(
      tiposDiscapacidad: tipos.map(TipoDiscapacidad.fromMap).toList(),
      preguntas: preguntasParseadas,
      puntuacion: ConfiguracionPuntuacion(
        direccion: puntuacion?['direccion'] == 'menor_es_mas_vulnerable'
            ? DireccionPuntaje.menorEsMasVulnerable
            : DireccionPuntaje.mayorEsMasVulnerable,
        puntajeMinimo: (puntuacion?['puntaje_minimo'] as num?)?.toDouble() ?? 0,
        puntajeMaximo: (puntuacion?['puntaje_maximo'] as num?)?.toDouble() ?? 100,
        rangosNivel: rangos.map(RangoNivel.fromMap).toList(),
        reglasCriticas: reglas.map(ReglaCritica.fromMap).toList(),
      ),
    );
  }

  /// Serializacion propia (no las tablas crudas) para el cache local en
  /// ConfigCache -- mas simple de reconstruir que volver a unir 6 arrays.
  String toCacheJson() => jsonEncode({
        'tiposDiscapacidad': tiposDiscapacidad.map((t) => {'id': t.id, 'etiqueta': t.etiqueta}).toList(),
        'preguntas': preguntas
            .map((p) => {
                  'id': p.id,
                  'texto': p.texto,
                  'seccion': p.seccion,
                  'peso': p.peso,
                  'tipo': p.tipo.name,
                  'mostrarSiDiscapacidad': p.mostrarSiDiscapacidad,
                  'opciones': p.opciones.map((o) => {'id': o.id, 'texto': o.texto, 'puntos': o.puntos}).toList(),
                })
            .toList(),
        'puntuacion': {
          'direccion': puntuacion.direccion.name,
          'puntajeMinimo': puntuacion.puntajeMinimo,
          'puntajeMaximo': puntuacion.puntajeMaximo,
          'rangosNivel': puntuacion.rangosNivel
              .map((r) => {'id': r.id, 'nombre': r.nombre, 'min': r.min, 'max': r.max, 'color': r.color})
              .toList(),
          'reglasCriticas': puntuacion.reglasCriticas
              .map((r) => {
                    'id': r.id,
                    'descripcion': r.descripcion,
                    'preguntaId': r.preguntaId,
                    'opcionIds': r.opcionIds,
                    'nivelForzado': r.nivelForzado,
                  })
              .toList(),
        },
      });

  factory Configuracion.fromCacheJson(String json) {
    final m = jsonDecode(json) as Map<String, dynamic>;
    final puntuacionMap = m['puntuacion'] as Map<String, dynamic>;
    return Configuracion(
      tiposDiscapacidad: (m['tiposDiscapacidad'] as List)
          .map((t) => TipoDiscapacidad(id: t['id'] as String, etiqueta: t['etiqueta'] as String))
          .toList(),
      preguntas: (m['preguntas'] as List).map((p) {
        final opciones = (p['opciones'] as List)
            .map((o) => OpcionPregunta(
                  id: o['id'] as String,
                  texto: o['texto'] as String,
                  puntos: (o['puntos'] as num).toDouble(),
                ))
            .toList();
        return Pregunta(
          id: p['id'] as String,
          texto: p['texto'] as String,
          seccion: p['seccion'] as String,
          peso: (p['peso'] as num).toDouble(),
          tipo: tipoPreguntaDesde(p['tipo'] as String),
          mostrarSiDiscapacidad: (p['mostrarSiDiscapacidad'] as List?)?.cast<String>(),
          opciones: opciones,
        );
      }).toList(),
      puntuacion: ConfiguracionPuntuacion(
        direccion: puntuacionMap['direccion'] == 'menorEsMasVulnerable'
            ? DireccionPuntaje.menorEsMasVulnerable
            : DireccionPuntaje.mayorEsMasVulnerable,
        puntajeMinimo: (puntuacionMap['puntajeMinimo'] as num).toDouble(),
        puntajeMaximo: (puntuacionMap['puntajeMaximo'] as num).toDouble(),
        rangosNivel: (puntuacionMap['rangosNivel'] as List)
            .map((r) => RangoNivel(
                  id: r['id'] as String,
                  nombre: r['nombre'] as String,
                  min: (r['min'] as num).toDouble(),
                  max: (r['max'] as num).toDouble(),
                  color: r['color'] as String,
                ))
            .toList(),
        reglasCriticas: (puntuacionMap['reglasCriticas'] as List)
            .map((r) => ReglaCritica(
                  id: r['id'] as String,
                  descripcion: r['descripcion'] as String,
                  preguntaId: r['preguntaId'] as String,
                  opcionIds: (r['opcionIds'] as List).cast<String>(),
                  nivelForzado: r['nivelForzado'] as String,
                ))
            .toList(),
      ),
    );
  }
}
