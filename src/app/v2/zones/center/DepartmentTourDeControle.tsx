/**
 * DepartmentTourDeControle.tsx — Tour de Controle par departement
 * MEME PATTERN que DashboardView (CarlOS) : bandeau proactif + 2 rangees de 5 Cards
 * Si BCO (Direction) => redirige vers DashboardView
 * Sprint A — Frame Master V2
 */

import { ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";
import { DashboardView } from "./DashboardView";

/* ============ BLOCK HEADER — meme style que DashboardView ============ */
function BlockHeader({ icon: Icon, title, count, gradient }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  gradient: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 -mx-4 -mt-4 mb-3 px-4 py-2.5", gradient)}>
      <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-white flex-1">{title}</h3>
      {count !== undefined && (
        <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  );
}

/* ============ BLOC GENERIQUE — 1 Card avec gradient header + 3 items ============ */
interface BlocItem {
  primary: string;
  secondary: string;
  value?: string;
  valueColor?: string;
  pct?: number;
  pctColor?: string;
}

interface BlocConfig {
  icon: React.ElementType;
  title: string;
  gradient: string;
  ringColor: string;
  count?: number;
  items: BlocItem[];
}

function Bloc({ config, onClick }: { config: BlocConfig; onClick?: () => void }) {
  return (
    <Card className={cn("p-4 overflow-hidden cursor-pointer hover:ring-2 transition-shadow", config.ringColor)} onClick={onClick}>
      <BlockHeader icon={config.icon} title={config.title} count={config.count} gradient={config.gradient} />
      <ul className="space-y-2.5">
        {config.items.map((item, i) => (
          <li key={i} className="text-xs text-gray-800">
            {item.pct !== undefined ? (
              <>
                <div className="flex justify-between mb-0.5">
                  <span className="font-medium">{item.primary}</span>
                  <span className="font-bold">{item.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", item.pctColor || "bg-blue-500")} style={{ width: `${item.pct}%` }} />
                </div>
                {item.secondary && <p className="text-[11px] text-gray-400 mt-0.5">{item.secondary}</p>}
              </>
            ) : item.value ? (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">{item.primary}</span>
                  <span className={cn("font-bold", item.valueColor || "text-gray-700")}>{item.value}</span>
                </div>
                <p className="text-[11px] text-gray-400">{item.secondary}</p>
              </>
            ) : (
              <>
                <span className="font-medium">{item.primary}</span>
                {item.secondary && <p className="text-[11px] text-gray-400">{item.secondary}</p>}
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============ IMPORTS ICONS ============ */
import {
  DollarSign, PiggyBank, Receipt, TrendingUp, FileText,
  Cpu, Server, Bug, Settings, Shield,
  Factory, Cog, BarChart3, CheckCircle2, Wrench,
  Megaphone, Target, Users, Handshake, Lightbulb,
  CalendarDays, Newspaper, Scale, ShieldCheck,
  Gauge, LineChart, Package, ClipboardList,
  GraduationCap, HeartPulse, AlertTriangle, Lock,
  Briefcase, Globe, Zap, Eye, MessageSquare,
} from "lucide-react";

/* ============ CONFIGS PAR DEPARTEMENT — 10 blocs chacun ============ */

type DeptTdcConfig = {
  botName: string;
  summary: string;
  row1: BlocConfig[];
  row2: BlocConfig[];
};

const DEPT_TDC: Record<string, DeptTdcConfig> = {

  /* --- FINANCE (BCF) --- */
  BCF: {
    botName: "Agent CFO",
    summary: "Cash flow positif +34K$. 2 factures en retard (14K$). Marge brute a 42% — au-dessus de la cible.",
    row1: [
      { icon: DollarSign, title: "Tresorerie", gradient: "bg-gradient-to-r from-emerald-700 to-emerald-600", ringColor: "hover:ring-emerald-300", count: 2, items: [
        { primary: "Cash flow mensuel", value: "+34K$", valueColor: "text-emerald-600", secondary: "Positif 3e mois consecutif" },
        { primary: "Comptes recevables", value: "82K$", secondary: "12 factures ouvertes" },
        { primary: "Reserves disponibles", value: "145K$", secondary: "6 mois de runway" },
      ]},
      { icon: PiggyBank, title: "Budget", gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500", ringColor: "hover:ring-emerald-300", items: [
        { primary: "Budget Q1 utilise", pct: 68, pctColor: "bg-emerald-500", secondary: "Sur la cible" },
        { primary: "Marketing +15% depassement", secondary: "Alerte envoyee au CMO" },
        { primary: "Investissements R&D", value: "22K$", secondary: "Approuve — en cours" },
      ]},
      { icon: Receipt, title: "Facturation", gradient: "bg-gradient-to-r from-emerald-500 to-teal-500", ringColor: "hover:ring-teal-300", count: 2, items: [
        { primary: "MetalPro inc.", value: "8K$", valueColor: "text-red-500", secondary: "Retard 45 jours" },
        { primary: "AcierPlus", value: "6K$", valueColor: "text-red-500", secondary: "Retard 30 jours" },
        { primary: "TechnoSoud", value: "15K$", valueColor: "text-emerald-600", secondary: "Paye hier" },
      ]},
      { icon: TrendingUp, title: "Rentabilite", gradient: "bg-gradient-to-r from-teal-600 to-teal-500", ringColor: "hover:ring-teal-300", items: [
        { primary: "Marge brute", value: "42%", valueColor: "text-emerald-600", secondary: "Cible 40% — depasse" },
        { primary: "EBITDA", value: "18%", secondary: "Stable vs Q4" },
        { primary: "Cout acquisition client", value: "2.4K$", secondary: "En baisse de 12%" },
      ]},
      { icon: FileText, title: "Rapports", gradient: "bg-gradient-to-r from-teal-500 to-cyan-500", ringColor: "hover:ring-cyan-300", count: 1, items: [
        { primary: "Rapport mensuel fevrier", secondary: "A approuver · Soumis aujourd'hui" },
        { primary: "Previsions Q2", secondary: "En preparation par Agent CFO" },
        { primary: "Audit annuel 2025", secondary: "Complete — archive" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Finance", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Approuver rapport mensuel", secondary: "Agent CFO · Aujourd'hui" },
        { primary: "Relancer MetalPro (8K$)", secondary: "Retard 45 jours · Urgent" },
        { primary: "Reviser budget marketing", secondary: "Depassement 15% · 3 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Finance", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Cloture mensuelle", secondary: "28 fevrier" },
        { primary: "Revue budget Q2 (CFO)", secondary: "3 mars · 13:00" },
        { primary: "Rencontre comptable", secondary: "5 mars · 10:00" },
      ]},
      { icon: LineChart, title: "Indicateurs", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "DSO (delai encaissement)", value: "38 jours", secondary: "Cible: 30 jours" },
        { primary: "Ratio courant", value: "2.1x", valueColor: "text-emerald-600", secondary: "Sain" },
        { primary: "Burn rate mensuel", value: "24K$", secondary: "Stable" },
      ]},
      { icon: Newspaper, title: "Veille Finance", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Taux directeur maintenu a 4.25%", secondary: "Banque du Canada · Hier" },
        { primary: "Credit d'impot RS&DE 2026", secondary: "Revenu Quebec · 3 jours" },
        { primary: "Programme BDC pour PME", secondary: "BDC · Cette semaine" },
      ]},
      { icon: BarChart3, title: "Benchmarks", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Marge industrie mfg", value: "35-40%", secondary: "Vous: 42% — au-dessus" },
        { primary: "DSO industrie", value: "42 jours", secondary: "Vous: 38 — mieux" },
        { primary: "Ratio dette/equite", value: "1.2x", secondary: "Vous: 0.8x — sain" },
      ]},
    ],
  },

  /* --- TECHNOLOGIE (BCT) --- */
  BCT: {
    botName: "Agent CTO",
    summary: "Sprint A a 85%. 0 bug bloquant. Deploy V1 prevu vendredi. 535 tests OK.",
    row1: [
      { icon: Cpu, title: "Sprint Actif", gradient: "bg-gradient-to-r from-violet-700 to-violet-600", ringColor: "hover:ring-violet-300", items: [
        { primary: "Sprint A — Interface Web", pct: 85, pctColor: "bg-violet-500", secondary: "Livraison vendredi" },
        { primary: "12 endpoints API REST", secondary: "Tous fonctionnels" },
        { primary: "535 tests passent", value: "98%", valueColor: "text-green-600", secondary: "3 pre-existants en echec" },
      ]},
      { icon: Server, title: "Infrastructure", gradient: "bg-gradient-to-r from-violet-600 to-violet-500", ringColor: "hover:ring-violet-300", items: [
        { primary: "VPS OVH", value: "99.9%", valueColor: "text-green-600", secondary: "Uptime 30 jours" },
        { primary: "PostgreSQL", value: "OK", valueColor: "text-green-600", secondary: "5 modeles · 127.0.0.1:5432" },
        { primary: "CPU / RAM", value: "23%", secondary: "Charge normale" },
      ]},
      { icon: Bug, title: "Bugs", gradient: "bg-gradient-to-r from-violet-500 to-purple-500", ringColor: "hover:ring-purple-300", items: [
        { primary: "Bugs critiques", value: "0", valueColor: "text-green-600", secondary: "3 resolus cette semaine" },
        { primary: "Bugs mineurs", value: "4", secondary: "Non-bloquants" },
        { primary: "Google OAuth", secondary: "Casse — sprint dedie requis" },
      ]},
      { icon: Shield, title: "Securite", gradient: "bg-gradient-to-r from-purple-600 to-purple-500", ringColor: "hover:ring-purple-300", items: [
        { primary: "Derniere analyse", secondary: "Il y a 2 jours · 0 critique" },
        { primary: "Dependances a jour", pct: 92, pctColor: "bg-purple-500", secondary: "3 mises a jour mineures" },
        { primary: "API Keys", value: "OK", valueColor: "text-green-600", secondary: "Rotation prevue Q2" },
      ]},
      { icon: Settings, title: "DevOps", gradient: "bg-gradient-to-r from-purple-500 to-fuchsia-500", ringColor: "hover:ring-fuchsia-300", items: [
        { primary: "Dernier deploy", secondary: "Aujourd'hui 16:15 · OK" },
        { primary: "Backup auto", value: "OK", valueColor: "text-green-600", secondary: "Quotidien 03:00" },
        { primary: "Monitoring", secondary: "systemd + journalctl actif" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Tech", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Finaliser Interface V1", secondary: "Sprint A · Vendredi" },
        { primary: "Ajouter tests HealthView", secondary: "Agent CTO · Cette semaine" },
        { primary: "Corriger CORS API", secondary: "Fait aujourd'hui" },
      ]},
      { icon: CalendarDays, title: "Agenda Tech", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Demo Interface V1", secondary: "Vendredi · 14:00" },
        { primary: "Sprint B planning", secondary: "3 mars · 09:00" },
        { primary: "Review securite", secondary: "7 mars · 10:00" },
      ]},
      { icon: TrendingUp, title: "Metriques", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Cout API/jour", value: "1.20$", secondary: "Budget 5$ — en-dessous" },
        { primary: "Latence moyenne", value: "340ms", secondary: "T1-T2 · acceptable" },
        { primary: "Requetes/jour", value: "847", secondary: "+22% vs semaine derniere" },
      ]},
      { icon: Newspaper, title: "Veille Tech", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Claude 4.6 disponible", secondary: "Anthropic · Cette semaine" },
        { primary: "Vite 6.4 release candidate", secondary: "Vitejs · 3 jours" },
        { primary: "FastAPI 0.115 security fix", secondary: "Tiangolo · Hier" },
      ]},
      { icon: BarChart3, title: "Stack Score", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Couverture tests", value: "92%", valueColor: "text-green-600", secondary: "535/580 tests" },
        { primary: "Dette technique", value: "Faible", valueColor: "text-green-600", secondary: "Refactoring planifie Sprint B" },
        { primary: "Temps de deploy", value: "45s", secondary: "deploy.sh → systemd" },
      ]},
    ],
  },

  /* --- PRODUCTION (BFA) --- */
  BFA: {
    botName: "Agent Production",
    summary: "Ligne A a 94% capacite. 1 maintenance preventive prevue. Stock matiere a 78%.",
    row1: [
      { icon: Factory, title: "Lignes Production", gradient: "bg-gradient-to-r from-slate-700 to-slate-600", ringColor: "hover:ring-slate-300", items: [
        { primary: "Ligne A — Assemblage", pct: 94, pctColor: "bg-slate-500", secondary: "Capacite nominale" },
        { primary: "Ligne B — Usinage", pct: 82, pctColor: "bg-slate-500", secondary: "1 poste vacant" },
        { primary: "Ligne C — Finition", pct: 88, pctColor: "bg-slate-500", secondary: "OK" },
      ]},
      { icon: Gauge, title: "Qualite", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Taux de rejet", value: "1.2%", valueColor: "text-green-600", secondary: "Cible <2% — atteint" },
        { primary: "Non-conformites", value: "3", secondary: "2 mineures, 1 en cours" },
        { primary: "Audits planifies", secondary: "ISO 9001 — avril" },
      ]},
      { icon: Wrench, title: "Maintenance", gradient: "bg-gradient-to-r from-gray-600 to-gray-500", ringColor: "hover:ring-gray-300", count: 1, items: [
        { primary: "Preventive Ligne A", secondary: "Planifiee 3 mars · 4h" },
        { primary: "CNC #4 — revision", secondary: "Completee hier" },
        { primary: "Prochain arret planifie", secondary: "15 mars · Fin de semaine" },
      ]},
      { icon: Package, title: "Inventaire", gradient: "bg-gradient-to-r from-gray-500 to-zinc-500", ringColor: "hover:ring-zinc-300", items: [
        { primary: "Stock matiere premiere", pct: 78, pctColor: "bg-amber-500", secondary: "Commander avant 5 mars" },
        { primary: "Pieces de rechange", value: "OK", valueColor: "text-green-600", secondary: "Stock suffisant" },
        { primary: "Produits finis", value: "124", secondary: "En attente d'expedition" },
      ]},
      { icon: ClipboardList, title: "Commandes", gradient: "bg-gradient-to-r from-zinc-600 to-zinc-500", ringColor: "hover:ring-zinc-300", count: 3, items: [
        { primary: "MetalPro — Lot 2026-A", secondary: "En production · Livraison 7 mars" },
        { primary: "TechnoSoud — Composants", secondary: "Planifie · Debut 4 mars" },
        { primary: "AcierQC — Structures", secondary: "File d'attente · 10 mars" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Prod", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Planifier maintenance Ligne A", secondary: "Agent Production · 3 mars" },
        { primary: "Commander matiere premiere", secondary: "Seuil 78% — urgent" },
        { primary: "Former operateur poste B2", secondary: "RH · Cette semaine" },
      ]},
      { icon: CalendarDays, title: "Agenda Prod", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Revue production hebdo", secondary: "Lundi · 08:00" },
        { primary: "Maintenance Ligne A", secondary: "3 mars · 06:00-10:00" },
        { primary: "Livraison MetalPro", secondary: "7 mars" },
      ]},
      { icon: TrendingUp, title: "KPIs Prod", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "OEE global", value: "87%", valueColor: "text-green-600", secondary: "Cible 85% — depasse" },
        { primary: "Temps de cycle moyen", value: "12.4 min", secondary: "Stable" },
        { primary: "Pieces/heure", value: "48", secondary: "+3% vs mois dernier" },
      ]},
      { icon: Newspaper, title: "Veille Prod", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Hausse acier Q1: +8%", secondary: "Metal Bulletin · Cette semaine" },
        { primary: "Subvention automatisation PME", secondary: "MEI Quebec · Nouveau" },
        { primary: "Norme CSA W47.1 mise a jour", secondary: "CSA Group · Fevrier" },
      ]},
      { icon: BarChart3, title: "Benchmarks Prod", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "OEE industrie mfg", value: "82%", secondary: "Vous: 87% — superieur" },
        { primary: "Taux rejet industrie", value: "2-3%", secondary: "Vous: 1.2% — excellent" },
        { primary: "Delai livraison", value: "10-15j", secondary: "Vous: 8j — rapide" },
      ]},
    ],
  },

  /* --- OPERATION (BOO) --- */
  BOO: {
    botName: "Agent COO",
    summary: "5 alertes operationnelles. Logistique fluide. 3 processus en optimisation.",
    row1: [
      { icon: Settings, title: "Operations", gradient: "bg-gradient-to-r from-orange-700 to-orange-600", ringColor: "hover:ring-orange-300", count: 5, items: [
        { primary: "Efficacite globale", pct: 91, pctColor: "bg-orange-500", secondary: "Cible 90% — atteint" },
        { primary: "Temps d'arret non planifie", value: "2.1h", secondary: "Ce mois — acceptable" },
        { primary: "Satisfaction interne", value: "4.2/5", secondary: "Sondage mensuel" },
      ]},
      { icon: Package, title: "Logistique", gradient: "bg-gradient-to-r from-orange-600 to-orange-500", ringColor: "hover:ring-orange-300", items: [
        { primary: "Expeditions en cours", value: "8", secondary: "3 aujourd'hui" },
        { primary: "Delai moyen livraison", value: "4.2 jours", valueColor: "text-green-600", secondary: "Cible: 5 jours" },
        { primary: "Retours/reclamations", value: "0.8%", valueColor: "text-green-600", secondary: "Excellent" },
      ]},
      { icon: ClipboardList, title: "Processus", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Automatisation reception", pct: 65, pctColor: "bg-amber-500", secondary: "En cours d'implantation" },
        { primary: "Lean manufacturing", secondary: "3 chantiers actifs · Kaizen" },
        { primary: "5S — zone usinage", secondary: "Audit prevu 10 mars" },
      ]},
      { icon: Handshake, title: "Fournisseurs", gradient: "bg-gradient-to-r from-amber-500 to-yellow-500", ringColor: "hover:ring-yellow-300", items: [
        { primary: "Fournisseurs actifs", value: "24", secondary: "3 en evaluation" },
        { primary: "AcierPro — delai", secondary: "Conforme · 98% on-time" },
        { primary: "Nouveau: TechMetal QC", secondary: "Evaluation en cours" },
      ]},
      { icon: Gauge, title: "Performance", gradient: "bg-gradient-to-r from-yellow-600 to-yellow-500", ringColor: "hover:ring-yellow-300", items: [
        { primary: "Cout par unite", value: "12.30$", secondary: "Cible 13$ — en-dessous" },
        { primary: "Taux utilisation equip.", value: "88%", secondary: "Stable" },
        { primary: "Productivite/employe", value: "+4%", valueColor: "text-green-600", secondary: "vs Q4 2025" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Ops", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Finaliser chantier Lean #2", secondary: "Agent COO · Cette semaine" },
        { primary: "Evaluer TechMetal QC", secondary: "Nouveau fournisseur · 5 mars" },
        { primary: "Audit 5S zone usinage", secondary: "Planifie 10 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Ops", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Standup operations", secondary: "Quotidien · 08:30" },
        { primary: "Revue fournisseurs", secondary: "5 mars · 14:00" },
        { primary: "Audit 5S", secondary: "10 mars · 09:00" },
      ]},
      { icon: TrendingUp, title: "KPIs Ops", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "OTIF (on-time in-full)", value: "96%", valueColor: "text-green-600", secondary: "Cible 95%" },
        { primary: "Couts logistique", value: "-3%", valueColor: "text-green-600", secondary: "vs budget" },
        { primary: "Inventaire turns", value: "8.2x", secondary: "Industrie: 6x" },
      ]},
      { icon: Newspaper, title: "Veille Ops", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Tarifs transport +5% Q2", secondary: "Trans-Canada · Prevision" },
        { primary: "Norme ISO 45001 update", secondary: "ISO · Fevrier 2026" },
        { primary: "Subvention efficacite energetique", secondary: "Hydro-Quebec · Actif" },
      ]},
      { icon: BarChart3, title: "Benchmarks Ops", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "OTIF industrie", value: "92%", secondary: "Vous: 96% — excellent" },
        { primary: "Cout logistique/CA", value: "8-12%", secondary: "Vous: 7% — optimal" },
        { primary: "Rotation stock", value: "6x", secondary: "Vous: 8.2x — superieur" },
      ]},
    ],
  },

  /* --- VENTE (BRO) --- */
  BRO: {
    botName: "Agent CRO",
    summary: "Pipeline a 475K$. 2 deals en negociation. Taux closing a 32% — au-dessus de la cible.",
    row1: [
      { icon: TrendingUp, title: "Pipeline", gradient: "bg-gradient-to-r from-amber-700 to-amber-600", ringColor: "hover:ring-amber-300", items: [
        { primary: "Pipeline total", value: "475K$", valueColor: "text-amber-600", secondary: "+12% MoM" },
        { primary: "MetalPro v2 — Soumission", value: "125K$", secondary: "75% probabilite" },
        { primary: "TechnoSoud — Nego", value: "210K$", secondary: "60% probabilite" },
      ]},
      { icon: Users, title: "Leads", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", count: 5, items: [
        { primary: "Nouveaux leads ce mois", value: "23", secondary: "+8 vs mois dernier" },
        { primary: "Leads qualifies (SQL)", value: "12", secondary: "52% taux qualification" },
        { primary: "Source #1: referral REAI", value: "40%", secondary: "Reseau manufacturier" },
      ]},
      { icon: Handshake, title: "Deals Actifs", gradient: "bg-gradient-to-r from-orange-600 to-orange-500", ringColor: "hover:ring-orange-300", items: [
        { primary: "En negociation", value: "4", secondary: "Valeur: 380K$" },
        { primary: "Soumissions envoyees", value: "3", secondary: "Valeur: 195K$" },
        { primary: "Closing prevu Q1", value: "2", secondary: "MetalPro + AcierQC" },
      ]},
      { icon: Target, title: "Objectifs", gradient: "bg-gradient-to-r from-orange-500 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "CA mensuel", pct: 78, pctColor: "bg-amber-500", secondary: "78K$ / 100K$ cible" },
        { primary: "Taux closing", value: "32%", valueColor: "text-green-600", secondary: "Cible 28% — depasse" },
        { primary: "Valeur moyenne deal", value: "42K$", secondary: "+15% vs 2025" },
      ]},
      { icon: DollarSign, title: "Revenus", gradient: "bg-gradient-to-r from-red-600 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "CA cumule Q1", value: "215K$", secondary: "Cible Q1: 300K$" },
        { primary: "Recurrence (MRR)", value: "18K$", valueColor: "text-green-600", secondary: "6 contrats actifs" },
        { primary: "Revenue +12% MoM", secondary: "Tendance positive" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Vente", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Relancer MetalPro soumission", secondary: "Agent CRO · Aujourd'hui" },
        { primary: "Preparer demo TechnoSoud", secondary: "Jeudi · 10:00" },
        { primary: "Qualifier lead AlumiPlus", secondary: "Nouveau · Cette semaine" },
      ]},
      { icon: CalendarDays, title: "Agenda Vente", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Call MetalPro — soumission", secondary: "Aujourd'hui · 10:30" },
        { primary: "Demo TechnoSoud", secondary: "Jeudi · 14:00" },
        { primary: "Revue pipeline hebdo", secondary: "Vendredi · 09:00" },
      ]},
      { icon: LineChart, title: "Metriques Vente", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Cycle de vente moyen", value: "45 jours", secondary: "Industrie: 60 jours" },
        { primary: "Ratio lead → client", value: "18%", secondary: "En hausse" },
        { primary: "Retention clients", value: "94%", valueColor: "text-green-600", secondary: "Excellent" },
      ]},
      { icon: Newspaper, title: "Veille Vente", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Programme PARI pour PME mfg", secondary: "CNRC · Nouveau" },
        { primary: "Salon MACH 2026 — exposants", secondary: "Avril · Montreal" },
        { primary: "Tendance automatisation +22%", secondary: "McKinsey · Q1 2026" },
      ]},
      { icon: BarChart3, title: "Benchmarks Vente", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Taux closing industrie", value: "25%", secondary: "Vous: 32% — superieur" },
        { primary: "Cycle vente B2B mfg", value: "60-90j", secondary: "Vous: 45j — rapide" },
        { primary: "CAC industrie", value: "3-5K$", secondary: "Vous: 2.4K$ — efficient" },
      ]},
    ],
  },

  /* --- MARKETING (BCM) --- */
  BCM: {
    botName: "Agent CMO",
    summary: "1.2K leads generes. Taux conversion 3.8%. Campagne Q1 prete au lancement.",
    row1: [
      { icon: Megaphone, title: "Campagnes", gradient: "bg-gradient-to-r from-pink-700 to-pink-600", ringColor: "hover:ring-pink-300", items: [
        { primary: "Campagne Q1 — IA Mfg", pct: 95, pctColor: "bg-pink-500", secondary: "Lancement 3 mars" },
        { primary: "Email nurturing", value: "28%", secondary: "Taux d'ouverture" },
        { primary: "Budget depense", value: "12K$", secondary: "Sur 15K$ alloue" },
      ]},
      { icon: Globe, title: "Digital", gradient: "bg-gradient-to-r from-pink-600 to-pink-500", ringColor: "hover:ring-pink-300", items: [
        { primary: "Visites site web", value: "4.2K", secondary: "+22% ce mois" },
        { primary: "LinkedIn followers", value: "1.8K", secondary: "+120 ce mois" },
        { primary: "SEO — mots-cles top 10", value: "18", secondary: "+3 vs mois dernier" },
      ]},
      { icon: Users, title: "Leads", gradient: "bg-gradient-to-r from-rose-600 to-rose-500", ringColor: "hover:ring-rose-300", count: 12, items: [
        { primary: "Leads total ce mois", value: "1.2K", valueColor: "text-pink-600", secondary: "+18% vs Q4" },
        { primary: "MQL (marketing qualified)", value: "340", secondary: "28% du total" },
        { primary: "Transferes aux ventes", value: "45", secondary: "Ce mois" },
      ]},
      { icon: Eye, title: "Marque", gradient: "bg-gradient-to-r from-rose-500 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "Notoriete assistee", value: "34%", secondary: "Sondage Q1 — +8pts" },
        { primary: "NPS (promoteurs)", value: "72", valueColor: "text-green-600", secondary: "Excellent" },
        { primary: "Mentions presse", value: "5", secondary: "Les Affaires, BDC, MEI" },
      ]},
      { icon: Lightbulb, title: "Contenu", gradient: "bg-gradient-to-r from-red-600 to-red-500", ringColor: "hover:ring-red-300", items: [
        { primary: "Articles publies", value: "8", secondary: "Blog + LinkedIn" },
        { primary: "Etude de cas MetalPro", secondary: "En redaction · 80%" },
        { primary: "Video demo produit", secondary: "Tournage prevu 10 mars" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Mktg", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Valider brief campagne Q2", secondary: "Agent CMO · 3 mars" },
        { primary: "Approuver etude de cas", secondary: "MetalPro · Cette semaine" },
        { primary: "Brief video demo", secondary: "Tournage 10 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Mktg", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Lancement campagne Q1", secondary: "3 mars" },
        { primary: "Revue contenu hebdo", secondary: "Mercredi · 10:00" },
        { primary: "Tournage video", secondary: "10 mars · 13:00" },
      ]},
      { icon: LineChart, title: "Metriques Mktg", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Cout par lead (CPL)", value: "12$", secondary: "Cible 15$ — optimal" },
        { primary: "Taux conversion", value: "3.8%", secondary: "Cible 4% — presque" },
        { primary: "ROI marketing", value: "4.2x", valueColor: "text-green-600", secondary: "Excellent" },
      ]},
      { icon: Newspaper, title: "Veille Mktg", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "LinkedIn B2B: reach organique -15%", secondary: "Social Media Today · Hier" },
        { primary: "IA generative pour contenu B2B", secondary: "HubSpot · Cette semaine" },
        { primary: "Salon MACH 2026 — stand dispo", secondary: "Avril · Montreal" },
      ]},
      { icon: BarChart3, title: "Benchmarks Mktg", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "CPL industrie B2B", value: "25-50$", secondary: "Vous: 12$ — tres bon" },
        { primary: "Taux conversion B2B", value: "2-3%", secondary: "Vous: 3.8% — superieur" },
        { primary: "ROI moyen mktg", value: "3x", secondary: "Vous: 4.2x — excellent" },
      ]},
    ],
  },

  /* --- STRATEGIE (BCS) --- */
  BCS: {
    botName: "Agent CSO",
    summary: "Plan strategique 2026 valide. 2 pivots en cours. Prochaine revue le 5 mars.",
    row1: [
      { icon: Target, title: "Plan Strategique", gradient: "bg-gradient-to-r from-red-700 to-red-600", ringColor: "hover:ring-red-300", items: [
        { primary: "Plan 2026 — valide", secondary: "Approuve par le CA · Janvier" },
        { primary: "3 axes prioritaires", secondary: "IA Mfg · Orbit9 · International" },
        { primary: "Revue trimestrielle", secondary: "Prochaine: 5 mars" },
      ]},
      { icon: Lightbulb, title: "Pivots", gradient: "bg-gradient-to-r from-red-600 to-red-500", ringColor: "hover:ring-red-300", count: 2, items: [
        { primary: "Pivot #1 — IA manufacturiere", secondary: "En cours · Traction forte" },
        { primary: "Pivot #2 — Reseau Orbit9", secondary: "Phase exploration · 5 mars" },
        { primary: "Pivot #3 — International", secondary: "Q3 2026 · En planification" },
      ]},
      { icon: Eye, title: "Veille Concurrentielle", gradient: "bg-gradient-to-r from-rose-600 to-rose-500", ringColor: "hover:ring-rose-300", items: [
        { primary: "3 concurrents directs", secondary: "MfgAI, AutoFab, SmartShop" },
        { primary: "Avantage distinctif", secondary: "GHML + Orbit9 = unique" },
        { primary: "Part de marche QC", value: "~8%", secondary: "Cible 15% en 2027" },
      ]},
      { icon: Handshake, title: "Partenariats", gradient: "bg-gradient-to-r from-rose-500 to-pink-500", ringColor: "hover:ring-pink-300", items: [
        { primary: "REAI — 130+ manufacturiers", secondary: "Reseau actif · Source leads #1" },
        { primary: "BDC — programme PME", secondary: "En discussion · Financement" },
        { primary: "CDPQ — potentiel", secondary: "Premier contact Q2" },
      ]},
      { icon: Globe, title: "Expansion", gradient: "bg-gradient-to-r from-pink-600 to-pink-500", ringColor: "hover:ring-pink-300", items: [
        { primary: "Ontario — phase pilote", secondary: "Q3 2026 · 5 prospects" },
        { primary: "USA — exploration", secondary: "2027 · Midwest manufacturing" },
        { primary: "Europe — pas avant 2028", secondary: "Focus Canada d'abord" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Strat.", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Preparer revue trimestrielle", secondary: "Agent CSO · 5 mars" },
        { primary: "Analyser pivot Orbit9", secondary: "Potentiel reseau · En cours" },
        { primary: "Benchmark concurrents Q1", secondary: "MfgAI update · Cette semaine" },
      ]},
      { icon: CalendarDays, title: "Agenda Strat.", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Revue strategique Q1", secondary: "5 mars · 09:00" },
        { primary: "Board meeting", secondary: "15 mars · 14:00" },
        { primary: "Session Orbit9", secondary: "20 mars · 10:00" },
      ]},
      { icon: LineChart, title: "KPIs Strat.", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Croissance CA YoY", value: "+24%", valueColor: "text-green-600", secondary: "Cible +20%" },
        { primary: "Nouveaux marches", value: "2", secondary: "IA Mfg + Orbit9" },
        { primary: "Satisfaction client", value: "NPS 72", valueColor: "text-green-600", secondary: "Top quartile" },
      ]},
      { icon: Newspaper, title: "Veille Strat.", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "IA mfg: marche 12B$ en 2028", secondary: "McKinsey · Janvier 2026" },
        { primary: "PME QC: 68% veulent automatiser", secondary: "STIQ · Sondage 2026" },
        { primary: "Politique IA du Quebec", secondary: "MESI · En consultation" },
      ]},
      { icon: BarChart3, title: "Benchmarks Strat.", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Croissance SaaS B2B", value: "20-30%", secondary: "Vous: 24% — dans la norme" },
        { primary: "Retention nette (NRR)", value: "110%+", secondary: "Cible a atteindre" },
        { primary: "LTV/CAC ratio", value: "3x+", secondary: "Vous: 4.8x — excellent" },
      ]},
    ],
  },

  /* --- RH (BHR) --- */
  BHR: {
    botName: "Agent CHRO",
    summary: "1 embauche a confirmer. Climat social bon (4.2/5). Formation IA planifiee.",
    row1: [
      { icon: Users, title: "Effectifs", gradient: "bg-gradient-to-r from-teal-700 to-teal-600", ringColor: "hover:ring-teal-300", items: [
        { primary: "Employes actifs", value: "47", secondary: "3 temps partiel" },
        { primary: "Taux roulement", value: "8%", valueColor: "text-green-600", secondary: "Industrie: 15% — excellent" },
        { primary: "Postes ouverts", value: "2", secondary: "Operateur CNC + Dev" },
      ]},
      { icon: GraduationCap, title: "Formation", gradient: "bg-gradient-to-r from-teal-600 to-teal-500", ringColor: "hover:ring-teal-300", items: [
        { primary: "Formation IA pour equipe", secondary: "Planifiee 12 mars · 20 places" },
        { primary: "Heures formation/employe", value: "18h", secondary: "Cible 20h/an" },
        { primary: "Programme mentorat", secondary: "6 paires actives" },
      ]},
      { icon: HeartPulse, title: "Climat Social", gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500", ringColor: "hover:ring-emerald-300", items: [
        { primary: "Score engagement", value: "4.2/5", valueColor: "text-green-600", secondary: "Sondage fevrier" },
        { primary: "Absenteisme", value: "3.1%", secondary: "Industrie: 5% — bon" },
        { primary: "Grievances ouvertes", value: "0", valueColor: "text-green-600", secondary: "Aucune" },
      ]},
      { icon: DollarSign, title: "Remuneration", gradient: "bg-gradient-to-r from-emerald-500 to-green-500", ringColor: "hover:ring-green-300", items: [
        { primary: "Masse salariale mensuelle", value: "185K$", secondary: "Budget: 190K$" },
        { primary: "Salaire moyen", value: "52K$", secondary: "Competitif region" },
        { primary: "Avantages sociaux", value: "18%", secondary: "Du salaire — standard" },
      ]},
      { icon: ClipboardList, title: "Recrutement", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 1, items: [
        { primary: "Operateur CNC senior", secondary: "3 candidats · Entrevues en cours" },
        { primary: "Developpeur Full-Stack", secondary: "Affiche · 12 candidatures" },
        { primary: "Delai embauche moyen", value: "28 jours", secondary: "Industrie: 35 jours" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches RH", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 1, items: [
        { primary: "Confirmer embauche CNC", secondary: "Agent CHRO · Cette semaine" },
        { primary: "Organiser formation IA", secondary: "12 mars · Logistique" },
        { primary: "Revue salariale annuelle", secondary: "Planifiee avril" },
      ]},
      { icon: CalendarDays, title: "Agenda RH", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Entrevue CNC — candidat #2", secondary: "Jeudi · 10:00" },
        { primary: "Formation IA equipe", secondary: "12 mars · 09:00-16:00" },
        { primary: "Comite sante-securite", secondary: "15 mars · 13:00" },
      ]},
      { icon: LineChart, title: "KPIs RH", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Temps moyen embauche", value: "28j", secondary: "Cible: 30j — atteint" },
        { primary: "Taux retention 1 an", value: "92%", valueColor: "text-green-600", secondary: "Excellent" },
        { primary: "Satisfaction onboarding", value: "4.5/5", secondary: "Nouveau process" },
      ]},
      { icon: Newspaper, title: "Veille RH", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Salaire minimum QC +0.50$", secondary: "CNESST · Mai 2026" },
        { primary: "Penurie main-d'oeuvre mfg", secondary: "STIQ · Toujours critique" },
        { primary: "Loi 96 — formation francais", secondary: "OQLF · En vigueur" },
      ]},
      { icon: BarChart3, title: "Benchmarks RH", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Roulement industrie mfg", value: "15%", secondary: "Vous: 8% — superieur" },
        { primary: "Engagement moyen", value: "3.6/5", secondary: "Vous: 4.2 — au-dessus" },
        { primary: "Formation/employe", value: "12h", secondary: "Vous: 18h — bon" },
      ]},
    ],
  },

  /* --- SECURITE (BSE) --- */
  BSE: {
    botName: "Agent Securite",
    summary: "4 alertes actives. 1 tentative suspecte detectee. Conformite a 94%.",
    row1: [
      { icon: ShieldCheck, title: "Etat Securite", gradient: "bg-gradient-to-r from-zinc-800 to-zinc-700", ringColor: "hover:ring-zinc-300", count: 4, items: [
        { primary: "Score securite global", pct: 94, pctColor: "bg-green-500", secondary: "Cible 95% — presque" },
        { primary: "Alertes actives", value: "4", valueColor: "text-red-500", secondary: "1 critique, 3 warning" },
        { primary: "Derniere analyse", secondary: "Aujourd'hui · 06:00" },
      ]},
      { icon: AlertTriangle, title: "Menaces", gradient: "bg-gradient-to-r from-zinc-700 to-zinc-600", ringColor: "hover:ring-zinc-300", count: 1, items: [
        { primary: "Tentative connexion suspecte", secondary: "IP 185.x.x.x · Il y a 12 min" },
        { primary: "Scan de ports detecte", secondary: "Bloque · Hier 23:45" },
        { primary: "Phishing email bloque", secondary: "3 employes cibles · Ce matin" },
      ]},
      { icon: Lock, title: "Acces", gradient: "bg-gradient-to-r from-gray-700 to-gray-600", ringColor: "hover:ring-gray-300", items: [
        { primary: "Comptes actifs", value: "52", secondary: "47 employes + 5 services" },
        { primary: "MFA active", value: "96%", valueColor: "text-green-600", secondary: "2 comptes sans MFA" },
        { primary: "Derniere revue acces", secondary: "15 fevrier · OK" },
      ]},
      { icon: Shield, title: "Conformite", gradient: "bg-gradient-to-r from-gray-600 to-gray-500", ringColor: "hover:ring-gray-300", items: [
        { primary: "Loi 25 (vie privee)", pct: 92, pctColor: "bg-blue-500", secondary: "2 items restants" },
        { primary: "ISO 27001", secondary: "En preparation · Q3 2026" },
        { primary: "Politique securite", secondary: "Mise a jour fevrier — OK" },
      ]},
      { icon: Server, title: "Infrastructure", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Firewall", value: "OK", valueColor: "text-green-600", secondary: "Regles a jour" },
        { primary: "Backup chiffre", value: "OK", valueColor: "text-green-600", secondary: "Quotidien 03:00" },
        { primary: "SSL/TLS", secondary: "Certificats valides · Exp. juin" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Securite", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Investiguer connexion suspecte", secondary: "Sentinel · Urgent" },
        { primary: "Activer MFA sur 2 comptes", secondary: "Agent Securite · Cette semaine" },
        { primary: "Finaliser plan Loi 25", secondary: "2 items restants · 10 mars" },
      ]},
      { icon: CalendarDays, title: "Agenda Securite", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Test de penetration", secondary: "7 mars · Externe" },
        { primary: "Formation phishing equipe", secondary: "12 mars · 14:00" },
        { primary: "Revue politique securite", secondary: "1er avril" },
      ]},
      { icon: LineChart, title: "KPIs Securite", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Temps reponse incident", value: "< 15 min", valueColor: "text-green-600", secondary: "Cible: 30 min" },
        { primary: "Faux positifs", value: "12%", secondary: "En baisse — ML ajuste" },
        { primary: "Uptime securite", value: "99.97%", valueColor: "text-green-600", secondary: "SLA respecte" },
      ]},
      { icon: Newspaper, title: "Veille Securite", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Ransomware ciblant PME mfg", secondary: "CCCS · Alerte cette semaine" },
        { primary: "Faille critique Node.js", secondary: "CVE-2026-xxxx · Patchee" },
        { primary: "Guide NIST pour PME", secondary: "NIST · Mise a jour Q1" },
      ]},
      { icon: BarChart3, title: "Benchmarks Sec.", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Incidents/an PME mfg", value: "3-5", secondary: "Vous: 1 — excellent" },
        { primary: "Budget sec. / CA", value: "3-5%", secondary: "Vous: 4% — adequat" },
        { primary: "MFA adoption", value: "78%", secondary: "Vous: 96% — superieur" },
      ]},
    ],
  },

  /* --- LEGAL (BLE) --- */
  BLE: {
    botName: "Agent Legal",
    summary: "3 contrats en attente de signature. 0 litige actif. Conformite Loi 25 a 92%.",
    row1: [
      { icon: Scale, title: "Contrats", gradient: "bg-gradient-to-r from-indigo-700 to-indigo-600", ringColor: "hover:ring-indigo-300", count: 3, items: [
        { primary: "MetalPro — renouvellement", secondary: "A signer · Valeur 125K$" },
        { primary: "TechnoSoud — nouveau", secondary: "Revue juridique en cours" },
        { primary: "Bail entrepot #2", secondary: "Negociation · Exp. juin" },
      ]},
      { icon: Shield, title: "Conformite", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Loi 25 — vie privee", pct: 92, pctColor: "bg-indigo-500", secondary: "2 items restants" },
        { primary: "Normes du travail", value: "OK", valueColor: "text-green-600", secondary: "Conforme" },
        { primary: "Licences logicielles", value: "OK", valueColor: "text-green-600", secondary: "Toutes a jour" },
      ]},
      { icon: FileText, title: "Propriete Intel.", gradient: "bg-gradient-to-r from-blue-600 to-blue-500", ringColor: "hover:ring-blue-300", items: [
        { primary: "GHML — marque deposee", secondary: "Enregistree OPIC · 2025" },
        { primary: "GhostX — brevet pending", secondary: "Soumis · En examen" },
        { primary: "Orbit9 — marque", secondary: "A deposer · Q2 2026" },
      ]},
      { icon: AlertTriangle, title: "Litiges", gradient: "bg-gradient-to-r from-blue-500 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Litiges actifs", value: "0", valueColor: "text-green-600", secondary: "Aucun en cours" },
        { primary: "Dernier regle", secondary: "Fournisseur ABC · Sept 2025" },
        { primary: "Provision litiges", value: "15K$", secondary: "Reserve prudente" },
      ]},
      { icon: ClipboardList, title: "Reglementaire", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Declarations annuelles", value: "OK", valueColor: "text-green-600", secondary: "REQ + ARC" },
        { primary: "Assurances", secondary: "Renouvellement avril · A revoir" },
        { primary: "Politique IA interne", secondary: "A rediger · Q2 2026" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Legal", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 3, items: [
        { primary: "Signer contrat MetalPro", secondary: "Agent Legal · Urgent" },
        { primary: "Reviser contrat TechnoSoud", secondary: "En cours · Cette semaine" },
        { primary: "Deposer marque Orbit9", secondary: "Q2 2026 · A planifier" },
      ]},
      { icon: CalendarDays, title: "Agenda Legal", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Signature MetalPro", secondary: "3 mars · Notaire" },
        { primary: "Revue assurances", secondary: "15 mars · Courtier" },
        { primary: "Echeance bail entrepot", secondary: "Juin 2026 · A negocier" },
      ]},
      { icon: LineChart, title: "KPIs Legal", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Contrats signes Q1", value: "8", secondary: "Cible 10" },
        { primary: "Delai moyen signature", value: "12 jours", secondary: "En amelioration" },
        { primary: "Couts juridiques", value: "4.2K$", secondary: "Ce mois — dans le budget" },
      ]},
      { icon: Newspaper, title: "Veille Legal", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Loi 25 — guide pratique PME", secondary: "CAI Quebec · Fevrier" },
        { primary: "Reforme droit du travail QC", secondary: "Projet de loi · En etude" },
        { primary: "IA et responsabilite legale", secondary: "Barreau QC · Webinaire" },
      ]},
      { icon: BarChart3, title: "Benchmarks Legal", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "Couts juridiques PME", value: "3-8K$/mois", secondary: "Vous: 4.2K$ — raisonnable" },
        { primary: "Litiges/an PME", value: "1-2", secondary: "Vous: 0 — excellent" },
        { primary: "Conformite Loi 25", value: "~60%", secondary: "Vous: 92% — avance" },
      ]},
    ],
  },

  /* --- INNOVATION (BPO) --- */
  BPO: {
    botName: "Agent CPO",
    summary: "3 projets R&D actifs. 1 brevet en examen. Prototype IA vision en test.",
    row1: [
      { icon: Lightbulb, title: "Projets R&D", gradient: "bg-gradient-to-r from-fuchsia-700 to-fuchsia-600", ringColor: "hover:ring-fuchsia-300", count: 3, items: [
        { primary: "IA Vision qualite", pct: 72, pctColor: "bg-fuchsia-500", secondary: "Prototype en test · Ligne A" },
        { primary: "Orbit9 — moteur reseau", pct: 45, pctColor: "bg-fuchsia-500", secondary: "Sprint B · Architecture" },
        { primary: "Bot-to-Bot protocol", pct: 20, pctColor: "bg-fuchsia-500", secondary: "Sprint D · Exploration" },
      ]},
      { icon: Zap, title: "Prototypes", gradient: "bg-gradient-to-r from-fuchsia-600 to-fuchsia-500", ringColor: "hover:ring-fuchsia-300", items: [
        { primary: "IA Vision — camera test", secondary: "Ligne A · Detection defauts 94%" },
        { primary: "Chatbot multi-agent", secondary: "Interface V1 · Fonctionnel" },
        { primary: "Voice AI (ElevenLabs)", secondary: "Sprint B · Planifie" },
      ]},
      { icon: FileText, title: "Brevets & PI", gradient: "bg-gradient-to-r from-purple-600 to-purple-500", ringColor: "hover:ring-purple-300", items: [
        { primary: "GHML — brevet pending", secondary: "OPIC · En examen" },
        { primary: "Trisociation — a deposer", secondary: "Q2 2026 · Agent Legal" },
        { primary: "Publications tech", value: "2", secondary: "Blog + conference" },
      ]},
      { icon: Globe, title: "Veille Innovation", gradient: "bg-gradient-to-r from-purple-500 to-violet-500", ringColor: "hover:ring-violet-300", items: [
        { primary: "IA generative pour mfg", secondary: "Tendance forte · +40% adoption" },
        { primary: "Digital twin manufacturing", secondary: "En emergence · A explorer" },
        { primary: "Edge AI sur machines", secondary: "Cout en baisse · Opportunite" },
      ]},
      { icon: TrendingUp, title: "Roadmap Produit", gradient: "bg-gradient-to-r from-violet-600 to-violet-500", ringColor: "hover:ring-violet-300", items: [
        { primary: "Sprint A — Interface Web", secondary: "En cours · Fin 3 mars" },
        { primary: "Sprint B — Voice + Demo", secondary: "3-14 mars" },
        { primary: "Sprint C — Onboarding", secondary: "14-28 mars" },
      ]},
    ],
    row2: [
      { icon: CheckCircle2, title: "Taches Innov.", gradient: "bg-gradient-to-r from-green-600 to-green-500", ringColor: "hover:ring-green-300", count: 2, items: [
        { primary: "Evaluer resultats IA Vision", secondary: "Agent CPO · Cette semaine" },
        { primary: "Planifier Sprint B", secondary: "3 mars · Avec Agent CTO" },
        { primary: "Deposer brevet Trisociation", secondary: "Q2 2026 · Agent Legal" },
      ]},
      { icon: CalendarDays, title: "Agenda Innov.", gradient: "bg-gradient-to-r from-cyan-600 to-cyan-500", ringColor: "hover:ring-cyan-300", items: [
        { primary: "Demo IA Vision", secondary: "Vendredi · 14:00" },
        { primary: "Sprint B kickoff", secondary: "3 mars · 09:00" },
        { primary: "Conf IA manufacturiere", secondary: "22 mars · Montreal" },
      ]},
      { icon: LineChart, title: "KPIs Innov.", gradient: "bg-gradient-to-r from-amber-600 to-amber-500", ringColor: "hover:ring-amber-300", items: [
        { primary: "Budget R&D", value: "22K$", secondary: "Ce mois · Budget: 25K$" },
        { primary: "Time to prototype", value: "3 sem.", secondary: "En amelioration" },
        { primary: "Ideas pipeline", value: "14", secondary: "3 priorisees" },
      ]},
      { icon: Newspaper, title: "Veille R&D", gradient: "bg-gradient-to-r from-indigo-600 to-indigo-500", ringColor: "hover:ring-indigo-300", items: [
        { primary: "Claude 4.6 — multimodal avance", secondary: "Anthropic · Cette semaine" },
        { primary: "Computer vision pour QC", secondary: "Landing AI · Nouveau produit" },
        { primary: "ElevenLabs — voice cloning", secondary: "Pricing PME · A evaluer" },
      ]},
      { icon: BarChart3, title: "Benchmarks R&D", gradient: "bg-gradient-to-r from-slate-600 to-slate-500", ringColor: "hover:ring-slate-300", items: [
        { primary: "R&D / CA industrie", value: "3-5%", secondary: "Vous: 7% — investissement fort" },
        { primary: "Time to market", value: "6-12 mois", secondary: "Vous: 5 sem sprint — rapide" },
        { primary: "Brevets PME tech", value: "0-1", secondary: "Vous: 1 + 1 pending" },
      ]},
    ],
  },
};

