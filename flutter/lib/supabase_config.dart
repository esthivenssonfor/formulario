/// Mismo proyecto Supabase que la app Next.js (misma base, mismas policies
/// RLS -- ver supabase/schema.sql y supabase/migrations/ en la raiz del
/// repo). Solo la anon key (publica por diseño, protegida por RLS) -- la
/// service_role key NUNCA va en un cliente movil/web, igual que en
/// src/lib/supabase-admin.ts del lado Next.js.
///
/// Los valores reales se pasan en build/run con --dart-define, nunca
/// hardcodeados aca (ver flutter/README.md):
///   flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
class SupabaseConfig {
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://lrbzbcfkbyfqryjayuqg.supabase.co',
  );
  static const String anonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
}
