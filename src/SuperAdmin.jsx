// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 5: SUPERADMIN + MONITOREO EN VIVO          ║
// ║  Trial clock · Estados · Gestión de acceso                  ║
// ║  © SurveyAI 2025 — Todos los derechos reservados           ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect } from "react";
import {
  Shield, Building2, Users, Smartphone, Activity, Clock,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Settings,
  BarChart3, Database, Server, Zap, LogOut, ArrowRight,
  Eye, Lock, Unlock, Bell, Search, MoreHorizontal, Wifi,
  TrendingUp, CreditCard, Terminal, ChevronRight, ChevronLeft
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";

const T = {
  bg:"#04080F", surface:"#060C18", card:"#090F1E",
  elevated:"#0C1526", border:"rgba(99,102,241,0.1)",
  primary:"#6366F1", cyan:"#06B6D4", green:"#10B981",
  red:"#EF4444", yellow:"#F59E0B", orange:"#F97316",
  text:"#F1F5F9", textSec:"#64748B", textMuted:"#1E3A5F",
  grad:"linear-gradient(135deg,#6366F1,#8B5CF6)",
};

// ─── Trial Clock ──────────────────────────────────────────────
function TrialCountdown({ expiresAt, compact }) {
  const [rem, setRem] = useState("");
  const [pct, setPct] = useState(100);

  useEffect(()=>{
    const TOTAL = 72*3600000;
    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) { setRem("EXPIRADO"); setPct(0); return; }
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      setRem(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
      setPct(Math.round((diff/TOTAL)*100));
    };
    tick();
    const iv = setInterval(tick,1000);
    return ()=>clearInterval(iv);
  },[expiresAt]);

  if (compact) return (
    <span style={{fontSize:10,fontWeight:800,color:T.yellow,
      fontFamily:"monospace"}}>{rem}</span>
  );

  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:32,fontWeight:900,color:T.yellow,
        fontFamily:"monospace",letterSpacing:".05em",marginBottom:6}}>{rem}</div>
      <div style={{height:4,background:T.elevated,borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,
          background:`linear-gradient(90deg,${T.yellow},${T.orange})`,
          borderRadius:4,transition:"width 1s linear"}}/>
      </div>
      <div style={{fontSize:10,color:T.textMuted,marginTop:4}}>
        {pct}% del trial restante
      </div>
    </div>
  );
}

// ─── Mock clientes ────────────────────────────────────────────
const MOCK_CLIENTES = [
  { id:"c1", empresa:"Alimentos del Sur S.A.", email:"admin@alimentosdelsur.cl",
    estado:"activo", plan:"Pro", respuestas:247, encuestas:3,
    trialExpiry:null, creado:"2025-05-10", device_fp:"fp-001" },
  { id:"c2", empresa:"RetailCorp Ltda.", email:"ti@retailcorp.cl",
    estado:"trial", plan:"Trial",respuestas:12, encuestas:1,
    trialExpiry:Date.now()+18*3600000, creado:"2025-05-22", device_fp:"fp-002" },
  { id:"c3", empresa:"MarketPro SpA", email:"ops@marketpro.cl",
    estado:"trial", plan:"Trial", respuestas:0, encuestas:0,
    trialExpiry:Date.now()+52*3600000, creado:"2025-05-23", device_fp:"fp-003" },
  { id:"c4", empresa:"Consultora Nexo", email:"info@nexo.cl",
    estado:"expirado", plan:"—", respuestas:89, encuestas:2,
    trialExpiry:Date.now()-5*3600000, creado:"2025-05-19", device_fp:"fp-004" },
  { id:"c5", empresa:"Clínica Andes", email:"sistemas@clinica.cl",
    estado:"desactivado", plan:"—", respuestas:31, encuestas:1,
    trialExpiry:null, creado:"2025-05-15", device_fp:"fp-005" },
];

const ESTADO_MAP = {
  activo:      { color:T.green,  bg:`${T.green}18`,  label:"Activo",     icon:CheckCircle },
  trial:       { color:T.yellow, bg:`${T.yellow}18`, label:"Trial",      icon:Clock },
  expirado:    { color:T.orange, bg:`${T.orange}18`, label:"Expirado",   icon:AlertCircle },
  desactivado: { color:T.red,    bg:`${T.red}18`,    label:"Desactivado",icon:XCircle },
};

