// utils/calcularEscalaPendiente.js
const VENTANAS = [
  { periodo: "preop", min: -999, max: 0 },   // antes de cirugía
  { periodo: "3m",    min: 2,    max: 5 },   // ventana 2-5 meses
  { periodo: "6m",    min: 5,    max: 9 },   // ventana 5-9 meses
  { periodo: "1a",    min: 9,    max: 18 },  // ventana 9-18 meses
  { periodo: "2a",    min: 18,   max: 36 },  // ventana 18-36 meses
];

export function calcularEscalaPendiente(cirugia) {
  const ep = cirugia?.escalas_programadas || {};
  const fechaCx = new Date(cirugia.fecha_cirugia);
  const hoy = new Date();
  const mesesTranscurridos = (hoy - fechaCx) / (1000 * 60 * 60 * 24 * 30.44);

  // Buscar la ventana actual
  const ventanaActual = VENTANAS.find(
    v => mesesTranscurridos >= v.min && mesesTranscurridos < v.max
  );

  if (!ventanaActual) return { tipo: "fuera_ventana", mesesTranscurridos };

  const yaCompletada = ep[ventanaActual.periodo]?.completada;

  if (yaCompletada) {
    return { tipo: "al_dia", periodo: ventanaActual.periodo, mesesTranscurridos };
  }

  return { tipo: "pendiente", periodo: ventanaActual.periodo, mesesTranscurridos };
}
