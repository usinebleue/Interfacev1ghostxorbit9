/**
 * DepartmentDetailView.tsx — Canevas departement IDENTIQUE a V1
 * Header bot + Tabs (Dashboard | Chat | Reglages)
 * Dashboard: bandeau proactif + 4 widgets grille + Derniers Dossiers + Activite
 * Sprint A — Frame Master V2
 */

import {
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  FileCheck,
  TrendingUp,
  ExternalLink,
  Settings,
  Server,
  Bug,
  Cpu,
  Cog,
  DollarSign,
  PiggyBank,
  Receipt,
  Megaphone,
  Target,
  BarChart3,
  FileText,
  Handshake,
  ShieldCheck,
  Users,
  Gauge,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";

// --- Types ---

interface WidgetItem {
  id: number;
  primary: string;
  secondary?: string;
  value?: string;
  progress?: number;
  urgent?: boolean;
  tag?: string;
}

interface Widget {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  badge?: string;
  items: WidgetItem[];
}

interface DeptConfig {
  name: string;
  color: string;
  ringColor: string;
  summary: string;
  kpis: { label: string; value: string; trend?: string; positive?: boolean }[];
  widgets: Widget[];
  recentFiles: { id: number; name: string; progress: number; by: string; time: string; type: string }[];
  activity: { id: number; text: string; time: string }[];
}

// --- Configs par departement (identique V1) ---

const DEPT_CONFIGS: Record<string, DeptConfig> = {
  BCO: {
    name: "Direction",
    color: "text-blue-600",
    ringColor: "ring-blue-500",
    summary:
      "2 approbations urgentes. Call MetalPro a 10h30. Pipeline a 475K$ (+12%). Vente +12%.",
    kpis: [
      { label: "Revenus", value: "1.2M$", trend: "+8%", positive: true },
      { label: "Pipeline", value: "475K$", trend: "+12%", positive: true },
      { label: "Projets", value: "3" },
      { label: "Retard", value: "2", positive: false },
    ],
    widgets: [
      {
        title: "A APPROUVER", icon: FileCheck, iconColor: "text-red-500", badge: "3",
        items: [
          { id: 1, primary: "Budget automatisation — 3 scenarios", secondary: "CFO", urgent: true },
          { id: 2, primary: "Soumission MetalPro v2", secondary: "CSO", urgent: true },
          { id: 3, primary: "Plan contenu LinkedIn Q2", secondary: "CMO" },
        ],
      },
      {
        title: "MES TACHES", icon: CheckCircle2, iconColor: "text-blue-500", badge: "4",
        items: [
          { id: 1, primary: "Approuver budget automatisation", secondary: "Aujourd'hui", urgent: true },
          { id: 2, primary: "Reviser soumission MetalPro", secondary: "Jeudi", urgent: true },
          { id: 3, primary: "Valider brief marketing Q2", secondary: "3 mars" },
          { id: 4, primary: "Feedback audit techno usine #2", secondary: "5 mars" },
        ],
      },
      {
        title: "AUJOURD'HUI", icon: Calendar, iconColor: "text-purple-500",
        items: [
          { id: 1, primary: "Standup equipe", value: "09:00", tag: "meeting" },
          { id: 2, primary: "Call MetalPro — soumission", value: "10:30", tag: "client" },
          { id: 3, primary: "Revue budget Q2 (CFO)", value: "13:00", tag: "meeting" },
          { id: 4, primary: "Demo robot soudure", value: "15:00", tag: "client" },
        ],
      },
      {
        title: "PIPELINE", icon: TrendingUp, iconColor: "text-green-500",
        items: [
          { id: 1, primary: "MetalPro inc.", secondary: "Soumission", value: "125K$", progress: 75 },
          { id: 2, primary: "Acier Quebec", secondary: "Qualification", value: "85K$", progress: 40 },
          { id: 3, primary: "TechnoSoud", secondary: "Negociation", value: "210K$", progress: 60 },
          { id: 4, primary: "IndusPieces", secondary: "Prospection", value: "55K$", progress: 20 },
        ],
      },
    ],
    recentFiles: [
      { id: 1, name: "Cahier Robot Soudure", progress: 78, by: "CarlOS", time: "2h", type: "CP" },
      { id: 2, name: "Bilan MetalPro inc.", progress: 45, by: "CFO", time: "hier", type: "BS" },
      { id: 3, name: "Plan Marketing Q2", progress: 35, by: "CMO", time: "hier", type: "CP" },
    ],
    activity: [
      { id: 1, text: "CarlOS a mis a jour le tableau de bord", time: "1h" },
      { id: 2, text: "CFO a termine le budget automatisation", time: "2h" },
      { id: 3, text: "CTO a identifie 3 options de robots", time: "hier" },
      { id: 4, text: "CMO a genere 12 leads LinkedIn", time: "matin" },
    ],
  },
  BCT: {
    name: "Technologie", color: "text-purple-600", ringColor: "ring-purple-500",
    summary: "Audit usine #2 termine. 3 options de robots identifiees. Stack API stable (99.2% uptime).",
    kpis: [
      { label: "Uptime", value: "99.2%", trend: "+0.3%", positive: true },
      { label: "Audits", value: "2" },
      { label: "Integrations", value: "8" },
      { label: "Bugs", value: "3", positive: false },
    ],
    widgets: [
      { title: "AUDITS EN COURS", icon: Cpu, iconColor: "text-purple-500", badge: "2", items: [
        { id: 1, primary: "Audit usine #2 — robots soudure", secondary: "Termine · 3 options", progress: 100 },
        { id: 2, primary: "Audit ligne assemblage #1", secondary: "En cours · scan IoT", progress: 45 },
        { id: 3, primary: "Evaluation ERP migration", secondary: "Planifie · mars", progress: 0 },
      ]},
      { title: "STACK & INTEGRATIONS", icon: Server, iconColor: "text-blue-500", items: [
        { id: 1, primary: "API CarlOS (Telegram)", secondary: "Operationnel", tag: "ok" },
        { id: 2, primary: "Plane.so (Taches)", secondary: "Connecte", tag: "ok" },
        { id: 3, primary: "Google Calendar", secondary: "Token expire", tag: "error" },
        { id: 4, primary: "PostgreSQL (CarlOS DB)", secondary: "99.9% uptime", tag: "ok" },
      ]},
      { title: "TICKETS PRIORITAIRES", icon: Bug, iconColor: "text-red-500", badge: "3", items: [
        { id: 1, primary: "Google OAuth refresh broken", secondary: "Calendar/Docs · P1", urgent: true },
        { id: 2, primary: "Latence API Tier 3 > 2s", secondary: "Claude Sonnet · P2" },
        { id: 3, primary: "Webhook Plane 404", secondary: "Free tier limit · P3" },
      ]},
      { title: "AUTOMATISATIONS", icon: Cog, iconColor: "text-green-500", items: [
        { id: 1, primary: "Robot soudure — 3 options evaluees", secondary: "Budget requis · CFO", progress: 78 },
        { id: 2, primary: "Ligne assemblage — analyse IoT", secondary: "Scan en cours", progress: 35 },
        { id: 3, primary: "Palettisation automatique", secondary: "Prospection", progress: 10 },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Rapport Audit Usine #2", progress: 100, by: "CTO", time: "3h", type: "RA" },
      { id: 2, name: "Specs Robot Soudure", progress: 60, by: "CTO", time: "hier", type: "SP" },
    ],
    activity: [
      { id: 1, text: "CTO a finalise l'audit usine #2", time: "3h" },
      { id: 2, text: "Stack API stable — 0 incident 48h", time: "hier" },
    ],
  },
  BCF: {
    name: "Finance", color: "text-green-600", ringColor: "ring-green-500",
    summary: "Budget Q2 pret (3 scenarios). ROI automatisation +15%. Subvention MEDTEQ en attente.",
    kpis: [
      { label: "Budget Q2", value: "340K$" },
      { label: "ROI projets", value: "+15%", positive: true },
      { label: "Subventions", value: "2" },
      { label: "Couts IA", value: "1.2$/j", positive: true },
    ],
    widgets: [
      { title: "BUDGETS", icon: DollarSign, iconColor: "text-green-500", items: [
        { id: 1, primary: "Budget automatisation", secondary: "3 scenarios · En attente", urgent: true, value: "85-150K$" },
        { id: 2, primary: "Budget marketing Q2", secondary: "Approuve", value: "45K$", progress: 100 },
        { id: 3, primary: "Budget operations", secondary: "En cours", value: "120K$", progress: 60 },
      ]},
      { title: "ROI PROJETS", icon: TrendingUp, iconColor: "text-blue-500", items: [
        { id: 1, primary: "Robot Soudure", secondary: "Payback 14 mois", value: "+22%", progress: 78 },
        { id: 2, primary: "Ligne assemblage", secondary: "Payback 18 mois", value: "+15%", progress: 45 },
        { id: 3, primary: "ERP migration", secondary: "Payback 24 mois", value: "+8%", progress: 12 },
      ]},
      { title: "SUBVENTIONS", icon: PiggyBank, iconColor: "text-purple-500", badge: "2", items: [
        { id: 1, primary: "MEDTEQ — automatisation", secondary: "Soumis · deadline 15 mars", value: "75K$", progress: 60 },
        { id: 2, primary: "CDPQ — expansion", secondary: "En preparation", value: "200K$", progress: 15 },
      ]},
      { title: "COUTS & FACTURATION", icon: Receipt, iconColor: "text-orange-500", items: [
        { id: 1, primary: "Couts IA (CarlOS)", secondary: "Ce mois", value: "36$" },
        { id: 2, primary: "Abonnements SaaS", secondary: "8 outils", value: "2.4K$/m" },
        { id: 3, primary: "Factures en attente", secondary: "3 clients", value: "45K$", urgent: true },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Budget Automatisation V3", progress: 95, by: "CFO", time: "1h", type: "BU" },
      { id: 2, name: "Analyse ROI robots", progress: 80, by: "CFO", time: "hier", type: "AN" },
    ],
    activity: [
      { id: 1, text: "CFO a finalise 3 scenarios de budget", time: "1h" },
      { id: 2, text: "Subvention MEDTEQ soumise", time: "hier" },
    ],
  },
  BCM: {
    name: "Marketing", color: "text-pink-600", ringColor: "ring-pink-500",
    summary: "12 leads LinkedIn generes cette semaine. Plan contenu Q2 en attente. 2 campagnes actives.",
    kpis: [
      { label: "Leads", value: "12", trend: "+8", positive: true },
      { label: "Campagnes", value: "2" },
      { label: "Contenu", value: "15 posts" },
      { label: "Conversion", value: "3.2%", positive: true },
    ],
    widgets: [
      { title: "CAMPAGNES ACTIVES", icon: Megaphone, iconColor: "text-pink-500", badge: "2", items: [
        { id: 1, primary: "LinkedIn — Automatisation PME", secondary: "8 leads · 2.1K impressions", progress: 65 },
        { id: 2, primary: "Email — Webinaire Robot", secondary: "4 leads · 340 ouvertures", progress: 40 },
      ]},
      { title: "LEADS & PIPELINE MKT", icon: Target, iconColor: "text-orange-500", items: [
        { id: 1, primary: "MetalPro inc.", secondary: "LinkedIn · Chaud", tag: "hot" },
        { id: 2, primary: "Acier Quebec", secondary: "Email · Qualifie", tag: "warm" },
        { id: 3, primary: "IndusPieces", secondary: "LinkedIn · Nouveau", tag: "new" },
      ]},
      { title: "CONTENU PLANIFIE", icon: Calendar, iconColor: "text-blue-500", items: [
        { id: 1, primary: "Article: ROI automatisation", secondary: "Blog · Mercredi", value: "Draft" },
        { id: 2, primary: "Post LinkedIn: Temoignage", secondary: "Reseau · Vendredi", value: "Planifie" },
      ]},
      { title: "ANALYTICS", icon: BarChart3, iconColor: "text-green-500", items: [
        { id: 1, primary: "Site web", secondary: "2.3K visites/sem", value: "+12%" },
        { id: 2, primary: "LinkedIn", secondary: "8.5K impressions", value: "+25%" },
        { id: 3, primary: "Taux conversion", secondary: "Lead → Client", value: "3.2%" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Plan Contenu Q2", progress: 70, by: "CMO", time: "2h", type: "PL" },
    ],
    activity: [
      { id: 1, text: "CMO a genere 12 leads LinkedIn", time: "matin" },
      { id: 2, text: "Campagne email lancee — 340 ouvertures", time: "hier" },
    ],
  },
  BCS: {
    name: "Strategie", color: "text-red-600", ringColor: "ring-red-500",
    summary: "Pipeline a 475K$. Soumission MetalPro deadline jeudi. 3 prospects en qualification.",
    kpis: [
      { label: "Pipeline", value: "475K$", trend: "+12%", positive: true },
      { label: "Win rate", value: "35%" },
      { label: "Soumissions", value: "2" },
      { label: "Prospects", value: "12" },
    ],
    widgets: [
      { title: "SOUMISSIONS", icon: FileText, iconColor: "text-red-500", badge: "2", items: [
        { id: 1, primary: "MetalPro — Robot soudure", secondary: "Deadline jeudi · 125K$", urgent: true, progress: 85 },
        { id: 2, primary: "Acier Quebec — Palettisation", secondary: "15 mars · 85K$", progress: 40 },
      ]},
      { title: "PIPELINE COMPLET", icon: TrendingUp, iconColor: "text-green-500", items: [
        { id: 1, primary: "MetalPro inc.", secondary: "Soumission", value: "125K$", progress: 75 },
        { id: 2, primary: "TechnoSoud", secondary: "Negociation", value: "210K$", progress: 60 },
        { id: 3, primary: "Acier Quebec", secondary: "Qualification", value: "85K$", progress: 40 },
      ]},
      { title: "CLIENTS ACTIFS", icon: Handshake, iconColor: "text-blue-500", items: [
        { id: 1, primary: "FabriquePro inc.", secondary: "Contrat actif", value: "180K$" },
        { id: 2, primary: "SteelMax", secondary: "Phase 2 en cours", value: "95K$" },
      ]},
      { title: "PROSPECTION", icon: Target, iconColor: "text-orange-500", items: [
        { id: 1, primary: "5 nouveaux contacts LinkedIn", secondary: "Cette semaine", tag: "new" },
        { id: 2, primary: "3 demandes entrantes", secondary: "Site web · A qualifier", tag: "new" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Soumission MetalPro V2", progress: 85, by: "CSO", time: "3h", type: "SO" },
    ],
    activity: [
      { id: 1, text: "CSO a mis a jour la soumission MetalPro", time: "3h" },
      { id: 2, text: "3 nouveaux prospects qualifies", time: "hier" },
    ],
  },
  BOO: {
    name: "Operations", color: "text-orange-600", ringColor: "ring-orange-500",
    summary: "2 process optimises cette semaine. Ligne assemblage #1 a 87% efficacite. 4 projets actifs.",
    kpis: [
      { label: "Efficacite", value: "87%", trend: "+3%", positive: true },
      { label: "Process", value: "4" },
      { label: "Incidents", value: "1", positive: false },
      { label: "Qualite", value: "98.5%", positive: true },
    ],
    widgets: [
      { title: "PROCESS EN COURS", icon: Cog, iconColor: "text-orange-500", badge: "4", items: [
        { id: 1, primary: "Optimisation ligne assemblage #1", secondary: "Gain +12% efficacite", progress: 87 },
        { id: 2, primary: "Reduction setup time soudure", secondary: "De 45min → 20min", progress: 65 },
        { id: 3, primary: "Lean 5S — entrepot", secondary: "Phase 3/5", progress: 60 },
      ]},
      { title: "KPIs PRODUCTION", icon: Gauge, iconColor: "text-blue-500", items: [
        { id: 1, primary: "OEE global", secondary: "Overall Equipment Effectiveness", value: "72%" },
        { id: 2, primary: "Taux de rejet", secondary: "Ce mois", value: "1.5%" },
        { id: 3, primary: "Temps de cycle moyen", secondary: "Ligne principale", value: "4.2 min" },
      ]},
      { title: "QUALITE & CONFORMITE", icon: ShieldCheck, iconColor: "text-green-500", items: [
        { id: 1, primary: "ISO 9001 — audit interne", secondary: "Planifie avril", tag: "ok" },
        { id: 2, primary: "Non-conformite #NC-24", secondary: "Soudure lot B-12 · Resolu", tag: "ok" },
      ]},
      { title: "RESSOURCES & PLANNING", icon: Users, iconColor: "text-purple-500", items: [
        { id: 1, primary: "Equipe production", secondary: "12 operateurs · 2 superviseurs", value: "14" },
        { id: 2, primary: "Charge usine", secondary: "Cette semaine", value: "85%", progress: 85 },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Rapport Lean 5S", progress: 60, by: "COO", time: "4h", type: "RL" },
    ],
    activity: [
      { id: 1, text: "COO a optimise 2 process cette semaine", time: "2h" },
      { id: 2, text: "Ligne assemblage #1 a 87% efficacite", time: "hier" },
    ],
  },
  BFA: {
    name: "Production", color: "text-slate-600", ringColor: "ring-slate-500",
    summary: "Ligne #1 a 87% efficacite. 2 projets automatisation en cours. Audit qualite planifie.",
    kpis: [
      { label: "OEE", value: "72%", trend: "+4%", positive: true },
      { label: "Rejet", value: "1.5%" },
      { label: "Projets", value: "3" },
      { label: "Machines", value: "12" },
    ],
    widgets: [
      { title: "LIGNES DE PRODUCTION", icon: Cog, iconColor: "text-slate-500", badge: "3", items: [
        { id: 1, primary: "Ligne assemblage #1", secondary: "12 postes · 87% efficacite", progress: 87 },
        { id: 2, primary: "Ligne soudure #2", secondary: "8 postes · En optimisation", progress: 72 },
        { id: 3, primary: "Cellule peinture", secondary: "4 postes · Stable", progress: 95 },
      ]},
      { title: "PROJETS AUTOMATISATION", icon: Cpu, iconColor: "text-blue-500", badge: "2", items: [
        { id: 1, primary: "Robot soudure MIG", secondary: "Evaluation 3 fournisseurs", progress: 65 },
        { id: 2, primary: "Palettisation automatique", secondary: "Etude de faisabilite", progress: 20 },
        { id: 3, primary: "Vision inspection qualite", secondary: "Prospection", progress: 5 },
      ]},
      { title: "MAINTENANCE", icon: Settings, iconColor: "text-orange-500", items: [
        { id: 1, primary: "Preventive — planifiee ce mois", secondary: "8 machines", value: "12h" },
        { id: 2, primary: "Correctif — presse #3", secondary: "Piece en commande", urgent: true },
        { id: 3, primary: "Calibration laser", secondary: "Completee hier", tag: "ok" },
      ]},
      { title: "INVENTAIRE & MATERIAUX", icon: BarChart3, iconColor: "text-green-500", items: [
        { id: 1, primary: "Acier inoxydable", secondary: "Stock 45 jours", value: "22T" },
        { id: 2, primary: "Aluminium 6061", secondary: "Stock 30 jours", value: "8T" },
        { id: 3, primary: "Consommables soudure", secondary: "A commander", urgent: true },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Plan maintenance Q1", progress: 80, by: "Factory", time: "3h", type: "PM" },
      { id: 2, name: "Specs Robot Soudure", progress: 65, by: "CTO", time: "hier", type: "SP" },
    ],
    activity: [
      { id: 1, text: "Ligne #1 a atteint 87% efficacite", time: "2h" },
      { id: 2, text: "Commande acier placee chez fournisseur", time: "hier" },
    ],
  },
  BHR: {
    name: "Ressources Humaines", color: "text-teal-600", ringColor: "ring-teal-500",
    summary: "2 postes ouverts. Turnover Q1 a 8%. Evaluation de performance Q1 planifiee.",
    kpis: [
      { label: "Effectifs", value: "28" },
      { label: "Postes ouverts", value: "2" },
      { label: "Turnover", value: "8%", positive: false },
      { label: "Satisfaction", value: "82%", positive: true },
    ],
    widgets: [
      { title: "RECRUTEMENT", icon: Users, iconColor: "text-teal-500", badge: "2", items: [
        { id: 1, primary: "Dev senior full-stack", secondary: "6 candidats · Entrevues", progress: 60 },
        { id: 2, primary: "Operateur CNC", secondary: "3 candidats · Screening", progress: 30 },
        { id: 3, primary: "Stagiaire marketing", secondary: "Offre acceptee", tag: "ok" },
      ]},
      { title: "FORMATION & DEV", icon: Target, iconColor: "text-blue-500", items: [
        { id: 1, primary: "Formation soudure robotisee", secondary: "4 employes · Mars", value: "16h" },
        { id: 2, primary: "Certification ISO 9001", secondary: "2 superviseurs · Avril", value: "8h" },
        { id: 3, primary: "Leadership coaching", secondary: "3 gestionnaires · En cours", value: "12h" },
      ]},
      { title: "EVALUATIONS", icon: FileCheck, iconColor: "text-purple-500", items: [
        { id: 1, primary: "Evaluations Q1", secondary: "28 employes · Planifie mars", progress: 10 },
        { id: 2, primary: "Plan de dev individuel", secondary: "12 completes / 28", progress: 43 },
      ]},
      { title: "BIEN-ETRE & CULTURE", icon: ShieldCheck, iconColor: "text-green-500", items: [
        { id: 1, primary: "Sondage satisfaction", secondary: "Score 82% · +3pts", value: "82%" },
        { id: 2, primary: "Comite social", secondary: "Activite team building · 15 mars" },
        { id: 3, primary: "Programme sante", secondary: "18 participants actifs" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Politique teletravail V2", progress: 90, by: "CHRO", time: "1h", type: "PO" },
    ],
    activity: [
      { id: 1, text: "Stagiaire marketing a accepte l'offre", time: "3h" },
      { id: 2, text: "6 candidats preselectionnees dev senior", time: "hier" },
    ],
  },
  BRO: {
    name: "Vente", color: "text-amber-600", ringColor: "ring-amber-500",
    summary: "Pipeline 475K$. 5 deals actifs. Win rate 35%. Objectif Q1 a 82%.",
    kpis: [
      { label: "Pipeline", value: "475K$", trend: "+12%", positive: true },
      { label: "Win rate", value: "35%" },
      { label: "Deals actifs", value: "5" },
      { label: "Obj Q1", value: "82%", positive: true },
    ],
    widgets: [
      { title: "PIPELINE ACTIF", icon: TrendingUp, iconColor: "text-amber-500", items: [
        { id: 1, primary: "MetalPro inc.", secondary: "Soumission · Deadline jeudi", value: "125K$", progress: 75 },
        { id: 2, primary: "TechnoSoud", secondary: "Negociation avancee", value: "210K$", progress: 60 },
        { id: 3, primary: "Acier Quebec", secondary: "Qualification", value: "85K$", progress: 40 },
      ]},
      { title: "ACTIVITE COMMERCIALE", icon: Handshake, iconColor: "text-blue-500", badge: "8", items: [
        { id: 1, primary: "Appels cette semaine", secondary: "12 completes · 3 suivis", value: "12" },
        { id: 2, primary: "Rencontres planifiees", secondary: "3 cette semaine", value: "3" },
        { id: 3, primary: "Propositions envoyees", secondary: "2 en attente reponse", value: "2" },
      ]},
      { title: "CLIENTS EXISTANTS", icon: Users, iconColor: "text-green-500", items: [
        { id: 1, primary: "FabriquePro inc.", secondary: "Contrat 180K$ · Renouvellement juin", tag: "ok" },
        { id: 2, primary: "SteelMax", secondary: "Phase 2 · 95K$", progress: 65 },
        { id: 3, primary: "PrecisionMetal", secondary: "Maintenance annuelle", value: "45K$" },
      ]},
      { title: "OBJECTIFS & FORECAST", icon: Target, iconColor: "text-red-500", items: [
        { id: 1, primary: "Objectif Q1", secondary: "350K$ / 425K$ cible", value: "82%", progress: 82 },
        { id: 2, primary: "Forecast Q2", secondary: "Basé sur pipeline actif", value: "520K$" },
        { id: 3, primary: "Nouveaux comptes Q1", secondary: "Cible 4 · Realise 3", value: "75%" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Soumission MetalPro V2", progress: 85, by: "CRO", time: "3h", type: "SO" },
      { id: 2, name: "Forecast Q2", progress: 50, by: "CRO", time: "hier", type: "FC" },
    ],
    activity: [
      { id: 1, text: "Soumission MetalPro mise a jour", time: "3h" },
      { id: 2, text: "TechnoSoud — rencontre positive", time: "hier" },
    ],
  },
  BSE: {
    name: "Securite", color: "text-zinc-600", ringColor: "ring-zinc-500",
    summary: "Score securite 58%. 2 alertes actives. Audit cyber planifie mars.",
    kpis: [
      { label: "Score", value: "58%", positive: false },
      { label: "Alertes", value: "2", positive: false },
      { label: "Incidents", value: "0", positive: true },
      { label: "Conformite", value: "72%" },
    ],
    widgets: [
      { title: "ALERTES ACTIVES", icon: AlertTriangle, iconColor: "text-red-500", badge: "2", items: [
        { id: 1, primary: "Firewall — 3 tentatives bloquees", secondary: "Ce matin · IPs suspectes", urgent: true },
        { id: 2, primary: "Certificat SSL expire dans 15j", secondary: "carlosai.usinebleue.ai", urgent: true },
        { id: 3, primary: "Backup echoue — serveur #2", secondary: "Hier soir · Espace disque", tag: "error" },
      ]},
      { title: "CONFORMITE", icon: ShieldCheck, iconColor: "text-green-500", items: [
        { id: 1, primary: "Politique mots de passe", secondary: "85% conformes", progress: 85 },
        { id: 2, primary: "MFA active", secondary: "12/28 employes", progress: 43 },
        { id: 3, primary: "Formation phishing", secondary: "Planifiee mars", progress: 0 },
      ]},
      { title: "AUDITS & TESTS", icon: FileText, iconColor: "text-blue-500", items: [
        { id: 1, primary: "Audit cybersecurite", secondary: "Planifie 15 mars · Externe", value: "Q1" },
        { id: 2, primary: "Test penetration", secondary: "Dernier: dec 2025", value: "Planifie" },
      ]},
      { title: "ACCES & IDENTITE", icon: Users, iconColor: "text-purple-500", items: [
        { id: 1, primary: "Comptes actifs", secondary: "28 employes + 4 externes", value: "32" },
        { id: 2, primary: "Acces privilegies", secondary: "3 admins systeme", value: "3" },
        { id: 3, primary: "Revue acces Q1", secondary: "Planifiee mars", progress: 0 },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Politique Securite V3", progress: 70, by: "CISO", time: "2h", type: "PS" },
    ],
    activity: [
      { id: 1, text: "3 tentatives d'intrusion bloquees", time: "matin" },
      { id: 2, text: "Mise a jour firewall completee", time: "hier" },
    ],
  },
  BLE: {
    name: "Legal", color: "text-indigo-600", ringColor: "ring-indigo-500",
    summary: "2 contrats en revue. Conformite RGPD a 78%. Renouvellement assurances avril.",
    kpis: [
      { label: "Contrats", value: "12" },
      { label: "En revue", value: "2" },
      { label: "Conformite", value: "78%" },
      { label: "Litiges", value: "0", positive: true },
    ],
    widgets: [
      { title: "CONTRATS EN COURS", icon: FileText, iconColor: "text-indigo-500", badge: "2", items: [
        { id: 1, primary: "Contrat MetalPro — Phase 2", secondary: "Revue juridique · Deadline vendredi", urgent: true, progress: 70 },
        { id: 2, primary: "NDA — TechnoSoud", secondary: "Signature electronique envoyee", progress: 90 },
        { id: 3, primary: "Bail usine — renouvellement", secondary: "Avril 2026 · A preparer", progress: 15 },
      ]},
      { title: "CONFORMITE & REGLEMENTATION", icon: ShieldCheck, iconColor: "text-green-500", items: [
        { id: 1, primary: "RGPD / Loi 25", secondary: "Politique mise a jour", progress: 78 },
        { id: 2, primary: "Normes environnement", secondary: "Certification a jour", tag: "ok" },
        { id: 3, primary: "Sante securite travail", secondary: "Rapport annuel a deposer", value: "Mars" },
      ]},
      { title: "PROPRIETE INTELLECTUELLE", icon: Target, iconColor: "text-purple-500", items: [
        { id: 1, primary: "Marque GhostX", secondary: "Deposee Canada + US", tag: "ok" },
        { id: 2, primary: "Brevet GHML", secondary: "En preparation · Q2", progress: 25 },
      ]},
      { title: "ASSURANCES", icon: DollarSign, iconColor: "text-orange-500", items: [
        { id: 1, primary: "RC professionnelle", secondary: "Renouvellement avril", value: "12K$/an" },
        { id: 2, primary: "Cyber assurance", secondary: "Active · Couverture 500K$", tag: "ok" },
        { id: 3, primary: "Assurance usine", secondary: "Active · Couverture 2M$", tag: "ok" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Contrat MetalPro V2", progress: 70, by: "Legal", time: "2h", type: "CT" },
    ],
    activity: [
      { id: 1, text: "NDA TechnoSoud envoye pour signature", time: "1h" },
      { id: 2, text: "Politique RGPD mise a jour", time: "hier" },
    ],
  },
  BPO: {
    name: "Innovation", color: "text-fuchsia-600", ringColor: "ring-fuchsia-500",
    summary: "3 projets R&D actifs. Prototype IA vision en test. Budget innovation 85K$.",
    kpis: [
      { label: "Projets R&D", value: "3" },
      { label: "Prototypes", value: "1" },
      { label: "Budget", value: "85K$" },
      { label: "Brevets", value: "1", positive: true },
    ],
    widgets: [
      { title: "PROJETS R&D", icon: Cpu, iconColor: "text-fuchsia-500", badge: "3", items: [
        { id: 1, primary: "IA vision inspection qualite", secondary: "Prototype en test usine", progress: 65 },
        { id: 2, primary: "Predictive maintenance IoT", secondary: "Phase recherche · 3 capteurs", progress: 30 },
        { id: 3, primary: "Optimisation coupes laser IA", secondary: "Concept valide", progress: 15 },
      ]},
      { title: "VEILLE TECHNOLOGIQUE", icon: TrendingUp, iconColor: "text-blue-500", items: [
        { id: 1, primary: "IA generative manufacturing", secondary: "3 articles analyses ce mois" },
        { id: 2, primary: "Cobots nouvelle generation", secondary: "Demo prevue · Universal Robots" },
        { id: 3, primary: "Jumeaux numeriques", secondary: "Evaluation Siemens NX" },
      ]},
      { title: "PARTENARIATS", icon: Handshake, iconColor: "text-green-500", items: [
        { id: 1, primary: "Universite Laval — IA", secondary: "Projet conjoint · Actif", tag: "ok" },
        { id: 2, primary: "CDPQ — programme PME", secondary: "Candidature soumise", progress: 40 },
      ]},
      { title: "IDEES & PIPELINE", icon: Target, iconColor: "text-orange-500", items: [
        { id: 1, primary: "Bot Marketplace (Orbit9)", secondary: "Concept valide · Sprint B" },
        { id: 2, primary: "Voix ElevenLabs", secondary: "Integration planifiee · Sprint B" },
        { id: 3, primary: "Multi-tenant platform", secondary: "Architecture en design · Sprint D" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Rapport IA Vision V1", progress: 65, by: "CPO", time: "4h", type: "RR" },
    ],
    activity: [
      { id: 1, text: "Prototype IA vision teste en usine", time: "4h" },
      { id: 2, text: "Veille cobots — 2 options identifiees", time: "hier" },
    ],
  },
  BIO: {
    name: "Systemes", color: "text-cyan-600", ringColor: "ring-cyan-500",
    summary: "8 systemes actifs. Migration ERP planifiee Q2. 99.2% uptime global.",
    kpis: [
      { label: "Systemes", value: "8" },
      { label: "Uptime", value: "99.2%", positive: true },
      { label: "Tickets", value: "3" },
      { label: "Projets", value: "2" },
    ],
    widgets: [
      { title: "SYSTEMES & APPLICATIONS", icon: Server, iconColor: "text-cyan-500", items: [
        { id: 1, primary: "ERP (ancien)", secondary: "Operationnel · Migration Q2", tag: "ok" },
        { id: 2, primary: "CRM (HubSpot)", secondary: "22 contacts actifs", tag: "ok" },
        { id: 3, primary: "CarlOS (IA)", secondary: "API 99.9% uptime", tag: "ok" },
      ]},
      { title: "PROJETS TI", icon: Cpu, iconColor: "text-blue-500", badge: "2", items: [
        { id: 1, primary: "Migration ERP", secondary: "Evaluation 3 solutions · Q2", progress: 15 },
        { id: 2, primary: "Tableau de bord BI", secondary: "PowerBI · En developpement", progress: 40 },
        { id: 3, primary: "Integration Nango", secondary: "Planifie Sprint C", progress: 0 },
      ]},
      { title: "DONNEES & ANALYTICS", icon: BarChart3, iconColor: "text-green-500", items: [
        { id: 1, primary: "PostgreSQL CarlOS", secondary: "5 tables · 2.3 GB", tag: "ok" },
        { id: 2, primary: "Backup quotidien", secondary: "Dernier: ce matin 03:00", tag: "ok" },
        { id: 3, primary: "Rapport BI mensuel", secondary: "Genere automatiquement", value: "Auto" },
      ]},
      { title: "SUPPORT & TICKETS", icon: AlertCircle, iconColor: "text-orange-500", badge: "3", items: [
        { id: 1, primary: "Google OAuth expire", secondary: "Calendar/Docs · P1", urgent: true },
        { id: 2, primary: "Imprimante reseau #2", secondary: "Hors ligne · P2" },
        { id: 3, primary: "Acces VPN nouveau dev", secondary: "En attente · P3" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Cahier charges ERP", progress: 30, by: "CIO", time: "hier", type: "CC" },
    ],
    activity: [
      { id: 1, text: "Backup automatique complete", time: "03:00" },
      { id: 2, text: "Evaluation ERP — 3 demos planifiees", time: "hier" },
    ],
  },
  BCC: {
    name: "Communication", color: "text-rose-600", ringColor: "ring-rose-500",
    summary: "Strategie comm Q2 en prep. 2 communiques planifies. Branding GhostX en cours.",
    kpis: [
      { label: "Communiques", value: "2" },
      { label: "Medias", value: "5 contacts" },
      { label: "Brand score", value: "68%" },
      { label: "Reach", value: "15K" },
    ],
    widgets: [
      { title: "COMMUNICATIONS", icon: Megaphone, iconColor: "text-rose-500", badge: "2", items: [
        { id: 1, primary: "Communique lancement GhostX", secondary: "Draft V2 · Revue requise", progress: 70 },
        { id: 2, primary: "Newsletter Q1 investisseurs", secondary: "Planifie 10 mars", progress: 20 },
        { id: 3, primary: "Temoignage client FabriquePro", secondary: "Video en montage", progress: 55 },
      ]},
      { title: "BRANDING & IMAGE", icon: Target, iconColor: "text-blue-500", items: [
        { id: 1, primary: "Charte graphique GhostX", secondary: "Finalisation couleurs + typo", progress: 85 },
        { id: 2, primary: "Site web ghostx.ai", secondary: "Redesign planifie · Sprint C" },
        { id: 3, primary: "Kit media presse", secondary: "A creer · Q2" },
      ]},
      { title: "RELATIONS MEDIAS", icon: FileText, iconColor: "text-purple-500", items: [
        { id: 1, primary: "Les Affaires", secondary: "Contact etabli · Article planifie" },
        { id: 2, primary: "TVA Nouvelles", secondary: "Pitch envoye · En attente" },
        { id: 3, primary: "LinkedIn Thought Leadership", secondary: "3 articles publies ce mois", value: "12K vues" },
      ]},
      { title: "EVENEMENTS", icon: Calendar, iconColor: "text-green-500", items: [
        { id: 1, primary: "Salon Manufacturier QC", secondary: "15-17 avril · Kiosque confirme", value: "Avril" },
        { id: 2, primary: "Webinaire IA manufacturiere", secondary: "25 mars · 45 inscrits", value: "45" },
      ]},
    ],
    recentFiles: [
      { id: 1, name: "Communique GhostX V2", progress: 70, by: "CCO", time: "2h", type: "CO" },
    ],
    activity: [
      { id: 1, text: "Draft communique GhostX V2 soumis", time: "2h" },
      { id: 2, text: "45 inscrits au webinaire", time: "hier" },
    ],
  },
};

const DEFAULT_CONFIG: DeptConfig = {
  name: "Departement", color: "text-gray-600", ringColor: "ring-gray-500",
  summary: "Ce departement est en cours de configuration par votre Bot C-Level.",
  kpis: [{ label: "Status", value: "Actif" }],
  widgets: [{ title: "EN COURS", icon: Clock, iconColor: "text-blue-500", items: [
    { id: 1, primary: "Configuration initiale", secondary: "Le bot se calibre a votre entreprise" },
  ]}],
  recentFiles: [],
  activity: [{ id: 1, text: "Bot en cours d'initialisation", time: "maintenant" }],
};

export function DepartmentDetailView() {
  const { activeBotCode, activeBot, setActiveView } = useFrameMaster();
  const config = DEPT_CONFIGS[activeBotCode] || DEFAULT_CONFIG;
  const avatar = BOT_AVATAR[activeBotCode];
  const subtitle = BOT_SUBTITLE[activeBotCode] || config.name;
  const botName = activeBot?.nom || config.name;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* Header bot — identique V1 */}
      <div className="bg-white border-b px-4 h-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={botName} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200" />
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Cpu className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <h1 className="text-sm font-bold">{botName} — {subtitle}</h1>
          <Badge variant="secondary" className="text-xs h-5">{config.name}</Badge>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          {config.kpis.map((kpi, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <span className="text-xs font-bold">{kpi.value}</span>
              {kpi.trend && (
                <span className={`text-xs font-semibold ${kpi.positive !== false ? "text-green-600" : "text-red-600"}`}>
                  {kpi.trend}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Dashboard | Chat | Reglages — identique V1 */}
      <Tabs defaultValue="dashboard" className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b px-4 shrink-0">
          <TabsList className="h-9">
            <TabsTrigger value="dashboard" className="text-xs">Tableau de bord</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Reglages</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Dashboard */}
        <TabsContent value="dashboard" className="flex-1 flex flex-col p-3 gap-2.5 min-h-0 mt-0 overflow-auto">
          {/* Bandeau proactif */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-3 shrink-0">
            {avatar ? (
              <img src={avatar} alt={botName} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 bg-gray-200 rounded-full shrink-0" />
            )}
            <p className="text-xs text-gray-700 flex-1">
              <b>{botName}:</b> {config.summary}
            </p>
            <Button size="sm" className="h-6 text-xs shrink-0 px-2" onClick={() => setActiveView("discussion")}>
              Repondre <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          {/* 4 widgets en grille — identique V1 */}
          <div className="grid grid-cols-4 gap-2.5 shrink-0">
            {config.widgets.map((widget, wi) => {
              const colorMap: Record<string, string> = {
                "text-red-500": "from-red-50 to-rose-50 border-red-100",
                "text-blue-500": "from-blue-50 to-indigo-50 border-blue-100",
                "text-purple-500": "from-purple-50 to-violet-50 border-purple-100",
                "text-green-500": "from-green-50 to-emerald-50 border-green-100",
                "text-orange-500": "from-orange-50 to-amber-50 border-orange-100",
                "text-pink-500": "from-pink-50 to-rose-50 border-pink-100",
                "text-teal-500": "from-teal-50 to-cyan-50 border-teal-100",
                "text-amber-500": "from-amber-50 to-yellow-50 border-amber-100",
                "text-cyan-500": "from-cyan-50 to-sky-50 border-cyan-100",
                "text-fuchsia-500": "from-fuchsia-50 to-pink-50 border-fuchsia-100",
                "text-slate-500": "from-slate-50 to-gray-50 border-slate-100",
                "text-indigo-500": "from-indigo-50 to-blue-50 border-indigo-100",
                "text-rose-500": "from-rose-50 to-pink-50 border-rose-100",
              };
              const grad = colorMap[widget.iconColor] || "from-gray-50 to-slate-50 border-gray-100";
              return (
              <div key={wi} className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
                <div className={`bg-gradient-to-r ${grad} px-2.5 py-1.5 border-b flex items-center gap-1.5`}>
                  <widget.icon className={`h-3.5 w-3.5 ${widget.iconColor}`} />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">{widget.title}</h3>
                  {widget.badge && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">{widget.badge}</Badge>
                  )}
                </div>
                <div className="p-2.5">
                <div className="space-y-1.5">
                  {widget.items.map((item) => (
                    <div key={item.id} className="cursor-pointer group" onClick={() => setActiveView("discussion")}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          {item.urgent && <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-800 truncate group-hover:text-blue-600">{item.primary}</p>
                            {item.secondary && <p className="text-[10px] text-gray-400">{item.secondary}</p>}
                          </div>
                        </div>
                        {item.value && <span className="text-xs font-bold text-gray-600 shrink-0 ml-1">{item.value}</span>}
                        {item.tag && (
                          <Badge variant="outline" className={`text-[10px] px-1 py-0 h-3.5 shrink-0 ml-1 ${
                            item.tag === "error" || item.tag === "hot" ? "border-red-300 text-red-500" :
                            item.tag === "ok" ? "border-green-300 text-green-600" :
                            item.tag === "client" ? "border-orange-300 text-orange-600" :
                            item.tag === "warm" ? "border-yellow-300 text-yellow-600" :
                            item.tag === "new" ? "border-blue-300 text-blue-500" :
                            "border-gray-300 text-gray-500"
                          }`}>{item.tag}</Badge>
                        )}
                      </div>
                      {item.progress !== undefined && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Progress value={item.progress} className="flex-1 h-1" />
                          <span className="text-[10px] text-gray-400 w-6">{item.progress}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Zone bas — Derniers Dossiers + Activite — identique V1 */}
          <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0">
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-2.5 py-1.5 border-b border-orange-100 flex items-center gap-1.5 shrink-0">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex-1">Derniers Dossiers</h3>
                <Button variant="link" className="p-0 h-auto text-[10px]">
                  Voir tout <ExternalLink className="ml-0.5 h-3 w-3" />
                </Button>
              </div>
              <div className="p-2.5 flex-1 min-h-0">
              <div className="space-y-2 flex-1 overflow-y-auto">
                {config.recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setActiveView("discussion")}>
                    <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                      file.type === "CP" || file.type === "SO" || file.type === "PL" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                    }`}>{file.type}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-600">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress value={file.progress} className="flex-1 h-1" />
                        <span className="text-xs font-bold text-gray-500 w-6">{file.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{file.by}</p>
                      <p className="text-[10px] text-gray-300">{file.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-2.5 py-1.5 border-b border-green-100 flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Activite</h3>
              </div>
              <div className="p-2.5 flex-1 min-h-0">
              <div className="space-y-2 flex-1 overflow-y-auto">
                {config.activity.map((update) => (
                  <div key={update.id} className="flex items-center gap-2">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full shrink-0" />
                    )}
                    <p className="text-xs text-gray-700 flex-1 leading-tight">{update.text}</p>
                    <span className="text-xs text-gray-400 shrink-0">{update.time}</span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab Chat */}
        <TabsContent value="chat" className="flex-1 flex items-center justify-center mt-0">
          <div className="text-center text-muted-foreground">
            {avatar ? (
              <img src={avatar} alt={botName} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-2 ring-gray-200" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Cpu className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <p className="font-semibold">Chat avec {botName}</p>
            <p className="text-xs mt-1">Utilise la barre de chat en bas pour parler a {botName}</p>
            <Button size="sm" className="mt-3" onClick={() => setActiveView("discussion")}>
              Ouvrir le chat
            </Button>
          </div>
        </TabsContent>

        {/* Tab Reglages */}
        <TabsContent value="settings" className="flex-1 p-4 mt-0 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Personnalite de {botName}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Tonalite</p>
                    <p className="text-xs text-muted-foreground">Niveau de formalite des reponses</p>
                  </div>
                  <div className="flex gap-1">
                    {["Direct", "Equilibre", "Formel"].map((t) => (
                      <Badge key={t} variant={t === "Direct" ? "default" : "outline"} className="text-xs cursor-pointer">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Profondeur d'analyse</p>
                    <p className="text-xs text-muted-foreground">Detail des reponses</p>
                  </div>
                  <div className="flex gap-1">
                    {["Rapide", "Standard", "Approfondi"].map((t) => (
                      <Badge key={t} variant={t === "Standard" ? "default" : "outline"} className="text-xs cursor-pointer">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Mode proactif</p>
                    <p className="text-xs text-muted-foreground">{botName} envoie des suggestions automatiquement</p>
                  </div>
                  <Badge variant="default" className="text-xs cursor-pointer">Active</Badge>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Ghost cognitif actif</h3>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {avatar ? (
                  <img src={avatar} alt={botName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold">{botName}</p>
                  <p className="text-xs text-muted-foreground">{activeBot?.titre || config.name} · Trisociation active</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Notifications</h3>
              <div className="space-y-2">
                {["Alertes urgentes", "Resume quotidien", "Mises a jour dossiers", "Suggestions proactives"].map((n) => (
                  <div key={n} className="flex items-center justify-between">
                    <p className="text-xs">{n}</p>
                    <Badge variant="default" className="text-xs cursor-pointer">On</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
