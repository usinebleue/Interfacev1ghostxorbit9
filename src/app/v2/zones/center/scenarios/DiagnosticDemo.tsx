"use client";

/**
 * DiagnosticDemo.tsx — Acte 1 du Cahier SMART : Diagnostic Preliminaire
 * Tension de depart -> CEO analyse -> Multi-bot consultation -> Synthese -> Pre-rapport
 * Entreprise fictive : Aliments Boreal inc. (manufacturier alimentaire, Saguenay, 85 employes)
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Zap,
  Send,
  Network,
  Handshake,
  Sparkles,
  Eye,
  Target,
  RotateCcw,
  Download,
  MessageSquare,
  Pin,
  ShieldQuestion,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  MultiConsultAnimation,
  BotAvatar,
  PerspectivesCard,
  SyntheseCard,
  PreRapportCard,
  TransitionBanner,
  USER_AVATAR,
  SIM_ACTE1,
} from "../shared/cahier-components";
import { downloadFile } from "../shared/export-utils";

// ========== MAIN COMPONENT ==========

/**
 * Stages :
 * 0    - Hero card with "Lancer le diagnostic" button
 * 1    - User tension message (from SIM_ACTE1.userTension)
 * 1.5  - CEO ThinkingAnimation
 * 2    - CEO response + Question 1
 * 2.5  - User answer 1
 * 3    - CEO Question 2
 * 3.5  - User answer 2
 * 4    - MultiConsultAnimation
 * 4.5  - Multi-perspectives card
 * 5    - Synthese thinking
 * 5.5  - Synthese card
 * 6    - Pre-rapport building animation
 * 6.5  - Pre-rapport card
 * 7    - CEO transition message
 * 7.5  - TransitionBanner + action buttons
 */
