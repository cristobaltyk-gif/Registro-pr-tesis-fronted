import { useState } from "react";
import "../styles/dashboard-pacientes.css";

export default function PasoFecha({ onComplete, onBack, inicial = {} }) {
  const [fechaCirugia, setFechaCirugia] = useState(inicial.fecha_cirugia || "");
  const [error,        setError]        = useState(null);

  function getDiasPostop() {
    if (!fechaCirugia) return null;
    const hoy   = new Date();
    const fecha = new Date(fechaCirugia);
    const diff  = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }

  function getPeriodoLabel(dias) {
    if (dias === null) return null;
    if (dias < 0)    return null;
    if (dias <= 30)  return "Postoperatorio inmediato (menos de 1 mes)";
    if (dias <= 90)  return "Postoperatorio temprano (1-3 meses)";
    if (dias <= 180) return "Seguimiento 3-6 meses";
    if (dias <= 365) return "Seguimiento 6-12 meses";
    if (dias <= 730) return "Seguimiento 1-2 años";
    return "Seguimiento mayor a 2 años";
  }

  function getEscalaAplicable(dias) {
    if (dias === null) return null;
    if (dias < 60)   return "preop";
    if (dias < 150)  return "3m";
    if (dias < 270)  return "6m";
    if (dias < 545)  return "1a";
    return "2a";
  }

  const dias    = getDiasPostop();
  const periodo = getPeriodoLabel(dias);
  const escala  = getEscalaAplicable(dias);

  const ESCALA_LABEL = {
    preop: "Evaluación preoperatoria",
    "3m":  "Evaluación 3 meses",
    "6m":  "Evaluación 6 meses",
    "1a":  "Evaluación 1 año",
    "2a":  "Evaluación 2 años",
  };

  function handleContinuar() {
    if (!fechaCirugia) { setError("Ingrese la fecha de su cirugía"); return; }
    const fecha = new Date(fechaCirugia);
    const hoy   = new Date();
    if (fecha > hoy) { setError("La fecha no puede ser futura"); return; }
    setError(null);
    onComplete?.({
      fecha_cirugia: fechaCirugia,
      dias_postop:   dias,
      periodo_escala: escala,
    });
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Fecha de la cirugía</h1>
          <p>Paso 4 de 4 — ¿Cuándo fue operado?</p>
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

          {/* Resumen postop */}
          {fechaCirugia && dias !== null && (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 10,
              padding: "14px 16px",
              marginTop: 16,
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 6 }}>
                📅 {dias === 0 ? "Operado hoy" : `${dias} días desde la cirugía`}
              </div>
              {periodo && (
                <div style={{ fontSize: 12, color: "#166534", marginBottom: 6 }}>
                  {periodo}
                </div>
              )}
              {escala && (
                <div style={{
                  background: "#0f172a",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 8,
                  display: "inline-block",
                }}>
                  📋 Evaluación a completar: {ESCALA_LABEL[escala]}
                </div>
              )}
            </div>
          )}

          {fechaCirugia && dias !== null && dias < 0 && (
            <div className="registro-error" style={{ marginTop: 8 }}>
              La fecha ingresada es futura — verifique
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}>
              ← Volver
            </button>
            {fechaCirugia && dias !== null && dias >= 0 && (
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
