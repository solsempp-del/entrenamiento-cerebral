import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import {
  getMenteesFromDB,
  saveMenteeToDB,
  saveWeeksToDB,
  getWeeksFromDB,
  getActiveWeekFromDB,
  saveActiveWeekToDB,
  getResponsesFromDB,
  saveResponseToDB
} from "./firestoreHelpers";

const NAVY = "#0f243e";
const CORAL = "#dd6d60";
const BEIGE = "#d6c7b1";
const DARK = "#333333";

const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const EX_TYPES = {
  respiracion:{ label:"Respiración", icon:"🌬️" },
  reflexion:  { label:"Reflexión escrita", icon:"✍️" },
  emocion:    { label:"Registro emocional", icon:"🧠" },
  conductual: { label:"Tarea conductual", icon:"🎯" },
  habito:     { label:"Seguimiento de hábito", icon:"📌" },
  energia:    { label:"Nivel de energía", icon:"⚡" },
  libre:      { label:"Espacio libre", icon:"💬" },
  checklist:  { label:"Checklist", icon:"✅" },
  lectura:    { label:"Lectura de hoy", icon:"📖" },
  video:      { label:"Video de hoy", icon:"🎥" },
  mindfulness:{ label:"Mindfulness", icon:"🧘" },
  reto:       { label:"Reto", icon:"🏆" },
  gimnasia:   { label:"Gimnasia cerebral", icon:"🧩" },
  enfoque:    { label:"Ejercicio de enfoque", icon:"🔍" },
};

const TAG_COLORS = {
  respiracion:["#E1F5EE","#0F6E56"], reflexion:["#E6F1FB","#185FA5"],
  emocion:["#EEEDFE","#534AB7"], conductual:["#FAEEDA","#854F0B"],
  habito:["#EAF3DE","#3B6D11"], energia:["#FFF3CD","#856404"],
  libre:["#F0F0F0","#444"], checklist:["#E8F5E9","#2E7D32"],
  lectura:["#FFF8E1","#F57F17"], video:["#FCE4EC","#880E4F"],
  mindfulness:["#E8EAF6","#283593"], reto:["#FFF3E0","#E65100"],
  gimnasia:["#E0F2F1","#00695C"], enfoque:["#F3E5F5","#6A1B9A"],
};

const DAILY_PHRASES = [
  "Tu cerebro aprende cada vez que te presentas. 🧠",
  "Un paso pequeño hoy es un cambio grande mañana. 🌱",
  "La constancia es tu superpoder. ✨",
  "Hoy entrenas, mañana lo notas. 💪",
  "Cada ejercicio cuenta. Estás construyendo algo real. 🏗️",
  "Tu mente se fortalece con cada intención. 🎯",
  "Confía en el proceso. Los resultados vienen. 🌟",
  "Pequeñas acciones, grandes transformaciones. 🦋",
  "Lo que practicas, lo vives. Sigue adelante. 💛",
  "Eres capaz de más de lo que crees. 🌠",
];

const WELCOME_OPTS = [
  "¡Bienvenida a una nueva semana! Tu cerebro está listo para crecer. 🌱",
  "Esta semana es tuya. Cada ejercicio es un paso hacia la versión que construyes. 💪",
  "Nuevo comienzo, nueva oportunidad. Tu cerebro aprende cada día. 🧠",
  "¡Aquí vamos! Esta semana entrenamos juntas. Confía en el proceso. ✨",
  "Empieza con intención. Tu consistencia es tu superpoder. 🚀",
];

const CLOSE_OPTS = [
  "¡Lo lograste! Completaste esta semana. Tu cerebro lo celebra. 🏆",
  "¡Increíble! Semana terminada. Eso no es poca cosa. 🌟",
  "¡Lo hiciste! La constancia construye el cambio que buscas. 🦋",
  "Semana completa. Eres más consistente de lo que crees. 💛",
  "¡Misión cumplida! Cada semana cerrada te acerca a tu mejor versión. 🎯",
];