/* ============ COMPOSANT PRINCIPAL ============ */
export function DepartmentTourDeControle() {
  const { activeBotCode, activeBot, setActiveView } = useFrameMaster();

  // BCO (Direction) = meme Tour de Controle que le home
  if (activeBotCode === "BCO") {
    return <DashboardView />;
  }

  const config = DEPT_TDC[activeBotCode];

  // Fallback si pas de config pour ce departement
  if (!config) {
    return (
      <ScrollArea className="h-full">
        <div className="p-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-gray-50 border rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">
              Tour de Controle en cours de configuration pour ce departement.
            </p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  const avatar = BOT_AVATAR[activeBotCode];
  const subtitle = BOT_SUBTITLE[activeBotCode] || config.botName;
  const botName = activeBot?.nom || config.botName;

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-4 max-w-5xl mx-auto">

        {/* Barre proactive du bot */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50 border rounded-xl px-4 py-3">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-300 shrink-0">
            {avatar ? (
              <img src={avatar} alt={botName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">{botName}:</span>{" "}
              {config.summary}
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => setActiveView("live-chat")}
          >
            Repondre
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Row 1 : 5 blocs domaine — meme layout que DashboardView */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {config.row1.map((bloc, i) => (
            <Bloc key={i} config={bloc} onClick={() => setActiveView("live-chat")} />
          ))}
        </div>

        {/* Row 2 : 5 blocs outils (Taches, Agenda, KPIs, Veille, Benchmarks) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {config.row2.map((bloc, i) => (
            <Bloc key={i} config={bloc} onClick={() => setActiveView("live-chat")} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
