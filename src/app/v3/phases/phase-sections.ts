/**
 * phase-sections.ts — Config data-driven pour toutes les phases de travail
 *
 * UN type universel PhaseSection, partagé entre Réflexion et Conception.
 * Les prompts, descriptions et actions sont définis ici — pas dans les composants.
 */

import {
  Stethoscope,
  Lightbulb,
  Layers,
  Search,
  Globe,
  FileBarChart,
  Swords,
  FileText,
  Flame,
  Target,
  FolderOpen,
  ListChecks,
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export interface SectionAction {
  label: string;
  icon: LucideIcon;
  promptTemplate: string;
  variant: "default" | "success" | "warning";
}

export interface PhaseSection {
  id: string;
  title: string;
  icon: LucideIcon;
  prompt: string;
  description: string;
  actions: SectionAction[];
}

export const REFLEXION_SECTIONS: PhaseSection[] = [
  {
    id: "ref-1-diagnostic",
    title: "Diagnostic initial",
    icon: Stethoscope,
    prompt: "Fais un diagnostic complet \u2014 identifie les axes critiques et les opportunit\u00e9s",
    description: "Analyse de la situation actuelle. Identifie les axes critiques et les opportunit\u00e9s d\u2019am\u00e9lioration.",
    actions: [
      { label: "Approfondir", icon: Search, promptTemplate: "Approfondir ce diagnostic : {content}", variant: "default" },
      { label: "Challenger", icon: Swords, promptTemplate: "Challenge ce diagnostic \u2014 identifie les angles morts : {content}", variant: "warning" },
    ],
  },
  {
    id: "ref-2-brainstorm",
    title: "Brainstorm SCAMPER",
    icon: Lightbulb,
    prompt: "Lance un brainstorm SCAMPER \u2014 g\u00e9n\u00e8re des id\u00e9es cr\u00e9atives pour r\u00e9soudre les probl\u00e8mes identifi\u00e9s",
    description: "G\u00e9n\u00e9ration d\u2019id\u00e9es cr\u00e9atives avec la m\u00e9thode SCAMPER. Explore les possibilit\u00e9s sous tous les angles.",
    actions: [
      { label: "Approfondir", icon: Search, promptTemplate: "Approfondir ces id\u00e9es : {content}", variant: "default" },
      { label: "Challenger", icon: Swords, promptTemplate: "Challenge ces id\u00e9es \u2014 quelles sont irr\u00e9alistes? : {content}", variant: "warning" },
    ],
  },
  {
    id: "ref-3-synthese-brainstorm",
    title: "Synth\u00e8se brainstorm",
    icon: Layers,
    prompt: "Synth\u00e9tise les id\u00e9es du brainstorm \u2014 regroupe par th\u00e8me et priorise",
    description: "Regroupement et priorisation des id\u00e9es g\u00e9n\u00e9r\u00e9es. Identifie les th\u00e8mes porteurs et les quick wins.",
    actions: [
      { label: "Approfondir", icon: Search, promptTemplate: "Approfondir cette synth\u00e8se : {content}", variant: "default" },
      { label: "Reprioriser", icon: RefreshCw, promptTemplate: "Repriorise ces id\u00e9es avec de nouveaux crit\u00e8res : {content}", variant: "default" },
    ],
  },
  {
    id: "ref-4-cinq-pourquoi",
    title: "Analyse 5 Pourquoi",
    icon: Search,
    prompt: "Applique la m\u00e9thode des 5 Pourquoi \u2014 identifie les causes racines",
    description: "M\u00e9thode des 5 Pourquoi appliqu\u00e9e aux probl\u00e8mes identifi\u00e9s. Remonte aux causes racines.",
    actions: [
      { label: "Approfondir", icon: Search, promptTemplate: "Continue les 5 Pourquoi plus en profondeur : {content}", variant: "default" },
      { label: "Challenger", icon: Swords, promptTemplate: "Challenge ces causes racines : {content}", variant: "warning" },
    ],
  },
  {
    id: "ref-5-deep-search",
    title: "Deep Search",
    icon: Globe,
    prompt: "Recherche approfondie \u2014 trouve des donn\u00e9es, benchmarks et meilleures pratiques",
    description: "Recherche approfondie de donn\u00e9es, benchmarks sectoriels et meilleures pratiques du march\u00e9.",
    actions: [
      { label: "Approfondir", icon: Search, promptTemplate: "Cherche plus de donn\u00e9es sur : {content}", variant: "default" },
      { label: "Comparer", icon: Layers, promptTemplate: "Compare avec d\u2019autres secteurs : {content}", variant: "default" },
    ],
  },
  {
    id: "ref-6-synthese-recherche",
    title: "Synth\u00e8se recherche",
    icon: FileBarChart,
    prompt: "Synth\u00e9tise les recherches \u2014 croise les sources et identifie les constats",
    description: "Croisement des sources de recherche. Synth\u00e8se des constats et recommandations factuelles.",
    actions: [
      { label: "Approfondir", icon: Search, promptTemplate: "Approfondir cette synth\u00e8se de recherche : {content}", variant: "default" },
      { label: "Challenger", icon: Swords, promptTemplate: "Challenge ces constats \u2014 biais possibles? : {content}", variant: "warning" },
    ],
  },
  {
    id: "ref-7-challenge",
    title: "Challenge / D\u00e9fense",
    icon: Swords,
    prompt: "Challenge les conclusions \u2014 joue l\u2019avocat du diable et identifie les risques",
    description: "Avocat du diable \u2014 challenge les conclusions, identifie les angles morts et les risques.",
    actions: [
      { label: "D\u00e9fendre", icon: CheckCircle2, promptTemplate: "D\u00e9fends ces conclusions face aux critiques : {content}", variant: "success" },
      { label: "Re-challenger", icon: Swords, promptTemplate: "Challenge encore plus fort : {content}", variant: "warning" },
    ],
  },
  {
    id: "ref-8-pre-rapport",
    title: "Pr\u00e9-rapport",
    icon: FileText,
    prompt: "G\u00e9n\u00e8re le pr\u00e9-rapport \u2014 compile toutes les analyses en document structur\u00e9",
    description: "Compilation de toutes les analyses en un document structur\u00e9 pr\u00eat pour la phase Conception.",
    actions: [
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste ce pr\u00e9-rapport : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide ce pr\u00e9-rapport comme base de la conception", variant: "success" },
    ],
  },
];

export const CONCEPTION_SECTIONS: PhaseSection[] = [
  {
    id: "con-1-vue-ensemble",
    title: "Vue d\u2019ensemble du chantier",
    icon: Flame,
    prompt: "D\u00e9finis la vue d\u2019ensemble du chantier \u2014 titre, description, p\u00e9rim\u00e8tre et chaleur",
    description: "D\u00e9finition du p\u00e9rim\u00e8tre, de la vision et de la chaleur strat\u00e9gique du chantier.",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge cette vue d\u2019ensemble : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste cette vue d\u2019ensemble : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide cette vue d\u2019ensemble comme base du chantier", variant: "success" },
    ],
  },
  {
    id: "con-2-objectifs",
    title: "Objectifs & Crit\u00e8res de succ\u00e8s",
    icon: Target,
    prompt: "D\u00e9finis les objectifs SMART et les crit\u00e8res de succ\u00e8s mesurables du chantier",
    description: "Objectifs SMART et crit\u00e8res de succ\u00e8s mesurables pour \u00e9valuer la r\u00e9ussite.",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge ces objectifs : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste ces objectifs : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide ces objectifs", variant: "success" },
    ],
  },
  {
    id: "con-3-projets",
    title: "Projets identifi\u00e9s",
    icon: FolderOpen,
    prompt: "Identifie les projets n\u00e9cessaires pour atteindre les objectifs du chantier",
    description: "D\u00e9coupage en projets concrets pour atteindre les objectifs du chantier.",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge ces projets : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste les projets identifi\u00e9s : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide ces projets", variant: "success" },
    ],
  },
  {
    id: "con-4-missions",
    title: "Missions par projet",
    icon: Target,
    prompt: "D\u00e9compose chaque projet en missions concr\u00e8tes avec responsables et \u00e9ch\u00e9ances",
    description: "D\u00e9composition en missions concr\u00e8tes avec responsables et \u00e9ch\u00e9ances.",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge ces missions : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste ces missions : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide ces missions", variant: "success" },
    ],
  },
  {
    id: "con-5-taches",
    title: "T\u00e2ches par mission",
    icon: ListChecks,
    prompt: "D\u00e9taille les t\u00e2ches de chaque mission \u2014 actions, dur\u00e9e et d\u00e9pendances",
    description: "D\u00e9tail des t\u00e2ches: actions pr\u00e9cises, dur\u00e9e estim\u00e9e et d\u00e9pendances.",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge ces t\u00e2ches : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste ces t\u00e2ches : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide ces t\u00e2ches", variant: "success" },
    ],
  },
  {
    id: "con-6-equipe",
    title: "\u00c9quipe & Attribution",
    icon: Users,
    prompt: "Propose la composition d\u2019\u00e9quipe et l\u2019attribution des r\u00f4les pour ce chantier",
    description: "Composition de l\u2019\u00e9quipe et attribution des r\u00f4les et responsabilit\u00e9s.",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge cette \u00e9quipe : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste l\u2019\u00e9quipe : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide cette \u00e9quipe", variant: "success" },
    ],
  },
  {
    id: "con-7-budget",
    title: "Budget & Ressources",
    icon: DollarSign,
    prompt: "Estime le budget et les ressources n\u00e9cessaires \u2014 humain, tech, mat\u00e9riel",
    description: "Estimation du budget et des ressources n\u00e9cessaires (humain, tech, mat\u00e9riel).",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge ce budget : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste le budget : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide ce budget", variant: "success" },
    ],
  },
  {
    id: "con-8-timeline",
    title: "Timeline & Jalons",
    icon: Calendar,
    prompt: "Cr\u00e9e la timeline du chantier avec les jalons cl\u00e9s et les d\u00e9pendances",
    description: "Timeline avec jalons cl\u00e9s, d\u00e9pendances et points de d\u00e9cision.",
    actions: [
      { label: "Rechallenger", icon: AlertTriangle, promptTemplate: "Rechallenge cette timeline : {content}", variant: "warning" },
      { label: "Ajuster", icon: RefreshCw, promptTemplate: "Ajuste la timeline : {content}", variant: "default" },
      { label: "Valider", icon: CheckCircle2, promptTemplate: "Valide cette timeline", variant: "success" },
    ],
  },
];

/** Map phaseKey → sections */
export const PHASE_SECTIONS: Record<string, PhaseSection[]> = {
  reflexion: REFLEXION_SECTIONS,
  creation: CONCEPTION_SECTIONS,
};
