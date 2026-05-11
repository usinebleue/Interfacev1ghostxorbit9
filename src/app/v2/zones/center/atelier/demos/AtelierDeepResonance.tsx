"use client";

/**
 * AtelierDeepResonance.tsx — Mode Deep Resonance — SELF-CONTAINED (pattern SimPhaseReflexion)
 * 1-on-1 socratique avec CarlOS — 3 spirales + mirror synthesis + DocForge 5 sections
 * GAUCHE: Chat spirale socratique (probes profondes, recadrages, challenges)
 * DROITE: Document reflexion progressif (5 sections) — pattern DocForge
 * Data: DEEP_DATA (deep-data.ts)
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
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  BookOpen,
  Heart,
  Compass,
  Download,
  Mic,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { DEEP_DATA } from "../../scenarios/deep-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "intro"
  | "thinking"
  | "spirale1"
  | "spirale2"
  | "spirale3"
  | "mirror-thinking"
  | "mirror"
  | "conclusion";

type Phase = "reflexion" | "atelier" | "command";

const STAGE_ORDER: Stage[] = [
  "intro", "thinking", "spirale1", "spirale2",
  "spirale3", "mirror-thinking", "mirror", "conclusion",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter",
  thinking: "Ecoute profonde...",
  spirale1: "Spirale 1 — Surface",
  spirale2: "Spirale 2 — Profond",
  spirale3: "Spirale 3 — Resonance",
  "mirror-thinking": "Cristallisation...",
  mirror: "Synthese Miroir",
  conclusion: "Conclusion",
};

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// ═══════════════════════════════════════
// CHALLENGE DATA (probes profondes, pas multi-bot)
// ═══════════════════════════════════════

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

export function AtelierDeepResonance({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
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
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showSpiraleProbe, showReframe, showSpiraleChallenge, showContreArgument, showSentinel]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => {
    setStage("intro"); setTyped(false);
    setShowSpiraleProbe(false); setShowReframe(false);
    setShowSpiraleChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setTensionFilled(false); setSpirale1Filled(false);
    setSpirale2Filled(false); setSpirale3Filled(false); setMiroirFilled(false);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [tensionFilled, spirale1Filled, spirale2Filled, spirale3Filled, miroirFilled].filter(Boolean).length;

  // Deep Resonance is always 1-on-1 with CarlOS — reflexion phase
  const currentPhase: Phase = "reflexion";

  // Discussion context changes with spirale depth
  const discussionContext =
    si <= STAGE_ORDER.indexOf("thinking") ? "Deep Resonance — Surface" :
    si <= STAGE_ORDER.indexOf("spirale2") ? "Deep Resonance — Profond" :
    "Deep Resonance — Cristallisation";

  // Breadcrumb
  const breadcrumb = ["Direction", "Reflexion Strategique", "Deep Resonance"];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* User tension (always visible) */}
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
          <p className="text-sm">{DEEP_DATA.userTension}</p>
        </div>
      </div>

      {/* CEO intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text={`${DEEP_DATA.titre} — ${DEEP_DATA.contexte}`}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => { setTensionFilled(true); goNext("thinking"); }} className="text-[9px] px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 flex items-center gap-1 cursor-pointer">
                    <Brain className="h-3.5 w-3.5" /> Commencer la spirale
                  </button>
                  <button onClick={() => setTensionFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire contexte
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">{DEEP_DATA.titre} — Tension identifiee</p>}
        </SBubble>
      )}

      {/* Thinking — bounce dots + auto-advance */}
      {stage === "thinking" && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-indigo-600 font-medium">CarlOS — ecoute profonde...</span>
          </div>
          <div className="space-y-1">
            {DEEP_DATA.ceoThinking.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[9px] text-indigo-600">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{step.text}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse ml-auto" />
                </div>
              );
            })}
          </div>
          <AutoAdvance onComplete={() => goNext("spirale1")} delay={2500} />
        </div>
      )}

      {/* === SPIRALE 1 — Surface === */}
      {si >= STAGE_ORDER.indexOf("spirale1") && (
        <>
          {/* CarlOS question */}
          <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale1")}>
            {si === STAGE_ORDER.indexOf("spirale1") && !typed ? (
              <TypewriterText
                text={DEEP_DATA.spirale1.ceoQuestion}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
            ) : si === STAGE_ORDER.indexOf("spirale1") ? (
              <p className="text-sm text-gray-700">{DEEP_DATA.spirale1.ceoQuestion}</p>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Spirale 1 — question socratique surface</p>
            )}
          </SBubble>

          {/* User answer */}
          {(si > STAGE_ORDER.indexOf("spirale1") || typed) && (
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
                <p className="text-sm">{DEEP_DATA.spirale1.userResponse}</p>
              </div>
            </div>
          )}

          {/* CarlOS reflection */}
          {(si > STAGE_ORDER.indexOf("spirale1") || typed) && (
            <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale1") && showSpiraleProbe}>
              {si === STAGE_ORDER.indexOf("spirale1") ? (
                <>
                  <p className="text-sm text-gray-700">{DEEP_DATA.spirale1.ceoReflection}</p>
                  {!showSpiraleProbe && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <button onClick={() => handleChallenge(setShowSpiraleProbe)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                        <ShieldQuestion className="h-3.5 w-3.5" /> Creuser plus profond
                      </button>
                      <button onClick={() => { setSpirale1Filled(true); goNext("spirale2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                        <ArrowRight className="h-3.5 w-3.5" /> Spirale 2
                      </button>
                      <button onClick={() => setSpirale1Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                        <Pin className="h-3.5 w-3.5" /> Extraire insight
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[9px] text-gray-400 italic">Reflexion — paradoxe du fondateur</p>
              )}
            </SBubble>
          )}
        </>
      )}

      {/* Probe profonde spirale 1 */}
      {showSpiraleProbe && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale1")}>
          {si === STAGE_ORDER.indexOf("spirale1") ? (
            <>
              <p className="text-sm text-gray-700">{SPIRALE1_PROBE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setSpirale1Filled(true); goNext("spirale2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Spirale 2
                </button>
              </div>
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Probe profonde — identite du fondateur</p>
          )}
        </SBubble>
      )}

      {/* === SPIRALE 2 — Profond === */}
      {si >= STAGE_ORDER.indexOf("spirale2") && (
        <>
          {/* Inline thinking steps */}
          {si === STAGE_ORDER.indexOf("spirale2") && (
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
          )}

          {/* CarlOS question */}
          <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale2")}>
            {si === STAGE_ORDER.indexOf("spirale2") && !typed ? (
              <TypewriterText
                text={DEEP_DATA.spirale2.ceoQuestion}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
            ) : si === STAGE_ORDER.indexOf("spirale2") ? (
              <p className="text-sm text-gray-700">{DEEP_DATA.spirale2.ceoQuestion}</p>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Spirale 2 — question Bezos (echec gracieux)</p>
            )}
          </SBubble>

          {/* User answer */}
          {(si > STAGE_ORDER.indexOf("spirale2") || typed) && (
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
                <p className="text-sm">{DEEP_DATA.spirale2.userResponse}</p>
              </div>
            </div>
          )}

          {/* CarlOS reflection */}
          {(si > STAGE_ORDER.indexOf("spirale2") || typed) && (
            <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale2") && showReframe}>
              {si === STAGE_ORDER.indexOf("spirale2") ? (
                <>
                  <p className="text-sm text-gray-700">{DEEP_DATA.spirale2.ceoReflection}</p>
                  {!showReframe && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <button onClick={() => handleChallenge(setShowReframe)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1 cursor-pointer">
                        <MessageSquare className="h-3.5 w-3.5" /> Recadrage alternatif
                      </button>
                      <button onClick={() => { setSpirale2Filled(true); goNext("spirale3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                        <ArrowRight className="h-3.5 w-3.5" /> Spirale 3
                      </button>
                      <button onClick={() => setSpirale2Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                        <Pin className="h-3.5 w-3.5" /> Extraire insight
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[9px] text-gray-400 italic">Reflexion — peur de perdre le volant</p>
              )}
            </SBubble>
          )}
        </>
      )}

      {/* Reframe — Epictete + Wasserman */}
      {showReframe && (
        <>
          <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale2")}>
            {si === STAGE_ORDER.indexOf("spirale2") ? (
              <p className="text-sm text-gray-700">{SPIRALE2_REFRAME.perspective1}</p>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Recadrage Epictete — dichotomie du controle</p>
            )}
          </SBubble>
          <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale2")}>
            {si === STAGE_ORDER.indexOf("spirale2") ? (
              <p className="text-sm text-gray-700">{SPIRALE2_REFRAME.perspective2}</p>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Recadrage Wasserman — rich or king</p>
            )}
          </SBubble>
          {si === STAGE_ORDER.indexOf("spirale2") && (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
                <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Compass className="h-3.5 w-3.5" /> Synthese</p>
                <p className="text-xs text-purple-700">{SPIRALE2_REFRAME.synthese}</p>
              </div>
              <div className="flex gap-2 flex-wrap px-1 mt-1">
                <button onClick={() => { setSpirale2Filled(true); goNext("spirale3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Spirale 3
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* === SPIRALE 3 — Resonance === */}
      {si >= STAGE_ORDER.indexOf("spirale3") && (
        <>
          {/* Inline thinking steps */}
          {si === STAGE_ORDER.indexOf("spirale3") && (
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
          )}

          {/* CarlOS question */}
          <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale3")}>
            {si === STAGE_ORDER.indexOf("spirale3") && !typed ? (
              <TypewriterText
                text={DEEP_DATA.spirale3.ceoQuestion}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
            ) : si === STAGE_ORDER.indexOf("spirale3") ? (
              <p className="text-sm text-gray-700">{DEEP_DATA.spirale3.ceoQuestion}</p>
            ) : (
              <p className="text-[9px] text-gray-400 italic">Spirale 3 — projection 10 ans</p>
            )}
          </SBubble>

          {/* User answer */}
          {(si > STAGE_ORDER.indexOf("spirale3") || typed) && (
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
                <p className="text-sm">{DEEP_DATA.spirale3.userResponse}</p>
              </div>
            </div>
          )}

          {/* CarlOS reflection — cristallisation */}
          {(si > STAGE_ORDER.indexOf("spirale3") || typed) && (
            <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale3") && showSpiraleChallenge}>
              {si === STAGE_ORDER.indexOf("spirale3") ? (
                <>
                  <p className="text-sm text-gray-700">{DEEP_DATA.spirale3.ceoReflection}</p>
                  {!showSpiraleChallenge && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <button onClick={() => handleChallenge(setShowSpiraleChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                        <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la clarte
                      </button>
                      <button onClick={() => { setSpirale3Filled(true); goNext("mirror-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                        <ArrowRight className="h-3.5 w-3.5" /> Synthese miroir
                      </button>
                      <button onClick={() => setSpirale3Filled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                        <Pin className="h-3.5 w-3.5" /> Extraire cristallisation
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[9px] text-gray-400 italic">Cristallisation — clarte comme boussole</p>
              )}
            </SBubble>
          )}
        </>
      )}

      {/* Challenge spirale 3 */}
      {showSpiraleChallenge && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("spirale3")}>
          {si === STAGE_ORDER.indexOf("spirale3") ? (
            <>
              <p className="text-sm text-gray-700">{SPIRALE3_CHALLENGE}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setSpirale3Filled(true); goNext("mirror-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Synthese miroir
                </button>
              </div>
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Challenge — courage de decider avec 70% de clarte</p>
          )}
        </SBubble>
      )}

      {/* Sentinel */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 probes profondes — la spirale a atteint sa resonance. C'est l'heure du miroir.</p>
        </div>
      )}

      {/* Mirror thinking — bounce dots + auto-advance */}
      {stage === "mirror-thinking" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-purple-600 font-medium">CarlOS — cristallisation du miroir...</span>
          </div>
          <div className="space-y-1">
            {[
              { icon: Heart, text: "Assemblage des 3 spirales..." },
              { icon: Compass, text: "Hierarchisation des priorites..." },
              { icon: Sparkles, text: "Formulation du miroir..." },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-purple-600">
                <step.icon className="h-3.5 w-3.5" />
                <span>{step.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          <AutoAdvance onComplete={() => goNext("mirror")} delay={2500} />
        </div>
      )}

      {/* === MIRROR === */}
      {si >= STAGE_ORDER.indexOf("mirror") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("mirror") && showContreArgument}>
          {si === STAGE_ORDER.indexOf("mirror") || (si === STAGE_ORDER.indexOf("conclusion") && !showContreArgument) ? (
            <>
              <p className="text-sm text-gray-700 mb-2">{DEEP_DATA.mirrorSynthesis.intro}</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                {DEEP_DATA.mirrorSynthesis.priorities.map((p, i) => (
                  <li key={i} className="text-xs text-gray-700 leading-relaxed">{p}</li>
                ))}
              </ol>
              {stage === "mirror" && !showContreArgument && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1 cursor-pointer">
                    <Eye className="h-3.5 w-3.5" /> Contre-argument
                  </button>
                  <button onClick={() => { setMiroirFilled(true); goNext("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Conclure
                  </button>
                  <button onClick={() => setMiroirFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer">
                    <Pin className="h-3.5 w-3.5" /> Extraire miroir
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Synthese miroir — 5 priorites</p>
          )}
        </SBubble>
      )}

      {/* Contre-argument */}
      {showContreArgument && (
        <SBubble code="CEOB" collapsed={stage === "conclusion"}>
          {stage !== "conclusion" ? (
            <>
              <p className="text-sm text-gray-700">{CONTRE_ARGUMENT}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button onClick={() => { setMiroirFilled(true); goNext("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5" /> Conclure
                </button>
              </div>
            </>
          ) : (
            <p className="text-[9px] text-gray-400 italic">Contre-argument — tension P1 vs P4</p>
          )}
        </SBubble>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Resonance documentee.</p>
            <p className="text-xs text-gray-600">{DEEP_DATA.closing}</p>
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
  // RIGHT PANEL — DOCUMENT CONTENT
  // ═══════════════════════════════════════

  const rightContent = (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
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
          <p className="text-xs">La spirale socratique apparaîtra ici...</p>
          <p className="text-[9px]">3 niveaux de profondeur + Miroir + Modeles mentaux</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT (self-contained — same frame as SimPhaseReflexion)
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Brain className="h-4 w-4 text-indigo-600" />
        <span className="text-sm font-bold text-gray-800">Mode Deep Resonance</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-indigo-500" : i < si ? "w-2 bg-indigo-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className="h-1 shrink-0 bg-indigo-500" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header — avatar LEFT, name CENTER, MessageSquare RIGHT */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar — 1-on-1 CarlOS (no team bots) + phase badges */}
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2",
            PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border
          )}>
            {/* 1-on-1 indicator */}
            <div className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
              <BotAvatar code="CEOB" size="sm" />
              <span className="text-[8px] font-medium text-gray-600">CarlOS</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <span className="text-[8px] text-gray-400 italic">1-on-1 socratique</span>

            {/* Phase badges a DROITE */}
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
          <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
            {DEPT_SUBTABS.map((tab, i) => (
              <button key={tab} className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                i === 0 ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HELPER COMPONENTS (bottom — same pattern as SimPhaseReflexion)
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
