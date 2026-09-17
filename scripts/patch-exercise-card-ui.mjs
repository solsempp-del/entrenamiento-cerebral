import fs from "node:fs";

const path = "src/App.jsx";
let source = fs.readFileSync(path, "utf8");

if (source.includes("const hideFreeText =")) {
  console.log("Exercise card UI ya está parcheada.");
  process.exit(0);
}

const oldHasChk = '  const hasChk = ["checklist","mindfulness","reto","gimnasia","enfoque","conductual","respiracion","habito","lectura","video"].includes(ex.type);';
const newHasChk = `${oldHasChk}\n  const hideFreeText =\n    (ex.type === "enfoque" && ex.title?.startsWith("Entrenamiento 1 · Atención y concentración")) ||\n    (ex.type === "respiracion" && ex.title?.startsWith("5 minutos de respiración 4-7-8")) ||\n    (ex.type === "checklist" && ex.title === "Lo importante sale de mi cabeza");`;

if (!source.includes(oldHasChk)) {
  throw new Error("No se encontró hasChk en ExCard");
}
source = source.replace(oldHasChk, newHasChk);

const oldInstructions = '      <p style={{fontSize:13,color:"#888",margin:"0 0 10px",lineHeight:1.6}}>{ex.instructions}</p>';
const newInstructions = `      <p style={{fontSize:13,color:"#888",margin:"0 0 10px",lineHeight:1.6,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>\n        {String(ex.instructions||"").split(/(https?:\\/\\/[^\\s]+)/g).map((part,idx)=>\n          /^https?:\\/\\//.test(part)\n            ? <a key={idx} href={part} target="_blank" rel="noreferrer" style={{color:CORAL,fontWeight:500,textDecoration:"underline"}}>Abrir video de entrenamiento</a>\n            : part\n        )}\n      </p>`;

if (!source.includes(oldInstructions)) {
  throw new Error("No se encontró el bloque de instrucciones de ExCard");
}
source = source.replace(oldInstructions, newInstructions);

const oldTextarea = `      <textarea style={{...I,minHeight:ex.type==="libre"?100:70,resize:"vertical"}}\n        placeholder={ex.type==="libre"?"Cuéntame lo que quieras... 💬":ex.type==="energia"?"¿Qué influye en tu energía? (opcional)":"¿Cómo te sentiste?"}\n        value={text} onChange={e=>setText(e.target.value)}/>`;
const newTextarea = `      {!hideFreeText&&(<textarea style={{...I,minHeight:ex.type==="libre"?100:70,resize:"vertical"}}\n        placeholder={ex.type==="libre"?"Cuéntame lo que quieras... 💬":ex.type==="energia"?"¿Qué influye en tu energía? (opcional)":"¿Cómo te sentiste?"}\n        value={text} onChange={e=>setText(e.target.value)}/>)} `;

if (!source.includes(oldTextarea)) {
  throw new Error("No se encontró el textarea de ExCard");
}
source = source.replace(oldTextarea, newTextarea);

fs.writeFileSync(path, source, "utf8");
console.log("Exercise card UI parcheada: links clicables, saltos de línea y sin campo libre en Semana 14 de Graciela.");
