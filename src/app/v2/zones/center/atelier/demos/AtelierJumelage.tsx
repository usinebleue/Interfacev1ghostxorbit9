/**
 * AtelierJumelage.tsx — Atelier split-screen "Jumelage SMART" V2
 * GAUCHE: Chat riche avec actions inline (scan, sessions, challenge, defense)
 * DROITE: Document jumelage qui se batit progressivement (5 sections) — pattern DocForge
 * Pattern: discussion evolue → utilisateur valide/challenge → sections se remplissent
 * Data: SIM_ACTE2 + INTEGRATORS (cahier-smart-data.ts)
 * Sprint B — Atelier Simulations — Flow Usine Bleue
 */

"use client";

import { useState } from "react";
import {
  Handshake,
  CheckCircle2,
  Search,
  Filter,
  Trophy,
  Star,
  ArrowRight,
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
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotBubble,
  UserBubble,
  BotAvatar,
} from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";
import { SIM_ACTE2, INTEGRATORS } from "../../cahier-smart-data";
import { AtelierLayout } from "../AtelierLayout";

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

const STAGE_INDEX: Record<Stage, number> = {
  intro: 0,
  "criteres-thinking": 1,
  criteres: 2,
  "user-critere": 3,
  scan: 4,
  top3: 5,
  "conference-setup": 6,
  "conference-energia": 7,
  "conference-techno": 8,
  "conference-green": 9,
  scoring: 10,
  "winner-intro": 11,
  winner: 12,
  transition: 13,
};

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
  energia: { name: "Marc-André Dubois", company: "Energia Solutions", initial: "E", color: "bg-amber-500" },
  techno: { name: "Jean-François Tremblay", company: "Techno-Froid Saguenay", initial: "T", color: "bg-gray-400" },
  green: { name: "Sophie Lavoie", company: "GreenTech Industries", initial: "G", color: "bg-orange-400" },
} as const;

const CONF_ENERGIA_EXCHANGES = [
  { from: "CPOB" as const, text: "Bienvenue Marc-André. On commence par la réfrigération CO2 — c'est le coeur du projet Boréal. Expliquez-nous votre approche pour une usine de transformation de cette taille." },
  { from: "supplier" as const, text: "Merci Paco. On a livré 12 systèmes CO2 transcritiques en 3 ans, dont 4 en agroalimentaire. Design modulaire, monitoring IoT, et récupération de chaleur intégrée — 35% d'économie sur le gaz naturel en hiver." },
  { from: "user" as const, text: "Vos systèmes sont compatibles HACCP zone 3 pour nos produits surgelés?" },
  { from: "supplier" as const, text: "4 de nos installations sont certifiées HACCP, dont 2 en zone 3 surgelé. Échangeurs inox 316L, détection de fuites CO2, backup ammoniaque automatique. On peut fournir les rapports d'audit Qualtech." },
  { from: "CPOB" as const, text: "Parfait. Côté robotique — 8 installations de cobots dans votre dossier. Quelle configuration pour la palettisation Boréal?" },
  { from: "supplier" as const, text: "2 cobots Universal Robots UR10e sur rails linéaires, 12 cycles/minute, gripper adaptatif pour 6 formats de caisse. Projet identique chez Aliments Fontaine — même volume, mêmes contraintes. Installation 3 semaines, formation incluse." },
];

const CONF_ENERGIA_INSIGHTS = [
  "12 systèmes CO2 livrés (4 agroalimentaire, 2 HACCP zone 3)",
  "Récupération chaleur = -35% gaz naturel",
  "Cobots UR10e — projet identique chez Aliments Fontaine",
  "Délai complet : 20 semaines intégrées",
];

