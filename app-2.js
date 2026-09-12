      calme: { id: "calme", label: "Calme", tags: ["#Calme", "#Anxiété", "#Reset", "#Équilibre"] },
      energie: { id: "energie", label: "Énergie", tags: ["#Énergie", "#Fatigue", "#Sport"] },
      focus: { id: "focus", label: "Focus", tags: ["#Focus", "#Concentration", "#Performance"] },
      sommeil: { id: "sommeil", label: "Sommeil", tags: ["#Sommeil", "#Soir"] },
      reveil: { id: "reveil", label: "Réveil", tags: ["#Réveil", "#Matin"] },
      digestion: { id: "digestion", label: "Digestion", tags: ["#Digestion"] },
      exo: { id: "exo", label: "Exo du jour", tags: ["#ExoDuJour"] },
    };

    const LEVEL_RANK = { Débutant: 0, Intermédiaire: 1, Avancé: 2 };

    function parisHour() {
      const raw = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "numeric",
        hour12: false,
      });
      const h = parseInt(raw, 10);
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

    function visibleIntentions() {
      return [
        INTENTION_DEFS.calme,
        INTENTION_DEFS.energie,
        INTENTION_DEFS.focus,
        INTENTION_DEFS[fourthIntentionId()],
      ];
    }

    function greetingLine() {
      const h = parisHour();
      if (h >= 5 && h < 12) return "Bonjour";
      if (h >= 12 && h < 18) return "Bon après-midi";
      if (h >= 18 && h < 22) return "Bonsoir";
      return "Cette nuit";
    }

    // ─── Styles des phases ───
    const PHASE_STYLE = {
      inspire: { accent: "#38bdf8", label: "INSPIRE", bg: "from-sky-950 to-sky-900" },
      hold: { accent: "#a78bfa", label: "RETIENS", bg: "from-violet-950 to-violet-900" },
      expire: { accent: "#2dd4bf", label: "EXPIRE", bg: "from-teal-950 to-teal-900" },
      holdEmpty: { accent: "#94a3b8", label: "PAUSE", bg: "from-slate-950 to-slate-900" },
      prep: { accent: "#64748b", label: "", bg: "from-slate-950 to-slate-900" },
    };

    // ─── Utilitaires de persistance ───
    const store = {
      get: (k, fb = null) => {
        try {
          const r = localStorage.getItem(k);
          return r ? JSON.parse(r) : fb;
        } catch {
          return fb;
        }
      },
      set: (k, v) => {
        try {
          localStorage.setItem(k, JSON.stringify(v));
        } catch {}
      },
    };

    function getTodayKey() {
      return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
    }

    function updateStreak() {
      const s = store.get("af_streak", { count: 0, lastDate: null });
      const today = getTodayKey();
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterday = y.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
      if (s.lastDate === today) return s;
      const updated = {
        count: s.lastDate === yesterday ? s.count + 1 : 1,
        lastDate: today,
      };
      store.set("af_streak", updated);
      return updated;
    }

    function logSession(exId, name) {
      const logs = store.get("af_journal", []);
      logs.unshift({
        id: Date.now(),
        exerciseId: exId,
        name,
        date: getTodayKey(),
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      });
      store.set("af_journal", logs.slice(0, 100));
    }

    function buildSequence(ex) {
      const seq = [];
      const { ratio, cycles, instructions, intensity } = ex;
      const phases = ["inspire", "hold", "expire", "holdEmpty"].filter(
        (p) => ratio[p] > 0
      );
      for (let c = 1; c <= cycles; c++) {
        phases.forEach((phase) => {
          seq.push({
            phase,
            duration: ratio[phase],
            cycle: c,
            totalCycles: cycles,
            instruction: instructions[phase] || "",
            intensity: intensity[phase] || "douce",
          });
        });
      }
      return seq;
    }
