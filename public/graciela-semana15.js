import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const NAVY = "#0f243e";
const CORAL = "#dd6d60";
const BEIGE = "#d6c7b1";

const VIDEO_1 = "https://drive.google.com/file/d/1VTmSAZtDOOYJvuYbQzEsz_hMswvCXAqN/view?usp=drivesdk";
const VIDEO_2 = "https://drive.google.com/file/d/1k39TrT1QsbMJlA9-rAhlgaV8sLQRYw36/view?usp=drivesdk";

const firebaseConfig = {
  apiKey: "AIzaSyDyLvINfBA1oqedb_yHNxq4LR7WBmLVZNc",
  authDomain: "entrenamiento-cerebral.firebaseapp.com",
  projectId: "entrenamiento-cerebral",
  storageBucket: "entrenamiento-cerebral.firebasestorage.app",
  messagingSenderId: "121258466683",
  appId: "1:121258466683:web:880ec318374158c1a771de",
  measurementId: "G-MLP3DKV4HG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const dayNumber = Number(document.body.dataset.trainingDay || "1");
const dayIndexMap = { 1: 0, 2: 2, 3: 4 };
const dayIndex = dayIndexMap[dayNumber] ?? 0;
const weekIndex = 14;
const exerciseIndex = 0;

const training = {
  1: {
    title: "Día 1 · Timer y lectura completa",
    subtitle: "Presión moderada. Lee toda la consigna antes de responder.",
    mode: "perQuestion",
    seconds: 30,
    questions: [
      { q: "Una cita estaba programada para las 3:40. La cambiaron 35 minutos más tarde. ¿A qué hora quedó finalmente?", a: ["4:05", "4:15", "4:25"], c: 1 },
      { q: "Claudia debe llevar pasaporte, cuaderno y lápiz. Ya guardó el cuaderno y el lápiz. ¿Qué objeto todavía necesita llevar?", a: ["Pasaporte", "Cuaderno", "Lápiz"], c: 0 },
      { q: "Un curso tiene clases lunes, miércoles y viernes. Esta semana la clase del miércoles fue cancelada. ¿Cuál es la próxima clase después del lunes?", a: ["Martes", "Miércoles", "Viernes"], c: 2 },
      { q: "Elena tenía 24 euros. Compró un cuaderno de 7 euros y luego recibió 5 euros. ¿Cuánto dinero tiene ahora?", a: ["12 euros", "22 euros", "26 euros"], c: 1 },
      { q: "La profesora dijo: «No entreguen el ejercicio 4; entreguen únicamente los ejercicios 1, 2 y 3». ¿Cuál ejercicio NO debes entregar?", a: ["1", "3", "4"], c: 2 },
      { q: "La reunión empieza a las 10:20. Debes llegar 15 minutos antes y tardas 25 minutos en llegar. ¿A qué hora debes salir?", a: ["9:40", "9:55", "10:05"], c: 0 }
    ]
  },
  2: {
    title: "Día 2 · Timer con distractores",
    subtitle: "Hoy aumenta un poco la dificultad: negaciones, información extra y más de un paso.",
    mode: "perQuestion",
    seconds: 25,
    questions: [
      { q: "En una prueba hay 20 preguntas. Ya respondiste 12 y marcaste 2 de esas 12 para revisar después. ¿Cuántas preguntas todavía NO has respondido?", a: ["6", "8", "10"], c: 1 },
      { q: "La instrucción dice: «Marca todas las palabras relacionadas con comida, excepto las bebidas». ¿Cuál NO deberías marcar?", a: ["Pan", "Leche", "Arroz"], c: 1 },
      { q: "Una clase empieza a las 8:45 y termina a las 9:35. Hubo una pausa de 10 minutos dentro de la clase. ¿Cuánto tiempo total pasó desde que empezó hasta que terminó?", a: ["40 minutos", "50 minutos", "60 minutos"], c: 1 },
      { q: "María debe enviar primero el formulario y después hacer el pago. Ya realizó el pago, pero no ha enviado el formulario. ¿Qué paso sigue pendiente?", a: ["Enviar el formulario", "Hacer el pago", "Ninguno"], c: 0 },
      { q: "La profesora cambió la fecha del examen del jueves al martes siguiente. Hoy es miércoles. ¿El examen es mañana?", a: ["Sí", "No"], c: 1 },
      { q: "Estudiaste 30 minutos de vocabulario y 20 minutos de lectura. Después descansaste 15 minutos. ¿Cuánto tiempo estudiaste en total, sin contar el descanso?", a: ["35 minutos", "50 minutos", "65 minutos"], c: 1 }
    ]
  },
  3: {
    title: "Día 3 · Mini simulación",
    subtitle: "El tiempo corre de forma global. Una pregunta a la vez.",
    mode: "global",
    seconds: 180,
    questions: [
      { q: "El correo dice: «La cita NO será el martes. Fue reprogramada para el jueves a las 14:30». ¿Cuándo debes asistir?", a: ["Martes 14:30", "Jueves 14:30", "Jueves 13:30"], c: 1 },
      { q: "Tienes que completar 4 actividades. Ya terminaste la 1 y la 3. ¿Cuáles siguen pendientes?", a: ["2 y 4", "1 y 4", "2 y 3"], c: 0 },
      { q: "Para aprobar necesitas al menos 70 puntos. Obtuviste 68 y luego te añadieron 5 puntos de una actividad pendiente. ¿Alcanzas el mínimo?", a: ["Sí", "No"], c: 0 },
      { q: "La consigna dice: «Lee el texto y responde SOLO las dos últimas preguntas». Hay cinco preguntas. ¿Cuáles debes responder?", a: ["1 y 2", "2 y 3", "4 y 5"], c: 2 },
      { q: "Tu tren sale a las 16:10. Debes estar allí 20 minutos antes y tardas 35 minutos en llegar. ¿A qué hora debes salir?", a: ["15:15", "15:35", "15:50"], c: 0 },
      { q: "Un ejercicio pide seleccionar la opción que NO corresponde. Las opciones son: enero, marzo, lunes, julio. ¿Cuál debes seleccionar?", a: ["Enero", "Lunes", "Julio"], c: 1 },
      { q: "El examen dura 25 minutos. Han pasado 17 minutos y te faltan 3 preguntas. ¿Cuántos minutos quedan?", a: ["6", "8", "12"], c: 1 },
      { q: "La instrucción dice: «Escucha dos veces antes de responder». Ya escuchaste una vez. ¿Qué debes hacer ahora?", a: ["Responder ya", "Escuchar una vez más", "Pasar a la siguiente"], c: 1 }
    ]
  }
}[dayNumber];

let currentUser = null;
let menteeId = null;
let index = 0;
let score = 0;
let remaining = training.seconds;
let interval = null;
let answered = false;
let questionStart = 0;
let responseTimes = [];
let timeoutCount = 0;
let answersLog = [];
let stress = null;

const root = document.getElementById("root");

root.innerHTML = `
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#f7f4ef;color:#202733;font-family:Arial,Helvetica,sans-serif}
    .wrap{max-width:860px;margin:0 auto;padding:22px 16px 48px}
    .hero{background:${NAVY};color:white;border-radius:18px;padding:26px;margin-bottom:16px}
    .hero h1{margin:0 0 8px;font-size:28px}.hero p{margin:0;line-height:1.5}
    .card{background:#fff;border-radius:18px;padding:22px;margin:16px 0;box-shadow:0 4px 18px rgba(0,0,0,.07)}
    .breath{padding:13px 16px;background:#f5f1ea;border-left:6px solid ${BEIGE};border-radius:10px;line-height:1.55}
    .focus{padding:16px;background:#fbf8f3;border:1px solid ${BEIGE};border-radius:12px;line-height:1.55;margin-top:14px}
    .rule{text-align:center;font-size:21px;font-weight:800;border:2px solid ${CORAL};background:#fff7f5;border-radius:14px;padding:14px;margin:16px 0}
    .videos{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
    button,.btn{border:0;border-radius:12px;padding:12px 16px;font-size:16px;cursor:pointer;background:${NAVY};color:#fff;text-decoration:none;display:inline-block}
    .secondary{background:${CORAL}} .ghost{background:#eceff2;color:${NAVY}}
    button:disabled{opacity:.5;cursor:not-allowed}
    .hidden{display:none}.timer{text-align:center;font-size:58px;font-weight:800;color:${NAVY};font-variant-numeric:tabular-nums;margin:8px 0 14px}.timer.warning{color:${CORAL}}
    .question{font-size:23px;font-weight:700;line-height:1.45;margin:18px 0}.answers{display:grid;gap:10px}
    .answer{background:#f3f5f7;color:#202733;text-align:left;border:2px solid transparent}.answer.correct{background:#eaf7f0;border-color:#196c4c;color:#196c4c}.answer.wrong{background:#fbecec;border-color:#a23838;color:#a23838}
    .feedback{font-weight:700;min-height:24px;margin-top:14px}.progress,.mini{font-size:14px;color:#667085}
    .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0}.stat{background:#f5f6f8;border-radius:12px;padding:14px;text-align:center}.stat b{display:block;font-size:24px;color:${NAVY}}
    .stress{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.stress button{width:42px;height:42px;padding:0;background:#fff;color:${NAVY};border:1px solid #cfd4da}.stress button.selected{background:${CORAL};color:#fff;border-color:${CORAL};font-weight:700}
    .status{padding:12px 14px;border-radius:10px;margin-top:12px;font-size:14px}.ok{background:#eaf7f0;color:#196c4c}.err{background:#fbecec;color:#a23838}
    @media(max-width:600px){.question{font-size:20px}.timer{font-size:48px}.hero h1{font-size:23px}}
  </style>
  <div class="wrap">
    <section class="hero"><h1>${training.title}</h1><p>${training.subtitle}</p></section>

    <section id="intro" class="card">
      <div class="breath"><strong>1. Respira antes de empezar</strong><br>Haz 3 respiraciones lentas: inhala 4 segundos y exhala 6 segundos. <strong>No retengas el aire.</strong></div>

      <div class="focus">
        <strong>2. Haz los dos ejercicios de enfoque</strong>
        <p>Primero abre el <strong>Video 2</strong>: ahí están las instrucciones. Después deja abiertos los dos videos para hacer el entrenamiento.</p>
        <div class="videos">
          <a class="btn" href="${VIDEO_1}" target="_blank" rel="noreferrer">Abrir Video 1</a>
          <a class="btn secondary" href="${VIDEO_2}" target="_blank" rel="noreferrer">Abrir Video 2 · instrucciones</a>
        </div>
        <p><strong>Tiempo:</strong> los dos ejercicios juntos deben durar <strong>máximo 5 minutos en total</strong>. No son 5 minutos cada uno.</p>
        <p><strong>Para cambiar rápido de un video al otro:</strong><br>
        • Si están en <strong>ventanas distintas</strong>: mantén presionada la tecla <strong>Alt</strong>, toca <strong>Tab</strong> una vez y suelta las dos teclas. Para volver, repite <strong>Alt + Tab</strong>.<br>
        • Si quedaron como <strong>dos pestañas del mismo navegador</strong>: usa <strong>Ctrl + Tab</strong>.</p>
      </div>

      <div class="rule">LEE COMPLETO ANTES DE RESPONDER</div>
      <p class="mini">Cuando termines los ejercicios de enfoque, vuelve aquí. Durante las preguntas no tendrás que registrar nada: solo leer completa y responder.</p>
      <button class="secondary" id="startBtn">Ya terminé el enfoque · Empezar timer</button>
      <div id="authStatus" class="mini" style="margin-top:10px">Comprobando tu sesión…</div>
    </section>

    <section id="quiz" class="card hidden">
      <div class="progress" id="progress"></div>
      <div class="timer" id="timer"></div>
      <div class="question" id="question"></div>
      <div class="answers" id="answers"></div>
      <div class="feedback" id="feedback"></div>
      <div class="row"><button class="secondary" id="nextBtn" disabled>Siguiente</button></div>
    </section>

    <section id="result" class="card hidden">
      <h2>Terminaste</h2>
      <div class="stats">
        <div class="stat"><b id="correctStat">0/0</b>Correctas</div>
        <div class="stat"><b id="avgStat">0 s</b>Tiempo promedio</div>
        <div class="stat"><b id="timeoutStat">0</b>Fuera de tiempo</div>
      </div>
      <p><strong>Durante esta práctica, ¿cuánto te aturdió o presionó el timer?</strong></p>
      <div class="stress" id="stressButtons"></div>
      <p class="mini">0 = nada · 10 = muchísimo</p>
      <button class="secondary" id="saveBtn" disabled>Guardar resultado</button>
      <div id="saveStatus"></div>
    </section>
  </div>
`;

const $ = (id) => document.getElementById(id);

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) {
    $("authStatus").textContent = "No encuentro tu sesión. Vuelve a la app, inicia sesión y abre este entrenamiento desde allí.";
    $("startBtn").disabled = true;
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "mentees"));
    const cleanEmail = (user.email || "").toLowerCase();
    const mentee = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .find((m) => (m.email || "").toLowerCase() === cleanEmail);

    if (!mentee) throw new Error("No se encontró el perfil del mentee.");
    menteeId = mentee.id;
    $("authStatus").textContent = "Sesión lista. Tus resultados se guardarán automáticamente al final.";
    $("startBtn").disabled = false;
  } catch (error) {
    console.error(error);
    $("authStatus").textContent = "No pude conectar este ejercicio con tu perfil. Vuelve a intentarlo desde la app.";
    $("startBtn").disabled = true;
  }
});

