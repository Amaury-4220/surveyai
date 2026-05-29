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

      case "generar_analisis": {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return res(503, { error: "IA no configurada" });
        const { encuesta_titulo, total_encuestados, total_descartes, resumen_respuestas } = datos || {};
        if (!resumen_respuestas) return res(400, { error: "Sin datos de respuestas" });

        const resumenTexto = Object.entries(resumen_respuestas).slice(0, 30).map(([pregunta, respuestas]) => {
          const conteo = {};
          respuestas.forEach(r => { conteo[r] = (conteo[r]||0)+1; });
          const top = Object.entries(conteo).sort((a,b)=>b[1]-a[1]).slice(0,5)
            .map(([k,v])=>`  "${k}": ${v} (${Math.round(v/respuestas.length*100)}%)`).join("\n");
          return `PREGUNTA: ${pregunta}\nRESPUESTAS (${respuestas.length} total):\n${top}`;
        }).join("\n\n");

        const completados = total_encuestados - (total_descartes||0);
        const tasa = total_encuestados > 0 ? Math.round(completados/total_encuestados*100) : 0;

        const system = `Eres un experto en investigación de mercado con 20 años de experiencia en análisis de encuestas.
Analiza los resultados y devuelve SOLO JSON válido sin markdown.

Formato JSON requerido:
{
  "total_encuestados": número,
  "completados": número,
  "descartes": número,
  "tasa_completacion": número,
  "hallazgo_principal": "texto del hallazgo más importante (2-3 oraciones)",
  "precio_optimo": "análisis del precio óptimo basado en las respuestas",
  "campos_fuertes": ["campo 1", "campo 2", "campo 3"],
  "campos_debiles": ["campo 1", "campo 2"],
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "conclusion": "conclusión ejecutiva de 2-3 oraciones con potencial de mercado"
}`;

        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            system,
            messages: [{
              role: "user",
              content: `Encuesta: ${encuesta_titulo}\nEncuestados: ${total_encuestados}\nCompletados: ${completados}\nDescartes: ${total_descartes||0}\n\nRESULTADOS:\n${resumenTexto}`
            }]
          })
        });

        if (!aiRes.ok) return res(502, { error: "Error de IA" });
        const aiData = await aiRes.json();
        const text = aiData.content?.[0]?.text || "";
        const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();

        let analisis;
        try { analisis = JSON.parse(clean); }
        catch { return res(500, { error: "Error procesando análisis" }); }

        analisis.total_encuestados = total_encuestados;
        analisis.completados = completados;
        analisis.descartes = total_descartes || 0;
        analisis.tasa_completacion = tasa;

        log("ANALISIS_OK", ip, { encuesta: encuesta_titulo });
        return res(200, { status: "success", analisis });
      }

      case "generar_brief": {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return res(503, { error: "IA no configurada" });
        const { idea } = datos || {};
        if (!idea || idea.length < 10) return res(400, { error: "Describe tu idea con más detalle" });

        const ideaClean = String(idea).replace(/<[^>]+>/g, "").replace(/[<>"]/g, "").slice(0, 800);

        const system = `Eres el AGENTE 0 — El Arquitecto de SurveyAI. Eres el mejor diseñador de investigación de mercado del mundo.
Tu trabajo es analizar la idea de negocio del mandante y crear un BRIEF metodológico preciso que guiará a los 5 agentes especializados.

Responde ÚNICAMENTE con JSON válido. Sin markdown, sin texto extra.

METODOLOGÍAS DISPONIBLES (selecciona las más adecuadas):
1. Conjoint DCE - simula góndola real con trade-offs
2. MaxDiff - prioriza atributos sin sesgo
3. Van Westendorp - precio óptimo (4 preguntas)
4. Gabor-Granger - curva de demanda exacta
5. Juster Scale - intención de compra probabilística (0-10)
6. IAT - asociaciones implícitas rápidas
7. AIO Psicográfico - estilo de vida y motivaciones
8. VALS - clasificación por valores y motivaciones
9. Jobs-to-be-Done - disparadores de compra reales
10. NPS - lealtad proyectada
11. CSAT/CES - satisfacción y fricción
12. Likert Simétrico - acuerdo/desacuerdo balanceado
13. Diferencial Semántico - perfil emocional de marca
14. Suma Constante - peso real de atributos
15. Asociación de Palabras - insights del subconsciente
16. Frase Incompleta - miedos y motivaciones ocultas
17. Incidente Crítico - puntos de dolor retrospectivos

ESTRUCTURA JSON:
{
  "titulo_estudio": "Nombre descriptivo del estudio",
  "cliente_objetivo": "Perfil del consumidor objetivo",
  "objetivo_negocio": "Lo que el mandante quiere validar",
  "hipotesis_principal": "La hipótesis central a probar",
  "variables_clave": ["variable1", "variable2", "variable3"],
  "sesiones": [
    {
      "numero": 1,
      "nombre": "IPSOS — Screening + IAT",
      "objetivo_sesion": "Filtrar audiencia calificada y detectar asociaciones implícitas",
      "metodologias": ["IAT", "Jobs-to-be-Done"],
      "tipos_preguntas": ["seleccion_unica con FIN_CON_DESCARTE", "iat"],
      "variables_a_medir": ["perfil del comprador", "motivaciones implícitas"],
      "instruccion_agente": "Genera 10 preguntas de screening usando IAT. La primera DEBE tener FIN_CON_DESCARTE. Detecta el perfil sin revelar el objetivo del estudio."
    },
    {
      "numero": 2,
      "nombre": "YouGov — Dolor + AIO",
      "objetivo_sesion": "Mapear el dolor actual y el perfil psicográfico",
      "metodologias": ["AIO Psicográfico", "Incidente Crítico", "Frase Incompleta"],
      "tipos_preguntas": ["seleccion_multiple", "likert", "texto_corto"],
      "variables_a_medir": ["frecuencia del problema", "costo del dolor actual"],
      "instruccion_agente": "Genera 10 preguntas sobre el comportamiento actual. Usa Frase Incompleta para revelar miedos."
    },
    {
      "numero": 3,
      "nombre": "Gallup — Validación + Conjoint",
      "objetivo_sesion": "Validar atributos y disposición de pago con rigor estadístico",
      "metodologias": ["Conjoint DCE", "MaxDiff", "Van Westendorp"],
      "tipos_preguntas": ["conjoint", "seleccion_unica"],
      "variables_a_medir": ["atributos más valorados", "rango de precio aceptable"],
      "instruccion_agente": "Genera 10 preguntas Conjoint y MaxDiff. Incluir las 4 preguntas de Van Westendorp para precio óptimo."
    },
    {
      "numero": 4,
      "nombre": "Kantar — Propuesta de Valor",
      "objetivo_sesion": "Validar propuesta de valor con anclaje psicológico y detectar efecto sospecha",
      "metodologias": ["Diferencial Semántico", "Suma Constante", "Gabor-Granger"],
      "tipos_preguntas": ["likert", "seleccion_unica", "nps"],
      "variables_a_medir": ["killer features", "efecto sospecha en precio bajo"],
      "instruccion_agente": "Genera 10 preguntas de valor percibido. Usa anclaje con competidor antes de presentar la propuesta nueva."
    },
    {
      "numero": 5,
      "nombre": "Dynata — Intención Real de Compra",
      "objetivo_sesion": "Medir intención real con escala Juster y capturar lista de espera",
      "metodologias": ["Juster Scale", "VALS", "Asociación de Palabras"],
      "tipos_preguntas": ["seleccion_unica", "texto_corto"],
      "variables_a_medir": ["probabilidad real de compra", "disposición a depósito reembolsable"],
      "instruccion_agente": "Genera 10 preguntas de intención real. NO preguntar directamente si compraría. Usar escala Juster (0-10). Incluir pregunta de lista de espera y depósito."
    }
  ],
  "metricas_clave": ["precio_optimo", "intencion_compra", "killer_feature", "perfil_comprador"],
  "advertencias_metodologicas": ["No revelar el producto hasta la sesión 3", "Aleatorizar opciones en conjoint"],
  "estructura_skip_logic": "Sesión 1 filtra con FIN_CON_DESCARTE. Sesión 5 cierra con lista de espera."
}`;

        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 3000,
            system,
            messages: [{ role: "user", content: `Analiza esta idea y genera el brief metodológico: ${ideaClean}` }]
          })
        });

        if (!aiRes.ok) return res(502, { error: "Error de IA. Intenta de nuevo." });
        const aiData = await aiRes.json();
        const text = aiData.content?.[0]?.text || "";
        const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();

        let brief;
        try { brief = JSON.parse(clean); }
        catch { return res(500, { error: "Error generando el brief. Intenta de nuevo." }); }

        log("BRIEF_OK", ip, { titulo: brief.titulo_estudio });
        return res(200, { status: "success", brief });
      }

      case "generar_encuesta": {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return res(503,{error:"IA no configurada"});
        const { objetivo, sesion_actual=1, sesiones_total=5, encuesta_id="", preguntas_por_sesion=10 } = datos || {};
        if (!objetivo || objetivo.length < 10) return res(400,{error:"Describe tu objetivo"});

        const objetivoClean = String(objetivo).replace(/<[^>]+>/g,"").replace(/[<>"]/g,"").slice(0,600);
        const encId = encuesta_id || `enc-${Date.now().toString(36)}`;

        const AGENTES = {
          1: { nombre:"IPSOS — Screening + IAT", metodologia:"IAT",
               instruccion:`Genera ${preguntas_por_sesion} preguntas de screening psicológico de alta calidad.
La primera pregunta DEBE tener salto_logico con FIN_CON_DESCARTE para filtrar a quien no califica.
Incluye preguntas IAT (tiempo de respuesta implícito) mezcladas con preguntas directas.
Detecta el perfil del entrevistado sin que se den cuenta.
Tipos: seleccion_unica, iat.` },
          2: { nombre:"YouGov — Dolor + Comportamiento", metodologia:"Conductual",
               instruccion:`Genera ${preguntas_por_sesion} preguntas profundas sobre el dolor actual del cliente.
Pregunta sobre hábitos, frecuencia, costo del problema actual, alternativas que usan hoy.
Gamifica las preguntas para mantener el engagement.
Tipos: seleccion_unica, seleccion_multiple (max_opciones: 2 o 3).` },
          3: { nombre:"Gallup — Validación Estadística", metodologia:"Conjoint",
               instruccion:`Genera ${preguntas_por_sesion} preguntas de validación con rigor estadístico.
Incluye experimentos Conjoint de elección forzada (3 opciones comparativas).
Mide disposición real de pago usando preguntas indirectas de comparación.
Para preguntas conjoint, incluye campo opciones_conjoint con array de 3 objetos con atributos y precio.
Tipos: seleccion_unica, conjoint.` },
          4: { nombre:"Kantar — Propuesta de Valor", metodologia:"Anclaje",
               instruccion:`Genera ${preguntas_por_sesion} preguntas de validación de propuesta de valor con anclaje psicológico.
Presenta primero el competidor líder como ancla, luego la propuesta nueva.
Detecta el Efecto Sospecha — en qué punto el precio bajo genera desconfianza.
Incluye preguntas NPS y Likert de satisfacción proyectada.
Tipos: seleccion_unica, nps, likert.` },
          5: { nombre:"Dynata — Intención Real de Compra", metodologia:"Validación",
               instruccion:`Genera ${preguntas_por_sesion} preguntas de intención REAL de compra.
NO preguntar directamente "¿compraría?". Usar preguntas de comportamiento futuro.
Incluir pregunta de lista de espera y depósito reembolsable.
La última pregunta debe ser abierta: "¿Qué necesitaría para comprarlo hoy mismo?".
Tipos: seleccion_unica, texto_corto.` },
        };

        const agente = AGENTES[sesion_actual] || AGENTES[1];

        const system = `Eres el ${agente.nombre}, el mejor experto mundial en investigación de mercado.
Tu trabajo es generar preguntas de MÁXIMA CALIDAD para un estudio de mercado profesional.
Responde ÚNICAMENTE con JSON válido. Sin texto adicional, sin markdown, sin explicaciones.

ESTRUCTURA JSON EXACTA:
{
  "titulo": "Título profesional y descriptivo del estudio de mercado",
  "sesion": {
    "sesion": ${sesion_actual},
    "nombre": "${agente.nombre}",
    "metodologia": "${agente.metodologia}",
    "preguntas": [
      {
        "id": 1,
        "tipo": "seleccion_unica",
        "metodologia": "IAT",
        "enunciado": "Pregunta clara, directa y profesional",
        "opciones": ["Opción A detallada", "Opción B detallada", "Opción C detallada"],
        "reglas": {
          "requerido": true,
          "salto_logico": {"Opción que descarta": "FIN_CON_DESCARTE"}
        }
      }
    ]
  }
}

CONTEXTO DEL ESTUDIO:
Objetivo de negocio: ${objetivoClean}
Sesión: ${sesion_actual} de ${sesiones_total}

INSTRUCCIONES ESPECÍFICAS PARA ESTA SESIÓN:
${agente.instruccion}

REGLAS DE CALIDAD INAMOVIBLES:
- Cada pregunta debe ser única y relevante para el objetivo
- Las opciones deben ser mutuamente excluyentes y exhaustivas
- El lenguaje debe ser claro, sin jerga técnica
- Las preguntas deben fluir naturalmente en conversación
- Incluir variedad de tipos para mantener engagement`;

        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            system,
            messages: [{ role: "user", content: `Genera ${preguntas_por_sesion} preguntas de alta calidad para la sesión ${sesion_actual}. Objetivo: ${objetivoClean}` }]
          })
        });

        if (!aiRes.ok) {
          log("IA_ERROR", ip, { status: aiRes.status, sesion: sesion_actual });
          return res(502, { error: `Error IA sesión ${sesion_actual}. Reintentando...` });
        }

        const aiData = await aiRes.json();
        const text = aiData.content?.[0]?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();

        let resultado;
        try {
          resultado = JSON.parse(clean);
        } catch {
          log("IA_PARSE_ERROR", ip, { sesion: sesion_actual });
          return res(500, { error: "Error de formato. Reintentando sesión..." });
        }

        log("IA_OK", ip, {
          sesion: sesion_actual,
          agente: agente.nombre,
          preguntas: resultado.sesion?.preguntas?.length || 0
        });

        return res(200, {
          status: "success",
          encuesta_id: encId,
          titulo: resultado.titulo || `Estudio: ${objetivoClean.slice(0, 50)}`,
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
