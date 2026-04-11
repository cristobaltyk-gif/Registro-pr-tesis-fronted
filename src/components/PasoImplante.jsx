import { useState } from "react";
import "../styles/dashboard-pacientes.css";

// ── Catálogo de implantes ────────────────────────────────────
const IMPLANTES = {
  cadera: {
    marcas: [
      {
        id: "stryker",
        label: "Stryker",
        cotilo: "Trident",
        vastago: "Accolade II",
      },
      {
        id: "depuy",
        label: "DePuy Synthes",
        cotilo: "Pinnacle",
        vastago: "Corail",
      },
      {
        id: "zimmer",
        label: "Zimmer Biomet",
        cotilo: "G7",
        vastago: "Taperloc",
      },
      {
        id: "smith",
        label: "Smith & Nephew",
        cotilo: "R3",
        vastago: "Anthology",
      },
    ],
    fijaciones: [
      "No cementada",
      "Cementada",
      "Híbrida (vástago cementado, cotilo no cementado)",
      "Híbrida inversa (cotilo cementado, vástago no cementado)",
    ],
  },
  rodilla: {
    marcas: [
      { id: "stryker", label: "Stryker",        modelo: "Triathlon" },
      { id: "depuy",   label: "DePuy Synthes",  modelo: "Attune"    },
      { id: "zimmer",  label: "Zimmer Biomet",  modelo: "Persona"   },
      { id: "smith",   label: "Smith & Nephew", modelo: "Genesis II"},
    ],
    alineaciones: [
      { id: "mechanical",         label: "Mechanical Alignment",         desc: "Alineación mecánica tradicional" },
      { id: "kinematic",          label: "Kinematic Alignment",          desc: "Alineación cinemática" },
      { id: "inverse_kinematic",  label: "Inverse Kinematic Alignment",  desc: "Alineación cinemática inversa" },
      { id: "restricted",         label: "Restricted Alignment",         desc: "Alineación restringida" },
      { id: "functional",         label: "Functional Positioning",       desc: "Posicionamiento funcional" },
    ],
  },
};

const ROBOTICA = [
  { id: "no",   label: "Sin robótica" },
  { id: "mako", label: "Mako (Stryker)" },
  { id: "rosa", label: "ROSA (Zimmer Biomet)" },
];

export default function PasoImplante({ tipoCirugia, onComplete, onBack, inicial = {} }) {
  const articulacion = tipoCirugia?.includes("cadera") ? "cadera" : "rodilla";
  const catalogo     = IMPLANTES[articulacion];

  const [marca,      setMarca]      = useState(inicial.marca      || "");
  const [fijacion,   setFijacion]   = useState(inicial.fijacion   || "");
  const [alineacion, setAlineacion] = useState(inicial.alineacion || "");
  const [robotica,   setRobotica]   = useState(inicial.robotica   || "");
  const [error,      setError]      = useState(null);

  const marcaData = catalogo.marcas.find(m => m.id === marca);

  function handleContinuar() {
    if (!marca)    { setError("Seleccione la marca del implante"); return; }
    if (articulacion === "cadera" && !fijacion)   { setError("Seleccione el tipo de fijación"); return; }
    if (articulacion === "rodilla" && !alineacion){ setError("Seleccione el tipo de alineación"); return; }
    if (!robotica) { setError("Indique si se usó cirugía robótica"); return; }
    setError(null);

    const payload = {
      marca:       marcaData?.label || marca,
      robotica,
    };

    if (articulacion === "cadera") {
      payload.cotilo   = marcaData?.cotilo;
      payload.vastago  = marcaData?.vastago;
      payload.fijacion = fijacion;
    } else {
      payload.modelo    = marcaData?.modelo;
      payload.alineacion = alineacion;
    }

    onComplete?.(payload);
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Datos del implante</h1>
          <p>Paso 3 de 4 — {articulacion === "cadera" ? "Prótesis de cadera" : "Prótesis de rodilla"}</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && <div className="registro-error" style={{ marginBottom: 14 }}>{error}</div>}

          {/* Marca */}
          <p className="dp-section-title">Marca del implante</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {catalogo.marcas.map(m => (
              <button
                key={m.id}
                onClick={() => setMarca(m.id)}
                style={{
                  textAlign: "left",
                  padding: "13px 16px",
                  border: `1.5px solid ${marca === m.id ? "#0f172a" : "#e2e8f0"}`,
                  borderRadius: 10,
                  background: marca === m.id ? "#0f172a" : "#fff",
                  color: marca === m.id ? "#fff" : "#0f172a",
                  fontSize: 14,
                  fontWeight: marca === m.id ? 700 : 400,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                    {articulacion === "cadera"
                      ? `Cotilo: ${m.cotilo} · Vástago: ${m.vastago}`
                      : `Modelo: ${m.modelo}`
                    }
                  </div>
                </div>
                {marca === m.id && <span>✓</span>}
              </button>
            ))}
          </div>

          {/* Fijación — solo cadera */}
          {marca && articulacion === "cadera" && (
            <>
              <p className="dp-section-title">Tipo de fijación</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {catalogo.fijaciones.map(f => (
                  <button
                    key={f}
                    onClick={() => setFijacion(f)}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      border: `1.5px solid ${fijacion === f ? "#0f172a" : "#e2e8f0"}`,
                      borderRadius: 10,
                      background: fijacion === f ? "#0f172a" : "#fff",
                      color: fijacion === f ? "#fff" : "#0f172a",
                      fontSize: 13,
                      fontWeight: fijacion === f ? 700 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {f}
                    {fijacion === f && <span>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Alineación — solo rodilla */}
          {marca && articulacion === "rodilla" && (
            <>
              <p className="dp-section-title">Tipo de alineación</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {catalogo.alineaciones.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAlineacion(a.id)}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      border: `1.5px solid ${alineacion === a.id ? "#0f172a" : "#e2e8f0"}`,
                      borderRadius: 10,
                      background: alineacion === a.id ? "#0f172a" : "#fff",
                      color: alineacion === a.id ? "#fff" : "#0f172a",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: alineacion === a.id ? 700 : 600 }}>{a.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{a.desc}</div>
                    </div>
                    {alineacion === a.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Robótica */}
          {marca && (articulacion === "cadera" ? fijacion : alineacion) && (
            <>
              <p className="dp-section-title">¿Se usó cirugía robótica?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {ROBOTICA.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRobotica(r.id)}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      border: `1.5px solid ${robotica === r.id ? "#0f172a" : "#e2e8f0"}`,
                      borderRadius: 10,
                      background: robotica === r.id ? "#0f172a" : "#fff",
                      color: robotica === r.id ? "#fff" : "#0f172a",
                      fontSize: 14,
                      fontWeight: robotica === r.id ? 700 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {r.label}
                    {robotica === r.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}>
              ← Volver
            </button>
            {robotica && (
              <button className="dp-btn-primary" onClick={handleContinuar}>
                Continuar →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
