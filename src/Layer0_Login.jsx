// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 0: LOGIN PÚBLICO                           ║
// ║  Única página visible. Código protegido.                    ║
// ║  © SurveyAI 2025 — Todos los derechos reservados           ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Shield, Zap, BarChart3, RefreshCw, Lock, Mail, AlertCircle, Check, X, Clock } from "lucide-react";

// Logo reemplazado por componente SVG SurveyAILogo

// ─── Design System ────────────────────────────────────────────
const T = {
  bg: "#04080F",
  card: "#080E1C",
  elevated: "#0D1425",
  border: "rgba(6,182,212,0.1)",
  borderGlow: "rgba(6,182,212,0.4)",
  cyan: "#06B6D4",
  violet: "#7C3AED",
  green: "#10B981",
  red: "#EF4444",
  yellow: "#F59E0B",
  text: "#F1F5F9",
  textSec: "#94A3B8",
  textMuted: "#2D4A6B",
  grad: "linear-gradient(135deg,#06B6D4,#7C3AED)",
};

// ─── Token Generator (Bunker Protocol) ───────────────────────
const genToken = () => `${Date.now().toString(36)}.${Math.random().toString(36).slice(2,10)}`;

// ─── Particle Background ──────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({length:60}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(6,182,212,${p.a})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if(p.x<0||p.x>canvas.width) p.dx*=-1;
        if(p.y<0||p.y>canvas.height) p.dy*=-1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    window.addEventListener("resize",resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}

// ─── Trial Clock Component ────────────────────────────────────
function TrialClock({ expiresAt }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) { setRemaining("EXPIRADO"); return; }
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      setRemaining(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  },[expiresAt]);
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",
      borderRadius:20,background:`${T.yellow}18`,border:`1px solid ${T.yellow}40`}}>
      <Clock size={11} color={T.yellow}/>
      <span style={{fontSize:11,fontWeight:800,color:T.yellow,fontFamily:"monospace",letterSpacing:".05em"}}>
        TRIAL {remaining}
      </span>
    </div>
  );
}

// ─── Logo SurveyAI SVG (reemplaza imagen rasterizada) ────────────
function SurveyAILogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
      style={{filter:"drop-shadow(0 0 20px rgba(6,182,212,0.4))",display:"block",marginBottom:8}}>
      <defs>
        <radialGradient id="sai-bg" cx="42%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#182848"/><stop offset="55%" stopColor="#0A1628"/><stop offset="100%" stopColor="#040810"/>
        </radialGradient>
        <radialGradient id="sai-sh" cx="38%" cy="28%" r="48%">
          <stop offset="0%" stopColor="#60C8E8" stopOpacity="0.5"/><stop offset="100%" stopColor="#3080B8" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="sai-ringa" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7090B0"/><stop offset="20%" stopColor="#C8DCEE"/><stop offset="45%" stopColor="#E8F0F8"/><stop offset="70%" stopColor="#8AAAC8"/><stop offset="100%" stopColor="#506880"/>
        </linearGradient>
        <linearGradient id="sai-ringb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06C8E8" stopOpacity="0.9"/><stop offset="100%" stopColor="#7C3AED" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="sai-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C87820"/><stop offset="100%" stopColor="#FFE87A"/>
        </linearGradient>
        <linearGradient id="sai-bar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C8DCEE"/><stop offset="100%" stopColor="#4A6888"/>
        </linearGradient>
        <linearGradient id="sai-mag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D0E0F0"/><stop offset="100%" stopColor="#506880"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="url(#sai-ringb)" strokeWidth="2" opacity="0.8"/>
      <circle cx="60" cy="60" r="54" fill="none" stroke="url(#sai-ringa)" strokeWidth="4"/>
      <circle cx="60" cy="60" r="49" fill="none" stroke="#6A8AAA" strokeWidth="0.8" opacity="0.5"/>
      <circle cx="60" cy="60" r="47" fill="url(#sai-bg)"/><circle cx="60" cy="60" r="47" fill="url(#sai-sh)"/>
      <circle cx="38" cy="52" r="1" fill="#2A4468" opacity="0.6"/><circle cx="50" cy="45" r="1" fill="#2A4468" opacity="0.6"/>
      <circle cx="62" cy="46" r="1" fill="#2A4468" opacity="0.6"/><circle cx="74" cy="48" r="1" fill="#2A4468" opacity="0.5"/>
      <rect x="28" y="68" width="8" height="12" rx="1" fill="url(#sai-bar)" opacity="0.6"/>
      <rect x="28" y="68" width="2" height="12" rx="1" fill="white" opacity="0.2"/>
      <rect x="39" y="60" width="8" height="20" rx="1" fill="url(#sai-bar)" opacity="0.75"/>
      <rect x="39" y="60" width="2" height="20" rx="1" fill="white" opacity="0.2"/>
      <rect x="50" y="50" width="8" height="30" rx="1" fill="url(#sai-bar)" opacity="0.88"/>
      <rect x="50" y="50" width="2" height="30" rx="1" fill="white" opacity="0.2"/>
      <rect x="61" y="42" width="8" height="38" rx="1" fill="url(#sai-bar)"/>
      <rect x="61" y="42" width="2" height="38" rx="1" fill="white" opacity="0.2"/>
      <polyline points="26,72 38,58 52,46 72,28" stroke="url(#sai-arrow)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="60,26 72,26 72,38" stroke="url(#sai-arrow)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="72" cy="26" r="3.5" fill="#FFE87A" opacity="0.9"/>
      <circle cx="72" cy="26" r="6" fill="#FFE87A" opacity="0.2"/>
      <circle cx="70" cy="74" r="12" fill="none" stroke="url(#sai-mag)" strokeWidth="3.5"/>
      <circle cx="70" cy="74" r="8.5" fill="#0A1628" opacity="0.7"/>
      <circle cx="70" cy="74" r="8.5" fill="url(#sai-sh)" opacity="0.3"/>
      <line x1="79" y1="83" x2="88" y2="92" stroke="url(#sai-mag)" strokeWidth="4.5" strokeLinecap="round"/>
      <ellipse cx="66" cy="71" rx="3.5" ry="2" fill="white" opacity="0.15" transform="rotate(-30 66 71)"/>
      <ellipse cx="48" cy="38" rx="16" ry="6" fill="white" opacity="0.06" transform="rotate(-25 48 38)"/>
    </svg>
  );
}

