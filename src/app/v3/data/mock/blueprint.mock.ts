/**
 * blueprint.mock.ts — Centralized mock data for Blueprint V3 components.
 * Extracted from: ComitesManager, ConseilAdminManager, VueConsolidee, BlueprintPersonnel.
 */

// ══════════════════════════════════════════════════════════════════════
// Shared interfaces
// ══════════════════════════════════════════════════════════════════════

export interface Membre {
  nom: string;
  titre: string;
  courriel: string;
  type: "interne" | "externe";
}

export interface MembreCA extends Membre {
  expertise: string;
  independant: boolean;
  depuis: string;
}

export interface ConseilAdmin {
  president: string;
  frequence: string;
  format: string;
  charte: string;
  assurance_do: string;
  prochaine_reunion: string;
  membres: MembreCA[];
}

export interface Comite {
  id: string;
  nom: string;
  frequence: string;
  format: string;
  description: string;
  responsable: string;
  prochaine_reunion: string;
  membres: Membre[];
}

export interface KeyFieldValue {
  label: string;
  value: string;
}

export interface DeptScore {
  code: string;
  score: number;
  sections: number;
  gaps: number;
  gapLabels: string[];
  keyFields: KeyFieldValue[];
}

// ══════════════════════════════════════════════════════════════════════
// ComitesManager — mock data
// ══════════════════════════════════════════════════════════════════════

export const COMITES_SUGGESTED_TEMPLATES = [
  { nom: "Comité stratégique", description: "Orientations long terme, analyse compétitive, M&A", frequence: "Trimestrielle" },
  { nom: "Comité SST", description: "Santé et sécurité au travail, conformité, prévention", frequence: "Mensuelle" },
  { nom: "Comité R&D", description: "Innovation, prototypes, veille technologique", frequence: "Bimensuelle" },
  { nom: "Comité finance", description: "Budget, trésorerie, investissements, audit interne", frequence: "Mensuelle" },
  { nom: "Comité RH", description: "Recrutement, rétention, formation, culture", frequence: "Mensuelle" },
];

export const COMITE_MOCK_REUNIONS = [
  { date: "2026-03-20", type: "Régulière", participants: 5, duree: "1h30", statut_pv: "Approuvé", sujet: "Suivi des actions et objectifs Q1" },
  { date: "2026-02-18", type: "Régulière", participants: 4, duree: "1h15", statut_pv: "Approuvé", sujet: "Bilan mensuel et ajustements" },
  { date: "2026-01-15", type: "Spéciale", participants: 6, duree: "2h00", statut_pv: "Approuvé", sujet: "Planification annuelle 2026" },
];

export const COMITE_MOCK_DOCUMENTS = [
  { titre: "Mandat du comité", statut: "Actif", maj: "2026-01-10", type: "Gouvernance" },
  { titre: "Procès-verbal — Mars 2026", statut: "Approuvé", maj: "2026-03-22", type: "PV" },
  { titre: "Feuille de route 2026", statut: "En révision", maj: "2026-02-28", type: "Planification" },
];

// ══════════════════════════════════════════════════════════════════════
// ConseilAdminManager — mock data
// ══════════════════════════════════════════════════════════════════════

export const CA_DEFAULT: ConseilAdmin = {
  president: "", frequence: "Trimestrielle", format: "Conférence AI",
  charte: "Non", assurance_do: "Non", prochaine_reunion: "", membres: [],
};

export const CA_MOCK_REUNIONS = [
  { date: "2026-03-15", type: "Trimestrielle", participants: 7, duree: "2h30", statut_pv: "Approuvé", sujet: "Bilan Q1 et orientations stratégiques" },
  { date: "2026-01-20", type: "Extraordinaire", participants: 5, duree: "1h15", statut_pv: "Approuvé", sujet: "Approbation budget 2026" },
  { date: "2025-12-12", type: "Trimestrielle", participants: 8, duree: "3h00", statut_pv: "Approuvé", sujet: "Bilan annuel et planification" },
  { date: "2026-04-25", type: "Trimestrielle", participants: 0, duree: "—", statut_pv: "À venir", sujet: "Revue Q1 et croissance" },
];

