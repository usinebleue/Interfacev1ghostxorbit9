/**
 * SimulationLibrary.tsx — Bibliotheque des elements de simulation
 * Page de reference visuelle : tous les composants hot catalogues par categorie
 * Accessible via bouton "Simulations" dans la top bar FrameMasterAmorcer
 *
 * DRILL-DOWN: cliquer sur un element → affiche le demo (Scenario ou Atelier)
 */

import { useState, lazy, Suspense } from "react";
import {
  Library,
  Layers,
  Swords,
  AlertTriangle,
  Lightbulb,
  Search,
  Target,
  Sparkles,
  Brain,
  Scale,
  Stethoscope,
  Handshake,
  FileText,
  Monitor,
  Zap,
  Database,
  Box,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Play,
  SplitSquareVertical,
} from "lucide-react";
import { cn } from "../../components/ui/utils";

// ═══ Lazy-loaded demos — Scenarios (chat-style) ═══
const DebatDemo = lazy(() => import("../../v2/zones/center/scenarios/DebatDemo").then(m => ({ default: m.DebatDemo })));
const CriseDemo = lazy(() => import("../../v2/zones/center/scenarios/CriseDemo").then(m => ({ default: m.CriseDemo })));
const BrainstormDemo = lazy(() => import("../../v2/zones/center/scenarios/BrainstormDemo").then(m => ({ default: m.BrainstormDemo })));
const AnalyseDemo = lazy(() => import("../../v2/zones/center/scenarios/AnalyseDemo").then(m => ({ default: m.AnalyseDemo })));
const StrategieDemo = lazy(() => import("../../v2/zones/center/scenarios/StrategieDemo").then(m => ({ default: m.StrategieDemo })));
const InnovationDemo = lazy(() => import("../../v2/zones/center/scenarios/InnovationDemo").then(m => ({ default: m.InnovationDemo })));
const DeepResonanceDemo = lazy(() => import("../../v2/zones/center/scenarios/DeepResonanceDemo").then(m => ({ default: m.DeepResonanceDemo })));
const DecisionDemo = lazy(() => import("../../v2/zones/center/scenarios/DecisionDemo").then(m => ({ default: m.DecisionDemo })));
const DiagnosticDemo = lazy(() => import("../../v2/zones/center/scenarios/DiagnosticDemo").then(m => ({ default: m.DiagnosticDemo })));
const JumelageDemo = lazy(() => import("../../v2/zones/center/scenarios/JumelageDemo").then(m => ({ default: m.JumelageDemo })));
const CahierProjetDemo = lazy(() => import("../../v2/zones/center/scenarios/CahierProjetDemo").then(m => ({ default: m.CahierProjetDemo })));

// ═══ Lazy-loaded demos — Ateliers (splitscreen-style) ═══
const AtelierDebat = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierDebat").then(m => ({ default: m.AtelierDebat })));
const AtelierCrise = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierCrise").then(m => ({ default: m.AtelierCrise })));
const AtelierBrainstorm = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierBrainstorm").then(m => ({ default: m.AtelierBrainstorm })));
const AtelierAnalyse = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierAnalyse").then(m => ({ default: m.AtelierAnalyse })));
const AtelierStrategie = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierStrategie").then(m => ({ default: m.AtelierStrategie })));
const AtelierInnovation = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierInnovation").then(m => ({ default: m.AtelierInnovation })));
const AtelierDeepResonance = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierDeepResonance").then(m => ({ default: m.AtelierDeepResonance })));
const AtelierDecision = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierDecision").then(m => ({ default: m.AtelierDecision })));
const AtelierDiagnostic = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierDiagnostic").then(m => ({ default: m.AtelierDiagnostic })));
const AtelierJumelage = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierJumelage").then(m => ({ default: m.AtelierJumelage })));
const AtelierCahierProjet = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierCahierProjet").then(m => ({ default: m.AtelierCahierProjet })));
const AtelierRealtorClient = lazy(() => import("../../v2/zones/center/atelier/demos/AtelierRealtorClient").then(m => ({ default: m.AtelierRealtorClient })));

// ═══ Mapping categorie → demos ═══
type DemoType = "scenario" | "atelier";
interface DemoEntry { scenario?: React.LazyExoticComponent<React.ComponentType<any>>; atelier?: React.LazyExoticComponent<React.ComponentType<any>>; }
const DEMO_MAP: Record<string, DemoEntry> = {
  debat: { scenario: DebatDemo, atelier: AtelierDebat },
  crise: { scenario: CriseDemo, atelier: AtelierCrise },
  brainstorm: { scenario: BrainstormDemo, atelier: AtelierBrainstorm },
  analyse: { scenario: AnalyseDemo, atelier: AtelierAnalyse },
  strategie: { scenario: StrategieDemo, atelier: AtelierStrategie },
  innovation: { scenario: InnovationDemo, atelier: AtelierInnovation },
  deep: { scenario: DeepResonanceDemo, atelier: AtelierDeepResonance },
  decision: { scenario: DecisionDemo, atelier: AtelierDecision },
  diagnostic: { scenario: DiagnosticDemo, atelier: AtelierDiagnostic },
  jumelage: { scenario: JumelageDemo, atelier: AtelierJumelage },
  cahier: { scenario: CahierProjetDemo, atelier: AtelierCahierProjet },
  realtor: { atelier: AtelierRealtorClient },
};

