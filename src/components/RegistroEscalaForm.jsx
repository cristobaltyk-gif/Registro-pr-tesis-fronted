import { useState, useEffect } from "react";
import "../styles/dashboard-pacientes.css";
import EscalaOKS from "./EscalaOKS";
import EscalaHHS from "./EscalaHHS";
// import EscalaOHS from "./EscalaOHS"; // opcional, si agregas oxford_hip al backend

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;

// Mapea articulación → claves de escalas del backend (ver ESCALAS en registro_escalas.py)
// Backend actual soporta: "harris_hip", "oxford_knee", "womac"
const ESCALAS_POR_ARTICULACION = {
  cadera:  ["harris_hip"],   // + "womac" si quieres aplicar ambas
  rodilla: ["oxford_knee"],  // + "womac" si quieres aplicar ambas
};

// Detecta articulación desde el string tipo_protesis o articulacion
function detectarArticulacion(articulacion) {
  const a = (articulacion || "").toLowerCase();
  if (a.includes("cadera"))  return "cadera";
  if (a.includes("rodilla")) return "rodilla";
  return null;
}

const PERIODO_LABEL = {
  preop: "Pre-operatorio",
  "3m":  "3 meses",
  "6m":  "6 meses",
  "1a":  "1 año",
  "2a":  "2 años",
};

// ============================================================
// PANTALLA FINAL DE RESULTADO
// ============================================================
function ResultadoFinal({ resultado, periodo, onComplete }) {
  const score        = resultado?.score ?? 0;
  const interp       = resultado?.interpretacion || "";
  const escalaNombre = resultado?.escala_nombre || "";

  // Colores según tipo de interpretación
  function estiloInterpretacion(txt) {
    const t = (txt || "").toLowerCase();
    if (t.includes("excel") || t.includes("muy buena"))    return { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" };
    if (t.includes("bueno") || t.includes("menor"))        return { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" };
    if (t.includes("regular") || t.includes("moderad"))    return { bg: "#fffbeb", border: "#fde68a", color: "#d97706" };
    if (t.includes("malo") || t.includes("sever") || t.includes("limitada")) return { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" };
    return { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" };
  }
  const c = estiloInterpretacion(interp);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>✅ Evaluación guardada</h1>
          <p>Su resultado se registró correctamente</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card" style={{ textAlign: "center" }}>

          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>

          <div style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 12,
            padding: "24px 20px",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, color: c.color, fontWeight: 700, marginBottom: 4 }}>
              {escalaNombre}
            </div>
            <div style={{ fontSize: 11, color: c.color, marginBottom: 12 }}>
              Evaluación {PERIODO_LABEL[periodo] || periodo}
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: c.color, marginBottom: 6 }}>
              {score}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>
              {interp}
            </div>
          </div>

          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
            Le avisaremos cuando sea momento de la siguiente evaluación.
          </p>

          <button className="dp-btn-primary" onClick={onComplete} style={{ padding: "14px 32px" }}>
            Volver al mapa →
          </button>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function RegistroEscalaForm({
  token,
  cirugiaId,
  articulacion,
  periodo,
  onComplete,
  onBack,
}) {
  const artNormalizada = detectarArticulacion(articulacion);
  const escalasAAplicar = ESCALAS_POR_ARTICULACION[artNormalizada] || [];

  const [indiceEscala, setIndiceEscala] = useState(0);  // Qué escala estamos aplicando
  const [saving,       setSaving]       = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState(null); // Último resultado recibido del backend
  const [error,        setError]        = useState(null);

  const escalaActualKey = escalasAAplicar[indiceEscala]; // ej: "harris_hip"

  // Si no hay escala que aplicar, mostrar error amigable
  if (escalasAAplicar.length === 0) {
    return (
      <div className="dp-root">
        <div className="dp-content" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 16, color: "#475569", marginBottom: 24 }}>
            No hay evaluación disponible para esta articulación.
          </div>
          <button className="dp-btn-primary" onClick={onComplete}>
            ← Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  // Handler al completar una escala individual (viene de EscalaHHS / EscalaOKS)
  // Cada hijo debe llamar onComplete({ respuestas: { id1: valor1, id2: valor2, ... } })
  async function handleEscalaCompleta(data) {
    if (!data?.respuestas || typeof data.respuestas !== "object") {
      setError("Formato de respuestas inválido en la escala.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        escala:     escalaActualKey,            // "harris_hip" | "oxford_knee" | "womac"
        respuestas: data.respuestas,            // { dolor: 44, distancia_marcha: 8, ... }
      };

      const res = await fetch(
        `${API_URL}/api/registro/escalas/${cirugiaId}/${periodo}`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || `Error ${res.status} guardando evaluación`);
      }

      const resp = await res.json();

      // ¿Hay más escalas que aplicar para esta articulación?
      const siguiente = indiceEscala + 1;
      if (siguiente < escalasAAplicar.length) {
        setIndiceEscala(siguiente);
      } else {
        // Última escala → mostrar resultado final
        setResultadoFinal({
          score:          resp.score,
          interpretacion: resp.interpretacion,
          escala_nombre:  resp.escala_nombre || escalaActualKey,
        });
      }

    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Loading
  if (saving) {
    return (
      <div className="dp-root">
        <div className="dp-content" style={{ padding: "64px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>💾</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
            Guardando evaluación...
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="dp-root">
        <div className="dp-content" style={{ padding: "32px 24px" }}>
          <div className="registro-error" style={{ marginBottom: 16 }}>
            ❌ {error}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="dp-btn-secondary"
              style={{ flex: 1, padding: "14px" }}
              onClick={() => setError(null)}
            >
              Reintentar
            </button>
            <button
              className="dp-btn-primary"
              style={{ flex: 1, padding: "14px" }}
              onClick={onComplete}
            >
              Volver al mapa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resultado final
  if (resultadoFinal) {
    return (
      <ResultadoFinal
        resultado={resultadoFinal}
        periodo={periodo}
        onComplete={onComplete}
      />
    );
  }

  // Render de la escala actual
  const propsEscala = {
    onComplete: handleEscalaCompleta,
    onBack:     onBack || onComplete,
  };

  if (escalaActualKey === "oxford_knee") return <EscalaOKS {...propsEscala} />;
  if (escalaActualKey === "harris_hip")  return <EscalaHHS {...propsEscala} />;
  // if (escalaActualKey === "oxford_hip")  return <EscalaOHS {...propsEscala} />; // si activas oxford_hip en backend

  // Fallback
  return (
    <div className="dp-root">
      <div className="dp-content" style={{ padding: "48px 24px", textAlign: "center" }}>
        <div>Escala no implementada: {escalaActualKey}</div>
        <button className="dp-btn-primary" style={{ marginTop: 16 }} onClick={onComplete}>
          Volver
        </button>
      </div>
    </div>
  );
      }
