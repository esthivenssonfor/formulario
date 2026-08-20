import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'data/database.dart';
import 'data/repository.dart';
import 'screens/encuesta_screen.dart';
import 'screens/login_screen.dart';
import 'services/connectivity_service.dart';
import 'supabase_config.dart';
import 'sync/sync_manager.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(url: SupabaseConfig.url, publishableKey: SupabaseConfig.anonKey);

  final db = AppDatabase();
  final repo = Repository(db);
  // recuperacion de crash ANTES de que el SyncManager empiece a mirar la
  // cola (ver Repository.recuperarInterrumpidas): si la app se cerro a
  // mitad de un ciclo de sync, esa encuesta no debe quedar huerfana en
  // SYNCING para siempre.
  await repo.recuperarInterrumpidas();

  final syncManager = SyncManager(repo, Supabase.instance.client, ConnectivityService());
  syncManager.iniciar();

  runApp(FundimoplaApp(repo: repo, syncManager: syncManager));
}

class FundimoplaApp extends StatefulWidget {
  final Repository repo;
  final SyncManager syncManager;
  const FundimoplaApp({super.key, required this.repo, required this.syncManager});

  @override
  State<FundimoplaApp> createState() => _FundimoplaAppState();
}

class _FundimoplaAppState extends State<FundimoplaApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: fundacionNombre,
      debugShowCheckedModeBanner: false,
      theme: construirTema(),
      darkTheme: construirTemaOscuro(),
      themeMode: ThemeMode.system,
      home: StreamBuilder<AuthState>(
        stream: Supabase.instance.client.auth.onAuthStateChange,
        builder: (context, snapshot) {
          final logueado = Supabase.instance.client.auth.currentSession != null;
          if (!logueado) {
            return LoginScreen(onLoginOk: () => setState(() {}));
          }
          return EncuestaScreen(repo: widget.repo, syncManager: widget.syncManager);
        },
      ),
    );
  }
}
