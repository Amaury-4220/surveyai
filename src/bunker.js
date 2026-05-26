// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 1: PROTOCOLO BÚNKER                        ║
// ║  Tokenización + Comunicación segura                         ║
// ║  © SurveyAI 2025 — Todos los derechos reservados           ║
// ╚══════════════════════════════════════════════════════════════╝

// ─── Token Generator (TTL 90 segundos) ───────────────────────
export function genToken() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${ts}.${rnd}`;
}

// ─── Device Fingerprint (único por dispositivo) ───────────────
export function getDeviceFingerprint() {
  let fp = localStorage.getItem("sai_fp");
  if (!fp) {
    fp = [
      navigator.userAgent.length,
      screen.width,
      screen.height,
      navigator.language,
      Date.now().toString(36),
    ].join("-");
    localStorage.setItem("sai_fp", fp);
  }
  return fp;
}

// ─── Tamper Detection ─────────────────────────────────────────
export function detectTampering() {
  try {
    if (window.fetch.toString().indexOf("native code") === -1) return true;
  } catch { return true; }
  return false;
}

// ─── Llamada segura al Agente Fantasma ───────────────────────
const AGENTE_URL = "/.netlify/functions/agente_fantasma";

export async function bunkerCall(accion, datos = {}) {
  if (detectTampering()) throw new Error("entorno_no_confiable");

  const token = genToken();
  const fp = getDeviceFingerprint();

  const res = await fetch(AGENTE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-FP": fp,
    },
    body: JSON.stringify({ accion, token, datos }),
  });

  if (res.status === 401) {
    const d = await res.json().catch(() => ({}));
    if (d.redirect) { window.location.href = d.redirect; return null; }
    throw new Error("sesion_expirada");
  }
  if (res.status === 403) throw new Error("acceso_denegado");
  if (res.status === 429) throw new Error("limite_excedido");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── API helpers ──────────────────────────────────────────────
export const Bunker = {
  login: (email, password) =>
    bunkerCall("login", { email, password }),

  generarEncuesta: (objetivo, sesiones, num_preguntas) =>
    bunkerCall("generar_encuesta", { objetivo, sesiones, num_preguntas }),

  registrarRespuesta: (payload) =>
    bunkerCall("registrar_respuesta", payload),

  generarLanding: (datos_producto) =>
    bunkerCall("generar_landing", { datos_producto }),

  verificarTrial: (deviceFp) =>
    bunkerCall("verificar_trial", { device_fp: deviceFp }),
};

// ─── Session Manager ──────────────────────────────────────────
export const Session = {
  get: () => {
    try {
      const token = localStorage.getItem("sai_session");
      const role = localStorage.getItem("sai_role");
      const trial = localStorage.getItem("sai_trial_expiry");
      if (!token) return null;
      return {
        token,
        role,
        isTrial: !!trial,
        trialExpiry: trial ? parseInt(trial) : null,
        isTrialExpired: trial ? Date.now() > parseInt(trial) : false,
      };
    } catch { return null; }
  },
  clear: () => {
    try {
      ["sai_session","sai_role","sai_trial_expiry"].forEach(k => localStorage.removeItem(k));
    } catch {}
  },
  isBlocked: () => {
    try { return localStorage.getItem("sai_device_blocked") === "true"; } catch { return false; }
  },
  block: () => {
    try { localStorage.setItem("sai_device_blocked","true"); } catch {}
  },
};
