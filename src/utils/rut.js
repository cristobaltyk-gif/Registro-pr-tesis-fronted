/**
 * utils/rut.js
 * Validación y normalización de RUT chileno.
 */

export function normalizeRut(rut) {
  rut = rut.trim().toUpperCase().replace(/\./g, "").replace(/ /g, "");
  if (!rut.includes("-") && rut.length > 1) {
    rut = rut.slice(0, -1) + "-" + rut.slice(-1);
  }
  return rut;
}

export function isValidRut(rut) {
  return /^\d{7,8}-[\dK]$/.test(normalizeRut(rut));
}
