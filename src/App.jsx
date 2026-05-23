import { useState, useCallback, createContext, useContext, useEffect } from "react";
import {
  LayoutDashboard, FileText, Layers, Sparkles, MessageSquare, BarChart3, Users, Zap,
  Puzzle, Settings, ChevronLeft, ChevronRight, Bell, Search, Plus, MoreHorizontal,
  TrendingUp, Activity, Target, CheckCircle, RefreshCw, Palette, Type, AlignLeft,
  Hash, Mail, Phone, CheckSquare, Star, Sliders, Calendar, Filter, SortAsc, Grid,
  Download, X, ArrowRight, Copy, Trash2, Eye, Share2, Edit3, ChevronDown, Workflow,
  PlusCircle, GripVertical, Radio, BarChart2, Key, Check, Table as TableIcon,
  AlignJustify, Send, AlertCircle, Moon, Sun, Bot, ArrowLeft, Wand2, Menu
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

// ═══════════════════════════════════════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    id:"dark", name:"Oscuro", emoji:"🌑",
    bg:"#0F172A", surface:"#0B1120", elevated:"#131E36", elevated2:"#19274A",
    border:"rgba(255,255,255,0.07)", borderFocus:"rgba(37,99,235,0.5)",
    text:"#F1F5F9", textSec:"#94A3B8", textMuted:"#3D5070",
    primary:"#2563EB", secondary:"#6366F1", accent:"#06B6D4",
    success:"#10B981", warning:"#F59E0B", danger:"#EF4444",
    inputBg:"#0A1020", scrollThumb:"rgba(255,255,255,0.09)",
  },
  light: {
    id:"light", name:"Claro", emoji:"☀️",
    bg:"#F0F4FF", surface:"#FFFFFF", elevated:"#FFFFFF", elevated2:"#EEF2FF",
    border:"rgba(0,0,0,0.08)", borderFocus:"rgba(37,99,235,0.4)",
    text:"#0F172A", textSec:"#475569", textMuted:"#94A3B8",
    primary:"#2563EB", secondary:"#6366F1", accent:"#0891B2",
    success:"#059669", warning:"#D97706", danger:"#DC2626",
    inputBg:"#F8FAFC", scrollThumb:"rgba(0,0,0,0.12)",
  },
  midnight: {
    id:"midnight", name:"Medianoche", emoji:"🟣",
    bg:"#07071C", surface:"#0B0B22", elevated:"#10102E", elevated2:"#16163A",
    border:"rgba(139,92,246,0.1)", borderFocus:"rgba(139,92,246,0.5)",
    text:"#EDE9FE", textSec:"#A78BFA", textMuted:"#4D3D8A",
    primary:"#8B5CF6", secondary:"#EC4899", accent:"#22D3EE",
    success:"#10B981", warning:"#F59E0B", danger:"#F43F5E",
    inputBg:"#07071C", scrollThumb:"rgba(139,92,246,0.15)",
  },
  emerald: {
    id:"emerald", name:"Esmeralda", emoji:"🌿",
    bg:"#041710", surface:"#071F15", elevated:"#0A2A1C", elevated2:"#0D3424",
    border:"rgba(16,185,129,0.1)", borderFocus:"rgba(16,185,129,0.5)",
    text:"#D1FAE5", textSec:"#6EE7B7", textMuted:"#1D5C42",
    primary:"#10B981", secondary:"#06B6D4", accent:"#84CC16",
    success:"#34D399", warning:"#FBBF24", danger:"#F87171",
    inputBg:"#041710", scrollThumb:"rgba(16,185,129,0.15)",
  },
  sunset: {
    id:"sunset", name:"Atardecer", emoji:"🌅",
    bg:"#130804", surface:"#1A0D06", elevated:"#231409", elevated2:"#2D1B0C",
    border:"rgba(249,115,22,0.1)", borderFocus:"rgba(249,115,22,0.5)",
    text:"#FFF7ED", textSec:"#FED7AA", textMuted:"#7C3D0E",
    primary:"#F97316", secondary:"#EF4444", accent:"#EAB308",
    success:"#10B981", warning:"#F59E0B", danger:"#DC2626",
    inputBg:"#130804", scrollThumb:"rgba(249,115,22,0.15)",
  },
};

