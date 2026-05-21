/**
 * DataRoomView.tsx — Documents & Fichiers (pattern SectionView)
 *
 * Extrait de BlueprintDepartement.tsx L3773-5205
 * Utilisé par: WorkspacePhasesPanel (section "dataroom")
 */

import { useState, useEffect, useMemo } from "react";
import { useAmorcer } from "../AmorcerContext";
import { api } from "../../v2/api/client";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import {
  Activity, ArrowDown, ArrowUp, ArrowUpDown, BarChart3, BookOpen, Briefcase, Bug, Building2, Calendar,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock, Cpu, Database, DollarSign,
  Download, Eye, FileText, Filter, FolderOpen, Gavel, Headphones, Info, Layers, LayoutGrid, LayoutList,
  ListChecks, Lock, MessageSquare, Package, Palette, PenLine, Plus, Rocket, Scale, Search, Settings,
  Shield, ShoppingBag, Sparkles, Table2, Target, TrendingUp, Upload, User, UserPlus, Users, Zap,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { BLUEPRINT_TEMPLATES, getTemplatesForBot, type BlueprintTemplate } from "../../v2/zones/center/blueprint/blueprint-templates";
import { LivingHero } from "./shared/LivingHero";
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON, DEPT_LABELS, OTHER_BOTS } from "./shared/dept-data";
import { SF } from "../core/styles";

type DocumentLifecycleStage =
  | "creation" | "coauthoring" | "cross_review" | "approbation"
  | "publie_indexe" | "consommation" | "versioning" | "depreciation" | "reactivation";

type AssetType = "Document" | "Dashboard" | "Flow" | "Dataset" | "Media" | "Procedure";

const ASSET_TYPE_CONFIG: Record<AssetType, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Document:  { color: "text-blue-700",   bg: "bg-blue-50",    icon: FileText,   label: "Document" },
  Dashboard: { color: "text-violet-700", bg: "bg-violet-50",  icon: BarChart3,  label: "Dashboard" },
  Flow:      { color: "text-orange-700", bg: "bg-orange-50",  icon: Zap,        label: "Flow" },
  Dataset:   { color: "text-emerald-700",bg: "bg-emerald-50", icon: Database,    label: "Dataset" },
  Media:     { color: "text-pink-700",   bg: "bg-pink-50",    icon: Palette,     label: "Média" },
  Procedure: { color: "text-teal-700",   bg: "bg-teal-50",    icon: ListChecks,  label: "Procédure" },
};

function AssetTypeBadge({ type }: { type: AssetType }) {
  const config = ASSET_TYPE_CONFIG[type] || ASSET_TYPE_CONFIG.Document;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium", config.bg, config.color)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

const LIFECYCLE_LABELS: Record<DocumentLifecycleStage, { label: string; color: string }> = {
  creation:     { label: "Création",     color: "text-gray-500" },
  coauthoring:  { label: "Co-rédaction", color: "text-blue-600" },
  cross_review: { label: "Révision",     color: "text-amber-600" },
  approbation:  { label: "Approbation",  color: "text-orange-600" },
  publie_indexe:{ label: "Publié",       color: "text-emerald-600" },
  consommation: { label: "En usage",     color: "text-emerald-700" },
  versioning:   { label: "Versionné",    color: "text-blue-700" },
  depreciation: { label: "Déprécié",     color: "text-red-500" },
  reactivation: { label: "Réactivé",     color: "text-purple-600" },
};

interface DataRoomDoc {
  titre: string;
  type: AssetType;
  sections: number;
  frequence: string;
  createur: string;
  statut: "actif" | "brouillon" | "a_creer";
  critique: boolean;
  lifecycle?: DocumentLifecycleStage;
}

interface DataRoomCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  volume: string;
  documents: DataRoomDoc[];
}

// Sections transversales
const TRANSVERSAL_SECTIONS = [
  { id: "clients",       label: "Dossiers Clients",       icon: Users },
  { id: "employes",      label: "Dossiers Employés",      icon: User },
  { id: "fournisseurs",  label: "Dossiers Fournisseurs",  icon: Package },
] as const;

// Nomenclature REAI — Structure par chantier
const REAI_FOLDERS = [
  { id: "admin",        num: "0",  label: "Admin",              icon: Briefcase, desc: "Ententes, NDA, comptes-rendus, horodateur" },
  { id: "intrants",     num: "10", label: "Intrants",           icon: Upload,    desc: "Photos, vidéos, mesures, docs reçus" },
  { id: "design",       num: "20", label: "Design/Calculs/Simul", icon: PenLine, desc: "Dessins 2D/3D, cahier des charges, VSM" },
  { id: "fournisseurs", num: "30", label: "Fournisseurs",       icon: ShoppingBag, desc: "Vidéos fournisseurs, soumissions" },
  { id: "livrables",    num: "40", label: "Livrables",          icon: FileText,  desc: "Rapports finaux, documentation livrée" },
] as const;

// Documents par département (bibliothèque)
// ══════════════════════════════════════════

