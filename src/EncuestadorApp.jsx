
import { useState, useEffect, useCallback } from "react";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle,
  AlertCircle, RefreshCw, Shield, Check, X, Send, MapPin,
  Clock, Calendar, Building, Clipboard, Wifi, WifiOff,
  Upload, User, Key, LogOut, ChevronDown
} from "lucide-react";

// ─── Storage ──────────────────────────────────────────
const Store = {
  save:(k,d)=>{try{localStorage.setItem(k,JSON.stringify(d));return true;}catch{return false;}},
  load:(k)=>{try{const d=localStorage.getItem(k);return d?JSON.parse(d):null;}catch{return null;}},
  remove:(k)=>{try{localStorage.removeItem(k);}catch{}},
  queue:{
    add:(item)=>{const q=Store.load("eq")||[];q.push({...item,queued_at:new Date().toISOString(),local_id:`l-${Date.now()}`});Store.save("eq",q);},
    get:()=>Store.load("eq")||[],
    remove:(id)=>{const q=Store.load("eq")||[];Store.save("eq",q.filter(i=>i.local_id!==id));},
    count:()=>(Store.load("eq")||[]).length,
  }
};

// ─── Mock data ────────────────────────────────────────
const MOCK_USERS = [
  {id:"enc-001",name:"Carlos Méndez",email:"carlos@surveyai.cl",empresa:"Alimentos del Sur S.A.",tempPass:"Temp2025!",pass:null,firstLogin:true},
  {id:"enc-002",name:"Ana Ramírez",email:"ana@surveyai.cl",empresa:"Retail Corp Ltda.",tempPass:"Temp2025!",pass:"Ana2025!",firstLogin:false},
];
const COMUNAS = ["Cerro Navia","Santiago","Maipú","La Florida","Pudahuel","Peñalolén","San Bernardo","El Bosque","Quilicura","Renca","Conchalí","Recoleta","Independencia","Providencia","Ñuñoa","Las Condes","Vitacura","Lo Barnechea","Huechuraba","Colina","Lampa","Til Til","Pirque","San José de Maipo","Puente Alto","La Pintana","Lo Espejo","Pedro Aguirre Cerda","Lo Prado","Quinta Normal","Estación Central","Cerrillos","Maipú","Padre Hurtado","Peñaflor","Talagante","El Monte","Isla de Maipo","Melipilla","Calera de Tango","Buin","Paine"];
const TIPOS_PUNTO = ["Mall / Centro comercial","Calle / Vía pública","Feria libre","Local comercial","Supermercado","Establecimiento educacional","Centro de salud","Otro"];
const SURVEY = {
  encuesta_id:"e4b2a1f0-1234-5678-abcd-ef0123456789",
  titulo:"Estudio de Mercado — Alimento Mixto Mascotas",
  empresa:"Alimentos del Sur S.A.",
  preguntas:[
    {id:1,tipo:"seleccion_unica",enunciado:"¿Tiene mascotas actualmente en su hogar?",opciones:["Sí, solo perro","Sí, solo gato","Sí, ambos","No tengo mascotas"],reglas:{requerido:true,salto_logico:{"No tengo mascotas":"FIN_CON_DESCARTE"}}},
    {id:2,tipo:"seleccion_multiple",enunciado:"¿Cuál es su mayor complicación diaria al alimentar a sus mascotas?",opciones:["Espacio de almacenamiento","Riesgo de consumo cruzado","Gasto económico alto","Ninguna"],reglas:{max_opciones:2}},
    {id:3,tipo:"seleccion_unica",enunciado:"¿Qué certificación le daría confianza absoluta para comprar un alimento unificado?",opciones:["Respaldo Asociación Médicos Veterinarios","Estudios clínicos de Taurina/Proteína","Garantía de palatabilidad"],reglas:{requerido:true}},
  ],
};

// ─── Colors ───────────────────────────────────────────
const C = {
  bg:"#070E1C",surface:"#0B1527",card:"#0F1D35",elevated:"#132240",
  border:"rgba(6,182,212,0.12)",borderFocus:"rgba(6,182,212,0.5)",
  primary:"#06B6D4",secondary:"#8B5CF6",
  success:"#10B981",danger:"#EF4444",warning:"#F59E0B",
  text:"#F1F5F9",textSec:"#94A3B8",textMuted:"#3D5070",
  grad:"linear-gradient(135deg,#06B6D4,#8B5CF6)",
};

