/**
 * cahier-smart-data.ts — Donnees de simulation Cahier SMART en 3 Actes
 * Entreprise fictive : Aliments Boreal inc. (manufacturier alimentaire, Saguenay, 85 employes)
 * Probleme : Efficacite energetique + Palettisation fin de ligne + Automatisation/IoT
 * Sprint A — Frame Master V2
 */

import {
  Scan,
  Database,
  Gauge,
  BookOpen,
  AlertTriangle,
  Cog,
  Brain,
  Target,
  Network,
  Zap,
  FileText,
  Building2,
  Calendar,
  Wrench,
  DollarSign,
  ClipboardCheck,
  Award,
  Shield,
  Users,
  BarChart3,
  Cpu,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";

// ========== BOT C-LEVEL COLORS ==========

export const BOT_COLORS: Record<string, {
  bg: string; bgLight: string; text: string; border: string;
  ring: string; dot: string; emoji: string; name: string; role: string;
  avatar: string;
}> = {
  BCO: { bg: "bg-blue-600", bgLight: "bg-blue-50", text: "text-blue-700", border: "border-blue-400", ring: "ring-blue-300", dot: "bg-blue-500", emoji: "\u{1F454}", name: "CarlOS", role: "CEO", avatar: "/agents/ceo-carlos.png" },
  BCT: { bg: "bg-violet-600", bgLight: "bg-violet-50", text: "text-violet-700", border: "border-violet-400", ring: "ring-violet-300", dot: "bg-violet-500", emoji: "\u{1F4BB}", name: "Thomas", role: "CTO", avatar: "/agents/cto-thomas.png" },
  BCF: { bg: "bg-emerald-600", bgLight: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-400", ring: "ring-emerald-300", dot: "bg-emerald-500", emoji: "\u{1F4B0}", name: "Francois", role: "CFO", avatar: "/agents/cfo-francois.png" },
  BCM: { bg: "bg-pink-600", bgLight: "bg-pink-50", text: "text-pink-700", border: "border-pink-400", ring: "ring-pink-300", dot: "bg-pink-500", emoji: "\u{1F4E3}", name: "Sofia", role: "CMO", avatar: "/agents/cmo-sofia.png" },
  BCS: { bg: "bg-red-600", bgLight: "bg-red-50", text: "text-red-700", border: "border-red-400", ring: "ring-red-300", dot: "bg-red-500", emoji: "\u{1F3AF}", name: "Marc", role: "CSO", avatar: "/agents/cso-marc.png" },
  BOO: { bg: "bg-orange-600", bgLight: "bg-orange-50", text: "text-orange-700", border: "border-orange-400", ring: "ring-orange-300", dot: "bg-orange-500", emoji: "\u{2699}\u{FE0F}", name: "Lise", role: "COO", avatar: "/agents/coo-lise.png" },
  BFA: { bg: "bg-slate-600", bgLight: "bg-slate-50", text: "text-slate-700", border: "border-slate-400", ring: "ring-slate-300", dot: "bg-slate-500", emoji: "\u{1F3ED}", name: "FactoryBot", role: "Factory", avatar: "" },
  BHR: { bg: "bg-teal-600", bgLight: "bg-teal-50", text: "text-teal-700", border: "border-teal-400", ring: "ring-teal-300", dot: "bg-teal-500", emoji: "\u{1F91D}", name: "David", role: "CHRO", avatar: "/agents/David - CHRO.png" },
  BIO: { bg: "bg-cyan-600", bgLight: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-400", ring: "ring-cyan-300", dot: "bg-cyan-500", emoji: "\u{1F4CA}", name: "Helene", role: "CIO", avatar: "/agents/Helene - CIO.png" },
  BCC: { bg: "bg-rose-600", bgLight: "bg-rose-50", text: "text-rose-700", border: "border-rose-400", ring: "ring-rose-300", dot: "bg-rose-500", emoji: "\u{1F4E2}", name: "Emilie", role: "CCO", avatar: "/agents/CCO - Emilie2.png" },
  BPO: { bg: "bg-fuchsia-600", bgLight: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-400", ring: "ring-fuchsia-300", dot: "bg-fuchsia-500", emoji: "\u{1F680}", name: "Alex", role: "CPO", avatar: "/agents/CPO - Alex2.png" },
  BRO: { bg: "bg-amber-600", bgLight: "bg-amber-50", text: "text-amber-700", border: "border-amber-400", ring: "ring-amber-300", dot: "bg-amber-500", emoji: "\u{1F4C8}", name: "Julien", role: "CRO", avatar: "/agents/CRO - Julien2.png" },
  BLE: { bg: "bg-indigo-600", bgLight: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-400", ring: "ring-indigo-300", dot: "bg-indigo-500", emoji: "\u{2696}\u{FE0F}", name: "Isabelle", role: "Legal", avatar: "/agents/CLO - Isabelle3.png" },
  BSE: { bg: "bg-zinc-700", bgLight: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-400", ring: "ring-zinc-300", dot: "bg-zinc-500", emoji: "\u{1F6E1}\u{FE0F}", name: "SecBot", role: "CISO", avatar: "" },
};

export const USER_AVATAR = "/agents/carl-fugere.jpg";

// ========== ACTE 1 — La Tension de Depart ==========

export const SIM_ACTE1 = {
  userTension: "On est un manufacturier alimentaire au Saguenay, 85 employes. On a 3 gros problemes : nos systemes energetiques sont vetustes — compresseurs, refrigeration, chauffage — nos couts Hydro-Quebec ont augmente de 40% en 2 ans. En plus, notre fin de ligne est 100% manuelle — la palettisation se fait a la main, c'est un goulot constant, et on a des blessures recurrentes. Et on n'a aucune automatisation, aucun monitoring, zero donnees temps reel. On sait qu'il y a des programmes de subventions mais on ne sait pas par ou commencer.",

  ceoThinking: [
    { icon: Scan, text: "Analyse du contexte manufacturier..." },
    { icon: Database, text: "Verification profil energetique..." },
    { icon: Gauge, text: "Evaluation des systemes critiques..." },
    { icon: BookOpen, text: "Formulation du diagnostic preliminaire..." },
  ],

  ceoResponse: "Je comprends ta situation — c'est un cas classique en manufacturier alimentaire au Quebec. T'as 3 axes qui se chevauchent : energie, palettisation et automatisation. Avant de mobiliser mes specialistes, j'ai besoin de preciser le portrait.",

  ceoQuestion1: "Tes lignes de production, c'est quoi exactement? Combien de SKUs? Et la fin de ligne, c'est 100% manuel ou t'as deja du semi-auto?",

  userAnswer1: "On a 4 lignes de production, 45 SKUs. La fin de ligne est 100% manuelle — 6 employes font la palettisation a la main, c'est eux qui ont des blessures recurrentes au dos et aux epaules. On perd environ 15% de notre throughput a cause de ce goulot-la. Aucun robot, aucun capteur, rien.",

  ceoQuestion2: "Et cote budget/priorites — si tu devais choisir entre regler l'energie en premier ou automatiser la fin de ligne, tu irais ou? T'as un budget global en tete?",

  userAnswer2: "Honnetement, les deux sont urgents. L'energie nous coute une fortune et la palettisation manuelle c'est un risque SST constant. Budget : on pourrait aller 800K a 1.2M si on a les subventions. La priorite c'est ce qui genere le plus de ROI vite.",

  consultBots: [
    { emoji: "\u{1F4B0}", name: "CFO", code: "BCF" },
    { emoji: "\u{2699}\u{FE0F}", name: "COO", code: "BOO" },
    { emoji: "\u{1F4BB}", name: "CTO", code: "BCT" },
  ],

  perspectives: [
    {
      emoji: "\u{1F4B0}", code: "BCF", name: "CFO", angle: "Programmes, subventions et financement",
      text: "J'ai identifie plusieurs programmes combinables :\n\n1) Hydro-Quebec — EnerGuide (50% audit) + systemes industriels (0.10$/kWh) + optimisation energetique (75% couts admissibles) = potentiel 510K$\n2) Programme STIQ/MESI pour automatisation manufacturiere — jusqu'a 40% des couts d'equipement robotique\n3) Credit d'impot RS&DE potentiel sur l'integration IoT/maintenance predictive\n\nAvec 800K-1.2M de budget et ces programmes combines, le net pourrait descendre a 400-500K$. Ratio subventions exceptionnel.",
      verdict: "510K$ HQ + 40% STIQ sur robotique", color: "green",
      sources: [
        { type: "doc" as const, label: "Programme EnerGuide — Hydro-Quebec 2026" },
        { type: "doc" as const, label: "HQ — Aide financiere systemes industriels" },
        { type: "doc" as const, label: "Programme STIQ — Automatisation manufacturiere" },
        { type: "stat" as const, label: "Credit RS&DE — Integration IoT industriel" },
      ],
    },
    {
      emoji: "\u{2699}\u{FE0F}", code: "BOO", name: "COO", angle: "Plan operationnel en 4 phases",
      text: "J'ai modele un plan d'implantation en 4 phases qui ne touche jamais a la production :\n\nPhase 1 (sem. 1-4) : Depot dossiers HQ + STIQ + Audit detaille\nPhase 2 (sem. 5-12) : Remplacement systeme refrigeration CO2 transcritique + chaudieres condensation\nPhase 3 (sem. 11-16) : Robot palettiseur collaboratif (cobot) fin de ligne — elimine le goulot de 15%\nPhase 4 (sem. 14-20) : HVAC intelligent + capteurs IoT + monitoring temps reel\n\nElimination du goulot fin de ligne = +15% throughput immediat. Risque d'arret production : 0%.",
      verdict: "+15% throughput + 0% arret production", color: "green",
      sources: [
        { type: "data" as const, label: "Calendrier production Aliments Boreal 2026" },
        { type: "stat" as const, label: "Benchmark palettisation robotisee — CEFRIO" },
        { type: "doc" as const, label: "Guide cobot alimentaire — Universal Robots" },
      ],
    },
    {
      emoji: "\u{1F4BB}", code: "BCT", name: "CTO", angle: "Technologies recommandees — 3 axes",
      text: "3 axes technologiques a combiner :\n\n1) Energie : VFD sur moteurs 15HP+, conversion refrigeration CO2 transcritique, chaudieres condensation 95%+ — reduction 35-55% par systeme\n2) Palettisation : Robot collaboratif (cobot) palettiseur — Universal Robots UR10e ou FANUC CRX-25iA — cadence 8-12 palettes/heure, elimine 100% du risque SST\n3) IoT/Monitoring : 48+ capteurs temps reel, tableau de bord, maintenance predictive par analyse vibratoire — detecte defaillances 3 semaines avant panne\n\nROI technique combine : 20-24 mois. Technologies eprouvees, zero risque experimental.",
      verdict: "ROI 20-24 mois — 3 axes techno eprouves", color: "green",
      sources: [
        { type: "doc" as const, label: "Specs cobot UR10e — Universal Robots 2025" },
        { type: "doc" as const, label: "Conversion CO2 transcritique — Carnot Refrig." },
        { type: "stat" as const, label: "Etude ROI capteurs IoT manufact. — McKinsey 2025" },
      ],
    },
  ],

  syntheseThinking: [
    { icon: Network, text: "Croisement des 3 analyses..." },
    { icon: Scan, text: "Consolidation du diagnostic..." },
    { icon: Brain, text: "Calcul des priorites..." },
    { icon: Zap, text: "Formulation de la synthese..." },
  ],

  syntheseCard: {
    ceoIntro: "Voici ou on en est. Mes 3 specialistes ont analyse ta situation en parallele — energie, palettisation et IoT. Ce que je retiens de leur diagnostic preliminaire, c'est que t'as un cas ou les 3 axes se renforcent mutuellement. Regarde les points cles :",
    pointsCles: [
      "3 axes identifies : Energie (refrigeration, chauffage, HVAC) + Palettisation robotisee + IoT/Monitoring",
      "Subventions combinees HQ + STIQ/MESI : potentiel 590K$+ sur un projet de 1.1M$",
      "Elimination du goulot fin de ligne = +15% throughput immediat",
      "Plan en 4 phases sur 20 semaines sans arret de production",
      "ROI global : 22 mois apres subventions",
    ],
    risques: [
      "Fenetre de depot EnerGuide : avant juin 2026",
      "Delai approbation HQ : 8-12 semaines",
      "Cobot : formation operateurs necessaire (2-3 jours)",
    ],
  },

  preRapportThinking: [
    { icon: FileText, text: "Compilation des donnees recueillies..." },
    { icon: Building2, text: "Structuration du profil entreprise..." },
    { icon: Target, text: "Evaluation preliminaire par axe..." },
    { icon: ClipboardCheck, text: "Generation du pre-rapport..." },
  ],

  preRapport: {
    profil: {
      nom: "Aliments Boreal inc.",
      secteur: "Transformation alimentaire (surgeles, prets-a-manger)",
      employes: 85,
      lignes: 4,
      skus: 45,
      ca: "18M$/an",
      localisation: "Parc industriel, Saguenay QC",
    },
    axes: [
      {
        titre: "Efficacite energetique",
        icone: "zap",
        description: "Systemes vetustes (refrigeration R-404A, chaudieres 1998, HVAC sans VFD). Couts +40% en 2 ans. Gaspillage estime : 183K$/an.",
        estimation: "485K$ a 895K$",
        subventions: "HQ : jusqu'a 510K$",
      },
      {
        titre: "Palettisation robotisee",
        icone: "cog",
        description: "Fin de ligne 100% manuelle. 6 employes, blessures recurrentes (dos, epaules). Goulot de 15% sur throughput.",
        estimation: "180K$ a 250K$",
        subventions: "STIQ/MESI : jusqu'a 40%",
      },
      {
        titre: "Automatisation & IoT",
        icone: "cpu",
        description: "Aucun monitoring, maintenance 100% reactive. Zero donnees temps reel. Aucune visibilite sur la performance.",
        estimation: "150K$ a 215K$",
        subventions: "RS&DE potentiel",
      },
    ],
    recommandation: "Jumelage SMART recommande — integrateur multi-competences requis (energie + robotique + IoT). Le profil ideal maitrise les 3 axes pour un projet integre.",
    ceoRecommandation: "Mon analyse est claire : avec 3 axes qui se chevauchent et un budget de 800K a 1.2M$, vous avez besoin d'un integrateur capable de gerer l'ensemble du projet de facon integree. Envoyer 3 fournisseurs differents serait une erreur — les synergies entre l'energie, la robotique et le monitoring representent 30% de vos economies. Je recommande d'activer le Jumelage SMART pour identifier LE bon partenaire dans notre reseau de 130+ membres certifies Usine Bleue.",
  },

  ceoTransition: "Le pre-rapport de visite est genere. Maintenant, au lieu d'envoyer un integrateur a l'aveugle, on active le Jumelage SMART pour trouver LE bon partenaire dans notre reseau de 130+ membres certifies Usine Bleue. Ce processus prenait 6 semaines avec des humains — nos agents le font en quelques minutes.",
};

// ========== ACTE 2 — Le Jumelage SMART ==========

export interface Integrator {
  id: number;
  nom: string;
  ville: string;
  score: number;
  intro: string;
  specialites: string[];
  certifications: string[];
  projetsSimil: number;
  experience: string;
  force: string;
  tailleEquipe: number;
}

export const INTEGRATORS: Integrator[] = [
  {
    id: 1,
    nom: "Energia Solutions",
    ville: "Quebec",
    score: 94,
    intro: "Firme integree de 35 personnes basee a Quebec, specialisee dans les projets multi-axes pour le secteur alimentaire. Connue pour son departement subventions avec un taux d'approbation de 98% sur les dossiers HQ.",
    specialites: ["Refrigeration CO2 transcritique", "Efficacite energetique industrielle", "Robotique/Palettisation", "Subventions HQ"],
    certifications: ["ISO 50001", "HQ EnerGuide", "CEA Canada", "Integr. UR certifie"],
    projetsSimil: 42,
    experience: "15 ans",
    force: "Maitrise complete des 3 axes : energie + robotique + IoT. Expert programmes HQ et STIQ.",
    tailleEquipe: 35,
  },
  {
    id: 2,
    nom: "Techno-Froid Saguenay",
    ville: "Chicoutimi",
    score: 87,
    intro: "Entreprise regionale de Chicoutimi avec 12 ans d'experience en systemes energetiques industriels. Leur avantage principal est la proximite geographique et un excellent rapport qualite-prix pour les projets en region.",
    specialites: ["Chauffage/HVAC industriel", "Refrigeration commerciale", "Audit energetique"],
    certifications: ["RBQ", "HQ EnerGuide"],
    projetsSimil: 8,
    experience: "12 ans",
    force: "Avantage local — meme region, temps de reponse rapide, bon rapport qualite-prix",
    tailleEquipe: 18,
  },
  {
    id: 3,
    nom: "GreenTech Industries",
    ville: "Montreal",
    score: 82,
    intro: "Firme technologique de Montreal specialisee en IoT et robotique collaborative. Forte competence en capteurs, tableaux de bord temps reel et maintenance predictive. Moins d'experience en energie pure mais excellente en integration techno.",
    specialites: ["IoT/monitoring industriel", "Robotique collaborative", "Maintenance predictive"],
    certifications: ["ISO 14001", "Microsoft Azure IoT", "Integr. UR certifie"],
    projetsSimil: 15,
    experience: "8 ans",
    force: "Expert en technologies nouvelles — capteurs IoT, cobots et tableaux de bord temps reel",
    tailleEquipe: 25,
  },
];

export const SIM_ACTE2 = {
  criteresThinking: [
    { icon: Brain, text: "Analyse des besoins specifiques du projet..." },
    { icon: Target, text: "Generation des criteres de matching..." },
    { icon: Shield, text: "Verification des certifications requises..." },
    { icon: Database, text: "Preparation du scan reseau..." },
  ],

  criteres: [
    "Expertise refrigeration alimentaire (CO2 transcritique)",
    "Capacite en automatisation/robotique (palettisation cobot)",
    "Experience IoT/monitoring industriel",
    "Certification ISO 50001 (management energie)",
    "Experience avec subventions HQ + STIQ/MESI",
    "Proximite geographique (region Saguenay)",
    "Taille d'equipe suffisante (projet 1.1M$)",
    "Projets similaires en manufacturier alimentaire",
  ],

  scanSteps: [
    { label: "Reseau Usine Bleue", count: 130 },
    { label: "Secteur agroalimentaire", count: 23 },
    { label: "Expertise energie + robotique", count: 8 },
    { label: "Certifications requises", count: 5 },
    { label: "Score compatibilite", count: 3 },
  ],

  jumelageQuestions: [
    {
      question: "Avez-vous de l'experience specifique avec les systemes de refrigeration CO2 transcritique en milieu alimentaire?",
      reponses: [
        { integrateur: "Energia Solutions", reponse: "Oui, 12 projets de conversion CO2 en alimentaire dans les 3 dernieres annees. Notre equipe inclut 2 ingenieurs certifies en refrigerants naturels.", score: 95 },
        { integrateur: "Techno-Froid Saguenay", reponse: "Nous avons fait 3 projets en refrigeration commerciale au CO2, mais pas encore en contexte manufacturier alimentaire pur.", score: 65 },
        { integrateur: "GreenTech Industries", reponse: "Notre expertise est davantage en monitoring et analyse de donnees. Pour le CO2, nous travaillerions avec un sous-traitant specialise.", score: 40 },
      ],
    },
    {
      question: "Avez-vous deja integre des robots collaboratifs (cobots) pour la palettisation en milieu alimentaire?",
      reponses: [
        { integrateur: "Energia Solutions", reponse: "Oui, 6 projets de cobots palettiseurs (UR10e et FANUC CRX). On a un integrateur robotique dedie dans l'equipe. Formation operateurs incluse.", score: 92 },
        { integrateur: "Techno-Froid Saguenay", reponse: "Pas encore de robotique. On est specialises en energie. On pourrait sous-traiter cette partie.", score: 35 },
        { integrateur: "GreenTech Industries", reponse: "Oui, 4 projets cobots avec Universal Robots. Notre force c'est l'integration cobot + IoT pour le monitoring de la cellule robotisee.", score: 85 },
      ],
    },
    {
      question: "Comment gerez-vous les dossiers de subventions Hydro-Quebec et STIQ pour maximiser les aides financieres?",
      reponses: [
        { integrateur: "Energia Solutions", reponse: "On a un departement dedie subventions. On prepare les dossiers HQ + STIQ en parallele. Taux d'approbation : 98% sur nos 40+ dossiers.", score: 97 },
        { integrateur: "Techno-Froid Saguenay", reponse: "On connait bien EnerGuide et on a fait 5 dossiers dans la derniere annee. Pour STIQ, on travaille avec un consultant externe.", score: 72 },
        { integrateur: "GreenTech Industries", reponse: "On a gere quelques dossiers de subventions, mais ce n'est pas notre specialite premiere. On peut accompagner mais pas mener.", score: 50 },
      ],
    },
    {
      question: "Pour un projet a 1.1M$ brut avec 3 axes simultanes, comment structurez-vous le budget et les phases de paiement pour minimiser l'impact sur la tresorerie du client?",
      reponses: [
        { integrateur: "Energia Solutions", reponse: "On structure en 4 phases avec paiements progressifs lies aux jalons. On avance les frais de dossier HQ/STIQ. Le client ne paie rien tant que les subventions ne sont pas confirmees pour la phase concernee.", score: 94 },
        { integrateur: "Techno-Froid Saguenay", reponse: "On fonctionne avec un 30% a la commande, 40% a mi-parcours et 30% a la livraison. Pour les subventions, le client doit avancer et se fait rembourser apres.", score: 60 },
        { integrateur: "GreenTech Industries", reponse: "On offre un financement par phase mais uniquement pour la portion IoT/robotique. Pour l'energie, il faudrait un arrangement separe avec le sous-traitant.", score: 55 },
      ],
    },
    {
      question: "Quel est votre delai realiste de livraison pour un projet integre de cette envergure, et comment gerez-vous les risques de retard?",
      reponses: [
        { integrateur: "Energia Solutions", reponse: "20 semaines avec chevauchement des phases 2-3 et 3-4. On a un gestionnaire de projet dedie. Penalites contractuelles si on depasse de plus de 2 semaines. Buffer de 15% integre dans chaque phase.", score: 92 },
        { integrateur: "Techno-Froid Saguenay", reponse: "Pour la partie energie, 14-16 semaines. Pour le reste, on devrait coordonner avec des sous-traitants, ce qui peut ajouter 4-6 semaines. Total realiste : 24-28 semaines.", score: 58 },
        { integrateur: "GreenTech Industries", reponse: "Notre partie (IoT + cobot) prend 10-12 semaines. Le systeme energetique depend de notre partenaire. On estime 22-26 semaines total mais avec moins de controle sur les phases energie.", score: 62 },
      ],
    },
  ],

  scoringCategories: [
    { label: "Expertise energie", weight: "20%" },
    { label: "Capacite robotique", weight: "15%" },
    { label: "Experience subventions", weight: "15%" },
    { label: "IoT/Monitoring", weight: "15%" },
    { label: "Gestion budgetaire", weight: "10%" },
    { label: "Delai de livraison", weight: "10%" },
    { label: "Proximite & dispo", weight: "8%" },
    { label: "Compatibilite globale", weight: "7%" },
  ],

  scoringResults: [
    { nom: "Energia Solutions", scores: [96, 92, 97, 88, 94, 92, 75, 95], total: 94 },
    { nom: "Techno-Froid Saguenay", scores: [72, 35, 72, 55, 60, 58, 98, 85], total: 65 },
    { nom: "GreenTech Industries", scores: [50, 85, 50, 95, 55, 62, 60, 78], total: 68 },
  ],

  userCritereAjout: "C'est important pour moi que l'integrateur ait de l'experience specifique en milieu alimentaire — les normes HACCP, la gestion des zones de temperature, et la coordination avec nos equipes de production. On ne peut pas se permettre d'arreter les lignes.",

  ceoWinnerIntro: "Apres avoir evalue les 3 candidats sur 8 criteres et 5 sessions de jumelage, mon analyse est sans equivoque. Un integrateur se demarque clairement sur tous les axes de ton projet :",

  winnerMessage: "Energia Solutions est le partenaire ideal pour Aliments Boreal. Score global de 94% — expertise refrigeration CO2, capacite robotique pour la palettisation, maitrise complete des programmes HQ et STIQ (98% taux d'approbation), equipe de 35 personnes prete a demarrer dans 3 semaines. Ils couvrent les 3 axes du projet : energie, palettisation et IoT.",
};

// ========== ACTE 3 — Construction du Cahier SMART ==========

export const SIM_ACTE3 = {
  buildingThinking: [
    { icon: Database, text: "Compilation diagnostic AI..." },
    { icon: Scan, text: "Integration donnees visite terrain..." },
    { icon: DollarSign, text: "Calcul subventions HQ + STIQ detaillees..." },
    { icon: Wrench, text: "Montage concept preliminaire..." },
    { icon: AlertTriangle, text: "Analyse risques et faisabilite..." },
    { icon: FileText, text: "Mise en page du cahier..." },
  ],

  sections: [
    {
      num: 1,
      titre: "Profil & Analyse de l'entreprise",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-300",
      content: {
        type: "portrait" as const,
        data: {
          nom: "Aliments Boreal inc.",
          secteur: "Transformation alimentaire (produits surgeles, prets-a-manger)",
          employes: 85,
          lignes: 4,
          ca: "18M$",
          tarif: "Tarif M (grandes puissances) — 850,000 kWh/an",
          localisation: "Parc industriel, Saguenay QC",
          extras: [
            { label: "Consommation annuelle", value: "850,000 kWh" },
            { label: "Cout energetique actuel", value: "245,000$/an" },
            { label: "Hausse 2 ans", value: "+40% (de 175K$ a 245K$)" },
            { label: "SKUs actifs", value: "45 produits" },
            { label: "Fin de ligne", value: "100% manuelle (6 employes)" },
            { label: "Goulot palettisation", value: "-15% throughput" },
          ],
        },
      },
    },
    {
      num: 2,
      titre: "Analyse du Projet",
      icon: Gauge,
      color: "from-amber-500 to-amber-600",
      borderColor: "border-amber-300",
      content: {
        type: "diagnostic" as const,
        data: {
          items: [
            { systeme: "Refrigeration", probleme: "Systeme R-404A vetuste, cycles courts (8 min vs 20 min), fuites frequentes", gaspillage: "95,000$/an", priorite: "Critique" },
            { systeme: "Chauffage", probleme: "Chaudieres atmospheriques 1998, rendement 78% (vs 95% condensation)", gaspillage: "42,000$/an", priorite: "Haute" },
            { systeme: "HVAC/Ventilation", probleme: "Moteurs sans VFD, aucun controle de zone, surchauffe ete", gaspillage: "28,000$/an", priorite: "Haute" },
            { systeme: "Palettisation", probleme: "100% manuelle, 6 employes, blessures recurrentes, goulot de 15% sur throughput", gaspillage: "95,000$/an", priorite: "Critique" },
            { systeme: "Monitoring", probleme: "Aucune telemetrie, maintenance 100% reactive, zero donnees temps reel", gaspillage: "18,000$/an", priorite: "Moyenne" },
          ],
          total: "278,000$/an en pertes recuperables",
          note: "Donnees validees par visite terrain Energia Solutions — 27 fevrier 2026",
        },
      },
    },
    {
      num: 3,
      titre: "Concept preliminaire",
      icon: Wrench,
      color: "from-violet-500 to-violet-600",
      borderColor: "border-violet-300",
      content: {
        type: "solutions" as const,
        data: {
          solutions: [
            {
              nom: "Conversion refrigeration CO2 transcritique",
              priorite: "P1",
              impact: "Reduction 55% couts refrigeration",
              cout: "485,000$",
              delai: "8 semaines (weekends)",
              details: "Remplacement complet du systeme R-404A par CO2 transcritique. Installation par Energia Solutions, specialiste certifie. Synergie avec recuperation de chaleur pour le chauffage.",
              fournisseur: "Carnot Refrigeration (Quebec)",
            },
            {
              nom: "Chaudieres a condensation haute efficacite",
              priorite: "P1",
              impact: "Reduction 35% couts chauffage",
              cout: "195,000$",
              delai: "4 semaines",
              details: "2 chaudieres modulantes a condensation, rendement 95%+. Integration avec chaleur recuperee du systeme CO2 pour prechauffage.",
              fournisseur: "Viessmann Vitodens (serie industrielle)",
            },
            {
              nom: "Robot palettiseur collaboratif (cobot)",
              priorite: "P1",
              impact: "Elimination goulot +15% throughput",
              cout: "205,000$",
              delai: "6 semaines",
              details: "Cobot Universal Robots UR10e avec pince de palettisation. Cadence 8-12 palettes/heure. Elimine 100% du risque SST. Formation operateurs incluse (2-3 jours).",
              fournisseur: "Universal Robots (via Energia Solutions)",
            },
            {
              nom: "HVAC intelligent + IoT monitoring",
              priorite: "P2",
              impact: "Reduction 30% couts HVAC + visibilite totale",
              cout: "215,000$",
              delai: "6 semaines",
              details: "VFD sur 6 moteurs principaux, capteurs IoT par zone, tableau de bord temps reel, maintenance predictive par analyse vibratoire. 48 capteurs deployes.",
              fournisseur: "Schneider Electric EcoStruxure",
            },
          ],
        },
      },
    },
    {
      num: 4,
      titre: "Budget, subventions & financement",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      borderColor: "border-emerald-300",
      content: {
        type: "waterfall" as const,
        data: {
          investBrut: 1100000,
          subventions: [
            { programme: "EnerGuide (audit energetique)", montant: 15000, desc: "50% des couts d'audit et etude energetique" },
            { programme: "Aide financiere systemes industriels", montant: 195000, desc: "0.10$/kWh economise par an x 15 ans" },
            { programme: "Programme optimisation energetique", montant: 300000, desc: "75% des couts admissibles sur equipements energie" },
            { programme: "Programme STIQ — Automatisation", montant: 82000, desc: "40% des couts equipement robotique (cobot)" },
          ],
          totalSubventions: 592000,
          investNet: 508000,
          financement: {
            source: "BDC — Pret vert PME",
            montant: "508,000$",
            taux: "4.5%",
            duree: "60 mois",
            mensualite: "9,480$/mois",
          },
          economiesAnnuelles: 278000,
          cashFlowMensuel: "+13,700$/mois (economies 23,200$/mois - paiement 9,480$/mois)",
          roi: "22 mois",
        },
      },
    },
    {
      num: 5,
      titre: "Plan d'implantation",
      icon: Calendar,
      color: "from-cyan-500 to-cyan-600",
      borderColor: "border-cyan-300",
      content: {
        type: "timeline" as const,
        data: {
          phases: [
            { phase: "Phase 1", titre: "Depot dossiers HQ + STIQ + Audit", duree: "Sem. 1-4", desc: "Preparation et depot simultane des dossiers HQ (3 programmes) et STIQ (automatisation). Audit energetique et analyse fin de ligne par Energia Solutions.", roles: { integrateur: "Audit terrain", usinebleue: "Dossiers HQ + STIQ", client: "Acces et donnees" } },
            { phase: "Phase 2", titre: "Refrigeration CO2 + Chaudieres", duree: "Sem. 5-12", desc: "Conversion complete du systeme de refrigeration + installation chaudieres condensation. Installation weekends uniquement.", roles: { integrateur: "Installation", usinebleue: "Suivi qualite", client: "Coordination interne" } },
            { phase: "Phase 3", titre: "Robot palettiseur collaboratif", duree: "Sem. 11-16", desc: "Installation cobot UR10e fin de ligne. Integration avec convoyeurs existants. Formation operateurs (2-3 jours).", roles: { integrateur: "Installation cobot", usinebleue: "Suivi integration", client: "Formation equipe" } },
            { phase: "Phase 4", titre: "HVAC + IoT monitoring", duree: "Sem. 14-20", desc: "VFD sur moteurs, deploiement 48 capteurs IoT, mise en service tableau de bord temps reel et maintenance predictive.", roles: { integrateur: "Installation IoT", usinebleue: "Dashboard config", client: "Formation equipe" } },
          ],
          totalDuree: "20 semaines (5 mois)",
        },
      },
    },
    {
      num: 6,
      titre: "KPIs & suivi",
      icon: BarChart3,
      color: "from-indigo-500 to-indigo-600",
      borderColor: "border-indigo-300",
      content: {
        type: "kpis" as const,
        data: {
          kpis: [
            { label: "Consommation (kWh)", baseline: "850,000", cible: "540,000", reduction: "-36%", frequence: "Mensuel" },
            { label: "Couts energetiques", baseline: "245,000$/an", cible: "62,000$/an", reduction: "-75%", frequence: "Mensuel" },
            { label: "Throughput fin de ligne", baseline: "85%", cible: "100%", reduction: "+15pts", frequence: "Hebdomadaire" },
            { label: "Incidents SST", baseline: "12/an", cible: "0", reduction: "-100%", frequence: "Mensuel" },
            { label: "Uptime production", baseline: "94%", cible: "98%+", reduction: "+4pts", frequence: "Hebdomadaire" },
            { label: "ROI cumule", baseline: "0$", cible: "508,000$", reduction: "22 mois", frequence: "Mensuel" },
          ],
        },
      },
    },
    {
      num: 7,
      titre: "Validation & signatures",
      icon: ClipboardCheck,
      color: "from-green-500 to-green-600",
      borderColor: "border-green-300",
      content: {
        type: "validation" as const,
        data: {
          statut: "Pret pour signature",
          signataires: [
            { role: "Integrateur — Energia Solutions", nom: "Martin Pellerin, ing.", date: "27/02/2026" },
            { role: "Client — Aliments Boreal inc.", nom: "________________", date: "____/____/2026" },
            { role: "Usine Bleue AI — Facilitateur", nom: "CarlOS (GhostX)", date: "27/02/2026" },
          ],
        },
      },
    },
  ],

  summaryMetrics: [
    { label: "Investissement net", value: "508,000$", color: "text-blue-700" },
    { label: "Subventions combinees", value: "592,000$", color: "text-emerald-700" },
    { label: "ROI", value: "22 mois", color: "text-amber-700" },
  ],

  ceremonyMessage: "En quelques minutes, on est passe d'une tension multi-axe a un cahier de projet complet : 592,000$ de subventions identifiees (HQ + STIQ), le meilleur integrateur du reseau Usine Bleue selectionne par jumelage AI, un robot palettiseur qui elimine le goulot de 15%, et un plan d'implantation en 4 phases sans aucun arret de production.",

  hqMessage: "Imaginez ce processus pour les 130+ manufacturiers du reseau de membres certifies Usine Bleue. Chaque entreprise recoit un diagnostic personnalise multi-axe, un jumelage intelligent avec le bon integrateur, et un cahier de projet pret a executer — en minutes au lieu de semaines.",
};
