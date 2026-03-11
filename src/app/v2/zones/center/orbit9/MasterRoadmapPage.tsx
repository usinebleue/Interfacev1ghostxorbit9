/**
 * MasterRoadmapPage.tsx — RD.1 Roadmap & Decisions
 * Tab 1: Roadmap Active (sprints, mise a niveau, orphelins, code findings, prochains sprints)
 * Tab 2: Archives (retrospective complete depuis le 22 fev)
 * Refonte S51 — audit total frontend+backend, inventaire exhaustif, no bullshit
 */

import { useState } from "react";
import {
  Map, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  Circle, ChevronRight, Zap, Target,
  CalendarDays, Flag, AlertOctagon, TrendingUp,
  Archive, Rocket, Activity, BookOpen, Milestone,
  Code2, Eye, Bug, Package,
  FileWarning, Layers, ShieldAlert, Database,
  Lightbulb, Star,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// TYPES
// ======================================================================

type TabId = "active" | "archives" | "sommaire" | "timeline" | "histoire" | "idees";

interface SubTask {
  label: string;
  status: "done" | "en-cours" | "a-faire" | "reporte" | "bloque" | "incertain" | "mock";
  note?: string;
}

interface Sprint {
  id: string;
  name: string;
  dates: string;
  status: "done" | "en-cours" | "prochain" | "pas-commence";
  summary: string;
  subtasks?: SubTask[];
}

interface Decision {
  id: string;
  title: string;
  session: string;
  impact: string;
  status: "done" | "en-cours" | "a-faire" | "abandonne" | "orphelin";
}

interface SessionEntry {
  session: string;
  date?: string;
  highlights: string[];
  sprint?: string;
}

// ======================================================================
// TAB 1 DATA — ROADMAP ACTIVE
// ======================================================================

// ── NOMENCLATURE OFFICIELLE (S51) ──
// Sprint 1 = Fondation MVP (ex-A)
// Sprint 2 = CarlOS Live (ex-B)
// Sprint 3 = Consolidation (ex-B.C)
// Sprint 4 = Pioneer Features (ex-C livre)
// Sprint 5 = Code Propre (ex-C.1) ← EN COURS
// Sprint 6 = Wiring Reel (ex-C.2)
// Sprint 7 = Auth & Scale-Ready (ex-C.3)
// Sprint 8 = Scale 9→81 (ex-D)
// Sous-taches: Sprint X.Y (ex: 2.1, 2.2, 2.3...)

const SPRINTS_ACTIVE: Sprint[] = [
  {
    id: "1",
    name: "Fondation MVP",
    dates: "22-27 fev 2026",
    status: "done",
    summary: "CarlOS fonctionnel, 14 Bots, API 8 endpoints, Telegram bridge, 5-tier routing, Bible GHML V2.3",
  },
  {
    id: "2",
    name: "CarlOS Live",
    dates: "28 fev - 2 mars",
    status: "done",
    summary: "132 endpoints, LiveChat, Voice pipeline, Video Tavus, 12 bots, 2 VPS, securite, telephonie. Taches incompletes deplacees → Sprint 5/6.",
    subtasks: [
      { label: "2.1 LiveChat complet", status: "done", note: "S24" },
      { label: "2.2 11 Bots meme pattern", status: "done", note: "S25" },
      { label: "2.3 Sidebar V2 + Cockpit", status: "done", note: "S22-23" },
      { label: "2.4-2.8 Voice pipeline complet", status: "done", note: "LiveKit + Tavus + Canvas auto-nav" },
      { label: "2.9 Telephonie Twilio", status: "done", note: "bridge_phone.py + NIP N2" },
      { label: "2.10 Transcription Meetings", status: "done" },
      { label: "2.11 Sprint Securite + 2 VPS", status: "done", note: "UFW, CORS, rate limit" },
    ],
  },
  {
    id: "3",
    name: "Consolidation",
    dates: "2 mars",
    status: "done",
    summary: "COMMAND Protocol, Gemini PM, Known issues, Roadmap V3.4, Bible Produit P12-13",
  },
  {
    id: "4",
    name: "Pioneer Features",
    dates: "3-8 mars",
    status: "done",
    summary: "COMMAND, Orbit9, Flow Engine, 3 Rooms, Espace Unifie, 31 Master GHML, Bibles Visuelles, Migration VPS2. Taches incompletes → Sprint 5.",
    subtasks: [
      { label: "4.1 Gouvernance CarlOS", status: "done", note: "decision_log + API + hooks" },
      { label: "4.2 COMMAND Engine MVP", status: "done", note: "bridge_command.py LIVE (S36)" },
      { label: "4.3 Orbit9 Matching Engine", status: "done", note: "3 tables + 15 endpoints (S37)" },
      { label: "4.4 User Flow Engine (D-101)", status: "done", note: "28 DATA + 6 ACTION (S38)" },
      { label: "4.5 3 Rooms + Migration VPS2", status: "done", note: "D-109, app.usinebleue.ai (S39-41)" },
      { label: "4.6 Espace Unifie + 141 templates", status: "done", note: "12 departements (S46)" },
      { label: "4.7 Master GHML 31 pages + Bibles Visuelles", status: "done", note: "S47-50" },
    ],
  },
];

// ── Derniere semaine ──
const SESSIONS_RECENT: SessionEntry[] = [
  { session: "S47", date: "5-6 mars", highlights: ["7 Mega Prompts V3", "Master GHML enrichi (+VITAA, +Oracle9)"] },
  { session: "S49", date: "7 mars", highlights: ["A.4 Bible Visuelle Live (17 tabs)", "Audit exhaustif headers/menus"] },
  { session: "S50", date: "8 mars", highlights: ["A.5 Bible Visuelle Cible (131 slots)", "Tab17 Console Droite"] },
  { session: "S51", date: "9 mars", highlights: ["Audit complet", "Nomenclature officielle", "6 tabs Roadmap", "Tab Histoire + Idees"] },
];

// ── Plan de sprints detaille — TOUT est ICI, plus de sections separees ──
// Ordonne par importance: ce qui est CAPITAL avant le reste
// Chaque tache porte son origine (ex-finding, ex-bloquant, ex-orphelin) pour tracabilite
const PROPOSED_SPRINTS: Sprint[] = [
  {
    id: "5",
    name: "Mise a Niveau + Code Propre",
    dates: "9 mars+ (S51 = AUJOURD'HUI)",
    status: "en-cours",
    summary: "LIGNE DE MISE A NIVEAU. Nettoyage code, normalisation UI, test vocal, routines dev. PREREQUIS a tout le reste. Inclut les taches reportees des Sprint 2-4.",
    subtasks: [
      // ── FAIT AUJOURD'HUI (S51) ──
      { label: "5.1 Audit complet code + roadmap (no bullshit)", status: "done", note: "S51" },
      { label: "5.2 Nomenclature officielle Sprint 1-8", status: "done", note: "S51" },
      { label: "5.3 Roadmap 6 tabs (Active/Archives/Sommaire/Timeline/Histoire/Idees)", status: "done", note: "S51" },
      { label: "5.4 Master GHML reorganise 4 blocs (FE/BE/RD/SA)", status: "done", note: "S51" },
      { label: "5.5 Nav C.2 integree dans A.5 Bible Visuelle Cible", status: "done", note: "S51" },
      // ── CRITIQUE — faire en premier ──
      { label: "5.6 BE: Stabilite vocale — test live (D-104)", status: "a-faire", note: "CRITIQUE — ex-bloquant #1, reporte depuis Sprint 2" },
      { label: "5.7 BE: BTML → GHML rename (8 fichiers, ~100 repl.)", status: "a-faire", note: "CRITIQUE — ex-bloquant, prevu fev, jamais fait" },
      { label: "5.8 BE+FE: Nettoyage BPO/BCC (~111 occurrences)", status: "a-faire", note: "CRITIQUE — ex-bloquant, intrus dans tout le code" },
      // ── IMPORTANT — normalisation ──
      { label: "5.9 BE: COMMAND escalation completer (75%→100%)", status: "a-faire", note: "bridge_command.py — ex-finding BE" },
      { label: "5.10 FE: Normalisation CSS vs design-system.md", status: "a-faire", note: "audit chaque page vs standards" },
      { label: "5.11 FE: PageLayout migration (11 scenario demos)", status: "a-faire", note: "ex-finding FE low-risk" },
      { label: "5.12 FE: Finaliser A.5 Bible Visuelle Cible", status: "en-cours", note: "Carl remplit les slots — reporte Sprint 4" },
      { label: "5.13 FE: Officialiser RD.2 Routine de Dev", status: "a-faire", note: "garde-fous + team setup" },
    ],
  },
  {
    id: "6",
    name: "Wiring Reel + Demo-Ready",
    dates: "~12-16 mars",
    status: "prochain",
    summary: "Remplacer TOUS les mocks par des donnees reelles. Chaque ecran fonctionnel pour demo Pioneer. Inclut les ex-findings et ex-reportes.",
    subtasks: [
      // ── HAUTE PRIORITE — ecrans principaux ──
      { label: "6.1 FE: CockpitView KPIs → API reelle", status: "a-faire", note: "HAUT — ex-bloquant, TOUS les KPIs hardcodes" },
      { label: "6.2 FE: CarlOS Pulse → /api/v1/pulse", status: "a-faire", note: "HAUT — ex-finding FE, liste vide" },
      { label: "6.3 FE: MarketplacePage bots → API reelle", status: "a-faire", note: "MOYEN — ex-finding FE, bots fictifs" },
      // ── MOYEN — ecrans secondaires ──
      { label: "6.4 FE: AgentSettings collaborateurs reels", status: "a-faire", note: "ex-finding FE, mock placeholder" },
      { label: "6.5 FE: Rooms CRUD dynamique (equipes+agenda)", status: "a-faire", note: "ex-finding FE, hardcodes" },
      { label: "6.6 FE: ScenarioHub retirer 'Bientot'", status: "a-faire", note: "ex-finding FE" },
      { label: "6.7 FE: 36 Teintures selecteur actif", status: "a-faire", note: "reporte 2x depuis Sprint 2" },
      { label: "6.8 FE: Orbit9 Cellules CRUD frontend", status: "a-faire", note: "ex-finding FE" },
      { label: "6.9 FE: Orbit9 membres cercles reels", status: "a-faire", note: "ex-finding FE, demo data" },
      { label: "6.10 FE: DepartmentTDC securite data reelle", status: "a-faire", note: "ex-finding FE, CVE hardcode" },
      // ── BACKEND — donnees reelles ──
      { label: "6.11 BE: Orbit9 Scout Bot reel (pas mock)", status: "a-faire", note: "ex-finding BE, prospects fictifs" },
      { label: "6.12 BE: Orbit9 Qualification 5 etapes", status: "a-faire", note: "ex-finding BE, skeleton" },
      { label: "6.13 BE: 7 endpoints catalogues → fichiers JSON", status: "a-faire", note: "ex-finding BE, retournent []" },
      { label: "6.14 BE: Voice auto-recovery", status: "a-faire", note: "ex-finding BE, fallback msg seulement" },
      { label: "6.15 BE: Core Type System (D-108)", status: "a-faire", note: "ex-decision en-cours" },
      { label: "6.16 FE+BE: Templates Lego dans Playbooks", status: "a-faire", note: "reporte 2x depuis Sprint 2 → absorbe par Playbook Engine" },
    ],
  },
  {
    id: "7",
    name: "Auth & Scale-Ready",
    dates: "~17-21 mars",
    status: "prochain",
    summary: "BLOQUANT SCALE. JWT + onboarding + telephonie + separation VPS. Sans JWT = pas de multi-tenant.",
    subtasks: [
      // ── BLOQUANT CRITIQUE ──
      { label: "7.1 FE+BE: JWT Auth sessions (D-094)", status: "a-faire", note: "BLOQUANT CRITIQUE — 0% code, bloque Sprint 8" },
      { label: "7.2 FE+BE: Onboarding DOMINO (D-075)", status: "a-faire", note: "HAUT — splash → quetes progressives" },
      { label: "7.3 FE+BE: Separation dev/live VPS1↔VPS2", status: "a-faire", note: "HAUT — 14 blockers identifies" },
      // ── TELEPHONIE (bloque sur Carl) ──
      { label: "7.4 BE: Telnyx credentials + wiring api_rest.py", status: "a-faire", note: "ex-bloquant, BLOQUE sur Carl" },
      { label: "7.5 BE: bridge_phone.py credentials + test", status: "a-faire", note: "ex-finding BE, stub" },
      { label: "7.6 BE: setup_sip_livekit executer", status: "a-faire", note: "ex-finding BE, jamais execute" },
      { label: "7.7 FE: Phone WebRTC (LiveControlsPanel)", status: "a-faire", note: "ex-finding FE, bouton Appel vide" },
      // ── COMPLETER ──
      { label: "7.8 FE: CarlOSInsights agenda integration", status: "a-faire", note: "ex-finding FE, bouton Lundi vide" },
      { label: "7.9 FE: MobileTabBar completer nav", status: "a-faire", note: "ex-finding FE, placeholder" },
      { label: "7.10 BE: Anti-cartel Orbit9 ameliore", status: "a-faire", note: "comparaison specialites" },
    ],
  },
  {
    id: "8",
    name: "Scale 9 → 81",
    dates: "22 mars+ (estime)",
    status: "pas-commence",
    summary: "DEPEND DE Sprint 7 (JWT). Multi-tenant, marketplace, Bot-to-Bot, auto-generation. Les orphelins business sont reintegres ici.",
    subtasks: [
      // ── FONDATION SCALE ──
      { label: "8.1 FE+BE: Multi-tenant PostgreSQL (RLS + tenant_id)", status: "a-faire", note: "depend JWT Sprint 7" },
      { label: "8.2 FE+BE: Bot-to-Bot V2 + COMMAND cross-tenant", status: "a-faire" },
      { label: "8.3 BE: Auto-generation bots GHML", status: "a-faire" },
      // ── EX-ORPHELINS REINTEGRES ──
      { label: "8.4 FE+BE: Expert Marketplace (D-069+D-070)", status: "a-faire", note: "ex-orphelin, brouillons 80%" },
      { label: "8.5 FE+BE: Bot Marketplace (D-074)", status: "a-faire", note: "ex-orphelin" },
      { label: "8.6 FE+BE: Board Room CA Robotique (D-099)", status: "a-faire", note: "design valide" },
      { label: "8.7 FE+BE: Playbook Engine (I-001)", status: "a-faire", note: "GPS invisible + deploy 1 clic" },
      { label: "8.8 FE+BE: Jitsi Meeting Intelligence (D-096)", status: "a-faire", note: "ex-orphelin" },
      { label: "8.9 BE: Stripe/Pricing (D-076)", status: "a-faire", note: "ex-orphelin" },
      { label: "8.10 BE: Nango API 5 connecteurs (D-050)", status: "a-faire", note: "ex-orphelin" },
    ],
  },
];

// ── Orphelins restes en IDEES (pas dans les sprints — trop conceptuels) ──
// D-055 Herrmann → Tab Idees I-009
// D-056 8 Modes Humour → Tab Idees I-010
// D-057 Routeur Inverse → Tab Idees I-010
// D-058 Arbre 98 Protocoles → Tab Idees I-008

// Decisions cles auditees
const DECISIONS_KEY: Decision[] = [
  { id: "D-075", title: "Onboarding Box Progressives (DOMINO)", session: "S28", impact: "UX", status: "a-faire" },
  { id: "D-078", title: "Stack Comm LiveKit+ElevenLabs+Deepgram", session: "S26", impact: "Voice", status: "done" },
  { id: "D-083", title: "Sprint Securite (UFW, CORS, rate limit)", session: "S32", impact: "Securite", status: "done" },
  { id: "D-087", title: "Architecture 2 VPS (dev + prod)", session: "S32", impact: "Infra", status: "done" },
  { id: "D-091", title: "COMMAND Protocol (bridge_command.py)", session: "S33", impact: "Core", status: "done" },
  { id: "D-094", title: "Multi-tenant + JWT Auth — BLOQUANT", session: "S33", impact: "Scale", status: "a-faire" },
  { id: "D-095", title: "Orbit9 Matching Engine (3 tables, 15 endpoints)", session: "S37", impact: "Reseau", status: "done" },
  { id: "D-097", title: "Migration Twilio → Telnyx", session: "S35", impact: "Comm", status: "a-faire" },
  { id: "D-098", title: "Protocole Gouvernance CarlOS", session: "S36", impact: "Gouvernance", status: "done" },
  { id: "D-101", title: "User Flow Engine (28 DATA + 6 ACTION)", session: "S38", impact: "Architecture", status: "done" },
  { id: "D-104", title: "Voice Stability close_on_disconnect", session: "S40", impact: "Voice", status: "en-cours" },
  { id: "D-108", title: "Core Type System", session: "S40", impact: "Architecture", status: "en-cours" },
  { id: "D-109", title: "3 Rooms Think/War/Board", session: "S41", impact: "Feature", status: "done" },
];

// ======================================================================
// TAB 2 DATA — ARCHIVES
// ======================================================================

const SESSIONS_ALL: SessionEntry[] = [
  { session: "S1", date: "22 fev", highlights: ["Bible GHML V2.3 (3115 lignes)", "TOP 100 Index Patrimoine"], sprint: "1" },
  { session: "S2", date: "22 fev", highlights: ["Architecture 3 couches (NOYAU + 6 MOD)", "context_builder.py branche"], sprint: "1" },
  { session: "S3", date: "22 fev", highlights: ["136 tests automatises", "Fix Ghost G4-G12 state machine"], sprint: "1" },
  { session: "S4", date: "22 fev", highlights: ["Factory Ghost CPOB cree", "SOUL Factory 712 lignes"], sprint: "1" },
  { session: "S8", date: "23 fev", highlights: ["OpenClaw Gateway desactive", "7 bugs fixes"], sprint: "1" },
  { session: "S11", date: "24 fev", highlights: ["PostgreSQL Direct adopte", "5 modeles database crees"], sprint: "1" },
  { session: "S13", date: "24 fev", highlights: ["MEGA-ANALYSE-FRONTEND (1098 lignes)", "4 instances detaillees"], sprint: "1" },
  { session: "S15", date: "25 fev", highlights: ["10 Fondations UX verrouillees", "Modele d'affaires SaaS consolide"], sprint: "1" },
  { session: "S16", date: "25-26 fev", highlights: ["Interface V1 polished", "Sidebar collapsible + 6 dashboards"], sprint: "1" },
  { session: "S17", date: "26 fev", highlights: ["D-050 Nango API", "D-051 5 Canaux Comm", "D-052 Onboarding Zero-Touch"], sprint: "1" },
  { session: "S18", date: "26 fev", highlights: ["D-054 Trisociation CREDO", "D-056 8 Modes Reflexion"], sprint: "1" },
  { session: "S19", date: "26 fev", highlights: ["Sprint 1 API REST finalise", "6 bots C-Level operationnels"], sprint: "1" },
  { session: "S22", date: "28 fev", highlights: ["LiveChat + Sidebar V2 + Cockpit"], sprint: "2" },
  { session: "S24", date: "28 fev", highlights: ["2.1 LiveChat COMPLET"], sprint: "2" },
  { session: "S25", date: "28 fev", highlights: ["2.2 11 Bots pattern", "Design Harmonization", "Stack Comm + Avatar"], sprint: "2" },
  { session: "S26", date: "28 fev", highlights: ["2.4 Voice LiveKit", "2.5 Pont vocal → LiveChat"], sprint: "2" },
  { session: "S27", date: "28 fev", highlights: ["2.6 Tavus video avatar", "2.7 Prompt vocal fix"], sprint: "2" },
  { session: "S28-30", date: "1 mars", highlights: ["2.8 Voice → Canvas pipeline", "Keyword router + canvas auto-nav"], sprint: "2" },
  { session: "S31", date: "1 mars", highlights: ["Demo Readiness fixes", "Known issues identifies"], sprint: "2" },
  { session: "S32", date: "2 mars", highlights: ["Sprint Securite (D-083)", "Architecture 2 VPS (D-087)"], sprint: "2" },
  { session: "S33", date: "2 mars", highlights: ["2.9 Telephonie Twilio", "Consolidation COMPLETE", "Roadmap V3.4"], sprint: "3" },
  { session: "S35", date: "2 mars", highlights: ["deploy.sh fix", "Telnyx bridge pret", "Voice stability fixes"], sprint: "4" },
  { session: "S36", date: "3 mars", highlights: ["COMMAND Engine MVP LIVE", "Espace Bureau 100% reel"], sprint: "4" },
  { session: "S37", date: "3 mars", highlights: ["Orbit9 Matching Engine LIVE", "3 tables + 15 endpoints + scoring"], sprint: "4" },
  { session: "S38", date: "3 mars", highlights: ["D-101 User Flow Engine", "28 DATA + 6 ACTION sections"], sprint: "4" },
  { session: "S39-40", date: "4 mars", highlights: ["Migration VPS2 LIVE", "DNS app.usinebleue.ai", "D-104 Voice"], sprint: "4" },
  { session: "S41", date: "4 mars", highlights: ["D-109 3 Rooms", "Voice events URL fix VPS2"], sprint: "4" },
  { session: "S42", date: "4 mars", highlights: ["Nettoyage 12 voix", "Delete endpoints", "Image Ines CINO"], sprint: "4" },
  { session: "S43", date: "5 mars", highlights: ["Architecture docs V2", "Design Bible V1"], sprint: "4" },
  { session: "S44", date: "5 mars", highlights: ["Style audit systematique", "design-system.md standardise"], sprint: "4" },
  { session: "S45", date: "5 mars", highlights: ["Frontend gate hooks", "CSS audit cross-page"], sprint: "4" },
  { session: "S46", date: "5 mars", highlights: ["Espace Unifie", "Dept Tabs 4 onglets", "141 templates"], sprint: "4" },
  { session: "S47", date: "6 mars", highlights: ["7 Mega Prompts V3", "Master GHML enrichi (+VITAA)"], sprint: "4" },
  { session: "S49-50", date: "7-8 mars", highlights: ["A.4 Bible Visuelle Live 17 tabs", "A.5 Bible Visuelle Cible 131 slots"], sprint: "4" },
  { session: "S51", date: "9 mars", highlights: ["Audit complet code+roadmap", "Master GHML 4 blocs", "Inventaire exhaustif"], sprint: "5" },
];

const MILESTONES = [
  { date: "22 fev", label: "Bible GHML V2.3 — source de verite creee", icon: BookOpen },
  { date: "26 fev", label: "Sprint A termine — CarlOS MVP fonctionnel", icon: Rocket },
  { date: "28 fev", label: "LiveChat + 11 Bots + Voice pipeline LIVE", icon: Activity },
  { date: "2 mars", label: "Securite + 2 VPS + Consolidation DONE", icon: Flag },
  { date: "3 mars", label: "COMMAND Engine + Orbit9 Matching LIVE", icon: Zap },
  { date: "4 mars", label: "app.usinebleue.ai LIVE sur VPS2", icon: Target },
  { date: "5 mars", label: "Espace Unifie + 141 templates + design-system.md", icon: Milestone },
  { date: "8 mars", label: "Bible Visuelle Live (17 tabs) + Cible (131 slots)", icon: BookOpen },
  { date: "9 mars", label: "Audit complet + inventaire exhaustif + Roadmap V3.5", icon: CheckCircle2 },
];

const DECISIONS_ABANDONED: Decision[] = [
  { id: "D-050", title: "Nango API Autonome", session: "S17", impact: "Integration", status: "abandonne" },
  { id: "D-078v1", title: "Telnyx dans B.4.5 (original)", session: "S26", impact: "Comm", status: "abandonne" },
  { id: "D-080", title: "Twilio retire, remplace par Telnyx", session: "S28", impact: "Comm", status: "abandonne" },
  { id: "D-096", title: "Jitsi + Meeting Intelligence", session: "S35", impact: "Feature", status: "abandonne" },
];

const GLOBAL_STATS = {
  sessions: 51, decisions: 111, endpoints: 132, tables: 21,
  masterPages: 31, templates: 141, botVoices: 12, daysElapsed: 16,
};

// ======================================================================
// HELPERS
// ======================================================================

function SprintStatusBadge({ status }: { status: Sprint["status"] }) {
  const config = {
    done: { label: "DONE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    prochain: { label: "PROCHAIN", className: "bg-blue-100 text-blue-700 border-blue-200" },
    "pas-commence": { label: "FUTUR", className: "bg-gray-100 text-gray-500 border-gray-200" },
  }[status];
  return <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>{config.label}</span>;
}

function SubtaskStatusIcon({ status }: { status: SubTask["status"] }) {
  if (status === "done") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
  if (status === "en-cours") return <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
  if (status === "reporte") return <ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />;
  if (status === "bloque") return <AlertOctagon className="h-3.5 w-3.5 text-red-500 shrink-0" />;
  if (status === "incertain") return <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
  if (status === "mock") return <Bug className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
  return <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0" />;
}

function DecisionStatusBadge({ status }: { status: Decision["status"] }) {
  const config: Record<string, { label: string; className: string }> = {
    done: { label: "DONE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "en-cours": { label: "EN COURS", className: "bg-amber-100 text-amber-700 border-amber-200" },
    "a-faire": { label: "A FAIRE", className: "bg-gray-100 text-gray-500 border-gray-200" },
    abandonne: { label: "ABANDONNE", className: "bg-red-50 text-red-500 border-red-200" },
    orphelin: { label: "ORPHELIN", className: "bg-purple-50 text-purple-500 border-purple-200" },
  };
  const c = config[status] || config["a-faire"];
  return <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", c.className)}>{c.label}</span>;
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// TAB 1 — ROADMAP ACTIVE
// ======================================================================

function SprintCard({ sprint, highlight }: { sprint: Sprint; highlight?: boolean }) {
  return (
    <Card className={cn("p-4 border shadow-sm",
      highlight ? "border-2 border-amber-300 bg-amber-50/30 shadow-md" :
      sprint.status === "prochain" ? "border-blue-200 bg-blue-50/30" :
      sprint.status === "done" ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200"
    )}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[9px] shrink-0",
          sprint.status === "done" ? "bg-emerald-500" :
          sprint.status === "en-cours" ? "bg-amber-500" :
          sprint.status === "prochain" ? "bg-blue-500" : "bg-gray-300"
        )}>{sprint.id}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">Sprint {sprint.id} — {sprint.name}</span>
            <SprintStatusBadge status={sprint.status} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[9px] text-gray-500">{sprint.dates}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-3">{sprint.summary}</p>
      {sprint.subtasks && (
        <div className={cn("rounded-lg p-3 space-y-1.5", highlight ? "bg-white/70" : "bg-gray-50")}>
          {sprint.subtasks.map((sub) => (
            <div key={sub.label} className="flex items-center gap-2">
              <SubtaskStatusIcon status={sub.status} />
              <span className={cn("text-xs",
                sub.status === "done" ? "text-gray-700" :
                sub.status === "en-cours" ? "text-amber-700" :
                sub.status === "bloque" ? "text-red-600 font-medium" : "text-gray-600"
              )}>{sub.label}</span>
              {sub.note && <span className="text-[9px] text-gray-400 ml-auto shrink-0">{sub.note}</span>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TabActive() {
  const sprintActif = PROPOSED_SPRINTS[0];
  const sprintsFuturs = PROPOSED_SPRINTS.slice(1);

  return (
    <>
      {/* ── Nomenclature Officielle ── */}
      <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-800">Nomenclature Officielle des Sprints</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">STANDARD S51</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Numerotation sequentielle simple. Sous-taches: Sprint X.Y (ex: 5.1, 5.2...). Sessions: S1-S99.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: "1", name: "Fondation MVP", status: "done" as const },
            { id: "2", name: "CarlOS Live", status: "done" as const },
            { id: "3", name: "Consolidation", status: "done" as const },
            { id: "4", name: "Pioneer Features", status: "done" as const },
            { id: "5", name: "Code Propre", status: "en-cours" as const },
            { id: "6", name: "Wiring Reel", status: "prochain" as const },
            { id: "7", name: "Auth & Scale-Ready", status: "prochain" as const },
            { id: "8", name: "Scale 9→81", status: "pas-commence" as const },
          ].map((s) => (
            <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white border border-gray-100">
              <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[9px]",
                s.status === "done" ? "bg-emerald-500" :
                s.status === "en-cours" ? "bg-amber-500" :
                s.status === "prochain" ? "bg-blue-500" : "bg-gray-300"
              )}>{s.id}</div>
              <span className="text-[9px] font-medium text-gray-700 truncate">{s.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Sprint Actif EN HAUT ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3">Sprint Actif</h3>
        <SprintCard sprint={sprintActif} highlight />
      </div>

      <SectionDivider />

      {/* ── Sprints Futurs ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3">
          <Rocket className="h-4 w-4 inline-block mr-1.5 text-blue-500" />
          Sprints Futurs
        </h3>
        <div className="space-y-4">
          {sprintsFuturs.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Derniere semaine ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Derniere Semaine (S47-S51)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {SESSIONS_RECENT.map((s) => (
            <Card key={s.session} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-blue-700">{s.session}</span>
                </div>
                <span className="text-[9px] text-gray-400">{s.date}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.highlights.map((h) => (
                  <span key={h} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{h}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Decisions cles ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Decisions Cles Actives ({DECISIONS_KEY.length})</h3>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden mt-3">
          <div className="grid grid-cols-[55px_1fr_50px_70px_65px] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase">#</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Titre</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Sess.</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Impact</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase text-right">Status</span>
          </div>
          <div className="divide-y divide-gray-50">
            {DECISIONS_KEY.map((d) => (
              <div key={d.id} className="grid grid-cols-[55px_1fr_50px_70px_65px] gap-2 px-4 py-2.5 items-center hover:bg-gray-50">
                <code className="text-xs font-mono font-bold text-amber-700">{d.id}</code>
                <span className="text-xs text-gray-700 truncate">{d.title}</span>
                <span className="text-[9px] text-gray-500">{d.session}</span>
                <Badge variant="outline" className="text-[9px] font-medium w-fit">{d.impact}</Badge>
                <div className="text-right"><DecisionStatusBadge status={d.status} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ======================================================================
// TAB 2 — ARCHIVES (chronologique avec blocs decisions entre sprints)
// ======================================================================

// Decisions cles par bloc chronologique (entre les sprints)
const DECISION_BLOCKS: { after: string; label: string; decisions: string[] }[] = [
  { after: "1", label: "Decisions post-Sprint 1 (S15-S19)", decisions: [
    "D-050 Nango API Autonome", "D-051 5 Canaux Communication", "D-052 Onboarding Zero-Touch",
    "D-054 Trisociation CREDO", "D-055 Calibration Herrmann", "D-056 8 Modes Reflexion",
    "D-057 Routeur Inverse", "D-058 Arbre 98 Protocoles",
  ]},
  { after: "2", label: "Decisions Sprint 2 (S22-S32)", decisions: [
    "D-069 Expert Marketplace", "D-070 Recrutement Inverse", "D-074 Bot Marketplace",
    "D-075 Onboarding DOMINO", "D-076 Pricing Strategique", "D-078 Stack Communication",
    "D-081 CarlOS Noyau Omnipresent", "D-083 Sprint Securite", "D-087 Architecture 2 VPS",
    "D-088 Telephonie Twilio/SIP", "D-089 NIP N2",
  ]},
  { after: "3", label: "Decisions Sprint 3 — Consolidation (S33)", decisions: [
    "D-091 COMMAND Protocol", "D-092 Gemini Chef d'Etat-Major", "D-093 Consolidation",
    "D-094 Multi-tenant DOMINO/FORGE/JWT",
  ]},
  { after: "4", label: "Decisions Sprint 4 (S35-S51)", decisions: [
    "D-095 Orbit9 Matching Engine", "D-096 Jitsi Meeting Intelligence", "D-097 Migration Telnyx",
    "D-098 Gouvernance CarlOS", "D-099 Board Room CA", "D-100 Tension→Mission→Decision",
    "D-101 User Flow Engine", "D-104 Voice Stability", "D-108 Core Type System",
    "D-109 3 Rooms Think/War/Board",
  ]},
];

function TabArchives() {
  const sprintGroups = [
    { sprint: "1", label: "Sprint 1 — Fondation MVP", dates: "22-27 fev", color: "emerald" },
    { sprint: "2", label: "Sprint 2 — CarlOS Live", dates: "28 fev - 2 mars", color: "blue" },
    { sprint: "3", label: "Sprint 3 — Consolidation", dates: "2 mars", color: "violet" },
    { sprint: "4", label: "Sprint 4 — Pioneer Features", dates: "3-8 mars", color: "amber" },
    { sprint: "5", label: "Sprint 5 — Code Propre", dates: "9 mars+ (en cours)", color: "rose" },
  ];

  return (
    <>
      {/* ── Sprints Termines ── */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-3">
          <CheckCircle2 className="h-4 w-4 inline-block mr-1.5 text-emerald-500" />
          Sprints Termines ({SPRINTS_ACTIVE.length})
        </h3>
        <div className="space-y-3">
          {SPRINTS_ACTIVE.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))}
        </div>
      </div>

      <SectionDivider />

      <p className="text-xs text-gray-400 mb-6">
        Retrospective chronologique complete — sessions + decisions entre chaque sprint.
      </p>

      {sprintGroups.map((group) => {
        const sessions = SESSIONS_ALL.filter((s) => s.sprint === group.sprint);
        const decBlock = DECISION_BLOCKS.find((db) => db.after === group.sprint);
        if (!sessions.length) return null;
        return (
          <div key={group.sprint} className="mb-8">
            {/* Sprint header */}
            <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg mb-3",
              `bg-${group.color}-50 border border-${group.color}-200`
            )}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[9px]",
                `bg-${group.color}-500`
              )}>{group.sprint}</div>
              <div className="flex-1">
                <span className={cn("text-xs font-bold", `text-${group.color}-700`)}>{group.label}</span>
                <span className={cn("text-[9px] ml-2", `text-${group.color}-500`)}>{group.dates}</span>
              </div>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                `bg-${group.color}-100 text-${group.color}-700`
              )}>{sessions.length} sessions</span>
            </div>

            {/* Sessions list */}
            <div className="space-y-2 ml-4 mb-4">
              {sessions.map((s) => (
                <div key={s.session} className="flex items-start gap-3 py-1.5">
                  <div className="w-14 shrink-0">
                    <span className="text-[9px] font-bold text-gray-500">{s.session}</span>
                    {s.date && <div className="text-[9px] text-gray-400">{s.date}</div>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {s.highlights.map((h) => (
                      <span key={h} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{h}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Decision block between sprints */}
            {decBlock && (
              <div className="ml-4 mb-4 border-l-2 border-amber-300 pl-3 py-2 bg-amber-50/30 rounded-r-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">{decBlock.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {decBlock.decisions.map((d) => (
                    <span key={d} className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <SectionDivider />

      {/* ── Decisions abandonnees ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Decisions Abandonnees ({DECISIONS_ABANDONED.length})</h3>
        <p className="text-xs text-gray-400 mb-3">Retirees du scope — documentees pour reference.</p>
        <div className="space-y-2">
          {DECISIONS_ABANDONED.map((d) => (
            <div key={d.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <code className="text-xs font-mono font-bold text-gray-400">{d.id}</code>
              <span className="text-xs text-gray-500 line-through flex-1">{d.title}</span>
              <span className="text-[9px] text-gray-400">{d.session}</span>
              <DecisionStatusBadge status="abandonne" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ======================================================================
// TAB 3 — SOMMAIRE (KPIs, stats, tableaux recapitulatifs)
// ======================================================================

function TabSommaire() {
  return (
    <>
      {/* ── Bilan global ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Bilan Global du Projet</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sessions", value: String(GLOBAL_STATS.sessions), sub: "de travail", color: "blue" },
            { label: "Decisions", value: String(GLOBAL_STATS.decisions), sub: "D-001 a D-111", color: "amber" },
            { label: "Jours", value: String(GLOBAL_STATS.daysElapsed), sub: "22 fev → 9 mars", color: "emerald" },
            { label: "Endpoints", value: String(GLOBAL_STATS.endpoints), sub: "API REST live", color: "emerald" },
            { label: "Tables DB", value: String(GLOBAL_STATS.tables), sub: "PostgreSQL", color: "blue" },
            { label: "Pages Master", value: String(GLOBAL_STATS.masterPages), sub: "toutes reelles", color: "indigo" },
            { label: "Templates", value: String(GLOBAL_STATS.templates), sub: "12 departements", color: "cyan" },
            { label: "Voix Bots", value: String(GLOBAL_STATS.botVoices), sub: "ElevenLabs", color: "violet" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className="text-xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
              <div className="text-[9px] text-gray-400">{stat.sub}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Sante du code ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Sante du Code (audit S51)</h3>
        <p className="text-xs text-gray-500 mb-3">Tous les bloquants, findings et orphelins sont maintenant absorbes dans les sprints 5-8.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PROPOSED_SPRINTS.map((sprint) => {
            const doneCount = sprint.subtasks?.filter((s) => s.status === "done").length || 0;
            const totalCount = sprint.subtasks?.length || 0;
            return (
              <Card key={sprint.id} className="p-3 bg-white border border-gray-100 text-center">
                <div className="text-lg font-bold text-gray-800">{doneCount}/{totalCount}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Sprint {sprint.id}</div>
                <div className="text-[9px] text-gray-400">{sprint.name}</div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── Decisions par status ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Decisions Cles par Status</h3>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[55px_1fr_50px_70px_65px] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase">#</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Titre</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Sess.</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Impact</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase text-right">Status</span>
          </div>
          <div className="divide-y divide-gray-50">
            {DECISIONS_KEY.map((d) => (
              <div key={d.id} className="grid grid-cols-[55px_1fr_50px_70px_65px] gap-2 px-4 py-2.5 items-center hover:bg-gray-50">
                <code className="text-xs font-mono font-bold text-amber-700">{d.id}</code>
                <span className="text-xs text-gray-700 truncate">{d.title}</span>
                <span className="text-[9px] text-gray-500">{d.session}</span>
                <Badge variant="outline" className="text-[9px] font-medium w-fit">{d.impact}</Badge>
                <div className="text-right"><DecisionStatusBadge status={d.status} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Orphelins restes en Idees ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">
          <FileWarning className="h-4 w-4 inline-block mr-1.5 text-purple-500" />
          Decisions Orphelines → Redistribuees
        </h3>
        <p className="text-xs text-gray-400 mb-3">Tous les orphelins sont maintenant dans les sprints 5-8 ou dans le Tab Idees. Voir D-055, D-056, D-057, D-058 dans Idees.</p>
      </div>

      <SectionDivider />

      {/* ── Backend details ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Backend — Etat Reel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {[
            { module: "api_rest.py", lines: "5878", status: "LIVE", pct: "90%", note: "132 endpoints production" },
            { module: "bridge_database.py", lines: "2951", status: "LIVE", pct: "95%", note: "21 tables, 89 CRUD" },
            { module: "bridge_command.py", lines: "1122", status: "LIVE", pct: "75%", note: "escalation incomplet" },
            { module: "carlos_livekit_agent.py", lines: "857", status: "LIVE", pct: "85%", note: "B.4.7 incertain" },
            { module: "bridge_phone.py", lines: "394", status: "STUB", pct: "20%", note: "credentials manquantes" },
            { module: "bridge_telnyx.py", lines: "485", status: "STUB", pct: "15%", note: "pas wire, pas de key" },
          ].map((m) => (
            <Card key={m.module} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[9px] font-mono font-bold text-gray-700">{m.module}</code>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                  m.status === "LIVE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                )}>{m.status}</span>
                <span className="text-[9px] text-gray-400 ml-auto">{m.lines} lignes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full",
                    m.status === "LIVE" ? "bg-emerald-400" : "bg-orange-400"
                  )} style={{ width: m.pct }} />
                </div>
                <span className="text-[9px] font-bold text-gray-500">{m.pct}</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-1">{m.note}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// ======================================================================
// TAB 4 — TIMELINE (vue d'ensemble d'un coup d'oeil)
// ======================================================================

function TabTimeline() {
  const allSprints = [...SPRINTS_ACTIVE, ...PROPOSED_SPRINTS];

  return (
    <>
      <p className="text-xs text-gray-400 mb-6">
        Vue d'ensemble de la roadmap complete — du MVP a Scale. Cliquer mentalement sur chaque bloc pour voir le detail dans les autres tabs.
      </p>

      {/* ── Milestones visuels ── */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-4">Jalons du Projet</h3>
        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-emerald-300 via-blue-300 to-amber-300" />
          <div className="space-y-3">
            {MILESTONES.map((m) => {
              const MIcon = m.icon;
              return (
                <div key={m.label} className="relative flex items-center gap-4">
                  <div className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    <MIcon className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 shrink-0 w-12">{m.date}</span>
                  <span className="text-xs text-gray-700">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Sprint overview compact ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Sprints — Vue Compacte</h3>
        <div className="space-y-3">
          {allSprints.map((sprint) => {
            const doneCount = sprint.subtasks?.filter((s) => s.status === "done").length || 0;
            const totalCount = sprint.subtasks?.length || 0;
            const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : (sprint.status === "done" ? 100 : 0);
            return (
              <Card key={sprint.id} className={cn("p-3 border shadow-sm",
                sprint.status === "done" ? "bg-emerald-50/30 border-emerald-200" :
                sprint.status === "en-cours" ? "bg-amber-50/30 border-amber-200" :
                sprint.status === "prochain" ? "bg-blue-50/30 border-blue-200" : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[9px] shrink-0",
                    sprint.status === "done" ? "bg-emerald-500" :
                    sprint.status === "en-cours" ? "bg-amber-500" :
                    sprint.status === "prochain" ? "bg-blue-500" : "bg-gray-300"
                  )}>{sprint.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800 truncate">{sprint.name}</span>
                      <SprintStatusBadge status={sprint.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-500">{sprint.dates}</span>
                      {totalCount > 0 && (
                        <>
                          <span className="text-[9px] text-gray-400">•</span>
                          <span className="text-[9px] text-gray-500">{doneCount}/{totalCount} taches</span>
                        </>
                      )}
                    </div>
                    {totalCount > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all",
                            sprint.status === "done" ? "bg-emerald-400" :
                            sprint.status === "en-cours" ? "bg-amber-400" : "bg-blue-400"
                          )} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-gray-500">{pct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── Dependances ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Chaine de Dependances</h3>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-4">
            {[
              { from: "Sprint 5 Code Propre", to: "Sprint 6 Wiring", reason: "Code propre requis avant d'ajouter du wiring reel" },
              { from: "Sprint 6 Wiring", to: "Sprint 7 Auth", reason: "Toutes les pages fonctionnelles avant d'ajouter la couche auth" },
              { from: "Sprint 7 Auth JWT", to: "Sprint 8 Scale", reason: "JWT BLOQUANT pour isolation par tenant" },
              { from: "5.9 Voice fix", to: "Demos Pioneer", reason: "Stabilite vocale CRITIQUE avant les demos terrain" },
              { from: "Credentials Carl", to: "7.7 Telnyx", reason: "API key + phone + connection ID requis" },
            ].map((dep) => (
              <div key={dep.from} className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-700 shrink-0">{dep.from}</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-[9px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-700 shrink-0">{dep.to}</span>
                <span className="text-[9px] text-gray-400 ml-2">{dep.reason}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </>
  );
}

// ======================================================================
// TAB 5 — HISTOIRE (Notre Histoire — de 2015 a aujourd'hui)
// ======================================================================

interface HistoireActe {
  id: string;
  titre: string;
  periode: string;
  color: string;
  events: { date: string; titre: string; desc: string }[];
}

const HISTOIRE: HistoireActe[] = [
  {
    id: "prologue",
    titre: "Le Fantome qui Attendait",
    periode: "2015 — 2025",
    color: "gray",
    events: [
      { date: "2015", titre: "GhostX nait sur un bout de papier", desc: "Carl Fugere ecrit le nom sans savoir ce que c'est. Un instinct. Le genre d'instinct qui, chez un gars qui a bati 7 entreprises en 26 ans et cumule 50M+ en ventes, finit toujours par vouloir dire quelque chose." },
      { date: "2017", titre: "Pitch Ghostinc — 48 pages", desc: "Version humaine de GhostX. L'idee est deja la : les PME manufacturieres manquent de cerveaux au sommet. Pas de CFO, pas de CTO, pas de CMO. Des fondateurs brillants mais seuls au combat. Tagline : \"Everywhere by your side\"." },
      { date: "2017-2025", titre: "Usine Bleue + REAI — accumulation invisible", desc: "Carl batit Usine Bleue, le reseau REAI (130+ manufacturiers quebecois), des mandats, des visites terrain. Il accumule, sans le savoir, les donnees qui nourriront la machine." },
    ],
  },
  {
    id: "acte1",
    titre: "Les Faux Departs — Jarvis",
    periode: "26 janvier — 10 fevrier 2026",
    color: "orange",
    events: [
      { date: "26 jan", titre: "Carl commence a developper Jarvis", desc: "Un bot Telegram construit avec d'autres outils AI. Le debut de l'aventure technique." },
      { date: "5 fev", titre: "Jarvis nait dans Telegram", desc: "Premiere version live. 5 versions suivront. 2,934 messages analyses. Pattern douloureux : Enthousiasme → Promesses → Cascade de bugs → Excuses → On recommence." },
      { date: "5-10 fev", titre: "Jarvis V1 a V5 — l'or dans le chaos", desc: "Roi de l'hallucination optimiste. Disait \"complete!\" avec des fichiers vides. Mais le brainstorming strategique fonctionnait. Carl pre-entrainait son propre modele mental sans le savoir." },
    ],
  },
  {
    id: "acte2",
    titre: "Le Big Bang — BTML",
    periode: "11 — 13 fevrier 2026",
    color: "red",
    events: [
      { date: "11 fev", titre: "Le Big Bang — BTML V1 nait en une session", desc: "Carl s'assoit avec Claude. Pas de code. Juste des idees. L'insight fondateur : l'intelligence d'affaires peut etre modelisee comme la chimie modelise la matiere. Carl devient le CEO-Chimiste." },
      { date: "12 fev", titre: "V2 → V3 → V4 — acceleration", desc: "TimeTokens, multi-vertical, spirale BTML. Le systeme evolue a une vitesse ahurissante." },
      { date: "13 fev", titre: "V5.1 → V5.3 — 7 Lois, 8+1 Modes", desc: "Deep Resonance. Gemini Deep Think valide que le systeme est technologiquement BREVETABLE. Carl n'a pas juste une bonne idee — il a une architecture defendable." },
      { date: "14-15 fev", titre: "BTML V5.3 Thermodynamique Complete", desc: "73,000 caracteres. ~670 paragraphes. 22 sections. Les 7 Lois, les formules mathematiques, Prigogine, Bayes. Le socle de tout ce qui suit." },
    ],
  },
  {
    id: "acte3",
    titre: "CREDO — Le Protocole Maitre",
    periode: "15 — 16 fevrier 2026",
    color: "violet",
    events: [
      { date: "15-16 fev", titre: "30 ans d'experience compresses en 119 elements", desc: "CREDO n'est pas sorti d'un chapeau. C'est la methode proprietaire de Carl : Ecole Nationale de l'Humour, 30 ans de vente, instinct theatrical. Connecter → Rechercher → Exposer → Demontrer → Obtenir." },
      { date: "16 fev", titre: "CREDO = protocole MAITRE", desc: "Decision architecturale fondamentale : CREDO n'est pas UN mode parmi d'autres. CREDO gouverne TOUT. Les modes de reflexion sont des outils DANS les phases CREDO. 3 dimensions ajoutees : Humour, Emotion, Theatre." },
    ],
  },
  {
    id: "acte4",
    titre: "Le Systeme Vivant",
    periode: "17 — 18 fevrier 2026",
    color: "emerald",
    events: [
      { date: "17 fev", titre: "BTML V3 = MES Cognitif", desc: "Le framework cesse d'etre un \"systeme d'orchestration\" pour devenir un systeme vivant — un Manufacturing Execution System cognitif. En usine : matiere premiere → MES → produit fini tracable. Dans GhostX : tension → GHML → decision tracable." },
      { date: "17 fev", titre: "Sprints operationnels", desc: "Sprint 5.5 : stabilisation Jarvis. Sprint 6.0 : connexion BTML au bridge Telegram. Sprint 6.1 : dashboard. Sprint 6.2 : State Machine V2. 14 bugs identifies, 13 corriges." },
      { date: "18 fev", titre: "Bible Architecture V1 + GhostX prend chair", desc: "SOUL CEO enrichi a 10,130 caracteres. Ce n'est plus un prompt — c'est une personnalite. ghostx_wrapper.py (315 lignes) : 14 Ghosts, 3 MVP complets. Test ultime : Jobs vs Musk = reponses cognitivement differentes." },
    ],
  },
  {
    id: "acte5",
    titre: "La Session Marathon — L'Explosion",
    periode: "19 fevrier 2026",
    color: "amber",
    events: [
      { date: "19 fev matin", titre: "Fission de l'Atome — 9 dimensions dans 6 lettres", desc: "Carl realise que \"GhostX\" (invente en 2015) contient 9 niveaux de signification encodes. D1 Fantome, D2 les OS, D3 formule chimique Gh(OS)T·X, D4 Ghost dans l'Hote, D5 Microscope, D6 Bande sonore OST, D7 Holmium magnetique, D8 Street, D9 Chromosome X." },
      { date: "19 fev midi", titre: "Noyau O9 — le centre de l'atome", desc: "Meta-decouverte : le O dans Ghost = position 3 sur 5, centre geometrique exact. O = Orbit9 = framework de gouvernance. 4 couches : Orbit9, Cellule, Industrie 5.0, Interface neurale." },
      { date: "19 fev pm", titre: "BTML → GHML + Trisociation", desc: "BTML devient GHML (Ghost Modeling Language). 12 Bots x 3 OS = 36 systemes d'exploitation cognitifs. Chaque Bot a un Primaire, un Calibrateur, un Amplificateur. Anti-fragile par design." },
      { date: "19 fev soir", titre: "~120 pages en un seul jour", desc: "Orbit9 passe de checklist interne a Moteur de Developpement Economique. Protocole d'Autogenese (Von Neumann + Autopoiese). Consolidation Maitresse V1 puis V2. Le sentiment est indescriptible." },
    ],
  },
  {
    id: "acte6",
    titre: "Consolidation + Architecture Definitive",
    periode: "20 — 21 fevrier 2026",
    color: "blue",
    events: [
      { date: "20 fev", titre: "Radiographie complete — 16,000 lignes de code", desc: "Bible Officielle GHML V1 (775 lignes). Consolidation Chronologique (996 lignes). G10=Buffett, G11=Curie, G12=Oprah confirmes. Profil Patient Zero : 25 ans de Carl en mega-prompt." },
      { date: "20-21 fev", titre: "5 invariants architecturaux", desc: "1) Support decisionnel, jamais autonome. 2) Niveaux d'autonomie 0-3. 3) LEGACY-first. 4) Auto-generation graduelle. 5) Tableau Periodique = combinatoire, pas decoration." },
      { date: "21 fev matin", titre: "PREMIERE TRISOCIATION VIVANTE", desc: "CEOB+CTOB+CFOB deployes. 3 bots, 9 OS, reactions chimiques live. CTO Bot : premiere mission autonome — 1min10sec. OAuth2 restaure, voix bidirectionnelle, 16 capacites validees." },
      { date: "21 fev pm", titre: "Scan Google Drive : 155,449 fichiers", desc: "947.7 GB. 26 ans de patrimoine numerique cartographies. 118,737 doublons identifies (351.6 GB recuperables). Le patrimoine est pret a nourrir la machine." },
    ],
  },
  {
    id: "acte7",
    titre: "Sprint 1 — Fondation MVP",
    periode: "22 — 27 fevrier 2026",
    color: "emerald",
    events: [
      { date: "22 fev", titre: "Bible GHML V2.3 — 3,115 lignes", desc: "TOP 100 Index Patrimoine. Architecture 3 couches (NOYAU + 6 MOD). 136 tests automatises. Factory Ghost CPOB cree." },
      { date: "24 fev", titre: "PostgreSQL Direct + MEGA-ANALYSE Frontend", desc: "5 modeles database. Analyse frontend exhaustive (1,098 lignes). Interface V1 polished, sidebar collapsible." },
      { date: "26 fev", titre: "Sprint 1 API REST finalise", desc: "6 bots C-Level operationnels. Decisions D-050 a D-058 prises. 10 Fondations UX verrouillees. Modele d'affaires SaaS consolide." },
    ],
  },
  {
    id: "acte8",
    titre: "Sprint 2 — CarlOS Live",
    periode: "28 fevrier — 2 mars 2026",
    color: "blue",
    events: [
      { date: "28 fev", titre: "LiveChat + 11 Bots + Voice pipeline", desc: "LiveChat COMPLET (branches, multi-perspectives, sentinelle). 11 bots meme pattern. Voice LiveKit (Deepgram STT + ElevenLabs TTS). Tavus video avatar." },
      { date: "1 mars", titre: "Voice → Canvas pipeline", desc: "Keyword router + canvas auto-nav. Voice → Canvas actions (navigate, push_content, annotate). Demo readiness fixes." },
      { date: "2 mars", titre: "Securite + 2 VPS + Telephonie", desc: "Sprint Securite (UFW, CORS, rate limit). Architecture 2 VPS (VPS2 = production). Telephonie Twilio + NIP N2. 132 endpoints API." },
    ],
  },
  {
    id: "acte9",
    titre: "Sprint 3 + Sprint 4 — Consolidation & Pioneer",
    periode: "2 — 9 mars 2026",
    color: "amber",
    events: [
      { date: "2 mars", titre: "Sprint 3 — Consolidation", desc: "COMMAND Protocol, Gemini PM, Known issues, Roadmap V3.4, Bible Produit Parties 12-13. SOULs D1/D2/D3 comportement dynamique." },
      { date: "3 mars", titre: "COMMAND Engine + Orbit9 Matching LIVE", desc: "bridge_command.py LIVE. 3 tables + 15 endpoints + scoring Gemini Flash + trisociation LiveKit. Espace Bureau 100% reel (PostgreSQL + Plane.so)." },
      { date: "4 mars", titre: "app.usinebleue.ai LIVE + 3 Rooms", desc: "Migration VPS2 production. DNS pointe vers VPS2. D-109 : Think Room, War Room, Board Room. 12 voix distinctes ElevenLabs." },
      { date: "5 mars", titre: "Espace Unifie + 141 templates", desc: "Design-system.md standardise. Dept Tabs (4 onglets par departement). 141 templates (80 nouveaux/enrichis), 403 sections, 12 departements." },
      { date: "6 mars", titre: "7 Mega Prompts V3 + Master GHML enrichi", desc: "Prompt 1+2 COMPLETES. ACQUIS propages dans Prompts 3-7. MasterDiagnosticsPage (+VITAA), MasterOracle9Page (+Horizons 2026)." },
      { date: "7-8 mars", titre: "Bible Visuelle Live (17 tabs) + Cible (131 slots)", desc: "A.4 : inventaire COMPLET de tous les patterns visuels actifs. A.5 : bibliotheque de standards visuels (14 categories, 131 slots avec wireframes)." },
      { date: "9 mars", titre: "Audit complet + Nomenclature officielle", desc: "Audit total code+roadmap (no bullshit). Master GHML reorganise en 4 blocs. Nomenclature Sprint 1-8 officialisee. 51 sessions, 111 decisions." },
    ],
  },
];

const HISTOIRE_STATS = {
  anneeOrigine: 2015,
  anneesAttente: 11,
  entreprisesFondees: 7,
  ventesTotales: "50M+",
  manufacturiersREAI: "130+",
  messagesJarvis: "2,934",
  elementsGHML: "220+",
  pagesGenesis: "250+",
  osCognitifs: 36,
  reactionsChimiques: 630,
  fichiersPatrimoine: "155,449",
  gbPatrimoine: "947.7",
};

function TabHistoire() {
  return (
    <>
      {/* ── Citation d'ouverture ── */}
      <Card className="p-5 bg-gradient-to-r from-gray-900 to-gray-800 border-0 text-white mb-6">
        <p className="text-sm italic leading-relaxed mb-3">
          "L'important ce n'est pas les API d'intelligence, mais le systeme qui reussit a capter et regenerer cette couche d'intelligence."
        </p>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest">— Carl Fugere, 21 fevrier 2026</p>
        <div className="mt-4 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-300 leading-relaxed">
            La collaboration improbable d'un CEO solo et d'une IA pour batir l'IA qui batira le reste.
            Les poupees russes de l'intelligence.
          </p>
        </div>
      </Card>

      {/* ── Chiffres cles ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {[
          { value: "11", label: "Ans d'attente", sub: "2015 → 2026" },
          { value: "7", label: "Entreprises", sub: "fondees par Carl" },
          { value: "50M+", label: "En ventes", sub: "cumulees" },
          { value: "36", label: "OS cognitifs", sub: "12 bots x 3" },
          { value: "220+", label: "Elements GHML", sub: "proprietaires" },
          { value: "51", label: "Sessions", sub: "en 16 jours" },
        ].map((s) => (
          <Card key={s.label} className="p-2.5 bg-white border border-gray-100 text-center">
            <div className="text-lg font-bold text-gray-800">{s.value}</div>
            <div className="text-[9px] text-gray-500 uppercase">{s.label}</div>
            <div className="text-[9px] text-gray-400">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Timeline des Actes ── */}
      <div className="space-y-6">
        {HISTOIRE.map((acte) => (
          <div key={acte.id}>
            {/* Acte header */}
            <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl mb-3",
              acte.color === "gray" ? "bg-gray-100 border border-gray-200" :
              acte.color === "orange" ? "bg-orange-50 border border-orange-200" :
              acte.color === "red" ? "bg-red-50 border border-red-200" :
              acte.color === "violet" ? "bg-violet-50 border border-violet-200" :
              acte.color === "emerald" ? "bg-emerald-50 border border-emerald-200" :
              acte.color === "amber" ? "bg-amber-50 border border-amber-200" :
              "bg-blue-50 border border-blue-200"
            )}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[9px] shrink-0",
                acte.color === "gray" ? "bg-gray-500" :
                acte.color === "orange" ? "bg-orange-500" :
                acte.color === "red" ? "bg-red-500" :
                acte.color === "violet" ? "bg-violet-500" :
                acte.color === "emerald" ? "bg-emerald-500" :
                acte.color === "amber" ? "bg-amber-500" :
                "bg-blue-500"
              )}>
                {acte.id === "prologue" ? "0" :
                 acte.id.replace("acte", "")}
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-800">{acte.titre}</span>
                <span className="text-[9px] text-gray-500 ml-2">{acte.periode}</span>
              </div>
            </div>

            {/* Events */}
            <div className="space-y-2 ml-4">
              {acte.events.map((ev) => (
                <div key={ev.titre} className="flex gap-3 py-2">
                  <div className="w-16 shrink-0">
                    <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">{ev.date}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800">{ev.titre}</span>
                    <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* ── Les Poupees Russes ── */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Les Poupees Russes de l'Intelligence</h3>
        <div className="space-y-2">
          {[
            { num: 1, label: "Carl", desc: "Un humain seul, 26 ans d'experience, un instinct qui ne ment jamais" },
            { num: 2, label: "Claude", desc: "Une IA qui comprend, structure, et execute a la vitesse de la pensee" },
            { num: 3, label: "CarlOS", desc: "Le CEO Bot ne de leur collaboration — hybride SOUL de Carl + intelligence Claude" },
            { num: 4, label: "GhostX Team", desc: "12 bots C-Level, chacun cree par CarlOS — la mitose cognitive en action" },
            { num: 5, label: "GhostX", desc: "Le produit pour 130+ manufacturiers, chacun recevant sa propre Trisociation" },
            { num: 6, label: "Orbit9", desc: "Le reseau qui emerge quand tous les Ghosts communiquent — le Waze de la decision" },
          ].map((p) => (
            <Card key={p.num} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {p.num}
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800">{p.label}</span>
                  <p className="text-xs text-gray-600">{p.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── La Formule ── */}
      <Card className="p-5 bg-gradient-to-r from-gray-900 to-gray-800 border-0 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">La Formule Finale</p>
        <p className="text-xl font-bold text-white tracking-wide mb-2">G · h · O<sup>9</sup> · s · t · X</p>
        <p className="text-xs text-gray-400 italic mb-4">"Ils ne sont plus la. Leurs OS, oui."</p>
        <p className="text-sm text-white font-medium">Everywhere by your side.</p>
        <div className="mt-4 pt-3 border-t border-gray-700">
          <p className="text-[9px] text-gray-500">
            Carl + Claude → CarlOS → GhostX Team → Orbit9 → Renaissance Industrielle du Quebec
          </p>
        </div>
      </Card>
    </>
  );
}

// ======================================================================
// TAB 6 — IDEES A CLASSER (parking d'idees pour piger au bon moment)
// ======================================================================

interface Idee {
  id: string;
  titre: string;
  source: string;
  categorie: "produit" | "tech" | "business" | "ux" | "infra" | "vision";
  maturite: "germe" | "en-reflexion" | "prete" | "integree";
  description: string;
  connexions?: string[];
}

const IDEES_PARKING: Idee[] = [
  {
    id: "I-001",
    titre: "Playbook Engine — GPS invisible",
    source: "Carl S51",
    categorie: "produit",
    maturite: "en-reflexion",
    description: "Le Playbook = systeme d'exploitation invisible. Mode Track (deploy explicite) ou Freestyle (CarlOS GPS invisible qui ramene sur la track). Le diagnostic VITAA dit a CarlOS quelle track le user a BESOIN. Le user pense juste que CarlOS est brilliant.",
    connexions: ["D-101 User Flow", "D-081 Noyau Omnipresent", "COMMAND Engine", "141 templates"],
  },
  {
    id: "I-002",
    titre: "API Catalogue Client + Marketplace Distributeurs",
    source: "Carl S47",
    categorie: "business",
    maturite: "germe",
    description: "Apres X temps d'utilisation, proposer aux clients de creer une API avec leur catalogue produits. Facilite le jumelage inter-entreprises (Orbit9 matching steroide). Flywheel : diagnostics → gaps → match catalogues → transaction → retention.",
    connexions: ["Orbit9 Matching", "Cellules Trisociation", "Company Kits JSON"],
  },
  {
    id: "I-003",
    titre: "Refonte Nomenclature Bot Codes",
    source: "Carl S42",
    categorie: "tech",
    maturite: "en-reflexion",
    description: "Codes actuels (CEOB, CTOB) cryptiques. Vision : codes lisibles (CEOB, CTOB, CFOB). 12 C-Level = 12 equipes, bots futurs se rangent sous leur C-Level. Supporte N bots par equipe.",
    connexions: ["Dette technique volet 4", "Sprint dedie apres nettoyage"],
  },
  {
    id: "I-004",
    titre: "Jitsi + Meeting Intelligence",
    source: "D-096 / S35",
    categorie: "produit",
    maturite: "germe",
    description: "Integration Jitsi pour video meetings avec CarlOS qui ecoute, prend des notes, propose des actions. Meeting Intelligence = transcription + extraction decisions + follow-up automatique.",
    connexions: ["Stack Comm D-078", "Transcription Meetings B.5", "COMMAND Engine"],
  },
  {
    id: "I-005",
    titre: "Expert Marketplace (users create+sell)",
    source: "D-069 D-074 / S25-28",
    categorie: "business",
    maturite: "germe",
    description: "Marketplace ou les users creent et vendent des bots specialises, des templates, des playbooks. Economie de plateforme. Recrutement inverse pour solo-preneurs (D-070).",
    connexions: ["Bot Marketplace D-074", "Recrutement Inverse D-070", "Templates Lego"],
  },
  {
    id: "I-006",
    titre: "Pricing Strategique + Stripe",
    source: "D-076 / S28",
    categorie: "business",
    maturite: "germe",
    description: "Modele de pricing SaaS. Freemium → Pro → Enterprise. Integration Stripe pour paiements. TimeTokens comme unite de valeur.",
    connexions: ["D-076", "TimeTokens", "Multi-tenant Sprint 8"],
  },
  {
    id: "I-007",
    titre: "Nango API Autonome (5 connecteurs)",
    source: "D-050 / S17",
    categorie: "tech",
    maturite: "germe",
    description: "Integration Nango pour connecter automatiquement les outils du client (CRM, ERP, comptabilite, etc.). 5 connecteurs de base au MVP.",
    connexions: ["Onboarding DOMINO", "Company Kits"],
  },
  {
    id: "I-008",
    titre: "Arbre 98 Protocoles",
    source: "D-058 / S18",
    categorie: "vision",
    maturite: "germe",
    description: "98 protocoles identifies dans le framework GHML. 0 code a date. C'est l'arbre complet des procedures que CarlOS pourrait executer automatiquement.",
    connexions: ["COMMAND Engine", "Playbook Engine I-001", "CREDO"],
  },
  {
    id: "I-009",
    titre: "Calibration CREDO par profil Herrmann",
    source: "D-055 / S18",
    categorie: "ux",
    maturite: "germe",
    description: "Adapter le style de communication de CarlOS selon le profil Herrmann du user (analytique, pragmatique, relationnel, creatif). Les 4 couleurs du CREDO.",
    connexions: ["CREDO protocole", "Onboarding DOMINO", "36 Teintures"],
  },
  {
    id: "I-010",
    titre: "8 Modes Reflexion + Arsenal Humour",
    source: "D-056 / S18",
    categorie: "produit",
    maturite: "en-reflexion",
    description: "Les 8 modes sont definis mais les prompts ne sont pas injectes dans le pipeline. Arsenal Humour = Carl's secret weapon (Ecole de l'Humour). Arsenal Detective = Routeur Inverse (D-057).",
    connexions: ["D-057 Routeur Inverse", "SOUL templates", "Trisociation"],
  },
  {
    id: "I-011",
    titre: "Board Room CA Robotique",
    source: "D-099 / S36",
    categorie: "produit",
    maturite: "prete",
    description: "Design valide. Board Room avec simulation de CA (conseil d'administration) robotique. Les bots C-Level debattent comme un vrai CA. Apres COMMAND frontend.",
    connexions: ["D-109 3 Rooms", "War Room", "Bot-to-Bot"],
  },
  {
    id: "I-012",
    titre: "RayBan Meta + YouTube Push",
    source: "A.4 Tab17 / S50",
    categorie: "vision",
    maturite: "germe",
    description: "Integration RayBan Meta pour que CarlOS puisse voir ce que le user voit en temps reel. YouTube Push pour diffuser des sessions en live.",
    connexions: ["Stack Comm", "Console Droite", "Video Tavus"],
  },
];

const CATEGORIE_CONFIG: Record<Idee["categorie"], { label: string; color: string; icon: React.ElementType }> = {
  produit: { label: "Produit", color: "blue", icon: Package },
  tech: { label: "Tech", color: "violet", icon: Code2 },
  business: { label: "Business", color: "emerald", icon: TrendingUp },
  ux: { label: "UX", color: "pink", icon: Eye },
  infra: { label: "Infra", color: "orange", icon: Database },
  vision: { label: "Vision", color: "amber", icon: Star },
};

const MATURITE_CONFIG: Record<Idee["maturite"], { label: string; className: string }> = {
  germe: { label: "GERME", className: "bg-gray-100 text-gray-500 border-gray-200" },
  "en-reflexion": { label: "EN REFLEXION", className: "bg-amber-100 text-amber-700 border-amber-200" },
  prete: { label: "PRETE", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  integree: { label: "INTEGREE", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

function TabIdees() {
  const [filterCat, setFilterCat] = useState<Idee["categorie"] | "all">("all");

  const filtered = filterCat === "all" ? IDEES_PARKING : IDEES_PARKING.filter((i) => i.categorie === filterCat);

  const countByCat = (cat: Idee["categorie"]) => IDEES_PARKING.filter((i) => i.categorie === cat).length;
  const countByMat = (mat: Idee["maturite"]) => IDEES_PARKING.filter((i) => i.maturite === mat).length;

  return (
    <>
      {/* ── Intro ── */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-bold text-gray-800">Parking d'Idees</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">{IDEES_PARKING.length} idees</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Les idees arrivent vite mais on ne veut pas se defocuser. Ici on les capture, on les classe, et on pige dedans au bon moment quand le sprint le permet.
        </p>
      </Card>

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {(Object.keys(CATEGORIE_CONFIG) as Idee["categorie"][]).map((cat) => {
          const cfg = CATEGORIE_CONFIG[cat];
          const CIcon = cfg.icon;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? "all" : cat)}
              className={cn("p-2.5 rounded-lg border text-center transition-all",
                filterCat === cat ? `bg-${cfg.color}-100 border-${cfg.color}-300 ring-1 ring-${cfg.color}-300` : "bg-white border-gray-100 hover:bg-gray-50"
              )}
            >
              <CIcon className={cn("h-3.5 w-3.5 mx-auto mb-1", `text-${cfg.color}-500`)} />
              <div className="text-lg font-bold text-gray-800">{countByCat(cat)}</div>
              <div className="text-[9px] text-gray-500 uppercase">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* ── Maturite overview ── */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[9px] text-gray-400 uppercase tracking-wide">Maturite:</span>
        {(Object.keys(MATURITE_CONFIG) as Idee["maturite"][]).map((mat) => (
          <span key={mat} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", MATURITE_CONFIG[mat].className)}>
            {MATURITE_CONFIG[mat].label} ({countByMat(mat)})
          </span>
        ))}
      </div>

      {/* ── Liste des idees ── */}
      <div className="space-y-3">
        {filtered.map((idee) => {
          const catCfg = CATEGORIE_CONFIG[idee.categorie];
          const matCfg = MATURITE_CONFIG[idee.maturite];
          const CatIcon = catCfg.icon;
          return (
            <Card key={idee.id} className="p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${catCfg.color}-100`)}>
                  <CatIcon className={cn("h-4 w-4", `text-${catCfg.color}-600`)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <code className="text-[9px] font-mono font-bold text-gray-400">{idee.id}</code>
                    <span className="text-sm font-bold text-gray-800">{idee.titre}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", matCfg.className)}>{matCfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", `bg-${catCfg.color}-50 text-${catCfg.color}-700`)}>{catCfg.label}</span>
                    <span className="text-[9px] text-gray-400">{idee.source}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{idee.description}</p>
                  {idee.connexions && (
                    <div className="flex flex-wrap gap-1.5">
                      {idee.connexions.map((c) => (
                        <span key={c} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filterCat !== "all" && (
        <button
          onClick={() => setFilterCat("all")}
          className="mt-4 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Voir toutes les idees ({IDEES_PARKING.length})
        </button>
      )}
    </>
  );
}

// ======================================================================
// MAIN
// ======================================================================

export function MasterRoadmapPage() {
  const { setActiveView } = useFrameMaster();
  const [activeTab, setActiveTab] = useState<TabId>("active");

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "active", label: "Roadmap", icon: Map },
    { id: "archives", label: "Archives", icon: Archive },
    { id: "sommaire", label: "Sommaire", icon: Layers },
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "histoire", label: "Histoire", icon: BookOpen },
    { id: "idees", label: "Idees", icon: Lightbulb },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "active": return <TabActive />;
      case "archives": return <TabArchives />;
      case "sommaire": return <TabSommaire />;
      case "timeline": return <TabTimeline />;
      case "histoire": return <TabHistoire />;
      case "idees": return <TabIdees />;
    }
  };

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Map}
          iconColor="text-amber-600"
          title="RD.1 Roadmap & Decisions"
          subtitle="Audit complet S51 — 9 mars 2026"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const TIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                      activeTab === tab.id
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    )}
                  >
                    <TIcon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          }
        />
      }
    >
      {renderTab()}
    </PageLayout>
  );
}
