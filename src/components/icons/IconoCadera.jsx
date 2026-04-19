// IconoCadera.jsx
// Vista anterior de prótesis total de cadera
// lado="derecha" → cadera derecha del paciente (izquierda de la imagen)
// lado="izquierda" → cadera izquierda del paciente (derecha de la imagen)

export default function IconoCadera({ x, y, color = "#2563eb", lado = "derecha" }) {
  // Orientación natural = cadera IZQUIERDA del paciente
  // Cadera DERECHA → scale(-1,1) espeja
  const flip = lado === "izquierda" ? 1 : -1;

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>

      {/* Acetábulo — copa pélvica, lateral-superior (izquierda del icono) */}
      <ellipse
        cx="-10" cy="-12"
        rx="11" ry="11"
        fill="none"
        stroke={color} strokeWidth="2"
      />

      {/* Cabeza femoral — esfera que encaja en el acetábulo */}
      <circle cx="-10" cy="-12" r="8" fill={color} />

      {/* Cuello femoral — acortado */}
      <path
        d="M -4,-4 L 0,0 L 7,7 L 4,10 L -3,3 L -6,0 Z"
        fill={color}
      />

      {/* Vástago femoral — lado medial (derecha del icono) */}
      <rect x="6" y="8" width="8" height="20" rx="2" fill={color} />

    </g>
  );
}