function fmt(sec) {
  sec = Math.max(0, sec);
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function updateTimer() {
  $("timer").textContent = fmt(remaining);
  $("timer").classList.toggle("warning", remaining <= (training.mode === "global" ? 30 : 7));
}

function startTimer() {
  clearInterval(interval);
  updateTimer();
  interval = setInterval(() => {
    remaining -= 1;
    updateTimer();
    if (remaining <= 0) {
      clearInterval(interval);
      interval = null;
      $("feedback").textContent = "El tiempo terminó. Termina esta pregunta sin correr.";
    }
  }, 1000);
}

function startPractice() {
  if (!menteeId) return;
  index = 0;
  score = 0;
  remaining = training.seconds;
  responseTimes = [];
  timeoutCount = 0;
  answersLog = [];
  stress = null;
  $("intro").classList.add("hidden");
  $("quiz").classList.remove("hidden");
  if (training.mode === "global") startTimer();
  loadQuestion();
}

function loadQuestion() {
  answered = false;
  $("feedback").textContent = "";
  $("nextBtn").disabled = true;

  if (training.mode === "perQuestion") {
    remaining = training.seconds;
    startTimer();
  }

  const item = training.questions[index];
  $("progress").textContent = `Pregunta ${index + 1} de ${training.questions.length}`;
  $("question").textContent = item.q;
  $("answers").innerHTML = "";

  item.a.forEach((txt, answerIndex) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.textContent = txt;
    button.addEventListener("click", () => chooseAnswer(answerIndex, button));
    $("answers").appendChild(button);
  });

  questionStart = performance.now();
}

