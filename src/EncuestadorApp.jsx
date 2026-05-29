// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 3: APP ENCUESTADOR — ARQUITECTURA PRO      ║
// ║  Carga 1 vez · 100% local · Anti-apagón · Offline-first     ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, ArrowRight, ArrowLeft, Check, Send, RefreshCw,
  AlertCircle, CheckCircle, Wifi, WifiOff, Upload, LogOut, ChevronDown, Clock } from "lucide-react";
import { guardarRespuesta, cargarEncuesta } from "./firebase.js";

const T = {
  bg:"#03070E", surface:"#060C18", card:"#090F1E", elevated:"#0C1526",
  border:"rgba(6,182,212,0.1)", borderFocus:"rgba(6,182,212,0.45)",
  cyan:"#06B6D4", violet:"#7C3AED", green:"#10B981",
  red:"#EF4444", yellow:"#F59E0B",
  text:"#F1F5F9", textSec:"#64748B", textMuted:"#1A3050",
  grad:"linear-gradient(135deg,#06B6D4,#7C3AED)",
};

// ─── Almacenamiento local robusto ─────────────────────────────
const LS = {
  get: (k, def=null) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

// Cola offline
const Cola = {
  add: (item) => { const q=LS.get("sai_cola",[]); q.push({...item,_lid:`l${Date.now()}`}); LS.set("sai_cola",q); },
  get: () => LS.get("sai_cola",[]),
  remove: (lid) => LS.set("sai_cola", LS.get("sai_cola",[]).filter(i=>i._lid!==lid)),
  count: () => LS.get("sai_cola",[]).length,
};

// Stats
const Stats = {
  get: () => LS.get("sai_stats",{hoy:0,total:0,descartes:0}),
  inc: (descarte) => {
    const s=Stats.get();
    LS.set("sai_stats",{hoy:s.hoy+1,total:s.total+1,descartes:descarte?s.descartes+1:s.descartes});
  },
};

const COMUNAS = ["Cerro Navia","Santiago Centro","Maipú","La Florida","Pudahuel","Peñalolén","San Bernardo","El Bosque","Quilicura","Renca","Conchalí","Recoleta","Independencia","Providencia","Ñuñoa","Las Condes","Vitacura","Lo Barnechea","Huechuraba","Colina","Puente Alto","La Pintana","Lo Espejo","Pedro Aguirre Cerda","Lo Prado","Quinta Normal","Estación Central","Cerrillos","Padre Hurtado","Peñaflor","Talagante","Melipilla","Buin","Paine","Valparaíso","Viña del Mar","Concepción","Talcahuano","Temuco","Antofagasta","La Serena","Coquimbo","Rancagua","Talca","Arica","Iquique","Puerto Montt","Osorno","Valdivia","Punta Arenas"];
const TIPOS = ["Mall / Centro comercial","Calle / Vía pública","Feria libre","Local comercial","Supermercado / Hipermercado","Farmacia / Droguería","Centro de salud / Clínica","Establecimiento educacional","Mercado / Feria municipal","Plaza / Parque público","Otro"];

const Sel = ({value,onChange,options,placeholder=""})=>(
  <div style={{position:"relative"}}>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,borderRadius:11,
        padding:"11px 36px 11px 13px",color:value?T.text:T.textMuted,fontSize:14,outline:"none",
        appearance:"none",boxSizing:"border-box",fontFamily:"inherit"}}
      onFocus={e=>e.currentTarget.style.borderColor=T.borderFocus}
      onBlur={e=>e.currentTarget.style.borderColor=T.border}>
      <option value="">{placeholder||"Seleccionar..."}</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={13} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:T.textMuted,pointerEvents:"none"}}/>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// PANTALLA: JORNADA
