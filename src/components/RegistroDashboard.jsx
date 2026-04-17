import { useState, useEffect } from "react";
import MapaCuerpoInteractivo from "./MapaCuerpoInteractivo";
import { calcularEscalaPendiente, PERIODO_LABEL } from "../utils/calcularEscalaPendiente";

const API_BASE = import.meta.env.VITE_API_BASE || "https://registro-protesis-backend.onrender.com";

export default function RegistroDashboard({ token, onClickPuntoVacio, onClickProtesis }) {
  const [cirugias,   setCirugias]   = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        const r = await fetch(`${API_BASE}/api/cirugias/mis-cirugias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar cirugías");
        const data = await r.json();
        setCirugias(Array.isArray(data) ? data : (data.cirugias || []));
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }
    if (token) cargar();
  }, [token]);

  // Construir mapa { "cadera-derecha": cirugia, ... } para el componente del cuerpo
  const mapaProtesis = {};
  cirugias.forEach(c => {
    const key = `${c.articulacion}-${c.lado}`;
    mapaProtesis[key] = c;
  });

  // Resumen para el header del dashboard
  const totalProtesis = cirugias.length;
  const pendientes = cirugias.filter(c => calcularEscalaPendiente(c).tipo === "pendiente");

  if (cargando) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        Cargando sus prótesis...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: "16px 16px 32px", maxWidth: 480, margin: "0 auto", width: "100%" }}>

      {/* Resumen superior */}
      <div style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
          {totalProtesis === 0
            ? "Aún no ha registrado ninguna prótesis"
            : `Tiene ${totalProtesis} prótesis registrada${totalProtesis === 1 ? "" : "s"}`}
        </div>
        {pendientes.length > 0 && (
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#dc2626",
            marginTop: 6,
          }}>
            ⚠ {pendientes.length} evaluación{pendientes.length === 1 ? "" : "es"} pendiente{pendientes.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {/* Instrucción */}
      <div style={{
        fontSize: 13,
        color: "#475569",
        textAlign: "center",
        marginBottom: 12,
        lineHeight: 1.5,
      }}>
        {totalProtesis === 0
          ? "Toque sobre cadera o rodilla para registrar su prótesis"
          : "Toque + para nueva prótesis · Toque la prótesis para evaluación"}
      </div>

      {/* Mapa corporal */}
      <MapaCuerpoInteractivo
        mapaProtesis={mapaProtesis}
        onClickPuntoVacio={onClickPuntoVacio}
        onClickProtesis={onClickProtesis}
      />

      {/* Lista de pendientes (acceso rápido) */}
      {pendientes.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            Evaluaciones pendientes
          </div>
          {pendientes.map(c => {
            const estado = calcularEscalaPendiente(c);
            return (
              <button
                key={c.id}
                onClick={() => onClickProtesis(c)}
                style={{
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #fecaca",
                  borderLeft: "4px solid #dc2626",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 8,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "capitalize" }}>
                    {c.articulacion} {c.lado === "derecha" ? "derecha" : "izquierda"}
                  </div>
                  <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, marginTop: 2 }}>
                    Evaluación {estado.label} pendiente
                  </div>
                </div>
                <span style={{ color: "#dc2626", fontSize: 18 }}>→</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
                }
