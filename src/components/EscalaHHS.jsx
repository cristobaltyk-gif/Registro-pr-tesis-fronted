import { useState } from "react";
import "../styles/dashboard-pacientes.css";

// Harris Hip Score — versión auto-reporte paciente
// Secciones: Dolor (44pts), Función-marcha (33pts), Función-actividad (14pts), Deformidad (4pts), Movilidad (5pts)
// Esta versión cubre dolor, función y actividad (las que el paciente puede responder)

const SECCIONES = [
  {
    id: "dolor",
    titulo: "Dolor",
    preguntas: [
      {
        id: "d1",
        texto: "¿Cómo describiría el dolor de su cadera?",
        opciones: [
          { valor: 44, label: "Ningún dolor" },
          { valor: 40, label: "Dolor leve, ocasional, no limita actividad" },
          { valor: 30, label: "Dolor leve al hacer actividad, sin tomar analgésicos" },
          { valor: 20, label: "Dolor moderado, limita actividad, toma analgésicos ocasionalmente" },
          { valor: 10, label: "Dolor marcado, limita actividad, toma analgésicos frecuentemente" },
          { valor: 0,  label: "Dolor incapacitante, encamado" },
        ],
      },
    ],
  },
  {
    id: "marcha",
    titulo: "Marcha",
    preguntas: [
      {
        id: "m1",
        texto: "¿Cómo es su cojera al caminar?",
        opciones: [
          { valor: 11, label: "Sin cojera" },
          { valor: 8,  label: "Cojera leve" },
          { valor: 5,  label: "Cojera moderada" },
          { valor: 0,  label: "Cojera intensa o no puede caminar" },
        ],
      },
      {
        id: "m2",
        texto: "¿Necesita algún apoyo para caminar?",
        opciones: [
          { valor: 11, label: "Ninguno" },
          { valor: 7,  label: "Bastón en distancias largas" },
          { valor: 5,  label: "Bastón la mayor parte del tiempo" },
          { valor: 3,  label: "Una muleta" },
          { valor: 2,  label: "Dos bastones" },
          { valor: 0,  label: "Dos muletas o no puede caminar" },
        ],
      },
      {
        id: "m3",
        texto: "¿Cuánta distancia puede caminar?",
        opciones: [
          { valor: 11, label: "Sin limitación" },
          { valor: 8,  label: "Más de 6 cuadras" },
          { valor: 5,  label: "2 a 6 cuadras" },
          { valor: 2,  label: "Solo por la casa" },
          { valor: 0,  label: "En cama o silla de ruedas" },
        ],
      },
    ],
  },
  {
    id: "actividad",
    titulo: "Actividad",
    preguntas: [
      {
        id: "a1",
        texto: "¿Puede subir escaleras?",
        opciones: [
          { valor: 4, label: "Con normalidad, sin apoyo" },
          { valor: 2, label: "Con apoyo en el pasamanos" },
          { valor: 1, label: "Con dificultad" },
          { valor: 0, label: "No puedo" },
        ],
      },
      {
        id: "a2",
        texto: "¿Puede ponerse los calcetines o zapatos?",
        opciones: [
          { valor: 4, label: "Con facilidad" },
          { valor: 2, label: "Con dificultad" },
          { valor: 0, label: "No puedo" },
        ],
      },
      {
        id: "a3",
        texto: "¿Puede sentarse en una silla?",
        opciones: [
          { valor: 5, label: "En cualquier silla por más de 1 hora" },
          { valor: 3, label: "En silla alta por media hora" },
          { valor: 0, label: "No puedo sentarse cómodamente" },
        ],
      },
      {
        id: "a4",
        texto: "¿Puede usar transporte público?",
        opciones: [
          { valor: 1, label: "Sí" },
          { valor: 0, label: "No" },
        ],
      },
    ],
  },
];

function getInterpretacion(score) {
  if (score >= 90) return { label: "Excelente", color: "#16a34a" };
  if (score >= 80) return { label: "Bueno",      color: "#2563eb" };
  if (score >= 70) return { label: "Regular",    color: "#d97706" };
  return                   { label: "Malo",      color: "#dc2626" };
}

export default function EscalaHHS({ onComplete, onBack }) {
  // Aplanar todas las preguntas
  const todasPreguntas = SECCIONES.flatMap(s => s.preguntas.map(p => ({ ...p, seccion: s.titulo })));
  const totalPregs     = todasPreguntas.length;

  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [respuestas,  setRespuestas]  = useState({});

  const pregunta = todasPreguntas[preguntaIdx];
  const esUltima = preguntaIdx === totalPregs - 1;
  const pct      = Math.round((Object.keys(respuestas).length / totalPregs) * 100);

  function handleOpcion(valor) {
    const nuevas = { ...respuestas, [pregunta.id]: valor };
    setRespuestas(nuevas);
    if (!esUltima) {
      setTimeout(() => setPreguntaIdx(i => i + 1), 300);
    } else {
      const score = Object.values(nuevas).reduce((a, b) => a + b, 0);
      onComplete?.({ escala: "HHS", respuestas: nuevas, score, interpretacion: getInterpretacion(score).label });
    }
  }

  const score = Object.values(respuestas).reduce((a, b) => a + b, 0);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Harris Hip Score</h1>
          <p>{pregunta.seccion} · Pregunta {preguntaIdx + 1} de {totalPregs}</p>
        </div>
      </div>

      <div className="dp-content">

        <div className="dp-progress-bar" style={{ marginBottom: 20 }}>
          <div className="dp-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="dp-card">
          <p style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", lineHeight: 1.5, marginBottom: 20 }}>
            {pregunta.texto}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pregunta.opciones.map(op => (
              <button
                key={op.valor}
                onClick={() => handleOpcion(op.valor)}
                style={{
                  textAlign: "left", padding: "14px 16px",
                  border: `1.5px solid ${respuestas[pregunta.id] === op.valor ? "#0f172a" : "#e2e8f0"}`,
                  borderRadius: 10,
                  background: respuestas[pregunta.id] === op.valor ? "#0f172a" : "#fff",
                  color: respuestas[pregunta.id] === op.valor ? "#fff" : "#0f172a",
                  fontSize: 15, fontWeight: 500,
                  cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {op.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "10px 16px" }}
              onClick={() => preguntaIdx > 0 ? setPreguntaIdx(i => i - 1) : onBack?.()}>
              ← Volver
            </button>
          </div>
        </div>

        {Object.keys(respuestas).length > 0 && (
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Puntuación parcial: {score}
            </span>
          </div>
        )}

      </div>
    </div>
  );
        }
