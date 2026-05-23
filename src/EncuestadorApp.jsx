import { useState, useEffect, useCallback } from "react";
import {
  Wifi, WifiOff, Send, CheckCircle, AlertCircle, ArrowRight,
  ArrowLeft, RefreshCw, Clock, Check, X, Smartphone,
  LogIn, User, Lock, Eye, EyeOff, BarChart3, Database,
  Upload, ChevronRight, Clipboard, MapPin
} from "lucide-react";

// ═══════════════════════════════════════════════════════
// OFFLINE STORAGE — IndexedDB-like via localStorage
// ═══════════════════════════════════════════════════════
const Store = {
  save: (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } },
  load: (key) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch { return null; } },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
  queue: {
    add: (item) => {
      const q = Store.load("offline_queue") || [];
      q.push({ ...item, queued_at: new Date().toISOString(), local_id: `local-${Date.now()}` });
      Store.save("offline_queue", q);
    },
    get: () => Store.load("offline_queue") || [],
    remove: (localId) => {
      const q = Store.load("offline_queue") || [];
      Store.save("offline_queue", q.filter(i => i.local_id !== localId));
    },
    count: () => (Store.load("offline_queue") || []).length,
  }
};

// ═══════════════════════════════════════════════════════
// MOCK SURVEY — from the analyzed structure
// ═══════════════════════════════════════════════════════
const SURVEY = {
  encuesta_id: "e4b2a1f0-1234-5678-abcd-ef0123456789",
  titulo: "Estudio de Mercado — Alimento Mixto Mascotas",
  empresa: "Alimentos del Sur S.A.",
  preguntas: [
    { id:1, tipo:"seleccion_unica", enunciado:"¿Tiene mascotas actualmente en su hogar?",
      opciones:["Sí, solo perro","Sí, solo gato","Sí, ambos","No tengo mascotas"],
      reglas:{ requerido:true, salto_logico:{ "No tengo mascotas":"FIN_CON_DESCARTE" } } },
    { id:2, tipo:"seleccion_multiple", enunciado:"¿Cuál es su mayor complicación diaria al alimentar a sus mascotas?",
      opciones:["Espacio de almacenamiento","Riesgo de consumo cruzado","Gasto económico alto","Ninguna"],
      reglas:{ max_opciones:2 } },
    { id:3, tipo:"seleccion_unica", enunciado:"¿Qué certificación le daría confianza absoluta para comprar un alimento unificado?",
      opciones:["Respaldo Asociación Médicos Veterinarios","Estudios clínicos de Taurina/Proteína","Garantía de palatabilidad"],
      reglas:{ requerido:true } },
  ],
};

const MOCK_USER = { id:"enc-001", name:"Carlos Méndez", empresa:"Alimentos del Sur S.A.", token:"tok_abc123" };

// ═══════════════════════════════════════════════════════
// THEME — Mobile first, high contrast
// ═══════════════════════════════════════════════════════
const C = {
  bg:"#0A0F1E", surface:"#0F1729", elevated:"#151F35",
  border:"rgba(255,255,255,0.08)", primary:"#3B82F6",
  success:"#10B981", danger:"#EF4444", warning:"#F59E0B",
  text:"#F1F5F9", textSec:"#94A3B8", textMuted:"#3D5070",
};

