// ╔══════════════════════════════════════════════════════════════╗
// ║         SURVEYAI — FIREBASE CLIENT                          ║
// ║         Conexión en tiempo real con Realtime Database       ║
// ╚══════════════════════════════════════════════════════════════╝

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, off, set, get, query, orderByChild, limitToLast } from "firebase/database";

// Configuración Firebase — proyecto encuestador-8c4a8
const firebaseConfig = {
  apiKey: "AIzaSyCPQr8_WCtNi8F36f6Df6GvEpLG4TPVpQQ",
  authDomain: "encuestador-8c4a8.firebaseapp.com",
  databaseURL: "https://encuestador-8c4a8-default-rtdb.firebaseio.com",
  projectId: "encuestador-8c4a8",
  storageBucket: "encuestador-8c4a8.firebasestorage.app",
  messagingSenderId: "319469328936",
  appId: "1:319469328936:web:3f623ada09008482af331d"
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

  // Insertar cabecera
  const cabeceraRef = ref(db, "respuestas_cabecera");
  const nuevaCabecera = await push(cabeceraRef, cabecera);
  const cabecera_id = nuevaCabecera.key;

  // Insertar detalles si no es descarte
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

  const unsub = onValue(q, (snapshot) => {
    const data = snapshot.val() || {};
    const respuestas = Object.entries(data)
      .filter(([_, v]) => v.encuesta_id === encuesta_id)
      .map(([key, val]) => ({ id: key, ...val }))
      .sort((a, b) => new Date(b.fecha_captura) - new Date(a.fecha_captura));
    callback(respuestas);
  });

  return () => off(q);
}

// ─── LECTURA — Obtener encuestas del mandante ─────────
export function escucharEncuestas(mandante_id, callback) {
  const encuestasRef = ref(db, "encuestas");
  const unsub = onValue(encuestasRef, (snapshot) => {
    const data = snapshot.val() || {};
    const encuestas = Object.entries(data)
      .filter(([_, v]) => !mandante_id || v.mandante_id === mandante_id)
      .map(([key, val]) => ({ firebase_id: key, ...val }))
      .sort((a, b) => new Date(b.creado_at) - new Date(a.creado_at));
    callback(encuestas);
  });
  return () => off(encuestasRef);
}

// ─── LECTURA — Stats globales en tiempo real ──────────
export function escucharStats(callback) {
  const cabRef = ref(db, "respuestas_cabecera");
  const unsub = onValue(cabRef, (snapshot) => {
    const data = snapshot.val() || {};
    const todas = Object.values(data);
    const stats = {
      total: todas.length,
      completadas: todas.filter(r => !r.es_descarte).length,
      descartes: todas.filter(r => r.es_descarte).length,
      hoy: todas.filter(r => {
        const d = new Date(r.fecha_captura);
        const hoy = new Date();
        return d.toDateString() === hoy.toDateString();
      }).length,
    };
    callback(stats);
  });
  return () => off(cabRef);
}

export { db, ref, onValue };
