import { useState, useEffect } from "react";
import "../styles/dashboard-pacientes.css";

// Tipos por articulación — calzan EXACTO con backend CirugiaPayload.tipo_protesis
const TIPOS_POR_ARTICULACION = {
  cadera: [
    { value: "Cadera total",                      label: "Prótesis total",   descripcion: "Reemplazo completo de la articulación" },
    { value: "Cadera parcial (hemiartroplastía)", label: "Prótesis parcial", descripcion: "Reemplazo solo de la cabeza femoral (hemiartroplastía)" },
  ],
  rodilla: [
    { value: "Rodilla total",             label: "Prótesis total",             descripcion: "Reemplazo completo de la articulación" },
    { value: "Rodilla unicompartimental", label: "Prótesis unicompartimental", descripcion: "Reemplazo de un solo compartimento de la rodilla" },
  ],
};

// Compartimentos para unicompartimental de rodilla
const COMPARTIMENTOS_RODILLA = [
  { value: "medial",        label: "Compartimento medial",   descripcion: "Lado interno de la rodilla (el más común)" },
  { value: "lateral",       label: "Compartimento lateral",  descripcion: "Lado externo de la rodilla" },
  { value: "patelofemoral", label: "Patelofemoral",          descripcion: "Entre la rótula y el fémur" },
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
  const articulacion = (inicial.articulacion || "").toLowerCase();
  const lado         = inicial.lado || "";

  const esCadera  = articulacion === "cadera";
  const esRodilla = articulacion === "rodilla";
  const tipos     = TIPOS_POR_ARTICULACION[articulacion] || [];

  const [tipoProtesis,    setTipoProtesis]    = useState(inicial.tipo_protesis   || "");
  const [compartimento,   setCompartimento]   = useState(inicial.compartimento   || "");
  const [indicacion,      setIndicacion]      = useState(inicial.indicacion      || "");
  const [otraIndicacion,  setOtraIndicacion]  = useState("");
  const [error,           setError]           = useState(null);

  // Auto-seleccionar "total" por defecto
  useEffect(() => {
    if (!tipoProtesis && tipos.length > 0) {
      setTipoProtesis(tipos[0].value);
    }
  }, []);

  // ¿La selección actual requiere elegir compartimento? (solo uni rodilla)
  const requiereCompartimento = tipoProtesis === "Rodilla unicompartimental";

  // Si cambia el tipo y ya no es uni, limpiar compartimento
  useEffect(() => {
    if (!requiereCompartimento && compartimento) {
      setCompartimento("");
    }
  }, [requiereCompartimento]);

  if (!esCadera && !esRodilla) {
    return (
      <div className="dp-root">
        <div className="dp-content">
          <div className="dp-card">
            <div className="registro-error">
              Error: no se detectó articulación. Vuelva al mapa.
            </div>
            <button className="dp-btn-secondary" style={{ marginTop: 12 }} onClick={onBack}>
              ← Volver al mapa
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleContinuar() {
    setError(null);
    if (!tipoProtesis) {
      setError("Seleccione el tipo de prótesis");
      return;
    }
    if (requiereCompartimento && !compartimento) {
      setError("Seleccione qué compartimento se reemplazó");
      return;
    }
    if (!indicacion) {
      setError("Seleccione el motivo de la cirugía");
      return;
    }
    if (indicacion === "Otra" && !otraIndicacion.trim()) {
      setError("Especifique la indicación");
      return;
    }

    onComplete?.({
      tipo_protesis: tipoProtesis,
      compartimento: requiereCompartimento ? compartimento : "",
      indicacion: indicacion === "Otra" ? otraIndicacion.trim() : indicacion,
    });
  }

  const ladoLabel = lado === "Derecho" ? "derecha" : lado === "Izquierdo" ? "izquierda" : "";
  const articulacionLabel = `${articulacion.charAt(0).toUpperCase()}${articulacion.slice(1)} ${ladoLabel}`;

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Datos de la cirugía</h1>
          <p>Tipo de prótesis y motivo</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {/* Resumen del mapa */}
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>{esCadera ? "🦴" : "🦵"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>
                Registrando
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                {articulacionLabel}
              </div>
            </div>
          </div>

          {error && <div className="registro-error" style={{ marginBottom: 14 }}>{error}</div>}

          {/* Tipo de prótesis */}
          <p className="dp-section-title">¿Qué tipo de prótesis se colocó?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {tipos.map(t => {
              const selected = tipoProtesis === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTipoProtesis(t.value)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    border: `1.5px solid ${selected ? "#0f172a" : "#e2e8f0"}`,
                    borderRadius: 10,
                    background: selected ? "#0f172a" : "#fff",
                    color: selected ? "#fff" : "#0f172a",
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.4 }}>{t.descripcion}</div>
                  </div>
                  {selected && <span style={{ fontSize: 16 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Compartimento — solo si es uni rodilla */}
          {requiereCompartimento && (
            <>
              <p className="dp-section-title">¿Cuál compartimento se reemplazó?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {COMPARTIMENTOS_RODILLA.map(c => {
                  const selected = compartimento === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setCompartimento(c.value)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        border: `1.5px solid ${selected ? "#0f172a" : "#e2e8f0"}`,
                        borderRadius: 10,
                        background: selected ? "#0f172a" : "#fff",
                        color: selected ? "#fff" : "#0f172a",
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{c.label}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>{c.descripcion}</div>
                      </div>
                      {selected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Indicación */}
          <p className="dp-section-title">¿Cuál fue el motivo de la cirugía?</p>
          <div className="registro-form" style={{ marginBottom: 10 }}>
            <select value={indicacion} onChange={e => setIndicacion(e.target.value)}>
              <option value="">Seleccionar…</option>
              {INDICACIONES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {indicacion === "Otra" && (
            <div className="registro-form" style={{ marginBottom: 10 }}>
              <input
                placeholder="Especifique el motivo"
                value={otraIndicacion}
                onChange={e => setOtraIndicacion(e.target.value)}
              />
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              className="dp-btn-secondary"
              style={{ width: "auto", padding: "11px 20px" }}
              onClick={onBack}
            >
              ← Volver
            </button>
            {tipoProtesis &&
             (!requiereCompartimento || compartimento) &&
             indicacion &&
             (indicacion !== "Otra" || otraIndicacion.trim()) && (
              <button className="dp-btn-primary" style={{ flex: 1 }} onClick={handleContinuar}>
                Continuar →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
      }
