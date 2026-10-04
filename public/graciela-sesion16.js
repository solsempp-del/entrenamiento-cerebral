import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const NAVY = "#0f243e";
const CORAL = "#dd6d60";
const BEIGE = "#d6c7b1";
const ADMIN_EMAIL = "solsempp@gmail.com";
const TARGET_EMAIL = "gracyromero3@gmail.com";
const WEEK_INDEX = 15;
const EXERCISE_INDEX = 0;

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

const roundKey = (document.body.dataset.round || "A").toUpperCase();

const rounds = {
  A: {
    dayIndex: 0,
    title: "Práctica 1 · Lectura y comprensión",
    subtitle: "Lee cada pregunta completa y responde a tu ritmo.",
    mode: "mcq",
    visibleTimer: false,
    globalSeconds: null,
    questions: [
      { q: "Laura tenía una cita médica el martes a las 4:00. El consultorio la cambió para el jueves a las 3:30. ¿Qué día y a qué hora tiene finalmente la cita?", a: ["Martes 4:00", "Jueves 3:30", "Jueves 4:00"], c: 1 },
      { q: "En una reunión dijeron: ‘Las personas que ya enviaron el formulario no necesitan volver a enviarlo, excepto quienes hayan cambiado su dirección’. María ya lo envió, pero ayer cambió de dirección. ¿Tiene que volver a enviarlo?", a: ["Sí", "No", "Solo si se lo piden"], c: 0 },
      { q: "Pedro salió de casa con su billetera, sus llaves y su teléfono. Al llegar al trabajo vio las llaves y el teléfono sobre su escritorio, pero no encontró la billetera. ¿Qué objeto falta?", a: ["Las llaves", "El teléfono", "La billetera"], c: 2 },
      { q: "Una clase empieza a las 9:20. La profesora avisó que hoy comenzará 25 minutos más tarde. ¿A qué hora empieza hoy?", a: ["9:35", "9:45", "10:05"], c: 1 },
      { q: "La instrucción dice: ‘Lee los tres párrafos, responde únicamente las preguntas 2 y 4 y no contestes la pregunta 3’. ¿Qué preguntas debes responder?", a: ["2 y 4", "1, 2 y 4", "2, 3 y 4"], c: 0 },
      { q: "Sofía debe tomar un medicamento después del desayuno y antes de salir de casa. Hoy desayunó, salió de casa y entonces recordó el medicamento. ¿Qué paso omitió?", a: ["Desayunar", "Tomar el medicamento", "Salir de casa"], c: 1 }
    ]
  },
  B: {
    dayIndex: 1,
    title: "Práctica 2 · Lectura con tiempo",
    subtitle: "Tienes 3 minutos para toda la ronda. Lee completa antes de responder.",
    mode: "mcq",
    visibleTimer: true,
    globalSeconds: 180,
    questions: [
      { q: "Una reunión estaba prevista para el miércoles a las 11:00. La cambiaron al viernes, una hora y media más temprano. ¿Cuándo será finalmente?", a: ["Viernes 9:30", "Viernes 10:30", "Miércoles 9:30"], c: 0 },
      { q: "La instrucción dice: ‘Todos deben entregar una copia del documento, excepto quienes ya lo enviaron por correo’. Daniel ya lo envió ayer por correo. ¿Debe entregar otra copia?", a: ["Sí", "No", "Solo si cambió de correo"], c: 1 },
      { q: "Carolina llevó al gimnasio una botella, una toalla y sus audífonos. Después de entrenar guardó la botella y los audífonos, pero dejó algo sobre la banca. ¿Qué dejó?", a: ["La botella", "La toalla", "Los audífonos"], c: 1 },
      { q: "Una actividad debía empezar a las 2:35, pero se retrasó 40 minutos. ¿A qué hora comenzó?", a: ["2:55", "3:05", "3:15"], c: 2 },
      { q: "La profesora dice: ‘Responde las preguntas 1, 3 y 5. La pregunta 2 es opcional y la 4 no debe responderse’. ¿Cuáles son obligatorias?", a: ["1, 3 y 5", "1, 2, 3 y 5", "2 y 4"], c: 0 },
      { q: "Andrés debe imprimir un formulario, firmarlo y después enviarlo. Lo imprimió y lo envió sin firmarlo. ¿Qué paso omitió?", a: ["Imprimirlo", "Firmarlo", "Enviarlo"], c: 1 }
    ]
  },
  C: {
    dayIndex: 2,
    title: "Práctica 3 · Leer y escribir",
    subtitle: "Tienes 4 minutos. Lee la consigna y escribe una respuesta breve.",
    mode: "text",
    visibleTimer: true,
    globalSeconds: 240,
    questions: [
      { q: "Una cita era el lunes a las 5:20, pero la movieron 45 minutos más tarde. Escribe el día y la nueva hora.", expected: "Lunes 6:05", check: v => hasAll(v, ["lunes", "6", "05"]) },
      { q: "La instrucción dice: ‘Entrega únicamente los ejercicios 2, 5 y 6; el 4 no debe enviarse’. Escribe cuáles ejercicios debes entregar.", expected: "2, 5 y 6", check: v => hasAll(v, ["2", "5", "6"]) && !normalize(v).includes("4") },
      { q: "Lucía guardó el cuaderno en un ‘tarum’ azul y dejó el lápiz sobre la mesa. ¿Dónde está el lápiz?", expected: "Sobre la mesa", check: v => normalize(v).includes("mesa") },
      { q: "El examen comienza a las 10:15. Debes estar allí 20 minutos antes y tardas 30 minutos en llegar. ¿A qué hora debes salir de casa?", expected: "9:25", check: v => hasAll(v, ["9", "25"]) }
    ]
  }
};

