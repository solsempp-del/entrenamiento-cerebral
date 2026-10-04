import fs from "node:fs";

const path = "src/App.jsx";
let source = fs.readFileSync(path, "utf8");

if (source.includes("gracielaSemana16:")) {
  console.log("Graciela Semana 16 ya está integrada.");
  process.exit(0);
}

const marker = "const TEMPLATES = {";
if (!source.includes(marker)) throw new Error("No se encontró const TEMPLATES en src/App.jsx");

const focusVideo = "https://drive.google.com/file/d/1Pkm5RSqG6Cac-FT6nUxe92E4Q4eEkmCF/view?usp=drivesdk";

const physicalCheck = {
  type: "checklist",
  title: "Registro físico de hoy",
  instructions: "Este registro es para llevar datos claros a tu chequeo ginecológico. Marca solo lo que estuvo presente hoy. No necesitas interpretarlo ni escribir explicaciones largas.",
  items: [
    "Tuve sangrado hoy",
    "Bochorno o sensación de calor",
    "Dolor de cabeza",
    "Náusea",
    "Mareo",
    "Cansancio marcado",
    "Picazón",
    "Otro malestar físico",
    "Hoy no tuve malestar físico"
  ]
};

const cycleDay = {
  type: "reflexion",
  title: "Día del ciclo",
  instructions: "Escribe solo el número del día del ciclo. Día 1 = primer día de sangrado. No reinicies el conteo cuando termina el sangrado. Si hoy comenzó una nueva menstruación, escribe 1.",
  items: []
};

const symptomIntensity = {
  type: "energia",
  title: "Intensidad general del malestar físico",
  instructions: "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
  items: []
};

const focusExercise = {
  type: "enfoque",
  title: "Entrenamiento 3 · Enfoque · 5 minutos",
  instructions: `Haz este ejercicio durante 5 minutos, solo 3 días esta semana. Preferiblemente en la mañana o en la tarde, no en la noche.\n\nVIDEO: ${focusVideo}\n\nBusca un lugar tranquilo y sin interrupciones. Sigue exactamente las instrucciones del video. No alargues la práctica aunque sientas que puedes hacer más: el objetivo es repetición breve y consistente.`,
  items: []
};

const days = [
  {
    day: "Día 1",
    exercises: [
      cycleDay,
      physicalCheck,
      symptomIntensity,
      focusExercise,
      {
        type: "conductual",
        title: "Neerlandés · Comprender antes de responder",
        instructions: "Haz 10–15 minutos con material REAL de tu curso, plataforma o preparación del examen. Hoy no uses presión de tiempo. Regla única: LEE COMPLETO ANTES DE RESPONDER. Al terminar, anota únicamente si hubo algún error por leer demasiado rápido.",
        items: []
      },
      {
        type: "lectura",
        title: "Mi freno de emergencia",
        instructions: "Lee una sola vez y déjalo como protocolo: si aparece el ‘qué importismo’ o notas que estás cerca de 6–7/10, dices PAUSA, dejas de discutir, te alejas físicamente y retomas la conversación solo cuando estés regulada. No tienes que registrar esto todos los días.",
        items: []
      }
    ]
  },
  { day: "Día 2", exercises: [cycleDay, physicalCheck, symptomIntensity] },
  {
    day: "Día 3",
    exercises: [
      cycleDay,
      physicalCheck,
      symptomIntensity,
      focusExercise,
      {
        type: "conductual",
        title: "Neerlandés · Leer con timer visible",
        instructions: "Haz 10–15 minutos con material REAL parecido al examen. Usa el timer visible con un margen cómodo; no buscamos velocidad. Mantén una sola regla: LEE COMPLETO ANTES DE RESPONDER. Al terminar registra: aciertos, cuánto te aturdió el timer de 0–10 y si hubo algún error por apurarte.",
        items: []
      }
    ]
  },
  { day: "Día 4", exercises: [cycleDay, physicalCheck, symptomIntensity] },
  {
    day: "Día 5",
    exercises: [
      cycleDay,
      physicalCheck,
      symptomIntensity,
      focusExercise,
      {
        type: "conductual",
        title: "Neerlandés · Mini simulación",
        instructions: "Haz una práctica corta lo más parecida posible al examen real usando material de tu curso o plataforma. Mantén el timer visible y responde varios ítems seguidos. Regla: LEE COMPLETO ANTES DE RESPONDER. Al terminar registra solo: aciertos, aturdimiento 0–10 y si cometiste algún error por leer rápido o por una palabra desconocida.",
        items: []
      }
    ]
  },
  { day: "Día 6", exercises: [cycleDay, physicalCheck, symptomIntensity] },
  { day: "Día 7", exercises: [cycleDay, physicalCheck, symptomIntensity] }
];

const block = `
  gracielaSemana16: {
    name: "Graciela · Semana 16 · Prepararme sin saturarme",
    label: "Semana 16 · Enfoque, examen y registro físico",
    welcome: "Gracy, esta semana mantenemos tres cosas útiles y nada más: registrar datos físicos para tu chequeo, practicar el nuevo ejercicio de enfoque tres veces y preparar el examen con material real de neerlandés. No buscamos hacer más; buscamos que lo que hagas sea útil.",
    closing: "Terminaste la semana. Lo importante será revisar qué pasó con el timer usando ejercicios reales de neerlandés y ordenar tus datos físicos para el chequeo. Si apareció una situación de mucha activación, usaremos el protocolo de PAUSA como freno, sin convertirlo en el centro de toda la semana.",
    days: ${JSON.stringify(days, null, 2)}
  },
`;

source = source.replace(marker, `${marker}${block}`);
fs.writeFileSync(path, source, "utf8");
console.log("Graciela Semana 16 integrada para este build.");
