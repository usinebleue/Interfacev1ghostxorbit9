"use client";

/**
 * AtelierCrise.tsx — Mode Crise OODA Loop — SELF-CONTAINED (SimPhaseReflexion pattern)
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: TopBar 6 sections + sub-tabs + breadcrumb + Document OODA (5 sections DocForge)
 * Data: CRISE_DATA (crise-data.ts)
 * 8 stages: intro > observe-thinking > observe > orient > decide-thinking > decide > act > resultat
 * Sprint B — Atelier Simulations
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  Mic,
  Send,
  ChevronRight,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Clock,
  Phone,
  Target,
  Download,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { CRISE_DATA } from "../../scenarios/crise-data";

// =============================================
// CONSTANTS
// =============================================

const UB_BLUE = "#073E5A";

type Stage =
  | "intro"
  | "observe-thinking"
  | "observe"
  | "orient"
  | "decide-thinking"
  | "decide"
  | "act"
  | "resultat";

const STAGE_ORDER: Stage[] = [
  "intro", "observe-thinking", "observe", "orient",
  "decide-thinking", "decide", "act", "resultat",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Alerte",
  "observe-thinking": "Scan...",
  observe: "OBSERVER",
  orient: "ORIENTER",
  "decide-thinking": "Decision...",
  decide: "DECIDER",
  act: "AGIR",
  resultat: "Resultat",
};

type Phase = "reflexion" | "atelier" | "command";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// =============================================
// CHALLENGE DATA
// =============================================

const FACTS_CHALLENGE =
  "On focalise sur les 7 retards et 3 NCR, mais le vrai signal est le 'dernier contact positif il y a 4 mois'. Ca veut dire qu'on a laisse la relation se degrader pendant 4 mois SANS reagir. Le probleme n'est pas les retards — c'est l'absence totale de gestion de compte strategique. On traite le symptome, pas la cause.";

const OPTIONS_DEBATE = {
  cso: "Appeler d'abord EST la bonne strategie. Le plan ecrit sans appel ressemble a un document legal — ca formalise le conflit au lieu de le desamorcer. Un appel humain + excuses sinceres = desescalade. Le plan suit ensuite comme preuve de serieux.",
  cfob: "Le risque de l'appel immediat : si on n'a pas les reponses aux questions difficiles, on perd de la credibilite. 'Quand est-ce que les 3 commandes en cours arrivent?' — si on begaie, c'est pire que le silence.",
  consensus: "Appel rapide MAIS avec au minimum 30 minutes de preparation (status des 3 commandes en cours + causes racines des NCR). Pas d'improvisation sous pression.",
};

const DIRECTIVE_CHALLENGE =
  "4 departements mobilises en meme temps, c'est beaucoup pour une crise de 48h. Le COO et CTO peuvent travailler en parallele, mais le CFO n'a pas besoin d'etre mobilise maintenant — le credit qualite de 75K$ peut attendre 24h. On diluera l'energie si tout le monde court en meme temps.";

const CONTRE_ARGUMENT =
  "On propose un plan correctif tres offensif — inspection 100%, superviseur dedie, credit 75K$, poste de responsable qualite. Ca coute cher et c'est un aveu de faiblesse. Et si Aeromax utilise ce plan comme levier de negociation avec PrecisionTech? 'Regardez ce que notre fournisseur actuel est pret a faire — battez ca.'";

// =============================================
// ACTIVE BOTS PER STAGE
// =============================================

function getActiveBots(stage: Stage): { code: string; name: string }[] {
  const si = STAGE_ORDER.indexOf(stage);
  if (si <= 0) return []; // intro — no bots yet
  if (si <= 2) return [{ code: "CEOB", name: "CarlOS" }]; // observe phases
  if (si === 3) return [{ code: "CEOB", name: "CarlOS" }, { code: "CSOB", name: "Simone" }, { code: "CFOB", name: "Frank" }]; // orient
  if (si <= 5) return [{ code: "CEOB", name: "CarlOS" }, { code: "COOB", name: "Olivier" }, { code: "CTOB", name: "Tim" }, { code: "CFOB", name: "Frank" }]; // decide
  // act + resultat
  return [{ code: "CEOB", name: "CarlOS" }, { code: "COOB", name: "Olivier" }, { code: "CTOB", name: "Tim" }, { code: "CFOB", name: "Frank" }];
}

// =============================================
// MAIN COMPONENT
// =============================================

export function AtelierCrise({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
  const [showFactsChallenge, setShowFactsChallenge] = useState(false);
  const [showOptionsDebat, setShowOptionsDebat] = useState(false);
  const [showDirectiveChallenge, setShowDirectiveChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [alerteFilled, setAlerteFilled] = useState(false);
  const [factsFilled, setFactsFilled] = useState(false);
  const [optionsFilled, setOptionsFilled] = useState(false);
  const [directivesFilled, setDirectivesFilled] = useState(false);
  const [planFilled, setPlanFilled] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showFactsChallenge, showOptionsDebat, showDirectiveChallenge, showContreArgument, showSentinel]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => {
    setStage("intro");
    setTyped(false);
    setShowFactsChallenge(false);
    setShowOptionsDebat(false);
    setShowDirectiveChallenge(false);
    setShowContreArgument(false);
    setChallengeCount(0);
    setShowSentinel(false);
    setAlerteFilled(false);
    setFactsFilled(false);
    setOptionsFilled(false);
    setDirectivesFilled(false);
    setPlanFilled(false);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [alerteFilled, factsFilled, optionsFilled, directivesFilled, planFilled].filter(Boolean).length;

  // Discussion context changes per OODA phase
  const discussionContext =
    si <= 0 ? "CarlOS — Mode Crise" :
    si <= 2 ? "OODA — OBSERVER" :
    si <= 3 ? "OODA — ORIENTER" :
    si <= 5 ? "OODA — DECIDER" :
    si <= 6 ? "OODA — AGIR" :
    "OODA — Resultat";

  // Breadcrumb
  const breadcrumb = ["Direction", "Client Aeromax", "Crise — OODA Loop"];

  // Active bots for phase bar
  const activeBots = getActiveBots(stage);

  // =============================================
  // CHAT CONTENT
  // =============================================

  const chatContent = (
    <>
      {/* User alert message */}
      <div className="flex justify-end">
        <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
          <p className="text-sm text-blue-900">{CRISE_DATA.alertMessage}</p>
          <span className="text-[8px] text-blue-400 mt-1 block text-right">07:12</span>
        </div>
      </div>

      {/* Stage: intro — CEO message */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text={CRISE_DATA.observe.ceoMessage}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => { setAlerteFilled(true); goNext("observe-thinking"); }} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1 cursor-pointer">
                    <Zap className="h-3.5 w-3.5" /> Scanner la situation
                  </button>
                  <button onClick={() => setAlerteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire alerte
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mode Crise active — 48h, les faits bruts d'abord</p>}
        </SBubble>
      )}

      {/* Stage: observe-thinking — bounce dots + auto-advance */}
      {stage === "observe-thinking" && (
        <SBubble code="CEOB" collapsed={false}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-gray-500">Scan situation Aeromax en cours...</span>
          </div>
          <div className="mt-2 space-y-1">
            {CRISE_DATA.observe.thinking.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-500">
                <step.icon className="h-3.5 w-3.5 text-orange-400" />
                <span>{step.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          <AutoAdvance onComplete={() => goNext("observe")} delay={2500} />
        </SBubble>
      )}

      {/* Stage: observe — Facts bruts */}
      {si >= 2 && (
        <SBubble code="CEOB" collapsed={si > 2}>
          {si === 2 ? (
            <>
              <span className="text-[9px] font-bold text-orange-600 mb-1 block">OBSERVER — Faits bruts</span>
              <div className="space-y-1.5">
                {CRISE_DATA.observe.facts.map((f, i) => (
                  <div key={i} className={cn("flex items-center gap-2 p-1.5 rounded-lg text-[9px]",
                    f.severity === "critical" ? "bg-red-50" : f.severity === "warning" ? "bg-amber-50" : "bg-blue-50"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                      f.severity === "critical" ? "bg-red-500" : f.severity === "warning" ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <span className="text-gray-500">{f.label}</span>
                    <span className="font-bold text-gray-800 ml-auto">{f.value}</span>
                  </div>
                ))}
              </div>
              {!showFactsChallenge && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowFactsChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger l'analyse
                  </button>
                  <button onClick={() => { setFactsFilled(true); goNext("orient"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Orienter
                  </button>
                  <button onClick={() => setFactsFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire faits
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Faits bruts — 6 indicateurs, 3 critiques</p>}
        </SBubble>
      )}

      {/* Facts challenge — CSO */}
      {showFactsChallenge && (
        <SBubble code="CSOB" collapsed={si > 2}>
          {si === 2 ? (
            <>
              <span className="text-[9px] font-bold text-red-600 mb-1 block">Challenge — CSO</span>
              <p className="text-sm text-gray-700">{FACTS_CHALLENGE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setFactsFilled(true); goNext("orient"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Orienter
                </button>
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Challenge CSO — absence gestion de compte strategique</p>}
        </SBubble>
      )}

      {/* Stage: orient — Options */}
      {si >= 3 && (
        <SBubble code="CEOB" collapsed={si > 3}>
          {si === 3 ? (
            <>
              <span className="text-[9px] font-bold text-orange-600 mb-1 block">ORIENTER — Options</span>
              <p className="text-sm text-gray-700">{CRISE_DATA.orient.ceoMessage}</p>
              <div className="mt-2 space-y-1.5">
                {CRISE_DATA.orient.options.map((opt) => (
                  <div key={opt.num} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <p className="text-[9px] font-bold text-gray-800">Option {opt.num} : {opt.text}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{opt.consequence}</p>
                  </div>
                ))}
              </div>
              {!showOptionsDebat && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowOptionsDebat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1 cursor-pointer">
                    <Eye className="h-3.5 w-3.5" /> Debat CSO vs CFO
                  </button>
                  <button onClick={() => { setOptionsFilled(true); goNext("decide-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Decider
                  </button>
                  <button onClick={() => setOptionsFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire options
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">2 options — appeler maintenant ou plan ecrit d'abord</p>}
        </SBubble>
      )}

      {/* Options debat — CSO vs CFO */}
      {showOptionsDebat && (
        <>
          <SBubble code="CSOB" collapsed={si > 3}>
            {si === 3 ? (
              <>
                <span className="text-[9px] font-bold text-red-600 mb-1 block">Reponse CSO</span>
                <p className="text-sm text-gray-700">{OPTIONS_DEBATE.cso}</p>
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CSO — appeler d'abord = desescalade</p>}
          </SBubble>
          <SBubble code="CFOB" collapsed={si > 3}>
            {si === 3 ? (
              <>
                <span className="text-[9px] font-bold text-emerald-600 mb-1 block">Reponse CFO</span>
                <p className="text-sm text-gray-700">{OPTIONS_DEBATE.cfob}</p>
              </>
            ) : <p className="text-[9px] text-gray-400 italic">CFO — risque credibilite sans preparation</p>}
          </SBubble>
          {si === 3 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
              <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
              <p className="text-xs text-purple-700">{OPTIONS_DEBATE.consensus}</p>
            </div>
          )}
          {si === 3 && (
            <div className="flex gap-2 flex-wrap px-1 mt-1">
              <button onClick={() => { setOptionsFilled(true); goNext("decide-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> Decider
              </button>
            </div>
          )}
        </>
      )}

      {/* Stage: decide-thinking — bounce dots + auto-advance */}
      {stage === "decide-thinking" && (
        <SBubble code="CEOB" collapsed={false}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-gray-500">Preparation du plan de mobilisation...</span>
          </div>
          <div className="mt-2 space-y-1">
            {CRISE_DATA.decide.thinking.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-500">
                <step.icon className="h-3.5 w-3.5 text-orange-400" />
                <span>{step.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          <AutoAdvance onComplete={() => goNext("decide")} delay={2500} />
        </SBubble>
      )}

      {/* Stage: decide — Directives & assignments */}
      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          {si === 5 ? (
            <>
              <span className="text-[9px] font-bold text-orange-600 mb-1 block">DECIDER — Mobilisation</span>
              <p className="text-sm text-gray-700">{CRISE_DATA.decide.ceoDirective}</p>
              <div className="mt-1.5 space-y-1">
                {CRISE_DATA.decide.assignments.map((a, i) => {
                  const bot = BOT_COLORS[a.bot];
                  return (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 flex items-center gap-1.5">
                      <BotAvatar code={a.bot} size="sm" />
                      <span className="text-[9px] font-bold text-gray-700">{bot?.name || a.bot}</span>
                      <span className="text-[9px] text-gray-500 truncate flex-1">{a.task.substring(0, 60)}...</span>
                    </div>
                  );
                })}
              </div>
              {!showDirectiveChallenge && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowDirectiveChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la mobilisation
                  </button>
                  <button onClick={() => { setDirectivesFilled(true); goNext("act"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Plan correctif
                  </button>
                  <button onClick={() => setDirectivesFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire directives
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mobilisation — 4 departements, directives 1h</p>}
        </SBubble>
      )}

      {/* Directive challenge — COO */}
      {showDirectiveChallenge && (
        <SBubble code="COOB" collapsed={si > 5}>
          {si === 5 ? (
            <>
              <span className="text-[9px] font-bold text-orange-600 mb-1 block">Challenge — COO</span>
              <p className="text-sm text-gray-700">{DIRECTIVE_CHALLENGE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setDirectivesFilled(true); goNext("act"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Plan correctif
                </button>
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">COO — CFO peut attendre 24h, dilution energie</p>}
        </SBubble>
      )}

      {/* Sentinel anti-boucle */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 challenges — en mode crise, on debat moins et on agit plus. Le chrono tourne.</p>
        </div>
      )}

      {/* Stage: act — Plan correctif */}
      {si >= 6 && (
        <SBubble code="CEOB" collapsed={si > 6}>
          {si === 6 ? (
            <>
              <span className="text-[9px] font-bold text-orange-600 mb-1 block">AGIR — Plan correctif</span>
              <p className="text-sm text-gray-700">Plan correctif Aeromax pret. 4 sections : reconnaissance, actions immediates (0-72h), actions structurelles (0-30j), engagements de performance.</p>
              {!showContreArgument && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1 cursor-pointer">
                    <Eye className="h-3.5 w-3.5" /> Contre-argument
                  </button>
                  <button onClick={() => { setPlanFilled(true); goNext("resultat"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Resultat
                  </button>
                  <button onClick={() => setPlanFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire plan
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Plan correctif 4 sections pret</p>}
        </SBubble>
      )}

      {/* Contre-argument — CFO */}
      {showContreArgument && (
        <SBubble code="CFOB" collapsed={si > 6}>
          {si === 6 ? (
            <>
              <span className="text-[9px] font-bold text-emerald-600 mb-1 block">Contre-argument — CFO</span>
              <p className="text-sm text-gray-700">{CONTRE_ARGUMENT}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setPlanFilled(true); goNext("resultat"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Resultat
                </button>
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">CFO — plan offensif = levier de negociation pour Aeromax</p>}
        </SBubble>
      )}

      {/* Stage: resultat */}
      {stage === "resultat" && (
        <SBubble code="CEOB" collapsed={false}>
          <div className="space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Crise contenue</p>
            </div>
            <TypewriterText
              text={CRISE_DATA.act.resultat}
              speed={10}
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
                <Send className="h-3.5 w-3.5" /> Envoyer au client
              </button>
            </div>
          )}
        </SBubble>
      )}
    </>
  );

  // =============================================
  // RIGHT PANEL — ATELIER CONTENT (DocForge 5 sections)
  // =============================================

  const atelierContent = (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      {/* Document header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-bold text-red-900">Rapport de Crise — OODA Loop</h3>
          <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold ml-auto flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> 48h
          </span>
        </div>
        <p className="text-xs text-red-700 mb-3">{CRISE_DATA.titre}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-red-200/50 rounded-full h-2 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-red-700">{filledCount}/5</span>
        </div>
      </div>

      {/* Section 1 — Alerte */}
      <DocSectionCard num={1} title="Alerte & Contexte" filled={alerteFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
            <p className="text-[9px] font-bold text-red-800 uppercase mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Alerte critique</p>
            <p className="text-[9px] text-red-700">{CRISE_DATA.contexte}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-amber-600 font-bold">CA a risque</p>
              <p className="text-sm font-bold text-amber-800">3M$/an</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-red-600 font-bold">Delai</p>
              <p className="text-sm font-bold text-red-800">48h</p>
            </div>
          </div>
        </div>
      </DocSectionCard>

      {/* Section 2 — Faits bruts */}
      <DocSectionCard num={2} title="Faits Bruts — OBSERVER" filled={factsFilled}>
        <div className="pt-2 space-y-1.5">
          {CRISE_DATA.observe.facts.map((f, i) => {
            const sev = f.severity === "critical" ? "red" : f.severity === "warning" ? "amber" : "blue";
            return (
              <div key={i} className={cn("flex items-center justify-between p-1.5 rounded-lg", `bg-${sev}-50`)}>
                <span className="text-[9px] text-gray-600">{f.label}</span>
                <span className={cn("text-[9px] font-bold", `text-${sev}-800`)}>{f.value}</span>
              </div>
            );
          })}
          {showFactsChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1">
              <p className="text-[9px] font-bold text-amber-800">Challenge CSO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Vrai signal = 4 mois sans contact positif. Absence de gestion de compte strategique.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 3 — Options */}
      <DocSectionCard num={3} title="Analyse & Options — ORIENTER" filled={optionsFilled}>
        <div className="pt-2 space-y-1.5">
          {CRISE_DATA.orient.options.map((opt) => (
            <div key={opt.num} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-gray-800">Option {opt.num}</p>
              <p className="text-[9px] text-gray-700">{opt.text}</p>
              <p className="text-[9px] text-gray-500 mt-0.5 italic">{opt.consequence}</p>
            </div>
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-[9px] font-bold text-blue-800">Decision</p>
            <p className="text-[9px] text-blue-700">Les DEUX — appel en 30min + plan ecrit en 4h</p>
          </div>
          {showOptionsDebat && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-purple-800">Consensus</p>
              <p className="text-[9px] text-purple-700 mt-0.5">Appel rapide AVEC 30min de preparation minimum.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 4 — Directives */}
      <DocSectionCard num={4} title="Mobilisation — DECIDER" filled={directivesFilled}>
        <div className="pt-2 space-y-1.5">
          {CRISE_DATA.decide.assignments.map((a, i) => {
            const bot = BOT_COLORS[a.bot];
            return (
              <div key={i} className="border border-gray-200 rounded-lg p-2 border-l-[3px]" style={{ borderLeftColor: bot?.hex || "#888" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-bold text-gray-800">{bot?.name || a.bot} — {a.role}</span>
                </div>
                <p className="text-[9px] text-gray-700">{a.task}</p>
              </div>
            );
          })}
          {showDirectiveChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge COO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">CFO peut attendre 24h pour le credit qualite. 4 departements simultanes = dilution de l'energie.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 5 — Plan correctif & Resultat */}
      <DocSectionCard num={5} title="Plan Correctif & Resultat — AGIR" filled={planFilled}>
        <div className="pt-2 space-y-2">
          {CRISE_DATA.act.planCorrectif.sections.map((sec) => (
            <div key={sec.num} className="border border-gray-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-gray-800 flex items-center gap-1">
                <span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-[8px] font-bold">{sec.num}</span>
                {sec.titre}
              </p>
              {"contenu" in sec && <p className="text-[9px] text-gray-700 mt-0.5">{sec.contenu}</p>}
              {"items" in sec && sec.items && (
                <ul className="mt-1 space-y-0.5">
                  {sec.items.map((item, j) => (
                    <li key={j} className="text-[9px] text-gray-700 flex items-start gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <p className="text-[9px] font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Resultat</p>
            <p className="text-[9px] text-emerald-700 mt-0.5">{CRISE_DATA.act.resultat}</p>
          </div>
          {showContreArgument && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-red-800">Contre-argument CFO</p>
              <p className="text-[9px] text-red-700 mt-0.5">Plan offensif = aveu de faiblesse. Risque de levier pour Aeromax dans ses negoces avec PrecisionTech.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Empty state */}
      {filledCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Zap className="h-10 w-10 text-orange-300" />
          <p className="text-xs">Le document se construira au fil de la gestion de crise...</p>
          <p className="text-[9px]">{"OODA : Observer > Orienter > Decider > Agir"}</p>
        </div>
      )}
    </div>
  );

  // =============================================
  // ROOT LAYOUT — SELF-CONTAINED (SimPhaseReflexion pattern)
  // =============================================

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Zap className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-bold text-gray-800">Mode Crise</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-orange-500" : i < si ? "w-2 bg-orange-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line (orange for Crise) */}
      <div className="h-1 shrink-0 bg-orange-500" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header — UB_BLUE */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar + bot avatars */}
          <div className="shrink-0 border-b px-3 py-1.5 flex items-center gap-2 bg-orange-50 border-orange-200">
            {/* Active bot avatars LEFT */}
            {activeBots.length > 0 && (
              <div className="flex items-center gap-1.5">
                {activeBots.map(b => (
                  <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                    <BotAvatar code={b.code} size="sm" />
                    <span className="text-[8px] font-medium text-gray-600">{b.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
            {/* Phase badges RIGHT */}
            <div className="flex gap-1 ml-auto">
              {(["reflexion", "atelier", "command"] as Phase[]).map(p => (
                <span key={p} className={cn(
                  "px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-1 transition-all",
                  "bg-gray-100 text-gray-400"
                )}>
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
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
          <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
            {DEPT_SUBTABS.map((tab, i) => (
              <button key={tab} className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                i === 3 ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}>
                {tab}
              </button>
            ))}
          </div>

          {/* Breadcrumb */}
          <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 flex items-center gap-1.5">
            {breadcrumb.map((c, i, arr) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                <span className={cn("text-[11px]", i === arr.length - 1 ? "text-gray-800 font-medium" : "text-gray-400 hover:text-gray-600 cursor-pointer")}>{c}</span>
              </div>
            ))}
          </div>

          {/* Right panel content */}
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            {atelierContent}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// DOC SECTION CARD
// =============================================

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

// =============================================
// HELPER COMPONENTS
// =============================================

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