// ─── Main Login Component ─────────────────────────────────────────
export default function Layer0Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("login"); // login | trial | blocked
  const [trialExpiry, setTrialExpiry] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check device fingerprint
    const fp = localStorage.getItem("sai_device_fp");
    const blocked = localStorage.getItem("sai_device_blocked");
    if (blocked === "true") setStep("blocked");
    // Check trial
    const trial = localStorage.getItem("sai_trial_expiry");
    if (trial) {
      const exp = parseInt(trial);
      if (Date.now() < exp) setTrialExpiry(exp);
      else { localStorage.setItem("sai_device_blocked","true"); setStep("blocked"); }
    }
  }, []);

  const doLogin = async () => {
    if (!email || !pass) { setError("Completa todos los campos"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Email inválido"); return; }
    setLoading(true); setError("");
    try {
      const token = genToken();
      const res = await fetch("/.netlify/functions/agente_fantasma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "login", token, datos: { email, password: pass } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de autenticación");
      // Set device fingerprint
      if (!localStorage.getItem("sai_device_fp")) {
        const fp = `${Date.now().toString(36)}-${navigator.userAgent.length}`;
        localStorage.setItem("sai_device_fp", fp);
      }
      // Handle trial
      if (data.isTrial) {
        const expiry = Date.now() + 72 * 60 * 60 * 1000;
        localStorage.setItem("sai_trial_expiry", expiry.toString());
        setTrialExpiry(expiry);
      }
      localStorage.setItem("sai_session", data.sessionToken);
      localStorage.setItem("sai_role", data.role);
      onSuccess({ ...data, trialExpiry: data.isTrial ? Date.now() + 72*3600000 : null });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "blocked") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",
      justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');"}</style>
      <Particles/>
      <div style={{textAlign:"center",maxWidth:400,position:"relative",zIndex:1}}>
        <div style={{width:72,height:72,borderRadius:20,background:`${T.red}18`,border:`1px solid ${T.red}40`,
          display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
          <Lock size={28} color={T.red}/>
        </div>
        <div style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:8}}>Acceso bloqueado</div>
        <div style={{fontSize:14,color:T.textSec,lineHeight:1.7,marginBottom:20}}>
          Este dispositivo ha sido registrado y bloqueado por razones de seguridad.<br/>
          Contacta al administrador para más información.
        </div>
        <div style={{fontSize:11,color:T.textMuted,fontFamily:"monospace",
          padding:"8px 14px",background:T.elevated,borderRadius:10,border:`1px solid ${T.border}`}}>
          © SurveyAI 2025 — Acceso único por dispositivo
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",fontFamily:"'DM Sans',sans-serif",
      position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,button{font-family:inherit}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes scanline{0%{top:-10%}100%{top:110%}}
      `}</style>
      <Particles/>

      {/* Left panel — branding */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",
        padding:"60px 80px",position:"relative",zIndex:1,
        borderRight:`1px solid ${T.border}`}}>
        {/* Glow effects */}
        <div style={{position:"absolute",top:"20%",left:"10%",width:300,height:300,
          background:"rgba(6,182,212,0.06)",borderRadius:"50%",filter:"blur(80px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"20%",right:"10%",width:200,height:200,
          background:"rgba(124,58,237,0.08)",borderRadius:"50%",filter:"blur(60px)",pointerEvents:"none"}}/>

        <div style={{animation:"fadeUp .8s ease-out"}}>
          <SurveyAILogo size={140}/>

          <div style={{fontSize:42,fontWeight:900,color:T.text,lineHeight:1.1,marginBottom:12,
            letterSpacing:"-.03em"}}>
            Survey<span style={{background:T.grad,WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent"}}>AI</span>
          </div>
          <div style={{fontSize:13,color:T.cyan,letterSpacing:".18em",fontWeight:600,
            textTransform:"uppercase",marginBottom:40}}>
            Encuesta · Analiza · Crea el Futuro
          </div>

          {/* Feature pills */}
          {[
            [Zap,"Investigación en tiempo real"],
            [BarChart3,"Análisis con IA multi-agente"],
            [Shield,"Protocolo Búnker de seguridad"],
          ].map(([Icon,label],i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,
              animation:`fadeUp ${.8+i*.15}s ease-out`}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${T.cyan}15`,
                border:`1px solid ${T.cyan}25`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon size={14} color={T.cyan}/>
              </div>
              <span style={{fontSize:13,color:T.textSec}}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:"auto",fontSize:10,color:T.textMuted,letterSpacing:".06em"}}>
          © 2025 SurveyAI — Todos los derechos reservados
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{width:460,display:"flex",alignItems:"center",justifyContent:"center",
        padding:48,position:"relative",zIndex:1}}>
        <div style={{width:"100%",animation:"fadeUp .6s ease-out"}}>
          {/* Header */}
          <div style={{marginBottom:32}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:24,fontWeight:800,color:T.text}}>Iniciar sesión</div>
              {trialExpiry && <TrialClock expiresAt={trialExpiry}/>}
            </div>
            <div style={{fontSize:13,color:T.textMuted}}>
              Acceso protegido · Dispositivo verificado
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{background:`${T.red}12`,border:`1px solid ${T.red}30`,borderRadius:12,
              padding:"11px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:8,
              fontSize:13,color:T.red}}>
              <AlertCircle size={14}/>{error}
            </div>
          )}

          {/* Email */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
              letterSpacing:".08em",marginBottom:6}}>Email corporativo</div>
            <div style={{position:"relative"}}>
              <Mail size={14} style={{position:"absolute",left:13,top:"50%",
                transform:"translateY(-50%)",color:T.textMuted,pointerEvents:"none"}}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="tu@empresa.cl"
                onKeyDown={e=>e.key==="Enter"&&doLogin()}
                style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,
                  borderRadius:12,padding:"12px 14px 12px 40px",color:T.text,fontSize:14,
                  outline:"none",transition:"border .2s,box-shadow .2s",boxSizing:"border-box"}}
                onFocus={e=>{e.currentTarget.style.borderColor=T.borderGlow;
                  e.currentTarget.style.boxShadow=`0 0 0 3px ${T.cyan}15`;}}
                onBlur={e=>{e.currentTarget.style.borderColor=T.border;
                  e.currentTarget.style.boxShadow="none";}}/>
            </div>
          </div>

          {/* Password */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",
              letterSpacing:".08em",marginBottom:6}}>Contraseña</div>
            <div style={{position:"relative"}}>
              <Lock size={14} style={{position:"absolute",left:13,top:"50%",
                transform:"translateY(-50%)",color:T.textMuted,pointerEvents:"none"}}/>
              <input type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&doLogin()}
                style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,
                  borderRadius:12,padding:"12px 44px 12px 40px",color:T.text,fontSize:14,
                  outline:"none",transition:"border .2s,box-shadow .2s",boxSizing:"border-box"}}
                onFocus={e=>{e.currentTarget.style.borderColor=T.borderGlow;
                  e.currentTarget.style.boxShadow=`0 0 0 3px ${T.cyan}15`;}}
                onBlur={e=>{e.currentTarget.style.borderColor=T.border;
                  e.currentTarget.style.boxShadow="none";}}/>
              <div onClick={()=>setShowPass(v=>!v)}
                style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",
                  cursor:"pointer",color:T.textMuted}}>
                {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button onClick={doLogin} disabled={loading}
            style={{width:"100%",padding:"14px",borderRadius:13,border:"none",
              background:loading?T.elevated:T.grad,
              color:loading?T.textMuted:"#fff",fontSize:15,fontWeight:700,
              cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              transition:"all .2s",
              boxShadow:loading?"none":"0 4px 24px rgba(6,182,212,0.35)"}}>
            {loading
              ?<><RefreshCw size={15} style={{animation:"spin 1s linear infinite"}}/>Verificando...</>
              :<>Acceder al panel <ArrowRight size={15}/></>}
          </button>

          {/* Security badges */}
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:24}}>
            {["Búnker activo","Token 90s","Dispositivo único"].map(l=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:4,
                fontSize:10,color:T.textMuted}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>
                {l}
              </div>
            ))}
          </div>

          {/* Demo hint */}
          <div style={{marginTop:18,padding:"10px 14px",background:`${T.cyan}06`,
            borderRadius:10,border:`1px solid ${T.cyan}15`,textAlign:"center"}}>
            <div style={{fontSize:10,color:T.textMuted,marginBottom:3}}>Acceso demo</div>
            <div style={{fontSize:11,color:T.textSec,fontFamily:"monospace"}}>
              admin@surveyai.cl · Admin123!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
