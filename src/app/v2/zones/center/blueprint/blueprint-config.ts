/**
 * blueprint-config.ts — Configuration Blueprint Vivant par département
 * Source: DeepSearch Mega-Prompt 1 (Blueprint × Taille) — 113 sources citées
 *
 * 12 départements × 6-11 sous-sections × 5 paliers de taille × 3 phases
 * Pertinence: C(ritique) I(mportant) O(ptionnel) H(idden) R(églementaire)
 * Seuils réglementaires Québec/Canada intégrés
 *
 * V2 — Enrichi avec TOUS les champs des "Champs par palier (Disclosure Progressive)"
 * du DeepSearch TAILLE (113 sources). Pertinence corrigée à 100%.
 */

import type { ProfilType } from "../diagnostic/diagnostic-questions";

// ── Types ──

export type SizeTier = "T1" | "T2" | "T3" | "T4" | "T5";
export type Pertinence = "C" | "I" | "O" | "H" | "R";
export type Phase = "startup" | "scaleup" | "exitup";

export interface SizeTierInfo {
  id: SizeTier;
  label: string;
  range: string;
  minEmployes: number;
  maxEmployes: number;
  description: string;
  deptsDebloques: number;
}

export const SIZE_TIERS: SizeTierInfo[] = [
  { id: "T1", label: "Solo", range: "1", minEmployes: 1, maxEmployes: 1, description: "Solopreneur, freelance, 'Moi Inc.'", deptsDebloques: 4 },
  { id: "T2", label: "Micro", range: "2-10", minEmployes: 2, maxEmployes: 10, description: "Équipe fondatrice, startup early", deptsDebloques: 6 },
  { id: "T3", label: "Petite", range: "11-50", minEmployes: 11, maxEmployes: 50, description: "PME structurée, premiers cadres", deptsDebloques: 9 },
  { id: "T4", label: "Moyenne", range: "51-200", minEmployes: 51, maxEmployes: 200, description: "PME en croissance, direction formelle", deptsDebloques: 12 },
  { id: "T5", label: "Grande", range: "200-500", minEmployes: 201, maxEmployes: 500, description: "Grande PME, préparation exit possible", deptsDebloques: 12 },
];

export const PHASES: { id: Phase; label: string; emoji: string }[] = [
  { id: "startup", label: "Startup", emoji: "🚀" },
  { id: "scaleup", label: "Scaleup", emoji: "📈" },
  { id: "exitup", label: "Exitup", emoji: "🏆" },
];

// ── Seuils réglementaires Québec/Canada ──

export interface RegulatoryThreshold {
  seuil: number;
  unite: "employes" | "ca_annuel";
  loi: string;
  obligation: string;
  deptsConcernes: string[];
  pertinence: Pertinence;
}

export const REGULATORY_THRESHOLDS: RegulatoryThreshold[] = [
  { seuil: 1, unite: "employes", loi: "CNESST — Loi SST", obligation: "Cotisation CNESST obligatoire dès le 1er employé", deptsConcernes: ["CPOB", "CHROB"], pertinence: "R" },
  { seuil: 5, unite: "employes", loi: "Normes du travail (LNT)", obligation: "Registre de paie, relevés d'emploi, T4/RL-1", deptsConcernes: ["CFOB", "CHROB"], pertinence: "R" },
  { seuil: 10, unite: "employes", loi: "Loi sur l'équité salariale (LÉS)", obligation: "Programme d'équité salariale obligatoire", deptsConcernes: ["CHROB", "CLOB"], pertinence: "R" },
  { seuil: 20, unite: "employes", loi: "LSST art. 68-86", obligation: "Comité SST obligatoire + programme de prévention", deptsConcernes: ["CPOB", "COOB"], pertinence: "R" },
  { seuil: 25, unite: "employes", loi: "Charte langue française (Loi 96)", obligation: "Comité de francisation OQLF", deptsConcernes: ["CHROB", "CLOB"], pertinence: "R" },
  { seuil: 25, unite: "employes", loi: "Charte langue française (Loi 96)", obligation: "Inscription OQLF et démarche de francisation obligatoire", deptsConcernes: ["CHROB", "CEOB"], pertinence: "R" },
  { seuil: 50, unite: "employes", loi: "Loi 25 (protection renseignements personnels)", obligation: "Responsable PRP + politique + EFVP", deptsConcernes: ["CLOB", "CISOB"], pertinence: "R" },
  { seuil: 50, unite: "employes", loi: "CNESST — Rapport annuel", obligation: "Déclaration CNESST obligatoire annuelle", deptsConcernes: ["CPOB"], pertinence: "R" },
  { seuil: 50, unite: "employes", loi: "Loi sur l'équité salariale", obligation: "Évaluation avec comité de représentation obligatoire", deptsConcernes: ["CHROB"], pertinence: "R" },
  { seuil: 100, unite: "employes", loi: "Recommandation gouvernance", obligation: "Gouvernance formelle recommandée, comité audit", deptsConcernes: ["CEOB", "CFOB"], pertinence: "I" },
  { seuil: 100, unite: "employes", loi: "Norme CAN/CSA-Z1003", obligation: "Norme santé psychologique recommandée", deptsConcernes: ["CHROB", "CPOB"], pertinence: "I" },
  { seuil: 100, unite: "employes", loi: "Charte langue française (art. 139.2)", obligation: "Comité de francisation obligatoire", deptsConcernes: ["CHROB", "CEOB"], pertinence: "R" },
  { seuil: 30000, unite: "ca_annuel", loi: "Loi sur la taxe de vente (TPS/TVQ)", obligation: "Inscription obligatoire TPS/TVQ", deptsConcernes: ["CFOB"], pertinence: "R" },
  { seuil: 1500000, unite: "ca_annuel", loi: "Loi TPS/TVQ", obligation: "Production mensuelle des déclarations de taxes", deptsConcernes: ["CFOB"], pertinence: "R" },
  { seuil: 2000000, unite: "ca_annuel", loi: "Loi favorisant le développement de la formation (Loi 90)", obligation: "Investir 1% de la masse salariale en formation", deptsConcernes: ["CHROB", "CPOB"], pertinence: "R" },
  { seuil: 10000000, unite: "ca_annuel", loi: "Loi C-97 (déclaration pays par pays)", obligation: "Déclarations fiscales bonifiées", deptsConcernes: ["CFOB", "CLOB"], pertinence: "R" },
];

// ── Interfaces config ──

export interface FieldDef {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date" | "currency" | "percentage" | "list" | "json";
  placeholder?: string;
  options?: string[];
  tier: SizeTier; // tier minimum pour afficher ce champ
  required?: boolean;
}

export interface KPIDef {
  id: string;
  label: string;
  formule?: string;
  benchmark?: string;
  seuils: { vert: number; jaune: number; rouge: number };
  tier: SizeTier;
  unite: string;
}

export interface SubSectionDef {
  id: string;
  label: string;
  description: string;
  intro?: string; // Texte d'intro contextuel (tiré du DeepSearch)
  icon: string; // nom lucide icon
  pertinence: Record<SizeTier, Pertinence>;
  fields: FieldDef[];
  kpis: KPIDef[];
  templates?: string[]; // IDs templates liés
  playbooks?: string[]; // IDs playbooks liés
}

export interface DeptBlueprintConfig {
  botCode: string;
  deptLabel: string;
  intro: string; // Intro du département (texte DeepSearch)
  subSections: SubSectionDef[];
}

// ── Helper functions ──

export function getSizeTier(nbEmployes: number): SizeTier {
  if (nbEmployes <= 1) return "T1";
  if (nbEmployes <= 10) return "T2";
  if (nbEmployes <= 50) return "T3";
  if (nbEmployes <= 200) return "T4";
  return "T5";
}

const TIER_ORDER: SizeTier[] = ["T1", "T2", "T3", "T4", "T5"];

export function isVisible(pertinence: Pertinence): boolean {
  return pertinence !== "H";
}

export function isCritical(pertinence: Pertinence): boolean {
  return pertinence === "C" || pertinence === "R";
}

export function getVisibleSubSections(config: DeptBlueprintConfig, tier: SizeTier): SubSectionDef[] {
  return config.subSections.filter(s => isVisible(s.pertinence[tier]));
}

export function getFieldsForTier(fields: FieldDef[], tier: SizeTier): FieldDef[] {
  const tierIdx = TIER_ORDER.indexOf(tier);
  return fields.filter(f => TIER_ORDER.indexOf(f.tier) <= tierIdx);
}

export function getApplicableThresholds(nbEmployes: number, caAnnuel?: number): RegulatoryThreshold[] {
  return REGULATORY_THRESHOLDS.filter(t => {
    if (t.unite === "employes") return nbEmployes >= t.seuil;
    if (t.unite === "ca_annuel" && caAnnuel) return caAnnuel >= t.seuil;
    return false;
  });
}

// ── CEOB — CarlOS — Direction (CEO) ──

const CEOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CEOB",
  deptLabel: "Direction",
  intro: "Le département de la Direction est le chef d'orchestre de votre entreprise. Il consolide votre vision stratégique, votre structure corporative et la gestion de vos risques. C'est ici que se dessine le portrait complet de qui vous êtes, où vous allez, et comment vous y arriverez — votre plan d'affaires vivant.",
  subSections: [
    {
      id: "sommaire_executif",
      label: "Sommaire Exécutif",
      description: "Résumé exécutif de l'entreprise — le pitch en 1 page",
      icon: "FileText",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "elevator_pitch", label: "Pitch en 30 secondes", type: "textarea", tier: "T1", required: true },
        { id: "resume_executif", label: "Résumé exécutif (1 page)", type: "textarea", tier: "T1" },
        { id: "proposition_valeur_unique", label: "Proposition de valeur unique", type: "textarea", tier: "T1", required: true },
        { id: "probleme_resolu", label: "Problème résolu pour le client", type: "textarea", tier: "T1" },
        { id: "solution_offerte", label: "Solution offerte", type: "textarea", tier: "T1" },
        { id: "modele_affaires_resume", label: "Modèle d'affaires en 1 paragraphe", type: "textarea", tier: "T2" },
        { id: "marche_cible_resume", label: "Marché cible en 1 paragraphe", type: "textarea", tier: "T2" },
        { id: "avantage_concurrentiel_resume", label: "Avantage concurrentiel clé", type: "textarea", tier: "T2" },
        { id: "objectif_12mois", label: "Objectif principal 12 mois", type: "textarea", tier: "T1" },
        { id: "besoin_financement", label: "Besoin de financement", type: "currency", tier: "T3" },
      ],
      kpis: [],
      templates: ["elevator-pitch", "sommaire-executif"],
    },
    {
      id: "profil_public",
      label: "Profil Public (Orbit9)",
      description: "Informations publiques — visible sur le réseau Orbit9",
      icon: "Globe",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "logo_url", label: "URL du logo", type: "text", tier: "T1" },
        { id: "couleurs_marque", label: "Couleurs de marque (hex)", type: "text", tier: "T1" },
        { id: "slogan", label: "Slogan / Tagline", type: "text", tier: "T1" },
        { id: "description_courte", label: "Description courte (150 caractères)", type: "textarea", tier: "T1", required: true },
        { id: "description_longue", label: "Description longue (500 caractères)", type: "textarea", tier: "T2" },
        { id: "photos_entreprise", label: "Photos de l'entreprise (URLs)", type: "list", tier: "T2" },
        { id: "lien_linkedin", label: "LinkedIn", type: "text", tier: "T1" },
        { id: "lien_facebook", label: "Facebook", type: "text", tier: "T1" },
        { id: "lien_instagram", label: "Instagram", type: "text", tier: "T2" },
        { id: "lien_google_business", label: "Google Business", type: "text", tier: "T2" },
        { id: "lien_youtube", label: "YouTube", type: "text", tier: "T2" },
        { id: "media_kit_url", label: "URL du média kit", type: "text", tier: "T3" },
        { id: "certifications_publiques", label: "Certifications affichées (ISO, B Corp)", type: "list", tier: "T3" },
        { id: "note_reputation", label: "Note de réputation (avis Google)", type: "number", tier: "T3" },
        { id: "badges_orbit9", label: "Badges Orbit9 obtenus", type: "list", tier: "T3" },
      ],
      kpis: [],
      templates: ["profil-entreprise"],
    },
    {
      id: "equipe_direction",
      label: "Équipe de Direction",
      description: "Fondateurs, dirigeants, conseillers, actionnariat de l'équipe",
      icon: "Users",
      pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "fondateurs", label: "Fondateurs (nom, rôle, % équité)", type: "json", tier: "T1" },
        { id: "equipe_direction", label: "Équipe de direction (C-Level)", type: "json", tier: "T2" },
        { id: "nb_cofondateurs", label: "Nombre de co-fondateurs", type: "number", tier: "T1" },
        { id: "biographies_cles", label: "Biographies clés", type: "json", tier: "T2" },
        { id: "conseillers_externes", label: "Conseillers externes", type: "json", tier: "T3" },
        { id: "mentor_board", label: "Advisory Board / Mentors", type: "json", tier: "T3" },
        { id: "lacunes_equipe", label: "Lacunes à combler dans l'équipe", type: "list", tier: "T2" },
        { id: "plan_embauche_direction", label: "Plan d'embauche direction (12 mois)", type: "json", tier: "T3" },
      ],
      kpis: [],
      templates: ["organigramme-direction"],
    },
    {
      id: "produits_services",
      label: "Produits & Services",
      description: "Catalogue complet, tarification, cycle de vie, parts de revenus",
      icon: "Package",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "catalogue_produits", label: "Catalogue produits/services", type: "json", tier: "T1", required: true },
        { id: "produit_phare", label: "Produit/service phare", type: "text", tier: "T1" },
        { id: "repartition_revenus", label: "Répartition revenus par produit/service (%)", type: "json", tier: "T2" },
        { id: "tarification", label: "Grille de tarification", type: "json", tier: "T1" },
        { id: "cycle_vie_produits", label: "Cycle de vie par produit", type: "json", tier: "T3" },
        { id: "pipeline_nouveaux_produits", label: "Pipeline nouveaux produits", type: "json", tier: "T3" },
        { id: "taux_retention_produit", label: "Taux de rétention par produit (%)", type: "percentage", tier: "T3" },
        { id: "marge_par_produit", label: "Marge brute par produit (%)", type: "json", tier: "T3" },
        { id: "nb_clients_actifs", label: "Nombre de clients actifs", type: "number", tier: "T2" },
        { id: "revenu_par_client", label: "Revenu moyen par client", type: "currency", tier: "T2" },
        { id: "nrr", label: "Net Revenue Retention (%)", type: "percentage", tier: "T3" },
      ],
      kpis: [],
      templates: ["fiche-produit", "catalogue-entreprise"],
    },
    {
      id: "description_historique",
      label: "Description & Historique",
      description: "Histoire de l'entreprise, jalons majeurs, réalisations clés",
      icon: "BookOpen",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "description_entreprise", label: "Description complète de l'entreprise", type: "textarea", tier: "T1" },
        { id: "historique", label: "Historique et parcours", type: "textarea", tier: "T2" },
        { id: "jalons_majeurs", label: "Jalons majeurs (année + événement)", type: "json", tier: "T2" },
        { id: "realisations_cles", label: "Réalisations clés", type: "list", tier: "T2" },
        { id: "prix_reconnaissances", label: "Prix et reconnaissances", type: "list", tier: "T3" },
        { id: "couverture_mediatique", label: "Couverture médiatique notable", type: "list", tier: "T4" },
      ],
      kpis: [],
      templates: ["profil-entreprise"],
    },
    {
      id: "profil",
      label: "Profil entreprise",
      description: "Identité, industrie, mission, vision, valeurs",
      icon: "Building2",
      pertinence: { T1: "C", T2: "C", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "nom", label: "Nom de l'entreprise", type: "text", tier: "T1", required: true },
        { id: "industrie", label: "Industrie / Secteur", type: "select", options: ["Manufacturier", "Fabricant équipements", "Développeur logiciel", "Intégrateur", "Distributeur", "Organisation"], tier: "T1", required: true },
        { id: "sous_secteur", label: "Sous-secteur", type: "text", tier: "T1" },
        { id: "nb_employes", label: "Nombre d'employés", type: "number", tier: "T1", required: true },
        { id: "annee_fondation", label: "Année de fondation", type: "number", tier: "T1" },
        { id: "localisation", label: "Localisation", type: "text", tier: "T1" },
        { id: "site_web", label: "Site web", type: "text", tier: "T1" },
        { id: "mission", label: "Mission", type: "textarea", placeholder: "Pourquoi l'entreprise existe", tier: "T1", required: true },
        { id: "vision", label: "Vision", type: "textarea", placeholder: "Où l'entreprise veut être dans 5-10 ans", tier: "T1" },
        { id: "valeurs", label: "Valeurs", type: "list", tier: "T1" },
        { id: "chiffre_affaires", label: "Chiffre d'affaires annuel", type: "currency", tier: "T2" },
        { id: "structure_juridique", label: "Structure juridique", type: "select", options: ["Enr.", "Inc. (CBCA)", "Inc. (LSA-QC)", "SENC", "OBNL", "Coop"], tier: "T2" },
        { id: "code_scian", label: "Code SCIAN (industrie)", type: "text", tier: "T1" },
        { id: "telephone", label: "Téléphone principal", type: "text", tier: "T1" },
        { id: "courriel", label: "Courriel principal", type: "text", tier: "T1" },
        { id: "adresse_complete", label: "Adresse complète", type: "textarea", tier: "T1" },
        { id: "nom_legal", label: "Nom légal", type: "text", tier: "T2" },
        { id: "neq", label: "Numéro d'entreprise du Québec (NEQ)", type: "text", tier: "T2" },
        { id: "registre_beneficiaires", label: "Registre des bénéficiaires ultimes", type: "json", tier: "T4" },
      ],
      kpis: [],
      templates: ["profil-entreprise", "elevator-pitch"],
    },
    {
      id: "swot",
      label: "SWOT",
      description: "Forces, faiblesses, opportunités, menaces",
      icon: "Target",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "forces", label: "Forces (Strengths)", type: "list", tier: "T1" },
        { id: "faiblesses", label: "Faiblesses (Weaknesses)", type: "list", tier: "T1" },
        { id: "opportunites", label: "Opportunités", type: "list", tier: "T1" },
        { id: "menaces", label: "Menaces", type: "list", tier: "T1" },
        { id: "actions_prioritaires", label: "Actions prioritaires (croisement SWOT)", type: "list", tier: "T3" },
      ],
      kpis: [],
      templates: ["analyse-swot"],
    },
    {
      id: "bmc",
      label: "BMC",
      description: "Business Model Canvas — 9 blocs",
      icon: "Layers",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "segments_clients", label: "Segments de clientèle", type: "list", tier: "T1", required: true },
        { id: "proposition_valeur", label: "Proposition de valeur", type: "textarea", tier: "T1", required: true },
        { id: "canaux", label: "Canaux", type: "list", tier: "T1" },
        { id: "relations_clients", label: "Relations clients", type: "list", tier: "T2" },
        { id: "flux_revenus", label: "Flux de revenus", type: "list", tier: "T1", required: true },
        { id: "ressources_cles", label: "Ressources clés", type: "list", tier: "T2" },
        { id: "activites_cles", label: "Activités clés", type: "list", tier: "T2" },
        { id: "partenaires_cles", label: "Partenaires clés", type: "list", tier: "T2" },
        { id: "structure_couts", label: "Structure de coûts", type: "list", tier: "T1" },
      ],
      kpis: [],
      templates: ["business-model-canvas"],
    },
    {
      id: "objectifs_vitaa",
      label: "Objectifs VITAA",
      description: "5 piliers stratégiques — Vente, Idée, Temps, Argent, Actif",
      icon: "Rocket",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "score_vente", label: "Score Vente (0-100)", type: "number", tier: "T1" },
        { id: "score_idee", label: "Score Idée (0-100)", type: "number", tier: "T1" },
        { id: "score_temps", label: "Score Temps (0-100)", type: "number", tier: "T1" },
        { id: "score_argent", label: "Score Argent (0-100)", type: "number", tier: "T1" },
        { id: "score_actif", label: "Score Actif (0-100)", type: "number", tier: "T1" },
        { id: "objectif_12mois", label: "Objectif principal 12 mois", type: "textarea", tier: "T1" },
        { id: "objectifs_okr", label: "OKRs trimestriels", type: "json", tier: "T3" },
        { id: "objectifs_90jours", label: "Objectifs 90 jours (T1 survie)", type: "textarea", tier: "T1", required: true },
        { id: "horizon_3_5ans", label: "Plan stratégique 3-5 ans", type: "textarea", tier: "T3" },
      ],
      kpis: [
        { id: "vitaa_global", label: "Score VITAA Global", formule: "moyenne(V,I,T,A,A)", benchmark: "65/100", seuils: { vert: 70, jaune: 50, rouge: 30 }, tier: "T1", unite: "/100" },
        { id: "execution_strategique", label: "Exécution stratégique", formule: "OKRs atteints / OKRs planifiés", benchmark: "70%", seuils: { vert: 70, jaune: 50, rouge: 30 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "finances",
      label: "Finances",
      description: "Horizons financiers, avantages concurrentiels, revenus",
      icon: "DollarSign",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "revenus_annuels", label: "Revenus annuels", type: "currency", tier: "T1" },
        { id: "marge_brute", label: "Marge brute (%)", type: "percentage", tier: "T2" },
        { id: "ebitda", label: "EBITDA", type: "currency", tier: "T3" },
        { id: "horizon_1an", label: "Horizon 1 an — objectif CA", type: "currency", tier: "T1" },
        { id: "horizon_3ans", label: "Horizon 3 ans — objectif CA", type: "currency", tier: "T2" },
        { id: "horizon_5ans", label: "Horizon 5 ans — objectif CA", type: "currency", tier: "T3" },
        { id: "avantages_concurrentiels", label: "Avantages concurrentiels", type: "list", tier: "T2" },
      ],
      kpis: [
        { id: "croissance_ca", label: "Croissance CA", formule: "(CA_N - CA_N-1) / CA_N-1", benchmark: "15-25%", seuils: { vert: 15, jaune: 5, rouge: 0 }, tier: "T2", unite: "%" },
      ],
    },
    {
      id: "gouvernance",
      label: "Gouvernance",
      description: "Entité légale, actionnariat, CA, pacte d'actionnaires",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "R" },
      fields: [
        { id: "entite_legale", label: "Type d'entité légale", type: "select", options: ["Inc. fédérale", "Inc. provinciale QC", "SENC", "Enr.", "OBNL", "Coop"], tier: "T2" },
        { id: "neq", label: "NEQ", type: "text", tier: "T2" },
        { id: "actionnaires", label: "Actionnaires et %", type: "json", tier: "T3" },
        { id: "convention_actionnaires", label: "Convention d'actionnaires", type: "select", options: ["Oui — à jour", "Oui — désuète", "Non"], tier: "T3" },
        { id: "ca_membres", label: "Membres du CA", type: "json", tier: "T4" },
        { id: "comites", label: "Comités (audit, gouvernance, RH)", type: "list", tier: "T4" },
        { id: "type_conseil", label: "Type de conseil", type: "select", options: ["Consultatif", "Administration", "Aucun"], tier: "T3" },
        { id: "administrateurs_independants", label: "Administrateurs indépendants", type: "json", tier: "T4" },
        { id: "registre_risques_corporatifs", label: "Registre des risques corporatifs", type: "json", tier: "T4" },
        { id: "code_ethique_formel", label: "Code d'éthique formel", type: "select", options: ["Oui", "Non"], tier: "T4" },
      ],
      kpis: [],
      templates: ["convention-actionnaires", "charte-ca"],
    },
    {
      id: "risques_sortie",
      label: "Risques & Sortie",
      description: "Matrice risques, PCA, exit strategy, valorisation",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "matrice_risques", label: "Risques identifiés (probabilité × impact)", type: "json", tier: "T3" },
        { id: "pca", label: "Plan de continuité des affaires", type: "select", options: ["Complet", "Partiel", "Absent"], tier: "T3" },
        { id: "exit_strategy", label: "Stratégie de sortie", type: "select", options: ["Vente stratégique", "MBO", "IPO", "Succession familiale", "Liquidation ordonnée", "Pas définie"], tier: "T4" },
        { id: "valorisation_estimee", label: "Valorisation estimée", type: "currency", tier: "T4" },
        { id: "multiple_ebitda", label: "Multiple EBITDA cible", type: "number", tier: "T5" },
        { id: "plan_releve_fichier", label: "Plan de relève (fichier)", type: "text", tier: "T4" },
        { id: "data_room", label: "Data Room", type: "select", options: ["Complète", "Partielle", "Absente"], tier: "T5" },
        { id: "vehicule_sortie", label: "Véhicule de sortie visé", type: "select", options: ["IPO", "M&A", "MBO", "Relève familiale", "Pas défini"], tier: "T5" },
      ],
      kpis: [],
      templates: ["plan-continuite-affaires", "data-room-checklist"],
    },
    {
      id: "culture_esg",
      label: "Culture & ESG",
      description: "Éthique, empreinte carbone, DEI, certifications",
      icon: "Compass",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "R" },
      fields: [
        { id: "code_ethique", label: "Code d'éthique", type: "select", options: ["Formel", "Informel", "Absent"], tier: "T3" },
        { id: "politique_dei", label: "Politique DEI", type: "select", options: ["Formelle", "Informelle", "Absente"], tier: "T4" },
        { id: "bilan_carbone", label: "Bilan carbone (tonnes CO2e)", type: "number", tier: "T4" },
        { id: "certifications_esg", label: "Certifications ESG", type: "list", tier: "T5" },
        { id: "rapport_esg_public", label: "Rapport ESG public", type: "select", options: ["Oui", "Non"], tier: "T5" },
        { id: "certification_bcorp", label: "Certification B Corp", type: "select", options: ["Certifié", "En cours", "Non"], tier: "T4" },
        { id: "score_ecovadis", label: "Score EcoVadis", type: "number", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "vue_consolidee",
      label: "Vue consolidée",
      description: "Agrégation des 11 départements, alertes, gaps prioritaires",
      icon: "Layers",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "score_global", label: "Score Santé Global", formule: "moyenne pondérée 12 depts", benchmark: "70/100", seuils: { vert: 70, jaune: 50, rouge: 30 }, tier: "T2", unite: "/100" },
        { id: "nb_gaps_critiques", label: "Gaps critiques", formule: "sections C vides", benchmark: "0", seuils: { vert: 0, jaune: 3, rouge: 5 }, tier: "T2", unite: "" },
      ],
    },
    {
      id: "kpis_direction",
      label: "KPIs Direction",
      description: "VITAA Global, exécution stratégique, croissance CA",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "vitaa_global_kpi", label: "VITAA Global", formule: "moyenne(V,I,T,A,A)", benchmark: "65+", seuils: { vert: 65, jaune: 45, rouge: 25 }, tier: "T1", unite: "/100" },
        { id: "croissance_ca_kpi", label: "Croissance CA YoY", formule: "(CA_N - CA_N-1) / CA_N-1 × 100", benchmark: "15-25%", seuils: { vert: 15, jaune: 5, rouge: 0 }, tier: "T2", unite: "%" },
        { id: "nps", label: "NPS", formule: "% promoteurs - % détracteurs", benchmark: "50+", seuils: { vert: 50, jaune: 20, rouge: 0 }, tier: "T3", unite: "" },
        { id: "score_gouvernance", label: "Score de Gouvernance", formule: "présence politiques formelles", benchmark: "80/100", seuils: { vert: 80, jaune: 50, rouge: 20 }, tier: "T3", unite: "/100" },
        { id: "taux_atteinte_okr", label: "Taux d'atteinte OKR", formule: "OKR atteints / OKR totaux × 100", benchmark: "70%", seuils: { vert: 70, jaune: 50, rouge: 30 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "playbooks_direction",
      label: "Playbooks",
      description: "Playbooks stratégiques par phase",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["plan-strategique-3-5ans", "preparation-ca", "due-diligence-vendeur"],
    },
  ],
};

