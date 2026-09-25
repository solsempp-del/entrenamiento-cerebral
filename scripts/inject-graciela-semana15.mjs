import fs from "node:fs";

const path = "src/App.jsx";
let source = fs.readFileSync(path, "utf8");

if (!source.includes('timer:{ label:"Entrenamiento con timer", icon:"⏱️" }')) {
  source = source.replace(
    '  enfoque:    { label:"Ejercicio de enfoque", icon:"🔍" },',
    '  enfoque:    { label:"Ejercicio de enfoque", icon:"🔍" },\n  timer:      { label:"Entrenamiento con timer", icon:"⏱️" },'
  );
}

if (!source.includes('timer:["#FFF4E5","#B85C00"]')) {
  source = source.replace(
    '  gimnasia:["#E0F2F1","#00695C"], enfoque:["#F3E5F5","#6A1B9A"],',
    '  gimnasia:["#E0F2F1","#00695C"], enfoque:["#F3E5F5","#6A1B9A"], timer:["#FFF4E5","#B85C00"],'
  );
}

source = source.replace(
  '(ex.type==="lectura"||ex.type==="video")&&ex.link&&(',
  '(ex.type==="lectura"||ex.type==="video"||ex.type==="timer")&&ex.link&&('
);
source = source.replace(
  '{ex.type==="video"?"▶ Ver video":"📖 Abrir lectura"}',
  '{ex.type==="video"?"▶ Ver video":ex.type==="timer"?"⏱️ Abrir entrenamiento":"📖 Abrir lectura"}'
);
source = source.replace(
  '  const hasLink = t=>t==="lectura"||t==="video";',
  '  const hasLink = t=>t==="lectura"||t==="video"||t==="timer";'
);

if (!source.includes("resp.timerMetrics&&(")) {
  const oldLine = '      {resp.text&&<p style={{fontSize:14,margin:"4px 0 0",whiteSpace:"pre-wrap"}}>{resp.text}</p>}';
  const newBlock = `      {resp.timerMetrics&&(\n        <div style={{background:"#FFF8EE",border:"1px solid #F2D2A7",borderRadius:8,padding:"10px 12px",margin:"6px 0 8px"}}>\n          <p style={{fontSize:13,fontWeight:600,color:NAVY,margin:"0 0 6px"}}>⏱️ Resultado del entrenamiento</p>\n          <p style={{fontSize:13,margin:"2px 0"}}>Correctas: {resp.timerMetrics.correct}/{resp.timerMetrics.total} ({resp.timerMetrics.accuracyPercent}%)</p>\n          <p style={{fontSize:13,margin:"2px 0"}}>Tiempo promedio: {resp.timerMetrics.averageResponseSeconds} s</p>\n          <p style={{fontSize:13,margin:"2px 0"}}>Fuera de tiempo: {resp.timerMetrics.timeoutCount}</p>\n          <p style={{fontSize:13,margin:"2px 0"}}>Aturdimiento/presión: {resp.timerMetrics.stressAfter}/10</p>\n        </div>\n      )}\n      {resp.text&&<p style={{fontSize:14,margin:"4px 0 0",whiteSpace:"pre-wrap"}}>{resp.text}</p>}`;
  if (!source.includes(oldLine)) throw new Error("No se encontró RV para agregar métricas del timer");
  source = source.replace(oldLine, newBlock);
}

if (!source.includes("gracielaSemana15:")) {
  const marker = "const TEMPLATES = {";
  if (!source.includes(marker)) throw new Error("No se encontró const TEMPLATES en src/App.jsx");

  const video1 = "https://drive.google.com/file/d/1VTmSAZtDOOYJvuYbQzEsz_hMswvCXAqN/view?usp=drivesdk";
  const video2 = "https://drive.google.com/file/d/1k39TrT1QsbMJlA9-rAhlgaV8sLQRYw36/view?usp=drivesdk";

  const focusExercises = `
          {
            type: "video",
            title: "Entrenamiento del punto · Video 2 · Mira las instrucciones primero",
            instructions: "Abre este video primero. Aquí están las instrucciones de los ejercicios del punto. Después deja abiertos Video 1 y Video 2 para poder cambiar rápido entre ellos. IMPORTANTE: los dos ejercicios juntos deben durar máximo 5 minutos en total, no 5 minutos cada uno. Para cambiar de un video al otro: si están en ventanas distintas, mantén presionada ALT, toca TAB una vez y suelta las dos teclas. Repite ALT + TAB para volver. Si quedaron como dos pestañas del mismo navegador, usa CTRL + TAB.",
            link: "${video2}",
            items: []
          },
          {
            type: "video",
            title: "Entrenamiento del punto · Video 1",
            instructions: "Abre también este video y realiza los dos ejercicios siguiendo las instrucciones del Video 2. Mantén los dos abiertos. Entre ambos ejercicios suma máximo 5 minutos.",
            link: "${video1}",
            items: []
          },`;

  const block = `
  gracielaSemana15: {
    name: "Graciela · Semana 15 · Timer y lectura bajo presión",
    label: "Semana 15 · Mantener el orden cuando el tiempo corre",
    welcome: "Gracy, esta semana vamos a entrenar una sola habilidad: seguir leyendo y entendiendo aunque el reloj esté corriendo. Harás el entrenamiento completo solo 3 días. No buscamos rapidez; buscamos precisión bajo presión.",
    closing: "Esta semana observamos cómo responde tu atención cuando el tiempo está visible. Nos interesa especialmente si pudiste leer completa antes de responder y cuánto te presionó el timer. Con esos datos ajustaremos el siguiente nivel.",
    days: [
      {
        day: "Día 1",
        exercises: [${focusExercises}
          {
            type: "timer",
            title: "Timer · 30 segundos por pregunta",
            instructions: "Cuando termines los ejercicios del punto, abre este entrenamiento. Haz 3 respiraciones lentas: inhala 4 segundos y exhala 6 segundos, sin retener el aire. Luego responde las preguntas. Tu única regla es: LEE COMPLETO ANTES DE RESPONDER. Al final registra cuánto te presionó el timer; el resultado se guarda automáticamente.",
            link: "/graciela-semana15-dia1.html",
            items: []
          }
        ]
      },
      { day: "Día 2", exercises: [] },
      {
        day: "Día 3",
        exercises: [${focusExercises}
          {
            type: "timer",
            title: "Timer · 25 segundos con distractores",
            instructions: "Cuando termines los ejercicios del punto, abre este entrenamiento. Haz 3 respiraciones lentas, sin retener el aire. Lee completa cada pregunta antes de responder. Hoy encontrarás negaciones, información extra y más de un paso.",
            link: "/graciela-semana15-dia2.html",
            items: []
          }
        ]
      },
      { day: "Día 4", exercises: [] },
      {
        day: "Día 5",
        exercises: [${focusExercises}
          {
            type: "timer",
            title: "Timer · Mini simulación de 3 minutos",
            instructions: "Cuando termines los ejercicios del punto, abre la mini simulación. Haz 3 respiraciones lentas, sin retener el aire. Aquí el timer es global y continúa mientras avanzas por las preguntas. Mantén una sola regla: LEE COMPLETO ANTES DE RESPONDER.",
            link: "/graciela-semana15-dia3.html",
            items: []
          }
        ]
      },
      { day: "Día 6", exercises: [] },
      { day: "Día 7", exercises: [] }
    ]
  },
`;

  source = source.replace(marker, `${marker}${block}`);
}

fs.writeFileSync(path, source, "utf8");
console.log("Graciela Semana 15 integrada en src/App.jsx con videos del punto visibles en cada día de entrenamiento.");
