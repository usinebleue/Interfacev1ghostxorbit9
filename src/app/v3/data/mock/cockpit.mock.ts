/**
 * cockpit.mock.ts — Mock data for CockpitView
 *
 * Extracted from CockpitView.tsx (lines 29-1248)
 * Contains: VitaaItem, DashboardBlocItem, DashboardBlocConfig, DeptDashboardConfig types
 *           DEPT_DASHBOARD_SECTIONS, WORK_ACTIONS, DEPT_ORDER, COCKPIT_EXTRA_BLOCS data
 */

import {
  Activity, Atom, Award, Banknote, BarChart3, Bell,
  BookOpen, Bot, Brain, Bug, Building2, Calendar,
  ClipboardCheck, Clock, Cog, Cpu, Crown, Database, DollarSign,
  Eye, FileLock, FileText, Gauge, Gavel, Globe, GraduationCap,
  Hammer, Handshake, HardHat, Heart, ListChecks, Lock,
  MessageCircle, Network, Newspaper, Package, PieChart, Play,
  Receipt, Rocket, Scale, Search, Settings, Shield, ShieldCheck,
  ShoppingBag, Sparkles, Star, TrendingUp, Truck,
  User, Users, Wallet, Wrench, Zap,
} from "lucide-react";
import type { PhaseKey } from "../../sections/shared/dept-data";


export interface VitaaItem {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: React.ElementType;
}

export interface DashboardBlocItem {
  primary: string;
  value?: string;
  valueColor?: string;
  pct?: number;
  pctColor?: string;
  secondary: string;
  bot?: string;
  phase?: PhaseKey;
  urgent?: boolean;
  deliverable?: string;
  focusType?: string;
}

export interface DashboardBlocConfig {
  icon: React.ElementType;
  title: string;
  count?: number;
  items: DashboardBlocItem[];
}

export interface DeptDashboardConfig {
  deptLabel: string;
  deptFullLabel?: string;
  summary: string;
  vitaa: VitaaItem[];
  row1: DashboardBlocConfig[];
  row2: DashboardBlocConfig[];
  row3: DashboardBlocConfig[];
}


