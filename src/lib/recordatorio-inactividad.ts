import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// Supabase pausa los proyectos del plan gratuito despues de ~7 dias sin
// actividad -- si nadie abre la app en ese tiempo, la base de datos se
// congela sola y hay que entrar al panel de Supabase a reactivarla (algo
// que quien recibe esta app no sabe hacer). Como aviso preventivo, cada
// vez que se abre la app con sesion activa (lo que ya cuenta como
// actividad real contra Supabase) se reprograman 4 notificaciones locales
// contando 7 dias hacia adelante desde ese momento.
const LIMITE_INACTIVIDAD_MS = 7 * 24 * 60 * 60 * 1000;
const ID_BASE = 9001;

const ANTICIPACIONES = [
  { ms: 2 * 24 * 60 * 60 * 1000, texto: "Faltan 2 dias" },
  { ms: 1 * 24 * 60 * 60 * 1000, texto: "Falta 1 dia" },
  { ms: 12 * 60 * 60 * 1000, texto: "Faltan 12 horas" },
  { ms: 6 * 60 * 60 * 1000, texto: "Faltan 6 horas" },
];

/**
 * Registra la actividad de ahora y reprograma los 4 avisos. Se llama cada
 * vez que la app carga con sesion valida -- si nunca se abre de nuevo, los
 * 4 avisos ya programados van a sonar igual antes de que Supabase pause el
 * proyecto.
 */
export async function programarRecordatorioInactividad(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return; // solo aplica a la app instalada, no a la web

  try {
    await LocalNotifications.cancel({
      notifications: ANTICIPACIONES.map((_, i) => ({ id: ID_BASE + i })),
    });

    const ahora = Date.now();
    const notifications = ANTICIPACIONES.map((anticipacion, i) => ({
      id: ID_BASE + i,
      title: "FUNDIMOPLA -- Base de datos por pausarse",
      body: `${anticipacion.texto} para que la base de datos se pause por falta de uso. Abrí la app para evitarlo.`,
      schedule: { at: new Date(ahora + LIMITE_INACTIVIDAD_MS - anticipacion.ms) },
    }));

    await LocalNotifications.schedule({ notifications });
  } catch {
    // si el usuario no da permiso de notificaciones (o el plugin falla),
    // no debe interrumpir el uso normal de la app -- se pierde el aviso
    // preventivo, nada mas.
  }
}