const CONF_TECHNO_EXCHANGES = [
  { from: "CPOB" as const, text: "Jean-François, la robotique n'est pas votre spécialité principale — comment vous gérez ce volet pour un projet intégré comme Boréal?" },
  { from: "supplier" as const, text: "On est des experts en froid, pas en robotique. On travaille avec RoboPack Québec depuis 2 ans — ils gèrent les cobots, nous la réfrigération. Deux équipes sur le plancher en parallèle." },
  { from: "CPOB" as const, text: "Ça pose un risque de coordination. Et les subventions — votre track record sur les dossiers HQ et STIQ?" },
  { from: "supplier" as const, text: "3 dossiers HQ en 2025, taux 100% — mais juste la portion énergie. Un dossier intégré énergie + robotique, on n'a jamais monté ça. Il faudrait un consultant externe." },
  { from: "user" as const, text: "Si vous devez sous-traiter la robotique ET les subventions intégrées, qui coordonne le projet au final?" },
  { from: "supplier" as const, text: "Honnêtement, ça serait nous le maître d'oeuvre, mais avec 2 sous-traitants à coordonner... je comprends que ça peut inquiéter. On l'a fait une fois, ça a pris 28 semaines au lieu de 20." },
];

const CONF_TECHNO_INSIGHTS = [
  "Zéro capacité robotique interne — sous-traitance RoboPack",
  "Risque coordination 2 équipes simultanées sur plancher",
  "Subventions : seulement portion énergie (jamais intégré)",
  "Délai réaliste : 28 semaines (vs 20 pour Energia)",
];

const CONF_GREEN_EXCHANGES = [
  { from: "CPOB" as const, text: "Sophie, score IoT impressionnant — 95%. Mais parlons réfrigération CO2 : votre dernière installation date de quand exactement?" },
  { from: "supplier" as const, text: "Mai 2023 chez Produits Marins Côte-Nord. Depuis, on s'est concentrés sur l'IoT et l'automatisation. On peut le faire, mais c'est pas notre plus grande force en ce moment." },
  { from: "user" as const, text: "Et les subventions? On vise 592K$ en subventions combinées HQ et STIQ. Votre track record?" },
  { from: "supplier" as const, text: "2 dossiers HQ l'an dernier — un approuvé, un refusé pour documentation technique insuffisante. Taux de 50%. Je préfère être transparente plutôt que de vous promettre des chiffres irréalistes." },
  { from: "CPOB" as const, text: "La transparence, c'est apprécié. Dernière question — délai de livraison pour un projet de cette envergure?" },
  { from: "supplier" as const, text: "24 semaines minimum. On est plus lents que d'autres parce qu'on intègre beaucoup de capteurs IoT, mais le suivi post-installation est compris pour 2 ans." },
];

const CONF_GREEN_INSIGHTS = [
  "Dernière installation CO2 : mai 2023 (quasi 3 ans)",
  "Force : IoT (95%) + robotique (85%) + suivi 2 ans inclus",
  "Subventions : taux 50% (1 approuvé, 1 refusé)",
  "Délai : 24 semaines + transparence appréciée",
];

// ========== MAIN COMPONENT ==========

