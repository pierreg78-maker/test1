// ─── Récupération des hooks React ───
    const { useState, useEffect, useRef, useMemo } = React;

    const DEFINITIONS = {
      vfc: {
        title: "VFC — Variabilité de la Fréquence Cardiaque",
        text: "Variation des intervalles entre deux battements. Une VFC élevée signale un système nerveux souple, capable de passer du stress au calme. La cohérence cardiaque est l’un des moyens les plus simples de l’entraîner.",
      },
      box: {
        title: "Box Breathing",
        text: "Respiration en carré : quatre temps égaux — inspire, retiens, expire, pause à vide. Utilisée par les forces spéciales pour rester calme et alerte. Le « carré » rend le rythme facile à mémoriser.",
      },
      "478": {
        title: "4-7-8",
        text: "Quatre temps d’inspire, sept de rétention, huit d’expire. L’expiration longue active le système parasympathique : c’est un tranquillisant naturel, idéal avant le sommeil.",
      },
      bpm: {
        title: "bpm — battements par minute",
        text: "Tempo du métronome. À 60 bpm, un compte dure une seconde. Plus bas (autour de 45), le souffle s’allonge et s’apaise ; plus haut, le rythme se resserre.",
      },
      tonique: {
        title: "Respiration tonique",
        text: "Inspire plus longue que l’expire. Ce déséquilibre léger stimule le système sympathique : plus d’éveil, moins de brouillard. Idéale au réveil ou en cas de coup de fatigue. Rester assis si la tête tourne.",
      },
      reveil: {
        title: "Souffle du réveil",
        text: "Inspire, courte rétention, expire un peu plus courte. La pause poumons pleins « charge » sans brusquer. Pensée pour les premières minutes de la journée, encore au lit ou déjà debout.",
      },
      activation: {
        title: "Activation 3–3",
        text: "Cycles courts et égaux. Le rythme plus serré réveille le corps sans hyperventilation. On peut monter un peu le bpm (70–80) si l’on veut plus de tonicité. S’arrêter dès le moindre étourdissement.",
      },
      soupir: {
        title: "Soupir physiologique",
        text: "Le soupir naturel du corps, rendu volontaire : un inspire, un second petit inspire par-dessus, puis une expire longue. Quelques cycles suffisent souvent à faire redescendre la tension.",
      },
      abdominal: {
        title: "Respiration abdominale",
        text: "Le geste de base. L’inspire gonfle le ventre, l’expire le ramène. Le diaphragme massage le système nerveux. C’est la fondation de presque toutes les autres techniques.",
      },
      nadi: {
        title: "Nadi Shodhana",
        text: "Respiration alternée : un côté à l’inspire, l’autre à l’expire. Traditionnellement utilisée pour équilibrer. Ici, version assise, sans forcer, pouce et annulaire sur les ailes du nez.",
      },
      soir: {
        title: "Souffle du soir",
        text: "Inspire calme, expire nettement plus longue. On bascule le système nerveux vers le repos. Idéal allongé ou assis, lumière basse, dans les minutes qui précèdent le coucher.",
      },
      triangle: {
        title: "Triangle 4–4–4",
        text: "Trois temps égaux : inspire, rétention, expire. Un cran plus simple que le Box Breathing, assez structuré pour ramener l’attention.",
      },
      ancrage: {
        title: "Ancrage 4–4",
        text: "Rythme égal sans rétention. On pose toute l’attention sur le passage de l’air au bord des narines.",
      },
      boxlong: {
        title: "Box allongé",
        text: "Carré à six comptes. Même logique que le Box Breathing, plus exigeant. Revenir au 4–4–4–4 dès que la rétention force.",
      },
      expire: {
        title: "Expire profonde",
        text: "Inspire courte, expire très longue. Le parasympathique prend le relais. S’arrêter si la tête tourne.",
      },
      cloche: {
        title: "Respiration cloche",
        text: "Inspire et expire égales, un peu plus vives que la cohérence cardiaque. Éveil souple, sans hyperventilation.",
      },
      feu: {
        title: "Souffle de feu",
        text: "Cycles courts inspirés du kapalabhati. L’expire est active, l’inspire revient seule. Contre-indiqué grossesse, hypertension, vertige.",
      },
      soirhold: {
        title: "Rétention du soir",
        text: "Courte pause poumons pleins, puis expire double. On descend d’un cran avant le coucher.",
      },
      "478plus": {
        title: "4-7-8 profond",
        text: "Même ratio que le 4-7-8, davantage de cycles. Baisser le bpm. Version allongée, lumières basses.",
      },
      repas: {
        title: "Souffle du repas",
        text: "Respiration basse après table. On donne de la place à la digestion au lieu de la comprimer.",
      },
      vague: {
        title: "Vague abdominale",
        text: "Inspire, petite pause, expire plus longue. Le diaphragme masse le centre. Éviter juste après un repas très copieux.",
      },
      agni: {
        title: "Souffle digestif",
        text: "Expire un peu tonique, inspire qui revient. Version douce d’un souffle d’activation digestive. S’arrêter au premier inconfort.",
      },
    };

    function formatRatio(ratio) {
      if (!ratio) return "";
      const parts = [ratio.inspire];
      if (ratio.hold) parts.push(ratio.hold);
      parts.push(ratio.expire);
      if (ratio.holdEmpty) parts.push(ratio.holdEmpty);
      return parts.join("–");
    }

    function ratioDefinition(label) {
      return {
        title: `Ratio ${label}`,
        text: "Chaque chiffre est un nombre de comptes du métronome, pas des secondes fixes. L’ordre habituel : inspire — rétention poumons pleins — expire — pause poumons vides. Le tempo (bpm) décide de la durée réelle de chaque compte.",
      };
    }

    // ─── Audio : cloche tibétaine (métronome_2) ───
    function ensureAudio(audioCtxRef) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!audioCtxRef.current) audioCtxRef.current = new AC();
        return audioCtxRef.current;
      } catch (e) {
        return null;
      }
    }

    function toneForPhase(phase, toneMode) {
      if (toneMode !== "mix") return toneMode || "standard";
      if (phase === "inspire") return "aigue";
      if (phase === "hold") return "standard";
      if (phase === "expire") return "grave";
      return "grave";
    }

    function playBell(ctx, time, tone, volume) {
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.type = "sine";
        osc2.type = "sine";

        let freq1 = 880;
        let freq2 = 1200;
        if (tone === "grave") {
          freq1 = 440;
          freq2 = 600;
        } else if (tone === "aigue") {
          freq1 = 1500;
          freq2 = 2100;
        }

        osc1.frequency.setValueAtTime(freq1, time);
        osc2.frequency.setValueAtTime(freq2, time);

        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume, time + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 1.5);

        osc1.start(time);
        osc1.stop(time + 1.5);
        osc2.start(time);
        osc2.stop(time + 1.5);
      } catch (e) {}
    }

    function Term({ defKey, ratioLabel, children }) {
      const [open, setOpen] = useState(false);
      const wrapRef = useRef(null);
      const def =
        defKey === "ratio"
          ? ratioDefinition(ratioLabel || children)
          : DEFINITIONS[defKey];

      useEffect(() => {
        if (!open) return;
        const close = (e) => {
          if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
      }, [open]);

      if (!def) return <>{children}</>;

      return (
        <span
          ref={wrapRef}
          className="relative inline"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOpen((v) => !v);
          }}
        >
          <span className="term-mark">{children}</span>
          {open && (
            <span className="term-pop" role="tooltip">
              <strong>{def.title}</strong>
              {def.text}
            </span>
          )}
        </span>
      );
    }

    // Même géométrie que SplashLogo : cercle ouvert gauche/droite + deux ondes
    const MARK = {
      ringTop: "M 14.75 44 A 48 48 0 0 1 105.25 44",
      ringBot: "M 105.25 76 A 48 48 0 0 1 14.75 76",
      wave1: "M 8 57 C 22 42, 38 42, 54 56 C 70 70, 86 70, 106 55",
      wave2: "M 8 70 C 22 55, 38 55, 54 69 C 70 83, 86 83, 106 68",
    };

    function LogoMark({ color = "#67e8f9", glowColor = "#22d3ee", size = 28 }) {
      const uid = "logoHalo";
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <defs>
            <filter id={uid} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>
          <g filter={`url(#${uid})`} stroke={glowColor} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.4">
            <path d={MARK.ringTop} />
            <path d={MARK.ringBot} />
          </g>
          <g stroke={color} strokeWidth="6.5" strokeLinecap="round" fill="none">
            <path d={MARK.ringTop} />
            <path d={MARK.ringBot} />
          </g>
          <path d={MARK.wave1} stroke="#7deaf5" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d={MARK.wave2} stroke="#5bd4e8" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </svg>
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // DONNÉES — 10 exercices (ratio, intensité, tags)
    // ═══════════════════════════════════════════════════════════════════
    let EXERCISES = [];

    async function loadExercises() {
      const v = "20260912g";
      try {
        const man = await fetch("exercises/manifest.json?v=" + v);
        if (man.ok) {
          const { ids } = await man.json();
          const list = [];
          for (const id of ids) {
            const r = await fetch("exercises/" + id + ".json?v=" + v);
            if (r.ok) list.push(await r.json());
          }
          if (list.length) {
            EXERCISES = list;
            return;
          }
        }
      } catch (e) {}
      const res = await fetch("exercises.json?v=" + v);
      if (!res.ok) throw new Error("catalogue introuvable");
      const data = await res.json();
      EXERCISES = data.exercises || data;
      if (!EXERCISES.length) throw new Error("catalogue vide");
    }

    const INTENTION_DEFS = {
