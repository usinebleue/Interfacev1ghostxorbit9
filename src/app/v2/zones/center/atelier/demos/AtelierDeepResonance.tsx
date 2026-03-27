/**
 * AtelierDeepResonance.tsx — Atelier split-screen "Mode Deep Resonance" V2
 * GAUCHE: Chat riche avec actions inline (probes profondes, recadrages, extractions)
 * DROITE: Document reflexion qui se batit progressivement (5 sections) — pattern DocForge
 * Data: DEEP_DATA (deep-data.ts)
 * Particularite: 1-on-1 socratique avec CarlOS (pas multi-bot)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  ListOrdered,
  BookOpen,
  Heart,
  Compass,
  Download,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
} from "../../shared/simulation-components";
import { DEEP_DATA } from "../../scenarios/deep-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage =
  | "intro"
  | "thinking"
  | "spirale1"
  | "spirale2"
  | "spirale3"
  | "mirror-thinking"
  | "mirror"
  | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, spirale1: 2, spirale2: 3,
  spirale3: 4, "mirror-thinking": 5, mirror: 6, conclusion: 7,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Ecoute profonde...", spirale1: "Spirale 1 — Surface",
  spirale2: "Spirale 2 — Profond", spirale3: "Spirale 3 — Resonance",
  "mirror-thinking": "Cristallisation...", mirror: "Synthese Miroir", conclusion: "Conclusion",
};

// ========== CHALLENGE DATA (probes profondes, pas multi-bot) ==========

const SPIRALE1_PROBE =
  "Tu dis que tu veux la liberte. Mais regarde bien : la liberte que tu decris, c'est une liberation DE quelque chose — pas une liberation VERS quelque chose. En 18 ans, tu n'as jamais eu a repondre a cette question : 'Si t'as plus d'entreprise a gerer, tu fais quoi lundi matin?' L'identite du fondateur, c'est le piege le plus invisible qui existe. T'es pas prisonnier de l'entreprise — t'es prisonnier de toi-meme.";

const SPIRALE2_REFRAME = {
  perspective1: "Il y a un autre angle a regarder. Epictete — le stoicien — ferait la distinction entre ce qui depend de toi et ce qui n'en depend pas. Le resultat de la vente? Hors de ton controle. Le resultat du fonds? Hors de ton controle aussi. Mais la decision elle-meme — la clarte avec laquelle tu la prends — ca, c'est 100% toi.",
  perspective2: "Noam Wasserman, qui a etudie 10,000 fondateurs, dit que le dilemme n'est jamais 'rester ou partir'. C'est 'rich or king'. Tu peux maximiser ta richesse (vendre) ou maximiser ton controle (rester). Mais presque jamais les deux. Ton 3.2x EBITDA vs 35% dilution, c'est exactement ce dilemme. Tu choisis quoi — l'argent ou le volant?",
  synthese: "Les deux cadres pointent au meme endroit : la decision n'est pas entre deux options financieres. C'est une decision sur qui tu veux etre. Et ca, personne peut te le calculer dans un tableur.",
};

const SPIRALE3_CHALLENGE =
  "La clarte que tu decris — 'decider pour les bonnes raisons' — c'est noble. Mais c'est aussi un mecanisme de protection. Un fondateur fatigue qui dit 'je veux decider par clarte' pourrait en realite procrastiner. Parce que la clarte parfaite n'existe pas. A un moment, il faut sauter. La question n'est pas 'suis-je assez clair?' mais 'suis-je assez courageux pour decider avec 70% de clarte?'";

const CONTRE_ARGUMENT =
  "Les 5 priorites sont belles sur papier, mais il y a un paradoxe que tu n'as pas resolu. Priorite 1 dit 'garder le controle de ton histoire'. Priorite 4 dit 'retrouver de l'espace'. C'est une tension — pas une liste. Le vrai travail commence quand tu acceptes que ces deux besoins sont en conflit, et que tu choisis lequel pese le plus lourd. Le miroir te montre la verite — mais il ne fait pas le tri a ta place.";

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

export function AtelierDeepResonance({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
  const [showSpiraleProbe, setShowSpiraleProbe] = useState(false);
  const [showReframe, setShowReframe] = useState(false);
  const [showSpiraleChallenge, setShowSpiraleChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [tensionFilled, setTensionFilled] = useState(false);
  const [spirale1Filled, setSpirale1Filled] = useState(false);
  const [spirale2Filled, setSpirale2Filled] = useState(false);
  const [spirale3Filled, setSpirale3Filled] = useState(false);
  const [miroirFilled, setMiroirFilled] = useState(false);

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowSpiraleProbe(false); setShowReframe(false);
    setShowSpiraleChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setTensionFilled(false); setSpirale1Filled(false);
    setSpirale2Filled(false); setSpirale3Filled(false); setMiroirFilled(false);
  };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [tensionFilled, spirale1Filled, spirale2Filled, spirale3Filled, miroirFilled].filter(Boolean).length;

  // ========== CHAT CONTENT (LEFT) ==========
  const chatContent = (
    <>
      <UserBubble text={DEEP_DATA.userTension} time="21:14" />

      {/* CEO intro */}
      {stage === "intro" && (
        <BotBubble code="CEOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text={`${DEEP_DATA.titre} — ${DEEP_DATA.contexte}`}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => { setTensionFilled(true); setStage("thinking"); }} className="text-[9px] px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" /> Commencer la spirale
              </button>
              <button onClick={() => setTensionFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire contexte
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble code="CEOB" text={`${DEEP_DATA.titre} — ${DEEP_DATA.contexte}`} phaseLabel="Connecter" time="21:14" />
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <ThinkingAnimation
          steps={DEEP_DATA.ceoThinking}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("spirale1")}
        />
      )}

      {/* === SPIRALE 1 — Surface === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["spirale1"] && (
        <>
          <BotBubble code="CEOB" text={DEEP_DATA.spirale1.ceoQuestion} phaseLabel="Spirale 1 — Surface" time="21:15" />
          <UserBubble text={DEEP_DATA.spirale1.userResponse} time="21:16" />
          <BotBubble code="CEOB" text="" phaseLabel="Reflexion" time="21:17">
            <p className="text-sm text-gray-800">{DEEP_DATA.spirale1.ceoReflection}</p>
            {stage === "spirale1" && !showSpiraleProbe && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => handleChallenge(setShowSpiraleProbe)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                  <ShieldQuestion className="h-3.5 w-3.5" /> Creuser plus profond
                </button>
                <button onClick={() => { setSpirale1Filled(true); setStage("spirale2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Spirale 2
                </button>
                <button onClick={() => setSpirale1Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Extraire insight
                </button>
              </div>
            )}
          </BotBubble>
        </>
      )}

      {showSpiraleProbe && (
        <BotBubble code="CEOB" text="" phaseLabel="Probe profonde" time="21:17">
          <p className="text-sm text-gray-800">{SPIRALE1_PROBE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setSpirale1Filled(true); setStage("spirale2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Spirale 2
            </button>
          </div>
        </BotBubble>
      )}

      {/* === SPIRALE 2 — Profond === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["spirale2"] && (
        <>
          {/* Thinking steps inline */}
          <div className="ml-11 my-2">
            <div className="flex items-center gap-2 text-xs text-indigo-500">
              {DEEP_DATA.spirale2.thinkingSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <span key={i} className="flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{step.text}</span>
                    {i < DEEP_DATA.spirale2.thinkingSteps.length - 1 && (
                      <span className="text-gray-300 mx-1">|</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          <BotBubble code="CEOB" text={DEEP_DATA.spirale2.ceoQuestion} phaseLabel="Spirale 2 — Profond" time="21:18" />
          <UserBubble text={DEEP_DATA.spirale2.userResponse} time="21:19" />
          <BotBubble code="CEOB" text="" phaseLabel="Reflexion" time="21:20">
            <p className="text-sm text-gray-800">{DEEP_DATA.spirale2.ceoReflection}</p>
            {stage === "spirale2" && !showReframe && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => handleChallenge(setShowReframe)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Recadrage alternatif
                </button>
                <button onClick={() => { setSpirale2Filled(true); setStage("spirale3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Spirale 3
                </button>
                <button onClick={() => setSpirale2Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Extraire insight
                </button>
              </div>
            )}
          </BotBubble>
        </>
      )}

      {showReframe && (
        <>
          <BotBubble code="CEOB" text="" phaseLabel="Recadrage — Epictete" time="21:20">
            <p className="text-sm text-gray-800">{SPIRALE2_REFRAME.perspective1}</p>
          </BotBubble>
          <BotBubble code="CEOB" text="" phaseLabel="Recadrage — Wasserman" time="21:20">
            <p className="text-sm text-gray-800">{SPIRALE2_REFRAME.perspective2}</p>
          </BotBubble>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
            <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Compass className="h-3.5 w-3.5" /> Synthese</p>
            <p className="text-xs text-purple-700">{SPIRALE2_REFRAME.synthese}</p>
          </div>
          <div className="flex gap-2 flex-wrap px-1 mt-1">
            <button onClick={() => { setSpirale2Filled(true); setStage("spirale3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Spirale 3
            </button>
          </div>
        </>
      )}

      {/* === SPIRALE 3 — Resonance === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["spirale3"] && (
        <>
          {/* Thinking steps inline */}
          <div className="ml-11 my-2">
            <div className="flex items-center gap-2 text-xs text-purple-500">
              {DEEP_DATA.spirale3.thinkingSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <span key={i} className="flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{step.text}</span>
                    {i < DEEP_DATA.spirale3.thinkingSteps.length - 1 && (
                      <span className="text-gray-300 mx-1">|</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          <BotBubble code="CEOB" text={DEEP_DATA.spirale3.ceoQuestion} phaseLabel="Spirale 3 — Resonance" time="21:21" />
          <UserBubble text={DEEP_DATA.spirale3.userResponse} time="21:22" />
          <BotBubble code="CEOB" text="" phaseLabel="Cristallisation" time="21:23">
            <p className="text-sm text-gray-800">{DEEP_DATA.spirale3.ceoReflection}</p>
            {stage === "spirale3" && !showSpiraleChallenge && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => handleChallenge(setShowSpiraleChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                  <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la clarte
                </button>
                <button onClick={() => { setSpirale3Filled(true); setStage("mirror-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Synthese miroir
                </button>
                <button onClick={() => setSpirale3Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Extraire cristallisation
                </button>
              </div>
            )}
          </BotBubble>
        </>
      )}

      {showSpiraleChallenge && (
        <BotBubble code="CEOB" text="" phaseLabel="Challenge — Courage" time="21:23">
          <p className="text-sm text-gray-800">{SPIRALE3_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setSpirale3Filled(true); setStage("mirror-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Synthese miroir
            </button>
          </div>
        </BotBubble>
      )}

      {/* Sentinel */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 probes profondes — la spirale a atteint sa resonance. C'est l'heure du miroir.</p>
        </div>
      )}

      {/* Mirror thinking */}
      {stage === "mirror-thinking" && (
        <ThinkingAnimation
          steps={[
            { icon: Heart, text: "Assemblage des 3 spirales..." },
            { icon: Compass, text: "Hierarchisation des priorites..." },
            { icon: Sparkles, text: "Formulation du miroir..." },
          ]}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("mirror")}
        />
      )}

      {/* === MIRROR === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["mirror"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Miroir" time="21:24">
          <p className="text-sm text-gray-800 mb-2">{DEEP_DATA.mirrorSynthesis.intro}</p>
          <ol className="space-y-1.5 list-decimal list-inside">
            {DEEP_DATA.mirrorSynthesis.priorities.map((p, i) => (
              <li key={i} className="text-xs text-gray-700 leading-relaxed">{p}</li>
            ))}
          </ol>
          {stage === "mirror" && !showContreArgument && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Contre-argument
              </button>
              <button onClick={() => { setMiroirFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Conclure
              </button>
              <button onClick={() => setMiroirFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire miroir
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showContreArgument && (
        <BotBubble code="CEOB" text="" phaseLabel="Contre-argument — Tension" time="21:24">
          <p className="text-sm text-gray-800">{CONTRE_ARGUMENT}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setMiroirFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Conclure
            </button>
          </div>
        </BotBubble>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <BotBubble code="CEOB" text="" phaseLabel="Closing" time="21:25">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Resonance documentee.</p>
            <p className="text-xs text-gray-600">{DEEP_DATA.closing}</p>
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
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-indigo-900">Rapport Deep Resonance — Spirale Socratique</h3>
        </div>
        <p className="text-xs text-indigo-700 mb-3">{DEEP_DATA.titre}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-indigo-200/50 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-indigo-700">{filledCount}/5</span>
        </div>
      </div>

      {/* Section 1 — Tension & Contexte */}
      <DocSectionCard num={1} title="Tension & Contexte" filled={tensionFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-700">{DEEP_DATA.contexte}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-blue-600 font-bold">CA</p>
              <p className="text-sm font-bold text-blue-800">28M$</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-green-600 font-bold">Offre achat</p>
              <p className="text-sm font-bold text-green-800">12M$</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-purple-600 font-bold">Fonds</p>
              <p className="text-sm font-bold text-purple-800">5M$/35%</p>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
            <p className="text-[9px] font-bold text-indigo-800">Tension nommee</p>
            <p className="text-[9px] text-indigo-700 mt-0.5 italic">"Je suis fatigue, mais je suis pas fini. Je sais plus ou j'en suis."</p>
          </div>
        </div>
      </DocSectionCard>

      {/* Section 2 — Spirale 1: Surface */}
      <DocSectionCard num={2} title="Spirale 1 — Surface (Le paradoxe du fondateur)" filled={spirale1Filled}>
        <div className="pt-2 space-y-2">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-[9px] font-bold text-indigo-800">{DEEP_DATA.spirale1.reflectionCard.titre}</span>
            </div>
            <p className="text-[9px] text-indigo-700">{DEEP_DATA.spirale1.reflectionCard.insight}</p>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-gray-500">Profondeur:</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-indigo-400 h-full rounded-full" style={{ width: "33%" }} /></div>
            <span className="font-bold text-indigo-700">Niveau 1/3</span>
          </div>
          {showSpiraleProbe && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Probe profonde</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Identite du fondateur = piege invisible. Pas prisonnier de l'entreprise — prisonnier de soi-meme.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 3 — Spirale 2: Profond */}
      <DocSectionCard num={3} title="Spirale 2 — Profond (Le vrai enjeu + Bezos)" filled={spirale2Filled}>
        <div className="pt-2 space-y-2">
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Compass className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-[9px] font-bold text-violet-800">{DEEP_DATA.spirale2.reflectionCard.titre}</span>
            </div>
            <p className="text-[9px] text-violet-700">{DEEP_DATA.spirale2.reflectionCard.insight}</p>
          </div>
          {/* Mental model box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wide">Modele mental</span>
            </div>
            <p className="text-[9px] font-semibold text-amber-900">{DEEP_DATA.spirale2.mentalModel.nom}</p>
            <p className="text-[9px] text-amber-700 mt-0.5">{DEEP_DATA.spirale2.mentalModel.explication}</p>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-gray-500">Profondeur:</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-violet-400 h-full rounded-full" style={{ width: "66%" }} /></div>
            <span className="font-bold text-violet-700">Niveau 2/3</span>
          </div>
          {showReframe && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-purple-800">Recadrage</p>
              <p className="text-[9px] text-purple-700 mt-0.5">Rich or King (Wasserman) + Dichotomie du controle (Epictete) = decision identitaire, pas financiere.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 4 — Spirale 3: Resonance */}
      <DocSectionCard num={4} title="Spirale 3 — Resonance (Cristallisation)" filled={spirale3Filled}>
        <div className="pt-2 space-y-2">
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-[9px] font-bold text-purple-800">{DEEP_DATA.spirale3.crystallizationCard.titre}</span>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed italic">{DEEP_DATA.spirale3.crystallizationCard.insight}</p>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-gray-500">Profondeur:</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-purple-500 h-full rounded-full" style={{ width: "100%" }} /></div>
            <span className="font-bold text-purple-700">Niveau 3/3</span>
          </div>
          {showSpiraleChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge — Courage</p>
              <p className="text-[9px] text-amber-700 mt-0.5">La clarte parfaite n'existe pas. Decider avec 70% de clarte = courage, pas imprudence.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 5 — Miroir & Modeles Mentaux */}
      <DocSectionCard num={5} title="Miroir & Modeles Mentaux" filled={miroirFilled}>
        <div className="pt-2 space-y-2">
          {/* Priorities */}
          <div className="space-y-1.5">
            {DEEP_DATA.mirrorSynthesis.priorities.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white",
                  i === 0 ? "bg-indigo-600" : i === 1 ? "bg-indigo-500" : i === 2 ? "bg-indigo-400" : i === 3 ? "bg-indigo-300 text-indigo-800" : "bg-indigo-200 text-indigo-700"
                )}>{i + 1}</span>
                <p className="text-[9px] text-gray-700 leading-relaxed pt-0.5">{p}</p>
              </div>
            ))}
          </div>
          {/* Mental models */}
          <div className="border-t border-gray-100 pt-2 space-y-1.5">
            <p className="text-[9px] font-bold text-gray-500 flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Modeles mentaux references</p>
            {DEEP_DATA.mentalModels.map((model, i) => (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-[9px] font-bold text-amber-900">{model.nom}</span>
                  <span className="text-[9px] text-amber-600 ml-auto">{model.auteur}</span>
                </div>
                <p className="text-[9px] text-amber-700 mt-0.5">{model.description}</p>
              </div>
            ))}
          </div>
          {showContreArgument && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-red-800">Contre-argument</p>
              <p className="text-[9px] text-red-700 mt-0.5">Priorite 1 (controle) vs Priorite 4 (espace) = tension non resolue. Le miroir montre — il ne tranche pas.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Empty state */}
      {filledCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Brain className="h-10 w-10 text-indigo-300" />
          <p className="text-xs">La spirale socratique apparaitra ici...</p>
          <p className="text-[9px]">3 niveaux de profondeur + Miroir + Modeles mentaux</p>
        </div>
      )}
    </div>
  );

  return (
    <AtelierLayout
      title="Mode Deep Resonance"
      icon={Brain}
      iconColor="text-indigo-600"
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
