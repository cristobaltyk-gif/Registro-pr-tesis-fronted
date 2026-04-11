import { useState } from "react";
import "../styles/dashboard-pacientes.css";
import PasoCirugia  from "./PasoCirugia";
import PasoLugar    from "./PasoLugar";
import PasoImplante from "./PasoImplante";
import PasoFecha    from "./PasoFecha";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegistroCirugiaForm({ token, onComplete }) {
  const [paso,   setPaso]   = useState(1);
  const [datos,  setDatos]  = useState({});
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  // ── Paso 1 — tipo de cirugía + lado ─────────────────────
  function handleCirugia(d) {
    setDatos(prev => ({ ...prev, ...d }));
    setPaso(2);
  }

  // ── Paso 2 — lugar ───────────────────────────────────────
  function handleLugar(d) {
    setDatos(prev => ({ ...prev, ...d }));
    setPaso(3);
  }

  // ── Paso 3 — implante ────────────────────────────────────
  function handleImplante(d) {
    setDatos(prev => ({ ...prev, ...d }));
    setPaso(4);
  }

  // ── Paso 4 — fecha → guardar ─────────────────────────────
  async function handleFecha(d) {
    setError(null);
    const todo = { ...datos, ...d };
    setSaving(true);
    try {
      const payload = {
        fecha_cirugia:   todo.fecha_cirugia,
        tipo_protesis:   todo.tipo_cirugia,
        lado:            todo.lado,
        indicacion:      todo.indicacion,
        nombre_clinica:  todo.clinica,
        ciudad_clinica:  todo.ciudad,
        region_clinica:  todo.region,
        nombre_cirujano: "Por confirmar",   // médico se agrega después
        marca_implante:  todo.marca   || "",
        modelo_implante: todo.modelo  || todo.cotilo || "",
        fijacion:        todo.fijacion || "",
        alineacion:      todo.alineacion || "",
        robotica:        todo.robotica || "",
        vastago:         todo.vastago  || "",
        notas:           "",
      };

      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando cirugía");
      }

      const data = await res.json();
      onComplete?.({ ...data, periodo_escala: todo.periodo_escala });

    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  // ── Barra de progreso ────────────────────────────────────
  const PASOS_LABEL = ["Tipo", "Lugar", "Implante", "Fecha"];

  return (
    <div style={{ position: "relative" }}>

      {/* Barra pasos */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "12px 20px", background: "#fff",
        borderBottom: "1px solid #e2e8f0", gap: 0, overflowX: "auto",
      }}>
        {PASOS_LABEL.map((label, i) => {
          const num    = i + 1;
          const activo = num <= paso;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: activo ? "#0f172a" : "#e2e8f0",
                color:      activo ? "#fff"    : "#94a3b8",
              }}>
                {num < paso ? "✓" : num}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, marginRight: 6, whiteSpace: "nowrap",
                color: activo ? "#0f172a" : "#94a3b8",
              }}>
                {label}
              </span>
              {i < PASOS_LABEL.length - 1 && (
                <div style={{
                  width: 20, height: 2, marginRight: 6, flexShrink: 0,
                  background: num < paso ? "#0f172a" : "#e2e8f0",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="registro-error" style={{ margin: "12px 16px 0" }}>{error}</div>
      )}

      {saving && (
        <div className="dp-loading">Guardando cirugía…</div>
      )}

      {!saving && (
        <>
          {paso === 1 && (
            <PasoCirugia
              onComplete={handleCirugia}
              inicial={datos}
            />
          )}
          {paso === 2 && (
            <PasoLugar
              onComplete={handleLugar}
              onBack={() => setPaso(1)}
              inicial={datos}
            />
          )}
          {paso === 3 && (
            <PasoImplante
              tipoCirugia={datos.tipo_cirugia}
              onComplete={handleImplante}
              onBack={() => setPaso(2)}
              inicial={datos}
            />
          )}
          {paso === 4 && (
            <PasoFecha
              onComplete={handleFecha}
              onBack={() => setPaso(3)}
              inicial={datos}
            />
          )}
        </>
      )}

    </div>
  );
          }
                    
