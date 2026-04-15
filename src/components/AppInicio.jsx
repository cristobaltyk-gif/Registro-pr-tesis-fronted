// src/components/AppInicio.jsx

import "../styles/app.css"; // 👈 ESTE es el css que pediste usar

const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/APaQ0SSMBWniO2NWVDwGoaCaQjiel3lBKrmNgpaZZY-ZsYzTawYaf-_7Ad-xfeKVyfCqxa7WgzhWPKHtdaCS0jGtFRrcseP-R8KG1LfY2iYuhZeClvWEBljPLh9KANIClyKSsiSJH8_of4LPUOJUl7cWNwB2HKR7RVH_xB_h9BG-8Nr9jnorb-q2gId2=w300";

function ProthesisIcon() {
  return (
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
}

export default function AppInicio({ onIngresar }) {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar__brand">
          <img src={LOGO_URL} alt="ICA" className="app-topbar__logo" />
          <div className="app-topbar__titles">
            <p className="app-topbar__title">Registro Nacional de Prótesis</p>
            <p className="app-topbar__subtitle">Instituto de Cirugía Articular · Chile</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-container">
          <section className="app-hero app-center">
            <div className="app-stack app-center">
              <ProthesisIcon />

              <div className="app-stack">
                <h1 className="app-page-title">
                  Registro Nacional de Prótesis
                </h1>
                <p className="app-page-subtitle">
                  Registre su cirugía y ayude a mejorar la atención en Chile.
                </p>
              </div>

              <button
                type="button"
                className="app-btn app-btn--primary app-btn--block"
                onClick={onIngresar}
              >
                Ingresar
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Chile
      </footer>
    </div>
  );
}
