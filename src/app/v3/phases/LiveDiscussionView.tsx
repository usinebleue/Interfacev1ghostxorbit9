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
  CheckCircle2, Zap, X, ArrowRight, Check,
  Loader2, Network, FileText, Activity, Rocket,
  AlertTriangle, Lightbulb, Target, TrendingUp,
  Eye, Brain, Swords, Sparkles, Search,
  Crown, ArrowLeftRight, RotateCcw, Leaf, Shield,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { useAmorcer } from "../AmorcerContext";
import { useChatContext } from "../../v2/context/ChatContext";
import { PHASE_CONFIGS, CREDO_SUB_SECTIONS } from "./phase-config";
import { TechniquePanel } from "./reflexion-tools";
import { WorkspaceReflexionHub } from "./WorkspaceReflexionHub";
import { BlockRenderer, SkeletonBlock, BLOCK_TYPE_LABELS, BlockDisplayContext } from "./workspace-block-renderers";
import { BotAvatar } from "../simulation/primitives";
import { BOT_NAME } from "../../v2/api/types";
import { api } from "../../v2/api/client";
import type { CascadeSuggestion } from "../../v2/api/types";
import { detectBlockTypeFrontend, extractStructuredDataFrontend } from "../hooks/useWorkspaceCapture";

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
  // W.0: Sous-section active dans le sidebar dynamique
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  // W.0: Technique state machine
  const [activeTechnique, setActiveTechnique] = useState<{ id: string; label: string; totalSteps: number } | null>(null);
  const [techniqueStep, setTechniqueStep] = useState(0);
  const [techniqueContext, setTechniqueContext] = useState("");

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
      case "deepen": {
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        const targetBot = block.source || activeBotCode;
        sendMessage(`Approfondir en detail: ${block.title}\n\nContexte: ${block.summary}`, targetBot);
        break;
      }
      case "challenge": {
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        const targetBot2 = block.source || activeBotCode;
        sendMessage(`Challenge cet element, trouve les failles: ${block.title}\n\n${block.summary}`, targetBot2);
        break;
      }
      case "rework": {
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        const targetBot3 = block.source || activeBotCode;
        sendMessage(`Retravaille et enrichis: ${block.title}\n\n${block.summary}`, targetBot3);
        break;
      }
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

  // W.0: Reset sub-section when CREDO step changes
  useEffect(() => {
    setActiveSubSection(null);
    setActiveTechnique(null);
  }, [activeStepId]);

  // W.0: Technique handlers
  const startTechnique = useCallback((id: string, label: string, totalSteps: number) => {
    setActiveTechnique({ id, label, totalSteps });
    setTechniqueStep(0);
    setTechniqueContext("");
    const ctx = messages.filter(m => m.role === "assistant" && m.content).pop()?.content?.substring(0, 200) || "";
    sendMessage(ctx, activeBotCode, undefined, {
      workspacePhase: `discussion_${activeStepId.split("-").pop()}`,
      techniqueActive: id,
      techniqueStep: 0,
      techniqueContext: "",
    });
  }, [messages, activeBotCode, sendMessage, activeStepId]);

  const handleNextTechStep = useCallback(() => {
    if (!activeTechnique) return;
    const nextStep = techniqueStep + 1;
    if (nextStep >= activeTechnique.totalSteps) {
      setActiveTechnique(null);
      return;
    }
    setTechniqueStep(nextStep);
    const lastResult = messages.filter(m => m.role === "assistant").pop()?.content || "";
    const newContext = techniqueContext + "\n---\n" + lastResult;
    setTechniqueContext(newContext);
    sendMessage("Continue", activeBotCode, undefined, {
      workspacePhase: `discussion_${activeStepId.split("-").pop()}`,
      techniqueActive: activeTechnique.id,
      techniqueStep: nextStep,
      techniqueContext: newContext,
    });
  }, [activeTechnique, techniqueStep, techniqueContext, messages, activeBotCode, sendMessage, activeStepId]);

  // W.0: Sub-section block matching
  const blockMatchesSubSection = useCallback((block: import("../core/types").WorkspaceBlock, subSection: string): boolean => {
    if (subSection === "experts") return !!block.source && block.source !== activeBotCode;
    if (subSection === "deep-search") return block.type === "deep_search";
    if (subSection === "modes-reflexion") return ["libre", "debat", "decision", "crise", "challenge"].includes(block.type);
    if (subSection === "techniques") return ["scamper", "5pourquoi", "brainstorm"].includes(block.type);
    if (subSection === "plan-action") return ["plan_action", "taches", "timeline"].includes(block.type);
    if (subSection === "solutions") return ["recommandations", "brainstorm"].includes(block.type);
    if (subSection === "comparaison") return ["benchmark", "metriques"].includes(block.type);
    if (subSection === "contexte") return block.type === "diagnostic" || block.type === "etat_des_lieux";
    if (subSection === "enjeux") return block.type === "risques" || block.type === "diagnostic";
    if (subSection === "ressources") return ["budget", "metriques"].includes(block.type);
    if (subSection === "plan-match") return ["plan_action", "synthese", "rapport"].includes(block.type);
    if (subSection === "decisions") return block.type === "decision" || block.type === "synthese";
    if (subSection === "angles-morts") return block.type === "challenge" || block.type === "risques";
    return true;
  }, [activeBotCode]);

  // W.0: Filtered blocks based on active sub-section
  const filteredBlocksBySubSection = activeSubSection
    ? workspaceBlocks.filter(b => b.credo_step === currentCredoLetter && blockMatchesSubSection(b, activeSubSection))
    : workspaceBlocks;

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

      {/* W.0: CREDO HORIZONTAL BAR — sous le Hero */}
      <div className="flex items-center gap-1 px-3 py-2 border border-gray-100 rounded-xl bg-white/80 shadow-sm">
        {config.steps.map((step, i) => {
          const isCurrent = i === chatStage;
          const isDone = i < chatStage;
          const isActive = activeStepId === step.id;
          const stepColors: Record<string, { bg: string; text: string }> = {
            C: { bg: "bg-sky-100", text: "text-sky-700" },
            R: { bg: "bg-blue-100", text: "text-blue-700" },
            E: { bg: "bg-amber-100", text: "text-amber-700" },
            D: { bg: "bg-green-100", text: "text-green-700" },
            O: { bg: "bg-purple-100", text: "text-purple-700" },
          };
          const credoLetter = step.id.includes("comprendre") ? "C" : step.id.includes("rechercher") ? "R" : step.id.includes("exposer") ? "E" : step.id.includes("demontrer") ? "D" : "O";
          const sc = stepColors[credoLetter] || stepColors.C;
          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveStepId(step.id);
                setFilterStep(credoLetter);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                isActive ? cn(sc.bg, sc.text, "shadow-sm ring-1 ring-current/20") :
                  isDone ? "bg-emerald-50 text-emerald-700" :
                  isCurrent ? "bg-gray-100 text-gray-600" :
                  "bg-gray-50 text-gray-400"
              )}
            >
              <step.icon className="w-3.5 h-3.5" />
              {step.title}
              {isDone && <Check className="w-3 h-3" />}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-gray-400 font-medium">{chatStage + 1}/5</span>
      </div>

      {/* SIDEBAR + CONTENU */}
      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
        {/* W.0: Sidebar dynamique — sous-sections de l'etape active */}
        {(() => {
          const activeLabel = activeStep?.title || config.label;
          const subSections = CREDO_SUB_SECTIONS[activeStepId] || [];
          const sidebarContent = (
            <div className="space-y-3">
              {/* Sous-sections de l'etape CREDO active */}
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2">
                  {activeStep?.title || "Discussion"}
                </span>
                <div className="mt-1 space-y-0.5">
                  {/* Bouton "Tous" — vue par defaut */}
                  <button
                    onClick={() => setActiveSubSection(null)}
                    className={cn(SF.btnBase, !activeSubSection ? "bg-sky-50 border border-sky-200 shadow-sm" : "hover:bg-gray-50 border border-transparent")}
                  >
                    <Activity className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                    <span className={cn("text-[10px] font-bold", !activeSubSection ? "text-sky-700" : "text-gray-600")}>Tous</span>
                    {workspaceBlocks.filter(b => b.credo_step === currentCredoLetter).length > 0 && (
                      <span className="ml-auto text-[9px] bg-gray-100 px-1.5 rounded text-gray-500">
                        {workspaceBlocks.filter(b => b.credo_step === currentCredoLetter).length}
                      </span>
                    )}
                  </button>
                  {/* Sous-sections dynamiques */}
                  {subSections.map(sub => {
                    const blockCount = workspaceBlocks.filter(b =>
                      b.credo_step === currentCredoLetter && blockMatchesSubSection(b, sub.id)
                    ).length;
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubSection(sub.id)}
                        className={cn(
                          SF.btnBase,
                          activeSubSection === sub.id ? "bg-sky-50 border border-sky-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                        )}
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className={cn("text-[10px] font-bold", activeSubSection === sub.id ? "text-sky-700" : "text-gray-600")}>{sub.label}</span>
                        {blockCount > 0 && (
                          <span className="ml-auto text-[9px] bg-gray-100 px-1.5 rounded text-gray-500">{blockCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Index des blocs (compact) */}
              {workspaceBlocks.length > 0 && (
                <div>
                  <div className={SF.separator} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2">
                    Blocs ({workspaceBlocks.length})
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(blockTypeCounts).slice(0, 5).map(([type, count]) => {
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
            <MobileSidebarSheet currentLabel={activeLabel} itemCount={subSections.length + 1}>
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

          {/* W.0: SUB-SECTION CONTENT — modes reflexion */}
          {activeSubSection === "modes-reflexion" && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-700",
                    prompt: "Fais une analyse approfondie et structuree de:" },
                  { id: "debat", label: "Debat", icon: Swords, bg: "bg-red-100", text: "text-red-700",
                    prompt: "Joue l'avocat du diable — debats les pour et les contre de:" },
                  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-700",
                    prompt: "Genere un maximum d'idees creatives et originales pour:" },
                  { id: "strategie", label: "Strategie", icon: Target, bg: "bg-purple-100", text: "text-purple-700",
                    prompt: "Pense long terme — propose une vision strategique pour:" },
                  { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-700",
                    prompt: "Sors du cadre — propose des approches innovantes et disruptives pour:" },
                  { id: "decision", label: "Decision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700",
                    prompt: "Tranche et recommande — quelle decision prendre pour:" },
                  { id: "crise", label: "Crise", icon: Zap, bg: "bg-orange-100", text: "text-orange-700",
                    prompt: "Mode crise — urgence et pragmatisme. Que faire MAINTENANT pour:" },
                  { id: "deep", label: "Deep", icon: Brain, bg: "bg-indigo-100", text: "text-indigo-700",
                    prompt: "Reflexion profonde et nuancee — explore toutes les dimensions de:" },
                ].map(m => (
                  <button key={m.id}
                    onClick={() => {
                      const ctx = messages.filter(msg => msg.role === "assistant" && msg.content).pop()?.content?.substring(0, 200) || "";
                      sendMessage(`${m.prompt} ${ctx}`, activeBotCode, undefined, { workspacePhase: `discussion_rechercher` });
                    }}
                    className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium border cursor-pointer transition-colors hover:shadow-sm",
                      m.bg, m.text, "border-current/20")}>
                    <m.icon className="h-3 w-3" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
              {/* Blocs filtres par type reflexion */}
              <div className="space-y-2">
                {filteredBlocksBySubSection.map(b => (
                  <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
                    <BlockRenderer block={b} onAction={handleBlockAction} animated={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* W.0: SUB-SECTION CONTENT — techniques creativite */}
          {activeSubSection === "techniques" && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Techniques de creativite
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "scamper", label: "SCAMPER", icon: Lightbulb, steps: 7,
                      color: "bg-amber-100 text-amber-700 border-amber-300" },
                    { id: "5pourquoi", label: "5 Pourquoi", icon: Search, steps: 5,
                      color: "bg-orange-100 text-orange-700 border-orange-300" },
                    { id: "6chapeaux", label: "6 Chapeaux", icon: Crown, steps: 6,
                      color: "bg-violet-100 text-violet-700 border-violet-300" },
                    { id: "analogie", label: "Analogie", icon: ArrowLeftRight, steps: 1,
                      color: "bg-blue-100 text-blue-700 border-blue-300" },
                    { id: "inversion", label: "Inversion", icon: RotateCcw, steps: 1,
                      color: "bg-rose-100 text-rose-700 border-rose-300" },
                    { id: "biomimetisme", label: "Biomimetisme", icon: Leaf, steps: 1,
                      color: "bg-green-100 text-green-700 border-green-300" },
                    { id: "challenge", label: "Challenge", icon: Shield, steps: 1,
                      color: "bg-red-100 text-red-700 border-red-300" },
                  ].map(t => (
                    <button key={t.id}
                      onClick={() => startTechnique(t.id, t.label, t.steps)}
                      className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors hover:shadow-sm", t.color)}>
                      <t.icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.label}</span>
                      {t.steps > 1 && <span className="ml-auto text-[9px] opacity-60">{t.steps} etapes</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-step progression */}
              {activeTechnique && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-xs font-medium text-amber-800">
                    {activeTechnique.label} — Etape {techniqueStep + 1}/{activeTechnique.totalSteps}
                  </span>
                  <div className="flex-1" />
                  <button onClick={handleNextTechStep}
                    className="text-xs font-medium px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer">
                    Etape suivante →
                  </button>
                </div>
              )}

              {/* Blocs techniques captures */}
              <div className="space-y-2">
                {filteredBlocksBySubSection.map(b => (
                  <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
                    <BlockRenderer block={b} onAction={handleBlockAction} animated={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* W.1b: SUB-SECTION CONTENT — deep search via Gemini grounding */}
          {activeSubSection === "deep-search" && (
            <DeepSearchPanel
              activeBotCode={activeBotCode}
              currentCredoLetter={currentCredoLetter}
              addWorkspaceBlock={addWorkspaceBlock}
              filteredBlocks={filteredBlocksBySubSection}
              onBlockAction={handleBlockAction}
              pulsingBlockId={pulsingBlockId}
            />
          )}

          {/* W.1: SUB-SECTION CONTENT — experts panel */}
          {activeSubSection === "experts" && (
            <SuggestedExpertsPanel
              messages={messages}
              activeBotCode={activeBotCode}
              workspaceBlocks={workspaceBlocks}
              addWorkspaceBlock={addWorkspaceBlock}
              currentCredoLetter={currentCredoLetter}
              activePhase={activePhase}
              filteredBlocks={filteredBlocksBySubSection}
              onBlockAction={handleBlockAction}
              pulsingBlockId={pulsingBlockId}
            />
          )}

          {/* TECHNIQUE PANEL — sous-section ouverte depuis le sidebar (legacy) */}
          {selectedTechnique && !activeSubSection && (
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

          {/* REFLEXION HUB — visible quand sub-section null + etape Rechercher */}
          {activeStepId.includes("rechercher") && !selectedTechnique && !activeSubSection && (
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

          {/* DYNAMIC STEP CONTENT — filtre par sous-section active, sinon tous les blocs */}
          {!activeSubSection || !["modes-reflexion", "techniques", "deep-search", "experts"].includes(activeSubSection) ? (
            <DynamicStepContent
              allBlocks={activeSubSection ? filteredBlocksBySubSection : workspaceBlocks}
              context={displayContext}
              onBlockAction={handleBlockAction}
              pulsingBlockId={pulsingBlockId}
              activeBotCode={activeBotCode}
            />
          ) : null}
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

// ═══ W.1b: DeepSearchPanel — recherche approfondie via Gemini grounding ═══

function DeepSearchPanel({ activeBotCode, currentCredoLetter, addWorkspaceBlock, filteredBlocks, onBlockAction, pulsingBlockId }: {
  activeBotCode: string;
  currentCredoLetter: string;
  addWorkspaceBlock: (block: import("../core/types").WorkspaceBlock) => void;
  filteredBlocks: import("../core/types").WorkspaceBlock[];
  onBlockAction: (action: string, blockId: string) => void;
  pulsingBlockId: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchThinkingStep, setSearchThinkingStep] = useState(0);

  useEffect(() => {
    if (!searchLoading) { setSearchThinkingStep(0); return; }
    const timer = setInterval(() => {
      setSearchThinkingStep(prev => prev < 2 ? prev + 1 : prev);
    }, 1500);
    return () => clearInterval(timer);
  }, [searchLoading]);

  const SEARCH_STEPS = ["Recherche de sources...", "Verification de fiabilite...", "Scoring des resultats..."];

  const handleDeepSearch = async () => {
    if (!searchQuery.trim() || searchLoading) return;
    setSearchLoading(true);
    try {
      const res = await api.deepSearch({ query: searchQuery, user_id: 1 });
      // Normalize Gemini grounding chunks into DeepSearchRenderer format
      const sources = (res.chunks || []).map((c: any, i: number) => ({
        title: c.title || `Source ${i + 1}`,
        detail: c.text || "",
        url: c.url || "",
        score: 70 + Math.round(Math.random() * 20), // Gemini ne donne pas de score, approximation
        type: "web",
      }));
      addWorkspaceBlock({
        id: `search-${Date.now()}`,
        type: "deep_search",
        title: `Recherche: ${searchQuery}`,
        summary: res.summary,
        structured_data: { sources, status: "complete", conclusion: res.summary.substring(0, 200) },
        credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
        confidence: 0.8,
        source: activeBotCode,
        sourceType: "chat",
        timestamp: Date.now(),
      });
      setSearchQuery("");
    } catch (err) {
      console.error("[DeepSearch] Error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-2">
          Deep Search
        </h4>
        <p className="text-[10px] text-gray-500 mb-3">Recherche approfondie via IA — resultats dans le workspace</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleDeepSearch(); }}
            placeholder="Rechercher..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
            disabled={searchLoading}
          />
          <button
            onClick={handleDeepSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className={cn("px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors",
              searchLoading ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700")}
          >
            {searchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Chercher
          </button>
        </div>
      </div>

      {/* Loading animation */}
      {searchLoading && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 p-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-blue-700">Recherche en cours...</p>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {SEARCH_STEPS.map((step, j) => (
                  <span key={j} className={cn(
                    "text-[9px] flex items-center gap-1 transition-all",
                    j < searchThinkingStep ? "text-emerald-600 line-through opacity-60" :
                    j === searchThinkingStep ? "text-blue-700 font-bold" :
                    "text-gray-400"
                  )}>
                    {j < searchThinkingStep && <CheckCircle2 className="h-2.5 w-2.5" />}
                    {j === searchThinkingStep && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blocs deep search */}
      <div className="space-y-2">
        {filteredBlocks.map(b => (
          <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
            <BlockRenderer block={b} onAction={onBlockAction} animated={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ W.1: buildExpertContext — resume des blocs experts pour injection scaffold ═══

const MAX_EXPERT_CTX = 1500;

export function buildExpertContext(blocks: import("../core/types").WorkspaceBlock[], primaryBot: string): string | undefined {
  const expertBlocks = blocks.filter(b => b.source && b.source !== primaryBot);
  if (expertBlocks.length === 0) return undefined;

  let result = "[PERSPECTIVES EXPERTS WORKSPACE]\n";
  for (const b of expertBlocks) {
    const botName = BOT_NAME[b.source || ""] || b.source || "Expert";
    const line = `- **${botName}** (${b.type}): ${(b.summary || "").substring(0, 250)}\n`;
    if (result.length + line.length > MAX_EXPERT_CTX) break;
    result += line;
  }
  return result + "[/PERSPECTIVES]";
}

// ═══ W.1: SuggestedExpertsPanel — panel experts dans la sous-section "Experts" ═══

function SuggestedExpertsPanel({ messages, activeBotCode, workspaceBlocks, addWorkspaceBlock, currentCredoLetter, activePhase, filteredBlocks, onBlockAction, pulsingBlockId }: {
  messages: any[];
  activeBotCode: string;
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  addWorkspaceBlock: (block: import("../core/types").WorkspaceBlock) => void;
  currentCredoLetter: string;
  activePhase: string;
  filteredBlocks: import("../core/types").WorkspaceBlock[];
  onBlockAction: (action: string, blockId: string) => void;
  pulsingBlockId: string | null;
}) {
  const [expertLoadingBots, setExpertLoadingBots] = useState<Set<string>>(new Set());
  const [expertError, setExpertError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Extract latest team_proposal from messages
  const latestTeamProposal = (() => {
    const tp = messages.filter((m: any) => (m.msgType as string) === "team_proposal" && m.teamProposal);
    return tp.length > 0 ? (tp[tp.length - 1] as any).teamProposal : null;
  })();

  // Which bots are already in workspace
  const activeBotSources = new Set(workspaceBlocks.map(b => b.source).filter(Boolean));

  const handleAddExpert = useCallback(async (botCode: string) => {
    if (expertLoadingBots.has(botCode)) return;
    setExpertLoadingBots(prev => new Set([...prev, botCode]));
    setExpertError(null);
    try {
      const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";
      const lastBotMsg = messages.filter((m: any) => m.role === "assistant" && m.content).pop()?.content || "";
      const context = `Question: ${lastUserMsg}\n\nAnalyse en cours: ${lastBotMsg.substring(0, 500)}`;

      const res = await api.chatMulti({
        message: context,
        user_id: 1,
        agents: [botCode],
        primary_agent: botCode,
        workspace_phase: activePhase,
      });

      const persp = res.perspectives?.[0];
      if (!persp) return;

      // A2: dedup — remplacer le bloc existant si meme source
      const existingBlock = workspaceBlocks.find(b => b.source === botCode);

      const blockType = detectBlockTypeFrontend(persp.contenu);
      addWorkspaceBlock({
        id: `expert-${botCode}-${Date.now()}`,
        type: blockType,
        title: `${BOT_NAME[botCode] || botCode} — Perspective`,
        summary: persp.contenu,
        structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
        credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
        confidence: 0.7,
        source: botCode,
        sourceType: "chat",
        timestamp: Date.now(),
        replace_block_id: existingBlock?.id,
      });
    } catch (err) {
      console.error("[Expert] Error:", err);
      setExpertError(`${BOT_NAME[botCode] || botCode} n'a pas pu contribuer`);
      setTimeout(() => setExpertError(null), 5000);
    } finally {
      setExpertLoadingBots(prev => { const s = new Set(prev); s.delete(botCode); return s; });
    }
  }, [messages, activeBotCode, activePhase, addWorkspaceBlock, currentCredoLetter, workspaceBlocks, expertLoadingBots]);

  // Bot accent border colors
  const BOT_ACCENT: Record<string, string> = {
    CEOB: "border-l-sky-400", CTOB: "border-l-violet-400", CFOB: "border-l-emerald-400",
    CMOB: "border-l-pink-400", CSOB: "border-l-amber-400", COOB: "border-l-blue-400",
    CPOB: "border-l-orange-400", CHROB: "border-l-rose-400", CINOB: "border-l-teal-400",
    CROB: "border-l-lime-400", CLOB: "border-l-fuchsia-400", CISOB: "border-l-cyan-400",
  };

  // Suggested bots from team_proposal (filter out primary bot)
  const suggestedBots = latestTeamProposal?.bots?.filter((b: any) => b.code !== activeBotCode) || [];

  return (
    <div className="mt-3 space-y-3">
      {/* Experts suggeres */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
          Experts suggeres
        </h4>

        {suggestedBots.length > 0 ? (
          <div className="space-y-2">
            {suggestedBots.map((bot: any) => {
              const isLoading = expertLoadingBots.has(bot.code);
              const isDone = activeBotSources.has(bot.code);
              return (
                <div key={bot.code} className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg border bg-white border-l-[3px]",
                  BOT_ACCENT[bot.code] || "border-l-gray-400",
                )}>
                  <BotAvatar code={bot.code} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-900">{BOT_NAME[bot.code] || bot.code}</span>
                      <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                        bot.role_tag === "ANGLE MORT" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {bot.role_tag}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-2">{bot.raison}</p>
                  </div>
                  <button
                    onClick={() => handleAddExpert(bot.code)}
                    disabled={isLoading}
                    className={cn(
                      "shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                      isDone ? "bg-emerald-100 text-emerald-700" :
                      isLoading ? "bg-gray-100 text-gray-400" :
                      "bg-violet-100 text-violet-700 hover:bg-violet-200"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isDone ? (
                      <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Actif</span>
                    ) : (
                      "+ Consulter"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-gray-500">
            Les experts du GhostX Team seront suggeres au fil de la conversation.
          </p>
        )}

        {/* Error banner */}
        {expertError && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-700 font-medium">
            {expertError}
          </div>
        )}
      </div>

      {/* Active expert bots summary */}
      {filteredBlocks.length > 0 && (
        <div className="space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Contributions ({filteredBlocks.length})
          </span>
          <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            {filteredBlocks.map(b => (
              <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
                <BlockRenderer block={b} onAction={onBlockAction} animated={false} />
              </div>
            ))}
          </div>
        </div>
      )}
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
