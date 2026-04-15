import { useState } from "react";
import RegistroAdminForm from "./components/RegistroAdminForm";
import PasoLugar from "./components/PasoLugar";
import PasoCirugia from "./components/PasoCirugia";
import PasoImplante from "./components/PasoImplante";
import PasoFecha from "./components/PasoFecha";
import RegistroEscalaForm from "./components/RegistroEscalaForm";
import RegistroDashboard from "./components/RegistroDashboard";
import "./styles/app.css";

const API_URL = import.meta.env.VITE_API_URL;

const ESQUEMAS_PROTESIS = {
  cadera: { revision: 6, primaria: 10 },
  rodilla: { revision: 6, primaria: 10 },
};

export default function App() {
  const [paso, setPaso] = useState("inicio");
  const [token, setToken] = useState(null);
  const [datos, setDatos] = useState({});
  const [cirugiaId, setCirugiaId] = useState(null);
  const [periodo, setPeriodo] = useState("postop");
  const [cirugias, setCirugias] = useState([]);
  const [esquema, setEsquema] = useState(null);

  function mergeDatos(nuevosDatos) {
    setDatos((prev) => ({ ...prev, ...nuevosDatos }));
  }

  function resetFlujo() {
    setDatos({});
    setCirugiaId(null);
    setPeriodo("postop");
    setEsquema(null);
  }

  function handleSalir() {
    setToken(null);
    setCirugias([]);
    resetFlujo();
    setPaso("inicio");
  }

  async function cargarCirugias(tokenActual) {
    if (!tokenActual) {
      setCirugias([]);
      return [];
    }

    try {
      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        headers: {
          Authorization: `Bearer ${tokenActual}`,
        },
      });

      const data = res.ok ? await res.json() : [];
      const lista = Array.isArray(data) ? data : data?.cirugias || [];

      setCirugias(lista);
      return lista;
    } catch (error) {
      console.error("Error cargando cirugías:", error);
      setCirugias([]);
      return [];
    }
  }

  function validarTipoCirugia(nuevaCirugia) {
    const existePrimaria = cirugias.find(
      (c) =>
        c.lado === nuevaCirugia.lado &&
        c.segmento === nuevaCirugia.segmento &&
        c.tipo === "primaria"
    );

    return existePrimaria ? "revision" : "primaria";
  }

  async function handleAdminComplete(_payload, tok) {
    const tokenActivo = tok || token;
    await cargarCirugias(tokenActivo);
    setPaso("dashboard");
  }

  function handleNuevaCirugia() {
    resetFlujo();
    setPaso("lugar");
  }

  function handleFechaComplete(data) {
    const tipo = validarTipoCirugia(data);
    const esquemaProtesis = ESQUEMAS_PROTESIS[data.segmento] || {
      revision: 4,
      primaria: 6,
    };

    const total =
      tipo === "primaria"
        ? esquemaProtesis.primaria
        : esquemaProtesis.revision;

    setEsquema({
      tipo,
      total,
      completadas: 0,
      segmento: data.segmento,
    });

    setCirugiaId(data.id);
    setPeriodo(data.periodo_escala || "postop");
    setPaso("escala");
  }

  async function handleEscalaCompleta() {
    await cargarCirugias(token);
    setPaso("dashboard");
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {paso === "inicio" && (
          <div className="app-container">
            <div className="app-center" style={{ minHeight: "100vh" }}>
              <button
                className="app-btn app-btn--primary"
                onClick={() => setPaso("admin")}
              >
                Ingresar
              </button>
            </div>
          </div>
        )}

        {paso === "admin" && (
          <RegistroAdminForm
            token={token}
            onTokenReady={setToken}
            onComplete={handleAdminComplete}
          />
        )}

        {paso === "dashboard" && token && (
          <RegistroDashboard
            token={token}
            onNuevaCirugia={handleNuevaCirugia}
            onCompletarEscala={(id, per) => {
              setCirugiaId(id);
              setPeriodo(per);
              setPaso("escala");
            }}
          />
        )}

        {paso === "lugar" && token && (
          <PasoLugar
            inicial={datos}
            onComplete={(data) => {
              mergeDatos(data);
              setPaso("cirugia");
            }}
            onBack={() => setPaso("dashboard")}
          />
        )}

        {paso === "cirugia" && token && (
          <PasoCirugia
            inicial={datos}
            onComplete={(data) => {
              mergeDatos(data);
              setPaso("implante");
            }}
            onBack={() => setPaso("lugar")}
          />
        )}

        {paso === "implante" && token && (
          <PasoImplante
            articulacion={datos.articulacion}
            inicial={datos}
            onComplete={(data) => {
              mergeDatos(data);
              setPaso("fecha");
            }}
            onBack={() => setPaso("cirugia")}
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
            onComplete={handleEscalaCompleta}
          />
        )}
      </main>
    </div>
  );
        }
