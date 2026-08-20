import 'package:flutter/material.dart';

/// Estados visuales pedidos explicitamente por el usuario para el
/// resultado de "Guardar encuesta". No es el indicador global (esa es la
/// cola completa) -- este es el estado de la encuesta que se acaba de
/// guardar.
enum EstadoVisual { sinConexion, guardadaLocal, sincronizando, sincronizada, error }

class SyncStatusBanner extends StatelessWidget {
  final EstadoVisual estado;
  const SyncStatusBanner({super.key, required this.estado});

  @override
  Widget build(BuildContext context) {
    final (texto, color, icono) = switch (estado) {
      EstadoVisual.sinConexion => (
          'Sin conexión — la encuesta se guardará en el dispositivo.',
          Colors.blueGrey,
          Icons.wifi_off,
        ),
      EstadoVisual.guardadaLocal => (
          '✓ Encuesta guardada. Pendiente de sincronización.',
          Colors.orange,
          Icons.save,
        ),
      EstadoVisual.sincronizando => ('Sincronizando encuesta...', Colors.blue, Icons.sync),
      EstadoVisual.sincronizada => (
          '✓ Encuesta sincronizada correctamente.',
          Colors.green,
          Icons.check_circle,
        ),
      EstadoVisual.error => (
          '⚠ No se pudo sincronizar. Se volverá a intentar automáticamente.',
          Colors.red,
          Icons.error_outline,
        ),
    };

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
      child: Row(
        children: [
          Icon(icono, color: color),
          const SizedBox(width: 8),
          Expanded(child: Text(texto, style: TextStyle(color: color))),
        ],
      ),
    );
  }
}
