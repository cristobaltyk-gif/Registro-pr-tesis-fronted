import { useEffect, useMemo, useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const PERIODOS_LABEL = {
  preop: "Preop",
  "3m": "3m",
  "6m": "6m",
  "1a": "1 año",
  "2a": "2 años",
};

const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

const SEGMENTOS_BASE = [
  {
    key: "cadera_izquierda",
    tipo: "cadera",
    lado: "izquierda",
    label: "Cadera izq.",
    x: 108,
    y: 150,
  },
  {
    key: "cadera_derecha",
    tipo: "cadera",
    lado: "derecha",
    label: "Cadera der.",
    x: 152,
    y: 150,
  },
  {
    key: "rodilla_izquierda",
    tipo: "rodilla",
    lado: "izquierda",
    label: "Rodilla izq.",
    x: 108,
    y: 250,
  },
  {
    key: "rodilla_derecha",
    tipo: "rodilla",
    lado: "derecha",
    label: "Rodilla der.",
    x: 152,
    y: 250,
  },
];

export default function RegistroDashboard({
  token,
  onNuevaCirugia,
  onCompletarEscala,
  onIngresarRevision,
}) {
  const [cirugias, setCirugias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentoActivo, setSegmentoActivo] = useState(null);

  useEffect(() => {
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setCirugias(Array.isArray(data) ? data : []);
    } catch {
      setError("Error cargando sus datos.");
    } finally {
      setLoading(false);
    }
  }

  function normalizarTexto(v) {
    return String(v || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
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

  function getSegmentKeyFromCirugia(c) {
    const tipo = normalizarTexto(c.tipo_protesis || c.tipo || "");
    const lado = normalizarTexto(c.lado || "");

    if (tipo.includes("cadera") && lado === "izquierda") return "cadera_izquierda";
    if (tipo.includes("cadera") && lado === "derecha") return "cadera_derecha";
    if (tipo.includes("rodilla") && lado === "izquierda") return "rodilla_izquierda";
    if (tipo.includes("rodilla") && lado === "derecha") return "rodilla_derecha";

    return null;
  }

  function parseFechaNum(iso) {
    if (!iso) return 0;
    const time = new Date(`${iso}T00:00:00`).getTime();
    return Number.isFinite(time) ? time : 0;
  }

  function getTipoCirugia(c) {
    const raw = normalizarTexto(c.tipo_cirugia || c.clase_cirugia || c.subtipo || "");
    if (raw.includes("revision") || raw.includes("revisión")) return "revision";
    if (raw.includes("primaria")) return "primaria";

    const fallback = normalizarTexto(c.categoria || "");
    if (fallback.includes("revision") || fallback.includes("revisión")) return "revision";
    if (fallback.includes("primaria")) return "primaria";

    return "desconocida";
  }

  function getPendientesDesdeEscalas(escalas = {}) {
    return PERIODOS_ORDEN.filter((p) => escalas[p]?.programada !== false && !escalas[p]?.completada);
  }

  function getResumenEscalas(escalas = {}) {
    const completados = PERIODOS_ORDEN.filter((p) => escalas[p]?.completada).length;
    const pendientes = getPendientesDesdeEscalas(escalas);
    return {
      completados,
      total: PERIODOS_ORDEN.length,
      pendientes,
      proximo: pendientes[0] || null,
      pct: Math.round((completados / PERIODOS_ORDEN.length) * 100),
    };
  }

  const segmentos = useMemo(() => {
    const agrupado = {};

    for (const def of SEGMENTOS_BASE) {
      agrupado[def.key] = {
        ...def,
        registros: [],
        actual: null,
        tieneProtesis: false,
        errorPrimarias: false,
        resumenEscalas: getResumenEscalas({}),
      };
    }

    for (const c of cirugias) {
      const key = getSegmentKeyFromCirugia(c);
      if (!key || !agrupado[key]) continue;
      agrupado[key].registros.push(c);
    }

    for (const key of Object.keys(agrupado)) {
      const item = agrupado[key];

      item.registros.sort((a, b) => parseFechaNum(b.fecha_cirugia) - parseFechaNum(a.fecha_cirugia));
      item.actual = item.registros[0] || null;
      item.tieneProtesis = !!item.actual;

      const primarias = item.registros.filter((r) => getTipoCirugia(r) === "primaria");
      item.errorPrimarias = primarias.length > 1;

      item.resumenEscalas = getResumenEscalas(item.actual?.escalas_programadas || {});
    }

    return SEGMENTOS_BASE.map((def) => agrupado[def.key]);
  }, [cirugias]);

  const resumenGlobal = useMemo(() => {
    const conProtesis = segmentos.filter((s) => s.tieneProtesis).length;
    const completados = segmentos.reduce((acc, s) => acc + s.resumenEscalas.completados, 0);
    const total = segmentos.reduce((acc, s) => acc + s.resumenEscalas.total, 0);
    const pct = total ? Math.round((completados / total) * 100) : 0;

    return {
      conProtesis,
      completados,
      total,
      pct,
      errores: segmentos.filter((s) => s.errorPrimarias),
    };
  }, [segmentos]);

  function handleSegmentClick(segmento) {
    setSegmentoActivo(segmento);
  }

  function handleNuevaPrimaria(segmento) {
    setSegmentoActivo(null);
    onNuevaCirugia?.({
      tipo: segmento.tipo,
      lado: segmento.lado,
      modo: "primaria",
      segmentoKey: segmento.key,
    });
  }

  function handleNuevaRevision(segmento) {
    setSegmentoActivo(null);

    if (onIngresarRevision) {
      onIngresarRevision({
        tipo: segmento.tipo,
        lado: segmento.lado,
        modo: "revision",
        segmentoKey: segmento.key,
        cirugiaBase: segmento.actual,
      });
      return;
    }

    onNuevaCirugia?.({
      tipo: segmento.tipo,
      lado: segmento.lado,
      modo: "revision",
      segmentoKey: segmento.key,
      cirugiaBase: segmento.actual,
    });
  }

  function handleCompletarEscala(segmento) {
    const proximo = segmento.resumenEscalas.proximo;
    if (!segmento.actual || !proximo) return;
    setSegmentoActivo(null);
    onCompletarEscala?.(segmento.actual.id, proximo, {
      tipo: segmento.tipo,
      lado: segmento.lado,
      segmentoKey: segmento.key,
    });
  }

  if (loading) return <div className="dp-loading">Cargando su historial…</div>;

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Mi registro de prótesis</h1>
          <p>Resumen histórico y punto único de ingreso por segmento</p>
        </div>

        <button
          className="dp-btn-secondary"
          style={{ width: "auto", padding: "8px 16px" }}
          onClick={() => onNuevaCirugia?.()}
        >
          + Agregar cirugía
        </button>
      </div>

      <div className="dp-content">
        {error && <div className="dp-error" style={{ marginBottom: 12 }}>{error}</div>}

        {cirugias.length === 0 && (
          <div className="dp-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🦴</div>
            <p className="dp-event-diag" style={{ marginBottom: 8 }}>Sin cirugías registradas</p>
            <p className="dp-empty" style={{ marginBottom: 20 }}>
              Toque un segmento del esquema para ingresar una cirugía primaria.
            </p>
          </div>
        )}

        <div className="dp-card" style={{ padding: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 440px) minmax(280px, 1fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div>
              <p className="dp-event-diag" style={{ marginBottom: 8 }}>
                Esquema único por paciente
              </p>

              <p className="dp-event-meta" style={{ marginBottom: 14 }}>
                Un segmento por lado, usando siempre la cirugía más reciente como estado actual.
              </p>

              <BodyMapaResumen
                segmentos={segmentos}
                onSegmentClick={handleSegmentClick}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                  marginTop: 14,
                }}
              >
                {segmentos.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleSegmentClick(s)}
                    style={{
                      textAlign: "left",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "10px 12px",
                      background: s.tieneProtesis ? "#eff6ff" : "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                        {s.label}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 7px",
                          borderRadius: 999,
                          background: s.tieneProtesis ? "#dbeafe" : "#e2e8f0",
                          color: s.tieneProtesis ? "#1d4ed8" : "#475569",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.tieneProtesis ? "Prótesis" : "Libre"}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {s.actual
                        ? `${formatFecha(s.actual.fecha_cirugia)} · ${s.actual.cirujano?.nombre || "—"}`
                        : "Sin cirugía registrada"}
                    </div>

                    {s.errorPrimarias && (
                      <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 6, fontWeight: 700 }}>
                        Error: más de una primaria registrada
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <ResumenBox label="Segmentos con prótesis" value={String(resumenGlobal.conProtesis)} />
                <ResumenBox label="Escalas completas" value={`${resumenGlobal.completados}/${resumenGlobal.total}`} />
                <ResumenBox label="Avance global" value={`${resumenGlobal.pct}%`} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Progreso total</span>
                  <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>
                    {resumenGlobal.pct}%
                  </span>
                </div>
                <div className="dp-progress-bar">
                  <div className="dp-progress-fill" style={{ width: `${resumenGlobal.pct}%` }} />
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {segmentos.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <p className="dp-event-diag" style={{ margin: 0 }}>
                        {s.label}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleSegmentClick(s)}
                        style={{
                          border: "none",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          borderRadius: 10,
                          padding: "6px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Ver acciones
                      </button>
                    </div>

                    <p className="dp-event-meta" style={{ marginBottom: 8 }}>
                      {s.actual
                        ? `${s.actual.tipo_protesis || s.tipo} — ${s.actual.lado || s.lado} · ${formatFecha(s.actual.fecha_cirugia)}`
                        : "Sin cirugía registrada"}
                    </p>

                    <EscalasBarMini escalas={s.actual?.escalas_programadas || {}} />

                    {s.actual && (
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
                        Cirujano: {s.actual.cirujano?.nombre || "—"} · Clínica: {s.actual.clinica?.nombre || "—"}
                      </div>
                    )}

                    {s.errorPrimarias && (
                      <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 8, fontWeight: 700 }}>
                        Revisar datos: existen dos primarias para este mismo lado/segmento.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#94a3b8",
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          Sus respuestas son confidenciales y contribuyen al Registro Nacional de Prótesis de Chile.
        </p>
      </div>

      {segmentoActivo && (
        <SegmentoActionsModal
          segmento={segmentoActivo}
          formatFecha={formatFecha}
          onClose={() => setSegmentoActivo(null)}
          onNuevaPrimaria={handleNuevaPrimaria}
          onNuevaRevision={handleNuevaRevision}
          onCompletarEscala={handleCompletarEscala}
        />
      )}
    </div>
  );
}

function ResumenBox({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 12,
        background: "#f8fafc",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function EscalasBarMini({ escalas = {} }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 4,
      }}
    >
      {PERIODOS_ORDEN.map((p) => {
        const ok = escalas[p]?.completada;
        return (
          <div
            key={p}
            style={{
              borderRadius: 8,
              padding: "6px 2px",
              textAlign: "center",
              background: ok ? "#f0fdf4" : "#f8fafc",
              border: `1px solid ${ok ? "#86efac" : "#e2e8f0"}`,
            }}
          >
            <div style={{ fontSize: 11, lineHeight: 1 }}>{ok ? "✓" : "○"}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#475569", marginTop: 2 }}>
              {PERIODOS_LABEL[p]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BodyMapaResumen({ segmentos, onSegmentClick }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        background: "#f8fafc",
        padding: 16,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 260 360" width="100%" style={{ maxWidth: 320, height: "auto" }}>
        <circle cx="130" cy="46" r="22" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="130" y1="68" x2="130" y2="130" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
        <line x1="90" y1="95" x2="170" y2="95" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
        <line x1="130" y1="130" x2="105" y2="205" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
        <line x1="130" y1="130" x2="155" y2="205" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
        <line x1="105" y1="205" x2="108" y2="300" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
        <line x1="155" y1="205" x2="152" y2="300" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />

        {segmentos.map((s) => (
          <g key={s.key} onClick={() => onSegmentClick?.(s)} style={{ cursor: "pointer" }}>
            <EscalasSobrePunto x={s.x} y={s.y} escalas={s.actual?.escalas_programadas || {}} />

            {s.tieneProtesis ? (
              <ProtesisMarker x={s.x} y={s.y} />
            ) : (
              <circle cx={s.x} cy={s.y} r="8" fill="#64748b" />
            )}

            <text
              x={s.x}
              y={s.y + 28}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#334155"
            >
              {s.label}
            </text>

            {s.errorPrimarias && (
              <text
                x={s.x}
                y={s.y + 40}
                textAnchor="middle"
                fontSize="9"
                fontWeight="800"
                fill="#b91c1c"
              >
                Error
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function ProtesisMarker({ x, y }) {
  return (
    <g transform={`translate(${x - 10}, ${y - 12})`}>
      <rect x="6" y="0" width="8" height="24" rx="3" fill="#2563eb" />
      <circle cx="10" cy="5" r="9" fill="none" stroke="#2563eb" strokeWidth="4" />
      <rect x="5" y="20" width="10" height="10" rx="3" fill="#1d4ed8" />
    </g>
  );
}

function EscalasSobrePunto({ x, y, escalas = {} }) {
  const itemWidth = 9;
  const gap = 2;
  const totalWidth = PERIODOS_ORDEN.length * itemWidth + (PERIODOS_ORDEN.length - 1) * gap;
  const startX = x - totalWidth / 2;
  const topY = y - 28;

  return (
    <g>
      {PERIODOS_ORDEN.map((p, idx) => {
        const ok = escalas[p]?.completada;
        return (
          <rect
            key={p}
            x={startX + idx * (itemWidth + gap)}
            y={topY}
            width={itemWidth}
            height={6}
            rx={2}
            fill={ok ? "#22c55e" : "#cbd5e1"}
          />
        );
      })}
    </g>
  );
}

function SegmentoActionsModal({
  segmento,
  formatFecha,
  onClose,
  onNuevaP