const TEMPLATES = {
  regulacion: {
    name:"🧘 Regulación emocional", label:"Semana de Regulación Emocional",
    days: DAYS.map((d,i) => ({ day:d, exercises: i===6 ? [] : [
      {type:"energia",title:"¿Cómo amaneces?",instructions:"Selecciona tu nivel de energía al inicio del día.",items:[]},
      {type:"respiracion",title:"Respiración 4-7-8",instructions:"Inhala 4s, sostén 7s, exhala 8s. Repite 4 veces.",items:["Lo practiqué hoy"]},
      {type:"libre",title:"¿Cómo te vas?",instructions:"Cuéntame cómo terminaste el día.",items:[]},
    ]}))
  },
  enfoque: {
    name:"🔍 Enfoque y claridad", label:"Semana de Enfoque y Claridad",
    days: DAYS.map((d,i) => ({ day:d, exercises: i===6 ? [] : [
      {type:"energia",title:"Nivel de energía",instructions:"¿Cómo está tu energía para concentrarte?",items:[]},
      {type:"enfoque",title:"Bloque de enfoque",instructions:"Elige UNA tarea y trabájala 25 min sin interrupciones.",items:["Completé el bloque"]},
      {type:"checklist",title:"Check del día",instructions:"¿Cómo estuvo tu concentración?",items:["Evité distracciones","Completé mi tarea","Hice pausas"]},
    ]}))
  },
  habitos: {
    name:"📌 Hábitos y constancia", label:"Semana de Hábitos",
    days: DAYS.map((d,i) => ({ day:d, exercises: i===6 ? [] : [
      {type:"habito",title:"Seguimiento de hábitos",instructions:"¿Cumpliste tus hábitos?",items:["Hábito 1","Hábito 2","Hábito 3"]},
      {type:"gimnasia",title:"Gimnasia cerebral",instructions:"5 min de sudoku, memorización o lectura activa.",items:["Lo hice hoy"]},
      {type:"reflexion",title:"Reflexión de cierre",instructions:"¿Qué hábito te costó más hoy?",items:[]},
    ]}))
  },
  rendimiento: {
    name:"🚀 Rendimiento y logros", label:"Semana de Rendimiento",
    days: DAYS.map((d,i) => ({ day:d, exercises: i===6 ? [] : [
      {type:"energia",title:"Energía de arranque",instructions:"¿Con cuánta energía inicias?",items:[]},
      {type:"reto",title:"Reto del día",instructions:"Sal de tu zona de confort en algo concreto.",items:["Acepté el reto","Lo completé"]},
      {type:"libre",title:"Novedad del día",instructions:"¿Qué aprendiste hoy de ti mismo/a?",items:[]},
    ]}))
  },
};

// ── Storage helpers ──────────────────────────────────────
function getMentees() { try { return JSON.parse(localStorage.getItem("sol_mentees")||"[]"); } catch { return []; } }
function saveMentees(l) { try { localStorage.setItem("sol_mentees",JSON.stringify(l)); } catch {} }
function getWeeks(uid) { try { return JSON.parse(localStorage.getItem("sol_weeks_"+uid)||"[]"); } catch { return []; } }
function saveWeeks(uid,w) { try { localStorage.setItem("sol_weeks_"+uid,JSON.stringify(w)); } catch {} }
function getAW(uid) { try { const v=localStorage.getItem("sol_aw_"+uid); return v!==null?parseInt(v):0; } catch { return 0; } }
function setAW(uid,i) { try { localStorage.setItem("sol_aw_"+uid,String(i)); } catch {} }
function getR(uid,wi) { const o={}; for(let i=0;i<7;i++){try{const v=localStorage.getItem("sol_r_"+uid+"_"+wi+"_"+i);if(v)o[i]=JSON.parse(v);}catch{}} return o; }
function setR(uid,wi,di,ei,val) { try{const k="sol_r_"+uid+"_"+wi+"_"+di;const d=JSON.parse(localStorage.getItem(k)||"{}");d[ei]={...val,at:new Date().toLocaleString("es-EC")};localStorage.setItem(k,JSON.stringify(d));}catch{} }
function delAll(uid) { const ws=getWeeks(uid); ws.forEach((_,wi)=>{for(let i=0;i<7;i++)localStorage.removeItem("sol_r_"+uid+"_"+wi+"_"+i);}); localStorage.removeItem("sol_weeks_"+uid); localStorage.removeItem("sol_aw_"+uid); }
function newWeek(n) { return {label:"Semana "+n,welcome:"",closing:"",createdAt:new Date().toLocaleDateString("es-EC"),days:DAYS.map(d=>({day:d,exercises:[]}))}; }
function isWDone(weeks,wi,uid) { const w=weeks[wi]; if(!w)return false; const r=getR(uid,wi); return w.days.every((d,di)=>{ if(d.exercises.length===0)return true; return d.exercises.every((_,ei)=>r[di]&&r[di][ei]); }); }

// ── Shared styles ────────────────────────────────────────
const W = {fontFamily:"system-ui,sans-serif",padding:"1.5rem",maxWidth:680,margin:"0 auto",color:DARK};
const C = {background:"#fff",border:"0.5px solid #e5e5e5",borderRadius:12,padding:"1.25rem",marginBottom:12};
const I = {width:"100%",boxSizing:"border-box",padding:8,borderRadius:6,border:"0.5px solid #ddd",fontSize:14};

