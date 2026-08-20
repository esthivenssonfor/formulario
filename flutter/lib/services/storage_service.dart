import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

/// Misma URL que src/lib/config.ts (URL_WEB) -- el deploy real en Vercel de
/// la app Next.js, que YA tiene la ruta server-side /api/admin/storage
/// (service_role key, nunca en el cliente -- ver src/app/api/admin/storage/route.ts).
/// El cliente Flutter reusa ese mismo endpoint en vez de duplicar la logica
/// de medir la base: pide con el token de sesion de Supabase, igual que lo
/// hace el navegador.
const _urlWeb = 'https://fundimopla.vercel.app';

class DatosAlmacenamiento {
  final int usedBytes;
  final int limitBytes;
  final double percent;
  DatosAlmacenamiento({required this.usedBytes, required this.limitBytes, required this.percent});

  factory DatosAlmacenamiento.fromJson(Map<String, dynamic> json) => DatosAlmacenamiento(
        usedBytes: (json['usedBytes'] as num).toInt(),
        limitBytes: (json['limitBytes'] as num).toInt(),
        percent: (json['percent'] as num).toDouble(),
      );
}

class StorageService {
  Future<DatosAlmacenamiento> obtener() async {
    final token = Supabase.instance.client.auth.currentSession?.accessToken;
    if (token == null) throw Exception('No hay sesion activa.');

    final res = await http
        .get(Uri.parse('$_urlWeb/api/admin/storage'), headers: {'Authorization': 'Bearer $token'})
        .timeout(const Duration(seconds: 15));

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200) {
      throw Exception(body['error'] as String? ?? 'Error ${res.statusCode}');
    }
    return DatosAlmacenamiento.fromJson(body);
  }
}
