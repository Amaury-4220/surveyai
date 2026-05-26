// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — AGENTE FANTASMA v2.0                            ║
// ║  Protocolo Búnker — Zona Blindada                           ║
// ║  TODAS las APIs externas pasan por aquí                     ║
// ║  © SurveyAI 2025 — Todos los derechos reservados           ║
// ╚══════════════════════════════════════════════════════════════╝

const rateStore = new Map();
const trialStore = new Map();

function checkRate(ip, max=30, window=60000) {
  const now = Date.now();
  const r = rateStore.get(ip) || { count:0, reset: now+window };
  if (now > r.reset) { rateStore.set(ip,{count:1,reset:now+window}); return true; }
  if (r.count >= max) return false;
  r.count++; rateStore.set(ip,r); return true;
}

function validateToken(token) {
  if (!token || typeof token !== "string") return false;
  try {
    const ts = parseInt(token.split(".")[0], 36);
    const age = Date.now() - ts;
    return age >= 0 && age <= 90000;
  } catch { return false; }
}

function verifyOrigin(origin) {
  const allowed = [
    process.env.ALLOWED_ORIGIN || "https://surveyai-cl.netlify.app",
    ...(process.env.NODE_ENV==="development"?["http://localhost:5173","http://localhost:3000"]:[]),
  ];
  return allowed.some(a => (origin||"").startsWith(a));
}

function res(status, data) {
  return {
    statusCode: status,
    headers: {
      "Content-Type":"application/json",
      "X-Content-Type-Options":"nosniff",
      "X-Frame-Options":"DENY",
      "Cache-Control":"no-store",
      "Strict-Transport-Security":"max-age=63072000",
    },
    body: JSON.stringify(data),
  };
}

function log(event, ip, detail) {
  console.log(JSON.stringify({ts:new Date().toISOString(),event,ip,detail}));
}

