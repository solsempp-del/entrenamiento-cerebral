import fs from "node:fs";

const path = "src/App.jsx";
let source = fs.readFileSync(path, "utf8");

if (source.includes("ex.externalOnly === true") && source.includes("ex.placeholder||")) {
  console.log("Exercise card UI ya está parcheada.");
  process.exit(0);
}

function replaceOnce(oldText, newText, label) {
  if (!source.includes(oldText)) throw new Error(`No se encontró ${label}`);
  source = source.replace(oldText, newText);
}

const oldScore = '  const [score,setScore] = useState(saved?saved.score||null:null);';
const newScore = '  const [score,setScore] = useState(saved ? (saved.score ?? null) : null);';
replaceOnce(oldScore, newScore, "estado score");

const oldEffect = '  useEffect(()=>{setText(saved?saved.text||"":"");setScore(saved?saved.score||null:null);setChecks(saved?saved.checks||{}:{});},[saved]);';
const newEffect = '  useEffect(()=>{setText(saved?saved.text||"":"");setScore(saved ? (saved.score ?? null) : null);setChecks(saved?saved.checks||{}:{});},[saved]);';
replaceOnce(oldEffect, newEffect, "useEffect de ExCard");

const oldHasChk = '  const hasChk = ["checklist","mindfulness","reto","gimnasia","enfoque","conductual","respiracion","habito","lectura","video"].includes(ex.type);';
const newHasChk = `${oldHasChk}\n  const hideFreeText =\n    ex.hideFreeText === true ||\n    ex.externalOnly === true ||\n    ex.noResponse === true ||\n    (ex.type === "enfoque" && ex.title?.startsWith("Entrenamiento 1 · Atención y concentración")) ||\n    (ex.type === "respiracion" && ex.title?.startsWith("5 minutos de respiración 4-7-8")) ||\n    (ex.type === "checklist" && ex.title === "Lo importante sale de mi cabeza");\n  const hideSave = ex.externalOnly === true || ex.noResponse === true;`;
replaceOnce(oldHasChk, newHasChk, "hasChk en ExCard");

const oldInstructions = '      <p style={{fontSize:13,color:"#888",margin:"0 0 10px",lineHeight:1.6}}>{ex.instructions}</p>';
const newInstructions = `      <p style={{fontSize:13,color:"#888",margin:"0 0 10px",lineHeight:1.6,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>\n        {String(ex.instructions||"").split(/(https?:\\/\\/[^\\s]+)/g).map((part,idx)=>\n          /^https?:\\/\\//.test(part)\n            ? <a key={idx} href={part} target="_blank" rel="noreferrer" style={{color:CORAL,fontWeight:500,textDecoration:"underline"}}>Abrir video de entrenamiento</a>\n            : part\n        )}\n      </p>`;
replaceOnce(oldInstructions, newInstructions, "bloque de instrucciones");

const oldLink = `      {(ex.type==="lectura"||ex.type==="video")&&ex.link&&(\n        <a href={ex.link} target="_blank" rel="noreferrer" style={{display:"inline-block",marginBottom:12,color:CORAL,fontSize:13}}>\n          {ex.type==="video"?"▶ Ver video":"📖 Abrir lectura"}\n        </a>\n      )}`;
const newLink = `      {(ex.type==="lectura"||ex.type==="video")&&ex.link&&(\n        <a href={ex.link} target="_blank" rel="noreferrer" style={{display:"inline-block",marginBottom:12,color:CORAL,fontSize:13,fontWeight:600}}>\n          {ex.linkLabel || (ex.type==="video"?"▶ Ver video":"📖 Abrir lectura")}\n        </a>\n      )}`;
replaceOnce(oldLink, newLink, "link de ejercicio");

const oldScale = '            {[1,2,3,4,5,6,7,8,9,10].map(n=>(';
const newScale = '            {Array.from({length:11-(ex.scaleMin??1)},(_,i)=>i+(ex.scaleMin??1)).map(n=>(';
replaceOnce(oldScale, newScale, "escala de energía");

const oldScoreLabel = '          {score&&<p style={{fontSize:13,color:"#888",marginBottom:8}}>{score<=3?"😴 Energía baja":score<=6?"😐 Energía media":"⚡ Energía alta"}</p>}';
const newScoreLabel = '          {score!=null&&<p style={{fontSize:13,color:"#888",marginBottom:8}}>{score<=3?"😴 Nivel bajo":score<=6?"😐 Nivel medio":"⚡ Nivel alto"}</p>}';
replaceOnce(oldScoreLabel, newScoreLabel, "etiqueta de escala");

const oldTextarea = `      <textarea style={{...I,minHeight:ex.type==="libre"?100:70,resize:"vertical"}}\n        placeholder={ex.type==="libre"?"Cuéntame lo que quieras... 💬":ex.type==="energia"?"¿Qué influye en tu energía? (opcional)":"¿Cómo te sentiste?"}\n        value={text} onChange={e=>setText(e.target.value)}/>`;
const newTextarea = `      {!hideFreeText&&(<textarea style={{...I,minHeight:ex.compactResponse?46:(ex.type==="libre"?100:70),resize:ex.compactResponse?"none":"vertical"}}\n        placeholder={ex.placeholder||(ex.type==="libre"?"Cuéntame lo que quieras... 💬":ex.type==="energia"?"¿Qué influye en tu energía? (opcional)":"¿Cómo te sentiste?")}\n        value={text} onChange={e=>setText(e.target.value)}/>)} `;
replaceOnce(oldTextarea, newTextarea, "textarea de ExCard");

const oldSave = `      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>\n        <button style={{cursor:"pointer",padding:"6px 14px",background:CORAL,color:"#fff",border:"none",borderRadius:6,fontSize:13}} onClick={save}>Guardar</button>\n        {ok&&<span style={{fontSize:12,color:"#1D9E75"}}>✓ Guardado</span>}\n        {saved&&!ok&&<span style={{fontSize:12,color:"#bbb"}}>{saved.at}</span>}\n      </div>`;
const newSave = `      {!hideSave&&(\n      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>\n        <button style={{cursor:"pointer",padding:"6px 14px",background:CORAL,color:"#fff",border:"none",borderRadius:6,fontSize:13}} onClick={save}>Guardar</button>\n        {ok&&<span style={{fontSize:12,color:"#1D9E75"}}>✓ Guardado</span>}\n        {saved&&!ok&&<span style={{fontSize:12,color:"#bbb"}}>{saved.at}</span>}\n      </div>\n      )}`;
replaceOnce(oldSave, newSave, "botón guardar de ExCard");

fs.writeFileSync(path, source, "utf8");
console.log("Exercise card UI parcheada para campos compactos, escalas 0-10 y prácticas externas.");
