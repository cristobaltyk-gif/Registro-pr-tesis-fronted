import React from 'react';
// Import directo de tu imagen en assets
import cuerpoBase from "../assets/cuerpoFrontal.png";

const PUNTOS_ARTICULACIONES = [
  { id: "cadera-derecha", x: 165, y: 320, label: "Cadera Derecha" },
  { id: "cadera-izquierda", x: 235, y: 320, label: "Cadera Izquierda" },
  { id: "rodilla-derecha", x: 170, y: 485, label: "Rodilla Derecha" },
  { id: "rodilla-izquierda", x: 230, y: 485, label: "Rodilla Izquierda" },
];

export default function MapaCuerpoInteractivo({ mapaProtesis, onSelectSegmento, segmentoSeleccionado }) {
  return (
    <div className="contenedor-svg-mapa" style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <svg viewBox="0 0 400 650" className="svg-cuerpo" style={{ width: '100%', height: 'auto' }}>
        {/* Render de la imagen base frontal */}
        <image href={cuerpoBase} x="0" y="0" width="400" height="650" />

        {PUNTOS_ARTICULACIONES.map(punto => {
          const tieneData = !!mapaProtesis[punto.id];
          const esSeleccionado = segmentoSeleccionado === punto.id;

          return (
            <g 
              key={punto.id} 
              onClick={() => onSelectSegmento(punto.id)} 
              style={{ cursor: 'pointer' }}
            >
              {/* Área de impacto para el toque en móvil */}
              <circle cx={punto.x} cy={punto.y} r="25" fill="transparent" />
              
              {/* Círculo de estado (Verde si hay prótesis, Azul si está seleccionado) */}
              <circle 
                cx={punto.x} 
                cy={punto.y} 
                r={esSeleccionado ? "12" : "10"} 
                fill={esSeleccionado ? "#2563eb" : (tieneData ? "#22c55e" : "#94a3b8")} 
                stroke="#ffffff" 
                strokeWidth="2"
                style={{ transition: 'all 0.2s ease-in-out' }}
              />

              {/* Punto central de precisión */}
              <circle cx={punto.x} cy={punto.y} r="4" fill="#ffffff" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
