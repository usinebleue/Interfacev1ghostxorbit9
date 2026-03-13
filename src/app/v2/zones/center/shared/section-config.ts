/**
 * section-config.ts — Configurations partagees pour Strategique / Mon Bureau / Mon Reseau
 * STATUS_CONFIG, CHALEUR_CONFIG, BOT_INFO, ROLE_CONFIG, PLAYBOOK_TEMPLATES
 */

import {
  Flame, Clock, Lock,
  Layers, Package, Users,
  Zap, CheckCircle2, ListChecks,
  Calendar, FileText, Rocket, Stethoscope, BookOpen,
  Building2, Target,
} from "lucide-react";
import type { PlaybookTemplate, TabDef } from "./section-types";

// ================================================================
// STATUS & CHALEUR CONFIGS
// ================================================================

export const STATUS_CONFIG = {
  "done": { label: "DONE", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  "en-cours": { label: "EN COURS", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  "a-faire": { label: "A FAIRE", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  "bloque": { label: "BLOQUE", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

export const CHALEUR_CONFIG = {
  "brule": { label: "BRULE", icon: Flame, color: "text-red-500" },
  "couve": { label: "COUVE", icon: Clock, color: "text-amber-500" },
  "meurt": { label: "MEURT", icon: Lock, color: "text-gray-400" },
};

export const BOT_INFO: Record<string, { label: string; short: string; gradient: string }> = {
  Carl: { label: "Carl", short: "CEO", gradient: "from-slate-800 to-slate-700" },
  Gemini: { label: "Gemini", short: "PM", gradient: "from-sky-600 to-sky-500" },
  CEOB: { label: "CarlOS", short: "CEO Bot", gradient: "from-blue-600 to-blue-500" },
  CTOB: { label: "Thierry", short: "CTO", gradient: "from-violet-600 to-violet-500" },
  CFOB: { label: "Francois", short: "CFO", gradient: "from-emerald-600 to-emerald-500" },
  CMOB: { label: "Martine", short: "CMO", gradient: "from-pink-600 to-pink-500" },
  CSOB: { label: "Sophie", short: "CSO", gradient: "from-red-600 to-red-500" },
  COOB: { label: "Olivier", short: "COO", gradient: "from-orange-600 to-orange-500" },
  CPOB: { label: "Fabien", short: "CPO", gradient: "from-amber-600 to-amber-500" },
  CHROB: { label: "Helene", short: "CHRO", gradient: "from-teal-600 to-teal-500" },
  CINOB: { label: "Ines", short: "CINO", gradient: "from-rose-600 to-rose-500" },
  CROB: { label: "Raphael", short: "CRO", gradient: "from-amber-600 to-amber-500" },
  CLOB: { label: "Louise", short: "CLO", gradient: "from-indigo-600 to-indigo-500" },
  CISOB: { label: "Sebastien", short: "CISO", gradient: "from-gray-600 to-gray-500" },
};

export const ROLE_CONFIG = {
  "master":     { label: "CarlOS (Master)", badge: "MASTER", bg: "bg-blue-600", border: "border-blue-300", hover: "hover:border-blue-400 hover:bg-blue-50/30", ring: "ring-blue-200" },
  "humain-ceo": { label: "Humain (CEO)", badge: "CEO", bg: "bg-slate-700", border: "border-slate-300", hover: "hover:border-slate-400 hover:bg-slate-50", ring: "ring-slate-200" },
  "humain-pm":  { label: "Humain (PM)", badge: "PM", bg: "bg-sky-600", border: "border-sky-300", hover: "hover:border-sky-400 hover:bg-sky-50", ring: "ring-sky-200" },
  "bot":        { label: "Bot C-Level", badge: "BOT", bg: "bg-violet-500", border: "border-violet-200", hover: "hover:border-violet-300 hover:bg-violet-50/30", ring: "ring-violet-200" },
  "externe":    { label: "Externe", badge: "EXT", bg: "bg-orange-500", border: "border-orange-200", hover: "hover:border-orange-400 hover:bg-orange-50", ring: "ring-orange-200" },
};

export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "strategique": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "technologique": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  "organisationnel": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "operationnel": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

// ================================================================
// TABS
// ================================================================

export const BLUEPRINT_NAV_TABS: TabDef[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Layers },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "chantiers", label: "Chantiers", icon: Flame },
  { id: "projets", label: "Projets", icon: Package },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "taches", label: "Taches", icon: CheckCircle2 },
  { id: "opportunites", label: "Opportunites", icon: Zap },
  { id: "equipes", label: "Equipes", icon: Users },
];

export const BLUEPRINT_TABS: TabDef[] = [
  { id: "sommaire", label: "Sommaire", icon: Building2 },
  { id: "objectifs", label: "Objectifs", icon: Target },
  { id: "overview", label: "Vue d'ensemble", icon: Layers },
  { id: "chantiers", label: "Chantiers", icon: Flame },
  { id: "projets", label: "Projets", icon: Package },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "taches", label: "Taches", icon: CheckCircle2 },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "playbooks", label: "Playbooks", icon: Rocket },
  { id: "diagnostics", label: "Diagnostics", icon: Stethoscope },
  { id: "equipe", label: "Equipe", icon: Users },
];