const activityData = [
  {h:"00",r:2},{h:"04",r:0},{h:"08",r:12},{h:"12",r:34},
  {h:"16",r:28},{h:"20",r:15},{h:"23",r:8},
];

const NAV = [
  {id:"monitor",label:"Monitor en vivo",icon:Activity},
  {id:"clientes",label:"Clientes",icon:Building2},
  {id:"sistema",label:"Sistema",icon:Server},
  {id:"settings",label:"Configuración",icon:Settings},
];

function Card({children,s,glow}){
  return <div style={{background:T.card,border:`1px solid ${glow?T.primary+"40":T.border}`,
    borderRadius:14,padding:20,transition:"all .2s",...s}}>{children}</div>;
}

function Btn({children,v="primary",icon:I,sm,s,onClick}){
  const vs={
    primary:{background:T.grad,color:"#fff",border:"none"},
    ghost:{background:T.elevated,color:T.textSec,border:`1px solid ${T.border}`},
    danger:{background:`${T.red}15`,color:T.red,border:`1px solid ${T.red}30`},
    success:{background:`${T.green}15`,color:T.green,border:`1px solid ${T.green}30`},
  };
  return <button onClick={onClick}
    style={{display:"inline-flex",alignItems:"center",gap:5,borderRadius:9,fontWeight:700,
      cursor:"pointer",padding:sm?"5px 11px":"9px 16px",fontSize:sm?11:13,
      transition:"all .15s",fontFamily:"inherit",...vs[v],...s}}>
    {I&&<I size={sm?11:13}/>}{children}
  </button>;
}

function EstadoBadge({estado}){
  const st = ESTADO_MAP[estado]||ESTADO_MAP.desactivado;
  const Icon = st.icon;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,
    background:st.bg,color:st.color,padding:"3px 9px",borderRadius:20,
    fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>
    <Icon size={9}/>{st.label}
  </span>;
}

