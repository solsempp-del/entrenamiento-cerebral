import fs from "node:fs";

const path = "src/App.jsx";
const source = fs.readFileSync(path, "utf8");

if (source.includes("gracielaSemana14:")) {
  console.log("Graciela Semana 14 ya está integrada.");
  process.exit(0);
}

const marker = "const TEMPLATES = {";
if (!source.includes(marker)) {
  throw new Error("No se encontró const TEMPLATES en src/App.jsx");
}

const focusLink = "https://drive.google.com/file/d/1VTmSAZtDOOYJvuYbQzEsz_hMswvCXAqN/view?usp=drive_link";

const block = `
  gracielaSemana14: {
    name: "Graciela · Semana 14 · Entrenamiento cerebral 1",
    label: "Semana 14 · Atención, concentración y memoria externa",
    welcome: "Gracy, esta semana comenzamos una etapa distinta: entrenamiento cerebral. No necesitas escribir reflexiones largas. Vamos a repetir pocos ejercicios para entrenar atención, concentración y el hábito de sacar de la memoria las cosas importantes. La repetición es parte del entrenamiento.",
    closing: "Esta semana buscamos práctica, no análisis. Observa qué ejercicios pudiste repetir con mayor constancia y qué apoyo externo te ayudó a recordar mejor lo importante. La próxima sesión revisaremos lo que funcionó y ajustaremos una sola herramienta a la vez.",
    days: DAYS.map((d) => ({
      day: d,
      exercises: [
        {
          type: "respiracion",
          title: "5 minutos de respiración 4-7-8 al despertar",
          instructions: "Haz este ejercicio apenas te despiertes, antes de comenzar tus actividades. Inhala por la nariz durante 4 segundos, sostén el aire durante 7 segundos y exhala lentamente durante 8 segundos. Repite durante aproximadamente 5 minutos, sin forzar la respiración. Si sientes mareo o incomodidad, detente y vuelve a respirar normalmente.",
          items: []
        },
        {
          type: "enfoque",
          title: "Entrenamiento 1 · Atención y concentración · Mañana",
          instructions: "Haz este entrenamiento en la mañana.\\n\\nVIDEO: ${focusLink}\\n\\nCONDICIONES:\\n• Usa una pantalla amplia, preferiblemente computador. Evita el celular.\\n• Colócate aproximadamente a 40 cm de la pantalla.\\n• Busca un lugar tranquilo, seguro, privado y sin interrupciones.\\n• Duración total: menos de 10 minutos.\\n• Sigue el orden de la serie; no saltes videos ni los hagas de forma aleatoria.\\n\\nPASO A PASO:\\n1. Fija la mirada en el punto negro central dentro del recuadro gris. Mantén los ojos fijos sin desviarlos hacia los lados.\\n2. Concéntrate únicamente en el punto negro hasta notar que las manchas de colores laterales comienzan a desvanecerse.\\n3. Cuando veas el recuadro gris liso, intenta sostener ese estado entre 5 y 10 segundos.\\n4. Parpadea y descansa la vista entre 10 y 15 segundos.\\n5. Vuelve a fijar la mirada y repite el ciclo.",
          items: []
        },
        {
          type: "enfoque",
          title: "Entrenamiento 1 · Atención y concentración · Tarde",
          instructions: "Repite el mismo entrenamiento una vez durante la tarde. Evita hacerlo en la noche.\\n\\nVIDEO: ${focusLink}\\n\\nRecuerda: pantalla amplia, aproximadamente 40 cm de distancia, ambiente sin interrupciones, mirada fija en el punto negro central, descanso de 10 a 15 segundos entre ciclos. Duración total: menos de 10 minutos.",
          items: []
        },
        {
          type: "checklist",
          title: "Lo importante sale de mi cabeza",
          instructions: "Hoy elige UNA cosa importante que no quieras depender de recordar mentalmente: una cita, una tarea futura, algo que debes llevar, una llamada o una hora importante. Ponla inmediatamente en un sistema externo: Google Calendar, alarma, timer o recordatorio. Después verifica que el día, la hora y el aviso estén correctos.",
          items: [
            "Saqué una cosa importante de mi cabeza",
            "La puse en Calendar, alarma, timer o recordatorio",
            "Verifiqué que la información quedó correcta"
          ]
        }
      ]
    }))
  },
`;

const updated = source.replace(marker, `${marker}${block}`);
fs.writeFileSync(path, updated, "utf8");
console.log("Graciela Semana 14 integrada en src/App.jsx para este build.");
