"use client";

/**
 * AtelierDecision.tsx — Atelier split-screen "Mode Decision" — SELF-CONTAINED
 * Pattern: SimPhaseReflexion.tsx gold standard
 * GAUCHE: Chat riche avec SBubble (challenges, debats, extractions)
 * DROITE: Document decision DocForge (5 sections) — matrice ponderee, stakeholders, scenarios, verdict
 * Data: DECISION_DATA (decision-data.ts)
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
  Scale,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
  Download,
  Mic,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { DECISION_DATA } from "../../scenarios/decision-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

type Phase = "reflexion" | "atelier" | "command";

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

type Stage =
  | "intro"
  | "thinking"
  | "matrice"
  | "stakeholders"
  | "scenarios"
  | "verdict-thinking"
  | "verdict"
  | "conclusion";

const STAGE_ORDER: Stage[] = [
  "intro", "thinking", "matrice", "stakeholders",
  "scenarios", "verdict-thinking", "verdict", "conclusion",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Analyse...", matrice: "Matrice ponderee",
  stakeholders: "Stakeholders", scenarios: "Scenarios",
  "verdict-thinking": "Deliberation...", verdict: "Verdict", conclusion: "Conclusion",
};

// ═══════════════════════════════════════
// CHALLENGE DATA
// ═══════════════════════════════════════

const MATRICE_CHALLENGE =
  "La ponderation du critere 'Risque' a 5 est discutable. Le risque financier est DEJA capture dans le critere 'Capacite financiere' (aussi a 5). On double-compte le risque. Si on descend 'Risque' a 3, le score GO passe devant de maniere plus convaincante. La question est : est-ce qu'on laisse la peur de perdre biaiser la matrice?";

const STAKEHOLDER_DEBATE = {
  cso: "Les clients Zenith a risque (20-30% de perte) representent 420-630K$ de CA. Mais on oublie que SANS acquisition, ces clients iront chez un autre acquereur — ou nulle part. En rachetant, on controle le narratif de transition.",
  cfob: "La Simone voit le verre a moitie plein. Les 20-30% de perte client ne sont PAS le seul risque stakeholder. La banque va stresser nos covenants, et nos propres employes vont vivre une integration chaotique. 3 risques stakeholders simultanees, c'est beaucoup.",
  consensus: "Les risques stakeholders sont reels et multiples. La structure earn-out mitigue une partie (aligne le fondateur sur la retention clients). Reste le risque bancaire a gerer proactivement.",
};

const SCENARIO_CHALLENGE =
  "Le scenario 'Cherry-pick assets' a seulement 10% de probabilite, mais c'est le plus creatif. 300K$ pour la liste clients + 3 employes cles = 80% de la valeur strategique pour 25% du prix. Pourquoi on l'ecarte si vite? Le fondateur est desespere — il pourrait accepter.";

const CONTRE_ARGUMENT =
  "L'ecart GO/NO-GO est de 12% seulement. Dans toute matrice de decision serieuse, un ecart sous 15% signifie 'zone grise' — la decision est autant emotionnelle que rationnelle. On se raccroche a une matrice pour justifier une decision deja prise. Si les chiffres donnaient 52/48, on ferait quand meme le GO?";

// ═══════════════════════════════════════
// DOC SECTION CARD
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
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AtelierDecision({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
  const [showMatriceChallenge, setShowMatriceChallenge] = useState(false);
  const [showStakeholderDebat, setShowStakeholderDebat] = useState(false);
  const [showScenarioChallenge, setShowScenarioChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [contexteFilled, setContexteFilled] = useState(false);
  const [matriceFilled, setMatriceFilled] = useState(false);
  const [stakeholdersFilled, setStakeholdersFilled] = useState(false);
  const [scenariosFilled, setScenariosFilled] = useState(false);
  const [verdictFilled, setVerdictFilled] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showMatriceChallenge, showStakeholderDebat, showScenarioChallenge, showContreArgument, showSentinel]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => {
    setStage("intro"); setTyped(false);
    setShowMatriceChallenge(false); setShowStakeholderDebat(false);
    setShowScenarioChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setContexteFilled(false); setMatriceFilled(false);
    setStakeholdersFilled(false); setScenariosFilled(false); setVerdictFilled(false);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [contexteFilled, matriceFilled, stakeholdersFilled, scenariosFilled, verdictFilled].filter(Boolean).length;

  // Dynamic state per stage
  const discussionContext =
    si <= 1 ? "CarlOS — Mode Decision" :
    si <= 3 ? "Decision — Matrice & Stakeholders" :
    si <= 5 ? "Decision — Scenarios & Deliberation" :
    "Decision — Verdict final";

  const activeBots: string[] =
    si <= 2 ? ["CFOB", "CSOB"] :
    si <= 4 ? ["CSOB", "CFOB", "CROB"] :
    ["CFOB", "COOB", "CROB"];

  const currentPhase: Phase = "reflexion";
  const activeNav = "dept";
  const activeSubTab = si <= 0 ? 0 : -1;

  const breadcrumb: string[] = ["Direction", "Chantier Marketing Q2", "Decision Acquisition"];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* User tension */}
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
          <p className="text-sm">{DECISION_DATA.userTension}</p>
        </div>
      </div>

      {/* CEO intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text={DECISION_DATA.ceoIntro}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => { setContexteFilled(true); goNext("thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Lancer l'analyse
                  </button>
                  <button onClick={() => setContexteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire contexte
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">CarlOS — Cadrage Mode Decision, mobilisation CFO/COO/CSO/CRO</p>
          )}
        </SBubble>
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <>
          <AutoAdvance onComplete={() => goNext("matrice")} delay={2500} />
          <SBubble code="CEOB" collapsed={false}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[9px] text-gray-400">Construction de la matrice decisionnelle...</span>
            </div>
          </SBubble>
        </>
      )}

      {/* === MATRICE === */}
      {si >= STAGE_ORDER.indexOf("matrice") && (
        <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("matrice") && !showMatriceChallenge}>
          {si === STAGE_ORDER.indexOf("matrice") || showMatriceChallenge ? (
            <>
              <p className="text-sm text-gray-700">J'ai evalue chaque critere avec un score pour et contre. L'aspect financier est le plus preoccupant — on epuise 100% de la tresorerie. Le risque est reel.</p>
              <div className="mt-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2">
                <p className="text-[9px] font-bold text-slate-600">6 criteres ponderes — Score GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreFor, 0)} vs NO-GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreAgainst, 0)}</p>
              </div>
              {stage === "matrice" && !showMatriceChallenge && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowMatriceChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la ponderation
                  </button>
                  <button onClick={() => { setMatriceFilled(true); goNext("stakeholders"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Stakeholders
                  </button>
                  <button onClick={() => setMatriceFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire matrice
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Frank — Matrice 6 criteres, GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreFor, 0)} vs NO-GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreAgainst, 0)}</p>
          )}
        </SBubble>
      )}

      {showMatriceChallenge && (
        <SBubble code="CROB" collapsed={si > STAGE_ORDER.indexOf("matrice")}>
          {si === STAGE_ORDER.indexOf("matrice") ? (
            <>
              <p className="text-sm text-gray-700">{MATRICE_CHALLENGE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setMatriceFilled(true); goNext("stakeholders"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Stakeholders
                </button>
              </div>
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Rich — Challenge ponderation risque, double-comptage</p>
          )}
        </SBubble>
      )}

      {/* === STAKEHOLDERS === */}
      {si >= STAGE_ORDER.indexOf("stakeholders") && (
        <SBubble code="CSOB" collapsed={si > STAGE_ORDER.indexOf("stakeholders") && !showStakeholderDebat}>
          {si === STAGE_ORDER.indexOf("stakeholders") || showStakeholderDebat ? (
            <>
              <p className="text-sm text-gray-700">Strategiquement, c'est une opportunite rare. Eliminer un concurrent + absorber 35 clients = position dominante. Mais le prix doit etre negocie — 1.2M$ cash est trop agressif.</p>
              <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-[9px] font-bold text-blue-700">{DECISION_DATA.stakeholders.length} parties prenantes analysees — {DECISION_DATA.stakeholders.filter(s => s.impact === "positif").length} positifs, {DECISION_DATA.stakeholders.filter(s => s.impact === "negatif").length} negatifs</p>
              </div>
              {stage === "stakeholders" && !showStakeholderDebat && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowStakeholderDebat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1 cursor-pointer">
                    <MessageSquare className="h-3.5 w-3.5" /> Debat CSO vs CFO
                  </button>
                  <button onClick={() => { setStakeholdersFilled(true); goNext("scenarios"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Scenarios
                  </button>
                  <button onClick={() => setStakeholdersFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire stakeholders
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Simone — Position dominante, {DECISION_DATA.stakeholders.length} stakeholders</p>
          )}
        </SBubble>
      )}

      {showStakeholderDebat && (
        <>
          <SBubble code="CSOB" collapsed={si > STAGE_ORDER.indexOf("stakeholders")}>
            {si === STAGE_ORDER.indexOf("stakeholders") ? (
              <p className="text-sm text-gray-700">{STAKEHOLDER_DEBATE.cso}</p>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Simone — Controle narratif transition clients</p>
            )}
          </SBubble>
          <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("stakeholders")}>
            {si === STAGE_ORDER.indexOf("stakeholders") ? (
              <p className="text-sm text-gray-700">{STAKEHOLDER_DEBATE.cfob}</p>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Frank — 3 risques simultanees, covenants bancaires</p>
            )}
          </SBubble>
          {si === STAGE_ORDER.indexOf("stakeholders") && (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
                <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
                <p className="text-xs text-purple-700">{STAKEHOLDER_DEBATE.consensus}</p>
              </div>
              <div className="flex gap-2 flex-wrap px-1 mt-1">
                <button onClick={() => { setStakeholdersFilled(true); goNext("scenarios"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Scenarios
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* === SCENARIOS === */}
      {si >= STAGE_ORDER.indexOf("scenarios") && (
        <SBubble code="CROB" collapsed={si > STAGE_ORDER.indexOf("scenarios") && !showScenarioChallenge}>
          {si === STAGE_ORDER.indexOf("scenarios") || showScenarioChallenge ? (
            <>
              <p className="text-sm text-gray-700">Le scenario le plus probable (45%) est un GO negocie a 850K$ + earn-out. Ca preserve la tresorerie tout en captant la valeur. J'ai modele 4 scenarios avec leurs probabilites.</p>
              {stage === "scenarios" && !showScenarioChallenge && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowScenarioChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger le cherry-pick
                  </button>
                  <button onClick={() => { setScenariosFilled(true); goNext("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Verdict final
                  </button>
                  <button onClick={() => setScenariosFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire scenarios
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Rich — 4 scenarios, GO negocie 850K$ + earn-out (45%)</p>
          )}
        </SBubble>
      )}

      {showScenarioChallenge && (
        <SBubble code="COOB" collapsed={si > STAGE_ORDER.indexOf("scenarios")}>
          {si === STAGE_ORDER.indexOf("scenarios") ? (
            <>
              <p className="text-sm text-gray-700">{SCENARIO_CHALLENGE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setScenariosFilled(true); goNext("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Verdict final
                </button>
              </div>
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Olivier — Cherry-pick 300K$ = 80% valeur pour 25% prix</p>
          )}
        </SBubble>
      )}

      {/* Sentinel */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 challenges deja — l'analyse est solide, il est temps de trancher.</p>
        </div>
      )}

      {/* Verdict thinking */}
      {stage === "verdict-thinking" && (
        <>
          <AutoAdvance onComplete={() => goNext("verdict")} delay={2500} />
          <SBubble code="CEOB" collapsed={false}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[9px] text-gray-400">Deliberation finale — calcul du consensus...</span>
            </div>
          </SBubble>
        </>
      )}

      {/* === VERDICT === */}
      {si >= STAGE_ORDER.indexOf("verdict") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("verdict") && !showContreArgument}>
          {si === STAGE_ORDER.indexOf("verdict") || showContreArgument ? (
            <>
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {DECISION_DATA.verdict.decision}</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{DECISION_DATA.verdict.condition}</p>
                </div>
                <p className="text-sm text-gray-700">{DECISION_DATA.verdict.recommandation}</p>
              </div>
              {stage === "verdict" && !showContreArgument && (
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
          ) : (
            <p className="text-[9px] text-gray-400 italic">CarlOS — {DECISION_DATA.verdict.decision}, {DECISION_DATA.verdict.scoreGo} vs {DECISION_DATA.verdict.scoreNoGo}</p>
          )}
        </SBubble>
      )}

      {showContreArgument && (
        <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("verdict")}>
          {si === STAGE_ORDER.indexOf("verdict") ? (
            <>
              <p className="text-sm text-gray-700">{CONTRE_ARGUMENT}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setVerdictFilled(true); goNext("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Conclure
                </button>
              </div>
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Frank — Ecart 12% = zone grise, decision emotionnelle</p>
          )}
        </SBubble>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Decision prise. Document complet.</p>
            <p className="text-xs text-gray-600">Matrice ponderee, impact stakeholders, 4 scenarios et verdict GO CONDITIONNEL documentes. 5 prochaines etapes assignees.</p>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1 cursor-pointer">
              <Download className="h-3.5 w-3.5" /> Exporter PDF
            </button>
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1 cursor-pointer">
              <Send className="h-3.5 w-3.5" /> Envoyer au Board Room
            </button>
          </div>
        </SBubble>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // DOCUMENT CONTENT (RIGHT)
  // ═══════════════════════════════════════

  const atelierContent = (
    <div className="space-y-3">
      {/* Document header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-5 w-5 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Rapport de Decision Structure</h3>
        </div>
        <p className="text-xs text-slate-700 mb-3">{DECISION_DATA.titre}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-200/50 rounded-full h-2 overflow-hidden">
            <div className="bg-slate-500 h-full rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-slate-700">{filledCount}/5</span>
        </div>
      </div>

      {/* Section 1 — Contexte */}
      <DocSectionCard num={1} title="Contexte & Cadrage" filled={contexteFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Situation</p>
            <p className="text-xs text-gray-700">{DECISION_DATA.contexte}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-blue-600 font-bold">Prix demande</p>
              <p className="text-sm font-bold text-blue-800">1.2M$</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-amber-600 font-bold">Tresorerie</p>
              <p className="text-sm font-bold text-amber-800">800K$</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-green-600 font-bold">CA cible</p>
              <p className="text-sm font-bold text-green-800">2.1M$</p>
            </div>
          </div>
        </div>
      </DocSectionCard>

      {/* Section 2 — Matrice */}
      <DocSectionCard num={2} title="Matrice de Decision Ponderee" filled={matriceFilled}>
        <div className="pt-2 space-y-2">
          {DECISION_DATA.criteres.map(c => {
            const net = c.weight * c.scoreFor - c.weight * c.scoreAgainst;
            return (
              <div key={c.id} className="flex items-center gap-2 text-[9px]">
                <span className="font-semibold text-gray-700 w-28 truncate">{c.label}</span>
                <span className="text-gray-400">x{c.weight}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={cn("h-full rounded-full", net > 0 ? "bg-green-400" : "bg-red-400")}
                    style={{ width: `${Math.min(100, Math.abs(net) * 5)}%` }} />
                </div>
                <span className={cn("font-bold min-w-[24px] text-right", net > 0 ? "text-green-700" : "text-red-700")}>
                  {net > 0 ? "+" : ""}{net}
                </span>
              </div>
            );
          })}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between mt-1">
            <span className="text-[9px] font-bold text-slate-700">Total pondere</span>
            <div className="flex gap-3">
              <span className="text-[9px] font-bold text-green-700">GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreFor, 0)}</span>
              <span className="text-[9px] font-bold text-red-700">NO-GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreAgainst, 0)}</span>
            </div>
          </div>
          {showMatriceChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge CRO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Ponderation 'Risque' a 5 = double-comptage avec 'Financier'. Si reduit a 3, le GO passe mieux.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 3 — Stakeholders */}
      <DocSectionCard num={3} title="Impact Parties Prenantes" filled={stakeholdersFilled}>
        <div className="pt-2 space-y-1.5">
          {DECISION_DATA.stakeholders.map((sh, i) => {
            const color = sh.impact === "positif" ? "green" : sh.impact === "negatif" ? "red" : "gray";
            return (
              <div key={i} className={cn("flex items-center gap-2 p-1.5 rounded-lg", `bg-${color}-50`)}>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase", `bg-${color}-100 text-${color}-800`)}>{sh.impact}</span>
                <span className="text-[9px] font-semibold text-gray-800 flex-1 truncate">{sh.stakeholder}</span>
              </div>
            );
          })}
          {showStakeholderDebat && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mt-1">
              <p className="text-[9px] font-bold text-purple-800">Consensus</p>
              <p className="text-[9px] text-purple-700 mt-0.5">Earn-out aligne fondateur sur retention. Risque bancaire a gerer proactivement.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 4 — Scenarios */}
      <DocSectionCard num={4} title="Scenarios Conditionnels" filled={scenariosFilled}>
        <div className="pt-2 space-y-1.5">
          {DECISION_DATA.scenarios.map(sc => {
            const SIcon = sc.icon;
            return (
              <div key={sc.id} className={cn("border rounded-lg p-2", sc.bg, sc.border)}>
                <div className="flex items-center gap-1.5">
                  <SIcon className={cn("h-3.5 w-3.5", sc.color)} />
                  <span className={cn("text-[9px] font-bold flex-1", sc.color)}>{sc.label}</span>
                  <span className="text-[9px] font-bold bg-white/60 px-1.5 py-0.5 rounded-full">{sc.probability}</span>
                </div>
                <p className="text-[9px] text-gray-600 mt-1">{sc.outcome}</p>
              </div>
            );
          })}
          {showScenarioChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge COO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Cherry-pick a 300K$ = 80% de la valeur pour 25% du prix. Fondateur desespere, pourrait accepter.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 5 — Verdict */}
      <DocSectionCard num={5} title="Verdict & Prochaines Etapes" filled={verdictFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-800">{DECISION_DATA.verdict.decision}</p>
              <p className="text-[9px] text-emerald-700 mt-0.5">{DECISION_DATA.verdict.condition}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-green-600 font-bold">GO</p>
              <p className="text-lg font-black text-green-700">{DECISION_DATA.verdict.scoreGo}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-red-600 font-bold">NO-GO</p>
              <p className="text-lg font-black text-red-700">{DECISION_DATA.verdict.scoreNoGo}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-700">5 prochaines etapes</p>
            {DECISION_DATA.verdict.nextSteps.map((ns, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[9px]">
                <span className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-bold">{i + 1}</span>
                <span className="text-gray-500">{ns.deadline}</span>
                <span className="text-gray-700 flex-1 truncate">{ns.step}</span>
              </div>
            ))}
          </div>
          {showContreArgument && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-red-800">Contre-argument CFO</p>
              <p className="text-[9px] text-red-700 mt-0.5">Ecart 12% = zone grise. La matrice justifie une decision deja prise emotionnellement.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Empty state */}
      {filledCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Scale className="h-10 w-10 text-slate-300" />
          <p className="text-xs">Le document se construira au fil de l'analyse...</p>
          <p className="text-[9px]">Matrice + Stakeholders + Scenarios + Verdict</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT (self-contained, same frame as SimPhaseReflexion)
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Scale className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-bold text-gray-800">Mode Decision</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-slate-500" : i < si ? "w-2 bg-slate-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className="h-1 shrink-0 bg-slate-500" />

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
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2",
            cn(PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border)
          )}>
            {/* Active bot team avatars LEFT */}
            <div className="flex items-center gap-1.5">
              {activeBots.map(code => (
                <div key={code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                  <BotAvatar code={code} size="sm" />
                  <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[code]?.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
              ))}
            </div>
            {/* Phase badges RIGHT */}
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

          {/* Right panel content — DocForge document */}
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            <div className="max-w-4xl mx-auto px-6 py-4">
              {atelierContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HELPER COMPONENTS (bottom of file, same pattern as SimPhaseReflexion)
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
      <button onClick={onClick} className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  useEffect(() => { const timer = setTimeout(onComplete, delay); return () => clearTimeout(timer); }, [onComplete, delay]);
  return null;
}
