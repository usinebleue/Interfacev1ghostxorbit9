/**
 * debat-data.ts — Donnees de simulation Mode Debat
 * Sujet : "ERP integre a 200K$ ou continuer avec nos outils separes?"
 * CFO vs CRO — 3 rounds + verdict CEO
 * Sprint A — Frame Master V2
 */

import {
  Scan,
  Database,
  Brain,
  BookOpen,
  Shield,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Scale,
} from "lucide-react";

export const DEBAT_DATA = {
  titre: "ERP integre a 200K$ ou continuer avec nos outils separes?",
  contexte: "PME manufacturiere de 45 employes, 12M$ de CA. Utilise actuellement 6 outils distincts (comptabilite, CRM, inventaire, production, RH, facturation). Le directeur general hesite entre investir 200K$ dans un ERP integre ou optimiser les outils existants.",

  userTension: "On perd un temps fou a transferer les donnees entre nos 6 systemes. Mon equipe comptable passe 2 jours par mois juste a reconcilier. Mais 200K$ pour un ERP, c'est 2% de notre CA — c'est enorme. Est-ce qu'on devrait investir ou optimiser ce qu'on a?",

  ceoIntro: "Question classique en manufacturier — et la reponse n'est pas binaire. Je vais mettre mon CFO et mon CRO face a face. Le CFO va defendre le statu quo optimise, le CRO va pousser pour l'ERP. 3 rounds, puis je tranche.",

  ceoThinking: [
    { icon: Scan, text: "Analyse de la situation financiere..." },
    { icon: Database, text: "Verification des benchmarks ERP manufacturier..." },
    { icon: Brain, text: "Preparation du debat structure..." },
    { icon: BookOpen, text: "Briefing des debatteurs..." },
  ],

  // === ROUND 1 — Argument financier ===
  round1: {
    theme: "Impact financier",
    icon: DollarSign,
    pour: {
      code: "BRO",
      position: "POUR l'ERP",
      argument: "Les 2 jours de reconciliation par mois = 24 jours/an = 48K$ en salaires gaspilles. Ajoutez les erreurs de saisie (estimees a 2-3% du CA = 240-360K$), les retards de facturation (DSO +12 jours = 40K$ en cout de tresorerie), et la perte de visibilite sur les marges reelles. Le cout REEL du statu quo est de 328-448K$/an. L'ERP a 200K$ se rembourse en 6-8 mois.",
      sources: [
        { type: "stat" as const, label: "Benchmark ERP PME — Panorama Consulting 2025" },
        { type: "data" as const, label: "Cout moyen erreur saisie — Aberdeen Group" },
      ],
    },
    contre: {
      code: "BCF",
      position: "CONTRE l'ERP",
      argument: "Le chiffre de 200K$ est un mirage. L'implementation reelle coute 2.5x a 4x le prix du logiciel. Formation, migration, personnalisation, productivite perdue pendant 6-12 mois = budget reel de 500-800K$. Et 67% des implementations ERP depassent le budget initial. Avec 200K$, on peut automatiser les transferts entre systemes existants (Zapier Enterprise + API customs) pour 35K$ et recuperer 80% des gains sans le risque.",
      sources: [
        { type: "stat" as const, label: "ERP Failure Rate — Gartner 2025 (67% over budget)" },
        { type: "doc" as const, label: "Cout total ERP — Panorama Consulting Group" },
        { type: "data" as const, label: "ROI integration vs ERP — Nucleus Research" },
      ],
    },
  },

  // === ROUND 2 — Risque operationnel ===
  round2: {
    theme: "Risque operationnel",
    icon: AlertTriangle,
    pour: {
      code: "BRO",
      position: "POUR l'ERP",
      argument: "Le vrai risque, c'est de NE PAS agir. Avec 6 systemes disconnectes, vous n'avez aucune vue en temps reel sur vos couts de production. Votre marge reelle par produit? Inconnue. Votre cout reel par commande? Estime au doigt mouille. Vos concurrents avec un ERP voient tout ca en 1 clic. Dans 2 ans, sans ERP, vous perdrez des contrats parce que vous ne pourrez pas soumissionner assez vite avec des marges precises.",
      sources: [
        { type: "stat" as const, label: "Visibilite production — McKinsey Manufact. 2024" },
        { type: "doc" as const, label: "Competitivite PME — STIQ Rapport 2025" },
      ],
    },
    contre: {
      code: "BCF",
      position: "CONTRE l'ERP",
      argument: "Parlons du risque de l'ERP lui-meme. Implementation = 6-18 mois de chaos. 44% des entreprises rapportent des perturbations operationnelles majeures pendant la migration. Avec 45 employes, vous n'avez pas le buffer pour absorber ca. Un seul mois de production perturbee = 1M$ de CA a risque. Et si l'ERP ne s'adapte pas a vos processus? Vous devrez changer VOS processus pour le logiciel — pas l'inverse.",
      sources: [
        { type: "stat" as const, label: "Disruption pendant ERP — Deloitte 2024 (44%)" },
        { type: "data" as const, label: "Cout arret production PME manufact." },
      ],
    },
  },

  // === ROUND 3 — Vision strategique ===
  round3: {
    theme: "Vision strategique a 3 ans",
    icon: TrendingUp,
    pour: {
      code: "BRO",
      position: "POUR l'ERP",
      argument: "Dans 3 ans, vous visez 20M$ de CA (+67%). Comment gerer cette croissance avec 6 systemes? Chaque nouvel employe devra apprendre 6 outils. Chaque nouveau client ajoute de la complexite dans 6 bases de donnees. L'ERP est un investissement d'infrastructure — comme une usine. On ne construit pas une usine pour aujourd'hui, on la construit pour dans 5 ans. Le bon moment pour implanter un ERP, c'est AVANT d'en avoir desesperement besoin.",
      sources: [
        { type: "doc" as const, label: "Scalabilite PME — Harvard Business Review" },
        { type: "stat" as const, label: "Growth vs IT Infrastructure — Forrester 2025" },
      ],
    },
    contre: {
      code: "BCF",
      position: "CONTRE l'ERP",
      argument: "L'argument 'construire pour le futur' est seduisant mais dangereux. En 3 ans, les solutions cloud et IA auront completement change le paysage. Un ERP installe aujourd'hui sera obsolete en 2029. Ma recommandation : investir 50K$ dans des integrations API robustes MAINTENANT, garder la flexibilite, et reevaluer dans 18 mois quand les ERP cloud-native IA seront matures. La meilleure decision n'est pas toujours 'oui' ou 'non' — c'est parfois 'pas maintenant'.",
      sources: [
        { type: "stat" as const, label: "Cloud ERP Market — IDC 2025 (croissance 28%/an)" },
        { type: "doc" as const, label: "Wait vs Act — Decision Framework (MIT Sloan)" },
      ],
    },
  },

  // === VERDICT CEO ===
  verdictThinking: [
    { icon: Scale, text: "Evaluation des arguments..." },
    { icon: Brain, text: "Ponderation des risques vs gains..." },
    { icon: Shield, text: "Verification des donnees..." },
    { icon: BookOpen, text: "Formulation du verdict..." },
  ],

  verdict: {
    winner: "CFO (position moderee)",
    recommendation: "Le CFO a raison sur le timing — PAS maintenant, mais PAS jamais non plus. Le CRO a raison sur le probleme — le statu quo coute cher.",
    plan: [
      "Phase 1 (0-3 mois) : Investir 45K$ dans des integrations API + Zapier Enterprise entre les 6 systemes. Objectif : eliminer 80% de la reconciliation manuelle.",
      "Phase 2 (3-6 mois) : Deployer un tableau de bord unifie (Power BI ou Metabase) qui agrege les donnees des 6 systemes. Cout : 15K$. Objectif : visibilite temps reel sans ERP.",
      "Phase 3 (12-18 mois) : Reevaluer. Si le CA atteint 15M$+, lancer un appel d'offres ERP cloud-native (SAP Business One Cloud, Odoo Enterprise, ou NetSuite). Budget prevu : 150-250K$ tout inclus.",
    ],
    conclusion: "Ne brule pas 200K$ aujourd'hui pour un probleme qui se regle a 80% avec 60K$. Garde ta poudre seche pour le bon moment — et quand tu investiras, ce sera dans une solution cloud-native, pas un ERP legacy.",
  },
};
