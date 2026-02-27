/**
 * CockpitView.tsx — Cockpit Stats CEO
 * 4 KPI cards en haut + 12 rangees C-Level (identite + 3 angles × 4 KPIs)
 * Angles : Performance · Risques · Croissance
 * Sprint A — Frame Master V2
 */

import { Card } from "../../../components/ui/card";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import {
  TrendingUp, TrendingDown, DollarSign, Users, FileText, Target,
  Briefcase, Cpu, Megaphone, Factory, Settings, Shield, Scale, Lightbulb,
  Banknote, BarChart3, Award, Percent, Bug, Server, Gauge, PackageCheck,
  Boxes, Truck, AlertTriangle, Handshake, UserCheck, Heart, RotateCcw,
  Lock, ShieldAlert, FileSignature, Gavel, ScrollText, Beaker, Wallet, BadgeCheck,
  Clock, Wrench, Zap, CheckCircle, PieChart, Building2, Timer,
  Mail, Globe, Calendar, Activity, Receipt, HardDrive, GraduationCap,
  ArrowUpRight, GitBranch, LayoutDashboard, Eye,
} from "lucide-react";
import { BOT_AVATAR } from "../../api/types";
import { useFrameMaster } from "../../context/FrameMasterContext";

/* ============ KPI GAUGE CARD — header gradient ============ */
function KpiCard({ icon: Icon, label, value, change, changeType }: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "stable";
}) {
  const changeColor = changeType === "up" ? "text-green-600" : changeType === "down" ? "text-red-500" : "text-gray-500";
  const ChangeIcon = changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : TrendingUp;
  return (
    <Card className="p-0 overflow-hidden">
      <div className={cn("flex items-center gap-2 px-3 py-2", ROW_TONES.kpi)}>
        <Icon className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white">{label}</span>
        <ChangeIcon className={`h-4 w-4 ml-auto ${changeColor}`} />
      </div>
      <div className="px-3 py-1.5 flex items-center justify-between">
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        <span className={`text-sm font-semibold ${changeColor}`}>{change}</span>
      </div>
    </Card>
  );
}

const ROW_TONES = {
  kpi: "bg-gradient-to-r from-slate-800 to-slate-700",
};

/* ============ TYPES ============ */
interface AngleStat {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "stable";
}

interface Angle {
  label: string;
  icon: React.ElementType;
  maj?: string;
  stats: AngleStat[];
}

interface BotBulletin {
  heuresTravail: string;
  heuresSauvees: string;
  tauxSucces: string;
  tasksCompleted: string;
}

interface CLeveLineData {
  code: string;
  nom: string;
  icon: React.ElementType;
  bulletin: BotBulletin;
  angles: Angle[];
}

/* ============ GRADIENT PAR BOT ============ */
const BOT_GRADIENT: Record<string, string> = {
  BCO: "bg-gradient-to-r from-blue-600 to-blue-500",
  BCF: "bg-gradient-to-r from-emerald-600 to-emerald-500",
  BCT: "bg-gradient-to-r from-violet-600 to-violet-500",
  BFA: "bg-gradient-to-r from-slate-600 to-slate-500",
  BOO: "bg-gradient-to-r from-orange-600 to-orange-500",
  BRO: "bg-gradient-to-r from-amber-600 to-amber-500",
  BCM: "bg-gradient-to-r from-pink-600 to-pink-500",
  BCS: "bg-gradient-to-r from-red-600 to-red-500",
  BHR: "bg-gradient-to-r from-teal-600 to-teal-500",
  BSE: "bg-gradient-to-r from-zinc-700 to-zinc-600",
  BLE: "bg-gradient-to-r from-indigo-600 to-indigo-500",
  BPO: "bg-gradient-to-r from-fuchsia-600 to-fuchsia-500",
};

