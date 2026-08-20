import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/storage_service.dart';
import '../theme.dart';
import '../widgets/logo.dart';
import '../widgets/user_menu.dart';

const _urlWebAdmin = 'https://fundimopla.vercel.app/admin';

/// Panel admin en Flutter -- por ahora enfocado en el monitor de
/// almacenamiento (lo unico pedido explicitamente por el usuario). Gestion
/// de usuarios/preguntas/exportacion sigue viviendo en el panel web
/// completo (Next.js), con un boton para abrirlo -- no se duplica esa
/// logica aca.
class AdminScreen extends StatefulWidget {
  final String encuestador;
  final String username;
  const AdminScreen({super.key, required this.encuestador, required this.username});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  DatosAlmacenamiento? _datos;
  String? _error;
  bool _cargando = true;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final datos = await StorageService().obtener();
      if (mounted) setState(() => _datos = datos);
    } catch (e) {
      if (mounted) setState(() => _error = 'No se pudo consultar el almacenamiento: $e');
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppHeader(
        logo: const Logo(size: LogoTamano.sm),
        acciones: UserMenu(
          nombreVisible: widget.encuestador,
          username: widget.username,
          esAdmin: true,
          onCerrarSesion: () => Supabase.instance.client.auth.signOut(),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _cargar,
        child: LayoutBuilder(
          builder: (context, constraints) {
            // mismo criterio que max-w-2xl (Next.js): en tablets el
            // contenido no se estira de pared a pared, queda centrado.
            final anchoContenido = constraints.maxWidth.clamp(0, 700).toDouble();
            return Center(
              child: SizedBox(
                width: anchoContenido,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text('Panel administrativo', style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 16),
                    if (_cargando)
                      const Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (_error != null)
                      _errorCard(context)
                    else if (_datos != null)
                      _StorageCard(datos: _datos!),
                    const SizedBox(height: 24),
                    OutlinedButton.icon(
                      onPressed: () => launchUrl(Uri.parse(_urlWebAdmin), mode: LaunchMode.externalApplication),
                      icon: const Icon(Icons.open_in_browser),
                      label: const Text('Abrir panel completo (usuarios, encuestas, exportar)'),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _errorCard(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: c.dangerSoft, borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_error!, style: TextStyle(color: c.danger)),
          const SizedBox(height: 8),
          TextButton(onPressed: _cargar, child: const Text('Reintentar')),
        ],
      ),
    );
  }
}

/// Barra + mensaje de almacenamiento -- mismos umbrales y mensajes que
/// src/components/storage-monitor.tsx (70/80/90/95%).
class _StorageCard extends StatelessWidget {
  final DatosAlmacenamiento datos;
  const _StorageCard({required this.datos});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final porcentaje = datos.percent;
    final Color colorBarra;
    final String mensaje;
    if (porcentaje >= 0.95) {
      colorBarra = c.danger;
      mensaje = '🚨 CRÍTICO: queda muy poco espacio disponible. Exporta los datos inmediatamente.';
    } else if (porcentaje >= 0.90) {
      colorBarra = c.danger;
      mensaje = '🚨 La base de datos está casi llena. Exporta los resultados y elimina los datos antiguos.';
    } else if (porcentaje >= 0.80) {
      colorBarra = c.warning;
      mensaje = '⚠️ La base de datos está cerca de su límite. Es recomendable exportar los resultados.';
    } else if (porcentaje >= 0.70) {
      colorBarra = c.warning;
      mensaje = 'El almacenamiento de la base de datos está llegando a un nivel elevado.';
    } else {
      colorBarra = c.success;
      mensaje = 'Uso normal, sin acciones pendientes.';
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('Base de datos', style: TextStyle(fontWeight: FontWeight.w600, color: c.ink)),
                const Spacer(),
                Text(
                  '${(porcentaje * 100).round()}%',
                  style: TextStyle(fontWeight: FontWeight.bold, color: colorBarra, fontSize: 18),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: porcentaje.clamp(0, 1),
                minHeight: 10,
                backgroundColor: c.line,
                color: colorBarra,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '${_formatearMB(datos.usedBytes)} usados de ${_formatearMB(datos.limitBytes)}',
              style: TextStyle(color: c.inkMuted, fontSize: 13),
            ),
            const SizedBox(height: 12),
            Text(mensaje, style: TextStyle(color: c.ink)),
            if (porcentaje >= 0.80) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: [
                  FilledButton(
                    onPressed: () => launchUrl(Uri.parse(_urlWebAdmin), mode: LaunchMode.externalApplication),
                    child: const Text('Exportar datos'),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatearMB(int bytes) => '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
}
