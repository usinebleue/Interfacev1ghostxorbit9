/**
 * BibleGHMLPage.tsx — Bible GHML Complete (Ghost Modeling Language)
 * MERGE of 3 pages: BibleGHML + MasterProtocoles + MasterTableauPeriodique
 * 6 tabs: Fondations | Agents & Ghosts | Protocoles | Tableau Periodique | Frameworks | Glossaire
 */

import { useState } from "react";
import {
  Atom, ArrowRight, Zap, BarChart3,
  Flame, Brain, Sparkles, AlertTriangle,
  MessageSquare, Target, Lightbulb, Shield,
  Swords, BookOpen, Compass, Search,
  Eye, Trophy, X, Network,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// =================================================================
// TABS
// =================================================================

const tabs = [
  { id: "fondations", label: "Fondations" },
  { id: "agents-ghosts", label: "Agents & Ghosts" },
  { id: "protocoles", label: "Protocoles" },
  { id: "tableau-periodique", label: "Tableau Periodique" },
  { id: "frameworks", label: "Frameworks" },
  { id: "glossaire", label: "Glossaire" },
];

// =================================================================
// HELPERS
// =================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

function StatusBadge({ status }: { status: "actif" | "partiel" | "planifie" | "conceptuel" }) {
  const config = {
    actif: { label: "ACTIF", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    partiel: { label: "PARTIEL", className: "bg-amber-100 text-amber-700 border-amber-200" },
    planifie: { label: "PLANIFIE", className: "bg-blue-100 text-blue-700 border-blue-200" },
    conceptuel: { label: "CONCEPTUEL", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

// =================================================================
// DATA — Fondations
// =================================================================

const CREDO_PHASES = [
  { letter: "C", name: "Connecter", color: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-700", desc: "Etablir le lien, comprendre le besoin", bouche: "Connecter", cerveau: "Clarifier", coeur: "Comprendre" },
  { letter: "R", name: "Rechercher", color: "bg-violet-500", lightBg: "bg-violet-50", textColor: "text-violet-700", desc: "Analyser, diagnostiquer, explorer", bouche: "Rechercher", cerveau: "Reflechir", coeur: "Resonner" },
  { letter: "E", name: "Exposer", color: "bg-amber-500", lightBg: "bg-amber-50", textColor: "text-amber-700", desc: "Reveler les insights, montrer les options", bouche: "Exposer", cerveau: "Elaborer", coeur: "Elever" },
  { letter: "D", name: "Demontrer", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700", desc: "Prouver la valeur, valider", bouche: "Demontrer", cerveau: "Decider", coeur: "Debloquer" },
  { letter: "O", name: "Obtenir", color: "bg-green-600", lightBg: "bg-green-50", textColor: "text-green-700", desc: "Conclure, livrer, next steps", bouche: "Obtenir", cerveau: "Operer", coeur: "Ouvrir" },
];

const VITAA_PILLARS = [
  { letter: "V", name: "Vente", desc: "Capacite commerciale", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { letter: "I", name: "Idee", desc: "Innovation et vision", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { letter: "T", name: "Temps", desc: "Gestion du temps et priorites", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { letter: "A", name: "Argent", desc: "Sante financiere", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { letter: "A", name: "Actif", desc: "Actifs et ressources", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
];

// =================================================================
// DATA — Agents & Ghosts
// =================================================================

const GHOSTS = [
  { id: "G1", name: "Bezos", archetype: "Le Systemiste", specialty: "Strategie client", color: "bg-blue-500" },
  { id: "G2", name: "Jobs", archetype: "Le Designer", specialty: "Design thinking", color: "bg-gray-800" },
  { id: "G3", name: "Musk", archetype: "L'Executeur", specialty: "Innovation audacieuse", color: "bg-red-500" },
  { id: "G4", name: "Sun Tzu", archetype: "Le Stratege", specialty: "Strategie militaire", color: "bg-emerald-600" },
  { id: "G5", name: "Munger", archetype: "L'Inverseur", specialty: "Modeles mentaux", color: "bg-amber-600" },
  { id: "G6", name: "Marc Aurele", archetype: "Le Stoicien", specialty: "Stoicisme", color: "bg-slate-600" },
  { id: "G7", name: "Churchill", archetype: "Le Mobilisateur", specialty: "Leadership de crise", color: "bg-indigo-600" },
  { id: "G8", name: "Disney", archetype: "Le Reveur", specialty: "Storytelling", color: "bg-pink-500" },
  { id: "G9", name: "Tesla", archetype: "Le Resonateur", specialty: "Catalyseur constant 3-6-9", color: "bg-violet-600" },
  { id: "G10", name: "Buffett", archetype: "Le Composeur", specialty: "Investissement valeur", color: "bg-green-600" },
  { id: "G11", name: "Curie", archetype: "La Pionniere", specialty: "Recherche scientifique", color: "bg-teal-600" },
  { id: "G12", name: "Oprah", archetype: "L'Amplificatrice", specialty: "Communication empathique", color: "bg-orange-500" },
];

const TRISOCIATION_EXAMPLES = [
  { code: "BCO", role: "CEO", formula: "Gh(Bz·Mg·Ch)STX", primaire: "Bezos", calibrateur: "Munger", amplificateur: "Churchill", resultat: "L'Empire Resilient" },
  { code: "BCT", role: "CTO", formula: "Gh(Mk·Cu·Vi)STX", primaire: "Musk", calibrateur: "Curie", amplificateur: "Vinci", resultat: "La Science Creative" },
  { code: "BCF", role: "CFO", formula: "Gh(Bu·Mg·Fr)STX", primaire: "Buffett", calibrateur: "Munger", amplificateur: "Franklin", resultat: "Le Coffre-Fort Intelligent" },
  { code: "BCM", role: "CMO", formula: "Gh(Di·Jb·Op)STX", primaire: "Disney", calibrateur: "Jobs/Blakely", amplificateur: "Oprah", resultat: "La Machine a Reves" },
  { code: "BCS", role: "CSO", formula: "Gh(Tz·Th·Cn)STX", primaire: "Sun Tzu", calibrateur: "Thiel", amplificateur: "Chanel", resultat: "L'Echiquier Elegant" },
  { code: "BOO", role: "COO", formula: "Gh(MA·De·Ni)STX", primaire: "Marc Aurele", calibrateur: "Deming", amplificateur: "Nightingale", resultat: "La Forge Stoique" },
];

const REFLECTION_MODES = [
  { num: 1, name: "Debat", desc: "Dialectique + 6 Chapeaux", icon: MessageSquare, color: "text-blue-500" },
  { num: 2, name: "Brainstorm", desc: "Walt Disney + 18 techniques", icon: Lightbulb, color: "text-amber-500" },
  { num: 3, name: "Crise", desc: "OODA Loop", icon: AlertTriangle, color: "text-red-500" },
  { num: 4, name: "Analyse", desc: "5 Pourquoi + Ishikawa", icon: Search, color: "text-violet-500" },
  { num: 5, name: "Decision", desc: "6 Chapeaux + Regret Bezos", icon: Target, color: "text-emerald-500" },
  { num: 6, name: "Strategie", desc: "SWOT vers 3 horizons", icon: Compass, color: "text-indigo-500" },
  { num: 7, name: "Innovation", desc: "Bisociation Koestler", icon: Sparkles, color: "text-pink-500" },
  { num: 8, name: "Deep Resonance", desc: "Spirale Socratique", icon: Eye, color: "text-teal-500" },
];

const HERRMANN_QUADRANTS = [
  {
    quadrant: "A", name: "Analytique", color: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-700",
    desc: "Logique, faits, chiffres, raisonnement",
    bots: ["BCF (CFO)", "BCT (CTO)", "BSE (CISO)"],
  },
  {
    quadrant: "B", name: "Organisationnel", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700",
    desc: "Processus, planification, execution",
    bots: ["BOO (COO)", "BFA (CPO)", "BLE (CLO)"],
  },
  {
    quadrant: "C", name: "Relationnel", color: "bg-red-500", lightBg: "bg-red-50", textColor: "text-red-700",
    desc: "Emotions, empathie, communication",
    bots: ["BHR (CHRO)", "BCS (CSO)", "BRO (CRO)"],
  },
  {
    quadrant: "D", name: "Creatif", color: "bg-amber-500", lightBg: "bg-amber-50", textColor: "text-amber-700",
    desc: "Vision, innovation, intuition",
    bots: ["BCO (CEO)", "BCM (CMO)", "BIO (CINO)"],
  },
];

// =================================================================
// DATA — Protocoles
// =================================================================

const PROTOCOLES_MAITRES = [
  {
    name: "CREDO", level: "L1", status: "actif" as const, color: "border-l-blue-500",
    desc: "Protocole Maitre — 5 phases (C-R-E-D-O) avec 3 couches simultanees (Bouche/Cerveau/Coeur). Gouverne toutes les interactions.",
    details: ["5 phases sequentielles", "3 couches paralleles par message", "Auto-detection de phase", "Wrap-up automatique"],
  },
  {
    name: "GHML Engine", level: "L1", status: "actif" as const, color: "border-l-violet-500",
    desc: "Ghost Modeling Language — 232 elements, 4 groupes (S/P/T/H), 7 periodes, 3 etats (Solide/Liquide/Gaz). Modele l'intelligence d'affaires.",
    details: ["Tableau Periodique proprietaire", "Scoring par element", "Reactions chimiques entre elements", "Vecteurs de compatibilite"],
  },
  {
    name: "VITAA/AIAVT", level: "L1", status: "actif" as const, color: "border-l-emerald-500",
    desc: "5 piliers de scoring (Vente/Idee/Temps/Argent/Actif) — chacun 0-100. Triangle du Feu: BRULE/COUVE/MEURT.",
    details: ["5 scores independants 0-100", "Triangle du Feu dynamique", "Double Diagnostic (Savoir + Valeur)", "Calibration Herrmann integree"],
  },
];

const PROTOCOLES_ROUTAGE = [
  {
    name: "5-Tier Routing", status: "actif" as const,
    desc: "T0 Regex/Cache (30-40%, gratuit) | T1 Gemini Flash (30%, gratuit) | T2 Gemini Pro (20%, gratuit) | T3 Claude Sonnet (15%, payant) | T4 Claude Opus (5%, cher)",
    tiers: [
      { tier: "T0", name: "Regex/Cache", pct: 35, cost: "Gratuit", color: "bg-emerald-500" },
      { tier: "T1", name: "Gemini Flash", pct: 30, cost: "Gratuit", color: "bg-emerald-400" },
      { tier: "T2", name: "Gemini Pro", pct: 20, cost: "Gratuit", color: "bg-amber-400" },
      { tier: "T3", name: "Claude Sonnet", pct: 10, cost: "$0.01-0.05", color: "bg-orange-400" },
      { tier: "T4", name: "Claude Opus", pct: 5, cost: "$0.15-0.60", color: "bg-red-400" },
    ],
  },
  {
    name: "COMMAND Protocol", status: "actif" as const,
    desc: "Moteur d'execution de commandes: CommandLive (execution immediate) + CommandCompiler (briefings compiles) + CommandDetector (auto-detection dans le chat).",
  },
  {
    name: "VERITE Protocol", status: "actif" as const,
    desc: "Anti-hallucination: REGLES_GLOBALES injectees dans bridge_btml_connector.py. Jargon GHML invisible pour l'utilisateur. Verification de coherence systematique.",
  },
  {
    name: "Sentinel", status: "actif" as const,
    desc: "Surveillance continue: detection de derives, tensions, incoherences. Alertes automatiques dans le LiveChat. Cascade de tensions integree.",
  },
];

const PROTOCOLES_COMMUNICATION = [
  { name: "Routeur Inverse", status: "actif" as const, desc: "Pre-LLM keyword routing: mots-cles vocaux detectes AVANT l'appel LLM pour actions canvas immediates + agent/mode override." },
  { name: "Calibration Herrmann", status: "actif" as const, desc: "4 quadrants (A-Analytique, B-Organisationnel, C-Relationnel, D-Creatif) — chaque bot est calibre sur un quadrant dominant." },
  { name: "Arsenal Humour", status: "partiel" as const, desc: "Integration contextuelle d'humour dans les reponses selon le PHASE_TONE et le profil utilisateur. Dosage adaptatif." },
  { name: "PHASE_TONE", status: "actif" as const, desc: "Tonalite adaptative par phase CREDO: C=accueillant, R=analytique, E=revelateur, D=convaincant, O=actionnable." },
  { name: "CAB (Context-Action-Benefit)", status: "actif" as const, desc: "Structure de reponse: Contexte (ce qu'on sait) + Action (ce qu'on propose) + Benefice (pourquoi ca marche)." },
];

const PROTOCOLES_DIAGNOSTIC = [
  { name: "Bilan de Sante", status: "actif" as const, desc: "Diagnostic complet de l'entreprise: 5 piliers VITAA scores, Triangle du Feu, recommandations par departement." },
  { name: "Triangle du Feu", status: "actif" as const, desc: "Evaluation dynamique: BRULE (3+ piliers actifs), COUVE (2 piliers), MEURT (0-1 pilier). Mise a jour en temps reel." },
  { name: "Tableau Periodique Diagnostic", status: "actif" as const, desc: "232 elements comme vecteurs de diagnostic: scoring par element, reactions naturelles, promotion d'etat." },
  { name: "Chef d'Orchestre", status: "actif" as const, desc: "CarlOS assemble l'equipe optimale: _score_bots_pour_message() + _composer_equipe_3_bots(). TeamProposal avec trio dynamique." },
];

const PROTOCOLES_ECONOMIE = [
  { name: "Orbit9 Matching", status: "actif" as const, desc: "Moteur de jumelage: 3 tables (members/cellules/matches) + 15 endpoints + scoring Gemini Flash + trisociation LiveKit." },
  { name: "TimeTokens", status: "planifie" as const, desc: "Unite de valeur collaboration. Off-chain SQLite pour V1. Formule: TT_Valeur = TT_Input x (1+C_cat) x phi^(n x eta)." },
  { name: "Decision Log", status: "actif" as const, desc: "Table decision_log: D-001 a D-109+. 4 endpoints API + frontend hooks. Tracabilite complete des decisions." },
  { name: "Permission Codes", status: "planifie" as const, desc: "Systeme de permissions par role: qui peut voir quoi, modifier quoi. Granulaire par bot et par section." },
];

// =================================================================
// DATA — Tableau Periodique
// =================================================================

const TP_GROUPS = [
  { group: "S", name: "Sectoriel", count: 28, color: "bg-blue-500", lightBg: "bg-blue-50", textColor: "text-blue-700", desc: "Savoir industriel, secteurs, niches, marches verticaux" },
  { group: "P", name: "Patterns", count: 67, color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700", desc: "Modeles recurrents, frameworks, pratiques validees" },
  { group: "T", name: "Technologie", count: 72, color: "bg-violet-500", lightBg: "bg-violet-50", textColor: "text-violet-700", desc: "Outils, stack, infrastructure, IA, automatisation" },
  { group: "H", name: "Humain", count: 65, color: "bg-amber-500", lightBg: "bg-amber-50", textColor: "text-amber-700", desc: "Competences, leadership, culture, RH, psychologie" },
];

const TP_SOURCES = [
  { name: "Fondamental", count: 12, total: 232, color: "bg-violet-500", desc: "Elements de base du framework GHML — les 12 briques fondatrices" },
  { name: "CREDO", count: 119, total: 232, color: "bg-blue-500", desc: "Elements derives du cycle CREDO — 5 phases x ~24 elements chacune" },
  { name: "Orbit9", count: 101, total: 232, color: "bg-emerald-500", desc: "Elements du moteur de developpement economique — 5 parties" },
];

const TP_FONDAMENTAUX = [
  { symbol: "Li", name: "Lien Initial", group: "H", period: 1, valence: 3, coefficient: 1.0, agent: "BCO", phase: "C", desc: "Premier contact, creation du rapport de confiance" },
  { symbol: "Vc", name: "Vision Claire", group: "P", period: 1, valence: 4, coefficient: 1.2, agent: "BCO", phase: "C", desc: "Comprehension nette de la situation et des objectifs" },
  { symbol: "Jm", name: "Jugement Munger", group: "P", period: 1, valence: 5, coefficient: 1.5, agent: "BCF", phase: "R", desc: "Modeles mentaux inverses — penser a l'envers pour trouver la verite" },
  { symbol: "Cp", name: "Comprehension Profonde", group: "H", period: 1, valence: 4, coefficient: 1.3, agent: "BCO", phase: "R", desc: "Diagnostic en profondeur, au-dela des symptomes" },
  { symbol: "Mf", name: "Modele Financier", group: "T", period: 2, valence: 6, coefficient: 1.8, agent: "BCF", phase: "R", desc: "Analyse financiere structuree, ratios, projections" },
  { symbol: "Au", name: "Autorite Sectorielle", group: "S", period: 2, valence: 3, coefficient: 1.4, agent: "BCS", phase: "E", desc: "Expertise reconnue dans le secteur d'activite" },
  { symbol: "Nt", name: "Narratif Transformateur", group: "H", period: 2, valence: 4, coefficient: 1.6, agent: "BCM", phase: "E", desc: "Storytelling qui transforme la perception du possible" },
  { symbol: "Ro", name: "ROI Observable", group: "T", period: 3, valence: 5, coefficient: 2.0, agent: "BCF", phase: "D", desc: "Retour sur investissement mesurable et demontrable" },
  { symbol: "Sb", name: "Social Proof Business", group: "P", period: 3, valence: 3, coefficient: 1.7, agent: "BCS", phase: "D", desc: "Preuves sociales, cas clients, temoignages" },
  { symbol: "Cr", name: "Closing Resilient", group: "P", period: 3, valence: 4, coefficient: 1.9, agent: "BCS", phase: "O", desc: "Conclusion qui resiste aux objections et au temps" },
  { symbol: "Co", name: "Continuite Operationnelle", group: "T", period: 3, valence: 5, coefficient: 1.5, agent: "BOO", phase: "O", desc: "Suivi post-decision, execution, next steps concrets" },
  { symbol: "Ep", name: "Evolution Perpetuelle", group: "H", period: 4, valence: 6, coefficient: 2.2, agent: "BCO", phase: "O", desc: "Amelioration continue, cycle iteratif, spirale ascendante" },
];

const TP_CREDO_PHASES = [
  { phase: "C", name: "Connecter", count: 24, color: "bg-blue-500", pages: "P1-P24", examples: "Li (Lien Initial), Vc (Vision Claire), Ec (Ecoute Active)" },
  { phase: "R", name: "Rechercher", count: 26, color: "bg-violet-500", pages: "P25-P50", examples: "Jm (Jugement Munger), Cp (Comprehension Profonde), Dg (Diagnostic)" },
  { phase: "E", name: "Exposer", count: 24, color: "bg-amber-500", pages: "P51-P74", examples: "Au (Autorite Sectorielle), Nt (Narratif Transformateur), Rv (Revelation)" },
  { phase: "D", name: "Demontrer", count: 23, color: "bg-emerald-500", pages: "P75-P97", examples: "Ro (ROI Observable), Sb (Social Proof), Vl (Validation)" },
  { phase: "O", name: "Obtenir", count: 22, color: "bg-green-600", pages: "P98-P119", examples: "Cr (Closing Resilient), Co (Continuite), Ep (Evolution Perpetuelle)" },
];

const TP_ORBIT9_PARTS = [
  { part: "Partie 1", name: "Diagnostic Individuel", count: 22, desc: "Evaluation VITAA de chaque membre, profil competences, Triangle du Feu" },
  { part: "Partie 2", name: "Cartographie Reseau", count: 21, desc: "Mapping des connexions, noeuds strategiques, flux de valeur" },
  { part: "Partie 3", name: "Matching & Jumelage", count: 20, desc: "Scoring de compatibilite, vecteurs trisociatifs, anti-cartel" },
  { part: "Partie 4", name: "Cellules & Collaboration", count: 19, desc: "Formation de cellules, gouvernance, objectifs partages" },
  { part: "Partie 5", name: "Croissance & Scale", count: 19, desc: "Metriques de croissance, replication, 9 vers 81" },
];

const TP_BREAKTHROUGH = [
  { symbol: "Qb", name: "Quantum Breakthrough", period: "P6", group: "T", desc: "Elements emergents a la frontiere de l'innovation — potentiel non lineaire" },
  { symbol: "Sy", name: "Synergie Emergente", period: "P6", group: "P", desc: "Patterns qui n'existent que dans la combinaison — plus que la somme des parties" },
  { symbol: "Mx", name: "Meta-Experience", period: "P7", group: "H", desc: "Sagesse accumulee qui transcende les categories — intuition expert" },
  { symbol: "Fx", name: "Fractale Expansive", period: "P7", group: "S", desc: "Structures auto-similaires a toutes les echelles — du micro au macro" },
  { symbol: "Om", name: "Omega Point", period: "P7", group: "T", desc: "Convergence ultime des vecteurs — l'attractor du systeme" },
];

const TP_MECHANISMS = [
  {
    name: "Poids (coefficient)",
    desc: "Chaque element a un coefficient de 0.5 a 3.0 qui determine son influence dans les calculs de scoring. Les elements fondamentaux ont des coefficients plus eleves.",
    formula: "Score = somme(element.valence x element.coefficient)",
  },
  {
    name: "Promotion d'etat",
    desc: "Un element peut changer d'etat: Gaz (hypothese) vers Liquide (en validation) vers Solide (valide). La promotion est declenchee par l'accumulation de preuves.",
    formula: "Etat = f(preuves, temps, validations)",
  },
  {
    name: "Reactions naturelles",
    desc: "Certains elements reagissent naturellement ensemble, creant des composes plus puissants. Ex: Li + Vc = Rapport de Confiance Eclaire.",
    formula: "Compose = Element_A + Element_B + Catalyseur(G9)",
  },
  {
    name: "Structure fractale",
    desc: "Le Tableau Periodique se repete a toutes les echelles: individu, equipe, departement, entreprise, reseau. Meme structure, meme logique.",
    formula: "TP(n) = TP(n-1) x scale_factor",
  },
];

// =================================================================
// DATA — Frameworks
// =================================================================

const FRAMEWORKS_BUSINESS = [
  {
    name: "Razor & Blade",
    status: "actif" as const,
    desc: "Modele de monetisation: Solo a 500$/mois + 195$/bot additionnel. Comme Gillette: le rasoir (CarlOS) est l'entree, les lames (bots specialises) sont le revenu recurrent.",
    details: ["Solo: 500$/mois (CarlOS + 1 bot)", "Chaque bot additionnel: 195$/mois", "Equipe complete 12 bots: ~2,645$/mois", "Marge cible: 80%+ (cout IA ~2$/jour)"],
  },
  {
    name: "SMART/CPRJ",
    status: "actif" as const,
    desc: "Structure de projet en 6 sections: S00 Meta, S01 Contexte, S02 Problematique, S03 Ressources, S04 Jalons, S05 Suivi. Chaque mission COMMAND suit cette structure.",
    details: ["S00 Meta: identifiant, date, responsable", "S01 Contexte: situation actuelle", "S02 Problematique: enjeux et obstacles", "S03 Ressources: budget, equipe, outils", "S04 Jalons: etapes et deadlines", "S05 Suivi: KPIs et metriques"],
  },
  {
    name: "LEGACY Module",
    status: "planifie" as const,
    desc: "Heritage cognitif: le systeme apprend et preserve les patterns de decision de chaque utilisateur. 5 sous-composants pour la memoire institutionnelle.",
    details: ["Decision Patterns: historique des choix", "Preference Learning: style de communication", "Knowledge Graph: connexions entre concepts", "Institutional Memory: decisions passees", "Cognitive Fingerprint: profil unique"],
  },
  {
    name: "GPI-50",
    status: "conceptuel" as const,
    desc: "GhostX Performance Index: benchmark base sur 50 entreprises publiques. Permet de comparer les metriques d'une PME aux standards de l'industrie.",
    details: ["50 entreprises publiques comme reference", "Metriques par secteur et par taille", "Scoring relatif vs absolus", "Mise a jour trimestrielle"],
  },
];

const INTERRELATION_FLOWS = [
  { theme: "Cycle Conversationnel", desc: "CREDO (L1) orchestre le flux: Connecter vers Rechercher vers Exposer vers Demontrer vers Obtenir. Chaque message est classifie dans une phase.", color: "bg-blue-100 text-blue-700" },
  { theme: "Fondation GHML", desc: "Le Tableau Periodique (232 elements) fournit le vocabulaire. Les elements sont actives selon le contexte de la conversation.", color: "bg-violet-100 text-violet-700" },
  { theme: "Diagnostic", desc: "VITAA + Triangle du Feu + Bilan de Sante convergent pour evaluer l'etat de l'entreprise. Le diagnostic alimente le routage et les recommandations.", color: "bg-emerald-100 text-emerald-700" },
  { theme: "Orchestration", desc: "Chef d'Orchestre (CarlOS) + Trisociation + 8+1 Modes. L'equipe est assemblee dynamiquement selon le besoin detecte.", color: "bg-amber-100 text-amber-700" },
  { theme: "Protection", desc: "VERITE + Sentinel + Jargon Invisible. Triple couche de protection: anti-hallucination, surveillance, invisibilite technique.", color: "bg-red-100 text-red-700" },
  { theme: "Gouvernance", desc: "Decision Log + COMMAND + Permission Codes. Tracabilite complete, execution structuree, controle d'acces granulaire.", color: "bg-indigo-100 text-indigo-700" },
  { theme: "Optimisation Couts", desc: "5-Tier Routing + Budget Tracker + Prompt Caching. 80%+ sur tiers gratuits, budget max $5/jour, 90% savings sur SOUL templates.", color: "bg-pink-100 text-pink-700" },
];

// =================================================================
// DATA — Glossaire
// =================================================================

const RENAMED_TERMS = [
  { old: "BTML", new_term: "GHML", note: "Renommage marque, pas code — sprint dedie en attente (~100 remplacements, 8 fichiers)" },
  { old: "AIAVT", new_term: "VITAA", note: "Meme acronyme, ordre different pour la marque (Vente, Idee, Temps, Argent, Actif)" },
  { old: "Brain Team", new_term: "GhostX Team", note: "Renommage de la marque equipe — 12 bots C-Level + CEO CarlOS" },
  { old: "BCC (Catherine/CCO)", new_term: "SUPPRIME", note: "Intrus, jamais dans la plateforme — glisse via consolidations" },
  { old: "BPO (Philippe/CPO)", new_term: "SUPPRIME", note: "Intrus, jamais dans la plateforme — glisse via consolidations" },
  { old: "CIO (Isabelle)", new_term: "CINO (Ines)", note: "Renomme Session 42 — cino-ines-standby-v3.png" },
  { old: "8 Modes", new_term: "8+1 Modes", note: "+1 = CREDO permanent en arriere-plan, toujours actif" },
  { old: "Twilio", new_term: "Telnyx", note: "Migration telephonie D-097 — bridge_telnyx.py pret, en attente credentials" },
];

// =================================================================
// TAB 1 — FONDATIONS
// =================================================================

function TabFondations() {
  return (
    <>
      {/* 1.1 — GHML en Bref */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">1.1 GHML en Bref</h3>

        <Card className="p-5 bg-gradient-to-br from-violet-50 to-white border border-violet-100 shadow-sm mb-3">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-violet-800 italic">"La chimie modelise la matiere. GHML modelise l'intelligence d'affaires."</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">4</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Groupes</div>
              <div className="text-[9px] text-gray-400 mt-0.5">S / P / T / H</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">7</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Periodes</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Fondamental a emergent</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">232</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Elements</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Proprietaires</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-violet-100">
              <div className="text-xl font-bold text-violet-700">3</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Etats matiere</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Solide / Liquide / Gaz</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Solide (Fondamental)</div>
            <p className="text-[9px] text-gray-500">Elements valides, stables, testes. Le socle sur lequel tout repose.</p>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Liquide (Adaptable)</div>
            <p className="text-[9px] text-gray-500">Elements en transition, hypotheses en validation. Flexibles mais structures.</p>
          </Card>
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-1">Gazeux (Emergent)</div>
            <p className="text-[9px] text-gray-500">Intuitions, insights non valides. Le terrain d'exploration et d'innovation.</p>
          </Card>
        </div>

        <Card className="p-3 bg-gray-50 border border-gray-100 mt-3">
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-600">
              <span className="font-bold">Jargon INVISIBLE:</span> L'utilisateur ne voit JAMAIS les termes CREDO, AIAVT, pilier, Tableau Periodique, GHML, phase C/R/E/D/O, Gaz/Liquide/Solide. Ces concepts guident la reflexion INTERNE des Bots.
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* 1.2 — CREDO — Protocole Maitre */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">1.2 CREDO — Protocole Maitre</h3>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {CREDO_PHASES.map((phase, i) => (
              <div key={phase.letter} className="flex items-center gap-2">
                <div className="text-center">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg", phase.color)}>
                    {phase.letter}
                  </div>
                  <div className="text-[9px] font-bold text-gray-700 mt-1">{phase.name}</div>
                </div>
                {i < CREDO_PHASES.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {CREDO_PHASES.map((phase) => (
              <div key={phase.letter} className={cn("flex items-center gap-3 py-2 px-3 rounded-lg", phase.lightBg)}>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0", phase.color)}>
                  {phase.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("text-xs font-bold", phase.textColor)}>{phase.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{phase.desc}</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-[9px] text-gray-500">
                  <span>Bouche: {phase.bouche}</span>
                  <span>Cerveau: {phase.cerveau}</span>
                  <span>Coeur: {phase.coeur}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3 bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-blue-800">3 Couches simultanees</div>
                <div className="text-[9px] text-blue-600 mt-0.5">Bouche (Vente) + Cerveau (Idees) + Coeur (Coaching). Les 3 tournent en parallele a chaque message.</div>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-violet-50 border border-violet-100">
            <div className="flex items-start gap-2">
              <Brain className="h-3.5 w-3.5 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-violet-800">CREDO = protocole MAITRE</div>
                <div className="text-[9px] text-violet-600 mt-0.5">Les modes de reflexion sont des outils DANS CREDO, pas l'inverse. CREDO gouverne tout.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* 1.3 — VITAA / AIAVT */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">1.3 VITAA / AIAVT — 5 Piliers de Scoring</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {VITAA_PILLARS.map((pillar) => (
            <Card key={pillar.name} className={cn("p-3 text-center border", pillar.bg, pillar.border)}>
              <div className={cn("text-2xl font-bold", pillar.color)}>{pillar.letter}</div>
              <div className={cn("text-xs font-bold mt-0.5", pillar.color)}>{pillar.name}</div>
              <div className="text-[9px] text-gray-500 mt-1">{pillar.desc}</div>
              <div className="text-[9px] text-gray-400 mt-0.5 font-mono">0-100</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 1.4 — Triangle du Feu */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">1.4 Triangle du Feu</h3>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <Flame className="h-4 w-4 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-red-700">BRULE</div>
              <div className="text-xs font-medium text-red-600 mt-1">3+ piliers actifs</div>
              <p className="text-[9px] text-gray-500 mt-2">L'entreprise est en mouvement. Energie, dynamisme, les fondations supportent la croissance.</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-4 h-4 rounded-full bg-amber-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-amber-700">COUVE</div>
              <div className="text-xs font-medium text-amber-600 mt-1">2 piliers actifs</div>
              <p className="text-[9px] text-gray-500 mt-2">Potentiel present mais stagnation. Le feu existe mais ne prend pas. Intervention ciblee necessaire.</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-4 h-4 rounded-full bg-gray-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-600">MEURT</div>
              <div className="text-xs font-medium text-gray-500 mt-1">0-1 pilier actif</div>
              <p className="text-[9px] text-gray-500 mt-2">Intervention urgente requise. Sans piliers actifs, l'entreprise s'eteint. Plan de relance immediat.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500">Le diagnostic croise les 5 piliers VITAA pour determiner l'etat du feu. Double Diagnostic: Timbre Savoir (competences) + Timbre Valeur (creation de valeur). Calibration Herrmann 4 couleurs integree.</p>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* 1.5 — Tesla G9 — Catalyseur Constant */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">1.5 Tesla G9 — Catalyseur Constant</h3>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-amber-800 italic">"Si vous connaissiez la magnificence du 3, 6, 9, vous auriez la cle de l'univers."</p>
            <p className="text-[9px] text-gray-400 mt-1">-- Nikola Tesla (G9, Catalyseur Constant)</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">3</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">Energie</div>
              <div className="text-[9px] text-gray-500">3 OS par Trisociation</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">6</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">Frequence</div>
              <div className="text-[9px] text-gray-500">6 Bots C-Level (noyau)</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">9</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">Vibration</div>
              <div className="text-[9px] text-gray-500">G9 Tesla, catalyseur constant</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-600">Amplificateur universel dans toutes les formules Trisociatives: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">Gh(X·Y·Z)STX</code> -- le T = Tesla, toujours present</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-600">Nombre d'or (phi = 1.618) sert de seuil de bifurcation: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[9px]">TT_Valeur = TT_Input x (1+C_cat) x phi^(n x eta)</code></span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-gray-600">3 modes de depart: STARTUP (3, Energie, 80/20 explore) | SCALEUP (6, Frequence, 38/62) | EXITUP (9, Vibration, 20/80 exploit)</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="h-4" />
    </>
  );
}

// =================================================================
// TAB 2 — AGENTS & GHOSTS
// =================================================================

function TabAgentsGhosts() {
  return (
    <>
      {/* 2.1 — Les 12 Ghosts Definitifs */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">2.1 Les 12 Ghosts Definitifs (V1.1)</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {GHOSTS.map((ghost) => (
            <Card key={ghost.id} className="p-3 bg-white border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0", ghost.color)}>
                  {ghost.id}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{ghost.name}</div>
                  <div className="text-[9px] text-gray-400">{ghost.archetype}</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500">{ghost.specialty}</div>
              {ghost.id === "G9" && (
                <Badge variant="outline" className="text-[9px] font-bold text-violet-600 border-violet-300 mt-1.5">CATALYSEUR CONSTANT</Badge>
              )}
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 2.2 — Trisociation */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">2.2 Trisociation — Gh(X·Y·Z)STX</h3>

        <Card className="p-4 bg-violet-50 border border-violet-100 mb-3">
          <div className="text-center mb-3">
            <code className="text-sm font-mono font-bold text-violet-800 bg-white px-3 py-1 rounded-lg border border-violet-200">Gh(X·Y·Z)STX</code>
            <p className="text-[9px] text-violet-600 mt-2">3 Ghosts combines par bot: Primaire (OS dominant) + Calibrateur (stabilisateur) + Amplificateur (boost)</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-violet-200">
              <div className="text-xs font-bold text-violet-700">Primaire</div>
              <div className="text-[9px] text-gray-500">OS dominant</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-violet-200">
              <div className="text-xs font-bold text-violet-700">Calibrateur</div>
              <div className="text-[9px] text-gray-500">Stabilisateur</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-violet-200">
              <div className="text-xs font-bold text-violet-700">Amplificateur</div>
              <div className="text-[9px] text-gray-500">Boost contextuel</div>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          {TRISOCIATION_EXAMPLES.map((t) => (
            <div key={t.code} className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg border border-gray-100">
              <Badge variant="outline" className="text-[9px] font-bold min-w-[36px] text-center">{t.code}</Badge>
              <span className="text-xs font-medium text-gray-700 min-w-[30px]">{t.role}</span>
              <code className="text-[9px] font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded">{t.formula}</code>
              <span className="text-[9px] text-gray-500 hidden md:inline">
                {t.primaire} + {t.calibrateur} + {t.amplificateur}
              </span>
              <span className="text-[9px] font-medium text-gray-400 ml-auto italic">{t.resultat}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 2.3 — 8+1 Modes de Reflexion */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">2.3 8+1 Modes de Reflexion</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          {REFLECTION_MODES.map((mode) => {
            const MIcon = mode.icon;
            return (
              <div key={mode.num} className="flex items-center gap-3 py-2.5 px-3 bg-white rounded-lg border border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <MIcon className={cn("h-3.5 w-3.5", mode.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-gray-400">{mode.num}.</span>
                    <span className="text-xs font-bold text-gray-700">{mode.name}</span>
                  </div>
                  <div className="text-[9px] text-gray-500">{mode.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <Card className="p-3 bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-800">+1: CREDO (mode integre permanent)</span>
              <span className="text-[9px] text-emerald-600 ml-2">Toujours actif en arriere-plan. Les 8 modes sont des outils utilises a l'interieur du cycle CREDO.</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* 2.4 — 4 Quadrants Herrmann x 12 Bots */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">2.4 Quadrants Herrmann x 12 Bots</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HERRMANN_QUADRANTS.map((q) => (
            <Card key={q.quadrant} className={cn("p-4 border", q.lightBg)}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm", q.color)}>
                  {q.quadrant}
                </div>
                <div>
                  <div className={cn("text-xs font-bold", q.textColor)}>{q.name}</div>
                  <div className="text-[9px] text-gray-500">{q.desc}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {q.bots.map((bot) => (
                  <span key={bot} className="text-[9px] px-2 py-0.5 rounded-full bg-white text-gray-600 font-medium border border-gray-200">
                    {bot}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 2.5 — Application dans les Rooms */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">2.5 Application dans les Rooms</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <div className="text-xs font-bold text-gray-800">Board Room</div>
            </div>
            <p className="text-[9px] text-gray-500 mb-2">Gouvernance et decisions strategiques. Les Ghosts agissent comme un conseil d'administration virtuel.</p>
            <div className="text-[9px] text-gray-400">Modes dominants: Decision, Strategie, Deep Resonance</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="h-4 w-4 text-red-500" />
              <div className="text-xs font-bold text-gray-800">War Room</div>
            </div>
            <p className="text-[9px] text-gray-500 mb-2">Situations de crise et competition. Analyse tactique rapide avec execution immediate.</p>
            <div className="text-[9px] text-gray-400">Modes dominants: Crise, Debat, Analyse</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-violet-500" />
              <div className="text-xs font-bold text-gray-800">Think Room</div>
            </div>
            <p className="text-[9px] text-gray-500 mb-2">Exploration et innovation. Espace de reflexion libre avec les 12 Ghosts en mode brainstorm.</p>
            <div className="text-[9px] text-gray-400">Modes dominants: Brainstorm, Innovation, Deep Resonance</div>
          </Card>
        </div>
      </div>

      <div className="h-4" />
    </>
  );
}

// =================================================================
// TAB 3 — PROTOCOLES
// =================================================================

function TabProtocoles() {
  return (
    <>
      {/* 3.1 — Vue d'ensemble */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.1 Vue d'ensemble</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Protocoles", value: "85+", color: "text-violet-700" },
            { label: "Modes", value: "12", color: "text-blue-700" },
            { label: "Ghosts", value: "12", color: "text-emerald-700" },
            { label: "Endpoints", value: "128", color: "text-amber-700" },
            { label: "Frameworks", value: "8", color: "text-red-700" },
            { label: "SOULs", value: "14", color: "text-indigo-700" },
            { label: "Elements", value: "232", color: "text-pink-700" },
            { label: "Triades", value: "6,545", color: "text-teal-700" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 text-center bg-white border border-gray-100">
              <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 3.2 — Protocoles Maitres Level 1 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.2 Protocoles Maitres — Level 1</h3>

        <div className="space-y-3">
          {PROTOCOLES_MAITRES.map((proto) => (
            <Card key={proto.name} className={cn("p-4 bg-white border border-gray-100 shadow-sm border-l-4", proto.color)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-gray-800">{proto.name}</span>
                <Badge variant="outline" className="text-[9px] font-bold">{proto.level}</Badge>
                <StatusBadge status={proto.status} />
              </div>
              <p className="text-xs text-gray-600 mb-3">{proto.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {proto.details.map((detail) => (
                  <span key={detail} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {detail}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 3.3 — Routage Level 3 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.3 Routage — Level 3</h3>

        {/* 5-Tier with progress bars */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-800">5-Tier Routing</span>
            <StatusBadge status="actif" />
          </div>
          <p className="text-xs text-gray-500 mb-4">Distribution cible: 80%+ sur tiers gratuits, budget max $5/jour</p>

          <div className="space-y-2.5">
            {PROTOCOLES_ROUTAGE[0].tiers?.map((t) => (
              <div key={t.tier} className="flex items-center gap-3">
                <div className={cn("text-white font-bold text-[9px] px-2 py-0.5 rounded min-w-[28px] text-center", t.color)}>
                  {t.tier}
                </div>
                <span className="text-xs text-gray-700 min-w-[100px]">{t.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={cn("h-full rounded-full", t.color)} style={{ width: `${t.pct}%` }} />
                </div>
                <span className="text-[9px] font-bold text-gray-600 min-w-[32px] text-right">{t.pct}%</span>
                <span className="text-[9px] text-gray-400 min-w-[60px] text-right">{t.cost}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Other routage protocols */}
        <div className="space-y-2">
          {PROTOCOLES_ROUTAGE.slice(1).map((proto) => (
            <Card key={proto.name} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-800">{proto.name}</span>
                <StatusBadge status={proto.status} />
              </div>
              <p className="text-[9px] text-gray-500">{proto.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 3.4 — Communication Level 4 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.4 Communication — Level 4</h3>

        <div className="space-y-2">
          {PROTOCOLES_COMMUNICATION.map((proto) => (
            <Card key={proto.name} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-800">{proto.name}</span>
                <StatusBadge status={proto.status} />
              </div>
              <p className="text-[9px] text-gray-500">{proto.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 3.5 — Diagnostic Level 5 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.5 Diagnostic — Level 5</h3>

        <div className="space-y-2">
          {PROTOCOLES_DIAGNOSTIC.map((proto) => (
            <Card key={proto.name} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-800">{proto.name}</span>
                <StatusBadge status={proto.status} />
              </div>
              <p className="text-[9px] text-gray-500">{proto.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 3.6 — Economie Level 6 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">3.6 Economie — Level 6</h3>

        <div className="space-y-2">
          {PROTOCOLES_ECONOMIE.map((proto) => (
            <Card key={proto.name} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-800">{proto.name}</span>
                <StatusBadge status={proto.status} />
              </div>
              <p className="text-[9px] text-gray-500">{proto.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </>
  );
}

// =================================================================
// TAB 4 — TABLEAU PERIODIQUE
// =================================================================

function TabTableauPeriodique() {
  return (
    <>
      {/* 4.1 — Vue d'ensemble */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.1 Vue d'ensemble</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="p-3 text-center bg-white border border-gray-100">
            <div className="text-xl font-bold text-violet-700">232</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Elements</div>
          </Card>
          <Card className="p-3 text-center bg-white border border-gray-100">
            <div className="text-xl font-bold text-violet-700">4</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Groupes</div>
          </Card>
          <Card className="p-3 text-center bg-white border border-gray-100">
            <div className="text-xl font-bold text-violet-700">7</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Periodes</div>
          </Card>
          <Card className="p-3 text-center bg-white border border-gray-100">
            <div className="text-xl font-bold text-violet-700">3</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Etats matiere</div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* 4.2 — 4 Groupes */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.2 Les 4 Groupes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TP_GROUPS.map((g) => (
            <Card key={g.group} className={cn("p-4 border", g.lightBg)}>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg", g.color)}>
                  {g.group}
                </div>
                <div>
                  <div className={cn("text-sm font-bold", g.textColor)}>{g.name}</div>
                  <div className="text-[9px] text-gray-500">{g.count} elements</div>
                </div>
              </div>
              <p className="text-xs text-gray-500">{g.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 4.3 — 3 Sources de distribution */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.3 Distribution par Source</h3>

        <div className="space-y-3">
          {TP_SOURCES.map((source) => (
            <Card key={source.name} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{source.name}</span>
                  <Badge variant="outline" className="text-[9px] font-bold">{source.count} elements</Badge>
                </div>
                <span className="text-xs text-gray-400">{Math.round((source.count / source.total) * 100)}%</span>
              </div>
              <p className="text-[9px] text-gray-500 mb-2">{source.desc}</p>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={cn("h-full rounded-full", source.color)} style={{ width: `${(source.count / source.total) * 100}%` }} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 4.4 — 12 Elements Fondamentaux */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.4 Les 12 Elements Fondamentaux</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TP_FONDAMENTAUX.map((el) => {
            const groupColor = {
              S: "bg-blue-500",
              P: "bg-emerald-500",
              T: "bg-violet-500",
              H: "bg-amber-500",
            }[el.group] || "bg-gray-500";

            const phaseColor = {
              C: "text-blue-600",
              R: "text-violet-600",
              E: "text-amber-600",
              D: "text-emerald-600",
              O: "text-green-600",
            }[el.phase] || "text-gray-600";

            return (
              <Card key={el.symbol} className="p-3 bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0", groupColor)}>
                    {el.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-800">{el.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-gray-400">Groupe {el.group}</span>
                      <span className="text-[9px] text-gray-400">P{el.period}</span>
                      <span className="text-[9px] text-gray-400">V={el.valence}</span>
                      <span className="text-[9px] text-gray-400">C={el.coefficient}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-gray-400">Agent: {el.agent}</span>
                      <span className={cn("text-[9px] font-bold", phaseColor)}>Phase {el.phase}</span>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-1">{el.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* 4.5 — 119 Elements CREDO par phase */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.5 Elements CREDO — 119 par Phase</h3>

        <div className="space-y-2">
          {TP_CREDO_PHASES.map((phase) => (
            <Card key={phase.phase} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0", phase.color)}>
                  {phase.phase}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">{phase.name}</span>
                    <Badge variant="outline" className="text-[9px] font-bold">{phase.count} elements</Badge>
                    <span className="text-[9px] text-gray-400">{phase.pages}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Ex: {phase.examples}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 4.6 — 101 Elements Orbit9 par partie */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.6 Elements Orbit9 — 101 par Partie</h3>

        <div className="space-y-2">
          {TP_ORBIT9_PARTS.map((part) => (
            <Card key={part.part} className="p-3 bg-white border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-emerald-700">{part.count}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">{part.part}: {part.name}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{part.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 4.7 — Breakthrough Elements P6-P7 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.7 Breakthrough Elements — P6/P7</h3>

        <Card className="p-4 bg-gradient-to-br from-violet-50 to-white border border-violet-100 shadow-sm mb-3">
          <p className="text-xs text-violet-600 mb-3">Elements emergents aux periodes 6 et 7 — a la frontiere de l'innovation et de l'inconnu</p>

          <div className="space-y-2">
            {TP_BREAKTHROUGH.map((el) => {
              const groupColor = {
                S: "bg-blue-500",
                P: "bg-emerald-500",
                T: "bg-violet-500",
                H: "bg-amber-500",
              }[el.group] || "bg-gray-500";

              return (
                <div key={el.symbol} className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg border border-violet-100">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0", groupColor)}>
                    {el.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">{el.name}</span>
                      <span className="text-[9px] text-gray-400">{el.period} / Groupe {el.group}</span>
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{el.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* 4.8 — Mecanismes */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">4.8 Mecanismes du Tableau Periodique</h3>

        <div className="space-y-3">
          {TP_MECHANISMS.map((mech) => (
            <Card key={mech.name} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-800 mb-1">{mech.name}</div>
              <p className="text-[9px] text-gray-500 mb-2">{mech.desc}</p>
              <div className="bg-gray-50 rounded-lg p-2">
                <code className="text-[9px] font-mono text-violet-600">{mech.formula}</code>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </>
  );
}

// =================================================================
// TAB 5 — FRAMEWORKS
// =================================================================

function TabFrameworks() {
  return (
    <>
      {/* 5.1 — Frameworks Business Level 7 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">5.1 Frameworks Business — Level 7</h3>

        <div className="space-y-3">
          {FRAMEWORKS_BUSINESS.map((fw) => (
            <Card key={fw.name} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-gray-800">{fw.name}</span>
                <StatusBadge status={fw.status} />
              </div>
              <p className="text-xs text-gray-600 mb-3">{fw.desc}</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-1.5">
                  {fw.details.map((detail) => (
                    <div key={detail} className="flex items-start gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* 5.2 — Carte des Interrelations */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">5.2 Carte des Interrelations</h3>
        <p className="text-xs text-gray-400 mb-3">7 themes de flux qui connectent tous les protocoles et frameworks entre eux</p>

        <div className="space-y-2">
          {INTERRELATION_FLOWS.map((flow) => (
            <Card key={flow.theme} className="p-3 bg-white border border-gray-100">
              <div className="flex items-start gap-3">
                <span className={cn("text-[9px] font-bold px-2 py-1 rounded shrink-0", flow.color)}>
                  {flow.theme}
                </span>
                <p className="text-[9px] text-gray-500">{flow.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </>
  );
}

// =================================================================
// TAB 6 — GLOSSAIRE
// =================================================================

function TabGlossaire() {
  return (
    <>
      {/* 6.1 — Termes renommes */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>6.1 Termes Renommes (Historique)</span>
          </span>
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left py-2 pr-3 font-medium">Ancien</th>
                  <th className="text-center py-2 px-2 font-medium w-8"></th>
                  <th className="text-left py-2 px-3 font-medium">Nouveau</th>
                  <th className="text-left py-2 pl-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {RENAMED_TERMS.map((term, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-3">
                      <code className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-mono line-through">{term.old}</code>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 inline-block" />
                    </td>
                    <td className="py-2.5 px-3">
                      {term.new_term === "SUPPRIME" ? (
                        <span className="flex items-center gap-1">
                          <X className="h-3.5 w-3.5 text-red-500" />
                          <code className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">SUPPRIME</code>
                        </span>
                      ) : (
                        <code className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">{term.new_term}</code>
                      )}
                    </td>
                    <td className="py-2.5 pl-3 text-[9px] text-gray-500">{term.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* 6.2 — Dette technique */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.2 Dette Technique — Renommage en Attente</h3>

        <Card className="p-3 bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <span className="font-bold">DETTE TECHNIQUE:</span> Le renommage BTML vers GHML dans le code Python (~100 remplacements, 8 fichiers) est en attente d'un sprint dedie. Les noms de fichiers (btml_primitives.py, bridge_btml_connector.py) NE changent PAS. C'est un changement de MARQUE, pas de CODE.
            </div>
          </div>
        </Card>

        <div className="mt-3 space-y-2">
          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-2">Fichiers affectes</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "tableau_periodique.py (~70)",
                "session_credo.py (~10)",
                "orchestrateur.py (~12)",
                "modes_depart.py (~3)",
                "piliers_aiavt.py (~2)",
                "routeur.py (~1)",
                "message_logger.py (~1)",
                "timetoken.py (~1)",
              ].map((file) => (
                <span key={file} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono">
                  {file}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-3 bg-white border border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-2">Autres nettoyages en attente</div>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-[9px] text-gray-600">Eliminer BCC (~45 occurrences) et BPO (~66 occurrences) — intrus dans le code</span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-[9px] text-gray-600">Nettoyer appellations incoherentes (anciens noms, codes obsoletes, references mortes)</span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-[9px] text-gray-600">Refonte nomenclature bot codes (BCO vers CEOB etc.) — sprint separe futur</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* 6.3 — Footer stats */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">6.3 Statistiques Globales</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 text-center bg-emerald-50 border border-emerald-200">
            <div className="text-xl font-bold text-emerald-700">45+</div>
            <div className="text-[9px] text-emerald-600 uppercase tracking-wide mt-0.5">Protocoles actifs</div>
          </Card>
          <Card className="p-3 text-center bg-amber-50 border border-amber-200">
            <div className="text-xl font-bold text-amber-700">12</div>
            <div className="text-[9px] text-amber-600 uppercase tracking-wide mt-0.5">Partiels</div>
          </Card>
          <Card className="p-3 text-center bg-blue-50 border border-blue-200">
            <div className="text-xl font-bold text-blue-700">15+</div>
            <div className="text-[9px] text-blue-600 uppercase tracking-wide mt-0.5">Planifies</div>
          </Card>
          <Card className="p-3 text-center bg-gray-50 border border-gray-200">
            <div className="text-xl font-bold text-gray-600">13+</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Conceptuels</div>
          </Card>
        </div>
      </div>

      <div className="h-4" />
    </>
  );
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export function BibleGHMLPage() {
  const [tab, setTab] = useState("fondations");
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Atom}
          iconColor="text-violet-600"
          title="Bible GHML Complete"
          subtitle="Ghost Modeling Language — Framework proprietaire complet"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    tab === t.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </>
          }
        />
      }
    >
      {tab === "fondations" && <TabFondations />}
      {tab === "agents-ghosts" && <TabAgentsGhosts />}
      {tab === "protocoles" && <TabProtocoles />}
      {tab === "tableau-periodique" && <TabTableauPeriodique />}
      {tab === "frameworks" && <TabFrameworks />}
      {tab === "glossaire" && <TabGlossaire />}
    </PageLayout>
  );
}
