/**
 * MasterFlowsPage.tsx — C.6 Atlas des Flows Utilisateurs CarlOS
 * Toutes les sequences d'etapes (flow charts) de la plateforme
 * 50+ flows avec sous-etapes detaillees
 * Master GHML — Session 47
 */

import {
  GitBranch, ArrowRight, Play, Users, Shield, Zap,
  Brain, Swords, Lightbulb, AlertTriangle, Radio, Bot,
  Target, FileText, Network, Rocket, Clock, CheckCircle2,
  LogIn, UserPlus, Building2, BarChart3, Gauge,
  MessageSquare, Vote, Eye, Flame, Wrench, Phone,
  DollarSign, Search, ClipboardList, Handshake, Factory,
  Video, MapPin, Layers, Briefcase, GraduationCap,
  HeartPulse, Sparkles, CircleDot, Settings, BookOpen,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

function StatusBadge({ status }: { status: "actif" | "partiel" | "planifie" | "conceptuel" }) {
  const styles = {
    actif: "bg-green-50 text-green-700",
    partiel: "bg-amber-50 text-amber-700",
    planifie: "bg-blue-50 text-blue-700",
    conceptuel: "bg-gray-50 text-gray-500",
  };
  const labels = { actif: "Actif", partiel: "Partiel", planifie: "Planifie", conceptuel: "Conceptuel" };
  return <Badge className={cn("text-[9px] font-medium", styles[status])}>{labels[status]}</Badge>;
}

function FlowStep({ label, duration, color = "bg-blue-100 text-blue-700", icon: Icon }: {
  label: string; duration?: string; color?: string; icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1", color)}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      {duration && <span className="text-[9px] text-gray-400">{duration}</span>}
    </div>
  );
}

function FlowArrow() {
  return <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />;
}

function FlowPipeline({ steps }: { steps: { label: string; duration?: string; color?: string; icon?: React.ElementType }[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <FlowArrow />}
          <FlowStep {...step} />
        </div>
      ))}
    </div>
  );
}

function GateBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="h-px flex-1 bg-red-200" />
      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{label}</span>
      <div className="h-px flex-1 bg-red-200" />
    </div>
  );
}

// ======================================================================
// DATA
// ======================================================================

interface FlowDef {
  id: string;
  title: string;
  description: string;
  status: "actif" | "partiel" | "planifie" | "conceptuel";
  steps: { label: string; duration?: string; color?: string; icon?: React.ElementType }[];
  bots?: string[];
  notes?: string;
  gate?: string;
  subFlows?: FlowDef[];
}

// ── SECTION 1: ACCOMPAGNEMENT MAITRE ──