// ═══════════════════════════════════════════════════════════════
function PantallaJornada({user,encuesta,onStart}){
  const [comuna,setComuna]=useState("");
  const [tipoPunto,setTipoPunto]=useState("");
  const [nombreLocal,setNombreLocal]=useState("");
  const [gps,setGps]=useState(null);
  const [gpsLoad,setGpsLoad]=useState(false);
  const [errors,setErrors]=useState({});
  const now=new Date();

  const getGPS=useCallback(()=>{
    setGpsLoad(true);
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        p=>{setGps({lat:p.coords.latitude.toFixed(6),lng:p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy)});setGpsLoad(false);},
        ()=>{setGps({lat:"-33.4489",lng:"-70.6693",acc:999,sim:true});setGpsLoad(false);},
        {timeout:8000,enableHighAccuracy:true}
      );
    }else{setGps({lat:"-33.4489",lng:"-70.6693",acc:999,sim:true});setGpsLoad(false);}
  },[]);

  useEffect(()=>{getGPS();},[]);

  const iniciar=()=>{
    const e={};
    if(!comuna)e.comuna="Requerido";
    if(!tipoPunto)e.tipoPunto="Requerido";
    if(Object.keys(e).length){setErrors(e);return;}
    const j={comuna,tipoPunto,nombreLocal,gps,
      fecha:now.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"}),
      hora:now.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"}),
      inicio:now.toISOString()};
    LS.set("sai_jornada",j);
    onStart(j);
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,button,select,textarea{font-family:inherit}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:16,background:`${T.green}15`,border:`1px solid ${T.green}30`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><MapPin size={22} color={T.green}/></div>
          <div style={{fontSize:20,fontWeight:800,color:T.text}}>Declarar jornada</div>
          {encuesta&&<div style={{fontSize:12,color:T.cyan,marginTop:4}}>📋 {encuesta.titulo}</div>}
          <div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{user?.nombre}</div>
        </div>
        <div style={{background:T.card,borderRadius:18,padding:22,border:`1px solid ${T.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:16}}>
            <div style={{background:T.elevated,borderRadius:10,padding:"10px 13px",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.textMuted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Fecha</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text,textTransform:"capitalize"}}>{now.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
            <div style={{background:T.elevated,borderRadius:10,padding:"10px 13px",border:`1px solid ${T.border}`,minWidth:70}}>
              <div style={{fontSize:9,color:T.textMuted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Hora</div>
              <div style={{fontSize:15,fontWeight:900,color:T.cyan,fontFamily:"monospace"}}>{now.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",marginBottom:5}}>Comuna *</div>
            <Sel value={comuna} onChange={v=>{setComuna(v);setErrors(e=>({...e,comuna:null}));}} options={COMUNAS} placeholder="Selecciona tu comuna"/>
            {errors.comuna&&<div style={{fontSize:11,color:T.red,marginTop:3}}>{errors.comuna}</div>}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",marginBottom:5}}>Tipo de punto *</div>
            <Sel value={tipoPunto} onChange={v=>{setTipoPunto(v);setErrors(e=>({...e,tipoPunto:null}));}} options={TIPOS} placeholder="¿Dónde estás?"/>
            {errors.tipoPunto&&<div style={{fontSize:11,color:T.red,marginTop:3}}>{errors.tipoPunto}</div>}
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",marginBottom:5}}>Local (opcional)</div>
            <input value={nombreLocal} onChange={e=>setNombreLocal(e.target.value)} placeholder="Ej: Jumbo Kennedy..."
              style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,borderRadius:11,padding:"11px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{padding:"9px 13px",borderRadius:10,marginBottom:16,background:gps?`${T.green}08`:`${T.yellow}08`,border:`1px solid ${gps?T.green+"25":T.yellow+"25"}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <MapPin size={11} color={gps?T.green:T.yellow}/>
              <span style={{fontSize:11,color:gps?T.green:T.yellow,fontWeight:600}}>{gpsLoad?"Obteniendo GPS...":gps?`GPS ±${gps.acc}m${gps.sim?" (sim)":""}`:  "Sin GPS"}</span>
            </div>
            {!gpsLoad&&<div onClick={getGPS} style={{cursor:"pointer",color:T.textMuted}}><RefreshCw size={11}/></div>}
          </div>
          <button onClick={iniciar} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:"linear-gradient(135deg,#10B981,#059669)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 4px 16px rgba(16,185,129,0.35)"}}>
            <ArrowRight size={14}/>Comenzar jornada
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PANTALLA: FICHA
// ═══════════════════════════════════════════════════════════════
function PantallaFicha({jornada,onContinuar,onCancelar}){
  const [f,setF]=useState({nombre_anonimo:"",edad_rango:"",genero:"",tipo_local:""});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  return(
    <div style={{flex:1,overflowY:"auto",padding:20}}>
      <div style={{maxWidth:420,margin:"0 auto"}}>
        <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:3}}>Ficha del entrevistado</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:16}}>{jornada.comuna} · {jornada.tipoPunto}</div>
        <div style={{background:T.card,borderRadius:16,padding:20,border:`1px solid ${T.border}`,marginBottom:14}}>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",marginBottom:5}}>Nombre / Alias (opcional)</div>
            <input value={f.nombre_anonimo} onChange={e=>s("nombre_anonimo",e.target.value)} placeholder="Anónimo si prefiere" style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,borderRadius:11,padding:"11px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",marginBottom:5}}>Rango de edad</div>
            <Sel value={f.edad_rango} onChange={v=>s("edad_rango",v)} options={["18-24","25-34","35-44","45-54","55-64","65+"]}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",marginBottom:5}}>Género</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {["Masculino","Femenino","Otro"].map(g=>(
                <div key={g} onClick={()=>s("genero",g)} style={{padding:"10px",borderRadius:10,cursor:"pointer",textAlign:"center",fontSize:12,fontWeight:600,background:f.genero===g?`${T.cyan}15`:T.elevated,color:f.genero===g?T.cyan:T.textSec,border:`1.5px solid ${f.genero===g?T.cyan:T.border}`}}>{g}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",marginBottom:5}}>Tipo de establecimiento</div>
            <Sel value={f.tipo_local} onChange={v=>s("tipo_local",v)} options={["Almacén/Minimarket","Supermercado","Mall","Feria","Calle","Otro"]}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancelar} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.border}`,background:T.elevated,color:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
          <button onClick={()=>onContinuar(f)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:T.grad,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px rgba(6,182,212,0.3)"}}>
            Iniciar encuesta <ArrowRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AGENTE LOCAL — gestiona el flujo completo de 50 preguntas
// Guarda cada respuesta en localStorage inmediatamente
// ═══════════════════════════════════════════════════════════════
function PantallaEncuesta({encuesta,jornada,ficha,user,online,sessionKey,onComplete,onDiscard}){

  // Construir lista plana de TODAS las preguntas
  const preguntas = (() => {
    const lista = [];
    const toArr = v => v?(Array.isArray(v)?v:Object.values(v)):[];
    toArr(encuesta?.sesiones).forEach((s,si)=>{
      const sesId = s.sesion??si+1;
      toArr(s.preguntas).forEach((p,pi)=>{
        if(!p?.enunciado) return;
        lista.push({
          ...p,
          id: p.id??pi+1,
          tipo: p.tipo||"seleccion_unica",
          opciones: Array.isArray(p.opciones)?p.opciones:Object.values(p.opciones||{}),
          _sesionId: sesId,
          _sesionNombre: s.nombre||`Sesión ${sesId}`,
          _key: `${sesId}_${p.id??pi+1}`,
        });
      });
    });
    return lista;
  })();

  const total = preguntas.length;
  const storageKey = `sai_resp_${sessionKey}`;
  const pasoKey = `sai_paso_${sessionKey}`;

  // Cargar estado guardado (anti-apagón)
  const [resp, setResp] = useState(()=>{
    const saved = LS.get(storageKey, null);
    if(saved) return saved;
    const r={};
    preguntas.forEach(p=>{ r[p._key]=p.tipo==="seleccion_multiple"?[]:""; });
    return r;
  });

  const [paso, setPaso] = useState(()=> LS.get(pasoKey, 0));
  const [descartado, setDescartado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const p = preguntas[paso];
  const progreso = total>0?(paso/total)*100:0;

  // Guardar respuesta inmediatamente en localStorage (anti-apagón)
  const guardarLocal = (nuevaResp, nuevoPaso) => {
    LS.set(storageKey, nuevaResp);
    if(nuevoPaso!==undefined) LS.set(pasoKey, nuevoPaso);
  };

  const responder = (val) => {
    if(!p) return;
    const tipo = p.tipo||"seleccion_unica";

    if(tipo==="seleccion_multiple"){
      setResp(r=>{
        const curr=Array.isArray(r[p._key])?r[p._key]:[];
        const ya=curr.includes(val);
        const next=ya?curr.filter(v=>v!==val):[...curr,val];
        const max=p.reglas?.max_opciones;
        if(max&&next.length>max) return r;
        const nuevaResp={...r,[p._key]:next};
        guardarLocal(nuevaResp);
        return nuevaResp;
      });
      return;
    }

    // Para todos los otros tipos: guardar directo
    const nuevaResp={...resp,[p._key]:val};
    setResp(nuevaResp);
    guardarLocal(nuevaResp);

    // Verificar descarte
    if(p.reglas?.salto_logico?.[val]==="FIN_CON_DESCARTE"){
      const payload={encuesta_id:encuesta.encuesta_id||encuesta.firebase_id,encuestador_id:user?.id||"enc-demo",es_descarte:true,jornada,ficha,respuestas:nuevaResp};
      online?guardarRespuesta(payload).catch(()=>Cola.add(payload)):Cola.add(payload);
      Stats.inc(true);
      setDescartado({opcion:val});
      setTimeout(()=>{
        LS.del(storageKey); LS.del(pasoKey);
        onDiscard();
      },2500);
    }
  };

  const avanzar = () => {
    const siguiente = paso+1;
    setPaso(siguiente);
    LS.set(pasoKey, siguiente);
  };

  const retroceder = () => {
    const anterior = paso-1;
    setPaso(anterior);
    LS.set(pasoKey, anterior);
  };

  const puedeAvanzar = () => {
    if(!p) return false;
    if(!p.reglas?.requerido) return true;
    const v=resp[p._key];
    return Array.isArray(v)?v.length>0:(v!==""&&v!==null&&v!==undefined);
  };

  const enviar = async () => {
    setEnviando(true);
    const paquete = preguntas.map((preg,i)=>({
      numero:i+1, sesion:preg._sesionId, sesion_nombre:preg._sesionNombre,
      pregunta_id:preg.id, enunciado:preg.enunciado, tipo:preg.tipo,
      metodologia:preg.metodologia||"",
      respuesta:resp[preg._key]||"",
    }));
    const payload={
      encuesta_id:encuesta.encuesta_id||encuesta.firebase_id,
      encuesta_titulo:encuesta.titulo,
      encuestador_id:user?.id||"enc-demo",
      es_descarte:false, jornada, ficha,
      respuestas_raw:resp,
      paquete_completo:paquete,
      total_preguntas:total,
      total_respondidas:paquete.filter(x=>x.respuesta!=="").length,
      enviado_at:new Date().toISOString(),
    };
    if(online){
      try{
        await guardarRespuesta(payload);
        Stats.inc(false);
        LS.del(storageKey); LS.del(pasoKey);
        setEnviando(false); setExito(true);
        setTimeout(()=>onComplete(false),2200);
      }catch{
        Cola.add(payload);
        Stats.inc(false);
        LS.del(storageKey); LS.del(pasoKey);
        setEnviando(false); onComplete(true);
      }
    }else{
      Cola.add(payload);
      Stats.inc(false);
      LS.del(storageKey); LS.del(pasoKey);
      setEnviando(false); onComplete(true);
    }
  };

  if(descartado) return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
      <div style={{fontSize:17,fontWeight:800,color:T.text,marginBottom:6}}>Encuesta descartada</div>
      <div style={{fontSize:13,color:T.textSec,marginBottom:16}}>"{descartado.opcion}"</div>
      <div style={{fontSize:13,color:T.green,background:`${T.green}12`,padding:"8px 18px",borderRadius:10,fontWeight:700}}>
        ✓ {online?"Guardado":"En cola offline"}
      </div>
    </div>
  );

  if(exito) return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{width:68,height:68,borderRadius:18,background:`${T.green}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><CheckCircle size={30} color={T.green}/></div>
      <div style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:6}}>¡Encuesta enviada!</div>
      <div style={{fontSize:13,color:T.textSec}}>{total} respuestas enviadas</div>
    </div>
  );

  if(!p||total===0) return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{fontSize:13,color:T.textMuted}}>
        No hay preguntas disponibles.<br/>
        Verifica que el link sea correcto.
      </div>
    </div>
  );

  const sesionAnterior = paso>0?preguntas[paso-1]._sesionId:null;
  const nuevaSesion = p._sesionId!==sesionAnterior;

  const renderOpciones = () => {
    try {
    const tipo=p.tipo||"seleccion_unica";
    const val=resp[p._key]||"";

    if(tipo==="conjoint"&&p.opciones_conjoint?.length>0){
      return(
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {p.opciones_conjoint.map((opt,oi)=>{
            const sel=val===`opcion_${oi+1}`;
            return(
              <div key={oi} onClick={()=>responder(`opcion_${oi+1}`)}
                style={{padding:"14px 16px",borderRadius:13,cursor:"pointer",background:sel?`${T.cyan}12`:T.elevated,border:`2px solid ${sel?T.cyan:T.border}`,transition:"all .15s"}}>
                <div style={{fontSize:11,fontWeight:700,color:sel?T.cyan:T.textMuted,marginBottom:8,textTransform:"uppercase"}}>Opción {String.fromCharCode(64+oi+1)}</div>
                {typeof opt==="object"
                  ?Object.entries(opt).map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:T.textSec}}>{k}</span><span style={{color:T.text,fontWeight:600}}>{v}</span></div>))
                  :<div style={{fontSize:13,color:T.text}}>{opt}</div>
                }
              </div>
            );
          })}
        </div>
      );
    }

    if(tipo==="nps"){
      return(
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.textMuted,marginBottom:8}}><span>0 — Nada probable</span><span>10 — Muy probable</span></div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[0,1,2,3,4,5,6,7,8,9,10].map(n=>{
              const sel=val===String(n); const c=n<=6?T.red:n<=8?T.yellow:T.green;
              return(<div key={n} onClick={()=>responder(String(n))} style={{width:40,height:40,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,transition:"all .15s",background:sel?c:T.elevated,color:sel?"#fff":T.textSec,border:`2px solid ${sel?c:T.border}`}}>{n}</div>);
            })}
          </div>
        </div>
      );
    }

    if(tipo==="likert"){
      const LABELS=["Muy en desacuerdo","En desacuerdo","Neutral","De acuerdo","Muy de acuerdo"];
      return(
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {LABELS.map((l,i)=>{
            const v=String(i+1); const sel=val===v;
            return(<div key={i} onClick={()=>responder(v)} style={{padding:"11px 15px",borderRadius:12,cursor:"pointer",background:sel?`${T.cyan}12`:T.elevated,border:`2px solid ${sel?T.cyan:T.border}`,display:"flex",alignItems:"center",gap:10,transition:"all .15s"}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:sel?T.cyan:T.elevated,border:`2px solid ${sel?T.cyan:T.textMuted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:sel?"#fff":T.textMuted}}>{i+1}</div>
              <span style={{fontSize:13,color:T.text}}>{l}</span>
            </div>);
          })}
        </div>
      );
    }

    if(tipo==="texto_corto"){
      return(
        <div style={{marginBottom:20}}>
          <textarea value={val||""} onChange={e=>responder(e.target.value)} rows={4} placeholder="Escribe tu respuesta aquí..."
            style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,borderRadius:11,padding:"12px 14px",color:T.text,fontSize:14,resize:"vertical",outline:"none",lineHeight:1.7,boxSizing:"border-box",fontFamily:"inherit"}}
            onFocus={e=>e.currentTarget.style.borderColor=T.borderFocus}
            onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
        </div>
      );
    }

    // seleccion_unica, seleccion_multiple, iat
    const isMulti=tipo==="seleccion_multiple";
    const opciones = Array.isArray(p.opciones) ? p.opciones : Object.values(p.opciones||{});
    return(
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {opciones.map((opt,oi)=>{
          if(!opt) return null;
          const sel=isMulti?(Array.isArray(val)&&val.includes(opt)):val===opt;
          const hasJump=p.reglas?.salto_logico?.[opt];
          return(
            <div key={oi} onClick={()=>responder(opt)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:13,cursor:"pointer",transition:"all .15s",background:sel?`${T.cyan}12`:T.elevated,border:`2px solid ${sel?T.cyan:T.border}`,boxShadow:sel?`0 0 0 3px ${T.cyan}08`:"none"}}>
              <div style={{width:20,height:20,borderRadius:isMulti?5:"50%",flexShrink:0,border:`2px solid ${sel?T.cyan:T.textMuted}`,background:sel?T.cyan:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                {sel&&<Check size={11} color="#fff"/>}
              </div>
              <span style={{fontSize:13,color:T.text,flex:1,lineHeight:1.4}}>{String(opt)}</span>
              {hasJump&&<span style={{fontSize:9,color:T.red,fontWeight:700,background:`${T.red}12`,padding:"2px 7px",borderRadius:20}}>FILTRO</span>}
            </div>
          );
        })}
      </div>
    );
    } catch(err) {
      console.error("[SurveyAI] renderOpciones crash:", err, "pregunta:", p);
      return (
        <div style={{padding:"14px",borderRadius:12,background:`${T.red}10`,
          border:`1px solid ${T.red}30`,marginBottom:20}}>
          <div style={{fontSize:12,color:T.red,fontWeight:700,marginBottom:6}}>
            Error al mostrar opciones
          </div>
          <div style={{fontSize:11,color:T.textSec,marginBottom:12}}>
            Tipo: {p.tipo} · Opciones: {JSON.stringify(p.opciones)?.slice(0,100)}
          </div>
          <button onClick={()=>setPaso(x=>x+1)}
            style={{padding:"8px 16px",borderRadius:8,border:"none",
              background:T.grad,color:"#fff",fontSize:12,fontWeight:700,
              cursor:"pointer",fontFamily:"inherit"}}>
            Saltar pregunta →
          </button>
        </div>
      );
    }
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <div style={{height:4,background:T.surface}}>
        <div style={{height:"100%",width:`${progreso}%`,background:T.grad,transition:"width .4s"}}/>
      </div>
      <div style={{padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,fontWeight:700,color:T.cyan,background:`${T.cyan}15`,padding:"2px 8px",borderRadius:20}}>Sesión {p._sesionId}</span>
          {nuevaSesion&&paso>0&&<span style={{fontSize:10,color:T.violet,background:`${T.violet}12`,padding:"2px 8px",borderRadius:20,fontWeight:700}}>▶ Nueva</span>}
        </div>
        <span style={{fontSize:11,color:T.textMuted,fontWeight:700}}>{paso+1}/{total}</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:18}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {p.reglas?.requerido&&<span style={{fontSize:9,color:T.red,background:`${T.red}12`,padding:"2px 7px",borderRadius:20,fontWeight:700}}>OBLIGATORIA</span>}
          {p.metodologia&&<span style={{fontSize:9,color:T.violet,background:`${T.violet}12`,padding:"2px 7px",borderRadius:20,fontWeight:700}}>{p.metodologia}</span>}
          {p.reglas?.max_opciones&&<span style={{fontSize:9,color:T.yellow,background:`${T.yellow}12`,padding:"2px 7px",borderRadius:20,fontWeight:700}}>MÁX {p.reglas.max_opciones}</span>}
          {(p.tipo==="iat"||p.tiempo_max_ms)&&<span style={{fontSize:9,color:T.cyan,background:`${T.cyan}10`,padding:"2px 7px",borderRadius:20,fontWeight:700,display:"flex",alignItems:"center",gap:3}}><Clock size={8}/>Rápido</span>}
        </div>
        <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:20,lineHeight:1.55}}>{p.enunciado||"(Sin enunciado)"}</div>
        {renderOpciones()}
        <div style={{display:"flex",gap:9}}>
          {paso>0&&(
            <button onClick={retroceder} style={{flex:1,padding:"13px",borderRadius:12,border:`1px solid ${T.border}`,background:T.elevated,color:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <ArrowLeft size={14}/>Anterior
            </button>
          )}
          {paso<total-1?(
            <button onClick={()=>{if(puedeAvanzar())avanzar();}} disabled={!puedeAvanzar()}
              style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:puedeAvanzar()?T.grad:T.elevated,color:puedeAvanzar()?"#fff":T.textMuted,fontSize:13,fontWeight:700,cursor:puedeAvanzar()?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all .15s",boxShadow:puedeAvanzar()?"0 4px 14px rgba(6,182,212,0.3)":"none"}}>
              Siguiente<ArrowRight size={14}/>
            </button>
          ):(
            <button onClick={enviar} disabled={enviando}
              style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:enviando?T.elevated:"linear-gradient(135deg,#10B981,#059669)",color:enviando?T.textMuted:"#fff",fontSize:13,fontWeight:700,cursor:enviando?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,boxShadow:enviando?"none":"0 4px 14px rgba(16,185,129,0.3)",transition:"all .15s"}}>
              {enviando?<><RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/>Enviando...</>:<><Send size={13}/>Enviar</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════
function PantallaHome({user,jornada,encuesta,stats,online,pendingCount,onIniciar,onCerrarJornada}){
  const toArr=v=>v?(Array.isArray(v)?v:Object.values(v)):[];
  const sesiones=toArr(encuesta?.sesiones);
  const totalP=sesiones.reduce((a,s)=>a+toArr(s.preguntas).length,0);

  return(
    <div style={{flex:1,overflowY:"auto",padding:18}}>
      <div style={{background:T.card,borderRadius:14,padding:14,border:`1px solid ${T.cyan}18`,marginBottom:16}}>
        <div style={{fontSize:9,fontWeight:700,color:T.cyan,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>JORNADA ACTIVA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["📍",jornada.comuna],["🏪",jornada.tipoPunto],["🕐",jornada.hora],["🛰️",jornada.gps?`±${jornada.gps.acc}m`:"Sin GPS"]].map(([l,v])=>(
            <div key={l} style={{background:T.elevated,borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:T.textMuted,marginBottom:2}}>{l}</div>
              <div style={{fontSize:11,color:T.text,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:16}}>
        {[["Hoy",stats.hoy,T.green],["Total",stats.total,T.cyan],["Desc.",stats.descartes,T.yellow]].map(([l,v,c])=>(
          <div key={l} style={{background:T.card,borderRadius:12,padding:"12px 14px",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:10,color:T.textMuted}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Encuesta asignada</div>
      <div style={{background:T.card,borderRadius:16,padding:18,border:`1px solid ${encuesta?T.cyan+"25":T.border}`,marginBottom:14}}>
        {encuesta?(
          <>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:6,lineHeight:1.4}}>{encuesta.titulo}</div>
            {encuesta.cliente&&<div style={{fontSize:11,color:T.cyan,marginBottom:8}}>🏢 {encuesta.cliente}</div>}
            <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{fontSize:10,color:T.cyan,background:`${T.cyan}12`,padding:"2px 9px",borderRadius:20,fontWeight:700}}>{sesiones.length} sesiones</span>
              <span style={{fontSize:10,color:T.violet,background:`${T.violet}12`,padding:"2px 9px",borderRadius:20,fontWeight:700}}>{totalP} preguntas</span>
              <span style={{fontSize:10,color:T.green,background:`${T.green}12`,padding:"2px 9px",borderRadius:20,fontWeight:700}}>{stats.hoy} hoy</span>
            </div>
          </>
        ):(
          <div style={{fontSize:13,color:T.textMuted,marginBottom:14,textAlign:"center",padding:"12px 0"}}>Sin encuesta asignada</div>
        )}
        <button onClick={onIniciar} disabled={!encuesta}
          style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:encuesta?T.grad:T.elevated,color:encuesta?"#fff":T.textMuted,fontSize:14,fontWeight:700,cursor:encuesta?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:encuesta?"0 4px 14px rgba(6,182,212,0.3)":"none"}}>
          Nueva entrevista <ArrowRight size={15}/>
        </button>
      </div>
      <button onClick={onCerrarJornada} style={{width:"100%",padding:"11px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        <LogOut size={13}/>Cerrar jornada
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════
export default function Layer3Encuestador({session,onLogout}){
  const encIdFromUrl = new URLSearchParams(window.location.search).get("enc");
  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(!!encIdFromUrl);
  const [sessionKey] = useState(()=>`${encIdFromUrl||"demo"}_${Date.now()}`);

  const [screen, setScreen] = useState(()=>{
    if(encIdFromUrl){
      const last=LS.get("sai_last_enc","");
      if(last!==encIdFromUrl){
        LS.del("sai_jornada");
        LS.set("sai_last_enc",encIdFromUrl);
      }
    }
    return LS.get("sai_jornada",null)?"home":"jornada";
  });

  const [jornada,setJornada]=useState(()=>LS.get("sai_jornada",null));
  const [ficha,setFicha]=useState(null);
  const [online,setOnline]=useState(navigator.onLine);
  const [pendingCount,setPendingCount]=useState(()=>Cola.count());
  const [syncing,setSyncing]=useState(false);
  const [stats,setStats]=useState(()=>Stats.get());

  // Cargar encuesta desde Firebase (una sola vez)
  useEffect(()=>{
    if(!encIdFromUrl){setLoading(false);return;}
    cargarEncuesta(encIdFromUrl).then(enc=>{
      if(enc) setEncuesta(enc);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  useEffect(()=>{
    const on=()=>setOnline(true), off=()=>setOnline(false);
    window.addEventListener("online",on); window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);

  // Auto-sync cuando vuelve internet
  useEffect(()=>{
    if(!online) return;
    const q=Cola.get();
    if(q.length===0) return;
    Promise.all(q.map(item=>
      guardarRespuesta(item).then(()=>Cola.remove(item._lid)).catch(()=>{})
    )).then(()=>setPendingCount(Cola.count()));
  },[online]);

  const user={id:session?.email||"enc-demo",nombre:session?.nombre||"Encuestador",empresa:session?.empresa||""};

  if(loading) return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{width:40,height:40,border:`2px solid ${T.cyan}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:12}}/>
      <div style={{fontSize:12,color:T.textMuted}}>Cargando encuesta...</div>
    </div>
  );

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,minHeight:"100vh",color:T.text,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,button,select,textarea{font-family:inherit}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {screen!=="jornada"&&(
        <div style={{position:"sticky",top:0,zIndex:90,background:T.surface,borderBottom:`1px solid ${T.border}`}}>
          <div style={{padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              {(screen==="ficha"||screen==="encuesta")&&(
                <div onClick={()=>setScreen(screen==="encuesta"?"ficha":"home")}
                  style={{width:30,height:30,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:T.elevated,color:T.textSec}}>
                  <ArrowLeft size={14}/>
                </div>
              )}
              <div>
                <div style={{fontSize:14,fontWeight:800,color:T.text}}>
                  {screen==="home"?"Mis encuestas":screen==="ficha"?"Ficha del entrevistado":"Encuesta en curso"}
                </div>
                <div style={{fontSize:10,color:T.textMuted}}>{user.nombre}{jornada?.comuna?` · ${jornada.comuna}`:""}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{display:"flex",alignItems:"center",gap:4,background:online?`${T.green}12`:`${T.red}12`,padding:"3px 9px",borderRadius:20}}>
                {online?<Wifi size={9} color={T.green}/>:<WifiOff size={9} color={T.red}/>}
                <span style={{fontSize:9,fontWeight:700,color:online?T.green:T.red}}>{online?"Online":"Offline"}</span>
              </div>
              {pendingCount>0&&(
                <div style={{background:`${T.yellow}20`,border:`1px solid ${T.yellow}40`,borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700,color:T.yellow}}>
                  {pendingCount} pendientes
                </div>
              )}
              <div onClick={onLogout} style={{width:28,height:28,borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:T.elevated,color:T.textMuted}}>
                <LogOut size={12}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen==="jornada"&&<PantallaJornada user={user} encuesta={encuesta} onStart={j=>{setJornada(j);setScreen("home");}}/>}
      {screen==="home"&&jornada&&<PantallaHome user={user} jornada={jornada} encuesta={encuesta} stats={stats} online={online} pendingCount={pendingCount} onIniciar={()=>setScreen("ficha")} onCerrarJornada={()=>{LS.del("sai_jornada");setJornada(null);setScreen("jornada");}}/>}
      {screen==="ficha"&&<PantallaFicha jornada={jornada} onContinuar={f=>{setFicha(f);setScreen("encuesta");}} onCancelar={()=>setScreen("home")}/>}
      {screen==="encuesta"&&encuesta&&(
        <PantallaEncuesta
          encuesta={encuesta} jornada={jornada} ficha={ficha}
          user={user} online={online} sessionKey={sessionKey}
          onComplete={off=>{setStats(Stats.get());setPendingCount(Cola.count());setTimeout(()=>{setFicha(null);setScreen("home");},off?400:2400);}}
          onDiscard={()=>{setStats(Stats.get());setPendingCount(Cola.count());setTimeout(()=>{setFicha(null);setScreen("home");},2500);}}/>
      )}
    </div>
  );
}
