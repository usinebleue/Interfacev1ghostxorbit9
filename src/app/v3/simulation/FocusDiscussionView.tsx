/**
 * FocusDiscussionView.tsx — Vue Focus adaptative dans le workspace V3
 *
 * Le MENU LATÉRAL S'ADAPTE au type d'élément cliqué:
 * - Chantier: Résumé, Pipeline, Projets, Missions, Métriques, Documents, Historique
 * - Projet: Résumé, Missions, Tâches, Métriques, Documents, Historique
 * - Mission: Résumé, Tâches, Livrables, Documents, Historique
 * - Tâche: Résumé, Livrables, Historique
 * - KPI: Résumé, Tendance, Chantiers liés, Actions, Historique
 * - Signal: Résumé, Impact, Actions, Historique
 *
 * Le CONTENU S'ADAPTE au contexte spécifique (sujet de discussion):
 * - Chaque contexte nommé a ses propres données (pipeline, missions, docs, etc.)
 * - Fallback intelligent pour les contextes inconnus
 *
 * Pattern: Hero compact + SF sidebar w-[180px] + Contenu flex-1
 * COPIE EXACTE du pattern PhaseReflexion / PhaseExecution.
 */

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Target,
  TrendingUp,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Briefcase,
  CalendarDays,
  GitBranch,
  Package,
  Zap,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { PHASE_CONFIG } from "../core/phases";

// ═══════════════════════════════════════════════════════════════
// DONNÉES CONTEXTUELLES — Chaque sujet a ses propres données
// ═══════════════════════════════════════════════════════════════

interface CtxPipeline { titre: string; status: "done" | "in_progress" | "pending"; pct: number; bot: string }
interface CtxProjet { titre: string; bot: string; phase: string; pct: number }
interface CtxMission { titre: string; bot: string; urgent: boolean; status: string }
interface CtxTache { titre: string; assignee: string; done: boolean }
interface CtxLivrable { titre: string; format: string; status: string; date: string }
interface CtxMetrique { label: string; value: string; delta: string; positive: boolean }
interface CtxTendance { mois: string; valeur: string }
interface CtxImpact { zone: string; severite: string; desc: string }
interface CtxAction { titre: string; priorite: string; bot: string; status: string }
interface CtxDocument { titre: string; type: string; date: string; taille: string }
interface CtxHistorique { date: string; action: string; bot: string; type: string }
interface CtxChantierLie { titre: string; dept: string; pct: number; impact: string }

interface FocusCtxData {
  description: string;
  dept: string;
  bot: string;
  team: string[];
  pct: number;
  deadline?: string;
  budget?: string;
  pipeline?: CtxPipeline[];
  projets?: CtxProjet[];
  missions?: CtxMission[];
  taches?: CtxTache[];
  livrables?: CtxLivrable[];
  metriques?: CtxMetrique[];
  tendance?: CtxTendance[];
  tendanceCible?: string;
  tendanceVariation?: string;
  impacts?: CtxImpact[];
  actions?: CtxAction[];
  documents?: CtxDocument[];
  historique?: CtxHistorique[];
  chantiersLies?: CtxChantierLie[];
}

