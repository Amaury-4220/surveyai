// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 3: APP ENCUESTADOR                         ║
// ║  Offline First · Jornada · GPS · Sync automático            ║
// ║  © SurveyAI 2025 — Todos los derechos reservados           ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin, Clock, Building, ArrowRight, ArrowLeft, Check, X,
  Send, RefreshCw, AlertCircle, CheckCircle, Wifi, WifiOff,
  Upload, LogOut, ChevronDown, User, Phone, Calendar,
  Smartphone, BarChart3, Activity, Shield, Zap, Eye,
  MessageCircle, Home, ClipboardList, TrendingUp
} from "lucide-react";
import { guardarRespuesta } from "./firebase.js";

// ─── Design System ────────────────────────────────────────────
const T = {
  bg:"#03070E", surface:"#060C18", card:"#090F1E",
  elevated:"#0C1526", elevated2:"#101C30",
  border:"rgba(6,182,212,0.1)", borderFocus:"rgba(6,182,212,0.45)",
  cyan:"#06B6D4", violet:"#7C3AED", green:"#10B981",
  red:"#EF4444", yellow:"#F59E0B",
  text:"#F1F5F9", textSec:"#64748B", textMuted:"#1A3050",
  grad:"linear-gradient(135deg,#06B6D4,#7C3AED)",
};

// ─── Offline Queue (localStorage) ────────────────────────────
const Q = {
  add: (item) => {
    try {
      const q = JSON.parse(localStorage.getItem("sai_q")||"[]");
      q.push({...item, local_id:`l-${Date.now()}`, queued_at:new Date().toISOString()});
      localStorage.setItem("sai_q", JSON.stringify(q));
    } catch {}
  },
  get: () => { try { return JSON.parse(localStorage.getItem("sai_q")||"[]"); } catch { return []; } },
  remove: (id) => {
    try {
      const q = JSON.parse(localStorage.getItem("sai_q")||"[]");
      localStorage.setItem("sai_q", JSON.stringify(q.filter(i=>i.local_id!==id)));
    } catch {}
  },
  count: () => { try { return JSON.parse(localStorage.getItem("sai_q")||"[]").length; } catch { return 0; } },
};

// ─── Stats store ──────────────────────────────────────────────
const Stats = {
  get: () => { try { return JSON.parse(localStorage.getItem("sai_stats")||'{"hoy":0,"total":0,"descartes":0}'); } catch { return {hoy:0,total:0,descartes:0}; } },
  update: (isDiscard) => {
    const s = Stats.get();
    Stats.save({hoy:s.hoy+1,total:s.total+1,descartes:isDiscard?s.descartes+1:s.descartes});
  },
  save: (s) => { try { localStorage.setItem("sai_stats",JSON.stringify(s)); } catch {} },
  resetHoy: () => {
    const s = Stats.get();
    const lastReset = localStorage.getItem("sai_last_reset");
    const hoy = new Date().toDateString();
    if (lastReset !== hoy) { Stats.save({...s,hoy:0}); localStorage.setItem("sai_last_reset",hoy); }
  },
};

// ─── Comunas de Chile ─────────────────────────────────────────
const COMUNAS = [
  "Cerro Navia","Santiago Centro","Maipú","La Florida","Pudahuel",
  "Peñalolén","San Bernardo","El Bosque","Quilicura","Renca",
  "Conchalí","Recoleta","Independencia","Providencia","Ñuñoa",
  "Las Condes","Vitacura","Lo Barnechea","Huechuraba","Colina",
  "Puente Alto","La Pintana","Lo Espejo","Pedro Aguirre Cerda",
  "Lo Prado","Quinta Normal","Estación Central","Cerrillos",
  "Padre Hurtado","Peñaflor","Talagante","Melipilla","Buin","Paine",
  "Valparaíso","Viña del Mar","Concepción","Talcahuano","Temuco",
  "Antofagasta","La Serena","Coquimbo","Rancagua","Talca","Arica",
  "Iquique","Puerto Montt","Osorno","Valdivia","Punta Arenas",
];

const TIPOS_PUNTO = [
  "Mall / Centro comercial","Calle / Vía pública","Feria libre",
  "Local comercial","Supermercado / Hipermercado","Farmacia / Droguería",
  "Centro de salud / Clínica","Establecimiento educacional",
  "Mercado / Feria municipal","Plaza / Parque público","Otro",
];

// ─── Primitives ───────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{marginBottom:14}}>
    {label&&<div style={{fontSize:10,fontWeight:700,color:T.textMuted,
      textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{label}</div>}
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type="text" }) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder}
    style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,
      borderRadius:11,padding:"11px 13px",color:T.text,fontSize:14,
      outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border .2s"}}
    onFocus={e=>e.currentTarget.style.borderColor=T.borderFocus}
    onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
);

