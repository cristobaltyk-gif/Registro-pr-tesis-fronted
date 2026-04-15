import React from "react";

/**
 * BodyProtesisMap
 * - Siempre muestra puntos de cadera y rodilla
 * - Si existe prótesis registrada, reemplaza el punto por un dibujo simple de prótesis
 *
 * Props:
 *  - registros: array de cirugías o prótesis registradas
 *      Ejemplo esperado:
 *      [
 *        { tipo_protesis: "cadera", lado: "izquierda" },
 *        { tipo_protesis: "rodilla", lado: "derecha" }
 *      ]
 *  - onSelect: function(zona) => zona seleccionada
 *      zona: "cadera_izquierda" | "cadera_derecha" | "rodilla_izquierda" | "rodilla_derecha"
 *  - selected: zona actualmente seleccionada
 *  - width: ancho opcional
 */

const BODY_WIDTH = 320;
const BODY_HEIGHT = 760;

const ZONAS = {
  cadera_izquierda: { x: 118, y: 356, label: "Cadera izquierda", tipo: "cadera", lado: "izquierda" },
  cadera_derecha:   { x: 202, y: 356, label: "Cadera derecha",   tipo: "cadera", lado: "derecha" },
  rodilla_izquierda:{ x: 132, y: 520, label: "Rodilla izquierda", tipo: "rodilla", lado: "izquierda" },
  rodilla_derecha:  { x: 188, y: 520, label: "Rodilla derecha",   tipo: "rodilla", lado: "derecha" },
};

function normalizarTexto(v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tieneProtesis(registros, tipo, lado) {
  return (registros || []).some((r) => {
    const t = normalizarTexto(r.tipo_protesis || r.tipo || "");
    const l = normalizarTexto(r.lado || "");
    return t.includes(normalizarTexto(tipo)) && l === normalizarTexto(lado);
  });
}

function Punto({ x, y, active, onClick, label }) {
  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={label}
    >
      <circle
        cx={x}
        cy={y}
        r="12"
        fill={active ? "#0f172a" : "#dc2626"}
        stroke="#ffffff"
        strokeWidth="3"
      />
      <circle
        cx={x}
        cy={y}
        r="20"
        fill="transparent"
        stroke={active ? "#0f172a" : "#fca5a5"}
        strokeWidth="2"
        strokeDasharray="4 4"
      />
    </g>
  );
}

function ProtesisCadera({ x, y, active, onClick, label }) {
  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={label}
      transform={`translate(${x - 16}, ${y - 28})`}
    >
      <rect
        x="12"
        y="2"
        width="8"
        height="32"
        rx="3"
        fill={active ? "#0f172a" : "#475569"}
      />
      <circle
        cx="16"
        cy="4"
        r="8"
        fill={active ? "#0f172a" : "#475569"}
      />
      <rect
        x="16"
        y="20"
        width="22"
        height="7"
        rx="3"
        transform="rotate(28 16 20)"
        fill={active ? "#0f172a" : "#475569"}
      />
      <circle
        cx="16"
        cy="18"
        r="22"
        fill="transparent"
        stroke={active ? "#0f172a" : "#94a3b8"}
        strokeWidth="2"
      />
    </g>
  );
}

function ProtesisRodilla({ x, y, active, onClick, label }) {
  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={label}
      transform={`translate(${x - 18}, ${y - 22})`}
    >
      <rect
        x="8"
        y="0"
        width="20"
        height="10"
        rx="5"
        fill={active ? "#0f172a" : "#475569"}
      />
      <rect
        x="8"
        y="30"
        width="20"
        height="10"
        rx="5"
        fill={active ? "#0f172a" : "#475569"}
      />
      <rect
        x="14"
        y="8"
        width="8"
        height="24"
        rx="4"
        fill={active ? "#334155" : "#64748b"}
      />
      <circle
        cx="18"
        cy="20"
        r="22"
        fill="transparent"
        stroke={active ? "#0f172a" : "#94a3b8"}
        strokeWidth="2"
      />
    </g>
  );
}