function chooseAnswer(answerIndex, button) {
  if (answered) return;
  answered = true;

  const elapsed = (performance.now() - questionStart) / 1000;
  const item = training.questions[index];
  const isCorrect = answerIndex === item.c;
  const timedOut = remaining <= 0;

  responseTimes.push(elapsed);
  if (timedOut) timeoutCount += 1;
  answersLog.push({
    question: index + 1,
    selected: answerIndex,
    correctAnswer: item.c,
    correct: isCorrect,
    responseSeconds: Number(elapsed.toFixed(1)),
    timedOut
  });

  if (training.mode === "perQuestion") {
    clearInterval(interval);
    interval = null;
  }

  const buttons = [...document.querySelectorAll(".answer")];
  if (isCorrect) {
    score += 1;
    button.classList.add("correct");
    $("feedback").textContent = "Correcto.";
  } else {
    button.classList.add("wrong");
    buttons[item.c].classList.add("correct");
    $("feedback").textContent = "Vuelve a leer completa la pregunta antes de continuar.";
  }

  $("nextBtn").disabled = false;
}

function nextQuestion() {
  index += 1;
  if (index >= training.questions.length) finishPractice();
  else loadQuestion();
}

function finishPractice() {
  clearInterval(interval);
  interval = null;
  $("quiz").classList.add("hidden");
  $("result").classList.remove("hidden");

  const avg = responseTimes.length
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  $("correctStat").textContent = `${score}/${training.questions.length}`;
  $("avgStat").textContent = `${avg.toFixed(1)} s`;
  $("timeoutStat").textContent = training.mode === "global" ? (remaining <= 0 ? "Sí" : "No") : String(timeoutCount);

  const stressBox = $("stressButtons");
  stressBox.innerHTML = "";
  for (let n = 0; n <= 10; n += 1) {
    const b = document.createElement("button");
    b.textContent = String(n);
    b.addEventListener("click", () => {
      stress = n;
      [...stressBox.querySelectorAll("button")].forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      $("saveBtn").disabled = false;
    });
    stressBox.appendChild(b);
  }
}

