// IconoCadera.jsx
// Vista anterior de prótesis total de cadera
// lado="derecha" → cadera derecha del paciente (izquierda de la imagen)
// lado="izquierda" → cadera izquierda del paciente (derecha de la imagen)

export default function IconoCadera({ x, y, color = "#2563eb", lado = "derecha" }) {
  // Para cadera DERECHA del paciente:
  //   - Acetábulo + cabeza femoral: lado IZQUIERDO del icono (lateral, trocánter mayor)
  //   - Cuello: oblicuo de izq-arriba hacia der-abajo
  //   - Vástago: lado DERECHO del icono (medial = apunta al centro del cuerpo) ✓
  //
  // Para cadera IZQUIERDA: scale(-1,1) espeja todo →
  //   - Cabeza queda a la DERECHA (lateral)
  //   - Vástago queda a la IZQUIERDA (medial = también apunta al centro) ✓

  const flip = lado === "derecha" ? 1 : -1;

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>

      {/* Acetábulo — copa pélvica, lateral-superior (izquierda del icono) */}
      <ellipse
        cx="-10" cy="-12"
        rx="11" ry="11"
        fill={color} fillOpacity="0.2"
        stroke={color} strokeWidth="2"
      />

      {/* Cabeza femoral — esfera que encaja en el acetábulo */}
      <circle cx="-10" cy="-12" r="8" fill={color} />

      {/* Cuello femoral — oblicuo de lateral-superior (izq) a medial-inferior (der) */}
      <path
        d="M -4,-6 L 0,-2 L 10,10 L 6,14 L -4,4 L -8,0 Z"
        fill={color}
      />

      {/* Vástago femoral — baja vertical por el lado medial (derecha del icono) */}
      <rect x="6" y="12" width="8" height="20" rx="2" fill={color} />

    </g>
  );
}
