import { useEffect, useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const PERIODOS_LABEL = { preop: "Preop", "3m": "3 meses", "6m": "6 meses", "1a": "1 año", "2a": "2 años" };
const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

export default function RegistroDashboard({ token, onNuevaCirugia, onCompletarEscala }) {
  const [cirugias, setCirugias] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

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
    return PERIODOS_ORDEN.filter(p => (ep[p]?.programada !== false) && !ep[p]?.completada);
  }

  function getProgreso(c) {
    const ep = c.escalas_programadas || {};
    return {
      completados: PERIODOS_ORDEN.filter(p => ep[p]?.completada).length,
      total: PERIODOS_ORDEN.length,
    };
  }

  function formatFecha(iso) {
    if (!iso) return "—";
    try {
      const [y, m, d] = iso.split("-");
      const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      return `${d} ${meses[parseInt(m)-1]} ${y}`;
    } catch { return iso; }
  }

  if (loading) return <div className="dp-loading">Cargando su historial…</div>;

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Mi registro de prótesis</h1>
          <p>Historial de cirugías y evaluaciones</p>
        </div>
        <button className="dp-btn-secondary" style={{ width: "auto", padding: "8px 16px" }}
          onClick={onNuevaCirugia}>
          + Agregar cirugía
        </button>
      </div>

      <div className="dp-content">

        {error && <div className="dp-error" style={{ marginBottom: 12 }}>{error}</div>}

        {cirugias.length === 0 && (
          <div className="dp-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🦴</div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Sin cirugías registradas</p>
            <p className="dp-empty" style={{ marginBottom: 20 }}>Registre su primera cirugía para comenzar el seguimiento</p>
            <button className="dp-btn-primary" onClick={onNuevaCirugia}>
              Registrar mi cirugía →
            </button>
          </div>
        )}

        {cirugias.map(c => {
          const pendientes = getPendientes(c);
          const proximo    = pendientes[0] || null;
          const { completados, total } = getProgreso(c);
          const pct = Math.round((completados / total) * 100);

          return (
            <div key={c.id} className="dp-card">

              {/* Cabecera */}
              <div style={{ marginBottom: 14 }}>
                <p className="dp-event-diag">{c.tipo_protesis} — {c.lado}</p>
                <p className="dp-event-meta">
                  📅 {formatFecha(c.fecha_cirugia)} · 👨‍⚕️ {c.cirujano?.nombre || "—"} · 🏥 {c.clinica?.nombre || "—"}
                </p>
                {c.clinica?.ciudad && (
                  <p className="dp-event-meta">📍 {c.clinica.ciudad}{c.clinica.region ? `, ${c.clinica.region}` : ""}</p>
                )}
              </div>

              {/* Progreso */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Evaluaciones</span>
                  <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{completados}/{total}</span>
                </div>
                <div className="dp-progress-bar">
                  <div className="dp-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Períodos */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 14 }}>
                {PERIODOS_ORDEN.map(p => {
                  const info = (c.escalas_programadas || {})[p] || {};
                  const ok   = info.completada;
                  return (
                    <div key={p} style={{
                      borderRadius: 8, padding: "8px 4px", textAlign: "center",
                      background: ok ? "#f0fdf4" : "#f8fafc",
                      border: `1px solid ${ok ? "#86efac" : "#e2e8f0"}`,
                    }}>
                      <div style={{ fontSize: 14 }}>{ok ? "✓" : "○"}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#475569" }}>{PERIODOS_LABEL[p]}</div>
                    </div>
                  );
                })}
              </div>

              {/* Acción pendiente */}
              {proximo && (
                <div className="dp-accion-pendiente">
                  <div>
                    <p className="dp-accion-title">📋 Evaluación pendiente — {PERIODOS_LABEL[proximo]}</p>
                    <p className="dp-accion-sub">Toma menos de 5 minutos</p>
                  </div>
                  <button className="dp-btn-completar"
                    onClick={() => onCompletarEscala?.(c.id, proximo)}>
                    Completar →
                  </button>
                </div>
              )}

              {pendientes.length === 0 && (
                <div className="dp-success">✅ Todas las evaluaciones completadas — ¡Gracias!</div>
              )}

            </div>
          );
        })}

        <div className="dp-footer" style={{ marginTop: 20, borderRadius: 10 }}>
          Sus respuestas son confidenciales y contribuyen al Registro Nacional de Prótesis de Chile.
        </div>

      </div>
    </div>
  );
}
