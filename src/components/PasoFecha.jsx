import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;

function getDias(fechaISO) {
  if (!fechaISO) return null;
  const diff = Math.floor((new Date() - new Date(fechaISO)) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

// Normaliza lado al formato que espera el backend: "Derecho" | "Izquierdo"
function normalizarLado(lado) {
  if (!lado) return "";
  const l = lado.toLowerCase();
  if (l.startsWith("d")) return "Derecho";
  if (l.startsWith("i")) return "Izquierdo";
  return lado;
}

// Construye el tipo_protesis que espera el backend
// Opciones válidas en el backend: "Cadera total", "Cadera parcial (hemiartroplastía)",
//                                 "Rodilla total", "Rodilla unicompartimental"
function construirTipoProtesis(datos) {
  // Si el paso anterior ya eligió tipo_cirugia o tipo_protesis completo, úsalo
  if (datos.tipo_protesis) return datos.tipo_protesis;
  if (datos.tipo_cirugia && datos.tipo_cirugia.includes(" ")) return datos.tipo_cirugia;

  // Fallback: construir desde articulación
  const art = (datos.articulacion || "").toLowerCase();
  if (art.includes("cadera"))  return "Cadera total";
  if (art.includes("rodilla")) return "Rodilla total";
  return datos.articulacion || "";
}

export default function PasoFecha({ token, datos, onComplete, onBack }) {
  const [fechaCirugia, setFechaCirugia] = useState(datos.fecha_cirugia || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const dias = getDias(fechaCirugia);
  const ladoNormalizado     = normalizarLado(datos.lado);
  const tipoProtesisFinal   = construirTipoProtesis(datos);

  async function handleGuardar() {
    if (!fechaCirugia) {
      setError("Ingrese la fecha de su cirugía");
      return;
    }
    if (dias === null) {
      setError("La fecha no puede ser futura");
      return;
    }
    if (!tipoProtesisFinal) {
      setError("Falta el tipo de prótesis. Vuelva atrás y complételo.");
      return;
    }
    if (!ladoNormalizado) {
      setError("Falta el lado de la prótesis. Vuelva atrás y complételo.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      // Payload exacto que espera el backend (ver routers/registro_cirugia.py → CirugiaPayload)
      const payload = {
        fecha_cirugia:    fechaCirugia,
        tipo_protesis:    tipoProtesisFinal,
        lado:             ladoNormalizado,
        indicacion:       datos.indicacion || "",

        // Clínica
        nombre_clinica:   datos.clinica        || datos.nombre_clinica || "",
        ciudad_clinica:   datos.ciudad         || datos.ciudad_clinica || "",
        region_clinica:   datos.region         || datos.region_clinica || "",

        // Cirujano
        nombre_cirujano:  datos.nombre_medico  || datos.nombre_cirujano || "Por confirmar",
        rut_cirujano:     datos.rut_medico     || datos.rut_cirujano    || "",

        // Implante
        marca_implante:   datos.marca          || datos.marca_implante  || "",
        modelo_implante:  datos.modelo         || datos.modelo_implante || "",
        cotilo:           datos.cotilo         || "",
        vastago:          datos.vastago        || "",
        fijacion:         datos.fijacion       || "",
        abordaje:         datos.abordaje       || "",
        alineacion:       datos.alineacion     || "",
        robotica:         datos.robotica       || "",

        // Extras
        prevision:        datos.prevision      || "",
        notas:            datos.notas          || "",
      };

      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || `Error ${res.status} guardando cirugía`);
      }

      const data = await res.json();

      // Prótesis creada → volver al dashboard actualizado
      onComplete?.({
        id: data.id || data.data?.id,
      });

    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Helpers de display
  const tieneLugar    = !!(datos.clinica || datos.nombre_clinica);
  const tieneCirugia  = !!tipoProtesisFinal;
  const tieneImplante = !!(datos.marca || datos.marca_implante);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Fecha de cirugía</h1>
          <p>Último paso: indique cuándo fue operado</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error && (
            <div className="registro-error" style={{ marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* RESUMEN (no editable) */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Resumen de su prótesis
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ItemResumen
                label="Articulación"
                valor={`${tipoProtesisFinal || "—"} ${ladoNormalizado ? `· ${ladoNormalizado.toLowerCase()}` : ""}`}
                icono="🦴"
              />

              {tieneLugar && (
                <ItemResumen
                  label="Centro"
                  valor={`${datos.clinica || datos.nombre_clinica}${(datos.ciudad || datos.ciudad_clinica) ? ` · ${datos.ciudad || datos.ciudad_clinica}` : ""}`}
                  icono="🏥"
                />
              )}

              {(datos.nombre_medico || datos.nombre_cirujano) && (
                <ItemResumen
                  label="Cirujano"
                  valor={datos.nombre_medico || datos.nombre_cirujano}
                  icono="👨‍⚕️"
                />
              )}

              {tieneImplante && (
                <ItemResumen
                  label="Implante"
                  valor={[
                    datos.marca || datos.marca_implante,
                    datos.modelo || datos.modelo_implante,
                    datos.cotilo,
                    datos.vastago,
                  ].filter(Boolean).join(" · ")}
                  icono="🔩"
                />
              )}

              {datos.indicacion && (
                <ItemResumen
                  label="Indicación"
                  valor={datos.indicacion}
                  icono="📋"
                />
              )}
            </div>
          </div>

          {/* FECHA */}
          <p className="dp-section-title" style={{ marginBottom: 8 }}>
            Fecha de la cirugía *
          </p>
          <div className="registro-form">
            <input
              type="date"
              value={fechaCirugia}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => {
                setFechaCirugia(e.target.value);
                setError(null);
              }}
              style={{ fontSize: 16, width: "100%" }}
            />
          </div>

          {/* Preview de días transcurridos */}
          {fechaCirugia && dias !== null && (
            <div style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 10,
              padding: "12px 14px",
              marginTop: 12,
              fontSize: 13,
              color: "#1e40af",
              fontWeight: 600,
            }}>
              📅 {dias === 0 ? "Operado hoy" : `${dias} día${dias !== 1 ? "s" : ""} desde la cirugía`}
            </div>
          )}

          {/* Info sobre siguiente paso */}
          {fechaCirugia && dias !== null && (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 10,
              padding: "12px 14px",
              marginTop: 10,
              fontSize: 12,
              color: "#166534",
              lineHeight: 1.5,
            }}>
              ✅ Al finalizar, su prótesis quedará registrada en el mapa. Podrá completar las evaluaciones de seguimiento tocándola.
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              className="dp-btn-secondary"
              style={{ flex: 1, padding: "12px 0" }}
              onClick={onBack}
              disabled={saving}
            >
              ← Volver
            </button>
            <button
              className="dp-btn-primary"
              style={{ flex: 2, padding: "12px 0" }}
              onClick={handleGuardar}
              disabled={!fechaCirugia || saving || dias === null}
            >
              {saving ? "Guardando…" : "💾 Finalizar registro"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Fila de resumen
function ItemResumen({ label, valor, icono }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13 }}>
      <span style={{ fontSize: 16, lineHeight: 1.2 }}>{icono}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{label}</div>
        <div style={{ color: "#0f172a", fontWeight: 600, wordBreak: "break-word" }}>{valor}</div>
      </div>
    </div>
  );
}
