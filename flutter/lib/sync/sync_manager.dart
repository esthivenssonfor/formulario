import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../data/database.dart';
import '../data/repository.dart';
import '../models/respuesta_local.dart';
import '../services/connectivity_service.dart';

const String _bucket = 'identificacion';

/// Backoff exponencial con techo: 5s, 10s, 20s, 40s... hasta 5 min. Evita
/// reintentar en loop cerrado cuando el servidor o la red estan mal.
DateTime _proximoIntento(int intentos) {
  final segundos = min(5 * pow(2, intentos).toInt(), 300);
  return DateTime.now().add(Duration(seconds: segundos));
}

/// Motor de sincronizacion: toma encuestas PENDING/ERROR (con su backoff ya
/// vencido) y las sube de a una. Cada encuesta pasa por dos pasos
/// independientes:
///   1. datos (encuesta+respuestas) via upsert_encuesta_completa -- atomico
///      e idempotente (reintentar nunca duplica una respuesta).
///   2. cada foto pendiente -- se sube al Storage con `upsert: true` a un
///      path DETERMINISTICO ({encuestaId}/{tipo}.jpg), asi que reintentar
///      una subida nunca crea un archivo duplicado, solo pisa el mismo.
///      Despues se registra en encuesta_fotos con upsert por
///      (encuesta_id, tipo) -- mismo motivo.
/// La encuesta solo se considera SYNCED (y se poda de la DB local) cuando
/// AMBOS pasos terminaron para TODAS las fotos que efectivamente se
/// tomaron.
class SyncManager {
  final Repository repo;
  final SupabaseClient supabase;
  final ConnectivityService conectividad;

  Timer? _timerPeriodico;
  StreamSubscription<bool>? _subConectividad;
  bool _sincronizando = false;

  final _estadoController = StreamController<String>.broadcast();
  /// Emite un mensaje corto cada vez que cambia algo relevante para la UI
  /// (ver widgets/sync_indicator.dart) -- 'idle' | 'syncing' | 'done'.
  Stream<String> get estado => _estadoController.stream;

  SyncManager(this.repo, this.supabase, this.conectividad);

  void iniciar() {
    // reintento periodico (cubre el caso "hay señal pero nadie disparo el
    // evento de conectividad todavia", ej. la app se abrio con datos ya
    // andando) + reintento inmediato cada vez que vuelve una interfaz de
    // red.
    _timerPeriodico = Timer.periodic(const Duration(seconds: 30), (_) => sincronizarAhora());
    _subConectividad = conectividad.cambiosDeInterfaz.listen((hayRed) {
      if (hayRed) sincronizarAhora();
    });
    sincronizarAhora();
  }

  void detener() {
    _timerPeriodico?.cancel();
    _subConectividad?.cancel();
  }

  /// Se puede llamar seguido sin problema: si ya hay un ciclo corriendo,
  /// no arranca otro en paralelo (evita subir la misma encuesta dos veces
  /// al mismo tiempo desde dos disparadores distintos).
  Future<void> sincronizarAhora() async {
    if (_sincronizando) return;
    _sincronizando = true;
    _estadoController.add('syncing');
    try {
      if (!await conectividad.hayConexionReal()) return;

      final pendientes = await repo.pendientesParaSincronizar();
      for (final encuesta in pendientes) {
        await _procesarEncuesta(encuesta);
      }
    } finally {
      _sincronizando = false;
      _estadoController.add('idle');
    }
  }

  Future<void> _procesarEncuesta(Encuesta encuesta) async {
    await repo.marcarSincronizando(encuesta.id);

    if (!encuesta.datosSincronizados) {
      try {
        await _subirDatos(encuesta);
        await repo.marcarDatosSincronizados(encuesta.id);
      } catch (e) {
        final intentos = encuesta.intentos + 1;
        await repo.marcarErrorEncuesta(encuesta.id, e.toString(), _proximoIntento(intentos), intentos);
        return; // sin datos remotos todavia no tiene sentido subir fotos (encuesta_fotos referencia encuesta_id)
      }
    }

    final fotosPendientes = await repo.fotosPendientesDe(encuesta.id);
    for (final foto in fotosPendientes) {
      try {
        await _subirFoto(encuesta.id, foto);
      } catch (e) {
        final intentos = foto.intentos + 1;
        await repo.marcarErrorFoto(foto.id, e.toString(), _proximoIntento(intentos), intentos);
        // sigue con las demas fotos -- una foto con error no debe bloquear
        // las otras.
      }
    }

    await repo.intentarCerrarSincronizacion(encuesta.id);
  }

  Future<void> _subirDatos(Encuesta encuesta) async {
    final respuestas = (jsonDecode(encuesta.respuestasJson) as List)
        .map((r) => RespuestaLocal.fromJson(r as Map<String, dynamic>))
        .toList();
    final factoresCriticos = (jsonDecode(encuesta.factoresCriticosJson) as List).cast<String>();

    await supabase.rpc('upsert_encuesta_completa', params: {
      'payload': {
        'id': encuesta.id,
        'encuestador': encuesta.encuestador,
        'participante': encuesta.participante,
        'edad': encuesta.edad?.toString() ?? '',
        'discapacidad': encuesta.discapacidad,
        'cedula': encuesta.cedula,
        'fecha': encuesta.fecha,
        'puntaje_total': encuesta.puntajeTotal,
        'nivel_id': encuesta.nivelId,
        'factores_criticos': factoresCriticos,
        'respuestas': respuestas.map((r) => r.toJson()).toList(),
      },
    });
  }

  Future<void> _subirFoto(String encuestaId, Foto foto) async {
    final bytes = foto.bytes;
    if (bytes == null) {
      // ya se habia subido en un ciclo anterior y se limpiaron los bytes,
      // pero por algun motivo quedo con subida=false (no deberia pasar) --
      // no hay nada que subir, se marca como resuelta para no reintentar
      // en loop sin datos.
      await repo.marcarFotoSubida(foto.id, foto.storagePath ?? '');
      return;
    }

    final path = '$encuestaId/${foto.tipo}.jpg';
    await supabase.storage.from(_bucket).uploadBinary(
          path,
          bytes,
          fileOptions: FileOptions(contentType: foto.mimeType, upsert: true),
        );

    // upsert por (encuesta_id, tipo): reintentar esta misma foto nunca
    // crea una segunda fila, solo actualiza el path/fecha.
    await supabase.from('encuesta_fotos').upsert(
      {
        'encuesta_id': encuestaId,
        'tipo': foto.tipo,
        'storage_path': path,
      },
      onConflict: 'encuesta_id,tipo',
    );

    await repo.marcarFotoSubida(foto.id, path);
  }
}
