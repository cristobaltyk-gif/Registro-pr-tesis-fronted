import { useState } from "react";
import "../styles/dashboard-pacientes.css";
import EscalaOKS from "./EscalaOKS";
import EscalaOHS from "./EscalaOHS";
import EscalaHHS from "./EscalaHHS";

const API_URL = import.meta.env.VITE_API_URL;

function ResultadoFinal({ resultado, onComplete }) {
  const colores = {
    "Excelente": { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
    "Bueno":     { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
    "Moderado":  { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
    "Regular":   { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
    "Severo":    { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
    "Malo":      { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
  };
  const c = colores[resultado.interpretacion] || colores["Bueno"];

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Evaluación completada</h1>
          <p>Gracias por completar su evaluación</p>
        </div>
      </div>
      <div className="dp-content">
        <div className="dp-card" style={{ textAlign: "center" }}>

          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>

          <div style={{
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 12, padding: "20px 16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, color: c.color, fontWeight: 700, marginBottom: 4 }}>
              {resultado.escala}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: c.color, marginBottom: 4 }}>
              {resultado.score}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>
              {resultado.interpretacion}
            </div>
          </div>

          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
            Su resultado ha sido registrado. Le avisaremos cuando sea el momento de su próxima evaluación.
          </p>

          <button className="dp-btn-primary" onClick={onComplete}>
            Ver mi registro →
          </button>

        </div>
      </div>
    </div>
  );
}

export default function RegistroEscalaForm({ token, cirugiaId, articulacion, periodo, onComplete }) {
  const [escalaActual, setEscalaActual] = useState(
    articulacion === "rodilla" ? "OKS" : "OHS"
  );
  const [resultados,   setResultados]   = useState({});
  const [saving,       setSaving]       = useState(false);
  const [finalResult,  setFinalResult]  = useState(null);
  const [error,        setError]        = useState(null);

  async function handleEscalaComplete(data) {
    const nuevos = { ...resultados, [data.escala]: data };

    // Cadera: hacemos OHS primero, luego HHS
    if (articulacion === "cadera" && data.escala === "OHS") {
      setResultados(nuevos);
      setEscalaActual("HHS");
      return;
    }

    // Guardar resultados
    setSaving(true);
    try {
      const payload = {
        cirugia_id:  cirugiaId,
        periodo,
        resultados:  nuevos,
      };

      const res = await fetch(`${API_URL}/api/registro/escalas`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j?.detail || "Error guardando"); }

      // Mostrar resultado final
      const ultimo = data;
      setFinalResult(ultimo);

    } catch (e) { setError(e.message); }
    finally     { setSaving(false); }
  }

  if (saving) return <div className="dp-loading">Guardando evaluación…</div>;

  if (error) return (
    <div className="dp-content">
      <div className="registro-error">{error}</div>
      <button className="dp-btn-secondary" style={{ marginTop: 12 }} onClick={onComplete}>Continuar →</button>
    </div>
  );

  if (finalResult) return <ResultadoFinal resultado={finalResult} onComplete={onComplete} />;

  if (escalaActual === "OKS") return <EscalaOKS onComplete={handleEscalaComplete} onBack={onComplete} />;
  if (escalaActual === "OHS") return <EscalaOHS onComplete={handleEscalaComplete} onBack={onComplete} />;
  if (escalaActual === "HHS") return <EscalaHHS onComplete={handleEscalaComplete} onBack={() => setEscalaActual("OHS")} />;

  return null;
}
