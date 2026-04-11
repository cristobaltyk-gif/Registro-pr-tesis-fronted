import { useEffect, useState } from "react";
import RegistroAdminForm   from "./components/RegistroAdminForm";
import RegistroCirugiaForm from "./components/RegistroCirugiaForm";
import RegistroEscalaForm  from "./components/RegistroEscalaForm";
import RegistroDashboard   from "./components/RegistroDashboard";
import "./styles/dashboard-pacientes.css";

const API_URL  = import.meta.env.VITE_API_URL;
const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/APaQ0SSMBWniO2NWVDwGoaCaQjiel3lBKrmNgpaZZY-ZsYzTawYaf-_7Ad-xfeKVyfCqxa7WgzhWPKHtdaCS0jGtFRrcseP-R8KG1LfY2iYuhZeClvWEBljPLh9KANIClyKSsiSJH8_of4LPUOJUl7cWNwB2HKR7RVH_xB_h9BG-8Nr9jnorb-q2gId2=w300";

const PASOS_BARRA = ["admin", "cirugia", "escala", "dashboard"];
const PASOS_LABEL = { admin: "Mis datos", cirugia: "Mi cirugía", escala: "Evaluación", dashboard: "Resumen" };

export default function App() {
  const [paso,      setPaso]      = useState("rut");
  const [rut,       setRut]       = useState("");
  const [rutInput,  setRutInput]  = useState("");
  const [token,     setToken]     = useState(null);
  const [cirugiaId, setCirugiaId] = useState(null);
  const [periodo,   setPeriodo]   = useState("preop");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("registro_token");
    const r = localStorage.getItem("registro_rut");
    if (t && r) verificarToken(t, r);
  }, []);

  async function verificarToken(t, r) {
    try {
      const res = await fetch(`${API_URL}/api/registro/auth/verificar`, {
        headers: { "Authorization": `Bearer ${t}` }
      });
      if (res.ok) { setToken(t); setRut(r); setPaso("dashboard"); }
      else { localStorage.removeItem("registro_token"); localStorage.removeItem("registro_rut"); }
    } catch {}
  }

  async function handleIngresar() {
    setError(null);
    const rutNorm = rutInput.trim().toUpperCase().replace(/\./g, "").replace(/ /g, "");
    if (!rutNorm) { setError("Ingrese su RUT"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/auth/ingresar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut: rutNorm }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j?.detail || "Error al ingresar"); }
      const data = await res.json();
      setToken(data.token); setRut(data.rut);
      localStorage.setItem("registro_token", data.token);
      localStorage.setItem("registro_rut",   data.rut);
      setPaso("admin");
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  function handleSalir() {
    localStorage.removeItem("registro_token"); localStorage.removeItem("registro_rut");
    setToken(null); setRut(""); setRutInput(""); setPaso("rut");
  }

  const pasoIdx = PASOS_BARRA.indexOf(paso);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Header global */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
      }}>
        <img src={LOGO_URL} alt="ICA" style={{ height: 40, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Registro Nacional de Prótesis</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Instituto de Cirugía Articular · Chile</div>
        </div>
        {token && (
          <button className="dp-btn-secondary" style={{ width: "auto", padding: "6px 14px", fontSize: 13 }}
            onClick={handleSalir}>
            Salir
          </button>
        )}
      </div>

      {/* Barra de pasos */}
      {paso !== "rut" && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "14px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0",
          gap: 0, overflowX: "auto",
        }}>
          {PASOS_BARRA.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: i <= pasoIdx ? "#0f172a" : "#e2e8f0",
                color:      i <= pasoIdx ? "#fff"    : "#94a3b8",
              }}>
                {i < pasoIdx ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, marginRight: 6, whiteSpace: "nowrap",
                color: i <= pasoIdx ? "#0f172a" : "#94a3b8",
              }}>
                {PASOS_LABEL[p]}
              </span>
              {i < PASOS_BARRA.length - 1 && (
                <div style={{ width: 24, height: 2, marginRight: 6, flexShrink: 0,
                  background: i < pasoIdx ? "#0f172a" : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pantalla RUT */}
      {paso === "rut" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🦴</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
              Registro Nacional de Prótesis
            </h1>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 28 }}>
              Ingrese su RUT para registrar su prótesis articular y realizar el seguimiento de su recuperación.
            </p>
            {error && <div className="dp-error" style={{ marginBottom: 16, textAlign: "left" }}>{error}</div>}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                style={{
                  flex: 1, padding: "12px 14px", border: "1.5px solid #e2e8f0",
                  borderRadius: 10, fontSize: 16, fontFamily: "'DM Sans', system-ui, sans-serif",
                  outline: "none", color: "#0f172a", textAlign: "center", letterSpacing: "0.05em",
                }}
                value={rutInput}
                onChange={e => setRutInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleIngresar()}
                placeholder="12345678-9"
                autoFocus
              />
              <button className="dp-btn-primary"
                style={{ width: "auto", padding: "12px 20px", opacity: loading ? 0.6 : 1 }}
                onClick={handleIngresar} disabled={loading}>
                {loading ? "…" : "Ingresar →"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
              Su información es confidencial y contribuye al registro nacional de calidad en cirugía articular.
            </p>
          </div>
        </div>
      )}

      {/* Formularios */}
      {paso === "admin"     && token && <RegistroAdminForm   token={token} rut={rut} onComplete={() => setPaso("cirugia")} />}
      {paso === "cirugia"   && token && <RegistroCirugiaForm token={token} onComplete={c => { setCirugiaId(c.id || c.data?.id); setPeriodo("preop"); setPaso("escala"); }} />}
      {paso === "escala"    && token && cirugiaId && <RegistroEscalaForm token={token} cirugiaId={cirugiaId} periodo={periodo} onComplete={() => setPaso("dashboard")} />}
      {paso === "dashboard" && token && <RegistroDashboard   token={token} onNuevaCirugia={() => { setCirugiaId(null); setPaso("cirugia"); }} onCompletarEscala={(id, per) => { setCirugiaId(id); setPeriodo(per); setPaso("escala"); }} />}

      {/* Footer */}
      <div className="dp-footer">
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó, Chile
      </div>

    </div>
  );
}
