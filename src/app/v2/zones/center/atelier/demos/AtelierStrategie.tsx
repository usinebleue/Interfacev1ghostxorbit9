"use client";

/**
 * AtelierStrategie.tsx — Mode Strategie — SIMULATION COMPLETE (SELF-CONTAINED)
 * Same cadre as SimPhaseReflexion: TopBar 6 sections, sub-tabs, breadcrumb, phase indicator
 * Flow: CEO+CSO+CFO analysis — SWOT, 3 scenarios, roadmap, risk matrix, challenges, debates, DocForge
 * Data: STRATEGIE_DATA (strategie-data.ts)
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
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Pin,
  Send,
  ShieldQuestion,
  Eye,
  AlertTriangle,
  Target,
  Download,
  Rocket,
  BarChart3,
  Mic,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { STRATEGIE_DATA } from "../../scenarios/strategie-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "intro"
  | "thinking"
  | "swot"
  | "scenarios"
  | "roadmap"
  | "risques"
  | "synthese-thinking"
  | "synthese"
  | "conclusion";

const STAGE_ORDER: Stage[] = [
  "intro",
  "thinking",
  "swot",
  "scenarios",
  "roadmap",
  "risques",
  "synthese-thinking",
  "synthese",
  "conclusion",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter",
  thinking: "Analyse...",
  swot: "SWOT",
  scenarios: "Scenarios",
  roadmap: "Roadmap",
  risques: "Risques",
  "synthese-thinking": "Synthese...",
  synthese: "Recommandation",
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
// CHALLENGE / DEBATE DATA
// ═══════════════════════════════════════

const SWOT_CHALLENGE =
  "La faiblesse 'aucune marque etablie' est surestimee. En B2B industriel, la marque compte moins que la reputation technique. Vos 25 ans d'expertise et vos certifications ISO/AS9100 SONT votre marque. Le vrai probleme c'est l'absence de canal de distribution, pas de notoriete.";

const SCENARIO_DEBATE = {
  cso: "Le scenario Equilibre est le bon compromis, mais le budget de 800K$ est serre. Si on perd un donneur d'ordre pendant la transition (risque R1), on n'a plus de marge. Je recommande de securiser une ligne de credit de 500K$ AVANT de lancer.",
  cfo: "Simone a raison. Et j'ajoute : les 800K$ ne comptent pas le cout d'opportunite. Chaque ingenieur R&D qui travaille sur le produit NE travaille PAS sur la sous-traitance. A 180$/h, c'est 400K$/an de capacite detournee. Budget reel : 1.2M$.",
  consensus: "Scenario Equilibre avec ligne de credit de securite 500K$ pre-approuvee. Budget reel incluant cout d'opportunite : ~1.2M$. Ajuster les projections en consequence.",
};

const ROADMAP_CHALLENGE =
  "La Phase 2 (prototype + beta) est trop courte a 60 jours. La certification CE/CSA seule prend 8-12 semaines. Je recommande 90-120 jours pour la Phase 2, quitte a allonger le calendrier global. Mieux vaut un prototype certifie en retard qu'un prototype non certifie a temps.";

const CONTRE_ARGUMENT =
  "Si je devais plaider contre toute cette strategie : la vraie question est pourquoi changer? La sous-traitance a 15M$ avec 70 employes, meme a marge comprimee, c'est un business stable. Le pivot vers le produit est sexy mais risque. 60% des pivots PME echouent. Pourquoi ne pas plutot optimiser la sous-traitance — diversifier les donneurs d'ordre, monter en gamme, negocier mieux?";

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AtelierStrategie({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [typed, setTyped] = useState(false);
  const [showSwotChallenge, setShowSwotChallenge] = useState(false);
  const [showScenarioDebat, setShowScenarioDebat] = useState(false);
  const [showRoadmapChallenge, setShowRoadmapChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);
  const [swotFilled, setSwotFilled] = useState(false);
  const [scenariosFilled, setScenariosFilled] = useState(false);
  const [roadmapFilled, setRoadmapFilled] = useState(false);
  const [risquesFilled, setRisquesFilled] = useState(false);
  const [recoFilled, setRecoFilled] = useState(false);
  const [conclusionFilled, setConclusionFilled] = useState(false);
  const [extractedNotes, setExtractedNotes] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, showSwotChallenge, showScenarioDebat, showRoadmapChallenge, showContreArgument, showSentinel]);

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
    setStage("intro");
    setTyped(false);
    setShowSwotChallenge(false);
    setShowScenarioDebat(false);
    setShowRoadmapChallenge(false);
    setShowContreArgument(false);
    setChallengeCount(0);
    setShowSentinel(false);
    setSwotFilled(false);
    setScenariosFilled(false);
    setRoadmapFilled(false);
    setRisquesFilled(false);
    setRecoFilled(false);
    setConclusionFilled(false);
    setExtractedNotes([]);
  };

  const filledCount = [swotFilled, scenariosFilled, roadmapFilled, risquesFilled, recoFilled, conclusionFilled].filter(Boolean).length;

  // Phase — always in "atelier" phase for strategy mode
  const currentPhase: Phase = "atelier";

  // Discussion context changes with stage
  const discussionContext =
    si <= STAGE_ORDER.indexOf("intro") ? "CarlOS — Direction" :
    si <= STAGE_ORDER.indexOf("swot") ? "Analyse Strategique — SWOT" :
    si <= STAGE_ORDER.indexOf("scenarios") ? "Comparaison Scenarios" :
    si <= STAGE_ORDER.indexOf("roadmap") ? "Roadmap 3 Phases" :
    si <= STAGE_ORDER.indexOf("risques") ? "Matrice de Risques" :
    "Synthese — Recommandation";

  // Active bots per stage
  const activeBots =
    si <= STAGE_ORDER.indexOf("intro") ? ["CEOB"] :
    si <= STAGE_ORDER.indexOf("swot") ? ["CEOB", "CSOB", "CTOB"] :
    si <= STAGE_ORDER.indexOf("scenarios") ? ["CEOB", "CSOB", "CFOB"] :
    si <= STAGE_ORDER.indexOf("roadmap") ? ["CEOB", "CSOB", "CFOB"] :
    si <= STAGE_ORDER.indexOf("risques") ? ["CFOB", "CEOB"] :
    ["CEOB", "CSOB", "CFOB"];

  // Active nav
  const activeNav = "dept";

  // Active sub-tab
  const activeSubTab = si <= STAGE_ORDER.indexOf("intro") ? 0 : si >= STAGE_ORDER.indexOf("swot") ? -1 : 3;

  // Breadcrumb
  const breadcrumb: string[] =
    si <= STAGE_ORDER.indexOf("intro") ? [] :
    si <= STAGE_ORDER.indexOf("swot") ? ["Direction", "Analyse Strategique", "SWOT"] :
    si <= STAGE_ORDER.indexOf("scenarios") ? ["Direction", "Analyse Strategique", "Scenarios"] :
    si <= STAGE_ORDER.indexOf("roadmap") ? ["Direction", "Analyse Strategique", "Roadmap"] :
    si <= STAGE_ORDER.indexOf("risques") ? ["Direction", "Analyse Strategique", "Risques"] :
    ["Direction", "Analyse Strategique", "Synthese"];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* User tension */}
      <div className="flex justify-end">
        <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
          <p className="text-sm text-blue-900">{STRATEGIE_DATA.userTension}</p>
          <p className="text-[9px] text-blue-400 text-right mt-1">11:00</p>
        </div>
      </div>

      {/* Stage: intro */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text={STRATEGIE_DATA.ceoIntro}
                speed={10}
                className="text-sm text-gray-700"
                onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("thinking")} icon={Send} label="Lancer l'analyse strategique" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mode Strategie — diagnostic SWOT + scenarios + roadmap + risques</p>}
        </SBubble>
      )}

      {/* Stage: thinking */}
      {stage === "thinking" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-amber-600 font-medium">CarlOS analyse en profondeur...</span>
          </div>
          <div className="space-y-1">
            {STRATEGIE_DATA.ceoThinking.map((step, i) => {
              const Ic = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                  <Ic className="h-3.5 w-3.5 text-amber-500" />
                  <span>{step.text}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-auto" />
                </div>
              );
            })}
          </div>
          <AutoAdvance onComplete={() => goNext("swot")} delay={2500} />
        </div>
      )}

      {/* ═══ SWOT ═══ */}
      {si >= STAGE_ORDER.indexOf("swot") && (
        <SBubble code="CSOB" collapsed={si > STAGE_ORDER.indexOf("swot")}>
          {si === STAGE_ORDER.indexOf("swot") ? (
            <>
              <p className="text-sm text-gray-800 mb-2">Analyse SWOT de votre position actuelle :</p>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {(["forces", "faiblesses", "opportunites", "menaces"] as const).map((quadrant) => {
                  const colors = { forces: "bg-green-50 border-green-200", faiblesses: "bg-red-50 border-red-200", opportunites: "bg-blue-50 border-blue-200", menaces: "bg-amber-50 border-amber-200" };
                  const labels = { forces: "Forces", faiblesses: "Faiblesses", opportunites: "Opportunites", menaces: "Menaces" };
                  return (
                    <div key={quadrant} className={cn("rounded-lg p-2 border", colors[quadrant])}>
                      <p className="text-[9px] font-bold text-gray-700 uppercase mb-1">{labels[quadrant]}</p>
                      {STRATEGIE_DATA.swot[quadrant].map((item, i) => (
                        <div key={i} className="mb-1">
                          <p className="text-xs font-medium text-gray-700">{item.titre}</p>
                          <p className="text-[9px] text-gray-500 leading-tight">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-purple-100 flex flex-wrap gap-2">
                {!showSwotChallenge && (
                  <button onClick={() => handleChallenge(() => setShowSwotChallenge(true))} className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-200 font-medium cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger les faiblesses
                  </button>
                )}
                <button onClick={() => { setSwotFilled(true); handleExtract("swot"); if (si === STAGE_ORDER.indexOf("swot")) goNext("scenarios"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire
                </button>
                {si === STAGE_ORDER.indexOf("swot") && (
                  <button onClick={() => goNext("scenarios")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> 3 Scenarios
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Simone — SWOT analyse, 4 quadrants</p>}
        </SBubble>
      )}

      {showSwotChallenge && (
        <SBubble code="CTOB" collapsed={false}>
          <p className="text-sm text-gray-700">{SWOT_CHALLENGE}</p>
        </SBubble>
      )}

      {/* ═══ SCENARIOS ═══ */}
      {si >= STAGE_ORDER.indexOf("scenarios") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("scenarios")}>
          {si === STAGE_ORDER.indexOf("scenarios") ? (
            <>
              <p className="text-sm text-gray-800 mb-2">3 scenarios de transition compares :</p>
              {STRATEGIE_DATA.scenarios.map((s) => (
                <div key={s.id} className={cn("mb-2 p-2 rounded-lg border", s.recommande ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-800">{s.titre}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", s.risqueColor)}>{s.risque}</span>
                    {s.recommande && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">RECOMMANDE</span>}
                  </div>
                  <p className="text-[9px] text-gray-600 mb-1">{s.description}</p>
                  <div className="flex gap-3 text-[9px] text-gray-500">
                    <span>{s.timeline}</span>
                    <span>{s.investissement}</span>
                    <span>Ratio: {s.ratio}</span>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap gap-2">
                {!showScenarioDebat && (
                  <button onClick={() => handleChallenge(() => setShowScenarioDebat(true))} className="text-[9px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 font-medium cursor-pointer">
                    <MessageSquare className="h-3.5 w-3.5" /> Debat CSO vs CFO
                  </button>
                )}
                <button onClick={() => { setScenariosFilled(true); handleExtract("scenarios"); if (si === STAGE_ORDER.indexOf("scenarios")) goNext("roadmap"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire
                </button>
                {si === STAGE_ORDER.indexOf("scenarios") && (
                  <button onClick={() => goNext("roadmap")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Roadmap
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">CarlOS — 3 scenarios compares, Equilibre recommande</p>}
        </SBubble>
      )}

      {showScenarioDebat && (
        <>
          <SBubble code="CSOB" collapsed={false}>
            <p className="text-sm text-gray-700">{SCENARIO_DEBATE.cso}</p>
          </SBubble>
          <SBubble code="CFOB" collapsed={false}>
            <p className="text-sm text-gray-700">{SCENARIO_DEBATE.cfo}</p>
          </SBubble>
          <div className="mx-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-[9px] font-bold text-purple-700 mb-0.5">CONSENSUS</p>
            <p className="text-xs text-purple-800">{SCENARIO_DEBATE.consensus}</p>
          </div>
        </>
      )}

      {/* ═══ ROADMAP ═══ */}
      {si >= STAGE_ORDER.indexOf("roadmap") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("roadmap")}>
          {si === STAGE_ORDER.indexOf("roadmap") ? (
            <>
              <p className="text-sm text-gray-800 mb-2">Roadmap 3 phases :</p>
              {STRATEGIE_DATA.roadmap.map((phase) => {
                const Ic = phase.icon;
                return (
                  <div key={phase.id} className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Ic className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-bold text-gray-800">{phase.phase} — {phase.titre}</span>
                      <span className="text-[9px] text-gray-400 ml-auto">{phase.periode}</span>
                    </div>
                    <ul className="space-y-0.5">
                      {phase.livrables.map((l, j) => (
                        <li key={j} className="text-[9px] text-gray-600 flex items-start gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[9px] text-purple-600 mt-1 italic">{phase.metriques}</p>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-t border-purple-100 flex flex-wrap gap-2">
                {!showRoadmapChallenge && (
                  <button onClick={() => handleChallenge(() => setShowRoadmapChallenge(true))} className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-200 font-medium cursor-pointer">
                    <ShieldQuestion className="h-3.5 w-3.5" /> Challenger Phase 2
                  </button>
                )}
                <button onClick={() => { setRoadmapFilled(true); handleExtract("roadmap"); if (si === STAGE_ORDER.indexOf("roadmap")) goNext("risques"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire
                </button>
                {si === STAGE_ORDER.indexOf("roadmap") && (
                  <button onClick={() => goNext("risques")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <Shield className="h-3.5 w-3.5" /> Matrice de risques
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">CarlOS — Roadmap 3 phases, audit + prototype + lancement</p>}
        </SBubble>
      )}

      {showRoadmapChallenge && (
        <SBubble code="CTOB" collapsed={false}>
          <p className="text-sm text-gray-700">{ROADMAP_CHALLENGE}</p>
        </SBubble>
      )}

      {/* ═══ RISQUES ═══ */}
      {si >= STAGE_ORDER.indexOf("risques") && (
        <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("risques")}>
          {si === STAGE_ORDER.indexOf("risques") ? (
            <>
              <p className="text-sm text-gray-800 mb-2">Matrice de risques — 4 risques identifies :</p>
              {STRATEGIE_DATA.riskMatrix.map((risk) => {
                const Ic = risk.icon;
                const qColors: Record<string, string> = { critique: "border-l-red-500 bg-red-50", surveiller: "border-l-amber-500 bg-amber-50", gerer: "border-l-blue-500 bg-blue-50", accepter: "border-l-green-500 bg-green-50" };
                return (
                  <div key={risk.id} className={cn("mb-2 p-2 rounded-lg border border-gray-200 border-l-[3px]", qColors[risk.quadrant])}>
                    <div className="flex items-center gap-2 mb-1">
                      <Ic className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs font-bold text-gray-800">{risk.titre}</span>
                      <span className="text-[9px] text-gray-400 ml-auto uppercase">{risk.quadrant}</span>
                    </div>
                    <p className="text-[9px] text-gray-600">{risk.mitigation}</p>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-t border-amber-100 flex flex-wrap gap-2">
                <button onClick={() => { setRisquesFilled(true); handleExtract("risques"); if (si === STAGE_ORDER.indexOf("risques")) goNext("synthese-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire
                </button>
                {si === STAGE_ORDER.indexOf("risques") && (
                  <button onClick={() => goNext("synthese-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <Target className="h-3.5 w-3.5" /> Synthetiser
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Frank — 4 risques, matrice probabilite x impact</p>}
        </SBubble>
      )}

      {/* Sentinel warning */}
      {showSentinel && (
        <div className="mx-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">Sentinelle : 3+ challenges. L'equipe a identifie des tensions significatives. Voulez-vous consolider avant de conclure?</p>
          </div>
        </div>
      )}

      {/* Stage: synthese-thinking */}
      {stage === "synthese-thinking" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-purple-600 font-medium">CarlOS consolide l'analyse...</span>
          </div>
          <div className="space-y-1">
            {STRATEGIE_DATA.syntheseThinking.map((step, i) => {
              const Ic = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600">
                  <Ic className="h-3.5 w-3.5 text-purple-500" />
                  <span>{step.text}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse ml-auto" />
                </div>
              );
            })}
          </div>
          <AutoAdvance onComplete={() => goNext("synthese")} delay={2500} />
        </div>
      )}

      {/* ═══ SYNTHESE ═══ */}
      {si >= STAGE_ORDER.indexOf("synthese") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("synthese")}>
          {si === STAGE_ORDER.indexOf("synthese") ? (
            <>
              <p className="text-sm text-gray-800 mb-2 font-medium">Recommandation finale</p>
              <p className="text-xs text-gray-700 mb-3">{STRATEGIE_DATA.synthese.recommandation}</p>
              <div className="space-y-1.5 mb-2">
                {STRATEGIE_DATA.synthese.prochaines_etapes.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
                    <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full shrink-0">{i + 1}</span>
                    <p className="text-xs text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap gap-2">
                {!showContreArgument && (
                  <button onClick={() => handleChallenge(() => setShowContreArgument(true))} className="text-[9px] bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-200 font-medium cursor-pointer">
                    <Eye className="h-3.5 w-3.5" /> Contre-argument
                  </button>
                )}
                <button onClick={() => { setRecoFilled(true); handleExtract("recommandation"); if (si === STAGE_ORDER.indexOf("synthese")) goNext("conclusion"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
                  <Pin className="h-3.5 w-3.5" /> Extraire
                </button>
                {si === STAGE_ORDER.indexOf("synthese") && (
                  <button onClick={() => goNext("conclusion")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                    <ArrowRight className="h-3.5 w-3.5" /> Conclure
                  </button>
                )}
              </div>
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Recommandation — Scenario Equilibre 24 mois</p>}
        </SBubble>
      )}

      {showContreArgument && (
        <SBubble code="CFOB" collapsed={false}>
          <p className="text-sm text-gray-700">{CONTRE_ARGUMENT}</p>
        </SBubble>
      )}

      {/* ═══ CONCLUSION ═══ */}
      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText
            text={STRATEGIE_DATA.synthese.conclusion}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => { setTyped(true); setConclusionFilled(true); }}
          />
          {typed && conclusionFilled && (
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
  // ROOT LAYOUT (same frame as SimPhaseReflexion)
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <BookOpen className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-bold text-gray-800">Mode Strategie</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-purple-500" : i < si ? "w-2 bg-purple-300" : "w-2 bg-gray-200"
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
          {/* Chat header — avatar LEFT, name CENTER, MessageSquare RIGHT */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar + bot avatars */}
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2",
            cn(PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border)
          )}>
            {/* Bot team avatars */}
            <div className="flex items-center gap-1.5">
              {activeBots.filter(b => b !== "CEOB").map(code => (
                <div key={code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                  <BotAvatar code={code} size="sm" />
                  <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[code]?.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
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

          {/* Sub-tabs Mon Departement */}
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
            <RightContent
              stage={stage}
              si={si}
              swotFilled={swotFilled}
              scenariosFilled={scenariosFilled}
              roadmapFilled={roadmapFilled}
              risquesFilled={risquesFilled}
              recoFilled={recoFilled}
              conclusionFilled={conclusionFilled}
              filledCount={filledCount}
              extractedNotes={extractedNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT
// ═══════════════════════════════════════

interface RightContentProps {
  stage: Stage;
  si: number;
  swotFilled: boolean;
  scenariosFilled: boolean;
  roadmapFilled: boolean;
  risquesFilled: boolean;
  recoFilled: boolean;
  conclusionFilled: boolean;
  filledCount: number;
  extractedNotes: string[];
}

function RightContent({ stage, si, swotFilled, scenariosFilled, roadmapFilled, risquesFilled, recoFilled, conclusionFilled, filledCount, extractedNotes }: RightContentProps) {
  if (stage === "intro" || stage === "thinking") return <ContentIntro />;
  if (stage === "swot") return <ContentSwotDetail />;
  if (stage === "scenarios") return <ContentScenariosDetail />;
  if (stage === "roadmap") return <ContentRoadmapDetail />;
  if (stage === "risques") return <ContentRisquesDetail />;
  if (stage === "synthese-thinking") return <ContentSyntheseThinking />;
  // For synthese and conclusion, show the DocForge document
  return (
    <ContentDocForge
      swotFilled={swotFilled}
      scenariosFilled={scenariosFilled}
      roadmapFilled={roadmapFilled}
      risquesFilled={risquesFilled}
      recoFilled={recoFilled}
      conclusionFilled={conclusionFilled}
      filledCount={filledCount}
      extractedNotes={extractedNotes}
    />
  );
}

// ═══════════════════════════════════════
// CONTENT COMPONENTS
// ═══════════════════════════════════════

function ContentIntro() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-purple-600" />
        <div>
          <p className="text-sm font-bold text-gray-800">Plan Strategique</p>
          <p className="text-[9px] text-gray-500">{STRATEGIE_DATA.titre}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-800 mb-2">Contexte</p>
        <p className="text-[9px] text-gray-600 leading-relaxed">{STRATEGIE_DATA.contexte}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "CA actuel", value: "15M$", sub: "70 employes", color: "border-blue-200 bg-blue-50 text-blue-700" },
          { label: "Sous-traitance", value: "85%", sub: "Ratio actuel", color: "border-amber-200 bg-amber-50 text-amber-700" },
          { label: "Objectif", value: "50/50", sub: "En 3 ans", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
        ].map(kpi => (
          <div key={kpi.label} className={cn("rounded-xl border shadow-sm", kpi.color)}>
            <div className="px-3 py-3 text-center">
              <p className="text-2xl font-extrabold">{kpi.value}</p>
              <p className="text-[9px] font-medium">{kpi.label}</p>
              <p className="text-[8px] opacity-70">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
        <p className="text-[9px] font-bold text-gray-600 uppercase mb-2">Equipe mobilisee</p>
        <div className="flex gap-2">
          {[
            { code: "CEOB", name: "CarlOS", role: "Pilotage" },
            { code: "CSOB", name: "Simone", role: "Strategie" },
            { code: "CFOB", name: "Frank", role: "Finances" },
          ].map(bot => (
            <div key={bot.code} className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
              <BotAvatar code={bot.code} size="sm" />
              <div>
                <p className="text-[9px] font-bold text-gray-700">{bot.name}</p>
                <p className="text-[8px] text-gray-400">{bot.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
        <p className="text-[9px] text-purple-700 font-medium">L'analyse va couvrir : SWOT, 3 scenarios compares, roadmap 3 phases, matrice de risques et recommandation finale.</p>
      </div>
    </div>
  );
}

function ContentSwotDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <h3 className="text-sm font-bold text-gray-800">Analyse SWOT — Position actuelle</h3>
        <span className="text-[9px] text-purple-600 ml-auto font-medium">Mode Strategie actif</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["forces", "faiblesses", "opportunites", "menaces"] as const).map((quadrant) => {
          const styles = {
            forces: { bg: "bg-green-50", border: "border-green-200", title: "text-green-800", label: "Forces" },
            faiblesses: { bg: "bg-red-50", border: "border-red-200", title: "text-red-800", label: "Faiblesses" },
            opportunites: { bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-800", label: "Opportunites" },
            menaces: { bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-800", label: "Menaces" },
          };
          const s = styles[quadrant];
          return (
            <div key={quadrant} className={cn("rounded-xl border p-3", s.bg, s.border)}>
              <p className={cn("text-xs font-bold uppercase mb-2", s.title)}>{s.label}</p>
              {STRATEGIE_DATA.swot[quadrant].map((item, i) => (
                <div key={i} className="mb-2 bg-white/60 rounded-lg p-2 border border-white/80">
                  <p className="text-xs font-medium text-gray-800">{item.titre}</p>
                  <p className="text-[9px] text-gray-600 leading-relaxed mt-0.5">{item.detail}</p>
                  {item.sources.map((src, j) => (
                    <div key={j} className="flex items-center gap-1 mt-1">
                      <span className="text-[7px] bg-white text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{src.type}</span>
                      <span className="text-[7px] text-gray-400">{src.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContentScenariosDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
        <Target className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Comparaison des 3 scenarios</h3>
      </div>

      {STRATEGIE_DATA.scenarios.map((s) => (
        <div key={s.id} className={cn("rounded-xl border p-4 shadow-sm", s.recommande ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200" : "border-gray-200 bg-white")}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-gray-800">{s.titre}</span>
            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", s.risqueColor)}>{s.risque}</span>
            {s.recommande && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold ml-auto">RECOMMANDE</span>}
          </div>
          <p className="text-xs text-gray-600 mb-3">{s.description}</p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center bg-white rounded-lg border border-gray-200 p-2">
              <p className="text-lg font-extrabold text-gray-800">{s.timeline}</p>
              <p className="text-[9px] text-gray-400">Timeline</p>
            </div>
            <div className="text-center bg-white rounded-lg border border-gray-200 p-2">
              <p className="text-lg font-extrabold text-blue-600">{s.investissement}</p>
              <p className="text-[9px] text-gray-400">Investissement</p>
            </div>
            <div className="text-center bg-white rounded-lg border border-gray-200 p-2">
              <p className="text-lg font-extrabold text-purple-600">{s.ratio}</p>
              <p className="text-[9px] text-gray-400">Ratio cible</p>
            </div>
          </div>

          <div className="space-y-1 mb-2">
            {s.actions.map((action, j) => (
              <div key={j} className="flex items-start gap-1.5 text-[9px] text-gray-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{action}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <p className="text-[8px] font-bold text-green-700 uppercase mb-0.5">Avantages</p>
              <p className="text-[9px] text-green-600">{s.avantages}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-200">
              <p className="text-[8px] font-bold text-red-700 uppercase mb-0.5">Inconvenients</p>
              <p className="text-[9px] text-red-600">{s.inconvenients}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentRoadmapDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
        <Rocket className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-bold text-gray-800">Roadmap 3 phases — Scenario Equilibre</h3>
      </div>

      {/* Timeline visual */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STRATEGIE_DATA.roadmap.map((phase, i) => {
          const Ic = phase.icon;
          return (
            <div key={phase.id} className="flex items-center gap-1 shrink-0">
              {i > 0 && <div className="w-8 h-0.5 bg-purple-300" />}
              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[8px] font-medium">
                <Ic className="h-3.5 w-3.5" />
                {phase.phase}
              </div>
            </div>
          );
        })}
      </div>

      {STRATEGIE_DATA.roadmap.map((phase) => {
        const Ic = phase.icon;
        return (
          <div key={phase.id} className="rounded-xl border border-purple-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-200 flex items-center gap-2">
              <Ic className="h-4 w-4 text-purple-600" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{phase.phase} — {phase.titre}</p>
                <p className="text-[9px] text-gray-500">{phase.periode}</p>
              </div>
              <div className="flex gap-1">
                {phase.owners.map(code => (
                  <BotAvatar key={code} code={code} size="sm" />
                ))}
              </div>
            </div>
            <div className="p-3 space-y-1.5">
              {phase.livrables.map((l, j) => (
                <div key={j} className="flex items-start gap-2 text-[9px] text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>{l}</span>
                </div>
              ))}
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 mt-2">
                <p className="text-[9px] text-purple-700 font-medium italic">{phase.metriques}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContentRisquesDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Matrice de risques — Probabilite x Impact</h3>
      </div>

      {/* 2x2 visual matrix */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-[8px] font-bold text-red-700 uppercase mb-1">CRITIQUE — Haute prob. / Haut impact</p>
          {STRATEGIE_DATA.riskMatrix.filter(r => r.quadrant === "critique").map(r => {
            const Ic = r.icon;
            return (
              <div key={r.id} className="bg-white rounded-lg p-2 border border-red-200 mb-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Ic className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-[9px] font-bold text-red-800">{r.id}: {r.titre}</span>
                </div>
                <p className="text-[8px] text-gray-600">{r.mitigation}</p>
              </div>
            );
          })}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-[8px] font-bold text-amber-700 uppercase mb-1">SURVEILLER — Basse prob. / Haut impact</p>
          {STRATEGIE_DATA.riskMatrix.filter(r => r.quadrant === "surveiller").map(r => {
            const Ic = r.icon;
            return (
              <div key={r.id} className="bg-white rounded-lg p-2 border border-amber-200 mb-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Ic className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[9px] font-bold text-amber-800">{r.id}: {r.titre}</span>
                </div>
                <p className="text-[8px] text-gray-600">{r.mitigation}</p>
              </div>
            );
          })}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-[8px] font-bold text-blue-700 uppercase mb-1">GERER — Haute prob. / Bas impact</p>
          {STRATEGIE_DATA.riskMatrix.filter(r => r.quadrant === "gerer").map(r => {
            const Ic = r.icon;
            return (
              <div key={r.id} className="bg-white rounded-lg p-2 border border-blue-200 mb-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Ic className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[9px] font-bold text-blue-800">{r.id}: {r.titre}</span>
                </div>
                <p className="text-[8px] text-gray-600">{r.mitigation}</p>
              </div>
            );
          })}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-[8px] font-bold text-green-700 uppercase mb-1">ACCEPTER — Basse prob. / Bas impact</p>
          {STRATEGIE_DATA.riskMatrix.filter(r => r.quadrant === "accepter").map(r => {
            const Ic = r.icon;
            return (
              <div key={r.id} className="bg-white rounded-lg p-2 border border-green-200 mb-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Ic className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-[9px] font-bold text-green-800">{r.id}: {r.titre}</span>
                </div>
                <p className="text-[8px] text-gray-600">{r.mitigation}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContentSyntheseThinking() {
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center animate-pulse">
            <Brain className="h-5 w-5 text-white" />
          </div>
        </div>
        <p className="text-sm font-bold text-purple-800">Consolidation en cours...</p>
        <p className="text-xs text-purple-600 mt-1">CarlOS consolide le SWOT, les scenarios, la roadmap et les risques pour formuler une recommandation finale.</p>
        <div className="mt-4 flex gap-1 justify-center">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

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

function ContentDocForge({ swotFilled, scenariosFilled, roadmapFilled, risquesFilled, recoFilled, conclusionFilled, filledCount, extractedNotes }: {
  swotFilled: boolean; scenariosFilled: boolean; roadmapFilled: boolean; risquesFilled: boolean; recoFilled: boolean; conclusionFilled: boolean; filledCount: number; extractedNotes: string[];
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          <h2 className="text-sm font-bold text-gray-800">Plan Strategique</h2>
          <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium ml-auto">{filledCount}/6 sections</span>
        </div>
        <p className="text-xs text-gray-500">{STRATEGIE_DATA.titre}</p>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${(filledCount / 6) * 100}%` }} />
        </div>
      </div>

      <DocSectionCard num={1} title="Analyse SWOT" icon={BarChart3} filled={swotFilled}>
        <div className="pt-3 grid grid-cols-2 gap-1.5">
          {(["forces", "faiblesses", "opportunites", "menaces"] as const).map((q) => {
            const c = { forces: "bg-green-50 border-green-200", faiblesses: "bg-red-50 border-red-200", opportunites: "bg-blue-50 border-blue-200", menaces: "bg-amber-50 border-amber-200" };
            return (
              <div key={q} className={cn("rounded p-1.5 border", c[q])}>
                <p className="text-[9px] font-bold text-gray-600 uppercase mb-0.5">{q}</p>
                {STRATEGIE_DATA.swot[q].map((item, i) => <p key={i} className="text-[9px] text-gray-600">{item.titre}</p>)}
              </div>
            );
          })}
        </div>
      </DocSectionCard>

      <DocSectionCard num={2} title="3 Scenarios compares" icon={Target} filled={scenariosFilled}>
        <div className="pt-3 space-y-1.5">
          {STRATEGIE_DATA.scenarios.map((s) => (
            <div key={s.id} className={cn("p-1.5 rounded border", s.recommande ? "border-blue-300 bg-blue-50" : "border-gray-200")}>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gray-700">{s.titre}</span>
                <span className={cn("text-[9px] px-1 py-0.5 rounded-full", s.risqueColor)}>{s.risque}</span>
                {s.recommande && <span className="text-[9px] bg-blue-600 text-white px-1 py-0.5 rounded-full ml-auto">REC</span>}
              </div>
              <p className="text-[9px] text-gray-500">{s.timeline} — {s.investissement} — {s.ratio}</p>
            </div>
          ))}
        </div>
      </DocSectionCard>

      <DocSectionCard num={3} title="Roadmap 3 phases" icon={Rocket} filled={roadmapFilled}>
        <div className="pt-3 space-y-1.5">
          {STRATEGIE_DATA.roadmap.map((p) => (
            <div key={p.id} className="p-1.5 bg-gray-50 rounded border border-gray-200">
              <p className="text-[9px] font-bold text-purple-700">{p.phase} — {p.titre} ({p.periode})</p>
              {p.livrables.map((l, j) => <p key={j} className="text-[9px] text-gray-500">{l}</p>)}
            </div>
          ))}
        </div>
      </DocSectionCard>

      <DocSectionCard num={4} title="Matrice de risques" icon={Shield} filled={risquesFilled}>
        <div className="pt-3 space-y-1">
          {STRATEGIE_DATA.riskMatrix.map((r) => (
            <div key={r.id} className="flex items-start gap-2 text-[9px] p-1 bg-gray-50 rounded">
              <span className={cn("font-bold px-1 py-0.5 rounded uppercase", r.quadrant === "critique" ? "bg-red-100 text-red-700" : r.quadrant === "surveiller" ? "bg-amber-100 text-amber-700" : r.quadrant === "gerer" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}>{r.quadrant}</span>
              <span className="text-gray-600">{r.titre}</span>
            </div>
          ))}
        </div>
      </DocSectionCard>

      <DocSectionCard num={5} title="Recommandation" icon={Target} filled={recoFilled}>
        <div className="pt-3">
          <p className="text-xs text-gray-700">{STRATEGIE_DATA.synthese.recommandation}</p>
          <div className="mt-2 space-y-1">
            {STRATEGIE_DATA.synthese.prochaines_etapes.map((s, i) => (
              <p key={i} className="text-[9px] text-gray-600">{s}</p>
            ))}
          </div>
        </div>
      </DocSectionCard>

      <DocSectionCard num={6} title="Conclusion" icon={BookOpen} filled={conclusionFilled}>
        <div className="pt-3">
          <p className="text-xs text-gray-700 leading-relaxed">{STRATEGIE_DATA.synthese.conclusion}</p>
        </div>
      </DocSectionCard>

      {extractedNotes.length > 0 && (
        <div className="bg-white rounded-xl border border-green-200 p-3">
          <p className="text-[9px] font-bold text-green-700 mb-1.5 uppercase">Notes extraites ({extractedNotes.length})</p>
          {extractedNotes.map((note, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[9px] text-green-600">
              <Pin className="h-3.5 w-3.5" /><span className="capitalize">{note}</span>
            </div>
          ))}
        </div>
      )}
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