const CTX: Record<string, FocusCtxData> = {

  "Optimisation cycle production": {
    description: "Chantier stratégique Direction — Réduire les délais de production de 30% sur 6 mois en optimisant le cycle complet, de la commande à la livraison. Piloté par CarlOS avec Tim et Olivier en support opérationnel.",
    dept: "Direction", bot: "CarlOS", pct: 42,
    team: ["CarlOS (CEO)", "Tim (CTO)", "Olivier (COO)", "Frank (CFO)"],
    deadline: "15 juin 2026", budget: "45 000 $",
    pipeline: [
      { titre: "Qualification",      status: "done",        pct: 100, bot: "CarlOS" },
      { titre: "Analyse diagnostic", status: "done",        pct: 100, bot: "Tim" },
      { titre: "Blueprint validé",   status: "in_progress", pct: 65,  bot: "CarlOS" },
      { titre: "Exécution Phase 1",  status: "pending",     pct: 0,   bot: "Olivier" },
      { titre: "Livraison & Bilan",  status: "pending",     pct: 0,   bot: "Frank" },
    ],
    projets: [
      { titre: "Migration base données cloud",    bot: "Tim",     phase: "execution",  pct: 78 },
      { titre: "Automatisation ligne assemblage", bot: "Olivier", phase: "creation",   pct: 35 },
      { titre: "Tableau de bord temps réel",      bot: "Tim",     phase: "reflexion",  pct: 15 },
    ],
    missions: [
      { titre: "Documenter les 10 processus prioritaires",  bot: "Tim",      urgent: true,  status: "En cours" },
      { titre: "Audit performance ligne B",                  bot: "Olivier",  urgent: false, status: "En cours" },
      { titre: "Négocier contrat fournisseur capteurs IoT",  bot: "CarlOS",   urgent: true,  status: "En attente" },
      { titre: "Former équipe sur nouveau dashboard",        bot: "Mathilde", urgent: false, status: "Planifiée" },
      { titre: "Valider budget Phase 2 avec Frank",          bot: "Frank",    urgent: false, status: "Planifiée" },
    ],
    metriques: [
      { label: "Temps moyen cycle",   value: "4.2 jours", delta: "-18%", positive: true },
      { label: "Taux de conformité",  value: "94%",       delta: "+6%",  positive: true },
      { label: "Coût par unité",      value: "12.50 $",   delta: "-8%",  positive: true },
      { label: "Retards livraison",   value: "3 incidents", delta: "+1", positive: false },
      { label: "Satisfaction client",  value: "8.7 / 10", delta: "+0.3", positive: true },
      { label: "ROI projeté",         value: "2.4x",      delta: "—",    positive: true },
    ],
    documents: [
      { titre: "Cahier de projet — Phase 1",         type: "PDF",      date: "22 avr", taille: "2.4 MB" },
      { titre: "Blueprint Direction — Q2 2026",      type: "DocForge", date: "18 avr", taille: "—" },
      { titre: "Analyse VITAA — Diagnostic initial",  type: "PDF",      date: "10 avr", taille: "1.1 MB" },
      { titre: "Tableau de bord financier",           type: "Tableur",  date: "25 avr", taille: "890 KB" },
    ],
    historique: [
      { date: "28 avr", action: "Blueprint validé par Carl — passage en exécution",     bot: "CarlOS", type: "decision" },
      { date: "25 avr", action: "Tableau de bord financier mis à jour — coûts révisés", bot: "Frank",  type: "document" },
      { date: "22 avr", action: "Mission documentation processus lancée",                bot: "Tim",    type: "mission" },
      { date: "18 avr", action: "Diagnostic VITAA complété — score 72/100",             bot: "CarlOS", type: "diagnostic" },
      { date: "15 avr", action: "Élément créé — rattaché à Direction",                   bot: "CarlOS", type: "creation" },
      { date: "10 avr", action: "Première réflexion stratégique avec Simone",            bot: "Simone", type: "reflexion" },
    ],
  },

  "Migration base données cloud": {
    description: "Migration complète de l'infrastructure de données vers PostgreSQL cloud. Inclut le transfert de 2.3M enregistrements, la refonte des schémas et la mise en place de backups automatisés. Objectif : zéro downtime.",
    dept: "CTO", bot: "Tim", pct: 78,
    team: ["Tim (CTO)", "Olivier (COO)", "Sébastien (CISO)"],
    deadline: "30 mai 2026", budget: "18 000 $",
    missions: [
      { titre: "Configurer PostgreSQL staging + réplication",  bot: "Tim",       urgent: false, status: "Complétée" },
      { titre: "Migrer tables clients (850K rows)",            bot: "Tim",       urgent: false, status: "Complétée" },
      { titre: "Migrer tables transactions (1.4M rows)",       bot: "Tim",       urgent: true,  status: "En cours" },
      { titre: "Audit sécurité post-migration",                bot: "Sébastien", urgent: false, status: "Planifiée" },
      { titre: "Basculer le trafic production",                bot: "Olivier",   urgent: false, status: "Planifiée" },
    ],
    taches: [
      { titre: "Configurer serveur PostgreSQL staging",        assignee: "Tim",      done: true },
      { titre: "Rédiger specs API endpoints migration",        assignee: "Tim",      done: true },
      { titre: "Script ETL batch #1 — clients (850K)",        assignee: "Tim",      done: true },
      { titre: "Script ETL batch #2 — transactions (1.4M)",   assignee: "Tim",      done: false },
      { titre: "Valider intégrité post-migration",            assignee: "Olivier",  done: false },
      { titre: "Mettre à jour documentation technique",        assignee: "Tim",      done: false },
      { titre: "Former équipe sur nouveau schéma",             assignee: "Mathilde", done: false },
    ],
    metriques: [
      { label: "Données migrées",     value: "1.2M / 2.3M", delta: "52%",   positive: true },
      { label: "Temps de migration",   value: "3h 42min",    delta: "—",     positive: true },
      { label: "Erreurs détectées",    value: "12",          delta: "-85%",  positive: true },
      { label: "Downtime prévu",       value: "0 min",       delta: "cible", positive: true },
    ],
    livrables: [
      { titre: "Script ETL automatisé (Python)",         format: "Python",  status: "Livré",     date: "20 avr" },
      { titre: "Rapport d'intégrité batch #1",           format: "PDF",     status: "Livré",     date: "22 avr" },
      { titre: "Script ETL batch #2 — transactions",     format: "Python",  status: "En cours",  date: "—" },
      { titre: "Plan de basculement production",          format: "DocForge", status: "Planifié",  date: "—" },
    ],
    documents: [
      { titre: "Architecture cible PostgreSQL cloud",     type: "DocForge", date: "12 avr", taille: "—" },
      { titre: "Rapport migration batch #1 — clients",   type: "PDF",      date: "22 avr", taille: "1.8 MB" },
      { titre: "Checklist sécurité CISO",                 type: "PDF",      date: "15 avr", taille: "420 KB" },
    ],
    historique: [
      { date: "25 avr", action: "Migration batch #1 complétée — 850K clients transférés", bot: "Tim",       type: "mission" },
      { date: "22 avr", action: "Rapport d'intégrité validé — 0 erreur critique",         bot: "Tim",       type: "document" },
      { date: "20 avr", action: "Script ETL v2 livré — support batch parallèle",          bot: "Tim",       type: "creation" },
      { date: "15 avr", action: "Checklist sécurité envoyée par Sébastien",               bot: "Sébastien", type: "document" },
      { date: "12 avr", action: "Architecture cible validée par Carl",                     bot: "CarlOS",    type: "decision" },
      { date: "8 avr",  action: "Projet créé — rattaché à Optimisation cycle production",  bot: "CarlOS",    type: "creation" },
    ],
  },

  "Automatisation Boreal": {
    description: "Cahier de projet complet pour Alimentation Boréal — diagnostic usine + 4 solutions d'automatisation. Phases : audit terrain, analyse VITAA, rédaction cahier, présentation au CA Boréal.",
    dept: "Direction", bot: "CarlOS", pct: 55,
    team: ["CarlOS (CEO)", "Tim (CTO)", "Olivier (COO)", "Paco (CPO)"],
    deadline: "10 juin 2026", budget: "28 000 $",
    missions: [
      { titre: "Audit terrain usine Boréal (3 lignes)",        bot: "Olivier", urgent: false, status: "Complétée" },
      { titre: "Diagnostic VITAA Boréal",                      bot: "CarlOS",  urgent: false, status: "Complétée" },
      { titre: "Rédiger cahier de projet — 4 solutions",       bot: "CarlOS",  urgent: true,  status: "En cours" },
      { titre: "Chiffrer les solutions avec fournisseurs",     bot: "Paco",    urgent: false, status: "En attente" },
      { titre: "Présentation CA Boréal + décision",            bot: "CarlOS",  urgent: false, status: "Planifiée" },
    ],
    taches: [
      { titre: "Photographier 3 lignes de production",          assignee: "Olivier", done: true },
      { titre: "Collecter données production 12 derniers mois", assignee: "Olivier", done: true },
      { titre: "Modéliser le flow matière actuel",              assignee: "Tim",     done: true },
      { titre: "Rédiger section Diagnostic (20 pages)",         assignee: "CarlOS",  done: false },
      { titre: "Rédiger 4 scénarios d'automatisation",         assignee: "CarlOS",  done: false },
      { titre: "Obtenir soumissions fournisseurs (3 min.)",    assignee: "Paco",    done: false },
    ],
    metriques: [
      { label: "Pages rédigées",        value: "34 / 60",  delta: "57%",     positive: true },
      { label: "Solutions chiffrées",   value: "1 / 4",    delta: "25%",     positive: false },
      { label: "ROI projeté Sol. A",    value: "3.2x",     delta: "18 mois", positive: true },
      { label: "Budget investissement", value: "1.2M $",   delta: "estimé",  positive: true },
    ],
    livrables: [
      { titre: "Rapport audit terrain (photos + données)",  format: "PDF",      status: "Livré",     date: "18 avr" },
      { titre: "Diagnostic VITAA Boréal",                   format: "PDF",      status: "Livré",     date: "20 avr" },
      { titre: "Cahier de projet — 4 solutions",            format: "DocForge", status: "En cours",  date: "—" },
      { titre: "Deck présentation CA",                      format: "PPT",      status: "Planifié",  date: "—" },
    ],
    documents: [
      { titre: "Audit terrain — Usine Boréal",              type: "PDF",      date: "18 avr", taille: "8.2 MB" },
      { titre: "VITAA Score — Alimentation Boréal",         type: "PDF",      date: "20 avr", taille: "1.4 MB" },
      { titre: "Données production 2025 (12 mois)",         type: "Tableur",  date: "16 avr", taille: "2.1 MB" },
      { titre: "Cahier de projet (brouillon)",              type: "DocForge", date: "26 avr", taille: "—" },
    ],
    historique: [
      { date: "26 avr", action: "Rédaction cahier en cours — 34 pages sur 60",   bot: "CarlOS",  type: "mission" },
      { date: "20 avr", action: "Diagnostic VITAA complété — score 68/100",      bot: "CarlOS",  type: "diagnostic" },
      { date: "18 avr", action: "Audit terrain terminé — 3 lignes inspectées",   bot: "Olivier", type: "mission" },
      { date: "16 avr", action: "Données production reçues de Boréal",           bot: "Olivier", type: "document" },
      { date: "12 avr", action: "Projet créé — client Alimentation Boréal",      bot: "CarlOS",  type: "creation" },
    ],
  },

  "Automatisation ligne assemblage": {
    description: "Automatisation de la ligne d'assemblage B avec intégration de capteurs IoT et bras robotisés. Objectif : réduire le temps de cycle de 40% et les erreurs manuelles de 90%.",
    dept: "COO", bot: "Olivier", pct: 35,
    team: ["Olivier (COO)", "Tim (CTO)", "Paco (CPO)"],
    deadline: "30 juil. 2026", budget: "85 000 $",
    missions: [
      { titre: "Cartographier postes manuels ligne B",     bot: "Olivier", urgent: false, status: "Complétée" },
      { titre: "Évaluer solutions robotiques (3 vendors)",  bot: "Paco",    urgent: true,  status: "En cours" },
      { titre: "Intégration capteurs IoT — phase pilote",  bot: "Tim",     urgent: false, status: "En attente" },
      { titre: "Formation opérateurs nouvelles machines",   bot: "Hélène",  urgent: false, status: "Planifiée" },
    ],
    taches: [
      { titre: "Inventaire 12 postes manuels critiques",                   assignee: "Olivier", done: true },
      { titre: "Benchmark 3 fournisseurs bras robotisés",                  assignee: "Paco",    done: false },
      { titre: "Spec technique capteurs IoT (température, vibration)",     assignee: "Tim",     done: false },
      { titre: "Plan d'implantation phase 1 (3 postes)",                   assignee: "Olivier", done: false },
    ],
    metriques: [
      { label: "Postes analysés",         value: "12 / 12", delta: "100%",     positive: true },
      { label: "Vendors contactés",       value: "2 / 3",   delta: "67%",      positive: true },
      { label: "Réduction temps estimée", value: "38%",     delta: "cible 40%", positive: true },
      { label: "Budget engagé",           value: "12K / 85K", delta: "14%",    positive: true },
    ],
    livrables: [
      { titre: "Cartographie postes manuels (schéma)",   format: "PDF",      status: "Livré",    date: "14 avr" },
      { titre: "Comparatif vendors robotique",           format: "Tableur",  status: "En cours", date: "—" },
      { titre: "Spec technique capteurs IoT",            format: "DocForge", status: "Planifié", date: "—" },
    ],
    documents: [
      { titre: "Cartographie ligne B — 12 postes",         type: "PDF",     date: "14 avr", taille: "3.6 MB" },
      { titre: "Benchmark robots — FANUC vs ABB vs KUKA",  type: "Tableur", date: "24 avr", taille: "1.2 MB" },
    ],
    historique: [
      { date: "24 avr", action: "Benchmark robots en cours — 2 vendors évalués sur 3",   bot: "Paco",    type: "mission" },
      { date: "14 avr", action: "Cartographie ligne B terminée — 12 postes identifiés",   bot: "Olivier", type: "mission" },
      { date: "10 avr", action: "Budget 85K$ approuvé par Frank",                         bot: "Frank",   type: "decision" },
      { date: "5 avr",  action: "Projet créé — rattaché à Optimisation cycle production",  bot: "CarlOS",  type: "creation" },
    ],
  },

  "Documenter les 10 processus prioritaires": {
    description: "Documenter les 10 processus de production les plus critiques pour préparer l'automatisation. Chaque processus : flowchart, temps de cycle, points de blocage, recommandation.",
    dept: "CTO", bot: "Tim", pct: 40,
    team: ["Tim (CTO)", "Olivier (COO)"],
    deadline: "15 mai 2026",
    taches: [
      { titre: "Process #1 — Réception matière première",       assignee: "Tim",     done: true },
      { titre: "Process #2 — Découpe et préparation",           assignee: "Tim",     done: true },
      { titre: "Process #3 — Assemblage ligne A",               assignee: "Tim",     done: true },
      { titre: "Process #4 — Assemblage ligne B",               assignee: "Tim",     done: true },
      { titre: "Process #5 — Contrôle qualité",                 assignee: "Olivier", done: false },
      { titre: "Process #6 — Emballage",                        assignee: "Tim",     done: false },
      { titre: "Process #7 — Expédition",                       assignee: "Tim",     done: false },
      { titre: "Process #8 — Maintenance préventive",           assignee: "Olivier", done: false },
      { titre: "Process #9 — Gestion des retours",              assignee: "Tim",     done: false },
      { titre: "Process #10 — Inventaire et approvisionnement", assignee: "Tim",     done: false },
    ],
    livrables: [
      { titre: "Flowcharts processus #1-4",        format: "PDF",      status: "Livré",    date: "24 avr" },
      { titre: "Flowcharts processus #5-10",       format: "PDF",      status: "En cours", date: "—" },
      { titre: "Rapport consolidé 10 processus",   format: "DocForge", status: "Planifié", date: "—" },
    ],
    documents: [
      { titre: "Flowcharts processus #1-4 (validés)", type: "PDF",      date: "24 avr", taille: "5.4 MB" },
      { titre: "Template flowchart standard",          type: "DocForge", date: "10 avr", taille: "—" },
    ],
    historique: [
      { date: "24 avr", action: "Processus #4 documenté — 4/10 complétés",           bot: "Tim",     type: "mission" },
      { date: "22 avr", action: "Process #3 validé par Olivier sur le terrain",       bot: "Olivier", type: "decision" },
      { date: "18 avr", action: "Template flowchart standardisé créé",                bot: "Tim",     type: "document" },
      { date: "15 avr", action: "Mission lancée — objectif 10 processus en 30 jours", bot: "CarlOS",  type: "creation" },
    ],
  },

  "Configurer serveur PostgreSQL staging": {
    description: "Installer et configurer un serveur PostgreSQL 16 en environnement staging pour tester la migration des données avant la bascule production. Inclut réplication, monitoring et accès sécurisés.",
    dept: "CTO", bot: "Tim", pct: 100,
    team: ["Tim (CTO)"],
    livrables: [
      { titre: "Serveur PostgreSQL 16 — staging configuré",  format: "Infra",  status: "Livré", date: "15 avr" },
      { titre: "Script de réplication master→replica",        format: "Shell",  status: "Livré", date: "16 avr" },
      { titre: "Dashboard monitoring Grafana",                format: "Config", status: "Livré", date: "17 avr" },
    ],
    historique: [
      { date: "17 avr", action: "Dashboard monitoring en place — alertes configurées", bot: "Tim",    type: "creation" },
      { date: "16 avr", action: "Réplication master→replica testée — lag < 100ms",     bot: "Tim",    type: "mission" },
      { date: "15 avr", action: "PostgreSQL 16 installé et sécurisé (SSL + pg_hba)",  bot: "Tim",    type: "creation" },
      { date: "14 avr", action: "Tâche assignée à Tim par CarlOS",                    bot: "CarlOS", type: "creation" },
    ],
  },

  "Temps moyen cycle": {
    description: "Indicateur mesurant le temps moyen entre la réception d'une commande et la livraison au client. Objectif : passer de 5.8 jours à 3.5 jours en 6 mois.",
    dept: "Direction", bot: "CarlOS", pct: 72,
    team: ["CarlOS (CEO)", "Olivier (COO)", "Tim (CTO)"],
    metriques: [
      { label: "Valeur actuelle",  value: "4.2 jours", delta: "-27% vs Jan", positive: true },
      { label: "Cible",            value: "3.5 jours", delta: "juin 2026",   positive: true },
      { label: "Meilleur mois",    value: "Avril",     delta: "4.2 j",       positive: true },
      { label: "Écart à la cible", value: "0.7 j",     delta: "-17%",        positive: false },
    ],
    tendance: [
      { mois: "Jan", valeur: "5.8 j" },
      { mois: "Fév", valeur: "5.2 j" },
      { mois: "Mar", valeur: "4.9 j" },
      { mois: "Avr", valeur: "4.2 j" },
    ],
    tendanceCible: "3.5 jours",
    tendanceVariation: "-27%",
    chantiersLies: [
      { titre: "Optimisation cycle production",    dept: "Direction", pct: 42, impact: "Direct" },
      { titre: "Automatisation lignes assemblage", dept: "COO",       pct: 35, impact: "Direct" },
      { titre: "Transformation numérique usine",   dept: "CTO",       pct: 60, impact: "Indirect" },
    ],
    actions: [
      { titre: "Accélérer migration DB (bottleneck identifié)",   priorite: "Urgente", bot: "Tim",     status: "En cours" },
      { titre: "Automatiser 3 postes manuels critiques",          priorite: "Haute",   bot: "Olivier", status: "Proposée" },
      { titre: "Implémenter dashboard temps réel ligne B",        priorite: "Normale", bot: "Tim",     status: "Proposée" },
    ],
    historique: [
      { date: "28 avr", action: "Nouveau record — 4.2 jours de cycle moyen",               bot: "CarlOS",  type: "diagnostic" },
      { date: "20 avr", action: "Migration DB accélérée — impact direct sur le cycle",      bot: "Tim",     type: "mission" },
      { date: "15 avr", action: "Alerte : ligne B toujours à 6.1 jours (au-dessus cible)", bot: "Olivier", type: "reflexion" },
      { date: "1 avr",  action: "Objectif révisé : 3.5j au lieu de 4j (demande Carl)",     bot: "CarlOS",  type: "decision" },
    ],
  },

  "Capteur ligne B en panne": {
    description: "Signal critique — Le capteur de température de la ligne B ne transmet plus de données depuis 14h. Risque d'arrêt de production si non résolu sous 48h.",
    dept: "COO", bot: "Olivier", pct: 0,
    team: ["Olivier (COO)", "Tim (CTO)", "Paco (CPO)"],
    impacts: [
      { zone: "Production", severite: "Élevée",  desc: "Risque d'arrêt ligne B si non résolu sous 48h — 15 commandes en attente" },
      { zone: "Finances",   severite: "Moyenne",  desc: "Surcoût estimé 8K$/jour si arrêt prolongé — pièce de remplacement : 2.4K$" },
      { zone: "Client",     severite: "Faible",   desc: "Stock tampon de 5 jours — pas d'impact immédiat si résolu cette semaine" },
      { zone: "Sécurité",   severite: "Moyenne",  desc: "Sans capteur, la température n'est pas monitorée — risque surchauffe" },
    ],
    actions: [
      { titre: "Commander pièce de remplacement capteur B3",       priorite: "Urgente", bot: "Paco",    status: "À valider" },
      { titre: "Installer monitoring temporaire (caméra thermique)", priorite: "Urgente", bot: "Olivier", status: "En cours" },
      { titre: "Planifier maintenance préventive ligne B complète", priorite: "Haute",   bot: "Olivier", status: "Proposée" },
      { titre: "Négocier contrat maintenance fournisseur capteurs", priorite: "Normale", bot: "CarlOS",  status: "Proposée" },
    ],
    historique: [
      { date: "28 avr",  action: "Signal détecté — capteur B3 ne transmet plus depuis 14h", bot: "Tim",     type: "diagnostic" },
      { date: "28 avr",  action: "Monitoring temporaire installé (caméra thermique)",        bot: "Olivier", type: "mission" },
      { date: "28 avr",  action: "Commande pièce en attente de validation Carl",            bot: "Paco",    type: "reflexion" },
      { date: "15 mars", action: "Maintenance préventive ligne B — REPORTÉE (budget)",      bot: "Olivier", type: "decision" },
    ],
  },

  "Pipeline ventes": {
    description: "Chantier commercial — 32 opportunités actives totalisant 3.2M$. Focus sur le taux de conversion et la vélocité des deals en Q2 2026.",
    dept: "CRO", bot: "Rich", pct: 58,
    team: ["Rich (CRO)", "CarlOS (CEO)", "Mathilde (CMO)"],
    deadline: "30 juin 2026", budget: "15 000 $",
    pipeline: [
      { titre: "Prospection",   status: "done",        pct: 100, bot: "Mathilde" },
      { titre: "Qualification", status: "done",        pct: 100, bot: "Rich" },
      { titre: "Proposition",   status: "in_progress", pct: 68,  bot: "Rich" },
      { titre: "Négociation",   status: "in_progress", pct: 30,  bot: "CarlOS" },
      { titre: "Closing",       status: "pending",     pct: 0,   bot: "Rich" },
    ],
    projets: [
      { titre: "Campagne inbound Q2 — LinkedIn",        bot: "Mathilde", phase: "execution", pct: 72 },
      { titre: "Programme référencement clients actifs", bot: "Rich",     phase: "creation",  pct: 40 },
      { titre: "Automatisation CRM + scoring leads",    bot: "Tim",      phase: "reflexion", pct: 20 },
    ],
    missions: [
      { titre: "Relancer 8 deals en stagnation > 30 jours",   bot: "Rich",     urgent: true,  status: "En cours" },
      { titre: "Préparer pitch deck pour 3 prospects chauds", bot: "Mathilde", urgent: true,  status: "En cours" },
      { titre: "Analyser taux de conversion par source",       bot: "Rich",     urgent: false, status: "Planifiée" },
    ],
    metriques: [
      { label: "Pipeline total",      value: "3.2M $",   delta: "+18%", positive: true },
      { label: "Deals actifs",        value: "32",       delta: "+5",   positive: true },
      { label: "Taux conversion",     value: "24%",      delta: "+3%",  positive: true },
      { label: "Vélocité moyenne",    value: "42 jours", delta: "-8j",  positive: true },
      { label: "Deals en stagnation", value: "8",        delta: "+2",   positive: false },
      { label: "Panier moyen",        value: "98K $",    delta: "+12K", positive: true },
    ],
    documents: [
      { titre: "Rapport pipeline Q2 — semaine 17", type: "Tableur", date: "28 avr", taille: "1.2 MB" },
      { titre: "Pitch deck Prospect Alpha",         type: "PPT",     date: "25 avr", taille: "4.8 MB" },
      { titre: "Analyse conversion par canal",      type: "PDF",     date: "20 avr", taille: "890 KB" },
    ],
    historique: [
      { date: "28 avr", action: "Pipeline atteint 3.2M$ — nouveau record Q2",             bot: "Rich",     type: "diagnostic" },
      { date: "25 avr", action: "Pitch deck Prospect Alpha finalisé",                      bot: "Mathilde", type: "document" },
      { date: "22 avr", action: "2 deals closés cette semaine — 180K$ total",              bot: "Rich",     type: "decision" },
      { date: "18 avr", action: "Campagne LinkedIn lancée — 1200 leads ciblés",            bot: "Mathilde", type: "mission" },
      { date: "10 avr", action: "Stratégie Q2 validée — focus conversion + référencement", bot: "CarlOS",   type: "decision" },
    ],
  },
};