export const DEPT_DASHBOARD_SECTIONS: Record<string, DeptDashboardConfig> = {
  CEOB: {
    deptLabel: "Direction",
    deptFullLabel: "de la direction",
    summary: "Vue consolidée de l'entreprise — pilotage stratégique et gouvernance",
    vitaa: [
      { label: "Ventes", value: "890K$", delta: "+12%", up: true, icon: TrendingUp },
      { label: "Idées", value: "47", delta: "+8 ce mois", up: true, icon: Sparkles },
      { label: "Temps", value: "186h", delta: "92% alloué", up: true, icon: Clock },
      { label: "Argent", value: "2.4M$", delta: "+18%", up: true, icon: DollarSign },
      { label: "Actifs", value: "63", delta: "+5 ce mois", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Subvention MESI", value: "Nouveau", valueColor: "text-green-600", secondary: "50K$ — manufacturiers innovants" },
        { primary: "Tarifs douaniers US", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Impact potentiel 8% revenus", phase: "attention" },
        { primary: "Tendance IA manuf.", secondary: "Article CEFRIO — adoption +40%" },
      ]},
      { icon: ClipboardCheck, title: "Décisions", count: 8, items: [
        { primary: "Expansion Laval", value: "En cours", valueColor: "text-blue-600", secondary: "D-097 — validée mars", phase: "execution" },
        { primary: "Automatisation Boreal", value: "En cours", valueColor: "text-blue-600", secondary: "Cahier de projet — diagnostic + 4 solutions", phase: "creation", deliverable: "document" },
        { primary: "Nouveau CRM", value: "Approuvé", valueColor: "text-green-600", secondary: "D-101 — budget 45K$", phase: "retroaction" },
      ]},
      { icon: Award, title: "OKR", count: 4, items: [
        { primary: "Croissance 15%", pct: 72, pctColor: "bg-green-500", secondary: "Objectif annuel", phase: "execution" },
        { primary: "Budget et subventions Boreal", value: "En cours", valueColor: "text-teal-600", secondary: "Tableur financier — projections 36 mois", phase: "creation", deliverable: "spreadsheet" },
        { primary: "Marge brute 35%", pct: 91, pctColor: "bg-green-500", secondary: "En avance sur cible", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: User, title: "Comité", count: 3, items: [
        { primary: "CA mensuel", value: "12 avr.", secondary: "5 points à l'ordre du jour" },
        { primary: "Pitch Deck CA Boreal", value: "En cours", valueColor: "text-blue-600", secondary: "Présentation 8 slides — investissement 1.1M$", phase: "creation", deliverable: "presentation" },
        { primary: "1:1 avec Frank (CFO)", value: "8 avr.", secondary: "Budget Q2" },
      ]},
      { icon: Shield, title: "Gouvernance", count: 2, items: [
        { primary: "Conformité LPRPDE", pct: 85, pctColor: "bg-green-500", secondary: "Audit complété mars", phase: "retroaction" },
        { primary: "Politique ESG", value: "V2", valueColor: "text-blue-600", secondary: "Mise à jour trimestrielle", phase: "execution" },
        { primary: "Registre risques", value: "14", secondary: "3 risques élevés", phase: "attention" },
      ]},
      { icon: TrendingUp, title: "Pipeline", count: 7, items: [
        { primary: "Pipeline total", value: "3.2M$", valueColor: "text-green-600", secondary: "32 opportunités actives" },
        { primary: "Jumelage intégrateur Boreal", value: "Nouveau", valueColor: "text-green-600", secondary: "Matching Orbit⁹ — sélection fournisseur", phase: "creation", deliverable: "jumelage" },
        { primary: "Temps moyen cycle", value: "42j", secondary: "En baisse vs Q4 (51j)", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 23, items: [
        { primary: "Valider budget marketing Q2", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 10 avril", urgent: true, phase: "attention" },
        { primary: "Dashboard IoT Monitoring", value: "En cours", valueColor: "text-violet-600", secondary: "Phase 4 — 32 capteurs, alertes ML", phase: "creation", deliverable: "code" },
        { primary: "Feedback plan embauche", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 12 avril" },
      ]},
      { icon: Calendar, title: "Agenda", count: 6, items: [
        { primary: "Board meeting", value: "12 avr. 9h", secondary: "Salle virtuelle — 12 participants" },
        { primary: "Client Boréal", value: "10 avr. 14h", secondary: "Renouvellement contrat", phase: "execution" },
        { primary: "Demo investisseurs", value: "18 avr. 10h", secondary: "Série A — pitch deck", phase: "creation" },
      ]},
      { icon: Gauge, title: "Consolidé", count: 5, items: [
        { primary: "Revenus Q1", value: "1.2M$", valueColor: "text-green-600", secondary: "+12% vs objectif", phase: "retroaction" },
        { primary: "Marge nette", value: "8.4%", valueColor: "text-amber-600", secondary: "Cible: 10%", phase: "reflexion" },
        { primary: "Effectifs", value: "47", secondary: "3 postes ouverts" },
      ]},
    ],
  },

  CROB: {
    deptLabel: "Ventes",
    deptFullLabel: "des ventes",
    summary: "Pipeline commercial, contacts et performance des revenus",
    vitaa: [
      { label: "Ventes", value: "3.2M$", delta: "pipeline actif", up: true, icon: TrendingUp },
      { label: "Idées", value: "18", delta: "+6 leads", up: true, icon: Sparkles },
      { label: "Temps", value: "210h", delta: "88% alloué", up: true, icon: Clock },
      { label: "Argent", value: "1.8M$", delta: "Q1 réalisé", up: true, icon: DollarSign },
      { label: "Actifs", value: "247", delta: "contacts", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Appel d'offres HQ", value: "Nouveau", valueColor: "text-green-600", secondary: "Automation industrielle — 500K$" },
        { primary: "Concurrent Acme", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Nouveau produit lancé", phase: "attention" },
        { primary: "Tendance secteur", secondary: "Demande +15% automatisation" },
      ]},
      { icon: User, title: "Contacts", count: 247, items: [
        { primary: "Leads qualifiés", value: "18", valueColor: "text-green-600", secondary: "Nouveaux ce mois" },
        { primary: "Relances en retard", value: "7", valueColor: "text-red-600", secondary: ">5 jours sans suivi", phase: "attention" },
        { primary: "Score moyen lead", pct: 62, pctColor: "bg-blue-500", secondary: "Scoring automatique" },
      ]},
      { icon: FileText, title: "Soumissions", count: 12, items: [
        { primary: "En attente réponse", value: "5", valueColor: "text-amber-600", secondary: "Valeur: 890K$", phase: "reflexion" },
        { primary: "Envoyées ce mois", value: "8", secondary: "Délai moyen: 3.2 jours" },
        { primary: "Taux acceptation", pct: 42, pctColor: "bg-green-500", secondary: "Vs 38% trimestre passé", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: BarChart3, title: "Prévisions", items: [
        { primary: "Q2 projeté", value: "1.8M$", valueColor: "text-green-600", secondary: "Confiance: 72%" },
        { primary: "Annuel projeté", value: "6.4M$", valueColor: "text-blue-600", secondary: "Budget: 7M$" },
        { primary: "Écart budget", value: "-8.6%", valueColor: "text-amber-600", secondary: "Plan rattrapage actif", phase: "reflexion" },
      ]},
      { icon: Globe, title: "Territoires", count: 4, items: [
        { primary: "Montréal/Laval", value: "1.4M$", valueColor: "text-green-600", secondary: "42% du pipeline" },
        { primary: "Québec/Est", value: "680K$", secondary: "21% du pipeline" },
        { primary: "Rive-Sud/Montérégie", value: "540K$", secondary: "17% du pipeline" },
      ]},
      { icon: Award, title: "Performance", items: [
        { primary: "Atteinte quota", pct: 78, pctColor: "bg-green-500", secondary: "Q1 — 78% du 1.5M$", phase: "execution" },
        { primary: "Deals perdus", value: "6", valueColor: "text-red-600", secondary: "Analyse: prix (3), délais (2)", phase: "attention" },
        { primary: "Upsell existants", value: "4", valueColor: "text-green-600", secondary: "Valeur: 120K$", phase: "execution" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 18, items: [
        { primary: "Relance clients Boréal", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Mise à jour CRM", value: "Normal", valueColor: "text-blue-600", secondary: "12 fiches à compléter", phase: "execution" },
        { primary: "Proposition AutomatePro", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 15 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Revue pipeline", value: "8 avr. 9h", secondary: "Équipe ventes complète" },
        { primary: "Client Boréal", value: "10 avr. 14h", secondary: "Renouvellement contrat", phase: "execution" },
        { primary: "Formation CRM", value: "15 avr. 10h", secondary: "Nouveaux outils scoring" },
      ]},
      { icon: TrendingUp, title: "Pipeline ventes", count: 32, items: [
        { primary: "Valeur totale", value: "3.2M$", valueColor: "text-green-600", secondary: "32 opportunités actives" },
        { primary: "Closings ce mois", value: "4", valueColor: "text-blue-600", secondary: "Valeur: 380K$", phase: "execution" },
        { primary: "Win rate", pct: 28, pctColor: "bg-amber-500", secondary: "Cible: 35%", phase: "reflexion" },
      ]},
    ],
  },

  CFOB: {
    deptLabel: "Finances",
    deptFullLabel: "des finances",
    summary: "Santé financière, trésorerie et conformité comptable",
    vitaa: [
      { label: "Ventes", value: "287K$", delta: "A/R ouvert", up: false, icon: TrendingUp },
      { label: "Idées", value: "6", delta: "projets actifs", up: true, icon: Sparkles },
      { label: "Temps", value: "160h", delta: "95% alloué", up: true, icon: Clock },
      { label: "Argent", value: "1.2M$", delta: "cash dispo", up: true, icon: DollarSign },
      { label: "Actifs", value: "1.8M$", delta: "nets", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Taux directeur BoC", value: "Info", valueColor: "text-blue-600", secondary: "Prochaine annonce: 16 avril" },
        { primary: "RS&DE fédéral", value: "Nouveau", valueColor: "text-green-600", secondary: "Crédit estimé: 68K$" },
        { primary: "Réforme fiscale QC", secondary: "Impact PME manufacturières" },
      ]},
      { icon: Receipt, title: "Facturation", count: 28, items: [
        { primary: "À recevoir", value: "287K$", valueColor: "text-amber-600", secondary: "28 factures ouvertes" },
        { primary: "En retard >30j", value: "43K$", valueColor: "text-red-600", secondary: "4 clients — suivi actif", phase: "attention" },
        { primary: "DSO moyen", value: "38j", secondary: "Cible: <35 jours" },
      ]},
      { icon: Wallet, title: "Trésorerie", items: [
        { primary: "Solde bancaire", value: "1.2M$", valueColor: "text-green-600", secondary: "Au 6 avril 2026" },
        { primary: "Runway", value: "14 mois", valueColor: "text-green-600", secondary: "Au rythme actuel", phase: "retroaction" },
        { primary: "Prochaine paie", value: "15 avr.", secondary: "Montant: 189K$" },
      ]},
    ],
    row2: [
      { icon: ShoppingBag, title: "Dépenses", items: [
        { primary: "Opérationnelles", value: "187K$/mois", secondary: "Stable vs Q4" },
        { primary: "Matières premières", value: "94K$/mois", valueColor: "text-amber-600", secondary: "+8% vs trimestre passé", phase: "attention" },
        { primary: "Demandes en attente", value: "6", secondary: "Approbation requise", phase: "reflexion" },
      ]},
      { icon: BarChart3, title: "Prévisions", items: [
        { primary: "Revenus Q2", value: "1.9M$", valueColor: "text-blue-600", secondary: "Projection optimiste" },
        { primary: "Cash flow projeté", value: "+120K$", valueColor: "text-green-600", secondary: "Avant investissements" },
        { primary: "Break-even mensuel", value: "260K$", secondary: "Atteint depuis Q4", phase: "retroaction" },
      ]},
      { icon: PieChart, title: "Budgets", count: 8, items: [
        { primary: "Marketing", pct: 82, pctColor: "bg-green-500", secondary: "12K$ de 14.5K$ utilisé" },
        { primary: "R&D", pct: 65, pctColor: "bg-blue-500", secondary: "32K$ de 50K$ utilisé" },
        { primary: "Opérations", pct: 93, pctColor: "bg-amber-500", secondary: "Attention — bientôt dépassé", phase: "attention" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 14, items: [
        { primary: "Rapport financier Q1", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 10 avril", urgent: true, phase: "attention" },
        { primary: "Revoir budgets départements", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 15 avril", phase: "reflexion" },
        { primary: "Dossier RS&DE", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 30 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Comité audit", value: "10 avr. 10h", secondary: "Révision Q1" },
        { primary: "Revue mensuelle", value: "12 avr. 14h", secondary: "CFO + Direction" },
        { primary: "Clôture Q1", value: "15 avr.", secondary: "Deadline comptable", phase: "execution" },
      ]},
      { icon: BookOpen, title: "Grand-livre", items: [
        { primary: "Revenus YTD", value: "3.6M$", valueColor: "text-green-600", secondary: "Sur budget de 3.5M$", phase: "retroaction" },
        { primary: "Dépenses YTD", value: "3.1M$", secondary: "Sous budget de 3.2M$", phase: "retroaction" },
        { primary: "EBITDA", value: "412K$", valueColor: "text-green-600", secondary: "Marge: 11.4%", phase: "retroaction" },
      ]},
    ],
  },

  CMOB: {
    deptLabel: "Marketing",
    deptFullLabel: "marketing",
    summary: "Campagnes, contenu et génération de leads qualifiés",
    vitaa: [
      { label: "Ventes", value: "18", delta: "+40% leads", up: true, icon: TrendingUp },
      { label: "Idées", value: "12", delta: "contenus", up: true, icon: Sparkles },
      { label: "Temps", value: "140h", delta: "85% alloué", up: true, icon: Clock },
      { label: "Argent", value: "14.5K$", delta: "/mois budget", up: true, icon: DollarSign },
      { label: "Actifs", value: "2,340", delta: "followers", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "IA marketing B2B", value: "Tendance", valueColor: "text-blue-600", secondary: "Adoption +35% en 2026" },
        { primary: "LinkedIn algorithme", value: "Info", valueColor: "text-blue-600", secondary: "Changements Q2 2026" },
        { primary: "Marketing manufacturier", secondary: "Étude CEFRIO — budget moyen" },
      ]},
      { icon: FileText, title: "Contenu", count: 12, items: [
        { primary: "Articles publiés", value: "8", secondary: "Ce trimestre — blog + LinkedIn", phase: "retroaction" },
        { primary: "Vidéos témoignages", value: "3", secondary: "Clients Boréal, MetalPro, TechFab", phase: "retroaction" },
        { primary: "En production", value: "4", valueColor: "text-blue-600", secondary: "2 articles + 2 études de cas", phase: "execution" },
      ]},
      { icon: User, title: "Leads", count: 18, items: [
        { primary: "Leads ce mois", value: "18", valueColor: "text-green-600", secondary: "Qualifiés par scoring" },
        { primary: "Coût par lead", value: "420$", secondary: "Cible: <500$" },
        { primary: "Conversion lead→client", pct: 12, pctColor: "bg-amber-500", secondary: "Cible: 15%", phase: "reflexion" },
      ]},
    ],
    row2: [
      { icon: Globe, title: "Réseaux sociaux", items: [
        { primary: "LinkedIn followers", value: "2,340", secondary: "+180 ce mois" },
        { primary: "Engagement moyen", pct: 4, pctColor: "bg-green-500", secondary: "4.2% — excellent pour B2B", phase: "retroaction" },
        { primary: "Publications/sem.", value: "5", secondary: "Cible atteinte", phase: "retroaction" },
      ]},
      { icon: Search, title: "SEO / Web", items: [
        { primary: "Trafic mensuel", value: "4,200", secondary: "+22% vs mois dernier" },
        { primary: "Mots-clés page 1", value: "34", valueColor: "text-green-600", secondary: "Sur 120 ciblés", phase: "retroaction" },
        { primary: "Taux rebond", value: "42%", secondary: "En amélioration (-5 pts)", phase: "reflexion" },
      ]},
      { icon: BarChart3, title: "Analytics", items: [
        { primary: "ROI marketing", value: "3.2x", valueColor: "text-green-600", secondary: "Sur 12 mois glissants", phase: "retroaction" },
        { primary: "CAC", value: "2,100$", secondary: "Coût acquisition client" },
        { primary: "LTV/CAC ratio", value: "4.8", valueColor: "text-green-600", secondary: "Excellent — >3 cible", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 16, items: [
        { primary: "Validation contenu LinkedIn", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Rapport analytics Q1", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 12 avril" },
        { primary: "Préparation webinaire", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 20 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", count: 3, items: [
        { primary: "Petit-déjeuner REAI", value: "24 avr.", secondary: "Présentation Brain Team" },
        { primary: "Webinaire mensuel", value: "22 avr.", secondary: "Thème: diagnostic VITAA" },
        { primary: "Salon manufacturier", value: "8-9 mai", secondary: "Kiosque réservé — Mtl" },
      ]},
      { icon: Newspaper, title: "Campagnes", count: 4, items: [
        { primary: "Campagne LinkedIn Q2", pct: 45, pctColor: "bg-pink-500", secondary: "Lancement: 15 avril", phase: "execution" },
        { primary: "Email nurturing", value: "Actif", valueColor: "text-green-600", secondary: "Taux ouverture: 34%", phase: "execution" },
        { primary: "Webinaire VITAA", value: "Planifié", valueColor: "text-blue-600", secondary: "22 avril — 40 inscrits", phase: "creation" },
      ]},
    ],
  },

  CTOB: {
    deptLabel: "Technologie",
    deptFullLabel: "de la technologie",
    summary: "Infrastructure technique, sprints et sécurité informatique",
    vitaa: [
      { label: "Ventes", value: "12K", delta: "req/jour", up: true, icon: TrendingUp },
      { label: "Idées", value: "8", delta: "features", up: true, icon: Sparkles },
      { label: "Temps", value: "200h", delta: "90% alloué", up: true, icon: Clock },
      { label: "Argent", value: "45K$", delta: "infra/mois", up: true, icon: DollarSign },
      { label: "Actifs", value: "52", delta: "repos", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Claude 4.5 Opus", value: "Nouveau", valueColor: "text-green-600", secondary: "Évaluer pour T4 routing" },
        { primary: "LiveKit 2.0", value: "Stable", valueColor: "text-blue-600", secondary: "Migration planifiée Q2" },
        { primary: "React 19", secondary: "RC — tester compatibilité" },
      ]},
      { icon: Database, title: "Infrastructure", items: [
        { primary: "Uptime", pct: 99, pctColor: "bg-green-500", secondary: "99.7% — 30 derniers jours", phase: "retroaction" },
        { primary: "VPS1 (dev)", value: "OK", valueColor: "text-green-600", secondary: "CPU: 23%, RAM: 68%" },
        { primary: "VPS2 (prod)", value: "OK", valueColor: "text-green-600", secondary: "CPU: 12%, RAM: 45%" },
      ]},
      { icon: Bug, title: "Bugs", count: 7, items: [
        { primary: "Critiques", value: "0", valueColor: "text-green-600", secondary: "Aucun bloquant", phase: "retroaction" },
        { primary: "Majeurs", value: "2", valueColor: "text-amber-600", secondary: "Voice coupure + search bar", phase: "attention" },
        { primary: "Mineurs", value: "5", secondary: "Backlog priorisé", phase: "reflexion" },
      ]},
    ],
    row2: [
      { icon: ShieldCheck, title: "Sécurité", items: [
        { primary: "Score sécurité", pct: 87, pctColor: "bg-green-500", secondary: "Dernier scan: 5 avril", phase: "retroaction" },
        { primary: "Vulnérabilités", value: "1", valueColor: "text-amber-600", secondary: "Low — dépendance npm", phase: "attention" },
        { primary: "Certificat SSL", value: "OK", valueColor: "text-green-600", secondary: "Expire: 2 juin 2026", phase: "retroaction" },
      ]},
      { icon: Settings, title: "DevOps", items: [
        { primary: "Déploiements/sem.", value: "8", secondary: "CI/CD automatisé", phase: "execution" },
        { primary: "Temps build", value: "2.3 min", secondary: "Vite + TypeScript" },
        { primary: "Tests passants", pct: 94, pctColor: "bg-green-500", secondary: "94/100 — 6 skippés", phase: "retroaction" },
      ]},
      { icon: BarChart3, title: "Métriques", items: [
        { primary: "Latence API p95", value: "180ms", valueColor: "text-green-600", secondary: "Cible: <200ms", phase: "retroaction" },
        { primary: "Erreurs 5xx/jour", value: "3", secondary: "En baisse (-70% vs mars)" },
        { primary: "Requêtes/jour", value: "12K", secondary: "Peak: 850/heure" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 31, items: [
        { primary: "Migration DB phase 2", value: "Urgent", valueColor: "text-red-600", secondary: "Deadline: 10 avril", urgent: true, phase: "attention" },
        { primary: "API Orbit9 endpoints", value: "Normal", valueColor: "text-blue-600", secondary: "5 endpoints restants", phase: "execution" },
        { primary: "Fix voice pipeline", value: "Urgent", valueColor: "text-red-600", secondary: "Coupure après 2 min", urgent: true, phase: "attention" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Sprint review", value: "12 avr. 14h", secondary: "Demo + rétrospective" },
        { primary: "Tech debt review", value: "15 avr. 10h", secondary: "Priorisation Q2", phase: "reflexion" },
        { primary: "Infra planning", value: "18 avr. 9h", secondary: "Scale VPS3?", phase: "reflexion" },
      ]},
      { icon: Rocket, title: "Sprint actif", count: 12, items: [
        { primary: "Sprint 14 — CarlOS v2", pct: 65, pctColor: "bg-violet-500", secondary: "8/12 stories complétées", phase: "execution" },
        { primary: "Vélocité", value: "34 pts", secondary: "Moyenne: 31 pts" },
        { primary: "Fin sprint", value: "12 avr.", secondary: "Demo vendredi 14h" },
      ]},
    ],
  },

  COOB: {
    deptLabel: "Opérations",
    deptFullLabel: "des opérations",
    summary: "Processus, logistique, fournisseurs et contrôle qualité",
    vitaa: [
      { label: "Ventes", value: "91%", delta: "on-time", up: true, icon: TrendingUp },
      { label: "Idées", value: "5", delta: "kaizen", up: true, icon: Sparkles },
      { label: "Temps", value: "180h", delta: "88% alloué", up: true, icon: Clock },
      { label: "Argent", value: "18K$", delta: "/mois transport", up: true, icon: DollarSign },
      { label: "Actifs", value: "24", delta: "fournisseurs", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Norme ISO 9001:2025", value: "Info", valueColor: "text-blue-600", secondary: "Transition requise d'ici 2027" },
        { primary: "Tarifs douaniers US", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Impact fournisseurs", phase: "attention" },
        { primary: "Lean 4.0 Québec", secondary: "Programme MESI — subvention dispo" },
      ]},
      { icon: Truck, title: "Logistique", items: [
        { primary: "Livraisons à temps", pct: 91, pctColor: "bg-green-500", secondary: "Ce mois — cible: 95%" },
        { primary: "Coût transport", value: "18K$/mois", secondary: "Stable vs Q4" },
        { primary: "Retours/défauts", value: "1.2%", valueColor: "text-green-600", secondary: "Sous la cible de 2%", phase: "retroaction" },
      ]},
      { icon: Handshake, title: "Fournisseurs", count: 24, items: [
        { primary: "Fournisseurs actifs", value: "24", secondary: "6 critiques identifiés" },
        { primary: "Score qualité moy.", pct: 88, pctColor: "bg-green-500", secondary: "Évaluation trimestrielle", phase: "retroaction" },
        { primary: "En retard livraison", value: "2", valueColor: "text-amber-600", secondary: "Acier Québec, PlastiCo", phase: "attention" },
      ]},
    ],
    row2: [
      { icon: Award, title: "Qualité", items: [
        { primary: "Taux conformité", pct: 97, pctColor: "bg-green-500", secondary: "ISO 9001 maintenu", phase: "retroaction" },
        { primary: "NCR ouverts", value: "3", valueColor: "text-amber-600", secondary: "2 mineurs, 1 majeur", phase: "attention" },
        { primary: "Audits planifiés", value: "2", secondary: "Avril: interne + client" },
      ]},
      { icon: BarChart3, title: "Capacité", items: [
        { primary: "Utilisation capacité", pct: 78, pctColor: "bg-blue-500", secondary: "Marge disponible" },
        { primary: "Goulot identifié", value: "CNC 3 axes", secondary: "Taux utilisation: 94%", phase: "attention" },
        { primary: "Heures dispo.", value: "320h/mois", secondary: "Avant overtime" },
      ]},
      { icon: Gauge, title: "Métriques", items: [
        { primary: "Coût/unité", value: "23.40$", secondary: "Cible: 22.50$ (-4%)" },
        { primary: "Lead time moyen", value: "8.5j", secondary: "Cible: 7 jours", phase: "reflexion" },
        { primary: "Taux rebut", value: "2.1%", valueColor: "text-amber-600", secondary: "Cible: <1.5%", phase: "attention" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 22, items: [
        { primary: "Audit 5S ligne B", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Renouveler contrat transport", value: "Normal", valueColor: "text-blue-600", secondary: "Expire: 30 avril", phase: "reflexion" },
        { primary: "Mise à jour procédures", value: "Normal", valueColor: "text-blue-600", secondary: "3 SOP à réviser", phase: "execution" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Audit interne ISO", value: "14 avr.", secondary: "2 jours — production + logistique" },
        { primary: "Revue fournisseurs", value: "20 avr.", secondary: "6 fournisseurs critiques" },
        { primary: "Kaizen workshop", value: "22 avr.", secondary: "Ligne A — assemblage" },
      ]},
      { icon: Settings, title: "Processus", count: 8, items: [
        { primary: "Processus documentés", pct: 72, pctColor: "bg-orange-500", secondary: "26/36 complétés", phase: "execution" },
        { primary: "Efficacité globale", pct: 84, pctColor: "bg-green-500", secondary: "OEE — cible: 85%" },
        { primary: "Améliorations actives", value: "5", secondary: "Kaizen en cours", phase: "execution" },
      ]},
    ],
  },

  CPOB: {
    deptLabel: "Production",
    deptFullLabel: "de la production",
    summary: "Lignes de production, maintenance, inventaire et commandes",
    vitaa: [
      { label: "Ventes", value: "8", delta: "commandes", up: true, icon: TrendingUp },
      { label: "Idées", value: "3", delta: "améliorations", up: true, icon: Sparkles },
      { label: "Temps", value: "720h", delta: "production", up: true, icon: Clock },
      { label: "Argent", value: "340K$", delta: "inventaire", up: true, icon: DollarSign },
      { label: "Actifs", value: "3", delta: "lignes", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Robot collaboratif", value: "Étude", valueColor: "text-blue-600", secondary: "Universal Robots UR10e", phase: "reflexion" },
        { primary: "Industrie 4.0", secondary: "Programme MESI — capteurs IoT" },
        { primary: "Formation CNESST", value: "Requis", valueColor: "text-amber-600", secondary: "Renouvellement annuel", phase: "attention" },
      ]},
      { icon: Award, title: "Qualité", items: [
        { primary: "First pass yield", pct: 96, pctColor: "bg-green-500", secondary: "Cible: 95%", phase: "retroaction" },
        { primary: "PPM défauts", value: "340", secondary: "En baisse — cible: <500", phase: "retroaction" },
        { primary: "Réclamations client", value: "1", secondary: "En traitement — MetalPro", phase: "execution" },
      ]},
      { icon: Wrench, title: "Maintenance", count: 4, items: [
        { primary: "Préventive planifiée", value: "4", secondary: "Ce mois", phase: "execution" },
        { primary: "MTBF", value: "720h", valueColor: "text-green-600", secondary: "En hausse (+80h vs Q4)", phase: "retroaction" },
        { primary: "Pièces en commande", value: "3", secondary: "Délai: 5-8 jours", phase: "reflexion" },
      ]},
    ],
    row2: [
      { icon: Package, title: "Inventaire", items: [
        { primary: "Matières premières", value: "340K$", secondary: "Rotation: 6x/an" },
        { primary: "Produits finis", value: "180K$", secondary: "12 jours de stock" },
        { primary: "Seuils critiques", value: "2 items", valueColor: "text-red-600", secondary: "Aluminium + joints", phase: "attention" },
      ]},
      { icon: ClipboardCheck, title: "Commandes", count: 18, items: [
        { primary: "En production", value: "8", secondary: "Valeur: 420K$", phase: "execution" },
        { primary: "En attente", value: "6", secondary: "Matériel en commande", phase: "reflexion" },
        { primary: "Retard", value: "1", valueColor: "text-red-600", secondary: "Client Boréal — 3j", phase: "attention" },
      ]},
      { icon: BarChart3, title: "Indicateurs", items: [
        { primary: "OEE global", pct: 84, pctColor: "bg-green-500", secondary: "Cible: 85%" },
        { primary: "Takt time", value: "4.2 min", secondary: "Vs cible: 4.0 min" },
        { primary: "Overtime", value: "8%", valueColor: "text-amber-600", secondary: "Cible: <5%", phase: "attention" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 20, items: [
        { primary: "Calibration CNC #4", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Formation nouvel opérateur", value: "Normal", valueColor: "text-blue-600", secondary: "Semaine du 14 avril", phase: "execution" },
        { primary: "5S ligne B", value: "Planifié", valueColor: "text-blue-600", secondary: "Audit: 20 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Maintenance CNC #2", value: "10 avr.", secondary: "Préventive — 4h arrêt", phase: "execution" },
        { primary: "Audit qualité client", value: "14 avr.", secondary: "MetalPro — ligne A" },
        { primary: "Réunion production", value: "Lun. 7h30", secondary: "Revue hebdomadaire" },
      ]},
      { icon: Package, title: "Lignes", count: 3, items: [
        { primary: "Ligne A — Assemblage", pct: 92, pctColor: "bg-green-500", secondary: "Plein régime", phase: "execution" },
        { primary: "Ligne B — Usinage", pct: 78, pctColor: "bg-blue-500", secondary: "Capacité disponible" },
        { primary: "Ligne C — Finition", pct: 65, pctColor: "bg-amber-500", secondary: "Maintenance préventive 10 avr.", phase: "reflexion" },
      ]},
    ],
  },

  CHROB: {
    deptLabel: "Ressources Humaines",
    deptFullLabel: "des ressources humaines",
    summary: "Effectifs, recrutement, formation et climat organisationnel",
    vitaa: [
      { label: "Ventes", value: "47", delta: "employés", up: true, icon: TrendingUp },
      { label: "Idées", value: "3", delta: "postes ouverts", up: false, icon: Sparkles },
      { label: "Temps", value: "240h", delta: "formation Q1", up: true, icon: Clock },
      { label: "Argent", value: "189K$", delta: "/mois paie", up: true, icon: DollarSign },
      { label: "Actifs", value: "12", delta: "certifications", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Pénurie main-d'œuvre QC", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Secteur manufacturier -8%", phase: "attention" },
        { primary: "Loi 96 francisation", value: "Info", valueColor: "text-blue-600", secondary: "Nouvelles obligations 2026" },
        { primary: "Tendance télétravail", secondary: "Hybride 3j/sem. — norme PME" },
      ]},
      { icon: Search, title: "Recrutement", count: 3, items: [
        { primary: "Postes ouverts", value: "3", secondary: "Machiniste, soudeur, dev", phase: "execution" },
        { primary: "Candidatures actives", value: "12", secondary: "Pipeline recrutement" },
        { primary: "Délai embauche moy.", value: "28j", secondary: "Cible: <21 jours", phase: "reflexion" },
      ]},
      { icon: GraduationCap, title: "Formation", items: [
        { primary: "Heures formation Q1", value: "240h", secondary: "Budget: 18K$ / 25K$", phase: "retroaction" },
        { primary: "Certifications actives", value: "12", secondary: "CNESST, ISO, soudure", phase: "retroaction" },
        { primary: "Plan développement", pct: 60, pctColor: "bg-blue-500", secondary: "28/47 employés couverts", phase: "execution" },
      ]},
    ],
    row2: [
      { icon: DollarSign, title: "Paie", items: [
        { primary: "Masse salariale", value: "189K$/mois", secondary: "47 employés" },
        { primary: "Avantages sociaux", value: "22K$/mois", secondary: "Assurances + REER" },
        { primary: "Heures supp.", value: "8%", valueColor: "text-amber-600", secondary: "Production — cible: <5%", phase: "attention" },
      ]},
      { icon: Shield, title: "Conformité", items: [
        { primary: "CNESST", value: "Conforme", valueColor: "text-green-600", secondary: "Dernier audit: mars", phase: "retroaction" },
        { primary: "Normes du travail", value: "Conforme", valueColor: "text-green-600", secondary: "Prochaine vérification: Q3", phase: "retroaction" },
        { primary: "Équité salariale", value: "En cours", valueColor: "text-blue-600", secondary: "Exercice 2026", phase: "execution" },
      ]},
      { icon: Heart, title: "Climat", items: [
        { primary: "Satisfaction globale", pct: 78, pctColor: "bg-green-500", secondary: "Sondage Q1 2026", phase: "retroaction" },
        { primary: "Engagement", pct: 72, pctColor: "bg-blue-500", secondary: "En hausse (+4 pts)" },
        { primary: "Absentéisme", value: "3.2%", valueColor: "text-green-600", secondary: "Sous la cible de 4%", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 12, items: [
        { primary: "Entrevues machiniste", value: "Urgent", valueColor: "text-red-600", secondary: "3 candidats cette semaine", urgent: true, phase: "attention" },
        { primary: "Évaluation mi-année", value: "Planifié", valueColor: "text-blue-600", secondary: "Début: 15 avril", phase: "creation" },
        { primary: "Mise à jour manuel", value: "Normal", valueColor: "text-blue-600", secondary: "Politique télétravail" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Entrevues machiniste", value: "8-10 avr.", secondary: "3 candidats shortlistés", phase: "execution" },
        { primary: "Formation sécurité", value: "15 avr.", secondary: "Production — obligatoire" },
        { primary: "5 à 7 équipe", value: "25 avr.", secondary: "Team building mensuel" },
      ]},
      { icon: User, title: "Effectifs", items: [
        { primary: "Total employés", value: "47", secondary: "44 temps plein + 3 temps partiel" },
        { primary: "Roulement annuel", value: "8%", valueColor: "text-green-600", secondary: "Industrie: 12%", phase: "retroaction" },
        { primary: "Ancienneté moyenne", value: "4.2 ans", secondary: "En hausse (+0.5 an)", phase: "retroaction" },
      ]},
    ],
  },

  CINOB: {
    deptLabel: "Innovation & R&D",
    deptFullLabel: "de l'innovation & R&D",
    summary: "Projets de recherche, brevets, veille technologique et crédits RS&DE",
    vitaa: [
      { label: "Ventes", value: "3", delta: "projets R&D", up: true, icon: TrendingUp },
      { label: "Idées", value: "8", delta: "idées soumises", up: true, icon: Sparkles },
      { label: "Temps", value: "160h", delta: "R&D", up: true, icon: Clock },
      { label: "Argent", value: "200K$", delta: "budget annuel", up: true, icon: DollarSign },
      { label: "Actifs", value: "2", delta: "brevets", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "IA manufacturière", value: "Tendance", valueColor: "text-blue-600", secondary: "Adoption +40% en 2026" },
        { primary: "Crédits RS&DE", value: "Info", valueColor: "text-green-600", secondary: "Total estimé: 92K$" },
        { primary: "Industrie 4.0 Québec", secondary: "Programme MESI — capteurs IoT" },
      ]},
      { icon: FileLock, title: "Brevets", count: 2, items: [
        { primary: "BTML framework", value: "Déposé", valueColor: "text-blue-600", secondary: "Demande provisoire — mars 2026", phase: "retroaction" },
        { primary: "Diagnostic VITAA", value: "En prep.", valueColor: "text-amber-600", secondary: "Consultation avocat brevets", phase: "creation" },
        { primary: "Portfolio PI", value: "2", secondary: "Valeur estimée: 180K$" },
      ]},
      { icon: Search, title: "Veille techno", items: [
        { primary: "Articles suivis", value: "34", secondary: "IA, IoT, vision par ordinateur" },
        { primary: "Brevets concurrents", value: "8", secondary: "Monitoring mensuel" },
        { primary: "Rapport mensuel", value: "Publié", valueColor: "text-green-600", secondary: "Mars 2026 disponible", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: DollarSign, title: "Budget R&D", items: [
        { primary: "Budget annuel", value: "200K$", secondary: "Dépensé: 68K$ (Q1)" },
        { primary: "RS&DE admissible", value: "148K$", valueColor: "text-green-600", secondary: "Crédit estimé: 68K$", phase: "retroaction" },
        { primary: "Subventions", value: "50K$", valueColor: "text-green-600", secondary: "MESI confirmé", phase: "retroaction" },
      ]},
      { icon: Handshake, title: "Partenariats", count: 3, items: [
        { primary: "Université Laval", value: "Actif", valueColor: "text-green-600", secondary: "Projet IA manufacturing", phase: "execution" },
        { primary: "CRIQ", value: "Actif", valueColor: "text-green-600", secondary: "Essais matériaux", phase: "execution" },
        { primary: "NRC-IRAP", value: "En discussion", valueColor: "text-blue-600", secondary: "Financement R&D fédéral", phase: "reflexion" },
      ]},
      { icon: Sparkles, title: "Pipeline idées", count: 8, items: [
        { primary: "Idées soumises", value: "8", secondary: "Ce trimestre — employés", phase: "creation" },
        { primary: "En évaluation", value: "3", secondary: "Comité innovation", phase: "reflexion" },
        { primary: "Implémentées", value: "2", valueColor: "text-green-600", secondary: "Kaizen + outil interne", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 10, items: [
        { primary: "Rapport RS&DE Q1", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 15 avril", urgent: true, phase: "attention" },
        { primary: "POC capteurs ligne A", value: "Normal", valueColor: "text-blue-600", secondary: "Installation test", phase: "execution" },
        { primary: "Benchmark outils IA", value: "Normal", valueColor: "text-blue-600", secondary: "Évaluation 3 solutions" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Comité R&D", value: "12 avr. 13h", secondary: "Revue projets trimestrielle" },
        { primary: "Visite U. Laval", value: "18 avr.", secondary: "Lab IA manufacturing" },
        { primary: "Deadline RS&DE", value: "15 avr.", secondary: "Documents comptables", phase: "execution" },
      ]},
      { icon: Rocket, title: "Projets R&D", count: 3, items: [
        { primary: "CarlOS v2 — IA", pct: 65, pctColor: "bg-rose-500", secondary: "Phase: prototype avancé", phase: "execution" },
        { primary: "Capteurs IoT usine", pct: 30, pctColor: "bg-blue-500", secondary: "Phase: étude faisabilité", phase: "reflexion" },
        { primary: "Vision qualité auto", pct: 15, pctColor: "bg-amber-500", secondary: "Phase: recherche", phase: "creation" },
      ]},
    ],
  },

  CSOB: {
    deptLabel: "Stratégie",
    deptFullLabel: "de la stratégie",
    summary: "Positionnement concurrentiel, alliances stratégiques et expansion",
    vitaa: [
      { label: "Ventes", value: "4.2%", delta: "part marché", up: true, icon: TrendingUp },
      { label: "Idées", value: "3", delta: "alliances", up: true, icon: Sparkles },
      { label: "Temps", value: "120h", delta: "stratégie", up: true, icon: Clock },
      { label: "Argent", value: "0$", delta: "pas de budget propre", up: true, icon: DollarSign },
      { label: "Actifs", value: "14", delta: "risques suivis", up: false, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Budget fédéral 2026", value: "Info", valueColor: "text-blue-600", secondary: "Programmes PME manufacturing" },
        { primary: "IA générative B2B", secondary: "McKinsey: +23% productivité" },
        { primary: "Nearshoring trend", secondary: "Opportunité: US → QC" },
      ]},
      { icon: Eye, title: "Concurrents", count: 5, items: [
        { primary: "Acme Solutions", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Nouveau produit — mars", phase: "attention" },
        { primary: "TechFab QC", value: "Stable", valueColor: "text-blue-600", secondary: "Même segment" },
        { primary: "Mouvements détectés", value: "3", secondary: "Ce trimestre" },
      ]},
      { icon: Handshake, title: "Alliances", count: 4, items: [
        { primary: "REAI", value: "Actif", valueColor: "text-green-600", secondary: "130+ manufacturiers", phase: "execution" },
        { primary: "Partenariat distributeur", value: "Négociation", valueColor: "text-amber-600", secondary: "AutomatePro — exclusivité", phase: "reflexion" },
        { primary: "Consortium IA", value: "Membre", secondary: "MILA + IVADO", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: Globe, title: "Expansion", items: [
        { primary: "Expansion Laval", value: "En cours", valueColor: "text-blue-600", secondary: "Ouverture Q3 2026", phase: "execution" },
        { primary: "Ontario", value: "Étude", valueColor: "text-amber-600", secondary: "Marché: 2,400 PME cibles", phase: "reflexion" },
        { primary: "Export US", value: "Phase 0", secondary: "Veille réglementaire" },
      ]},
      { icon: Bell, title: "Risques", count: 14, items: [
        { primary: "Tarifs US", value: "Élevé", valueColor: "text-red-600", secondary: "Impact: 8% revenus", phase: "attention" },
        { primary: "Pénurie main-d'œuvre", value: "Moyen", valueColor: "text-amber-600", secondary: "3 postes ouverts", phase: "attention" },
        { primary: "Concentration clients", value: "Moyen", valueColor: "text-amber-600", secondary: "Top 3 = 35% revenus", phase: "reflexion" },
      ]},
      { icon: BarChart3, title: "Indicateurs", items: [
        { primary: "Score stratégique", pct: 76, pctColor: "bg-green-500", secondary: "Composite — 8 dimensions" },
        { primary: "Alignement équipe", pct: 82, pctColor: "bg-green-500", secondary: "Sondage trimestriel", phase: "retroaction" },
        { primary: "Agilité décisionnelle", value: "3.2j", secondary: "Temps moyen décision" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 9, items: [
        { primary: "Analyse impact tarifs", value: "Urgent", valueColor: "text-red-600", secondary: "Scénarios pour le CA", urgent: true, phase: "attention" },
        { primary: "Étude Ontario", value: "Normal", valueColor: "text-blue-600", secondary: "Phase 1 — desk research", phase: "reflexion" },
        { primary: "Mise à jour SWOT", value: "Normal", valueColor: "text-blue-600", secondary: "Version Q2" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Comité stratégique", value: "18 avr. 9h", secondary: "Revue portefeuille", phase: "reflexion" },
        { primary: "Board meeting", value: "12 avr.", secondary: "Présentation expansion" },
        { primary: "Veille concurrentielle", value: "Hebdo lun.", secondary: "Rapport automatisé" },
      ]},
      { icon: Eye, title: "Positionnement", items: [
        { primary: "Part de marché QC", value: "4.2%", secondary: "Manufacturiers automatisés" },
        { primary: "Avantage concurrentiel", value: "IA+Humain", secondary: "Positionnement unique", phase: "retroaction" },
        { primary: "NPS marché", pct: 72, pctColor: "bg-green-500", secondary: "Enquête Q1 2026", phase: "retroaction" },
      ]},
    ],
  },

  CLOB: {
    deptLabel: "Juridique",
    deptFullLabel: "juridique",
    summary: "Contrats, conformité réglementaire, propriété intellectuelle et litiges",
    vitaa: [
      { label: "Ventes", value: "34", delta: "contrats actifs", up: true, icon: TrendingUp },
      { label: "Idées", value: "1", delta: "litige", up: false, icon: Sparkles },
      { label: "Temps", value: "80h", delta: "juridique", up: true, icon: Clock },
      { label: "Argent", value: "34K$", delta: "frais YTD", up: true, icon: DollarSign },
      { label: "Actifs", value: "287", delta: "documents", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Loi C-27 fédérale", value: "Suivi", valueColor: "text-blue-600", secondary: "Impact données IA" },
        { primary: "Tarifs douaniers US", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Révision contrats export", phase: "attention" },
        { primary: "Réforme droit travail QC", secondary: "Projet de loi en cours" },
      ]},
      { icon: Shield, title: "Conformité", items: [
        { primary: "LPRPDE", pct: 85, pctColor: "bg-green-500", secondary: "Audit mars — conforme", phase: "retroaction" },
        { primary: "Loi 25 (QC)", pct: 90, pctColor: "bg-green-500", secondary: "PIA complété", phase: "retroaction" },
        { primary: "CNESST/SST", value: "Conforme", valueColor: "text-green-600", secondary: "Prochaine inspection: Q3", phase: "retroaction" },
      ]},
      { icon: Gavel, title: "Litiges", count: 1, items: [
        { primary: "Litiges actifs", value: "1", secondary: "Fournisseur — vice caché", phase: "attention" },
        { primary: "Montant en jeu", value: "45K$", secondary: "Médiation en cours", phase: "execution" },
        { primary: "Provision comptable", value: "20K$", secondary: "Risque modéré" },
      ]},
    ],
    row2: [
      { icon: Lock, title: "Propriété intel.", count: 4, items: [
        { primary: "Marques déposées", value: "2", secondary: "Brain Team + Usine Bleue", phase: "retroaction" },
        { primary: "Brevets", value: "1 déposé", valueColor: "text-blue-600", secondary: "BTML framework", phase: "execution" },
        { primary: "NDA actifs", value: "8", secondary: "Clients + partenaires" },
      ]},
      { icon: Crown, title: "Gouvernance", items: [
        { primary: "Structure corporative", value: "À jour", valueColor: "text-green-600", secondary: "REQ renouvelé", phase: "retroaction" },
        { primary: "Convention actionnaires", value: "V3", secondary: "Mise à jour: février 2026", phase: "retroaction" },
        { primary: "Registre résolutions", value: "À jour", valueColor: "text-green-600", secondary: "12 résolutions 2026", phase: "retroaction" },
      ]},
      { icon: Database, title: "Registre", items: [
        { primary: "Documents archivés", value: "287", secondary: "Classement numérique" },
        { primary: "Échéances actives", value: "14", secondary: "Renouvellements + deadlines" },
        { primary: "Templates légaux", value: "12", secondary: "NDA, contrat, bail, etc." },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 8, items: [
        { primary: "Renouvellement contrat Boréal", value: "Urgent", valueColor: "text-red-600", secondary: "Expire: 30 avril", urgent: true, phase: "attention" },
        { primary: "Revue NDA partenaire", value: "Normal", valueColor: "text-blue-600", secondary: "AutomatePro", phase: "reflexion" },
        { primary: "Mise à jour politique PI", value: "Normal", valueColor: "text-blue-600", secondary: "Inventions employés" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Médiation litige", value: "14 avr.", secondary: "Avocat Me Tremblay", phase: "execution" },
        { primary: "Consultation PI", value: "18 avr.", secondary: "Brevet #2 — VITAA", phase: "reflexion" },
        { primary: "Assemblée annuelle", value: "30 avr.", secondary: "Résolutions + PV" },
      ]},
      { icon: FileText, title: "Contrats", count: 34, items: [
        { primary: "Contrats actifs", value: "34", secondary: "Clients + fournisseurs" },
        { primary: "Renouvellements Q2", value: "6", valueColor: "text-amber-600", secondary: "2 critiques — avril", phase: "attention" },
        { primary: "En négociation", value: "3", secondary: "Valeur: 280K$", phase: "execution" },
      ]},
    ],
  },

  CISOB: {
    deptLabel: "Sécurité",
    deptFullLabel: "de la sécurité",
    summary: "Cybersécurité, contrôle d'accès, gestion des incidents et conformité",
    vitaa: [
      { label: "Ventes", value: "87", delta: "/100 score", up: true, icon: TrendingUp },
      { label: "Idées", value: "0", delta: "incidents", up: true, icon: Sparkles },
      { label: "Temps", value: "100h", delta: "sécu/mois", up: true, icon: Clock },
      { label: "Argent", value: "420$", delta: "/employé", up: true, icon: DollarSign },
      { label: "Actifs", value: "52", delta: "comptes", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Ransomware PME", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Hausse +60% au Canada", phase: "attention" },
        { primary: "Zero Trust architecture", value: "Tendance", valueColor: "text-blue-600", secondary: "Adoption croissante PME" },
        { primary: "Loi 25 échéances", secondary: "Prochaine phase: septembre 2026" },
      ]},
      { icon: Lock, title: "Accès", items: [
        { primary: "Comptes actifs", value: "52", secondary: "47 employés + 5 services" },
        { primary: "MFA activé", pct: 94, pctColor: "bg-green-500", secondary: "49/52 comptes", phase: "retroaction" },
        { primary: "Revue accès", value: "Planifiée", valueColor: "text-blue-600", secondary: "Prochaine: 15 avril", phase: "reflexion" },
      ]},
      { icon: Bug, title: "Incidents", count: 0, items: [
        { primary: "Incidents ce mois", value: "0", valueColor: "text-green-600", secondary: "Aucun incident", phase: "retroaction" },
        { primary: "Tentatives bloquées", value: "127", secondary: "Firewall + rate limiting" },
        { primary: "Phishing détecté", value: "3", secondary: "Emails bloqués cette semaine" },
      ]},
    ],
    row2: [
      { icon: Shield, title: "Conformité", items: [
        { primary: "SOC 2 Type I", value: "En cours", valueColor: "text-blue-600", secondary: "Audit prévu Q3", phase: "execution" },
        { primary: "LPRPDE / Loi 25", pct: 90, pctColor: "bg-green-500", secondary: "Données personnelles", phase: "retroaction" },
        { primary: "Politique BYOD", value: "Active", valueColor: "text-green-600", secondary: "12 appareils gérés", phase: "retroaction" },
      ]},
      { icon: Bug, title: "Vulnérabilités", items: [
        { primary: "Critiques", value: "0", valueColor: "text-green-600", secondary: "Scan: 5 avril", phase: "retroaction" },
        { primary: "Élevées", value: "1", valueColor: "text-amber-600", secondary: "npm dependency — fix planifié", phase: "attention" },
        { primary: "Patch cadence", value: "48h", valueColor: "text-green-600", secondary: "Moyenne critique → déployé", phase: "retroaction" },
      ]},
      { icon: GraduationCap, title: "Formation", items: [
        { primary: "Sensibilisation sécu.", pct: 82, pctColor: "bg-green-500", secondary: "39/47 formés ce trimestre", phase: "execution" },
        { primary: "Score test phishing", pct: 88, pctColor: "bg-green-500", secondary: "Dernier test: mars", phase: "retroaction" },
        { primary: "Prochaine session", value: "22 avr.", secondary: "Nouvelles menaces IA" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 10, items: [
        { primary: "Revue accès trimestrielle", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 15 avril", urgent: true, phase: "attention" },
        { primary: "Patch npm dependency", value: "Normal", valueColor: "text-blue-600", secondary: "Vulnérabilité élevée", phase: "execution" },
        { primary: "Test backup restore", value: "Planifié", valueColor: "text-blue-600", secondary: "Test mensuel", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Revue accès", value: "15 avr.", secondary: "Tous les comptes" },
        { primary: "Test intrusion", value: "20 avr.", secondary: "Pentest externe annuel" },
        { primary: "Formation phishing", value: "22 avr.", secondary: "Simulation mensuelle" },
      ]},
      { icon: ShieldCheck, title: "Posture sécurité", items: [
        { primary: "Score global", pct: 87, pctColor: "bg-green-500", secondary: "Dernière évaluation: 5 avril", phase: "retroaction" },
        { primary: "Politique sécurité", value: "V4", valueColor: "text-green-600", secondary: "Mise à jour: mars 2026", phase: "retroaction" },
        { primary: "Formation complétée", pct: 82, pctColor: "bg-green-500", secondary: "39/47 employés", phase: "execution" },
      ]},
    ],
  },

  // ══════════════════════════════════════════
  // ORBIT9 — Dashboard réseau collaboratif
  // Même pattern que les départements mais pour le réseau inter-entreprises
  // ══════════════════════════════════════════
  ORBIT9: {
    deptLabel: "Orbit9",
    deptFullLabel: "du réseau collaboratif",
    summary: "Tour de contrôle du réseau — cellules, jumelages, intelligence et économie collaborative",
    vitaa: [
      { label: "Cellules", value: "4", delta: "+1 ce mois", up: true, icon: Atom },
      { label: "Membres", value: "18", delta: "+3 ce trimestre", up: true, icon: Users },
      { label: "Matches", value: "7", delta: "+2 cette semaine", up: true, icon: Handshake },
      { label: "Score VITAA", value: "76%", delta: "+5 pts", up: true, icon: Activity },
      { label: "ROI Réseau", value: "59K$", delta: "+22% Q1", up: true, icon: TrendingUp },
    ],
    row1: [
      { icon: Bell, title: "Signaux & Alertes", count: 5, items: [
        { primary: "Score confiance MetalPro", value: "-8%", valueColor: "text-red-600", urgent: true, secondary: "Trust Engine — baisse détectée ce mois", phase: "attention" },
        { primary: "Contrat Cellule Ops", value: "Expire 30 avr.", valueColor: "text-amber-600", secondary: "Renouvellement requis — LogiTrans", phase: "attention" },
        { primary: "Ghost Delegate", value: "2 requêtes", valueColor: "text-blue-600", secondary: "Négociations en attente d'approbation", phase: "reflexion" },
      ]},
      { icon: Star, title: "Cellule vedette", items: [
        { primary: "Les Titans", value: "87%", valueColor: "text-green-600", secondary: "Score le plus élevé — 3 leads convertis", phase: "retroaction" },
        { primary: "ROI cellule", value: "12K$", valueColor: "text-emerald-600", secondary: "Ce trimestre — en hausse +18%", phase: "execution" },
        { primary: "Distinction", value: "Or", valueColor: "text-amber-600", secondary: "Badge confiance — 6 mois consécutifs", phase: "retroaction" },
      ]},
      { icon: Handshake, title: "Matches en cours", count: 3, items: [
        { primary: "Usine Bleue ↔ MetalPro", pct: 87, pctColor: "bg-green-500", secondary: "Automatisation — appel d'offres 2.1M$", phase: "execution" },
        { primary: "Usine Bleue ↔ TechFab", pct: 73, pctColor: "bg-blue-500", secondary: "Distribution équipements", phase: "reflexion" },
        { primary: "Cellule Ops ↔ LogiTrans", pct: 65, pctColor: "bg-amber-500", secondary: "Supply chain mutualisée", phase: "observation" },
      ]},
    ],
    row2: [
      { icon: Newspaper, title: "Fil d'activité", count: 8, items: [
        { primary: "3 leads qualifiés (Rich)", value: "Bot", valueColor: "text-blue-600", secondary: "Scoring automatique cette semaine", phase: "execution" },
        { primary: "Contrat Éco+ signé", value: "Humain", valueColor: "text-emerald-600", secondary: "Cellule Les Titans — 45K$", phase: "retroaction" },
        { primary: "Match Orbit9 trouvé", value: "B2B", valueColor: "text-violet-600", secondary: "Simone → Rich — score 87%", phase: "reflexion" },
      ]},
      { icon: HardHat, title: "Intelligence industrie", count: 5, items: [
        { primary: "Adoption IA manufacturing", value: "43%", valueColor: "text-green-600", secondary: "+39 pts depuis 2019 — STIQ/MEIE", phase: "retroaction" },
        { primary: "Programme Grand V (IQ)", value: "1 G$", valueColor: "text-blue-600", secondary: "225 projets financés en 5 mois", phase: "execution" },
        { primary: "Productivité QC", value: "65.90$/h", valueColor: "text-amber-600", secondary: "-10.5% vs Ontario — écart persistant", phase: "attention" },
      ]},
      { icon: Calendar, title: "Prochains événements", count: 4, items: [
        { primary: "Meetup Pionniers #1", value: "15 avr.", secondary: "Montréal — 9 participants", phase: "execution" },
        { primary: "Webinaire VITAA 101", value: "22 avr.", secondary: "Virtuel — 25 inscrits", phase: "creation" },
        { primary: "Hackathon Bot-to-Bot", value: "5 mai", secondary: "Hybride — Québec — 18 équipes", phase: "creation" },
      ]},
    ],
    row3: [
      { icon: Rocket, title: "Pionniers", count: 9, items: [
        { primary: "Sièges occupés", value: "3/9", valueColor: "text-blue-600", secondary: "33% rempli — 6 places restantes", phase: "execution" },
        { primary: "Prochaine cible", value: "Distrib.", valueColor: "text-amber-600", secondary: "Distributeur automatisation recherché", phase: "reflexion" },
        { primary: "Tarif pionnier", value: "1,350$/m", secondary: "Exclusivité sectorielle garantie", phase: "retroaction" },
      ]},
      { icon: DollarSign, title: "Économie réseau", items: [
        { primary: "Revenus générés", value: "47K$", valueColor: "text-emerald-600", secondary: "Ce trimestre — via cellules actives", phase: "retroaction" },
        { primary: "Coûts évités", value: "12K$", valueColor: "text-blue-600", secondary: "Mutualisation achats & ressources", phase: "retroaction" },
        { primary: "TimeTokens distribués", value: "2,340 UT", secondary: "+180 ce mois — économie active", phase: "execution" },
      ]},
      { icon: Bot, title: "Ghost Delegate", items: [
        { primary: "Statut agent", value: "Actif", valueColor: "text-green-600", secondary: "Pre-flight check: OK", phase: "execution" },
        { primary: "Négociations autonomes", value: "3", valueColor: "text-blue-600", secondary: "Ce mois — 2 conclues, 1 en cours", phase: "execution" },
        { primary: "Briefing matinal", value: "Prêt", valueColor: "text-green-600", secondary: "Prochain: 6h00 demain", phase: "retroaction" },
      ]},
    ],
  },
};

// 5 états de travail — boutons d'action sur chaque item
export const WORK_ACTIONS: { key: PhaseKey; icon: React.ElementType; label: string; hover: string }[] = [
  { key: "discussion",  icon: MessageCircle, label: "Discussion",   hover: "hover:bg-blue-50 hover:text-blue-700" },
  { key: "reflexion",   icon: Brain,         label: "Réflexion",    hover: "hover:bg-orange-50 hover:text-orange-700" },
  { key: "creation",    icon: Hammer,        label: "Conception",   hover: "hover:bg-yellow-50 hover:text-yellow-700" },
  { key: "execution",   icon: Rocket,        label: "Exécution",    hover: "hover:bg-green-50 hover:text-green-700" },
  { key: "retroaction", icon: BarChart3,     label: "Rétroaction",  hover: "hover:bg-emerald-50 hover:text-emerald-700" },
];

// Phases pertinentes par type d'élément (filtre dynamique du rollover)
export const PHASES_BY_ELEMENT_TYPE: Record<string, PhaseKey[]> = {
  chantier:  ["discussion", "reflexion", "creation", "execution", "retroaction"],
  projet:    ["discussion", "reflexion", "creation", "execution", "retroaction"],
  mission:   ["discussion", "creation", "execution", "retroaction"],
  tache:     ["discussion", "execution", "retroaction"],
  kpi:       ["discussion", "reflexion"],
  signal:    ["discussion", "execution"],
  document:  ["reflexion", "creation"],
  playbook:  ["discussion", "execution"],
  match:     ["discussion", "execution"],
};

export const DEPT_ORDER = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB", "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB"];

// 2 boxes supplémentaires par département pour le Cockpit (10 boxes total)
// Carl: "je veux toujours 10 box sur les vues d'ensemble de chaque département"
export const COCKPIT_EXTRA_BLOCS: Record<string, DashboardBlocConfig[]> = {
  CEOB: [
    { icon: Play, title: "Simulations — Documents", count: 3, items: [
      { primary: "Cahier de projet", value: "Document", valueColor: "text-blue-600", secondary: "Rédaction complète — diagnostic + 4 solutions Boreal", phase: "creation", deliverable: "document" },
      { primary: "Tableau de bord financier", value: "Tableur", valueColor: "text-emerald-600", secondary: "Projections 36 mois — budget et subventions", phase: "creation", deliverable: "spreadsheet" },
      { primary: "Pitch Deck Présentation", value: "Slides", valueColor: "text-purple-600", secondary: "8 slides — investissement 1.1M$ pour le CA", phase: "creation", deliverable: "presentation" },
    ]},
    { icon: Zap, title: "Simulations — Projets", count: 2, items: [
      { primary: "Dashboard IoT (Tim Code)", value: "Code", valueColor: "text-amber-600", secondary: "32 capteurs, alertes ML — coding avec Tim", phase: "creation", deliverable: "code" },
      { primary: "Jumelage SMART Orbit⁹", value: "Matching", valueColor: "text-teal-600", secondary: "Sélection fournisseur — matching intégrateurs", phase: "creation", deliverable: "jumelage" },
    ]},
    { icon: Rocket, title: "Projets stratégiques", count: 5, items: [
      { primary: "Brain Team V2", pct: 65, pctColor: "bg-blue-500", secondary: "Plateforme IA pour PME", phase: "execution" },
      { primary: "Expansion Laval", pct: 40, pctColor: "bg-amber-500", secondary: "Ouverture Q3 2026", phase: "execution" },
      { primary: "Certification ISO", pct: 85, pctColor: "bg-green-500", secondary: "Audit planifié avril", phase: "retroaction" },
    ]},
    { icon: MessageCircle, title: "Communications", count: 4, items: [
      { primary: "Communiqué presse", value: "En prep.", valueColor: "text-blue-600", secondary: "Lancement Brain Team", phase: "creation" },
      { primary: "Newsletter interne", value: "Envoyée", valueColor: "text-green-600", secondary: "Mars — 94% ouverture", phase: "retroaction" },
      { primary: "Présentation CA", value: "12 avr.", secondary: "Résultats Q1 + stratégie", phase: "creation" },
    ]},
  ],
  CTOB: [
    { icon: Cpu, title: "Architecture", items: [
      { primary: "Migration microservices", pct: 35, pctColor: "bg-violet-500", secondary: "Phase 1 — API Gateway", phase: "execution" },
      { primary: "Cache Redis", value: "Actif", valueColor: "text-green-600", secondary: "Hit rate: 89%", phase: "retroaction" },
      { primary: "WebSocket pipeline", pct: 90, pctColor: "bg-green-500", secondary: "Real-time events", phase: "retroaction" },
    ]},
    { icon: FileText, title: "Documentation", count: 12, items: [
      { primary: "API docs", pct: 72, pctColor: "bg-blue-500", secondary: "38/52 endpoints documentés", phase: "execution" },
      { primary: "Runbooks ops", value: "8", secondary: "Procédures incident", phase: "retroaction" },
      { primary: "Architecture Decision Records", value: "14", secondary: "Depuis Q1 2026", phase: "retroaction" },
    ]},
  ],
  CFOB: [
    { icon: Banknote, title: "Comptes payables", count: 18, items: [
      { primary: "À payer", value: "142K$", valueColor: "text-amber-600", secondary: "18 factures en attente" },
      { primary: "Retard >30j", value: "0", valueColor: "text-green-600", secondary: "Aucun retard fournisseur", phase: "retroaction" },
      { primary: "Prochains paiements", value: "15 avr.", secondary: "Fournisseurs majeurs — 67K$", phase: "execution" },
    ]},
    { icon: Building2, title: "Immobilisations", items: [
      { primary: "Valeur nette", value: "890K$", secondary: "Équipements + bâtiment" },
      { primary: "Amortissement Q1", value: "34K$", secondary: "Linéaire — selon plan" },
      { primary: "Investissements prévus", value: "120K$", valueColor: "text-blue-600", secondary: "CNC + robot Q2", phase: "reflexion" },
    ]},
  ],
  CMOB: [
    { icon: Crown, title: "Image de marque", items: [
      { primary: "Notoriété assistée", pct: 28, pctColor: "bg-pink-500", secondary: "Secteur manufacturier QC", phase: "execution" },
      { primary: "Mentions presse", value: "4", secondary: "Ce trimestre — Les Affaires, Info Industrie" },
      { primary: "Perception marque", value: "Positive", valueColor: "text-green-600", secondary: "Sondage Q1 — 82% favorable", phase: "retroaction" },
    ]},
    { icon: Calendar, title: "Événements", count: 5, items: [
      { primary: "Petit-déjeuner REAI", value: "24 avr.", secondary: "Présentation Brain Team", phase: "execution" },
      { primary: "Webinaire VITAA", value: "22 avr.", secondary: "40 inscrits — record", phase: "creation" },
      { primary: "Salon manufacturier", value: "8-9 mai", secondary: "Kiosque réservé — Montréal" },
    ]},
  ],
  CSOB: [
    { icon: Eye, title: "SWOT", items: [
      { primary: "Forces", value: "8", valueColor: "text-green-600", secondary: "IA+Humain, réseau REAI, Brain Team" },
      { primary: "Faiblesses", value: "4", valueColor: "text-amber-600", secondary: "Scale, dépendance Carl, cash" },
      { primary: "Opportunités", value: "6", valueColor: "text-blue-600", secondary: "Nearshoring, IA manuf, Orbit9" },
    ]},
    { icon: Network, title: "Veille stratégique", items: [
      { primary: "Rapports ce mois", value: "3", secondary: "Concurrence + marché + techno" },
      { primary: "Sources actives", value: "24", secondary: "CEFRIO, McKinsey, STIQ, etc." },
      { primary: "Prochaine publication", value: "12 avr.", secondary: "Analyse impact tarifs US", phase: "execution" },
    ]},
  ],
  COOB: [
    { icon: Package, title: "Inventaire", items: [
      { primary: "Valeur totale", value: "520K$", secondary: "Matières + produits finis" },
      { primary: "Rotation", value: "6x/an", valueColor: "text-green-600", secondary: "Au-dessus de la cible 5x" },
      { primary: "Items sous seuil", value: "2", valueColor: "text-red-600", secondary: "Aluminium + joints", phase: "attention" },
    ]},
    { icon: GraduationCap, title: "Formation SST", items: [
      { primary: "Employés formés", pct: 92, pctColor: "bg-green-500", secondary: "43/47 — CNESST à jour", phase: "retroaction" },
      { primary: "Prochaine session", value: "15 avr.", secondary: "Nouveaux employés — 3h" },
      { primary: "Incidents YTD", value: "0", valueColor: "text-green-600", secondary: "Zéro accident — 148 jours", phase: "retroaction" },
    ]},
  ],
  CPOB: [
    { icon: ClipboardCheck, title: "Planification", items: [
      { primary: "Carnet commandes", value: "18", secondary: "6 semaines de production" },
      { primary: "Charge prochaine sem.", pct: 88, pctColor: "bg-green-500", secondary: "3 lignes — capacité OK" },
      { primary: "Délai livraison moy.", value: "8.5j", secondary: "Cible: 7 jours", phase: "reflexion" },
    ]},
    { icon: Cog, title: "Outillage", count: 6, items: [
      { primary: "Outils en service", value: "48", secondary: "12 CNC + 36 manuels" },
      { primary: "Maintenance préventive", value: "4", secondary: "Ce mois — calendrier OK", phase: "execution" },
      { primary: "Remplacement prévu", value: "2", valueColor: "text-amber-600", secondary: "Perceuse #3 + fraise #7", phase: "reflexion" },
    ]},
  ],
  CHROB: [
    { icon: Award, title: "Rétention", items: [
      { primary: "Taux rétention", pct: 92, pctColor: "bg-green-500", secondary: "12 derniers mois", phase: "retroaction" },
      { primary: "Départs prévisibles", value: "1", valueColor: "text-amber-600", secondary: "Retraite — usinage", phase: "reflexion" },
      { primary: "Plan succession", pct: 60, pctColor: "bg-blue-500", secondary: "Postes clés couverts 6/10", phase: "execution" },
    ]},
    { icon: Heart, title: "Santé & bien-être", items: [
      { primary: "Programme PAE", value: "Actif", valueColor: "text-green-600", secondary: "Utilisation: 12% employés", phase: "retroaction" },
      { primary: "Jours maladie moy.", value: "3.2/an", secondary: "Sous la moyenne industrie (5.1)" },
      { primary: "Activités sociales", value: "2", secondary: "Ce mois — 5à7 + yoga", phase: "execution" },
    ]},
  ],
  CINOB: [
    { icon: Rocket, title: "Prototypes", count: 2, items: [
      { primary: "CarlOS v2 prototype", pct: 65, pctColor: "bg-rose-500", secondary: "Tests internes en cours", phase: "execution" },
      { primary: "Capteur IoT v1", pct: 30, pctColor: "bg-blue-500", secondary: "Ligne A — proof of concept", phase: "reflexion" },
      { primary: "Vision qualité", pct: 15, pctColor: "bg-amber-500", secondary: "Phase recherche", phase: "creation" },
    ]},
    { icon: Newspaper, title: "Publications", items: [
      { primary: "Article IA manuf.", value: "Publié", valueColor: "text-green-600", secondary: "Info Industrie — mars 2026", phase: "retroaction" },
      { primary: "Rapport RS&DE", value: "En prep.", valueColor: "text-blue-600", secondary: "Deadline: 15 avril", phase: "creation" },
      { primary: "White paper BTML", value: "Draft", valueColor: "text-amber-600", secondary: "Framework propriétaire", phase: "creation" },
    ]},
  ],
  CROB: [
    { icon: Database, title: "CRM", items: [
      { primary: "Contacts totaux", value: "1,247", secondary: "Base de données complète" },
      { primary: "Fiches à jour", pct: 78, pctColor: "bg-blue-500", secondary: "968/1247 — mise à jour Q1", phase: "execution" },
      { primary: "Score engagement", pct: 62, pctColor: "bg-amber-500", secondary: "Moyenne des leads actifs", phase: "reflexion" },
    ]},
    { icon: GraduationCap, title: "Formation ventes", items: [
      { primary: "Heures formation Q1", value: "48h", secondary: "CRM + techniques vente" },
      { primary: "Certification produit", pct: 85, pctColor: "bg-green-500", secondary: "Équipe formée sur nouveautés", phase: "retroaction" },
      { primary: "Coaching terrain", value: "3/mois", secondary: "Accompagnement actif", phase: "execution" },
    ]},
  ],
  CLOB: [
    { icon: ShieldCheck, title: "Assurances", items: [
      { primary: "Couverture totale", value: "5M$", secondary: "RC pro + biens + D&O" },
      { primary: "Renouvellement", value: "1 juil.", secondary: "Négociation courtier en cours", phase: "reflexion" },
      { primary: "Réclamations actives", value: "0", valueColor: "text-green-600", secondary: "Aucune réclamation", phase: "retroaction" },
    ]},
    { icon: Search, title: "Veille juridique", items: [
      { primary: "Changements réglementaires", value: "3", secondary: "Loi C-27, Loi 96, droit travail" },
      { primary: "Impact estimé", value: "Modéré", valueColor: "text-amber-600", secondary: "Conformité requise 2026-2027" },
      { primary: "Prochain bulletin", value: "15 avr.", secondary: "Résumé mensuel", phase: "execution" },
    ]},
  ],
  CISOB: [
    { icon: Database, title: "Backups", items: [
      { primary: "Dernier backup", value: "6 avr. 3h", valueColor: "text-green-600", secondary: "Automatique — VPS2 Guardian" },
      { primary: "Rétention", value: "30 jours", secondary: "Rotation automatique" },
      { primary: "Test restore", value: "OK", valueColor: "text-green-600", secondary: "Dernier: 1 avril", phase: "retroaction" },
    ]},
    { icon: Globe, title: "Réseau", items: [
      { primary: "Firewall rules", value: "24", secondary: "UFW — deny default" },
      { primary: "IPs bloquées", value: "847", secondary: "Ce mois — auto-ban fail2ban" },
      { primary: "Ports ouverts", value: "3", valueColor: "text-green-600", secondary: "2222, 80, 443 uniquement", phase: "retroaction" },
    ]},
  ],
};
