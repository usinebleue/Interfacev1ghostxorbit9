/**
 * AtelierStrategie.tsx — Atelier split-screen "Mode Strategie" V2
 * GAUCHE: Chat riche CEO+CSO+CFO, challenges inline, debats
 * DROITE: Document strategique (6 sections) — pattern DocForge
 * Data: STRATEGIE_DATA (strategie-data.ts)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  BookOpen,
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
  Shield,
  Rocket,
  BarChart3,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
} from "../../shared/simulation-components";
import { STRATEGIE_DATA } from "../../scenarios/strategie-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES ==========

type Stage = "intro" | "thinking" | "swot" | "scenarios" | "roadmap" | "risques" | "synthese-thinking" | "synthese" | "conclusion";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0, thinking: 1, swot: 2, scenarios: 3, roadmap: 4, risques: 5, "synthese-thinking": 6, synthese: 7, conclusion: 8,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter", thinking: "Analyse...", swot: "SWOT", scenarios: "Scenarios",
  roadmap: "Roadmap", risques: "Risques", "synthese-thinking": "Synthese...", synthese: "Recommandation", conclusion: "Conclusion",
};

// ========== CHALLENGE DATA ==========

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

export function AtelierStrategie({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
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

  const handleChallenge = (action: () => void) => {
    const c = challengeCount + 1; setChallengeCount(c); action();
    if (c >= 3 && !showSentinel) setTimeout(() => setShowSentinel(true), 1500);
  };
  const handleExtract = (key: string) => { if (!extractedNotes.includes(key)) setExtractedNotes((p) => [...p, key]); };

  const handleReset = () => {
    setStage("intro"); setIntroTyped(false);
    setShowSwotChallenge(false); setShowScenarioDebat(false); setShowRoadmapChallenge(false); setShowContreArgument(false);
    setChallengeCount(0); setShowSentinel(false);
    setSwotFilled(false); setScenariosFilled(false); setRoadmapFilled(false); setRisquesFilled(false); setRecoFilled(false); setConclusionFilled(false);
    setExtractedNotes([]);
  };

  const filledCount = [swotFilled, scenariosFilled, roadmapFilled, risquesFilled, recoFilled, conclusionFilled].filter(Boolean).length;

  const chatContent = (
    <>
      <UserBubble text={STRATEGIE_DATA.userTension} time="11:00" />

      {stage === "intro" ? (
        <BotBubble code="CEOB" text="" phaseLabel="Strategie">
          <TypewriterText text={STRATEGIE_DATA.ceoIntro} speed={10} className="text-sm text-gray-800" onComplete={() => setIntroTyped(true)} />
          {introTyped && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button onClick={() => setStage("thinking")} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer">
                <Send className="h-3.5 w-3.5" /> Lancer l'analyse strategique
              </button>
            </div>
          )}
        </BotBubble>
      ) : (
        <BotBubble code="CEOB" text={STRATEGIE_DATA.ceoIntro} phaseLabel="Strategie" time="11:00" />
      )}

      {stage === "thinking" && (
        <ThinkingAnimation steps={STRATEGIE_DATA.ceoThinking} botEmoji="" botCode="CEOB" botName="CarlOS" onComplete={() => setStage("swot")} />
      )}

      {/* ═══ SWOT ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["swot"] && (
        <BotBubble code="CSOB" text="" phaseLabel="SWOT" time="11:01">
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
            <button onClick={() => { setSwotFilled(true); handleExtract("swot"); if (STAGE_INDEX[stage] === STAGE_INDEX["swot"]) setStage("scenarios"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["swot"] && (
              <button onClick={() => setStage("scenarios")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> 3 Scenarios
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showSwotChallenge && <BotBubble code="CTOB" text={SWOT_CHALLENGE} phaseLabel="Challenge" time="11:02" />}

      {/* ═══ SCENARIOS ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["scenarios"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Scenarios" time="11:02">
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
            <button onClick={() => { setScenariosFilled(true); handleExtract("scenarios"); if (STAGE_INDEX[stage] === STAGE_INDEX["scenarios"]) setStage("roadmap"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["scenarios"] && (
              <button onClick={() => setStage("roadmap")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> Roadmap
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showScenarioDebat && (
        <>
          <BotBubble code="CSOB" text={SCENARIO_DEBATE.cso} phaseLabel="Debat" time="11:03" />
          <BotBubble code="CFOB" text={SCENARIO_DEBATE.cfo} phaseLabel="Debat" time="11:03" />
          <div className="mx-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-[9px] font-bold text-purple-700 mb-0.5">CONSENSUS</p>
            <p className="text-xs text-purple-800">{SCENARIO_DEBATE.consensus}</p>
          </div>
        </>
      )}

      {/* ═══ ROADMAP ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["roadmap"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Roadmap" time="11:04">
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
            <button onClick={() => { setRoadmapFilled(true); handleExtract("roadmap"); if (STAGE_INDEX[stage] === STAGE_INDEX["roadmap"]) setStage("risques"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["roadmap"] && (
              <button onClick={() => setStage("risques")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <Shield className="h-3.5 w-3.5" /> Matrice de risques
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showRoadmapChallenge && <BotBubble code="CTOB" text={ROADMAP_CHALLENGE} phaseLabel="Challenge" time="11:05" />}

      {/* ═══ RISQUES ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["risques"] && (
        <BotBubble code="CFOB" text="" phaseLabel="Risques" time="11:05">
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
            <button onClick={() => { setRisquesFilled(true); handleExtract("risques"); if (STAGE_INDEX[stage] === STAGE_INDEX["risques"]) setStage("synthese-thinking"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["risques"] && (
              <button onClick={() => setStage("synthese-thinking")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <Target className="h-3.5 w-3.5" /> Synthetiser
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showSentinel && (
        <div className="mx-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">Sentinelle : 3+ challenges. Avancer?</p>
          </div>
        </div>
      )}

      {stage === "synthese-thinking" && (
        <ThinkingAnimation steps={STRATEGIE_DATA.syntheseThinking} botEmoji="" botCode="CEOB" botName="CarlOS" onComplete={() => setStage("synthese")} />
      )}

      {/* ═══ SYNTHESE ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["synthese"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Recommandation" time="11:06">
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
            <button onClick={() => { setRecoFilled(true); handleExtract("recommandation"); if (STAGE_INDEX[stage] === STAGE_INDEX["synthese"]) setStage("conclusion"); }} className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 font-medium cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Extraire
            </button>
            {STAGE_INDEX[stage] === STAGE_INDEX["synthese"] && (
              <button onClick={() => setStage("conclusion")} className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 font-medium cursor-pointer">
                <ArrowRight className="h-3.5 w-3.5" /> Conclure
              </button>
            )}
          </div>
        </BotBubble>
      )}

      {showContreArgument && <BotBubble code="CFOB" text={CONTRE_ARGUMENT} phaseLabel="Contre-argument" time="11:07" />}

      {stage === "conclusion" && (
        <BotBubble code="CEOB" text="" phaseLabel="Conclusion" time="11:08">
          <TypewriterText text={STRATEGIE_DATA.synthese.conclusion} speed={10} className="text-sm text-gray-800" onComplete={() => setConclusionFilled(true)} />
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
                {STRATEGIE_DATA.swot[q].map((item, i) => <p key={i} className="text-[9px] text-gray-600">• {item.titre}</p>)}
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
              {p.livrables.map((l, j) => <p key={j} className="text-[9px] text-gray-500">• {l}</p>)}
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
              <p key={i} className="text-[9px] text-gray-600">• {s}</p>
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

  return (
    <AtelierLayout title="Mode Strategie" icon={BookOpen} iconColor="text-purple-600" stage={STAGE_INDEX[stage]} stageCount={9} stageLabel={STAGE_LABELS[stage]} onBack={onBack} onReset={handleReset} chatContent={chatContent} atelierContent={atelierContent} actions={[]} />
  );
}
