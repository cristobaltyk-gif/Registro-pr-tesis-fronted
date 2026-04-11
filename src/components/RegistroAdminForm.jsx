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
  const [rut,           setRut]           = useState("");
  const [mode,          setMode]          = useState("search"); // search | edit | create
  const [isEditing,     setIsEditing]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(null);
  const [previsionTipo, setPrevisionTipo] = useState("");
  const [isapre,        setIsapre]        = useState("");
  const [otraIsapre,    setOtraIsapre]    = useState("");

  const [form, setForm] = useState({
    rut: "", nombre: "", apellidoPaterno: "", apellidoMaterno: "",
    fechaNacimiento: "", direccion: "", telefono: "", email: "", sexo: "",
  });

  function update(field, value) {
    if (!isEditing && mode === "edit") return;
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // ── Buscar por RUT ───────────────────────────────────────
  async function handleSearch() {
    setError(null);
    const norm = normalizeRut(rut);
    if (!isValidRut(norm)) { setError("RUT inválido"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/admin/${encodeURIComponent(norm)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setForm({
          rut:             data.rut              || norm,
          nombre:          data.nombre           || "",
          apellidoPaterno: data.apellido_paterno || "",
          apellidoMaterno: data.apellido_materno || "",
          fechaNacimiento: data.fecha_nacimiento || "",
          direccion:       data.direccion        || "",
          telefono:        data.telefono         || "",
          email:           data.email            || "",
          sexo:            data.sexo             || "",
        });
        const prev = data.prevision || "";
        if (prev.startsWith("Isapre")) {
          setPrevisionTipo("Isapre");
          setIsapre(prev.replace("Isapre - ", ""));
        } else {
          setPrevisionTipo(prev);
        }
        setMode("edit");
        setIsEditing(false);
        return;
      }

      if (res.status === 404) {
        setForm({
          rut: norm, nombre: "", apellidoPaterno: "", apellidoMaterno: "",
          fechaNacimiento: "", direccion: "", telefono: "", email: "", sexo: "",
        });
        setPrevisionTipo(""); setIsapre("");
        setMode("create");
        setIsEditing(true);
        return;
      }

      setError("Error al buscar. Intente nuevamente.");
    } catch { setError("Error de conexión."); }
    finally  { setLoading(false); }
  }

  function getPrevisionFinal() {
    if (previsionTipo === "Isapre") {
      const nombre = isapre === "Otra" ? otraIsapre : isapre;
      return nombre ? `Isapre - ${nombre}` : "Isapre";
    }
    return previsionTipo;
  }

  function buildPayload() {
    return {
      rut:              form.rut,
      nombre:           form.nombre.trim(),
      apellido_paterno: form.apellidoPaterno.trim(),
      apellido_materno: form.apellidoMaterno.trim(),
      fecha_nacimiento: form.fechaNacimiento,
      direccion:        form.direccion.trim(),
      telefono:         form.telefono.trim(),
      email:            form.email.trim(),
      prevision:        getPrevisionFinal(),
      sexo:             form.sexo,
    };
  }

  function validate() {
    if (!form.nombre)          { setError("Nombre es obligatorio");                   return false; }
    if (!form.apellidoPaterno) { setError("Apellido paterno es obligatorio");          return false; }
    if (!form.fechaNacimiento) { setError("Fecha de nacimiento es obligatoria");       return false; }
    if (!form.sexo)            { setError("Sexo es obligatorio");                      return false; }
    if (!form.email)           { setError("Email es obligatorio para notificaciones"); return false; }
    return true;
  }

  function handleConfirm() {
    onComplete?.(buildPayload());
  }

  async function handleSubmit() {
    setError(null);
    if (!validate()) return;
    const payload  = buildPayload();
    const isCreate = mode === "create";
    setLoading(true);
    try {
      const res = await fetch(
        isCreate
          ? `${API_URL}/api/registro/admin`
          : `${API_URL}/api/registro/admin/${encodeURIComponent(form.rut)}`,
        {
          method:  isCreate ? "POST" : "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body:    JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando");
      }
      setSuccess("Datos guardados");
      setIsEditing(false);
      setMode("edit");
      setTimeout(() => { setSuccess(null); onComplete?.(payload); }, 1200);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  const ro = mode === "edit" && !isEditing;

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Sus datos personales</h1>
          <p>
            {mode === "search"  && "Ingrese su RUT para continuar"}
            {mode === "create"  && "Complete sus datos"}
            {mode === "edit" && ro  && "Verifique sus datos"}
            {mode === "edit" && !ro && "Editando sus datos"}
          </p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {/* Búsqueda RUT */}
          <div className="dp-search">
            <input
              placeholder="Ingrese su RUT"
              value={rut}
              onChange={e => setRut(e.target.value)}
              onKeyDown={e => e.key === "Enter" && mode === "search" && handleSearch()}
              disabled={mode !== "search"}
            />
            {mode === "search" && (
              <button onClick={handleSearch} disabled={loading}>
                {loading ? "…" : "Buscar"}
              </button>
            )}
          </div>

          {error   && <div className="dp-error"   style={{ marginBottom: 12 }}>{error}</div>}
          {success && <div className="dp-success" style={{ marginBottom: 12 }}>{success}</div>}

          {(mode === "edit" || mode === "create") && (
            <>
              <p style={{
                fontSize: 12, fontWeight: 700, marginBottom: 16,
                color: mode === "create" ? "#16a34a" : "#475569",
              }}>
                {mode === "create" ? "✦ Nuevo paciente" : "✦ Paciente encontrado"}
              </p>

              <div className="dp-field">
                <label className="dp-field-label">Nombre *</label>
                <input className="dp-input" value={form.nombre} readOnly={ro}
                  placeholder="Juan" onChange={e => update("nombre", e.target.value)} />
              </div>

              <div className="dp-row">
                <div className="dp-field">
                  <label className="dp-field-label">Apellido paterno *</label>
                  <input className="dp-input" value={form.apellidoPaterno} readOnly={ro}
                    placeholder="González" onChange={e => update("apellidoPaterno", e.target.value)} />
                </div>
                <div className="dp-field">
                  <label className="dp-field-label">Apellido materno</label>
                  <input className="dp-input" value={form.apellidoMaterno} readOnly={ro}
                    placeholder="Pérez" onChange={e => update("apellidoMaterno", e.target.value)} />
                </div>
              </div>

              <div className="dp-row">
                <div className="dp-field">
                  <label className="dp-field-label">Fecha de nacimiento *</label>
                  <input type="date" className="dp-input" value={form.fechaNacimiento} readOnly={ro}
                    onChange={e => update("fechaNacimiento", e.target.value)} />
                </div>
                <div className="dp-field">
                  <label className="dp-field-label">Sexo *</label>
                  <select className="dp-input" value={form.sexo} disabled={ro}
                    onChange={e => update("sexo", e.target.value)}>
                    <option value="">Seleccionar…</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="dp-field">
                <label className="dp-field-label">Previsión</label>
                <select className="dp-input" value={previsionTipo} disabled={ro}
                  onChange={e => { setPrevisionTipo(e.target.value); setIsapre(""); }}>
                  <option value="">Seleccionar…</option>
                  <option value="Fonasa">Fonasa</option>
                  <option value="Isapre">Isapre</option>
                  <option value="Particular">Particular</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              {previsionTipo === "Isapre" && !ro && (
                <div className="dp-field">
                  <label className="dp-field-label">¿Cuál Isapre?</label>
                  <select className="dp-input" value={isapre}
                    onChange={e => setIsapre(e.target.value)}>
                    <option value="">Seleccionar…</option>
                    {ISAPRES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  {isapre === "Otra" && (
                    <input className="dp-input" style={{ marginTop: 8 }}
                      value={otraIsapre} placeholder="Nombre de su isapre"
                      onChange={e => setOtraIsapre(e.target.value)} />
                  )}
                </div>
              )}

              <div className="dp-field">
                <label className="dp-field-label">Email *</label>
                <input type="email" className="dp-input" value={form.email} readOnly={ro}
                  placeholder="correo@ejemplo.cl" onChange={e => update("email", e.target.value)} />
                {!ro && <span className="dp-hint">Le enviaremos recordatorios de sus evaluaciones</span>}
              </div>

              <div className="dp-field">
                <label className="dp-field-label">Teléfono</label>
                <input type="tel" className="dp-input" value={form.telefono} readOnly={ro}
                  placeholder="+56 9 1234 5678" onChange={e => update("telefono", e.target.value)} />
              </div>

              <div className="dp-field">
                <label className="dp-field-label">Dirección</label>
                <input className="dp-input" value={form.direccion} readOnly={ro}
                  placeholder="Calle 123, Ciudad" onChange={e => update("direccion", e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {ro ? (
                  <>
                    <button className="dp-btn-primary"   onClick={handleConfirm}>Confirmar →</button>
                    <button className="dp-btn-secondary" onClick={() => setIsEditing(true)}>Modificar</button>
                  </>
                ) : (
                  <>
                    <button className="dp-btn-primary" onClick={handleSubmit}
                      disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
                      {loading ? "Guardando…" : mode === "create" ? "Guardar y continuar →" : "Guardar cambios →"}
                    </button>
                    {mode === "edit" && (
                      <button className="dp-btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                    )}
                  </>
                )}
              </div>

            </>
          )}

        </div>
      </div>
    </div>
  );
}
