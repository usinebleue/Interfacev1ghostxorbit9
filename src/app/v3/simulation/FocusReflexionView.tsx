/**
 * FocusReflexionView.tsx — Phase Reflexion V3-native
 *
 * COPIE EXACTE du pattern FocusDiscussionView:
 * Hero compact + SF sidebar w-[180px] + Contenu flex-1
 * Palette: Orange (coherent PHASE_CONFIG reflexion)
 * 4 etapes stage-gated: Diagnostic, Exploration, Analyse, Pre-rapport
 */

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Brain,
  Stethoscope,
  Lightbulb,
  Search,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Zap,
  X,
  Target,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useAmorcer } from "../AmorcerContext";

// ═══ 4 etapes stage-gated — meme pattern que FocusDiscussionView ═══
const REFLEXION_STEPS: { id: number; key: string; title: string; subtitle: string; icon: React.ElementType; minStage: number }[] = [
  { id: 1, key: "diagnostic",   title: "Diagnostic",    subtitle: "Analyse de la situation",      icon: Stethoscope, minStage: 0 },
  { id: 2, key: "exploration",  title: "Exploration",   subtitle: "Brainstorm et recherche",      icon: Lightbulb,   minStage: 3 },
  { id: 3, key: "analyse",      title: "Analyse",       subtitle: "Approfondissement",            icon: Search,      minStage: 6 },
  { id: 4, key: "prerapport",   title: "Pre-rapport",   subtitle: "Synthese et recommandations",  icon: FileText,    minStage: 9 },
];

const STEP_COLORS: Record<string, { dot: string; active: string; text: string; bg: string }> = {
  diagnostic:  { dot: "bg-orange-500",  active: "bg-orange-50 border-orange-200",   text: "text-orange-700",  bg: "bg-orange-100" },
  exploration: { dot: "bg-amber-500",   active: "bg-amber-50 border-amber-200",     text: "text-amber-700",   bg: "bg-amber-100" },
  analyse:     { dot: "bg-red-500",     active: "bg-red-50 border-red-200",         text: "text-red-700",     bg: "bg-red-100" },
  prerapport:  { dot: "bg-rose-500",    active: "bg-rose-50 border-rose-200",       text: "text-rose-700",    bg: "bg-rose-100" },
};

interface FocusReflexionViewProps {
  context: string | null;
  onBack: () => void;
  onAdvancePhase: (phase: string) => void;
}

