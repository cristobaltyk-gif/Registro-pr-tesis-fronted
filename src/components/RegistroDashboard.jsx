import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * RegistroDashboard
 * Muestra al paciente sus cirugías registradas y el estado de sus evaluaciones.
 *
 * Props:
 *   token         — JWT del paciente
 *   onNuevaCirugia — fn() — ir a registrar nueva cirugía
 *   onCompletarEscala — fn(cirugiaId, periodo) — ir a completar una escala pendiente
 */
export default function RegistroDashboard({ token, onNuevaCirugia, onCompletarEscala }) {
  const [cirugias, setCirugias] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const PERIODOS_LABEL = {
    preop: "Preoperatorio",
    "3m":  "3 meses",
    "6m":  "6 meses",
    "1a":  "1 año",
    "2a":  "2 años",
  };

  const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

  useEffect(() => {
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = res.ok ? await res.json() : [];
      setCirugias(Array.isArray(data) ? data : []);
    } catch {
      setError("Error cargando sus datos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  function getPeriodosPendientes(cirugia) {
    const ep = cirugia.escalas_programadas || {};
    return PERIODOS_ORDEN.filter(p => {
      const info = ep[p] || {};
      return info.programada !== false && !info.completada;
    });
  }

  function getProximoPendiente(cirugia) {
    return getPeriodosPendientes(cirugia)[0] || null;
  }

  function getProgreso(cirugia) {
    const ep         = cirugia.escalas_programadas || {};
    const total      = PERIODOS_ORDEN.length;
    const completados = PERIODOS_ORDEN.filter(p => ep[p]?.completada).length;
    return { completados, total };
  }

  function formatFecha(fechaISO) {
    if (!fechaISO) return "—";
    try {
      const [y, m, d] = fechaISO.split("-");
      const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      return `${d} ${meses[parseInt(m) - 1]} ${y}`;
    } catch {
      return fechaISO;
    }
  }

  if (loading) return <p style={styles.loading}>Cargando su historial…</p>;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.titulo}>Mi registro de prótesis</div>
          <div style={styles.subtitulo}>Historial de cirugías y evaluaciones</div>
        </div>
        <button style={styles.btnAgregar} onClick={onNuevaCirugia}>
          + Agregar cirugía
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Sin cirugías */}
      {cirugias.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🦴</div>
          <div style={styles.emptyTitle}>Aún no tiene cirugías registradas</div>
          <div style={styles.emptySub}>
            Registre su primera cirugía para comenzar el seguimiento
          </div>
          <button style={styles.btnPrimary} onClick={onNuevaCirugia}>
            Registrar mi cirugía →
          </button>
        </div>
      )}

      {/* Lista de cirugías */}
      {cirugias.map(cirugia => {
        const pendientes      = getPeriodosPendientes(cirugia);
        const proximoPendiente = getProximoPendiente(cirugia);
        const { completados, total } = getProgreso(cirugia);
        const pct = Math.round((completados / total) * 100);

        return (
          <div key={cirugia.id} style={styles.card}>

            {/* Cabecera de la cirugía */}
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitulo}>
                  {cirugia.tipo_protesis} — {cirugia.lado}
                </div>
                <div style={styles.cardMeta}>
                  📅 {formatFecha(cirugia.fecha_cirugia)} · 👨‍⚕️ {cirugia.cirujano?.nombre || "—"} · 🏥 {cirugia.clinica?.nombre || "—"}
                </div>
                {cirugia.clinica?.ciudad && (
                  <div style={styles.cardMeta}>📍 {cirugia.clinica.ciudad}{cirugia.clinica.region ? `, ${cirugia.clinica.region}` : ""}</div>
                )}
              </div>
              <div style={styles.badge}>
                {cirugia.indicacion}
              </div>
            </div>

            {/* Progreso de evaluaciones */}
            <div style={styles.progresoSection}>
              <div style={styles.progresoHeader}>
                <span style={styles.progresoLabel}>Evaluaciones completadas</span>
                <span style={styles.progresoNum}>{completados}/{total}</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${pct}%` }} />
              </div>
            </div>

            {/* Grilla de períodos */}
            <div style={styles.periodosGrid}>
              {PERIODOS_ORDEN.map(periodo => {
                const info       = (cirugia.escalas_programadas || {})[periodo] || {};
                const completada = info.completada;
                const pendiente  = !completada;

                return (
                  <div
                    key={periodo}
                    style={{
                      ...styles.periodoItem,
                      ...(completada ? styles.periodoCompletado : styles.periodoPendiente),
                    }}
                  >
                    <div style={styles.periodoIcono}>
                      {completada ? "✓" : "○"}
                    </div>
                    <div style={styles.periodoLabel}>
                      {PERIODOS_LABEL[periodo]}
                    </div>
                    {info.completada_at && (
                      <div style={styles.periodoFecha}>
                        {formatFecha(info.completada_at?.slice(0, 10))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Acción pendiente */}
            {proximoPendiente && (
              <div style={styles.accionPendiente}>
                <div>
                  <div style={styles.accionTitle}>
                    📋 Evaluación pendiente — {PERIODOS_LABEL[proximoPendiente]}
                  </div>
                  <div style={styles.accionSub}>
                    Complete su cuestionario de seguimiento. Toma menos de 5 minutos.
                  </div>
                </div>
                <button
                  style={styles.btnCompletar}
                  onClick={() => onCompletarEscala?.(cirugia.id, proximoPendiente)}
                >
                  Completar →
                </button>
              </div>
            )}

            {/* Todo completado */}
            {pendientes.length === 0 && (
              <div style={styles.completado}>
                ✅ Todas las evaluaciones completadas — ¡Gracias por su participación!
              </div>
            )}

          </div>
        );
      })}

      {/* Info pie */}
      <div style={styles.footer}>
        <p>Sus respuestas son confidenciales y contribuyen al Registro Nacional de Prótesis de Chile.</p>
        <p>Le enviaremos recordatorios por email cuando sea momento de completar cada evaluación.</p>
      </div>

    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const styles = {
  container: {
    width: "100%",
    maxWidth: 560,
    margin: "0 auto",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20, gap: 12,
  },
  titulo:    { fontSize: 20, fontWeight: 800, color: "#0f172a" },
  subtitulo: { fontSize: 13, color: "#64748b", marginTop: 2 },
  btnAgregar: {
    background: "#0f172a", color: "#fff",
    border: "none", borderRadius: 10, padding: "9px 16px",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
  },
  error: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", padding: "10px 12px", borderRadius: 8,
    fontSize: 13, marginBottom: 12,
  },
  loading: {
    fontSize: 14, color: "#64748b", textAlign: "center", padding: 40,
  },
  empty: {
    textAlign: "center", padding: "40px 24px",
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  emptySub:   { fontSize: 13, color: "#64748b", marginBottom: 20 },
  btnPrimary: {
    background: "#0f172a", color: "#fff",
    border: "none", borderRadius: 10, padding: "12px 24px",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  },

  // Card cirugía
  card: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 16, padding: 18, marginBottom: 16,
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", gap: 12, marginBottom: 14,
  },
  cardTitulo: { fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 },
  cardMeta:   { fontSize: 12, color: "#64748b", marginBottom: 2 },
  badge: {
    background: "#f1f5f9", color: "#475569",
    fontSize: 11, fontWeight: 600,
    padding: "4px 10px", borderRadius: 20,
    whiteSpace: "nowrap", flexShrink: 0,
  },

  // Progreso
  progresoSection: { marginBottom: 14 },
  progresoHeader: {
    display: "flex", justifyContent: "space-between",
    marginBottom: 6,
  },
  progresoLabel: { fontSize: 12, color: "#64748b", fontWeight: 600 },
  progresoNum:   { fontSize: 12, color: "#0f172a", fontWeight: 700 },
  progressBar: {
    height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden",
  },
  progressFill: {
    height: "100%", background: "#16a34a",
    borderRadius: 99, transition: "width 0.3s",
  },

  // Períodos
  periodosGrid: {
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
    gap: 6, marginBottom: 14,
  },
  periodoItem: {
    borderRadius: 8, padding: "8px 4px",
    textAlign: "center", border: "1px solid",
  },
  periodoCompletado: {
    background: "#f0fdf4", borderColor: "#86efac",
  },
  periodoPendiente: {
    background: "#f8fafc", borderColor: "#e2e8f0",
  },
  periodoIcono: { fontSize: 14, marginBottom: 2 },
  periodoLabel: { fontSize: 10, fontWeight: 600, color: "#475569" },
  periodoFecha: { fontSize: 9,  color: "#94a3b8", marginTop: 2 },

  // Acción pendiente
  accionPendiente: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, background: "#fffbeb", border: "1px solid #fde68a",
    borderRadius: 10, padding: "12px 14px",
  },
  accionTitle: { fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 2 },
  accionSub:   { fontSize: 12, color: "#78350f" },
  btnCompletar: {
    background: "#d97706", color: "#fff",
    border: "none", borderRadius: 8, padding: "9px 16px",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
  },
  completado: {
    background: "#f0fdf4", border: "1px solid #86efac",
    borderRadius: 10, padding: "10px 14px",
    fontSize: 13, color: "#16a34a", fontWeight: 600,
  },

  // Footer
  footer: {
    marginTop: 24, padding: "16px",
    background: "#f8fafc", borderRadius: 10,
    fontSize: 11, color: "#94a3b8", lineHeight: 1.6,
    textAlign: "center",
  },
};