function BodyBase() {
  return (
    <svg
      viewBox={`0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="0" y="0" width={BODY_WIDTH} height={BODY_HEIGHT} rx="24" fill="#f8f5f2" />

      {/* cabeza */}
      <ellipse cx="160" cy="78" rx="34" ry="42" fill="#efd8c3" stroke="#3f3532" strokeWidth="4" />
      <path d="M126 82 Q118 80 118 94 Q118 108 128 114" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M194 82 Q202 80 202 94 Q202 108 192 114" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />

      {/* cuello */}
      <path d="M144 118 Q145 132 132 142" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M176 118 Q175 132 188 142" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />

      {/* hombros / torso */}
      <path
        d="M95 190
           Q98 158 130 150
           Q150 145 160 145
           Q170 145 190 150
           Q222 158 225 190
           L230 216
           Q232 232 224 250
           L216 282
           Q210 302 205 324
           L198 350
           Q193 372 190 405
           L188 462
           Q187 492 184 536
           L178 650
           Q178 684 168 700
           L164 724"
        fill="none"
        stroke="#3f3532"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M225 190
           Q240 224 252 260
           L270 320
           Q275 338 268 352
           L258 382
           Q252 398 252 420
           L252 470"
        fill="none"
        stroke="#3f3532"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M95 190
           Q80 224 68 260
           L50 320
           Q45 338 52 352
           L62 382
           Q68 398 68 420
           L68 470"
        fill="none"
        stroke="#3f3532"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M92 190
           Q88 230 92 282
           L100 350
           Q104 382 108 405
           L110 462
           Q111 492 114 536
           L120 650
           Q120 684 130 700
           L134 724"
        fill="none"
        stroke="#3f3532"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* clavículas / detalles */}
      <path d="M122 162 Q144 154 154 160" fill="none" stroke="#9a7b6c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M198 162 Q176 154 166 160" fill="none" stroke="#9a7b6c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M144 204 Q160 198 176 204" fill="none" stroke="#b28f7d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="160" cy="256" r="3" fill="#c7a996" />
      <path d="M126 296 Q116 310 116 326" fill="none" stroke="#b28f7d" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M194 296 Q204 310 204 326" fill="none" stroke="#b28f7d" strokeWidth="2.5" strokeLinecap="round" />

      {/* manos */}
      <path d="M68 470 Q62 494 64 520 Q66 538 74 540" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M74 540 Q70 524 78 518 Q82 526 84 540" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M84 540 Q82 516 92 512 Q96 524 98 540" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M252 470 Q258 494 256 520 Q254 538 246 540" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M246 540 Q250 524 242 518 Q238 526 236 540" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M236 540 Q238 516 228 512 Q224 524 222 540" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />

      {/* piernas */}
      <path d="M148 350 L132 500 Q126 540 122 610 L118 688 Q118 710 108 722" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M172 350 L188 500 Q194 540 198 610 L202 688 Q202 710 212 722" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />

      {/* pies */}
      <path d="M102 722 Q110 732 126 730 Q136 730 142 724" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
      <path d="M218 722 Q210 732 194 730 Q184 730 178 724" fill="none" stroke="#3f3532" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function BodyProtesisMap({
  registros = [],
  onSelect,
  selected = null,
  width = 320,
}) {
  const zonas = Object.entries(ZONAS);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: width,
        margin: "0 auto",
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background: "#f8f5f2",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ width: "100%", aspectRatio: `${BODY_WIDTH} / ${BODY_HEIGHT}`, position: "relative" }}>
        <BodyBase />

        <svg
          viewBox={`0 0 ${BODY_WIDTH} ${BODY_HEIGHT}`}
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
        >
          {zonas.map(([key, zona]) => {
            const activa = selected === key;
            const onClick = () => onSelect?.(key);
            const tiene = tieneProtesis(registros, zona.tipo, zona.lado);

            if (tiene && zona.tipo === "cadera") {
              return (
                <ProtesisCadera
                  key={key}
                  x={zona.x}
                  y={zona.y}
                  active={activa}
                  onClick={onClick}
                  label={zona.label}
                />
              );
            }

            if (tiene && zona.tipo === "rodilla") {
              return (
                <ProtesisRodilla
                  key={key}
                  x={zona.x}
                  y={zona.y}
                  active={activa}
                  onClick={onClick}
                  label={zona.label}
                />
              );
            }

            return (
              <Punto
                key={key}
                x={zona.x}
                y={zona.y}
                active={activa}
                onClick={onClick}
                label={zona.label}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
