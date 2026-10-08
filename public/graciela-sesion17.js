import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const NAVY="#0f243e", CORAL="#dd6d60", BEIGE="#d6c7b1";
const ADMIN_EMAIL="solsempp@gmail.com", TARGET_EMAIL="gracyromero3@gmail.com";
const WEEK_INDEX="15";

const firebaseConfig={
  apiKey:"AIzaSyDyLvINfBA1oqedb_yHNxq4LR7WBmLVZNc",
  authDomain:"entrenamiento-cerebral.firebaseapp.com",
  projectId:"entrenamiento-cerebral",
  storageBucket:"entrenamiento-cerebral.firebasestorage.app",
  messagingSenderId:"121258466683",
  appId:"1:121258466683:web:880ec318374158c1a771de",
  measurementId:"G-MLP3DKV4HG"
};
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);

function normalize(value=""){
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}
function hasAll(value, parts){
  const n=normalize(value);
  return parts.every(p=>n.includes(normalize(p)));
}
function hasNone(value, parts){
  const n=normalize(value);
  return parts.every(p=>!n.includes(normalize(p)));
}
function timeMatches(value, options){
  const n=normalize(value).replace(/\s/g,"");
  return options.some(o=>n.includes(o.replace(/\s/g,"")));
}
function esc(value=""){
  return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
}
function fmt(sec){
  sec=Math.max(0,Number(sec||0));
  return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
}

const rounds={
  A:{
    title:"Ronda A · Escribir sin reloj",
    subtitle:"Primero medimos qué pasa al escribir cuando no ves ningún timer.",
    kind:"quiz",
    visibleTimer:false,
    strategy:false,
    questions:[
      {
        q:"Una cita estaba programada para el miércoles a las 11:40. La cambiaron 35 minutos más temprano. Escribe el día y la nueva hora de la cita.",
        expected:"Miércoles 11:05",
        check:v=>hasAll(v,["miercoles"])&&timeMatches(v,["11:05","1105"])
      },
      {
        q:"La instrucción dice: “Responde únicamente las preguntas 1, 3 y 5. La pregunta 2 es opcional y la pregunta 4 no debe responderse.” Escribe cuáles preguntas debes responder obligatoriamente.",
        expected:"1, 3 y 5",
        check:v=>hasAll(v,["1","3","5"])&&hasNone(v,["2","4"])
      },
      {
        q:"Natalia guardó el pasaporte dentro de su bolso negro y dejó las llaves sobre la mesa del comedor. Escribe dónde están las llaves.",
        expected:"Sobre la mesa del comedor",
        check:v=>normalize(v).includes("mesa")&&normalize(v).includes("comedor")
      },
      {
        q:"El tren sale a las 16:25. Debes estar en la estación 20 minutos antes y tardas 35 minutos en llegar. Escribe a qué hora debes salir de casa.",
        expected:"15:30",
        check:v=>timeMatches(v,["15:30","1530","3:30","330"])
      }
    ]
  },
  B:{
    title:"Ronda B · Entrenar la secuencia",
    subtitle:"Aquí no buscamos rapidez. Entrenamos el orden mental antes de responder.",
    kind:"guided",
    visibleTimer:false,
    strategy:true,
    questions:[
      {
        q:"Una cita era el martes a las 10:15. La movieron 20 minutos más tarde. Escribe el día y la nueva hora.",
        expected:"Martes 10:35",
        check:v=>hasAll(v,["martes"])&&timeMatches(v,["10:35","1035"])
      },
      {
        q:"Debes entregar un documento de identidad, una foto y un formulario firmado. Ya tienes el documento y la foto. Escribe qué falta preparar y qué debes hacer antes de entregarlo.",
        expected:"Falta el formulario y debe estar firmado",
        check:v=>normalize(v).includes("formulario")&&(normalize(v).includes("firm")||normalize(v).includes("firma"))
      }
    ]
  },
  C:{
    title:"Ronda C · Escribir con reloj visible",
    subtitle:"Misma habilidad, ahora con timer. La prioridad sigue siendo precisión, no velocidad.",
    kind:"quiz",
    visibleTimer:true,
    globalSeconds:240,
    strategy:true,
    questions:[
      {
        q:"Una consulta estaba agendada para el viernes a las 15:20. La cambiaron 50 minutos más tarde. Escribe el día y la nueva hora.",
        expected:"Viernes 16:10",
        check:v=>hasAll(v,["viernes"])&&timeMatches(v,["16:10","1610","4:10","410"])
      },
      {
        q:"La indicación dice: “Entrega únicamente las secciones 2 y 4. La sección 1 es opcional y la sección 3 no debe entregarse.” Escribe cuáles secciones debes entregar obligatoriamente.",
        expected:"2 y 4",
        check:v=>hasAll(v,["2","4"])&&hasNone(v,["1","3"])
      },
      {
        q:"Lucas dejó su mochila dentro del automóvil y puso el teléfono sobre el mesón de la cocina. Escribe dónde está el teléfono.",
        expected:"Sobre el mesón de la cocina",
        check:v=>(normalize(v).includes("meson")||normalize(v).includes("mesón"))&&normalize(v).includes("cocina")
      },
      {
        q:"Una reunión comienza a las 9:50. Debes llegar 15 minutos antes y tardas 25 minutos en llegar. Escribe a qué hora debes salir.",
        expected:"9:10",
        check:v=>timeMatches(v,["9:10","910","09:10","0910"])
      }
    ]
  },
  D:{
    title:"Ronda D · Llevarlo a la vida real",
    subtitle:"Aplicamos la misma secuencia a una instrucción real de esta semana.",
    kind:"transfer",
    visibleTimer:false,
    strategy:true
  }
};

