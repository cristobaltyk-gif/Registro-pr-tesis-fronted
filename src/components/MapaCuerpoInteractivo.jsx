import React from "react";
import cuerpoBase from "../assets/cuerpoFrontal.png";

const PERIODOS_ORDEN = ["preop", "3m", "6m", "1a", "2a"];

const PUNTOS_ARTICULACIONES = [
  { id: "cadera-derecha",    x: 155, y: 305, label: "Cadera D" },
  { id: "cadera-izquierda",  x: 245, y: 305, label: "Cadera I" },
  { id: "rodilla-derecha",   x: 160, y: 468, label: "Rodilla D" },
  { id: "rodilla-izquierda", x: 240, y: 468, label: "Rodilla I" },
];

// Icono prótesis de cadera (SVG path simplificado)
function IconoCadera({ x, y, color = "#2563eb" }) {
  return (
    <g transform={`translate(${x - 9}, ${y - 14})`}>
      <rect x="5"  y="0"  width="8"  height="12" rx="3" fill={color} />
      <rect x="3"  y="10" width="12" height="4"  rx="2" fill={color} />
      <rect x="6"  y="13" width="6"  height="10" rx="2" fill={color} />
    </g>
  );
}

// Icono prótesis de rodilla
function IconoRodilla({ x, y, color = "#2563eb" }) {
  return (
    <g transform={`translate(${x - 9}, ${y - 13})`}>
      <rect x="2"  y="0"  width="14" height="5"  rx="2" fill={color} />
      <rect x="5"  y="4"  width="8"  height="8"  rx="1" fill={color} opacity="0.8" />
      <rect x="2"  y="11" width="14" height="5"  rx="2" fill={color} />
    </g>
  );
}

// Barra de progreso escalas sobre el punto
function BarraProgreso({ x, y, cirugia }) {
  const ep = cirugia?.escalas_programadas || {};
  const completados = PERIODOS_ORDEN.filter(p => ep[p]?.completada).length;
  const total = PERIODOS_ORDEN.length;
  const pct = total > 0 ? completados / total : 0;

  const barW = 40;
  const barH = 5;
  const barX = x - barW / 2;
  const barY = y - 34;

  return (
    <g>
      {/* fondo barra */}
      <rect x={barX} y={barY} width={barW} height={barH} rx="2.5" fill="#e2e8f0" />
      {/* progreso */}
      <rect x={barX} y={barY} width={barW * pct} height={barH} rx="2.5" fill="#16a34a" />
      {/* texto */}
      <text x={x} y={barY - 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#16a34a">
        {completados}/{total}
      </text>
    </g>
  );
}

export default function MapaCuerpoInteractivo({ mapaProtesis, onSelectSegmento, segmentoSeleccionado }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 400, margin: "0 auto" }}>
      <svg viewBox="0 0 400 650" style={{ width: "100%", height: "auto" }}>
        <image href={cuerpoBase} x="0" y="0" width="400" height="650" />

        {PUNTOS_ARTICULACIONES.map(punto => {
          const cirugia      = mapaProtesis[punto.id] || null;
          const tieneProtesis = !!cirugia;
          const esSeleccionado = segmentoSeleccionado === punto.id;
          const esCadera      = punto.id.startsWith("cadera");

          const colorBase    = tieneProtesis ? "#2563eb" : "#94a3b8";
          const colorActivo  = tieneProtesis ? "#1d4ed8" : "#475569";
          const colorFinal   = esSeleccionado ? colorActivo : colorBase;

          return (
            <g
              key={punto.id}
              onClick={() => onSelectSegmento(punto.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Área clic grande */}
              <circle cx={punto.x} cy={punto.y} r="28" fill="transparent" />

              {/* Halo selección */}
              {esSeleccionado && (
                <circle cx={punto.x} cy={punto.y} r="22" fill="none"
                  stroke={colorFinal} strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
              )}

              {tieneProtesis ? (
                <>
                  {/* Fondo círculo prótesis */}
                  <circle cx={punto.x} cy={punto.y} r="16"
                    fill={esSeleccionado ? "#dbeafe" : "#eff6ff"}
                    stroke={colorFinal} strokeWidth="1.5" />

                  {/* Icono prótesis */}
                  {esCadera
                    ? <IconoCadera  x={punto.x} y={punto.y} color={colorFinal} />
                    : <IconoRodilla x={punto.x} y={punto.y} color={colorFinal} />
                  }

                  {/* Barra progreso escalas */}
                  <BarraProgreso x={punto.x} y={punto.y} cirugia={cirugia} />
                </>
              ) : (
                <>
                  {/* Punto vacío — invita a registrar */}
                  <circle cx={punto.x} cy={punto.y} r="12"
                    fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"
                    strokeDasharray={esSeleccionado ? "0" : "3 2"} />
                  <text x={punto.x} y={punto.y + 1} textAnchor="middle"
                    dominantBaseline="middle" fontSize="14" fill="#94a3b8">
                    +
                  </text>
                </>
              )}

              {/* Label */}
              <text
                x={punto.x}
                y={punto.y + (tieneProtesis ? 26 : 22)}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill={esSeleccionado ? colorFinal : "#64748b"}
              >
                {punto.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
