import React from "react";
import cuerpoBase from "../assets/cuerpoFrontal.png";
import { calcularEscalaPendiente } from "../utils/calcularEscalaPendiente";

const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

const PUNTOS_ARTICULACIONES = [
  { id: "cadera-derecha",    x: 160, y: 395, label: "Cadera D" },
  { id: "cadera-izquierda",  x: 240, y: 395, label: "Cadera I" },
  { id: "rodilla-derecha",   x: 165, y: 535, label: "Rodilla D" },
  { id: "rodilla-izquierda", x: 235, y: 535, label: "Rodilla I" },
];

function IconoCadera({ x, y, color = "#2563eb" }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M -8,-10 A 8,8 0 0 1 8,-10 L 6,-8 A 6,6 0 0 0 -6,-8 Z" fill={color} />
      <circle cx="0" cy="-5" r="4.5" fill={color} />
      <path d="M -1,-2 L 2,2 L 4,2 L 1,-2 Z" fill={color} />
      <path d="M 1,2 L 5,2 L 3.5,12 L 2.5,12 Z" fill={color} />
    </g>
  );
}

function IconoRodilla({ x, y, color = "#2563eb" }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d="M -7,-10 Q -8,-4 -5,-2 L 5,-2 Q 8,-4 7,-10 Q 5,-11 3,-10 Q 0,-9 -3,-10 Q -5,-11 -7,-10 Z"
        fill={color}
      />
      <rect x="-6" y="-1.5" width="12" height="1.5" fill={color} opacity="0.5" />
      <rect x="-7" y="0.5" width="14" height="3" rx="0.5" fill={color} />
      <path d="M -2,3.5 L 2,3.5 L 1.5,11 L -1.5,11 Z" fill={color} />
    </g>
  );
}

function BarraProgreso({ x, y, cirugia }) {
  const ep = cirugia?.escalas_programadas || {};
  const completados = PERIODOS_ORDEN.filter(p => ep[p]?.completada).length;
  const total = PERIODOS_ORDEN.length;
  const pct = total > 0 ? completados / total : 0;

  const barW = 40;
  const barH = 5;
  const barX = x - barW / 2;
  const barY = y - 32;

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
      <text x={x + 12} y={y - 9} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">
        !
      </text>
    </g>
  );
}

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
              <circle cx={punto.x} cy={punto.y} r="28" fill="transparent" />

              {tieneProtesis ? (
                <>
                  {tienePendiente && (
                    <circle cx={punto.x} cy={punto.y} r="22" fill="none"
                      stroke={colorBase} strokeWidth="2" strokeDasharray="4 3" opacity="0.5">
                      <animate attributeName="r" values="22;26;22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  <circle cx={punto.x} cy={punto.y} r="17"
                    fill={tienePendiente ? "#fef2f2" : "#eff6ff"}
                    stroke={colorBase} strokeWidth="1.5" />

                  {esCadera
                    ? <IconoCadera  x={punto.x} y={punto.y} color={colorBase} />
                    : <IconoRodilla x={punto.x} y={punto.y} color={colorBase} />
                  }

                  <BarraProgreso x={punto.x} y={punto.y} cirugia={cirugia} />
                  {tienePendiente && <BadgePendiente x={punto.x} y={punto.y} />}
                </>
              ) : (
                <>
                  <circle cx={punto.x} cy={punto.y} r="12"
                    fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x={punto.x} y={punto.y + 1} textAnchor="middle"
                    dominantBaseline="middle" fontSize="14" fill="#94a3b8">
                    +
                  </text>
                </>
              )}

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

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginTop: 8,
        fontSize: 11,
        color: "#64748b",
        flexWrap: "wrap",
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