export function AtelierJumelage({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
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

  // ═══════════════════════════════════════
  // CHAT CONTENT (Left Panel) — Rich interactions
  // ═══════════════════════════════════════
  const chatContent = (
    <>
      {/* CEO intro — transition from diagnostic */}
      {stage === "intro" && (
        <BotBubble code="CEOB" text="" phaseLabel="Connecter">
          <TypewriterText
            text="Le pre-rapport de visite est genere. Maintenant, au lieu d'envoyer un integrateur a l'aveugle, on active le Jumelage SMART pour trouver LE bon partenaire dans notre reseau de 130+ membres certifies Usine Bleue. Ce processus prenait 6 semaines avec des humains — nos agents le font en quelques minutes."
            speed={10}
            className="text-sm text-gray-800"
            onComplete={() => setIntroTyped(true)}
          />
          {introTyped && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <button
                onClick={() => setStage("criteres-thinking")}
                className="text-xs bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Generer les criteres de matching
              </button>
            </div>
          )}
        </BotBubble>
      )}
      {stage !== "intro" && (
        <BotBubble
          code="CEOB"
          text="Le pre-rapport est genere. On active le Jumelage SMART pour trouver LE bon partenaire dans notre reseau de 130+ membres certifies."
          phaseLabel="Connecter"
          time="14:42"
        />
      )}

      {/* Criteres thinking */}
      {stage === "criteres-thinking" && (
        <ThinkingAnimation
          steps={SIM_ACTE2.criteresThinking}
          botEmoji=""
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => {
            setCriteresFilled(true);
            setStage("criteres");
          }}
        />
      )}

      {/* Criteres card + actions */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["criteres"] && (
        <BotBubble code="CEOB" text="" phaseLabel="Rechercher" time="14:43">
          {stage === "criteres" ? (
            <>
              <TypewriterText
                text="J'ai genere 8 criteres de matching bases sur votre diagnostic. Chaque critere sera utilise pour filtrer et scorer les integrateurs du reseau. Vous pouvez modifier avant de lancer le scan."
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => setCriteresTyped(true)}
              />
              {criteresTyped && (
                <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-2 flex-wrap">
                  {!criteresModified && (
                    <button
                      onClick={() => {
                        setCriteresModified(true);
                        setStage("user-critere");
                      }}
                      className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer"
                    >
                      <Cog className="h-3.5 w-3.5" /> Ajouter un critere
                    </button>
                  )}
                  <button
                    onClick={() => setStage("scan")}
                    className="text-xs bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" /> Scanner le reseau
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-800">
              J'ai genere 8 criteres de matching bases sur votre diagnostic.{criteresModified ? " + 1 critere ajoute par vous." : ""}
            </p>
          )}
        </BotBubble>
      )}

      {/* User criteria modification */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["user-critere"] && (
        <>
          <UserBubble text={SIM_ACTE2.userCritereAjout} time="14:44" />
          <BotBubble
            code="CEOB"
            text="Bon point. J'ajoute 'Experience en milieu alimentaire (HACCP, zones temp.)' a la liste des criteres. Ca va penaliser les integrateurs sans experience agroalimentaire directe."
            phaseLabel="Rechercher"
            time="14:44"
          />
          {stage === "user-critere" && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage("scan")}
                className="text-xs bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" /> Lancer le scan
              </button>
            </div>
          )}
        </>
      )}

      {/* Scan animation */}
      {stage === "scan" && (
        <ThinkingAnimation
          steps={[
            { icon: Search, text: `Scan de ${SIM_ACTE2.scanSteps[0].count} membres du reseau...` },
            { icon: Building2, text: `Filtre secteur agroalimentaire → ${SIM_ACTE2.scanSteps[1].count} candidats` },
            { icon: Zap, text: `Expertise energie + robotique → ${SIM_ACTE2.scanSteps[2].count}` },
            { icon: CheckCircle2, text: `Certifications requises → ${SIM_ACTE2.scanSteps[3].count}` },
            { icon: Target, text: `Score compatibilite → ${SIM_ACTE2.scanSteps[4].count} finalistes` },
          ]}
          botEmoji=""
          botCode="CEOB"
          botName="CarlOS"
          onComplete={() => {
            setScanFilled(true);
            setStage("top3");
          }}
        />
      )}

      {/* Scan step marker (persists after scan completes) */}
      {STAGE_INDEX[stage] > STAGE_INDEX["scan"] && (
        <div className="flex items-center gap-2 ml-10 py-1.5">
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          </div>
          <span className="text-[11px] text-green-700 font-medium">Scan reseau : 130 membres → 3 finalistes identifies</span>
        </div>
      )}

      {/* TOP 3 announcement */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["top3"] && (
        <>
          <BotBubble
            code="CEOB"
            text="Scan termine. Sur 130 membres du reseau, 3 integrateurs correspondent a votre profil. Les voici avec leur score de compatibilite initial — avant les sessions de jumelage detaillees."
            phaseLabel="Exposer"
            time="14:45"
          />

          {stage === "top3" && (
            <div className="space-y-3 ml-2">
              {/* Mini integrator cards in chat */}
              {INTEGRATORS.map((integ, i) => (
                <div
                  key={integ.id}
                  className="bg-white border rounded-xl px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold",
                      i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-400",
                    )}>
                      #{i + 1}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{integ.nom}</span>
                    <span className="text-[9px] text-gray-500 ml-auto">{integ.ville}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{integ.intro}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {integ.specialites.slice(0, 3).map((s, si) => (
                      <span key={si} className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setStage("conference-setup")}
                  className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-700 font-medium cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5" /> Organiser les conférences AI
                </button>
              </div>
            </div>
          )}

          {/* TOP 3 compact marker (persists after advancing past top3) */}
          {STAGE_INDEX[stage] > STAGE_INDEX["top3"] && (
            <div className="ml-2 space-y-1">
              {INTEGRATORS.map((integ, i) => (
                <div key={integ.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0",
                    i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-400",
                  )}>
                    #{i + 1}
                  </div>
                  <span className="text-[11px] font-medium text-gray-700">{integ.nom}</span>
                  <span className="text-[9px] text-gray-500 ml-auto">{integ.score}%</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Conference AI — Organisation des sessions */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["conference-setup"] && (
        <BotBubble code="CPOB" text="" phaseLabel="Organiser" time="14:46">
          {stage === "conference-setup" ? (
            <>
              <TypewriterText
                text="C'est Paco, je prends le relais pour les sessions de jumelage. J'ai contacté les 3 intégrateurs et organisé des créneaux d'une heure chacune en conférence AI. Format : je mène l'entrevue technique, Carl vous intervenez quand vous voulez, et je couvre tous les critères établis."
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => setSetupTyped(true)}
              />
              {setupTyped && (
                <>
                  <div className="mt-3 border rounded-xl overflow-hidden">
                    <div className="bg-gray-900 px-3 py-2 flex items-center gap-2">
                      <Video className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-[11px] text-gray-300 font-medium">3 sessions planifiées</span>
                    </div>
                    {[
                      { name: "Energia Solutions", rep: "Marc-André Dubois, VP Projets", color: "bg-amber-500" },
                      { name: "Techno-Froid Saguenay", rep: "Jean-François Tremblay, Dir. technique", color: "bg-gray-400" },
                      { name: "GreenTech Industries", rep: "Sophie Lavoie, Présidente", color: "bg-orange-400" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 border-t border-gray-800 bg-gray-900">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", s.color)}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-200">{s.name}</span>
                          <span className="text-[9px] text-gray-500 ml-2">{s.rep}</span>
                        </div>
                        <span className="text-[9px] text-green-400 font-medium">Confirmé</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setStage("conference-energia")}
                      className="text-xs bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                    >
                      <Video className="h-3.5 w-3.5" /> Rejoindre la session 1 — Energia Solutions
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-800">Paco a organisé 3 sessions de conférence AI avec les intégrateurs sélectionnés.</p>
          )}
        </BotBubble>
      )}

      {/* Conference 1 — Energia Solutions */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["conference-energia"] && (
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

      {/* Conference 2 — Techno-Froid Saguenay */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["conference-techno"] && (
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

      {/* Conference 3 — GreenTech Industries */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["conference-green"] && (
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

      {/* Scoring results */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["scoring"] && (
        <>
          <BotBubble
            code="CEOB"
            text="Les 5 sessions de jumelage sont terminees. Chaque candidat a repondu a mes questions sur la refrigeration CO2, la robotique, les subventions, le budget et les delais. Les resultats sont consolides dans le scoring a droite."
            phaseLabel="Exposer"
            time="14:47"
          />

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
                    "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
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
                  className="text-xs bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
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
                      <span className="text-xs text-gray-700 font-medium">{JUMELAGE_HIGHLIGHT_Q1.question.slice(0, 60)}...</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {[JUMELAGE_HIGHLIGHT_Q1.energia, JUMELAGE_HIGHLIGHT_Q1.techno, JUMELAGE_HIGHLIGHT_Q1.green].map((r, i) => {
                        const scoreColor = r.score >= 80 ? "text-green-600" : r.score >= 60 ? "text-amber-600" : "text-red-600";
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <span className={cn("text-xs font-bold shrink-0 w-8 text-center", scoreColor)}>{r.score}%</span>
                            <div className="flex-1">
                              <span className="text-[9px] font-bold text-gray-500">{r.integrateur}</span>
                              <p className="text-[11px] text-gray-600 line-clamp-2">{r.reponse}</p>
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
                      <span className="text-xs text-gray-700 font-medium">{JUMELAGE_HIGHLIGHT_Q3.question.slice(0, 60)}...</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {[JUMELAGE_HIGHLIGHT_Q3.energia, JUMELAGE_HIGHLIGHT_Q3.techno, JUMELAGE_HIGHLIGHT_Q3.green].map((r, i) => {
                        const scoreColor = r.score >= 80 ? "text-green-600" : r.score >= 60 ? "text-amber-600" : "text-red-600";
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <span className={cn("text-xs font-bold shrink-0 w-8 text-center", scoreColor)}>{r.score}%</span>
                            <div className="flex-1">
                              <span className="text-[9px] font-bold text-gray-500">{r.integrateur}</span>
                              <p className="text-[11px] text-gray-600 line-clamp-2">{r.reponse}</p>
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
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedNotes.includes("q1")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("q1") ? "Extrait ✓" : "Extraire les reponses"}
                    </button>
                    <button
                      onClick={() => {
                        setScoringFilled(true);
                        setStage("winner-intro");
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-600 text-white hover:bg-amber-700 transition-all"
                    >
                      <Trophy className="h-3.5 w-3.5" /> Voir le gagnant
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scoring compact marker (persists after advancing past scoring) */}
          {STAGE_INDEX[stage] > STAGE_INDEX["scoring"] && (
            <div className="flex items-center gap-2 ml-10 py-1.5">
              <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <BarChart3 className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <span className="text-[11px] text-amber-700 font-medium">
                Scoring : {INTEGRATORS.map(i => `${i.nom.split(" ")[0]} ${i.score}%`).join(" / ")}
              </span>
            </div>
          )}
        </>
      )}

      {/* Winner intro */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["winner-intro"] && (
        <>
          <BotBubble code="CEOB" text="" phaseLabel="Demontrer" time="14:49">
            {stage === "winner-intro" ? (
              <TypewriterText
                text={SIM_ACTE2.ceoWinnerIntro}
                speed={8}
                className="text-sm text-gray-800"
                onComplete={() => {
                  setWinnerFilled(true);
                  setStage("winner");
                }}
              />
            ) : (
              <p className="text-sm text-gray-800">{SIM_ACTE2.ceoWinnerIntro}</p>
            )}
          </BotBubble>
        </>
      )}

      {/* Winner message + challenges */}
      {STAGE_INDEX[stage] >= STAGE_INDEX["winner"] && (
        <>
          <BotBubble
            code="CEOB"
            text={SIM_ACTE2.winnerMessage}
            phaseLabel="Obtenir"
            time="14:50"
          />

          {stage === "winner" && (
            <div className="space-y-3 ml-2">
              {/* Action row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowChallengeDefense(true)}
                  disabled={showChallengeDefense}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
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
                    "text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                    showAlternatives
                      ? "bg-gray-200 text-gray-700 border border-gray-300"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" /> Pourquoi pas les 2 autres?
                </button>
                <button
                  onClick={() => setStage("transition")}
                  className="text-xs bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Accepter et continuer
                </button>
              </div>

              {/* Challenge defense */}
              {showChallengeDefense && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CEOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-blue-500 flex-1">
                      <div className="text-xs text-blue-600 mb-2 font-medium">CarlOS — Defense de la selection</div>
                      <TypewriterText
                        text={CHALLENGE_DEFENSE}
                        speed={5}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-11">
                    <button
                      onClick={() => handleExtract("defense")}
                      className={cn(
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedNotes.includes("defense")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("defense") ? "Extrait ✓" : "Extraire l'argumentaire"}
                    </button>
                    <button
                      onClick={() => setStage("transition")}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-600 text-white hover:bg-amber-700 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accepter la recommandation
                    </button>
                  </div>
                </div>
              )}

              {/* Alternatives analysis */}
              {showAlternatives && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-2">
                  <div className="flex gap-3">
                    <BotAvatar code="CEOB" size="md" />
                    <div className="bg-white border rounded-xl rounded-tl-none px-4 py-3 shadow-sm border-l-[3px] border-l-gray-400 flex-1">
                      <div className="text-xs text-gray-600 mb-2 font-medium">CarlOS — Analyse comparative</div>
                      <TypewriterText
                        text={ALTERNATIVE_ANALYSIS}
                        speed={5}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* 3-way comparison mini table */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden ml-11">
                    <div className="grid grid-cols-3 divide-x divide-gray-200">
                      {INTEGRATORS.map((integ, i) => {
                        const isWinner = i === 0;
                        return (
                          <div key={integ.id} className={cn("p-2.5 text-center", isWinner && "bg-amber-50/50")}>
                            <div className={cn(
                              "text-lg font-bold mb-1",
                              integ.score >= 90 ? "text-green-600" : integ.score >= 80 ? "text-amber-600" : "text-gray-500",
                            )}>
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
                        "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
                        extractedNotes.includes("comparaison")
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" /> {extractedNotes.includes("comparaison") ? "Comparaison notee ✓" : "Noter la comparaison"}
                    </button>
                    <button
                      onClick={() => setStage("transition")}
                      className="text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer bg-amber-600 text-white hover:bg-amber-700 transition-all"
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

      {/* Transition */}
      {stage === "transition" && (
        <>
          <BotBubble
            code="CEOB"
            text="Excellent choix. Energia Solutions est selectionne comme integrateur. Le matching est documente — on passe maintenant a la construction du Cahier de Projet pour structurer la collaboration."
            phaseLabel="Transition"
            time="14:52"
          />
          <div className="space-y-3 ml-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleReset}
                className="text-xs bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-200 font-medium cursor-pointer border border-gray-200"
              >
                Recommencer
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ATELIER CONTENT (Right Panel) — Document DocForge qui se batit
  // ═══════════════════════════════════════
  const filledCount =
    (criteresFilled ? 1 : 0) +
    (scanFilled ? 1 : 0) +
    (sessionsFilled ? 1 : 0) +
    (scoringFilled ? 1 : 0) +
    (winnerFilled ? 1 : 0);

  const atelierContent = (
    <div className="space-y-3">
      {/* Document header */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-3 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Jumelage SMART</h3>
              <p className="text-[11px] text-amber-700/70">Les sections se remplissent au fil du matching</p>
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
                <span className="text-[11px] text-gray-700">{c}</span>
              </div>
            ))}
            {criteresModified && (
              <div className="flex items-start gap-2 rounded-lg px-2.5 py-1.5 bg-amber-50 border border-amber-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-amber-800 font-medium">Experience en milieu alimentaire (HACCP, zones temp.) — Ajoute par Carl</span>
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
                    <span className="text-[11px] text-gray-700">{step.label}</span>
                    <span className="text-[11px] font-bold text-gray-800">{step.count}</span>
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
              <p className="text-[11px] text-green-700 font-medium">3 integrateurs identifies sur 130 membres scannes</p>
            </div>
          </div>
        )}
      </DocSectionCard>

      {/* Section 3 — Conférences AI */}
      <DocSectionCard title="3. Conférences AI" icon={Video} filled={sessionsFilled || STAGE_INDEX[stage] >= STAGE_INDEX["conference-energia"]}>
        {(sessionsFilled || STAGE_INDEX[stage] >= STAGE_INDEX["conference-energia"]) && (
          <div className="space-y-3">
            {/* Mini cockpit simulation — participants panel */}
            {STAGE_INDEX[stage] >= STAGE_INDEX["conference-energia"] && STAGE_INDEX[stage] <= STAGE_INDEX["conference-green"] && (
              <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
                <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-800">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] text-gray-400 font-medium">COCKPIT — Conférence en cours</span>
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
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold mx-auto",
                      stage === "conference-energia" ? "bg-amber-500" : stage === "conference-techno" ? "bg-gray-400" : "bg-orange-400"
                    )}>
                      {stage === "conference-energia" ? "E" : stage === "conference-techno" ? "T" : "G"}
                    </div>
                    <p className="text-[9px] text-gray-300 mt-1">
                      {stage === "conference-energia" ? "Marc-André" : stage === "conference-techno" ? "Jean-François" : "Sophie"}
                    </p>
                    <p className="text-[9px] text-gray-500">Fournisseur</p>
                  </div>
                </div>
              </div>
            )}

            {/* Conference 1 notes */}
            {STAGE_INDEX[stage] > STAGE_INDEX["conference-energia"] && (
              <div className="border rounded-lg p-2.5 bg-amber-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">1</div>
                  <span className="text-xs font-bold text-gray-800">Energia Solutions</span>
                  <span className="text-[9px] text-green-600 ml-auto font-medium">Terminée</span>
                </div>
                {CONF_ENERGIA_INSIGHTS.map((ins, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-700">{ins}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Conference 2 notes */}
            {STAGE_INDEX[stage] > STAGE_INDEX["conference-techno"] && (
              <div className="border rounded-lg p-2.5 bg-gray-50">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[9px] text-white font-bold shrink-0">2</div>
                  <span className="text-xs font-bold text-gray-800">Techno-Froid Saguenay</span>
                  <span className="text-[9px] text-green-600 ml-auto font-medium">Terminée</span>
                </div>
                {CONF_TECHNO_INSIGHTS.map((ins, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-700">{ins}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Conference 3 notes */}
            {STAGE_INDEX[stage] > STAGE_INDEX["conference-green"] && (
              <div className="border rounded-lg p-2.5 bg-orange-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-[9px] text-white font-bold shrink-0">3</div>
                  <span className="text-xs font-bold text-gray-800">GreenTech Industries</span>
                  <span className="text-[9px] text-green-600 ml-auto font-medium">Terminée</span>
                </div>
                {CONF_GREEN_INSIGHTS.map((ins, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-700">{ins}</span>
                  </div>
                ))}
              </div>
            )}

            {/* In-progress indicator */}
            {!sessionsFilled && STAGE_INDEX[stage] >= STAGE_INDEX["conference-energia"] && (
              <div className="flex items-center gap-2 text-[11px] text-amber-600">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Conférences en cours — {
                  stage === "conference-energia" ? "1/3" :
                  stage === "conference-techno" ? "2/3" : "3/3"
                }
              </div>
            )}

            {/* Extracted notes */}
            {extractedNotes.filter(n => n.startsWith("conf-")).length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                <p className="text-[9px] font-bold text-green-800 mb-1 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Points clés extraits ({extractedNotes.filter(n => n.startsWith("conf-")).length}/3)
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
                <h4 className="text-xs font-bold text-gray-800">{INTEGRATORS[0].nom}</h4>
                <p className="text-[11px] text-gray-500">{INTEGRATORS[0].ville} — {INTEGRATORS[0].tailleEquipe} personnes — {INTEGRATORS[0].experience}</p>
              </div>
              <div className="ml-auto text-lg font-bold text-green-600">{INTEGRATORS[0].score}%</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
              <p className="text-[9px] font-bold text-green-800 mb-1">Pourquoi ce choix</p>
              <p className="text-[11px] text-green-700">{INTEGRATORS[0].force}</p>
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
                <div className="text-xs font-bold text-gray-800">{INTEGRATORS[0].projetsSimil}</div>
                <div className="text-[9px] text-gray-500">Projets similaires</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                <div className="text-xs font-bold text-green-600">98%</div>
                <div className="text-[9px] text-gray-500">Approbation HQ</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                <div className="text-xs font-bold text-amber-600">20 sem.</div>
                <div className="text-[9px] text-gray-500">Delai livraison</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="text-[11px] bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-gray-50 font-medium cursor-pointer">
                <Download className="h-3.5 w-3.5" /> Exporter le matching
              </button>
            </div>
          </div>
        )}
      </DocSectionCard>
    </div>
  );

  return (
    <AtelierLayout
      title="Jumelage SMART"
      icon={Handshake}
      iconColor="text-amber-600"
      stage={STAGE_INDEX[stage]}
      stageCount={14}
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
        <span className="text-[11px] text-green-700 font-medium">
          Session {sessionNum} — {supplierInfo.company} terminée ({insights.length} points clés)
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
        <span className="text-[11px] text-gray-300 font-medium">
          Conférence AI — Session {sessionNum}/{totalSessions}
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
          return <BotBubble key={i} code="CPOB" text={ex.text} phaseLabel="Entrevue" />;
        }
        if (ex.from === "user") {
          return <UserBubble key={i} text={ex.text} />;
        }
        // Supplier bubble — distinct green style
        return (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-800">{supplierInfo.name}</span>
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
            <Sparkles className="h-3.5 w-3.5" /> Points clés — Session {sessionNum}
          </p>
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[11px] text-amber-900">{insight}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExtract}
            disabled={isExtracted}
            className={cn(
              "text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all",
              isExtracted
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            )}
          >
            <Pin className="h-3.5 w-3.5" /> {isExtracted ? "Extrait ✓" : "Extraire les points clés"}
          </button>
          <button
            onClick={onNext}
            className="text-[11px] bg-amber-600 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-amber-700 font-medium cursor-pointer"
          >
            <ArrowRight className="h-3.5 w-3.5" /> {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
