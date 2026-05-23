import { useState, createContext, useContext } from "react";
import {
  LayoutDashboard, Building2, Users, FileText, Zap, Shield,
  Settings, CreditCard, Activity, AlertTriangle, ChevronLeft,
  ChevronRight, Search, Bell, Plus, MoreHorizontal, Check,
  X, Eye, Edit3, Trash2, Download, Filter, RefreshCw,
  TrendingUp, Database, Globe, Lock, Unlock, Key, Mail,
  Phone, Calendar, BarChart3, CheckCircle, XCircle, Clock,
  Wifi, WifiOff, Smartphone, Star, ArrowUpRight, Copy,
  ToggleLeft, ToggleRight, UserPlus, Building, ChevronDown,
  AlertCircle, Terminal, HardDrive, Cpu, Server
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from "recharts";

// ═══════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════
const T = {
  bg: "#070B14", surface: "#0B1020", elevated: "#101828",
  elevated2: "#182035", border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(99,102,241,0.4)",
  primary: "#6366F1", secondary: "#8B5CF6", accent: "#06B6D4",
  success: "#10B981", warning: "#F59E0B", danger: "#EF4444",
  text: "#F1F5F9", textSec: "#94A3B8", textMuted: "#3D5070",
  gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)",
};

const Ctx = createContext(T);

// ═══════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════
const companies = [
  { id:1, name:"Alimentos del Sur S.A.", plan:"Enterprise", status:"active", users:12, surveys:8, responses:14287, created:"10 Ene 2025", contact:"admin@alimentosdelsur.cl", phone:"+56 9 1234 5678" },
  { id:2, name:"Retail Corp Ltda.", plan:"Pro", status:"active", users:5, surveys:3, responses:4201, created:"15 Feb 2025", contact:"ti@retailcorp.cl", phone:"+56 9 8765 4321" },
  { id:3, name:"Consultora Nexo", plan:"Starter", status:"suspended", users:2, surveys:1, responses:320, created:"01 Mar 2025", contact:"info@nexo.cl", phone:"+56 9 5555 1212" },
  { id:4, name:"MarketPro SpA", plan:"Pro", status:"active", users:7, surveys:5, responses:8940, created:"20 Mar 2025", contact:"ops@marketpro.cl", phone:"+56 9 3333 4444" },
  { id:5, name:"Clínica Andes", plan:"Enterprise", status:"active", users:20, surveys:12, responses:31200, created:"05 Abr 2025", contact:"sistemas@clinicaandes.cl", phone:"+56 9 2222 3333" },
];
const users = [
  { id:1, name:"Carlos Méndez", email:"carlos@alimentosdelsur.cl", company:"Alimentos del Sur S.A.", role:"Admin", status:"active", last:"Hace 2h", device:"iOS" },
  { id:2, name:"Ana Ramírez", email:"ana@retailcorp.cl", company:"Retail Corp Ltda.", role:"Encuestador", status:"active", last:"Hace 15min", device:"Android" },
  { id:3, name:"Pedro Vega", email:"pedro@nexo.cl", company:"Consultora Nexo", role:"Encuestador", status:"suspended", last:"Hace 5 días", device:"Android" },
  { id:4, name:"María López", email:"maria@marketpro.cl", company:"MarketPro SpA", role:"Admin", status:"active", last:"Ayer", device:"iOS" },
  { id:5, name:"Jorge Soto", email:"jorge@clinicaandes.cl", company:"Clínica Andes", role:"Encuestador", status:"active", last:"Hace 1h", device:"Android" },
  { id:6, name:"Valentina Cruz", email:"vale@clinicaandes.cl", company:"Clínica Andes", role:"Encuestador", status:"active", last:"Hace 30min", device:"iOS" },
];
const tickets = [
  { id:"TK-001", company:"Alimentos del Sur S.A.", subject:"App no sincroniza respuestas", priority:"high", status:"open", created:"Hace 2h" },
  { id:"TK-002", company:"Retail Corp Ltda.", subject:"Error al generar PDF de reporte", priority:"medium", status:"in_progress", created:"Hace 5h" },
  { id:"TK-003", company:"MarketPro SpA", subject:"Usuario no puede iniciar sesión", priority:"high", status:"resolved", created:"Ayer" },
  { id:"TK-004", company:"Clínica Andes", subject:"Solicitud de nuevos encuestadores", priority:"low", status:"open", created:"Hace 2 días" },
];
const activityData = [
  {d:"L",r:420,u:18},{d:"M",r:580,u:22},{d:"X",r:510,u:19},
  {d:"J",r:740,u:25},{d:"V",r:890,u:31},{d:"S",r:630,u:20},{d:"D",r:450,u:14},
];
const planData = [
  {name:"Enterprise",value:2,color:"#6366F1"},
  {name:"Pro",value:2,color:"#8B5CF6"},
  {name:"Starter",value:1,color:"#06B6D4"},
];

