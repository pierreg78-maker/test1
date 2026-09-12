                </div>
              </div>

              <div className="text-center max-w-xs space-y-2">
                <p className="text-white/90 text-[15px] leading-relaxed font-medium">
                  {current.instruction}
                </p>
                <p className="text-white/35 text-xs">
                  Intensité : {current.intensity}
                </p>
              </div>
            </div>

            <div className="px-5 pb-12 flex flex-col gap-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="w-full py-4 rounded-2xl text-white font-semibold text-[15px] transition-all active:scale-[0.98]"
                style={{
                  background: running
                    ? "rgba(255,255,255,0.08)"
                    : `linear-gradient(135deg, ${style.accent}, ${style.accent}cc)`,
                  border: running ? "1px solid rgba(255,255,255,0.12)" : "none",
                  boxShadow: running ? "none" : `0 8px 28px ${style.accent}35`,
                }}
              >
                {running ? "⏸  Pause" : isFirst ? "▶  Démarrer" : "▶  Reprendre"}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (stepIdx > 0) {
                      const p = stepIdx - 1;
                      setStepIdx(p);
                      setBeatsLeft(sequence[p].duration);
                      setRunning(false);
                    }
                  }}
                  disabled={stepIdx === 0}
                  className="flex-1 py-3 rounded-2xl text-white/45 text-sm transition-all active:scale-95 disabled:opacity-20"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => {
                    if (stepIdx < sequence.length - 1) {
                      const n = stepIdx + 1;
                      setStepIdx(n);
                      setBeatsLeft(sequence[n].duration);
                    } else {
                      setRunning(false);
                      finishExercise();
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl text-white/70 text-sm transition-all active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        );
      }

      // ─── Écran de fin ───
      if (tab === "complete" && activeEx) {
        return (
          <div
            className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center px-6 py-12"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <div className="w-full max-w-sm flex flex-col items-center gap-7 text-center">
              <div className="text-6xl">{activeEx.emoji}</div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1.5">
                  Session terminée
                </h2>
                <p className="text-slate-400 text-sm">
                  Tu as terminé{" "}
                  <span className="text-white font-medium">{activeEx.name}</span>
                </p>
              </div>

              <div
                className="w-full rounded-3xl p-5"
                style={{
                  background: "linear-gradient(145deg, #12182b, #1a1435)",
                  border: "1px solid #2e2a55",
                }}
              >
                <p className="text-indigo-400/80 text-[11px] uppercase tracking-[0.15em] mb-2">
                  Série en cours
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                   {streak.count >= 7 ? "🔥" : streak.count >= 3 ? "⚡" : streak.count >= 1 ? "✨" : "💤"}
                  </span>
                  <div className="text-left">
                    <p className="text-white text-2xl font-semibold">
                      {streak.count} jour{streak.count > 1 ? "s" : ""}
                    </p>
                    <p className="text-indigo-300/70 text-xs">Continue comme ça</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTab("home")}
                className="w-full py-4 rounded-2xl text-white font-semibold text-[15px]"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  boxShadow: "0 8px 28px #0ea5e935",
                }}
              >
                Retour à l’accueil
              </button>
              <button
                onClick={() => openExercise(activeEx)}
                className="w-full py-3 rounded-2xl text-sky-400/90 text-sm font-medium"
                style={{ border: "1px solid #0ea5e925" }}
              >
                Refaire cet exercice
              </button>
            </div>
          </div>
        );
      }

      // ─── Écran Journal ───
      if (tab === "journal") {
        return (
          <div
            className="min-h-screen bg-[#070b14] flex flex-col"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <div className="px-5 pt-12 pb-4">
              <h1 className="text-xl font-semibold text-white">Journal</h1>
              <p className="text-slate-500 text-xs mt-1">
                Historique de tes sessions de souffle
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
              {journal.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <span className="text-4xl opacity-40">📓</span>
                  <p className="text-slate-400 text-sm">Aucune session encore</p>
                  <p className="text-slate-600 text-xs max-w-[220px]">
                    Termine un exercice pour commencer à remplir ton journal
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {journal.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                      style={{
                        background: "#0f1524",
                        border: "1px solid #1a2236",
                      }}
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {entry.name}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {entry.date} · {entry.time}
                        </p>
                      </div>
                      <span className="text-slate-600 text-lg">✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <BottomNav tab={tab} setTab={setTab} />
          </div>
        );
      }

      // ─── Écran d’accueil ───
      return (
        <div
          className="min-h-screen bg-[#070b14] flex flex-col"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
         {splash && (
  <div className={splashLeaving ? "splash-overlay leaving" : "splash-overlay"}>
    <div className="splash-dark" />
    <div className="splash-content">
      <div className="splash-heart">
        <div className="splash-grow">
          <SplashLogo />
        </div>
      </div>
      <p className="splash-brand">AIR&nbsp;FITNESS</p>
      <p className="splash-tagline">Souffle · Présence · Santé</p>
    </div>
  </div>
)}
          <div className="flex-1 overflow-y-auto pb-28">
            <div className="px-5 pt-12 pb-1 flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-semibold text-white tracking-tight">
                  Air Fitness
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  Souffle · Présence · Santé 
                </p>
              </div>
              <div className="header-logo">
                <LogoMark size={34} />
              </div>
            </div>

            {/* Super-filtres d’intention */}
            <div className="px-5 mt-5">
              <p className="text-slate-400 text-[13px] mb-2.5">
                De quoi as-tu besoin maintenant ?
              </p>
              <div className="intent-row">
                {visibleIntentions().map((item) => {
                  const active = intention === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleIntention(item.id)}
                      className="super-tag"
                      style={superChipStyle(active)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Carte Streak */}
            <div
              className="mx-5 mt-5 rounded-3xl p-5"
              style={{
                background: "linear-gradient(145deg, #12182b, #1a1435)",
                border: "1px solid #2e2a55",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-indigo-400/80 text-[11px] uppercase tracking-[0.15em] font-medium mb-1">
                    Série en cours
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-3xl font-semibold text-white">
                      {streak.count}
                    </span>
                    <span className="text-indigo-300/70 text-sm mb-0.5">
                      jour{streak.count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <span className="text-3xl">
                  {streak.count >= 7 ? "🔥" : streak.count >= 3 ? "⚡" : streak.count >= 1 ? "✨" : "💤"}
                </span>
              </div>
              <div className="flex gap-1.5 mb-2.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all"
                    style={{
                      background:
