/**
 * DiagnosticFlowFocus.tsx — Atelier split-screen pour un diagnostic enrichi
 * TOC sidebar (w-48, progress bars par section) + Contenu (questions + scoring + resultats)
 * Pattern copie de BlueprintSectionFocus dans FocusModeLayout.tsx
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2, Check, Stethoscope, AlertTriangle,
  ArrowRight, Sparkles, BarChart3, Target,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { BOT_AVATAR, BOT_NAME } from "../../../api/types";
import { api } from "../../../api/client";
import { BotBadgeFull } from "../shared/BotBadgeFull";
import type { FocusData } from "../FocusModeLayout";
import type { UnifiedDiagnostic, DiagnosticDataPointEnrichi } from "./unified-diagnostics";
import { VITAA_SEUILS } from "./unified-diagnostics";
import { getNiveau } from "./diagnostic-questions";

// ══════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════

interface SectionTOC {
  id: string;
  label: string;
  dataPoints: DiagnosticDataPointEnrichi[];
  answeredCount: number;
}

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════

/** Group data_points into sections by first part of cle (e.g., "align" from "align.vision") */
function buildSections(diag: UnifiedDiagnostic, answers: Record<string, string>): SectionTOC[] {
  const groups = new Map<string, DiagnosticDataPointEnrichi[]>();

  for (const dp of diag.data_points) {
    const prefix = dp.cle.split(".")[0] || "general";
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix)!.push(dp);
  }

  return Array.from(groups.entries()).map(([prefix, dps]) => ({
    id: prefix,
    label: prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/-/g, " "),
    dataPoints: dps,
    answeredCount: dps.filter(dp => answers[dp.cle] !== undefined && answers[dp.cle] !== "").length,
  }));
}

/** Simple scoring: option index / (nb options - 1) * 100 */
function scoreAnswer(dp: DiagnosticDataPointEnrichi, answer: string): number {
  if (!dp.options || dp.options.length === 0) return 0;
  const idx = dp.options.indexOf(answer);
  if (idx < 0) return 0;
  return Math.round((idx / Math.max(dp.options.length - 1, 1)) * 100);
}

// ══════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════

