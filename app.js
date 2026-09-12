const { useState, useEffect, useRef, useMemo } = React;

function toneForPhase(phase, mode) {
  if (mode !== "mix") return mode || "standard";
  if (phase === "inspire") return "aigue";
  if (phase === "hold") return "standard";
  return "grave";
}
function playBell(ctx, time, tone, volume) {
  try {
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o1.connect(g); o2.connect(g); g.connect(ctx.destination);
    o1.type = o2.type = "sine";
    let f1 = 880, f2 = 1200;
    if (tone === "grave") { f1 = 440; f2 = 600; }
    else if (tone === "aigue") { f1 = 1500; f2 = 2100; }
    o1.frequency.setValueAtTime(f1, time);
    o2.frequency.setValueAtTime(f2, time);
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(volume, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 1.5);
    o1.start(time); o1.stop(time + 1.5);
    o2.start(time); o2.stop(time + 1.5);
  } catch (e) {}
}
const MARK = {
  ringTop: "M 14.75 44 A 48 48 0 0 1 105.25 44",
  ringBot: "M 105.25 76 A 48 48 0 0 1 14.75 76",
  wave1: "M 8 57 C 22 42, 38 42, 54 56 C 70 70, 86 70, 106 55",
  wave2: "M 8 70 C 22 55, 38 55, 54 69 C 70 83, 86 83, 106 68",
};
function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <g stroke="#67e8f9" strokeWidth="6.5" strokeLinecap="round" fill="none">
        <path d={MARK.ringTop} /><path d={MARK.ringBot} />
      </g>
      <path d={MARK.wave1} stroke="#7deaf5" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d={MARK.wave2} stroke="#5bd4e8" strokeWidth="5.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
