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
const GRACIELA_EMAIL = "gracyromero3@gmail.com";

const DAYS = ["Día 1","Día 2","Día 3","Día 4","Día 5","Día 6","Día 7"];

const GRACIELA_REGISTRO_FISICO = (dateLabel) => [
  {
    type: "reflexion",
    title: `Día del ciclo · ${dateLabel}`,
    instructions: "Escribe únicamente el número del día del ciclo. Día 1 = primer día de sangrado. No reinicies el conteo cuando termina el sangrado. Si hoy comenzó una nueva menstruación, escribe 1.",
    placeholder: "Ej.: 46",
    compactResponse: true,
    items: []
  },
  {
    type: "checklist",
    title: `Registro físico · ${dateLabel}`,
    instructions: "Marca solo los síntomas que estuvieron presentes hoy. Este registro es para llevar datos claros a tu chequeo ginecológico; no necesitas interpretarlos.",
    hideFreeText: true,
    items: ["Tuve sangrado hoy", "Bochorno o sensación de calor", "Dolor de cabeza", "Náusea", "Mareo", "Cansancio marcado", "Picazón", "Otro malestar físico"]
  },
  {
    type: "energia",
    title: "Intensidad general del malestar físico",
    instructions: "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
    scaleMin: 0,
    hideFreeText: true,
    items: []
  }
];

const GRACIELA_ENTRENAMIENTO_4 = {
  type: "enfoque",
  title: "Entrenamiento 4 · Enfoque",
  instructions: "Haz el Entrenamiento 4. Preferiblemente en la mañana o en la tarde, no en la noche.\n\nVIDEO: https://drive.google.com/file/d/1ClExdVEK71g31JjVZrTUI2XsyVTGMRI6/view?usp=drivesdk\n\nBusca un lugar tranquilo y sin interrupciones. Sigue exactamente las instrucciones del video.",
  hideFreeText: true,
  items: ["Hice el entrenamiento de hoy"]
};

const GRACIELA_ENTRENAMIENTO_EXAMEN = [
  {
    type: "lectura",
    title: "Entrenamiento para el examen · Ronda A",
    instructions: "Escribe sin reloj. Esta práctica permite observar cómo respondes cuando no hay presión de tiempo.",
    link: "/graciela-sesion17.html?round=A",
    linkLabel: "Abrir Ronda A",
    externalOnly: true,
    items: []
  },
  {
    type: "lectura",
    title: "Entrenamiento para el examen · Ronda B",
    instructions: "Entrena el orden: LEE → ¿QUÉ ME PIDE? → RESPONDE → REVISA. No buscamos rapidez.",
    link: "/graciela-sesion17.html?round=B",
    linkLabel: "Abrir Ronda B",
    externalOnly: true,
    items: []
  },
  {
    type: "lectura",
    title: "Entrenamiento para el examen · Ronda C",
    instructions: "Practica escribir con reloj visible. La prioridad sigue siendo precisión, no velocidad.",
    link: "/graciela-sesion17.html?round=C",
    linkLabel: "Abrir Ronda C",
    externalOnly: true,
    items: []
  },
  {
    type: "lectura",
    title: "Entrenamiento para el examen · Ronda D",
    instructions: "Usa la misma secuencia con una instrucción real de esta semana.",
    link: "/graciela-sesion17.html?round=D",
    linkLabel: "Abrir Ronda D",
    externalOnly: true,
    items: []
  }
];

// Semana 17 de Graciela: conserva el seguimiento físico de la Semana 16 y
// reemplaza el entrenamiento previo por el material original de Entrenamiento 4.
const GRACIELA_SEMANA_17 = {
  label: "Semana 17 · Entrenamiento 4 · Enfoque",
  welcome: "Gracy, retomamos el registro físico desde el 9 de octubre para tu chequeo y continuamos el entrenamiento de enfoque. Cada día registra tu ciclo, los síntomas y la intensidad. También harás las rondas de entrenamiento para el examen en orden y el Entrenamiento 4 tres veces esta semana.",
  closing: "Terminaste la Semana 17. Tendremos el registro físico ordenado y podremos revisar tu entrenamiento de enfoque y para el examen.",
  days: DAYS.map((day, index) => ({
    day,
    exercises: [
      ...GRACIELA_REGISTRO_FISICO(["9 de octubre", "10 de octubre", "11 de octubre", "12 de octubre", "13 de octubre", "14 de octubre", "15 de octubre"][index]),
      ...(GRACIELA_ENTRENAMIENTO_EXAMEN[index] ? [GRACIELA_ENTRENAMIENTO_EXAMEN[index]] : []),
      ...(index === 0 || index === 2 || index === 4 ? [GRACIELA_ENTRENAMIENTO_4] : [])
    ]
  }))
};

// Semana 18 de Graciela: inicio breve de atención plena. Son cinco días para
// aprender la práctica sin convertirla en otra tarea de rendimiento.
const GRACIELA_SEMANA_18 = {
  label: "Semana 18 · Atención plena 1",
  welcome: "Gracy, esta semana no necesitas hacerlo perfecto ni dejar la mente en blanco. Solo practicarás darte cuenta de dónde está tu atención y volver al presente con amabilidad. Haz una práctica por día, en un lugar tranquilo y sin usar un cronómetro visible.",
  closing: "Terminaste tu primera semana de atención plena. Notar la urgencia antes de actuar ya es una forma de recuperar elección.",
  days: [
    {
      day: "Día 1",
      exercises: [{
        type: "mindfulness",
        title: "Respiración consciente",
        instructions: "Siéntate cómoda, con los ojos abiertos o cerrados. Durante 3 minutos siente el aire entrar y salir. Cuando aparezca un pensamiento, nómbralo mentalmente: ‘pensando’, y vuelve a la respiración. No tienes que hacerlo perfecto.",
        items: ["Hice los 3 minutos de práctica"],
        placeholder: "¿Cuántas veces notaste que tu mente se fue y pudiste volver?"
      }]
    },
    {
      day: "Día 2",
      exercises: [{
        type: "mindfulness",
        title: "Sonidos y respiración",
        instructions: "Durante 4 minutos escucha los sonidos que estén presentes, sin buscar ni juzgar ninguno. Alterna suavemente entre escuchar un sonido y sentir una respiración. Si te distraes, vuelve al sonido o a la respiración.",
        items: ["Hice los 4 minutos de práctica"],
        placeholder: "¿Qué fue más fácil: escuchar o volver a la respiración?"
      }]
    },
    {
      day: "Día 3",
      exercises: [{
        type: "mindfulness",
        title: "Escaneo corporal breve",
        instructions: "Durante 5 minutos lleva la atención, sin prisa, a tus pies, piernas, abdomen, hombros y rostro. Solo nota sensaciones: tensión, calor, cansancio, comodidad o nada en particular. No intentes cambiar nada.",
        items: ["Hice los 5 minutos de práctica"],
        placeholder: "¿Qué parte de tu cuerpo pidió más atención?"
      }]
    },
    {
      day: "Día 4",
      exercises: [{
        type: "mindfulness",
        title: "Caminata consciente",
        instructions: "Camina durante 5 minutos a un ritmo cómodo. Nota el contacto de cada pie con el suelo, el peso que cambia de una pierna a la otra y el movimiento de tu cuerpo. Cuando la mente se vaya, vuelve al siguiente paso.",
        items: ["Hice los 5 minutos de práctica"],
        placeholder: "¿Qué notaste al caminar que normalmente pasas por alto?"
      }]
    },
    {
      day: "Día 5",
      exercises: [{
        type: "mindfulness",
        title: "Observar la urgencia",
        instructions: "Durante 5 minutos siéntate y observa la respiración o los pies apoyados en el suelo. Si aparece apuro, presión o ganas de terminar rápido, di mentalmente: ‘urgencia’. No la combatas ni la sigas; vuelve a sentir el cuerpo. Esta práctica te ayudará a notar la urgencia antes de actuar.",
        items: ["Hice los 5 minutos de práctica"],
        placeholder: "Cuando apareció urgencia, ¿pudiste observarla sin obedecerla de inmediato?"
      }]
    }
  ]
};

