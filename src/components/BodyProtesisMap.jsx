import cuerpoFrontal from "../assets/cuerpoFrontal.png";

const ZONAS = {
  cadera_izquierda: { top: "33%", left: "37%", tipo: "cadera", lado: "izquierda", label: "Cadera izquierda" },
  cadera_derecha:   { top: "33%", left: "63%", tipo: "cadera", lado: "derecha",   label: "Cadera derecha" },
  rodilla_izquierda:{ top: "55%", left: "41%", tipo: "rodilla", lado: "izquierda", label: "Rodilla izquierda" },
  rodilla_derecha:  { top: "55%", left: "59%", tipo: "rodilla", lado: "derecha",   label: "Rodilla derecha" },
};

function normalizar(v) {
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tieneProtesisUnica(registros, tipo, lado) {
  return (registros || []).some((r) => {
    const t = normalizar(r.tipo_protesis || r.tipo || "");
    const l = normalizar(r.lado || "");
    return t.includes(normalizar(tipo)) && l === normalizar(lado);
  });
}

function PuntoEstado() {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#dc2626",
        border: "3px solid white",
        boxShadow: "0 0 0 4px rgba(220,38,38,0.18)",
      }}
    />
  );
}

function ProtesisCaderaIcon() {
  return (
    <div style={{ position: "relative", width: 22, height: 34 }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 6,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#475569",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 9,
          width: 4,
          height: 22,
          borderRadius: 4,
          background: "#475569",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 8,
          width: 12,
          height: 4,
          borderRadius: 4,
          background: "#64748b",
          transform: "rotate(28deg)",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}

function ProtesisRodillaIcon() {
  return (
    <div style={{ position: "relative", width: 24, height: 30 }}>
      <div
        style={{
          position: "absolute",
          top: 2,
          left: 4,
          width: 16,
          height: 7,
          borderRadius: 6,
          background: "#475569",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 11,
          left: 9,
          width: 6,
          height: 8,
          borderRadius: 4,
          background: "#64748b",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 2,
          left: 4,
          width: 16,
          height: 7,
          borderRadius: 6,
          background: "#475569",
        }}
      />
    </div>
  );
}

export default function BodyProtesisMap({ registros = [] }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 320,
        margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        background: "#f8f5f2",
        border: "1px solid #e2e8f0",
      }}
    >
      <img
        src={cuerpoFrontal}
        alt="Mapa corporal"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />

      {Object.entries(ZONAS).map(([key, z]) => {
        const activa = tieneProtesisUnica(registros, z.tipo, z.lado);

        return (
          <div
            key={key}
            title={z.label}
            style={{
              position: "absolute",
              top: z.top,
              left: z.left,
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
            }}
          >
            {activa ? (
              z.tipo === "cadera" ? <ProtesisCaderaIcon /> : <ProtesisRodillaIcon />
            ) : (
              <PuntoEstado />
            )}
          </div>
        );
      })}
    </div>
  );
}
