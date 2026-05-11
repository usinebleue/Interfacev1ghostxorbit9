/**
 * FocusExecutionView.tsx — Phase Execution V3-native
 *
 * COPIE EXACTE du pattern FocusDiscussionView:
 * Hero compact + SF sidebar w-[180px] + Contenu flex-1
 * Palette: Green (coherent PHASE_CONFIG execution)
 * 4 etapes stage-gated: Briefing, Suivi, Livrables, Bilan
 */

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Rocket,
  Users,
  Activity,
  FileCheck,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Zap,
  X,
  Target,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { useAmorcer } from "../AmorcerContext";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";

// ═══ 4 etapes stage-gated ═══
const EXECUTION_STEPS: { id: number; key: string; title: string; subtitle: string; icon: React.ElementType; minStage: number }[] = [
  { id: 1, key: "briefing",   title: "Briefing",    subtitle: "Lancement et attribution",   icon: Users,     minStage: 0 },
  { id: 2, key: "suivi",      title: "Suivi",       subtitle: "Progression en cours",       icon: Activity,  minStage: 3 },
  { id: 3, key: "livrables",  title: "Livrables",   subtitle: "Resultats et validation",    icon: FileCheck, minStage: 6 },
  { id: 4, key: "bilan",      title: "Bilan",       subtitle: "Mesure et ajustements",      icon: BarChart3, minStage: 9 },
];

const STEP_COLORS: Record<string, { dot: string; active: string; text: string; bg: string }> = {
  briefing:  { dot: "bg-green-500",    active: "bg-green-50 border-green-200",     text: "text-green-700",    bg: "bg-green-100" },
  suivi:     { dot: "bg-emerald-500",  active: "bg-emerald-50 border-emerald-200", text: "text-emerald-700",  bg: "bg-emerald-100" },
  livrables: { dot: "bg-teal-500",     active: "bg-teal-50 border-teal-200",       text: "text-teal-700",     bg: "bg-teal-100" },
  bilan:     { dot: "bg-cyan-500",     active: "bg-cyan-50 border-cyan-200",       text: "text-cyan-700",     bg: "bg-cyan-100" },
};

interface FocusExecutionViewProps {
  context: string | null;
  onBack: () => void;
  onAdvancePhase: (phase: string) => void;
}

