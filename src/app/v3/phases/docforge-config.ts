/**
 * docforge-config.ts — Configuration DocForge (donnees pures)
 *
 * L2_THEMES: 4 palettes couleur (amber/teal/blue/violet) avec 14 tokens Tailwind
 * 5 configs de sections: Document, Tableur, Presentation, Code, Jumelage
 * DOCFORGE_CONFIGS: mapping type -> { sections, theme, icon, title }
 *
 * Source: SimAmorcer L4185-4236 (porte pour le live)
 */

import {
  FileText, BarChart3, Activity, Target, Stethoscope, Wrench,
  DollarSign, Calendar, TrendingUp, CheckCircle2, Shield,
  Table2, Database, ListChecks, LineChart, ArrowRight,
  AlertTriangle, Compass, Palette,
  Code2, Bug, FlaskConical, Rocket,
  Filter, Search, Video, Trophy,
  ClipboardList,
} from "lucide-react";

// ═══ L2 Themes — 4 palettes × 14 tokens ═══

export const L2_THEMES = {
  amber: {
    bgLight: "bg-amber-50", border: "border-amber-200", text: "text-amber-700",
    dot: "bg-amber-500", progressBg: "bg-amber-100", progressFill: "bg-amber-400",
    heroBlur1: "bg-amber-100/70", heroBlur2: "bg-yellow-100/40", iconColor: "text-amber-500",
    validBg: "bg-amber-50", validText: "text-amber-600", borderLeft: "border-amber-400",
    sectionBg: "bg-amber-50/50",
  },
  teal: {
    bgLight: "bg-teal-50", border: "border-teal-200", text: "text-teal-700",
    dot: "bg-teal-500", progressBg: "bg-teal-100", progressFill: "bg-teal-400",
    heroBlur1: "bg-teal-100/70", heroBlur2: "bg-cyan-100/40", iconColor: "text-teal-500",
    validBg: "bg-teal-50", validText: "text-teal-600", borderLeft: "border-teal-400",
    sectionBg: "bg-teal-50/50",
  },
  blue: {
    bgLight: "bg-blue-50", border: "border-blue-200", text: "text-blue-700",
    dot: "bg-blue-500", progressBg: "bg-blue-100", progressFill: "bg-blue-400",
    heroBlur1: "bg-blue-100/70", heroBlur2: "bg-indigo-100/40", iconColor: "text-blue-500",
    validBg: "bg-blue-50", validText: "text-blue-600", borderLeft: "border-blue-400",
    sectionBg: "bg-blue-50/50",
  },
  violet: {
    bgLight: "bg-violet-50", border: "border-violet-200", text: "text-violet-700",
    dot: "bg-violet-500", progressBg: "bg-violet-100", progressFill: "bg-violet-400",
    heroBlur1: "bg-violet-100/70", heroBlur2: "bg-purple-100/40", iconColor: "text-violet-500",
    validBg: "bg-violet-50", validText: "text-violet-600", borderLeft: "border-violet-400",
    sectionBg: "bg-violet-50/50",
  },
} as const;

export type L2Theme = typeof L2_THEMES.amber;

// ═══ Section interface DocForge ═══

export interface DocForgeSection {
  id: number;
  title: string;
  icon: React.ElementType;
  sectionId: string;
  prompt: string;
}

// ═══ 5 configs de sections ═══

