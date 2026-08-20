import 'package:flutter_test/flutter_test.dart';
import 'package:fundimopla_encuestas/models/config.dart';
import 'package:fundimopla_encuestas/models/respuesta_local.dart';
import 'package:fundimopla_encuestas/services/scoring.dart';

void main() {
  final rangos = [
    RangoNivel(id: 'baja', nombre: 'Baja', min: 0, max: 10, color: ''),
    RangoNivel(id: 'alta', nombre: 'Alta', min: 11, max: 100, color: ''),
  ];

  test('calcularPuntosRespuesta aplica el peso como multiplicador', () {
    final pregunta = Pregunta(
      id: 'p1',
      texto: '',
      seccion: '',
      peso: 2,
      tipo: TipoPregunta.unica,
      opciones: [OpcionPregunta(id: 'o1', texto: '', puntos: 3)],
    );
    expect(calcularPuntosRespuesta(pregunta, ['o1']), 6);
  });

  test('nivel sale del rango que contiene el puntaje', () {
    final config = ConfiguracionPuntuacion(
      direccion: DireccionPuntaje.mayorEsMasVulnerable,
      puntajeMinimo: 0,
      puntajeMaximo: 100,
      rangosNivel: rangos,
      reglasCriticas: const [],
    );
    final r = calcularNivelYFactores(15, const [], config);
    expect(r.nivelId, 'alta');
    expect(r.factoresCriticos, isEmpty);
  });

  test('una regla critica fuerza el nivel sin importar el puntaje', () {
    final config = ConfiguracionPuntuacion(
      direccion: DireccionPuntaje.mayorEsMasVulnerable,
      puntajeMinimo: 0,
      puntajeMaximo: 100,
      rangosNivel: rangos,
      reglasCriticas: [
        ReglaCritica(
          id: 'r1',
          descripcion: 'No consigue medicamentos',
          preguntaId: 'p_medicamentos',
          opcionIds: ['si'],
          nivelForzado: 'alta',
        ),
      ],
    );
    final respuestas = [
      RespuestaLocal(preguntaId: 'p_medicamentos', opcionIds: const ['si'], puntos: 0),
    ];
    // puntaje bajo (0) caeria en "baja" por rango, pero la regla critica manda.
    final r = calcularNivelYFactores(0, respuestas, config);
    expect(r.nivelId, 'alta');
    expect(r.factoresCriticos, ['No consigue medicamentos']);
  });

  test('preguntasVisibles respeta el filtro por discapacidad', () {
    final generica = Pregunta(id: 'g', texto: '', seccion: '', peso: 0, tipo: TipoPregunta.texto, opciones: const []);
    final filtrada = Pregunta(
      id: 'f',
      texto: '',
      seccion: '',
      peso: 0,
      tipo: TipoPregunta.texto,
      mostrarSiDiscapacidad: const ['visual'],
      opciones: const [],
    );
    final visibles = preguntasVisibles([generica, filtrada], 'motora');
    expect(visibles.map((p) => p.id), [generica.id]);
  });
}
