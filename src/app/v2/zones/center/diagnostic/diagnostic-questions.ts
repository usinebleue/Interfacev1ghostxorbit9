/**
 * diagnostic-questions.ts — Plateforme de Diagnostics IA Usine Bleue V2
 * 6 types d'acteurs écosystème × 12 départements × 4 questions
 * 70% questions génériques + 30% adaptées par type d'acteur
 * Architecture: catalogue extensible (100+ diagnostics à terme)
 * Source: BE8 + FE9 + docs/Diagnostic-IA-*.md
 */

// ── Types ──

export type ProfilType = "MFG" | "FEQ" | "DEV" | "INT" | "DST" | "ORG";
export type TailleCategorie = "petite" | "moyenne" | "grande";
export type DeptTier = "CORE" | "EXPAND" | "FULL";

export interface ProfilTypeInfo {
  code: ProfilType;
  nom: string;
  description: string;
  sousCats: string[];
  color: string;
  stat: string;
}

export interface DiagnosticCatalogueItem {
  id: string;
  nom: string;
  description: string;
  profilTypes: ProfilType[] | "all";
  estimatedMinutes: number;
  badge?: string;
  available: boolean;
}

export interface QuestionOption {
  label: string;
  score: number;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  questionByProfil?: Partial<Record<ProfilType, string>>;
  options: QuestionOption[];
  optionsByProfil?: Partial<Record<ProfilType, QuestionOption[]>>;
}

export interface DepartementInfo {
  code: string;
  nom: string;
  nomByProfil?: Partial<Record<ProfilType, string>>;
  tier: DeptTier;
  gapPhrase: string;
  gapPhraseByProfil?: Partial<Record<ProfilType, string>>;
}

export interface SecteurSCIAN {
  code: string;
  label: string;
}

// ── 6 Types d'acteurs écosystème (BE8 — E.5.2) ──

export const PROFIL_TYPES: ProfilTypeInfo[] = [
  {
    code: "MFG", nom: "Manufacturier",
    description: "Fabrique des produits physiques — usine, plancher, production",
    sousCats: ["Transformation métallique", "Plastique/composites", "Alimentaire", "Bois/meubles", "Électronique", "Aéronautique"],
    color: "#f97316", stat: "13 694 établissements au QC",
  },
  {
    code: "FEQ", nom: "Fabricant d'équipements",
    description: "Conçoit et fabrique des machines, robots, systèmes d'automatisation",
    sousCats: ["Robotique", "Cobots", "Vision industrielle", "Outillage CNC", "Soudage", "Convoyeurs"],
    color: "#8b5cf6", stat: "59% de l'offre d'équipements",
  },
  {
    code: "DEV", nom: "Développeur logiciel",
    description: "Éditeur ERP, MES, IoT, IA, SaaS — solutions logicielles industrielles",
    sousCats: ["ERP/MRP", "MES/SCADA", "IoT industriel", "IA/ML", "PLM/CAO", "Cybersécurité OT"],
    color: "#3b82f6", stat: "52% de l'offre logicielle",
  },
  {
    code: "INT", nom: "Intégrateur / Consultant",
    description: "Firme d'intégration, conseil en transformation, gestion de projets 4.0",
    sousCats: ["Intégration systèmes", "Conseil 4.0", "Formation", "Gestion de projet", "Lean/Six Sigma"],
    color: "#10b981", stat: "57% de l'offre d'intégration",
  },
  {
    code: "DST", nom: "Distributeur / Revendeur",
    description: "Distribution, logistique, revente spécialisée de produits industriels",
    sousCats: ["Distribution industrielle", "Revente spécialisée", "Marketplace B2B", "Logistique"],
    color: "#ec4899", stat: "Chaîne d'approvisionnement locale",
  },
  {
    code: "ORG", nom: "Organisme / Association",
    description: "Association sectorielle, organisme public, centre de transfert, accélérateur",
    sousCats: ["Associations sectorielles", "Organismes gouvernementaux", "CCTT", "Accélérateurs"],
    color: "#14b8a6", stat: "REAI 130+ membres, STIQ, MEI",
  },
];

// ── Types supply-side (vendent aux manufacturiers) ──

export const SUPPLY_SIDE_TYPES: ProfilType[] = ["FEQ", "DEV", "INT", "DST"];

// ── Catalogue de diagnostics (extensible — 100+ à terme) ──

export const DIAGNOSTIC_CATALOGUE: DiagnosticCatalogueItem[] = [
  {
    id: "maturite-ia", nom: "Diagnostic Maturité IA",
    description: "Évaluez la maturité IA de votre entreprise en 12 départements C-Level. Identifiez vos gaps, quick wins et Ghost Team recommandé.",
    profilTypes: "all", estimatedMinutes: 30, badge: "POPULAIRE", available: true,
  },
  {
    id: "cybersecurite-ot", nom: "Diagnostic Cybersécurité OT/IT",
    description: "Audit de votre posture sécurité: IT, OT, cloud, données. Standards ISO 27001, NIST.",
    profilTypes: ["MFG", "FEQ", "DEV"], estimatedMinutes: 20, available: false,
  },
  {
    id: "supply-chain-4", nom: "Diagnostic Supply Chain 4.0",
    description: "Maturité chaîne d'approvisionnement: inventaire, prévision, logistique, fournisseurs.",
    profilTypes: ["MFG", "DST"], estimatedMinutes: 25, available: false,
  },
  {
    id: "transformation-rh", nom: "Diagnostic Transformation RH",
    description: "Recrutement, rétention, formation, culture: où l'IA peut transformer vos RH.",
    profilTypes: "all", estimatedMinutes: 15, available: false,
  },
  {
    id: "readiness-export", nom: "Diagnostic Prêt à l'Export",
    description: "Évaluez votre capacité d'exportation: marchés, conformité, logistique, financement.",
    profilTypes: ["MFG", "FEQ", "DEV"], estimatedMinutes: 20, available: false,
  },
];

// ── Secteurs par type d'acteur ──

export const SECTEURS_SCIAN: SecteurSCIAN[] = [
  // MFG + FEQ
  { code: "311", label: "Agroalimentaire" },
  { code: "3364", label: "Aérospatiale" },
  { code: "332", label: "Métallurgie" },
  { code: "326", label: "Plastique / Caoutchouc" },
  { code: "333", label: "Machinerie" },
  { code: "321", label: "Bois / Meuble" },
  { code: "334", label: "Électronique" },
  { code: "autre_manuf", label: "Autre manufacturier" },
  // FEQ spécifique
  { code: "feq_robot", label: "Robotique / Automatisation" },
  { code: "feq_vision", label: "Vision / Inspection" },
  { code: "feq_equip", label: "Équipements industriels" },
  // DEV
  { code: "dev_erp", label: "ERP / MES / SCADA" },
  { code: "dev_iot", label: "IoT / IA industriel" },
  { code: "dev_saas", label: "SaaS / Logiciel" },
  // INT
  { code: "int_auto", label: "Intégration / Automatisation" },
  { code: "int_conseil", label: "Conseil / Firme professionnelle" },
  { code: "int_form", label: "Formation / Transfert techno" },
  // DST
  { code: "dst_dist", label: "Distribution industrielle" },
  { code: "dst_revente", label: "Revente spécialisée" },
  // ORG
  { code: "org_asso", label: "Association sectorielle" },
  { code: "org_gouv", label: "Organisme gouvernemental" },
  { code: "org_cctt", label: "Centre de transfert (CCTT)" },
  // Générique
  { code: "autre", label: "Autre" },
];

