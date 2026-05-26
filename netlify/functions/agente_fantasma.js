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
        const { objetivo, sesion_actual=1, sesiones_total=3, encuesta_id="" } = datos || {};
        if (!objetivo || objetivo.length < 10) return res(400,{error:"Describe tu objetivo"});

        const objetivoClean = String(objetivo).replace(/<[^>]+>/g,"").replace(/[<>"]/g,"").slice(0,400);
        const encId = encuesta_id || `enc-${Date.now().toString(36)}`;

        const AGENTES = {
          1: { nombre:"IPSOS — Screening IAT", instruccion:"Genera 5 preguntas de screening psicológico. La primera DEBE tener salto_logico con FIN_CON_DESCARTE. Tipo: seleccion_unica." },
          2: { nombre:"YouGov — Perfilado", instruccion:"Genera 5 preguntas sobre comportamiento actual y dolor del cliente. Tipos: seleccion_unica, seleccion_multiple." },
          3: { nombre:"Gallup — Validación", instruccion:"Genera 5 preguntas de validación estadística y disposición de pago. Tipo: seleccion_unica con 3 opciones." },
          4: { nombre:"Kantar — Valor", instruccion:"Genera 5 preguntas de propuesta de valor con anclaje. Tipos: seleccion_unica, nps." },
          5: { nombre:"Dynata — Cierre", instruccion:"Genera 5 preguntas de intención real de compra y lista de espera. Tipo: seleccion_unica." },
        };
        const agente = AGENTES[sesion_actual] || AGENTES[1];

        const system = `Eres el ${agente.nombre}, experto en investigación de mercado.
Responde ÚNICAMENTE con JSON válido. Sin texto, sin markdown, sin explicaciones.

ESTRUCTURA EXACTA:
{
  "titulo": "Título descriptivo del estudio",
  "sesion": {
    "sesion": ${sesion_actual},
    "nombre": "${agente.nombre}",
    "preguntas": [
      {
        "id": 1,
        "tipo": "seleccion_unica",
        "metodologia": "IAT",
        "enunciado": "¿Pregunta clara y directa?",
        "opciones": ["Opción A", "Opción B", "Opción C"],
        "reglas": { "requerido": true }
      }
    ]
  }
}

Instrucción: ${agente.instruccion}
Contexto del estudio: ${objetivoClean}`;

        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 800,
            system,
            messages: [{ role: "user", content: `Genera sesión ${sesion_actual} para: ${objetivoClean}` }]
          })
        });

        if (!aiRes.ok) {
          log("IA_ERROR", ip, { status: aiRes.status, sesion: sesion_actual });
          return res(502, { error: `Error IA sesión ${sesion_actual}` });
        }

        const aiData = await aiRes.json();
        const text = aiData.content?.[0]?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();

        let resultado;
        try {
          resultado = JSON.parse(clean);
        } catch {
          log("IA_PARSE_ERROR", ip, { sesion: sesion_actual, text: text.slice(0, 100) });
          return res(500, { error: "Respuesta de IA inválida. Reintentando..." });
        }

        log("IA_OK", ip, { sesion: sesion_actual, agente: agente.nombre });
        return res(200, {
          status: "success",
          encuesta_id: encId,
          titulo: resultado.titulo || `Estudio: ${objetivoClean.slice(0, 40)}`,
          objetivo_negocio: objetivoClean,
          agente_nombre: agente.nombre,
          sesion_actual,
          sesiones_total,
          sesion: resultado.sesion,
          es_ultima: sesion_actual >= sesiones_total
        });
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