const DATA_ROOM_SECTIONS: Record<string, DataRoomCategory[]> = {
  CEOB: [
    { id: "plans_strategiques", label: "Plans strategiques", icon: Target, volume: "~15 docs/an", documents: [
      { titre: "Plan strategique annuel 2024-2027", type: "Document", sections: 12, frequence: "Annuel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "OKRs annuels et trimestriels", type: "Document", sections: 8, frequence: "Trimestriel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Blueprint d'entreprise (plan vivant)", type: "Document", sections: 16, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Declaration de vision et mission", type: "Document", sections: 4, frequence: "Annuel", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Roadmap produit 18 mois", type: "Document", sections: 6, frequence: "Semestriel", createur: "Tim", statut: "brouillon", critique: false },
      { titre: "Communications internes (memos)", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Notes de reflexion CEO", type: "Document", sections: 1, frequence: "Ad hoc", createur: "CarlOS", statut: "actif", critique: false },
    ]},
    { id: "gouvernance", label: "Gouvernance corporative", icon: Building2, volume: "~20 docs/an", documents: [
      { titre: "Proces-verbaux de CA", type: "Document", sections: 8, frequence: "Mensuel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Charte de gouvernance", type: "Document", sections: 10, frequence: "Annuel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Registre des decisions (D-001 a D-109)", type: "Dataset", sections: 1, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Resolutions du CA", type: "Document", sections: 4, frequence: "Mensuel", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Politique de delegation d'autorite", type: "Document", sections: 5, frequence: "Annuel", createur: "CarlOS", statut: "a_creer", critique: false },
      { titre: "Ordres du jour CA", type: "Document", sections: 3, frequence: "Mensuel", createur: "CarlOS", statut: "actif", critique: false },
    ]},
    { id: "rapports_direction", label: "Tableaux de bord et rapports", icon: BarChart3, volume: "~30 docs/an", documents: [
      { titre: "Dashboard executif VITAAFAST", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Rapport trimestriel CEO aux actionnaires", type: "Document", sections: 6, frequence: "Trimestriel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Dashboard KPI direction (12 departements)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "CarlOS", statut: "brouillon", critique: false },
      { titre: "Mises a jour OKRs mensuelles", type: "Document", sections: 4, frequence: "Mensuel", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Rapport de sante organisationnelle", type: "Document", sections: 8, frequence: "Trimestriel", createur: "CarlOS", statut: "a_creer", critique: false },
    ]},
    { id: "decisions_approbations", label: "Decisions & Approbations", icon: CheckCircle2, volume: "~60 docs/an", documents: [
      { titre: "Registre des approbations (depassements budget)", type: "Dataset", sections: 1, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Ordres du jour comite de direction", type: "Document", sections: 4, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Comptes rendus de comite executif", type: "Document", sections: 6, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Matrice de delegation d'autorite", type: "Document", sections: 5, frequence: "Annuel", createur: "CarlOS", statut: "brouillon", critique: true },
      { titre: "Suivi des actions decidees (tracker)", type: "Dashboard", sections: 1, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: false },
    ]},
    { id: "relations_investisseurs", label: "Relations investisseurs & CA", icon: Briefcase, volume: "~10 docs/an", documents: [
      { titre: "Pitch deck investisseurs (version courante)", type: "Media", sections: 15, frequence: "Semestriel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Term sheets et lettres d'intention", type: "Document", sections: 4, frequence: "Par levee", createur: "Loulou", statut: "a_creer", critique: true },
      { titre: "Rapports trimestriels aux investisseurs", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Frank", statut: "a_creer", critique: false },
      { titre: "Valorisation entreprise (derniere)", type: "Document", sections: 8, frequence: "Annuel", createur: "Frank", statut: "a_creer", critique: true },
    ]},
    { id: "communications_internes", label: "Communications internes", icon: MessageSquare, volume: "~100 docs/an", documents: [
      { titre: "Memos du CEO (communications internes)", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Newsletter interne mensuelle", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "brouillon", critique: false },
      { titre: "Discours et allocutions CEO", type: "Document", sections: 3, frequence: "Ad hoc", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "FAQ employes (questions recurrentes)", type: "Document", sections: 8, frequence: "Continu", createur: "Helene", statut: "a_creer", critique: false },
    ]},
  ],
  CROB: [
    { id: "propositions_ventes", label: "Propositions commerciales", icon: FileText, volume: "~150 docs/an", documents: [
      { titre: "Devis et soumissions clients", type: "Document", sections: 8, frequence: "Quotidien", createur: "Rich", statut: "actif", critique: true },
      { titre: "Grille tarifaire 2026", type: "Document", sections: 4, frequence: "Annuel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Pitch decks par segment", type: "Media", sections: 6, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Scripts de vente et objections", type: "Procedure", sections: 5, frequence: "Mensuel", createur: "Rich", statut: "brouillon", critique: false },
      { titre: "Temoignages clients et etudes de cas", type: "Document", sections: 4, frequence: "Mensuel", createur: "Rich", statut: "actif", critique: false },
    ]},
    { id: "contrats_clients", label: "Contrats clients", icon: Shield, volume: "~80 docs/an", documents: [
      { titre: "Contrats clients signes (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Rich", statut: "actif", critique: true },
      { titre: "MSA (Master Service Agreement)", type: "Document", sections: 12, frequence: "Par client", createur: "Loulou", statut: "actif", critique: true },
      { titre: "SOW (Statement of Work)", type: "Document", sections: 8, frequence: "Par projet", createur: "Rich", statut: "actif", critique: true },
      { titre: "NDA standard bilingue", type: "Document", sections: 4, frequence: "Par client", createur: "Loulou", statut: "actif", critique: false },
    ]},
    { id: "pipeline_forecasts", label: "Pipeline et previsions", icon: TrendingUp, volume: "~50 docs/an", documents: [
      { titre: "Previsions de ventes trimestrielles", type: "Dashboard", sections: 1, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: true },
      { titre: "Pipeline CRM temps reel", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Analyse win/loss par segment", type: "Document", sections: 6, frequence: "Mensuel", createur: "Rich", statut: "brouillon", critique: false },
      { titre: "Rapport conversion par source", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Rich", statut: "a_creer", critique: false },
      { titre: "Suivi des leads qualifies", type: "Dataset", sections: 1, frequence: "Continu", createur: "Rich", statut: "actif", critique: false },
    ]},
    { id: "performance_ventes", label: "Performance equipe ventes", icon: Activity, volume: "~50 docs/an", documents: [
      { titre: "Leaderboard representants (classement)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Plan de compensation et commissions", type: "Document", sections: 6, frequence: "Annuel", createur: "Rich", statut: "actif", critique: true },
      { titre: "Quotas par territoire et segment", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Rapports coaching individuel (1:1)", type: "Document", sections: 3, frequence: "Mensuel", createur: "Rich", statut: "brouillon", critique: false },
    ]},
    { id: "scripts_formation", label: "Scripts & formation ventes", icon: BookOpen, volume: "~20 docs/an", documents: [
      { titre: "Scripts appels a froid (cold call)", type: "Procedure", sections: 4, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Playbook de vente consultative", type: "Procedure", sections: 8, frequence: "Semestriel", createur: "Rich", statut: "brouillon", critique: true },
      { titre: "FAQ objections clients (rebuttals)", type: "Document", sections: 6, frequence: "Mensuel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Programme onboarding nouveaux reps", type: "Procedure", sections: 10, frequence: "Par embauche", createur: "Helene", statut: "a_creer", critique: false },
    ]},
    { id: "partenaires_canaux", label: "Partenaires & canaux", icon: Users, volume: "~15 docs/an", documents: [
      { titre: "Ententes revendeurs et distributeurs", type: "Document", sections: 6, frequence: "Par partenaire", createur: "Rich", statut: "a_creer", critique: true },
      { titre: "Programme d'affiliation B2B", type: "Document", sections: 5, frequence: "Annuel", createur: "Rich", statut: "a_creer", critique: false },
      { titre: "Suivi performance canaux indirects", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Rich", statut: "a_creer", critique: false },
    ]},
  ],
  CFOB: [
    { id: "etats_financiers", label: "Etats financiers", icon: DollarSign, volume: "~100 docs/an", documents: [
      { titre: "Etats des flux de tresorerie", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Bilans annuels certifies", type: "Document", sections: 8, frequence: "Annuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Etats des resultats mensuels", type: "Document", sections: 6, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Conciliations bancaires", type: "Document", sections: 2, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "budgets_previsions", label: "Budgets et allocations", icon: BarChart3, volume: "~40 docs/an", documents: [
      { titre: "Budgets globaux annuels", type: "Document", sections: 10, frequence: "Annuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Budgets departementaux detailles", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Scenarios pessimiste/realiste/optimiste", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Frank", statut: "brouillon", critique: false },
      { titre: "Notes de frais et depenses", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "fiscalite_audit", label: "Fiscalite et audits", icon: Shield, volume: "~20 docs/an", documents: [
      { titre: "Rapports d'audit annuels", type: "Document", sections: 8, frequence: "Annuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Declarations fiscales (TPS/TVQ, T2)", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Acomptes provisionnels et calculs", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Rapports TPS/TVQ mensuels", type: "Document", sections: 3, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "comptes_clients_ar", label: "Comptes clients (AR)", icon: TrendingUp, volume: "~200 docs/an", documents: [
      { titre: "Registre factures clients (aging)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Sequences de relance automatisees", type: "Procedure", sections: 4, frequence: "Continu", createur: "Frank", statut: "actif", critique: false },
      { titre: "Rapports encaissements mensuels", type: "Document", sections: 3, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Politique de credit et conditions paiement", type: "Document", sections: 5, frequence: "Annuel", createur: "Frank", statut: "brouillon", critique: true },
    ]},
    { id: "comptes_fournisseurs_ap", label: "Comptes fournisseurs (AP)", icon: Settings, volume: "~300 docs/an", documents: [
      { titre: "Bons de commande (PO) actifs", type: "Dataset", sections: 1, frequence: "Continu", createur: "Frank", statut: "actif", critique: false },
      { titre: "Workflow approbation depenses", type: "Procedure", sections: 5, frequence: "Continu", createur: "Frank", statut: "actif", critique: true },
      { titre: "Registre fournisseurs approuves", type: "Dataset", sections: 1, frequence: "Continu", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Rapports echeancier paiements", type: "Document", sections: 3, frequence: "Hebdomadaire", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "paie_remises", label: "Paie & remises gouvernementales", icon: DollarSign, volume: "~50 docs/an", documents: [
      { titre: "Registre de paie (tous employes)", type: "Dataset", sections: 1, frequence: "Bimensuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Remises DAS (ARC/Revenu Quebec)", type: "Document", sections: 4, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Feuillets T4/Releve 1 annuels", type: "Document", sections: 2, frequence: "Annuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Registre avantages sociaux", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "brouillon", critique: false },
    ]},
  ],
  CMOB: [
    { id: "plans_campagnes", label: "Plans et campagnes", icon: Rocket, volume: "~40 docs/an", documents: [
      { titre: "Brand guidelines et charte graphique", type: "Media", sections: 8, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Plan marketing annuel 2026", type: "Document", sections: 10, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Calendrier editorial et contenus", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Briefs creatifs par campagne", type: "Document", sections: 3, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Budget campagnes globales", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Mathilde", statut: "brouillon", critique: true },
    ]},
    { id: "analyses_personas", label: "Analyses et personas", icon: Search, volume: "~25 docs/an", documents: [
      { titre: "Etude de positionnement concurrentiel", type: "Document", sections: 8, frequence: "Semestriel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Personas ICP detailles", type: "Document", sections: 6, frequence: "Semestriel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Dashboard acquisition (ROAS, CPC)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Rapport ROI campagnes", type: "Document", sections: 6, frequence: "Mensuel", createur: "Mathilde", statut: "a_creer", critique: false },
      { titre: "Analyses concurrentielles rapides", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
    ]},
    { id: "contenu_social", label: "Contenu & medias sociaux", icon: MessageSquare, volume: "~200 docs/an", documents: [
      { titre: "Calendrier editorial (6 mois)", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Grille de programmation reseaux sociaux", type: "Dataset", sections: 1, frequence: "Hebdomadaire", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Banque de visuels et creations", type: "Media", sections: 1, frequence: "Continu", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Rapports engagement social mensuel", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Mathilde", statut: "brouillon", critique: false },
    ]},
    { id: "assets_marque", label: "Assets de marque", icon: Palette, volume: "~10 docs/an", documents: [
      { titre: "Charte graphique complete (logo, couleurs, typo)", type: "Media", sections: 8, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Gabarits presentations corporatives", type: "Media", sections: 4, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Kit media (communiques, photos officielles)", type: "Media", sections: 3, frequence: "Semestriel", createur: "Mathilde", statut: "brouillon", critique: false },
      { titre: "Guide de ton et voix de marque", type: "Document", sections: 6, frequence: "Annuel", createur: "Mathilde", statut: "a_creer", critique: true },
    ]},
    { id: "automatisation_mkt", label: "Automatisation marketing", icon: Zap, volume: "~30 docs/an", documents: [
      { titre: "Sequences email nurturing (par segment)", type: "Procedure", sections: 5, frequence: "Trimestriel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Workflows d'automation marketing", type: "Procedure", sections: 8, frequence: "Mensuel", createur: "Mathilde", statut: "brouillon", critique: false },
      { titre: "Dashboard inbound leads (MQL)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Mathilde", statut: "a_creer", critique: true },
      { titre: "Rapports performance email (open/click)", type: "Document", sections: 3, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
    ]},
  ],
  CSOB: [
    { id: "analyses_scenarios", label: "Analyses et scenarios", icon: Eye, volume: "~10 docs/an", documents: [
      { titre: "Business Model Canvas (BMC)", type: "Document", sections: 9, frequence: "Semestriel", createur: "Simone", statut: "actif", critique: true },
      { titre: "Plans d'expansion geographique", type: "Document", sections: 6, frequence: "Annuel", createur: "Simone", statut: "brouillon", critique: true },
      { titre: "Scenarios de crise macroeconomique", type: "Document", sections: 8, frequence: "Annuel", createur: "Simone", statut: "a_creer", critique: true },
      { titre: "Analyses SWOT approfondies", type: "Document", sections: 8, frequence: "Annuel", createur: "Simone", statut: "actif", critique: true },
      { titre: "Benchmarks concurrentiels", type: "Document", sections: 10, frequence: "Trimestriel", createur: "Simone", statut: "actif", critique: true },
    ]},
    { id: "veille_strat", label: "Veille et tendances", icon: Sparkles, volume: "~50 docs/an", documents: [
      { titre: "Notes de veille hebdomadaire", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "Simone", statut: "actif", critique: false },
      { titre: "Syntheses de tendances sectorielles", type: "Document", sections: 4, frequence: "Mensuel", createur: "Simone", statut: "actif", critique: false },
      { titre: "Mises a jour PESTEL", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Simone", statut: "a_creer", critique: false },
      { titre: "Memos strategiques ad-hoc", type: "Document", sections: 2, frequence: "Ad hoc", createur: "Simone", statut: "actif", critique: false },
      { titre: "Evaluations rapides d'opportunites", type: "Document", sections: 3, frequence: "Ad hoc", createur: "Simone", statut: "brouillon", critique: false },
    ]},
    { id: "ma_expansion", label: "M&A & expansion", icon: Rocket, volume: "~5 docs/an", documents: [
      { titre: "Cibles d'acquisition identifiees", type: "Dataset", sections: 1, frequence: "Continu", createur: "Simone", statut: "a_creer", critique: true },
      { titre: "Due diligence (checklists)", type: "Document", sections: 12, frequence: "Par cible", createur: "Simone", statut: "a_creer", critique: true },
      { titre: "Plans d'integration post-fusion", type: "Document", sections: 10, frequence: "Par acquisition", createur: "Simone", statut: "a_creer", critique: false },
      { titre: "Etudes de marche par territoire", type: "Document", sections: 8, frequence: "Par territoire", createur: "Simone", statut: "brouillon", critique: false },
    ]},
    { id: "partenariats_strat", label: "Partenariats strategiques", icon: Users, volume: "~15 docs/an", documents: [
      { titre: "Evaluations de partenaires potentiels", type: "Document", sections: 6, frequence: "Par partenaire", createur: "Simone", statut: "actif", critique: false },
      { titre: "Protocoles d'entente (MOU)", type: "Document", sections: 4, frequence: "Par partenaire", createur: "Loulou", statut: "a_creer", critique: true },
      { titre: "Suivi performance alliances actives", type: "Dashboard", sections: 1, frequence: "Trimestriel", createur: "Simone", statut: "a_creer", critique: false },
    ]},
  ],
  COOB: [
    { id: "sops_workflows", label: "SOPs et workflows", icon: ListChecks, volume: "~30 docs/an", documents: [
      { titre: "Plan de continuite des affaires (BCP)", type: "Document", sections: 8, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Manuels operationnels par processus", type: "Procedure", sections: 15, frequence: "Continu", createur: "Olivier", statut: "brouillon", critique: true },
      { titre: "SOPs critiques (top 10)", type: "Procedure", sections: 10, frequence: "Continu", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Cartographie de la chaine de valeur", type: "Procedure", sections: 12, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Audits de processus trimestriels", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Olivier", statut: "actif", critique: true },
    ]},
    { id: "kpis_performance", label: "KPIs et performance", icon: Activity, volume: "~200 docs/an", documents: [
      { titre: "Dashboard KPIs operationnels", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Rapports KPIs hebdomadaires", type: "Document", sections: 4, frequence: "Hebdomadaire", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Plannings d'equipes et horaires", type: "Dataset", sections: 1, frequence: "Hebdomadaire", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Checklists quotidiennes operations", type: "Procedure", sections: 3, frequence: "Quotidien", createur: "Olivier", statut: "actif", critique: false },
    ]},
    { id: "achats_fournisseurs", label: "Achats & fournisseurs", icon: Briefcase, volume: "~100 docs/an", documents: [
      { titre: "Bons de commande (Purchase Orders)", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Evaluations fournisseurs annuelles", type: "Document", sections: 6, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Contrats fournisseurs et SLAs", type: "Document", sections: 8, frequence: "Par fournisseur", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Receptions et bons de livraison", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Olivier", statut: "actif", critique: false },
    ]},
    { id: "logistique_inventaire", label: "Logistique & inventaire", icon: Package, volume: "~500 docs/an", documents: [
      { titre: "Niveaux de stock en temps reel", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Politique de reapprovisionnement", type: "Document", sections: 6, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Suivi expeditions et transport", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "brouillon", critique: false },
      { titre: "Inventaire annuel physique (resultats)", type: "Document", sections: 4, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
    ]},
    { id: "qualite_amelioration", label: "Qualite & amelioration continue", icon: CheckCircle2, volume: "~40 docs/an", documents: [
      { titre: "Rapports non-conformite (NCR)", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Initiatives Kaizen / amelioration", type: "Document", sections: 4, frequence: "Mensuel", createur: "Olivier", statut: "brouillon", critique: false },
      { titre: "Audits qualite internes", type: "Document", sections: 8, frequence: "Trimestriel", createur: "Olivier", statut: "a_creer", critique: false },
      { titre: "Dashboard taux de retours clients (RMA)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "a_creer", critique: false },
    ]},
  ],
  CPOB: [
    { id: "ingenierie_fab", label: "Ingenierie et fabrication", icon: Settings, volume: "~1000 docs/an", documents: [
      { titre: "BOM maitresses (Bill of Materials)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: true },
      { titre: "Specifications de fabrication", type: "Document", sections: 10, frequence: "Par produit", createur: "Paco", statut: "actif", critique: true },
      { titre: "Protocoles de securite usine (SST)", type: "Procedure", sections: 8, frequence: "Annuel", createur: "Paco", statut: "actif", critique: true },
      { titre: "Planification capacite et ordres de travail", type: "Document", sections: 6, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
      { titre: "Checklists de maintenance preventive", type: "Procedure", sections: 3, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
    ]},
    { id: "qualite_inventaire", label: "Qualite et inventaire", icon: CheckCircle2, volume: "~500 docs/an", documents: [
      { titre: "Rapports de non-conformite majeurs", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Paco", statut: "actif", critique: true },
      { titre: "Registres d'inventaire critiques", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: true },
      { titre: "Manuel qualite ISO", type: "Document", sections: 12, frequence: "Annuel", createur: "Paco", statut: "a_creer", critique: false },
      { titre: "Fiches d'inspection qualite", type: "Procedure", sections: 4, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
      { titre: "Releves de rendement journaliers", type: "Dashboard", sections: 1, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
    ]},
    { id: "planification_prod", label: "Planification & ordonnancement", icon: Calendar, volume: "~250 docs/an", documents: [
      { titre: "Calendrier de production usine", type: "Dashboard", sections: 1, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: true },
      { titre: "Ordres de fabrication (OF) en cours", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
      { titre: "Analyse capacite vs demande", type: "Document", sections: 4, frequence: "Hebdomadaire", createur: "Paco", statut: "actif", critique: true },
      { titre: "Planification des quarts de travail", type: "Document", sections: 3, frequence: "Hebdomadaire", createur: "Paco", statut: "actif", critique: false },
    ]},
    { id: "sst_conformite", label: "SST & conformite CNESST", icon: Shield, volume: "~30 docs/an", documents: [
      { titre: "Programme de prevention SST", type: "Document", sections: 10, frequence: "Annuel", createur: "Paco", statut: "actif", critique: true },
      { titre: "Registre des accidents de travail", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: true },
      { titre: "Formations SST (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: false },
      { titre: "Fiches signalitiques (SIMDUT/SGH)", type: "Document", sections: 2, frequence: "Par produit", createur: "Paco", statut: "actif", critique: true },
    ]},
    { id: "maintenance_equip", label: "Maintenance equipements", icon: Settings, volume: "~200 docs/an", documents: [
      { titre: "Plans de maintenance preventive", type: "Procedure", sections: 8, frequence: "Annuel", createur: "Paco", statut: "actif", critique: true },
      { titre: "Registre interventions correctives", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: false },
      { titre: "Inventaire pieces de rechange", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "brouillon", critique: false },
      { titre: "Dashboard OEE/TRS (efficacite globale)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Paco", statut: "a_creer", critique: true },
    ]},
  ],
  CHROB: [
    { id: "contrats_emploi", label: "Contrats et dossiers employes", icon: User, volume: "~50 docs/an", documents: [
      { titre: "Contrats d'emploi (permanents et temporaires)", type: "Document", sections: 8, frequence: "Par embauche", createur: "Helene", statut: "actif", critique: true },
      { titre: "Manuel des employes", type: "Document", sections: 14, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Descriptions de postes", type: "Document", sections: 4, frequence: "Par embauche", createur: "Helene", statut: "actif", critique: false },
      { titre: "Grille salariale et avantages", type: "Document", sections: 4, frequence: "Annuel", createur: "Helene", statut: "actif", critique: false },
      { titre: "Rapports d'integration (onboarding)", type: "Procedure", sections: 6, frequence: "Par embauche", createur: "Helene", statut: "actif", critique: false },
    ]},
    { id: "politiques_rh", label: "Politiques et conformite RH", icon: Shield, volume: "~30 docs/an", documents: [
      { titre: "Politique de prevention harcelement", type: "Document", sections: 6, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Dossiers disciplinaires", type: "Dataset", sections: 1, frequence: "Ad hoc", createur: "Helene", statut: "actif", critique: true },
      { titre: "Plan d'equite salariale", type: "Document", sections: 6, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Evaluations de performance", type: "Procedure", sections: 5, frequence: "Semestriel", createur: "Helene", statut: "a_creer", critique: false },
      { titre: "Programme de formation et developpement", type: "Document", sections: 8, frequence: "Annuel", createur: "Helene", statut: "brouillon", critique: false },
      { titre: "Certificats de formation (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: false },
    ]},
    { id: "recrutement_dotation", label: "Recrutement & dotation", icon: UserPlus, volume: "~40 docs/an", documents: [
      { titre: "Offres d'emploi actives", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: false },
      { titre: "Pipeline candidats (ATS tracker)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Helene", statut: "brouillon", critique: true },
      { titre: "Grilles d'evaluation d'entrevue", type: "Procedure", sections: 4, frequence: "Par poste", createur: "Helene", statut: "actif", critique: false },
      { titre: "Profils de competences par poste", type: "Document", sections: 6, frequence: "Annuel", createur: "Helene", statut: "a_creer", critique: false },
    ]},
    { id: "formation_dev", label: "Formation & developpement", icon: BookOpen, volume: "~30 docs/an", documents: [
      { titre: "Plan de formation annuel", type: "Document", sections: 8, frequence: "Annuel", createur: "Helene", statut: "brouillon", critique: true },
      { titre: "Catalogue de formations disponibles", type: "Dataset", sections: 1, frequence: "Semestriel", createur: "Helene", statut: "a_creer", critique: false },
      { titre: "Plans de developpement individuel", type: "Document", sections: 4, frequence: "Annuel", createur: "Helene", statut: "a_creer", critique: false },
      { titre: "Registre heures formation (Loi 90)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: true },
    ]},
    { id: "temps_presences", label: "Temps & presences", icon: Clock, volume: "~500 docs/an", documents: [
      { titre: "Feuilles de temps (approbations)", type: "Dataset", sections: 1, frequence: "Bimensuel", createur: "Helene", statut: "actif", critique: false },
      { titre: "Calendrier conges et vacances", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Helene", statut: "actif", critique: false },
      { titre: "Politique heures supplementaires", type: "Document", sections: 4, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Rapports absenteisme et retards", type: "Document", sections: 3, frequence: "Mensuel", createur: "Helene", statut: "brouillon", critique: false },
    ]},
  ],
  CINOB: [
    { id: "rd_prototypes", label: "R&D et prototypes", icon: Sparkles, volume: "~5 docs/an", documents: [
      { titre: "Rapports de validation POC", type: "Document", sections: 6, frequence: "Par projet", createur: "Ines", statut: "actif", critique: true },
      { titre: "Roadmap innovation 2026-2028", type: "Document", sections: 8, frequence: "Annuel", createur: "Ines", statut: "actif", critique: true },
      { titre: "Etudes de faisabilite technique", type: "Document", sections: 8, frequence: "Par projet", createur: "Ines", statut: "brouillon", critique: true },
      { titre: "Comptes rendus de brainstorming", type: "Document", sections: 3, frequence: "Mensuel", createur: "Ines", statut: "actif", critique: false },
      { titre: "Brouillons de concepts (SCAMPER)", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Ines", statut: "actif", critique: false },
    ]},
    { id: "brevets_pi", label: "Propriete intellectuelle", icon: Shield, volume: "~10 docs/an", documents: [
      { titre: "Depots de brevets actifs", type: "Document", sections: 10, frequence: "Par invention", createur: "Ines", statut: "actif", critique: true },
      { titre: "Registre de propriete intellectuelle", type: "Dataset", sections: 1, frequence: "Continu", createur: "Ines", statut: "actif", critique: true },
      { titre: "Notes de veille technologique", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "Ines", statut: "actif", critique: false },
      { titre: "Analyses d'impact technologique", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Ines", statut: "a_creer", critique: false },
    ]},
    { id: "rsde_subventions", label: "RS&DE & subventions", icon: DollarSign, volume: "~15 docs/an", documents: [
      { titre: "Documentation RS&DE (formulaire T661)", type: "Document", sections: 10, frequence: "Annuel", createur: "Ines", statut: "actif", critique: true },
      { titre: "Registre heures R&D par projet", type: "Dataset", sections: 1, frequence: "Continu", createur: "Ines", statut: "actif", critique: true },
      { titre: "Demandes de subventions (CRSNG, MITACS)", type: "Document", sections: 8, frequence: "Par programme", createur: "Ines", statut: "brouillon", critique: false },
      { titre: "Rapports d'avancement projets subventionnes", type: "Document", sections: 4, frequence: "Semestriel", createur: "Ines", statut: "a_creer", critique: false },
    ]},
    { id: "veille_ecosysteme", label: "Veille & ecosysteme R&D", icon: Search, volume: "~20 docs/an", documents: [
      { titre: "Cartographie ecosysteme innovation (partenaires)", type: "Document", sections: 6, frequence: "Annuel", createur: "Ines", statut: "a_creer", critique: false },
      { titre: "Rapports de participation symposiums/conferences", type: "Document", sections: 3, frequence: "Ad hoc", createur: "Ines", statut: "actif", critique: false },
      { titre: "Pipeline d'idees (boite a idees)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Ines", statut: "actif", critique: false },
    ]},
  ],
  CLOB: [
    { id: "contrats_types", label: "Contrats types et modeles", icon: FileText, volume: "~20 docs/an", documents: [
      { titre: "Conditions generales de vente (CGV/CGU)", type: "Document", sections: 8, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Contrats types de partenariat", type: "Document", sections: 6, frequence: "Par partenaire", createur: "Loulou", statut: "actif", critique: true },
      { titre: "NDAs signes (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Renouvellements de licences", type: "Document", sections: 3, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: false },
    ]},
    { id: "conformite_registres", label: "Conformite et registres legaux", icon: Shield, volume: "~30 docs/an", documents: [
      { titre: "Politique de confidentialite (Loi 25)", type: "Document", sections: 10, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Registre des actions et actionnaires", type: "Dataset", sections: 1, frequence: "Continu", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Memos de litiges potentiels", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Loulou", statut: "a_creer", critique: true },
      { titre: "Avis juridiques courts", type: "Document", sections: 2, frequence: "Ad hoc", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Mises a jour de conformite reglementaire", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Loulou", statut: "actif", critique: false },
    ]},
    { id: "litiges_contentieux", label: "Litiges & contentieux", icon: Gavel, volume: "~10 docs/an", documents: [
      { titre: "Dossiers de litige actifs", type: "Dataset", sections: 1, frequence: "Continu", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Mises en demeure envoyees/recues", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Suivi judiciaire (echancier, decisions)", type: "Document", sections: 3, frequence: "Ad hoc", createur: "Loulou", statut: "a_creer", critique: false },
    ]},
    { id: "assurances_risques", label: "Assurances & risques", icon: Shield, volume: "~15 docs/an", documents: [
      { titre: "Polices d'assurance actives (registre)", type: "Dataset", sections: 1, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Reclamations en cours", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Analyse des couvertures et gaps", type: "Document", sections: 6, frequence: "Annuel", createur: "Loulou", statut: "brouillon", critique: true },
      { titre: "Renouvellements assurance (echeancier)", type: "Dataset", sections: 1, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: false },
    ]},
  ],
  CISOB: [
    { id: "politiques_securite", label: "Politiques et continuite", icon: Shield, volume: "~5 docs/an", documents: [
      { titre: "Plan de reponse aux incidents (IRP)", type: "Procedure", sections: 8, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "PSSI (Politique Securite de l'Information)", type: "Document", sections: 12, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "DRP (Disaster Recovery Plan)", type: "Document", sections: 10, frequence: "Annuel", createur: "Sebastien", statut: "brouillon", critique: true },
      { titre: "Procedures de sauvegarde et restauration", type: "Procedure", sections: 5, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "audits_risques", label: "Audits et evaluation des risques", icon: ClipboardCheck, volume: "~40 docs/an", documents: [
      { titre: "Audits de penetration externes (pentests)", type: "Document", sections: 8, frequence: "Annuel", createur: "Sebastien", statut: "a_creer", critique: true },
      { titre: "Evaluations de risques cyber", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Rapports de scans de vulnerabilite", type: "Document", sections: 4, frequence: "Mensuel", createur: "Sebastien", statut: "actif", critique: false },
      { titre: "Revues d'acces utilisateurs", type: "Dataset", sections: 1, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: false },
      { titre: "Formations et tests hameconnage", type: "Procedure", sections: 3, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "gestion_vulnerabilites", label: "Gestion vulnerabilites", icon: Bug, volume: "~100 docs/an", documents: [
      { titre: "Inventaire vulnerabilites critiques", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Suivi des correctifs (patch management)", type: "Dataset", sections: 1, frequence: "Mensuel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Rapports de scan de vulnerabilites", type: "Document", sections: 4, frequence: "Mensuel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "formation_sensibilisation", label: "Formation & sensibilisation", icon: BookOpen, volume: "~20 docs/an", documents: [
      { titre: "Resultats campagnes de phishing interne", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: false },
      { titre: "Capsules de formation cybersecurite", type: "Procedure", sections: 6, frequence: "Mensuel", createur: "Sebastien", statut: "brouillon", critique: false },
      { titre: "Attestations de formation (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "controle_acces_iam", label: "Controle d'acces (IAM)", icon: Lock, volume: "~30 docs/an", documents: [
      { titre: "Matrice des droits d'acces par role", type: "Document", sections: 8, frequence: "Semestriel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Revues trimestrielles d'acces utilisateurs", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Politique MFA et gestion mots de passe", type: "Document", sections: 5, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
  ],
  CTOB: [
    { id: "architecture_specs", label: "Architecture et specifications", icon: Cpu, volume: "~20 docs/an", documents: [
      { titre: "Architecture systeme globale", type: "Document", sections: 14, frequence: "Semestriel", createur: "Tim", statut: "actif", critique: true },
      { titre: "Plans de reprise apres sinistre (DRP tech)", type: "Document", sections: 6, frequence: "Annuel", createur: "Tim", statut: "a_creer", critique: true },
      { titre: "Documentation API et specs techniques", type: "Document", sections: 10, frequence: "Continu", createur: "Tim", statut: "actif", critique: true },
      { titre: "Roadmap technique trimestrielle", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Tim", statut: "actif", critique: false },
      { titre: "Notes de version (changelogs)", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "audits_dette", label: "Audits et dette technique", icon: Bug, volume: "~150 docs/an", documents: [
      { titre: "Audits de securite du code", type: "Document", sections: 8, frequence: "Semestriel", createur: "Tim", statut: "brouillon", critique: true },
      { titre: "Inventaire dette technique", type: "Dataset", sections: 1, frequence: "Trimestriel", createur: "Tim", statut: "actif", critique: false },
      { titre: "Rapports d'incidents (post-mortems)", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Tim", statut: "actif", critique: false },
      { titre: "Logs de deploiement", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Tim", statut: "actif", critique: false },
      { titre: "Audits de dependances et licences", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "infra_devops", label: "Infrastructure & DevOps", icon: Cpu, volume: "~100 docs/an", documents: [
      { titre: "Pipeline CI/CD (configuration)", type: "Document", sections: 6, frequence: "Continu", createur: "Tim", statut: "actif", critique: true },
      { titre: "Dashboard monitoring & uptime", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Tim", statut: "actif", critique: true },
      { titre: "Runbooks d'incidents (procedures)", type: "Procedure", sections: 8, frequence: "Par service", createur: "Tim", statut: "brouillon", critique: false },
      { titre: "Inventaire serveurs et infrastructure", type: "Dataset", sections: 1, frequence: "Continu", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "licences_saas", label: "Licences & SaaS", icon: DollarSign, volume: "~30 docs/an", documents: [
      { titre: "Inventaire abonnements SaaS actifs", type: "Dataset", sections: 1, frequence: "Continu", createur: "Tim", statut: "actif", critique: true },
      { titre: "Rapport Shadow IT (outils non-approuves)", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Tim", statut: "a_creer", critique: true },
      { titre: "Budget technologique vs consommation", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Frank", statut: "brouillon", critique: false },
      { titre: "Renouvellements licences (echeancier)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "support_itsm", label: "Support & incidents (ITSM)", icon: Headphones, volume: "~500 docs/an", documents: [
      { titre: "Dashboard tickets support ouverts", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Tim", statut: "actif", critique: false },
      { titre: "Base de connaissances IT (FAQ)", type: "Document", sections: 20, frequence: "Continu", createur: "Tim", statut: "brouillon", critique: false },
      { titre: "SLAs et temps de reponse (rapport)", type: "Document", sections: 3, frequence: "Mensuel", createur: "Tim", statut: "a_creer", critique: false },
      { titre: "Post-mortems incidents majeurs", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Tim", statut: "actif", critique: true },
    ]},
  ],
};

const STATUT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  actif: { label: "Actif", bg: "bg-emerald-50", text: "text-emerald-700" },
  brouillon: { label: "Brouillon", bg: "bg-amber-50", text: "text-amber-700" },
  a_creer: { label: "A creer", bg: "bg-gray-100", text: "text-gray-500" },
};

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  Document: { label: "Doc", bg: "bg-blue-50", text: "text-blue-700" },
  Dashboard: { label: "Dashboard", bg: "bg-purple-50", text: "text-purple-700" },
  Flow: { label: "Flow", bg: "bg-amber-50", text: "text-amber-700" },
  Dataset: { label: "Dataset", bg: "bg-teal-50", text: "text-teal-700" },
  Procedure: { label: "Procedure", bg: "bg-orange-50", text: "text-orange-700" },
  Media: { label: "Media", bg: "bg-pink-50", text: "text-pink-700" },
};

// 6 types d'actifs numériques (DS-04 Part 9)
const ASSET_TYPES: { id: string; label: string; icon: React.ElementType; bgColor: string; iconColor: string; valueColor: string; desc: string; docType: string }[] = [
  { id: "documents", label: "Documents", icon: FileText, bgColor: "bg-blue-50", iconColor: "text-blue-500", valueColor: "text-blue-600", desc: "Contrats, rapports, plans", docType: "Document" },
  { id: "dashboards", label: "Dashboards", icon: BarChart3, bgColor: "bg-purple-50", iconColor: "text-purple-500", valueColor: "text-purple-600", desc: "KPIs temps reel", docType: "Dashboard" },
  { id: "flows", label: "Automatisations", icon: Zap, bgColor: "bg-amber-50", iconColor: "text-amber-500", valueColor: "text-amber-600", desc: "Workflows, scripts", docType: "Flow" },
  { id: "datasets", label: "Datasets", icon: Database, bgColor: "bg-teal-50", iconColor: "text-teal-500", valueColor: "text-teal-600", desc: "Registres, inventaires", docType: "Dataset" },
  { id: "media", label: "Media", icon: Palette, bgColor: "bg-pink-50", iconColor: "text-pink-500", valueColor: "text-pink-600", desc: "Logos, visuels, brand", docType: "Media" },
  { id: "procedures", label: "Procedures", icon: ListChecks, bgColor: "bg-orange-50", iconColor: "text-orange-500", valueColor: "text-orange-600", desc: "SOPs, checklists", docType: "Procedure" },
];

// Format de fichier — type de document (Texte, Excel, Presentation, Etude, etc.)
const FORMAT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  texte: { label: "Texte", bg: "bg-slate-50", text: "text-slate-600" },
  tableur: { label: "Excel", bg: "bg-green-50", text: "text-green-700" },
  presentation: { label: "Presentation", bg: "bg-indigo-50", text: "text-indigo-600" },
  etude: { label: "Etude", bg: "bg-violet-50", text: "text-violet-600" },
  reflexion: { label: "Pre-rapport", bg: "bg-rose-50", text: "text-rose-600" },
  conception: { label: "Conception", bg: "bg-yellow-50", text: "text-yellow-700" },
  interactif: { label: "Interactif", bg: "bg-cyan-50", text: "text-cyan-600" },
  media: { label: "Media", bg: "bg-pink-50", text: "text-pink-600" },
};

function inferFormat(type: string, titre: string): string {
  if (type === "Dashboard") return "interactif";
  if (type === "Dataset") return "tableur";
  if (type === "Flow") return "interactif";
  if (type === "Media") return "media";
  if (type === "Procedure") return "texte";
  const t = titre.toLowerCase();
  // Etudes et analyses
  if (t.includes("etude") || t.includes("faisabilite") || t.includes("benchmark") || t.includes("scenar") || t.includes("analyse concurr") || t.includes("veille") || t.includes("recherche") || t.includes("swot") || t.includes("bmc")) return "etude";
  // Pre-rapports de reflexion
  if (t.includes("reflexion") || t.includes("notes") || t.includes("brainstorm") || t.includes("exploration") || t.includes("pre-rapport") || t.includes("hypothes") || t.includes("ideation")) return "reflexion";
  // Documents en mode conception
  if (t.includes("conception") || t.includes("design") || t.includes("prototype") || t.includes("wireframe") || t.includes("maquette") || t.includes("specs") || t.includes("architecture") || t.includes("blueprint") || t.includes("roadmap") || t.includes("schema")) return "conception";
  // Tableurs / chiffres
  if (t.includes("rapport") || t.includes("bilan") || t.includes("budget") || t.includes("prevision") || t.includes("projection") || t.includes("kpi") || t.includes("flash") || t.includes("inventaire") || t.includes("tresorerie") || t.includes("cash") || t.includes("compilation") || t.includes("facturation") || t.includes("registre") || t.includes("suivi")) return "tableur";
  // Presentations
  if (t.includes("presentation") || t.includes("pitch") || t.includes("deck") || t.includes("ordre du jour") || t.includes("onboarding") || t.includes("persona") || t.includes("positionnement")) return "presentation";
  return "texte";
}

type DataRoomViewMode = "list" | "cards" | "table";

function DataRoomVueConsolidee({ onNavigateDept }: { onNavigateDept: (deptCode: string) => void }) {
  const deptSummaries = OTHER_BOTS.map(bot => {
    const sections = DATA_ROOM_SECTIONS[bot.code] || [];
    const templates = getTemplatesForBot(bot.code).length;
    return { ...bot, sections, totalDocs: 0, templates, actifs: 0, critiques: 0, pct: 0 };
  });
  const totalTemplates = BLUEPRINT_TEMPLATES.length;
  const typeCountMap: Record<string, number> = {};

  return (
    <div className="space-y-4">
      {/* ── 6 Types d'actifs numériques ── */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Database className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">6 types d'actifs numériques</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{totalTemplates} templates</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-gray-100">
          {ASSET_TYPES.map(asset => {
            const count = typeCountMap[asset.docType] || 0;
            return (
              <div key={asset.id} className="px-2.5 py-3 text-center space-y-1">
                <div className={cn("w-8 h-8 rounded-lg mx-auto flex items-center justify-center", asset.bgColor)}>
                  <asset.icon className={cn("h-4 w-4", asset.iconColor)} />
                </div>
                <div className={cn("text-2xl font-bold", asset.valueColor)}>{count}</div>
                <div className="text-[9px] font-bold text-gray-700">{asset.label}</div>
                <div className="text-[9px] text-gray-400 leading-tight">{asset.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid departements — CLIQUABLES */}
      <div className="grid grid-cols-2 gap-2">
        {deptSummaries.map(dept => (
          <button
            key={dept.code}
            onClick={() => onNavigateDept(dept.code)}
            className="text-left p-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", dept.gradient)}>
              <FolderOpen className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white flex-1">{dept.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/60" />
            </div>
            <div className="px-3 py-2 space-y-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-purple-600">{dept.templates} templates</span>
                <span className="text-gray-400">{dept.sections.length} dossiers</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gray-200" style={{ width: "0%" }} />
              </div>
              <div className="text-[9px] text-gray-500 truncate">
                {dept.sections.map(s => s.label).join(" · ")}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DataRoomAssetList({ documents, viewMode, sortField, sortDir, onSort }: {
  documents: DataRoomDoc[];
  viewMode: DataRoomViewMode;
  sortField: DataRoomSortField;
  sortDir: DataRoomSortDir;
  onSort: (field: DataRoomSortField) => void;
}) {
  if (documents.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center">
        <FileText className="h-8 w-8 text-gray-200 mx-auto mb-3" />
        <p className="text-[10px] font-medium text-gray-400">Aucun document dans ce dossier</p>
        <p className="text-[9px] text-gray-300 mt-1">Importez des fichiers ou connectez votre Google Drive pour commencer.</p>
      </div>
    );
  }

  const actionLabel = (statut: string) => statut === "a_creer" ? "Creer" : statut === "brouillon" ? "Atelier" : "Consulter";
  const actionStyle = (statut: string) => statut === "a_creer" ? "bg-blue-600 hover:bg-blue-700" : statut === "brouillon" ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-600 hover:bg-gray-700";

  const typeIcon = (type: string) => {
    const at = ASSET_TYPES.find(a => a.docType === type);
    return at ? at.icon : FileText;
  };

  // ── Sortable column header ──
  const SortTh = ({ field, w, children }: { field: DataRoomSortField; w: string; children: React.ReactNode }) => {
    const active = sortField === field;
    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <button className={cn("text-left text-[9px] font-bold uppercase cursor-pointer select-none", w, active ? "text-blue-500" : "text-gray-500")}
        onClick={() => onSort(field)}>
        <span className="flex items-center gap-1">{children}<Icon className={cn("h-3.5 w-3.5", active ? "text-blue-500" : "text-gray-300")} /></span>
      </button>
    );
  };

  // ── TABLE VIEW (flat rows like Liste — sortable column headers) ──
  if (viewMode === "table") {
    return (
      <div className="space-y-0">
        {/* Header row */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200">
          <SortTh field="titre" w="flex-1">Nom</SortTh>
          <SortTh field="format" w="w-[70px] shrink-0">Format</SortTh>
          <SortTh field="statut" w="w-[70px] shrink-0">Statut</SortTh>
          <SortTh field="createur" w="w-[80px] shrink-0">Createur</SortTh>
          <span className="text-[9px] font-bold text-gray-500 uppercase w-[55px] shrink-0">Taille</span>
          <SortTh field="frequence" w="w-[70px] shrink-0">Modifie</SortTh>
          <span className="w-[50px] shrink-0" />
        </div>
        {/* Data rows */}
        {documents.map((doc, i) => {
          const statut = STATUT_BADGE[doc.statut];
          const fmt = FORMAT_BADGE[doc.format] || FORMAT_BADGE.texte;
          const DocIcon = typeIcon(doc.type);
          const assetType = ASSET_TYPES.find(a => a.docType === doc.type);
          return (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {doc.critique && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                <DocIcon className={cn("h-3.5 w-3.5 shrink-0", assetType ? assetType.iconColor : "text-gray-400")} />
                <span className="text-[9px] font-medium text-gray-800 truncate">{doc.titre}</span>
              </div>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 w-[70px]", fmt.bg, fmt.text)}>{fmt.label}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 w-[70px]", statut.bg, statut.text)}>{statut.label}</span>
              <span className="text-[9px] text-gray-500 shrink-0 w-[80px] truncate">{doc.createur}</span>
              <span className="text-[9px] text-gray-400 shrink-0 w-[55px]">{doc.taille}</span>
              <span className="text-[9px] text-gray-400 shrink-0 w-[70px]">{doc.modifie}</span>
              <button className={cn("text-[9px] font-medium text-white px-2 py-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-[50px]", actionStyle(doc.statut))}>
                {actionLabel(doc.statut)}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // ── CARDS VIEW (boxes style) ──
  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {documents.map((doc, i) => {
          const statut = STATUT_BADGE[doc.statut];
          const fmt = FORMAT_BADGE[doc.format] || FORMAT_BADGE.texte;
          const DocIcon = typeIcon(doc.type);
          const assetType = ASSET_TYPES.find(a => a.docType === doc.type);
          return (
            <button key={i} className="text-left p-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <div className={cn("flex items-center gap-2 px-3 py-1.5", assetType ? assetType.bgColor : "bg-gray-50")}>
                <DocIcon className={cn("h-3.5 w-3.5", assetType ? assetType.iconColor : "text-gray-400")} />
                <span className="text-[9px] font-bold text-gray-700 flex-1 truncate">{doc.titre}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", statut.bg, statut.text)}>{statut.label}</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {doc.critique && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">Critique</span>}
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", fmt.bg, fmt.text)}>{fmt.label}</span>
                  <span className="text-[9px] text-gray-400">{doc.taille}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400">{doc.createur} · {doc.modifie}</span>
                  <span className={cn("text-[9px] font-medium text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity", actionStyle(doc.statut))}>
                    {actionLabel(doc.statut)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // ── LIST VIEW (flat file list — SharePoint style, no category grouping) ──
  return (
    <div className="space-y-0.5">
      {documents.map((doc, i) => {
        const statut = STATUT_BADGE[doc.statut];
        const fmt = FORMAT_BADGE[doc.format] || FORMAT_BADGE.texte;
        const DocIcon = typeIcon(doc.type);
        const assetType = ASSET_TYPES.find(a => a.docType === doc.type);
        return (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer group">
            <div className={cn("w-2 h-2 rounded-full shrink-0", doc.statut === "actif" ? "bg-emerald-500" : doc.statut === "brouillon" ? "bg-amber-400" : "bg-gray-300")} />
            <DocIcon className={cn("h-3.5 w-3.5 shrink-0", assetType ? assetType.iconColor : "text-gray-400")} />
            <span className="text-[9px] font-bold text-gray-800 flex-1 truncate">{doc.titre}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0", fmt.bg, fmt.text)}>{fmt.label}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0", statut.bg, statut.text)}>{statut.label}</span>
            <span className="text-[9px] text-gray-400 shrink-0 w-[60px]">{doc.taille}</span>
            <span className="text-[9px] text-gray-400 shrink-0 w-[70px]">{doc.modifie}</span>
            <button className={cn("text-[9px] font-medium text-white px-2 py-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0", actionStyle(doc.statut))}>
              {actionLabel(doc.statut)}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

function DataRoomTemplatesList({ botCode, viewMode: _viewMode }: { botCode: string; viewMode: DataRoomViewMode }) {
  const { startDeliverable } = useAmorcer();
  const allTemplates = BLUEPRINT_TEMPLATES;
  const deptTemplates = botCode === "CEOB" ? allTemplates : getTemplatesForBot(botCode);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string | null>(botCode !== "CEOB" ? botCode : null);
  const [searchTpl, setSearchTpl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<BlueprintTemplate | null>(null);

  const CATEGORY_LABELS: Record<string, string> = { strategique: "Strategique", operationnel: "Operationnel", conformite: "Conformite", diagnostic: "Diagnostic" };
  const CATEGORY_ICONS: Record<string, React.ElementType> = { strategique: Target, operationnel: Activity, conformite: Shield, diagnostic: Search };
  const catBadgeStyle = (cat: string) => cat === "strategique" ? "bg-blue-50 text-blue-700" : cat === "conformite" ? "bg-purple-50 text-purple-700" : cat === "diagnostic" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700";
  const PHASE_LABELS: Record<string, string> = { startup: "Startup", scaleup: "Scale-up", exitup: "Exit" };

  const baseTemplates = filterDept ? allTemplates.filter(t => t.botCode === filterDept) : deptTemplates;
  let filtered = filterCat === "all" ? baseTemplates : baseTemplates.filter(t => t.category === filterCat);
  if (searchTpl.trim()) {
    const q = searchTpl.toLowerCase();
    filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }

  const catCounts: Record<string, number> = {};
  baseTemplates.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
  const docForgeCount = baseTemplates.filter(t => t.docForgeReady).length;

  const deptCounts: { code: string; label: string; count: number }[] = Object.entries(DEPT_SHORT_LABEL)
    .map(([code, label]) => ({ code, label, count: allTemplates.filter(t => t.botCode === code).length }))
    .filter(d => d.count > 0);

  if (selectedTemplate) {
    const t = selectedTemplate;
    const CatIcon = CATEGORY_ICONS[t.category] || Layers;
    const similarTemplates = allTemplates.filter(s => s.botCode === t.botCode && s.id !== t.id).slice(0, 4);
    return (
      <div className="space-y-3">
        <button onClick={() => setSelectedTemplate(null)} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1.5 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour aux templates</button>
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-[#00B4D8]/10">
            <CatIcon className="h-5 w-5 text-gray-900 stroke-[2.5]" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">{t.name}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{DEPT_SHORT_LABEL[t.botCode] || t.botCode}</p>
            </div>
            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded", catBadgeStyle(t.category))}>{CATEGORY_LABELS[t.category]}</span>
            {t.docForgeReady && <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">DocForge</span>}
          </div>
          <div className="px-5 py-4 space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">{t.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[9px] text-gray-400 block mb-0.5">Categorie</span>
                <span className="text-xs font-bold text-gray-800">{CATEGORY_LABELS[t.category]}</span>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[9px] text-gray-400 block mb-0.5">Phases</span>
                <span className="text-xs font-bold text-gray-800">{t.phases.map(p => PHASE_LABELS[p] || p).join(", ")}</span>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[9px] text-gray-400 block mb-0.5">Source</span>
                <span className="text-xs font-bold text-gray-800">{t.source === "existant" ? "Existant" : "Nouveau"}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => startDeliverable("document")}
                className="flex-1 px-3 py-2 text-[10px] font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" /> Ouvrir dans DocForge
              </button>
              <button className="px-3 py-2 text-[10px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Telecharger
              </button>
            </div>
          </div>
        </div>
        {similarTemplates.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2"><Layers className="h-3.5 w-3.5 text-gray-500" /> Templates similaires</h4>
            <div className="grid grid-cols-2 gap-3">
              {similarTemplates.map(s => {
                const SIcon = CATEGORY_ICONS[s.category] || Layers;
                return (
                  <div key={s.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => setSelectedTemplate(s)}>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-[#00B4D8]/10">
                      <SIcon className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                      <span className="text-[10px] font-bold text-gray-900 flex-1 truncate">{s.name}</span>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[9px] text-gray-500 line-clamp-2">{s.description}</p>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block", catBadgeStyle(s.category))}>{CATEGORY_LABELS[s.category]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">Total</span>
          <span className="text-lg font-bold text-gray-900">{baseTemplates.length}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">DocForge</span>
          <span className="text-lg font-bold text-emerald-600">{docForgeCount}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">Categories</span>
          <span className="text-lg font-bold text-gray-900">{Object.keys(catCounts).length}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">Nouveaux</span>
          <span className="text-lg font-bold text-blue-600">{baseTemplates.filter(t => t.source === "nouveau").length}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="relative flex-1 max-w-[220px]">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchTpl} onChange={e => setSearchTpl(e.target.value)} placeholder="Rechercher templates..." className="w-full pl-7 pr-2 py-1 text-[9px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" />
        </div>
        {Object.entries(CATEGORY_LABELS).filter(([k]) => catCounts[k]).map(([k, v]) => {
          const CIcon = CATEGORY_ICONS[k] || Layers;
          return (
            <button key={k} onClick={() => setFilterCat(filterCat === k ? "all" : k)} className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer border", filterCat === k ? `${catBadgeStyle(k)} border-current shadow-sm` : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
              <CIcon className="h-3.5 w-3.5" /> {v} <span className="opacity-60">{catCounts[k]}</span>
            </button>
          );
        })}
        <span className="text-[9px] text-gray-400 ml-auto">{filtered.length} templates</span>
      </div>

      {botCode === "CEOB" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setFilterDept(null)} className={cn("px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer border", !filterDept ? "bg-gray-900 text-white border-gray-900 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
            Tous
          </button>
          {deptCounts.map(d => (
            <button key={d.code} onClick={() => setFilterDept(filterDept === d.code ? null : d.code)} className={cn("px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer border", filterDept === d.code ? "bg-gray-900 text-white border-gray-900 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
              {d.label} <span className="opacity-60">{d.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map(t => {
          const CatIcon = CATEGORY_ICONS[t.category] || Layers;
          return (
            <div key={t.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => setSelectedTemplate(t)}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <CatIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-[10px] font-bold text-gray-900 flex-1 truncate">{t.name}</span>
                {t.docForgeReady && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-[9px] text-gray-500 leading-relaxed line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", catBadgeStyle(t.category))}>{CATEGORY_LABELS[t.category]}</span>
                  {t.phases.map(p => (
                    <span key={p} className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{PHASE_LABELS[p] || p}</span>
                  ))}
                  {botCode === "CEOB" && <span className="text-[8px] text-gray-400 ml-auto">{DEPT_SHORT_LABEL[t.botCode] || t.botCode}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Layers className="h-5 w-5 text-gray-300 mx-auto mb-2" />
          <p className="text-[10px] text-gray-400">Aucun template trouve</p>
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-3">
        <Info className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[9px] text-blue-700">Templates · {baseTemplates.length} disponibles · {docForgeCount} prets pour DocForge · {Object.keys(catCounts).length} categories</span>
      </div>
    </div>
  );
}

type DataRoomSortField = "titre" | "format" | "frequence" | "createur" | "statut" | "categorie";
type DataRoomSortDir = "asc" | "desc";

const DR_SORT_OPTIONS: { field: DataRoomSortField; label: string }[] = [
  { field: "titre", label: "Nom" },
  { field: "format", label: "Format" },
  { field: "statut", label: "Statut" },
  { field: "categorie", label: "Categorie" },
  { field: "frequence", label: "Frequence" },
  { field: "createur", label: "Createur" },
];

// Type enrichi avec categorie d'origine + format infere
type DataRoomDoc = {
  titre: string; type: string; sections: number; frequence: string; createur: string;
  statut: "actif" | "brouillon" | "a_creer"; critique: boolean;
  categorie: string; categorieId: string; format: string;
  modifie: string; taille: string;
};


export function DataRoomView({ botCode, headerGradient, showHeader = false }: { botCode: string; headerGradient: string; showHeader?: boolean }) {
  const isMobile = useIsMobile();
  // Department navigation — sidebar shows ALL departments
  const [activeDept, setActiveDept] = useState(botCode);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set([botCode]));
  const sections = DATA_ROOM_SECTIONS[activeDept] || [];
  const templates = activeDept === "CEOB" ? BLUEPRINT_TEMPLATES : getTemplatesForBot(activeDept);
  const [activeFolder, setActiveFolder] = useState(botCode === "CEOB" ? "_consolidee" : (sections.length > 0 ? sections[0].id : ""));
  const [viewMode, setViewMode] = useState<DataRoomViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<DataRoomSortField>("titre");
  const [sortDir, setSortDir] = useState<DataRoomSortDir>("asc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);

  // Synchroniser quand botCode change (navigation département dans ControlTowerPanel)
  useEffect(() => {
    setActiveDept(botCode);
    setExpandedDepts(new Set([botCode]));
    const deptSections = DATA_ROOM_SECTIONS[botCode] || [];
    setActiveFolder(botCode === "CEOB" ? "_consolidee" : (deptSections.length > 0 ? deptSections[0].id : ""));
    setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null);
  }, [botCode]);

  const toggleDept = (code: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };
  const selectDeptFolder = (deptCode: string, folderId: string) => {
    setActiveDept(deptCode);
    setActiveFolder(folderId);
    setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null);
    if (!expandedDepts.has(deptCode)) setExpandedDepts(prev => new Set([...prev, deptCode]));
  };

  // ═══ API réelle — documents bureau uploadés ═══
  const [bureauDocs, setBureauDocs] = useState<any[]>([]);
  useEffect(() => {
    api.listBureauItems("document").then(res => {
      if (res.items?.length) setBureauDocs(res.items);
    }).catch(() => {});
  }, []);

  // ═══ Rapports générés automatiquement par les outils bots (T.3) ═══
  const [botDocs, setBotDocs] = useState<any[]>([]);
  useEffect(() => {
    api.listBotDocuments(botCode).then(res => {
      if (res.documents?.length) setBotDocs(res.documents);
    }).catch(() => {});
  }, [botCode]);

  // ═══ Drive Connect état (réel — valide via rclone + sauvegarde DB) ═══
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveFileCount, setDriveFileCount] = useState<number | null>(null);
  const [driveShareEmail, setDriveShareEmail] = useState("cfugere@usinebleue.ai");
  const [driveFolderInput, setDriveFolderInput] = useState("");
  const [driveConnectStatus, setDriveConnectStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [driveConnectError, setDriveConnectError] = useState("");
  const [showDriveSetup, setShowDriveSetup] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Charger le statut Drive au montage
  useEffect(() => {
    api.driveStatus().then(res => {
      setDriveShareEmail(res.share_email || "cfugere@usinebleue.ai");
      if (res.connected) {
        setDriveConnected(true);
        setDriveFileCount(res.file_count ?? null);
      }
    }).catch(() => {});
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(driveShareEmail).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  const handleDriveConnect = async () => {
    if (!driveFolderInput.trim()) return;
    setDriveConnectStatus("loading");
    setDriveConnectError("");
    try {
      const res = await api.driveConnect(driveFolderInput.trim());
      if (res.ok) {
        setDriveConnected(true);
        setDriveFileCount(res.items_count ?? null);
        setDriveConnectStatus("done");
        setShowDriveSetup(false);
        setDriveFolderInput("");
      } else {
        setDriveConnectError(res.error || "Connexion échouée");
        setDriveConnectStatus("error");
      }
    } catch {
      setDriveConnectError("Erreur réseau — réessayez");
      setDriveConnectStatus("error");
    }
  };

  // Convertir bureau items en DataRoomDoc format
  const realDocs: DataRoomDoc[] = useMemo(() =>
    bureauDocs.map((item: any) => ({
      id: `bureau-${item.id}`,
      titre: item.titre || item.nom || "Sans titre",
      type: item.type_item || "document",
      categorie: "Documents importés",
      categorieId: "_bureau",
      format: item.filename?.split(".").pop()?.toUpperCase() || "PDF",
      modifie: item.updated_at?.slice(0, 10) || item.created_at?.slice(0, 10) || "",
      taille: item.file_size ? `${Math.round(item.file_size / 1024)} Ko` : "—",
    })),
  [bureauDocs]);

  // Rapports bots → DataRoomDoc format (T.3)
  const botRapportsDocs = useMemo(() =>
    botDocs.map((item: any) => ({
      id: `bot-${item.id}`,
      titre: item.titre || item.tool_name || "Rapport bot",
      type: "Document" as const,
      categorie: "Générés par les bots",
      categorieId: "_bot_rapports",
      format: "MD",
      taille: "—",
      modifie: item.created_at ? new Date(item.created_at).toLocaleDateString("fr-CA") : "—",
      statut: "actif" as const,
      critique: false,
      sections: 1,
      frequence: "À la demande",
      createur: item.bot_code || "Bot",
    })),
  [botDocs]);

  // Docs réels uniquement — bureau uploadés + rapports bots (pas de données mock)
  const allDeptDocs: DataRoomDoc[] = [
    ...realDocs,
    ...botRapportsDocs,
  ];

  // Active folder
  const activeSection = sections.find(s => s.id === activeFolder);
  const isFolderView = !!activeSection;

  // Docs pour le dossier actif — tous les docs réels (non encore catégorisés par dossier)
  const folderDocs: DataRoomDoc[] = activeSection ? allDeptDocs : [];

  // Filter + sort documents
  const filteredDocs = (() => {
    if (!isFolderView) return [];
    let docs = [...folderDocs];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d => d.titre.toLowerCase().includes(q) || (d.createur || "").toLowerCase().includes(q) || (d.format || "").toLowerCase().includes(q));
    }
    if (typeFilter) docs = docs.filter(d => d.type === typeFilter);
    if (statusFilter) docs = docs.filter(d => d.statut === statusFilter);
    if (formatFilter) docs = docs.filter(d => d.format === formatFilter);
    docs.sort((a, b) => {
      const av = String(a[sortField as keyof DataRoomDoc] ?? "");
      const bv = String(b[sortField as keyof DataRoomDoc] ?? "");
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return docs;
  })();

  // Counts for filter pills (from unfiltered folder docs)
  const typeCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  const formatCounts: Record<string, number> = {};
  folderDocs.forEach(d => {
    typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
    statusCounts[d.statut] = (statusCounts[d.statut] || 0) + 1;
    formatCounts[d.format] = (formatCounts[d.format] || 0) + 1;
  });

  return (
    <div className="space-y-3">
      {/* Hero — Living Heroes V20 Data Room */}
      {showHeader && (
        <LivingHero
          blur1="bg-emerald-100/60" blur2="bg-teal-100/50"
          title="Vos docs, blindés ici."
          description="Classés, protégés, accessibles en 2 clics."
        >
          <div className="relative w-[340px] h-[150px] flex items-center justify-center">
            <div className="absolute right-[100px] top-[15px] w-[140px] h-[120px] bg-white border border-emerald-100 rounded-xl shadow-xl transform rotate-3 overflow-hidden p-4 text-[7px] text-slate-300 leading-tight" style={{fontFamily:'ui-monospace,monospace'}}>
              <div className="font-bold text-emerald-600 mb-2 border-b border-emerald-100 pb-1">CLASSIFIED_DATA</div>
              <div className="anim-binary">01001000 01101111<br/>01101100 01100100<br/><span className="text-emerald-400">█████ ENCRYPT</span></div>
              <div className="absolute w-[140%] h-[1.5px] bg-[#10b981] -left-4 anim-laser flex items-center justify-center z-50">
                <div className="absolute w-full h-[30px] bg-gradient-to-b from-[#10b981]/[0.15] to-transparent -top-[1px]" />
                <div className="w-[80%] h-full bg-[#34d399] shadow-[0_0_20px_#10b981]" />
              </div>
            </div>
            <div className="glass-intense absolute right-[30px] bottom-[20px] w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              <svg className="absolute w-20 h-20 text-emerald-400 anim-vault-out" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="20 10 5 10"/></svg>
              <svg className="absolute w-14 h-14 text-teal-500 anim-vault-in" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="40 20"/></svg>
              <div className="w-6 h-8 bg-white border-[3px] border-emerald-500 rounded-md relative flex items-center justify-center"><div className="w-1.5 h-3 bg-emerald-500 rounded-full" /></div>
            </div>
          </div>
        </LivingHero>
      )}
    <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
      {/* Sidebar — Navigation 12 départements (accordion) */}
      {(() => {
        const currentLabel = activeFolder === "_consolidee" ? "Vue d'ensemble"
          : activeFolder === "_templates" ? "Templates"
          : activeFolder === "_bot_rapports" ? "Rapports bots"
          : TRANSVERSAL_SECTIONS.find(ts => ts.id === activeFolder)?.label
          || activeSection?.label || "Data Room";
        const sidebarContent = (<>
        {/* Vue d'ensemble — disponible pour tous les départements */}
        <button
          onClick={() => { setActiveDept(botCode); setActiveFolder("_consolidee"); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
          className={cn(
            "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
            activeFolder === "_consolidee" ? SF.btnActive : SF.btnInactive
          )}
        >
          <div className="flex items-center gap-1.5">
            <Building2 className={cn("h-3.5 w-3.5 shrink-0", activeFolder === "_consolidee" ? "text-blue-500" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold flex-1", activeFolder === "_consolidee" ? "text-blue-700" : "text-gray-700")}>Vue d'ensemble</span>
            <span className="text-[9px] text-gray-400">{allDeptDocs.length > 0 ? allDeptDocs.length : ""}</span>
          </div>
        </button>

        {/* Rapports bots — fichiers produits automatiquement (T.3) */}
        <button
          onClick={() => { setActiveFolder("_bot_rapports"); setActiveDept(""); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
          className={cn(
            "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
            activeFolder === "_bot_rapports" ? SF.btnActive : SF.btnInactive
          )}
        >
          <div className="flex items-center gap-1.5">
            <Zap className={cn("h-3.5 w-3.5 shrink-0", activeFolder === "_bot_rapports" ? "text-blue-500" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold flex-1", activeFolder === "_bot_rapports" ? "text-blue-700" : "text-gray-700")}>Rapports bots</span>
            {botDocs.length > 0 && <span className="text-[9px] text-gray-400">{botDocs.length}</span>}
          </div>
        </button>

        <div className={SF.separator} />

        {/* Départements — CEOB: accordion 12 depts | Autre: dossiers du dept actif seulement */}
        {botCode === "CEOB" ? (
          /* CEOB = Direction: accordion 12 départements (poupée russe: voit tout) */
          Object.keys(DATA_ROOM_SECTIONS).map(deptCode => {
            const deptSections = DATA_ROOM_SECTIONS[deptCode] || [];
            const isExpanded = expandedDepts.has(deptCode);
            const isDeptActive = activeDept === deptCode;
            const totalDocs = deptSections.reduce((sum, s) => sum + s.documents.length, 0);
            return (
              <div key={deptCode}>
                <button
                  onClick={() => toggleDept(deptCode)}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                    isDeptActive && !isExpanded ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isExpanded ? "" : "-rotate-90", isDeptActive ? "text-blue-500" : "text-gray-300")} />
                    {(() => { const DIcon = DEPT_DASH_ICON[deptCode] || Zap; return <DIcon className={cn("h-3.5 w-3.5 shrink-0", isDeptActive ? "text-blue-500" : "text-gray-400")} />; })()}
                    <span className={cn("text-[10px] font-bold flex-1 leading-tight", isDeptActive ? "text-blue-700" : "text-gray-700")}>
                      {DEPT_LABELS[deptCode] || deptCode}
                    </span>
                    <span className="text-[9px] text-gray-400"></span>
                  </div>
                </button>
                {isExpanded && deptSections.map(s => {
                  const isActive = activeDept === deptCode && activeFolder === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => selectDeptFolder(deptCode, s.id)}
                      className={cn(
                        "w-full pl-6 pr-2.5 py-1 rounded-lg text-left transition-all cursor-pointer",
                        isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <FolderOpen className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                        <span className={cn("text-[10px] font-medium flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-600")}>
                          {s.label}
                        </span>
                        <span className="text-[9px] text-gray-400"></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })
        ) : (
          /* Autre département = dossiers du département actif seulement (scopé) */
          (DATA_ROOM_SECTIONS[botCode] || []).map(s => {
            const isActive = activeFolder === s.id;
            return (
              <button
                key={s.id}
                onClick={() => selectDeptFolder(botCode, s.id)}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <FolderOpen className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-medium flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-600")}>
                    {s.label}
                  </span>
                  <span className="text-[9px] text-gray-400">{s.documents.length}</span>
                </div>
              </button>
            );
          })
        )}

        {/* Separator */}
        <div className={SF.separator} />

        {/* Sections dossiers */}
        <div className="px-2.5 py-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dossiers</span>
        </div>
        {TRANSVERSAL_SECTIONS.map(ts => {
          const isActive = activeFolder === ts.id;
          const TsIcon = ts.icon;
          return (
            <button
              key={ts.id}
              onClick={() => { setActiveFolder(ts.id); setActiveDept(""); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
              className={cn(
                "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-1.5">
                <TsIcon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-[10px] font-bold flex-1", isActive ? "text-blue-700" : "text-gray-700")}>{ts.label}</span>
              </div>
            </button>
          );
        })}

        {/* Separator */}
        <div className={SF.separator} />

        {/* Templates */}
        <button
          onClick={() => { setActiveFolder("_templates"); setActiveDept(""); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
          className={cn(
            "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
            activeFolder === "_templates" ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Layers className={cn("h-3.5 w-3.5 shrink-0", activeFolder === "_templates" ? "text-blue-500" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold flex-1", activeFolder === "_templates" ? "text-blue-700" : "text-gray-700")}>Templates</span>
            <span className="text-[9px] text-gray-400">{templates.length}</span>
          </div>
        </button>
      </>);
        return isMobile ? (
          <MobileSidebarSheet currentLabel={currentLabel} itemCount={sections.length + TRANSVERSAL_SECTIONS.length + 1}>
            {sidebarContent}
          </MobileSidebarSheet>
        ) : (
          <div className="w-[180px] shrink-0 space-y-0.5">
            {sidebarContent}
          </div>
        );
      })()}

      {/* Contenu — full height */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* ── Rectangle bleu pastel — titre sous-section active ── */}
        {(isFolderView || activeFolder === "_templates" || activeFolder === "_bot_rapports" || TRANSVERSAL_SECTIONS.some(ts => ts.id === activeFolder)) && (
          <div className={cn("bg-gradient-to-r rounded-lg px-4 py-2.5 flex items-center gap-3", headerGradient)}>
            <Database className="h-5 w-5 text-white" />
            <h2 className="text-sm font-bold text-white">
              {activeFolder === "_templates" ? "Templates" : activeFolder === "_bot_rapports" ? "Rapports bots" : TRANSVERSAL_SECTIONS.find(ts => ts.id === activeFolder)?.label || activeSection?.label || ""}
            </h2>
          </div>
        )}

        {/* ── Toolbar — SF standard ── */}
        {(isFolderView || activeFolder === "_templates") && (
          <div className={SF.toolbarWrap}>
            <div className={SF.searchWrap}>
              <Search className={SF.searchIcon} />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className={SF.searchInput} />
            </div>
            <span className={SF.itemCount}>{isFolderView ? `${filteredDocs.length} items` : ""}</span>
            {/* Sort dropdown (pattern DocumentsUnifie) */}
            <div className="relative">
              <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <Filter className="h-3.5 w-3.5" />
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                  {DR_SORT_OPTIONS.map(o => (
                    <button key={o.field} onClick={() => { if (sortField === o.field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(o.field); setSortDir("asc"); } setShowSort(false); }}
                      className={cn("w-full text-left px-3 py-1.5 text-[9px] font-medium hover:bg-gray-50 transition-colors cursor-pointer", sortField === o.field ? "text-blue-600 bg-blue-50" : "text-gray-600")}>
                      {o.label} {sortField === o.field && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* + Nouveau (pattern SharePoint) */}
            <button className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Nouveau
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shrink-0 cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> Importer
            </button>
            {/* Vue mode compact toggle (pattern DocumentsUnifie) */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {([["list", LayoutList], ["cards", LayoutGrid], ["table", Table2]] as [DataRoomViewMode, React.ElementType][]).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filter pills (simplifie — Statut + Type + Format — pattern DocumentsUnifie) ── */}
        {isFolderView && activeSection && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Statut */}
            <div className="flex items-center gap-1.5">
              {Object.entries(STATUT_BADGE).filter(([k]) => statusCounts[k]).map(([k, v]) => (
                <button key={k} onClick={() => setStatusFilter(statusFilter === k ? null : k)}
                  className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                    statusFilter === k ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                  {v.label} ({statusCounts[k]})
                </button>
              ))}
            </div>
            {/* Type d'actif */}
            {Object.keys(typeCounts).length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-medium">Type:</span>
                {ASSET_TYPES.filter(at => typeCounts[at.docType]).map(at => (
                  <button key={at.id} onClick={() => setTypeFilter(typeFilter === at.docType ? null : at.docType)}
                    className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                      typeFilter === at.docType ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                    {at.label} ({typeCounts[at.docType]})
                  </button>
                ))}
              </div>
            )}
            {/* Format */}
            {Object.keys(formatCounts).length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-medium">Format:</span>
                {Object.entries(FORMAT_BADGE).filter(([k]) => formatCounts[k]).map(([k, v]) => (
                  <button key={k} onClick={() => setFormatFilter(formatFilter === k ? null : k)}
                    className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                      formatFilter === k ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                    {v.label} ({formatCounts[k]})
                  </button>
                ))}
              </div>
            )}
            {(typeFilter || formatFilter || statusFilter) && (
              <button onClick={() => { setTypeFilter(null); setFormatFilter(null); setStatusFilter(null); }} className="text-[9px] text-gray-400 hover:text-gray-600 cursor-pointer underline">Effacer filtres</button>
            )}
          </div>
        )}

        {/* Content */}
        {activeFolder === "_consolidee" && botCode === "CEOB" ? (
          <DataRoomVueConsolidee onNavigateDept={(code) => {
            const deptSections = DATA_ROOM_SECTIONS[code];
            if (deptSections && deptSections.length > 0) selectDeptFolder(code, deptSections[0].id);
          }} />
        ) : activeFolder === "_consolidee" ? (
          /* Vue d'ensemble département (non-CEOB) — grille des catégories avec compteurs */
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              {(() => { const DIcon = DEPT_DASH_ICON[botCode] || Database; return <DIcon className="h-4 w-4 text-blue-600" />; })()}
              <span className="text-xs font-bold text-gray-800">Données — {DEPT_SHORT_LABEL[botCode] || botCode}</span>
              <span className="text-[9px] text-gray-400">{sections.length} dossiers{allDeptDocs.length > 0 ? ` · ${allDeptDocs.length} document${allDeptDocs.length > 1 ? "s" : ""}` : ""}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(DATA_ROOM_SECTIONS[botCode] || []).map(cat => {
                const CatIcon = cat.icon;
                return (
                  <div key={cat.id}
                    onClick={() => selectDeptFolder(botCode, cat.id)}
                    className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <CatIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900 flex-1 truncate">{cat.label}</span>
                    </div>
                    <div className="px-4 py-3 space-y-1.5">
                      <p className="text-[9px] text-gray-500">Volume estimé : {cat.volume}</p>
                      {allDeptDocs.length > 0 ? (
                        <span className="text-[9px] text-emerald-600 font-medium">{allDeptDocs.length} document{allDeptDocs.length > 1 ? "s" : ""}</span>
                      ) : (
                        <span className="text-[9px] text-gray-300">Aucun document importé</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeFolder === "_templates" ? (
          <DataRoomTemplatesList botCode={botCode} viewMode={viewMode} />
        ) : TRANSVERSAL_SECTIONS.some(ts => ts.id === activeFolder) ? (
          /* Dossiers sections */
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500">Regroupe les dossiers de tous les départements liés à cette catégorie.</p>
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-[10px] text-gray-400">Contenu à venir — cette section agrégera les documents transversaux.</p>
            </div>
          </div>
        ) : activeFolder === "_bot_rapports" ? (
          /* Rapports produits par les outils bots (T.3+T.4) */
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-800">Rapports générés par les bots</span>
              <span className="text-[9px] text-gray-400">{botRapportsDocs.length} fichier{botRapportsDocs.length !== 1 ? "s" : ""}</span>
            </div>
            {botRapportsDocs.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center">
                <Zap className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-[10px] text-gray-400 font-medium">Aucun rapport généré pour l'instant</p>
                <p className="text-[9px] text-gray-300 mt-1">Les bots produisent des fichiers automatiquement quand vous utilisez leurs outils.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {botRapportsDocs.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
                    <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-800 truncate">{doc.titre}</p>
                      <p className="text-[9px] text-gray-400">{doc.createur} · {doc.modifie}</p>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium shrink-0">{doc.format}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Connexion Google Drive (réelle) ── */}
            {driveConnected ? (
              <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-bold text-emerald-700">Google Drive connecté</span>
                  </div>
                  <button
                    onClick={() => { setDriveConnected(false); setShowDriveSetup(true); }}
                    className="text-[9px] text-gray-400 hover:text-gray-600 cursor-pointer underline"
                  >
                    Changer
                  </button>
                </div>
                {driveFileCount !== null && (
                  <p className="text-[9px] text-emerald-600 mb-2">{driveFileCount} fichier{driveFileCount !== 1 ? "s" : ""} accessible{driveFileCount !== 1 ? "s" : ""}</p>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Database className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-700">Connecter votre Google Drive</span>
                </div>
                <p className="text-[9px] text-gray-400 mb-3">Partagez un dossier Drive avec Brain Team pour accéder à vos fichiers directement dans le chat.</p>

                {!showDriveSetup ? (
                  <button
                    onClick={() => setShowDriveSetup(true)}
                    className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    + Connecter mon Drive
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    {/* Étape 1 — partager avec l'email */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                      <p className="text-[9px] font-bold text-blue-700 mb-1">Étape 1 — Partagez votre dossier Drive avec :</p>
                      <div className="flex items-center gap-1.5">
                        <code className="text-[9px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded flex-1 truncate font-mono">
                          {driveShareEmail}
                        </code>
                        <button
                          onClick={handleCopyEmail}
                          className="shrink-0 text-[9px] px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          {emailCopied ? "Copié ✓" : "Copier"}
                        </button>
                      </div>
                    </div>

                    {/* Étape 2 — coller l'URL */}
                    <div>
                      <p className="text-[9px] font-bold text-gray-600 mb-1">Étape 2 — Collez l'URL ou l'ID du dossier :</p>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/drive/folders/1ABC..."
                        value={driveFolderInput}
                        onChange={e => { setDriveFolderInput(e.target.value); setDriveConnectStatus("idle"); setDriveConnectError(""); }}
                        className="w-full text-[9px] px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300"
                      />
                    </div>

                    {driveConnectError && (
                      <p className="text-[9px] text-red-500">{driveConnectError}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleDriveConnect}
                        disabled={driveConnectStatus === "loading" || !driveFolderInput.trim()}
                        className="flex-1 text-[9px] font-bold px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        {driveConnectStatus === "loading" ? "Vérification..." : "Connecter"}
                      </button>
                      <button
                        onClick={() => { setShowDriveSetup(false); setDriveConnectStatus("idle"); setDriveConnectError(""); setDriveFolderInput(""); }}
                        className="text-[9px] text-gray-400 hover:text-gray-600 px-2 cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isFolderView ? (
          <DataRoomAssetList documents={filteredDocs} viewMode={viewMode} sortField={sortField} sortDir={sortDir} onSort={(f) => { if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(f); setSortDir("asc"); } }} />
        ) : (
          <p className="text-xs text-gray-400 text-center py-8">Selectionnez un dossier</p>
        )}
      </div>
    </div>
    </div>
  );
}
