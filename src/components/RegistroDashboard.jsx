import { useEffect, useState, useMemo } from "react";
import MapaCuerpoInteractivo from "./MapaCuerpoInteractivo.jsx";
import "../styles/dashboard-pacientes.css";
import "../styles/mapa-cuerpo.css";

const API_URL = import.meta.env.VITE_API_URL;

const PERIODOS_LABEL = { preop: "Preop", "3m": "3m", "6m": "6m", "1a": "1 año", "2a": "2 años" };
const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

const SEGMENTOS_VALIDOS = [
  "cadera-derecha", "cadera-izquierda",
  "rodilla-derecha", "rodilla-izquierda",
];

// "Cadera total" → "cadera", "Rodilla unicompartimental" → "rodilla"
function normalizarTipo(tipo) {
  const t = tipo?.toLowerCase() || "";
  if (t.includes("cadera")) return "cadera";
  if (t.includes("rodilla")) return "rodilla";
  return t;
}

// "Derecho" → "derecha", "Izquierdo" → "izquierda"
function normalizarLado(lado) {
  const l = lado?.toLowerCase() || "";
  if (l.includes("derech")) return "derecha";
  if (l.includes("izquier")) return "izquierda";
  return l;
}

export default function RegistroDashboardMapa({ token, onNuevaCirugia, onCompletarEscala }) {
  const [cirugias,             setCirugias]             = useState([]);
  const [loading,              setLoading]              = useState(true);
  const [error,                setError]                = useState(null);
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState(null);

  useEffect(() => { load(); }, [token]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = res.ok ? await res.json() : [];
      setCirugias(Array.isArray(data) ? data : []);
    } catch { setError("Error cargando sus datos."); }
    finally  { setLoading(false); }
  }

  function getPendientes(c) {
    const ep = c.escalas_programadas || {};
    return PERIODOS_ORDEN.filter(p => ep[p]?.programada !== false && !ep[p]?.completada);
  }

  function getProgreso(c) {
    const ep = c.escalas_programadas || {};
    return {
      completados: PERIODOS_ORDEN.filter(p => ep[p]?.completada).length,
      total:       PERIODOS_ORDEN.length,
    };
  }

  function formatFecha(iso) {
    if (!iso) return "—";
    try {
      const [y, m, d] = iso.split("-");
      const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      return `${d} ${meses[parseInt(m) - 1]} ${y}`;
    } catch { return iso; }
  }

  const mapaProtesis = useMemo(() => {
    const mapa = {};
    cirugias.forEach(c => {
      const tipo = normalizarTipo(c.tipo_protesis);
      const lado = normalizarLado(c.lado);
      const key  = `${tipo}-${lado}`;
      if (SEGMENTOS_VALIDOS.includes(key)) {
        mapa[key] = c;
      }
    });
    return mapa;
  }, [cirugias]);

  const cirugiaSeleccionada = segmentoSeleccionado ? mapaProtesis[segmentoSeleccionado] : null;

  const labelSegmento = segmentoSeleccionado
    ? segmentoSeleccionado.replace("-", " de ").replace(/\b\w/g, l => l.toUpperCase())
    : "";

  if (loading) return <div className="dp-loading">Cargando su historial médico…</div>;

  return (
    <div className="dp-root layout-mapa">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Mi Registro de Prótesis</h1>
          <p>Seleccione una articulación en el mapa para ver detalles o registrar</p>
        </div>
      </div>

      <div className="dp-content-panes">

        {/* MAPA */}
        <div className="dp-map-pane">
          <MapaCuerpoInteractivo
            mapaProtesis={mapaProtesis}
            onSelectSegmento={setSegmentoSeleccionado}
            segmentoSeleccionado={segmentoSeleccionado}
          />
        </div>

        {/* PANEL DERECHO */}
        <div className="dp-details-pane">
          {error && <div className="dp-error" style={{ marginBottom: 12 }}>{error}</div>}

          {/* Estado inicial */}
          {!segmentoSeleccionado && (
            <div className="dp-card dp-empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <h3>Bienvenido a su registro</h3>
              <p>Toque una articulación en el cuerpo para ver detalles o registrar.</p>
            </div>
          )}

          {/* Sin prótesis en segmento */}
          {segmentoSeleccionado && !cirugiaSeleccionada && (
            <div className="dp-card">
              <div className="dp-card-header-map">
                <span className="dot-indicador vacio" />
                <h2>{labelSegmento}</h2>
              </div>
              <p className="dp-empty" style={{ margin: "16px 0" }}>
                No hay prótesis registrada en esta articulación.
              </p>
              <button className="dp-btn-primary full-width"
                onClick={() => onNuevaCirugia?.(segmentoSeleccionado, "primaria")}>
                Registrar prótesis →
              </button>
            </div>
          )}

          {/* Con prótesis */}
          {cirugiaSeleccionada && (() => {
            const c          = cirugiaSeleccionada;
            const pendientes = getPendientes(c);
            const proximo    = pendientes[0] || null;
            const { completados, total } = getProgreso(c);
            const pct        = Math.round((completados / total) * 100);

            return (
              <div key={c.id} className="dp-card">
                <div className="dp-card-header-map">
                  <span className="dot-indicador activo" />
                  <h2>{labelSegmento}</h2>
                </div>

                <p style={{ fontSize: 13, color: "#475569", margin: "4px 0" }}>
                  {c.tipo_protesis}
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>
                  📅 {formatFecha(c.fecha_cirugia)}
                  {c.cirujano?.nombre ? ` · 👨‍⚕️ ${c.cirujano.nombre}` : ""}
                </p>
                {c.clinica?.nombre && (
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>
                    🏥 {c.clinica.nombre}{c.clinica.ciudad ? ` · ${c.clinica.ciudad}` : ""}
                  </p>
                )}

                {/* Barra progreso */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Evaluaciones</span>
                    <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{completados}/{total}</span>
                  </div>
                  <div className="dp-progress-bar">
                    <div className="dp-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Períodos */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5, marginBottom: 14 }}>
                  {PERIODOS_ORDEN.map(p => {
                    const ok = (c.escalas_programadas || {})[p]?.completada;
                    return (
                      <div key={p} style={{
                        borderRadius: 8, padding: "7px 3px", textAlign: "center",
                        background: ok ? "#f0fdf4" : "#f8fafc",
                        border: `1px solid ${ok ? "#86efac" : "#e2e8f0"}`,
                      }}>
                        <div style={{ fontSize: 12 }}>{ok ? "✓" : "○"}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: "#475569" }}>
                          {PERIODOS_LABEL[p]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Escala pendiente */}
                {proximo && (
                  <div className="dp-accion-pendiente" style={{ marginBottom: 10 }}>
                    <div>
                      <p className="dp-accion-title">📋 Evaluación — {PERIODOS_LABEL[proximo]}</p>
                      <p className="dp-accion-sub">Toma menos de 5 minutos</p>
                    </div>
                    <button className="dp-btn-completar"
                      onClick={() => onCompletarEscala?.(c.id, proximo)}>
                      Completar →
                    </button>
                  </div>
                )}

                {pendientes.length === 0 && (
                  <div className="dp-success" style={{ marginBottom: 10 }}>
                    ✅ Todas las evaluaciones completadas
                  </div>
                )}

                {/* Revisión */}
                <button className="dp-btn-secondary full-width"
                  onClick={() => onNuevaCirugia?.(segmentoSeleccionado, "revision")}>
                  Registrar cirugía de revisión
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 20, padding: "0 20px" }}>
        Sus respuestas son confidenciales y contribuyen al Registro Nacional de Prótesis de Chile.
      </p>
    </div>
  );
}
