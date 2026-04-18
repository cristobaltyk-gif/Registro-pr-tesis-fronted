import React from "react";
import cuerpoBase from "../assets/cuerpoFrontal.png";
import { calcularEscalaPendiente } from "../utils/calcularEscalaPendiente";

const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

// ═══════════════════════════════════════════════════════════════
// COORDENADAS CALIBRADAS sobre cuerpoFrontal.png (1024x1536)
// ViewBox SVG = 400x650
// - Caderas (y=336): en la articulación coxofemoral real (ingle)
// - Rodillas (y=474): centro de rótula
// - X separado para quedar sobre cada lado del cuerpo
// ═══════════════════════════════════════════════════════════════
const PUNTOS_ARTICULACIONES = [
  // Cadera derecha del paciente = izquierda del observador
  { id: "cadera-derecha",    x: 170, y: 336, label: "Cadera D",  lado: "derecha"   },
  // Cadera izquierda del paciente = derecha del observador
  { id: "cadera-izquierda",  x: 240, y: 336, label: "Cadera I",  lado: "izquierda" },
  { id: "rodilla-derecha",   x: 178, y: 474, label: "Rodilla D", lado: "derecha"   },
  { id: "rodilla-izquierda", x: 232, y: 474, label: "Rodilla I", lado: "izquierda" },
];