export function DiagnosticFlowFocus({ focusData }: { focusData: FocusData }) {
  const diag = focusData.data as UnifiedDiagnostic;
  const botCode = diag?.bot_primaire || focusData.bot || "CEOB";

  // State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canvasId, setCanvasId] = useState<number | null>(null);
  const [loadingCanvas, setLoadingCanvas] = useState(true);

  // Canvas key for persistence
  const canvasKey = `diag-${diag?.id || "unknown"}`;

  // Load saved answers from canvas on mount
  useEffect(() => {
    if (!diag?.id) { setLoadingCanvas(false); return; }
    (async () => {
      try {
        const canvas = await api.getOrCreateCanvas(canvasKey);
        setCanvasId(canvas.id);
        if (canvas.data && typeof canvas.data === "object") {
          const loaded: Record<string, string> = {};
          for (const [k, v] of Object.entries(canvas.data as Record<string, unknown>)) {
            if (typeof v === "string") loaded[k] = v;
          }
          if (Object.keys(loaded).length > 0) setAnswers(loaded);
        }
      } catch { /* first time — no canvas yet */ }
      finally { setLoadingCanvas(false); }
    })();
  }, [diag?.id, canvasKey]);

  // Build sections from data_points
  const sections = useMemo(() => {
    if (!diag?.data_points?.length) return [];
    const secs = buildSections(diag, answers);
    secs.push({
      id: "__resultats",
      label: "Resultats",
      dataPoints: [],
      answeredCount: 0,
    });
    return secs;
  }, [diag, answers]);

  // Auto-select first section
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  // Compute score
  const totalAnswered = useMemo(() =>
    Object.keys(answers).filter(k => answers[k] !== "").length
  , [answers]);

  const totalQuestions = diag?.data_points?.length || 0;

  const globalScore = useMemo(() => {
    if (totalAnswered === 0) return 0;
    let sum = 0;
    let count = 0;
    for (const dp of diag?.data_points || []) {
      if (answers[dp.cle]) {
        sum += scoreAnswer(dp, answers[dp.cle]);
        count++;
      }
    }
    return count > 0 ? Math.round(sum / count) : 0;
  }, [answers, diag]);

  const globalPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
  const niveau = getNiveau(globalScore);

  // Answer handler — auto-save after each answer
  const handleAnswer = useCallback((cle: string, value: string) => {
    setAnswers(prev => {
      const next = { ...prev, [cle]: value };
      // Auto-save to canvas
      if (canvasId) {
        api.updateCanvas(canvasId, next as Record<string, unknown>).catch(() => {});
      }
      return next;
    });
    setSaved(false);
  }, [canvasId]);

  // Save via canvas (same pattern as BlueprintSectionFocus)
  const handleSave = useCallback(async () => {
    if (!canvasId) return;
    setSaving(true);
    try {
      await api.updateCanvas(canvasId, answers as Record<string, unknown>);
      setSaved(true);
    } catch (e) {
      console.error("Save diagnostic:", e);
    } finally {
      setSaving(false);
    }
  }, [canvasId, answers]);

  // Active section
  const activeSection = sections.find(s => s.id === activeSectionId);

  // Benchmark color helper
  const getBenchmarkColor = (dp: DiagnosticDataPointEnrichi, answer: string) => {
    const score = scoreAnswer(dp, answer);
    if (score >= 75) return "text-emerald-600 bg-emerald-50";
    if (score >= 50) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  if (!diag) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <span className="text-sm">Aucun diagnostic selectionne</span>
      </div>
    );
  }

  if (loadingCanvas) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with bot identity + progress */}
      <div className={cn("bg-gradient-to-r px-4 py-3 shrink-0", diag.gradient || "from-blue-600 to-blue-500")}>
        <div className="flex items-center gap-3">
          <img
            src={BOT_AVATAR[botCode] || BOT_AVATAR["CEOB"]}
            alt={botCode}
            className="w-8 h-8 rounded-lg object-cover ring-2 ring-white/30 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-white truncate">{diag.titre}</h3>
            <p className="text-[9px] text-white/70">{BOT_NAME[botCode] || botCode} · {diag.duree_minutes} min · {diag.data_points.length} KPIs</p>
          </div>
          {totalAnswered > 0 && !saved && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Sauvegarder
            </button>
          )}
          {saved && (
            <span className="text-[9px] text-white/90 font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Sauvegarde
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", globalPct === 100 ? "bg-emerald-400" : "bg-white/80")}
              style={{ width: `${globalPct}%` }}
            />
          </div>
          <span className="text-[9px] text-white/80 font-medium shrink-0">{globalPct}%</span>
        </div>
      </div>

      {/* Layout: Sidebar TOC + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar TOC */}
        <div className="w-48 border-r bg-gray-50/50 flex flex-col shrink-0">
          <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
            {sections.map(sec => {
              const isActive = sec.id === activeSectionId;
              const isResult = sec.id === "__resultats";
              const pct = sec.dataPoints.length > 0
                ? Math.round((sec.answeredCount / sec.dataPoints.length) * 100)
                : 0;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-lg transition-all cursor-pointer",
                    isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-100 border border-transparent"
                  )}
                >
                  <span className={cn("text-[9px] font-bold block truncate leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>
                    {isResult ? "Resultats" : sec.label}
                  </span>
                  {!isResult && sec.dataPoints.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-500" : "bg-gray-200")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-gray-400 w-5 text-right">{pct}%</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Score summary at bottom */}
          <div className="p-3 border-t bg-white shrink-0">
            <div className="text-[9px] text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Questions</span>
                <span className="font-bold">{totalAnswered}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Score</span>
                <span className={cn("font-bold", globalScore >= 60 ? "text-emerald-600" : globalScore >= 40 ? "text-amber-600" : "text-red-600")}>
                  {globalScore}/100
                </span>
              </div>
              {niveau && (
                <div className="flex justify-between">
                  <span>Niveau</span>
                  <span className="font-bold" style={{ color: niveau.color }}>{niveau.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Results section */}
          {activeSectionId === "__resultats" ? (
            <ResultsView diag={diag} answers={answers} globalScore={globalScore} />
          ) : activeSection ? (
            <>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", diag.gradient || "from-blue-600 to-blue-500")}>
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-800">{activeSection.label}</h3>
                  <p className="text-[9px] text-gray-500">{activeSection.dataPoints.length} indicateurs · {activeSection.answeredCount} repondus</p>
                </div>
                {activeSection.dataPoints.length > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-800">
                      {activeSection.dataPoints.length > 0 ? Math.round((activeSection.answeredCount / activeSection.dataPoints.length) * 100) : 0}%
                    </div>
                    <p className="text-[8px] text-gray-400">complete</p>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {activeSection.dataPoints.map((dp) => {
                  const answered = answers[dp.cle] || "";
                  return (
                    <div
                      key={dp.cle}
                      className={cn(
                        "rounded-lg border p-3 transition-all",
                        answered ? "border-blue-100 bg-blue-50/30" : "border-gray-100 bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-800">{dp.label}</p>
                          {dp.critique && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium mt-0.5 inline-block">
                              Critique
                            </span>
                          )}
                        </div>
                        {dp.benchmark && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 shrink-0">
                            Cible: {dp.benchmark}
                          </span>
                        )}
                      </div>

                      {/* Options as buttons */}
                      {dp.options && dp.options.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dp.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleAnswer(dp.cle, opt)}
                              className={cn(
                                "px-2.5 py-1.5 rounded-lg text-[9px] font-medium border transition-all",
                                answered === opt
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={answered}
                          onChange={e => handleAnswer(dp.cle, e.target.value)}
                          placeholder="Entrez votre valeur..."
                          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      )}

                      {/* Benchmark indicator after answering */}
                      {answered && dp.benchmark && (
                        <div className={cn("mt-2 px-2 py-1 rounded text-[8px] font-medium inline-block", getBenchmarkColor(dp, answered))}>
                          vs benchmark: {dp.benchmark}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <span className="text-sm">Selectionnez une section dans le menu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// RESULTS VIEW
// ══════════════════════════════════════════

function ResultsView({ diag, answers, globalScore }: {
  diag: UnifiedDiagnostic;
  answers: Record<string, string>;
  globalScore: number;
}) {
  const niveau = getNiveau(globalScore);
  const answeredDps = diag.data_points.filter(dp => answers[dp.cle]);

  // Score per data point
  const dpScores = answeredDps.map(dp => ({
    ...dp,
    score: scoreAnswer(dp, answers[dp.cle]),
    answer: answers[dp.cle],
  }));

  // Critical gaps (score < 50)
  const gaps = dpScores.filter(dp => dp.score < 50).sort((a, b) => a.score - b.score);

  // VITAA seuils for this department
  const deptVitaa = VITAA_SEUILS.filter(v =>
    v.agent === diag.bot_primaire ||
    (diag.departement === "finance" && v.pilier === "Argent") ||
    (diag.departement === "operations" && v.pilier === "Actif") ||
    (diag.departement === "rh" && v.pilier === "Temps")
  );

  return (
    <div className="space-y-4">
      {/* Score hero */}
      <div className={cn(
        "rounded-xl p-4 text-center",
        globalScore >= 60 ? "bg-emerald-50 border border-emerald-200" :
        globalScore >= 40 ? "bg-amber-50 border border-amber-200" :
        "bg-red-50 border border-red-200"
      )}>
        <div className="text-3xl font-black" style={{ color: niveau?.color || "#666" }}>
          {globalScore}<span className="text-lg">/100</span>
        </div>
        <div className="text-xs font-bold mt-1" style={{ color: niveau?.color || "#666" }}>
          {niveau?.label || "—"}
        </div>
        <div className="text-[9px] text-gray-500 mt-1">
          {answeredDps.length} question{answeredDps.length !== 1 ? "s" : ""} sur {diag.data_points.length}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-lg border p-3">
        <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Scores par indicateur
        </h4>
        <div className="space-y-1.5">
          {dpScores.map(dp => (
            <div key={dp.cle} className="flex items-center gap-2">
              <span className="text-[8px] text-gray-600 flex-1 truncate">{dp.label}</span>
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                <div
                  className={cn(
                    "h-full rounded-full",
                    dp.score >= 75 ? "bg-emerald-500" : dp.score >= 50 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${dp.score}%` }}
                />
              </div>
              <span className={cn(
                "text-[8px] font-bold w-6 text-right",
                dp.score >= 75 ? "text-emerald-600" : dp.score >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {dp.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gaps */}
      {gaps.length > 0 && (
        <div className="rounded-lg border border-red-100 p-3">
          <h4 className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Gaps identifies ({gaps.length})
          </h4>
          <div className="space-y-2">
            {gaps.map(dp => (
              <div key={dp.cle} className="flex items-start gap-2 p-2 bg-red-50/50 rounded-lg">
                <div className="w-5 h-5 rounded bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[8px] font-bold text-red-600">{dp.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-gray-800">{dp.label}</p>
                  <p className="text-[8px] text-gray-500">Reponse: {dp.answer} · Cible: {dp.benchmark}</p>
                  {dp.critique && (
                    <span className="text-[7px] px-1 py-0.5 rounded bg-red-100 text-red-700 font-medium">Critique</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VITAA Benchmarks */}
      {deptVitaa.length > 0 && (
        <div className="rounded-lg border p-3">
          <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> Seuils VITAA — PME Quebec
          </h4>
          <div className="space-y-2">
            {deptVitaa.map((v, i) => (
              <div key={i} className="p-2 rounded-lg bg-gray-50 text-[9px]">
                <div className="flex items-center gap-2 mb-1">
                  <BotBadgeFull botCode={v.agent} compact className="!text-[7px]" />
                  <span className="font-bold text-gray-800">{v.metrique}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">{v.vert}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">{v.jaune}</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-medium">{v.rouge}</span>
                </div>
                <p className="text-[8px] text-gray-500 mt-1">{v.contexte}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps typiques from enriched data */}
      {diag.gaps_typiques.length > 0 && (
        <div className="rounded-lg border p-3">
          <h4 className="text-xs font-bold text-gray-800 mb-2">Gaps typiques du secteur</h4>
          <div className="space-y-1.5">
            {diag.gaps_typiques.map((g, i) => (
              <div key={i} className="p-2 rounded-lg bg-amber-50/50 text-[9px]">
                <p className="font-bold text-gray-800">{g.gap}</p>
                {g.impact && <p className="text-[8px] text-gray-500">{g.impact}</p>}
                {g.chantier_suggere && (
                  <button className="text-[8px] text-blue-600 hover:underline mt-1 flex items-center gap-0.5">
                    Lancer un projet <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all">
          <ArrowRight className="h-3.5 w-3.5" /> Lancer un projet
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all">
          <Sparkles className="h-3.5 w-3.5" /> Voir fournisseurs
        </button>
      </div>
    </div>
  );
}