interface LibraryItem {
  name: string;
  file: string;
  line?: number;
  description: string;
  tags: string[];
}

interface LibraryCategory {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  items: LibraryItem[];
}

const CATEGORIES: LibraryCategory[] = [
  {
    id: "shared",
    icon: Box,
    label: "Composants partages",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "10 composants deja extraits dans simulation-components.tsx — reutilisables directement",
    items: [
      { name: "TypewriterText", file: "shared/simulation-components.tsx", line: 24, description: "Texte qui s'ecrit lettre par lettre avec callback onComplete", tags: ["animation", "texte"] },
      { name: "BotAvatar", file: "shared/simulation-components.tsx", line: 59, description: "Avatar rond avec image du bot (sm/md/lg)", tags: ["avatar", "bot"] },
      { name: "ThinkingAnimation", file: "shared/simulation-components.tsx", line: 81, description: "Steps animes — le bot reflechit (icones qui pulse sequentiellement)", tags: ["animation", "thinking", "processing"] },
      { name: "MultiConsultAnimation", file: "shared/simulation-components.tsx", line: 143, description: "Animation multi-bots qui consultent ensemble en parallele", tags: ["animation", "multi-bot", "collaboration"] },
      { name: "PhaseIndicator", file: "shared/simulation-components.tsx", line: 219, description: "Badge phase CREDO (C/R/E/D/O) avec couleur", tags: ["badge", "phase", "credo"] },
      { name: "SourcesList", file: "shared/simulation-components.tsx", line: 262, description: "Liste de sources avec icones par type (web, doc, api)", tags: ["sources", "liste"] },
      { name: "InlineOptions", file: "shared/simulation-components.tsx", line: 281, description: "Boutons de choix inline animes (options cliquables)", tags: ["interaction", "choix", "boutons"] },
      { name: "ModeSelector", file: "shared/simulation-components.tsx", line: 328, description: "Selecteur de mode de reflexion (8 modes)", tags: ["navigation", "mode"] },
      { name: "UserBubble", file: "shared/simulation-components.tsx", line: 360, description: "Bulle message utilisateur (bleu, alignee a droite)", tags: ["chat", "bulle", "user"] },
      { name: "BotBubble", file: "shared/simulation-components.tsx", line: 376, description: "Bulle message bot avec avatar + typewriter optionnel", tags: ["chat", "bulle", "bot"] },
    ],
  },
  {
    id: "primitives",
    icon: Layers,
    label: "Primitives dupliquees",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "6 composants redefinis dans CHAQUE Atelier — candidats #1 pour extraction",
    items: [
      { name: "SBubble", file: "10 Ateliers", description: "Bulle bot collapsible avec avatar — version simplifiee de BotBubble", tags: ["chat", "bulle", "collapsible"] },
      { name: "SBtn", file: "10 Ateliers", description: "Bouton pill (rounded-full, icon + label) — actions dans le chat", tags: ["bouton", "action", "pill"] },
      { name: "DocSectionCard", file: "10 Ateliers", description: "Section DocForge numerotee avec indicateur rempli/vide + expand/collapse", tags: ["docforge", "section", "card"] },
      { name: "AutoAdvance", file: "10 Ateliers", description: "Timer auto-progression (setTimeout + useCallback stable)", tags: ["timer", "auto", "progression"] },
      { name: "RightContent", file: "3 Ateliers (Debat, Brainstorm, Strategie)", description: "Panel droit DocForge complet avec sidebar TOC + contenu dynamique", tags: ["layout", "docforge", "panel"] },
      { name: "ContentDocForge", file: "2 Ateliers (Brainstorm, Strategie)", description: "Contenu DocForge avec sections remplissables + notes extraites", tags: ["docforge", "contenu", "sections"] },
    ],
  },
  {
    id: "debat",
    icon: Swords,
    label: "Mode Debat",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "DebatDemo (607L) + AtelierDebat (1037L) — Debat contradictoire avec rounds et verdict",
    items: [
      { name: "RoundCard", file: "scenarios/DebatDemo.tsx", line: 56, description: "Card de round : header gradient gray, arguments pour/contre avec sources", tags: ["card", "round", "debat", "arguments"] },
      { name: "VerdictCard", file: "scenarios/DebatDemo.tsx", line: 241, description: "Verdict final : border-2 amber, gradient amber-yellow, recommandation + synthese", tags: ["card", "verdict", "final", "synthese"] },
      { name: "RoundSummaryCard", file: "atelier/demos/AtelierDebat.tsx", line: 968, description: "Resume de round : theme + arguments pour/contre + sources citees", tags: ["card", "resume", "round", "sources"] },
    ],
  },
  {
    id: "crise",
    icon: AlertTriangle,
    label: "Mode Crise",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "CriseDemo (892L) + AtelierCrise (896L) — Gestion de crise OODA avec phases",
    items: [
      { name: "OODAIndicator", file: "scenarios/CriseDemo.tsx", line: 46, description: "Indicateur OODA (Observer-Orienter-Decider-Agir-Stabiliser) — barre avec etapes actives", tags: ["indicateur", "ooda", "phases", "progression"] },
      { name: "AlertCard", file: "scenarios/CriseDemo.tsx", line: 95, description: "Alerte critique : gradient red-orange, border-2 red, urgence temps reel", tags: ["alerte", "urgence", "card", "rouge"] },
      { name: "FactsDashboard", file: "scenarios/CriseDemo.tsx", line: 159, description: "Dashboard de faits verifies : cards avec sources et niveaux de confiance", tags: ["dashboard", "faits", "sources", "confiance"] },
      { name: "TimerDisplay", file: "scenarios/CriseDemo.tsx", line: 240, description: "Chrono urgence : gradient gray-900-red-900, horloge rouge clignotante", tags: ["timer", "urgence", "chrono", "clignotant"] },
      { name: "AssignmentCard", file: "scenarios/CriseDemo.tsx", line: 273, description: "Card d'assignation de roles : bots assignes a des missions avec statuts", tags: ["card", "assignation", "roles", "missions"] },
      { name: "PlanCorrectifCard", file: "scenarios/CriseDemo.tsx", line: 325, description: "Plan correctif : border-2 orange, etapes sequentielles avec slide-in", tags: ["plan", "correctif", "etapes", "animation"] },
      { name: "StabiliseCard", file: "scenarios/CriseDemo.tsx", line: 391, description: "Card stabilisation : gradient green-emerald, confirmation de resolution", tags: ["card", "stabilisation", "vert", "resolution"] },
      { name: "PhaseUpdater", file: "scenarios/CriseDemo.tsx", line: 818, description: "Auto-advance qui met a jour la phase OODA automatiquement", tags: ["auto", "phase", "ooda"] },
      { name: "OrientStage", file: "scenarios/CriseDemo.tsx", line: 839, description: "Etape d'orientation : analyse multi-perspectives avec border-l colore", tags: ["orientation", "analyse", "perspectives"] },
      { name: "getActiveBots()", file: "atelier/demos/AtelierCrise.tsx", line: 109, description: "Fonction dynamique : roster de bots actifs selon le stage de crise", tags: ["fonction", "bots", "dynamique", "roster"] },
    ],
  },
  {
    id: "brainstorm",
    icon: Lightbulb,
    label: "Mode Brainstorm",
    color: "text-amber-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "BrainstormDemo (782L) + AtelierBrainstorm (974L) — Ideation SCAMPER avec clustering",
    items: [
      { name: "StickyNote", file: "scenarios/BrainstormDemo.tsx", line: 73, description: "Post-it anime : couleurs variees, tilt aleatoire, tag SCAMPER", tags: ["post-it", "sticky", "couleur", "scamper"] },
      { name: "StickyBoard", file: "scenarios/BrainstormDemo.tsx", line: 167, description: "Tableau de post-its : grid responsive avec animations staggered", tags: ["board", "grid", "post-its", "animation"] },
      { name: "ClusterCard", file: "scenarios/BrainstormDemo.tsx", line: 223, description: "Card de cluster d'idees : header avec badge count, items groupes par theme", tags: ["cluster", "groupement", "idees", "badge"] },
      { name: "SyntheseCard", file: "scenarios/BrainstormDemo.tsx", line: 326, description: "Synthese brainstorm : border-2 amber, clusters resumes + plan d'action", tags: ["synthese", "resume", "plan", "final"] },
      { name: "extractScamperKey()", file: "scenarios/BrainstormDemo.tsx", line: 46, description: "Extracteur SCAMPER (S/C/A/M/P/E/R) depuis le texte d'une idee", tags: ["fonction", "scamper", "extraction"] },
      { name: "ContentBrainstormContext", file: "atelier/demos/AtelierBrainstorm.tsx", line: 714, description: "Contexte brainstorm DocForge avec clusters et notes extraites", tags: ["docforge", "contexte", "clusters"] },
    ],
  },
  {
    id: "analyse",
    icon: Search,
    label: "Mode Analyse",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    description: "AnalyseDemo (911L) + AtelierAnalyse (817L) — Analyse causale 5 Pourquoi + Ishikawa",
    items: [
      { name: "FiveWhysChain", file: "scenarios/AnalyseDemo.tsx", line: 46, description: "Chaine des 5 Pourquoi : gradient cyan-teal, steps avec TypewriterText, expansion progressive", tags: ["5-pourquoi", "chaine", "causale", "typewriter"] },
      { name: "IshikawaDiagram", file: "scenarios/AnalyseDemo.tsx", line: 197, description: "Diagramme Ishikawa (fishbone) : centre rouge gradient, 6 branches categorisees", tags: ["ishikawa", "fishbone", "diagramme", "causes"] },
      { name: "BranchCard", file: "scenarios/AnalyseDemo.tsx", line: 250, description: "Branche Ishikawa : causes avec tooltip detaille (composant interne)", tags: ["ishikawa", "branche", "cause"] },
      { name: "EvidenceCards", file: "scenarios/AnalyseDemo.tsx", line: 366, description: "Cards de preuves : donnees chiffrees, sources, niveaux de confiance", tags: ["preuves", "evidence", "donnees", "confiance"] },
      { name: "SyntheseCard", file: "scenarios/AnalyseDemo.tsx", line: 484, description: "Synthese analyse : border-2 cyan, actions correctives + causes racines", tags: ["synthese", "actions", "causes", "final"] },
    ],
  },
  {
    id: "strategie",
    icon: Target,
    label: "Mode Strategie",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "StrategieDemo (1095L) + AtelierStrategie (1229L) — Analyse strategique SWOT + Roadmap",
    items: [
      { name: "SwotCard", file: "scenarios/StrategieDemo.tsx", line: 41, description: "SWOT interactif : 4 quadrants (Forces/Faiblesses/Opportunites/Menaces), gradient purple", tags: ["swot", "quadrants", "forces", "faiblesses"] },
      { name: "ScenariosCard", file: "scenarios/StrategieDemo.tsx", line: 195, description: "3 scenarios (optimiste/realiste/pessimiste), timeline comparative", tags: ["scenarios", "comparaison", "timeline"] },
      { name: "RoadmapCard", file: "scenarios/StrategieDemo.tsx", line: 377, description: "Roadmap visuelle : timeline verticale avec milestones, phases 90/180/365j", tags: ["roadmap", "timeline", "milestones", "phases"] },
      { name: "RiskMatrixCard", file: "scenarios/StrategieDemo.tsx", line: 515, description: "Matrice de risques : grille 3x3 (probabilite x impact)", tags: ["risques", "matrice", "grille", "impact"] },
      { name: "SyntheseCard", file: "scenarios/StrategieDemo.tsx", line: 705, description: "Synthese strategie : border-2 purple, recommandations strategiques", tags: ["synthese", "recommandations", "final"] },
      { name: "ContentSwotDetail", file: "atelier/demos/AtelierStrategie.tsx", line: 815, description: "SWOT detaille 4 quadrants avec contenu enrichi", tags: ["swot", "detail", "docforge"] },
      { name: "ContentScenariosDetail", file: "atelier/demos/AtelierStrategie.tsx", line: 856, description: "Scenarios detailles avec analyse comparative", tags: ["scenarios", "detail", "comparaison"] },
      { name: "ContentRoadmapDetail", file: "atelier/demos/AtelierStrategie.tsx", line: 913, description: "Roadmap timeline detaillee avec jalons", tags: ["roadmap", "detail", "jalons"] },
      { name: "ContentRisquesDetail", file: "atelier/demos/AtelierStrategie.tsx", line: 971, description: "Matrice de risques detaillee avec mitigations", tags: ["risques", "detail", "mitigations"] },
      { name: "ContentSyntheseThinking", file: "atelier/demos/AtelierStrategie.tsx", line: 1046, description: "Animation synthese en cours (thinking state)", tags: ["animation", "synthese", "thinking"] },
    ],
  },
  {
    id: "innovation",
    icon: Sparkles,
    label: "Mode Innovation",
    color: "text-fuchsia-700",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
    description: "InnovationDemo (769L) + AtelierInnovation (870L) — Ideation disruptive + Faisabilite",
    items: [
      { name: "TechniqueCard", file: "scenarios/InnovationDemo.tsx", line: 70, description: "Card de technique innovation : header gradient par couleur d'accent, 3 idees", tags: ["technique", "card", "idees", "innovation"] },
      { name: "ScoreBar", file: "scenarios/InnovationDemo.tsx", line: 223, description: "Barre de score animee : progression coloree avec pourcentage", tags: ["score", "barre", "progression", "animation"] },
      { name: "FeasibilitySpectrum", file: "scenarios/InnovationDemo.tsx", line: 253, description: "Spectre de faisabilite : gradient fuchsia-pink, classement par score multidimensionnel", tags: ["faisabilite", "spectre", "classement", "scores"] },
      { name: "SyntheseCard", file: "scenarios/InnovationDemo.tsx", line: 397, description: "Synthese innovation : border-2 fuchsia, meilleures idees + plan", tags: ["synthese", "innovation", "final"] },
    ],
  },
  {
    id: "deep",
    icon: Brain,
    label: "Mode Deep Resonance",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "DeepResonanceDemo (864L) + AtelierDeepResonance (997L) — Spirale de reflexion profonde",
    items: [
      { name: "SpiralIndicator", file: "scenarios/DeepResonanceDemo.tsx", line: 32, description: "Indicateur spirale 3 niveaux (Surface-Profond-Resonance), barres progressives", tags: ["spirale", "indicateur", "niveaux", "progression"] },
      { name: "ReflectionCard", file: "scenarios/DeepResonanceDemo.tsx", line: 101, description: "Card de reflexion profonde : gradient indigo-violet, contenu meditatif", tags: ["reflexion", "card", "profonde", "indigo"] },
      { name: "MentalModelCard", file: "scenarios/DeepResonanceDemo.tsx", description: "Modele mental : framework intellectuel avec pattern visuel unique", tags: ["modele-mental", "framework", "intellectuel"] },
      { name: "CrystallizationCard", file: "scenarios/DeepResonanceDemo.tsx", description: "Cristallisation : synthese finale de la spirale de resonance", tags: ["cristallisation", "synthese", "final", "spirale"] },
    ],
  },
  {
    id: "decision",
    icon: Scale,
    label: "Mode Decision",
    color: "text-indigo-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    description: "DecisionDemo (648L) + AtelierDecision (854L) — Prise de decision ponderee",
    items: [
      { name: "ScoreBar", file: "scenarios/DecisionDemo.tsx", line: 109, description: "Barre de score (vert=pour, rouge=contre) avec animation", tags: ["score", "barre", "pour-contre"] },
      { name: "CriteriaCard", file: "scenarios/DecisionDemo.tsx", line: 122, description: "Card critere : double ScoreBar (pour/contre), poids pondere", tags: ["critere", "card", "poids", "ponderation"] },
      { name: "StakeholderCard", file: "scenarios/DecisionDemo.tsx", line: 170, description: "Parties prenantes : avatars + impact positif/negatif par stakeholder", tags: ["stakeholders", "impact", "parties-prenantes"] },
      { name: "ScenariosCard", file: "scenarios/DecisionDemo.tsx", line: 211, description: "Scenarios de decision : comparaison si OUI / si NON", tags: ["scenarios", "oui-non", "comparaison"] },
      { name: "VerdictCard", file: "scenarios/DecisionDemo.tsx", line: 242, description: "Verdict : recommandation finale + score, boutons Challenge/Contre-argument", tags: ["verdict", "recommandation", "challenge"] },
      { name: "ChallengeResponseCard", file: "scenarios/DecisionDemo.tsx", line: 354, description: "Reponse au challenge : slide-in anime avec contre-arguments", tags: ["challenge", "reponse", "animation"] },
      { name: "TransitionMessage", file: "scenarios/DecisionDemo.tsx", line: 395, description: "Message de transition vers un autre mode : border-2 colore par destination", tags: ["transition", "navigation", "modes"] },
      { name: "ContinueButton", file: "scenarios/DecisionDemo.tsx", line: 416, description: "Bouton Continuer standardise avec hover effect", tags: ["bouton", "continuer", "navigation"] },
    ],
  },
  {
    id: "diagnostic",
    icon: Stethoscope,
    label: "Diagnostic VITAA",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "DiagnosticDemo (999L) + AtelierDiagnostic (1225L) — Triangle du Feu + VITAA",
    items: [
      { name: "Hero Gradient Icon", file: "scenarios/DiagnosticDemo.tsx", line: 212, description: "Icone 20x20 rounded-2xl gradient red-orange avec shadow-xl", tags: ["hero", "gradient", "icone", "entree"] },
      { name: "Piliers VITAA animes", file: "scenarios/DiagnosticDemo.tsx", description: "5 piliers (V/I/T/A/A) avec scores animes slide-in staggere", tags: ["vitaa", "piliers", "scores", "animation"] },
      { name: "Triangle du Feu", file: "scenarios/DiagnosticDemo.tsx", description: "Diagnostic dynamique BRULE (3+) / COUVE (2) / MEURT (1)", tags: ["triangle-feu", "diagnostic", "dynamique"] },
      { name: "ProfilItem", file: "atelier/demos/AtelierDiagnostic.tsx", description: "Item de profil entreprise diagnostiquee avec donnees cles", tags: ["profil", "entreprise", "item"] },
    ],
  },
  {
    id: "jumelage",
    icon: Handshake,
    label: "Jumelage Orbit9",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "JumelageDemo (758L) + AtelierJumelage (1524L) — Matching integrateurs + Conferences",
    items: [
      { name: "IntegratorDetailExpanded", file: "scenarios/JumelageDemo.tsx", line: 47, description: "Fiche integrateur : specialites, certifications, cas clients", tags: ["integrateur", "fiche", "detail", "certifications"] },
      { name: "ChallengeDefenseCard", file: "scenarios/JumelageDemo.tsx", line: 93, description: "Card challenge : l'IA pousse a considerer d'autres options", tags: ["challenge", "defense", "alternatives"] },
      { name: "AllThreeComparison", file: "scenarios/JumelageDemo.tsx", line: 145, description: "Comparaison 3 integrateurs cote-a-cote : scoring multidimensionnel", tags: ["comparaison", "scoring", "cote-a-cote"] },
      { name: "exportMatchingMarkdown()", file: "scenarios/JumelageDemo.tsx", line: 214, description: "Genere un rapport de matching telechargeable en Markdown", tags: ["export", "markdown", "rapport"] },
      { name: "ConferenceSession", file: "atelier/demos/AtelierJumelage.tsx", line: 1389, description: "Session de conference live : avatar + nom + chrono + statut", tags: ["conference", "live", "session", "chrono"] },
    ],
  },
  {
    id: "cahier",
    icon: FileText,
    label: "Cahier de Projet",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "CahierProjetDemo (837L) + AtelierCahierProjet (1127L) — Redaction cahier de projet",
    items: [
      { name: "Flow complet Cahier", file: "scenarios/CahierProjetDemo.tsx", description: "Qualification - Sections DocForge - Budget challenge - Risk analysis - KPI", tags: ["flow", "cahier", "qualification", "budget"] },
      { name: "SectionContent", file: "atelier/demos/AtelierCahierProjet.tsx", line: 942, description: "Renderer de contenu de section : texte, listes, donnees structurees", tags: ["section", "contenu", "renderer"] },
    ],
  },
  {
    id: "realtor",
    icon: Monitor,
    label: "TheRealtor (Engel & Volkers)",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "AtelierRealtorClient (1444L) — Simulation immobiliere complete avec branding E&V",
    items: [
      { name: "EVBotBubble", file: "atelier/demos/AtelierRealtorClient.tsx", line: 1383, description: "Bulle bot brandee Engel & Volkers : style premium, compact optionnel", tags: ["bulle", "bot", "branding", "premium"] },
      { name: "EVUserBubble", file: "atelier/demos/AtelierRealtorClient.tsx", line: 1402, description: "Bulle utilisateur Realtor : style coherent avec EVBotBubble", tags: ["bulle", "user", "branding"] },
      { name: "EVStep", file: "atelier/demos/AtelierRealtorClient.tsx", line: 1413, description: "Step de progression Realtor : etapes visuelles du parcours client", tags: ["step", "progression", "parcours"] },
      { name: "EVDocSection", file: "atelier/demos/AtelierRealtorClient.tsx", line: 1424, description: "Section document Realtor : filled/active indicator, titre + icone", tags: ["section", "document", "filled", "active"] },
    ],
  },
  {
    id: "animations",
    icon: Zap,
    label: "Patterns d'animation",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    description: "411+ instances d'animations dans les Ateliers — patterns reutilisables",
    items: [
      { name: "Bouncing Dots", file: "Partout", description: "3 dots staggered delays (0/150/300ms) — indicateur de chargement", tags: ["dots", "bouncing", "loading", "staggered"] },
      { name: "Slide-in from bottom", file: "Partout", description: "animate-in fade-in slide-in-from-bottom-* duration-500/700", tags: ["slide-in", "fade-in", "entree", "cards"] },
      { name: "Pulse icons", file: "Partout", description: "animate-pulse sur icones actives + dots indicateurs", tags: ["pulse", "icones", "actif"] },
      { name: "Hover scale", file: "CTA buttons", description: "hover:scale-105 transition-all — boutons d'action principaux", tags: ["hover", "scale", "bouton", "cta"] },
      { name: "Processing states", file: "SimAmorcer + Ateliers", description: "Icons animate-pulse + bouncing dots + label — etapes de travail IA", tags: ["processing", "thinking", "etapes", "ia"] },
      { name: "Staggered delays", file: "Ateliers", description: "animationDelay: i*400ms, animationFillMode: both — items sequentiels", tags: ["staggered", "sequentiel", "delay"] },
      { name: "Transition fluides", file: "Partout", description: "transition-all duration-500/700 — transitions de changement d'etat", tags: ["transition", "fluide", "etat"] },
    ],
  },
  {
    id: "data",
    icon: Database,
    label: "Donnees structurees",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "8 fichiers de donnees (1463 lignes) — contenu des simulations avec interfaces TypeScript",
    items: [
      { name: "analyse-data.ts (309L)", file: "scenarios/analyse-data.ts", description: "WhyStep, IshikawaCause, IshikawaBranch, EvidenceCard, CorrectiveAction, ANALYSE_DATA", tags: ["data", "analyse", "ishikawa"] },
      { name: "brainstorm-data.ts (150L)", file: "scenarios/brainstorm-data.ts", description: "StickyNote interface, BRAINSTORM_DATA avec notes SCAMPER et clusters", tags: ["data", "brainstorm", "scamper"] },
      { name: "crise-data.ts (118L)", file: "scenarios/crise-data.ts", description: "CRISE_DATA : alertes, assignations, plans correctifs", tags: ["data", "crise", "alertes"] },
      { name: "debat-data.ts (126L)", file: "scenarios/debat-data.ts", description: "DEBAT_DATA : rounds, arguments pour/contre, verdicts", tags: ["data", "debat", "rounds"] },
      { name: "decision-data.ts (208L)", file: "scenarios/decision-data.ts", description: "DecisionCriteria, StakeholderImpact, DECISION_DATA", tags: ["data", "decision", "criteres"] },
      { name: "deep-data.ts (133L)", file: "scenarios/deep-data.ts", description: "DEEP_DATA : spirales, reflexions, modeles mentaux", tags: ["data", "deep", "spirales"] },
      { name: "innovation-data.ts (136L)", file: "scenarios/innovation-data.ts", description: "INNOVATION_DATA : techniques, idees, scores de faisabilite", tags: ["data", "innovation", "techniques"] },
      { name: "strategie-data.ts (283L)", file: "scenarios/strategie-data.ts", description: "STRATEGIE_DATA : SWOT complet, scenarios, roadmap, risques", tags: ["data", "strategie", "swot"] },
    ],
  },
];

