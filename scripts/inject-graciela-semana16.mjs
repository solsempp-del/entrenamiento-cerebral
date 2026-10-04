import fs from "node:fs";

const appPath = "src/App.jsx";
const configPath = "public/graciela-semana16-config.json";
let source = fs.readFileSync(appPath, "utf8");

if (source.includes("gracielaSemana16:")) {
  console.log("Graciela Semana 16 ya está integrada.");
  process.exit(0);
}

const marker = "const TEMPLATES = {";
if (!source.includes(marker)) throw new Error("No se encontró const TEMPLATES en src/App.jsx");
if (!fs.existsSync(configPath)) throw new Error("No se encontró la configuración de Semana 16");

const week = JSON.parse(fs.readFileSync(configPath, "utf8"));
const block = `
  gracielaSemana16: {
    name: "Graciela · Semana 16 · Enfoque, examen y registro físico",
    label: ${JSON.stringify(week.label)},
    welcome: ${JSON.stringify(week.welcome)},
    closing: ${JSON.stringify(week.closing)},
    days: ${JSON.stringify(week.days, null, 2)}
  },
`;

source = source.replace(marker, `${marker}${block}`);
fs.writeFileSync(appPath, source, "utf8");
console.log("Graciela Semana 16 integrada para este build.");