// ═══════════════════════════════════════════════════════════════
// ICONO CADERA — vista anterior (observador mira al paciente de frente)
//
// Diseñado para CADERA DERECHA DEL PACIENTE (= izquierda de la imagen):
//   • Cotilo arriba centrado en el icono (la pelvis)
//   • Cabeza femoral dentro del cotilo, desplazada lateralmente
//     (bajo el trocánter mayor — el lateral del cuerpo)
//   • Cuello femoral OBLICUO: de arriba-lateral a abajo-medial
//   • Vástago baja por el lado MEDIAL del icono
//     → al estar en cadera derecha, apunta hacia el centro del cuerpo ✓
//
// Para CADERA IZQUIERDA DEL PACIENTE: scale(-1,1) lo espeja → el
// vástago también queda apuntando al centro del cuerpo ✓
// ═══════════════════════════════════════════════════════════════
function IconoCadera({ x, y, color = "#2563eb", lado = "derecha" }) {
  // lado "derecha" del paciente → dibujo natural
  // lado "izquierda" del paciente → espejado horizontal
  const flip = lado === "derecha" ? 1 : -1;

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>
      {/* 1. COTILO ACETABULAR — copa de la pelvis, arriba */}
      <path
        d="M -9,-9 A 9,9 0 0 1 9,-9 L 7,-7 A 7,7 0 0 0 -7,-7 Z"
        fill={color}
      />

      {/* 2. CABEZA FEMORAL — esfera desplazada al lado LATERAL (izq del icono)
             bajo la parte lateral del cotilo (hacia el trocánter mayor) */}
      <circle cx="-3" cy="-5" r="4" fill={color} />

      {/* 3. CUELLO FEMORAL — oblicuo, de arriba-lateral a abajo-medial
             Conecta la cabeza con el inicio del vástago */}
      <path
        d="M -5,-3 L -2,-1 L 4,4 L 2,6 L -2,2 L -6,-1 Z"
        fill={color}
      />

      {/* 4. VÁSTAGO FEMORAL — baja dentro del fémur por el lado MEDIAL
             (= hacia el centro del cuerpo cuando es cadera derecha) */}
      <path
        d="M 2,5 L 6,5 L 5,14 L 3,14 Z"
        fill={color}
      />
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════
// ICONO RODILLA — simétrica por naturaleza
// ═══════════════════════════════════════════════════════════════
function IconoRodilla({ x, y, color = "#2563eb", lado = "derecha" }) {
  const flip = lado === "derecha" ? 1 : -1;

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>
      {/* Componente femoral — cóndilos curvos */}
      <path
        d="M -7,-10 Q -8,-4 -5,-2 L 5,-2 Q 8,-5 7,-10 Q 5,-11 3,-10 Q 0,-9 -3,-10 Q -5,-11 -7,-10 Z"
        fill={color}
      />
      {/* Inserto de polietileno */}
      <rect x="-6" y="-1.5" width="12" height="1.5" fill={color} opacity="0.45" />
      {/* Bandeja tibial */}
      <rect x="-7" y="0.5" width="14" height="3" rx="0.5" fill={color} />
      {/* Vástago tibial corto */}
      <path d="M -2,3.5 L 2,3.5 L 1.5,11 L -1.5,11 Z" fill={color} />
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════
// UI AUXILIARES
// ═══════════════════════════════════════════════════════════════
function BarraProgreso({ x, y, cirugia }) {
  const ep = cirugia?.escalas_programadas || {};
  const completados = PERIODOS_ORDEN.filter(p => ep[p]?.completada).length;
  const total = PERIODOS_ORDEN.length;
  const pct = total > 0 ? completados / total : 0;

  const barW = 40, barH = 5;
  const barX = x - barW / 2, barY = y - 32;

  return (
    <g>
      <rect x={barX} y={barY} width={barW} height={barH} rx="2.5" fill="#e2e8f0" />
      <rect x={barX} y={barY} width={barW * pct} height={barH} rx="2.5" fill="#16a34a" />
      <text x={x} y={barY - 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#16a34a">
        {completados}/{total}
      </text>
    </g>
  );
}

function BadgePendiente({ x, y }) {
  return (
    <g>
      <circle cx={x + 12} cy={y - 12} r="7" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <text x={x + 12} y={y - 9} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">!</text>
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function MapaCuerpoInteractivo({
  mapaProtesis,
  onClickPuntoVacio,
  onClickProtesis,
}) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 400, margin: "0 auto" }}>
      <svg viewBox="0 0 400 650" style={{ width: "100%", height: "auto" }}>
        <image href={cuerpoBase} x="0" y="0" width="400" height="650" />

        {PUNTOS_ARTICULACIONES.map(punto => {
          const cirugia       = mapaProtesis[punto.id] || null;
          const tieneProtesis = !!cirugia;
          const esCadera      = punto.id.startsWith("cadera");

          const estado = tieneProtesis ? calcularEscalaPendiente(cirugia) : null;
          const tienePendiente = estado?.tipo === "pendiente";

          const colorBase = tieneProtesis
            ? (tienePendiente ? "#dc2626" : "#2563eb")
            : "#94a3b8";

          function handleClick() {
            if (tieneProtesis) onClickProtesis(cirugia);
            else               onClickPuntoVacio(punto.id);
          }

          return (
            <g key={punto.id} onClick={handleClick} style={{ cursor: "pointer" }}>
              {/* Área clic invisible más grande */}
              <circle cx={punto.x} cy={punto.y} r="28" fill="transparent" />

              {tieneProtesis ? (
                <>
                  {/* Halo pulsante si hay pendiente */}
                  {tienePendiente && (
                    <circle
                      cx={punto.x} cy={punto.y} r="22" fill="none"
                      stroke={colorBase} strokeWidth="2" strokeDasharray="4 3" opacity="0.5"
                    >
                      <animate attributeName="r" values="22;26;22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Fondo circular del icono */}
                  <circle
                    cx={punto.x} cy={punto.y} r="17"
                    fill={tienePendiente ? "#fef2f2" : "#eff6ff"}
                    stroke={colorBase} strokeWidth="1.5"
                  />

                  {/* Icono específico */}
                  {esCadera
                    ? <IconoCadera  x={punto.x} y={punto.y} color={colorBase} lado={punto.lado} />
                    : <IconoRodilla x={punto.x} y={punto.y} color={colorBase} lado={punto.lado} />
                  }

                  <BarraProgreso x={punto.x} y={punto.y} cirugia={cirugia} />
                  {tienePendiente && <BadgePendiente x={punto.x} y={punto.y} />}
                </>
              ) : (
                <>
                  {/* Punto vacío con + */}
                  <circle
                    cx={punto.x} cy={punto.y} r="12"
                    fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 2"
                  />
                  <text
                    x={punto.x} y={punto.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="14" fill="#94a3b8"
                  >
                    +
                  </text>
                </>
              )}

              {/* Label abajo */}
              <text
                x={punto.x}
                y={punto.y + (tieneProtesis ? 28 : 22)}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill={tieneProtesis ? colorBase : "#64748b"}
              >
                {punto.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Leyenda */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 16,
        marginTop: 8, fontSize: 11, color: "#64748b", flexWrap: "wrap",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#dc2626" }} />
          Pendiente
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb" }} />
          Al día
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", border: "1.5px dashed #cbd5e1" }} />
          Sin prótesis
        </span>
      </div>
    </div>
  );
}
