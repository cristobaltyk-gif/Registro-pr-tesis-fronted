import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const CENTROS = {
  "Maule": {
    "Curicó": [
      "Hospital San Juan de Dios de Curicó",
      "ICA / CleverSalud Curicó",
    ],
    "Talca": [
      "Hospital Regional del Maule",
      "Clínica Lircay",
    ],
  },
  "O'Higgins": {
    "Rancagua": [
      "Hospital Regional de Rancagua",
      "CleverSalud Rancagua",
      "FUSAT",
      "RedSalud Rancagua",
      "Isamedica",
    ],
    "Rengo": [
      "Hospital de Rengo",
    ],
    "San Fernando": [
      "Hospital de San Fernando",
    ],
    "Santa Cruz": [
      "Hospital de Santa Cruz",
    ],
  },
};

export default function PasoLugar({ onComplete, onBack, inicial = {} }) {
  const [region,  setRegion]  = useState(inicial.region  || "");
  const [ciudad,  setCiudad]  = useState(inicial.ciudad  || "");
  const [clinica, setClinica] = useState(inicial.clinica || "");
  const [error,   setError]   = useState(null);

  const ciudades  = region  ? Object.keys(CENTROS[region] || {})           : [];
  const clinicas  = ciudad  ? (CENTROS[region]?.[ciudad] || [])             : [];

  function handleRegion(r) {
    setRegion(r);
    setCiudad("");
    setClinica("");
  }

  function handleCiudad(c) {
    setCiudad(c);
    setClinica("");
  }

  function handleContinuar() {
    if (!region)  { setError("Seleccione la región");  return; }
    if (!ciudad)  { setError("Seleccione la ciudad");  return; }
    if (!clinica) { setError("Seleccione la clínica"); return; }
    setError(null);
    onComplete?.({ region, ciudad, clinica });
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Lugar de la cirugía</h1>
          <p>Paso 2 de 4 — Centro donde fue operado</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && <div className="registro-error" style={{ marginBottom: 14 }}>{error}</div>}

          {/* Región */}
          <p className="dp-section-title">Región</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {Object.keys(CENTROS).map(r => (
              <button
                key={r}
                onClick={() => handleRegion(r)}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  border: `1.5px solid ${region === r ? "#0f172a" : "#e2e8f0"}`,
                  borderRadius: 10,
                  background: region === r ? "#0f172a" : "#fff",
                  color: region === r ? "#fff" : "#0f172a",
                  fontSize: 14,
                  fontWeight: region === r ? 700 : 400,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                {r}{region === r && " ✓"}
              </button>
            ))}
          </div>

          {/* Ciudad */}
          {region && (
            <>
              <p className="dp-section-title">Ciudad</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {ciudades.map(c => (
                  <button
                    key={c}
                    onClick={() => handleCiudad(c)}
                    style={{
                      padding: "11px 18px",
                      border: `1.5px solid ${ciudad === c ? "#0f172a" : "#e2e8f0"}`,
                      borderRadius: 10,
                      background: ciudad === c ? "#0f172a" : "#fff",
                      color: ciudad === c ? "#fff" : "#0f172a",
                      fontSize: 14,
                      fontWeight: ciudad === c ? 700 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                    }}
                  >
                    {c}{ciudad === c && " ✓"}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Clínica */}
          {ciudad && (
            <>
              <p className="dp-section-title">Centro / Clínica</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {clinicas.map(cl => (
                  <button
                    key={cl}
                    onClick={() => setClinica(cl)}
                    style={{
                      textAlign: "left",
                      padding: "13px 16px",
                      border: `1.5px solid ${clinica === cl ? "#0f172a" : "#e2e8f0"}`,
                      borderRadius: 10,
                      background: clinica === cl ? "#0f172a" : "#fff",
                      color: clinica === cl ? "#fff" : "#0f172a",
                      fontSize: 14,
                      fontWeight: clinica === cl ? 700 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    🏥 {cl}
                    {clinica === cl && <span>✓</span>}
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
            {clinica && (
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
