/**
 * AtelierCrise.tsx — Atelier split-screen "Mode Crise" V2
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: Document OODA qui se batit progressivement (5 sections) — pattern DocForge
 * Data: CRISE_DATA (crise-data.ts)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Shield,
  Users,
  Clock,
  Phone,
  Target,
  Download,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
  InlineOptions,
} from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { CRISE_DATA } from "../../scenarios/crise-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage =
  | "intro"
  | "observe-thinking"
  | "observe"
  | "orient"
  | "decide-thinking"
  | "decide"
  | "act"
  | "resultat";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, "observe-thinking": 1, observe: 2, orient: 3,
  "decide-thinking": 4, decide: 5, act: 6, resultat: 7,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Alerte", "observe-thinking": "Scan...", observe: "OBSERVER",
  orient: "ORIENTER", "decide-thinking": "Decision...", decide: "DECIDER",
  act: "AGIR", resultat: "Resultat",
};

// ========== CHALLENGE DATA ==========

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

export function AtelierCrise({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
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

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowFactsChallenge(false); setShowOptionsDebat(false);
    setShowDirectiveChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setAlerteFilled(false); setFactsFilled(false);
    setOptionsFilled(false); setDirectivesFilled(false); setPlanFilled(false);
  };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [alerteFilled, factsFilled, optionsFilled, directivesFilled, planFilled].filter(Boolean).length;

  // ========== CHAT CONTENT (LEFT) ==========
  const chatContent = (
    <>
      <UserBubble text={CRISE_DATA.alertMessage} time="07:12" />

      {/* CEO intro */}
      {stage === "intro" && (
        <BotBubble code="CEOB" text="" phaseLabel="Crise">
          <TypewriterText
            text={CRISE_DATA.observe.ceoMessage}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => { setAlerteFilled(true); setStage("observe-thinking"); }} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> Scanner la situation
              </button>
              <button onClick={() => setAlerteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire alerte
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble code="CEOB" text={CRISE_DATA.observe.ceoMessage} phaseLabel="Crise" time="07:12" />
      )}

      {/* OBSERVE thinking */}
      {stage === "observe-thinking" && (
        <ThinkingAnimation
          steps={CRISE_DATA.observe.thinking}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("observe")}
        />
      )}

      {/* === OBSERVE — Facts === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["observe"] && (
        <BotBubble code="CEOB" text="" phaseLabel="OBSERVER — Faits bruts" time="07:13">
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
          {stage === "observe" && !showFactsChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowFactsChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger l'analyse
              </button>
              <button onClick={() => { setFactsFilled(true); setStage("orient"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Orienter
              </button>
              <button onClick={() => setFactsFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire faits
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showFactsChallenge && (
        <BotBubble code="CSOB" text="" phaseLabel="Challenge — CSO" time="07:13">
          <p className="text-sm text-gray-800">{FACTS_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setFactsFilled(true); setStage("orient"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Orienter
            </button>
          </div>
        </BotBubble>
      )}

      {/* === ORIENT — Options === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["orient"] && (
        <BotBubble code="CEOB" text="" phaseLabel="ORIENTER — Options" time="07:13">
          <p className="text-sm text-gray-800">{CRISE_DATA.orient.ceoMessage}</p>
          <div className="mt-2 space-y-1.5">
            {CRISE_DATA.orient.options.map((opt) => (
              <div key={opt.num} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                <p className="text-[9px] font-bold text-gray-800">Option {opt.num} : {opt.text}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">{opt.consequence}</p>
              </div>
            ))}
          </div>
          {stage === "orient" && !showOptionsDebat && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowOptionsDebat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Debat CSO vs CFO
              </button>
              <button onClick={() => { setOptionsFilled(true); setStage("decide-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Decider
              </button>
              <button onClick={() => setOptionsFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire options
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showOptionsDebat && (
        <>
          <BotBubble code="CSOB" text="" phaseLabel="Reponse CSO" time="07:14">
            <p className="text-sm text-gray-800">{OPTIONS_DEBATE.cso}</p>
          </BotBubble>
          <BotBubble code="CFOB" text="" phaseLabel="Reponse CFO" time="07:14">
            <p className="text-sm text-gray-800">{OPTIONS_DEBATE.cfob}</p>
          </BotBubble>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
            <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
            <p className="text-xs text-purple-700">{OPTIONS_DEBATE.consensus}</p>
          </div>
          <div className="flex gap-2 flex-wrap px-1 mt-1">
            <button onClick={() => { setOptionsFilled(true); setStage("decide-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Decider
            </button>
          </div>
        </>
      )}

      {/* DECIDE thinking */}
      {stage === "decide-thinking" && (
        <ThinkingAnimation
          steps={CRISE_DATA.decide.thinking}
          botEmoji="🎩"
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("decide")}
        />
      )}

      {/* === DECIDE — Directives === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["decide"] && (
        <BotBubble code="CEOB" text="" phaseLabel="DECIDER — Mobilisation" time="07:14">
          <p className="text-sm text-gray-800">{CRISE_DATA.decide.ceoDirective}</p>
          <div className="mt-1.5 space-y-1">
            {CRISE_DATA.decide.assignments.map((a, i) => {
              const bot = BOT_COLORS[a.bot];
              return (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 flex items-center gap-1.5">
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] shrink-0", bot?.bg || "bg-gray-400")}>{bot?.emoji}</div>
                  <span className="text-[9px] font-bold text-gray-700">{bot?.name || a.bot}</span>
                  <span className="text-[9px] text-gray-500 truncate flex-1">{a.task.substring(0, 60)}...</span>
                </div>
              );
            })}
          </div>
          {stage === "decide" && !showDirectiveChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowDirectiveChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger la mobilisation
              </button>
              <button onClick={() => { setDirectivesFilled(true); setStage("act"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Plan correctif
              </button>
              <button onClick={() => setDirectivesFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire directives
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showDirectiveChallenge && (
        <BotBubble code="COOB" text="" phaseLabel="Challenge — COO" time="07:15">
          <p className="text-sm text-gray-800">{DIRECTIVE_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setDirectivesFilled(true); setStage("act"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Plan correctif
            </button>
          </div>
        </BotBubble>
      )}

      {/* Sentinel */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 challenges — en mode crise, on debat moins et on agit plus. Le chrono tourne.</p>
        </div>
      )}

      {/* === ACT — Plan correctif === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["act"] && (
        <BotBubble code="CEOB" text="" phaseLabel="AGIR — Plan correctif" time="07:15">
          <p className="text-sm text-gray-800">Plan correctif Aeromax pret. 4 sections : reconnaissance, actions immediates (0-72h), actions structurelles (0-30j), engagements de performance.</p>
          {stage === "act" && !showContreArgument && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Contre-argument
              </button>
              <button onClick={() => { setPlanFilled(true); setStage("resultat"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Resultat
              </button>
              <button onClick={() => setPlanFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire plan
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showContreArgument && (
        <BotBubble code="CFOB" text="" phaseLabel="Contre-argument — CFO" time="07:16">
          <p className="text-sm text-gray-800">{CONTRE_ARGUMENT}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setPlanFilled(true); setStage("resultat"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Resultat
            </button>
          </div>
        </BotBubble>
      )}

      {/* RESULTAT */}
      {stage === "resultat" && (
        <BotBubble code="CEOB" text="" phaseLabel="Resultat" time="07:16">
          <div className="space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Crise contenue</p>
            </div>
            <p className="text-sm text-gray-800">{CRISE_DATA.act.resultat}</p>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Exporter PDF
            </button>
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1">
              <Send className="h-3.5 w-3.5" /> Envoyer au client
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
          <p className="text-[9px]">OODA : Observer → Orienter → Decider → Agir</p>
        </div>
      )}
    </div>
  );

  return (
    <AtelierLayout
      title="Mode Crise"
      icon={Zap}
      iconColor="text-orange-600"
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