// ═══════════════════════════════════════════════════════════════════
// SPLASH — logo animé (cercle qui se dessine + ondes tourbillonnantes)
// ═══════════════════════════════════════════════════════════════════
function SplashLogo() {
  return (
    <svg width="150" height="150" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <filter id="splashHalo" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Cercle ouvert gauche/droite */}
      <g filter="url(#splashHalo)" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.4">
        <path d={MARK.ringTop}
              strokeDasharray="166" strokeDashoffset="166"
              style={{ animation: "drawRing 1.1s 0.2s ease-out forwards" }} />
        <path d={MARK.ringBot}
              strokeDasharray="166" strokeDashoffset="166"
              style={{ animation: "drawRing 1.1s 0.2s ease-out forwards" }} />
      </g>
      <g stroke="#67e8f9" strokeWidth="6.5" strokeLinecap="round" fill="none">
        <path d={MARK.ringTop}
              strokeDasharray="166" strokeDashoffset="166"
              style={{ animation: "drawRing 1.1s 0.2s ease-out forwards" }} />
        <path d={MARK.ringBot}
              strokeDasharray="166" strokeDashoffset="166"
              style={{ animation: "drawRing 1.1s 0.2s ease-out forwards" }} />
      </g>

      {/* Vague inspire */}
      <path d={MARK.wave1}
            stroke="#7deaf5" strokeWidth="5.5" strokeLinecap="round" fill="none"
            strokeDasharray="150" strokeDashoffset="150"
            style={{ animation: "drawWave 1.4s 0.9s ease-out forwards" }} />
      {/* Vague expire */}
      <path d={MARK.wave2}
            stroke="#5bd4e8" strokeWidth="5.5" strokeLinecap="round" fill="none"
            strokeDasharray="150" strokeDashoffset="150"
            style={{ animation: "drawWave 1.4s 1.15s ease-out forwards" }} />
    </svg>
  );
}
function Splash() {
  return (
    <div className="splash-overlay">
      <SplashLogo />
      <p
        className="text-slate-400 text-xs tracking-[0.45em] uppercase"
        style={{ animation: "taglineUp 0.8s 1.2s ease-out both" }}
      >
        Air&nbsp;Fitness
      </p>
      <p
        className="text-indigo-300/40 text-[10px] tracking-[0.2em]"
        style={{ animation: "taglineUp 0.8s 1.6s ease-out both" }}
      >
        Souffle · Présence · Santé
      </p>
    </div>
  );
}
    
    // ─── Composant principal ───
    function AirFitness() {
      const [tab, setTab] = useState("home");
      const [activeEx, setActiveEx] = useState(null);
      const [sequence, setSequence] = useState([]);
      const [stepIdx, setStepIdx] = useState(0);
      const [beatsLeft, setBeatsLeft] = useState(0);
      const [running, setRunning] = useState(false);
      const [selectedTags, setSelectedTags] = useState([]);
      const [intention, setIntention] = useState(() => store.get("af_intention", null));
      const [filtersOpen, setFiltersOpen] = useState(() => !!store.get("af_filters_open", false));
      const [bpm, setBpm] = useState(() => {
        const saved = store.get("af_bpm", 60);
        const n = Number(saved);
        return n >= 30 && n <= 250 ? n : 60;
      });
      // ─── Splash : une seule fois par session ───
const [splash, setSplash] = useState(
  () => !sessionStorage.getItem("af_splashSeen")
);
const [splashLeaving, setSplashLeaving] = useState(false);

useEffect(() => {
  if (!splash) return;
  sessionStorage.setItem("af_splashSeen", "1");
 const t1 = setTimeout(() => setSplashLeaving(true), 4100); // début du fondu
const t2 = setTimeout(() => setSplash(false), 4700);       // fin
  return () => { clearTimeout(t1); clearTimeout(t2); };
}, [splash]);
      
      const [tone, setTone] = useState(() => store.get("af_tone", "mix"));
      const [volume, setVolume] = useState(() => {
        const v = Number(store.get("af_volume", 0.7));
        return v >= 0 && v <= 1 ? v : 0.7;
      });
      const [streak, setStreak] = useState(() =>
        store.get("af_streak", { count: 0, lastDate: null })
      );
      const [journal, setJournal] = useState(() => store.get("af_journal", []));

      // ─── Refs ───
      const audioCtxRef = useRef(null);
      const runningRef = useRef(false);
      const stepRef = useRef(0);
      const seqRef = useRef([]);
      const bpmRef = useRef(bpm);
      const toneRef = useRef(tone);
      const volumeRef = useRef(volume);
      const beatsRef = useRef(0);
      const schedulerTimerRef = useRef(null);
      const uiTimerRef = useRef(null);
      const nextBeatTimeRef = useRef(0);
      const beatQueueRef = useRef([]);
      const wakeLockRef = useRef(null);

      const today = getTodayKey();
      const doneToday = streak.lastDate === today;

      const dailyExo = useMemo(() => {
        const today = getTodayKey();
        const saved = store.get("af_exo_du_jour", null);
        if (saved && saved.date === today) {
          const found = EXERCISES.find((ex) => ex.id === saved.id);
          if (found) return found;
        }
        const pick = EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
        store.set("af_exo_du_jour", { date: today, id: pick.id });
        return pick;
      }, []);

      const familyTags = intention && INTENTION_DEFS[intention]
        ? INTENTION_DEFS[intention].tags
        : [];

      const filteredExercises = useMemo(() => {
        const exoMode = intention === "exo" || selectedTags.includes("#ExoDuJour");
        let list = exoMode ? [dailyExo] : EXERCISES.slice();
        if (!exoMode && intention) {
          list = list.filter((ex) => (ex.intentions || []).includes(intention));
        }
        const extra = selectedTags.filter((t) => t !== "#ExoDuJour");
        if (extra.length > 0) {
          list = list.filter((ex) => extra.every((t) => ex.tags.includes(t)));
        }
        return list.slice().sort((a, b) => {
          const ra = LEVEL_RANK[a.level] ?? 9;
          const rb = LEVEL_RANK[b.level] ?? 9;
          if (ra !== rb) return ra - rb;
          return a.name.localeCompare(b.name, "fr");
        });
      }, [selectedTags, intention, dailyExo]);

      const allTags = useMemo(() => {
        const set = new Set();
        EXERCISES.forEach((ex) => ex.tags.forEach((t) => set.add(t)));
        set.add("#ExoDuJour");
        return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
      }, []);

      const closedFilterTags = ["#Débutant", "#Stress"];

      // ─── Synchronisation refs + persistance ───
      useEffect(() => { runningRef.current = running; }, [running]);
      useEffect(() => { stepRef.current = stepIdx; }, [stepIdx]);
      useEffect(() => { seqRef.current = sequence; }, [sequence]);
