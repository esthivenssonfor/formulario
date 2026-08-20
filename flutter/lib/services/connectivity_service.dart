import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Tener Wi-Fi/datos moviles NO significa que hay Internet real (router
/// conectado sin salida, portal cautivo, etc.) -- connectivity_plus solo
/// dice "hay una interfaz de red", no "el servidor responde". Antes de
/// disparar una sincronizacion se hace una comprobacion real y barata
/// contra el propio Supabase.
class ConnectivityService {
  final Connectivity _connectivity = Connectivity();

  /// true si el SO reporta alguna interfaz de red activa (rapido, sin red).
  Future<bool> hayInterfazDeRed() async {
    final resultados = await _connectivity.checkConnectivity();
    return resultados.any((r) => r != ConnectivityResult.none);
  }

  /// Confirmacion real: un select liviano contra Supabase con timeout
  /// corto. Se usa SOLO antes de arrancar un ciclo de sincronizacion, no en
  /// cada tecla -- es una llamada de red real, no gratis.
  Future<bool> hayConexionReal() async {
    if (!await hayInterfazDeRed()) return false;
    try {
      await Supabase.instance.client
          .from('rangos_nivel')
          .select('id')
          .limit(1)
          .timeout(const Duration(seconds: 6));
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Emite cada vez que cambia la interfaz de red (para re-evaluar si vale
  /// la pena intentar sincronizar). No emite conexion "real" -- eso se
  /// vuelve a chequear en el momento con [hayConexionReal].
  Stream<bool> get cambiosDeInterfaz => _connectivity.onConnectivityChanged
      .map((resultados) => resultados.any((r) => r != ConnectivityResult.none));
}
