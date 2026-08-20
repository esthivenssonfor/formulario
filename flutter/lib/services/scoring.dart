import '../models/config.dart';
import '../models/respuesta_local.dart';

/// Port 1:1 de src/lib/scoring.ts -- mismo comportamiento, mismas reglas de
/// negocio, para que una encuesta llenada en Flutter de exactamente el
/// mismo resultado que si se hubiera llenado en la app Next.js. NO
/// reinventar logica aca: si scoring.ts cambia, este archivo tiene que
/// cambiar igual.

List<Pregunta> preguntasVisibles(List<Pregunta> preguntas, String discapacidad) {
  return preguntas
      .where((p) => (p.mostrarSiDiscapacidad?.isEmpty ?? true) || p.mostrarSiDiscapacidad!.contains(discapacidad))
      .toList();
}

double calcularPuntosRespuesta(Pregunta pregunta, List<String> opcionIds) {
  final base = pregunta.opciones
      .where((o) => opcionIds.contains(o.id))
      .fold<double>(0, (acc, o) => acc + o.puntos);
  return base * pregunta.peso;
}

double calcularPuntajeTotal(List<RespuestaLocal> respuestas) =>
    respuestas.fold<double>(0, (acc, r) => acc + r.puntos);

String? _nivelPorPuntaje(double puntaje, ConfiguracionPuntuacion config) {
  for (final rango in config.rangosNivel) {
    if (puntaje >= rango.min && puntaje <= rango.max) return rango.id;
  }
  return null;
}

({String nivelId, List<String> descripciones})? _reglasDisparadas(
  List<RespuestaLocal> respuestas,
  ConfiguracionPuntuacion config,
) {
  final disparadas = config.reglasCriticas.where((regla) {
    final respuesta = respuestas.where((r) => r.preguntaId == regla.preguntaId).firstOrNull;
    return respuesta?.opcionIds.any((id) => regla.opcionIds.contains(id)) ?? false;
  }).toList();
  if (disparadas.isEmpty) return null;

  final ordenSeveridad = config.rangosNivel.map((r) => r.id).toList();
  var nivelId = disparadas.first.nivelForzado;
  for (final regla in disparadas) {
    final idxActual = ordenSeveridad.indexOf(regla.nivelForzado);
    final idxMasSevero = ordenSeveridad.indexOf(nivelId);
    if (idxActual > idxMasSevero) nivelId = regla.nivelForzado;
  }
  return (nivelId: nivelId, descripciones: disparadas.map((r) => r.descripcion).toList());
}

({String? nivelId, List<String> factoresCriticos}) calcularNivelYFactores(
  double puntaje,
  List<RespuestaLocal> respuestas,
  ConfiguracionPuntuacion config,
) {
  final critico = _reglasDisparadas(respuestas, config);
  if (critico != null) return (nivelId: critico.nivelId, factoresCriticos: critico.descripciones);
  return (nivelId: _nivelPorPuntaje(puntaje, config), factoresCriticos: const []);
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
