import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Layer0Login from "./Layer0_Login.jsx";
import { Session } from "./Layer1_Bunker.js";

const Layer2Mandante    = React.lazy(() => import("./App.jsx"));
const Layer3Encuestador = React.lazy(() => import("./EncuestadorApp.jsx"));
const Layer5SuperAdmin  = React.lazy(() => import("./SuperAdmin.jsx"));
const Layer6Landing     = React.lazy(() => import("./Layer6_Landing.jsx"));

const path = window.location.pathname;

function LoadingScreen() {
  return (
    <div style={{minHeight:"100vh",background:"#04080F",display:"flex",
      alignItems:"center",justifyContent:"center"}}>
      <div style={{width:38,height:38,border:"2px solid #06B6D4",
        borderTopColor:"transparent",borderRadius:"50%",
        animation:"spin 1s linear infinite"}}/>
      <style>{"@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}"}</style>
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

  if (!ready) return <LoadingScreen/>;

  if (path.startsWith("/waitlist")) return (
    <React.Suspense fallback={<LoadingScreen/>}>
      <Layer6Landing producto={null}/>
    </React.Suspense>
  );

  if (path.startsWith("/superadmin")) {
    if (!session) return <Layer0Login onSuccess={s=>setSession(s)}/>;
    return <React.Suspense fallback={<LoadingScreen/>}>
      <Layer5SuperAdmin session={session} onLogout={()=>{Session.clear();setSession(null);}}/>
    </React.Suspense>;
  }

  if (path.startsWith("/encuestador")) {
    if (!session) return <Layer0Login onSuccess={s=>setSession(s)}/>;
    return <React.Suspense fallback={<LoadingScreen/>}>
      <Layer3Encuestador session={session} onLogout={()=>{Session.clear();setSession(null);}}/>
    </React.Suspense>;
  }

  if (!session) return <Layer0Login onSuccess={s=>setSession(s)}/>;

  return <React.Suspense fallback={<LoadingScreen/>}>
    <Layer2Mandante session={session} onLogout={()=>{Session.clear();setSession(null);}}/>
  </React.Suspense>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App/></React.StrictMode>
);
