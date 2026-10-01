import fs from "node:fs";

const path = "src/App.jsx";
let source = fs.readFileSync(path, "utf8");

if (!source.includes("gracielaSesion16:")) {
  const marker = "const TEMPLATES = {";
  if (!source.includes(marker)) throw new Error("No se encontró const TEMPLATES en src/App.jsx");

  const block = `
  gracielaSesion16: {
    name: "Graciela · Sesión 16 · Lectura bajo presión",
    label: "Semana 16 · Sesión en vivo: lectura y presión temporal",
    welcome: "Gracy, hoy haremos tres prácticas cortas para observar cómo cambia tu comprensión cuando aparece la presión del tiempo. No buscamos hacerlo rápido ni perfecto; queremos observar qué ocurre para entrenarlo mejor.",
    closing: "Terminaste las tres prácticas de hoy. Con estos resultados vamos a decidir qué necesita entrenarse después: lectura bajo presión, manejo del reloj, instrucciones complejas o respuesta escrita.",
    days: [
      {
        day: "Día 1",
        exercises: [
          {
            type: "timer",
            title: "Práctica 1 · Lectura y comprensión",
            instructions: "Abre la práctica y responde una pregunta a la vez. Lee completa antes de responder.",
            link: "/graciela-sesion16-rondaA.html",
            items: []
          },
          {
            type: "timer",
            title: "Práctica 2 · Lectura con tiempo",
            instructions: "Haz esta práctica solo cuando Sol te lo indique. Verás un reloj global de 3 minutos. Lee completa antes de responder.",
            link: "/graciela-sesion16-rondaB.html",
            items: []
          },
          {
            type: "timer",
            title: "Práctica 3 · Leer y escribir",
            instructions: "Haz esta práctica solo cuando Sol te lo indique. Lee cada consigna y escribe una respuesta breve. Verás un reloj global de 4 minutos.",
            link: "/graciela-sesion16-rondaC.html",
            items: []
          }
        ]
      },
      { day: "Día 2", exercises: [] },
      { day: "Día 3", exercises: [] },
      { day: "Día 4", exercises: [] },
      { day: "Día 5", exercises: [] },
      { day: "Día 6", exercises: [] },
      { day: "Día 7", exercises: [] }
    ]
  },
`;

  source = source.replace(marker, `${marker}${block}`);
}

fs.writeFileSync(path, source, "utf8");
console.log("Graciela Sesión 16 integrada como plantilla.");