function PB(extra) { return {...{cursor:"pointer",padding:"10px 20px",background:CORAL,color:"#fff",border:"none",borderRadius:8,fontWeight:500,fontSize:14},...(extra||{})}; }
function OB(c,extra) { return {...{cursor:"pointer",padding:"6px 14px",background:"none",color:c||CORAL,border:"0.5px solid "+(c||CORAL),borderRadius:6,fontSize:13},...(extra||{})}; }
function DB(a) { return {cursor:"pointer",padding:"6px 12px",borderRadius:8,fontSize:13,border:a?"1.5px solid "+CORAL:"0.5px solid #ddd",background:a?CORAL+"18":"#fff",color:a?CORAL:DARK,fontWeight:a?500:400}; }
function TB(a) { return {cursor:"pointer",padding:"8px 16px",borderRadius:8,fontSize:13,border:a?"1.5px solid "+NAVY:"0.5px solid #ddd",background:a?NAVY+"12":"#fff",color:a?NAVY:DARK,fontWeight:a?500:400}; }
function WB(a,done) { return {cursor:"pointer",padding:"6px 10px",borderRadius:8,fontSize:12,border:a?"1.5px solid "+CORAL:done?"0.5px solid #1D9E75":"0.5px solid #ddd",background:a?CORAL+"18":done?"#E8F5E9":"#fff",color:a?CORAL:done?"#1D9E75":DARK,fontWeight:a?500:400}; }

// ── Exercise Card ────────────────────────────────────────
function ExCard({ex,di,ei,saved,onSave}) {
  const [text,setText] = useState(saved?saved.text||"":"");
  const [score,setScore] = useState(saved?saved.score||null:null);
  const [checks,setChecks] = useState(saved?saved.checks||{}:{});
  const [ok,setOk] = useState(false);
  useEffect(()=>{setText(saved?saved.text||"":"");setScore(saved?saved.score||null:null);setChecks(saved?saved.checks||{}:{});},[saved]);
  const tc = TAG_COLORS[ex.type]||["#eee","#555"];
  const hasChk = ["checklist","mindfulness","reto","gimnasia","enfoque","conductual","respiracion","habito","lectura","video"].includes(ex.type);
  function save(){onSave(di,ei,{text,score,checks});setOk(true);setTimeout(()=>setOk(false),1500);}
  return (
    <div style={{...C,borderLeft:"3px solid "+CORAL}}>
      <span style={{background:tc[0],color:tc[1],fontSize:12,padding:"3px 10px",borderRadius:6,display:"inline-block",marginBottom:8}}>
        {EX_TYPES[ex.type]?EX_TYPES[ex.type].icon:""} {EX_TYPES[ex.type]?EX_TYPES[ex.type].label:""}
      </span>
      <p style={{fontWeight:500,fontSize:14,margin:"0 0 6px",color:NAVY}}>{ex.title}</p>
      <p style={{fontSize:13,color:"#888",margin:"0 0 10px",lineHeight:1.6}}>{ex.instructions}</p>
      {(ex.type==="lectura"||ex.type==="video")&&ex.link&&(
        <a href={ex.link} target="_blank" rel="noreferrer" style={{display:"inline-block",marginBottom:12,color:CORAL,fontSize:13}}>
          {ex.type==="video"?"▶ Ver video":"📖 Abrir lectura"}
        </a>
      )}
      {ex.type==="energia"&&(
        <div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {[1,2,3,4,5,6,7,8,9,10].map(n=>(
              <button key={n} onClick={()=>setScore(n)} style={{width:40,height:40,borderRadius:8,cursor:"pointer",fontSize:15,fontWeight:score===n?700:400,border:score===n?"2px solid "+CORAL:"1px solid #ddd",background:score===n?CORAL:"#fff",color:score===n?"#fff":DARK}}>
                {n}
              </button>
            ))}
          </div>
          {score&&<p style={{fontSize:13,color:"#888",marginBottom:8}}>{score<=3?"😴 Energía baja":score<=6?"😐 Energía media":"⚡ Energía alta"}</p>}
        </div>
      )}
      {hasChk&&ex.items&&ex.items.length>0&&(
        <div style={{marginBottom:12}}>
          {ex.items.map((item,idx)=>(
            <label key={idx} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,cursor:"pointer",fontSize:14}}>
              <input type="checkbox" checked={!!checks[idx]} onChange={e=>{const c={...checks};c[idx]=e.target.checked;setChecks(c);}} style={{width:18,height:18,accentColor:CORAL,cursor:"pointer"}}/>
              <span>{item}</span>
            </label>
          ))}
        </div>
      )}
      <textarea style={{...I,minHeight:ex.type==="libre"?100:70,resize:"vertical"}}
        placeholder={ex.type==="libre"?"Cuéntame lo que quieras... 💬":ex.type==="energia"?"¿Qué influye en tu energía? (opcional)":"¿Cómo te sentiste?"}
        value={text} onChange={e=>setText(e.target.value)}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
        <button style={{cursor:"pointer",padding:"6px 14px",background:CORAL,color:"#fff",border:"none",borderRadius:6,fontSize:13}} onClick={save}>Guardar</button>
        {ok&&<span style={{fontSize:12,color:"#1D9E75"}}>✓ Guardado</span>}
        {saved&&!ok&&<span style={{fontSize:12,color:"#bbb"}}>{saved.at}</span>}
      </div>
    </div>
  );
}

