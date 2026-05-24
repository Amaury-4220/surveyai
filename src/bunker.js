
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         SURVEYAI — BUNKER CLIENT                            ║
 * ║         Capa B — Mensajero del frontend                     ║
 * ║         Genera token temporal + habla con agente_fantasma   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const AGENTE_URL = "/.netlify/functions/agente_fantasma";

// ─── Genera token temporal con TTL 90s ────────────────
function generateToken() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${ts}.${rnd}`;
}

// ─── Detecta intentos de interceptar el fetch ─────────
function detectTampering() {
  try {
    if (window.fetch.toString().indexOf("native code") === -1) {
      console.warn("[SurveyAI] Entorno no confiable detectado");
      return true;
    }
  } catch { return true; }
  return false;
}

// ─── Llamada segura al agente fantasma ───────────────
export async function agenteCall(accion, datos = {}) {
  if (detectTampering()) {
    throw new Error("sesion_invalida");
  }

  const token = generateToken();

  const response = await fetch(AGENTE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accion, token, datos }),
  });

  // Sesión expirada — redirigir
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.redirect) {
      window.location.href = data.redirect;
      return null;
    }
    throw new Error("sesion_expirada");
  }

  // Origen no autorizado
  if (response.status === 403) {
    throw new Error("acceso_denegado");
  }

  // Rate limit
  if (response.status === 429) {
    throw new Error("limite_excedido");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Helpers específicos por acción ──────────────────
export const Bunker = {
  login: (email, password) =>
    agenteCall("login", { email, password }),

  generarEncuesta: (objetivo, idioma = "es", num_preguntas = 5) =>
    agenteCall("generar_encuesta", { objetivo, idioma, num_preguntas }),

  registrarRespuesta: (payload) =>
    agenteCall("registrar_respuesta", payload),
};
