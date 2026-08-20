// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $EncuestasTable extends Encuestas
    with TableInfo<$EncuestasTable, Encuesta> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $EncuestasTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _encuestadorMeta = const VerificationMeta(
    'encuestador',
  );
  @override
  late final GeneratedColumn<String> encuestador = GeneratedColumn<String>(
    'encuestador',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _participanteMeta = const VerificationMeta(
    'participante',
  );
  @override
  late final GeneratedColumn<String> participante = GeneratedColumn<String>(
    'participante',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _edadMeta = const VerificationMeta('edad');
  @override
  late final GeneratedColumn<int> edad = GeneratedColumn<int>(
    'edad',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _discapacidadMeta = const VerificationMeta(
    'discapacidad',
  );
  @override
  late final GeneratedColumn<String> discapacidad = GeneratedColumn<String>(
    'discapacidad',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _cedulaMeta = const VerificationMeta('cedula');
  @override
  late final GeneratedColumn<String> cedula = GeneratedColumn<String>(
    'cedula',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _fechaMeta = const VerificationMeta('fecha');
  @override
  late final GeneratedColumn<String> fecha = GeneratedColumn<String>(
    'fecha',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _puntajeTotalMeta = const VerificationMeta(
    'puntajeTotal',
  );
  @override
  late final GeneratedColumn<double> puntajeTotal = GeneratedColumn<double>(
    'puntaje_total',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nivelIdMeta = const VerificationMeta(
    'nivelId',
  );
  @override
  late final GeneratedColumn<String> nivelId = GeneratedColumn<String>(
    'nivel_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _factoresCriticosJsonMeta =
      const VerificationMeta('factoresCriticosJson');
  @override
  late final GeneratedColumn<String> factoresCriticosJson =
      GeneratedColumn<String>(
        'factores_criticos_json',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
        defaultValue: const Constant('[]'),
      );
  static const VerificationMeta _respuestasJsonMeta = const VerificationMeta(
    'respuestasJson',
  );
  @override
  late final GeneratedColumn<String> respuestasJson = GeneratedColumn<String>(
    'respuestas_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  late final GeneratedColumnWithTypeConverter<EstadoSync, String> estadoSync =
      GeneratedColumn<String>(
        'estado_sync',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
        defaultValue: const Constant('pending'),
      ).withConverter<EstadoSync>($EncuestasTable.$converterestadoSync);
  static const VerificationMeta _datosSincronizadosMeta =
      const VerificationMeta('datosSincronizados');
  @override
  late final GeneratedColumn<bool> datosSincronizados = GeneratedColumn<bool>(
    'datos_sincronizados',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("datos_sincronizados" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _syncErrorMeta = const VerificationMeta(
    'syncError',
  );
  @override
  late final GeneratedColumn<String> syncError = GeneratedColumn<String>(
    'sync_error',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _intentosMeta = const VerificationMeta(
    'intentos',
  );
  @override
  late final GeneratedColumn<int> intentos = GeneratedColumn<int>(
    'intentos',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _proximoIntentoEnMeta = const VerificationMeta(
    'proximoIntentoEn',
  );
  @override
  late final GeneratedColumn<DateTime> proximoIntentoEn =
      GeneratedColumn<DateTime>(
        'proximo_intento_en',
        aliasedName,
        true,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _creadoEnMeta = const VerificationMeta(
    'creadoEn',
  );
  @override
  late final GeneratedColumn<DateTime> creadoEn = GeneratedColumn<DateTime>(
    'creado_en',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
    defaultValue: currentDateAndTime,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    encuestador,
    participante,
    edad,
    discapacidad,
    cedula,
    fecha,
    puntajeTotal,
    nivelId,
    factoresCriticosJson,
    respuestasJson,
    estadoSync,
    datosSincronizados,
    syncError,
    intentos,
    proximoIntentoEn,
    creadoEn,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'encuestas';
  @override
  VerificationContext validateIntegrity(
    Insertable<Encuesta> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('encuestador')) {
      context.handle(
        _encuestadorMeta,
        encuestador.isAcceptableOrUnknown(
          data['encuestador']!,
          _encuestadorMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_encuestadorMeta);
    }
    if (data.containsKey('participante')) {
      context.handle(
        _participanteMeta,
        participante.isAcceptableOrUnknown(
          data['participante']!,
          _participanteMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_participanteMeta);
    }
    if (data.containsKey('edad')) {
      context.handle(
        _edadMeta,
        edad.isAcceptableOrUnknown(data['edad']!, _edadMeta),
      );
    }
    if (data.containsKey('discapacidad')) {
      context.handle(
        _discapacidadMeta,
        discapacidad.isAcceptableOrUnknown(
          data['discapacidad']!,
          _discapacidadMeta,
        ),
      );
    }
    if (data.containsKey('cedula')) {
      context.handle(
        _cedulaMeta,
        cedula.isAcceptableOrUnknown(data['cedula']!, _cedulaMeta),
      );
    }
    if (data.containsKey('fecha')) {
      context.handle(
        _fechaMeta,
        fecha.isAcceptableOrUnknown(data['fecha']!, _fechaMeta),
      );
    } else if (isInserting) {
      context.missing(_fechaMeta);
    }
    if (data.containsKey('puntaje_total')) {
      context.handle(
        _puntajeTotalMeta,
        puntajeTotal.isAcceptableOrUnknown(
          data['puntaje_total']!,
          _puntajeTotalMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_puntajeTotalMeta);
    }
    if (data.containsKey('nivel_id')) {
      context.handle(
        _nivelIdMeta,
        nivelId.isAcceptableOrUnknown(data['nivel_id']!, _nivelIdMeta),
      );
    }
    if (data.containsKey('factores_criticos_json')) {
      context.handle(
        _factoresCriticosJsonMeta,
        factoresCriticosJson.isAcceptableOrUnknown(
          data['factores_criticos_json']!,
          _factoresCriticosJsonMeta,
        ),
      );
    }
    if (data.containsKey('respuestas_json')) {
      context.handle(
        _respuestasJsonMeta,
        respuestasJson.isAcceptableOrUnknown(
          data['respuestas_json']!,
          _respuestasJsonMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_respuestasJsonMeta);
    }
    if (data.containsKey('datos_sincronizados')) {
      context.handle(
        _datosSincronizadosMeta,
        datosSincronizados.isAcceptableOrUnknown(
          data['datos_sincronizados']!,
          _datosSincronizadosMeta,
        ),
      );
    }
    if (data.containsKey('sync_error')) {
      context.handle(
        _syncErrorMeta,
        syncError.isAcceptableOrUnknown(data['sync_error']!, _syncErrorMeta),
      );
    }
    if (data.containsKey('intentos')) {
      context.handle(
        _intentosMeta,
        intentos.isAcceptableOrUnknown(data['intentos']!, _intentosMeta),
      );
    }
    if (data.containsKey('proximo_intento_en')) {
      context.handle(
        _proximoIntentoEnMeta,
        proximoIntentoEn.isAcceptableOrUnknown(
          data['proximo_intento_en']!,
          _proximoIntentoEnMeta,
        ),
      );
    }
    if (data.containsKey('creado_en')) {
      context.handle(
        _creadoEnMeta,
        creadoEn.isAcceptableOrUnknown(data['creado_en']!, _creadoEnMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Encuesta map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Encuesta(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      encuestador: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}encuestador'],
      )!,
      participante: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}participante'],
      )!,
      edad: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}edad'],
      ),
      discapacidad: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}discapacidad'],
      ),
      cedula: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}cedula'],
      ),
      fecha: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}fecha'],
      )!,
      puntajeTotal: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}puntaje_total'],
      )!,
      nivelId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}nivel_id'],
      ),
      factoresCriticosJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}factores_criticos_json'],
      )!,
      respuestasJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}respuestas_json'],
      )!,
      estadoSync: $EncuestasTable.$converterestadoSync.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}estado_sync'],
        )!,
      ),
      datosSincronizados: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}datos_sincronizados'],
      )!,
      syncError: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_error'],
      ),
      intentos: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}intentos'],
      )!,
      proximoIntentoEn: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}proximo_intento_en'],
      ),
      creadoEn: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}creado_en'],
      )!,
    );
  }

  @override
  $EncuestasTable createAlias(String alias) {
    return $EncuestasTable(attachedDatabase, alias);
  }

  static JsonTypeConverter2<EstadoSync, String, String> $converterestadoSync =
      const EnumNameConverter<EstadoSync>(EstadoSync.values);
}