export function getSecteursForProfil(profil: ProfilType): SecteurSCIAN[] {
  const map: Record<ProfilType, string[]> = {
    MFG: ["311", "3364", "332", "326", "333", "321", "334", "autre_manuf"],
    FEQ: ["feq_robot", "feq_vision", "feq_equip", "332", "333", "autre_manuf"],
    DEV: ["dev_erp", "dev_iot", "dev_saas", "autre"],
    INT: ["int_auto", "int_conseil", "int_form", "autre"],
    DST: ["dst_dist", "dst_revente", "autre"],
    ORG: ["org_asso", "org_gouv", "org_cctt", "autre"],
  };
  return SECTEURS_SCIAN.filter(s => map[profil].includes(s.code));
}

// ── 12 Départements ──

export const DEPARTEMENTS: DepartementInfo[] = [
  {
    code: "BCO", nom: "Direction / CEO", tier: "CORE",
    gapPhrase: "CarlOS agit comme votre copilote stratégique — il analyse vos données, simule des scénarios et vous donne des perspectives multi-angles pour chaque décision importante.",
  },
  {
    code: "BCF", nom: "Finance / CFO", tier: "CORE",
    gapPhrase: "BCF François automatise vos rapports, prédit votre trésorerie et analyse vos coûts — ce qui prend 15h/semaine se fait en 20 minutes.",
  },
  {
    code: "BCM", nom: "Marketing / CMO", tier: "CORE",
    gapPhrase: "BCM Martine crée votre contenu, analyse votre marché et structure votre pipeline — 3x plus de leads avec le marketing automatisé.",
  },
  {
    code: "BOO", nom: "Opérations / COO", tier: "CORE",
    gapPhrase: "BOO Olivier optimise la planification, réduit les goulots et élimine le temps perdu — 15-25% d'efficacité en plus.",
  },
  {
    code: "BFA", nom: "Production / Usine", tier: "CORE",
    nomByProfil: { FEQ: "R&D / Fabrication", DEV: "Développement / Livraison", INT: "Livraison / Projets", DST: "Logistique / Distribution", ORG: "Programmes / Services" },
    gapPhrase: "BFA Factory analyse votre TRS, optimise la maintenance et détecte les anomalies qualité.",
    gapPhraseByProfil: {
      FEQ: "BFA optimise votre cycle R&D, votre fabrication spécialisée et votre service après-vente.",
      DEV: "BFA accélère votre cycle de développement, votre CI/CD et votre support client.",
      INT: "BFA gère la qualité de vos livraisons, le suivi client et vos revenus récurrents.",
      DST: "BFA optimise votre chaîne logistique, vos inventaires et votre service client.",
      ORG: "BFA maximise l'impact de vos programmes et l'engagement de vos membres.",
    },
  },
  {
    code: "BHR", nom: "RH / CHRO", tier: "CORE",
    gapPhrase: "BHR transforme votre recrutement, réduit le roulement et développe une culture forte — avantage décisif en pénurie de main-d'oeuvre.",
  },
  {
    code: "BCT", nom: "Technologie / CTO", tier: "EXPAND",
    gapPhrase: "BCT Thierry évalue votre dette technique, connecte vos systèmes et planifie votre transformation digitale.",
  },
  {
    code: "BCS", nom: "Stratégie / CSO", tier: "EXPAND",
    gapPhrase: "BCS Sophie analyse votre positionnement, identifie les opportunités et simule des scénarios stratégiques.",
  },
  {
    code: "BRO", nom: "Ventes / CRO", tier: "EXPAND",
    gapPhrase: "BRO Revenue optimise votre pipeline, coache vos vendeurs et affine votre pricing — +20-40% de conversion.",
  },
  {
    code: "BIO", nom: "Innovation / CINO", tier: "FULL",
    gapPhrase: "BIO Inès surveille les technologies émergentes, évalue vos idées et protège votre PI.",
  },
  {
    code: "BLE", nom: "Juridique / CLO", tier: "FULL",
    gapPhrase: "BLE Legal analyse vos contrats, assure votre conformité Loi 25 et anticipe les risques.",
  },
  {
    code: "BSE", nom: "Sécurité / CISO", tier: "FULL",
    gapPhrase: "BSE Sécurité audite votre posture, forme vos employés et prépare votre PCA.",
  },
];

// ── Helpers taille ──

export function getTailleFromEmployes(nb: string): TailleCategorie {
  if (["< 10", "10-25"].includes(nb)) return "petite";
  if (["25-50", "50-100"].includes(nb)) return "moyenne";
  return "grande"; // 100-250, 250+
}

export function getDepartementsForTaille(taille: TailleCategorie): DepartementInfo[] {
  if (taille === "petite") return DEPARTEMENTS.filter(d => d.tier === "CORE");
  if (taille === "moyenne") return DEPARTEMENTS.filter(d => d.tier === "CORE" || d.tier === "EXPAND");
  return DEPARTEMENTS; // grande = tous
}

// ── Questions par département (48 questions) ──

