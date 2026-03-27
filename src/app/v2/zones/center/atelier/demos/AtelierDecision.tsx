/**
 * AtelierDecision.tsx — Atelier split-screen "Mode Decision" V2
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: Document decision qui se batit progressivement (5 sections) — pattern DocForge
 * Data: DECISION_DATA (decision-data.ts)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Scale,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  MessageSquare,
  AlertTriangle,
  Target,
  Users,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  Download,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
  BotAvatar,
} from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { DECISION_DATA, type DecisionCriteria, type StakeholderImpact as StakeholderImpactType } from "../../scenarios/decision-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage =
  | "intro"
  | "thinking"
  | "matrice"
  | "stakeholders"
  | "scenarios"
  | "verdict-thinking"
  | "verdict"
  | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, matrice: 2, stakeholders: 3,
  scenarios: 4, "verdict-thinking": 5, verdict: 6, conclusion: 7,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Analyse...", matrice: "Matrice ponderee",
  stakeholders: "Stakeholders", scenarios: "Scenarios",
  "verdict-thinking": "Deliberation...", verdict: "Verdict", conclusion: "Conclusion",
};

// ========== CHALLENGE DATA ==========

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

// ========== DOC SECTION CARD ==========

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

// ========== MAIN COMPONENT ==========

export function AtelierDecision({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
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

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowMatriceChallenge(false); setShowStakeholderDebat(false);
    setShowScenarioChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setContexteFilled(false); setMatriceFilled(false);
    setStakeholdersFilled(false); setScenariosFilled(false); setVerdictFilled(false);
  };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [contexteFilled, matriceFilled, stakeholdersFilled, scenariosFilled, verdictFilled].filter(Boolean).length;

  // ========== CHAT CONTENT (LEFT) ==========
  const chatContent = (
    <>
      <UserBubble text={DECISION_DATA.userTension} time="09:15" />

      {/* CEO intro */}
      {stage === "intro" && (
        <BotBubble code="CEOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text={DECISION_DATA.ceoIntro}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => { setContexteFilled(true); setStage("thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Lancer l'analyse
              </button>
              <button onClick={() => setContexteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire contexte
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble code="CEOB" text={DECISION_DATA.ceoIntro} phaseLabel="Connecter" time="09:15" />
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <ThinkingAnimation
          steps={DECISION_DATA.setupThinking}
          botEmoji="🎯"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("matrice")}
        />
      )}

      {/* === MATRICE === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["matrice"] && (
        <BotBubble code="CFOB" text="" phaseLabel="Rechercher — Matrice" time="09:16">
          <p className="text-sm text-gray-800">J'ai evalue chaque critere avec un score pour et contre. L'aspect financier est le plus preoccupant — on epuise 100% de la tresorerie. Le risque est reel.</p>
          <div className="mt-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2">
            <p className="text-[9px] font-bold text-slate-600">6 criteres ponderes — Score GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreFor, 0)} vs NO-GO: {DECISION_DATA.criteres.reduce((s, c) => s + c.weight * c.scoreAgainst, 0)}</p>
          </div>
          {stage === "matrice" && !showMatriceChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowMatriceChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la ponderation
              </button>
              <button onClick={() => { setMatriceFilled(true); setStage("stakeholders"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Stakeholders
              </button>
              <button onClick={() => setMatriceFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire matrice
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showMatriceChallenge && (
        <BotBubble code="CROB" text="" phaseLabel="Challenge — CRO" time="09:16">
          <p className="text-sm text-gray-800">{MATRICE_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setMatriceFilled(true); setStage("stakeholders"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Stakeholders
            </button>
          </div>
        </BotBubble>
      )}

      {/* === STAKEHOLDERS === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["stakeholders"] && (
        <BotBubble code="CSOB" text="" phaseLabel="Exposer — Impact" time="09:17">
          <p className="text-sm text-gray-800">Strategiquement, c'est une opportunite rare. Eliminer un concurrent + absorber 35 clients = position dominante. Mais le prix doit etre negocie — 1.2M$ cash est trop agressif.</p>
          <div className="mt-1.5 bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-[9px] font-bold text-blue-700">{DECISION_DATA.stakeholders.length} parties prenantes analysees — {DECISION_DATA.stakeholders.filter(s => s.impact === "positif").length} positifs, {DECISION_DATA.stakeholders.filter(s => s.impact === "negatif").length} negatifs</p>
          </div>
          {stage === "stakeholders" && !showStakeholderDebat && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowStakeholderDebat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Debat CSO vs CFO
              </button>
              <button onClick={() => { setStakeholdersFilled(true); setStage("scenarios"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Scenarios
              </button>
              <button onClick={() => setStakeholdersFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire stakeholders
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showStakeholderDebat && (
        <>
          <BotBubble code="CSOB" text="" phaseLabel="Reponse CSO" time="09:17">
            <p className="text-sm text-gray-800">{STAKEHOLDER_DEBATE.cso}</p>
          </BotBubble>
          <BotBubble code="CFOB" text="" phaseLabel="Reponse CFO" time="09:17">
            <p className="text-sm text-gray-800">{STAKEHOLDER_DEBATE.cfob}</p>
          </BotBubble>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
            <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
            <p className="text-xs text-purple-700">{STAKEHOLDER_DEBATE.consensus}</p>
          </div>
          <div className="flex gap-2 flex-wrap px-1 mt-1">
            <button onClick={() => { setStakeholdersFilled(true); setStage("scenarios"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Scenarios
            </button>
          </div>
        </>
      )}

      {/* === SCENARIOS === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["scenarios"] && (
        <BotBubble code="CROB" text="" phaseLabel="Demontrer — Scenarios" time="09:18">
          <p className="text-sm text-gray-800">Le scenario le plus probable (45%) est un GO negocie a 850K$ + earn-out. Ca preserve la tresorerie tout en captant la valeur. J'ai modele 4 scenarios avec leurs probabilites.</p>
          {stage === "scenarios" && !showScenarioChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowScenarioChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger le cherry-pick
              </button>
              <button onClick={() => { setScenariosFilled(true); setStage("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Verdict final
              </button>
              <button onClick={() => setScenariosFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire scenarios
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showScenarioChallenge && (
        <BotBubble code="COOB" text="" phaseLabel="Challenge — COO" time="09:18">
          <p className="text-sm text-gray-800">{SCENARIO_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setScenariosFilled(true); setStage("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Verdict final
            </button>
          </div>
        </BotBubble>
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
        <ThinkingAnimation
          steps={DECISION_DATA.verdictThinking}
          botEmoji="🎯"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("verdict")}
        />
      )}

      {/* === VERDICT === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["verdict"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Verdict — CEO" time="09:20">
          <div className="space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {DECISION_DATA.verdict.decision}</p>
              <p className="text-xs text-emerald-700 mt-0.5">{DECISION_DATA.verdict.condition}</p>
            </div>
            <p className="text-sm text-gray-800">{DECISION_DATA.verdict.recommandation}</p>
          </div>
          {stage === "verdict" && !showContreArgument && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Contre-argument
              </button>
              <button onClick={() => { setVerdictFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Conclure
              </button>
              <button onClick={() => setVerdictFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire verdict
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showContreArgument && (
        <BotBubble code="CFOB" text="" phaseLabel="Contre-argument — CFO" time="09:20">
          <p className="text-sm text-gray-800">{CONTRE_ARGUMENT}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setVerdictFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Conclure
            </button>
          </div>
        </BotBubble>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <BotBubble code="CEOB" text="" phaseLabel="Obtenir" time="09:21">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Decision prise. Document complet.</p>
            <p className="text-xs text-gray-600">Matrice ponderee, impact stakeholders, 4 scenarios et verdict GO CONDITIONNEL documentes. 5 prochaines etapes assignees.</p>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Exporter PDF
            </button>
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1">
              <Send className="h-3.5 w-3.5" /> Envoyer au Board Room
            </button>
          </div>
        </BotBubble>
      )}
    </>
  );

  // ========== DOCUMENT CONTENT (RIGHT) ==========
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

  return (
    <AtelierLayout
      title="Mode Decision"
      icon={Scale}
      iconColor="text-slate-600"
      stage={STAGE_INDEX[stage]}
      stageCount={8}
      stageLabel={STAGE_LABELS[stage]}
      onBack={onBack}
      onReset={handleReset}
      chatContent={chatContent}
      atelierContent={atelierContent}
      actions={[]}
    />
  );
}
