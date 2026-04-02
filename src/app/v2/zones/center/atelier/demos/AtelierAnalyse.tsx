"use client";

/**
 * AtelierAnalyse.tsx — Atelier split-screen "Mode Analyse" — SELF-CONTAINED
 * Same layout frame as SimPhaseReflexion (gold standard): TopBar, sub-tabs, breadcrumb, phase bar
 * GAUCHE: Chat riche avec SBubble (challenges, debats, extractions, sentinel)
 * DROITE: Document analyse qui se batit progressivement (5 sections DocForge)
 * Data: ANALYSE_DATA (analyse-data.ts)
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
  Mic,
  Send,
  Scan,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  ShieldQuestion,
  Eye,
  GitBranch,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Target,
  Download,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar, ThinkingAnimation } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { ANALYSE_DATA } from "../../scenarios/analyse-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "intro"
  | "thinking"
  | "cinq-pourquoi"
  | "ishikawa"
  | "evidence-thinking"
  | "evidence"
  | "synthese-thinking"
  | "synthese"
  | "conclusion";

const STAGE_ORDER: Stage[] = [
  "intro", "thinking", "cinq-pourquoi", "ishikawa",
  "evidence-thinking", "evidence", "synthese-thinking", "synthese", "conclusion",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter",
  thinking: "Analyse...",
  "cinq-pourquoi": "5 Pourquoi",
  ishikawa: "Ishikawa",
  "evidence-thinking": "Evidence...",
  evidence: "Evidence",
  "synthese-thinking": "Synthese...",
  synthese: "Actions correctives",
  conclusion: "Conclusion",
};

type Phase = "reflexion" | "atelier" | "command";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// ═══════════════════════════════════════
// CHALLENGE & DEBATE DATA
// ═══════════════════════════════════════

const CFO_CAUSE_CHALLENGE =
  "Remettre ca sur le dos du CFO absent, c'est trop facile. Le controleur avait les chiffres — meme sans CFO, quelqu'un aurait du voir la marge fondre. Le vrai probleme c'est que la culture financiere de l'entreprise repose sur UNE personne. Le CFO etait un single point of failure. La cause racine est systemique, pas structurelle.";

const COO_ISHIKAWA_CHALLENGE =
  "La branche Machine est sous-estimee. Le taux de rebut a 8.7% represente 187K$/an de perte directe — c'est presque autant que 2 mois d'ecart prix/cout. On devrait traiter la maintenance preventive avec la meme urgence que la tarification.";

const EVIDENCE_DEBATE = {
  cfo: "Les chiffres du benchmark CRIQ sont inquietants — on est a 5.8 points sous la moyenne. Mais attention : le benchmark inclut des PME de 100+ employes avec des economies d'echelle qu'on n'a pas. Si on filtre les PME de 40-60 employes, la moyenne descend a 34.5%. L'ecart est de 3.1 points, pas 5.8.",
  cto: "Frank a raison sur le filtre de taille, mais ca change pas le diagnostic. Meme a 3.1 points sous la moyenne ajustee, on perd 280K$/an vs nos pairs. Et la tendance est descendante — si on attend encore 6 mois, on passe sous 30%.",
  consensus: "L'ecart reel est entre 3.1 et 5.8 points selon le benchmark utilise. Dans les deux cas, la tendance est baissiere et la zone de danger approche. Urgence confirmee.",
};

const SYNTHESE_CHALLENGE =
  "Le plan est bon mais la priorisation est discutable. Recruter un CFO fractionnel en semaine 1-2 serait plus strategique : c'est LUI qui devrait piloter la mise a jour des couts et la revision des prix, pas le controleur. Sinon on repete le probleme.";

const CONTRE_ARGUMENT =
  "Si je devais plaider contre ce plan : on propose 5 actions simultanees. Pour une PME de 55 employes sans CFO, c'est trop. Le risque d'execution est reel. Mieux vaut 2 actions executees a 100% qu'un plan ambitieux execute a 40%. Je recommande un sequencage strict.";

// ═══════════════════════════════════════
// DOC SECTION CARD
// ═══════════════════════════════════════

function DocSectionCard({ num, title, filled, children }: {
  num: number; title: string; icon: React.ElementType; filled: boolean; children?: React.ReactNode;
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

export function AtelierAnalyse({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
  const [showCauseChallenge, setShowCauseChallenge] = useState(false);
  const [showIshikawaChallenge, setShowIshikawaChallenge] = useState(false);
  const [showEvidenceDebat, setShowEvidenceDebat] = useState(false);
  const [showSyntheseChallenge, setShowSyntheseChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [pourquoiFilled, setPourquoiFilled] = useState(false);
  const [ishikawaFilled, setIshikawaFilled] = useState(false);
  const [evidenceFilled, setEvidenceFilled] = useState(false);
  const [actionsFilled, setActionsFilled] = useState(false);
  const [conclusionFilled, setConclusionFilled] = useState(false);
  const [extractedNotes, setExtractedNotes] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showCauseChallenge, showIshikawaChallenge, showEvidenceDebat, showSyntheseChallenge, showContreArgument, showSentinel]);

  // Right panel scroll to top on stage change
  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const handleChallenge = (action: () => void) => {
    const c = challengeCount + 1;
    setChallengeCount(c);
    action();
    if (c >= 3 && !showSentinel) setTimeout(() => setShowSentinel(true), 1500);
  };

  const handleExtract = (key: string) => {
    if (!extractedNotes.includes(key)) setExtractedNotes((p) => [...p, key]);
  };

  const handleReset = () => {
    setStage("intro"); setTyped(false);
    setShowCauseChallenge(false); setShowIshikawaChallenge(false);
    setShowEvidenceDebat(false); setShowSyntheseChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setPourquoiFilled(false); setIshikawaFilled(false); setEvidenceFilled(false);
    setActionsFilled(false); setConclusionFilled(false); setExtractedNotes([]);
  };

  const filledCount = [pourquoiFilled, ishikawaFilled, evidenceFilled, actionsFilled, conclusionFilled].filter(Boolean).length;

  // Dynamic discussion context
  const discussionContext =
    si <= 1 ? "Mode Analyse — Direction" :
    si <= 4 ? "Analyse en cours — Erosion marge brute" :
    "Synthese — Pre-rapport correctif";

  // Dynamic active bots based on stage
  const activeBots: string[] =
    si <= 1 ? ["CTOB"] :
    si <= 3 ? ["CTOB", "CFOB"] :
    si <= 5 ? ["CTOB", "CFOB", "COOB"] :
    ["CEOB", "CFOB", "CTOB"];

  // Phase — always reflexion for analysis
  const currentPhase: Phase = "reflexion";

  // Dynamic breadcrumb
  const breadcrumb: string[] =
    si <= 0 ? ["Direction", "Analyse"] :
    si <= 2 ? ["Direction", "Analyse", "5 Pourquoi"] :
    si <= 3 ? ["Direction", "Analyse", "Ishikawa"] :
    si <= 5 ? ["Direction", "Analyse", "Evidence"] :
    si <= 7 ? ["Direction", "Analyse", "Synthese"] :
    ["Direction", "Analyse", "Rapport final"];

  // Active sub-tab
  const activeSubTab = 0;

  // ═══════════════════════════════════════
  // CHAT CONTENT (Left Panel)
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* User tension */}
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[80%] shadow-sm">
          <p className="text-sm">{ANALYSE_DATA.userTension}</p>
          <p className="text-[9px] text-white/60 mt-1 text-right">09:15</p>
        </div>
      </div>

      {/* Stage: intro — CarlOS intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText text={ANALYSE_DATA.ceoIntro} speed={10} className="text-sm text-gray-800" onComplete={() => setTyped(true)} />
              {typed && <SBtn onClick={() => goNext("thinking")} icon={Send} label="Lancer l'analyse" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mode Analyse active — CTO va mener l'analyse</p>}
        </SBubble>
      )}

      {/* Stage: thinking — ThinkingAnimation */}
      {stage === "thinking" && (
        <ThinkingAnimation steps={ANALYSE_DATA.ceoThinking} botEmoji="" botCode="CTOB" botName="Tim" onComplete={() => goNext("cinq-pourquoi")} />
      )}

      {/* ═══ 5 POURQUOI ═══ */}
      {si >= STAGE_ORDER.indexOf("cinq-pourquoi") && (
        <SBubble code="CTOB" collapsed={si > STAGE_ORDER.indexOf("cinq-pourquoi")}>
          {si === STAGE_ORDER.indexOf("cinq-pourquoi") ? (
            <>
              <p className="text-sm text-gray-800 mb-2">J'ai remonte la chaine causale en 5 niveaux :</p>
              {ANALYSE_DATA.cinqPourquoi.map((step) => (
                <div key={step.level} className="mb-2 pl-3 border-l-2 border-cyan-300">
                  <p className="text-[9px] font-bold text-cyan-700 uppercase">Pourquoi #{step.level}</p>
                  <p className="text-xs font-medium text-gray-700">{step.question}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{step.answer}</p>
                </div>
              ))}
              <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                <p className="text-[9px] font-bold text-red-700 mb-0.5">CAUSE RACINE IDENTIFIEE</p>
                <p className="text-xs text-red-800">{ANALYSE_DATA.synthese.causeRacine}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-cyan-100 flex flex-wrap gap-2">
                {!showCauseChallenge && (
                  <button onClick={() => handleChallenge(() => setShowCauseChallenge(true))} className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-200 font-medium cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la cause racine
                  </button>
                )}
                <button onClick={() => { setPourquoiFilled(true); handleExtract("pourquoi"); if (si === STAGE_ORDER.indexOf("cinq-pourquoi")) goNext("ishikawa"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire au document
                </button>
                {si === STAGE_ORDER.indexOf("cinq-pourquoi") && (
                  <button onClick={() => goNext("ishikawa")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Ishikawa
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">5 Pourquoi — cause racine: gouvernance financiere</p>}
        </SBubble>
      )}

      {/* CFO Challenge on cause racine */}
      {showCauseChallenge && (
        <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("cinq-pourquoi")}>
          {si <= STAGE_ORDER.indexOf("cinq-pourquoi") ? (
            <TypewriterText text={CFO_CAUSE_CHALLENGE} speed={8} className="text-sm text-gray-800" />
          ) : <p className="text-[9px] text-gray-400 italic">Challenge CFO — cause racine systemique</p>}
        </SBubble>
      )}

      {/* ═══ ISHIKAWA ═══ */}
      {si >= STAGE_ORDER.indexOf("ishikawa") && (
        <SBubble code="CTOB" collapsed={si > STAGE_ORDER.indexOf("ishikawa")}>
          {si === STAGE_ORDER.indexOf("ishikawa") ? (
            <>
              <p className="text-sm text-gray-800 mb-2">Diagramme Ishikawa — 6 branches (6M).</p>
              <div className="text-center text-xs font-bold text-gray-800 bg-red-50 border border-red-200 rounded-lg p-2 mb-2">{ANALYSE_DATA.ishikawa.probleme}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {ANALYSE_DATA.ishikawa.branches.map((b) => {
                  const Ic = b.icon;
                  return (
                    <div key={b.id} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Ic className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-[9px] font-bold text-gray-700 uppercase">{b.label}</span>
                        <span className="text-[9px] text-gray-400 ml-auto">{b.causes.length}</span>
                      </div>
                      {b.causes.map((c, i) => (
                        <p key={i} className="text-[9px] text-gray-600 leading-tight mb-0.5">- {c.cause}</p>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-cyan-100 flex flex-wrap gap-2">
                {!showIshikawaChallenge && (
                  <button onClick={() => handleChallenge(() => setShowIshikawaChallenge(true))} className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-200 font-medium cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger COO
                  </button>
                )}
                <button onClick={() => { setIshikawaFilled(true); handleExtract("ishikawa"); if (si === STAGE_ORDER.indexOf("ishikawa")) goNext("evidence-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire au document
                </button>
                {si === STAGE_ORDER.indexOf("ishikawa") && (
                  <button onClick={() => goNext("evidence-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Evidence
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Ishikawa 6M — 16 causes identifiees</p>}
        </SBubble>
      )}

      {/* COO Challenge on Ishikawa */}
      {showIshikawaChallenge && (
        <SBubble code="COOB" collapsed={si > STAGE_ORDER.indexOf("ishikawa")}>
          {si <= STAGE_ORDER.indexOf("ishikawa") ? (
            <TypewriterText text={COO_ISHIKAWA_CHALLENGE} speed={8} className="text-sm text-gray-800" />
          ) : <p className="text-[9px] text-gray-400 italic">Challenge COO — branche Machine sous-estimee</p>}
        </SBubble>
      )}

      {/* Evidence thinking */}
      {stage === "evidence-thinking" && (
        <ThinkingAnimation steps={ANALYSE_DATA.syntheseThinking.slice(0, 2)} botEmoji="" botCode="CTOB" botName="Tim" onComplete={() => goNext("evidence")} />
      )}

      {/* ═══ EVIDENCE CARDS ═══ */}
      {si >= STAGE_ORDER.indexOf("evidence") && (
        <>
          {ANALYSE_DATA.evidenceCards.map((card, idx) => {
            const Ic = card.icon;
            const evidenceStageIdx = STAGE_ORDER.indexOf("evidence");
            return (
              <SBubble key={idx} code={card.botCode} collapsed={si > evidenceStageIdx}>
                {si === evidenceStageIdx ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Ic className="h-4 w-4 text-cyan-600" />
                      <span className="text-xs font-bold text-gray-800">{card.title}</span>
                    </div>
                    <p className="text-xs text-gray-700 mb-2">{card.content}</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {card.dataPoints.map((dp, j) => (
                        <div key={j} className="bg-gray-50 rounded p-1.5 border border-gray-200">
                          <p className="text-[9px] text-gray-500">{dp.label}</p>
                          <p className={cn("text-xs font-bold", dp.trend === "down" ? "text-red-600" : dp.trend === "up" ? "text-green-600" : "text-gray-800")}>
                            {dp.value}
                            {dp.trend === "down" && <TrendingDown className="inline h-3.5 w-3.5 ml-0.5" />}
                            {dp.trend === "up" && <TrendingUp className="inline h-3.5 w-3.5 ml-0.5" />}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handleExtract(`evidence-${idx}`)} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                      <Pin className="h-3.5 w-3.5" /> Extraire
                    </button>
                  </>
                ) : <p className="text-[9px] text-gray-400 italic">{card.title}</p>}
              </SBubble>
            );
          })}

          {/* Debate button */}
          {si === STAGE_ORDER.indexOf("evidence") && !showEvidenceDebat && (
            <div className="flex justify-center">
              <button onClick={() => handleChallenge(() => setShowEvidenceDebat(true))} className="text-[9px] bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-purple-200 font-medium cursor-pointer">
                <MessageSquare className="h-3.5 w-3.5" /> Debat CFO vs CTO
              </button>
            </div>
          )}

          {/* Evidence Debate */}
          {showEvidenceDebat && (
            <>
              <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("evidence")}>
                {si <= STAGE_ORDER.indexOf("evidence") ? (
                  <TypewriterText text={EVIDENCE_DEBATE.cfo} speed={8} className="text-sm text-gray-800" />
                ) : <p className="text-[9px] text-gray-400 italic">Debat CFO — benchmark ajuste</p>}
              </SBubble>
              <SBubble code="CTOB" collapsed={si > STAGE_ORDER.indexOf("evidence")}>
                {si <= STAGE_ORDER.indexOf("evidence") ? (
                  <TypewriterText text={EVIDENCE_DEBATE.cto} speed={8} className="text-sm text-gray-800" />
                ) : <p className="text-[9px] text-gray-400 italic">Debat CTO — tendance confirmee</p>}
              </SBubble>
              {si <= STAGE_ORDER.indexOf("evidence") && (
                <div className="mx-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-[9px] font-bold text-purple-700 mb-0.5">CONSENSUS</p>
                  <p className="text-xs text-purple-800">{EVIDENCE_DEBATE.consensus}</p>
                </div>
              )}
            </>
          )}

          {/* Advance to synthese */}
          {si === STAGE_ORDER.indexOf("evidence") && (
            <div className="flex justify-center">
              <button onClick={() => { setEvidenceFilled(true); goNext("synthese-thinking"); }} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer">
                <Target className="h-3.5 w-3.5" /> Synthetiser
              </button>
            </div>
          )}
        </>
      )}

      {/* Sentinel anti-boucle */}
      {showSentinel && (
        <div className="mx-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-amber-700 uppercase">Sentinelle anti-boucle</p>
              <p className="text-xs text-amber-800">3 challenges effectues. Avancer vers la synthese?</p>
            </div>
          </div>
        </div>
      )}

      {/* Synthese thinking */}
      {stage === "synthese-thinking" && (
        <ThinkingAnimation steps={ANALYSE_DATA.syntheseThinking} botEmoji="" botCode="CEOB" botName="CarlOS" onComplete={() => goNext("synthese")} />
      )}

      {/* ═══ SYNTHESE — Actions correctives ═══ */}
      {si >= STAGE_ORDER.indexOf("synthese") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("synthese")}>
          {si === STAGE_ORDER.indexOf("synthese") ? (
            <>
              <p className="text-sm text-gray-800 mb-2 font-medium">Plan d'action — 5 actions correctives priorisees</p>
              <p className="text-xs text-red-700 mb-3 bg-red-50 p-2 rounded">{ANALYSE_DATA.synthese.impactTotal}</p>
              {ANALYSE_DATA.synthese.actions.map((a, i) => (
                <div key={i} className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", a.priorite === "critique" ? "bg-red-100 text-red-700" : a.priorite === "haute" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>{a.priorite.toUpperCase()}</span>
                    <span className="text-[9px] text-gray-500">{a.timeline}</span>
                    <span className="text-[9px] text-gray-400 ml-auto">{a.responsable}</span>
                  </div>
                  <p className="text-xs text-gray-700">{a.action}</p>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap gap-2">
                {!showSyntheseChallenge && (
                  <button onClick={() => handleChallenge(() => setShowSyntheseChallenge(true))} className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-200 font-medium cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger le plan
                  </button>
                )}
                {!showContreArgument && (
                  <button onClick={() => handleChallenge(() => setShowContreArgument(true))} className="text-[9px] bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-200 font-medium cursor-pointer">
                    <Eye className="h-3.5 w-3.5" /> Contre-argument
                  </button>
                )}
                <button onClick={() => { setActionsFilled(true); handleExtract("actions"); if (si === STAGE_ORDER.indexOf("synthese")) goNext("conclusion"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire au document
                </button>
                {si === STAGE_ORDER.indexOf("synthese") && (
                  <button onClick={() => goNext("conclusion")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Conclure
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Plan d'action — 5 actions correctives</p>}
        </SBubble>
      )}

      {/* Synthese challenge */}
      {showSyntheseChallenge && (
        <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("synthese")}>
          {si <= STAGE_ORDER.indexOf("synthese") ? (
            <TypewriterText text={SYNTHESE_CHALLENGE} speed={8} className="text-sm text-gray-800" />
          ) : <p className="text-[9px] text-gray-400 italic">Challenge CFO — priorisation CFO fractionnel</p>}
        </SBubble>
      )}

      {/* Contre-argument */}
      {showContreArgument && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("synthese")}>
          {si <= STAGE_ORDER.indexOf("synthese") ? (
            <TypewriterText text={CONTRE_ARGUMENT} speed={8} className="text-sm text-gray-800" />
          ) : <p className="text-[9px] text-gray-400 italic">Contre-argument — sequencage strict recommande</p>}
        </SBubble>
      )}

      {/* ═══ CONCLUSION ═══ */}
      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText text={ANALYSE_DATA.synthese.conclusion} speed={10} className="text-sm text-gray-800" onComplete={() => { setTyped(true); setConclusionFilled(true); }} />
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
  // DOCUMENT CONTENT (Right Panel)
  // ═══════════════════════════════════════

  const atelierContent = (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      {/* Report header */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Scan className="h-5 w-5 text-cyan-600" />
          <h2 className="text-sm font-bold text-gray-800">Rapport d'Analyse</h2>
          <span className="text-[9px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium ml-auto">{filledCount}/5 sections</span>
        </div>
        <p className="text-xs text-gray-500">{ANALYSE_DATA.titre}</p>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
        </div>
      </div>

      {/* Section 1: 5 Pourquoi */}
      <DocSectionCard num={1} title="5 Pourquoi — Chaine causale" icon={GitBranch} filled={pourquoiFilled}>
        <div className="pt-3 space-y-2">
          {ANALYSE_DATA.cinqPourquoi.map((step) => (
            <div key={step.level} className="pl-3 border-l-2 border-cyan-200">
              <p className="text-[9px] font-bold text-cyan-600">Pourquoi #{step.level}</p>
              <p className="text-xs text-gray-700">{step.answer}</p>
              <p className="text-[9px] text-gray-400 italic mt-0.5">{step.evidence}</p>
            </div>
          ))}
          <div className="p-2 bg-red-50 rounded border border-red-200">
            <p className="text-[9px] font-bold text-red-700">CAUSE RACINE</p>
            <p className="text-xs text-red-800">{ANALYSE_DATA.synthese.causeRacine}</p>
          </div>
        </div>
      </DocSectionCard>

      {/* Section 2: Ishikawa */}
      <DocSectionCard num={2} title="Diagramme Ishikawa — 6M" icon={GitBranch} filled={ishikawaFilled}>
        <div className="pt-3">
          <div className="text-center text-xs font-bold text-gray-800 bg-red-50 border border-red-200 rounded p-1.5 mb-2">{ANALYSE_DATA.ishikawa.probleme}</div>
          <div className="grid grid-cols-3 gap-1.5">
            {ANALYSE_DATA.ishikawa.branches.map((b) => (
              <div key={b.id} className="bg-gray-50 rounded p-1.5 border border-gray-200">
                <p className="text-[9px] font-bold text-gray-600 uppercase mb-0.5">{b.label}</p>
                {b.causes.map((c, i) => (<p key={i} className="text-[9px] text-gray-500 leading-tight">- {c.cause}</p>))}
              </div>
            ))}
          </div>
        </div>
      </DocSectionCard>

      {/* Section 3: Evidence */}
      <DocSectionCard num={3} title="Evidence & Donnees" icon={Target} filled={evidenceFilled}>
        <div className="pt-3 space-y-2">
          {ANALYSE_DATA.evidenceCards.map((card, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-bold text-gray-700 mb-1">{card.title}</p>
              <div className="grid grid-cols-2 gap-1">
                {card.dataPoints.map((dp, j) => (
                  <div key={j} className="text-[9px]">
                    <span className="text-gray-500">{dp.label}: </span>
                    <span className={cn("font-bold", dp.trend === "down" ? "text-red-600" : "text-gray-700")}>{dp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DocSectionCard>

      {/* Section 4: Actions Correctives */}
      <DocSectionCard num={4} title="Actions Correctives" icon={CheckCircle2} filled={actionsFilled}>
        <div className="pt-3 space-y-1.5">
          {ANALYSE_DATA.synthese.actions.map((a, i) => (
            <div key={i} className="flex items-start gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5", a.priorite === "critique" ? "bg-red-100 text-red-700" : a.priorite === "haute" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>{a.priorite.toUpperCase()}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700">{a.action}</p>
                <p className="text-[9px] text-gray-400">{a.responsable} — {a.timeline}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSectionCard>

      {/* Section 5: Conclusion */}
      <DocSectionCard num={5} title="Conclusion & Prochaines etapes" icon={Target} filled={conclusionFilled}>
        <div className="pt-3">
          <p className="text-xs text-gray-700 leading-relaxed">{ANALYSE_DATA.synthese.conclusion}</p>
          <p className="text-[9px] text-red-600 font-medium mt-2">{ANALYSE_DATA.synthese.impactTotal}</p>
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
        <Scan className="h-4 w-4 text-cyan-600" />
        <span className="text-sm font-bold text-gray-800">Mode Analyse</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-cyan-500" : i < si ? "w-2 bg-cyan-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className={cn("h-1 shrink-0", PHASE_COLORS[currentPhase].dot)} />

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
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2", PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border)}>
            {/* Bot team avatars */}
            <div className="flex items-center gap-1.5">
              {activeBots.map(b => (
                <div key={b} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                  <BotAvatar code={b} size="sm" />
                  <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b]?.name}</span>
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

          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>

          {/* Input */}
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
                i === activeSubTab ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}>
                {tab}
              </button>
            ))}
          </div>

          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 flex items-center gap-1.5">
              {breadcrumb.map((c, i, arr) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                  <span className={cn("text-[11px]", i === arr.length - 1 ? "text-gray-800 font-medium" : "text-gray-400")}>{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Right panel content */}
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            {atelierContent}
          </div>
        </div>
      </div>
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
