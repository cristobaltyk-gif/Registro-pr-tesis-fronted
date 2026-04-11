import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function normalizeRut(rut) {
  rut = rut.trim().toUpperCase().replace(/\./g, "").replace(/ /g, "");
  if (!rut.includes("-") && rut.length > 1) rut = rut.slice(0, -1) + "-" + rut.slice(-1);
  return rut;
}

function isValidRut(rut) {
  return /^\d{7,8}-[\dK]$/.test(normalizeRut(rut));
}

const PREVISIONES_BASE = ["Fonasa", "Particular", "Otra"];
const ISAPRES = [
  "Banmédica", "Colmena", "Cruz Blanca", "Cruz del Norte",
  "Esencial", "MasVida", "Río Blanco", "San Lorenzo",
  "Vida Tres", "Otra Isapre",
];

export default function RegistroAdminForm({ token, rut: rutInicial, onComplete }) {
  const [mode,         setMode]         = useState("loading");
  const [isEditing,    setIsEditing]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [success,      setSuccess]      = useState(null);
  const [previsionTipo, setPrevisionTipo] = useState(""); // Fonasa | Isapre | Particular | Otra
  const [isapre,       setIsapre]       = useState("");
  const [otraIsapre,   setOtraIsapre]   = useState("");

  const [form, setForm] = useState({
    rut:             rutInicial || "",
    nombre:          "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    direccion:       "",
    telefono:        "",
    email:           "",
    prevision:       "",
    sexo:            "",
  });

  useState(() => {
    if (!rutInicial || !token) { setMode("create"); setIsEditing(true); return; }
    loadAdmin();
  });

  async function loadAdmin() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/admin/${encodeURIComponent(rutInicial)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setForm({
          rut:             data.rut              || rutInicial,
          nombre:          data.nombre           || "",
          apellidoPaterno: data.apellido_paterno || "",
          apellidoMaterno: data.apellido_materno || "",
          fechaNacimiento: data.fecha_nacimiento || "",
          direccion:       data.direccion        || "",
          telefono:        data.telefono         || "",
          email:           data.email            || "",
          prevision:       data.prevision        || "",
          sexo:            data.sexo             || "",
        });
        // Parsear previsión guardada
        const prev = data.prevision || "";
        if (prev.startsWith("Isapre")) {
          setPrevisionTipo("Isapre");
          setIsapre(prev.replace("Isapre - ", ""));
        } else {
          setPrevisionTipo(prev);
        }
        setMode("edit"); setIsEditing(false);
      } else if (res.status === 404) {
        setForm(prev => ({ ...prev, rut: rutInicial }));
        setMode("create"); setIsEditing(true);
      } else {
        setMode("create"); setIsEditing(true);
      }
    } catch { setMode("create"); setIsEditing(true); }
    finally  { setLoading(false); }
  }

  function update(field, value) {
    if (!isEditing && mode === "edit") return;
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function getPrevisionFinal() {
    if (previsionTipo === "Isapre") {
      const nombre = isapre === "Otra Isapre" ? otraIsapre : isapre;
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

  function handleConfirm() { onComplete?.(buildPayload()); }

  async function handleSubmit() {
    setError(null);
    if (!validate()) return;
    const payload  = buildPayload();
    const isCreate = mode === "create";
    setLoading(true);
    try {
      const res = await fetch(
        isCreate ? `${API_URL}/api/registro/admin` : `${API_URL}/api/registro/admin/${encodeURIComponent(form.rut)}`,
        {
          method:  isCreate ? "POST" : "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body:    JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando datos");
      }
      setSuccess("Datos guardados correctamente");
      setIsEditing(false); setMode("edit");
      setTimeout(() => { setSuccess(null); onComplete?.(payload); }, 1200);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  if (mode === "loading") return <div className="dp-loading">Cargando sus datos…</div>;

  const ro = mode === "edit" && !isEditing;

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Sus datos personales</h1>
          <p>{mode === "create" ? "Complete sus datos para continuar" : ro ? "Verifique sus datos" : "Editando sus datos"}</p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {error   && <div className="dp-error"   style={{ marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: "#16a34a", fontSize: 13, marginBottom: 12, fontFamily: "'DM Sans', system-ui" }}>{success}</div>}

          {/* RUT */}
          <div className="dp-field">
            <p className="dp-field-label">RUT</p>
            <input className="dp-input" value={form.rut} readOnly
              style={{ background: "#f8fafc", color: "#64748b" }} />
          </div>

          {/* Nombre */}
          <div className="dp-field">
            <p className="dp-field-label">Nombre *</p>
            <input className="dp-input" value={form.nombre} readOnly={ro}
              placeholder="Juan" onChange={e => update("nombre", e.target.value)} />
          </div>

          {/* Apellidos */}
          <div style={{ display: "flex", gap: 10 }}>
            <div className="dp-field" style={{ flex: 1 }}>
              <p className="dp-field-label">Apellido paterno *</p>
              <input className="dp-input" value={form.apellidoPaterno} readOnly={ro}
                placeholder="González" onChange={e => update("apellidoPaterno", e.target.value)} />
            </div>
            <div className="dp-field" style={{ flex: 1 }}>
              <p className="dp-field-label">Apellido materno</p>
              <input className="dp-input" value={form.apellidoMaterno} readOnly={ro}
                placeholder="Pérez" onChange={e => update("apellidoMaterno", e.target.value)} />
            </div>
          </div>

          {/* Fecha + Sexo */}
          <div style={{ display: "flex", gap: 10 }}>
            <div className="dp-field" style={{ flex: 1 }}>
              <p className="dp-field-label">Fecha de nacimiento *</p>
              <input type="date" className="dp-input" value={form.fechaNacimiento} readOnly={ro}
                onChange={e => update("fechaNacimiento", e.target.value)} />
            </div>
            <div className="dp-field" style={{ flex: 1 }}>
              <p className="dp-field-label">Sexo *</p>
              <select className="dp-input" value={form.sexo} disabled={ro}
                onChange={e => update("sexo", e.target.value)}>
                <option value="">Seleccionar…</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
            </div>
          </div>

          {/* Previsión */}
          <div className="dp-field">
            <p className="dp-field-label">Previsión</p>
            <select className="dp-input" value={previsionTipo} disabled={ro}
              onChange={e => { setPrevisionTipo(e.target.value); setIsapre(""); }}>
              <option value="">Seleccionar…</option>
              <option value="Fonasa">Fonasa</option>
              <option value="Isapre">Isapre</option>
              <option value="Particular">Particular</option>
              <option value="Otra">Otra</option>
            </select>
          </div>

          {/* Si es Isapre → mostrar selector de cuál */}
          {previsionTipo === "Isapre" && !ro && (
            <div className="dp-field">
              <p className="dp-field-label">¿Cuál Isapre?</p>
              <select className="dp-input" value={isapre}
                onChange={e => setIsapre(e.target.value)}>
                <option value="">Seleccionar…</option>
                {ISAPRES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {isapre === "Otra Isapre" && (
                <input className="dp-input" style={{ marginTop: 8 }}
                  value={otraIsapre} placeholder="Escriba el nombre de su isapre"
                  onChange={e => setOtraIsapre(e.target.value)} />
              )}
            </div>
          )}

          {/* Email */}
          <div className="dp-field">
            <p className="dp-field-label">Email *</p>
            <input type="email" className="dp-input" value={form.email} readOnly={ro}
              placeholder="correo@ejemplo.cl" onChange={e => update("email", e.target.value)} />
            {!ro && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Le enviaremos recordatorios de sus evaluaciones</p>}
          </div>

          {/* Teléfono */}
          <div className="dp-field">
            <p className="dp-field-label">Teléfono</p>
            <input type="tel" className="dp-input" value={form.telefono} readOnly={ro}
              placeholder="+56 9 1234 5678" onChange={e => update("telefono", e.target.value)} />
          </div>

          {/* Dirección */}
          <div className="dp-field">
            <p className="dp-field-label">Dirección</p>
            <input className="dp-input" value={form.direccion} readOnly={ro}
              placeholder="Calle 123, Ciudad" onChange={e => update("direccion", e.target.value)} />
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {ro ? (
              <>
                <button className="dp-btn-primary" onClick={handleConfirm}>Continuar →</button>
                <button className="dp-btn-secondary" onClick={() => setIsEditing(true)}>Editar</button>
              </>
            ) : (
              <button className="dp-btn-primary" onClick={handleSubmit} disabled={loading}
                style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? "Guardando…" : mode === "create" ? "Guardar y continuar →" : "Guardar cambios →"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
          }
      
