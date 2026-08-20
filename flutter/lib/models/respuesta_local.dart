/// Espejo de RespuestaPregunta (src/lib/types.ts). Se serializa como JSON
/// dentro de Encuestas.respuestasJson en la DB local, y se manda tal cual
/// (en snake_case) como parte del payload de upsert_encuesta_completa.
class RespuestaLocal {
  final String preguntaId;
  final List<String> opcionIds;
  final String? valorTexto;
  final double puntos;

  RespuestaLocal({
    required this.preguntaId,
    required this.opcionIds,
    this.valorTexto,
    required this.puntos,
  });

  Map<String, dynamic> toJson() => {
        'pregunta_id': preguntaId,
        'opcion_ids': opcionIds,
        'valor_texto': valorTexto,
        'puntos': puntos,
      };

  factory RespuestaLocal.fromJson(Map<String, dynamic> json) => RespuestaLocal(
        preguntaId: json['pregunta_id'] as String,
        opcionIds: (json['opcion_ids'] as List).cast<String>(),
        valorTexto: json['valor_texto'] as String?,
        puntos: (json['puntos'] as num).toDouble(),
      );
}