/* ============ 12 C-LEVEL × 3 ANGLES × 4 KPIs ============ */
const CLEVEL_LINES: CLeveLineData[] = [
  // ── BCO — CEO Direction ──
  { code: "BCO", nom: "CarlOS — Direction", icon: Briefcase,
    bulletin: { heuresTravail: "247h", heuresSauvees: "82h", tauxSucces: "94%", tasksCompleted: "156" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Decisions prises", value: "12", icon: Gavel, trend: "up" },
        { label: "Pipeline total", value: "475K$", icon: BarChart3, trend: "up" },
        { label: "Score global", value: "92/100", icon: Award, trend: "up" },
        { label: "Revenu mensuel", value: "425K$", icon: DollarSign, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "26 fev", stats: [
        { label: "Decisions en attente", value: "3", icon: Clock, trend: "down" },
        { label: "Alertes actives", value: "5", icon: AlertTriangle, trend: "down" },
        { label: "Conformite", value: "96%", icon: CheckCircle, trend: "up" },
        { label: "Budget vs reel", value: "-3%", icon: Target, trend: "stable" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "25 fev", stats: [
        { label: "Croissance YoY", value: "+24%", icon: ArrowUpRight, trend: "up" },
        { label: "Nouveaux clients", value: "5", icon: Users, trend: "up" },
        { label: "NPS", value: "72", icon: Heart, trend: "up" },
        { label: "Indice innovation", value: "3.8/5", icon: Lightbulb, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Projets actifs", value: "8", icon: FileText, trend: "up" },
        { label: "Budget global", value: "1.2M$", icon: Wallet, trend: "stable" },
        { label: "Reunions/sem", value: "12", icon: Calendar, trend: "stable" },
        { label: "Decisions/sem", value: "8", icon: Gavel, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Satisfaction equipe", value: "4.3/5", icon: Heart, trend: "up" },
        { label: "Bot Team actifs", value: "12/14", icon: Cpu, trend: "up" },
        { label: "Collaborateurs", value: "47", icon: Users, trend: "stable" },
        { label: "Formation heures", value: "24h/an", icon: GraduationCap, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "26 fev", stats: [
        { label: "GhostX plateforme", value: "72%", icon: Cpu, trend: "up" },
        { label: "Orbit9 reseau", value: "45%", icon: Globe, trend: "up" },
        { label: "REAI expansion", value: "130+", icon: Building2, trend: "up" },
        { label: "Interface V2", value: "85%", icon: LayoutDashboard, trend: "up" },
      ]},
    ]},

  // ── BCF — CFO Finance ──
  { code: "BCF", nom: "Agent CFO — Finance", icon: DollarSign,
    bulletin: { heuresTravail: "189h", heuresSauvees: "64h", tauxSucces: "97%", tasksCompleted: "98" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Cash flow net", value: "+34K$", icon: Banknote, trend: "up" },
        { label: "Marge brute", value: "42%", icon: Percent, trend: "up" },
        { label: "Marge nette", value: "18%", icon: Percent, trend: "up" },
        { label: "EBITDA", value: "185K$", icon: BarChart3, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "25 fev", stats: [
        { label: "Factures retard", value: "14K$", icon: Receipt, trend: "down" },
        { label: "DSO (jours)", value: "38", icon: Clock, trend: "stable" },
        { label: "Ratio dette/equite", value: "0.8x", icon: Scale, trend: "stable" },
        { label: "Budget vs reel", value: "-3%", icon: Target, trend: "stable" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "24 fev", stats: [
        { label: "Fonds de roulement", value: "220K$", icon: Wallet, trend: "up" },
        { label: "Prevision 90j", value: "+95K$", icon: BarChart3, trend: "up" },
        { label: "Cout/employe", value: "72K$", icon: Users, trend: "stable" },
        { label: "DPO (jours)", value: "45", icon: Timer, trend: "stable" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Factures emises/m", value: "48", icon: Receipt, trend: "up" },
        { label: "Rapports produits", value: "6", icon: FileText, trend: "up" },
        { label: "Audits planifies", value: "2", icon: CheckCircle, trend: "stable" },
        { label: "Reconciliations", value: "100%", icon: BadgeCheck, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Comptables", value: "3", icon: Users, trend: "stable" },
        { label: "Formation finance", value: "18h/an", icon: GraduationCap, trend: "up" },
        { label: "Certifications", value: "2 CPA", icon: Award, trend: "stable" },
        { label: "Heures analyse", value: "62h/m", icon: Clock, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "24 fev", stats: [
        { label: "Budget 2026", value: "95%", icon: Target, trend: "up" },
        { label: "ERP migration", value: "30%", icon: Server, trend: "up" },
        { label: "Automatisation AR", value: "60%", icon: Zap, trend: "up" },
        { label: "Refinancement", value: "En cours", icon: Banknote, trend: "stable" },
      ]},
    ]},

  // ── BCT — CTO Technologie ──
  { code: "BCT", nom: "Agent CTO — Technologie", icon: Cpu,
    bulletin: { heuresTravail: "312h", heuresSauvees: "127h", tauxSucces: "92%", tasksCompleted: "203" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Sprint A", value: "85%", icon: Gauge, trend: "up" },
        { label: "Uptime", value: "99.9%", icon: Server, trend: "up" },
        { label: "Temps API", value: "180ms", icon: Zap, trend: "up" },
        { label: "Deploiements/sem", value: "12", icon: ArrowUpRight, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "26 fev", stats: [
        { label: "Bugs critiques", value: "0", icon: Bug, trend: "up" },
        { label: "Incidents P1", value: "1", icon: AlertTriangle, trend: "stable" },
        { label: "Vulnerabilites", value: "2", icon: ShieldAlert, trend: "down" },
        { label: "Dette technique", value: "Moy.", icon: Wrench, trend: "stable" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "25 fev", stats: [
        { label: "Couverture tests", value: "78%", icon: CheckCircle, trend: "up" },
        { label: "Adoption IA", value: "62%", icon: Cpu, trend: "up" },
        { label: "Tickets ouverts", value: "8", icon: FileText, trend: "stable" },
        { label: "Cout infra/jour", value: "2.10$", icon: DollarSign, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "PRs mergees/sem", value: "18", icon: GitBranch, trend: "up" },
        { label: "Code reviews", value: "15", icon: FileText, trend: "up" },
        { label: "Migrations actives", value: "1", icon: Server, trend: "stable" },
        { label: "Docs techniques", value: "12", icon: ScrollText, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Developpeurs", value: "3", icon: Users, trend: "stable" },
        { label: "Stack mastery", value: "92%", icon: Award, trend: "up" },
        { label: "Pair programming", value: "8h/sem", icon: Users, trend: "up" },
        { label: "Code quality", value: "A", icon: BadgeCheck, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "26 fev", stats: [
        { label: "Interface V2", value: "85%", icon: LayoutDashboard, trend: "up" },
        { label: "API REST", value: "90%", icon: Server, trend: "up" },
        { label: "Pipeline CI/CD", value: "100%", icon: Zap, trend: "up" },
        { label: "Securite infra", value: "94%", icon: Shield, trend: "up" },
      ]},
    ]},

  // ── BFA — Production ──
  { code: "BFA", nom: "Agent Production", icon: Factory,
    bulletin: { heuresTravail: "156h", heuresSauvees: "48h", tauxSucces: "89%", tasksCompleted: "87" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "OEE global", value: "87%", icon: Gauge, trend: "up" },
        { label: "Cadence/heure", value: "142 u.", icon: Zap, trend: "up" },
        { label: "Rendement matiere", value: "94%", icon: PackageCheck, trend: "up" },
        { label: "Conformite ISO", value: "96%", icon: CheckCircle, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "25 fev", stats: [
        { label: "Taux rejet", value: "1.2%", icon: AlertTriangle, trend: "up" },
        { label: "Stock matiere", value: "78%", icon: Boxes, trend: "down" },
        { label: "Arret machines", value: "3.2h/s", icon: Wrench, trend: "down" },
        { label: "PPM defauts", value: "850", icon: Target, trend: "stable" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "24 fev", stats: [
        { label: "Commandes en prod", value: "18", icon: FileText, trend: "up" },
        { label: "Cout/unite", value: "23.50$", icon: DollarSign, trend: "up" },
        { label: "Heures supp", value: "12%", icon: Clock, trend: "stable" },
        { label: "Delai fabrication", value: "4.2j", icon: Timer, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Lots produits/jour", value: "24", icon: Boxes, trend: "up" },
        { label: "Changements ligne", value: "3/j", icon: RotateCcw, trend: "stable" },
        { label: "Maintenance prev.", value: "98%", icon: Wrench, trend: "up" },
        { label: "Calibrations", value: "100%", icon: Gauge, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Operateurs", value: "22", icon: Users, trend: "stable" },
        { label: "Certifications", value: "18/22", icon: Award, trend: "up" },
        { label: "Formation secu", value: "100%", icon: Shield, trend: "up" },
        { label: "Polyvalence", value: "3.2 postes", icon: RotateCcw, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "24 fev", stats: [
        { label: "Ligne automatisee", value: "40%", icon: Zap, trend: "up" },
        { label: "Lean 5S", value: "Phase 3", icon: CheckCircle, trend: "up" },
        { label: "Reduction dechets", value: "-18%", icon: PackageCheck, trend: "up" },
        { label: "Nouveau produit", value: "Proto", icon: Beaker, trend: "up" },
      ]},
    ]},

  // ── BOO — COO Operations ──
  { code: "BOO", nom: "Agent COO — Operations", icon: Settings,
    bulletin: { heuresTravail: "198h", heuresSauvees: "71h", tauxSucces: "91%", tasksCompleted: "134" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Efficacite ops", value: "91%", icon: Gauge, trend: "up" },
        { label: "OTIF", value: "96%", icon: Truck, trend: "up" },
        { label: "Utilisation cap.", value: "82%", icon: Building2, trend: "up" },
        { label: "Score fournisseurs", value: "4.1/5", icon: Award, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "26 fev", stats: [
        { label: "Alertes actives", value: "5", icon: AlertTriangle, trend: "down" },
        { label: "Taux retour", value: "1.8%", icon: RotateCcw, trend: "stable" },
        { label: "Conformite SST", value: "98%", icon: Shield, trend: "up" },
        { label: "Energie kWh/u", value: "2.4", icon: Zap, trend: "stable" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "25 fev", stats: [
        { label: "Projets amelioration", value: "7", icon: Lightbulb, trend: "up" },
        { label: "Cout logistique", value: "6.8%", icon: Truck, trend: "up" },
        { label: "Delai cmd→livr.", value: "6.5j", icon: Timer, trend: "up" },
        { label: "Fournisseurs actifs", value: "24", icon: Handshake, trend: "stable" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Commandes traitees/j", value: "35", icon: FileText, trend: "up" },
        { label: "Expeditions/j", value: "28", icon: Truck, trend: "up" },
        { label: "Receptions/j", value: "12", icon: PackageCheck, trend: "stable" },
        { label: "Inventaires a jour", value: "98%", icon: Boxes, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Superviseurs", value: "5", icon: Users, trend: "stable" },
        { label: "Formation ops", value: "32h/an", icon: GraduationCap, trend: "up" },
        { label: "Rotation postes", value: "2.8", icon: RotateCcw, trend: "up" },
        { label: "Satisfaction terrain", value: "4.1/5", icon: Heart, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "25 fev", stats: [
        { label: "Entrepot optim.", value: "65%", icon: Building2, trend: "up" },
        { label: "Transport route", value: "Phase 2", icon: Truck, trend: "up" },
        { label: "ERP integration", value: "80%", icon: Server, trend: "up" },
        { label: "Kaizen blitz", value: "2 actifs", icon: Zap, trend: "up" },
      ]},
    ]},

  // ── BRO — CRO Vente ──
  { code: "BRO", nom: "Agent CRO — Vente", icon: TrendingUp,
    bulletin: { heuresTravail: "221h", heuresSauvees: "93h", tauxSucces: "88%", tasksCompleted: "145" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Pipeline total", value: "475K$", icon: BarChart3, trend: "up" },
        { label: "Taux closing", value: "32%", icon: Handshake, trend: "up" },
        { label: "Revenu mensuel", value: "425K$", icon: DollarSign, trend: "up" },
        { label: "Panier moyen", value: "18.5K$", icon: Banknote, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "25 fev", stats: [
        { label: "Leads qualifies", value: "12", icon: UserCheck, trend: "up" },
        { label: "Cycle vente", value: "28j", icon: Timer, trend: "stable" },
        { label: "Retention clients", value: "94%", icon: Heart, trend: "up" },
        { label: "Win rate", value: "68%", icon: Award, trend: "up" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "24 fev", stats: [
        { label: "Nouveaux clients/m", value: "3", icon: Users, trend: "up" },
        { label: "Rev. recurrent", value: "85K$/m", icon: BarChart3, trend: "up" },
        { label: "Upsell/cross", value: "22%", icon: ArrowUpRight, trend: "up" },
        { label: "Soumissions", value: "7", icon: FileText, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Appels/jour", value: "18", icon: Activity, trend: "up" },
        { label: "Demos realisees/m", value: "8", icon: LayoutDashboard, trend: "up" },
        { label: "Propositions env.", value: "12", icon: FileSignature, trend: "up" },
        { label: "Suivis relance", value: "24", icon: RotateCcw, trend: "stable" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Representants", value: "4", icon: Users, trend: "stable" },
        { label: "Formation vente", value: "28h/an", icon: GraduationCap, trend: "up" },
        { label: "CRM adoption", value: "94%", icon: CheckCircle, trend: "up" },
        { label: "Coaching sessions", value: "6/m", icon: Heart, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "24 fev", stats: [
        { label: "Expansion Ontario", value: "25%", icon: Globe, trend: "up" },
        { label: "Programme partners", value: "Phase 1", icon: Handshake, trend: "up" },
        { label: "Plateforme devis", value: "60%", icon: FileText, trend: "up" },
        { label: "Fidelisation", value: "En cours", icon: Heart, trend: "up" },
      ]},
    ]},

  // ── BCM — CMO Marketing ──
  { code: "BCM", nom: "Agent CMO — Marketing", icon: Megaphone,
    bulletin: { heuresTravail: "175h", heuresSauvees: "58h", tauxSucces: "93%", tasksCompleted: "112" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Leads generes", value: "1.2K", icon: Users, trend: "up" },
        { label: "Taux conversion", value: "3.8%", icon: Percent, trend: "up" },
        { label: "ROI marketing", value: "4.2x", icon: DollarSign, trend: "up" },
        { label: "CPL", value: "12$", icon: Banknote, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "25 fev", stats: [
        { label: "Trafic web", value: "8.4K", icon: Globe, trend: "up" },
        { label: "Ouverture email", value: "38%", icon: Mail, trend: "stable" },
        { label: "Part de voix", value: "18%", icon: PieChart, trend: "up" },
        { label: "Notoriete marque", value: "62%", icon: Award, trend: "up" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "24 fev", stats: [
        { label: "Engagement social", value: "4.2%", icon: Activity, trend: "up" },
        { label: "Evenements/mois", value: "3", icon: Calendar, trend: "stable" },
        { label: "Contenu publie/m", value: "12", icon: FileText, trend: "up" },
        { label: "NPS marketing", value: "72", icon: Heart, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Campagnes actives", value: "4", icon: Megaphone, trend: "up" },
        { label: "Posts publies/sem", value: "8", icon: FileText, trend: "up" },
        { label: "Newsletters/m", value: "2", icon: Mail, trend: "stable" },
        { label: "Webinaires/m", value: "1", icon: Globe, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Specialistes mktg", value: "2", icon: Users, trend: "stable" },
        { label: "Agences partenaires", value: "2", icon: Handshake, trend: "stable" },
        { label: "Freelances", value: "3", icon: Users, trend: "up" },
        { label: "Budget/personne", value: "8K$/m", icon: DollarSign, trend: "stable" },
      ]},
      { label: "Projets", icon: Target, maj: "24 fev", stats: [
        { label: "Refonte site web", value: "55%", icon: Globe, trend: "up" },
        { label: "Video corporate", value: "Phase 2", icon: Activity, trend: "up" },
        { label: "Salon REAI", value: "Confirme", icon: Calendar, trend: "up" },
        { label: "Programme ambass.", value: "20%", icon: Users, trend: "up" },
      ]},
    ]},

  // ── BCS — CSO Strategie ──
  { code: "BCS", nom: "Agent CSO — Strategie", icon: Target,
    bulletin: { heuresTravail: "142h", heuresSauvees: "52h", tauxSucces: "96%", tasksCompleted: "78" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "25 fev", stats: [
        { label: "Croissance YoY", value: "+24%", icon: ArrowUpRight, trend: "up" },
        { label: "Part de marche", value: "8.5%", icon: PieChart, trend: "up" },
        { label: "NPS global", value: "72", icon: Heart, trend: "up" },
        { label: "Score VITAA", value: "78/100", icon: Award, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "25 fev", stats: [
        { label: "Risques identifies", value: "4", icon: AlertTriangle, trend: "stable" },
        { label: "Retention talents", value: "96%", icon: Users, trend: "up" },
        { label: "Objectifs Q1", value: "7/10", icon: Target, trend: "up" },
        { label: "Score ESG", value: "B+", icon: CheckCircle, trend: "up" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "20 fev", stats: [
        { label: "Pivots actifs", value: "2", icon: Target, trend: "stable" },
        { label: "Partenariats", value: "6", icon: Handshake, trend: "up" },
        { label: "Indice innovation", value: "3.8/5", icon: Lightbulb, trend: "up" },
        { label: "Rev. nouveau marche", value: "85K$", icon: DollarSign, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "25 fev", stats: [
        { label: "Analyses marche", value: "4/m", icon: BarChart3, trend: "up" },
        { label: "Rapports strat.", value: "2/m", icon: FileText, trend: "stable" },
        { label: "Veille concurrence", value: "Hebdo", icon: Eye, trend: "up" },
        { label: "Board meetings", value: "1/m", icon: Calendar, trend: "stable" },
      ]},
      { label: "Equipe", icon: Users, maj: "24 fev", stats: [
        { label: "Analystes", value: "2", icon: Users, trend: "stable" },
        { label: "Consultants ext.", value: "1", icon: Handshake, trend: "stable" },
        { label: "Think tanks", value: "2", icon: Lightbulb, trend: "up" },
        { label: "Comite strategie", value: "5 mbrs", icon: Users, trend: "stable" },
      ]},
      { label: "Projets", icon: Target, maj: "22 fev", stats: [
        { label: "Plan 2027", value: "35%", icon: Target, trend: "up" },
        { label: "Acquisition cible", value: "Veille", icon: Building2, trend: "stable" },
        { label: "International", value: "Explore", icon: Globe, trend: "up" },
        { label: "Diversification", value: "2 axes", icon: ArrowUpRight, trend: "up" },
      ]},
    ]},

  // ── BHR — CHRO RH ──
  { code: "BHR", nom: "Agent CHRO — RH", icon: Users,
    bulletin: { heuresTravail: "134h", heuresSauvees: "41h", tauxSucces: "95%", tasksCompleted: "67" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Effectifs total", value: "47", icon: Users, trend: "stable" },
        { label: "Engagement", value: "4.2/5", icon: Heart, trend: "up" },
        { label: "Taux roulement", value: "8%", icon: RotateCcw, trend: "up" },
        { label: "Anciennete moy.", value: "4.8 ans", icon: Clock, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "26 fev", stats: [
        { label: "Postes ouverts", value: "2", icon: UserCheck, trend: "stable" },
        { label: "Absenteisme", value: "3.2%", icon: Calendar, trend: "stable" },
        { label: "Griefs actifs", value: "0", icon: Gavel, trend: "up" },
        { label: "Diversite", value: "38%", icon: Users, trend: "up" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "21 fev", stats: [
        { label: "Formation/employe", value: "24h/an", icon: GraduationCap, trend: "up" },
        { label: "Satisfaction onboard", value: "4.5/5", icon: Award, trend: "up" },
        { label: "Delai embauche", value: "32j", icon: Timer, trend: "up" },
        { label: "Cout/embauche", value: "4.2K$", icon: DollarSign, trend: "stable" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Candidatures/m", value: "42", icon: FileText, trend: "up" },
        { label: "Entrevues/sem", value: "4", icon: Users, trend: "stable" },
        { label: "Evaluations", value: "12/an", icon: CheckCircle, trend: "up" },
        { label: "Paies traitees", value: "47", icon: DollarSign, trend: "stable" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Specialistes RH", value: "2", icon: Users, trend: "stable" },
        { label: "CRHA certifies", value: "1", icon: Award, trend: "stable" },
        { label: "Ratio RH/employe", value: "1:24", icon: Users, trend: "stable" },
        { label: "Satisfaction RH", value: "4.4/5", icon: Heart, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "22 fev", stats: [
        { label: "Programme bien-etre", value: "45%", icon: Heart, trend: "up" },
        { label: "Revision salariale", value: "Phase 2", icon: DollarSign, trend: "up" },
        { label: "Culture handbook", value: "70%", icon: FileText, trend: "up" },
        { label: "SIRH migration", value: "20%", icon: Server, trend: "up" },
      ]},
    ]},

  // ── BSE — Securite ──
  { code: "BSE", nom: "Agent Securite", icon: Shield,
    bulletin: { heuresTravail: "168h", heuresSauvees: "56h", tauxSucces: "98%", tasksCompleted: "89" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Score securite", value: "94%", icon: Shield, trend: "up" },
        { label: "Adoption MFA", value: "96%", icon: Lock, trend: "up" },
        { label: "Conformite CNESST", value: "100%", icon: CheckCircle, trend: "up" },
        { label: "Jours sans accident", value: "142", icon: Award, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "26 fev", stats: [
        { label: "Alertes actives", value: "4", icon: ShieldAlert, trend: "down" },
        { label: "Incidents (30j)", value: "1", icon: AlertTriangle, trend: "stable" },
        { label: "Vulnerabilites", value: "2", icon: Bug, trend: "down" },
        { label: "Temps reponse", value: "12 min", icon: Timer, trend: "up" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "23 fev", stats: [
        { label: "Formation secu", value: "92%", icon: GraduationCap, trend: "up" },
        { label: "Test phishing", value: "88%", icon: Mail, trend: "up" },
        { label: "Acces privilegies", value: "5", icon: Lock, trend: "stable" },
        { label: "Backup verifie", value: "Oui", icon: HardDrive, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Scans realises/m", value: "120", icon: ShieldAlert, trend: "up" },
        { label: "Patches appliques", value: "8", icon: CheckCircle, trend: "up" },
        { label: "Logs analyses/j", value: "10K+", icon: FileText, trend: "up" },
        { label: "Rapports securite", value: "4/m", icon: ScrollText, trend: "stable" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Agents securite", value: "2", icon: Shield, trend: "stable" },
        { label: "Certifications SST", value: "100%", icon: Award, trend: "up" },
        { label: "Premiers soins", value: "8 cert.", icon: Heart, trend: "up" },
        { label: "Comite SST", value: "6 mbrs", icon: Users, trend: "stable" },
      ]},
      { label: "Projets", icon: Target, maj: "24 fev", stats: [
        { label: "Plan continuite", value: "80%", icon: Shield, trend: "up" },
        { label: "Cameras upgrade", value: "Phase 2", icon: Eye, trend: "up" },
        { label: "Audit externe", value: "Planifie", icon: CheckCircle, trend: "stable" },
        { label: "Politique BYOD", value: "50%", icon: Lock, trend: "up" },
      ]},
    ]},

  // ── BLE — Legal ──
  { code: "BLE", nom: "Agent Legal", icon: Scale,
    bulletin: { heuresTravail: "112h", heuresSauvees: "38h", tauxSucces: "99%", tasksCompleted: "54" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "25 fev", stats: [
        { label: "Contrats signes/m", value: "5", icon: FileSignature, trend: "up" },
        { label: "Conformite Loi 25", value: "92%", icon: ScrollText, trend: "up" },
        { label: "Conformite normes", value: "98%", icon: CheckCircle, trend: "up" },
        { label: "PI actifs", value: "3", icon: BadgeCheck, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "25 fev", stats: [
        { label: "Contrats en attente", value: "3", icon: Clock, trend: "stable" },
        { label: "Litiges actifs", value: "0", icon: Gavel, trend: "up" },
        { label: "Provisions litiges", value: "15K$", icon: DollarSign, trend: "stable" },
        { label: "Contrats a renouveler", value: "4", icon: RotateCcw, trend: "stable" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "22 fev", stats: [
        { label: "Delai signature", value: "8j", icon: Timer, trend: "up" },
        { label: "Assurances a jour", value: "Oui", icon: Shield, trend: "up" },
        { label: "Audits completes", value: "2/3", icon: CheckCircle, trend: "up" },
        { label: "Cout juridique/m", value: "3.2K$", icon: DollarSign, trend: "stable" },
      ]},
      { label: "Operations", icon: Settings, maj: "25 fev", stats: [
        { label: "Contrats rediges/m", value: "8", icon: FileSignature, trend: "up" },
        { label: "Revisions legales", value: "12/m", icon: ScrollText, trend: "up" },
        { label: "Consultations", value: "6/m", icon: Users, trend: "stable" },
        { label: "Mise en conformite", value: "4 actifs", icon: CheckCircle, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "24 fev", stats: [
        { label: "Avocats reseau", value: "2", icon: Scale, trend: "stable" },
        { label: "Notaire", value: "1", icon: FileSignature, trend: "stable" },
        { label: "Paralegaux", value: "1", icon: Users, trend: "stable" },
        { label: "Budget juridique", value: "3.2K$/m", icon: DollarSign, trend: "stable" },
      ]},
      { label: "Projets", icon: Target, maj: "22 fev", stats: [
        { label: "Politique donnees", value: "75%", icon: Lock, trend: "up" },
        { label: "Marques commerce", value: "2 actifs", icon: BadgeCheck, trend: "up" },
        { label: "Accord cadre", value: "Phase 2", icon: Handshake, trend: "up" },
        { label: "Due diligence", value: "Veille", icon: Eye, trend: "stable" },
      ]},
    ]},

  // ── BPO — CPO Innovation ──
  { code: "BPO", nom: "Agent CPO — Innovation", icon: Lightbulb,
    bulletin: { heuresTravail: "163h", heuresSauvees: "67h", tauxSucces: "91%", tasksCompleted: "73" },
    angles: [
      { label: "Performance", icon: Gauge, maj: "26 fev", stats: [
        { label: "Projets R&D actifs", value: "3", icon: Beaker, trend: "stable" },
        { label: "Budget R&D", value: "88%", icon: Wallet, trend: "stable" },
        { label: "Brevets", value: "1+1", icon: BadgeCheck, trend: "up" },
        { label: "Produits lances (12m)", value: "2", icon: PackageCheck, trend: "up" },
      ]},
      { label: "Risques", icon: AlertTriangle, maj: "25 fev", stats: [
        { label: "POC en cours", value: "2", icon: Beaker, trend: "stable" },
        { label: "ROI projets R&D", value: "2.8x", icon: DollarSign, trend: "up" },
        { label: "Time-to-prototype", value: "18j", icon: Timer, trend: "up" },
        { label: "Adoption interne", value: "62%", icon: Users, trend: "up" },
      ]},
      { label: "Croissance", icon: TrendingUp, maj: "18 fev", stats: [
        { label: "Idees soumises/m", value: "14", icon: Lightbulb, trend: "up" },
        { label: "Partenariats R&D", value: "3", icon: Handshake, trend: "up" },
        { label: "Subventions", value: "45K$", icon: Banknote, trend: "up" },
        { label: "Score techno", value: "Top 15%", icon: Award, trend: "up" },
      ]},
      { label: "Operations", icon: Settings, maj: "26 fev", stats: [
        { label: "Experimentations", value: "6/m", icon: Beaker, trend: "up" },
        { label: "Prototypes testes", value: "3", icon: PackageCheck, trend: "up" },
        { label: "Etudes faisabilite", value: "2", icon: FileText, trend: "stable" },
        { label: "Workshops/m", value: "2", icon: Users, trend: "up" },
      ]},
      { label: "Equipe", icon: Users, maj: "25 fev", stats: [
        { label: "Chercheurs", value: "2", icon: Beaker, trend: "stable" },
        { label: "Stagiaires R&D", value: "1", icon: GraduationCap, trend: "stable" },
        { label: "Mentors externes", value: "2", icon: Handshake, trend: "up" },
        { label: "Heures lab", value: "120h/m", icon: Clock, trend: "up" },
      ]},
      { label: "Projets", icon: Target, maj: "24 fev", stats: [
        { label: "IA Vision", value: "72%", icon: Cpu, trend: "up" },
        { label: "Orbit9 moteur", value: "45%", icon: Globe, trend: "up" },
        { label: "Plateforme SaaS", value: "30%", icon: Server, trend: "up" },
        { label: "Green manufacturing", value: "15%", icon: Lightbulb, trend: "up" },
      ]},
    ]},
];

/* ============ C-LEVEL STATS ROWS — 3 angles × 4 KPIs ============ */

/* Icone + couleur par angle */
const ANGLE_STYLE: Record<string, { dotColor: string }> = {
  Performance: { dotColor: "bg-blue-400" },
  Risques: { dotColor: "bg-red-400" },
  Croissance: { dotColor: "bg-green-400" },
  Operations: { dotColor: "bg-orange-400" },
  Equipe: { dotColor: "bg-teal-400" },
  Projets: { dotColor: "bg-purple-400" },
};

function CLevelStatsRows() {
  return (
    <div className="space-y-6">
      {CLEVEL_LINES.map((bot) => {
        const avatar = BOT_AVATAR[bot.code];
        const gradient = BOT_GRADIENT[bot.code] || "bg-gradient-to-r from-gray-600 to-gray-500";

        return (
          <div key={bot.code} className="grid grid-cols-4 gap-2">
            {/* Box 1 : Identite + bulletin du bot — meme hauteur que les angles */}
            <Card className="p-0 overflow-hidden flex flex-col">
              <div className={cn("px-3 py-2 flex items-center gap-2", gradient)}>
                {avatar ? (
                  <img src={avatar} alt={bot.nom} className="w-6 h-6 rounded-full object-cover ring-2 ring-white/30 shrink-0" />
                ) : (
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <bot.icon className="h-3 w-3 text-white" />
                  </div>
                )}
                <p className="text-sm font-bold text-white truncate">{bot.nom.replace(" — ", " - ")}</p>
              </div>
              {/* Mini bulletin — 4 rows comme les 4 KPIs des angles */}
              <div className="px-2.5 py-1.5 flex-1">
                <div className="flex items-center gap-1.5 py-[3px]">
                  <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-600 flex-1">Travail</span>
                  <span className="text-sm font-bold text-gray-900">{bot.bulletin.heuresTravail}</span>
                </div>
                <div className="flex items-center gap-1.5 py-[3px]">
                  <Zap className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-600 flex-1">Sauvees</span>
                  <span className="text-sm font-bold text-green-600">{bot.bulletin.heuresSauvees}</span>
                </div>
                <div className="flex items-center gap-1.5 py-[3px]">
                  <CheckCircle className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-600 flex-1">Succes</span>
                  <span className="text-sm font-bold text-gray-900">{bot.bulletin.tauxSucces}</span>
                </div>
                <div className="flex items-center gap-1.5 py-[3px]">
                  <FileText className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-600 flex-1">Taches</span>
                  <span className="text-sm font-bold text-gray-900">{bot.bulletin.tasksCompleted}</span>
                </div>
              </div>
            </Card>

            {/* Box 2, 3, 4 : 3 premiers angles seulement (Performance / Risques / Croissance) */}
            {bot.angles.slice(0, 3).map((angle, ai) => {
              const AngleIcon = angle.icon;
              const style = ANGLE_STYLE[angle.label] || { dotColor: "bg-gray-400" };
              return (
                <Card key={ai} className="p-0 overflow-hidden flex flex-col">
                  {/* Header angle — gradient departement */}
                  <div className={cn("px-3 py-2 flex items-center gap-2", gradient)}>
                    <div className={cn("w-2 h-2 rounded-full shrink-0", style.dotColor)} />
                    <AngleIcon className="h-4 w-4 text-white/70 shrink-0" />
                    <p className="text-sm font-bold text-white flex-1">{angle.label}</p>
                    {angle.maj && (
                      <span className="text-[9px] text-white/50">{angle.maj}</span>
                    )}
                  </div>
                  {/* 4 KPI rows compact */}
                  <div className="px-2.5 py-1.5 flex-1">
                    {angle.stats.map((s, si) => {
                      const SIcon = s.icon;
                      return (
                        <div key={si} className="flex items-center gap-1.5 py-[3px]">
                          <SIcon className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-600 flex-1 truncate">{s.label}</span>
                          <span className="text-sm font-bold text-gray-900 shrink-0">{s.value}</span>
                          {s.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                          {s.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                          {s.trend === "stable" && <span className="w-3.5 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ============ VUE DEPARTEMENT — 12 KPIs d'un seul bot en grand ============ */
function DeptCockpit({ bot }: { bot: CLeveLineData }) {
  const avatar = BOT_AVATAR[bot.code];
  const gradient = BOT_GRADIENT[bot.code] || "bg-gradient-to-r from-gray-600 to-gray-500";

  return (
    <div className="space-y-4">
      {/* Bandeau identite du bot */}
      <Card className="p-0 overflow-hidden">
        <div className={cn("px-4 py-3 flex items-center gap-4", gradient)}>
          {avatar ? (
            <img src={avatar} alt={bot.nom} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 shrink-0" />
          ) : (
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <bot.icon className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-white">{bot.nom.replace(" — ", " - ")}</p>
            <p className="text-sm text-white/70">Cockpit departement — 12 KPIs</p>
          </div>
          {/* Bulletin compact inline */}
          <div className="ml-auto flex items-center gap-4">
            <div className="text-center"><span className="text-xs text-white/60 block">Travail</span><span className="text-sm font-bold text-white">{bot.bulletin.heuresTravail}</span></div>
            <div className="text-center"><span className="text-xs text-white/60 block">Sauvees</span><span className="text-sm font-bold text-green-300">{bot.bulletin.heuresSauvees}</span></div>
            <div className="text-center"><span className="text-xs text-white/60 block">Succes</span><span className="text-sm font-bold text-white">{bot.bulletin.tauxSucces}</span></div>
            <div className="text-center"><span className="text-xs text-white/60 block">Taches</span><span className="text-sm font-bold text-white">{bot.bulletin.tasksCompleted}</span></div>
          </div>
        </div>
      </Card>

      {/* 6 angles — 2 rangees de 3 (Performance/Risques/Croissance + Operations/Equipe/Projets) */}
      <div className="grid grid-cols-3 gap-3">
        {bot.angles.map((angle, ai) => {
          const AngleIcon = angle.icon;
          const style = ANGLE_STYLE[angle.label] || { dotColor: "bg-gray-400" };
          return (
            <Card key={ai} className="p-0 overflow-hidden">
              {/* Header angle */}
              <div className={cn("px-4 py-2.5 flex items-center gap-2", gradient)}>
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", style.dotColor)} />
                <AngleIcon className="h-4 w-4 text-white/70 shrink-0" />
                <p className="text-sm font-bold text-white flex-1">{angle.label}</p>
                {angle.maj && (
                  <span className="text-[10px] text-white/50">{angle.maj}</span>
                )}
              </div>
              {/* 4 KPIs — format plus grand */}
              <div className="divide-y">
                {angle.stats.map((s, si) => {
                  const SIcon = s.icon;
                  return (
                    <div key={si} className="px-4 py-2.5 flex items-center gap-2">
                      <SIcon className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">{s.label}</span>
                      <span className="text-lg font-extrabold text-gray-900 shrink-0">{s.value}</span>
                      {s.trend === "up" && <TrendingUp className="h-5 w-5 text-green-500 shrink-0" />}
                      {s.trend === "down" && <TrendingDown className="h-5 w-5 text-red-500 shrink-0" />}
                      {s.trend === "stable" && <span className="w-5 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============ COCKPIT VIEW — contextuel au bot actif ============ */
export function CockpitView() {
  const { activeBotCode } = useFrameMaster();

  // Trouver le bot actif dans les donnees
  const activeBot = activeBotCode !== "BCO"
    ? CLEVEL_LINES.find((b) => b.code === activeBotCode)
    : null;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3 max-w-6xl mx-auto">

        {activeBot ? (
          /* Vue departement — 12 KPIs du bot actif seulement */
          <DeptCockpit bot={activeBot} />
        ) : (
          /* Vue CEO 360 — tous les bots */
          <>
            {/* Row 1 : 4 KPI cards globaux */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <KpiCard icon={DollarSign} label="TRG — Rendement Global" value="87%" change="+3pts vs jan" changeType="up" />
              <KpiCard icon={Target} label="Pipeline total" value="1.0M$" change="+8% ce mois" changeType="up" />
              <KpiCard icon={Users} label="Clients actifs" value="22" change="+5 ce mois" changeType="up" />
              <KpiCard icon={FileText} label="Taux conversion" value="38%" change="+3pts vs jan" changeType="up" />
            </div>

            {/* 12 rangees C-Level — 4 boxes par ligne (identite + 3 angles) */}
            <CLevelStatsRows />
          </>
        )}

      </div>
    </ScrollArea>
  );
}
