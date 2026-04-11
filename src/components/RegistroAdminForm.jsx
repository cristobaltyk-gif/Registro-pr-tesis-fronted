import { useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

function normalizeRut(rut) {
  rut = rut.trim().toUpperCase().replace(/\./g, "").replace(/ /g, "");
  if (!rut.includes("-") && rut.length > 1) rut = rut.slice(0, -1) + "-" + rut.slice(-1);
  return rut;
}

function isValidRut(rut) {
  return /^\d{7,8}-[\dK]$/.test(rut);
}

const ISAPRES = [
  "Banmédica", "Colmena", "Cruz Blanca", "Cruz del Norte",
  "Esencial", "MasVida", "Río Blanco", "San Lorenzo",
  "Vida Tres", "Otra",
];

export default function RegistroAdminForm({ token, onComplete }) {
  const [rut,          setRut]          = useState("");
  const [mode,         setMode]         = useState("search"); // search | edit | create
  const [isEditing,    setIsEditing]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [success,      setSuccess]      = useState(null);
  const [previsionTipo, setPrevisionTipo] = useState("");
  const [isapre,       setIsapre]       = useState("");
  const [otraIsapre,   setOtraIsapre]   = useState("");

  const [form, setForm] = useState({
    rut: "", nombre: "", apellidoPaterno: "", apellidoMaterno: "",
    fechaNacimiento: "", direccion: "", telefono: "", email: "", sexo: "",
  });

  function update(field, value) {
    if (!isEditing && mode === "edit") return;
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // ── Buscar paciente ──────────────────────────────────────
  async function handleSearch() {
    setError(null);
    if (!rut || !isValidRut(normalizeRut(rut))) { setError("RUT inválido"); return; }
    const norm = normalizeRut(rut);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/admin/${encodeURIComponent(norm)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setForm({
          rut:             data.rut              ?? norm,
          nombre:          data.nombre           ?? "",
          apellidoPaterno: data.apellido_paterno ?? "",
          apellidoMaterno: data.apellido_materno ?? "",
          fechaNacimiento: data.fecha_nacimiento ?? "",
          direccion:       data.direccion        ?? "",
          telefono:        data.telefono         ?? "",
          email:           data.email            ?? "",
          sexo:            data.sexo             ?? "",
        });
        const prev = data.prevision || "";
        if (prev.startsWith("Isapre")) {
          setPrevisionTipo("Isapre");
          setIsapre(prev.replace("Isapre - ", ""));
        } else {
          setPrevisionTipo(prev);
        }
        setMode("edit"); setIsEditing(false);
        return;
      }
      if (res.status === 404) {
        setForm({ rut: norm, nombre: "", apellidoPaterno: "", apellidoMaterno: "", fechaNacimiento: "", direccion: "", telefono: "", email: "", sexo: "" });
        setPrevisionTipo(""); setIsapre("");
        setMode("create"); setIsEditing(true);
        return;
      }
      setError("Error inesperado al buscar");
    } catch { setError("Error de conexión con el servidor"); }
    finally  { setLoading(false); }
  }

  // ── Confirmar paciente existente ─────────────────────────
  function handleConfirmExisting() {
    onComplete?.(buildPayload());
  }

  // ── Guardar / modificar ──────────────────────────────────
  async function handleSubmit() {
    setError(null);
    if (!form.nombre || !form.apellidoPaterno) { setError("Nombre y apellido paterno son obligatorios"); return; }
    if (!form.fechaNacimiento)                 { setError("Fecha de nacimiento obligatoria"); return; }
    if (!form.sexo)                            { setError("Sexo es obligatorio"); return; }
    if (!form.email)                           { setError("Email es obligatorio"); return; }

    const payload = buildPayload();
    setLoading(true);
    try {
      const res = await fetch(
        mode === "create" ? `${API_URL}/api/registro/admin` : `${API_URL}/api/registro/admin/${encodeURIComponent(form.rut)}`,
        {
          method:  mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body:    JSON.stringify(payload),
        }
      );
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j?.detail || "Error al guardar"); }
      setSuccess("Datos guardados");
      setIsEditing(false); setMode("edit");
      setTimeout(() => { setSuccess(null); onComplete?.(payload); }, 1200);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  function getPrevisionFinal() {
    if (previsionTipo === "Isapre") {
      const n = isapre === "Otra" ? otraIsapre : isapre;
      return n ? `Isapre - ${n}` : "Isapre";
    }
    return previsionTipo;
  }

  function buildPayload() {
    return {
      rut:              form.rut,
      nombre:           form.nombre,
      apellido_paterno: form.apellidoPaterno,
      apellido_materno: form.apellidoMaterno,
      fecha_nacimiento: form.fechaNacimiento,
      direccion:        form.direccion,
      telefono:         form.telefono,
      email:            form.email,
      prevision:        getPrevisionFinal(),
      sexo:             form.sexo,
    };
  }

  const ro = mode === "edit" && !isEditing;

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Sus datos personales</h1>
          <p>
            {mode === "search"      && "Ingrese su RUT para continuar"}
            {mode === "create"      && "Nuevo paciente"}
            {mode === "edit" && ro  && "Paciente encontrado"}
            {mode === "edit" && !ro && "Editando paciente"}
          </p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {/* SEARCH */}
          <div className="registro-search">
            <input
              placeholder="RUT"
              value={rut}
              onChange={e => setRut(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button className="search-btn" disabled={loading} onClick={handleSearch}>
              🔍
            </button>
          </div>

          {error   && <div className="registro-error">{error}</div>}
          {success && <div className="registro-success">{success}</div>}

          {(mode === "edit" || mode === "create") && (
            <div className="registro-form">
              <h3>{mode === "edit" ? (isEditing ? "Editando paciente" : "Paciente encontrado") : "Nuevo paciente"}</h3>

              <input placeholder="Nombre" value={form.nombre} readOnly={ro}
                onChange={e => update("nombre", e.target.value)} />

              <div className="registro-row">
                <input placeholder="Apellido paterno" value={form.apellidoPaterno} readOnly={ro}
                  onChange={e => update("apellidoPaterno", e.target.value)} />
                <input placeholder="Apellido materno" value={form.apellidoMaterno} readOnly={ro}
                  onChange={e => update("apellidoMaterno", e.target.value)} />
              </div>

              <div className="registro-row">
                <input type="date" placeholder="Fecha nacimiento" value={form.fechaNacimiento} readOnly={ro}
                  onChange={e => update("fechaNacimiento", e.target.value)} />
                <select value={form.sexo} disabled={ro} onChange={e => update("sexo", e.target.value)}>
                  <option value="">Sexo</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>

              {/* Previsión */}
              <select value={previsionTipo} disabled={ro}
                onChange={e => { setPrevisionTipo(e.target.value); setIsapre(""); }}>
                <option value="">Previsión</option>
                <option value="Fonasa">Fonasa</option>
                <option value="Isapre">Isapre</option>
                <option value="Particular">Particular</option>
                <option value="Otra">Otra</option>
              </select>

              {/* Selector isapre — siempre visible cuando prevision es Isapre */}
              {previsionTipo === "Isapre" && (
                <>
                  <select value={isapre} disabled={ro} onChange={e => setIsapre(e.target.value)}>
                    <option value="">¿Cuál Isapre?</option>
                    {ISAPRES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  {isapre === "Otra" && (
                    <input placeholder="Nombre de su Isapre" value={otraIsapre} readOnly={ro}
                      onChange={e => setOtraIsapre(e.target.value)} />
                  )}
                </>
              )}

              <input placeholder="Dirección" value={form.direccion} readOnly={ro}
                onChange={e => update("direccion", e.target.value)} />

              <input placeholder="Teléfono" value={form.telefono} readOnly={ro}
                onChange={e => update("telefono", e.target.value)} />

              <input type="email" placeholder="Email" value={form.email} readOnly={ro}
                onChange={e => update("email", e.target.value)} />
              {!ro && <span className="registro-hint">Le enviaremos recordatorios de sus evaluaciones</span>}

              <div className="registro-actions">
                {mode === "edit" && !isEditing && (
                  <>
                    <button className="btn-primary" onClick={handleConfirmExisting}>Confirmar</button>
                    <button className="btn-danger"  onClick={() => setIsEditing(true)}>Modificar</button>
                  </>
                )}
                {(mode === "create" || isEditing) && (
                  <>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                      {loading ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Guardar"}
                    </button>
                    {mode === "edit" && (
                      <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                    )}
                  </>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
