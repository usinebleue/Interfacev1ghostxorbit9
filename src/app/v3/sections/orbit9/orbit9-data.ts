/**
 * orbit9-data.ts — Types, constantes et mock data pour Orbit9 V3
 *
 * Pattern: Record<string, Config> — comme TOUTES les sections V3
 * Source: PLAN-ORBIT9-V3-COMPLET-S91.md
 *
 * Utilisé par: Orbit9View, Orbit9Dashboard, Orbit9Blueprint, Orbit9Opportunites
 */

import {
  Home, BookOpen, Atom, Handshake, Shield, Rocket, Activity, BarChart3,
  UserCircle,
  Newspaper, Star, TrendingUp, DollarSign, Bot, AlertTriangle,
  Users, Factory, Calendar, Globe, Zap,
} from "lucide-react";
import type { Orbit9Section, PhaseKey } from "../../core/types";

// ═══ O9_TABS — Onglets Orbit9 (UNIQUEMENT ce qui est propre à Orbit9) ═══
// Chantiers/Projets/Missions/Tâches = dans les sections départements existantes (flag collaboratif)
// Discussions/Documents = dans les sections standard existantes
// Santé = VITAA dans le Blueprint existant

export interface O9TabDef {
  key: Orbit9Section;
  label: string;
  icon: React.ElementType;
}

export const O9_TABS: O9TabDef[] = [
  { key: "dashboard",    label: "Accueil",       icon: Home },
  { key: "blueprint",    label: "Blueprint",     icon: BookOpen },
  { key: "opportunites", label: "Opportunités",  icon: Handshake },
];

// ═══ O9_HEADER_TABS — Pour le header h-12 de WorkspacePhasesPanel ═══
// Pattern: COPIE de BLUEPRINT_HEADER_TABS (WorkspacePhasesPanel L137-158)
export const O9_HEADER_TABS: { key: Orbit9Section; label: string; icon: React.ElementType }[] = [
  { key: "dashboard",    label: "Vue d'ensemble", icon: Home },
  { key: "blueprint",    label: "Blueprint",      icon: BookOpen },
  { key: "opportunites", label: "Opportunités",   icon: Handshake },
];

// ═══ Labels section pour le header pastel ═══
export const O9_SECTION_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  blueprint: "Blueprint Collaboration",
  opportunites: "Opportunités",
  cellules: "Cellules",
  jumelage: "Jumelage",
  gouvernance: "Gouvernance",
  pionniers: "Pionniers",
  vitaa: "VITAA",
  perso: "Mon profil",
  feed: "Fil d'activité",
  nouvelles: "Nouvelles industrie",
  benchmark: "Benchmark industrie",
  industrie: "Industrie",
  evenements: "Événements",
  "creer-cellule": "Créer une cellule",
};

// ═══ Descriptions sous-sections (mini-hero) ═══
export const O9_SECTION_DESC: Record<string, string> = {
  signaux: "Éléments critiques et alertes nécessitant votre attention immédiate.",
  vedette: "Cellule du mois — performance, membres et accomplissements.",
  matches: "Opportunités de partenariat détectées par le Matching Engine.",
  feed: "Activité récente du réseau — victoires, actions bots et jalons.",
  nouvelles: "Veille sectorielle, subventions et tendances manufacturières.",
  industrie: "Indicateurs clés du secteur manufacturier québécois.",
  evenements: "Trisociations, assemblées et événements réseau à venir.",
  pionniers: "Programme Pionniers 9×9 — sièges sectoriels et prospects.",
  economie: "Rabais, mutualisation, TimeTokens et revenus générés.",
  mandataire: "Votre agent IA délégué — mandats actifs et résultats.",
};

// ═══ Types Dashboard — Réutilise les types GOLD STANDARD de CockpitView ═══

import type { DashboardBlocItem, DashboardBlocConfig } from "../CockpitView";

// Re-export pour usage dans les composants Orbit9
export type O9DashItem = DashboardBlocItem;
export type O9DashBloc = DashboardBlocConfig;

// O9KPI — Spécifique Orbit9 (pattern VITAA identique à CockpitView)
export interface O9KPI {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: React.ElementType;
}

// ═══ Types Opportunités ═══

export type OpportunityType =
  | "alliance-strategique"
  | "vente-conjointe"
  | "mutualisation-achats"
  | "rd-partagee"
  | "sous-traitance"
  | "validation-requise";

export type OpportunityStage =
  | "decouverte"
  | "qualification"
  | "introduction"
  | "collaboration"
  | "integration";

export interface OpportunityData {
  id: string;
  entreprise: string;
  secteur: string;
  region: string;
  type: OpportunityType;
  score: number;
  trustScore: number;
  trustTier: "or" | "argent" | "bronze";
  description: string;
  apport: string;
  apportPartenaire: string;
  stage: OpportunityStage;
  botAssigne: string;
  dateDetection: string;
  pilierVitaa: string;
  isNew?: boolean;
  isVedette?: boolean;
}

// ═══ Types Cellules ═══

export interface VitaaScore {
  v: number;
  i: number;
  t: number;
  a1: number;
  a2: number;
}

export interface CelluleMember {
  name: string;
  role: string;
  avatar: string;
  photo: string;
  vitaa: VitaaScore;
}

export type CelluleType = "interne" | "externe";

export interface CelluleData {
  id: string;
  name: string;
  type: CelluleType;
  members: number;
  maxMembers: number;
  gradient: string;
  membres: CelluleMember[];
  sousCellules: string[];
  status: PhaseKey;
  score: number;
  rabais: number;
}

// ═══ Types Feed ═══

export type FeedItemType = "match" | "win" | "trisociation" | "publication" | "bot-action" | "milestone";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  reactions: number;
  comments: number;
}

// ═══ Types Pionniers ═══

export type PionnierStatus = "pris" | "prospect" | "disponible";

export interface PionnierSector {
  id: string;
  label: string;
  status: PionnierStatus;
  entreprise?: string;
}

// ═══ MOCK DATA — Dashboard KPIs ═══

export const O9_DASHBOARD_KPIS: O9KPI[] = [
  { label: "Cellules actives", value: "4", delta: "+1 ce mois", up: true, icon: Atom },
  { label: "Membres réseau", value: "18", delta: "+3 ce trimestre", up: true, icon: Users },
  { label: "Matches actifs", value: "7", delta: "+2 cette sem.", up: true, icon: Handshake },
  { label: "Score VITAA", value: "72%", delta: "+5 pts", up: true, icon: Activity },
  { label: "ROI Réseau", value: "47K$", delta: "+18% QoQ", up: true, icon: TrendingUp },
];

// ═══ MOCK DATA — Dashboard 9 blocs (3 rows × 3) ═══

