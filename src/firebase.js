// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — FIREBASE CLIENT v3                              ║
// ║  Arquitectura: Definición separada de Ejecución             ║
// ╚══════════════════════════════════════════════════════════════╝
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, get, onValue, off, query, orderByChild, limitToLast } from "firebase/database";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── Sanitizar clave para Firebase ───────────────────────────
// Firebase prohíbe: . # $ / [ ] en claves
function sanitizeKey(str) {
  return String(str).replace(/[.#$\/\[\]]/g, "_").slice(0, 100);
}

// ─── Serializar salto_logico como array ───────────────────────
function serializarSaltoLogico(saltoLogico) {
  if (!saltoLogico || typeof saltoLogico !== "object") return null;
  return Object.entries(saltoLogico).map(([opcion, accion]) => ({
    o: String(opcion).slice(0, 200), // opcion
    a: String(accion),               // accion
  }));
}

// ─── Restaurar salto_logico desde array ───────────────────────
function restaurarSaltoLogico(arr) {
  if (!arr) return null;
  const items = Array.isArray(arr) ? arr : Object.values(arr);
  const sl = {};
  items.forEach(item => { if (item.o) sl[item.o] = item.a; });
  return sl;
}

// ─── Serializar pregunta para Firebase ───────────────────────
function serializarPregunta(p, index) {
  const reglas = { requerido: !!p.reglas?.requerido };
  const sl = serializarSaltoLogico(p.reglas?.salto_logico);
  if (sl) reglas.salto_logico_arr = sl;
  if (p.reglas?.max_opciones) reglas.max_opciones = Number(p.reglas.max_opciones);

  const pregunta = {
    id:          p.id ?? index + 1,
    tipo:        p.tipo || "seleccion_unica",
    metodologia: p.metodologia || "",
    enunciado:   p.enunciado || "",
    opciones:    Array.isArray(p.opciones) ? p.opciones : [],
    reglas,
  };

  if (p.opciones_conjoint && Array.isArray(p.opciones_conjoint)) {
    pregunta.opciones_conjoint = p.opciones_conjoint;
  }

  return pregunta;
}

// ─── Normalizar pregunta desde Firebase ──────────────────────
function normalizarPregunta(p, index) {
  const reglas = { requerido: !!p.reglas?.requerido };
  const sl = restaurarSaltoLogico(p.reglas?.salto_logico_arr);
  if (sl) reglas.salto_logico = sl;
  if (p.reglas?.max_opciones) reglas.max_opciones = p.reglas.max_opciones;

  return {
    id:          p.id ?? index + 1,
    tipo:        p.tipo || "seleccion_unica",
    metodologia: p.metodologia || "",
    enunciado:   p.enunciado || "",
    opciones:    Array.isArray(p.opciones) ? p.opciones : Object.values(p.opciones || {}),
    reglas,
    opciones_conjoint: p.opciones_conjoint
      ? (Array.isArray(p.opciones_conjoint) ? p.opciones_conjoint : Object.values(p.opciones_conjoint))
      : undefined,
  };
}

// ══════════════════════════════════════════════════════════════
// ESCRITURA — Guardar definición de encuesta
// ══════════════════════════════════════════════════════════════
export async function guardarEncuesta(encuesta, mandante_id = "demo") {
  // Serializar sesiones indexadas (sin claves dinámicas)
  const sesiones = {};
  (encuesta.sesiones || []).forEach((s, si) => {
    const preguntas = {};
    (s.preguntas || []).forEach((p, pi) => {
      preguntas[pi] = serializarPregunta(p, pi);
    });
    sesiones[si] = {
      sesion:      s.sesion ?? si + 1,
      nombre:      s.nombre || "",
      metodologia: s.metodologia || "",
      preguntas,
    };
  });

  const payload = {
    encuesta_id:      encuesta.encuesta_id || "",
    titulo:           encuesta.titulo || "",
    cliente:          encuesta.cliente || "",
    objetivo_negocio: (encuesta.objetivo_negocio || "").slice(0, 500),
    codigo:           encuesta.codigo || "",
    total_preguntas:  encuesta.total_preguntas || 0,
    mandante_id,
    creado_at:        new Date().toISOString(),
    estado:           "active",
    sesiones,
  };

  const ref_enc = ref(db, "encuestas_definicion");
  const nueva = await push(ref_enc, payload);
  return nueva.key;
}

// ══════════════════════════════════════════════════════════════
// LECTURA — Cargar definición de encuesta por Firebase ID
// ══════════════════════════════════════════════════════════════
export async function cargarEncuesta(firebaseId) {
  const snap = await get(ref(db, `encuestas_definicion/${firebaseId}`));
  if (!snap.exists()) {
    // Fallback: buscar en colección legacy
    const snapLegacy = await get(ref(db, `encuestas/${firebaseId}`));
    if (!snapLegacy.exists()) return null;
    return normalizarEncuestaData(snapLegacy.val(), firebaseId);
  }
  return normalizarEncuestaData(snap.val(), firebaseId);
}

function normalizarEncuestaData(data, firebaseId) {
  const toArr = v => v ? (Array.isArray(v) ? v : Object.values(v)) : [];
  return {
    firebase_id:     firebaseId,
    encuesta_id:     data.encuesta_id || firebaseId,
    titulo:          data.titulo || "",
    cliente:         data.cliente || "",
    objetivo_negocio:data.objetivo_negocio || "",
    codigo:          data.codigo || "",
    total_preguntas: data.total_preguntas || 0,
    estado:          data.estado || "active",
    sesiones: toArr(data.sesiones).map((s, si) => ({
      sesion:      s.sesion ?? si + 1,
      nombre:      s.nombre || "",
      metodologia: s.metodologia || "",
      preguntas:   toArr(s.preguntas).map((p, pi) => normalizarPregunta(p, pi)),
    })),
  };
}

// ══════════════════════════════════════════════════════════════
// ESCRITURA — Guardar respuesta (instancia de ejecución)
// ══════════════════════════════════════════════════════════════
export async function guardarRespuesta(payload) {
  const { encuesta_id, encuestador_id, es_descarte, respuestas, jornada,
          paquete_completo, total_preguntas, total_respondidas } = payload;

  // Cabecera de la instancia
  // Build paquete object (indexed, no dynamic keys)
  const paqueteObj = {};
  if (!es_descarte && paquete_completo?.length > 0) {
    paquete_completo.forEach((item, i) => {
      paqueteObj[i] = {
        numero:      item.numero || i + 1,
        sesion:      item.sesion || 0,
        pregunta_id: item.pregunta_id || i + 1,
        enunciado:   (item.enunciado || "").slice(0, 300),
        tipo:        item.tipo || "",
        metodologia: item.metodologia || "",
        respuesta:   Array.isArray(item.respuesta)
          ? item.respuesta.join(" | ")
          : String(item.respuesta || ""),
      };
    });
  }

  const cabecera = {
    encuesta_id:       encuesta_id || "",
    encuesta_titulo:   payload.encuesta_titulo || "",
    encuestador_id:    encuestador_id || "",
    es_descarte:       !!es_descarte,
    fecha_captura:     new Date().toISOString(),
    jornada:           jornada || null,
    ficha:             payload.ficha || null,
    total_preguntas:   total_preguntas || 0,
    total_respondidas: total_respondidas || 0,
    paquete_completo:  paqueteObj,
  };

  const cabRef = ref(db, "respuestas_cabecera");
  const nuevaCab = await push(cabRef, cabecera);
  const cabecera_id = nuevaCab.key;

  // Also save to detalle for backup/future use
  if (!es_descarte && Object.keys(paqueteObj).length > 0) {
    try { await set(ref(db, `respuestas_detalle/${cabecera_id}`), paqueteObj); } catch {}
  }

  return cabecera_id;
}

// ══════════════════════════════════════════════════════════════
// LECTURA — Listeners en tiempo real
// ══════════════════════════════════════════════════════════════
export function escucharEncuestas(mandante_id, callback) {
  const encRef = ref(db, "encuestas_definicion");
  onValue(encRef, snap => {
    const data = snap.val() || {};
    const lista = Object.entries(data)
      .map(([key, val]) => ({ firebase_id: key, ...val }))
      .sort((a, b) => new Date(b.creado_at) - new Date(a.creado_at));
    callback(lista);
  });
  return () => off(encRef);
}

export function escucharStats(callback) {
  const cabRef = ref(db, "respuestas_cabecera");
  onValue(cabRef, snap => {
    const data = snap.val() || {};
    const todas = Object.values(data);
    const hoy = new Date().toDateString();
    callback({
      total:      todas.length,
      completadas:todas.filter(r => !r.es_descarte).length,
      descartes:  todas.filter(r => r.es_descarte).length,
      hoy:        todas.filter(r => new Date(r.fecha_captura).toDateString() === hoy).length,
    });
  });
  return () => off(cabRef);
}

export function escucharRespuestas(encuesta_id, callback) {
  const cabRef = ref(db, "respuestas_cabecera");
  onValue(cabRef, snap => {
    const data = snap.val() || {};
    const lista = Object.entries(data)
      .map(([key, val]) => ({ id: key, ...val }))
      .filter(v => !encuesta_id || v.encuesta_id === encuesta_id)
      .sort((a, b) => new Date(b.fecha_captura||0) - new Date(a.fecha_captura||0));
    callback(lista);
  });
  return () => off(q);
}

export { db, ref, onValue };
