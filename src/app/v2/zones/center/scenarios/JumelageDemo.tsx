"use client";

/**
 * JumelageDemo.tsx — Acte 2 du Cahier SMART : Jumelage SMART
 * Prend les criteres de matching, scanne le reseau Usine Bleue,
 * affiche le TOP 3 integrateurs, lance les sessions de jumelage,
 * fait le scoring, et annonce le gagnant.
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Target,
  Cog,
  Search,
  Handshake,
  Trophy,
  FileText,
  Eye,
  Sparkles,
  RotateCcw,
  ArrowRight,
  MessageSquare,
  Pin,
  ShieldQuestion,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import {
  ThinkingAnimation,
  BotAvatar,
  TypewriterText,
  TransitionBanner,
  NetworkScanAnimation,
  IntegratorCard,
  JumelageSessionAnimation,
  ScoringAnimation,
  WinnerAnnouncement,
  BOT_COLORS,
  USER_AVATAR,
  SIM_ACTE2,
  INTEGRATORS,
} from "../shared/cahier-components";

// ========== EXPANDED INTEGRATOR DETAIL ==========

function IntegratorDetailExpanded({ integrator }: { integrator: (typeof INTEGRATORS)[number] }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 mt-2">
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">{integrator.intro}</p>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Specialites</div>
          <div className="flex flex-wrap gap-1.5">
            {integrator.specialites.map((s, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Certifications</div>
          <div className="flex flex-wrap gap-1.5">
            {integrator.certifications.map((c, i) => (
              <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className="font-bold text-gray-800">{integrator.projetsSimil}</div>
            <div className="text-gray-500">Projets similaires</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className="font-bold text-gray-800">{integrator.experience}</div>
            <div className="text-gray-500">Experience</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className="font-bold text-gray-800">{integrator.tailleEquipe}</div>
            <div className="text-gray-500">Employes</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-gray-700 flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>{integrator.force}</span>
        </div>
      </div>
    </div>
  );
}

// ========== CHALLENGE DEFENSE CARD ==========

function ChallengeDefenseCard({ onAccept, onMoreData }: { onAccept?: () => void; onMoreData?: () => void }) {
  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
      <div className="border border-blue-200 rounded-xl overflow-hidden">
        <div className="bg-blue-50 px-4 py-2.5 flex items-center gap-2 border-b border-blue-200">
          <BotAvatar code="BCO" size="sm" />
          <span className="text-xs font-bold text-blue-800">Defense de la selection — CarlOS (CEO)</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            Je comprends le reflexe de vouloir challenger. Voici pourquoi Energia Solutions est objectivement le meilleur choix pour Aliments Boreal :
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">1.</span>
              <span><strong>Seul integrateur a couvrir les 3 axes</strong> — Techno-Froid n'a pas de capacite robotique (score 35%) et GreenTech n'a pas d'expertise energie pure (score 50%). Energia couvre tout avec des equipes internes : pas de sous-traitance, pas de coordination multi-fournisseurs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">2.</span>
              <span><strong>Subventions = le facteur decisif</strong> — Avec 98% de taux d'approbation sur 40+ dossiers HQ, Energia maximise les 592K$ de subventions potentielles. Un dossier mal monte = perte de 300K$+.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">3.</span>
              <span><strong>Delai et risque</strong> — 20 semaines integrees vs 24-28 semaines avec sous-traitants (Techno-Froid) ou 22-26 semaines avec controle partiel (GreenTech). Chaque semaine de retard = 5,350$ de gaspillage energetique continue.</span>
            </li>
          </ul>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-xs text-blue-800 font-medium">
            Conclusion : l'ecart de 26-29 points avec les 2 autres candidats n'est pas un hasard — c'est la difference entre un projet integre reussi et une coordination multi-fournisseurs risquee.
          </div>
        </div>
      </div>
      {/* Post-challenge actions */}
      <div className="flex items-center gap-2 flex-wrap ml-0">
        <button
          onClick={onAccept}
          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-500 text-white hover:bg-amber-600 transition-all"
        >
          <CheckCircle2 className="h-3 w-3" /> Accepter la recommandation
        </button>
        <button
          onClick={onMoreData}
          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all"
        >
          <Eye className="h-3 w-3" /> Voir les donnees brutes
        </button>
      </div>
    </div>
  );
}

