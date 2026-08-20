import 'package:flutter/services.dart';

/// Cedula dominicana: 11 digitos, formato 000-0000000-0 (decision tomada en
/// la conversacion: se valida el formato exacto, no cualquier cadena de
/// numeros).
class CedulaValidator {
  static String soloDigitos(String valor) => valor.replaceAll(RegExp(r'\D'), '');

  static bool esValida(String valor) => soloDigitos(valor).length == 11;

  static String formatear(String valor) {
    final digitos = soloDigitos(valor).substring(0, soloDigitos(valor).length.clamp(0, 11));
    final buffer = StringBuffer();
    for (var i = 0; i < digitos.length; i++) {
      if (i == 3 || i == 10) buffer.write('-');
      buffer.write(digitos[i]);
    }
    return buffer.toString();
  }
}

/// Auto-formatea mientras el usuario escribe (agrega los guiones solo, sin
/// que tenga que tipearlos) y evita caracteres que no sean digitos.
class CedulaInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final formateado = CedulaValidator.formatear(newValue.text);
    return TextEditingValue(
      text: formateado,
      selection: TextSelection.collapsed(offset: formateado.length),
    );
  }
}
