/**
 * orbit9-data.ts — Tabs navigation, labels et re-exports pour Orbit9 V3
 *
 * Pattern: Record<string, Config> — comme TOUTES les sections V3
 * Source: PLAN-ORBIT9-V3-COMPLET-S91.md
 *
 * Mock data centralisé dans: ../../data/mock/orbit9.mock.ts
 * Ce fichier garde les constantes de NAVIGATION + re-exporte les types/mock pour backward compat.
 *
 * Utilisé par: Orbit9View, Orbit9Dashboard, Orbit9Blueprint, Orbit9Opportunites
 */

import {
  Home, BookOpen, Handshake,
} from "lucide-react";
import type { Orbit9Section } from "../../core/types";

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

// ═══════════════════════════════════════════════════════════════════════
// RE-EXPORTS — Backward compatibility (mock data + types from centralized mock file)
// ═══════════════════════════════════════════════════════════════════════

export {
  // Types
  type O9KPI,
  type OpportunityType,
  type OpportunityStage,
  type OpportunityData,
  type VitaaScore,
  type CelluleMember,
  type CelluleType,
  type CelluleData,
  type FeedItemType,
  type FeedItem,
  type PionnierStatus,
  type PionnierSector,
  type TechAdoption,
  type TopSector,
  type IndustryOpportunity,
  type NouvelleDetail,
  type O9NouvelleCard,
  type O9EvenementCard,
  type ObstacleAdoption,
  type RoiStat,
  type SolutionCost,
  type RobotDensity,
  type ReferenceStudy,
  // Mock data constants
  O9_DASHBOARD_KPIS,
  O9_DASH_ROW1,
  O9_DASH_ROW2,
  O9_DASH_ROW3,
  O9_BENCHMARK_BOX,
  O9_DETAIL_FEED,
  O9_DETAIL_NOUVELLES,
  O9_DETAIL_BENCHMARK,
  O9_DETAIL_EVENTS,
  O9_INDUSTRIE_BOX,
  O9_DETAIL_INDUSTRIE,
  O9_DETAIL_SIGNAUX,
  O9_DETAIL_VEDETTE,
  O9_DETAIL_MATCHES,
  O9_DETAIL_PIONNIERS,
  O9_DETAIL_ECONOMIE,
  O9_DETAIL_MANDATAIRE,
  O9_TECH_ADOPTION,
  O9_TOP_SECTORS,
  O9_INDUSTRY_OPPORTUNITIES,
  O9_NOUVELLE_EXEMPLE,
  O9_NOUVELLES_LISTE,
  O9_EVENEMENTS_LISTE,
  O9_OBSTACLES_ADOPTION,
  O9_ROI_STATS,
  O9_COST_SOLUTIONS,
  O9_ROBOT_DENSITY,
  O9_REFERENCE_STUDIES,
  O9_FEED_OVERVIEW,
  O9_GRID_BLOCS,
  O9_GRID_IDS,
  O9_SECTION_BLOCS,
  O9_DASH_SIDEBAR,
  O9_OPPORTUNITIES_VEDETTES,
  O9_PIONNIERS,
  O9_FEED_ITEMS,
  O9_GRADIENT,
  O9_TEXT,
  O9_BG_LIGHT,
  O9_BORDER,
  OPPORTUNITY_STAGE_CONFIG,
  OPPORTUNITY_TYPE_LABEL,
  TRUST_TIER_CONFIG,
} from "../../data/mock/orbit9.mock";
