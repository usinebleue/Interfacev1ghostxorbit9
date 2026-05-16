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
  Loader2, Network, FileText, Activity, Rocket,
  AlertTriangle, Lightbulb, Target, TrendingUp,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { useAmorcer } from "../AmorcerContext";
import { useChatContext } from "../../v2/context/ChatContext";
import { PHASE_CONFIGS } from "./phase-config";
import { TechniquePanel } from "./reflexion-tools";
import { WorkspaceReflexionHub } from "./WorkspaceReflexionHub";
import { BlockRenderer, SkeletonBlock, BLOCK_TYPE_LABELS, BlockDisplayContext } from "./workspace-block-renderers";
import { BotAvatar } from "../simulation/primitives";
import { BOT_NAME } from "../../v2/api/types";
import { api } from "../../v2/api/client";
import type { CascadeSuggestion } from "../../v2/api/types";

// ═══ B.1: ThinkingAnimation steps par etape CREDO (pattern primitives.tsx ThinkingAnimation) ═══

const THINKING_STEPS: Record<string, string[]> = {
  C: ["Analyse du contexte", "Identification des enjeux", "Formulation"],
  R: ["Recherche d'insights", "Analyse croisee", "Synthese"],
  E: ["Evaluation des options", "Arguments cles", "Formulation"],
  D: ["Verification des donnees", "Validation logique", "Mise en forme"],
  O: ["Consolidation", "Plan d'action", "Recommandations"],
};

// ═══ B.4: Cascade suggestion border colors (pattern InlineOptions from primitives.tsx) ═══