const checkStrength=(pw)=>{
  const checks={length:pw.length>=8,upper:/[A-Z]/.test(pw),lower:/[a-z]/.test(pw),number:/[0-9]/.test(pw),special:/[^A-Za-z0-9]/.test(pw)};
  const score=Object.values(checks).filter(Boolean).length;
  return{checks,score,label:["","Muy débil","Débil","Regular","Fuerte","Muy fuerte"][score],color:["","#EF4444","#F97316","#EAB308","#22C55E","#10B981"][score]};
};

// ─── Primitives ───────────────────────────────────────
function FieldInput({label,type="text",value,onChange,placeholder,icon:I,rightEl,error,hint}){
  const[focused,setFocused]=useState(false);
  return(
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{label}</div>}
      <div style={{position:"relative"}}>
        {I&&<I size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:focused?C.primary:C.textMuted,transition:"color .2s",pointerEvents:"none"}}/>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{width:"100%",background:C.elevated,border:`1.5px solid ${error?C.danger:focused?C.borderFocus:C.border}`,borderRadius:11,padding:`11px ${rightEl?"44px":"13px"} 11px ${I?"40px":"13px"}`,color:C.text,fontSize:14,outline:"none",fontFamily:"inherit",transition:"border .2s",boxSizing:"border-box",boxShadow:focused?`0 0 0 3px ${error?C.danger:C.primary}15`:"none"}}/>
        {rightEl&&<div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}>{rightEl}</div>}
      </div>
      {error&&<div style={{fontSize:11,color:C.danger,marginTop:4,display:"flex",alignItems:"center",gap:3}}><AlertCircle size={10}/>{error}</div>}
      {hint&&!error&&<div style={{fontSize:11,color:C.textMuted,marginTop:4}}>{hint}</div>}
    </div>
  );
}

function StrengthBar({password}){
  if(!password) return null;
  const{score,label,color,checks}=checkStrength(password);
  return(
    <div style={{marginTop:-6,marginBottom:12}}>
      <div style={{display:"flex",gap:3,marginBottom:5}}>
        {[1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=score?color:C.border,transition:"background .3s"}}/>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:color,fontWeight:700}}>{label}</span>
        <div style={{display:"flex",gap:6}}>
          {[["8+",checks.length],["A-Z",checks.upper],["0-9",checks.number],["!@#",checks.special]].map(([l,ok])=>(
            <span key={l} style={{fontSize:9,color:ok?C.success:C.textMuted,display:"flex",alignItems:"center",gap:2}}>
              {ok?<Check size={8}/>:<X size={8}/>}{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Select({label,value,onChange,options,icon:I,error}){
  const[focused,setFocused]=useState(false);
  return(
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{label}</div>}
      <div style={{position:"relative"}}>
        {I&&<I size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:focused?C.primary:C.textMuted,pointerEvents:"none"}}/>}
        <select value={value} onChange={e=>onChange(e.target.value)}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{width:"100%",background:C.elevated,border:`1.5px solid ${error?C.danger:focused?C.borderFocus:C.border}`,borderRadius:11,padding:`11px 40px 11px ${I?"40px":"13px"}`,color:value?C.text:C.textMuted,fontSize:14,outline:"none",fontFamily:"inherit",appearance:"none",boxSizing:"border-box",transition:"border .2s",boxShadow:focused?`0 0 0 3px ${C.primary}15`:"none"}}>
          <option value="">Seleccionar...</option>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:C.textMuted,pointerEvents:"none"}}/>
      </div>
      {error&&<div style={{fontSize:11,color:C.danger,marginTop:4,display:"flex",alignItems:"center",gap:3}}><AlertCircle size={10}/>{error}</div>}
    </div>
  );
}

