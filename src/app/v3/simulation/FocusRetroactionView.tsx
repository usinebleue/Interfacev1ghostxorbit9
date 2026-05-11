/**
 * FocusRetroactionView.tsx — Phase Retroaction V3-native
 *
 * COPIE EXACTE du pattern FocusDiscussionView:
 * Hero compact + SF sidebar w-[180px] + Contenu flex-1
 * Palette: Purple/Emerald (coherent PHASE_CONFIG retroaction)
 * 4 etapes stage-gated: Resultats, Apprentissages, Recommandations, Archivage
 */

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Lightbulb,
  Archive,
  CheckCircle2,
  TrendingUp,
  Star,
  Zap,
  X,
  Home,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { useAmorcer } from "../AmorcerContext";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";

// ═══ 4 etapes stage-gated ═══
const RETROACTION_STEPS: { id: number; key: string; title: string; subtitle: string; icon: React.ElementType; minStage: number }[] = [
  { id: 1, key: "resultats",       title: "Resultats",       subtitle: "Mesure des outcomes",         icon: BarChart3,  minStage: 0 },
  { id: 2, key: "apprentissages",  title: "Apprentissages",  subtitle: "Lecons et patterns",          icon: BookOpen,   minStage: 3 },
  { id: 3, key: "recommandations", title: "Recommandations", subtitle: "Actions futures",              icon: Lightbulb,  minStage: 6 },
  { id: 4, key: "archivage",       title: "Archivage",       subtitle: "Cristallisation des acquis",   icon: Archive,    minStage: 9 },
];

const STEP_COLORS: Record<string, { dot: string; active: string; text: string; bg: string }> = {
  resultats:       { dot: "bg-purple-500",   active: "bg-purple-50 border-purple-200",     text: "text-purple-700",   bg: "bg-purple-100" },
  apprentissages:  { dot: "bg-violet-500",   active: "bg-violet-50 border-violet-200",     text: "text-violet-700",   bg: "bg-violet-100" },
  recommandations: { dot: "bg-indigo-500",   active: "bg-indigo-50 border-indigo-200",     text: "text-indigo-700",   bg: "bg-indigo-100" },
  archivage:       { dot: "bg-emerald-500",  active: "bg-emerald-50 border-emerald-200",   text: "text-emerald-700",  bg: "bg-emerald-100" },
};

interface FocusRetroactionViewProps {
  context: string | null;
  onBack: () => void;
  onAdvancePhase: (phase: string) => void;
}

