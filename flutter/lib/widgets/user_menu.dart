import 'package:flutter/material.dart';

import '../theme.dart';

String _iniciales(String texto) {
  final palabras = texto.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  final letras = palabras.take(2).map((p) => p[0].toUpperCase()).join();
  return letras.isEmpty ? '?' : letras;
}

/// Espejo de src/components/user-menu.tsx: avatar circular con iniciales
/// sobre color de marca + nombre, que abre un panel con nombre completo,
/// "@usuario · rol" y "Cerrar sesión".
class UserMenu extends StatelessWidget {
  final String nombreVisible;
  final String username;
  final bool esAdmin;
  final VoidCallback onCerrarSesion;
  final VoidCallback? onAbrirPanelAdmin;

  const UserMenu({
    super.key,
    required this.nombreVisible,
    required this.username,
    required this.esAdmin,
    required this.onCerrarSesion,
    this.onAbrirPanelAdmin,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return PopupMenuButton<String>(
      offset: const Offset(0, 44),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: c.line),
      ),
      color: c.surface,
      itemBuilder: (context) => [
        PopupMenuItem<String>(
          enabled: false,
          child: SizedBox(
            width: 200,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(nombreVisible, style: TextStyle(fontWeight: FontWeight.w600, color: c.ink)),
                Text(
                  '@$username · ${esAdmin ? "Administrador" : "Usuario"}',
                  style: TextStyle(fontSize: 12, color: c.inkMuted),
                ),
              ],
            ),
          ),
        ),
        const PopupMenuDivider(),
        if (esAdmin && onAbrirPanelAdmin != null)
          PopupMenuItem<String>(
            value: 'panel_admin',
            child: Text('Panel administrativo', style: TextStyle(color: c.ink, fontWeight: FontWeight.w500)),
          ),
        PopupMenuItem<String>(
          value: 'cerrar_sesion',
          child: Text('Cerrar sesión', style: TextStyle(color: c.danger, fontWeight: FontWeight.w500)),
        ),
      ],
      onSelected: (value) {
        if (value == 'cerrar_sesion') onCerrarSesion();
        if (value == 'panel_admin') onAbrirPanelAdmin?.call();
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: c.brand,
            child: Text(
              _iniciales(nombreVisible),
              style: TextStyle(color: c.brandInk, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
          const SizedBox(width: 8),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 96),
            child: Text(
              nombreVisible,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontWeight: FontWeight.w500, color: c.ink),
            ),
          ),
        ],
      ),
    );
  }
}

/// Espejo de src/components/header.tsx: logo + nombre de la fundacion a la
/// izquierda, acciones (UserMenu) a la derecha.
class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final Widget logo;
  final Widget? acciones;

  const AppHeader({super.key, required this.logo, this.acciones});

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      height: preferredSize.height,
      decoration: BoxDecoration(
        color: c.surface,
        border: Border(bottom: BorderSide(color: c.line)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            logo,
            const SizedBox(width: 8),
            Text(
              fundacionNombre,
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: c.ink),
            ),
            const Spacer(),
            ?acciones,
          ],
        ),
      ),
    );
  }
}