// Semana 19 de Graciela: atención plena aplicada a distracciones cotidianas.
// Cada día tiene un ejercicio práctico y un espacio adicional de expresión libre.
const GRACIELA_SEMANA_19 = {
  "label": "Semana 19 · Atención plena 2",
  "welcome": "¡Mi Gracy! ❤️\n\nEsta semana vamos a seguir entrenando tu atención. Practicaremos cómo mantener el enfoque, cambiarlo y regresar a lo que estabas haciendo cuando te distraigas.\n\nQuiero pedirte algo importante: haz un ejercicio por día. No hagas varios el mismo día para ponerte al día. Tu cerebro necesita practicar con regularidad.\n\nSi algún ejercicio te genera ansiedad, cuéntame qué sentiste y qué fue lo que más te inquietó.\n\n¡Un abrazo grande!",
  "closing": "¡Mi Gracy! ❤️ Terminaste otra semana de entrenamiento. Me alegra que estés practicando estas habilidades. Vamos a seguir avanzando poco a poco y observando cómo te funcionan en tu vida diaria. ¡Te mando un abrazo grande!",
  "days": [
    {
      "day": "Día 1",
      "exercises": [
        {
          "type": "mindfulness",
          "title": "Elegir un sonido",
          "instructions": "Haz únicamente el ejercicio de hoy. Mañana continuamos.\n\nDurante 5 minutos, identifica tres sonidos del ambiente. Elige uno y mantén la atención durante 30 segundos. Después cambia voluntariamente a otro. Repite varias veces. Si te distraes, vuelve al sonido elegido.",
          "items": [
            "Hice la práctica de hoy"
          ],
          "placeholder": "¿Cómo te sentiste durante el ejercicio?"
        },
        {
          "type": "libre",
          "title": "¿Algo más que quieras contarme?",
          "instructions": "Este espacio es para cualquier otra cosa que quieras compartir de la práctica. Puedes dejarlo en blanco.",
          "placeholder": "Escribe aquí si quieres contarme algo más.",
          "items": []
        }
      ]
    },
    {
      "day": "Día 2",
      "exercises": [
        {
          "type": "mindfulness",
          "title": "Observar sin distraerse",
          "instructions": "Haz únicamente el ejercicio de hoy. Mañana continuamos.\n\nElige un objeto cotidiano. Obsérvalo durante 3 minutos: forma, color, textura y detalles. Cuando aparezca otro pensamiento, vuelve al objeto. Termina con 2 minutos de respiración natural.",
          "items": [
            "Hice la práctica de hoy"
          ],
          "placeholder": "¿Cómo te sentiste durante el ejercicio?"
        },
        {
          "type": "libre",
          "title": "¿Algo más que quieras contarme?",
          "instructions": "Este espacio es para cualquier otra cosa que quieras compartir de la práctica. Puedes dejarlo en blanco.",
          "placeholder": "Escribe aquí si quieres contarme algo más.",
          "items": []
        }
      ]
    },
    {
      "day": "Día 3",
      "exercises": [
        {
          "type": "mindfulness",
          "title": "Cambiar el foco a voluntad",
          "instructions": "Haz únicamente el ejercicio de hoy. Mañana continuamos.\n\nDurante 6 minutos alterna tu atención: 1 minuto en la respiración, 1 minuto en los sonidos y 1 minuto en las sensaciones de tus pies. Repite la secuencia una vez.",
          "items": [
            "Hice la práctica de hoy"
          ],
          "placeholder": "¿Cómo te sentiste durante el ejercicio?"
        },
        {
          "type": "libre",
          "title": "¿Algo más que quieras contarme?",
          "instructions": "Este espacio es para cualquier otra cosa que quieras compartir de la práctica. Puedes dejarlo en blanco.",
          "placeholder": "Escribe aquí si quieres contarme algo más.",
          "items": []
        }
      ]
    },
    {
      "day": "Día 4",
      "exercises": [
        {
          "type": "mindfulness",
          "title": "Reconocer el apuro",
          "instructions": "Haz únicamente el ejercicio de hoy. Mañana continuamos.\n\nElige una tarea sencilla, como ordenar un cajón pequeño. Antes de empezar, respira durante 30 segundos. Hazla a ritmo normal durante 5 minutos. Si aparece sensación de apuro, detente unos segundos, nota qué sientes y continúa.",
          "items": [
            "Hice la práctica de hoy"
          ],
          "placeholder": "¿Cómo te sentiste durante el ejercicio?"
        },
        {
          "type": "libre",
          "title": "¿Algo más que quieras contarme?",
          "instructions": "Este espacio es para cualquier otra cosa que quieras compartir de la práctica. Puedes dejarlo en blanco.",
          "placeholder": "Escribe aquí si quieres contarme algo más.",
          "items": []
        }
      ]
    },
    {
      "day": "Día 5",
      "exercises": [
        {
          "type": "mindfulness",
          "title": "Una tarea, una atención",
          "instructions": "Haz únicamente el ejercicio de hoy. Mañana continuamos.\n\nDedica 7 minutos a una actividad cotidiana sin celular ni otras tareas simultáneas. Cada vez que notes que te distrajiste, vuelve a lo que estabas haciendo. Al terminar, observa cómo fue mantener la atención.",
          "items": [
            "Hice la práctica de hoy"
          ],
          "placeholder": "¿Cómo te sentiste durante el ejercicio?"
        },
        {
          "type": "libre",
          "title": "¿Algo más que quieras contarme?",
          "instructions": "Este espacio es para cualquier otra cosa que quieras compartir de la práctica. Puedes dejarlo en blanco.",
          "placeholder": "Escribe aquí si quieres contarme algo más.",
          "items": []
        }
      ]
    },
    {
      "day": "Día 6",
      "exercises": []
    },
    {
      "day": "Día 7",
      "exercises": []
    }
  ]
};

// Semana inicial de Karla: tres días breves para bajar presión, procesar su
// estado actual y practicar flexibilidad cognitiva sin convertirlo en una carga.
const KARLA_SEMANA_1 = {
  label: "Semana 1 · Bajar la presión y abrir alternativas",
  welcome: "Karla, esta semana no es para rendir más ni hacerlo perfecto. Son tres pausas breves para escucharte, bajar la culpa y recordar que, si un plan se complica, todavía existen otros caminos. Haz solo un ejercicio por día; puedes parar cuando lo necesites.",
  closing: "Esta semana no se mide por productividad. Se mide por tu capacidad de escucharte, pedir alternativas y responder a tu realidad con menos culpa.",
  days: [
    {
      day: "Día 1",
      exercises: [{
        type: "reflexion",
        title: "¿Qué necesita mi sistema hoy?",
        instructions: "No tienes que resolver nada ahora. Completa solo estas tres frases, con pocas palabras si lo prefieres:\n\n1. Mi cuerpo hoy se siente…\n2. Mi mente hoy está intentando protegerme de…\n3. Lo más amable y realista que puedo hacer por mí hoy es…\n\nOpcional: antes de escribir, apoya una mano en el pecho y otra en el abdomen durante dos minutos. No intentes calmarte: solo nota cómo estás.",
        placeholder: "Mi cuerpo hoy se siente…",
        items: []
      }]
    },
    {
      day: "Día 2",
      exercises: [{
        type: "reflexion",
        title: "No solo existe el plan A",
        instructions: "Elige una preocupación actual, por ejemplo: “Me atrasé con los exámenes”. Escribe tres caminos posibles:\n\n• Plan A: lo que idealmente quisiera que pase.\n• Plan B: una alternativa que aún me permita avanzar, aunque no sea perfecta.\n• Plan C: qué haría para cuidarme y continuar si A y B no salen como esperaba.\n\nCierra con esta frase: “Tener otro plan no significa rendirme; significa no dejarme sola si algo cambia”.",
        placeholder: "Plan A…\nPlan B…\nPlan C…",
        items: []
      }]
    },
    {
      day: "Día 3",
      exercises: [{
        type: "conductual",
        title: "Cambiar de estado, no exigirme rendimiento",
        instructions: "Elige una sola opción según tu energía:\n\n• Pon una canción que te guste y mueve el cuerpo durante una canción completa.\n• Camina descalza unos minutos en un lugar seguro o siente un árbol o una planta con las manos.\n• Mira por la ventana y encuentra cinco cosas que no habías notado antes.\n\nDespués responde: “¿Qué cambió, aunque sea un 1 %, en mi cuerpo o en mi mente?”.",
        placeholder: "Elegí… y noté que…",
        items: []
      }]
    }
  ]
};