// ── Response display ─────────────────────────────────────
function RV({resp,ex}) {
  if(!resp) return <p style={{fontSize:13,color:"#bbb",fontStyle:"italic"}}>Sin respuesta aún.</p>;
  return (
    <div style={{background:"#f8f8f8",borderRadius:8,padding:"10px 12px"}}>
      <p style={{fontSize:12,color:"#aaa",margin:"0 0 6px"}}>{resp.at}</p>
      {resp.score!=null&&<p style={{fontSize:14,margin:"0 0 4px"}}>⚡ {resp.score}/10 {resp.score<=3?"😴":resp.score<=6?"😐":"⚡"}</p>}
      {resp.checks&&ex.items&&ex.items.map((item,i)=>(
        <p key={i} style={{fontSize:13,margin:"2px 0",color:resp.checks[i]?"#2E7D32":"#cc3333"}}>{resp.checks[i]?"✓":"✗"} {item}</p>
      ))}
      {resp.text&&<p style={{fontSize:14,margin:"4px 0 0",whiteSpace:"pre-wrap"}}>{resp.text}</p>}
    </div>
  );
}

// ── Plan Editor ──────────────────────────────────────────
function PlanEditor({plan,onChange,onSave,onCancel,onTemplate}) {
  const [showTpl,setShowTpl] = useState(false);
  const hasChk = t=>["checklist","mindfulness","reto","gimnasia","enfoque","conductual","respiracion","habito","lectura","video"].includes(t);
  const hasLink = t=>t==="lectura"||t==="video";
  function upF(di,ei,f,v){onChange(p=>({...p,days:p.days.map((d,i)=>i!==di?d:{...d,exercises:d.exercises.map((e,j)=>j!==ei?e:{...e,[f]:v})})}))}
  function addE(di){onChange(p=>({...p,days:p.days.map((d,i)=>i!==di?d:{...d,exercises:[...d.exercises,{type:"reflexion",title:"",instructions:"",items:[]}]})}))}
  function delE(di,ei){onChange(p=>({...p,days:p.days.map((d,i)=>i!==di?d:{...d,exercises:d.exercises.filter((_,j)=>j!==ei)})}))}
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:500,color:NAVY}}>Editar plan</h3>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button style={OB(NAVY,{fontSize:12})} onClick={()=>setShowTpl(!showTpl)}>📋 Plantillas</button>
          <button style={PB()} onClick={onSave}>Guardar</button>
          <button style={OB()} onClick={onCancel}>Cancelar</button>
        </div>
      </div>
      {showTpl&&(
        <div style={{...C,background:"#f9f9f9",marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:500,margin:"0 0 10px",color:NAVY}}>Elige una plantilla:</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(TEMPLATES).map(([k,t])=>(
              <button key={k} style={OB(NAVY,{textAlign:"left",padding:"8px 14px"})} onClick={()=>{onTemplate(t);setShowTpl(false);}}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Título de la semana</label>
        <input style={I} value={plan.label} onChange={e=>onChange(p=>({...p,label:e.target.value}))}/>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Mensaje de bienvenida</label>
        <textarea style={{...I,minHeight:60,resize:"vertical"}} value={plan.welcome||""} onChange={e=>onChange(p=>({...p,welcome:e.target.value}))} placeholder="Escribe o elige una frase..."/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
          {WELCOME_OPTS.map((m,i)=>(
            <button key={i} style={{cursor:"pointer",padding:"3px 8px",background:"none",color:"#666",border:"0.5px solid #ccc",borderRadius:6,fontSize:11}} onClick={()=>onChange(p=>({...p,welcome:m}))}>
              Frase {i+1}
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Mensaje de cierre</label>
        <textarea style={{...I,minHeight:60,resize:"vertical"}} value={plan.closing||""} onChange={e=>onChange(p=>({...p,closing:e.target.value}))} placeholder="Escribe o elige una frase..."/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
          {CLOSE_OPTS.map((m,i)=>(
            <button key={i} style={{cursor:"pointer",padding:"3px 8px",background:"none",color:"#666",border:"0.5px solid #ccc",borderRadius:6,fontSize:11}} onClick={()=>onChange(p=>({...p,closing:m}))}>
              Frase {i+1}
            </button>
          ))}
        </div>
      </div>
      {plan.days.map((d,di)=>(
        <div key={di} style={C}>
          <p style={{fontWeight:500,fontSize:14,margin:"0 0 10px",color:NAVY}}>{d.day}</p>
          {d.exercises.map((ex,ei)=>(
            <div key={ei} style={{borderLeft:"2px solid "+CORAL,paddingLeft:12,marginBottom:12}}>
              <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
                <select value={ex.type} onChange={e=>upF(di,ei,"type",e.target.value)} style={{fontSize:13,padding:4,borderRadius:4,border:"0.5px solid #ddd"}}>
                  {Object.entries(EX_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
                <button style={{fontSize:12,color:"#cc3333",background:"none",border:"none",cursor:"pointer"}} onClick={()=>delE(di,ei)}>✕</button>
              </div>
              <input placeholder="Título" value={ex.title} onChange={e=>upF(di,ei,"title",e.target.value)} style={{...I,marginBottom:6}}/>
              <textarea placeholder="Instrucciones" value={ex.instructions} onChange={e=>upF(di,ei,"instructions",e.target.value)} style={{...I,minHeight:50,resize:"vertical",marginBottom:6}}/>
              {hasLink(ex.type)&&<input placeholder="Link (URL)" value={ex.link||""} onChange={e=>upF(di,ei,"link",e.target.value)} style={{...I,marginBottom:6}}/>}
              {hasChk(ex.type)&&<textarea placeholder="Ítems del checklist (uno por línea)" value={(ex.items||[]).join("\n")} onChange={e=>upF(di,ei,"items",e.target.value.split("\n").map(s=>s.trim()).filter(Boolean))} style={{...I,minHeight:60,resize:"vertical",fontSize:12}}/>}
            </div>
          ))}
          <button style={OB(CORAL,{fontSize:12})} onClick={()=>addE(di)}>+ Agregar ejercicio</button>
        </div>
      ))}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────
export default function App() {
  const [view,setView] = useState("login");
  const [user,setUser] = useState(null);
  const [lu,setLu] = useState("");
  const [lp,setLp] = useState("");
  const [le,setLe] = useState("");
  const [mentees,setMentees] = useState([]);
  const [mTab,setMTab] = useState("list");
  const [selId,setSelId] = useState(null);
  const [sTab,setSTab] = useState("resp");
  const [weeks,setWeeks] = useState([]);
  const [awi,setAwi] = useState(0);
  const [day,setDay] = useState(0);
  const [resps,setResps] = useState({});
  const [mWeeks,setMWeeks] = useState([]);
  const [mawi,setMawi] = useState(0);
  const [mDay,setMDay] = useState(0);
  const [eWeek,setEWeek] = useState(null);
  const [eWi,setEWi] = useState(null);
  const [nn,setNn] = useState("");
  const [np,setNp] = useState("");
  const [nadd,setNadd] = useState("");
  const [cdel,setCdel] = useState(null);

  useEffect(() => {
  async function loadMentees() {
    try {
      const dbMentees = await getMenteesFromDB();

      if (dbMentees.length > 0) {
        setMentees(dbMentees);
        saveMentees(dbMentees);
      } else {
        setMentees(getMentees());
      }
    } catch (error) {
      console.error("Error cargando mentees:", error);
      setMentees(getMentees());
    }
  }

  loadMentees();
}, []);

  const doy = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/(1000*60*60*24));
  const phrase = DAILY_PHRASES[doy%DAILY_PHRASES.length];

 async function doLogin() {
  if (lu === "sol") {
    try {
      await signInWithEmailAndPassword(auth, "solsempp@gmail.com", lp);
      setUser({ id: "sol", name: "Sol Sempértegui", role: "mentor" });
      setLe("");
      setMentees(getMentees());
      setView("mentor");
      return;
    } catch (error) {
      setLe("Contraseña incorrecta");
      return;
    }
  }

  const m = getMentees().find(x => x.id === lu && x.pass === lp && x.active);
  if (!m) {
    setLe("Usuario o contraseña incorrectos");
    return;
  }

  setUser({ ...m, role: "mentee" });
  setLe("");

  let w = getWeeks(m.id);
  if (w.length === 0) {
    w = [newWeek(1)];
    saveWeeks(m.id, w);
  }

  try {
  const dbWeeks = await getWeeksFromDB(m.id);
  const finalWeeks = dbWeeks.length > 0 ? dbWeeks : w;

  const dbActiveWeek = await getActiveWeekFromDB(m.id);
  const dbResponses = await getResponsesFromDB(m.id, dbActiveWeek);

  setWeeks(finalWeeks);
  setAwi(dbActiveWeek);
  setResps(dbResponses);
  setDay(0);
  setView("mentee");
} catch (error) {
  console.error("Error cargando datos del mentee:", error);

  setWeeks(w);
  const wi = getAW(m.id);
  setAwi(wi);
  setResps(getR(m.id, wi));
  setDay(0);
  setView("mentee");
}
   }

  function doLogout(){setUser(null);setView("login");setLu("");setLp("");setWeeks([]);setSelId(null);setMTab("list");}

  async function doAdd() {
  if (!nn.trim() || !np.trim()) {
    setNadd("Completa nombre y contraseña.");
    return;
  }

  const id = "m_" + Date.now();

  const newMentee = {
    id,
    name: nn.trim(),
    pass: np.trim(),
    active: true,
    createdAt: new Date().toLocaleDateString("es-EC")
  };

  const initialWeeks = [newWeek(1)];

  try {
    await saveMenteeToDB(newMentee);
    await saveWeeksToDB(id, initialWeeks);

    const updatedMentees = [...mentees, newMentee];

    saveMentees(updatedMentees);
    setMentees(updatedMentees);

    setNn("");
    setNp("");
    setNadd("");
    setMTab("list");
  } catch (error) {
    console.error("Error guardando mentee:", error);
    setNadd("No se pudo guardar. Revisa Firebase.");
  }
}

  function doToggle(id){const u=getMentees().map(m=>m.id===id?{...m,active:!m.active}:m);saveMentees(u);setMentees(u);}
  function doDel(id){delAll(id);const u=getMentees().filter(m=>m.id!==id);saveMentees(u);setMentees(u);if(selId===id)setSelId(null);setCdel(null);}

  async function doSel(id) {
  setSelId(id);
  setMDay(0);
  setSTab("resp");

  try {
    let w = await getWeeksFromDB(id);

    if (w.length === 0) {
      w = [newWeek(1)];
      await saveWeeksToDB(id, w);
    }

    const activeWeek = await getActiveWeekFromDB(id);

    setMWeeks(w);
    setMawi(activeWeek);
  } catch (error) {
    console.error("Error cargando semanas desde Firebase:", error);

    let w = getWeeks(id);
    if (w.length === 0) {
      w = [newWeek(1)];
      saveWeeks(id, w);
    }

    setMWeeks(w);
    setMawi(getAW(id));
  }
}

  async function doAddWeek() {
  if (mWeeks.length >= 24) return;

  const nw = [...mWeeks, newWeek(mWeeks.length + 1)];

  try {
    await saveWeeksToDB(selId, nw);
    await saveActiveWeekToDB(selId, nw.length - 1);

    setMWeeks(nw);
    setMawi(nw.length - 1);
  } catch (error) {
    console.error("Error creando nueva semana:", error);
  }
}

  async function doActivate(idx) {
  try {
    await saveActiveWeekToDB(selId, idx);
    setMawi(idx);
  } catch (error) {
    console.error("Error activando semana:", error);
  }
}

  // ── LOGIN ──
  if(view==="login"){
    const all=[{id:"sol",name:"Sol Sempértegui"},...getMentees().filter(m=>m.active)];
    return (
      <div style={W}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <img src="/logo.png" alt="Sol Sempértegui" style={{height:100,objectFit:"contain",marginBottom:8}}/>
<h2 style={{margin:0,fontSize:24,fontWeight:600,color:NAVY}}>Sol Sempértegui</h2>
          <p style={{margin:"6px 0 0",fontSize:14,color:CORAL,fontWeight:500}}>Entrenamiento Cerebral 6M</p>
          <p style={{margin:"2px 0 0",fontSize:13,color:"#888"}}>Tu entrenamiento cerebral personalizado</p>
        </div>
        <div style={C}>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Selecciona tu nombre</label>
            <select style={I} value={lu} onChange={e=>setLu(e.target.value)}>
              <option value="">— elige —</option>
              {all.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Contraseña</label>
            <input style={I} type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="••••••"/>
          </div>
          {le&&<p style={{color:CORAL,fontSize:13,margin:"0 0 12px"}}>{le}</p>}
          <button style={{...PB(),width:"100%"}} onClick={doLogin}>Ingresar</button>
        </div>
      </div>
    );
  }

  // ── MENTEE ──
  if(view==="mentee"&&weeks.length>0){
    const week=weeks[awi]||weeks[0];
    const dp=week.days[day];
    const wd=isWDone(weeks,awi,user.id);
    return (
      <div style={W}>
        {week.welcome&&day===0&&(
          <div style={{background:NAVY,borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1rem",color:"#fff"}}>
            <p style={{margin:0,fontSize:14,lineHeight:1.6}}>✨ {week.welcome}</p>
          </div>
        )}
        <div style={{background:BEIGE+"55",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1.25rem"}}>
          <p style={{margin:0,fontSize:13,color:NAVY,fontStyle:"italic"}}>{phrase}</p>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div>
            <h2 style={{margin:0,fontSize:18,fontWeight:500,color:NAVY}}>Hola, {user.name.split(" ")[0]} 👋</h2>
            <p style={{margin:"2px 0 0",fontSize:13,color:"#888"}}>{week.label}</p>
          </div>
          <button style={OB()} onClick={doLogout}>Salir</button>
        </div>
        {weeks.length>1&&(
          <div style={{marginBottom:12}}>
            <p style={{fontSize:12,color:"#aaa",margin:"0 0 6px"}}>Mis semanas:</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {weeks.map((w,i)=>(
                <button key={i} style={WB(awi===i,isWDone(weeks,i,user.id))} onClick={()=>{setAwi(i);setResps(getR(user.id,i));setDay(0);}}>
                  S{i+1}{isWDone(weeks,i,user.id)?" ✓":""}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.25rem"}}>
          {week.days.map((d,i)=>{
            const done=d.exercises.length>0&&d.exercises.every((_,ei)=>resps[i]&&resps[i][ei]);
            return <button key={i} style={DB(day===i)} onClick={()=>setDay(i)}>{d.day.slice(0,3)}{done?" ✓":""}</button>;
          })}
        </div>
        <h3 style={{fontSize:15,fontWeight:500,color:NAVY,margin:"0 0 1rem"}}>{dp.day}</h3>
        {dp.exercises.length===0
          ?<div style={{...C,textAlign:"center",color:"#888"}}>Día libre 🌿 Descansa y recarga.</div>
          :dp.exercises.map((ex,ei)=>(
            <ExCard key={ei} ex={ex} di={day} ei={ei} saved={resps[day]?resps[day][ei]:null}
              onSave={async (di, ei, val) => {
  try {
    const updatedResponses = await saveResponseToDB(user.id, awi, di, ei, val);
    setResps(updatedResponses);
  } catch (error) {
    console.error("Error guardando respuesta en Firebase:", error);

    setR(user.id, awi, di, ei, val);
    setResps(r => {
      const u = { ...r };
      if (!u[di]) u[di] = {};
      u[di][ei] = { ...val, at: new Date().toLocaleString("es-EC") };
      return u;
    });
  }
}}
              }}/>
          ))
        }
        {wd&&week.closing&&(
          <div style={{background:"linear-gradient(135deg,"+CORAL+",#e8956d)",borderRadius:12,padding:"1.25rem",marginTop:8,color:"#fff",textAlign:"center"}}>
            <p style={{margin:0,fontSize:15,fontWeight:500}}>🏆 {week.closing}</p>
          </div>
        )}
      </div>
    );
  }

  // ── MENTOR ──
  if(view==="mentor"){
    const active=mentees.filter(m=>m.active);
    const inactive=mentees.filter(m=>!m.active);
    const selM=selId?mentees.find(m=>m.id===selId):null;
    const curW=mWeeks.length>0?mWeeks[mawi]:null;
    const curAW = mawi;
    return (
      <div style={W}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <div>
            <h2 style={{margin:0,fontSize:18,fontWeight:500,color:NAVY}}>Panel de mentora</h2>
            <p style={{margin:"2px 0 0",fontSize:13,color:CORAL}}>Sol Sempértegui</p>
          </div>
          <button style={OB()} onClick={doLogout}>Salir</button>
        </div>

        {!selId&&(
          <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
            <button style={TB(mTab==="list")} onClick={()=>setMTab("list")}>Mis mentees</button>
            <button style={TB(mTab==="add")} onClick={()=>setMTab("add")}>+ Agregar mentee</button>
          </div>
        )}

        {!selId&&mTab==="list"&&(
          <div>
            <p style={{fontSize:13,color:"#888",margin:"0 0 12px"}}>Activos: {active.length}</p>
            {active.length===0&&<p style={{color:"#aaa",fontSize:13}}>Aún no has agregado mentees. Usa "+ Agregar mentee".</p>}
            {active.map(m=>{
              const ws=getWeeks(m.id);
              const total=ws.reduce((a,_,wi)=>{const r=getR(m.id,wi);return a+Object.values(r).reduce((b,d)=>b+Object.keys(d).length,0);},0);
              return (
                <div key={m.id} style={{...C,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div>
                    <p style={{margin:0,fontWeight:500,fontSize:14}}>{m.name}</p>
                    <p style={{margin:"2px 0 0",fontSize:12,color:"#aaa"}}>Desde {m.createdAt} · {ws.length} sem · {total} resp</p>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button style={OB(NAVY,{fontSize:12})} onClick={()=>doSel(m.id)}>Ver</button>
                    <button style={OB("#e0a000",{fontSize:12})} onClick={()=>doToggle(m.id)}>Pausar</button>
                    <button style={OB("#cc3333",{fontSize:12})} onClick={()=>setCdel(m.id)}>Eliminar</button>
                  </div>
                </div>
              );
            })}
            {inactive.length>0&&(
              <div style={{marginTop:20}}>
                <p style={{fontSize:13,color:"#aaa",margin:"0 0 10px"}}>Pausados: {inactive.length}</p>
                {inactive.map(m=>(
                  <div key={m.id} style={{...C,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:0.6,flexWrap:"wrap",gap:8}}>
                    <p style={{margin:0,fontWeight:500,fontSize:14}}>{m.name}</p>
                    <div style={{display:"flex",gap:6}}>
                      <button style={OB("#1D9E75",{fontSize:12})} onClick={()=>doToggle(m.id)}>Reactivar</button>
                      <button style={OB("#cc3333",{fontSize:12})} onClick={()=>setCdel(m.id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selId&&mTab==="add"&&(
          <div style={C}>
            <h3 style={{fontSize:15,fontWeight:500,color:NAVY,margin:"0 0 1rem"}}>Agregar nuevo mentee</h3>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Nombre completo</label>
              <input style={I} value={nn} onChange={e=>setNn(e.target.value)} placeholder="Ej: Ana García"/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Contraseña para el mentee</label>
              <input style={I} value={np} onChange={e=>setNp(e.target.value)} placeholder="Ej: ana2026"/>
            </div>
            {nadd&&<p style={{color:CORAL,fontSize:13,margin:"0 0 12px"}}>{nadd}</p>}
            <button style={PB()} onClick={doAdd}>Agregar mentee</button>
          </div>
        )}

        {selId&&selM&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem",flexWrap:"wrap"}}>
              <button style={OB(CORAL,{fontSize:12})} onClick={()=>{setSelId(null);setMTab("list");}}>← Volver</button>
              <h3 style={{margin:0,fontSize:15,fontWeight:500,color:NAVY}}>{selM.name}</h3>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <p style={{fontSize:12,color:"#aaa",margin:0}}>Semanas ({mWeeks.length}/24)</p>
                {mWeeks.length<24&&(
                  <button style={OB(NAVY,{fontSize:12,padding:"4px 10px"})} onClick={doAddWeek}>+ Nueva semana</button>
                )}
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {mWeeks.map((w,i)=>(
                  <button key={i} style={WB(mawi===i,isWDone(mWeeks,i,selId))} onClick={()=>{setMawi(i);setMDay(0);setSTab("resp");}}>
                    S{i+1}{isWDone(mWeeks,i,selId)?" ✓":""}
                  </button>
                ))}
              </div>
            </div>
            {curW&&(
              <div style={{...C,background:"#f9f9f9",padding:"0.75rem 1rem",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <p style={{margin:0,fontSize:13,color:"#555"}}>{curW.label}{curAW===mawi?" · Semana activa":""}</p>
                {curAW!==mawi
                  ?<button style={OB(CORAL,{fontSize:12})} onClick={()=>doActivate(mawi)}>Activar para mentee</button>
                  :<span style={{fontSize:12,color:CORAL,fontWeight:500}}>✓ Activa</span>
                }
              </div>
            )}
            <div style={{display:"flex",gap:6,marginBottom:"1rem"}}>
              <button style={TB(sTab==="resp")} onClick={()=>setSTab("resp")}>Respuestas</button>
              <button style={TB(sTab==="plan")} onClick={()=>{if(curW){setEWeek(JSON.parse(JSON.stringify(curW)));setEWi(mawi);}setSTab("plan");}}>Editar plan</button>
            </div>
            {sTab==="resp"&&curW&&(
              <div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"}}>
                  {curW.days.map((d,i)=><button key={i} style={DB(mDay===i)} onClick={()=>setMDay(i)}>{d.day.slice(0,3)}</button>)}
                </div>
                {curW.days[mDay].exercises.length===0
                  ?<div style={{...C,textAlign:"center",color:"#888"}}>Día libre</div>
                  :curW.days[mDay].exercises.map((ex,ei)=>{
                    const tc=TAG_COLORS[ex.type]||["#eee","#555"];
                    const r=getR(selId,mawi);
                    const resp=r[mDay]?r[mDay][ei]:null;
                    return (
                      <div key={ei} style={C}>
                        <span style={{background:tc[0],color:tc[1],fontSize:12,padding:"3px 10px",borderRadius:6,display:"inline-block",marginBottom:8}}>
                          {EX_TYPES[ex.type]?EX_TYPES[ex.type].icon:""} {EX_TYPES[ex.type]?EX_TYPES[ex.type].label:""}
                        </span>
                        <p style={{fontWeight:500,fontSize:14,margin:"0 0 4px"}}>{ex.title}</p>
                        <p style={{fontSize:13,color:"#888",margin:"0 0 10px"}}>{ex.instructions}</p>
                        <RV resp={resp} ex={ex}/>
                      </div>
                    );
                  })
                }
              </div>
            )}
            {sTab==="plan"&&eWeek&&(
              <PlanEditor plan={eWeek} onChange={setEWeek}
                onTemplate={t=>{setEWeek(p=>({...JSON.parse(JSON.stringify(t)),label:p.label,welcome:p.welcome,closing:p.closing}));}}
                onSave={async () => {
  const u = [...mWeeks];
  u[eWi] = eWeek;

  try {
    await saveWeeksToDB(selId, u);
    setMWeeks(u);
    setSTab("resp");
  } catch (error) {
    console.error("Error guardando plan en Firebase:", error);
  }
}}
                onCancel={()=>setSTab("resp")}/>
            )}
          </div>
        )}

        {cdel&&(
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
            <div style={{background:"#fff",borderRadius:12,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center"}}>
              <p style={{fontWeight:500,marginBottom:8}}>¿Eliminar este mentee?</p>
              <p style={{fontSize:13,color:"#888",marginBottom:20}}>Se borrarán todas sus semanas y respuestas.</p>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button style={OB("#cc3333")} onClick={()=>doDel(cdel)}>Sí, eliminar</button>
                <button style={OB()} onClick={()=>setCdel(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