const ThemeCtx = createContext(THEMES.dark);
const useT = () => useContext(ThemeCtx);

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEY STRUCTURE (from the analyzed code)
// ═══════════════════════════════════════════════════════════════════════════════
const SURVEY_JSON = {
  encuesta_id: "e4b2a1f0-1234-5678-abcd-ef0123456789",
  titulo: "Estudio de Mercado - Alimento Mixto Mascotas",
  preguntas: [
    { id: 1, tipo: "seleccion_unica", enunciado: "¿Tiene mascotas actualmente en su hogar?",
      opciones: ["Sí, solo perro","Sí, solo gato","Sí, ambos","No tengo mascotas"],
      reglas: { requerido: true, salto_logico: { "No tengo mascotas": "FIN_CON_DESCARTE" } } },
    { id: 2, tipo: "seleccion_multiple", enunciado: "Al alimentar a sus mascotas, ¿cuál es su mayor complicación diaria?",
      opciones: ["Espacio de almacenamiento","Riesgo de consumo cruzado","Gasto económico alto","Ninguna"],
      reglas: { max_opciones: 2 } },
    { id: 3, tipo: "seleccion_unica", enunciado: "¿Qué certificación le daría confianza absoluta para comprar un alimento unificado?",
      opciones: ["Respaldo Asociación Médicos Veterinarios","Estudios clínicos de Taurina/Proteína","Garantía de palatabilidad"],
      reglas: { requerido: true } },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════
const trend7 = [
  {d:"L",r:42,v:118},{d:"M",r:58,v:145},{d:"X",r:51,v:132},
  {d:"J",r:74,v:180},{d:"V",r:89,v:210},{d:"S",r:63,v:155},{d:"D",r:45,v:98},
];
const nps6 = [{m:"Ene",n:42},{m:"Feb",n:47},{m:"Mar",n:51},{m:"Abr",n:48},{m:"May",n:55},{m:"Jun",n:62}];
const barQ1 = [{o:"Solo perro",c:112},{o:"Solo gato",c:67},{o:"Ambos",c:31},{o:"Descarte",c:37}];
const pieQ3 = [
  {name:"Respaldo AMV",value:48,color:"#2563EB"},
  {name:"Estudios clínicos",value:35,color:"#6366F1"},
  {name:"Palatabilidad",value:17,color:"#06B6D4"},
];
const channels = [
  {name:"Email",value:38,color:"#2563EB"},{name:"WhatsApp",value:27,color:"#10B981"},
  {name:"Web",value:20,color:"#6366F1"},{name:"QR",value:15,color:"#06B6D4"},
];
const surveysData = [
  {id:1,name:"Estudio de Mercado - Alimento Mixto Mascotas",status:"active",created:"10 May 2025",responses:247,conv:68,last:"Hace 2h",channel:"Email"},
  {id:2,name:"NPS Clientes Q2 2025",status:"active",created:"28 Abr 2025",responses:1203,conv:74,last:"Hace 15min",channel:"WhatsApp"},
  {id:3,name:"Satisfacción Post-Compra",status:"paused",created:"15 Abr 2025",responses:89,conv:45,last:"Hace 3 días",channel:"Web"},
  {id:4,name:"Investigación Nuevos Productos",status:"draft",created:"18 May 2025",responses:0,conv:0,last:"Hace 1 día",channel:"—"},
  {id:5,name:"Feedback Plataforma Digital",status:"completed",created:"01 Mar 2025",responses:3420,conv:81,last:"Hace 1 mes",channel:"Email"},
];
const automationsData = [
  {id:1,name:"Encuesta Post-Compra",trigger:"Compra completada",action:"Enviar email 24h después",on:true,runs:1203},
  {id:2,name:"Follow-up NPS Detractor",trigger:"NPS < 7",action:"Notificar en Slack",on:true,runs:47},
  {id:3,name:"Sync respuestas → CRM",trigger:"Encuesta completada",action:"Actualizar contacto HubSpot",on:false,runs:0},
  {id:4,name:"Alerta tasa baja",trigger:"Conversión < 20%",action:"Email al administrador",on:true,runs:3},
];
const segmentsData = [
  {id:1,name:"Dueños de mascotas",count:3420,filters:["¿Tiene mascotas? = Sí"],color:"#10B981"},
  {id:2,name:"Promotores NPS",count:891,filters:["NPS ≥ 9"],color:"#2563EB"},
  {id:3,name:"Detractores NPS",count:234,filters:["NPS ≤ 6"],color:"#EF4444"},
  {id:4,name:"Alta conversión",count:567,filters:["Conversión > 70%","Completadas > 3"],color:"#06B6D4"},
];
const integrationsData = [
  {name:"HubSpot",desc:"CRM y marketing",on:true,icon:"🟠"},
  {name:"Slack",desc:"Notificaciones tiempo real",on:true,icon:"🟣"},
  {name:"Google Sheets",desc:"Exportar respuestas",on:true,icon:"🟢"},
  {name:"Salesforce",desc:"CRM enterprise",on:false,icon:"🔵"},
  {name:"Zapier",desc:"Automatizaciones sin código",on:false,icon:"🟡"},
  {name:"Mailchimp",desc:"Email marketing masivo",on:false,icon:"🐒"},
  {name:"Notion",desc:"Base de conocimiento",on:false,icon:"⬛"},
  {name:"Webhooks",desc:"API personalizada REST",on:true,icon:"🔗"},
];
const recentActivity = [
  {text:"247 respuestas nuevas en Alimento Mascotas",time:"Hace 2h",type:"r"},
  {text:"Integración HubSpot sincronizada exitosamente",time:"Hace 4h",type:"i"},
  {text:"IA generó encuesta NPS automáticamente",time:"Hace 6h",type:"a"},
  {text:"Campaña Email enviada a 1,200 contactos",time:"Ayer",type:"c"},
  {text:"Automatización Post-compra activada",time:"Hace 2 días",type:"z"},
];
const blockTypes = [
  {id:"short",label:"Texto corto",icon:Type},{id:"long",label:"Texto largo",icon:AlignLeft},
  {id:"number",label:"Número",icon:Hash},{id:"email",label:"Email",icon:Mail},
  {id:"phone",label:"Teléfono",icon:Phone},{id:"single",label:"Selección única",icon:Radio},
  {id:"multi",label:"Selección múltiple",icon:CheckSquare},{id:"dropdown",label:"Dropdown",icon:ChevronDown},
  {id:"likert",label:"Escala Likert",icon:Sliders},{id:"nps",label:"NPS Score",icon:BarChart2},
  {id:"rating",label:"Valoración",icon:Star},{id:"date",label:"Fecha",icon:Calendar},
  {id:"matrix",label:"Matriz",icon:AlignJustify},{id:"logic",label:"Salto lógico",icon:Workflow},
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════
const Card = ({ children, s, onClick }) => {
  const T = useT();
  return (
    <div onClick={onClick}
      style={{ background:T.elevated, border:`1px solid ${T.border}`, borderRadius:16,
        padding:24, transition:"all .2s", cursor:onClick?"pointer":"default", ...s }}
      onMouseEnter={onClick?e=>{e.currentTarget.style.borderColor=T.borderFocus;e.currentTarget.style.transform="translateY(-1px)";}:undefined}
      onMouseLeave={onClick?e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";}:undefined}
    >{children}</div>
  );
};

const Badge = ({ type }) => {
  const T = useT();
  const map = {
    active:[`${T.success}22`,T.success,"Activa"],
    paused:[`${T.warning}22`,T.warning,"Pausada"],
    draft:[`${T.textMuted}22`,T.textMuted,"Borrador"],
    completed:[`${T.primary}22`,T.primary,"Finalizada"],
    on:[`${T.success}22`,T.success,"Conectado"],
    off:[`${T.textMuted}22`,T.textMuted,"Disponible"],
  };
  const [bg,col,label] = map[type]||map.draft;
  return <span style={{background:bg,color:col,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase"}}>{label}</span>;
};

const Btn = ({ children, v="primary", icon:I, sm, s, onClick, disabled }) => {
  const T = useT();
  const base = {display:"inline-flex",alignItems:"center",gap:6,borderRadius:10,fontWeight:600,
    cursor:disabled?"not-allowed":"pointer",border:"none",padding:sm?"6px 14px":"9px 18px",
    fontSize:sm?12:13,transition:"all .15s",fontFamily:"inherit",opacity:disabled?.5:1};
  const vs = {
    primary:{background:`linear-gradient(135deg,${T.primary},${T.secondary})`,color:"#fff",boxShadow:`0 4px 12px ${T.primary}40`},
    ghost:{background:T.elevated2,color:T.textSec,border:`1px solid ${T.border}`},
    danger:{background:`${T.danger}18`,color:T.danger,border:"none"},
    success:{background:`${T.success}18`,color:T.success,border:"none"},
  };
  return (
    <button style={{...base,...vs[v],...s}} onClick={disabled?undefined:onClick}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity=".82";e.currentTarget.style.transform="translateY(-1px)";}}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}>
      {I&&<I size={sm?12:14}/>}{children}
    </button>
  );
};

const KPI = ({ title, value, change, icon:I, color, sub }) => {
  const T = useT();
  return (
    <Card onClick={()=>{}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <div style={{width:38,height:38,borderRadius:10,background:`${color}1A`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <I size={17} color={color}/>
        </div>
        {change!==undefined&&<span style={{fontSize:11,fontWeight:700,color:change>=0?T.success:T.danger,background:change>=0?`${T.success}18`:`${T.danger}18`,padding:"3px 9px",borderRadius:20}}>
          {change>=0?"+":""}{change}%</span>}
      </div>
      <div style={{fontSize:28,fontWeight:800,color:T.text,lineHeight:1,marginBottom:4}}>{value}</div>
      <div style={{fontSize:12,color:T.textMuted,marginBottom:sub?2:0}}>{title}</div>
      {sub&&<div style={{fontSize:11,color:T.textSec}}>{sub}</div>}
    </Card>
  );
};

const Toggle = ({ on, onClick }) => {
  const T = useT();
  return (
    <div onClick={onClick} style={{width:44,height:24,borderRadius:12,background:on?T.success:"rgba(255,255,255,.1)",
      position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,borderRadius:"50%",
        background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
    </div>
  );
};

const TT = ({ active, payload, label }) => {
  const T = useT();
  return active&&payload?.length?(
    <div style={{background:T.elevated2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px"}}>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{fontSize:13,fontWeight:600,color:p.color||T.primary}}>{p.value}</div>)}
    </div>
  ):null;
};

const ThemedInput = ({ value, onChange, placeholder, multiline, style:s }) => {
  const T = useT();
  const base = {width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,
    padding:"10px 13px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",
    transition:"border .15s",resize:multiline?"vertical":"none",...s};
  const props = { value, onChange, placeholder,
    style:base,
    onFocus:e=>e.currentTarget.style.borderColor=T.borderFocus,
    onBlur:e=>e.currentTarget.style.borderColor=T.border };
  return multiline?<textarea rows={4} {...props}/>:<input {...props}/>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// THEME SWITCHER PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function ThemeSwitcher({ theme, setTheme, open, setOpen }) {
  const T = useT();
  return (
    <>
      {open&&<div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:150}}/>}
      <div style={{position:"fixed",top:0,right:open?0:-300,bottom:0,width:280,
        background:T.surface,borderLeft:`1px solid ${T.border}`,zIndex:160,
        transition:"right .3s cubic-bezier(.4,0,.2,1)",padding:24,overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontSize:15,fontWeight:800,color:T.text}}>Cambiar tema</div>
          <div onClick={()=>setOpen(false)} style={{width:30,height:30,borderRadius:8,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,
            background:T.elevated}}><X size={14}/></div>
        </div>
        <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:".07em",textTransform:"uppercase",marginBottom:12}}>
          Selecciona un tono
        </div>
        {Object.values(THEMES).map(th=>{
          const active = theme.id===th.id;
          return (
            <div key={th.id} onClick={()=>{setTheme(th);setOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,
                cursor:"pointer",marginBottom:8,border:`2px solid ${active?T.primary:T.border}`,
                background:active?`${T.primary}12`:T.elevated,transition:"all .15s"}}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.borderColor=T.borderFocus;}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.borderColor=T.border;}}>
              <span style={{fontSize:22}}>{th.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{th.name}</div>
                <div style={{display:"flex",gap:4,marginTop:5}}>
                  {[th.primary,th.secondary,th.accent,th.success].map((c,i)=>(
                    <div key={i} style={{width:12,height:12,borderRadius:4,background:c}}/>
                  ))}
                </div>
              </div>
              {active&&<Check size={15} color={T.primary}/>}
            </div>
          );
        })}
        <div style={{marginTop:24,padding:16,borderRadius:12,background:`${T.primary}10`,border:`1px solid ${T.primary}25`}}>
          <div style={{fontSize:12,color:T.textSec,lineHeight:1.6}}>
            El tema se aplica instantáneamente en toda la interfaz, incluyendo gráficos, formularios y modales.
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORM PREVIEW MODAL — Integrates GeneradorFormulario logic
// ═══════════════════════════════════════════════════════════════════════════════
function FormPreviewModal({ survey, onClose }) {
  const T = useT();
  const initState = () => {
    const s={};
    survey.preguntas.forEach(p=>{ s[p.id]=p.tipo==="seleccion_multiple"?[]:""});
    return s;
  };
  const [resp, setResp] = useState(initState());
  const [errors, setErrors] = useState({});
  const [discarded, setDiscarded] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(0); // active question index

  const current = survey.preguntas[step];
  const total = survey.preguntas.length;

  const handleChange = useCallback((pid, val, tipo) => {
    if (tipo==="seleccion_unica") {
      const newR = {...resp,[pid]:val};
      setResp(newR);
      setErrors(e=>({...e,[pid]:undefined}));
      const pregunta = survey.preguntas.find(p=>p.id===pid);
      if (pregunta?.reglas?.salto_logico?.[val]==="FIN_CON_DESCARTE") {
        setDiscarded(val);
      }
    } else if (tipo==="seleccion_multiple") {
      const current = Array.isArray(resp[pid])?resp[pid]:[];
      const already = current.includes(val);
      const next = already?current.filter(v=>v!==val):[...current,val];
      const p = survey.preguntas.find(p=>p.id===pid);
      const max = p?.reglas?.max_opciones;
      if (max&&next.length>max) return;
      setResp(r=>({...r,[pid]:next}));
      setErrors(e=>({...e,[pid]:undefined}));
    }
  },[resp,survey]);

  const validate = () => {
    const e={};
    survey.preguntas.forEach(p=>{
      if(!p.reglas?.requerido) return;
      const v=resp[p.id];
      if(p.tipo==="seleccion_multiple"?v.length===0:v==="") e[p.id]="Campo obligatorio";
    });
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if(Object.keys(e).length>0){setErrors(e);return;}
    setSending(true);
    setTimeout(()=>{setSending(false);setSubmitted(true);},1500);
  };

  const canAdvance = () => {
    if(!current) return false;
    if(current.reglas?.requerido) return resp[current.id]!=="";
    return true;
  };

  if(submitted){
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)",zIndex:300,
        display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
        <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:20,padding:48,
          textAlign:"center",maxWidth:380,border:`1px solid ${T.border}`}}>
          <div style={{width:64,height:64,borderRadius:20,background:`${T.success}20`,
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <CheckCircle size={28} color={T.success}/>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:8}}>¡Encuesta enviada!</div>
          <div style={{fontSize:13,color:T.textSec,marginBottom:24}}>Respuestas persistidas en respuestas_cabecera / respuestas_detalle</div>
          <div style={{background:T.inputBg,borderRadius:10,padding:12,fontFamily:"monospace",
            fontSize:10,color:T.textSec,textAlign:"left",marginBottom:20,border:`1px solid ${T.border}`}}>
            {`{\n  "es_descarte": false,\n  "cabecera_id": "rc-${Math.random().toString(36).slice(2,10)}",\n  "preguntas": ${total}\n}`}
          </div>
          <Btn onClick={onClose} s={{width:"100%",justifyContent:"center"}}>Cerrar preview</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",
      zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:24,
        width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"hidden",
        border:`1px solid ${T.border}`,boxShadow:`0 24px 80px rgba(0,0,0,.5)`}}>

        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <Eye size={14} color={T.primary}/>
              <span style={{fontSize:12,color:T.primary,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>Vista previa</span>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:T.text}}>{survey.titulo}</div>
          </div>
          <div onClick={onClose} style={{width:32,height:32,borderRadius:9,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            background:T.elevated,color:T.textMuted,border:`1px solid ${T.border}`}}><X size={14}/></div>
        </div>

        {/* Progress */}
        <div style={{height:3,background:T.elevated}}>
          <div style={{height:"100%",width:`${((step+1)/total)*100}%`,
            background:`linear-gradient(90deg,${T.primary},${T.secondary})`,transition:"width .4s"}}/>
        </div>

        <div style={{padding:24,overflowY:"auto",maxHeight:"calc(90vh - 140px)"}}>
          {discarded?(
            <div style={{textAlign:"center",padding:"32px 16px"}}>
              <div style={{width:52,height:52,borderRadius:14,background:`${T.danger}18`,
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <AlertCircle size={22} color={T.danger}/>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:6}}>Encuesta descartada</div>
              <div style={{fontSize:13,color:T.textSec,marginBottom:8}}>Opción seleccionada: "{discarded}"</div>
              <div style={{fontSize:11,color:T.textMuted,background:T.inputBg,borderRadius:8,
                padding:"8px 12px",fontFamily:"monospace",display:"inline-block",border:`1px solid ${T.border}`}}>
                FIN_CON_DESCARTE → respuestas_cabecera (es_descarte: true)
              </div>
              <div style={{marginTop:20}}>
                <Btn v="ghost" onClick={()=>{setDiscarded(null);setResp(initState());setStep(0);}}>Reiniciar</Btn>
              </div>
            </div>
          ):(
            <>
              {/* Question */}
              <div style={{marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11,color:T.primary,fontWeight:700,background:`${T.primary}18`,
                  padding:"2px 9px",borderRadius:20}}>P{step+1}/{total}</span>
                {current?.reglas?.requerido&&
                  <span style={{fontSize:10,color:T.danger,background:`${T.danger}15`,padding:"2px 8px",borderRadius:20,fontWeight:700}}>REQUERIDA</span>}
                {current?.reglas?.max_opciones&&
                  <span style={{fontSize:10,color:T.warning,background:`${T.warning}15`,padding:"2px 8px",borderRadius:20,fontWeight:700}}>MÁX {current.reglas.max_opciones}</span>}
                {current?.reglas?.salto_logico&&
                  <span style={{fontSize:10,color:T.accent,background:`${T.accent}15`,padding:"2px 8px",borderRadius:20,fontWeight:700,display:"flex",alignItems:"center",gap:3}}><Workflow size={8}/>SALTO</span>}
              </div>

              <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:18,lineHeight:1.5}}>
                {current?.enunciado}
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {current?.opciones.map((opt,oi)=>{
                  const isMulti = current.tipo==="seleccion_multiple";
                  const selected = isMulti?(resp[current.id]||[]).includes(opt):resp[current.id]===opt;
                  const hasJump = current.reglas?.salto_logico?.[opt];
                  return (
                    <div key={oi} onClick={()=>handleChange(current.id,opt,current.tipo)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"12px 15px",
                        borderRadius:12,cursor:"pointer",transition:"all .15s",
                        background:selected?`${T.primary}18`:T.inputBg,
                        border:`2px solid ${selected?T.primary:T.border}`}}
                      onMouseEnter={e=>{if(!selected){e.currentTarget.style.borderColor=T.borderFocus;}}}
                      onMouseLeave={e=>{if(!selected){e.currentTarget.style.borderColor=T.border;}}}>
                      <div style={{width:18,height:18,borderRadius:isMulti?5:"50%",
                        border:`2px solid ${selected?T.primary:T.textMuted}`,
                        background:selected?T.primary:"transparent",display:"flex",
                        alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                        {selected&&<Check size={10} color="#fff"/>}
                      </div>
                      <span style={{fontSize:13,color:T.text,flex:1}}>{opt}</span>
                      {hasJump&&<div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontSize:9,color:T.danger,fontWeight:700}}>→ DESCARTE</span>
                      </div>}
                    </div>
                  );
                })}
              </div>

              {errors[current?.id]&&<div style={{fontSize:12,color:T.danger,marginBottom:12}}>{errors[current.id]}</div>}

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {step>0?<Btn v="ghost" icon={ArrowLeft} onClick={()=>setStep(s=>s-1)}>Anterior</Btn>:<div/>}
                {step<total-1?(
                  <Btn icon={ArrowRight} onClick={()=>{if(canAdvance())setStep(s=>s+1);}} disabled={current?.reglas?.requerido&&!resp[current?.id]}>
                    Siguiente
                  </Btn>
                ):(
                  <Btn v="success" icon={Send} onClick={handleSubmit} disabled={sending}>
                    {sending?"Enviando...":"Enviar respuestas"}
                  </Btn>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════
const navItems = [
  {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
  {id:"surveys",label:"Encuestas",icon:FileText},
  {id:"builder",label:"Constructor",icon:Layers},
  {id:"ai",label:"IA Generadora",icon:Sparkles},
  {id:"responses",label:"Respuestas",icon:MessageSquare},
  {id:"analytics",label:"Analíticas",icon:BarChart3},
  {id:"segmentation",label:"Segmentación",icon:Users},
  {id:"automations",label:"Automatizaciones",icon:Zap},
  {id:"integrations",label:"Integraciones",icon:Puzzle},
  {id:"settings",label:"Configuración",icon:Settings},
];

function Sidebar({ page, setPage, col, setCol, isMobile, mobileOpen, setMobileOpen }) {
  const T = useT();
  // On mobile: full-width overlay drawer. On desktop: fixed sidebar with collapse.
  const sidebarStyle = isMobile ? {
    width: 260,
    transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
    boxShadow: mobileOpen ? "4px 0 40px rgba(0,0,0,.5)" : "none",
  } : {
    width: col ? 68 : 240,
    transform: "translateX(0)",
  };

  const handleNav = (id) => {
    setPage(id);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",
            backdropFilter:"blur(4px)",zIndex:99}}/>
      )}
      <div style={{
        minHeight:"100vh", background:T.surface,
        borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, bottom:0, zIndex:100, overflow:"hidden",
        transition:"width .25s cubic-bezier(.4,0,.2,1), transform .28s cubic-bezier(.4,0,.2,1), box-shadow .28s",
        ...sidebarStyle,
      }}>
        {/* Logo row */}
        <div style={{padding:"18px 14px", borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", gap:10, justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,flexShrink:0,
              background:`linear-gradient(135deg,${T.primary},${T.secondary})`,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <BarChart3 size={17} color="#fff"/>
            </div>
            {(!col || isMobile) && <div>
              <div style={{fontSize:14,fontWeight:800,color:T.text,letterSpacing:"-.01em"}}>SurveyAI</div>
              <div style={{fontSize:10,color:T.textMuted}}>Enterprise</div>
            </div>}
          </div>
          {isMobile && (
            <div onClick={()=>setMobileOpen(false)} style={{cursor:"pointer",color:T.textMuted,padding:4}}>
              <X size={16}/>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {navItems.map(item=>{
            const active=page===item.id;
            const Icon=item.icon;
            const showLabel = isMobile || !col;
            return (
              <div key={item.id} onClick={()=>handleNav(item.id)} title={(!showLabel)?item.label:undefined}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 10px",
                  borderRadius:9,marginBottom:2,cursor:"pointer",whiteSpace:"nowrap",
                  background:active?`${T.primary}18`:"transparent",
                  color:active?T.primary:T.textMuted,transition:"all .15s",
                  borderLeft:`2px solid ${active?T.primary:"transparent"}`}}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background=`rgba(255,255,255,.05)`;e.currentTarget.style.color=T.text;}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;}}}>
                <Icon size={17} style={{flexShrink:0}}/>
                {showLabel && <span style={{fontSize:14,fontWeight:active?600:400}}>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{borderTop:`1px solid ${T.border}`,padding:10}}>
          {(!col || isMobile) && (
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 10px",
              borderRadius:10,background:`${T.primary}0A`,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:8,flexShrink:0,
                background:`linear-gradient(135deg,${T.primary},${T.secondary})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:800,color:"#fff"}}>AC</div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:T.text}}>Admin Corp</div>
                <div style={{fontSize:10,color:T.textMuted}}>Plan Pro · 12.4k resp</div>
              </div>
            </div>
          )}
          {!isMobile && (
            <div onClick={()=>setCol(!col)}
              style={{display:"flex",alignItems:"center",justifyContent:col?"center":"flex-end",
                padding:"6px 8px",borderRadius:8,cursor:"pointer",color:T.textMuted}}
              onMouseEnter={e=>{e.currentTarget.style.background=`rgba(255,255,255,.05)`;e.currentTarget.style.color=T.text;}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;}}>
              {col?<ChevronRight size={15}/>:<><span style={{fontSize:11}}>Colapsar</span><ChevronLeft size={15} style={{marginLeft:6}}/></>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TopBar({ title, setThemeOpen, isMobile, onMenuClick }) {
  const T = useT();
  return (
    <div style={{height:58,display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:`0 ${isMobile?16:28}px`,borderBottom:`1px solid ${T.border}`,
      background:T.surface,position:"sticky",top:0,zIndex:90}}>

      <div style={{display:"flex",alignItems:"center",gap:isMobile?10:0}}>
        {/* Hamburger — mobile only */}
        {isMobile && (
          <div onClick={onMenuClick}
            style={{width:36,height:36,borderRadius:9,cursor:"pointer",display:"flex",
              alignItems:"center",justifyContent:"center",background:T.elevated,
              border:`1px solid ${T.border}`,color:T.textSec,flexShrink:0}}>
            <Menu size={16}/>
          </div>
        )}
        <div style={{fontSize:isMobile?15:17,fontWeight:700,color:T.text,
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
          maxWidth:isMobile?160:320}}>{title}</div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {/* Search — hidden on mobile to save space */}
        {!isMobile && (
          <div style={{display:"flex",alignItems:"center",gap:7,background:T.elevated,
            border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 12px",width:200}}>
            <Search size={13} color={T.textMuted}/>
            <input placeholder="Buscar..." style={{background:"none",border:"none",outline:"none",
              color:T.text,fontSize:13,width:"100%",fontFamily:"inherit"}}/>
            <kbd style={{fontSize:10,color:T.textMuted,background:`rgba(255,255,255,.06)`,
              padding:"1px 5px",borderRadius:4}}>⌘K</kbd>
          </div>
        )}

        {/* Theme button */}
        <div onClick={()=>setThemeOpen(true)}
          style={{width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",
            alignItems:"center",justifyContent:"center",
            background:`linear-gradient(135deg,${T.primary}30,${T.secondary}30)`,
            border:`1px solid ${T.primary}40`,color:T.primary}}
          title="Cambiar tema">
          <Palette size={15}/>
        </div>

        <div style={{width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",
          alignItems:"center",justifyContent:"center",background:T.elevated,
          border:`1px solid ${T.border}`,color:T.textMuted,position:"relative"}}
          onMouseEnter={e=>e.currentTarget.style.color=T.text}
          onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>
          <Bell size={14}/>
          <span style={{position:"absolute",top:7,right:7,width:5,height:5,
            borderRadius:"50%",background:T.danger}}/>
        </div>

        <div style={{width:34,height:34,borderRadius:8,
          background:`linear-gradient(135deg,${T.primary},${T.secondary})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",flexShrink:0}}>AC</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ setPreview }) {
  const T = useT();
  const kpis = [
    {title:"Encuestas activas",value:"12",change:8,icon:Activity,color:T.primary,sub:"3 lanzadas esta semana"},
    {title:"Respuestas totales",value:"14,287",change:22,icon:MessageSquare,color:T.success,sub:"+842 hoy"},
    {title:"Tasa de respuesta",value:"68.4%",change:5,icon:Target,color:T.accent,sub:"Industria: 45%"},
    {title:"Participantes únicos",value:"9,841",change:15,icon:Users,color:T.secondary,sub:"Última semana"},
    {title:"Conversión",value:"74.2%",change:-2,icon:TrendingUp,color:T.warning,sub:"Objetivo: 80%"},
    {title:"Encuestas finalizadas",value:"47",change:12,icon:CheckCircle,color:T.success,sub:"Este trimestre"},
  ];
  const aIcons={r:MessageSquare,i:Puzzle,a:Sparkles,c:Mail,z:Zap};
  const aColors={r:T.primary,i:T.accent,a:T.secondary,c:T.success,z:T.warning};

  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <div style={{fontSize:24,fontWeight:800,color:T.text,marginBottom:3}}>Buen día, Admin 👋</div>
          <div style={{fontSize:13,color:T.textMuted}}>Resumen ejecutivo de tu plataforma de encuestas</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" icon={RefreshCw} sm>Actualizar</Btn>
          <Btn icon={Plus} sm onClick={()=>setPreview(true)}>Previsualizar encuesta</Btn>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        {kpis.map((k,i)=><KPI key={i} {...k}/>)}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Tendencia de respuestas</div>
              <div style={{fontSize:12,color:T.textMuted}}>Respuestas vs vistas — últimos 7 días</div>
            </div>
            <Btn v="ghost" sm>Semana</Btn>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={trend7}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.primary} stopOpacity={.35}/><stop offset="95%" stopColor={T.primary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.accent} stopOpacity={.2}/><stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="d" tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="r" stroke={T.primary} fill="url(#g1)" strokeWidth={2.5} dot={false} name="Respuestas"/>
              <Area type="monotone" dataKey="v" stroke={T.accent} fill="url(#g2)" strokeWidth={2} dot={false} name="Vistas"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>Canal de distribución</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>Respuestas por fuente</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={channels} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                {channels.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {channels.map((c,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:c.color}}/>
                <span style={{fontSize:11,color:T.textSec}}>{c.name}</span>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:T.text}}>{c.value}%</span>
            </div>
          ))}
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>NPS Promedio</div>
              <div style={{fontSize:12,color:T.textMuted}}>Evolución mensual</div>
            </div>
            <div style={{fontSize:32,fontWeight:900,color:T.success}}>62</div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={nps6}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="m" tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false} domain={[30,70]}/>
              <Tooltip content={<TT/>}/>
              <Line type="monotone" dataKey="n" stroke={T.success} strokeWidth={2.5} dot={{fill:T.success,r:3.5,strokeWidth:0}} name="NPS"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Actividad reciente</div>
          {recentActivity.map((a,i)=>{
            const Icon=aIcons[a.type]||Activity;
            const col=aColors[a.type]||T.primary;
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<4?12:0}}>
                <div style={{width:30,height:30,borderRadius:8,background:`${col}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon size={12} color={col}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.text}</div>
                  <div style={{fontSize:10,color:T.textMuted}}>{a.time}</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card s={{background:`linear-gradient(135deg,${T.primary}0A,${T.secondary}06)`,borderColor:`${T.primary}28`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:34,height:34,borderRadius:10,background:`${T.primary}22`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Sparkles size={16} color={T.primary}/>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.text}}>Recomendaciones IA</div>
            <div style={{fontSize:11,color:T.textMuted}}>Basadas en tu estructura y datos actuales</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {["Tu NPS tiene 74% conversión. Activa follow-up automático para detractores.",
            "Email supera el promedio del canal. Aumenta frecuencia para maximizar alcance.",
            "Detectamos abandono en P3 del Estudio Mascotas. Simplifica opciones."
          ].map((text,i)=>(
            <div key={i} style={{background:`rgba(255,255,255,.03)`,borderRadius:10,padding:14}}>
              <div style={{fontSize:12,color:T.textSec,lineHeight:1.6,marginBottom:10}}>{text}</div>
              <div style={{fontSize:11,color:T.primary,fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",gap:4}}>
                Ver acción<ArrowRight size={9}/>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEYS LIST
// ═══════════════════════════════════════════════════════════════════════════════
function Surveys({ setPage, setPreview }) {
  const T = useT();
  const [view,setView]=useState("table");
  const [q,setQ]=useState("");
  const filtered=surveysData.filter(s=>s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Encuestas</div>
          <div style={{fontSize:13,color:T.textMuted}}>{surveysData.length} encuestas · {surveysData.filter(s=>s.status==="active").length} activas</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" icon={Download} sm>Exportar</Btn>
          <Btn icon={Eye} sm onClick={()=>setPreview(true)}>Previsualizar</Btn>
          <Btn icon={Plus} sm onClick={()=>setPage("builder")}>Nueva encuesta</Btn>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:T.elevated,
          border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 12px",flex:1,maxWidth:280}}>
          <Search size={13} color={T.textMuted}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar encuesta..."
            style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:13,width:"100%",fontFamily:"inherit"}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" icon={Filter} sm>Filtrar</Btn>
          <Btn v="ghost" icon={SortAsc} sm>Ordenar</Btn>
          <div style={{display:"flex",background:T.elevated,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
            {[["table",TableIcon],["grid",Grid]].map(([id,Icon])=>(
              <div key={id} onClick={()=>setView(id)} style={{padding:"7px 11px",cursor:"pointer",
                background:view===id?`${T.primary}22`:"transparent",
                color:view===id?T.primary:T.textMuted,transition:"all .15s"}}>
                <Icon size={14}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {view==="table"?(
        <Card s={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Nombre","Estado","Creada","Respuestas","Conversión","Actividad",""].map((h,i)=>(
                <th key={i} style={{padding:"13px 18px",textAlign:"left",fontSize:10,fontWeight:700,
                  color:T.textMuted,letterSpacing:".06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(s=>(
                <tr key={s.id} style={{borderBottom:`1px solid ${T.border}`,transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${T.primary}06`}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"15px 18px"}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{s.name}</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{s.channel}</div>
                  </td>
                  <td style={{padding:"15px 18px"}}><Badge type={s.status}/></td>
                  <td style={{padding:"15px 18px",fontSize:12,color:T.textMuted}}>{s.created}</td>
                  <td style={{padding:"15px 18px",fontSize:13,fontWeight:700,color:T.text}}>{s.responses.toLocaleString()}</td>
                  <td style={{padding:"15px 18px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,height:3,background:`${T.border}`,borderRadius:4,maxWidth:56}}>
                        <div style={{height:"100%",width:`${s.conv}%`,background:s.conv>60?T.success:T.warning,borderRadius:4}}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:T.text,minWidth:30}}>{s.conv}%</span>
                    </div>
                  </td>
                  <td style={{padding:"15px 18px",fontSize:12,color:T.textMuted}}>{s.last}</td>
                  <td style={{padding:"15px 18px"}}>
                    <div style={{display:"flex",gap:3}}>
                      {[Eye,Edit3,Copy,Trash2].map((Icon,i)=>(
                        <div key={i} onClick={i===0?()=>setPreview(true):undefined}
                          style={{width:28,height:28,borderRadius:6,cursor:"pointer",display:"flex",
                            alignItems:"center",justifyContent:"center",color:T.textMuted,transition:"all .15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background=`rgba(255,255,255,.07)`;e.currentTarget.style.color=T.text;}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;}}>
                          <Icon size={12}/>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {filtered.map(s=>(
            <Card key={s.id} onClick={()=>{}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <Badge type={s.status}/><MoreHorizontal size={14} color={T.textMuted} style={{cursor:"pointer"}}/>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,lineHeight:1.4,marginBottom:14}}>{s.name}</div>
              <div style={{display:"flex",gap:20,marginBottom:10}}>
                <div><div style={{fontSize:20,fontWeight:800,color:T.text}}>{s.responses.toLocaleString()}</div><div style={{fontSize:10,color:T.textMuted}}>Respuestas</div></div>
                <div><div style={{fontSize:20,fontWeight:800,color:s.conv>60?T.success:T.warning}}>{s.conv}%</div><div style={{fontSize:10,color:T.textMuted}}>Conversión</div></div>
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>{s.last}</div>
              <Btn v="ghost" icon={Eye} sm onClick={()=>setPreview(true)}>Previsualizar</Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDER — Live JSON + full structure integration
// ═══════════════════════════════════════════════════════════════════════════════
function Builder({ setPreview }) {
  const T = useT();
  const [selBlock,setSelBlock]=useState(null);
  const [activeQ,setActiveQ]=useState(1);
  const [survey,setSurvey]=useState(SURVEY_JSON);
  const [showJSON,setShowJSON]=useState(true);

  const liveJSON = JSON.stringify(survey, null, 2);

  return (
    <div style={{display:"flex",height:"calc(100vh - 58px)",overflow:"hidden"}}>
      {/* Block Library */}
      <div style={{width:210,borderRight:`1px solid ${T.border}`,background:T.surface,overflowY:"auto",flexShrink:0}}>
        <div style={{padding:"14px 10px"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>Bloques</div>
          {blockTypes.map(b=>{
            const Icon=b.icon;
            const sel=selBlock===b.id;
            return (
              <div key={b.id} onClick={()=>setSelBlock(b.id)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:8,cursor:"pointer",
                  background:sel?`${T.primary}18`:"transparent",
                  border:`1px solid ${sel?T.primary+"35":"transparent"}`,
                  marginBottom:3,transition:"all .15s"}}
                onMouseEnter={e=>{if(!sel)e.currentTarget.style.background=`rgba(255,255,255,.04)`;}}
                onMouseLeave={e=>{if(!sel)e.currentTarget.style.background="transparent";}}>
                <Icon size={13} color={sel?T.primary:T.textMuted}/>
                <span style={{fontSize:12,color:sel?T.text:T.textMuted}}>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div style={{flex:1,overflowY:"auto",background:T.bg,padding:24}}>
        <div style={{maxWidth:620,margin:"0 auto"}}>
          {/* Survey title */}
          <div style={{marginBottom:16,padding:"14px 18px",background:T.elevated,
            borderRadius:12,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:T.textMuted,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:5}}>Encuesta</div>
            <input value={survey.titulo} onChange={e=>setSurvey(s=>({...s,titulo:e.target.value}))}
              style={{width:"100%",background:"none",border:"none",outline:"none",
                fontSize:16,fontWeight:800,color:T.text,fontFamily:"inherit"}}/>
            <div style={{fontSize:9,color:T.textMuted,marginTop:4,fontFamily:"monospace"}}>{survey.encuesta_id}</div>
          </div>

          {survey.preguntas.map((q,idx)=>{
            const active=activeQ===q.id;
            const tipoLabel={seleccion_unica:"Selección única",seleccion_multiple:"Selección múltiple"}[q.tipo]||q.tipo;
            const TipoIcon={seleccion_unica:Radio,seleccion_multiple:CheckSquare}[q.tipo]||Type;
            return (
              <div key={q.id} onClick={()=>setActiveQ(q.id)}
                style={{marginBottom:12,padding:20,borderRadius:14,background:T.elevated,
                  border:`2px solid ${active?T.primary:T.border}`,cursor:"pointer",
                  transition:"all .2s",boxShadow:active?`0 0 0 4px ${T.primary}14`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12,flexWrap:"wrap"}}>
                  <div style={{width:22,height:22,borderRadius:6,background:`${T.primary}22`,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:10,fontWeight:800,color:T.primary}}>{idx+1}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5,padding:"2px 8px",
                    borderRadius:6,background:`${T.secondary}18`}}>
                    <TipoIcon size={10} color={T.secondary}/>
                    <span style={{fontSize:10,fontWeight:700,color:T.secondary}}>{tipoLabel}</span>
                  </div>
                  {q.reglas?.requerido&&<span style={{fontSize:9,color:T.danger,background:`${T.danger}15`,
                    padding:"2px 7px",borderRadius:6,fontWeight:700}}>REQUERIDA</span>}
                  {q.reglas?.salto_logico&&<span style={{fontSize:9,color:T.accent,background:`${T.accent}15`,
                    padding:"2px 7px",borderRadius:6,fontWeight:700,display:"flex",alignItems:"center",gap:3}}>
                    <Workflow size={8}/>SALTO LÓGICO</span>}
                  {q.reglas?.max_opciones&&<span style={{fontSize:9,color:T.warning,background:`${T.warning}15`,
                    padding:"2px 7px",borderRadius:6,fontWeight:700}}>MÁX {q.reglas.max_opciones}</span>}
                  <div style={{marginLeft:"auto",display:"flex",gap:2}}>
                    {[GripVertical,Copy,Trash2].map((Icon,i)=>(
                      <div key={i} style={{width:24,height:24,borderRadius:6,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted}}
                        onMouseEnter={e=>{e.currentTarget.style.background=`rgba(255,255,255,.07)`;e.currentTarget.style.color=T.text;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;}}>
                        <Icon size={11}/>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:10,lineHeight:1.5}}>{q.enunciado}</div>

                {q.opciones.map((opt,oi)=>{
                  const jump=q.reglas?.salto_logico?.[opt];
                  return (
                    <div key={oi} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
                      borderRadius:8,background:`${T.primary}06`,
                      border:`1px solid ${jump?T.danger+"40":T.border}`,marginBottom:5}}>
                      <div style={{width:14,height:14,borderRadius:q.tipo==="seleccion_multiple"?4:"50%",
                        border:`2px solid ${T.textMuted}`,flexShrink:0}}/>
                      <span style={{fontSize:12,color:T.textSec,flex:1}}>{opt}</span>
                      {jump&&<div style={{display:"flex",alignItems:"center",gap:4}}>
                        <ArrowRight size={9} color={T.danger}/>
                        <span style={{fontSize:9,color:T.danger,fontWeight:700}}>{jump}</span>
                      </div>}
                    </div>
                  );
                })}

                {active&&<div style={{marginTop:10,display:"flex",gap:8}}>
                  <Btn v="ghost" icon={PlusCircle} sm>Opción</Btn>
                  <Btn v="ghost" icon={Workflow} sm>Salto lógico</Btn>
                </div>}
              </div>
            );
          })}

          <div style={{padding:14,borderRadius:12,border:`2px dashed ${T.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            cursor:"pointer",color:T.textMuted,fontSize:13,transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.primary+"60";e.currentTarget.style.color=T.primary;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted;}}>
            <Plus size={15}/>Agregar pregunta
          </div>
        </div>
      </div>

      {/* Properties + Live JSON */}
      <div style={{width:256,borderLeft:`1px solid ${T.border}`,background:T.surface,overflowY:"auto",flexShrink:0}}>
        <div style={{padding:14}}>
          {/* Live JSON toggle */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:".08em",textTransform:"uppercase"}}>Propiedades</div>
            <div onClick={()=>setShowJSON(v=>!v)}
              style={{fontSize:10,color:showJSON?T.primary:T.textMuted,cursor:"pointer",fontWeight:600,
                background:`${T.primary}10`,padding:"2px 8px",borderRadius:6}}>
              {showJSON?"JSON ▲":"JSON ▼"}
            </div>
          </div>

          {showJSON&&(
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:700,color:T.textSec}}>estructura_json (live)</div>
                <div onClick={()=>navigator.clipboard.writeText(liveJSON)} style={{cursor:"pointer",color:T.textMuted}}>
                  <Copy size={11}/>
                </div>
              </div>
              <pre style={{background:T.inputBg,borderRadius:8,padding:10,fontSize:9,
                color:T.textSec,lineHeight:1.7,overflow:"auto",maxHeight:220,
                border:`1px solid ${T.border}`,fontFamily:'"Fira Code",monospace',whiteSpace:"pre-wrap"}}>
                {liveJSON}
              </pre>
            </div>
          )}

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:T.textSec,marginBottom:10}}>Configuración</div>
            {[["Una respuesta por persona",true],["Barra de progreso",true],
              ["Aleatorizar preguntas",false],["Guardar respuestas parciales",true]
            ].map(([label,on],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:12,color:T.textSec}}>{label}</span>
                <Toggle on={on}/>
              </div>
            ))}
          </div>

          <Btn icon={Eye} s={{width:"100%",justifyContent:"center",marginBottom:8}}
            onClick={()=>setPreview(true)}>Vista previa</Btn>
          <Btn v="ghost" icon={Share2} s={{width:"100%",justifyContent:"center"}}>Publicar</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI GENERATOR — Real Anthropic API call
// ═══════════════════════════════════════════════════════════════════════════════
function AIGenerator({ setPreview }) {
  const T = useT();
  const [prompt,setPrompt]=useState("");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);

  const SYSTEM_PROMPT = `Eres un experto en diseño de encuestas. Genera ÚNICAMENTE un JSON válido, sin markdown, sin bloques de código, sin explicaciones. Usa esta estructura exacta:
{
  "encuesta_id": "uuid-generado",
  "titulo": "Título de la encuesta",
  "preguntas": [
    {
      "id": 1,
      "tipo": "seleccion_unica",
      "enunciado": "Pregunta...",
      "opciones": ["Opción A","Opción B"],
      "reglas": {
        "requerido": true,
        "salto_logico": {"No aplica": "FIN_CON_DESCARTE"}
      }
    }
  ]
}
Tipos válidos: seleccion_unica, seleccion_multiple, texto_corto, nps, likert.
Para seleccion_multiple agrega max_opciones en reglas.
Incluye salto_logico en al menos una pregunta con FIN_CON_DESCARTE para el filtro de screening.
Genera entre 3 y 6 preguntas coherentes con el objetivo del negocio.`;

  const generate = async () => {
    if(!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: SYSTEM_PROMPT,
          messages:[{role:"user",content:`Objetivo de negocio: ${prompt}\n\nGenera la encuesta en JSON.`}]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text||"";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch(e) {
      setError("No se pudo generar. Verifica tu conexión o intenta de nuevo.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "Satisfacción post-compra para e-commerce con NPS y follow-up por segmento",
    "Estudio de mercado para lanzamiento de alimento unificado perro-gato",
    "Feedback de empleados sobre cultura organizacional y clima laboral",
    "Evaluación de experiencia en clínica veterinaria con screening inicial",
  ];

  return (
    <div style={{padding:28,maxWidth:820,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:68,height:68,borderRadius:20,
          background:`linear-gradient(135deg,${T.primary}22,${T.secondary}22)`,
          border:`1px solid ${T.primary}30`,display:"flex",alignItems:"center",
          justifyContent:"center",margin:"0 auto 14px"}}>
          <Wand2 size={28} color={T.primary}/>
        </div>
        <div style={{fontSize:26,fontWeight:900,color:T.text,marginBottom:8,letterSpacing:"-.02em"}}>
          IA Generadora de Encuestas
        </div>
        <div style={{fontSize:14,color:T.textMuted,maxWidth:480,margin:"0 auto"}}>
          Describe tu objetivo y la IA generará la estructura completa con lógica de saltos, validaciones y descarte automático
        </div>
      </div>

      {!result&&!loading&&(
        <>
          <Card s={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:10}}>
              ¿Qué tipo de encuesta necesitas?
            </div>
            <ThemedInput multiline value={prompt} onChange={e=>setPrompt(e.target.value)}
              placeholder="Ej: Necesito una encuesta para evaluar satisfacción post-compra con NPS, preguntas de seguimiento por segmento y descarte automático para compradores recientes..."/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
              <div style={{fontSize:11,color:T.textMuted}}>
                Generará JSON con salto_logico, FIN_CON_DESCARTE y max_opciones
              </div>
              <Btn icon={Wand2} onClick={generate} disabled={!prompt.trim()||loading}
                s={{background:`linear-gradient(135deg,${T.primary},${T.secondary})`}}>
                Generar con IA
              </Btn>
            </div>
          </Card>

          <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:10}}>Ejemplos rápidos</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {examples.map((ex,i)=>(
              <div key={i} onClick={()=>setPrompt(ex)}
                style={{padding:"11px 13px",borderRadius:10,cursor:"pointer",background:T.elevated,
                  border:`1px solid ${T.border}`,fontSize:12,color:T.textSec,lineHeight:1.5,
                  transition:"all .15s",display:"flex",gap:8}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.primary+"50";e.currentTarget.style.color=T.text;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec;}}>
                <Sparkles size={11} color={T.primary} style={{marginTop:1,flexShrink:0}}/>{ex}
              </div>
            ))}
          </div>
        </>
      )}

      {loading&&(
        <Card s={{textAlign:"center",padding:52}}>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          <div style={{width:52,height:52,borderRadius:"50%",background:`${T.primary}18`,
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 16px",animation:"spin 1.2s linear infinite"}}>
            <RefreshCw size={22} color={T.primary}/>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:6}}>Generando estructura...</div>
          <div style={{fontSize:13,color:T.textMuted}}>Analizando objetivo · Diseñando preguntas · Creando lógica de saltos</div>
        </Card>
      )}

      {error&&(
        <Card s={{borderColor:T.danger+"40",textAlign:"center",padding:32}}>
          <AlertCircle size={28} color={T.danger} style={{marginBottom:10}}/>
          <div style={{fontSize:14,color:T.danger,fontWeight:600,marginBottom:6}}>Error al generar</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:16}}>{error}</div>
          <Btn v="ghost" onClick={()=>setError(null)}>Reintentar</Btn>
        </Card>
      )}

      {result&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:T.success}}/>
              <span style={{fontSize:14,fontWeight:700,color:T.text}}>Encuesta generada exitosamente</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" icon={RefreshCw} sm onClick={()=>{setResult(null);setPrompt("");}}>Regenerar</Btn>
              <Btn icon={Eye} sm onClick={()=>setPreview(true)}>Previsualizar</Btn>
              <Btn icon={ArrowRight} sm>Abrir en constructor</Btn>
            </div>
          </div>

          <Card s={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:3}}>{result.titulo}</div>
                <div style={{fontSize:11,color:T.textMuted}}>{result.preguntas?.length} preguntas · Saltos lógicos · Descarte automático</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,
                  background:`${T.success}18`,color:T.success}}>{result.preguntas?.length} preguntas</span>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,
                  background:`${T.accent}18`,color:T.accent}}>IA generada</span>
              </div>
            </div>
            {result.preguntas?.map((q,i)=>(
              <div key={q.id} style={{marginBottom:10,padding:12,borderRadius:10,
                background:T.inputBg,border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:800,color:T.primary,background:`${T.primary}18`,
                    padding:"2px 8px",borderRadius:20}}>P{i+1}</span>
                  <span style={{fontSize:10,color:T.secondary,background:`${T.secondary}15`,
                    padding:"2px 8px",borderRadius:20}}>{q.tipo}</span>
                  {q.reglas?.salto_logico&&<span style={{fontSize:10,color:T.accent}}>⚡ Salto lógico</span>}
                  {q.reglas?.max_opciones&&<span style={{fontSize:10,color:T.warning}}>Máx. {q.reglas.max_opciones}</span>}
                </div>
                <div style={{fontSize:13,color:T.text,marginBottom:8}}>{q.enunciado}</div>
                {q.opciones&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {q.opciones.map((opt,oi)=>{
                    const jump=q.reglas?.salto_logico?.[opt];
                    return <span key={oi} style={{fontSize:10,padding:"2px 9px",borderRadius:20,
                      background:jump?`${T.danger}15`:`rgba(255,255,255,.05)`,
                      color:jump?T.danger:T.textMuted,
                      border:`1px solid ${jump?T.danger+"40":"rgba(255,255,255,.06)"}`}}>{opt}</span>;
                  })}
                </div>}
              </div>
            ))}
          </Card>

          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>estructura_json generada</div>
              <Btn v="ghost" icon={Copy} sm onClick={()=>navigator.clipboard.writeText(JSON.stringify(result,null,2))}>Copiar</Btn>
            </div>
            <pre style={{background:T.inputBg,borderRadius:8,padding:13,fontSize:9,
              color:T.textSec,lineHeight:1.7,overflow:"auto",maxHeight:180,
              border:`1px solid ${T.border}`,fontFamily:'"Fira Code",monospace',whiteSpace:"pre-wrap"}}>
              {JSON.stringify(result,null,2)}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSES — Cabecera/Detalle structure
// ═══════════════════════════════════════════════════════════════════════════════
function Responses() {
  const T = useT();
  const rows = Array.from({length:10},(_, i)=>({
    id:`RC-${(i+1).toString().padStart(3,"0")}`,
    cabecera_id:`cab-${Math.random().toString(36).slice(2,8)}`,
    enc:`Encuestador ${i+1}`,
    date:new Date(Date.now()-Math.random()*6e8).toLocaleDateString("es-CL"),
    p1:["Sí, solo perro","Sí, solo gato","Sí, ambos"][i%3],
    p2:["Espacio de almacenamiento","Gasto económico alto","Riesgo de consumo cruzado"][i%3],
    p3:["Respaldo AMV","Estudios clínicos"][i%2],
    disc:i===2||i===7,
    pregDescarte:i===2?1:i===7?1:null,
  }));
  const [sel,setSel]=useState(null);

  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Respuestas</div>
          <div style={{fontSize:13,color:T.textMuted}}>Estudio de Mercado — Alimento Mixto Mascotas</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" icon={Filter} sm>Filtrar</Btn>
          <Btn v="ghost" icon={Download} sm>Exportar CSV</Btn>
        </div>
      </div>

      {/* DB Structure hint */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[["Total","247",T.primary],["Completadas","210",T.success],["Descartes","37",T.danger],["Completitud","85%",T.accent]].map(([l,v,c],i)=>(
          <Card key={i} s={{padding:"14px 18px"}}>
            <div style={{fontSize:24,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Schema info banner */}
      <div style={{padding:"10px 14px",borderRadius:10,background:`${T.primary}0A`,
        border:`1px solid ${T.primary}20`,marginBottom:16,
        display:"flex",alignItems:"center",gap:10}}>
        <Bot size={14} color={T.primary}/>
        <div style={{fontSize:11,color:T.textSec}}>
          Estructura BD: <code style={{color:T.accent,fontFamily:"monospace"}}>respuestas_cabecera</code> (trazabilidad) +{" "}
          <code style={{color:T.accent,fontFamily:"monospace"}}>respuestas_detalle</code> (por pregunta) · Descartes guardan{" "}
          <code style={{color:T.danger,fontFamily:"monospace"}}>pregunta_descarte_id</code>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:sel?"1fr 320px":"1fr",gap:14}}>
        <Card s={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Cabecera ID","Encuestador","Fecha","P1","P2","P3","Estado"].map((h,i)=>(
                <th key={i} style={{padding:"12px 16px",textAlign:"left",fontSize:9,fontWeight:700,
                  color:T.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} onClick={()=>setSel(sel?.id===r.id?null:r)}
                  style={{borderBottom:`1px solid ${T.border}`,cursor:"pointer",transition:"background .15s",
                    background:sel?.id===r.id?`${T.primary}0A`:"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${T.primary}06`}
                  onMouseLeave={e=>e.currentTarget.style.background=sel?.id===r.id?`${T.primary}0A`:"transparent"}>
                  <td style={{padding:"11px 16px",fontSize:9,color:T.textMuted,fontFamily:"monospace"}}>{r.cabecera_id}</td>
                  <td style={{padding:"11px 16px",fontSize:12,color:T.text}}>{r.enc}</td>
                  <td style={{padding:"11px 16px",fontSize:11,color:T.textMuted}}>{r.date}</td>
                  <td style={{padding:"11px 16px",fontSize:12,color:r.disc?T.textMuted:T.textSec}}>{r.disc?"—":r.p1}</td>
                  <td style={{padding:"11px 16px",fontSize:12,color:r.disc?T.textMuted:T.textSec}}>{r.disc?"—":r.p2}</td>
                  <td style={{padding:"11px 16px",fontSize:12,color:r.disc?T.textMuted:T.textSec}}>{r.disc?"—":r.p3}</td>
                  <td style={{padding:"11px 16px"}}><Badge type={r.disc?"paused":"active"}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {sel&&(
          <Card s={{padding:18,alignSelf:"start"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>Detalle</div>
              <div onClick={()=>setSel(null)} style={{cursor:"pointer",color:T.textMuted}}><X size={13}/></div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:9,color:T.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>respuestas_cabecera</div>
              {[["id",sel.cabecera_id],["encuestador",sel.enc],["es_descarte",sel.disc.toString()],
                ["pregunta_descarte_id",sel.pregDescarte??"null"]].map(([k,v],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:10,color:T.textMuted,fontFamily:"monospace"}}>{k}</span>
                  <span style={{fontSize:10,color:k==="es_descarte"&&v==="true"?T.danger:T.textSec,fontFamily:"monospace"}}>{v}</span>
                </div>
              ))}
            </div>
            {!sel.disc&&(
              <div>
                <div style={{fontSize:9,color:T.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6,marginTop:10}}>respuestas_detalle</div>
                {[[1,sel.p1],[2,sel.p2],[3,sel.p3]].map(([pid,val])=>(
                  <div key={pid} style={{padding:"8px 10px",background:T.inputBg,borderRadius:7,
                    border:`1px solid ${T.border}`,marginBottom:6}}>
                    <div style={{fontSize:9,color:T.textMuted,fontFamily:"monospace",marginBottom:3}}>pregunta_id: {pid}</div>
                    <div style={{fontSize:11,color:T.text}}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function Analytics() {
  const T = useT();
  const funnel=[
    {step:"Vistas",n:420,p:100},{step:"Inician",n:318,p:75.7},
    {step:"Pasan P1",n:280,p:66.7},{step:"Pasan P2",n:247,p:58.8},
    {step:"Finalizadas",n:210,p:50},
  ];
  return (
    <div style={{padding:28}}>
      <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Analíticas</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:24}}>Estudio de Mercado — Alimento Mixto Mascotas</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3}}>P1: Tenencia de mascotas</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>Distribución de 247 respuestas</div>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={barQ1} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="o" tick={{fill:T.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip cursor={{fill:`${T.primary}06`}} content={<TT/>}/>
              <Bar dataKey="c" fill={T.primary} radius={[6,6,0,0]} name="Respuestas"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3}}>P3: Certificación preferida</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:10}}>210 completadas</div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pieQ3.map(d=>({...d,color:d.name==="Respaldo AMV"?T.primary:d.name==="Estudios clínicos"?T.secondary:T.accent}))}
                  cx="50%" cy="50%" innerRadius={32} outerRadius={54} paddingAngle={3} dataKey="value">
                  {pieQ3.map((e,i)=><Cell key={i} fill={[T.primary,T.secondary,T.accent][i]}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {pieQ3.map((c,i)=>{
                const col=[T.primary,T.secondary,T.accent][i];
                return (
                  <div key={i} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:10,color:T.textSec}}>{c.name}</span>
                      <span style={{fontSize:11,fontWeight:800,color:col}}>{c.value}%</span>
                    </div>
                    <div style={{height:3,background:T.border,borderRadius:4}}>
                      <div style={{height:"100%",width:`${c.value}%`,background:col,borderRadius:4}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:18}}>Funnel de conversión</div>
        {funnel.map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:9}}>
            <div style={{width:100,fontSize:12,color:T.textMuted,textAlign:"right",flexShrink:0}}>{f.step}</div>
            <div style={{flex:1,height:30,background:T.elevated2,borderRadius:6,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${f.p}%`,
                background:i===funnel.length-1?T.success:T.primary,
                borderRadius:6,opacity:1-i*.08,display:"flex",alignItems:"center",paddingLeft:10,transition:"width .6s"}}>
                <span style={{fontSize:12,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>{f.n.toLocaleString()}</span>
              </div>
            </div>
            <div style={{width:42,fontSize:12,fontWeight:700,color:i===funnel.length-1?T.success:T.text,flexShrink:0}}>{f.p}%</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function Automations() {
  const T = useT();
  const [autos,setAutos]=useState(automationsData);
  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Automatizaciones</div>
          <div style={{fontSize:13,color:T.textMuted}}>Flujos automáticos basados en eventos de encuesta</div>
        </div>
        <Btn icon={Plus}>Nueva automatización</Btn>
      </div>
      {autos.map(a=>(
        <Card key={a.id} s={{marginBottom:12}} onClick={()=>{}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <Toggle on={a.on} onClick={e=>{e.stopPropagation();setAutos(p=>p.map(x=>x.id===a.id?{...x,on:!x.on}:x));}}/>
            <div style={{width:38,height:38,borderRadius:10,background:`${T.secondary}18`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Zap size={16} color={T.secondary}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:6}}>{a.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:T.primary,background:`${T.primary}14`,padding:"2px 9px",borderRadius:6}}>⚡ {a.trigger}</span>
                <ArrowRight size={10} color={T.textMuted}/>
                <span style={{fontSize:11,color:T.success,background:`${T.success}14`,padding:"2px 9px",borderRadius:6}}>→ {a.action}</span>
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:20,fontWeight:800,color:a.on?T.text:T.textMuted}}>{a.runs.toLocaleString()}</div>
              <div style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:".04em"}}>ejecuciones</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEGMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
function Segmentation() {
  const T = useT();
  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Segmentación</div>
          <div style={{fontSize:13,color:T.textMuted}}>Audiencias inteligentes basadas en respuestas</div>
        </div>
        <Btn icon={Plus}>Nuevo segmento</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        {segmentsData.map(s=>(
          <Card key={s.id} onClick={()=>{}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:12,background:`${s.color}18`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Users size={18} color={s.color}/>
              </div>
              <MoreHorizontal size={14} color={T.textMuted} style={{cursor:"pointer"}}/>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:3}}>{s.name}</div>
            <div style={{fontSize:30,fontWeight:900,color:s.color,marginBottom:14,lineHeight:1}}>{s.count.toLocaleString()}</div>
            {s.filters.map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:T.textMuted,marginBottom:5}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:s.color,flexShrink:0}}/>{f}
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <Btn v="ghost" sm>Ver contactos</Btn>
              <Btn v="ghost" sm icon={Zap}>Automatizar</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function Integrations() {
  const T = useT();
  return (
    <div style={{padding:28}}>
      <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Integraciones</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:24}}>Conecta tus herramientas con un clic</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {integrationsData.map((intg,i)=>(
          <Card key={i} onClick={()=>{}}>
            <div style={{fontSize:32,marginBottom:10}}>{intg.icon}</div>
            <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:3}}>{intg.name}</div>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>{intg.desc}</div>
            <Badge type={intg.on?"on":"off"}/>
            <Btn v={intg.on?"ghost":"primary"} sm s={{width:"100%",justifyContent:"center",marginTop:12}}>
              {intg.on?"Configurar":"Conectar"}
            </Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPage() {
  const T = useT();
  const [tab,setTab]=useState("general");
  const tabs=["general","cuenta","plan","seguridad","api","notificaciones"];
  return (
    <div style={{padding:28,maxWidth:740}}>
      <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:22}}>Configuración</div>
      <div style={{display:"flex",gap:3,marginBottom:24,background:T.elevated,padding:4,
        borderRadius:12,width:"fit-content",border:`1px solid ${T.border}`}}>
        {tabs.map(t=>(
          <div key={t} onClick={()=>setTab(t)}
            style={{padding:"6px 14px",borderRadius:9,cursor:"pointer",fontSize:12,
              fontWeight:tab===t?700:400,background:tab===t?`linear-gradient(135deg,${T.primary},${T.secondary})`:"transparent",
              color:tab===t?"#fff":T.textMuted,transition:"all .15s",textTransform:"capitalize"}}>
            {t}
          </div>
        ))}
      </div>
      {tab==="general"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:18}}>Información de la organización</div>
            {[["Nombre de la empresa","Admin Corp"],["Sitio web","https://admincorp.cl"],["Zona horaria","America/Santiago (UTC-4)"]].map(([l,v],i)=>(
              <div key={i} style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:T.textMuted,marginBottom:6}}>{l}</div>
                <ThemedInput value={v} onChange={()=>{}}/>
              </div>
            ))}
            <Btn icon={Check} sm>Guardar cambios</Btn>
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Preferencias</div>
            {[["Resumen diario por email","Recibir métricas cada mañana",true],
              ["Analytics anónimo","Ayudar a mejorar la plataforma",false],
              ["Notificaciones de descarte","Alertar cuando hay descartes > 20%",true]].map(([l,sub,on],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<2?14:0}}>
                <div>
                  <div style={{fontSize:13,color:T.text}}>{l}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{sub}</div>
                </div>
                <Toggle on={on}/>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="api"&&(
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>API Keys</div>
          <div style={{padding:14,background:T.inputBg,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:14}}>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>API Key activa</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <code style={{fontSize:12,color:T.textSec,flex:1,fontFamily:"monospace"}}>sk_live_••••••••••••••••••••••••••••••••</code>
              <Btn v="ghost" icon={Copy} sm>Copiar</Btn>
            </div>
          </div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>
            Endpoint: <code style={{color:T.accent,fontFamily:"monospace"}}>POST /api/v1/respuestas/registrar</code>
          </div>
          <Btn v="ghost" icon={Key} sm>Regenerar</Btn>
        </Card>
      )}
      {!["general","api"].includes(tab)&&(
        <Card s={{textAlign:"center",padding:52}}>
          <Settings size={28} color={T.textMuted} style={{marginBottom:10}}/>
          <div style={{fontSize:13,color:T.textMuted,textTransform:"capitalize"}}>Sección "{tab}" próximamente</div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════
const PAGE_TITLES = {
  dashboard:"Dashboard", surveys:"Encuestas", builder:"Constructor de Encuestas",
  ai:"IA Generadora", responses:"Respuestas", analytics:"Analíticas",
  segmentation:"Segmentación", automations:"Automatizaciones",
  integrations:"Integraciones", settings:"Configuración",
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    try { return !!localStorage.getItem("sai_session"); } catch { return false; }
  });
  if (!loggedIn) {
    const LoginPage = () => {
      const [email, setEmail] = useState("");
      const [pass, setPass] = useState("");
      const [loading, setLoading] = useState(false);
      const [err, setErr] = useState("");
      const T = THEMES.dark;
      const doLogin = () => {
        if(!email||!pass){setErr("Completa todos los campos");return;}
        setLoading(true);setErr("");
        setTimeout(()=>{
          setLoading(false);
          if(email==="admin@surveyai.cl"&&pass==="Admin123!"){
            try{localStorage.setItem("sai_session","1");}catch{}
            setLoggedIn(true);
          } else { setErr("Credenciales incorrectas. Demo: admin@surveyai.cl / Admin123!"); }
        },1300);
      };
      return (
        <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Inter,sans-serif"}}>
          <style>{"@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,button{font-family:inherit}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}"}</style>
          <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}>
            {[0,1,2].map(i=><div key={i} style={{position:"absolute",borderRadius:"50%",background:["rgba(6,182,212,0.07)","rgba(139,92,246,0.05)","rgba(6,182,212,0.04)"][i],width:[300,200,400][i],height:[300,200,400][i],left:["-10%","60%","30%"][i],top:["-10%","70%","-20%"][i],filter:"blur(60px)"}}/>)}
          </div>
          <div style={{width:"100%",maxWidth:440,position:"relative",zIndex:1}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#06B6D4,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 8px 28px rgba(6,182,212,0.35)"}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div style={{fontSize:26,fontWeight:900,color:T.text,marginBottom:3,letterSpacing:"-.02em"}}>SurveyAI</div>
              <div style={{fontSize:11,color:T.textMuted,letterSpacing:".1em"}}>ENCUESTA · ANALIZA · CREA EL FUTURO</div>
            </div>
            <div style={{background:T.elevated,borderRadius:24,padding:32,border:`1px solid ${T.border}`,boxShadow:"0 24px 60px rgba(0,0,0,.5)"}}>
              <div style={{fontSize:17,fontWeight:800,color:T.text,marginBottom:5}}>Panel empresarial</div>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:22}}>Accede con tus credenciales corporativas</div>
              {err&&<div style={{background:"rgba(239,68,68,.14)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:"9px 13px",marginBottom:14,fontSize:13,color:"#EF4444",display:"flex",alignItems:"center",gap:7}}>⚠ {err}</div>}
              <div style={{marginBottom:13}}>
                <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>Email corporativo</div>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.cl" onKeyDown={e=>e.key==="Enter"&&doLogin()}
                  style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:11,padding:"12px 14px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border .2s"}}
                  onFocus={e=>e.currentTarget.style.borderColor="#06B6D4"} onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>Contraseña</div>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doLogin()}
                  style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:11,padding:"12px 14px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border .2s"}}
                  onFocus={e=>e.currentTarget.style.borderColor="#06B6D4"} onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
              </div>
              <button onClick={doLogin} disabled={loading}
                style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:loading?"rgba(255,255,255,.07)":"linear-gradient(135deg,#06B6D4,#8B5CF6)",color:loading?T.textMuted:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s",boxShadow:loading?"none":"0 4px 20px rgba(6,182,212,0.4)"}}>
                {loading?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>↻</span> Autenticando...</>:"Ingresar al panel →"}
              </button>
              <div style={{marginTop:14,padding:"10px 13px",background:"rgba(6,182,212,0.06)",borderRadius:10,border:"1px solid rgba(6,182,212,0.15)",textAlign:"center"}}>
                <div style={{fontSize:10,color:T.textMuted,marginBottom:3}}>Credenciales de demo</div>
                <div style={{fontSize:11,color:T.textSec}}>admin@surveyai.cl · Admin123!</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:22,marginTop:16}}>
              {["JWT seguro","2FA listo","SSL 256-bit"].map(l=><div key={l} style={{fontSize:10,color:T.textMuted}}>🔒 {l}</div>)}
            </div>
          </div>
        </div>
      );
    };
    return <LoginPage/>;
  }
  const [page,setPage]=useState("dashboard");
  const [col,setCol]=useState(false);
  const [theme,setTheme]=useState(THEMES.dark);
  const [themeOpen,setThemeOpen]=useState(false);
  const [preview,setPreview]=useState(false);
  const [isMobile,setIsMobile]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const T = theme;

  // Detect screen size
  useEffect(()=>{
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  },[]);

  const pageContent = {
    dashboard: <Dashboard setPreview={setPreview}/>,
    surveys: <Surveys setPage={setPage} setPreview={setPreview}/>,
    builder: <Builder setPreview={setPreview}/>,
    ai: <AIGenerator setPreview={setPreview}/>,
    responses: <Responses/>,
    analytics: <Analytics/>,
    segmentation: <Segmentation/>,
    automations: <Automations/>,
    integrations: <Integrations/>,
    settings: <SettingsPage/>,
  };

  // Responsive margin: 0 on mobile (sidebar is overlay), else col width
  const mainMargin = isMobile ? 0 : (col ? 68 : 240);

  return (
    <ThemeCtx.Provider value={T}>
      <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
        background:T.bg,minHeight:"100vh",color:T.text,transition:"background .3s,color .3s"}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          ::-webkit-scrollbar{width:5px;height:5px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:3px}
          input,textarea,button,select{font-family:inherit}
          @media(max-width:767px){
            .kpi-grid{grid-template-columns:repeat(2,1fr) !important;}
            .chart-grid{grid-template-columns:1fr !important;}
            .two-col{grid-template-columns:1fr !important;}
            .three-col{grid-template-columns:1fr !important;}
            .four-col{grid-template-columns:repeat(2,1fr) !important;}
          }
        `}</style>

        <Sidebar
          page={page} setPage={setPage}
          col={col} setCol={setCol}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div style={{
          marginLeft:mainMargin,
          minHeight:"100vh",
          transition:"margin-left .25s cubic-bezier(.4,0,.2,1)",
          display:"flex",flexDirection:"column",
        }}>
          <TopBar
            title={PAGE_TITLES[page]}
            setThemeOpen={setThemeOpen}
            isMobile={isMobile}
            onMenuClick={()=>setMobileOpen(true)}
          />
          <div style={{flex:1,overflowY:"auto"}}>
            {pageContent[page]}
          </div>
        </div>

        <ThemeSwitcher theme={theme} setTheme={setTheme} open={themeOpen} setOpen={setThemeOpen}/>
        {preview&&<FormPreviewModal survey={SURVEY_JSON} onClose={()=>setPreview(false)}/>}
      </div>
    </ThemeCtx.Provider>
  );
}
