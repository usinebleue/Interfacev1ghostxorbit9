/**
 * brainstorm-data.ts — Donnees de simulation Mode Brainstorm
 * Sujet : "Comment doubler nos clients en 12 mois sans augmenter l'equipe vente?"
 * Methode SCAMPER, post-its board, 4 bots contribuent
 * Sprint A — Frame Master V2
 */

import {
  Scan,
  Brain,
  Lightbulb,
  Shuffle,
  Layers,
  Rocket,
  Users,
  Megaphone,
  Globe,
  Repeat,
  Puzzle,
  Scissors,
  Target,
} from "lucide-react";

export interface StickyNote {
  id: string;
  text: string;
  bot: string;
  color: string;
  cluster?: string;
  votes?: number;
}

export const BRAINSTORM_DATA = {
  titre: "Comment doubler nos clients en 12 mois sans augmenter l'equipe vente?",
  contexte: "PME de services B2B, 35 employes, 4.2M$ CA. Equipe vente de 3 personnes deja au max. Objectif : passer de 120 a 240 clients actifs en 12 mois. Budget marketing : 80K$/an.",

  userTension: "On a 3 vendeurs qui gerent 40 clients chacun. Ils sont au plafond. J'ai pas le budget pour en embaucher 3 de plus (180K$/an min). Mais je dois doubler ma base de clients pour atteindre 8M$. Comment je fais?",

  ceoIntro: "Parfait pour un Brainstorm — on ouvre les vannes, zero jugement, quantite > qualite. Je mobilise le CMO, le CRO, le CTO et le COO. Chacun lance ses idees, on trie apres.",

  setupThinking: [
    { icon: Scan, text: "Cadrage du defi..." },
    { icon: Brain, text: "Activation du mode Brainstorm..." },
    { icon: Lightbulb, text: "Briefing des 4 departements..." },
    { icon: Shuffle, text: "Methode SCAMPER prete..." },
  ],

  scamperLabel: "SCAMPER : Substituer, Combiner, Adapter, Modifier, Put to other use, Eliminer, Reorganiser",

  // === VAGUE 1 — Idees brutes (post-its) ===
  vague1: {
    label: "Vague 1 — Idees brutes",
    notes: [
      { id: "1", text: "Programme de referral : chaque client existant qui refere = 1 mois gratuit", bot: "BCM", color: "bg-pink-100 border-pink-300", cluster: "referral" },
      { id: "2", text: "Webinaire mensuel gratuit sur un sujet industrie — capture de leads qualifies", bot: "BCM", color: "bg-pink-100 border-pink-300", cluster: "contenu" },
      { id: "3", text: "Partenariat avec 3-4 firmes complementaires : echange de leads croise", bot: "BRO", color: "bg-amber-100 border-amber-300", cluster: "partenariat" },
      { id: "4", text: "CarlOS comme BDR automatise : il qualifie les leads par chat avant qu'un vendeur intervienne", bot: "BCT", color: "bg-violet-100 border-violet-300", cluster: "automation" },
      { id: "5", text: "Self-serve diagnostic gratuit sur le site web — genere des leads ultra-qualifies", bot: "BCT", color: "bg-violet-100 border-violet-300", cluster: "automation" },
      { id: "6", text: "Restructurer les comptes : les clients < 10K$/an passent en self-serve, libere les vendeurs pour les gros", bot: "BOO", color: "bg-orange-100 border-orange-300", cluster: "restructuration" },
      { id: "7", text: "Campagne LinkedIn ABM (Account-Based Marketing) — cibler les 100 comptes ideaux avec du contenu personnalise", bot: "BCM", color: "bg-pink-100 border-pink-300", cluster: "contenu" },
      { id: "8", text: "Offre d'entree a 499$/mois (au lieu de 2K$) — convertir, puis upsell en 6 mois", bot: "BRO", color: "bg-amber-100 border-amber-300", cluster: "pricing" },
    ],
  },

  // === VAGUE 2 — SCAMPER challenge ===
  vague2: {
    label: "Vague 2 — SCAMPER Challenge",
    technique: "COMBINER + ADAPTER",
    notes: [
      { id: "9", text: "COMBINER : Referral + Self-serve diagnostic = le client fait le diagnostic avec son prospect, les deux deviennent clients", bot: "BCO", color: "bg-blue-100 border-blue-300", cluster: "referral", votes: 4 },
      { id: "10", text: "ADAPTER : Prendre le modele Uber — les clients satisfaits deviennent ambassadeurs remuneres (pas juste un mois gratuit, 10% recurring)", bot: "BRO", color: "bg-amber-100 border-amber-300", cluster: "referral", votes: 3 },
      { id: "11", text: "SUBSTITUER : Remplacer les 3 premiers meetings vendeur par un bot CarlOS + video personnalisee auto-generee", bot: "BCT", color: "bg-violet-100 border-violet-300", cluster: "automation", votes: 5 },
      { id: "12", text: "ELIMINER : Eliminer la prospection froide — 100% inbound via contenu + referral + partenariats", bot: "BCM", color: "bg-pink-100 border-pink-300", cluster: "contenu", votes: 2 },
      { id: "13", text: "REORGANISER : Les vendeurs ne vendent plus — ils font du consulting strategique. La vente est automatisee.", bot: "BOO", color: "bg-orange-100 border-orange-300", cluster: "restructuration", votes: 4 },
    ],
  },

  // === CLUSTERING ===
  clusters: [
    {
      id: "referral",
      label: "Referral & Ambassadeurs",
      icon: Users,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-300",
      noteIds: ["1", "9", "10"],
      potential: "+60 clients (50% des 120 existants referent 1 client)",
    },
    {
      id: "automation",
      label: "Automatisation de la vente",
      icon: Rocket,
      color: "text-violet-700",
      bg: "bg-violet-50",
      border: "border-violet-300",
      noteIds: ["4", "5", "11"],
      potential: "+80 clients (bot qualifie 200 leads/mois, conversion 3.3%)",
    },
    {
      id: "contenu",
      label: "Contenu & Inbound",
      icon: Megaphone,
      color: "text-pink-700",
      bg: "bg-pink-50",
      border: "border-pink-300",
      noteIds: ["2", "7", "12"],
      potential: "+40 clients (webinaires 50 leads/mois, conversion 7%)",
    },
    {
      id: "restructuration",
      label: "Restructuration des comptes",
      icon: Layers,
      color: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-300",
      noteIds: ["6", "13"],
      potential: "Libere 40% du temps vendeur (= comme embaucher 1.2 vendeurs)",
    },
    {
      id: "pricing",
      label: "Pricing strategique",
      icon: Target,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-300",
      noteIds: ["3", "8"],
      potential: "+20 clients (entree de gamme, conversion en 6 mois)",
    },
  ],

  // === SYNTHESE ===
  syntheseThinking: [
    { icon: Layers, text: "Clustering des 13 idees..." },
    { icon: Target, text: "Evaluation du potentiel par cluster..." },
    { icon: Brain, text: "Plan d'action integre..." },
  ],

  synthese: {
    titre: "Plan Doublement Clients — 120 a 240 en 12 mois",
    strategie: "3 leviers combines : Automatisation (CarlOS qualifie), Referral 10% (ambassadeurs), Restructuration (self-serve < 10K$). Budget total : 75K$ sur 12 mois.",
    projection: [
      { trimestre: "T1", clients: "+30", source: "Self-serve diagnostic (15) + referral (10) + inbound (5)", total: 150 },
      { trimestre: "T2", clients: "+35", source: "Bot CarlOS live (20) + referral (10) + partenariats (5)", total: 185 },
      { trimestre: "T3", clients: "+40", source: "Ambassadeurs 10% (15) + bot (15) + inbound (10)", total: 225 },
      { trimestre: "T4", clients: "+25", source: "Momentum organique + upsell entree de gamme (25)", total: 250 },
    ],
    ideePhare: "L'idee #11 (SUBSTITUER les meetings vendeur par CarlOS + video auto) a le plus de votes et le plus grand impact : elle transforme 3 vendeurs en 3 strateges qui closent les gros comptes pendant que le bot gere tout le haut du funnel.",
  },
};
