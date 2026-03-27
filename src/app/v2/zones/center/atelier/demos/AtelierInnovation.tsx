/**
 * AtelierInnovation.tsx — Atelier split-screen "Mode Innovation" V2
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: Document innovation qui se batit progressivement (5 sections) — pattern DocForge
 * Data: INNOVATION_DATA (innovation-data.ts)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Sparkles,
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
  Lightbulb,
  Shuffle,
  Leaf,
  BarChart3,
  TrendingUp,
  Layers,
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
import { INNOVATION_DATA } from "../../scenarios/innovation-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage =
  | "intro"
  | "thinking"
  | "technique1"
  | "technique2"
  | "technique3"
  | "faisabilite-thinking"
  | "faisabilite"
  | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, technique1: 2, technique2: 3,
  technique3: 4, "faisabilite-thinking": 5, faisabilite: 6, conclusion: 7,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Reflexion...", technique1: "Analogie",
  technique2: "Inversion", technique3: "Biomimetisme",
  "faisabilite-thinking": "Evaluation...", faisabilite: "Modele Hybride", conclusion: "Conclusion",
};

// ========== CHALLENGE DATA ==========

const ANALOGIE_CHALLENGE =
  "3.6M$/an de revenus recurrents sur 200 equipements? C'est seduisant mais irealiste a court terme. Deployer des capteurs IoT sur 200 machines = 18-24 mois minimum. Et le taux d'adoption des contrats predictifs en PME manufacturiere est de 15-20%, pas 100%. Budget reel Phase 1 : 60-80 equipements max, soit 1.1-1.4M$/an.";

const INVERSION_DEBATE = {
  cmob: "L'Equipment-as-a-Service est la tendance lourde. Hilti, Xerox, meme Rolls-Royce ont prouve le modele. Le client ne veut plus posseder — il veut un resultat. 45$/h de production, zero CAPEX pour lui. C'est irresistible.",
  cfob: "Irresistible pour le client, catastrophique pour notre bilan. On passe de vendre un equipement a 250K$ cash a le financer nous-memes. Il faut 5,500 heures de production pour atteindre le breakeven par machine. Si le client utilise moins que prevu? On absorbe la perte. Et on immobilise du capital pendant 5+ ans.",
  consensus: "Le modele EaaS a du potentiel enorme mais necessite un financement structurel (partenaire financier ou dette). Commencer par 5 machines pilotes max pour valider le modele avant de scaler.",
};

const BIOMIMETISME_CHALLENGE =
  "La maintenance distribuee suppose que les operateurs du client VEULENT apprendre. En realite, 60% des operateurs en usine considerent la maintenance comme 'pas leur job'. La formation de 2 jours ne changera pas une culture. Il faut un programme d'incitation (bonus, certifications reconnues) et un sponsor cote management client.";

const CONTRE_ARGUMENT =
  "Le modele hybride en 3 phases est elegant sur papier, mais chaque phase depend du succes de la precedente. Si la Phase 1 (formation) genere moins de 200K$ — et c'est probable vu les taux d'adoption reels — la Phase 2 (IoT) manque de budget. On construit un chateau de cartes. Mieux : lancer Phase 1 ET Phase 2 en parallele avec des budgets independants.";

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

export function AtelierInnovation({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
  const [showAnalogieChallenge, setShowAnalogieChallenge] = useState(false);
  const [showInversionDebat, setShowInversionDebat] = useState(false);
  const [showBiomimetismeChallenge, setShowBiomimetismeChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [contexteFilled, setContexteFilled] = useState(false);
  const [analogieFilled, setAnalogieFilled] = useState(false);
  const [inversionFilled, setInversionFilled] = useState(false);
  const [biomimetismeFilled, setBiomimetismeFilled] = useState(false);
  const [modeleFilled, setModeleFilled] = useState(false);

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowAnalogieChallenge(false); setShowInversionDebat(false);
    setShowBiomimetismeChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setContexteFilled(false); setAnalogieFilled(false);
    setInversionFilled(false); setBiomimetismeFilled(false); setModeleFilled(false);
  };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [contexteFilled, analogieFilled, inversionFilled, biomimetismeFilled, modeleFilled].filter(Boolean).length;

  // ========== CHAT CONTENT (LEFT) ==========
  const chatContent = (
    <>
      <UserBubble text={INNOVATION_DATA.userTension} time="15:10" />

      {/* CEO intro */}
      {stage === "intro" && (
        <BotBubble code="CEOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text={INNOVATION_DATA.ceoIntro}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => { setContexteFilled(true); setStage("thinking"); }} className="text-[9px] px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full hover:bg-pink-100 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Lancer l'innovation
              </button>
              <button onClick={() => setContexteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire contexte
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble code="CEOB" text={INNOVATION_DATA.ceoIntro} phaseLabel="Connecter" time="15:10" />
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <ThinkingAnimation
          steps={INNOVATION_DATA.ceoThinking}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("technique1")}
        />
      )}

      {/* === TECHNIQUE 1 — Analogie (CTO) === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["technique1"] && (
        <BotBubble code="CTOB" text="" phaseLabel="Technique 1 — Analogie" time="15:12">
          <p className="text-sm text-gray-800">{INNOVATION_DATA.technique1.botProposal}</p>
          <SourcesList sources={INNOVATION_DATA.technique1.sources} />
          {stage === "technique1" && !showAnalogieChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowAnalogieChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger les chiffres
              </button>
              <button onClick={() => { setAnalogieFilled(true); setStage("technique2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Technique 2
              </button>
              <button onClick={() => setAnalogieFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire technique
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showAnalogieChallenge && (
        <BotBubble code="CFOB" text="" phaseLabel="Challenge — CFO" time="15:12">
          <p className="text-sm text-gray-800">{ANALOGIE_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setAnalogieFilled(true); setStage("technique2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Technique 2
            </button>
          </div>
        </BotBubble>
      )}

      {/* === TECHNIQUE 2 — Inversion (CMO) === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["technique2"] && (
        <BotBubble code="CMOB" text="" phaseLabel="Technique 2 — Inversion" time="15:14">
          <p className="text-sm text-gray-800">{INNOVATION_DATA.technique2.botProposal}</p>
          <SourcesList sources={INNOVATION_DATA.technique2.sources} />
          {stage === "technique2" && !showInversionDebat && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowInversionDebat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Debat CMO vs CFO
              </button>
              <button onClick={() => { setInversionFilled(true); setStage("technique3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Technique 3
              </button>
              <button onClick={() => setInversionFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire technique
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showInversionDebat && (
        <>
          <BotBubble code="CMOB" text="" phaseLabel="Reponse CMO" time="15:14">
            <p className="text-sm text-gray-800">{INVERSION_DEBATE.cmob}</p>
          </BotBubble>
          <BotBubble code="CFOB" text="" phaseLabel="Reponse CFO" time="15:15">
            <p className="text-sm text-gray-800">{INVERSION_DEBATE.cfob}</p>
          </BotBubble>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
            <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
            <p className="text-xs text-purple-700">{INVERSION_DEBATE.consensus}</p>
          </div>
          <div className="flex gap-2 flex-wrap px-1 mt-1">
            <button onClick={() => { setInversionFilled(true); setStage("technique3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Technique 3
            </button>
          </div>
        </>
      )}

      {/* === TECHNIQUE 3 — Biomimetisme (COO) === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["technique3"] && (
        <BotBubble code="COOB" text="" phaseLabel="Technique 3 — Biomimetisme" time="15:16">
          <p className="text-sm text-gray-800">{INNOVATION_DATA.technique3.botProposal}</p>
          <SourcesList sources={INNOVATION_DATA.technique3.sources} />
          {stage === "technique3" && !showBiomimetismeChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowBiomimetismeChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger l'adoption
              </button>
              <button onClick={() => { setBiomimetismeFilled(true); setStage("faisabilite-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Evaluer & Fusionner
              </button>
              <button onClick={() => setBiomimetismeFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire technique
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showBiomimetismeChallenge && (
        <BotBubble code="CHROB" text="" phaseLabel="Challenge — CHRO" time="15:16">
          <p className="text-sm text-gray-800">{BIOMIMETISME_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setBiomimetismeFilled(true); setStage("faisabilite-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Evaluer & Fusionner
            </button>
          </div>
        </BotBubble>
      )}

      {/* Sentinel */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 challenges — les 3 techniques sont posees. C'est l'heure de fusionner.</p>
        </div>
      )}

      {/* Faisabilite thinking */}
      {stage === "faisabilite-thinking" && (
        <ThinkingAnimation
          steps={INNOVATION_DATA.syntheseThinking}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("faisabilite")}
        />
      )}

      {/* === SYNTHESE === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["faisabilite"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Modele Hybride" time="15:18">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">{INNOVATION_DATA.synthese.titre}</p>
            <p className="text-sm text-gray-800">{INNOVATION_DATA.synthese.recommendation}</p>
          </div>
          {stage === "faisabilite" && !showContreArgument && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Contre-argument
              </button>
              <button onClick={() => { setModeleFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Conclure
              </button>
              <button onClick={() => setModeleFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire modele
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showContreArgument && (
        <BotBubble code="CFOB" text="" phaseLabel="Contre-argument — CFO" time="15:18">
          <p className="text-sm text-gray-800">{CONTRE_ARGUMENT}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setModeleFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Conclure
            </button>
          </div>
        </BotBubble>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <BotBubble code="CEOB" text="" phaseLabel="Obtenir" time="15:19">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Innovation documentee.</p>
            <p className="text-xs text-gray-600">{INNOVATION_DATA.synthese.conclusion}</p>
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
      <div className="bg-gradient-to-r from-pink-50 to-fuchsia-50 border border-pink-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-pink-600" />
          <h3 className="text-sm font-bold text-pink-900">Rapport Innovation — 3 Techniques Laterales</h3>
        </div>
        <p className="text-xs text-pink-700 mb-3">{INNOVATION_DATA.titre}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-pink-200/50 rounded-full h-2 overflow-hidden">
            <div className="bg-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-pink-700">{filledCount}/5</span>
        </div>
      </div>

      {/* Section 1 — Contexte */}
      <DocSectionCard num={1} title="Contexte & Problematique" filled={contexteFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-700">{INNOVATION_DATA.contexte}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-red-600 font-bold">Revenus SAV</p>
              <p className="text-sm font-bold text-red-800">2M$</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-amber-600 font-bold">Cout SAV</p>
              <p className="text-sm font-bold text-amber-800">2.4M$</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-gray-600 font-bold">Deficit</p>
              <p className="text-sm font-bold text-gray-800">-400K$</p>
            </div>
          </div>
        </div>
      </DocSectionCard>

      {/* Section 2 — Analogie */}
      <DocSectionCard num={2} title="Technique 1 — Analogie (IoT Predictif)" filled={analogieFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-fuchsia-600" />
              <span className="text-[9px] font-bold text-fuchsia-800">CTO Tim — Abonnement Zero-Panne</span>
            </div>
            <p className="text-[9px] text-fuchsia-700">Capteurs IoT + algorithme predictif → contrats 1,500$/mois par equipement. Potentiel: 3.6M$/an sur 200 machines.</p>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-gray-500">Impact:</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-fuchsia-400 h-full rounded-full" style={{ width: "92%" }} /></div>
            <span className="font-bold text-fuchsia-700">92%</span>
          </div>
          {showAnalogieChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge CFO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Realiste: 60-80 machines max en Phase 1 = 1.1-1.4M$/an.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 3 — Inversion */}
      <DocSectionCard num={3} title="Technique 2 — Inversion (EaaS)" filled={inversionFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Shuffle className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-[9px] font-bold text-orange-800">CMO Mathilde — Performance-as-a-Service</span>
            </div>
            <p className="text-[9px] text-orange-700">Client paie 45$/h de production, zero CAPEX. Uptime 95% garanti. Potentiel: 3.9M$/an sur 10 machines.</p>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-gray-500">Originalite:</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-orange-400 h-full rounded-full" style={{ width: "95%" }} /></div>
            <span className="font-bold text-orange-700">95%</span>
          </div>
          {showInversionDebat && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-purple-800">Consensus</p>
              <p className="text-[9px] text-purple-700 mt-0.5">Potentiel enorme mais 5 machines pilotes max d'abord. Financement structurel requis.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 4 — Biomimetisme */}
      <DocSectionCard num={4} title="Technique 3 — Biomimetisme (Distribuee)" filled={biomimetismeFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Leaf className="h-3.5 w-3.5 text-green-600" />
              <span className="text-[9px] font-bold text-green-800">COO Olivier — Operateur Certifie 3 niveaux</span>
            </div>
            <p className="text-[9px] text-green-700">Operateurs font N1/N2, techniciens = N3 haute valeur. Interventions: 800→300 mais a 2,200$/int + 400K$ formations.</p>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-gray-500">Faisabilite:</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-green-400 h-full rounded-full" style={{ width: "90%" }} /></div>
            <span className="font-bold text-green-700">90%</span>
          </div>
          {showBiomimetismeChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge CHRO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">60% des operateurs voient maintenance = 'pas mon job'. Programme d'incitation requis.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 5 — Modele hybride */}
      <DocSectionCard num={5} title="Modele Hybride en 3 Phases" filled={modeleFilled}>
        <div className="pt-2 space-y-2">
          {INNOVATION_DATA.synthese.phases.map((phase, i) => {
            const colors = [
              { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" },
              { bg: "bg-fuchsia-50", border: "border-fuchsia-200", badge: "bg-fuchsia-100 text-fuchsia-700" },
              { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
            ][i];
            const labels = ["Court terme", "Moyen terme", "Long terme"];
            return (
              <div key={i} className={cn("border rounded-lg p-2", colors.bg, colors.border)}>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", colors.badge)}>{labels[i]}</span>
                <p className="text-[9px] text-gray-700 mt-1">{phase}</p>
              </div>
            );
          })}
          {showContreArgument && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-red-800">Contre-argument CFO</p>
              <p className="text-[9px] text-red-700 mt-0.5">Dependance sequentielle = chateau de cartes. Mieux: Phase 1 + 2 en parallele avec budgets independants.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Empty state */}
      {filledCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Sparkles className="h-10 w-10 text-pink-300" />
          <p className="text-xs">Le document se construira au fil de l'innovation...</p>
          <p className="text-[9px]">Analogie + Inversion + Biomimetisme → Modele Hybride</p>
        </div>
      )}
    </div>
  );

  return (
    <AtelierLayout
      title="Mode Innovation"
      icon={Sparkles}
      iconColor="text-pink-600"
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