let menteeId=null;
let currentUser=null;
let roundKey=(new URLSearchParams(location.search).get("round")||"HOME").toUpperCase();
let index=0, logs=[], questionStart=0, pressure=null, remaining=null, timerHandle=null;

const root=document.getElementById("root");

const style=`
<style>
*{box-sizing:border-box}
body{margin:0;background:#f7f4ef;color:#202733;font-family:Arial,Helvetica,sans-serif}
.wrap{max-width:820px;margin:0 auto;padding:24px 16px 52px}
.hero{background:${NAVY};color:#fff;border-radius:18px;padding:24px;margin-bottom:16px}
.hero h1{margin:0 0 8px;font-size:27px}.hero p{margin:0;line-height:1.5}
.card{background:#fff;border-radius:18px;padding:22px;margin:16px 0;box-shadow:0 4px 18px rgba(0,0,0,.07)}
.strategy{background:#fff8f6;border:2px solid ${CORAL};border-radius:14px;padding:14px;margin:14px 0;text-align:center;font-weight:800;color:${NAVY};line-height:1.6}
button,.btn{border:0;border-radius:12px;padding:12px 16px;font-size:16px;cursor:pointer;background:${NAVY};color:#fff;text-decoration:none;display:inline-block}
button.secondary,.secondary{background:${CORAL}} button:disabled{opacity:.5;cursor:not-allowed}
.grid{display:grid;gap:10px}.homeBtn{display:block;width:100%;text-align:left;padding:16px;margin:8px 0}
.homeBtn small{display:block;margin-top:4px;opacity:.8;font-size:13px}
.question{font-size:21px;font-weight:700;line-height:1.5;margin:18px 0}
textarea{width:100%;min-height:105px;border:1px solid #cfd4da;border-radius:12px;padding:14px;font-size:17px;resize:vertical}
label{display:block;font-size:13px;color:#667085;margin:14px 0 6px}
.timer{text-align:center;font-size:54px;font-weight:800;color:${NAVY};font-variant-numeric:tabular-nums;margin:10px 0}
.timer.warning{color:${CORAL}} .muted{font-size:13px;color:#667085}
.progress{font-size:14px;color:#667085}.hidden{display:none}
.scale{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.scale button{width:42px;height:42px;padding:0;background:#fff;color:${NAVY};border:1px solid #cfd4da}.scale button.selected{background:${CORAL};color:#fff;border-color:${CORAL}}
.ok{background:#eaf7f0;color:#196c4c;border-radius:10px;padding:12px 14px}
.warn{background:#fff4e5;color:#8a4b08;border-radius:10px;padding:12px 14px}
.result{background:#f6f7f9;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:14px;line-height:1.45}
@media(max-width:600px){.hero h1{font-size:23px}.question{font-size:19px}.timer{font-size:46px}}
</style>`;

