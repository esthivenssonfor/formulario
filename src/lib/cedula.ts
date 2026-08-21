// Cedula dominicana: 11 digitos, formato 000-0000000-0 -- espejo de
// flutter/lib/services/cedula_validator.dart.

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function cedulaValida(valor: string): boolean {
  return soloDigitos(valor).length === 11;
}

export function formatearCedula(valor: string): string {
  const digitos = soloDigitos(valor).slice(0, 11);
  let out = "";
  for (let i = 0; i < digitos.length; i++) {
    if (i === 3 || i === 10) out += "-";
    out += digitos[i];
  }
  return out;
}
