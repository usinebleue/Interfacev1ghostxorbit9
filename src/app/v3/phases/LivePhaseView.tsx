/**
 * LivePhaseView.tsx — Composant UNIVERSEL pour les 5 phases de travail
 *
 * COMPORTEMENT (comme les artefacts Claude AI):
 * - Le workspace est PASSIF — il REÇOIT le contenu de la discussion
 * - Chaque réponse du bot remplit l'étape courante et débloque la suivante
 * - Les phases changent UNIQUEMENT par bouton explicite (jamais d'auto-détection)
 *
 * VISUEL (copie exacte des simulations FocusXxxView.tsx):
 * - Hero compact avec couleur de phase
 * - Sidebar w-[180px] avec navigation par étapes (stage-gated)
 * - Zone contenu (flex-1) qui affiche le texte capturé ou l'état d'attente
 * - Section notes capturées
 * - Bouton de transition vers la phase suivante
 */

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Zap,
  X,
  ArrowRight,
  RotateCcw,
  GitBranch,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { useAmorcer } from "../AmorcerContext";
import { useChatContext } from "../../v2/context/ChatContext";
import { PHASE_CONFIGS } from "./phase-config";
import type { PhaseConfig, PhaseStep } from "./phase-config";
import { formatCristallise } from "./content-formatters";
import { CristalliseActions } from "./CristalliseActions";

interface LivePhaseViewProps {
  phaseKey: string;
  context: string | null;
  onPhaseComplete?: () => void;
  onReturnToCockpit?: () => void;
}

export function LivePhaseView({ phaseKey, context, onPhaseComplete, onReturnToCockpit }: LivePhaseViewProps) {
  const config = PHASE_CONFIGS[phaseKey];
  if (!config) return null;

  return <LivePhaseViewInner config={config} context={context} onPhaseComplete={onPhaseComplete} onReturnToCockpit={onReturnToCockpit} />;
}

