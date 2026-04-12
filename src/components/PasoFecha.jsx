import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const PERIODO_LABEL = {
  preop: "Evaluación preoperatoria",
  "3m":  "Evaluación 3 meses",
  "6m":  "Evaluación 6 meses",
  "1a":  "Evaluación 1 año",
  "2a":  "Evaluación 2 años",
};

function getDias(fechaISO) {
  if (!fechaISO) return null;
  const diff = Math.floor((new Date() - new Date(fechaISO)) / (1000 * 60 * 60 * 24));
  return diff;
}

function getPeriodo(dias) {
  if (dias === null) return null;
  if (dias <= 0)   return "preop"; // fecha futura o hoy → preop
  if (dias < 60)   return "preop";
  if (dias < 150)  return "3m";
  if (dias < 270)  return "6m";
  if (dias < 545)  return "1a";
  return "2a";
}

export default function PasoFecha({ token, datos, onComplete, onBack }) {
  const [fechaCirugia, setFechaCirugia] = useState(datos.fecha_cirugia || "");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState(null);

  const dias       = getDias(fechaCirugia);
  const esFutura   = dias !== null && dias < 0;
  const esHoy      = dias === 0;
  const periodo    = getPeriodo(dias);

  function getResumenTexto() {
    if (dias === null) return null;
    if (esFutura) {
      const diasFaltan = Math.abs(dias);
      return `Faltan ${diasFaltan} día${diasFaltan !== 1 ? "s" : ""} para la cirugía`;
    }
    if (esHoy) return "Operado hoy";
    return `${dias} día${dias !== 1 ? "s" : ""} desde la cirugía`;
  }

  async function handleGuardar() {
    if (!fechaCirugia) { setError("Ingrese la fecha de su cirugía"); return; }
    setError(null);
    setSaving(true);
    try {
      const payload = {
        fecha_cirugia:   fechaCirugia,
        tipo_protesis:   datos.articulacion === "rodilla"
                           ? (datos.tipo_cirugia || "Rodilla total")
                           : (datos.tipo_cirugia || "Cadera total"),
        lado:            datos.lado            || "",
        indicacion:      datos.indicacion      || "",
        nombre_clinica:  datos.clinica         || "",
        ciudad_clinica:  datos.ciudad          || "",
        region_clinica:  datos.region          || "",
        nombre_cirujano: datos.nombre_medico   || "Por confirmar",
        rut_cirujano:    datos.rut_medico      || "",
        marca_implante:  datos.marca           || "",
        cotilo:          datos.cotilo          || "",
        vastago:         datos.vastago         || "",
        modelo_implante: datos.modelo          || "",
        robotica:        datos.robotica        || "",
        alineacion:      datos.alineacion      || "",
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
      onComplete?.({
        id:             data.id || data.data?.id,
        periodo_escala: periodo,
      });

    } catch (e) { setError(e.message); }
    finally     { setSaving(false); }
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Fecha de la cirugía</h1>
          <p>¿Cuándo fue o será operado?</p>
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
              onChange={e => { setFechaCirugia(e.target.value); setError(null); }}
            />
          </div>

          {/* Resumen */}
          {fechaCirugia && periodo && (
            <div style={{
              background: esFutura ? "#eff6ff" : "#f0fdf4",
              border: `1px solid ${esFutura ? "#bfdbfe" : "#bbf7d0"}`,
              borderRadius: 10, padding: "14px 16px", marginTop: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: esFutura ? "#1d4ed8" : "#166534", marginBottom: 6 }}>
                📅 {getResumenTexto()}
              </div>

              {esFutura ? (
                <div style={{ fontSize: 12, color: "#1d4ed8", marginBottom: 8 }}>
                  Cirugía programada — se registrará como pendiente.
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#166534", marginBottom: 8 }}>
                  {dias < 60
                    ? "Postoperatorio reciente."
                    : dias < 150
                    ? "A los 3 meses de la cirugía."
                    : dias < 270
                    ? "A los 6 meses de la cirugía."
                    : dias < 545
                    ? "Al año de la cirugía."
                    : "A los 2 años de la cirugía."}
                </div>
              )}

              <div style={{
                background: "#0f172a", color: "#fff",
                borderRadius: 8, padding: "8px 12px",
                fontSize: 12, fontWeight: 700, display: "inline-block",
              }}>
                📋 Evaluación a completar: {PERIODO_LABEL[periodo]}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}>← Volver</button>
            {fechaCirugia && periodo && (
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