// Semana 2 de Karla: recoger datos de tiempo real y practicar una planificación
// breve y flexible, sin convertirla en otra tarea detallista.
const KARLA_SEMANA_2 = {
  label: "Semana 2 · Conocer mi tiempo real",
  welcome: "Karla, esta semana no vamos a intentar hacer planes perfectos ni hacer las cosas más rápido. Vamos a medir cuánto tiempo te toman de verdad algunas actividades y a practicar planes más cortos. Con esos datos podremos organizarte de una forma que sí te sirva.",
  closing: "Terminaste esta primera semana de observación. No buscamos que todo haya salido como lo planeaste; buscamos datos reales para que tus próximos planes sean más simples, flexibles y posibles.",
  days: [
    {
      day: "Día 1",
      exercises: [{
        type: "reflexion",
        title: "Predicción vs. realidad",
        instructions: "Elige una actividad cotidiana: bañarte, alistarte, comer, ordenar algo o preparar tus cosas para salir.\n\nAntes de empezar escribe: \n• Actividad:\n• Creo que me tomará: ___ minutos.\n\nPon un cronómetro y hazla normalmente. Al terminar escribe: \n• Me tomó realmente: ___ minutos.\n• ¿Qué hizo que tomara más tiempo?\n\nNo intentes hacerlo más rápido ni perfecto. Solo mide.",
        placeholder: "Actividad…\nCreo que me tomará…\nMe tomó realmente…\nTomó más tiempo porque…",
        items: []
      }]
    },
    {
      day: "Día 2",
      exercises: [{
        type: "reto",
        title: "Plan en tres líneas",
        instructions: "Escoge una tarea académica o personal. Tienes máximo 5 minutos para planificarla: pon un temporizador.\n\nSolo puedes escribir tres cosas:\n1. Tarea principal.\n2. Primer paso concreto.\n3. Tiempo que le voy a dar hoy.\n\nDespués, haz solo ese primer bloque. Planificar más detalles no es parte del ejercicio.",
        placeholder: "Tarea principal…\nPrimer paso…\nTiempo que le daré hoy…\n\n¿Logré parar al terminar los 5 minutos? ¿Cuánto me tomó realmente?",
        items: ["Puse temporizador de 5 minutos para planificar", "Hice al menos el primer bloque"]
      }]
    },
    {
      day: "Día 3",
      exercises: [{
        type: "reflexion",
        title: "Tres prioridades y Plan B",
        instructions: "Elige solo tres cosas importantes para mañana. Para cada una escribe cuánto crees que te tomará y una versión corta por si no alcanza el tiempo o la energía.\n\nEjemplo: Estudiar biología — 40 minutos — Plan B: leer 2 páginas y responder 2 preguntas.\n\nAl final del día revisa: ¿qué calculé bien?, ¿en qué me fui al detalle?, ¿usé mi Plan B o dejé todo?",
        placeholder: "1. Prioridad — tiempo estimado — Plan B\n2. Prioridad — tiempo estimado — Plan B\n3. Prioridad — tiempo estimado — Plan B\n\nAl final del día…",
        items: []
      }]
    }
  ]
};