export function FocusRetroactionView({ context, onBack, onAdvancePhase }: FocusRetroactionViewProps) {
  const isMobile = useIsMobile();
  const { chatStage, workflowItems, removeWorkflowItem } = useAmorcer();
  const displayContext = context || "Retroaction";

  const [activeStepKey, setActiveStepKey] = useState<string>("resultats");

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* 1. HERO COMPACT — purple (retroaction) */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4">
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-purple-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-violet-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <button onClick={onBack} className="mr-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0 relative z-10">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{displayContext}</h2>
            <p className="text-[10px] text-gray-500">Retroaction — Bilan et capitalisation</p>
          </div>
        </div>

        {/* Progression compacte */}
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          {RETROACTION_STEPS.map((s) => {
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
            {RETROACTION_STEPS.map((s) => {
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
            <MobileSidebarSheet currentLabel={RETROACTION_STEPS.find(s => s.key === activeStepKey)?.title || "Resultats"} itemCount={RETROACTION_STEPS.length}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className={SF.sidebarW}>
              {sidebarContent}
            </div>
          );
        })()}

        <div className={SF.content}>
          <StepContent stepKey={activeStepKey} context={displayContext} chatStage={chatStage} onBack={onBack} />
          {/* Notes capturees */}
          {workflowItems.filter(w => w.phase === "retroaction").length > 0 && (
            <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4">
              <h4 className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-2">Notes capturees ({workflowItems.filter(w => w.phase === "retroaction").length})</h4>
              <div className="space-y-1.5">
                {workflowItems.filter(w => w.phase === "retroaction").map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/note">
                    <Zap className="h-3 w-3 text-purple-500 mt-0.5 shrink-0" />
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
function StepContent({ stepKey, context, chatStage, onBack }: { stepKey: string; context: string; chatStage: number; onBack: () => void }) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { setAppeared(false); const t = setTimeout(() => setAppeared(true), 80); return () => clearTimeout(t); }, [stepKey]);

  return (
    <div className={cn("transition-all duration-300", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      {stepKey === "resultats" && <StepResultats context={context} />}
      {stepKey === "apprentissages" && <StepApprentissages context={context} />}
      {stepKey === "recommandations" && <StepRecommandations context={context} />}
      {stepKey === "archivage" && <StepArchivage context={context} onBack={onBack} />}
    </div>
  );
}

// ═══ Etape 1 — Resultats ═══
function StepResultats({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">Resultats</span>
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-2">{context}</h3>
        <p className="text-[11px] text-gray-600 leading-relaxed">Mesure des outcomes et comparaison avec les objectifs initiaux.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[10px] text-gray-400 mb-1">Objectif atteint</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-purple-700">72%</span>
            <span className="text-[10px] font-medium text-green-600">+12%</span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[10px] text-gray-400 mb-1">Delai respecte</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-purple-700">Oui</span>
            <span className="text-[10px] font-medium text-green-600">dans les temps</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">KPIs atteints vs cibles</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="flex-1 text-gray-800">Reduction temps cycle</span>
            <span className="text-[10px] font-bold text-green-600">-18% (cible -20%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="flex-1 text-gray-800">Taux conformite</span>
            <span className="text-[10px] font-bold text-green-600">94% (cible 90%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="flex-1 text-gray-800">ROI projete</span>
            <span className="text-[10px] font-bold text-amber-600">2.4x (cible 3x)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 2 — Apprentissages ═══
function StepApprentissages({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold">Apprentissages</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Lecons et patterns</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Ce qui a fonctionne et ce qui peut etre ameliore pour « {context} ».</p>
      </div>
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
        <h4 className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-3">Ce qui a marche</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <Star className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-gray-700">Communication claire avec l'equipe des le briefing</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <Star className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-gray-700">Jalons intermediaires pour mesurer la progression</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-3">A ameliorer</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-gray-700">Anticiper les blocages fournisseurs plus tot</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-gray-700">Documenter les decisions en temps reel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 3 — Recommandations ═══
function StepRecommandations({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">Recommandations</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Actions futures</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Prochaines actions et ajustements strategiques pour « {context} ».</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Prochaines actions</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0">
            <Lightbulb className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="flex-1 text-gray-800">Capitaliser les processus documentes pour les futurs chantiers</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">Haute</span>
          </div>
          <div className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0">
            <Lightbulb className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="flex-1 text-gray-800">Mettre a jour le blueprint avec les nouvelles donnees</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">Normale</span>
          </div>
          <div className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0">
            <Lightbulb className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="flex-1 text-gray-800">Planifier le prochain cycle de reflexion</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Future</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 4 — Archivage ═══
function StepArchivage({ context, onBack }: { context: string; onBack: () => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Archivage</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Cristallisation des acquis</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Resume pour la base de connaissances et elements a capitaliser pour « {context} ».</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Resume pour la base de connaissances</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-gray-800">Diagnostic et reflexion completes</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-gray-800">Plan concu et valide</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-gray-800">Execution suivie et livrables produits</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-gray-800">Lecons capitalisees pour les prochains cycles</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Elements a capitaliser</h4>
        <div className="grid grid-cols-2 gap-2">
          {["Processus", "Templates", "Metriques", "Contacts"].map(e => (
            <div key={e} className="rounded-lg bg-emerald-50 p-2.5 text-center border border-emerald-200">
              <span className="text-[10px] font-medium text-emerald-700">{e}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Bouton "Retour au Cockpit" */}
      <button
        onClick={onBack}
        className="w-full mt-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <Home className="h-4 w-4" />
        Retour au Cockpit
      </button>
    </div>
  );
}
