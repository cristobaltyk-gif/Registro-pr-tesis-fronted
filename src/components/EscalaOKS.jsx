import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const PREGUNTAS = [
  {
    id: 1,
    texto: "¿Cómo describiría el dolor habitual de su rodilla?",
    opciones: [
      { valor: 4, label: "Ninguno" },
      { valor: 3, label: "Muy leve" },
      { valor: 2, label: "Leve" },
      { valor: 1, label: "Moderado" },
      { valor: 0, label: "Intenso" },
    ],
  },
  {
    id: 2,
    texto: "¿Ha tenido dificultad para lavarse y secarse (todo el cuerpo) a causa de su rodilla?",
    opciones: [
      { valor: 4, label: "Sin dificultad" },
      { valor: 3, label: "Poca dificultad" },
      { valor: 2, label: "Dificultad moderada" },
      { valor: 1, label: "Mucha dificultad" },
      { valor: 0, label: "Imposible" },
    ],
  },
  {
    id: 3,
    texto: "¿Ha tenido dificultad para entrar y salir de un auto a causa de su rodilla?",
    opciones: [
      { valor: 4, label: "Sin dificultad" },
      { valor: 3, label: "Poca dificultad" },
      { valor: 2, label: "Dificultad moderada" },
      { valor: 1, label: "Mucha dificultad" },
      { valor: 0, label: "Imposible" },
    ],
  },
  {
    id: 4,
    texto: "¿Cuánto tiempo puede caminar antes de que el dolor de su rodilla sea intenso?",
    opciones: [
      { valor: 4, label: "Sin dolor / más de 30 minutos" },
      { valor: 3, label: "16 a 30 minutos" },
      { valor: 2, label: "5 a 15 minutos" },
      { valor: 1, label: "Solo por casa" },
      { valor: 0, label: "No puedo caminar" },
    ],
  },
  {
    id: 5,
    texto: "Después de una comida, ¿cuánta dificultad tiene para levantarse de una silla a causa de su rodilla?",
    opciones: [
      { valor: 4, label: "Sin dificultad" },
      { valor: 3, label: "Poca dificultad" },
      { valor: 2, label: "Dificultad moderada" },
      { valor: 1, label: "Mucha dificultad" },
      { valor: 0, label: "Imposible" },
    ],
  },
  {
    id: 6,
    texto: "¿Ha coxeado (cojead) al caminar a causa de su rodilla?",
    opciones: [
      { valor: 4, label: "Raramente / nunca" },
      { valor: 3, label: "A veces o solo al principio" },
      { valor: 2, label: "A menudo, no solo al principio" },
      { valor: 1, label: "La mayor parte del tiempo" },
      { valor: 0, label: "Siempre" },
    ],
  },
  {
    id: 7,
    texto: "¿Puede arrodillarse y levantarse después?",
    opciones: [
      { valor: 4, label: "Sí, sin dificultad" },
      { valor: 3, label: "Con poca dificultad" },
      { valor: 2, label: "Con dificultad moderada" },
      { valor: 1, label: "Con mucha dificultad" },
      { valor: 0, label: "No puedo" },
    ],
  },
  {
    id: 8,
    texto: "¿Ha tenido dolor de rodilla por la noche en la cama?",
    opciones: [
      { valor: 4, label: "Ninguna noche" },
      { valor: 3, label: "Solo 1 o 2 noches" },
      { valor: 2, label: "Algunas noches" },
      { valor: 1, label: "La mayoría de las noches" },
      { valor: 0, label: "Todas las noches" },
    ],
  },
  {
    id: 9,
    texto: "¿Cuánto ha interferido el dolor de su rodilla en su trabajo habitual (incluidas las tareas del hogar)?",
    opciones: [
      { valor: 4, label: "Nada" },
      { valor: 3, label: "Un poco" },
      { valor: 2, label: "Moderadamente" },
      { valor: 1, label: "Mucho" },
      { valor: 0, label: "Totalmente" },
    ],
  },
  {
    id: 10,
    texto: "¿Ha tenido la sensación de que su rodilla puede fallar o doblarse?",
    opciones: [
      { valor: 4, label: "Raramente / nunca" },
      { valor: 3, label: "A veces o solo al principio" },
      { valor: 2, label: "A menudo, no solo al principio" },
      { valor: 1, label: "La mayor parte del tiempo" },
      { valor: 0, label: "Siempre" },
    ],
  },
  {
    id: 11,
    texto: "¿Puede hacer la compra por sí solo?",
    opciones: [
      { valor: 4, label: "Sí, sin dificultad" },
      { valor: 3, label: "Con poca dificultad" },
      { valor: 2, label: "Con dificultad moderada" },
      { valor: 1, label: "Con mucha dificultad" },
      { valor: 0, label: "No puedo" },
    ],
  },
  {
    id: 12,
    texto: "¿Puede bajar un tramo de escaleras?",
    opciones: [
      { valor: 4, label: "Sí, sin dificultad" },
      { valor: 3, label: "Con poca dificultad" },
      { valor: 2, label: "Con dificultad moderada" },
      { valor: 1, label: "Con mucha dificultad" },
      { valor: 0, label: "No puedo" },
    ],
  },
];

function getInterpretacion(score) {
  if (score >= 41) return { label: "Excelente",  color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
  if (score >= 34) return { label: "Bueno",       color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
  if (score >= 27) return { label: "Moderado",    color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  return                   { label: "Severo",     color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
}

export default function EscalaOKS({ onComplete, onBack }) {
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [respuestas,  setRespuestas]  = useState({});

  const pregunta    = PREGUNTAS[preguntaIdx];
  const totalPregs  = PREGUNTAS.length;
  const esUltima    = preguntaIdx === totalPregs - 1;
  const pct         = Math.round((Object.keys(respuestas).length / totalPregs) * 100);

  function handleOpcion(valor) {
    const nuevas = { ...respuestas, [pregunta.id]: valor };
    setRespuestas(nuevas);
    if (!esUltima) {
      setTimeout(() => setPreguntaIdx(i => i + 1), 300);
    } else {
      const score = Object.values(nuevas).reduce((a, b) => a + b, 0);
      onComplete?.({ escala: "OKS", respuestas: nuevas, score, interpretacion: getInterpretacion(score).label });
    }
  }

  const score         = Object.values(respuestas).reduce((a, b) => a + b, 0);
  const interpretacion = getInterpretacion(score);

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Oxford Knee Score</h1>
          <p>Pregunta {preguntaIdx + 1} de {totalPregs}</p>
        </div>
      </div>

      <div className="dp-content">

        {/* Barra progreso */}
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

          {/* Navegación */}
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button className="dp-btn-secondary" style={{ width: "auto", padding: "10px 16px" }}
              onClick={() => preguntaIdx > 0 ? setPreguntaIdx(i => i - 1) : onBack?.()}>
              ← Volver
            </button>
          </div>
        </div>

        {/* Score parcial */}
        {Object.keys(respuestas).length > 0 && (
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Puntuación parcial: {score} / {Object.keys(respuestas).length * 4}
            </span>
          </div>
        )}

      </div>
    </div>
  );
    }