export const DEPARTMENT_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  // ── D1 — Direction / CEO (BCO) — IDENTIQUE ──
  BCO: [
    {
      id: "D1.1", question: "Comment prenez-vous vos décisions stratégiques importantes?",
      options: [
        { label: "Instinct et expérience seuls", score: 0 },
        { label: "Discussion informelle avec 1-2 proches", score: 25 },
        { label: "Réunion de direction avec quelques données", score: 50 },
        { label: "Processus structuré + données + multi-perspectives", score: 75 },
        { label: "Data-driven avec scénarios simulés et comité formel", score: 100 },
      ],
    },
    {
      id: "D1.2", question: "Vos employés connaissent-ils les 3 priorités de l'entreprise cette année?",
      options: [
        { label: "Il n'y a pas de priorités documentées", score: 0 },
        { label: "La direction les connaît, pas les équipes", score: 25 },
        { label: "Communiquées 1 fois par an", score: 50 },
        { label: "Rappelées régulièrement, comprises", score: 75 },
        { label: "Cascadées en KPI par équipe, mesurées, suivies", score: 100 },
      ],
    },
    {
      id: "D1.3", question: "Quand avez-vous révisé votre plan stratégique pour la dernière fois?",
      options: [
        { label: "Pas de plan stratégique formel", score: 0 },
        { label: "Il y a 3+ ans", score: 25 },
        { label: "1-2 ans", score: 50 },
        { label: "Dans les 12 derniers mois", score: 75 },
        { label: "Vivant — révisé trimestriellement avec données", score: 100 },
      ],
    },
    {
      id: "D1.4", question: "Combien de décisions reportez-vous par mois faute de données?",
      options: [
        { label: "5+ (beaucoup, régulièrement)", score: 0 },
        { label: "3-5 par mois", score: 25 },
        { label: "1-2 par mois", score: 50 },
        { label: "Rarement", score: 75 },
        { label: "Jamais — les données sont toujours disponibles", score: 100 },
      ],
    },
  ],

  // ── D2 — Finance / CFO (BCF) — 2/4 adaptées ──
  BCF: [
    {
      id: "D2.1", question: "Comment produisez-vous vos rapports financiers mensuels?",
      options: [
        { label: "Excel / papier, compilation manuelle (15h+/semaine)", score: 0 },
        { label: "Logiciel comptable basique, quelques rapports auto", score: 25 },
        { label: "ERP avec rapports standardisés", score: 50 },
        { label: "BI + dashboards semi-automatiques", score: 75 },
        { label: "Dashboards temps réel, anomalies détectées automatiquement", score: 100 },
      ],
    },
    {
      id: "D2.2", question: "Comment gérez-vous vos prévisions de trésorerie?",
      questionByProfil: { INT: "Comment gérez-vous vos prévisions de trésorerie par projet/mandat?" },
      options: [
        { label: "Au feeling, on regarde le compte en banque", score: 0 },
        { label: "Prévision mensuelle sur Excel", score: 25 },
        { label: "Modèle trimestriel avec historique", score: 50 },
        { label: "Prévision rolling 12 mois, scénarios", score: 75 },
        { label: "Modèle prédictif, alertes automatiques, scénarios IA", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Pas de suivi par projet (une seule masse)", score: 0 },
        { label: "Suivi global par trimestre", score: 25 },
        { label: "Prévision par gros projet, estimé pour les petits", score: 50 },
        { label: "Cash flow par projet, prévision rolling", score: 75 },
        { label: "Prévision par projet + pipeline deals pondéré + scénarios", score: 100 },
      ] },
    },
    {
      id: "D2.3", question: "Connaissez-vous votre coût de revient réel par produit/service?",
      questionByProfil: { INT: "Connaissez-vous votre marge réelle par type de mandat/projet?" },
      options: [
        { label: "Non, approximation seulement", score: 0 },
        { label: "Pour les gros produits seulement", score: 25 },
        { label: "Oui mais calculé manuellement (pas toujours à jour)", score: 50 },
        { label: "Oui, dans l'ERP, mis à jour mensuellement", score: 75 },
        { label: "Temps réel, incluant tous les coûts indirects", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Non, on fait un prix et on espère que c'est bon", score: 0 },
        { label: "Approximation basée sur l'expérience", score: 25 },
        { label: "Suivi des heures mais pas des coûts indirects", score: 50 },
        { label: "Marge calculée par projet incluant overhead", score: 75 },
        { label: "Analyse temps réel par projet + benchmark + optimisation", score: 100 },
      ] },
    },
    {
      id: "D2.4", question: "Comment gérez-vous la facturation et le recouvrement?",
      options: [
        { label: "Manuel — factures Word/Excel, relances ad hoc", score: 0 },
        { label: "Logiciel facturation, relances manuelles", score: 25 },
        { label: "Automatisé partiellement (facture auto, relance manuelle)", score: 50 },
        { label: "Presque tout automatisé, rapports de vieillissement", score: 75 },
        { label: "100% automatisé, scoring client, relances IA, prédiction retard", score: 100 },
      ],
    },
  ],

  // ── D3 — Marketing / CMO (BCM) — 3/4 adaptées ──
  BCM: [
    {
      id: "D3.1", question: "Comment générez-vous vos nouveaux leads/prospects?",
      questionByProfil: { INT: "Comment trouvez-vous et qualifiez-vous vos prospects manufacturiers?" },
      options: [
        { label: "Bouche-à-oreille uniquement", score: 0 },
        { label: "Salons/événements + quelques appels à froid", score: 25 },
        { label: "Site web + quelques campagnes email", score: 50 },
        { label: "Stratégie inbound + outbound + CRM structuré", score: 75 },
        { label: "Machine de lead gen multi-canal avec scoring automatique", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Bouche-à-oreille + réseau personnel", score: 0 },
        { label: "Salons + associations + appels à froid", score: 25 },
        { label: "Site web + contenu + LinkedIn actif", score: 50 },
        { label: "Stratégie outbound + inbound + partenariats structurés", score: 75 },
        { label: "Machine de lead gen: diagnostic IA + Orbit9 + contenu + events + CRM scoring", score: 100 },
      ] },
    },
    {
      id: "D3.2", question: "Comment créez-vous votre contenu marketing?",
      questionByProfil: { INT: "Comment démontrez-vous votre expertise à vos prospects?" },
      options: [
        { label: "Pas de contenu marketing", score: 0 },
        { label: "Brochure de base, rarement mise à jour", score: 25 },
        { label: "Infolettre + réseaux sociaux occasionnels", score: 50 },
        { label: "Contenu régulier (blog, LinkedIn, email) + stratégie", score: 75 },
        { label: "IA génère le contenu, humain valide, multi-canal automatisé", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "On ne fait pas de contenu (notre travail parle)", score: 0 },
        { label: "Brochure + quelques études de cas", score: 25 },
        { label: "Blog/LinkedIn régulier + études de cas + webinaires", score: 50 },
        { label: "Stratégie thought leadership + contenu éducatif + certifications visibles", score: 75 },
        { label: "IA content + diagnostic client + données sectorielles + preuve sociale automatisée", score: 100 },
      ] },
    },
    {
      id: "D3.3", question: "Comment mesurez-vous l'efficacité de votre marketing?",
      questionByProfil: { INT: "Comment mesurez-vous votre efficacité d'acquisition client?" },
      options: [
        { label: "On ne mesure pas", score: 0 },
        { label: "Feeling basé sur le volume d'appels entrants", score: 25 },
        { label: "Quelques métriques (visites web, ouverture emails)", score: 50 },
        { label: "Dashboard marketing avec KPI structurés", score: 75 },
        { label: "Attribution complète: chaque $ de marketing lié à un $ de vente", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Pas mesuré (on sait quand le téléphone sonne ou pas)", score: 0 },
        { label: "Nombre de soumissions envoyées", score: 25 },
        { label: "CAC (coût acquisition client) + taux de conversion pipeline", score: 50 },
        { label: "Dashboard complet: CAC, LTV, close rate, cycle moyen, source attribution", score: 75 },
        { label: "IA optimise chaque étape du funnel + scoring prédictif des deals", score: 100 },
      ] },
    },
    {
      id: "D3.4", question: "Comment analysez-vous votre positionnement vs la compétition?",
      options: [
        { label: "On ne le fait pas formellement", score: 0 },
        { label: "Discussion occasionnelle (salons, clients)", score: 25 },
        { label: "Veille informelle régulière", score: 50 },
        { label: "Analyse compétitive structurée annuellement", score: 75 },
        { label: "Veille automatisée + alertes + benchmarks continus", score: 100 },
      ],
    },
  ],

  // ── D4 — Opérations / COO (BOO) — 3/4 adaptées ──
  BOO: [
    {
      id: "D4.1", question: "Comment planifiez-vous votre production/livraisons?",
      questionByProfil: { INT: "Comment planifiez-vous et coordonnez-vous vos mandats/projets clients?" },
      options: [
        { label: "Tableau blanc, expérience du planificateur", score: 0 },
        { label: "Excel avec schedule hebdomadaire", score: 25 },
        { label: "ERP/MRP basique", score: 50 },
        { label: "Planification avancée avec contraintes", score: 75 },
        { label: "Planification dynamique IA, optimisation temps réel", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Au jour le jour, selon ce qui rentre", score: 0 },
        { label: "Calendar partagé + listes de tâches", score: 25 },
        { label: "Outil de gestion de projets basique (Asana, Trello)", score: 50 },
        { label: "PPM (portfolio management) + allocation ressources + métriques", score: 75 },
        { label: "IA allocation dynamique + prédiction goulots + optimisation automatique", score: 100 },
      ] },
    },
    {
      id: "D4.2", question: "Comment gérez-vous votre chaîne d'approvisionnement?",
      questionByProfil: { INT: "Comment gérez-vous vos sous-traitants et partenaires de livraison?" },
      options: [
        { label: "Commandes réactives quand ça manque", score: 0 },
        { label: "Min/max dans un Excel ou ERP simple", score: 25 },
        { label: "MRP avec prévisions basiques", score: 50 },
        { label: "Gestion avancée multi-fournisseurs + métriques", score: 75 },
        { label: "IA prédictive, optimisation automatique, risk management", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "On fait tout nous-mêmes / ad hoc", score: 0 },
        { label: "Quelques sous-traitants fidèles, ententes informelles", score: 25 },
        { label: "Réseau de partenaires qualifiés avec ententes formelles", score: 50 },
        { label: "Écosystème de partenaires managé + SLA + évaluation performance", score: 75 },
        { label: "Orchestration IA du réseau + matching automatique + performance tracking", score: 100 },
      ] },
    },
    {
      id: "D4.3", question: "Comment mesurez-vous l'efficacité de vos opérations?",
      questionByProfil: { INT: "Comment mesurez-vous la performance de vos livraisons/projets?" },
      options: [
        { label: "Pas de mesure formelle (on livre ou on livre pas)", score: 0 },
        { label: "Quelques métriques ad hoc", score: 25 },
        { label: "KPI basiques (OTD, lead time) suivis mensuellement", score: 50 },
        { label: "TRS/OEE + KPI opérationnels + revue hebdo", score: 75 },
        { label: "Dashboard temps réel + alertes + amélioration continue data-driven", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Pas de mesure (on livre ou pas)", score: 0 },
        { label: "On-time delivery suivi informellement", score: 25 },
        { label: "KPI par projet (délai, budget, scope)", score: 50 },
        { label: "Dashboard projet complet + post-mortem systématique", score: 75 },
        { label: "Analytique IA: prédiction risques, optimisation en cours, apprentissage continu", score: 100 },
      ] },
    },
    {
      id: "D4.4", question: "Combien de temps perdez-vous par semaine en coordination inter-départements?",
      options: [
        { label: "< 2h (très fluide)", score: 20 },
        { label: "2-5h", score: 40 },
        { label: "5-10h", score: 60 },
        { label: "10-20h", score: 80 },
        { label: "20h+ (réunionite chronique)", score: 100 },
      ],
    },
  ],

  // ── D5 — Production (Manufacturier) / Livraison (Fournisseur) — 100% DIFFÉRENT ──
  BFA: [
    {
      id: "D5.1", question: "Quel est votre niveau d'automatisation sur le plancher?",
      questionByProfil: { INT: "Comment gérez-vous la qualité de livraison de vos mandats/projets?" },
      options: [
        { label: "Tout est manuel", score: 0 },
        { label: "Quelques machines CNC / équipements basiques", score: 25 },
        { label: "Lignes semi-automatisées, quelques robots", score: 50 },
        { label: "Automatisation significative, cobots, supervision humaine", score: 75 },
        { label: "Usine 4.0 — IoT, cobots, monitoring temps réel, jumeaux numériques", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Pas de processus formel (chaque projet est différent)", score: 0 },
        { label: "Checklist de base en fin de projet", score: 25 },
        { label: "Méthodologie de projet standardisée (gates, revues)", score: 50 },
        { label: "Processus qualité complet + satisfaction client mesurée", score: 75 },
        { label: "IA monitore la qualité en cours de projet + alertes prédictives", score: 100 },
      ] },
    },
    {
      id: "D5.2", question: "Comment gérez-vous la maintenance de vos équipements?",
      questionByProfil: { INT: "Comment assurez-vous la satisfaction client après livraison?" },
      options: [
        { label: "Réactif uniquement (on répare quand ça brise)", score: 0 },
        { label: "Préventif basique (calendrier de maintenance)", score: 25 },
        { label: "Préventif structuré avec historique", score: 50 },
        { label: "Prédictif (capteurs, historique, alertes)", score: 75 },
        { label: "Maintenance prescriptive IA (prédiction + recommandation automatique)", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "On livre et on passe au suivant", score: 0 },
        { label: "Appel de courtoisie post-projet", score: 25 },
        { label: "Sondage de satisfaction + suivi des enjeux", score: 50 },
        { label: "Programme de suivi structuré + métriques NPS/CSAT", score: 75 },
        { label: "Monitoring continu + maintenance préventive + renouvellement proactif", score: 100 },
      ] },
    },
    {
      id: "D5.3", question: "Comment contrôlez-vous la qualité?",
      questionByProfil: { INT: "Quel est votre taux de récurrence (clients qui reviennent)?" },
      options: [
        { label: "Inspection visuelle finale seulement", score: 0 },
        { label: "Points de contrôle manuels définis", score: 25 },
        { label: "SPC basique, quelques cartes de contrôle", score: 50 },
        { label: "Système qualité complet (ISO, SPC avancé, métriques)", score: 75 },
        { label: "IA vision, détection anomalies automatique, SPC temps réel", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "< 20% (très peu reviennent)", score: 0 },
        { label: "20-40%", score: 25 },
        { label: "40-60%", score: 50 },
        { label: "60-80%", score: 75 },
        { label: "80%+ (forte fidélisation, revenus récurrents)", score: 100 },
      ] },
    },
    {
      id: "D5.4", question: "Comment gérez-vous la santé-sécurité (SST)?",
      questionByProfil: { INT: "Comment développez-vous des revenus récurrents (ententes de service, maintenance, support)?" },
      options: [
        { label: "Le minimum légal", score: 0 },
        { label: "Comité SST + formation de base", score: 25 },
        { label: "Programme SST structuré, incidents suivis", score: 50 },
        { label: "Culture SST forte, proactif, quasi-accidents analysés", score: 75 },
        { label: "Prédictif — IA analyse les risques, ergonomie optimisée, IoT sécurité", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Pas de revenu récurrent (projet par projet)", score: 0 },
        { label: "Quelques contrats de maintenance ad hoc", score: 25 },
        { label: "Programme de service structuré, pas systématique", score: 50 },
        { label: "Modèle service récurrent proposé à chaque client", score: 75 },
        { label: "Revenu récurrent = 30%+ du CA, IA prédit les besoins clients", score: 100 },
      ] },
    },
  ],

  // ── D6 — RH / CHRO (BHR) — IDENTIQUE ──
  BHR: [
    {
      id: "D6.1", question: "Comment recrutez-vous vos employés?",
      options: [
        { label: "Bouche-à-oreille exclusivement", score: 0 },
        { label: "Jobillico/Indeed + entrevues non structurées", score: 25 },
        { label: "Processus structuré, entrevues standardisées", score: 50 },
        { label: "ATS + marque employeur + processus multi-étapes", score: 75 },
        { label: "IA screening + marque employeur forte + onboarding automatisé", score: 100 },
      ],
    },
    {
      id: "D6.2", question: "Quel est votre taux de roulement annuel?",
      options: [
        { label: "< 5% (excellent)", score: 20 },
        { label: "5-10%", score: 40 },
        { label: "10-20%", score: 60 },
        { label: "20-35%", score: 80 },
        { label: "35%+ (hémorragie)", score: 100 },
      ],
    },
    {
      id: "D6.3", question: "Comment développez-vous les compétences de vos employés?",
      options: [
        { label: "Sur le tas exclusivement", score: 0 },
        { label: "Formation occasionnelle (réaction aux besoins)", score: 25 },
        { label: "Programme de formation annuel", score: 50 },
        { label: "Parcours de développement individualisés", score: 75 },
        { label: "IA-driven: micro-learning personnalisé, suivi compétences, recommandations", score: 100 },
      ],
    },
    {
      id: "D6.4", question: "Comment mesurez-vous le climat organisationnel?",
      options: [
        { label: "Pas mesuré (on le sent)", score: 0 },
        { label: "Discussion informelle avec les superviseurs", score: 25 },
        { label: "Sondage annuel", score: 50 },
        { label: "Sondages réguliers (pulse) + actions de suivi", score: 75 },
        { label: "Mesure continue + analyse sentiment IA + actions proactives", score: 100 },
      ],
    },
  ],

  // ── D7 — Technologie / CTO (BCT) — 1/4 adaptée ──
  BCT: [
    {
      id: "D7.1", question: "Quel est votre principal système de gestion (ERP)?",
      options: [
        { label: "Pas d'ERP (papier + Excel)", score: 0 },
        { label: "Logiciel comptable seulement (Sage, Acomba)", score: 25 },
        { label: "ERP léger (QuickBooks Enterprise, Syspro Light)", score: 50 },
        { label: "ERP intermédiaire (SAP B1, NetSuite, Epicor)", score: 75 },
        { label: "ERP avancé + intégrations API + BI + automatisations", score: 100 },
      ],
    },
    {
      id: "D7.2", question: "Vos systèmes se parlent-ils entre eux?",
      options: [
        { label: "Chaque système isolé, re-saisie manuelle", score: 0 },
        { label: "Quelques exports/imports CSV manuels", score: 25 },
        { label: "1-2 intégrations automatiques", score: 50 },
        { label: "La plupart des systèmes connectés", score: 75 },
        { label: "Écosystème intégré, données circulent automatiquement", score: 100 },
      ],
    },
    {
      id: "D7.3", question: "Comment gérez-vous votre cybersécurité?",
      questionByProfil: { INT: "Comment protégez-vous les données de vos clients et votre propre infrastructure?" },
      options: [
        { label: "Pas de mesure spécifique", score: 0 },
        { label: "Antivirus + mots de passe", score: 25 },
        { label: "Backup + firewall + antivirus + mots de passe forts", score: 50 },
        { label: "Politique formelle + formation employés + MFA", score: 75 },
        { label: "Audit régulier + plan d'incident + assurance cyber + tests", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Pas de mesure spécifique", score: 0 },
        { label: "Antivirus + mots de passe + backup basique", score: 25 },
        { label: "Politique de sécurité + chiffrement + backup structuré", score: 50 },
        { label: "Conformité client (NDA, audits) + formation équipe + MFA", score: 75 },
        { label: "SOC/certification sécurité + monitoring continu + IA détection + PCA testé", score: 100 },
      ] },
    },
    {
      id: "D7.4", question: "Quel pourcentage de votre CA est investi en technologie?",
      options: [
        { label: "< 1% (le minimum vital)", score: 0 },
        { label: "1-2% (maintenance seulement)", score: 25 },
        { label: "2-4% (quelques projets d'amélioration)", score: 50 },
        { label: "4-6% (investissement stratégique)", score: 75 },
        { label: "6%+ (la techno = avantage compétitif)", score: 100 },
      ],
    },
  ],

  // ── D8 — Stratégie / CSO (BCS) — 2/4 adaptées ──
  BCS: [
    {
      id: "D8.1", question: "Avez-vous un avantage compétitif clairement identifié et communiqué?",
      questionByProfil: { INT: "Qu'est-ce qui vous différencie des autres fournisseurs/intégrateurs dans votre domaine?" },
      options: [
        { label: "Non, on compétitionne surtout par le prix", score: 0 },
        { label: "On pense que oui, mais c'est pas formalisé", score: 25 },
        { label: "Oui, identifié mais pas systématiquement communiqué", score: 50 },
        { label: "Oui, au coeur de notre positionnement et marketing", score: 75 },
        { label: "Moats multiples documentés + stratégie de renforcement", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Rien de spécifique (on compétitionne sur le prix/la relation)", score: 0 },
        { label: "Expertise technique dans un créneau", score: 25 },
        { label: "Certifications + références clients + expertise de niche", score: 50 },
        { label: "Positionnement unique + méthodologie propriétaire + preuves", score: 75 },
        { label: "Écosystème différenciant: techno + expertise + réseau + données + IA", score: 100 },
      ] },
    },
    {
      id: "D8.2", question: "Comment surveillez-vous les tendances de votre industrie?",
      options: [
        { label: "Pas de veille (on réagit quand ça arrive)", score: 0 },
        { label: "Salons annuels + bouche-à-oreille", score: 25 },
        { label: "Lecture régulière + associations sectorielles", score: 50 },
        { label: "Veille structurée + rapports trimestriels", score: 75 },
        { label: "Veille automatisée + alertes + analyse prédictive", score: 100 },
      ],
    },
    {
      id: "D8.3", question: "Quelle est votre stratégie de croissance pour les 3 prochaines années?",
      options: [
        { label: "Pas de plan (on verra)", score: 0 },
        { label: "Objectif de CA en tête, pas formalisé", score: 25 },
        { label: "Plan documenté (marchés, produits, investissements)", score: 50 },
        { label: "Plan structuré + KPI + revue régulière", score: 75 },
        { label: "Plan data-driven + scénarios + pivot agile + OKR cascadés", score: 100 },
      ],
    },
    {
      id: "D8.4", question: "Comment identifiez-vous les nouvelles opportunités de marché?",
      questionByProfil: { INT: "Comment développez-vous de nouveaux territoires ou segments de marché?" },
      options: [
        { label: "Elles viennent à nous (réactif)", score: 0 },
        { label: "Réseau de contacts + événements", score: 25 },
        { label: "Recherche occasionnelle + analyse client", score: 50 },
        { label: "Processus d'innovation structuré + R&D marché", score: 75 },
        { label: "IA scanne les opportunités + scoring automatique + pipeline", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "On attend que les leads viennent", score: 0 },
        { label: "Expansion géographique par contacts personnels", score: 25 },
        { label: "Plan de développement de marché + cibles identifiées", score: 50 },
        { label: "Stratégie multi-segment + partenariats + campagnes ciblées", score: 75 },
        { label: "IA identifie les segments + scoring opportunités + Orbit9 matching", score: 100 },
      ] },
    },
  ],

  // ── D9 — Ventes / CRO (BRO) — 3/4 adaptées ──
  BRO: [
    {
      id: "D9.1", question: "Comment suivez-vous votre pipeline de ventes?",
      questionByProfil: { INT: "Comment gérez-vous votre pipeline de mandats/projets potentiels?" },
      options: [
        { label: "Mémoire / carnet du vendeur", score: 0 },
        { label: "Excel partagé ou non", score: 25 },
        { label: "CRM basique (suivi contacts + opportunités)", score: 50 },
        { label: "CRM avancé avec pipeline stages + prévisions", score: 75 },
        { label: "CRM enrichi IA + scoring leads + prévisions prédictives", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Dans ma tête / carnet du vendeur", score: 0 },
        { label: "Excel avec les deals en cours", score: 25 },
        { label: "CRM avec stages (prospect → qualifié → proposition → closing)", score: 50 },
        { label: "CRM avancé + prévision revenue + velocity tracking", score: 75 },
        { label: "CRM IA + scoring deals + prédiction win rate + coaching automatique", score: 100 },
      ] },
    },
    {
      id: "D9.2", question: "Quel est votre cycle de vente moyen?",
      questionByProfil: { INT: "Quel est votre cycle de vente moyen et combien de décideurs sont impliqués?" },
      options: [
        { label: "< 1 semaine (transactionnel)", score: 20 },
        { label: "1-4 semaines", score: 40 },
        { label: "1-3 mois", score: 60 },
        { label: "3-6 mois", score: 80 },
        { label: "6+ mois (complexe, multi-décideurs)", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "< 1 mois, 1 décideur", score: 20 },
        { label: "1-3 mois, 2-3 décideurs", score: 40 },
        { label: "3-6 mois, 3-5 décideurs", score: 60 },
        { label: "6-12 mois, comité formel", score: 80 },
        { label: "12+ mois, multi-stakeholders, RFP complexes", score: 100 },
      ] },
    },
    {
      id: "D9.3", question: "Comment mesurez-vous la performance de vos vendeurs?",
      questionByProfil: { INT: "Comment gérez-vous la relation client du premier contact jusqu'à l'après-vente?" },
      options: [
        { label: "Chiffre de ventes global seulement", score: 0 },
        { label: "CA par vendeur, pas plus", score: 25 },
        { label: "KPI basiques (appels, rencontres, soumissions, close rate)", score: 50 },
        { label: "Dashboard complet + coaching basé sur les données", score: 75 },
        { label: "IA analyse les patterns de succès + recommandations personnalisées", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "Chaque vendeur gère sa relation seul", score: 0 },
        { label: "Notes dans un CRM, pas de processus", score: 25 },
        { label: "Processus de vente standardisé + CRM structuré", score: 50 },
        { label: "Customer journey documenté + handoff vente→livraison + revue", score: 75 },
        { label: "Orchestration complète IA: nurturing auto, scoring, handoff, satisfaction", score: 100 },
      ] },
    },
    {
      id: "D9.4", question: "Comment fixez-vous vos prix?",
      options: [
        { label: "Coût + marge fixe (cost-plus)", score: 0 },
        { label: "Coût + marge ajustée par feeling", score: 25 },
        { label: "Pricing par segment / par produit", score: 50 },
        { label: "Analyse compétitive + valeur perçue", score: 75 },
        { label: "Pricing dynamique / IA recommande optimal par deal", score: 100 },
      ],
    },
  ],

  // ── D10 — Innovation / CINO (BIO) — 2/4 adaptées ──
  BIO: [
    {
      id: "D10.1", question: "Quel pourcentage de votre CA vient de produits/services lancés dans les 3 dernières années?",
      questionByProfil: { INT: "Quel pourcentage de votre CA vient de nouvelles offres/services lancés dans les 3 dernières années?" },
      options: [
        { label: "0% (aucun nouveau produit)", score: 0 },
        { label: "1-5%", score: 25 },
        { label: "5-15%", score: 50 },
        { label: "15-30%", score: 75 },
        { label: "30%+ (culture d'innovation forte)", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "0% (même offre depuis longtemps)", score: 0 },
        { label: "1-10%", score: 25 },
        { label: "10-25%", score: 50 },
        { label: "25-40%", score: 75 },
        { label: "40%+ (innovation constante dans l'offre)", score: 100 },
      ] },
    },
    {
      id: "D10.2", question: "Quand avez-vous évalué une nouvelle technologie pour votre entreprise?",
      options: [
        { label: "On n'y pense pas", score: 0 },
        { label: "Il y a 2+ ans", score: 25 },
        { label: "Dans les 12 derniers mois", score: 50 },
        { label: "Dans les 6 derniers mois", score: 75 },
        { label: "Veille continue, POC réguliers, budget innovation dédié", score: 100 },
      ],
    },
    {
      id: "D10.3", question: "Avez-vous un processus formel pour capter et évaluer les idées?",
      questionByProfil: { INT: "Comment développez-vous de nouvelles offres basées sur les besoins de vos clients?" },
      options: [
        { label: "Non", score: 0 },
        { label: "Boîte à suggestions informelle", score: 25 },
        { label: "Processus de soumission d'idées documenté", score: 50 },
        { label: "Comité innovation + pipeline d'idées + évaluation", score: 75 },
        { label: "Pipeline d'innovation IA-assisté + scoring + prototypage rapide", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "On réagit quand un client demande quelque chose de nouveau", score: 0 },
        { label: "Veille informelle sur les besoins clients", score: 25 },
        { label: "Feedback clients structuré + revue d'offre annuelle", score: 50 },
        { label: "Pipeline d'innovation: besoins clients → évaluation → développement → lancement", score: 75 },
        { label: "IA analyse les patterns de besoins + développement proactif + test marché", score: 100 },
      ] },
    },
    {
      id: "D10.4", question: "Comment protégez-vous votre propriété intellectuelle?",
      options: [
        { label: "Aucune protection formelle", score: 0 },
        { label: "NDA avec employés/partenaires", score: 25 },
        { label: "Quelques brevets ou marques déposées", score: 50 },
        { label: "Stratégie PI structurée + brevets actifs", score: 75 },
        { label: "Portefeuille PI + veille brevets IA + stratégie de valorisation", score: 100 },
      ],
    },
  ],

  // ── D11 — Juridique / CLO (BLE) — IDENTIQUE ──
  BLE: [
    {
      id: "D11.1", question: "Comment gérez-vous vos contrats (clients, fournisseurs, employés)?",
      options: [
        { label: "Pas de contrats formels / poignée de main", score: 0 },
        { label: "Modèles de base, pas toujours utilisés", score: 25 },
        { label: "Contrats standardisés, révision ponctuelle par avocat", score: 50 },
        { label: "Gestion contractuelle structurée, suivi des échéances", score: 75 },
        { label: "CLM (Contract Lifecycle Management) + IA analyse des clauses", score: 100 },
      ],
    },
    {
      id: "D11.2", question: "Êtes-vous conforme aux réglementations de votre industrie?",
      options: [
        { label: "Pas certain / on s'en occupe quand on se fait auditer", score: 0 },
        { label: "Le minimum pour opérer (licences, permis)", score: 25 },
        { label: "Conformité suivie mais manuellement", score: 50 },
        { label: "Programme de conformité structuré avec responsable", score: 75 },
        { label: "Monitoring automatisé + alertes + formation continue", score: 100 },
      ],
    },
    {
      id: "D11.3", question: "Comment protégez-vous les données personnelles (Loi 25)?",
      options: [
        { label: "On n'a rien fait", score: 0 },
        { label: "On sait qu'il faut faire quelque chose", score: 25 },
        { label: "Politique de confidentialité sur le site", score: 50 },
        { label: "Programme complet (inventaire données, consentements, processus)", score: 75 },
        { label: "Privacy by design + DPO + monitoring IA", score: 100 },
      ],
    },
    {
      id: "D11.4", question: "Comment gérez-vous les risques légaux (litiges, responsabilité)?",
      options: [
        { label: "On y pense quand ça arrive", score: 0 },
        { label: "Avocat en retainer pour les urgences", score: 25 },
        { label: "Revue légale annuelle", score: 50 },
        { label: "Matrice de risques + assurances adaptées + prévention", score: 75 },
        { label: "Analyse prédictive des risques + stratégie proactive", score: 100 },
      ],
    },
  ],

  // ── D12 — Sécurité / CISO (BSE) — 1/4 adaptée ──
  BSE: [
    {
      id: "D12.1", question: "Avez-vous un plan de continuité des affaires (PCA) si vos systèmes tombent?",
      options: [
        { label: "Non", score: 0 },
        { label: "On a des backups quelque part", score: 25 },
        { label: "Backup structuré + procédure de restoration documentée", score: 50 },
        { label: "PCA complet testé annuellement", score: 75 },
        { label: "PCA + DRP + tests réguliers + RTO/RPO définis et validés", score: 100 },
      ],
    },
    {
      id: "D12.2", question: "Vos employés sont-ils formés aux risques de cybersécurité?",
      options: [
        { label: "Non", score: 0 },
        { label: "Rappel occasionnel (ne pas cliquer sur les liens)", score: 25 },
        { label: "Formation annuelle obligatoire", score: 50 },
        { label: "Formation régulière + simulations de phishing", score: 75 },
        { label: "Programme continu + tests + scoring par employé + IA détection", score: 100 },
      ],
    },
    {
      id: "D12.3", question: "Comment contrôlez-vous les accès à vos systèmes et données?",
      options: [
        { label: "Mêmes mots de passe pour tous / pas de contrôle", score: 0 },
        { label: "Mots de passe individuels", score: 25 },
        { label: "Mots de passe forts + rôles basiques", score: 50 },
        { label: "MFA + RBAC + logs d'accès", score: 75 },
        { label: "Zero trust + SIEM + IA détection anomalies", score: 100 },
      ],
    },
    {
      id: "D12.4", question: "Avez-vous déjà subi un incident de cybersécurité?",
      questionByProfil: { INT: "Comment répondez-vous aux exigences de cybersécurité de vos clients?" },
      options: [
        { label: "Non (ou pas à ma connaissance)", score: 50 },
        { label: "Oui, mineur (spam, tentative phishing)", score: 50 },
        { label: "Oui, modéré (virus, downtime court)", score: 75 },
        { label: "Oui, majeur (ransomware, fuite de données)", score: 100 },
        { label: "Oui, et on n'a pas de plan pour la prochaine fois", score: 100 },
      ],
      optionsByProfil: { INT: [
        { label: "On ne nous a jamais posé la question", score: 0 },
        { label: "On signe les NDA et on espère", score: 25 },
        { label: "Politique de sécurité documentée fournie aux clients", score: 50 },
        { label: "Processus formel: audit régulier + conformité + rapport", score: 75 },
        { label: "Certification (ISO 27001, SOC2) + monitoring + IA + assurance cyber", score: 100 },
      ] },
    },
  ],
};