export const CA_MOCK_CONFERENCES = [
  { date: "2026-03-10", sujet: "Analyse SWOT avec CarlOS", duree: "45min", bots: ["CEOB", "CSOB", "CFOB"], participants: 5 },
  { date: "2026-02-15", sujet: "Scénario de croissance M&A", duree: "1h10", bots: ["CEOB", "CFOB", "CROB"], participants: 6 },
  { date: "2026-01-28", sujet: "Revue technologique annuelle", duree: "55min", bots: ["CTOB", "CINOB", "CEOB"], participants: 4 },
];

export const CA_MOCK_DOCUMENTS = [
  { titre: "Charte du CA", statut: "Actif", maj: "2026-01-15", type: "Gouvernance" },
  { titre: "Code d'éthique et de conduite", statut: "Actif", maj: "2025-11-20", type: "Éthique" },
  { titre: "Politique D&O (Assurance)", statut: "En révision", maj: "2026-03-01", type: "Assurance" },
  { titre: "Matrice RACI — Responsabilités CA", statut: "Brouillon", maj: "2026-02-28", type: "Opérationnel" },
  { titre: "Politique sur les conflits d'intérêts", statut: "Actif", maj: "2025-09-10", type: "Conformité" },
  { titre: "Règlements généraux de l'organisation", statut: "Actif", maj: "2024-06-15", type: "Juridique" },
];

export const CA_BLUEPRINT_COMPLETIONS = [65, 82, 45, 73, 58, 91, 38, 70];

// ══════════════════════════════════════════════════════════════════════
// VueConsolidee — mock data
// ══════════════════════════════════════════════════════════════════════

export const VUE_CONSOLIDEE_OTHER_BOTS: { code: string; label: string; bot: string; short: string; gradient: string }[] = [
  { code: "CTOB", label: "Technologie", bot: "Tim", short: "CTO", gradient: "from-violet-600 to-violet-500" },
  { code: "CFOB", label: "Finance", bot: "Frank", short: "CFO", gradient: "from-emerald-600 to-emerald-500" },
  { code: "CMOB", label: "Marketing", bot: "Mathilde", short: "CMO", gradient: "from-pink-600 to-pink-500" },
  { code: "CSOB", label: "Strategie", bot: "Simone", short: "CSO", gradient: "from-red-600 to-red-500" },
  { code: "COOB", label: "Operations", bot: "Olivier", short: "COO", gradient: "from-orange-600 to-orange-500" },
  { code: "CPOB", label: "Production", bot: "Paco", short: "CPO", gradient: "from-amber-600 to-amber-500" },
  { code: "CHROB", label: "RH", bot: "Helene", short: "CHRO", gradient: "from-teal-600 to-teal-500" },
  { code: "CINOB", label: "Innovation", bot: "Ines", short: "CINO", gradient: "from-rose-600 to-rose-500" },
  { code: "CROB", label: "Ventes", bot: "Rich", short: "CRO", gradient: "from-amber-600 to-amber-500" },
  { code: "CLOB", label: "Legal", bot: "Loulou", short: "CLO", gradient: "from-indigo-600 to-indigo-500" },
  { code: "CISOB", label: "Securite", bot: "Sebastien", short: "CISO", gradient: "from-gray-600 to-gray-500" },
];

