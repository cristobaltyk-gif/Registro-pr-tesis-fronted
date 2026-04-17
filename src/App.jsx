import { useState } from "react";
import RegistroAdminForm   from "./components/RegistroAdminForm";
import PasoLugar           from "./components/PasoLugar";
import PasoCirugia         from "./components/PasoCirugia";
import PasoImplante        from "./components/PasoImplante";
import PasoFecha           from "./components/PasoFecha";
import RegistroEscalaForm  from "./components/RegistroEscalaForm";
import RegistroDashboard   from "./components/RegistroDashboard";
import { calcularEscalaPendiente } from "./utils/calcularEscalaPendiente";
import "./styles/dashboard-pacientes.css";

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

// Solo se muestra cuando está agregando una nueva prótesis
const BARRA_NUEVA = ["lugar", "cirugia", "implante", "fecha"];
const BARRA_LABEL = {
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
  const [segmentoPreSeleccionado, setSegmentoPreSeleccionado] = useState(null);

  function handleSalir() {
    setToken(null); setDatos({}); setCirugiaId(null); setPaso("inicio");
  }

  function mergeDatos(d) {
    setDatos(prev => ({ ...prev, ...d }));
  }

  // ==== HANDLERS DEL DASHBOARD (mapa corporal) ====

  // Click en punto VACÍO → iniciar flujo nueva prótesis
  function handleClickPuntoVacio(segmentoId) {
    // segmentoId: "cadera-derecha" | "cadera-izquierda" | "rodilla-derecha" | "rodilla-izquierda"
    const [articulacion, lado] = segmentoId.split("-");
    setDatos({ articulacion, lado });
    setSegmentoPreSeleccionado(segmentoId);
    setPaso("lugar");
  }

  // Click en prótesis EXISTENTE → escala pendiente o vista detalle
  function handleClickProtesis(cirugia) {
    const estado = calcularEscalaPendiente(cirugia);

    if (estado.tipo === "pendiente") {
      // Hay escala pendiente → ir directo a completarla
      setCirugiaId(cirugia.id);
      setPeriodo(estado.periodo);
      mergeDatos({ articulacion: cirugia.articulacion });
      setPaso("escala");
    } else if (estado.tipo === "al_dia") {
      // Ya completó la escala de la ventana actual → vista detalle
      setCirugiaId(cirugia.id);
      setPaso("detalle");
    } else {
      // Fuera de ventana (ej: pasaron >36 meses) → vista detalle
      setCirugiaId(cirugia.id);
      setPaso("detalle");
    }
  }

  const pasoIdx = BARRA_NUEVA.indexOf(paso);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <img src={LOGO_URL} alt="ICA" style={{ height: 40, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Registro Nacional de Prótesis</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Instituto de Cirugía Articular · Chile</div>
        </div>
        {token && paso !== "inicio" && (
          <button className="dp-btn-secondary" style={{ width: "auto", padding: "6px 14px", fontSize: 13 }}
            onClick={handleSalir}>Salir</button>
        )}
      </div>

      {/* Botón "Volver al inicio" cuando está en flujo de nueva prótesis */}
      {pasoIdx >= 0 && token && (
        <div style={{ padding: "10px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => { setDatos({}); setSegmentoPreSeleccionado(null); setPaso("dashboard"); }}
            style={{ background: "transparent", border: "none", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ← Volver al mapa
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, overflowX: "auto" }}>
            {BARRA_NUEVA.map((p, i) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: i <= pasoIdx ? "#0f172a" : "#e2e8f0",
                  color:      i <= pasoIdx ? "#fff"    : "#94a3b8",
                }}>
                  {i < pasoIdx ? "✓" : i + 1}
                </div>
                {i < BARRA_NUEVA.length - 1 && (
                  <div style={{ width: 12, height: 2, flexShrink: 0, background: i < pasoIdx ? "#0f172a" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INICIO (landing) */}
      {paso === "inicio" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <ProthesisIcon />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12, lineHeight: 1.2 }}>
              Registro Nacional<br />de Prótesis
            </h1>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 28 }}>
              Si usted fue operado de una prótesis articular en Chile, ingrese para ver y completar el seguimiento de sus prótesis.
            </p>
            <button className="dp-btn-primary" style={{ fontSize: 15, padding: "14px 0" }}
              onClick={() => setPaso("admin")}>
              Ingresar / Registrarme →
            </button>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 14, lineHeight: 1.5 }}>
              Su información es confidencial y contribuye al registro nacional de calidad en cirugía articular.
            </p>
          </div>
        </div>
      )}

      {/* ADMIN → al completar va directo al DASHBOARD */}
      {paso === "admin" && (
        <RegistroAdminForm
          onTokenReady={t => setToken(t)}
          token={token}
          onComplete={() => setPaso("dashboard")}
        />
      )}

      {/* DASHBOARD = MAPA CORPORAL (pantalla home post-login) */}
      {paso === "dashboard" && token && (
        <RegistroDashboard
          token={token}
          onClickPuntoVacio={handleClickPuntoVacio}
          onClickProtesis={handleClickProtesis}
        />
      )}

      {/* FLUJO NUEVA PRÓTESIS */}
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
          onComplete={d => {
            setCirugiaId(d.id);
            setPeriodo(d.periodo_escala || "preop");
            setPaso("escala");
          }}
          onBack={() => setPaso("implante")}
        />
      )}

      {/* ESCALA — al terminar, vuelve al DASHBOARD */}
      {paso === "escala" && token && cirugiaId && (
        <RegistroEscalaForm
          token={token}
          cirugiaId={cirugiaId}
          articulacion={datos.articulacion}
          periodo={periodo}
          onComplete={() => {
            setDatos({});
            setSegmentoPreSeleccionado(null);
            setPaso("dashboard");
          }}
          onBack={() => setPaso("dashboard")}
        />
      )}

      {/* DETALLE de prótesis al día (opcional, puedes implementarlo después) */}
      {paso === "detalle" && token && cirugiaId && (
        <div style={{ padding: 24, textAlign: "center" }}>
          <p>Vista detalle de cirugía {cirugiaId} (historial de escalas)</p>
          <button className="dp-btn-secondary" onClick={() => setPaso("dashboard")}>
            ← Volver al mapa
          </button>
        </div>
      )}

      <div className="dp-footer">
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó, Chile
      </div>

    </div>
  );
      }
