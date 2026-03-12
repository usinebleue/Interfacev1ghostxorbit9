/**
 * blueprint-config.ts — Configurations partagees pour Blueprint / Mon Bureau / Mon Reseau
 * STATUS_CONFIG, CHALEUR_CONFIG, BOT_INFO, ROLE_CONFIG, PLAYBOOK_TEMPLATES, CHANTIERS
 */

import {
  Rocket, Wrench, Shield, Package, Users, Globe,
  Target, Brain, ChevronRight,
  Flame, Bot, Code2, Eye, Zap,
  CheckCircle2, Clock, Lock,
  Layers, CreditCard, Network,
  BarChart3, Cpu,
  BookOpen, Scale, Radio, FileText, Route,
  Calendar, ListChecks,
} from "lucide-react";
import type { Chantier, PlaybookTemplate, TabDef, BlueprintTabId } from "./blueprint-types";

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

export const BLUEPRINT_TABS: TabDef[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Layers },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "chantiers", label: "Chantiers", icon: Flame },
  { id: "projets", label: "Projets", icon: Package },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "taches", label: "Taches", icon: CheckCircle2 },
  { id: "opportunites", label: "Opportunites", icon: Zap },
  { id: "equipes", label: "Equipes", icon: Users },
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
// CHANTIERS — 13 PROJETS (donnees seed de Carl)
// ================================================================

