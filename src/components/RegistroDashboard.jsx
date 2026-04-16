import { useEffect, useState } from "react";
import { useCallback } from "react";
import "../styles/dashboard-pacientes.css";
import BodyProtesisMap from "./BodyProtesisMap"; // Ajusta la ruta según tu estructura

const API_URL = import.meta.env.VITE_API_URL;

const PERIODOS_LABEL = { preop: "Preop", "3m": "6m", "1a": "1 año", "2a": "2 años" };
const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

export default function RegistroDashboard({ token, onNuevaCirugia, onCompletarEscala }) {
  const [cirugias, setCirugias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);

  const ZONAS = {
    cadera_izquierda: { top: "33%", left: "37%", tipo: "cadera", lado: "izquierda", label: "Cadera izquierda" },
    cadera_derecha:   { top: "33%", left: "63%", tipo: "cadera", lado: "derecha",   label: "Cadera derecha" },
    rodilla_izquierda:{ top: "55%", left: "41%", tipo: "rodilla", lado: "izquierda", label: "Rodilla izquierda" },
    rodilla_derecha:  { top: "55%", left: "59%", tipo: "rodilla", lado: "derecha",   label: "Rodilla derecha" },
  };

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

  function normalizar(v) {
    return String(v || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
  }

  function getCirugiaZona(zonaKey) {
    const zona = ZONAS[zonaKey];
    return cirugias.find(c => {
      const t = normalizar(c.tipo_protesis || c.tipo || "");
      const l = normalizar(c.lado || "");
      return t.includes(normalizar(zona.tipo)) && l === normalizar(zona.lado);
    });
  }

  const handleZonaClick = useCallback((zonaKey) => {
    setZonaSeleccionada(zonaKey);
  }, []);

  const handleNuevaProtesis = useCallback((zonaKey) => {
    const zona = ZONAS[zonaKey];
    onNuevaCirugia?.({
      tipo: zona.tipo,
      lado: zona.lado,
      label: zona.label
    });
  }, [onNuevaCirugia]);

  const handleRevisionProtesis = useCallback((zonaKey) => {
    const zona = ZONAS[zonaKey];
    onNuevaCirugia?.({
      tipo: zona.tipo,
      lado: zona.lado,
      label: zona.label,
      es_revision: true
    });
  }, [onNuevaCirugia]);

  const getPendientes = useCallback((c) => {
    const ep = c.escalas_programadas || {};
    return PERIODOS_ORDEN.filter(p => ep[p]?.programada !== false && !ep[p]?.completada);
  }, []);

  const getProgreso = useCallback((c) => {
    const ep = c.escalas_programadas || {};
    return { 
      completados: PERIODOS_ORDEN.filter(p => ep[p]?.completada).length, 
      total: PERIODOS_ORDEN.length 
    };
  }, []);

  const formatFecha = useCallback((iso) => {
    if (!iso) return "—";
    try {
      const [y, m, d] = iso.split("-");
      const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      return `${d} ${meses[parseInt(m)-1]} ${y}`;
    } catch { return iso; }
  }, []);

  if (loading) return <div className="dp-loading">Cargando su historial…</div>;

  const cirugiaSeleccionada = zonaSeleccionada ? getCirugiaZona(zonaSeleccionada) : null;
  const tieneProtesis = !!cirugiaSeleccionada;
  const pendientes = tieneProtesis ? getPendientes(cirugiaSeleccionada) : [];
  const proximo = pendientes[0];
  const { completados, total } = tieneProtesis ? getProgreso(cirugiaSeleccionada) : { completados: 0, total: 0 };
  const pct = Math.round((completados / total) * 100);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Mi registro de prótesis</h1>
          <p>Haga clic en una zona para ver su historial</p>
        </div>
      </div>

      <div className="dp-content">
        {error && <div className="dp-error" style={{ marginBottom: 12 }}>{error}</div>}

        {/* Mapa interactivo */}
        <div style={{ marginBottom: 24 }}>
          <BodyProtesisMap 
            registros={cirugias}
            onZonaClick={handleZonaClick}
            zonaSeleccionada={zonaSeleccionada}
          />
        </div>

        {zonaSeleccionada && (
          <div className="dp-zona-detalle">
            {/* Header de zona */}
            <div className="dp-zona-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 16,
              padding: '12px 16px',
              background: tieneProtesis ? '#f0fdf4' : '#fef2f2',
              borderRadius: 12,
              border: `2px solid ${tieneProtesis ? '#86efac' : '#fca5a5'}`,
            }}>
              <div style={{ 
                fontSize: 28, 
                marginRight: 12,
                color: ZONAS[zonaSeleccionada].tipo === 'rodilla' ? '#3b82f6' : '#10b981'
              }}>
                {ZONAS[zonaSeleccionada].tipo === 'rodilla' ? '🦵' : '🦾'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                  {ZONAS[zonaSeleccionada].label}
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  {tieneProtesis ? 'Prótesis registrada' : 'Sin prótesis aún'}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="dp-acciones-zona" style={{ marginBottom: 16 }}>
              {!tieneProtesis ? (
                <button 
                  className="dp-btn-primary" 
                  onClick={() => handleNuevaProtesis(zonaSeleccionada)}
                  style={{ width: '100%' }}
                >
                  ➕ Registrar {ZONAS[zonaSeleccionada].label}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="dp-btn-secondary" 
                    onClick={() => handleRevisionProtesis(zonaSeleccionada)}
                    style={{ flex: 1 }}
                  >
                    🔄 Revisión
                  </button>
                  <button 
                    className="dp-btn-primary" 
                    onClick={() => setZonaSeleccionada(null)}
                    style={{ flex: 1 }}
                  >
                    ← Volver al mapa
                  </button>
                </div>
              )}
            </div>

            {/* Detalle de prótesis si existe */}
            {tieneProtesis && (
              <div className="dp-card">
                <div style={{ marginBottom: 12 }}>
                  <p className="dp-event-meta" style={{ marginBottom: 4 }}>
                    📅 {formatFecha(cirugiaSeleccionada.fecha_cirugia)} · 
                    👨‍⚕️ {cirugiaSeleccionada.cirujano?.nombre || "—"}
                  </p>
                  <p className="dp-event-meta">
                    🏥 {cirugiaSeleccionada.clinica?.nombre || "—"}
                    {cirugiaSeleccionada.clinica?.ciudad ? ` · ${cirugiaSeleccionada.clinica.ciudad}` : ""}
                  </p>
                </div>

                {/* Progreso */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Evaluaciones</span>
                    <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{completados}/{total}</span>
                  </div>
                  <div className="dp-progress-bar">
                    <div className="dp-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Períodos */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                  {PERIODOS_ORDEN.map(p => {
                    const ok = (cirugiaSeleccionada.escalas_programadas || {})[p]?.completada;
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
                  <div className="dp-accion-pendiente" style={{ marginTop: 16 }}>
                    <div>
                      <p className="dp-accion-title">📋 {PERIODOS_LABEL[proximo]}</p>
                      <p className="dp-accion-sub">Toma menos de 5 minutos</p>
                    </div>
                    <button 
                      className="dp-btn-completar"
                      onClick={() => onCompletarEscala?.(cirugiaSeleccionada.id, proximo)}
                    >
                      Completar →
                    </button>
                  </div>
                )}

                {pendientes.length === 0 && (
                  <div className="dp-success" style={{ marginTop: 16 }}>
                    ✅ Todas las evaluaciones completadas — ¡Gracias!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!zonaSeleccionada && cirugias.length === 0 && (
          <div className="dp-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🦴</div>
            <p className="dp-event-diag" style={{ marginBottom: 8 }}>Sin prótesis registradas</p>
            <p className="dp-empty" style={{ marginBottom: 20 }}>
              Haga clic en cualquier zona roja para registrar su primera prótesis
            </p>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 24, lineHeight: 1.5 }}>
          Sus respuestas son confidenciales y contribuyen al Registro Nacional de Prótesis de Chile.
        </p>
      </div>
    </div>
  );
      }