export const DOCUMENT_SECTIONS: DocForgeSection[] = [
  { id: 1, title: "Introduction et mandat", icon: FileText, sectionId: "docforge-document-intro", prompt: "Redige l'introduction et le mandat du document." },
  { id: 2, title: "Sommaire executif", icon: BarChart3, sectionId: "docforge-document-sommaire", prompt: "Prepare un sommaire executif structure." },
  { id: 3, title: "Profil entreprise", icon: Activity, sectionId: "docforge-document-profil", prompt: "Decris le profil de l'entreprise et son contexte." },
  { id: 4, title: "Cahier des charges", icon: Target, sectionId: "docforge-document-cahier", prompt: "Elabore le cahier des charges detaille." },
  { id: 5, title: "Diagnostic multi-axe", icon: Stethoscope, sectionId: "docforge-document-diagnostic", prompt: "Fais un diagnostic multi-axe complet." },
  { id: 6, title: "Solutions recommandees", icon: Wrench, sectionId: "docforge-document-solutions", prompt: "Propose les solutions recommandees avec justification." },
  { id: 7, title: "Budget et financement", icon: DollarSign, sectionId: "docforge-document-budget", prompt: "Detaille le budget et les options de financement." },
  { id: 8, title: "Plan d'implantation", icon: Calendar, sectionId: "docforge-document-plan", prompt: "Elabore le plan d'implantation avec echeancier." },
  { id: 9, title: "KPIs et suivi", icon: TrendingUp, sectionId: "docforge-document-kpis", prompt: "Definis les KPIs et le plan de suivi." },
  { id: 10, title: "Conclusions", icon: CheckCircle2, sectionId: "docforge-document-conclusions", prompt: "Redige les conclusions et recommandations finales." },
  { id: 11, title: "Validation", icon: Shield, sectionId: "docforge-document-validation", prompt: "Prepare la section de validation et approbation." },
];

export const TABLEUR_SECTIONS: DocForgeSection[] = [
  { id: 1, title: "Structure du tableur", icon: Table2, sectionId: "docforge-tableur-structure", prompt: "Definis la structure et les onglets du tableur." },
  { id: 2, title: "Donnees de reference", icon: Database, sectionId: "docforge-tableur-donnees", prompt: "Identifie les donnees de reference necessaires." },
  { id: 3, title: "Projections mensuelles", icon: TrendingUp, sectionId: "docforge-tableur-projections", prompt: "Calcule les projections mensuelles detaillees." },
  { id: 4, title: "Formules & Calculs", icon: ListChecks, sectionId: "docforge-tableur-formules", prompt: "Propose les formules et calculs cles." },
  { id: 5, title: "Graphiques & Tendances", icon: LineChart, sectionId: "docforge-tableur-graphiques", prompt: "Concois les graphiques et visualisations de tendances." },
  { id: 6, title: "Export & Partage", icon: ArrowRight, sectionId: "docforge-tableur-export", prompt: "Prepare les options d'export et partage." },
];

export const PRESENTATION_SECTIONS: DocForgeSection[] = [
  { id: 1, title: "Slide — Enjeu", icon: AlertTriangle, sectionId: "docforge-pres-enjeu", prompt: "Redige le slide d'enjeu principal." },
  { id: 2, title: "Slide — Strategie", icon: Compass, sectionId: "docforge-pres-strategie", prompt: "Elabore le slide de strategie proposee." },
  { id: 3, title: "Slide — Budget & ROI", icon: DollarSign, sectionId: "docforge-pres-budget", prompt: "Prepare le slide budget et retour sur investissement." },
  { id: 4, title: "Slide — Timeline", icon: Calendar, sectionId: "docforge-pres-timeline", prompt: "Concois le slide de timeline d'execution." },
  { id: 5, title: "Design & Visuels", icon: Palette, sectionId: "docforge-pres-design", prompt: "Propose le design et les visuels cles." },
  { id: 6, title: "Notes presentateur", icon: FileText, sectionId: "docforge-pres-notes", prompt: "Redige les notes du presentateur pour chaque slide." },
];

export const CODE_SECTIONS: DocForgeSection[] = [
  { id: 1, title: "Plan & Architecture", icon: FileText, sectionId: "docforge-code-plan", prompt: "Definis le plan et l'architecture technique." },
  { id: 2, title: "Code", icon: Code2, sectionId: "docforge-code-code", prompt: "Genere le code source principal." },
  { id: 3, title: "Debug", icon: Bug, sectionId: "docforge-code-debug", prompt: "Analyse et corrige les bugs potentiels." },
  { id: 4, title: "Tests", icon: FlaskConical, sectionId: "docforge-code-tests", prompt: "Ecris les tests unitaires et d'integration." },
  { id: 5, title: "Deploiement", icon: Rocket, sectionId: "docforge-code-deploy", prompt: "Prepare le plan de deploiement." },
];