export function FocusReflexionView({ context, onBack, onAdvancePhase }: FocusReflexionViewProps) {
  const { chatStage, workflowItems, removeWorkflowItem } = useAmorcer();
  const displayContext = context || "Reflexion";

  const [activeStepKey, setActiveStepKey] = useState<string>("diagnostic");

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* 1. HERO COMPACT — orange (reflexion) */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4">
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-orange-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-amber-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <button onClick={onBack} className="mr-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0 relative z-10">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{displayContext}</h2>
            <p className="text-[10px] text-gray-500">Reflexion — Analyse et diagnostic approfondi</p>
          </div>
        </div>

        {/* Progression compacte */}
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          {REFLEXION_STEPS.map((s) => {
            const visible = chatStage >= s.minStage;
            const col = STEP_COLORS[s.key];
            return (
              <div key={s.key} className={cn("w-6 h-6 rounded-md flex items-center justify-center transition-all", visible ? `${col.bg} ${col.text}` : "bg-gray-100 text-gray-300")} title={s.title}>
                <s.icon className="h-3 w-3" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SIDEBAR ETAPES + CONTENU */}
      <div className="flex gap-4">
        <div className={SF.sidebarW}>
          {REFLEXION_STEPS.map((s) => {
            const visible = chatStage >= s.minStage;
            const isActive = activeStepKey === s.key && visible;
            const col = STEP_COLORS[s.key];
            return (
              <button
                key={s.key}
                onClick={() => visible && setActiveStepKey(s.key)}
                disabled={!visible}
                className={cn(
                  SF.btnBase,
                  isActive ? `${col.active} border shadow-sm` : visible ? SF.btnInactive : "opacity-40 cursor-not-allowed border border-transparent"
                )}
              >
                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", visible ? `${col.bg} ${col.text}` : "bg-gray-100 text-gray-300")}>
                  <s.icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("text-[10px] font-bold leading-tight block", isActive ? col.text : visible ? "text-gray-700" : "text-gray-400")}>{s.title}</span>
                  <span className="text-[9px] text-gray-400 leading-tight block">{s.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className={SF.content}>
          <StepContent stepKey={activeStepKey} context={displayContext} chatStage={chatStage} onAdvancePhase={onAdvancePhase} />
          {/* Notes capturees depuis la reflexion */}
          {workflowItems.filter(w => w.phase === "reflexion").length > 0 && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
              <h4 className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-2">Notes capturees ({workflowItems.filter(w => w.phase === "reflexion").length})</h4>
              <div className="space-y-1.5">
                {workflowItems.filter(w => w.phase === "reflexion").map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/note">
                    <Zap className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item.text}</p>
                    <button onClick={() => removeWorkflowItem(item.id)} className="p-0.5 rounded opacity-0 group-hover/note:opacity-100 hover:bg-red-100 transition-all cursor-pointer shrink-0" title="Retirer">
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ═══ Step Content — contenu adaptatif par etape ═══
function StepContent({ stepKey, context, chatStage, onAdvancePhase }: { stepKey: string; context: string; chatStage: number; onAdvancePhase: (phase: string) => void }) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { setAppeared(false); const t = setTimeout(() => setAppeared(true), 80); return () => clearTimeout(t); }, [stepKey]);

  return (
    <div className={cn("transition-all duration-300", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      {stepKey === "diagnostic" && <StepDiagnostic context={context} />}
      {stepKey === "exploration" && <StepExploration context={context} />}
      {stepKey === "analyse" && <StepAnalyse context={context} />}
      {stepKey === "prerapport" && <StepPrerapport context={context} onAdvancePhase={onAdvancePhase} />}
    </div>
  );
}

// ═══ Etape 1 — Diagnostic ═══
function StepDiagnostic({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">Diagnostic</span>
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-2">{context}</h3>
        <p className="text-[11px] text-gray-600 leading-relaxed">Analyse de la situation actuelle, identification des enjeux principaux et des points de friction.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Indicateurs cles</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-[10px] text-gray-400 mb-1">Complexite</p>
            <p className="text-xs font-bold text-orange-700">Moyenne</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-[10px] text-gray-400 mb-1">Urgence</p>
            <p className="text-xs font-bold text-orange-700">Normale</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Points de friction</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-800">Processus a analyser en profondeur</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-800">Donnees manquantes a collecter</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-800">Parties prenantes a consulter</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 2 — Exploration ═══
function StepExploration({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Exploration</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Brainstorm et recherche</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Options identifiees et pistes d'amelioration pour « {context} ».</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Pistes identifiees</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-800">Option A — Approche incrementale</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-800">Option B — Refonte structurelle</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-800">Option C — Solution hybride</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">SCAMPER rapide</h4>
        <div className="grid grid-cols-2 gap-2">
          {["Substituer", "Combiner", "Adapter", "Modifier"].map(s => (
            <div key={s} className="rounded-lg bg-amber-50 p-2 text-center">
              <span className="text-[10px] font-medium text-amber-700">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 3 — Analyse ═══
function StepAnalyse({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">Analyse</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Approfondissement</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Analyse comparative des options pour « {context} ».</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Tableau comparatif</h4>
        <div className="space-y-2">
          {[
            { option: "Option A", impact: "Moyen", effort: "Faible", risque: "Faible" },
            { option: "Option B", impact: "Eleve", effort: "Eleve", risque: "Moyen" },
            { option: "Option C", impact: "Eleve", effort: "Moyen", risque: "Faible" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0">
              <span className="w-20 font-medium text-gray-900">{row.option}</span>
              <span className="flex-1 text-gray-500">Impact: {row.impact}</span>
              <span className="flex-1 text-gray-500">Effort: {row.effort}</span>
              <span className="text-gray-500">Risque: {row.risque}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">5 Pourquoi</h4>
        <div className="space-y-1.5">
          {["Pourquoi ce probleme existe-t-il?", "Pourquoi n'a-t-il pas ete resolu avant?", "Pourquoi est-ce prioritaire maintenant?"].map((q, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-[10px] text-red-400 font-bold shrink-0">{i+1}.</span>
              <span className="text-gray-700">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 4 — Pre-rapport ═══
function StepPrerapport({ context, onAdvancePhase }: { context: string; onAdvancePhase: (phase: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">Pre-rapport</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Synthese et recommandations</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Resume executif de la reflexion sur « {context} ».</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Resume executif</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-gray-800">Diagnostic complete — enjeux identifies</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-gray-800">3 options explorees et comparees</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-gray-800">Recommandation: Option C (hybride)</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Recommandations</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
            <span className="text-gray-700">Prioriser l'approche hybride pour un ratio impact/effort optimal</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
            <span className="text-gray-700">Consulter les parties prenantes avant de passer en conception</span>
          </div>
        </div>
      </div>
      {/* Bouton "Passer en Conception" */}
      <button
        onClick={() => onAdvancePhase("creation")}
        className="w-full mt-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <Target className="h-4 w-4" />
        Passer en Conception →
      </button>
    </div>
  );
}