// ═══ Sub-components ═══

function CategorySection({ category, searchQuery, onPreview }: { category: LibraryCategory; searchQuery: string; onPreview: (categoryId: string, demoType: DemoType) => void }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = category.icon;
  const hasDemo = !!DEMO_MAP[category.id];

  const filteredItems = searchQuery
    ? category.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : category.items;

  if (searchQuery && filteredItems.length === 0) return null;

  return (
    <div className={cn("border rounded-xl overflow-hidden", category.borderColor)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer transition-colors",
          category.bgColor,
          "hover:brightness-95"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", category.color)} />
        <span className={cn("text-sm font-bold", category.color)}>{category.label}</span>
        <span className="text-[10px] text-gray-500 font-medium ml-1">({filteredItems.length})</span>
        <div className="flex-1" />
        {/* Boutons preview rapide par categorie */}
        {hasDemo && (
          <div className="flex items-center gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
            {DEMO_MAP[category.id]?.scenario && (
              <button type="button" onClick={() => onPreview(category.id, "scenario")} className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200 transition-all cursor-pointer" title="Voir le scenario demo">
                <Play className="h-2.5 w-2.5" />Scenario
              </button>
            )}
            {DEMO_MAP[category.id]?.atelier && (
              <button type="button" onClick={() => onPreview(category.id, "atelier")} className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200 transition-all cursor-pointer" title="Voir l'atelier demo">
                <SplitSquareVertical className="h-2.5 w-2.5" />Atelier
              </button>
            )}
          </div>
        )}
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </button>
      {expanded && (
        <div className="bg-white">
          <p className="text-[10px] text-gray-500 px-4 pt-2 pb-1">{category.description}</p>
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <ItemRow key={item.name} item={item} categoryColor={category.color} categoryId={category.id} onPreview={onPreview} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, categoryColor, categoryId, onPreview }: { item: LibraryItem; categoryColor: string; categoryId: string; onPreview: (categoryId: string, demoType: DemoType) => void }) {
  const [copied, setCopied] = useState(false);
  const hasDemo = !!DEMO_MAP[categoryId];

  const handleCopy = () => {
    const text = item.line ? `${item.file}:${item.line}` : item.file;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleNameClick = () => {
    if (!hasDemo) return;
    // Prefer scenario demo, fallback to atelier
    const demoType: DemoType = DEMO_MAP[categoryId]?.scenario ? "scenario" : "atelier";
    onPreview(categoryId, demoType);
  };

  const demoEntry = DEMO_MAP[categoryId];

  return (
    <div className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-bold", categoryColor)}>{item.name}</span>
          {item.line && <span className="text-[9px] text-gray-400 font-mono">L{item.line}</span>}
        </div>
        <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-1 mt-1">
          <ExternalLink className="h-2.5 w-2.5 text-gray-300 shrink-0" />
          <span className="text-[9px] text-gray-400 font-mono truncate">{item.file}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {/* Tags */}
          {item.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-gray-100 text-gray-500">{tag}</span>
          ))}
          {/* Boutons Voir — toujours visibles si demo existe */}
          {hasDemo && demoEntry?.scenario && (
            <button
              type="button"
              onClick={() => onPreview(categoryId, "scenario")}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#00B4D8]/10 text-[#00B4D8] hover:bg-[#00B4D8]/20 border border-[#00B4D8]/30 transition-all cursor-pointer ml-auto"
            >
              <Play className="h-2.5 w-2.5" />Voir Scenario
            </button>
          )}
          {hasDemo && demoEntry?.atelier && (
            <button
              type="button"
              onClick={() => onPreview(categoryId, "atelier")}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer",
                !demoEntry?.scenario && "ml-auto"
              )}
            >
              <SplitSquareVertical className="h-2.5 w-2.5" />Voir Atelier
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all cursor-pointer shrink-0 mt-0.5"
        title="Copier le chemin"
      >
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
      </button>
    </div>
  );
}

// ═══ Main Component ═══

// ═══ Loading fallback ═══
function DemoLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-[#00B4D8] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#00B4D8] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#00B4D8] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-sm text-gray-500">Chargement de la simulation...</span>
      </div>
    </div>
  );
}

// ═══ Demo Preview wrapper ═══
function DemoPreview({ categoryId, demoType, onBack }: { categoryId: string; demoType: DemoType; onBack: () => void }) {
  const category = CATEGORIES.find(c => c.id === categoryId);
  const demoEntry = DEMO_MAP[categoryId];
  if (!category || !demoEntry) return null;

  const DemoComponent = demoType === "scenario" ? demoEntry.scenario : demoEntry.atelier;
  if (!DemoComponent) return null;

  const Icon = category.icon;
  const typeLabel = demoType === "scenario" ? "Scenario" : "Atelier";

  return (
    <div>
      {/* Header retour */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Bibliotheque
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <Icon className={cn("h-3.5 w-3.5", category.color)} />
        <span className={cn("text-xs font-bold", category.color)}>{category.label}</span>
        <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{typeLabel}</span>
        <div className="flex-1" />
        {/* Toggle scenario/atelier */}
        {demoEntry.scenario && demoEntry.atelier && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onBack}
              className="text-[9px] text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Changer de vue
            </button>
          </div>
        )}
      </div>
      {/* Demo content */}
      <Suspense fallback={<DemoLoading />}>
        {demoType === "atelier" ? (
          <DemoComponent onBack={onBack} />
        ) : (
          <div className="p-4">
            <DemoComponent />
          </div>
        )}
      </Suspense>
    </div>
  );
}