const round = rounds[roundKey] || rounds.A;
let menteeId = null;
let isPreview = false;
let index = 0;
let selected = null;
let questionStart = 0;
let remaining = round.globalSeconds;
let timerHandle = null;
let logs = [];
let pressure = null;
let saveChain = Promise.resolve();

function normalize(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}
function hasAll(value, parts) {
  const n = normalize(value);
  return parts.every(p => n.includes(normalize(p)));
}
function esc(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
}
function fmt(sec) {
  sec = Math.max(0, Number(sec || 0));
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}
function averageTime() {
  if (!logs.length) return 0;
  return logs.reduce((sum, x) => sum + x.responseSeconds, 0) / logs.length;
}
function correctCount() {
  return logs.filter(x => x.correct === true).length;
}
function detailedText(complete = false) {
  const status = complete ? "COMPLETA" : `EN CURSO ${logs.length}/${round.questions.length}`;
  const lines = [
    `Sesión 16 · Ronda ${roundKey} · ${status}`,
    `Correctas: ${correctCount()}/${logs.length || 0}${complete ? ` de ${round.questions.length}` : ""} · promedio: ${averageTime().toFixed(1)} s${pressure !== null ? ` · aturdimiento: ${pressure}/10` : ""}`
  ];
  logs.forEach((x, i) => {
    const mark = x.correct ? "✓" : "✗";
    if (round.mode === "mcq") {
      lines.push(`P${i + 1} ${mark} · ${x.responseSeconds.toFixed(1)} s · respondió: ${x.answerText}${x.correct ? "" : ` · correcta: ${x.expectedText}`}`);
    } else {
      lines.push(`P${i + 1} ${mark} · ${x.responseSeconds.toFixed(1)} s · escribió: ${x.answerText} · esperada: ${x.expectedText}`);
    }
  });
  if (round.visibleTimer) lines.push(`Timer global agotado: ${remaining <= 0 ? "sí" : "no"}`);
  return lines.join("\n");
}