export const DEPT_KEY_FIELDS: Record<string, { sectionId: string; fieldId: string; label: string }[]> = {
  CTOB: [
    { sectionId: "stack_technique", fieldId: "cloud_provider", label: "Cloud" },
    { sectionId: "infrastructure", fieldId: "cout_mensuel", label: "Coût infra/mois" },
    { sectionId: "dette_technique", fieldId: "score_dette", label: "Dette technique" },
  ],
  CFOB: [
    { sectionId: "modele_revenus", fieldId: "chiffre_affaires_estime", label: "CA estimé" },
    { sectionId: "tresorerie", fieldId: "solde_bancaire", label: "Solde bancaire" },
    { sectionId: "tresorerie", fieldId: "burn_rate", label: "Burn rate" },
  ],
  CMOB: [
    { sectionId: "personas_icp", fieldId: "icp_principal", label: "ICP principal" },
    { sectionId: "positionnement", fieldId: "uvp", label: "UVP" },
    { sectionId: "canaux_budget", fieldId: "budget_marketing", label: "Budget marketing" },
  ],
  CSOB: [
    { sectionId: "marche", fieldId: "tam", label: "TAM" },
    { sectionId: "concurrence", fieldId: "top_3_concurrents", label: "Top 3 concurrents" },
    { sectionId: "avantage_concurrentiel", fieldId: "differenciateur_cle", label: "Différenciateur" },
  ],
  COOB: [
    { sectionId: "processus", fieldId: "processus_livraison", label: "Processus livraison" },
    { sectionId: "capacite_planification", fieldId: "taux_utilisation_capacite", label: "Utilisation capacité" },
    { sectionId: "supply_chain", fieldId: "fournisseurs_cles", label: "Fournisseurs clés" },
  ],
  CPOB: [
    { sectionId: "planification_production", fieldId: "capacite_journaliere", label: "Capacité/jour" },
    { sectionId: "gestion_stocks", fieldId: "valeur_inventaire", label: "Inventaire" },
    { sectionId: "qualite", fieldId: "systeme_qualite", label: "Système qualité" },
  ],
  CHROB: [
    { sectionId: "organigramme", fieldId: "nb_employes_total", label: "Employés" },
    { sectionId: "recrutement", fieldId: "postes_ouverts", label: "Postes ouverts" },
    { sectionId: "remuneration", fieldId: "avantages_sociaux", label: "Avantages sociaux" },
  ],
  CINOB: [
    { sectionId: "pipeline_innovation", fieldId: "projets_actifs", label: "Projets R&D" },
    { sectionId: "propriete_intellectuelle", fieldId: "marques_commerce", label: "Marques" },
    { sectionId: "propriete_intellectuelle", fieldId: "brevets", label: "Brevets" },
  ],
  CROB: [
    { sectionId: "pipeline_funnel", fieldId: "valeur_pipeline", label: "Pipeline ($)" },
    { sectionId: "pipeline_funnel", fieldId: "nb_opportunites", label: "Opportunités" },
    { sectionId: "methodologie_vente", fieldId: "crm_integre_facturation", label: "CRM intégré" },
  ],
  CLOB: [
    { sectionId: "structure_corporative", fieldId: "type_entite", label: "Type entité" },
    { sectionId: "contrats", fieldId: "registre_centralise_clm", label: "CLM" },
    { sectionId: "pi_marques", fieldId: "marques_commerce_deposees", label: "Marques déposées" },
  ],
  CISOB: [
    { sectionId: "politiques_iam", fieldId: "mfa_active", label: "MFA" },
    { sectionId: "vulnerabilites", fieldId: "dernier_pentest", label: "Dernier pentest" },
    { sectionId: "sauvegardes", fieldId: "strategie_backup", label: "Backup" },
  ],
};

