/**
 * strategie-data.ts — Donnees de simulation Mode Strategie
 * Sujet : "Passer de sous-traitant a produit propre — structurer la transition sans tuer le cash flow"
 * CEO + CSO + CFO lead — SWOT + 3 scenarios + Roadmap 3 phases + Risk Matrix
 * Temperature 0.6 — analyse structuree, ponderation prudente
 * Sprint A — Frame Master V2
 */

import {
  Scan,
  Brain,
  BookOpen,
  Shield,
  Target,
  TrendingUp,
  Factory,
  Users,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Clock,
  BarChart3,
  Rocket,
} from "lucide-react";

export const STRATEGIE_DATA = {
  titre: "Passer de sous-traitant a produit propre — structurer la transition sans tuer le cash flow",
  contexte: "Manufacturier de composants electroniques, 70 employes, 15M$ CA. 85% sous-traitance, 15% produit maison. Veut inverser le ratio en 3 ans.",

  userTension: "On veut passer de sous-traitant a produit propre — comment structurer la transition sans tuer le cash flow? On fait 15M$ avec 70 employes, 85% en sous-traitance. On a quelques produits maison qui marchent bien, mais c'est 15% du CA. L'objectif c'est d'inverser le ratio en 3 ans.",

  ceoThinking: [
    { icon: Scan, text: "Analyse du ratio sous-traitance vs produit propre..." },
    { icon: DollarSign, text: "Modelisation du cash flow transitoire..." },
    { icon: Brain, text: "Preparation de l'analyse SWOT..." },
    { icon: BookOpen, text: "Briefing CSO + CFO pour scenarios strategiques..." },
  ],

  ceoIntro: "Mode Strategie — je vais d'abord poser le diagnostic SWOT de ta position actuelle, puis on va comparer 3 scenarios de transition avec mon CSO et mon CFO. Ensuite, roadmap en 3 phases avec livrables concrets et matrice de risques. On va etre methodiques.",

  // === SWOT ANALYSIS ===
  swot: {
    forces: [
      {
        titre: "Expertise technique 25 ans",
        detail: "Maitrise complete de la chaine de production electronique. Certifications ISO 9001 et AS9100. Capacite a produire des composants de haute precision que peu de competiteurs locaux offrent.",
        sources: [{ type: "data" as const, label: "Profil competences internes — Audit RH 2025" }],
      },
      {
        titre: "Equipe R&D de 8 ingenieurs",
        detail: "Noyau R&D solide avec expertise en conception PCB, firmware et integration IoT. 3 brevets deposes, 2 en attente. Capacite de prototypage rapide (< 4 semaines).",
        sources: [{ type: "doc" as const, label: "Plan R&D — Direction technique 2025" }],
      },
    ],
    faiblesses: [
      {
        titre: "Aucune marque etablie",
        detail: "Zero notoriete sur le marche final. Pas de site web produit, pas de presence salon, aucun canal de distribution direct. Les clients finaux ne vous connaissent pas.",
        sources: [{ type: "stat" as const, label: "Audit notoriete — Marketing interne Q4 2025" }],
      },
      {
        titre: "Aucun channel de distribution direct",
        detail: "100% des ventes passent par les donneurs d'ordre. Pas de force de vente produit, pas de e-commerce B2B, pas de reseau de distributeurs. Infrastructure commerciale a batir de zero.",
        sources: [{ type: "data" as const, label: "Structure ventes — CRM 2025" }],
      },
    ],
    opportunites: [
      {
        titre: "IoT industriel en explosion",
        detail: "Le marche IoT industriel croit de 22%/an au Canada. La demande pour des capteurs et modules connectes sur mesure depasse l'offre. Les manufacturers cherchent des fournisseurs locaux (nearshoring).",
        sources: [
          { type: "stat" as const, label: "IoT Manufacturing Market — MarketsAndMarkets 2025 (22% CAGR)" },
          { type: "doc" as const, label: "Tendances nearshoring — STIQ 2025" },
        ],
      },
      {
        titre: "3 clients ont demande du custom",
        detail: "3 de vos clients existants ont deja demande des produits adaptes a leurs besoins specifiques. C'est un signal de marche fort — la demande existe, elle vient a vous sans effort commercial.",
        sources: [{ type: "data" as const, label: "Demandes clients — Registre commercial Q3-Q4 2025" }],
      },
    ],
    menaces: [
      {
        titre: "Marge sous-traitance en baisse (-3%/an)",
        detail: "Pression constante des donneurs d'ordre sur les prix. Marge nette passee de 12% a 6% en 4 ans. Tendance structurelle irreversible — la sous-traitance pure devient un jeu de volume a marge comprimee.",
        sources: [
          { type: "stat" as const, label: "Erosion marges sous-traitance — MEI Quebec 2025" },
          { type: "data" as const, label: "Historique marges — Comptabilite interne 2021-2025" },
        ],
      },
      {
        titre: "Dependance 2 gros donneurs d'ordre (60% CA)",
        detail: "60% du CA repose sur 2 clients. Si l'un reduit ses commandes de 30%, c'est 2.7M$ de CA perdu. Risque de concentration extreme — un seul appel d'offres perdu peut declencher des licenciements.",
        sources: [{ type: "stat" as const, label: "Concentration clients — Benchmark PME manufact. BDC 2025" }],
      },
    ],
  },

  // === 3 SCENARIOS ===
  scenarios: [
    {
      id: "conservateur",
      titre: "Conservateur",
      timeline: "18 mois",
      investissement: "350K$",
      risque: "Faible",
      risqueColor: "bg-green-100 text-green-700",
      ratio: "80/20",
      description: "1 seul produit pilote lance, garder 80% sous-traitance. Transition douce, validation de marche avant d'accelerer.",
      actions: [
        "Developper 1 produit IoT base sur les demandes des 3 clients existants",
        "Embaucher 1 directeur produit + 1 representant technique",
        "Creer un site web produit + presence LinkedIn B2B",
        "Objectif : 3M$ en produit propre (20% du CA)",
      ],
      avantages: "Risque financier minimal, apprentissage progressif, cash flow preserve",
      inconvenients: "ROI lent, fenetre d'opportunite IoT pourrait se fermer, marges sous-traitance continuent de baisser",
      recommande: false,
      sources: [{ type: "doc" as const, label: "Strategie produit graduelle — HBR 2024" }],
    },
    {
      id: "equilibre",
      titre: "Equilibre",
      timeline: "24 mois",
      investissement: "800K$",
      risque: "Modere",
      risqueColor: "bg-amber-100 text-amber-700",
      ratio: "50/50",
      description: "3 produits lances, ratio 50/50 a 24 mois. Investissement structure avec jalons de validation trimestriels. Le meilleur compromis risque/rendement.",
      actions: [
        "Lancer 3 produits IoT (capteur, module, gateway) en pipeline sequentiel",
        "Equipe dediee de 5 personnes (produit, vente, marketing, support, QA)",
        "Partenariat avec 2 distributeurs industriels + e-commerce B2B",
        "Objectif : 7.5M$ en produit propre (50% du CA a 15M$)",
      ],
      avantages: "Equilibre risque/rendement optimal, diversification revenus, validation progressive",
      inconvenients: "Necessite discipline d'execution stricte, pression sur les equipes pendant la transition",
      recommande: true,
      sources: [
        { type: "stat" as const, label: "Taux succes pivot produit PME — BDC 2025 (68% avec approche sequentielle)" },
        { type: "doc" as const, label: "Portfolio produit PME — McKinsey Manufacturing 2024" },
      ],
    },
    {
      id: "agressif",
      titre: "Agressif",
      timeline: "12 mois",
      investissement: "1.5M$",
      risque: "Eleve",
      risqueColor: "bg-red-100 text-red-700",
      ratio: "30/70",
      description: "Pivot rapide avec 6 produits. Investissement massif, reorganisation complete. Haut risque, haut potentiel — mais la marge d'erreur est quasi nulle.",
      actions: [
        "Developper 6 produits simultanement avec 3 equipes paralleles",
        "Embaucher 12 personnes (vente, marketing, dev produit, support)",
        "Reduire la sous-traitance a 30% en 12 mois",
        "Objectif : 10.5M$ en produit propre (70% sur CA de 15M$)",
      ],
      avantages: "Premiere position sur le marche, economie d'echelle rapide, signal fort aux clients",
      inconvenients: "Cash flow sous pression extreme, risque d'execution tres eleve, 6 lancements = 6 points de defaillance potentiels",
      recommande: false,
      sources: [{ type: "stat" as const, label: "Taux echec pivot rapide — Deloitte 2024 (57% echouent)" }],
    },
  ],

  // === ROADMAP 3 PHASES ===
  roadmap: [
    {
      id: "phase1",
      phase: "Phase 1",
      periode: "0 — 30 jours",
      titre: "Audit + Design",
      icon: Scan,
      couleur: "purple",
      livrables: [
        "Audit complet des competences transverables (R&D → produit)",
        "Etude de marche IoT industriel Quebec/Canada (TAM/SAM/SOM)",
        "Design du premier produit (specs, BOM, cout cible)",
        "Business plan produit avec projections 3 ans",
      ],
      owners: ["BCO", "BCS", "BCF"],
      metriques: "Business plan valide, cout unitaire < 40% prix vente cible, 3 clients beta confirmes",
      sources: [{ type: "doc" as const, label: "Framework Go-to-Market — Pragmatic Institute" }],
    },
    {
      id: "phase2",
      phase: "Phase 2",
      periode: "30 — 90 jours",
      titre: "Prototype + Beta Client",
      icon: Factory,
      couleur: "purple",
      livrables: [
        "Prototype fonctionnel v1 (PCB + firmware + boitier)",
        "Tests avec 3 clients beta (feedback structure)",
        "Certification CE/CSA amorcee",
        "Site web produit + collateral marketing",
      ],
      owners: ["BCT", "BCM", "BOO"],
      metriques: "Prototype valide par 3 clients, NPS beta > 7/10, pre-commandes > 50 unites",
      sources: [{ type: "stat" as const, label: "Cycle prototype IoT — IEEE 2024 (mediane 45 jours)" }],
    },
    {
      id: "phase3",
      phase: "Phase 3",
      periode: "90 jours +",
      titre: "Lancement + Scale",
      icon: Rocket,
      couleur: "purple",
      livrables: [
        "Lancement commercial produit #1 (prix, canal, support)",
        "Mise en production serie (ligne dediee ou cellule flex)",
        "Activation des 2 distributeurs industriels",
        "Pipeline produit #2 et #3 amorce",
      ],
      owners: ["BCO", "BCS", "BCM"],
      metriques: "100 unites vendues en 60 jours, marge brute > 55%, 2 distributeurs actifs",
      sources: [
        { type: "stat" as const, label: "Benchmark lancement produit B2B — Gartner 2025" },
        { type: "doc" as const, label: "Scaling manufacturing SME — MEI Quebec" },
      ],
    },
  ],

  // === RISK MATRIX (2x2 : probabilite x impact) ===
  riskMatrix: [
    {
      id: "R1",
      titre: "Perte d'un donneur d'ordre majeur pendant la transition",
      probabilite: "haute",
      impact: "haut",
      quadrant: "critique",
      mitigation: "Maintenir le service sous-traitance a 100% de qualite pendant la transition. Ne jamais cannibaliser les ressources sous-traitance pour le produit.",
      icon: AlertTriangle,
    },
    {
      id: "R2",
      titre: "Produit rate le product-market fit",
      probabilite: "basse",
      impact: "haut",
      quadrant: "surveiller",
      mitigation: "Phase beta structuree avec 3 clients. Pivoter en 30 jours si NPS < 5. Budget de validation avant production serie.",
      icon: Target,
    },
    {
      id: "R3",
      titre: "Cash flow insuffisant a mi-parcours",
      probabilite: "haute",
      impact: "bas",
      quadrant: "gerer",
      mitigation: "Ligne de credit pre-approuvee 500K$. Jalons go/no-go trimestriels. Plan B : ralentir sans arreter (passer au scenario conservateur).",
      icon: DollarSign,
    },
    {
      id: "R4",
      titre: "Difficulte a recruter les talents produit",
      probabilite: "basse",
      impact: "bas",
      quadrant: "accepter",
      mitigation: "Former en interne depuis l'equipe R&D existante. 3 des 8 ingenieurs ont de l'experience produit. Freelance pour combler les gaps temporaires.",
      icon: Users,
    },
  ],

  // === SYNTHESE THINKING ===
  syntheseThinking: [
    { icon: BarChart3, text: "Consolidation du SWOT et des scenarios..." },
    { icon: Brain, text: "Ponderation risque/rendement par scenario..." },
    { icon: Shield, text: "Validation de la matrice de risques..." },
    { icon: BookOpen, text: "Formulation des recommandations finales..." },
  ],

  // === SYNTHESE ===
  synthese: {
    recommandation: "Scenario Equilibre (24 mois, 800K$) — c'est le seul qui combine vitesse suffisante pour capter la fenetre IoT ET prudence pour proteger le cash flow. Le conservateur est trop lent (la marge sous-traitance te gruge 3%/an), l'agressif est trop risque avec ta structure actuelle.",
    prochaines_etapes: [
      "Semaine 1 : Mandat au CSO pour l'etude de marche IoT Quebec/Canada (TAM/SAM/SOM)",
      "Semaine 2 : Rencontre avec les 3 clients qui ont demande du custom — valider l'appetit et le prix cible",
      "Semaine 3 : CFO prepare le modele financier 24 mois avec jalons go/no-go trimestriels",
      "Semaine 4 : Decision go/no-go sur le scenario Equilibre avec le board",
    ],
    conclusion: "Tu as les competences, les clients initiaux et l'equipe R&D. Ce qui te manque, c'est la structure commerciale et la discipline d'execution. Le scenario Equilibre te donne 24 mois pour batir ca sans mettre l'entreprise en danger. La cle : ne jamais sacrifier la qualite de la sous-traitance pour financer le produit. Les deux doivent coexister jusqu'a ce que le produit puisse voler de ses propres ailes.",
  },
};