// ========== ALL THREE COMPARISON ==========

function AllThreeComparison() {
  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b">
          <Eye className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-700">Comparaison des 3 candidats</span>
        </div>
        <div className="grid grid-cols-3 divide-x">
          {INTEGRATORS.map((integ, i) => {
            const isWinner = i === 0;
            return (
              <div key={integ.id} className={cn("p-3", isWinner && "bg-amber-50/50")}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                    i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-400",
                  )}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-800 truncate">{integ.nom}</div>
                    <div className="text-[10px] text-gray-500">{integ.ville}</div>
                  </div>
                </div>
                <div className={cn(
                  "text-lg font-bold mb-2 text-center",
                  integ.score >= 90 ? "text-green-600" : integ.score >= 80 ? "text-amber-600" : "text-gray-600",
                )}>
                  {integ.score}%
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Projets simil.</span>
                    <span className="font-semibold text-gray-700">{integ.projetsSimil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Experience</span>
                    <span className="font-semibold text-gray-700">{integ.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Equipe</span>
                    <span className="font-semibold text-gray-700">{integ.tailleEquipe} pers.</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {integ.specialites.slice(0, 2).map((s, si) => (
                    <span key={si} className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                  {integ.specialites.length > 2 && (
                    <span className="text-[9px] text-gray-400">+{integ.specialites.length - 2}</span>
                  )}
                </div>
                {isWinner && (
                  <div className="mt-2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded px-2 py-1 text-center flex items-center justify-center gap-1">
                    <Trophy className="h-3 w-3" /> Selectionne
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== EXPORT MARKDOWN HELPER ==========

function exportMatchingMarkdown() {
  const lines = [
    "# Matching Jumelage SMART — Aliments Boreal inc.",
    "",
    `Date : ${new Date().toLocaleDateString("fr-CA")}`,
    "",
    "## Criteres de matching",
    "",
    ...SIM_ACTE2.criteres.map((c, i) => `${i + 1}. ${c}`),
    "",
    "## TOP 3 Integrateurs",
    "",
    ...INTEGRATORS.map((integ, i) => [
      `### #${i + 1} — ${integ.nom} (${integ.score}%)`,
      `- Ville : ${integ.ville}`,
      `- Experience : ${integ.experience}`,
      `- Equipe : ${integ.tailleEquipe} personnes`,
      `- Projets similaires : ${integ.projetsSimil}`,
      `- Specialites : ${integ.specialites.join(", ")}`,
      `- Certifications : ${integ.certifications.join(", ")}`,
      `- Force : ${integ.force}`,
      "",
    ]).flat(),
    "## Gagnant",
    "",
    `**${INTEGRATORS[0].nom}** — Score global : ${INTEGRATORS[0].score}%`,
    "",
    SIM_ACTE2.winnerMessage,
    "",
    "---",
    "Genere par CarlOS (GhostX) — Jumelage SMART AI",
  ];

  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `matching-jumelage-smart-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========== MAIN COMPONENT ==========

/**
 * Stages :
 * 0    — Hero card with "Lancer le jumelage" button
 * 1    — ThinkingAnimation criteres matching
 * 1.5  — Criteres card with modify/scan buttons
 * 2    — NetworkScanAnimation
 * 2.5  — TOP 3 IntegratorCards
 * 3    — JumelageSessionAnimation
 * 3.5  — ScoringAnimation
 * 4    — Winner announcement + CEO intro + CEO selection message
 * 4.5  — TransitionBanner + action buttons + restart
 */
export function JumelageDemo({ onTransition }: { onTransition?: (target: string) => void }) {
  const [stage, setStage] = useState(0);
  const [criteresModified, setCriteresModified] = useState(false);
  const [expandedIntegrators, setExpandedIntegrators] = useState<Record<number, boolean>>({});
  const [showChallenge, setShowChallenge] = useState(false);
  const [showAllThree, setShowAllThree] = useState(false);
  const [ceoIntroDone, setCeoIntroDone] = useState(false);
  const [ceoWinnerDone, setCeoWinnerDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on stage change and interactive state changes
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 150);
  }, [stage, criteresModified, expandedIntegrators, showChallenge, showAllThree]);

  const handleRestart = () => {
    setStage(0);
    setCriteresModified(false);
    setExpandedIntegrators({});
    setShowChallenge(false);
    setShowAllThree(false);
    setCeoIntroDone(false);
    setCeoWinnerDone(false);
  };

  const toggleIntegratorDetail = (id: number) => {
    setExpandedIntegrators(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const criteresBase = [...SIM_ACTE2.criteres];
  const criteresDisplay = criteresModified
    ? [...criteresBase, "Experience en milieu alimentaire (HACCP, zones temp.)"]
    : criteresBase;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
            <Handshake className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">
              Acte 2 — Jumelage SMART
            </div>
            <div className="text-xs text-muted-foreground">
              Scan reseau, matching AI, sessions de jumelage, scoring final
            </div>
          </div>
        </div>
        {/* Stage indicator */}
        <div className="flex gap-1">
          {["Criteres", "Scan", "TOP 3", "Jumelage", "Scoring", "Gagnant"].map((label, i) => {
            const stageMap = [0, 2, 2.5, 3, 3.5, 4];
            const isActive = stage >= stageMap[i];
            return (
              <div key={i} className={cn(
                "h-1.5 w-8 rounded-full transition-colors duration-300",
                isActive ? "bg-amber-500" : "bg-gray-200",
              )} title={label} />
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-12">

          {/* ===== STAGE 0 — Hero card ===== */}
          {stage === 0 && (
            <div className="flex justify-center py-16">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl">
                  <Handshake className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">Jumelage SMART</h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Scan du reseau Usine Bleue, matching AI avec les integrateurs,
                    sessions de jumelage automatisees, scoring multicritere et selection du partenaire ideal.
                  </p>
                </div>
                <button
                  onClick={() => setStage(1)}
                  className="flex items-center gap-3 bg-amber-500 text-white px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg hover:bg-amber-600 transition-all hover:scale-105 mx-auto cursor-pointer"
                >
                  <Search className="h-5 w-5" /> Lancer le jumelage
                </button>
              </div>
            </div>
          )}

          {/* ===== STAGE 1 — ThinkingAnimation criteres matching ===== */}
          {stage === 1 && (
            <ThinkingAnimation
              steps={SIM_ACTE2.criteresThinking}
              botName="CarlOS (CEO)"
              botCode="BCO"
              onComplete={() => setStage(1.5)}
            />
          )}

          {/* ===== STAGE 1.5 — Criteres card ===== */}
          {stage >= 1.5 && (
            <div className="ml-11">
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 flex items-center gap-2 border-b">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">Criteres de matching generes</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">
                    {criteresDisplay.length} criteres
                  </span>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {criteresDisplay.map((critere, i) => {
                      const isNew = criteresModified && i === criteresDisplay.length - 1;
                      return (
                        <li key={i} className={cn(
                          "flex items-start gap-2 text-sm",
                          isNew && "animate-in fade-in slide-in-from-bottom-2 duration-500",
                        )}>
                          <CheckCircle2 className={cn(
                            "h-4 w-4 shrink-0 mt-0.5",
                            isNew ? "text-amber-500" : "text-green-500",
                          )} />
                          <span className={cn("text-gray-700", isNew && "font-semibold text-amber-800")}>
                            {critere}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Action buttons — only show when this is the active stage */}
                  {stage === 1.5 && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {!criteresModified && (
                        <button
                          onClick={() => setCriteresModified(true)}
                          className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer"
                        >
                          <Cog className="h-3.5 w-3.5" /> Modifier mes criteres
                        </button>
                      )}
                      <button
                        onClick={() => setStage(2)}
                        className="text-xs bg-amber-500 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-600 font-medium cursor-pointer"
                      >
                        <Search className="h-3.5 w-3.5" /> Scanner le reseau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== User criteria modification message ===== */}
          {stage >= 1.5 && criteresModified && (
            <>
              {/* User message */}
              <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
                    <p className="text-sm leading-relaxed">{SIM_ACTE2.userCritereAjout}</p>
                    <p className="text-[10px] text-blue-200 mt-1 text-right">Carl Fugere</p>
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-300">
                    <img src={USER_AVATAR} alt="Carl" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* CEO acknowledgment */}
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BotAvatar code="BCO" size="md" />
                <div className={cn(
                  "bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px]",
                  BOT_COLORS.BCO.border,
                )}>
                  <div className="text-xs text-blue-600 mb-1 font-medium">CarlOS (CEO)</div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Bon point. J'ajoute "Experience en milieu alimentaire (HACCP, zones temp.)" a la liste des criteres. Ca va penaliser les integrateurs sans experience agroalimentaire directe. Les criteres sont mis a jour.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ===== STAGE 2 — NetworkScanAnimation ===== */}
          {stage >= 2 && stage < 2.5 && (
            <NetworkScanAnimation
              steps={SIM_ACTE2.scanSteps}
              onComplete={() => setStage(2.5)}
            />
          )}
          {stage >= 2.5 && (
            <div className="ml-11">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-5 py-3 shadow-sm flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-bold text-amber-800">Scan termine — 3 integrateurs identifies</div>
                  <div className="text-xs text-amber-600">130 membres scannes, filtre en 5 etapes</div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STAGE 2.5 — TOP 3 IntegratorCards ===== */}
          {stage >= 2.5 && (
            <div className="ml-11">
              <div className="grid grid-cols-3 gap-3">
                {INTEGRATORS.map((integ, i) => (
                  <div key={integ.id}>
                    <IntegratorCard
                      integrator={integ}
                      rank={i}
                      animate={stage === 2.5}
                      delay={i * 400}
                    />
                    {/* Intro text visible directly */}
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5 px-1 line-clamp-2">{integ.intro}</p>
                    {/* Detail toggle button */}
                    {stage >= 2.5 && (
                      <div className="mt-2 flex justify-center">
                        <button
                          onClick={() => toggleIntegratorDetail(integ.id)}
                          className="text-[11px] bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-100 font-medium cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          {expandedIntegrators[integ.id] ? "Masquer le detail" : "Voir le detail"}
                        </button>
                      </div>
                    )}
                    {expandedIntegrators[integ.id] && (
                      <IntegratorDetailExpanded integrator={integ} />
                    )}
                  </div>
                ))}
              </div>
              {/* Continue button */}
              {stage === 2.5 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setStage(3)}
                    className="text-xs bg-indigo-600 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-700 font-medium cursor-pointer"
                  >
                    <Handshake className="h-3.5 w-3.5" /> Lancer les sessions de jumelage
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== STAGE 3 — JumelageSessionAnimation ===== */}
          {stage >= 3 && stage < 3.5 && (
            <JumelageSessionAnimation
              questions={SIM_ACTE2.jumelageQuestions}
              onComplete={() => setStage(3.5)}
            />
          )}
          {stage >= 3.5 && (
            <div className="ml-11">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-bold text-indigo-800">Sessions de jumelage terminees</div>
                  <div className="text-xs text-indigo-600">{SIM_ACTE2.jumelageQuestions.length} questions evaluees sur 3 integrateurs</div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STAGE 3.5 — ScoringAnimation ===== */}
          {stage >= 3.5 && stage < 4 && (
            <ScoringAnimation
              categories={SIM_ACTE2.scoringCategories}
              results={SIM_ACTE2.scoringResults}
              onComplete={() => setStage(4)}
            />
          )}
          {stage >= 4 && (
            <div className="ml-11">
              <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-sm font-bold text-green-800">Scoring final complete</div>
                  <div className="text-xs text-green-600">
                    {SIM_ACTE2.scoringCategories.length} criteres ponderes, resultats consolides
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STAGE 4 — Winner announcement ===== */}
          {stage >= 4 && (
            <>
              {/* CEO intro before winner */}
              <div className="flex gap-3">
                <BotAvatar code="BCO" size="md" />
                <div className={cn(
                  "bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm max-w-[85%] border-l-[3px]",
                  BOT_COLORS.BCO.border,
                )}>
                  <div className="text-xs text-blue-600 mb-1 font-medium">CarlOS (CEO)</div>
                  {stage === 4 && !ceoIntroDone ? (
                    <TypewriterText
                      text={SIM_ACTE2.ceoWinnerIntro}
                      speed={10}
                      onComplete={() => setCeoIntroDone(true)}
                      className="text-sm text-gray-700 leading-relaxed"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{SIM_ACTE2.ceoWinnerIntro}</p>
                  )}
                </div>
              </div>

              {/* Winner card */}
              {(ceoIntroDone || stage > 4) && (
                <div className="ml-11">
                  <WinnerAnnouncement integrator={INTEGRATORS[0]} animate={stage === 4} />
                </div>
              )}

              {/* CEO selection message */}
              {(ceoIntroDone || stage > 4) && (
                <div className="flex gap-3">
                  <BotAvatar code="BCO" size="md" />
                  <div className={cn(
                    "bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm max-w-[85%] border-l-[3px]",
                    BOT_COLORS.BCO.border,
                  )}>
                    <div className="text-xs text-blue-600 mb-1 font-medium">CarlOS (CEO)</div>
                    {stage === 4 && !ceoWinnerDone ? (
                      <TypewriterText
                        text={SIM_ACTE2.winnerMessage}
                        speed={8}
                        onComplete={() => setCeoWinnerDone(true)}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">{SIM_ACTE2.winnerMessage}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Winner action buttons */}
              {(ceoWinnerDone || stage > 4) && stage === 4 && (
                <div className="ml-11 flex items-center gap-2 flex-wrap animate-in fade-in duration-500">
                  {!showChallenge && (
                    <button
                      onClick={() => setShowChallenge(true)}
                      className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-100 font-medium cursor-pointer"
                    >
                      <Target className="h-3.5 w-3.5" /> Challenger le choix
                    </button>
                  )}
                  {!showAllThree && (
                    <button
                      onClick={() => setShowAllThree(true)}
                      className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-100 font-medium cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Voir les 2 autres candidats
                    </button>
                  )}
                  <button
                    onClick={() => setStage(4.5)}
                    className="text-xs bg-amber-500 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-600 font-medium cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Continuer
                  </button>
                </div>
              )}

              {/* Challenge defense */}
              {showChallenge && (
                <ChallengeDefenseCard
                  onAccept={() => setStage(4.5)}
                  onMoreData={() => { if (!showAllThree) setShowAllThree(true); }}
                />
              )}

              {/* All three comparison */}
              {showAllThree && (
                <div className="space-y-2">
                  <AllThreeComparison />
                  {/* Post-comparison actions */}
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => setStage(4.5)}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-500 text-white hover:bg-amber-600 transition-all"
                    >
                      <ArrowRight className="h-3 w-3" /> Confirmer #{INTEGRATORS[0].nom.split(" ")[0]}
                    </button>
                    <button
                      onClick={() => onTransition?.("analyse")}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition-all"
                    >
                      <Eye className="h-3 w-3" /> Analyser les ecarts
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== STAGE 4.5 — TransitionBanner + action buttons ===== */}
          {stage >= 4.5 && (
            <>
              <TransitionBanner
                from="Jumelage SMART termine"
                to="Prochaine etape : construire le Cahier de Projet"
                animate={stage === 4.5}
              />

              {/* Completion badge */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Jumelage complete — {INTEGRATORS[0].nom} selectionne ({INTEGRATORS[0].score}%)
                  </span>
                </div>
              </div>

              {/* Transition action buttons */}
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <button
                  onClick={() => onTransition?.("cahier-projet")}
                  className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-semibold cursor-pointer shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5" /> Construire le Cahier de Projet
                </button>
                <button
                  onClick={() => {
                    if (!showAllThree) setShowAllThree(true);
                  }}
                  className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-100 font-medium cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" /> Voir un autre integrateur
                </button>
                <button
                  onClick={exportMatchingMarkdown}
                  className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-100 font-medium cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> Exporter le matching
                </button>
                <button
                  onClick={() => onTransition?.("diagnostic")}
                  className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-100 font-medium cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retour au diagnostic
                </button>
              </div>

              {/* Restart button */}
              <div className="flex justify-center py-4">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 bg-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-300 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" /> Relancer le jumelage
                </button>
              </div>
            </>
          )}

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
