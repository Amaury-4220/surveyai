// ╔══════════════════════════════════════════════════════════════╗
// ║         SURVEYAI — FIREBASE CLIENT                          ║
// ║         Credenciales via variables de entorno Vite          ║
// ╚══════════════════════════════════════════════════════════════╝

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, off, query, orderByChild, limitToLast } from "firebase/database";

// Credenciales desde variables de entorno — nunca hardcodeadas
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

// ─── ESCRITURA — Guardar respuesta ────────────────────
export async function guardarRespuesta(payload) {
  const { encuesta_id, encuestador_id, es_descarte, respuestas, jornada, pregunta_descarte_id } = payload;

  const cabecera = {
    encuesta_id,
    encuestador_id,
    es_descarte,
    pregunta_descarte_id: pregunta_descarte_id || null,
    fecha_captura: new Date().toISOString(),
    jornada: jornada || null,
  };

  const cabeceraRef = ref(db, "respuestas_cabecera");
  const nuevaCabecera = await push(cabeceraRef, cabecera);
  const cabecera_id = nuevaCabecera.key;

  if (!es_descarte && respuestas) {
    const detalles = Object.entries(respuestas)
      .filter(([_, val]) => val !== "" && val !== null && !(Array.isArray(val) && val.length === 0))
      .map(([pregunta_id, valor_respondido]) => ({
        cabecera_id,
        encuesta_id,
        pregunta_id: parseInt(pregunta_id),
        valor_respondido: Array.isArray(valor_respondido)
          ? valor_respondido.join(", ")
          : String(valor_respondido),
      }));

    const detallesRef = ref(db, "respuestas_detalle");
    for (const detalle of detalles) {
      await push(detallesRef, detalle);
    }
  }

  return cabecera_id;
}

// ─── ESCRITURA — Guardar encuesta generada por IA ─────
export async function guardarEncuesta(encuesta, mandante_id = "demo") {
  const encuestasRef = ref(db, "encuestas");
  const nueva = await push(encuestasRef, {
    ...encuesta,
    mandante_id,
    creado_at: new Date().toISOString(),
    estado: "active",
  });
  return nueva.key;
}

// ─── LECTURA — Escuchar respuestas en tiempo real ─────
export function escucharRespuestas(encuesta_id, callback) {
  const q = query(
    ref(db, "respuestas_cabecera"),
    orderByChild("encuesta_id"),
    limitToLast(100)
  );
  onValue(q, (snapshot) => {
    const data = snapshot.val() || {};
    const respuestas = Object.entries(data)
      .filter(([_, v]) => v.encuesta_id === encuesta_id)
      .map(([key, val]) => ({ id: key, ...val }))
      .sort((a, b) => new Date(b.fecha_captura) - new Date(a.fecha_captura));
    callback(respuestas);
  });
  return () => off(q);
}

// ─── LECTURA — Escuchar encuestas ────────────────────
export function escucharEncuestas(mandante_id, callback) {
  const encuestasRef = ref(db, "encuestas");
  onValue(encuestasRef, (snapshot) => {
    const data = snapshot.val() || {};
    const encuestas = Object.entries(data)
      .filter(([_, v]) => !mandante_id || v.mandante_id === mandante_id)
      .map(([key, val]) => ({ firebase_id: key, ...val }))
      .sort((a, b) => new Date(b.creado_at) - new Date(a.creado_at));
    callback(encuestas);
  });
  return () => off(encuestasRef);
}

// ─── LECTURA — Stats en tiempo real ──────────────────
export function escucharStats(callback) {
  const cabRef = ref(db, "respuestas_cabecera");
  onValue(cabRef, (snapshot) => {
    const data = snapshot.val() || {};
    const todas = Object.values(data);
    const hoy = new Date().toDateString();
    callback({
      total: todas.length,
      completadas: todas.filter(r => !r.es_descarte).length,
      descartes: todas.filter(r => r.es_descarte).length,
      hoy: todas.filter(r => new Date(r.fecha_captura).toDateString() === hoy).length,
    });
  });
  return () => off(cabRef);
}

export { db, ref, onValue };
