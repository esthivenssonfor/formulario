import 'dart:typed_data';
import 'package:image/image.dart' as img;

/// Resultado de procesar una foto: bytes ya redimensionados/comprimidos,
/// listos para guardar localmente y subir.
class ImagenProcesada {
  final Uint8List bytes;
  final String mimeType;
  ImagenProcesada(this.bytes, this.mimeType);
}

enum TipoFoto { cedulaFrontal, cedulaPosterior, fotoParticipante }

/// Redimensiona + comprimve una foto ANTES de guardarla localmente o
/// subirla. Todo en Dart puro (paquete `image`), funciona igual en
/// Android/iOS/Web -- a diferencia de flutter_image_compress, que en Web
/// tiene soporte limitado.
///
/// Estrategia: apuntar a 300-800 KB via calidad JPEG decreciente, pero
/// nunca sacrificar legibilidad por debajo de una calidad minima -- si con
/// la calidad minima sigue pesando mas, se deja mas grande (ver pedido del
/// usuario: "si una imagen necesita mas tamaño para mantener la
/// informacion legible, permite un tamaño mayor").
class ImageProcessor {
  static const int _objetivoMinBytes = 300 * 1024;
  static const int _objetivoMaxBytes = 800 * 1024;
  static const int _calidadMinima = 55;

  static Future<ImagenProcesada> procesarCedula(Uint8List original) =>
      _procesar(original, ladoMayorMax: 1600);

  static Future<ImagenProcesada> procesarPerfil(Uint8List original) =>
      _procesar(original, ladoMayorMax: 1200);

  static Future<ImagenProcesada> _procesar(
    Uint8List original, {
    required int ladoMayorMax,
  }) async {
    final decodificada = img.decodeImage(original);
    if (decodificada == null) {
      throw const FormatException('No se pudo leer la imagen capturada.');
    }

    // decodeImage ya aplica la orientacion EXIF; al reencodear como JPEG
    // sin copiar el EXIF original, se descartan metadatos (GPS, modelo de
    // camara, etc.) que no hacen falta para este uso.
    final ladoMayor = decodificada.width > decodificada.height
        ? decodificada.width
        : decodificada.height;
    final redimensionada = ladoMayor > ladoMayorMax
        ? img.copyResize(
            decodificada,
            width: decodificada.width >= decodificada.height ? ladoMayorMax : null,
            height: decodificada.height > decodificada.width ? ladoMayorMax : null,
            interpolation: img.Interpolation.average,
          )
        : decodificada;

    // Busqueda simple de calidad: empieza alto y baja hasta entrar en el
    // rango objetivo o tocar el piso de calidad legible.
    Uint8List mejorIntento = Uint8List(0);
    for (int calidad = 90; calidad >= _calidadMinima; calidad -= 5) {
      final codificada = Uint8List.fromList(
        img.encodeJpg(redimensionada, quality: calidad),
      );
      mejorIntento = codificada;
      if (codificada.lengthInBytes <= _objetivoMaxBytes) break;
    }

    // Si incluso a calidad minima sigue por debajo del piso esperable
    // (imagen muy simple/chica), no hace falta forzar mas compresion.
    if (mejorIntento.lengthInBytes < _objetivoMinBytes &&
        mejorIntento.lengthInBytes == 0) {
      mejorIntento = Uint8List.fromList(img.encodeJpg(redimensionada, quality: 85));
    }

    return ImagenProcesada(mejorIntento, 'image/jpeg');
  }

  static String nombreArchivo(TipoFoto tipo) {
    switch (tipo) {
      case TipoFoto.cedulaFrontal:
        return 'cedula_frontal.jpg';
      case TipoFoto.cedulaPosterior:
        return 'cedula_posterior.jpg';
      case TipoFoto.fotoParticipante:
        return 'perfil.jpg';
    }
  }

  static String claveTipo(TipoFoto tipo) {
    switch (tipo) {
      case TipoFoto.cedulaFrontal:
        return 'cedula_frontal';
      case TipoFoto.cedulaPosterior:
        return 'cedula_posterior';
      case TipoFoto.fotoParticipante:
        return 'foto_participante';
    }
  }
}