// ═══ Lookup — exact match, puis partiel, puis fallback ═══

function getCtx(context: string, focusType: string): FocusCtxData {
  if (CTX[context]) return CTX[context];
  for (const [key, data] of Object.entries(CTX)) {
    if (context.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(context.toLowerCase())) {
      return data;
    }
  }
  // Fallback générique
  return {
    description: `${context} — Élément en cours de traitement. Les données détaillées seront disponibles après synchronisation avec le backend.`,
    dept: "—", bot: "CarlOS", pct: 25,
    team: ["CarlOS (CEO)"],
    historique: [{ date: "28 avr", action: `Élément "${context}" ouvert en mode focus`, bot: "CarlOS", type: "creation" }],
  };
}

// ═══════════════════════════════════════════════════════════════
// TYPES & STRUCTURE MENU LATÉRAL
// ═══════════════════════════════════════════════════════════════

type SectionKey = "resume" | "pipeline" | "projets" | "missions" | "taches" | "livrables" | "metriques" | "tendance" | "impact" | "actions" | "documents" | "historique" | "chantiers-lies";

interface SectionDef {
  key: SectionKey;
  title: string;
  icon: React.ElementType;
}

const TYPE_SECTIONS: Record<string, SectionDef[]> = {
  chantier: [
    { key: "resume", title: "Résumé", icon: Target },
    { key: "pipeline", title: "Pipeline", icon: TrendingUp },
    { key: "projets", title: "Projets", icon: Briefcase },
    { key: "missions", title: "Missions", icon: Layers },
    { key: "metriques", title: "Métriques", icon: BarChart3 },
    { key: "documents", title: "Documents", icon: FileText },
    { key: "historique", title: "Historique", icon: Clock },
  ],
  projet: [
    { key: "resume", title: "Résumé", icon: Target },
    { key: "missions", title: "Missions", icon: Layers },
    { key: "taches", title: "Tâches", icon: CheckCircle2 },
    { key: "metriques", title: "Métriques", icon: BarChart3 },
    { key: "documents", title: "Documents", icon: FileText },
    { key: "historique", title: "Historique", icon: Clock },
  ],
  mission: [
    { key: "resume", title: "Résumé", icon: Target },
    { key: "taches", title: "Tâches", icon: CheckCircle2 },
    { key: "livrables", title: "Livrables", icon: Package },
    { key: "documents", title: "Documents", icon: FileText },
    { key: "historique", title: "Historique", icon: Clock },
  ],
  tache: [
    { key: "resume", title: "Résumé", icon: Target },
    { key: "livrables", title: "Livrables", icon: Package },
    { key: "historique", title: "Historique", icon: Clock },
  ],
  kpi: [
    { key: "resume", title: "Résumé", icon: Target },
    { key: "tendance", title: "Tendance", icon: TrendingUp },
    { key: "chantiers-lies", title: "Chantiers liés", icon: Briefcase },
    { key: "actions", title: "Actions", icon: Zap },
    { key: "historique", title: "Historique", icon: Clock },
  ],
  signal: [
    { key: "resume", title: "Résumé", icon: Target },
    { key: "impact", title: "Impact", icon: AlertTriangle },
    { key: "actions", title: "Actions", icon: Zap },
    { key: "historique", title: "Historique", icon: Clock },
  ],
};

