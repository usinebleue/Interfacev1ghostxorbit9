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

// ── Cross-Reference entre départements (Blueprint Organisme) ──

export interface CrossRef {
  sourceDept: string;       // Bot code du département source (ex: "CFOB")
  sourceSection: string;    // ID de la sous-section source (ex: "budget_previsions")
  sourceFields: string[];   // IDs des champs à lire (ex: ["budget_annuel"])
  label: string;            // Libellé affiché (ex: "Budget annuel (Finance)")
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
      id: "vue_consolidee",
      label: "Vue d'ensemble",
      description: "Agrégation des 11 départements, alertes, gaps prioritaires",
      intro: "Vue d'ensemble des 11 départements — le tableau de bord stratégique du CEO. Les scores, gaps critiques et données clés de chaque département en un coup d'œil. Les tensions entre départements sont signalées automatiquement.",
      icon: "Layers",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "score_global", label: "Score Santé Global", formule: "moyenne pondérée 12 depts", benchmark: "70/100", seuils: { vert: 70, jaune: 50, rouge: 30 }, tier: "T2", unite: "/100" },
        { id: "nb_gaps_critiques", label: "Gaps critiques", formule: "sections C vides", benchmark: "0", seuils: { vert: 0, jaune: 3, rouge: 5 }, tier: "T2", unite: "" },
      ],
    },
    {
      id: "sommaire_executif",
      label: "Sommaire Exécutif",
      description: "Résumé exécutif de l'entreprise — le pitch en 1 page",
      intro: "Votre sommaire exécutif est la première impression — le seul document que TOUS vos interlocuteurs liront. Investisseurs, partenaires, banquiers : vous avez 30 secondes pour capter leur attention. Un bon pitch clarifie le problème, la solution et le potentiel en un paragraphe.",
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
      id: "description_historique",
      label: "Description & Historique",
      description: "Histoire de l'entreprise, jalons majeurs, réalisations clés",
      intro: "L'histoire de votre entreprise construit votre crédibilité. Les jalons majeurs et reconnaissances sont des preuves sociales puissantes qui renforcent la confiance. C'est aussi la base de votre storytelling marketing.",
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
      intro: "Le profil entreprise est la fiche d'identité fondamentale qui alimente TOUTES les autres sections du blueprint. Le nombre d'employés détermine votre palier de taille et les obligations réglementaires applicables. La mission et la vision sont le fil conducteur de votre stratégie.",
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
      id: "profil_public",
      label: "Profil Public (Orbit9)",
      description: "Informations publiques — visible sur le réseau Orbit9",
      intro: "Votre profil public est votre vitrine sur le réseau Orbit9. C'est ce que les partenaires potentiels, investisseurs et clients voient en premier. Un profil complet avec logo, description et certifications augmente vos chances de jumelage et de crédibilité.",
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
      intro: "La qualité de votre équipe de direction est le facteur #1 évalué par les investisseurs. Une équipe complémentaire avec des lacunes identifiées démontre de la maturité. Les conseillers externes multiplient votre accès aux opportunités.",
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
      intro: "Votre catalogue est le cœur de votre proposition de valeur. La répartition des revenus par produit révèle vos dépendances et opportunités de diversification. Les marges par produit et la rétention sont les indicateurs les plus prédictifs de votre santé commerciale.",
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
      id: "bmc",
      label: "BMC",
      description: "Business Model Canvas — 9 blocs",
      intro: "Le Business Model Canvas en 9 blocs est le standard mondial pour décrire votre modèle d'affaires. Il force la clarté sur COMMENT vous créez, délivrez et capturez de la valeur. C'est souvent le premier exercice demandé par les accélérateurs et investisseurs.",
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
      intro: "Les 5 piliers VITAA (Vente, Idée, Temps, Argent, Actif) évaluent la santé globale de votre entreprise. Les scores alimentent le Triangle du Feu et déterminent les playbooks prioritaires. Les OKRs trimestriels transforment la vision en actions mesurables.",
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
      intro: "La santé financière vue de la Direction : revenus, marges et horizons de croissance. Ces données sont croisées avec le département Finance pour détecter les incohérences. Les avantages concurrentiels financiers (pricing power, récurrence) sont des moats stratégiques.",
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
      id: "swot",
      label: "SWOT",
      description: "Forces, faiblesses, opportunités, menaces",
      intro: "L'analyse SWOT croise vos forces internes avec les opportunités et menaces externes. Les actions prioritaires qui en découlent sont le pont entre l'analyse et l'exécution. Cette section est enrichie par les données des 11 autres départements.",
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
      id: "gouvernance",
      label: "Gouvernance",
      description: "Entité légale, actionnariat, CA, pacte d'actionnaires",
      intro: "La gouvernance structure le pouvoir décisionnel de votre entreprise. Un CA indépendant et une convention d'actionnaires à jour sont des prérequis pour la croissance. À partir de 100 employés, la gouvernance formelle devient recommandée.",
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
      id: "culture_esg",
      label: "Culture & ESG",
      description: "Éthique, empreinte carbone, DEI, certifications",
      intro: "Les critères ESG sont de plus en plus exigés par les donneurs d'ordres et les institutions financières. La certification B Corp et le score EcoVadis deviennent des différenciateurs commerciaux. Le code d'éthique et les politiques DEI renforcent votre marque employeur.",
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
      id: "risques_sortie",
      label: "Risques & Sortie",
      description: "Matrice risques, PCA, exit strategy, valorisation",
      intro: "La gestion des risques et la planification de sortie sont critiques pour la pérennité. Un plan de continuité (PCA) protège contre les crises, et la définition précoce de votre stratégie de sortie maximise la valorisation future.",
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
      id: "conseil_administration",
      label: "Conseil d'administration",
      description: "Membres du CA, structure de gouvernance, réunions et comités",
      intro: "Le conseil d'administration est l'organe de gouvernance suprême de votre organisation. Identifier vos administrateurs, définir leurs rôles et leur donner accès à la plateforme permet une gouvernance transparente et efficace. Les membres du CA peuvent être invités automatiquement aux réunions (Conférence AI ou présentiel), recevoir les minutes et suivre les résultats de l'organisation en temps réel.",
      icon: "Building2",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "nb_membres_ca", label: "Nombre de membres au CA", type: "number", tier: "T2" },
        { id: "president_ca", label: "Président(e) du CA", type: "text", tier: "T2", required: true },
        { id: "membres_ca", label: "Membres du CA (nom, rôle, expertise)", type: "json", placeholder: "[{\"nom\": \"\", \"role\": \"\", \"expertise\": \"\", \"courriel\": \"\", \"depuis\": \"\"}]", tier: "T2" },
        { id: "membres_independants", label: "Nombre de membres indépendants", type: "number", tier: "T4" },
        { id: "comites_ca", label: "Comités du CA (audit, RH, stratégie, etc.)", type: "list", tier: "T3" },
        { id: "frequence_reunions_ca", label: "Fréquence des réunions du CA", type: "select", options: ["Mensuelle", "Bimestrielle", "Trimestrielle", "Semestrielle", "Annuelle"], tier: "T2" },
        { id: "format_reunions_ca", label: "Format des réunions", type: "select", options: ["Présentiel", "Conférence AI", "Hybride"], tier: "T2" },
        { id: "prochaine_reunion_ca", label: "Prochaine réunion du CA", type: "date", tier: "T2" },
        { id: "mandat_admin", label: "Durée des mandats (années)", type: "number", tier: "T3" },
        { id: "charte_ca", label: "Charte du CA documentée", type: "select", options: ["Oui", "En rédaction", "Non"], tier: "T3" },
        { id: "assurance_administrateurs", label: "Assurance responsabilité des administrateurs (D&O)", type: "select", options: ["Oui", "Non", "En évaluation"], tier: "T4" },
        { id: "processus_evaluation_ca", label: "Processus d'évaluation du CA", type: "select", options: ["Annuel formel", "Informel", "Aucun"], tier: "T4" },
        { id: "acces_plateforme_ca", label: "Accès plateforme pour les membres du CA", type: "select", options: ["Tous les membres", "Président seulement", "Pas encore configuré"], tier: "T2" },
        { id: "distribution_minutes", label: "Distribution automatique des minutes", type: "select", options: ["Activée", "Manuelle", "Non configurée"], tier: "T2" },
        { id: "comite_direction", label: "Membres du comité de direction", type: "json", placeholder: "[{\"nom\": \"\", \"titre\": \"\", \"departement\": \"\"}]", tier: "T3" },
        { id: "frequence_comite_direction", label: "Fréquence comité de direction", type: "select", options: ["Hebdomadaire", "Bimensuelle", "Mensuelle", "Bimestrielle"], tier: "T3" },
      ],
      kpis: [
        { id: "taux_presence_ca", label: "Taux de présence CA", formule: "Présences / (Membres × Réunions) × 100", benchmark: ">85%", seuils: { vert: 85, jaune: 70, rouge: 50 }, tier: "T3", unite: "%" },
        { id: "nb_reunions_annuelles", label: "Réunions CA / an", benchmark: "4-12 selon taille", seuils: { vert: 4, jaune: 2, rouge: 1 }, tier: "T3", unite: "" },
        { id: "ratio_independants", label: "Ratio membres indépendants", formule: "Indépendants / Total × 100", benchmark: ">33% PME, >50% grande", seuils: { vert: 50, jaune: 33, rouge: 10 }, tier: "T4", unite: "%" },
      ],
      playbooks: ["reunion-conseil-administration", "conference-ai-ca", "playbook-comite-direction"],
      templates: ["ordre-du-jour-ca", "minutes-conseil-administration", "charte-gouvernance-ca"],
    },
    {
      id: "kpis_direction",
      label: "KPIs Direction",
      description: "VITAA Global, exécution stratégique, croissance CA",
      intro: "Les KPIs de la Direction mesurent la performance globale. Le VITAA Global, la croissance CA, le NPS et l'atteinte des OKRs sont vos indicateurs de santé stratégique, alimentés par les données des départements spécialisés.",
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
      intro: "Votre pile technologique est le fondement de votre capacité d'exécution numérique. Chaque outil doit être documenté pour identifier les redondances, les risques de vendor lock-in et les opportunités d'automatisation. Ces données alimentent le département Cybersécurité.",
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
      id: "architecture_si",
      label: "Architecture SI",
      description: "CRM, ERP, SIRH, intégrations",
      intro: "L'architecture de vos systèmes d'information (CRM, ERP, SIRH) détermine votre efficacité opérationnelle. Les intégrations entre systèmes éliminent les silos de données. Un diagramme d'architecture à jour est un prérequis pour tout audit technique.",
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
      intro: "L'infrastructure soutient la disponibilité et la performance de vos services. Le monitoring, les SLAs et les coûts doivent être suivis en continu. Le uptime cible de 99.5% est le standard minimum pour les applications critiques.",
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
      id: "roadmap_tech",
      label: "Roadmap Tech",
      description: "Gantt déploiements, jalons techniques",
      intro: "La feuille de route technologique aligne les investissements IT avec les objectifs d'affaires. Des jalons trimestriels clairs permettent de mesurer la progression et de réajuster les priorités.",
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
      id: "dette_technique",
      label: "Dette Technique",
      description: "Registre composants à refactoriser",
      intro: "La dette technique est le coût invisible qui ralentit votre développement. Comme une dette financière, elle s'accumule avec les intérêts. Un registre transparent et un plan de remédiation priorisé permettent de garder le contrôle.",
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
      id: "securite_applicative",
      label: "Sécurité Applicative",
      description: "DevSecOps, OWASP, pen tests",
      intro: "La sécurité applicative protège vos logiciels contre les vulnérabilités (OWASP Top 10). Les tests de pénétration réguliers et un pipeline DevSecOps automatisé préviennent les brèches. Section complémentaire au département Cybersécurité.",
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
      intro: "Les KPIs technologiques mesurent la santé de votre infrastructure. L'uptime, le MTTR, le coût par client et le ratio de dette technique sont les indicateurs clés que les CTO de PME performantes surveillent.",
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
      intro: "Les playbooks technologiques guident les décisions majeures : audit de sécurité annuel, migration cloud et plan de reprise après sinistre. Chaque playbook inclut des étapes concrètes adaptées à votre palier de taille.",
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
      id: "modele_revenus",
      label: "Mod\u00e8le de Revenus",
      description: "R\u00e9current, transactionnel, pricing",
      intro: "Votre modèle de revenus détermine votre prévisibilité financière et votre valorisation. Les modèles récurrents (SaaS, abonnement) obtiennent des multiples 3-5x supérieurs aux modèles transactionnels. Comprendre votre MRR/ARR est essentiel.",
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
      id: "budget_previsions",
      label: "Budget & Pr\u00e9visions",
      description: "Budget annuel, CAPEX/OPEX, sc\u00e9narios",
      intro: "Le budget est votre boussole financière. La distinction CAPEX/OPEX impacte votre fiscalité et valorisation. Les prévisions à 3 ans sont exigées par les investisseurs. Un budget par centre de coûts donne une visibilité fine sur vos marges.",
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
      id: "tresorerie",
      label: "Tr\u00e9sorerie",
      description: "Cash flow 13 semaines, runway, burn rate",
      intro: "La trésorerie est le nerf de la guerre — 82% des faillites de PME sont dues à des problèmes de cash flow. Le Cash Flow 13 semaines est l'outil de survie par excellence. Le Cycle de Conversion en Espèces (CCC) est LA métrique à optimiser.",
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
      id: "etats_financiers",
      label: "\u00c9tats Financiers",
      description: "Bilan, r\u00e9sultats, flux de tr\u00e9sorerie",
      intro: "Les états financiers sont la carte de santé de votre entreprise. Le bilan, les résultats et les flux doivent être à jour pour toute demande de financement. La marge BAIIA (EBITDA) est le multiple de référence pour la valorisation des PME.",
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
      id: "fiscalite",
      label: "Fiscalit\u00e9 & Incitatifs",
      description: "RS&DE, CRIC, subventions actives",
      intro: "La fiscalité québécoise offre des avantages significatifs : crédits RS&DE (35% fédéral + 30% provincial sur le premier million), crédits CDAE et programmes régionaux. L'inscription TPS/TVQ est obligatoire dès 30 000$ de revenus.",
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
      id: "valorisation",
      label: "Valorisation",
      description: "Multiples, EBITDA normalis\u00e9, QoE",
      intro: "La valorisation reflète la capacité de votre entreprise à générer des profits futurs. L'EBITDA normalisé, le multiple du secteur et la Quality of Earnings (QoE) sont les outils utilisés par les acquéreurs.",
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
      intro: "Les KPIs financiers sont les signaux vitaux. Le runway, la marge EBITDA, le CCC et la liquidité courante doivent être surveillés mensuellement. La Rule of 40 est le benchmark de référence pour les entreprises SaaS.",
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
      intro: "Les playbooks financiers guident les décisions critiques : prévision de trésorerie 13 semaines, préparation au financement et due diligence financière pour sécuriser les transactions.",
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
      intro: "Le profil client idéal (ICP) est la fondation de TOUTE votre stratégie marketing. Un ICP précis réduit votre coût d'acquisition et augmente la qualité de vos leads. Les données ventes (clients actuels) valident ou invalident vos hypothèses.",
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
      intro: "Votre positionnement différencie votre entreprise dans l'esprit du client. La proposition de valeur unique (UVP) doit être claire, mémorable et vérifiable. La charte graphique et le ton de voix assurent la cohérence de votre marque.",
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
      intro: "Le mix marketing et l'allocation budgétaire déterminent votre capacité d'acquisition. Le ROI par canal permet de concentrer les investissements sur ce qui fonctionne. Les données de ventes valident l'efficacité de chaque canal.",
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
      intro: "Le contenu est le carburant de votre machine marketing. Un calendrier éditorial structuré et des lead magnets de qualité transforment les visiteurs en prospects qualifiés. Les campagnes actives alimentent directement le pipeline de ventes.",
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
      intro: "L'automatisation marketing libère du temps pour la stratégie. Le lead scoring priorise les prospects les plus chauds, et les workflows de nurturing maintiennent l'engagement sur le long terme. L'attribution multi-touch révèle le vrai ROI.",
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
      intro: "Votre réputation est votre actif marketing le plus précieux. Les témoignages clients, le NPS et les événements construisent la confiance. Un plan de gestion de crise RP protège cette réputation en cas d'incident.",
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
      intro: "Les KPIs marketing mesurent l'efficacité de votre machine d'acquisition. Le CAC, le ratio LTV:CAC, le taux de conversion et le NPS sont les indicateurs qui déterminent si votre marketing crée ou détruit de la valeur.",
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
      intro: "Les playbooks marketing guident l'exécution : stratégie de contenu B2B, lancement de campagne lead generation et audit de marque. Chaque playbook est adapté à votre phase de croissance.",
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
      id: "marche",
      label: "March\u00e9 (TAM/SAM/SOM)",
      description: "Taille de march\u00e9, potentiel, p\u00e9n\u00e9tration",
      intro: "Le dimensionnement du marché (TAM/SAM/SOM) quantifie votre opportunité réelle. La part de marché actuelle et le potentiel de croissance sont des données essentielles pour les investisseurs et la planification stratégique.",
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
      intro: "L'analyse concurrentielle identifie vos rivaux directs et indirects. La matrice de positionnement révèle vos espaces de différenciation. Les données de marketing et d'innovation viennent enrichir cette analyse.",
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
      id: "avantage_concurrentiel",
      label: "Avantage Concurrentiel",
      description: "Moats, PI, effets r\u00e9seau",
      intro: "Vos avantages concurrentiels durables (moats) protègent votre position sur le marché. Brevets, effets réseau, marque, coûts de changement — chaque moat rend votre entreprise plus difficile à déloger. L'analyse des 5 forces de Porter formalise ces barrières.",
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
      id: "pestel",
      label: "Analyse PESTEL",
      description: "Politique, \u00c9conomique, Social, Technologique, Environnemental, L\u00e9gal",
      intro: "L'analyse PESTEL identifie les forces macro-environnementales qui impactent votre entreprise. Les facteurs Politique, Économique, Social, Technologique, Environnemental et Légal structurent votre veille stratégique et anticipent les risques.",
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
      id: "partenariats",
      label: "Partenariats Strat\u00e9giques",
      description: "Alliances, JV, distribution",
      intro: "Les partenariats stratégiques multiplient votre portée sans multiplier vos coûts. Les alliances de distribution, de R&D et les JV sont des leviers de croissance puissants. Les partenaires cibles doivent être alignés avec votre stratégie.",
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
      intro: "La diversification réduit votre dépendance à un seul marché ou produit. La matrice Ansoff structure vos options (nouveaux produits, nouveaux marchés). L'internationalisation et les acquisitions M&A sont des leviers de croissance accélérée.",
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
      id: "kpis_strategie",
      label: "KPIs Strat\u00e9gie",
      description: "Part de march\u00e9, concentration client, initiatives",
      intro: "Les KPIs stratégiques mesurent votre positionnement dans le marché. La part de marché, la concentration client et le nombre d'initiatives stratégiques en cours indiquent si votre stratégie se traduit en résultats concrets.",
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
      intro: "Les playbooks stratégiques structurent les décisions majeures : analyse concurrentielle approfondie, plan d'expansion marché et préparation aux acquisitions (M&A).",
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
      intro: "La cartographie de vos processus est la base de toute optimisation. Sans documentation, l'expertise reste dans la tête des employés — un risque majeur. Les goulots identifiés sont vos premières opportunités d'amélioration.",
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
      id: "capacite_planification",
      label: "Capacit\u00e9 & Planification",
      description: "Suivi goulots d\u2019\u00e9tranglement, saisonnalit\u00e9, Theory of Constraints",
      intro: "La planification de la capacité anticipe les goulots d'étranglement avant qu'ils ne deviennent des crises. La saisonnalité, la demande commerciale (Ventes) et la Theory of Constraints optimisent votre utilisation des ressources.",
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
      id: "supply_chain",
      label: "Supply Chain",
      description: "Fournisseurs, lead times, risques",
      intro: "Votre chaîne d'approvisionnement est aussi forte que son maillon le plus faible. La dépendance à un fournisseur unique est un risque critique. Les données de stocks (Production) et de trésorerie (Finance) doivent être croisées.",
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
      intro: "Vos installations et votre capacité logistique déterminent votre potentiel de croissance physique. Les baux, la superficie et le taux d'utilisation révèlent si vous êtes en sous-capacité ou en surcapacité.",
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
      id: "gestion_fournisseurs",
      label: "Gestion Fournisseurs",
      description: "\u00c9valuation, SLA, performance",
      intro: "L'évaluation structurée de vos fournisseurs réduit les risques et améliore la qualité. Les SLAs formels et les audits de la chaîne d'approvisionnement sont des prérequis pour les certifications ISO et les grands donneurs d'ordres.",
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
      id: "amelioration_continue",
      label: "Am\u00e9lioration Continue",
      description: "Kaizen, Lean, 5S, Six Sigma",
      intro: "L'amélioration continue (Lean, 5S, Six Sigma) transforme la culture de votre entreprise. Les gains de productivité au Québec sont un enjeu national — les PME qui adoptent ces méthodologies surpassent leurs concurrents de 20-30%.",
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
      id: "kpis_operations",
      label: "KPIs Op\u00e9rations",
      description: "OTIF, productivit\u00e9, d\u00e9lai commandes",
      intro: "Les KPIs opérationnels mesurent votre efficacité d'exécution. L'OTIF, la productivité par employé, le délai moyen des commandes et la rotation des stocks sont vos indicateurs de performance opérationnelle.",
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
      intro: "Les playbooks opérationnels guident l'optimisation : cartographie des processus critiques, audit de la chaîne d'approvisionnement et programme 5S pour l'excellence opérationnelle.",
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
      intro: "La planification de la production aligne votre capacité avec la demande commerciale. Le BOM (Bill of Materials) et les systèmes MRP/MES structurent votre production. Les données de pipeline ventes alimentent vos prévisions.",
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
      intro: "La gestion des stocks optimise votre fonds de roulement. La méthode FIFO/LIFO, les points de commande et la rotation des stocks sont les leviers clés. Un inventaire excessif immobilise du cash; un inventaire insuffisant perd des ventes.",
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
      intro: "L'assurance qualité protège votre réputation et réduit les coûts. Le taux de non-conformité et le coût de la non-qualité (CNQ) sont souvent sous-estimés par les PME. Les certifications ISO sont souvent exigées par vos donneurs d'ordres.",
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
      id: "equipements",
      label: "Équipements & Maintenance",
      description: "Actifs critiques, maintenance préventive et taux de rendement synthétique",
      intro: "Vos équipements critiques sont le cœur de votre capacité de production. La maintenance préventive réduit les arrêts non planifiés. Le TRS (OEE) mesure l'efficacité globale — un TRS de 75% est considéré comme un benchmark de classe mondiale.",
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
      id: "sst",
      label: "Santé & Sécurité au Travail (SST)",
      description: "Programme de prévention, CNESST, incidents et conformité SST",
      intro: "La santé et sécurité au travail (SST) est une obligation légale et un devoir moral. Le programme de prévention est obligatoire dès le premier employé (CNESST). Le comité SST est requis à partir de 20 employés. Les taux de fréquence et le TCIR mesurent votre performance.",
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
      id: "normes_certifications",
      label: "Normes & Certifications",
      description: "Certifications actives, audits et conformité réglementaire de production",
      intro: "Les certifications (ISO 9001, IATF 16949, HACCP) sont souvent un permis d'opérer imposé par vos clients. La conformité réglementaire et les audits réguliers protègent votre accès aux marchés et renforcent votre crédibilité.",
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
      intro: "L'organigramme formalisé clarifie les rôles et les lignes de responsabilité. Le nombre d'employés exact détermine vos obligations réglementaires (équité salariale à 10+, Loi 96 à 25+, comité SST à 20+). Les postes ouverts révèlent vos besoins de croissance.",
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
      id: "recrutement",
      label: "Recrutement",
      description: "Processus de recrutement, sources et délais d'embauche",
      intro: "Le recrutement est le goulot d'étranglement #1 des PME québécoises (78% ont des difficultés). Le délai d'embauche, les canaux et le processus d'intégration déterminent votre capacité de croissance. Les besoins de la Direction et des Ventes alimentent vos priorités.",
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
      id: "remuneration",
      label: "Rémunération & Avantages",
      description: "Grilles salariales, avantages sociaux et masse salariale",
      intro: "La rémunération et les avantages sociaux sont vos outils principaux de rétention dans un marché en pénurie de main-d'œuvre. Les grilles salariales formelles réduisent les iniquités et les risques de litige. Les données Finance alimentent votre budget.",
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
      id: "formation",
      label: "Formation & Développement",
      description: "Plan de formation, budgets et heures de formation par employé",
      intro: "La formation est un investissement, pas un coût. La Loi 90 oblige les entreprises de 2M$+ de masse salariale à investir 1% en formation. Les besoins en cybersécurité (CISO) et en SST (Production) définissent les priorités.",
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
      id: "culture_engagement",
      label: "Culture & Engagement",
      description: "Engagement des employés, culture d'entreprise et politiques de travail",
      intro: "L'engagement des employés est le meilleur prédicteur de la performance et de la rétention. L'eNPS (Employee Net Promoter Score) mesure le sentiment. Les sondages d'engagement réguliers identifient les problèmes avant qu'ils ne deviennent des départs.",
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
      intro: "La planification de la relève protège votre entreprise contre les départs clés. Le taux de roulement annuel est votre signal d'alerte. Les hauts potentiels identifiés et le plan de succession formalisé assurent la continuité.",
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
    {
      id: "conformite_rh",
      label: "Conformité RH",
      description: "Équité salariale, harcèlement, francisation et obligations légales",
      intro: "La conformité RH au Québec est complexe et les sanctions sont réelles. L'équité salariale (10+ employés), la politique de harcèlement, la francisation (25+ employés) et l'attestation OQLF sont des obligations légales. Le département Juridique fournit le cadre.",
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
      id: "kpis_rh",
      label: "KPIs RH",
      description: "Turnover, revenu par employé, délai d'embauche, eNPS",
      intro: "Les KPIs RH mesurent votre capacité à attirer, développer et retenir les talents. Le taux de roulement, le revenu par employé et le délai d'embauche sont les indicateurs qui déterminent si votre gestion RH soutient ou freine votre croissance.",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "turnover_global_kpi", label: "Taux de roulement global", formule: "départs / effectif moyen × 100", benchmark: "<15%", seuils: { vert: 15, jaune: 25, rouge: 40 }, tier: "T3", unite: "%" },
        { id: "revenu_par_employe_kpi", label: "Revenu par employé", formule: "CA / effectif moyen", benchmark: ">150K$", seuils: { vert: 150000, jaune: 100000, rouge: 60000 }, tier: "T3", unite: "$" },
        { id: "time_to_fill_global_kpi", label: "Délai moyen d'embauche", formule: "date embauche - date ouverture", benchmark: "<45 jours", seuils: { vert: 45, jaune: 75, rouge: 120 }, tier: "T3", unite: "jours" },
        { id: "enps_global_kpi", label: "eNPS Global", formule: "(promoteurs - détracteurs) / total × 100", benchmark: ">30", seuils: { vert: 30, jaune: 10, rouge: -10 }, tier: "T3", unite: "" },
      ],
    },
    {
      id: "playbooks_rh",
      label: "Playbooks",
      description: "Playbooks RH par phase de croissance",
      intro: "Les playbooks RH guident les actions critiques à chaque phase de croissance : plan de recrutement structuré, programme de rétention et plan de succession. Chaque playbook est adapté à votre taille et vos enjeux spécifiques.",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["plan-recrutement-structure", "programme-retention-talents", "plan-succession-direction"],
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
      intro: "Votre pipeline d'innovation est le moteur de croissance à long terme. L'indice de vitalité (% du CA provenant de produits de moins de 3 ans) mesure votre dynamisme. Les besoins clients (Marketing) et les tendances (Stratégie) alimentent vos idées.",
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
      id: "prototypage",
      label: "Prototypage & Tests",
      description: "Prototypes actifs, tests utilisateurs et validation de concepts",
      intro: "Le prototypage accélère la validation de vos idées avant l'investissement massif. Le Time-to-Market (TTM) mesure votre agilité d'innovation. Les tests utilisateurs réguliers réduisent le risque d'échec commercial.",
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
      id: "propriete_intellectuelle",
      label: "Propriété intellectuelle",
      description: "Brevets, marques de commerce, secrets commerciaux et portefeuille PI",
      intro: "La propriété intellectuelle est souvent le premier actif évalué lors d'un exit. Brevets, marques de commerce et secrets commerciaux doivent être documentés et protégés. Le département Juridique assure la protection légale.",
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
      intro: "Les crédits RS&DE représentent jusqu'à 35% (fédéral) + 30% (provincial sur le premier million) de vos dépenses de R&D admissibles. La documentation est la clé — des projets bien documentés maximisent vos réclamations. Les données Finance valident l'admissibilité.",
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
      intro: "La veille technologique et concurrentielle alimente votre pipeline d'innovation. Les salons, publications et réseaux sont vos capteurs. Les tendances identifiées orientent vos investissements R&D et vos partenariats.",
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
      id: "partenariats_rd",
      label: "Partenariats R&D",
      description: "Collaborations avec centres de recherche, universités et subventions",
      intro: "Les partenariats R&D avec les universités, CCTT et centres de recherche québécois donnent accès à des ressources et subventions. Les programmes comme MITACS et le CRSNG financent la collaboration entreprise-recherche.",
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
      intro: "Votre pipeline de vente est la meilleure prédiction de vos revenus futurs. Le Win Rate, la couverture et la vélocité du pipeline sont les 3 métriques que tout CEO doit connaître. Les leads marketing alimentent le haut du funnel.",
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
      intro: "Une méthodologie de vente structurée (SPIN, Challenger, MEDDIC) augmente votre prévisibilité. Le processus de qualification filtre les prospects non rentables. Les scripts formalisés réduisent le temps de formation des nouveaux vendeurs.",
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
      id: "comptes_cles",
      label: "Comptes clés & Rétention",
      description: "Clients majeurs, rétention, cycle de vente et concentration",
      intro: "La gestion de vos comptes clés protège vos revenus récurrents. La concentration client (% CA du top client) est un risque souvent sous-estimé. Le cycle de vente moyen et le taux de rétention sont vos indicateurs de santé commerciale.",
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
      intro: "Le découpage territorial optimise la couverture de votre marché. Le dimensionnement de l'équipe de vente doit correspondre au potentiel de chaque territoire. Les données de marché (Stratégie) alimentent cette planification.",
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
      id: "remuneration_ventes",
      label: "Rémunération des ventes",
      description: "Structure de commissions, OTE et quotas de l'équipe de vente",
      intro: "La structure de rémunération des ventes aligne les comportements avec vos objectifs. Le ratio base/variable, les quotas et l'OTE déterminent la motivation. Les données RH et Finance doivent être cohérentes avec votre plan de commission.",
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
      id: "formation_ventes",
      label: "Formation Ventes",
      description: "Intégration des représentants, onboarding, formation continue",
      intro: "La formation des vendeurs est un investissement à rendement rapide. Un onboarding structuré réduit le temps de ramp-up de 40%. Le Sales Enablement et les QBRs maintiennent la performance dans la durée.",
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
      intro: "La structure corporative est le squelette légal de votre entreprise. Le type d'entité (Inc., SENC, Enr.) a des implications fiscales, de responsabilité et de gouvernance majeures. Le livre des minutes doit être tenu à jour pour la protection des administrateurs.",
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
      id: "contrats",
      label: "Contrats",
      description: "Contrats clients, fournisseurs, baux et registre centralisé",
      intro: "Les contrats sont le bouclier de votre entreprise. Des modèles standardisés réduisent les risques et accélèrent les transactions. Le registre centralisé (CLM) prévient les renouvellements oubliés et les clauses défavorables.",
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
      id: "pi_marques",
      label: "PI & Marques",
      description: "Brevets, marques déposées, domaines web et protection internationale",
      intro: "La protection de votre propriété intellectuelle (marques, brevets, domaines) est un investissement stratégique. Les marques déposées à l'OPIC protègent votre identité. Les données du département Innovation alimentent votre stratégie PI.",
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
      id: "conformite_loi25",
      label: "Conformité Loi 25 (Vie privée)",
      description: "Protection des renseignements personnels, RPRP, politique et évaluation",
      intro: "La Loi 25 sur la protection des renseignements personnels s'applique à TOUTES les entreprises québécoises sans exception. Le RPRP doit être nommé, la politique publiée, et les incidents signalés en 72 heures. La non-conformité expose à des sanctions significatives.",
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
      id: "reglementaire",
      label: "Réglementaire",
      description: "Obligations sectorielles et échéancier de conformité",
      intro: "Les obligations réglementaires sectorielles varient considérablement. L'échéancier de conformité prévient les surprises et les sanctions. Le score de conformité global mesure votre exposition au risque réglementaire.",
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
    {
      id: "litiges",
      label: "Litiges & Assurances",
      description: "Litiges actifs, provisions, assurances responsabilité et couverture",
      intro: "Les litiges actifs et potentiels sont un risque financier et réputationnel. Les provisions adéquates et les assurances appropriées (RC, E&O, D&O) protègent vos actifs. Un registre des litiges potentiels anticipe les problèmes.",
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
      intro: "L'authentification multi-facteurs (MFA) et la gestion des accès sont votre première ligne de défense. 80% des brèches exploitent des identifiants compromis. Le gestionnaire de mots de passe et les procédures d'onboarding/offboarding sont des fondamentaux non négociables.",
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
      id: "vulnerabilites",
      label: "Vulnérabilités & Tests",
      description: "Scans de vulnérabilités, tests de pénétration et cadre NIST",
      intro: "Les scans de vulnérabilités et les tests de pénétration révèlent vos faiblesses avant les attaquants. Le délai de patching est critique — chaque jour de retard augmente votre exposition. Le cadre NIST CSF structure votre approche.",
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
      id: "sauvegardes",
      label: "Sauvegardes & Reprise",
      description: "Stratégie de backup, fréquence, plan de reprise et objectifs RPO/RTO",
      intro: "La stratégie 3-2-1 (3 copies, 2 médias, 1 hors-site) est le standard de l'industrie. Le plan de reprise (DRP) doit être testé régulièrement. Les objectifs RPO/RTO définissent votre tolérance aux pertes de données et aux interruptions.",
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
      id: "incidents_reponse",
      label: "Incidents & Réponse",
      description: "Plan de réponse aux incidents, historique et équipe de sécurité",
      intro: "Un plan de réponse aux incidents testé peut réduire le coût d'une brèche de 40%. La Loi 25 exige le signalement en 72 heures. Le registre des incidents et l'équipe CSIRT sont vos lignes de défense active.",
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
      id: "formation_phishing",
      label: "Formation & Phishing",
      description: "Simulations de phishing, sensibilisation et formation en cybersécurité",
      intro: "Le phishing est le vecteur d'attaque #1 — 91% des cyberattaques commencent par un courriel. Les simulations régulières et la formation obligatoire réduisent significativement le risque. Le taux de clic phishing est votre indicateur de vigilance.",
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
      id: "certifications_securite",
      label: "Certifications sécurité",
      description: "Certifications, frameworks de référence, cyberassurance et SOC",
      intro: "Les certifications (SOC 2, ISO 27001) sont de plus en plus exigées par les clients B2B et les assureurs. La cyberassurance est devenue un prérequis pour les contrats d'entreprise. Le SOC externe (MSSP) démocratise la surveillance 24/7.",
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
// CROSS-REFERENCE MAP — Le Blueprint Organisme
// Les 12 départements forment UN SEUL blueprint segmenté.
// Chaque entrée = données qu'une section CONSOMME depuis un autre département.
// Clé: "DEPT.section_id" → tableau de sources depuis d'autres départements.
// ══════════════════════════════════════════════════════════════

export const CROSS_REFERENCE_MAP: Record<string, CrossRef[]> = {
  // ── CEOB (Direction) — Le CEO consomme depuis TOUS les 11 départements ──
  "CEOB.sommaire_executif": [
    { sourceDept: "CMOB", sourceSection: "positionnement", sourceFields: ["uvp"], label: "Proposition de valeur (Marketing)" },
    { sourceDept: "CSOB", sourceSection: "marche", sourceFields: ["tam", "sam", "som"], label: "Taille du marché (Stratégie)" },
    { sourceDept: "CROB", sourceSection: "pipeline_funnel", sourceFields: ["valeur_pipeline"], label: "Pipeline ventes (Ventes)" },
    { sourceDept: "CFOB", sourceSection: "modele_revenus", sourceFields: ["mrr", "chiffre_affaires_estime"], label: "Revenus (Finance)" },
  ],
  "CEOB.produits_services": [
    { sourceDept: "CPOB", sourceSection: "planification_production", sourceFields: ["produits_principaux", "capacite_journaliere"], label: "Production (Usine)" },
    { sourceDept: "CINOB", sourceSection: "pipeline_innovation", sourceFields: ["projets_actifs"], label: "Pipeline innovation (R&D)" },
    { sourceDept: "CROB", sourceSection: "comptes_cles", sourceFields: ["taux_retention", "revenu_moyen_client"], label: "Rétention & revenus (Ventes)" },
  ],
  "CEOB.equipe_direction": [
    { sourceDept: "CHROB", sourceSection: "organigramme", sourceFields: ["nb_employes_total", "postes_ouverts"], label: "Effectifs (RH)" },
    { sourceDept: "CHROB", sourceSection: "succession", sourceFields: ["plan_succession", "hauts_potentiels"], label: "Plan de relève (RH)" },
  ],
  "CEOB.finances": [
    { sourceDept: "CFOB", sourceSection: "budget_previsions", sourceFields: ["budget_annuel"], label: "Budget annuel (Finance)" },
    { sourceDept: "CFOB", sourceSection: "modele_revenus", sourceFields: ["mrr", "arr"], label: "Revenus récurrents (Finance)" },
    { sourceDept: "CFOB", sourceSection: "tresorerie", sourceFields: ["runway_mois", "burn_rate"], label: "Trésorerie (Finance)" },
    { sourceDept: "CFOB", sourceSection: "etats_financiers", sourceFields: ["marge_baiia"], label: "Marge EBITDA (Finance)" },
  ],
  "CEOB.objectifs_vitaa": [
    { sourceDept: "CROB", sourceSection: "pipeline_funnel", sourceFields: ["valeur_pipeline", "taux_conversion_global"], label: "Score Vente (Ventes)" },
    { sourceDept: "CINOB", sourceSection: "pipeline_innovation", sourceFields: ["projets_actifs"], label: "Score Idée (Innovation)" },
    { sourceDept: "CFOB", sourceSection: "tresorerie", sourceFields: ["runway_mois"], label: "Score Argent (Finance)" },
  ],
  "CEOB.swot": [
    { sourceDept: "CSOB", sourceSection: "concurrence", sourceFields: ["concurrents_directs", "differenciateurs"], label: "Concurrence (Stratégie)" },
    { sourceDept: "CSOB", sourceSection: "pestel", sourceFields: ["politique", "economique", "technologique"], label: "Environnement macro (Stratégie)" },
    { sourceDept: "CMOB", sourceSection: "reputation", sourceFields: ["nps_actuel"], label: "Réputation (Marketing)" },
  ],
  "CEOB.gouvernance": [
    { sourceDept: "CLOB", sourceSection: "structure_corporative", sourceFields: ["type_entite", "minutes_a_jour"], label: "Structure légale (Juridique)" },
    { sourceDept: "CLOB", sourceSection: "conformite_loi25", sourceFields: ["responsable_prp", "politique_confidentialite"], label: "Conformité Loi 25 (Juridique)" },
  ],
  "CEOB.risques_sortie": [
    { sourceDept: "CFOB", sourceSection: "valorisation", sourceFields: ["valorisation", "multiple_secteur"], label: "Valorisation (Finance)" },
    { sourceDept: "CLOB", sourceSection: "litiges", sourceFields: ["litiges_actifs"], label: "Litiges actifs (Juridique)" },
    { sourceDept: "CISOB", sourceSection: "incidents_reponse", sourceFields: ["incidents_12mois"], label: "Incidents sécurité (CISO)" },
  ],
  "CEOB.culture_esg": [
    { sourceDept: "CHROB", sourceSection: "culture_engagement", sourceFields: ["enps", "politique_teletravail"], label: "Engagement employés (RH)" },
    { sourceDept: "CPOB", sourceSection: "sst", sourceFields: ["incidents_12mois", "programme_prevention"], label: "SST (Production)" },
  ],
  "CEOB.conseil_administration": [
    { sourceDept: "CLOB", sourceSection: "structure_corporative", sourceFields: ["type_entite", "actionnaires", "minutes_a_jour"], label: "Structure corporative (Juridique)" },
    { sourceDept: "CHROB", sourceSection: "organigramme", sourceFields: ["nb_employes_total"], label: "Effectifs totaux (RH)" },
    { sourceDept: "CFOB", sourceSection: "etats_financiers", sourceFields: ["marge_baiia"], label: "Performance financière (Finance)" },
    { sourceDept: "CFOB", sourceSection: "budget_previsions", sourceFields: ["budget_annuel"], label: "Budget annuel (Finance)" },
  ],

  // ── CFOB (Finance) — Consomme revenus, coûts, masses salariales ──
  "CFOB.budget_previsions": [
    { sourceDept: "CMOB", sourceSection: "canaux_budget", sourceFields: ["budget_marketing"], label: "Budget marketing (Marketing)" },
    { sourceDept: "CHROB", sourceSection: "remuneration", sourceFields: ["masse_salariale"], label: "Masse salariale (RH)" },
    { sourceDept: "CINOB", sourceSection: "rsde", sourceFields: ["budget_rd"], label: "Budget R&D (Innovation)" },
    { sourceDept: "CTOB", sourceSection: "infrastructure", sourceFields: ["cout_mensuel"], label: "Coûts infra (Technologie)" },
  ],
  "CFOB.modele_revenus": [
    { sourceDept: "CROB", sourceSection: "pipeline_funnel", sourceFields: ["valeur_pipeline", "taux_conversion_global"], label: "Pipeline & conversion (Ventes)" },
    { sourceDept: "CROB", sourceSection: "comptes_cles", sourceFields: ["revenu_moyen_client", "taux_retention"], label: "Revenus clients (Ventes)" },
  ],
  "CFOB.tresorerie": [
    { sourceDept: "COOB", sourceSection: "supply_chain", sourceFields: ["cout_logistique_pct_ca"], label: "Coût logistique (Opérations)" },
    { sourceDept: "CPOB", sourceSection: "gestion_stocks", sourceFields: ["valeur_inventaire"], label: "Valeur inventaire (Production)" },
  ],
  "CFOB.fiscalite": [
    { sourceDept: "CINOB", sourceSection: "rsde", sourceFields: ["rsde_admissible", "depenses_rd_estimees"], label: "RS&DE (Innovation)" },
    { sourceDept: "CHROB", sourceSection: "remuneration", sourceFields: ["masse_salariale", "budget_formation_pct"], label: "Masse salariale & formation (RH)" },
  ],
  "CFOB.valorisation": [
    { sourceDept: "CEOB", sourceSection: "risques_sortie", sourceFields: ["exit_strategy", "valorisation_estimee"], label: "Stratégie de sortie (Direction)" },
    { sourceDept: "CINOB", sourceSection: "propriete_intellectuelle", sourceFields: ["valorisation_actifs_incorporels"], label: "Actifs incorporels (Innovation)" },
  ],

  // ── CMOB (Marketing) — Consomme positionnement stratégique, feedback ventes ──
  "CMOB.personas_icp": [
    { sourceDept: "CROB", sourceSection: "comptes_cles", sourceFields: ["top_clients", "revenu_moyen_client"], label: "Clients actuels (Ventes)" },
    { sourceDept: "CSOB", sourceSection: "marche", sourceFields: ["marche_cible_primaire"], label: "Marché cible (Stratégie)" },
  ],
  "CMOB.positionnement": [
    { sourceDept: "CSOB", sourceSection: "avantage_concurrentiel", sourceFields: ["differenciateur_cle", "moats"], label: "Avantages concurrentiels (Stratégie)" },
    { sourceDept: "CSOB", sourceSection: "concurrence", sourceFields: ["differenciateurs"], label: "Différenciateurs (Stratégie)" },
  ],
  "CMOB.canaux_budget": [
    { sourceDept: "CFOB", sourceSection: "budget_previsions", sourceFields: ["budget_annuel"], label: "Budget global (Finance)" },
    { sourceDept: "CROB", sourceSection: "pipeline_funnel", sourceFields: ["nb_opportunites"], label: "Opportunités générées (Ventes)" },
  ],
  "CMOB.reputation": [
    { sourceDept: "CROB", sourceSection: "comptes_cles", sourceFields: ["taux_retention"], label: "Rétention clients (Ventes)" },
    { sourceDept: "CEOB", sourceSection: "profil_public", sourceFields: ["note_reputation"], label: "Réputation publique (Direction)" },
  ],

  // ── CSOB (Stratégie) — Consomme vision, finances, marché ──
  "CSOB.pestel": [
    { sourceDept: "CLOB", sourceSection: "reglementaire", sourceFields: ["obligations_sectorielles"], label: "Réglementation (Juridique)" },
    { sourceDept: "CTOB", sourceSection: "stack_technique", sourceFields: ["cloud_provider"], label: "Environnement tech (Technologie)" },
  ],
  "CSOB.marche": [
    { sourceDept: "CROB", sourceSection: "comptes_cles", sourceFields: ["taux_concentration_client"], label: "Concentration client (Ventes)" },
    { sourceDept: "CMOB", sourceSection: "personas_icp", sourceFields: ["icp_principal"], label: "Client idéal (Marketing)" },
  ],
  "CSOB.concurrence": [
    { sourceDept: "CMOB", sourceSection: "positionnement", sourceFields: ["uvp"], label: "Positionnement (Marketing)" },
    { sourceDept: "CINOB", sourceSection: "propriete_intellectuelle", sourceFields: ["brevets"], label: "Brevets (Innovation)" },
  ],
  "CSOB.avantage_concurrentiel": [
    { sourceDept: "CINOB", sourceSection: "propriete_intellectuelle", sourceFields: ["brevets", "marques_commerce"], label: "PI & Brevets (Innovation)" },
    { sourceDept: "CTOB", sourceSection: "stack_technique", sourceFields: ["langages", "frameworks"], label: "Stack technique (Technologie)" },
    { sourceDept: "CPOB", sourceSection: "normes_certifications", sourceFields: ["certifications_actives"], label: "Certifications (Production)" },
  ],
  "CSOB.partenariats": [
    { sourceDept: "CINOB", sourceSection: "partenariats_rd", sourceFields: ["partenaires_rd"], label: "Partenaires R&D (Innovation)" },
    { sourceDept: "COOB", sourceSection: "supply_chain", sourceFields: ["fournisseurs_cles"], label: "Fournisseurs clés (Opérations)" },
  ],

  // ── COOB (Opérations) — Consomme production, RH, technologie ──
  "COOB.processus": [
    { sourceDept: "CTOB", sourceSection: "architecture_si", sourceFields: ["erp", "crm"], label: "Systèmes ERP/CRM (Technologie)" },
    { sourceDept: "CPOB", sourceSection: "qualite", sourceFields: ["systeme_qualite"], label: "Système qualité (Production)" },
  ],
  "COOB.supply_chain": [
    { sourceDept: "CPOB", sourceSection: "gestion_stocks", sourceFields: ["valeur_inventaire", "rotation_stocks"], label: "Stocks (Production)" },
    { sourceDept: "CFOB", sourceSection: "tresorerie", sourceFields: ["creances_clients_dso", "dettes_fournisseurs_dpo"], label: "DSO/DPO (Finance)" },
  ],
  "COOB.capacite_planification": [
    { sourceDept: "CPOB", sourceSection: "planification_production", sourceFields: ["capacite_journaliere"], label: "Capacité production (Usine)" },
    { sourceDept: "CROB", sourceSection: "pipeline_funnel", sourceFields: ["valeur_pipeline"], label: "Demande prévue (Ventes)" },
  ],

  // ── CPOB (Production) — Consomme opérations, RH, technologie ──
  "CPOB.planification_production": [
    { sourceDept: "CROB", sourceSection: "pipeline_funnel", sourceFields: ["valeur_pipeline", "nb_opportunites"], label: "Demande commerciale (Ventes)" },
    { sourceDept: "COOB", sourceSection: "supply_chain", sourceFields: ["fournisseurs_cles", "lead_time_moyen"], label: "Supply Chain (Opérations)" },
  ],
  "CPOB.sst": [
    { sourceDept: "CHROB", sourceSection: "conformite_rh", sourceFields: ["equite_salariale"], label: "Conformité RH (RH)" },
    { sourceDept: "CLOB", sourceSection: "reglementaire", sourceFields: ["obligations_sectorielles"], label: "Obligations (Juridique)" },
  ],
  "CPOB.qualite": [
    { sourceDept: "CROB", sourceSection: "comptes_cles", sourceFields: ["taux_retention"], label: "Satisfaction clients (Ventes)" },
    { sourceDept: "COOB", sourceSection: "amelioration_continue", sourceFields: ["methodologies"], label: "Méthodologies (Opérations)" },
  ],

  // ── CHROB (RH) — Consomme finance, juridique, opérations ──
  "CHROB.remuneration": [
    { sourceDept: "CFOB", sourceSection: "budget_previsions", sourceFields: ["budget_annuel"], label: "Budget global (Finance)" },
    { sourceDept: "CLOB", sourceSection: "reglementaire", sourceFields: ["obligations_sectorielles"], label: "Obligations légales (Juridique)" },
  ],
  "CHROB.recrutement": [
    { sourceDept: "CEOB", sourceSection: "equipe_direction", sourceFields: ["lacunes_equipe"], label: "Lacunes direction (Direction)" },
    { sourceDept: "CROB", sourceSection: "territoires", sourceFields: ["nb_vendeurs"], label: "Besoins ventes (Ventes)" },
  ],
  "CHROB.conformite_rh": [
    { sourceDept: "CLOB", sourceSection: "conformite_loi25", sourceFields: ["responsable_prp"], label: "RPRP Loi 25 (Juridique)" },
    { sourceDept: "CEOB", sourceSection: "profil", sourceFields: ["nb_employes"], label: "Effectif (Direction)" },
  ],
  "CHROB.formation": [
    { sourceDept: "CISOB", sourceSection: "formation_phishing", sourceFields: ["formation_securite"], label: "Formation sécurité (CISO)" },
    { sourceDept: "CPOB", sourceSection: "sst", sourceFields: ["programme_prevention"], label: "Programme SST (Production)" },
  ],

  // ── CINOB (Innovation) — Consomme finance, stratégie, technologie ──
  "CINOB.rsde": [
    { sourceDept: "CFOB", sourceSection: "fiscalite", sourceFields: ["rsde"], label: "RS&DE fiscal (Finance)" },
    { sourceDept: "CFOB", sourceSection: "budget_previsions", sourceFields: ["budget_annuel"], label: "Budget global (Finance)" },
  ],
  "CINOB.pipeline_innovation": [
    { sourceDept: "CSOB", sourceSection: "diversification", sourceFields: ["matrice_ansoff", "marches_cibles"], label: "Diversification (Stratégie)" },
    { sourceDept: "CMOB", sourceSection: "personas_icp", sourceFields: ["icp_principal"], label: "Besoins clients (Marketing)" },
  ],
  "CINOB.propriete_intellectuelle": [
    { sourceDept: "CLOB", sourceSection: "pi_marques", sourceFields: ["marques_deposees", "brevets_deposes"], label: "PI légale (Juridique)" },
  ],

  // ── CROB (Ventes) — Consomme marketing, finance, stratégie ──
  "CROB.pipeline_funnel": [
    { sourceDept: "CMOB", sourceSection: "canaux_budget", sourceFields: ["canaux_actifs"], label: "Canaux marketing (Marketing)" },
    { sourceDept: "CFOB", sourceSection: "modele_revenus", sourceFields: ["chiffre_affaires_estime"], label: "Objectif CA (Finance)" },
  ],
  "CROB.comptes_cles": [
    { sourceDept: "CMOB", sourceSection: "personas_icp", sourceFields: ["icp_principal"], label: "ICP (Marketing)" },
    { sourceDept: "CSOB", sourceSection: "concurrence", sourceFields: ["concurrents_directs", "differenciateurs"], label: "Concurrence (Stratégie)" },
  ],
  "CROB.remuneration_ventes": [
    { sourceDept: "CFOB", sourceSection: "budget_previsions", sourceFields: ["budget_annuel"], label: "Budget global (Finance)" },
    { sourceDept: "CHROB", sourceSection: "remuneration", sourceFields: ["grille_salariale"], label: "Grille salariale (RH)" },
  ],

  // ── CLOB (Juridique) — Consomme gouvernance, RH, sécurité ──
  "CLOB.structure_corporative": [
    { sourceDept: "CEOB", sourceSection: "gouvernance", sourceFields: ["entite_legale", "actionnaires", "convention_actionnaires"], label: "Gouvernance (Direction)" },
  ],
  "CLOB.conformite_loi25": [
    { sourceDept: "CISOB", sourceSection: "incidents_reponse", sourceFields: ["registre_incidents_72h"], label: "Incidents 72h (CISO)" },
    { sourceDept: "CTOB", sourceSection: "architecture_si", sourceFields: ["crm", "erp"], label: "Systèmes traitant des RP (Technologie)" },
  ],
  "CLOB.contrats": [
    { sourceDept: "COOB", sourceSection: "logistique", sourceFields: ["baux_echeance"], label: "Baux actifs (Opérations)" },
    { sourceDept: "COOB", sourceSection: "gestion_fournisseurs", sourceFields: ["sla_fournisseurs"], label: "SLAs fournisseurs (Opérations)" },
  ],
  "CLOB.pi_marques": [
    { sourceDept: "CINOB", sourceSection: "propriete_intellectuelle", sourceFields: ["brevets", "marques_commerce"], label: "PI Innovation (Innovation)" },
    { sourceDept: "CMOB", sourceSection: "positionnement", sourceFields: ["identite_visuelle_logo"], label: "Identité visuelle (Marketing)" },
  ],

  // ── CISOB (Sécurité) — Consomme technologie, juridique, RH ──
  "CISOB.politiques_iam": [
    { sourceDept: "CTOB", sourceSection: "stack_technique", sourceFields: ["gestionnaire_mdp"], label: "Gestionnaire MDP (Technologie)" },
    { sourceDept: "CHROB", sourceSection: "organigramme", sourceFields: ["nb_employes_total"], label: "Effectif (RH)" },
  ],
  "CISOB.sauvegardes": [
    { sourceDept: "CTOB", sourceSection: "infrastructure", sourceFields: ["serveurs", "monitoring"], label: "Infrastructure (Technologie)" },
  ],
  "CISOB.vulnerabilites": [
    { sourceDept: "CTOB", sourceSection: "securite_applicative", sourceFields: ["dernier_pentest", "owasp_top10"], label: "Sécurité applicative (Technologie)" },
  ],
  "CISOB.incidents_reponse": [
    { sourceDept: "CLOB", sourceSection: "conformite_loi25", sourceFields: ["registre_incidents_loi25"], label: "Registre Loi 25 (Juridique)" },
  ],
  "CISOB.certifications_securite": [
    { sourceDept: "CTOB", sourceSection: "infrastructure", sourceFields: ["certifications_infra"], label: "Certifications infra (Technologie)" },
    { sourceDept: "CPOB", sourceSection: "normes_certifications", sourceFields: ["certifications_actives"], label: "Certifications production (Production)" },
  ],
};

/** Obtenir les cross-references pour une section d'un département */
export function getCrossReferences(deptCode: string, sectionId: string): CrossRef[] {
  return CROSS_REFERENCE_MAP[`${deptCode}.${sectionId}`] || [];
}

/** Obtenir TOUS les départements qui fournissent des données à un département donné */
export function getLinkedDepartments(deptCode: string): string[] {
  const linked = new Set<string>();
  for (const [key, refs] of Object.entries(CROSS_REFERENCE_MAP)) {
    if (key.startsWith(`${deptCode}.`)) {
      for (const ref of refs) linked.add(ref.sourceDept);
    }
  }
  return Array.from(linked);
}

/** Obtenir toutes les sections d'un département qui CONSOMMENT des données d'un autre département */
export function getSectionsConsumingFrom(targetDept: string, sourceDept: string): { sectionId: string; refs: CrossRef[] }[] {
  const results: { sectionId: string; refs: CrossRef[] }[] = [];
  for (const [key, refs] of Object.entries(CROSS_REFERENCE_MAP)) {
    if (key.startsWith(`${targetDept}.`)) {
      const relevant = refs.filter(r => r.sourceDept === sourceDept);
      if (relevant.length > 0) {
        results.push({ sectionId: key.split(".")[1], refs: relevant });
      }
    }
  }
  return results;
}

/** Obtenir toutes les sections où un département est SOURCE (ses données sont consommées par d'autres) */
export function getSectionsProvidingTo(sourceDept: string): { targetDept: string; targetSection: string; refs: CrossRef[] }[] {
  const results: { targetDept: string; targetSection: string; refs: CrossRef[] }[] = [];
  for (const [key, refs] of Object.entries(CROSS_REFERENCE_MAP)) {
    const relevant = refs.filter(r => r.sourceDept === sourceDept);
    if (relevant.length > 0) {
      const [targetDept, targetSection] = key.split(".");
      results.push({ targetDept, targetSection, refs: relevant });
    }
  }
  return results;
}

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
