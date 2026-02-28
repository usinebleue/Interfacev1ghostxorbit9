/**
 * decision-data.ts — Donnees de simulation Mode Decision
 * Sujet : "Acquerir un concurrent en difficulte pour 1.2M$ — Go or No-Go?"
 * Decision Matrix, Go/No-Go Framework, Risk vs Reward, Stakeholder Impact
 * Sprint A — Frame Master V2
 */

import {
  Scale,
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";

export interface DecisionCriteria {
  id: string;
  label: string;
  weight: number; // 1-5
  scoreFor: number; // 0-10
  scoreAgainst: number; // 0-10
  botFor: string;
  botAgainst: string;
  argFor: string;
  argAgainst: string;
}

export interface StakeholderImpact {
  stakeholder: string;
  impact: "positif" | "negatif" | "neutre";
  description: string;
  icon: React.ElementType;
}

export const DECISION_DATA = {
  titre: "Acquerir Zenith Solutions (concurrent en difficulte) pour 1.2M$",
  contexte: "PME de services TI, 45 employes, 6.8M$ CA. Zenith Solutions, un concurrent direct avec 18 employes et 2.1M$ CA, est en difficulte financiere (dettes de 400K$). Le fondateur veut vendre rapidement. Prix demande : 1.2M$. Tresorerie disponible : 800K$ + ligne de credit 500K$.",

  userTension: "Mon principal concurrent est a vendre pour 1.2M$. Ca doublerait presque ma capacite. Mais c'est 1.2M$ cash que j'ai pas vraiment. Et leurs dettes de 400K$ me font peur. En meme temps, si je l'achete pas, quelqu'un d'autre va le faire et ca pourrait devenir un probleme. Qu'est-ce que je fais?",

  ceoIntro: "Decision binaire a fort impact — parfait pour un Mode Decision structure. Je mobilise le CFO pour les chiffres, le COO pour l'integration, le CSO pour la strategie, et le CRO pour le potentiel revenu. On va utiliser une matrice de decision pondree.",

  setupThinking: [
    { icon: Scale, text: "Cadrage Go/No-Go..." },
    { icon: Brain, text: "Activation du Mode Decision..." },
    { icon: BarChart3, text: "Construction de la matrice ponderee..." },
    { icon: Users, text: "Analyse des impacts stakeholders..." },
  ],

  // === MATRICE DE DECISION PONDEREE ===
  criteres: [
    {
      id: "financier",
      label: "Capacite financiere",
      weight: 5,
      scoreFor: 4,
      scoreAgainst: 7,
      botFor: "BRO",
      botAgainst: "BCF",
      argFor: "Le ROI est la en 18-24 mois : 2.1M$ de CA additionnel contre 1.2M$ d'investissement. Ratio 1.75x acceptable.",
      argAgainst: "On epuise 100% de notre tresorerie + 40% de la ligne de credit. Zero marge de manoeuvre pendant 12 mois. Un imprev u et c'est la crise de liquidite.",
    },
    {
      id: "strategique",
      label: "Valeur strategique",
      weight: 4,
      scoreFor: 9,
      scoreAgainst: 3,
      botFor: "BCS",
      botAgainst: "BCS",
      argFor: "Eliminer un concurrent + absorber ses 35 clients + 18 employes formes. Position dominante sur le marche local. Barriere a l'entree pour les nouveaux.",
      argAgainst: "On pourrait gagner ces clients organiquement en 2-3 ans si Zenith ferme de toute facon. Le prix de 1.2M$ est 'opportuniste', pas forcement juste.",
    },
    {
      id: "operationnel",
      label: "Capacite d'integration",
      weight: 4,
      scoreFor: 5,
      scoreAgainst: 6,
      botFor: "BOO",
      botAgainst: "BOO",
      argFor: "Les equipes font le meme metier avec des outils similaires. Integration technique en 90 jours, culture en 6 mois. On a deja un playbook d'onboarding.",
      argAgainst: "18 personnes a integrer d'un coup — c'est 40% de croissance instantanee. Nos processus RH, notre culture, nos outils vont etre sous pression. Risque de perdre des gens des deux cotes.",
    },
    {
      id: "risque",
      label: "Niveau de risque",
      weight: 5,
      scoreFor: 4,
      scoreAgainst: 8,
      botFor: "BRO",
      botAgainst: "BCF",
      argFor: "Le vrai risque c'est de NE PAS acheter : un autre acquereur pourrait doubler sa force et nous attaquer. Le risque d'inaction est sous-estime.",
      argAgainst: "Dettes cachees potentielles (due diligence incomplete), perte de clients Zenith post-acquisition (20-30% normal), depart d'employes cles. Triple risque simultane.",
    },
    {
      id: "timing",
      label: "Fenetre d'opportunite",
      weight: 3,
      scoreFor: 8,
      scoreAgainst: 4,
      botFor: "BCS",
      botAgainst: "BCF",
      argFor: "Le fondateur est presse — c'est maintenant ou jamais. Dans 3 mois, soit il ferme (clients eparpilles), soit quelqu'un d'autre l'achete. La fenetre est etroite.",
      argAgainst: "La pression du temps est une tactique de vente classique. On peut negocier : LOI avec exclusivite 60 jours, due diligence complete, prix ajuste post-audit.",
    },
    {
      id: "talent",
      label: "Acquisition de talents",
      weight: 3,
      scoreFor: 7,
      scoreAgainst: 5,
      botFor: "BOO",
      botAgainst: "BOO",
      argFor: "3-4 seniors chez Zenith qu'on essaie de recruter depuis 2 ans. Les avoir d'un coup avec leur base de clients = inestimable. Cout de recrutement evite : ~120K$.",
      argAgainst: "En situation de rachat, les meilleurs partent souvent. On risque de payer 1.2M$ et de garder surtout les juniors. Retention = gros point d'interrogation.",
    },
  ] as DecisionCriteria[],

  // === STAKEHOLDER IMPACT ===
  stakeholders: [
    { stakeholder: "Employes actuels (45)", impact: "neutre" as const, description: "Excites par la croissance mais inquiets de la dilution culturelle. Besoin de communication claire.", icon: Users },
    { stakeholder: "Clients existants", impact: "positif" as const, description: "Plus de capacite = meilleur service. Pas de risque de disruption pour eux.", icon: Shield },
    { stakeholder: "Clients Zenith (35)", impact: "negatif" as const, description: "Incertitude pendant la transition. 20-30% risquent de partir dans les 6 premiers mois.", icon: AlertTriangle },
    { stakeholder: "Banque / Crediteurs", impact: "negatif" as const, description: "Utilisation de la ligne de credit + tresorerie. Ratios financiers sous pression. Risque de covenant.", icon: DollarSign },
    { stakeholder: "Fondateur Zenith", impact: "positif" as const, description: "Sortie honorable. Possibilite de role de transition 6-12 mois.", icon: CheckCircle },
    { stakeholder: "Marche / Concurrence", impact: "positif" as const, description: "Position dominante. Signal fort aux clients potentiels. Barriere a l'entree.", icon: TrendingUp },
  ],

  // === SCENARIOS CONDITIONNES ===
  scenarios: [
    {
      id: "go-full",
      label: "GO — Acquisition complete a 1.2M$",
      probability: "25%",
      conditions: "Due diligence clean + financement securise + plan retention signe",
      icon: CheckCircle,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-300",
      outcome: "Potentiel : 8.9M$ CA en 18 mois, position #1 locale. Risque : crise de liquidite si integration lente.",
    },
    {
      id: "go-negociated",
      label: "GO — Mais a 850K$ avec earn-out",
      probability: "45%",
      conditions: "Negocier 850K$ upfront + 350K$ en earn-out sur 24 mois lie a la retention clients",
      icon: Target,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-300",
      outcome: "Meilleur ratio risque/rendement. Garde 350K$ de tresorerie. Earn-out aligne les interets du fondateur sur la retention.",
    },
    {
      id: "no-go",
      label: "NO-GO — Laisser passer",
      probability: "20%",
      conditions: "Due diligence revele des dettes cachees OU clients Zenith deja en fuite",
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-300",
      outcome: "Garder ses 800K$ et recruter les meilleurs de Zenith quand ils ferment. Moins sexy mais zero risque financier.",
    },
    {
      id: "no-go-cherry",
      label: "NO-GO — Cherry-pick assets",
      probability: "10%",
      conditions: "Offrir 300K$ pour la liste de clients + 3 employes cles seulement",
      icon: Shield,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-300",
      outcome: "Fraction du cout, fraction du risque. Le fondateur refusera probablement mais ca vaut la peine de proposer.",
    },
  ],

  // === VERDICT / RECOMMANDATION ===
  verdictThinking: [
    { icon: BarChart3, text: "Calcul des scores ponderes..." },
    { icon: Scale, text: "Evaluation du consensus..." },
    { icon: Brain, text: "Formulation de la recommandation..." },
  ],

  verdict: {
    decision: "GO CONDITIONNEL",
    condition: "a 850K$ + earn-out 350K$, apres due diligence complete de 45 jours",
    scoreGo: 64,
    scoreNoGo: 56,
    ecart: "Faible (12%) — decision seree, pas un slam dunk",
    consensus: "3 bots GO (CSO, CRO, COO) vs 1 bot NO-GO (CFO). Le CFO accepte le GO conditionnel avec earn-out.",
    recommandation: "La matrice donne un avantage au GO mais l'ecart est faible. La cle : ne PAS payer 1.2M$ cash. Negocier 850K$ + earn-out de 350K$ lie a la retention des clients. Ca reduit le risque de 40% tout en captant 90% de la valeur strategique.",
    nextSteps: [
      { step: "Signer une LOI avec exclusivite 45 jours", deadline: "Cette semaine", bot: "BCO" },
      { step: "Due diligence financiere complete (dettes cachees?)", deadline: "J+15", bot: "BCF" },
      { step: "Rencontrer les 5 employes cles de Zenith (retention)", deadline: "J+20", bot: "BOO" },
      { step: "Negocier structure 850K$ + earn-out", deadline: "J+30", bot: "BCF" },
      { step: "Plan d'integration 90 jours si GO confirme", deadline: "J+45", bot: "BOO" },
    ],
  },
};
