/**
 * blueprint-config.ts — Configuration Blueprint Vivant par département
 * Source: DeepSearch Mega-Prompt 1 (Blueprint × Taille) — 113 sources citées
 *
 * 12 départements × 6-11 sous-sections × 5 paliers de taille × 3 phases
 * Pertinence: C(ritique) I(mportant) O(ptionnel) H(idden) R(églementaire)
 * Seuils réglementaires Québec/Canada intégrés
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
  { seuil: 10, unite: "employes", loi: "Loi sur l'équité salariale (LÉS)", obligation: "Programme d'équité salariale obligatoire", deptsConcernes: ["CHROB", "CLOB"], pertinence: "R" },
  { seuil: 20, unite: "employes", loi: "LSST art. 68-86", obligation: "Comité SST obligatoire + programme de prévention", deptsConcernes: ["CPOB", "COOB"], pertinence: "R" },
  { seuil: 25, unite: "employes", loi: "Charte langue française (Loi 96)", obligation: "Comité de francisation OQLF", deptsConcernes: ["CHROB", "CLOB"], pertinence: "R" },
  { seuil: 50, unite: "employes", loi: "Loi 25 (protection renseignements personnels)", obligation: "Responsable PRP + politique + EFVP", deptsConcernes: ["CLOB", "CISOB"], pertinence: "R" },
  { seuil: 100, unite: "employes", loi: "Recommandation gouvernance", obligation: "Gouvernance formelle recommandée, comité audit", deptsConcernes: ["CEOB", "CFOB"], pertinence: "I" },
  { seuil: 30000, unite: "ca_annuel", loi: "Loi sur la taxe de vente (TPS/TVQ)", obligation: "Inscription obligatoire TPS/TVQ", deptsConcernes: ["CFOB"], pertinence: "R" },
  { seuil: 2000000, unite: "ca_annuel", loi: "Loi favorisant le développement de la formation (Loi 90)", obligation: "Investir 1% de la masse salariale en formation", deptsConcernes: ["CHROB", "CPOB"], pertinence: "R" },
  { seuil: 10000000, unite: "ca_annuel", loi: "Loi C-97 (déclaration pays par pays)", obligation: "Déclarations fiscales bonifiées", deptsConcernes: ["CFOB", "CLOB"], pertinence: "R" },
  { seuil: 50, unite: "employes", loi: "CNESST — Rapport annuel", obligation: "Déclaration CNESST obligatoire annuelle", deptsConcernes: ["CPOB"], pertinence: "R" },
  { seuil: 100, unite: "employes", loi: "Norme CAN/CSA-Z1003", obligation: "Norme santé psychologique recommandée", deptsConcernes: ["CHROB", "CPOB"], pertinence: "I" },
  { seuil: 5, unite: "employes", loi: "Normes du travail (LNT)", obligation: "Registre de paie, relevés d'emploi, T4/RL-1", deptsConcernes: ["CFOB", "CHROB"], pertinence: "R" },
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
  subSections: [
    {
      id: "profil",
      label: "Profil entreprise",
      description: "Identité, industrie, mission, vision, valeurs",
      icon: "Building2",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
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
      ],
      kpis: [],
      templates: ["profil-entreprise", "elevator-pitch"],
    },
    {
      id: "swot",
      label: "SWOT",
      description: "Forces, faiblesses, opportunités, menaces",
      icon: "Target",
      pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" },
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
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
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
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "score_vente", label: "Score Vente (0-100)", type: "number", tier: "T1" },
        { id: "score_idee", label: "Score Idée (0-100)", type: "number", tier: "T1" },
        { id: "score_temps", label: "Score Temps (0-100)", type: "number", tier: "T1" },
        { id: "score_argent", label: "Score Argent (0-100)", type: "number", tier: "T1" },
        { id: "score_actif", label: "Score Actif (0-100)", type: "number", tier: "T1" },
        { id: "objectif_12mois", label: "Objectif principal 12 mois", type: "textarea", tier: "T1" },
        { id: "objectifs_okr", label: "OKRs trimestriels", type: "json", tier: "T3" },
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
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
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
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "entite_legale", label: "Type d'entité légale", type: "select", options: ["Inc. fédérale", "Inc. provinciale QC", "SENC", "Enr.", "OBNL", "Coop"], tier: "T2" },
        { id: "neq", label: "NEQ", type: "text", tier: "T2" },
        { id: "actionnaires", label: "Actionnaires et %", type: "json", tier: "T3" },
        { id: "convention_actionnaires", label: "Convention d'actionnaires", type: "select", options: ["Oui — à jour", "Oui — désuète", "Non"], tier: "T3" },
        { id: "ca_membres", label: "Membres du CA", type: "json", tier: "T4" },
        { id: "comites", label: "Comités (audit, gouvernance, RH)", type: "list", tier: "T4" },
      ],
      kpis: [],
      templates: ["convention-actionnaires", "charte-ca"],
    },
    {
      id: "risques_sortie",
      label: "Risques & Sortie",
      description: "Matrice risques, PCA, exit strategy, valorisation",
      icon: "Shield",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "matrice_risques", label: "Risques identifiés (probabilité × impact)", type: "json", tier: "T3" },
        { id: "pca", label: "Plan de continuité des affaires", type: "select", options: ["Complet", "Partiel", "Absent"], tier: "T3" },
        { id: "exit_strategy", label: "Stratégie de sortie", type: "select", options: ["Vente stratégique", "MBO", "IPO", "Succession familiale", "Liquidation ordonnée", "Pas définie"], tier: "T4" },
        { id: "valorisation_estimee", label: "Valorisation estimée", type: "currency", tier: "T4" },
        { id: "multiple_ebitda", label: "Multiple EBITDA cible", type: "number", tier: "T5" },
      ],
      kpis: [],
      templates: ["plan-continuite-affaires", "data-room-checklist"],
    },
    {
      id: "culture_esg",
      label: "Culture & ESG",
      description: "Éthique, empreinte carbone, DEI, certifications",
      icon: "Compass",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "code_ethique", label: "Code d'éthique", type: "select", options: ["Formel", "Informel", "Absent"], tier: "T3" },
        { id: "politique_dei", label: "Politique DEI", type: "select", options: ["Formelle", "Informelle", "Absente"], tier: "T4" },
        { id: "bilan_carbone", label: "Bilan carbone (tonnes CO2e)", type: "number", tier: "T4" },
        { id: "certifications_esg", label: "Certifications ESG", type: "list", tier: "T5" },
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
  subSections: [
    {
      id: "stack_technique",
      label: "Stack Technique",
      description: "Langages, BDD, cloud, outils DevOps",
      icon: "Layers",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "langages", label: "Langages principaux", type: "list", tier: "T1" },
        { id: "frameworks", label: "Frameworks", type: "list", tier: "T2" },
        { id: "bases_donnees", label: "Bases de données", type: "list", tier: "T1" },
        { id: "cloud_provider", label: "Cloud / Hébergement", type: "select", options: ["AWS", "Azure", "GCP", "OVH", "On-premise", "Hybride", "Autre"], tier: "T2" },
        { id: "outils_devops", label: "Outils DevOps / CI/CD", type: "list", tier: "T3" },
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
      ],
      kpis: [],
    },
    {
      id: "roadmap_tech",
      label: "Roadmap Tech",
      description: "Gantt déploiements, jalons techniques",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
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
      ],
      kpis: [],
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      description: "Serveurs, monitoring, coûts, SLA",
      icon: "Shield",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "serveurs", label: "Serveurs / VMs", type: "json", tier: "T2" },
        { id: "monitoring", label: "Monitoring", type: "text", tier: "T3" },
        { id: "cout_mensuel", label: "Coût infra mensuel", type: "currency", tier: "T2" },
        { id: "sla_cible", label: "SLA cible (%)", type: "percentage", tier: "T3" },
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
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
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
  subSections: [
    {
      id: "budget_previsions",
      label: "Budget & Prévisions",
      description: "Budget annuel, CAPEX/OPEX, scénarios",
      icon: "DollarSign",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "budget_annuel", label: "Budget annuel total", type: "currency", tier: "T1", required: true },
        { id: "capex", label: "CAPEX", type: "currency", tier: "T2" },
        { id: "opex", label: "OPEX", type: "currency", tier: "T2" },
        { id: "previsions_3ans", label: "Prévisions 3 ans", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "modele_revenus",
      label: "Modèle de Revenus",
      description: "Récurrent, transactionnel, pricing",
      icon: "TrendingUp",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "type_revenus", label: "Type principal", type: "select", options: ["Récurrent (SaaS/abo)", "Transactionnel", "Projet", "Mixte", "Commission", "Licence"], tier: "T1", required: true },
        { id: "mrr", label: "MRR / Revenus mensuels", type: "currency", tier: "T1" },
        { id: "arr", label: "ARR", type: "currency", tier: "T2" },
        { id: "pricing_strategy", label: "Stratégie de prix", type: "textarea", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "tresorerie",
      label: "Trésorerie",
      description: "Cash flow 13 semaines, runway, burn rate",
      icon: "DollarSign",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "solde_bancaire", label: "Solde bancaire actuel", type: "currency", tier: "T1" },
        { id: "burn_rate", label: "Burn rate mensuel", type: "currency", tier: "T2" },
        { id: "runway_mois", label: "Runway (mois)", type: "number", tier: "T2" },
        { id: "cash_flow_13sem", label: "Cash flow 13 semaines", type: "json", tier: "T3" },
      ],
      kpis: [
        { id: "runway", label: "Runway", formule: "solde / burn_rate", benchmark: ">12 mois", seuils: { vert: 12, jaune: 6, rouge: 3 }, tier: "T2", unite: "mois" },
      ],
    },
    {
      id: "fiscalite",
      label: "Fiscalité & Incitatifs",
      description: "RS&DE, CRIC, subventions actives",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "rsde", label: "RS&DE déposé", type: "select", options: ["Oui — en cours", "Oui — terminé", "Non — éligible", "Non — pas éligible"], tier: "T2" },
        { id: "subventions", label: "Subventions actives", type: "json", tier: "T3" },
        { id: "credits_impot", label: "Crédits d'impôt", type: "list", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "etats_financiers",
      label: "États Financiers",
      description: "Bilan, résultats, flux de trésorerie",
      icon: "Layers",
      pertinence: { T1: "I", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "dernier_bilan", label: "Dernier bilan (date)", type: "date", tier: "T2" },
        { id: "actif_total", label: "Actif total", type: "currency", tier: "T2" },
        { id: "passif_total", label: "Passif total", type: "currency", tier: "T2" },
        { id: "avoir_proprio", label: "Avoir des propriétaires", type: "currency", tier: "T3" },
        { id: "ratio_endettement", label: "Ratio d'endettement", type: "percentage", tier: "T3" },
      ],
      kpis: [
        { id: "marge_ebitda", label: "Marge EBITDA", formule: "EBITDA / CA × 100", benchmark: "15-25%", seuils: { vert: 15, jaune: 8, rouge: 0 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "valorisation",
      label: "Valorisation",
      description: "Multiples, EBITDA normalisé, QoE",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "ebitda_normalise", label: "EBITDA normalisé", type: "currency", tier: "T4" },
        { id: "multiple_secteur", label: "Multiple du secteur", type: "number", tier: "T4" },
        { id: "valorisation", label: "Valorisation estimée", type: "currency", tier: "T4" },
        { id: "qoe_date", label: "Dernier QoE", type: "date", tier: "T5" },
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
        { id: "marge_ebitda_kpi", label: "Marge EBITDA", formule: "EBITDA / CA × 100", benchmark: "15-25%", seuils: { vert: 15, jaune: 8, rouge: 0 }, tier: "T3", unite: "%" },
        { id: "ccc", label: "Cycle Conversion Cash", formule: "DIO + DSO - DPO", benchmark: "<45j", seuils: { vert: 45, jaune: 75, rouge: 120 }, tier: "T3", unite: "jours" },
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
  subSections: [
    {
      id: "personas_icp",
      label: "Personas & ICP",
      description: "Profil client idéal, parcours d'achat",
      icon: "Target",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "icp_principal", label: "ICP principal", type: "textarea", tier: "T1", required: true },
        { id: "personas", label: "Personas (JSON)", type: "json", tier: "T2" },
        { id: "parcours_achat", label: "Parcours d'achat", type: "textarea", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "positionnement",
      label: "Positionnement & Marque",
      description: "UVP, ton, charte graphique",
      icon: "Compass",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "uvp", label: "Proposition de valeur unique (UVP)", type: "textarea", tier: "T1", required: true },
        { id: "ton_voix", label: "Ton de voix", type: "text", tier: "T2" },
        { id: "charte_graphique", label: "Charte graphique", type: "select", options: ["Formelle", "Informelle", "Absente"], tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "canaux_budget",
      label: "Canaux & Budget",
      description: "Mix marketing, ROI par canal",
      icon: "DollarSign",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "canaux_actifs", label: "Canaux actifs", type: "list", tier: "T1" },
        { id: "budget_marketing", label: "Budget marketing annuel", type: "currency", tier: "T2" },
        { id: "roi_par_canal", label: "ROI par canal", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "contenu_campagnes",
      label: "Contenu & Campagnes",
      description: "Calendrier éditorial, lead magnets",
      icon: "Layers",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "calendrier_editorial", label: "Calendrier éditorial", type: "select", options: ["Oui", "Non"], tier: "T2" },
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
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "outil_martech", label: "Outil MarTech", type: "text", tier: "T3" },
        { id: "lead_scoring", label: "Lead scoring actif", type: "select", options: ["Oui", "Non"], tier: "T4" },
        { id: "workflows_automatises", label: "Nombre de workflows", type: "number", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "reputation",
      label: "Réputation & PR",
      description: "Témoignages, NPS, événements",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "nps_actuel", label: "NPS actuel", type: "number", tier: "T3" },
        { id: "temoignages", label: "Nombre de témoignages clients", type: "number", tier: "T2" },
        { id: "evenements_annuels", label: "Événements/an", type: "number", tier: "T4" },
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
        { id: "cac", label: "CAC", formule: "dépenses marketing / nouveaux clients", benchmark: "<$500", seuils: { vert: 500, jaune: 1000, rouge: 2000 }, tier: "T2", unite: "$" },
        { id: "ltv_cac", label: "LTV:CAC", formule: "LTV / CAC", benchmark: ">3:1", seuils: { vert: 3, jaune: 2, rouge: 1 }, tier: "T2", unite: ":1" },
        { id: "taux_conversion", label: "Taux conversion", formule: "conversions / visiteurs × 100", benchmark: "2-5%", seuils: { vert: 3, jaune: 1, rouge: 0.5 }, tier: "T2", unite: "%" },
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

// ── CSOB — Simone — Stratégie (CSO) ──

const CSOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CSOB",
  deptLabel: "Stratégie",
  subSections: [
    {
      id: "pestel",
      label: "Analyse PESTEL",
      description: "Politique, Économique, Social, Technologique, Environnemental, Légal",
      icon: "Compass",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "politique", label: "Politique", type: "textarea", tier: "T3" },
        { id: "economique", label: "Économique", type: "textarea", tier: "T3" },
        { id: "social", label: "Social", type: "textarea", tier: "T3" },
        { id: "technologique", label: "Technologique", type: "textarea", tier: "T2" },
        { id: "environnemental", label: "Environnemental", type: "textarea", tier: "T4" },
        { id: "legal", label: "Légal", type: "textarea", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "marche",
      label: "Marché (TAM/SAM/SOM)",
      description: "Taille de marché, potentiel, pénétration",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "tam", label: "TAM (Total Addressable Market)", type: "currency", tier: "T2" },
        { id: "sam", label: "SAM (Serviceable Addressable)", type: "currency", tier: "T2" },
        { id: "som", label: "SOM (Serviceable Obtainable)", type: "currency", tier: "T2" },
        { id: "part_marche", label: "Part de marché actuelle (%)", type: "percentage", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "concurrence",
      label: "Concurrence",
      description: "Comparatif, positionnement, moats",
      icon: "Target",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "concurrents_directs", label: "Concurrents directs", type: "json", tier: "T1" },
        { id: "concurrents_indirects", label: "Concurrents indirects", type: "json", tier: "T2" },
        { id: "differenciateurs", label: "Différenciateurs clés", type: "list", tier: "T1" },
      ],
      kpis: [],
    },
    {
      id: "partenariats",
      label: "Partenariats Stratégiques",
      description: "Alliances, JV, distribution",
      icon: "Building2",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "partenaires_actuels", label: "Partenaires actuels", type: "json", tier: "T2" },
        { id: "partenaires_cibles", label: "Partenaires ciblés", type: "list", tier: "T3" },
        { id: "type_partenariat", label: "Types de partenariats", type: "list", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "diversification",
      label: "Diversification",
      description: "Ansoff, nouveaux marchés, M&A",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "matrice_ansoff", label: "Matrice Ansoff", type: "json", tier: "T3" },
        { id: "marches_cibles", label: "Nouveaux marchés ciblés", type: "list", tier: "T4" },
        { id: "ma_potentiel", label: "Cibles M&A potentielles", type: "json", tier: "T5" },
      ],
      kpis: [],
    },
    {
      id: "avantage_concurrentiel",
      label: "Avantage Concurrentiel",
      description: "Moats, PI, effets réseau",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "moats", label: "Moats identifiés", type: "list", tier: "T2" },
        { id: "brevets", label: "Brevets / PI", type: "list", tier: "T3" },
        { id: "effets_reseau", label: "Effets réseau", type: "textarea", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "kpis_strategie",
      label: "KPIs Stratégie",
      description: "Part de marché, concentration client, initiatives",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "part_marche_kpi", label: "Part de marché", formule: "CA / SAM × 100", benchmark: "variable", seuils: { vert: 10, jaune: 5, rouge: 1 }, tier: "T3", unite: "%" },
        { id: "concentration_client", label: "Concentration client", formule: "CA top 3 / CA total × 100", benchmark: "<30%", seuils: { vert: 30, jaune: 50, rouge: 70 }, tier: "T2", unite: "%" },
        { id: "initiatives_strat", label: "Initiatives stratégiques en cours", formule: "count", benchmark: "3-5", seuils: { vert: 3, jaune: 1, rouge: 0 }, tier: "T3", unite: "" },
      ],
    },
    {
      id: "playbooks_strategie",
      label: "Playbooks",
      description: "Playbooks stratégiques par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["analyse-concurrentielle", "plan-expansion-marche", "preparation-ma"],
    },
  ],
};

// ── COOB — Olivier — Opérations (COO) ──

const COOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "COOB",
  deptLabel: "Opérations",
  subSections: [
    {
      id: "processus",
      label: "Processus (BPM)",
      description: "Cartographie, logigrammes, optimisation",
      icon: "Layers",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "processus_cles", label: "Processus clés cartographiés", type: "json", tier: "T2" },
        { id: "goulots", label: "Goulots identifiés", type: "list", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "supply_chain",
      label: "Supply Chain",
      description: "Fournisseurs, lead times, risques",
      icon: "Building2",
      pertinence: { T1: "H", T2: "O", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "fournisseurs_cles", label: "Fournisseurs clés", type: "json", tier: "T2" },
        { id: "lead_time_moyen", label: "Lead time moyen", type: "text", tier: "T3" },
        { id: "risques_approvisionnement", label: "Risques approvisionnement", type: "list", tier: "T3" },
        { id: "plan_b_fournisseurs", label: "Plan B fournisseurs", type: "json", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "logistique",
      label: "Logistique & Installations",
      description: "Baux, capacité, layout usine",
      icon: "Building2",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "installations", label: "Installations (adresses)", type: "list", tier: "T2" },
        { id: "superficie_pi2", label: "Superficie (pi²)", type: "number", tier: "T3" },
        { id: "baux_echeance", label: "Échéance baux", type: "json", tier: "T3" },
        { id: "capacite_utilisation", label: "Taux utilisation capacité (%)", type: "percentage", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "amelioration_continue",
      label: "Amélioration Continue",
      description: "Kaizen, Lean, 5S, Six Sigma",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "methodologies", label: "Méthodologies appliquées", type: "list", tier: "T3" },
        { id: "projets_amelioration", label: "Projets d'amélioration en cours", type: "json", tier: "T4" },
        { id: "score_5s", label: "Score 5S", type: "number", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "gestion_fournisseurs",
      label: "Gestion Fournisseurs",
      description: "Évaluation, SLA, performance",
      icon: "ListChecks",
      pertinence: { T1: "H", T2: "H", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "evaluation_fournisseurs", label: "Grille évaluation fournisseurs", type: "json", tier: "T3" },
        { id: "sla_fournisseurs", label: "SLAs en place", type: "json", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "kpis_operations",
      label: "KPIs Opérations",
      description: "OTIF, productivité, délai commandes",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "otif", label: "OTIF (On-Time In-Full)", formule: "livraisons conformes / total × 100", benchmark: ">95%", seuils: { vert: 95, jaune: 85, rouge: 75 }, tier: "T3", unite: "%" },
        { id: "productivite", label: "Productivité", formule: "CA / employé", benchmark: "variable", seuils: { vert: 150000, jaune: 100000, rouge: 75000 }, tier: "T3", unite: "$/emp" },
        { id: "delai_commandes", label: "Délai moyen commandes", formule: "somme délais / nb commandes", benchmark: "<5j", seuils: { vert: 5, jaune: 10, rouge: 20 }, tier: "T3", unite: "jours" },
      ],
    },
    {
      id: "playbooks_operations",
      label: "Playbooks",
      description: "Playbooks opérationnels par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["cartographie-processus", "audit-supply-chain", "programme-5s"],
    },
  ],
};

// ── CPOB — Paco — Production & Produit (CPO) ──

const CPOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CPOB",
  deptLabel: "Production & Produit",
  subSections: [
    {
      id: "planification_production",
      label: "Planification Production",
      description: "BOM, gammes, capacités",
      icon: "Layers",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "produits_principaux", label: "Produits principaux", type: "json", tier: "T2" },
        { id: "capacite_journaliere", label: "Capacité journalière", type: "text", tier: "T3" },
        { id: "bom_principal", label: "BOM principal documenté", type: "select", options: ["Oui", "Partiellement", "Non"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "gestion_stocks",
      label: "Gestion Stocks",
      description: "MP, WIP, PF, niveaux min/max",
      icon: "Layers",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "valeur_stocks", label: "Valeur stocks totale", type: "currency", tier: "T2" },
        { id: "rotation_stocks", label: "Rotation des stocks (jours)", type: "number", tier: "T3" },
        { id: "niveaux_min_max", label: "Niveaux min/max définis", type: "select", options: ["Oui", "Partiellement", "Non"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "qualite",
      label: "Assurance Qualité",
      description: "Tests, inspections, non-conformités",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "systeme_qualite", label: "Système qualité", type: "select", options: ["ISO 9001", "ISO/TS 16949", "IATF 16949", "Interne", "Aucun"], tier: "T3" },
        { id: "taux_non_conformite", label: "Taux de non-conformité (%)", type: "percentage", tier: "T3" },
        { id: "cout_non_qualite", label: "Coût de non-qualité annuel", type: "currency", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "sst",
      label: "SST",
      description: "Programme prévention, incidents, comité SST",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "programme_prevention", label: "Programme de prévention", type: "select", options: ["Complet", "Partiel", "Absent"], tier: "T2" },
        { id: "comite_sst", label: "Comité SST", type: "select", options: ["Actif", "À former", "N/A (<20 emp)"], tier: "T3" },
        { id: "incidents_12mois", label: "Incidents 12 derniers mois", type: "number", tier: "T2" },
        { id: "taux_frequence", label: "Taux de fréquence", type: "number", tier: "T3" },
      ],
      kpis: [
        { id: "taux_frequence_kpi", label: "Taux fréquence accidents", formule: "incidents × 200000 / heures travaillées", benchmark: "<5", seuils: { vert: 5, jaune: 15, rouge: 30 }, tier: "T3", unite: "" },
      ],
    },
    {
      id: "equipements",
      label: "Équipements & Maintenance",
      description: "GMAO, préventif, TRS",
      icon: "Settings",
      pertinence: { T1: "H", T2: "H", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "equipements_critiques", label: "Équipements critiques", type: "json", tier: "T3" },
        { id: "maintenance_preventive", label: "Maintenance préventive", type: "select", options: ["Systématique", "Conditionnelle", "Corrective seulement"], tier: "T3" },
        { id: "trs_global", label: "TRS global (%)", type: "percentage", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "normes_certifications",
      label: "Normes & Certifications",
      description: "ISO, IATF, HACCP, AS9100",
      icon: "Shield",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "certifications_actives", label: "Certifications actives", type: "list", tier: "T3" },
        { id: "certifications_visees", label: "Certifications visées", type: "list", tier: "T4" },
        { id: "prochaine_audit", label: "Prochaine audit externe", type: "date", tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "kpis_production",
      label: "KPIs Production",
      description: "OEE, taux rebut, fréquence accidents",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "oee", label: "OEE", formule: "disponibilité × performance × qualité", benchmark: ">65%", seuils: { vert: 65, jaune: 50, rouge: 35 }, tier: "T3", unite: "%" },
        { id: "taux_rebut", label: "Taux de rebut", formule: "pièces rebutées / pièces produites × 100", benchmark: "<3%", seuils: { vert: 3, jaune: 5, rouge: 10 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "playbooks_production",
      label: "Playbooks",
      description: "Playbooks production par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["programme-prevention-sst", "audit-qualite-interne", "programme-maintenance-preventive"],
    },
  ],
};

// ── CHROB — Hélène — RH (CHRO) ──

const CHROB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CHROB",
  deptLabel: "Ressources Humaines",
  subSections: [
    {
      id: "organigramme",
      label: "Organigramme & Effectifs",
      description: "Structure organisationnelle, postes, effectifs",
      icon: "Building2",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "nb_employes_total", label: "Effectifs totaux", type: "number", tier: "T2" },
        { id: "nb_cadres", label: "Nombre de cadres", type: "number", tier: "T3" },
        { id: "organigramme_formalise", label: "Organigramme formalisé", type: "select", options: ["Oui", "Non"], tier: "T2" },
        { id: "postes_ouverts", label: "Postes ouverts", type: "number", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "remuneration",
      label: "Rémunération & Avantages",
      description: "Grilles salariales, avantages sociaux",
      icon: "DollarSign",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "grille_salariale", label: "Grille salariale", type: "select", options: ["Formelle", "Informelle", "Absente"], tier: "T3" },
        { id: "avantages_sociaux", label: "Avantages sociaux offerts", type: "list", tier: "T2" },
        { id: "masse_salariale", label: "Masse salariale annuelle", type: "currency", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "recrutement",
      label: "Recrutement",
      description: "Pipeline, marque employeur, sources",
      icon: "Target",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "sources_recrutement", label: "Sources de recrutement", type: "list", tier: "T2" },
        { id: "marque_employeur", label: "Marque employeur", type: "select", options: ["Active", "Passive", "Absente"], tier: "T3" },
        { id: "time_to_fill", label: "Time-to-fill moyen (jours)", type: "number", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "formation",
      label: "Formation & Développement",
      description: "Plan de formation, budget, heures/employé",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "plan_formation", label: "Plan de formation", type: "select", options: ["Formel", "Informel", "Absent"], tier: "T3" },
        { id: "budget_formation", label: "Budget formation annuel", type: "currency", tier: "T3" },
        { id: "heures_formation_emp", label: "Heures formation/employé/an", type: "number", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "conformite_rh",
      label: "Conformité RH",
      description: "Équité salariale, normes du travail, Loi 96",
      icon: "Shield",
      pertinence: { T1: "H", T2: "H", T3: "R", T4: "R", T5: "R" },
      fields: [
        { id: "equite_salariale", label: "Exercice d'équité salariale", type: "select", options: ["Complété", "En cours", "Non fait", "N/A (<10 emp)"], tier: "T3" },
        { id: "politique_harcelement", label: "Politique anti-harcèlement", type: "select", options: ["Oui", "Non"], tier: "T3" },
        { id: "francisation", label: "Comité de francisation", type: "select", options: ["Actif", "N/A (<25 emp)", "Requis — non formé"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "culture_engagement",
      label: "Culture & Engagement",
      description: "eNPS, sondages, télétravail",
      icon: "Flame",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "enps", label: "eNPS actuel", type: "number", tier: "T3" },
        { id: "sondage_engagement", label: "Dernier sondage", type: "date", tier: "T3" },
        { id: "politique_teletravail", label: "Politique télétravail", type: "select", options: ["Hybride", "100% présentiel", "100% remote", "Flexible"], tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "succession",
      label: "Succession & Rétention",
      description: "Plan succession, hauts potentiels, turnover",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "plan_succession", label: "Plan de succession", type: "select", options: ["Complet", "Partiel", "Absent"], tier: "T4" },
        { id: "hauts_potentiels", label: "Hauts potentiels identifiés", type: "number", tier: "T4" },
        { id: "taux_turnover", label: "Taux de turnover (%)", type: "percentage", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "kpis_rh",
      label: "KPIs RH",
      description: "Turnover, eNPS, time-to-fill",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "turnover_kpi", label: "Turnover annuel", formule: "départs / effectif moyen × 100", benchmark: "<15%", seuils: { vert: 15, jaune: 25, rouge: 40 }, tier: "T3", unite: "%" },
        { id: "enps_kpi", label: "eNPS", formule: "% promoteurs - % détracteurs", benchmark: ">30", seuils: { vert: 30, jaune: 10, rouge: -10 }, tier: "T3", unite: "" },
        { id: "time_to_fill_kpi", label: "Time-to-fill", formule: "jours entre ouverture et embauche", benchmark: "<45j", seuils: { vert: 45, jaune: 75, rouge: 120 }, tier: "T3", unite: "jours" },
      ],
    },
    {
      id: "playbooks_rh",
      label: "Playbooks",
      description: "Playbooks RH par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["exercice-equite-salariale", "programme-onboarding", "plan-succession-talents"],
    },
  ],
};

// ── CINOB — Inès — Innovation & R&D (CINO) ──

const CINOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CINOB",
  deptLabel: "Innovation & R&D",
  subSections: [
    {
      id: "pipeline_innovation",
      label: "Pipeline Innovation",
      description: "Kanban idées, funnel innovation",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "idees_backlog", label: "Idées en backlog", type: "number", tier: "T2" },
        { id: "projets_actifs", label: "Projets innovation actifs", type: "number", tier: "T2" },
        { id: "pipeline_innovation", label: "Pipeline innovation (JSON)", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "propriete_intellectuelle",
      label: "Propriété Intellectuelle",
      description: "Brevets, marques, secrets commerciaux",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "brevets", label: "Brevets déposés/obtenus", type: "json", tier: "T3" },
        { id: "marques_commerce", label: "Marques de commerce", type: "list", tier: "T2" },
        { id: "secrets_commerciaux", label: "Secrets commerciaux documentés", type: "select", options: ["Oui", "Partiellement", "Non"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "rsde",
      label: "R&D & RS&DE",
      description: "Projets R&D, documentation, feuilles de temps",
      icon: "Layers",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "projets_rd", label: "Projets R&D actifs", type: "json", tier: "T2" },
        { id: "rsde_admissible", label: "RS&DE admissible", type: "select", options: ["Oui — déposé", "Oui — éligible", "Non éligible", "À évaluer"], tier: "T2" },
        { id: "budget_rd", label: "Budget R&D annuel", type: "currency", tier: "T3" },
        { id: "documentation_rsde", label: "Documentation RS&DE", type: "select", options: ["Complète", "Partielle", "Absente"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "veille",
      label: "Veille Technologique",
      description: "Tendances, benchmark, événements",
      icon: "Compass",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "I", T5: "C" },
      fields: [
        { id: "sources_veille", label: "Sources de veille", type: "list", tier: "T2" },
        { id: "tendances_cles", label: "Tendances clés identifiées", type: "list", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "prototypage",
      label: "Prototypage & Tests",
      description: "Prototypes, feedback utilisateurs, itérations",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "prototypes_actifs", label: "Prototypes en cours", type: "number", tier: "T2" },
        { id: "tests_utilisateurs", label: "Tests utilisateurs réalisés", type: "number", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "partenariats_rd",
      label: "Partenariats R&D",
      description: "Universités, MITACS, centres de recherche",
      icon: "Building2",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "partenaires_rd", label: "Partenaires R&D", type: "json", tier: "T3" },
        { id: "subventions_rd", label: "Subventions R&D actives", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "kpis_innovation",
      label: "KPIs Innovation",
      description: "Indice vitalité, ROI R&D, TTM",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "indice_vitalite", label: "Indice vitalité", formule: "CA nouveaux produits 3 ans / CA total × 100", benchmark: ">25%", seuils: { vert: 25, jaune: 10, rouge: 5 }, tier: "T3", unite: "%" },
        { id: "roi_rd", label: "ROI R&D", formule: "(revenus attribuables R&D - investissement R&D) / investissement R&D", benchmark: ">200%", seuils: { vert: 200, jaune: 100, rouge: 50 }, tier: "T3", unite: "%" },
        { id: "ttm", label: "Time-to-Market", formule: "mois idée → lancement", benchmark: "<12m", seuils: { vert: 12, jaune: 18, rouge: 24 }, tier: "T3", unite: "mois" },
      ],
    },
    {
      id: "playbooks_innovation",
      label: "Playbooks",
      description: "Playbooks innovation par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["programme-rsde", "processus-innovation-stage-gate", "veille-technologique"],
    },
  ],
};

// ── CROB — Rich — Ventes / Revenus (CRO) ──

const CROB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CROB",
  deptLabel: "Ventes & Revenus",
  subSections: [
    {
      id: "pipeline_funnel",
      label: "Pipeline & Funnel",
      description: "Étapes, valeur, conversion",
      icon: "TrendingUp",
      pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "etapes_vente", label: "Étapes du funnel", type: "list", tier: "T1" },
        { id: "valeur_pipeline", label: "Valeur pipeline totale", type: "currency", tier: "T1" },
        { id: "nb_opportunites", label: "Opportunités actives", type: "number", tier: "T1" },
        { id: "taux_conversion_global", label: "Taux de conversion global (%)", type: "percentage", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "methodologie_vente",
      label: "Méthodologie Vente",
      description: "MEDDIC, BANT, scripts",
      icon: "ListChecks",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "methodologie", label: "Méthodologie utilisée", type: "select", options: ["MEDDIC", "BANT", "Challenger Sale", "SPIN", "Solution Selling", "Aucune formelle"], tier: "T2" },
        { id: "scripts_vente", label: "Scripts de vente", type: "select", options: ["Formalisés", "Informels", "Absents"], tier: "T3" },
        { id: "processus_qualif", label: "Processus de qualification", type: "textarea", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "remuneration_ventes",
      label: "Rémunération Ventes",
      description: "Commissions, OTE, quotas",
      icon: "DollarSign",
      pertinence: { T1: "H", T2: "H", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "structure_commission", label: "Structure de commission", type: "textarea", tier: "T3" },
        { id: "ote_moyen", label: "OTE moyen", type: "currency", tier: "T3" },
        { id: "quotas", label: "Quotas par vendeur", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "comptes_cles",
      label: "Comptes Clés",
      description: "Top clients, rétention, upsell",
      icon: "Target",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "top_clients", label: "Top 10 clients (% CA)", type: "json", tier: "T1" },
        { id: "taux_retention", label: "Taux de rétention (%)", type: "percentage", tier: "T2" },
        { id: "revenu_moyen_client", label: "Revenu moyen par client", type: "currency", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "territoires",
      label: "Territoires & Quotas",
      description: "Découpage territorial, attribution",
      icon: "Compass",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "decoupage", label: "Découpage territorial", type: "json", tier: "T3" },
        { id: "nb_vendeurs", label: "Nombre de vendeurs", type: "number", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "kpis_ventes",
      label: "KPIs Ventes",
      description: "Win rate, couverture pipeline, cycle vente",
      icon: "TrendingUp",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "win_rate", label: "Win Rate", formule: "deals gagnés / total deals × 100", benchmark: ">25%", seuils: { vert: 25, jaune: 15, rouge: 8 }, tier: "T2", unite: "%" },
        { id: "couverture_pipeline", label: "Couverture Pipeline", formule: "valeur pipeline / objectif trimestre", benchmark: ">3x", seuils: { vert: 3, jaune: 2, rouge: 1 }, tier: "T2", unite: "x" },
        { id: "cycle_vente", label: "Cycle de vente moyen", formule: "jours premier contact → closing", benchmark: "<60j", seuils: { vert: 60, jaune: 90, rouge: 120 }, tier: "T2", unite: "jours" },
      ],
    },
    {
      id: "playbooks_ventes",
      label: "Playbooks",
      description: "Playbooks ventes par phase",
      icon: "Rocket",
      pertinence: { T1: "O", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["processus-vente-b2b", "programme-comptes-cles", "optimisation-pipeline"],
    },
  ],
};

// ── CLOB — Loulou — Legal (CLO) ──

const CLOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CLOB",
  deptLabel: "Legal",
  subSections: [
    {
      id: "structure_corporative",
      label: "Structure Corporative",
      description: "Registraire, minutes, licences",
      icon: "Building2",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "type_entite", label: "Type d'entité", type: "select", options: ["Inc. fédérale", "Inc. provinciale", "SENC", "Enr.", "OBNL", "Coop"], tier: "T1" },
        { id: "neq", label: "NEQ", type: "text", tier: "T1" },
        { id: "date_incorporation", label: "Date d'incorporation", type: "date", tier: "T1" },
        { id: "minutes_a_jour", label: "Minutes à jour", type: "select", options: ["Oui", "Non", "N/A"], tier: "T2" },
        { id: "licences_permis", label: "Licences et permis", type: "list", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "conformite_loi25",
      label: "Conformité Loi 25",
      description: "PRP, inventaire données, EFVP",
      icon: "Shield",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "responsable_prp", label: "Responsable PRP désigné", type: "select", options: ["Oui", "Non"], tier: "T1" },
        { id: "politique_confidentialite", label: "Politique de confidentialité", type: "select", options: ["Conforme", "À mettre à jour", "Absente"], tier: "T1" },
        { id: "inventaire_rp", label: "Inventaire renseignements personnels", type: "select", options: ["Complété", "En cours", "Non fait"], tier: "T2" },
        { id: "efvp", label: "EFVP réalisée", type: "select", options: ["Oui", "Non — requise", "Non — pas requise"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "contrats",
      label: "Contrats",
      description: "Registre clients/fournisseurs/baux",
      icon: "Layers",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "contrats_clients", label: "Contrats clients standardisés", type: "select", options: ["Oui", "Non"], tier: "T1" },
        { id: "contrats_fournisseurs", label: "Contrats fournisseurs", type: "select", options: ["Formalisés", "Informels"], tier: "T2" },
        { id: "baux_actifs", label: "Baux actifs", type: "json", tier: "T2" },
        { id: "registre_contrats", label: "Registre centralisé", type: "select", options: ["Oui", "Non"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "litiges",
      label: "Litiges & Risques",
      description: "Poursuites, provisions, assurances",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "litiges_actifs", label: "Litiges actifs", type: "number", tier: "T2" },
        { id: "provisions_litiges", label: "Provisions pour litiges", type: "currency", tier: "T3" },
        { id: "assurances", label: "Assurances en place", type: "list", tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "pi_marques",
      label: "PI & Marques",
      description: "Brevets, marques, domaines web",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "brevets_deposes", label: "Brevets déposés", type: "json", tier: "T3" },
        { id: "marques_deposees", label: "Marques déposées", type: "list", tier: "T2" },
        { id: "domaines_web", label: "Domaines web", type: "list", tier: "T1" },
      ],
      kpis: [],
    },
    {
      id: "reglementaire",
      label: "Réglementaire",
      description: "Obligations sectorielles, échéancier",
      icon: "ListChecks",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "obligations_sectorielles", label: "Obligations sectorielles", type: "list", tier: "T3" },
        { id: "echeancier_conformite", label: "Échéancier de conformité", type: "json", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "kpis_legal",
      label: "KPIs Legal",
      description: "Conformité Loi 25, délai contractuel, exposition",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "conformite_loi25_kpi", label: "Conformité Loi 25", formule: "étapes complétées / total × 100", benchmark: "100%", seuils: { vert: 80, jaune: 50, rouge: 20 }, tier: "T2", unite: "%" },
        { id: "delai_contractuel", label: "Délai contractuel moyen", formule: "jours négociation → signature", benchmark: "<30j", seuils: { vert: 30, jaune: 60, rouge: 90 }, tier: "T3", unite: "jours" },
        { id: "exposition_litiges", label: "Exposition litiges", formule: "provisions / CA × 100", benchmark: "<1%", seuils: { vert: 1, jaune: 3, rouge: 5 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "playbooks_legal",
      label: "Playbooks",
      description: "Playbooks légaux par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["conformite-loi25", "revision-contrats", "protection-pi"],
    },
  ],
};

// ── CISOB — Sébastien — Sécurité (CISO) ──

const CISOB_BLUEPRINT: DeptBlueprintConfig = {
  botCode: "CISOB",
  deptLabel: "Sécurité",
  subSections: [
    {
      id: "politiques_iam",
      label: "Politiques & IAM",
      description: "Permissions, MFA, mots de passe",
      icon: "Shield",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "mfa_active", label: "MFA activé", type: "select", options: ["Tous les comptes", "Comptes critiques", "Non"], tier: "T1" },
        { id: "politique_mdp", label: "Politique mots de passe", type: "select", options: ["Gestionnaire MdP", "Complexité forcée", "Aucune"], tier: "T1" },
        { id: "gestion_acces", label: "Gestion des accès", type: "select", options: ["RBAC", "Informelle", "Aucune"], tier: "T2" },
      ],
      kpis: [],
    },
    {
      id: "sauvegardes",
      label: "Sauvegardes & Continuité",
      description: "DRP, backups, stratégie 3-2-1",
      icon: "Shield",
      pertinence: { T1: "I", T2: "C", T3: "C", T4: "C", T5: "C" },
      fields: [
        { id: "strategie_backup", label: "Stratégie backup", type: "select", options: ["3-2-1", "Automatisé basique", "Manuel", "Aucun"], tier: "T1" },
        { id: "frequence_backup", label: "Fréquence backup", type: "select", options: ["Quotidien", "Hebdomadaire", "Mensuel", "Irrégulier"], tier: "T1" },
        { id: "drp", label: "Plan de reprise après sinistre", type: "select", options: ["Documenté + testé", "Documenté non testé", "Absent"], tier: "T2" },
        { id: "rpo_rto", label: "RPO/RTO définis", type: "select", options: ["Oui", "Non"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "vulnerabilites",
      label: "Vulnérabilités & Audits",
      description: "Scans, pen tests, CVE",
      icon: "Shield",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "dernier_scan", label: "Dernier scan vulnérabilités", type: "date", tier: "T3" },
        { id: "dernier_pentest", label: "Dernier pen test", type: "date", tier: "T3" },
        { id: "vulnerabilites_ouvertes", label: "Vulnérabilités ouvertes", type: "number", tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "formation_phishing",
      label: "Formation & Phishing",
      description: "Simulations, sensibilisation",
      icon: "Target",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [
        { id: "derniere_simulation", label: "Dernière simulation phishing", type: "date", tier: "T3" },
        { id: "taux_clic_phishing", label: "Taux de clic phishing (%)", type: "percentage", tier: "T3" },
        { id: "formation_securite", label: "Formation sécurité annuelle", type: "select", options: ["Oui", "Non"], tier: "T3" },
      ],
      kpis: [],
    },
    {
      id: "incidents_reponse",
      label: "Incidents & Réponse",
      description: "Registre incidents, plan réponse, CSIRT",
      icon: "Shield",
      pertinence: { T1: "H", T2: "H", T3: "O", T4: "I", T5: "C" },
      fields: [
        { id: "plan_reponse", label: "Plan de réponse aux incidents", type: "select", options: ["Documenté + testé", "Documenté", "Absent"], tier: "T3" },
        { id: "incidents_12mois", label: "Incidents sécurité 12 mois", type: "number", tier: "T3" },
        { id: "csirt", label: "Équipe réponse (CSIRT)", type: "select", options: ["Interne", "Externe", "Aucune"], tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "certifications_securite",
      label: "Certifications Sécurité",
      description: "SOC 2, ISO 27001, NIST",
      icon: "Shield",
      pertinence: { T1: "H", T2: "H", T3: "H", T4: "O", T5: "C" },
      fields: [
        { id: "certifications", label: "Certifications obtenues", type: "list", tier: "T4" },
        { id: "certifications_visees", label: "Certifications visées", type: "list", tier: "T4" },
        { id: "framework_reference", label: "Framework de référence", type: "select", options: ["NIST CSF", "ISO 27001", "CIS Controls", "Aucun"], tier: "T4" },
      ],
      kpis: [],
    },
    {
      id: "kpis_securite",
      label: "KPIs Sécurité",
      description: "MFA, patching, phishing score",
      icon: "TrendingUp",
      pertinence: { T1: "H", T2: "I", T3: "C", T4: "C", T5: "C" },
      fields: [],
      kpis: [
        { id: "mfa_coverage", label: "Couverture MFA", formule: "comptes MFA / comptes totaux × 100", benchmark: "100%", seuils: { vert: 95, jaune: 80, rouge: 50 }, tier: "T2", unite: "%" },
        { id: "patching_delay", label: "Délai patching critique", formule: "jours entre CVE critique et patch", benchmark: "<14j", seuils: { vert: 14, jaune: 30, rouge: 60 }, tier: "T3", unite: "jours" },
        { id: "phishing_score", label: "Score phishing", formule: "100 - taux_clic", benchmark: ">90%", seuils: { vert: 90, jaune: 70, rouge: 50 }, tier: "T3", unite: "%" },
      ],
    },
    {
      id: "playbooks_securite",
      label: "Playbooks",
      description: "Playbooks sécurité par phase",
      icon: "Rocket",
      pertinence: { T1: "H", T2: "O", T3: "I", T4: "C", T5: "C" },
      fields: [],
      kpis: [],
      playbooks: ["audit-securite-baseline", "plan-reponse-incidents", "programme-sensibilisation"],
    },
  ],
};

// ── Registry — Tous les départements ──

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

/** Nombre total de sous-sections à travers tous les départements */
export function getTotalSubSections(): number {
  return Object.values(BLUEPRINT_CONFIGS).reduce((sum, c) => sum + c.subSections.length, 0);
}

/** Score de complétion d'un département (0-100) basé sur les champs remplis */
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
