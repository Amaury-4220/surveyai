// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 2: PANEL MANDANTE                          ║
// ║  Dashboard + IA Generadora + Encuestas + Respuestas         ║
// ║  © SurveyAI 2025 — Todos los derechos reservados           ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, FileText, Sparkles, MessageSquare, BarChart3,
  Users, Zap, Settings, LogOut, Menu, X, Bell, Search, Plus,
  Send, Copy, WhatsApp, ArrowRight, ArrowLeft, RefreshCw,
  CheckCircle, AlertCircle, Clock, MapPin, Smartphone,
  TrendingUp, Activity, Target, Eye, Edit3, Trash2, Share2,
  Wand2, Download, Filter, ChevronDown, Check, MoreHorizontal,
  QrCode, Link2, MessageCircle, Shield, Database, Wifi, WifiOff,
  Play, Pause, Square, ChevronRight, BarChart2, Users2, Layers
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { bunkerCall, Bunker, Session } from "./bunker.js";
import { guardarRespuesta, escucharRespuestas, escucharStats, guardarEncuesta, escucharEncuestas } from "./firebase.js";

// ─── Design System ────────────────────────────────────────────
const T = {
  bg: "#04080F", surface: "#070D1A", card: "#0A1120",
  elevated: "#0E1829", elevated2: "#131F32",
  border: "rgba(6,182,212,0.08)", borderHover: "rgba(6,182,212,0.3)",
  cyan: "#06B6D4", violet: "#7C3AED", green: "#10B981",
  red: "#EF4444", yellow: "#F59E0B", orange: "#F97316",
  text: "#F1F5F9", textSec: "#64748B", textMuted: "#1E3A5F",
  grad: "linear-gradient(135deg,#06B6D4,#7C3AED)",
  gradGreen: "linear-gradient(135deg,#10B981,#059669)",
};

// ─── Navigation ───────────────────────────────────────────────
const NAV = [
  { id:"dashboard",   label:"Dashboard",      icon:LayoutDashboard },
  { id:"encuestas",   label:"Mis encuestas",  icon:FileText },
  { id:"ia",          label:"IA Generadora",  icon:Sparkles },
  { id:"respuestas",  label:"Respuestas",     icon:MessageSquare },
  { id:"encuestadores",label:"Encuestadores", icon:Users },
  { id:"analiticas",  label:"Analíticas",     icon:BarChart3 },
  { id:"settings",    label:"Configuración",  icon:Settings },
];