const Select = ({ value, onChange, options, placeholder="" }) => (
  <div style={{position:"relative"}}>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,
        borderRadius:11,padding:"11px 36px 11px 13px",color:value?T.text:T.textMuted,
        fontSize:14,outline:"none",appearance:"none",boxSizing:"border-box",
        fontFamily:"inherit",transition:"border .2s"}}
      onFocus={e=>e.currentTarget.style.borderColor=T.borderFocus}
      onBlur={e=>e.currentTarget.style.borderColor=T.border}>
      <option value="">{placeholder||"Seleccionar..."}</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={13} style={{position:"absolute",right:12,top:"50%",
      transform:"translateY(-50%)",color:T.textMuted,pointerEvents:"none"}}/>
  </div>
);

const PrimaryBtn = ({ children, onClick, loading, disabled, icon:I, v="primary" }) => {
  const bg = v==="green"?"linear-gradient(135deg,#10B981,#059669)":T.grad;
  const shadow = v==="green"?"0 4px 16px rgba(16,185,129,0.35)":"0 4px 16px rgba(6,182,212,0.35)";
  return (
    <button onClick={disabled||loading?undefined:onClick} disabled={disabled||loading}
      style={{width:"100%",padding:"14px",borderRadius:13,border:"none",
        background:(disabled||loading)?T.elevated:bg,
        color:(disabled||loading)?T.textMuted:"#fff",fontSize:14,fontWeight:700,
        cursor:(disabled||loading)?"not-allowed":"pointer",fontFamily:"inherit",
        display:"flex",alignItems:"center",justifyContent:"center",gap:7,
        transition:"all .2s",
        boxShadow:(disabled||loading)?"none":shadow}}>
      {loading
        ?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>Procesando...</>
        :<>{I&&<I size={14}/>}{children}</>}
    </button>
  );
};

