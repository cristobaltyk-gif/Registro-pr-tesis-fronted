import { useState } from "react";
import RegistroAdminForm from "./components/RegistroAdminForm";
import PasoLugar from "./components/PasoLugar";
import PasoCirugia from "./components/PasoCirugia";
import PasoImplante from "./components/PasoImplante";
import PasoFecha from "./components/PasoFecha";
import RegistroEscalaForm from "./components/RegistroEscalaForm";
import RegistroDashboard from "./components/RegistroDashboard";
import "./styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const LOGO_URL =
  "https://lh3.googleusercontent.com/sitesv/APaQ0SSMBWniO2NWVDwGoaCaQjiel3lBKrmNgpaZZY-ZsYzTawYaf-_7Ad-xfeKVyfCqxa7WgzhWPKHtdaCS0jGtFRrcseP-R8KG1LfY2iYuhZeClvWEBljPLh9KANIClyKSsiSJH8_of4LPUOJUl7cWNwB2HKR7RVH_xB_h9BG-8Nr9jnorb-q2gId2=w300";

const ProthesisIcon = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <rect x="24" y="4" width="24" height="28" rx="8" fill="#0f172a" opacity="0.12" />
    <rect x="28" y="4" width="16" height="28" rx="6" fill="#0f172a" opacity="0.25" />
    <rect x="30" y="8" width="12" height="20" rx="4" fill="#0f172a" opacity="0.45" />
    <rect x="22" y="30" width="28" height="10" rx="4" fill="#0f172a" opacity="0.6" />
    <ellipse cx="36" cy="35" rx="13" ry="6" fill="#0f172a" opacity="0.18" />
    <rect x="26" y="40" width="20" height="28" rx="6" fill="#0f172a" opacity="0.12" />
    <rect x="29" y="40" width="14" height="28" rx="5" fill="#0f172a" opacity="0.25" />
    <rect x="31" y="44" width="10" height="20" rx="3" fill="#0f172a" opacity="0.45" />
  </svg>
);

const ESQUEMAS_PROTESIS = {
  cadera: { revision: 6, primaria: 10 },
  rodilla: { revision: 6, primaria: 10 },
  hombro: { revision: 5, primaria: 8 },
  tobillo: { revision: 4, primaria: 7 },
};

