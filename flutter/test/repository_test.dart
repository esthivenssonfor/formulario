// Pruebas del nucleo offline-first (sin red, sin plataforma real): cola
// local, idempotencia, estado por componente y backoff. Corren sobre una
// DB Drift en memoria -- son las pruebas "reales" que se pueden automatizar
// en este entorno; el resto (cierre forzado de la app, reinicio del
// telefono, Wi-Fi <-> datos moviles) se documenta como pendiente de
// verificacion manual en un dispositivo real (ver resumen de la sesion).
import 'dart:typed_data';

import 'package:drift/drift.dart' hide isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fundimopla_encuestas/data/database.dart';
import 'package:fundimopla_encuestas/data/repository.dart';
import 'package:fundimopla_encuestas/models/respuesta_local.dart';
import 'package:fundimopla_encuestas/services/image_processor.dart';

Future<void> _crearEncuestaBasica(Repository repo, String id) => repo.crearEncuestaPendiente(
      id: id,
      encuestador: 'Test',
      participante: 'Participante de prueba',
      cedula: '001-0000000-0',
      fecha: DateTime(2026, 1, 1),
      respuestas: [
        RespuestaLocal(preguntaId: 'q_nombre', opcionIds: const [], valorTexto: 'x', puntos: 0),
      ],
      puntajeTotal: 5,
      factoresCriticos: const [],
    );

void main() {
  late AppDatabase db;
  late Repository repo;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    repo = Repository(db);
  });

  tearDown(() => db.close());

  test('una encuesta nueva queda PENDING y aparece en la cola', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    final pendientes = await repo.pendientesParaSincronizar();
    expect(pendientes, hasLength(1));
    expect(pendientes.first.estadoSync, EstadoSync.pending);
    expect(pendientes.first.datosSincronizados, isFalse);
  });

  test('crear la MISMA encuesta dos veces (reintento) no duplica la fila -- upsert por id', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    await _crearEncuestaBasica(repo, 'enc-1'); // simula un reintento tras perder la respuesta de red
    final pendientes = await repo.pendientesParaSincronizar();
    expect(pendientes, hasLength(1));
  });

  test('volver a tomar una foto antes de confirmar reemplaza la anterior, no la duplica', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    await repo.guardarFoto(
      encuestaId: 'enc-1',
      tipo: TipoFoto.fotoParticipante,
      bytes: Uint8List.fromList([1, 2, 3]),
      mimeType: 'image/jpeg',
    );
    await repo.guardarFoto(
      encuestaId: 'enc-1',
      tipo: TipoFoto.fotoParticipante,
      bytes: Uint8List.fromList([9, 9, 9, 9]), // "volvio a tomar"
      mimeType: 'image/jpeg',
    );
    final fotos = await repo.fotosDe('enc-1');
    expect(fotos, hasLength(1));
    expect(fotos.first.bytes, Uint8List.fromList([9, 9, 9, 9]));
  });

  test('encuesta con datos sincronizados pero foto pendiente NO se marca SYNCED', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    await repo.guardarFoto(
      encuestaId: 'enc-1',
      tipo: TipoFoto.fotoParticipante,
      bytes: Uint8List.fromList([1, 2, 3]),
      mimeType: 'image/jpeg',
    );
    await repo.marcarDatosSincronizados('enc-1');

    final completo = await repo.intentarCerrarSincronizacion('enc-1');
    expect(completo, isFalse);

    // sigue existiendo localmente (no se podo) porque todavia falta la foto.
    final pendientes = await repo.pendientesParaSincronizar();
    expect(pendientes, hasLength(1));
    expect(pendientes.first.estadoSync, EstadoSync.pending);
  });

  test('encuesta completa (datos + todas las fotos) se marca SYNCED y se poda de la DB local', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    await repo.guardarFoto(
      encuestaId: 'enc-1',
      tipo: TipoFoto.fotoParticipante,
      bytes: Uint8List.fromList([1, 2, 3]),
      mimeType: 'image/jpeg',
    );
    final fotos = await repo.fotosDe('enc-1');
    await repo.marcarDatosSincronizados('enc-1');
    await repo.marcarFotoSubida(fotos.first.id, 'enc-1/foto_participante.jpg');

    final completo = await repo.intentarCerrarSincronizacion('enc-1');
    expect(completo, isTrue);

    final pendientes = await repo.pendientesParaSincronizar();
    expect(pendientes, isEmpty);
    expect(await repo.fotosDe('enc-1'), isEmpty);
  });

  test('foto confirmada limpia los bytes locales (no guarda fotos historicas completas)', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    await repo.guardarFoto(
      encuestaId: 'enc-1',
      tipo: TipoFoto.cedulaFrontal,
      bytes: Uint8List.fromList([1, 2, 3, 4, 5]),
      mimeType: 'image/jpeg',
    );
    final fotos = await repo.fotosDe('enc-1');
    await repo.marcarFotoSubida(fotos.first.id, 'enc-1/cedula_frontal.jpg');

    final actualizada = (await repo.fotosDe('enc-1')).first;
    expect(actualizada.subida, isTrue);
    expect(actualizada.bytes, isNull);
    expect(actualizada.storagePath, 'enc-1/cedula_frontal.jpg');
  });

  test('una encuesta con error y backoff futuro NO aparece en la cola hasta que pasa el tiempo', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    await repo.marcarErrorEncuesta('enc-1', 'timeout', DateTime.now().add(const Duration(minutes: 5)), 1);

    expect(await repo.pendientesParaSincronizar(), isEmpty);

    // una vez que el backoff ya paso, vuelve a aparecer.
    await repo.marcarErrorEncuesta('enc-1', 'timeout', DateTime.now().subtract(const Duration(seconds: 1)), 2);
    final pendientes = await repo.pendientesParaSincronizar();
    expect(pendientes, hasLength(1));
    expect(pendientes.first.intentos, 2);
  });

  test('una encuesta que quedo en SYNCING (app cerrada a mitad de sync) se recupera como PENDING', () async {
    await _crearEncuestaBasica(repo, 'enc-1');
    await repo.marcarSincronizando('enc-1'); // simula que el sync arranco...
    // ...y la app se cerro/crasheo antes de terminar (no se llego a marcar
    // ni error ni synced). Sin recuperarInterrumpidas() esta fila jamas
    // volveria a intentarse.
    expect(await repo.pendientesParaSincronizar(), isEmpty);

    await repo.recuperarInterrumpidas();
    final pendientes = await repo.pendientesParaSincronizar();
    expect(pendientes, hasLength(1));
    expect(pendientes.first.estadoSync, EstadoSync.pending);
  });

  test('el pipeline de compresion produce una imagen JPEG decodificable', () async {
    // PNG 1x1 minimo -- solo valida que el pipeline decodifica/reencodea
    // sin tirar excepcion; el tamaño objetivo no aplica a una imagen de 1px.
    final png = Uint8List.fromList([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90,
      0x77, 0x53, 0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8,
      0xCF, 0xC0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
    ]);
    final resultado = await ImageProcessor.procesarPerfil(png);
    expect(resultado.mimeType, 'image/jpeg');
    expect(resultado.bytes, isNotEmpty);
  });
}
