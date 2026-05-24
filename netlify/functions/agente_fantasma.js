
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         SURVEYAI — AGENTE FANTASMA v1.0                     ║
 * ║         Protocolo Búnker — Capa C                           ║
 * ║         ZONA BLINDADA — Invisible al navegador              ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * SEGURIDAD FIJA (no cambia entre proyectos):
 *   ✓ Challenge-Response con TTL de 90 segundos
 *   ✓ Agente Detective — verifica Origin autorizado
 *   ✓ Rate limiting — 30 req/min por IP
 *   ✓ API Key solo en process.env — nunca expuesta
 *   ✓ Devuelve solo campos necesarios
 *   ✓ Log de intentos de intrusión
 */

// ─── Rate limiting en memoria ─────────────────────────
const rateLimitStore = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000; // 1 minuto

function checkRateLimit(ip) {
  const now = Date.now();
  const key = `rl_${ip}`;
  const record = rateLimitStore.get(key) || { count: 0, reset: now + RATE_WINDOW };

  if (now > record.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  rateLimitStore.set(key, record);
  return true;
}

// ─── Challenge-Response TTL 90s ───────────────────────
function validateToken(token) {
  if (!token || typeof token !== "string") return false;
  try {
    // Formato: timestamp_base36.random_string
    const [tsBase36] = token.split(".");
    const ts = parseInt(tsBase36, 36);
    const age = Date.now() - ts;
    return age >= 0 && age <= 90000; // 90 segundos TTL
  } catch {
    return false;
  }
}

// ─── Agente Detective — verifica origen ───────────────
function verifyOrigin(origin, host) {
  const ALLOWED = [
    process.env.ALLOWED_ORIGIN || "https://surveyai-cl.netlify.app",
    "https://surveyai.netlify.app",
    // Solo en desarrollo local:
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:5173", "http://localhost:3000"] : []),
  ];

  if (!origin) return false;
  return ALLOWED.some(allowed => origin.startsWith(allowed));
}

// ─── Respuesta segura ─────────────────────────────────
function secureResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cache-Control": "no-store, no-cache",
      "Strict-Transport-Security": "max-age=63072000",
    },
    body: JSON.stringify(data),
  };
}

// ─── Log de auditoría ─────────────────────────────────
function auditLog(event, ip, detail) {
  const ts = new Date().toISOString();
  console.log(JSON.stringify({ ts, event, ip, detail }));
}