// ── CTOB — Tim — Technologie (CTO) ──

const CTOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CTOB",
  deptLabel: "Technologie",
  intro: "La maturité technologique est un vecteur de différenciation critique pour les PME québécoises. Ce département cartographie votre pile technologique, votre dette technique et votre feuille de route numérique. De la simple liste d'outils SaaS à l'architecture d'entreprise complète, votre infrastructure IT évolue avec votre croissance.",
  subSections: [
    {
      id: "stack_technique",
      label: "Stack Technique",
      description: "Langages, BDD, cloud, outils DevOps",
      icon: "Layers",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "langages", label: "Langages principaux", type: "list", tier: "T1" },
        { id: "frameworks", label: "Frameworks", type: "list", tier: "T2" },
        { id: "bases_donnees", label: "Bases de données", type: "list", tier: "T1" },
        { id: "cloud_provider", label: "Cloud / Hébergement", type: "select", options: ["AWS", "Azure", "GCP", "OVH", "On-premise", "Hybride", "Autre"], tier: "T2" },
        { id: "outils_devops", label: "Outils DevOps / CI/CD", type: "list", tier: "T3" },
        { id: "outils_base", label: "Outils de base (CRM, Comptabilité, Communication)", type: "list", tier: "T1" },
        { id: "nom_domaine", label: "Nom de domaine", type: "text", tier: "T2" },
        { id: "fournisseur_hebergement", label: "Fournisseur d'hébergement", type: "text", tier: "T2" },
        { id: "gestionnaire_mdp", label: "Gestionnaire de mots de passe", type: "text", tier: "T2" },
        { id: "outils_automatisation", label: "Outils d'automatisation (Zapier/Make)", type: "list", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "dette_technique",
      label: "Dette Technique",
      description: "Registre composants à refactoriser",
      icon: "ListChecks",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "composants_critiques", label: "Composants à refactoriser", type: "json", tier: "T2" },
        { id: "score_dette", label: "Score dette (1-10)", type: "number", tier: "T3" },
        { id: "plan_remediation", label: "Plan de remédiation", type: "textarea", tier: "T3" },
        { id: "backlog_dette", label: "Backlog de la dette technique", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "roadmap_tech",
      label: "Roadmap Tech",
      description: "Gantt déploiements, jalons techniques",
      icon: "TrendingUp",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "jalons_q1", label: "Jalons Q1", type: "list", tier: "T2" },
        { id: "jalons_q2", label: "Jalons Q2", type: "list", tier: "T2" },
        { id: "jalons_q3", label: "Jalons Q3", type: "list", tier: "T3" },
        { id: "jalons_q4", label: "Jalons Q4", type: "list", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "architecture_si",
      label: "Architecture SI",
      description: "CRM, ERP, SIRH, intégrations",
      icon: "Building2",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "crm", label: "CRM", type: "text", tier: "T2" },
        { id: "erp", label: "ERP / MRP", type: "text", tier: "T3" },
        { id: "sirh", label: "SIRH", type: "text", tier: "T3" },
        { id: "integrations", label: "Intégrations actives", type: "json", tier: "T3" },
        { id: "diagramme_architecture", label: "Diagramme d'architecture SI (fichier)", type: "text", tier: "T4" },
        { id: "fournisseur_cloud_principal", label: "Fournisseur Cloud principal", type: "text", tier: "T4" },
        { id: "procedures_cicd", label: "Procédures CI/CD", type: "select", options: ["Automatisé", "Manuel", "Absent"], tier: "T4" },
        { id: "audit_code_date", label: "Dernier audit de code", type: "date", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      description: "Serveurs, monitoring, coûts, SLA",
      icon: "Shield",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "serveurs", label: "Serveurs / VMs", type: "json", tier: "T2" },
        { id: "monitoring", label: "Monitoring", type: "text", tier: "T3" },
        { id: "cout_mensuel", label: "Coût infra mensuel", type: "currency", tier: "T2" },
        { id: "sla_cible", label: "SLA cible (%)", type: "percentage", tier: "T3" },
        { id: "topologie_reseau", label: "Topologie réseau (fichier)", type: "text", tier: "T5" },
        { id: "certifications_infra", label: "Certifications d'infrastructure (SOC 2, ISO 27001)", type: "list", tier: "T5" },
        { id: "cartographie_mdm", label: "Cartographie MDM (Master Data Management)", type: "text", tier: "T5" },
      ],
      kpis: [
        { id: "uptime", label: "Uptime", formule: "heures_up / heures_totales × 100", benchmark: "99.5%", seuils: { vert: 99, jaune: 95, rouge: 90 }, tier: "T2", unite: "%" },
      ],
    },
    {
      id: "securite_applicative",
      label: "Sécurité Applicative",
      description: "DevSecOps, OWASP, pen tests",
      icon: "Shield",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "dernier_pentest", label: "Dernier pen test", type: "date", tier: "T3" },
        { id: "owasp_top10", label: "OWASP Top 10 couvert", type: "select", options: ["Oui", "Partiellement", "Non"], tier: "T3" },
        { id: "devsecops", label: "Pipeline DevSecOps", type: "select", options: ["Automatisé", "Manuel", "Absent"], tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "kpis_tech",
      label: "KPIs Tech",
      description: "Uptime, MTTR, coût par client",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "uptime_kpi", label: "Uptime", formule: "heures_up / heures_totales × 100", benchmark: "99.5%", seuils: { vert: 99, jaune: 95, rouge: 90 }, tier: "T2", unite: "%" },
        { id: "mttr", label: "MTTR", formule: "temps_moyen_restauration", benchmark: "<4h", seuils: { vert: 4, jaune: 12, rouge: 24 }, tier: "T3", unite: "h" },
        { id: "cout_par_client", label: "Coût infra / client", formule: "cout_total_infra / nb_clients", benchmark: "<$50/mois", seuils: { vert: 50, jaune: 100, rouge: 200 }, tier: "T3", unite: "$/mois" },
        { id: "ratio_dette_technique", label: "Ratio dette technique", formule: "coût remédiation estimé / coût total développement", benchmark: "<15%", seuils: { vert: 15, jaune: 30, rouge: 50 }, tier: "T3", unite: "%" },
        { id: "maturite_numerique", label: "Maturité numérique", formule: "score 6 dimensions Industrie 4.0", benchmark: "60/100", seuils: { vert: 60, jaune: 35, rouge: 15 }, tier: "T3", unite: "/100" },
      ],
    },
    {
      id: "playbooks_tech",
      label: "Playbooks",
      description: "Playbooks technologiques par phase",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["audit-securite-annuel", "migration-cloud", "plan-reprise-sinistre"],
    },
  ],
};
// ── CFOB — Frank — Finance (CFO) ──

const CFOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CFOB",
  deptLabel: "Finance",
  intro: "La fonction financière évolue d'une comptabilité de survie vers une modélisation prédictive à mesure que votre entreprise grandit. La gestion de la trésorerie est le nerf de la guerre — le Cycle de Conversion en Espèces (CCC) est la métrique absolue de votre santé financière. Ce département structure vos budgets, revenus, obligations fiscales et prépare votre valorisation.",
  subSections: [
    {
      id: "budget_previsions",
      label: "Budget & Pr\u00e9visions",
      description: "Budget annuel, CAPEX/OPEX, sc\u00e9narios",
      icon: "DollarSign",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "budget_annuel", label: "Budget annuel total", type: "currency", tier: "T1", required: true },
        { id: "depenses_mensuelles", label: "D\u00e9penses mensuelles", type: "currency", tier: "T1" },
        { id: "modele_facturation", label: "Mod\u00e8le de facturation", type: "select", options: ["Horaire", "Forfait", "R\u00e9current", "Mixte"], tier: "T1" },
        { id: "capex", label: "CAPEX", type: "currency", tier: "T2" },
        { id: "opex", label: "OPEX", type: "currency", tier: "T2" },
        { id: "previsions_3ans", label: "Pr\u00e9visions 3 ans", type: "json", tier: "T3" },
        { id: "budget_centre_couts", label: "Budget par centre de co\u00fbts", type: "json", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "modele_revenus",
      label: "Mod\u00e8le de Revenus",
      description: "R\u00e9current, transactionnel, pricing",
      icon: "TrendingUp",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "type_revenus", label: "Type principal", type: "select", options: ["R\u00e9current (SaaS/abo)", "Transactionnel", "Projet", "Mixte", "Commission", "Licence"], tier: "T1", required: true },
        { id: "mrr", label: "MRR / Revenus mensuels", type: "currency", tier: "T1" },
        { id: "chiffre_affaires_estime", label: "Chiffre d\u2019affaires estim\u00e9", type: "currency", tier: "T1" },
        { id: "arr", label: "ARR", type: "currency", tier: "T2" },
        { id: "pricing_strategy", label: "Strat\u00e9gie de prix", type: "textarea", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "tresorerie",
      label: "Tr\u00e9sorerie",
      description: "Cash flow 13 semaines, runway, burn rate",
      icon: "DollarSign",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "solde_bancaire", label: "Solde bancaire actuel", type: "currency", tier: "T1" },
        { id: "burn_rate", label: "Burn rate mensuel", type: "currency", tier: "T2" },
        { id: "runway_mois", label: "Runway (mois)", type: "number", tier: "T2" },
        { id: "creances_clients_dso", label: "Cr\u00e9ances clients DSO (jours)", type: "number", tier: "T2" },
        { id: "cash_flow_13sem", label: "Cash flow 13 semaines", type: "json", tier: "T3" },
        { id: "dettes_fournisseurs_dpo", label: "Dettes fournisseurs DPO (jours)", type: "number", tier: "T3" },
        { id: "cycle_conversion_ccc", label: "Cycle de conversion CCC (jours)", type: "number", tier: "T3" },
        { id: "ratio_dette_equite", label: "Ratio dette/\u00e9quit\u00e9 (%)", type: "percentage", tier: "T3" },
        { id: "ligne_credit", label: "Ligne de cr\u00e9dit autoris\u00e9e", type: "currency", tier: "T4" },
      ],
      kpis: [
        { id: "runway", label: "Runway", formule: "solde / burn_rate", benchmark: ">12 mois", seuils: { vert: 12, jaune: 6, rouge: 3 }, tier: "T2", unite: "mois" },
      ],
    },
    {
      id: "fiscalite",
      label: "Fiscalit\u00e9 & Incitatifs",
      description: "RS&DE, CRIC, subventions actives",
      icon: "Shield",
      pertinence: { T1: "R", T2: "R", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "inscription_tps_tvq", label: "Inscription TPS/TVQ", type: "select", options: ["Oui", "Non \u2014 sous 30K$", "En cours"], tier: "T1" },
        { id: "rsde", label: "RS&DE d\u00e9pos\u00e9", type: "select", options: ["Oui \u2014 en cours", "Oui \u2014 termin\u00e9", "Non \u2014 \u00e9ligible", "Non \u2014 pas \u00e9ligible"], tier: "T2" },
        { id: "numeros_taxes_tps_tvq", label: "Num\u00e9ros TPS/TVQ", type: "text", tier: "T2" },
        { id: "subventions", label: "Subventions actives", type: "json", tier: "T3" },
        { id: "credits_impot", label: "Cr\u00e9dits d\u2019imp\u00f4t", type: "list", tier: "T3" },
        { id: "norme_comptable", label: "Norme comptable applicable", type: "select", options: ["NCECF", "IFRS", "Comptabilit\u00e9 de caisse"], tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "etats_financiers",
      label: "\u00c9tats Financiers",
      description: "Bilan, r\u00e9sultats, flux de tr\u00e9sorerie",
      icon: "Layers",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "dernier_bilan", label: "Dernier bilan (date)", type: "date", tier: "T2" },
        { id: "actif_total", label: "Actif total", type: "currency", tier: "T2" },
        { id: "passif_total", label: "Passif total", type: "currency", tier: "T2" },
        { id: "avoir_proprio", label: "Avoir des propri\u00e9taires", type: "currency", tier: "T3" },
        { id: "ratio_endettement", label: "Ratio d\u2019endettement", type: "percentage", tier: "T3" },
        { id: "etats_financiers_fichier", label: "\u00c9tats financiers (fichier)", type: "text", tier: "T3" },
        { id: "marge_baiia", label: "Marge BAIIA (%)", type: "percentage", tier: "T4" },
        { id: "rapport_audit_externe", label: "Rapport d\u2019audit externe (fichier)", type: "text", tier: "T5" },
      ],
      kpis: [
        { id: "marge_ebitda", label: "Marge EBITDA", formule: "EBITDA / CA \u00d7 100", benchmark: "15-25%", seuils: { vert: 15, jaune: 8, rouge: 0 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "valorisation",
      label: "Valorisation",
      description: "Multiples, EBITDA normalis\u00e9, QoE",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "ebitda_normalise", label: "EBITDA normalis\u00e9", type: "currency", tier: "T4" },
        { id: "multiple_secteur", label: "Multiple du secteur", type: "number", tier: "T4" },
        { id: "valorisation", label: "Valorisation estim\u00e9e", type: "currency", tier: "T4" },
        { id: "qoe_date", label: "Dernier QoE", type: "date", tier: "T5" },
        { id: "capex_previsionnel", label: "CapEx pr\u00e9visionnel", type: "currency", tier: "T5" },
        { id: "modele_dcf", label: "Mod\u00e8le d\u2019\u00e9valuation DCF (fichier)", type: "text", tier: "T5" },
        { id: "ratio_couverture_interets", label: "Ratio de couverture des int\u00e9r\u00eats", type: "number", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "kpis_finance",
      label: "KPIs Finance",
      description: "Runway, marge EBITDA, CCC",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "runway_kpi", label: "Runway", formule: "cash / burn mensuel", benchmark: ">12m", seuils: { vert: 12, jaune: 6, rouge: 3 }, tier: "T1", unite: "mois" },
        { id: "marge_ebitda_kpi", label: "Marge EBITDA", formule: "EBITDA / CA \u00d7 100", benchmark: "15-25%", seuils: { vert: 15, jaune: 8, rouge: 0 }, tier: "T3", unite: "%" },
        { id: "ccc", label: "Cycle Conversion Cash", formule: "DIO + DSO - DPO", benchmark: "<45j", seuils: { vert: 45, jaune: 75, rouge: 120 }, tier: "T3", unite: "jours" },
        { id: "liquidite_courante", label: "Ratio liquidit\u00e9 courante", formule: "actifs CT / passifs CT", benchmark: ">1.25", seuils: { vert: 1.25, jaune: 1.0, rouge: 0.75 }, tier: "T2", unite: ":1" },
        { id: "rule_of_40", label: "Rule of 40 (SaaS)", formule: "croissance ARR + marge BAIIA", benchmark: ">=40", seuils: { vert: 40, jaune: 25, rouge: 10 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "playbooks_finance",
      label: "Playbooks",
      description: "Playbooks financiers par phase",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["prevision-tresorerie-13sem", "preparation-financement", "due-diligence-financiere"],
    },
  ],
};

// ── CMOB — Mathilde — Marketing (CMO) ──

const CMOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CMOB",
  deptLabel: "Marketing",
  intro: "Le marketing orchestre votre proposition de valeur, l'acquisition de marché et votre réputation. Du profil client idéal à l'automatisation marketing, en passant par votre identité visuelle et votre présence en ligne, ce département construit la machine qui génère vos opportunités d'affaires et fidélise vos clients.",
  subSections: [
    {
      id: "personas_icp",
      label: "Personas & ICP",
      description: "Profil client id\u00e9al, parcours d\u2019achat",
      icon: "Target",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "icp_principal", label: "ICP principal", type: "textarea", tier: "T1", required: true },
        { id: "client_ideal_texte", label: "Client id\u00e9al (description texte)", type: "textarea", tier: "T1" },
        { id: "lien_linkedin_personnel", label: "Lien LinkedIn personnel", type: "text", tier: "T1" },
        { id: "personas", label: "Personas (JSON)", type: "json", tier: "T2" },
        { id: "parcours_achat", label: "Parcours d\u2019achat", type: "textarea", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "positionnement",
      label: "Positionnement & Marque",
      description: "UVP, ton, charte graphique",
      icon: "Compass",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "uvp", label: "Proposition de valeur unique (UVP)", type: "textarea", tier: "T1", required: true },
        { id: "ton_voix", label: "Ton de voix", type: "text", tier: "T2" },
        { id: "charte_graphique", label: "Charte graphique", type: "select", options: ["Formelle", "Informelle", "Absente"], tier: "T2" },
        { id: "identite_visuelle_logo", label: "Identit\u00e9 visuelle \u2014 Logo (URL)", type: "text", tier: "T2" },
        { id: "identite_visuelle_charte", label: "Identit\u00e9 visuelle \u2014 Charte graphique (fichier)", type: "text", tier: "T2" },
        { id: "architecture_marque", label: "Architecture de marque (Filiales/Produits)", type: "textarea", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "canaux_budget",
      label: "Canaux & Budget",
      description: "Mix marketing, ROI par canal",
      icon: "DollarSign",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "canaux_actifs", label: "Canaux actifs", type: "list", tier: "T1" },
        { id: "budget_marketing", label: "Budget marketing annuel", type: "currency", tier: "T2" },
        { id: "budget_marketing_mensuel", label: "Budget marketing mensuel", type: "currency", tier: "T2" },
        { id: "outil_envoi_courriel", label: "Outil d\u2019envoi courriel", type: "text", tier: "T2" },
        { id: "roi_par_canal", label: "ROI par canal", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "contenu_campagnes",
      label: "Contenu & Campagnes",
      description: "Calendrier \u00e9ditorial, lead magnets",
      icon: "Layers",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "calendrier_editorial", label: "Calendrier \u00e9ditorial", type: "select", options: ["Oui", "Non"], tier: "T2" },
        { id: "lead_magnets", label: "Lead magnets actifs", type: "list", tier: "T3" },
        { id: "campagnes_actives", label: "Campagnes actives", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "automatisation",
      label: "Automatisation MarTech",
      description: "Workflows, lead scoring, nurturing",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "outil_martech", label: "Outil MarTech", type: "text", tier: "T3" },
        { id: "plateforme_automatisation", label: "Plateforme d\u2019automatisation marketing (CRM)", type: "text", tier: "T3" },
        { id: "lead_scoring", label: "Lead scoring actif", type: "select", options: ["Oui", "Non"], tier: "T4" },
        { id: "workflows_automatises", label: "Nombre de workflows", type: "number", tier: "T4" },
        { id: "attribution_multi_touch", label: "Attribution multi-touch", type: "text", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "reputation",
      label: "R\u00e9putation & PR",
      description: "T\u00e9moignages, NPS, \u00e9v\u00e9nements",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "temoignages", label: "Nombre de t\u00e9moignages clients", type: "number", tier: "T2" },
        { id: "nps_actuel", label: "NPS actuel", type: "number", tier: "T3" },
        { id: "evenements_annuels", label: "\u00c9v\u00e9nements/an", type: "number", tier: "T4" },
        { id: "agences_partenaires", label: "Agences partenaires externes", type: "list", tier: "T5" },
        { id: "plan_gestion_crise_rp", label: "Plan de gestion de crise RP (fichier)", type: "text", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "kpis_marketing",
      label: "KPIs Marketing",
      description: "CAC, LTV:CAC, taux de conversion",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "cac", label: "CAC", formule: "d\u00e9penses marketing / nouveaux clients", benchmark: "<$500", seuils: { vert: 500, jaune: 1000, rouge: 2000 }, tier: "T2", unite: "$" },
        { id: "ltv_cac", label: "LTV:CAC", formule: "LTV / CAC", benchmark: ">3:1", seuils: { vert: 3, jaune: 2, rouge: 1 }, tier: "T2", unite: ":1" },
        { id: "taux_conversion", label: "Taux conversion", formule: "conversions / visiteurs \u00d7 100", benchmark: "2-5%", seuils: { vert: 3, jaune: 1, rouge: 0.5 }, tier: "T2", unite: "%" },
        { id: "nps_kpi", label: "Net Promoter Score", formule: "% Promoteurs - % D\u00e9tracteurs", benchmark: "50+", seuils: { vert: 50, jaune: 20, rouge: 0 }, tier: "T3", unite: "" },
      ],
    },
    {
      id: "playbooks_marketing",
      label: "Playbooks",
      description: "Playbooks marketing par phase",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["strategie-contenu-b2b", "lancement-campagne-lead-gen", "audit-marque"],
    },
  ],
};

// ── CSOB — Simone — Strat\u00e9gie (CSO) ──

const CSOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CSOB",
  deptLabel: "Strat\u00e9gie",
  intro: "La strat\u00e9gie garantit l'alignement \u00e0 long terme entre votre vision et le march\u00e9. De l'analyse concurrentielle au dimensionnement de votre march\u00e9 (TAM/SAM/SOM), en passant par vos partenariats et vos avantages concurrentiels durables (moats), ce d\u00e9partement structure les d\u00e9cisions qui d\u00e9terminent votre positionnement et votre croissance future.",
  subSections: [
    {
      id: "pestel",
      label: "Analyse PESTEL",
      description: "Politique, \u00c9conomique, Social, Technologique, Environnemental, L\u00e9gal",
      icon: "Compass",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "politique", label: "Politique", type: "textarea", tier: "T3" },
        { id: "economique", label: "\u00c9conomique", type: "textarea", tier: "T3" },
        { id: "social", label: "Social", type: "textarea", tier: "T3" },
        { id: "technologique", label: "Technologique", type: "textarea", tier: "T2" },
        { id: "environnemental", label: "Environnemental", type: "textarea", tier: "T4" },
        { id: "legal", label: "L\u00e9gal", type: "textarea", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "marche",
      label: "March\u00e9 (TAM/SAM/SOM)",
      description: "Taille de march\u00e9, potentiel, p\u00e9n\u00e9tration",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "marche_cible_primaire", label: "March\u00e9 cible primaire", type: "text", tier: "T2" },
        { id: "tam", label: "TAM (Total Addressable Market)", type: "currency", tier: "T2" },
        { id: "sam", label: "SAM (Serviceable Addressable)", type: "currency", tier: "T2" },
        { id: "som", label: "SOM (Serviceable Obtainable)", type: "currency", tier: "T2" },
        { id: "part_marche", label: "Part de march\u00e9 actuelle (%)", type: "percentage", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "concurrence",
      label: "Concurrence",
      description: "Comparatif, positionnement, moats",
      icon: "Target",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "concurrents_directs", label: "Concurrents directs", type: "json", tier: "T1" },
        { id: "top_3_concurrents", label: "Top 3 concurrents directs", type: "list", tier: "T1" },
        { id: "differenciateurs", label: "Diff\u00e9renciateurs cl\u00e9s", type: "list", tier: "T1" },
        { id: "concurrents_indirects", label: "Concurrents indirects", type: "json", tier: "T2" },
        { id: "matrice_positionnement", label: "Matrice de positionnement concurrentiel", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "partenariats",
      label: "Partenariats Strat\u00e9giques",
      description: "Alliances, JV, distribution",
      icon: "Building2",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "partenaires_actuels", label: "Partenaires actuels", type: "json", tier: "T2" },
        { id: "partenaires_distribution", label: "Partenaires de distribution", type: "list", tier: "T2" },
        { id: "partenaires_cibles", label: "Partenaires cibl\u00e9s", type: "list", tier: "T3" },
        { id: "type_partenariat", label: "Types de partenariats", type: "list", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "diversification",
      label: "Diversification",
      description: "Ansoff, nouveaux march\u00e9s, M&A",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "I", T5: "C" },
      fields: [
        { id: "matrice_ansoff", label: "Matrice Ansoff", type: "json", tier: "T3" },
        { id: "marches_cibles", label: "Nouveaux march\u00e9s cibl\u00e9s", type: "list", tier: "T4" },
        { id: "strategie_internationalisation", label: "Strat\u00e9gie d\u2019internationalisation (r\u00e9gions vis\u00e9es)", type: "textarea", tier: "T4" },
        { id: "plan_acquisitions_ma", label: "Plan d\u2019acquisitions M&A (cibles)", type: "json", tier: "T4" },
        { id: "ma_potentiel", label: "Cibles M&A potentielles", type: "json", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "avantage_concurrentiel",
      label: "Avantage Concurrentiel",
      description: "Moats, PI, effets r\u00e9seau",
      icon: "Shield",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "differenciateur_cle", label: "Diff\u00e9renciateur cl\u00e9 (texte)", type: "textarea", tier: "T1" },
        { id: "moats", label: "Moats identifi\u00e9s", type: "list", tier: "T2" },
        { id: "brevets", label: "Brevets / PI", type: "list", tier: "T3" },
        { id: "effets_reseau", label: "Effets r\u00e9seau", type: "textarea", tier: "T3" },
        { id: "avantage_formalise", label: "Avantage concurrentiel formalis\u00e9 (Brevet/Exclusivit\u00e9)", type: "text", tier: "T3" },
        { id: "analyse_5_forces", label: "Analyse des 5 forces de Porter", type: "json", tier: "T5" },
        { id: "ecosysteme_co_innovation", label: "\u00c9cosyst\u00e8me de co-innovation", type: "textarea", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "kpis_strategie",
      label: "KPIs Strat\u00e9gie",
      description: "Part de march\u00e9, concentration client, initiatives",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "part_marche_kpi", label: "Part de march\u00e9", formule: "CA / SAM \u00d7 100", benchmark: "variable", seuils: { vert: 10, jaune: 5, rouge: 1 }, tier: "T3", unite: "%" },
        { id: "concentration_client", label: "Concentration client", formule: "CA top 3 / CA total \u00d7 100", benchmark: "<30%", seuils: { vert: 30, jaune: 50, rouge: 70 }, tier: "T2", unite: "%" },
        { id: "initiatives_strat", label: "Initiatives strat\u00e9giques en cours", formule: "count", benchmark: "3-5", seuils: { vert: 3, jaune: 1, rouge: 0 }, tier: "T3", unite: "" },
        { id: "taux_croissance_marche", label: "Taux de croissance du march\u00e9", formule: "croissance march\u00e9 / ann\u00e9e", benchmark: ">5%", seuils: { vert: 5, jaune: 2, rouge: 0 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "playbooks_strategie",
      label: "Playbooks",
      description: "Playbooks strat\u00e9giques par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["analyse-concurrentielle", "plan-expansion-marche", "preparation-ma"],
    },
  ],
};

// ── COOB — Olivier — Op\u00e9rations (COO) ──

const COOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "COOB",
  deptLabel: "Op\u00e9rations",
  intro: "Les op\u00e9rations sont responsables de l'ex\u00e9cution et de l'efficacit\u00e9 au quotidien. La productivit\u00e9 est un enjeu critique au Qu\u00e9bec, et la documentation de vos processus, la gestion de votre cha\u00eene d'approvisionnement et l'am\u00e9lioration continue sont les leviers qui transforment votre strat\u00e9gie en r\u00e9sultats concrets.",
  subSections: [
    {
      id: "processus",
      label: "Processus (BPM)",
      description: "Cartographie, logigrammes, optimisation",
      icon: "Layers",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "processus_livraison", label: "Processus de livraison principal", type: "textarea", tier: "T1" },
        { id: "outil_gestion_taches", label: "Outil de gestion de t\u00e2ches", type: "text", tier: "T1" },
        { id: "processus_cles", label: "Processus cl\u00e9s cartographi\u00e9s", type: "json", tier: "T2" },
        { id: "manuel_employe", label: "Manuel d\u2019employ\u00e9 / proc\u00e9dures de base (fichier)", type: "text", tier: "T2" },
        { id: "goulots", label: "Goulots identifi\u00e9s", type: "list", tier: "T3" },
        { id: "cartographie_processus", label: "Cartographie des processus critiques (fichier)", type: "text", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "supply_chain",
      label: "Supply Chain",
      description: "Fournisseurs, lead times, risques",
      icon: "Building2",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "fournisseurs_cles", label: "Fournisseurs cl\u00e9s", type: "json", tier: "T2" },
        { id: "lead_time_moyen", label: "Lead time moyen", type: "text", tier: "T3" },
        { id: "risques_approvisionnement", label: "Risques approvisionnement", type: "list", tier: "T3" },
        { id: "erp_inventaire", label: "ERP / Syst\u00e8me d\u2019inventaire", type: "text", tier: "T3" },
        { id: "cout_logistique_pct_ca", label: "Co\u00fbt logistique (% CA)", type: "percentage", tier: "T3" },
        { id: "plan_b_fournisseurs", label: "Plan B fournisseurs", type: "json", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "logistique",
      label: "Logistique & Installations",
      description: "Baux, capacit\u00e9, layout usine",
      icon: "Building2",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "installations", label: "Installations (adresses)", type: "list", tier: "T2" },
        { id: "superficie_pi2", label: "Superficie (pi\u00b2)", type: "number", tier: "T3" },
        { id: "baux_echeance", label: "\u00c9ch\u00e9ance baux", type: "json", tier: "T3" },
        { id: "capacite_utilisation", label: "Taux utilisation capacit\u00e9 (%)", type: "percentage", tier: "T3" },
        { id: "gestion_multi_sites", label: "Gestion multi-sites", type: "json", tier: "T5" },
        { id: "plan_releve_operationnel", label: "Plan de rel\u00e8ve op\u00e9rationnel (fichier)", type: "text", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "amelioration_continue",
      label: "Am\u00e9lioration Continue",
      description: "Kaizen, Lean, 5S, Six Sigma",
      icon: "TrendingUp",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "methodologies", label: "M\u00e9thodologies appliqu\u00e9es", type: "list", tier: "T3" },
        { id: "projets_amelioration", label: "Projets d\u2019am\u00e9lioration en cours", type: "json", tier: "T4" },
        { id: "score_5s", label: "Score 5S", type: "number", tier: "T4" },
        { id: "responsable_amelioration", label: "Responsable am\u00e9lioration continue (d\u00e9di\u00e9)", type: "text", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "gestion_fournisseurs",
      label: "Gestion Fournisseurs",
      description: "\u00c9valuation, SLA, performance",
      icon: "ListChecks",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "liste_fournisseurs_cles", label: "Liste des fournisseurs cl\u00e9s", type: "json", tier: "T2" },
        { id: "evaluation_fournisseurs", label: "Grille \u00e9valuation fournisseurs", type: "json", tier: "T3" },
        { id: "sla_fournisseurs", label: "SLAs en place", type: "json", tier: "T4" },
        { id: "audits_chaine_approvisionnement", label: "Audits cha\u00eene d\u2019approvisionnement (conformit\u00e9 environnementale/sociale)", type: "json", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "capacite_planification",
      label: "Capacit\u00e9 & Planification",
      description: "Suivi goulots d\u2019\u00e9tranglement, saisonnalit\u00e9, Theory of Constraints",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "goulots_etranglement", label: "Goulots d\u2019\u00e9tranglement identifi\u00e9s", type: "list", tier: "T3" },
        { id: "saisonnalite", label: "Profil de saisonnalit\u00e9", type: "json", tier: "T3" },
        { id: "taux_utilisation_capacite", label: "Taux utilisation capacit\u00e9 (%)", type: "percentage", tier: "T3" },
        { id: "indicateurs_supply_chain", label: "Indicateurs Supply Chain (OTIF, Lead time)", type: "json", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "kpis_operations",
      label: "KPIs Op\u00e9rations",
      description: "OTIF, productivit\u00e9, d\u00e9lai commandes",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "otif", label: "OTIF (On-Time In-Full)", formule: "livraisons conformes / total \u00d7 100", benchmark: ">95%", seuils: { vert: 95, jaune: 85, rouge: 75 }, tier: "T3", unite: "%" },
        { id: "productivite", label: "Productivit\u00e9", formule: "CA / employ\u00e9", benchmark: "variable", seuils: { vert: 150000, jaune: 100000, rouge: 75000 }, tier: "T3", unite: "$/emp" },
        { id: "delai_commandes", label: "D\u00e9lai moyen commandes", formule: "somme d\u00e9lais / nb commandes", benchmark: "<5j", seuils: { vert: 5, jaune: 10, rouge: 20 }, tier: "T3", unite: "jours" },
        { id: "rotation_stocks", label: "Taux de rotation des stocks", formule: "COGS / valeur moyenne stocks", benchmark: ">6x/an", seuils: { vert: 6, jaune: 3, rouge: 1 }, tier: "T3", unite: "x/an" },
      ],
    },
    {
      id: "playbooks_operations",
      label: "Playbooks",
      description: "Playbooks op\u00e9rationnels par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["cartographie-processus", "audit-supply-chain", "programme-5s"],
    },
  ],
};// ══════════════════════════════════════════════════════════════
// PART 3 — CPOB, CHROB, CINOB, CROB, CLOB, CISOB + Registry
// ══════════════════════════════════════════════════════════════