// ── Section F — Capacité d'Absorption (6 questions, toutes tailles) ──

export const ABSORPTION_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "F.1", question: "Le dirigeant est-il personnellement convaincu de l'importance de l'IA?",
    options: [
      { label: "Sceptique", score: 0 },
      { label: "Curieux", score: 25 },
      { label: "Convaincu mais perdu", score: 50 },
      { label: "Engagé, cherche les solutions", score: 75 },
      { label: "Champion IA", score: 100 },
    ],
  },
  {
    id: "F.2", question: "Y a-t-il quelqu'un dans l'entreprise qui pourrait porter un projet IA?",
    options: [
      { label: "Personne", score: 0 },
      { label: "1 personne intéressée", score: 25 },
      { label: "1 personne capable", score: 50 },
      { label: "Petit comité", score: 75 },
      { label: "Équipe dédiée", score: 100 },
    ],
  },
  {
    id: "F.3", question: "Comment votre équipe réagit aux changements technologiques?",
    options: [
      { label: "Forte résistance", score: 0 },
      { label: "Résistance modérée", score: 25 },
      { label: "Acceptation passive", score: 50 },
      { label: "Ouverture", score: 75 },
      { label: "Enthousiasme", score: 100 },
    ],
  },
  {
    id: "F.4", question: "Votre entreprise est-elle syndiquée?",
    options: [
      { label: "Non", score: 50 },
      { label: "Oui, climat constructif", score: 50 },
      { label: "Oui, climat tendu", score: 25 },
    ],
  },
  {
    id: "F.5", question: "Quel budget mensuel seriez-vous prêt à investir dans un outil IA de gestion?",
    options: [
      { label: "0$", score: 0 },
      { label: "< 200$", score: 25 },
      { label: "200-500$", score: 50 },
      { label: "500-2000$", score: 75 },
      { label: "2000$+", score: 100 },
    ],
  },
  {
    id: "F.6", question: "Combien de temps votre direction pourrait consacrer par semaine à l'adoption IA?",
    options: [
      { label: "0h", score: 0 },
      { label: "1-2h", score: 25 },
      { label: "3-5h", score: 50 },
      { label: "5-10h", score: 75 },
      { label: "Priorité stratégique, temps protégé", score: 100 },
    ],
  },
];

