/**
 * AtelierDebat.tsx — Atelier split-screen "Mode Debat" V2
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: Document debat qui se batit progressivement (5 sections) — pattern DocForge
 * Data: DEBAT_DATA (debat-data.ts)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Swords,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  MessageSquare,
  AlertTriangle,
  Trophy,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Target,
  Download,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
  SourcesList,
} from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { DEBAT_DATA } from "../../scenarios/debat-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage =
  | "intro"
  | "thinking"
  | "round1"
  | "round2"
  | "round3"
  | "verdict-thinking"
  | "verdict"
  | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, round1: 2, round2: 3,
  round3: 4, "verdict-thinking": 5, verdict: 6, conclusion: 7,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Preparation...", round1: "Round 1 — Finances",
  round2: "Round 2 — Risques", round3: "Round 3 — Vision",
  "verdict-thinking": "Deliberation...", verdict: "Verdict", conclusion: "Conclusion",
};

// ========== CHALLENGE DATA ==========

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

export function AtelierDebat({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
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

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowRound1Challenge(false); setShowRound2Debat(false);
    setShowRound3Challenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setPositionFilled(false); setRound1Filled(false);
    setRound2Filled(false); setRound3Filled(false); setVerdictFilled(false);
  };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [positionFilled, round1Filled, round2Filled, round3Filled, verdictFilled].filter(Boolean).length;

  // ========== CHAT CONTENT (LEFT) ==========
  const chatContent = (
    <>
      {/* User tension */}
      <UserBubble text={DEBAT_DATA.userTension} time="14:32" />

      {/* CEO intro */}
      {stage === "intro" && (
        <BotBubble code="CEOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text={DEBAT_DATA.ceoIntro}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => { setPositionFilled(true); setStage("thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Lancer le debat
              </button>
              <button onClick={() => setPositionFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire position
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble code="CEOB" text={DEBAT_DATA.ceoIntro} phaseLabel="Connecter" time="14:32" />
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <ThinkingAnimation
          steps={DEBAT_DATA.ceoThinking}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("round1")}
        />
      )}

      {/* === ROUND 1 — Impact financier === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["round1"] && (
        <>
          {/* CRO POUR */}
          <BotBubble code="CROB" text="" phaseLabel="Round 1 — POUR l'ERP" time="14:33">
            <p className="text-sm text-gray-800">{DEBAT_DATA.round1.pour.argument}</p>
            <SourcesList sources={DEBAT_DATA.round1.pour.sources} />
            {stage === "round1" && !showRound1Challenge && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => handleChallenge(setShowRound1Challenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                  <ShieldQuestion className="h-3.5 w-3.5" /> Challenger les chiffres
                </button>
                <button onClick={() => { setRound1Filled(true); setStage("round2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Round 2
                </button>
                <button onClick={() => setRound1Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Extraire round 1
                </button>
              </div>
            )}
          </BotBubble>

          {/* CFO CONTRE */}
          <BotBubble code="CFOB" text="" phaseLabel="Round 1 — CONTRE l'ERP" time="14:33">
            <p className="text-sm text-gray-800">{DEBAT_DATA.round1.contre.argument}</p>
            <SourcesList sources={DEBAT_DATA.round1.contre.sources} />
          </BotBubble>

          {/* Round 1 Challenge */}
          {showRound1Challenge && (
            <BotBubble code="COOB" text="" phaseLabel="Challenge — Operationnel" time="14:34">
              <p className="text-sm text-gray-800">{ROUND1_CHALLENGE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setRound1Filled(true); setStage("round2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Round 2
                </button>
              </div>
            </BotBubble>
          )}
        </>
      )}

      {/* === ROUND 2 — Risque operationnel === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["round2"] && (
        <>
          {/* CRO POUR */}
          <BotBubble code="CROB" text="" phaseLabel="Round 2 — POUR l'ERP" time="14:34">
            <p className="text-sm text-gray-800">{DEBAT_DATA.round2.pour.argument}</p>
            <SourcesList sources={DEBAT_DATA.round2.pour.sources} />
            {stage === "round2" && !showRound2Debat && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => handleChallenge(setShowRound2Debat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Debat CRO vs CFO
                </button>
                <button onClick={() => { setRound2Filled(true); setStage("round3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Round 3
                </button>
                <button onClick={() => setRound2Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Extraire round 2
                </button>
              </div>
            )}
          </BotBubble>

          {/* CFO CONTRE */}
          <BotBubble code="CFOB" text="" phaseLabel="Round 2 — CONTRE l'ERP" time="14:34">
            <p className="text-sm text-gray-800">{DEBAT_DATA.round2.contre.argument}</p>
            <SourcesList sources={DEBAT_DATA.round2.contre.sources} />
          </BotBubble>

          {/* Round 2 Debate */}
          {showRound2Debat && (
            <>
              <BotBubble code="CROB" text="" phaseLabel="Reponse CRO" time="14:35">
                <p className="text-sm text-gray-800">{ROUND2_DEBATE.cro}</p>
              </BotBubble>
              <BotBubble code="CFOB" text="" phaseLabel="Reponse CFO" time="14:35">
                <p className="text-sm text-gray-800">{ROUND2_DEBATE.cfo}</p>
              </BotBubble>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
                <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
                <p className="text-xs text-purple-700">{ROUND2_DEBATE.consensus}</p>
              </div>
              <div className="flex gap-2 flex-wrap px-1 mt-1">
                <button onClick={() => { setRound2Filled(true); setStage("round3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Round 3
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* === ROUND 3 — Vision strategique === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["round3"] && (
        <>
          {/* CRO POUR */}
          <BotBubble code="CROB" text="" phaseLabel="Round 3 — POUR l'ERP" time="14:35">
            <p className="text-sm text-gray-800">{DEBAT_DATA.round3.pour.argument}</p>
            <SourcesList sources={DEBAT_DATA.round3.pour.sources} />
            {stage === "round3" && !showRound3Challenge && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => handleChallenge(setShowRound3Challenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                  <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la vision
                </button>
                <button onClick={() => { setRound3Filled(true); setStage("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Verdict final
                </button>
                <button onClick={() => setRound3Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Extraire round 3
                </button>
              </div>
            )}
          </BotBubble>

          {/* CFO CONTRE */}
          <BotBubble code="CFOB" text="" phaseLabel="Round 3 — CONTRE l'ERP" time="14:35">
            <p className="text-sm text-gray-800">{DEBAT_DATA.round3.contre.argument}</p>
            <SourcesList sources={DEBAT_DATA.round3.contre.sources} />
          </BotBubble>

          {/* Round 3 Challenge */}
          {showRound3Challenge && (
            <BotBubble code="CTOB" text="" phaseLabel="Challenge — CTO" time="14:36">
              <p className="text-sm text-gray-800">{ROUND3_CHALLENGE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setRound3Filled(true); setStage("verdict-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Verdict final
                </button>
              </div>
            </BotBubble>
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
        <ThinkingAnimation
          steps={DEBAT_DATA.verdictThinking}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("verdict")}
        />
      )}

      {/* === VERDICT === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["verdict"] && (
        <>
          <BotBubble code="CEOB" text="" phaseLabel="Verdict — CEO" time="14:37">
            <div className="space-y-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> Gagnant : {DEBAT_DATA.verdict.winner}</p>
                <p className="text-xs text-emerald-700 mt-0.5">{DEBAT_DATA.verdict.recommendation}</p>
              </div>
              <p className="text-sm text-gray-800">{DEBAT_DATA.verdict.conclusion}</p>
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

          {/* Contre-argument */}
          {showContreArgument && (
            <BotBubble code="CSOB" text="" phaseLabel="Contre-argument — Strategiste" time="14:37">
              <p className="text-sm text-gray-800">{CONTRE_ARGUMENT}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setVerdictFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Conclure
                </button>
              </div>
            </BotBubble>
          )}
        </>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <BotBubble code="CEOB" text="" phaseLabel="Obtenir" time="14:38">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Debat clos. Document complet.</p>
            <p className="text-xs text-gray-600">Le rapport de debat est pret — 3 rounds analyses, verdict rendu avec plan d'action en 3 phases. Exporte ou utilise comme base pour le Board Room.</p>
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

  return (
    <AtelierLayout
      title="Mode Debat"
      icon={Swords}
      iconColor="text-amber-600"
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

// ========== RICH CARDS ==========

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
