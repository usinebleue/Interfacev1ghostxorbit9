/**
 * LiveDiscussionView.tsx — Vue unifiee Discussion + Reflexion
 *
 * Composant principal du workspace dynamique intelligent.
 * Remplace LivePhaseView (pour discussion) ET LiveReflexionView.
 *
 * LAYOUT (fidele aux simulations FocusDiscussionView/FocusReflexionView):
 * - Hero compact sky-blue (phase Discussion) avec CREDO progress dots
 * - Sidebar 180px (3 tiers: CREDO steps, outils reflexion, index blocks)
 * - Zone contenu: workspace blocks dynamiques cristallises
 *
 * Les actions (Approfondir/Challenger/Consulter) sont dans la zone chat
 * via BubbleActions.tsx — PAS dans le workspace.
 * Les outils reflexion sont dans la sidebar (envoient un prompt au bot).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2, Zap, X, ArrowRight,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { useAmorcer } from "../AmorcerContext";
import { useChatContext } from "../../v2/context/ChatContext";
import { PHASE_CONFIGS } from "./phase-config";
import { REFLEXION_TOOL_IDS, ReflexionModeActions, TechniqueSelector } from "./reflexion-tools";
import { BlockRenderer, BLOCK_TYPE_LABELS } from "./workspace-block-renderers";
import type { CascadeSuggestion } from "../../v2/api/types";

interface LiveDiscussionViewProps {
  context: string | null;
  onPhaseComplete?: () => void;
}

export function LiveDiscussionView({ context, onPhaseComplete }: LiveDiscussionViewProps) {
  const config = PHASE_CONFIGS["discussion"];
  if (!config) return null;

  return <LiveDiscussionViewInner config={config} context={context} onPhaseComplete={onPhaseComplete} />;
}

function LiveDiscussionViewInner({ config, context, onPhaseComplete }: {
  config: import("./phase-config").PhaseConfig;
  context: string | null;
  onPhaseComplete?: () => void;
}) {
  const isMobile = useIsMobile();
  const {
    chatStage, workflowItems, removeWorkflowItem, getCristallise,
    getCristalliseItem, editCristallise, setPendingCapture, addWorkflowItem,
    activeBotCode, activePhase, workspaceBlocks, addWorkspaceBlock,
    updateWorkspaceBlock, removeWorkspaceBlock, getBlocksByCredoStep, getBlocksByType,
  } = useAmorcer();
  const { sendMessage, messages } = useChatContext();
  const displayContext = context || "Discussion en cours";
  const blocksEndRef = useRef<HTMLDivElement>(null);

  // Extract latest cascade suggestions from recent bot messages
  const latestCascadeSuggestions: CascadeSuggestion[] = (() => {
    const botMsgs = messages.filter(m => m.role === "assistant" && m.cascadeSuggestions?.length);
    const last = botMsgs[botMsgs.length - 1];
    return last?.cascadeSuggestions || [];
  })();

  // Derive current CREDO letter from activeStepId
  const currentCredoLetter = activeStepId.includes("comprendre") ? "C"
    : activeStepId.includes("rechercher") ? "R"
    : activeStepId.includes("exposer") ? "E"
    : activeStepId.includes("demontrer") ? "D"
    : activeStepId.includes("objectif") ? "O" : "C";
  const isPhaseR = currentCredoLetter === "R" && chatStage >= 1;

  const [activeStepId, setActiveStepId] = useState<string>(config.steps[0]?.id || "");
  const [filterStep, setFilterStep] = useState<string | null>(null);
  const [contentAppeared, setContentAppeared] = useState(false);

  // Fade-in animation on content (pattern FocusReflexionView StepContent)
  useEffect(() => {
    setContentAppeared(false);
    const t = setTimeout(() => setContentAppeared(true), 80);
    return () => clearTimeout(t);
  }, [activeStepId]);

  // Auto-switch vers la derniere etape qui vient de recevoir du contenu
  useEffect(() => {
    const latestWithContent = [...config.steps].reverse().find(s => getCristallise(s.id) !== null);
    if (latestWithContent && latestWithContent.id !== activeStepId) {
      setActiveStepId(latestWithContent.id);
    }
  }, [chatStage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll vers les nouveaux blocks
  const prevBlockCount = useRef(workspaceBlocks.length);
  useEffect(() => {
    if (workspaceBlocks.length > prevBlockCount.current) {
      blocksEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevBlockCount.current = workspaceBlocks.length;
  }, [workspaceBlocks.length]);

  const activeStep = config.steps.find(s => s.id === activeStepId) || config.steps[0];
  const completedCount = config.steps.filter(s => getCristallise(s.id) !== null).length;
  const progress = Math.round((completedCount / config.steps.length) * 100);
  const phaseNotes = workflowItems.filter(w => w.phase === config.key);
  const minRequired = Math.max(1, config.steps.length - 1);
  const col = config.colors;
  const PhaseIcon = config.icon;

  // Filtered blocks for display
  const displayBlocks = filterStep
    ? workspaceBlocks.filter(b => b.credo_step === filterStep)
    : workspaceBlocks;

  // Block type counts for sidebar index
  const blockTypeCounts = workspaceBlocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});

  // Block counts per CREDO step for separators
  const blocksByCredoStep = workspaceBlocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.credo_step] = (acc[b.credo_step] || 0) + 1;
    return acc;
  }, {});

  // Handle block actions
  const handleBlockAction = useCallback((action: string, blockId: string) => {
    const block = workspaceBlocks.find(b => b.id === blockId);
    if (!block) return;

    switch (action) {
      case "pin":
        addWorkflowItem("discussion", `[${BLOCK_TYPE_LABELS[block.type] || block.type}] ${block.title}: ${block.summary.substring(0, 120)}`, "insight");
        break;
      case "deepen":
        sendMessage(`Approfondir en detail: ${block.title}\n\nContexte: ${block.summary}`, activeBotCode);
        break;
      case "challenge":
        sendMessage(`Challenge cet element, trouve les failles: ${block.title}\n\n${block.summary}`, activeBotCode);
        break;
      case "rework":
        sendMessage(`Retravaille et enrichis: ${block.title}\n\n${block.summary}`, activeBotCode);
        break;
      case "delete":
        removeWorkspaceBlock(blockId);
        break;
    }
  }, [workspaceBlocks, addWorkflowItem, sendMessage, activeBotCode, removeWorkspaceBlock]);

  // Reflexion tool click handler
  const handleReflexionSend = useCallback((prompt: string) => {
    sendMessage(prompt, activeBotCode);
  }, [sendMessage, activeBotCode]);

  // CREDO step labels
  const CREDO_LABELS: Record<string, string> = { C: "Comprendre", R: "Rechercher", E: "Exposer", D: "Demontrer", O: "Objectif" };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* HERO COMPACT — blur gradients (pattern FocusReflexionView L63-65) */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4 hover:shadow-md transition-all">
        {/* Blurred gradient orbs — exact simulation pattern */}
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-sky-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-blue-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", col.hero.iconBg)}>
            <PhaseIcon className={cn("h-5 w-5", col.hero.iconText)} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{config.label}</h2>
            <p className="text-[10px] text-gray-500">CREDO — {displayContext}</p>
          </div>
        </div>

        {/* CREDO Progress — colored step icons (pattern FocusReflexionView L82-92) */}
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          {config.steps.map((s, i) => {
            const isDone = i < chatStage;
            const isCurrent = i === chatStage;
            const isLocked = i > chatStage;
            return (
              <div key={s.id} className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                isDone ? "bg-emerald-100 text-emerald-600" :
                isCurrent ? "bg-sky-100 text-sky-600 ring-1 ring-sky-300" :
                "bg-gray-100 text-gray-300"
              )} title={s.title}>
                {isDone ? <CheckCircle2 className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* SIDEBAR + CONTENU */}
      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
        {/* Sidebar */}
        {(() => {
          const activeLabel = activeStep?.title || config.label;
          const sidebarContent = (
            <div className="space-y-3">
              {/* Tier 1: CREDO Steps */}
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2">CREDO</span>
                <div className="mt-1 space-y-0.5">
                  {config.steps.map((s) => {
                    const isUnlocked = chatStage >= s.minStage;
                    const isActive = activeStepId === s.id;
                    const hasContent = getCristallise(s.id) !== null;
                    const credoLetter = s.id.includes("comprendre") ? "C" : s.id.includes("rechercher") ? "R" : s.id.includes("exposer") ? "E" : s.id.includes("demontrer") ? "D" : "O";
                    // Step-specific colors (pattern FocusReflexionView STEP_COLORS)
                    const stepColors: Record<string, { bg: string; text: string }> = {
                      C: { bg: "bg-sky-100", text: "text-sky-600" },
                      R: { bg: "bg-blue-100", text: "text-blue-600" },
                      E: { bg: "bg-amber-100", text: "text-amber-600" },
                      D: { bg: "bg-green-100", text: "text-green-600" },
                      O: { bg: "bg-purple-100", text: "text-purple-600" },
                    };
                    const sc = stepColors[credoLetter] || stepColors.C;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (isUnlocked) {
                            setActiveStepId(s.id);
                            setFilterStep(credoLetter);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={cn(
                          SF.btnBase,
                          isActive
                            ? cn(col.sidebar.active, "border shadow-sm")
                            : isUnlocked ? SF.btnInactive
                            : "opacity-40 cursor-not-allowed border border-transparent"
                        )}
                      >
                        {/* Colored icon box — pattern FocusReflexionView L113-114 */}
                        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", isUnlocked ? cn(sc.bg, sc.text) : "bg-gray-100 text-gray-300")}>
                          <s.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "text-[10px] font-bold leading-tight block",
                            isActive ? col.sidebar.activeText
                            : isUnlocked ? "text-gray-700"
                            : "text-gray-400"
                          )}>{s.title}</span>
                          <span className="text-[9px] text-gray-400 leading-tight block">{s.subtitle}</span>
                        </div>
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
                </div>
              </div>

              {/* Tier 2: Outils reflexion */}
              {chatStage >= 1 && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2">Outils reflexion</span>
                  <div className="mt-1 space-y-0.5">
                    {REFLEXION_TOOL_IDS.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => handleReflexionSend(tool.prompt(displayContext))}
                        className={cn(SF.btnBase, "hover:bg-orange-50 hover:shadow-sm border border-transparent transition-all")}
                      >
                        <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center shrink-0">
                          <tool.icon className="h-3 w-3 text-orange-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 3: Index des blocks */}
              {workspaceBlocks.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2">
                    Blocs ({workspaceBlocks.length})
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <button
                      onClick={() => setFilterStep(null)}
                      className={cn(SF.btnBase, !filterStep ? "bg-gray-100 border border-gray-200" : "hover:bg-gray-50 border border-transparent")}
                    >
                      <span className="text-[10px] font-bold text-gray-600">Tous</span>
                      <span className="ml-auto text-[9px] text-gray-400">{workspaceBlocks.length}</span>
                    </button>
                    {Object.entries(blockTypeCounts).map(([type, count]) => (
                      <button
                        key={type}
                        onClick={() => {
                          // Scroll to first block of this type
                          const el = document.getElementById(`block-${type}`);
                          el?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={cn(SF.btnBase, "hover:bg-gray-50 border border-transparent")}
                      >
                        <span className="text-[10px] text-gray-600">{BLOCK_TYPE_LABELS[type as keyof typeof BLOCK_TYPE_LABELS] || type}</span>
                        <span className="ml-auto text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

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

        {/* Contenu — workspace blocks dynamiques (pattern FocusDiscussionView) */}
        <div className={SF.content}>
         <div className={cn("transition-all duration-300", contentAppeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>

          {/* OUTILS REFLEXION — Phase R seulement (Sprint 1 Etape 2) */}
          {isPhaseR && (
            <div className="space-y-3 mt-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-3">Modes de reflexion</h4>
                <ReflexionModeActions context={displayContext} onSend={handleReflexionSend} />
                <TechniqueSelector context={displayContext} onSend={handleReflexionSend} />
              </div>
            </div>
          )}

          {/* WORKSPACE BLOCKS DYNAMIQUES */}
          {displayBlocks.length > 0 ? (
            <div className="space-y-3 mt-3">
              {/* Group separator by CREDO step */}
              {(() => {
                let lastStep = "";
                return displayBlocks.map((block) => {
                  const showSeparator = block.credo_step !== lastStep;
                  lastStep = block.credo_step;
                  return (
                    <div key={block.id} id={`block-${block.type}`}>
                      {showSeparator && (
                        <div className="flex items-center gap-2 pt-2 pb-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            block.credo_step === "C" ? "bg-sky-400" :
                            block.credo_step === "R" ? "bg-blue-400" :
                            block.credo_step === "E" ? "bg-amber-400" :
                            block.credo_step === "D" ? "bg-green-400" :
                            "bg-purple-400"
                          )} />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            {CREDO_LABELS[block.credo_step] || block.credo_step}
                          </span>
                          <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                            {blocksByCredoStep[block.credo_step] || 0} bloc{(blocksByCredoStep[block.credo_step] || 0) > 1 ? "s" : ""}
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                          {(blocksByCredoStep[block.credo_step] || 0) >= 2 && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          )}
                        </div>
                      )}
                      <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                        <BlockRenderer block={block} onAction={handleBlockAction} />
                      </div>
                    </div>
                  );
                });
              })()}
              <div ref={blocksEndRef} />
            </div>
          ) : (
            /* Empty state — contextuel par phase CREDO (Sprint 1 Etape 3) */
            <div className="mt-4 space-y-3">
              {(() => {
                const CREDO_EMPTY: Record<string, { title: string; desc: string; color: string; iconBg: string; iconText: string }> = {
                  C: { title: "Comprendre la tension", desc: "Decrivez votre tension ou enjeu. CarlOS va reformuler et identifier les parties prenantes.", color: "border-sky-200 bg-sky-50/30", iconBg: "bg-sky-100", iconText: "text-sky-500" },
                  R: { title: "Rechercher en profondeur", desc: "Explorez en profondeur avec les outils de reflexion ci-dessous. Diagnostics, brainstorms, analyses...", color: "border-blue-200 bg-blue-50/30", iconBg: "bg-blue-100", iconText: "text-blue-500" },
                  E: { title: "Exposer les solutions", desc: "Presentez vos solutions. CarlOS va comparer les avantages et inconvenients de chaque piste.", color: "border-amber-200 bg-amber-50/30", iconBg: "bg-amber-100", iconText: "text-amber-500" },
                  D: { title: "Demontrer la capacite", desc: "Detaillez le plan d'execution. CarlOS va identifier les risques, ressources et budget necessaires.", color: "border-green-200 bg-green-50/30", iconBg: "bg-green-100", iconText: "text-green-500" },
                  O: { title: "Objectif final", desc: "Validez l'objectif final et cristallisez les decisions cles. Definissez les prochaines etapes.", color: "border-purple-200 bg-purple-50/30", iconBg: "bg-purple-100", iconText: "text-purple-500" },
                };
                const empty = CREDO_EMPTY[currentCredoLetter] || CREDO_EMPTY.C;
                return (
                  <div className={cn("rounded-xl border border-dashed p-6 text-center", empty.color)}>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3", empty.iconBg)}>
                      <PhaseIcon className={cn("h-6 w-6", empty.iconText)} />
                    </div>
                    <p className="text-[10px] font-medium text-gray-700">{empty.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{empty.desc}</p>
                  </div>
                );
              })()}
              {/* Quick-start tools — all 5, shown when at phase R or as generic starters */}
              {(isPhaseR || chatStage === 0) && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                    {isPhaseR ? "Outils de recherche" : "Demarrer la reflexion"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {REFLEXION_TOOL_IDS.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => handleReflexionSend(tool.prompt(displayContext))}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm text-[10px] font-medium text-gray-700 cursor-pointer transition-all"
                      >
                        <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          <tool.icon className="h-3 w-3 text-orange-600" />
                        </div>
                        {tool.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASCADE SUGGESTIONS — cross-phase (Sprint 1 Etape 6) */}
          {latestCascadeSuggestions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {latestCascadeSuggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(sug.message, activeBotCode)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-300 cursor-pointer transition-all text-left"
                >
                  <ArrowRight className="h-3 w-3 text-amber-600 shrink-0" />
                  <span className="text-[10px] text-amber-700 font-medium">
                    Explorer en {sug.view || sug.target_section}: {sug.message.substring(0, 100)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Notes capturees */}
          {phaseNotes.length > 0 && (
            <div className={cn("mt-4 rounded-xl p-4", col.notes.border, col.notes.bg)}>
              <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", col.notes.text)}>
                Notes capturees ({phaseNotes.length})
              </h4>
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

          {/* Bouton transition vers Conception — pattern FocusReflexionView L348-354 */}
          {chatStage >= 3 && config.nextPhase && onPhaseComplete && (
            <button
              onClick={onPhaseComplete}
              className="w-full mt-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold hover:bg-amber-100 hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              {config.nextPhaseLabel}
            </button>
          )}
         </div>{/* close fade-in wrapper */}
        </div>
      </div>
    </div>
  );
}