export function SimulationLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [preview, setPreview] = useState<{ categoryId: string; demoType: DemoType } | null>(null);

  const totalItems = CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const filteredCategories = searchQuery
    ? CATEGORIES.filter((cat) =>
        cat.items.some(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      )
    : CATEGORIES;

  const handlePreview = (categoryId: string, demoType: DemoType) => {
    setPreview({ categoryId, demoType });
  };

  // ═══ DRILL-DOWN: affiche le demo ═══
  if (preview) {
    return (
      <DemoPreview
        categoryId={preview.categoryId}
        demoType={preview.demoType}
        onBack={() => setPreview(null)}
      />
    );
  }

  // ═══ LISTE: bibliotheque complète ═══
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
      <div className="bg-gradient-to-r from-[#00B4D8]/10 to-purple-100/30 rounded-xl p-5 mb-4 border border-[#00B4D8]/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B4D8] to-purple-600 flex items-center justify-center shadow-md">
            <Library className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Bibliotheque Simulations</h1>
            <p className="text-[11px] text-gray-500">{totalItems} composants hot — Scenarios + Ateliers + TheRealtor</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-gray-900">10</div>
            <div className="text-[9px] text-gray-500">Partages</div>
          </div>
          <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-gray-900">43</div>
            <div className="text-[9px] text-gray-500">Uniques par mode</div>
          </div>
          <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-gray-900">16</div>
            <div className="text-[9px] text-gray-500">Ateliers</div>
          </div>
          <div className="bg-white/70 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-gray-900">1463</div>
            <div className="text-[9px] text-gray-500">Lignes de data</div>
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Chercher un composant, tag, ou description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 focus:border-[#00B4D8]/50 bg-white"
        />
      </div>

      <div className="space-y-3">
        {filteredCategories.map((cat) => (
          <CategorySection key={cat.id} category={cat} searchQuery={searchQuery} onPreview={handlePreview} />
        ))}
      </div>

      {searchQuery && filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">Aucun composant trouve pour &quot;{searchQuery}&quot;</div>
      )}
    </div>
  );
}
