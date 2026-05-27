// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 2: PANEL MANDANTE v5                       ║
// ║  Todos los botones funcionales + Cliente + Ver encuesta      ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, FileText, Sparkles, MessageSquare, BarChart3,
  Users, Settings, LogOut, Menu, X, Bell, Search, Plus,
  Send, ArrowRight, ArrowLeft, RefreshCw, Mail, Copy,
  CheckCircle, AlertCircle, Clock, Eye, Trash2, Edit3,
  Wand2, Download, ChevronDown, Check,
  Link2, MessageCircle, Shield, ChevronRight, BarChart2, Users2, Layers
} from "lucide-react";
import { Activity } from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { bunkerCall, Session } from "./bunker.js";
import { guardarEncuesta, escucharStats, escucharEncuestas } from "./firebase.js";

const T = {
  bg:"#04080F", surface:"#070D1A", card:"#0A1120",
  elevated:"#0E1829", elevated2:"#131F32",
  border:"rgba(6,182,212,0.08)", borderHover:"rgba(6,182,212,0.3)",
  cyan:"#06B6D4", violet:"#7C3AED", green:"#10B981",
  red:"#EF4444", yellow:"#F59E0B", orange:"#F97316",
  text:"#F1F5F9", textSec:"#64748B", textMuted:"#1E3A5F",
  grad:"linear-gradient(135deg,#06B6D4,#7C3AED)",
  gradGreen:"linear-gradient(135deg,#10B981,#059669)",
};

const NAV = [
  { id:"dashboard",    label:"Dashboard",      icon:LayoutDashboard },
  { id:"encuestas",    label:"Mis encuestas",  icon:FileText },
  { id:"arquitecto",   label:"Arquitecto",     icon:Layers },
  { id:"ia",           label:"IA Generadora",  icon:Sparkles },
  { id:"respuestas",   label:"Respuestas",     icon:MessageSquare },
  { id:"encuestadores",label:"Encuestadores",  icon:Users },
  { id:"analiticas",   label:"Analíticas",     icon:BarChart3 },
  { id:"settings",     label:"Configuración",  icon:Settings },
];

let isMobile = false;

// ─── Primitives ───────────────────────────────────────────────
const Card = ({ children, s, onClick, glow }) => (
  <div onClick={onClick}
    style={{background:T.card,border:`1px solid ${glow?T.borderHover:T.border}`,
      borderRadius:16,padding:20,transition:"all .2s",
      cursor:onClick?"pointer":"default",...s}}>
    {children}
  </div>
);

const Btn = ({ children, v="primary", icon:I, sm, s, onClick, disabled, loading }) => {
  const vs = {
    primary:{background:T.grad,color:"#fff",border:"none"},
    ghost:{background:T.elevated,color:T.textSec,border:`1px solid ${T.border}`},
    green:{background:T.gradGreen,color:"#fff",border:"none"},
    danger:{background:`${T.red}18`,color:T.red,border:`1px solid ${T.red}30`},
    whatsapp:{background:"#25D366",color:"#fff",border:"none"},
  };
  return (
    <button disabled={disabled||loading} onClick={disabled||loading?undefined:onClick}
      style={{display:"inline-flex",alignItems:"center",gap:6,borderRadius:10,fontWeight:700,
        cursor:(disabled||loading)?"not-allowed":"pointer",
        padding:sm?"6px 12px":"10px 18px",fontSize:sm?11:13,
        transition:"all .15s",fontFamily:"inherit",
        opacity:(disabled||loading)?.5:1,...vs[v],...s}}>
      {loading
        ?<><RefreshCw size={sm?11:13} style={{animation:"spin 1s linear infinite"}}/>Procesando...</>
        :<>{I&&<I size={sm?11:13}/>}{children}</>}
    </button>
  );
};