function LivePhaseViewInner({ config, context, onPhaseComplete, onReturnToCockpit }: {
  config: PhaseConfig;
  context: string | null;
  onPhaseComplete?: () => void;
  onReturnToCockpit?: () => void;
}) {
  const isMobile = useIsMobile();
  const {
    chatStage, workflowItems, removeWorkflowItem, getCristallise,
    getCristalliseItem, editCristallise, setPendingCapture, addWorkflowItem, activeBotCode,
    activePhase,
  } = useAmorcer();
  const { sendMessage } = useChatContext();
  const displayContext = context || config.label;

  // useWorkspaceCapture() → déplacé dans WorkspacePhasesPanel (toujours actif)

  const [activeStepId, setActiveStepId] = useState<string>(config.steps[0]?.id || "");

  // Auto-switch vers la dernière étape qui vient de recevoir du contenu
  useEffect(() => {
    const latestWithContent = [...config.steps].reverse().find(s => getCristallise(s.id) !== null);
    if (latestWithContent && latestWithContent.id !== activeStepId) {
      setActiveStepId(latestWithContent.id);
    }
  }, [chatStage]);

  // Reset activeStepId quand la phase change
  useEffect(() => {
    setActiveStepId(config.steps[0]?.id || "");
  }, [config.key]);

  const activeStep = config.steps.find(s => s.id === activeStepId) || config.steps[0];
  const completedCount = config.steps.filter(s => getCristallise(s.id) !== null).length;
  const progress = Math.round((completedCount / config.steps.length) * 100);
  const phaseNotes = workflowItems.filter(w => w.phase === config.key);
  const minRequired = Math.max(1, config.steps.length - 1); // Au moins N-1 étapes pour débloquer transition

  const col = config.colors;
  const PhaseIcon = config.icon;

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* ═══ HERO COMPACT ═══ */}
      <div className="relative rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all px-5 py-4 flex items-center gap-4 overflow-hidden">
        <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40", col.hero.gradient1)} />
        <div className={cn("absolute -bottom-4 right-12 w-16 h-16 rounded-full blur-xl opacity-30", col.hero.gradient2)} />
        <div className={cn("relative z-10 p-2 rounded-xl border", col.hero.iconBg, col.hero.iconBg.replace("bg-", "border-").replace("/", "-"))}>
          <PhaseIcon className={cn("h-4 w-4 stroke-[2.5]", col.hero.iconText)} />
        </div>
        <div className="relative z-10 flex-1">
          <h2 className="text-sm font-bold text-gray-900">{config.label}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{displayContext}</p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <div className={cn("w-28 h-2 rounded-full overflow-hidden", col.hero.iconBg)}>
            <div className={cn("h-full rounded-full transition-all", col.hero.iconBg.replace("/", "").replace("bg-", "bg-").replace("100", "400"))} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-900">{completedCount}/{config.steps.length}</span>
        </div>
      </div>

      {/* ═══ SIDEBAR + CONTENU ═══ */}
      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
        {/* Sidebar */}
        {(() => {
          const activeLabel = activeStep?.title || config.label;
          const sidebarContent = (<>
            {config.steps.map((s) => {
              const isUnlocked = chatStage >= s.minStage;
              const isActive = activeStepId === s.id;
              const hasContent = getCristallise(s.id) !== null;
              return (
                <button
                  key={s.id}
                  onClick={() => isUnlocked && setActiveStepId(s.id)}
                  disabled={!isUnlocked}
                  className={cn(
                    SF.btnBase,
                    isActive
                      ? cn(col.sidebar.active, "border shadow-sm")
                      : isUnlocked
                      ? SF.btnInactive
                      : "opacity-40 cursor-not-allowed border border-transparent"
                  )}
                >
                  <s.icon className={cn(
                    isActive ? cn("h-3.5 w-3.5", col.sidebar.activeText)
                    : isUnlocked ? SF.iconInactive
                    : "h-3.5 w-3.5 text-gray-300"
                  )} />
                  <span className={cn(
                    isActive ? cn("text-[10px] font-bold", col.sidebar.activeText)
                    : isUnlocked ? SF.labelInactive
                    : "text-[10px] text-gray-400"
                  )}>{s.title}</span>
                  {hasContent && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    </span>
                  )}
                  {!hasContent && isUnlocked && chatStage === s.minStage && (
                    <span className="ml-auto w-3 h-3 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </>);
          return isMobile ? (
            <MobileSidebarSheet currentLabel={activeLabel} itemCount={config.steps.length}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className={SF.sidebarW}>
              {sidebarContent}
            </div>
          );
        })()}

        {/* Contenu */}
        <div className={SF.content}>
          <StepContent
            step={activeStep}
            captured={getCristallise(activeStep.id)}
            cristalliseItem={getCristalliseItem(activeStep.id)}
            isUnlocked={chatStage >= activeStep.minStage}
            colors={col}
            phaseKey={config.key}
            activeBotCode={activeBotCode}
            onSendPrompt={(prompt) => {
              setPendingCapture(activeStep.id);
              sendMessage(prompt, activeBotCode);
            }}
            onPin={(text) => addWorkflowItem(config.key, text, "insight")}
            onEdit={(newText) => editCristallise(activeStep.id, newText)}
          />

          {/* Notes capturées */}
          {phaseNotes.length > 0 && (
            <div className={cn("mt-4 rounded-xl p-4", col.notes.border, col.notes.bg)}>
              <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", col.notes.text)}>Notes capturées ({phaseNotes.length})</h4>
              <div className="space-y-1.5">
                {phaseNotes.map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/note">
                    <Zap className={cn("h-3 w-3 mt-0.5 shrink-0", col.notes.iconText)} />
                    <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item.text}</p>
                    <button onClick={() => removeWorkflowItem(item.id)} className="p-0.5 rounded opacity-0 group-hover/note:opacity-100 hover:bg-red-100 transition-all cursor-pointer shrink-0" title="Retirer">
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* S103 — Options à explorer (branches non choisies) */}
          {(() => {
            const phaseBranches = workflowItems.filter(w => w.phase === config.key && w.type === "branch");
            if (phaseBranches.length === 0) return null;
            return (
              <div className="mt-3 border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50/50">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Options à explorer ({phaseBranches.length})
                </span>
                {phaseBranches.map(item => (
                  <div key={item.id} className="flex items-center gap-2 mt-1.5">
                    <GitBranch className="h-3 w-3 text-gray-400 shrink-0" />
                    <span className="text-[11px] text-gray-600 flex-1">{item.text}</span>
                    <button
                      onClick={() => sendMessage(`Explore: ${item.text}`, activeBotCode)}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer shrink-0"
                    >
                      Explorer
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Phase transitions via ControlTowerPanel sidebar + progress bar uniquement (Carl feedback 13 mai) */}
        </div>
      </div>
    </div>
  );
}

// ═══ Contenu d'une étape — PASSIF (affiche le contenu capturé ou l'état d'attente) ═══
// Enrichi Sprint 1: formatCristallise + CristalliseActions + BotBadgeFull

function StepContent({ step, captured, cristalliseItem, isUnlocked, colors, phaseKey, activeBotCode, onSendPrompt, onPin, onEdit }: {
  step: PhaseStep;
  captured: string | null;
  cristalliseItem: import("../AmorcerContext").SimV3CristalliseItem | null;
  isUnlocked: boolean;
  colors: import("./phase-config").PhaseColors;
  phaseKey: string;
  activeBotCode: string;
  onSendPrompt: (prompt: string) => void;
  onPin: (text: string) => void;
  onEdit: (newText: string) => void;
}) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { setAppeared(false); const t = setTimeout(() => setAppeared(true), 80); return () => clearTimeout(t); }, [step.id]);

  return (
    <div className={cn("transition-all duration-300", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <step.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <h3 className="text-sm font-bold text-gray-900 flex-1">{step.title}</h3>
          {captured && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Cristallisé</span>
          )}
          {!captured && isUnlocked && (
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full animate-pulse", colors.badge.bg, colors.badge.text)}>En attente</span>
          )}
          {!isUnlocked && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Verrouillé</span>
          )}
        </div>
        {/* Body */}
        <div className="px-5 py-4">
          {captured ? (
            <div className="space-y-0">
              {/* Contenu formaté markdown */}
              <div className="text-xs text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto">
                {formatCristallise(captured, cristalliseItem?.contentTypes, cristalliseItem?.source)}
              </div>
              {/* Boutons actions + badge source */}
              <CristalliseActions
                content={captured}
                sectionId={step.id}
                source={cristalliseItem?.source || activeBotCode}
                sourceType={cristalliseItem?.sourceType || "chat"}
                onSendPrompt={onSendPrompt}
                onPin={onPin}
                onEdit={onEdit}
                actions={["pin", "deepen", "challenge", "edit"]}
              />
            </div>
          ) : isUnlocked ? (
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center animate-pulse", colors.hero.iconBg)}>
                <step.icon className={cn("h-4 w-4", colors.hero.iconText)} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">En attente de la discussion...</p>
                <p className="text-[10px] text-gray-400">{step.subtitle} — le contenu apparaîtra ici automatiquement.</p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic text-center">Cette étape se débloquera au fil de la discussion.</p>
          )}
        </div>
      </div>
    </div>
  );
}
