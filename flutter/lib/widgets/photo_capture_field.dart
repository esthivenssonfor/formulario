import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../services/image_processor.dart';

/// Campo reutilizable de "tomar/seleccionar foto -> vista previa -> volver
/// a tomar / usar esta foto", con el mismo pipeline de compresion para
/// cedula frontal/posterior y foto del participante (pedido explicito del
/// usuario: "debe utilizar exactamente el mismo pipeline").
///
/// Decision registrada en la conversacion: selector nativo (image_picker)
/// en vez de camara en vivo con overlay -- por eso la guia de encuadre es
/// un texto/ilustracion ESTATICA mostrada antes de abrir la camara, no un
/// marco superpuesto en tiempo real (no es posible con este enfoque, la
/// camara nativa se abre fuera de la pagina).
class PhotoCaptureField extends StatefulWidget {
  final String etiqueta;
  final String guia;
  final TipoFoto tipo;
  final void Function(Uint8List bytes, String mimeType) onConfirmada;
  final bool yaGuardada;

  const PhotoCaptureField({
    super.key,
    required this.etiqueta,
    required this.guia,
    required this.tipo,
    required this.onConfirmada,
    this.yaGuardada = false,
  });

  @override
  State<PhotoCaptureField> createState() => _PhotoCaptureFieldState();
}

class _PhotoCaptureFieldState extends State<PhotoCaptureField> {
  Uint8List? _vistaPrevia;
  bool _procesando = false;
  bool _confirmada = false;

  @override
  void initState() {
    super.initState();
    _confirmada = widget.yaGuardada;
  }

  Future<void> _capturar(ImageSource fuente) async {
    final picker = ImagePicker();
    final XFile? archivo = await picker.pickImage(source: fuente, imageQuality: 95);
    if (archivo == null) return;

    setState(() => _procesando = true);
    try {
      final original = await archivo.readAsBytes();
      final procesada = widget.tipo == TipoFoto.fotoParticipante
          ? await ImageProcessor.procesarPerfil(original)
          : await ImageProcessor.procesarCedula(original);
      setState(() {
        _vistaPrevia = procesada.bytes;
        _confirmada = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No se pudo procesar la foto: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _procesando = false);
    }
  }

  void _usarEstaFoto() {
    final bytes = _vistaPrevia;
    if (bytes == null) return;
    widget.onConfirmada(bytes, 'image/jpeg');
    setState(() => _confirmada = true);
  }

  void _volverATomar() => setState(() => _vistaPrevia = null);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(widget.etiqueta, style: Theme.of(context).textTheme.titleMedium),
                ),
                if (_confirmada)
                  const Icon(Icons.check_circle, color: Colors.green)
                else if (widget.yaGuardada)
                  const Icon(Icons.check_circle, color: Colors.green),
              ],
            ),
            if (_vistaPrevia == null) ...[
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Text(widget.guia, style: Theme.of(context).textTheme.bodySmall),
              ),
              if (_procesando)
                const Padding(
                  padding: EdgeInsets.all(8),
                  child: Center(child: CircularProgressIndicator()),
                )
              else
                Wrap(
                  spacing: 8,
                  children: [
                    FilledButton.icon(
                      onPressed: () => _capturar(ImageSource.camera),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Tomar fotografia'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => _capturar(ImageSource.gallery),
                      icon: const Icon(Icons.image),
                      label: const Text('Seleccionar imagen'),
                    ),
                  ],
                ),
            ] else ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.memory(_vistaPrevia!, height: 180, fit: BoxFit.cover),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  OutlinedButton(onPressed: _volverATomar, child: const Text('Volver a tomar')),
                  FilledButton(onPressed: _usarEstaFoto, child: const Text('Usar esta foto')),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
