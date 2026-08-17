// Arma el export estatico que se empaqueta dentro del .apk (ver
// capacitor.config.ts). Next.js no permite `output: "export"` si el
// proyecto tiene Route Handlers dinamicos (src/app/api/**) o Middleware,
// asi que ambos se sacan del camino durante este build y se restauran al
// terminar -- el build normal de Vercel (npm run build) nunca pasa por
// aca y los mantiene siempre activos.
import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";

const mover = [
  { real: "src/app/api", temp: "src/app/_api_disabled_for_capacitor" },
  { real: "src/middleware.ts", temp: "src/_middleware_disabled_for_capacitor.ts" },
];

for (const { temp } of mover) {
  if (existsSync(temp)) rmSync(temp, { recursive: true, force: true });
}
const movidos = mover.filter(({ real, temp }) => {
  if (!existsSync(real)) return false;
  renameSync(real, temp);
  return true;
});

try {
  execSync("npx next build", {
    stdio: "inherit",
    env: { ...process.env, CAPACITOR_BUILD: "1" },
  });
} finally {
  for (const { real, temp } of movidos) renameSync(temp, real);
}
