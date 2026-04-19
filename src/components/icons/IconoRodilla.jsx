// IconoRodilla.jsx
// Vista anterior de prótesis total de rodilla
// lado="derecha" → rodilla derecha del paciente (izquierda de la imagen)
// lado="izquierda" → espejado

export default function IconoRodilla({ x, y, color = "#2563eb", lado = "derecha" }) {
  const flip = lado === "derecha" ? 1 : -1;

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>

      {/* Componente femoral — cóndilos medial y lateral */}
      {/* Cóndilo lateral (derecha del icono para rodilla derecha) */}
      <ellipse cx="7" cy="-12" rx="6" ry="8" fill={color} />
      {/* Cóndilo medial (izquierda) — levemente más grande */}
      <ellipse cx="-7" cy="-12" rx="7" ry="9" fill={color} />
      {/* Unión entre cóndilos */}
      <rect x="-7" y="-16" width="14" height="8" fill={color} />

      {/* Inserto de polietileno */}
      <rect x="-9" y="-4" width="18" height="3" rx="1" fill={color} fillOpacity="0.5" />

      {/* Bandeja tibial */}
      <rect x="-10" y="-1" width="20" height="4" rx="1.5" fill={color} />

      {/* Vástago tibial — baja centrado */}
      <rect x="-3" y="4" width="3" height="0" rx="1.5" fill={color} />

    </g>
  );
}
