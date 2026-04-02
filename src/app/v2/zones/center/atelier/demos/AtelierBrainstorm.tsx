"use client";

/**
 * AtelierBrainstorm.tsx — Mode Brainstorm SELF-CONTAINED (pattern SimPhaseReflexion)
 * Full split-screen: TopBar 6 sections, sub-tabs, breadcrumb, phase indicator
 * GAUCHE: Chat riche avec 4 bots, SCAMPER challenge, inline actions
 * DROITE: Document brainstorm qui se batit progressivement (5 sections DocForge)
 * Data: BRAINSTORM_DATA (brainstorm-data.ts)
 * Sprint B — Atelier Simulations
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Target,
  Download,
  Layers,
  Star,
  Rocket,
  Mic,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { BRAINSTORM_DATA } from "../../scenarios/brainstorm-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Phase = "reflexion" | "atelier" | "command";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

type Stage =
  | "intro"
  | "thinking"
  | "vague1"
  | "vague2"
  | "clusters-thinking"
  | "clusters"
  | "debate"
  | "synthese-thinking"
  | "synthese"
  | "conclusion";

const STAGE_ORDER: Stage[] = [
  "intro", "thinking", "vague1", "vague2", "clusters-thinking",
  "clusters", "debate", "synthese-thinking", "synthese", "conclusion",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter",
  thinking: "Preparation...",
  vague1: "Vague 1 — Brutes",
  vague2: "Vague 2 — SCAMPER",
  "clusters-thinking": "Clustering...",
  clusters: "Clusters",
  debate: "Debat CMO vs CRO",
  "synthese-thinking": "Synthese...",
  synthese: "Plan d'action",
  conclusion: "Conclusion",
};

// ═══════════════════════════════════════
// CHALLENGE DATA
// ═══════════════════════════════════════

const SCAMPER_CHALLENGE =
  "L'idee #11 (remplacer les meetings vendeur par CarlOS + video auto) est ambitieuse mais risquee. 78% des acheteurs B2B veulent parler a un humain avant d'acheter > 10K$. Le bot peut qualifier, mais le closing doit rester humain. Je recommande un modele hybride : CarlOS qualifie + propose un creneau vendeur en 1 clic.";

const CLUSTER_DEBATE = {
  cmo: "Le cluster Referral est sous-estime. Avec un taux de referral de 50% (un client sur deux refere), c'est +60 clients en 6 mois avec zero cout d'acquisition. Le referral est 4x plus efficace que le marketing classique en B2B.",
  cro: "Mathilde a raison sur le potentiel, mais le 50% est optimiste. Le benchmark B2B est 15-25%. Avec un incentif de 10% recurring, on peut monter a 35%. Je recommande un objectif conservateur de +40 clients via referral, pas +60.",
  consensus: "Referral realiste : +40 clients (35% taux de referral avec incentif 10% recurring). Combiner avec automation pour maximiser le volume total.",
};

const CONTRE_ARGUMENT =
  "Le plan repose sur 3 leviers simultanes — c'est ambitieux pour une equipe de 3 vendeurs + 35 employes. Le risque : on lance tout en meme temps, rien n'est execute correctement, et on dilue les efforts. Alternative : Phase 1 (T1-T2) = automation CarlOS seule. Phase 2 (T2-T3) = ajouter referral. Phase 3 (T3-T4) = inbound. Un levier a la fois, bien fait.";

// ═══════════════════════════════════════
// DOC SECTION CARD (right panel)
// ═══════════════════════════════════════

function DocSectionCard({ num, title, filled, children }: {
  num: number; title: string; filled: boolean; children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(filled);
  return (
    <div className={cn("border rounded-xl overflow-hidden transition-all", filled ? "border-green-200 bg-white shadow-sm" : "border-dashed border-gray-300 bg-gray-50/50 opacity-60")}>
      <button onClick={() => filled && setExpanded(!expanded)} className={cn("w-full px-4 py-2.5 flex items-center gap-2.5 text-left", filled ? "cursor-pointer hover:bg-gray-50" : "cursor-default")}>
        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", filled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-400")}>{num}</span>
        {filled ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
        <span className={cn("text-sm font-semibold flex-1", filled ? "text-gray-800" : "text-gray-400")}>{title}</span>
        {filled && <ArrowRight className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expanded && "rotate-90")} />}
      </button>
      {filled && expanded && children && <div className="px-4 pb-3 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AtelierBrainstorm({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
  const [showScamperChallenge, setShowScamperChallenge] = useState(false);
  const [showClusterDebat, setShowClusterDebat] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [vague1Filled, setVague1Filled] = useState(false);
  const [vague2Filled, setVague2Filled] = useState(false);
  const [clustersFilled, setClustersFilled] = useState(false);
  const [planFilled, setPlanFilled] = useState(false);
  const [conclusionFilled, setConclusionFilled] = useState(false);
  const [extractedNotes, setExtractedNotes] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showScamperChallenge, showClusterDebat, showContreArgument, showSentinel]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const handleChallenge = (action: () => void) => {
    const c = challengeCount + 1; setChallengeCount(c); action();
    if (c >= 3 && !showSentinel) setTimeout(() => setShowSentinel(true), 1500);
  };

  const handleExtract = (key: string) => {
    if (!extractedNotes.includes(key)) setExtractedNotes((p) => [...p, key]);
  };

  const handleReset = () => {
    setStage("intro"); setTyped(false);
    setShowScamperChallenge(false); setShowClusterDebat(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setVague1Filled(false); setVague2Filled(false); setClustersFilled(false);
    setPlanFilled(false); setConclusionFilled(false); setExtractedNotes([]);
  };

  const filledCount = [vague1Filled, vague2Filled, clustersFilled, planFilled, conclusionFilled].filter(Boolean).length;

  // Dynamic context
  const currentPhase: Phase | null = si >= STAGE_ORDER.indexOf("intro") ? "reflexion" : null;
  const showPhaseBar = true;

  const discussionContext =
    si <= STAGE_ORDER.indexOf("intro") ? "CarlOS — Brainstorm" :
    si <= STAGE_ORDER.indexOf("vague2") ? "Brainstorm — Idees" :
    si <= STAGE_ORDER.indexOf("clusters") ? "Brainstorm — Clusters" :
    si <= STAGE_ORDER.indexOf("debate") ? "Brainstorm — Debat" :
    "Brainstorm — Plan d'action";

  const activeNav = "dept";
  const activeSubTab = -1; // Brainstorm mode = no sub-tab active

  // Active bots change by stage
  const activeBots =
    si <= STAGE_ORDER.indexOf("thinking") ? [{ code: "CEOB" }] :
    si <= STAGE_ORDER.indexOf("vague1") ? [{ code: "CMOB" }, { code: "CROB" }, { code: "CTOB" }, { code: "COOB" }] :
    si <= STAGE_ORDER.indexOf("clusters") ? [{ code: "CMOB" }, { code: "CROB" }, { code: "CTOB" }, { code: "COOB" }] :
    si <= STAGE_ORDER.indexOf("debate") ? [{ code: "CMOB" }, { code: "CROB" }] :
    [{ code: "CMOB" }, { code: "CROB" }, { code: "CTOB" }, { code: "COOB" }];

  const breadcrumb: string[] =
    si <= STAGE_ORDER.indexOf("intro") ? ["Direction", "Brainstorm"] :
    si <= STAGE_ORDER.indexOf("vague2") ? ["Direction", "Brainstorm", "Generation d'idees"] :
    si <= STAGE_ORDER.indexOf("debate") ? ["Direction", "Brainstorm", "Clustering & Debat"] :
    ["Direction", "Brainstorm", "Plan d'action"];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* User tension */}
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
          <p className="text-sm">{BRAINSTORM_DATA.userTension}</p>
        </div>
      </div>

      {/* Stage: intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text={BRAINSTORM_DATA.ceoIntro}
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("thinking")} icon={Send} label="Lancer le brainstorm" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">CarlOS — Introduction brainstorm, 4 bots mobilises</p>}
        </SBubble>
      )}

      {/* Stage: thinking — auto-advance animation */}
      {stage === "thinking" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-amber-600 font-medium">Preparation du brainstorm...</span>
          </div>
          <div className="space-y-1">
            {BRAINSTORM_DATA.setupThinking.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                  <StepIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>{step.text}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-auto" />
                </div>
              );
            })}
          </div>
          <AutoAdvance onComplete={() => goNext("vague1")} delay={2500} />
        </div>
      )}

      {/* ═══ VAGUE 1 ═══ */}
      {si >= STAGE_ORDER.indexOf("vague1") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("vague1")}>
          {si === STAGE_ORDER.indexOf("vague1") ? (
            <>
              <p className="text-sm text-gray-700 mb-2">{BRAINSTORM_DATA.vague1.label} — 8 idees brutes, zero filtre :</p>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {BRAINSTORM_DATA.vague1.notes.map((note) => {
                  const bot = BOT_COLORS[note.bot];
                  return (
                    <div key={note.id} className={cn("rounded-lg p-2 border text-xs", note.color)}>
                      <p className="text-gray-700 leading-tight">{note.text}</p>
                      <p className="text-[9px] text-gray-500 mt-1">{bot?.name || note.bot}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-pink-100 flex flex-wrap gap-2">
                <button onClick={() => { setVague1Filled(true); handleExtract("vague1"); if (si === STAGE_ORDER.indexOf("vague1")) goNext("vague2"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire au document
                </button>
                {si === STAGE_ORDER.indexOf("vague1") && (
                  <button onClick={() => goNext("vague2")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> SCAMPER Challenge
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Vague 1 — 8 idees brutes generees</p>}
        </SBubble>
      )}

      {/* ═══ VAGUE 2 — SCAMPER ═══ */}
      {si >= STAGE_ORDER.indexOf("vague2") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("vague2")}>
          {si === STAGE_ORDER.indexOf("vague2") ? (
            <>
              <p className="text-sm text-gray-700 mb-1">{BRAINSTORM_DATA.vague2.label}</p>
              <p className="text-[9px] text-gray-500 mb-2">{BRAINSTORM_DATA.vague2.technique}</p>
              <div className="space-y-1.5 mb-2">
                {BRAINSTORM_DATA.vague2.notes.map((note) => {
                  const bot = BOT_COLORS[note.bot];
                  return (
                    <div key={note.id} className={cn("rounded-lg p-2 border text-xs", note.color)}>
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[9px] text-gray-500">{bot?.name || note.bot}</p>
                        {note.votes && (
                          <span className="flex items-center gap-0.5 text-[9px] text-amber-600">
                            <Star className="h-3.5 w-3.5" /> {note.votes}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 leading-tight">{note.text}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap gap-2">
                {!showScamperChallenge && (
                  <button onClick={() => handleChallenge(() => setShowScamperChallenge(true))} className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-200 font-medium cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger l'idee #11
                  </button>
                )}
                <button onClick={() => { setVague2Filled(true); handleExtract("vague2"); if (si === STAGE_ORDER.indexOf("vague2")) goNext("clusters-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire au document
                </button>
                {si === STAGE_ORDER.indexOf("vague2") && (
                  <button onClick={() => goNext("clusters-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <Layers className="h-3.5 w-3.5" /> Clusteriser
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">SCAMPER — 5 idees combinees + challenges</p>}
        </SBubble>
      )}

      {/* SCAMPER Challenge response */}
      {showScamperChallenge && (
        <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("vague2")}>
          {si <= STAGE_ORDER.indexOf("vague2") ? (
            <p className="text-sm text-gray-700">{SCAMPER_CHALLENGE}</p>
          ) : <p className="text-[9px] text-gray-400 italic">Frank — Challenge modele hybride recommande</p>}
        </SBubble>
      )}

      {/* Clusters thinking animation */}
      {stage === "clusters-thinking" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-amber-600 font-medium">Clustering des 13 idees...</span>
          </div>
          <div className="space-y-1">
            {BRAINSTORM_DATA.syntheseThinking.slice(0, 2).map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                  <StepIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>{step.text}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-auto" />
                </div>
              );
            })}
          </div>
          <AutoAdvance onComplete={() => goNext("clusters")} delay={2000} />
        </div>
      )}

      {/* ═══ CLUSTERS ═══ */}
      {si >= STAGE_ORDER.indexOf("clusters") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("clusters")}>
          {si === STAGE_ORDER.indexOf("clusters") ? (
            <>
              <p className="text-sm text-gray-700 mb-2">5 clusters identifies :</p>
              {BRAINSTORM_DATA.clusters.map((cluster) => {
                const Ic = cluster.icon;
                return (
                  <div key={cluster.id} className={cn("mb-2 p-2 rounded-lg border", cluster.bg, cluster.border)}>
                    <div className="flex items-center gap-2 mb-1">
                      <Ic className={cn("h-3.5 w-3.5", cluster.color)} />
                      <span className={cn("text-xs font-bold", cluster.color)}>{cluster.label}</span>
                      <span className="text-[9px] text-gray-400 ml-auto">{cluster.noteIds.length} idees</span>
                    </div>
                    <p className="text-[9px] text-gray-600">{cluster.potential}</p>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-t border-amber-100 flex flex-wrap gap-2">
                {!showClusterDebat && (
                  <button onClick={() => handleChallenge(() => { setShowClusterDebat(true); })} className="text-[9px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 font-medium cursor-pointer">
                    <MessageSquare className="h-3.5 w-3.5" /> Debat CMO vs CRO
                  </button>
                )}
                <button onClick={() => { setClustersFilled(true); handleExtract("clusters"); if (si === STAGE_ORDER.indexOf("clusters")) goNext("synthese-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire au document
                </button>
                {si === STAGE_ORDER.indexOf("clusters") && (
                  <button onClick={() => goNext("synthese-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <Target className="h-3.5 w-3.5" /> Synthetiser
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">5 clusters — Referral, Automation, Contenu, Restructuration, Pricing</p>}
        </SBubble>
      )}

      {/* Cluster debate: CMO vs CRO */}
      {showClusterDebat && (
        <>
          <SBubble code="CMOB" collapsed={si > STAGE_ORDER.indexOf("debate")}>
            {si <= STAGE_ORDER.indexOf("debate") ? (
              <p className="text-sm text-gray-700">{CLUSTER_DEBATE.cmo}</p>
            ) : <p className="text-[9px] text-gray-400 italic">Mathilde — Referral sous-estime, +60 clients potentiels</p>}
          </SBubble>
          <SBubble code="CROB" collapsed={si > STAGE_ORDER.indexOf("debate")}>
            {si <= STAGE_ORDER.indexOf("debate") ? (
              <p className="text-sm text-gray-700">{CLUSTER_DEBATE.cro}</p>
            ) : <p className="text-[9px] text-gray-400 italic">Rich — Objectif conservateur +40 clients</p>}
          </SBubble>
          <div className="mx-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-[9px] font-bold text-purple-700 mb-0.5">CONSENSUS</p>
            <p className="text-xs text-purple-800">{CLUSTER_DEBATE.consensus}</p>
          </div>
        </>
      )}

      {/* Sentinel anti-boucle */}
      {showSentinel && (
        <div className="mx-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-amber-700 uppercase">Sentinelle anti-boucle</p>
              <p className="text-xs text-amber-800">3 challenges effectues. Avancer vers le plan?</p>
            </div>
          </div>
        </div>
      )}

      {/* Synthese thinking animation */}
      {stage === "synthese-thinking" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-amber-600 font-medium">Synthese en cours...</span>
          </div>
          <div className="space-y-1">
            {BRAINSTORM_DATA.syntheseThinking.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                  <StepIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>{step.text}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-auto" />
                </div>
              );
            })}
          </div>
          <AutoAdvance onComplete={() => goNext("synthese")} delay={2500} />
        </div>
      )}

      {/* ═══ SYNTHESE ═══ */}
      {si >= STAGE_ORDER.indexOf("synthese") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("synthese")}>
          {si === STAGE_ORDER.indexOf("synthese") ? (
            <>
              <p className="text-sm text-gray-700 mb-2 font-medium">{BRAINSTORM_DATA.synthese.titre}</p>
              <p className="text-xs text-gray-700 mb-3">{BRAINSTORM_DATA.synthese.strategie}</p>
              <div className="space-y-1.5 mb-2">
                {BRAINSTORM_DATA.synthese.projection.map((p) => (
                  <div key={p.trimestre} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{p.trimestre}</span>
                      <span className="text-xs font-bold text-green-600">{p.clients}</span>
                      <span className="text-[9px] text-gray-400 ml-auto">Total: {p.total}</span>
                    </div>
                    <p className="text-[9px] text-gray-600">{p.source}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 mb-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Star className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-[9px] font-bold text-amber-700">IDEE PHARE</span>
                </div>
                <p className="text-xs text-amber-800">{BRAINSTORM_DATA.synthese.ideePhare}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap gap-2">
                {!showContreArgument && (
                  <button onClick={() => handleChallenge(() => setShowContreArgument(true))} className="text-[9px] bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-200 font-medium cursor-pointer">
                    <Eye className="h-3.5 w-3.5" /> Contre-argument
                  </button>
                )}
                <button onClick={() => { setPlanFilled(true); handleExtract("plan"); if (si === STAGE_ORDER.indexOf("synthese")) goNext("conclusion"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire au document
                </button>
                {si === STAGE_ORDER.indexOf("synthese") && (
                  <button onClick={() => goNext("conclusion")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Conclure
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Plan d'action — 250 clients en 12 mois, 75K$ budget</p>}
        </SBubble>
      )}

      {/* Contre-argument COO */}
      {showContreArgument && (
        <SBubble code="COOB" collapsed={si > STAGE_ORDER.indexOf("synthese")}>
          {si <= STAGE_ORDER.indexOf("synthese") ? (
            <p className="text-sm text-gray-700">{CONTRE_ARGUMENT}</p>
          ) : <p className="text-[9px] text-gray-400 italic">Olivier — Alternative 1 levier a la fois</p>}
        </SBubble>
      )}

      {/* ═══ CONCLUSION ═══ */}
      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText
            text="Le brainstorm a genere 13 idees, regroupees en 5 clusters. Le plan integre 3 leviers combines : automation CarlOS + referral 10% + restructuration des comptes. Projection : 120 a 250 clients en 12 mois. Budget total : 75K$. L'idee phare (#11) transforme les vendeurs en strateges — le bot gere le haut du funnel."
            speed={10} className="text-sm text-gray-700"
            onComplete={() => { setTyped(true); setConclusionFilled(true); }}
          />
          {typed && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button onClick={() => handleExtract("conclusion")} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Finaliser le document
              </button>
            </div>
          )}
        </SBubble>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT (same frame as SimPhaseReflexion)
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-bold text-gray-800">Mode Brainstorm</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-amber-500" : i < si ? "w-2 bg-amber-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className={cn("h-1 shrink-0", currentPhase ? PHASE_COLORS[currentPhase].dot : "bg-amber-500")} />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header — avatar LEFT, name CENTER, MessageSquare RIGHT */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar + bot avatars */}
          {showPhaseBar && (
            <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2",
              currentPhase ? cn(PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border) : "bg-gray-50 border-gray-200"
            )}>
              {/* Active bot team avatars */}
              <div className="flex items-center gap-1.5">
                {activeBots.map(b => (
                  <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                    <BotAvatar code={b.code} size="sm" />
                    <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b.code]?.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                ))}
              </div>
              {/* Phase badges */}
              <div className="flex gap-1 ml-auto">
                {(["reflexion", "atelier", "command"] as Phase[]).map(p => (
                  <span key={p} className={cn(
                    "px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-1 transition-all",
                    currentPhase === p ? PHASE_COLORS[p].badge : "bg-gray-100 text-gray-400"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full transition-all", currentPhase === p ? PHASE_COLORS[p].dot : "bg-gray-300")} />
                    {PHASE_COLORS[p].label}
                    {p === "command" && <Lock className="h-2.5 w-2.5 ml-0.5 opacity-50" />}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>

          {/* Message input */}
          <div className="shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-400">Ecrivez un message...</div>
            <button className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"><Mic className="h-4 w-4" /></button>
            <button className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"><Send className="h-4 w-4" /></button>
          </div>
        </div>

        {/* RIGHT — Content (60%) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar — 6 sections */}
          <div className="h-12 px-2 shrink-0 flex items-center" style={{ backgroundColor: UB_BLUE }}>
            <div className="flex-1 flex items-center gap-0.5">
              {[
                { id: "home", icon: Home, label: "Accueil" },
                { id: "dept", icon: Building2, label: "Mon Departement" },
                { id: "salles", icon: Users, label: "Mes Salles" },
                { id: "equipe", icon: Brain, label: "Mon Equipe" },
                { id: "reseau", icon: Globe, label: "Mon Reseau" },
                { id: "admin", icon: Shield, label: "Admin" },
              ].map(nav => (
                <button key={nav.id} className={cn(
                  "h-8 gap-1 px-2 text-[11px] rounded-md flex items-center transition-all",
                  activeNav === nav.id ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs Mon Departement */}
          {activeNav === "dept" && activeSubTab >= 0 && (
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
              {DEPT_SUBTABS.map((tab, i) => (
                <button key={tab} className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                  i === activeSubTab ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 flex items-center gap-1.5">
              {breadcrumb.map((c, i, arr) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                  <span className={cn("text-[11px]", i === arr.length - 1 ? "text-gray-800 font-medium" : "text-gray-400 hover:text-gray-600 cursor-pointer")}>{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Right panel content */}
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            <RightContent
              stage={stage}
              filledCount={filledCount}
              vague1Filled={vague1Filled}
              vague2Filled={vague2Filled}
              clustersFilled={clustersFilled}
              planFilled={planFilled}
              conclusionFilled={conclusionFilled}
              extractedNotes={extractedNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT
// ═══════════════════════════════════════

interface RightContentProps {
  stage: Stage;
  filledCount: number;
  vague1Filled: boolean;
  vague2Filled: boolean;
  clustersFilled: boolean;
  planFilled: boolean;
  conclusionFilled: boolean;
  extractedNotes: string[];
}

function RightContent({ stage, filledCount, vague1Filled, vague2Filled, clustersFilled, planFilled, conclusionFilled, extractedNotes }: RightContentProps) {
  const si = STAGE_ORDER.indexOf(stage);

  // Before brainstorm starts, show context
  if (si <= STAGE_ORDER.indexOf("thinking")) {
    return <ContentBrainstormContext />;
  }

  // During brainstorm, show the DocForge document
  return (
    <ContentDocForge
      filledCount={filledCount}
      vague1Filled={vague1Filled}
      vague2Filled={vague2Filled}
      clustersFilled={clustersFilled}
      planFilled={planFilled}
      conclusionFilled={conclusionFilled}
      extractedNotes={extractedNotes}
    />
  );
}

// ═══════════════════════════════════════
// CONTENT: BRAINSTORM CONTEXT (intro/thinking)
// ═══════════════════════════════════════

function ContentBrainstormContext() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-sm font-bold text-gray-800">Mode Brainstorm</p>
          <p className="text-[9px] text-gray-500">{BRAINSTORM_DATA.titre}</p>
        </div>
        <span className="ml-auto text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Analyser</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-red-600" />
          <p className="text-xs font-bold text-gray-800">Contexte du defi</p>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{BRAINSTORM_DATA.contexte}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Employes", value: "35", sub: "Equipe actuelle", borderColor: "border-blue-200", bgColor: "bg-blue-50", textColor: "text-blue-700" },
            { label: "Vendeurs", value: "3", sub: "40 clients chacun", borderColor: "border-amber-200", bgColor: "bg-amber-50", textColor: "text-amber-700" },
            { label: "CA actuel", value: "4.2M$", sub: "120 clients", borderColor: "border-emerald-200", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
            { label: "Objectif", value: "240", sub: "Clients en 12 mois", borderColor: "border-violet-200", bgColor: "bg-violet-50", textColor: "text-violet-700" },
          ].map(kpi => (
            <div key={kpi.label} className={cn("rounded-xl border shadow-sm", kpi.borderColor)}>
              <div className={cn("flex items-center gap-2 px-3 py-2 rounded-t-xl", kpi.bgColor)}>
                <span className={cn("text-xs font-bold", kpi.textColor)}>{kpi.label}</span>
              </div>
              <div className="px-3 py-2 bg-white rounded-b-xl">
                <p className={cn("text-xl font-extrabold", kpi.textColor)}>{kpi.value}</p>
                <p className="text-[9px] text-gray-500">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-800 mb-2">Equipe mobilisee</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { code: "CMOB", name: "Mathilde", role: "CMO — Marketing", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
            { code: "CROB", name: "Rich", role: "CRO — Revenus", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
            { code: "CTOB", name: "Tim", role: "CTO — Technologie", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
            { code: "COOB", name: "Olivier", role: "COO — Operations", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
          ].map(bot => (
            <div key={bot.code} className={cn("rounded-xl overflow-hidden shadow-sm border", bot.border, bot.bg)}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <BotAvatar code={bot.code} size="sm" />
                <div>
                  <p className={cn("text-xs font-bold", bot.text)}>{bot.name}</p>
                  <p className="text-[9px] text-gray-500">{bot.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-800 mb-2">Methode utilisee</p>
        <p className="text-[9px] text-gray-600 leading-relaxed">{BRAINSTORM_DATA.scamperLabel}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Vague 1 — Brutes", "SCAMPER", "Clustering", "Synthese", "Plan d'action"].map((step, i) => (
            <span key={i} className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// CONTENT: DOCFORGE DOCUMENT (main brainstorm)
// ═══════════════════════════════════════

function ContentDocForge({
  filledCount, vague1Filled, vague2Filled, clustersFilled, planFilled, conclusionFilled, extractedNotes,
}: {
  filledCount: number;
  vague1Filled: boolean;
  vague2Filled: boolean;
  clustersFilled: boolean;
  planFilled: boolean;
  conclusionFilled: boolean;
  extractedNotes: string[];
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      {/* DocForge header */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h2 className="text-sm font-bold text-gray-800">Plan Brainstorm</h2>
          <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">{filledCount}/5 sections</span>
        </div>
        <p className="text-xs text-gray-500">{BRAINSTORM_DATA.titre}</p>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
        </div>
      </div>

      {/* Section 1: Vague 1 */}
      <DocSectionCard num={1} title="Vague 1 — Idees brutes" filled={vague1Filled}>
        <div className="pt-3 grid grid-cols-2 gap-1.5">
          {BRAINSTORM_DATA.vague1.notes.map((note) => (
            <div key={note.id} className={cn("rounded p-1.5 border text-[9px]", note.color)}>
              <p className="text-gray-700 leading-tight">{note.text}</p>
              <p className="text-gray-400 mt-0.5">{BOT_COLORS[note.bot]?.name || note.bot}</p>
            </div>
          ))}
        </div>
      </DocSectionCard>

      {/* Section 2: Vague 2 SCAMPER */}
      <DocSectionCard num={2} title="Vague 2 — SCAMPER Challenge" filled={vague2Filled}>
        <div className="pt-3 space-y-1.5">
          {BRAINSTORM_DATA.vague2.notes.map((note) => (
            <div key={note.id} className={cn("rounded p-1.5 border text-[9px]", note.color)}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-gray-400">{BOT_COLORS[note.bot]?.name || note.bot}</span>
                {note.votes && <span className="flex items-center gap-0.5 text-amber-600"><Star className="h-3.5 w-3.5" /> {note.votes}</span>}
              </div>
              <p className="text-gray-700 leading-tight">{note.text}</p>
            </div>
          ))}
        </div>
      </DocSectionCard>

      {/* Section 3: Clusters */}
      <DocSectionCard num={3} title="Clusters thematiques" filled={clustersFilled}>
        <div className="pt-3 space-y-1.5">
          {BRAINSTORM_DATA.clusters.map((cluster) => (
            <div key={cluster.id} className={cn("p-1.5 rounded border", cluster.bg, cluster.border)}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={cn("text-[9px] font-bold", cluster.color)}>{cluster.label}</span>
                <span className="text-[9px] text-gray-400 ml-auto">{cluster.noteIds.length} idees</span>
              </div>
              <p className="text-[9px] text-gray-600">{cluster.potential}</p>
            </div>
          ))}
        </div>
      </DocSectionCard>

      {/* Section 4: Plan d'action */}
      <DocSectionCard num={4} title="Plan d'action & Projection" filled={planFilled}>
        <div className="pt-3">
          <p className="text-xs text-gray-700 mb-2">{BRAINSTORM_DATA.synthese.strategie}</p>
          <div className="space-y-1">
            {BRAINSTORM_DATA.synthese.projection.map((p) => (
              <div key={p.trimestre} className="flex items-center gap-2 text-[9px] p-1 bg-gray-50 rounded">
                <span className="font-bold text-blue-700">{p.trimestre}</span>
                <span className="text-green-600 font-bold">{p.clients}</span>
                <span className="text-gray-400 ml-auto">Total: {p.total}</span>
              </div>
            ))}
          </div>
        </div>
      </DocSectionCard>

      {/* Section 5: Conclusion */}
      <DocSectionCard num={5} title="Conclusion & Idee phare" filled={conclusionFilled}>
        <div className="pt-3">
          <div className="p-2 bg-amber-50 rounded border border-amber-200 mb-2">
            <p className="text-[9px] font-bold text-amber-700 mb-0.5">IDEE PHARE — #11</p>
            <p className="text-xs text-amber-800">{BRAINSTORM_DATA.synthese.ideePhare}</p>
          </div>
          <p className="text-[9px] text-gray-500">13 idees generees, 5 clusters, 3 leviers combines, objectif 250 clients en 12 mois.</p>
        </div>
      </DocSectionCard>

      {/* Extracted notes */}
      {extractedNotes.length > 0 && (
        <div className="bg-white rounded-xl border border-green-200 p-3">
          <p className="text-[9px] font-bold text-green-700 mb-1.5 uppercase">Notes extraites ({extractedNotes.length})</p>
          {extractedNotes.map((note, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[9px] text-green-600">
              <Pin className="h-3.5 w-3.5" />
              <span className="capitalize">{note.replace(/-/g, " ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  if (collapsed) {
    return (
      <div className="flex gap-2 items-center opacity-60">
        <BotAvatar code={code} size="sm" />
        <div className="text-[9px] text-gray-400">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[88%] shadow-sm border-l-2", bot.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[11px] font-semibold", bot.text)}>{bot.name}</span>
          <span className="text-[9px] text-gray-400">{bot.role}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onClick}
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, delay);
    return () => clearTimeout(timer);
  }, [onComplete, delay]);
  return null;
}
