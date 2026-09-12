      useEffect(() => { beatsRef.current = beatsLeft; }, [beatsLeft]);
      useEffect(() => {
        bpmRef.current = bpm;
        store.set("af_bpm", bpm);
      }, [bpm]);
      useEffect(() => {
        toneRef.current = tone;
        store.set("af_tone", tone);
      }, [tone]);
      useEffect(() => {
        volumeRef.current = volume;
        store.set("af_volume", volume);
      }, [volume]);
      useEffect(() => {
        store.set("af_intention", intention);
      }, [intention]);
      useEffect(() => {
        store.set("af_filters_open", filtersOpen);
      }, [filtersOpen]);

      // ─── Anti-veille : garder l’écran allumé pendant la session ───
      useEffect(() => {
        let lock = null;
        if (running && "wakeLock" in navigator) {
          navigator.wakeLock.request("screen")
            .then((l) => { lock = l; wakeLockRef.current = l; })
            .catch(() => {});
        } else if (wakeLockRef.current) {
          try { wakeLockRef.current.release(); } catch (e) {}
          wakeLockRef.current = null;
        }
        return () => {
          if (lock) { try { lock.release(); } catch (e) {} }
        };
      }, [running]);

      // ─── Vibration courte à chaque changement de phase ───
      useEffect(() => {
        if (running && "vibrate" in navigator) {
          try { navigator.vibrate(30); } catch (e) {}
        }
      }, [stepIdx]); // eslint-disable-line

      // ─── Avance d’un temps du métronome (décrémente / change de phase) ───
      function advanceBeat() {
        const t = beatsRef.current;
        if (t > 1) {
          setBeatsLeft(t - 1);
          return;
        }
        const seq = seqRef.current;
        const idx = stepRef.current;
        if (idx < seq.length - 1) {
          const next = idx + 1;
          setStepIdx(next);
          stepRef.current = next;
          setBeatsLeft(seq[next].duration);
        } else {
          stopScheduler();
          setRunning(false);
          runningRef.current = false;
          finishExercise();
        }
      }

      // ─── Scheduler audio (lookahead, style métronome_2) ───
      function startScheduler() {
        const ctx = ensureAudio(audioCtxRef);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        nextBeatTimeRef.current = ctx.currentTime + 0.12;
        beatQueueRef.current = [];

        // Boucle de planification audio (25 ms de lookahead)
        schedulerTimerRef.current = setInterval(() => {
          while (nextBeatTimeRef.current < ctx.currentTime + 0.15) {
            const step = seqRef.current[stepRef.current];
            const resolved = toneForPhase(step && step.phase, toneRef.current);
            playBell(ctx, nextBeatTimeRef.current, resolved, volumeRef.current);
            beatQueueRef.current.push(nextBeatTimeRef.current);
            nextBeatTimeRef.current += 60 / (bpmRef.current || 60);
          }
        }, 25);

        // Boucle UI synchronisée sur l’horloge audio
        uiTimerRef.current = setInterval(() => {
          const now = ctx.currentTime;
          let beat = false;
          while (beatQueueRef.current.length && beatQueueRef.current[0] <= now) {
            beatQueueRef.current.shift();
            beat = true;
          }
          if (beat) advanceBeat();
        }, 50);
      }

      function stopScheduler() {
        if (schedulerTimerRef.current) {
          clearInterval(schedulerTimerRef.current);
          schedulerTimerRef.current = null;
        }
        if (uiTimerRef.current) {
          clearInterval(uiTimerRef.current);
          uiTimerRef.current = null;
        }
        beatQueueRef.current = [];
      }

      // ─── Effet principal : démarre/arrête le métronome avec le bouton ───
      useEffect(() => {
        stopScheduler();
        if (!running || !activeEx || tab !== "exercise") return;
        startScheduler();
        return () => stopScheduler();
      }, [running, tab, activeEx]); // eslint-disable-line

      function openExercise(ex) {
        const seq = buildSequence(ex);
        setActiveEx(ex);
        setSequence(seq);
        setStepIdx(0);
        setBeatsLeft(seq[0].duration);
        setRunning(false);
        setTab("exercise");
      }

      function finishExercise() {
        const updated = updateStreak();
        setStreak(updated);
        logSession(activeEx.id, activeEx.name);
        setJournal(store.get("af_journal", []));
        setTab("complete");
      }

      function toggleTag(tag) {
        if (tag === "#ExoDuJour") {
          setIntention((cur) => (cur === "exo" ? null : "exo"));
          return;
        }
        setSelectedTags((prev) =>
          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
      }

      function toggleIntention(id) {
        setIntention((cur) => (cur === id ? null : id));
      }

      function tagIsActive(tag) {
        if (tag === "#ExoDuJour") return intention === "exo";
        return selectedTags.includes(tag) || familyTags.includes(tag);
      }

      function filterChipStyle(active) {
        return {
          background: active ? "#0ea5e920" : "#0f1524",
          color: active ? "#38bdf8" : "#64748b",
          border: active ? "1px solid #0ea5e940" : "1px solid #1a2236",
        };
      }

      function superChipStyle(active) {
        return {
          background: active ? "#eab30822" : "#1a223099",
          color: active ? "#facc15" : "#cbd5e1",
          border: active ? "1px solid #eab30866" : "1px solid #33415566",
        };
      }

      // ─── Écran exercice ───
      if (tab === "exercise" && activeEx && sequence.length > 0) {
        const current = sequence[stepIdx];
        const style = PHASE_STYLE[current.phase] || PHASE_STYLE.prep;
        const progress = ((stepIdx + 1) / sequence.length) * 100;
        const isFirst = stepIdx === 0 && beatsLeft === sequence[0].duration;

        
        return (
          <div
            className={`min-h-screen flex flex-col bg-gradient-to-b ${style.bg} transition-all duration-700`}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <div className="flex items-center justify-between px-5 pt-12 pb-3">
              <button
                onClick={() => {
                  setRunning(false);
                  setTab("home");
                }}
                className="text-white/40 text-sm active:opacity-60"
              >
                ← Quitter
              </button>
              <div className="text-center">
                <p className="text-white/50 text-xs font-medium tracking-wide">
                  {DEFINITIONS[activeEx.id] ? (
                    <Term defKey={activeEx.id}>{activeEx.name}</Term>
                  ) : (
                    activeEx.name
                  )}
                </p>
                <p className="text-white/30 text-[10px] mt-0.5">
                  Cycle {current.cycle} / {current.totalCycles}
                </p>
              </div>
              <div className="w-14" />
            </div>

            <div className="mx-5 h-0.5 rounded-full bg-white/10">
              <div
                className="h-0.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: style.accent }}
              />
            </div>

            <p className="px-6 mt-4 text-center text-white/40 text-[11px] italic leading-relaxed">
              {activeEx.description}
            </p>

            {/* ─── Contrôles du métronome : tempo, sonorité, volume ─── */}
            <div className="mt-3 flex items-center justify-center gap-2">
             <input
                    className="bpm-box"
                    type="number"
                    min="30"
                    max="250"
                    value={bpm}
                    onChange={(e) => {
                      // Saisie libre : on stocke brut, sans clamp
                      const raw = e.target.value;
                      if (raw === "") { setBpm(""); return; }
                      const n = parseInt(raw, 10);
                      if (!Number.isNaN(n)) setBpm(n);
                    }}
                    onBlur={() => {
                      // Clamp uniquement quand on quitte le champ
                      const n = parseInt(bpm, 10);
                      setBpm(Number.isNaN(n) ? 60 : Math.min(250, Math.max(30, n)));
                    }}
                    inputMode="numeric"
                    aria-label="Tempo en battements par minute"
                  />
              <span className="text-cyan-300/80 text-xs tracking-wide">
                <Term defKey="bpm">bpm</Term>
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-center gap-3">
              <select
                className="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                aria-label="Sonorité du métronome"
              >
                <option value="mix">Mix (selon la phase)</option>
                <option value="grave">Grave (Bol tibétain)</option>
                <option value="standard">Standard (Médium)</option>
                <option value="aigue">Aiguë (Carillon)</option>
              </select>
              <span className="text-slate-500 text-sm" aria-hidden="true">🔊</span>
              <input
                className="vol-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volume du métronome"
              />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
              <div className="relative flex items-center justify-center">
                {running && (
                  <div
                    className="absolute w-48 h-48 rounded-full animate-ping opacity-[0.08]"
                    style={{
                      background: style.accent,
                      animationDuration:
                        current.phase === "expire" ? "2.2s" : "1.4s",
                    }}
                  />
                )}
                <div
                  className="w-44 h-44 rounded-full flex flex-col items-center justify-center gap-1"
                  style={{
                    background: style.accent + "10",
                    border: `2px solid ${style.accent}35`,
                    boxShadow: `0 0 40px ${style.accent}15`,
                  }}
                >
                  <span className="text-5xl font-light text-white tabular-nums leading-none">
                    {beatsLeft}
                  </span>
                  <span className="text-[11px] text-white/40 tracking-widest uppercase">
                    comptes
                  </span>