const SUGGESTION_BORDER_COLORS = ["border-l-blue-500", "border-l-amber-500", "border-l-green-500", "border-l-red-500"];

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
    activeBotCode, activePhase, setActivePhase, workspaceBlocks, addWorkspaceBlock,
    updateWorkspaceBlock, removeWorkspaceBlock, getBlocksByCredoStep, getBlocksByType,
    addWorkspaceTask,
  } = useAmorcer();
  const { sendMessage, messages, isTyping } = useChatContext();
  const displayContext = context || "Discussion en cours";
  const blocksEndRef = useRef<HTMLDivElement>(null);

  const [activeStepId, setActiveStepId] = useState<string>(config.steps[0]?.id || "");

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
  const [filterStep, setFilterStep] = useState<string | null>(null);
  // Sprint 2A v2: technique panel — clic sidebar → sous-section workspace
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
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

  // S2.2.2: LoopGuard — detect stagnation on same CREDO step
  const loopGuardRef = useRef({ stage: chatStage, msgCount: 0 });
  const [loopGuardVisible, setLoopGuardVisible] = useState(false);
  useEffect(() => {
    if (chatStage !== loopGuardRef.current.stage) {
      // Stage advanced → reset
      loopGuardRef.current = { stage: chatStage, msgCount: 0 };
      setLoopGuardVisible(false);
    }
  }, [chatStage]);
  useEffect(() => {
    const userMsgCount = messages.filter(m => m.role === "user").length;
    if (chatStage === loopGuardRef.current.stage) {
      loopGuardRef.current.msgCount = userMsgCount;
      if (userMsgCount >= 6 && !loopGuardVisible) {
        setLoopGuardVisible(true);
      }
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // S3A.1: Track new blocks for animated entry — skip initial load (800ms grace)
  const animReadyRef = useRef(false);
  const seenBlocksRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const t = setTimeout(() => { animReadyRef.current = true; }, 800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    workspaceBlocks.forEach(b => seenBlocksRef.current.add(b.id));
  }, [workspaceBlocks]);

  // Auto-scroll vers les nouveaux blocks
  const prevBlockCount = useRef(workspaceBlocks.length);
  useEffect(() => {
    if (workspaceBlocks.length > prevBlockCount.current) {
      blocksEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevBlockCount.current = workspaceBlocks.length;
  }, [workspaceBlocks.length]);

  // ═══ Delegation handler — ecoute CustomEvent bt-delegate-task depuis RapportRenderer ═══
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { titre: string; priorite?: string; bot?: string; assignee?: string; blockId?: string };
      if (!detail?.titre) return;
      const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      addWorkspaceTask({
        id: taskId,
        titre: detail.titre,
        priorite: (detail.priorite as "haute" | "moyenne" | "basse") || "moyenne",
        assignedBot: detail.bot || activeBotCode,
        assignedHuman: detail.assignee,
        status: "todo",
        createdFrom: detail.blockId,
        createdAt: Date.now(),
      });
      // Envoyer un message au bot assigne
      const targetBot = detail.bot || activeBotCode;
      sendMessage(`Tache assignee: ${detail.titre}. ${detail.assignee ? `Responsable: ${detail.assignee}.` : ""} Priorite: ${detail.priorite || "moyenne"}.`, targetBot);
    };
    window.addEventListener("bt-delegate-task", handler);
    return () => window.removeEventListener("bt-delegate-task", handler);
  }, [addWorkspaceTask, activeBotCode, sendMessage]);

  // B.1: ThinkingOverlay — uses isTyping from chat hook (same source as DiscussionWindow)
  // Show thinking only when waiting for bot AND bot hasn't started streaming yet
  const isAnyStreaming = messages.some(m => m.isStreaming);
  const isThinking = isTyping && !isAnyStreaming;
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  useEffect(() => {
    if (!isThinking) { setCurrentThinkingStep(0); return; }
    const timer = setInterval(() => {
      setCurrentThinkingStep(prev => prev < 2 ? prev + 1 : prev);
    }, 1200);
    return () => clearInterval(timer);
  }, [isThinking]); // eslint-disable-line react-hooks/exhaustive-deps

  // B.2: Multi-phase consultation detection
  const multiPhaseTargets = [...new Set(latestCascadeSuggestions.map(s => s.view || s.target_section).filter(Boolean))];
  const hasMultiPhaseConsult = multiPhaseTargets.length >= 2;

  // S3B.2: Pulse animation on block when workspace action triggered
  const [pulsingBlockId, setPulsingBlockId] = useState<string | null>(null);

  // B.3: TypewriterText cursor — visible briefly after new block appears
  const [showTypingCursor, setShowTypingCursor] = useState(false);
  useEffect(() => {
    if (workspaceBlocks.length === 0) return;
    setShowTypingCursor(true);
    const t = setTimeout(() => setShowTypingCursor(false), 3000);
    return () => clearTimeout(t);
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

  // Block type counts + dominant bot for sidebar index
  const blockTypeCounts = workspaceBlocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});
  const blockTypeBots = workspaceBlocks.reduce<Record<string, Set<string>>>((acc, b) => {
    if (!acc[b.type]) acc[b.type] = new Set();
    if (b.source) acc[b.type].add(b.source);
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
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        sendMessage(`Approfondir en detail: ${block.title}\n\nContexte: ${block.summary}`, activeBotCode);
        break;
      case "challenge":
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        sendMessage(`Challenge cet element, trouve les failles: ${block.title}\n\n${block.summary}`, activeBotCode);
        break;
      case "rework":
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
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

  // Sprint 2A: Technique metadata handler — passes technique session info through sendMessage meta
  const handleSendWithMeta = useCallback((prompt: string, meta: { techniqueActive: string; techniqueStep: number; techniqueContext: string }) => {
    sendMessage(prompt, activeBotCode, undefined, {
      techniqueActive: meta.techniqueActive,
      techniqueStep: meta.techniqueStep,
      techniqueContext: meta.techniqueContext,
    });
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
          {/* S2.2.1: Scaffold progress fraction */}
          <div className="relative z-10 flex items-center gap-1.5 shrink-0 ml-2">
            <span className={cn("text-[9px] font-bold", progress === 100 ? "text-emerald-600" : "text-gray-400")}>
              {completedCount}/{config.steps.length}
            </span>
          </div>
        </div>
        {/* S2.2.1: Scaffold progress bar — thin accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 z-10 rounded-b-xl overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500 rounded-r-full", progress === 100 ? "bg-emerald-400" : "bg-sky-400")}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* LoopGuard retire — les utilisateurs passent le temps logique qu'il faut pour cerner la tension */}

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
                          setActiveStepId(s.id);
                          setFilterStep(credoLetter);
                        }}
                        className={cn(
                          SF.btnBase,
                          isActive
                            ? cn(col.sidebar.active, "border shadow-sm")
                            : isUnlocked ? SF.btnInactive
                            : "opacity-50 hover:opacity-70 border border-transparent cursor-pointer"
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

              {/* Modes reflexion et techniques deplacees vers WorkspaceReflexionHub (phase reflexion) */}

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
                    {Object.entries(blockTypeCounts).map(([type, count]) => {
                      const bots = blockTypeBots[type];
                      const botArr = bots ? [...bots] : [];
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            const el = document.getElementById(`block-${type}`);
                            el?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={cn(SF.btnBase, "hover:bg-gray-50 border border-transparent")}
                        >
                          {botArr.length === 1 ? (
                            <BotAvatar code={botArr[0]} size="sm" />
                          ) : botArr.length > 1 ? (
                            <span className="text-[8px] w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">{botArr.length}</span>
                          ) : null}
                          <span className="text-[10px] text-gray-600">{BLOCK_TYPE_LABELS[type as keyof typeof BLOCK_TYPE_LABELS] || type}</span>
                          <span className="ml-auto text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">{count}</span>
                        </button>
                      );
                    })}
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

          {/* TECHNIQUE PANEL — sous-section ouverte depuis le sidebar */}
          {selectedTechnique && (
            <div className="mt-3">
              <TechniquePanel
                techniqueId={selectedTechnique}
                context={displayContext}
                onSend={handleReflexionSend}
                onSendWithMeta={handleSendWithMeta}
                onClose={() => setSelectedTechnique(null)}
              />
            </div>
          )}

          {/* REFLEXION HUB — visible quand on est sur l'etape Rechercher (modes + techniques) */}
          {activeStepId.includes("rechercher") && !selectedTechnique && (
            <div className="mt-3">
              <WorkspaceReflexionHub
                context={displayContext !== "Discussion en cours" ? displayContext : null}
                onSendMessage={sendMessage}
                messages={messages}
                activeBotCode={activeBotCode}
                activeBotName={BOT_NAME[activeBotCode] || "CarlOS"}
              />
            </div>
          )}

          {/* B.1: ThinkingOverlay — visible quand le bot reflechit (pattern ThinkingAnimation primitives.tsx) */}
          {isThinking && (
            <div className="mt-3 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-sky-600 animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-sky-700">Reflexion en cours...</p>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {(THINKING_STEPS[currentCredoLetter] || THINKING_STEPS.C).map((step, j) => (
                      <span key={j} className={cn(
                        "text-[9px] flex items-center gap-1 transition-all",
                        j < currentThinkingStep ? "text-emerald-600 line-through opacity-60" :
                        j === currentThinkingStep ? "text-sky-700 font-bold" :
                        "text-gray-400"
                      )}>
                        {j < currentThinkingStep && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {j === currentThinkingStep && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B.2: MultiConsultOverlay — visible quand cascade suggestions ciblent plusieurs phases */}
          {hasMultiPhaseConsult && !isThinking && (
            <div className="mt-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-3 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-indigo-600 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-700">Perspectives multi-phases disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                {multiPhaseTargets.map((phase, j) => (
                  <span key={j} className="text-[9px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold capitalize">
                    {phase}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC STEP CONTENT — tous les blocs, pas de filtrage par step */}
          <DynamicStepContent
            allBlocks={workspaceBlocks}
            context={displayContext}
            onBlockAction={handleBlockAction}
            pulsingBlockId={pulsingBlockId}
            activeBotCode={activeBotCode}
          />
          {showTypingCursor && (
            <div className="flex items-center gap-1.5 px-4 py-2 animate-in fade-in duration-300">
              <span className="inline-block w-0.5 h-4 bg-gray-800 animate-pulse rounded-full" />
              <span className="text-[9px] text-gray-400 italic">cristallisation en cours...</span>
            </div>
          )}
          <div ref={blocksEndRef} />

          {/* CASCADE SUGGESTIONS — cross-phase (Sprint 1 Etape 6) + B.4 bordure gauche coloree */}
          {latestCascadeSuggestions.length > 0 && (
            <div className="mt-3 space-y-1.5 animate-in fade-in duration-500">
              {latestCascadeSuggestions.map((sug, sugIdx) => (
                <button
                  key={sugIdx}
                  onClick={() => {
                    // PAS de switch de phase auto — l'utilisateur reste en discussion
                    // La transition de phase se fait explicitement via la sidebar/ControlTower
                    sendMessage(sug.message, activeBotCode);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white/80",
                    "border-l-[3px]", SUGGESTION_BORDER_COLORS[sugIdx % SUGGESTION_BORDER_COLORS.length],
                    "hover:shadow-sm hover:bg-gray-50 cursor-pointer transition-all text-left",
                    "animate-in fade-in slide-in-from-bottom-1 duration-300"
                  )}
                  style={{ animationDelay: `${sugIdx * 100}ms`, animationFillMode: 'backwards' }}
                >
                  <ArrowRight className="h-3 w-3 text-gray-500 shrink-0" />
                  <span className="text-[10px] text-gray-700 font-medium">
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

          {/* S3B.1: GenerateReportButton — visible when chatStage >= 3 and enough blocks */}
          {chatStage >= 3 && workspaceBlocks.length >= 3 && !workspaceBlocks.some(b => b.type === "rapport") && (
            <GenerateReportButton
              workspaceBlocks={workspaceBlocks}
              activeBotCode={activeBotCode}
              addWorkspaceBlock={addWorkspaceBlock}
            />
          )}

          {/* S3C.1: CreateChantierButton — visible when rapport exists */}
          {workspaceBlocks.some(b => b.type === "rapport") && (
            <CreateChantierButton
              workspaceBlocks={workspaceBlocks}
              activeBotCode={activeBotCode}
            />
          )}

          {/* S2.4.2: Vue resume multi-phase accordion */}
          {workspaceBlocks.length > 2 && (
            <MultiPhaseAccordion workspaceBlocks={workspaceBlocks} credoLabels={CREDO_LABELS} />
          )}

          {/* Phase transitions via ControlTowerPanel sidebar uniquement — bouton retire (Carl feedback 13 mai) */}
         </div>{/* close fade-in wrapper */}
        </div>
      </div>
    </div>
  );
}

// ═══ S3B.1: GenerateReportButton — Generer le Rapport de Discussion ═══

function GenerateReportButton({ workspaceBlocks, activeBotCode, addWorkspaceBlock }: {
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  activeBotCode: string;
  addWorkspaceBlock: (block: import("../core/types").WorkspaceBlock) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);

  useEffect(() => {
    if (!generating) { setThinkingStep(0); return; }
    const timer = setInterval(() => {
      setThinkingStep(prev => prev < 2 ? prev + 1 : prev);
    }, 1200);
    return () => clearInterval(timer);
  }, [generating]);

  const REPORT_STEPS = ["Compilation des blocs...", "Analyse des decisions...", "Structuration du rapport..."];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const participants = [...new Set(workspaceBlocks.map(b => b.source).filter(Boolean))];
      if (!participants.includes(activeBotCode)) participants.unshift(activeBotCode);
      const res = await api.generateDiscussionReport({
        blocks: workspaceBlocks.map(b => ({ type: b.type, title: b.title, summary: b.summary, credo_step: b.credo_step })),
        bot_code: activeBotCode,
        participants,
      });
      if (res?.block) {
        addWorkspaceBlock({
          id: `rapport-${Date.now()}`,
          type: "rapport",
          title: res.block.title || "Rapport de discussion",
          summary: res.block.summary || "",
          structured_data: res.block.structured_data,
          credo_step: "O",
          confidence: res.block.confidence || 0.85,
          source: activeBotCode,
          sourceType: "chat",
          timestamp: Date.now(),
        });
      }
    } catch {
      // Fallback: generate a basic report client-side
      const sections = [
        { title: "Tension identifiee", content: workspaceBlocks.find(b => b.credo_step === "C")?.summary || "—" },
        { title: "Analyse", content: workspaceBlocks.filter(b => b.credo_step === "R").map(b => b.summary).join("\n") || "—" },
        { title: "Solutions explorees", content: workspaceBlocks.filter(b => b.credo_step === "E").map(b => b.summary).join("\n") || "—" },
        { title: "Plan d'action", content: workspaceBlocks.filter(b => ["D", "O"].includes(b.credo_step)).map(b => b.summary).join("\n") || "—" },
      ].filter(s => s.content !== "—");
      addWorkspaceBlock({
        id: `rapport-${Date.now()}`,
        type: "rapport",
        title: "Rapport de discussion",
        summary: sections.map(s => `**${s.title}**\n${s.content}`).join("\n\n"),
        structured_data: { sections },
        credo_step: "O",
        confidence: 0.75,
        source: activeBotCode,
        sourceType: "chat",
        timestamp: Date.now(),
      });
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-emerald-700">Generation du rapport...</p>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {REPORT_STEPS.map((step, j) => (
                <span key={j} className={cn(
                  "text-[9px] flex items-center gap-1 transition-all",
                  j < thinkingStep ? "text-emerald-600 line-through opacity-60" :
                  j === thinkingStep ? "text-emerald-700 font-bold" :
                  "text-gray-400"
                )}>
                  {j < thinkingStep && <CheckCircle2 className="h-2.5 w-2.5" />}
                  {j === thinkingStep && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm"
      >
        <FileText className="h-4 w-4" />
        <span className="text-sm font-bold">Generer le Rapport</span>
      </button>
    </div>
  );
}

// ═══ S3C.1: CreateChantierButton — Passer en Conception depuis le rapport-minutes ═══

function CreateChantierButton({ workspaceBlocks, activeBotCode }: {
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  activeBotCode: string;
}) {
  const { startConception } = useAmorcer();
  const rapport = workspaceBlocks.find(b => b.type === "rapport");
  const [transitioning, setTransitioning] = useState(false);
  const [typewriterIdx, setTypewriterIdx] = useState(0);
  if (!rapport) return null;

  const sectionCount = (rapport.structured_data as any)?.sections?.length || 0;
  const transitionText = `Pret pour Creer! Les ${sectionCount || workspaceBlocks.length} sections sont sauvegardees...`;

  const handleTransition = () => {
    setTransitioning(true);
    setTypewriterIdx(0);
  };

  // Typewriter effect during transition
  useEffect(() => {
    if (!transitioning) return;
    if (typewriterIdx >= transitionText.length) {
      // Wait 800ms after typewriter completes, then navigate
      const nav = setTimeout(() => startConception(), 800);
      return () => clearTimeout(nav);
    }
    const timer = setTimeout(() => setTypewriterIdx(prev => prev + 1), 35);
    return () => clearTimeout(timer);
  }, [transitioning, typewriterIdx, transitionText.length, startConception]);

  if (transitioning) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-100 border border-orange-200 p-4 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse shrink-0" />
          <ArrowRight className="h-3.5 w-3.5 text-orange-500 animate-bounce" />
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shrink-0" style={{ animationDelay: "300ms" }} />
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider ml-1">
            Discussion → Conception
          </span>
        </div>
        <p className="text-sm text-orange-800 font-medium leading-relaxed min-h-[1.5rem]">
          {transitionText.slice(0, typewriterIdx)}
          <span className="inline-block w-0.5 h-4 bg-orange-600 animate-pulse ml-0.5 align-text-bottom" />
        </p>
        <div className="mt-3 h-1 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (typewriterIdx / transitionText.length) * 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleTransition}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
      >
        <Rocket className="h-4 w-4" />
        <span className="text-sm font-bold">Passer en Conception</span>
      </button>
    </div>
  );
}

// ═══ DynamicStepContent — workspace dynamique, pattern simulations ═══
// Montre TOUS les blocs cristallises (pas de filtrage par step).
// Le header donne le contexte de l'etape active, mais tous les blocs sont visibles.

const STEP_BADGE: Record<string, { badge: string; bg: string }> = {
  C: { badge: "C", bg: "bg-sky-100 text-sky-700" },
  R: { badge: "R", bg: "bg-blue-100 text-blue-700" },
  E: { badge: "E", bg: "bg-amber-100 text-amber-700" },
  D: { badge: "D", bg: "bg-green-100 text-green-700" },
  O: { badge: "O", bg: "bg-purple-100 text-purple-700" },
};

const UNIVERSAL_BLOCK_TYPES = new Set(["rapport", "synthese"]);

function DynamicStepContent({ allBlocks, context, onBlockAction, pulsingBlockId, activeBotCode }: {
  allBlocks: import("../core/types").WorkspaceBlock[];
  context: string;
  onBlockAction: (action: string, blockId: string) => void;
  pulsingBlockId: string | null;
  activeBotCode?: string;
}) {
  // Bot-specific filtering: if only 1 bot contributed, filter to that bot's blocks + universal types
  const uniqueSources = [...new Set(allBlocks.map(b => b.source).filter(Boolean))];
  const isMultiBot = uniqueSources.length > 1;
  const filteredBlocks = (activeBotCode && !isMultiBot)
    ? allBlocks.filter(b => UNIVERSAL_BLOCK_TYPES.has(b.type) || !b.source || b.source === activeBotCode)
    : allBlocks;

  if (filteredBlocks.length === 0) {
    // Etat vide: contexte minimal — les vrais blocs (diagnostic, brainstorm, etc.)
    // arrivent dynamiquement via le pipeline backend _llm_crystallize → useWorkspaceCapture → BlockRenderer
    return (
      <div className="mt-3">
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-gray-400 animate-pulse" />
            <h3 className="text-xs font-medium text-gray-500">{context || "Discussion en cours"}</h3>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Les analyses et diagnostics apparaitront ici au fil de la conversation.
          </p>
        </div>
      </div>
    );
  }

  // Show ALL blocks — sorted by timestamp, with per-block step badge
  return (
    <BlockDisplayContext.Provider value={{ compact: true }}>
    <div className="mt-3 space-y-3">
      {/* Summary header — shows count + context */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
            {filteredBlocks.length} element{filteredBlocks.length > 1 ? "s" : ""} cristallise{filteredBlocks.length > 1 ? "s" : ""}
          </span>
          {/* Show which CREDO steps have content */}
          {["C","R","E","D","O"].map(s => {
            const count = filteredBlocks.filter(b => b.credo_step === s).length;
            if (count === 0) return null;
            const badge = STEP_BADGE[s] || STEP_BADGE.C;
            return (
              <span key={s} className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", badge.bg)}>
                {badge.badge}·{count}
              </span>
            );
          })}
        </div>
        <h3 className="text-xs font-bold text-gray-900">{context}</h3>
      </div>

      {/* All blocks — BlockRenderer per block, with CREDO phase separators */}
      {filteredBlocks.map((block, i) => {
        const prevBlock = i > 0 ? filteredBlocks[i - 1] : null;
        const showSeparator = prevBlock && prevBlock.credo_step !== block.credo_step && block.type !== "synthese";
        const CREDO_NAMES: Record<string, string> = { C: "Connexion", R: "Recherche", E: "Exposition", D: "Demonstration", O: "Obtention" };
        const badge = STEP_BADGE[block.credo_step] || STEP_BADGE.C;
        return (
          <div key={block.id}>
            {showSeparator && (
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className={cn("text-[9px] px-2.5 py-0.5 rounded-full font-bold", badge.bg)}>
                  {CREDO_NAMES[block.credo_step] || block.credo_step}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <div
              id={`block-${block.type}`}
              className={cn(pulsingBlockId === block.id && "ring-2 ring-blue-400 rounded-xl transition-all")}
            >
              <BlockRenderer block={block} onAction={onBlockAction} animated={false} />
            </div>
          </div>
        );
      })}
    </div>
    </BlockDisplayContext.Provider>
  );
}

// ═══ S2.4.2: Multi-phase accordion — resume des blocs par etape CREDO ═══

function MultiPhaseAccordion({ workspaceBlocks, credoLabels }: {
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  credoLabels: Record<string, string>;
}) {
  const [openStep, setOpenStep] = useState<string | null>(null);

  const STEP_COLORS: Record<string, { dot: string; bg: string; border: string; text: string }> = {
    C: { dot: "bg-sky-400", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
    R: { dot: "bg-blue-400", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    E: { dot: "bg-amber-400", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    D: { dot: "bg-green-400", bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
    O: { dot: "bg-purple-400", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  };

  const steps = ["C", "R", "E", "D", "O"];
  const grouped = steps.map(s => ({
    step: s,
    blocks: workspaceBlocks.filter(b => b.credo_step === s),
  })).filter(g => g.blocks.length > 0);

  if (grouped.length <= 1) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Resume CREDO</span>
      </div>
      {grouped.map(({ step, blocks }) => {
        const sc = STEP_COLORS[step] || STEP_COLORS.C;
        const isOpen = openStep === step;
        return (
          <div key={step} className="border-b border-gray-100 last:border-0">
            <button
              onClick={() => setOpenStep(isOpen ? null : step)}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={cn("w-2 h-2 rounded-full shrink-0", sc.dot)} />
              <span className={cn("text-[10px] font-bold flex-1 text-left", sc.text)}>
                {credoLabels[step] || step}
              </span>
              <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                {blocks.length} bloc{blocks.length > 1 ? "s" : ""}
              </span>
              <ArrowRight className={cn("h-3 w-3 text-gray-400 transition-transform", isOpen && "rotate-90")} />
            </button>
            {isOpen && (
              <div className="px-4 pb-3 space-y-1.5">
                {blocks.map(b => (
                  <div key={b.id} className={cn("flex items-start gap-2 px-3 py-2 rounded-lg border", sc.bg, sc.border)}>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5",
                      b.confidence >= 0.8 ? "bg-emerald-100 text-emerald-700" :
                      b.confidence >= 0.5 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>{Math.round(b.confidence * 100)}%</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-900 truncate">{b.title}</p>
                      <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{b.summary.substring(0, 150)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
