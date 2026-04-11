import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const ARTICULACIONES = [
  { id: "cadera",  label: "Cadera",  icono: "🦴" },
  { id: "rodilla", label: "Rodilla", icono: "🦵" },
];

const LADOS = [
  { id: "derecho",   label: "Derecho"   },
  { id: "izquierdo", label: "Izquierdo" },
];

const INDICACIONES = [
  "Artrosis primaria",
  "Artrosis secundaria",
  "Fractura",
  "Necrosis avascular",
  "Displasia",
  "Artritis reumatoide",
  "Falla de prótesis previa (revisión)",
  "Otra",
];

export default function PasoCirugia({ onComplete, onBack, inicial = {} }) {
  const [articulacion, setArticulacion] = useState(inicial.articulacion || "");
  const [lado,         setLado]         = useState(inicial.lado         || "");
  const [indicacion,   setIndicacion]   = useState(inicial.indicacion   || "");
  const [error,        setError]        = useState(null);

  function handleContinuar() {
    if (!articulacion) { setError("Seleccione cadera o rodilla"); return; }
    if (!lado)         { setError("Seleccione el lado operado");  return; }
    if (!indicacion)   { setError("Seleccione la indicación");    return; }
    setError(null);
    onComplete?.({ articulacion, lado, indicacion });
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Tipo de cirugía</h1>
          <p>¿Qué articulación y lado fue operado?</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && <div className="registro-error" style={{ marginBottom: 14 }}>{error}</div>}

          {/* Articulación */}
          <p className="dp-section-title">¿Qué articulación fue operada?</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {ARTICULACIONES.map(a => (
              <button key={a.id} onClick={() => setArticulacion(a.id)} style={{
                flex: 1, padding: "18px 0",
                border: `1.5px solid ${articulacion === a.id ? "#0f172a" : "#e2e8f0"}`,
                borderRadius: 10,
                background: articulacion === a.id ? "#0f172a" : "#fff",
                color: articulacion === a.id ? "#fff" : "#0f172a",
                fontSize: 15, fontWeight: articulacion === a.id ? 700 : 500,
                cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 28 }}>{a.icono}</span>
                {a.label}
                {articulacion === a.id && <span style={{ fontSize: 12 }}>✓</span>}
              </button>
            ))}
          </div>

          {/* Lado */}
          {articulacion && (
            <>
              <p className="dp-section-title">¿Qué lado fue operado?</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {LADOS.map(l => (
                  <button key={l.id} onClick={() => setLado(l.id)} style={{
                    flex: 1, padding: "13px 0",
                    border: `1.5px solid ${lado === l.id ? "#0f172a" : "#e2e8f0"}`,
                    borderRadius: 10,
                    background: lado === l.id ? "#0f172a" : "#fff",
                    color: lado === l.id ? "#fff" : "#0f172a",
                    fontSize: 14, fontWeight: lado === l.id ? 700 : 400,
                    cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}>
                    {l.label}{lado === l.id && " ✓"}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Indicación */}
          {articulacion && lado && (
            <>
              <p className="dp-section-title">¿Cuál fue el motivo de la cirugía?</p>
              <div className="registro-form">
                <select value={indicacion} onChange={e => setIndicacion(e.target.value)}>
                  <option value="">Seleccionar…</option>
                  {INDICACIONES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}>← Volver</button>
            {articulacion && lado && indicacion && (
              <button className="dp-btn-primary" onClick={handleContinuar}>Continuar →</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
