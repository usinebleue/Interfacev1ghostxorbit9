/**
 * AtelierDiagnostic.tsx — Atelier split-screen "Diagnostic Preliminaire" V2
 * GAUCHE: Chat riche avec actions inline (challenges, debats, extractions)
 * DROITE: Document diagnostic qui se batit progressivement (5 sections) — pattern DocForge
 * Pattern: discussion evolue → utilisateur extrait/synthetise → sections se remplissent
 * Data: SIM_ACTE1 (cahier-smart-data.ts)
 * Sprint B — Atelier Simulations — Flow Usine Bleue
 */

"use client";

import { useState } from "react";
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  Zap,
  FileText,
  Building2,
  Target,
  Cpu,
  Cog,
  Shield,
  ArrowRight,
  Pin,
  MessageSquare,
  Send,
  Sparkles,
  ShieldQuestion,
  Download,
  Eye,
  Network,
  Lock,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  MultiConsultAnimation,
  BotBubble,
  UserBubble,
  BotAvatar,
  SourcesList,
} from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { SIM_ACTE1 } from "../../cahier-smart-data";
import { AtelierLayout } from "../AtelierLayout";

// ========== TYPES & CONSTANTS ==========

type Stage =
  | "intro"
  | "thinking"
  | "questions"
  | "answer1"
  | "question2"
  | "answer2"
  | "consult"
  | "perspectives"
  | "synthese-thinking"
  | "synthese"
  | "rapport-thinking"
  | "pre-rapport"
  | "transition";

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0,
  thinking: 1,
  questions: 2,
  answer1: 3,
  question2: 4,
  answer2: 5,
  consult: 6,
  perspectives: 7,
  "synthese-thinking": 8,
  synthese: 9,
  "rapport-thinking": 10,
  "pre-rapport": 11,
  transition: 12,
};

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Connecter",
  thinking: "Analyse...",
  questions: "Question 1",
  answer1: "Reponse 1",
  question2: "Question 2",
  answer2: "Reponse 2",
  consult: "Consultation...",
  perspectives: "Perspectives",
  "synthese-thinking": "Synthese...",
  synthese: "Synthese",
  "rapport-thinking": "Rapport...",
  "pre-rapport": "Pre-rapport",
  transition: "Termine",
};

// ========== CHALLENGE DATA ==========

const CFO_CHALLENGE =
  "Bonne question de challenger les chiffres. Le 510K$ de subventions HQ est un plafond theorique — en pratique, les dossiers bien montes obtiennent entre 85% et 95% du maximum. Sur nos 40 derniers dossiers, la moyenne est de 92%. Donc on parle realistement de 470K$ minimum. Pour le STIQ, c'est plus conservateur — le 40% est un pourcentage fixe sur les couts admissibles, pas de marge d'interpretation. Le vrai risque c'est le delai d'approbation HQ : 8-12 semaines. Il faut deposer avant juin 2026 sinon on perd le cycle budgetaire.";

const COO_CHALLENGE =
  "Le plan en 4 phases est concu pour zero interruption de production. Phase 2 (refrigeration) se fait exclusivement les weekends et soirs — on debranche l'ancien systeme par zone, jamais tout d'un coup. Phase 3 (cobot palettiseur) est la plus simple : le robot s'installe a cote de la ligne existante, on fait 3 jours de tests en parallele avec l'equipe manuelle, puis on bascule. Les 6 employes de palettisation sont rediriges vers le controle qualite et l'emballage secondaire — aucun licenciement. Le risque principal : la livraison du systeme CO2 transcritique a un delai de 6-8 semaines apres commande.";

const CTO_CHALLENGE =
  "Les 3 technologies recommandees ne sont pas experimentales — elles sont eprouvees en manufacturier alimentaire. Le cobot UR10e est certifie IP67 pour les environnements alimentaires, 40,000+ unites installees dans le monde. Le systeme CO2 transcritique est le standard post-HFC — la reglementation canadienne interdit les HFC d'ici 2028, donc c'est inevitable. Les capteurs IoT utilisent LoRaWAN, la meme techno que chez Saputo et Agropur. Le ROI de 20-24 mois est base sur 23 projets similaires — pas des projections theoriques.";

