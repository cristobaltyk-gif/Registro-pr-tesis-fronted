import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * RegistroEscalaForm
 * Muestra y recoge respuestas de escalas clínicas (Harris, Oxford, WOMAC).
 *
 * Props:
 *   token      — JWT del paciente
 *   cirugiaId  — ID de la cirugía
 *   periodo    — preop | 3m | 6m | 1a | 2a
 *   onComplete — fn(resultados) — llamado al guardar todas las escalas
 */
export default function RegistroEscalaForm({ token, cirugiaId, periodo = "preop", onComplete }) {
  const [escalasDisponibles, setEscalasDisponibles] = useState([]);
  const [escalaActual,       setEscalaActual]       = useState(0);
  const [definiciones,       setDefiniciones]       = useState({});
  const [respuestas,         setRespuestas]         = useState({});
  const [loading,            setLoading]            = useState(true);
  const [saving,             setSaving]             = useState(false);
  const [error,              setError]              = useState(null);
  const [resultados,         setResultados]         = useState([]);

  const PERIODOS_TEXTO = {
    preop: "antes de su cirugía",
    "3m":  "a los 3 meses de su cirugía",
    "6m":  "a los 6 meses de su cirugía",
    "1a":  "al año de su cirugía",
    "2a":  "a los 2 años de su cirugía",
  };

  // ── Cargar escalas aplicables y sus definiciones ─────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [aplicablesRes, definicionesRes] = await Promise.all([
          fetch(`${API_URL}/api/registro/escalas/aplicables/${cirugiaId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/registro/escalas/definicion`),
        ]);

        const aplicables  = aplicablesRes.ok  ? await aplicablesRes.json()  : { escalas: [] };
        const defs        = definicionesRes.ok ? await definicionesRes.json() : {};

        setEscalasDisponibles(aplicables.escalas || []);
        setDefiniciones(defs);
      } catch {
        setError("Error cargando las evaluaciones. Recargue la página.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cirugiaId, token]);

  function setRespuesta(preguntaId, valor) {
    setRespuestas(prev => ({ ...prev, [preguntaId]: Number(valor) }));
  }

  // ── Verificar respuestas completas ───────────────────────
  function getPreguntas(escalaKey) {
    const def = definiciones[escalaKey];
    if (!def) return [];
    if (escalaKey === "womac") {
      return def.secciones.flatMap(s => s.preguntas);
    }
    return def.preguntas || [];
  }

  function preguntasSinResponder(escalaKey) {
    return getPreguntas(escalaKey).filter(p => respuestas[p.id] === undefined);
  }

  // ── Guardar escala actual y pasar a la siguiente ─────────
  async function handleGuardar() {
    setError(null);
    const escalaKey = escalasDisponibles[escalaActual];
    const faltantes = preguntasSinResponder(escalaKey);

    if (faltantes.length > 0) {
      setError(`Faltan ${faltantes.length} pregunta(s) por responder`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/escalas`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          cirugia_id: cirugiaId,
          periodo,
          escala:     escalaKey,
          respuestas,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando respuestas");
      }

      const data = await res.json();
      const nuevosResultados = [...resultados, { escala: escalaKey, ...data }];
      setResultados(nuevosResultados);
      setRespuestas({});

      // Siguiente escala o terminar
      if (escalaActual + 1 < escalasDisponibles.length) {
        setEscalaActual(escalaActual + 1);
      } else {
        onComplete?.(nuevosResultados);
      }

    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={styles.loading}>Cargando evaluación…</p>;
  if (escalasDisponibles.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>No hay evaluaciones disponibles para este tipo de prótesis.</p>
        <button style={styles.btnPrimary} onClick={() => onComplete?.([])}>Continuar →</button>
      </div>
    );
  }

  const escalaKey = escalasDisponibles[escalaActual];
  const def       = definiciones[escalaKey];
  if (!def) return <p style={styles.loading}>Cargando escala…</p>;

  const totalEscalas   = escalasDisponibles.length;
  const progreso       = Math.round(((escalaActual) / totalEscalas) * 100);
  const totalPreguntas = getPreguntas(escalaKey).length;
  const respondidas    = getPreguntas(escalaKey).filter(p => respuestas[p.id] !== undefined).length;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>📋</div>
        <div>
          <div style={styles.headerTitle}>Evaluación {PERIODOS_TEXTO[periodo]}</div>
          <div style={styles.headerSub}>
            Cuestionario {escalaActual + 1} de {totalEscalas} — {def.nombre}
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progreso}%` }} />
      </div>
      <div style={styles.progressText}>
        {respondidas} / {totalPreguntas} preguntas respondidas
      </div>

      {/* Descripción de la escala */}
      <div style={styles.descripcion}>{def.descripcion}</div>

      {error && <div style={styles.error}>{error}</div>}

      {/* ── Preguntas Harris Hip / Oxford Knee ── */}
      {escalaKey !== "womac" && def.preguntas?.map((preg, idx) => (
        <div key={preg.id} style={styles.preguntaBlock}>
          <div style={styles.preguntaNum}>Pregunta {idx + 1}</div>
          <div style={styles.preguntaTexto}>{preg.texto}</div>
          <div style={styles.opcionesGrid}>
            {preg.opciones.map((op, i) => {
              const seleccionada = respuestas[preg.id] === op.valor;
              return (
                <button
                  key={i}
                  style={{
                    ...styles.opcion,
                    ...(seleccionada ? styles.opcionSeleccionada : {}),
                  }}
                  onClick={() => setRespuesta(preg.id, op.valor)}
                >
                  {seleccionada && <span style={styles.checkmark}>✓ </span>}
                  {op.texto}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── WOMAC por secciones ── */}
      {escalaKey === "womac" && def.secciones?.map(seccion => (
        <div key={seccion.id} style={styles.seccionWomac}>
          <div style={styles.seccionTitulo}>{seccion.titulo}</div>
          <div style={styles.seccionIntro}>{seccion.intro}</div>

          {seccion.preguntas.map((preg, idx) => (
            <div key={preg.id} style={styles.preguntaWomac}>
              <div style={styles.preguntaTextoWomac}>{preg.texto}</div>
              <div style={styles.opcionesRow}>
                {def.opciones_comunes.map((op, i) => {
                  const seleccionada = respuestas[preg.id] === op.valor;
                  return (
                    <button
                      key={i}
                      style={{
                        ...styles.opcionPill,
                        ...(seleccionada ? styles.opcionPillSeleccionada : {}),
                      }}
                      onClick={() => setRespuesta(preg.id, op.valor)}
                    >
                      {op.texto}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Botón guardar */}
      <button
        style={{ ...styles.btnPrimary, opacity: saving ? 0.6 : 1 }}
        onClick={handleGuardar}
        disabled={saving}
      >
        {saving
          ? "Guardando…"
          : escalaActual + 1 < totalEscalas
            ? `Guardar y continuar →`
            : "Finalizar evaluación ✓"}
      </button>

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
    display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
  },
  headerIcon:  { fontSize: 28 },
  headerTitle: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  headerSub:   { fontSize: 12, color: "#64748b", marginTop: 2 },
  progressBar: {
    height: 6, background: "#e2e8f0", borderRadius: 99,
    marginBottom: 6, overflow: "hidden",
  },
  progressFill: {
    height: "100%", background: "#0f172a",
    borderRadius: 99, transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: 11, color: "#94a3b8", marginBottom: 16, textAlign: "right",
  },
  descripcion: {
    fontSize: 13, color: "#475569", lineHeight: 1.6,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "12px 14px", marginBottom: 20,
  },
  preguntaBlock: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: "1px solid #f1f5f9",
  },
  preguntaNum: {
    fontSize: 11, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4,
  },
  preguntaTexto: {
    fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 12, lineHeight: 1.5,
  },
  opcionesGrid: {
    display: "flex", flexDirection: "column", gap: 8,
  },
  opcion: {
    textAlign: "left", padding: "11px 14px",
    background: "#fff", border: "1.5px solid #e2e8f0",
    borderRadius: 10, fontSize: 13, cursor: "pointer",
    fontFamily: "inherit", color: "#334155",
    transition: "all 0.15s",
  },
  opcionSeleccionada: {
    background: "#0f172a", color: "#fff",
    borderColor: "#0f172a", fontWeight: 600,
  },
  checkmark: { fontWeight: 700 },

  // WOMAC
  seccionWomac: {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "14px 16px", marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 4,
  },
  seccionIntro: {
    fontSize: 12, color: "#64748b", marginBottom: 12,
  },
  preguntaWomac: {
    marginBottom: 12, paddingBottom: 12,
    borderBottom: "1px solid #e2e8f0",
  },
  preguntaTextoWomac: {
    fontSize: 13, color: "#334155", marginBottom: 8, fontWeight: 500,
  },
  opcionesRow: {
    display: "flex", gap: 6, flexWrap: "wrap",
  },
  opcionPill: {
    padding: "6px 12px", background: "#fff",
    border: "1.5px solid #e2e8f0", borderRadius: 20,
    fontSize: 12, cursor: "pointer", fontFamily: "inherit",
    color: "#475569", transition: "all 0.15s",
  },
  opcionPillSeleccionada: {
    background: "#0f172a", color: "#fff",
    borderColor: "#0f172a", fontWeight: 700,
  },
  error: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", padding: "10px 12px", borderRadius: 8,
    fontSize: 13, marginBottom: 12,
  },
  loading: {
    fontSize: 14, color: "#64748b", textAlign: "center", padding: 24,
  },
  btnPrimary: {
    width: "100%", background: "#0f172a", color: "#fff",
    border: "none", borderRadius: 10, padding: "13px 0",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", marginTop: 8,
  },
};