const TYPE_LABELS: Record<string, string> = {
  chantier: "Chantier",
  projet: "Projet",
  mission: "Mission",
  tache: "Tâche",
  kpi: "Indicateur",
  signal: "Signal",
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

// ═══ Séquence des 5 phases AMORCER ═══
const PHASE_SEQUENCE = [
  { key: "discussion",  label: "Discussion",  icon: MessageCircle, color: "text-sky-700",    bg: "bg-sky-50 border-sky-200 hover:bg-sky-100" },
  { key: "reflexion",   label: "Réflexion",   icon: Target,        color: "text-orange-700", bg: "bg-orange-50 border-orange-200 hover:bg-orange-100" },
  { key: "creation",    label: "Conception",   icon: Layers,        color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" },
  { key: "execution",   label: "Exécution",   icon: Activity,      color: "text-green-700",  bg: "bg-green-50 border-green-200 hover:bg-green-100" },
  { key: "retroaction", label: "Rétroaction",  icon: BarChart3,     color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
];

interface FocusDiscussionViewProps {
  context: string;
  focusType?: string;
  onBack: () => void;
  onAdvancePhase?: (phase: string) => void;
  activePhase?: string;
}

export function FocusDiscussionView({ context, focusType = "chantier", onBack, onAdvancePhase, activePhase = "discussion" }: FocusDiscussionViewProps) {
  const sections = TYPE_SECTIONS[focusType] || TYPE_SECTIONS.chantier;
  const [activeKey, setActiveKey] = useState<SectionKey>(sections[0].key);
  const typeLabel = TYPE_LABELS[focusType] || "Élément";
  const data = getCtx(context, focusType);

  useEffect(() => { setActiveKey(sections[0].key); }, [focusType]);

  const activeIdx = sections.findIndex(s => s.key === activeKey) + 1;

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* 1. HERO COMPACT — pattern sky (discussion) */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4">
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-sky-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-blue-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <button onClick={onBack} className="mr-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0 relative z-10">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5 text-sky-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{context}</h2>
            <p className="text-[10px] text-gray-500">{typeLabel} · {data.dept || "—"} · {data.bot || "CarlOS"} — {sections.length} sections</p>
          </div>
        </div>

        {/* Phase pastilles — indicateur passif */}
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          {PHASE_SEQUENCE.map((phase) => {
            const isActive = phase.key === activePhase;
            const PIcon = phase.icon;
            return (
              <div
                key={phase.key}
                className={cn(
                  "flex items-center justify-center rounded-md transition-all",
                  isActive ? "w-7 h-7 bg-sky-100 ring-1 ring-sky-300" : "w-5 h-5 bg-gray-50"
                )}
                title={phase.label}
              >
                <PIcon className={cn("transition-all", isActive ? "h-3.5 w-3.5 text-sky-600" : "h-2.5 w-2.5 text-gray-300")} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SIDEBAR SF + CONTENU */}
      <div className="flex gap-4">
        <div className={SF.sidebarW}>
          {sections.map((s, i) => {
            const isActive = activeKey === s.key;
            return (
              <button key={s.key} onClick={() => setActiveKey(s.key)}
                className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}
              >
                <s.icon className={isActive ? SF.iconActive : SF.iconInactive} />
                <span className={isActive ? SF.labelActive : SF.labelInactive}>{i + 1}. {s.title}</span>
              </button>
            );
          })}
        </div>

        <div className={SF.content}>
          <SectionContent sectionKey={activeKey} context={context} focusType={focusType} data={data} />
        </div>
      </div>

    </div>
  );
}

// ═══ Routeur de contenu par section key ═══
function SectionContent({ sectionKey, context, focusType, data }: { sectionKey: SectionKey; context: string; focusType: string; data: FocusCtxData }) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { setAppeared(false); const t = setTimeout(() => setAppeared(true), 80); return () => clearTimeout(t); }, [sectionKey]);

  const map: Record<SectionKey, React.FC<SProps>> = {
    "resume": SectionResume,
    "pipeline": SectionPipeline,
    "projets": SectionProjets,
    "missions": SectionMissions,
    "taches": SectionTaches,
    "livrables": SectionLivrables,
    "metriques": SectionMetriques,
    "tendance": SectionTendance,
    "impact": SectionImpact,
    "actions": SectionActions,
    "documents": SectionDocuments,
    "historique": SectionHistorique,
    "chantiers-lies": SectionChantiersLies,
  };
  const Component = map[sectionKey];
  return (
    <div className={cn("transition-all duration-300", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      {Component ? <Component context={context} focusType={focusType} data={data} /> : <EmptySection label={sectionKey} />}
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-400 text-xs">
      Aucune donnée pour « {label} »
    </div>
  );
}

// ═══ Type commun pour les sections ═══
type SProps = { context: string; focusType: string; data: FocusCtxData };

// ═══ Composant utilitaire ═══
function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className={cn("text-xs font-bold", color)}>{value}</p>
      </div>
    </div>
  );
}

// ═══ 1. Résumé — adaptatif au type ET au contexte ═══
function SectionResume({ context, focusType, data }: SProps) {
  const typeLabel = TYPE_LABELS[focusType] || "Élément";
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-medium">{typeLabel}</span>
          {data.dept && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{data.dept}</span>}
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-2">{context}</h3>
        <p className="text-[11px] text-gray-600 leading-relaxed">{data.description}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Progression" value={`${data.pct}%`} icon={TrendingUp} color="text-sky-600" bg="bg-sky-50" />
        <StatCard label="Piloté par" value={data.bot} icon={Briefcase} color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Équipe" value={`${data.team.length} membres`} icon={Layers} color="text-amber-600" bg="bg-amber-50" />
      </div>
      {(data.deadline || data.budget) && (
        <div className="grid grid-cols-2 gap-3">
          {data.deadline && <StatCard label="Deadline" value={data.deadline} icon={CalendarDays} color="text-red-600" bg="bg-red-50" />}
          {data.budget && <StatCard label="Budget alloué" value={data.budget} icon={BarChart3} color="text-emerald-600" bg="bg-emerald-50" />}
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Équipe assignée</h4>
        <div className="flex flex-wrap gap-2">
          {data.team.map(bot => (
            <span key={bot} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">{bot}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ 2. Pipeline ═══
function SectionPipeline({ data }: SProps) {
  const etapes = data.pipeline || [
    { titre: "Qualification", status: "done" as const, pct: 100, bot: "CarlOS" },
    { titre: "En cours", status: "in_progress" as const, pct: 50, bot: "CarlOS" },
    { titre: "À venir", status: "pending" as const, pct: 0, bot: "CarlOS" },
  ];
  const DOT: Record<string, string> = { done: "bg-green-500", in_progress: "bg-blue-500", pending: "bg-gray-300" };
  const LABEL: Record<string, string> = { done: "Complété", in_progress: "En cours", pending: "À venir" };
  const BADGE: Record<string, string> = { done: "bg-green-100 text-green-700", in_progress: "bg-blue-100 text-blue-700", pending: "bg-gray-100 text-gray-500" };

  return (
    <div className="space-y-3">
      {etapes.map((e, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-gray-400 w-4 text-right">{i + 1}.</span>
              <div className={cn("w-2.5 h-2.5 rounded-full", DOT[e.status])} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-900">{e.titre}</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", BADGE[e.status])}>{LABEL[e.status]}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-gray-400">{e.bot}</span>
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", e.status === "done" ? "bg-green-400" : e.status === "in_progress" ? "bg-blue-400" : "bg-gray-200")} style={{ width: `${e.pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-500">{e.pct}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══ 3. Projets ═══
function SectionProjets({ data }: SProps) {
  const projets = data.projets || [];
  if (!projets.length) return <EmptySection label="projets" />;
  return (
    <div className="space-y-3">
      {projets.map((p, i) => {
        const ps = PHASE_CONFIG[p.phase as keyof typeof PHASE_CONFIG];
        return (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-gray-900">{p.titre}</span>
              </div>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", ps?.badge || "bg-gray-100 text-gray-600")}>{ps?.label || p.phase}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-400">Piloté par {p.bot}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${p.pct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-gray-600">{p.pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══ 4. Missions ═══
function SectionMissions({ data }: SProps) {
  const missions = data.missions || [];
  if (!missions.length) return <EmptySection label="missions" />;
  const SB: Record<string, string> = { "En cours": "bg-blue-100 text-blue-700", "En attente": "bg-amber-100 text-amber-700", "Planifiée": "bg-gray-100 text-gray-600", "Complétée": "bg-green-100 text-green-700" };
  return (
    <div className="space-y-1.5">
      {missions.map((m, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", m.urgent ? "bg-red-500" : "bg-transparent")} />
          <FileText className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-900">{m.titre}</span>
            <span className="text-[10px] text-gray-400 ml-2">{m.bot}</span>
          </div>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", SB[m.status] || "bg-gray-100 text-gray-600")}>{m.status}</span>
        </div>
      ))}
    </div>
  );
}

// ═══ 5. Tâches ═══
function SectionTaches({ data }: SProps) {
  const taches = data.taches || [];
  if (!taches.length) return <EmptySection label="tâches" />;
  const doneCount = taches.filter(t => t.done).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="font-medium">{doneCount}/{taches.length} complétées</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 rounded-full" style={{ width: `${(doneCount / taches.length) * 100}%` }} />
        </div>
      </div>
      {taches.map((t, i) => (
        <div key={i} className={cn("rounded-xl border bg-white px-4 py-2.5 flex items-center gap-3", t.done ? "border-green-200 bg-green-50/30" : "border-gray-200")}>
          <CheckCircle2 className={cn("h-4 w-4 shrink-0", t.done ? "text-green-500" : "text-gray-300")} />
          <div className="flex-1 min-w-0">
            <span className={cn("text-xs font-medium", t.done ? "text-gray-400 line-through" : "text-gray-900")}>{t.titre}</span>
          </div>
          <span className="text-[10px] text-gray-400 shrink-0">{t.assignee}</span>
        </div>
      ))}
    </div>
  );
}

// ═══ 6. Livrables ═══
function SectionLivrables({ data }: SProps) {
  const livrables = data.livrables || [];
  if (!livrables.length) return <EmptySection label="livrables" />;
  const SB: Record<string, string> = { "Livré": "bg-green-100 text-green-700", "En cours": "bg-blue-100 text-blue-700", "Planifié": "bg-gray-100 text-gray-600" };
  const FB: Record<string, string> = { PDF: "bg-red-100 text-red-700", Python: "bg-yellow-100 text-yellow-700", SQL: "bg-violet-100 text-violet-700", DocForge: "bg-blue-100 text-blue-700", Tableur: "bg-green-100 text-green-700", PPT: "bg-orange-100 text-orange-700", Infra: "bg-teal-100 text-teal-700", Shell: "bg-gray-200 text-gray-700", Config: "bg-purple-100 text-purple-700" };
  return (
    <div className="space-y-1.5">
      {livrables.map((l, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
          <Package className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-900">{l.titre}</span>
            {l.date !== "—" && <span className="text-[10px] text-gray-400 ml-2">{l.date}</span>}
          </div>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", FB[l.format] || "bg-gray-100 text-gray-600")}>{l.format}</span>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", SB[l.status] || "bg-gray-100 text-gray-600")}>{l.status}</span>
        </div>
      ))}
    </div>
  );
}

// ═══ 7. Métriques ═══
function SectionMetriques({ data }: SProps) {
  const metriques = data.metriques || [];
  if (!metriques.length) return <EmptySection label="métriques" />;
  return (
    <div className="grid grid-cols-2 gap-3">
      {metriques.map((m, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-[10px] text-gray-400 mb-1">{m.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900">{m.value}</span>
            <span className={cn("text-[10px] font-medium", m.positive ? "text-green-600" : "text-red-600")}>{m.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══ 8. Tendance ═══
function SectionTendance({ context, data }: SProps) {
  const points = data.tendance || [
    { mois: "Jan", valeur: "—" }, { mois: "Fév", valeur: "—" },
    { mois: "Mar", valeur: "—" }, { mois: "Avr", valeur: "—" },
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Évolution — {context}</h4>
        <div className="grid grid-cols-4 gap-3">
          {points.map((p, i) => (
            <div key={i} className="text-center">
              <div className="text-sm font-bold text-gray-900">{p.valeur}</div>
              <div className="text-[10px] text-gray-400 mt-1">{p.mois}</div>
              <div className={cn("h-1.5 rounded-full mt-2", i === points.length - 1 ? "bg-sky-400" : "bg-gray-200")} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Variation 3 mois" value={data.tendanceVariation || "—"} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Cible" value={data.tendanceCible || "À définir"} icon={Target} color="text-sky-600" bg="bg-sky-50" />
      </div>
    </div>
  );
}

// ═══ 9. Impact ═══
function SectionImpact({ data }: SProps) {
  const impacts = data.impacts || [];
  if (!impacts.length) return <EmptySection label="impact" />;
  const SB: Record<string, string> = { "Élevée": "bg-red-100 text-red-700", "Moyenne": "bg-amber-100 text-amber-700", "Faible": "bg-green-100 text-green-700" };
  return (
    <div className="space-y-1.5">
      {impacts.map((imp, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-900">{imp.zone}</span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", SB[imp.severite] || "bg-gray-100 text-gray-600")}>{imp.severite}</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">{imp.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ═══ 10. Actions ═══
function SectionActions({ data }: SProps) {
  const actions = data.actions || [];
  if (!actions.length) return <EmptySection label="actions" />;
  const PB: Record<string, string> = { "Urgente": "bg-red-100 text-red-700", "Haute": "bg-amber-100 text-amber-700", "Normale": "bg-blue-100 text-blue-700" };
  const SBa: Record<string, string> = { "À valider": "bg-amber-100 text-amber-700", "Proposée": "bg-gray-100 text-gray-600", "En cours": "bg-blue-100 text-blue-700" };
  return (
    <div className="space-y-1.5">
      {actions.map((a, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-900">{a.titre}</span>
            <span className="text-[10px] text-gray-400 ml-2">{a.bot}</span>
          </div>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", PB[a.priorite] || "bg-gray-100 text-gray-600")}>{a.priorite}</span>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", SBa[a.status] || "bg-gray-100 text-gray-600")}>{a.status}</span>
        </div>
      ))}
    </div>
  );
}

// ═══ 11. Documents ═══
function SectionDocuments({ data }: SProps) {
  const docs = data.documents || [];
  if (!docs.length) return <EmptySection label="documents" />;
  const TB: Record<string, string> = { PDF: "bg-red-100 text-red-700", DocForge: "bg-blue-100 text-blue-700", Tableur: "bg-green-100 text-green-700", PPT: "bg-orange-100 text-orange-700" };
  return (
    <div className="space-y-1.5">
      {docs.map((d, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
          <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-900">{d.titre}</span>
          </div>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0", TB[d.type] || "bg-gray-100 text-gray-600")}>{d.type}</span>
          <span className="text-[10px] text-gray-400 shrink-0 w-14 text-right">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

// ═══ 12. Historique ═══
function SectionHistorique({ data }: SProps) {
  const events = data.historique || [];
  if (!events.length) return <EmptySection label="historique" />;
  const TI: Record<string, { icon: React.ElementType; color: string }> = {
    decision:   { icon: CheckCircle2,  color: "text-green-500" },
    document:   { icon: FileText,      color: "text-blue-500" },
    mission:    { icon: Layers,        color: "text-violet-500" },
    diagnostic: { icon: Activity,      color: "text-amber-500" },
    creation:   { icon: GitBranch,     color: "text-sky-500" },
    reflexion:  { icon: AlertTriangle, color: "text-orange-500" },
  };
  return (
    <div className="space-y-0">
      {events.map((e, i) => {
        const ti = TI[e.type] || { icon: Clock, color: "text-gray-400" };
        const TIcon = ti.icon;
        return (
          <div key={i} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-[10px] text-gray-400 w-12 shrink-0 pt-0.5 text-right">{e.date}</span>
            <div className="flex flex-col items-center shrink-0">
              <TIcon className={cn("h-3.5 w-3.5", ti.color)} />
              {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-[11px] text-gray-700 leading-relaxed">{e.action}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{e.bot}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══ 13. Chantiers liés ═══
function SectionChantiersLies({ data }: SProps) {
  const chantiers = data.chantiersLies || [];
  if (!chantiers.length) return <EmptySection label="chantiers liés" />;
  const IB: Record<string, string> = { Direct: "bg-red-100 text-red-700", Indirect: "bg-gray-100 text-gray-600" };
  return (
    <div className="space-y-3">
      {chantiers.map((c, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-bold text-gray-900">{c.titre}</span>
            </div>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", IB[c.impact] || "bg-gray-100 text-gray-600")}>{c.impact}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400">{c.dept}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${c.pct}%` }} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">{c.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
