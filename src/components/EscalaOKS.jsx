import { useState } from "react";
import "../styles/dashboard-pacientes.css";

// Oxford Knee Score — IDs calzan con backend: routers/registro_escalas.py → ESCALAS["oxford_knee"]

const PREGUNTAS = [
  {
    id: "dolor_general",
    texto: "¿Cómo describiría el dolor habitual de su rodilla?",
    opciones: [
      { valor: 4, label: "Sin dolor" },
      { valor: 3, label: "Muy leve" },
      { valor: 2, label: "Leve" },
      { valor: 1, label: "Moderado" },
      { valor: 0, label: "Intenso" },
    ],
  },
  {
    id: "higiene",
    texto: "¿Tiene dificultad para lavarse y secarse?",
    opciones: [
      { valor: 4, label: "Ninguna" },
      { valor: 3, label: "Muy poca" },
      { valor: 2, label: "Moderada" },
      { valor: 1, label: "Mucha" },
      { valor: 0, label: "Incapaz de hacerlo" },
    ],
  },
  {
    id: "transporte",
    texto: "¿Tiene dificultad para entrar/salir de un auto?",
    opciones: [
      { valor: 4, label: "Ninguna" },
      { valor: 3, label: "Muy poca" },
      { valor: 2, label: "Moderada" },
      { valor: 1, label: "Mucha" },
      { valor: 0, label: "Incapaz" },
    ],
  },
  {
    id: "distancia_marcha",
    texto: "¿Cuánto puede caminar antes de que el dolor sea intenso?",
    opciones: [
      { valor: 4, label: "Sin dolor al caminar" },
      { valor: 3, label: "Más de 30 minutos" },
      { valor: 2, label: "Entre 10 y 30 minutos" },
      { valor: 1, label: "Solo unos minutos" },
      { valor: 0, label: "No puedo caminar" },
    ],
  },
  {
    id: "sentado_levantarse",
    texto: "¿Tiene dolor al levantarse de una silla?",
    opciones: [
      { valor: 4, label: "Sin dolor" },
      { valor: 3, label: "Muy leve" },
      { valor: 2, label: "Leve" },
      { valor: 1, label: "Moderado" },
      { valor: 0, label: "Intenso" },
    ],
  },
  {
    id: "cojera",
    texto: "¿Cojea al caminar?",
    opciones: [
      { valor: 4, label: "Nunca o raramente" },
      { valor: 3, label: "A veces o solo al inicio" },
      { valor: 2, label: "A menudo, no solo al inicio" },
      { valor: 1, label: "La mayoría del tiempo" },
      { valor: 0, label: "Todo el tiempo" },
    ],
  },
  {
    id: "arrodillarse",
    texto: "¿Puede arrodillarse y levantarse?",
    opciones: [
      { valor: 4, label: "Sí, sin dificultad" },
      { valor: 3, label: "Con poca dificultad" },
      { valor: 2, label: "Con moderada dificultad" },
      { valor: 1, label: "Con mucha dificultad" },
      { valor: 0, label: "No puedo" },
    ],
  },
  {
    id: "dolor_noche",
    texto: "¿Le ha molestado la rodilla por las noches?",
    opciones: [
      { valor: 4, label: "Ninguna noche" },
      { valor: 3, label: "Solo 1 o 2 noches" },
      { valor: 2, label: "Algunas noches" },
      { valor: 1, label: "La mayoría de las noches" },
      { valor: 0, label: "Todas las noches" },
    ],
  },
  {
    id: "trabajo_doméstico",
    texto: "¿Qué tan limitado está para hacer actividades domésticas?",
    opciones: [
      { valor: 4, label: "Sin limitación" },
      { valor: 3, label: "Poco limitado" },
      { valor: 2, label: "Moderadamente limitado" },
      { valor: 1, label: "Muy limitado" },
      { valor: 0, label: "Incapaz de hacerlas" },
    ],
  },
  {
    id: "confianza",
    texto: "¿Siente que su rodilla puede fallar o ceder?",
    opciones: [
      { valor: 4, label: "Nunca" },
      { valor: 3, label: "Raramente" },
      { valor: 2, label: "A veces" },
      { valor: 1, label: "A menudo" },
      { valor: 0, label: "Constantemente" },
    ],
  },
  {
    id: "compras",
    texto: "¿Puede ir de compras solo?",
    opciones: [
      { valor: 4, label: "Sí, sin dificultad" },
      { valor: 3, label: "Con poca dificultad" },
      { valor: 2, label: "Con moderada dificultad" },
      { valor: 1, label: "Con mucha dificultad" },
      { valor: 0, label: "No puedo" },
    ],
  },
  {
    id: "escaleras",
    texto: "¿Puede subir un tramo de escaleras?",
    opciones: [
      { valor: 4, label: "Sí, sin dificultad" },
      { valor: 3, label: "Con poca dificultad" },
      { valor: 2, label: "Con moderada dificultad" },
      { valor: 1, label: "Con mucha dificultad" },
      { valor: 0, label: "No puedo" },
    ],
  },
];

function getInterpretacion(score) {
  if (score >= 41) return { label: "Excelente", color: "#16a34a" };
  if (score >= 34) return { label: "Bueno",     color: "#2563eb" };
  if (score >= 27) return { label: "Regular",   color: "#d97706" };
  if (score >= 20) return { label: "Malo",      color: "#dc2626" };
  return                   { label: "Muy malo", color: "#dc2626" };
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
          <h1>Oxford Knee Score</h1>
          <p>Pregunta {preguntaIdx + 1} de {totalPregs}</p>
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
              Puntuación parcial: {score} / {Object.keys(respuestas).length * 4}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
