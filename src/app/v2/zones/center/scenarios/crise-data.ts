/**
 * crise-data.ts — Donnees de simulation Mode Crise
 * Sujet : "Notre plus gros client (35% du CA) menace de partir dans 48h"
 * Mode OODA Loop — decisions rapides sous pression
 * Sprint A — Frame Master V2
 */

import {
  Scan,
  Phone,
  Shield,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  Zap,
  Brain,
} from "lucide-react";

export const CRISE_DATA = {
  titre: "Client #1 (35% du CA) menace de partir — 48h pour reagir",
  contexte: "Manufacturier de pieces mecaniques, 8.5M$ CA. Votre plus gros client Aeromax (3M$/an, 35% du CA) vient d'envoyer un courriel incendiaire : retards de livraison repetes, 3 non-conformites en 6 mois, et un concurrent qui les approche avec -15% sur les prix. Ils donnent 48 heures pour un plan correctif ou ils transferent 100% du volume.",

  alertMessage: "ALERTE CRITIQUE — Courriel recu de Jean-Pierre Lavoie, VP Approvisionnement chez Aeromax inc. : \"Suite a nos multiples discussions sans resultat, nous vous informons que nous evaluons activement des alternatives. Sans plan correctif detaille sous 48 heures, nous amorcerons le transfert de nos volumes. Cette decision est finale.\"",

  // === PHASE 1 — OBSERVE (OODA) ===
  observe: {
    label: "OBSERVER",
    ceoMessage: "Mode Crise active. 48 heures. Pas de temps pour deliberer — on agit. D'abord, les faits bruts.",
    thinking: [
      { icon: Scan, text: "Scan situation client Aeromax..." },
      { icon: AlertTriangle, text: "Analyse des incidents recents..." },
      { icon: Clock, text: "Calcul de l'impact financier..." },
    ],
    facts: [
      { label: "Revenus a risque", value: "3M$/an (35% du CA)", severity: "critical" as const },
      { label: "Retards livraison (6 mois)", value: "7 sur 23 commandes (30%)", severity: "critical" as const },
      { label: "Non-conformites", value: "3 NCR en 6 mois (norme: <1/an)", severity: "critical" as const },
      { label: "Dernier contact positif", value: "Il y a 4 mois", severity: "warning" as const },
      { label: "Concurrent identifie", value: "PrecisionTech — prix -15%", severity: "warning" as const },
      { label: "Contrat actuel", value: "Pas de clause d'exclusivite", severity: "info" as const },
    ],
  },

  // === PHASE 2 — ORIENT ===
  orient: {
    label: "ORIENTER",
    ceoMessage: "Situation claire : on a merde sur la qualite ET la livraison. Le prix est un pretexte — si on etait fiable, le -15% ne compterait pas. On a 2 axes d'attaque.",
    options: [
      { num: 1, text: "Appeler Jean-Pierre MAINTENANT — meeting d'urgence demain matin", consequence: "Direct, risque, mais montre le serieux" },
      { num: 2, text: "Envoyer un plan correctif ecrit d'abord, appeler apres", consequence: "Plus sur, mais perd du temps" },
    ],
  },

  // === PHASE 3 — DECIDE ===
  decide: {
    label: "DECIDER",
    thinking: [
      { icon: Phone, text: "Preparation script d'appel..." },
      { icon: Shield, text: "Plan correctif express..." },
      { icon: Users, text: "Mobilisation equipe interne..." },
    ],
    ceoDirective: "On fait LES DEUX. Appel dans 30 minutes + plan correctif par email dans 4 heures. Voici ce que chaque departement fait dans la prochaine heure :",
    assignments: [
      { bot: "BCO", role: "CEO", task: "Appeler Jean-Pierre dans 30 min. Script : excuses sinceres, zero blame, on prend 100% de la responsabilite. Proposer meeting en personne demain 8h a LEURS bureaux.", color: "blue" },
      { bot: "BOO", role: "COO", task: "Audit flash des 7 retards : cause racine pour chacun. Rapport en 2 heures. Identifier les 3 commandes en cours et garantir livraison anticipee.", color: "orange" },
      { bot: "BCT", role: "CTO", task: "Les 3 NCR : analyse technique en 1 heure. Quel changement de processus elimine le probleme? Proposer un systeme de controle qualite additionnel (inspection a 100% sur pieces Aeromax).", color: "violet" },
      { bot: "BCF", role: "CFO", task: "Modele financier : si on perd Aeromax, c'est quoi l'impact? Combien on peut investir pour les garder? Calculer le cout d'un credit qualite de 50-100K$ comme geste de bonne foi.", color: "emerald" },
    ],
  },

  // === PHASE 4 — ACT ===
  act: {
    label: "AGIR",
    timer: "47:22:00",
    planCorrectif: {
      titre: "Plan correctif Aeromax — Engagement 48h",
      sections: [
        {
          num: 1,
          titre: "Reconnaissance et responsabilite",
          contenu: "Aucune excuse, aucun blame externe. On reconnait les 7 retards et 3 NCR. On presente les causes racines identifiees.",
        },
        {
          num: 2,
          titre: "Actions immediates (0-72h)",
          items: [
            "Inspection 100% sur toutes les pieces Aeromax (effective immediatement)",
            "Superviseur dedie assigne au compte Aeromax (nom + cell)",
            "3 commandes en cours : livraison anticipee de 5 jours",
            "Credit qualite de 75K$ applique sur les 3 prochaines factures",
          ],
        },
        {
          num: 3,
          titre: "Actions structurelles (0-30 jours)",
          items: [
            "Nouveau poste : Responsable Qualite dedie grandes comptes",
            "Systeme de tracking en temps reel partage avec le client (portail)",
            "Meeting qualite bimensuel CEO-a-VP avec Aeromax",
            "SPC (Statistical Process Control) sur les 5 operations critiques",
          ],
        },
        {
          num: 4,
          titre: "Engagement de performance",
          items: [
            "0 retard dans les 90 prochains jours — ou credit additionnel de 5%",
            "0 NCR dans les 6 prochains mois — ou audit externe a nos frais",
            "Rapport qualite mensuel automatise via portail client",
          ],
        },
      ],
    },
    resultat: "Jean-Pierre a accepte le meeting demain 8h. Il a dit : \"C'est la premiere fois qu'un fournisseur m'appelle 30 minutes apres ma lettre. Ca me rassure.\" Le plan correctif part par email dans 2 heures. La crise n'est pas resolue, mais on a achete du temps et montre notre serieux.",
  },
};