// ── Section Bonus Approche Client (supply-side types: FEQ, DEV, INT, DST) ──

export const APPROCHE_CLIENT_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "BF.1", question: "Comment qualifiez-vous vos prospects avant de les approcher?",
    options: [
      { label: "Pas de qualification (on approche tout le monde)", score: 0 },
      { label: "Recherche Google/LinkedIn basique", score: 25 },
      { label: "Critères définis (taille, secteur, budget) + recherche", score: 50 },
      { label: "Scoring prospects + données financières + contexte sectoriel", score: 75 },
      { label: "IA scoring + Orbit9 matching + diagnostic pré-approche", score: 100 },
    ],
  },
  {
    id: "BF.2", question: "Quand vous arrivez chez un prospect, comment ouvrez-vous la conversation?",
    options: [
      { label: "Présentation de notre entreprise (features/specs)", score: 0 },
      { label: "Questions ouvertes sur leurs besoins", score: 25 },
      { label: "Analyse préliminaire de leur situation + questions ciblées", score: 50 },
      { label: "Outil de diagnostic + données sectorielles + insights", score: 75 },
      { label: "Diagnostic IA Usine Bleue + données + plan personnalisé", score: 100 },
    ],
  },
  {
    id: "BF.3", question: "Comment démontrez-vous la valeur de votre solution vs juste son prix?",
    options: [
      { label: "Soumission de prix uniquement", score: 0 },
      { label: "Soumission + quelques avantages listés", score: 25 },
      { label: "Business case avec ROI estimé", score: 50 },
      { label: "Business case data-driven + études de cas similaires", score: 75 },
      { label: "Simulation IA du ROI personnalisé + benchmark sectoriel + preuves", score: 100 },
    ],
  },
  {
    id: "BF.4", question: "Comment maintenez-vous la relation avec les prospects qui ne sont pas encore prêts?",
    options: [
      { label: "On les oublie et on passe au suivant", score: 0 },
      { label: "Relance téléphonique occasionnelle", score: 25 },
      { label: "Email de suivi + infolettre", score: 50 },
      { label: "Programme de nurturing structuré + contenu de valeur", score: 75 },
      { label: "Nurturing IA automatisé + re-diagnostic périodique + alertes d'opportunité", score: 100 },
    ],
  },
];

