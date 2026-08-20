import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';

import '../data/repository.dart';
import '../models/config.dart';
import '../models/respuesta_local.dart';
import '../services/cedula_validator.dart';
import '../services/config_service.dart';
import '../services/connectivity_service.dart';
import '../services/image_processor.dart';
import '../services/scoring.dart' as scoring;
import '../sync/sync_manager.dart';
import '../theme.dart';
import 'admin_screen.dart';
import '../widgets/logo.dart';
import '../widgets/photo_capture_field.dart';
import '../widgets/sync_status_banner.dart';
import '../widgets/user_menu.dart';

/// Primera version funcional de la encuesta real en Flutter. Flujo pedido
/// explicitamente por el usuario:
///   UI -> Repository -> Drift -> SyncManager -> Supabase
/// (la pantalla NUNCA llama a Supabase directo para guardar la encuesta).
class EncuestaScreen extends StatefulWidget {
  final Repository repo;
  final SyncManager syncManager;
  const EncuestaScreen({super.key, required this.repo, required this.syncManager});

  @override
  State<EncuestaScreen> createState() => _EncuestaScreenState();
}

class _EncuestaScreenState extends State<EncuestaScreen> {
  Configuracion? _config;
  String? _errorCarga;
  String _encuestador = '';
  String _username = '';
  bool _esAdmin = false;

  final _cedulaCtrl = TextEditingController();
  final Map<String, List<String>> _seleccion = {}; // preguntaId -> opcionIds
  final Map<String, String> _valores = {}; // preguntaId -> texto/fecha/numero

  bool _guardando = false;
  String? _errorValidacion;
  String? _idGuardada;
  EstadoVisual? _estadoVisual;

  @override
  void initState() {
    super.initState();
    _cargar();
    widget.syncManager.estado.listen((_) => _actualizarEstadoVisual());
  }

