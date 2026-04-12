import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const PERIODO_LABEL = {
  "postop": "Evaluación postoperatoria temprana (0-3 meses)",
  "6m":     "Evaluación 6 meses",
  "1a":     "Evaluación 1 año",
  "2a":     "Evaluación 2 años o más",
};

function getDias(fechaISO) {
  if (!fechaISO) return null;
  const diff = Math.floor((new Date() - new Date(fechaISO)) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

function getPeriodo(dias) {
  if (dias === null) return null;
  if (dias <= 90)  return "postop";
  if (dias <= 270) return "6m";
  if (dias <= 545) return "1a";
  return "2a";
}

export default function PasoFecha({ token, datos, onComplete, onBack }) {
  const [fechaCirugia, setFechaCirugia] = useState(datos.fecha_cirugia || "");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState(null);

  const dias    = getDias(fechaCirugia);
  const periodo = getPeriodo(dias);

  async function handleGuardar() {
    if (!fechaCirugia) { setError("Ingrese la fecha de su cirugía"); return; }
    if (dias === null)  { setError("La fecha no puede ser futura"); return; }
    setError(null);
    setSaving(true);
    try {
      const payload = {
        fecha_cirugia:   fechaCirugia,
        tipo_protesis:   datos.articulacion === "rodilla"
                           ? (datos.tipo_cirugia || "Rodilla total")
                           : (datos.tipo_cirugia || "Cadera total"),
        lado:            datos.lado           || "",
        indicacion:      datos.indicacion     || "",
        nombre_clinica:  datos.clinica        || "",
        ciudad_clinica:  datos.ciudad         || "",
        region_clinica:  datos.region         || "",
        nombre_cirujano: datos.nombre_medico  || "Por confirmar",
        rut_cirujano:    datos.rut_medico     || "",
        marca_implante:  datos.marca          || "",
        cotilo:          datos.cotilo         || "",
        vastago:         datos.vastago        || "",
        modelo_implante: datos.modelo         || "",
        robotica:        datos.robotica       || "",
        alineacion:      datos.alineacion     || "",
        notas:           "",
      };

      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando");
      }

      const data = await res.json();
      onComplete?.({ id: data.id || data.data?.id, periodo_escala: periodo });

    } catch (e) { setError(e.message); }
    finally     { setSaving(false); }
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Fecha de la cirugía</h1>
          <p>¿Cuándo fue operado?</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && <div className="registro-error" style={{ marginBottom: 14 }}>{error}</div>}

          <p className="dp-section-title">Fecha de su cirugía</p>
          <div className="registro-form">
            <input
              type="date"
              value={fechaCirugia}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => { setFechaCirugia(e.target.value); setError(null); }}
            />
          </div>

          {fechaCirugia && dias !== null && periodo && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 10, padding: "14px 16px", marginTop: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 8 }}>
                📅 {dias === 0 ? "Operado hoy" : `${dias} día${dias !== 1 ? "s" : ""} desde la cirugía`}
              </div>
              <div style={{
                background: "#0f172a", color: "#fff",
                borderRadius: 8, padding: "8px 12px",
                fontSize: 12, fontWeight: 700, display: "inline-block",
              }}>
                📋 {PERIODO_LABEL[periodo]}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}>← Volver</button>
            {fechaCirugia && dias !== null && (
              <button className="dp-btn-primary" onClick={handleGuardar}
                disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? "Guardando…" : "Finalizar registro →"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