const TRIPLE_DEBAT = {
  cfo: "Le timing est critique. Si on rate la fenetre HQ de juin 2026, on perd 12 mois. Je recommande de deposer les 4 dossiers simultanement — EnerGuide, systemes industriels, STIQ et RS&DE. Le risque de ne pas combiner les 3 axes, c'est de perdre l'effet levier des subventions croisees.",
  coo: "Frank a raison sur le timing, mais je souleve un point : les 6 operateurs de palettisation doivent etre formes AVANT l'arrivee du cobot, pas pendant. Ca veut dire demarrer la formation en Phase 1. Ca ajoute 15-20K$ mais reduit le risque de resistance au changement de 80%.",
  cto: "D'accord avec Olivier. J'ajoute que l'IoT devrait commencer en Phase 1 aussi — installer les capteurs de base des le debut permet de mesurer le 'avant' pour prouver les economies a HQ. Les donnees de monitoring pre-travaux renforcent enormement le dossier de subvention.",
  consensus:
    "Demarrer la formation operateurs ET les capteurs IoT des la Phase 1 (ajout de 15-20K$). Deposer les 4 dossiers de subventions simultanement. Le chevauchement anticipe permet de gagner 4-6 semaines tout en renforcant le dossier HQ avec des donnees reelles.",
};

const SYNTHESE_DEFENSE =
  "Je comprends le scepticisme — les chiffres semblent optimistes. Mais decomposons : les 590K$ de subventions ne sont pas un seul programme, c'est 4 programmes combines. Le ROI de 22 mois est base sur des economies reelles mesurees — pas des projections. Le risque principal est le timing : si on rate la fenetre HQ de juin 2026, on repousse de 12 mois. Les 3 axes se renforcent : la chaleur recuperee du CO2 alimente le chauffage, le cobot libere du personnel pour le controle qualite, et l'IoT valide les economies en temps reel.";

const CONTRE_ARGUMENT =
  "Si je devais plaider contre ce projet : la dependance aux subventions est trop forte. Sur 1.1M$ brut, 592K$ (54%) viennent de programmes gouvernementaux. Si HQ change ses criteres, le ROI passe de 22 a 42 mois. De plus, le marche des cobots est en surchauffe — delais fournisseurs +4-8 semaines. Enfin, la reconversion des 6 employes n'est pas garantie — taux d'echec de 15-20% en manufacture.";

// ========== MAIN COMPONENT ==========

