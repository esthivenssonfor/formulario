import 'package:flutter/material.dart';

import '../theme.dart';

enum LogoTamano { sm, md, lg }

const _cajas = {LogoTamano.sm: 32.0, LogoTamano.md: 44.0, LogoTamano.lg: 64.0};

/// Espejo de src/components/logo.tsx -- mismo archivo de imagen
/// (assets/images/fundimopla-logo.jpeg, copiado 1:1 de public/), mismas
/// dimensiones y el mismo radio de esquina.
class Logo extends StatelessWidget {
  final LogoTamano size;
  const Logo({super.key, this.size = LogoTamano.md});

  @override
  Widget build(BuildContext context) {
    final lado = _cajas[size]!;
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.asset(
        'assets/images/fundimopla-logo.jpeg',
        width: lado,
        height: lado,
        fit: BoxFit.contain,
        semanticLabel: fundacionNombre,
      ),
    );
  }
}
