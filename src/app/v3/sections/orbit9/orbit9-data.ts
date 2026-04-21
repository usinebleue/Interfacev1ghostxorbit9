/**
 * orbit9-data.ts — Types, constantes et mock data pour Orbit9 V3
 *
 * Pattern: Record<string, Config> — comme TOUTES les sections V3
 * Source: PLAN-ORBIT9-V3-COMPLET-S91.md
 *
 * Utilisé par: Orbit9View, Orbit9Dashboard, Orbit9Blueprint, Orbit9Opportunites
 */

import {
  Home, BookOpen, Atom, Handshake, Shield, Rocket, Activity,
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
  feed: "Nouvelles",
  evenements: "Événements",
  "creer-cellule": "Créer une cellule",
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
    icon: AlertTriangle, title: "Signaux & Alertes", count: 4,
    items: [
      { primary: "Trust warning — MetalPro", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Score confiance descendu à 62%", phase: "attention" },
      { primary: "Contrat cellule expire", value: "14 jours", valueColor: "text-orange-600", secondary: "Les Titans — renouvellement requis" },
      { primary: "Mandataire en attente", value: "Action", valueColor: "text-blue-600", secondary: "3 leads qualifiés — décision requise", bot: "CEOB" },
      { primary: "Match à traiter", value: "Nouveau", valueColor: "text-green-600", secondary: "AutomatikPro — score 89%", phase: "observation" },
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
    icon: Factory, title: "Intelligence industrie", count: 3,
    items: [
      { primary: "Adoption IA en usine +47%", value: "Tendance", valueColor: "text-emerald-600", secondary: "Manufacturiers QC — rapport MESI Q1 2026" },
      { primary: "Productivité secteur +12%", value: "Benchmark", valueColor: "text-blue-600", secondary: "Moyenne réseau Brain Team vs industrie" },
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

// ═══ MOCK DATA — Sidebar Dashboard (scroll-to anchors) ═══

export const O9_DASH_SIDEBAR: ({ id: string; label: string; icon: React.ElementType } | null)[] = [
  { id: "kpis", label: "Tableau de bord", icon: Home },
  { id: "signaux", label: "Signaux & Alertes", icon: AlertTriangle },
  { id: "feed", label: "Fil d'activité", icon: Newspaper },
  { id: "vedette", label: "Cellule vedette", icon: Star },
  { id: "matches", label: "Matches en cours", icon: Handshake },
  null,
  { id: "industrie", label: "Intelligence industrie", icon: Factory },
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
