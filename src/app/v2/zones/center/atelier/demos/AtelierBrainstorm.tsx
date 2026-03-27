/**
 * AtelierBrainstorm.tsx — Atelier split-screen "Mode Brainstorm" V2
 * GAUCHE: Chat riche avec 4 bots, SCAMPER challenge, inline actions
 * DROITE: Document brainstorm qui se batit progressivement (5 sections) — pattern DocForge
 * Data: BRAINSTORM_DATA (brainstorm-data.ts)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Lightbulb,
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
  Download,
  Layers,
  Star,
  Rocket,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
} from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { BRAINSTORM_DATA } from "../../scenarios/brainstorm-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage = "intro" | "thinking" | "vague1" | "vague2" | "clusters-thinking" | "clusters" | "synthese-thinking" | "synthese" | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, vague1: 2, vague2: 3, "clusters-thinking": 4, clusters: 5, "synthese-thinking": 6, synthese: 7, conclusion: 8,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Preparation...", vague1: "Vague 1 — Brutes", vague2: "Vague 2 — SCAMPER",
  "clusters-thinking": "Clustering...", clusters: "Clusters", "synthese-thinking": "Synthese...", synthese: "Plan d'action", conclusion: "Conclusion",
};

// ========== CHALLENGE DATA ==========

const SCAMPER_CHALLENGE =
  "L'idee #11 (remplacer les meetings vendeur par CarlOS + video auto) est ambitieuse mais risquee. 78% des acheteurs B2B veulent parler a un humain avant d'acheter > 10K$. Le bot peut qualifier, mais le closing doit rester humain. Je recommande un modele hybride : CarlOS qualifie + propose un creneau vendeur en 1 clic.";

const CLUSTER_DEBATE = {
  cmo: "Le cluster Referral est sous-estime. Avec un taux de referral de 50% (un client sur deux refere), c'est +60 clients en 6 mois avec zero cout d'acquisition. Le referral est 4x plus efficace que le marketing classique en B2B.",
  cro: "Mathilde a raison sur le potentiel, mais le 50% est optimiste. Le benchmark B2B est 15-25%. Avec un incentif de 10% recurring, on peut monter a 35%. Je recommande un objectif conservateur de +40 clients via referral, pas +60.",
  consensus: "Referral realiste : +40 clients (35% taux de referral avec incentif 10% recurring). Combiner avec automation pour maximiser le volume total."
};

const CONTRE_ARGUMENT =
  "Le plan repose sur 3 leviers simultanes — c'est ambitieux pour une equipe de 3 vendeurs + 35 employes. Le risque : on lance tout en meme temps, rien n'est execute correctement, et on dilue les efforts. Alternative : Phase 1 (T1-T2) = automation CarlOS seule. Phase 2 (T2-T3) = ajouter referral. Phase 3 (T3-T4) = inbound. Un levier a la fois, bien fait.";

// ========== DOC SECTION CARD ==========

function DocSectionCard({ num, title, filled, children }: {
  num: number; title: string; icon: React.ElementType; filled: boolean; children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(filled);
  return (
    <div className={cn("border rounded-xl overflow-hidden transition-all", filled ? "border-green-200 bg-white shadow-sm" : "border-dashed border-gray-300 bg-gray-50/50 opacity-60")}>
      <button onClick={() => filled && setExpanded(!expanded)} className={cn("w-full px-4 py-2.5 flex items-center gap-2.5 text-left", filled ? "cursor-pointer hover:bg-gray-50" : "cursor-default")}>
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

export function AtelierBrainstorm({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
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

  const handleChallenge = (action: () => void) => {
    const c = challengeCount + 1; setChallengeCount(c); action();
    if (c >= 3 && !showSentinel) setTimeout(() => setShowSentinel(true), 1500);
  };

  const handleExtract = (key: string) => {
    if (!extractedNotes.includes(key)) setExtractedNotes((p) => [...p, key]);
  };

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowScamperChallenge(false); setShowClusterDebat(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setVague1Filled(false); setVague2Filled(false); setClustersFilled(false);
    setPlanFilled(false); setConclusionFilled(false); setExtractedNotes([]);
  };

  const filledCount = [vague1Filled, vague2Filled, clustersFilled, planFilled, conclusionFilled].filter(Boolean).length;

  const chatContent = (
    <>
      <UserBubble text={BRAINSTORM_DATA.userTension} time="10:00" />

      {stage === "intro" ? (
        <BotBubble code="CEOB" text="" phaseLabel="Brainstorm">
          <TypewriterText text={BRAINSTORM_DATA.ceoIntro} speed={10} className="text-sm text-gray-800" onComplete={() => setIntroTyped(true)} />
          {introTyped && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button onClick={() => setStage("thinking")} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer">
                <Send className="h-3.5 w-3.5" /> Lancer le brainstorm
              </button>
            </div>
          )}
        </BotBubble>
      ) : (
        <BotBubble code="CEOB" text={BRAINSTORM_DATA.ceoIntro} phaseLabel="Brainstorm" time="10:00" />
      )}

      {stage === "thinking" && (
        <ThinkingAnimation steps={BRAINSTORM_DATA.setupThinking} botEmoji="" botCode="CEOB" botName="CarlOS" onComplete={() => setStage("vague1")} />
      )}

      {/* ═══ VAGUE 1 ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["vague1"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Vague 1" time="10:01">
          <p className="text-sm text-gray-800 mb-2">{BRAINSTORM_DATA.vague1.label} — 8 idees brutes, zero filtre :</p>
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
            <button onClick={() => { setVague1Filled(true); handleExtract("vague1"); if (STAGE_INDEX[stage] === STAGE_INDEX["vague1"]) setStage("vague2"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire au document
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["vague1"] && (
              <button onClick={() => setStage("vague2")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> SCAMPER Challenge
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {/* ═══ VAGUE 2 — SCAMPER ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["vague2"] && (
        <BotBubble code="CEOB" text="" phaseLabel="SCAMPER" time="10:02">
          <p className="text-sm text-gray-800 mb-1">{BRAINSTORM_DATA.vague2.label}</p>
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
            <button onClick={() => { setVague2Filled(true); handleExtract("vague2"); if (STAGE_INDEX[stage] === STAGE_INDEX["vague2"]) setStage("clusters-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire au document
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["vague2"] && (
              <button onClick={() => setStage("clusters-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <Layers className="h-3.5 w-3.5" /> Clusteriser
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showScamperChallenge && <BotBubble code="CFOB" text={SCAMPER_CHALLENGE} phaseLabel="Challenge" time="10:03" />}

      {stage === "clusters-thinking" && (
        <ThinkingAnimation steps={BRAINSTORM_DATA.syntheseThinking.slice(0, 2)} botEmoji="" botCode="CEOB" botName="CarlOS" onComplete={() => setStage("clusters")} />
      )}

      {/* ═══ CLUSTERS ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["clusters"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Clusters" time="10:03">
          <p className="text-sm text-gray-800 mb-2">5 clusters identifies :</p>
          {BRAINSTORM_DATA.clusters.map((cluster) => {
            const Ic = cluster.icon;
            return (
              <div key={cluster.id} className={cn("mb-2 p-2 rounded-lg border", cluster.bg, cluster.border)}>
                <div className="flex items-center gap-2 mb-1">
                  <Ic className={cn("h-4 w-4", cluster.color)} />
                  <span className={cn("text-xs font-bold", cluster.color)}>{cluster.label}</span>
                  <span className="text-[9px] text-gray-400 ml-auto">{cluster.noteIds.length} idees</span>
                </div>
                <p className="text-[9px] text-gray-600">{cluster.potential}</p>
              </div>
            );
          })}
          <div className="mt-3 pt-3 border-t border-amber-100 flex flex-wrap gap-2">
            {!showClusterDebat && (
              <button onClick={() => handleChallenge(() => setShowClusterDebat(true))} className="text-[9px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 font-medium cursor-pointer">
                <MessageSquare className="h-3.5 w-3.5" /> Debat CMO vs CRO
              </button>
            )}
            <button onClick={() => { setClustersFilled(true); handleExtract("clusters"); if (STAGE_INDEX[stage] === STAGE_INDEX["clusters"]) setStage("synthese-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire au document
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["clusters"] && (
              <button onClick={() => setStage("synthese-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <Target className="h-3.5 w-3.5" /> Synthetiser
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showClusterDebat && (
        <>
          <BotBubble code="CMOB" text={CLUSTER_DEBATE.cmo} phaseLabel="Debat" time="10:04" />
          <BotBubble code="CROB" text={CLUSTER_DEBATE.cro} phaseLabel="Debat" time="10:04" />
          <div className="mx-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-[9px] font-bold text-purple-700 mb-0.5">CONSENSUS</p>
            <p className="text-xs text-purple-800">{CLUSTER_DEBATE.consensus}</p>
          </div>
        </>
      )}

      {showSentinel && (
        <div className="mx-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-amber-700 uppercase">Sentinelle anti-boucle</p>
              <p className="text-xs text-amber-800">3 challenges effectues. Avancer vers le plan?</p>
            </div>
          </div>
        </div>
      )}

      {stage === "synthese-thinking" && (
        <ThinkingAnimation steps={BRAINSTORM_DATA.syntheseThinking} botEmoji="" botCode="CEOB" botName="CarlOS" onComplete={() => setStage("synthese")} />
      )}

      {/* ═══ SYNTHESE ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["synthese"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Plan" time="10:05">
          <p className="text-sm text-gray-800 mb-2 font-medium">{BRAINSTORM_DATA.synthese.titre}</p>
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
            <button onClick={() => { setPlanFilled(true); handleExtract("plan"); if (STAGE_INDEX[stage] === STAGE_INDEX["synthese"]) setStage("conclusion"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire au document
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["synthese"] && (
              <button onClick={() => setStage("conclusion")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> Conclure
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showContreArgument && <BotBubble code="COOB" text={CONTRE_ARGUMENT} phaseLabel="Contre-argument" time="10:06" />}

      {stage === "conclusion" && (
        <BotBubble code="CEOB" text="" phaseLabel="Conclusion" time="10:07">
          <TypewriterText text={`Le brainstorm a genere 13 idees, regroupees en 5 clusters. Le plan integre 3 leviers combines : automation CarlOS + referral 10% + restructuration des comptes. Projection : 120 a 250 clients en 12 mois. Budget total : 75K$. L'idee phare (#11) transforme les vendeurs en strateges — le bot gere le haut du funnel.`} speed={10} className="text-sm text-gray-800" onComplete={() => setConclusionFilled(true)} />
          {conclusionFilled && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button onClick={() => handleExtract("conclusion")} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Finaliser le document
              </button>
            </div>
          )}
        </BotBubble>
      )}
    </>
  );

  const atelierContent = (
    <div className="space-y-3">
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

      <DocSectionCard num={1} title="Vague 1 — Idees brutes" icon={Lightbulb} filled={vague1Filled}>
        <div className="pt-3 grid grid-cols-2 gap-1.5">
          {BRAINSTORM_DATA.vague1.notes.map((note) => (
            <div key={note.id} className={cn("rounded p-1.5 border text-[9px]", note.color)}>
              <p className="text-gray-700 leading-tight">{note.text}</p>
              <p className="text-gray-400 mt-0.5">{BOT_COLORS[note.bot]?.name || note.bot}</p>
            </div>
          ))}
        </div>
      </DocSectionCard>

      <DocSectionCard num={2} title="Vague 2 — SCAMPER Challenge" icon={Rocket} filled={vague2Filled}>
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

      <DocSectionCard num={3} title="Clusters thematiques" icon={Layers} filled={clustersFilled}>
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

      <DocSectionCard num={4} title="Plan d'action & Projection" icon={Target} filled={planFilled}>
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

      <DocSectionCard num={5} title="Conclusion & Idee phare" icon={Star} filled={conclusionFilled}>
        <div className="pt-3">
          <div className="p-2 bg-amber-50 rounded border border-amber-200 mb-2">
            <p className="text-[9px] font-bold text-amber-700 mb-0.5">IDEE PHARE — #11</p>
            <p className="text-xs text-amber-800">{BRAINSTORM_DATA.synthese.ideePhare}</p>
          </div>
          <p className="text-[9px] text-gray-500">13 idees generees, 5 clusters, 3 leviers combines, objectif 250 clients en 12 mois.</p>
        </div>
      </DocSectionCard>

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

  return (
    <AtelierLayout
      title="Mode Brainstorm"
      icon={Lightbulb}
      iconColor="text-amber-500"
      stage={STAGE_INDEX[stage]}
      stageCount={9}
      stageLabel={STAGE_LABELS[stage]}
      onBack={onBack}
      onReset={handleReset}
      chatContent={chatContent}
      atelierContent={atelierContent}
      actions={[]}
    />
  );
}
