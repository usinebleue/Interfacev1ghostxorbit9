/**
 * AtelierTimCode.tsx — Atelier split-screen "Tim Code" V2
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: Document code qui se batit progressivement (5 sections) — pattern DocForge
 * Data: TIMCODE_DATA (timcode-data.ts)
 * Particularite: Tim (CTOB) lead — workflow dev (plan, code, debug, test)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Code2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  MessageSquare,
  AlertTriangle,
  Terminal,
  FileCode,
  Bug,
  FlaskConical,
  Play,
  Circle,
  Download,
  Cpu,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
} from "../../shared/simulation-components";
import { TIMCODE_DATA } from "./timcode-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage =
  | "intro"
  | "thinking"
  | "planification"
  | "codage"
  | "debogage"
  | "test-thinking"
  | "test"
  | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, planification: 2, codage: 3,
  debogage: 4, "test-thinking": 5, test: 6, conclusion: 7,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Reflexion...", planification: "Planification",
  codage: "Codage", debogage: "Debogage",
  "test-thinking": "Execution tests...", test: "Tests", conclusion: "Livrable",
};

// ========== STATE BAR STEPS ==========

const STATE_STEPS = [
  { id: "planification", label: "Plan", icon: FileCode },
  { id: "codage", label: "Code", icon: Code2 },
  { id: "debogage", label: "Debug", icon: Bug },
  { id: "test", label: "Test", icon: FlaskConical },
  { id: "conclusion", label: "Done", icon: CheckCircle2 },
];

function stateStepStatus(stepId: string, stage: Stage): "done" | "active" | "pending" {
  const stageOrder = ["planification", "codage", "debogage", "test", "conclusion"];
  const stageToStep: Record<string, string> = {
    planification: "planification", codage: "codage", debogage: "debogage",
    "test-thinking": "test", test: "test", conclusion: "conclusion",
  };
  const currentStep = stageToStep[stage];
  if (!currentStep) return "pending";
  const currentIdx = stageOrder.indexOf(currentStep);
  const stepIdx = stageOrder.indexOf(stepId);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

// ========== CHALLENGE DATA ==========

const PLAN_CHALLENGE =
  "Tim, pourquoi ecrire un script Python? Carl a deja Excel — un tableau croise dynamique fait la meme chose en 10 minutes. Le ROI d'automatiser un rapport trimestriel = negatif si on le fait qu'une fois. Le script se justifie SEULEMENT si on l'execute au moins mensuellement. Sinon c'est du gold-plating technique.";

const CODE_DEBATE = {
  cisob: "Le script lit des CSV sans validation. Un fichier malveillant avec des formules Excel embedees (=SYSTEM()) passerait droit. Et l'encodage UTF-8 force sans try/except — un fichier ISO-8859-1 planterait silencieusement avec des donnees corrompues. Minimum: validation du schema + try/except sur l'encodage.",
  ctob: "Point valide. J'ajoute une validation du header CSV avant le traitement — si les colonnes attendues sont absentes, le script refuse de continuer. Pour l'encodage, je detecte automatiquement avec chardet plutot que de forcer UTF-8. C'est 5 lignes de plus mais ca couvre les 2 risques.",
  consensus: "Validation header + detection encodage automatique. Cout: 5 lignes. Benefice: zero crash sur donnees invalides.",
};

const DEBUG_CHALLENGE =
  "Le bug de division par zero est corrige, mais il y a un probleme plus subtil. Si une ligne de production a des couts negatifs dans le CSV (credit, retour, ajustement comptable), le calcul de gaspillage devient faux — on soustrait un negatif, ce qui gonfle artificiellement le taux. CNC-04 a 28.3% de gaspillage mais si on exclut les ajustements de -12K$, ca tombe a 23.1%. Les 5 points d'ecart changent la priorite.";

const CONTRE_ARGUMENT =
  "Le script marche et les tests passent, mais on automatise un symptome. Les 486K$ de gaspillage sont la depuis des mois — le vrai probleme c'est que personne ne regarde les chiffres. Un dashboard temps reel avec alertes automatiques (>20% = notification Slack) aurait plus d'impact qu'un script qu'il faut lancer manuellement. L'etape cron job devrait etre Etape 1, pas 'prochaine etape'.";

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

export function AtelierTimCode({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
  const [showPlanChallenge, setShowPlanChallenge] = useState(false);
  const [showCodeDebat, setShowCodeDebat] = useState(false);
  const [showDebugChallenge, setShowDebugChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [contexteFilled, setContexteFilled] = useState(false);
  const [codeFilled, setCodeFilled] = useState(false);
  const [debugFilled, setDebugFilled] = useState(false);
  const [testFilled, setTestFilled] = useState(false);
  const [syntheseFilled, setSyntheseFilled] = useState(false);

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowPlanChallenge(false); setShowCodeDebat(false);
    setShowDebugChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setContexteFilled(false); setCodeFilled(false);
    setDebugFilled(false); setTestFilled(false); setSyntheseFilled(false);
  };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [contexteFilled, codeFilled, debugFilled, testFilled, syntheseFilled].filter(Boolean).length;

  // ========== CHAT CONTENT (LEFT) ==========
  const chatContent = (
    <>
      <UserBubble text={TIMCODE_DATA.userTension} time="15:10" />

      {/* Tim intro */}
      {stage === "intro" && (
        <BotBubble code="CTOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text={TIMCODE_DATA.ceoIntro}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => { setContexteFilled(true); setStage("thinking"); }} className="text-[9px] px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full hover:bg-violet-100 flex items-center gap-1">
                <Code2 className="h-3.5 w-3.5" /> Demarrer le plan
              </button>
              <button onClick={() => setContexteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire contexte
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble code="CTOB" text={TIMCODE_DATA.ceoIntro} phaseLabel="Connecter" time="15:10" />
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <ThinkingAnimation
          steps={TIMCODE_DATA.ceoThinking}
          botEmoji="💻"
          botCode="CTOB"
          botName="Tim"
          onComplete={() => setStage("planification")}
        />
      )}

      {/* === PLANIFICATION === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["planification"] && (
        <BotBubble code="CTOB" text="" phaseLabel="Plan d'execution" time="15:11">
          <p className="text-sm text-gray-800">Plan pret. 4 etapes: structurer le script, coder l'analyse CSV, deboguer les edge cases, puis valider avec des tests unitaires. On commence.</p>
          <div className="mt-2 bg-violet-50 border border-violet-200 rounded-lg p-2">
            {TIMCODE_DATA.plan.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 py-1">
                <span className="text-[9px] text-violet-500 font-bold w-4">{i + 1}.</span>
                <span className="text-[9px] text-violet-800 font-semibold">{step.titre}</span>
                <span className="text-[9px] text-violet-500 ml-auto">{step.description.slice(0, 50)}...</span>
              </div>
            ))}
          </div>
          {stage === "planification" && !showPlanChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowPlanChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger l'approche
              </button>
              <button onClick={() => { setCodeFilled(true); setStage("codage"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Coder le script
              </button>
              <button onClick={() => setContexteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire plan
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showPlanChallenge && (
        <BotBubble code="CFOB" text="" phaseLabel="Challenge — CFO" time="15:11">
          <p className="text-sm text-gray-800">{PLAN_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setCodeFilled(true); setStage("codage"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Coder quand meme
            </button>
          </div>
        </BotBubble>
      )}

      {/* === CODAGE === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["codage"] && (
        <BotBubble code="CTOB" text="" phaseLabel="Code ecrit" time="15:13">
          <p className="text-sm text-gray-800">Le script est ecrit — lecture CSV, calcul des taux de gaspillage par ligne de production, et extraction du top 3. Je le passe en execution pour valider les resultats.</p>
          {stage === "codage" && !showCodeDebat && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowCodeDebat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Review securite CISO
              </button>
              <button onClick={() => { setDebugFilled(true); setStage("debogage"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Debugger
              </button>
              <button onClick={() => setCodeFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire code
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showCodeDebat && (
        <>
          <BotBubble code="CISOB" text="" phaseLabel="Review — CISO" time="15:13">
            <p className="text-sm text-gray-800">{CODE_DEBATE.cisob}</p>
          </BotBubble>
          <BotBubble code="CTOB" text="" phaseLabel="Reponse Tim" time="15:14">
            <p className="text-sm text-gray-800">{CODE_DEBATE.ctob}</p>
          </BotBubble>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
            <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> Consensus</p>
            <p className="text-xs text-purple-700">{CODE_DEBATE.consensus}</p>
          </div>
          <div className="flex gap-2 flex-wrap px-1 mt-1">
            <button onClick={() => { setDebugFilled(true); setStage("debogage"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Debugger
            </button>
          </div>
        </>
      )}

      {/* === DEBOGAGE === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["debogage"] && (
        <BotBubble code="CTOB" text="" phaseLabel="Debug" time="15:15">
          <p className="text-sm text-gray-800">{TIMCODE_DATA.debugMessage}</p>
          {stage === "debogage" && !showDebugChallenge && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowDebugChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1">
                <ShieldQuestion className="h-3.5 w-3.5" /> Challenger les edge cases
              </button>
              <button onClick={() => { setTestFilled(true); setStage("test-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Lancer les tests
              </button>
              <button onClick={() => setDebugFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire corrections
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showDebugChallenge && (
        <BotBubble code="CFOB" text="" phaseLabel="Challenge — CFO" time="15:15">
          <p className="text-sm text-gray-800">{DEBUG_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setTestFilled(true); setStage("test-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Lancer les tests
            </button>
          </div>
        </BotBubble>
      )}

      {/* Sentinel */}
      {showSentinel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-1">
          <p className="text-[9px] font-bold text-amber-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle Anti-Boucle</p>
          <p className="text-xs text-amber-700 mt-1">3 reviews — le code est solide. C'est l'heure de tester et livrer.</p>
        </div>
      )}

      {/* Test thinking */}
      {stage === "test-thinking" && (
        <ThinkingAnimation
          steps={[
            { icon: FlaskConical, text: "Ecriture des tests unitaires..." },
            { icon: Play, text: "Execution de la suite de tests..." },
            { icon: CheckCircle2, text: "Validation des resultats..." },
          ]}
          botEmoji="💻"
          botCode="CTOB"
          botName="Tim"
          onComplete={() => setStage("test")}
        />
      )}

      {/* === TESTS === */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["test"] && (
        <BotBubble code="CTOB" text="" phaseLabel="Tests valides" time="15:16">
          <p className="text-sm text-gray-800">3 tests unitaires ecrits et executes. Tous passent: lecture CSV, calcul gaspillage, tri decroissant du top 3. Le code est solide.</p>
          {stage === "test" && !showContreArgument && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Contre-argument
              </button>
              <button onClick={() => { setSyntheseFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" /> Conclure
              </button>
              <button onClick={() => setTestFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1">
                <Pin className="h-3.5 w-3.5" /> Extraire resultats
              </button>
            </div>
          )}
        </BotBubble>
      )}

      {showContreArgument && (
        <BotBubble code="COOB" text="" phaseLabel="Contre-argument — COO" time="15:17">
          <p className="text-sm text-gray-800">{CONTRE_ARGUMENT}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button onClick={() => { setSyntheseFilled(true); setStage("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5" /> Conclure
            </button>
          </div>
        </BotBubble>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <BotBubble code="CTOB" text="" phaseLabel="Livrable" time="15:18">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Script livre et teste.</p>
            <p className="text-xs text-gray-600">{TIMCODE_DATA.synthese}</p>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Exporter .py
            </button>
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1">
              <Send className="h-3.5 w-3.5" /> Deployer en cron
            </button>
          </div>
        </BotBubble>
      )}
    </>
  );

  // ========== DOCUMENT CONTENT (RIGHT) ==========
  const atelierContent = (
    <div className="space-y-3">
      {/* Document header with state bar */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="h-5 w-5 text-violet-600" />
          <h3 className="text-sm font-bold text-violet-900">Rapport Tim Code — Analyse Production</h3>
        </div>
        <p className="text-xs text-violet-700 mb-3">{TIMCODE_DATA.titre}</p>
        {/* State bar inline */}
        {STAGE_INDEX[stage] >= STAGE_INDEX["planification"] && (
          <div className="flex items-center gap-1 mb-3">
            {STATE_STEPS.map((step, i) => {
              const status = stateStepStatus(step.id, stage);
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      status === "done" && "bg-green-500 text-white",
                      status === "active" && "bg-violet-600 text-white scale-110",
                      status === "pending" && "bg-gray-200 text-gray-400"
                    )}>
                      {status === "done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                    </div>
                    <span className={cn("text-[8px] font-medium", status === "done" ? "text-green-700" : status === "active" ? "text-violet-700 font-bold" : "text-gray-400")}>{step.label}</span>
                  </div>
                  {i < STATE_STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-1", stateStepStatus(STATE_STEPS[i + 1].id, stage) !== "pending" ? "bg-green-400" : status === "active" || status === "done" ? "bg-violet-300" : "bg-gray-200")} />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-violet-200/50 rounded-full h-2 overflow-hidden">
            <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${(filledCount / 5) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-violet-700">{filledCount}/5</span>
        </div>
      </div>

      {/* Section 1 — Contexte & Plan */}
      <DocSectionCard num={1} title="Contexte & Plan d'execution" filled={contexteFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-700">{TIMCODE_DATA.contexte}</p>
          </div>
          <div className="space-y-1.5">
            {TIMCODE_DATA.plan.map((step) => {
              const getPlanStatus = (planId: string): "pending" | "active" | "done" => {
                const order = ["plan", "code", "debug", "test"];
                const stageMap: Record<string, string> = { planification: "plan", codage: "code", debogage: "debug", "test-thinking": "test", test: "test", conclusion: "test" };
                const currentPlanId = stageMap[stage];
                if (!currentPlanId) return "pending";
                const ci = order.indexOf(currentPlanId);
                const si = order.indexOf(planId);
                if (si < ci) return "done";
                if (si === ci) return stage === "conclusion" ? "done" : "active";
                return "pending";
              };
              const status = getPlanStatus(step.id);
              return (
                <div key={step.id} className={cn("flex items-center gap-2 rounded-lg border p-2", status === "done" ? "bg-green-50 border-green-200" : status === "active" ? "bg-violet-50 border-violet-300" : "bg-gray-50 border-gray-200")}>
                  {status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                  {status === "active" && <Play className="h-3.5 w-3.5 text-violet-600 animate-pulse shrink-0" />}
                  {status === "pending" && <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
                  <span className={cn("text-[9px] font-semibold", status === "done" ? "text-green-800 line-through opacity-70" : status === "active" ? "text-violet-800" : "text-gray-500")}>{step.titre}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium ml-auto shrink-0", status === "done" ? "bg-green-100 text-green-700" : status === "active" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-400")}>{status === "done" ? "fait" : status === "active" ? "en cours" : "a venir"}</span>
                </div>
              );
            })}
          </div>
          {showPlanChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge CFO</p>
              <p className="text-[9px] text-amber-700 mt-0.5">ROI negatif si execution unique. Se justifie seulement en execution mensuelle minimum.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 2 — Code Source */}
      <DocSectionCard num={2} title="Code Source — analyse_couts_production.py" filled={codeFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-gray-950 rounded-lg p-3 overflow-x-auto max-h-[250px] overflow-y-auto">
            <pre className="text-[11px] leading-relaxed">
              <code className="text-green-400 font-mono whitespace-pre">{TIMCODE_DATA.codeSnippet}</code>
            </pre>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-gray-500">Langage:</span>
            <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">Python</span>
            <span className="text-gray-500 ml-auto">~40 lignes</span>
          </div>
          {showCodeDebat && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-purple-800">Consensus review</p>
              <p className="text-[9px] text-purple-700 mt-0.5">{CODE_DEBATE.consensus}</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 3 — Execution & Debug */}
      <DocSectionCard num={3} title="Execution & Debug" filled={debugFilled}>
        <div className="pt-2 space-y-2">
          {/* Terminal */}
          <div className="bg-black rounded-lg overflow-hidden">
            <div className="px-3 py-1.5 flex items-center gap-2 border-b border-gray-800">
              <Terminal className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[9px] font-bold text-green-300">Terminal</span>
              <div className="flex items-center gap-1 ml-auto">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
            <pre className="p-3 overflow-x-auto text-[9px] leading-relaxed max-h-[180px] overflow-y-auto">
              <code className="text-gray-300 font-mono whitespace-pre">{TIMCODE_DATA.terminalOutput}</code>
            </pre>
          </div>
          {/* Bug fixes */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Bug className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-[9px] font-bold text-orange-800">Bugs corriges</span>
            </div>
            <p className="text-[9px] text-orange-700">Division par zero (guard ajoutee) + encodage CSV (accents)</p>
          </div>
          {showDebugChallenge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-amber-800">Challenge — Edge case</p>
              <p className="text-[9px] text-amber-700 mt-0.5">Couts negatifs (ajustements) gonflent le taux. CNC-04: 28.3% a 23.1% apres correction.</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Section 4 — Tests */}
      <DocSectionCard num={4} title="Tests Unitaires" filled={testFilled}>
        <div className="pt-2 space-y-2">
          <div className="bg-gray-950 rounded-lg p-3 overflow-x-auto">
            <pre className="text-[9px] leading-relaxed">
              <code className="text-green-400 font-mono whitespace-pre">{TIMCODE_DATA.testOutput}</code>
            </pre>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 text-center">
              <p className="text-[9px] text-green-600 font-bold">Lecture CSV</p>
              <p className="text-[9px] font-bold text-green-800">PASSED</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 text-center">
              <p className="text-[9px] text-green-600 font-bold">Calcul</p>
              <p className="text-[9px] font-bold text-green-800">PASSED</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 text-center">
              <p className="text-[9px] text-green-600 font-bold">Tri Top 3</p>
              <p className="text-[9px] font-bold text-green-800">PASSED</p>
            </div>
          </div>
        </div>
      </DocSectionCard>

      {/* Section 5 — Synthese */}
      <DocSectionCard num={5} title="Synthese & Prochaines Etapes" filled={syntheseFilled}>
        <div className="pt-2 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-violet-600 font-bold">Gaspillage</p>
              <p className="text-sm font-bold text-violet-800">$486K</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-red-600 font-bold">Taux global</p>
              <p className="text-sm font-bold text-red-800">17.1%</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-[9px] text-green-600 font-bold">Tests</p>
              <p className="text-sm font-bold text-green-800">3/3</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-[9px] font-bold text-gray-700 mb-1">Prochaines etapes:</p>
            <ul className="space-y-0.5">
              <li className="text-[9px] text-gray-600 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Cron job quotidien</li>
              <li className="text-[9px] text-gray-600 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Alertes Slack si gaspillage depasse 20%</li>
              <li className="text-[9px] text-gray-600 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Dashboard CarlOS temps reel</li>
            </ul>
          </div>
          {showContreArgument && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-[9px] font-bold text-red-800">Contre-argument COO</p>
              <p className="text-[9px] text-red-700 mt-0.5">Automatisation = symptome. Dashboard temps reel + alertes devrait etre Etape 1, pas "prochaine etape".</p>
            </div>
          )}
        </div>
      </DocSectionCard>

      {/* Empty state */}
      {filledCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Code2 className="h-10 w-10 text-violet-300" />
          <p className="text-xs">L'atelier de code apparaîtra ici...</p>
          <p className="text-[9px]">Plan + Code + Terminal + Tests</p>
        </div>
      )}
    </div>
  );

  return (
    <AtelierLayout
      title="Tim Code"
      icon={Code2}
      iconColor="text-violet-600"
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