const Badge = ({ type }) => {
  const map = {
    active:[`${T.green}20`,T.green,"Activa"],
    paused:[`${T.yellow}20`,T.yellow,"Pausada"],
    draft:[`${T.textSec}20`,T.textSec,"Borrador"],
    done:[`${T.cyan}20`,T.cyan,"Finalizada"],
  };
  const [bg,col,label] = map[type]||map.draft;
  return <span style={{background:bg,color:col,padding:"2px 10px",borderRadius:20,
    fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{label}</span>;
};

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ page, setPage, col, setCol, session, onLogout, isMobile, mobileOpen, setMobileOpen }) {
  return (
    <>
      {isMobile&&mobileOpen&&<div onClick={()=>setMobileOpen(false)}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:99}}/>}
      <div style={{width:isMobile?260:col?64:224,minHeight:"100vh",background:T.surface,
        borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",
        position:"fixed",top:0,left:0,bottom:0,zIndex:100,overflow:"hidden",
        transition:"width .25s cubic-bezier(.4,0,.2,1), transform .25s cubic-bezier(.4,0,.2,1)",
        transform:isMobile?(mobileOpen?"translateX(0)":"translateX(-100%)"):"translateX(0)"}}>
        <div style={{padding:"16px 14px",borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:9,flexShrink:0,background:T.grad,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <BarChart3 size={16} color="#fff"/>
            </div>
            {(!col||isMobile)&&<div>
              <div style={{fontSize:13,fontWeight:800,color:T.text}}>SurveyAI</div>
              <div style={{fontSize:9,color:T.cyan,textTransform:"uppercase",letterSpacing:".08em"}}>Enterprise</div>
            </div>}
          </div>
          {isMobile&&<div onClick={()=>setMobileOpen(false)} style={{cursor:"pointer",color:T.textSec}}><X size={14}/></div>}
        </div>
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {NAV.map(item=>{
            const active=page===item.id;
            const Icon=item.icon;
            return (
              <div key={item.id} onClick={()=>{setPage(item.id);if(isMobile)setMobileOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",
                  borderRadius:9,marginBottom:2,cursor:"pointer",
                  background:active?`${T.cyan}12`:"transparent",
                  color:active?T.cyan:T.textSec,transition:"all .15s",
                  borderLeft:`2px solid ${active?T.cyan:"transparent"}`}}>
                <Icon size={16} style={{flexShrink:0}}/>
                {(!col||isMobile)&&<span style={{fontSize:13,fontWeight:active?700:400}}>{item.label}</span>}
              </div>
            );
          })}
        </nav>
        <div style={{borderTop:`1px solid ${T.border}`,padding:10}}>
          {(!col||isMobile)&&(
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",
              borderRadius:10,background:`${T.cyan}08`,marginBottom:8}}>
              <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:T.grad,
                display:"flex",alignItems:"center",justifyContent:"center",
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
            onMouseEnter={e=>{e.currentTarget.style.color=T.red;}}
            onMouseLeave={e=>{e.currentTarget.style.color=T.textSec;}}>
            <LogOut size={14}/>{(!col||isMobile)&&<span>Cerrar sesión</span>}
          </div>
          {!isMobile&&(
            <div onClick={()=>setCol(!col)}
              style={{display:"flex",alignItems:"center",justifyContent:col?"center":"flex-end",
                padding:"5px 8px",borderRadius:8,cursor:"pointer",color:T.textMuted,marginTop:4}}
              onMouseEnter={e=>e.currentTarget.style.color=T.text}
              onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>
              {col?<ChevronRight size={13}/>:<><span style={{fontSize:10}}>Colapsar</span><ArrowLeft size={13} style={{marginLeft:4}}/></>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

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
            <span style={{fontSize:10,fontWeight:700,color:T.yellow}}>TRIAL</span>
          </div>
        )}
        <div style={{width:32,height:32,borderRadius:8,background:T.grad,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:11,fontWeight:800,color:"#fff"}}>
          {session?.empresa?.[0]||"M"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({ encuestas, stats, setPage }) {
  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:4}}>Dashboard</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>
        Métricas en tiempo real
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        {[
          ["Encuestas",encuestas.length,T.cyan,FileText],
          ["Respuestas",stats.total||0,T.green,MessageSquare],
          ["Completadas",stats.completadas||0,T.violet,CheckCircle],
          ["Hoy",stats.hoy||0,T.yellow,Activity],
        ].map(([l,v,c,Icon])=>(
          <Card key={l}>
            <div style={{width:36,height:36,borderRadius:10,background:`${c}15`,
              display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
              <Icon size={15} color={c}/>
            </div>
            <div style={{fontSize:26,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:3}}>{l}</div>
          </Card>
        ))}
      </div>

      {encuestas.length===0?(
        <Card s={{textAlign:"center",padding:48,
          background:`linear-gradient(135deg,${T.cyan}06,${T.violet}04)`,
          borderColor:`${T.cyan}20`}}>
          <div style={{fontSize:40,marginBottom:12}}>🧠</div>
          <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:8}}>
            Listo para tu primer estudio
          </div>
          <div style={{fontSize:13,color:T.textSec,lineHeight:1.7,marginBottom:24,
            maxWidth:400,margin:"0 auto 24px"}}>
            Describe tu idea a la IA Generadora y en minutos tendrás
            un cuestionario de investigación de mercado listo para terreno.
          </div>
          <Btn icon={Wand2} onClick={()=>setPage("ia")}>
            Crear primera encuesta con IA
          </Btn>
        </Card>
      ):(
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Encuestas recientes</div>
          {encuestas.slice(0,5).map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,
              padding:"10px 0",borderBottom:i<4?`1px solid ${T.border}`:"none"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{e.titulo}</div>
                <div style={{fontSize:11,color:T.textMuted}}>{e.cliente&&`${e.cliente} · `}{e.creado_at?.slice(0,10)}</div>
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
// AGENTE 0 — EL ARQUITECTO
// Genera el brief metodológico antes de los 5 agentes
// ═══════════════════════════════════════════════════════════════
function Arquitecto({ onBriefAprobado }) {
  const [idea, setIdea] = useState("");
  const [fase, setFase] = useState("input"); // input | generando | brief
  const [brief, setBrief] = useState(null);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(false);
  const [briefEditado, setBriefEditado] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const reconRef = useRef(null);

  // ── Voz ──
  const toggleVoz = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Tu navegador no soporta entrada por voz"); return; }
    if (escuchando) {
      reconRef.current?.stop();
      setEscuchando(false);
      return;
    }
    const r = new SR();
    r.lang = "es-CL"; r.continuous = true; r.interimResults = true;
    r.onresult = e => {
      const txt = Array.from(e.results).map(r=>r[0].transcript).join("");
      setIdea(txt);
    };
    r.onend = () => setEscuchando(false);
    r.onerror = () => setEscuchando(false);
    reconRef.current = r;
    r.start();
    setEscuchando(true);
  };

  const generar = async () => {
    if (!idea.trim() || idea.length < 10) { setError("Describe tu idea (mínimo 10 caracteres)"); return; }
    setFase("generando"); setError(null);
    try {
      const data = await bunkerCall("generar_brief", { idea });
      if (!data?.brief) throw new Error("Sin brief");
      setBrief(data.brief);
      setBriefEditado(JSON.stringify(data.brief, null, 2));
      setFase("brief");
    } catch(e) {
      setError("Error generando el brief. Intenta de nuevo.");
      setFase("input");
    }
  };

  const enviarAlOrquestador = () => {
    if (!brief) return;
    // Build objetivo from brief for the 5 agents
    const objetivo = `${brief.objetivo_negocio}. Hipótesis: ${brief.hipotesis_principal}. Variables: ${(brief.variables_clave||[]).join(", ")}.`;
    onBriefAprobado({ brief, objetivo, instrucciones: brief.sesiones });
  };

  if (fase === "generando") return (
    <div style={{padding:24,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",minHeight:"50vh",textAlign:"center"}}>
      <div style={{width:70,height:70,borderRadius:"50%",
        background:`radial-gradient(circle,${T.violet}35,transparent 70%)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:32,marginBottom:16,animation:"orbPulse 2s ease-in-out infinite"}}>
        🏛️
      </div>
      <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:6}}>
        Agente 0 — El Arquitecto
      </div>
      <div style={{fontSize:13,color:T.violet,marginBottom:20}}>
        Analizando tu idea y seleccionando metodologías...
      </div>
      <div style={{fontSize:11,color:T.textMuted}}>
        DCE · MaxDiff · Van Westendorp · IAT · Juster · VALS · AIO...
      </div>
      <style>{"@keyframes orbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}"}</style>
    </div>
  );

  if (fase === "brief" && brief) return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:16}}>🏛️</span>
            <span style={{fontSize:16,fontWeight:800,color:T.text}}>Brief metodológico listo</span>
          </div>
          <div style={{fontSize:12,color:T.textSec}}>
            Revisa y edita antes de enviarlo al orquestador
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn v="ghost" icon={ArrowLeft} sm onClick={()=>{setFase("input");setBrief(null);}}>Volver</Btn>
          <Btn v="ghost" icon={Edit3} sm onClick={()=>setEditando(!editando)}>
            {editando?"Ver normal":"Editar JSON"}
          </Btn>
          <Btn v="green" icon={Send} sm onClick={enviarAlOrquestador}>
            Enviar al Orquestador →
          </Btn>
        </div>
      </div>

      {editando ? (
        <Card s={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>
            Editar brief (JSON)
          </div>
          <textarea value={briefEditado}
            onChange={e=>{
              setBriefEditado(e.target.value);
              try{ setBrief(JSON.parse(e.target.value)); }catch{}
            }}
            rows={20}
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,
              borderRadius:10,padding:"12px 14px",color:T.text,fontSize:11,
              fontFamily:"monospace",outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
        </Card>
      ) : (
        <>
          {/* Resumen ejecutivo */}
          <Card s={{marginBottom:14,background:`linear-gradient(135deg,${T.violet}06,${T.cyan}04)`,borderColor:`${T.violet}20`}}>
            <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:6}}>{brief.titulo_estudio}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[
                ["🎯 Objetivo",brief.objetivo_negocio],
                ["💡 Hipótesis",brief.hipotesis_principal],
                ["👤 Audiencia",brief.cliente_objetivo],
                ["📊 Métricas",brief.metricas_clave?.join(", ")],
              ].map(([l,v])=>(
                <div key={l} style={{background:T.elevated,borderRadius:9,padding:"10px 12px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:3}}>{l}</div>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{v}</div>
                </div>
              ))}
            </div>
            {brief.advertencias_metodologicas?.length>0&&(
              <div style={{padding:"8px 12px",background:`${T.yellow}10`,borderRadius:8,
                border:`1px solid ${T.yellow}25`}}>
                <div style={{fontSize:10,fontWeight:700,color:T.yellow,marginBottom:4}}>
                  ⚠️ ADVERTENCIAS METODOLÓGICAS
                </div>
                {brief.advertencias_metodologicas.map((a,i)=>(
                  <div key={i} style={{fontSize:11,color:T.textSec}}>• {a}</div>
                ))}
              </div>
            )}
          </Card>

          {/* Sesiones planificadas */}
          <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
            letterSpacing:".07em",marginBottom:10}}>Plan de sesiones</div>
          {brief.sesiones?.map((s,i)=>{
            const COLORES=[T.cyan,T.violet,T.green,T.yellow,T.orange];
            const c=COLORES[i%5];
            return (
              <Card key={i} s={{marginBottom:10,borderLeft:`3px solid ${c}`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:32,height:32,borderRadius:8,background:`${c}20`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13,fontWeight:900,color:c,flexShrink:0}}>
                    {s.numero}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>{s.nombre}</div>
                    <div style={{fontSize:11,color:T.textSec,marginBottom:8}}>{s.objetivo_sesion}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                      {s.metodologias?.map((m,j)=>(
                        <span key={j} style={{fontSize:10,fontWeight:700,color:c,
                          background:`${c}12`,padding:"2px 8px",borderRadius:20,
                          border:`1px solid ${c}25`}}>{m}</span>
                      ))}
                    </div>
                    <div style={{fontSize:11,color:T.textMuted,background:T.elevated,
                      borderRadius:8,padding:"8px 10px",border:`1px solid ${T.border}`}}>
                      <strong style={{color:T.textSec}}>Instrucción:</strong> {s.instruccion_agente}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* CTA */}
          <div style={{marginTop:20,padding:20,background:`${T.green}08`,borderRadius:14,
            border:`1px solid ${T.green}25`,textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:6}}>
              ¿El brief está correcto?
            </div>
            <div style={{fontSize:12,color:T.textSec,marginBottom:16}}>
              Puedes editarlo o enviarlo directamente a los 5 agentes
            </div>
            <Btn icon={Send} onClick={enviarAlOrquestador} s={{padding:"12px 32px",fontSize:14}}>
              Enviar al Orquestador → Generar cuestionario
            </Btn>
          </div>
        </>
      )}
    </div>
  );

  // ── Input ──
  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <span style={{fontSize:24}}>🏛️</span>
          <div style={{fontSize:22,fontWeight:900,color:T.text}}>Arquitecto del Estudio</div>
        </div>
        <div style={{fontSize:13,color:T.textMuted}}>
          Describe tu idea · El Agente 0 selecciona las metodologías correctas · Los 5 agentes generan el cuestionario
        </div>
      </div>

      <Card s={{marginBottom:16,background:`linear-gradient(135deg,${T.violet}06,${T.cyan}04)`,
        borderColor:`${T.violet}20`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text}}>
            Describe tu idea de negocio
          </div>
          <button onClick={toggleVoz}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",
              borderRadius:20,border:`1px solid ${escuchando?T.red:T.violet}30`,
              background:escuchando?`${T.red}15`:`${T.violet}12`,
              color:escuchando?T.red:T.violet,fontSize:12,fontWeight:700,
              cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
            {escuchando?"🔴 Detener":"🎙️ Dictar idea"}
          </button>
        </div>

        {escuchando&&(
          <div style={{padding:"8px 12px",background:`${T.red}10`,borderRadius:8,
            border:`1px solid ${T.red}20`,marginBottom:10,fontSize:11,color:T.red,
            display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:T.red,
              animation:"pulse 1s ease-in-out infinite"}}/>
            Escuchando... habla con claridad
          </div>
        )}

        <textarea value={idea} onChange={e=>setIdea(e.target.value)} rows={6}
          placeholder="Ej: Tengo un alimento unificado para perros y gatos. Quiero saber si hay mercado, cuánto pagarían, cuáles son las características más valoradas y si la gente lo compraría hoy mismo o se inscribiría en una lista de espera.&#10;&#10;También quiero saber si el precio de $29.990 les parece razonable o genera desconfianza."
          style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,
            borderRadius:11,padding:"12px 14px",color:T.text,fontSize:13,
            resize:"vertical",outline:"none",lineHeight:1.7,
            boxSizing:"border-box",fontFamily:"inherit"}}
          onFocus={e=>e.currentTarget.style.borderColor=T.violet+"80"}
          onBlur={e=>e.currentTarget.style.borderColor=T.border}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14}}>
          <div style={{fontSize:11,color:T.textMuted}}>
            {idea.length} caracteres · {idea.length>=10?"✓ Listo":"Mínimo 10"}
          </div>
          <Btn icon={Wand2} onClick={generar}
            disabled={!idea.trim()||idea.length<10}>
            Generar brief metodológico
          </Btn>
        </div>

        {error&&<div style={{marginTop:12,padding:"10px 14px",background:`${T.red}12`,
          border:`1px solid ${T.red}30`,borderRadius:10,fontSize:12,color:T.red,
          display:"flex",alignItems:"center",gap:7}}>
          <AlertCircle size={13}/>{error}
          <div onClick={()=>setError(null)} style={{marginLeft:"auto",cursor:"pointer"}}><X size={12}/></div>
        </div>}
      </Card>

      {/* Las 20 metodologías disponibles */}
      <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
        letterSpacing:".07em",marginBottom:10}}>Metodologías disponibles para el Arquitecto</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
        {[
          ["🎯","Conjoint DCE","Simula góndola real",T.cyan],
          ["📊","MaxDiff","Prioriza sin sesgo",T.cyan],
          ["💰","Van Westendorp","Precio óptimo",T.green],
          ["📈","Gabor-Granger","Curva de demanda",T.green],
          ["🎲","Juster Scale","Intención probabilística",T.green],
          ["⚡","IAT","Asociaciones implícitas",T.violet],
          ["🧬","AIO Psicográfico","Estilo de vida",T.violet],
          ["🧠","VALS","Valores y motivaciones",T.violet],
          ["🔨","Jobs-to-be-Done","Disparadores reales",T.yellow],
          ["❤️","NPS / CSAT / CES","Lealtad y fricción",T.yellow],
          ["📝","Likert + Diferencial","Acuerdo y perfil",T.orange],
          ["💭","Proyectivas","Miedos del subconsciente",T.orange],
        ].map(([emoji,nombre,desc,c])=>(
          <div key={nombre} style={{padding:"10px 12px",borderRadius:10,background:T.card,
            border:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:16,flexShrink:0}}>{emoji}</span>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:c}}>{nombre}</div>
              <div style={{fontSize:10,color:T.textMuted}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IA GENERADORA — Campo cliente + nombre + animación
// ═══════════════════════════════════════════════════════════════
function IAGeneradora({ onEncuestaCreada, briefArquitecto }) {
  const [cliente, setCliente] = useState("");
  const [nombreEstudio, setNombreEstudio] = useState("");
  const [objetivo, setObjetivo] = useState(briefArquitecto?.objetivo || "");
  const [totalPreguntas, setTotalPreguntas] = useState(25);
  const [fase, setFase] = useState("input");
  const [agenteActivo, setAgenteActivo] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [flotantes, setFlotantes] = useState([]);
  const [sesionesOK, setSesionesOK] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [secs, setSecs] = useState(0);
  const [publicando, setPublicando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const flotId = useRef(0);
  const timerRef = useRef(null);
  const SESIONES = 5;
  const PPR = Math.ceil(totalPreguntas/SESIONES);

  const AGENTES = [
    {id:"ipsos", name:"IPSOS", rol:"Psicología conductual + IAT", color:T.cyan, emoji:"🧠"},
    {id:"yougov",name:"YouGov",rol:"Perfilado + Comportamiento",  color:T.violet,emoji:"👥"},
    {id:"gallup",name:"Gallup",rol:"Validación + Conjoint",       color:T.green, emoji:"📊"},
    {id:"kantar",name:"Kantar",rol:"Anclaje psicológico",         color:T.yellow,emoji:"🎯"},
    {id:"dynata",name:"Dynata",rol:"Intención real + Síntesis",   color:T.orange,emoji:"🔒"},
  ];

  const addFlotante = (texto) => {
    const id = ++flotId.current;
    setFlotantes(p=>[...p.slice(-12),{id,texto,x:5+Math.random()*80,speed:8+Math.random()*6}]);
    setTimeout(()=>setFlotantes(p=>p.filter(q=>q.id!==id)),12000);
  };

  useEffect(()=>{
    if(fase==="generando"){
      timerRef.current=setInterval(()=>setSecs(s=>s+1),1000);
    } else { clearInterval(timerRef.current); setSecs(0); }
    return()=>clearInterval(timerRef.current);
  },[fase]);

  const fmt = s=>`${Math.floor(s/60)?Math.floor(s/60)+"m ":""}${s%60}s`;

  const generate = async () => {
    if (!objetivo.trim()||objetivo.length<10) { setError("Describe tu idea (mínimo 10 caracteres)"); return; }
    setFase("generando"); setError(null); setProgreso(0); setFlotantes([]); setSesionesOK([]);
    const TOKENS=["Analizando mercado...","Aplicando IAT...","Detectando dolores...","Calibrando preguntas...","Validando estadística...","Diseñando Conjoint...","Calculando precio óptimo...","Detectando killer features...","Construyendo perfil...","Aplicando anclaje..."];
    const sesiones=[]; let encId=`enc-${Date.now().toString(36)}`; let titulo="";

    for(let i=1;i<=SESIONES;i++){
      const ag=AGENTES[i-1]; setAgenteActivo(ag);
      let ti=0;
      const iv=setInterval(()=>{addFlotante(TOKENS[ti++%TOKENS.length]);},1200);
      let retries=5; let ok=null;
      while(retries>0&&!ok){
        try{
          addFlotante(`${ag.emoji} ${ag.name} sesión ${i}...`);
          const res=await bunkerCall("generar_encuesta",{
            objetivo,sesion_actual:i,sesiones_total:SESIONES,
            encuesta_id:encId,preguntas_por_sesion:PPR
          });
          if(res?.sesion?.preguntas?.length>0){
            ok=res; encId=res.encuesta_id||encId; titulo=res.titulo||titulo;
            sesiones.push(res.sesion); setSesionesOK(p=>[...p,i]);
            res.sesion.preguntas.slice(0,3).forEach((p,pi)=>
              setTimeout(()=>addFlotante("✓ "+(p.enunciado?.slice(0,55)||"")+"..."),pi*200));
          }
        }catch(e){ retries--; if(retries>0){addFlotante("⚡ Reconectando..."); await new Promise(r=>setTimeout(r,3000));} }
      }
      clearInterval(iv);
      if(!ok){ setError(`Error en sesión ${i}. Intenta de nuevo.`); setFase("input"); setAgenteActivo(null); return; }
      setProgreso(Math.round((i/SESIONES)*100));
      await new Promise(r=>setTimeout(r,500));
    }
    setAgenteActivo({name:"Orquestador",rol:"Consolidando...",emoji:"🔮",color:T.cyan});
    addFlotante("🔮 Orquestador consolidando...");
    await new Promise(r=>setTimeout(r,1500));
    setResult({encuesta_id:encId,titulo:nombreEstudio||titulo,cliente,objetivo_negocio:objetivo,
      sesiones,total_preguntas:sesiones.reduce((a,s)=>a+(s.preguntas?.length||0),0),
      creado_at:new Date().toISOString()});
    setFase("resultado"); setAgenteActivo(null); setProgreso(100);
  };

  const publicar = async () => {
    if(!result||publicando) return;
    setPublicando(true); setError(null);
    try{
      const ADJS=["AGUILA","CONDOR","PUMA","ZORRO","LOBO","TIGRE","FALCON","JAGUAR"];
      const codigo=`${ADJS[Math.floor(Math.random()*ADJS.length)]}-${new Date().getFullYear()}`;

      // Build clean encuesta object
      const data={
        encuesta_id:result.encuesta_id,
        titulo:result.titulo,
        cliente:result.cliente||"",
        objetivo_negocio:result.objetivo_negocio,
        codigo,
        creado_at:new Date().toISOString(),
        total_preguntas:result.total_preguntas,
        sesiones:(result.sesiones||[]).map((s,si)=>({
          sesion: s.sesion||si+1,
          nombre: s.nombre||"",
          metodologia: s.metodologia||"",
          preguntas:(s.preguntas||[]).map((p,pi)=>({
            id: p.id||pi+1,
            tipo: p.tipo||"seleccion_unica",
            metodologia: p.metodologia||"",
            enunciado: p.enunciado||"",
            opciones: Array.isArray(p.opciones)?p.opciones:[],
            opciones_conjoint: p.opciones_conjoint||undefined,
            reglas: {
              requerido: p.reglas?.requerido||false,
              salto_logico: p.reglas?.salto_logico||undefined,
              max_opciones: p.reglas?.max_opciones||undefined,
            },
          }))
        }))
      };

      // Save to Firebase for analytics (backup)
      let fbId=null;
      try{ fbId=await guardarEncuesta({...data,estado:"active"}); }
      catch(e){ console.error("Firebase backup error:",e); }

      // Encode full encuesta in URL — no Firebase dependency for loading
      const jsonStr = JSON.stringify(data);
      const encoded = btoa(unescape(encodeURIComponent(jsonStr)));

      // Use short Firebase ID if available, fallback to encoded data
      const link = fbId
        ? `${window.location.origin}/encuestador?enc=${fbId}&eq=${encoded}`
        : `${window.location.origin}/encuestador?eq=${encoded}`;

      onEncuestaCreada({...data,firebase_id:fbId,estado:"active"});
      setResult(prev=>({...prev,codigo,link,publicada:true}));

    }catch(e){
      console.error("[SurveyAI] Error publicar:",e);
      setError("Error al publicar. Intenta de nuevo.");
    }finally{ setPublicando(false); }
  };

  const copyLink = () => {
    if(!result?.link) return;
    const el=document.createElement("textarea"); el.value=result.link;
    el.style.position="fixed"; el.style.opacity="0";
    document.body.appendChild(el); el.focus(); el.select();
    try{ document.execCommand("copy"); }catch{}
    document.body.removeChild(el);
    if(navigator.clipboard) navigator.clipboard.writeText(result.link).catch(()=>{});
    setCopiado(true); setTimeout(()=>setCopiado(false),2000);
  };

  const shareWA = () => {
    if(!result?.link) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(
      `*SurveyAI — ${result.titulo}*\n\n`+
      (result.cliente?`📊 Cliente: *${result.cliente}*\n`:"") +
      `🔑 Código: *${result.codigo}*\n`+
      `📋 Preguntas: ${result.total_preguntas}\n\n`+
      `🔗 Link:\n${result.link}\n\n`+
      `_Declara tu jornada al iniciar._`
    )}`,"_blank");
  };

  const shareEmail = () => {
    if(!result?.link) return;
    window.open(`mailto:?subject=${encodeURIComponent(`SurveyAI — ${result.titulo}`)}&body=${encodeURIComponent(
      `Estudio: ${result.titulo}\n`+(result.cliente?`Cliente: ${result.cliente}\n`:"")+
      `Código: ${result.codigo}\nPreguntas: ${result.total_preguntas}\n\nAccede aquí: ${result.link}`
    )}`,"_blank");
  };

  const descargar = () => {
    const b=new Blob([JSON.stringify(result,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(b);
    a.download=`encuesta-${result.encuesta_id}.json`; a.click();
  };

  // ── Animación ──
  if(fase==="generando") return (
    <div style={{minHeight:"70vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,
      position:"relative",overflow:"hidden",background:T.bg}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {flotantes.map(q=>(
          <div key={q.id} style={{position:"absolute",left:`${q.x}%`,bottom:"-5%",
            fontSize:11,color:"rgba(6,182,212,0.6)",background:"rgba(6,182,212,0.07)",
            border:"1px solid rgba(6,182,212,0.15)",borderRadius:20,padding:"4px 12px",
            maxWidth:260,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
            animation:`floatUp ${q.speed}s ease-out forwards`}}>{q.texto}</div>
        ))}
      </div>
      <div style={{textAlign:"center",zIndex:2,width:"100%",maxWidth:400}}>
        <div style={{position:"relative",width:130,height:130,margin:"0 auto 20px"}}>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",
            background:`radial-gradient(circle,${agenteActivo?.color||T.cyan}35,transparent 70%)`,
            animation:"orbPulse 2s ease-in-out infinite"}}/>
          <div style={{position:"absolute",inset:6,borderRadius:"50%",
            border:`2px solid ${agenteActivo?.color||T.cyan}50`,animation:"orbSpin 4s linear infinite"}}/>
          <div style={{position:"absolute",inset:14,borderRadius:"50%",
            border:`2px dashed ${T.violet}30`,animation:"orbSpin 7s linear infinite reverse"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:44}}>{agenteActivo?.emoji||"🔮"}</div>
        </div>
        <div style={{fontSize:20,fontWeight:900,color:T.text,marginBottom:4}}>{agenteActivo?.name||"Orquestador"}</div>
        <div style={{fontSize:13,color:agenteActivo?.color||T.cyan,fontWeight:600,marginBottom:6}}>{agenteActivo?.rol||"Procesando..."}</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:16}}>⏱ {fmt(secs)} · {totalPreguntas} preguntas · {sesionesOK.length}/{SESIONES} sesiones</div>
        <div style={{height:6,background:T.elevated,borderRadius:6,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${progreso}%`,background:T.grad,borderRadius:6,transition:"width .8s ease"}}/>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginTop:16}}>
          {AGENTES.map((a,i)=>{
            const done=sesionesOK.includes(i+1); const active=agenteActivo?.id===a.id;
            return (
              <div key={a.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:36,height:36,borderRadius:"50%",
                  background:done?`${T.green}20`:active?`${a.color}25`:T.elevated,
                  border:`2px solid ${done?T.green:active?a.color:T.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
                  transition:"all .4s",boxShadow:active?`0 0 16px ${a.color}60`:"none"}}>
                  {done?"✓":active?a.emoji:"○"}
                </div>
                <div style={{fontSize:9,color:done?T.green:active?a.color:T.textMuted,fontWeight:active?700:400}}>{a.name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes floatUp{0%{transform:translateY(0);opacity:0}5%{opacity:1}85%{opacity:.7}100%{transform:translateY(-110vh);opacity:0}}
        @keyframes orbPulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.2);opacity:1}}
        @keyframes orbSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );

  // ── Resultado ──
  if(fase==="resultado"&&result) return (
    <div style={{padding:24}}>
      {!result.publicada?(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
            marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:3}}>✅ Estudio completo</div>
              <div style={{fontSize:12,color:T.textSec}}>
                {result.sesiones?.length} sesiones · {result.total_preguntas} preguntas · {fmt(secs)}
                {result.cliente&&` · ${result.cliente}`}
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Btn v="ghost" icon={ArrowLeft} sm onClick={()=>{setFase("input");setResult(null);setSesionesOK([]);}}>Volver</Btn>
              <Btn v="ghost" icon={Download} sm onClick={descargar}>JSON</Btn>
              <Btn v="green" icon={Send} sm onClick={publicar} loading={publicando}>Publicar</Btn>
            </div>
          </div>
          {error&&<div style={{padding:"10px 14px",background:`${T.red}12`,border:`1px solid ${T.red}30`,
            borderRadius:10,fontSize:12,color:T.red,marginBottom:14,display:"flex",alignItems:"center",gap:7}}>
            <AlertCircle size={13}/>{error}</div>}
          <Card>
            <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:3}}>{result.titulo}</div>
            {result.cliente&&<div style={{fontSize:11,color:T.cyan,marginBottom:10}}>📊 {result.cliente}</div>}
            <div style={{fontSize:12,color:T.textSec,marginBottom:14,
              overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
              {result.objetivo_negocio}
            </div>
            {result.sesiones?.map((s,si)=>(
              <div key={si} style={{marginBottom:10,padding:14,borderRadius:12,
                background:T.elevated,border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:10,fontWeight:800,color:T.cyan,background:`${T.cyan}15`,
                    padding:"2px 9px",borderRadius:20}}>Sesión {s.sesion}</span>
                  <span style={{fontSize:12,fontWeight:700,color:T.text}}>{s.nombre}</span>
                  <span style={{fontSize:10,color:T.textMuted,marginLeft:"auto"}}>{s.preguntas?.length||0} P</span>
                </div>
                {s.preguntas?.map((p,pi)=>(
                  <div key={pi} style={{padding:"7px 10px",borderRadius:8,background:T.bg,
                    border:`1px solid ${T.border}`,marginBottom:5,display:"flex",alignItems:"flex-start",gap:7}}>
                    <span style={{fontSize:9,fontWeight:700,color:T.violet,background:`${T.violet}15`,
                      padding:"2px 7px",borderRadius:20,flexShrink:0,marginTop:1}}>
                      {p.metodologia||p.tipo}
                    </span>
                    <span style={{fontSize:12,color:T.textSec,flex:1,lineHeight:1.5}}>{p.enunciado}</span>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        </>
      ):(
        <div>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:48,marginBottom:8}}>🚀</div>
            <div style={{fontSize:20,fontWeight:900,color:T.green,marginBottom:4}}>¡Encuesta publicada!</div>
            <div style={{fontSize:13,color:T.textSec,marginBottom:4}}>{result.titulo}</div>
            {result.cliente&&<div style={{fontSize:11,color:T.cyan,marginBottom:16}}>📊 {result.cliente}</div>}
            <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"12px 24px",
              background:`${T.cyan}10`,borderRadius:14,border:`1px solid ${T.cyan}30`,marginBottom:8}}>
              <div>
                <div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>CÓDIGO DEL ESTUDIO</div>
                <div style={{fontSize:22,fontWeight:900,color:T.cyan,fontFamily:"monospace",letterSpacing:".1em"}}>
                  {result.codigo}
                </div>
              </div>
            </div>
          </div>
          <Card s={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Link del estudio</div>
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.bg,
              borderRadius:9,padding:"9px 13px",border:`1px solid ${T.border}`}}>
              <span style={{fontSize:11,color:T.textSec,flex:1,overflow:"hidden",
                textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{result.link}</span>
              <div onClick={copyLink} style={{cursor:"pointer",color:copiado?T.green:T.cyan,flexShrink:0}}>
                {copiado?<Check size={13}/>:<Copy size={13}/>}
              </div>
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={shareWA}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",
                background:"#25D366",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",
                fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
              <MessageCircle size={18}/>Compartir por WhatsApp
            </button>
            <button onClick={shareEmail}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",
                background:T.grad,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",
                fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
              <Mail size={18}/>Compartir por Email
            </button>
            <button onClick={copyLink}
              style={{width:"100%",padding:"13px",borderRadius:13,
                border:`1px solid ${copiado?T.green:T.border}`,
                background:copiado?`${T.green}12`:T.elevated,
                color:copiado?T.green:T.textSec,fontSize:14,fontWeight:600,cursor:"pointer",
                fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:9,
                transition:"all .2s"}}>
              {copiado?<><Check size={16}/>¡Copiado!</>:<><Link2 size={16}/>Copiar link</>}
            </button>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={()=>setFase("resultado")}
              style={{flex:1,padding:"11px",borderRadius:12,border:`1px solid ${T.border}`,
                background:T.elevated,color:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",
                fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Eye size={13}/>Ver encuesta
            </button>
            <button onClick={()=>{setFase("input");setResult(null);setSesionesOK([]);setCliente("");setNombreEstudio("");}}
              style={{flex:1,padding:"11px",borderRadius:12,border:`1px solid ${T.border}`,
                background:T.elevated,color:T.textSec,fontSize:13,fontWeight:600,cursor:"pointer",
                fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Plus size={13}/>Nueva encuesta
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Input ──
  return (
    <div style={{padding:24}}>
      <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:3}}>IA Generadora</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>
        5 agentes · IPSOS+Gallup+Kantar · Hasta 50 preguntas
      </div>
      <Card s={{marginBottom:16,background:`linear-gradient(135deg,${T.cyan}06,${T.violet}04)`,borderColor:`${T.cyan}20`}}>
        {/* Cliente y nombre */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
              letterSpacing:".07em",marginBottom:5}}>Cliente / Empresa</div>
            <input value={cliente} onChange={e=>setCliente(e.target.value)}
              placeholder="Ej: Agua Brava Ltda."
              style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,
                borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13,
                outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={e=>e.currentTarget.style.borderColor=T.borderHover}
              onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
              letterSpacing:".07em",marginBottom:5}}>Nombre del estudio</div>
            <input value={nombreEstudio} onChange={e=>setNombreEstudio(e.target.value)}
              placeholder="Ej: Validación producto mascotas"
              style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,
                borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13,
                outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={e=>e.currentTarget.style.borderColor=T.borderHover}
              onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
          </div>
        </div>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8}}>
          ¿Qué quieres validar en el mercado?
        </div>
        <textarea value={objetivo} onChange={e=>setObjetivo(e.target.value)} rows={5}
          placeholder="Describe tu idea o producto. Mientras más detalle, mejor el estudio.&#10;&#10;Ej: Tengo un alimento unificado para perros y gatos. Quiero saber si hay mercado, cuánto pagarían y qué características valoran más."
          style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:11,
            padding:"12px 14px",color:T.text,fontSize:13,resize:"vertical",outline:"none",
            lineHeight:1.7,boxSizing:"border-box",fontFamily:"inherit"}}
          onFocus={e=>e.currentTarget.style.borderColor=T.borderHover}
          onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
        <div style={{display:"flex",gap:12,marginTop:14,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:T.textSec}}>Preguntas:</span>
            <select value={totalPreguntas} onChange={e=>setTotalPreguntas(Number(e.target.value))}
              style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:8,
                padding:"6px 10px",color:T.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
              {[5,10,15,20,25,30,35,40,45,50].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{fontSize:11,color:T.textMuted}}>~{PPR} por sesión · {Math.ceil(totalPreguntas*2/60)} min aprox.</div>
          <Btn icon={Sparkles} onClick={generate} disabled={!objetivo.trim()||objetivo.length<10} s={{marginLeft:"auto"}}>
            Generar estudio
          </Btn>
        </div>
        {error&&<div style={{marginTop:12,padding:"10px 14px",background:`${T.red}12`,
          border:`1px solid ${T.red}30`,borderRadius:10,fontSize:12,color:T.red,
          display:"flex",alignItems:"center",gap:7}}>
          <AlertCircle size={13}/>{error}
          <div onClick={()=>setError(null)} style={{marginLeft:"auto",cursor:"pointer"}}><X size={12}/></div>
        </div>}
      </Card>
      <div style={{fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
        letterSpacing:".07em",marginBottom:10}}>Los 5 agentes del estudio</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:9}}>
        {AGENTES.map(a=>(
          <div key={a.id} style={{padding:"12px 13px",borderRadius:12,background:T.card,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:18,marginBottom:5}}>{a.emoji}</div>
            <div style={{fontSize:11,fontWeight:700,color:a.color,marginBottom:2}}>{a.name}</div>
            <div style={{fontSize:10,color:T.textMuted,lineHeight:1.4}}>{a.rol}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MIS ENCUESTAS — todos los botones funcionales
// ═══════════════════════════════════════════════════════════════
function MisEncuestas({ encuestas, session }) {
  const [q, setQ] = useState("");
  const [verIdx, setVerIdx] = useState(null);
  const [copiado, setCopiado] = useState("");
  const filtered = encuestas.filter(e=>e.titulo?.toLowerCase().includes(q.toLowerCase()));

  const getLink = (e) => `${window.location.origin}/encuestador?enc=${e.firebase_id||e.encuesta_id}`;

  const copyLink = (e) => {
    const link = getLink(e);
    const el=document.createElement("textarea"); el.value=link;
    el.style.position="fixed"; el.style.opacity="0";
    document.body.appendChild(el); el.focus(); el.select();
    try{ document.execCommand("copy"); }catch{}
    document.body.removeChild(el);
    if(navigator.clipboard) navigator.clipboard.writeText(link).catch(()=>{});
    setCopiado(e.firebase_id||e.encuesta_id);
    setTimeout(()=>setCopiado(""),2000);
  };

  const shareWA = (enc) => {
    const link = getLink(enc);
    window.open(`https://wa.me/?text=${encodeURIComponent(
      `*SurveyAI — ${session?.empresa||"Mi empresa"}*\n\n`+
      `📋 Encuesta: *${enc.titulo}*\n`+
      (enc.cliente?`🏢 Cliente: *${enc.cliente}*\n`:"")+
      (enc.codigo?`🔑 Código: *${enc.codigo}*\n`:"")+
      `\n🔗 Accede aquí:\n${link}\n\n`+
      `_Declara tu jornada al iniciar._`
    )}`,"_blank");
  };

  const shareEmail = (enc) => {
    const link = getLink(enc);
    window.open(`mailto:?subject=${encodeURIComponent(`SurveyAI — ${enc.titulo}`)}&body=${encodeURIComponent(
      `Encuesta: ${enc.titulo}\n`+(enc.cliente?`Cliente: ${enc.cliente}\n`:"")+
      (enc.codigo?`Código: ${enc.codigo}\n`:"")+`\nAccede aquí: ${link}`
    )}`,"_blank");
  };

  const normSesiones = (e) => {
    if(!e.sesiones) return [];
    if(Array.isArray(e.sesiones)) return e.sesiones;
    return Object.values(e.sesiones).map(s=>({
      ...s,
      preguntas: s.preguntas
        ? (Array.isArray(s.preguntas)?s.preguntas:Object.values(s.preguntas))
        : []
    }));
  };

  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:3}}>Mis encuestas</div>
          <div style={{fontSize:13,color:T.textMuted}}>{encuestas.length} encuestas guardadas</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:T.card,
        border:`1px solid ${T.border}`,borderRadius:11,padding:"8px 13px",marginBottom:16}}>
        <Search size={13} color={T.textMuted}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar encuesta..."
          style={{background:"none",border:"none",outline:"none",color:T.text,
            fontSize:13,width:"100%",fontFamily:"inherit"}}/>
      </div>

      {filtered.length===0?(
        <Card s={{textAlign:"center",padding:48}}>
          <FileText size={32} color={T.textMuted} style={{display:"block",margin:"0 auto 12px"}}/>
          <div style={{fontSize:14,color:T.textSec,marginBottom:4}}>No hay encuestas aún</div>
          <div style={{fontSize:12,color:T.textMuted}}>Usa la IA Generadora para crear tu primer estudio</div>
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map((e,i)=>{
            const sesiones = normSesiones(e);
            const totalP = sesiones.reduce((a,s)=>(a+(s.preguntas?.length||0)),0);
            const eId = e.firebase_id||e.encuesta_id;
            const isVer = verIdx===i;
            const isCop = copiado===eId;
            return (
              <Card key={i}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                      <Badge type={e.estado||"draft"}/>
                      <span style={{fontSize:10,color:T.textMuted}}>
                        {sesiones.length} ses · {totalP} P
                      </span>
                      {e.codigo&&<span style={{fontSize:10,color:T.cyan,fontFamily:"monospace",
                        background:`${T.cyan}12`,padding:"1px 7px",borderRadius:20}}>{e.codigo}</span>}
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3,lineHeight:1.4}}>
                      {e.titulo}
                    </div>
                    {e.cliente&&<div style={{fontSize:11,color:T.cyan,marginBottom:2}}>🏢 {e.cliente}</div>}
                    <div style={{fontSize:11,color:T.textMuted}}>{e.creado_at?.slice(0,10)||"Hoy"}</div>
                  </div>
                </div>
                {/* Botones — todos funcionales */}
                <div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap"}}>
                  <button onClick={()=>shareWA(e)}
                    style={{flex:1,minWidth:100,padding:"8px",borderRadius:9,border:"none",
                      background:"#25D366",color:"#fff",fontSize:12,fontWeight:700,
                      cursor:"pointer",fontFamily:"inherit",display:"flex",
                      alignItems:"center",justifyContent:"center",gap:5}}>
                    <MessageCircle size={12}/>WhatsApp
                  </button>
                  <button onClick={()=>shareEmail(e)}
                    style={{flex:1,minWidth:80,padding:"8px",borderRadius:9,border:"none",
                      background:T.grad,color:"#fff",fontSize:12,fontWeight:700,
                      cursor:"pointer",fontFamily:"inherit",display:"flex",
                      alignItems:"center",justifyContent:"center",gap:5}}>
                    <Mail size={12}/>Email
                  </button>
                  <button onClick={()=>copyLink(e)}
                    style={{padding:"8px 12px",borderRadius:9,
                      border:`1px solid ${isCop?T.green:T.border}`,
                      background:isCop?`${T.green}12`:T.elevated,
                      color:isCop?T.green:T.textSec,fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"inherit",display:"flex",
                      alignItems:"center",gap:5,transition:"all .2s"}}>
                    {isCop?<><Check size={11}/>Copiado</>:<><Link2 size={11}/>Link</>}
                  </button>
                  <button onClick={()=>setVerIdx(isVer?null:i)}
                    style={{padding:"8px 12px",borderRadius:9,
                      border:`1px solid ${isVer?T.cyan:T.border}`,
                      background:isVer?`${T.cyan}12`:T.elevated,
                      color:isVer?T.cyan:T.textSec,fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"inherit",display:"flex",
                      alignItems:"center",gap:5}}>
                    <Eye size={11}/>{isVer?"Ocultar":"Ver"}
                  </button>
                </div>

                {/* Panel Ver Encuesta */}
                {isVer&&(
                  <div style={{marginTop:14,borderTop:`1px solid ${T.border}`,paddingTop:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>
                      Preguntas del estudio
                    </div>
                    {sesiones.length===0?(
                      <div style={{fontSize:12,color:T.textMuted}}>Sin preguntas disponibles</div>
                    ):sesiones.map((s,si)=>(
                      <div key={si} style={{marginBottom:10,padding:12,borderRadius:10,
                        background:T.elevated,border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:11,fontWeight:700,color:T.cyan,marginBottom:8}}>
                          Sesión {s.sesion} — {s.nombre}
                        </div>
                        {(s.preguntas||[]).map((p,pi)=>(
                          <div key={pi} style={{fontSize:11,color:T.textSec,padding:"5px 8px",
                            marginBottom:4,borderRadius:6,background:T.bg,border:`1px solid ${T.border}`}}>
                            {pi+1}. {p.enunciado}
                          </div>
                        ))}
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <button onClick={()=>shareWA(e)}
                        style={{flex:1,padding:"10px",borderRadius:10,border:"none",
                          background:"#25D366",color:"#fff",fontSize:12,fontWeight:700,
                          cursor:"pointer",fontFamily:"inherit",display:"flex",
                          alignItems:"center",justifyContent:"center",gap:6}}>
                        <MessageCircle size={13}/>Enviar por WhatsApp
                      </button>
                      <button onClick={()=>shareEmail(e)}
                        style={{flex:1,padding:"10px",borderRadius:10,border:"none",
                          background:T.grad,color:"#fff",fontSize:12,fontWeight:700,
                          cursor:"pointer",fontFamily:"inherit",display:"flex",
                          alignItems:"center",justifyContent:"center",gap:6}}>
                        <Mail size={13}/>Enviar por Email
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESPUESTAS
// ═══════════════════════════════════════════════════════════════
function Respuestas({ stats }) {
  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:4}}>Respuestas</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>Tiempo real desde Firebase</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
        {[["Total",stats.total||0,T.cyan],["Completadas",stats.completadas||0,T.green],
          ["Descartes",stats.descartes||0,T.red],["Hoy",stats.hoy||0,T.yellow]].map(([l,v,c])=>(
          <Card key={l} s={{padding:"16px 18px"}}>
            <div style={{fontSize:28,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{l}</div>
          </Card>
        ))}
      </div>
      {stats.total===0&&(
        <Card s={{textAlign:"center",padding:40}}>
          <div style={{fontSize:13,color:T.textSec,marginBottom:6}}>Sin respuestas aún</div>
          <div style={{fontSize:12,color:T.textMuted}}>Las respuestas llegarán en tiempo real cuando los encuestadores trabajen.</div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ENCUESTADORES
// ═══════════════════════════════════════════════════════════════
function Encuestadores({ session }) {
  const [lista, setLista] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({nombre:"",email:"",telefono:""});
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState("");

  const genCodigo = () => {
    const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({length:8},()=>c[Math.floor(Math.random()*c.length)]).join("");
  };

  const agregar = () => {
    if(!form.nombre||!form.email){setError("Nombre y email requeridos");return;}
    const enc={...form,id:`enc-${Date.now()}`,codigo:genCodigo(),estado:"pendiente",creado:new Date().toISOString()};
    setLista(p=>[...p,enc]); setForm({nombre:"",email:"",telefono:""}); setShowForm(false); setError("");
  };

  const shareWA = (enc) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(
      `*SurveyAI — Acceso Encuestador*\n\n`+
      `Hola *${enc.nombre}*,\n\n`+
      `Acceso a *${session?.empresa||"Mi empresa"}*:\n\n`+
      `🔗 ${window.location.origin}/encuestador\n`+
      `📧 ${enc.email}\n`+
      `🔑 Contraseña: \`${enc.codigo}\``
    )}`,"_blank");
  };

  const copiarCredenciales = (enc) => {
    const txt=`Email: ${enc.email}\nContraseña: ${enc.codigo}\nPlataforma: ${window.location.origin}/encuestador`;
    const el=document.createElement("textarea"); el.value=txt;
    el.style.position="fixed"; el.style.opacity="0";
    document.body.appendChild(el); el.focus(); el.select();
    try{document.execCommand("copy");}catch{}
    document.body.removeChild(el);
    if(navigator.clipboard) navigator.clipboard.writeText(txt).catch(()=>{});
    setCopiado(enc.id); setTimeout(()=>setCopiado(""),2000);
  };

  return (
    <div style={{padding:isMobile?16:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:3}}>Encuestadores</div>
          <div style={{fontSize:13,color:T.textMuted}}>{lista.length} registrados</div>
        </div>
        <Btn icon={Plus} onClick={()=>setShowForm(!showForm)}>Nuevo</Btn>
      </div>

      {showForm&&(
        <Card s={{marginBottom:16,borderColor:`${T.cyan}25`}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Registrar encuestador</div>
          {error&&<div style={{color:T.red,fontSize:12,marginBottom:10}}>{error}</div>}
          {[["nombre","Nombre completo *","Carlos Méndez"],["email","Email *","carlos@empresa.cl"],["telefono","WhatsApp (opcional)","+56 9 XXXX XXXX"]].map(([k,l,p])=>(
            <div key={k} style={{marginBottom:11}}>
              <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
                letterSpacing:".06em",marginBottom:4}}>{l}</div>
              <input value={form[k]} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} placeholder={p}
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

      {lista.length===0?(
        <Card s={{textAlign:"center",padding:48}}>
          <Users size={32} color={T.textMuted} style={{display:"block",margin:"0 auto 12px"}}/>
          <div style={{fontSize:14,color:T.textSec}}>Sin encuestadores registrados</div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Agrega encuestadores y envíales acceso por WhatsApp</div>
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {lista.map((enc,i)=>(
            <Card key={i}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:40,height:40,borderRadius:11,background:T.grad,flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,fontWeight:800,color:"#fff"}}>
                  {enc.nombre[0].toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>{enc.nombre}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{enc.email}</div>
                </div>
                <div style={{background:`${T.cyan}12`,border:`1px solid ${T.cyan}25`,
                  borderRadius:8,padding:"4px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:T.textMuted,marginBottom:1}}>CLAVE TEMP</div>
                  <div style={{fontSize:12,fontFamily:"monospace",fontWeight:700,color:T.cyan}}>
                    {enc.codigo}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>shareWA(enc)}
                  style={{flex:1,padding:"9px",borderRadius:9,border:"none",background:"#25D366",
                    color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  <MessageCircle size={12}/>WhatsApp
                </button>
                <button onClick={()=>copiarCredenciales(enc)}
                  style={{padding:"9px 12px",borderRadius:9,border:`1px solid ${T.border}`,
                    background:copiado===enc.id?`${T.green}12`:T.elevated,
                    color:copiado===enc.id?T.green:T.textSec,fontSize:12,fontWeight:600,
                    cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  {copiado===enc.id?<><Check size={11}/>Copiado</>:<><Copy size={11}/>Copiar</>}
                </button>
                <button onClick={()=>setLista(p=>p.filter((_,j)=>j!==i))}
                  style={{padding:"9px 12px",borderRadius:9,border:`1px solid ${T.red}25`,
                    background:`${T.red}10`,color:T.red,fontSize:12,fontWeight:600,
                    cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  <Trash2 size={11}/>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════
function SettingsPage({ session }) {
  return (
    <div style={{padding:isMobile?16:24,maxWidth:600}}>
      <div style={{fontSize:22,fontWeight:900,color:T.text,marginBottom:20}}>Configuración</div>
      <Card s={{marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Mi empresa</div>
        {[["Nombre",session?.empresa||"—"],["Email","admin@surveyai.cl"],["Plan",session?.isTrial?"Trial activo":"Pro"]].map(([l,v])=>(
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
          <div style={{fontSize:13,fontWeight:700,color:T.yellow}}>Protocolo Búnker activo</div>
        </div>
        <div style={{fontSize:12,color:T.textSec,lineHeight:1.7}}>
          API Keys protegidas en Netlify. Tokens temporales de 90 segundos. Nunca expuestas al cliente.
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function Layer2Mandante({ session, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [col, setCol] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [encuestas, setEncuestas] = useState([]);
  const [briefActivo, setBriefActivo] = useState(null);
  const [stats, setStats] = useState({total:0,completadas:0,descartes:0,hoy:0});

  isMobile = mobile;

  useEffect(()=>{
    const check=()=>{const m=window.innerWidth<768;setMobile(m);if(!m)setMobileOpen(false);};
    check(); window.addEventListener("resize",check); return()=>window.removeEventListener("resize",check);
  },[]);

  useEffect(()=>{
    const u1=escucharEncuestas(null,setEncuestas);
    const u2=escucharStats(setStats);
    return()=>{u1?.();u2?.();};
  },[]);

  const PAGES = {
    dashboard:    <Dashboard encuestas={encuestas} stats={stats} setPage={setPage}/>,
    arquitecto:   <Arquitecto onBriefAprobado={b=>{setBriefActivo(b);setPage("ia");}}/>,
    ia:           <IAGeneradora onEncuestaCreada={e=>setEncuestas(p=>[e,...p])} briefArquitecto={briefActivo}/>,
    encuestas:    <MisEncuestas encuestas={encuestas} session={session}/>,
    respuestas:   <Respuestas stats={stats}/>,
    encuestadores:<Encuestadores session={session}/>,
    analiticas:   <div style={{padding:24,color:T.textSec,fontSize:14}}>Analíticas — Próximamente</div>,
    settings:     <SettingsPage session={session}/>,
  };

  const TITLES = {dashboard:"Dashboard",arquitecto:"Arquitecto del Estudio",ia:"IA Generadora",encuestas:"Mis encuestas",
    respuestas:"Respuestas",encuestadores:"Encuestadores",analiticas:"Analíticas",settings:"Configuración"};

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,minHeight:"100vh",color:T.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,textarea,button,select{font-family:inherit}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.15);border-radius:2px}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.4;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
      `}</style>
      <Sidebar page={page} setPage={setPage} col={col} setCol={setCol}
        session={session} onLogout={onLogout}
        isMobile={mobile} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <div style={{marginLeft:mobile?0:col?64:224,minHeight:"100vh",
        transition:"margin-left .25s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column"}}>
        <TopBar title={TITLES[page]} isMobile={mobile} onMenu={()=>setMobileOpen(true)} session={session}/>
        <div style={{flex:1,overflowY:"auto"}}>{PAGES[page]}</div>
      </div>
    </div>
  );
}
