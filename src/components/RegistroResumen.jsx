import { useState } from "react";
import { ProthesisIcon } from "./ui/ProthesisIcon";

const ESTADO_COLOR = {
  pendiente: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  parcial: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  completo: { bg: "#dcfce7", border: "#10b981", text: "#065f46" }
};

const SEGMENTOS = {
  cadera: "🦴 Cadera",
  rodilla: "🦵 Rodilla",
};

export default function RegistroResumen({ cirugias, onNuevaCirugia, onCompletarEscala }) {
  const [cirugiaSeleccionada, setCirugiaSeleccionada] = useState(null);

  const getEstado = (cirugia) => {
    const total = cirugia.esquema?.total || 6;
    const completadas = cirugia.evaluaciones?.length || 0;

    if (completadas === 0) return "pendiente";
    if (completadas >= total) return "completo";
    return "parcial";
  };

  const getProgreso = (cirugia) => {
    const total = cirugia.esquema?.total || 6;
    const completadas = cirugia.evaluaciones?.length || 0;
    return Math.round((completadas / total) * 100);
  };

  const LADO_LABEL = { izq: "Izquierdo", der: "Derecho" };

  return (
    <div style={{ flex: 1, padding: "32px 24px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
          <ProthesisIcon />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          Mis Prótesis Registradas
        </h1>
        <p style={{ fontSize: 15, color: "#475569", maxWidth: 500, margin: "0 auto" }}>
          Aquí puedes ver el estado de tus cirugías y evaluaciones de seguimiento.
        </p>
      </div>

      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <button
          className="dp-btn-primary"
          style={{ fontSize: 15, padding: "14px 32px", borderRadius: 12 }}
          onClick={onNuevaCirugia}
        >
          + Nueva Cirugía / Revisión
        </button>
      </div>

      {cirugias.length === 0 ? (
        <div
          style={{
            background: "#f8fafc",
            border: "2px dashed #cbd5e1",
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            No tienes cirugías registradas
          </h3>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
            Registra tu primera prótesis para comenzar el seguimiento.
          </p>
          <button
            className="dp-btn-primary"
            style={{ padding: "12px 28px" }}
            onClick={onNuevaCirugia}
          >
            Registrar Primera Prótesis
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #e2e8f0",
              marginBottom: 24
            }}
          >
            <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 24, color: "#0f172a" }}>
                  {cirugias.length}
                </div>
                <div style={{ color: "#64748b" }}>Prótesis totales</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 24, color: "#0f172a" }}>
                  {cirugias.filter((c) => getProgreso(c) === 100).length}
                </div>
                <div style={{ color: "#64748b" }}>Completas</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 24, color: "#0f172a" }}>
                  {cirugias.filter((c) => getProgreso(c) < 100 && getProgreso(c) > 0).length}
                </div>
                <div style={{ color: "#64748b" }}>En progreso</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
            {cirugias.map((cirugia) => {
              const estado = getEstado(cirugia);
              const progreso = getProgreso(cirugia);
              const colores = ESTADO_COLOR[estado];

              return (
                <div
                  key={cirugia.id}
                  style={{
                    border: `2px solid ${colores.border}`,
                    borderRadius: 12,
                    background: colores.bg,
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "20px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: 4
                          }}
                        >
                          {SEGMENTOS[cirugia.segmento] || cirugia.segmento} - {LADO_LABEL[cirugia.lado] || cirugia.lado}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: colores.text,
                            fontWeight: 600
                          }}
                        >
                          {cirugia.tipo === "revision" ? "🔄 Revisión" : "🆕 Primaria"} •{" "}
                          {cirugia.fecha_cirugia
                            ? new Date(cirugia.fecha_cirugia).toLocaleDateString("es-CL")
                            : "Sin fecha"}
                        </div>
                      </div>
                      <div style={{ fontSize: 42, lineHeight: 1 }}>
                        {estado === "completo" ? "✅" : estado === "parcial" ? "⚡" : "⏳"}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "#64748b",
                          marginBottom: 6
                        }}
                      >
                        <span>
                          Evaluaciones: {cirugia.evaluaciones?.length || 0} / {cirugia.esquema?.total || 6}
                        </span>
                        <span>{progreso}%</span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "#e2e8f0",
                          borderRadius: 4,
                          overflow: "hidden"
                        }}
                      >
                        <div
                          style={{
                            width: `${progreso}%`,
                            height: "100%",
                            background: colores.border,
                            borderRadius: 4,
                            transition: "width 0.3s ease"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {progreso < 100 && (
                        <button
                          className="dp-btn-primary"
                          style={{
                            flex: 1,
                            fontSize: 13,
                            padding: "8px 12px",
                            minHeight: 36
                          }}
                          onClick={() => onCompletarEscala(cirugia.id, "postop", cirugia.segmento)}
                        >
                          Completar Evaluación
                        </button>
                      )}
                      {progreso === 100 && (
                        <div
                          style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: 12,
                            color: colores.text,
                            fontWeight: 600
                          }}
                        >
                          ✅ Seguimiento completo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