export const VUE_CONSOLIDEE_MOCK_SCORES: Record<string, { score: number; gaps: number; gapLabels: string[]; keyFields: KeyFieldValue[] }> = {
  CTOB: { score: 45, gaps: 3, gapLabels: ["Stack technique", "Infrastructure"], keyFields: [{ label: "Cloud", value: "AWS" }, { label: "Coût infra/mois", value: "2 400$" }, { label: "Dette technique", value: "Moyenne" }] },
  CFOB: { score: 72, gaps: 1, gapLabels: ["Trésorerie"], keyFields: [{ label: "CA estimé", value: "3.2M$" }, { label: "Solde bancaire", value: "485K$" }, { label: "Burn rate", value: "42K$/mois" }] },
  CMOB: { score: 38, gaps: 4, gapLabels: ["Personas ICP", "Positionnement", "Canaux"], keyFields: [{ label: "ICP principal", value: "PME manufact. 50-200 emp." }, { label: "Budget marketing", value: "8 500$/mois" }] },
  CSOB: { score: 61, gaps: 2, gapLabels: ["Concurrence", "Avantage concurrentiel"], keyFields: [{ label: "TAM", value: "890M$" }, { label: "Différenciateur", value: "IA + réseau REAI" }] },
  COOB: { score: 55, gaps: 2, gapLabels: ["Supply chain", "Capacité"], keyFields: [{ label: "Utilisation capacité", value: "78%" }, { label: "Fournisseurs clés", value: "12 actifs" }] },
  CPOB: { score: 29, gaps: 5, gapLabels: ["Planification", "Stocks", "Qualité"], keyFields: [{ label: "Capacité/jour", value: "—" }, { label: "Système qualité", value: "ISO en cours" }] },
  CHROB: { score: 67, gaps: 1, gapLabels: ["Rémunération"], keyFields: [{ label: "Employés", value: "47" }, { label: "Postes ouverts", value: "3" }, { label: "Avantages sociaux", value: "Groupe + REER" }] },
  CINOB: { score: 42, gaps: 3, gapLabels: ["Pipeline innovation", "PI"], keyFields: [{ label: "Projets R&D", value: "4 actifs" }, { label: "Brevets", value: "1 en cours" }] },
  CROB: { score: 58, gaps: 2, gapLabels: ["Pipeline funnel", "Méthodologie"], keyFields: [{ label: "Pipeline ($)", value: "1.8M$" }, { label: "Opportunités", value: "23" }, { label: "CRM intégré", value: "HubSpot" }] },
  CLOB: { score: 35, gaps: 4, gapLabels: ["Contrats", "PI/Marques", "Conformité"], keyFields: [{ label: "Type entité", value: "Inc. fédérale" }, { label: "Marques déposées", value: "2" }] },
  CISOB: { score: 22, gaps: 5, gapLabels: ["Politiques IAM", "Vulnérabilités", "Sauvegardes"], keyFields: [{ label: "MFA", value: "Partiel" }, { label: "Dernier pentest", value: "Jamais" }, { label: "Backup", value: "Manuel" }] },
};

// ══════════════════════════════════════════════════════════════════════
// BlueprintPersonnel — simulation data (pre-fill for "Vue completee")
// ══════════════════════════════════════════════════════════════════════

