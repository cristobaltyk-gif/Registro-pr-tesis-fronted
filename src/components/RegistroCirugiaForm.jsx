import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function RegistroCirugiaForm({ token, onComplete }) {
  const [catalogo, setCatalogo] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  const [form, setForm] = useState({
    fecha_cirugia:    "",
    tipo_protesis:    "",
    lado:             "",
    indicacion:       "",
    abordaje:         "",
    fijacion:         "",
    marca_implante:   "",
    modelo_implante:  "",
    numero_serie:     "",
    nombre_cirujano:  "",
    rut_cirujano:     "",
    nombre_clinica:   "",
    ciudad_clinica:   "",
    region_clinica:   "",
    prevision:        "",
    notas:            "",
  });

  useEffect(() => {
    async function loadCatalogo() {
      setLoading(true);
      try {
        const res  = await fetch(`${API_URL}/api/registro/cirugia/catalogo`);
        const data = res.ok ? await res.json() : null;
        setCatalogo(data);
      } catch {
        setError("Error cargando opciones. Recargue la página.");
      } finally {
        setLoading(false);
      }
    }
    loadCatalogo();
  }, []);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

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
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando cirugía");
      }
      const data = await res.json();
      setSuccess("Cirugía registrada correctamente");
      setTimeout(() => { setSuccess(null); onComplete?.(data); }, 1200);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const mostrarAbordaje = form.tipo_protesis?.toLowerCase().includes("cadera");

  if (loading || !catalogo) return <p style={styles.loading}>Cargando formulario...</p>;

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div style={styles.headerIcon}>🦴</div>
        <div>
          <div style={styles.headerTitle}>Datos de su cirugía</div>
          <div style={styles.headerSub}>Complete la información de su operación</div>
        </div>
      </div>

      {error   && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.successMsg}>{success}</div>}

      {/* Cirugía */}
      <div style={styles.seccion}>
        <div style={styles.seccionTitulo}>📅 Datos de la cirugía</div>

        <div style={styles.field}>
          <label style={styles.label}>Fecha de cirugía *</label>
          <input type="date" style={styles.input} value={form.fecha_cirugia}
            onChange={e => update("fecha_cirugia", e.target.value)} />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Tipo de prótesis *</label>
            <select style={styles.input} value={form.tipo_protesis}
              onChange={e => update("tipo_protesis", e.target.value)}>
              <option value="">Seleccionar...</option>
              {catalogo.tipos_protesis.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Lado operado *</label>
            <select style={styles.input} value={form.lado}
              onChange={e => update("lado", e.target.value)}>
              <option value="">Seleccionar...</option>
              {catalogo.lados.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Indicación *</label>
          <select style={styles.input} value={form.indicacion}
            onChange={e => update("indicacion", e.target.value)}>
            <option value="">Seleccionar...</option>
            {catalogo.indicaciones.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        {mostrarAbordaje && (
          <div style={styles.field}>
            <label style={styles.label}>Abordaje quirúrgico</label>
            <select style={styles.input} value={form.abordaje}
              onChange={e => update("abordaje", e.target.value)}>
              <option value="">Seleccionar...</option>
              {catalogo.abordajes_cadera.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Previsión</label>
          <select style={styles.input} value={form.prevision}
            onChange={e => update("prevision", e.target.value)}>
            <option value="">Seleccionar...</option>
            {catalogo.previsiones.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Implante */}
      <div style={styles.seccion}>
        <div style={styles.seccionTitulo}>🔩 Datos del implante</div>
        <div style={styles.hint}>Si no recuerda los datos exactos, puede dejarlos en blanco.</div>

        <div style={styles.field}>
          <label style={styles.label}>Fijación</label>
          <select style={styles.input} value={form.fijacion}
            onChange={e => update("fijacion", e.target.value)}>
            <option value="">Seleccionar...</option>
            {catalogo.fijaciones.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Marca</label>
            <input style={styles.input} value={form.marca_implante}
              placeholder="Ej: Zimmer, Stryker"
              onChange={e => update("marca_implante", e.target.value)} />
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Modelo</label>
            <input style={styles.input} value={form.modelo_implante}
              placeholder="Modelo del implante"
              onChange={e => update("modelo_implante", e.target.value)} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Número de serie</label>
          <input style={styles.input} value={form.numero_serie}
            placeholder="Si lo tiene en la tarjeta del implante"
            onChange={e => update("numero_serie", e.target.value)} />
        </div>
      </div>

      {/* Cirujano */}
      <div style={styles.seccion}>
        <div style={styles.seccionTitulo}>👨‍⚕️ Cirujano</div>
        <div style={styles.field}>
          <label style={styles.label}>Nombre del cirujano *</label>
          <input style={styles.input} value={form.nombre_cirujano}
            placeholder="Dr. Juan González"
            onChange={e => update("nombre_cirujano", e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>RUT del cirujano</label>
          <input style={styles.input} value={form.rut_cirujano}
            placeholder="12345678-9 (opcional)"
            onChange={e => update("rut_cirujano", e.target.value)} />
        </div>
      </div>

      {/* Clínica */}
      <div style={styles.seccion}>
        <div style={styles.seccionTitulo}>🏥 Clínica / Hospital</div>
        <div style={styles.field}>
          <label style={styles.label}>Nombre del centro *</label>
          <input style={styles.input} value={form.nombre_clinica}
            placeholder="Ej: Hospital Regional, Clínica Las Condes"
            onChange={e => update("nombre_clinica", e.target.value)} />
        </div>
        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Ciudad *</label>
            <input style={styles.input} value={form.ciudad_clinica}
              placeholder="Ej: Santiago, Curicó"
              onChange={e => update("ciudad_clinica", e.target.value)} />
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Región</label>
            <input style={styles.input} value={form.region_clinica}
              placeholder="Ej: Maule"
              onChange={e => update("region_clinica", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div style={styles.field}>
        <label style={styles.label}>Notas adicionales</label>
        <textarea style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
          value={form.notas}
          placeholder="Cualquier información adicional..."
          onChange={e => update("notas", e.target.value)} />
      </div>

      <button
        style={{ ...styles.btnPrimary, opacity: saving ? 0.6 : 1 }}
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? "Guardando..." : "Guardar y continuar →"}
      </button>

    </div>
  );
}

const styles = {
  container:    { width: "100%", maxWidth: 520, margin: "0 auto", fontFamily: "'DM Sans', system-ui, sans-serif" },
  header:       { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  headerIcon:   { fontSize: 28 },
  headerTitle:  { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  headerSub:    { fontSize: 12, color: "#64748b", marginTop: 2 },
  seccion:      { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", marginBottom: 16 },
  seccionTitulo:{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 },
  field:        { marginBottom: 12 },
  row:          { display: "flex", gap: 10 },
  label:        { display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
  hint:         { fontSize: 11, color: "#94a3b8", marginBottom: 10 },
  input:        { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", color: "#0f172a", background: "#fff" },
  error:        { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 },
  successMsg:   { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 },
  loading:      { fontSize: 14, color: "#64748b", textAlign: "center", padding: 24 },
  btnPrimary:   { width: "100%", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 },
};
        
