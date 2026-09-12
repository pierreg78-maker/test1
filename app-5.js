                        i < Math.min(streak.count, 7) ? "#818cf8" : "#2a2550",
                    }}
                  />
                ))}
              </div>
              <p className="text-indigo-400/60 text-xs">
                {doneToday
                  ? "Session réalisée aujourd’hui"
                  : "Fais une session pour prolonger ta série"}
              </p>
            </div>

            {/* Filtres escamotables */}
            <div className="px-5 mt-6">
              <div className={filtersOpen ? "filter-line open" : "filter-line"}>
                <span className="text-slate-500 text-[11px] uppercase tracking-[0.15em] font-medium flex-shrink-0">
                  Filtres
                </span>
                {(filtersOpen ? allTags : closedFilterTags).map((tag) => {
                  const active = tagIsActive(tag);
                  const label = tag === "#ExoDuJour" ? "Exo du jour" : tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="filter-tag flex-shrink-0"
                      style={filterChipStyle(active)}
                    >
                      {label}
                    </button>
                  );
                })}
                {filtersOpen ? (
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="filter-tag flex-shrink-0"
                    style={filterChipStyle(false)}
                  >
                    ---
                  </button>
                ) : (
                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="filter-tag flex-shrink-0"
                    style={filterChipStyle(false)}
                  >
                    +++
                  </button>
                )}
              </div>
            </div>

            {/* Liste exercices */}
            <div className="px-5 mt-6">
              <p className="text-slate-500 text-[11px] uppercase tracking-[0.15em] font-medium mb-2.5">
                {intention || selectedTags.length > 0
                  ? `${filteredExercises.length} exercice${filteredExercises.length > 1 ? "s" : ""}`
                  : "Exercices de souffle"}
              </p>

              <div className="flex flex-col gap-3">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => openExercise(ex)}
                    className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                    style={{
                      background: "#0f1524",
                      border: `1px solid ${ex.color}18`,
                    }}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: ex.color + "15" }}
                      >
                        {ex.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-semibold text-[15px]">
                            {DEFINITIONS[ex.id] ? (
                              <Term defKey={ex.id}>{ex.name}</Term>
                            ) : (
                              ex.name
                            )}
                          </p>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: ex.color + "15",
                              color: ex.color,
                            }}
                          >
                            {ex.level}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-snug mb-2">
                          {ex.id === "coherence" ? (
                            <>
                              Équilibre &{" "}
                              <Term defKey="vfc">VFC</Term>
                            </>
                          ) : (
                            ex.subtitle
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ex.tags.slice(0, 4).map((t) => (
                            <span key={t} className="text-[10px] text-slate-500">
                              {t === "#VFC" ? (
                                <Term defKey="vfc">#VFC</Term>
                              ) : (
                                t
                              )}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-2 text-slate-600 text-[11px]">
                          <span>⏱ {ex.duration}</span>
                          <span>
                            <Term defKey="ratio" ratioLabel={formatRatio(ex.ratio)}>
                              {formatRatio(ex.ratio)}
                            </Term>
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-600 text-lg self-center">›</span>
                    </div>
                  </button>
                ))}

                {filteredExercises.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-8">
                    Aucun exercice ne correspond à ces filtres
                  </p>
                )}
              </div>
            </div>
          </div>

          <BottomNav tab={tab} setTab={setTab} />
        </div>
      );
    }

    // ─── Barre de navigation inférieure ───
    function BottomNav({ tab, setTab }) {
      const items = [
        { id: "home", emoji: "🌬️", label: "Accueil" },
        { id: "journal", emoji: "📓", label: "Journal" },
      ];

      return (
        <div
          className="fixed bottom-0 left-0 right-0"
          style={{
            background: "#060a12",
            borderTop: "1px solid #141b2d",
          }}
        >
        <div className="max-w-[480px] mx-auto flex items-center justify-between px-5 py-3.5">
          {items.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex flex-col items-center gap-0.5 transition-all active:scale-90"
              >
                <span className="text-xl">{item.emoji}</span>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: active ? "#38bdf8" : "#475569" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        </div>
      );
    }

    // ─── Rendu ───
    const root = ReactDOM.createRoot(document.getElementById("root"));
    loadExercises()
      .then(() => root.render(<AirFitness />))
      .catch((err) => {
        console.error(err);
        document.getElementById("root").innerHTML =
          '<p style="color:#94a3b8;padding:24px">Catalogue introuvable. Vérifie exercises.json.</p>';
      });
