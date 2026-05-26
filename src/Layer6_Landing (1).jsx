// ╔══════════════════════════════════════════════════════════════╗
// ║  SURVEYAI — CAPA 6: LANDING LISTA DE ESPERA                 ║
// ║  Tesla · Superhuman · Notion · Robinhood logic              ║
// ║  © SurveyAI 2025 — Todos los derechos reservados           ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Check, Users, Clock, Zap, Shield, Star,
  ChevronDown, Mail, Sparkles, TrendingUp, Lock, RefreshCw
} from "lucide-react";

// ─── Design System ────────────────────────────────────────────
const T = {
  bg:"#03060D", card:"#07101F", elevated:"#0B1829",
  border:"rgba(6,182,212,0.1)", cyan:"#06B6D4", violet:"#7C3AED",
  green:"#10B981", yellow:"#F59E0B",
  text:"#F1F5F9", textSec:"#94A3B8", textMuted:"#1E3A5F",
  grad:"linear-gradient(135deg,#06B6D4,#7C3AED)",
};

// ─── Contador animado ──────────────────────────────────────────
function Counter({ end, duration=2000, suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(()=>{
    if (ref.current) return;
    ref.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed/duration, 1);
      const eased = 1 - Math.pow(1-pct, 3);
      setVal(Math.round(eased*end));
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[end,duration]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

// ─── Waitlist Clock ───────────────────────────────────────────
function LaunchClock({ targetDate }) {
  const [time, setTime] = useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{
    const tick = () => {
      const diff = targetDate - Date.now();
      if (diff<=0) return;
      setTime({
        d:Math.floor(diff/86400000),
        h:Math.floor((diff%86400000)/3600000),
        m:Math.floor((diff%3600000)/60000),
        s:Math.floor((diff%60000)/1000),
      });
    };
    tick();
    const iv = setInterval(tick,1000);
    return ()=>clearInterval(iv);
  },[targetDate]);

  return (
    <div style={{display:"flex",gap:10,justifyContent:"center"}}>
      {[["Días",time.d],["Horas",time.h],["Min",time.m],["Seg",time.s]].map(([l,v])=>(
        <div key={l} style={{textAlign:"center",minWidth:58}}>
          <div style={{fontSize:32,fontWeight:900,color:T.cyan,fontFamily:"monospace",
            background:T.card,borderRadius:12,padding:"10px 8px",
            border:`1px solid ${T.border}`,marginBottom:4}}>
            {String(v).padStart(2,"0")}
          </div>
          <div style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",
            letterSpacing:".06em"}}>{l}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LANDING LISTA DE ESPERA
// ═══════════════════════════════════════════════════════════════
export default function Layer6Landing({ producto }) {
  const [email, setEmail] = useState("");
  const [deposito, setDeposito] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posicion, setPosicion] = useState(null);
  const [totalEspera] = useState(Math.floor(800 + Math.random()*400));

  // Producto por defecto (puede venir de la IA)
  const p = producto || {
    nombre_producto: "AlimentoUnix Pro",
    tagline: "El primer alimento premium que comparten perros y gatos",
    propuesta_valor: "Termina con la complicación de comprar dos sacos diferentes. Una fórmula única, balanceada por veterinarios, que satisface las necesidades nutricionales específicas de perros y gatos.",
    precio_sugerido: "$29.990 CLP/mes",
    caracteristicas: [
      "Fórmula balanceada para perros y gatos",
      "Certificado por Asociación de Médicos Veterinarios",
      "Envío a domicilio mensual",
      "Primer mes gratis para los primeros 500",
    ],
    urgencia: `Solo quedan ${347} lugares en la primera edición`,
    cta: "Asegurar mi lugar ahora",
    colores: { primario:"#06B6D4", secundario:"#7C3AED" },
  };

  const launchDate = new Date(Date.now() + 45*24*3600000);

  const handleSubmit = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      setSubmitted(true);
      setPosicion(totalEspera + Math.floor(Math.random()*50) + 1);
    }, 1500);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',sans-serif",
      color:T.text,overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,button{font-family:inherit}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>

      {/* Barra urgencia top */}
      <div style={{background:`linear-gradient(90deg,${p.colores?.primario||T.cyan},${p.colores?.secundario||T.violet})`,
        padding:"8px 20px",textAlign:"center",fontSize:12,fontWeight:700,color:"#fff"}}>
        🔥 {p.urgencia} — El acceso se cierra en:&nbsp;
        <span style={{fontFamily:"monospace",fontWeight:900}}>
          {String(Math.floor(Math.random()*24)).padStart(2,"0")}:
          {String(Math.floor(Math.random()*60)).padStart(2,"0")}:
          {String(Math.floor(Math.random()*60)).padStart(2,"0")}
        </span>
      </div>

      {/* Hero */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"60px 24px 40px",
        textAlign:"center",animation:"fadeUp .8s ease-out"}}>

        {/* Social proof */}
        <div style={{display:"inline-flex",alignItems:"center",gap:8,
          background:`${T.cyan}10`,border:`1px solid ${T.cyan}25`,
          borderRadius:20,padding:"5px 14px",marginBottom:32,fontSize:12,
          color:T.textSec}}>
          <div style={{display:"flex"}}>
            {["#06B6D4","#7C3AED","#10B981"].map((c,i)=>(
              <div key={i} style={{width:22,height:22,borderRadius:"50%",background:c,
                marginLeft:i>0?-6:0,border:"2px solid #03060D"}}/>
            ))}
          </div>
          <span><Counter end={totalEspera}/> personas ya en lista de espera</span>
        </div>

        <h1 style={{fontSize:"clamp(28px,6vw,52px)",fontWeight:900,lineHeight:1.1,
          marginBottom:16,letterSpacing:"-.03em"}}>
          {p.nombre_producto}
        </h1>

        <div style={{fontSize:"clamp(16px,3vw,20px)",fontWeight:700,
          background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          marginBottom:20}}>
          {p.tagline}
        </div>

        <p style={{fontSize:15,color:T.textSec,lineHeight:1.8,
          maxWidth:520,margin:"0 auto 40px"}}>
          {p.propuesta_valor}
        </p>

        {/* Countdown */}
        <div style={{marginBottom:40}}>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:12,
            textTransform:"uppercase",letterSpacing:".08em"}}>
            Lanzamiento oficial en
          </div>
          <LaunchClock targetDate={launchDate}/>
        </div>

        {/* CTA Form */}
        {!submitted ? (
          <div style={{background:T.card,borderRadius:20,padding:28,
            border:`1px solid ${T.border}`,maxWidth:480,margin:"0 auto",
            boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
            <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:6}}>
              Asegura tu lugar ahora
            </div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:20}}>
              Precio de lanzamiento: <strong style={{color:T.cyan}}>{p.precio_sugerido}</strong> —
              Solo para los primeros 500
            </div>

            <div style={{position:"relative",marginBottom:12}}>
              <Mail size={14} style={{position:"absolute",left:13,top:"50%",
                transform:"translateY(-50%)",color:T.textMuted,pointerEvents:"none"}}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="tu@email.com"
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                style={{width:"100%",background:T.elevated,border:`1.5px solid ${T.border}`,
                  borderRadius:11,padding:"12px 14px 12px 38px",color:T.text,fontSize:14,
                  outline:"none",boxSizing:"border-box",transition:"border .2s"}}
                onFocus={e=>e.currentTarget.style.borderColor=T.cyan}
                onBlur={e=>e.currentTarget.style.borderColor=T.border}/>
            </div>

            {/* Depósito opcional */}
            <label onClick={()=>setDeposito(v=>!v)}
              style={{display:"flex",alignItems:"flex-start",gap:10,
                marginBottom:16,cursor:"pointer"}}>
              <div style={{width:18,height:18,borderRadius:5,flexShrink:0,marginTop:1,
                border:`1.5px solid ${deposito?T.cyan:T.border}`,
                background:deposito?T.cyan:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .2s"}}>
                {deposito&&<Check size={11} color="#fff"/>}
              </div>
              <span style={{fontSize:12,color:T.textSec,lineHeight:1.5}}>
                <strong style={{color:T.text}}>Depósito reembolsable de $5.000 CLP</strong> —
                Asegura tu lugar en los primeros 50 y obtén <strong style={{color:T.cyan}}>3 meses gratis</strong>
              </span>
            </label>

            <button onClick={handleSubmit} disabled={!email||loading}
              style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
                background:(!email||loading)?T.elevated:T.grad,
                color:(!email||loading)?T.textMuted:"#fff",fontSize:15,fontWeight:800,
                cursor:(!email||loading)?"not-allowed":"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                transition:"all .2s",
                boxShadow:(!email||loading)?"none":"0 4px 24px rgba(6,182,212,0.4)"}}>
              {loading
                ?<><RefreshCw size={15} style={{animation:"spin 1s linear infinite"}}/>Registrando...</>
                :<>{p.cta} <ArrowRight size={15}/></>}
            </button>

            <div style={{fontSize:10,color:T.textMuted,marginTop:10,textAlign:"center"}}>
              🔒 Sin spam · Puedes cancelar cuando quieras · Depósito 100% reembolsable
            </div>
          </div>
        ) : (
          <div style={{background:T.card,borderRadius:20,padding:36,
            border:`1px solid ${T.green}40`,maxWidth:480,margin:"0 auto",
            textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>🎉</div>
            <div style={{fontSize:20,fontWeight:900,color:T.green,marginBottom:8}}>
              ¡Estás en la lista!
            </div>
            <div style={{fontSize:14,color:T.textSec,marginBottom:16}}>
              Tu posición actual:
            </div>
            <div style={{fontSize:52,fontWeight:900,color:T.cyan,
              fontFamily:"monospace",marginBottom:4}}>
              #{posicion?.toLocaleString()}
            </div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:20}}>
              de {(totalEspera+100).toLocaleString()} personas en lista
            </div>
            {deposito&&(
              <div style={{padding:"10px 16px",background:`${T.green}10`,
                borderRadius:10,border:`1px solid ${T.green}25`,
                fontSize:12,color:T.green,marginBottom:16}}>
                ✓ Depósito registrado — Estás entre los primeros 50
              </div>
            )}
            <div style={{fontSize:11,color:T.textMuted}}>
              Te notificaremos en {email} cuando estés cerca de tu turno
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 24px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
          {p.caracteristicas?.map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,
              padding:"14px 16px",background:T.card,borderRadius:12,
              border:`1px solid ${T.border}`}}>
              <div style={{width:22,height:22,borderRadius:6,flexShrink:0,
                background:`${T.cyan}15`,display:"flex",alignItems:"center",
                justifyContent:"center"}}>
                <Check size={12} color={T.cyan}/>
              </div>
              <span style={{fontSize:12,color:T.textSec,lineHeight:1.5}}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${T.border}`,padding:"20px 24px",
        textAlign:"center",fontSize:10,color:T.textMuted}}>
        © 2025 SurveyAI — Todos los derechos reservados · Powered by SurveyAI Enterprise
      </div>
    </div>
  );
}
