import React from 'react';

// Coordenadas aproximadas (x, y en un viewBox de 0 0 100 100) para los puntos
// Ajusta estas coordenadas según tu SVG real.
const PUNTOS_ARTICULACIONES = [
  { id: "hombro-derecho", x: 35, y: 15 },
  { id: "hombro-izquierdo", x: 65, y: 15 },
  { id: "cadera-derecho", x: 38, y: 45 }, // API usa 'lado', ajusta ids
  { id: "cadera-izquierdo", x: 62, y: 45 },
  { id: "rodilla-derecho", x: 38, y: 70 },
  { id: "rodilla-izquierdo", x: 62, y: 70 },
];

export default function MapaCuerpoInteractivo({ mapaProtesis, onSelectSegmento, segmentoSeleccionado }) {
  return (
    <div className="contenedor-svg-mapa">
      {/* Aquí debes pegar el código de tu SVG real (la silueta).
         Lo importante es el viewBox y que los puntos se dibujen encima.
      */}
      <svg viewBox="0 0 400 600" className="svg-cuerpo">
        {/* --- Pegar aquí los paths de la silueta del cuerpo --- */}
        <path d="..." fill="#f3e5dc" stroke="#444" strokeWidth="1" /> 
        {/* ----------------------------------------------------- */}

        {/* Dibujamos los puntos interactivos sobre las articulaciones */}
        {PUNTOS_ARTICULACIONES.map(punto => {
          const tieneProtesis = !!mapaProtesis[punto.id];
          const estaSeleccionado = punto.id === segmentoSeleccionado;

          // Clases CSS dinámicas para el estilo del punto
          let clasePunto = "punto-articulacion";
          if (tieneProtesis) clasePunto += " con-protesis";
          if (estaSeleccionado) clasePunto += " seleccionado";

          return (
            <g 
              key={punto.id} 
              className={clasePunto}
              onClick={() => onSelectSegmento(punto.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Círculo invisible más grande para facilitar el clic */}
              <circle cx={punto.x} cy={punto.y} r="15" fill="transparent" />
              
              {/* El punto visible */}
              <circle 
                cx={punto.x} 
                cy={punto.y} 
                r={estaSeleccionado ? "8" : "6"} 
                className="punto-visual"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