async function ensureGracielaMindfulnessWeek(mentee, currentWeeks) {
  const isGraciela = (mentee?.email || "").toLowerCase() === GRACIELA_EMAIL;
  if (!isGraciela || currentWeeks.length !== 17) {
    return { weeks: currentWeeks, activeWeek: null };
  }

  const updatedWeeks = [...currentWeeks, GRACIELA_SEMANA_18];
  const mindfulnessWeekIndex = updatedWeeks.length - 1;
  await saveWeeksToDB(mentee.id, updatedWeeks);
  await saveActiveWeekToDB(mentee.id, mindfulnessWeekIndex);
  return { weeks: updatedWeeks, activeWeek: mindfulnessWeekIndex };
}

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
  gracielaSemana19: {
    name: "Graciela · Semana 19 · Atención plena 2",
    ...GRACIELA_SEMANA_19
  },
  karlaSemana1: {
    name: "Karla · Semana 1 · Bajar la presión y abrir alternativas",
    ...KARLA_SEMANA_1
  },
  karlaSemana2: {
    name: "Karla · Semana 2 · Conocer mi tiempo real",
    ...KARLA_SEMANA_2
  },
  gracielaSemana16: {
    name: "Graciela · Semana 16 · Enfoque, examen y registro físico",
    label: "Semana 16 · Enfoque, examen y registro físico",
    welcome: "Gracy, esta semana vamos a mantener el registro físico para tu chequeo, continuar el entrenamiento de enfoque y hacer tres prácticas cortas en orden. Cada práctica cambia una sola condición para que podamos comparar qué pasa con tu comprensión cuando aparece el tiempo y cuando además tienes que escribir. Haz una práctica por día y no repitas una aunque sientas que no te salió perfecta.",
    closing: "Terminaste la semana. Con las tres prácticas podremos comparar precisión, tiempo de respuesta, presión/aturdimiento y qué fue lo que más te dificultó. También tendremos un registro ordenado de tu ciclo y malestares físicos para tu chequeo ginecológico.",
    days: [
  {
    "day": "Día 1",
    "exercises": [
      {
        "type": "lectura",
        "title": "Práctica A · Lee y responde",
        "instructions": "Haz esta práctica primero. Lee completa cada pregunta y responde a tu ritmo. No necesitas cronometrarte ni explicar tus respuestas.",
        "link": "/graciela-sesion16-rondaA.html",
        "linkLabel": "Abrir práctica A",
        "externalOnly": true,
        "items": []
      },
      {
        "type": "reflexion",
        "title": "Día del ciclo",
        "instructions": "Escribe únicamente el número del día del ciclo. Día 1 = primer día de sangrado. No reinicies el conteo cuando termina el sangrado. Si hoy comenzó una nueva menstruación, escribe 1.",
        "placeholder": "Ej.: 43",
        "compactResponse": true,
        "items": []
      },
      {
        "type": "checklist",
        "title": "Registro físico de hoy",
        "instructions": "Marca solo los síntomas que estuvieron presentes hoy. Este registro es para llevar datos claros a tu chequeo ginecológico; no necesitas interpretarlos.",
        "hideFreeText": true,
        "items": [
          "Tuve sangrado hoy",
          "Bochorno o sensación de calor",
          "Dolor de cabeza",
          "Náusea",
          "Mareo",
          "Cansancio marcado",
          "Picazón",
          "Otro malestar físico"
        ]
      },
      {
        "type": "energia",
        "title": "Intensidad general del malestar físico",
        "instructions": "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
        "scaleMin": 0,
        "hideFreeText": true,
        "items": []
      },
      {
        "type": "enfoque",
        "title": "Entrenamiento 3 · Enfoque · 5 minutos",
        "instructions": "Haz este ejercicio durante 5 minutos. Esta semana lo harás solo 3 días. Preferiblemente en la mañana o en la tarde, no en la noche.\n\nVIDEO: https://drive.google.com/file/d/1Pkm5RSqG6Cac-FT6nUxe92E4Q4eEkmCF/view?usp=drivesdk\n\nBusca un lugar tranquilo y sin interrupciones. Sigue exactamente las instrucciones del video y termina a los 5 minutos.",
        "hideFreeText": true,
        "items": [
          "Hice los 5 minutos de entrenamiento"
        ]
      },
      {
        "type": "lectura",
        "title": "Plan PAUSA si vuelvo a llegar al límite",
        "instructions": "Este plan es solo para tener claro qué hacer si vuelve a aparecer una escalada fuerte. No tienes que registrar nada aquí.\n\n1. SEÑAL: noto el ‘qué importismo’, pienso ‘que arda Troya’ o siento que ya estoy en 6/10 o más.\n2. PARO: no sigo discutiendo, explicando ni intentando resolver el problema en ese momento.\n3. DIGO: ‘Estoy demasiado alterada para seguir. Necesito una pausa y lo retomamos después.’\n4. ME ALEJO: voy a otro espacio y pongo distancia física. No toco a la otra persona, no la sigo y no continúo la discusión por mensajes.\n5. REGRESO: retomo la conversación solo cuando haya bajado a 4/10 o menos y pueda hablar sin atacar.\n\nSi siento que podría volver a golpear, lanzar algo o perder el control, aumento la distancia y busco apoyo de inmediato.",
        "noResponse": true,
        "items": []
      }
    ]
  },
  {
    "day": "Día 2",
    "exercises": [
      {
        "type": "lectura",
        "title": "Práctica B · Lee y responde con reloj",
        "instructions": "Haz esta práctica una sola vez. El reloj será visible. Tu única regla es: LEE COMPLETO ANTES DE RESPONDER. Si el tiempo llega a cero, termina la pregunta sin correr.",
        "link": "/graciela-sesion16-rondaB.html",
        "linkLabel": "Abrir práctica B",
        "externalOnly": true,
        "items": []
      },
      {
        "type": "reflexion",
        "title": "Día del ciclo",
        "instructions": "Escribe únicamente el número del día del ciclo. Día 1 = primer día de sangrado. No reinicies el conteo cuando termina el sangrado. Si hoy comenzó una nueva menstruación, escribe 1.",
        "placeholder": "Ej.: 44",
        "compactResponse": true,
        "items": []
      },
      {
        "type": "checklist",
        "title": "Registro físico de hoy",
        "instructions": "Marca solo los síntomas que estuvieron presentes hoy.",
        "hideFreeText": true,
        "items": [
          "Tuve sangrado hoy",
          "Bochorno o sensación de calor",
          "Dolor de cabeza",
          "Náusea",
          "Mareo",
          "Cansancio marcado",
          "Picazón",
          "Otro malestar físico"
        ]
      },
      {
        "type": "energia",
        "title": "Intensidad general del malestar físico",
        "instructions": "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
        "scaleMin": 0,
        "hideFreeText": true,
        "items": []
      }
    ]
  },
  {
    "day": "Día 3",
    "exercises": [
      {
        "type": "lectura",
        "title": "Práctica C · Lee, escribe y responde con reloj",
        "instructions": "Haz esta práctica una sola vez. Lee cada consigna completa y escribe una respuesta breve. No necesitas explicar cómo llegaste a ella. Si el tiempo llega a cero, termina la pregunta sin correr.",
        "link": "/graciela-sesion16-rondaC.html",
        "linkLabel": "Abrir práctica C",
        "externalOnly": true,
        "items": []
      },
      {
        "type": "reflexion",
        "title": "Día del ciclo",
        "instructions": "Escribe únicamente el número del día del ciclo. Día 1 = primer día de sangrado. No reinicies el conteo cuando termina el sangrado. Si hoy comenzó una nueva menstruación, escribe 1.",
        "placeholder": "Ej.: 45",
        "compactResponse": true,
        "items": []
      },
      {
        "type": "checklist",
        "title": "Registro físico de hoy",
        "instructions": "Marca solo los síntomas que estuvieron presentes hoy.",
        "hideFreeText": true,
        "items": [
          "Tuve sangrado hoy",
          "Bochorno o sensación de calor",
          "Dolor de cabeza",
          "Náusea",
          "Mareo",
          "Cansancio marcado",
          "Picazón",
          "Otro malestar físico"
        ]
      },
      {
        "type": "energia",
        "title": "Intensidad general del malestar físico",
        "instructions": "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
        "scaleMin": 0,
        "hideFreeText": true,
        "items": []
      },
      {
        "type": "enfoque",
        "title": "Entrenamiento 3 · Enfoque · 5 minutos",
        "instructions": "Haz el Entrenamiento 3 durante 5 minutos. Preferiblemente en la mañana o en la tarde, no en la noche.\n\nVIDEO: https://drive.google.com/file/d/1Pkm5RSqG6Cac-FT6nUxe92E4Q4eEkmCF/view?usp=drivesdk\n\nTermina a los 5 minutos.",
        "hideFreeText": true,
        "items": [
          "Hice los 5 minutos de entrenamiento"
        ]
      }
    ]
  },
  {
    "day": "Día 4",
    "exercises": [
      {
        "type": "reflexion",
        "title": "Día del ciclo",
        "instructions": "Escribe únicamente el número del día del ciclo.",
        "placeholder": "Número del día",
        "compactResponse": true,
        "items": []
      },
      {
        "type": "checklist",
        "title": "Registro físico de hoy",
        "instructions": "Marca solo los síntomas que estuvieron presentes hoy.",
        "hideFreeText": true,
        "items": [
          "Tuve sangrado hoy",
          "Bochorno o sensación de calor",
          "Dolor de cabeza",
          "Náusea",
          "Mareo",
          "Cansancio marcado",
          "Picazón",
          "Otro malestar físico"
        ]
      },
      {
        "type": "energia",
        "title": "Intensidad general del malestar físico",
        "instructions": "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
        "scaleMin": 0,
        "hideFreeText": true,
        "items": []
      }
    ]
  },
  {
    "day": "Día 5",
    "exercises": [
      {
        "type": "reflexion",
        "title": "Día del ciclo",
        "instructions": "Escribe únicamente el número del día del ciclo.",
        "placeholder": "Número del día",
        "compactResponse": true,
        "items": []
      },
      {
        "type": "checklist",
        "title": "Registro físico de hoy",
        "instructions": "Marca solo los síntomas que estuvieron presentes hoy.",
        "hideFreeText": true,
        "items": [
          "Tuve sangrado hoy",
          "Bochorno o sensación de calor",
          "Dolor de cabeza",
          "Náusea",
          "Mareo",
          "Cansancio marcado",
          "Picazón",
          "Otro malestar físico"
        ]
      },
      {
        "type": "energia",
        "title": "Intensidad general del malestar físico",
        "instructions": "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
        "scaleMin": 0,
        "hideFreeText": true,
        "items": []
      },
      {
        "type": "enfoque",
        "title": "Entrenamiento 3 · Enfoque · 5 minutos",
        "instructions": "Haz el Entrenamiento 3 durante 5 minutos. Preferiblemente en la mañana o en la tarde, no en la noche.\n\nVIDEO: https://drive.google.com/file/d/1Pkm5RSqG6Cac-FT6nUxe92E4Q4eEkmCF/view?usp=drivesdk\n\nTermina a los 5 minutos.",
        "hideFreeText": true,
        "items": [
          "Hice los 5 minutos de entrenamiento"
        ]
      }
    ]
  },
  {
    "day": "Día 6",
    "exercises": [
      {
        "type": "reflexion",
        "title": "Día del ciclo",
        "instructions": "Escribe únicamente el número del día del ciclo.",
        "placeholder": "Número del día",
        "compactResponse": true,
        "items": []
      },
      {
        "type": "checklist",
        "title": "Registro físico de hoy",
        "instructions": "Marca solo los síntomas que estuvieron presentes hoy.",
        "hideFreeText": true,
        "items": [
          "Tuve sangrado hoy",
          "Bochorno o sensación de calor",
          "Dolor de cabeza",
          "Náusea",
          "Mareo",
          "Cansancio marcado",
          "Picazón",
          "Otro malestar físico"
        ]
      },
      {
        "type": "energia",
        "title": "Intensidad general del malestar físico",
        "instructions": "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
        "scaleMin": 0,
        "hideFreeText": true,
        "items": []
      }
    ]
  },
  {
    "day": "Día 7",
    "exercises": [
      {
        "type": "reflexion",
        "title": "Día del ciclo",
        "instructions": "Escribe únicamente el número del día del ciclo.",
        "placeholder": "Número del día",
        "compactResponse": true,
        "items": []
      },
      {
        "type": "checklist",
        "title": "Registro físico de hoy",
        "instructions": "Marca solo los síntomas que estuvieron presentes hoy.",
        "hideFreeText": true,
        "items": [
          "Tuve sangrado hoy",
          "Bochorno o sensación de calor",
          "Dolor de cabeza",
          "Náusea",
          "Mareo",
          "Cansancio marcado",
          "Picazón",
          "Otro malestar físico"
        ]
      },
      {
        "type": "energia",
        "title": "Intensidad general del malestar físico",
        "instructions": "Marca de 0 a 10 cuánto malestar físico tuviste hoy. 0 = ninguno; 10 = máximo.",
        "scaleMin": 0,
        "hideFreeText": true,
        "items": []
      }
    ]
  }
]
  },

  letty_cuidar_sin_vigilar_app6: {
  name: "Letty · Cuidar sin vigilar",
  label: "Semana App 6 · Puedo cuidar sin vigilar",

  welcome: `Mi Letty, esta semana vamos a seguir trabajando con el dibujo del río.

En la sesión vimos algo importante: el río podía seguir su camino sin que el guardián tuviera que vigilarlo todo el tiempo.

El guardián no era malo. Quería cuidar.
Pero también podía descansar.

Esta semana no vamos a intentar controlar la ansiedad.
No vamos a intentar resolver el futuro.
No vamos a vigilar cada sensación.

Vamos a practicar una frase:

“Puedo cuidar sin vigilar. Puedo descansar y la vida puede seguir su curso.”`,

  closing: `Mi Letty, esta semana no medimos si todo estuvo perfecto.

Medimos si pudiste recordar el río, si pudiste dejar descansar un poquito al guardián y si pudiste vivir el pedacito de día que sí tenías delante.

El río puede seguir.
El guardián puede descansar.
Dios sigue sosteniendo todo.`,

  days: DAYS.map((d, i) => {
    const plan = [
      [
        {
          type: "checklist",
          title: "Mirar mi dibujo del río",
          instructions: `Mira tu dibujo del río durante un minuto.

No lo analices.
Solo mira el río, el letrero, el guardián y el lugar donde puede descansar.`,
          items: [
            "Miré mi dibujo un minuto",
            "Vi el río siguiendo su camino",
            "Recordé que el guardián puede descansar",
            "Hoy solo pude intentarlo"
          ]
        },
        {
          type: "checklist",
          title: "Frase del día",
          instructions: `Repite despacio:

“Puedo cuidar sin vigilar.”`,
          items: [
            "Repetí la frase",
            "La dije en voz baja",
            "La pensé por dentro",
            "Hoy solo la leí"
          ]
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe lo que quieras contarme de hoy. No tienes que explicarlo perfecto.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Dejar descansar al guardián",
          instructions: `Imagina al guardián yendo a su casa o a su hamaca.

No se va para siempre.
No abandona el río.
Solo descansa un momento.

El letrero sigue ahí.
El río sigue su camino.`,
          items: [
            "Imaginé al guardián descansando",
            "Recordé que el letrero sigue ahí",
            "Recordé que el río no necesita ser vigilado todo el tiempo",
            "Me costó, pero lo intenté"
          ]
        },
        {
          type: "reflexion",
          title: "Hoy mi guardián quiso vigilar",
          instructions: `Completa esta frase:

“Hoy mi guardián quiso vigilar ________.”

No escribas mucho. Solo una frase.`,
          items: []
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí cómo estuvo tu día.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Solo este pedacito de río",
          instructions: `Cuando tu mente se vaya al futuro, recuerda:

“Ese tramo del río todavía no llegó.
Hoy vivo este pedacito.”

No tienes que resolver todo el río.
Solo este tramo de hoy.`,
          items: [
            "Recordé la frase",
            "Volví al momento presente",
            "Hice una cosa paso a paso",
            "Hoy me costó recordarlo"
          ]
        },
        {
          type: "reflexion",
          title: "El pedacito de río que viví hoy",
          instructions: `Completa esta frase:

“Hoy viví este pedacito de río cuando ________.”

Puede ser algo pequeño: cocinar, descansar, hablar con mi hijo, sentir a mi bebé, orar, bañarme, ordenar algo o respirar.`,
          items: []
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "El letrero sigue ahí",
          instructions: `Imagina el letrero del dibujo.

El letrero sigue ahí aunque el guardián descanse.

Repite:

“El cuidado no depende solo de mí.”`,
          items: [
            "Recordé el letrero",
            "Repetí la frase",
            "Dejé que otra persona o Dios sostenga algo",
            "Hoy solo pude intentarlo"
          ]
        },
        {
          type: "reflexion",
          title: "Hoy solté un poquito",
          instructions: `Completa esta frase:

“Hoy dejé de vigilar un poquito cuando ________.”

No busques algo grande. Puede ser algo pequeño.`,
          items: []
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí cómo estuvo tu día.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Puedo cuidar sin hacerlo todo",
          instructions: `Hoy recuerda:

Cuidar no significa hacerlo todo.
Cuidar no significa controlar todo.
Cuidar no significa vigilar todo.

Puedes hacer tu parte y dejar que el resto siga su curso.`,
          items: [
            "Hice solo mi parte",
            "Solté algo que no dependía de mí",
            "Recordé que no tengo que hacerlo todo",
            "Hoy me costó, pero lo intenté"
          ]
        },
        {
          type: "reflexion",
          title: "Mi parte de hoy",
          instructions: `Completa esta frase:

“Hoy mi parte sí era ________.”

Luego completa:

“Hoy no me correspondía controlar ________.”`,
          items: []
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Cuando algo me altere",
          instructions: `Si hoy algo te altera, vuelve al dibujo del río.

No necesitas correr a resolver todo.
No necesitas vigilar todo.
No necesitas adelantarte a todo.

Solo repite:

“El río sigue. Yo respiro. Dios sostiene este momento.”`,
          items: [
            "Recordé el río cuando algo me alteró",
            "Respiré antes de actuar",
            "Hice una cosa a la vez",
            "Hoy no apareció algo fuerte"
          ]
        },
        {
          type: "reflexion",
          title: "Una cosa a la vez",
          instructions: `Completa esta frase:

“Hoy hice una cosa a la vez cuando ________.”`,
          items: []
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí cómo estuvo tu día.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Lo que aprendió mi guardián",
          instructions: "Marca lo que más se acerque a tu semana.",
          items: [
            "Recordé que puedo cuidar sin vigilar",
            "Dejé descansar un poquito al guardián",
            "Recordé el río cuando me fui al futuro",
            "Viví algo del presente sin intentar resolver todo",
            "Me costó, pero seguí practicando"
          ]
        },
        {
          type: "checklist",
          title: "Frase de cierre",
          instructions: `Repite despacio:

“El río puede seguir.
Yo puedo descansar.
Dios sostiene lo que yo no tengo que vigilar.”`,
          items: [
            "Repetí la frase",
            "La escribí",
            "La dije en oración",
            "Hoy solo la leí"
          ]
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme de esta semana.",
          items: []
        }
      ]
    ];

    return {
      day: d,
      exercises: plan[i]
    };
  })
},
gracielaSemana12: {
  name: "Graciela · Semana 12 · Ser mi aliada y avanzar",

  label: "Semana 12 · Ser mi aliada y avanzar",

  welcome:
    "Gracy, esta semana vamos a trabajar en dos cosas: aprender a mirarte con más comprensión cuando recuerdas decisiones del pasado y avanzar en las cosas que hoy sí están en tus manos. También vamos a seguir observando tu energía y tu ciclo menstrual para identificar patrones.",

  closing:
    "Al terminar la semana, revisa qué cambió cuando te trataste como tu aliada en lugar de como tu jueza, qué cosas lograste avanzar y qué pequeño paso diste hacia lo que quieres construir.",

  days: [
    {
      day: "Día 1",
      exercises: [
        {
          type: "libre",
          title: "Fecha",
          instructions: "Escribe la fecha de hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Día de mi ciclo menstrual",
          instructions:
            "Escribe en qué día de tu ciclo menstrual estás hoy. Si no lo sabes con exactitud, puedes poner una aproximación.",
          items: []
        },
        {
          type: "reflexion",
          title: "Mi jueza y mi aliada",
          instructions:
            "Piensa en una decisión del pasado que todavía te reprochas. Primero escribe qué te dice tu jueza interna. Después responde: ¿Qué sabía yo en ese momento? ¿Qué recursos tenía? ¿Qué habría necesitado? ¿Qué le diría hoy a otra mujer que hubiera vivido exactamente lo mismo?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions: "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
          items: []
        }
      ]
    },

    {
      day: "Día 2",
      exercises: [
        {
          type: "libre",
          title: "Fecha",
          instructions: "Escribe la fecha de hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Día de mi ciclo menstrual",
          instructions: "Escribe en qué día de tu ciclo estás hoy.",
          items: []
        },
        {
          type: "reflexion",
          title: "Mirar a la Graciela de ese momento",
          instructions:
            "Piensa en una versión más joven de ti dentro de una situación que hoy juzgas. Completa estas frases: Ella no sabía... / Ella tenía miedo de... / Ella intentaba... / En ese momento necesitaba... / Hoy entiendo que...",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions: "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
          items: []
        }
      ]
    },

    {
      day: "Día 3",
      exercises: [
        {
          type: "libre",
          title: "Fecha",
          instructions: "Escribe la fecha de hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Día de mi ciclo menstrual",
          instructions: "Escribe en qué día de tu ciclo estás hoy.",
          items: []
        },
        {
          type: "reflexion",
          title: "La confianza se observa en hechos",
          instructions:
            "Piensa en una situación actual con José relacionada con la confianza. Responde: ¿Qué ocurrió realmente? ¿Qué parte de mi reacción pertenece a cosas del pasado? ¿Hay algo actual que necesito observar? ¿Qué necesitaría ver o experimentar para sentir mayor seguridad?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions: "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
          items: []
        }
      ]
    },

    {
      day: "Día 4",
      exercises: [
        {
          type: "libre",
          title: "Fecha",
          instructions: "Escribe la fecha de hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Día de mi ciclo menstrual",
          instructions: "Escribe en qué día de tu ciclo estás hoy.",
          items: []
        },
        {
          type: "reto",
          title: "Mis 3 prioridades",
          instructions:
            "Escribe todos tus pendientes de hoy. Después elige únicamente los 3 más importantes. Ordénalos del 1 al 3. Comienza por el que más estás evitando o el que más consecuencias tendría seguir postergando. Al final registra: ¿lo hice?, ¿cuánto tiempo me tomó realmente?, ¿fue tan difícil como imaginaba?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions: "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
          items: []
        }
      ]
    },

    {
      day: "Día 5",
      exercises: [
        {
          type: "libre",
          title: "Fecha",
          instructions: "Escribe la fecha de hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Día de mi ciclo menstrual",
          instructions: "Escribe en qué día de tu ciclo estás hoy.",
          items: []
        },
        {
          type: "conductual",
          title: "Cómete ese sapo",
          instructions:
            "Elige una tarea importante que llevas varios días evitando. Trabaja en ella durante 15 minutos. Después responde: ¿qué imaginaba antes de empezar?, ¿qué pasó realmente?, ¿quise continuar después de los 15 minutos?, ¿qué aprendí sobre mi dificultad para empezar?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions: "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
          items: []
        }
      ]
    },

    {
      day: "Día 6",
      exercises: [
        {
          type: "libre",
          title: "Fecha",
          instructions: "Escribe la fecha de hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Día de mi ciclo menstrual",
          instructions: "Escribe en qué día de tu ciclo estás hoy.",
          items: []
        },
        {
          type: "reflexion",
          title: "Un paso hacia mi propósito",
          instructions:
            "Responde: ¿A quién me gustaría ayudar? ¿Con qué tipo de situación o experiencia siento que podría acompañar a otras personas? ¿Qué podría empezar a hacer sin esperar tener todo resuelto? Elige un solo paso pequeño que puedas dar esta semana.",
          items: []
        },
        {
          type: "reto",
          title: "Mi primer paso",
          instructions:
            "Haz hoy una acción pequeña relacionada con ese propósito. Puede ser hablar con tu pastor, averiguar una formación, escribir una idea para una charla, anotar temas que te gustaría compartir o investigar dónde podrías empezar.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions: "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
          items: []
        }
      ]
    },

    {
      day: "Día 7",
      exercises: [
        {
          type: "libre",
          title: "Fecha",
          instructions: "Escribe la fecha de hoy.",
          items: []
        },
        {
          type: "libre",
          title: "Día de mi ciclo menstrual",
          instructions: "Escribe en qué día de tu ciclo estás hoy.",
          items: []
        },
        {
          type: "reflexion",
          title: "Mi evidencia de esta semana",
          instructions:
            "Revisa tu semana y responde: ¿En qué momento fui mi aliada en lugar de mi jueza? ¿Qué pude comprender o dejar de reprocharme? ¿Qué tarea logré avanzar? ¿Cuál fue mi sapo? ¿Qué paso concreto di hacia mi propósito? ¿Qué quiero repetir la próxima semana?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions: "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
          items: []
        }
      ]
    }
  ]
},
  gracielaSemana11: {
  name: "Graciela · Semana 11 · Lo que me molesta y lo que puedo soltar",

  label: "Semana 11 · Lo que me molesta y lo que puedo soltar",

  welcome:
    "Gracy, esta semana quiero que observes con más precisión las situaciones que todavía te molestan. La idea es identificar qué pasó, qué fue exactamente lo que te dolió, qué herida se activa, qué sí depende de ti y qué necesitas soltar.",

  closing:
    "Al terminar la semana, revisa si aparece un patrón debajo de las situaciones que te molestaron. Esto nos ayudará a distinguir cuándo necesitas poner un límite, cuándo necesitas expresar algo y cuándo puedes confiar y soltar.",

  days: [
    {
      day: "Día 1",
      exercises: [
        {
          type: "reflexion",
          title: "¿Qué me molesta realmente?",
          instructions:
            "Elige una situación reciente que te haya molestado. Responde: ¿Qué pasó? ¿Qué fue exactamente lo que me molestó? ¿Por qué creo que eso me afectó?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 2",
      exercises: [
        {
          type: "reflexion",
          title: "¿Qué herida toca?",
          instructions:
            "Piensa en algo que te haya molestado hoy o recientemente. ¿Te sentiste expuesta, invadida, ignorada, utilizada, poco valorada, tratada injustamente o fue otra cosa? ¿Qué experiencia anterior se parece a esto?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 3",
      exercises: [
        {
          type: "reflexion",
          title: "Lo mío y lo de los demás",
          instructions:
            "Elige una situación que te esté preocupando o molestando. Divide tu respuesta en dos partes: 1) Esto sí depende de mí. 2) Esto pertenece a otra persona. Después escribe una acción concreta que sí puedes hacer y una cosa que necesitas soltar.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 4",
      exercises: [
        {
          type: "reflexion",
          title: "Confiar en mis hijos",
          instructions:
            "Piensa en una situación de Richard o de alguno de tus hijos donde sientas ganas de proteger, intervenir o anticiparte. ¿Qué te preocupa? ¿Qué evidencia tienes de que esa persona puede decidir, hablar o poner sus propios límites? ¿Qué parte puedes confiarle?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 5",
      exercises: [
        {
          type: "conductual",
          title: "Molestarme sin intervenir de inmediato",
          instructions:
            "Si hoy ocurre algo que no te gusta, intenta esperar antes de intervenir. Después registra: ¿qué sentí?, ¿qué quería hacer inmediatamente?, ¿realmente necesitaba hacer algo?, ¿qué ocurrió cuando esperé un poco?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 6",
      exercises: [
        {
          type: "reflexion",
          title: "La herida detrás del enojo",
          instructions:
            "Revisa las situaciones que registraste esta semana. ¿Qué razón se repite debajo de tu enojo o molestia? Puede ser privacidad, injusticia, falta de reciprocidad, sentirte utilizada, sentir que no respetan límites u otra. Escribe cuál aparece con más fuerza y qué te hace pensar eso.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 7",
      exercises: [
        {
          type: "reflexion",
          title: "Cierre de semana: controlar, limitar o soltar",
          instructions:
            "Revisa tu semana y responde: ¿Qué intenté controlar? ¿Qué pude soltar? ¿Qué situación sí necesitaba un límite? ¿Qué pude confiar a otra persona? ¿Cuál fue la herida o molestia que apareció con más frecuencia?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    }
  ]
},
  gracielaSemana10: {
    name: "Graciela · Semana 10 · Flexibilidad en acción",

    label: "Semana 10 · Flexibilidad en acción",

    welcome:
      "Gracy, esta semana vamos a llevar a la práctica algo que descubrimos en sesión: tu capacidad de adaptarte, aprender y actualizarte. No quiero que hagas muchas cosas. Quiero que observes cómo respondes cuando necesitas aprender algo nuevo y que avances con pasos pequeños.",

    closing:
      "Esta semana no buscábamos hacer muchas cosas. Buscábamos comprobar que puedes aprender, adaptarte y seguir avanzando sin depender siempre de lo que ya conoces. Guarda especialmente cualquier momento en el que pensaste: esto antes me habría costado más.",

    days: [
      {
        day: "Día 1",
        exercises: [
          {
            type: "reflexion",
            title: "Lo que conservo y lo que actualizo",
            instructions:
              "Piensa en lo que vimos sobre generaciones. Responde brevemente: ¿Qué característica aprendida de tu familia o generación reconoces hoy como una fortaleza? ¿Qué forma de pensar o actuar sientes que hoy necesitas actualizar?",
            items: []
          },
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions:
              "Registra tu nivel de energía del 1 al 10. En el espacio de abajo escribe en una frase cómo está tu estado de ánimo.",
            items: []
          }
        ]
      },

      {
        day: "Día 2",
        exercises: [
          {
            type: "reto",
            title: "Hoy aprendo algo tecnológico",
            instructions:
              "Elige UNA cosa tecnológica pequeña que normalmente pedirías a otra persona que haga por ti e intenta aprenderla tú.",
            items: [
              "Elegí qué quiero aprender",
              "Intenté resolverlo por mí misma",
              "Identifiqué qué pude hacer sola"
            ]
          },
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions:
              "Registra tu energía del 1 al 10 y escribe cómo está tu estado de ánimo.",
            items: []
          }
        ]
      },

      {
        day: "Día 3",
        exercises: [
          {
            type: "reflexion",
            title: "Mi ADN helicoidal en acción",
            instructions:
              "Busca un momento reciente en el que hayas reaccionado, pensado o actuado de una manera diferente a como lo habrías hecho años atrás. Escribe qué pasó, cómo habrías reaccionado antes, qué hiciste diferente ahora y qué aprendiste de ese cambio.",
            items: []
          },
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions:
              "Registra tu energía y estado de ánimo.",
            items: []
          }
        ]
      },

      {
        day: "Día 4",
        exercises: [
          {
            type: "conductual",
            title: "Tecnología para mi vida real",
            instructions:
              "Hoy no vas a aprender tecnología por aprender. Elige una herramienta que te sirva para algo que realmente necesitas: neerlandés, estudio, organización, trámites, comunicación o algún proyecto personal.",
            items: [
              "Elegí una herramienta concreta",
              "La usé para algo que realmente necesito",
              "Identifiqué qué parte todavía necesito aprender"
            ]
          },
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions:
              "Registra tu energía del 1 al 10 y cómo te sentiste hoy.",
            items: []
          }
        ]
      },

      {
        day: "Día 5",
        exercises: [
          {
            type: "reto",
            title: "Solo el siguiente paso",
            instructions:
              "Escoge UNA prioridad: ejercicio, examen o neerlandés. No intentes terminarla. Haz solamente el siguiente paso pequeño.",
            items: [
              "Elegí una sola prioridad",
              "Definí el paso más pequeño posible",
              "Hice ese paso"
            ]
          },
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions:
              "Registra tu energía y estado de ánimo.",
            items: []
          }
        ]
      },

      {
        day: "Día 6",
        exercises: [
          {
            type: "reflexion",
            title: "De dónde vengo y qué elijo hoy",
            instructions:
              "Completa estas dos frases sin pensarlas demasiado: 1) De lo que aprendí de mi familia y mi generación quiero conservar... 2) En esta etapa de mi vida necesito aprender o actualizar...",
            items: []
          },
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions:
              "Registra tu energía del 1 al 10 y tu estado de ánimo.",
            items: []
          }
        ]
      },

      {
        day: "Día 7",
        exercises: [
          {
            type: "reflexion",
            title: "Cierre de semana",
            instructions:
              "Revisa tu semana y responde: ¿Qué aprendiste que te hizo sentir más capaz? ¿En qué viste tu capacidad de adaptarte? ¿Qué quieres seguir practicando la próxima semana?",
            items: []
          },
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions:
              "Registra tu energía y estado de ánimo.",
            items: []
          }
        ]
      }
    ]
  },
  gracielaSemana10: {
  name: "Graciela · Semana 10 · Filtro Técnico en acción",

  label: "Semana 10 · Filtro Técnico en acción",

  welcome:
    "Gracy, esta semana vas a observar en situaciones reales algunas de las fortalezas, debilidades, oportunidades y amenazas que identificamos en nuestra sesión. La idea es que puedas reconocer cómo aparecen en tu día a día.",

  closing:
    "Al terminar estos siete días, revisa lo que registraste. Todo lo que observes nos servirá para continuar y terminar juntas el ejercicio del Filtro Técnico.",

  days: [
    {
      day: "Día 1",
      exercises: [
        {
          type: "reflexion",
          title: "Cuando me da miedo empezar",
          instructions:
            "Piensa en algo que has estado postergando. ¿Qué quieres hacer? ¿Qué te da miedo? ¿Qué imaginas que podría pasar? ¿Cuál sería el primer paso más pequeño que podrías hacer?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 2",
      exercises: [
        {
          type: "reto",
          title: "Empiezo aunque no esté perfecto",
          instructions:
            "Elige UNA cosa que has estado dejando para después. Dedícale solamente 10 minutos. Después cuéntame qué hiciste, qué pasó cuando empezaste y si fue tan difícil como habías anticipado.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 3",
      exercises: [
        {
          type: "reflexion",
          title: "Mi fortaleza y su otro lado",
          instructions:
            "Elige una de las fortalezas que identificaste: vender, comunicarte, hablar o flexibilidad mental. ¿Cuándo te ayuda? ¿En qué situación esa misma fortaleza podría jugarte en contra? Busca un ejemplo real.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 4",
      exercises: [
        {
          type: "conductual",
          title: "Practico ser enseñable",
          instructions:
            "Identifica algo que otra persona sabe y tú podrías aprender. Pregunta, escucha o acepta una sugerencia intentando no justificarte ni responder inmediatamente desde lo que ya sabes. Después escribe qué aprendiste de la experiencia.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 5",
      exercises: [
        {
          type: "registro",
          title: "Antes de reaccionar",
          instructions:
            "Si hoy aparece una emoción fuerte, registra: ¿qué pasó?, ¿qué sentiste?, ¿qué querías hacer inmediatamente?, ¿qué hiciste finalmente? y, mirándolo después, ¿qué respuesta habría sido mejor para ti?",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 6",
      exercises: [
        {
          type: "reto",
          title: "Hago algo desconocido",
          instructions:
            "Haz una cosa pequeña diferente a lo habitual. Puede ser aprender algo, preguntar, probar una herramienta o cambiar una manera de hacer algo. Después registra qué hiciste y qué sentiste antes y después.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    },

    {
      day: "Día 7",
      exercises: [
        {
          type: "reflexion",
          title: "Mi FODA esta semana",
          instructions:
            "Después de observarte durante estos días, identifica una fortaleza que viste funcionando, una debilidad que apareció, una oportunidad que descubriste y una amenaza que necesitas vigilar. Pon un ejemplo concreto de cada una.",
          items: []
        },
        {
          type: "energia",
          title: "Mi energía de hoy",
          instructions:
            "Registra tu nivel de energía del 1 al 10.",
          items: []
        },
        {
          type: "libre",
          title: "Novedades de mi día",
          instructions:
            "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante que quieras registrar.",
          items: []
        }
      ]
    }
  ]
},
  letty_entregar_circulo_app5: {
  name: "Letty · Entregar el círculo",
  label: "Semana App 5 · Dejar de sostener el círculo",

  welcome: `Mi Letty, esta semana vamos a seguir trabajando con el dibujo que hiciste en sesión.

En ese dibujo apareció algo muy importante: la ansiedad estaba dentro de un círculo.

Esta semana no vamos a intentar quitar la ansiedad.
No vamos a pelear con ella.
No vamos a vigilarla.

Vamos a practicar algo nuevo:

dejar de sostener el círculo.

La frase de esta semana es:

“Señor, te entrego el círculo. Ya no voy a ser guardia de mi ansiedad.”`,

  closing: `Mi Letty, esta semana no medimos si la ansiedad desapareció.

Medimos si pudiste dejar de vigilarla un poquito más, si pudiste entregarle el círculo al Señor y si recordaste que no tienes que controlar todo lo que sientes.

La ansiedad puede caminar.
Tú puedes vivir.
Dios sostiene lo que tú ya no puedes sostener.`,

  days: DAYS.map((d, i) => {
    if (i >= 5) {
      return {
        day: d,
        exercises: []
      };
    }

    const plan = [
      [
        {
          type: "checklist",
          title: "Abrir una pequeña salida",
          instructions: `Toma el mismo dibujo que hiciste en la sesión.

No hagas un dibujo nuevo.
No borres la ansiedad.
No borres el círculo completo.

Solo abre una pequeña parte del círculo, como si hicieras una salida.

No tienes que entenderlo ni explicarlo. Solo hazlo.`,
          items: [
            "Tomé el mismo dibujo",
            "Abrí una pequeña salida en el círculo",
            "No borré la ansiedad",
            "Lo hice sin intentar entenderlo perfecto"
          ]
        },
        {
          type: "checklist",
          title: "Frase del día",
          instructions: `Después de abrir la salida, repite despacio:

“La ansiedad no tiene que estar encerrada para que yo esté segura.”`,
          items: [
            "Repetí la frase",
            "La dije en voz baja",
            "La pensé por dentro",
            "Hoy solo pude leerla"
          ]
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme. No tienes que explicar el dibujo. Solo cuéntame qué pasó contigo al hacerlo.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Dejarla caminar por el paisaje",
          instructions: `Vuelve a mirar tu dibujo.

Ahora imagina que esa personita que representa la ansiedad puede caminar por el paisaje.

No la sigas.
No la vigiles.
No la encierres otra vez.

Solo permite que esté ahí, moviéndose, sin que tú tengas que hacer nada.`,
          items: [
            "Imaginé a la ansiedad caminando por el paisaje",
            "No intenté encerrarla otra vez",
            "No intenté hacerla desaparecer",
            "Me costó, pero lo intenté"
          ]
        },
        {
          type: "checklist",
          title: "Yo hago otra cosa",
          instructions: `En el mismo dibujo, agrega algo que tú puedas estar haciendo mientras la ansiedad camina.

Puede ser descansar, orar, mirar el sol, estar con tu familia, sentarte, caminar o simplemente respirar.

Lo importante es que tú no estés vigilando a la ansiedad.`,
          items: [
            "Me dibujé haciendo otra cosa",
            "No me dibujé vigilando la ansiedad",
            "Puse una acción sencilla para mí",
            "Lo hice aunque me pareció raro"
          ]
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme del día.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Entregar el círculo",
          instructions: `Mira tu dibujo por unos segundos.

Luego dile al Señor:

“Señor, te entrego el círculo. Yo ya no puedo sostenerlo. Esta ansiedad es tuya. Mi cuerpo es tuyo. Mi vida está en tus manos.”

No lo digas para que la ansiedad se vaya.
Dilo como rendición.`,
          items: [
            "Le entregué el círculo al Señor",
            "Le entregué la ansiedad",
            "Le entregué mi cuerpo",
            "Hoy solo pude intentarlo"
          ]
        },
        {
          type: "checklist",
          title: "Cambiar mi oración",
          instructions: `Hoy no vamos a pedir: “Señor, quítame esto ya.”

Hoy vamos a pedir:

“Señor, dame paz mientras esto pasa. Ayúdame a sentir que estás conmigo, aunque mi cuerpo esté activado.”`,
          items: [
            "Cambié mi oración",
            "Pedí paz en medio de lo que siento",
            "Pedí sentir a Dios conmigo",
            "Me costó no pedir que se quite"
          ]
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Observar sin arreglar",
          instructions: `Cuando aparezca una sensación física, no intentes quitarla inmediatamente.

Solo obsérvala por unos segundos y di:

“Esto está pasando en mi cuerpo. No tengo que arreglarlo ahora. Puedo observarlo sin pelear.”

Si es algo nuevo, fuerte o diferente, recuerda que sí puedes consultarlo con tu médico. Pero si es el patrón conocido de ansiedad, solo obsérvalo sin entrar al bucle.`,
          items: [
            "Observé una sensación sin pelear",
            "No intenté quitarla de inmediato",
            "Recordé que no tengo que arreglar todo",
            "Hoy no apareció una sensación fuerte"
          ]
        },
        {
          type: "checklist",
          title: "No soy guardia de seguridad",
          instructions: `Repite despacio:

“No soy guardia de seguridad de mi ansiedad. No tengo que vigilarla todo el día. Puedo dejarla caminar y seguir viviendo.”`,
          items: [
            "Repetí la frase",
            "La dije cuando apareció ansiedad",
            "Me ayudó a soltar un poco",
            "Hoy solo pude leerla"
          ]
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme.",
          items: []
        }
      ],
      [
        {
          type: "checklist",
          title: "Lo que solté esta semana",
          instructions: "Hoy solo registra lo que sí pudiste soltar, aunque haya sido poquito.",
          items: [
            "Solté un poco el control",
            "Dejé de vigilar una sensación",
            "Entregué el círculo al Señor",
            "Dejé que la ansiedad caminara en el dibujo",
            "Me recordé que no tengo que sostener todo",
            "Lo intenté, aunque me costó"
          ]
        },
        {
          type: "checklist",
          title: "Frase de cierre",
          instructions: `Repite esta frase:

“La ansiedad puede caminar. Yo puedo vivir. Dios sostiene lo que yo ya no puedo sostener.”`,
          items: [
            "Repetí la frase",
            "La escribí",
            "La dije en oración",
            "Hoy solo la leí"
          ]
        },
        {
          type: "libre",
          title: "Lo que quiero contar hoy",
          instructions: "Escribe aquí lo que quieras contarme de esta semana.",
          items: []
        }
      ]
    ];

    return {
      day: d,
      exercises: plan[i]
    };
  })
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
  const [mActiveWeek,setMActiveWeek] = useState(0);
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

    const mindfulnessSetup = await ensureGracielaMindfulnessWeek(m, w);
    w = mindfulnessSetup.weeks;
    const dbActiveWeek = mindfulnessSetup.activeWeek ?? await getActiveWeekFromDB(m.id);
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

    const selectedMentee = mentees.find(m => m.id === id);
    const mindfulnessSetup = await ensureGracielaMindfulnessWeek(selectedMentee, w);
    w = mindfulnessSetup.weeks;
    const activeWeek = mindfulnessSetup.activeWeek ?? await getActiveWeekFromDB(id);
    const dbResponses = await getResponsesFromDB(id, activeWeek);

    setMWeeks(w);
    setMawi(activeWeek);
    setMActiveWeek(activeWeek);
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
    setMActiveWeek(localActiveWeek);
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
    setMActiveWeek(nw.length - 1);
  } catch (error) {
    console.error("Error creando nueva semana:", error);
  }
}

  async function doActivate(idx) {
  try {
    await saveActiveWeekToDB(selId, idx);
    setMActiveWeek(idx);
  } catch (error) {
    console.error("Error activando semana:", error);
  }
}
  async function doDeleteLastWeek() {
  if (!selId || mWeeks.length <= 1) return;

  const lastIndex = mWeeks.length - 1;

  // Solo permitimos borrar la última semana
  if (mawi !== lastIndex) {
    alert("Por seguridad, solo puedes eliminar la última semana.");
    return;
  }

  try {
    // Verificar que no tenga respuestas guardadas
    const responses = await getResponsesFromDB(selId, lastIndex);

    const hasResponses = Object.values(responses || {}).some(dayResponses =>
      dayResponses && Object.keys(dayResponses).length > 0
    );

    if (hasResponses) {
      alert("Esta semana tiene respuestas guardadas y no se puede eliminar.");
      return;
    }

    const ok = window.confirm(
      `¿Eliminar la Semana ${lastIndex + 1}? Esta acción no se puede deshacer.`
    );

    if (!ok) return;

    const updatedWeeks = mWeeks.slice(0, -1);

    await saveWeeksToDB(selId, updatedWeeks);

    // Si la semana eliminada era la activa, activar la anterior
    const newActiveIndex = Math.min(mawi, updatedWeeks.length - 1);

    await saveActiveWeekToDB(selId, newActiveIndex);

    setMWeeks(updatedWeeks);
    setMawi(newActiveIndex);
    setMActiveWeek(newActiveIndex);
    setMDay(0);
    setMResps({});

    try {
      const previousResponses = await getResponsesFromDB(
        selId,
        newActiveIndex
      );
      setMResps(previousResponses);
    } catch (error) {
      console.error("Error cargando respuestas:", error);
    }

  } catch (error) {
    console.error("Error eliminando semana:", error);
    alert("No se pudo eliminar la semana.");
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
    const savedWeek=weeks[awi]||weeks[0];
    const week=(user.email||"").toLowerCase()===GRACIELA_EMAIL&&awi===16
      ?GRACIELA_SEMANA_17
      :savedWeek;
    const dp=week.days[day];
    const wd=week.days.every((d,di)=>
      d.exercises.length>0&&d.exercises.every((ex,ei)=>ex.externalOnly||(resps[di]&&resps[di][ei]))
    );
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
    const curAW = mActiveWeek;
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
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                <p style={{fontSize:12,color:"#aaa",margin:0}}>Semanas ({mWeeks.length}/24)</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {mWeeks.length > 1 && mawi === mWeeks.length - 1 && (
                    <button style={OB("#cc3333",{fontSize:12,padding:"4px 10px"})} onClick={doDeleteLastWeek}>
                      🗑 Eliminar última semana
                    </button>
                  )}
                  {mWeeks.length<24&&(
                    <button style={OB(NAVY,{fontSize:12,padding:"4px 10px"})} onClick={doAddWeek}>+ Nueva semana</button>
                  )}
                </div>
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
            {(selM.email||"").toLowerCase()===GRACIELA_EMAIL&&(
              <div style={{...C,background:"#fff8f6",border:"1px solid "+CORAL,marginBottom:"1rem"}}>
                <p style={{margin:"0 0 6px",fontWeight:600,color:NAVY,fontSize:14}}>Sesión 17 · Entrenamiento guiado</p>
                <p style={{margin:"0 0 10px",fontSize:13,color:"#666"}}>Rondas A, B, C y D para trabajar precisión bajo carga durante la sesión.</p>
                <a href="/graciela-sesion17.html" style={{...PB(),display:"inline-block",textDecoration:"none"}}>Abrir entrenamiento</a>
              </div>
            )}
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
                onTemplate={t=>{setEWeek(JSON.parse(JSON.stringify(t)));}}
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
