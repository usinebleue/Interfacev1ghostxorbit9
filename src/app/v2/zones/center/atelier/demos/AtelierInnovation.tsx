"use client";

/**
 * AtelierInnovation.tsx — Mode Innovation — SIMULATION COMPLETE SELF-CONTAINED
 * Pattern: SimPhaseReflexion gold standard — TopBar 6 sections, sub-tabs, breadcrumb, 40/60 split
 * Flow: 8 stages — intro, thinking, 3 techniques laterales (Analogie/Inversion/Biomimetisme),
 *       faisabilite-thinking, modele hybride, conclusion
 * Challenge inline: CFO/CHRO challenges, CMO vs CFO debate, contre-argument, sentinel
 * DocForge right panel: 5 sections with scoring bars
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
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Target,
  Lightbulb,
  Shuffle,
  Leaf,
  BarChart3,
  TrendingUp,
  Layers,
  Download,
  Mic,
  FileText,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { INNOVATION_DATA } from "../../scenarios/innovation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Phase = "reflexion" | "atelier" | "command";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

type Stage =
  | "intro"
  | "thinking"
  | "technique1"
  | "technique2"
  | "technique3"
  | "faisabilite-thinking"
  | "faisabilite"
  | "conclusion";

const STAGE_ORDER: Stage[] = [
  "intro", "thinking", "technique1", "technique2",
  "technique3", "faisabilite-thinking", "faisabilite", "conclusion",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Reflexion...", technique1: "Analogie",
  technique2: "Inversion", technique3: "Biomimetisme",
  "faisabilite-thinking": "Evaluation...", faisabilite: "Modele Hybride", conclusion: "Conclusion",
};

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// ═══════════════════════════════════════
// CHALLENGE DATA
// ═══════════════════════════════════════

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

export function AtelierInnovation({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
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
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showAnalogieChallenge, showInversionDebat, showBiomimetismeChallenge, showContreArgument, showSentinel]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => {
    setStage("intro"); setTyped(false);
    setShowAnalogieChallenge(false); setShowInversionDebat(false);
    setShowBiomimetismeChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setContexteFilled(false); setAnalogieFilled(false);
    setInversionFilled(false); setBiomimetismeFilled(false); setModeleFilled(false);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const handleChallenge = (setter: (v: boolean) => void) => {
    const next = challengeCount + 1;
    setChallengeCount(next);
    setter(true);
    if (next >= 3 && !showSentinel) setShowSentinel(true);
  };

  const filledCount = [contexteFilled, analogieFilled, inversionFilled, biomimetismeFilled, modeleFilled].filter(Boolean).length;

  // Phase — innovation is always "atelier" phase (creative mode)
  const currentPhase: Phase = si >= STAGE_ORDER.indexOf("thinking") ? "atelier" : "reflexion";

  // Discussion context changes with stages
  const discussionContext =
    si <= STAGE_ORDER.indexOf("intro") ? "CarlOS — Mode Innovation" :
    si <= STAGE_ORDER.indexOf("technique1") ? "Technique 1 — Analogie" :
    si <= STAGE_ORDER.indexOf("technique2") ? "Technique 2 — Inversion" :
    si <= STAGE_ORDER.indexOf("technique3") ? "Technique 3 — Biomimetisme" :
    si <= STAGE_ORDER.indexOf("faisabilite") ? "Modele Hybride" :
    "Innovation — Conclusion";

  // Active bots per stage
  const activeBots =
    si <= STAGE_ORDER.indexOf("intro") ? [] :
    si <= STAGE_ORDER.indexOf("technique1") ? [{ code: "CTOB" }] :
    si <= STAGE_ORDER.indexOf("technique2") ? [{ code: "CTOB" }, { code: "CMOB" }] :
    [{ code: "CTOB" }, { code: "CMOB" }, { code: "COOB" }];

  // Breadcrumb
  const breadcrumb: string[] =
    si <= STAGE_ORDER.indexOf("intro") ? ["Innovation", "Connecter"] :
    si <= STAGE_ORDER.indexOf("thinking") ? ["Innovation", "Reflexion"] :
    si <= STAGE_ORDER.indexOf("technique1") ? ["Innovation", "3 Techniques", "Analogie"] :
    si <= STAGE_ORDER.indexOf("technique2") ? ["Innovation", "3 Techniques", "Inversion"] :
    si <= STAGE_ORDER.indexOf("technique3") ? ["Innovation", "3 Techniques", "Biomimetisme"] :
    si <= STAGE_ORDER.indexOf("faisabilite") ? ["Innovation", "Synthese", "Modele Hybride"] :
    ["Innovation", "Conclusion"];

  // Active nav
  const activeNav = "dept";
  const activeSubTab = -1; // sub-tabs hidden during innovation mode

  // ═══════════════════════════════════════
  // CHAT CONTENT (LEFT)
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* User tension */}
      <div className="flex justify-end">
        <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
          <p className="text-sm text-blue-900">{INNOVATION_DATA.userTension}</p>
          <p className="text-[9px] text-blue-400 mt-1 text-right">15:10</p>
        </div>
      </div>

      {/* CEO intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text={INNOVATION_DATA.ceoIntro}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => { setContexteFilled(true); goNext("thinking"); }} className="text-[9px] px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full hover:bg-pink-100 flex items-center gap-1 cursor-pointer border border-pink-200">
                    <Sparkles className="h-3.5 w-3.5" /> Lancer l'innovation
                  </button>
                  <button onClick={() => setContexteFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer border border-green-200">
                    <Pin className="h-3.5 w-3.5" /> Extraire contexte
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mode Innovation lance — 3 techniques laterales</p>}
        </SBubble>
      )}

      {/* Thinking */}
      {stage === "thinking" && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-pink-600 font-medium">CarlOS active le mode Innovation...</span>
          </div>
          <div className="space-y-1">
            {INNOVATION_DATA.ceoThinking.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                <BotAvatar code="CEOB" size="sm" />
                <span>{step.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          <AutoAdvance onComplete={() => goNext("technique1")} delay={2500} />
        </div>
      )}

      {/* === TECHNIQUE 1 — Analogie (CTO) === */}
      {si >= STAGE_ORDER.indexOf("technique1") && (
        <SBubble code="CTOB" collapsed={si > STAGE_ORDER.indexOf("technique1") && !showAnalogieChallenge}>
          {si === STAGE_ORDER.indexOf("technique1") || showAnalogieChallenge ? (
            <>
              <div className="mb-1">
                <span className="text-[9px] bg-fuchsia-100 text-fuchsia-700 px-1.5 py-0.5 rounded-full font-bold">Technique 1 — Analogie</span>
              </div>
              <p className="text-sm text-gray-700">{INNOVATION_DATA.technique1.botProposal}</p>
              {/* Inline sources */}
              <div className="mt-2 space-y-1">
                {INNOVATION_DATA.technique1.sources.map((src, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                    <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[9px] text-gray-700 truncate">{src.label}</span>
                  </div>
                ))}
              </div>
              {stage === "technique1" && !showAnalogieChallenge && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowAnalogieChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer border border-amber-200">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger les chiffres
                  </button>
                  <button onClick={() => { setAnalogieFilled(true); goNext("technique2"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer border border-blue-200">
                    <ArrowRight className="h-3.5 w-3.5" /> Technique 2
                  </button>
                  <button onClick={() => setAnalogieFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer border border-green-200">
                    <Pin className="h-3.5 w-3.5" /> Extraire technique
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tim — Analogie: Abonnement Zero-Panne, 3.6M$/an</p>}
        </SBubble>
      )}

      {showAnalogieChallenge && (
        <SBubble code="CFOB" collapsed={false}>
          <div className="mb-1">
            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Challenge — CFO</span>
          </div>
          <p className="text-sm text-gray-700">{ANALOGIE_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <SBtn onClick={() => { setAnalogieFilled(true); goNext("technique2"); }} icon={ArrowRight} label="Technique 2" />
          </div>
        </SBubble>
      )}

      {/* === TECHNIQUE 2 — Inversion (CMO) === */}
      {si >= STAGE_ORDER.indexOf("technique2") && (
        <SBubble code="CMOB" collapsed={si > STAGE_ORDER.indexOf("technique2") && !showInversionDebat}>
          {si === STAGE_ORDER.indexOf("technique2") || showInversionDebat ? (
            <>
              <div className="mb-1">
                <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">Technique 2 — Inversion</span>
              </div>
              <p className="text-sm text-gray-700">{INNOVATION_DATA.technique2.botProposal}</p>
              {/* Inline sources */}
              <div className="mt-2 space-y-1">
                {INNOVATION_DATA.technique2.sources.map((src, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                    <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[9px] text-gray-700 truncate">{src.label}</span>
                  </div>
                ))}
              </div>
              {stage === "technique2" && !showInversionDebat && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowInversionDebat)} className="text-[9px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 flex items-center gap-1 cursor-pointer border border-purple-200">
                    <MessageSquare className="h-3.5 w-3.5" /> Debat CMO vs CFO
                  </button>
                  <button onClick={() => { setInversionFilled(true); goNext("technique3"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer border border-blue-200">
                    <ArrowRight className="h-3.5 w-3.5" /> Technique 3
                  </button>
                  <button onClick={() => setInversionFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer border border-green-200">
                    <Pin className="h-3.5 w-3.5" /> Extraire technique
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mathilde — Inversion: Performance-as-a-Service, 3.9M$/an</p>}
        </SBubble>
      )}

      {showInversionDebat && (
        <>
          <SBubble code="CMOB" collapsed={false}>
            <div className="mb-1">
              <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">Reponse CMO</span>
            </div>
            <p className="text-sm text-gray-700">{INVERSION_DEBATE.cmob}</p>
          </SBubble>
          <SBubble code="CFOB" collapsed={false}>
            <div className="mb-1">
              <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">Reponse CFO</span>
            </div>
            <p className="text-sm text-gray-700">{INVERSION_DEBATE.cfob}</p>
          </SBubble>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mx-1">
            <p className="text-[9px] font-bold text-purple-800 mb-1 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Consensus</p>
            <p className="text-xs text-purple-700">{INVERSION_DEBATE.consensus}</p>
          </div>
          <div className="flex gap-2 flex-wrap px-1 mt-1">
            <SBtn onClick={() => { setInversionFilled(true); goNext("technique3"); }} icon={ArrowRight} label="Technique 3" />
          </div>
        </>
      )}

      {/* === TECHNIQUE 3 — Biomimetisme (COO) === */}
      {si >= STAGE_ORDER.indexOf("technique3") && (
        <SBubble code="COOB" collapsed={si > STAGE_ORDER.indexOf("technique3") && !showBiomimetismeChallenge}>
          {si === STAGE_ORDER.indexOf("technique3") || showBiomimetismeChallenge ? (
            <>
              <div className="mb-1">
                <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Technique 3 — Biomimetisme</span>
              </div>
              <p className="text-sm text-gray-700">{INNOVATION_DATA.technique3.botProposal}</p>
              {/* Inline sources */}
              <div className="mt-2 space-y-1">
                {INNOVATION_DATA.technique3.sources.map((src, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                    <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[9px] text-gray-700 truncate">{src.label}</span>
                  </div>
                ))}
              </div>
              {stage === "technique3" && !showBiomimetismeChallenge && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowBiomimetismeChallenge)} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer border border-amber-200">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger l'adoption
                  </button>
                  <button onClick={() => { setBiomimetismeFilled(true); goNext("faisabilite-thinking"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer border border-blue-200">
                    <ArrowRight className="h-3.5 w-3.5" /> Evaluer & Fusionner
                  </button>
                  <button onClick={() => setBiomimetismeFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer border border-green-200">
                    <Pin className="h-3.5 w-3.5" /> Extraire technique
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Olivier — Biomimetisme: Operateur Certifie, 2.7M$/an</p>}
        </SBubble>
      )}

      {showBiomimetismeChallenge && (
        <SBubble code="CHROB" collapsed={false}>
          <div className="mb-1">
            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Challenge — CHRO</span>
          </div>
          <p className="text-sm text-gray-700">{BIOMIMETISME_CHALLENGE}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <SBtn onClick={() => { setBiomimetismeFilled(true); goNext("faisabilite-thinking"); }} icon={ArrowRight} label="Evaluer & Fusionner" />
          </div>
        </SBubble>
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
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-pink-600 font-medium">CarlOS fusionne les 3 techniques...</span>
          </div>
          <div className="space-y-1">
            {INNOVATION_DATA.syntheseThinking.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                <BotAvatar code="CEOB" size="sm" />
                <span>{step.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          <AutoAdvance onComplete={() => goNext("faisabilite")} delay={2500} />
        </div>
      )}

      {/* === SYNTHESE — Modele Hybride === */}
      {si >= STAGE_ORDER.indexOf("faisabilite") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("faisabilite") && !showContreArgument}>
          {si === STAGE_ORDER.indexOf("faisabilite") || showContreArgument ? (
            <>
              <div className="mb-1">
                <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-bold">Modele Hybride</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">{INNOVATION_DATA.synthese.titre}</p>
                <p className="text-sm text-gray-700">{INNOVATION_DATA.synthese.recommendation}</p>
              </div>
              {stage === "faisabilite" && !showContreArgument && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => handleChallenge(setShowContreArgument)} className="text-[9px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 flex items-center gap-1 cursor-pointer border border-red-200">
                    <Eye className="h-3.5 w-3.5" /> Contre-argument
                  </button>
                  <button onClick={() => { setModeleFilled(true); goNext("conclusion"); }} className="text-[9px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 flex items-center gap-1 cursor-pointer border border-blue-200">
                    <ArrowRight className="h-3.5 w-3.5" /> Conclure
                  </button>
                  <button onClick={() => setModeleFilled(true)} className="text-[9px] px-2.5 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 flex items-center gap-1 cursor-pointer border border-green-200">
                    <Pin className="h-3.5 w-3.5" /> Extraire modele
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">CarlOS — Modele Hybride en 3 phases</p>}
        </SBubble>
      )}

      {showContreArgument && (
        <SBubble code="CFOB" collapsed={false}>
          <div className="mb-1">
            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">Contre-argument — CFO</span>
          </div>
          <p className="text-sm text-gray-700">{CONTRE_ARGUMENT}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <SBtn onClick={() => { setModeleFilled(true); goNext("conclusion"); }} icon={ArrowRight} label="Conclure" />
          </div>
        </SBubble>
      )}

      {/* Conclusion */}
      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <div className="mb-1">
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Obtenir</span>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Innovation documentee.</p>
            <p className="text-xs text-gray-600">{INNOVATION_DATA.synthese.conclusion}</p>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1 cursor-pointer border border-gray-200">
              <Download className="h-3.5 w-3.5" /> Exporter PDF
            </button>
            <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1 cursor-pointer border border-gray-200">
              <Send className="h-3.5 w-3.5" /> Envoyer au Board Room
            </button>
          </div>
        </SBubble>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // RIGHT PANEL — DocForge Innovation Document
  // ═══════════════════════════════════════

  const rightContent = (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
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
        <Sparkles className="h-4 w-4 text-pink-600" />
        <span className="text-sm font-bold text-gray-800">Mode Innovation</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-pink-500" : i < si ? "w-2 bg-pink-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className={cn("h-1 shrink-0", "bg-pink-500")} />

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
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2",
            cn(PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border)
          )}>
            {/* Bot team avatars LEFT */}
            {activeBots.length > 0 && (
              <div className="flex items-center gap-1.5">
                {activeBots.map(b => (
                  <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                    <BotAvatar code={b.code} size="sm" />
                    <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b.code]?.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
            {/* Phase badges RIGHT */}
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
                  activeNav === nav.id ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs (hidden during innovation but structure preserved) */}
          {activeNav === "dept" && activeSubTab >= 0 && (
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
          )}

          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 flex items-center gap-1.5">
              {breadcrumb.map((c, i, arr) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                  <span className={cn("text-[11px]", i === arr.length - 1 ? "text-gray-800 font-medium" : "text-gray-400 hover:text-gray-600 cursor-pointer")}>{c}</span>
                </div>
              ))}
            </div>
          )}

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