export const CPRJ_SECTIONS: DocForgeSection[] = [
  { id: 1, title: "Profil Entreprise & État Actuel",    icon: Activity,      sectionId: "docforge-cprj-profil",      prompt: "Décris le profil de l'entreprise manufacturière: secteur, taille, produits, défis actuels, VITAA." },
  { id: 2, title: "Analyse du Projet & Indice SMART",   icon: Target,        sectionId: "docforge-cprj-projet",      prompt: "Analyse l'objectif du projet: qu'est-ce qu'on veut automatiser, OEE cible, critères SMART." },
  { id: 3, title: "Solutions Recommandées & Scénarios", icon: Wrench,        sectionId: "docforge-cprj-solutions",   prompt: "Propose les solutions technologiques et les scénarios d'automatisation pour ce manufacturier." },
  { id: 4, title: "Budget, ROI & Financement",          icon: DollarSign,    sectionId: "docforge-cprj-budget",      prompt: "Calcule le budget, le ROI et les options de financement (subventions, RS&DE, payback period)." },
  { id: 5, title: "Plan d'Implantation & Échéancier",   icon: Calendar,      sectionId: "docforge-cprj-echeancier",  prompt: "Définis le plan d'implantation par phases, les jalons, l'équipe et les risques." },
  { id: 6, title: "Conclusions & Validation GO/NO-GO",  icon: CheckCircle2,  sectionId: "docforge-cprj-conclusions", prompt: "Rédige les conclusions, la recommandation finale et la grille de décision GO/NO-GO." },
];

export const JUMELAGE_SECTIONS: DocForgeSection[] = [
  { id: 1, title: "Criteres de Matching", icon: Filter, sectionId: "docforge-jumelage-criteres", prompt: "Definis les criteres de matching prioritaires." },
  { id: 2, title: "Scan Reseau", icon: Search, sectionId: "docforge-jumelage-scan", prompt: "Lance un scan du reseau pour les candidats potentiels." },
  { id: 3, title: "Conferences AI", icon: Video, sectionId: "docforge-jumelage-conferences", prompt: "Organise les conferences AI de qualification." },
  { id: 4, title: "Scoring Comparatif", icon: BarChart3, sectionId: "docforge-jumelage-scoring", prompt: "Calcule le scoring comparatif des candidats." },
  { id: 5, title: "Recommandation Finale", icon: Trophy, sectionId: "docforge-jumelage-reco", prompt: "Formule la recommandation finale de jumelage." },
];

// ═══ DOCFORGE_CONFIGS — mapping type -> config complete ═══

export const DOCFORGE_CONFIGS: Record<string, {
  sections: DocForgeSection[];
  theme: L2Theme;
  icon: React.ElementType;
  title: string;
}> = {
  document: { sections: DOCUMENT_SECTIONS, theme: L2_THEMES.amber, icon: FileText, title: "Cahier de projet" },
  spreadsheet: { sections: TABLEUR_SECTIONS, theme: L2_THEMES.teal, icon: Table2, title: "Tableau de bord" },
  presentation: { sections: PRESENTATION_SECTIONS, theme: L2_THEMES.blue, icon: Target, title: "Pitch Deck" },
  code: { sections: CODE_SECTIONS, theme: L2_THEMES.violet, icon: Code2, title: "Dashboard Code" },
  jumelage: { sections: JUMELAGE_SECTIONS, theme: L2_THEMES.amber, icon: Trophy, title: "Jumelage SMART" },
  cprj: { sections: CPRJ_SECTIONS, theme: L2_THEMES.amber, icon: ClipboardList, title: "Cahier de Projet" },
};
