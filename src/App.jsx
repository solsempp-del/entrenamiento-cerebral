import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import {
  getMenteesFromDB,
  saveMenteeToDB,
  saveWeeksToDB,
  getWeeksFromDB,
  getActiveWeekFromDB,
  saveActiveWeekToDB,
  getResponsesFromDB,
  saveResponseToDB,
  deleteMenteeFromDB,
  updateMenteeInDB
} from "./firestoreHelpers";

const NAVY = "#0f243e";
const CORAL = "#dd6d60";
const BEIGE = "#d6c7b1";
const DARK = "#333333";
const ADMIN_EMAIL = "solsempp@gmail.com";

const DAYS = ["Día 1","Día 2","Día 3","Día 4","Día 5","Día 6","Día 7"];

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
  graciela_m1_s1: {
    name: "🧠 Graciela M1 S1",
    label: "Mes 1 · Semana 1 · Registro y entrenamiento cerebral",
    days: DAYS.map((d, i) => {
      const diario = [
        {
          type: "energia",
          title: "Nivel de energía",
          instructions: "Del 1 al 10, registra cómo estuvo tu energía hoy.",
          items: []
        },
        {
          type: "emocion",
          title: "Estado emocional",
          instructions: "Del 1 al 10, registra cómo estuvo tu estado emocional hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Registro diario",
          instructions: "Escribe: día del ciclo menstrual, hora en que dormiste, hora en que despertaste, novedades del día y cualquier cosa que quieras contarme.",
          items: []
        }
      ];

      const entrenamiento = [
        {
          type: "enfoque",
          title: "Atención y observación",
          instructions: "Haz el ejercicio 5-4-3-2-1. Escribe 5 cosas que ves, 4 cosas que escuchas, 3 cosas que puedes tocar, 2 cosas que puedes oler y 1 cosa que agradeces. Luego escribe si te resultó fácil permanecer en el presente o si tu mente se fue a otros temas.",
          items: []
        },
        {
          type: "checklist",
          title: "Reconocer patrones",
          instructions: "Marca qué factores influyeron hoy en cómo te sentiste. Luego escribe cuál crees que influyó más.",
          items: [
            "Dormí bien",
            "Dormí mal",
            "Hice ejercicio",
            "No hice ejercicio",
            "Tuve estrés",
            "Estuve tranquila",
            "Compartí con alguien",
            "Pasé mucho tiempo sola",
            "Tuve dolor físico",
            "Comí diferente"
          ]
        },
        {
          type: "gimnasia",
          title: "Flexibilidad cognitiva",
          instructions: "Piensa en una situación incómoda de hoy. Escribe tu primera interpretación y luego busca dos explicaciones alternativas. Observa si tu emoción cambia al mirar más de una posibilidad.",
          items: [
            "Identifiqué mi primera interpretación",
            "Encontré una segunda explicación",
            "Encontré una tercera explicación"
          ]
        },
        {
          type: "reflexion",
          title: "Mi mapa cerebral de la semana",
          instructions: "Completa estas frases: Esta semana tuve más energía cuando... Esta semana tuve menos energía cuando... Lo que más me ayudó fue... Lo que más me drenó fue... Algo que descubrí sobre mí fue...",
          items: []
        },
        {
          type: "reflexion",
          title: "Cierre de entrenamiento semanal",
          instructions: "Mira lo que trabajaste esta semana y responde: ¿qué patrón observaste en tu energía?, ¿qué herramienta te ayudó más?, ¿qué quieres seguir observando la próxima semana?",
          items: []
        }
      ];

      if (i <= 4) {
        return {
          day: d,
          exercises: [...diario, entrenamiento[i]]
        };
      }

      return {
        day: d,
        exercises: diario
      };
    })
  },

  richard_autocontrol: {
    name: "Richard · Autocontrol",
    label: "Recta final · Autocontrol y continuidad",
    days: DAYS.map((d, i) => {
      const base = [
        {
          type: "energia",
          title: "Nivel de energía",
          instructions: "Marca tu nivel de energía hoy del 1 al 10.",
          items: []
        }
      ];

      const ejercicios = [
        {
          type: "conductual",
          title: "Regla de los 20 minutos",
          instructions: "Cuando aparezca una necesidad fuerte de buscar estímulo, compañía, conversación o contacto íntimo, no actúes de inmediato. Pon un temporizador de 20 minutos. Durante ese tiempo haz una actividad concreta: caminar, ordenar algo, ducharte, cocinar, leer o salir a comprar algo necesario. Después escribe si seguías queriendo hacer exactamente lo mismo.",
          items: ["Puse el temporizador", "Esperé 20 minutos", "Hice otra actividad antes de decidir"]
        },
        {
          type: "checklist",
          title: "Qué necesitaba realmente",
          instructions: "Cuando aparezca una necesidad fuerte de buscar algo externo, marca qué necesitabas realmente en ese momento.",
          items: ["Descansar", "Compañía", "Diversión", "Contacto íntimo", "Cariño", "Conversar", "Sentirme importante", "Evitar pensar", "Otra cosa"]
        },
        {
          type: "conductual",
          title: "Dopamina sana",
          instructions: "Haz una actividad que te dé satisfacción sin depender de otra persona: cocinar, leer, caminar, aprender algo, ordenar un espacio, escuchar algo útil o hacer ejercicio. Escribe qué hiciste y cómo cambió tu energía.",
          items: ["Hice una actividad solo", "No dependí de otra persona", "Registré cómo me sentí después"]
        },
        {
          type: "reto",
          title: "Reinicio inmediato",
          instructions: "Cuando te descubras procrastinando, acostado sin querer levantarte o negociando contigo mismo, di en voz alta 5, 4, 3, 2, 1 y empieza. No importa cuánto hagas. Solo empieza.",
          items: ["Hice el conteo", "Me levanté o empecé", "Hice al menos una acción pequeña"]
        },
        {
          type: "habito",
          title: "La cadena no se rompe",
          instructions: "Elige una sola actividad para sostener: leer, caminar, cocinar, ordenar o hacer ejercicio. No tiene que salir perfecto. Aunque hagas 5 minutos, cuenta. Lo importante es no romper la cadena.",
          items: ["Hice algo, aunque fuera poco", "No abandoné por hacerlo imperfecto"]
        },
        {
          type: "reflexion",
          title: "Observación de continuidad",
          instructions: "Escribe en qué momento te costó más sostener una decisión y qué hiciste para no abandonar por completo.",
          items: []
        },
        {
          type: "reflexion",
          title: "Cierre de entrenamiento",
          instructions: "Completa: Esta semana mis impulsos aparecieron más cuando... La estrategia que más me ayudó fue... Lo que necesito seguir entrenando es...",
          items: []
        }
      ];

      return {
        day: d,
        exercises: [...base, ejercicios[i]]
      };
    })
  },

  maria_elena_cierre1_vision: {
    name: "María Elena · Cierre 1 · Visión de futuro",
    label: "Semana de cierre 1 · Recuperar visión de futuro",
    days: DAYS.map((d, i) => {
      const base = [
        {
          type: "energia",
          title: "Nivel de energía",
          instructions: "Del 1 al 10, registra cómo estuvo tu energía hoy.",
          items: []
        },
        {
          type: "checklist",
          title: "Modo del día",
          instructions: "Marca cómo sentiste que funcionó más tu mente hoy.",
          items: ["Modo máquina", "Modo barca"]
        }
      ];

      const ejercicios = [
        {
          type: "libre",
          title: "Lo que extraño de mí",
          instructions: "Piensa en ti más allá de resolver y sostener. ¿Qué parte de ti extrañas y te gustaría volver a sentir más viva? Al final escribe una sola frase con lo que más te sorprendió descubrir.",
          items: []
        },
        {
          type: "libre",
          title: "Lo que todavía me da ilusión",
          instructions: "No pienses en deberes ni en metas útiles. Piensa en ilusión. ¿Qué cosas todavía te dan ilusión, curiosidad o ganas, aunque sean pequeñas? Luego responde: ¿qué me dice esto sobre mí hoy?",
          items: []
        },
        {
          type: "libre",
          title: "Si mi vida no fuera solo resolver",
          instructions: "Imagina por un momento que tu vida no gira solo alrededor de sostener lo urgente. Si tu vida no fuera solo resolver, ¿qué espacio te gustaría recuperar? Luego escribe si hoy sientes ese espacio lejos o cerca.",
          items: []
        },
        {
          type: "libre",
          title: "La mujer que quiero ver más viva",
          instructions: "No respondas desde lo correcto. Responde desde lo que sí quieres ver crecer. ¿Qué versión de ti quieres ver más viva de aquí a seis meses? Luego escribe tres palabras que describan a esa mujer.",
          items: []
        },
        {
          type: "libre",
          title: "Lo que Dios podría estar despertando",
          instructions: "Mira esta etapa no solo como cansancio, sino como transición. Si Dios estuviera abriendo una etapa nueva en ti, ¿qué podría estar queriendo despertar? Luego escribe: ¿qué parte de esto me da paz y qué parte me da miedo?",
          items: []
        },
        {
          type: "libre",
          title: "Lo que ya no quiero seguir sosteniendo igual",
          instructions: "A veces no aparece futuro porque todo el espacio está ocupado por lo que sigues cargando. ¿Qué ya no quieres seguir sosteniendo de la misma manera? Luego responde: ¿qué tendría que cambiar para empezar a soltarlo?",
          items: []
        },
        {
          type: "libre",
          title: "Primer retrato de mi futuro",
          instructions: "No busques perfección. Solo junta lo que apareció esta semana. Después de esta semana, ¿cómo se ve hoy tu futuro un poco más claro? Completa también esta frase: Lo que más necesito recordar de mí en esta nueva etapa es...",
          items: []
        }
      ];

      const cierre = [
        {
          type: "habito",
          title: "Pausa corporal",
          instructions: "Si sentiste presión en la garganta o tensión interna, aplica tu protocolo: respirar, cambiar de ambiente o caminar un poco. Marca si lo hiciste hoy.",
          items: ["Hice mi pausa corporal hoy"]
        }
      ];

      return {
        day: d,
        exercises: [...base, ejercicios[i], ...cierre]
      };
    })
  guillermo_dinero_adulto: {
    name: "Guillermo · Dinero adulto",
    label: "Semana 17 · Dinero adulto y decisiones con criterio",
    welcome: "Esta semana vas a registrar qué entra, qué gastas y desde qué parte de ti decides: adulto, ansiedad, vacío, cansancio o impulso.",
    closing: "Semana cerrada. Lo importante no es que haya salido perfecto, sino que hayas podido mirar tus decisiones con más honestidad.",
    days: DAYS.map((d, i) => {
      const enfoque = [
        "Día 1: Observar sin juzgar. Hoy solo registra qué pasa con tu dinero.",
        "Día 2: Identificar. Mira si gastaste desde adulto o desde impulso.",
        "Día 3: Separar. Si entra dinero, divídelo en esencial, inversión en mí y placer con límite.",
        "Día 4: Frenar. Usa la regla de 24 horas si aparece un gasto emocional.",
        "Día 5: Salidas. Si sales, define antes cuánto gastas, cuánto tomas y cómo regresas.",
        "Día 6: Reparar. Si hubo gasto rojo, escribe qué harás diferente la próxima vez.",
        "Día 7: Cierre. Revisa cuál fue tu color dominante de la semana."
      ];

      const base = [
        {
          type: "energia",
          title: "Energía de hoy",
          instructions: "Del 1 al 10, registra cómo está tu energía hoy.",
          items: []
        },
        {
          type: "energia",
          title: "Guillermo adulto",
          instructions: "Del 1 al 10, registra qué tan adulto te sentiste hoy en tus decisiones.",
          items: []
        },
        {
          type: "energia",
          title: "Control de decisiones",
          instructions: "Del 1 al 10, registra cuánto control sentiste hoy sobre tus decisiones.",
          items: []
        },
        {
          type: "checklist",
          title: "Movimiento de dinero",
          instructions: "Marca lo que pasó hoy. Luego escribe cuánto entró, cuánto gastaste y en qué.",
          items: [
            "Entró dinero hoy",
            "Gasté dinero hoy",
            "No gasté dinero hoy",
            "Separé algo antes de gastar",
            "Gasté sin pensarlo"
          ]
        },
        {
          type: "checklist",
          title: "Tipo de gasto",
          instructions: "Si gastaste hoy, marca el color del gasto principal. Verde construye tu vida. Amarillo depende de tu estado interno. Rojo fue impulso o te costó autocontrol.",
          items: [
            "Verde: construye mi vida",
            "Amarillo: depende de mi estado interno",
            "Rojo: fue impulso o me costó autocontrol"
          ]
        },
        {
          type: "checklist",
          title: "¿En qué gasté?",
          instructions: "Marca el gasto principal de hoy.",
          items: [
            "Comida U",
            "Salidas",
            "Alcohol",
            "Cigarrillo",
            "Transporte",
            "Ayuda a otra persona",
            "Universidad",
            "Perro",
            "Ahorro",
            "Libros o crecimiento",
            "Gusto pequeño",
            "Otro"
          ]
        },
        {
          type: "checklist",
          title: "¿Desde dónde decidí?",
          instructions: "Marca desde qué parte de ti salió la decisión principal de gasto o no gasto.",
          items: [
            "Adulto",
            "Hambre real",
            "Ansiedad",
            "Vacío",
            "Cansancio",
            "Tristeza",
            "Presión de otros",
            "Impulso",
            "Quería sentirme libre"
          ]
        },
        {
          type: "checklist",
          title: "¿Qué me dio y qué me costó?",
          instructions: "Marca lo que te dio ese gasto y lo que te costó después.",
          items: [
            "Me dio calma",
            "Me dio placer",
            "Me hizo sentir vivo",
            "Me dio seguridad",
            "Me dio claridad",
            "Me ayudó a evitar sentir algo",
            "Me costó dinero",
            "Me costó cansancio",
            "Me costó culpa",
            "Me costó jaqueca",
            "Me costó ocultar algo",
            "Me costó trasnochada",
            "Me costó perder control",
            "No me costó nada importante"
          ]
        },
        {
          type: "checklist",
          title: "Regla de 24 horas",
          instructions: "Si el gasto no era urgente, no era necesario y nació de una emoción fuerte, debía esperar 24 horas. Marca qué pasó.",
          items: [
            "No tuve gasto emocional",
            "Esperé antes de decidir",
            "Pedí tiempo para decidir",
            "Gasté igual",
            "Todavía lo estoy pensando"
          ]
        },
        {
          type: "libre",
          title: enfoque[i],
          instructions: "Escribe una frase corta. Puede ser: cuánto entró, cuánto gastaste, cuál fue el color del día o qué harías diferente la próxima vez.",
          items: []
        }
      ];

      if (i === 6) {
        return {
          day: d,
          exercises: [
            ...base,
            {
              type: "checklist",
              title: "Cierre semanal",
              instructions: "Marca el resumen de tu semana.",
              items: [
                "Mi color dominante fue verde",
                "Mi color dominante fue amarillo",
                "Mi color dominante fue rojo",
                "Mi gasto más adulto fue claro",
                "Identifiqué mi gasto más impulsivo",
                "Necesito repetir la regla de 24 horas",
                "Necesito cuidar salidas",
                "Necesito cuidar cigarrillo",
                "Necesito cuidar ayudas económicas",
                "Necesito separar dinero antes de gastar"
              ]
            },
            {
              type: "reflexion",
              title: "Frase final de la semana",
              instructions: "Completa: Esta semana aprendí que mi dinero... La próxima semana necesito cuidar... Mi frase para decidir mejor es...",
              items: []
            }
          ]
        };
      }

      return {
        day: d,
        exercises: base
      };
    })
  },

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
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let raw = "";

  try {
    const values = new Uint32Array(8);
    window.crypto.getRandomValues(values);
    raw = Array.from(values).map(v => chars[v % chars.length]).join("");
  } catch {
    raw = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  return `Sol-${raw.slice(0,4)}-${raw.slice(4,8)}!`;
}


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
          <p style={{fontWeight:500,fontSize:14,margin:"0 0 10px",color:NAVY}}>{`Día ${di + 1}`}</p>
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
  const [me,setMe] = useState("");
  const [mp,setMp] = useState("");
  const [le,setLe] = useState("");
  const [mentees,setMentees] = useState([]);
  const [mTab,setMTab] = useState("list");
  const [selId,setSelId] = useState(null);
  const [sTab,setSTab] = useState("resp");
  const [weeks,setWeeks] = useState([]);
  const [awi,setAwi] = useState(0);
  const [day,setDay] = useState(0);
  const [resps,setResps] = useState({});
  const [mResps,setMResps] = useState({});
  const [mWeeks,setMWeeks] = useState([]);
  const [mawi,setMawi] = useState(0);
  const [mDay,setMDay] = useState(0);
  const [eWeek,setEWeek] = useState(null);
  const [eWi,setEWi] = useState(null);
const [nn,setNn] = useState("");
const [ne,setNe] = useState("");
const [np,setNp] = useState(() => generateTempPassword());
const [nadd,setNadd] = useState("");
const [createdInfo,setCreatedInfo] = useState(null);
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

 async function openSessionByEmail(email, dbMentees = null) {
  const cleanEmail = email ? email.toLowerCase() : "";

  if (cleanEmail === ADMIN_EMAIL) {
    const freshMentees = dbMentees || await getMenteesFromDB();
    setUser({ id: "sol", name: "Sol Sempértegui", role: "mentor", email: ADMIN_EMAIL });
    setLe("");
    setMentees(freshMentees);
    saveMentees(freshMentees);
    setView("mentor");
    return;
  }

  const freshMentees = dbMentees || await getMenteesFromDB();
  const mentee = freshMentees.find(x => x.email && x.email.toLowerCase() === cleanEmail && x.active);

  if (!mentee) {
    setLe("Este correo no está registrado. Escríbele a Sol.");
    return;
  }

  await openMenteeSession(mentee, freshMentees);
}

  async function openMenteeSession(m, dbMentees = null) {
    setUser({ ...m, role: "mentee" });
    setLe("");

    if (dbMentees) {
      setMentees(dbMentees);
      saveMentees(dbMentees);
    }

    let w = await getWeeksFromDB(m.id);

    if (w.length === 0) {
      w = [newWeek(1)];
      await saveWeeksToDB(m.id, w);
    }

    const dbActiveWeek = await getActiveWeekFromDB(m.id);
    const dbResponses = await getResponsesFromDB(m.id, dbActiveWeek);

    setWeeks(w);
    setAwi(dbActiveWeek);
    setResps(dbResponses);
    setDay(0);
    setView("mentee");
  }

  async function doEmailLogin() {
    const email = me.trim().toLowerCase();
    const password = mp;

    if (!email || !password) {
      setLe("Completa correo y contraseña.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await openSessionByEmail(email);
    } catch (error) {
      console.error("Error ingresando con correo:", error);
      setLe("Correo o contraseña incorrectos.");
    }
  }

  async function doLogout(){
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }

    setUser(null);
    setView("login");
    setLu("");
    setLp("");
    setMe("");
    setMp("");
    setWeeks([]);
    setAwi(0);
    setDay(0);
    setResps({});
    setMResps({});
    setCreatedInfo(null);
    setSelId(null);
    setMTab("list");
    setSTab("resp");
  }

  async function doAdd() {
    if (!nn.trim() || !ne.trim()) {
      setNadd("Completa nombre y correo.");
      return;
    }

    setCreatedInfo(null);

    const id = "m_" + Date.now();
    const tempPassword = np.trim() || generateTempPassword();

    const newMentee = {
      id,
      name: nn.trim(),
      email: ne.trim().toLowerCase(),
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

      setCreatedInfo({
        name: newMentee.name,
        email: newMentee.email,
        password: tempPassword
      });

      setNn("");
      setNe("");
      setNp(generateTempPassword());
      setNadd("");
    } catch (error) {
      console.error("Error guardando mentee:", error);
      setNadd("No se pudo guardar. Revisa Firebase.");
    }
  }

  async function doToggle(id){
    const current = mentees.find(m => m.id === id);
    if (!current) return;

    const updated = { ...current, active: !current.active };

    try {
      await updateMenteeInDB(id, { active: updated.active });
    } catch (error) {
      console.error("Error actualizando mentee en Firebase:", error);
      setLe("No se pudo actualizar el mentee.");
      return;
    }

    const u = mentees.map(m => m.id === id ? updated : m);
    saveMentees(u);
    setMentees(u);
  }

  async function doDel(id){
    try {
      await deleteMenteeFromDB(id);
      delAll(id);
      const u = mentees.filter(m => m.id !== id);
      saveMentees(u);
      setMentees(u);
      if(selId === id) setSelId(null);
      setCdel(null);
    } catch (error) {
      console.error("Error eliminando mentee en Firebase:", error);
      setLe("No se pudo eliminar el mentee.");
    }
  }

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
    const dbResponses = await getResponsesFromDB(id, activeWeek);

    setMWeeks(w);
    setMawi(activeWeek);
    setMResps(dbResponses);
  } catch (error) {
    console.error("Error cargando semanas desde Firebase:", error);

    let w = getWeeks(id);
    if (w.length === 0) {
      w = [newWeek(1)];
      saveWeeks(id, w);
    }

    const localActiveWeek = getAW(id);

    setMWeeks(w);
    setMawi(localActiveWeek);
    setMResps(getR(id, localActiveWeek));
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
    return (
      <div style={W}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <img src="/logo.png" alt="Sol Sempértegui" style={{height:100,objectFit:"contain",marginBottom:8}}/>
          <h2 style={{margin:0,fontSize:24,fontWeight:600,color:NAVY}}>Sol Sempértegui</h2>
          <p style={{margin:"6px 0 0",fontSize:14,color:CORAL,fontWeight:500}}>Entrenamiento Cerebral 6M</p>
          <p style={{margin:"2px 0 0",fontSize:13,color:"#888"}}>Tu entrenamiento cerebral personalizado</p>
        </div>
        <div style={C}>
          <p style={{fontSize:14,fontWeight:500,color:NAVY,margin:"0 0 14px",textAlign:"center"}}>Ingresa con correo y contraseña</p>

          <div style={{marginBottom:10}}>
            <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Correo electrónico</label>
            <input style={I} type="email" value={me} onChange={e=>setMe(e.target.value)} placeholder="tu correo electrónico"/>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Contraseña</label>
            <input style={I} type="password" value={mp} onChange={e=>setMp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doEmailLogin()} placeholder="••••••"/>
          </div>

          {le&&<p style={{color:CORAL,fontSize:13,margin:"0 0 12px"}}>{le}</p>}

          <button style={{...PB(),width:"100%"}} onClick={doEmailLogin}>Ingresar</button>
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
                <button key={i} style={WB(awi===i,isWDone(weeks,i,user.id))} onClick={async () => {
                  setAwi(i);
                  setDay(0);
                  try {
                    const dbResponses = await getResponsesFromDB(user.id, i);
                    setResps(dbResponses);
                  } catch (error) {
                    console.error("Error cargando respuestas de la semana:", error);
                    setResps(getR(user.id, i));
                  }
                }}>
                  S{i+1}{isWDone(weeks,i,user.id)?" ✓":""}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.25rem"}}>
          {week.days.map((d,i)=>{
            const done=d.exercises.length>0&&d.exercises.every((_,ei)=>resps[i]&&resps[i][ei]);
            return <button key={i} style={DB(day===i)} onClick={()=>setDay(i)}>{`Día ${i + 1}`}{done?" ✓":""}</button>;
          })}
        </div>
        <h3 style={{fontSize:15,fontWeight:500,color:NAVY,margin:"0 0 1rem"}}>{`Día ${day + 1}`}</h3>
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
              />
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
            <div style={{marginBottom:14}}>
              <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Correo del mentee</label>
              <input style={I} value={ne} onChange={e=>setNe(e.target.value)} placeholder="Ej: ana@gmail.com"/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:13,color:"#666",display:"block",marginBottom:4}}>Contraseña temporal sugerida</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input style={{...I,flex:1,minWidth:180}} value={np} onChange={e=>setNp(e.target.value)} />
                <button style={OB(NAVY,{fontSize:12})} onClick={()=>setNp(generateTempPassword())}>Generar otra</button>
                <button style={OB(CORAL,{fontSize:12})} onClick={async()=>{
                  try {
                    await navigator.clipboard.writeText(np);
                    setNadd("Contraseña copiada.");
                  } catch {
                    setNadd("Copia la contraseña manualmente.");
                  }
                }}>Copiar</button>
              </div>
            </div>
            <p style={{fontSize:12,color:"#888",margin:"0 0 16px",lineHeight:1.5}}>
              Esta contraseña no se guarda aquí. Crea el usuario en Firebase Authentication con el mismo correo y esta contraseña temporal.
            </p>
            {createdInfo&&(
              <div style={{background:"#E8F5E9",border:"0.5px solid #A5D6A7",borderRadius:8,padding:"12px",marginBottom:14}}>
                <p style={{fontSize:13,fontWeight:500,color:"#2E7D32",margin:"0 0 8px"}}>Mentee creado. Ahora crea su acceso en Firebase Authentication:</p>
                <p style={{fontSize:13,margin:"3px 0"}}>Nombre: {createdInfo.name}</p>
                <p style={{fontSize:13,margin:"3px 0"}}>Correo: {createdInfo.email}</p>
                <p style={{fontSize:13,margin:"3px 0"}}>Contraseña temporal: {createdInfo.password}</p>
              </div>
            )}
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
                  <button key={i} style={WB(mawi===i,isWDone(mWeeks,i,selId))} onClick={async () => {
                    setMawi(i);
                    setMDay(0);
                    setSTab("resp");
                    try {
                      const dbResponses = await getResponsesFromDB(selId, i);
                      setMResps(dbResponses);
                    } catch (error) {
                      console.error("Error cargando respuestas para mentora:", error);
                      setMResps(getR(selId, i));
                    }
                  }}>
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
                  {curW.days.map((d,i)=><button key={i} style={DB(mDay===i)} onClick={()=>setMDay(i)}>{`Día ${i + 1}`}</button>)}
                </div>
                {curW.days[mDay].exercises.length===0
                  ?<div style={{...C,textAlign:"center",color:"#888"}}>Día libre</div>
                  :curW.days[mDay].exercises.map((ex,ei)=>{
                    const tc=TAG_COLORS[ex.type]||["#eee","#555"];
                    const resp = mResps[mDay] ? mResps[mDay][ei] : null;
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