const EXERCISES = [
  { id:"box", name:"Box Breathing", subtitle:"Gestion du stress", emoji:"⬜", duration:"4–6 min", level:"Débutant", tags:["#Focus","#Débutant"], intentions:["focus"], color:"#38bdf8", ratio:{inspire:4,hold:4,expire:4,holdEmpty:4}, cycles:6, intensity:{inspire:"douce",hold:"neutre",expire:"contrôlée",holdEmpty:"neutre"}, instructions:{inspire:"Inspire par le nez.",hold:"Retiens, épaules basses.",expire:"Expire complètement.",holdEmpty:"Pause vide."}, description:"Carré égal." },
  { id:"478", name:"4-7-8", subtitle:"Tranquillisant naturel", emoji:"🌙", duration:"2–3 min", level:"Débutant", tags:["#Sommeil","#Calme","#Débutant"], intentions:["sommeil","calme"], color:"#a78bfa", ratio:{inspire:4,hold:7,expire:8,holdEmpty:0}, cycles:4, intensity:{inspire:"douce",hold:"neutre",expire:"longue"}, instructions:{inspire:"Inspire 4 comptes.",hold:"Retiens 7 comptes.",expire:"Expire 8 comptes."}, description:"Expire longue." },
  { id:"coherence", name:"Cohérence cardiaque", subtitle:"Équilibre", emoji:"💗", duration:"5 min", level:"Débutant", tags:["#Stress","#Calme","#Débutant"], intentions:["calme","digestion"], color:"#2dd4bf", ratio:{inspire:5,hold:0,expire:5,holdEmpty:0}, cycles:30, intensity:{inspire:"fluide",expire:"fluide"}, instructions:{inspire:"Inspire doucement.",expire:"Expire doucement."}, description:"5–6 cycles / min." },
  { id:"tonique", name:"Respiration tonique", subtitle:"Anti-fatigue", emoji:"⚡", duration:"2–3 min", level:"Débutant", tags:["#Énergie","#Réveil","#Débutant"], intentions:["energie","reveil"], color:"#f59e0b", ratio:{inspire:4,hold:0,expire:2,holdEmpty:0}, cycles:10, intensity:{inspire:"pleine",expire:"courte"}, instructions:{inspire:"Inspire largement.",expire:"Expire plus court."}, description:"Inspire plus longue." },
  { id:"activation", name:"Activation 3–3", subtitle:"Tonicité", emoji:"🔥", duration:"2 min", level:"Intermédiaire", tags:["#Énergie","#Intermédiaire"], intentions:["energie","reveil"], color:"#fbbf24", ratio:{inspire:3,hold:0,expire:3,holdEmpty:0}, cycles:12, intensity:{inspire:"vive",expire:"vive"}, instructions:{inspire:"Inspire net.",expire:"Expire net."}, description:"Cycles courts." },
  { id:"expire", name:"Expire profonde", subtitle:"Parasympathique", emoji:"🍃", duration:"5 min", level:"Avancé", tags:["#Calme","#Avancé"], intentions:["calme"], color:"#2dd4bf", ratio:{inspire:4,hold:0,expire:10,holdEmpty:0}, cycles:8, intensity:{inspire:"discrète",expire:"très longue"}, instructions:{inspire:"Inspire 4.",expire:"Expire 10."}, description:"Expire très longue." }
];
const INTENTION_DEFS = {
  calme:{id:"calme",label:"Calme",tags:["#Calme"]},
  energie:{id:"energie",label:"Énergie",tags:["#Énergie"]},
  focus:{id:"focus",label:"Focus",tags:["#Focus"]},
  sommeil:{id:"sommeil",label:"Sommeil",tags:["#Sommeil"]},
  reveil:{id:"reveil",label:"Réveil",tags:["#Réveil"]},
  digestion:{id:"digestion",label:"Digestion",tags:["#Digestion"]},
  exo:{id:"exo",label:"Exo du jour",tags:["#ExoDuJour"]}
};
const LEVEL_RANK = { "Débutant":0, "Intermédiaire":1, "Avancé":2 };
function parisHour() {
  const raw = new Date().toLocaleString("fr-FR",{timeZone:"Europe/Paris",hour:"numeric",hour12:false});
  const h = parseInt(raw,10);
  return Number.isFinite(h) ? h : new Date().getHours();
}
function fourthIntentionId() {
  const h = parisHour();
  if (h < 5) return "sommeil";
  if (h < 8) return "reveil";
  if (h < 12) return "exo";
  if (h < 15) return "digestion";
  if (h < 20) return "exo";
  if (h < 22) return "digestion";
  return "sommeil";
}
const store = {
  get:(k,fb)=>{ try { const r=localStorage.getItem(k); return r?JSON.parse(r):fb; } catch { return fb; } },
  set:(k,v)=>{ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
};
function getTodayKey(){ return new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Paris"}); }
const PHASE_STYLE = {
  inspire:{accent:"#38bdf8",bg:"from-sky-950 to-sky-900"},
  hold:{accent:"#a78bfa",bg:"from-violet-950 to-violet-900"},
  expire:{accent:"#2dd4bf",bg:"from-teal-950 to-teal-900"},
  holdEmpty:{accent:"#94a3b8",bg:"from-slate-950 to-slate-900"}
};
function buildSequence(ex){
  const seq=[], phases=["inspire","hold","expire","holdEmpty"].filter(p=>ex.ratio[p]>0);
  for(let c=1;c<=ex.cycles;c++) phases.forEach(phase=>seq.push({phase,duration:ex.ratio[phase],cycle:c,totalCycles:ex.cycles,instruction:ex.instructions[phase]||"",intensity:ex.intensity[phase]||"douce"}));
  return seq;
}
function AirFitness(){
  const [tab,setTab]=useState("home");
  const [activeEx,setActiveEx]=useState(null);
  const [sequence,setSequence]=useState([]);
  const [stepIdx,setStepIdx]=useState(0);
  const [beatsLeft,setBeatsLeft]=useState(0);
  const [running,setRunning]=useState(false);
  const [selectedTags,setSelectedTags]=useState([]);
  const [intention,setIntention]=useState(()=>store.get("af_intention",null));
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [bpm,setBpm]=useState(()=>Number(store.get("af_bpm",60))||60);
  const [tone,setTone]=useState(()=>store.get("af_tone","mix"));
  const [volume,setVolume]=useState(()=>Number(store.get("af_volume",0.7)));
  const audioCtxRef=useRef(null), stepRef=useRef(0), seqRef=useRef([]), bpmRef=useRef(bpm), toneRef=useRef(tone), volumeRef=useRef(volume), beatsRef=useRef(0), schedRef=useRef(null), uiRef=useRef(null), nextRef=useRef(0), queueRef=useRef([]);
  useEffect(()=>{ stepRef.current=stepIdx; },[stepIdx]);
  useEffect(()=>{ seqRef.current=sequence; },[sequence]);
  useEffect(()=>{ beatsRef.current=beatsLeft; },[beatsLeft]);
  useEffect(()=>{ bpmRef.current=bpm; store.set("af_bpm",bpm); },[bpm]);
  useEffect(()=>{ toneRef.current=tone; store.set("af_tone",tone); },[tone]);
  useEffect(()=>{ volumeRef.current=volume; store.set("af_volume",volume); },[volume]);
  useEffect(()=>{ store.set("af_intention",intention); },[intention]);
  const dailyExo=useMemo(()=>{
    const today=getTodayKey();
    const saved=store.get("af_exo_du_jour",null);
    if(saved&&saved.date===today){ const f=EXERCISES.find(e=>e.id===saved.id); if(f) return f; }
    const pick=EXERCISES[Math.floor(Math.random()*EXERCISES.length)];
    store.set("af_exo_du_jour",{date:today,id:pick.id});
    return pick;
  },[]);
  const filtered=useMemo(()=>{
    const exo=intention==="exo";
    let list=exo?[dailyExo]:EXERCISES.slice();
    if(!exo&&intention) list=list.filter(ex=>(ex.intentions||[]).includes(intention));
    if(selectedTags.length) list=list.filter(ex=>selectedTags.every(t=>ex.tags.includes(t)));
    return list.sort((a,b)=>(LEVEL_RANK[a.level]??9)-(LEVEL_RANK[b.level]??9));
  },[selectedTags,intention,dailyExo]);
  function advanceBeat(){
    const t=beatsRef.current;
    if(t>1){ setBeatsLeft(t-1); return; }
    const seq=seqRef.current, idx=stepRef.current;
    if(idx<seq.length-1){ const n=idx+1; setStepIdx(n); stepRef.current=n; setBeatsLeft(seq[n].duration); }
    else { stop(); setRunning(false); setTab("home"); }
  }
  function start(){
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    if(!audioCtxRef.current) audioCtxRef.current=new AC();
    const ctx=audioCtxRef.current; if(ctx.state==="suspended") ctx.resume();
    nextRef.current=ctx.currentTime+0.12; queueRef.current=[];
    schedRef.current=setInterval(()=>{
      while(nextRef.current<ctx.currentTime+0.15){
        const step=seqRef.current[stepRef.current];
        playBell(ctx,nextRef.current,toneForPhase(step&&step.phase,toneRef.current),volumeRef.current);
        queueRef.current.push(nextRef.current);
        nextRef.current+=60/(bpmRef.current||60);
      }
    },25);
    uiRef.current=setInterval(()=>{
      const now=ctx.currentTime; let beat=false;
      while(queueRef.current.length&&queueRef.current[0]<=now){ queueRef.current.shift(); beat=true; }
      if(beat) advanceBeat();
    },50);
  }
  function stop(){ clearInterval(schedRef.current); clearInterval(uiRef.current); }
  useEffect(()=>{ stop(); if(running&&tab==="exercise") start(); return stop; },[running,tab,activeEx]);
  const vis=[INTENTION_DEFS.calme,INTENTION_DEFS.energie,INTENTION_DEFS.focus,INTENTION_DEFS[fourthIntentionId()]];
  if(tab==="exercise"&&activeEx&&sequence.length){
    const cur=sequence[stepIdx], st=PHASE_STYLE[cur.phase]||PHASE_STYLE.inspire;
    return (
      <div className={`min-h-screen flex flex-col bg-gradient-to-b ${st.bg}`}>
        <div className="flex justify-between px-5 pt-12">
          <button className="text-white/40" onClick={()=>{setRunning(false);setTab("home");}}>← Quitter</button>
          <p className="text-white/50 text-xs">{activeEx.name}</p>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="text-5xl text-white">{beatsLeft}</div>
          <p className="text-white/80 text-sm text-center">{cur.instruction}</p>
          <select className="tone-select" value={tone} onChange={e=>setTone(e.target.value)}>
            <option value="mix">Mix (selon la phase)</option>
            <option value="grave">Grave</option>
            <option value="standard">Standard</option>
            <option value="aigue">Aiguë</option>
          </select>
          <button className="w-full py-4 rounded-2xl text-white font-semibold" style={{background:st.accent}} onClick={()=>setRunning(r=>!r)}>{running?"Pause":"Démarrer"}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 pt-12 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-white">Air Fitness</h1>
            <p className="text-slate-500 text-xs">Souffle · Présence · Santé</p>
          </div>
          <div className="header-logo"><LogoMark size={34} /></div>
        </div>
        <div className="px-5 mt-5">
          <p className="text-slate-400 text-[13px] mb-2.5">De quoi as-tu besoin maintenant ?</p>
          <div className="intent-row">
            {vis.map(item=>{
              const active=intention===item.id;
              return (
                <button key={item.id} className="super-tag" onClick={()=>setIntention(cur=>cur===item.id?null:item.id)}
                  style={{background:active?"#eab30822":"#1a223099",color:active?"#facc15":"#cbd5e1",border:active?"1px solid #eab30866":"1px solid #33415566"}}>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mx-5 mt-5 rounded-3xl p-5" style={{background:"linear-gradient(145deg,#12182b,#1a1435)",border:"1px solid #2e2a55"}}>
          <p className="text-indigo-400/80 text-[11px] uppercase tracking-[0.15em]">Série en cours</p>
          <p className="text-white text-2xl font-semibold mt-1">—</p>
        </div>
        <div className="px-5 mt-6">
          <div className={filtersOpen?"filter-line open":"filter-line"}>
            <span className="text-slate-500 text-[11px] uppercase tracking-[0.15em]">Filtres</span>
            {["#Débutant","#Stress"].map(tag=>(
              <button key={tag} className="filter-tag" onClick={()=>setSelectedTags(p=>p.includes(tag)?p.filter(t=>t!==tag):[...p,tag])}
                style={{background:selectedTags.includes(tag)?"#0ea5e920":"#0f1524",color:selectedTags.includes(tag)?"#38bdf8":"#64748b",border:"1px solid #1a2236"}}>{tag}</button>
            ))}
            <button className="filter-tag" style={{color:"#64748b",border:"1px solid #1a2236",background:"#0f1524"}} onClick={()=>setFiltersOpen(o=>!o)}>{filtersOpen?"---":"+++"}</button>
          </div>
        </div>
        <div className="px-5 mt-6 flex flex-col gap-3">
          {filtered.map(ex=>(
            <button key={ex.id} className="w-full text-left rounded-2xl p-4" style={{background:"#0f1524",border:`1px solid ${ex.color}22`}}
              onClick={()=>{ const seq=buildSequence(ex); setActiveEx(ex); setSequence(seq); setStepIdx(0); setBeatsLeft(seq[0].duration); setRunning(false); setTab("exercise"); }}>
              <p className="text-white font-semibold">{ex.name} <span className="text-[10px]" style={{color:ex.color}}>{ex.level}</span></p>
              <p className="text-slate-400 text-xs">{ex.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AirFitness />);
