import { useState, useEffect } from "react";
import "../styles/dashboard-pacientes.css";
import EscalaOKS from "./EscalaOKS";
import EscalaOHS from "./EscalaOHS";
import EscalaHHS from "./EscalaHHS";

const API_URL = import.meta.env.VITE_API_URL;

// ← NUEVO: Mapeo escalas por articulación
const ESCALAS_POR_SEGMENTO = {
  cadera:  ["OHS", "HHS"],  // Oxford Hip + Harris Hip
  rodilla: ["OKS"],         // Oxford Knee  
  hombro:  ["OHS"],         // Oxford Shoulder (adaptado)
  tobillo: ["OKS"]          // Oxford Ankle (adaptado)
};

function ResultadoFinal({ resultado, esquema, onComplete }) {
  const colores = {
    "Excelente": { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
    "Bueno":     { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
    "Moderado":  { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
    "Regular":   { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
    "Severo":    { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
    "Malo":      { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
  };
  const c = colores[resultado.interpretacion] || colores["Bueno"];

  const progreso = Math.round((esquema.completadas + 1) / esquema.total * 100);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>✅ Evaluación Completada</h1>
          <p>Progreso actualizado en su registro</p>
        </div>
      </div>
      <div className="dp-content">
        <div className="dp-card" style={{ textAlign: "center" }}>

          {/* ← NUEVO: Progreso del esquema */}
          <div style={{ 
            background: "#f8fafc", 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24,
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ 
              fontSize: 13, 
              color: "#64748b", 
              marginBottom: 8,
              fontWeight: 500
            }}>
              {esquema.tipo === 'revision' ? '🔄 Revisión' : '🆕 Primaria'} • {esquema.segmento}
            </div>
            <div style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: "#0f172a", 
              marginBottom: 12 
            }}>
              {esquema.completadas + 1} / {esquema.total}
            </div>
            <div style={{ 
              height: 10, 
              background: "#e2e8f0", 
              borderRadius: 5, 
              overflow: "hidden" 
            }}>
              <div style={{ 
                width: `${progreso}%`, 
                height: "100%", 
                background: "#10b981", 
                borderRadius: 5 
              }} />
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              {progreso}% completado
            </div>
          </div>

          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>

          <div style={{
            background: c.bg, 
            border: `1px solid ${c.border}`,
            borderRadius: 12, 
            padding: "24px 20px", 
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 14, color: c.color, fontWeight: 700, marginBottom: 8 }}>
              {resultado.escala}
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: c.color, marginBottom: 8 }}>
              {resultado.score}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>
              {resultado.interpretacion}
            </div>
          </div>

          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
            Su resultado ha sido registrado exitosamente. 
            Le avisaremos cuando sea momento de su próxima evaluación.
          </p>

          <button className="dp-btn-primary" onClick={onComplete} style={{ padding: "14px 32px" }}>
            Ver mi Registro Completo →
          </button>

        </div>
      </div>
    </div>
  );
}

export default function RegistroEscalaForm({ 
  token, 
  cirugiaId, 
  articulacion, 
  periodo, 
  esquema,  // ← NUEVO: recibe esquema
  onComplete 
}) {
  const [escalaActual, setEscalaActual] = useState(null);
  const [resultados,   setResultados]   = useState({});
  const [saving,       setSaving]       = useState(false);
  const [finalResult,  setFinalResult]  = useState(null);
  const [error,        setError]        = useState(null);

  // ← NUEVO: Determina escalas según segmento del esquema
  useEffect(() => {
    if (!esquema?.segmento) return;
    
    const escalas = ESCALAS_POR_SEGMENTO[esquema.segmento] || ["OKS"];
    setEscalaActual(escalas[0]);
  }, [esquema]);

  async function handleEscalaComplete(data) {
    const nuevos = { ...resultados, [data.escala]: data };

    // ← MÚLTIPLES ESCALAS: pasa a la siguiente
    const escalas = ESCALAS_POR_SEGMENTO[esquema?.segmento] || [data.escala];
    const indiceActual = escalas.indexOf(data.escala);
    
    if (indiceActual < escalas.length - 1) {
      setResultados(nuevos);
      setEscalaActual(escalas[indiceActual + 1]);
      return;
    }

    // ← ÚLTIMA ESCALA: guardar todo
    setSaving(true);
    try {
      const payload = {
        cirugia_id: cirugiaId,
        periodo,
        segmento:   esquema.segmento,  // ← NUEVO
        tipo:       esquema.tipo,      // ← NUEVO
        resultados: nuevos,
        total_esquema: esquema.total,  // ← NUEVO
        completadas: (esquema.completadas || 0) + 1
      };

      const res = await fetch(`${API_URL}/api/registro/escalas`, {
        method:  "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) { 
        const j = await res.json().catch(() => ({})); 
        throw new Error(j?.detail || "Error guardando evaluación"); 
      }

      setFinalResult(data);
      
    } catch (e) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
  }

  if (saving) return (
    <div className="dp-root">
      <div className="dp-content" style={{ padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>💾</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>
          Guardando evaluación...
        </div>
        <div style={{ fontSize: 14, color: "#64748b" }}>
          Actualizando su progreso: {esquema?.completadas + 1}/{esquema?.total}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="dp-content">
      <div className="registro-error" style={{ marginBottom: 24 }}>{error}</div>
      <button className="dp-btn-secondary" style={{ width: "100%", padding: "14px" }} 
        onClick={onComplete}>
        Ver Registro →
      </button>
    </div>
  );

  if (finalResult) {
    return (
      <ResultadoFinal 
        resultado={finalResult} 
        esquema={esquema} 
        onComplete={onComplete} 
      />
    );
  }

  // ← RENDER DINÁMICO por escala actual
  const propsEscala = { 
    onComplete: handleEscalaComplete, 
    onBack: () => {
      const escalas = ESCALAS_POR_SEGMENTO[esquema?.segmento] || [];
      const indice = escalas.indexOf(escalaActual);
      if (indice > 0) {
        setEscalaActual(escalas[indice - 1]);
      } else {
        onComplete();
      }
    }
  };

  if (escalaActual === "OKS") return <EscalaOKS {...propsEscala} />;
  if (escalaActual === "OHS") return <EscalaOHS {...propsEscala} />;
  if (escalaActual === "HHS") return <EscalaHHS {...propsEscala} />;

  // ← Loading inicial
  return (
    <div className="dp-root">
      <div className="dp-content" style={{ padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>📋</div>
        <div style={{ fontSize: 18, color: "#64748b" }}>
          Preparando evaluación para {esquema?.segmento}...
        </div>
      </div>
    </div>
  );
}
