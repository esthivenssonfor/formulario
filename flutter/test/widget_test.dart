// Los tests reales del nucleo offline (idempotencia, backoff, estado por
// componente) viven en test/repository_test.dart -- este archivo se deja
// sin smoke test de widgets a proposito: la app arranca con
// Supabase.initialize (necesita red/credenciales), no aplica aca.
void main() {}