// ── CPOB — Paco — Production & Produit (CPO) ──

const CPOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CPOB",
  deptLabel: "Production & Produit",
  intro: "Pour les entreprises de produits physiques, la production est le moteur de cr\u00e9ation de valeur. Ce d\u00e9partement couvre la planification, la gestion des stocks, l'assurance qualit\u00e9, la sant\u00e9-s\u00e9curit\u00e9 au travail (SST) et la maintenance. Les certifications (ISO, IATF, HACCP) sont souvent un permis d'op\u00e9rer impos\u00e9 par vos donneurs d'ordres.",
  subSections: [
    {
      id: "planification_production",
      label: "Planification de la production",
      description: "Capacité, produits, BOM et systèmes de planification manufacturière",
      icon: "Factory",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "espace_travail", label: "Espace de travail", type: "select", options: ["Domicile", "Bureau", "Atelier", "Usine", "Multiple"], placeholder: "Sélectionner l'espace de travail", tier: "T1" },
        { id: "produits_principaux", label: "Produits principaux", type: "textarea", placeholder: "Liste des produits/services principaux", tier: "T2" },
        { id: "capacite_journaliere", label: "Capacité journalière", type: "number", placeholder: "Unités/jour ou heures productives", tier: "T3" },
        { id: "bom_principal", label: "BOM principal (Bill of Materials)", type: "textarea", placeholder: "Structure du BOM pour le produit phare", tier: "T3" },
        { id: "implantation_mrp_mes", label: "Implantation système MRP/MES", type: "select", options: ["MRP", "MES", "APS", "Aucun"], placeholder: "Système de planification", tier: "T4" },
      ],
      kpis: [],
      templates: ["plan-production-hebdo", "fiche-produit-standard"],
      playbooks: ["optimisation-capacite", "lean-manufacturing-101"],
    },
    {
      id: "gestion_stocks",
      label: "Gestion des stocks",
      description: "Inventaires, rotation, points de commande et entreposage",
      icon: "Package",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "methode_inventaire", label: "Méthode d'inventaire", type: "select", options: ["FIFO", "LIFO", "Coût moyen", "Aucune"], placeholder: "Méthode utilisée", tier: "T2" },
        { id: "valeur_inventaire", label: "Valeur de l'inventaire", type: "currency", placeholder: "Valeur totale en $", tier: "T2" },
        { id: "rotation_stocks", label: "Rotation des stocks (tours/an)", type: "number", placeholder: "Nombre de rotations par année", tier: "T3" },
        { id: "points_commande", label: "Points de commande définis", type: "select", options: ["Oui", "Non", "Partiel"], placeholder: "Seuils de réapprovisionnement", tier: "T3" },
        { id: "outil_gestion_stocks", label: "Outil de gestion des stocks", type: "text", placeholder: "Logiciel ou méthode utilisée", tier: "T3" },
      ],
      kpis: [
        { id: "rotation_inventaire_kpi", label: "Rotation d'inventaire", formule: "COGS / inventaire moyen", benchmark: ">6 tours/an", seuils: { vert: 6, jaune: 3, rouge: 1 }, tier: "T3", unite: "tours/an" },
      ],
    },
    {
      id: "qualite",
      label: "Qualité",
      description: "Systèmes qualité, non-conformités et coûts de la non-qualité",
      icon: "CheckCircle",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "responsable_qualite", label: "Responsable qualité (nom)", type: "text", placeholder: "Nom du responsable", tier: "T2" },
        { id: "systeme_qualite", label: "Système qualité", type: "select", options: ["ISO 9001", "TQM", "Six Sigma", "Lean", "Informel", "Aucun"], placeholder: "Système en place", tier: "T3" },
        { id: "taux_non_conformite", label: "Taux de non-conformité (%)", type: "percentage", placeholder: "% de produits non conformes", tier: "T3" },
        { id: "cout_non_qualite_cnq", label: "Coût de non-qualité CNQ (% CA)", type: "percentage", placeholder: "CNQ en % du chiffre d'affaires", tier: "T3" },
        { id: "cout_non_qualite", label: "Coût de la non-qualité ($)", type: "currency", placeholder: "Coût annuel en $", tier: "T4" },
      ],
      kpis: [
        { id: "taux_conformite_kpi", label: "Taux de conformité", formule: "(1 - taux non-conformité) × 100", benchmark: ">98%", seuils: { vert: 98, jaune: 95, rouge: 90 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "sst",
      label: "Santé & Sécurité au Travail (SST)",
      description: "Programme de prévention, CNESST, incidents et conformité SST",
      icon: "ShieldAlert",
      pertinence: { T1: "I", T2: "R", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "programme_prevention", label: "Programme de prévention", type: "select", options: ["Formalisé", "En développement", "Informel", "Absent"], placeholder: "État du programme SST", tier: "T2" },
        { id: "inscription_cnesst", label: "Inscription CNESST (numéro d'employeur)", type: "text", placeholder: "Numéro d'employeur CNESST", tier: "T2" },
        { id: "incidents_12mois", label: "Incidents (12 derniers mois)", type: "number", placeholder: "Nombre d'incidents déclarés", tier: "T2" },
        { id: "comite_sst", label: "Comité SST", type: "select", options: ["Actif", "Inactif", "N/A (<20 emp)"], placeholder: "Statut du comité SST", tier: "T3" },
        { id: "agent_liaison_sst", label: "Agent de liaison SST (nom)", type: "text", placeholder: "Nom de l'agent de liaison", tier: "T3" },
        { id: "taux_frequence", label: "Taux de fréquence SST", type: "number", placeholder: "Incidents × 200 000 / heures", tier: "T3" },
        { id: "comite_sst_date_creation", label: "Comité SST — date de création", type: "date", tier: "T4" },
        { id: "programme_prevention_fichier", label: "Programme de prévention SST (fichier)", type: "text", placeholder: "Nom du fichier ou lien", tier: "T4" },
        { id: "taux_rebuts", label: "Taux de rebuts (%)", type: "percentage", placeholder: "% de rebuts en production", tier: "T4" },
        { id: "suivi_tcir", label: "TCIR (Total Recordable Incident Rate)", type: "number", placeholder: "Taux TCIR calculé", tier: "T5" },
        { id: "strategie_industrie_4_0", label: "Stratégie Industrie 4.0", type: "textarea", placeholder: "Vision et étapes d'adoption Industrie 4.0", tier: "T5" },
      ],
      kpis: [
        { id: "taux_frequence_kpi", label: "Taux de fréquence SST", formule: "incidents × 200 000 / heures travaillées", benchmark: "<5", seuils: { vert: 5, jaune: 10, rouge: 20 }, tier: "T3", unite: "" },
        { id: "tcir_kpi", label: "TCIR (accidents)", formule: "incidents × 200000 / heures travaillées", benchmark: "<3", seuils: { vert: 3, jaune: 8, rouge: 15 }, tier: "T3", unite: "" },
      ],
    },
    {
      id: "equipements",
      label: "Équipements & Maintenance",
      description: "Actifs critiques, maintenance préventive et taux de rendement synthétique",
      icon: "Wrench",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "equipements_critiques", label: "Équipements critiques", type: "textarea", placeholder: "Liste des équipements essentiels à la production", tier: "T3" },
        { id: "maintenance_preventive", label: "Maintenance préventive", type: "select", options: ["Programme formel", "Ad hoc", "Réactif seulement"], placeholder: "Type de maintenance", tier: "T3" },
        { id: "trs_global", label: "TRS global (OEE)", type: "percentage", placeholder: "Taux de rendement synthétique %", tier: "T4" },
      ],
      kpis: [
        { id: "oee", label: "OEE (Overall Equipment Effectiveness)", formule: "disponibilité × performance × qualité", benchmark: ">75%", seuils: { vert: 75, jaune: 55, rouge: 40 }, tier: "T4", unite: "%" },
      ],
    },
    {
      id: "normes_certifications",
      label: "Normes & Certifications",
      description: "Certifications actives, audits et conformité réglementaire de production",
      icon: "Award",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "certifications_actives", label: "Certifications actives", type: "list", placeholder: "ISO 9001, HACCP, etc.", tier: "T3" },
        { id: "certifications_visees", label: "Certifications visées", type: "list", placeholder: "Certifications en cours d'obtention", tier: "T4" },
        { id: "prochaine_audit", label: "Prochaine date d'audit", type: "date", tier: "T4" },
        { id: "certification_iso_formelle", label: "Certification ISO formelle", type: "select", options: ["ISO 9001", "IATF 16949", "AS9100", "HACCP", "Aucune"], placeholder: "Norme ISO principale", tier: "T5" },
      ],
      kpis: [],
    },
  ],
};

