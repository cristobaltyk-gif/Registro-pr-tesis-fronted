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
    <rect x="24" y="4"  width="24" height="28" rx="8"  fill="#0f172a" opacity="0.12"/>
    <rect x="28" y="4"  width="16" height="28" rx="6"  fill="#0f172a" opacity="0.25"/>
    <rect x="30" y="8"  width="12" height="20" rx="4"  fill="#0f172a" opacity="0.45"/>
    <rect x="22" y="30" width="28" height="10" rx="4"  fill="#0f172a" opacity="0.6"/>
    <ellipse cx="36" cy="35" rx="13" ry="6"            fill="#0f172a" opacity="0.18"/>
    <rect x="26" y="40" width="20" height="28" rx="6"  fill="#0f172a" opacity="0.12"/>
    <rect x="29" y="40" width="14" height="28" rx="5"  fill="#0f172a" opacity="0.25"/>
    <rect x="31" y="44" width="10" height="20" rx="3"  fill="#0f172a" opacity="0.45"/>
  </svg>
);

const BARRA = ["admin", "lugar", "cirugia", "implante", "fecha"];
const BARRA_LABEL = {
  admin:    "Mis datos",
  lugar:    "Centro",
  cirugia:  "Cirugía",
  implante: "Implante",
  fecha:    "Fecha",
};

export default function App() {
  const [paso,      setPaso]      = useState("inicio");
  const [token,     setToken]     = useState(null);
  const [datos,     setDatos]     = useState({});
  const [cirugiaId, setCirugiaId] = useState(null);
  const [periodo,   setPeriodo]   = useState("postop");

  function handleSalir() {
    setToken(null); setDatos({}); setCirugiaId(null); setPaso("inicio");
  }

  function mergeDatos(d) {
    setDatos(prev => ({ ...prev, ...d }));
  }

  async function handleAdminComplete(payload, tok) {
    const t = tok || token;
    try {
      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: { "Authorization": `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cirugias?.length > 0) {
          setPaso("dashboard");
          return;
        }
      }
    } catch {}
    setPaso("lugar");
  }

  const pasoIdx = BARRA.indexOf(paso);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <img src={LOGO_URL} alt="ICA" style={{ height: 40, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Registro Nacional de Prótesis</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Instituto de Cirugía Articular · Chile</div>
        </div>
        {token && (
          <button className="dp-btn-secondary" style={{ width: "auto", padding: "6px 14px", fontSize: 13 }}
            onClick={handleSalir}>Salir</button>
        )}
      </div>

      {/* Barra pasos — solo en flujo de registro nuevo */}
      {pasoIdx >= 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0", gap: 0, overflowX: "auto" }}>
          {BARRA.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: i <= pasoIdx ? "#0f172a" : "#e2e8f0",
                color:      i <= pasoIdx ? "#fff"    : "#94a3b8",
              }}>
                {i < pasoIdx ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, marginRight: 4, whiteSpace: "nowrap", color: i <= pasoIdx ? "#0f172a" : "#94a3b8" }}>
                {BARRA_LABEL[p]}
              </span>
              {i < BARRA.length - 1 && (
                <div style={{ width: 16, height: 2, marginRight: 4, flexShrink: 0, background: i < pasoIdx ? "#0f172a" : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* INICIO */}
      {paso === "inicio" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <ProthesisIcon />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12, lineHeight: 1.2 }}>
              Registro Nacional<br />de Prótesis
            </h1>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>
              Si usted fue operado de una prótesis articular en Chile, registre su cirugía y ayúdenos a mejorar la atención en todo el país.
            </p>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 28, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>El registro incluye:</div>
              {["🏥 Centro donde fue operado", "🦴 Tipo de cirugía y articulación", "🔩 Marca e implante utilizado", "📋 Evaluaciones de seguimiento"].map(item => (
                <div key={item} style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>{item}</div>
              ))}
            </div>
            <button className="dp-btn-primary" style={{ fontSize: 15, padding: "14px 0" }}
              onClick={() => setPaso("admin")}>
              Registrar mi prótesis →
            </button>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 14, lineHeight: 1.5 }}>
              Su información es confidencial y contribuye al registro nacional de calidad en cirugía articular.
            </p>
          </div>
        </div>
      )}

      {paso === "admin" && (
        <RegistroAdminForm
          onTokenReady={t => setToken(t)}
          token={token}
          onComplete={(payload, tok) => handleAdminComplete(payload, tok)}
        />
      )}

      {paso === "lugar" && token && (
        <PasoLugar
          onComplete={d => { mergeDatos(d); setPaso("cirugia"); }}
          onBack={() => setPaso("admin")}
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
          onComplete={d => { setCirugiaId(d.id); setPeriodo(d.periodo_escala || "postop"); setPaso("escala"); }}
          onBack={() => setPaso("implante")}
        />
      )}

      {paso === "escala" && token && cirugiaId && (
        <RegistroEscalaForm
          token={token}
          cirugiaId={cirugiaId}
          articulacion={datos.articulacion}
          periodo={periodo}
          onComplete={() => setPaso("dashboard")}
        />
      )}

      {paso === "dashboard" && token && (
        <RegistroDashboard
          token={token}
          onNuevaCirugia={() => { setDatos({}); setPaso("lugar"); }}
          onCompletarEscala={(id, per, art) => { setCirugiaId(id); setPeriodo(per); mergeDatos({ articulacion: art }); setPaso("escala"); }}
        />
      )}

      <div className="dp-footer">
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó, Chile
      </div>

    </div>
  );
}
