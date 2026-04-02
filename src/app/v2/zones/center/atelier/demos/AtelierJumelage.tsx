/**
 * AtelierJumelage.tsx — Self-contained Atelier split-screen "Jumelage SMART"
 * GAUCHE: Chat riche avec actions inline (scan, sessions, challenge, defense)
 * DROITE: Document jumelage qui se batit progressivement (5 sections) — pattern DocForge
 * Pattern: discussion evolue -> utilisateur valide/challenge -> sections se remplissent
 * Data: SIM_ACTE2 + INTEGRATORS (cahier-smart-data.ts)
 * Self-contained: TopBar, sub-tabs, split-screen, SBubble/SBtn/AutoAdvance
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Handshake,
  CheckCircle2,
  Search,
  Filter,
  Trophy,
  Star,
  ArrowRight,
  ArrowLeft,
  Shield,
  Users,
  Award,
  Target,
  Pin,
  Send,
  Eye,
  Sparkles,
  MessageSquare,
  ShieldQuestion,
  Download,
  Lock,
  FileText,
  BarChart3,
  Cog,
  Building2,
  Zap,
  Video,
  RotateCcw,
  LayoutDashboard,
  Globe,
  Brain,
  Mic,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { SIM_ACTE2, INTEGRATORS } from "../../cahier-smart-data";

const UB_BLUE = "#073E5A";

// ========== TYPES & CONSTANTS ==========

type Stage =
  | "intro"
  | "criteres-thinking"
  | "criteres"
  | "user-critere"
  | "scan"
  | "top3"
  | "conference-setup"
  | "conference-energia"
  | "conference-techno"
  | "conference-green"
  | "scoring"
  | "winner-intro"
  | "winner"
  | "transition";

const STAGE_ORDER: Stage[] = [
  "intro",
  "criteres-thinking",
  "criteres",
  "user-critere",
  "scan",
  "top3",
  "conference-setup",
  "conference-energia",
  "conference-techno",
  "conference-green",
  "scoring",
  "winner-intro",
  "winner",
  "transition",
];

const STAGE_LABELS: Record<Stage, string> = {
  intro: "Introduction",
  "criteres-thinking": "Analyse...",
  criteres: "Criteres",
  "user-critere": "Ajustement",
  scan: "Scan reseau...",
  top3: "TOP 3",
  "conference-setup": "Organisation",
  "conference-energia": "Session Energia",
  "conference-techno": "Session Techno-Froid",
  "conference-green": "Session GreenTech",
  scoring: "Scoring",
  "winner-intro": "Recommandation",
  winner: "Selection",
  transition: "Termine",
};

// ========== SUB-TABS ==========

const SUB_TABS = [
  { id: "jumelage", label: "Jumelage SMART", icon: Handshake, active: true },
  { id: "criteres", label: "Criteres", icon: Filter, active: false },
  { id: "scan", label: "Scan Reseau", icon: Search, active: false },
  { id: "conferences", label: "Conferences", icon: Video, active: false },
  { id: "scoring", label: "Scoring", icon: BarChart3, active: false },
];

// ========== CHALLENGE DATA ==========

const CHALLENGE_DEFENSE =
  "Je comprends le reflexe de vouloir challenger. Voici pourquoi Energia Solutions est objectivement le meilleur choix pour Aliments Boreal : 1) Seul integrateur a couvrir les 3 axes — Techno-Froid n'a pas de capacite robotique (score 35%) et GreenTech n'a pas d'expertise energie pure (score 50%). Energia couvre tout avec des equipes internes. 2) Subventions = le facteur decisif — Avec 98% de taux d'approbation sur 40+ dossiers, Energia maximise les 592K$ de subventions. Un dossier mal monte = perte de 300K$+. 3) Delai et risque — 20 semaines integrees vs 24-28 semaines avec sous-traitants.";

const ALTERNATIVE_ANALYSIS =
  "Si on compare les 2 alternatives : Techno-Froid Saguenay (65%) est excellent en energie (72%) et bien place geographiquement (98%) mais zero capacite robotique. Ca force un sous-traitant pour la palettisation = coordination, delais, risque. GreenTech Industries (68%) est fort en IoT (95%) et robotique (85%) mais faible en energie (50%) et subventions (50%). Ils devraient aussi sous-traiter le coeur du projet. En resume : aucun des 2 ne peut livrer un projet integre — seulement Energia.";

const JUMELAGE_HIGHLIGHT_Q1 = {
  question: SIM_ACTE2.jumelageQuestions[0].question,
  energia: SIM_ACTE2.jumelageQuestions[0].reponses[0],
  techno: SIM_ACTE2.jumelageQuestions[0].reponses[1],
  green: SIM_ACTE2.jumelageQuestions[0].reponses[2],
};

const JUMELAGE_HIGHLIGHT_Q3 = {
  question: SIM_ACTE2.jumelageQuestions[2].question,
  energia: SIM_ACTE2.jumelageQuestions[2].reponses[0],
  techno: SIM_ACTE2.jumelageQuestions[2].reponses[1],
  green: SIM_ACTE2.jumelageQuestions[2].reponses[2],
};

// ========== CONFERENCE AI DATA ==========

const CONF_SUPPLIERS = {
  energia: { name: "Marc-Andre Dubois", company: "Energia Solutions", initial: "E", color: "bg-amber-500" },
  techno: { name: "Jean-Francois Tremblay", company: "Techno-Froid Saguenay", initial: "T", color: "bg-gray-400" },
  green: { name: "Sophie Lavoie", company: "GreenTech Industries", initial: "G", color: "bg-orange-400" },
} as const;

const CONF_ENERGIA_EXCHANGES = [
  { from: "CPOB" as const, text: "Bienvenue Marc-Andre. On commence par la refrigeration CO2 — c'est le coeur du projet Boreal. Expliquez-nous votre approche pour une usine de transformation de cette taille." },
  { from: "supplier" as const, text: "Merci Paco. On a livre 12 systemes CO2 transcritiques en 3 ans, dont 4 en agroalimentaire. Design modulaire, monitoring IoT, et recuperation de chaleur integree — 35% d'economie sur le gaz naturel en hiver." },
  { from: "user" as const, text: "Vos systemes sont compatibles HACCP zone 3 pour nos produits surgeles?" },
  { from: "supplier" as const, text: "4 de nos installations sont certifiees HACCP, dont 2 en zone 3 surgele. Echangeurs inox 316L, detection de fuites CO2, backup ammoniaque automatique. On peut fournir les rapports d'audit Qualtech." },
  { from: "CPOB" as const, text: "Parfait. Cote robotique — 8 installations de cobots dans votre dossier. Quelle configuration pour la palettisation Boreal?" },
  { from: "supplier" as const, text: "2 cobots Universal Robots UR10e sur rails lineaires, 12 cycles/minute, gripper adaptatif pour 6 formats de caisse. Projet identique chez Aliments Fontaine — meme volume, memes contraintes. Installation 3 semaines, formation incluse." },
];

const CONF_ENERGIA_INSIGHTS = [
  "12 systemes CO2 livres (4 agroalimentaire, 2 HACCP zone 3)",
  "Recuperation chaleur = -35% gaz naturel",
  "Cobots UR10e — projet identique chez Aliments Fontaine",
  "Delai complet : 20 semaines integrees",
];

const CONF_TECHNO_EXCHANGES = [
  { from: "CPOB" as const, text: "Jean-Francois, la robotique n'est pas votre specialite principale — comment vous gerez ce volet pour un projet integre comme Boreal?" },
  { from: "supplier" as const, text: "On est des experts en froid, pas en robotique. On travaille avec RoboPack Quebec depuis 2 ans — ils gerent les cobots, nous la refrigeration. Deux equipes sur le plancher en parallele." },
  { from: "CPOB" as const, text: "Ca pose un risque de coordination. Et les subventions — votre track record sur les dossiers HQ et STIQ?" },
  { from: "supplier" as const, text: "3 dossiers HQ en 2025, taux 100% — mais juste la portion energie. Un dossier integre energie + robotique, on n'a jamais monte ca. Il faudrait un consultant externe." },
  { from: "user" as const, text: "Si vous devez sous-traiter la robotique ET les subventions integrees, qui coordonne le projet au final?" },
  { from: "supplier" as const, text: "Honnetement, ca serait nous le maitre d'oeuvre, mais avec 2 sous-traitants a coordonner... je comprends que ca peut inquieter. On l'a fait une fois, ca a pris 28 semaines au lieu de 20." },
];

const CONF_TECHNO_INSIGHTS = [
  "Zero capacite robotique interne — sous-traitance RoboPack",
  "Risque coordination 2 equipes simultanees sur plancher",
  "Subventions : seulement portion energie (jamais integre)",
  "Delai realiste : 28 semaines (vs 20 pour Energia)",
];

const CONF_GREEN_EXCHANGES = [
  { from: "CPOB" as const, text: "Sophie, score IoT impressionnant — 95%. Mais parlons refrigeration CO2 : votre derniere installation date de quand exactement?" },
  { from: "supplier" as const, text: "Mai 2023 chez Produits Marins Cote-Nord. Depuis, on s'est concentres sur l'IoT et l'automatisation. On peut le faire, mais c'est pas notre plus grande force en ce moment." },
  { from: "user" as const, text: "Et les subventions? On vise 592K$ en subventions combinees HQ et STIQ. Votre track record?" },
  { from: "supplier" as const, text: "2 dossiers HQ l'an dernier — un approuve, un refuse pour documentation technique insuffisante. Taux de 50%. Je prefere etre transparente plutot que de vous promettre des chiffres irrealistes." },
  { from: "CPOB" as const, text: "La transparence, c'est apprecie. Derniere question — delai de livraison pour un projet de cette envergure?" },
  { from: "supplier" as const, text: "24 semaines minimum. On est plus lents que d'autres parce qu'on integre beaucoup de capteurs IoT, mais le suivi post-installation est compris pour 2 ans." },
];

const CONF_GREEN_INSIGHTS = [
  "Derniere installation CO2 : mai 2023 (quasi 3 ans)",
  "Force : IoT (95%) + robotique (85%) + suivi 2 ans inclus",
  "Subventions : taux 50% (1 approuve, 1 refuse)",
  "Delai : 24 semaines + transparence appreciee",
];

// ========== MAIN COMPONENT ==========

export function AtelierJumelage({ onBack }: { onBack?: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [introTyped, setIntroTyped] = useState(false);
  const [criteresTyped, setCriteresTyped] = useState(false);

  // Challenges
  const [showChallengeDefense, setShowChallengeDefense] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showJumelageDetail, setShowJumelageDetail] = useState(false);
  const [criteresModified, setCriteresModified] = useState(false);
  const [setupTyped, setSetupTyped] = useState(false);

  // Document state (right panel)
  const [criteresFilled, setCriteresFilled] = useState(false);
  const [scanFilled, setScanFilled] = useState(false);
  const [sessionsFilled, setSessionsFilled] = useState(false);
  const [scoringFilled, setScoringFilled] = useState(false);
  const [winnerFilled, setWinnerFilled] = useState(false);
  const [extractedNotes, setExtractedNotes] = useState<string[]>([]);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stage, introTyped, criteresTyped, setupTyped, showChallengeDefense, showAlternatives, showJumelageDetail]);

  const handleExtract = (key: string) => {
    if (!extractedNotes.includes(key)) {
      setExtractedNotes((prev) => [...prev, key]);
    }
  };

  const handleReset = () => {
    setStage("intro");
    setIntroTyped(false);
    setCriteresTyped(false);
    setShowChallengeDefense(false);
    setShowAlternatives(false);
    setShowJumelageDetail(false);
    setCriteresModified(false);
    setSetupTyped(false);
    setCriteresFilled(false);
    setScanFilled(false);
    setSessionsFilled(false);
    setScoringFilled(false);
    setWinnerFilled(false);
    setExtractedNotes([]);
  };

  // =======================================
  // RIGHT PANEL — Document DocForge
  // =======================================
  const filledCount =
    (criteresFilled ? 1 : 0) +
    (scanFilled ? 1 : 0) +
    (sessionsFilled ? 1 : 0) +
    (scoringFilled ? 1 : 0) +
    (winnerFilled ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* ===== Sim Header ===== */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={() => onBack?.()} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Handshake className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-bold text-gray-800">Jumelage SMART</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-amber-500" : i < si ? "w-2 bg-amber-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className="h-1 shrink-0 bg-amber-500" />

      {/* ===== Split-screen ===== */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT — Chat 40% */}
        <div className="w-[40%] border-r flex flex-col bg-white">
          {/* Chat header */}
          <div className="shrink-0 px-3 py-2 border-b flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate">CarlOS</p>
              <p className="text-[9px] text-white/60 truncate">Jumelage SMART — Aliments Boreal</p>
            </div>
            <MessageSquare className="h-3.5 w-3.5 text-white/40" />
          </div>

          {/* Phase bar — amber */}
          <div className="shrink-0 px-3 py-1.5 bg-amber-50 border-b flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[9px] font-bold text-amber-700">{STAGE_LABELS[stage]}</span>
            <span className="text-[9px] text-gray-400 ml-auto">{si + 1}/{STAGE_ORDER.length}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {/* === INTRO === */}
            {stage === "intro" && (
              <SBubble code="CEOB" collapsed={false}>
                <TypewriterText
                  text="Le pre-rapport de visite est genere. Maintenant, au lieu d'envoyer un integrateur a l'aveugle, on active le Jumelage SMART pour trouver LE bon partenaire dans notre reseau de 130+ membres certifies Usine Bleue. Ce processus prenait 6 semaines avec des humains — nos agents le font en quelques minutes."
                  speed={10}
                  className="text-sm text-gray-700 leading-relaxed"
                  onComplete={() => setIntroTyped(true)}
                />
                {introTyped && (
                  <SBtn
                    onClick={() => setStage("criteres-thinking")}
                    icon={Send}
                    label="Generer les criteres de matching"
                  />
                )}
              </SBubble>
            )}
            {stage !== "intro" && (
              <SBubble code="CEOB" collapsed={true}>
                <span className="text-[9px] text-gray-500">Pre-rapport genere. Jumelage SMART active.</span>
              </SBubble>
            )}

            {/* === CRITERES THINKING === */}
            {stage === "criteres-thinking" && (
              <>
                <SBubble code="CEOB" collapsed={false}>
                  <div className="space-y-1.5">
                    {SIM_ACTE2.criteresThinking.map((step, i) => {
                      const Icon = step.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 text-[9px] text-blue-700">
                          <Icon className="h-3.5 w-3.5 animate-pulse" />
                          <span>{step.text}</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] text-gray-400">Analyse en cours</span>
                      <span className="animate-pulse text-gray-400">...</span>
                    </div>
                  </div>
                </SBubble>
                <AutoAdvance
                  onComplete={() => {
                    setCriteresFilled(true);
                    setStage("criteres");
                  }}
                  delay={2400}
                />
              </>
            )}

            {/* === CRITERES === */}
            {si >= STAGE_ORDER.indexOf("criteres") && (
              <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("criteres")}>
                {stage === "criteres" ? (
                  <>
                    <TypewriterText
                      text="J'ai genere 8 criteres de matching bases sur votre diagnostic. Chaque critere sera utilise pour filtrer et scorer les integrateurs du reseau. Vous pouvez modifier avant de lancer le scan."
                      speed={8}
                      className="text-sm text-gray-700 leading-relaxed"
                      onComplete={() => setCriteresTyped(true)}
                    />
                    {criteresTyped && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                        {!criteresModified && (
                          <button
                            onClick={() => {
                              setCriteresModified(true);
                              setStage("user-critere");
                            }}
                            className="text-[9px] bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer"
                          >
                            <Cog className="h-3.5 w-3.5" /> Ajouter un critere
                          </button>
                        )}
                        <button
                          onClick={() => setStage("scan")}
                          className="text-[9px] bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                        >
                          <Search className="h-3.5 w-3.5" /> Scanner le reseau
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-[9px] text-gray-500">
                    8 criteres de matching generes.{criteresModified ? " + 1 critere ajoute." : ""}
                  </span>
                )}
              </SBubble>
            )}

            {/* === USER CRITERE === */}
            {si >= STAGE_ORDER.indexOf("user-critere") && (
              <>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[85%] shadow-sm">
                    <p className="text-[9px]">{SIM_ACTE2.userCritereAjout}</p>
                  </div>
                </div>
                <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("user-critere")}>
                  <span className="text-sm text-gray-700">
                    Bon point. J'ajoute 'Experience en milieu alimentaire (HACCP, zones temp.)' a la liste des criteres. Ca va penaliser les integrateurs sans experience agroalimentaire directe.
                  </span>
                </SBubble>
                {stage === "user-critere" && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setStage("scan")}
                      className="text-[9px] bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                    >
                      <Search className="h-3.5 w-3.5" /> Lancer le scan
                    </button>
                  </div>
                )}
              </>
            )}

            {/* === SCAN === */}
            {stage === "scan" && (
              <>
                <SBubble code="CEOB" collapsed={false}>
                  <div className="space-y-1.5">
                    {[
                      { icon: Search, text: `Scan de ${SIM_ACTE2.scanSteps[0].count} membres du reseau...` },
                      { icon: Building2, text: `Filtre secteur agroalimentaire → ${SIM_ACTE2.scanSteps[1].count} candidats` },
                      { icon: Zap, text: `Expertise energie + robotique → ${SIM_ACTE2.scanSteps[2].count}` },
                      { icon: CheckCircle2, text: `Certifications requises → ${SIM_ACTE2.scanSteps[3].count}` },
                      { icon: Target, text: `Score compatibilite → ${SIM_ACTE2.scanSteps[4].count} finalistes` },
                    ].map((step, i) => {
                      const Icon = step.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 text-[9px] text-blue-700">
                          <Icon className="h-3.5 w-3.5 animate-pulse" />
                          <span>{step.text}</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] text-gray-400">Scan en cours</span>
                      <span className="animate-pulse text-gray-400">...</span>
                    </div>
                  </div>
                </SBubble>
                <AutoAdvance
                  onComplete={() => {
                    setScanFilled(true);
                    setStage("top3");
                  }}
                  delay={3000}
                />
              </>
            )}

            {/* Scan completed marker */}
            {si > STAGE_ORDER.indexOf("scan") && (
              <div className="flex items-center gap-2 ml-10 py-1.5">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-[9px] text-green-700 font-medium">Scan reseau : 130 membres  → 3 finalistes identifies</span>
              </div>
            )}

            {/* === TOP 3 === */}
            {si >= STAGE_ORDER.indexOf("top3") && (
              <>
                <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("top3")}>
                  <span className="text-sm text-gray-700">
                    Scan termine. Sur 130 membres du reseau, 3 integrateurs correspondent a votre profil. Les voici avec leur score de compatibilite initial — avant les sessions de jumelage detaillees.
                  </span>
                </SBubble>

                {stage === "top3" && (
                  <div className="space-y-3 ml-2">
                    {INTEGRATORS.map((integ, i) => (
                      <div key={integ.id} className="bg-white border rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold",
                              i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-400"
                            )}
                          >
                            #{i + 1}
                          </div>
                          <span className="text-xs font-bold text-gray-800">{integ.nom}</span>
                          <span className="text-[9px] text-gray-500 ml-auto">{integ.ville}</span>
                        </div>
                        <p className="text-[9px] text-gray-600 leading-relaxed line-clamp-2">{integ.intro}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {integ.specialites.slice(0, 3).map((s, si2) => (
                            <span key={si2} className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}

                    <SBtn
                      onClick={() => setStage("conference-setup")}
                      icon={Video}
                      label="Organiser les conferences AI"
                      color="bg-indigo-600 hover:bg-indigo-700"
                    />
                  </div>
                )}

                {/* TOP 3 compact markers */}
                {si > STAGE_ORDER.indexOf("top3") && (
                  <div className="ml-2 space-y-1">
                    {INTEGRATORS.map((integ, i) => (
                      <div key={integ.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0",
                            i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-400"
                          )}
                        >
                          #{i + 1}
                        </div>
                        <span className="text-[9px] font-medium text-gray-700">{integ.nom}</span>
                        <span className="text-[9px] text-gray-500 ml-auto">{integ.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* === CONFERENCE SETUP === */}
            {si >= STAGE_ORDER.indexOf("conference-setup") && (
              <SBubble code="CPOB" collapsed={si > STAGE_ORDER.indexOf("conference-setup")}>
                {stage === "conference-setup" ? (
                  <>
                    <TypewriterText
                      text="C'est Paco, je prends le relais pour les sessions de jumelage. J'ai contacte les 3 integrateurs et organise des creneaux d'une heure chacune en conference AI. Format : je mene l'entrevue technique, Carl vous intervenez quand vous voulez, et je couvre tous les criteres etablis."
                      speed={8}
                      className="text-sm text-gray-700 leading-relaxed"
                      onComplete={() => setSetupTyped(true)}
                    />
                    {setupTyped && (
                      <>
                        <div className="mt-3 border rounded-xl overflow-hidden">
                          <div className="bg-gray-900 px-3 py-2 flex items-center gap-2">
                            <Video className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[9px] text-gray-300 font-medium">3 sessions planifiees</span>
                          </div>
                          {[
                            { name: "Energia Solutions", rep: "Marc-Andre Dubois, VP Projets", color: "bg-amber-500" },
                            { name: "Techno-Froid Saguenay", rep: "Jean-Francois Tremblay, Dir. technique", color: "bg-gray-400" },
                            { name: "GreenTech Industries", rep: "Sophie Lavoie, Presidente", color: "bg-orange-400" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 border-t border-gray-800 bg-gray-900">
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", s.color)}>
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <span className="text-[9px] font-medium text-gray-200">{s.name}</span>
                                <span className="text-[9px] text-gray-500 ml-2">{s.rep}</span>
                              </div>
                              <span className="text-[9px] text-green-400 font-medium">Confirme</span>
                            </div>
                          ))}
                        </div>
                        <SBtn
                          onClick={() => setStage("conference-energia")}
                          icon={Video}
                          label="Rejoindre la session 1 — Energia Solutions"
                        />
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-[9px] text-gray-500">
                    Paco a organise 3 sessions de conference AI.
                  </span>
                )}
              </SBubble>
            )}

            {/* === CONFERENCE 1 — Energia Solutions === */}
            {si >= STAGE_ORDER.indexOf("conference-energia") && (
              <ConferenceSession
                sessionNum={1}
                totalSessions={3}
                supplierInfo={CONF_SUPPLIERS.energia}
                exchanges={CONF_ENERGIA_EXCHANGES}
                insights={CONF_ENERGIA_INSIGHTS}
                isActive={stage === "conference-energia"}
                onExtract={() => handleExtract("conf-energia")}
                isExtracted={extractedNotes.includes("conf-energia")}
                onNext={() => setStage("conference-techno")}
                nextLabel="Session 2 — Techno-Froid"
              />
            )}

            {/* === CONFERENCE 2 — Techno-Froid === */}
            {si >= STAGE_ORDER.indexOf("conference-techno") && (
              <ConferenceSession
                sessionNum={2}
                totalSessions={3}
                supplierInfo={CONF_SUPPLIERS.techno}
                exchanges={CONF_TECHNO_EXCHANGES}
                insights={CONF_TECHNO_INSIGHTS}
                isActive={stage === "conference-techno"}
                onExtract={() => handleExtract("conf-techno")}
                isExtracted={extractedNotes.includes("conf-techno")}
                onNext={() => setStage("conference-green")}
                nextLabel="Session 3 — GreenTech"
              />
            )}

            {/* === CONFERENCE 3 — GreenTech === */}
            {si >= STAGE_ORDER.indexOf("conference-green") && (
              <ConferenceSession
                sessionNum={3}
                totalSessions={3}
                supplierInfo={CONF_SUPPLIERS.green}
                exchanges={CONF_GREEN_EXCHANGES}
                insights={CONF_GREEN_INSIGHTS}
                isActive={stage === "conference-green"}
                onExtract={() => handleExtract("conf-green")}
                isExtracted={extractedNotes.includes("conf-green")}
                onNext={() => {
                  setSessionsFilled(true);
                  setStage("scoring");
                }}
                nextLabel="Voir le scoring final"
              />
            )}

            {/* === SCORING === */}
            {si >= STAGE_ORDER.indexOf("scoring") && (
              <>
                <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("scoring")}>
                  <span className="text-sm text-gray-700">
                    Les 5 sessions de jumelage sont terminees. Chaque candidat a repondu a mes questions sur la refrigeration CO2, la robotique, les subventions, le budget et les delais. Les resultats sont consolides dans le scoring a droite.
                  </span>
                </SBubble>

                {stage === "scoring" && (
                  <div className="space-y-3 ml-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setShowJumelageDetail(true);
                          handleExtract("sessions");
                        }}
                        disabled={showJumelageDetail}
                        className={cn(
                          "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                          showJumelageDetail
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                        )}
                      >
                        <Eye className="h-3.5 w-3.5" /> Voir les reponses detaillees
                      </button>
                      <button
                        onClick={() => {
                          setScoringFilled(true);
                          setStage("winner-intro");
                        }}
                        className="text-[9px] bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                      >
                        <Trophy className="h-3.5 w-3.5" /> Voir le gagnant
                      </button>
                    </div>

                    {/* Jumelage detail card */}
                    {showJumelageDetail && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-3">
                        {/* Q1 — CO2 */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b">
                            <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Q1</span>
                            <span className="text-sm text-gray-700 font-medium">{JUMELAGE_HIGHLIGHT_Q1.question.slice(0, 60)}...</span>
                          </div>
                          <div className="p-3 space-y-2">
                            {[JUMELAGE_HIGHLIGHT_Q1.energia, JUMELAGE_HIGHLIGHT_Q1.techno, JUMELAGE_HIGHLIGHT_Q1.green].map((r, i) => {
                              const scoreColor = r.score >= 80 ? "text-green-600" : r.score >= 60 ? "text-amber-600" : "text-red-600";
                              return (
                                <div key={i} className="flex items-start gap-2">
                                  <span className={cn("text-[9px] font-bold shrink-0 w-8 text-center", scoreColor)}>{r.score}%</span>
                                  <div className="flex-1">
                                    <span className="text-[9px] font-bold text-gray-500">{r.integrateur}</span>
                                    <p className="text-[9px] text-gray-600 line-clamp-2">{r.reponse}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Q3 — Subventions */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b">
                            <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Q3</span>
                            <span className="text-sm text-gray-700 font-medium">{JUMELAGE_HIGHLIGHT_Q3.question.slice(0, 60)}...</span>
                          </div>
                          <div className="p-3 space-y-2">
                            {[JUMELAGE_HIGHLIGHT_Q3.energia, JUMELAGE_HIGHLIGHT_Q3.techno, JUMELAGE_HIGHLIGHT_Q3.green].map((r, i) => {
                              const scoreColor = r.score >= 80 ? "text-green-600" : r.score >= 60 ? "text-amber-600" : "text-red-600";
                              return (
                                <div key={i} className="flex items-start gap-2">
                                  <span className={cn("text-[9px] font-bold shrink-0 w-8 text-center", scoreColor)}>{r.score}%</span>
                                  <div className="flex-1">
                                    <span className="text-[9px] font-bold text-gray-500">{r.integrateur}</span>
                                    <p className="text-[9px] text-gray-600 line-clamp-2">{r.reponse}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleExtract("q1")}
                            className={cn(
                              "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                              extractedNotes.includes("q1")
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                            )}
                          >
                            <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("q1") ? "Extrait" : "Extraire les reponses"}
                          </button>
                          <button
                            onClick={() => {
                              setScoringFilled(true);
                              setStage("winner-intro");
                            }}
                            className="text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-600 text-white hover:bg-amber-700 transition-all"
                          >
                            <Trophy className="h-3.5 w-3.5" /> Voir le gagnant
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scoring compact marker */}
                {si > STAGE_ORDER.indexOf("scoring") && (
                  <div className="flex items-center gap-2 ml-10 py-1.5">
                    <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <span className="text-[9px] text-amber-700 font-medium">
                      Scoring : {INTEGRATORS.map((integ) => `${integ.nom.split(" ")[0]} ${integ.score}%`).join(" / ")}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* === WINNER INTRO === */}
            {si >= STAGE_ORDER.indexOf("winner-intro") && (
              <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("winner-intro")}>
                {stage === "winner-intro" ? (
                  <TypewriterText
                    text={SIM_ACTE2.ceoWinnerIntro}
                    speed={8}
                    className="text-sm text-gray-700 leading-relaxed"
                    onComplete={() => {
                      setWinnerFilled(true);
                      setStage("winner");
                    }}
                  />
                ) : (
                  <span className="text-[9px] text-gray-500">{SIM_ACTE2.ceoWinnerIntro.slice(0, 80)}...</span>
                )}
              </SBubble>
            )}

            {/* === WINNER + CHALLENGES === */}
            {si >= STAGE_ORDER.indexOf("winner") && (
              <>
                <SBubble code="CEOB" collapsed={false}>
                  <span className="text-sm text-gray-700 leading-relaxed">{SIM_ACTE2.winnerMessage}</span>
                </SBubble>

                {stage === "winner" && (
                  <div className="space-y-3 ml-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setShowChallengeDefense(true)}
                        disabled={showChallengeDefense}
                        className={cn(
                          "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                          showChallengeDefense
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        )}
                      >
                        <Target className="h-3.5 w-3.5" /> Challenger le choix
                      </button>
                      <button
                        onClick={() => setShowAlternatives(true)}
                        disabled={showAlternatives}
                        className={cn(
                          "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                          showAlternatives
                            ? "bg-gray-200 text-gray-700 border border-gray-300"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                        )}
                      >
                        <Eye className="h-3.5 w-3.5" /> Pourquoi pas les 2 autres?
                      </button>
                      <button
                        onClick={() => setStage("transition")}
                        className="text-[9px] bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                      >
                        <ArrowRight className="h-3.5 w-3.5" /> Accepter et continuer
                      </button>
                    </div>

                    {/* Challenge defense */}
                    {showChallengeDefense && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                        <SBubble code="CEOB" collapsed={false}>
                          <div className="text-[9px] text-blue-600 mb-1 font-medium">Defense de la selection</div>
                          <TypewriterText
                            text={CHALLENGE_DEFENSE}
                            speed={5}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                        </SBubble>
                        <div className="flex items-center gap-2 flex-wrap ml-11">
                          <button
                            onClick={() => handleExtract("defense")}
                            className={cn(
                              "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                              extractedNotes.includes("defense")
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                            )}
                          >
                            <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("defense") ? "Extrait" : "Extraire l'argumentaire"}
                          </button>
                          <button
                            onClick={() => setStage("transition")}
                            className="text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-600 text-white hover:bg-amber-700 transition-all"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accepter la recommandation
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Alternatives analysis */}
                    {showAlternatives && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                        <SBubble code="CEOB" collapsed={false}>
                          <div className="text-[9px] text-gray-600 mb-1 font-medium">Analyse comparative</div>
                          <TypewriterText
                            text={ALTERNATIVE_ANALYSIS}
                            speed={5}
                            className="text-sm text-gray-700 leading-relaxed"
                          />
                        </SBubble>

                        {/* 3-way comparison mini table */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden ml-11">
                          <div className="grid grid-cols-3 divide-x divide-gray-200">
                            {INTEGRATORS.map((integ, i) => {
                              const isWinner = i === 0;
                              return (
                                <div key={integ.id} className={cn("p-2.5 text-center", isWinner && "bg-amber-50/50")}>
                                  <div
                                    className={cn(
                                      "text-lg font-bold mb-1",
                                      integ.score >= 90 ? "text-green-600" : integ.score >= 80 ? "text-amber-600" : "text-gray-500"
                                    )}
                                  >
                                    {integ.score}%
                                  </div>
                                  <div className="text-[9px] font-bold text-gray-800 truncate">{integ.nom.split(" ")[0]}</div>
                                  {isWinner && (
                                    <div className="mt-1 bg-amber-100 text-amber-800 text-[9px] font-bold rounded px-2 py-0.5 inline-flex items-center gap-1">
                                      <Trophy className="h-2.5 w-2.5" /> Selectionne
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap ml-11">
                          <button
                            onClick={() => handleExtract("comparaison")}
                            className={cn(
                              "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                              extractedNotes.includes("comparaison")
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                            )}
                          >
                            <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("comparaison") ? "Comparaison notee" : "Noter la comparaison"}
                          </button>
                          <button
                            onClick={() => setStage("transition")}
                            className="text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-600 text-white hover:bg-amber-700 transition-all"
                          >
                            <ArrowRight className="h-3.5 w-3.5" /> Confirmer Energia
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* === TRANSITION === */}
            {stage === "transition" && (
              <>
                <SBubble code="CEOB" collapsed={false}>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Excellent choix. Energia Solutions est selectionne comme integrateur. Le matching est documente — on passe maintenant a la construction du Cahier de Projet pour structurer la collaboration.
                  </span>
                </SBubble>
                <div className="space-y-3 ml-2">
                  <button
                    onClick={handleReset}
                    className="text-[9px] bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer border border-gray-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Recommencer
                  </button>
                </div>
              </>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Message input bar */}
          <div className="shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-[9px] text-gray-400">Ecrivez un message...</div>
            <button className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"><Mic className="h-3.5 w-3.5" /></button>
            <button className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* RIGHT — Content 60% */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar 6 sections */}
          <div className="h-12 px-2 shrink-0 flex items-center" style={{ backgroundColor: UB_BLUE }}>
            <div className="flex-1 flex items-center gap-0.5">
              {[
                { id: "home", icon: LayoutDashboard, label: "Accueil" },
                { id: "dept", icon: Building2, label: "Mon Departement" },
                { id: "salles", icon: Users, label: "Mes Salles" },
                { id: "equipe", icon: Brain, label: "Mon Equipe" },
                { id: "reseau", icon: Globe, label: "Mon Reseau" },
                { id: "admin", icon: Shield, label: "Admin" },
              ].map(nav => (
                <button key={nav.id} className={cn(
                  "h-8 gap-1 px-2 text-[9px] rounded-md flex items-center transition-all",
                  nav.id === "reseau" ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
            {SUB_TABS.map((t) => (
              <button key={t.id} className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5",
                t.active ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}>
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>

          {/* Active bots bar */}
          <div className="shrink-0 px-4 py-2 bg-white border-b flex items-center gap-2">
            <BotAvatar code="CEOB" size="sm" />
            <BotAvatar code="CPOB" size="sm" />
            <span className="text-[9px] text-gray-400 ml-auto">Bots actifs</span>
          </div>

          {/* Right panel content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-white space-y-3">
            {/* Document header */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-amber-700" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Jumelage SMART</h3>
                    <p className="text-[9px] text-amber-700/70">Les sections se remplissent au fil du matching</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-amber-200/50 rounded-full h-1.5">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${filledCount * 20}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-amber-800">{filledCount}/5</span>
                </div>
              </div>
            </div>

            {/* Section 1 — Criteres de Matching */}
            <DocSectionCard title="1. Criteres de Matching" icon={Filter} filled={criteresFilled}>
              {criteresFilled && (
                <div className="space-y-1.5">
                  {SIM_ACTE2.criteres.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg px-2.5 py-1.5 bg-gray-50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[9px] text-gray-700">{c}</span>
                    </div>
                  ))}
                  {criteresModified && (
                    <div className="flex items-start gap-2 rounded-lg px-2.5 py-1.5 bg-amber-50 border border-amber-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-[9px] text-amber-800 font-medium">Experience en milieu alimentaire (HACCP, zones temp.) — Ajoute par Carl</span>
                    </div>
                  )}
                </div>
              )}
            </DocSectionCard>

            {/* Section 2 — Scan Reseau */}
            <DocSectionCard title="2. Scan Reseau" icon={Search} filled={scanFilled}>
              {scanFilled && (
                <div className="space-y-2">
                  {SIM_ACTE2.scanSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] text-gray-700">{step.label}</span>
                          <span className="text-[9px] font-bold text-gray-800">{step.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.max(5, (step.count / 130) * 100)}%` }}
                          />
                        </div>
                      </div>
                      {i < SIM_ACTE2.scanSteps.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      )}
                    </div>
                  ))}
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                    <p className="text-[9px] text-green-700 font-medium">3 integrateurs identifies sur 130 membres scannes</p>
                  </div>
                </div>
              )}
            </DocSectionCard>

            {/* Section 3 — Conferences AI */}
            <DocSectionCard title="3. Conferences AI" icon={Video} filled={sessionsFilled || si >= STAGE_ORDER.indexOf("conference-energia")}>
              {(sessionsFilled || si >= STAGE_ORDER.indexOf("conference-energia")) && (
                <div className="space-y-3">
                  {/* Mini cockpit simulation */}
                  {si >= STAGE_ORDER.indexOf("conference-energia") && si <= STAGE_ORDER.indexOf("conference-green") && (
                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
                      <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-800">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] text-gray-400 font-medium">COCKPIT — Conference en cours</span>
                      </div>
                      <div className="p-2 grid grid-cols-3 gap-1.5">
                        <div className="bg-gray-800 rounded-lg p-2 text-center">
                          <BotAvatar code="CPOB" size="sm" />
                          <p className="text-[9px] text-gray-300 mt-1">Paco</p>
                          <p className="text-[9px] text-gray-500">Animateur</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2 text-center">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold mx-auto">C</div>
                          <p className="text-[9px] text-gray-300 mt-1">Carl</p>
                          <p className="text-[9px] text-gray-500">Client</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2 text-center">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold mx-auto",
                              stage === "conference-energia" ? "bg-amber-500" : stage === "conference-techno" ? "bg-gray-400" : "bg-orange-400"
                            )}
                          >
                            {stage === "conference-energia" ? "E" : stage === "conference-techno" ? "T" : "G"}
                          </div>
                          <p className="text-[9px] text-gray-300 mt-1">
                            {stage === "conference-energia" ? "Marc-Andre" : stage === "conference-techno" ? "Jean-Francois" : "Sophie"}
                          </p>
                          <p className="text-[9px] text-gray-500">Fournisseur</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conference 1 notes */}
                  {si > STAGE_ORDER.indexOf("conference-energia") && (
                    <div className="border rounded-lg p-2.5 bg-amber-50/50">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">1</div>
                        <span className="text-[9px] font-bold text-gray-800">Energia Solutions</span>
                        <span className="text-[9px] text-green-600 ml-auto font-medium">Terminee</span>
                      </div>
                      {CONF_ENERGIA_INSIGHTS.map((ins, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-[9px] text-gray-700">{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conference 2 notes */}
                  {si > STAGE_ORDER.indexOf("conference-techno") && (
                    <div className="border rounded-lg p-2.5 bg-gray-50">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[9px] text-white font-bold shrink-0">2</div>
                        <span className="text-[9px] font-bold text-gray-800">Techno-Froid Saguenay</span>
                        <span className="text-[9px] text-green-600 ml-auto font-medium">Terminee</span>
                      </div>
                      {CONF_TECHNO_INSIGHTS.map((ins, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-[9px] text-gray-700">{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conference 3 notes */}
                  {si > STAGE_ORDER.indexOf("conference-green") && (
                    <div className="border rounded-lg p-2.5 bg-orange-50/50">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-[9px] text-white font-bold shrink-0">3</div>
                        <span className="text-[9px] font-bold text-gray-800">GreenTech Industries</span>
                        <span className="text-[9px] text-green-600 ml-auto font-medium">Terminee</span>
                      </div>
                      {CONF_GREEN_INSIGHTS.map((ins, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-[9px] text-gray-700">{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* In-progress indicator */}
                  {!sessionsFilled && si >= STAGE_ORDER.indexOf("conference-energia") && (
                    <div className="flex items-center gap-2 text-[9px] text-amber-600">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Conferences en cours —{" "}
                      {stage === "conference-energia" ? "1/3" : stage === "conference-techno" ? "2/3" : "3/3"}
                    </div>
                  )}

                  {/* Extracted notes */}
                  {extractedNotes.filter((n) => n.startsWith("conf-")).length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                      <p className="text-[9px] font-bold text-green-800 mb-1 flex items-center gap-1">
                        <Pin className="h-3.5 w-3.5" /> Points cles extraits ({extractedNotes.filter((n) => n.startsWith("conf-")).length}/3)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DocSectionCard>

            {/* Section 4 — Scoring Comparatif */}
            <DocSectionCard title="4. Scoring Comparatif" icon={BarChart3} filled={scoringFilled}>
              {scoringFilled && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-2 py-1.5 text-gray-500 font-medium">Critere</th>
                        <th className="text-center px-1 py-1.5 text-gray-500 font-medium">Poids</th>
                        {SIM_ACTE2.scoringResults.map((r, i) => (
                          <th key={i} className="text-center px-1 py-1.5 text-gray-700 font-bold">
                            <span className="truncate block max-w-[60px]">{r.nom.split(" ")[0]}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIM_ACTE2.scoringCategories.map((cat, ci) => (
                        <tr key={ci} className="border-b border-gray-100">
                          <td className="px-2 py-1 text-gray-700">{cat.label}</td>
                          <td className="text-center px-1 py-1 text-gray-400">{cat.weight}</td>
                          {SIM_ACTE2.scoringResults.map((r, ri) => {
                            const score = r.scores[ci];
                            const color = score >= 90 ? "text-green-600 font-bold" : score >= 70 ? "text-amber-600" : "text-red-500";
                            return (
                              <td key={ri} className={cn("text-center px-1 py-1", color)}>
                                {score}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td className="px-2 py-1.5 text-gray-800">Total</td>
                        <td className="text-center px-1 py-1.5 text-gray-400">100%</td>
                        {SIM_ACTE2.scoringResults.map((r, ri) => {
                          const color = r.total >= 90 ? "text-green-700" : r.total >= 70 ? "text-amber-700" : "text-gray-600";
                          return (
                            <td key={ri} className={cn("text-center px-1 py-1.5", color)}>
                              {r.total}%
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </DocSectionCard>

            {/* Section 5 — Recommandation Finale */}
            <DocSectionCard title="5. Recommandation Finale" icon={Trophy} filled={winnerFilled}>
              {winnerFilled && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold text-gray-800">{INTEGRATORS[0].nom}</h4>
                      <p className="text-[9px] text-gray-500">{INTEGRATORS[0].ville} — {INTEGRATORS[0].tailleEquipe} personnes — {INTEGRATORS[0].experience}</p>
                    </div>
                    <div className="ml-auto text-lg font-bold text-green-600">{INTEGRATORS[0].score}%</div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                    <p className="text-[9px] font-bold text-green-800 mb-1">Pourquoi ce choix</p>
                    <p className="text-[9px] text-green-700">{INTEGRATORS[0].force}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {INTEGRATORS[0].certifications.map((c, i) => (
                      <span key={i} className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5" /> {c}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                      <div className="text-[9px] font-bold text-gray-800">{INTEGRATORS[0].projetsSimil}</div>
                      <div className="text-[9px] text-gray-500">Projets similaires</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                      <div className="text-[9px] font-bold text-green-600">98%</div>
                      <div className="text-[9px] text-gray-500">Approbation HQ</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                      <div className="text-[9px] font-bold text-amber-600">20 sem.</div>
                      <div className="text-[9px] text-gray-500">Delai livraison</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="text-[9px] bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-50 font-medium cursor-pointer">
                      <Download className="h-3.5 w-3.5" /> Exporter le matching
                    </button>
                  </div>
                </div>
              )}
            </DocSectionCard>
          </div>
        </div>
      </div>
    </div>
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
        <span className={cn("text-[9px] font-medium", filled ? "text-gray-700" : "text-gray-400")}>{title}</span>
        {!filled && <span className="text-[9px] text-gray-400 ml-auto italic">En attente...</span>}
      </div>
      {filled && children && <div className="p-3">{children}</div>}
    </div>
  );
}

// ========== SBUBBLE ==========

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

// ========== SBTN ==========

function SBtn({ onClick, icon: Icon, label, color }: { onClick: () => void; icon: React.ElementType; label: string; color?: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={onClick}
        className={cn(
          "text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow",
          color || "bg-amber-600 hover:bg-amber-700"
        )}
      >
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}

// ========== AUTO ADVANCE ==========

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  const stableOnComplete = useCallback(onComplete, []);
  useEffect(() => {
    const t = setTimeout(stableOnComplete, delay);
    return () => clearTimeout(t);
  }, [stableOnComplete, delay]);
  return null;
}

// ========== CONFERENCE SESSION COMPONENT ==========

function ConferenceSession({
  sessionNum,
  totalSessions,
  supplierInfo,
  exchanges,
  insights,
  isActive,
  onExtract,
  isExtracted,
  onNext,
  nextLabel,
}: {
  sessionNum: number;
  totalSessions: number;
  supplierInfo: { name: string; company: string; initial: string; color: string };
  exchanges: readonly { from: "CPOB" | "supplier" | "user"; text: string }[];
  insights: readonly string[];
  isActive: boolean;
  onExtract: () => void;
  isExtracted: boolean;
  onNext: () => void;
  nextLabel: string;
}) {
  // Compact marker when conference is done
  if (!isActive) {
    return (
      <div className="flex items-center gap-2 ml-10 py-1.5">
        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        </div>
        <span className="text-[9px] text-green-700 font-medium">
          Session {sessionNum} — {supplierInfo.company} terminee ({insights.length} points cles)
        </span>
      </div>
    );
  }

  // Active conference — full dialogue
  return (
    <div className="space-y-3">
      {/* Conference bar */}
      <div className="bg-gray-900 rounded-xl px-4 py-2.5 flex items-center gap-3 mx-2">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] text-gray-300 font-medium">
          Conference AI — Session {sessionNum}/{totalSessions}
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1">
            <BotAvatar code="CPOB" size="sm" />
            <span className="text-[9px] text-gray-400">Paco</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">C</div>
            <span className="text-[9px] text-gray-400">Carl</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold", supplierInfo.color)}>
              {supplierInfo.initial}
            </div>
            <span className="text-[9px] text-gray-400">{supplierInfo.company.split(" ")[0]}</span>
          </div>
        </div>
      </div>

      {/* Exchange bubbles */}
      {exchanges.map((ex, i) => {
        if (ex.from === "CPOB") {
          return (
            <SBubble key={i} code="CPOB" collapsed={false}>
              <span className="text-sm text-gray-700 leading-relaxed">{ex.text}</span>
            </SBubble>
          );
        }
        if (ex.from === "user") {
          return (
            <div key={i} className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 max-w-[85%] shadow-sm">
                <p className="text-[9px]">{ex.text}</p>
              </div>
            </div>
          );
        }
        // Supplier bubble — distinct emerald style
        return (
          <div key={i} className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl rounded-tl-none px-3 py-2.5 shadow-sm flex-1 border-l-2 border-l-emerald-400">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-emerald-800">{supplierInfo.name}</span>
                <span className="text-[9px] text-emerald-600">{supplierInfo.company}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{ex.text}</p>
            </div>
          </div>
        );
      })}

      {/* Key insights card */}
      <div className="ml-2 space-y-2">
        <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/50">
          <p className="text-[9px] font-bold text-amber-800 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Points cles — Session {sessionNum}
          </p>
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[9px] text-amber-900">{insight}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExtract}
            disabled={isExtracted}
            className={cn(
              "text-[9px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
              isExtracted
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            )}
          >
            <Pin className="h-3.5 w-3.5" /> {isExtracted ? "Extrait" : "Extraire les points cles"}
          </button>
          <button
            onClick={onNext}
            className="text-[9px] bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
          >
            <ArrowRight className="h-3.5 w-3.5" /> {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
