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
  const [lado, setLado] = useState(datos.lado || ""); // ← NUEVO
  const [segmento, setSegmento] = useState(datos.segmento || ""); // ← NUEVO
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const dias = getDias(fechaCirugia);
  const periodo = getPeriodo(dias);

  // ← NUEVO: Mapeo de articulaciones a segmentos
  const SEGMENTOS_MAP = {
    "cadera": "cadera",
    "rodilla": "rodilla", 
    "hombro": "hombro",
    "tobillo": "tobillo"
  };

  async function handleGuardar() {
    if (!fechaCirugia) { 
      setError("Ingrese la fecha de su cirugía"); 
      return; 
    }
    if (!lado) { 
      setError("Seleccione el lado de la prótesis"); 
      return; 
    }
    if (!segmento) { 
      setError("Seleccione el segmento/articulación"); 
      return; 
    }
    if (dias === null) { 
      setError("La fecha no puede ser futura"); 
      return; 
    }
    
    setError(null);
    setSaving(true);
    
    try {
      const payload = {
        // ← DATOS CLAVE para límites
        segmento:     segmento,
        lado:         lado,
        
        // ← DATOS DE CIRUGÍA
        fecha_cirugia: fechaCirugia,
        tipo_protesis: datos.tipo_cirugia || `${segmento} total`,
        
        // ← DATOS DE CLÍNICA
        nombre_clinica:  datos.clinica    || "",
        ciudad_clinica:  datos.ciudad     || "",
        region_clinica:  datos.region     || "",
        
        // ← DATOS MÉDICO
        nombre_cirujano: datos.nombre_medico || "Por confirmar",
        rut_cirujano:    datos.rut_medico    || "",
        indicacion:      datos.indicacion    || "",
        
        // ← DATOS IMPLANTE
        marca_implante:  datos.marca     || "",
        modelo_implante: datos.modelo    || "",
        cotilo:          datos.cotilo    || "",
        vastago:         datos.vastago   || "",
        robotica:        datos.robotica  || "",
        alineacion:      datos.alineacion || "",
        
        notas: "",
      };

      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        method:  "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando cirugía");
      }

      const data = await res.json();
      
      // ← ENVÍA TODO lo necesario para el esquema
      onComplete?.({
        id: data.id || data.data?.id, 
        periodo_escala: periodo,
        lado,
        segmento,
        tipo: datos.tipo_cirugia // primaria/revision se detectará en backend
      });

    } catch (e) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Fecha y Detalles</h1>
          <p>Complete la información final de su prótesis</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && (
            <div className="registro-error" style={{ marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* LADO */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: "block", 
              fontSize: 13, 
              fontWeight: 600, 
              color: "#374151", 
              marginBottom: 6 
            }}>
              Lado de la prótesis *
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ 
                flex: 1, 
                padding: "12px", 
                border: `2px solid ${lado === 'der' ? '#0f172a' : '#e5e7eb'}`, 
                borderRadius: 8, 
                textAlign: "center",
                cursor: "pointer",
                background: lado === 'der' ? '#f3f4f6' : 'transparent',
                transition: "all 0.2s"
              }}
                onClick={() => setLado('der')}
              >
                <div style={{ fontSize: 48, lineHeight: 1 }}>🦵</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Derecho</div>
              </label>
              <label style={{ 
                flex: 1, 
                padding: "12px", 
                border: `2px solid ${lado === 'izq' ? '#0f172a' : '#e5e7eb'}`, 
                borderRadius: 8, 
                textAlign: "center",
                cursor: "pointer",
                background: lado === 'izq' ? '#f3f4f6' : 'transparent',
                transition: "all 0.2s"
              }}
                onClick={() => setLado('izq')}
              >
                <div style={{ fontSize: 48, lineHeight: 1 }}>🦿</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Izquierdo</div>
              </label>
            </div>
          </div>

          {/* SEGMENTO */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: "block", 
              fontSize: 13, 
              fontWeight: 600, 
              color: "#374151", 
              marginBottom: 6 
            }}>
              Articulación *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {Object.entries(SEGMENTOS_MAP).map(([key, value]) => (
                <label key={key} style={{ 
                  padding: "12px 8px", 
                  border: `2px solid ${segmento === value ? '#0f172a' : '#e5e7eb'}`, 
                  borderRadius: 8, 
                  textAlign: "center",
                  cursor: "pointer",
                  background: segmento === value ? '#f3f4f6' : 'transparent',
                  transition: "all 0.2s"
                }}
                  onClick={() => setSegmento(value)}
                >
                  <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 4 }}>
                    {key === 'cadera' ? '🦴' : key === 'rodilla' ? '🦵' : key === 'hombro' ? '🦾' : '🦶'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* FECHA */}
          <p className="dp-section-title" style={{ marginBottom: 8 }}>Fecha de la cirugía</p>
          <div className="registro-form">
            <input
              type="date"
              value={fechaCirugia}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => { 
                setFechaCirugia(e.target.value); 
                setError(null); 
              }}
              style={{ fontSize: 16 }}
            />
          </div>

          {/* Preview del periodo */}
          {fechaCirugia && dias !== null && periodo && (
            <div style={{
              background: "#f0fdf4", 
              border: "1px solid #bbf7d0",
              borderRadius: 10, 
              padding: "14px 16px", 
              marginTop: 12,
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 700, 
                color: "#166534", 
                marginBottom: 8 
              }}>
                📅 {dias === 0 ? "Operado hoy" : `${dias} día${dias !== 1 ? "s" : ""} desde cirugía`}
              </div>
              <div style={{
                background: "#0f172a", 
                color: "#fff",
                borderRadius: 8, 
                padding: "8px 12px",
                fontSize: 12, 
                fontWeight: 700, 
                display: "inline-block",
              }}>
                📋 {PERIODO_LABEL[periodo]}
              </div>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button 
              className="dp-btn-secondary" 
              style={{ flex: 1, padding: "12px 0" }}
              onClick={onBack}
            >
              ← Volver
            </button>
            <button 
              className="dp-btn-primary" 
              style={{ flex: 1, padding: "12px 0" }}
              onClick={handleGuardar}
              disabled={!fechaCirugia || !lado || !segmento || saving || dias === null}
            >
              {saving ? "Guardando…" : "💾 Finalizar Registro"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