const FLOW_ACCOMPAGNEMENT: FlowDef[] = [
  {
    id: "1.0",
    title: "Protocole d'Accompagnement Maitre",
    description: "Le grand flow — 3 phases, 105 jours (processus manuel — plus rapide avec CarlOS)",
    status: "actif",
    steps: [
      { label: "Phase 1 VIST", color: "bg-blue-100 text-blue-700", icon: Eye, duration: "15j" },
      { label: "Phase 2 JUAN", color: "bg-violet-100 text-violet-700", icon: Handshake, duration: "45j" },
      { label: "Phase 3 CPRJ", color: "bg-green-100 text-green-700", icon: FileText, duration: "60j" },
    ],
    notes: "Chaque phase a un GO/NO-GO — le client decide a chaque gate",
  },
  {
    id: "1.1",
    title: "Phase 1 — Visite SMART (VIST)",
    description: "Diagnostic terrain — visite en personne + rapport d'opportunites",
    status: "actif",
    steps: [
      { label: "Visite presentiel 2h", color: "bg-blue-100 text-blue-700", icon: MapPin },
      { label: "Compilation procedes", color: "bg-indigo-100 text-indigo-700", icon: ClipboardList },
      { label: "Videos/plans/CAD", color: "bg-violet-100 text-violet-700", icon: Video },
      { label: "Estimation 3 projets", color: "bg-amber-100 text-amber-700", icon: Target },
      { label: "Selection 1 projet", color: "bg-orange-100 text-orange-700", icon: CheckCircle2 },
      { label: "Estimation gains", color: "bg-emerald-100 text-emerald-700", icon: DollarSign },
      { label: "Rapport virtuel", color: "bg-green-100 text-green-700", icon: FileText },
    ],
    bots: ["BCO", "BFA", "BOO"],
    gate: "GO / NO-GO → Phase 2",
    notes: "Acteurs: Client + Usine Bleue expert neutre",
  },
  {
    id: "1.2",
    title: "Phase 2 — Jumelage SMART (JUAN)",
    description: "5 sous-processus: mains levees → selection → rencontres → analyse → presentation",
    status: "actif",
    steps: [
      { label: "Mains levees", color: "bg-blue-100 text-blue-700", icon: Users, duration: "S1-2" },
      { label: "Selection TOP 3", color: "bg-indigo-100 text-indigo-700", icon: Target, duration: "S2" },
      { label: "3 Rencontres", color: "bg-violet-100 text-violet-700", icon: Video, duration: "S3" },
      { label: "Analyse projet", color: "bg-amber-100 text-amber-700", icon: Search, duration: "S3-7" },
      { label: "Presentation", color: "bg-green-100 text-green-700", icon: FileText, duration: "S9" },
    ],
    gate: "GO / NO-GO → Phase 3",
    notes: "Acteurs: Client + Usine Bleue + Membres candidats",
  },
  {
    id: "1.2.1",
    title: "Sous-flow: Processus Mains Levees",
    description: "Publication anonyme du projet → candidatures reseau REAI",
    status: "actif",
    steps: [
      { label: "Montage profil cible", color: "bg-blue-100 text-blue-700", icon: UserPlus },
      { label: "Description anonyme", color: "bg-indigo-100 text-indigo-700", icon: FileText },
      { label: "Publication REAI", color: "bg-violet-100 text-violet-700", icon: Network },
      { label: "Reception candidatures", color: "bg-amber-100 text-amber-700", icon: ClipboardList, duration: "3j" },
      { label: "Client selectionne TOP 3", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ],
  },
  {
    id: "1.2.2",
    title: "Sous-flow: Selection TOP 3",
    description: "Validation expertise de chaque candidat vs points cles du projet",
    status: "actif",
    steps: [
      { label: "Contact individuel", color: "bg-blue-100 text-blue-700", icon: Phone },
      { label: "MAJ infos", color: "bg-indigo-100 text-indigo-700", icon: Settings },
      { label: "Validation expertise", color: "bg-violet-100 text-violet-700", icon: CheckCircle2 },
      { label: "Projets similaires", color: "bg-amber-100 text-amber-700", icon: Briefcase },
      { label: "Compilation dossiers", color: "bg-orange-100 text-orange-700", icon: FileText },
      { label: "Presentation au client", color: "bg-emerald-100 text-emerald-700", icon: Users },
      { label: "Client recoit fichiers", color: "bg-teal-100 text-teal-700", icon: ClipboardList },
      { label: "Selection TOP 3 final", color: "bg-green-100 text-green-700", icon: Target },
    ],
  },
  {
    id: "1.2.3",
    title: "Sous-flow: Sessions Rencontres TOP 3",
    description: "3 sessions Teams 45min + debrief + choix du partenaire",
    status: "actif",
    steps: [
      { label: "Prep materiel", color: "bg-blue-100 text-blue-700", icon: Briefcase },
      { label: "Session 1 (45min)", color: "bg-violet-100 text-violet-700", icon: Video },
      { label: "Session 2 (45min)", color: "bg-violet-100 text-violet-700", icon: Video },
      { label: "Session 3 (45min)", color: "bg-violet-100 text-violet-700", icon: Video },
      { label: "Debrief client+UB (30min)", color: "bg-amber-100 text-amber-700", icon: MessageSquare },
      { label: "Choix partenaire", color: "bg-green-100 text-green-700", icon: CheckCircle2, duration: "24-48h" },
    ],
  },
  {
    id: "1.2.4",
    title: "Sous-flow: Analyse du Projet",
    description: "Le membre selectionne analyse le projet en profondeur (4 semaines)",
    status: "actif",
    steps: [
      { label: "Visite usine client", color: "bg-blue-100 text-blue-700", icon: Factory },
      { label: "Kickoff parties prenantes", color: "bg-indigo-100 text-indigo-700", icon: Users },
      { label: "Recolte infos & besoins", color: "bg-violet-100 text-violet-700", icon: Search },
      { label: "Chiffres cles", color: "bg-amber-100 text-amber-700", icon: BarChart3 },
      { label: "Risques + Faisabilite", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
      { label: "Concept preliminaire", color: "bg-teal-100 text-teal-700", icon: Lightbulb },
      { label: "Veille techno + Prix", color: "bg-emerald-100 text-emerald-700", icon: DollarSign },
      { label: "Rapport compile", color: "bg-green-100 text-green-700", icon: FileText },
    ],
    notes: "Kickoff = Vente, Ingenierie, Production, Ops, Maintenance",
  },
  {
    id: "1.2.5",
    title: "Sous-flow: Presentation Analyse",
    description: "Session Teams finale → decision GO/NO-GO pour Phase 3",
    status: "actif",
    steps: [
      { label: "Session Teams 45min", color: "bg-violet-100 text-violet-700", icon: Video },
      { label: "Presentation travail", color: "bg-amber-100 text-amber-700", icon: FileText },
      { label: "Q&A + commentaires", color: "bg-blue-100 text-blue-700", icon: MessageSquare },
    ],
    gate: "GO / NO-GO → Phase 3 Cahier",
  },
  {
    id: "1.3",
    title: "Phase 3 — Cahier de Projet Preliminaire (CPRJ)",
    description: "60 jours — 4 sections, repartition UB/Membre/Client",
    status: "actif",
    steps: [
      { label: "S1 Profil entreprise", color: "bg-blue-100 text-blue-700", icon: Building2, duration: "UB 40% / Client 60%" },
      { label: "S2 Analyse projet", color: "bg-violet-100 text-violet-700", icon: Search, duration: "Membre 70%" },
      { label: "S3 Concept prelim.", color: "bg-amber-100 text-amber-700", icon: Lightbulb, duration: "Membre 70%" },
      { label: "S4 Budget & Subventions", color: "bg-green-100 text-green-700", icon: DollarSign, duration: "UB 70%" },
    ],
    bots: ["BCO", "BCF", "BOO", "BFA"],
    gate: "Livrable: Cahier complet → Activation financement",
    notes: "S4 declenche le flow Subventions en parallele",
  },
];

// ── SECTION 2: SUBVENTIONS ──

const FLOW_SUBVENTIONS: FlowDef[] = [
  {
    id: "2.1",
    title: "Flow Subventions (CFO Bot)",
    description: "Identification → eligibilite → dossier → application — revenu UB 10% sur subventions obtenues",
    status: "actif",
    steps: [
      { label: "Identification programmes", color: "bg-blue-100 text-blue-700", icon: Search },
      { label: "Verification eligibilite", color: "bg-indigo-100 text-indigo-700", icon: CheckCircle2 },
      { label: "Recherche gouv/prov", color: "bg-violet-100 text-violet-700", icon: BookOpen },
      { label: "Documentation requise", color: "bg-amber-100 text-amber-700", icon: ClipboardList },
      { label: "Preparation dossier", color: "bg-orange-100 text-orange-700", icon: FileText },
      { label: "Soumission", color: "bg-emerald-100 text-emerald-700", icon: Rocket },
      { label: "Suivi & tracking", color: "bg-teal-100 text-teal-700", icon: Clock },
      { label: "Obtention → 10% UB", color: "bg-green-100 text-green-700", icon: DollarSign },
    ],
    bots: ["BCF"],
    notes: "16 programmes actifs: ESSOR, Audit 4.0, Productivite Innovation, OTN, PARI-CNRC, RS&DE, CanExport, HQ Energie, FLI, PRU...",
  },
  {
    id: "2.2",
    title: "Programmes Provinciaux (5)",
    description: "ESSOR (50-500K$), Audit 4.0 (gratuit-10K$), Productivite Innovation (40% max 200K$), OTN, PACME (100% formation)",
    status: "actif",
    steps: [
      { label: "ESSOR", color: "bg-blue-100 text-blue-700", icon: DollarSign },
      { label: "Audit 4.0", color: "bg-indigo-100 text-indigo-700", icon: Gauge },
      { label: "Productivite Innovation", color: "bg-violet-100 text-violet-700", icon: Rocket },
      { label: "OTN", color: "bg-amber-100 text-amber-700", icon: Settings },
      { label: "PACME", color: "bg-green-100 text-green-700", icon: GraduationCap },
    ],
  },
  {
    id: "2.3",
    title: "Programmes Federaux + Regionaux (6)",
    description: "PARI-CNRC, RS&DE 35%, CanExport, HQ Energie, FLI, PRU",
    status: "actif",
    steps: [
      { label: "PARI-CNRC", color: "bg-red-100 text-red-700", icon: Search },
      { label: "RS&DE 35%", color: "bg-rose-100 text-rose-700", icon: DollarSign },
      { label: "CanExport", color: "bg-orange-100 text-orange-700", icon: Rocket },
      { label: "HQ Energie", color: "bg-cyan-100 text-cyan-700", icon: Zap },
      { label: "FLI regional", color: "bg-teal-100 text-teal-700", icon: MapPin },
      { label: "PRU municipal", color: "bg-emerald-100 text-emerald-700", icon: Building2 },
    ],
  },
];

// ── SECTION 3: BILAN DE SANTE ──

const FLOW_BILAN: FlowDef[] = [
  {
    id: "3.1",
    title: "Bilan de Sante Manufacturier — Phase 1: Accroche",
    description: "3 echanges pre-formates — entreprise, secteur, defi principal",
    status: "actif",
    steps: [
      { label: "Intro + Entreprise + Secteur", color: "bg-blue-100 text-blue-700", icon: Building2 },
      { label: "Employes + Localisation", color: "bg-indigo-100 text-indigo-700", icon: Users },
      { label: "Defi #1 (open-ended)", color: "bg-violet-100 text-violet-700", icon: Target },
    ],
    notes: "Detection pain point automatique → routing departement prioritaire",
  },
  {
    id: "3.2",
    title: "Bilan de Sante — Phase 2: Exploration",
    description: "5-12 echanges AI-driven — Data Grid 25 points × 5 departements",
    status: "actif",
    steps: [
      { label: "Pain points prioritaires", color: "bg-blue-100 text-blue-700", icon: AlertTriangle },
      { label: "Data Grid departements", color: "bg-violet-100 text-violet-700", icon: BarChart3 },
      { label: "Extraction opportuniste", color: "bg-amber-100 text-amber-700", icon: Search },
      { label: "Benchmarking temps reel", color: "bg-green-100 text-green-700", icon: Gauge },
    ],
    bots: ["BCO"],
    notes: "Gemini Flash genere questions conversationnelles, max 2-3 phrases par echange",
  },
  {
    id: "3.3",
    title: "Bilan de Sante — Phase 3: Validation",
    description: "Mini-resume confirme par le client — 2-3 echanges",
    status: "actif",
    steps: [
      { label: "Resume Top 3 signaux", color: "bg-blue-100 text-blue-700", icon: ClipboardList },
      { label: "Client confirme/ajuste", color: "bg-amber-100 text-amber-700", icon: CheckCircle2 },
      { label: "Trous critiques comblee", color: "bg-green-100 text-green-700", icon: Target },
    ],
  },
  {
    id: "3.4",
    title: "Bilan de Sante — Phase 4: Prescription",
    description: "Scorecard VITAA 0-100 × 5 departements + CTA SMART",
    status: "actif",
    steps: [
      { label: "Scores 0-100 generes", color: "bg-blue-100 text-blue-700", icon: BarChart3 },
      { label: "Triangle du Feu", color: "bg-red-100 text-red-700", icon: Flame },
      { label: "3 diagnostics recommandes", color: "bg-violet-100 text-violet-700", icon: Lightbulb },
      { label: "CTA: visite terrain 2h", color: "bg-green-100 text-green-700", icon: MapPin },
      { label: "Capture contact", color: "bg-emerald-100 text-emerald-700", icon: UserPlus },
    ],
    notes: "Scoring: metriques (60%) + qualitatif (30%) + satisfaction (10%)",
  },
];

// ── SECTION 4: FLOWS ACTION CARLOS ──

const FLOW_ACTION: FlowDef[] = [
  {
    id: "4.1",
    title: "Board Room — Deliberation CA",
    description: "Reunion de gouvernance: sujet → tour de table multi-bot → vote → decision loguee",
    status: "partiel",
    steps: [
      { label: "Accueil + sujet", color: "bg-indigo-100 text-indigo-700", icon: MessageSquare },
      { label: "Qualification enjeu", color: "bg-blue-100 text-blue-700", icon: Target },
      { label: "Tour de table (2-3 phrases/bot)", color: "bg-violet-100 text-violet-700", icon: Users },
      { label: "Synthese CEO", color: "bg-amber-100 text-amber-700", icon: Brain },
      { label: "Decision → Decision Log", color: "bg-green-100 text-green-700", icon: Vote },
    ],
    bots: ["BCO", "CSO", "BCF"],
  },
  {
    id: "4.2",
    title: "War Room — Gestion de Crise",
    description: "Mode COMMAND urgent: alerte → OODA → plan 3 horizons → post-mortem",
    status: "partiel",
    steps: [
      { label: "Alerte + impact", color: "bg-red-100 text-red-700", icon: AlertTriangle },
      { label: "Diagnostic rapide/dept", color: "bg-orange-100 text-orange-700", icon: Gauge },
      { label: "Plan urgence 3 horizons", color: "bg-amber-100 text-amber-700", icon: Shield },
      { label: "Assignation COMMAND", color: "bg-violet-100 text-violet-700", icon: Zap },
      { label: "Suivi temps reel", color: "bg-blue-100 text-blue-700", icon: Clock },
      { label: "Post-mortem + lecons", color: "bg-green-100 text-green-700", icon: FileText },
    ],
    bots: ["BCO", "BOO", "BCS", "BCF"],
    notes: "3 horizons: immediat (24h), court terme (1 sem), stabilisation (1 mois)",
  },
  {
    id: "4.3",
    title: "Think Room — Projet ou Pivot Strategique",
    description: "Vision → brainstorm multi-bot → evaluation → blueprint → roadmap → Go/No-Go",
    status: "partiel",
    steps: [
      { label: "Vision + pourquoi", color: "bg-violet-100 text-violet-700", icon: Lightbulb },
      { label: "Brainstorm multi-angle", color: "bg-indigo-100 text-indigo-700", icon: Brain },
      { label: "Matrice evaluation", color: "bg-amber-100 text-amber-700", icon: BarChart3 },
      { label: "Blueprint structure", color: "bg-blue-100 text-blue-700", icon: Layers },
      { label: "Roadmap detaillee", color: "bg-teal-100 text-teal-700", icon: Clock },
      { label: "Go / Conditionnel / No-Go", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ],
    bots: ["BCO", "BCS", "BCT", "BCF"],
    notes: "Modes Innovation + Decision actives automatiquement",
  },
  {
    id: "4.4",
    title: "Jumelage Orbit9",
    description: "Matching partenaire ideal via scoring + trisociation en trio",
    status: "actif",
    steps: [
      { label: "Objectif matching", color: "bg-blue-100 text-blue-700", icon: Target },
      { label: "Analyse profil", color: "bg-indigo-100 text-indigo-700", icon: Users },
      { label: "Top 3 + scores", color: "bg-violet-100 text-violet-700", icon: Network },
      { label: "Trisociation trio", color: "bg-amber-100 text-amber-700", icon: Sparkles },
      { label: "Actions + suivi", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ],
    bots: ["BCO", "BCS", "BRO"],
    notes: "Scoring Gemini Flash + session LiveKit trisociation",
  },
  {
    id: "4.5",
    title: "Blueprint Live — Plan d'Affaires",
    description: "Construction plan d'affaires structure en conversation guidee",
    status: "partiel",
    steps: [
      { label: "Description projet", color: "bg-blue-100 text-blue-700", icon: Lightbulb },
      { label: "Diagnostic rapide", color: "bg-indigo-100 text-indigo-700", icon: Gauge },
      { label: "Structure 6 sections", color: "bg-violet-100 text-violet-700", icon: Layers },
      { label: "Projections financieres", color: "bg-amber-100 text-amber-700", icon: DollarSign },
      { label: "Document → Mes Documents", color: "bg-green-100 text-green-700", icon: FileText },
    ],
    bots: ["BCO", "BCF", "BCS"],
  },
  {
    id: "4.6",
    title: "Scenarios — Exploration What-If",
    description: "3 scenarios contrastes: optimiste / realiste / pessimiste + triggers pivot",
    status: "partiel",
    steps: [
      { label: "Sujet strategique", color: "bg-blue-100 text-blue-700", icon: Target },
      { label: "Variables cles", color: "bg-indigo-100 text-indigo-700", icon: Settings },
      { label: "Simulation 3 scenarios", color: "bg-violet-100 text-violet-700", icon: Layers },
      { label: "Comparaison cote-a-cote", color: "bg-amber-100 text-amber-700", icon: BarChart3 },
      { label: "Decision + plan execution", color: "bg-green-100 text-green-700", icon: Rocket },
    ],
    bots: ["BCS", "BCO", "BCF"],
  },
  {
    id: "4.7",
    title: "Cellules Orbit9 — Creation Groupe",
    description: "Formation cellule collaboration 3-5 PME complementaires",
    status: "actif",
    steps: [
      { label: "Objectif cellule", color: "bg-blue-100 text-blue-700", icon: Target },
      { label: "Composition optimale", color: "bg-violet-100 text-violet-700", icon: Users },
      { label: "Validation membres", color: "bg-amber-100 text-amber-700", icon: CheckCircle2 },
      { label: "Lancement + 1ere trisociation", color: "bg-green-100 text-green-700", icon: Rocket },
    ],
    bots: ["BCO", "BOO", "BHR"],
  },
  {
    id: "4.8",
    title: "Pipeline Multi-Bot — Orchestration Livraison",
    description: "Decomposition taches → execution parallele multi-bot → bilan",
    status: "partiel",
    steps: [
      { label: "Description mission", color: "bg-blue-100 text-blue-700", icon: Briefcase },
      { label: "Decomposition taches", color: "bg-indigo-100 text-indigo-700", icon: Layers },
      { label: "Validation assignations", color: "bg-violet-100 text-violet-700", icon: CheckCircle2 },
      { label: "Execution parallele", color: "bg-amber-100 text-amber-700", icon: Play },
      { label: "Bilan + prochaines etapes", color: "bg-green-100 text-green-700", icon: FileText },
    ],
    bots: ["BOO", "BCO", "BRO"],
    notes: "Orchestration via COMMAND Protocol",
  },
  {
    id: "4.9",
    title: "Onboarding — Decouverte Progressive (8 etapes)",
    description: "Conversation naturelle, PAS un formulaire — 2-3 min par etape",
    status: "partiel",
    steps: [
      { label: "Accueil", color: "bg-blue-100 text-blue-700", icon: MessageSquare },
      { label: "Identite + Secteur", color: "bg-indigo-100 text-indigo-700", icon: UserPlus },
      { label: "Etat Croissance", color: "bg-violet-100 text-violet-700", icon: BarChart3 },
      { label: "Diagnostic VITAA", color: "bg-red-100 text-red-700", icon: HeartPulse },
      { label: "Profil Herrmann", color: "bg-amber-100 text-amber-700", icon: Brain },
      { label: "Objectifs", color: "bg-teal-100 text-teal-700", icon: Target },
      { label: "Premiers chantiers", color: "bg-emerald-100 text-emerald-700", icon: Rocket },
      { label: "Espace configure", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ],
    bots: ["BCO"],
    notes: "4 types: Manufacturier, Fournisseur, Expert solo, Entreprise pro",
  },
  {
    id: "4.10",
    title: "CREDO Conversationnel — 5 Phases × 3 Lectures",
    description: "Protocole maitre de chaque conversation CarlOS — automatique et invisible",
    status: "actif",
    steps: [
      { label: "C Connecter/Clarifier/Comprendre", color: "bg-blue-100 text-blue-700", icon: MessageSquare },
      { label: "R Rechercher/Reflechir/Resonner", color: "bg-violet-100 text-violet-700", icon: Search },
      { label: "E Exposer/Elaborer/Elever", color: "bg-amber-100 text-amber-700", icon: Lightbulb },
      { label: "D Demontrer/Decider/Debloquer", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
      { label: "O Obtenir/Operer/Ouvrir", color: "bg-green-100 text-green-700", icon: Rocket },
    ],
    bots: ["BCO"],
    notes: "3 lectures simultanées: Bouche (vente), Cerveau (idees), Coeur (coaching). Reboucles max 2x/phase.",
  },
];

// ── SECTION 5: 8+1 MODES DE REFLEXION ──

const FLOW_MODES: FlowDef[] = [
  {
    id: "5.1",
    title: "Mode Debat — Stress-Testing",
    description: "These → Antithese → Synthese (temp 0.9, max 5 tours)",
    status: "actif",
    steps: [
      { label: "These", color: "bg-blue-100 text-blue-700", icon: MessageSquare },
      { label: "Antithese", color: "bg-red-100 text-red-700", icon: Swords },
      { label: "Synthese", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ],
    bots: ["BCO", "BCS"],
  },
  {
    id: "5.2",
    title: "Mode Brainstorm — Walt Disney 3 Chapeaux",
    description: "Reveur → Realiste → Critique (temp 1.0, max 10 tours)",
    status: "actif",
    steps: [
      { label: "Reveur (divergence)", color: "bg-violet-100 text-violet-700", icon: Lightbulb },
      { label: "Realiste (faisabilite)", color: "bg-amber-100 text-amber-700", icon: Wrench },
      { label: "Critique (filtrage)", color: "bg-red-100 text-red-700", icon: AlertTriangle },
    ],
    bots: ["BCO", "BCM", "BCT"],
  },
  {
    id: "5.3",
    title: "Mode Crise — Decision Rapide",
    description: "Evaluer → Decider → Agir (temp 0.3, max 3 tours — rapide)",
    status: "actif",
    steps: [
      { label: "Evaluer impact", color: "bg-red-100 text-red-700", icon: AlertTriangle },
      { label: "Decider action", color: "bg-amber-100 text-amber-700", icon: Target },
      { label: "Agir immediatement", color: "bg-green-100 text-green-700", icon: Zap },
    ],
    bots: ["BCO", "BOO"],
    notes: "Active automatiquement si urgence > 0.8",
  },
  {
    id: "5.4",
    title: "Mode Analyse — Decomposition Profonde",
    description: "5 Pourquoi → Ishikawa → Conclusion (temp 0.4, max 8 tours)",
    status: "actif",
    steps: [
      { label: "Decomposition (5 Pourquoi)", color: "bg-blue-100 text-blue-700", icon: Search },
      { label: "Ishikawa (causes-effets)", color: "bg-violet-100 text-violet-700", icon: Brain },
      { label: "Conclusion + 3 reco", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ],
    bots: ["BCT", "BCF"],
  },
  {
    id: "5.5",
    title: "Mode Decision — Convergence",
    description: "Options → Matrice ponderee (Bezos Regret Test) → Verdict (temp 0.5, max 3 tours)",
    status: "actif",
    steps: [
      { label: "Lister options", color: "bg-blue-100 text-blue-700", icon: Layers },
      { label: "Matrice ponderee", color: "bg-amber-100 text-amber-700", icon: BarChart3 },
      { label: "Verdict final", color: "bg-green-100 text-green-700", icon: Vote },
    ],
    bots: ["BCO", "BCF"],
  },
  {
    id: "5.6",
    title: "Mode Strategie — Plan Structure",
    description: "SWOT → 3 Horizons → Plan d'action max 7 actions (temp 0.6, max 6 tours)",
    status: "actif",
    steps: [
      { label: "Diagnostic SWOT", color: "bg-blue-100 text-blue-700", icon: Target },
      { label: "Horizon 0-3 mois", color: "bg-indigo-100 text-indigo-700", icon: Clock },
      { label: "Horizon 3-12 mois", color: "bg-violet-100 text-violet-700", icon: Clock },
      { label: "Horizon 1-3 ans", color: "bg-amber-100 text-amber-700", icon: Clock },
      { label: "Plan d'action (max 7)", color: "bg-green-100 text-green-700", icon: Rocket },
    ],
    bots: ["BCO", "BCS", "BCF"],
  },
  {
    id: "5.7",
    title: "Mode Innovation — De Bono 6 Chapeaux",
    description: "Blanc → Rouge → Noir → Jaune → Vert → Bleu (temp 0.95, max 8 tours)",
    status: "actif",
    steps: [
      { label: "Blanc (Faits)", color: "bg-gray-100 text-gray-700", icon: FileText },
      { label: "Rouge (Emotions)", color: "bg-red-100 text-red-700", icon: HeartPulse },
      { label: "Noir (Risques)", color: "bg-gray-200 text-gray-800", icon: AlertTriangle },
      { label: "Jaune (Benefices)", color: "bg-yellow-100 text-yellow-700", icon: Lightbulb },
      { label: "Vert (Creativite)", color: "bg-green-100 text-green-700", icon: Sparkles },
      { label: "Bleu (Synthese)", color: "bg-blue-100 text-blue-700", icon: Brain },
    ],
    bots: ["BCT", "BCM"],
  },
  {
    id: "5.8",
    title: "Mode Deep Resonance — Spirale 3-6-9",
    description: "Humain→Agent → Agent→Deep Think → Deep Think→Humain (temp 0.7, max 3 tours)",
    status: "actif",
    steps: [
      { label: "Spirale 3 (Humain→Agent)", color: "bg-blue-100 text-blue-700", icon: Users },
      { label: "Spirale 6 (Agent→Deep Think)", color: "bg-violet-100 text-violet-700", icon: Brain },
      { label: "Spirale 9 (Integration)", color: "bg-green-100 text-green-700", icon: Sparkles },
    ],
    bots: ["BCO"],
    notes: "Multi-model: validation par modele externe (Claude Opus)",
  },
  {
    id: "5.9",
    title: "Mode GhostX — Emulation Cognitive",
    description: "Flash (1 Ghost ponctuel) ou Panel (2-3 Ghosts debat 3 tours)",
    status: "actif",
    steps: [
      { label: "Selection Ghost(s)", color: "bg-violet-100 text-violet-700", icon: Bot },
      { label: "Flash / Panel", color: "bg-amber-100 text-amber-700", icon: Sparkles },
      { label: "Perspective Ghost-infused", color: "bg-green-100 text-green-700", icon: Lightbulb },
    ],
    bots: ["BCO"],
    notes: "12 Ghosts: Bezos, Jobs, Musk, Sun Tzu, Munger, Marc Aurele, Churchill, Disney, Tesla, Buffett, Curie, Oprah",
  },
];

// ── SECTION 6: FLOWS SYSTEME (BACKGROUND) ──

const FLOW_SYSTEME: FlowDef[] = [
  {
    id: "6.1",
    title: "COMMAND Engine — Orchestration Multi-Bot",
    description: "4 stages sequentiels + 3 degres d'autonomie (D1 Soldat / D2 Lieutenant / D3 Partenaire)",
    status: "actif",
    steps: [
      { label: "SCAN (BCF/BCT/BCM)", color: "bg-blue-100 text-blue-700", icon: Search, duration: "Flash" },
      { label: "STRATEGY (BCS)", color: "bg-violet-100 text-violet-700", icon: Target, duration: "Pro" },
      { label: "EXECUTION (BOO)", color: "bg-amber-100 text-amber-700", icon: Play, duration: "Flash" },
      { label: "BILAN (BCO)", color: "bg-green-100 text-green-700", icon: FileText, duration: "Pro" },
    ],
    notes: "Auto-activation: 3+ bots score > 0, ou mots-cles complexes (vue d'ensemble, diagnostic, 360)",
  },
  {
    id: "6.2",
    title: "Voice-to-Canvas Pipeline",
    description: "Parole → texte → routage mots-cles → action canvas → synthese vocale",
    status: "actif",
    steps: [
      { label: "STT Deepgram nova-3", color: "bg-blue-100 text-blue-700", icon: Phone },
      { label: "Keyword Router (30+ patterns)", color: "bg-violet-100 text-violet-700", icon: Zap },
      { label: "Canvas Action", color: "bg-amber-100 text-amber-700", icon: ArrowRight },
      { label: "TTS ElevenLabs", color: "bg-green-100 text-green-700", icon: Radio },
    ],
    notes: "Anti-bounce par room, skip nav si msg < 20 chars, word boundaries \\b sur tous patterns",
  },
  {
    id: "6.3",
    title: "Orbit9 Matching Engine",
    description: "Score → Suggestion → Validation humaine → Creation cellule",
    status: "actif",
    steps: [
      { label: "Scoring Gemini Flash", color: "bg-blue-100 text-blue-700", icon: BarChart3 },
      { label: "Suggestion Top 3", color: "bg-violet-100 text-violet-700", icon: Network },
      { label: "Validation humaine", color: "bg-amber-100 text-amber-700", icon: CheckCircle2 },
      { label: "Cellule creee", color: "bg-green-100 text-green-700", icon: Users },
    ],
    notes: "3 tables PostgreSQL + 15 endpoints + anti-cartel (secteur+specialite)",
  },
  {
    id: "6.4",
    title: "5-Tier Routing (Classification Messages)",
    description: "Chaque message route vers le tier optimal: cout vs capacite",
    status: "actif",
    steps: [
      { label: "T0 Regex/Cache (gratuit)", color: "bg-gray-100 text-gray-700", icon: Zap, duration: "30-40%" },
      { label: "T1 Gemini Flash (gratuit)", color: "bg-blue-100 text-blue-700", icon: Bot, duration: "30%" },
      { label: "T2 Gemini Pro (gratuit)", color: "bg-violet-100 text-violet-700", icon: Bot, duration: "20%" },
      { label: "T3 Claude Sonnet ($)", color: "bg-amber-100 text-amber-700", icon: Bot, duration: "15%" },
      { label: "T4 Claude Opus ($$)", color: "bg-red-100 text-red-700", icon: Bot, duration: "5%" },
    ],
    notes: "Budget cible: $5/jour max, 80%+ sur tiers gratuits",
  },
  {
    id: "6.5",
    title: "Chef d'Orchestre — Assemblage Equipe",
    description: "Message vague → scoring bots → proposition equipe 3 bots → accept/reject",
    status: "actif",
    steps: [
      { label: "Detection msg vague", color: "bg-blue-100 text-blue-700", icon: Search },
      { label: "Scoring 12 bots", color: "bg-violet-100 text-violet-700", icon: BarChart3 },
      { label: "Team Proposal (3 bots)", color: "bg-amber-100 text-amber-700", icon: Users },
      { label: "Accept → Focus trio", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ],
    notes: "is_diagnostic si < 15 mots → CarlOS pose questions diagnostiques d'abord",
  },
  {
    id: "6.6",
    title: "Cascade Tensions (Inter-Departements)",
    description: "Detection automatique des departements secondaires impactes",
    status: "actif",
    steps: [
      { label: "Tension detectee", color: "bg-red-100 text-red-700", icon: AlertTriangle },
      { label: "Top 2 departements lies", color: "bg-violet-100 text-violet-700", icon: Network },
      { label: "Suggestion proactive", color: "bg-green-100 text-green-700", icon: Lightbulb },
    ],
    notes: "Finance→Ops, Finance→Strategie, Ventes→Marketing, Ops→RH, Tech→Securite",
  },
  {
    id: "6.7",
    title: "Triangle du Feu — Diagnostic Dynamique",
    description: "Scoring VITAA → detection automatique du niveau d'urgence → action",
    status: "actif",
    steps: [
      { label: "BRULE (3+ piliers ≥50)", color: "bg-red-100 text-red-700", icon: Flame },
      { label: "Suivi quotidien", color: "bg-orange-100 text-orange-700", icon: Clock },
    ],
    notes: "COUVE (2 piliers) → suivi hebdo | MEURT (0-1) → proposer archive ou relance",
  },
  {
    id: "6.8",
    title: "Generation Documents CREDO",
    description: "Chaque phase CREDO genere un document automatiquement",
    status: "actif",
    steps: [
      { label: "C → Fiche Tension", color: "bg-blue-100 text-blue-700", icon: FileText },
      { label: "R → Diagnostic", color: "bg-violet-100 text-violet-700", icon: FileText },
      { label: "E → Brief Equipe", color: "bg-amber-100 text-amber-700", icon: FileText },
      { label: "D → Argumentaire", color: "bg-emerald-100 text-emerald-700", icon: FileText },
      { label: "O → Plan d'Action", color: "bg-green-100 text-green-700", icon: FileText },
    ],
    notes: "Documents auto-popules dans Cahier de Projet par branche CREDO",
  },
];

// ======================================================================
// RENDER
// ======================================================================

function FlowCard({ flow }: { flow: FlowDef }) {
  const isSubFlow = flow.id.split(".").length > 2;
  return (
    <Card className={cn("p-4", isSubFlow && "ml-6 border-l-2 border-l-blue-200")}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-gray-400">{flow.id}</span>
          <h3 className="text-sm font-semibold text-gray-800">{flow.title}</h3>
        </div>
        <StatusBadge status={flow.status} />
      </div>
      <p className="text-xs text-gray-500 mb-3">{flow.description}</p>
      <FlowPipeline steps={flow.steps} />
      {flow.gate && <GateBadge label={flow.gate} />}
      {(flow.bots || flow.notes) && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {flow.bots?.map((bot) => (
            <Badge key={bot} className="text-[9px] bg-gray-50 text-gray-600">{bot}</Badge>
          ))}
          {flow.notes && (
            <span className="text-[9px] text-gray-400 italic">{flow.notes}</span>
          )}
        </div>
      )}
    </Card>
  );
}

function FlowSection({ number, title, icon: Icon, iconColor, flows }: {
  number: number; title: string; icon: React.ElementType; iconColor: string; flows: FlowDef[];
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold text-gray-400">{number}.</span>
        <Icon className={cn("h-5 w-5", iconColor)} />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <Badge className="text-[9px] bg-gray-50 text-gray-500">{flows.length} flows</Badge>
      </div>
      <div className="space-y-3">
        {flows.map((flow) => (
          <FlowCard key={flow.id} flow={flow} />
        ))}
      </div>
    </div>
  );
}

// Stats
const ALL_FLOWS = [...FLOW_ACCOMPAGNEMENT, ...FLOW_SUBVENTIONS, ...FLOW_BILAN, ...FLOW_ACTION, ...FLOW_MODES, ...FLOW_SYSTEME];
const STATS = {
  total: ALL_FLOWS.length,
  actifs: ALL_FLOWS.filter((f) => f.status === "actif").length,
  partiels: ALL_FLOWS.filter((f) => f.status === "partiel").length,
  conceptuels: ALL_FLOWS.filter((f) => f.status === "conceptuel").length,
  totalSteps: ALL_FLOWS.reduce((acc, f) => acc + f.steps.length, 0),
};

export function MasterFlowsPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Atlas des Flows Utilisateurs"
        subtitle={`${STATS.total} flows, ${STATS.totalSteps} etapes — ${STATS.actifs} actifs, ${STATS.partiels} partiels`}
        gradient="from-blue-600 to-cyan-500"
        icon={GitBranch}
      />

      {/* Section 1 — Accompagnement Maitre (VIST → JUAN → CPRJ) */}
      <FlowSection
        number={1}
        title="Accompagnement Maitre (VIST → JUAN → CPRJ)"
        icon={Handshake}
        iconColor="text-blue-600"
        flows={FLOW_ACCOMPAGNEMENT}
      />

      <SectionDivider />

      {/* Section 2 — Subventions */}
      <FlowSection
        number={2}
        title="Subventions & Financement (CFO Bot)"
        icon={DollarSign}
        iconColor="text-emerald-600"
        flows={FLOW_SUBVENTIONS}
      />

      <SectionDivider />

      {/* Section 3 — Bilan de Sante */}
      <FlowSection
        number={3}
        title="Bilan de Sante Manufacturier (4 Phases)"
        icon={HeartPulse}
        iconColor="text-red-600"
        flows={FLOW_BILAN}
      />

      <SectionDivider />

      {/* Section 4 — Flows ACTION CarlOS */}
      <FlowSection
        number={4}
        title="Flows ACTION CarlOS (Conversations Guidees)"
        icon={Play}
        iconColor="text-violet-600"
        flows={FLOW_ACTION}
      />

      <SectionDivider />

      {/* Section 5 — 8+1 Modes de Reflexion */}
      <FlowSection
        number={5}
        title="8+1 Modes de Reflexion (Sous-Outils CREDO)"
        icon={Brain}
        iconColor="text-indigo-600"
        flows={FLOW_MODES}
      />

      <SectionDivider />

      {/* Section 6 — Flows Systeme (Background) */}
      <FlowSection
        number={6}
        title="Flows Systeme & Orchestration (Background)"
        icon={Settings}
        iconColor="text-gray-600"
        flows={FLOW_SYSTEME}
      />
    </PageLayout>
  );
}