// ─── Offline Banner ───────────────────────────────────────────
function OfflineBanner({ online, count, onSync, syncing }) {
  if (online && count===0) return null;
  return (
    <div style={{
      background:online?`${T.cyan}12`:`${T.yellow}12`,
      borderBottom:`1px solid ${online?T.cyan+"25":T.yellow+"25"}`,
      padding:"7px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        {online?<Wifi size={11} color={T.cyan}/>:<WifiOff size={11} color={T.yellow}/>}
        <span style={{fontSize:11,fontWeight:700,color:online?T.cyan:T.yellow}}>
          {online?`${count} respuestas pendientes de sincronizar`:`Sin conexión — ${count} en cola local`}
        </span>
      </div>
      {online&&count>0&&(
        <button onClick={onSync} disabled={syncing}
          style={{display:"flex",alignItems:"center",gap:4,background:T.cyan,
            border:"none",borderRadius:7,padding:"3px 10px",color:"#fff",
            fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          <Upload size={9}/>{syncing?"...":"Sincronizar"}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PANTALLA 1: JORNADA
// ═══════════════════════════════════════════════════════════════
function PantallaJornada({ user, onStart }) {
  const [comuna, setComuna] = useState("");
  const [tipoPunto, setTipoPunto] = useState("");
  const [nombreLocal, setNombreLocal] = useState("");
  const [gps, setGps] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const now = new Date();

  const getGPS = useCallback(() => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGps({
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
            acc: Math.round(pos.coords.accuracy),
            ts: new Date().toISOString(),
          });
          setGpsLoading(false);
        },
        () => {
          setGps({ lat:"-33.4489", lng:"-70.6693", acc:999, simulated:true, ts:new Date().toISOString() });
          setGpsLoading(false);
        },
        { timeout:8000, enableHighAccuracy:true }
      );
    } else {
      setGps({ lat:"-33.4489", lng:"-70.6693", acc:999, simulated:true, ts:new Date().toISOString() });
      setGpsLoading(false);
    }
  }, []);

  useEffect(() => { getGPS(); }, []);

  const iniciar = () => {
    const e = {};
    if (!comuna) e.comuna = "Selecciona una comuna";
    if (!tipoPunto) e.tipoPunto = "Selecciona el tipo de punto";
    if (Object.keys(e).length) { setErrors(e); return; }
    const jornada = {
      comuna, tipoPunto, nombreLocal, gps,
      fecha: now.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"}),
      hora: now.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"}),
      inicio: now.toISOString(),
    };
    try { localStorage.setItem("sai_jornada",JSON.stringify(jornada)); } catch {}
    onStart(jornada);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,button,select{font-family:inherit}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>

      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:56,height:56,borderRadius:16,
            background:`${T.green}15`,border:`1px solid ${T.green}30`,
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 12px"}}>
            <MapPin size={22} color={T.green}/>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:3}}>
            Declarar jornada
          </div>
          <div style={{fontSize:12,color:T.textMuted}}>
            {user?.nombre||"Encuestador"} · {user?.empresa||""}
          </div>
        </div>

        <div style={{background:T.card,borderRadius:18,padding:22,
          border:`1px solid ${T.border}`,marginBottom:14}}>

          {/* Fecha y hora automática */}
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:18}}>
            <div style={{background:T.elevated,borderRadius:10,padding:"10px 13px",
              border:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.textMuted,fontWeight:700,
                textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Fecha</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text,textTransform:"capitalize"}}>
                {now.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})}
              </div>
            </div>
            <div style={{background:T.elevated,borderRadius:10,padding:"10px 13px",
              border:`1px solid ${T.border}`,minWidth:70}}>
              <div style={{fontSize:9,color:T.textMuted,fontWeight:700,
                textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Hora</div>
              <div style={{fontSize:15,fontWeight:900,color:T.cyan,fontFamily:"monospace"}}>
                {now.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}
              </div>
            </div>
          </div>

          <Field label="Comuna *">
            <Select value={comuna} onChange={v=>{setComuna(v);setErrors(e=>({...e,comuna:undefined}));}}
              options={COMUNAS} placeholder="Selecciona tu comuna"/>
            {errors.comuna&&<div style={{fontSize:11,color:T.red,marginTop:4}}>{errors.comuna}</div>}
          </Field>

          <Field label="Tipo de punto *">
            <Select value={tipoPunto} onChange={v=>{setTipoPunto(v);setErrors(e=>({...e,tipoPunto:undefined}));}}
              options={TIPOS_PUNTO} placeholder="¿Dónde estás trabajando?"/>
            {errors.tipoPunto&&<div style={{fontSize:11,color:T.red,marginTop:4}}>{errors.tipoPunto}</div>}
          </Field>

          <Field label="Nombre del local (opcional)">
            <Input value={nombreLocal} onChange={setNombreLocal}
              placeholder="Ej: Jumbo Apoquindo, Feria Lo Valledor..."/>
          </Field>

          {/* GPS Status */}
          <div style={{padding:"10px 13px",borderRadius:10,marginBottom:16,
            background:gps?`${T.green}08`:`${T.yellow}08`,
            border:`1px solid ${gps?T.green+"25":T.yellow+"25"}`,
            display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <MapPin size={12} color={gps?T.green:T.yellow}/>
              <span style={{fontSize:11,color:gps?T.green:T.yellow,fontWeight:600}}>
                {gpsLoading?"Obteniendo GPS..."
                  :gps?`GPS: ${gps.lat}, ${gps.lng} (±${gps.acc}m${gps.simulated?" sim":""})`
                  :"Sin GPS"}
              </span>
            </div>
            {!gpsLoading&&<div onClick={getGPS} style={{cursor:"pointer",color:T.textMuted}}>
              <RefreshCw size={11}/>
            </div>}
          </div>

          <PrimaryBtn v="green" icon={ArrowRight} onClick={iniciar}>
            Comenzar jornada
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PANTALLA 2: FICHA DEL ENTREVISTADO
// ═══════════════════════════════════════════════════════════════
function PantallaFicha({ jornada, onContinuar, onCancelar }) {
  const [ficha, setFicha] = useState({
    nombre_anonimo: "",
    edad_rango: "",
    genero: "",
    tipo_local: "",
  });

  const set = (k,v) => setFicha(f=>({...f,[k]:v}));

  return (
    <div style={{flex:1,overflowY:"auto",padding:20}}>
      <div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:3}}>
            Ficha del entrevistado
          </div>
          <div style={{fontSize:11,color:T.textMuted}}>
            {jornada.comuna} · {jornada.tipoPunto}
          </div>
        </div>

        <div style={{background:T.card,borderRadius:16,padding:20,
          border:`1px solid ${T.border}`,marginBottom:14}}>

          <Field label="Nombre / Alias (opcional)">
            <Input value={ficha.nombre_anonimo} onChange={v=>set("nombre_anonimo",v)}
              placeholder="Anónimo si prefiere no decir"/>
          </Field>

          <Field label="Rango de edad">
            <Select value={ficha.edad_rango} onChange={v=>set("edad_rango",v)}
              options={["18-24","25-34","35-44","45-54","55-64","65+"]}/>
          </Field>

          <Field label="Género">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {["Masculino","Femenino","Otro"].map(g=>(
                <div key={g} onClick={()=>set("genero",g)}
                  style={{padding:"10px",borderRadius:10,cursor:"pointer",textAlign:"center",
                    fontSize:12,fontWeight:600,transition:"all .15s",
                    background:ficha.genero===g?`${T.cyan}15`:T.elevated,
                    color:ficha.genero===g?T.cyan:T.textSec,
                    border:`1.5px solid ${ficha.genero===g?T.cyan:T.border}`}}>
                  {g}
                </div>
              ))}
            </div>
          </Field>

          <Field label="Tipo de establecimiento">
            <Select value={ficha.tipo_local} onChange={v=>set("tipo_local",v)}
              options={["Almacén/Minimarket","Supermercado","Mall","Feria","Calle","Otro"]}/>
          </Field>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancelar}
            style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,
              background:T.elevated,color:T.textSec,fontSize:13,fontWeight:600,
              cursor:"pointer",fontFamily:"inherit"}}>
            Cancelar
          </button>
          <button onClick={()=>onContinuar(ficha)}
            style={{flex:2,padding:"12px",borderRadius:12,border:"none",
              background:T.grad,color:"#fff",fontSize:13,fontWeight:700,
              cursor:"pointer",fontFamily:"inherit",display:"flex",
              alignItems:"center",justifyContent:"center",gap:6,
              boxShadow:"0 4px 14px rgba(6,182,212,0.3)"}}>
            Iniciar encuesta <ArrowRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PANTALLA 3: ENCUESTA CONVERSACIONAL
// ═══════════════════════════════════════════════════════════════
function PantallaEncuesta({ survey, jornada, ficha, user, online, onComplete, onDiscard }) {
  const initResp = () => {
    const s = {};
    survey.sesiones?.forEach(ses => ses.preguntas?.forEach(p => {
      s[`${ses.sesion}_${p.id}`] = p.tipo==="seleccion_multiple"?[]:""
    }));
    return s;
  };

  const allPreguntas = survey.sesiones?.flatMap(s =>
    s.preguntas?.map(p => ({...p, sesion_id:s.sesion, sesion_nombre:s.nombre}))
  ) || [];

  const [resp, setResp] = useState(initResp());
  const [step, setStep] = useState(0);
  const [discarded, setDiscarded] = useState(null);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const current = allPreguntas[step];
  const total = allPreguntas.length;
  const progress = total > 0 ? ((step) / total) * 100 : 0;
  const currentKey = current ? `${current.sesion_id}_${current.id}` : null;

  const handleChange = useCallback((key, val, tipo) => {
    if (tipo==="seleccion_unica") {
      setResp(r=>({...r,[key]:val}));
      setErrors(e=>({...e,[key]:undefined}));
      const p = allPreguntas.find(p=>`${p.sesion_id}_${p.id}`===key);
      if (p?.reglas?.salto_logico?.[val]==="FIN_CON_DESCARTE") {
        const payload = {
          encuesta_id: survey.encuesta_id,
          encuestador_id: user?.id||"enc-demo",
          es_descarte: true,
          pregunta_descarte_id: p.id,
          jornada, ficha,
          respuestas: {...resp,[key]:val},
        };
        if (online) { guardarRespuesta(payload).catch(()=>Q.add(payload)); }
        else { Q.add(payload); }
        Stats.update(true);
        setDiscarded({ opcion:val, pregunta_id:p.id });
        setTimeout(()=>onDiscard(), 2800);
      }
    } else if (tipo==="seleccion_multiple") {
      setResp(r => {
        const curr = Array.isArray(r[key])?r[key]:[];
        const already = curr.includes(val);
        const next = already?curr.filter(v=>v!==val):[...curr,val];
        const p = allPreguntas.find(p=>`${p.sesion_id}_${p.id}`===key);
        const max = p?.reglas?.max_opciones;
        if (max&&next.length>max) return r;
        return {...r,[key]:next};
      });
    }
  }, [resp, allPreguntas, online, jornada, ficha, user, survey]);

  const canAdvance = () => {
    if (!current) return false;
    if (current.reglas?.requerido) {
      const val = resp[currentKey];
      return Array.isArray(val)?val.length>0:val!=="";
    }
    return true;
  };

  const handleSubmit = async () => {
    const errs = {};
    allPreguntas.forEach(p => {
      if (!p.reglas?.requerido) return;
      const key = `${p.sesion_id}_${p.id}`;
      const val = resp[key];
      if (Array.isArray(val)?val.length===0:val==="") errs[key]="Obligatorio";
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSending(true);
    const payload = {
      encuesta_id: survey.encuesta_id,
      encuestador_id: user?.id||"enc-demo",
      es_descarte: false,
      jornada, ficha, respuestas: resp,
    };
    if (online) {
      try { await guardarRespuesta(payload); Stats.update(false); setSending(false); setSuccess(true); setTimeout(()=>onComplete(false),2200); }
      catch { Q.add(payload); Stats.update(false); setSending(false); onComplete(true); }
    } else {
      Q.add(payload); Stats.update(false); setSending(false); onComplete(true);
    }
  };

  // ── Discard screen ──
  if (discarded) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{width:60,height:60,borderRadius:16,background:`${T.yellow}15`,
        display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
        <AlertCircle size={24} color={T.yellow}/>
      </div>
      <div style={{fontSize:17,fontWeight:800,color:T.text,marginBottom:6}}>Encuesta descartada</div>
      <div style={{fontSize:13,color:T.textSec,marginBottom:10}}>"{discarded.opcion}"</div>
      <div style={{fontSize:11,color:T.textMuted,background:T.elevated,borderRadius:9,
        padding:"7px 13px",fontFamily:"monospace",border:`1px solid ${T.border}`,marginBottom:16}}>
        FIN_CON_DESCARTE → {online?"Registrado":"Cola offline"}
      </div>
      <div style={{fontSize:13,color:T.green,background:`${T.green}12`,
        padding:"8px 18px",borderRadius:10,fontWeight:700}}>
        ✓ {online?"Guardado en Firebase":"Guardado localmente"}
      </div>
    </div>
  );

  // ── Success screen ──
  if (success) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{width:68,height:68,borderRadius:18,background:`${T.green}15`,
        display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
        <CheckCircle size={30} color={T.green}/>
      </div>
      <div style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:6}}>¡Encuesta enviada!</div>
      <div style={{fontSize:13,color:T.textSec}}>Respuestas guardadas en Firebase</div>
    </div>
  );

  // Detect sesion change for visual separator
  const prevSesion = step>0?allPreguntas[step-1]?.sesion_id:null;
  const newSesion = current?.sesion_id !== prevSesion;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      {/* Progress bar */}
      <div style={{height:3,background:T.surface}}>
        <div style={{height:"100%",width:`${progress}%`,background:T.grad,transition:"width .4s"}}/>
      </div>

      {/* Session + question counter */}
      <div style={{padding:"10px 18px",display:"flex",justifyContent:"space-between",
        alignItems:"center",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,fontWeight:700,color:T.cyan,
            background:`${T.cyan}15`,padding:"2px 8px",borderRadius:20}}>
            Sesión {current?.sesion_id}/{survey.sesiones?.length||1}
          </span>
          {newSesion&&step>0&&(
            <span style={{fontSize:10,color:T.violet,background:`${T.violet}12`,
              padding:"2px 8px",borderRadius:20,fontWeight:700}}>Nueva sesión</span>
          )}
        </div>
        <span style={{fontSize:11,color:T.textMuted}}>P{step+1}/{total}</span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:18}}>
        {/* Tags */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {current?.reglas?.requerido&&(
            <span style={{fontSize:9,color:T.red,background:`${T.red}12`,
              padding:"2px 7px",borderRadius:20,fontWeight:700}}>OBLIGATORIA</span>
          )}
          {current?.metodologia&&(
            <span style={{fontSize:9,color:T.violet,background:`${T.violet}12`,
              padding:"2px 7px",borderRadius:20,fontWeight:700}}>
              {current.metodologia}
            </span>
          )}
          {current?.reglas?.max_opciones&&(
            <span style={{fontSize:9,color:T.yellow,background:`${T.yellow}12`,
              padding:"2px 7px",borderRadius:20,fontWeight:700}}>
              MÁX {current.reglas.max_opciones}
            </span>
          )}
          {current?.tiempo_max_ms&&(
            <span style={{fontSize:9,color:T.cyan,background:`${T.cyan}10`,
              padding:"2px 7px",borderRadius:20,fontWeight:700,
              display:"flex",alignItems:"center",gap:3}}>
              <Clock size={8}/> Responde rápido
            </span>
          )}
          {current?.reglas?.salto_logico&&(
            <span style={{fontSize:9,color:T.textMuted,background:T.elevated,
              padding:"2px 7px",borderRadius:20,fontWeight:700,
              border:`1px solid ${T.border}`}}>⚡ Filtro activo</span>
          )}
        </div>

        {/* Question */}
        <div style={{fontSize:16,fontWeight:700,color:T.text,
          marginBottom:20,lineHeight:1.55}}>
          {current?.enunciado}
        </div>

        {/* Conjoint special layout */}
        {current?.tipo==="conjoint"&&current?.opciones_conjoint?(
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {current.opciones_conjoint.map((opt,oi)=>{
              const selected = resp[currentKey]===`opcion_${oi+1}`;
              return (
                <div key={oi} onClick={()=>handleChange(currentKey,`opcion_${oi+1}`,"seleccion_unica")}
                  style={{padding:"14px 16px",borderRadius:13,cursor:"pointer",transition:"all .2s",
                    background:selected?`${T.cyan}12`:T.elevated,
                    border:`2px solid ${selected?T.cyan:T.border}`,
                    boxShadow:selected?`0 0 0 3px ${T.cyan}10`:"none"}}>
                  <div style={{fontSize:11,fontWeight:700,color:selected?T.cyan:T.textMuted,
                    marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>
                    Opción {String.fromCharCode(64+oi+1)}
                  </div>
                  {typeof opt === "object" ? (
                    Object.entries(opt).map(([k,v])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",
                        fontSize:12,marginBottom:3}}>
                        <span style={{color:T.textSec}}>{k}</span>
                        <span style={{color:T.text,fontWeight:600}}>{v}</span>
                      </div>
                    ))
                  ):(
                    <div style={{fontSize:13,color:T.text}}>{opt}</div>
                  )}
                </div>
              );
            })}
          </div>
        ):(
          /* Standard options */
          <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
            {current?.opciones?.map((opt,oi)=>{
              const isMulti = current.tipo==="seleccion_multiple";
              const val = resp[currentKey]||[];
              const selected = isMulti?val.includes(opt):val===opt;
              const hasJump = current.reglas?.salto_logico?.[opt];
              return (
                <div key={oi}
                  onClick={()=>handleChange(currentKey,opt,current.tipo)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",
                    borderRadius:13,cursor:"pointer",transition:"all .15s",
                    background:selected?`${T.cyan}12`:T.elevated,
                    border:`2px solid ${selected?T.cyan:T.border}`,
                    boxShadow:selected?`0 0 0 3px ${T.cyan}08`:"none"}}>
                  <div style={{width:20,height:20,borderRadius:isMulti?5:"50%",
                    border:`2px solid ${selected?T.cyan:T.textMuted}`,
                    background:selected?T.cyan:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    flexShrink:0,transition:"all .15s"}}>
                    {selected&&<Check size={11} color="#fff"/>}
                  </div>
                  <span style={{fontSize:13,color:T.text,flex:1,lineHeight:1.4}}>{opt}</span>
                  {hasJump&&(
                    <span style={{fontSize:9,color:T.red,fontWeight:700,
                      background:`${T.red}12`,padding:"2px 7px",borderRadius:20}}>
                      FILTRO
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {errors[currentKey]&&(
          <div style={{fontSize:11,color:T.red,marginBottom:12,
            display:"flex",alignItems:"center",gap:5}}>
            <AlertCircle size={11}/>{errors[currentKey]}
          </div>
        )}

        {/* Navigation */}
        <div style={{display:"flex",gap:9}}>
          {step>0&&(
            <button onClick={()=>setStep(s=>s-1)}
              style={{flex:1,padding:"13px",borderRadius:12,
                border:`1px solid ${T.border}`,background:T.elevated,
                color:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",
                fontFamily:"inherit",display:"flex",alignItems:"center",
                justifyContent:"center",gap:5}}>
              <ArrowLeft size={14}/>Anterior
            </button>
          )}
          {step<total-1?(
            <button onClick={()=>{if(canAdvance())setStep(s=>s+1);}}
              disabled={!canAdvance()}
              style={{flex:2,padding:"13px",borderRadius:12,border:"none",
                background:canAdvance()?T.grad:T.elevated,
                color:canAdvance()?"#fff":T.textMuted,fontSize:13,fontWeight:700,
                cursor:canAdvance()?"pointer":"not-allowed",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                boxShadow:canAdvance()?"0 4px 14px rgba(6,182,212,0.3)":"none",
                transition:"all .15s"}}>
              Siguiente<ArrowRight size={14}/>
            </button>
          ):(
            <button onClick={handleSubmit} disabled={sending}
              style={{flex:2,padding:"13px",borderRadius:12,border:"none",
                background:sending?T.elevated:"linear-gradient(135deg,#10B981,#059669)",
                color:sending?T.textMuted:"#fff",fontSize:13,fontWeight:700,
                cursor:sending?"not-allowed":"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                boxShadow:sending?"none":"0 4px 14px rgba(16,185,129,0.3)",
                transition:"all .15s"}}>
              {sending
                ?<><RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/>Enviando...</>
                :<><Send size={13}/>Enviar</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PANTALLA 4: HOME (lista de encuestas asignadas)
// ═══════════════════════════════════════════════════════════════
function PantallaHome({ user, jornada, stats, pendingCount, online, onIniciarEncuesta, onCerrarJornada, encuestaAsignada }) {
  const DEMO_SURVEY = encuestaAsignada || {
    encuesta_id: "demo-001",
    titulo: "Encuesta de prueba — SurveyAI",
    sesiones: [
      { sesion:1, nombre:"Screening inicial",
        preguntas:[
          {id:1,tipo:"seleccion_unica",metodologia:"IAT",
            enunciado:"¿Tiene mascotas actualmente en su hogar?",
            opciones:["Sí, solo perro","Sí, solo gato","Sí, ambos","No tengo mascotas"],
            reglas:{requerido:true,salto_logico:{"No tengo mascotas":"FIN_CON_DESCARTE"}}},
          {id:2,tipo:"seleccion_multiple",metodologia:"Conductual",
            enunciado:"¿Cuál es su mayor complicación al alimentar sus mascotas?",
            opciones:["Espacio de almacenamiento","Gasto económico","Riesgo de consumo cruzado","Ninguna"],
            reglas:{max_opciones:2}},
        ]
      }
    ]
  };

  return (
    <div style={{flex:1,overflowY:"auto",padding:18}}>
      {/* Jornada info */}
      <div style={{background:T.card,borderRadius:14,padding:14,
        border:`1px solid ${T.cyan}18`,marginBottom:18}}>
        <div style={{fontSize:9,fontWeight:700,color:T.cyan,textTransform:"uppercase",
          letterSpacing:".07em",marginBottom:8}}>JORNADA ACTIVA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            ["📍 Comuna", jornada.comuna],
            ["🏪 Punto", jornada.tipoPunto],
            ["🕐 Inicio", jornada.hora],
            ["🛰️ GPS", jornada.gps?`${jornada.gps.lat?.slice(0,8)}...`:"Sin GPS"],
          ].map(([l,v])=>(
            <div key={l} style={{background:T.elevated,borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:T.textMuted,marginBottom:2}}>{l}</div>
              <div style={{fontSize:11,color:T.text,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {jornada.nombreLocal&&(
          <div style={{marginTop:8,fontSize:11,color:T.textSec}}>📌 {jornada.nombreLocal}</div>
        )}
      </div>

      {/* Stats del día */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:20}}>
        {[["Hoy",stats.hoy,T.green],["Total",stats.total,T.cyan],["Descartadas",stats.descartes,T.yellow]].map(([l,v,c])=>(
          <div key={l} style={{background:T.card,borderRadius:12,padding:"12px 14px",
            border:`1px solid ${T.border}`}}>
            <div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:10,color:T.textMuted}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Encuesta asignada */}
      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
        letterSpacing:".07em",marginBottom:10}}>Encuesta asignada</div>

      <div style={{background:T.card,borderRadius:16,padding:18,
        border:`1px solid ${T.border}`,marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3,lineHeight:1.4}}>
          {DEMO_SURVEY.titulo}
        </div>
        <div style={{display:"flex",gap:7,marginBottom:16,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:T.cyan,background:`${T.cyan}12`,
            padding:"2px 9px",borderRadius:20,fontWeight:700}}>
            {DEMO_SURVEY.sesiones.length} sesiones
          </span>
          <span style={{fontSize:10,color:T.violet,background:`${T.violet}12`,
            padding:"2px 9px",borderRadius:20,fontWeight:700}}>
            {DEMO_SURVEY.sesiones.reduce((a,s)=>a+(s.preguntas?.length||0),0)} preguntas
          </span>
          <span style={{fontSize:10,color:T.green,background:`${T.green}12`,
            padding:"2px 9px",borderRadius:20,fontWeight:700}}>
            {stats.hoy} realizadas hoy
          </span>
        </div>
        <button onClick={()=>onIniciarEncuesta(DEMO_SURVEY)}
          style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
            background:T.grad,color:"#fff",fontSize:14,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit",display:"flex",
            alignItems:"center",justifyContent:"center",gap:7,
            boxShadow:"0 4px 14px rgba(6,182,212,0.3)"}}>
          Nueva entrevista <ArrowRight size={15}/>
        </button>
      </div>

      <button onClick={onCerrarJornada}
        style={{width:"100%",padding:"11px",borderRadius:12,
          border:`1px solid ${T.border}`,background:"transparent",
          color:T.textMuted,fontSize:13,fontWeight:600,cursor:"pointer",
          fontFamily:"inherit",display:"flex",alignItems:"center",
          justifyContent:"center",gap:7}}>
        <LogOut size={13}/>Cerrar jornada del día
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP SHELL — CAPA 3
// ═══════════════════════════════════════════════════════════════
export default function Layer3Encuestador({ session, onLogout }) {
  const [encuestaAsignada, setEncuestaAsignada] = useState(null);

  useEffect(() => {
    // Load assigned survey from URL param or Firebase
    const params = new URLSearchParams(window.location.search);
    const encId = params.get("enc");
    if (encId) {
      import("../firebase.js").then(({ db, ref, get }) => {
        // Try to load from Firebase
        get(ref(db, `encuestas/${encId}`)).then(snap => {
          if (snap.exists()) setEncuestaAsignada({ firebase_id: encId, ...snap.val() });
        }).catch(() => {});
      }).catch(() => {});
    }
  }, []);
  const [screen, setScreen] = useState("jornada");
  const [jornada, setJornada] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("sai_jornada")||"null"); } catch { return null; }
  });
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [ficha, setFicha] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(()=>Q.count());
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState(()=>{ Stats.resetHoy(); return Stats.get(); });

  useEffect(()=>{
    const on=()=>setOnline(true);
    const off=()=>setOnline(false);
    window.addEventListener("online",on);
    window.addEventListener("offline",off);
    return()=>{ window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  },[]);

  useEffect(()=>{ if(jornada) setScreen("home"); },[]);

  const syncQueue = async () => {
    const q = Q.get();
    if (!q.length) return;
    setSyncing(true);
    for (const item of q) {
      try { await guardarRespuesta(item); Q.remove(item.local_id); setPendingCount(Q.count()); }
      catch { break; }
    }
    setSyncing(false);
  };

  const user = { id: session?.email||"enc-demo", nombre: session?.nombre||"Encuestador",
    empresa: session?.empresa||"Mi empresa" };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,
      minHeight:"100vh",color:T.text,maxWidth:480,margin:"0 auto",
      display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,button,select{font-family:inherit}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      {screen!=="jornada"&&(
        <div style={{position:"sticky",top:0,zIndex:90,background:T.surface,
          borderBottom:`1px solid ${T.border}`}}>
          <div style={{padding:"12px 18px",display:"flex",alignItems:"center",
            justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              {(screen==="ficha"||screen==="encuesta")&&(
                <div onClick={()=>setScreen(screen==="encuesta"?"ficha":"home")}
                  style={{width:30,height:30,borderRadius:8,cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    background:T.elevated,color:T.textSec}}>
                  <ArrowLeft size={14}/>
                </div>
              )}
              <div>
                <div style={{fontSize:14,fontWeight:800,color:T.text}}>
                  {screen==="home"?"Mis encuestas":screen==="ficha"?"Ficha del entrevistado":"Encuesta en curso"}
                </div>
                <div style={{fontSize:10,color:T.textMuted}}>
                  {user.nombre} · {jornada?.comuna||""}
                </div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{display:"flex",alignItems:"center",gap:4,
                background:online?`${T.green}12`:`${T.red}12`,
                padding:"3px 9px",borderRadius:20}}>
                {online?<Wifi size={9} color={T.green}/>:<WifiOff size={9} color={T.red}/>}
                <span style={{fontSize:9,fontWeight:700,
                  color:online?T.green:T.red}}>{online?"Online":"Offline"}</span>
              </div>
              <div onClick={onLogout}
                style={{width:28,height:28,borderRadius:7,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:T.elevated,color:T.textMuted}}>
                <LogOut size={12}/>
              </div>
            </div>
          </div>
          <OfflineBanner online={online} count={pendingCount}
            onSync={syncQueue} syncing={syncing}/>
        </div>
      )}

      {/* Screens */}
      {screen==="jornada"&&(
        <PantallaJornada user={user} onStart={j=>{
          setJornada(j); setScreen("home");
        }}/>
      )}

      {screen==="home"&&jornada&&(
        <PantallaHome user={user} jornada={jornada} stats={stats}
          pendingCount={pendingCount} online={online}
          onIniciarEncuesta={s=>{setActiveSurvey(s);setScreen("ficha");}}
          onCerrarJornada={()=>{
            try{localStorage.removeItem("sai_jornada");}catch{}
            setJornada(null); setScreen("jornada");
          }}/>
      )}

      {screen==="ficha"&&activeSurvey&&(
        <PantallaFicha jornada={jornada}
          onContinuar={f=>{setFicha(f);setScreen("encuesta");}}
          onCancelar={()=>setScreen("home")}/>
      )}

      {screen==="encuesta"&&activeSurvey&&(
        <PantallaEncuesta
          survey={activeSurvey} jornada={jornada} ficha={ficha}
          user={user} online={online}
          onComplete={(savedOffline)=>{
            setStats(Stats.get()); setPendingCount(Q.count());
            setTimeout(()=>{setActiveSurvey(null);setFicha(null);setScreen("home");},savedOffline?400:2400);
          }}
          onDiscard={()=>{
            setStats(Stats.get()); setPendingCount(Q.count());
            setTimeout(()=>{setActiveSurvey(null);setFicha(null);setScreen("home");},2900);
          }}/>
      )}
    </div>
  );
}