// ─── Monitor en vivo ──────────────────────────────────────────
function MonitorVivo({clientes}) {
  const stats = {
    activos: clientes.filter(c=>c.estado==="activo").length,
    trial: clientes.filter(c=>c.estado==="trial").length,
    expirados: clientes.filter(c=>c.estado==="expirado").length,
    total_resp: clientes.reduce((a,c)=>a+c.respuestas,0),
  };

  return (
    <div style={{padding:20}}>
      <div style={{fontSize:20,fontWeight:900,color:T.text,marginBottom:4}}>Monitor en vivo</div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:20}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:T.green,
          animation:"pulse 1.5s ease-in-out infinite"}}/>
        <span style={{fontSize:12,color:T.green,fontWeight:600}}>Sistema operativo</span>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
        {[
          ["Activos",stats.activos,T.green,CheckCircle],
          ["En Trial",stats.trial,T.yellow,Clock],
          ["Expirados",stats.expirados,T.orange,AlertCircle],
          ["Total resp.",stats.total_resp,T.cyan,Activity],
        ].map(([l,v,c,Icon])=>(
          <Card key={l} s={{padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <Icon size={14} color={c}/>
              <div style={{width:6,height:6,borderRadius:"50%",background:c,
                animation:"pulse 2s ease-in-out infinite"}}/>
            </div>
            <div style={{fontSize:26,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Activity chart */}
      <Card s={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>
          Actividad hoy (respuestas/hora)
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.primary} stopOpacity={.3}/>
                <stop offset="95%" stopColor={T.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
            <XAxis dataKey="h" tick={{fill:T.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:T.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}}/>
            <Area type="monotone" dataKey="r" stroke={T.primary} fill="url(#ga)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Clientes con trial — con reloj */}
      {clientes.filter(c=>c.estado==="trial").length > 0 && (
        <Card>
          <div style={{fontSize:12,fontWeight:700,color:T.yellow,marginBottom:12}}>
            ⏱ Trials activos — Tiempo restante
          </div>
          {clientes.filter(c=>c.estado==="trial").map(c=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",
              alignItems:"center",padding:"10px 0",
              borderBottom:`1px solid ${T.border}`}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:T.text}}>{c.empresa}</div>
                <div style={{fontSize:10,color:T.textMuted}}>{c.email}</div>
              </div>
              <TrialCountdown expiresAt={c.trialExpiry} compact/>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── Clientes ─────────────────────────────────────────────────
function Clientes({clientes,setClientes}) {
  const [q,setQ]=useState("");
  const [sel,setSel]=useState(null);
  const filtered=clientes.filter(c=>c.empresa.toLowerCase().includes(q.toLowerCase()));

  const toggleEstado=(id,nuevoEstado)=>{
    setClientes(p=>p.map(c=>c.id===id?{...c,estado:nuevoEstado}:c));
  };

  return (
    <div style={{padding:20}}>
      <div style={{fontSize:20,fontWeight:900,color:T.text,marginBottom:16}}>
        Clientes — {clientes.length} registrados
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,background:T.card,
        border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 13px",marginBottom:14}}>
        <Search size={13} color={T.textMuted}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar cliente..."
          style={{background:"none",border:"none",outline:"none",color:T.text,
            fontSize:13,width:"100%",fontFamily:"inherit"}}/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(c=>(
          <Card key={c.id} s={{padding:0,overflow:"hidden"}}>
            <div onClick={()=>setSel(sel?.id===c.id?null:c)}
              style={{padding:"14px 16px",cursor:"pointer",display:"flex",
                alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:9,flexShrink:0,
                background:T.grad,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>
                {c.empresa[0]}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {c.empresa}
                </div>
                <div style={{fontSize:10,color:T.textMuted}}>{c.email}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <EstadoBadge estado={c.estado}/>
                {c.estado==="trial"&&c.trialExpiry&&(
                  <TrialCountdown expiresAt={c.trialExpiry} compact/>
                )}
              </div>
            </div>

            {sel?.id===c.id&&(
              <div style={{padding:"0 16px 16px",borderTop:`1px solid ${T.border}`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",
                  gap:8,marginBottom:12,paddingTop:12}}>
                  {[["Encuestas",c.encuestas],["Respuestas",c.respuestas],
                    ["Creado",c.creado],["Plan",c.plan]].map(([l,v])=>(
                    <div key={l} style={{background:T.elevated,borderRadius:8,
                      padding:"8px 10px"}}>
                      <div style={{fontSize:9,color:T.textMuted,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {c.estado==="trial"&&(
                    <Btn v="success" sm icon={CheckCircle}
                      onClick={()=>toggleEstado(c.id,"activo")}>
                      Activar plan
                    </Btn>
                  )}
                  {c.estado==="activo"&&(
                    <Btn v="danger" sm icon={Lock}
                      onClick={()=>toggleEstado(c.id,"desactivado")}>
                      Suspender
                    </Btn>
                  )}
                  {(c.estado==="expirado"||c.estado==="desactivado")&&(
                    <Btn v="success" sm icon={Unlock}
                      onClick={()=>toggleEstado(c.id,"trial")}>
                      Reactivar trial
                    </Btn>
                  )}
                  <Btn v="ghost" sm icon={Eye}>Ver panel</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Sistema ──────────────────────────────────────────────────
function Sistema(){
  const metrics=[
    {label:"API Anthropic",value:"Operativa",color:T.green,icon:Zap},
    {label:"Firebase RTDB",value:"Conectado",color:T.green,icon:Database},
    {label:"Netlify CDN",value:"Activo",color:T.green,icon:Server},
    {label:"Protocolo Búnker",value:"Blindado",color:T.primary,icon:Shield},
  ];
  const logs=[
    `[${new Date().toLocaleTimeString()}] LOGIN_OK admin@surveyai.cl`,
    `[${new Date().toLocaleTimeString()}] RESPUESTA_OK encuesta-abc123`,
    `[${new Date().toLocaleTimeString()}] TOKEN_OK TTL 87s restantes`,
    `[${new Date().toLocaleTimeString()}] RATE_LIMIT_OK 4/30 req/min`,
    `[${new Date().toLocaleTimeString()}] FIREBASE_SYNC 3 docs escritos`,
  ];
  return (
    <div style={{padding:20}}>
      <div style={{fontSize:20,fontWeight:900,color:T.text,marginBottom:16}}>Sistema</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {metrics.map(m=>(
          <Card key={m.label} s={{padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <m.icon size={13} color={m.color}/>
              <span style={{fontSize:11,color:T.textSec}}>{m.label}</span>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:m.color}}>{m.value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <Terminal size={13} color={T.primary}/>
          <span style={{fontSize:12,fontWeight:700,color:T.text}}>Logs del agente fantasma</span>
          <span style={{fontSize:9,color:T.green,background:`${T.green}15`,
            padding:"2px 7px",borderRadius:20,marginLeft:"auto",fontWeight:700}}>LIVE</span>
        </div>
        {logs.map((l,i)=>(
          <div key={i} style={{fontSize:10,fontFamily:"monospace",color:T.textSec,
            padding:"5px 9px",background:T.elevated,borderRadius:6,marginBottom:5,
            border:`1px solid ${T.border}`}}>
            {l}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP SHELL — CAPA 5
// ═══════════════════════════════════════════════════════════════
export default function Layer5SuperAdmin({session,onLogout}){
  const [page,setPage]=useState("monitor");
  const [clientes,setClientes]=useState(MOCK_CLIENTES);
  const [col,setCol]=useState(false);

  const PAGES={
    monitor:<MonitorVivo clientes={clientes}/>,
    clientes:<Clientes clientes={clientes} setClientes={setClientes}/>,
    sistema:<Sistema/>,
    settings:<div style={{padding:20,color:T.textSec,fontSize:14}}>Configuración SuperAdmin — Próximamente</div>,
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,
      minHeight:"100vh",color:T.text,display:"flex"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button,input{font-family:inherit}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:2px}
        @keyframes pulse{0%,100%{opacity:.4;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>

      {/* Sidebar */}
      <div style={{width:col?60:220,minHeight:"100vh",background:T.surface,
        borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",
        position:"fixed",top:0,left:0,bottom:0,zIndex:100,overflow:"hidden",
        transition:"width .25s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{padding:"14px 12px",borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:8,flexShrink:0,
            background:T.grad,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Shield size={14} color="#fff"/>
          </div>
          {!col&&<div>
            <div style={{fontSize:12,fontWeight:800,color:T.text}}>SuperAdmin</div>
            <div style={{fontSize:9,color:T.red,fontWeight:700,letterSpacing:".04em"}}>
              ⬤ ACCESO RESTRINGIDO
            </div>
          </div>}
        </div>
        <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
          {NAV.map(item=>{
            const active=page===item.id;
            const Icon=item.icon;
            return (
              <div key={item.id} onClick={()=>setPage(item.id)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"8px 9px",
                  borderRadius:8,marginBottom:2,cursor:"pointer",
                  background:active?`${T.primary}15`:"transparent",
                  color:active?T.primary:T.textSec,transition:"all .15s",
                  borderLeft:`2px solid ${active?T.primary:"transparent"}`}}>
                <Icon size={15} style={{flexShrink:0}}/>
                {!col&&<span style={{fontSize:12,fontWeight:active?700:400}}>{item.label}</span>}
              </div>
            );
          })}
        </nav>
        <div style={{borderTop:`1px solid ${T.border}`,padding:8}}>
          <div onClick={onLogout}
            style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",
              borderRadius:8,cursor:"pointer",color:T.textSec,fontSize:12,marginBottom:4}}
            onMouseEnter={e=>{e.currentTarget.style.color=T.red;}}
            onMouseLeave={e=>{e.currentTarget.style.color=T.textSec;}}>
            <LogOut size={13}/>{!col&&"Salir"}
          </div>
          <div onClick={()=>setCol(!col)}
            style={{display:"flex",alignItems:"center",justifyContent:col?"center":"flex-end",
              padding:"5px 8px",cursor:"pointer",color:T.textMuted,borderRadius:7}}
            onMouseEnter={e=>e.currentTarget.style.color=T.text}
            onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>
            {col?<ChevronRight size={13}/>:<><span style={{fontSize:10}}>Colapsar</span><ChevronLeft size={13} style={{marginLeft:4}}/></>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{marginLeft:col?60:220,flex:1,minHeight:"100vh",
        transition:"margin-left .25s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{height:52,display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"0 20px",borderBottom:`1px solid ${T.border}`,background:T.surface,
          position:"sticky",top:0,zIndex:90}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text}}>
            {NAV.find(n=>n.id===page)?.label}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:10,fontWeight:700,color:T.red,
              background:`${T.red}15`,padding:"2px 9px",borderRadius:20,
              border:`1px solid ${T.red}30`}}>SUPERADMIN</span>
            <div style={{width:28,height:28,borderRadius:7,background:T.grad,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,fontWeight:800,color:"#fff"}}>SA</div>
          </div>
        </div>
        <div style={{overflowY:"auto"}}>{PAGES[page]}</div>
      </div>
    </div>
  );
}
