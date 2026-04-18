import { useState } from "react";
import "../styles/dashboard-pacientes.css";
import { normalizeRut, isValidRut } from "../utils/rut";

const API_URL = import.meta.env.VITE_API_URL;

const ISAPRES = [
  "Banmédica", "Colmena", "Cruz Blanca", "Cruz del Norte",
  "Esencial", "MasVida", "Río Blanco", "San Lorenzo",
  "Vida Tres", "Otra",
];

export default function RegistroAdminForm({ onTokenReady, token: tokenProp, onComplete }) {
  const [rutInput,      setRutInput]      = useState("");
  const [token,         setToken]         = useState(tokenProp || null);
  const [mode,          setMode]          = useState("search");
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

  async function handleSearch() {
    setError(null);
    const norm = normalizeRut(rutInput);
    if (!isValidRut(norm)) {
      setError("RUT inválido. Verifique su RUT y dígito verificador.");
      return;
    }

    setLoading(true);
    try {
      const authRes = await fetch(`${API_URL}/api/registro/auth/ingresar`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rut: norm }),
      });
      if (!authRes.ok) throw new Error("Error al autenticar");
      const authData = await authRes.json();
      const t = authData.token;
      setToken(t);
      onTokenReady?.(t);

      const res = await fetch(`${API_URL}/api/registro/admin/${encodeURIComponent(norm)}`, {
        headers: { "Authorization": `Bearer ${t}` }
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
        if (prev.startsWith("Isapre")) { setPrevisionTipo("Isapre"); setIsapre(prev.replace("Isapre - ", "")); }
        else { setPrevisionTipo(prev); }
        setMode("edit"); setIsEditing(false);
        return;
      }

      if (res.status === 404) {
        setForm({ rut: norm, nombre: "", apellidoPaterno: "", apellidoMaterno: "", fechaNacimiento: "", direccion: "", telefono: "", email: "", sexo: "" });
        setPrevisionTipo(""); setIsapre("");
        setMode("create"); setIsEditing(true);
        return;
      }

      setError("Error al buscar. Intente nuevamente.");
    } catch (e) { setError(e.message || "Error de conexión."); }
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
      rut: form.rut, nombre: form.nombre.trim(),
      apellido_paterno: form.apellidoPaterno.trim(),
      apellido_materno: form.apellidoMaterno.trim(),
      fecha_nacimiento: form.fechaNacimiento,
      direccion: form.direccion.trim(), telefono: form.telefono.trim(),
      email: form.email.trim(), prevision: getPrevisionFinal(), sexo: form.sexo,
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

  async function handleSubmit() {
    setError(null);
    if (!validate()) return;
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
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j?.detail || "Error guardando"); }
      setSuccess("Datos guardados");
      setIsEditing(false); setMode("edit");
      setTimeout(() => { setSuccess(null); onComplete?.(payload, token); }, 1200);
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
            {mode === "search"      && "Ingrese su RUT para continuar"}
            {mode === "create"      && "Nuevo registro — complete sus datos"}
            {mode === "edit" && ro  && "Paciente encontrado — verifique sus datos"}
            {mode === "edit" && !ro && "Editando sus datos"}
          </p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          <div className="registro-search">
            <input
              placeholder="RUT"
              value={rutInput}
              onChange={e => setRutInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? "…" : "🔍"}
            </button>
          </div>

          {error   && <div className="registro-error"   style={{ marginBottom: 12 }}>{error}</div>}
          {success && <div className="registro-success" style={{ marginBottom: 12 }}>{success}</div>}

          {(mode === "edit" || mode === "create") && (
            <div className="registro-form">

              <h3>{mode === "create" ? "Nuevo paciente" : isEditing ? "Editando" : "Paciente encontrado"}</h3>

              <input placeholder="Nombre *" value={form.nombre} readOnly={ro}
                onChange={e => update("nombre", e.target.value)} />

              <div className="registro-row">
                <input placeholder="Apellido paterno *" value={form.apellidoPaterno} readOnly={ro}
                  onChange={e => update("apellidoPaterno", e.target.value)} />
                <input placeholder="Apellido materno" value={form.apellidoMaterno} readOnly={ro}
                  onChange={e => update("apellidoMaterno", e.target.value)} />
              </div>

              <div className="registro-row">
                <input type="date" value={form.fechaNacimiento} readOnly={ro}
                  onChange={e => update("fechaNacimiento", e.target.value)} />
                <select value={form.sexo} disabled={ro}
                  onChange={e => update("sexo", e.target.value)}>
                  <option value="">Sexo *</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>

              <select value={previsionTipo} disabled={ro}
                onChange={e => { setPrevisionTipo(e.target.value); setIsapre(""); }}>
                <option value="">Previsión</option>
                <option value="Fonasa">Fonasa</option>
                <option value="Isapre">Isapre</option>
                <option value="Particular">Particular</option>
                <option value="Otra">Otra</option>
              </select>

              {previsionTipo === "Isapre" && (
                <>
                  <select value={isapre} disabled={ro}
                    onChange={e => setIsapre(e.target.value)}>
                    <option value="">¿Cuál Isapre? *</option>
                    {ISAPRES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  {isapre === "Otra" && (
                    <input placeholder="Nombre de su Isapre" value={otraIsapre} readOnly={ro}
                      onChange={e => setOtraIsapre(e.target.value)} />
                  )}
                </>
              )}

              <input type="email" placeholder="Email *" value={form.email} readOnly={ro}
                onChange={e => update("email", e.target.value)} />
              {!ro && <span className="registro-hint">Le enviaremos recordatorios de sus evaluaciones</span>}

              <input type="tel" placeholder="Teléfono" value={form.telefono} readOnly={ro}
                onChange={e => update("telefono", e.target.value)} />

              <input placeholder="Dirección" value={form.direccion} readOnly={ro}
                onChange={e => update("direccion", e.target.value)} />

              <div className="registro-actions">
                {ro ? (
                  <>
                    <button className="btn-primary" onClick={() => onComplete?.(buildPayload(), token)}>Confirmar →</button>
                    <button className="btn-danger"  onClick={() => setIsEditing(true)}>Modificar</button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}
                      style={{ opacity: loading ? 0.6 : 1 }}>
                      {loading ? "Guardando…" : mode === "create" ? "Guardar y continuar →" : "Guardar cambios →"}
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