// ── CHROB — Hélène — RH (CHRO) ──

const CHROB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CHROB",
  deptLabel: "Ressources Humaines",
  intro: "Les ressources humaines sont le socle de votre croissance, surtout dans un contexte de p\u00e9nurie de main-d'\u0153uvre au Qu\u00e9bec o\u00f9 78% des manufacturiers ont des difficult\u00e9s de recrutement. L'organigramme, la r\u00e9mun\u00e9ration, la conformit\u00e9 (\u00e9quit\u00e9 salariale, Loi 96, Loi 90) et la r\u00e9tention de vos talents cl\u00e9s sont les fondations de votre p\u00e9rennit\u00e9.",
  subSections: [
    {
      id: "organigramme",
      label: "Organigramme & Effectifs",
      description: "Structure organisationnelle, effectifs et postes ouverts",
      icon: "Users",
      pertinence: { T1: "H", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "nb_employes_total", label: "Nombre d'employés total", type: "number", placeholder: "Effectif total", tier: "T2" },
        { id: "nb_employes_exact", label: "Nombre d'employés exact", type: "number", placeholder: "Effectif exact incluant temps partiel", tier: "T2" },
        { id: "inscription_das", label: "Inscription DAS (Déductions à la source)", type: "text", placeholder: "Numéro DAS", tier: "T2" },
        { id: "organigramme_formalise", label: "Organigramme formalisé", type: "select", options: ["Oui", "Non", "En cours"], placeholder: "État de l'organigramme", tier: "T2" },
        { id: "postes_ouverts", label: "Postes ouverts", type: "number", placeholder: "Nombre de postes à pourvoir", tier: "T2" },
        { id: "offres_emploi_cours", label: "Offres d'emploi en cours", type: "number", placeholder: "Nombre d'offres actives", tier: "T2" },
        { id: "nb_cadres", label: "Nombre de cadres", type: "number", placeholder: "Effectif cadre", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "remuneration",
      label: "Rémunération & Avantages",
      description: "Grilles salariales, avantages sociaux et masse salariale",
      icon: "DollarSign",
      pertinence: { T1: "I", T2: "C", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "tarif_horaire_cible", label: "Tarif horaire ciblé (T1 Solo)", type: "currency", placeholder: "Tarif horaire en $", tier: "T1" },
        { id: "avantages_sociaux", label: "Avantages sociaux", type: "textarea", placeholder: "Assurances, REER, congés, etc.", tier: "T2" },
        { id: "grille_salariale", label: "Grille salariale", type: "select", options: ["Formelle", "Informelle", "Aucune"], placeholder: "Grille en place", tier: "T3" },
        { id: "masse_salariale", label: "Masse salariale annuelle", type: "currency", placeholder: "Masse salariale totale en $", tier: "T3" },
        { id: "budget_formation_pct", label: "Budget de formation (% masse salariale)", type: "percentage", placeholder: "% de la masse salariale", tier: "T4" },
        { id: "manuel_employe_formel", label: "Manuel d'employé formel", type: "select", options: ["Oui", "Non"], placeholder: "Existence du manuel", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "recrutement",
      label: "Recrutement",
      description: "Processus de recrutement, sources et délais d'embauche",
      icon: "UserPlus",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "canaux_recrutement", label: "Canaux de recrutement", type: "list", placeholder: "Indeed, LinkedIn, bouche-à-oreille, etc.", tier: "T2" },
        { id: "delai_embauche", label: "Délai moyen d'embauche (jours)", type: "number", placeholder: "Jours entre affichage et embauche", tier: "T3" },
        { id: "processus_integration", label: "Processus d'intégration (onboarding)", type: "select", options: ["Formel", "Informel", "Absent"], placeholder: "Programme d'accueil", tier: "T3" },
        { id: "taux_retention_90j", label: "Taux de rétention à 90 jours (%)", type: "percentage", placeholder: "% encore en poste après 90 jours", tier: "T3" },
      ],
      kpis: [
        { id: "time_to_fill_kpi", label: "Délai de comblement", formule: "date embauche - date ouverture", benchmark: "<45 jours", seuils: { vert: 45, jaune: 75, rouge: 120 }, tier: "T3", unite: "jours" },
      ],
    },
    {
      id: "formation",
      label: "Formation & Développement",
      description: "Plan de formation, budgets et heures de formation par employé",
      icon: "GraduationCap",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "R", T5: "R" },
      fields: [
        { id: "plan_formation", label: "Plan de formation", type: "select", options: ["Formalisé", "Informel", "Absent"], placeholder: "Plan annuel de formation", tier: "T3" },
        { id: "budget_formation", label: "Budget formation ($)", type: "currency", placeholder: "Budget annuel en $", tier: "T3" },
        { id: "heures_formation_emp", label: "Heures de formation / employé / an", type: "number", placeholder: "Moyenne annuelle", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "conformite_rh",
      label: "Conformité RH",
      description: "Équité salariale, harcèlement, francisation et obligations légales",
      icon: "Scale",
      pertinence: { T1: "R", T2: "R", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "equite_salariale", label: "Exercice d'équité salariale", type: "select", options: ["Complété", "En cours", "Non fait", "N/A (<10 emp)"], placeholder: "État de conformité", tier: "T3" },
        { id: "date_exercice_equite", label: "Date de l'exercice initial d'équité salariale", type: "date", tier: "T3" },
        { id: "politique_harcelement", label: "Politique de harcèlement", type: "select", options: ["Adoptée", "En rédaction", "Absente"], placeholder: "Politique formelle", tier: "T3" },
        { id: "francisation", label: "Programme de francisation", type: "select", options: ["Conforme", "En cours", "N/A (<25 emp)"], placeholder: "Conformité OQLF", tier: "T3" },
        { id: "attestation_oqlf", label: "Attestation OQLF (si >25 employés)", type: "select", options: ["Oui", "Non", "N/A (<25 emp)"], placeholder: "Attestation obtenue", tier: "T3" },
        { id: "comite_francisation_100", label: "Comité de francisation (100+ employés)", type: "select", options: ["Actif", "N/A (<100 emp)", "Requis"], placeholder: "État du comité", tier: "T5" },
        { id: "grilles_salariales_formelles", label: "Grilles salariales formelles", type: "select", options: ["Oui", "Non"], placeholder: "Grilles documentées", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "culture_engagement",
      label: "Culture & Engagement",
      description: "Engagement des employés, culture d'entreprise et politiques de travail",
      icon: "Heart",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "plan_dev_personnel", label: "Plan de développement personnel", type: "textarea", placeholder: "Objectifs de développement (T1 Solo)", tier: "T1" },
        { id: "politique_teletravail", label: "Politique de télétravail", type: "select", options: ["100% bureau", "Hybride", "100% télétravail", "Flexible"], placeholder: "Mode de travail", tier: "T2" },
        { id: "enps", label: "eNPS (Employee Net Promoter Score)", type: "number", placeholder: "Score de -100 à 100", tier: "T3" },
        { id: "sondage_engagement", label: "Sondage d'engagement", type: "select", options: ["Annuel", "Semestriel", "Ponctuel", "Jamais fait"], placeholder: "Fréquence des sondages", tier: "T3" },
      ],
      kpis: [
        { id: "enps_kpi", label: "eNPS", formule: "(promoteurs - détracteurs) / total × 100", benchmark: ">30", seuils: { vert: 30, jaune: 10, rouge: -10 }, tier: "T3", unite: "" },
      ],
    },
    {
      id: "succession",
      label: "Planification de la relève",
      description: "Succession, hauts potentiels et rétention des talents clés",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "I", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "taux_turnover", label: "Taux de roulement annuel (%)", type: "percentage", placeholder: "% de départs / effectif moyen", tier: "T3" },
        { id: "plan_succession", label: "Plan de succession", type: "select", options: ["Formalisé", "Informel", "Absent"], placeholder: "Plan de relève", tier: "T4" },
        { id: "hauts_potentiels", label: "Hauts potentiels identifiés", type: "number", placeholder: "Nombre de HP identifiés", tier: "T4" },
        { id: "plan_releve_9box", label: "Plan de relève corporative (9-box grid) (fichier)", type: "text", placeholder: "Nom du fichier ou lien", tier: "T5" },
      ],
      kpis: [
        { id: "turnover_kpi", label: "Taux de roulement", formule: "départs / effectif moyen × 100", benchmark: "<15%", seuils: { vert: 15, jaune: 25, rouge: 40 }, tier: "T3", unite: "%" },
        { id: "revenu_par_employe", label: "Revenu par employé", formule: "CA / effectif moyen", benchmark: ">150K$", seuils: { vert: 150000, jaune: 100000, rouge: 60000 }, tier: "T3", unite: "$" },
      ],
    },
  ],
};

// ── CINOB — Inès — Innovation & R&D (CINO) ──

const CINOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CINOB",
  deptLabel: "Innovation & R&D",
  intro: "L'innovation est le moteur de cr\u00e9ation d'avantages comp\u00e9titifs durables. La propri\u00e9t\u00e9 intellectuelle, les cr\u00e9dits RS&DE (jusqu'\u00e0 35% f\u00e9d\u00e9ral + 30% provincial sur le premier million), et les partenariats avec les centres de recherche qu\u00e9b\u00e9cois sont des leviers puissants de croissance. Ce d\u00e9partement structure votre pipeline d'innovation de l'id\u00e9e \u00e0 la commercialisation.",
  subSections: [
    {
      id: "pipeline_innovation",
      label: "Pipeline d'innovation",
      description: "Backlog d'idées, projets de R&D actifs et pipeline d'innovation",
      icon: "Lightbulb",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "liste_idees_opportunites", label: "Liste d'idées / opportunités", type: "list", placeholder: "Idées en vrac, opportunités identifiées", tier: "T1" },
        { id: "idees_backlog", label: "Idées au backlog", type: "number", placeholder: "Nombre d'idées en attente", tier: "T2" },
        { id: "projets_actifs", label: "Projets R&D actifs", type: "number", placeholder: "Nombre de projets en cours", tier: "T2" },
        { id: "pipeline_innovation", label: "Pipeline d'innovation", type: "textarea", placeholder: "Description du pipeline (étapes, gates, critères)", tier: "T3" },
      ],
      kpis: [
        { id: "indice_vitalite", label: "Indice de vitalité (% CA nouveaux produits)", formule: "CA nouveaux produits (<3 ans) / CA total × 100", benchmark: ">25%", seuils: { vert: 25, jaune: 15, rouge: 5 }, tier: "T3", unite: "%" },
      ],
      templates: ["fiche-idee-innovation", "stage-gate-process"],
      playbooks: ["ideation-structuree", "lean-startup-pme"],
    },
    {
      id: "propriete_intellectuelle",
      label: "Propriété intellectuelle",
      description: "Brevets, marques de commerce, secrets commerciaux et portefeuille PI",
      icon: "Shield",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "marques_commerce_oui_non", label: "Marques de commerce déposées?", type: "select", options: ["Oui", "Non", "En cours"], placeholder: "État des marques", tier: "T1" },
        { id: "marques_commerce", label: "Marques de commerce", type: "list", placeholder: "Liste des marques déposées", tier: "T2" },
        { id: "depot_brevets_nombre", label: "Nombre de dépôts de brevets en cours", type: "number", placeholder: "Brevets en processus", tier: "T2" },
        { id: "brevets", label: "Brevets détenus", type: "list", placeholder: "Liste des brevets actifs", tier: "T3" },
        { id: "secrets_commerciaux", label: "Secrets commerciaux protégés", type: "textarea", placeholder: "Procédés, formules, know-how documentés", tier: "T3" },
        { id: "portefeuille_pi_fichier", label: "Portefeuille de PI (fichier d'inventaire)", type: "text", placeholder: "Nom du fichier ou lien", tier: "T4" },
        { id: "valorisation_actifs_incorporels", label: "Valorisation des actifs incorporels", type: "currency", placeholder: "Valeur estimée en $", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "rsde",
      label: "RS&DE (Crédits R&D)",
      description: "Projets de R&D admissibles, réclamations et documentation RS&DE",
      icon: "FileText",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "projets_rd", label: "Projets de R&D", type: "number", placeholder: "Nombre de projets de R&D", tier: "T2" },
        { id: "rsde_admissible", label: "RS&DE admissible", type: "select", options: ["Oui", "Non", "À évaluer"], placeholder: "Admissibilité aux crédits", tier: "T2" },
        { id: "depenses_rd_estimees", label: "Dépenses de R&D estimées", type: "currency", placeholder: "Dépenses annuelles estimées en $", tier: "T2" },
        { id: "budget_rd", label: "Budget R&D annuel", type: "currency", placeholder: "Budget total en $", tier: "T3" },
        { id: "documentation_rsde", label: "Documentation RS&DE", type: "select", options: ["Complète", "Partielle", "Absente"], placeholder: "État de la documentation", tier: "T3" },
        { id: "reclamation_rsde_annuelle", label: "Réclamation RS&DE annuelle", type: "select", options: ["Oui", "Non", "N/A"], placeholder: "Réclamation effectuée", tier: "T3" },
        { id: "niveau_trl", label: "Niveau TRL des innovations clés", type: "select", options: ["TRL 1-3 Recherche", "TRL 4-6 Développement", "TRL 7-9 Déploiement"], placeholder: "Niveau de maturité", tier: "T3" },
        { id: "processus_innovation_stage_gate", label: "Processus formel d'innovation (Stage-Gate)", type: "select", options: ["Oui", "Non"], placeholder: "Processus en place", tier: "T4" },
        { id: "ratio_rd_pct_ca", label: "Ratio de R&D (% du CA)", type: "percentage", placeholder: "% du chiffre d'affaires", tier: "T5" },
        { id: "strategie_intrapreneuriat", label: "Stratégie d'intrapreneuriat", type: "textarea", placeholder: "Programme d'intrapreneuriat et innovation interne", tier: "T5" },
      ],
      kpis: [
        { id: "roi_rd", label: "ROI R&D", formule: "(revenus nouveaux produits - investissement R&D) / investissement R&D × 100", benchmark: ">200%", seuils: { vert: 200, jaune: 100, rouge: 0 }, tier: "T4", unite: "%" },
        { id: "intensite_rd", label: "Intensité R&D", formule: "dépenses R&D / CA total", benchmark: ">5%", seuils: { vert: 5, jaune: 2, rouge: 0.5 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "veille",
      label: "Veille technologique & concurrentielle",
      description: "Sources de veille, tendances identifiées et intelligence de marché",
      icon: "Eye",
      pertinence: { T1: "I", T2: "I", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "sources_veille", label: "Sources de veille", type: "list", placeholder: "Salons, publications, réseaux, etc.", tier: "T2" },
        { id: "veille_concurrentielle_sources", label: "Sources de veille concurrentielle", type: "list", placeholder: "Outils, abonnements, processus de veille", tier: "T2" },
        { id: "tendances_cles", label: "Tendances clés identifiées", type: "textarea", placeholder: "3-5 tendances qui impactent votre secteur", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "prototypage",
      label: "Prototypage & Tests",
      description: "Prototypes actifs, tests utilisateurs et validation de concepts",
      icon: "Cpu",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "prototypes_actifs", label: "Prototypes actifs", type: "number", placeholder: "Nombre de prototypes en cours", tier: "T2" },
        { id: "budget_prototypage", label: "Budget alloué au prototypage", type: "currency", placeholder: "Budget en $", tier: "T3" },
        { id: "tests_utilisateurs", label: "Tests utilisateurs", type: "select", options: ["Réguliers", "Occasionnels", "Jamais"], placeholder: "Fréquence des tests", tier: "T3" },
      ],
      kpis: [
        { id: "ttm", label: "Time-to-Market", formule: "date lancement - date concept", benchmark: "<6 mois", seuils: { vert: 6, jaune: 12, rouge: 18 }, tier: "T3", unite: "mois" },
      ],
    },
    {
      id: "partenariats_rd",
      label: "Partenariats R&D",
      description: "Collaborations avec centres de recherche, universités et subventions",
      icon: "Handshake",
      pertinence: { T1: "O", T2: "I", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "partenaires_rd", label: "Partenaires R&D", type: "list", placeholder: "Universités, CCTT, centres de recherche", tier: "T3" },
        { id: "subventions_rd", label: "Subventions R&D", type: "textarea", placeholder: "Programmes de subventions actifs ou visés", tier: "T3" },
        { id: "partenariats_rd_actifs", label: "Partenariats R&D actifs (Centres de recherche)", type: "list", placeholder: "Ententes de collaboration en cours", tier: "T4" },
      ],
      kpis: [],
    },
  ],
};

