/**
 * AtelierAnalyse.tsx — Atelier split-screen "Mode Analyse" V2
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: Document analyse qui se batit progressivement (5 sections) — pattern DocForge
 * Data: ANALYSE_DATA (analyse-data.ts)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Scan,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  GitBranch,
  MessageSquare,
  AlertTriangle,
  TrendingDown,
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
} from "../../shared/simulation-components";
import { ANALYSE_DATA } from "../../scenarios/analyse-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

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

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, "cinq-pourquoi": 2, ishikawa: 3,
  "evidence-thinking": 4, evidence: 5, "synthese-thinking": 6, synthese: 7, conclusion: 8,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Analyse...", "cinq-pourquoi": "5 Pourquoi",
  ishikawa: "Ishikawa", "evidence-thinking": "Evidence...", evidence: "Evidence",
  "synthese-thinking": "Synthese...", synthese: "Actions correctives", conclusion: "Conclusion",
};

// ========== CHALLENGE DATA ==========

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

// ========== DOC SECTION CARD ==========

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

// ========== MAIN COMPONENT ==========

export function AtelierAnalyse({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
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
    setStage("intro"); setIntroTyped(false);
    setShowCauseChallenge(false); setShowIshikawaChallenge(false);
    setShowEvidenceDebat(false); setShowSyntheseChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setPourquoiFilled(false); setIshikawaFilled(false); setEvidenceFilled(false);
    setActionsFilled(false); setConclusionFilled(false); setExtractedNotes([]);
  };

  const filledCount = [pourquoiFilled, ishikawaFilled, evidenceFilled, actionsFilled, conclusionFilled].filter(Boolean).length;

  // ═══════════════════════════════════════
  // CHAT CONTENT (Left Panel)
  // ═══════════════════════════════════════
  const chatContent = (
    <>
      <UserBubble text={ANALYSE_DATA.userTension} time="09:15" />

      {stage === "intro" ? (
        <BotBubble code="CEOB" text="" phaseLabel="Analyse">
          <TypewriterText text={ANALYSE_DATA.ceoIntro} speed={10} className="text-sm text-gray-800" onComplete={() => setIntroTyped(true)} />
          {introTyped && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button onClick={() => setStage("thinking")} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer">
                <Send className="h-3.5 w-3.5" /> Lancer l'analyse
              </button>
            </div>
          )}
        </BotBubble>
      ) : (
        <BotBubble code="CEOB" text={ANALYSE_DATA.ceoIntro} phaseLabel="Analyse" time="09:15" />
      )}

      {stage === "thinking" && (
        <ThinkingAnimation steps={ANALYSE_DATA.ceoThinking} botEmoji="" botCode="CTOB" botName="Tim" onComplete={() => setStage("cinq-pourquoi")} />
      )}

      {/* ═══ 5 POURQUOI ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["cinq-pourquoi"] && (
        <BotBubble code="CTOB" text="" phaseLabel="5 Pourquoi" time="09:16">
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
            <button onClick={() => { setPourquoiFilled(true); handleExtract("pourquoi"); if (STAGE_INDEX[stage] === STAGE_INDEX["cinq-pourquoi"]) setStage("ishikawa"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire au document
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["cinq-pourquoi"] && (
              <button onClick={() => setStage("ishikawa")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> Ishikawa
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showCauseChallenge && <BotBubble code="CFOB" text={CFO_CAUSE_CHALLENGE} phaseLabel="Challenge" time="09:17" />}

      {/* ═══ ISHIKAWA ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["ishikawa"] && (
        <BotBubble code="CTOB" text="" phaseLabel="Ishikawa" time="09:17">
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
                    <p key={i} className="text-[9px] text-gray-600 leading-tight mb-0.5">• {c.cause}</p>
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
            <button onClick={() => { setIshikawaFilled(true); handleExtract("ishikawa"); if (STAGE_INDEX[stage] === STAGE_INDEX["ishikawa"]) setStage("evidence-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire au document
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["ishikawa"] && (
              <button onClick={() => setStage("evidence-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> Evidence
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showIshikawaChallenge && <BotBubble code="COOB" text={COO_ISHIKAWA_CHALLENGE} phaseLabel="Challenge" time="09:18" />}

      {stage === "evidence-thinking" && (
        <ThinkingAnimation steps={ANALYSE_DATA.syntheseThinking.slice(0, 2)} botEmoji="" botCode="CTOB" botName="Tim" onComplete={() => setStage("evidence")} />
      )}

      {/* ═══ EVIDENCE CARDS ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["evidence"] && (
        <>
          {ANALYSE_DATA.evidenceCards.map((card, idx) => {
            const Ic = card.icon;
            return (
              <BotBubble key={idx} code={card.botCode} text="" phaseLabel="Evidence" time="09:18">
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
              </BotBubble>
            );
          })}

          {!showEvidenceDebat && (
            <div className="flex justify-center">
              <button onClick={() => handleChallenge(() => setShowEvidenceDebat(true))} className="text-[9px] bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-purple-200 font-medium cursor-pointer">
                <MessageSquare className="h-3.5 w-3.5" /> Debat CFO vs CTO
              </button>
            </div>
          )}

          {showEvidenceDebat && (
            <>
              <BotBubble code="CFOB" text={EVIDENCE_DEBATE.cfo} phaseLabel="Debat" time="09:19" />
              <BotBubble code="CTOB" text={EVIDENCE_DEBATE.cto} phaseLabel="Debat" time="09:19" />
              <div className="mx-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-[9px] font-bold text-purple-700 mb-0.5">CONSENSUS</p>
                <p className="text-xs text-purple-800">{EVIDENCE_DEBATE.consensus}</p>
              </div>
            </>
          )}

          {STAGE_INDEX[stage] === STAGE_INDEX["evidence"] && (
            <div className="flex justify-center">
              <button onClick={() => { setEvidenceFilled(true); setStage("synthese-thinking"); }} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer">
                <Target className="h-3.5 w-3.5" /> Synthetiser
              </button>
            </div>
          )}
        </>
      )}

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

      {stage === "synthese-thinking" && (
        <ThinkingAnimation steps={ANALYSE_DATA.syntheseThinking} botEmoji="" botCode="CEOB" botName="CarlOS" onComplete={() => setStage("synthese")} />
      )}

      {/* ═══ SYNTHESE ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["synthese"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Synthese" time="09:20">
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
            <button onClick={() => { setActionsFilled(true); handleExtract("actions"); if (STAGE_INDEX[stage] === STAGE_INDEX["synthese"]) setStage("conclusion"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
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

      {showSyntheseChallenge && <BotBubble code="CFOB" text={SYNTHESE_CHALLENGE} phaseLabel="Challenge" time="09:21" />}
      {showContreArgument && <BotBubble code="CEOB" text={CONTRE_ARGUMENT} phaseLabel="Contre-argument" time="09:21" />}

      {/* ═══ CONCLUSION ═══ */}
      {stage === "conclusion" && (
        <BotBubble code="CEOB" text="" phaseLabel="Conclusion" time="09:22">
          <TypewriterText text={ANALYSE_DATA.synthese.conclusion} speed={10} className="text-sm text-gray-800" onComplete={() => setConclusionFilled(true)} />
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

  // ═══════════════════════════════════════
  // DOCUMENT CONTENT (Right Panel)
  // ═══════════════════════════════════════
  const atelierContent = (
    <div className="space-y-3">
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

      <DocSectionCard num={2} title="Diagramme Ishikawa — 6M" icon={GitBranch} filled={ishikawaFilled}>
        <div className="pt-3">
          <div className="text-center text-xs font-bold text-gray-800 bg-red-50 border border-red-200 rounded p-1.5 mb-2">{ANALYSE_DATA.ishikawa.probleme}</div>
          <div className="grid grid-cols-3 gap-1.5">
            {ANALYSE_DATA.ishikawa.branches.map((b) => (
              <div key={b.id} className="bg-gray-50 rounded p-1.5 border border-gray-200">
                <p className="text-[9px] font-bold text-gray-600 uppercase mb-0.5">{b.label}</p>
                {b.causes.map((c, i) => (<p key={i} className="text-[9px] text-gray-500 leading-tight">• {c.cause}</p>))}
              </div>
            ))}
          </div>
        </div>
      </DocSectionCard>

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

      <DocSectionCard num={5} title="Conclusion & Prochaines etapes" icon={Target} filled={conclusionFilled}>
        <div className="pt-3">
          <p className="text-xs text-gray-700 leading-relaxed">{ANALYSE_DATA.synthese.conclusion}</p>
          <p className="text-[9px] text-red-600 font-medium mt-2">{ANALYSE_DATA.synthese.impactTotal}</p>
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
      title="Mode Analyse"
      icon={Scan}
      iconColor="text-cyan-600"
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