async function saveResult() {
  if (!menteeId || stress === null) return;
  $("saveBtn").disabled = true;
  $("saveStatus").className = "status";
  $("saveStatus").textContent = "Guardando…";

  const avg = responseTimes.length
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const summary = `Timer Semana 15 · Día ${dayNumber}: ${score}/${training.questions.length} correctas · promedio ${avg.toFixed(1)} s · fuera de tiempo ${training.mode === "global" ? (remaining <= 0 ? "sí" : "no") : timeoutCount} · aturdimiento ${stress}/10`;

  const value = {
    text: summary,
    timerMetrics: {
      trainingDay: dayNumber,
      mode: training.mode,
      correct: score,
      total: training.questions.length,
      accuracyPercent: Math.round((score / training.questions.length) * 100),
      averageResponseSeconds: Number(avg.toFixed(1)),
      timeoutCount: training.mode === "global" ? (remaining <= 0 ? 1 : 0) : timeoutCount,
      stressAfter: stress,
      answers: answersLog
    },
    at: new Date().toLocaleString("es-EC")
  };

  try {
    const ref = doc(db, "mentees", menteeId, "responses", String(weekIndex));
    const snap = await getDoc(ref);
    const currentResponses = snap.exists() ? (snap.data().responses || {}) : {};
    const updatedResponses = {
      ...currentResponses,
      [dayIndex]: {
        ...(currentResponses[dayIndex] || {}),
        [exerciseIndex]: value
      }
    };

    await setDoc(ref, {
      responses: updatedResponses,
      updatedAt: serverTimestamp()
    });

    $("saveStatus").className = "status ok";
    $("saveStatus").textContent = "✓ Guardado. Sol podrá ver tu resultado en la app.";
  } catch (error) {
    console.error(error);
    $("saveStatus").className = "status err";
    $("saveStatus").textContent = "No se pudo guardar. No cierres esta ventana y vuelve a intentar.";
    $("saveBtn").disabled = false;
  }
}

$("startBtn").disabled = true;
$("startBtn").addEventListener("click", startPractice);
$("nextBtn").addEventListener("click", nextQuestion);
$("saveBtn").addEventListener("click", saveResult);