// ─── Primitives ───────────────────────────────────────────────
const Card = ({ children, s, onClick, glow }) => (
  <div onClick={onClick}
    style={{ background:T.card, border:`1px solid ${glow?T.borderHover:T.border}`,
      borderRadius:16, padding:22, transition:"all .2s",
      cursor:onClick?"pointer":"default",
      boxShadow:glow?`0 0 20px rgba(6,182,212,0.08)`:"none", ...s }}
    onMouseEnter={onClick?e=>{e.currentTarget.style.borderColor=T.borderHover;e.currentTarget.style.transform="translateY(-1px)";}:undefined}
    onMouseLeave={onClick?e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";}:undefined}
  >{children}</div>
);

const Btn = ({ children, v="primary", icon:I, sm, s, onClick, disabled, loading }) => {
  const vs = {
    primary:{ background:T.grad, color:"#fff", border:"none", boxShadow:"0 4px 16px rgba(6,182,212,0.3)" },
    ghost:{ background:T.elevated, color:T.textSec, border:`1px solid ${T.border}` },
    green:{ background:T.gradGreen, color:"#fff", border:"none", boxShadow:"0 4px 16px rgba(16,185,129,0.3)" },
    danger:{ background:`${T.red}18`, color:T.red, border:`1px solid ${T.red}30` },
    whatsapp:{ background:"#25D366", color:"#fff", border:"none", boxShadow:"0 4px 16px rgba(37,211,102,0.3)" },
  };
  return (
    <button disabled={disabled||loading}
      onClick={disabled||loading?undefined:onClick}
      style={{ display:"inline-flex", alignItems:"center", gap:6, borderRadius:10,
        fontWeight:700, cursor:(disabled||loading)?"not-allowed":"pointer",
        padding:sm?"6px 13px":"10px 18px", fontSize:sm?11:13,
        transition:"all .15s", fontFamily:"'DM Sans',sans-serif",
        opacity:(disabled||loading)?.5:1, ...vs[v], ...s }}>
      {loading
        ? <><RefreshCw size={sm?11:13} style={{animation:"spin 1s linear infinite"}}/> Cargando...</>
        : <>{I&&<I size={sm?11:13}/>}{children}</>}
    </button>
  );
};

const Badge = ({ type }) => {
  const map = {
    active: [`${T.green}20`,T.green,"Activa"],
    paused: [`${T.yellow}20`,T.yellow,"Pausada"],
    draft:  [`${T.textSec}20`,T.textSec,"Borrador"],
    done:   [`${T.cyan}20`,T.cyan,"Finalizada"],
  };
  const [bg,col,label] = map[type]||map.draft;
  return <span style={{background:bg,color:col,padding:"2px 10px",borderRadius:20,
    fontSize:10,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase"}}>{label}</span>;
};

const TT = ({active,payload,label}) => active&&payload?.length?(
  <div style={{background:T.elevated2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 13px"}}>
    <div style={{fontSize:10,color:T.textSec,marginBottom:4}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{fontSize:13,fontWeight:700,color:p.color||T.cyan}}>{p.value}</div>)}
  </div>
):null;

// ─── KPI Card ─────────────────────────────────────────────────
const KPI = ({ title, value, icon:I, color, sub, change }) => (
  <Card onClick={()=>{}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
      <div style={{width:38,height:38,borderRadius:10,background:`${color}15`,
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <I size={16} color={color}/>
      </div>
      {change!==undefined&&<span style={{fontSize:10,fontWeight:700,
        color:change>=0?T.green:T.red,
        background:change>=0?`${T.green}18`:`${T.red}18`,
        padding:"2px 8px",borderRadius:20}}>
        {change>=0?"+":""}{change}%</span>}
    </div>
    <div style={{fontSize:28,fontWeight:900,color:T.text,lineHeight:1,marginBottom:4}}>{value}</div>
    <div style={{fontSize:12,color:T.textMuted,marginBottom:sub?2:0}}>{title}</div>
    {sub&&<div style={{fontSize:11,color:T.textSec}}>{sub}</div>}
  </Card>
);

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ page, setPage, col, setCol, session, onLogout, isMobile, mobileOpen, setMobileOpen }) {
  const handleNav = (id) => { setPage(id); if(isMobile) setMobileOpen(false); };
  return (
    <>
      {isMobile&&mobileOpen&&<div onClick={()=>setMobileOpen(false)}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",zIndex:99}}/>}
      <div style={{
        width:isMobile?260:col?64:224, minHeight:"100vh", background:T.surface,
        borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, bottom:0, zIndex:100, overflow:"hidden",
        transition:"width .25s cubic-bezier(.4,0,.2,1), transform .25s cubic-bezier(.4,0,.2,1)",
        transform:isMobile?(mobileOpen?"translateX(0)":"translateX(-100%)"):"translateX(0)",
        boxShadow:isMobile&&mobileOpen?"4px 0 40px rgba(0,0,0,.5)":"none",
      }}>
        {/* Logo */}
        <div style={{padding:"16px 14px",borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:9,flexShrink:0,
              background:T.grad,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <BarChart3 size={16} color="#fff"/>
            </div>
            {(!col||isMobile)&&<div>
              <div style={{fontSize:13,fontWeight:800,color:T.text,letterSpacing:"-.01em"}}>SurveyAI</div>
              <div style={{fontSize:9,color:T.cyan,textTransform:"uppercase",letterSpacing:".08em"}}>Enterprise</div>
            </div>}
          </div>
          {isMobile&&<div onClick={()=>setMobileOpen(false)} style={{cursor:"pointer",color:T.textSec}}>
            <X size={14}/>
          </div>}
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {NAV.map(item=>{
            const active = page===item.id;
            const Icon = item.icon;
            const showLabel = isMobile||!col;
            return (
              <div key={item.id} onClick={()=>handleNav(item.id)}
                style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",
                  borderRadius:9,marginBottom:2,cursor:"pointer",whiteSpace:"nowrap",
                  background:active?`${T.cyan}12`:"transparent",
                  color:active?T.cyan:T.textSec,transition:"all .15s",
                  borderLeft:`2px solid ${active?T.cyan:"transparent"}`}}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(6,182,212,0.05)";e.currentTarget.style.color=T.text;}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textSec;}}}>
                <Icon size={16} style={{flexShrink:0}}/>
                {showLabel&&<span style={{fontSize:13,fontWeight:active?700:400}}>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{borderTop:`1px solid ${T.border}`,padding:10}}>
          {(!col||isMobile)&&(
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",
              borderRadius:10,background:`${T.cyan}08`,marginBottom:8}}>
              <div style={{width:30,height:30,borderRadius:8,flexShrink:0,
                background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:800,color:"#fff"}}>
                {session?.empresa?.[0]||"M"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:700,color:T.text,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {session?.empresa||"Mi empresa"}
                </div>
                <div style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:".05em"}}>
                  {session?.isTrial?"TRIAL":"Plan activo"}
                </div>
              </div>
            </div>
          )}
          <div onClick={onLogout}
            style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",
              borderRadius:8,cursor:"pointer",color:T.textSec,fontSize:12}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${T.red}10`;e.currentTarget.style.color=T.red;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textSec;}}>
            <LogOut size={14}/>
            {(!col||isMobile)&&<span>Cerrar sesión</span>}
          </div>
          {!isMobile&&(
            <div onClick={()=>setCol(!col)}
              style={{display:"flex",alignItems:"center",justifyContent:col?"center":"flex-end",
                padding:"5px 8px",borderRadius:8,cursor:"pointer",color:T.textMuted,marginTop:4}}
              onMouseEnter={e=>{e.currentTarget.style.color=T.text;}}
              onMouseLeave={e=>{e.currentTarget.style.color=T.textMuted;}}>
              {col?<ChevronRight size={13}/>:<><span style={{fontSize:10}}>Colapsar</span><ArrowLeft size={13} style={{marginLeft:4}}/></>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── TopBar ───────────────────────────────────────────────────
function TopBar({ title, isMobile, onMenu, session }) {
  return (
    <div style={{height:56,display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:`0 ${isMobile?16:24}px`,borderBottom:`1px solid ${T.border}`,
      background:T.surface,position:"sticky",top:0,zIndex:90}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {isMobile&&<div onClick={onMenu} style={{width:34,height:34,borderRadius:9,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          background:T.elevated,border:`1px solid ${T.border}`,color:T.textSec}}>
          <Menu size={16}/>
        </div>}
        <div style={{fontSize:isMobile?15:17,fontWeight:800,color:T.text}}>{title}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {session?.isTrial&&(
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",
            borderRadius:20,background:`${T.yellow}15`,border:`1px solid ${T.yellow}30`}}>
            <Clock size={10} color={T.yellow}/>
            <span style={{fontSize:10,fontWeight:700,color:T.yellow}}>TRIAL ACTIVO</span>
          </div>
        )}
        <div style={{width:32,height:32,borderRadius:8,cursor:"pointer",display:"flex",
          alignItems:"center",justifyContent:"center",background:T.elevated,
          border:`1px solid ${T.border}`,color:T.textSec,position:"relative"}}>
          <Bell size={13}/>
          <span style={{position:"absolute",top:6,right:6,width:5,height:5,
            borderRadius:"50%",background:T.cyan}}/>
        </div>
        <div style={{width:32,height:32,borderRadius:8,background:T.grad,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:11,fontWeight:800,color:"#fff",cursor:"pointer"}}>
          {session?.empresa?.[0]||"M"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD — Métricas en cero hasta datos reales de Firebase
// ═══════════════════════════════════════════════════════════════
function Dashboard({ encuestas, stats }) {
  const kpis = [
    { title:"Encuestas activas",   value:encuestas.filter(e=>e.estado==="active").length||0, icon:Activity,    color:T.cyan,   sub:"Tiempo real" },
    { title:"Respuestas totales",  value:stats.total||0,        icon:MessageSquare, color:T.green,  sub:`${stats.hoy||0} hoy` },
    { title:"Completadas",         value:stats.completadas||0,  icon:CheckCircle,   color:T.violet, sub:`${stats.descartes||0} descartes` },
    { title:"Encuestadores",       value:0,                     icon:Users,         color:T.yellow, sub:"Sin asignar" },
  ];

  const trendData = stats.total > 0
    ? [{d:"Ahora",r:stats.total}]
    : [{d:"Esperando datos",r:0}];

  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:3}}>
          Dashboard
        </div>
        <div style={{fontSize:13,color:T.textMuted}}>
          Todas las métricas parten en cero — crecen con datos reales
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
        gap:12,marginBottom:20}}>
        {kpis.map((k,i)=><KPI key={i} {...k}/>)}
      </div>

      {/* Estado vacío elegante */}
      {stats.total === 0 && (
        <Card s={{textAlign:"center",padding:48,
          background:`linear-gradient(135deg,${T.cyan}06,${T.violet}04)`,
          borderColor:`${T.cyan}20`}}>
          <div style={{width:64,height:64,borderRadius:18,background:`${T.cyan}12`,
            border:`1px solid ${T.cyan}20`,display:"flex",alignItems:"center",
            justifyContent:"center",margin:"0 auto 16px"}}>
            <Sparkles size={26} color={T.cyan}/>
          </div>
          <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:8}}>
            Listo para tu primer estudio
          </div>
          <div style={{fontSize:13,color:T.textSec,lineHeight:1.7,marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}>
            Describe tu idea o producto a la IA Generadora y en minutos tendrás
            un cuestionario de investigación de mercado listo para salir al terreno.
          </div>
          <Btn icon={Wand2}>Crear primera encuesta con IA</Btn>
        </Card>
      )}

      {/* Encuestas recientes */}
      {encuestas.length > 0 && (
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>
            Encuestas recientes
          </div>
          {encuestas.slice(0,5).map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,
              padding:"10px 0",borderBottom:i<4?`1px solid ${T.border}`:"none"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{e.titulo}</div>
                <div style={{fontSize:11,color:T.textMuted}}>{e.creado_at?.slice(0,10)}</div>
              </div>
              <Badge type={e.estado||"draft"}/>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IA GENERADORA — Orquestador + 5 Agentes + Pantalla animada
// ═══════════════════════════════════════════════════════════════
function IAGeneradora({ onEncuestaCreada }) {
  const [objetivo, setObjetivo] = useState("");
  const [sesiones, setSesiones] = useState(3);
  const [fase, setFase] = useState("input"); // input | generando | resultado
  const [agenteActivo, setAgenteActivo] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [preguntasFlotantes, setPreguntasFlotantes] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const flotanteIdRef = useRef(0);

  const AGENTES_INFO = [
    { id:"ipsos",  name:"IPSOS",  rol:"Psicología conductual",   color:T.cyan,   emoji:"🧠" },
    { id:"yougov", name:"YouGov", rol:"Perfilado continuo",       color:T.violet, emoji:"👥" },
    { id:"gallup", name:"Gallup", rol:"Rigor estadístico",        color:T.green,  emoji:"📊" },
    { id:"kantar", name:"Kantar", rol:"Validación conductual",    color:T.yellow, emoji:"🎯" },
    { id:"dynata", name:"Dynata", rol:"Anti-fraude + síntesis",   color:T.orange, emoji:"🔒" },
  ];

  const addPreguntaFlotante = (texto) => {
    const id = ++flotanteIdRef.current;
    setPreguntasFlotantes(p => [...p.slice(-8), { id, texto, x: 10+Math.random()*70, delay: Math.random()*0.5 }]);
    setTimeout(() => setPreguntasFlotantes(p => p.filter(q => q.id !== id)), 6000);
  };

  const generate = async () => {
    if (!objetivo.trim() || objetivo.length < 10) {
      setError("Describe tu idea con más detalle");
      return;
    }
    setFase("generando");
    setError(null);
    setProgreso(0);
    setPreguntasFlotantes([]);

    const sesionesGeneradas = [];
    let encuestaId = "";
    let tituloFinal = "";

    for (let i = 1; i <= sesiones; i++) {
      const agente = AGENTES_INFO[Math.min(i-1, AGENTES_INFO.length-1)];
      setAgenteActivo(agente);
      setProgreso(Math.round(((i-1)/sesiones)*100));

      // Mostrar preguntas flotantes mientras trabaja
      const tokens = ["Analizando mercado...", "Detectando dolores...", "Calibrando preguntas...",
        "Aplicando IAT...", "Validando muestra...", "Procesando datos...",
        "Generando insights...", "Estructurando sesión...", "Optimizando flujo..."];
      let tokenIdx = 0;
      const tokenInterval = setInterval(() => {
        addPreguntaFlotante(tokens[tokenIdx % tokens.length]);
        tokenIdx++;
      }, 800);

      let retries = 3;
      let sesionData = null;

      while (retries > 0 && !sesionData) {
        try {
          const res = await bunkerCall("generar_encuesta", {
            objetivo,
            sesion_actual: i,
            sesiones_total: sesiones,
            encuesta_id: encuestaId
          });
          if (res?.sesion) {
            sesionData = res;
            encuestaId = res.encuesta_id || encuestaId;
            tituloFinal = res.titulo || tituloFinal;
            sesionesGeneradas.push(res.sesion);
            // Mostrar preguntas reales flotando
            res.sesion.preguntas?.slice(0,3).forEach((p, pi) => {
              setTimeout(() => addPreguntaFlotante(p.enunciado?.slice(0,60)+"..."), pi*400);
            });
          }
        } catch(e) {
          retries--;
          if (retries > 0) {
            addPreguntaFlotante("Reintentando conexión...");
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }

      clearInterval(tokenInterval);

      if (!sesionData) {
        setError(`Error en sesión ${i}. Intenta de nuevo.`);
        setFase("input");
        setAgenteActivo(null);
        return;
      }

      setProgreso(Math.round((i/sesiones)*100));
      await new Promise(r => setTimeout(r, 500));
    }

    setAgenteActivo(null);
    setProgreso(100);
    addPreguntaFlotante("¡Estudio completo!");

    const encuestaFinal = {
      encuesta_id: encuestaId,
      titulo: tituloFinal,
      objetivo_negocio: objetivo,
      sesiones: sesionesGeneradas,
    };

    await new Promise(r => setTimeout(r, 1500));
    setResult(encuestaFinal);
    setFase("resultado");
  };

  const guardar = async () => {
    if (!result) return;
    try {
      const id = await guardarEncuesta(result);
      onEncuestaCreada({ ...result, firebase_id: id });
      setResult(null); setObjetivo(""); setFase("input"); setProgreso(0);
    } catch(e) { setError("Error al guardar"); }
  };

  // ── Pantalla de generación animada ──
  if (fase === "generando") return (
    <div style={{padding:24,minHeight:"60vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>

      {/* Preguntas flotantes */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {preguntasFlotantes.map(q=>(
          <div key={q.id} style={{
            position:"absolute",
            left:`${q.x}%`,
            bottom:"-10%",
            fontSize:11,
            color:`rgba(6,182,212,${0.3+Math.random()*0.4})`,
            background:`rgba(6,182,212,0.06)`,
            border:"1px solid rgba(6,182,212,0.15)",
            borderRadius:20,
            padding:"4px 12px",
            maxWidth:220,
            whiteSpace:"nowrap",
            overflow:"hidden",
            textOverflow:"ellipsis",
            animation:`floatUp 6s ease-out ${q.delay}s forwards`,
            zIndex:1,
          }}>{q.texto}</div>
        ))}
      </div>

      {/* Centro */}
      <div style={{textAlign:"center",zIndex:2,position:"relative"}}>
        {/* Orb animado */}
        <div style={{position:"relative",width:120,height:120,margin:"0 auto 24px"}}>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",
            background:`radial-gradient(circle,${T.cyan}30,transparent 70%)`,
            animation:"orbPulse 2s ease-in-out infinite"}}/>
          <div style={{position:"absolute",inset:8,borderRadius:"50%",
            border:`2px solid ${T.cyan}40`,animation:"orbSpin 3s linear infinite"}}/>
          <div style={{position:"absolute",inset:16,borderRadius:"50%",
            border:`2px dashed ${T.violet}30`,animation:"orbSpin 5s linear infinite reverse"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:36}}>
            {agenteActivo?.emoji||"🧠"}
          </div>
        </div>

        <div style={{fontSize:18,fontWeight:900,color:T.text,marginBottom:6}}>
          {agenteActivo ? `Agente ${agenteActivo.name}` : "Orquestador"}
        </div>
        <div style={{fontSize:13,color:agenteActivo?.color||T.cyan,marginBottom:20,fontWeight:600}}>
          {agenteActivo?.rol || "Consolidando análisis..."}
        </div>

        {/* Progress bar */}
        <div style={{width:240,height:4,background:T.elevated,borderRadius:4,
          margin:"0 auto 12px",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${progreso}%`,background:T.grad,
            borderRadius:4,transition:"width .6s ease"}}/>
        </div>
        <div style={{fontSize:11,color:T.textMuted}}>{progreso}% completado</div>

        {/* Agentes dots */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:20}}>
          {AGENTES_INFO.slice(0,sesiones).map((a,i)=>{
            const done = i < AGENTES_INFO.findIndex(x=>x.id===agenteActivo?.id);
            const active = agenteActivo?.id === a.id;
            return (
              <div key={a.id} style={{display:"flex",flexDirection:"column",
                alignItems:"center",gap:4}}>
                <div style={{width:32,height:32,borderRadius:"50%",
                  background:done?`${T.green}20`:active?`${a.color}25`:T.elevated,
                  border:`2px solid ${done?T.green:active?a.color:T.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,transition:"all .3s",
                  boxShadow:active?`0 0 12px ${a.color}50`:"none"}}>
                  {done?"✓":a.emoji}
                </div>
                <div style={{fontSize:9,color:done?T.green:active?a.color:T.textMuted,
                  fontWeight:active?700:400}}>{a.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes floatUp{0%{transform:translateY(0);opacity:0}10%{opacity:1}80%{opacity:.8}100%{transform:translateY(-100vh);opacity:0}}
        @keyframes orbPulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.15);opacity:1}}
        @keyframes orbSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );

  // ── Resultado ──
  if (fase === "resultado" && result) return (
    <div style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:2}}>
            ✅ Estudio generado
          </div>
          <div style={{fontSize:12,color:T.textSec}}>
            {result.sesiones?.length} sesiones · {result.sesiones?.reduce((a,s)=>a+(s.preguntas?.length||0),0)} preguntas
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" icon={RefreshCw} sm onClick={()=>{setFase("input");setResult(null);}}>Regenerar</Btn>
          <Btn v="green" icon={Check} sm onClick={guardar}>Guardar</Btn>
        </div>
      </div>

      <Card>
        <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:4}}>{result.titulo}</div>
        <div style={{fontSize:12,color:T.textSec,marginBottom:16}}>{result.objetivo_negocio}</div>
        {result.sesiones?.map((s,si)=>(
          <div key={si} style={{marginBottom:10,padding:14,borderRadius:12,
            background:T.elevated,border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:10,fontWeight:800,color:T.cyan,
                background:`${T.cyan}15`,padding:"2px 9px",borderRadius:20}}>
                Sesión {s.sesion}
              </span>
              <span style={{fontSize:12,fontWeight:700,color:T.text}}>{s.nombre}</span>
              <span style={{fontSize:10,color:T.textMuted,marginLeft:"auto"}}>
                {s.preguntas?.length||0} preguntas
              </span>
            </div>
            {s.preguntas?.slice(0,2).map((p,pi)=>(
              <div key={pi} style={{padding:"8px 10px",borderRadius:8,background:T.bg,
                border:`1px solid ${T.border}`,marginBottom:6,
                display:"flex",alignItems:"flex-start",gap:8}}>
                <span style={{fontSize:9,fontWeight:700,color:T.violet,
                  background:`${T.violet}15`,padding:"2px 7px",borderRadius:20,
                  flexShrink:0,marginTop:1}}>{p.metodologia||p.tipo}</span>
                <span style={{fontSize:12,color:T.textSec,flex:1}}>{p.enunciado}</span>
              </div>
            ))}
            {(s.preguntas?.length||0)>2&&(
              <div style={{fontSize:10,color:T.textMuted,textAlign:"center",marginTop:4}}>
                +{s.preguntas.length-2} preguntas más
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );

  // ── Input ──
  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:3}}>IA Generadora</div>
        <div style={{fontSize:13,color:T.textMuted}}>5 agentes especializados generan tu estudio</div>
      </div>

      <Card s={{marginBottom:16,background:`linear-gradient(135deg,${T.cyan}06,${T.violet}04)`,
        borderColor:`${T.cyan}20`}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>
          ¿Qué quieres validar en el mercado?
        </div>
        <textarea value={objetivo} onChange={e=>setObjetivo(e.target.value)}
          placeholder="Describe tu idea o producto. Ej: Tengo un alimento unificado para perros y gatos y quiero validar si hay mercado real..."
          rows={4}
          style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:11,
            padding:"12px 14px",color:T.text,fontSize:13,resize:"vertical",outline:"none",
            lineHeight:1.7,boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"}}
          onFocus={e=>e.currentTarget.style.borderColor=T.borderHover}
          onBlur={e=>e.currentTarget.style.borderColor=T.border}/>

        <div style={{display:"flex",gap:12,marginTop:14,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:T.textSec}}>Sesiones:</span>
            <select value={sesiones} onChange={e=>setSesiones(Number(e.target.value))}
              style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:8,
                padding:"5px 10px",color:T.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
              {[2,3,4,5].map(n=><option key={n} value={n}>{n} sesiones</option>)}
            </select>
          </div>
          <Btn icon={Sparkles} onClick={generate}
            disabled={!objetivo.trim()||objetivo.length<10}
            s={{marginLeft:"auto"}}>
            Generar estudio
          </Btn>
        </div>

        {error&&(
          <div style={{marginTop:12,padding:"10px 14px",background:`${T.red}12`,
            border:`1px solid ${T.red}30`,borderRadius:10,fontSize:12,color:T.red,
            display:"flex",alignItems:"center",gap:7}}>
            <AlertCircle size={13}/>{error}
          </div>
        )}
      </Card>

      {/* Agentes preview */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
        {AGENTES_INFO.map(a=>(
          <div key={a.id} style={{padding:"12px 14px",borderRadius:12,background:T.card,
            border:`1px solid ${T.border}`}}>
            <div style={{fontSize:16,marginBottom:4}}>{a.emoji}</div>
            <div style={{fontSize:11,fontWeight:700,color:a.color}}>{a.name}</div>
            <div style={{fontSize:10,color:T.textMuted}}>{a.rol}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MIS ENCUESTAS — Lista con WhatsApp share
// ═══════════════════════════════════════════════════════════════
function MisEncuestas({ encuestas, session }) {
  const [q, setQ] = useState("");
  const filtered = encuestas.filter(e=>
    e.titulo?.toLowerCase().includes(q.toLowerCase())
  );

  const shareWhatsApp = (encuesta) => {
    const link = `${window.location.origin}/encuestador?enc=${encuesta.firebase_id||encuesta.encuesta_id}`;
    const msg = encodeURIComponent(
      `*SurveyAI — ${session?.empresa||"Mi empresa"}*\n\n` +
      `Tienes asignada la encuesta:\n*${encuesta.titulo}*\n\n` +
      `Accede aquí:\n${link}\n\n` +
      `_Recuerda declarar tu jornada al iniciar._`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const copyLink = (encuesta) => {
    const link = `${window.location.origin}/encuestador?enc=${encuesta.firebase_id||encuesta.encuesta_id}`;
    navigator.clipboard.writeText(link).catch(()=>{});
  };

  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:3}}>Mis encuestas</div>
          <div style={{fontSize:13,color:T.textMuted}}>{encuestas.length} encuestas creadas</div>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,background:T.card,
        border:`1px solid ${T.border}`,borderRadius:11,padding:"8px 13px",marginBottom:16}}>
        <Search size={13} color={T.textMuted}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar encuesta..."
          style={{background:"none",border:"none",outline:"none",color:T.text,
            fontSize:13,width:"100%",fontFamily:"inherit"}}/>
      </div>

      {filtered.length === 0 ? (
        <Card s={{textAlign:"center",padding:48}}>
          <FileText size={32} color={T.textMuted} style={{marginBottom:12,display:"block",margin:"0 auto 12px"}}/>
          <div style={{fontSize:14,color:T.textSec,marginBottom:4}}>No hay encuestas aún</div>
          <div style={{fontSize:12,color:T.textMuted}}>Usa la IA Generadora para crear tu primer estudio</div>
        </Card>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map((e,i)=>(
            <Card key={i} onClick={()=>{}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <Badge type={e.estado||"draft"}/>
                    <span style={{fontSize:10,color:T.textMuted}}>
                      {e.sesiones?.length||0} sesiones · {e.sesiones?.reduce((a,s)=>a+(s.preguntas?.length||0),0)||0} preguntas
                    </span>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4,lineHeight:1.4}}>
                    {e.titulo}
                  </div>
                  <div style={{fontSize:11,color:T.textMuted}}>{e.creado_at?.slice(0,10)||"Hoy"}</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Btn v="whatsapp" sm icon={MessageCircle} onClick={e_=>{e_.stopPropagation();shareWhatsApp(e);}}>
                    WhatsApp
                  </Btn>
                  <Btn v="ghost" sm icon={Link2} onClick={e_=>{e_.stopPropagation();copyLink(e);}}>Link</Btn>
                  <Btn v="ghost" sm icon={Eye} onClick={e_=>e_.stopPropagation()}>Ver</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESPUESTAS — Firebase en tiempo real
// ═══════════════════════════════════════════════════════════════
function Respuestas({ stats }) {
  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:4}}>Respuestas</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>
        Datos en tiempo real desde Firebase
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
        gap:12,marginBottom:20}}>
        {[
          ["Total",stats.total||0,T.cyan],
          ["Completadas",stats.completadas||0,T.green],
          ["Descartes",stats.descartes||0,T.red],
          ["Hoy",stats.hoy||0,T.yellow],
        ].map(([l,v,c])=>(
          <Card key={l} s={{padding:"16px 18px"}}>
            <div style={{fontSize:28,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{l}</div>
          </Card>
        ))}
      </div>

      {stats.total === 0 && (
        <Card s={{textAlign:"center",padding:48}}>
          <div style={{fontSize:14,color:T.textSec,marginBottom:8}}>
            Sin respuestas aún
          </div>
          <div style={{fontSize:12,color:T.textMuted}}>
            Las respuestas llegarán aquí en tiempo real cuando los encuestadores trabajen en terreno.
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ENCUESTADORES — Gestión y generación de códigos
// ═══════════════════════════════════════════════════════════════
function Encuestadores({ session }) {
  const [encuestadores, setEncuestadores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEnc, setNewEnc] = useState({ nombre:"", email:"", telefono:"" });
  const [error, setError] = useState("");

  const generarCodigo = () => Math.random().toString(36).slice(2,10).toUpperCase();

  const agregar = () => {
    if (!newEnc.nombre || !newEnc.email) { setError("Nombre y email son requeridos"); return; }
    const enc = {
      ...newEnc,
      id: `enc-${Date.now()}`,
      codigo: generarCodigo(),
      estado: "activo",
      creado: new Date().toISOString(),
      respuestas_hoy: 0,
    };
    setEncuestadores(p=>[...p, enc]);
    setNewEnc({ nombre:"", email:"", telefono:"" });
    setShowForm(false); setError("");
  };

  const shareEncuestador = (enc) => {
    const link = `${window.location.origin}/encuestador`;
    const msg = encodeURIComponent(
      `*SurveyAI — Acceso Encuestador*\n\n` +
      `Hola ${enc.nombre},\n\n` +
      `Te asignamos acceso a la plataforma de encuestas de *${session?.empresa||"Mi empresa"}*.\n\n` +
      `🔗 Accede aquí: ${link}\n` +
      `📧 Email: ${enc.email}\n` +
      `🔑 Contraseña temporal: *${enc.codigo}*\n\n` +
      `_Al ingresar por primera vez se te pedirá cambiar la contraseña._`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:3}}>Encuestadores</div>
          <div style={{fontSize:13,color:T.textMuted}}>{encuestadores.length} registrados</div>
        </div>
        <Btn icon={Plus} onClick={()=>setShowForm(!showForm)}>Nuevo encuestador</Btn>
      </div>

      {showForm&&(
        <Card s={{marginBottom:16,borderColor:`${T.cyan}25`}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Registrar encuestador</div>
          {error&&<div style={{color:T.red,fontSize:12,marginBottom:10}}>{error}</div>}
          {[["nombre","Nombre completo"],["email","Email"],["telefono","WhatsApp (opcional)"]].map(([k,p])=>(
            <div key={k} style={{marginBottom:12}}>
              <input value={newEnc[k]} onChange={e=>setNewEnc(v=>({...v,[k]:e.target.value}))}
                placeholder={p}
                style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,
                  padding:"10px 13px",color:T.text,fontSize:13,outline:"none",
                  boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <Btn icon={Check} onClick={agregar}>Registrar</Btn>
            <Btn v="ghost" onClick={()=>{setShowForm(false);setError("");}}>Cancelar</Btn>
          </div>
        </Card>
      )}

      {encuestadores.length===0?(
        <Card s={{textAlign:"center",padding:48}}>
          <Users size={32} color={T.textMuted} style={{display:"block",margin:"0 auto 12px"}}/>
          <div style={{fontSize:14,color:T.textSec}}>Sin encuestadores registrados</div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>
            Agrega encuestadores y envíales su acceso por WhatsApp
          </div>
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {encuestadores.map((enc,i)=>(
            <Card key={i}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:10,background:T.grad,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>
                  {enc.nombre[0]}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text}}>{enc.nombre}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{enc.email}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:4}}>
                    CÓDIGO TEMP
                  </div>
                  <div style={{fontSize:12,fontFamily:"monospace",color:T.cyan,
                    background:`${T.cyan}12`,padding:"2px 8px",borderRadius:6}}>
                    {enc.codigo}
                  </div>
                </div>
                <Btn v="whatsapp" sm icon={MessageCircle}
                  onClick={()=>shareEncuestador(enc)}>
                  Enviar acceso
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS — Sin API keys visibles
// ═══════════════════════════════════════════════════════════════
function SettingsPage({ session }) {
  return (
    <div style={{padding:isMobile?16:24,maxWidth:600}}>
      <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:20}}>Configuración</div>

      <Card s={{marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Mi empresa</div>
        {[["Nombre",session?.empresa||""],["Email","admin@surveyai.cl"],["Plan",session?.isTrial?"Trial activo":"Pro"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",
            padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:12,color:T.textMuted}}>{l}</span>
            <span style={{fontSize:12,fontWeight:600,color:T.text}}>{v}</span>
          </div>
        ))}
      </Card>

      <Card s={{borderColor:`${T.yellow}20`,background:`${T.yellow}06`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <Shield size={14} color={T.yellow}/>
          <div style={{fontSize:13,fontWeight:700,color:T.yellow}}>Seguridad</div>
        </div>
        <div style={{fontSize:12,color:T.textSec,lineHeight:1.7}}>
          Las API Keys y credenciales están protegidas por el <strong>Protocolo Búnker</strong>.
          Nunca son visibles en el panel. Toda comunicación con servicios externos
          se realiza mediante tokens temporales de 90 segundos.
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL CAPA 2
// ═══════════════════════════════════════════════════════════════
let isMobile = false; // Se actualiza en runtime

export default function Layer2Mandante({ session, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [col, setCol] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [encuestas, setEncuestas] = useState([]);
  const [stats, setStats] = useState({ total:0, completadas:0, descartes:0, hoy:0 });

  isMobile = mobile; // sync to module scope for subcomponents

  useEffect(() => {
    const check = () => { const m = window.innerWidth < 768; setMobile(m); if(!m) setMobileOpen(false); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Firebase listeners
  useEffect(() => {
    const unsub1 = escucharEncuestas(null, setEncuestas);
    const unsub2 = escucharStats(setStats);
    return () => { unsub1?.(); unsub2?.(); };
  }, []);

  const PAGES = {
    dashboard:    <Dashboard encuestas={encuestas} stats={stats}/>,
    ia:           <IAGeneradora onEncuestaCreada={e=>setEncuestas(p=>[e,...p])}/>,
    encuestas:    <MisEncuestas encuestas={encuestas} session={session}/>,
    respuestas:   <Respuestas stats={stats}/>,
    encuestadores:<Encuestadores session={session}/>,
    analiticas:   <div style={{padding:24,color:T.textSec,fontSize:14}}>Analíticas — Próximamente</div>,
    settings:     <SettingsPage session={session}/>,
  };

  const TITLES = {
    dashboard:"Dashboard", ia:"IA Generadora", encuestas:"Mis encuestas",
    respuestas:"Respuestas", encuestadores:"Encuestadores",
    analiticas:"Analíticas", settings:"Configuración",
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,minHeight:"100vh",color:T.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,textarea,button,select{font-family:inherit}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.15);border-radius:2px}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.4;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
      `}</style>

      <Sidebar page={page} setPage={setPage} col={col} setCol={setCol}
        session={session} onLogout={onLogout}
        isMobile={mobile} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>

      <div style={{marginLeft:mobile?0:col?64:224,minHeight:"100vh",
        transition:"margin-left .25s cubic-bezier(.4,0,.2,1)",
        display:"flex",flexDirection:"column"}}>
        <TopBar title={TITLES[page]} isMobile={mobile}
          onMenu={()=>setMobileOpen(true)} session={session}/>
        <div style={{flex:1,overflowY:"auto"}}>
          {PAGES[page]}
        </div>
      </div>
    </div>
  );
}
