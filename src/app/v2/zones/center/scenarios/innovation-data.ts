/**
 * innovation-data.ts — Donnees de simulation Mode Innovation
 * Sujet : "Comment reinventer notre service apres-vente pour qu'il devienne un centre de profit?"
 * 3 techniques de pensee laterale : Analogie, Inversion, Biomimetisme
 * CTO + CMO lead, Temperature 0.95
 * Sprint A — Frame Master V2
 */

import {
  Scan,
  Brain,
  BookOpen,
  Lightbulb,
  Shuffle,
  Leaf,
  TrendingUp,
  Cpu,
  Target,
  BarChart3,
  Sparkles,
  Wrench,
} from "lucide-react";

export const INNOVATION_DATA = {
  titre: "Comment reinventer notre service apres-vente pour qu'il devienne un centre de profit?",
  contexte: "Manufacturier d'equipements industriels, 90 employes, 22M$ CA. Le service apres-vente (SAV) genere 2M$ de revenus mais coute 2.4M$ a operer — un deficit de 400K$/an. Le CEO veut transformer ce centre de couts en centre de profit.",

  userTension: "Notre SAV nous coute plus cher qu'il rapporte. On fait 2M$ de revenus en reparations et pieces, mais ca nous coute 2.4M$ a operer — 12 techniciens, les vehicules, les pieces en inventaire. C'est un gouffre. Mais on peut pas le couper, nos clients s'attendent a du service. Comment on transforme ca en profit?",

  ceoIntro: "Mode Innovation — on va utiliser 3 techniques de pensee laterale pour sortir du cadre 'reparer quand ca casse'. Je lance mon CTO et mon CMO en tandem. 3 techniques, 3 angles radicalement differents, puis on fusionne le meilleur de chaque.",

  ceoThinking: [
    { icon: Scan, text: "Analyse du modele SAV actuel..." },
    { icon: Brain, text: "Selection des techniques d'innovation laterale..." },
    { icon: BookOpen, text: "Recherche de modeles disruptifs dans d'autres industries..." },
    { icon: Sparkles, text: "Activation du mode Innovation (T=0.95)..." },
  ],

  // === TECHNIQUE 1 — ANALOGIE ===
  technique1: {
    nom: "ANALOGIE",
    badge: "Analogie",
    badgeColor: "bg-fuchsia-100 text-fuchsia-800",
    accentColor: "from-fuchsia-500 to-pink-500",
    icon: Lightbulb,
    intro: "Dans l'industrie des ascenseurs (Otis, Schindler), ils ont transforme la maintenance en service predictif par abonnement. Otis fait 80% de ses profits sur le service, pas la vente d'ascenseurs. Transpose chez vous : vendre des 'contrats de performance garantie' au lieu de 'reparer quand ca casse'.",
    botCode: "BCT",
    botProposal: "On installe des capteurs IoT sur chaque equipement vendu — vibrations, temperature, consommation electrique. L'algorithme predit les pannes 2-4 semaines a l'avance. On vend ca comme un abonnement 'Zero-Panne Garanti' a 1,500$/mois par equipement. Avec 200 equipements en parc, ca fait 3.6M$/an de revenus recurrents. Cout additionnel : 800K$ (capteurs + plateforme). Marge nette : 40%+.",
    sources: [
      { type: "stat" as const, label: "Otis Connected — 80% profits from service (2024)" },
      { type: "doc" as const, label: "Rolls-Royce 'Power by the Hour' — case study" },
      { type: "data" as const, label: "IoT predictive maintenance ROI — McKinsey 2025" },
    ],
  },

  // === TECHNIQUE 2 — INVERSION ===
  technique2: {
    nom: "INVERSION",
    badge: "Inversion",
    badgeColor: "bg-orange-100 text-orange-800",
    accentColor: "from-orange-500 to-amber-500",
    icon: Shuffle,
    intro: "Et si on faisait l'OPPOSE? Au lieu de reparer les pannes, on FACTURE quand l'equipement FONCTIONNE. Modele 'Equipment-as-a-Service'. Le client ne possede plus — il paie a l'utilisation. Chaque heure de production qui tourne, vous facturez.",
    botCode: "BCM",
    botProposal: "On lance une offre 'Performance-as-a-Service'. Le client ne paie plus 250K$ pour l'equipement — il paie 45$/heure de production. On garantit 95% d'uptime. S'il y a une panne, c'est NOUS qui perdons, pas lui. Le client adore : zero risque, zero CAPEX. Nous : revenus previsibles de 394K$/an par equipement (8,760h x 45$). Sur 10 equipements convertis la premiere annee, c'est 3.9M$ de revenus recurrents. Le SAV devient le moteur de livraison du service.",
    sources: [
      { type: "stat" as const, label: "Hilti Fleet Management — 60% client retention boost" },
      { type: "doc" as const, label: "Xerox Managed Print Services — case study" },
      { type: "data" as const, label: "Equipment-as-a-Service market — Deloitte 2025" },
    ],
  },

  // === TECHNIQUE 3 — BIOMIMETISME ===
  technique3: {
    nom: "BIOMIMETISME",
    badge: "Biomimetisme",
    badgeColor: "bg-green-100 text-green-800",
    accentColor: "from-green-500 to-emerald-500",
    icon: Leaf,
    intro: "Dans la nature, les fourmis pratiquent la maintenance distribuee — chaque ouvriere inspecte et repare les tunnels qu'elle traverse, SANS coordination centrale. Transpose : former les OPERATEURS du client a faire la maintenance de niveau 1, vous ne gerez que le niveau 2-3. Le volume de vos interventions baisse de 60%, mais chaque intervention vaut 3x plus cher.",
    botCode: "BOO",
    botProposal: "On cree un programme 'Operateur Certifie' en 3 niveaux. Niveau 1 : l'operateur fait les inspections quotidiennes et les ajustements simples (formation 2 jours, 2,500$). Niveau 2 : le chef d'equipe gere les maintenances preventives mensuelles (formation 5 jours, 6,000$). Niveau 3 : nos techniciens experts interviennent uniquement sur les pannes complexes et les overhauls. Resultat : nos 12 techniciens passent de 800 interventions/an a 300 interventions a haute valeur. Revenu moyen par intervention : de 650$ a 2,200$. Plus : 400K$/an en formations. Cout SAV baisse de 2.4M$ a 1.6M$, revenus montent de 2M$ a 2.7M$.",
    sources: [
      { type: "doc" as const, label: "Toyota TPM (Total Productive Maintenance) — framework" },
      { type: "stat" as const, label: "Maintenance distribuee — reduction 55% interventions (Aberdeen)" },
      { type: "data" as const, label: "Formation operateurs industriels — ROI 4.2x (STIQ 2025)" },
    ],
  },

  // === FEASIBILITY SPECTRUM ===
  faisabilite: {
    axes: ["Impact revenus", "Faisabilite 12 mois", "Originalite"],
    idees: [
      {
        nom: "Abonnement Predictif",
        technique: "Analogie",
        color: "fuchsia",
        scores: [92, 65, 75], // Impact, Faisabilite, Originalite
        botCode: "BCT",
      },
      {
        nom: "Equipment-as-a-Service",
        technique: "Inversion",
        color: "orange",
        scores: [98, 40, 95],
        botCode: "BCM",
      },
      {
        nom: "Maintenance Distribuee",
        technique: "Biomimetisme",
        color: "green",
        scores: [70, 90, 60],
        botCode: "BOO",
      },
    ],
  },

  // === SYNTHESE ===
  syntheseThinking: [
    { icon: BarChart3, text: "Comparaison des 3 modeles..." },
    { icon: Target, text: "Evaluation de la faisabilite a 12 mois..." },
    { icon: Brain, text: "Fusion des meilleures composantes..." },
    { icon: Sparkles, text: "Construction du modele hybride..." },
  ],

  synthese: {
    titre: "Modele Hybride — Le SAV qui s'autofinance en 3 phases",
    recommendation: "On ne choisit pas UNE technique — on les combine en escalier. Phase 1 rapporte vite (Biomimetisme), Phase 2 cree le recurring (Analogie), Phase 3 transforme le business model (Inversion). Chaque phase finance la suivante.",
    phases: [
      "Phase 1 (0-6 mois) — BIOMIMETISME : Lancer le programme 'Operateur Certifie'. Cout : 45K$ (developpement curriculum + 2 formateurs). Revenus immediats : 200K$ en formations + reduction de 300K$ en couts d'intervention. Le SAV devient breakeven des le mois 6.",
      "Phase 2 (6-18 mois) — ANALOGIE : Deployer les capteurs IoT sur les 50 plus gros clients. Cout : 400K$ (capteurs + plateforme). Lancer l'abonnement 'Zero-Panne Garanti' a 1,200$/mois. Objectif : 80 contrats = 1.15M$/an de revenus recurrents. Marge : 55%.",
      "Phase 3 (18-36 mois) — INVERSION : Offrir le modele 'Performance-as-a-Service' aux nouveaux clients. Commencer avec 5 equipements pilotes. Si validation positive, convertir 20% du parc installe en 3 ans. Potentiel : 5-8M$/an de revenus recurrents.",
    ],
    conclusion: "Ton SAV de 2M$ qui coute 2.4M$ peut devenir un business de 4-6M$ avec 45%+ de marge en 18 mois. La cle : commencer par la formation (Phase 1) — ca coute presque rien, ca rapporte vite, et ca prepare le terrain pour l'IoT. Ne saute pas directement a l'Equipment-as-a-Service — c'est le jackpot, mais faut les fondations d'abord.",
  },
};
