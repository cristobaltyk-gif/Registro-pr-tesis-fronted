import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const IMPLANTES = {
  cadera: [
    { id: "stryker", label: "Stryker",        cotilo: "Trident",   vastago: "Accolade II" },
    { id: "depuy",   label: "DePuy Synthes",  cotilo: "Pinnacle",  vastago: "Corail"      },
    { id: "zimmer",  label: "Zimmer Biomet",  cotilo: "G7",        vastago: "Taperloc"    },
    { id: "smith",   label: "Smith & Nephew", cotilo: "R3",        vastago: "Anthology"   },
  ],
  rodilla: [
    { id: "stryker", label: "Stryker",        modelo: "Triathlon" },
    { id: "depuy",   label: "DePuy Synthes",  modelo: "Attune"    },
    { id: "zimmer",  label: "Zimmer Biomet",  modelo: "Persona"   },
    { id: "smith",   label: "Smith & Nephew", modelo: "Genesis II"},
  ],
};

const ROBOTICA = [
  { id: "no",   label: "Sin cirugía robótica" },
  { id: "mako", label: "Mako (Stryker)"       },
  { id: "rosa", label: "ROSA (Zimmer Biomet)" },
];

const ALINEACIONES = [
  { id: "mechanical",        label: "Mechanical Alignment"        },
  { id: "kinematic",         label: "Kinematic Alignment"         },
  { id: "inverse_kinematic", label: "Inverse Kinematic Alignment" },
  { id: "restricted",        label: "Restricted Alignment"        },
  { id: "functional",        label: "Functional Positioning"      },
];

export default function PasoImplante({ articulacion: artProp, onComplete, onBack, inicial = {} }) {
  // Leer articulacion desde prop o desde inicial — nunca default a cadera sin datos
  const articulacion = artProp || inicial.articulacion || "";
  const esRodilla    = articulacion === "rodilla";
  const marcas       = IMPLANTES[articulacion] || [];

  const [marca,      setMarca]      = useState(inicial.marca_id   || "");
  const [robotica,   setRobotica]   = useState(inicial.robotica   || "");
  const [alineacion, setAlineacion] = useState(inicial.alineacion || "");
  const [error,      setError]      = useState(null);

  const marcaData = marcas.find(m => m.id === marca);

  function handleContinuar() {
    if (!marca)    { setError("Seleccione la marca del implante");     return; }
    if (!robotica) { setError("Indique si se usó cirugía robótica");   return; }
    if (esRodilla && !alineacion) { setError("Seleccione el tipo de alineación"); return; }
    setError(null);
    onComplete?.({
      marca_id:   marca,
      marca:      marcaData?.label  || "",
      cotilo:     marcaData?.cotilo || "",
      vastago:    marcaData?.vastago|| "",
      modelo:     marcaData?.modelo || "",
      robotica,
      alineacion: esRodilla ? alineacion : "",
    });
  }

  if (!articulacion) {
    return (
      <div className="dp-root">
        <div className="dp-content">
          <div className="dp-card">
            <div className="registro-error">Error — vuelva atrás y seleccione cadera o rodilla.</div>
            <button className="dp-btn-secondary" style={{ marginTop: 12 }} onClick={onBack}>← Volver</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Datos del implante</h1>
          <p>{esRodilla ? "Prótesis de rodilla" : "Prótesis de cadera"}</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && <div className="registro-error" style={{ marginBottom: 14 }}>{error}</div>}

          {/* Marca */}
          <p className="dp-section-title">Marca del implante</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {marcas.map(m => (
              <button key={m.id} onClick={() => setMarca(m.id)} style={{
                textAlign: "left", padding: "13px 16px",
                border: `1.5px solid ${marca === m.id ? "#0f172a" : "#e2e8f0"}`,
                borderRadius: 10,
                background: marca === m.id ? "#0f172a" : "#fff",
                color: marca === m.id ? "#fff" : "#0f172a",
                fontSize: 14, cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                    {esRodilla
                      ? `Modelo: ${m.modelo}`
                      : `Cotilo: ${m.cotilo} · Vástago: ${m.vastago}`}
                  </div>
                </div>
                {marca === m.id && <span>✓</span>}
              </button>
            ))}
          </div>

          {/* Robótica */}
          {marca && (
            <>
              <p className="dp-section-title">¿Se usó cirugía robótica?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {ROBOTICA.map(r => (
                  <button key={r.id} onClick={() => setRobotica(r.id)} style={{
                    textAlign: "left", padding: "11px 16px",
                    border: `1.5px solid ${robotica === r.id ? "#0f172a" : "#e2e8f0"}`,
                    borderRadius: 10,
                    background: robotica === r.id ? "#0f172a" : "#fff",
                    color: robotica === r.id ? "#fff" : "#0f172a",
                    fontSize: 14, fontWeight: robotica === r.id ? 700 : 400,
                    cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                    display: "flex", justifyContent: "space-between",
                  }}>
                    {r.label}
                    {robotica === r.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Alineación — solo rodilla */}
          {marca && robotica && esRodilla && (
            <>
              <p className="dp-section-title">Tipo de alineación</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {ALINEACIONES.map(a => (
                  <button key={a.id} onClick={() => setAlineacion(a.id)} style={{
                    textAlign: "left", padding: "11px 16px",
                    border: `1.5px solid ${alineacion === a.id ? "#0f172a" : "#e2e8f0"}`,
                    borderRadius: 10,
                    background: alineacion === a.id ? "#0f172a" : "#fff",
                    color: alineacion === a.id ? "#fff" : "#0f172a",
                    fontSize: 13, fontWeight: alineacion === a.id ? 700 : 400,
                    cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                    display: "flex", justifyContent: "space-between",
                  }}>
                    {a.label}
                    {alineacion === a.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}>← Volver</button>
            {marca && robotica && (!esRodilla || alineacion) && (
              <button className="dp-btn-primary" onClick={handleContinuar}>Continuar →</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
      }
