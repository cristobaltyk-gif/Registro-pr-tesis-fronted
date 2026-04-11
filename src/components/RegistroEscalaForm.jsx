import { useEffect, useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

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
    "3m":  "a los 3 meses",
    "6m":  "a los 6 meses",
    "1a":  "al año",
    "2a":  "a los 2 años",
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [aplRes, defRes] = await Promise.all([
          fetch(`${API_URL}/api/registro/escalas/aplicables/${cirugiaId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/registro/escalas/definicion`),
        ]);
        const apl  = aplRes.ok  ? await aplRes.json()  : { escalas: [] };
        const defs = defRes.ok  ? await defRes.json()  : {};
        setEscalasDisponibles(apl.escalas || []);
        setDefiniciones(defs);
      } catch { setError("Error cargando las evaluaciones."); }
      finally  { setLoading(false); }
    }
    load();
  }, [cirugiaId, token]);

  function setRespuesta(id, valor) {
    setRespuestas(prev => ({ ...prev, [id]: Number(valor) }));
  }

  function getPreguntas(key) {
    const def = definiciones[key];
    if (!def) return [];
    if (key === "womac") return def.secciones.flatMap(s => s.preguntas);
    return def.preguntas || [];
  }

  function faltantes(key) {
    return getPreguntas(key).filter(p => respuestas[p.id] === undefined).length;
  }

  async function handleGuardar() {
    setError(null);
    const key = escalasDisponibles[escalaActual];
    const f   = faltantes(key);
    if (f > 0) { setError(`Faltan ${f} pregunta(s) por responder`); return; }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/escalas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ cirugia_id: cirugiaId, periodo, escala: key, respuestas }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j?.detail || "Error guardando"); }
      const data = await res.json();
      const nuevos = [...resultados, { escala: key, ...data }];
      setResultados(nuevos);
      setRespuestas({});
      if (escalaActual + 1 < escalasDisponibles.length) {
        setEscalaActual(escalaActual + 1);
      } else {
        onComplete?.(nuevos);
      }
    } catch (e) { setError(e.message); }
    finally     { setSaving(false); }
  }

  if (loading) return <div className="dp-loading">Cargando evaluación…</div>;

  if (escalasDisponibles.length === 0) {
    return (
      <div className="dp-root">
        <div className="dp-content">
          <div className="dp-card">
            <p className="dp-empty">No hay evaluaciones disponibles para este tipo de prótesis.</p>
            <button className="dp-btn-primary" onClick={() => onComplete?.([])}>Continuar →</button>
          </div>
        </div>
      </div>
    );
  }

  const key  = escalasDisponibles[escalaActual];
  const def  = definiciones[key];
  if (!def) return <div className="dp-loading">Cargando escala…</div>;

  const total      = escalasDisponibles.length;
  const totalPreg  = getPreguntas(key).length;
  const respondidas = getPreguntas(key).filter(p => respuestas[p.id] !== undefined).length;
  const pct        = Math.round((respondidas / totalPreg) * 100);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Evaluación {PERIODOS_TEXTO[periodo]}</h1>
          <p>Cuestionario {escalaActual + 1} de {total} — {def.nombre}</p>
        </div>
      </div>

      <div className="dp-content">

        {/* Progreso */}
        <div className="dp-card" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Progreso</span>
            <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{respondidas}/{totalPreg}</span>
          </div>
          <div className="dp-progress-bar">
            <div className="dp-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Descripción */}
        <div className="dp-card" style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          {def.descripcion}
        </div>

        {error && <div className="dp-error" style={{ marginBottom: 12 }}>{error}</div>}

        {/* Harris Hip / Oxford Knee */}
        {key !== "womac" && def.preguntas?.map((preg, idx) => (
          <div key={preg.id} className="dp-card">
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
              Pregunta {idx + 1}
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 12, lineHeight: 1.5 }}>
              {preg.texto}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {preg.opciones.map((op, i) => {
                const sel = respuestas[preg.id] === op.valor;
                return (
                  <button key={i} onClick={() => setRespuesta(preg.id, op.valor)}
                    style={{
                      textAlign: "left", padding: "11px 14px",
                      background: sel ? "#0f172a" : "#fff",
                      border: `1.5px solid ${sel ? "#0f172a" : "#e2e8f0"}`,
                      borderRadius: 10, fontSize: 13, cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      color: sel ? "#fff" : "#334155", fontWeight: sel ? 600 : 400,
                    }}>
                    {sel && "✓ "}{op.texto}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* WOMAC */}
        {key === "womac" && def.secciones?.map(seccion => (
          <div key={seccion.id} className="dp-card">
            <div className="dp-section-title">{seccion.titulo}</div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{seccion.intro}</p>
            {seccion.preguntas.map(preg => (
              <div key={preg.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: 13, color: "#334155", marginBottom: 8, fontWeight: 500 }}>{preg.texto}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {def.opciones_comunes.map((op, i) => {
                    const sel = respuestas[preg.id] === op.valor;
                    return (
                      <button key={i} onClick={() => setRespuesta(preg.id, op.valor)}
                        style={{
                          padding: "6px 12px",
                          background: sel ? "#0f172a" : "#fff",
                          border: `1.5px solid ${sel ? "#0f172a" : "#e2e8f0"}`,
                          borderRadius: 20, fontSize: 12, cursor: "pointer",
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          color: sel ? "#fff" : "#475569", fontWeight: sel ? 700 : 400,
                        }}>
                        {op.texto}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        <button className="dp-btn-primary" onClick={handleGuardar}
          disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? "Guardando…" : escalaActual + 1 < total ? "Guardar y continuar →" : "Finalizar evaluación ✓"}
        </button>

      </div>
    </div>
  );
}