function home(){
  root.innerHTML=style+`
  <div class="wrap">
    <section class="hero"><h1>Graciela · Sesión 17</h1><p>Entrenamiento guiado de precisión bajo carga.</p></section>
    <section class="card">
      <p><strong>Orden de hoy:</strong> A → B → C → D.</p>
      <a class="btn homeBtn" href="?round=A">Ronda A · Escribir sin reloj<small>Medimos producción escrita sin presión temporal visible.</small></a>
      <a class="btn homeBtn" href="?round=B">Ronda B · Entrenar la secuencia<small>LEE → ¿QUÉ ME PIDE? → RESPONDE → REVISA.</small></a>
      <a class="btn homeBtn" href="?round=C">Ronda C · Escribir con reloj visible<small>Misma habilidad con 4 minutos globales.</small></a>
      <a class="btn homeBtn" href="?round=D">Ronda D · Vida real<small>Transferimos la secuencia a una instrucción real.</small></a>
      <div id="authStatus" class="muted" style="margin-top:14px">Comprobando sesión…</div>
    </section>
  </div>`;
}

function strategyBlock(){
  return `<div class="strategy">LEE → ¿QUÉ ME PIDE? → RESPONDE → REVISA</div>`;
}

function roundShell(round){
  root.innerHTML=style+`
  <div class="wrap">
    <section class="hero"><h1>${round.title}</h1><p>${round.subtitle}</p></section>
    <section id="intro" class="card">
      ${round.strategy?strategyBlock():""}
      <p class="muted">${round.visibleTimer?"El reloj será visible. Si llega a cero, termina la pregunta sin correr.":"No verás ningún reloj durante esta ronda."}</p>
      <button class="secondary" id="startBtn" disabled>Comenzar</button>
      <div id="authStatus" class="muted" style="margin-top:10px">Comprobando sesión…</div>
    </section>
    <section id="work" class="card hidden"></section>
    <section id="finish" class="card hidden"></section>
  </div>`;
}

function renderTransfer(){
  root.innerHTML=style+`
  <div class="wrap">
    <section class="hero"><h1>${rounds.D.title}</h1><p>${rounds.D.subtitle}</p></section>
    <section class="card">
      ${strategyBlock()}
      <label>1. Escribe o pega una instrucción real de esta semana</label>
      <textarea id="realInstruction" placeholder="Mensaje, cita, trámite, tarea, formulario, pendiente..."></textarea>
      <label>2. ¿Qué me pide exactamente?</label>
      <textarea id="realAsk" placeholder="Separa lo que te están pidiendo."></textarea>
      <label>3. ¿Qué voy a hacer o responder?</label>
      <textarea id="realAction" placeholder="Escribe la acción o respuesta concreta."></textarea>
      <label>4. Antes de terminar: ¿qué debo revisar?</label>
      <textarea id="realCheck" placeholder="¿Qué dato, paso o requisito podría omitir?"></textarea>
      <button class="secondary" id="saveTransfer" disabled>Guardar transferencia</button>
      <div id="authStatus" class="muted" style="margin-top:10px">Comprobando sesión…</div>
      <div id="transferStatus" style="margin-top:12px"></div>
      <div style="margin-top:18px"><a class="btn" href="?">Volver a las rondas</a></div>
    </section>
  </div>`;
}

async function resolveMentee(user){
  const snap=await getDocs(collection(db,"mentees"));
  const all=snap.docs.map(d=>({id:d.id,...d.data()}));
  const email=(user?.email||"").toLowerCase();
  if(email===TARGET_EMAIL) return all.find(m=>(m.email||"").toLowerCase()===TARGET_EMAIL);
  if(email===ADMIN_EMAIL) return all.find(m=>(m.email||"").toLowerCase()===TARGET_EMAIL);
  return null;
}

async function saveRound(key, payload){
  if(!menteeId) return;
  const ref=doc(db,"mentees",menteeId,"responses",WEEK_INDEX);
  const snap=await getDoc(ref);
  const prev=snap.exists()?(snap.data().session17||{}):{};
  await setDoc(ref,{session17:{...prev,[key]:payload},updatedAt:serverTimestamp()},{merge:true});
}

