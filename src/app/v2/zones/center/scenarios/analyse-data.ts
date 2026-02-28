/**
 * analyse-data.ts — Donnees de simulation Mode Analyse
 * Sujet : "Nos marges brutes ont chute de 42% a 31% en 18 mois sans qu'on sache pourquoi"
 * CTO lead — 5 Pourquoi + Ishikawa
 * Sprint A — Frame Master V2
 */

import {
  Scan,
  Database,
  Brain,
  BookOpen,
  Search,
  GitBranch,
  AlertTriangle,
  Users,
  Settings,
  Cpu,
  Package,
  BarChart3,
  MapPin,
  Scale,
  Shield,
  TrendingDown,
  FileText,
  DollarSign,
  Clock,
  Target,
} from "lucide-react";

// ========== TYPES ==========

export interface WhyStep {
  level: number;
  question: string;
  answer: string;
  evidence: string;
  sources: { type: "doc" | "stat" | "data"; label: string }[];
}

export interface IshikawaCause {
  cause: string;
  evidence: string;
}

export interface IshikawaBranch {
  id: string;
  label: string;
  icon: React.ElementType;
  position: "top" | "bottom";
  causes: IshikawaCause[];
}

export interface EvidenceCard {
  title: string;
  icon: React.ElementType;
  botCode: string;
  content: string;
  dataPoints: { label: string; value: string; trend?: "up" | "down" | "neutral" }[];
  sources: { type: "doc" | "stat" | "data"; label: string }[];
}

export interface CorrectiveAction {
  action: string;
  responsable: string;
  timeline: string;
  priorite: "critique" | "haute" | "moyenne";
}

// ========== DATA ==========

