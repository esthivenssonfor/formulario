import 'package:flutter/material.dart';

/// Identidad visual -- copiada 1:1 de src/app/globals.css (paleta light +
/// dark, convertida de OKLCH a sRGB) y src/lib/config.ts. La version
/// Capacitor (Next.js) y esta version Flutter comparten exactamente los
/// mismos colores/textos/logo -- si algo cambia en uno, hay que replicarlo
/// en el otro a mano (no hay generacion de codigo compartida entre ambos
/// stacks).
///
/// success/warning/danger NO tienen variante dark en globals.css (el bloque
/// "@media (prefers-color-scheme: dark)" solo redefine background/surface/
/// ink/line/brand/accent) -- se mantienen iguales en dark, igual que en la
/// app Next.js.

const fundacionNombre = 'FUNDIMOPLA';
const fundacionLema = 'Transformando vidas y familias con inclusión';
const fundacionDescripcion = 'Sistema de Evaluación de Vulnerabilidad';

/// Todos los colores semanticos de la app, con una variante para cada
/// brillo. Los widgets leen `context.colors.xxx` (ver extension al final)
/// en vez de un color fijo, para que el modo oscuro los adapte solos.
class AppColorsExt extends ThemeExtension<AppColorsExt> {
  final Color background, surface, surface2, ink, inkMuted, line, lineStrong;
  final Color brand, brandStrong, brandSoft, brandInk;
  final Color accent, accentSoft;
  final Color success, successSoft, warning, warningSoft, danger, dangerSoft;

  const AppColorsExt({
    required this.background,
    required this.surface,
    required this.surface2,
    required this.ink,
    required this.inkMuted,
    required this.line,
    required this.lineStrong,
    required this.brand,
    required this.brandStrong,
    required this.brandSoft,
    required this.brandInk,
    required this.accent,
    required this.accentSoft,
    required this.success,
    required this.successSoft,
    required this.warning,
    required this.warningSoft,
    required this.danger,
    required this.dangerSoft,
  });

  static const light = AppColorsExt(
    background: Color(0xFFFAFCFE),
    surface: Color(0xFFF2F6F9),
    surface2: Color(0xFFE4ECF3),
    ink: Color(0xFF0F171F),
    inkMuted: Color(0xFF3F4952),
    line: Color(0xFFC6CFD6),
    lineStrong: Color(0xFF95A0A9),
    brand: Color(0xFF005ABA),
    brandStrong: Color(0xFF003B99),
    brandSoft: Color(0xFFCEEDFF),
    brandInk: Color(0xFFFAFCFE),
    accent: Color(0xFF0080A2),
    accentSoft: Color(0xFFD3EDF6),
    success: Color(0xFF14874E),
    successSoft: Color(0xFFD2F6DD),
    warning: Color(0xFFCA8A00),
    warningSoft: Color(0xFFFFE8BE),
    danger: Color(0xFFBE222A),
    dangerSoft: Color(0xFFFFDFDA),
  );

  static const dark = AppColorsExt(
    background: Color(0xFF0B121A),
    surface: Color(0xFF131B25),
    surface2: Color(0xFF1B2530),
    ink: Color(0xFFEBEFF2),
    inkMuted: Color(0xFFB0B9C1),
    line: Color(0xFF2F3942),
    lineStrong: Color(0xFF4D5A65),
    brand: Color(0xFF449DF0),
    brandStrong: Color(0xFF71B5FF),
    brandSoft: Color(0xFF0F304A),
    brandInk: Color(0xFF06090D),
    accent: Color(0xFF5DB2CC),
    accentSoft: Color(0xFF012E3A),
    success: Color(0xFF14874E),
    successSoft: Color(0xFFD2F6DD),
    warning: Color(0xFFCA8A00),
    warningSoft: Color(0xFFFFE8BE),
    danger: Color(0xFFBE222A),
    dangerSoft: Color(0xFFFFDFDA),
  );

  @override
  AppColorsExt copyWith() => this;

  @override
  AppColorsExt lerp(ThemeExtension<AppColorsExt>? other, double t) =>
      t < 0.5 ? this : (other as AppColorsExt? ?? this);
}

extension AppColorsContext on BuildContext {
  AppColorsExt get colors => Theme.of(this).extension<AppColorsExt>()!;
}

ThemeData _construirTema(Brightness brillo) {
  final c = brillo == Brightness.dark ? AppColorsExt.dark : AppColorsExt.light;
  return ThemeData(
    useMaterial3: true,
    brightness: brillo,
    scaffoldBackgroundColor: c.background,
    extensions: [c],
    colorScheme: ColorScheme.fromSeed(
      seedColor: c.brand,
      brightness: brillo,
      primary: c.brand,
      onPrimary: c.brandInk,
      secondary: c.accent,
      surface: c.surface,
      onSurface: c.ink,
      error: c.danger,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: c.surface,
      foregroundColor: c.ink,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
    ),
    // rounded-lg (8px) de Tailwind, mismo radio que los botones/inputs de
    // la app Next.js (src/components/ui.tsx).
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: c.brand,
        foregroundColor: c.brandInk,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.brand,
        side: BorderSide(color: c.brand, width: 2),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: c.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: c.lineStrong),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: c.lineStrong),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: c.brand, width: 2),
      ),
      labelStyle: TextStyle(color: c.inkMuted, fontWeight: FontWeight.w500),
    ),
    cardTheme: CardThemeData(
      color: c.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12), // rounded-xl
        side: BorderSide(color: c.line),
      ),
    ),
    dividerTheme: DividerThemeData(color: c.line),
    textTheme: (brillo == Brightness.dark ? ThemeData.dark() : ThemeData.light()).textTheme.apply(
          bodyColor: c.ink,
          displayColor: c.ink,
        ),
  );
}

ThemeData construirTema() => _construirTema(Brightness.light);
ThemeData construirTemaOscuro() => _construirTema(Brightness.dark);
