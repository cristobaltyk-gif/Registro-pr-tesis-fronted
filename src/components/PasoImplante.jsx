import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const IMPLANTES = {
  cadera: [
    { id: "stryker", label: "Stryker",        cotilo: "Trident",   vastago: "Accolade II" },
    { id: "depuy",   label: "DePuy Synthes",  cotilo: "Pinnacle",  vastago: "Corail"      },
    { id: "zimmer",  label: "Zimmer Biomet",  cotilo: "G7",        vastago: "Taperloc"    },
    { id: "smith",   label: "Smith & Nephew", cotilo: "R3",        vastago: "Anthology"   },
    { id: "otro",    label: "Otro / No lo sé" },
  ],
  rodilla: [
    { id: "stryker", label: "Stryker",        modelo: "Triathlon"  },
    { id: "depuy",   label: "DePuy Synthes",  modelo: "Attune"     },
    { id: "zimmer",  label: "Zimmer Biomet",  modelo: "Persona"    },
    { id: "smith",   label: "Smith & Nephew", modelo: "Genesis II" },
    { id: "otro",    label: "Otro / No lo sé" },
  ],
};

const ABORDAJES_CADERA = [
  "Posterior",
  "Lateral directo",
  "Anterolateral (Hardinge)",
  "Anterior directo (DAA)",
  "SuperPATH",
  "Otro / No lo sé",
];

const FIJACIONES_CADERA = [
  "No cementada",
  "Cementada",
  "Híbrida (vástago cementado, cotilo no cementado)",
  "Híbrida inversa (cotilo cementado, vástago no cementado)",
  "No lo sé",
];

const FIJACIONES_RODILLA = [
  "Cementada",
  "No cementada",
  "Híbrida",
  "No lo sé",
];

// Alineación — solo aplica a rodilla (total o uni)
const ALINEACIONES = [
  "Mechanical Alignment",
  "Kinematic Alignment",
  "Inverse Kinematic Alignment",
  "Restricted Alignment",
  "Functional Positioning",
  "No lo sé",
];

const ROBOTICA = [
  "Sin robótica",
  "Mako (Stryker)",
  "ROSA (Zimmer Biomet)",
];

