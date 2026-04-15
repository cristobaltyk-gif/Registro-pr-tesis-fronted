import { ProthesisIcon } from "./ui/ProthesisIcon";

const PERIODOS_LABEL = {
  preop: "Preop",
  "3m": "3m",
  "6m": "6m",
  "1a": "1 año",
  "2a": "2 años",
};

const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

const ESTADO_COLOR = {
  pendiente: { bg: "#fff7ed", border: "#f59e0b", text: "#9a3412", badge: "⏳ Pendiente" },
  parcial: { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8", badge: "⚡ En progreso" },
  completo: { bg: "#f0fdf4", border: "#10b981", text: "#047857", badge: "✅ Completo" },
};

export default function RegistroResumen({
  cirugias = [],
  onNuevaCirugia,
  onCompletarEscala,
}) {
  function getPendientes(c) {
    const ep = c.escalas_programadas || {};
    return PERIODOS_ORDEN.filter((p) => ep[p]?.programada !== false && !ep[p]?.completada);
  }

  function getProgreso(c) {
    const ep = c.escalas_programadas || {};
    const completados = PERIODOS_ORDEN.filter((p) => ep[p]?.completada).length;
    const total = PERIODOS_ORDEN.length;
    const porcentaje = Math.round((completados / total) * 100);

    return { completados, total, porcentaje };
  }

  function getEstado(c) {
    const { completados, total } = getProgreso(c);
    if (completados === 0) return "pendiente";
    if (completados >= total) return "completo";
    return "parcial";
  }

  function formatFecha(iso) {
    if (!iso) return "—";
    try {
      const [y, m, d] = iso.split("-");
      const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return `${d} ${meses[parseInt(m, 10) - 1]} ${y}`;
    } catch {
      return iso;
    }
  }

  function getTipoIcono(c) {
    const texto = `${c.tipo_protesis || ""}`.toLowerCase();
    if (texto.includes("rodilla")) return "🦵";
    if (texto.includes("cadera")) return "🦴";
    return "🩺";
  }

  const resumen = cirugias.reduce(
    (acc, c) => {
      const estado = getEstado(c);
      acc.total += 1;
      if (estado === "pendiente") acc.pendientes += 1;
      if (estado === "parcial") acc.parciales += 1;
      if (estado === "completo") acc.completas += 1;
      return acc;
    },
    { total: 0, pendientes: 0, parciales: 0, completas: 0 }
  );

  return (
    <div style={{ flex: 1, padding: "32px 24px", maxWidth: 920, margin: "0 auto" }}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 24,
          padding: "28px 20px",
          marginBottom: 24,
          boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
            <ProthesisIcon />
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            Mis Prótesis Registradas
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "#64748b",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Aquí puedes revisar tus cirugías y el avance de cada evaluación de seguimiento.
          </p>
        </div>

        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <button
            className="dp-btn-primary"
            style={{ fontSize: 15, padding: "14px 32px", borderRadius: 12 }}
            onClick={onNuevaCirugia}
          >
            + Nueva Cirugía / Revisión
          </button>
        </div>

        {cirugias.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{resumen.total}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Prótesis totales</div>
            </div>

            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#9a3412" }}>{resumen.pendientes}</div>
              <div style={{ fontSize: 12, color: "#9a3412" }}>Pendientes</div>
            </div>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>{resumen.parciales}</div>
              <div style={{ fontSize: 12, color: "#1d4ed8" }}>En progreso</div>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#047857" }}>{resumen.completas}</div>
              <div style={{ fontSize: 12, color: "#047857" }}>Completas</div>
            </div>
          </div>
        )}
      </div>

      {cirugias.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            border: "2px dashed #cbd5e1",
            borderRadius: 20,
            padding: "44px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 8px",
            }}
          >
            No tienes cirugías registradas
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              margin: "0 0 20px",
            }}
          >
            Registra tu primera cirugía para comenzar el seguimiento.
          </p>
          <button className="dp-btn-primary" onClick={onNuevaCirugia}>
            Registrar Primera Prótesis
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {cirugias.map((c) => {
            const pendientes = getPendientes(c);
            const proximo = pendientes[0] || null;
            const { completados, total, porcentaje } = getProgreso(c);
            const estado = getEstado(c);
            const colores = ESTADO_COLOR[estado];

            return (
              <div
                key={c.id}
                style={{
                  background: colores.bg,
                  border: `2px solid ${colores.border}`,
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
                }}
              >
                <div style={{ padding: "20px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: colores.text,
                          marginBottom: 6,
                        }}
                      >
                        {colores.badge}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: 24,
                          lineHeight: 1.15,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {getTipoIcono(c)} {c.tipo_protesis} — {c.lado}
                      </h3>

                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 14,
                          color: "#475569",
                          lineHeight: 1.5,
                        }}
                      >
                        <div>📅 {formatFecha(c.fecha_cirugia)}</div>
                        <div>👨‍⚕️ {c.cirujano?.nombre || "—"}</div>
                        <div>
                          🏥 {c.clinica?.nombre || "—"}
                          {c.clinica?.ciudad ? ` · ${c.clinica.ciudad}` : ""}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: 58,
                        height: 58,
                        borderRadius: 16,
                        background: "#ffffffaa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                      }}
                    >
                      {estado === "completo" ? "✅" : estado === "parcial" ? "⚡" : "⏳"}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ color: "#64748b" }}>Evaluaciones completadas</span>
                      <span style={{ color: "#0f172a" }}>
                        {completados}/{total} · {porcentaje}%
                      </span>
                    </div>

                    <div
                      style={{
                        height: 10,
                        background: "#e2e8f0",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${porcentaje}%`,
                          height: "100%",
                          background: colores.border,
                          borderRadius: 999,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    {PERIODOS_ORDEN.map((p) => {
                      const ok = (c.escalas_programadas || {})[p]?.completada;

                      return (
                        <div
                          key={p}
                          style={{
                            borderRadius: 12,
                            padding: "10px 4px",
                            textAlign: "center",
                            background: ok ? "#ecfdf5" : "#ffffffb8",
                            border: `1px solid ${ok ? "#86efac" : "#dbe3ee"}`,
                          }}
                        >
                          <div style={{ fontSize: 14, marginBottom: 4 }}>{ok ? "✓" : "○"}</div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#475569",
                            }}
                          >
                            {PERIODOS_LABEL[p]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {proximo ? (
                    <div
                      style={{
                        background: "#fff8e7",
                        border: "1px solid #fcd34d",
                        borderRadius: 16,
                        padding: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#92400e",
                            marginBottom: 4,
                          }}
                        >
                          📋 Evaluación pendiente — {PERIODOS_LABEL[proximo]}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#a16207",
                          }}
                        >
                          Toma menos de 5 minutos
                        </div>
                      </div>

                      <button
                        className="dp-btn-completar"
                        onClick={() => onCompletarEscala?.(c.id, proximo)}
                      >
                        Completar →
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#ecfdf5",
                        border: "1px solid #86efac",
                        color: "#166534",
                        borderRadius: 16,
                        padding: 14,
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      ✅ Seguimiento completo
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
