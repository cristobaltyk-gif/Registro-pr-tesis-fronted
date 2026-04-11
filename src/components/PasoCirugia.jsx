import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const TIPOS_CIRUGIA = [
  { id: "cadera_total",              label: "Prótesis de cadera total",                articulacion: "cadera"  },
  { id: "cadera_parcial",            label: "Prótesis de cadera parcial (hemiartroplastía)", articulacion: "cadera"  },
  { id: "rodilla_total",             label: "Prótesis de rodilla total",                articulacion: "rodilla" },
  { id: "rodilla_unicompartimental", label: "Prótesis de rodilla unicompartimental",    articulacion: "rodilla" },
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
  const [tipoCirugia, setTipoCirugia] = useState(inicial.tipo_cirugia || "");
  const [lado,        setLado]        = useState(inicial.lado         || "");
  const [indicacion,  setIndicacion]  = useState(inicial.indicacion   || "");
  const [error,       setError]       = useState(null);

  function handleContinuar() {
    if (!tipoCirugia) { setError("Seleccione el tipo de cirugía"); return; }
    if (!lado)        { setError("Seleccione el lado operado");    return; }
    if (!indicacion)  { setError("Seleccione la indicación");      return; }
    setError(null);
    const articulacion = TIPOS_CIRUGIA.find(t => t.id === tipoCirugia)?.articulacion || "cadera";
    onComplete?.({ tipo_cirugia: tipoCirugia, articulacion, lado, indicacion });
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

          <p className="dp-section-title">¿Qué tipo de prótesis le colocaron?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {TIPOS_CIRUGIA.map(t => (
              <button key={t.id} onClick={() => setTipoCirugia(t.id)} style={{
                textAlign: "left", padding: "13px 16px",
                border: `1.5px solid ${tipoCirugia === t.id ? "#0f172a" : "#e2e8f0"}`,
                borderRadius: 10,
                background: tipoCirugia === t.id ? "#0f172a" : "#fff",
                color: tipoCirugia === t.id ? "#fff" : "#0f172a",
                fontSize: 14, fontWeight: tipoCirugia === t.id ? 700 : 400,
                cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{t.articulacion === "cadera" ? "🦴" : "🦵"}</span>
                {t.label}
                {tipoCirugia === t.id && <span style={{ marginLeft: "auto" }}>✓</span>}
              </button>
            ))}
          </div>

          {tipoCirugia && (
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

          {tipoCirugia && lado && (
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
            {tipoCirugia && lado && indicacion && (
              <button className="dp-btn-primary" onClick={handleContinuar}>Continuar →</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
