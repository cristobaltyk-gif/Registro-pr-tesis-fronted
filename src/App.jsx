import { useState } from "react";
import RegistroAdminForm   from "./components/RegistroAdminForm";
import PasoLugar           from "./components/PasoLugar";
import PasoCirugia         from "./components/PasoCirugia";
import PasoImplante        from "./components/PasoImplante";
import PasoFecha           from "./components/PasoFecha";
import RegistroEscalaForm  from "./components/RegistroEscalaForm";
import RegistroDashboard   from "./components/RegistroDashboard";
import "./styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/APaQ0SSMBWniO2NWVDwGoaCaQjiel3lBKrmNgpaZZY-ZsYzTawYaf-_7Ad-xfeKVyfCqxa7WgzhWPKHtdaCS0jGtFRrcseP-R8KG1LfY2iYuhZeClvWEBljPLh9KANIClyKSsiSJH8_of4LPUOJUl7cWNwB2HKR7RVH_xB_h9BG-8Nr9jnorb-q2gId2=w300";

const ProthesisIcon = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <rect x="24" y="4" width="24" height="28" rx="8" fill="#0f172a" opacity="0.12"/>
    <rect x="28" y="4" width="16" height="28" rx="6" fill="#0f172a" opacity="0.25"/>
    <rect x="30" y="8" width="12" height="20" rx="4" fill="#0f172a" opacity="0.45"/>
    <rect x="22" y="30" width="28" height="10" rx="4" fill="#0f172a" opacity="0.6"/>
    <ellipse cx="36" cy="35" rx="13" ry="6" fill="#0f172a" opacity="0.18"/>
    <rect x="26" y="40" width="20" height="28" rx="6" fill="#0f172a" opacity="0.12"/>
    <rect x="29" y="40" width="14" height="28" rx="5" fill="#0f172a" opacity="0.25"/>
    <rect x="31" y="44" width="10" height="20" rx="3" fill="#0f172a" opacity="0.45"/>
  </svg>
);

// SOLO lo que tú usabas
const ESQUEMAS_PROTESIS = {
  cadera: { revision: 6, primaria: 10 },
  rodilla: { revision: 6, primaria: 10 }
};

export default function App() {
  const [paso,      setPaso]      = useState("inicio");
  const [token,     setToken]     = useState(null);
  const [datos,     setDatos]     = useState({});
  const [cirugiaId, setCirugiaId] = useState(null);
  const [periodo,   setPeriodo]   = useState("postop");
  const [cirugias,  setCirugias]  = useState([]);
  const [esquema,   setEsquema]   = useState(null);

  function handleSalir() {
    setToken(null);
    setDatos({});
    setCirugiaId(null);
    setPaso("inicio");
  }

  function mergeDatos(d) {
    setDatos(prev => ({ ...prev, ...d }));
  }

  function validarTipoCirugia(nuevaCirugia) {
    const existePrimaria = cirugias.find(c =>
      c.lado === nuevaCirugia.lado &&
      c.segmento === nuevaCirugia.segmento &&
      c.tipo === "primaria"
    );
    return existePrimaria ? "revision" : "primaria";
  }

  async function handleAdminComplete(payload, tok) {
    const t = tok || token;

    try {
      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: { Authorization: `Bearer ${t}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCirugias(Array.isArray(data) ? data : (data.cirugias || []));
      }

      setPaso("dashboard"); // 👈 CLAVE
    } catch (e) {
      console.error(e);
      setPaso("dashboard");
    }
  }

  function handleFechaComplete(d) {
    const tipo = validarTipoCirugia(d);
    const esquemaProtesis = ESQUEMAS_PROTESIS[d.segmento] || { revision: 4, primaria: 6 };
    const total = tipo === "primaria" ? esquemaProtesis.primaria : esquemaProtesis.revision;

    setEsquema({
      tipo,
      total,
      completadas: 0,
      segmento: d.segmento
    });

    setCirugiaId(d.id);
    setPeriodo(d.periodo_escala || "postop");
    setPaso("escala");
  }

  const pasoIdx = ["admin", "lugar", "cirugia", "implante", "fecha"].indexOf(paso);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <img src={LOGO_URL} alt="ICA" style={{ height: 40 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800 }}>Registro Nacional de Prótesis</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Instituto de Cirugía Articular</div>
        </div>
        {token && <button onClick={handleSalir}>Salir</button>}
      </div>

      {/* INICIO */}
      {paso === "inicio" && (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <ProthesisIcon />
          <h1>Registro Nacional de Prótesis</h1>
          <button onClick={() => setPaso("admin")}>Registrar</button>
        </div>
      )}

      {/* DASHBOARD (PRIMERO) */}
      {paso === "dashboard" && token && (
        <RegistroDashboard
          token={token}
          onNuevaCirugia={() => {
            setDatos({});
            setPaso("lugar");
          }}
          onCompletarEscala={(id, per) => {
            setCirugiaId(id);
            setPeriodo(per);
            setPaso("escala");
          }}
        />
      )}

      {/* LOGIN */}
      {paso === "admin" && (
        <RegistroAdminForm
          onTokenReady={t => setToken(t)}
          token={token}
          onComplete={(payload, tok) => handleAdminComplete(payload, tok)}
        />
      )}

      {/* FLUJO */}
      {paso === "lugar" && token && (
        <PasoLugar
          onComplete={d => { mergeDatos(d); setPaso("cirugia"); }}
          onBack={() => setPaso("dashboard")}
          inicial={datos}
        />
      )}

      {paso === "cirugia" && token && (
        <PasoCirugia
          onComplete={d => { mergeDatos(d); setPaso("implante"); }}
          onBack={() => setPaso("lugar")}
          inicial={datos}
        />
      )}

      {paso === "implante" && token && (
        <PasoImplante
          articulacion={datos.articulacion}
          onComplete={d => { mergeDatos(d); setPaso("fecha"); }}
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
          onComplete={() => setPaso("dashboard")}
        />
      )}

    </div>
  );
}