const root = document.getElementById("root");
root.innerHTML = `
<style>
*{box-sizing:border-box} body{margin:0;background:#f7f4ef;color:#202733;font-family:Arial,Helvetica,sans-serif}
.wrap{max-width:820px;margin:0 auto;padding:24px 16px 48px}.hero{background:${NAVY};color:white;border-radius:18px;padding:24px;margin-bottom:16px}
.hero h1{margin:0 0 8px;font-size:27px}.hero p{margin:0;line-height:1.5}.card{background:#fff;border-radius:18px;padding:22px;margin:16px 0;box-shadow:0 4px 18px rgba(0,0,0,.07)}
.rule{text-align:center;border:2px solid ${CORAL};background:#fff8f6;border-radius:14px;padding:13px;font-size:20px;font-weight:800;margin:14px 0}
button{border:0;border-radius:12px;padding:13px 16px;font-size:16px;cursor:pointer;background:${NAVY};color:#fff}.secondary{background:${CORAL}}button:disabled{opacity:.5;cursor:not-allowed}.hidden{display:none}
.progress,.status{color:#667085;font-size:14px}.question{font-size:22px;font-weight:700;line-height:1.5;margin:18px 0}.answers{display:grid;gap:10px}.answer{text-align:left;background:#f3f5f7;color:#202733;border:2px solid transparent}.answer.selected{border-color:${CORAL};background:#fff5f3}
.timer{text-align:center;font-size:54px;font-weight:800;color:${NAVY};font-variant-numeric:tabular-nums;margin:8px 0 14px}.timer.warning{color:${CORAL}}
textarea{width:100%;min-height:120px;border:1px solid #cfd4da;border-radius:12px;padding:14px;font-size:17px;resize:vertical}.scale{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.scale button{width:42px;height:42px;padding:0;background:#fff;color:${NAVY};border:1px solid #cfd4da}.scale button.selected{background:${CORAL};color:#fff;border-color:${CORAL}}
.ok{background:#eaf7f0;color:#196c4c;border-radius:10px;padding:12px 14px}.warn{background:#fff4e5;color:#8a4b08;border-radius:10px;padding:12px 14px}@media(max-width:600px){.hero h1{font-size:23px}.question{font-size:19px}.timer{font-size:46px}}
</style>
<div class="wrap">
  <section class="hero"><h1>${round.title}</h1><p>${round.subtitle}</p></section>
  <section id="intro" class="card">
    <div class="rule">LEE COMPLETO ANTES DE RESPONDER</div>
    <p>${round.mode === "text" ? "Escribe una respuesta breve. No necesitas explicar cómo llegaste a ella." : "Elige una respuesta y continúa. No necesitas explicar cómo llegaste a ella."}</p>
    <button class="secondary" id="startBtn" disabled>Comenzar</button>
    <div id="authStatus" class="status" style="margin-top:10px">Comprobando tu sesión…</div>
  </section>
  <section id="quiz" class="card hidden">
    <div id="progress" class="progress"></div>
    ${round.visibleTimer ? '<div id="timer" class="timer"></div>' : ""}
    <div id="question" class="question"></div>
    ${round.mode === "mcq" ? '<div id="answers" class="answers"></div>' : '<textarea id="textAnswer" placeholder="Escribe tu respuesta aquí..."></textarea>'}
    <div style="margin-top:16px"><button class="secondary" id="nextBtn" disabled>Guardar y siguiente</button></div>
    <div id="saveHint" class="status" style="margin-top:10px"></div>
  </section>
  <section id="finish" class="card hidden">
    <h2>Terminaste esta práctica</h2>
    <p><strong>Durante esta práctica, ¿cuánta presión o aturdimiento sentiste?</strong></p>
    <div id="scale" class="scale"></div>
    <p class="status">0 = nada · 10 = muchísimo</p>
    <div id="finalStatus" class="status">Selecciona un número para terminar de guardar.</div>
  </section>
</div>`;

const $ = id => document.getElementById(id);

onAuthStateChanged(auth, async user => {
  if (!user) {
    $("authStatus").textContent = "No encuentro tu sesión. Entra primero a la app con tu correo y abre esta práctica desde allí.";
    return;
  }
  try {
    const snapshot = await getDocs(collection(db, "mentees"));
    const email = (user.email || "").toLowerCase();
    let mentee = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).find(m => (m.email || "").toLowerCase() === email);
    if (!mentee && email === ADMIN_EMAIL) {
      mentee = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).find(m => (m.email || "").toLowerCase() === TARGET_EMAIL);
      isPreview = true;
    }
    if (!mentee) throw new Error("No se encontró el perfil.");
    menteeId = mentee.id;
    $("authStatus").textContent = isPreview ? "Modo revisión de Sol: puedes probar el flujo; no se guardarán resultados." : "Lista. Tus respuestas se irán guardando mientras avanzas.";
    $("startBtn").disabled = false;
  } catch (error) {
    console.error(error);
    $("authStatus").textContent = "No pude conectar esta práctica con tu perfil. Vuelve a abrirla desde la app.";
  }
});

