/**
 * section-types.ts — Types partages pour Strategique / Mon Bureau / Mon Reseau
 * Interfaces communes: Chantier, Projet, Mission, StrategiqueNav, etc.
 */

export type StrategiqueTabId = "overview" | "timeline" | "chantiers" | "projets" | "missions" | "taches" | "opportunites" | "equipes";

export type BureauTabId = "idees" | "documents" | "outils" | "taches" | "agenda";

export type ReseauTabId = "profil" | "cellules" | "jumelage" | "chantiers-reseau" | "pionniers" | "gouvernance" | "dashboard";

export interface Mission {
  label: string;
  bot: string;
  type?: "interne" | "externe" | "ouverte";
  sousTaches?: string[];
  missionLiee?: string;
}

export interface Projet {
  id: string;
  label: string;
  desc: string;
  status: "done" | "en-cours" | "a-faire" | "bloque";
  bot: string;
  missions: string[];
  bloque_par?: string;
}

export interface Chantier {
  id: string;
  num: number;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  chaleur: "brule" | "couve" | "meurt";
  type: string;
  responsable: string;
  bots: string[];
  projets: Projet[];
  dependances?: string[];
  objectif: string;
  timing: string;
}

/** Navigation context shared across all Strategique tabs */
export interface StrategiqueNav {
  tab: StrategiqueTabId;
  chantierId: string | null;
  projetId: string | null;
  missionIdx: number | null;
  goTo: (tab: StrategiqueTabId, chantierId?: string | null, projetId?: string | null, missionIdx?: number | null) => void;
}

export interface PlaybookTemplate {
  id: string;
  titre: string;
  description: string;
  type: "strategique" | "technologique" | "organisationnel" | "operationnel";
  industrie: string | null;
  bots: string[];
  nb_projets: number;
  nb_missions: number;
  duree: string;
  populaire?: boolean;
  niveau: "chantier" | "projet" | "mission" | "tache";
}

export interface ParsedMission {
  botCode: string;
  text: string;
  isHumain: boolean;
  isExterne: boolean;
  role: "master" | "humain-ceo" | "humain-pm" | "bot" | "externe";
  raw: string;
}

/** Generic tab definition */
export interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
}

/** KPI card config */
export interface KPIConfig {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ElementType;
  onClick?: () => void;
}

/** Breadcrumb item */
export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  color?: string;
}