export function DiagnosticDemo({ onTransition }: { onTransition?: (target: string) => void }) {
  const [stage, setStage] = useState(0);
  const [ceoTextDone, setCeoTextDone] = useState(false);

  // Inline action states
  const [showCfoChallengeCard, setShowCfoChallengeCard] = useState(false);
  const [showCooDeepDive, setShowCooDeepDive] = useState(false);
  const [showCtoChallenge, setShowCtoChallenge] = useState(false);
  const [showSyntheseChallenge, setShowSyntheseChallenge] = useState(false);
  // Post-challenge action states
  const [showCfoVsCooDebate, setShowCfoVsCooDebate] = useState(false);
  const [showCooChallenge, setShowCooChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);
  const [showTripleDebat, setShowTripleDebat] = useState(false);
  const [extractedInsights, setExtractedInsights] = useState<string[]>([]);
  // Sentinel — CarlOS watches interaction depth
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinelWarning, setShowSentinelWarning] = useState(false);
  const MAX_CHALLENGES = 3;

  const handleChallenge = (action: () => void) => {
    const newCount = challengeCount + 1;
    setChallengeCount(newCount);
    action();
    if (newCount >= MAX_CHALLENGES && !showSentinelWarning) {
      setTimeout(() => setShowSentinelWarning(true), 1500);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on stage change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 150);
  }, [stage, ceoTextDone, showCfoChallengeCard, showCooDeepDive, showCtoChallenge, showSyntheseChallenge, showCfoVsCooDebate, showCooChallenge, showContreArgument, showTripleDebat, showSentinelWarning, extractedInsights]);

  const handleRestart = () => {
    setStage(0);
    setCeoTextDone(false);
    setShowCfoChallengeCard(false);
    setShowCooDeepDive(false);
    setShowCtoChallenge(false);
    setShowSyntheseChallenge(false);
    setShowCfoVsCooDebate(false);
    setShowCooChallenge(false);
    setShowContreArgument(false);
    setShowTripleDebat(false);
    setExtractedInsights([]);
    setChallengeCount(0);
    setShowSentinelWarning(false);
  };

  const handleExportPreRapport = () => {
    const rapport = SIM_ACTE1.preRapport;
    const lines = [
      `# Pre-rapport de visite — ${rapport.profil.nom}`,
      ``,
      `> Genere par CarlOS (diagnostic AI a distance) — ${new Date().toLocaleString("fr-CA")}`,
      ``,
      `## Profil entreprise`,
      ``,
      `| Champ | Valeur |`,
      `|-------|--------|`,
      `| Secteur | ${rapport.profil.secteur} |`,
      `| Employes | ${rapport.profil.employes} |`,
      `| Lignes de production | ${rapport.profil.lignes} |`,
      `| SKUs | ${rapport.profil.skus} |`,
      `| Chiffre d'affaires | ${rapport.profil.ca} |`,
      `| Localisation | ${rapport.profil.localisation} |`,
      ``,
      `## Besoins identifies — 3 axes`,
      ``,
    ];

    for (const axe of rapport.axes) {
      lines.push(`### ${axe.titre}`);
      lines.push(``);
      lines.push(axe.description);
      lines.push(``);
      lines.push(`- **Estimation** : ${axe.estimation}`);
      lines.push(`- **Subventions** : ${axe.subventions}`);
      lines.push(``);
    }

    lines.push(`## Recommandation`);
    lines.push(``);
    lines.push(rapport.recommandation);
    lines.push(``);

    if (rapport.ceoRecommandation) {
      lines.push(`### Recommandation CarlOS (CEO)`);
      lines.push(``);
      lines.push(rapport.ceoRecommandation);
      lines.push(``);
    }

    const md = lines.join("\n");
    downloadFile(md, `pre-rapport-${rapport.profil.nom.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${Date.now()}.md`, "text/markdown");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-red-500" />
          <div>
            <div className="text-sm font-bold text-gray-800">
              Diagnostic Preliminaire
            </div>
            <div className="text-xs text-muted-foreground">
              Acte 1 — De la tension au pre-rapport
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500",
            "bg-red-500 text-white shadow-md scale-110",
          )}>
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-medium text-gray-700 hidden sm:inline">Diagnostic</span>
          <div className="w-4 h-0.5 bg-gray-200" />
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-200 text-gray-400">
            <Handshake className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-medium text-gray-400 hidden sm:inline">Jumelage</span>
          <div className="w-4 h-0.5 bg-gray-200" />
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-200 text-gray-400">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-medium text-gray-400 hidden sm:inline">Cahier</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">

          {/* ===== STAGE 0 — Hero card ===== */}
          {stage === 0 && (
            <div className="flex justify-center py-16">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-xl">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Diagnostic Preliminaire
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                    Decrivez votre probleme. CarlOS et ses specialistes analysent
                    votre situation en temps reel et generent un pre-rapport de visite.
                  </p>
                </div>
                <button
                  onClick={() => setStage(1)}
                  className="flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-red-700 transition-all hover:scale-105 mx-auto cursor-pointer"
                >
                  <Zap className="h-5 w-5" /> Lancer le diagnostic
                </button>
              </div>
            </div>
          )}

          {/* ===== STAGE 1 — User tension message ===== */}
          {stage >= 1 && (
            <div className="flex gap-3 justify-end">
              <div className="bg-blue-50 border border-blue-200 rounded-xl rounded-tr-none px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-sm text-gray-800 leading-relaxed">{SIM_ACTE1.userTension}</p>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-200">
                <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 1 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(1.5)}
                className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3 w-3" /> CarlOS analyse la tension...
              </button>
            </div>
          )}

          {/* ===== STAGE 1.5 — CEO ThinkingAnimation ===== */}
          {stage === 1.5 && (
            <ThinkingAnimation
              steps={SIM_ACTE1.ceoThinking}
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(2)}
            />
          )}

          {/* ===== STAGE 2 — CEO response + Question 1 ===== */}
          {stage >= 2 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-blue-500 max-w-[85%]">
                <div className="text-xs text-blue-600 mb-2 font-medium">CarlOS (CEO)</div>
                {stage === 2 ? (
                  <TypewriterText
                    text={SIM_ACTE1.ceoResponse}
                    speed={8}
                    className="text-sm text-gray-700 leading-relaxed"
                    onComplete={() => setCeoTextDone(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{SIM_ACTE1.ceoResponse}</p>
                )}

                {((stage === 2 && ceoTextDone) || stage > 2) && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <p className="text-sm text-gray-700 font-medium">{SIM_ACTE1.ceoQuestion1}</p>
                  </div>
                )}

                {stage === 2 && ceoTextDone && (
                  <div className="mt-3">
                    <button
                      onClick={() => { setCeoTextDone(false); setStage(2.5); }}
                      className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                    >
                      <Send className="h-3 w-3" /> Repondre
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== STAGE 2.5 — User answer 1 ===== */}
          {stage >= 2.5 && (
            <div className="flex gap-3 justify-end">
              <div className="bg-blue-50 border border-blue-200 rounded-xl rounded-tr-none px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-sm text-gray-800 leading-relaxed">{SIM_ACTE1.userAnswer1}</p>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-200">
                <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 2.5 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(3)}
                className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3 w-3" /> CarlOS poursuit...
              </button>
            </div>
          )}

          {/* ===== STAGE 3 — CEO Question 2 ===== */}
          {stage >= 3 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-blue-500 max-w-[85%]">
                <div className="text-xs text-blue-600 mb-2 font-medium">CarlOS (CEO)</div>
                {stage === 3 ? (
                  <TypewriterText
                    text={SIM_ACTE1.ceoQuestion2}
                    speed={8}
                    className="text-sm text-gray-700 leading-relaxed"
                    onComplete={() => setCeoTextDone(true)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{SIM_ACTE1.ceoQuestion2}</p>
                )}

                {stage === 3 && ceoTextDone && (
                  <div className="mt-3">
                    <button
                      onClick={() => { setCeoTextDone(false); setStage(3.5); }}
                      className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                    >
                      <Send className="h-3 w-3" /> Repondre
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== STAGE 3.5 — User answer 2 ===== */}
          {stage >= 3.5 && (
            <div className="flex gap-3 justify-end">
              <div className="bg-blue-50 border border-blue-200 rounded-xl rounded-tr-none px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-sm text-gray-800 leading-relaxed">{SIM_ACTE1.userAnswer2}</p>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-200">
                <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {stage === 3.5 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage(4)}
                className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1 cursor-pointer"
              >
                <Network className="h-3 w-3" /> Consulter les specialistes...
              </button>
            </div>
          )}

          {/* ===== STAGE 4 — MultiConsultAnimation ===== */}
          {stage === 4 && (
            <MultiConsultAnimation
              bots={SIM_ACTE1.consultBots}
              onComplete={() => setStage(4.5)}
            />
          )}

          {/* ===== STAGE 4.5 — Multi-perspectives card ===== */}
          {stage >= 4.5 && (
            <>
              <PerspectivesCard
                perspectives={SIM_ACTE1.perspectives}
                onContinue={() => { if (stage === 4.5) setStage(5); }}
                animate={stage === 4.5}
              />

              {/* Extra action buttons after PerspectivesCard */}
              {stage === 4.5 && (
                <div className="ml-11 space-y-3">
                  {/* Row 1 — Challenge each bot individually */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mr-1">Challenger :</span>
                    <button
                      onClick={() => handleChallenge(() => setShowCfoChallengeCard(true))}
                      disabled={showCfoChallengeCard}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        showCfoChallengeCard
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      )}
                    >
                      <Target className="h-3 w-3" /> CFO — Subventions
                    </button>
                    <button
                      onClick={() => handleChallenge(() => setShowCooDeepDive(true))}
                      disabled={showCooDeepDive}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        showCooDeepDive
                          ? "bg-orange-100 text-orange-700 border border-orange-300"
                          : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                      )}
                    >
                      <Target className="h-3 w-3" /> COO — Plan operationnel
                    </button>
                    <button
                      onClick={() => handleChallenge(() => setShowCtoChallenge(true))}
                      disabled={showCtoChallenge}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        showCtoChallenge
                          ? "bg-purple-100 text-purple-700 border border-purple-300"
                          : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                      )}
                    >
                      <Target className="h-3 w-3" /> CTO — Technologies
                    </button>
                  </div>
                  {/* Row 2 — Group actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleChallenge(() => setShowTripleDebat(true))}
                      disabled={showTripleDebat}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        showTripleDebat
                          ? "bg-violet-100 text-violet-700 border border-violet-300"
                          : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
                      )}
                    >
                      <MessageSquare className="h-3 w-3" /> Debat entre les 3 bots
                    </button>
                    <button
                      onClick={() => setStage(5)}
                      className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                    >
                      <ArrowRight className="h-3 w-3" /> Synthetiser
                    </button>
                  </div>

                  {/* CFO Challenge inline card */}
                  {showCfoChallengeCard && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                      <div className="flex gap-3">
                        <BotAvatar code="BCF" size="md" />
                        <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-emerald-400 flex-1">
                          <div className="text-xs text-emerald-600 mb-2 font-medium">Francois (CFO) — Reponse au challenge</div>
                          <TypewriterText
                            text="Bonne question de challenger les chiffres. Le 510K$ de subventions HQ est un plafond theorique — en pratique, les dossiers bien montes obtiennent entre 85% et 95% du maximum. Sur nos 40 derniers dossiers, la moyenne est de 92%. Donc on parle realistement de 470K$ minimum. Pour le STIQ, c'est plus conservateur — le 40% est un pourcentage fixe sur les couts admissibles, pas de marge d'interpretation. Le vrai risque c'est le delai d'approbation HQ : 8-12 semaines. Il faut deposer avant juin 2026 sinon on perd le cycle budgetaire."
                            speed={6}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                        </div>
                      </div>
                      {/* Post-CFO-challenge actions */}
                      <div className="flex items-center gap-2 flex-wrap ml-11">
                        <button
                          onClick={() => setShowCfoVsCooDebate(true)}
                          disabled={showCfoVsCooDebate}
                          className={cn(
                            "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                            showCfoVsCooDebate
                              ? "bg-violet-100 text-violet-700 border border-violet-300"
                              : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
                          )}
                        >
                          <MessageSquare className="h-3 w-3" /> Debat CFO vs COO
                        </button>
                        <button
                          onClick={() => {
                            if (!extractedInsights.includes("cfo")) setExtractedInsights(prev => [...prev, "cfo"]);
                          }}
                          className={cn(
                            "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                            extractedInsights.includes("cfo")
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                          )}
                        >
                          <Pin className="h-3 w-3" /> {extractedInsights.includes("cfo") ? "Extrait ✓" : "Extraire → pre-rapport"}
                        </button>
                        <button
                          onClick={() => setStage(5)}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                        >
                          <ArrowRight className="h-3 w-3" /> Passer a la synthese
                        </button>
                      </div>
                    </div>
                  )}

                  {/* COO Deep Dive inline card */}
                  {showCooDeepDive && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                      <div className="flex gap-3">
                        <BotAvatar code="BOO" size="md" />
                        <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-orange-400 flex-1">
                          <div className="text-xs text-orange-600 mb-2 font-medium">Lise (COO) — Detail du plan operationnel</div>
                          <TypewriterText
                            text="Le plan en 4 phases est concu pour zero interruption de production. Voici le detail critique : Phase 2 (refrigeration) se fait exclusivement les weekends et soirs — on debranche l'ancien systeme par zone, jamais tout d'un coup. Phase 3 (cobot palettiseur) est la plus simple : le robot s'installe a cote de la ligne existante, on fait 3 jours de tests en parallele avec l'equipe manuelle, puis on bascule. Les 6 employes de palettisation sont rediriges vers le controle qualite et l'emballage secondaire — aucun licenciement. Le chevauchement des phases 2-3 et 3-4 economise 4 semaines sur le calendrier total. Risque principal : la livraison du systeme CO2 transcritique a un delai de 6-8 semaines apres commande. On anticipe ca en commandant des la confirmation des subventions."
                            speed={5}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-orange-800">0%</div>
                              <div className="text-gray-500">Arret production</div>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-orange-800">0</div>
                              <div className="text-gray-500">Licenciements</div>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-orange-800">4 sem.</div>
                              <div className="text-gray-500">Economisees</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Post-COO-deepdive actions */}
                      <div className="flex items-center gap-2 flex-wrap ml-11">
                        <button
                          onClick={() => setShowCooChallenge(true)}
                          disabled={showCooChallenge}
                          className={cn(
                            "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                            showCooChallenge
                              ? "bg-orange-100 text-orange-700 border border-orange-300"
                              : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                          )}
                        >
                          <Target className="h-3 w-3" /> Challenger les delais
                        </button>
                        <button
                          onClick={() => {
                            if (!extractedInsights.includes("coo")) setExtractedInsights(prev => [...prev, "coo"]);
                          }}
                          className={cn(
                            "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                            extractedInsights.includes("coo")
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                          )}
                        >
                          <Pin className="h-3 w-3" /> {extractedInsights.includes("coo") ? "Extrait ✓" : "Extraire → pre-rapport"}
                        </button>
                        <button
                          onClick={() => setStage(5)}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                        >
                          <ArrowRight className="h-3 w-3" /> Passer a la synthese
                        </button>
                      </div>
                    </div>
                  )}

                  {/* COO Challenge response (challenger les delais) */}
                  {showCooChallenge && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex gap-3">
                        <BotAvatar code="BOO" size="md" />
                        <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-orange-400 flex-1">
                          <div className="text-xs text-orange-600 mb-2 font-medium">Lise (COO) — Defense des delais</div>
                          <TypewriterText
                            text="Les 20 semaines sont basees sur 42 projets similaires d'Energia Solutions. Le risque principal est le delai de livraison du systeme CO2 transcritique (6-8 semaines apres commande). On anticipe en commandant des la confirmation des subventions. Les phases 2-3 se chevauchent de 2 semaines, et 3-4 de 3 semaines — c'est la ou on gagne le temps. Si on separe les phases sans chevauchement, on tombe a 28 semaines. Buffer de 15% deja integre dans chaque phase. Le vrai bottleneck c'est l'approbation HQ : deposer avant juin 2026 est non-negociable."
                            speed={5}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTO Challenge inline card */}
                  {showCtoChallenge && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                      <div className="flex gap-3">
                        <BotAvatar code="BCT" size="md" />
                        <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-purple-400 flex-1">
                          <div className="text-xs text-purple-600 mb-2 font-medium">Marc (CTO) — Defense des choix technologiques</div>
                          <TypewriterText
                            text="Les 3 technologies recommandees ne sont pas experimentales — elles sont eprouvees en manufacturier alimentaire. Le cobot UR10e est certifie IP67 pour les environnements alimentaires, 40,000+ unites installees dans le monde. Le systeme CO2 transcritique est le standard post-HFC en refrigeration industrielle — la reglementation canadienne interdit les HFC d'ici 2028, donc c'est inevitable. Les capteurs IoT utilisent LoRaWAN, la meme techno que chez Saputo et Agropur pour le monitoring temps reel. Le ROI de 20-24 mois est base sur 23 projets similaires — pas des projections theoriques. Le seul risque technologique : la maintenance predictive par analyse vibratoire necessite 6-8 semaines de donnees avant d'etre fiable. Pendant cette periode, on maintient la maintenance preventive classique en parallele."
                            speed={5}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-purple-800">40,000+</div>
                              <div className="text-gray-500">UR10e installes</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-purple-800">2028</div>
                              <div className="text-gray-500">Fin HFC (loi)</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-purple-800">23 projets</div>
                              <div className="text-gray-500">Base ROI</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Post-CTO-challenge actions */}
                      <div className="flex items-center gap-2 flex-wrap ml-11">
                        <button
                          onClick={() => {
                            if (!extractedInsights.includes("cto")) setExtractedInsights(prev => [...prev, "cto"]);
                          }}
                          className={cn(
                            "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                            extractedInsights.includes("cto")
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                          )}
                        >
                          <Pin className="h-3 w-3" /> {extractedInsights.includes("cto") ? "Extrait ✓" : "Extraire → pre-rapport"}
                        </button>
                        <button
                          onClick={() => setStage(5)}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                        >
                          <ArrowRight className="h-3 w-3" /> Passer a la synthese
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3-way Debate card — all 3 bots debating */}
                  {showTripleDebat && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="border border-violet-200 rounded-xl overflow-hidden">
                        <div className="bg-violet-50 px-4 py-2.5 flex items-center gap-2 border-b border-violet-200">
                          <MessageSquare className="h-4 w-4 text-violet-600" />
                          <span className="text-xs font-bold text-violet-800">Debat croise — CFO × COO × CTO</span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex gap-3">
                            <BotAvatar code="BCF" size="sm" />
                            <div className="flex-1">
                              <div className="text-xs text-emerald-600 font-medium mb-1">Francois (CFO)</div>
                              <p className="text-sm text-gray-700">Le timing est critique. Si on rate la fenetre HQ de juin 2026, on perd 12 mois. Je recommande de deposer les 4 dossiers simultanement — EnerGuide, systemes industriels, STIQ et RS&DE. Le risque de ne pas combiner les 3 axes, c'est de perdre l'effet levier des subventions croisees.</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <BotAvatar code="BOO" size="sm" />
                            <div className="flex-1">
                              <div className="text-xs text-orange-600 font-medium mb-1">Lise (COO)</div>
                              <p className="text-sm text-gray-700">Francois a raison sur le timing, mais je souleve un point : les 6 operateurs de palettisation doivent etre formes AVANT l'arrivee du cobot, pas pendant. Ca veut dire demarrer la formation en Phase 1, pas en Phase 3. Ca ajoute un cout de 15-20K$ mais reduit le risque de resistance au changement de 80%.</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <BotAvatar code="BCT" size="sm" />
                            <div className="flex-1">
                              <div className="text-xs text-purple-600 font-medium mb-1">Marc (CTO)</div>
                              <p className="text-sm text-gray-700">D'accord avec Lise. J'ajoute que l'IoT devrait commencer en Phase 1 aussi — installer les capteurs de base des le debut permet de mesurer le "avant" pour prouver les economies a HQ. Les donnees de monitoring pre-travaux renforcent enormement le dossier de subvention.</p>
                            </div>
                          </div>
                          <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2.5 text-xs">
                            <div className="font-bold text-violet-800 mb-1 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" /> Consensus des 3 specialistes
                            </div>
                            <p className="text-gray-700">Demarrer la formation operateurs ET les capteurs IoT des la Phase 1 (ajout de 15-20K$). Deposer les 4 dossiers de subventions simultanement. Le chevauchement anticipe permet de gagner 4-6 semaines sur le calendrier total tout en renforçant le dossier HQ avec des donnees reelles.</p>
                          </div>
                        </div>
                      </div>
                      {/* Post-debate actions */}
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <button
                          onClick={() => {
                            if (!extractedInsights.includes("debat")) setExtractedInsights(prev => [...prev, "debat"]);
                          }}
                          className={cn(
                            "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                            extractedInsights.includes("debat")
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                          )}
                        >
                          <Pin className="h-3 w-3" /> {extractedInsights.includes("debat") ? "Consensus extrait ✓" : "Extraire le consensus"}
                        </button>
                        <button
                          onClick={() => setStage(5)}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                        >
                          <ArrowRight className="h-3 w-3" /> Synthetiser avec le consensus
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CarlOS Sentinel warning — anti-loop */}
                  {showSentinelWarning && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex gap-3">
                        <BotAvatar code="BCO" size="md" />
                        <div className="bg-amber-50 border border-amber-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-amber-500 flex-1">
                          <div className="text-xs text-amber-700 mb-1.5 font-medium flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" /> CarlOS — Sentinelle de discussion
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            On a bien explore les perspectives — {challengeCount} interactions sur les analyses. Les 3 specialistes convergent sur les points cles. Je recommande de passer a la synthese pour consolider, ou d'ouvrir un debat complet si tu veux stress-tester davantage.
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => setStage(5)}
                              className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                            >
                              <ArrowRight className="h-3 w-3" /> Passer a la synthese
                            </button>
                            <button
                              onClick={() => onTransition?.("debat")}
                              className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-all"
                            >
                              <MessageSquare className="h-3 w-3" /> Debat complet (mode dedie)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CFO vs COO Debate card */}
                  {showCfoVsCooDebate && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="border border-violet-200 rounded-xl overflow-hidden">
                        <div className="bg-violet-50 px-4 py-2.5 flex items-center gap-2 border-b border-violet-200">
                          <MessageSquare className="h-4 w-4 text-violet-600" />
                          <span className="text-xs font-bold text-violet-800">Mini-debat — CFO vs COO</span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex gap-3">
                            <BotAvatar code="BCF" size="sm" />
                            <div className="flex-1">
                              <div className="text-xs text-emerald-600 font-medium mb-1">Francois (CFO)</div>
                              <p className="text-sm text-gray-700">Le risque financier est minimal si on depose les dossiers a temps. Le 470K$ minimum de subventions rend le projet quasiment autofinance. Mon souci c'est qu'on ne peut pas se permettre de commencer les travaux AVANT la confirmation HQ — sinon on perd l'admissibilite.</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <BotAvatar code="BOO" size="sm" />
                            <div className="flex-1">
                              <div className="text-xs text-orange-600 font-medium mb-1">Lise (COO)</div>
                              <p className="text-sm text-gray-700">Je suis d'accord avec Francois sur le timing. Par contre, on PEUT commencer les travaux preparatoires (audit, specs, commande equipement) avant la confirmation sans perdre l'admissibilite. C'est seulement l'installation physique qui doit attendre. Ca nous sauve 4-6 semaines sur le calendrier total.</p>
                            </div>
                          </div>
                          <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-xs">
                            <div className="font-bold text-violet-800 mb-1">Consensus</div>
                            <p className="text-gray-700">Deposer les dossiers immediatement + demarrer les travaux preparatoires en parallele. Installation physique seulement apres confirmation HQ. Gain potentiel : 4-6 semaines.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extracted insights badge */}
                  {extractedInsights.length > 0 && (
                    <div className="flex items-center gap-2 ml-11 animate-in fade-in duration-300">
                      <div className="bg-green-50 border border-green-200 rounded-full px-3 py-1 flex items-center gap-1.5">
                        <Pin className="h-3 w-3 text-green-600" />
                        <span className="text-[11px] text-green-700 font-medium">{extractedInsights.length} insight(s) extraite(s) → pre-rapport enrichi</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ===== STAGE 5 — Synthese thinking ===== */}
          {stage === 5 && (
            <ThinkingAnimation
              steps={SIM_ACTE1.syntheseThinking}
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(5.5)}
            />
          )}

          {/* ===== STAGE 5.5 — Synthese card ===== */}
          {stage >= 5.5 && (
            <>
              <SyntheseCard data={SIM_ACTE1.syntheseCard} animate={stage === 5.5} />
              {stage === 5.5 && (
                <div className="ml-11 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowSyntheseChallenge(true)}
                      disabled={showSyntheseChallenge}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        showSyntheseChallenge
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      )}
                    >
                      <Target className="h-3 w-3" /> Challenger la synthese
                    </button>
                    <button
                      onClick={() => setShowContreArgument(true)}
                      disabled={showContreArgument}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        showContreArgument
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      )}
                    >
                      <ShieldQuestion className="h-3 w-3" /> Contre-argument
                    </button>
                    <button
                      onClick={() => setStage(6)}
                      className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                    >
                      <FileText className="h-3 w-3" /> Generer le pre-rapport
                    </button>
                  </div>

                  {/* Synthese challenge inline card */}
                  {showSyntheseChallenge && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                      <div className="flex gap-3">
                        <BotAvatar code="BCO" size="md" />
                        <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-blue-500 flex-1">
                          <div className="text-xs text-blue-600 mb-2 font-medium">CarlOS (CEO) — Defense de la synthese</div>
                          <TypewriterText
                            text="Je comprends le scepticisme — les chiffres semblent optimistes. Mais decomposons : les 590K$ de subventions ne sont pas un seul programme, c'est 4 programmes combines (EnerGuide audit, systemes industriels, optimisation energetique, STIQ automatisation). Chacun a ses propres criteres et plafonds. Le ROI de 22 mois est base sur les economies reelles mesurees chez des manufacturiers similaires — pas des projections theoriques. Le risque principal est le timing : si on rate la fenetre HQ de juin 2026, on repousse de 12 mois. C'est pour ca que je recommande d'activer le jumelage immediatement — trouver le bon integrateur maintenant permet de deposer les dossiers dans les temps. Les 3 axes se renforcent : la chaleur recuperee du CO2 transcritique alimente le chauffage, le cobot libere du personnel pour le controle qualite, et l'IoT valide les economies en temps reel. Separer les axes serait une erreur strategique."
                            speed={5}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                        </div>
                      </div>
                      {/* Post-synthese-challenge actions */}
                      <div className="flex items-center gap-2 flex-wrap ml-11">
                        <button
                          onClick={() => setStage(6)}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                        >
                          <FileText className="h-3 w-3" /> Generer le pre-rapport
                        </button>
                        <button
                          onClick={() => onTransition?.("debat")}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-all"
                        >
                          <MessageSquare className="h-3 w-3" /> Ouvrir un debat complet
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contre-argument card */}
                  {showContreArgument && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                      <div className="flex gap-3">
                        <BotAvatar code="BCO" size="md" />
                        <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-red-400 flex-1">
                          <div className="text-xs text-red-600 mb-2 font-medium">CarlOS (CEO) — Meilleur argument CONTRE</div>
                          <TypewriterText
                            text="Si je devais plaider contre ce projet, voici l'argument le plus solide : la dependance aux subventions est trop forte. Sur 1.1M$ brut, 592K$ (54%) viennent de programmes gouvernementaux. Si HQ change ses criteres ou si le cycle budgetaire est retarde, le ROI passe de 22 a 42 mois — ce qui est limite pour un investissement de cette taille. De plus, le marche des cobots palettiseurs est en surchauffe — les delais fournisseurs pourraient s'allonger de 4-8 semaines, ce qui decalerait toute la phase 3. Enfin, la formation des 6 employes de palettisation vers le controle qualite n'est pas garantie — le taux d'echec de reconversion en manufacture est de 15-20%."
                            speed={5}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap ml-11">
                        <button
                          onClick={() => setStage(6)}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                        >
                          <FileText className="h-3 w-3" /> Generer le pre-rapport
                        </button>
                        <button
                          onClick={() => onTransition?.("analyse")}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition-all"
                        >
                          <Eye className="h-3 w-3" /> Analyser les risques
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ===== STAGE 6 — Pre-rapport building animation ===== */}
          {stage === 6 && (
            <ThinkingAnimation
              steps={SIM_ACTE1.preRapportThinking}
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(6.5)}
            />
          )}

          {/* ===== STAGE 6.5 — Pre-rapport card ===== */}
          {stage >= 6.5 && (
            <>
              <PreRapportCard data={SIM_ACTE1.preRapport} animate={stage === 6.5} />
              {stage === 6.5 && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setStage(7)}
                    className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> Voir la suite
                  </button>
                </div>
              )}
            </>
          )}

          {/* ===== STAGE 7 — CEO transition message ===== */}
          {stage >= 7 && (
            <div className="flex gap-3">
              <BotAvatar code="BCO" size="md" />
              <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-blue-500 max-w-[85%]">
                <div className="text-xs text-blue-600 mb-2 font-medium">CarlOS (CEO)</div>
                {stage === 7 ? (
                  <TypewriterText
                    text={SIM_ACTE1.ceoTransition}
                    speed={8}
                    className="text-sm text-gray-700 leading-relaxed"
                    onComplete={() => setTimeout(() => setStage(7.5), 600)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{SIM_ACTE1.ceoTransition}</p>
                )}
              </div>
            </div>
          )}

          {/* ===== STAGE 7.5 — TransitionBanner + action buttons ===== */}
          {stage >= 7.5 && (
            <div className="space-y-4">
              <TransitionBanner
                from="Diagnostic Preliminaire termine"
                to="Prochaine etape : Jumelage SMART ou retour au hub"
                animate={stage === 7.5}
              />

              {/* Action buttons */}
              <div className="space-y-3 animate-in fade-in duration-700">
                {/* Primary actions */}
                <div className="flex items-center gap-3 justify-center flex-wrap">
                  <button
                    onClick={() => onTransition?.("jumelage")}
                    className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-amber-700 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Handshake className="h-4 w-4" /> Lancer le Jumelage SMART
                  </button>
                  <button
                    onClick={() => onTransition?.("hub")}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" /> Voir d'autres modes
                  </button>
                </div>

                {/* Secondary actions */}
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <button
                    onClick={handleExportPreRapport}
                    className="text-xs bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-gray-50 font-medium cursor-pointer"
                  >
                    <Download className="h-3 w-3" /> Exporter le pre-rapport
                  </button>
                  <button
                    onClick={handleRestart}
                    className="text-xs bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-gray-50 font-medium cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Recommencer
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
