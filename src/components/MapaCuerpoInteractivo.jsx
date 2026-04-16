import React from 'react';
import cuerpoBase from "../assets/cuerpoFrontal.png"; // Asegúrate de que esta ruta sea correcta

// COORDENADAS CALIBRADAS PARA UNA SILUETA DE 400x650
// Ajusta 'x' e 'y' si los puntos quedan movidos en tu imagen real.
const PUNTOS_ARTICULACIONES = [
  // Caderas: Justo donde empieza la pierna en la silueta
  { id: "cadera-derecha", x: 165, y: 320, label: "Cadera D" },
  { id: "cadera-izquierda", x: 235, y: 320, label: "Cadera I" },
  // Rodillas: En el centro de la articulación de la rodilla
  { id: "rodilla-derecha", x: 170, y: 485, label: "Rodilla D" },
  { id: "rodilla-izquierda", x: 230, y: 485, label: "Rodilla I" },
];

export default function MapaCuerpoInteractivo({ mapaProtesis, onSelectSegmento, segmentoSeleccionado }) {
  return (
    <div className="contenedor-svg-mapa" style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      {/* Mantenemos el viewBox en 400x650. 
         Si el SVG real tiene otro tamaño (ej: 0 0 100 100), debes cambiar el viewBox Y las coordenadas.
      */}
      <svg viewBox="0 0 400 650" className="svg-cuerpo" style={{ width: '100%', height: 'auto' }}>
        {/* Renderizamos tu imagen PNG dentro del SVG */}
        <image href={cuerpoBase} x="0" y="0" width="400" height="650" />

        {PUNTOS_ARTICULACIONES.map(punto => {
          const tieneProtesis = !!mapaProtesis[punto.id];
          const esSeleccionado = segmentoSeleccionado === punto.id;

          return (
            <g 
              key={punto.id} 
              className={`g-punto ${tieneProtesis ? 'con-protesis' : ''} ${esSeleccionado ? 'seleccionado' : ''}`}
              onClick={() => onSelectSegmento(punto.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Círculo invisible más grande para facilitar el clic en móvil */}
              <circle cx={punto.x} cy={punto.y} r="25" fill="transparent" />
              
              {/* Punto visual exterior (borde/sombra) */}
              <circle 
                cx={punto.x} 
                cy={punto.y} 
                r={esSeleccionado ? "12" : "10"} 
                className="punto-visual-exterior"
              />

              {/* Punto central (El color real) */}
              <circle 
                cx={punto.x} 
                cy={punto.y} 
                r="5" 
                className="punto-visual-interior"
              />

              {/* Etiqueta de texto para claridad */}
              <text 
                x={punto.x} 
                y={punto.y + 25} 
                textAnchor="middle" 
                fontSize="10" 
                fontWeight="600"
                fill={esSeleccionado ? "#2563eb" : "#475569"}
                className="punto-label"
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
