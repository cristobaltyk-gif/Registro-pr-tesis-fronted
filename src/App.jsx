import { useEffect, useState } from "react";
import RegistroAdminForm   from "./components/RegistroAdminForm";
import RegistroCirugiaForm from "./components/RegistroCirugiaForm";
import RegistroEscalaForm  from "./components/RegistroEscalaForm";
import RegistroDashboard   from "./components/RegistroDashboard";

const API_URL = import.meta.env.VITE_API_URL;

const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/APaQ0SSMBWniO2NWVDwGoaCaQjiel3lBKrmNgpaZZY-ZsYzTawYaf-_7Ad-xfeKVyfCqxa7WgzhWPKHtdaCS0jGtFRrcseP-R8KG1LfY2iYuhZeClvWEBljPLh9KANIClyKSsiSJH8_of4LPUOJUl7cWNwB2HKR7RVH_xB_h9BG-8Nr9jnorb-q2gId2=w300";

export default function App() {
  const [paso,      setPaso]      = useState("rut");
  const [rut,       setRut]       = useState("");
  const [rutInput,  setRutInput]  = useState("");
  const [token,     setToken]     = useState(null);
  const [cirugiaId, setCirugiaId] = useState(null);
  const [periodo,   setPeriodo]   = useState("preop");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // ── Recuperar sesión guardada ────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("registro_token");
    const savedRut   = localStorage.getItem("registro_rut");
    if (savedToken && savedRut) {
      verificarToken(savedToken, savedRut);
    }
  }, []);

  async function verificarToken(t, r) {
    try {
      const res = await fetch(`${API_URL}/api/registro/auth/verificar`, {
        headers: { "Authorization": `Bearer ${t}` }
      });
      if (res.ok) {
        setToken(t);
        setRut(r);
        setPaso("dashboard");
      } else {
        localStorage.removeItem("registro_token");
        localStorage.removeItem("registro_rut");
      }
    } catch {}
  }

  // ── Ingresar con RUT ─────────────────────────────────────
  async function handleIngresarRut() {
    setError(null);
    const rutNorm = rutInput.trim().toUpperCase().replace(/\./g, "").replace(/ /g, "");
    if (!rutNorm) { setError("Ingrese su RUT"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/auth/ingresar`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rut: rutNorm }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error al ingresar");
      }

      const data = await res.json();
      setToken(data.token);
      setRut(data.rut);
      localStorage.setItem("registro_token", data.token);
      localStorage.setItem("registro_rut",   data.rut);
      setPaso("admin");

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAdminComplete()       { setPaso("cirugia"); }
  function handleCirugiaComplete(c)    { setCirugiaId(c.id || c.data?.id); setPeriodo("preop"); setPaso("escala"); }
  function handleEscalaComplete()      { setPaso("dashboard"); }
  function handleNuevaCirugia()        { setCirugiaId(null); setPaso("cirugia"); }
  function handleCompletarEscala(cId, per) { setCirugiaId(cId); setPeriodo(per); setPaso("escala"); }

  function handleSalir() {
    localStorage.removeItem("registro_token");
    localStorage.removeItem("registro_rut");
    setToken(null); setRut(""); setRutInput(""); setPaso("rut");
  }

  const PASOS_BARRA  = ["admin", "cirugia", "escala", "dashboard"];
  const PASOS_LABEL  = { admin: "Mis datos", cirugia: "Mi cirugía", escala: "Evaluación", dashboard: "Resumen" };
  const pasoIdx      = PASOS_BARRA.indexOf(paso);

  return (
    <div style={styles.root}>

      {/* Header */}
      <div style={styles.header}>
        <img src={LOGO_URL} alt="ICA" style={styles.logo} />
        <div style={styles.headerTexto}>
          <div style={styles.headerTitulo}>Registro Nacional de Prótesis</div>
          <div style={styles.headerSub}>Instituto de Cirugía Articular · Chile</div>
        </div>
        {token && <button style={styles.btnSalir} onClick={handleSalir}>Salir</button>}
      </div>

      {/* Barra de pasos */}
      {paso !== "rut" && (
        <div style={styles.baraPasos}>
          {PASOS_BARRA.map((p, i) => (
            <div key={p} style={styles.pasoItem}>
              <div style={{ ...styles.pasoCirculo, ...(i <= pasoIdx ? styles.pasoActivo : styles.pasoInactivo) }}>
                {i < pasoIdx ? "✓" : i + 1}
              </div>
              <div style={{ ...styles.pasoLabel, color: i <= pasoIdx ? "#0f172a" : "#94a3b8" }}>
                {PASOS_LABEL[p]}
              </div>
              {i < PASOS_BARRA.length - 1 && (
                <div style={{ ...styles.pasoLinea, background: i < pasoIdx ? "#0f172a" : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contenido */}
      <div style={styles.content}>

        {paso === "rut" && (
          <div style={styles.rutContainer}>
            <div style={styles.rutIcon}>🦴</div>
            <h1 style={styles.rutTitulo}>Registro Nacional de Prótesis</h1>
            <p style={styles.rutDesc}>
              Ingrese su RUT para registrar su prótesis articular y realizar
              el seguimiento de su recuperación.
            </p>
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.rutInputGroup}>
              <input
                style={styles.rutInput}
                value={rutInput}
                onChange={e => setRutInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleIngresarRut()}
                placeholder="12345678-9"
                autoFocus
              />
              <button
                style={{ ...styles.btnPrimary, opacity: loading ? 0.6 : 1 }}
                onClick={handleIngresarRut}
                disabled={loading}
              >
                {loading ? "Ingresando…" : "Ingresar →"}
              </button>
            </div>
            <p style={styles.rutHint}>
              Su información es confidencial y contribuye al registro
              nacional de calidad en cirugía articular.
            </p>
          </div>
        )}

        {paso === "admin" && token && (
          <RegistroAdminForm token={token} rut={rut} onComplete={handleAdminComplete} />
        )}

        {paso === "cirugia" && token && (
          <RegistroCirugiaForm token={token} onComplete={handleCirugiaComplete} />
        )}

        {paso === "escala" && token && cirugiaId && (
          <RegistroEscalaForm token={token} cirugiaId={cirugiaId} periodo={periodo} onComplete={handleEscalaComplete} />
        )}

        {paso === "dashboard" && token && (
          <RegistroDashboard token={token} onNuevaCirugia={handleNuevaCirugia} onCompletarEscala={handleCompletarEscala} />
        )}

      </div>

      {/* Footer */}
      <div style={styles.footer}>
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó, Chile
      </div>

    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column" },
  header: { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 },
  logo: { height: 40, flexShrink: 0 },
  headerTexto: { flex: 1 },
  headerTitulo: { fontSize: 14, fontWeight: 800, color: "#0f172a" },
  headerSub: { fontSize: 11, color: "#64748b" },
  btnSalir: { background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#475569", cursor: "pointer", fontFamily: "inherit" },
  baraPasos: { display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", gap: 0, overflowX: "auto" },
  pasoItem: { display: "flex", alignItems: "center", gap: 6 },
  pasoCirculo: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  pasoActivo: { background: "#0f172a", color: "#fff" },
  pasoInactivo: { background: "#e2e8f0", color: "#94a3b8" },
  pasoLabel: { fontSize: 11, fontWeight: 600, marginRight: 6, whiteSpace: "nowrap" },
  pasoLinea: { width: 24, height: 2, flexShrink: 0, marginRight: 6 },
  content: { flex: 1, padding: "24px 20px", maxWidth: 580, width: "100%", margin: "0 auto", boxSizing: "border-box" },
  rutContainer: { textAlign: "center", paddingTop: 20 },
  rutIcon: { fontSize: 48, marginBottom: 16 },
  rutTitulo: { fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 12 },
  rutDesc: { fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" },
  rutInputGroup: { display: "flex", gap: 8, maxWidth: 360, margin: "0 auto 16px" },
  rutInput: { flex: 1, padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", color: "#0f172a", textAlign: "center", letterSpacing: "0.05em" },
  rutHint: { fontSize: 12, color: "#94a3b8", lineHeight: 1.5, maxWidth: 340, margin: "0 auto" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16, textAlign: "left" },
  btnPrimary: { background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  footer: { textAlign: "center", padding: "16px", fontSize: 11, color: "#94a3b8", borderTop: "1px solid #e2e8f0", background: "#fff" },
};