export const SIMULATION_DATA: Record<string, string> = {
  "personnel_identite.nom_complet": "Carl Fugere",
  "personnel_identite.titre_poste": "CEO & Fondateur",
  "personnel_identite.entreprise": "Usine Bleue AI",
  "personnel_identite.parcours_resume": "26 ans d'experience entrepreneuriale, 7 entreprises, 50M$+ en ventes cumulees. Fondateur du REAI (reseau de 130+ manufacturiers au Quebec).",
  "personnel_identite.forces_cles": "Vision strategique\nLeadership entrepreneurial\nDeveloppement d'affaires\nReseautage et partenariats",
  "personnel_vitaa.score_vente": "72",
  "personnel_vitaa.score_idee": "85",
  "personnel_vitaa.score_temps": "38",
  "personnel_vitaa.score_argent": "61",
  "personnel_vitaa.score_actif": "45",
  "personnel_vision.mission_personnelle": "Je crois que chaque dirigeant de PME merite un copilote IA qui comprend sa realite. Brain Team est cette revolution — un conseil d'administration virtuel accessible, abordable et aligne sur les besoins reels du terrain.",
  "personnel_vision.vision_personnelle": "Devenir la plateforme #1 d'intelligence d'affaires pour les PME manufacturieres au Canada, avec 1000+ entreprises actives d'ici 2029.",
  "personnel_vision.valeurs": "Authenticite — Dire la verite, meme quand ca fait mal\nExcellence — Livrer le meilleur dans les contraintes reelles\nInnovation — Remettre en question chaque processus",
  "personnel_vision.style_primaire": "Visionnaire",
  "personnel_vision.style_secondaire": "Directif",
  "personnel_vision.style_description": "Part de la destination finale et remonte vers l'execution. Communique la vision de facon obsessive, prend des decisions rapides et assume les consequences.",
  "personnel_vision.legacy": "Avoir donne aux PME quebecoises les memes outils d'intelligence d'affaires que les Fortune 500, a une fraction du cout.",
  "personnel_objectifs.objectif_1": "Lancer Brain Team en mode Pioneer (9 clients)",
  "personnel_objectifs.objectif_1_cible": "Q2 2026",
  "personnel_objectifs.objectif_2": "Atteindre 50K$ MRR",
  "personnel_objectifs.objectif_2_cible": "Q4 2026",
  "personnel_objectifs.objectif_3": "Recruter 3 developpeurs",
  "personnel_objectifs.objectif_3_cible": "Q3 2026",
  "personnel_objectifs.objectif_4": "Fermer ronde seed 500K$",
  "personnel_objectifs.objectif_4_cible": "Q2 2026",
  "personnel_objectifs.objectif_5": "130 a 200 membres REAI",
  "personnel_objectifs.objectif_5_cible": "Q4 2026",
  "personnel_performance.kpi_pipeline": "320000",
  "personnel_performance.kpi_pipeline_cible": "500000",
  "personnel_performance.kpi_mrr": "12500",
  "personnel_performance.kpi_mrr_cible": "50000",
  "personnel_performance.projets_livres": "7",
  "personnel_performance.projets_cible": "12",
  "personnel_performance.satisfaction_equipe": "82",
  "personnel_performance.decisions_strategiques": "23",
  "personnel_developpement.competences_a_developper": "Vente enterprise (B2B SaaS)\nGestion de produit (Product-Led Growth)\nLevee de fonds (Pitch, Term Sheets)",
  "personnel_developpement.formations": "YC Startup School — complete\nReforge Growth Series — planifie\nAI Leadership (Stanford Online) — planifie",
  "personnel_developpement.mentorat": "Mentor en SaaS B2B — recherche\nReseau REAI — mentorat reciproque — actif",
  "personnel_developpement.lectures": "Zero to One (Peter Thiel)\nThe Hard Thing About Hard Things (Ben Horowitz)",
  "personnel_equilibre.heures_actuelles": "58",
  "personnel_equilibre.heures_cible": "45",
  "personnel_equilibre.taches_a_deleguer": "Support technique niveau 1\nGestion des deploiements\nAdmin comptable\nPlanification meetings recurrents",
  "personnel_equilibre.temps_non_negociable": "Souper en famille 5x/sem\nSport 3x/sem\nDeconnexion dimanche",
  "personnel_equilibre.indicateurs_stress": "Insomnie\nMicro-management\nSauter des repas",
  "personnel_succession.horizon": "5-10 ans",
  "personnel_succession.plan_succession": "Batir une equipe de leadership autonome capable de gerer les operations sans dependance quotidienne au fondateur. Objectif: ne plus etre indispensable d'ici 2031.",
  "personnel_succession.personnes_cles": "Tim (CTOB) — CTO, pipeline technique autonome — 75%\nRich (CROB) — VP Ventes, pipeline commercial — 45%\nOlivier (COOB) — COO, operations quotidiennes — 60%",
  "personnel_succession.connaissances_critiques": "Vision produit & roadmap\nRelations REAI (130+ contacts)\nArchitecture BTML / GHML\nProcessus de vente consultative",
  "personnel_succession.scenario_urgence": "Tim assume la direction technique, Rich prend le pipeline ventes, Olivier gere les operations. CA consultatif prend les decisions strategiques majeures.",
};