function avg(){
  return logs.length?logs.reduce((s,x)=>s+x.seconds,0)/logs.length:0;
}
function correctCount(){
  return logs.filter(x=>x.correct===true).length;
}
function updateTimer(){
  if(!rounds[roundKey]?.visibleTimer) return;
  const el=document.getElementById("timer");
  if(!el) return;
  el.textContent=fmt(remaining);
  el.classList.toggle("warning",remaining<=30);
}
function startTimer(){
  updateTimer();
  timerHandle=setInterval(()=>{
    remaining-=1;
    updateTimer();
    if(remaining<=0){
      clearInterval(timerHandle);timerHandle=null;
      const hint=document.getElementById("timerHint");
      if(hint) hint.textContent="El tiempo terminó. Termina esta pregunta sin correr.";
    }
  },1000);
}

function startRound(){
  const round=rounds[roundKey];
  index=0;logs=[];pressure=null;
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("work").classList.remove("hidden");
  if(round.visibleTimer){remaining=round.globalSeconds;startTimer();}
  loadQuestion();
}

function loadQuestion(){
  const round=rounds[roundKey], item=round.questions[index];
  const work=document.getElementById("work");
  work.innerHTML=`
    <div class="progress">Pregunta ${index+1} de ${round.questions.length}</div>
    ${round.visibleTimer?'<div id="timer" class="timer"></div><div id="timerHint" class="muted"></div>':""}
    ${round.strategy?strategyBlock():""}
    <div class="question">${esc(item.q)}</div>
    ${round.kind==="guided"?'<label>Antes de responder: ¿qué te está pidiendo exactamente?</label><textarea id="asked" placeholder="Escríbelo en una frase breve."></textarea>':""}
    <label>Tu respuesta</label>
    <textarea id="answer" placeholder="Escribe tu respuesta aquí..."></textarea>
    <button class="secondary" id="nextBtn" disabled>Guardar y siguiente</button>
    <div id="saveHint" class="muted" style="margin-top:10px"></div>`;
  if(round.visibleTimer) updateTimer();
  const answer=document.getElementById("answer");
  const asked=document.getElementById("asked");
  const checkEnable=()=>{
    document.getElementById("nextBtn").disabled=!(answer.value.trim() && (!asked || asked.value.trim()));
  };
  answer.addEventListener("input",checkEnable);
  if(asked) asked.addEventListener("input",checkEnable);
  document.getElementById("nextBtn").addEventListener("click",submitAnswer);
  questionStart=performance.now();
}

async function submitAnswer(){
  const round=rounds[roundKey], item=round.questions[index];
  const answer=document.getElementById("answer").value.trim();
  const asked=document.getElementById("asked")?.value.trim()||null;
  const seconds=Number(((performance.now()-questionStart)/1000).toFixed(1));
  logs.push({
    question:index+1,
    answer,
    whatAsked:asked,
    expected:item.expected,
    correct:Boolean(item.check(answer)),
    seconds,
    remainingSeconds:round.visibleTimer?Math.max(0,remaining):null
  });
  document.getElementById("nextBtn").disabled=true;
  document.getElementById("saveHint").textContent="Guardando…";
  await saveRound(roundKey,{
    status:"EN CURSO",
    completedQuestions:logs.length,
    total:round.questions.length,
    correct:correctCount(),
    averageSeconds:Number(avg().toFixed(1)),
    pressure,
    visibleTimer:round.visibleTimer,
    remainingSeconds:round.visibleTimer?Math.max(0,remaining):null,
    logs,
    updatedAt:new Date().toLocaleString("es-EC")
  });
  index+=1;
  if(index>=round.questions.length){
    if(timerHandle){clearInterval(timerHandle);timerHandle=null;}
    document.getElementById("work").classList.add("hidden");
    showFinish();
  } else loadQuestion();
}