export const CHANTIERS: Chantier[] = [
  {
    id: "CH-1", num: 1, label: "Fondations & Code Propre",
    desc: "Nettoyer la base technique pour construire solide. Dette technique zero avant d'accueillir des clients.",
    icon: Wrench, color: "violet", chaleur: "brule", type: "technologique",
    responsable: "Claude Code (CTOB)", bots: ["CTOB", "CEOB"],
    objectif: "Code propre, zero dette, standards uniformes",
    timing: "Sprint 5 (immediat)",
    projets: [
      { id: "P-1.0", label: "94/94 Test Protocols", desc: "Tous protocoles valides.", status: "done", bot: "CTOB", missions: ["CTOB: 94 tests protocoles valides", "CTOB: Vite build pipeline stable"] },
      { id: "P-1.1", label: "BTML → GHML Rename", desc: "~100 remplacements dans 8 fichiers Python.", status: "done", bot: "CTOB", missions: ["CTOB: Script rename_terms.py automatise", "CTOB: Backup + execution 8 fichiers", "CTOB: Tests pytest + deploy", "Carl: Validation post-rename"] },
      { id: "P-1.2", label: "Elimination BCC/BPO Intrus", desc: "~111 occurrences de bots fantomes.", status: "done", bot: "CTOB", missions: ["CTOB: Grep BCC/BPO partout", "CTOB: Supprimer frontend + backend", "CTOB: Build + tests"] },
      { id: "P-1.3", label: "CSS Standardisation", desc: "Audit composants vs design-system.md.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Audit page par page (27 vues)", "CTOB: Corriger ecarts vs design-system.md", "CTOB: Verification cross-page"] },
      { id: "P-1.4", label: "Tests & Couverture", desc: "CI frontend.", status: "en-cours", bot: "CTOB", missions: ["CTOB: Fixer 3 failures test_bridge.py", "CTOB: CI frontend (vite build check)", "CTOB: Valider 94/94 test_protocols.py"] },
      { id: "P-1.5", label: "Core Type System (D-108)", desc: "Types TypeScript standardises.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Schema types centraux", "CTOB: Validation Zod sur API responses", "CTOB: Eliminer les any/unknown"] },
    ],
  },
  {
    id: "CH-2", num: 2, label: "Securite & Infrastructure",
    desc: "Production-grade: auth, separation dev/live, stabilite vocale, telephonie.",
    icon: Shield, color: "red", chaleur: "brule", type: "technologique",
    responsable: "Claude Code (CTOB)", bots: ["CTOB", "CISOB", "CEOB"],
    objectif: "Multi-user auth, infra stable, zero downtime",
    timing: "Sprint 5-6", dependances: ["CH-1"],
    projets: [
      { id: "P-2.A", label: "Sprint Securite B.8", desc: "UFW, CORS, API key rotation, rate limit.", status: "done", bot: "CTOB", missions: ["CTOB: UFW + CORS + rate limit", "CTOB: Login server-side SHA256"] },
      { id: "P-2.B", label: "Architecture 2 VPS B.9", desc: "VPS2 production, VPS1 dev.", status: "done", bot: "CTOB", missions: ["CTOB: VPS2 PostgreSQL + Nginx + SSL", "CTOB: DNS app.usinebleue.ai → VPS2"] },
      { id: "P-2.C", label: "Telephonie Twilio B.10", desc: "bridge_phone.py + NIP N2.", status: "done", bot: "CTOB", missions: ["CTOB: bridge_phone.py + endpoints", "CTOB: phone_auth DB + NIP"] },
      { id: "P-2.1", label: "JWT Authentication Multi-User", desc: "Remplacer login statique par JWT.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Schema JWT", "CTOB: Middleware auth FastAPI", "CTOB: Frontend auth context"] },
      { id: "P-2.2", label: "Separation Dev / Live", desc: "14 bloqueurs identifies.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Audit 14 bloqueurs", "CTOB: Variables .env pour chemins"] },
      { id: "P-2.3", label: "Voice Stability (B.4.7)", desc: "Coupure 2min. BLOQUANT demos.", status: "bloque", bot: "CTOB", bloque_par: "Test vocal avec Carl", missions: ["CTOB: Heartbeat keepalive", "Carl: Test appel vocal 10+ min"] },
      { id: "P-2.4", label: "Migration Telnyx", desc: "bridge_telnyx.py PRET.", status: "bloque", bot: "CTOB", bloque_par: "Carl: compte Telnyx", missions: ["Carl: Creer compte Telnyx", "CTOB: 4 vars .env"] },
      { id: "P-2.5", label: "Status Page & Monitoring", desc: "Page publique + alertes.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Endpoint /health enrichi", "CTOB: Page status frontend"] },
    ],
  },
  {
    id: "CH-3", num: 3, label: "Contenu & Mine d'Or",
    desc: "Les donnees qui font tourner la machine. Sans contenu structure, CarlOS = Ferrari sans essence.",
    icon: BookOpen, color: "teal", chaleur: "brule", type: "operationnel",
    responsable: "Gemini (PM)", bots: ["CEOB", "CTOB", "CSOB"],
    objectif: "Contenu reel injectable dans chaque bot et chaque flow",
    timing: "Sprint 5-6",
    projets: [
      { id: "P-3.1", label: "7 Catalogues JSON", desc: "diagnostics, gaps, missions, templates.", status: "a-faire", bot: "CTOB", missions: ["Gemini: Generer diagnostics-universels.json", "CTOB: Generer templates-documentaires.json"] },
      { id: "P-3.2", label: "Contenu Sectoriel par Industrie", desc: "MFG, alimentation, metal — benchmarks.", status: "a-faire", bot: "CSOB", missions: ["Gemini: Recherche benchmarks par SCIAN", "CTOB: Injecter dans company kits JSON"] },
      { id: "P-3.3", label: "Protocole Usine Bleue Digitalise", desc: "mine-dor/ 58 fichiers → injectables.", status: "a-faire", bot: "CEOB", missions: ["CEOB: Parser CREDO 296p en modules", "CTOB: Schema injection prompt"] },
      { id: "P-3.5", label: "Company Kits Standardises", desc: "Schema universel. 2 kits demo existants.", status: "en-cours", bot: "CTOB", missions: ["CTOB: Schema JSON standardise", "Carl: Valider avec 3 entreprises"] },
      { id: "P-3.6", label: "Mega Prompts V3", desc: "7 mega prompts. 1+2 DONE. 3-7 a faire.", status: "en-cours", bot: "CEOB", missions: ["Gemini: Prompts 3-7"] },
    ],
  },
  {
    id: "CH-4", num: 4, label: "Produit Complet",
    desc: "Remplacer TOUS les mocks par des donnees reelles. Chaque ecran fonctionne a 100%.",
    icon: Package, color: "blue", chaleur: "brule", type: "technologique",
    responsable: "Claude Code (CTOB)", bots: ["CTOB", "CEOB", "COOB"],
    objectif: "Zero mock, zero placeholder, tout est reel",
    timing: "Sprint 6", dependances: ["CH-1", "CH-2", "CH-3"],
    projets: [
      { id: "P-4.A", label: "LiveChat Complet B.1", desc: "Branches d'idees, sentinelle, cristallisation.", status: "done", bot: "CTOB", missions: ["CTOB: LiveChat multi-branch + sentinelle"] },
      { id: "P-4.B", label: "12 Bots + Sidebar V2", desc: "12 bots C-Level + Sidebar V2.", status: "done", bot: "CTOB", missions: ["CTOB: 12 bots C-Level", "CTOB: Sidebar V2"] },
      { id: "P-4.C", label: "COMMAND Engine C.10", desc: "bridge_command.py LIVE.", status: "done", bot: "CTOB", missions: ["CTOB: bridge_command.py", "CTOB: 4 endpoints API COMMAND"] },
      { id: "P-4.D", label: "Orbit9 Matching C.12", desc: "3 tables + 15 endpoints.", status: "done", bot: "CTOB", missions: ["CTOB: 15 endpoints REST", "CTOB: Scoring Gemini Flash"] },
      { id: "P-4.E", label: "Mon Bureau Reel S36", desc: "PostgreSQL + Plane.so + upload.", status: "done", bot: "CTOB", missions: ["CTOB: PostgreSQL tables", "CTOB: Integration Plane.so"] },
      { id: "P-4.F", label: "Espace Unifie S46", desc: "MesChantiersView + 141 templates.", status: "done", bot: "CTOB", missions: ["CTOB: MesChantiersView 4 tabs", "CTOB: 141 templates enrichis"] },
      { id: "P-4.1", label: "CockpitView KPIs Reels", desc: "Remplacer MOCK_STATS.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Endpoint /cockpit/kpis", "CTOB: Wirer CockpitView.tsx"] },
      { id: "P-4.3", label: "COMMAND Frontend Complet", desc: "Progression, delegation.", status: "en-cours", bot: "CTOB", missions: ["CTOB: CommandLaunchBanner stages", "CTOB: Mission delegation cards"] },
      { id: "P-4.4", label: "Templates Lego", desc: "141 templates editables.", status: "a-faire", bot: "CTOB", missions: ["CTOB: UI editeur template", "CTOB: Export PDF/DOCX"] },
      { id: "P-4.6", label: "Focus Mode & Canvas WOW", desc: "FocusModeLayout.", status: "a-faire", bot: "CTOB", missions: ["CTOB: FocusModeLayout.tsx", "CTOB: Document Canvas"] },
      { id: "P-4.7", label: "CarlOSPresence 34 Sections", desc: "Messages contextuels.", status: "en-cours", bot: "CEOB", missions: ["CEOB: Messages 12 departements", "CEOB: Flow prompts 6 sections ACTION"] },
    ],
  },
  {
    id: "CH-5", num: 5, label: "Intelligence des Agents",
    desc: "Rendre chaque bot UTILE. La difference entre un chatbot et un vrai conseiller C-Level.",
    icon: Cpu, color: "indigo", chaleur: "brule", type: "technologique",
    responsable: "Gemini (PM) + Claude Code", bots: ["CTOB", "CEOB", "CSOB"],
    objectif: "12 bots specialises, SOULs riches, trisociation effective",
    timing: "Sprint 5-7", dependances: ["CH-3"],
    projets: [
      { id: "P-5.A", label: "Gouvernance Phase 1 C.9", desc: "decision_log + API + hooks.", status: "done", bot: "CTOB", missions: ["CTOB: Table decision_log", "CTOB: 4 endpoints CRUD decisions"] },
      { id: "P-5.1", label: "SOULs Enrichis 12 Bots", desc: "CEOB a 10,130 chars. Les 6 nouveaux = squelettes.", status: "a-faire", bot: "CEOB", missions: ["Gemini: Generer SOUL enrichi par bot", "CTOB: Deployer SOULs"] },
      { id: "P-5.2", label: "Trisociation Effective", desc: "3 OS par bot injectes dans le prompt.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Injecter OS triplet dans system prompt", "CTOB: Test qualite reponses avant/apres"] },
      { id: "P-5.4", label: "36 Teintures Cognitives", desc: "Herrmann quadrants x 9 modes = 36.", status: "a-faire", bot: "CTOB", missions: ["CTOB: UI selecteur teintures", "CTOB: Injection teinture dans prompt"] },
      { id: "P-5.5", label: "Comportement D1/D2/D3", desc: "Soldat → Lieutenant → Partenaire.", status: "a-faire", bot: "CEOB", missions: ["CEOB: Regles escalade D1→D2→D3", "CTOB: Implementation bridge_command.py"] },
    ],
  },
  {
    id: "CH-6", num: 6, label: "Playbooks & Parcours Client",
    desc: "Parcours zero-touch M1→M2→M3. CarlOS GPS guide le client.",
    icon: Target, color: "emerald", chaleur: "brule", type: "organisationnel",
    responsable: "CarlOS (CEOB)", bots: ["CEOB", "CFOB", "CMOB", "COOB"],
    objectif: "Client autonome en 90 jours",
    timing: "Sprint 6-7", dependances: ["CH-3", "CH-4", "CH-5"],
    projets: [
      { id: "P-6.1", label: "CarlOS GPS Engine", desc: "CarlOS propose, guide, insiste, relance.", status: "a-faire", bot: "CEOB", missions: ["CEOB: Detecteur 'temps d'agir'", "CEOB: Tolerance au chaos"] },
      { id: "P-6.2", label: "Blueprint #1 — BoostCamp", desc: "Premier Blueprint OBLIGATOIRE. Onboarding.", status: "a-faire", bot: "CEOB", missions: ["CEOB: Accueil BoostCamp", "CEOB: Diagnostic VITAA express"] },
      { id: "P-6.5", label: "Bibliotheque Playbooks", desc: "30 universels + 15 sectoriels.", status: "en-cours", bot: "CTOB", missions: ["CTOB: API /playbooks/deploy", "CTOB: UI selection + deploy"] },
      { id: "P-6.6", label: "Box Progressives (D-075)", desc: "Onboarding DOMINO.", status: "a-faire", bot: "CEOB", missions: ["CEOB: Design 7 etapes onboarding", "CTOB: Splash screen bienvenue"] },
    ],
  },
  {
    id: "CH-7", num: 7, label: "Gouvernance & Compliance",
    desc: "Loi 25, audit trail, SLA.",
    icon: Scale, color: "gray", chaleur: "couve", type: "organisationnel",
    responsable: "Louise (CLOB)", bots: ["CLOB", "CISOB", "CEOB"],
    objectif: "Compliance Loi 25, SLA contractuel",
    timing: "Sprint 7", dependances: ["CH-2"],
    projets: [
      { id: "P-7.1", label: "Loi 25 Compliance", desc: "Consentement, retention, suppression.", status: "a-faire", bot: "CLOB", missions: ["CLOB: Politique consentement", "CTOB: Export/suppression donnees"] },
      { id: "P-7.2", label: "Documents Legaux", desc: "ToS, Privacy Policy, contrats.", status: "a-faire", bot: "CLOB", missions: ["CLOB: Rediger ToS", "CLOB: Rediger Privacy Policy"] },
      { id: "P-7.3", label: "Audit Trail Client", desc: "Qui a fait quoi, quand, pourquoi.", status: "a-faire", bot: "CISOB", missions: ["CISOB: Table audit_log", "CTOB: Middleware logging"] },
    ],
  },
  {
    id: "CH-8", num: 8, label: "Communication Unifiee",
    desc: "Voice + Video + Chat + Tel + Canvas en UNE experience fluide.",
    icon: Radio, color: "rose", chaleur: "couve", type: "technologique",
    responsable: "Claude Code (CTOB)", bots: ["CTOB", "CEOB"],
    objectif: "Experience fluide cross-canal",
    timing: "Sprint 7-8", dependances: ["CH-2", "CH-4"],
    projets: [
      { id: "P-8.A", label: "Voice Pipeline Complet", desc: "LiveKit + Deepgram + ElevenLabs + Tavus.", status: "done", bot: "CTOB", missions: ["CTOB: LiveKit agent + 12 voix", "CTOB: Canvas auto-nav"] },
      { id: "P-8.B", label: "Transcription Meetings B.5", desc: "Whisper transcription.", status: "done", bot: "CTOB", missions: ["CTOB: Whisper pipeline", "CTOB: Stockage transcripts"] },
      { id: "P-8.1", label: "Continuite Cross-Canal", desc: "Vocal → chat → visio sans perdre contexte.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Session unifiee", "CTOB: Handoff vocal→chat"] },
      { id: "P-8.3", label: "Notifications & Alertes", desc: "Push/email quand CarlOS complete une mission.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Notification system", "CEOB: Alertes proactives"] },
    ],
  },
  {
    id: "CH-9", num: 9, label: "Moteur Commercial",
    desc: "Lancer les 9 pioneers. Stripe billing. Marketing viral.",
    icon: CreditCard, color: "pink", chaleur: "couve", type: "strategique",
    responsable: "Carl (N1)", bots: ["CEOB", "CMOB", "CSOB", "CFOB"],
    objectif: "9 pioneers signes, revenue recurrent",
    timing: "Sprint 7", dependances: ["CH-4", "CH-6"],
    projets: [
      { id: "P-9.1", label: "Stripe Billing", desc: "3 plans.", status: "a-faire", bot: "CFOB", missions: ["CFOB: Stripe products", "CTOB: Checkout + webhooks"] },
      { id: "P-9.2", label: "Pioneer Circle (9 Places)", desc: "Lancement exclusif.", status: "a-faire", bot: "CMOB", missions: ["CMOB: Landing page", "Carl: Tournee 4 semaines"] },
      { id: "P-9.4", label: "Demo Library Complete", desc: "11 entreprises QC reelles.", status: "en-cours", bot: "CMOB", missions: ["CMOB: Valider 11 company kits", "CTOB: Mode demo sandbox"] },
    ],
  },
  {
    id: "CH-10", num: 10, label: "Orbit9 & Reseau",
    desc: "Effet de reseau: matching reel, circles, ambassadeurs.",
    icon: Network, color: "orange", chaleur: "couve", type: "strategique",
    responsable: "CarlOS (CEOB)", bots: ["CEOB", "CROB", "CSOB", "CFOB"],
    objectif: "Matching reel ecosysteme QC",
    timing: "Sprint 7-8", dependances: ["CH-6", "CH-9"],
    projets: [
      { id: "P-10.1", label: "Scout Reel Ecosysteme QC", desc: "iCRIQ + REAI.", status: "a-faire", bot: "CROB", missions: ["CROB: Source iCRIQ 13,694", "CTOB: Integration orbit9_matches"] },
      { id: "P-10.3", label: "Cellules CRUD Frontend", desc: "Creer/gerer cellules.", status: "a-faire", bot: "CTOB", missions: ["CTOB: UI creation cellule", "CTOB: Dashboard cellule"] },
      { id: "P-10.6", label: "Chantiers Inter-Entreprises", desc: "Chantier partage mfg + fournisseur.", status: "a-faire", bot: "CEOB", missions: ["CEOB: Detection gaps", "CTOB: Schema chantier partage"] },
      { id: "P-10.7", label: "Missions Ouvertes — Prime Spot", desc: "Tableau fournisseurs.", status: "a-faire", bot: "CEOB", missions: ["CTOB: Flag mission ouverte", "CTOB: Tableau Missions Ouvertes"] },
    ],
  },
  {
    id: "CH-11", num: 11, label: "Documentation & Bibles Vivantes",
    desc: "La doc SE MET A JOUR toute seule.",
    icon: FileText, color: "green", chaleur: "couve", type: "operationnel",
    responsable: "Gemini (PM)", bots: ["CTOB", "CEOB"],
    objectif: "Documentation auto-update, Help Center",
    timing: "Sprint 7-8", dependances: ["CH-4"],
    projets: [
      { id: "P-11.1", label: "A.5 Bible Visuelle Cible", desc: "131 slots a remplir.", status: "en-cours", bot: "CTOB", missions: ["Carl: Remplir les 131 slots", "CTOB: Rendre slots interactifs"] },
      { id: "P-11.2", label: "Help Center Client-Facing", desc: "FAQ, tutoriels, guides.", status: "a-faire", bot: "CMOB", missions: ["CMOB: Rediger FAQ", "CTOB: Interface Help Center"] },
      { id: "P-11.3", label: "API Documentation", desc: "Swagger live.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Swagger auto-genere", "CTOB: Webhook documentation"] },
    ],
  },
  {
    id: "CH-12", num: 12, label: "Oracle9 & Intelligence Predictive",
    desc: "4 couches: Chercheur → Sondeur → Analyste → Oracle.",
    icon: Brain, color: "amber", chaleur: "meurt", type: "technologique",
    responsable: "Gemini (PM)", bots: ["CTOB", "CINOB", "CSOB"],
    objectif: "Predictions industrielles basees sur donnees reelles QC",
    timing: "Sprint 8+", dependances: ["CH-10"],
    projets: [
      { id: "P-12.1", label: "Couche 1: Le Chercheur", desc: "Web scraping ISQ, StatCan.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Playwright scraper ISQ", "CTOB: StatCan WDS connector"] },
      { id: "P-12.2", label: "Couche 2: Le Sondeur", desc: "Micro-surveys via LiveChat + voice.", status: "a-faire", bot: "CINOB", missions: ["CINOB: Questions passives", "CTOB: Stockage oracle9_surveys"] },
      { id: "P-12.4", label: "Couche 4: L'Oracle", desc: "Predictions statistiques.", status: "a-faire", bot: "CINOB", missions: ["CTOB: statsforecast/Nixtla", "CTOB: Rapports WeasyPrint"] },
    ],
  },
  {
    id: "CH-13", num: 13, label: "Scale & Expansion (9 → 81+)",
    desc: "Multi-tenant, marketplace experts, fonds institutionnels.",
    icon: Globe, color: "cyan", chaleur: "meurt", type: "strategique",
    responsable: "Carl (N1)", bots: ["CEOB", "CSOB", "CFOB", "CROB"],
    objectif: "De 9 pioneers a 81+ clients, revenue 1M$+ Y1",
    timing: "Sprint 8+", dependances: ["CH-9", "CH-10"],
    projets: [
      { id: "P-13.1", label: "Multi-Tenant RBAC", desc: "Row-Level Security.", status: "a-faire", bot: "CTOB", missions: ["CTOB: RLS policies", "CTOB: Tenant isolation"] },
      { id: "P-13.2", label: "Instance Fonds (Niveau 2)", desc: "9 fonds cibles.", status: "a-faire", bot: "CSOB", missions: ["CSOB: Approche Teralys", "CFOB: Package pricing"] },
      { id: "P-13.3", label: "Expert Marketplace", desc: "Avocats, comptables, ingenieurs.", status: "a-faire", bot: "CLOB", missions: ["CLOB: Schema expert_profiles", "CTOB: Matching expert↔besoin"] },
      { id: "P-13.5", label: "API Catalogue Client", desc: "Catalogues produits → matching Orbit9.", status: "a-faire", bot: "CTOB", missions: ["CTOB: Schema catalogue standardise", "CROB: Matching produit↔besoin"] },
    ],
  },
];

// ================================================================
// COMPUTED STATS
// ================================================================

export const NB_PROJETS = CHANTIERS.length;
export const NB_MISSIONS = CHANTIERS.reduce((s, ch) => s + ch.projets.length, 0);
export const NB_TACHES = CHANTIERS.reduce((s, ch) => s + ch.projets.reduce((s2, p) => s2 + p.missions.length, 0), 0);
export const MISSIONS_DONE = CHANTIERS.reduce((s, ch) => s + ch.projets.filter((p) => p.status === "done").length, 0);
export const MISSIONS_EN_COURS = CHANTIERS.reduce((s, ch) => s + ch.projets.filter((p) => p.status === "en-cours").length, 0);

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
