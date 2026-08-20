import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../theme.dart';
import '../widgets/logo.dart';

const _claveUsuarioRecordado = 'fundimopla_ultimo_usuario';

const _mensajesError = {
  'Invalid login credentials': 'Usuario o contraseña incorrectos.',
  'Email not confirmed': 'Esta cuenta todavia no fue confirmada.',
};

/// Espejo de src/app/login/page.tsx -- mismo layout, mismos textos, mismo
/// comportamiento (recordar usuario, mostrar/ocultar contraseña).
class LoginScreen extends StatefulWidget {
  final VoidCallback onLoginOk;
  const LoginScreen({super.key, required this.onLoginOk});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usuarioCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _recordarUsuario = false;
  bool _mostrarPassword = false;
  bool _cargando = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((prefs) {
      final guardado = prefs.getString(_claveUsuarioRecordado);
      if (guardado != null && mounted) {
        setState(() {
          _usuarioCtrl.text = guardado;
          _recordarUsuario = true;
        });
      }
    });
  }

  Future<void> _entrar() async {
    if (_cargando) return;
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final username = _usuarioCtrl.text.trim().toLowerCase();
      await Supabase.instance.client.auth.signInWithPassword(
        email: '$username@fundimopla.local',
        password: _passwordCtrl.text,
      );
      final prefs = await SharedPreferences.getInstance();
      if (_recordarUsuario) {
        await prefs.setString(_claveUsuarioRecordado, username);
      } else {
        await prefs.remove(_claveUsuarioRecordado);
      }
      widget.onLoginOk();
    } on AuthException catch (e) {
      setState(() => _error = _mensajesError[e.message] ?? e.message);
    } catch (e) {
      setState(() => _error = 'No se pudo iniciar sesion: $e');
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final habilitado = _usuarioCtrl.text.trim().isNotEmpty && _passwordCtrl.text.isNotEmpty;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 384),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Column(
                    children: [
                      const Logo(size: LogoTamano.lg),
                      const SizedBox(height: 16),
                      Text(
                        fundacionNombre,
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: c.brand),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Iniciar sesion',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: c.ink),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Ingresa con la cuenta que te asigno el administrador del sistema.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, color: c.inkMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _campo(
                    context,
                    'Usuario',
                    TextField(
                      controller: _usuarioCtrl,
                      autocorrect: false,
                      textCapitalization: TextCapitalization.none,
                      autofocus: true,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _campo(
                    context,
                    'Contraseña',
                    TextField(
                      controller: _passwordCtrl,
                      obscureText: !_mostrarPassword,
                      onChanged: (_) => setState(() {}),
                      onSubmitted: (_) => _entrar(),
                      decoration: InputDecoration(
                        suffixIcon: IconButton(
                          icon: Icon(_mostrarPassword ? Icons.visibility_off : Icons.visibility, size: 20),
                          color: c.inkMuted,
                          onPressed: () => setState(() => _mostrarPassword = !_mostrarPassword),
                          tooltip: _mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Checkbox(
                        value: _recordarUsuario,
                        activeColor: c.brand,
                        onChanged: (v) => setState(() => _recordarUsuario = v ?? false),
                      ),
                      Expanded(
                        child: Text(
                          'Recordar mi usuario en este dispositivo',
                          style: TextStyle(fontSize: 13, color: c.inkMuted),
                        ),
                      ),
                    ],
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: c.dangerSoft,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(_error!, style: TextStyle(color: c.danger)),
                    ),
                  ],
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: _cargando || !habilitado ? null : _entrar,
                    child: _cargando
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: c.brandInk),
                          )
                        : const Text('Iniciar sesion'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _campo(BuildContext context, String etiqueta, Widget input) {
    final c = context.colors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            style: TextStyle(fontWeight: FontWeight.w500, color: c.ink, fontSize: 15),
            children: [
              TextSpan(text: etiqueta),
              TextSpan(text: ' *', style: TextStyle(color: c.danger)),
            ],
          ),
        ),
        const SizedBox(height: 6),
        input,
      ],
    );
  }
}