// ── CROB — Rich — Ventes / Revenus (CRO) ──

const CROB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CROB",
  deptLabel: "Ventes & Revenus",
  intro: "Le d\u00e9partement des ventes orchestre la conversion de la demande en revenus. De la gestion du pipeline \u00e0 la m\u00e9thodologie de vente, en passant par la structure de commissionnement et la gestion des comptes cl\u00e9s, ce d\u00e9partement assure la pr\u00e9dictibilit\u00e9 de vos revenus et la sant\u00e9 de votre croissance commerciale.",
  subSections: [
    {
      id: "pipeline_funnel",
      label: "Pipeline & Funnel de vente",
      description: "Étapes de vente, pipeline d'opportunités et taux de conversion",
      icon: "TrendingUp",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "etapes_vente", label: "Étapes de vente", type: "list", placeholder: "Prospect, Qualifié, Proposition, Négociation, Fermé", tier: "T1" },
        { id: "valeur_pipeline", label: "Valeur du pipeline ($)", type: "currency", placeholder: "Valeur totale des opportunités", tier: "T1" },
        { id: "nb_opportunites", label: "Nombre d'opportunités", type: "number", placeholder: "Opportunités actives dans le pipeline", tier: "T1" },
        { id: "pipeline_prospects", label: "Pipeline (Liste de prospects)", type: "list", placeholder: "Noms des prospects actifs", tier: "T1" },
        { id: "outil_crm_basique", label: "Outil CRM basique", type: "text", placeholder: "Excel, HubSpot, Pipedrive, etc.", tier: "T1" },
        { id: "taux_conversion_global", label: "Taux de conversion global (%)", type: "percentage", placeholder: "% du funnel complet", tier: "T2" },
      ],
      kpis: [
        { id: "win_rate", label: "Win Rate", formule: "deals gagnés / deals totaux × 100", benchmark: ">25%", seuils: { vert: 25, jaune: 15, rouge: 8 }, tier: "T2", unite: "%" },
        { id: "couverture_pipeline", label: "Couverture du pipeline", formule: "valeur pipeline / quota", benchmark: ">3×", seuils: { vert: 3, jaune: 2, rouge: 1 }, tier: "T3", unite: "×" },
        { id: "velocite_pipeline", label: "Vélocité du Pipeline", formule: "(nb opps × valeur moy × win rate) / cycle vente", benchmark: "variable", seuils: { vert: 100000, jaune: 50000, rouge: 20000 }, tier: "T3", unite: "$/mois" },
      ],
      templates: ["pipeline-review-hebdo", "forecast-mensuel"],
      playbooks: ["qualification-deals", "acceleration-pipeline"],
    },
    {
      id: "methodologie_vente",
      label: "Méthodologie de vente",
      description: "Processus de vente, scripts et qualification des prospects",
      icon: "BookOpen",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "methodologie", label: "Méthodologie de vente", type: "select", options: ["SPIN", "Challenger", "MEDDIC", "Solution Selling", "Consultative", "Personnalisée", "Aucune"], placeholder: "Approche de vente", tier: "T2" },
        { id: "processus_qualif", label: "Processus de qualification", type: "select", options: ["BANT", "MEDDIC", "CHAMP", "Informel", "Aucun"], placeholder: "Méthode de qualification", tier: "T2" },
        { id: "scripts_vente", label: "Scripts de vente", type: "select", options: ["Formalisés", "Informels", "Absents"], placeholder: "Scripts documentés", tier: "T3" },
        { id: "crm_integre_facturation", label: "CRM intégré à la facturation", type: "select", options: ["Oui", "Non"], placeholder: "Intégration CRM-facturation", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "remuneration_ventes",
      label: "Rémunération des ventes",
      description: "Structure de commissions, OTE et quotas de l'équipe de vente",
      icon: "DollarSign",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "structure_commission", label: "Structure de commission", type: "textarea", placeholder: "% base vs variable, paliers, etc.", tier: "T3" },
        { id: "ote_moyen", label: "OTE moyen (On-Target Earnings)", type: "currency", placeholder: "Rémunération cible en $", tier: "T3" },
        { id: "quotas", label: "Quotas de vente", type: "textarea", placeholder: "Objectifs individuels et d'équipe", tier: "T3" },
        { id: "modelisation_quotas", label: "Modélisation de quotas de vente", type: "json", placeholder: "{\"rep1\": 500000, \"rep2\": 350000}", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "comptes_cles",
      label: "Comptes clés & Rétention",
      description: "Clients majeurs, rétention, cycle de vente et concentration",
      icon: "Star",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "top_clients", label: "Top clients", type: "list", placeholder: "Noms des clients principaux", tier: "T1" },
        { id: "top_3_clients", label: "Top 3 clients", type: "list", placeholder: "3 plus gros clients par revenus", tier: "T1" },
        { id: "taux_retention", label: "Taux de rétention (%)", type: "percentage", placeholder: "% de clients renouvelés", tier: "T2" },
        { id: "revenu_moyen_client", label: "Revenu moyen par client ($)", type: "currency", placeholder: "ARPC en $", tier: "T2" },
        { id: "cycle_vente_moyen_jours", label: "Cycle de vente moyen (jours)", type: "number", placeholder: "Jours entre premier contact et signature", tier: "T2" },
        { id: "taux_conclusion_estime", label: "Taux de conclusion estimé (%)", type: "percentage", placeholder: "% des propositions qui se ferment", tier: "T2" },
        { id: "taux_concentration_client", label: "Taux de concentration client (%)", type: "percentage", placeholder: "% du CA venant du top client", tier: "T4" },
      ],
      kpis: [
        { id: "cycle_vente", label: "Cycle de vente", formule: "moyenne jours prospect → client", benchmark: "<60 jours", seuils: { vert: 60, jaune: 90, rouge: 120 }, tier: "T2", unite: "jours" },
      ],
    },
    {
      id: "territoires",
      label: "Territoires & Équipe",
      description: "Découpage territorial et dimensionnement de l'équipe de vente",
      icon: "Map",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "decoupage", label: "Découpage territorial", type: "textarea", placeholder: "Régions, segments, comptes nommés", tier: "T3" },
        { id: "nb_vendeurs", label: "Nombre de vendeurs", type: "number", placeholder: "Taille de l'équipe vente", tier: "T3" },
        { id: "planification_territoires", label: "Planification de territoires", type: "json", placeholder: "{\"Quebec\": 2, \"Ontario\": 1}", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "formation_ventes",
      label: "Formation Ventes",
      description: "Intégration des représentants, onboarding, formation continue",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "programme_onboarding_ventes", label: "Programme d'onboarding ventes", type: "select", options: ["Formel", "Informel", "Absent"], placeholder: "Programme d'accueil ventes", tier: "T3" },
        { id: "plateforme_sales_enablement", label: "Plateforme de Sales Enablement", type: "text", placeholder: "Nom de la plateforme", tier: "T5" },
        { id: "formation_continue_qbrs", label: "Formation continue structurée (QBRs)", type: "select", options: ["Oui", "Non"], placeholder: "QBRs en place", tier: "T5" },
      ],
      kpis: [],
    },
  ],
};

// ── CLOB — Loulou — Legal (CLO) ──

const CLOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CLOB",
  deptLabel: "Juridique",
  intro: "Le d\u00e9partement l\u00e9gal prot\u00e8ge vos actifs, structure votre gouvernance et g\u00e8re vos risques contractuels et r\u00e9glementaires. La Loi 25 sur la protection des renseignements personnels impose des obligations \u00e0 TOUTES les entreprises qu\u00e9b\u00e9coises, sans exception de taille. La gestion de vos contrats, de votre propri\u00e9t\u00e9 intellectuelle et de votre conformit\u00e9 est un bouclier indispensable.",
  subSections: [
    {
      id: "structure_corporative",
      label: "Structure corporative",
      description: "Forme juridique, immatriculation, licences et gouvernance corporative",
      icon: "Building",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "type_entite", label: "Type d'entité", type: "select", options: ["Inc. fédérale", "Inc. provinciale", "SENC", "Enr.", "OBNL", "Coop"], placeholder: "Type d'incorporation", tier: "T1" },
        { id: "forme_juridique", label: "Forme juridique", type: "select", options: ["Enr.", "Inc.", "SENC", "OBNL", "Coop"], placeholder: "Forme juridique de l'entreprise", tier: "T1" },
        { id: "neq", label: "NEQ (Numéro d'entreprise du Québec)", type: "text", placeholder: "1234567890", tier: "T1" },
        { id: "date_incorporation", label: "Date d'incorporation", type: "date", tier: "T1" },
        { id: "modeles_contrats_clients", label: "Modèles de contrats clients", type: "select", options: ["Oui", "Non"], placeholder: "Modèles standardisés disponibles", tier: "T1" },
        { id: "minutes_a_jour", label: "Livre des minutes à jour", type: "select", options: ["Oui", "Non", "Partiellement"], placeholder: "État du livre des minutes", tier: "T2" },
        { id: "licences_permis", label: "Licences et permis", type: "list", placeholder: "RBQ, permis municipaux, etc.", tier: "T2" },
        { id: "organigramme_corporatif_legal", label: "Organigramme corporatif légal (Holding/Filiales)", type: "text", placeholder: "Structure holding/filiales", tier: "T5" },
      ],
      kpis: [],
      templates: ["convention-actionnaires", "resolution-admin"],
      playbooks: ["incorporation-checklist", "gouvernance-pme"],
    },
    {
      id: "conformite_loi25",
      label: "Conformité Loi 25 (Vie privée)",
      description: "Protection des renseignements personnels, RPRP, politique et évaluation",
      icon: "Lock",
      pertinence: { T1: "R", T2: "R", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "responsable_prp", label: "Responsable PRP (RPRP)", type: "text", placeholder: "Nom du responsable désigné", tier: "T1", required: true },
        { id: "politique_confidentialite", label: "Politique de confidentialité", type: "select", options: ["Publiée", "En rédaction", "Absente"], placeholder: "État de la politique", tier: "T1", required: true },
        { id: "rprp_nomme_nom", label: "RPRP nommé (nom)", type: "text", placeholder: "Nom complet du RPRP", tier: "T2" },
        { id: "inventaire_rp", label: "Inventaire des renseignements personnels", type: "select", options: ["Complété", "En cours", "Non fait"], placeholder: "État de l'inventaire", tier: "T2" },
        { id: "registre_incidents_loi25", label: "Registre des incidents Loi 25", type: "select", options: ["Créé", "Non créé"], placeholder: "Registre en place", tier: "T2" },
        { id: "efvp", label: "EFVP (Évaluation Facteurs Vie Privée)", type: "select", options: ["Complétée", "En cours", "Non fait"], placeholder: "État de l'EFVP", tier: "T3" },
        { id: "conformite_affichage_web", label: "Conformité d'affichage web (politiques, consentements témoins)", type: "select", options: ["Conforme", "Non conforme", "N/A"], placeholder: "Conformité du site web", tier: "T3" },
        { id: "efvp_completees", label: "EFVP complétées (liste de projets)", type: "list", placeholder: "Projets ayant fait l'objet d'une EFVP", tier: "T4" },
      ],
      kpis: [
        { id: "conformite_loi25_kpi", label: "Score conformité Loi 25", formule: "obligations complétées / total × 100", benchmark: "100%", seuils: { vert: 90, jaune: 60, rouge: 30 }, tier: "T1", unite: "%" },
      ],
    },
    {
      id: "contrats",
      label: "Contrats",
      description: "Contrats clients, fournisseurs, baux et registre centralisé",
      icon: "FileText",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "contrats_clients", label: "Contrats clients standardisés", type: "select", options: ["Oui", "Non", "Partiel"], placeholder: "Modèles de contrats clients", tier: "T1" },
        { id: "contrats_fournisseurs", label: "Contrats fournisseurs", type: "number", placeholder: "Nombre de contrats actifs", tier: "T2" },
        { id: "baux_actifs", label: "Baux actifs", type: "number", placeholder: "Nombre de baux en cours", tier: "T2" },
        { id: "registre_contrats", label: "Registre des contrats", type: "select", options: ["Centralisé", "Partiel", "Inexistant"], placeholder: "État du registre", tier: "T3" },
        { id: "registre_centralise_clm", label: "Registre centralisé des contrats (CLM)", type: "select", options: ["Oui", "Non"], placeholder: "Outil CLM en place", tier: "T4" },
      ],
      kpis: [
        { id: "delai_contractuel", label: "Délai contractuel moyen", formule: "jours entre demande et signature", benchmark: "<15 jours", seuils: { vert: 15, jaune: 30, rouge: 60 }, tier: "T3", unite: "jours" },
      ],
    },
    {
      id: "litiges",
      label: "Litiges & Assurances",
      description: "Litiges actifs, provisions, assurances responsabilité et couverture",
      icon: "AlertTriangle",
      pertinence: { T1: "I", T2: "I", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "litiges_actifs", label: "Litiges actifs", type: "number", placeholder: "Nombre de litiges en cours", tier: "T2" },
        { id: "assurances", label: "Assurances entreprise", type: "list", placeholder: "RC, E&O, D&O, etc.", tier: "T2" },
        { id: "assurances_responsabilite_montants", label: "Assurances responsabilité (montants)", type: "currency", placeholder: "Couverture totale en $", tier: "T3" },
        { id: "provisions_litiges", label: "Provisions pour litiges ($)", type: "currency", placeholder: "Montant provisionné en $", tier: "T3" },
        { id: "registre_litiges_potentiels", label: "Registre des litiges potentiels", type: "json", placeholder: "{\"litige1\": {\"statut\": \"actif\", \"montant\": 50000}}", tier: "T4" },
      ],
      kpis: [
        { id: "exposition_litiges", label: "Exposition litiges", formule: "provisions / CA × 100", benchmark: "<2%", seuils: { vert: 2, jaune: 5, rouge: 10 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "pi_marques",
      label: "PI & Marques",
      description: "Brevets, marques déposées, domaines web et protection internationale",
      icon: "Copyright",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "domaines_web", label: "Domaines web", type: "list", placeholder: "example.com, example.ca, etc.", tier: "T1" },
        { id: "marques_deposees", label: "Marques déposées", type: "list", placeholder: "Marques enregistrées à l'OPIC", tier: "T2" },
        { id: "brevets_deposes", label: "Brevets déposés", type: "number", placeholder: "Nombre de brevets actifs", tier: "T3" },
        { id: "pi_internationale", label: "PI internationale protégée", type: "select", options: ["Oui", "Non", "N/A"], placeholder: "Protection hors Canada", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "reglementaire",
      label: "Réglementaire",
      description: "Obligations sectorielles et échéancier de conformité",
      icon: "Clipboard",
      pertinence: { T1: "R", T2: "R", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "obligations_sectorielles", label: "Obligations sectorielles", type: "textarea", placeholder: "Normes et réglementations spécifiques au secteur", tier: "T3" },
        { id: "echeancier_conformite", label: "Échéancier de conformité", type: "textarea", placeholder: "Dates limites et obligations à venir", tier: "T3" },
      ],
      kpis: [
        { id: "score_conformite_global", label: "Score conformité global", formule: "obligations complétées / total × 100", benchmark: "100%", seuils: { vert: 90, jaune: 70, rouge: 50 }, tier: "T2", unite: "%" },
      ],
    },
  ],
};

// ── CISOB — Sébastien — Sécurité (CISO) ──

const CISOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CISOB",
  deptLabel: "Cybersécurité",
  intro: "La cybersécurité est passée d'un centre de coût technique à un impératif de survie commerciale. Les assureurs et les grands clients B2B exigent désormais des preuves de maturité en sécurité. Des politiques de base (MFA, sauvegardes) aux certifications avancées (ISO 27001, SOC 2), ce département protège votre entreprise contre les menaces numériques et vous ouvre l'accès aux contrats d'entreprise.",
  subSections: [
    {
      id: "politiques_iam",
      label: "Politiques & IAM",
      description: "Authentification multi-facteurs, mots de passe et gestion des accès",
      icon: "Key",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "mfa_active", label: "MFA activé", type: "select", options: ["Oui (partout)", "Partiel", "Non"], placeholder: "Authentification multi-facteurs", tier: "T1", required: true },
        { id: "politique_mdp", label: "Politique de mots de passe", type: "select", options: ["Gestionnaire MDP", "Politique formelle", "Informelle", "Aucune"], placeholder: "Gestion des mots de passe", tier: "T1", required: true },
        { id: "gestion_acces", label: "Gestion des accès", type: "select", options: ["RBAC formel", "Permissions ad hoc", "Aucune gestion"], placeholder: "Contrôle d'accès", tier: "T2" },
        { id: "procedure_onboarding_offboarding", label: "Procédure d'accueil/départ informatique", type: "select", options: ["Oui", "Non"], placeholder: "Procédure documentée", tier: "T2" },
        { id: "antivirus_edr", label: "Antivirus/EDR installé", type: "select", options: ["EDR", "Antivirus", "Aucun"], placeholder: "Protection des postes", tier: "T2" },
      ],
      kpis: [
        { id: "mfa_coverage", label: "Couverture MFA", formule: "comptes MFA / comptes totaux × 100", benchmark: "100%", seuils: { vert: 95, jaune: 80, rouge: 50 }, tier: "T1", unite: "%" },
      ],
      templates: ["politique-securite-info", "procedure-gestion-acces"],
      playbooks: ["mfa-rollout", "zero-trust-pme"],
    },
    {
      id: "sauvegardes",
      label: "Sauvegardes & Reprise",
      description: "Stratégie de backup, fréquence, plan de reprise et objectifs RPO/RTO",
      icon: "HardDrive",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "strategie_backup", label: "Stratégie de backup", type: "select", options: ["3-2-1", "Cloud auto", "Local seulement", "Aucune"], placeholder: "Approche de sauvegarde", tier: "T1", required: true },
        { id: "frequence_backup", label: "Fréquence de backup", type: "select", options: ["Continue", "Quotidienne", "Hebdomadaire", "Mensuelle", "Aucune"], placeholder: "Fréquence des sauvegardes", tier: "T1" },
        { id: "drp", label: "Plan de reprise après sinistre (DRP)", type: "select", options: ["Testé", "Documenté", "Informel", "Absent"], placeholder: "État du DRP", tier: "T2" },
        { id: "rpo_rto", label: "RPO/RTO définis", type: "select", options: ["Oui", "Partiellement", "Non"], placeholder: "Objectifs de reprise", tier: "T3" },
        { id: "rto_cible", label: "RTO cible (heures)", type: "number", placeholder: "Heures max d'interruption acceptable", tier: "T3" },
        { id: "rpo_cible", label: "RPO cible (heures)", type: "number", placeholder: "Heures max de données perdues acceptable", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "vulnerabilites",
      label: "Vulnérabilités & Tests",
      description: "Scans de vulnérabilités, tests de pénétration et cadre NIST",
      icon: "Bug",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "dernier_scan", label: "Dernier scan de vulnérabilités", type: "date", tier: "T3" },
        { id: "dernier_pentest", label: "Dernier test de pénétration", type: "date", tier: "T3" },
        { id: "vulnerabilites_ouvertes", label: "Vulnérabilités ouvertes", type: "number", placeholder: "Nombre de vulnérabilités non corrigées", tier: "T3" },
        { id: "rapport_pentest_date", label: "Rapport de test de pénétration récent", type: "date", tier: "T4" },
        { id: "cadre_nist_csf", label: "Adoption cadre NIST CSF", type: "select", options: ["Adopté", "En cours", "Non"], placeholder: "Cadre de référence", tier: "T4" },
      ],
      kpis: [
        { id: "patching_delay", label: "Délai de patching", formule: "jours entre publication patch et application", benchmark: "<30 jours", seuils: { vert: 30, jaune: 60, rouge: 90 }, tier: "T3", unite: "jours" },
      ],
    },
    {
      id: "formation_phishing",
      label: "Formation & Phishing",
      description: "Simulations de phishing, sensibilisation et formation en cybersécurité",
      icon: "Fish",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "derniere_simulation", label: "Dernière simulation de phishing", type: "date", tier: "T3" },
        { id: "taux_clic_phishing", label: "Taux de clic phishing (%)", type: "percentage", placeholder: "% d'employés qui ont cliqué", tier: "T3" },
        { id: "formation_securite", label: "Formation sécurité", type: "select", options: ["Annuelle obligatoire", "Ponctuelle", "Aucune"], placeholder: "Programme de formation", tier: "T3" },
      ],
      kpis: [
        { id: "phishing_score", label: "Score anti-phishing", formule: "100 - taux de clic phishing", benchmark: ">90%", seuils: { vert: 90, jaune: 75, rouge: 60 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "incidents_reponse",
      label: "Incidents & Réponse",
      description: "Plan de réponse aux incidents, historique et équipe de sécurité",
      icon: "Siren",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "plan_reponse", label: "Plan de réponse aux incidents", type: "select", options: ["Testé", "Documenté", "Informel", "Absent"], placeholder: "État du plan", tier: "T3" },
        { id: "incidents_12mois", label: "Incidents de sécurité (12 mois)", type: "number", placeholder: "Nombre d'incidents déclarés", tier: "T3" },
        { id: "registre_incidents_72h", label: "Registre incidents (signalement 72h Loi 25)", type: "select", options: ["Oui", "Non"], placeholder: "Registre conforme Loi 25", tier: "T3" },
        { id: "csirt", label: "Équipe CSIRT / responsable sécurité", type: "text", placeholder: "Nom ou structure", tier: "T4" },
      ],
      kpis: [
        { id: "mttr_securite", label: "MTTR (temps rétablissement)", formule: "temps moyen rétablissement systèmes", benchmark: "<4h", seuils: { vert: 4, jaune: 12, rouge: 24 }, tier: "T3", unite: "heures" },
      ],
    },
    {
      id: "certifications_securite",
      label: "Certifications sécurité",
      description: "Certifications, frameworks de référence, cyberassurance et SOC",
      icon: "ShieldCheck",
      pertinence: { T1: "O", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "certifications", label: "Certifications obtenues", type: "list", placeholder: "SOC 2, ISO 27001, etc.", tier: "T4" },
        { id: "certifications_visees", label: "Certifications visées", type: "list", placeholder: "En cours d'obtention", tier: "T4" },
        { id: "framework_reference", label: "Framework de référence", type: "select", options: ["NIST CSF", "ISO 27001", "CIS Controls", "SOC 2", "Aucun"], placeholder: "Cadre de sécurité", tier: "T4" },
        { id: "cyberassurance", label: "Cyberassurance (montant couverture)", type: "currency", placeholder: "Couverture en $", tier: "T4" },
        { id: "centre_soc", label: "Centre d'opérations de sécurité (SOC)", type: "select", options: ["Interne", "Externe (MSSP)", "Aucun"], placeholder: "Type de SOC", tier: "T5" },
      ],
      kpis: [],
    },
  ],
};

// ══════════════════════════════════════════════════════════════
// Registry — Tous les départements
// ══════════════════════════════════════════════════════════════

export const BLUEPRINT_CONFIGS: Record<string, DeptBlueprintConfig> = {
  CEOB: CEOB_BLUEPRINT,
  CTOB: CTOB_BLUEPRINT,
  CFOB: CFOB_BLUEPRINT,
  CMOB: CMOB_BLUEPRINT,
  CSOB: CSOB_BLUEPRINT,
  COOB: COOB_BLUEPRINT,
  CPOB: CPOB_BLUEPRINT,
  CHROB: CHROB_BLUEPRINT,
  CINOB: CINOB_BLUEPRINT,
  CROB: CROB_BLUEPRINT,
  CLOB: CLOB_BLUEPRINT,
  CISOB: CISOB_BLUEPRINT,
};

export function getBlueprintConfig(botCode: string): DeptBlueprintConfig | undefined {
  return BLUEPRINT_CONFIGS[botCode];
}

/** Nombre total de sous-sections a travers tous les departements */
export function getTotalSubSections(): number {
  return Object.values(BLUEPRINT_CONFIGS).reduce((sum, c) => sum + c.subSections.length, 0);
}

/** Score de completion d'un departement (0-100) base sur les champs remplis */
export function calculateCompletionScore(
  config: DeptBlueprintConfig,
  tier: SizeTier,
  data: Record<string, unknown>
): number {
  const visibleSections = getVisibleSubSections(config, tier);
  if (visibleSections.length === 0) return 100;

  let totalFields = 0;
  let filledFields = 0;

  for (const section of visibleSections) {
    const tierFields = getFieldsForTier(section.fields, tier);
    for (const field of tierFields) {
      totalFields++;
      const value = data[`${section.id}.${field.id}`] ?? data[field.id];
      if (value !== undefined && value !== null && value !== "" && value !== "[]") {
        filledFields++;
      }
    }
  }

  return totalFields === 0 ? 100 : Math.round((filledFields / totalFields) * 100);
}