export function AtelierDiagnostic({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [introTyped, setIntroTyped] = useState(false);
  const [ceoQ1Typed, setCeoQ1Typed] = useState(false);
  const [ceoQ2Typed, setCeoQ2Typed] = useState(false);

  // Challenge states
  const [showCfoChallenge, setShowCfoChallenge] = useState(false);
  const [showCooChallenge, setShowCooChallenge] = useState(false);
  const [showCtoChallenge, setShowCtoChallenge] = useState(false);
  const [showTripleDebat, setShowTripleDebat] = useState(false);
  const [showSyntheseChallenge, setShowSyntheseChallenge] = useState(false);
  const [showContreArgument, setShowContreArgument] = useState(false);

  // Sentinel
  const [challengeCount, setChallengeCount] = useState(0);
  const [showSentinel, setShowSentinel] = useState(false);

  // Extracted items → right panel document
  const [extractedInsights, setExtractedInsights] = useState<string[]>([]);
  const [perspectivesExtracted, setPerspectivesExtracted] = useState(false);
  const [syntheseExtracted, setSyntheseExtracted] = useState(false);
  const [rapportGenerated, setRapportGenerated] = useState(false);
  const [profilFilled, setProfilFilled] = useState(false);

  const handleChallenge = (action: () => void) => {
    const newCount = challengeCount + 1;
    setChallengeCount(newCount);
    action();
    if (newCount >= 3 && !showSentinel) {
      setTimeout(() => setShowSentinel(true), 1500);
    }
  };

  const handleExtract = (key: string) => {
    if (!extractedInsights.includes(key)) {
      setExtractedInsights((prev) => [...prev, key]);
    }
  };

  const handleReset = () => {
    setStage("intro");
    setIntroTyped(false);
    setCeoQ1Typed(false);
    setCeoQ2Typed(false);
    setShowCfoChallenge(false);
    setShowCooChallenge(false);
    setShowCtoChallenge(false);
    setShowTripleDebat(false);
    setShowSyntheseChallenge(false);
    setShowContreArgument(false);
    setChallengeCount(0);
    setShowSentinel(false);
    setExtractedInsights([]);
    setPerspectivesExtracted(false);
    setSyntheseExtracted(false);
    setRapportGenerated(false);
    setProfilFilled(false);
  };

  // ═══════════════════════════════════════
  // CHAT CONTENT (Left Panel) — Rich interactions
  // ═══════════════════════════════════════
  const chatContent = (
    <>
      {/* User tension */}
      <UserBubble text={SIM_ACTE1.userTension} time="14:30" />

      {/* CEO intro + typewriter */}
      {stage === "intro" && (
        <BotBubble code="CEOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text={SIM_ACTE1.ceoResponse}
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button
                onClick={() => setStage("thinking")}
                className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Lancer le diagnostic
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble
          code="CEOB"
          text={SIM_ACTE1.ceoResponse}
          phaseLabel="Connecter"
          time="14:30"
        />
      )}

      {/* CEO Thinking */}
      {stage === "thinking" && (
        <ThinkingAnimation
          steps={SIM_ACTE1.ceoThinking}
          botEmoji=""
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => setStage("questions")}
        />
      )}

      {/* Question 1 */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["questions"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Rechercher" time="14:31">
          {stage === "questions" ? (
            <>
              <TypewriterText
                text={SIM_ACTE1.ceoQuestion1}
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => setCeoQ1Typed(true)}
              />
              {ceoQ1Typed && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setStage("answer1");
                      setProfilFilled(true);
                    }}
                    className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Repondre
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-800">{SIM_ACTE1.ceoQuestion1}</p>
          )}
        </BotBubble>
      )}

      {/* User answer 1 */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["answer1"] && (
        <>
          <UserBubble text={SIM_ACTE1.userAnswer1} time="14:32" />
          {stage === "answer1" && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage("question2")}
                className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> CarlOS poursuit...
              </button>
            </div>
          )}
        </>
      )}

      {/* Question 2 */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["question2"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Rechercher" time="14:33">
          {stage === "question2" ? (
            <>
              <TypewriterText
                text={SIM_ACTE1.ceoQuestion2}
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => setCeoQ2Typed(true)}
              />
              {ceoQ2Typed && (
                <div className="mt-3">
                  <button
                    onClick={() => setStage("answer2")}
                    className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Repondre
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-800">{SIM_ACTE1.ceoQuestion2}</p>
          )}
        </BotBubble>
      )}

      {/* User answer 2 */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["answer2"] && (
        <>
          <UserBubble text={SIM_ACTE1.userAnswer2} time="14:34" />
          {stage === "answer2" && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage("consult")}
                className="text-xs bg-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Network className="h-3.5 w-3.5" /> Consulter les specialistes...
              </button>
            </div>
          )}
        </>
      )}

      {/* Multi-bot consult animation */}
      {stage === "consult" && (
        <MultiConsultAnimation
          bots={SIM_ACTE1.consultBots}
          onComplete={() => setStage("perspectives")}
        />
      )}

      {/* ═══ PERSPECTIVES — with inline challenge buttons ═══ */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["perspectives"] && (
        <>
          {SIM_ACTE1.perspectives.map((p, i) => (
            <BotBubble
              key={i}
              code={p.code}
              text={p.text}
              phaseLabel="Exposer"
              time={`14:${35 + i}`}
            >
              <SourcesList sources={p.sources} />
            </BotBubble>
          ))}

          {/* Inline action buttons after perspectives */}
          {stage === "perspectives" && (
            <div className="space-y-3 ml-2">
              {/* Row 1 — Challenge each bot */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mr-1">
                  Challenger :
                </span>
                <button
                  onClick={() => handleChallenge(() => setShowCfoChallenge(true))}
                  disabled={showCfoChallenge}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showCfoChallenge
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  )}
                >
                  <Target className="h-3.5 w-3.5" /> CFO — Subventions
                </button>
                <button
                  onClick={() => handleChallenge(() => setShowCooChallenge(true))}
                  disabled={showCooChallenge}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showCooChallenge
                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                      : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                  )}
                >
                  <Target className="h-3.5 w-3.5" /> COO — Operations
                </button>
                <button
                  onClick={() => handleChallenge(() => setShowCtoChallenge(true))}
                  disabled={showCtoChallenge}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showCtoChallenge
                      ? "bg-violet-100 text-violet-700 border border-violet-300"
                      : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
                  )}
                >
                  <Target className="h-3.5 w-3.5" /> CTO — Technologies
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
                  <MessageSquare className="h-3.5 w-3.5" /> Debat entre les 3
                </button>
                <button
                  onClick={() => {
                    setPerspectivesExtracted(true);
                    setStage("synthese-thinking");
                  }}
                  className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Synthetiser
                </button>
              </div>

              {/* CFO Challenge response */}
              {showCfoChallenge && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CFOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-emerald-400 flex-1">
                      <div className="text-xs text-emerald-600 mb-2 font-medium">
                        Frank (CFO) — Reponse au challenge
                      </div>
                      <TypewriterText
                        text={CFO_CHALLENGE}
                        speed={6}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => handleExtract("cfo")}
                      className={cn(
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedInsights.includes("cfo")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" />{" "}
                      {extractedInsights.includes("cfo") ? "Extrait ✓" : "Extraire → diagnostic"}
                    </button>
                    <button
                      onClick={() => {
                        setPerspectivesExtracted(true);
                        setStage("synthese-thinking");
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> Passer a la synthese
                    </button>
                  </div>
                </div>
              )}

              {/* COO Challenge response */}
              {showCooChallenge && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="COOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-orange-400 flex-1">
                      <div className="text-xs text-orange-600 mb-2 font-medium">
                        Olivier (COO) — Detail du plan operationnel
                      </div>
                      <TypewriterText
                        text={COO_CHALLENGE}
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
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => handleExtract("coo")}
                      className={cn(
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedInsights.includes("coo")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" />{" "}
                      {extractedInsights.includes("coo") ? "Extrait ✓" : "Extraire → diagnostic"}
                    </button>
                    <button
                      onClick={() => {
                        setPerspectivesExtracted(true);
                        setStage("synthese-thinking");
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> Passer a la synthese
                    </button>
                  </div>
                </div>
              )}

              {/* CTO Challenge response */}
              {showCtoChallenge && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CTOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-violet-400 flex-1">
                      <div className="text-xs text-violet-600 mb-2 font-medium">
                        Tim (CTO) — Defense des choix technologiques
                      </div>
                      <TypewriterText
                        text={CTO_CHALLENGE}
                        speed={5}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-bold text-violet-800">40,000+</div>
                          <div className="text-gray-500">UR10e installes</div>
                        </div>
                        <div className="bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-bold text-violet-800">2028</div>
                          <div className="text-gray-500">Fin HFC (loi)</div>
                        </div>
                        <div className="bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-bold text-violet-800">23 projets</div>
                          <div className="text-gray-500">Base ROI</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => handleExtract("cto")}
                      className={cn(
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedInsights.includes("cto")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" />{" "}
                      {extractedInsights.includes("cto") ? "Extrait ✓" : "Extraire → diagnostic"}
                    </button>
                    <button
                      onClick={() => {
                        setPerspectivesExtracted(true);
                        setStage("synthese-thinking");
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> Passer a la synthese
                    </button>
                  </div>
                </div>
              )}

              {/* Triple Debat */}
              {showTripleDebat && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="border border-violet-200 rounded-xl overflow-hidden">
                    <div className="bg-violet-50 px-4 py-2.5 flex items-center gap-2 border-b border-violet-200">
                      <MessageSquare className="h-4 w-4 text-violet-600" />
                      <span className="text-xs font-bold text-violet-800">Debat croise — CFO x COO x CTO</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <BotAvatar code="CFOB" size="sm" />
                        <div className="flex-1">
                          <div className="text-xs text-emerald-600 font-medium mb-1">Frank (CFO)</div>
                          <p className="text-sm text-gray-700">{TRIPLE_DEBAT.cfo}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <BotAvatar code="COOB" size="sm" />
                        <div className="flex-1">
                          <div className="text-xs text-orange-600 font-medium mb-1">Olivier (COO)</div>
                          <p className="text-sm text-gray-700">{TRIPLE_DEBAT.coo}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <BotAvatar code="CTOB" size="sm" />
                        <div className="flex-1">
                          <div className="text-xs text-violet-600 font-medium mb-1">Tim (CTO)</div>
                          <p className="text-sm text-gray-700">{TRIPLE_DEBAT.cto}</p>
                        </div>
                      </div>
                      <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2.5 text-xs">
                        <div className="font-bold text-violet-800 mb-1 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" /> Consensus des 3 specialistes
                        </div>
                        <p className="text-gray-700">{TRIPLE_DEBAT.consensus}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleExtract("debat")}
                      className={cn(
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedInsights.includes("debat")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" />{" "}
                      {extractedInsights.includes("debat") ? "Consensus extrait ✓" : "Extraire le consensus"}
                    </button>
                    <button
                      onClick={() => {
                        setPerspectivesExtracted(true);
                        setStage("synthese-thinking");
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                      <ArrowRight className="h-3.5 w-3.5" /> Synthetiser avec le consensus
                    </button>
                  </div>
                </div>
              )}

              {/* CarlOS Sentinel warning */}
              {showSentinel && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex gap-3">
                    <BotAvatar code="CEOB" size="md" />
                    <div className="bg-amber-50 border border-amber-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-amber-500 flex-1">
                      <div className="text-xs text-amber-700 mb-1.5 font-medium flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> CarlOS — Sentinelle
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        On a bien explore les perspectives — {challengeCount} interactions. Les 3 specialistes convergent. Je recommande de passer a la synthese.
                      </p>
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setPerspectivesExtracted(true);
                            setStage("synthese-thinking");
                          }}
                          className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                        >
                          <ArrowRight className="h-3.5 w-3.5" /> Passer a la synthese
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted insights badge */}
              {extractedInsights.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                  <div className="bg-green-50 border border-green-200 rounded-full px-3 py-1 flex items-center gap-1.5">
                    <Pin className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-[11px] text-green-700 font-medium">
                      {extractedInsights.length} insight(s) → diagnostic enrichi
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ SYNTHESE ═══ */}
      {stage === "synthese-thinking" && (
        <ThinkingAnimation
          steps={SIM_ACTE1.syntheseThinking}
          botEmoji=""
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => {
            setSyntheseExtracted(true);
            setStage("synthese");
          }}
        />
      )}

      {STAGE_INDEX[stage] >= STAGE_INDEX["synthese"] && (
        <>
          <BotBubble
            code="CEOB"
            text={SIM_ACTE1.syntheseCard.ceoIntro}
            phaseLabel="Demontrer"
            time="14:38"
          />

          {stage === "synthese" && (
            <div className="space-y-3 ml-2">
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
                  <Target className="h-3.5 w-3.5" /> Challenger la synthese
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
                  <ShieldQuestion className="h-3.5 w-3.5" /> Contre-argument
                </button>
                <button
                  onClick={() => setStage("rapport-thinking")}
                  className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-blue-700 font-medium cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" /> Generer le pre-rapport
                </button>
              </div>

              {/* Synthese challenge */}
              {showSyntheseChallenge && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CEOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-blue-500 flex-1">
                      <div className="text-xs text-blue-600 mb-2 font-medium">CarlOS — Defense de la synthese</div>
                      <TypewriterText text={SYNTHESE_DEFENSE} speed={5} className="text-sm text-gray-700 leading-relaxed" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => setStage("rapport-thinking")}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" /> Generer le pre-rapport
                    </button>
                  </div>
                </div>
              )}

              {/* Contre-argument */}
              {showContreArgument && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CEOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-red-400 flex-1">
                      <div className="text-xs text-red-600 mb-2 font-medium">CarlOS — Meilleur argument CONTRE</div>
                      <TypewriterText text={CONTRE_ARGUMENT} speed={5} className="text-sm text-gray-700 leading-relaxed" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => setStage("rapport-thinking")}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" /> Generer le pre-rapport
                    </button>
                    <button
                      onClick={() => handleExtract("contre")}
                      className={cn(
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedInsights.includes("contre")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" />{" "}
                      {extractedInsights.includes("contre") ? "Risques notes ✓" : "Noter les risques"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ PRE-RAPPORT ═══ */}
      {stage === "rapport-thinking" && (
        <ThinkingAnimation
          steps={SIM_ACTE1.preRapportThinking}
          botEmoji=""
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => {
            setRapportGenerated(true);
            setStage("pre-rapport");
          }}
        />
      )}

      {STAGE_INDEX[stage] >= STAGE_INDEX["pre-rapport"] && (
        <>
          <BotBubble
            code="CEOB"
            text={SIM_ACTE1.preRapport.ceoRecommandation}
            phaseLabel="Obtenir"
            time="14:40"
          />

          {stage === "pre-rapport" && (
            <div className="space-y-3 ml-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setStage("transition")}
                  className="text-xs bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Lancer le Jumelage SMART
                </button>
                <button
                  onClick={handleReset}
                  className="text-xs bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer border border-gray-200"
                >
                  Recommencer
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transition */}
      {stage === "transition" && (
        <BotBubble code="CEOB" text={SIM_ACTE1.ceoTransition} phaseLabel="Transition" time="14:42" />
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ATELIER CONTENT (Right Panel) — Document DocForge qui se batit
  // ═══════════════════════════════════════
  const atelierContent = (
    <div className="space-y-3">
      {/* Document header */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-red-100 to-orange-100 px-4 py-3 border-b border-red-200">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-red-700" />
            <div>
              <h3 className="text-sm font-bold text-red-900">Diagnostic Preliminaire</h3>
              <p className="text-[11px] text-red-700/70">Les sections se remplissent au fil de la discussion</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-red-200/50 rounded-full h-1.5">
              <div
                className="bg-red-600 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((profilFilled ? 1 : 0) +
                      (perspectivesExtracted ? 1 : 0) +
                      (extractedInsights.length > 0 ? 1 : 0) +
                      (syntheseExtracted ? 1 : 0) +
                      (rapportGenerated ? 1 : 0)) * 20
                  }%`,
                }}
              />
            </div>
            <span className="text-[9px] font-bold text-red-800">
              {(profilFilled ? 1 : 0) +
                (perspectivesExtracted ? 1 : 0) +
                (extractedInsights.length > 0 ? 1 : 0) +
                (syntheseExtracted ? 1 : 0) +
                (rapportGenerated ? 1 : 0)}/5
            </span>
          </div>
        </div>
      </div>

      {/* Section 1 — Profil Entreprise */}
      <DocSectionCard title="1. Profil Entreprise" icon={Building2} filled={profilFilled}>
        {profilFilled && (
          <div className="grid grid-cols-2 gap-1.5">
            <ProfilItem label="Entreprise" value={SIM_ACTE1.preRapport.profil.nom} />
            <ProfilItem label="Secteur" value={SIM_ACTE1.preRapport.profil.secteur} />
            <ProfilItem label="Employes" value={String(SIM_ACTE1.preRapport.profil.employes)} />
            <ProfilItem label="Lignes prod." value={String(SIM_ACTE1.preRapport.profil.lignes)} />
            <ProfilItem label="SKUs" value={String(SIM_ACTE1.preRapport.profil.skus)} />
            <ProfilItem label="CA" value={SIM_ACTE1.preRapport.profil.ca} />
            <ProfilItem label="Localisation" value={SIM_ACTE1.preRapport.profil.localisation} />
            <ProfilItem label="Budget" value="800K$ - 1.2M$" />
          </div>
        )}
      </DocSectionCard>

      {/* Section 2 — Besoins Identifies */}
      <DocSectionCard title="2. Besoins Identifies" icon={Target} filled={profilFilled}>
        {profilFilled && (
          <div className="space-y-2">
            {[
              { icon: Zap, label: "Efficacite energetique", desc: "Systemes vetustes, couts +40% en 2 ans", color: "text-amber-600" },
              { icon: Cog, label: "Palettisation robotisee", desc: "100% manuel, 6 employes, blessures SST", color: "text-orange-600" },
              { icon: Cpu, label: "Automatisation & IoT", desc: "Zero monitoring, zero donnees temps reel", color: "text-violet-600" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
                <item.icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", item.color)} />
                <div>
                  <p className="text-xs font-medium text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DocSectionCard>

      {/* Section 3 — Perspectives Specialistes */}
      <DocSectionCard title="3. Perspectives Specialistes" icon={Eye} filled={perspectivesExtracted}>
        {perspectivesExtracted && (
          <div className="space-y-2">
            {SIM_ACTE1.perspectives.map((p, i) => {
              const botColor = BOT_COLORS[p.code];
              return (
                <div key={i} className="border rounded-lg p-2.5 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", botColor?.bgLight, botColor?.text)}>
                      {p.name} ({botColor?.role})
                    </span>
                    <span className="text-[9px] text-gray-500">{p.angle}</span>
                  </div>
                  <p className="text-[11px] text-gray-700 mb-1">{p.verdict}</p>
                  <SourcesList sources={p.sources} />
                </div>
              );
            })}

            {extractedInsights.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mt-2">
                <p className="text-[9px] font-bold text-green-800 mb-1 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Insights extraites ({extractedInsights.length})
                </p>
                <div className="space-y-1">
                  {extractedInsights.includes("cfo") && (
                    <p className="text-[11px] text-green-700">CFO: 470K$ minimum realiste (92% taux approbation), depot avant juin 2026</p>
                  )}
                  {extractedInsights.includes("coo") && (
                    <p className="text-[11px] text-green-700">COO: 0% arret production, 0 licenciements, 4 semaines economisees</p>
                  )}
                  {extractedInsights.includes("cto") && (
                    <p className="text-[11px] text-green-700">CTO: 40,000+ cobots UR10e, fin HFC 2028, ROI sur 23 projets</p>
                  )}
                  {extractedInsights.includes("debat") && (
                    <p className="text-[11px] text-green-700">Consensus: formation + IoT des Phase 1, 4 dossiers simultanement</p>
                  )}
                  {extractedInsights.includes("contre") && (
                    <p className="text-[11px] text-red-600">Risque: 54% dependance subventions, delais cobot, 15-20% echec reconversion</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DocSectionCard>

      {/* Section 4 — Synthese & Analyse */}
      <DocSectionCard title="4. Synthese & Analyse" icon={CheckCircle2} filled={syntheseExtracted}>
        {syntheseExtracted && (
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-gray-700 flex items-center gap-1 mb-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-600" /> Points cles
              </p>
              <ul className="space-y-1">
                {SIM_ACTE1.syntheseCard.pointsCles.map((pt, i) => (
                  <li key={i} className="text-[11px] text-gray-600 flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
              <p className="text-[9px] font-bold text-red-800 flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Risques identifies
              </p>
              <ul className="space-y-0.5">
                {SIM_ACTE1.syntheseCard.risques.map((r, i) => (
                  <li key={i} className="text-[11px] text-red-700 flex items-start gap-1.5">
                    <span className="text-red-400 shrink-0">-</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DocSectionCard>

      {/* Section 5 — Pre-Rapport */}
      <DocSectionCard title="5. Pre-Rapport & Recommandations" icon={FileText} filled={rapportGenerated}>
        {rapportGenerated && (
          <div className="space-y-3">
            {SIM_ACTE1.preRapport.axes.map((axe, i) => {
              const AXE_ICONS: Record<string, React.ElementType> = { zap: Zap, cog: Cog, cpu: Cpu };
              const AxeIcon = AXE_ICONS[axe.icone] || Zap;
              return (
                <div key={i} className="border rounded-lg p-2.5 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <AxeIcon className="h-3.5 w-3.5 text-violet-600" />
                    <span className="text-xs font-bold text-gray-800">{axe.titre}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1.5">{axe.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{axe.estimation}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">{axe.subventions}</span>
                  </div>
                </div>
              );
            })}

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-3">
              <p className="text-[9px] font-bold text-green-800 flex items-center gap-1 mb-1">
                <Shield className="h-3.5 w-3.5" /> Recommandation
              </p>
              <p className="text-[11px] text-green-700">{SIM_ACTE1.preRapport.recommandation}</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="text-[11px] bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-50 font-medium cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Exporter le diagnostic
              </button>
            </div>
          </div>
        )}
      </DocSectionCard>
    </div>
  );

  return (
    <AtelierLayout
      title="Diagnostic Preliminaire"
      icon={Scan}
      iconColor="text-red-600"
      stage={STAGE_INDEX[stage]}
      stageCount={13}
      stageLabel={STAGE_LABELS[stage]}
      onBack={onBack}
      onReset={handleReset}
      chatContent={chatContent}
      atelierContent={atelierContent}
      actions={[]}
    />
  );
}

// ========== DOCUMENT SECTION CARD ==========

function DocSectionCard({
  title,
  icon: Icon,
  filled,
  children,
}: {
  title: string;
  icon: React.ElementType;
  filled: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-500",
        filled ? "border-gray-200" : "border-dashed border-gray-300 opacity-60"
      )}
    >
      <div
        className={cn(
          "px-4 py-2 flex items-center gap-2 border-b",
          filled ? "bg-gray-50 border-gray-200" : "bg-gray-50/50 border-gray-200/50"
        )}
      >
        {filled ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Lock className="h-3.5 w-3.5 text-gray-300" />
        )}
        <Icon className={cn("h-3.5 w-3.5", filled ? "text-gray-600" : "text-gray-300")} />
        <span className={cn("text-xs font-medium", filled ? "text-gray-700" : "text-gray-400")}>{title}</span>
        {!filled && <span className="text-[9px] text-gray-400 ml-auto italic">En attente...</span>}
      </div>
      {filled && children && <div className="p-3">{children}</div>}
    </div>
  );
}

// ========== HELPERS ==========

function ProfilItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded px-2 py-1">
      <div className="text-[9px] text-gray-500">{label}</div>
      <div className="text-xs font-medium text-gray-800 truncate">{value}</div>
    </div>
  );
}