// ═══════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handleLogin = () => {
    if(!email||!pass){setError("Completa todos los campos");return;}
    setLoading(true);
    setError("");
    setTimeout(()=>{
      if(email==="encuestador@demo.cl"&&pass==="1234"){
        Store.save("session",MOCK_USER);
        onLogin(MOCK_USER);
      } else {
        setError("Credenciales incorrectas");
        setLoading(false);
      }
    },1200);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:72,height:72,borderRadius:20,
            background:"linear-gradient(135deg,#3B82F6,#6366F1)",
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(59,130,246,0.35)"}}>
            <Clipboard size={30} color="#fff"/>
          </div>
          <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:6}}>SurveyAI</div>
          <div style={{fontSize:14,color:C.textMuted}}>App de Encuestadores</div>
        </div>

        <div style={{background:C.surface,borderRadius:20,padding:28,
          border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.textMuted,
            textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Email</div>
          <div style={{position:"relative",marginBottom:14}}>
            <User size={14} style={{position:"absolute",left:13,top:12,color:C.textMuted}}/>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="encuestador@demo.cl"
              style={{width:"100%",background:C.elevated,border:`1px solid ${C.border}`,
                borderRadius:10,padding:"11px 13px 11px 36px",color:C.text,
                fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={e=>e.currentTarget.style.borderColor="#3B82F6"}
              onBlur={e=>e.currentTarget.style.borderColor=C.border}/>
          </div>

          <div style={{fontSize:10,fontWeight:700,color:C.textMuted,
            textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Contraseña</div>
          <div style={{position:"relative",marginBottom:20}}>
            <Lock size={14} style={{position:"absolute",left:13,top:12,color:C.textMuted}}/>
            <input value={pass} onChange={e=>setPass(e.target.value)}
              type={showPass?"text":"password"} placeholder="••••"
              style={{width:"100%",background:C.elevated,border:`1px solid ${C.border}`,
                borderRadius:10,padding:"11px 40px 11px 36px",color:C.text,
                fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={e=>e.currentTarget.style.borderColor="#3B82F6"}
              onBlur={e=>e.currentTarget.style.borderColor=C.border}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <div onClick={()=>setShowPass(v=>!v)}
              style={{position:"absolute",right:13,top:12,cursor:"pointer",color:C.textMuted}}>
              {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
            </div>
          </div>

          {error&&<div style={{fontSize:12,color:C.danger,background:`${C.danger}18`,
            padding:"8px 12px",borderRadius:8,marginBottom:14,textAlign:"center"}}>{error}</div>}

          <button onClick={handleLogin} disabled={loading}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
              background:"linear-gradient(135deg,#3B82F6,#6366F1)",color:"#fff",
              fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",
              fontFamily:"inherit",opacity:loading?.7:1,
              boxShadow:"0 4px 16px rgba(59,130,246,0.4)",transition:"all .15s"}}>
            {loading?<><RefreshCw size={14} style={{display:"inline",marginRight:6,
              animation:"spin 1s linear infinite"}}/> Entrando...</>:"Ingresar"}
          </button>
        </div>

        <div style={{textAlign:"center",marginTop:20,padding:"12px 16px",
          background:`${C.warning}12`,borderRadius:12,border:`1px solid ${C.warning}25`}}>
          <div style={{fontSize:11,color:C.warning,fontWeight:600,marginBottom:2}}>Demo de acceso</div>
          <div style={{fontSize:11,color:C.textMuted}}>
            Email: encuestador@demo.cl<br/>Contraseña: 1234
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OFFLINE BANNER
// ═══════════════════════════════════════════════════════
function OfflineBanner({ online, pendingCount, onSync, syncing }) {
  return !online ? (
    <div style={{background:`${C.warning}18`,borderBottom:`1px solid ${C.warning}30`,
      padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <WifiOff size={13} color={C.warning}/>
        <span style={{fontSize:12,color:C.warning,fontWeight:600}}>
          Sin conexión — {pendingCount} {pendingCount===1?"respuesta":"respuestas"} en cola
        </span>
      </div>
    </div>
  ) : pendingCount > 0 ? (
    <div style={{background:`${C.primary}12`,borderBottom:`1px solid ${C.primary}25`,
      padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Wifi size={13} color={C.primary}/>
        <span style={{fontSize:12,color:C.primary,fontWeight:600}}>
          {pendingCount} {pendingCount===1?"respuesta pendiente":"respuestas pendientes"} por sincronizar
        </span>
      </div>
      <button onClick={onSync} disabled={syncing}
        style={{display:"flex",alignItems:"center",gap:5,background:C.primary,
          border:"none",borderRadius:7,padding:"4px 10px",color:"#fff",
          fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
        <Upload size={10}/>
        {syncing?"Sincronizando...":"Sincronizar"}
      </button>
    </div>
  ) : null;
}

// ═══════════════════════════════════════════════════════
// HOME — Lista de encuestas asignadas
// ═══════════════════════════════════════════════════════
function Home({ user, onStart, pendingCount, stats }) {
  const assigned = [
    { ...SURVEY, progress: 0, completed_today: stats.today },
  ];

  return (
    <div style={{padding:20}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:20,fontWeight:800,color:C.text}}>Hola, {user.name.split(" ")[0]} 👋</div>
        <div style={{fontSize:13,color:C.textMuted}}>{user.empresa}</div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
        {[
          ["Hoy",stats.today,C.success],
          ["Total",stats.total,C.primary],
          ["Pendientes",pendingCount,C.warning],
          ["Descartes",stats.discards,C.danger],
        ].map(([l,v,c],i)=>(
          <div key={i} style={{background:C.surface,borderRadius:14,padding:"14px 16px",
            border:`1px solid ${C.border}`}}>
            <div style={{fontSize:26,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:11,color:C.textMuted}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Encuestas asignadas */}
      <div style={{fontSize:10,fontWeight:700,color:C.textMuted,letterSpacing:".08em",
        textTransform:"uppercase",marginBottom:10}}>Encuestas asignadas</div>

      {assigned.map((s,i)=>(
        <div key={i} style={{background:C.surface,borderRadius:16,padding:18,
          border:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3,lineHeight:1.4}}>
              {s.titulo}
            </div>
            <div style={{fontSize:11,color:C.textMuted}}>{s.empresa}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <span style={{fontSize:10,color:C.primary,background:`${C.primary}18`,
              padding:"2px 8px",borderRadius:20,fontWeight:700}}>
              {s.preguntas.length} preguntas
            </span>
            <span style={{fontSize:10,color:C.success,background:`${C.success}18`,
              padding:"2px 8px",borderRadius:20,fontWeight:700}}>
              {stats.today} hoy
            </span>
          </div>
          <button onClick={()=>onStart(s)}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
              background:"linear-gradient(135deg,#3B82F6,#6366F1)",color:"#fff",
              fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              boxShadow:"0 4px 16px rgba(59,130,246,0.35)"}}>
            Iniciar encuesta <ArrowRight size={16}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SURVEY FORM — Step by step
// ═══════════════════════════════════════════════════════
function SurveyForm({ survey, user, online, onComplete, onDiscard }) {
  const init = () => {
    const s={};
    survey.preguntas.forEach(p=>{ s[p.id]=p.tipo==="seleccion_multiple"?[]:""});
    return s;
  };
  const [resp,setResp]=useState(init());
  const [step,setStep]=useState(0);
  const [discarded,setDiscarded]=useState(null);
  const [errors,setErrors]=useState({});
  const [sending,setSending]=useState(false);
  const [success,setSuccess]=useState(false);

  const current = survey.preguntas[step];
  const total = survey.preguntas.length;
  const progress = ((step) / total) * 100;

  const handleChange = useCallback((pid, val, tipo) => {
    if(tipo==="seleccion_unica") {
      const newR = {...resp,[pid]:val};
      setResp(newR);
      setErrors(e=>({...e,[pid]:undefined}));
      const pregunta = survey.preguntas.find(p=>p.id===pid);
      if(pregunta?.reglas?.salto_logico?.[val]==="FIN_CON_DESCARTE") {
        setDiscarded({opcion:val, pregunta_id:pid});
        // Save to offline queue
        Store.queue.add({
          encuesta_id:survey.encuesta_id,
          encuestador_id:user.id,
          es_descarte:true,
          pregunta_descarte_id:pid,
          respuestas:{[pid]:val},
        });
        onDiscard();
      }
    } else if(tipo==="seleccion_multiple") {
      const curr = Array.isArray(resp[pid])?resp[pid]:[];
      const already = curr.includes(val);
      const next = already?curr.filter(v=>v!==val):[...curr,val];
      const p = survey.preguntas.find(p=>p.id===pid);
      const max = p?.reglas?.max_opciones;
      if(max&&next.length>max) return;
      setResp(r=>({...r,[pid]:next}));
      setErrors(e=>({...e,[pid]:undefined}));
    }
  },[resp,survey,user,onDiscard]);

  const canAdvance = () => {
    if(!current) return false;
    if(current.reglas?.requerido) return resp[current.id]!=="";
    return true;
  };

  const handleSubmit = async () => {
    const errs={};
    survey.preguntas.forEach(p=>{
      if(!p.reglas?.requerido) return;
      const v=resp[p.id];
      if(p.tipo==="seleccion_multiple"?v.length===0:v==="") errs[p.id]="Obligatorio";
    });
    if(Object.keys(errs).length>0){setErrors(errs);return;}

    setSending(true);
    const payload = {
      encuesta_id:survey.encuesta_id,
      encuestador_id:user.id,
      es_descarte:false,
      respuestas:resp,
    };

    if(online) {
      try {
        // In production: await fetch('/api/v1/respuestas/registrar', {...})
        await new Promise(r=>setTimeout(r,1200));
        setSending(false);
        setSuccess(true);
        setTimeout(()=>onComplete(false),2000);
      } catch {
        Store.queue.add(payload);
        setSending(false);
        onComplete(true);
      }
    } else {
      Store.queue.add(payload);
      setSending(false);
      onComplete(true);
    }
  };

  // Discard screen
  if(discarded) {
    return (
      <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:18,background:`${C.warning}18`,
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <AlertCircle size={28} color={C.warning}/>
        </div>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:8}}>
          Encuesta descartada
        </div>
        <div style={{fontSize:13,color:C.textSec,marginBottom:6}}>
          Opción seleccionada: "{discarded.opcion}"
        </div>
        <div style={{fontSize:11,color:C.textMuted,background:C.surface,borderRadius:10,
          padding:"8px 14px",fontFamily:"monospace",marginBottom:24,
          border:`1px solid ${C.border}`}}>
          FIN_CON_DESCARTE — {online?"Enviado":"Guardado offline"}
        </div>
        <div style={{fontSize:13,color:C.success,background:`${C.success}18`,
          padding:"10px 20px",borderRadius:12,fontWeight:700}}>
          {online?"✓ Registrado en servidor":"✓ En cola — se enviará con internet"}
        </div>
      </div>
    );
  }

  // Success screen
  if(success) {
    return (
      <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:20,background:`${C.success}18`,
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <CheckCircle size={32} color={C.success}/>
        </div>
        <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:8}}>¡Encuesta enviada!</div>
        <div style={{fontSize:14,color:C.textSec}}>Respuestas guardadas correctamente</div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{height:3,background:C.surface}}>
        <div style={{height:"100%",width:`${progress}%`,
          background:"linear-gradient(90deg,#3B82F6,#6366F1)",transition:"width .4s"}}/>
      </div>
      <div style={{padding:"12px 20px",display:"flex",justifyContent:"space-between",
        alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontSize:12,color:C.textMuted}}>Pregunta {step+1} de {total}</span>
        <div style={{display:"flex",gap:5}}>
          {survey.preguntas.map((_,i)=>(
            <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,
              background:i<step?C.success:i===step?C.primary:C.border,
              transition:"all .3s"}}/>
          ))}
        </div>
      </div>

      <div style={{padding:20}}>
        {/* Tags */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          <span style={{fontSize:10,fontWeight:700,color:C.primary,
            background:`${C.primary}18`,padding:"2px 8px",borderRadius:20}}>
            P{step+1}
          </span>
          {current?.reglas?.requerido&&
            <span style={{fontSize:10,color:C.danger,background:`${C.danger}15`,
              padding:"2px 8px",borderRadius:20,fontWeight:700}}>OBLIGATORIA</span>}
          {current?.reglas?.max_opciones&&
            <span style={{fontSize:10,color:C.warning,background:`${C.warning}15`,
              padding:"2px 8px",borderRadius:20,fontWeight:700}}>
              MÁX {current.reglas.max_opciones}
            </span>}
          {current?.reglas?.salto_logico&&
            <span style={{fontSize:10,color:C.textMuted,background:C.surface,
              padding:"2px 8px",borderRadius:20,fontWeight:700,
              border:`1px solid ${C.border}`}}>⚡ Salto lógico</span>}
        </div>

        <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:20,lineHeight:1.5}}>
          {current?.enunciado}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
          {current?.opciones.map((opt,oi)=>{
            const isMulti = current.tipo==="seleccion_multiple";
            const selected = isMulti?(resp[current.id]||[]).includes(opt):resp[current.id]===opt;
            const hasJump = current.reglas?.salto_logico?.[opt];
            return (
              <div key={oi} onClick={()=>handleChange(current.id,opt,current.tipo)}
                style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",
                  borderRadius:14,cursor:"pointer",transition:"all .15s",
                  background:selected?`${C.primary}18`:C.surface,
                  border:`2px solid ${selected?C.primary:C.border}`,
                  boxShadow:selected?`0 0 0 3px ${C.primary}15`:"none"}}>
                <div style={{width:22,height:22,borderRadius:isMulti?6:"50%",
                  border:`2px solid ${selected?C.primary:C.textMuted}`,
                  background:selected?C.primary:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  flexShrink:0,transition:"all .15s"}}>
                  {selected&&<Check size={12} color="#fff"/>}
                </div>
                <span style={{fontSize:14,color:C.text,flex:1,lineHeight:1.4}}>{opt}</span>
                {hasJump&&<span style={{fontSize:9,color:C.danger,fontWeight:700,
                  background:`${C.danger}15`,padding:"2px 6px",borderRadius:20}}>DESCARTE</span>}
              </div>
            );
          })}
        </div>

        {errors[current?.id]&&
          <div style={{fontSize:12,color:C.danger,marginBottom:12,
            display:"flex",alignItems:"center",gap:6}}>
            <AlertCircle size={12}/>{errors[current.id]}
          </div>}

        <div style={{display:"flex",gap:10}}>
          {step>0&&(
            <button onClick={()=>setStep(s=>s-1)}
              style={{flex:1,padding:"14px",borderRadius:12,border:`1px solid ${C.border}`,
                background:C.surface,color:C.textSec,fontSize:14,fontWeight:600,
                cursor:"pointer",fontFamily:"inherit",display:"flex",
                alignItems:"center",justifyContent:"center",gap:6}}>
              <ArrowLeft size={16}/>Anterior
            </button>
          )}
          {step<total-1?(
            <button onClick={()=>{if(canAdvance())setStep(s=>s+1);}}
              disabled={current?.reglas?.requerido&&!resp[current?.id]}
              style={{flex:2,padding:"14px",borderRadius:12,border:"none",
                background:canAdvance()?"linear-gradient(135deg,#3B82F6,#6366F1)":C.elevated,
                color:canAdvance()?"#fff":C.textMuted,fontSize:14,fontWeight:700,
                cursor:canAdvance()?"pointer":"not-allowed",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                transition:"all .15s",
                boxShadow:canAdvance()?"0 4px 16px rgba(59,130,246,0.35)":"none"}}>
              Siguiente<ArrowRight size={16}/>
            </button>
          ):(
            <button onClick={handleSubmit} disabled={sending}
              style={{flex:2,padding:"14px",borderRadius:12,border:"none",
                background:sending?C.elevated:"linear-gradient(135deg,#10B981,#059669)",
                color:sending?C.textMuted:"#fff",fontSize:14,fontWeight:700,
                cursor:sending?"not-allowed":"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                boxShadow:sending?"none":"0 4px 16px rgba(16,185,129,0.35)",
                transition:"all .15s"}}>
              {sending?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>Enviando...</>
                :<><Send size={14}/>Enviar</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════
export default function EncuestadorApp() {
  const [user,setUser]=useState(()=>Store.load("session"));
  const [online,setOnline]=useState(navigator.onLine);
  const [screen,setScreen]=useState("home");
  const [activeSurvey,setActiveSurvey]=useState(null);
  const [pendingCount,setPendingCount]=useState(()=>Store.queue.count());
  const [syncing,setSyncing]=useState(false);
  const [stats,setStats]=useState(()=>Store.load("stats")||{today:0,total:0,discards:0});

  useEffect(()=>{
    const on=()=>setOnline(true);
    const off=()=>setOnline(false);
    window.addEventListener("online",on);
    window.addEventListener("offline",off);
    return ()=>{ window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  },[]);

  const handleSync = async () => {
    const queue = Store.queue.get();
    if(!queue.length) return;
    setSyncing(true);
    for(const item of queue) {
      try {
        // In production: await fetch('/api/v1/respuestas/registrar', {method:"POST",...})
        await new Promise(r=>setTimeout(r,400));
        Store.queue.remove(item.local_id);
        setPendingCount(Store.queue.count());
      } catch(e) { break; }
    }
    setSyncing(false);
  };

  const updateStats = (isDiscard) => {
    const newStats = {
      today: stats.today+1,
      total: stats.total+1,
      discards: isDiscard?stats.discards+1:stats.discards,
    };
    setStats(newStats);
    Store.save("stats",newStats);
  };

  const handleComplete = (savedOffline) => {
    updateStats(false);
    setPendingCount(Store.queue.count());
    setTimeout(()=>{
      setActiveSurvey(null);
      setScreen("home");
    },savedOffline?500:2200);
  };

  const handleDiscard = () => {
    updateStats(true);
    setPendingCount(Store.queue.count());
    setTimeout(()=>{
      setActiveSurvey(null);
      setScreen("home");
    },2500);
  };

  if(!user) return <Login onLogin={u=>{setUser(u);}}/>;

  return (
    <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      background:C.bg,minHeight:"100vh",color:C.text,maxWidth:480,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,button{font-family:inherit}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:90,background:C.surface,
        borderBottom:`1px solid ${C.border}`}}>
        <div style={{padding:"14px 20px",display:"flex",alignItems:"center",
          justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {screen==="survey"&&(
              <div onClick={()=>{setScreen("home");setActiveSurvey(null);}}
                style={{width:32,height:32,borderRadius:9,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:C.elevated,color:C.textSec}}>
                <ArrowLeft size={15}/>
              </div>
            )}
            <div>
              <div style={{fontSize:15,fontWeight:800,color:C.text}}>
                {screen==="survey"?activeSurvey?.titulo.slice(0,30)+"...":"Mis encuestas"}
              </div>
              {screen==="home"&&<div style={{fontSize:11,color:C.textMuted}}>{user.empresa}</div>}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,
              background:online?`${C.success}18`:`${C.danger}18`,
              padding:"4px 10px",borderRadius:20}}>
              {online?<Wifi size={11} color={C.success}/>:<WifiOff size={11} color={C.danger}/>}
              <span style={{fontSize:10,fontWeight:700,
                color:online?C.success:C.danger}}>{online?"Online":"Offline"}</span>
            </div>
            <div onClick={()=>{Store.remove("session");setUser(null);}}
              style={{width:32,height:32,borderRadius:9,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                background:C.elevated,color:C.textMuted}}>
              <X size={14}/>
            </div>
          </div>
        </div>
        <OfflineBanner online={online} pendingCount={pendingCount}
          onSync={handleSync} syncing={syncing}/>
      </div>

      {/* Content */}
      <div style={{paddingBottom:24}}>
        {screen==="home"&&(
          <Home user={user} pendingCount={pendingCount} stats={stats}
            onStart={s=>{setActiveSurvey(s);setScreen("survey");}}/>
        )}
        {screen==="survey"&&activeSurvey&&(
          <SurveyForm survey={activeSurvey} user={user} online={online}
            onComplete={handleComplete} onDiscard={handleDiscard}/>
        )}
      </div>
    </div>
  );
}
