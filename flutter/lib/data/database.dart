import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'database.g.dart';

/// Estados de sincronizacion de una encuesta guardada localmente.
/// pending = creada offline, nunca se intento enviar.
/// syncing = envio en curso ahora mismo.
/// synced = ya esta en Supabase, la fila local queda solo como cache/historial.
/// error = se intento y fallo (ver [Encuestas.syncError]); se reintenta solo.
enum EstadoSync { pending, syncing, synced, error }

/// Espejo local de la tabla `encuestas` de Supabase + control de
/// sincronizacion. `id` es el mismo UUID generado en el dispositivo (no un
/// autoincrement local) -- ese es el `survey_uuid` que hace que reintentar
/// un envio ya recibido sea un upsert idempotente, nunca un duplicado.
class Encuestas extends Table {
  TextColumn get id => text()(); // uuid generado client-side, PK compartida con Supabase
  TextColumn get encuestador => text()();
  TextColumn get participante => text()();
  IntColumn get edad => integer().nullable()();
  TextColumn get discapacidad => text().nullable()();
  TextColumn get cedula => text().nullable()();
  TextColumn get fecha => text()(); // ISO 8601
  RealColumn get puntajeTotal => real()();
  TextColumn get nivelId => text().nullable()();
  TextColumn get factoresCriticosJson => text().withDefault(const Constant('[]'))();
  TextColumn get respuestasJson => text()(); // RespuestaPregunta[] serializado

  TextColumn get estadoSync => textEnum<EstadoSync>().withDefault(const Constant('pending'))();
  // la fila principal (encuesta+respuestas, escritas juntas y atomicamente
  // por upsert_encuesta_completa) es un componente separado de las fotos:
  // una vez en true no hace falta reintentarla en cada ciclo, solo faltan
  // las fotos que sigan pendientes.
  BoolColumn get datosSincronizados => boolean().withDefault(const Constant(false))();
  TextColumn get syncError => text().nullable()();
  // backoff progresivo: no reintentar antes de este momento. intentos
  // cuenta cuantas veces fallo, para calcular el proximo delay.
  IntColumn get intentos => integer().withDefault(const Constant(0))();
  DateTimeColumn get proximoIntentoEn => dateTime().nullable()();
  DateTimeColumn get creadoEn => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

/// Fotos asociadas a una encuesta (cedula frontal/posterior, foto del
/// participante). Los bytes viajan comprimidos ANTES de llegar aca (ver
/// services/image_processor.dart) -- se guardan localmente hasta que hay
/// señal para subirlos a Supabase Storage.
class Fotos extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get encuestaId => text().references(Encuestas, #id)();
  TextColumn get tipo => text()(); // cedula_frontal | cedula_posterior | foto_participante
  // null una vez confirmada la subida (ver SyncManager._subirFoto): no
  // queremos guardar fotos historicas completas en el dispositivo para
  // siempre, solo mientras estan pendientes de subir.
  BlobColumn get bytes => blob().nullable()();
  TextColumn get mimeType => text()();
  TextColumn get storagePath => text().nullable()(); // se completa al subir
  BoolColumn get subida => boolean().withDefault(const Constant(false))();
  IntColumn get intentos => integer().withDefault(const Constant(0))();
  DateTimeColumn get proximoIntentoEn => dateTime().nullable()();
  TextColumn get syncError => text().nullable()();

  // "volver a tomar antes de confirmar" reemplaza la fila anterior en vez
  // de acumular duplicados (ver Repository.guardarFoto).
  @override
  List<Set<Column>> get uniqueKeys => [
        {encuestaId, tipo}
      ];
}

/// Cache de la Configuracion (preguntas/opciones/rangos/reglas) para poder
/// llenar la encuesta sin conexion -- misma idea que CLAVE_CACHE_CONFIG en
/// la app Next.js (src/lib/storage.ts), pero en una tabla local en vez de
/// localStorage.
class ConfigCache extends Table {
  IntColumn get id => integer().withDefault(const Constant(1))();
  TextColumn get json => text()();
  DateTimeColumn get actualizadoEn => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [Encuestas, Fotos, ConfigCache])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_abrirConexion());

  /// Para tests: DB en memoria en vez del backend real por plataforma
  /// (ver test/repository_test.dart).
  AppDatabase.forTesting(super.executor);

  @override
  int get schemaVersion => 1;

  static QueryExecutor _abrirConexion() {
    // driftDatabase elige el backend correcto por plataforma: sqlite3
    // nativo en Android/iOS/desktop, WASM sobre IndexedDB en Web -- mismo
    // codigo Dart arriba de esto en las 3 plataformas.
    //
    // El parametro `web` es OBLIGATORIO al compilar a Web (si falta,
    // driftDatabase() tira ArgumentError apenas arranca la app -- bug real
    // encontrado y corregido durante la verificacion del nucleo). Los
    // archivos sqlite3.wasm y drift_worker.js viven en web/ -- son
    // binarios oficiales del release de drift/sqlite3.dart que coincide
    // con las versiones fijadas en pubspec.lock (ver web/README.md).
    return driftDatabase(
      name: 'fundimopla_offline',
      web: DriftWebOptions(
        sqlite3Wasm: Uri.parse('sqlite3.wasm'),
        driftWorker: Uri.parse('drift_worker.js'),
      ),
    );
  }
}
