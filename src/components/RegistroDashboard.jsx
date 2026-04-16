import { useEffect, useState, useMemo } from "react";
// Importa el nuevo componente SVG interactivo (ver detalles abajo)
import MapaCuerpoInteractivo from "./MapaCuerpoInteractivo";
// Mantenemos tus estilos originales y agregamos específicos para el mapa
import "../styles/dashboard-pacientes.css";
import "../styles/mapa-cuerpo.css"; // Nuevos estilos necesarios

const API_URL = import.meta.env.VITE_API_URL;

const PERIODOS_LABEL = { preop: "Preop", "3m": "3m", "6m": "6m", "1a": "1 año", "2a": "2 años" };
const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

// Definimos los segmentos válidos para mapear el SVG a los datos de la API
const SEGMENTOS_VALIDOS = [
  "cadera-derecha", "cadera-izquierda",
  "rodilla-derecha", "rodilla-izquierda",
  "hombro-derecho", "hombro-izquierdo"
  // Agrega más si tu API y SVG los soportan
];

export default function RegistroDashboardMapa({ token, onNuevaCirugia, onCompletarEscala }) {
  const [cirugias, setCirugias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para saber qué articulación está seleccionada en el mapa
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState(null);

  useEffect(() => { load(); }, [token]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = res.ok ? await res.json() : [];
      setCirugias(Array.isArray(data) ? data : []);
    } catch { setError("Error cargando sus datos."); }
    finally { setLoading(false); }
  }

  // --- LÓGICA DE NEGOCIO MANTENIDA ---
  function getPendientes(c) {
    const ep = c.escalas_programadas || {};
    return PERIODOS_ORDEN.filter(p => ep[p]?.programada !== false && !ep[p]?.completada);
  }

  function getProgreso(c) {
    const ep = c.escalas_programadas || {};
    return { completados: PERIODOS_ORDEN.filter(p => ep[p]?.completada).length, total: PERIODOS_ORDEN.length };
  }

  function formatFecha(iso) {
    if (!iso) return "—";
    try {
      const [y, m, d] = iso.split("-");
      const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return `${d} ${meses[parseInt(m) - 1]} ${y}`;
    } catch { return iso; }
  }
  // ------------------------------------

  // --- NUEVA LÓGICA DE MAPEO ---

  // Procesamos las cirugías para crear un mapa indexado por segmento (ej: "cadera-derecha")
  const mapaProtesis = useMemo(() => {
    const mapa = {};
    cirugias.forEach(c => {
      // Normalizamos el nombre del segmento como viene de la API para que coincida con el SVG
      // Asumimos que la API devuelve 'cadera' y 'derecha'
      const key = `${c.tipo_protesis.toLowerCase()}-${c.lado.toLowerCase()}`;
      if (SEGMENTOS_VALIDOS.includes(key)) {
        mapa[key] = c;
      }
    });
    return mapa;
  }, [cirugias]);

  // Manejador de clics en el SVG
  const handleSelectSegmento = (segmentoId) => {
    setSegmentoSeleccionado(segmentoId);
  };

  // Obtenemos la información de la cirugía seleccionada actualmente
  const cirugiaSeleccionada = segmentoSeleccionado ? mapaProtesis[segmentoSeleccionado] : null;

  if (loading) return <div className="dp-loading">Cargando su historial médico…</div>;

  // Formatear el nombre del segmento para mostrarlo (ej: "cadera-derecha" -> "Cadera Derecha")
  const labelSegmento = segmentoSeleccionado
    ? segmentoSeleccionado.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())
    : "";

  return (
    <div className="dp-root layout-mapa"> {/* Nueva clase CSS para el layout */}
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Mi Registro de Prótesis</h1>
          <p>Seleccione una articulación en el mapa para ver detalles o registrar</p>
        </div>
      </div>

      <div className="dp-content-panes"> {/* Contenedor de dos columnas */}

        {/* COLUMNA IZQUIERDA: EL MAPA INTERACTIVO */}
        <div className="dp-map-pane">
          <MapaCuerpoInteractivo
            mapaProtesis={mapaProtesis} // Pasamos qué segmentos tienen prótesis
            onSelectSegmento={handleSelectSegmento}
            segmentoSeleccionado={segmentoSeleccionado}
          />
        </div>

        {/* COLUMNA DERECHA: DETALLES Y ACCIONES (Panel Dinámico) */}
        <div className="dp-details-pane">
          {error && <div className="dp-error" style={{ marginBottom: 12 }}>{error}</div>}

          {!segmentoSeleccionado && (
            <div className="dp-card dp-empty-state">
              <div style={{ fontSize: 50, marginBottom: 16 }}>👈</div>
              <h3>Bienvenido a su registro</h3>
              <p>Haga clic en un punto de articulación en el cuerpo para comenzar.</p>
            </div>
          )}

          {segmentoSeleccionado && !cirugiaSeleccionada && (
            // CASO: Segmento sin prótesis registrada -> Solo punto clicable
            <div className="dp-card">
              <div className="dp-card-header-map">
                <span className="dot-indicador vacio"></span>
                <h2>{labelSegmento}</h2>
              </div>
              <p className="dp-empty" style={{ margin: "20px 0" }}>No hay prótesis registrada en esta zona.</p>
              {/* Mantenemos la llamada a tu prop original */}
              <button className="dp-btn-primary full-width" onClick={() => onNuevaCirugia(segmentoSeleccionado)}>
                Registrar Prótesis Primaria →
              </button>
            </div>
          )}

          {cirugiaSeleccionada && (() => {
            // CASO: Segmento CON prótesis -> Mostrar Info y Escalas (Tu lógica original)
            const c = cirugiaSeleccionada;
            const pendientes = getPendientes(c);
            const proximo = pendientes[0] || null;
            const { completados, total } = getProgreso(c);
            const pct = Math.round((completados / total) * 100);

            return (
              <div key={c.id} className="dp-card">
                <div className="dp-card-header-map">
                  <span className="dot-indicador activo"></span>
                  <h2>{labelSegmento}</h2>
                </div>

                <p className="dp-event-meta" style={{ marginBottom: 4 }}>
                  📅 {formatFecha(c.fecha_cirugia)} · 👨‍⚕️ {c.cirujano?.nombre || "—"}
                </p>
                <p className="dp-event-meta" style={{ marginBottom: 14 }}>
                  🏥 {c.clinica?.nombre || "—"}{c.clinica?.ciudad ? ` · ${c.clinica.ciudad}` : ""}
                </p>

                {/* Progreso */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Evaluaciones</span>
                    <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{completados}/{total}</span>
                  </div>
                  <div className="dp-progress-bar"><div className="dp-progress-fill" style={{ width: `${pct}%` }} /></div>
                </div>

                {/* Períodos */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 12 }}>
                  {PERIODOS_ORDEN.map(p => {
                    const ok = (c.escalas_programadas || {})[p]?.completada;
                    return (
                      <div key={p} style={{
                        borderRadius: 8, padding: "8px 4px", textAlign: "center",
                        background: ok ? "#f0fdf4" : "#f8fafc",
                        border: `1px solid ${ok ? "#86efac" : "#e2e8f0"}`,
                      }}>
                        <div style={{ fontSize: 13 }}>{ok ? "✓" : "○"}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#475569" }}>{PERIODOS_LABEL[p]}</div>
                      </div>
                    );
                  })}
                </div>

                {proximo && (
                  <div className="dp-accion-pendiente">
                    <div>
                      <p className="dp-accion-title">📋 Evaluación pendiente — {PERIODOS_LABEL[proximo]}</p>
                      <p className="dp-accion-sub">Toma menos de 5 minutos</p>
                    </div>
                    {/* Mantenemos la llamada a tu prop original */}
                    <button className="dp-btn-completar" onClick={() => onCompletarEscala?.(c.id, proximo)}>
                      Completar →
                    </button>
                  </div>
                )}

                {pendientes.length === 0 && (
                  <div className="dp-success">✅ Todas las evaluaciones completadas — ¡Gracias!</div>
                )}

                {/* Botón para Prótesis de Revisión (segundo registro) */}
                <button className="dp-btn-secondary full-width" style={{marginTop: '15px'}} onClick={() => onNuevaCirugia(segmentoSeleccionado, 'revision')}>
                  Registrar Cirugía de Revisión
                </button>

              </div>
            );
          })()}

        </div> {/* fin details-pane */}
      </div> {/* fin content-panes */}

      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 24, padding: "0 20px" }}>
        Sus respuestas son confidenciales y contribuyen al Registro Nacional de Prótesis de Chile.
      </p>
    </div>
  );
}
