export default function IconoCadera({ x, y, color = "#2563eb", lado = "derecha" }) {
  const flip = lado === "izquierda" ? 1 : -1;
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>
      {/* Acetábulo — más pequeño, solo borde */}
      <ellipse cx="-7" cy="-9" rx="6" ry="6" fill="none" stroke={color} strokeWidth="1.5" />
      {/* Cabeza femoral */}
      <circle cx="-7" cy="-9" r="5" fill={color} />
      {/* Cuello MUY corto */}
      <path d="M -3,-6 L 0,-3 L 2,-1 L 0,1 L -3,-1 L -5,-3 Z" fill={color} />
      {/* Vástago */}
      <rect x="1" y="0" width="5" height="13" rx="2" fill={color} />
    </g>
  );
}
