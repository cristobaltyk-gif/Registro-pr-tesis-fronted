export default function IconoCadera({ x, y, color = "#2563eb", lado = "derecha" }) {
  const flip = lado === "izquierda" ? 1 : -1;
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>
      {/* Acetábulo — solo borde, sin relleno */}
      <ellipse cx="-8" cy="-10" rx="9" ry="9" fill="none" stroke={color} strokeWidth="1.5" />
      {/* Cabeza femoral */}
      <circle cx="-8" cy="-10" r="7" fill={color} />
      {/* Cuello corto */}
      <path d="M -3,-5 L 0,-2 L 5,3 L 3,5 L -2,0 L -4,-2 Z" fill={color} />
      {/* Vástago */}
      <rect x="4" y="4" width="6" height="14" rx="2" fill={color} />
    </g>
  );
}
