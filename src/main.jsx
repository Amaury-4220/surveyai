import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Session, bunkerCall } from "./bunker.js";

const LoginEmpresa    = React.lazy(() => import("./LoginSurveyAI.jsx"));
const Layer2Mandante  = React.lazy(() => import("./App.jsx"));
const Layer3Encuestador = React.lazy(() => import("./EncuestadorApp.jsx"));
const Layer5SuperAdmin  = React.lazy(() => import("./SuperAdmin.jsx"));
const Layer6Landing     = React.lazy(() => import("./Layer6_Landing.jsx"));

const path = window.location.pathname;

function Loading() {
  return (
    <div style={{minHeight:"100vh",background:"#04080F",display:"flex",
      alignItems:"center",justifyContent:"center"}}>
      <div style={{width:36,height:36,border:"2px solid #06B6D4",
        borderTopColor:"transparent",borderRadius:"50%",
        animation:"spin 1s linear infinite"}}/>
      <style>{"@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

// Login ligero para encuestador — sin logo pesado
function LoginEncuestador({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const doLogin = async () => {
    if (!email || !pass) { setErr("Completa todos los campos"); return; }
    setLoading(true); setErr("");
    try {
      const data = await bunkerCall("login", { email, password: pass });
      if (!data) return;
      try { localStorage.setItem("sai_session", data.sessionToken);
            localStorage.setItem("sai_role", data.role); } catch {}
      onSuccess(data);
    } catch(e) {
      setErr(e.message === "limite_excedido"
        ? "Demasiados intentos. Espera 1 minuto."
        : "Credenciales incorrectas");
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#04080F",display:"flex",
      flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:24,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <style>{"*{box-sizing:border-box;margin:0;padding:0}input,button{font-family:inherit}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}"}</style>

      <div style={{width:56,height:56,borderRadius:16,
        background:"linear-gradient(135deg,#06B6D4,#7C3AED)",
        display:"flex",alignItems:"center",justifyContent:"center",
        marginBottom:16,fontSize:24}}>📋</div>

      <div style={{fontSize:22,fontWeight:800,color:"#F1F5F9",marginBottom:4}}>
        SurveyAI
      </div>
      <div style={{fontSize:12,color:"#3D5070",marginBottom:32,
        textTransform:"uppercase",letterSpacing:".1em"}}>
        Portal Encuestadores
      </div>

      <div style={{width:"100%",maxWidth:360,background:"#090F1E",
        borderRadius:18,padding:24,border:"1px solid rgba(6,182,212,0.1)"}}>

        {err && <div style={{background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",
          borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,
          color:"#EF4444"}}>{err}</div>}

        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3D5070",
            textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>
            Email
          </div>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==="Enter" && doLogin()}
            placeholder="tu@empresa.cl"
            autoComplete="email"
            style={{width:"100%",background:"#0C1526",
              border:"1.5px solid rgba(6,182,212,0.15)",
              borderRadius:11,padding:"12px 14px",color:"#F1F5F9",
              fontSize:16,outline:"none",boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3D5070",
            textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>
            Contraseña
          </div>
          <input type="password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key==="Enter" && doLogin()}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{width:"100%",background:"#0C1526",
              border:"1.5px solid rgba(6,182,212,0.15)",
              borderRadius:11,padding:"12px 14px",color:"#F1F5F9",
              fontSize:16,outline:"none",boxSizing:"border-box"}}/>
        </div>

        <button onClick={doLogin} disabled={loading}
          style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
            background:loading?"#0C1526":"linear-gradient(135deg,#06B6D4,#7C3AED)",
            color:loading?"#3D5070":"#fff",fontSize:16,fontWeight:700,
            cursor:loading?"not-allowed":"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:loading?"none":"0 4px 20px rgba(6,182,212,0.35)"}}>
          {loading
            ? <><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>↻</span> Verificando...</>
            : "Ingresar →"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = Session.get();
    if (s?.isTrialExpired) { Session.block(); Session.clear(); }
    else setSession(s);
    setReady(true);
  }, []);

  if (!ready) return <Loading/>;

  if (path.startsWith("/waitlist")) return (
    <React.Suspense fallback={<Loading/>}>
      <Layer6Landing producto={null}/>
    </React.Suspense>
  );

  if (path.startsWith("/superadmin")) {
    if (!session) return (
      <React.Suspense fallback={<Loading/>}>
        <LoginEmpresa onSuccess={s=>setSession(s)}/>
      </React.Suspense>
    );
    return <React.Suspense fallback={<Loading/>}>
      <Layer5SuperAdmin session={session} onLogout={()=>{Session.clear();setSession(null);}}/>
    </React.Suspense>;
  }

  if (path.startsWith("/encuestador")) {
    // Encuestador uses lightweight login
    if (!session || session.role === "mandante") {
      return <LoginEncuestador onSuccess={s=>{setSession(s);}}/>;
    }
    return <React.Suspense fallback={<Loading/>}>
      <Layer3Encuestador session={session} onLogout={()=>{Session.clear();setSession(null);}}/>
    </React.Suspense>;
  }

  // Panel mandante
  if (!session) return (
    <React.Suspense fallback={<Loading/>}>
      <LoginEmpresa onSuccess={s=>setSession(s)}/>
    </React.Suspense>
  );

  return <React.Suspense fallback={<Loading/>}>
    <Layer2Mandante session={session} onLogout={()=>{Session.clear();setSession(null);}}/>
  </React.Suspense>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App/></React.StrictMode>
);
