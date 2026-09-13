import fs from "node:fs";

const path = "src/App.jsx";
const source = fs.readFileSync(path, "utf8");

if (source.includes("gracielaSemana13:")) {
  console.log("Graciela Semana 13 ya está integrada.");
  process.exit(0);
}

const marker = "const TEMPLATES = {";
if (!source.includes(marker)) {
  throw new Error("No se encontró const TEMPLATES en src/App.jsx");
}

const block = `
  gracielaSemana13: {
    name: "Graciela · Semana 13 · Del no sé cómo al primer paso",
    label: "Semana 13 · Del no sé cómo al primer paso",
    welcome: "Gracy, esta semana vamos a trabajar en algo muy concreto: qué haces cuando quieres avanzar pero todavía no sabes cómo. La meta es identificar exactamente dónde te atoras, averiguar el siguiente paso y empezar a definir con más claridad el tema y las personas a quienes quieres dirigir tu contenido.",
    closing: "Revisa lo que hiciste esta semana y fíjate especialmente en esto: qué cosa parecía difícil antes de empezar, qué averiguaste, qué sí pudiste hacer y qué tema comenzó a tomar forma para ti.",
    days: DAYS.map((d, i) => {
      const main = [
        {
          type: "reflexion",
          title: "¿Qué estoy postergando?",
          instructions: "Escribe algo que quieras hacer y estés postergando porque no sabes cómo hacerlo. Después responde: ¿qué parte exacta es la que no sé cómo hacer? Evita responder sobre todo el proyecto; identifica el punto concreto donde te atoras.",
          items: []
        },
        {
          type: "conductual",
          title: "Solo necesito el siguiente paso",
          instructions: "Toma lo que identificaste ayer. Escribe 3 maneras de averiguar cómo hacerlo: preguntar, investigar, probar, pedir orientación u otra. Elige una y hazla hoy. Después responde: ¿qué descubrí?",
          items: []
        },
        {
          type: "reflexion",
          title: "¿De qué quiero hablar?",
          instructions: "Escribe 5 temas de los que podrías hablar durante 20 minutos porque los has vivido, los has aprendido o te interesan genuinamente. Después elige los 2 que más te entusiasman.",
          items: []
        },
        {
          type: "reflexion",
          title: "¿A quién quiero ayudar?",
          instructions: "Para cada uno de los 2 temas que elegiste responde: ¿a qué tipo de persona podría ayudar con esto?, ¿qué problema concreto tiene esa persona?, ¿qué me gustaría que cambiara después de escucharme?",
          items: []
        },
        {
          type: "reflexion",
          title: "Mi primera hipótesis de nicho",
          instructions: "Elige un tema y un tipo de persona. Completa esta frase: Quiero hablar sobre ______ para ayudar a ______ que están pasando por ______. Tómalo como una primera hipótesis; todavía puedes ajustarla.",
          items: []
        },
        {
          type: "conductual",
          title: "La voz del miedo y mi voz",
          instructions: "Piensa en algo que quieras intentar. Completa: El miedo me dice ______. / Yo hoy pienso ______. Después dedica máximo 15 minutos a una acción relacionada con lo que quieres construir y registra qué hiciste.",
          items: []
        },
        {
          type: "reflexion",
          title: "Mi evidencia de esta semana",
          instructions: "Completa: Esta semana pensé que no sabía cómo ______; averigüé ______; hice ______; descubrí que ______. Después escribe cuál será tu siguiente paso.",
          items: []
        }
      ][i];

      return {
        day: d,
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
            instructions: "Escribe en qué día de tu ciclo menstrual estás. Día 1 = primer día de sangrado menstrual. Continúa contando todos los días hasta que comience la siguiente menstruación; no reinicies el conteo cuando termine el sangrado.",
            items: []
          },
          main,
          {
            type: "energia",
            title: "Mi energía de hoy",
            instructions: "Registra tu nivel de energía del 1 al 10.",
            items: []
          },
          {
            type: "libre",
            title: "Novedades de mi día",
            instructions: "Cuéntame brevemente cómo estuvo tu día, cómo te sentiste y si ocurrió algo importante.",
            items: []
          }
        ]
      };
    })
  },
`;

const updated = source.replace(marker, `${marker}${block}`);
fs.writeFileSync(path, updated, "utf8");
console.log("Graciela Semana 13 integrada en src/App.jsx para este build.");
