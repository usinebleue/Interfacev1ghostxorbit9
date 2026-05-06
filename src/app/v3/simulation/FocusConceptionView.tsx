/**
 * FocusConceptionView.tsx — Phase Conception V3-native
 *
 * COPIE EXACTE du pattern FocusDiscussionView:
 * Hero compact + SF sidebar w-[180px] + Contenu flex-1
 * Palette: Amber/Yellow (coherent PHASE_CONFIG creation)
 * 4 etapes stage-gated: Structure, Objectifs, Plan de projet, Livrables
 */

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Hammer,
  LayoutGrid,
  Target,
  FolderOpen,
  Package,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
  X,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useAmorcer } from "../AmorcerContext";

// ═══ 4 etapes stage-gated ═══
const CONCEPTION_STEPS: { id: number; key: string; title: string; subtitle: string; icon: React.ElementType; minStage: number }[] = [
  { id: 1, key: "structure",   title: "Structure",       subtitle: "Vue d'ensemble du plan",     icon: LayoutGrid,  minStage: 0 },
  { id: 2, key: "objectifs",   title: "Objectifs",       subtitle: "Criteres de succes",         icon: Target,      minStage: 3 },
  { id: 3, key: "planprojet",  title: "Plan de projet",  subtitle: "Missions et ressources",     icon: FolderOpen,  minStage: 6 },
  { id: 4, key: "livrables",   title: "Livrables",       subtitle: "Selection et planification",  icon: Package,     minStage: 9 },
];

const STEP_COLORS: Record<string, { dot: string; active: string; text: string; bg: string }> = {
  structure:  { dot: "bg-amber-500",   active: "bg-amber-50 border-amber-200",     text: "text-amber-700",   bg: "bg-amber-100" },
  objectifs:  { dot: "bg-yellow-500",  active: "bg-yellow-50 border-yellow-200",   text: "text-yellow-700",  bg: "bg-yellow-100" },
  planprojet: { dot: "bg-orange-500",  active: "bg-orange-50 border-orange-200",   text: "text-orange-700",  bg: "bg-orange-100" },
  livrables:  { dot: "bg-lime-500",    active: "bg-lime-50 border-lime-200",       text: "text-lime-700",    bg: "bg-lime-100" },
};

interface FocusConceptionViewProps {
  context: string | null;
  onBack: () => void;
  onAdvancePhase: (phase: string) => void;
}

export function FocusConceptionView({ context, onBack, onAdvancePhase }: FocusConceptionViewProps) {
  const { chatStage, workflowItems, removeWorkflowItem } = useAmorcer();
  const displayContext = context || "Conception";

  const [activeStepKey, setActiveStepKey] = useState<string>("structure");

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* 1. HERO COMPACT — amber (conception) */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4">
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-amber-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-yellow-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <button onClick={onBack} className="mr-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0 relative z-10">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Hammer className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{displayContext}</h2>
            <p className="text-[10px] text-gray-500">Conception — Structure et planification</p>
          </div>
        </div>

        {/* Progression compacte */}
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          {CONCEPTION_STEPS.map((s) => {
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
          {CONCEPTION_STEPS.map((s) => {
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
          {/* Notes capturees */}
          {workflowItems.filter(w => w.phase === "creation").length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Notes capturees ({workflowItems.filter(w => w.phase === "creation").length})</h4>
              <div className="space-y-1.5">
                {workflowItems.filter(w => w.phase === "creation").map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/note">
                    <Zap className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
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
      {stepKey === "structure" && <StepStructure context={context} />}
      {stepKey === "objectifs" && <StepObjectifs context={context} />}
      {stepKey === "planprojet" && <StepPlanProjet context={context} />}
      {stepKey === "livrables" && <StepLivrables context={context} onAdvancePhase={onAdvancePhase} />}
    </div>
  );
}

// ═══ Etape 1 — Structure ═══
function StepStructure({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Structure</span>
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-2">{context}</h3>
        <p className="text-[11px] text-gray-600 leading-relaxed">Decomposition du chantier en projets et missions. Vue d'ensemble du plan d'action.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Arborescence</h4>
        <div className="space-y-2 pl-2">
          <div className="flex items-center gap-2 text-xs">
            <LayoutGrid className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="font-bold text-gray-900">Chantier</span>
            <span className="text-gray-400">— {context}</span>
          </div>
          <div className="pl-6 space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <FolderOpen className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="text-gray-700">Projet 1 — Phase initiale</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <FolderOpen className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="text-gray-700">Projet 2 — Implementation</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <FolderOpen className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="text-gray-700">Projet 3 — Validation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 2 — Objectifs ═══
function StepObjectifs({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold">Objectifs</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Criteres de succes</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">KPIs cibles et criteres de validation pour « {context} ».</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[10px] text-gray-400 mb-1">KPI principal</p>
          <p className="text-sm font-bold text-amber-700">A definir</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[10px] text-gray-400 mb-1">Timeline</p>
          <p className="text-sm font-bold text-amber-700">A planifier</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Criteres de validation</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            <span className="text-gray-800">Objectif mesurable defini</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            <span className="text-gray-800">Ressources identifiees et disponibles</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            <span className="text-gray-800">Budget approuve par la direction</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 3 — Plan de projet ═══
function StepPlanProjet({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">Plan de projet</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Missions et ressources</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Attribution des equipes et planification pour « {context} ».</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Equipe</h4>
        <div className="flex flex-wrap gap-2">
          {["CarlOS (CEO)", "Tim (CTO)", "Olivier (COO)"].map(bot => (
            <span key={bot} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">{bot}</span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Jalons</h4>
        <div className="space-y-2">
          {[
            { jalon: "Kick-off", status: "A planifier" },
            { jalon: "Revue mi-parcours", status: "A planifier" },
            { jalon: "Livraison finale", status: "A planifier" },
          ].map((j, i) => (
            <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0">
              <Users className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span className="flex-1 text-gray-800">{j.jalon}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{j.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ Etape 4 — Livrables ═══
function StepLivrables({ context, onAdvancePhase }: { context: string; onAdvancePhase: (phase: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-lime-100 text-lime-700 font-bold">Livrables</span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Selection et planification</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">Types de livrables prevus pour « {context} ».</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { type: "Rapport", icon: "PDF", color: "bg-red-50 text-red-700 border-red-200" },
          { type: "Tableur", icon: "XLS", color: "bg-green-50 text-green-700 border-green-200" },
          { type: "Presentation", icon: "PPT", color: "bg-orange-50 text-orange-700 border-orange-200" },
          { type: "Code", icon: "DEV", color: "bg-violet-50 text-violet-700 border-violet-200" },
        ].map(l => (
          <div key={l.type} className={cn("rounded-xl border p-4 text-center cursor-pointer hover:shadow-md transition-all", l.color)}>
            <span className="text-lg font-bold block mb-1">{l.icon}</span>
            <span className="text-[10px] font-medium">{l.type}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Validation</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-gray-800">Plan structure et valide</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-gray-800">Objectifs mesurables definis</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-gray-800">Livrables identifies</span>
          </div>
        </div>
      </div>
      {/* Bouton "Passer en Execution" */}
      <button
        onClick={() => onAdvancePhase("execution")}
        className="w-full mt-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <TrendingUp className="h-4 w-4" />
        Passer en Execution →
      </button>
    </div>
  );
}