// ── SEI Weights ──

export const SEI_WEIGHTS: Record<string, { depts: string[]; weight: number; label: string }> = {
  finance:    { depts: ["BCF"], weight: 0.20, label: "Finance" },
  ventes:     { depts: ["BCM", "BRO"], weight: 0.20, label: "Ventes & Marketing" },
  operations: { depts: ["BOO", "BFA"], weight: 0.20, label: "Opérations" },
  strategie:  { depts: ["BCO", "BCS"], weight: 0.15, label: "Stratégie" },
  innovation: { depts: ["BCT", "BIO"], weight: 0.15, label: "Innovation & Techno" },
  rh:         { depts: ["BHR"], weight: 0.10, label: "Ressources Humaines" },
};

// ── Niveaux DIA ──

export const NIVEAUX_DIA: { min: number; max: number; label: string; color: string; description: string }[] = [
  { min: 0, max: 20, label: "DORMEUR", color: "#ef4444", description: "Fondations digitales à construire d'abord" },
  { min: 20, max: 40, label: "ÉVEILLÉ", color: "#f97316", description: "Gains rapides possibles dans 2-3 départements" },
  { min: 40, max: 60, label: "PRÊT", color: "#eab308", description: "L'entreprise est prête, le gap = opportunité" },
  { min: 60, max: 80, label: "ACCÉLÉRÉ", color: "#22c55e", description: "CarlOS est un accélérateur immédiat" },
  { min: 80, max: 100, label: "PIONNIER", color: "#3b82f6", description: "En avance, CarlOS maintient l'avantage" },
];

