import { useState } from "react";
import "../styles/dashboard-pacientes.css";

// Harris Hip Score — IDs calzan con backend: routers/registro_escalas.py → ESCALAS["harris_hip"]

const PREGUNTAS = [
  {
    id: "dolor",
    seccion: "Dolor",
    texto: "¿Cuánto dolor siente en su cadera operada?",
    opciones: [
      { valor: 44, label: "Sin dolor" },
      { valor: 40, label: "Dolor leve, ocasional, no limita actividades" },
      { valor: 30, label: "Dolor leve, no necesita analgésicos" },
      { valor: 20, label: "Dolor moderado, tolerable, con algunos analgésicos" },
      { valor: 10, label: "Dolor intenso, limita mucho mis actividades" },
      { valor: 0,  label: "Dolor muy intenso, incapacitante" },
    ],
  },
  {
    id: "distancia_marcha",
    seccion: "Marcha",
    texto: "¿Cuánto puede caminar sin detenerse por el dolor?",
    opciones: [
      { valor: 11, label: "Sin limitación" },
      { valor: 8,  label: "Más de 1 km (unas 15 cuadras)" },
      { valor: 5,  label: "Entre 500 m y 1 km (5-15 cuadras)" },
      { valor: 2,  label: "Solo en casa" },
      { valor: 0,  label: "No puedo caminar o solo con andador" },
    ],
  },
  {
    id: "ayuda_marcha",
    seccion: "Marcha",
    texto: "¿Usa algún apoyo para caminar?",
    opciones: [
      { valor: 11, label: "No necesito ningún apoyo" },
      { valor: 7,  label: "Un bastón para distancias largas" },
      { valor: 5,  label: "Un bastón la mayor parte del tiempo" },
      { valor: 3,  label: "Una muleta" },
      { valor: 2,  label: "Dos bastones o dos muletas" },
      { valor: 0,  label: "No puedo caminar ni con apoyo" },
    ],
  },
  {
    id: "escaleras",
    seccion: "Actividad",
    texto: "¿Cómo sube escaleras?",
    opciones: [
      { valor: 4, label: "Normal, sin apoyarme en el pasamanos" },
      { valor: 2, label: "Apoyándome en el pasamanos" },
      { valor: 1, label: "Con dificultad, de cualquier manera" },
      { valor: 0, label: "No puedo subir escaleras" },
    ],
  },
  {
    id: "calzado",
    seccion: "Actividad",
    texto: "¿Puede ponerse los zapatos y calcetines?",
    opciones: [
      { valor: 4, label: "Sí, sin dificultad" },
      { valor: 2, label: "Con algo de dificultad" },
      { valor: 0, label: "No puedo hacerlo solo" },
    ],
  },
  {
    id: "sentado",
    seccion: "Actividad",
    texto: "¿Puede sentarse en una silla por más de una hora?",
    opciones: [
      { valor: 5, label: "Sí, en cualquier silla" },
      { valor: 3, label: "Solo en sillas altas" },
      { valor: 0, label: "No puedo sentarme cómodamente" },
    ],
  },
  {
    id: "transporte",
    seccion: "Actividad",
    texto: "¿Puede entrar y salir de un auto o transporte público?",
    opciones: [
      { valor: 1, label: "Sí, sin dificultad" },
      { valor: 0, label: "No puedo" },
    ],
  },
  {
    id: "cojera",
    seccion: "Marcha",
    texto: "¿Cojea al caminar?",
    opciones: [
      { valor: 11, label: "No cojeo" },
      { valor: 8,  label: "Levemente" },
      { valor: 5,  label: "Moderadamente" },
      { valor: 0,  label: "Cojera severa" },
    ],
  },
];

function getInterpretacion(score) {
  if (score >= 90) return { label: "Excelente", color: "#16a34a" };
  if (score >= 80) return { label: "Bueno",     color: "#2563eb" };
  if (score >= 70) return { label: "Regular",   color: "#d97706" };
  return                   { label: "Malo",     color: "#dc2626" };
}

export default function EscalaHHS({ onComplete, onBack }) {
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [respuestas,  setRespuestas]  = useState({});

  const pregunta   = PREGUNTAS[preguntaIdx];
  const totalPregs = PREGUNTAS.length;
  const esUltima   = preguntaIdx === totalPregs - 1;
  const pct        = Math.round((Object.keys(respuestas).length / totalPregs) * 100);

  function handleOpcion(valor) {
    const nuevas = { ...respuestas, [pregunta.id]: valor };
    setRespuestas(nuevas);
    if (!esUltima) {
      setTimeout(() => setPreguntaIdx(i => i + 1), 300);
    } else {
      const score = Object.values(nuevas).reduce((a, b) => a + b, 0);
      // ← Formato EXACTO que consume RegistroEscalaForm
      onComplete?.({
        respuestas: nuevas,
        score,
        interpretacion: getInterpretacion(score).label,
      });
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
                  cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {op.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button
              className="dp-btn-secondary"
              style={{ width: "auto", padding: "10px 16px" }}
              onClick={() => preguntaIdx > 0 ? setPreguntaIdx(i => i - 1) : onBack?.()}
            >
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