class Encuesta extends DataClass implements Insertable<Encuesta> {
  final String id;
  final String encuestador;
  final String participante;
  final int? edad;
  final String? discapacidad;
  final String? cedula;
  final String fecha;
  final double puntajeTotal;
  final String? nivelId;
  final String factoresCriticosJson;
  final String respuestasJson;
  final EstadoSync estadoSync;
  final bool datosSincronizados;
  final String? syncError;
  final int intentos;
  final DateTime? proximoIntentoEn;
  final DateTime creadoEn;
  const Encuesta({
    required this.id,
    required this.encuestador,
    required this.participante,
    this.edad,
    this.discapacidad,
    this.cedula,
    required this.fecha,
    required this.puntajeTotal,
    this.nivelId,
    required this.factoresCriticosJson,
    required this.respuestasJson,
    required this.estadoSync,
    required this.datosSincronizados,
    this.syncError,
    required this.intentos,
    this.proximoIntentoEn,
    required this.creadoEn,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['encuestador'] = Variable<String>(encuestador);
    map['participante'] = Variable<String>(participante);
    if (!nullToAbsent || edad != null) {
      map['edad'] = Variable<int>(edad);
    }
    if (!nullToAbsent || discapacidad != null) {
      map['discapacidad'] = Variable<String>(discapacidad);
    }
    if (!nullToAbsent || cedula != null) {
      map['cedula'] = Variable<String>(cedula);
    }
    map['fecha'] = Variable<String>(fecha);
    map['puntaje_total'] = Variable<double>(puntajeTotal);
    if (!nullToAbsent || nivelId != null) {
      map['nivel_id'] = Variable<String>(nivelId);
    }
    map['factores_criticos_json'] = Variable<String>(factoresCriticosJson);
    map['respuestas_json'] = Variable<String>(respuestasJson);
    {
      map['estado_sync'] = Variable<String>(
        $EncuestasTable.$converterestadoSync.toSql(estadoSync),
      );
    }
    map['datos_sincronizados'] = Variable<bool>(datosSincronizados);
    if (!nullToAbsent || syncError != null) {
      map['sync_error'] = Variable<String>(syncError);
    }
    map['intentos'] = Variable<int>(intentos);
    if (!nullToAbsent || proximoIntentoEn != null) {
      map['proximo_intento_en'] = Variable<DateTime>(proximoIntentoEn);
    }
    map['creado_en'] = Variable<DateTime>(creadoEn);
    return map;
  }

  EncuestasCompanion toCompanion(bool nullToAbsent) {
    return EncuestasCompanion(
      id: Value(id),
      encuestador: Value(encuestador),
      participante: Value(participante),
      edad: edad == null && nullToAbsent ? const Value.absent() : Value(edad),
      discapacidad: discapacidad == null && nullToAbsent
          ? const Value.absent()
          : Value(discapacidad),
      cedula: cedula == null && nullToAbsent
          ? const Value.absent()
          : Value(cedula),
      fecha: Value(fecha),
      puntajeTotal: Value(puntajeTotal),
      nivelId: nivelId == null && nullToAbsent
          ? const Value.absent()
          : Value(nivelId),
      factoresCriticosJson: Value(factoresCriticosJson),
      respuestasJson: Value(respuestasJson),
      estadoSync: Value(estadoSync),
      datosSincronizados: Value(datosSincronizados),
      syncError: syncError == null && nullToAbsent
          ? const Value.absent()
          : Value(syncError),
      intentos: Value(intentos),
      proximoIntentoEn: proximoIntentoEn == null && nullToAbsent
          ? const Value.absent()
          : Value(proximoIntentoEn),
      creadoEn: Value(creadoEn),
    );
  }

  factory Encuesta.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Encuesta(
      id: serializer.fromJson<String>(json['id']),
      encuestador: serializer.fromJson<String>(json['encuestador']),
      participante: serializer.fromJson<String>(json['participante']),
      edad: serializer.fromJson<int?>(json['edad']),
      discapacidad: serializer.fromJson<String?>(json['discapacidad']),
      cedula: serializer.fromJson<String?>(json['cedula']),
      fecha: serializer.fromJson<String>(json['fecha']),
      puntajeTotal: serializer.fromJson<double>(json['puntajeTotal']),
      nivelId: serializer.fromJson<String?>(json['nivelId']),
      factoresCriticosJson: serializer.fromJson<String>(
        json['factoresCriticosJson'],
      ),
      respuestasJson: serializer.fromJson<String>(json['respuestasJson']),
      estadoSync: $EncuestasTable.$converterestadoSync.fromJson(
        serializer.fromJson<String>(json['estadoSync']),
      ),
      datosSincronizados: serializer.fromJson<bool>(json['datosSincronizados']),
      syncError: serializer.fromJson<String?>(json['syncError']),
      intentos: serializer.fromJson<int>(json['intentos']),
      proximoIntentoEn: serializer.fromJson<DateTime?>(
        json['proximoIntentoEn'],
      ),
      creadoEn: serializer.fromJson<DateTime>(json['creadoEn']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'encuestador': serializer.toJson<String>(encuestador),
      'participante': serializer.toJson<String>(participante),
      'edad': serializer.toJson<int?>(edad),
      'discapacidad': serializer.toJson<String?>(discapacidad),
      'cedula': serializer.toJson<String?>(cedula),
      'fecha': serializer.toJson<String>(fecha),
      'puntajeTotal': serializer.toJson<double>(puntajeTotal),
      'nivelId': serializer.toJson<String?>(nivelId),
      'factoresCriticosJson': serializer.toJson<String>(factoresCriticosJson),
      'respuestasJson': serializer.toJson<String>(respuestasJson),
      'estadoSync': serializer.toJson<String>(
        $EncuestasTable.$converterestadoSync.toJson(estadoSync),
      ),
      'datosSincronizados': serializer.toJson<bool>(datosSincronizados),
      'syncError': serializer.toJson<String?>(syncError),
      'intentos': serializer.toJson<int>(intentos),
      'proximoIntentoEn': serializer.toJson<DateTime?>(proximoIntentoEn),
      'creadoEn': serializer.toJson<DateTime>(creadoEn),
    };
  }

  Encuesta copyWith({
    String? id,
    String? encuestador,
    String? participante,
    Value<int?> edad = const Value.absent(),
    Value<String?> discapacidad = const Value.absent(),
    Value<String?> cedula = const Value.absent(),
    String? fecha,
    double? puntajeTotal,
    Value<String?> nivelId = const Value.absent(),
    String? factoresCriticosJson,
    String? respuestasJson,
    EstadoSync? estadoSync,
    bool? datosSincronizados,
    Value<String?> syncError = const Value.absent(),
    int? intentos,
    Value<DateTime?> proximoIntentoEn = const Value.absent(),
    DateTime? creadoEn,
  }) => Encuesta(
    id: id ?? this.id,
    encuestador: encuestador ?? this.encuestador,
    participante: participante ?? this.participante,
    edad: edad.present ? edad.value : this.edad,
    discapacidad: discapacidad.present ? discapacidad.value : this.discapacidad,
    cedula: cedula.present ? cedula.value : this.cedula,
    fecha: fecha ?? this.fecha,
    puntajeTotal: puntajeTotal ?? this.puntajeTotal,
    nivelId: nivelId.present ? nivelId.value : this.nivelId,
    factoresCriticosJson: factoresCriticosJson ?? this.factoresCriticosJson,
    respuestasJson: respuestasJson ?? this.respuestasJson,
    estadoSync: estadoSync ?? this.estadoSync,
    datosSincronizados: datosSincronizados ?? this.datosSincronizados,
    syncError: syncError.present ? syncError.value : this.syncError,
    intentos: intentos ?? this.intentos,
    proximoIntentoEn: proximoIntentoEn.present
        ? proximoIntentoEn.value
        : this.proximoIntentoEn,
    creadoEn: creadoEn ?? this.creadoEn,
  );
  Encuesta copyWithCompanion(EncuestasCompanion data) {
    return Encuesta(
      id: data.id.present ? data.id.value : this.id,
      encuestador: data.encuestador.present
          ? data.encuestador.value
          : this.encuestador,
      participante: data.participante.present
          ? data.participante.value
          : this.participante,
      edad: data.edad.present ? data.edad.value : this.edad,
      discapacidad: data.discapacidad.present
          ? data.discapacidad.value
          : this.discapacidad,
      cedula: data.cedula.present ? data.cedula.value : this.cedula,
      fecha: data.fecha.present ? data.fecha.value : this.fecha,
      puntajeTotal: data.puntajeTotal.present
          ? data.puntajeTotal.value
          : this.puntajeTotal,
      nivelId: data.nivelId.present ? data.nivelId.value : this.nivelId,
      factoresCriticosJson: data.factoresCriticosJson.present
          ? data.factoresCriticosJson.value
          : this.factoresCriticosJson,
      respuestasJson: data.respuestasJson.present
          ? data.respuestasJson.value
          : this.respuestasJson,
      estadoSync: data.estadoSync.present
          ? data.estadoSync.value
          : this.estadoSync,
      datosSincronizados: data.datosSincronizados.present
          ? data.datosSincronizados.value
          : this.datosSincronizados,
      syncError: data.syncError.present ? data.syncError.value : this.syncError,
      intentos: data.intentos.present ? data.intentos.value : this.intentos,
      proximoIntentoEn: data.proximoIntentoEn.present
          ? data.proximoIntentoEn.value
          : this.proximoIntentoEn,
      creadoEn: data.creadoEn.present ? data.creadoEn.value : this.creadoEn,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Encuesta(')
          ..write('id: $id, ')
          ..write('encuestador: $encuestador, ')
          ..write('participante: $participante, ')
          ..write('edad: $edad, ')
          ..write('discapacidad: $discapacidad, ')
          ..write('cedula: $cedula, ')
          ..write('fecha: $fecha, ')
          ..write('puntajeTotal: $puntajeTotal, ')
          ..write('nivelId: $nivelId, ')
          ..write('factoresCriticosJson: $factoresCriticosJson, ')
          ..write('respuestasJson: $respuestasJson, ')
          ..write('estadoSync: $estadoSync, ')
          ..write('datosSincronizados: $datosSincronizados, ')
          ..write('syncError: $syncError, ')
          ..write('intentos: $intentos, ')
          ..write('proximoIntentoEn: $proximoIntentoEn, ')
          ..write('creadoEn: $creadoEn')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    encuestador,
    participante,
    edad,
    discapacidad,
    cedula,
    fecha,
    puntajeTotal,
    nivelId,
    factoresCriticosJson,
    respuestasJson,
    estadoSync,
    datosSincronizados,
    syncError,
    intentos,
    proximoIntentoEn,
    creadoEn,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Encuesta &&
          other.id == this.id &&
          other.encuestador == this.encuestador &&
          other.participante == this.participante &&
          other.edad == this.edad &&
          other.discapacidad == this.discapacidad &&
          other.cedula == this.cedula &&
          other.fecha == this.fecha &&
          other.puntajeTotal == this.puntajeTotal &&
          other.nivelId == this.nivelId &&
          other.factoresCriticosJson == this.factoresCriticosJson &&
          other.respuestasJson == this.respuestasJson &&
          other.estadoSync == this.estadoSync &&
          other.datosSincronizados == this.datosSincronizados &&
          other.syncError == this.syncError &&
          other.intentos == this.intentos &&
          other.proximoIntentoEn == this.proximoIntentoEn &&
          other.creadoEn == this.creadoEn);
}

class EncuestasCompanion extends UpdateCompanion<Encuesta> {
  final Value<String> id;
  final Value<String> encuestador;
  final Value<String> participante;
  final Value<int?> edad;
  final Value<String?> discapacidad;
  final Value<String?> cedula;
  final Value<String> fecha;
  final Value<double> puntajeTotal;
  final Value<String?> nivelId;
  final Value<String> factoresCriticosJson;
  final Value<String> respuestasJson;
  final Value<EstadoSync> estadoSync;
  final Value<bool> datosSincronizados;
  final Value<String?> syncError;
  final Value<int> intentos;
  final Value<DateTime?> proximoIntentoEn;
  final Value<DateTime> creadoEn;
  final Value<int> rowid;
  const EncuestasCompanion({
    this.id = const Value.absent(),
    this.encuestador = const Value.absent(),
    this.participante = const Value.absent(),
    this.edad = const Value.absent(),
    this.discapacidad = const Value.absent(),
    this.cedula = const Value.absent(),
    this.fecha = const Value.absent(),
    this.puntajeTotal = const Value.absent(),
    this.nivelId = const Value.absent(),
    this.factoresCriticosJson = const Value.absent(),
    this.respuestasJson = const Value.absent(),
    this.estadoSync = const Value.absent(),
    this.datosSincronizados = const Value.absent(),
    this.syncError = const Value.absent(),
    this.intentos = const Value.absent(),
    this.proximoIntentoEn = const Value.absent(),
    this.creadoEn = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  EncuestasCompanion.insert({
    required String id,
    required String encuestador,
    required String participante,
    this.edad = const Value.absent(),
    this.discapacidad = const Value.absent(),
    this.cedula = const Value.absent(),
    required String fecha,
    required double puntajeTotal,
    this.nivelId = const Value.absent(),
    this.factoresCriticosJson = const Value.absent(),
    required String respuestasJson,
    this.estadoSync = const Value.absent(),
    this.datosSincronizados = const Value.absent(),
    this.syncError = const Value.absent(),
    this.intentos = const Value.absent(),
    this.proximoIntentoEn = const Value.absent(),
    this.creadoEn = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       encuestador = Value(encuestador),
       participante = Value(participante),
       fecha = Value(fecha),
       puntajeTotal = Value(puntajeTotal),
       respuestasJson = Value(respuestasJson);
  static Insertable<Encuesta> custom({
    Expression<String>? id,
    Expression<String>? encuestador,
    Expression<String>? participante,
    Expression<int>? edad,
    Expression<String>? discapacidad,
    Expression<String>? cedula,
    Expression<String>? fecha,
    Expression<double>? puntajeTotal,
    Expression<String>? nivelId,
    Expression<String>? factoresCriticosJson,
    Expression<String>? respuestasJson,
    Expression<String>? estadoSync,
    Expression<bool>? datosSincronizados,
    Expression<String>? syncError,
    Expression<int>? intentos,
    Expression<DateTime>? proximoIntentoEn,
    Expression<DateTime>? creadoEn,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (encuestador != null) 'encuestador': encuestador,
      if (participante != null) 'participante': participante,
      if (edad != null) 'edad': edad,
      if (discapacidad != null) 'discapacidad': discapacidad,
      if (cedula != null) 'cedula': cedula,
      if (fecha != null) 'fecha': fecha,
      if (puntajeTotal != null) 'puntaje_total': puntajeTotal,
      if (nivelId != null) 'nivel_id': nivelId,
      if (factoresCriticosJson != null)
        'factores_criticos_json': factoresCriticosJson,
      if (respuestasJson != null) 'respuestas_json': respuestasJson,
      if (estadoSync != null) 'estado_sync': estadoSync,
      if (datosSincronizados != null) 'datos_sincronizados': datosSincronizados,
      if (syncError != null) 'sync_error': syncError,
      if (intentos != null) 'intentos': intentos,
      if (proximoIntentoEn != null) 'proximo_intento_en': proximoIntentoEn,
      if (creadoEn != null) 'creado_en': creadoEn,
      if (rowid != null) 'rowid': rowid,
    });
  }

  EncuestasCompanion copyWith({
    Value<String>? id,
    Value<String>? encuestador,
    Value<String>? participante,
    Value<int?>? edad,
    Value<String?>? discapacidad,
    Value<String?>? cedula,
    Value<String>? fecha,
    Value<double>? puntajeTotal,
    Value<String?>? nivelId,
    Value<String>? factoresCriticosJson,
    Value<String>? respuestasJson,
    Value<EstadoSync>? estadoSync,
    Value<bool>? datosSincronizados,
    Value<String?>? syncError,
    Value<int>? intentos,
    Value<DateTime?>? proximoIntentoEn,
    Value<DateTime>? creadoEn,
    Value<int>? rowid,
  }) {
    return EncuestasCompanion(
      id: id ?? this.id,
      encuestador: encuestador ?? this.encuestador,
      participante: participante ?? this.participante,
      edad: edad ?? this.edad,
      discapacidad: discapacidad ?? this.discapacidad,
      cedula: cedula ?? this.cedula,
      fecha: fecha ?? this.fecha,
      puntajeTotal: puntajeTotal ?? this.puntajeTotal,
      nivelId: nivelId ?? this.nivelId,
      factoresCriticosJson: factoresCriticosJson ?? this.factoresCriticosJson,
      respuestasJson: respuestasJson ?? this.respuestasJson,
      estadoSync: estadoSync ?? this.estadoSync,
      datosSincronizados: datosSincronizados ?? this.datosSincronizados,
      syncError: syncError ?? this.syncError,
      intentos: intentos ?? this.intentos,
      proximoIntentoEn: proximoIntentoEn ?? this.proximoIntentoEn,
      creadoEn: creadoEn ?? this.creadoEn,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (encuestador.present) {
      map['encuestador'] = Variable<String>(encuestador.value);
    }
    if (participante.present) {
      map['participante'] = Variable<String>(participante.value);
    }
    if (edad.present) {
      map['edad'] = Variable<int>(edad.value);
    }
    if (discapacidad.present) {
      map['discapacidad'] = Variable<String>(discapacidad.value);
    }
    if (cedula.present) {
      map['cedula'] = Variable<String>(cedula.value);
    }
    if (fecha.present) {
      map['fecha'] = Variable<String>(fecha.value);
    }
    if (puntajeTotal.present) {
      map['puntaje_total'] = Variable<double>(puntajeTotal.value);
    }
    if (nivelId.present) {
      map['nivel_id'] = Variable<String>(nivelId.value);
    }
    if (factoresCriticosJson.present) {
      map['factores_criticos_json'] = Variable<String>(
        factoresCriticosJson.value,
      );
    }
    if (respuestasJson.present) {
      map['respuestas_json'] = Variable<String>(respuestasJson.value);
    }
    if (estadoSync.present) {
      map['estado_sync'] = Variable<String>(
        $EncuestasTable.$converterestadoSync.toSql(estadoSync.value),
      );
    }
    if (datosSincronizados.present) {
      map['datos_sincronizados'] = Variable<bool>(datosSincronizados.value);
    }
    if (syncError.present) {
      map['sync_error'] = Variable<String>(syncError.value);
    }
    if (intentos.present) {
      map['intentos'] = Variable<int>(intentos.value);
    }
    if (proximoIntentoEn.present) {
      map['proximo_intento_en'] = Variable<DateTime>(proximoIntentoEn.value);
    }
    if (creadoEn.present) {
      map['creado_en'] = Variable<DateTime>(creadoEn.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('EncuestasCompanion(')
          ..write('id: $id, ')
          ..write('encuestador: $encuestador, ')
          ..write('participante: $participante, ')
          ..write('edad: $edad, ')
          ..write('discapacidad: $discapacidad, ')
          ..write('cedula: $cedula, ')
          ..write('fecha: $fecha, ')
          ..write('puntajeTotal: $puntajeTotal, ')
          ..write('nivelId: $nivelId, ')
          ..write('factoresCriticosJson: $factoresCriticosJson, ')
          ..write('respuestasJson: $respuestasJson, ')
          ..write('estadoSync: $estadoSync, ')
          ..write('datosSincronizados: $datosSincronizados, ')
          ..write('syncError: $syncError, ')
          ..write('intentos: $intentos, ')
          ..write('proximoIntentoEn: $proximoIntentoEn, ')
          ..write('creadoEn: $creadoEn, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $FotosTable extends Fotos with TableInfo<$FotosTable, Foto> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $FotosTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _encuestaIdMeta = const VerificationMeta(
    'encuestaId',
  );
  @override
  late final GeneratedColumn<String> encuestaId = GeneratedColumn<String>(
    'encuesta_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _tipoMeta = const VerificationMeta('tipo');
  @override
  late final GeneratedColumn<String> tipo = GeneratedColumn<String>(
    'tipo',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _bytesMeta = const VerificationMeta('bytes');
  @override
  late final GeneratedColumn<Uint8List> bytes = GeneratedColumn<Uint8List>(
    'bytes',
    aliasedName,
    true,
    type: DriftSqlType.blob,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _mimeTypeMeta = const VerificationMeta(
    'mimeType',
  );
  @override
  late final GeneratedColumn<String> mimeType = GeneratedColumn<String>(
    'mime_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _storagePathMeta = const VerificationMeta(
    'storagePath',
  );
  @override
  late final GeneratedColumn<String> storagePath = GeneratedColumn<String>(
    'storage_path',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _subidaMeta = const VerificationMeta('subida');
  @override
  late final GeneratedColumn<bool> subida = GeneratedColumn<bool>(
    'subida',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("subida" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _intentosMeta = const VerificationMeta(
    'intentos',
  );
  @override
  late final GeneratedColumn<int> intentos = GeneratedColumn<int>(
    'intentos',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _proximoIntentoEnMeta = const VerificationMeta(
    'proximoIntentoEn',
  );
  @override
  late final GeneratedColumn<DateTime> proximoIntentoEn =
      GeneratedColumn<DateTime>(
        'proximo_intento_en',
        aliasedName,
        true,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _syncErrorMeta = const VerificationMeta(
    'syncError',
  );
  @override
  late final GeneratedColumn<String> syncError = GeneratedColumn<String>(
    'sync_error',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    encuestaId,
    tipo,
    bytes,
    mimeType,
    storagePath,
    subida,
    intentos,
    proximoIntentoEn,
    syncError,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'fotos';
  @override
  VerificationContext validateIntegrity(
    Insertable<Foto> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('encuesta_id')) {
      context.handle(
        _encuestaIdMeta,
        encuestaId.isAcceptableOrUnknown(data['encuesta_id']!, _encuestaIdMeta),
      );
    } else if (isInserting) {
      context.missing(_encuestaIdMeta);
    }
    if (data.containsKey('tipo')) {
      context.handle(
        _tipoMeta,
        tipo.isAcceptableOrUnknown(data['tipo']!, _tipoMeta),
      );
    } else if (isInserting) {
      context.missing(_tipoMeta);
    }
    if (data.containsKey('bytes')) {
      context.handle(
        _bytesMeta,
        bytes.isAcceptableOrUnknown(data['bytes']!, _bytesMeta),
      );
    }
    if (data.containsKey('mime_type')) {
      context.handle(
        _mimeTypeMeta,
        mimeType.isAcceptableOrUnknown(data['mime_type']!, _mimeTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_mimeTypeMeta);
    }
    if (data.containsKey('storage_path')) {
      context.handle(
        _storagePathMeta,
        storagePath.isAcceptableOrUnknown(
          data['storage_path']!,
          _storagePathMeta,
        ),
      );
    }
    if (data.containsKey('subida')) {
      context.handle(
        _subidaMeta,
        subida.isAcceptableOrUnknown(data['subida']!, _subidaMeta),
      );
    }
    if (data.containsKey('intentos')) {
      context.handle(
        _intentosMeta,
        intentos.isAcceptableOrUnknown(data['intentos']!, _intentosMeta),
      );
    }
    if (data.containsKey('proximo_intento_en')) {
      context.handle(
        _proximoIntentoEnMeta,
        proximoIntentoEn.isAcceptableOrUnknown(
          data['proximo_intento_en']!,
          _proximoIntentoEnMeta,
        ),
      );
    }
    if (data.containsKey('sync_error')) {
      context.handle(
        _syncErrorMeta,
        syncError.isAcceptableOrUnknown(data['sync_error']!, _syncErrorMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  List<Set<GeneratedColumn>> get uniqueKeys => [
    {encuestaId, tipo},
  ];
  @override
  Foto map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Foto(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      encuestaId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}encuesta_id'],
      )!,
      tipo: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}tipo'],
      )!,
      bytes: attachedDatabase.typeMapping.read(
        DriftSqlType.blob,
        data['${effectivePrefix}bytes'],
      ),
      mimeType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}mime_type'],
      )!,
      storagePath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}storage_path'],
      ),
      subida: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}subida'],
      )!,
      intentos: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}intentos'],
      )!,
      proximoIntentoEn: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}proximo_intento_en'],
      ),
      syncError: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_error'],
      ),
    );
  }

  @override
  $FotosTable createAlias(String alias) {
    return $FotosTable(attachedDatabase, alias);
  }
}

class Foto extends DataClass implements Insertable<Foto> {
  final int id;
  final String encuestaId;
  final String tipo;
  final Uint8List? bytes;
  final String mimeType;
  final String? storagePath;
  final bool subida;
  final int intentos;
  final DateTime? proximoIntentoEn;
  final String? syncError;
  const Foto({
    required this.id,
    required this.encuestaId,
    required this.tipo,
    this.bytes,
    required this.mimeType,
    this.storagePath,
    required this.subida,
    required this.intentos,
    this.proximoIntentoEn,
    this.syncError,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['encuesta_id'] = Variable<String>(encuestaId);
    map['tipo'] = Variable<String>(tipo);
    if (!nullToAbsent || bytes != null) {
      map['bytes'] = Variable<Uint8List>(bytes);
    }
    map['mime_type'] = Variable<String>(mimeType);
    if (!nullToAbsent || storagePath != null) {
      map['storage_path'] = Variable<String>(storagePath);
    }
    map['subida'] = Variable<bool>(subida);
    map['intentos'] = Variable<int>(intentos);
    if (!nullToAbsent || proximoIntentoEn != null) {
      map['proximo_intento_en'] = Variable<DateTime>(proximoIntentoEn);
    }
    if (!nullToAbsent || syncError != null) {
      map['sync_error'] = Variable<String>(syncError);
    }
    return map;
  }

  FotosCompanion toCompanion(bool nullToAbsent) {
    return FotosCompanion(
      id: Value(id),
      encuestaId: Value(encuestaId),
      tipo: Value(tipo),
      bytes: bytes == null && nullToAbsent
          ? const Value.absent()
          : Value(bytes),
      mimeType: Value(mimeType),
      storagePath: storagePath == null && nullToAbsent
          ? const Value.absent()
          : Value(storagePath),
      subida: Value(subida),
      intentos: Value(intentos),
      proximoIntentoEn: proximoIntentoEn == null && nullToAbsent
          ? const Value.absent()
          : Value(proximoIntentoEn),
      syncError: syncError == null && nullToAbsent
          ? const Value.absent()
          : Value(syncError),
    );
  }

  factory Foto.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Foto(
      id: serializer.fromJson<int>(json['id']),
      encuestaId: serializer.fromJson<String>(json['encuestaId']),
      tipo: serializer.fromJson<String>(json['tipo']),
      bytes: serializer.fromJson<Uint8List?>(json['bytes']),
      mimeType: serializer.fromJson<String>(json['mimeType']),
      storagePath: serializer.fromJson<String?>(json['storagePath']),
      subida: serializer.fromJson<bool>(json['subida']),
      intentos: serializer.fromJson<int>(json['intentos']),
      proximoIntentoEn: serializer.fromJson<DateTime?>(
        json['proximoIntentoEn'],
      ),
      syncError: serializer.fromJson<String?>(json['syncError']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'encuestaId': serializer.toJson<String>(encuestaId),
      'tipo': serializer.toJson<String>(tipo),
      'bytes': serializer.toJson<Uint8List?>(bytes),
      'mimeType': serializer.toJson<String>(mimeType),
      'storagePath': serializer.toJson<String?>(storagePath),
      'subida': serializer.toJson<bool>(subida),
      'intentos': serializer.toJson<int>(intentos),
      'proximoIntentoEn': serializer.toJson<DateTime?>(proximoIntentoEn),
      'syncError': serializer.toJson<String?>(syncError),
    };
  }

  Foto copyWith({
    int? id,
    String? encuestaId,
    String? tipo,
    Value<Uint8List?> bytes = const Value.absent(),
    String? mimeType,
    Value<String?> storagePath = const Value.absent(),
    bool? subida,
    int? intentos,
    Value<DateTime?> proximoIntentoEn = const Value.absent(),
    Value<String?> syncError = const Value.absent(),
  }) => Foto(
    id: id ?? this.id,
    encuestaId: encuestaId ?? this.encuestaId,
    tipo: tipo ?? this.tipo,
    bytes: bytes.present ? bytes.value : this.bytes,
    mimeType: mimeType ?? this.mimeType,
    storagePath: storagePath.present ? storagePath.value : this.storagePath,
    subida: subida ?? this.subida,
    intentos: intentos ?? this.intentos,
    proximoIntentoEn: proximoIntentoEn.present
        ? proximoIntentoEn.value
        : this.proximoIntentoEn,
    syncError: syncError.present ? syncError.value : this.syncError,
  );
  Foto copyWithCompanion(FotosCompanion data) {
    return Foto(
      id: data.id.present ? data.id.value : this.id,
      encuestaId: data.encuestaId.present
          ? data.encuestaId.value
          : this.encuestaId,
      tipo: data.tipo.present ? data.tipo.value : this.tipo,
      bytes: data.bytes.present ? data.bytes.value : this.bytes,
      mimeType: data.mimeType.present ? data.mimeType.value : this.mimeType,
      storagePath: data.storagePath.present
          ? data.storagePath.value
          : this.storagePath,
      subida: data.subida.present ? data.subida.value : this.subida,
      intentos: data.intentos.present ? data.intentos.value : this.intentos,
      proximoIntentoEn: data.proximoIntentoEn.present
          ? data.proximoIntentoEn.value
          : this.proximoIntentoEn,
      syncError: data.syncError.present ? data.syncError.value : this.syncError,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Foto(')
          ..write('id: $id, ')
          ..write('encuestaId: $encuestaId, ')
          ..write('tipo: $tipo, ')
          ..write('bytes: $bytes, ')
          ..write('mimeType: $mimeType, ')
          ..write('storagePath: $storagePath, ')
          ..write('subida: $subida, ')
          ..write('intentos: $intentos, ')
          ..write('proximoIntentoEn: $proximoIntentoEn, ')
          ..write('syncError: $syncError')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    encuestaId,
    tipo,
    $driftBlobEquality.hash(bytes),
    mimeType,
    storagePath,
    subida,
    intentos,
    proximoIntentoEn,
    syncError,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Foto &&
          other.id == this.id &&
          other.encuestaId == this.encuestaId &&
          other.tipo == this.tipo &&
          $driftBlobEquality.equals(other.bytes, this.bytes) &&
          other.mimeType == this.mimeType &&
          other.storagePath == this.storagePath &&
          other.subida == this.subida &&
          other.intentos == this.intentos &&
          other.proximoIntentoEn == this.proximoIntentoEn &&
          other.syncError == this.syncError);
}

class FotosCompanion extends UpdateCompanion<Foto> {
  final Value<int> id;
  final Value<String> encuestaId;
  final Value<String> tipo;
  final Value<Uint8List?> bytes;
  final Value<String> mimeType;
  final Value<String?> storagePath;
  final Value<bool> subida;
  final Value<int> intentos;
  final Value<DateTime?> proximoIntentoEn;
  final Value<String?> syncError;
  const FotosCompanion({
    this.id = const Value.absent(),
    this.encuestaId = const Value.absent(),
    this.tipo = const Value.absent(),
    this.bytes = const Value.absent(),
    this.mimeType = const Value.absent(),
    this.storagePath = const Value.absent(),
    this.subida = const Value.absent(),
    this.intentos = const Value.absent(),
    this.proximoIntentoEn = const Value.absent(),
    this.syncError = const Value.absent(),
  });
  FotosCompanion.insert({
    this.id = const Value.absent(),
    required String encuestaId,
    required String tipo,
    this.bytes = const Value.absent(),
    required String mimeType,
    this.storagePath = const Value.absent(),
    this.subida = const Value.absent(),
    this.intentos = const Value.absent(),
    this.proximoIntentoEn = const Value.absent(),
    this.syncError = const Value.absent(),
  }) : encuestaId = Value(encuestaId),
       tipo = Value(tipo),
       mimeType = Value(mimeType);
  static Insertable<Foto> custom({
    Expression<int>? id,
    Expression<String>? encuestaId,
    Expression<String>? tipo,
    Expression<Uint8List>? bytes,
    Expression<String>? mimeType,
    Expression<String>? storagePath,
    Expression<bool>? subida,
    Expression<int>? intentos,
    Expression<DateTime>? proximoIntentoEn,
    Expression<String>? syncError,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (encuestaId != null) 'encuesta_id': encuestaId,
      if (tipo != null) 'tipo': tipo,
      if (bytes != null) 'bytes': bytes,
      if (mimeType != null) 'mime_type': mimeType,
      if (storagePath != null) 'storage_path': storagePath,
      if (subida != null) 'subida': subida,
      if (intentos != null) 'intentos': intentos,
      if (proximoIntentoEn != null) 'proximo_intento_en': proximoIntentoEn,
      if (syncError != null) 'sync_error': syncError,
    });
  }

  FotosCompanion copyWith({
    Value<int>? id,
    Value<String>? encuestaId,
    Value<String>? tipo,
    Value<Uint8List?>? bytes,
    Value<String>? mimeType,
    Value<String?>? storagePath,
    Value<bool>? subida,
    Value<int>? intentos,
    Value<DateTime?>? proximoIntentoEn,
    Value<String?>? syncError,
  }) {
    return FotosCompanion(
      id: id ?? this.id,
      encuestaId: encuestaId ?? this.encuestaId,
      tipo: tipo ?? this.tipo,
      bytes: bytes ?? this.bytes,
      mimeType: mimeType ?? this.mimeType,
      storagePath: storagePath ?? this.storagePath,
      subida: subida ?? this.subida,
      intentos: intentos ?? this.intentos,
      proximoIntentoEn: proximoIntentoEn ?? this.proximoIntentoEn,
      syncError: syncError ?? this.syncError,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (encuestaId.present) {
      map['encuesta_id'] = Variable<String>(encuestaId.value);
    }
    if (tipo.present) {
      map['tipo'] = Variable<String>(tipo.value);
    }
    if (bytes.present) {
      map['bytes'] = Variable<Uint8List>(bytes.value);
    }
    if (mimeType.present) {
      map['mime_type'] = Variable<String>(mimeType.value);
    }
    if (storagePath.present) {
      map['storage_path'] = Variable<String>(storagePath.value);
    }
    if (subida.present) {
      map['subida'] = Variable<bool>(subida.value);
    }
    if (intentos.present) {
      map['intentos'] = Variable<int>(intentos.value);
    }
    if (proximoIntentoEn.present) {
      map['proximo_intento_en'] = Variable<DateTime>(proximoIntentoEn.value);
    }
    if (syncError.present) {
      map['sync_error'] = Variable<String>(syncError.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('FotosCompanion(')
          ..write('id: $id, ')
          ..write('encuestaId: $encuestaId, ')
          ..write('tipo: $tipo, ')
          ..write('bytes: $bytes, ')
          ..write('mimeType: $mimeType, ')
          ..write('storagePath: $storagePath, ')
          ..write('subida: $subida, ')
          ..write('intentos: $intentos, ')
          ..write('proximoIntentoEn: $proximoIntentoEn, ')
          ..write('syncError: $syncError')
          ..write(')'))
        .toString();
  }
}

class $ConfigCacheTable extends ConfigCache
    with TableInfo<$ConfigCacheTable, ConfigCacheData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ConfigCacheTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _jsonMeta = const VerificationMeta('json');
  @override
  late final GeneratedColumn<String> json = GeneratedColumn<String>(
    'json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _actualizadoEnMeta = const VerificationMeta(
    'actualizadoEn',
  );
  @override
  late final GeneratedColumn<DateTime> actualizadoEn =
      GeneratedColumn<DateTime>(
        'actualizado_en',
        aliasedName,
        false,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
        defaultValue: currentDateAndTime,
      );
  @override
  List<GeneratedColumn> get $columns => [id, json, actualizadoEn];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'config_cache';
  @override
  VerificationContext validateIntegrity(
    Insertable<ConfigCacheData> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('json')) {
      context.handle(
        _jsonMeta,
        json.isAcceptableOrUnknown(data['json']!, _jsonMeta),
      );
    } else if (isInserting) {
      context.missing(_jsonMeta);
    }
    if (data.containsKey('actualizado_en')) {
      context.handle(
        _actualizadoEnMeta,
        actualizadoEn.isAcceptableOrUnknown(
          data['actualizado_en']!,
          _actualizadoEnMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ConfigCacheData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ConfigCacheData(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      json: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}json'],
      )!,
      actualizadoEn: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}actualizado_en'],
      )!,
    );
  }

  @override
  $ConfigCacheTable createAlias(String alias) {
    return $ConfigCacheTable(attachedDatabase, alias);
  }
}

class ConfigCacheData extends DataClass implements Insertable<ConfigCacheData> {
  final int id;
  final String json;
  final DateTime actualizadoEn;
  const ConfigCacheData({
    required this.id,
    required this.json,
    required this.actualizadoEn,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['json'] = Variable<String>(json);
    map['actualizado_en'] = Variable<DateTime>(actualizadoEn);
    return map;
  }

  ConfigCacheCompanion toCompanion(bool nullToAbsent) {
    return ConfigCacheCompanion(
      id: Value(id),
      json: Value(json),
      actualizadoEn: Value(actualizadoEn),
    );
  }

  factory ConfigCacheData.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ConfigCacheData(
      id: serializer.fromJson<int>(json['id']),
      json: serializer.fromJson<String>(json['json']),
      actualizadoEn: serializer.fromJson<DateTime>(json['actualizadoEn']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'json': serializer.toJson<String>(json),
      'actualizadoEn': serializer.toJson<DateTime>(actualizadoEn),
    };
  }

  ConfigCacheData copyWith({int? id, String? json, DateTime? actualizadoEn}) =>
      ConfigCacheData(
        id: id ?? this.id,
        json: json ?? this.json,
        actualizadoEn: actualizadoEn ?? this.actualizadoEn,
      );
  ConfigCacheData copyWithCompanion(ConfigCacheCompanion data) {
    return ConfigCacheData(
      id: data.id.present ? data.id.value : this.id,
      json: data.json.present ? data.json.value : this.json,
      actualizadoEn: data.actualizadoEn.present
          ? data.actualizadoEn.value
          : this.actualizadoEn,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ConfigCacheData(')
          ..write('id: $id, ')
          ..write('json: $json, ')
          ..write('actualizadoEn: $actualizadoEn')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, json, actualizadoEn);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ConfigCacheData &&
          other.id == this.id &&
          other.json == this.json &&
          other.actualizadoEn == this.actualizadoEn);
}

class ConfigCacheCompanion extends UpdateCompanion<ConfigCacheData> {
  final Value<int> id;
  final Value<String> json;
  final Value<DateTime> actualizadoEn;
  const ConfigCacheCompanion({
    this.id = const Value.absent(),
    this.json = const Value.absent(),
    this.actualizadoEn = const Value.absent(),
  });
  ConfigCacheCompanion.insert({
    this.id = const Value.absent(),
    required String json,
    this.actualizadoEn = const Value.absent(),
  }) : json = Value(json);
  static Insertable<ConfigCacheData> custom({
    Expression<int>? id,
    Expression<String>? json,
    Expression<DateTime>? actualizadoEn,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (json != null) 'json': json,
      if (actualizadoEn != null) 'actualizado_en': actualizadoEn,
    });
  }

  ConfigCacheCompanion copyWith({
    Value<int>? id,
    Value<String>? json,
    Value<DateTime>? actualizadoEn,
  }) {
    return ConfigCacheCompanion(
      id: id ?? this.id,
      json: json ?? this.json,
      actualizadoEn: actualizadoEn ?? this.actualizadoEn,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (json.present) {
      map['json'] = Variable<String>(json.value);
    }
    if (actualizadoEn.present) {
      map['actualizado_en'] = Variable<DateTime>(actualizadoEn.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ConfigCacheCompanion(')
          ..write('id: $id, ')
          ..write('json: $json, ')
          ..write('actualizadoEn: $actualizadoEn')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $EncuestasTable encuestas = $EncuestasTable(this);
  late final $FotosTable fotos = $FotosTable(this);
  late final $ConfigCacheTable configCache = $ConfigCacheTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    encuestas,
    fotos,
    configCache,
  ];
}

typedef $$EncuestasTableCreateCompanionBuilder =
    EncuestasCompanion Function({
      required String id,
      required String encuestador,
      required String participante,
      Value<int?> edad,
      Value<String?> discapacidad,
      Value<String?> cedula,
      required String fecha,
      required double puntajeTotal,
      Value<String?> nivelId,
      Value<String> factoresCriticosJson,
      required String respuestasJson,
      Value<EstadoSync> estadoSync,
      Value<bool> datosSincronizados,
      Value<String?> syncError,
      Value<int> intentos,
      Value<DateTime?> proximoIntentoEn,
      Value<DateTime> creadoEn,
      Value<int> rowid,
    });
typedef $$EncuestasTableUpdateCompanionBuilder =
    EncuestasCompanion Function({
      Value<String> id,
      Value<String> encuestador,
      Value<String> participante,
      Value<int?> edad,
      Value<String?> discapacidad,
      Value<String?> cedula,
      Value<String> fecha,
      Value<double> puntajeTotal,
      Value<String?> nivelId,
      Value<String> factoresCriticosJson,
      Value<String> respuestasJson,
      Value<EstadoSync> estadoSync,
      Value<bool> datosSincronizados,
      Value<String?> syncError,
      Value<int> intentos,
      Value<DateTime?> proximoIntentoEn,
      Value<DateTime> creadoEn,
      Value<int> rowid,
    });

class $$EncuestasTableFilterComposer
    extends Composer<_$AppDatabase, $EncuestasTable> {
  $$EncuestasTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get encuestador => $composableBuilder(
    column: $table.encuestador,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get participante => $composableBuilder(
    column: $table.participante,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get edad => $composableBuilder(
    column: $table.edad,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get discapacidad => $composableBuilder(
    column: $table.discapacidad,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get cedula => $composableBuilder(
    column: $table.cedula,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get fecha => $composableBuilder(
    column: $table.fecha,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get puntajeTotal => $composableBuilder(
    column: $table.puntajeTotal,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nivelId => $composableBuilder(
    column: $table.nivelId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get factoresCriticosJson => $composableBuilder(
    column: $table.factoresCriticosJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get respuestasJson => $composableBuilder(
    column: $table.respuestasJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<EstadoSync, EstadoSync, String>
  get estadoSync => $composableBuilder(
    column: $table.estadoSync,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnFilters<bool> get datosSincronizados => $composableBuilder(
    column: $table.datosSincronizados,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get intentos => $composableBuilder(
    column: $table.intentos,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get proximoIntentoEn => $composableBuilder(
    column: $table.proximoIntentoEn,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get creadoEn => $composableBuilder(
    column: $table.creadoEn,
    builder: (column) => ColumnFilters(column),
  );
}

class $$EncuestasTableOrderingComposer
    extends Composer<_$AppDatabase, $EncuestasTable> {
  $$EncuestasTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get encuestador => $composableBuilder(
    column: $table.encuestador,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get participante => $composableBuilder(
    column: $table.participante,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get edad => $composableBuilder(
    column: $table.edad,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get discapacidad => $composableBuilder(
    column: $table.discapacidad,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get cedula => $composableBuilder(
    column: $table.cedula,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get fecha => $composableBuilder(
    column: $table.fecha,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get puntajeTotal => $composableBuilder(
    column: $table.puntajeTotal,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nivelId => $composableBuilder(
    column: $table.nivelId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get factoresCriticosJson => $composableBuilder(
    column: $table.factoresCriticosJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get respuestasJson => $composableBuilder(
    column: $table.respuestasJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get estadoSync => $composableBuilder(
    column: $table.estadoSync,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get datosSincronizados => $composableBuilder(
    column: $table.datosSincronizados,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get intentos => $composableBuilder(
    column: $table.intentos,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get proximoIntentoEn => $composableBuilder(
    column: $table.proximoIntentoEn,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get creadoEn => $composableBuilder(
    column: $table.creadoEn,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$EncuestasTableAnnotationComposer
    extends Composer<_$AppDatabase, $EncuestasTable> {
  $$EncuestasTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get encuestador => $composableBuilder(
    column: $table.encuestador,
    builder: (column) => column,
  );

  GeneratedColumn<String> get participante => $composableBuilder(
    column: $table.participante,
    builder: (column) => column,
  );

  GeneratedColumn<int> get edad =>
      $composableBuilder(column: $table.edad, builder: (column) => column);

  GeneratedColumn<String> get discapacidad => $composableBuilder(
    column: $table.discapacidad,
    builder: (column) => column,
  );

  GeneratedColumn<String> get cedula =>
      $composableBuilder(column: $table.cedula, builder: (column) => column);

  GeneratedColumn<String> get fecha =>
      $composableBuilder(column: $table.fecha, builder: (column) => column);

  GeneratedColumn<double> get puntajeTotal => $composableBuilder(
    column: $table.puntajeTotal,
    builder: (column) => column,
  );

  GeneratedColumn<String> get nivelId =>
      $composableBuilder(column: $table.nivelId, builder: (column) => column);

  GeneratedColumn<String> get factoresCriticosJson => $composableBuilder(
    column: $table.factoresCriticosJson,
    builder: (column) => column,
  );

  GeneratedColumn<String> get respuestasJson => $composableBuilder(
    column: $table.respuestasJson,
    builder: (column) => column,
  );

  GeneratedColumnWithTypeConverter<EstadoSync, String> get estadoSync =>
      $composableBuilder(
        column: $table.estadoSync,
        builder: (column) => column,
      );

  GeneratedColumn<bool> get datosSincronizados => $composableBuilder(
    column: $table.datosSincronizados,
    builder: (column) => column,
  );

  GeneratedColumn<String> get syncError =>
      $composableBuilder(column: $table.syncError, builder: (column) => column);

  GeneratedColumn<int> get intentos =>
      $composableBuilder(column: $table.intentos, builder: (column) => column);

  GeneratedColumn<DateTime> get proximoIntentoEn => $composableBuilder(
    column: $table.proximoIntentoEn,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get creadoEn =>
      $composableBuilder(column: $table.creadoEn, builder: (column) => column);
}

class $$EncuestasTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $EncuestasTable,
          Encuesta,
          $$EncuestasTableFilterComposer,
          $$EncuestasTableOrderingComposer,
          $$EncuestasTableAnnotationComposer,
          $$EncuestasTableCreateCompanionBuilder,
          $$EncuestasTableUpdateCompanionBuilder,
          (Encuesta, BaseReferences<_$AppDatabase, $EncuestasTable, Encuesta>),
          Encuesta,
          PrefetchHooks Function()
        > {
  $$EncuestasTableTableManager(_$AppDatabase db, $EncuestasTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$EncuestasTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$EncuestasTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$EncuestasTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> encuestador = const Value.absent(),
                Value<String> participante = const Value.absent(),
                Value<int?> edad = const Value.absent(),
                Value<String?> discapacidad = const Value.absent(),
                Value<String?> cedula = const Value.absent(),
                Value<String> fecha = const Value.absent(),
                Value<double> puntajeTotal = const Value.absent(),
                Value<String?> nivelId = const Value.absent(),
                Value<String> factoresCriticosJson = const Value.absent(),
                Value<String> respuestasJson = const Value.absent(),
                Value<EstadoSync> estadoSync = const Value.absent(),
                Value<bool> datosSincronizados = const Value.absent(),
                Value<String?> syncError = const Value.absent(),
                Value<int> intentos = const Value.absent(),
                Value<DateTime?> proximoIntentoEn = const Value.absent(),
                Value<DateTime> creadoEn = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => EncuestasCompanion(
                id: id,
                encuestador: encuestador,
                participante: participante,
                edad: edad,
                discapacidad: discapacidad,
                cedula: cedula,
                fecha: fecha,
                puntajeTotal: puntajeTotal,
                nivelId: nivelId,
                factoresCriticosJson: factoresCriticosJson,
                respuestasJson: respuestasJson,
                estadoSync: estadoSync,
                datosSincronizados: datosSincronizados,
                syncError: syncError,
                intentos: intentos,
                proximoIntentoEn: proximoIntentoEn,
                creadoEn: creadoEn,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String encuestador,
                required String participante,
                Value<int?> edad = const Value.absent(),
                Value<String?> discapacidad = const Value.absent(),
                Value<String?> cedula = const Value.absent(),
                required String fecha,
                required double puntajeTotal,
                Value<String?> nivelId = const Value.absent(),
                Value<String> factoresCriticosJson = const Value.absent(),
                required String respuestasJson,
                Value<EstadoSync> estadoSync = const Value.absent(),
                Value<bool> datosSincronizados = const Value.absent(),
                Value<String?> syncError = const Value.absent(),
                Value<int> intentos = const Value.absent(),
                Value<DateTime?> proximoIntentoEn = const Value.absent(),
                Value<DateTime> creadoEn = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => EncuestasCompanion.insert(
                id: id,
                encuestador: encuestador,
                participante: participante,
                edad: edad,
                discapacidad: discapacidad,
                cedula: cedula,
                fecha: fecha,
                puntajeTotal: puntajeTotal,
                nivelId: nivelId,
                factoresCriticosJson: factoresCriticosJson,
                respuestasJson: respuestasJson,
                estadoSync: estadoSync,
                datosSincronizados: datosSincronizados,
                syncError: syncError,
                intentos: intentos,
                proximoIntentoEn: proximoIntentoEn,
                creadoEn: creadoEn,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$EncuestasTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $EncuestasTable,
      Encuesta,
      $$EncuestasTableFilterComposer,
      $$EncuestasTableOrderingComposer,
      $$EncuestasTableAnnotationComposer,
      $$EncuestasTableCreateCompanionBuilder,
      $$EncuestasTableUpdateCompanionBuilder,
      (Encuesta, BaseReferences<_$AppDatabase, $EncuestasTable, Encuesta>),
      Encuesta,
      PrefetchHooks Function()
    >;
typedef $$FotosTableCreateCompanionBuilder =
    FotosCompanion Function({
      Value<int> id,
      required String encuestaId,
      required String tipo,
      Value<Uint8List?> bytes,
      required String mimeType,
      Value<String?> storagePath,
      Value<bool> subida,
      Value<int> intentos,
      Value<DateTime?> proximoIntentoEn,
      Value<String?> syncError,
    });
typedef $$FotosTableUpdateCompanionBuilder =
    FotosCompanion Function({
      Value<int> id,
      Value<String> encuestaId,
      Value<String> tipo,
      Value<Uint8List?> bytes,
      Value<String> mimeType,
      Value<String?> storagePath,
      Value<bool> subida,
      Value<int> intentos,
      Value<DateTime?> proximoIntentoEn,
      Value<String?> syncError,
    });

class $$FotosTableFilterComposer extends Composer<_$AppDatabase, $FotosTable> {
  $$FotosTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get encuestaId => $composableBuilder(
    column: $table.encuestaId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get tipo => $composableBuilder(
    column: $table.tipo,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<Uint8List> get bytes => $composableBuilder(
    column: $table.bytes,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get mimeType => $composableBuilder(
    column: $table.mimeType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get storagePath => $composableBuilder(
    column: $table.storagePath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get subida => $composableBuilder(
    column: $table.subida,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get intentos => $composableBuilder(
    column: $table.intentos,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get proximoIntentoEn => $composableBuilder(
    column: $table.proximoIntentoEn,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnFilters(column),
  );
}

class $$FotosTableOrderingComposer
    extends Composer<_$AppDatabase, $FotosTable> {
  $$FotosTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get encuestaId => $composableBuilder(
    column: $table.encuestaId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get tipo => $composableBuilder(
    column: $table.tipo,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<Uint8List> get bytes => $composableBuilder(
    column: $table.bytes,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get mimeType => $composableBuilder(
    column: $table.mimeType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get storagePath => $composableBuilder(
    column: $table.storagePath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get subida => $composableBuilder(
    column: $table.subida,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get intentos => $composableBuilder(
    column: $table.intentos,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get proximoIntentoEn => $composableBuilder(
    column: $table.proximoIntentoEn,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$FotosTableAnnotationComposer
    extends Composer<_$AppDatabase, $FotosTable> {
  $$FotosTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get encuestaId => $composableBuilder(
    column: $table.encuestaId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get tipo =>
      $composableBuilder(column: $table.tipo, builder: (column) => column);

  GeneratedColumn<Uint8List> get bytes =>
      $composableBuilder(column: $table.bytes, builder: (column) => column);

  GeneratedColumn<String> get mimeType =>
      $composableBuilder(column: $table.mimeType, builder: (column) => column);

  GeneratedColumn<String> get storagePath => $composableBuilder(
    column: $table.storagePath,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get subida =>
      $composableBuilder(column: $table.subida, builder: (column) => column);

  GeneratedColumn<int> get intentos =>
      $composableBuilder(column: $table.intentos, builder: (column) => column);

  GeneratedColumn<DateTime> get proximoIntentoEn => $composableBuilder(
    column: $table.proximoIntentoEn,
    builder: (column) => column,
  );

  GeneratedColumn<String> get syncError =>
      $composableBuilder(column: $table.syncError, builder: (column) => column);
}

class $$FotosTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $FotosTable,
          Foto,
          $$FotosTableFilterComposer,
          $$FotosTableOrderingComposer,
          $$FotosTableAnnotationComposer,
          $$FotosTableCreateCompanionBuilder,
          $$FotosTableUpdateCompanionBuilder,
          (Foto, BaseReferences<_$AppDatabase, $FotosTable, Foto>),
          Foto,
          PrefetchHooks Function()
        > {
  $$FotosTableTableManager(_$AppDatabase db, $FotosTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$FotosTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$FotosTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$FotosTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> encuestaId = const Value.absent(),
                Value<String> tipo = const Value.absent(),
                Value<Uint8List?> bytes = const Value.absent(),
                Value<String> mimeType = const Value.absent(),
                Value<String?> storagePath = const Value.absent(),
                Value<bool> subida = const Value.absent(),
                Value<int> intentos = const Value.absent(),
                Value<DateTime?> proximoIntentoEn = const Value.absent(),
                Value<String?> syncError = const Value.absent(),
              }) => FotosCompanion(
                id: id,
                encuestaId: encuestaId,
                tipo: tipo,
                bytes: bytes,
                mimeType: mimeType,
                storagePath: storagePath,
                subida: subida,
                intentos: intentos,
                proximoIntentoEn: proximoIntentoEn,
                syncError: syncError,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String encuestaId,
                required String tipo,
                Value<Uint8List?> bytes = const Value.absent(),
                required String mimeType,
                Value<String?> storagePath = const Value.absent(),
                Value<bool> subida = const Value.absent(),
                Value<int> intentos = const Value.absent(),
                Value<DateTime?> proximoIntentoEn = const Value.absent(),
                Value<String?> syncError = const Value.absent(),
              }) => FotosCompanion.insert(
                id: id,
                encuestaId: encuestaId,
                tipo: tipo,
                bytes: bytes,
                mimeType: mimeType,
                storagePath: storagePath,
                subida: subida,
                intentos: intentos,
                proximoIntentoEn: proximoIntentoEn,
                syncError: syncError,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$FotosTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $FotosTable,
      Foto,
      $$FotosTableFilterComposer,
      $$FotosTableOrderingComposer,
      $$FotosTableAnnotationComposer,
      $$FotosTableCreateCompanionBuilder,
      $$FotosTableUpdateCompanionBuilder,
      (Foto, BaseReferences<_$AppDatabase, $FotosTable, Foto>),
      Foto,
      PrefetchHooks Function()
    >;
typedef $$ConfigCacheTableCreateCompanionBuilder =
    ConfigCacheCompanion Function({
      Value<int> id,
      required String json,
      Value<DateTime> actualizadoEn,
    });
typedef $$ConfigCacheTableUpdateCompanionBuilder =
    ConfigCacheCompanion Function({
      Value<int> id,
      Value<String> json,
      Value<DateTime> actualizadoEn,
    });

class $$ConfigCacheTableFilterComposer
    extends Composer<_$AppDatabase, $ConfigCacheTable> {
  $$ConfigCacheTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get json => $composableBuilder(
    column: $table.json,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get actualizadoEn => $composableBuilder(
    column: $table.actualizadoEn,
    builder: (column) => ColumnFilters(column),
  );
}

class $$ConfigCacheTableOrderingComposer
    extends Composer<_$AppDatabase, $ConfigCacheTable> {
  $$ConfigCacheTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get json => $composableBuilder(
    column: $table.json,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get actualizadoEn => $composableBuilder(
    column: $table.actualizadoEn,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ConfigCacheTableAnnotationComposer
    extends Composer<_$AppDatabase, $ConfigCacheTable> {
  $$ConfigCacheTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get json =>
      $composableBuilder(column: $table.json, builder: (column) => column);

  GeneratedColumn<DateTime> get actualizadoEn => $composableBuilder(
    column: $table.actualizadoEn,
    builder: (column) => column,
  );
}

class $$ConfigCacheTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ConfigCacheTable,
          ConfigCacheData,
          $$ConfigCacheTableFilterComposer,
          $$ConfigCacheTableOrderingComposer,
          $$ConfigCacheTableAnnotationComposer,
          $$ConfigCacheTableCreateCompanionBuilder,
          $$ConfigCacheTableUpdateCompanionBuilder,
          (
            ConfigCacheData,
            BaseReferences<_$AppDatabase, $ConfigCacheTable, ConfigCacheData>,
          ),
          ConfigCacheData,
          PrefetchHooks Function()
        > {
  $$ConfigCacheTableTableManager(_$AppDatabase db, $ConfigCacheTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ConfigCacheTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ConfigCacheTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ConfigCacheTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> json = const Value.absent(),
                Value<DateTime> actualizadoEn = const Value.absent(),
              }) => ConfigCacheCompanion(
                id: id,
                json: json,
                actualizadoEn: actualizadoEn,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String json,
                Value<DateTime> actualizadoEn = const Value.absent(),
              }) => ConfigCacheCompanion.insert(
                id: id,
                json: json,
                actualizadoEn: actualizadoEn,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$ConfigCacheTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ConfigCacheTable,
      ConfigCacheData,
      $$ConfigCacheTableFilterComposer,
      $$ConfigCacheTableOrderingComposer,
      $$ConfigCacheTableAnnotationComposer,
      $$ConfigCacheTableCreateCompanionBuilder,
      $$ConfigCacheTableUpdateCompanionBuilder,
      (
        ConfigCacheData,
        BaseReferences<_$AppDatabase, $ConfigCacheTable, ConfigCacheData>,
      ),
      ConfigCacheData,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$EncuestasTableTableManager get encuestas =>
      $$EncuestasTableTableManager(_db, _db.encuestas);
  $$FotosTableTableManager get fotos =>
      $$FotosTableTableManager(_db, _db.fotos);
  $$ConfigCacheTableTableManager get configCache =>
      $$ConfigCacheTableTableManager(_db, _db.configCache);
}