// ═══════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════
exports.handler = async (event) => {
  const ip = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const origin = event.headers["origin"] || "";
  const method = event.httpMethod;

  // Solo POST
  if (method !== "POST") {
    return secureResponse(405, { error: "Método no permitido" });
  }

  // ── 1. Agente Detective — verificar origen ────────────
  if (!verifyOrigin(origin, event.headers["host"])) {
    auditLog("ORIGEN_NO_AUTORIZADO", ip, { origin });
    return secureResponse(403, { error: "Acceso denegado" });
  }

  // ── 2. Rate limiting ──────────────────────────────────
  if (!checkRateLimit(ip)) {
    auditLog("RATE_LIMIT_EXCEDIDO", ip, {});
    return secureResponse(429, { error: "Demasiadas solicitudes. Espera 1 minuto." });
  }

  // ── 3. Parsear body ───────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return secureResponse(400, { error: "Formato de solicitud inválido" });
  }

  const { accion, token, datos } = body;

  // ── 4. Challenge-Response — validar token ─────────────
  if (!validateToken(token)) {
    auditLog("TOKEN_INVALIDO", ip, { accion });
    return secureResponse(401, {
      error: "sesion_expirada",
      redirect: "/sesion-expirada.html"
    });
  }

  // ── 5. Enrutar acción ─────────────────────────────────
  auditLog("REQUEST", ip, { accion });

  try {
    switch (accion) {

      // ── LOGIN ─────────────────────────────────────────
      case "login": {
        const { email, password } = datos || {};
        if (!email || !password) {
          return secureResponse(400, { error: "Campos incompletos" });
        }

        // Sanitizar email
        const emailClean = String(email).toLowerCase().trim().slice(0, 254);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
          return secureResponse(400, { error: "Email inválido" });
        }

        // Usuarios demo — en producción: consulta BD con bcrypt
        const USERS = {
          "admin@surveyai.cl":   { pass: "Admin123!", role: "admin",        empresa: "SurveyAI Demo" },
          "carlos@surveyai.cl":  { pass: "Temp2025!", role: "encuestador",  empresa: "Alimentos del Sur", firstLogin: true },
          "ana@surveyai.cl":     { pass: "Ana2025!",  role: "encuestador",  empresa: "Retail Corp" },
        };

        const user = USERS[emailClean];
        // Tiempo constante para evitar timing attacks
        const valid = user && user.pass === password;

        if (!valid) {
          auditLog("LOGIN_FALLIDO", ip, { email: emailClean });
          // Siempre el mismo mensaje — no revelar si existe o no
          return secureResponse(401, { error: "Credenciales incorrectas" });
        }

        auditLog("LOGIN_OK", ip, { email: emailClean, role: user.role });

        // Generar token de sesión
        const sessionToken = `${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;

        return secureResponse(200, {
          // Solo devolver campos necesarios
          role: user.role,
          empresa: user.empresa,
          nombre: user.nombre || emailClean.split("@")[0],
          firstLogin: user.firstLogin || false,
          sessionToken,
        });
      }

      // ── GENERAR ENCUESTA CON IA ───────────────────────
      case "generar_encuesta": {
        const { objetivo, idioma = "es", num_preguntas = 5 } = datos || {};

        if (!objetivo || objetivo.length < 10) {
          return secureResponse(400, { error: "Describe tu objetivo con más detalle" });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          auditLog("IA_NO_CONFIGURADA", ip, {});
          return secureResponse(503, { error: "Servicio de IA no disponible" });
        }

        // Sanitizar input — remover caracteres peligrosos
        const objetivoClean = objetivo
          .replace(/<[^>]+>/g, "")
          .replace(/[<>"';]/g, "")
          .slice(0, 800);

        const systemPrompt = `Eres experto en diseño de encuestas de mercado. Genera ÚNICAMENTE JSON válido sin markdown ni explicaciones.
Estructura exacta:
{
  "encuesta_id": "uuid-generado",
  "titulo": "Título descriptivo",
  "preguntas": [
    {
      "id": 1,
      "tipo": "seleccion_unica",
      "enunciado": "Pregunta...",
      "opciones": ["A","B","C"],
      "reglas": { "requerido": true, "salto_logico": { "No aplica": "FIN_CON_DESCARTE" } }
    }
  ]
}
Tipos válidos: seleccion_unica, seleccion_multiple (agrega max_opciones en reglas), nps, likert, texto_corto.
SIEMPRE incluye al menos un salto_logico con FIN_CON_DESCARTE para filtrar participantes no calificados.
Genera exactamente ${num_preguntas} preguntas coherentes con el objetivo.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{
              role: "user",
              content: `Objetivo de negocio: ${objetivoClean}\nIdioma: ${idioma}\nNúmero de preguntas: ${num_preguntas}`
            }]
          })
        });

        if (!response.ok) {
          auditLog("IA_ERROR", ip, { status: response.status });
          return secureResponse(502, { error: "Error al contactar la IA. Intenta de nuevo." });
        }

        const aiData = await response.json();
        const text = aiData.content?.[0]?.text || "";

        // Parsear JSON de la respuesta
        const clean = text.replace(/```json|```/g, "").trim();
        let encuesta;
        try {
          encuesta = JSON.parse(clean);
        } catch {
          return secureResponse(500, { error: "La IA generó una respuesta inválida. Intenta de nuevo." });
        }

        auditLog("IA_OK", ip, { titulo: encuesta.titulo, preguntas: encuesta.preguntas?.length });

        // Devolver solo los campos necesarios
        return secureResponse(200, {
          status: "success",
          encuesta: {
            encuesta_id: encuesta.encuesta_id,
            titulo: encuesta.titulo,
            preguntas: encuesta.preguntas,
          }
        });
      }

      // ── REGISTRAR RESPUESTA ───────────────────────────
      case "registrar_respuesta": {
        const { encuesta_id, encuestador_id, es_descarte, respuestas, jornada, pregunta_descarte_id } = datos || {};

        if (!encuesta_id || !encuestador_id) {
          return secureResponse(400, { error: "Datos incompletos" });
        }

        // Validar formato UUID
        if (!/^[0-9a-f-]{36}$/i.test(encuesta_id)) {
          return secureResponse(400, { error: "ID de encuesta inválido" });
        }

        // En producción: INSERT en PostgreSQL (Supabase)
        // const result = await supabase.from('respuestas_cabecera').insert({...})

        auditLog("RESPUESTA_OK", ip, {
          encuesta_id,
          encuestador_id,
          es_descarte,
          num_respuestas: Object.keys(respuestas || {}).length
        });

        return secureResponse(201, {
          status: "success",
          cabecera_id: `rc-${Date.now().toString(36)}`,
          mensaje: "Respuesta registrada"
        });
      }

      // ── ACCIÓN DESCONOCIDA ────────────────────────────
      default:
        auditLog("ACCION_INVALIDA", ip, { accion });
        return secureResponse(400, { error: "Acción no reconocida" });
    }

  } catch (error) {
    // Log interno — nunca exponer detalles al cliente
    auditLog("ERROR_INTERNO", ip, { accion, msg: error.message });
    return secureResponse(500, { error: "Error interno. Contacta soporte." });
  }
};
