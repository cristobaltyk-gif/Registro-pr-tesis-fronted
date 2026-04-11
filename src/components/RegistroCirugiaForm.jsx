import { useEffect, useState } from "react";
import "../styles/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegistroCirugiaForm({ token, onComplete }) {
  const [catalogo, setCatalogo] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  const [form, setForm] = useState({
    fecha_cirugia: "", tipo_protesis: "", lado: "", indicacion: "",
    abordaje: "", fijacion: "", marca_implante: "", modelo_implante: "",
    numero_serie: "", nombre_cirujano: "", rut_cirujano: "",
    nombre_clinica: "", ciudad_clinica: "", region_clinica: "",
    prevision: "", notas: "",
  });

  useEffect(() => {
    async function loadCatalogo() {
      setLoading(true);
      try {
        const res  = await fetch(`${API_URL}/api/registro/cirugia/catalogo`);
        const data = res.ok ? await res.json() : null;
        setCatalogo(data);
      } catch { setError("Error cargando opciones. Recargue la página."); }
      finally  { setLoading(false); }
    }
    loadCatalogo();
  }, []);

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  function validate() {
    if (!form.fecha_cirugia)   { setError("Fecha de cirugía es obligatoria");    return false; }
    if (!form.tipo_protesis)   { setError("Tipo de prótesis es obligatorio");     return false; }
    if (!form.lado)            { setError("Lado operado es obligatorio");         return false; }
    if (!form.indicacion)      { setError("Indicación clínica es obligatoria");   return false; }
    if (!form.nombre_cirujano) { setError("Nombre del cirujano es obligatorio");  return false; }
    if (!form.nombre_clinica)  { setError("Nombre de la clínica es obligatorio"); return false; }
    if (!form.ciudad_clinica)  { setError("Ciudad de la clínica es obligatoria"); return false; }
    return true;
  }

  async function handleSubmit() {
    setError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/registro/cirugia`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j?.detail || "Error guardando"); }
      const data = await res.json();
      setSuccess("Cirugía registrada correctamente");
      setTimeout(() => { setSuccess(null); onComplete?.(data); }, 1200);
    } catch (e) { setError(e.message); }
    finally     { setSaving(false); }
  }

  const mostrarAbordaje = form.tipo_protesis?.toLowerCase().includes("cadera");

  if (loading || !catalogo) return <div className="dp-loading">Cargando formulario…</div>;

  return (
    <div className="dp-root">
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>Datos de su cirugía</h1>
          <p>Complete la información de su operación</p>
        </div>
      </div>

      <div className="dp-content">

        {error   && <div className="dp-error"   style={{ marginBottom: 12 }}>{error}</div>}
        {success && <div className="dp-success" style={{ marginBottom: 12 }}>{success}</div>}

        {/* Cirugía */}
        <div className="dp-card">
          <div className="dp-section-title">📅 Datos de la cirugía</div>

          <div className="dp-field">
            <p className="dp-field-label">Fecha de cirugía *</p>
            <input type="date" className="dp-input" value={form.fecha_cirugia}
              onChange={e => update("fecha_cirugia", e.target.value)} />
          </div>

          <div className="dp-row">
            <div className="dp-field">
              <p className="dp-field-label">Tipo de prótesis *</p>
              <select className="dp-input" value={form.tipo_protesis}
                onChange={e => update("tipo_protesis", e.target.value)}>
                <option value="">Seleccionar…</option>
                {catalogo.tipos_protesis.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="dp-field">
              <p className="dp-field-label">Lado operado *</p>
              <select className="dp-input" value={form.lado}
                onChange={e => update("lado", e.target.value)}>
                <option value="">Seleccionar…</option>
                {catalogo.lados.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="dp-field">
            <p className="dp-field-label">Indicación *</p>
            <select className="dp-input" value={form.indicacion}
              onChange={e => update("indicacion", e.target.value)}>
              <option value="">Seleccionar…</option>
              {catalogo.indicaciones.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {mostrarAbordaje && (
            <div className="dp-field">
              <p className="dp-field-label">Abordaje quirúrgico</p>
              <select className="dp-input" value={form.abordaje}
                onChange={e => update("abordaje", e.target.value)}>
                <option value="">Seleccionar…</option>
                {catalogo.abordajes_cadera.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          <div className="dp-field">
            <p className="dp-field-label">Previsión</p>
            <select className="dp-input" value={form.prevision}
              onChange={e => update("prevision", e.target.value)}>
              <option value="">Seleccionar…</option>
              {catalogo.previsiones.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Implante */}
        <div className="dp-card">
          <div className="dp-section-title">🔩 Datos del implante</div>
          <p className="dp-hint" style={{ marginBottom: 12 }}>Si no recuerda los datos, puede dejarlos en blanco.</p>

          <div className="dp-field">
            <p className="dp-field-label">Fijación</p>
            <select className="dp-input" value={form.fijacion}
              onChange={e => update("fijacion", e.target.value)}>
              <option value="">Seleccionar…</option>
              {catalogo.fijaciones.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="dp-row">
            <div className="dp-field">
              <p className="dp-field-label">Marca</p>
              <input className="dp-input" value={form.marca_implante}
                placeholder="Ej: Zimmer, Stryker"
                onChange={e => update("marca_implante", e.target.value)} />
            </div>
            <div className="dp-field">
              <p className="dp-field-label">Modelo</p>
              <input className="dp-input" value={form.modelo_implante}
                placeholder="Modelo del implante"
                onChange={e => update("modelo_implante", e.target.value)} />
            </div>
          </div>

          <div className="dp-field">
            <p className="dp-field-label">Número de serie</p>
            <input className="dp-input" value={form.numero_serie}
              placeholder="Si lo tiene en la tarjeta del implante"
              onChange={e => update("numero_serie", e.target.value)} />
          </div>
        </div>

        {/* Cirujano */}
        <div className="dp-card">
          <div className="dp-section-title">👨‍⚕️ Cirujano</div>
          <div className="dp-field">
            <p className="dp-field-label">Nombre del cirujano *</p>
            <input className="dp-input" value={form.nombre_cirujano}
              placeholder="Dr. Juan González"
              onChange={e => update("nombre_cirujano", e.target.value)} />
          </div>
          <div className="dp-field">
            <p className="dp-field-label">RUT del cirujano</p>
            <input className="dp-input" value={form.rut_cirujano}
              placeholder="12345678-9 (opcional)"
              onChange={e => update("rut_cirujano", e.target.value)} />
          </div>
        </div>

        {/* Clínica */}
        <div className="dp-card">
          <div className="dp-section-title">🏥 Clínica / Hospital</div>
          <div className="dp-field">
            <p className="dp-field-label">Nombre del centro *</p>
            <input className="dp-input" value={form.nombre_clinica}
              placeholder="Ej: Hospital Regional, Clínica Las Condes"
              onChange={e => update("nombre_clinica", e.target.value)} />
          </div>
          <div className="dp-row">
            <div className="dp-field">
              <p className="dp-field-label">Ciudad *</p>
              <input className="dp-input" value={form.ciudad_clinica}
                placeholder="Ej: Santiago, Curicó"
                onChange={e => update("ciudad_clinica", e.target.value)} />
            </div>
            <div className="dp-field">
              <p className="dp-field-label">Región</p>
              <input className="dp-input" value={form.region_clinica}
                placeholder="Ej: Maule"
                onChange={e => update("region_clinica", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="dp-card">
          <div className="dp-field">
            <p className="dp-field-label">Notas adicionales</p>
            <textarea className="dp-input" style={{ minHeight: 80, resize: "vertical" }}
              value={form.notas} placeholder="Información adicional…"
              onChange={e => update("notas", e.target.value)} />
          </div>
        </div>

        <button className="dp-btn-primary" onClick={handleSubmit}
          disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? "Guardando…" : "Guardar y continuar →"}
        </button>

      </div>
    </div>
  );
}