export default function App() {
  const [paso, setPaso] = useState("inicio");
  const [token, setToken] = useState(null);
  const [datos, setDatos] = useState({});
  const [cirugiaId, setCirugiaId] = useState(null);
  const [periodo, setPeriodo] = useState("postop");
  const [cirugias, setCirugias] = useState([]);
  const [esquema, setEsquema] = useState(null);

  function handleSalir() {
    setToken(null);
    setDatos({});
    setCirugiaId(null);
    setPeriodo("postop");
    setCirugias([]);
    setEsquema(null);
    setPaso("inicio");
  }

  function mergeDatos(d) {
    setDatos((prev) => ({ ...prev, ...d }));
  }

  async function cargarCirugias(t) {
    const tk = t || token;
    if (!tk) {
      setCirugias([]);
      return [];
    }

    try {
      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: { Authorization: `Bearer ${tk}` },
      });

      const data = res.ok ? await res.json() : [];
      const lista = Array.isArray(data) ? data : data?.cirugias || [];
      setCirugias(lista);
      return lista;
    } catch (e) {
      console.error("Error cargando cirugías:", e);
      setCirugias([]);
      return [];
    }
  }

  function getSegmentoDesdeDatos(c) {
    const segmento =
      c?.segmento ||
      c?.articulacion ||
      c?.tipo_protesis ||
      "";

    const txt = String(segmento).toLowerCase();

    if (txt.includes("cadera")) return "cadera";
    if (txt.includes("rodilla")) return "rodilla";
    if (txt.includes("hombro")) return "hombro";
    if (txt.includes("tobillo")) return "tobillo";

    return c?.segmento || c?.articulacion || "cadera";
  }

  function getTipoDesdeCirugiaExistente(c) {
    if (c?.tipo) return c.tipo;

    const txt = String(c?.tipo_protesis || "").toLowerCase();
    if (txt.includes("revision")) return "revision";
    return "primaria";
  }

  function validarTipoCirugia(nuevaCirugia) {
    const nuevoSegmento = getSegmentoDesdeDatos(nuevaCirugia);

    const existePrimaria = cirugias.find((c) => {
      const segmentoExistente = getSegmentoDesdeDatos(c);
      const tipoExistente = getTipoDesdeCirugiaExistente(c);

      return (
        c.lado === nuevaCirugia.lado &&
        segmentoExistente === nuevoSegmento &&
        tipoExistente === "primaria"
      );
    });

    return existePrimaria ? "revision" : "primaria";
  }

  async function handleAdminComplete(payload, tok) {
    const t = tok || token;
    await cargarCirugias(t);
    setPaso("dashboard");
  }

  function handleFechaComplete(d) {
    const segmento = getSegmentoDesdeDatos(d);
    const tipo = validarTipoCirugia({ ...d, segmento });
    const esquemaProtesis = ESQUEMAS_PROTESIS[segmento] || { revision: 4, primaria: 6 };
    const totalEvaluaciones =
      tipo === "primaria" ? esquemaProtesis.primaria : esquemaProtesis.revision;

    setEsquema({
      tipo,
      total: totalEvaluaciones,
      completadas: 0,
      segmento,
    });

    setCirugiaId(d.id);
    setPeriodo(d.periodo_escala || "postop");
    setPaso("escala");
  }

  const pasoIdx = ["admin", "lugar", "cirugia", "implante", "fecha"].indexOf(paso);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <img src={LOGO_URL} alt="ICA" style={{ height: 40, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
            Registro Nacional de Prótesis
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            Instituto de Cirugía Articular · Chile
          </div>
        </div>
        {token && (
          <button
            className="dp-btn-secondary"
            style={{ width: "auto", padding: "6px 14px", fontSize: 13 }}
            onClick={handleSalir}
          >
            Salir
          </button>
        )}
      </div>

      {pasoIdx >= 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 16px",
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            gap: 0,
            overflowX: "auto",
          }}
        >
          {["admin", "lugar", "cirugia", "implante", "fecha"].map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: i <= pasoIdx ? "#0f172a" : "#e2e8f0",
                  color: i <= pasoIdx ? "#fff" : "#94a3b8",
                }}
              >
                {i < pasoIdx ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  marginRight: 4,
                  whiteSpace: "nowrap",
                  color: i <= pasoIdx ? "#0f172a" : "#94a3b8",
                }}
              >
                {p === "admin" ? "Datos" : p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
              {i < 4 && (
                <div
                  style={{
                    width: 16,
                    height: 2,
                    marginRight: 4,
                    flexShrink: 0,
                    background: i < pasoIdx ? "#0f172a" : "#e2e8f0",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {paso === "inicio" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
          }}
        >
          <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <ProthesisIcon />
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              Registro Nacional
              <br />
              de Prótesis
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Si usted fue operado de una prótesis articular en Chile, registre su cirugía y
              ayúdenos a mejorar la atención en todo el país.
            </p>
            <button
              className="dp-btn-primary"
              style={{ fontSize: 15, padding: "14px 0" }}
              onClick={() => setPaso("admin")}
            >
              Registrar mi prótesis →
            </button>
          </div>
        </div>
      )}

      {paso === "dashboard" && token && (
        <RegistroDashboard
          token={token}
          onNuevaCirugia={() => {
            setDatos({});
            setEsquema(null);
            setCirugiaId(null);
            setPeriodo("postop");
            setPaso("lugar");
          }}
          onCompletarEscala={(id, per) => {
            setCirugiaId(id);
            setPeriodo(per);
            setPaso("escala");
          }}
        />
      )}

      {paso === "admin" && (
        <RegistroAdminForm
          onTokenReady={(t) => setToken(t)}
          token={token}
          onComplete={(payload, tok) => handleAdminComplete(payload, tok)}
        />
      )}

      {paso === "lugar" && token && (
        <PasoLugar
          onComplete={(d) => {
            mergeDatos(d);
            setPaso("cirugia");
          }}
          onBack={() => setPaso("dashboard")}
          inicial={datos}
        />
      )}

      {paso === "cirugia" && token && (
        <PasoCirugia
          onComplete={(d) => {
            mergeDatos(d);
            setPaso("implante");
          }}
          onBack={() => setPaso("lugar")}
          inicial={datos}
        />
      )}

      {paso === "implante" && token && (
        <PasoImplante
          articulacion={datos.articulacion}
          onComplete={(d) => {
            mergeDatos(d);
            setPaso("fecha");
          }}
          onBack={() => setPaso("cirugia")}
          inicial={datos}
        />
      )}

      {paso === "fecha" && token && (
        <PasoFecha
          token={token}
          datos={datos}
          onComplete={handleFechaComplete}
          onBack={() => setPaso("implante")}
        />
      )}

      {paso === "escala" && token && cirugiaId && (
        <RegistroEscalaForm
          token={token}
          cirugiaId={cirugiaId}
          articulacion={datos.articulacion}
          periodo={periodo}
          esquema={esquema}
          onComplete={async () => {
            await cargarCirugias(token);
            setPaso("dashboard");
          }}
        />
      )}

      <div className="dp-footer">
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó, Chile
      </div>
    </div>
  );
                  }