export const O9_DASH_ROW1: O9DashBloc[] = [
  {
    icon: AlertTriangle, title: "Signaux & Alertes", count: 3,
    items: [
      { primary: "Trust warning — MetalPro", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Score confiance descendu à 62%", phase: "attention" },
      { primary: "Contrat cellule expire", value: "14 jours", valueColor: "text-orange-600", secondary: "Les Titans — renouvellement requis" },
      { primary: "Mandataire en attente", value: "Action", valueColor: "text-blue-600", secondary: "3 leads qualifiés — décision requise", bot: "CEOB" },
    ],
  },
  {
    icon: Star, title: "Cellule vedette", count: 1,
    items: [
      { primary: "Les Titans", value: "92%", valueColor: "text-emerald-600", secondary: "Meilleure cellule du mois — ROI +34%" },
      { primary: "6/9 membres actifs", secondary: "3 sous-cellules: Marketing, Ops, Stratégie" },
      { primary: "Badge: Elite Q1 2026", value: "Or", valueColor: "text-amber-600", secondary: "Top 5% du réseau Brain Team" },
    ],
  },
  {
    icon: Handshake, title: "Matches en cours", count: 3,
    items: [
      { primary: "Usine Bleue × MetalPro", value: "87%", valueColor: "text-emerald-600", pct: 87, pctColor: "bg-emerald-500", secondary: "Alliance stratégique — Qualification", bot: "CROB" },
      { primary: "Usine Bleue × AutomatikPro", value: "82%", valueColor: "text-blue-600", pct: 82, pctColor: "bg-blue-500", secondary: "R&D partagée — Découverte", bot: "CTOB" },
      { primary: "Usine Bleue × LogiQC", value: "76%", valueColor: "text-teal-600", pct: 76, pctColor: "bg-teal-500", secondary: "Mutualisation achats — Introduction", bot: "COOB" },
    ],
  },
];

export const O9_DASH_ROW2: O9DashBloc[] = [
  {
    icon: Newspaper, title: "Fil d'activité", count: 5,
    items: [
      { primary: "Contrat 500K$ gagné en cellule!", value: "Win", valueColor: "text-emerald-600", secondary: "Les Titans × MetalPro — collaboration réussie" },
      { primary: "CarlOS a qualifié 3 leads", value: "Bot", valueColor: "text-blue-600", secondary: "Auto-Scout détecte des complémentarités", bot: "CEOB" },
      { primary: "Trisociation terminée", value: "Résumé", valueColor: "text-violet-600", secondary: "Usine Bleue × AutomatikPro — étapes définies" },
      { primary: "Nouveau membre: AcierPlus", value: "Réseau", valueColor: "text-teal-600", secondary: "Secteur: Usinage — Région: Montérégie" },
    ],
  },
  {
    icon: Globe, title: "Nouvelles industrie", count: 3,
    items: [
      { primary: "3 partenaires potentiels détectés", value: "89%", valueColor: "text-emerald-600", secondary: "Matching Engine — secteur robotique" },
      { primary: "Adoption IA en usine +47%", value: "Tendance", valueColor: "text-blue-600", secondary: "Manufacturiers QC — rapport MESI Q1 2026" },
      { primary: "Subvention MEI: 50K$", value: "Nouveau", valueColor: "text-green-600", secondary: "Programme innovation — date limite 30 mai" },
    ],
  },
  {
    icon: Calendar, title: "Prochains événements", count: 3,
    items: [
      { primary: "Trisociation: UB × AutomatikPro", value: "20 avril", valueColor: "text-violet-600", secondary: "10h — Conference AI avec CarlOS" },
      { primary: "Assemblée S3 — Les Titans", value: "25 avril", valueColor: "text-blue-600", secondary: "Revue trimestrielle, élection rôles" },
      { primary: "Webinaire: IA en production", value: "2 mai", valueColor: "text-teal-600", secondary: "Organisé par le réseau Brain Team" },
    ],
  },
];

export const O9_DASH_ROW3: O9DashBloc[] = [
  {
    icon: Rocket, title: "Pionniers", count: 5,
    items: [
      { primary: "5/9 places confirmées", value: "56%", valueColor: "text-emerald-600", pct: 56, pctColor: "bg-emerald-500", secondary: "2 prospects actifs, 2 places restantes" },
      { primary: "Prochain: Logistique", value: "Prospect", valueColor: "text-amber-600", secondary: "TransQC en évaluation — score 74%" },
      { primary: "3 places restantes!", value: "Urgence", valueColor: "text-red-600", urgent: true, secondary: "Lifetime 1350$/mois — économie 13800$/an" },
    ],
  },
  {
    icon: DollarSign, title: "Économie réseau", count: 4,
    items: [
      { primary: "Rabais actif", value: "18%", valueColor: "text-emerald-600", secondary: "6 membres = palier 3 (15-20%)" },
      { primary: "Économie ce mois", value: "3.2K$", valueColor: "text-emerald-600", secondary: "Mutualisation achats + tarifs préférentiels" },
      { primary: "TimeTokens accumulés", value: "1,847 UT", valueColor: "text-blue-600", secondary: "Valeur estimée: 2.4K$ en services" },
      { primary: "Revenus réseau YTD", value: "42K$", valueColor: "text-emerald-600", secondary: "+34% vs année précédente" },
    ],
  },
  {
    icon: Bot, title: "Mon Mandataire", count: 3,
    items: [
      { primary: "3 mandats actifs", value: "Actif", valueColor: "text-green-600", secondary: "Veille marché, qualification leads, négo" },
      { primary: "Dernière action: il y a 2h", secondary: "Analyse de 3 marchés nocturnes terminée", bot: "CEOB" },
      { primary: "Pre-flight check prêt", value: "Action", valueColor: "text-blue-600", secondary: "MetalPro — contre-offre préparée" },
    ],
  },
];

// ═══ Benchmark industrie — Box résumé overview ═══

export const O9_BENCHMARK_BOX: O9DashBloc = {
  icon: BarChart3, title: "Benchmark industrie", count: 3,
  items: [
    { primary: "Revenus Manuf. QC", value: "218 G$", valueColor: "text-emerald-600", secondary: "+22.8% vs 2019 — ISQ 2024" },
    { primary: "Productivité QC", value: "65.90$/h", valueColor: "text-amber-600", secondary: "-10.5% vs Ontario — ISQ 2024" },
    { primary: "Adoption IA (PME)", value: "43%", valueColor: "text-blue-600", secondary: "+39 pts vs 2019 — STIQ/MEIE 2025" },
  ],
};

// ═══ DETAIL BLOCS — Versions enrichies pour drill-down sidebar ═══

export const O9_DETAIL_FEED: O9DashBloc = {
  icon: Newspaper, title: "Fil d'activité", count: 12,
  items: [
    { primary: "Contrat 500K$ gagné en cellule!", value: "Win", valueColor: "text-emerald-600", secondary: "Les Titans × MetalPro — collaboration réussie", phase: "retroaction" },
    { primary: "CarlOS a qualifié 3 leads", value: "Bot", valueColor: "text-blue-600", secondary: "Auto-Scout détecte des complémentarités", bot: "CEOB", phase: "execution" },
    { primary: "Trisociation terminée", value: "Résumé", valueColor: "text-violet-600", secondary: "Usine Bleue × AutomatikPro — étapes définies", phase: "retroaction" },
    { primary: "Nouveau membre: AcierPlus", value: "Réseau", valueColor: "text-teal-600", secondary: "Secteur: Usinage — Région: Montérégie", phase: "execution" },
    { primary: "Carl F. publie: Stratégie 2026", value: "Post", valueColor: "text-blue-600", secondary: "Vision expansion régionale — 12 réactions", phase: "creation" },
    { primary: "Simone (CSO): Analyse concurrentielle", value: "Bot", valueColor: "text-violet-600", secondary: "3 menaces identifiées — rapport prêt", bot: "CSOB", phase: "reflexion" },
    { primary: "Olivier (COO): Audit ops terminé", value: "Bot", valueColor: "text-amber-600", secondary: "Score efficacité: 78% — 4 recommandations", bot: "COOB", phase: "retroaction" },
    { primary: "Cercle atteint 5 membres → -15%", value: "Jalon", valueColor: "text-emerald-600", secondary: "Nouveau palier rabais — prochain: 7 = -20%", phase: "execution" },
    { primary: "Inès (CINO): Veille IA complétée", value: "Bot", valueColor: "text-blue-600", secondary: "Rapport 12 pages — 3 opportunités détectées", bot: "CINOB", phase: "reflexion" },
    { primary: "Formation croisée inter-cellules", value: "Nouveau", valueColor: "text-teal-600", secondary: "Les Titans partagent expertise soudure — 8 participants", phase: "creation" },
    { primary: "Hélène (CHRO): Plan relève mis à jour", value: "Bot", valueColor: "text-rose-600", secondary: "3 postes clés identifiés — succession planifiée", bot: "CHROB", phase: "reflexion" },
    { primary: "Assemblée cellule terminée", value: "Résumé", valueColor: "text-violet-600", secondary: "Les Titans — 6 décisions, 4 actions assignées", phase: "retroaction" },
  ],
};

export const O9_DETAIL_NOUVELLES: O9DashBloc = {
  icon: Globe, title: "Nouvelles industrie", count: 10,
  items: [
    { primary: "3 partenaires potentiels détectés", value: "89%", valueColor: "text-emerald-600", secondary: "Matching Engine — secteur robotique", phase: "execution" },
    { primary: "Adoption IA en usine +47%", value: "Tendance", valueColor: "text-blue-600", secondary: "Manufacturiers QC — rapport MESI Q1 2026", phase: "reflexion" },
    { primary: "Subvention MEI: 50K$", value: "Nouveau", valueColor: "text-green-600", secondary: "Programme innovation — date limite 30 mai", phase: "attention" },
    { primary: "Bot CFO: 47K$ en optimisations", value: "Perf.", valueColor: "text-amber-600", secondary: "Assurance 12K$ + Crédit impôt 25K$ + Achats 10K$", phase: "retroaction" },
    { primary: "Mission complétée: Audit sécurité", value: "72/100", valueColor: "text-amber-600", secondary: "Rapport 28 pages — 5 recommandations", phase: "retroaction" },
    { primary: "Rapport mensuel: 124 tâches", value: "Bilan", valueColor: "text-violet-600", secondary: "6 bots C-Level, 3 projets avancés, 47K$ valeur", phase: "retroaction" },
    { primary: "Norme ISO 50001 manufacturier", value: "Nouveau", valueColor: "text-blue-600", secondary: "Standard énergie — impact sur 23% des PME QC", phase: "reflexion" },
    { primary: "Salon Automatisation Montréal", value: "15 mai", valueColor: "text-teal-600", secondary: "250 exposants — inscription réseau ouverte", phase: "creation" },
    { primary: "Pénurie main-d'œuvre: 18K postes", value: "Alerte", valueColor: "text-red-600", secondary: "Manufacturier QC — Q1 2026", phase: "attention" },
    { primary: "Programme CDPQ manufacturier", value: "Ouvert", valueColor: "text-green-600", secondary: "Financement 100-500K$ — PME innovantes", phase: "execution" },
  ],
};

export const O9_DETAIL_BENCHMARK: O9DashBloc = {
  icon: BarChart3, title: "Benchmark industrie", count: 8,
  items: [
    { primary: "Revenus Manuf. QC", value: "218 G$", valueColor: "text-emerald-600", secondary: "+22.8% vs 2019 — ISQ 2024" },
    { primary: "Emplois manufacturiers", value: "417K", valueColor: "text-amber-600", secondary: "-0.8% vs 2023 — STIQ 2025" },
    { primary: "Adoption IA (PME)", value: "43%", valueColor: "text-blue-600", pct: 43, pctColor: "bg-blue-500", secondary: "+39 pts vs 2019 — STIQ/MEIE 2025" },
    { primary: "Productivité QC", value: "65.90$/h", valueColor: "text-red-600", secondary: "-10.5% vs Ontario — ISQ 2024" },
    { primary: "Adoption CAO/DAO", value: "61%", valueColor: "text-emerald-600", pct: 61, pctColor: "bg-emerald-500", secondary: "Taux le plus élevé — manufacturing QC" },
    { primary: "Adoption ERP/MRP", value: "51%", valueColor: "text-amber-600", pct: 51, pctColor: "bg-amber-500", secondary: "Seulement 3% pleinement connecté" },
    { primary: "Robotique/FMS/MES", value: "38%", valueColor: "text-blue-600", pct: 38, pctColor: "bg-blue-500", secondary: "Canada: ~200 robots / 10K employés" },
    { primary: "ROI moyen techno", value: "1.60$", valueColor: "text-emerald-600", secondary: "Par dollar investi — Leaders: 2.40$" },
  ],
};

export const O9_DETAIL_EVENTS: O9DashBloc = {
  icon: Calendar, title: "Événements", count: 8,
  items: [
    { primary: "Trisociation: UB × AutomatikPro", value: "20 avril", valueColor: "text-violet-600", secondary: "10h — Conference AI avec CarlOS", phase: "execution" },
    { primary: "Assemblée S3 — Les Titans", value: "25 avril", valueColor: "text-blue-600", secondary: "Revue trimestrielle, élection rôles", phase: "execution" },
    { primary: "Webinaire: IA en production", value: "2 mai", valueColor: "text-teal-600", secondary: "Organisé par le réseau Brain Team", phase: "creation" },
    { primary: "Rassemblement Cercle #1", value: "Q2 2026", valueColor: "text-emerald-600", secondary: "Review métriques, nouvelles opportunités", phase: "reflexion" },
    { primary: "Demo Investisseurs", value: "Q3 2026", valueColor: "text-amber-600", secondary: "Pitch impact Orbit9 — potentiel investisseurs", phase: "creation" },
    { primary: "Salon Automatisation MTL", value: "15 mai", valueColor: "text-blue-600", secondary: "Stand Brain Team — 4 places réseau", phase: "execution" },
    { primary: "Formation CarlOS avancée", value: "8 mai", valueColor: "text-teal-600", secondary: "Atelier 2h — optimisation mandats IA", phase: "creation" },
    { primary: "Revue VITAA trimestrielle", value: "1 juin", valueColor: "text-violet-600", secondary: "Scan complet — tous les membres cellule", phase: "reflexion" },
  ],
};

// ═══ Industrie — Box résumé overview + détail complet TRG ═══

export const O9_INDUSTRIE_BOX: O9DashBloc = {
  icon: Factory, title: "Industrie", count: 3,
  items: [
    { primary: "Revenus Manuf. QC", value: "218 G$", valueColor: "text-emerald-600", secondary: "+22.8% vs 2019 — ISQ 2024" },
    { primary: "Productivité QC", value: "65.90$/h", valueColor: "text-amber-600", secondary: "-10.5% vs Ontario — ISQ 2024" },
    { primary: "Adoption IA (PME)", value: "43%", valueColor: "text-blue-600", secondary: "+39 pts vs 2019 — STIQ/MEIE 2025" },
  ],
};

export const O9_DETAIL_INDUSTRIE: O9DashBloc = {
  icon: Factory, title: "Industrie", count: 12,
  items: [
    { primary: "Revenus Manuf. QC", value: "218 G$", valueColor: "text-emerald-600", secondary: "+22.8% vs 2019 — ISQ 2024", phase: "retroaction" },
    { primary: "Emplois manufacturiers", value: "417K", valueColor: "text-amber-600", secondary: "-0.8% vs 2023 — STIQ 2025", phase: "retroaction" },
    { primary: "Adoption IA (PME)", value: "43%", valueColor: "text-blue-600", pct: 43, pctColor: "bg-blue-500", secondary: "+39 pts vs 2019 — STIQ/MEIE 2025", phase: "reflexion" },
    { primary: "Productivité QC", value: "65.90$/h", valueColor: "text-red-600", secondary: "-10.5% vs Ontario — ISQ 2024", phase: "attention" },
    { primary: "Adoption CAO/DAO", value: "61%", valueColor: "text-emerald-600", pct: 61, pctColor: "bg-emerald-500", secondary: "Taux le plus élevé — manufacturing QC", phase: "retroaction" },
    { primary: "Adoption ERP/MRP", value: "51%", valueColor: "text-amber-600", pct: 51, pctColor: "bg-amber-500", secondary: "Seulement 3% pleinement connecté", phase: "reflexion" },
    { primary: "Robotique/FMS/MES", value: "38%", valueColor: "text-blue-600", pct: 38, pctColor: "bg-blue-500", secondary: "Canada: ~200 robots / 10K employés", phase: "reflexion" },
    { primary: "ROI moyen techno", value: "1.60$", valueColor: "text-emerald-600", secondary: "Par dollar investi — Leaders: 2.40$", phase: "retroaction" },
    { primary: "Subventions actives", value: "12", valueColor: "text-green-600", secondary: "MEI, NRC-IRAP, CDPQ, BDC — Q2 2026", phase: "execution" },
    { primary: "Indice PME Manuf.", value: "67/100", valueColor: "text-blue-600", secondary: "Confiance entrepreneurs QC — STIQ", phase: "retroaction" },
    { primary: "Taux d'exportation", value: "48%", valueColor: "text-emerald-600", pct: 48, pctColor: "bg-emerald-500", secondary: "Marchés US 72%, Europe 18%, Asie 10%", phase: "retroaction" },
    { primary: "Pénurie main-d'œuvre", value: "18K", valueColor: "text-red-600", secondary: "Postes vacants manufacturier QC — Q1 2026", phase: "attention" },
  ],
};

// ═══ DETAIL BLOCS enrichis — pour drill-down sidebar (plus d'éléments + phases) ═══

export const O9_DETAIL_SIGNAUX: O9DashBloc = {
  icon: AlertTriangle, title: "Signaux & Alertes", count: 7,
  items: [
    { primary: "Trust warning — MetalPro", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Score confiance descendu à 62%", phase: "attention" },
    { primary: "Contrat cellule expire", value: "14 jours", valueColor: "text-orange-600", secondary: "Les Titans — renouvellement requis", phase: "attention" },
    { primary: "Mandataire en attente", value: "Action", valueColor: "text-blue-600", secondary: "3 leads qualifiés — décision requise", bot: "CEOB", phase: "reflexion" },
    { primary: "Membre inactif 30j+", value: "Relance", valueColor: "text-amber-600", secondary: "BâtiPro — aucune interaction depuis mars", phase: "attention" },
    { primary: "Score VITAA en baisse", value: "-8 pts", valueColor: "text-red-600", secondary: "Pilier Temps critique — surcharge Q1 détectée", phase: "reflexion" },
    { primary: "Opportunité non qualifiée", value: "Expire", valueColor: "text-orange-600", secondary: "LogiQC Transport — deadline 5 mai", phase: "execution" },
    { primary: "Doublon cellule détecté", value: "Vérifier", valueColor: "text-amber-600", secondary: "2 cellules avec mêmes secteurs — fusion suggérée", phase: "reflexion" },
  ],
};

export const O9_DETAIL_VEDETTE: O9DashBloc = {
  icon: Star, title: "Cellule vedette — Les Titans", count: 9,
  items: [
    { primary: "Performance globale", value: "92%", valueColor: "text-emerald-600", pct: 92, pctColor: "bg-emerald-500", secondary: "Meilleure cellule du mois — ROI +34%", phase: "retroaction" },
    { primary: "Membres actifs", value: "6/9", valueColor: "text-blue-600", secondary: "3 sous-cellules: Marketing, Ops, Stratégie", phase: "execution" },
    { primary: "Badge: Elite Q1 2026", value: "Or", valueColor: "text-amber-600", secondary: "Top 5% du réseau Brain Team", phase: "retroaction" },
    { primary: "Projets collaboratifs", value: "4", valueColor: "text-blue-600", secondary: "2 actifs, 1 en validation, 1 complété", phase: "execution" },
    { primary: "Économie mutualisation", value: "8.4K$", valueColor: "text-emerald-600", secondary: "Achats groupés + partage ressources ce trimestre", phase: "retroaction" },
    { primary: "Score confiance moyen", value: "4.2/5", valueColor: "text-amber-600", secondary: "Basé sur 12 interactions — tendance stable", phase: "retroaction" },
    { primary: "Prochain objectif", value: "9/9", valueColor: "text-blue-600", secondary: "Recruter 3 membres — secteurs complémentaires", phase: "creation" },
    { primary: "Trisociation planifiée", value: "Mai", valueColor: "text-violet-600", secondary: "Focus: expansion territoire Montérégie", phase: "reflexion" },
    { primary: "Contribution réseau", value: "3 posts", valueColor: "text-teal-600", secondary: "Ce mois — expertise soudure + retours terrain", phase: "creation" },
  ],
};

export const O9_DETAIL_MATCHES: O9DashBloc = {
  icon: Handshake, title: "Matches en cours", count: 7,
  items: [
    { primary: "Usine Bleue × MetalPro", value: "87%", valueColor: "text-emerald-600", pct: 87, pctColor: "bg-emerald-500", secondary: "Alliance stratégique — Qualification", bot: "CROB", phase: "execution" },
    { primary: "Usine Bleue × AutomatikPro", value: "82%", valueColor: "text-blue-600", pct: 82, pctColor: "bg-blue-500", secondary: "R&D partagée — Découverte", bot: "CTOB", phase: "reflexion" },
    { primary: "Usine Bleue × LogiQC", value: "76%", valueColor: "text-teal-600", pct: 76, pctColor: "bg-teal-500", secondary: "Mutualisation achats — Introduction", bot: "COOB", phase: "creation" },
    { primary: "Les Titans × AcierPlus", value: "79%", valueColor: "text-blue-600", pct: 79, pctColor: "bg-blue-500", secondary: "Sous-traitance — Pré-qualification", bot: "CEOB", phase: "reflexion" },
    { primary: "Cellule MTG × DistribQC", value: "71%", valueColor: "text-teal-600", pct: 71, pctColor: "bg-teal-500", secondary: "Vente conjointe — Découverte", bot: "CSOB", phase: "reflexion" },
    { primary: "Usine Bleue × PlastiQC", value: "68%", valueColor: "text-amber-600", pct: 68, pctColor: "bg-amber-500", secondary: "Alliance — En attente de validation", phase: "attention" },
    { primary: "FranchiseMax × TransQC", value: "73%", valueColor: "text-blue-600", pct: 73, pctColor: "bg-blue-500", secondary: "Mutualisation logistique — Introduction", bot: "COOB", phase: "creation" },
  ],
};

export const O9_DETAIL_PIONNIERS: O9DashBloc = {
  icon: Rocket, title: "Pionniers 9×9", count: 9,
  items: [
    { primary: "Manufacturier — Usine Bleue", value: "Confirmé", valueColor: "text-emerald-600", secondary: "Siège #1 — Carl Fugère, CEO", phase: "execution" },
    { primary: "Construction — BâtiPro", value: "Confirmé", valueColor: "text-emerald-600", secondary: "Siège #2 — membre actif depuis Q4 2025", phase: "execution" },
    { primary: "Immobilier — ImmoQC", value: "Prospect", valueColor: "text-amber-600", secondary: "En évaluation — score 71%", phase: "reflexion" },
    { primary: "Franchises — FranchiseMax", value: "Confirmé", valueColor: "text-emerald-600", secondary: "Siège #4 — 3 cellules actives", phase: "execution" },
    { primary: "Logistique — TransQC", value: "Prospect", valueColor: "text-amber-600", secondary: "En évaluation — score 74%", phase: "reflexion" },
    { primary: "Intégrateurs — AutomatikPro", value: "Confirmé", valueColor: "text-emerald-600", secondary: "Siège #6 — partenaire R&D", phase: "execution" },
    { primary: "Consultants", value: "Disponible", valueColor: "text-gray-500", secondary: "Recherche active — aucun candidat", phase: "creation" },
    { primary: "Distribution — DistribQC", value: "Confirmé", valueColor: "text-emerald-600", secondary: "Siège #8 — réseau de distribution QC", phase: "execution" },
    { primary: "Logiciels", value: "Disponible", valueColor: "text-gray-500", secondary: "Créneau ouvert — tarif pionnier 1350$/mois", phase: "creation" },
  ],
};

export const O9_DETAIL_ECONOMIE: O9DashBloc = {
  icon: DollarSign, title: "Économie réseau", count: 8,
  items: [
    { primary: "Rabais actif", value: "18%", valueColor: "text-emerald-600", secondary: "6 membres = palier 3 (15-20%)", phase: "execution" },
    { primary: "Économie ce mois", value: "3.2K$", valueColor: "text-emerald-600", secondary: "Mutualisation achats + tarifs préférentiels", phase: "retroaction" },
    { primary: "TimeTokens accumulés", value: "1,847 UT", valueColor: "text-blue-600", secondary: "Valeur estimée: 2.4K$ en services", phase: "retroaction" },
    { primary: "Revenus réseau YTD", value: "42K$", valueColor: "text-emerald-600", secondary: "+34% vs année précédente", phase: "retroaction" },
    { primary: "Prochain palier rabais", value: "7 memb.", valueColor: "text-blue-600", secondary: "1 membre de plus → palier 4 (20-25%)", phase: "reflexion" },
    { primary: "Transactions cellules", value: "23", valueColor: "text-teal-600", secondary: "Ce trimestre — valeur totale: 890K$", phase: "retroaction" },
    { primary: "Coûts évités (assurances)", value: "12K$", valueColor: "text-emerald-600", secondary: "Police groupe — 4 entreprises couvertes", phase: "execution" },
    { primary: "Crédit impôt R&D", value: "25K$", valueColor: "text-green-600", secondary: "Réclamation collaborative — Bot CFO", phase: "execution" },
  ],
};

export const O9_DETAIL_MANDATAIRE: O9DashBloc = {
  icon: Bot, title: "Mon Mandataire IA", count: 8,
  items: [
    { primary: "Mandats actifs", value: "3", valueColor: "text-green-600", secondary: "Veille marché, qualification leads, négo", phase: "execution" },
    { primary: "Dernière action: il y a 2h", secondary: "Analyse de 3 marchés nocturnes terminée", bot: "CEOB", phase: "execution" },
    { primary: "Pre-flight check prêt", value: "Action", valueColor: "text-blue-600", secondary: "MetalPro — contre-offre préparée", phase: "reflexion" },
    { primary: "Veille concurrentielle", value: "Auto", valueColor: "text-teal-600", secondary: "12 sources surveillées — 3 alertes ce mois", bot: "CSOB", phase: "execution" },
    { primary: "Rapport hebdo généré", value: "Prêt", valueColor: "text-emerald-600", secondary: "Résumé 47 actions — envoyé ce matin", phase: "retroaction" },
    { primary: "Négociation autonome #2", value: "En cours", valueColor: "text-amber-600", secondary: "AutomatikPro — offre de 120K$ soumise", bot: "CROB", phase: "execution" },
    { primary: "Qualification lead #7", value: "82%", valueColor: "text-blue-600", pct: 82, pctColor: "bg-blue-500", secondary: "PlastiQC — score VITAA prometteur", phase: "reflexion" },
    { primary: "Mandat complété: Audit ops", value: "Done", valueColor: "text-emerald-600", secondary: "Score efficacité: 78% — 4 recommandations livrées", bot: "COOB", phase: "retroaction" },
  ],
};

// ═══ INDUSTRIE ENRICHI — Données TRG (4 sous-sections originales intégrées) ═══

export interface TechAdoption {
  tech: string;
  rate: number;
  source: string;
}

export const O9_TECH_ADOPTION: TechAdoption[] = [
  { tech: "CAO/DAO", rate: 61, source: "STIQ 2025" },
  { tech: "ERP/MRP", rate: 51, source: "STIQ 2025" },
  { tech: "Infonuagique", rate: 49, source: "MEIE 2025" },
  { tech: "IA/ML", rate: 43, source: "STIQ/MEIE 2025" },
  { tech: "Robotique/FMS", rate: 38, source: "IFR 2024" },
  { tech: "Impression 3D", rate: 22, source: "STIQ 2025" },
];

export interface TopSector {
  secteur: string;
  poids: string;
}

export const O9_TOP_SECTORS: TopSector[] = [
  { secteur: "Transport / Aérospatiale", poids: "17.1%" },
  { secteur: "Produits métalliques", poids: "12.8%" },
  { secteur: "Aliments / Boissons", poids: "11.2%" },
  { secteur: "1ère transfo métaux", poids: "9.4%" },
  { secteur: "Machines / Équipements", poids: "8.7%" },
  { secteur: "Chimie / Pharmaceutique", poids: "7.2%" },
];

export interface IndustryOpportunity {
  sector: string;
  opportunity: string;
  impact: string;
  trend: string;
}

export const O9_INDUSTRY_OPPORTUNITIES: IndustryOpportunity[] = [
  { sector: "IA Générative & Prédictive", opportunity: "Contrôle qualité, maintenance prédictive", impact: "Critique", trend: "↑↑" },
  { sector: "ERP & Intégration", opportunity: "51% non-connecté — marché massif", impact: "Très élevé", trend: "↑↑" },
  { sector: "Cybersécurité OT", opportunity: "PME vulnérables, réglementaire à venir", impact: "Élevé", trend: "→↑" },
  { sector: "Robotique collaborative", opportunity: "200 robots/10K emp. — retard vs mondial", impact: "Très élevé", trend: "↑↑" },
  { sector: "Formation IA-Augmented", opportunity: "Pénurie 18K postes manufacturiers QC", impact: "Stratégique", trend: "↑" },
  { sector: "Transition énergétique", opportunity: "ISO 50001, crédits carbone, efficacité", impact: "Élevé", trend: "↑" },
];

export interface NouvelleDetail {
  title: string;
  source: string;
  date: string;
  category: string;
  imageUrl?: string;
  summary: string;
  paragraphs: string[];
  impact: string;
  actionSuggested: string;
}

export const O9_NOUVELLE_EXEMPLE: NouvelleDetail = {
  title: "Adoption IA en usine +47% au Québec",
  source: "STIQ / MEIE — Rapport Q1 2026",
  date: "22 avril 2026",
  category: "Tendance",
  imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=300&fit=crop",
  summary: "Le taux d'adoption de l'IA dans les PME manufacturières québécoises a bondi de 47%, passant de 29% à 43%.",
  paragraphs: [
    "Selon le dernier baromètre STIQ (16e édition), l'adoption de l'intelligence artificielle dans le secteur manufacturier québécois atteint désormais 43% des PME. Cette progression fulgurante (+39 points depuis 2019) place le Québec en tête au Canada.",
    "Les applications les plus courantes: contrôle qualité visuel (28%), maintenance prédictive (22%), optimisation de la chaîne d'approvisionnement (18%) et automatisation administrative (31%).",
    "Le programme MESI d'accompagnement, couplé aux crédits d'impôt RS&DE, a catalysé cette adoption. Les entreprises avec diagnostic VITAA montrent un taux 2.4× supérieur à la moyenne.",
  ],
  impact: "Opportunité majeure: positionnement comme facilitateur d'adoption IA pour les 57% de PME restantes.",
  actionSuggested: "Créer un playbook 'Première IA en usine' ciblant les PME non-adoptantes du réseau.",
};

// ═══ NOUVELLES — Liste complète pour la sous-section (look média/actualité) ═══

export interface O9NouvelleCard {
  id: string;
  title: string;
  source: string;
  date: string;
  category: string;
  categoryColor: string;
  imageUrl: string;
  summary: string;
  readTime: string;
}

export const O9_NOUVELLES_LISTE: O9NouvelleCard[] = [
  {
    id: "nv-1", title: "L'industrie allemande mise sur les robots humanoïdes et l'IA",
    source: "Euronews", date: "23 avril 2026", category: "Robotique", categoryColor: "bg-violet-600",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=220&fit=crop",
    summary: "Les robots humanoïdes industriels gagnent du terrain en Europe. L'Allemagne investit massivement dans des unités capables de travailler aux côtés des humains sur les lignes de production.",
    readTime: "4 min",
  },
  {
    id: "nv-2", title: "Robots mobiles autonomes (AMR): les nouveaux piliers de l'automatisation",
    source: "Rude Baguette", date: "18 mars 2026", category: "AMR", categoryColor: "bg-cyan-600",
    imageUrl: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=400&h=220&fit=crop",
    summary: "Les AMR transforment la logistique industrielle. Grâce à l'IA et aux capteurs avancés, ils naviguent seuls dans les entrepôts complexes et réduisent les coûts de manutention de 35%.",
    readTime: "5 min",
  },
  {
    id: "nv-3", title: "CES 2026: l'IA physique débarque dans l'industrie",
    source: "Machines Production", date: "12 janvier 2026", category: "IA Physique", categoryColor: "bg-emerald-600",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=220&fit=crop",
    summary: "L'intelligence artificielle n'est plus confinée aux serveurs — elle descend au cœur des machines pour agir concrètement sur la matière. NVIDIA et Siemens mènent la charge.",
    readTime: "6 min",
  },
  {
    id: "nv-4", title: "5 tendances marquantes pour la robotique industrielle en 2026",
    source: "Planète Robots", date: "8 janvier 2026", category: "Tendances", categoryColor: "bg-blue-600",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=220&fit=crop",
    summary: "Convergence IT/OT, cobots intelligents, jumeaux numériques, maintenance prédictive IA et robotique-as-a-service: les 5 forces qui redéfinissent l'usine de demain.",
    readTime: "7 min",
  },
  {
    id: "nv-5", title: "Marché mondial de l'automatisation: 233.6 milliards USD en 2026",
    source: "Novus / IFR", date: "15 février 2026", category: "Marché", categoryColor: "bg-amber-600",
    imageUrl: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=220&fit=crop",
    summary: "Le marché mondial de l'automatisation industrielle atteint un nouveau record, porté par l'IIoT, l'IA et les systèmes numériques intégrés. Le Canada représente 3% du marché global.",
    readTime: "3 min",
  },
  {
    id: "nv-6", title: "Adoption IA en usine +47% au Québec — Rapport STIQ Q1 2026",
    source: "STIQ / MEIE", date: "22 avril 2026", category: "Québec", categoryColor: "bg-red-600",
    imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=220&fit=crop",
    summary: "Le taux d'adoption de l'IA dans les PME manufacturières québécoises a bondi de 47%. Le Québec est maintenant en tête au Canada avec 43% d'adoption.",
    readTime: "4 min",
  },
];

// ═══ ÉVÉNEMENTS — Liste avec images et vrais événements industriels QC ═══

export interface O9EvenementCard {
  id: string;
  title: string;
  date: string;
  dateBadge: string;
  lieu: string;
  type: string;
  typeColor: string;
  imageUrl: string;
  description: string;
  inscrits?: number;
  places?: number;
}

export const O9_EVENEMENTS_LISTE: O9EvenementCard[] = [
  {
    id: "ev-1", title: "Salon Industriel du Centre-du-Québec (SIC)",
    date: "22-23 avril 2026", dateBadge: "22-23 avr", lieu: "Centrexpo Promutuel, Victoriaville",
    type: "Salon", typeColor: "bg-violet-100 text-violet-700",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=220&fit=crop",
    description: "300+ exposants, 2000+ visiteurs. IA, automatisation et productivité au cœur de cette édition. Entrée gratuite avec accès conférences.",
    inscrits: 2100, places: 3000,
  },
  {
    id: "ev-2", title: "MMTS — Technologies de fabrication de Montréal",
    date: "11-12 mai 2026", dateBadge: "11-12 mai", lieu: "Palais des Congrès, Montréal",
    type: "Salon", typeColor: "bg-blue-100 text-blue-700",
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf18c4b234?w=400&h=220&fit=crop",
    description: "Le plus grand salon de technologies de fabrication au Québec. Usinage, soudure, automatisation, métrologie et fabrication additive.",
    inscrits: 1800, places: 4000,
  },
  {
    id: "ev-3", title: "Trisociation Brain Team × AutomatikPro",
    date: "5 mai 2026", dateBadge: "5 mai", lieu: "LiveKit — Virtuel",
    type: "Réseau", typeColor: "bg-cyan-100 text-cyan-700",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=220&fit=crop",
    description: "Session trisociation: CarlOS + Rich (CRO) + Tim (CTO). Évaluation compatibilité R&D vision artificielle.",
    inscrits: 3, places: 3,
  },
  {
    id: "ev-4", title: "Webinaire: IA générative en production manufacturière",
    date: "15 mai 2026", dateBadge: "15 mai", lieu: "En ligne — Brain Team",
    type: "Formation", typeColor: "bg-emerald-100 text-emerald-700",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=220&fit=crop",
    description: "Comment l'IA générative économise 2.05h pour chaque 0.97h investie. Cas concrets de PME québécoises. Gratuit pour les membres.",
    inscrits: 47, places: 100,
  },
  {
    id: "ev-5", title: "Rassemblement Cercle Pionniers #1",
    date: "Q2 2026", dateBadge: "Q2 2026", lieu: "Montérégie — À confirmer",
    type: "Réseau", typeColor: "bg-amber-100 text-amber-700",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=220&fit=crop",
    description: "Premier rassemblement physique des 9 pionniers. Review métriques, partage de victoires, nouvelles opportunités de collaboration.",
    inscrits: 5, places: 9,
  },
  {
    id: "ev-6", title: "Advanced Manufacturing Montréal (ADM)",
    date: "11-12 novembre 2026", dateBadge: "11-12 nov", lieu: "Palais des Congrès, Montréal",
    type: "Salon", typeColor: "bg-violet-100 text-violet-700",
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=220&fit=crop",
    description: "5 secteurs réunis: automatisation, robotique, efficacité énergétique, emballage et plastiques. Le rendez-vous de la fabrication avancée.",
    inscrits: 0, places: 5000,
  },
];

// ═══ INDUSTRIE — Données additionnelles (TRG originale 5 tabs intégrés) ═══

export interface ObstacleAdoption {
  obstacle: string;
  pct: number;
  source: string;
}

export const O9_OBSTACLES_ADOPTION: ObstacleAdoption[] = [
  { obstacle: "Manque de connaissances sur l'IA", pct: 67, source: "STIQ 2025" },
  { obstacle: "Manque de personnel qualifié", pct: 66, source: "STIQ 2025" },
  { obstacle: "Manque de temps", pct: 66, source: "STIQ 2025" },
  { obstacle: "Difficulté à évaluer le ROI", pct: 53, source: "STIQ 2025" },
  { obstacle: "Manque de compétences numériques", pct: 51, source: "FCEI 2025" },
  { obstacle: "Coûts élevés", pct: 48, source: "FCEI 2025" },
];

export interface RoiStat {
  impact: string;
  pct: string;
  desc: string;
}

export const O9_ROI_STATS: RoiStat[] = [
  { impact: "Productivité augmentée", pct: "56%", desc: "des PME QC citent ce gain" },
  { impact: "Tâches répétitives réduites", pct: "56%", desc: "libération de temps" },
  { impact: "Coûts diminués", pct: "36%", desc: "économies opérationnelles" },
  { impact: "Qualité améliorée", pct: "30%", desc: "moins de rebuts" },
  { impact: "Rentabilité < 2 ans", pct: "55%", desc: "des PME canadiennes (FCEI)" },
];

export interface SolutionCost {
  type: string;
  materiel: string;
  total: string;
}

export const O9_COST_SOLUTIONS: SolutionCost[] = [
  { type: "Robot Collaboratif (Cobot)", materiel: "25-75K$", total: "124K$" },
  { type: "Robot Industriel 6 axes", materiel: "80-250K$", total: "403K$" },
  { type: "Robot Mobile AMR", materiel: "40-120K$", total: "183K$" },
  { type: "Système Vision IA", materiel: "15-60K$", total: "89K$" },
];

export interface RobotDensity {
  pays: string;
  densite: string;
  note: string;
}

export const O9_ROBOT_DENSITY: RobotDensity[] = [
  { pays: "Corée du Sud", densite: "1,012", note: "Leader mondial" },
  { pays: "Singapour", densite: "770", note: "2e mondial" },
  { pays: "Chine", densite: "470", note: "Doublement en 4 ans" },
  { pays: "Canada", densite: "~200", note: "3,800 installations 2024" },
];

export interface ReferenceStudy {
  title: string;
  source: string;
  year: string;
  type: string;
}

export const O9_REFERENCE_STUDIES: ReferenceStudy[] = [
  { title: "Baromètre industriel québécois 16e éd.", source: "STIQ", year: "2025", type: "Baromètre" },
  { title: "Enquête numérique manufacturier QC", source: "MEIE", year: "2025", type: "Enquête" },
  { title: "Rapport annuel d'activités", source: "Investissement QC", year: "2025", type: "Rapport" },
  { title: "World Robotics Report", source: "IFR", year: "2025", type: "Rapport" },
  { title: "Transformation numérique PME canadiennes", source: "FCEI", year: "2025", type: "Étude" },
  { title: "Adoption IA au Québec", source: "ISQ / StatCan", year: "2025", type: "Portrait" },
  { title: "Impact IA sur les entreprises QC", source: "Aviseo / CPQ", year: "2024", type: "Étude" },
  { title: "Rapport écosystème tech Québec", source: "Québec Tech", year: "2025", type: "Rapport" },
];

export const O9_FEED_OVERVIEW: O9DashBloc = O9_DASH_ROW2[0];

// ═══ Grid overview — Boxes "hot" (1 résumé par sous-section) ═══

export const O9_GRID_BLOCS: O9DashBloc[] = [
  O9_DASH_ROW1[1], O9_DASH_ROW1[2],       // Cellule vedette, Matches
  O9_DASH_ROW2[1], O9_INDUSTRIE_BOX,      // Nouvelles industrie, Industrie
  O9_DASH_ROW2[2], O9_DASH_ROW3[0],       // Événements, Pionniers
  O9_DASH_ROW3[1], O9_DASH_ROW3[2],       // Économie, Mandataire
];

export const O9_GRID_IDS: string[] = [
  "vedette", "matches", "nouvelles", "industrie", "evenements", "pionniers", "economie", "mandataire",
];

// ═══ Section mapping — Sidebar id → Bloc détaillé (enrichi) ═══

export const O9_SECTION_BLOCS: Record<string, O9DashBloc> = {
  signaux:    O9_DETAIL_SIGNAUX,
  vedette:    O9_DETAIL_VEDETTE,
  matches:    O9_DETAIL_MATCHES,
  feed:       O9_DETAIL_FEED,
  nouvelles:  O9_DETAIL_NOUVELLES,
  industrie:  O9_DETAIL_INDUSTRIE,
  benchmark:  O9_DETAIL_BENCHMARK,
  evenements: O9_DETAIL_EVENTS,
  pionniers:  O9_DETAIL_PIONNIERS,
  economie:   O9_DETAIL_ECONOMIE,
  mandataire: O9_DETAIL_MANDATAIRE,
};

// ═══ MOCK DATA — Sidebar Dashboard (switch content) ═══

export const O9_DASH_SIDEBAR: ({ id: string; label: string; icon: React.ElementType } | null)[] = [
  { id: "kpis", label: "Vue d'ensemble", icon: Home },
  { id: "signaux", label: "Signaux & Alertes", icon: AlertTriangle },
  { id: "feed", label: "Fil d'activité", icon: Newspaper },
  { id: "vedette", label: "Cellule vedette", icon: Star },
  { id: "matches", label: "Matches en cours", icon: Handshake },
  null,
  { id: "nouvelles", label: "Nouvelles industrie", icon: Globe },
  { id: "industrie", label: "Industrie", icon: Factory },
  { id: "evenements", label: "Événements", icon: Calendar },
  { id: "pionniers", label: "Pionniers", icon: Rocket },
  { id: "economie", label: "Économie réseau", icon: DollarSign },
  { id: "mandataire", label: "Mon Mandataire", icon: Bot },
];

// ═══ MOCK DATA — Opportunités vedettes ═══

export const O9_OPPORTUNITIES_VEDETTES: OpportunityData[] = [
  {
    id: "opp-001", entreprise: "MetalPro Industries", secteur: "Usinage / Métal", region: "Montérégie",
    type: "alliance-strategique", score: 87, trustScore: 4.2, trustTier: "or",
    description: "Complémentarité forte en automatisation industrielle. MetalPro apporte expertise soudure spécialisée.",
    apport: "Automatisation, 45 employés, ISO 9001", apportPartenaire: "Soudure spécialisée, 12 soudeurs certifiés CWB",
    stage: "qualification", botAssigne: "CROB", dateDetection: "il y a 3 jours", pilierVitaa: "Vente + Actif", isVedette: true,
  },
  {
    id: "opp-002", entreprise: "AutomatikPro", secteur: "Automatisation", region: "Laval",
    type: "rd-partagee", score: 82, trustScore: 3.8, trustTier: "argent",
    description: "R&D partagée en vision artificielle pour contrôle qualité automatisé.",
    apport: "Infrastructure IA, données d'entraînement, expertise ML", apportPartenaire: "Caméras industrielles, intégration ligne de production",
    stage: "decouverte", botAssigne: "CTOB", dateDetection: "il y a 5 jours", pilierVitaa: "Idée + Temps", isVedette: true,
  },
  {
    id: "opp-003", entreprise: "LogiQC Transport", secteur: "Logistique", region: "Québec",
    type: "mutualisation-achats", score: 76, trustScore: 3.5, trustTier: "argent",
    description: "Mutualisation des achats de matières premières pour réduire les coûts.",
    apport: "Volume d'achat aluminium, réseau fournisseurs", apportPartenaire: "Volume d'achat acier, entrepôt Québec",
    stage: "introduction", botAssigne: "COOB", dateDetection: "il y a 1 semaine", pilierVitaa: "Argent + Actif", isVedette: true,
  },
];

// ═══ MOCK DATA — Pionniers (grille 3×3) ═══

export const O9_PIONNIERS: PionnierSector[] = [
  { id: "p1", label: "Manufacturier", status: "pris", entreprise: "Usine Bleue" },
  { id: "p2", label: "Construction", status: "pris", entreprise: "BâtiPro" },
  { id: "p3", label: "Immobilier", status: "prospect", entreprise: "ImmoQC (en éval.)" },
  { id: "p4", label: "Franchises", status: "pris", entreprise: "FranchiseMax" },
  { id: "p5", label: "Logistique", status: "prospect", entreprise: "TransQC (en éval.)" },
  { id: "p6", label: "Intégrateurs", status: "pris", entreprise: "AutomatikPro" },
  { id: "p7", label: "Consultants", status: "disponible" },
  { id: "p8", label: "Distribution", status: "pris", entreprise: "DistribQC" },
  { id: "p9", label: "Logiciels", status: "disponible" },
];

// ═══ MOCK DATA — Feed items ═══

export const O9_FEED_ITEMS: FeedItem[] = [
  { id: "f1", type: "win", author: "Les Titans", authorAvatar: "/agents/carl-fugere.jpg", content: "Contrat de 500K$ gagné grâce à la collaboration cellule!", timestamp: "il y a 2h", reactions: 24, comments: 8 },
  { id: "f2", type: "bot-action", author: "CarlOS", authorAvatar: "/agents/generated/ceo-carlos-profil-v3.png", content: "Auto-Scout a détecté 3 nouvelles complémentarités dans le réseau.", timestamp: "il y a 4h", reactions: 5, comments: 1 },
  { id: "f3", type: "trisociation", author: "Rich (CRO)", authorAvatar: "/agents/generated/cro-raphael-profil-v3.png", content: "Trisociation Usine Bleue × AutomatikPro terminée. Résumé IA disponible.", timestamp: "il y a 6h", reactions: 12, comments: 4 },
  { id: "f4", type: "match", author: "Réseau", authorAvatar: "/agents/generated/ceo-carlos-profil-v3.png", content: "Nouveau membre: AcierPlus (Usinage, Montérégie) rejoint le réseau.", timestamp: "hier", reactions: 18, comments: 6 },
  { id: "f5", type: "publication", author: "Inès (CINO)", authorAvatar: "/agents/generated/cino-ines-profil-v3.png", content: "Veille IA: L'adoption de l'IA en usine a augmenté de 47% au Québec.", timestamp: "hier", reactions: 32, comments: 11 },
];

// ═══ COULEURS ORBIT9 ═══

export const O9_GRADIENT = "from-cyan-600 to-blue-500";
export const O9_TEXT = "text-cyan-600";
export const O9_BG_LIGHT = "bg-cyan-50";
export const O9_BORDER = "border-cyan-200";

// ═══ STAGE LABELS (pipeline opportunités) ═══

export const OPPORTUNITY_STAGE_CONFIG: Record<OpportunityStage, { label: string; icon: React.ElementType; color: string }> = {
  decouverte:     { label: "Découverte",     icon: Globe,      color: "text-blue-600" },
  qualification:  { label: "Qualification",  icon: Zap,        color: "text-amber-600" },
  introduction:   { label: "Introduction",   icon: Handshake,  color: "text-teal-600" },
  collaboration:  { label: "Collaboration",  icon: Users,      color: "text-emerald-600" },
  integration:    { label: "Intégration",    icon: Atom,       color: "text-violet-600" },
};

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  "alliance-strategique": "Alliance stratégique",
  "vente-conjointe": "Vente conjointe",
  "mutualisation-achats": "Mutualisation achats",
  "rd-partagee": "R&D partagée",
  "sous-traitance": "Sous-traitance",
  "validation-requise": "Validation requise",
};

// ═══ TRUST TIERS ═══

export const TRUST_TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  or:      { label: "Or",      color: "text-amber-700",   bg: "bg-amber-100" },
  argent:  { label: "Argent",  color: "text-gray-600",    bg: "bg-gray-100" },
  bronze:  { label: "Bronze",  color: "text-orange-700",  bg: "bg-orange-100" },
};