export const ANALYSE_DATA = {
  titre: "Nos marges brutes ont chute de 42% a 31% en 18 mois sans qu'on sache pourquoi",
  contexte: "PME manufacturiere de pieces usinees, 55 employes, 9M$ CA. Les marges brutes sont passees de 42% a 31% en 18 mois. La direction ne comprend pas pourquoi et n'a pas de CFO depuis 14 mois.",

  userTension: "Nos marges brutes ont chute de 42% a 31% en 18 mois sans qu'on sache pourquoi. On travaille autant, on facture autant, mais il reste moins d'argent a la fin du mois. Mon controleur me dit que c'est le cout des matieres, mais ca n'explique pas tout. J'ai besoin de comprendre ce qui se passe vraiment.",

  ceoIntro: "Mode Analyse active. Ton probleme est classique en manufacturier — une erosion silencieuse de marge. On va creuser avec deux outils : les 5 Pourquoi pour trouver la cause racine, puis le diagramme Ishikawa pour cartographier TOUTES les causes contributives. Mon CTO va mener l'analyse.",

  ceoThinking: [
    { icon: Scan, text: "Analyse de l'erosion de marge sur 18 mois..." },
    { icon: Database, text: "Croisement des donnees financieres et operationnelles..." },
    { icon: Search, text: "Preparation de l'analyse 5 Pourquoi..." },
    { icon: GitBranch, text: "Construction du diagramme Ishikawa..." },
  ],

  // === 5 POURQUOI ===
  cinqPourquoi: [
    {
      level: 1,
      question: "Pourquoi les marges ont chute de 42% a 31%?",
      answer: "Le cout des matieres premieres a augmente de 28% en 18 mois, mais les prix de vente n'ont pas ete ajustes proportionnellement. L'ecart entre cout reel et prix facture s'est creuse mois apres mois.",
      evidence: "Cout moyen acier/aluminium : +28% (Statscan Q3 2025). Prix de vente moyen : +4% seulement sur la meme periode.",
      sources: [
        { type: "data" as const, label: "Indice prix matieres — Statscan Q3 2025" },
        { type: "stat" as const, label: "Analyse ecart prix/cout — comptabilite interne" },
      ],
    },
    {
      level: 2,
      question: "Pourquoi les prix de vente n'ont pas ete ajustes?",
      answer: "Il n'existe aucun mecanisme automatique de revision des prix. Les soumissions sont faites sur la base de tables de couts figees, sans clause d'indexation ni processus de mise a jour periodique.",
      evidence: "87% des soumissions des 12 derniers mois utilisent les memes prix unitaires qu'en 2023.",
      sources: [
        { type: "doc" as const, label: "Audit soumissions — echantillon 50 contrats" },
        { type: "stat" as const, label: "Taux revision prix PME manufact. — STIQ 2025" },
      ],
    },
    {
      level: 3,
      question: "Pourquoi les tables de couts n'ont jamais ete mises a jour?",
      answer: "Les tables de couts sont basees sur les donnees de 2019. Personne n'a le mandat ni les outils pour les actualiser. Le fichier Excel de reference est verrouille sur le poste de l'ancien CFO.",
      evidence: "Derniere modification du fichier 'Grille_Cout_Production_Master.xlsx' : 2019-11-14.",
      sources: [
        { type: "data" as const, label: "Metadata fichier Excel — IT interne" },
        { type: "doc" as const, label: "Bonnes pratiques cout de revient — CPA Canada" },
      ],
    },
    {
      level: 4,
      question: "Pourquoi personne n'a repris la responsabilite de la tarification?",
      answer: "Le CFO a quitte l'entreprise il y a 14 mois et n'a pas ete remplace. La responsabilite de la tarification est tombee entre deux chaises — le controleur gere la comptabilite courante mais n'a ni le mandat ni la competence pour la strategie de prix.",
      evidence: "Poste CFO vacant depuis decembre 2024. Le controleur a un profil technique comptable (CPA), pas strategique.",
      sources: [
        { type: "doc" as const, label: "Organigramme RH — derniere MAJ" },
        { type: "stat" as const, label: "Impact vacance CFO — Deloitte PME 2025" },
      ],
    },
    {
      level: 5,
      question: "Pourquoi le poste de CFO n'a pas ete comble?",
      answer: "La direction a cru que le controleur pouvait absorber les responsabilites du CFO. 'On pensait que le controleur etait capable de gerer ca.' C'est la CAUSE RACINE : un trou structurel dans la gouvernance financiere, qui a entraine une cascade de negligences — pas de mise a jour des couts, pas de revision des prix, pas de suivi des marges en temps reel.",
      evidence: "Selon Deloitte, 73% des PME qui perdent leur CFO sans remplacement voient leurs marges chuter de 5-15 points dans les 18 mois suivants.",
      sources: [
        { type: "stat" as const, label: "Impact vacance CFO PME — Deloitte 2025 (73%)" },
        { type: "doc" as const, label: "Gouvernance financiere PME — BDC Rapport 2024" },
      ],
    },
  ] as WhyStep[],

  // === ISHIKAWA — 6 branches (6M) ===
  ishikawa: {
    probleme: "Erosion marge brute 42% → 31%",
    branches: [
      {
        id: "man",
        label: "Main-d'oeuvre",
        icon: Users,
        position: "top" as const,
        causes: [
          { cause: "CFO absent depuis 14 mois", evidence: "Poste vacant, aucun remplacement" },
          { cause: "Controleur surcharge (comptabilite + tarification)", evidence: "Double responsabilite sans mandat formel" },
          { cause: "Heures supplementaires non facturees +18%", evidence: "320h/mois OT vs 270h budgetees" },
        ],
      },
      {
        id: "method",
        label: "Methode",
        icon: Settings,
        position: "bottom" as const,
        causes: [
          { cause: "Tables de couts figees depuis 2019", evidence: "Aucune mise a jour en 6 ans" },
          { cause: "Aucune clause d'indexation dans les contrats", evidence: "0 sur 50 contrats audites" },
          { cause: "Soumissions sans validation de marge", evidence: "Pas de seuil minimum defini" },
        ],
      },
      {
        id: "machine",
        label: "Machine",
        icon: Cpu,
        position: "top" as const,
        causes: [
          { cause: "Taux de rebut en hausse (+3.2 points)", evidence: "Rebut 8.7% vs historique 5.5%" },
          { cause: "Maintenance reactive vs preventive", evidence: "Arrets non planifies : 47h/mois" },
        ],
      },
      {
        id: "material",
        label: "Matiere",
        icon: Package,
        position: "bottom" as const,
        causes: [
          { cause: "Cout matieres premieres +28% en 18 mois", evidence: "Acier +31%, Aluminium +24%" },
          { cause: "Fournisseur unique sur 3 intrants cles", evidence: "Aucun pouvoir de negociation" },
          { cause: "Aucune couverture prix (hedging)", evidence: "100% exposition au marche spot" },
        ],
      },
      {
        id: "measurement",
        label: "Mesure",
        icon: BarChart3,
        position: "top" as const,
        causes: [
          { cause: "Pas de cout de revient par piece", evidence: "Cout estime vs cout reel : ecart inconnu" },
          { cause: "Marge suivie mensuellement, pas en temps reel", evidence: "Delai de detection : 30-45 jours" },
        ],
      },
      {
        id: "milieu",
        label: "Milieu",
        icon: MapPin,
        position: "bottom" as const,
        causes: [
          { cause: "Concurrents avec prix agressifs", evidence: "3 contrats perdus sur prix en 6 mois" },
          { cause: "Clients habitues aux prix fixes", evidence: "Resistance au changement de tarification" },
        ],
      },
    ] as IshikawaBranch[],
  },

  // === EVIDENCE CARDS (CTO) ===
  evidenceCards: [
    {
      title: "Ecart prix/cout cumule",
      icon: TrendingDown,
      botCode: "BCT",
      content: "L'ecart entre le cout reel des matieres et le prix facture s'est accumule lineairement. Chaque mois sans ajustement a coute en moyenne 27K$ de marge perdue.",
      dataPoints: [
        { label: "Marge Q1 2024", value: "42.1%", trend: "neutral" as const },
        { label: "Marge Q3 2025", value: "31.4%", trend: "down" as const },
        { label: "Perte cumulee", value: "486K$", trend: "down" as const },
        { label: "Perte mensuelle moy.", value: "27K$/mois", trend: "down" as const },
      ],
      sources: [
        { type: "data" as const, label: "Etats financiers internes 2024-2025" },
        { type: "stat" as const, label: "Analyse de tendance — 18 mois glissants" },
      ],
    },
    {
      title: "Benchmark sectoriel",
      icon: BarChart3,
      botCode: "BCT",
      content: "Les PME manufacturieres comparables maintiennent des marges de 35-40%. Le recul a 31% place l'entreprise sous le seuil critique de 33% identifie par le CRIQ comme zone de danger.",
      dataPoints: [
        { label: "Moyenne secteur", value: "37.2%", trend: "neutral" as const },
        { label: "Position entreprise", value: "31.4%", trend: "down" as const },
        { label: "Seuil critique CRIQ", value: "33.0%", trend: "neutral" as const },
        { label: "Ecart vs secteur", value: "-5.8 pts", trend: "down" as const },
      ],
      sources: [
        { type: "stat" as const, label: "Benchmark manufact. Quebec — CRIQ 2025" },
        { type: "doc" as const, label: "Profil sectoriel — Statistique Canada" },
      ],
    },
    {
      title: "Impact rebut + OT",
      icon: DollarSign,
      botCode: "BCT",
      content: "Au-dela des matieres, deux facteurs aggravent la situation : le taux de rebut en hausse (3.2 points) et les heures supplementaires non facturees representent ensemble 4.1 points de marge perdus.",
      dataPoints: [
        { label: "Cout rebut additionnel", value: "187K$/an", trend: "down" as const },
        { label: "OT non facture", value: "142K$/an", trend: "down" as const },
        { label: "Impact total", value: "329K$/an", trend: "down" as const },
        { label: "Equiv. en points marge", value: "-4.1 pts", trend: "down" as const },
      ],
      sources: [
        { type: "data" as const, label: "Rapport production — 12 derniers mois" },
        { type: "stat" as const, label: "Benchmark taux rebut — STIQ 2025" },
      ],
    },
  ] as EvidenceCard[],

  // === SYNTHESE THINKING ===
  syntheseThinking: [
    { icon: Scale, text: "Consolidation des 5 Pourquoi..." },
    { icon: Brain, text: "Croisement avec le diagramme Ishikawa..." },
    { icon: Shield, text: "Priorisation des actions correctives..." },
    { icon: Target, text: "Construction du plan d'action..." },
  ],

  // === SYNTHESE ===
  synthese: {
    causeRacine: "Trou structurel de gouvernance financiere — absence de CFO depuis 14 mois ayant entraine l'abandon de la mise a jour des couts, de la revision des prix et du suivi des marges en temps reel.",
    impactTotal: "Perte estimee de 815K$ sur 18 mois (486K$ ecart prix/cout + 329K$ rebut et OT non factures).",
    actions: [
      {
        action: "Mettre a jour les tables de couts IMMEDIATEMENT avec les prix reels 2025. Recalculer toutes les soumissions actives.",
        responsable: "Controleur + Direction",
        timeline: "Semaine 1-2",
        priorite: "critique" as const,
      },
      {
        action: "Envoyer des avis de revision de prix a tous les clients avec contrats actifs. Integrer une clause d'indexation trimestrielle dans tous les nouveaux contrats.",
        responsable: "Direction commerciale",
        timeline: "Semaine 2-4",
        priorite: "critique" as const,
      },
      {
        action: "Recruter un CFO ou un directeur financier a temps partiel (fractionnaire). Budget : 60-80K$/an pour un CFO fractionnel.",
        responsable: "CEO",
        timeline: "Mois 1-2",
        priorite: "haute" as const,
      },
      {
        action: "Implanter un suivi de cout de revient par piece en temps reel. Deployer un tableau de bord marge/produit avec alertes automatiques si marge < 33%.",
        responsable: "CTO + Controleur",
        timeline: "Mois 2-3",
        priorite: "haute" as const,
      },
      {
        action: "Diversifier les fournisseurs sur les 3 intrants cles (acier, aluminium, composants) et negocier des contrats a prix fixe 6 mois.",
        responsable: "COO + Achats",
        timeline: "Mois 2-4",
        priorite: "moyenne" as const,
      },
    ] as CorrectiveAction[],
    conclusion: "Ton probleme n'est pas un probleme de marche — c'est un probleme de gouvernance. Le depart du CFO a cree un angle mort financier que personne n'a comble. Les matieres premieres ont augmente, oui, mais la vraie cause c'est que PERSONNE ne surveillait le lien entre tes couts et tes prix. Les 2 premieres actions sont urgentes — chaque semaine de delai te coute ~6K$ de marge. Le CFO fractionnel, c'est ton investissement #1 pour 2026.",
  },
};