function updateTimer() {
  if (!round.visibleTimer) return;
  $("timer").textContent = fmt(remaining);
  $("timer").classList.toggle("warning", remaining <= 30);
}
function startTimer() {
  updateTimer();
  timerHandle = setInterval(() => {
    remaining -= 1;
    updateTimer();
    if (remaining <= 0) {
      clearInterval(timerHandle);
      timerHandle = null;
      $("saveHint").textContent = "El tiempo terminó. Termina esta pregunta sin correr.";
    }
  }, 1000);
}
function startPractice() {
  $("intro").classList.add("hidden");
  $("quiz").classList.remove("hidden");
  if (round.visibleTimer) startTimer();
  loadQuestion();
}
function loadQuestion() {
  selected = null;
  $("nextBtn").disabled = true;
  $("saveHint").textContent = "";
  $("progress").textContent = `Pregunta ${index + 1} de ${round.questions.length}`;
  $("question").textContent = round.questions[index].q;
  if (round.mode === "mcq") {
    $("answers").innerHTML = "";
    round.questions[index].a.forEach((label, i) => {
      const b = document.createElement("button");
      b.className = "answer";
      b.textContent = label;
      b.addEventListener("click", () => {
        selected = i;
        [...$("answers").children].forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        $("nextBtn").disabled = false;
      });
      $("answers").appendChild(b);
    });
  } else {
    $("textAnswer").value = "";
    $("textAnswer").oninput = () => { $("nextBtn").disabled = !$("textAnswer").value.trim(); };
  }
  questionStart = performance.now();
}
function buildLog() {
  const item = round.questions[index];
  const responseSeconds = Number(((performance.now() - questionStart) / 1000).toFixed(1));
  if (round.mode === "mcq") {
    return {
      question: index + 1,
      answer: selected,
      answerText: item.a[selected],
      expected: item.c,
      expectedText: item.a[item.c],
      correct: selected === item.c,
      responseSeconds,
      remainingSeconds: round.visibleTimer ? remaining : null
    };
  }
  const value = $("textAnswer").value.trim();
  return {
    question: index + 1,
    answerText: value,
    expectedText: item.expected,
    correct: Boolean(item.check(value)),
    responseSeconds,
    remainingSeconds: round.visibleTimer ? remaining : null
  };
}
function queueSave(complete = false) {
  if (isPreview) return;
  saveChain = saveChain.then(() => saveState(complete)).catch(error => console.error("save session state", error));
}
async function saveState(complete = false) {
  if (!menteeId || isPreview) return;
  const ref = doc(db, "mentees", menteeId, "responses", String(WEEK_INDEX));
  const snap = await getDoc(ref);
  const currentResponses = snap.exists() ? (snap.data().responses || {}) : {};
  const value = {
    text: detailedText(complete),
    timerMetrics: {
      trainingDay: roundKey,
      mode: round.visibleTimer ? "global" : "hidden",
      correct: correctCount(),
      total: round.questions.length,
      completedQuestions: logs.length,
      accuracyPercent: logs.length ? Math.round(correctCount() / logs.length * 100) : 0,
      averageResponseSeconds: Number(averageTime().toFixed(1)),
      timeoutCount: round.visibleTimer && remaining <= 0 ? 1 : 0,
      stressAfter: pressure,
      answers: logs,
      complete
    },
    liveSessionMetrics: {
      session: "S16",
      round: roundKey,
      visibleTimer: round.visibleTimer,
      globalSeconds: round.globalSeconds,
      remainingSeconds: round.visibleTimer ? Math.max(0, remaining) : null,
      answers: logs,
      pressure,
      complete
    },
    at: new Date().toLocaleString("es-EC")
  };
  const updatedResponses = {
    ...currentResponses,
    [round.dayIndex]: {
      ...(currentResponses[round.dayIndex] || {}),
      [EXERCISE_INDEX]: value
    }
  };
  await setDoc(ref, { responses: updatedResponses, updatedAt: serverTimestamp() });
}
async function submitAndNext() {
  $("nextBtn").disabled = true;
  logs.push(buildLog());
  $("saveHint").textContent = isPreview ? "Modo revisión: respuesta registrada solo en esta página." : "Respuesta guardándose…";
  queueSave(false);
  index += 1;
  if (index >= round.questions.length) {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
    $("quiz").classList.add("hidden");
    showFinish();
  } else {
    loadQuestion();
  }
}
function showFinish() {
  $("finish").classList.remove("hidden");
  $("scale").innerHTML = "";
  for (let n = 0; n <= 10; n += 1) {
    const b = document.createElement("button");
    b.textContent = String(n);
    b.addEventListener("click", async () => {
      pressure = n;
      [...$("scale").children].forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      $("finalStatus").className = "status warn";
      $("finalStatus").textContent = isPreview ? "Prueba terminada. En modo revisión no se guardó nada en Graciela." : "Guardando resultado final…";
      queueSave(true);
      await saveChain;
      $("finalStatus").className = "status ok";
      $("finalStatus").textContent = isPreview ? "✓ Revisión terminada." : "✓ Guardado. Avísale a Sol que terminaste esta práctica.";
    });
    $("scale").appendChild(b);
  }
}

$("startBtn").addEventListener("click", startPractice);
$("nextBtn").addEventListener("click", submitAndNext);
