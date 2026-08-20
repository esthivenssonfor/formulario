import 'package:supabase_flutter/supabase_flutter.dart';

import '../data/repository.dart';
import '../models/config.dart';

/// Trae la Configuracion de Supabase y la deja en cache local (Drift). Si
/// falla (sin señal), sirve la ultima version cacheada -- misma idea que
/// obtenerConfiguracion() en src/lib/storage.ts, asi la encuesta se puede
/// seguir llenando offline.
class ConfigService {
  final SupabaseClient supabase;
  final Repository repo;
  ConfigService(this.supabase, this.repo);

  Future<Configuracion> obtener() async {
    try {
      final config = await _obtenerDeSupabase();
      await repo.guardarConfigCache(config.toCacheJson());
      return config;
    } catch (_) {
      final cache = await repo.leerConfigCache();
      if (cache != null) return Configuracion.fromCacheJson(cache);
      rethrow;
    }
  }

  Future<Configuracion> _obtenerDeSupabase() async {
    final tipos = await supabase.from('tipos_discapacidad').select();
    final preguntas = await supabase.from('preguntas').select().order('orden');
    final opciones = await supabase.from('opciones_pregunta').select().order('orden');
    final rangos = await supabase.from('rangos_nivel').select().order('min');
    final puntuacion = await supabase.from('configuracion_puntuacion').select().maybeSingle();
    final reglas = await supabase.from('reglas_criticas').select().order('orden');

    return Configuracion.desdeFilas(
      tipos: List<Map<String, dynamic>>.from(tipos),
      preguntas: List<Map<String, dynamic>>.from(preguntas),
      opciones: List<Map<String, dynamic>>.from(opciones),
      rangos: List<Map<String, dynamic>>.from(rangos),
      puntuacion: puntuacion,
      reglas: List<Map<String, dynamic>>.from(reglas),
    );
  }
}
