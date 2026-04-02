"use client";

/**
 * AtelierDebat.tsx — Mode Debat — SELF-CONTAINED (pattern SimPhaseReflexion)
 * Meme cadre: TopBar 6 sections, sub-tabs, breadcrumb, phase indicator
 * Flow: 9 stages — intro, thinking, round1, round2, round3, verdict-thinking, verdict, conclusion, done
 * Multi-bot debates: CFO vs CRO, 3 rounds, challenges, RoundSummaryCard, DocForge, sentinel
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
  Swords,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Trophy,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Target,
  Download,
  Mic,
  FolderOpen,
  Crosshair,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { DEBAT_DATA } from "../../scenarios/debat-data";

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

// ═══════════════════════════════════════
// STAGES
// ═══════════════════════════════════════

type Stage =
  | "intro"
  | "thinking"
  | "round1"
  | "round2"
  | "round3"
  | "verdict-thinking"
  | "verdict"
  | "conclusion"
  | "done";

const STAGE_ORDER: Stage[] = [
  "intro", "thinking", "round1", "round2", "round3",
  "verdict-thinking", "verdict", "conclusion", "done",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter",
  thinking: "Preparation...",
  round1: "Round 1 — Finances",
  round2: "Round 2 — Risques",
  round3: "Round 3 — Vision",
  "verdict-thinking": "Deliberation...",
  verdict: "Verdict",
  conclusion: "Conclusion",
  done: "Termine",
};

// ═══════════════════════════════════════
// CHALLENGE DATA
// ═══════════════════════════════════════

const ROUND1_CHALLENGE =
  "Les chiffres du CRO sont optimistes. 2-3% d'erreurs de saisie qui coute 240-360K$? C'est base sur l'hypothese que TOUTES les erreurs se traduisent en perte. En realite, la plupart des erreurs de saisie sont detectees en aval. Le cout reel est plutot 80-120K$/an. Ca change completement le calcul de payback de l'ERP.";

const ROUND2_DEBATE = {
  cro: "Le CFO parle de 44% de disruption, mais il oublie que ces stats datent de 2018-2020. Les ERP cloud modernes (SAP Business One Cloud, Odoo 17) s'implementent en 3-6 mois, pas 12-18. Le risque operationnel est reel mais surestime si on choisit la bonne solution.",
  cfo: "Meme avec un ERP cloud, la migration de donnees entre 6 systemes prend minimum 4 mois. Et la formation de 45 employes en parallele de la production? Le risque est SOUS-estime, pas surestime.",
  consensus: "Le risque operationnel est reel dans les deux scenarios. La question n'est pas SI on perturbe les operations, mais combien de temps et comment mitiger.",
};

const ROUND3_CHALLENGE =
  "L'argument du CFO sur 'attendre les ERP IA' est un piege classique — c'est le meme argument qu'on entend depuis 20 ans. 'Attendons la prochaine generation.' Pendant ce temps, l'entreprise accumule de la dette technique avec 6 systemes qui ne communiquent pas.";

const CONTRE_ARGUMENT =
  "Si je devais contester ce verdict : on recommande essentiellement de NE PAS decider. Phase 1 = integrations temporaires, Phase 2 = dashboards par-dessus le chaos, Phase 3 = peut-etre un ERP dans 18 mois. C'est la definition du 'kick the can down the road'. Parfois il faut trancher, pas temporiser.";

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AtelierDebat({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
  const [showRound1Challenge, setShowRound1Challenge] = useState(false);
  const [showRound2Debat, setShowRound2Debat] = useState(false);
  const [showRound3Challenge, setShowRound3Challenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [positionFilled, setPositionFilled] = useState(false);
  const [round1Filled, setRound1Filled] = useState(false);
  const [round2Filled, setRound2Filled] = useState(false);
  const [round3Filled, setRound3Filled] = useState(false);
  const [verdictFilled, setVerdictFilled] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showRound1Challenge, showRound2Debat, showRound3Challenge, showContreArgument]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => {
    setStage("intro");
    setTyped(false);
    setShowRound1Challenge(false);
    setShowRound2Debat(false);
    setShowRound3Challenge(false);
    setShowContreArgument(false);
    setChallengeCount(0);
    setShowSentinel(false);
    setPositionFilled(false);
    setRound1Filled(false);
    setRound2Filled(false);
    setRound3Filled(false);
    setVerdictFilled(false);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [positionFilled, round1Filled, round2Filled, round3Filled, verdictFilled].filter(Boolean).length;

  // Phase active — atelier once debat is running
  const currentPhase: Phase | null =
    si >= STAGE_ORDER.indexOf("intro") ? "atelier" : null;

  // Discussion context changes with navigation
  const discussionContext =
    si <= STAGE_ORDER.indexOf("intro") ? "CarlOS — Mode Debat" :
    si <= STAGE_ORDER.indexOf("round1") ? "Debat — Round 1 Finances" :
    si <= STAGE_ORDER.indexOf("round2") ? "Debat — Round 2 Risques" :
    si <= STAGE_ORDER.indexOf("round3") ? "Debat — Round 3 Vision" :
    "Debat — Verdict & Conclusion";

  // Active bots — team that participates in the debat
  const activeBots = [
    { code: "CROB" },
    { code: "CFOB" },
    { code: "CSOB" },
  ];

  // Active sub-tab
  const activeSubTab = si <= STAGE_ORDER.indexOf("intro") ? 0 : -1;

  // Breadcrumb
  const breadcrumb: string[] =
    si <= STAGE_ORDER.indexOf("intro") ? ["Direction", "Mode Debat"] :
    si <= STAGE_ORDER.indexOf("round1") ? ["Direction", "Mode Debat", "Round 1"] :
    si <= STAGE_ORDER.indexOf("round2") ? ["Direction", "Mode Debat", "Round 2"] :
    si <= STAGE_ORDER.indexOf("round3") ? ["Direction", "Mode Debat", "Round 3"] :
    ["Direction", "Mode Debat", "Verdict"];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* User tension */}
      <div className="flex justify-end">
        <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
          <p className="text-sm text-blue-900">{DEBAT_DATA.userTension}</p>
        </div>
      </div>

      {/* CEO intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text={DEBAT_DATA.ceoIntro}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => { setPositionFilled(true); goNext("thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Lancer le debat
                  </button>
                  <button onClick={() => setPositionFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire position
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">CEO — Introduction debat, position initiale</p>}
        </SBubble>
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-amber-600 font-medium">CarlOS prepare le debat...</span>
          </div>
          <div className="space-y-1">
            {DEBAT_DATA.ceoThinking.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                <step.icon className="h-3.5 w-3.5 text-amber-500" />
                <span>{step.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          <AutoAdvance onComplete={() => goNext("round1")} delay={2500} />
        </div>
      )}

      {/* === ROUND 1 — Impact financier === */}
      {si >= STAGE_ORDER.indexOf("round1") && (
        <>
          {/* CRO POUR */}
          <SBubble code="CROB" collapsed={si > STAGE_ORDER.indexOf("round1") + 1}>
            {si <= STAGE_ORDER.indexOf("round1") + 1 ? (
              <>
                <div className="mb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">POUR l'ERP</span>
                </div>
                <p className="text-sm text-gray-700">{DEBAT_DATA.round1.pour.argument}</p>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {DEBAT_DATA.round1.pour.sources.map((s, i) => (
                    <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.label}</span>
                  ))}
                </div>
                {stage === "round1" && !showRound1Challenge && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => handleChallenge(setShowRound1Challenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                      <ShieldQuestion className="h-3.5 w-3.5" /> Challenger les chiffres
                    </button>
                    <button onClick={() => { setRound1Filled(true); goNext("round2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                      <ArrowRight className="h-3.5 w-3.5" /> Round 2
                    </button>
                    <button onClick={() => setRound1Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                      <Pin className="h-3.5 w-3.5" /> Extraire round 1
                    </button>
                  </div>
                )}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CRO — Round 1 POUR l'ERP</p>}
          </SBubble>

          {/* CFO CONTRE */}
          <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("round1") + 1}>
            {si <= STAGE_ORDER.indexOf("round1") + 1 ? (
              <>
                <div className="mb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">CONTRE l'ERP</span>
                </div>
                <p className="text-sm text-gray-700">{DEBAT_DATA.round1.contre.argument}</p>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {DEBAT_DATA.round1.contre.sources.map((s, i) => (
                    <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.label}</span>
                  ))}
                </div>
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CFO — Round 1 CONTRE l'ERP</p>}
          </SBubble>

          {/* Round 1 Challenge */}
          {showRound1Challenge && (
            <SBubble code="COOB" collapsed={si > STAGE_ORDER.indexOf("round1") + 1}>
              {si <= STAGE_ORDER.indexOf("round1") + 1 ? (
                <>
                  <div className="mb-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Challenge — Operationnel</span>
                  </div>
                  <p className="text-sm text-gray-700">{ROUND1_CHALLENGE}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => { setRound1Filled(true); goNext("round2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                      <ArrowRight className="h-3.5 w-3.5" /> Round 2
                    </button>
                  </div>
                </>
              ) : <p className="text-[9px] text-gray-400 italic">COO — Challenge chiffres Round 1</p>}
            </SBubble>
          )}
        </>
      )}

      {/* === ROUND 2 — Risque operationnel === */}
      {si >= STAGE_ORDER.indexOf("round2") && (
        <>
          {/* CRO POUR */}
          <SBubble code="CROB" collapsed={si > STAGE_ORDER.indexOf("round2") + 1}>
            {si <= STAGE_ORDER.indexOf("round2") + 1 ? (
              <>
                <div className="mb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">POUR l'ERP — Risque</span>
                </div>
                <p className="text-sm text-gray-700">{DEBAT_DATA.round2.pour.argument}</p>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {DEBAT_DATA.round2.pour.sources.map((s, i) => (
                    <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.label}</span>
                  ))}
                </div>
                {stage === "round2" && !showRound2Debat && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => handleChallenge(setShowRound2Debat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1 cursor-pointer">
                      <MessageSquare className="h-3.5 w-3.5" /> Debat CRO vs CFO
                    </button>
                    <button onClick={() => { setRound2Filled(true); goNext("round3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                      <ArrowRight className="h-3.5 w-3.5" /> Round 3
                    </button>
                    <button onClick={() => setRound2Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                      <Pin className="h-3.5 w-3.5" /> Extraire round 2
                    </button>
                  </div>
                )}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CRO — Round 2 POUR</p>}
          </SBubble>

          {/* CFO CONTRE */}
          <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("round2") + 1}>
            {si <= STAGE_ORDER.indexOf("round2") + 1 ? (
              <>
                <div className="mb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">CONTRE l'ERP — Risque</span>
                </div>
                <p className="text-sm text-gray-700">{DEBAT_DATA.round2.contre.argument}</p>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {DEBAT_DATA.round2.contre.sources.map((s, i) => (
                    <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.label}</span>
                  ))}
                </div>
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CFO — Round 2 CONTRE</p>}
          </SBubble>

          {/* Round 2 Debate exchange */}
          {showRound2Debat && (
            <>
              <SBubble code="CROB" collapsed={si > STAGE_ORDER.indexOf("round2") + 1}>
                {si <= STAGE_ORDER.indexOf("round2") + 1 ? (
                  <>
                    <div className="mb-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">Reponse CRO</span>
                    </div>
                    <p className="text-sm text-gray-700">{ROUND2_DEBATE.cro}</p>
                  </>
                ) : <p className="text-[9px] text-gray-400 italic">CRO — Reponse debat</p>}
              </SBubble>
              <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("round2") + 1}>
                {si <= STAGE_ORDER.indexOf("round2") + 1 ? (
                  <>
                    <div className="mb-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">Reponse CFO</span>
                    </div>
                    <p className="text-sm text-gray-700">{ROUND2_DEBATE.cfo}</p>
                  </>
                ) : <p className="text-[9px] text-gray-400 italic">CFO — Reponse debat</p>}
              </SBubble>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
                <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
                <p className="text-xs text-purple-700">{ROUND2_DEBATE.consensus}</p>
              </div>
              {si <= STAGE_ORDER.indexOf("round2") + 1 && (
                <div className="flex gap-2 flex-wrap px-1 mt-1">
                  <button onClick={() => { setRound2Filled(true); goNext("round3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Round 3
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* === ROUND 3 — Vision strategique === */}
      {si >= STAGE_ORDER.indexOf("round3") && (
        <>
          {/* CRO POUR */}
          <SBubble code="CROB" collapsed={si > STAGE_ORDER.indexOf("round3") + 1}>
            {si <= STAGE_ORDER.indexOf("round3") + 1 ? (
              <>
                <div className="mb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">POUR l'ERP — Vision</span>
                </div>
                <p className="text-sm text-gray-700">{DEBAT_DATA.round3.pour.argument}</p>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {DEBAT_DATA.round3.pour.sources.map((s, i) => (
                    <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.label}</span>
                  ))}
                </div>
                {stage === "round3" && !showRound3Challenge && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => handleChallenge(setShowRound3Challenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                      <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la vision
                    </button>
                    <button onClick={() => { setRound3Filled(true); goNext("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                      <ArrowRight className="h-3.5 w-3.5" /> Verdict final
                    </button>
                    <button onClick={() => setRound3Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                      <Pin className="h-3.5 w-3.5" /> Extraire round 3
                    </button>
                  </div>
                )}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CRO — Round 3 POUR Vision</p>}
          </SBubble>

          {/* CFO CONTRE */}
          <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("round3") + 1}>
            {si <= STAGE_ORDER.indexOf("round3") + 1 ? (
              <>
                <div className="mb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">CONTRE l'ERP — Vision</span>
                </div>
                <p className="text-sm text-gray-700">{DEBAT_DATA.round3.contre.argument}</p>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {DEBAT_DATA.round3.contre.sources.map((s, i) => (
                    <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.label}</span>
                  ))}
                </div>
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CFO — Round 3 CONTRE Vision</p>}
          </SBubble>

          {/* Round 3 Challenge */}
          {showRound3Challenge && (
            <SBubble code="CTOB" collapsed={si > STAGE_ORDER.indexOf("round3") + 1}>
              {si <= STAGE_ORDER.indexOf("round3") + 1 ? (
                <>
                  <div className="mb-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Challenge — CTO</span>
                  </div>
                  <p className="text-sm text-gray-700">{ROUND3_CHALLENGE}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => { setRound3Filled(true); goNext("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                      <ArrowRight className="h-3.5 w-3.5" /> Verdict final
                    </button>
                  </div>
                </>
              ) : <p className="text-[9px] text-gray-400 italic">CTO — Challenge vision</p>}
            </SBubble>
          )}
        </>
      )}

      {/* Sentinel warning */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 challenges deja — attention a ne pas tourner en rond. Le debat avance, il est temps de trancher.</p>
        </div>
      )}

      {/* Verdict thinking */}
      {stage === "verdict-thinking" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-amber-600 font-medium">CarlOS delibere...</span>
          </div>
          <div className="space-y-1">
            {DEBAT_DATA.verdictThinking.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                <step.icon className="h-3.5 w-3.5 text-amber-500" />
                <span>{step.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          <AutoAdvance onComplete={() => goNext("verdict")} delay={2500} />
        </div>
      )}

      {/* === VERDICT === */}
      {si >= STAGE_ORDER.indexOf("verdict") && (
        <>
          <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("verdict")}>
            {si === STAGE_ORDER.indexOf("verdict") ? (
              <>
                <div className="space-y-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> Gagnant : {DEBAT_DATA.verdict.winner}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">{DEBAT_DATA.verdict.recommendation}</p>
                  </div>
                  <TypewriterText
                    text={DEBAT_DATA.verdict.conclusion}
                    speed={8}
                    className="text-sm text-gray-700"
                    onComplete={() => setTyped(true)}
                  />
                </div>
                {typed && !showContreArgument && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1 cursor-pointer">
                      <Eye className="h-3.5 w-3.5" /> Contre-argument
                    </button>
                    <button onClick={() => { setVerdictFilled(true); goNext("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                      <ArrowRight className="h-3.5 w-3.5" /> Conclure
                    </button>
                    <button onClick={() => setVerdictFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                      <Pin className="h-3.5 w-3.5" /> Extraire verdict
                    </button>
                  </div>
                )}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CEO — Verdict rendu</p>}
          </SBubble>

          {/* Contre-argument */}
          {showContreArgument && (
            <SBubble code="CSOB" collapsed={si > STAGE_ORDER.indexOf("verdict")}>
              {si === STAGE_ORDER.indexOf("verdict") ? (
                <>
                  <div className="mb-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">Contre-argument — Strategiste</span>
                  </div>
                  <p className="text-sm text-gray-700">{CONTRE_ARGUMENT}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => { setVerdictFilled(true); goNext("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                      <ArrowRight className="h-3.5 w-3.5" /> Conclure
                    </button>
                  </div>
                </>
              ) : <p className="text-[9px] text-gray-400 italic">CSO — Contre-argument</p>}
            </SBubble>
          )}
        </>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <div className="space-y-2">
            <TypewriterText
              text="Debat clos. Document complet. Le rapport de debat est pret — 3 rounds analyses, verdict rendu avec plan d'action en 3 phases. Exporte ou utilise comme base pour le Board Room."
              speed={8}
              className="text-sm text-gray-700"
              onComplete={() => setTyped(true)}
            />
          </div>
          {typed && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1 cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Exporter PDF
              </button>
              <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1 cursor-pointer">
                <Send className="h-3.5 w-3.5" /> Envoyer au Board Room
              </button>
              <button onClick={() => goNext("done")} className="text-[9px] px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 flex items-center gap-1 cursor-pointer">
                <CheckCircle2 className="h-3.5 w-3.5" /> Terminer
              </button>
            </div>
          )}
        </SBubble>
      )}

      {/* Done */}
      {stage === "done" && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 rounded-xl px-4 py-3">
          <p className="text-sm text-emerald-800 font-medium">Debat termine. 5/5 sections remplies. Document pret pour export ou Board Room.</p>
          <div className="mt-2 flex items-center gap-2">
            <Swords className="h-3.5 w-3.5 text-amber-500" />
            <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
            <Trophy className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] text-emerald-700 font-semibold ml-1">3 rounds + verdict</span>
          </div>
        </div>
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
        <Swords className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-bold text-gray-800">Mode Debat</span>
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
      <div className={cn("h-1 shrink-0", currentPhase ? PHASE_COLORS[currentPhase].dot : "bg-amber-600")} />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar + bot avatars */}
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2",
            currentPhase ? cn(PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border) : "bg-gray-50 border-gray-200"
          )}>
            {/* Bot team avatars */}
            {currentPhase && (
              <div className="flex items-center gap-1.5">
                {activeBots.map(b => (
                  <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                    <BotAvatar code={b.code} size="sm" />
                    <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b.code]?.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
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
                  nav.id === "dept" ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs Mon Departement */}
          {activeSubTab >= 0 && (
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
              positionFilled={positionFilled}
              round1Filled={round1Filled}
              round2Filled={round2Filled}
              round3Filled={round3Filled}
              verdictFilled={verdictFilled}
              showRound1Challenge={showRound1Challenge}
              showRound2Debat={showRound2Debat}
              showRound3Challenge={showRound3Challenge}
              showContreArgument={showContreArgument}
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
  positionFilled: boolean;
  round1Filled: boolean;
  round2Filled: boolean;
  round3Filled: boolean;
  verdictFilled: boolean;
  showRound1Challenge: boolean;
  showRound2Debat: boolean;
  showRound3Challenge: boolean;
  showContreArgument: boolean;
}

function RightContent({
  stage, filledCount,
  positionFilled, round1Filled, round2Filled, round3Filled, verdictFilled,
  showRound1Challenge, showRound2Debat, showRound3Challenge, showContreArgument,
}: RightContentProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      {/* Document header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Swords className="h-5 w-5 text-amber-600" />
          <h3 className="text-sm font-bold text-amber-900">Rapport de Debat Structure</h3>
        </div>
        <p className="text-xs text-amber-700 mb-3">{DEBAT_DATA.titre}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-amber-200/50 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-amber-700">{filledCount}/5</span>
        </div>
      </div>

      {/* Section 1 — Position initiale */}
      <DocSectionCard num={1} title="Position & Contexte" filled={positionFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Contexte</p>
            <p className="text-xs text-gray-700">{DEBAT_DATA.contexte}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-green-800 mb-0.5">POUR (CRO Rich)</p>
              <p className="text-[9px] text-green-700">L'ERP a 200K$ se rembourse en 6-8 mois par les gains d'efficacite</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-red-800 mb-0.5">CONTRE (CFO Frank)</p>
              <p className="text-[9px] text-red-700">Budget reel 500-800K$, 67% des ERP depassent le budget</p>
            </div>
          </div>
        </div>
      </DocSectionCard>

      {/* Section 2 — Round 1 */}
      <DocSectionCard num={2} title="Round 1 — Impact financier" filled={round1Filled}>
        <div className="pt-2">
          <RoundSummaryCard
            theme="Impact financier"
            icon={DollarSign}
            pourArg="Cout du statu quo: 328-448K$/an (reconciliation + erreurs + retards). ROI en 6-8 mois."
            contreArg="Budget reel ERP: 500-800K$ (2.5-4x le prix logiciel). Integrations API = 35K$ pour 80% des gains."
            pourSources={DEBAT_DATA.round1.pour.sources.length}
            contreSources={DEBAT_DATA.round1.contre.sources.length}
          />
          {showRound1Challenge && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge COO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Erreurs saisie reelles ~80-120K$/an, pas 240-360K$. Payback ERP recalcule a 12-18 mois.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 3 — Round 2 */}
      <DocSectionCard num={3} title="Round 2 — Risque operationnel" filled={round2Filled}>
        <div className="pt-2">
          <RoundSummaryCard
            theme="Risque operationnel"
            icon={AlertTriangle}
            pourArg="Sans ERP, zero visibilite temps reel. Perte de competitivite en 2 ans vs concurrents equipes."
            contreArg="44% disruption majeure pendant migration. 1M$ CA a risque par mois perturbe. 45 employes = pas de buffer."
            pourSources={DEBAT_DATA.round2.pour.sources.length}
            contreSources={DEBAT_DATA.round2.contre.sources.length}
          />
          {showRound2Debat && (
            <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-purple-800">Consensus atteint</p>
              <p className="text-[9px] text-purple-700 mt-0.5">{ROUND2_DEBATE.consensus}</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 4 — Round 3 */}
      <DocSectionCard num={4} title="Round 3 — Vision strategique" filled={round3Filled}>
        <div className="pt-2">
          <RoundSummaryCard
            theme="Vision a 3 ans"
            icon={TrendingUp}
            pourArg="Croissance 67% visee (12-20M$). Impossible a gerer avec 6 systemes. L'ERP est une infrastructure."
            contreArg="ERP actuel obsolete en 2029. Mieux: 50K$ integrations + flexibilite + reevaluer en 18 mois."
            pourSources={DEBAT_DATA.round3.pour.sources.length}
            contreSources={DEBAT_DATA.round3.contre.sources.length}
          />
          {showRound3Challenge && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge CTO Tim</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Argument 'attendre la prochaine generation' = piege classique depuis 20 ans. Dette technique s'accumule.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 5 — Verdict & Plan */}
      <DocSectionCard num={5} title="Verdict & Plan d'action" filled={verdictFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2">
            <Trophy className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-800">Gagnant : {DEBAT_DATA.verdict.winner}</p>
              <p className="text-[9px] text-emerald-700 mt-0.5">{DEBAT_DATA.verdict.recommendation}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-gray-700 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Plan en 3 phases</p>
            {DEBAT_DATA.verdict.plan.map((step, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-start gap-2">
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0",
                  i === 0 ? "bg-blue-100 text-blue-700" : i === 1 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                )}>P{i + 1}</span>
                <p className="text-[9px] text-gray-700">{step}</p>
              </div>
            ))}
          </div>
          {showContreArgument && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-red-800">Contre-argument CSO</p>
              <p className="text-[9px] text-red-700 mt-0.5">Risque de temporiser : 'kick the can down the road'. Parfois il faut trancher, pas integrer temporairement.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Empty state */}
      {filledCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Swords className="h-10 w-10 text-amber-300" />
          <p className="text-xs">Le document se construira au fil du debat...</p>
          <p className="text-[9px]">3 rounds — CFO vs CRO + Verdict CEO</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// DOCUMENT SECTION CARD (DocForge pattern)
// ═══════════════════════════════════════

function DocSectionCard({ num, title, filled, children }: {
  num: number; title: string; filled: boolean; children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(filled);
  return (
    <div className={cn("border rounded-xl overflow-hidden transition-all", filled ? "border-green-200 bg-white shadow-sm" : "border-dashed border-gray-300 bg-gray-50/50 opacity-60")}>
      <button
        onClick={() => filled && setExpanded(!expanded)}
        className={cn("w-full px-4 py-2.5 flex items-center gap-2.5 text-left", filled ? "cursor-pointer hover:bg-gray-50" : "cursor-default")}
      >
        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", filled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-400")}>{num}</span>
        {filled ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
        <span className={cn("text-sm font-semibold flex-1", filled ? "text-gray-800" : "text-gray-400")}>{title}</span>
        {filled && <ArrowRight className={cn("h-4 w-4 text-gray-400 transition-transform", expanded && "rotate-90")} />}
      </button>
      {filled && expanded && children && <div className="px-4 pb-3 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════
// ROUND SUMMARY CARD
// ═══════════════════════════════════════

function RoundSummaryCard({ theme, icon: RIcon, pourArg, contreArg, pourSources, contreSources }: {
  theme: string; icon: React.ElementType; pourArg: string; contreArg: string; pourSources: number; contreSources: number;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-amber-200">
        <RIcon className="h-3.5 w-3.5 text-amber-700" />
        <span className="text-[9px] font-bold text-amber-900">{theme}</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-2">
          <p className="text-[9px] font-bold text-green-700 uppercase mb-0.5">POUR ({pourSources} sources)</p>
          <p className="text-[9px] text-gray-700">{pourArg}</p>
        </div>
        <div className="p-2">
          <p className="text-[9px] font-bold text-red-700 uppercase mb-0.5">CONTRE ({contreSources} sources)</p>
          <p className="text-[9px] text-gray-700">{contreArg}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HELPERS (same pattern as SimPhaseReflexion)
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