// ═══════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════
const Card = ({children, s, onClick}) => (
  <div onClick={onClick} style={{background:T.elevated,border:`1px solid ${T.border}`,
    borderRadius:16,padding:24,transition:"all .2s",cursor:onClick?"pointer":"default",...s}}
    onMouseEnter={onClick?e=>{e.currentTarget.style.borderColor=T.borderHover;e.currentTarget.style.transform="translateY(-1px)";}:undefined}
    onMouseLeave={onClick?e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";}:undefined}
  >{children}</div>
);

const Badge = ({type, label}) => {
  const map = {
    active:[`${T.success}22`,T.success,"Activo"],
    suspended:[`${T.danger}22`,T.danger,"Suspendido"],
    open:[`${T.danger}22`,T.danger,"Abierto"],
    in_progress:[`${T.warning}22`,T.warning,"En proceso"],
    resolved:[`${T.success}22`,T.success,"Resuelto"],
    high:[`${T.danger}22`,T.danger,"Alta"],
    medium:[`${T.warning}22`,T.warning,"Media"],
    low:[`${T.accent}22`,T.accent,"Baja"],
    Enterprise:[`${T.primary}22`,T.primary,"Enterprise"],
    Pro:[`${T.secondary}22`,T.secondary,"Pro"],
    Starter:[`${T.accent}22`,T.accent,"Starter"],
  };
  const [bg,col,def] = map[type]||[`${T.textMuted}22`,T.textMuted,type];
  return <span style={{background:bg,color:col,padding:"3px 10px",borderRadius:20,
    fontSize:10,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
    {label||def}</span>;
};

const Btn = ({children, v="primary", icon:I, sm, s, onClick}) => {
  const vs = {
    primary:{background:T.gradient,color:"#fff",border:"none",boxShadow:`0 4px 14px ${T.primary}40`},
    ghost:{background:T.elevated2,color:T.textSec,border:`1px solid ${T.border}`},
    danger:{background:`${T.danger}18`,color:T.danger,border:"none"},
    success:{background:`${T.success}18`,color:T.success,border:"none"},
  };
  return (
    <button style={{display:"inline-flex",alignItems:"center",gap:6,borderRadius:10,fontWeight:600,
      cursor:"pointer",padding:sm?"6px 14px":"9px 18px",fontSize:sm?12:13,
      transition:"all .15s",fontFamily:"inherit",...vs[v],...s}} onClick={onClick}
      onMouseEnter={e=>{e.currentTarget.style.opacity=".82";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}>
      {I&&<I size={sm?12:14}/>}{children}
    </button>
  );
};

const KPI = ({title,value,change,icon:I,color,sub}) => (
  <Card onClick={()=>{}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
      <div style={{width:40,height:40,borderRadius:11,background:`${color}18`,
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <I size={18} color={color}/>
      </div>
      {change!==undefined&&<span style={{fontSize:11,fontWeight:700,
        color:change>=0?T.success:T.danger,
        background:change>=0?`${T.success}18`:`${T.danger}18`,
        padding:"3px 9px",borderRadius:20}}>
        {change>=0?"+":""}{change}%</span>}
    </div>
    <div style={{fontSize:30,fontWeight:900,color:T.text,lineHeight:1,marginBottom:4}}>{value}</div>
    <div style={{fontSize:12,color:T.textMuted,marginBottom:sub?2:0}}>{title}</div>
    {sub&&<div style={{fontSize:11,color:T.textSec}}>{sub}</div>}
  </Card>
);

const TT = ({active,payload,label}) => active&&payload?.length?(
  <div style={{background:T.elevated2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px"}}>
    <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{fontSize:13,fontWeight:600,color:p.color||T.primary}}>{p.value}</div>)}
  </div>
):null;

const Toggle = ({on,onClick}) => (
  <div onClick={onClick} style={{width:44,height:24,borderRadius:12,
    background:on?T.success:"rgba(255,255,255,.1)",position:"relative",
    cursor:"pointer",transition:"background .2s",flexShrink:0}}>
    <div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,
      borderRadius:"50%",background:"#fff",transition:"left .2s",
      boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
  </div>
);

// ═══════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════
const navItems = [
  {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
  {id:"companies",label:"Empresas",icon:Building2},
  {id:"users",label:"Usuarios",icon:Users},
  {id:"surveys",label:"Encuestas",icon:FileText},
  {id:"apk",label:"APK / App",icon:Smartphone},
  {id:"support",label:"Soporte",icon:AlertTriangle},
  {id:"billing",label:"Facturación",icon:CreditCard},
  {id:"security",label:"Seguridad",icon:Shield},
  {id:"system",label:"Sistema",icon:Server},
  {id:"settings",label:"Configuración",icon:Settings},
];

function Sidebar({page,setPage,col,setCol}) {
  return (
    <div style={{width:col?68:240,minHeight:"100vh",background:T.surface,
      borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",
      position:"fixed",top:0,left:0,bottom:0,zIndex:100,overflow:"hidden",
      transition:"width .25s cubic-bezier(.4,0,.2,1)"}}>
      <div style={{padding:"18px 14px",borderBottom:`1px solid ${T.border}`,
        display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:10,flexShrink:0,
          background:T.gradient,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Shield size={17} color="#fff"/>
        </div>
        {!col&&<div>
          <div style={{fontSize:13,fontWeight:800,color:T.text}}>SuperAdmin</div>
          <div style={{fontSize:10,color:T.danger,fontWeight:700}}>⬤ ACCESO RESTRINGIDO</div>
        </div>}
      </div>
      <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
        {navItems.map(item=>{
          const active=page===item.id;
          const Icon=item.icon;
          return (
            <div key={item.id} onClick={()=>setPage(item.id)} title={col?item.label:undefined}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",
                borderRadius:9,marginBottom:2,cursor:"pointer",whiteSpace:"nowrap",
                background:active?`${T.primary}18`:"transparent",
                color:active?T.primary:T.textMuted,transition:"all .15s",
                borderLeft:`2px solid ${active?T.primary:"transparent"}`}}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color=T.text;}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;}}}>
              <Icon size={16} style={{flexShrink:0}}/>
              {!col&&<span style={{fontSize:13,fontWeight:active?600:400}}>{item.label}</span>}
            </div>
          );
        })}
      </nav>
      <div style={{borderTop:`1px solid ${T.border}`,padding:10}}>
        {!col&&<div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 8px",
          borderRadius:10,background:`${T.danger}0A`,marginBottom:8,
          border:`1px solid ${T.danger}20`}}>
          <div style={{width:30,height:30,borderRadius:8,flexShrink:0,
            background:T.gradient,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff"}}>SA</div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.text}}>Super Admin</div>
            <div style={{fontSize:10,color:T.danger}}>Acceso total</div>
          </div>
        </div>}
        <div onClick={()=>setCol(!col)}
          style={{display:"flex",alignItems:"center",justifyContent:col?"center":"flex-end",
            padding:"6px 8px",borderRadius:8,cursor:"pointer",color:T.textMuted}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.color=T.text;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;}}>
          {col?<ChevronRight size={15}/>:<><span style={{fontSize:11}}>Colapsar</span><ChevronLeft size={15} style={{marginLeft:6}}/></>}
        </div>
      </div>
    </div>
  );
}

function TopBar({title}) {
  return (
    <div style={{height:58,display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"0 28px",borderBottom:`1px solid ${T.border}`,background:T.surface,
      position:"sticky",top:0,zIndex:90}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:17,fontWeight:700,color:T.text}}>{title}</div>
        <span style={{fontSize:10,fontWeight:700,color:T.danger,background:`${T.danger}18`,
          padding:"2px 8px",borderRadius:20,border:`1px solid ${T.danger}30`}}>SUPERADMIN</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:T.elevated,
          border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 12px",width:200}}>
          <Search size={13} color={T.textMuted}/>
          <input placeholder="Buscar empresa, usuario..." style={{background:"none",border:"none",
            outline:"none",color:T.text,fontSize:13,width:"100%",fontFamily:"inherit"}}/>
        </div>
        <div style={{width:34,height:34,borderRadius:8,cursor:"pointer",display:"flex",
          alignItems:"center",justifyContent:"center",background:T.elevated,
          border:`1px solid ${T.border}`,color:T.textMuted,position:"relative"}}>
          <Bell size={14}/>
          <span style={{position:"absolute",top:7,right:7,width:5,height:5,
            borderRadius:"50%",background:T.danger}}/>
        </div>
        <div style={{width:34,height:34,borderRadius:8,background:T.gradient,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer"}}>SA</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function Dashboard() {
  const kpis = [
    {title:"Empresas activas",value:"5",change:20,icon:Building2,color:T.primary,sub:"1 nueva este mes"},
    {title:"Usuarios totales",value:"46",change:12,icon:Users,color:T.accent,sub:"+6 esta semana"},
    {title:"Respuestas totales",value:"58,948",change:31,icon:FileText,color:T.success,sub:"Todas las empresas"},
    {title:"Tickets abiertos",value:"3",change:-25,icon:AlertTriangle,color:T.warning,sub:"2 de alta prioridad"},
    {title:"Uptime sistema",value:"99.9%",icon:Activity,color:T.success,sub:"Últimos 30 días"},
    {title:"Ingresos MRR",value:"$4,850",change:8,icon:CreditCard,color:T.secondary,sub:"USD este mes"},
  ];
  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div>
          <div style={{fontSize:24,fontWeight:800,color:T.text,marginBottom:3}}>Panel de Control Global</div>
          <div style={{fontSize:13,color:T.textMuted}}>Visión completa del sistema SurveyAI</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ghost" icon={Download} sm>Reporte</Btn>
          <Btn icon={Plus} sm>Nueva empresa</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        {kpis.map((k,i)=><KPI key={i} {...k}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Actividad del sistema</div>
              <div style={{fontSize:12,color:T.textMuted}}>Respuestas y usuarios activos</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.primary} stopOpacity={.3}/><stop offset="95%" stopColor={T.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="d" tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="r" stroke={T.primary} fill="url(#ga)" strokeWidth={2.5} dot={false} name="Respuestas"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>Distribución planes</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>5 empresas activas</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={planData} cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={4} dataKey="value">
                {planData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {planData.map((c,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:c.color}}/>
                <span style={{fontSize:11,color:T.textSec}}>{c.name}</span>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:T.text}}>{c.value}</span>
            </div>
          ))}
        </Card>
      </div>
      {/* Tickets recientes */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text}}>Tickets de soporte recientes</div>
          <Badge type="open" label={`${tickets.filter(t=>t.status==="open").length} abiertos`}/>
        </div>
        {tickets.map((tk,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",
            borderBottom:i<tickets.length-1?`1px solid ${T.border}`:"none"}}>
            <div style={{width:32,height:32,borderRadius:8,
              background:tk.priority==="high"?`${T.danger}18`:tk.priority==="medium"?`${T.warning}18`:`${T.accent}18`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <AlertCircle size={14} color={tk.priority==="high"?T.danger:tk.priority==="medium"?T.warning:T.accent}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:T.text}}>{tk.subject}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{tk.company} · {tk.created}</div>
            </div>
            <Badge type={tk.status}/>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COMPANIES
// ═══════════════════════════════════════════════════════
function Companies() {
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState("");
  const filtered=companies.filter(c=>c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Empresas clientes</div>
          <div style={{fontSize:13,color:T.textMuted}}>{companies.length} empresas registradas</div>
        </div>
        <Btn icon={Plus}>Nueva empresa</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:sel?"1fr 360px":"1fr",gap:14}}>
        <Card s={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:7,background:T.elevated2,
              border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 12px",flex:1,maxWidth:280}}>
              <Search size={13} color={T.textMuted}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar empresa..."
                style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:13,width:"100%",fontFamily:"inherit"}}/>
            </div>
            <Btn v="ghost" icon={Filter} sm>Filtrar</Btn>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Empresa","Plan","Estado","Usuarios","Respuestas","Creada",""].map((h,i)=>(
                <th key={i} style={{padding:"12px 18px",textAlign:"left",fontSize:9,fontWeight:700,
                  color:T.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)}
                  style={{borderBottom:`1px solid ${T.border}`,cursor:"pointer",transition:"background .15s",
                    background:sel?.id===c.id?`${T.primary}0A`:"transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${T.primary}06`}
                  onMouseLeave={e=>e.currentTarget.style.background=sel?.id===c.id?`${T.primary}0A`:"transparent"}>
                  <td style={{padding:"14px 18px"}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{c.name}</div>
                    <div style={{fontSize:11,color:T.textMuted}}>{c.contact}</div>
                  </td>
                  <td style={{padding:"14px 18px"}}><Badge type={c.plan}/></td>
                  <td style={{padding:"14px 18px"}}><Badge type={c.status}/></td>
                  <td style={{padding:"14px 18px",fontSize:13,fontWeight:700,color:T.text}}>{c.users}</td>
                  <td style={{padding:"14px 18px",fontSize:13,fontWeight:700,color:T.text}}>{c.responses.toLocaleString()}</td>
                  <td style={{padding:"14px 18px",fontSize:12,color:T.textMuted}}>{c.created}</td>
                  <td style={{padding:"14px 18px"}}>
                    <div style={{display:"flex",gap:3}}>
                      {[Eye,Edit3,Trash2].map((Icon,i)=>(
                        <div key={i} style={{width:28,height:28,borderRadius:6,cursor:"pointer",
                          display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted}}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.07)";e.currentTarget.style.color=T.text;}}
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
        {sel&&(
          <Card s={{alignSelf:"start",padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Detalle empresa</div>
              <div onClick={()=>setSel(null)} style={{cursor:"pointer",color:T.textMuted}}><X size={14}/></div>
            </div>
            <div style={{width:48,height:48,borderRadius:13,background:T.gradient,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:18,fontWeight:900,color:"#fff",marginBottom:12}}>
              {sel.name[0]}
            </div>
            <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:3}}>{sel.name}</div>
            <div style={{marginBottom:16}}><Badge type={sel.plan}/></div>
            {[["Estado",<Badge type={sel.status}/>],["Contacto",sel.contact],["Teléfono",sel.phone],
              ["Creada",sel.created],["Usuarios",sel.users],["Respuestas",sel.responses.toLocaleString()]
            ].map(([k,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"8px 0",borderBottom:i<5?`1px solid ${T.border}`:"none"}}>
                <span style={{fontSize:11,color:T.textMuted}}>{k}</span>
                <span style={{fontSize:12,color:T.textSec,fontWeight:600}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:8}}>
              <Btn icon={Edit3} s={{width:"100%",justifyContent:"center"}}>Editar empresa</Btn>
              <Btn v="ghost" icon={Key} s={{width:"100%",justifyContent:"center"}}>Resetear API Key</Btn>
              <Btn v={sel.status==="active"?"danger":"success"}
                icon={sel.status==="active"?Lock:Unlock}
                s={{width:"100%",justifyContent:"center"}}>
                {sel.status==="active"?"Suspender acceso":"Reactivar acceso"}
              </Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════
function UsersPage() {
  const [q,setQ]=useState("");
  const filtered=users.filter(u=>u.name.toLowerCase().includes(q.toLowerCase())||u.company.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Usuarios del sistema</div>
          <div style={{fontSize:13,color:T.textMuted}}>{users.length} usuarios · {users.filter(u=>u.status==="active").length} activos</div>
        </div>
        <Btn icon={UserPlus}>Nuevo usuario</Btn>
      </div>
      <Card s={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:T.elevated2,
            border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 12px",flex:1,maxWidth:280}}>
            <Search size={13} color={T.textMuted}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar usuario..."
              style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:13,width:"100%",fontFamily:"inherit"}}/>
          </div>
          <Btn v="ghost" icon={Filter} sm>Filtrar</Btn>
          <Btn v="ghost" icon={Download} sm>Exportar</Btn>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
            {["Usuario","Empresa","Rol","Estado","Último acceso","Dispositivo",""].map((h,i)=>(
              <th key={i} style={{padding:"12px 18px",textAlign:"left",fontSize:9,fontWeight:700,
                color:T.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(u=>(
              <tr key={u.id} style={{borderBottom:`1px solid ${T.border}`,transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${T.primary}06`}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:30,height:30,borderRadius:8,background:T.gradient,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>
                      {u.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>{u.name}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:"12px 18px",fontSize:12,color:T.textSec}}>{u.company}</td>
                <td style={{padding:"12px 18px"}}>
                  <span style={{fontSize:11,color:u.role==="Admin"?T.primary:T.accent,
                    background:u.role==="Admin"?`${T.primary}18`:`${T.accent}18`,
                    padding:"2px 9px",borderRadius:20,fontWeight:700}}>{u.role}</span>
                </td>
                <td style={{padding:"12px 18px"}}><Badge type={u.status}/></td>
                <td style={{padding:"12px 18px",fontSize:12,color:T.textMuted}}>{u.last}</td>
                <td style={{padding:"12px 18px"}}>
                  <span style={{fontSize:11,color:T.textMuted,display:"flex",alignItems:"center",gap:4}}>
                    <Smartphone size={11}/>{u.device}
                  </span>
                </td>
                <td style={{padding:"12px 18px"}}>
                  <div style={{display:"flex",gap:3}}>
                    {[Eye,Edit3,u.status==="active"?Lock:Unlock].map((Icon,i)=>(
                      <div key={i} style={{width:28,height:28,borderRadius:6,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.07)";e.currentTarget.style.color=T.text;}}
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APK MANAGER
// ═══════════════════════════════════════════════════════
function APKManager() {
  const [vers] = useState([
    {v:"2.4.1",status:"production",date:"15 May 2025",size:"18.4 MB",notes:"Fix sincronización offline"},
    {v:"2.4.0",status:"beta",date:"01 May 2025",size:"18.1 MB",notes:"Nueva UI encuestador"},
    {v:"2.3.5",status:"deprecated",date:"10 Abr 2025",size:"17.8 MB",notes:"Hotfix login"},
  ]);
  const [perms,setPerms]=useState(
    companies.map(c=>({...c,apkAccess:c.status==="active",version:"2.4.1"}))
  );

  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Gestión APK / App</div>
          <div style={{fontSize:13,color:T.textMuted}}>Control de versiones y acceso por empresa</div>
        </div>
        <Btn icon={Plus}>Subir nueva versión</Btn>
      </div>

      {/* Version control */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Versiones disponibles</div>
          {vers.map((v,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",
              borderBottom:i<vers.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{width:38,height:38,borderRadius:10,
                background:v.status==="production"?`${T.success}18`:v.status==="beta"?`${T.warning}18`:`${T.textMuted}18`,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Smartphone size={16} color={v.status==="production"?T.success:v.status==="beta"?T.warning:T.textMuted}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:700,color:T.text}}>v{v.v}</span>
                  <span style={{fontSize:9,fontWeight:700,
                    color:v.status==="production"?T.success:v.status==="beta"?T.warning:T.textMuted,
                    background:v.status==="production"?`${T.success}18`:v.status==="beta"?`${T.warning}18`:`${T.textMuted}18`,
                    padding:"1px 7px",borderRadius:20,textTransform:"uppercase"}}>
                    {v.status==="production"?"Producción":v.status==="beta"?"Beta":"Deprecada"}
                  </span>
                </div>
                <div style={{fontSize:11,color:T.textMuted}}>{v.notes} · {v.size} · {v.date}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <Btn v="ghost" icon={Download} sm>APK</Btn>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:6}}>Estadísticas de versión</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>Distribución actual por empresa</div>
          {[["v2.4.1 (Producción)",T.success,68],["v2.4.0 (Beta)",T.warning,22],["v2.3.5 (Legacy)",T.textMuted,10]].map(([l,c,p],i)=>(
            <div key={i} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,color:T.textSec}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:c}}>{p}%</span>
              </div>
              <div style={{height:4,background:`${T.border}`,borderRadius:4}}>
                <div style={{height:"100%",width:`${p}%`,background:c,borderRadius:4}}/>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Access per company */}
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>
          Control de acceso por empresa
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
            {["Empresa","Plan","Versión APK","Acceso app","Encuestadores activos",""].map((h,i)=>(
              <th key={i} style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:700,
                color:T.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {perms.map((c,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${T.border}`,transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${T.primary}06`}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px 14px",fontSize:13,fontWeight:600,color:T.text}}>{c.name}</td>
                <td style={{padding:"12px 14px"}}><Badge type={c.plan}/></td>
                <td style={{padding:"12px 14px"}}>
                  <select value={c.version} style={{background:T.elevated2,border:`1px solid ${T.border}`,
                    borderRadius:7,padding:"4px 8px",color:T.text,fontSize:12,fontFamily:"inherit",outline:"none"}}>
                    <option>2.4.1</option><option>2.4.0</option><option>2.3.5</option>
                  </select>
                </td>
                <td style={{padding:"12px 14px"}}>
                  <Toggle on={c.apkAccess} onClick={()=>setPerms(p=>p.map(x=>x.id===c.id?{...x,apkAccess:!x.apkAccess}:x))}/>
                </td>
                <td style={{padding:"12px 14px",fontSize:13,color:T.text}}>{c.users}</td>
                <td style={{padding:"12px 14px"}}>
                  <Btn v="ghost" icon={Key} sm>Token</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SUPPORT
// ═══════════════════════════════════════════════════════
function Support() {
  return (
    <div style={{padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:3}}>Soporte técnico</div>
          <div style={{fontSize:13,color:T.textMuted}}>{tickets.filter(t=>t.status==="open").length} tickets abiertos</div>
        </div>
        <Btn icon={Plus}>Nuevo ticket</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {tickets.map((tk,i)=>(
          <Card key={i} onClick={()=>{}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:40,height:40,borderRadius:11,flexShrink:0,
                background:tk.priority==="high"?`${T.danger}18`:tk.priority==="medium"?`${T.warning}18`:`${T.accent}18`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <AlertCircle size={17} color={tk.priority==="high"?T.danger:tk.priority==="medium"?T.warning:T.accent}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:14,fontWeight:700,color:T.text}}>{tk.subject}</span>
                  <Badge type={tk.priority}/>
                  <Badge type={tk.status}/>
                </div>
                <div style={{fontSize:12,color:T.textMuted}}>
                  {tk.id} · {tk.company} · {tk.created}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn v="ghost" sm icon={Eye}>Ver</Btn>
                {tk.status==="open"&&<Btn sm icon={CheckCircle}>Resolver</Btn>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SYSTEM
// ═══════════════════════════════════════════════════════
function SystemPage() {
  const metrics = [
    {label:"CPU",value:23,color:T.success,icon:Cpu},
    {label:"RAM",value:61,color:T.warning,icon:HardDrive},
    {label:"Disco",value:44,color:T.accent,icon:Database},
    {label:"Red",value:12,color:T.primary,icon:Globe},
  ];
  return (
    <div style={{padding:28}}>
      <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>Estado del sistema</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:24}}>Monitoreo en tiempo real</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {metrics.map((m,i)=>(
          <Card key={i}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <m.icon size={16} color={m.color}/>
              <span style={{fontSize:13,color:T.textSec}}>{m.label}</span>
            </div>
            <div style={{fontSize:28,fontWeight:900,color:m.color,marginBottom:8}}>{m.value}%</div>
            <div style={{height:4,background:T.border,borderRadius:4}}>
              <div style={{height:"100%",width:`${m.value}%`,background:m.color,borderRadius:4}}/>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <Terminal size={15} color={T.primary}/>
          <span style={{fontSize:14,fontWeight:700,color:T.text}}>Logs del sistema</span>
          <span style={{fontSize:10,color:T.success,background:`${T.success}18`,
            padding:"2px 8px",borderRadius:20,marginLeft:"auto",fontWeight:700}}>LIVE</span>
        </div>
        {["[INFO] Respuesta RC-247 sincronizada — Alimentos del Sur",
          "[INFO] Token renovado — usuario ana@retailcorp.cl",
          "[WARN] Latencia alta detectada en endpoint /v1/respuestas",
          "[INFO] Backup automático completado — 58,948 registros",
          "[INFO] Deploy v2.4.1 aplicado — 4 empresas actualizadas",
        ].map((log,i)=>(
          <div key={i} style={{padding:"7px 12px",borderRadius:8,marginBottom:5,
            background:log.includes("WARN")?`${T.warning}0A`:`${T.primary}06`,
            border:`1px solid ${log.includes("WARN")?T.warning+"20":T.border}`}}>
            <span style={{fontSize:11,fontFamily:"monospace",
              color:log.includes("WARN")?T.warning:T.textSec}}>{log}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GENERIC PLACEHOLDER
// ═══════════════════════════════════════════════════════
function Placeholder({title,icon:I}) {
  return (
    <div style={{padding:28}}>
      <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:24}}>{title}</div>
      <Card s={{textAlign:"center",padding:52}}>
        <I size={32} color={T.textMuted} style={{marginBottom:10}}/>
        <div style={{fontSize:14,color:T.textMuted}}>Módulo {title} — disponible en la versión completa</div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════
const TITLES = {
  dashboard:"Dashboard Global",companies:"Empresas",users:"Usuarios",
  surveys:"Encuestas",apk:"APK / App",support:"Soporte",
  billing:"Facturación",security:"Seguridad",system:"Sistema",settings:"Configuración",
};
const PAGES = {
  dashboard:<Dashboard/>,companies:<Companies/>,users:<UsersPage/>,
  apk:<APKManager/>,support:<Support/>,system:<SystemPage/>,
  surveys:<Placeholder title="Encuestas" icon={FileText}/>,
  billing:<Placeholder title="Facturación" icon={CreditCard}/>,
  security:<Placeholder title="Seguridad" icon={Shield}/>,
  settings:<Placeholder title="Configuración" icon={Settings}/>,
};

export default function SuperAdmin() {
  const [page,setPage]=useState("dashboard");
  const [col,setCol]=useState(false);
  return (
    <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      background:T.bg,minHeight:"100vh",color:T.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.09);border-radius:3px}
        input,select,button{font-family:inherit}
      `}</style>
      <Sidebar page={page} setPage={setPage} col={col} setCol={setCol}/>
      <div style={{marginLeft:col?68:240,minHeight:"100vh",
        transition:"margin-left .25s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column"}}>
        <TopBar title={TITLES[page]}/>
        <div style={{flex:1,overflowY:"auto"}}>{PAGES[page]}</div>
      </div>
    </div>
  );
}