exports.handler = async (event) => {
  const ip = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const origin = event.headers["origin"] || "";

  if (event.httpMethod !== "POST") return res(405,{error:"Método no permitido"});
  if (!verifyOrigin(origin)) { log("ORIGEN_BLOQUEADO",ip,{origin}); return res(403,{error:"Acceso denegado"}); }
  if (!checkRate(ip)) { log("RATE_LIMIT",ip,{}); return res(429,{error:"Demasiadas solicitudes"}); }

  let body;
  try { body = JSON.parse(event.body||"{}"); } catch { return res(400,{error:"Formato inválido"}); }

  const { accion, token, datos } = body;
  if (!validateToken(token)) {
    log("TOKEN_INVALIDO",ip,{accion});
    return res(401,{error:"sesion_expirada",redirect:"/sesion-expirada.html"});
  }

  log("REQUEST",ip,{accion});

  try {
    switch(accion) {

      case "login": {
        const { email, password } = datos || {};
        if (!email || !password) return res(400,{error:"Campos requeridos"});
        const emailClean = String(email).toLowerCase().trim();

        // Demo users — en producción: Firebase Auth
        const USERS = {
          "admin@surveyai.cl": { pass:"Admin123!", role:"mandante", empresa:"SurveyAI Demo", isTrial:false },
          "carlos@surveyai.cl": { pass:"Temp2025!", role:"encuestador", empresa:"Alimentos del Sur", firstLogin:true },
          "demo@surveyai.cl": { pass:"Demo2025!", role:"mandante", empresa:"Demo Corp", isTrial:true },
        };
        const user = USERS[emailClean];
        const valid = user && user.pass === password;
        if (!valid) { log("LOGIN_FAIL",ip,{email:emailClean}); return res(401,{error:"Credenciales incorrectas"}); }
        const sessionToken = `${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
        log("LOGIN_OK",ip,{email:emailClean,role:user.role});
        return res(200,{
          sessionToken, role:user.role, empresa:user.empresa,
          firstLogin:user.firstLogin||false, isTrial:user.isTrial||false,
        });
      }

      case "generar_encuesta": {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return res(503,{error:"IA no configurada"});
        const { objetivo, sesiones=3, num_preguntas=10 } = datos || {};
        if (!objetivo || objetivo.length < 10) return res(400,{error:"Describe tu objetivo con más detalle"});

        const objetivoClean = String(objetivo).replace(/<[^>]+>/g,"").replace(/[<>"]/g,"").slice(0,800);

        const system = `Eres un orquestador de investigación de mercado con 5 agentes especializados.
Genera ÚNICAMENTE JSON válido sin markdown.

ESTRUCTURA EXACTA:
{
  "encuesta_id": "uuid-v4",
  "titulo": "Título del estudio",
  "objetivo_negocio": "El objetivo descrito",
  "metodologia": "IAT+Conjoint+Anclaje",
  "sesiones": [
    {
      "sesion": 1,
      "nombre": "Screening + Asociación Implícita",
      "descripcion": "...",
      "preguntas": [
        {
          "id": 1,
          "tipo": "seleccion_unica",
          "metodologia": "IAT",
          "enunciado": "...",
          "opciones": ["A","B","C"],
          "tiempo_max_ms": 3000,
          "reglas": {
            "requerido": true,
            "salto_logico": {"No aplica": "FIN_CON_DESCARTE"}
          }
        }
      ]
    }
  ]
}

SESIONES (${sesiones} en total, ${num_preguntas} preguntas distribuidas):
1. Screening + IAT (${Math.ceil(num_preguntas/sesiones)} preguntas)
2. Dolor y comportamiento actual
3. Experimento Conjoint (elección forzada)
4. Propuesta de valor + Anclaje
5. Intención de compra real + Lista de espera

Tipos válidos: seleccion_unica, seleccion_multiple, conjoint, iat, texto_corto, nps, likert
Para conjoint incluye campo "opciones_conjoint" con 3 opciones comparativas.
Siempre incluye salto_logico con FIN_CON_DESCARTE en sesión 1.`;

        const aiRes = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"x-api-key":apiKey,"anthropic-version":"2023-06-01","content-type":"application/json"},
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:2000,
            system,
            messages:[{role:"user",content:`Objetivo: ${objetivoClean}`}]
          })
        });
        if (!aiRes.ok) { log("IA_ERROR",ip,{status:aiRes.status}); return res(502,{error:"Error de IA. Intenta de nuevo."}); }
        const aiData = await aiRes.json();
        const text = aiData.content?.[0]?.text||"";
        const clean = text.replace(/```json|```/g,"").trim();
        let encuesta;
        try { encuesta = JSON.parse(clean); } catch { return res(500,{error:"IA generó respuesta inválida"}); }
        log("IA_OK",ip,{titulo:encuesta.titulo});
        return res(200,{status:"success",encuesta});
      }

      case "registrar_respuesta": {
        const { encuesta_id, encuestador_id, es_descarte, respuestas, jornada } = datos || {};
        if (!encuesta_id || !encuestador_id) return res(400,{error:"Datos incompletos"});
        log("RESPUESTA_OK",ip,{encuesta_id,es_descarte,num:Object.keys(respuestas||{}).length});
        return res(201,{status:"success",cabecera_id:`rc-${Date.now().toString(36)}`});
      }

      case "generar_landing": {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return res(503,{error:"IA no configurada"});
        const { datos_producto } = datos || {};
        if (!datos_producto) return res(400,{error:"Datos del producto requeridos"});

        const system2 = `Eres un experto en lanzamiento de productos al estilo Tesla/Superhuman/Notion.
Genera ÚNICAMENTE JSON para una landing de lista de espera.
{
  "nombre_producto": "...",
  "tagline": "Una línea memorable",
  "propuesta_valor": "2-3 oraciones",
  "precio_sugerido": "X USD/mes",
  "caracteristicas": ["feat1","feat2","feat3"],
  "urgencia": "Solo 500 lugares en la primera edición",
  "cta": "Asegurar mi lugar",
  "colores": {"primario":"#HEX","secundario":"#HEX"}
}`;

        const aiRes2 = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"x-api-key":apiKey,"anthropic-version":"2023-06-01","content-type":"application/json"},
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:1000,
            system:system2,
            messages:[{role:"user",content:JSON.stringify(datos_producto)}]
          })
        });
        const aiData2 = await aiRes2.json();
        const text2 = aiData2.content?.[0]?.text||"{}";
        let landing;
        try { landing = JSON.parse(text2.replace(/```json|```/g,"").trim()); } catch { landing = {}; }
        return res(200,{status:"success",landing});
      }

      case "verificar_trial": {
        const { device_fp } = datos || {};
        const blocked = trialStore.get(device_fp);
        return res(200,{activo: !blocked, blocked: !!blocked});
      }

      default:
        return res(400,{error:"Acción no reconocida"});
    }
  } catch(e) {
    log("ERROR_INTERNO",ip,{accion,msg:e.message});
    return res(500,{error:"Error interno. Contacta soporte."});
  }
};