function PrimaryBtn({children,onClick,loading,disabled,icon:I,v="primary"}){
  const bg=v==="success"?`linear-gradient(135deg,#10B981,#059669)`:C.grad;
  return(
    <button onClick={disabled||loading?undefined:onClick} disabled={disabled||loading}
      style={{width:"100%",padding:"13px 14px",borderRadius:12,border:"none",background:(disabled||loading)?C.elevated:bg,color:(disabled||loading)?C.textMuted:"#fff",fontSize:14,fontWeight:700,cursor:(disabled||loading)?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .2s",boxShadow:(disabled||loading)?"none":`0 4px 18px ${v==="success"?"#10B98140":"rgba(6,182,212,0.35)"}`}}>
      {loading?<><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/>Procesando...</>:<>{I&&<I size={14}/>}{children}</>}
    </button>
  );
}

// ─── Screen 1: Login ──────────────────────────────────
function LoginScreen({onLogin}){
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[showPass,setShowPass]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  const handleLogin=()=>{
    if(!email||!pass){setError("Completa todos los campos");return;}
    setLoading(true);setError("");
    setTimeout(()=>{
      setLoading(false);
      const user=MOCK_USERS.find(u=>u.email===email);
      if(!user){setError("Email no registrado en el sistema");return;}
      const validPass=user.firstLogin?(pass===user.tempPass):(pass===user.pass||pass===user.tempPass);
      if(!validPass){setError("Contraseña incorrecta");return;}
      Store.save("enc_session",user);
      onLogin(user);
    },1300);
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:68,height:68,borderRadius:20,background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 8px 28px rgba(6,182,212,0.35)"}}>
            <Clipboard size={28} color="#fff"/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:3}}>SurveyAI</div>
          <div style={{fontSize:12,color:C.textMuted,letterSpacing:".06em"}}>PORTAL ENCUESTADORES</div>
        </div>

        <div style={{background:C.card,borderRadius:20,padding:26,border:`1px solid ${C.border}`,boxShadow:"0 20px 50px rgba(0,0,0,.5)"}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:4}}>Iniciar sesión</div>
          <div style={{fontSize:12,color:C.textMuted,marginBottom:20}}>Accede con tus credenciales asignadas por tu empresa</div>

          {error&&<div style={{background:`${C.danger}14`,border:`1px solid ${C.danger}30`,borderRadius:10,padding:"9px 13px",marginBottom:14,fontSize:13,color:C.danger,display:"flex",alignItems:"center",gap:7}}><AlertCircle size={13}/>{error}</div>}

          <FieldInput label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@empresa.cl" icon={Mail}/>
          <FieldInput label="Contraseña" type={showPass?"text":"password"} value={pass} onChange={setPass} placeholder="Tu contraseña temporal o actual" icon={Lock}
            rightEl={<div onClick={()=>setShowPass(v=>!v)} style={{cursor:"pointer",color:C.textMuted}}>{showPass?<EyeOff size={14}/>:<Eye size={14}/>}</div>}/>

          <PrimaryBtn onClick={handleLogin} loading={loading} icon={ArrowRight}>Ingresar</PrimaryBtn>
        </div>

        <div style={{marginTop:16,padding:"10px 14px",background:`${C.warning}10`,borderRadius:12,border:`1px solid ${C.warning}25`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.warning,marginBottom:4,letterSpacing:".05em"}}>CUENTAS DEMO</div>
          <div style={{fontSize:11,color:C.textMuted,lineHeight:1.8}}>
            <span style={{color:C.primary}}>carlos@surveyai.cl</span> / <span style={{color:C.textSec}}>Temp2025!</span> (primer login)<br/>
            <span style={{color:C.primary}}>ana@surveyai.cl</span> / <span style={{color:C.textSec}}>Ana2025!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Change password (first login) ──────────
function ChangePasswordScreen({user,onDone}){
  const[newPass,setNewPass]=useState("");
  const[confirm,setConfirm]=useState("");
  const[showNew,setShowNew]=useState(false);
  const[loading,setLoading]=useState(false);
  const[errors,setErrors]=useState({});

  const handle=()=>{
    const e={};
    const{score}=checkStrength(newPass);
    if(score<3) e.pass="Contraseña demasiado débil";
    if(newPass!==confirm) e.confirm="Las contraseñas no coinciden";
    if(newPass===user.tempPass) e.pass="No puedes usar la contraseña temporal";
    if(Object.keys(e).length){setErrors(e);return;}
    setLoading(true);
    setTimeout(()=>{
      const updated={...user,pass:newPass,firstLogin:false,tempPass:null};
      Store.save("enc_session",updated);
      onDone(updated);
    },1200);
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:60,height:60,borderRadius:18,background:`${C.warning}18`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:`1px solid ${C.warning}30`}}>
            <Key size={24} color={C.warning}/>
          </div>
          <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:5}}>Cambia tu contraseña</div>
          <div style={{fontSize:13,color:C.textMuted,lineHeight:1.6}}>Es tu primer acceso. Crea una contraseña personal segura para continuar.</div>
        </div>

        <div style={{background:C.card,borderRadius:20,padding:26,border:`1px solid ${C.border}`}}>
          <div style={{padding:"10px 13px",background:`${C.primary}08`,borderRadius:10,border:`1px solid ${C.primary}18`,marginBottom:18,fontSize:12,color:C.textSec}}>
            <Shield size={12} color={C.primary} style={{display:"inline",marginRight:5}}/>
            Hola <strong style={{color:C.text}}>{user.name}</strong> · {user.empresa}
          </div>
          <FieldInput label="Nueva contraseña" type={showNew?"text":"password"} value={newPass} onChange={setNewPass} placeholder="Mín. 8 caracteres" icon={Lock} error={errors.pass} hint="Usa mayúsculas, números y símbolos"
            rightEl={<div onClick={()=>setShowNew(v=>!v)} style={{cursor:"pointer",color:C.textMuted}}>{showNew?<EyeOff size={14}/>:<Eye size={14}/>}</div>}/>
          <StrengthBar password={newPass}/>
          <FieldInput label="Confirmar contraseña" type="password" value={confirm} onChange={setConfirm} placeholder="Repite tu contraseña" icon={Lock} error={errors.confirm}/>
          <PrimaryBtn onClick={handle} loading={loading} icon={Check}>Establecer contraseña</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Jornada ────────────────────────────────
