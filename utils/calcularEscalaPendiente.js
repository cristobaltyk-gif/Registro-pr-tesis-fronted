// Ventanas de seguimiento estándar para PROMs en artroplastía
// preop: antes de la cirugía
// 3m: ventana 2-5 meses post-op
// 6m: ventana 5-9 meses post-op
// 1a: ventana 9-18 meses post-op
// 2a: ventana 18-36 meses post-op

const VENTANAS = [
  { periodo: "preop", min: -999, max: 0    },
  { periodo: "3m",    min: 2,    max: 5    },
  { periodo: "6m",    min: 5,    max: 9    },
  { periodo: "1a",    min: 9,    max: 18   },
  { periodo: "2a",    min: 18,   max: 36   },
];

const PERIODO_LABEL = {
  preop: "Pre-operatorio",
  "3m":  "3 meses",
  "6m":  "6 meses",
  "1a":  "1 año",
  "2a":  "2 años",
};

export function calcularEscalaPendiente(cirugia) {
  if (!cirugia?.fecha_cirugia) {
    return { tipo: "sin_fecha" };
  }

  const ep = cirugia.escalas_programadas || {};
  const fechaCx = new Date(cirugia.fecha_cirugia);
  const hoy = new Date();
  const mesesTranscurridos = (hoy - fechaCx) / (1000 * 60 * 60 * 24 * 30.44);

  // Ventana actual
  const ventanaActual = VENTANAS.find(
    v => mesesTranscurridos >= v.min && mesesTranscurridos < v.max
  );

  if (!ventanaActual) {
    return { tipo: "fuera_ventana", mesesTranscurridos };
  }

  const yaCompletada = ep[ventanaActual.periodo]?.completada;

  if (yaCompletada) {
    return {
      tipo: "al_dia",
      periodo: ventanaActual.periodo,
      label: PERIODO_LABEL[ventanaActual.periodo],
      mesesTranscurridos,
    };
  }

  return {
    tipo: "pendiente",
    periodo: ventanaActual.periodo,
    label: PERIODO_LABEL[ventanaActual.periodo],
    mesesTranscurridos,
  };
}

export { PERIODO_LABEL };