export default function PasoImplante({ articulacion: artProp, onComplete, onBack, inicial = {} }) {
  const articulacion  = (artProp || inicial.articulacion || "").toLowerCase();
  const tipoProtesis  = inicial.tipo_protesis || "";
  const esCadera      = articulacion === "cadera";
  const esRodilla     = articulacion === "rodilla";
  const esParcial     = tipoProtesis === "Cadera parcial (hemiartroplastía)";
  const esUni         = tipoProtesis === "Rodilla unicompartimental";
  const marcas        = IMPLANTES[articulacion] || [];

  const [marca,      setMarca]      = useState(inicial.marca_id   || "");
  const [abordaje,   setAbordaje]   = useState(inicial.abordaje   || "");
  const [fijacion,   setFijacion]   = useState(inicial.fijacion   || "");
  const [alineacion, setAlineacion] = useState(inicial.alineacion || "");
  const [robotica,   setRobotica]   = useState(inicial.robotica   || "");
  const [error,      setError]      = useState(null);

  const marcaData = marcas.find(m => m.id === marca);

  // Matriz de preguntas según tipo:
  const pideAbordaje   = esCadera;                                             // siempre en cadera
  const pideFijacion   = (esCadera && !esParcial) || (esRodilla && !esUni);    // solo totales
  const pideAlineacion = esRodilla;                                            // toda rodilla (total o uni)
  const fijacionesOpciones = esCadera ? FIJACIONES_CADERA : FIJACIONES_RODILLA;

  function handleContinuar() {
    if (!marca)                         { setError("Seleccione la marca del implante"); return; }
    if (pideAbordaje   && !abordaje)    { setError("Seleccione el abordaje quirúrgico"); return; }
    if (pideFijacion   && !fijacion)    { setError("Seleccione el tipo de fijación");    return; }
    if (pideAlineacion && !alineacion)  { setError("Seleccione el tipo de alineación");  return; }
    if (!robotica)                      { setError("Indique si se usó cirugía robótica"); return; }

    setError(null);
    onComplete?.({
      marca_id:   marca,
      marca:      marcaData?.label   || "",
      cotilo:     esParcial ? "" : (marcaData?.cotilo || ""),
      vastago:    marcaData?.vastago || "",
      modelo:     marcaData?.modelo  || "",
      abordaje:   pideAbordaje   ? abordaje   : "",
      fijacion:   pideFijacion   ? fijacion   : "",
      alineacion: pideAlineacion ? alineacion : "",
      robotica,
    });
  }

  if (!esCadera && !esRodilla) {
    return (
      <div className="dp-root">
        <div className="dp-content">
          <div className="dp-card">
            <div className="registro-error">
              Error: vuelva atrás y seleccione cadera o rodilla en el mapa.
            </div>
            <button className="dp-btn-secondary" style={{ marginTop: 12 }} onClick={onBack}>
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  function BotonSeleccion({ selected, onClick, label, sub = null }) {
    return (
      <button
        onClick={onClick}
        style={{
          textAlign: "left", padding: "11px 16px",
          border: `1.5px solid ${selected ? "#0f172a" : "#e2e8f0"}`,
          borderRadius: 10,
          background: selected ? "#0f172a" : "#fff",
          color: selected ? "#fff" : "#0f172a",
          fontSize: 14, fontWeight: selected ? 700 : 400,
          cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div style={{ flex: 1 }}>
          <div>{label}</div>
          {sub && <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{sub}</div>}
        </div>
        {selected && <span>✓</span>}
      </button>
    );
  }

  const listoContinuar =
    marca &&
    robotica &&
    (!pideAbordaje   || abordaje) &&
    (!pideFijacion   || fijacion) &&
    (!pideAlineacion || alineacion);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Datos del implante</h1>
          <p>{tipoProtesis || (esRodilla ? "Prótesis de rodilla" : "Prótesis de cadera")}</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && <div className="registro-error" style={{ marginBottom: 14 }}>{error}</div>}

          {/* 1. MARCA */}
          <p className="dp-section-title">Marca del implante</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {marcas.map(m => (
              <BotonSeleccion
                key={m.id}
                selected={marca === m.id}
                onClick={() => setMarca(m.id)}
                label={m.label}
                sub={
                  m.id === "otro" ? null :
                  esRodilla ? `Modelo: ${m.modelo}` :
                  esParcial ? `Vástago: ${m.vastago}` :
                  `Cotilo: ${m.cotilo} · Vástago: ${m.vastago}`
                }
              />
            ))}
          </div>

          {/* 2. ABORDAJE (solo cadera) */}
          {marca && pideAbordaje && (
            <>
              <p className="dp-section-title">Abordaje quirúrgico</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: -6, marginBottom: 10 }}>
                Cómo llegó el cirujano a la articulación
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {ABORDAJES_CADERA.map(a => (
                  <BotonSeleccion
                    key={a}
                    selected={abordaje === a}
                    onClick={() => setAbordaje(a)}
                    label={a}
                  />
                ))}
              </div>
            </>
          )}

          {/* 3. FIJACIÓN (solo totales) */}
          {marca && pideFijacion && (!pideAbordaje || abordaje) && (
            <>
              <p className="dp-section-title">Tipo de fijación</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: -6, marginBottom: 10 }}>
                Cómo se fijó el implante al hueso
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {fijacionesOpciones.map(f => (
                  <BotonSeleccion
                    key={f}
                    selected={fijacion === f}
                    onClick={() => setFijacion(f)}
                    label={f}
                  />
                ))}
              </div>
            </>
          )}

          {/* 4. ALINEACIÓN (toda rodilla) — va ANTES de robótica */}
          {marca && pideAlineacion &&
           (!pideAbordaje || abordaje) &&
           (!pideFijacion || fijacion) && (
            <>
              <p className="dp-section-title">Tipo de alineación</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: -6, marginBottom: 10 }}>
                Estrategia de posicionamiento del implante
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {ALINEACIONES.map(a => (
                  <BotonSeleccion
                    key={a}
                    selected={alineacion === a}
                    onClick={() => setAlineacion(a)}
                    label={a}
                  />
                ))}
              </div>
            </>
          )}

          {/* 5. ROBÓTICA — al final */}
          {marca &&
           (!pideAbordaje   || abordaje) &&
           (!pideFijacion   || fijacion) &&
           (!pideAlineacion || alineacion) && (
            <>
              <p className="dp-section-title">¿Se usó cirugía robótica?</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: -6, marginBottom: 10 }}>
                Herramienta usada para ejecutar la cirugía
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {ROBOTICA.map(r => (
                  <BotonSeleccion
                    key={r}
                    selected={robotica === r}
                    onClick={() => setRobotica(r)}
                    label={r}
                  />
                ))}
              </div>
            </>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className="dp-btn-secondary"
              style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}
            >
              ← Volver
            </button>
            {listoContinuar && (
              <button className="dp-btn-primary" style={{ flex: 1 }} onClick={handleContinuar}>
                Continuar →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
              }