// ── Helpers ──

export function getQuestionText(q: DiagnosticQuestion, profil: ProfilType): string {
  if (q.questionByProfil?.[profil]) return q.questionByProfil[profil]!;
  return q.question;
}

export function getQuestionOptions(q: DiagnosticQuestion, profil: ProfilType): QuestionOption[] {
  if (q.optionsByProfil?.[profil]) return q.optionsByProfil[profil]!;
  return q.options;
}

export function getNiveau(score: number): typeof NIVEAUX_DIA[number] {
  return NIVEAUX_DIA.find(n => score >= n.min && score < n.max) || NIVEAUX_DIA[NIVEAUX_DIA.length - 1];
}

export function getDepartementNom(dept: DepartementInfo, profil: ProfilType): string {
  if (dept.nomByProfil?.[profil]) return dept.nomByProfil[profil]!;
  return dept.nom;
}

export function getDepartementGapPhrase(dept: DepartementInfo, profil: ProfilType): string {
  if (dept.gapPhraseByProfil?.[profil]) return dept.gapPhraseByProfil[profil]!;
  return dept.gapPhrase;
}

export function isSupplySideType(profil: ProfilType): boolean {
  return SUPPLY_SIDE_TYPES.includes(profil);
}

export const NB_EMPLOYES_OPTIONS = ["< 10", "10-25", "25-50", "50-100", "100-250", "250+"];
export const CA_OPTIONS = ["< 1M$", "1-5M$", "5-15M$", "15-50M$", "50M$+"];
export const DEFI_OPTIONS = ["Croissance", "Rentabilité", "Talent", "Technologie", "Compétition", "Conformité", "Autre"];