function JornadaScreen({user,onStart}){
  const[comuna,setComuna]=useState("");
  const[tipoPunto,setTipoPunto]=useState("");
  const[nombreLocal,setNombreLocal]=useState("");
  const[gps,setGps]=useState(null);
  const[gpsLoading,setGpsLoading]=useState(false);
  const[errors,setErrors]=useState({});
  const now=new Date();
  const fecha=now.toLocaleDateString("es-CL",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const hora=now.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"});

  const getGPS=()=>{
    setGpsLoading(true);
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        pos=>{ setGps({lat:pos.coords.latitude.toFixed(6),lng:pos.coords.longitude.toFixed(6),acc:Math.round(pos.coords.accuracy)}); setGpsLoading(false); },
        ()=>{ setGps({lat:"-33.4489",lng:"-70.6693",acc:50,simulated:true}); setGpsLoading(false); }
      );
    } else { setGps({lat:"-33.4489",lng:"-70.6693",acc:50,simulated:true}); setGpsLoading(false); }
  };

  useEffect(()=>{ getGPS(); },[]);

  const handle=()=>{
    const e={};
    if(!comuna) e.comuna="Selecciona una comuna";
    if(!tipoPunto) e.tipoPunto="Selecciona el tipo de punto";
    if(Object.keys(e).length){setErrors(e);return;}
    onStart({comuna,tipoPunto,nombreLocal,gps,fecha,hora,inicio:new Date().toISOString()});
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:60,height:60,borderRadius:18,background:`${C.success}18`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:`1px solid ${C.success}30`}}>
            <MapPin size={24} color={C.success}/>
          </div>
          <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:3}}>Declarar jornada</div>
          <div style={{fontSize:12,color:C.textMuted}}>¿Dónde trabajarás hoy?</div>
        </div>

        <div style={{background:C.card,borderRadius:20,padding:24,border:`1px solid ${C.border}`,marginBottom:14}}>
          {/* Fecha y hora automática */}
          <div style={{display:"flex",gap:10,marginBottom:18}}>
            <div style={{flex:1,background:C.elevated,borderRadius:10,padding:"10px 13px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,color:C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Fecha</div>
              <div style={{fontSize:12,color:C.text,fontWeight:600,textTransform:"capitalize"}}>{fecha}</div>
            </div>
            <div style={{width:80,background:C.elevated,borderRadius:10,padding:"10px 13px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,color:C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Hora</div>
              <div style={{fontSize:14,color:C.primary,fontWeight:800}}>{hora}</div>
            </div>
          </div>

          <Select label="Comuna *" value={comuna} onChange={setComuna} options={COMUNAS} icon={MapPin} error={errors.comuna}/>
          <Select label="Tipo de punto *" value={tipoPunto} onChange={setTipoPunto} options={TIPOS_PUNTO} icon={Building} error={errors.tipoPunto}/>
          <FieldInput label="Nombre del local (opcional)" value={nombreLocal} onChange={setNombreLocal} placeholder="Ej: Jumbo Apoquindo, Feria San Miguel..." icon={Building}/>

          {/* GPS */}
          <div style={{background:C.elevated,borderRadius:10,padding:"11px 13px",border:`1px solid ${gps?C.success+"30":C.border}`,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <MapPin size={13} color={gps?C.success:C.textMuted}/>
                <span style={{fontSize:12,color:gps?C.success:C.textMuted,fontWeight:600}}>
                  {gpsLoading?"Obteniendo ubicación...":gps?`GPS: ${gps.lat}, ${gps.lng} (±${gps.acc}m)${gps.simulated?" (simulado)":""}`:("Sin GPS")}
                </span>
              </div>
              {!gpsLoading&&<div onClick={getGPS} style={{cursor:"pointer",color:C.primary}}><RefreshCw size={12}/></div>}
            </div>
          </div>

          <PrimaryBtn onClick={handle} icon={ArrowRight} v="success">Comenzar jornada</PrimaryBtn>
        </div>

        <div style={{textAlign:"center",fontSize:11,color:C.textMuted}}>
          Encuestador: <strong style={{color:C.textSec}}>{user.name}</strong> · {user.empresa}
        </div>
      </div>
    </div>
  );
}

// ─── Offline Banner ───────────────────────────────────
function OfflineBanner({online,count,onSync,syncing}){
  return !online?(
    <div style={{background:`${C.warning}18`,borderBottom:`1px solid ${C.warning}30`,padding:"7px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}><WifiOff size={12} color={C.warning}/><span style={{fontSize:11,color:C.warning,fontWeight:600}}>Sin conexión — {count} en cola</span></div>
    </div>
  ):count>0?(
    <div style={{background:`${C.primary}12`,borderBottom:`1px solid ${C.primary}25`,padding:"7px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}><Wifi size={12} color={C.primary}/><span style={{fontSize:11,color:C.primary,fontWeight:600}}>{count} pendientes por sincronizar</span></div>
      <button onClick={onSync} disabled={syncing} style={{display:"flex",alignItems:"center",gap:4,background:C.primary,border:"none",borderRadius:7,padding:"3px 10px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
        <Upload size={9}/>{syncing?"...":"Sync"}
      </button>
    </div>
  ):null;
}

// ─── Survey Form ──────────────────────────────────────
function SurveyForm({survey,user,jornada,online,onComplete,onDiscard}){
  const init=()=>{const s={};survey.preguntas.forEach(p=>{s[p.id]=p.tipo==="seleccion_multiple"?[]:""});return s;};
  const[resp,setResp]=useState(init());
  const[step,setStep]=useState(0);
  const[discarded,setDiscarded]=useState(null);
  const[errors,setErrors]=useState({});
  const[sending,setSending]=useState(false);
  const[success,setSuccess]=useState(false);
  const current=survey.preguntas[step];
  const total=survey.preguntas.length;

  const handleChange=useCallback((pid,val,tipo)=>{
    if(tipo==="seleccion_unica"){
      const newR={...resp,[pid]:val};
      setResp(newR);
      setErrors(e=>({...e,[pid]:undefined}));
      const p=survey.preguntas.find(p=>p.id===pid);
      if(p?.reglas?.salto_logico?.[val]==="FIN_CON_DESCARTE"){
        setDiscarded({opcion:val,pregunta_id:pid});
        Store.queue.add({encuesta_id:survey.encuesta_id,encuestador_id:user.id,es_descarte:true,pregunta_descarte_id:pid,jornada,respuestas:{[pid]:val}});
        setTimeout(()=>onDiscard(),2500);
      }
    } else if(tipo==="seleccion_multiple"){
      const curr=Array.isArray(resp[pid])?resp[pid]:[];
      const already=curr.includes(val);
      const next=already?curr.filter(v=>v!==val):[...curr,val];
      const p=survey.preguntas.find(p=>p.id===pid);
      const max=p?.reglas?.max_opciones;
      if(max&&next.length>max) return;
      setResp(r=>({...r,[pid]:next}));
    }
  },[resp,survey,user,jornada,onDiscard]);

  const handleSubmit=async()=>{
    const errs={};
    survey.preguntas.forEach(p=>{if(!p.reglas?.requerido)return;const v=resp[p.id];if(p.tipo==="seleccion_multiple"?v.length===0:v==="")errs[p.id]="Obligatorio";});
    if(Object.keys(errs).length){setErrors(errs);return;}
    setSending(true);
    const payload={encuesta_id:survey.encuesta_id,encuestador_id:user.id,es_descarte:false,jornada,respuestas:resp};
    if(online){
      try{await new Promise(r=>setTimeout(r,1200));setSending(false);setSuccess(true);setTimeout(()=>onComplete(false),2000);}
      catch{Store.queue.add(payload);setSending(false);onComplete(true);}
    } else {Store.queue.add(payload);setSending(false);onComplete(true);}
  };

  if(discarded) return(
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{width:60,height:60,borderRadius:16,background:`${C.warning}18`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><AlertCircle size={26} color={C.warning}/></div>
      <div style={{fontSize:17,fontWeight:800,color:C.text,marginBottom:6}}>Encuesta descartada</div>
      <div style={{fontSize:13,color:C.textSec,marginBottom:8}}>"{discarded.opcion}"</div>
      <div style={{fontSize:11,color:C.textMuted,background:C.elevated,borderRadius:9,padding:"7px 13px",fontFamily:"monospace",border:`1px solid ${C.border}`,marginBottom:14}}>FIN_CON_DESCARTE → {online?"Enviado":"Guardado offline"}</div>
      <div style={{fontSize:12,color:C.success,background:`${C.success}18`,padding:"8px 18px",borderRadius:10,fontWeight:700}}>✓ {online?"Registrado":"En cola"}</div>
    </div>
  );

  if(success) return(
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{width:68,height:68,borderRadius:18,background:`${C.success}18`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><CheckCircle size={30} color={C.success}/></div>
      <div style={{fontSize:19,fontWeight:800,color:C.text,marginBottom:6}}>¡Enviada!</div>
      <div style={{fontSize:13,color:C.textSec}}>Respuestas guardadas correctamente</div>
    </div>
  );

  return(
    <div>
      <div style={{height:3,background:C.surface}}><div style={{height:"100%",width:`${(step/total)*100}%`,background:C.grad,transition:"width .4s"}}/></div>
      <div style={{padding:"11px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontSize:11,color:C.textMuted}}>P{step+1}/{total}</span>
        <div style={{display:"flex",gap:4}}>
          {survey.preguntas.map((_,i)=><div key={i} style={{width:i===step?18:5,height:5,borderRadius:3,background:i<step?C.success:i===step?C.primary:C.border,transition:"all .3s"}}/>)}
        </div>
      </div>
      <div style={{padding:18}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          <span style={{fontSize:9,fontWeight:700,color:C.primary,background:`${C.primary}18`,padding:"2px 8px",borderRadius:20}}>P{step+1}</span>
          {current?.reglas?.requerido&&<span style={{fontSize:9,color:C.danger,background:`${C.danger}15`,padding:"2px 7px",borderRadius:20,fontWeight:700}}>OBLIGATORIA</span>}
          {current?.reglas?.max_opciones&&<span style={{fontSize:9,color:C.warning,background:`${C.warning}15`,padding:"2px 7px",borderRadius:20,fontWeight:700}}>MÁX {current.reglas.max_opciones}</span>}
          {current?.reglas?.salto_logico&&<span style={{fontSize:9,color:C.textMuted,background:C.elevated,padding:"2px 7px",borderRadius:20,fontWeight:700,border:`1px solid ${C.border}`}}>⚡ Salto</span>}
        </div>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:18,lineHeight:1.5}}>{current?.enunciado}</div>
        <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
          {current?.opciones.map((opt,oi)=>{
            const isMulti=current.tipo==="seleccion_multiple";
            const selected=isMulti?(resp[current.id]||[]).includes(opt):resp[current.id]===opt;
            const hasJump=current.reglas?.salto_logico?.[opt];
            return(
              <div key={oi} onClick={()=>handleChange(current.id,opt,current.tipo)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:13,cursor:"pointer",transition:"all .15s",background:selected?`${C.primary}18`:C.surface,border:`2px solid ${selected?C.primary:C.border}`,boxShadow:selected?`0 0 0 3px ${C.primary}12`:"none"}}>
                <div style={{width:20,height:20,borderRadius:isMulti?5:"50%",border:`2px solid ${selected?C.primary:C.textMuted}`,background:selected?C.primary:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  {selected&&<Check size={11} color="#fff"/>}
                </div>
                <span style={{fontSize:13,color:C.text,flex:1,lineHeight:1.4}}>{opt}</span>
                {hasJump&&<span style={{fontSize:9,color:C.danger,fontWeight:700,background:`${C.danger}15`,padding:"2px 6px",borderRadius:20}}>DESCARTE</span>}
              </div>
            );
          })}
        </div>
        {errors[current?.id]&&<div style={{fontSize:11,color:C.danger,marginBottom:10,display:"flex",alignItems:"center",gap:5}}><AlertCircle size={11}/>{errors[current.id]}</div>}
        <div style={{display:"flex",gap:9}}>
          {step>0&&(
            <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"13px",borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,color:C.textSec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <ArrowLeft size={14}/>Anterior
            </button>
          )}
          {step<total-1?(
            <button onClick={()=>{const req=current?.reglas?.requerido;const val=resp[current?.id];const empty=Array.isArray(val)?val.length===0:val==="";if(req&&empty)return;setStep(s=>s+1);}}
              style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:C.grad,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,boxShadow:`0 4px 14px rgba(6,182,212,0.3)`}}>
              Siguiente<ArrowRight size={14}/>
            </button>
          ):(
            <button onClick={handleSubmit} disabled={sending}
              style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:sending?C.elevated:"linear-gradient(135deg,#10B981,#059669)",color:sending?C.textMuted:"#fff",fontSize:13,fontWeight:700,cursor:sending?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5,boxShadow:sending?"none":"0 4px 14px rgba(16,185,129,0.3)",transition:"all .15s"}}>
              {sending?<><RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/>Enviando...</>:<><Send size={13}/>Enviar</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────
function HomeScreen({user,jornada,onStart,pendingCount,stats,onEndJornada}){
  const surveys=[{...SURVEY,completed:stats.today}];
  return(
    <div style={{padding:18}}>
      {/* Jornada info */}
      <div style={{background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.primary}22`,marginBottom:20}}>
        <div style={{fontSize:9,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>JORNADA ACTIVA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["📍 Comuna",jornada.comuna],["🏪 Tipo punto",jornada.tipoPunto],["🕐 Inicio",jornada.hora],["📅 Fecha",new Date(jornada.inicio).toLocaleDateString("es-CL")]].map(([l,v])=>(
            <div key={l} style={{background:C.elevated,borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.textMuted,marginBottom:2}}>{l}</div>
              <div style={{fontSize:11,color:C.text,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {jornada.nombreLocal&&<div style={{marginTop:8,fontSize:11,color:C.textSec}}>📌 {jornada.nombreLocal}</div>}
        {jornada.gps&&<div style={{marginTop:6,fontSize:10,color:C.textMuted}}>🛰️ GPS: {jornada.gps.lat}, {jornada.gps.lng}</div>}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:20}}>
        {[["Hoy",stats.today,C.success],["Total",stats.total,C.primary],["Descartadas",stats.discards,C.warning]].map(([l,v,c])=>(
          <div key={l} style={{background:C.surface,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:10,color:C.textMuted}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Encuestas asignadas</div>
      {surveys.map((s,i)=>(
        <div key={i} style={{background:C.surface,borderRadius:16,padding:16,border:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3,lineHeight:1.4}}>{s.titulo}</div>
          <div style={{fontSize:11,color:C.textMuted,marginBottom:12}}>{s.empresa}</div>
          <div style={{display:"flex",gap:7,marginBottom:14}}>
            <span style={{fontSize:10,color:C.primary,background:`${C.primary}18`,padding:"2px 9px",borderRadius:20,fontWeight:700}}>{s.preguntas.length} preguntas</span>
            <span style={{fontSize:10,color:C.success,background:`${C.success}18`,padding:"2px 9px",borderRadius:20,fontWeight:700}}>{stats.today} realizadas hoy</span>
          </div>
          <button onClick={()=>onStart(s)} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:C.grad,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:`0 4px 14px rgba(6,182,212,0.3)`}}>
            Nueva encuesta <ArrowRight size={15}/>
          </button>
        </div>
      ))}

      <button onClick={onEndJornada} style={{width:"100%",padding:"11px",borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",color:C.textMuted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        <LogOut size={13}/>Cerrar jornada
      </button>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────
export default function EncuestadorApp(){
  const[screen,setScreen]=useState(()=>Store.load("enc_session")?(Store.load("enc_session").firstLogin?"changepass":"jornada"):"login");
  const[user,setUser]=useState(()=>Store.load("enc_session"));
  const[jornada,setJornada]=useState(()=>Store.load("jornada_activa"));
  const[activeSurvey,setActiveSurvey]=useState(null);
  const[online,setOnline]=useState(navigator.onLine);
  const[pendingCount,setPendingCount]=useState(()=>Store.queue.count());
  const[syncing,setSyncing]=useState(false);
  const[stats,setStats]=useState(()=>Store.load("enc_stats")||{today:0,total:0,discards:0});

  useEffect(()=>{
    const on=()=>setOnline(true);const off=()=>setOnline(false);
    window.addEventListener("online",on);window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);

  const handleSync=async()=>{
    const queue=Store.queue.get();
    if(!queue.length)return;
    setSyncing(true);
    for(const item of queue){
      try{await new Promise(r=>setTimeout(r,350));Store.queue.remove(item.local_id);setPendingCount(Store.queue.count());}
      catch{break;}
    }
    setSyncing(false);
  };

  const updateStats=(isDiscard)=>{
    const ns={today:stats.today+1,total:stats.total+1,discards:isDiscard?stats.discards+1:stats.discards};
    setStats(ns);Store.save("enc_stats",ns);
  };

  const handleComplete=(savedOffline)=>{
    updateStats(false);setPendingCount(Store.queue.count());
    setTimeout(()=>{setActiveSurvey(null);},savedOffline?300:2300);
  };

  const handleDiscard=()=>{
    updateStats(true);setPendingCount(Store.queue.count());
    setTimeout(()=>{setActiveSurvey(null);},2600);
  };

  const handleEndJornada=()=>{
    Store.remove("jornada_activa");
    setJornada(null);setScreen("jornada");
  };

  if(screen==="login"||!user) return <LoginScreen onLogin={u=>{setUser(u);if(u.firstLogin)setScreen("changepass");else setScreen("jornada");}}/>;
  if(screen==="changepass") return <ChangePasswordScreen user={user} onDone={u=>{setUser(u);setScreen("jornada");}}/>;
  if(screen==="jornada"||!jornada) return <JornadaScreen user={user} onStart={j=>{const jd={...j};Store.save("jornada_activa",jd);setJornada(jd);setScreen("home");}}/>;

  return(
    <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",background:C.bg,minHeight:"100vh",color:C.text,maxWidth:480,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}input,button,select{font-family:inherit}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
      <div style={{position:"sticky",top:0,zIndex:90,background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        <div style={{padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            {activeSurvey&&<div onClick={()=>setActiveSurvey(null)} style={{width:30,height:30,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:C.elevated,color:C.textSec}}><ArrowLeft size={14}/></div>}
            <div>
              <div style={{fontSize:14,fontWeight:800,color:C.text}}>{activeSurvey?"Encuesta en curso":"Mis encuestas"}</div>
              <div style={{fontSize:10,color:C.textMuted}}>{user.name} · {jornada?.comuna}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{display:"flex",alignItems:"center",gap:4,background:online?`${C.success}18`:`${C.danger}18`,padding:"3px 9px",borderRadius:20}}>
              {online?<Wifi size={10} color={C.success}/>:<WifiOff size={10} color={C.danger}/>}
              <span style={{fontSize:9,fontWeight:700,color:online?C.success:C.danger}}>{online?"Online":"Offline"}</span>
            </div>
          </div>
        </div>
        <OfflineBanner online={online} count={pendingCount} onSync={handleSync} syncing={syncing}/>
      </div>
      <div style={{paddingBottom:24}}>
        {!activeSurvey?<HomeScreen user={user} jornada={jornada} pendingCount={pendingCount} stats={stats} onStart={s=>setActiveSurvey(s)} onEndJornada={handleEndJornada}/>
          :<SurveyForm survey={activeSurvey} user={user} jornada={jornada} online={online} onComplete={handleComplete} onDiscard={handleDiscard}/>}
      </div>
    </div>
  );
}