function showFinish(){
  const round=rounds[roundKey], finish=document.getElementById("finish");
  finish.classList.remove("hidden");
  finish.innerHTML=`
    <h2>Terminaste esta ronda</h2>
    <p><strong>¿Cuánto aturdimiento o presión sentiste?</strong></p>
    <div id="scale" class="scale"></div>
    <p class="muted">0 = nada · 10 = muchísimo</p>
    <div id="summary"></div>
    <div id="finalStatus" class="muted">Selecciona un número para guardar el resultado final.</div>`;
  const scale=document.getElementById("scale");
  for(let n=0;n<=10;n++){
    const b=document.createElement("button");b.textContent=String(n);
    b.addEventListener("click",async()=>{
      pressure=n;
      [...scale.children].forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
      const summary=document.getElementById("summary");
      summary.innerHTML=`
        <div class="result"><strong>Resultado:</strong> ${correctCount()}/${round.questions.length} correctas · promedio ${avg().toFixed(1)} s por respuesta · aturdimiento ${pressure}/10</div>
        ${logs.map(x=>`<div class="result">P${x.question} ${x.correct?"✓":"✗"} · ${x.seconds.toFixed(1)} s<br><strong>Respondió:</strong> ${esc(x.answer)}${x.correct?"":`<br><strong>Esperada:</strong> ${esc(x.expected)}`}${x.whatAsked?`<br><strong>Identificó que le pedían:</strong> ${esc(x.whatAsked)}`:""}</div>`).join("")}`;
      const status=document.getElementById("finalStatus");
      status.className="warn";status.textContent="Guardando resultado final…";
      await saveRound(roundKey,{
        status:"COMPLETA",
        completedQuestions:logs.length,
        total:round.questions.length,
        correct:correctCount(),
        accuracyPercent:Math.round(correctCount()/round.questions.length*100),
        averageSeconds:Number(avg().toFixed(1)),
        pressure,
        visibleTimer:round.visibleTimer,
        timerExpired:round.visibleTimer?remaining<=0:false,
        remainingSeconds:round.visibleTimer?Math.max(0,remaining):null,
        logs,
        updatedAt:new Date().toLocaleString("es-EC")
      });
      status.className="ok";
      const next=roundKey==="A"?"B":roundKey==="B"?"C":roundKey==="C"?"D":"HOME";
      status.innerHTML=`✓ Guardado. <a href="${next==="HOME"?"?":"?round="+next}">Continuar →</a>`;
    });
    scale.appendChild(b);
  }
}

function bindTransfer(){
  const ids=["realInstruction","realAsk","realAction","realCheck"];
  const btn=document.getElementById("saveTransfer");
  const update=()=>{btn.disabled=!ids.every(id=>document.getElementById(id).value.trim());};
  ids.forEach(id=>document.getElementById(id).addEventListener("input",update));
  btn.addEventListener("click",async()=>{
    const payload={
      status:"COMPLETA",
      instruction:document.getElementById("realInstruction").value.trim(),
      whatAsked:document.getElementById("realAsk").value.trim(),
      action:document.getElementById("realAction").value.trim(),
      finalCheck:document.getElementById("realCheck").value.trim(),
      updatedAt:new Date().toLocaleString("es-EC")
    };
    const st=document.getElementById("transferStatus");st.className="warn";st.textContent="Guardando…";
    await saveRound("D",payload);
    st.className="ok";st.textContent="✓ Transferencia guardada.";
  });
}

if(roundKey==="HOME") home();
else if(rounds[roundKey]?.kind==="transfer"){renderTransfer();bindTransfer();}
else if(rounds[roundKey]) roundShell(rounds[roundKey]);
else {roundKey="HOME";home();}

onAuthStateChanged(auth,async user=>{
  currentUser=user;
  const status=document.getElementById("authStatus");
  try{
    if(!user){status.textContent="Entra primero a la app y vuelve a abrir esta página.";return;}
    const mentee=await resolveMentee(user);
    if(!mentee){status.textContent="Esta práctica está disponible solo para Graciela o para Sol como mentora.";return;}
    menteeId=mentee.id;
    status.textContent=(user.email||"").toLowerCase()===ADMIN_EMAIL
      ?"Modo mentora: los resultados se guardarán en el perfil de Graciela."
      :"Lista. Tus resultados se guardarán automáticamente.";
    const start=document.getElementById("startBtn");if(start) start.disabled=false;
    const transfer=document.getElementById("saveTransfer");if(transfer){
      const ids=["realInstruction","realAsk","realAction","realCheck"];
      transfer.disabled=!ids.every(id=>document.getElementById(id).value.trim());
    }
  }catch(e){
    console.error(e);
    if(status) status.textContent="No pude conectar la práctica con el perfil de Graciela.";
  }
});

if(document.getElementById("startBtn")) document.getElementById("startBtn").addEventListener("click",startRound);
