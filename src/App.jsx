import { useState } from "react";
import RegistroAdminForm   from "./components/RegistroAdminForm";
import RegistroCirugiaForm from "./components/RegistroCirugiaForm";
import RegistroEscalaForm  from "./components/RegistroEscalaForm";
import RegistroDashboard   from "./components/RegistroDashboard";
import "./styles/dashboard-pacientes.css";

const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/APaQ0SSMBWniO2NWVDwGoaCaQjiel3lBKrmNgpaZZY-ZsYzTawYaf-_7Ad-xfeKVyfCqxa7WgzhWPKHtdaCS0jGtFRrcseP-R8KG1LfY2iYuhZeClvWEBljPLh9KANIClyKSsiSJH8_of4LPUOJUl7cWNwB2HKR7RVH_xB_h9BG-8Nr9jnorb-q2gId2=w300";

// Ícono prótesis de rodilla SVG
const ProthesisIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="28" y="4" width="24" height="32" rx="8" fill="#0f172a" opacity="0.15"/>
    <rect x="32" y="4" width="16" height="32" rx="6" fill="#0f172a" opacity="0.3"/>
    <rect x="34" y="8" width="12" height="24" rx="4" fill="#0f172a" opacity="0.5"/>
    <ellipse cx="40" cy="38" rx="14" ry="8" fill="#0f172a" opacity="0.2"/>
    <ellipse cx="40" cy="38" rx="10" ry="6" fill="#0f172a" opacity="0.4"/>
    <rect x="30" y="44" width="20" height="30" rx="6" fill="#0f172a" opacity="0.15"/>
    <rect x="33" y="44" width="14" height="30" rx="5" fill="#0f172a" opacity="0.3"/>
    <rect x="35" y="48" width="10" height="22" rx="3" fill="#0f172a" opacity="0.5"/>
    <rect x="26" y="36" width="28" height="10" rx="4" fill="#0f172a" opacity="0.6"/>
  </svg>
);

const PASOS_BARRA = ["admin", "cirugia", "escala", "dashboard"];
const PASOS_LABEL = { admin: "Mis datos", cirugia: "Mi cirugía", escala: "Evaluación", dashboard: "Resumen" };

export default function App() {
  const [paso,      setPaso]      = useState("inicio");
  const [token,     setToken]     = useState(null);
  const [cirugiaId, setCirugiaId] = useState(null);
  const [periodo,   setPeriodo]   = useState("preop");

  function handleSalir() {
    setToken(null);
    setCirugiaId(null);
    setPaso("inicio");
  }

  const pasoIdx = PASOS_BARRA.indexOf(paso);
  const mostrarBarra = pasoIdx >= 0;

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

      {/* Barra de pasos */}
      {mostrarBarra && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", gap: 0, overflowX: "auto" }}>
          {PASOS_BARRA.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: i <= pasoIdx ? "#0f172a" : "#e2e8f0",
                color:      i <= pasoIdx ? "#fff"    : "#94a3b8",
              }}>
                {i < pasoIdx ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, marginRight: 6, whiteSpace: "nowrap", color: i <= pasoIdx ? "#0f172a" : "#94a3b8" }}>
                {PASOS_LABEL[p]}
              </span>
              {i < PASOS_BARRA.length - 1 && (
                <div style={{ width: 20, height: 2, marginRight: 6, flexShrink: 0, background: i < pasoIdx ? "#0f172a" : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── INICIO ── */}
      {paso === "inicio" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>

            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
              <ProthesisIcon />
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12, lineHeight: 1.2 }}>
              Registro Nacional<br />de Prótesis
            </h1>

            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
              Si usted fue operado de una prótesis articular en Chile, puede registrar su cirugía y ayudarnos a mejorar la calidad de la atención en todo el país.
            </p>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px", marginBottom: 28, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>¿Qué incluye el registro?</div>
              {[
                "🦴 Tipo de prótesis y cirugía",
                "🏥 Centro donde fue operado",
                "🔩 Marca e implante utilizado",
                "📋 Evaluaciones de seguimiento",
              ].map(item => (
                <div key={item} style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>{item}</div>
              ))}
            </div>

            <button
              className="dp-btn-primary"
              onClick={() => setPaso("admin")}
              style={{ fontSize: 15, padding: "14px 0" }}
            >
              Registrar mi prótesis →
            </button>

            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 16, lineHeight: 1.5 }}>
              Su información es confidencial y contribuye al registro nacional de calidad en cirugía articular.
            </p>

          </div>
        </div>
      )}

      {/* ── ADMIN ── */}
      {paso === "admin" && (
        <RegistroAdminForm
          onTokenReady={(t) => setToken(t)}
          token={token}
          onComplete={() => setPaso("cirugia")}
        />
      )}

      {/* ── CIRUGIA ── */}
      {paso === "cirugia" && token && (
        <RegistroCirugiaForm
          token={token}
          onComplete={c => {
            setCirugiaId(c.id || c.data?.id);
            setPeriodo(c.periodo_escala || "preop");
            setPaso("escala");
          }}
        />
      )}

      {/* ── ESCALA ── */}
      {paso === "escala" && token && cirugiaId && (
        <RegistroEscalaForm
          token={token}
          cirugiaId={cirugiaId}
          periodo={periodo}
          onComplete={() => setPaso("dashboard")}
        />
      )}

      {/* ── DASHBOARD ── */}
      {paso === "dashboard" && token && (
        <RegistroDashboard
          token={token}
          onNuevaCirugia={() => { setCirugiaId(null); setPaso("cirugia"); }}
          onCompletarEscala={(id, per) => { setCirugiaId(id); setPeriodo(per); setPaso("escala"); }}
        />
      )}

      <div className="dp-footer">
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó, Chile
      </div>

    </div>
  );
                                              }
        
