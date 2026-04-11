import { useState } from "react";
import { isValidRut, normalizeRut } from "../../utils/rut";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * RegistroAdminForm
 * Formulario de datos personales del paciente para el registro nacional de prótesis.
 * Usa token JWT en vez de sesión interna.
 *
 * Props:
 *   token      — JWT del paciente (obligatorio)
 *   rut        — RUT ya validado al ingresar
 *   onComplete — fn(adminData) — llamado al guardar/confirmar
 */
export default function RegistroAdminForm({ token, rut: rutInicial, onComplete }) {
  const [mode,      setMode]      = useState("loading"); // loading | edit | create | confirm
  const [isEditing, setIsEditing] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(null);

  const [form, setForm] = useState({
    rut:              rutInicial || "",
    nombre:           "",
    apellidoPaterno:  "",
    apellidoMaterno:  "",
    fechaNacimiento:  "",
    direccion:        "",
    telefono:         "",
    email:            "",
    prevision:        "",
    sexo:             "",
  });

  // ── Cargar datos existentes al montar ───────────────────
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
        setMode("edit");
        setIsEditing(false);
      } else if (res.status === 404) {
        setForm(prev => ({ ...prev, rut: rutInicial }));
        setMode("create");
        setIsEditing(true);
      } else {
        setError("Error cargando sus datos. Intente nuevamente.");
        setMode("create");
        setIsEditing(true);
      }
    } catch {
      setError("Error de conexión.");
      setMode("create");
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    if (!isEditing && mode === "edit") return;
    setForm(prev => ({ ...prev, [field]: value }));
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
      prevision:        form.prevision.trim(),
      sexo:             form.sexo,
    };
  }

  function validate() {
    if (!form.nombre)          { setError("Nombre es obligatorio");            return false; }
    if (!form.apellidoPaterno) { setError("Apellido paterno es obligatorio");   return false; }
    if (!form.fechaNacimiento) { setError("Fecha de nacimiento es obligatoria"); return false; }
    if (!form.sexo)            { setError("Sexo es obligatorio");               return false; }
    if (!form.email)           { setError("Email es obligatorio para notificaciones"); return false; }
    return true;
  }

  // ── Confirmar sin cambios ────────────────────────────────
  function handleConfirm() {
    onComplete?.(buildPayload());
  }

  // ── Guardar nuevo o edición ──────────────────────────────
  async function handleSubmit() {
    setError(null);
    if (!validate()) return;

    const payload = buildPayload();
    setLoading(true);

    try {
      const isCreate = mode === "create";
      const res = await fetch(
        isCreate
          ? `${API_URL}/api/registro/admin`
          : `${API_URL}/api/registro/admin/${encodeURIComponent(form.rut)}`,
        {
          method:  isCreate ? "POST" : "PUT",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error guardando datos");
      }

      setSuccess("✓ Datos guardados correctamente");
      setIsEditing(false);
      setMode("edit");
      setTimeout(() => {
        setSuccess(null);
        onComplete?.(payload);
      }, 1200);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Loading inicial ──────────────────────────────────────
  if (mode === "loading") {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Cargando sus datos…</p>
      </div>
    );
  }

  const soloLectura = mode === "edit" && !isEditing;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>👤</div>
        <div>
          <div style={styles.headerTitle}>
            {mode === "create" ? "Sus datos personales" : "Sus datos personales"}
          </div>
          <div style={styles.headerSub}>
            {mode === "create"
              ? "Complete sus datos para continuar"
              : soloLectura
                ? "Verifique que sus datos estén correctos"
                : "Editando sus datos"}
          </div>
        </div>
      </div>

      {/* RUT — solo lectura siempre */}
      <div style={styles.field}>
        <label style={styles.label}>RUT</label>
        <input style={{ ...styles.input, background: "#f8fafc", color: "#64748b" }}
          value={form.rut} readOnly />
      </div>

      {error   && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.successMsg}>{success}</div>}

      {/* Nombre */}
      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Nombre *</label>
          <input style={soloLectura ? styles.inputRO : styles.input}
            value={form.nombre} readOnly={soloLectura}
            onChange={e => update("nombre", e.target.value)}
            placeholder="Juan" />
        </div>
      </div>

      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Apellido paterno *</label>
          <input style={soloLectura ? styles.inputRO : styles.input}
            value={form.apellidoPaterno} readOnly={soloLectura}
            onChange={e => update("apellidoPaterno", e.target.value)}
            placeholder="González" />
        </div>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Apellido materno</label>
          <input style={soloLectura ? styles.inputRO : styles.input}
            value={form.apellidoMaterno} readOnly={soloLectura}
            onChange={e => update("apellidoMaterno", e.target.value)}
            placeholder="Pérez" />
        </div>
      </div>

      {/* Fecha nacimiento + Sexo */}
      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Fecha de nacimiento *</label>
          <input type="date" style={soloLectura ? styles.inputRO : styles.input}
            value={form.fechaNacimiento} readOnly={soloLectura}
            onChange={e => update("fechaNacimiento", e.target.value)} />
        </div>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Sexo *</label>
          <select
            style={soloLectura ? styles.inputRO : styles.input}
            value={form.sexo}
            disabled={soloLectura}
            onChange={e => update("sexo", e.target.value)}
          >
            <option value="">Seleccionar…</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
          </select>
        </div>
      </div>

      {/* Previsión */}
      <div style={styles.field}>
        <label style={styles.label}>Previsión</label>
        <select
          style={soloLectura ? styles.inputRO : styles.input}
          value={form.prevision}
          disabled={soloLectura}
          onChange={e => update("prevision", e.target.value)}
        >
          <option value="">Seleccionar…</option>
          {["Fonasa A","Fonasa B","Fonasa C","Fonasa D","Isapre","Particular","Otra"].map(p =>
            <option key={p} value={p}>{p}</option>
          )}
        </select>
      </div>

      {/* Email */}
      <div style={styles.field}>
        <label style={styles.label}>Email *</label>
        <input type="email" style={soloLectura ? styles.inputRO : styles.input}
          value={form.email} readOnly={soloLectura}
          onChange={e => update("email", e.target.value)}
          placeholder="correo@ejemplo.cl" />
        {!soloLectura && (
          <span style={styles.hint}>Le enviaremos recordatorios de sus evaluaciones</span>
        )}
      </div>

      {/* Teléfono */}
      <div style={styles.field}>
        <label style={styles.label}>Teléfono</label>
        <input type="tel" style={soloLectura ? styles.inputRO : styles.input}
          value={form.telefono} readOnly={soloLectura}
          onChange={e => update("telefono", e.target.value)}
          placeholder="+56 9 1234 5678" />
      </div>

      {/* Dirección */}
      <div style={styles.field}>
        <label style={styles.label}>Dirección</label>
        <input style={soloLectura ? styles.inputRO : styles.input}
          value={form.direccion} readOnly={soloLectura}
          onChange={e => update("direccion", e.target.value)}
          placeholder="Calle 123, Ciudad" />
      </div>

      {/* Acciones */}
      <div style={styles.actions}>
        {soloLectura ? (
          <>
            <button style={styles.btnPrimary} onClick={handleConfirm}>
              Continuar →
            </button>
            <button style={styles.btnSecondary} onClick={() => setIsEditing(true)}>
              Editar
            </button>
          </>
        ) : (
          <button
            style={{ ...styles.btnPrimary, opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando…" : mode === "create" ? "Guardar y continuar →" : "Guardar cambios →"}
          </button>
        )}
      </div>

    </div>
  );
}

// ── Estilos inline — sin dependencia de CSS externo ─────────
const styles = {
  container: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  headerSub:   { fontSize: 12, color: "#64748b", marginTop: 2 },
  field: {
    marginBottom: 12,
  },
  row: {
    display: "flex", gap: 10,
  },
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#475569", textTransform: "uppercase",
    letterSpacing: "0.05em", marginBottom: 4,
  },
  hint: {
    fontSize: 11, color: "#94a3b8", marginTop: 3, display: "block",
  },
  input: {
    width: "100%", padding: "10px 12px",
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box", color: "#0f172a", background: "#fff",
  },
  inputRO: {
    width: "100%", padding: "10px 12px",
    border: "1px solid #f1f5f9", borderRadius: 8,
    fontSize: 14, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box", color: "#475569", background: "#f8fafc",
  },
  error: {
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", padding: "10px 12px", borderRadius: 8,
    fontSize: 13, marginBottom: 12,
  },
  successMsg: {
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    color: "#16a34a", padding: "10px 12px", borderRadius: 8,
    fontSize: 13, marginBottom: 12,
  },
  loading: {
    fontSize: 14, color: "#64748b", textAlign: "center", padding: 24,
  },
  actions: {
    display: "flex", gap: 8, marginTop: 20,
  },
  btnPrimary: {
    flex: 1, background: "#0f172a", color: "#fff",
    border: "none", borderRadius: 10, padding: "13px 0",
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSecondary: {
    flex: 1, background: "#fff", color: "#0f172a",
    border: "1px solid #e2e8f0", borderRadius: 10, padding: "13px 0",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit",
  },
};