export function FocusExecutionView({ context, onBack, onAdvancePhase }: FocusExecutionViewProps) {
  const isMobile = useIsMobile();
  const { chatStage, workflowItems, removeWorkflowItem } = useAmorcer();
  const displayContext = context || "Execution";

  const [activeStepKey, setActiveStepKey] = useState<string>("briefing");

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* 1. HERO COMPACT — green (execution) */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4">
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-green-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-emerald-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <button onClick={onBack} className="mr-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0 relative z-10">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Rocket className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{displayContext}</h2>
            <p className="text-[10px] text-gray-500">Execution — Lancement et suivi</p>
          </div>
        </div>

        {/* Progression compacte */}
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          {EXECUTION_STEPS.map((s) => {
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
      <div className={cn("flex gap-4", isMobile && "flex-col gap-0")}>
        {(() => {
          const sidebarContent = (<>
            {EXECUTION_STEPS.map((s) => {
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
          </>);
          return isMobile ? (
            <MobileSidebarSheet currentLabel={EXECUTION_STEPS.find(s => s.key === activeStepKey)?.title || "Briefing"} itemCount={EXECUTION_STEPS.length}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className={SF.sidebarW}>
              {sidebarContent}
            </div>
          );
        })()}

        <div className={SF.content}>
          <StepContent stepKey={activeStepKey} context={displayContext} chatStage={chatStage} onAdvancePhase={onAdvancePhase} />
          {/* Notes capturees */}
          {workflowItems.filter(w => w.phase === "execution").length > 0 && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50/50 p-4">
              <h4 className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">Notes capturees ({workflowItems.filter(w => w.phase === "execution").length})</h4>
              <div className="space-y-1.5">
                {workflowItems.filter(w => w.phase === "execution").map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/note">
                    <Zap className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
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

// ═══ Step Content ═══
function StepContent({ stepKey, context, chatStage, onAdvancePhase }: { stepKey: string; context: string; chatStage: number; onAdvancePhase: (phase: string) => void }) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { setAppeared(false); const t = setTimeout(() => setAppeared(true), 80); return () => clearTimeout(t); }, [stepKey]);

  return (
    <div className={cn("transition-all duration-300", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      {stepKey === "briefing" && <StepBriefing context={context} />}
      {stepKey === "suivi" && <StepSuivi context={context} />}
      {stepKey === "livrables" && <StepLivrables context={context} />}
      {stepKey === "bilan" && <StepBilan context={context} onAdvancePhase={onAdvancePhase} />}
    </div>
  );
}

// ═══ Etape 1 — Briefing ═══
function StepBriefing({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">Briefing</span>
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-2">{context}</h3>
        <p className="text-[11px] text-gray-600 leading-relaxed">Lancement de l'execution. Attribution des missions et briefing de l'equipe.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Equipe assignee</h4>
        <div className="flex flex-wrap gap-2">
          {["CarlOS (CEO)", "Tim (CTO)", "Olivier (COO)"].map(bot => (
            <span key={bot} className="text-[10px] px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium border border-green-200">{bot}</span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Missions en cours</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="flex-1 text-gray-800">Phase 1 — Preparation</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">En cours</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
            <span className="flex-1 text-gray-800">Phase 2 — Implementation</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">A venir</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
            <span className="flex-1 text-gray-800">Phase 3 — Validation</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">A venir</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 2 — Suivi ═══
function StepSuivi({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Suivi</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Progression en cours</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Etat d'avancement des taches pour « {context} ».</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-green-600">3</p>
          <p className="text-[10px] text-gray-400">Completees</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-blue-600">2</p>
          <p className="text-[10px] text-gray-400">En cours</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p className="text-lg font-bold text-gray-400">4</p>
          <p className="text-[10px] text-gray-400">A faire</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Progression globale</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: "33%" }} />
          </div>
          <span className="text-xs font-bold text-green-600">33%</span>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 3 — Livrables ═══
function StepLivrables({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-bold">Livrables</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Resultats et validation</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Documents produits et validations pour « {context} ».</p>
      </div>
      <div className="space-y-1.5">
        {[
          { titre: "Rapport Phase 1", format: "PDF", status: "Livre" },
          { titre: "Tableau de bord", format: "Tableur", status: "En cours" },
          { titre: "Presentation finale", format: "PPT", status: "Planifie" },
        ].map((l, i) => {
          const SB: Record<string, string> = { "Livre": "bg-green-100 text-green-700", "En cours": "bg-blue-100 text-blue-700", "Planifie": "bg-gray-100 text-gray-600" };
          const FB: Record<string, string> = { PDF: "bg-red-100 text-red-700", Tableur: "bg-green-100 text-green-700", PPT: "bg-orange-100 text-orange-700" };
          return (
            <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
              <FileCheck className="h-3.5 w-3.5 text-teal-500 shrink-0" />
              <span className="flex-1 text-xs font-medium text-gray-900">{l.titre}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", FB[l.format] || "bg-gray-100 text-gray-600")}>{l.format}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", SB[l.status] || "bg-gray-100 text-gray-600")}>{l.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ Etape 4 — Bilan ═══
function StepBilan({ context, onAdvancePhase }: { context: string; onAdvancePhase: (phase: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-bold">Bilan</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Mesure et ajustements</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Metriques finales et lecons apprises pour « {context} ».</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[10px] text-gray-400 mb-1">Progression</p>
          <p className="text-sm font-bold text-green-600">33%</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[10px] text-gray-400 mb-1">Ecart vs plan</p>
          <p className="text-sm font-bold text-amber-600">-5%</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Lecons apprises</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-gray-800">Phase 1 livree dans les delais</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-gray-800">Ajustements necessaires pour Phase 2</span>
          </div>
        </div>
      </div>
      {/* Bouton "Passer en Retroaction" */}
      <button
        onClick={() => onAdvancePhase("retroaction")}
        className="w-full mt-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <Target className="h-4 w-4" />
        Passer en Retroaction →
      </button>
    </div>
  );
}