// ================================================================
// PLAYBOOK TEMPLATES
// ================================================================

export const PLAYBOOK_TEMPLATES: PlaybookTemplate[] = [
  // Chantier-level playbooks
  { id: "PB-001", titre: "Transformation Numerique Complete", description: "Plan complet pour digitaliser les operations d'une PME manufacturiere. De l'audit initial au deploiement des outils.", type: "technologique", industrie: "manufacturier", bots: ["CTOB", "COOB", "CEOB"], nb_projets: 5, nb_missions: 22, duree: "6-12 mois", populaire: true, niveau: "chantier" },
  { id: "PB-002", titre: "Sprint Securite & Conformite", description: "Audit securite complet, mise en conformite, formation equipe. Du scan vulnerabilites au rapport final.", type: "technologique", industrie: null, bots: ["CISOB", "CTOB", "CLOB"], nb_projets: 3, nb_missions: 14, duree: "2-3 mois", populaire: true, niveau: "chantier" },
  { id: "PB-003", titre: "Lancement Nouveau Produit", description: "De l'idee au marche: R&D, pricing, plan marketing, pipeline ventes, formation equipe.", type: "strategique", industrie: null, bots: ["CMOB", "CSOB", "CFOB"], nb_projets: 4, nb_missions: 18, duree: "3-6 mois", populaire: true, niveau: "chantier" },
  { id: "PB-004", titre: "Restructuration Organisationnelle", description: "Reorganiser l'equipe, les processus et la culture. Inclut plan RH, communication interne, formation.", type: "organisationnel", industrie: null, bots: ["CHROB", "COOB", "CEOB"], nb_projets: 3, nb_missions: 12, duree: "3-4 mois", niveau: "chantier" },
  { id: "PB-005", titre: "Expansion Marche International", description: "Etude de marche, reglementation, partenaires locaux, adaptation produit, plan go-to-market.", type: "strategique", industrie: null, bots: ["CSOB", "CMOB", "CLOB"], nb_projets: 4, nb_missions: 16, duree: "6-12 mois", populaire: true, niveau: "chantier" },
  { id: "PB-006", titre: "Automatisation Usine 4.0", description: "Plan complet d'automatisation: audit OEE, selection robots, integration MES, formation operateurs.", type: "operationnel", industrie: "manufacturier", bots: ["COOB", "CTOB", "CPOB"], nb_projets: 5, nb_missions: 24, duree: "6-18 mois", populaire: true, niveau: "chantier" },
  // Projet-level playbooks
  { id: "PB-P01", titre: "Audit Lean Manufacturing", description: "Audit 150 points couvrant les 7 gaspillages, 5S, Kanban. Rapport + plan d'action priorise.", type: "operationnel", industrie: "manufacturier", bots: ["COOB", "CPOB"], nb_projets: 1, nb_missions: 8, duree: "2-4 semaines", niveau: "projet" },
  { id: "PB-P02", titre: "Plan Marketing Digital", description: "SEO, SEM, reseaux sociaux, email marketing, analytics. De la strategie a l'execution.", type: "strategique", industrie: null, bots: ["CMOB", "CTOB"], nb_projets: 1, nb_missions: 10, duree: "1-2 mois", niveau: "projet" },
  { id: "PB-P03", titre: "Due Diligence Acquisition", description: "Analyse financiere, juridique, operationnelle et RH d'une cible d'acquisition.", type: "strategique", industrie: null, bots: ["CFOB", "CLOB", "CSOB"], nb_projets: 1, nb_missions: 12, duree: "4-8 semaines", niveau: "projet" },
  { id: "PB-P04", titre: "Implementation ERP/MES", description: "Selection, configuration, migration donnees, formation, go-live. Template adapte manufacturier.", type: "technologique", industrie: "manufacturier", bots: ["CTOB", "COOB"], nb_projets: 1, nb_missions: 14, duree: "3-6 mois", niveau: "projet" },
  // Mission-level playbooks
  { id: "PB-M01", titre: "Analyse Concurrentielle", description: "Cartographie des concurrents, SWOT, positionnement. Livrable: rapport + recommandations.", type: "strategique", industrie: null, bots: ["CSOB"], nb_projets: 1, nb_missions: 1, duree: "1-2 semaines", niveau: "mission" },
  { id: "PB-M02", titre: "Budget Projet Detaille", description: "Ventilation couts, timeline, ROI, scenarios optimiste/pessimiste. Template financier complet.", type: "strategique", industrie: null, bots: ["CFOB"], nb_projets: 1, nb_missions: 1, duree: "3-5 jours", niveau: "mission" },
  { id: "PB-M03", titre: "Rapport Visite Usine", description: "Template structure: observations terrain, mesures, photos, recommandations, plan action.", type: "operationnel", industrie: "manufacturier", bots: ["CPOB", "COOB"], nb_projets: 1, nb_missions: 1, duree: "1-2 jours", niveau: "mission" },
  { id: "PB-M04", titre: "Specification Technique", description: "Cahier des charges complet: exigences, contraintes, interfaces, criteres d'acceptation.", type: "technologique", industrie: null, bots: ["CTOB"], nb_projets: 1, nb_missions: 1, duree: "1 semaine", niveau: "mission" },
  // Tache-level playbooks
  { id: "PB-T01", titre: "Checklist 5S", description: "25 criteres d'evaluation 5S avec scoring. Pret a deployer sur le plancher.", type: "operationnel", industrie: "manufacturier", bots: ["COOB"], nb_projets: 1, nb_missions: 1, duree: "2h", niveau: "tache" },
  { id: "PB-T02", titre: "Grille Evaluation Fournisseur", description: "Criteres qualite, delais, prix, service. Scoring pondere automatise.", type: "operationnel", industrie: null, bots: ["CPOB", "CFOB"], nb_projets: 1, nb_missions: 1, duree: "1h", niveau: "tache" },
  { id: "PB-T03", titre: "Post-Mortem Projet", description: "Template structure: ce qui a marche, ce qui n'a pas marche, lecons apprises, actions.", type: "organisationnel", industrie: null, bots: ["CTOB", "COOB"], nb_projets: 1, nb_missions: 1, duree: "2h", niveau: "tache" },
  { id: "PB-T04", titre: "Plan de Communication Interne", description: "Messages cles, canaux, calendrier, responsables. Pour tout changement organisationnel.", type: "organisationnel", industrie: null, bots: ["CHROB", "CMOB"], nb_projets: 1, nb_missions: 1, duree: "3h", niveau: "tache" },
];

// ================================================================
// HELPER: parseMission
// ================================================================

export const parseMission = (m: string) => {
  const parts = m.split(": ");
  const botCode = parts.length > 1 ? parts[0] : "?";
  const text = parts.length > 1 ? parts.slice(1).join(": ") : m;
  const isHumain = botCode === "Carl" || botCode === "Gemini";
  const isExterne = text.toLowerCase().includes("fournisseur") || text.toLowerCase().includes("externe") || text.toLowerCase().includes("ouverte");
  const role: "master" | "humain-ceo" | "humain-pm" | "bot" | "externe" =
    botCode === "CEOB" ? "master" :
    botCode === "Carl" ? "humain-ceo" :
    botCode === "Gemini" ? "humain-pm" :
    isExterne ? "externe" : "bot";
  return { botCode, text, isHumain, isExterne, role, raw: m };
};