  Future<void> _cargar() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final perfil = await Supabase.instance.client
            .from('profiles')
            .select('nombre, username, role')
            .eq('id', user.id)
            .maybeSingle();
        _username = perfil?['username'] as String? ?? '';
        _encuestador = (perfil?['nombre'] as String?)?.trim().isNotEmpty == true
            ? perfil!['nombre'] as String
            : _username;
        _esAdmin = perfil?['role'] == 'admin';
      }
      final config = await ConfigService(Supabase.instance.client, widget.repo).obtener();
      if (mounted) setState(() => _config = config);
    } catch (e) {
      if (mounted) setState(() => _errorCarga = 'No se pudo cargar la encuesta: $e');
    }
  }

  Future<void> _actualizarEstadoVisual() async {
    final id = _idGuardada;
    if (id == null) return;
    EstadoComponentes? estado;
    try {
      estado = await widget.repo.estadoDe(id);
    } catch (_) {
      // ya no esta en la DB local -> se termino de sincronizar y se podo.
      estado = null;
    }
    if (!mounted) return;
    if (estado == null) {
      setState(() => _estadoVisual = EstadoVisual.sincronizada);
      return;
    }
    setState(() => _estadoVisual = estado!.completo ? EstadoVisual.sincronizada : EstadoVisual.sincronizando);
  }

  List<Pregunta> get _preguntas =>
      _config == null ? const [] : scoring.preguntasVisibles(_config!.preguntas, '');

  List<Pregunta> get _preguntasDeSeleccion =>
      _preguntas.where((p) => p.tipo == TipoPregunta.unica || p.tipo == TipoPregunta.multiple).toList();

  void _elegirOpcion(Pregunta p, String opcionId) {
    setState(() {
      if (p.tipo == TipoPregunta.unica) {
        _seleccion[p.id] = [opcionId];
      } else {
        final actuales = List<String>.from(_seleccion[p.id] ?? const []);
        if (actuales.contains(opcionId)) {
          actuales.remove(opcionId);
        } else {
          actuales.add(opcionId);
        }
        _seleccion[p.id] = actuales;
      }
    });
  }

  Future<void> _guardar() async {
    final config = _config;
    if (config == null) return;

    if (!CedulaValidator.esValida(_cedulaCtrl.text)) {
      setState(() => _errorValidacion = 'La cedula debe tener el formato 000-0000000-0.');
      return;
    }
    final faltantes = _preguntasDeSeleccion.where((p) => (_seleccion[p.id]?.isEmpty ?? true)).toList();
    if (faltantes.isNotEmpty) {
      setState(() => _errorValidacion = 'Responde todas las preguntas de seleccion antes de continuar.');
      return;
    }
    setState(() {
      _errorValidacion = null;
      _guardando = true;
    });

    final respuestas = _preguntas.map((p) {
      if (p.tipo == TipoPregunta.unica || p.tipo == TipoPregunta.multiple) {
        final ids = _seleccion[p.id] ?? const [];
        return RespuestaLocal(
          preguntaId: p.id,
          opcionIds: ids,
          puntos: scoring.calcularPuntosRespuesta(p, ids),
        );
      }
      return RespuestaLocal(
        preguntaId: p.id,
        opcionIds: const [],
        valorTexto: _valores[p.id] ?? '',
        puntos: 0,
      );
    }).toList();

    final puntajeTotal = scoring.calcularPuntajeTotal(respuestas);
    final nivelYFactores = scoring.calcularNivelYFactores(puntajeTotal, respuestas, config.puntuacion);
    final nombre = _valores['q_nombre']?.trim();
    final edadTexto = _valores['q_edad']?.trim();

    final id = const Uuid().v4();

    // 1. Drift primero, SIEMPRE -- nunca se espera a Supabase para permitir
    // guardar (pedido explicito del usuario).
    await widget.repo.crearEncuestaPendiente(
      id: id,
      encuestador: _encuestador,
      participante: (nombre?.isNotEmpty ?? false) ? nombre! : '(sin nombre)',
      edad: edadTexto?.isNotEmpty == true ? int.tryParse(edadTexto!) : null,
      cedula: _cedulaCtrl.text,
      fecha: DateTime.now(),
      respuestas: respuestas,
      puntajeTotal: puntajeTotal,
      nivelId: nivelYFactores.nivelId,
      factoresCriticos: nivelYFactores.factoresCriticos,
    );

    // 2. Fotos: se tomaron antes de tener el id definitivo de la encuesta
    // (el id se genera aca, no al abrir la pantalla), asi que se guardan
    // en Drift recien ahora, ya asociadas al id real.
    await _reasociarFotos(id);

    final hayConexion = await ConnectivityService().hayConexionReal();

    setState(() {
      _guardando = false;
      _idGuardada = id;
      _estadoVisual = hayConexion ? EstadoVisual.guardadaLocal : EstadoVisual.sinConexion;
    });

    // dispara un intento de sync ahora mismo si hay señal; si no, el
    // SyncManager la toma sola cuando vuelva.
    widget.syncManager.sincronizarAhora();
  }

  AppHeader _header(BuildContext context) {
    return AppHeader(
      logo: const Logo(size: LogoTamano.sm),
      acciones: _encuestador.isEmpty
          ? null
          : UserMenu(
              nombreVisible: _encuestador,
              username: _username,
              esAdmin: _esAdmin,
              onCerrarSesion: () => Supabase.instance.client.auth.signOut(),
              onAbrirPanelAdmin: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => AdminScreen(encuestador: _encuestador, username: _username),
                ),
              ),
            ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_errorCarga != null) {
      return Scaffold(body: Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_errorCarga!))));
    }
    final config = _config;
    if (config == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_idGuardada != null) {
      return Scaffold(
        appBar: _header(context),
        body: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 700),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SyncStatusBanner(estado: _estadoVisual ?? EstadoVisual.guardadaLocal),
                  const SizedBox(height: 20),
                  FilledButton(
                    onPressed: () => setState(() {
                      _idGuardada = null;
                      _estadoVisual = null;
                      _cedulaCtrl.clear();
                      _seleccion.clear();
                      _valores.clear();
                      _fotosTemp.clear();
                    }),
                    child: const Text('Nueva encuesta'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: _header(context),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const SizedBox(height: 8),
          Text('Identificación del participante', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          TextField(
            controller: _cedulaCtrl,
            decoration: const InputDecoration(
              labelText: 'Cédula',
              hintText: '000-0000000-0',
              helperText: 'Formato dominicano: 11 dígitos',
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [CedulaInputFormatter()],
          ),
          const SizedBox(height: 12),
          PhotoCaptureField(
            etiqueta: '📷 Cédula frontal',
            guia: 'Coloca la cédula dentro del encuadre y asegúrate de que el texto sea legible.',
            tipo: TipoFoto.cedulaFrontal,
            onConfirmada: (b, m) => _guardarFotoLocal(TipoFoto.cedulaFrontal, b, m),
          ),
          PhotoCaptureField(
            etiqueta: '📷 Cédula posterior',
            guia: 'Coloca la cédula dentro del encuadre y asegúrate de que el texto sea legible.',
            tipo: TipoFoto.cedulaPosterior,
            onConfirmada: (b, m) => _guardarFotoLocal(TipoFoto.cedulaPosterior, b, m),
          ),
          PhotoCaptureField(
            etiqueta: '📷 Foto del participante',
            guia: 'Foto de la persona que está realizando la encuesta, rostro visible.',
            tipo: TipoFoto.fotoParticipante,
            onConfirmada: (b, m) => _guardarFotoLocal(TipoFoto.fotoParticipante, b, m),
          ),
          const Divider(height: 32),
          Text('Preguntas', style: Theme.of(context).textTheme.titleLarge),
          for (int i = 0; i < _preguntas.length; i++) _preguntaWidget(_preguntas, i),
          if (_errorValidacion != null) ...[
            const SizedBox(height: 12),
            Text(_errorValidacion!, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _guardando ? null : _guardar,
            child: _guardando ? const CircularProgressIndicator() : const Text('Guardar encuesta'),
          ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  // El id definitivo de la encuesta se genera recien al guardar (_guardar),
  // asi que las fotos tomadas ANTES de eso se guardan bajo una clave
  // temporal en memoria y se re-asocian al id real en el momento de
  // guardar -- ver _guardarFotoLocal / _reasociarFotos.
  final Map<TipoFoto, ({Uint8List bytes, String mime})> _fotosTemp = {};

  void _guardarFotoLocal(TipoFoto tipo, Uint8List bytes, String mime) {
    _fotosTemp[tipo] = (bytes: bytes, mime: mime);
  }

  Future<void> _reasociarFotos(String encuestaId) async {
    for (final entry in _fotosTemp.entries) {
      await widget.repo.guardarFoto(
        encuestaId: encuestaId,
        tipo: entry.key,
        bytes: entry.value.bytes,
        mimeType: entry.value.mime,
      );
    }
  }

  Widget _preguntaWidget(List<Pregunta> preguntas, int idx) {
    final p = preguntas[idx];
    final nuevaSeccion = idx == 0 || p.seccion != preguntas[idx - 1].seccion;
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (nuevaSeccion)
            Container(
              margin: const EdgeInsets.only(top: 24, bottom: 16),
              padding: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(border: Border(bottom: BorderSide(color: context.colors.line))),
              child: Text(
                p.seccion,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.colors.brand),
              ),
            ),
          Text(p.texto, style: Theme.of(context).textTheme.bodyLarge),
          if (p.tipo == TipoPregunta.unica)
            ...p.opciones.map(
              (o) => RadioListTile<String>(
                value: o.id,
                groupValue: (_seleccion[p.id] ?? const []).isEmpty ? null : _seleccion[p.id]!.first,
                onChanged: (v) => _elegirOpcion(p, o.id),
                title: Text(o.texto),
                dense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          if (p.tipo == TipoPregunta.multiple)
            ...p.opciones.map(
              (o) => CheckboxListTile(
                value: (_seleccion[p.id] ?? const []).contains(o.id),
                onChanged: (_) => _elegirOpcion(p, o.id),
                title: Text(o.texto),
                dense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          if (p.tipo == TipoPregunta.texto || p.tipo == TipoPregunta.fecha || p.tipo == TipoPregunta.numero)
            TextField(
              keyboardType: p.tipo == TipoPregunta.numero ? TextInputType.number : TextInputType.text,
              inputFormatters: p.tipo == TipoPregunta.numero ? [FilteringTextInputFormatter.digitsOnly] : null,
              onChanged: (v) => _valores[p.id] = v,
            ),
        ],
      ),
    );
  }
}
