/**
 * PlaybookUsineBleuePage.tsx — RD.7 Mon Blueprint
 * 1 chantier "Usine Bleue AI" contenant 13 projets pour livrer la plateforme complete
 * Equipe: Carl (N1) + Claude Code (BCT) + Gemini (PM) + 12 Bots C-Level
 * Futur modele de la section Blueprint officielle pour tous les utilisateurs
 */

import { useState } from "react";
import {
  Rocket, Wrench, Shield, Package, Users, Globe,
  Target, Brain, ChevronRight, ChevronDown,
  Flame, Bot, Code2, Eye, Zap,
  CheckCircle2, Clock, AlertTriangle, Lock,
  Layers, CreditCard, Network,
  BarChart3, Cpu,
  BookOpen, Scale, Radio, FileText, Route,
  Sparkles, Calendar, ListChecks,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// TYPES
// ================================================================

type TabId = "overview" | "timeline" | "chantiers" | "projets" | "missions" | "taches" | "opportunites" | "equipes";

interface Mission {
  label: string;
  bot: string;
  type?: "interne" | "externe" | "ouverte";  // interne = equipe, externe = fournisseur, ouverte = en attente de match
  sousTaches?: string[];  // Decomposition future — taches atomiques dans la mission
  missionLiee?: string;   // Harmonisation: ID mission de l'autre cote (mfg ↔ fournisseur)
}

interface Projet {
  id: string;
  label: string;
  desc: string;
  status: "done" | "en-cours" | "a-faire" | "bloque";
  bot: string;
  missions: string[];       // Phase 1: missions simples (string)
  bloque_par?: string;
}

interface Chantier {
  id: string;
  num: number;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  chaleur: "brule" | "couve" | "meurt";
  type: string;
  responsable: string;
  bots: string[];
  projets: Projet[];
  dependances?: string[];
  objectif: string;
  timing: string;
}

// ================================================================
// CONSTANTS
// ================================================================

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Layers },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "chantiers", label: "Chantiers", icon: Flame },
  { id: "projets", label: "Projets", icon: Package },
  { id: "missions", label: "Missions", icon: ListChecks },
  { id: "taches", label: "Taches", icon: CheckCircle2 },
  { id: "opportunites", label: "Opportunites", icon: Zap },
  { id: "equipes", label: "Equipes", icon: Users },
];

/** Navigation context shared across all tabs */
interface BlueprintNav {
  tab: TabId;
  chantierId: string | null;
  projetId: string | null;
  missionIdx: number | null;
  goTo: (tab: TabId, chantierId?: string | null, projetId?: string | null, missionIdx?: number | null) => void;
}

const STATUS_CONFIG = {
  "done": { label: "DONE", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  "en-cours": { label: "EN COURS", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  "a-faire": { label: "A FAIRE", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
  "bloque": { label: "BLOQUE", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

const CHALEUR_CONFIG = {
  "brule": { label: "BRULE", icon: Flame, color: "text-red-500" },
  "couve": { label: "COUVE", icon: Clock, color: "text-amber-500" },
  "meurt": { label: "MEURT", icon: Lock, color: "text-gray-400" },
};

const BOT_INFO: Record<string, { label: string; short: string; gradient: string }> = {
  Carl: { label: "Carl", short: "CEO", gradient: "from-slate-800 to-slate-700" },
  Gemini: { label: "Gemini", short: "PM", gradient: "from-sky-600 to-sky-500" },
  BCO: { label: "CarlOS", short: "CEO Bot", gradient: "from-blue-600 to-blue-500" },
  BCT: { label: "Thierry", short: "CTO", gradient: "from-violet-600 to-violet-500" },
  BCF: { label: "François", short: "CFO", gradient: "from-emerald-600 to-emerald-500" },
  BCM: { label: "Martine", short: "CMO", gradient: "from-pink-600 to-pink-500" },
  BCS: { label: "Sophie", short: "CSO", gradient: "from-red-600 to-red-500" },
  BOO: { label: "Olivier", short: "COO", gradient: "from-orange-600 to-orange-500" },
  BFA: { label: "Fabien", short: "CPO", gradient: "from-amber-600 to-amber-500" },
  BHR: { label: "Hélène", short: "CHRO", gradient: "from-teal-600 to-teal-500" },
  BIO: { label: "Inès", short: "CINO", gradient: "from-rose-600 to-rose-500" },
  BRO: { label: "Raphaël", short: "CRO", gradient: "from-amber-600 to-amber-500" },
  BLE: { label: "Louise", short: "CLO", gradient: "from-indigo-600 to-indigo-500" },
  BSE: { label: "Sébastien", short: "CISO", gradient: "from-gray-600 to-gray-500" },
};

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", cfg.bg, cfg.text, cfg.border)}>
      {cfg.label}
    </span>
  );
}

function BotBadge({ code }: { code: string }) {
  const info = BOT_INFO[code];
  if (!info) return <span className="text-[9px] text-gray-400">{code}</span>;
  return (
    <span className={cn("text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", info.gradient)}>
      {info.label}
    </span>
  );
}

// ================================================================
// PLAYBOOK TEMPLATES — Kits Lego pre-fabriques
// ================================================================

interface PlaybookTemplate {
  id: string;
  titre: string;
  description: string;
  type: "strategique" | "technologique" | "organisationnel" | "operationnel";
  industrie: string | null;
  bots: string[];
  nb_projets: number;
  nb_missions: number;
  duree: string;
  populaire?: boolean;
  /** Niveau auquel ce template s'applique */
  niveau: "chantier" | "projet" | "mission" | "tache";
}

const PLAYBOOK_TEMPLATES: PlaybookTemplate[] = [
  // Chantier-level playbooks
  { id: "PB-001", titre: "Transformation Numerique Complete", description: "Plan complet pour digitaliser les operations d'une PME manufacturiere. De l'audit initial au deploiement des outils.", type: "technologique", industrie: "manufacturier", bots: ["BCT", "BOO", "BCO"], nb_projets: 5, nb_missions: 22, duree: "6-12 mois", populaire: true, niveau: "chantier" },
  { id: "PB-002", titre: "Sprint Securite & Conformite", description: "Audit securite complet, mise en conformite, formation equipe. Du scan vulnerabilites au rapport final.", type: "technologique", industrie: null, bots: ["BSE", "BCT", "BLE"], nb_projets: 3, nb_missions: 14, duree: "2-3 mois", populaire: true, niveau: "chantier" },
  { id: "PB-003", titre: "Lancement Nouveau Produit", description: "De l'idee au marche: R&D, pricing, plan marketing, pipeline ventes, formation equipe.", type: "strategique", industrie: null, bots: ["BCM", "BCS", "BCF"], nb_projets: 4, nb_missions: 18, duree: "3-6 mois", populaire: true, niveau: "chantier" },
  { id: "PB-004", titre: "Restructuration Organisationnelle", description: "Reorganiser l'equipe, les processus et la culture. Inclut plan RH, communication interne, formation.", type: "organisationnel", industrie: null, bots: ["BHR", "BOO", "BCO"], nb_projets: 3, nb_missions: 12, duree: "3-4 mois", niveau: "chantier" },
  { id: "PB-005", titre: "Expansion Marche International", description: "Etude de marche, reglementation, partenaires locaux, adaptation produit, plan go-to-market.", type: "strategique", industrie: null, bots: ["BCS", "BCM", "BLE"], nb_projets: 4, nb_missions: 16, duree: "6-12 mois", populaire: true, niveau: "chantier" },
  { id: "PB-006", titre: "Automatisation Usine 4.0", description: "Plan complet d'automatisation: audit OEE, selection robots, integration MES, formation operateurs.", type: "operationnel", industrie: "manufacturier", bots: ["BOO", "BCT", "BFA"], nb_projets: 5, nb_missions: 24, duree: "6-18 mois", populaire: true, niveau: "chantier" },
  // Projet-level playbooks
  { id: "PB-P01", titre: "Audit Lean Manufacturing", description: "Audit 150 points couvrant les 7 gaspillages, 5S, Kanban. Rapport + plan d'action priorise.", type: "operationnel", industrie: "manufacturier", bots: ["BOO", "BFA"], nb_projets: 1, nb_missions: 8, duree: "2-4 semaines", niveau: "projet" },
  { id: "PB-P02", titre: "Plan Marketing Digital", description: "SEO, SEM, reseaux sociaux, email marketing, analytics. De la strategie a l'execution.", type: "strategique", industrie: null, bots: ["BCM", "BCT"], nb_projets: 1, nb_missions: 10, duree: "1-2 mois", niveau: "projet" },
  { id: "PB-P03", titre: "Due Diligence Acquisition", description: "Analyse financiere, juridique, operationnelle et RH d'une cible d'acquisition.", type: "strategique", industrie: null, bots: ["BCF", "BLE", "BCS"], nb_projets: 1, nb_missions: 12, duree: "4-8 semaines", niveau: "projet" },
  { id: "PB-P04", titre: "Implementation ERP/MES", description: "Selection, configuration, migration donnees, formation, go-live. Template adapte manufacturier.", type: "technologique", industrie: "manufacturier", bots: ["BCT", "BOO"], nb_projets: 1, nb_missions: 14, duree: "3-6 mois", niveau: "projet" },
  // Mission-level playbooks
  { id: "PB-M01", titre: "Analyse Concurrentielle", description: "Cartographie des concurrents, SWOT, positionnement. Livrable: rapport + recommandations.", type: "strategique", industrie: null, bots: ["BCS"], nb_projets: 1, nb_missions: 1, duree: "1-2 semaines", niveau: "mission" },
  { id: "PB-M02", titre: "Budget Projet Detaille", description: "Ventilation couts, timeline, ROI, scenarios optimiste/pessimiste. Template financier complet.", type: "strategique", industrie: null, bots: ["BCF"], nb_projets: 1, nb_missions: 1, duree: "3-5 jours", niveau: "mission" },
  { id: "PB-M03", titre: "Rapport Visite Usine", description: "Template structure: observations terrain, mesures, photos, recommandations, plan action.", type: "operationnel", industrie: "manufacturier", bots: ["BFA", "BOO"], nb_projets: 1, nb_missions: 1, duree: "1-2 jours", niveau: "mission" },
  { id: "PB-M04", titre: "Specification Technique", description: "Cahier des charges complet: exigences, contraintes, interfaces, criteres d'acceptation.", type: "technologique", industrie: null, bots: ["BCT"], nb_projets: 1, nb_missions: 1, duree: "1 semaine", niveau: "mission" },
  // Tache-level playbooks
  { id: "PB-T01", titre: "Checklist 5S", description: "25 criteres d'evaluation 5S avec scoring. Pret a deployer sur le plancher.", type: "operationnel", industrie: "manufacturier", bots: ["BOO"], nb_projets: 1, nb_missions: 1, duree: "2h", niveau: "tache" },
  { id: "PB-T02", titre: "Grille Evaluation Fournisseur", description: "Criteres qualite, delais, prix, service. Scoring pondere automatise.", type: "operationnel", industrie: null, bots: ["BFA", "BCF"], nb_projets: 1, nb_missions: 1, duree: "1h", niveau: "tache" },
  { id: "PB-T03", titre: "Post-Mortem Projet", description: "Template structure: ce qui a marche, ce qui n'a pas marche, lecons apprises, actions.", type: "organisationnel", industrie: null, bots: ["BCT", "BOO"], nb_projets: 1, nb_missions: 1, duree: "2h", niveau: "tache" },
  { id: "PB-T04", titre: "Plan de Communication Interne", description: "Messages cles, canaux, calendrier, responsables. Pour tout changement organisationnel.", type: "organisationnel", industrie: null, bots: ["BHR", "BCM"], nb_projets: 1, nb_missions: 1, duree: "3h", niveau: "tache" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "strategique": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "technologique": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  "organisationnel": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "operationnel": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

/** Carte playbook reutilisable */
function PlaybookCard({ pb, compact = false }: { pb: PlaybookTemplate; compact?: boolean }) {
  const tc = TYPE_COLORS[pb.type] || TYPE_COLORS.strategique;
  return (
    <Card className={cn("p-0 overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-pointer group", tc.border)}>
      <div className="px-3 py-2 flex items-center gap-2">
        <Package className={cn("h-4 w-4 shrink-0", tc.text)} />
        <span className={cn("text-xs font-bold flex-1 truncate", tc.text)}>{pb.titre}</span>
        {pb.populaire && <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
        <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold border", tc.bg, tc.text, tc.border)}>{pb.type.toUpperCase()}</span>
      </div>
      {!compact && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-[9px] text-gray-500 leading-relaxed">{pb.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {pb.bots.map((b) => <BotBadge key={b} code={b} />)}
          </div>
          <div className="flex items-center gap-3 text-[9px] text-gray-400">
            <span>{pb.nb_projets} projet{pb.nb_projets > 1 ? "s" : ""}</span>
            <span>{pb.nb_missions} mission{pb.nb_missions > 1 ? "s" : ""}</span>
            <span>{pb.duree}</span>
            {pb.industrie && <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 rounded font-medium text-gray-500">{pb.industrie}</span>}
          </div>
        </div>
      )}
    </Card>
  );
}

/** Section Templates reutilisable pour chaque tab */
function TemplateSection({ niveau, label }: { niveau: PlaybookTemplate["niveau"]; label: string }) {
  const [expanded, setExpanded] = useState(true);
  const templates = PLAYBOOK_TEMPLATES.filter((p) => p.niveau === niveau);
  if (templates.length === 0) return null;

  return (
    <Card className="p-0 overflow-hidden border border-dashed border-indigo-200 bg-indigo-50/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-indigo-50/50 transition-colors"
      >
        <BookOpen className="h-4 w-4 text-indigo-500" />
        <span className="text-xs font-bold text-indigo-700">Templates {label}</span>
        <span className="text-[9px] px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold ml-1">{templates.length}</span>
        <span className="text-[9px] text-indigo-400 ml-auto">Kits Lego pre-fabriques</span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {templates.map((pb) => (
            <PlaybookCard key={pb.id} pb={pb} />
          ))}
        </div>
      )}
    </Card>
  );
}

// ================================================================
// DATA — 13 PROJETS (dans le chantier "Application Usine Bleue AI")
// ================================================================

const CHANTIERS: Chantier[] = [
  // ── CH-1: FONDATIONS & CODE PROPRE ──
  {
    id: "CH-1", num: 1, label: "Fondations & Code Propre",
    desc: "Nettoyer la base technique pour construire solide. Dette technique zero avant d'accueillir des clients.",
    icon: Wrench, color: "violet", chaleur: "brule", type: "technologique",
    responsable: "Claude Code (BCT)", bots: ["BCT", "BCO"],
    objectif: "Code propre, zero dette, standards uniformes",
    timing: "Sprint 5 (immediat)",
    projets: [
      { id: "P-1.0", label: "94/94 Test Protocols ✓", desc: "Tous protocoles valides. test_protocols.py passe a 100%.",
        status: "done", bot: "BCT",
        missions: ["BCT: 94 tests protocoles valides", "BCT: Vite build pipeline stable"] },
      { id: "P-1.1", label: "BTML → GHML Rename", desc: "~100 remplacements dans 8 fichiers Python.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Script rename_terms.py automatise", "BCT: Backup + execution 8 fichiers", "BCT: Tests pytest + deploy", "Carl: Validation post-rename (test Telegram)"] },
      { id: "P-1.2", label: "Elimination BCC/BPO Intrus", desc: "~111 occurrences de bots fantomes frontend+backend.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Grep BCC/BPO partout", "BCT: Supprimer frontend (types, simulation-data)", "BCT: Supprimer backend (agents, context_builder)", "BCT: Build + tests", "Carl: GO/STOP avant purge finale"] },
      { id: "P-1.3", label: "CSS Standardisation", desc: "Audit composants vs design-system.md. Corriger padding, fonts, gaps.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Audit page par page (27 vues)", "BCT: Corriger ecarts vs design-system.md", "BCT: Verification cross-page", "Carl: Revue visuelle finale (chaque page)"] },
      { id: "P-1.4", label: "Tests & Couverture", desc: "3 pre-existing failures corriges. CI frontend.",
        status: "en-cours", bot: "BCT",
        missions: ["BCT: Fixer 3 failures test_bridge.py", "BCT: CI frontend (vite build check)", "BCT: Valider 94/94 test_protocols.py"] },
      { id: "P-1.5", label: "Core Type System (D-108)", desc: "Types TypeScript standardises pour TOUS les objets GHML: bots, missions, chantiers, diagnostics.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Schema types centraux (Bot, Mission, Chantier, Diagnostic)", "BCT: Validation Zod sur API responses", "BCT: Eliminer les any/unknown dans le frontend", "BCT: Types partages frontend↔backend", "Carl: Valider nomenclature finale des types"] },
    ],
  },

  // ── CH-2: SECURITE & INFRASTRUCTURE ──
  {
    id: "CH-2", num: 2, label: "Securite & Infrastructure",
    desc: "Production-grade: auth, separation dev/live, stabilite vocale, telephonie.",
    icon: Shield, color: "red", chaleur: "brule", type: "technologique",
    responsable: "Claude Code (BCT)", bots: ["BCT", "BSE", "BCO"],
    objectif: "Multi-user auth, infra stable, zero downtime",
    timing: "Sprint 5-6", dependances: ["CH-1"],
    projets: [
      { id: "P-2.A", label: "Sprint Securite B.8 ✓", desc: "UFW, CORS restrictif, API key rotation, rate limit 30/min, login server-side.",
        status: "done", bot: "BCT",
        missions: ["BCT: UFW deny incoming + allow 2222/80/443", "BSE: CORS restrictif (app.usinebleue.ai only)", "BCT: API key rotation + rate limit 30/min", "BCT: Login server-side SHA256"] },
      { id: "P-2.B", label: "Architecture 2 VPS B.9 ✓", desc: "VPS2 production LIVE, VPS1 dev/staging, Guardian monitoring.",
        status: "done", bot: "BCT",
        missions: ["BCT: VPS2 PostgreSQL + Nginx + SSL Let's Encrypt", "BCT: DNS app.usinebleue.ai → VPS2", "BSE: Guardian health 5min + scan daily + backup 3h"] },
      { id: "P-2.C", label: "Telephonie Twilio B.10 ✓", desc: "bridge_phone.py + 5 endpoints + NIP N2 (D-088/089).",
        status: "done", bot: "BCT",
        missions: ["BCT: bridge_phone.py + setup_sip_livekit.py", "BCT: 5 endpoints telephonie API", "BCT: phone_auth DB + NIP PIN 6284"] },
      { id: "P-2.1", label: "JWT Authentication Multi-User", desc: "Remplacer login statique par JWT + sessions.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Schema JWT (access + refresh)", "BCT: Middleware auth FastAPI", "BCT: Frontend auth context + guards", "BSE: Audit securite auth", "Carl: Definir roles utilisateur (admin, pioneer, demo)"] },
      { id: "P-2.2", label: "Separation Dev / Live", desc: "14 bloqueurs identifies: chemins hardcodes, IPs.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Audit 14 bloqueurs", "BCT: Variables .env pour chemins", "BCT: Script deploy VPS1→VPS2", "Carl: Valider checklist pre-go-live"] },
      { id: "P-2.3", label: "Voice Stability (B.4.7)", desc: "Coupure 2min sur appels vocaux. BLOQUANT demos.",
        status: "bloque", bot: "BCT", bloque_par: "Test vocal avec Carl",
        missions: ["BCT: Test close_on_disconnect", "BCT: Heartbeat keepalive", "BCT: Test 10+ min continu", "Carl: Test appel vocal 10+ min pour valider"] },
      { id: "P-2.4", label: "Migration Telnyx", desc: "bridge_telnyx.py PRET, bloque sur credentials.",
        status: "bloque", bot: "BCT", bloque_par: "Carl: compte Telnyx",
        missions: ["Carl: Creer compte app.telnyx.com", "BCT: 4 vars .env", "BCT: LiveKit Inbound Trunk"] },
      { id: "P-2.5", label: "Status Page & Monitoring", desc: "Page publique + alertes automatiques.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Endpoint /health enrichi", "BCT: Page status frontend", "BSE: Alertes Guardian enrichies", "Carl: Definir SLA cible (uptime %)"] },
    ],
  },

  // ── CH-3: CONTENU & MINE D'OR ── (NOUVEAU)
  {
    id: "CH-3", num: 3, label: "Contenu & Mine d'Or",
    desc: "Les donnees qui font tourner la machine. Sans contenu structure, CarlOS = Ferrari sans essence.",
    icon: BookOpen, color: "teal", chaleur: "brule", type: "operationnel",
    responsable: "Gemini (PM)", bots: ["BCO", "BCT", "BCS"],
    objectif: "Contenu reel injectable dans chaque bot et chaque flow",
    timing: "Sprint 5-6 (parallele CH-1)", dependances: [],
    projets: [
      { id: "P-3.1", label: "7 Catalogues JSON", desc: "diagnostics, gaps, missions, templates — data reelle.",
        status: "a-faire", bot: "BCT",
        missions: ["Gemini: Generer diagnostics-universels.json (54)", "Gemini: Generer diagnostics-sectoriels.json", "BCT: Generer templates-projets.json", "BCT: Generer templates-documentaires.json (132)", "Carl: Valider pertinence diagnostics (experience terrain)"] },
      { id: "P-3.2", label: "Contenu Sectoriel par Industrie", desc: "MFG, alimentation, metal, plastique — benchmarks reels.",
        status: "a-faire", bot: "BCS",
        missions: ["Gemini: Recherche benchmarks par SCIAN", "BCS: Structurer data par secteur", "BCT: Injecter dans company kits JSON", "Carl: Valider benchmarks vs realite REAI"] },
      { id: "P-3.3", label: "Protocole Usine Bleue Digitalisé", desc: "mine-dor/ 58 fichiers → injectables dans les bots.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Parser CREDO 296p en modules", "BCO: Parser Boost Camp en etapes", "BCT: Schema injection prompt par module", "Carl: Valider fidelite au protocole original"] },
      { id: "P-3.4", label: "Cartographie Industrielle QC", desc: "iCRIQ 13,694 etablissements + REAI 130+ membres.",
        status: "a-faire", bot: "BRO",
        missions: ["BRO: Source iCRIQ SCIAN", "BRO: Source REAI membres", "BCT: Schema DB cartographie"] },
      { id: "P-3.5", label: "Company Kits Standardises", desc: "Schema universel pour tout client. 2 kits demo existants.",
        status: "en-cours", bot: "BCT",
        missions: ["BCT: Schema JSON standardise", "BCM: Template kit par secteur", "Carl: Valider avec 3 entreprises pilotes"] },
      { id: "P-3.6", label: "Mega Prompts V3 (5 restants)", desc: "7 mega prompts strategiques. Prompts 1+2 DONE. Prompts 3-7 a generer.",
        status: "en-cours", bot: "BCO",
        missions: ["Gemini: Prompt 3 — Templates Strategiques", "Gemini: Prompt 4 — Taches Departements", "Gemini: Prompt 5 — Orbite & Reseau", "Gemini: Prompt 6 — Onboarding & Parcours", "Gemini: Prompt 7 — Oracle & Predictions"] },
      { id: "P-3.7", label: "Catalogue Missions Standardise", desc: "100+ missions reelles par departement × bot. Base de donnees actionnable.",
        status: "a-faire", bot: "BOO",
        missions: ["BOO: Definir 10 missions par departement (120 total)", "Gemini: Enrichir descriptions + criteres de succes", "BCT: Table missions_catalogue PostgreSQL", "BCT: API /missions/catalogue + filtrage par dept/bot"] },
    ],
  },

  // ── CH-4: PRODUIT COMPLET ──
  {
    id: "CH-4", num: 4, label: "Produit Complet",
    desc: "Remplacer TOUS les mocks par des donnees reelles. Chaque ecran fonctionne a 100%.",
    icon: Package, color: "blue", chaleur: "brule", type: "technologique",
    responsable: "Claude Code (BCT)", bots: ["BCT", "BCO", "BOO"],
    objectif: "Zero mock, zero placeholder, tout est reel",
    timing: "Sprint 6", dependances: ["CH-1", "CH-2", "CH-3"],
    projets: [
      { id: "P-4.A", label: "LiveChat Complet B.1 ✓", desc: "Branches d'idees, multi-perspectives, sentinelle, cristallisation.",
        status: "done", bot: "BCT",
        missions: ["BCT: LiveChat multi-branch + sentinelle", "BCT: Cristallisation synthese", "BCT: 7 boutons action (Nuancer, Risques, etc.)"] },
      { id: "P-4.B", label: "12 Bots + Sidebar V2 B.2/B.3 ✓", desc: "12 bots C-Level meme pattern + Sidebar V2 4 sections + Cockpit.",
        status: "done", bot: "BCT",
        missions: ["BCT: 12 bots C-Level (meme pattern)", "BCT: Sidebar V2 (Mon Espace/Reseau/Industrie/Rooms)", "BCT: CockpitView dashboard"] },
      { id: "P-4.C", label: "COMMAND Engine C.10 ✓", desc: "bridge_command.py LIVE — CommandLive + CommandCompiler + CommandDetector.",
        status: "done", bot: "BCT",
        missions: ["BCT: bridge_command.py (3 classes)", "BCT: Tables command_missions + compiled_briefings", "BCT: 4 endpoints API COMMAND"] },
      { id: "P-4.D", label: "Orbit9 Matching C.12 ✓", desc: "3 tables + 15 endpoints + scoring Gemini Flash + trisociation LiveKit.",
        status: "done", bot: "BCT",
        missions: ["BCT: 3 tables PostgreSQL (members/cellules/matches)", "BCT: 15 endpoints REST", "BCT: Scoring Gemini Flash + trisociation"] },
      { id: "P-4.E", label: "Mon Bureau Reel S36 ✓", desc: "PostgreSQL projets/docs/outils + Plane.so taches + upload fichiers.",
        status: "done", bot: "BCT",
        missions: ["BCT: PostgreSQL tables projets/docs/outils", "BCT: Integration Plane.so API", "BCT: Upload fichiers multipart"] },
      { id: "P-4.F", label: "Espace Unifie S46 ✓", desc: "MesChantiersView 4 tabs + EspaceBureau refonte + 141 templates enrichis.",
        status: "done", bot: "BCT",
        missions: ["BCT: MesChantiersView 4 tabs", "BCT: EspaceBureauView refonte", "BCT: 141 templates (80 nouveaux) + 403 sections"] },
      { id: "P-4.G", label: "FE.9 Mon Reseau S51 ✓", desc: "Page Mon Reseau 7 tabs: Profil, Cellules, Jumelage, Pionniers, Gouvernance, Dashboard, Industrie. Reutilise 5 pages Orbit9 + 7 enrichments FE.5.",
        status: "done", bot: "BCT",
        missions: [
          "BCT: 7 tabs (Profil/Cellules/Jumelage/Pionniers/Gouvernance/Dashboard/Industrie)",
          "BCT: Import 5 pages existantes (CellulesPage, JumelageLivePage, PionniersPage, GouvernancePage, TrgIndustriePage)",
          "BCT: 7 enrichments (CarlOS Mediateur, Meetings Cellule, Performance Cellule, Pipeline Jumelage, Mouvement Pionniers, Programme Partenaires, Standards Qualite)",
          "BCT: Cross-tab navigation (handleNavigate inter-tabs)",
          "BCT: Contenu FE.5 C.2.2.5 integre — gap analysis complete + enrichments manquants ajoutes",
          "BCT: Wiring sidebar FE.9 + FrameMasterContext + CenterZone routing",
        ] },
      { id: "P-4.H", label: "Master GHML 3 Pages S51 ✓", desc: "FE.8 Console Droite + FE.9 Mon Reseau + RD.8 Blueprint Reseau — pages + sidebar + routing.",
        status: "done", bot: "BCT",
        missions: [
          "BCT: FE.8 Console Droite (FESidebarDroitePage) — inventaire complet sidebar droite",
          "BCT: FE.9 Mon Reseau (FEMonReseauPage) — page unifiee Orbit9 7 tabs",
          "BCT: RD.8 Blueprint Reseau (BlueprintReseauPage) — profil reseau + objectifs",
          "BCT: SectionMasterGHML mis a jour (3 nouvelles entrees)",
          "BCT: FrameMasterContext ActiveView types ajoutes",
          "BCT: CenterZone routing + lazy imports",
        ] },
      { id: "P-4.1", label: "CockpitView KPIs Reels", desc: "Remplacer MOCK_STATS par endpoint /cockpit/kpis.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Endpoint /cockpit/kpis", "BCT: Calculer KPIs depuis DB", "BCT: Wirer CockpitView.tsx"] },
      { id: "P-4.2", label: "3 Rooms CRUD Dynamiques", desc: "Think/War/Board Room — de shells statiques a CRUD reel.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Schema rooms table", "BCT: 4 endpoints CRUD", "BCT: Frontend dynamique (participants, votes)", "Carl: Definir regles de gouvernance par Room"] },
      { id: "P-4.3", label: "COMMAND Frontend Complet", desc: "Backend LIVE. Frontend: progression, delegation.",
        status: "en-cours", bot: "BCT",
        missions: ["BCT: CommandLaunchBanner stages", "BCT: Mission delegation cards", "BCT: COMMAND auto-activation tension", "Carl: Valider points GO/STOP dans le flow COMMAND"] },
      { id: "P-4.4", label: "Templates Lego", desc: "141 templates editables, composables, exportables.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: UI editeur template", "BCT: Export PDF/DOCX", "BOO: Composition multi-template"] },
      { id: "P-4.5", label: "Menu Gauche — Hierarchie CEO", desc: "Reorganiser sidebar selon logique N1→N2→N3: CEO+CarlOS (global) → plonge dans chantier + bots.",
        status: "a-faire", bot: "BCT",
        missions: ["Carl: Definir structure menu cible (notes prises)", "BCT: Refonte SidebarLeft sections", "BCT: CarlOS toujours visible (bandeau persistant)", "BCT: Bots contextuels selon chantier actif"] },
      { id: "P-4.6", label: "Focus Mode & Canvas WOW", desc: "Click bloc dashboard → FocusModeLayout (element en haut + LiveChat en bas). Document Canvas Mode.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: FocusModeLayout.tsx (nouveau composant)", "BCT: Wire DashboardView blocs → Focus Mode", "BCT: Document Canvas (editeur gauche + LiveChat droite)", "BCT: CanvasActionContext insert_block action"] },
      { id: "P-4.7", label: "CarlOSPresence 34 Sections", desc: "Messages contextuels CarlOS pour CHAQUE section (28 DATA + 6 ACTION). D-101 complet.",
        status: "en-cours", bot: "BCO",
        missions: ["BCO: Messages 12 departements (DATA)", "BCO: Messages Mon Bureau 6 sous-sections", "BCO: Messages 3 Rooms + Blueprint + Orbit9", "BCO: Flow prompts 6 sections ACTION"] },
      { id: "P-4.8", label: "Backend Gestion Projet (Missions/Taches CRUD)", desc: "Moteur de gestion de projet natif dans CarlOS. Tables missions + taches + assignations + statuts + liens inter-missions. Le coeur operationnel du Blueprint.",
        status: "a-faire", bot: "BCT",
        missions: [
          "BCT: Table missions (id, projet_id, label, type interne/externe/ouverte, status, bot_assignee, humain_assignee, deadline)",
          "BCT: Table taches (id, mission_id, label, status, assignee, ordre, completed_at)",
          "BCT: Table mission_links (mission_interne_id ↔ mission_externe_id, tenant_mfg, tenant_fournisseur)",
          "BCT: Endpoints CRUD missions (/missions, /missions/{id}/taches, /missions/{id}/status)",
          "BCT: Endpoint /missions/ouvertes (feed fournisseurs — filtrage par profil/secteur)",
          "BCT: Webhook status change → notification + sync COMMAND engine",
          "BCO: Integration COMMAND — mission creee depuis discussion LiveChat (action footer)",
          "BCO: CarlOS auto-assign bot selon specialite + contexte chantier",
          "Carl: Valider schema DB (structure = fondation de tout le systeme)",
        ] },
      { id: "P-4.9", label: "Connecteurs PM Externes (Import Client)", desc: "Les clients ont DEJA des outils de gestion (Monday, Asana, Trello, Jira, Notion). CarlOS pompe leurs donnees existantes pour demarrer avec du vrai contenu au lieu de repartir de zero.",
        status: "a-faire", bot: "BCT",
        missions: [
          "BCT: Architecture connector unifie (interface commune read/write/sync)",
          "BCT: Connecteur Monday.com (API GraphQL — populaire PME QC)",
          "BCT: Connecteur Asana (REST API — tres repandu)",
          "BCT: Connecteur Trello (REST API — simple, beaucoup de PME)",
          "BCT: Connecteur Jira (REST API — entreprises plus structurees)",
          "BCT: Connecteur Notion (API — startups et PME tech)",
          "BCT: Import initial — mapper projets/taches externes → Chantiers/Projets/Missions CarlOS",
          "BCT: Sync bi-directionnelle optionnelle (client garde son outil + CarlOS par-dessus)",
          "BCO: CarlOS analyse les taches importees et propose organisation en chantiers",
          "BCO: Detection gaps — 'vous avez 47 taches mais aucun chantier structure, je propose...'",
          "Carl: Choisir les 3 connecteurs prioritaires (selon base clients REAI)",
        ] },
    ],
  },

  // ── CH-5: INTELLIGENCE DES AGENTS ── (NOUVEAU)
  {
    id: "CH-5", num: 5, label: "Intelligence des Agents",
    desc: "Rendre chaque bot UTILE. La difference entre un chatbot et un vrai conseiller C-Level.",
    icon: Cpu, color: "indigo", chaleur: "brule", type: "technologique",
    responsable: "Gemini (PM) + Claude Code", bots: ["BCT", "BCO", "BCS"],
    objectif: "12 bots specialises, SOULs riches, trisociation effective",
    timing: "Sprint 5-7 (progressif)", dependances: ["CH-3"],
    projets: [
      { id: "P-5.A", label: "Gouvernance Phase 1 C.9 ✓", desc: "decision_log + 4 endpoints API + frontend hooks auto-log.",
        status: "done", bot: "BCT",
        missions: ["BCT: Table decision_log PostgreSQL", "BCT: 4 endpoints CRUD decisions", "BCT: Frontend hooks auto-log D-xxx"] },
      { id: "P-5.1", label: "SOULs Enrichis 12 Bots", desc: "BCO a 10,130 chars. Les 6 nouveaux = squelettes. Enrichir tous.",
        status: "a-faire", bot: "BCO",
        missions: ["Gemini: Generer SOUL enrichi par bot (12 sections)", "BCO: Valider voix/ton par personnalite", "BCT: Deployer SOULs dans workspace/", "Carl: Approuver personnalite + ton de chaque bot"] },
      { id: "P-5.2", label: "Trisociation Effective", desc: "3 OS par bot injectes dans le prompt, pas juste documentes.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Injecter OS triplet dans system prompt", "Gemini: Deep Search 12 Ghosts profiles", "BCT: Test qualite reponses avant/apres", "Carl: Tester conversations et valider qualite"] },
      { id: "P-5.3", label: "COMMAND par Bot", desc: "Chaque bot sait son role dans le pipeline COMMAND.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Matrice bot × stage COMMAND", "BCT: Delegation rules par specialite", "BOO: Test orchestration multi-bot", "Carl: Valider matrice delegation (quel bot fait quoi)"] },
      { id: "P-5.4", label: "36 Teintures Cognitives", desc: "Herrmann quadrants x 9 modes = 36 teintures activables.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: UI selecteur teintures (grille 4x9)", "BCT: Injection teinture dans prompt", "BCO: Persistance preference par user", "Carl: Valider les 36 combinaisons (qualite reponse)"] },
      { id: "P-5.5", label: "Comportement D1/D2/D3 Dynamique", desc: "Soldat → Lieutenant → Partenaire selon confiance.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Regles escalade D1→D2→D3", "BCT: Implementation dans bridge_command.py", "Gemini: Test scenarios autonomie", "Carl: Definir seuils de confiance pour chaque niveau"] },
      { id: "P-5.6", label: "Auto-Mount C-Suite (D-073)", desc: "CarlOS propose les bons bots selon le contexte. Upsell par confiance.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Scoring contextuel (quel bot pour quelle tension)", "BCO: SOUL injection contexte client", "BCO: Auto-suggestion C-Suite upgrade", "BCT: Frontend suggestion UI dans LiveChat"] },
      { id: "P-5.7", label: "COMMAND Surveillance & Qualite", desc: "Systeme de surveillance execution: chaque tache bot est validee. L'humain a ses propres taches et points de validation dans le flow.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Surveillance auto qualite reponses bots (scoring)", "BCO: Alertes si bot devie du mandat ou hallucine", "BCT: Dashboard qualite execution par bot", "BCT: Taches humain dans le pipeline (validation, GO/STOP)", "BCO: Points de controle humain dans le flow COMMAND", "BOO: Metriques performance par mission (temps, qualite, iterations)"] },
    ],
  },

  // ── CH-6: PLAYBOOKS & PARCOURS CLIENT ── (EXPANDED)
  {
    id: "CH-6", num: 6, label: "Playbooks & Parcours Client",
    desc: "Parcours zero-touch M1→M2→M3. CarlOS GPS guide le client. Valeur en 30 jours, accro en 60, autonome en 90.",
    icon: Target, color: "emerald", chaleur: "brule", type: "organisationnel",
    responsable: "CarlOS (BCO)", bots: ["BCO", "BCF", "BCM", "BOO"],
    objectif: "Client autonome en 90 jours, lance ses propres chantiers",
    timing: "Sprint 6-7", dependances: ["CH-3", "CH-4", "CH-5"],
    projets: [
      { id: "P-6.1", label: "CarlOS GPS Engine — Philosophie Directrice", desc: "REGLE D'OR: C'est TOUJOURS CarlOS qui propose, guide, insiste, relance. Le client dit OUI ou NON, point. Partir du fait que les clients sont dans le chaos, montes sur des bouts de chandelle. CarlOS organise leur bordel. Processus a l'epreuve des cabochons — meme le pire desorganise finit par avancer.",
        status: "a-faire", bot: "BCO",
        missions: [
          "BCO: Detecteur 'temps d'agir' (message analysis → CarlOS PROPOSE l'action)",
          "BCO: JAMAIS attendre que le client s'organise — CarlOS prend le volant",
          "BCO: Scoring quel Blueprint/chantier suggerer (VITAA gaps + contexte conversations)",
          "BCO: Systeme de relance intelligente — si le client repond pas, CarlOS revient a la charge",
          "BCO: Tolerance au chaos — le client peut sauter des etapes, CarlOS s'adapte et recompose",
          "BCT: Trigger propose-playbook depuis tension detectee dans les echanges",
          "Carl: Le client n'a JAMAIS a se demander 'quoi faire maintenant' — CarlOS le sait pour lui",
          "Carl: Valider logique de transition (experience terrain avec les cabochons du REAI)",
        ] },
      { id: "P-6.2", label: "Blueprint #1 — BoostCamp (Onboarding)", desc: "Premier Blueprint OBLIGATOIRE. CarlOS MENE le processus — le client suit. Capturer le BARE MINIMUM pour que CarlOS devienne intelligent. Pas besoin que le client soit organise — CarlOS extrait l'info via conversation naturelle, meme si le gars sait pas ou il s'en va. Processus a l'epreuve des cabochons.",
        status: "a-faire", bot: "BCO",
        missions: [
          "BCO: Accueil BoostCamp — CarlOS explique ce qu'il va faire (pas ce que le CLIENT doit faire)",
          "BCO: Etape 1 — CarlOS POSE les questions profil CEO (le client repond, c'est tout)",
          "BCO: Etape 2 — CarlOS EXTRAIT le profil entreprise via conversation (pas un formulaire plate)",
          "BCO: Etape 3 — Diagnostic VITAA express (CarlOS guide, 15 min, scoring auto)",
          "BCO: Si le client repond vague/incomplet → CarlOS reformule, insiste, propose des options",
          "BCO: Si le client decroche → CarlOS sauvegarde et reprend ou il etait la prochaine fois",
          "BCO: Quick Wins J1-J7 — CarlOS LIVRE 3 gains rapides sans que le client leve le petit doigt",
          "BCO: Lancement premier chantier — CarlOS PROPOSE le chantier, le client dit go ou pas",
          "BCF: Premiere projection financiere (CarlOS genere, le client voit le potentiel)",
          "Carl: Le processus doit fonctionner meme avec quelqu'un qui connait rien en techno",
          "Carl: C'est notre CREDO en action — CarlOS Connecte, Recherche, Expose, Demontre, Obtient",
          "Carl: Apres le BoostCamp, CarlOS a 80%+ du contexte — les 20% viennent organiquement",
          "Carl: Tester avec les pires cabochons du REAI — si ca marche avec eux, ca marche avec tous",
        ] },
      { id: "P-6.3", label: "Blueprint #2 — CarlOS Pilote Automatique", desc: "Post-BoostCamp (J31-60). CarlOS a le bare minimum — maintenant il CONDUIT. Il propose les routines, suggere les chantiers, relance quand ca stagne. Le client n'a qu'a suivre le GPS. Les bots patchent les trous en arriere-plan.",
        status: "a-faire", bot: "BCO",
        missions: [
          "BCO: Briefing matin auto-genere — CarlOS dit au client quoi faire aujourd'hui",
          "BCO: Recap soir — CarlOS resume ce qui a avance et ce qui bloque",
          "BCO: CarlOS detecte les trous dans le profil et POSE les questions (pas d'attente)",
          "BCO: Si le client ignore un enjeu critique → CarlOS insiste avec des angles differents",
          "BCS: 2e chantier auto-suggere — CarlOS dit 'ton plus gros gap c'est X, on lance?'",
          "BRO: Orbit9 matchings proposes — CarlOS dit 'j'ai trouve un fournisseur pour ton enjeu Y'",
          "BCO: Board Room hebdomadaire — CarlOS prepare tout, le client arrive et decide",
          "Carl: Le client doit realiser que CarlOS en sait plus sur son business que son comptable",
          "Carl: CarlOS ramasse les morceaux que le client laisse trainer — c'est la petite cuillere",
        ] },
      { id: "P-6.4", label: "Blueprint #3 — Autonomie & Ambassadeur", desc: "J61-90. Le client lance ses propres chantiers. CarlOS devient indispensable. Le tsunami AI arrive et le client est DEJA equipe. Il ramasse les autres a la petite cuillere parce qu'il a une longueur d'avance.",
        status: "a-faire", bot: "BCO",
        missions: [
          "BCO: Client lance chantier sans aide (CarlOS valide + optimise)",
          "BCO: CarlOS propose upgrade bots si le client atteint les limites du plan Solo",
          "BCF: Bilan ROI 90 jours — preuve de valeur concrete ($ sauve, heures gagnees)",
          "BCM: Referral program — le client convaincu devient ambassadeur",
          "BCO: Upgrade C-Suite si pertinent (12 bots, tous les departements couverts)",
          "Carl: Les PME qui survivront au tsunami AI seront celles qui ont adopte CarlOS en premier",
          "Carl: On l'a vu en pandemie 2021 — ceux qui etaient deja digitaux ont survécu, les autres ont coule",
        ] },
      { id: "P-6.5", label: "Bibliotheque Playbooks", desc: "30 universels + 15 sectoriels chargeables en 1 clic.",
        status: "en-cours", bot: "BCT",
        missions: ["BCT: API /playbooks/deploy endpoint", "Gemini: 45 playbooks structures (data)", "BCT: UI selection + preview + deploy"] },
      { id: "P-6.6", label: "Box Progressives (D-075)", desc: "Onboarding DOMINO: splash → quetes → valeur immediate.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Design 7 etapes onboarding", "BCT: Splash screen bienvenue", "BCT: Progression visible (% complete)", "Carl: Valider parcours onboarding (premiere impression = critique)"] },
      { id: "P-6.7", label: "API Connectors Nango (D-050)", desc: "5 connecteurs prioritaires pour importer les donnees client.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Docker Nango self-hosted", "BCT: Connecteur QuickBooks/Sage (70% PME QC)", "BCT: Connecteur HubSpot/Pipedrive", "BCT: Connecteur Google Workspace", "BCT: Connecteur Shopify/WooCommerce"] },
      { id: "P-6.8", label: "Dual Flow Manufacturier / Fournisseur", desc: "D-112: 2 parcours distincts. Le manufacturier a SES chantiers, le fournisseur voit chantiers internes + clients.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Flow Manufacturier (diagnostic → chantier → execution)", "BCO: Flow Fournisseur (chantiers internes + chantiers clients visibles)", "BCO: CarlOS GPS detecte gaps → propose jumelage Orbit9", "BCT: UI vue fournisseur (toggle interne/client)"] },
      { id: "P-6.9", label: "Structure Tarifaire & Pricing Orbit9", desc: "Pricing lie aux 9 stades de croissance Orbit9. Entree basse $995/mois (CarlOS seul, mieux que Claude/ChatGPT). Preuve de valeur AVANT upsell. Carl: 'Carlos montre les possibilites puis dit qu'il faut ajouter des bots'.",
        status: "a-faire", bot: "BCF",
        missions: [
          "Carl: Definir les 9 paliers tarifaires alignes sur les stades Orbit9",
          "Carl: Valider barriere d'entree $995/mois (CarlOS solo limité mais superieur)",
          "BCF: Modelisation LTV/CAC par palier Orbit9 (stade 1→9)",
          "BCF: Calcul valeur creee vs cout client (cible 5-10% du CA client)",
          "BCO: Flow upsell naturel — CarlOS prouve valeur → suggere ajout bots",
          "BCO: Trigger upsell intelligent (quand le CEO atteint les limites du plan solo)",
          "BCF: Grille progressive: Solo ($995) → Direction (+ bots) → C-Suite (12 bots) → Enterprise",
          "BCM: Test pricing avec 3 pioneers (perception valeur vs cout)",
          "BCF: Modele Razor/Blade — plateforme accessible, valeur dans les Blueprints et bots additionnels",
        ] },
      { id: "P-6.10", label: "Moteur Deploy Playbook → Chantier", desc: "Backend: charger un playbook template → creer un vrai chantier avec projets + missions assignees.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Endpoint /playbooks/deploy (template → chantier reel)", "BCT: Auto-assign missions aux bots selon specialite", "BCT: Frontend bouton 'Lancer ce Playbook'", "BCO: CarlOS confirme + ajuste avant deploy"] },
      { id: "P-6.11", label: "Blueprint Marketplace", desc: "Marketplace de Blueprints pre-packages achetables. Chaque Blueprint = plan d'execution complet (chantier + projets + missions). Monetisation additionnelle au-dela de l'abonnement.",
        status: "a-faire", bot: "BCM",
        missions: [
          "Carl: Definir les 10 premiers Blueprints vendables (universels + sectoriels)",
          "BCM: Pricing par Blueprint (achat unique vs inclus dans plan)",
          "BCT: Catalogue Blueprints avec preview + rating + secteur",
          "BCT: Bouton 'Acheter et Deployer' — Blueprint → chantier actif en 1 clic",
          "BCO: CarlOS recommande Blueprints selon diagnostic VITAA (gaps detectes)",
          "BCF: Revenue model Marketplace (commission, bundle, abonnement premium)",
          "BCM: Systeme reviews/ratings par les utilisateurs (preuve sociale)",
          "Carl: Valider que les Blueprints ne cannibalisent pas l'abonnement de base",
        ] },
    ],
  },

  // ── CH-7: GOUVERNANCE & COMPLIANCE ── (NOUVEAU)
  {
    id: "CH-7", num: 7, label: "Gouvernance & Compliance",
    desc: "Loi 25, audit trail, SLA. Sans ca, aucun fonds d'investissement ne nous touche.",
    icon: Scale, color: "gray", chaleur: "couve", type: "organisationnel",
    responsable: "Louise (BLE)", bots: ["BLE", "BSE", "BCO"],
    objectif: "Compliance Loi 25, SLA contractuel, audit trail complet",
    timing: "Sprint 7 (avant fonds)", dependances: ["CH-2"],
    projets: [
      { id: "P-7.1", label: "Loi 25 Compliance Complete", desc: "Consentement, retention, suppression, k-anonymat.",
        status: "a-faire", bot: "BLE",
        missions: ["BLE: Politique consentement utilisateur", "BSE: k-anonymat Oracle9 data", "BCT: Export/suppression donnees (droit d'acces)", "Carl: Revue finale compliance avec avocat"] },
      { id: "P-7.2", label: "Documents Legaux", desc: "Terms of Service, Privacy Policy, contrats clients.",
        status: "a-faire", bot: "BLE",
        missions: ["BLE: Rediger ToS", "BLE: Rediger Privacy Policy", "BLE: Template contrat Pioneer", "Carl: Approuver tous les documents legaux"] },
      { id: "P-7.3", label: "Audit Trail Client", desc: "Qui a fait quoi, quand, pourquoi. Immutable.",
        status: "a-faire", bot: "BSE",
        missions: ["BSE: Table audit_log PostgreSQL", "BCT: Middleware logging actions", "BSE: Dashboard audit admin"] },
      { id: "P-7.4", label: "SLA & Gouvernance Multi-Tenant", desc: "Uptime 99.5%, support response, protocole gouvernance.",
        status: "a-faire", bot: "BOO",
        missions: ["BOO: Definir SLA (uptime, support, response)", "BCT: Monitoring uptime automatise", "BLE: Contrat SLA integre", "Carl: Approuver SLA engagements (responsabilite CEO)"] },
    ],
  },

  // ── CH-8: COMMUNICATION UNIFIEE ── (NOUVEAU)
  {
    id: "CH-8", num: 8, label: "Communication Unifiee",
    desc: "Voice + Video + Chat + Tel + Canvas en UNE experience fluide. Continuite cross-canal.",
    icon: Radio, color: "rose", chaleur: "couve", type: "technologique",
    responsable: "Claude Code (BCT)", bots: ["BCT", "BCO"],
    objectif: "Experience fluide cross-canal, zero perte de contexte",
    timing: "Sprint 7-8", dependances: ["CH-2", "CH-4"],
    projets: [
      { id: "P-8.A", label: "Voice Pipeline Complet B.4.1-B.4.6 ✓", desc: "LiveKit + Deepgram STT + ElevenLabs 12 voix + Tavus video + Canvas auto-nav + Telephonie.",
        status: "done", bot: "BCT",
        missions: ["BCT: LiveKit agent + Deepgram nova-3 STT francais", "BCT: ElevenLabs 12 voix distinctes par bot", "BCT: Tavus video avatar Lucas Studio lip-sync", "BCT: Canvas auto-nav (keyword router + anti-bounce)", "BCT: Telephonie bridge_phone.py SIP"] },
      { id: "P-8.B", label: "Transcription Meetings B.5 ✓", desc: "Whisper transcription vocaux + stockage.",
        status: "done", bot: "BCT",
        missions: ["BCT: Whisper voice transcription pipeline", "BCT: Stockage transcripts DB + display"] },
      { id: "P-8.1", label: "Continuite Cross-Canal", desc: "Vocal → chat → visio sans perdre le contexte.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Session unifiee (1 thread multi-canal)", "BCT: Handoff vocal→chat transparent", "BCT: Context carry-over entre canaux"] },
      { id: "P-8.2", label: "Historique Unifie", desc: "Un seul fil de conversation peu importe le canal.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Merge voice transcripts + chat messages", "BCT: Timeline view multi-canal", "BCT: Search across all channels"] },
      { id: "P-8.3", label: "Notifications & Alertes", desc: "Push/email quand CarlOS complete une mission.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Notification system (in-app + email)", "BCO: Alertes CarlOS proactives", "BCT: Preferences notification par user"] },
      { id: "P-8.4", label: "Jitsi Multi-Participant", desc: "Board Room = 4+ personnes en visio + bots.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Jitsi room management", "BCT: Bot audio inject dans Jitsi", "BCO: CarlOS moderateur Board Room", "Carl: Tester Board Room avec participants reels"] },
    ],
  },

  // ── CH-9: MOTEUR COMMERCIAL ──
  {
    id: "CH-9", num: 9, label: "Moteur Commercial (Go-To-Market)",
    desc: "Lancer les 9 pioneers. Stripe billing. Marketing viral. Demo irresistible.",
    icon: CreditCard, color: "pink", chaleur: "couve", type: "strategique",
    responsable: "Carl (N1)", bots: ["BCO", "BCM", "BCS", "BCF"],
    objectif: "9 pioneers signes, revenue recurrent, viral loop active",
    timing: "Sprint 7 (mois 2)", dependances: ["CH-4", "CH-6"],
    projets: [
      { id: "P-9.1", label: "Stripe Billing", desc: "3 plans (Solo 249$, Direction 1200$, C-Suite 2995$).",
        status: "a-faire", bot: "BCF",
        missions: ["BCF: Stripe products + prices", "BCT: Checkout page + webhooks", "BCF: Upgrade/downgrade flow", "Carl: Valider pricing final avant go-live"] },
      { id: "P-9.2", label: "Pioneer Circle (9 Places)", desc: "Lancement exclusif: 9 spots, 1 par secteur.",
        status: "a-faire", bot: "BCM",
        missions: ["BCM: Landing page pioneer", "BCM: 4 leviers FOMO actifs", "Carl: Tournee 4 semaines (9 meetings)", "BCM: Follow-up automatise"] },
      { id: "P-9.3", label: "Marketing 360", desc: "Quiz acquisition, LinkedIn, essai Flash, GPI-50.",
        status: "a-faire", bot: "BCM",
        missions: ["BCM: Quiz 'Quel leader es-tu?'", "Carl: 3 posts LinkedIn/semaine", "BCM: Essai Flash 48h gratuit"] },
      { id: "P-9.4", label: "Demo Library Complete", desc: "11 entreprises QC reelles + scenarios pre-configures.",
        status: "en-cours", bot: "BCM",
        missions: ["BCM: Valider 11 company kits JSON", "BCM: Scenario demo par secteur (5 min)", "BCT: Mode demo (donnees sandbox)", "Carl: Repeter chaque demo (pitch = CEO)"] },
      { id: "P-9.5", label: "Guides Legaux C-Level", desc: "6 roles couverts. CEO+CFO faits, 4 restants.",
        status: "en-cours", bot: "BLE",
        missions: ["BLE: Guide CTO (30K chars)", "BLE: Guide CMO", "BLE: Guide CSO + COO"] },
      { id: "P-9.6", label: "Landing + Pricing Pages", desc: "Page publique ghostx.ai avec pricing, ROI calculator, temoignages.",
        status: "a-faire", bot: "BCM",
        missions: ["BCM: Landing page conversion (hero + social proof)", "BCM: Page pricing 3 plans avec toggle annuel", "BCT: ROI calculator interactif par industrie", "BCT: Integration Stripe checkout depuis landing"] },
      { id: "P-9.7", label: "Demo Mode Sandbox", desc: "Environnement demo avec donnees pre-configurees. Zero risque de toucher le live.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Snapshot DB demo (11 entreprises QC)", "BCT: Flag is_demo sur user session", "BCT: Reset automatique post-demo", "BCM: 5 scenarios demo par secteur (5 min chaque)"] },
    ],
  },

  // ── CH-10: ORBIT9 & RESEAU ──
  {
    id: "CH-10", num: 10, label: "Orbit9 & Reseau",
    desc: "Effet de reseau: matching reel, circles, ambassadeurs, coordination inter-entreprises.",
    icon: Network, color: "orange", chaleur: "couve", type: "strategique",
    responsable: "CarlOS (BCO)", bots: ["BCO", "BRO", "BCS", "BCF"],
    objectif: "Matching reel ecosysteme QC, circles actifs, viral loop",
    timing: "Sprint 7-8", dependances: ["CH-6", "CH-9"],
    projets: [
      { id: "P-10.1", label: "Scout Reel Ecosysteme QC", desc: "Remplacer prospects fictifs par scan reel.",
        status: "a-faire", bot: "BRO",
        missions: ["BRO: Source iCRIQ 13,694 etablissements", "BRO: Source REAI 130+ membres", "BCT: Integration orbit9_matches"] },
      { id: "P-10.2", label: "Qualification Pipeline 5 Etapes", desc: "Prospect brut → membre qualifie. LLM grading.",
        status: "a-faire", bot: "BCS",
        missions: ["BCS: 5 etapes qualification", "BRO: Scoring VITAA automatique", "BCO: Invitation formelle", "Carl: GO/STOP sur chaque invitation membre (reseau = reputation)"] },
      { id: "P-10.3", label: "Cellules CRUD Frontend", desc: "Creer/gerer cellules Orbit9 depuis l'interface.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: UI creation cellule (max 9)", "BCT: Trisociation auto-assign LiveKit", "BCT: Dashboard cellule"] },
      { id: "P-10.4", label: "Circle Mechanics", desc: "Rabais (-10% a -25%), ambassadeurs, commissions.",
        status: "a-faire", bot: "BCF",
        missions: ["BCF: Calcul rabais par taille cercle", "BCF: Programme ambassadeur 3 tiers", "BCT: Stripe group pricing", "Carl: Approuver grille rabais + commissions"] },
      { id: "P-10.5", label: "TimeTokens V2", desc: "Tracker contributions VITAA. Off-chain PostgreSQL.",
        status: "a-faire", bot: "BCF",
        missions: ["BCF: Table timetoken_ledger", "BCF: Multiplicateurs VITAA", "BCT: Dashboard contributions"] },
      { id: "P-10.6", label: "Chantiers Inter-Entreprises (D-112)", desc: "Un chantier peut etre partage entre manufacturier + fournisseur. CarlOS GPS comble les trous.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Detection gaps dans chantier (ressources manquantes)", "BCO: Proposition jumelage Orbit9 pour combler", "BCT: Schema chantier partage (owner + guest tenant)", "BCT: Vue missions partagees cross-entreprises", "BRO: Matching fournisseur → gap client"] },
      { id: "P-10.7", label: "Missions Ouvertes — Tableau Fournisseurs (Prime Spot)", desc: "Quand un manufacturier a une mission qui requiert une expertise externe, elle devient 'ouverte'. Les fournisseurs voient ces opportunites dans un tableau dedie (Prime Spot) et levent la main. CarlOS qualifie le match.",
        status: "a-faire", bot: "BCO",
        missions: ["BCO: Detecter missions necessitant expertise externe (gaps resources)", "BCT: Flag mission interne/externe/ouverte dans le schema", "BCT: Tableau Missions Ouvertes (vue fournisseur — Prime Spot)", "BCO: Notification fournisseur quand mission match son profil", "BCO: Fournisseur leve la main → CarlOS qualifie le fit", "Carl: Valider UX Prime Spot (premiere impression fournisseur = critique)", "BCS: Scoring compatibilite manufacturier↔fournisseur"] },
      { id: "P-10.8", label: "Harmonisation Missions Internes ↔ Externes", desc: "Le manufacturier a ses missions internes. Le fournisseur a les siennes. Quand un match se fait, les deux cotes s'imbriquent: la mission externe du mfg = mission interne du fournisseur. Chacun travaille avec ses propres bots.",
        status: "a-faire", bot: "BCO",
        missions: ["BCT: Schema mission_link (mission_interne_id ↔ mission_externe_id)", "BCO: Synchronisation statut bi-directionnelle (avancement visible des 2 cotes)", "BCT: Vue harmonisee — timeline croisee mfg + fournisseur", "BCO: CarlOS cote mfg supervise ses missions internes", "BCO: CarlOS cote fournisseur supervise ses missions internes", "BCO: Alertes si desynchronisation entre les 2 cotes", "Carl: Valider logique d'imbrication (experience terrain REAI)"] },
      { id: "P-10.9", label: "Pipeline Opportunites Fournisseur", desc: "Le fournisseur voit son pipeline d'opportunites: missions ouvertes matchees, propositions en cours, missions actives, missions completees. Son CarlOS l'aide a prioriser et livrer.",
        status: "a-faire", bot: "BCO",
        missions: ["BCT: Vue Pipeline Fournisseur (4 colonnes: Ouvertes/Proposees/Actives/Completees)", "BCO: CarlOS fournisseur priorise les opportunites par fit + potentiel", "BCO: CarlOS fournisseur prepare le pitch (pourquoi nous pour cette mission)", "BCF: Tracking valeur generee par mission externe (ROI fournisseur)", "BCM: Reputation fournisseur (score base sur missions completees)", "Carl: Definir regles de visibilite (quoi montrer au fournisseur, quoi garder confidentiel)"] },
    ],
  },

  // ── CH-11: DOCUMENTATION & BIBLES VIVANTES ── (NOUVEAU)
  {
    id: "CH-11", num: 11, label: "Documentation & Bibles Vivantes",
    desc: "La doc SE MET A JOUR toute seule quand les chantiers avancent. Le domino autogenerateur.",
    icon: FileText, color: "green", chaleur: "couve", type: "operationnel",
    responsable: "Gemini (PM)", bots: ["BCT", "BCO"],
    objectif: "Documentation auto-update, Help Center client, API docs",
    timing: "Sprint 7-8 (progressif)", dependances: ["CH-4"],
    projets: [
      { id: "P-11.1", label: "A.5 Bible Visuelle Cible", desc: "131 slots a remplir. Carl pointe vers A.1/A.4.",
        status: "en-cours", bot: "BCT",
        missions: ["Carl: Remplir les 131 slots", "BCT: Rendre slots interactifs", "BCT: Auto-reference A.1↔A.4"] },
      { id: "P-11.2", label: "Help Center Client-Facing", desc: "FAQ, tutoriels, guides onboarding.",
        status: "a-faire", bot: "BCM",
        missions: ["BCM: Rediger FAQ (50 questions)", "BCM: Tutoriels video (5 parcours)", "BCT: Interface Help Center"] },
      { id: "P-11.3", label: "API Documentation", desc: "Swagger live, webhook docs, integration guide.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Swagger auto-genere (FastAPI)", "BCT: Webhook documentation", "BCT: Guide integration partenaire"] },
      { id: "P-11.4", label: "Auto-Update Documentation", desc: "Quand un chantier avance, la doc se met a jour.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Hook post-deploy → update docs", "Gemini: Generation auto release notes", "BCT: Versionning Bible Produit"] },
    ],
  },

  // ── CH-12: ORACLE9 & INTELLIGENCE PREDICTIVE ──
  {
    id: "CH-12", num: 12, label: "Oracle9 & Intelligence Predictive",
    desc: "4 couches: Chercheur → Sondeur → Analyste → Oracle. Predictions industrielles.",
    icon: Brain, color: "amber", chaleur: "meurt", type: "technologique",
    responsable: "Gemini (PM)", bots: ["BCT", "BIO", "BCS"],
    objectif: "Predictions industrielles basees sur donnees reelles QC",
    timing: "Sprint 8+ (mois 3-6)", dependances: ["CH-10"],
    projets: [
      { id: "P-12.1", label: "Couche 1: Le Chercheur", desc: "Web scraping ISQ, StatCan, BDC, LinkedIn.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Playwright scraper ISQ CKAN", "BCT: StatCan WDS connector", "BCT: Stockage oracle9_searches"] },
      { id: "P-12.2", label: "Couche 2: Le Sondeur", desc: "Micro-surveys via LiveChat + voice. 3 modes.",
        status: "a-faire", bot: "BIO",
        missions: ["BIO: Questions passives dans LiveChat", "BIO: Questions contextuelles vocales", "BCT: Stockage oracle9_surveys"] },
      { id: "P-12.3", label: "Couche 3: L'Analyste", desc: "Aggregation DuckDB. k-anonymat. Benchmarks.",
        status: "a-faire", bot: "BCS",
        missions: ["BCT: Pipeline DuckDB aggregation", "BSE: k-anonymat Loi 25", "BCS: Benchmarks par SCIAN"] },
      { id: "P-12.4", label: "Couche 4: L'Oracle", desc: "Predictions statistiques. S-curves, Bass model.",
        status: "a-faire", bot: "BIO",
        missions: ["BCT: statsforecast/Nixtla", "BIO: NLG Gemini (texte lisible)", "BCT: Rapports WeasyPrint", "Carl: Valider predictions vs intuition terrain (sanity check)"] },
    ],
  },

  // ── CH-13: SCALE & EXPANSION ──
  {
    id: "CH-13", num: 13, label: "Scale & Expansion (9 → 81+)",
    desc: "Multi-tenant, marketplace experts, fonds institutionnels, international.",
    icon: Globe, color: "cyan", chaleur: "meurt", type: "strategique",
    responsable: "Carl (N1)", bots: ["BCO", "BCS", "BCF", "BRO"],
    objectif: "De 9 pioneers a 81+ clients, revenue 1M$+ Y1",
    timing: "Sprint 8+ (mois 3-12)", dependances: ["CH-9", "CH-10"],
    projets: [
      { id: "P-13.1", label: "Multi-Tenant RBAC", desc: "Row-Level Security PostgreSQL. Isolation complete.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: RLS policies toutes tables", "BCT: Tenant isolation (tenant_id)", "BSE: Tests isolation inter-tenants"] },
      { id: "P-13.2", label: "Instance Fonds (Niveau 2)", desc: "9 fonds cibles (616G$ AUM): CDPQ, BDC, FTQ...",
        status: "a-faire", bot: "BCS",
        missions: ["BCS: Approche Teralys (warmest)", "BCF: Package 9.995-49.995$/mois", "BCT: 5 tables DB fonds", "Carl: Meetings fonds (CEO = le closer)"] },
      { id: "P-13.3", label: "Expert Marketplace", desc: "Avocats, comptables, ingenieurs. CarlOS fait 80%.",
        status: "a-faire", bot: "BLE",
        missions: ["BLE: Schema expert_profiles", "BCT: Matching expert↔besoin", "BCF: Commission 15-20%"] },
      { id: "P-13.4", label: "Bot-to-Bot Orchestration", desc: "COMMAND cross-tenant. Bots de 2 entreprises collaborent.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: COMMAND cross-tenant protocol", "BSE: Permission model", "BCT: Audit trail inter-entreprise"] },
      { id: "P-13.5", label: "API Catalogue Client", desc: "Catalogues produits clients → matching Orbit9 steroide.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Schema catalogue standardise", "BCT: Endpoint ingestion", "BRO: Matching produit↔besoin"] },
      { id: "P-13.6", label: "White-Label & International", desc: "Instance personnalisee par client enterprise.",
        status: "a-faire", bot: "BCO",
        missions: ["BCT: Theme system (couleurs, logo)", "BCT: Multi-region (Canada d'abord)", "BLE: SLA contractuel partenaire", "Carl: Definir strategie expansion (marches cibles)"] },
      { id: "P-13.7", label: "Auto-Generation Bots GHML (D.4)", desc: "Generer nouveaux bots specialises a partir de templates GHML.",
        status: "a-faire", bot: "BCT",
        missions: ["BCT: Template GHML → SOUL generator", "BCT: UI creation bot (role + secteur + OS triplet)", "BCO: Validation auto qualite SOUL", "BCT: Deploy auto dans workspace/"] },
    ],
  },
];

// ================================================================
// COMPUTED STATS
// ================================================================

// Hierarchie: Chantiers → Projets → Missions → Taches
// Hierarchie Carl: 1 Chantier "Usine Bleue AI" → 13 Projets (= CHANTIERS[]) → Missions (= .projets[]) → Taches (= .missions[])
const NB_PROJETS = CHANTIERS.length; // 13 projets
const NB_MISSIONS = CHANTIERS.reduce((s, ch) => s + ch.projets.length, 0);
const NB_TACHES = CHANTIERS.reduce((s, ch) => s + ch.projets.reduce((s2, p) => s2 + p.missions.length, 0), 0);
const MISSIONS_DONE = CHANTIERS.reduce((s, ch) => s + ch.projets.filter((p) => p.status === "done").length, 0);
const MISSIONS_EN_COURS = CHANTIERS.reduce((s, ch) => s + ch.projets.filter((p) => p.status === "en-cours").length, 0);

// ================================================================
// TAB: VUE D'ENSEMBLE — Landing page Blueprint
// KPIs + chantiers clickables + opportunites + flow CREDO
// ================================================================

function TabOverview({ nav }: { nav: BlueprintNav }) {
  // Calculer les opportunites (missions avec besoin externe)
  const allMissions = CHANTIERS.flatMap((c) => c.projets.flatMap((p) => p.missions));
  const opportunites = allMissions.filter((m) => m.toLowerCase().includes("externe") || m.toLowerCase().includes("fournisseur") || m.toLowerCase().includes("ouverte") || m.toLowerCase().includes("partenaire"));

  const pctDone = Math.round((MISSIONS_DONE / NB_MISSIONS) * 100);
  const pctEnCours = Math.round((MISSIONS_EN_COURS / NB_MISSIONS) * 100);
  const pctAFaire = 100 - pctDone - pctEnCours;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ============ COLONNE GAUCHE ============ */}
      <div className="space-y-4">
        {/* 4 KPIs en 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Chantiers", value: "1", sub: "Usine Bleue AI", color: "red", icon: Flame, tab: "chantiers" as TabId },
            { label: "Projets", value: String(NB_PROJETS), sub: `${CHANTIERS.filter((c) => c.chaleur === "brule").length} brulent`, color: "blue", icon: Package, tab: "projets" as TabId },
            { label: "Missions", value: String(NB_MISSIONS), sub: `${MISSIONS_DONE} completes`, color: "violet", icon: ListChecks, tab: "missions" as TabId },
            { label: "Taches", value: String(NB_TACHES), sub: `${MISSIONS_EN_COURS} en cours`, color: "emerald", icon: CheckCircle2, tab: "taches" as TabId },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.label}
                onClick={() => kpi.tab && nav.goTo(kpi.tab)}
                className={cn(
                  "text-left p-0 overflow-hidden rounded-lg border shadow-sm transition-all",
                  kpi.tab ? "hover:shadow-md cursor-pointer group" : "cursor-default"
                )}
              >
                <div className={cn("flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase">{kpi.label}</span>
                  {kpi.tab && <ChevronRight className="h-3.5 w-3.5 text-white/50 ml-auto group-hover:text-white transition-colors" />}
                </div>
                <div className="px-3 py-2">
                  <div className={cn("text-xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
                  <div className="text-[9px] text-gray-400">{kpi.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progression — graphique ameliore */}
        <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Progression</span>
            <span className="ml-auto text-sm font-bold text-emerald-400">{pctDone}%</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {/* Barre segmentee */}
            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full flex items-center justify-center transition-all" style={{ width: `${pctDone}%` }}>
                {pctDone > 8 && <span className="text-[8px] font-bold text-white">{pctDone}%</span>}
              </div>
              <div className="bg-amber-400 h-full flex items-center justify-center transition-all" style={{ width: `${pctEnCours}%` }}>
                {pctEnCours > 8 && <span className="text-[8px] font-bold text-white">{pctEnCours}%</span>}
              </div>
              <div className="bg-gray-200 h-full flex items-center justify-center transition-all" style={{ width: `${pctAFaire}%` }}>
                {pctAFaire > 8 && <span className="text-[8px] font-bold text-gray-500">{pctAFaire}%</span>}
              </div>
            </div>

            {/* Barres par categorie */}
            <div className="space-y-1.5">
              {[
                { l: "Completes", v: MISSIONS_DONE, max: NB_MISSIONS, c: "emerald" },
                { l: "En cours", v: MISSIONS_EN_COURS, max: NB_MISSIONS, c: "amber" },
                { l: "A faire", v: NB_MISSIONS - MISSIONS_DONE - MISSIONS_EN_COURS, max: NB_MISSIONS, c: "gray" },
              ].map((row) => (
                <div key={row.l} className="flex items-center gap-2">
                  <span className="text-[9px] font-medium text-gray-500 w-16 shrink-0">{row.l}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", `bg-${row.c}-500`)} style={{ width: `${(row.v / row.max) * 100}%` }} />
                  </div>
                  <span className={cn("text-[9px] font-bold w-6 text-right", `text-${row.c}-600`)}>{row.v}</span>
                </div>
              ))}
            </div>

            {/* Stats inline */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { v: MISSIONS_DONE, l: "COMPLETES", c: "emerald" },
                { v: MISSIONS_EN_COURS, l: "EN COURS", c: "amber" },
                { v: NB_TACHES, l: "TACHES", c: "blue" },
              ].map((s) => (
                <div key={s.l} className={cn("text-center p-2 rounded-lg border", `bg-${s.c}-50 border-${s.c}-100`)}>
                  <div className={cn("text-lg font-bold", `text-${s.c}-600`)}>{s.v}</div>
                  <div className={cn("text-[9px] font-medium", `text-${s.c}-600`)}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 1 Chantier "Usine Bleue AI" avec 13 projets visibles */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">1 Chantier — {NB_PROJETS} Projets visibles</div>
          <div className="rounded-lg border shadow-sm overflow-hidden">
            {/* Chantier parent header */}
            <button onClick={() => nav.goTo("chantiers")} className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/20">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Application Usine Bleue AI</div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-white/80">{NB_PROJETS} projets · {NB_MISSIONS} missions · {NB_TACHES} taches</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors shrink-0" />
            </button>
            {/* 13 Projets (= chantiers dans le code) ouverts par defaut */}
            <div className="border-t border-blue-400/20 divide-y divide-gray-50">
              {CHANTIERS.map((c) => {
                const Icon = c.icon;
                const done = c.projets.filter((p) => p.status === "done").length;
                const ChaleurIcon = CHALEUR_CONFIG[c.chaleur].icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => nav.goTo("chantiers", c.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0 bg-gradient-to-br", `from-${c.color}-500 to-${c.color}-600`)}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-800 flex-1 truncate">{c.label}</span>
                    <span className="text-[9px] font-bold text-emerald-600">{done}/{c.projets.length}</span>
                    <ChaleurIcon className={cn("h-3.5 w-3.5", CHALEUR_CONFIG[c.chaleur].color)} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============ COLONNE DROITE ============ */}
      <div className="space-y-4">
        {/* Opportunites — grosse box */}
        {opportunites.length > 0 && (
          <Card className="p-0 overflow-hidden border-2 border-orange-200">
            <div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center gap-2">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Opportunites</span>
              <span className="text-[9px] px-2 py-0.5 bg-white/20 rounded text-white ml-auto font-bold">{opportunites.length}</span>
            </div>
            <div className="p-3 space-y-1.5">
              <p className="text-[9px] text-gray-500 mb-2">
                Besoins externes detectes par CarlOS → publie sur Orbit9 → match fournisseur.
              </p>
              {opportunites.slice(0, 6).map((m, i) => {
                const parts = m.split(": ");
                const text = parts.length > 1 ? parts.slice(1).join(": ") : m;
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-orange-100 bg-orange-50/50">
                    <Zap className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <span className="text-[9px] text-gray-800 flex-1 truncate">{text}</span>
                    <span className="text-[8px] px-1 py-0.5 bg-orange-200 text-orange-800 rounded font-bold shrink-0">EXT.</span>
                  </div>
                );
              })}
              {opportunites.length > 6 && (
                <button onClick={() => nav.goTo("opportunites")} className="w-full text-center text-[9px] text-orange-600 font-bold py-1 hover:bg-orange-50 rounded transition-colors">
                  Voir les {opportunites.length} opportunites →
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Playbooks Populaires — Kits Lego */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            Playbooks Populaires — Kits Lego
          </div>
          <div className="space-y-2">
            {PLAYBOOK_TEMPLATES.filter((p) => p.populaire).map((pb) => (
              <PlaybookCard key={pb.id} pb={pb} />
            ))}
          </div>
          <div className="mt-2 text-center">
            <span className="text-[9px] text-gray-400">{PLAYBOOK_TEMPLATES.length} templates — Projets ({PLAYBOOK_TEMPLATES.filter((p) => p.niveau === "chantier").length}) · Missions ({PLAYBOOK_TEMPLATES.filter((p) => p.niveau === "projet").length}) · Taches ({PLAYBOOK_TEMPLATES.filter((p) => p.niveau === "mission").length})</span>
          </div>
        </div>

        {/* Flow CREDO → Blueprint */}
        <Card className="p-0 overflow-hidden border border-gray-200">
          <div className="px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-600 flex items-center gap-2">
            <Route className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Flow CREDO → Blueprint</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Discussion", color: "gray", desc: "LiveChat CREDO" },
                { label: "→", color: "" },
                { label: "Action Footer", color: "violet", desc: "Nuancer, Deleguer..." },
                { label: "→", color: "" },
                { label: "Mission creee", color: "blue", desc: "Dans un projet" },
                { label: "→", color: "" },
                { label: "Blueprint", color: "emerald", desc: "Execution + suivi" },
                { label: "→", color: "" },
                { label: "Opportunite", color: "orange", desc: "Si besoin externe" },
              ].map((step, i) => step.label === "→" ? (
                <ChevronRight key={i} className="h-4 w-4 text-gray-300" />
              ) : (
                <div key={i} className={cn("text-center p-2 rounded-lg border min-w-[70px]", `bg-${step.color}-50 border-${step.color}-200`)}>
                  <div className={cn("text-[9px] font-bold", `text-${step.color}-700`)}>{step.label}</div>
                  <div className="text-[8px] text-gray-400">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Harmonisation Mfg ↔ Fournisseur */}
        <Card className="p-0 overflow-hidden border border-emerald-200">
          <div className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-600 flex items-center gap-2">
            <Network className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Harmonisation Interne ↔ Externe</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-[9px] font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Manufacturier</div>
                <div className="text-[9px] text-gray-600">Ses projets, ses missions. Quand un gap est detecte → mission ouverte publiee.</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-[9px] font-bold text-orange-700 mb-1.5 uppercase tracking-wide">Fournisseur</div>
                <div className="text-[9px] text-gray-600">Voit les missions ouvertes. Leve la main. CarlOS qualifie le match.</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex-1 h-px bg-blue-200" />
              <span className="text-[9px] font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">CarlOS orchestre les 2 cotes</span>
              <div className="flex-1 h-px bg-orange-200" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


// ================================================================
// SHARED: parseMission + ROLE_CONFIG (used by multiple tabs)
// ================================================================

const parseMission = (m: string) => {
  const parts = m.split(": ");
  const botCode = parts.length > 1 ? parts[0] : "?";
  const text = parts.length > 1 ? parts.slice(1).join(": ") : m;
  const isHumain = botCode === "Carl" || botCode === "Gemini";
  const isExterne = text.toLowerCase().includes("fournisseur") || text.toLowerCase().includes("externe") || text.toLowerCase().includes("ouverte");
  const role: "master" | "humain-ceo" | "humain-pm" | "bot" | "externe" =
    botCode === "BCO" ? "master" :
    botCode === "Carl" ? "humain-ceo" :
    botCode === "Gemini" ? "humain-pm" :
    isExterne ? "externe" : "bot";
  return { botCode, text, isHumain, isExterne, role, raw: m };
};

const ROLE_CONFIG = {
  "master":     { label: "CarlOS (Master)", badge: "MASTER", bg: "bg-blue-600", border: "border-blue-300", hover: "hover:border-blue-400 hover:bg-blue-50/30", ring: "ring-blue-200" },
  "humain-ceo": { label: "Humain (CEO)", badge: "CEO", bg: "bg-slate-700", border: "border-slate-300", hover: "hover:border-slate-400 hover:bg-slate-50", ring: "ring-slate-200" },
  "humain-pm":  { label: "Humain (PM)", badge: "PM", bg: "bg-sky-600", border: "border-sky-300", hover: "hover:border-sky-400 hover:bg-sky-50", ring: "ring-sky-200" },
  "bot":        { label: "Bot C-Level", badge: "BOT", bg: "bg-violet-500", border: "border-violet-200", hover: "hover:border-violet-300 hover:bg-violet-50/30", ring: "ring-violet-200" },
  "externe":    { label: "Externe", badge: "EXT", bg: "bg-orange-500", border: "border-orange-200", hover: "hover:border-orange-400 hover:bg-orange-50", ring: "ring-orange-200" },
};

// ================================================================
// TAB: CHANTIERS — Tous les chantiers (niveau 1)
// Click chantier → Projets tab
// ================================================================

function TabChantiers({ nav }: { nav: BlueprintNav }) {
  return (
    <div className="space-y-4">
      {/* Stats globaux */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2.5 bg-red-50 rounded-lg border border-red-100">
          <div className="text-lg font-bold text-red-600">1</div>
          <div className="text-[9px] text-red-600 font-medium">CHANTIER</div>
        </div>
        <div className="text-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-lg font-bold text-blue-600">{NB_PROJETS}</div>
          <div className="text-[9px] text-blue-600 font-medium">PROJETS</div>
        </div>
        <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
          <div className="text-lg font-bold text-violet-600">{NB_MISSIONS}</div>
          <div className="text-[9px] text-violet-600 font-medium">MISSIONS</div>
        </div>
        <div className="text-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="text-lg font-bold text-emerald-600">{NB_TACHES}</div>
          <div className="text-[9px] text-emerald-600 font-medium">TACHES</div>
        </div>
      </div>

      {/* 1 Chantier: Application Usine Bleue AI */}
      <button
        onClick={() => nav.goTo("projets", null, null, null)}
        className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
      >
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/20">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold text-white">Application Usine Bleue AI</span>
            <div className="text-[9px] text-white/70">{NB_PROJETS} projets · {NB_MISSIONS} missions · {NB_TACHES} taches</div>
          </div>
          <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
        </div>
        <div className="px-4 py-3">
          <p className="text-[9px] text-gray-500">Plateforme CarlOS complete — de la fondation technique a l'expansion marche. Chantier principal couvrant tous les aspects du produit.</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[9px] font-bold text-emerald-600">{MISSIONS_DONE} missions completees</span>
            <span className="text-[9px] text-amber-600">{MISSIONS_EN_COURS} en cours</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {["BCO", "BCT", "BCF", "BCM", "BCS", "BOO"].map((b) => <BotBadge key={b} code={b} />)}
            <span className="text-[9px] text-gray-400">+ 6 autres</span>
          </div>
        </div>
      </button>

      {/* Templates Chantier */}
      <TemplateSection niveau="chantier" label="Chantier" />
    </div>
  );
}

// ================================================================
// TAB: PROJETS — 13 Projets (= CHANTIERS[] dans le code)
// Sans selection: liste 13 projets / Avec selection: missions (= .projets[]) du projet
// ================================================================

function TabProjets({ nav, ch }: { nav: BlueprintNav; ch: Chantier | null }) {
  // Vue sans projet selectionne — liste des 13 projets
  if (!ch) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[9px]">
          <button onClick={() => nav.goTo("chantiers", null, null, null)} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">← Chantiers</button>
          <span className="text-gray-400">{NB_PROJETS} projets dans Usine Bleue AI</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{NB_PROJETS}</div>
            <div className="text-[9px] text-blue-600 font-medium">PROJETS</div>
          </div>
          <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
            <div className="text-lg font-bold text-violet-600">{NB_MISSIONS}</div>
            <div className="text-[9px] text-violet-600 font-medium">MISSIONS</div>
          </div>
          <div className="text-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="text-lg font-bold text-emerald-600">{MISSIONS_DONE}</div>
            <div className="text-[9px] text-emerald-600 font-medium">DONE</div>
          </div>
          <div className="text-center p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <div className="text-lg font-bold text-amber-600">{MISSIONS_EN_COURS}</div>
            <div className="text-[9px] text-amber-600 font-medium">EN COURS</div>
          </div>
        </div>

        {/* 13 Projet cards */}
        <div className="space-y-2">
          {CHANTIERS.map((c) => {
            const Icon = c.icon;
            const nbMissions = c.projets.length;
            const nbTaches = c.projets.reduce((s, p) => s + p.missions.length, 0);
            const done = c.projets.filter((p) => p.status === "done").length;
            return (
              <button key={c.id} onClick={() => nav.goTo("projets", c.id, null, null)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
                <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
                  <Icon className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">{c.label}</span>
                  <span className="text-[9px] text-white/70 ml-auto">{nbMissions} missions</span>
                  <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                </div>
                <div className="px-4 py-2.5">
                  <p className="text-[9px] text-gray-500 line-clamp-2">{c.desc}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] font-bold text-emerald-600">{done}/{nbMissions} done</span>
                    <span className="text-[9px] text-gray-400">{nbTaches} taches</span>
                    <span className="text-[9px] text-gray-400">{c.timing}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {[...new Set(c.bots)].map((b) => <BotBadge key={b} code={b} />)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <TemplateSection niveau="projet" label="Projet" />
      </div>
    );
  }

  // Vue avec projet selectionne — missions (= .projets[] dans le code) du projet
  const Icon = ch.icon;
  const nbTachesLocal = ch.projets.reduce((s, p) => s + p.missions.length, 0);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[9px] flex-wrap">
        <button onClick={() => nav.goTo("chantiers", null, null, null)} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          Chantiers
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button onClick={() => nav.goTo("projets", null, null, null)} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
          Projets
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className={cn("px-2 py-1 rounded font-bold", `bg-${ch.color}-100 text-${ch.color}-700`)}>
          {ch.label}
        </span>
      </div>

      {/* Projet header */}
      <Card className="p-0 overflow-hidden border shadow-sm">
        <div className={cn("px-4 py-3 bg-gradient-to-r", `from-${ch.color}-600 to-${ch.color}-500`)}>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">{ch.label}</span>
          </div>
          <p className="text-[9px] text-white/80 mt-1">{ch.desc}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[9px] text-white/70">{ch.projets.length} missions</span>
            <span className="text-[9px] text-white/70">{nbTachesLocal} taches</span>
            <span className="text-[9px] text-white/70">Objectif: {ch.objectif}</span>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center gap-1 flex-wrap">
          {ch.bots.map((b) => <BotBadge key={b} code={b} />)}
          <span className="text-[9px] text-gray-400 ml-2">Resp: {ch.responsable}</span>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { v: ch.projets.filter((p) => p.status === "done").length, l: "DONE", c: "emerald" },
          { v: ch.projets.filter((p) => p.status === "en-cours").length, l: "EN COURS", c: "amber" },
          { v: ch.projets.filter((p) => p.status === "a-faire").length, l: "A FAIRE", c: "gray" },
          { v: ch.projets.filter((p) => p.status === "bloque").length, l: "BLOQUES", c: "red" },
        ].map((s) => (
          <div key={s.l} className={cn("text-center p-2 rounded-lg border", `bg-${s.c}-50 border-${s.c}-100`)}>
            <div className={cn("text-lg font-bold", `text-${s.c}-600`)}>{s.v}</div>
            <div className={cn("text-[9px] font-medium", `text-${s.c}-600`)}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Mission cards */}
      <div className="space-y-2">
        {ch.projets.map((p) => {
          const botCodes = [...new Set(p.missions.map((m) => parseMission(m).botCode))];
          return (
            <button key={p.id} onClick={() => nav.goTo("missions", ch.id, p.id, null)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
              <div className="px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500">
                <code className="text-[9px] font-mono font-bold text-blue-200">{p.id}</code>
                <span className="text-xs font-bold text-white flex-1 truncate">{p.label}</span>
                <StatusBadge status={p.status} />
                <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <div className="px-4 py-2.5">
                <p className="text-[9px] text-gray-500 line-clamp-2">{p.desc}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] text-gray-400">{p.missions.length} taches</span>
                  {p.bloque_par && <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> {p.bloque_par}</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {botCodes.map((b) => <BotBadge key={b} code={b} />)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Templates Mission */}
      <TemplateSection niveau="mission" label="Mission" />
    </div>
  );
}

// ================================================================
// TAB: MISSIONS — Missions dans un projet (= .projets[] dans le code)
// Click mission → Taches tab (= .missions[] dans le code)
// ================================================================

function TabMissionsView({ nav, ch, projet }: { nav: BlueprintNav; ch: Chantier | null; projet: Projet | null }) {
  if (!ch || !projet) {
    const grouped = CHANTIERS.map((c) => ({
      ch: c,
      missions: c.projets.flatMap((p) =>
        p.missions.map((m, idx) => ({ ...parseMission(m), projet: p, idx }))
      ),
    }));

    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[9px]">
          <button onClick={() => nav.goTo("projets", null, null, null)} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">← Projets</button>
          <span className="text-gray-400">Selectionnez un projet pour voir ses missions</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
            <div className="text-lg font-bold text-violet-600">{NB_MISSIONS}</div>
            <div className="text-[9px] text-violet-600 font-medium">MISSIONS</div>
          </div>
          <div className="text-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="text-lg font-bold text-emerald-600">{MISSIONS_DONE}</div>
            <div className="text-[9px] text-emerald-600 font-medium">DONE</div>
          </div>
          <div className="text-center p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <div className="text-lg font-bold text-amber-600">{MISSIONS_EN_COURS}</div>
            <div className="text-[9px] text-amber-600 font-medium">EN COURS</div>
          </div>
          <div className="text-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{NB_TACHES}</div>
            <div className="text-[9px] text-blue-600 font-medium">TACHES</div>
          </div>
        </div>

        {/* Missions groupees par projet — meme card pattern */}
        {grouped.map(({ ch: c, missions: chMissions }) => {
          if (chMissions.length === 0) return null;
          const Icon = c.icon;
          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Icon className={cn("h-3.5 w-3.5", `text-${c.color}-500`)} />
                <span className="text-[9px] font-bold text-gray-600">{c.label}</span>
                <span className="text-[9px] text-gray-400">{chMissions.length} taches</span>
              </div>
              {chMissions.slice(0, 5).map((m, i) => (
                <button key={`${c.id}-${m.projet.id}-${m.idx}-${i}`} onClick={() => nav.goTo("taches", c.id, m.projet.id, m.idx)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
                  <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
                    <span className="text-[9px] font-mono font-bold text-white/70">#{m.idx + 1}</span>
                    <span className="text-xs font-bold text-white flex-1 truncate">{m.text}</span>
                    <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <div className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-gray-400">Projet: {m.projet.id}</span>
                      <BotBadge code={m.botCode} />
                    </div>
                  </div>
                </button>
              ))}
              {chMissions.length > 5 && (
                <button onClick={() => nav.goTo("projets", c.id, null, null)} className="w-full text-center text-[9px] text-blue-600 font-bold py-1 hover:bg-blue-50 rounded transition-colors">
                  Voir les {chMissions.length} taches →
                </button>
              )}
            </div>
          );
        })}

        <TemplateSection niveau="mission" label="Mission" />
      </div>
    );
  }

  // Projet selectionne — ses taches (= missions[] dans le code)
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[9px] flex-wrap">
        <button onClick={() => nav.goTo("projets", null, null, null)} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">Projets</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button onClick={() => nav.goTo("projets", ch.id, null, null)} className={cn("px-2 py-1 rounded font-bold", `bg-${ch.color}-100 text-${ch.color}-700`)}>
          {ch.label}
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="px-2 py-1 rounded font-bold bg-blue-100 text-blue-700">{projet.id}: {projet.label}</span>
      </div>

      {/* Header card */}
      <div className="p-0 overflow-hidden rounded-lg border shadow-sm">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-600">
          <div className="flex items-center gap-2">
            <code className="text-[9px] font-mono font-bold text-blue-200">{projet.id}</code>
            <span className="text-sm font-bold text-white">{projet.label}</span>
            <StatusBadge status={projet.status} />
          </div>
          <p className="text-[9px] text-white/80 mt-1">{projet.desc}</p>
          {projet.bloque_par && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-red-500/20 rounded">
              <Lock className="h-3.5 w-3.5 text-red-200" />
              <span className="text-[9px] text-red-200">Bloque par: {projet.bloque_par}</span>
            </div>
          )}
        </div>
        <div className="px-4 py-2 flex items-center gap-2">
          <BotBadge code={projet.bot} />
          <span className="text-[9px] text-gray-500">Responsable</span>
          <span className="text-[9px] text-gray-400 ml-auto">{projet.missions.length} taches</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
          <div className="text-lg font-bold text-violet-600">{projet.missions.length}</div>
          <div className="text-[9px] text-violet-600 font-medium">TACHES</div>
        </div>
        <div className="text-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-lg font-bold text-blue-600">{projet.missions.filter((m) => parseMission(m).role === "master").length}</div>
          <div className="text-[9px] text-blue-600 font-medium">CARLOS</div>
        </div>
        <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
          <div className="text-lg font-bold text-violet-600">{projet.missions.filter((m) => parseMission(m).role === "bot").length}</div>
          <div className="text-[9px] text-violet-600 font-medium">BOTS</div>
        </div>
        <div className="text-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-lg font-bold text-slate-700">{projet.missions.filter((m) => { const r = parseMission(m).role; return r === "humain-ceo" || r === "humain-pm"; }).length}</div>
          <div className="text-[9px] text-slate-600 font-medium">HUMAINS</div>
        </div>
      </div>

      {/* Tache cards — meme pattern gradient */}
      <div className="space-y-2">
        {projet.missions.map((m, idx) => {
          const parsed = parseMission(m);
          const rc = ROLE_CONFIG[parsed.role];
          return (
            <button key={idx} onClick={() => nav.goTo("taches", ch.id, projet.id, idx)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
              <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r",
                parsed.role === "master" ? "from-blue-600 to-blue-500" :
                parsed.role === "humain-ceo" ? "from-slate-700 to-slate-600" :
                parsed.role === "humain-pm" ? "from-sky-600 to-sky-500" :
                parsed.role === "externe" ? "from-orange-500 to-orange-400" :
                "from-violet-600 to-violet-500"
              )}>
                <span className="text-[9px] font-mono font-bold text-white/70">#{idx + 1}</span>
                <span className="text-xs font-bold text-white flex-1 truncate">{parsed.text}</span>
                <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <div className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <BotBadge code={parsed.botCode} />
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold text-white", rc.bg)}>{rc.badge}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <TemplateSection niveau="tache" label="Tache" />
    </div>
  );
}

// ================================================================
// TAB: TACHES — Detail mission + sous-taches (niveau 4)
// ================================================================

function TabTaches({ nav, ch, projet, missionIdx }: { nav: BlueprintNav; ch: Chantier | null; projet: Projet | null; missionIdx: number | null }) {
  // Vue globale — toutes les taches (quand aucune mission selectionnee)
  if (!ch || !projet || missionIdx === null) {
    const allTaches: { text: string; botCode: string; role: string; chantier: Chantier; projet: Projet; missionIdx: number }[] = [];
    CHANTIERS.forEach((c) => {
      c.projets.forEach((p) => {
        p.missions.forEach((m, idx) => {
          const parsed = parseMission(m);
          allTaches.push({ ...parsed, chantier: c, projet: p, missionIdx: idx });
        });
      });
    });
    const doneCount = allTaches.filter((t) => t.projet.status === "done").length;
    const enCoursCount = allTaches.filter((t) => t.projet.status === "en-cours").length;

    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[9px]">
          <button onClick={() => nav.goTo("missions", null, null, null)} className="px-2 py-1 rounded font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">← Missions</button>
          <span className="text-gray-400">{allTaches.length} taches au total</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
            <div className="text-lg font-bold text-violet-600">{allTaches.length}</div>
            <div className="text-[9px] text-violet-600 font-medium">TACHES</div>
          </div>
          <div className="text-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="text-lg font-bold text-emerald-600">{doneCount}</div>
            <div className="text-[9px] text-emerald-600 font-medium">DONE</div>
          </div>
          <div className="text-center p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <div className="text-lg font-bold text-amber-600">{enCoursCount}</div>
            <div className="text-[9px] text-amber-600 font-medium">EN COURS</div>
          </div>
          <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-lg font-bold text-gray-600">{allTaches.length - doneCount - enCoursCount}</div>
            <div className="text-[9px] text-gray-600 font-medium">A FAIRE</div>
          </div>
        </div>

        {/* Taches groupees par projet — meme card pattern */}
        {CHANTIERS.map((c) => {
          const chTaches = c.projets.flatMap((p) =>
            p.missions.map((m, idx) => ({ ...parseMission(m), projet: p, idx }))
          );
          if (chTaches.length === 0) return null;
          const Icon = c.icon;
          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Icon className={cn("h-3.5 w-3.5", `text-${c.color}-500`)} />
                <span className="text-[9px] font-bold text-gray-600">{c.label}</span>
                <span className="text-[9px] text-gray-400">{chTaches.length} taches</span>
              </div>
              {chTaches.slice(0, 5).map((t, i) => (
                <button key={`${c.id}-${t.projet.id}-${t.idx}-${i}`} onClick={() => nav.goTo("taches", c.id, t.projet.id, t.idx)} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
                  <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
                    <span className="text-[9px] font-mono font-bold text-white/70">#{t.idx + 1}</span>
                    <span className="text-xs font-bold text-white flex-1 truncate">{t.text}</span>
                    <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <div className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-gray-400">{t.projet.id} — {t.projet.label}</span>
                      <BotBadge code={t.botCode} />
                    </div>
                  </div>
                </button>
              ))}
              {chTaches.length > 5 && (
                <button onClick={() => nav.goTo("projets", c.id, null, null)} className="w-full text-center text-[9px] text-blue-600 font-bold py-1 hover:bg-blue-50 rounded transition-colors">
                  Voir les {chTaches.length} taches →
                </button>
              )}
            </div>
          );
        })}

        <TemplateSection niveau="tache" label="Tache" />
      </div>
    );
  }

  const missionRaw = projet.missions[missionIdx];
  if (!missionRaw) return null;

  const parsed = parseMission(missionRaw);
  const botInfo2 = BOT_INFO[parsed.botCode];
  const rc = ROLE_CONFIG[parsed.role];

  const mockSousTaches = parsed.role === "humain-ceo" ? [
    { label: "CarlOS prepare le contexte et les options", assignee: "BCO", status: "done" as const },
    { label: "Presentation au CEO avec recommandation", assignee: "BCO", status: "en-cours" as const },
    { label: "Decision GO/STOP du CEO", assignee: parsed.botCode, status: "a-faire" as const },
    { label: "CarlOS execute selon la decision", assignee: "BCO", status: "a-faire" as const },
  ] : parsed.role === "master" ? [
    { label: "Analyser le contexte et les donnees disponibles", assignee: "BCO", status: "done" as const },
    { label: "Deleguer aux sous-bots specialises si necessaire", assignee: "BCO", status: "en-cours" as const },
    { label: "Synthetiser et proposer au CEO", assignee: "BCO", status: "a-faire" as const },
    { label: "Ajuster selon feedback humain", assignee: "BCO", status: "a-faire" as const },
  ] : [
    { label: "Recevoir le briefing de CarlOS (contexte + objectif)", assignee: parsed.botCode, status: "done" as const },
    { label: "Executer la tache dans le domaine d'expertise", assignee: parsed.botCode, status: "en-cours" as const },
    { label: "Reporter a CarlOS (master) pour validation", assignee: parsed.botCode, status: "a-faire" as const },
    { label: "CarlOS valide et presente au CEO si necessaire", assignee: "BCO", status: "a-faire" as const },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[9px] flex-wrap">
        <button onClick={() => nav.goTo("projets", ch.id, null, null)} className={cn("px-2 py-1 rounded font-bold", `bg-${ch.color}-100 text-${ch.color}-700`)}>{ch.label}</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <button onClick={() => nav.goTo("missions", ch.id, projet.id, null)} className="px-2 py-1 rounded font-bold bg-blue-100 text-blue-700">{projet.id}</button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="px-2 py-1 rounded font-bold bg-violet-100 text-violet-700">Tache #{missionIdx + 1}</span>
      </div>

      {/* Header card — meme pattern que les autres detail views */}
      <div className="p-0 overflow-hidden rounded-lg border shadow-sm">
        <div className={cn("px-4 py-3 bg-gradient-to-r",
          parsed.role === "master" ? "from-blue-700 to-blue-600" :
          parsed.role === "humain-ceo" ? "from-slate-800 to-slate-700" :
          parsed.role === "humain-pm" ? "from-sky-700 to-sky-600" :
          parsed.role === "externe" ? "from-orange-600 to-orange-500" :
          "from-violet-700 to-violet-600"
        )}>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 text-white shrink-0">
              {missionIdx + 1}
            </span>
            <span className="text-sm font-bold text-white flex-1">{parsed.text}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[9px] text-white/70">Projet: {projet.id} — {projet.label}</span>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center gap-2">
          {botInfo2 && <span className={cn("text-[8px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", botInfo2.gradient)}>{botInfo2.label}</span>}
          <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold text-white", rc.bg)}>{rc.badge}</span>
          <StatusBadge status={projet.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2.5 bg-violet-50 rounded-lg border border-violet-100">
          <div className="text-lg font-bold text-violet-600">{mockSousTaches.length}</div>
          <div className="text-[9px] text-violet-600 font-medium">SOUS-TACHES</div>
        </div>
        <div className="text-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="text-lg font-bold text-emerald-600">{mockSousTaches.filter((t) => t.status === "done").length}</div>
          <div className="text-[9px] text-emerald-600 font-medium">DONE</div>
        </div>
        <div className="text-center p-2.5 bg-amber-50 rounded-lg border border-amber-100">
          <div className="text-lg font-bold text-amber-600">{mockSousTaches.filter((t) => t.status === "en-cours").length}</div>
          <div className="text-[9px] text-amber-600 font-medium">EN COURS</div>
        </div>
        <div className="text-center p-2.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-lg font-bold text-gray-600">{mockSousTaches.filter((t) => t.status === "a-faire").length}</div>
          <div className="text-[9px] text-gray-600 font-medium">A FAIRE</div>
        </div>
      </div>

      {/* Sous-tache cards — meme card pattern gradient */}
      <div className="space-y-2">
        {mockSousTaches.map((t, i) => {
          const assigneeInfo = BOT_INFO[t.assignee];
          return (
            <div key={i} className="w-full p-0 overflow-hidden rounded-lg border shadow-sm">
              <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r",
                t.status === "done" ? "from-emerald-600 to-emerald-500" :
                t.status === "en-cours" ? "from-amber-600 to-amber-500" :
                "from-gray-500 to-gray-400"
              )}>
                <CheckCircle2 className={cn("h-4 w-4 text-white", t.status === "done" ? "opacity-100" : "opacity-50")} />
                <span className={cn("text-xs font-bold text-white flex-1", t.status === "done" && "line-through opacity-80")}>{t.label}</span>
              </div>
              <div className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  {assigneeInfo ? (
                    <span className={cn("text-[8px] font-bold text-white px-1.5 py-0.5 rounded bg-gradient-to-r", assigneeInfo.gradient)}>{assigneeInfo.label}</span>
                  ) : (
                    <span className="text-[9px] text-gray-400">{t.assignee}</span>
                  )}
                  <StatusBadge status={t.status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center gap-2">
        {missionIdx > 0 && (
          <button onClick={() => nav.goTo("taches", ch.id, projet.id, missionIdx - 1)} className="flex-1 p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
            <div className="px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r from-gray-500 to-gray-400">
              <span className="text-xs font-bold text-white">← Precedente</span>
            </div>
            <div className="px-4 py-2 text-[9px] text-gray-500 truncate">{parseMission(projet.missions[missionIdx - 1]).text}</div>
          </button>
        )}
        {missionIdx < projet.missions.length - 1 && (
          <button onClick={() => nav.goTo("taches", ch.id, projet.id, missionIdx + 1)} className="flex-1 p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all text-left cursor-pointer group">
            <div className="px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r from-gray-500 to-gray-400">
              <span className="text-xs font-bold text-white ml-auto">Suivante →</span>
            </div>
            <div className="px-4 py-2 text-[9px] text-gray-500 truncate text-right">{parseMission(projet.missions[missionIdx + 1]).text}</div>
          </button>
        )}
      </div>

      <TemplateSection niveau="tache" label="Tache" />
    </div>
  );
}

// ================================================================
// TAB: OPPORTUNITES — Missions externes/fournisseurs/ouvertes
// ================================================================

function TabOpportunites({ nav }: { nav: BlueprintNav }) {
  // Extraire toutes les missions avec contexte chantier/projet
  const allOpps: { mission: string; parsed: ReturnType<typeof parseMission>; chantier: Chantier; projet: Projet; missionIdx: number }[] = [];
  CHANTIERS.forEach((c) => {
    c.projets.forEach((p) => {
      p.missions.forEach((m, idx) => {
        const lower = m.toLowerCase();
        if (lower.includes("externe") || lower.includes("fournisseur") || lower.includes("ouverte") || lower.includes("partenaire")) {
          allOpps.push({ mission: m, parsed: parseMission(m), chantier: c, projet: p, missionIdx: idx });
        }
      });
    });
  });

  // Grouper par chantier
  const grouped = CHANTIERS
    .map((c) => ({
      chantier: c,
      opps: allOpps.filter((o) => o.chantier.id === c.id),
    }))
    .filter((g) => g.opps.length > 0);

  return (
    <div className="space-y-4">
      {/* Header resume */}
      <Card className="p-0 overflow-hidden border-2 border-orange-200">
        <div className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center gap-2">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Opportunites Detectees</span>
          <span className="ml-auto text-xs font-bold text-white bg-white/20 px-2.5 py-1 rounded">{allOpps.length}</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-600">
            Missions necessitant une expertise externe, un fournisseur ou un partenaire. Chaque opportunite peut etre publiee sur Orbit9 pour trouver un match.
          </p>
          <div className="flex gap-3 mt-3">
            {[
              { label: "Chantiers concernes", value: grouped.length, color: "red" },
              { label: "Missions ouvertes", value: allOpps.length, color: "orange" },
              { label: "Bots impliques", value: new Set(allOpps.map((o) => o.parsed.botCode)).size, color: "violet" },
            ].map((s) => (
              <div key={s.label} className={cn("flex-1 text-center p-2 rounded-lg border", `bg-${s.color}-50 border-${s.color}-100`)}>
                <div className={cn("text-lg font-bold", `text-${s.color}-600`)}>{s.value}</div>
                <div className={cn("text-[9px] font-medium", `text-${s.color}-600`)}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Liste par chantier */}
      {grouped.map(({ chantier: c, opps }) => {
        const Icon = c.icon;
        return (
          <Card key={c.id} className="p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className={cn("px-4 py-2 flex items-center gap-2 bg-gradient-to-r", `from-${c.color}-600 to-${c.color}-500`)}>
              <Icon className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white">{c.id} — {c.label}</span>
              <span className="ml-auto text-[9px] font-bold text-white bg-white/20 px-2 py-0.5 rounded">{opps.length} opp.</span>
            </div>
            <div className="divide-y divide-gray-100">
              {opps.map((o, i) => {
                const rc = ROLE_CONFIG[o.parsed.role];
                return (
                  <button
                    key={i}
                    onClick={() => nav.goTo("taches", o.chantier.id, o.projet.id, o.missionIdx)}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50/50 transition-colors group flex items-start gap-3"
                  >
                    <div className="shrink-0 mt-0.5">
                      <span className={cn("inline-block text-[8px] px-1.5 py-0.5 rounded font-bold text-white", rc.bg)}>
                        {o.parsed.botCode}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-800 group-hover:text-orange-700 transition-colors">{o.parsed.text}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-gray-400">{o.projet.label}</span>
                        {o.mission.toLowerCase().includes("ouverte") && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-bold">OUVERTE</span>
                        )}
                        {o.mission.toLowerCase().includes("fournisseur") && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-bold">FOURNISSEUR</span>
                        )}
                        {o.mission.toLowerCase().includes("externe") && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">EXTERNE</span>
                        )}
                        {o.mission.toLowerCase().includes("partenaire") && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded font-bold">PARTENAIRE</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ================================================================
// TAB: EQUIPE
// ================================================================

function TabEquipe() {
  const team = [
    {
      role: "Carl Fugere", code: "N1 Commandant", color: "cyan", icon: Users,
      chantiers: ["CH-9", "CH-13"],
      desc: "Vision, decisions, GO/STOP. Seul a creer des Decisions (D-xxx). Evenement onboarding clients.",
      actions: ["Valider plans avant execution", "Pioneer Circle: 9 meetings", "Telnyx credentials", "Test vocal B.4.7", "Remplir A.5 Bible Visuelle Cible"],
    },
    {
      role: "Claude Code", code: "BCT D1-D2 CTO", color: "violet", icon: Code2,
      chantiers: ["CH-1", "CH-2", "CH-4", "CH-8"],
      desc: "Execution technique. Code, build, deploy. Pipeline COMMAND (SCAN→STRATEGY→EXECUTION→BILAN).",
      actions: ["Nettoyage code (CH-1)", "JWT auth + infra (CH-2)", "Wiring reel 100% (CH-4)", "Communication unifiee (CH-8)", "Support technique tous chantiers"],
    },
    {
      role: "Gemini", code: "PM D2 Sentinelle", color: "amber", icon: Eye,
      chantiers: ["CH-3", "CH-5", "CH-11", "CH-12"],
      desc: "Generation contenu bulk. SOULs enrichis. Oracle9 data pipeline. Audits pre/post-vol.",
      actions: ["7 catalogues JSON (CH-3)", "SOULs 12 bots (CH-5)", "Oracle9 4 couches (CH-12)", "Auto-update docs (CH-11)", "Mega prompts sectoriels"],
    },
    {
      role: "CarlOS (BCO)", code: "CEO Bot", color: "blue", icon: Bot,
      chantiers: ["CH-6", "CH-10"],
      desc: "Onboarding clients, CarlOS GPS, orchestration COMMAND, Orbit9 matching.",
      actions: ["Playbooks M1/M2/M3 (CH-6)", "CarlOS GPS engine (CH-6)", "Box Progressives (CH-6)", "Orbit9 scout (CH-10)"],
    },
    {
      role: "12 Bots C-Level", code: "Specialistes", color: "gray", icon: Users,
      chantiers: ["Selon specialite"],
      desc: "Chaque bot intervient dans son domaine. Attribution visible par mission.",
      actions: [
        "BCF François: Stripe billing + TimeTokens + pricing",
        "BCM Martine: Marketing 360 + demos + Help Center",
        "BCS Sophie: Qualification Orbit9 + strategies",
        "BOO Olivier: Operations + routines + SLA",
        "BLE Louise: Loi 25 + ToS + guides legaux",
        "BSE Sébastien: Audit securite + monitoring",
        "BRO Raphaël: Scout ecosysteme QC + cellules",
        "BIO Inès: Oracle9 sondeur + predictions",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Equipe complete: Carl + Claude Code + Gemini + CarlOS + 12 bots. Attribution par mission visible dans l'onglet Chantiers.
      </p>

      {team.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.role} className="p-0 overflow-hidden border shadow-sm">
            <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r", `from-${m.color}-600 to-${m.color}-500`)}>
              <Icon className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{m.role}</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">{m.code}</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-2">{m.desc}</p>
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <Flame className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[9px] font-bold text-gray-500">Chantiers:</span>
                {(Array.isArray(m.chantiers) ? m.chantiers : [m.chantiers]).map((chId) => (
                  <span key={chId} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{chId}</span>
                ))}
              </div>
              <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
                {m.actions.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-gray-600">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ================================================================
// TAB: TIMELINE
// ================================================================

function TabTimeline() {
  const phases = [
    {
      phase: "Phase 1", label: "Fondations + Contenu", timing: "Semaine 1-2", color: "violet",
      chantiers: ["CH-1", "CH-2", "CH-3"],
      objectifs: [
        "Code propre: BTML→GHML + BCC/BPO cleanup + CSS",
        "JWT auth multi-user operationnel",
        "Voice stability confirmee",
        "7 catalogues JSON peuples",
        "Company kits standardises",
      ],
      milestone: "Base solide + contenu reel = pret pour features",
    },
    {
      phase: "Phase 2", label: "Produit + Intelligence + Parcours", timing: "Semaine 3-5", color: "blue",
      chantiers: ["CH-4", "CH-5", "CH-6"],
      objectifs: [
        "Zero mock: tous ecrans fonctionnent a 100%",
        "12 SOULs enrichis + trisociation effective",
        "CarlOS GPS operationnel",
        "Playbooks M1/M2/M3 prets",
        "Box Progressives live",
      ],
      milestone: "Produit demo-ready avec bots intelligents",
    },
    {
      phase: "Phase 3", label: "Gouvernance + Communication + Commercial", timing: "Semaine 5-8", color: "pink",
      chantiers: ["CH-7", "CH-8", "CH-9"],
      objectifs: [
        "Loi 25 compliance complete",
        "Communication cross-canal unifiee",
        "Stripe billing actif (3 plans)",
        "Pioneer Circle: 9 meetings",
        "Marketing 360 lance",
      ],
      milestone: "9 pioneers signes = product-market fit valide",
    },
    {
      phase: "Phase 4", label: "Reseau + Documentation", timing: "Mois 2-3", color: "orange",
      chantiers: ["CH-10", "CH-11"],
      objectifs: [
        "Orbit9 scout reel (iCRIQ + REAI)",
        "Circles actifs avec rabais",
        "Help Center client-facing",
        "API documentation live",
        "Auto-update documentation",
      ],
      milestone: "Effet de reseau + documentation auto = scalable",
    },
    {
      phase: "Phase 5", label: "Intelligence Predictive + Scale", timing: "Mois 3-12", color: "amber",
      chantiers: ["CH-12", "CH-13"],
      objectifs: [
        "Oracle9 Couche 1-2 live",
        "Multi-tenant RBAC pour 81+ clients",
        "Instance Fonds (Teralys en premier)",
        "Expert Marketplace",
        "API Catalogue Client",
        "Revenue 1M$+ Y1",
      ],
      milestone: "Ecosysteme industriel autonome et profitable",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">5 phases, 13 chantiers, de fondations a ecosysteme.</p>

      {phases.map((p, i) => (
        <Card key={p.phase} className="p-0 overflow-hidden border shadow-sm">
          <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r", `from-${p.color}-600 to-${p.color}-500`)}>
            <span className="text-sm font-bold text-white">{p.phase}</span>
            <span className="text-xs text-white/80">— {p.label}</span>
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">{p.timing}</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <Flame className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[9px] font-bold text-gray-500">Chantiers:</span>
              {p.chantiers.map((chId) => {
                const ch = CHANTIERS.find((c) => c.id === chId);
                return ch ? (
                  <span key={chId} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", `bg-${ch.color}-100 text-${ch.color}-700`)}>
                    {chId}
                  </span>
                ) : null;
              })}
            </div>

            <div className="space-y-1 mb-3">
              {p.objectifs.map((obj, j) => (
                <div key={j} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700">{obj}</span>
                </div>
              ))}
            </div>

            <div className={cn("p-2 rounded-lg border", `bg-${p.color}-50 border-${p.color}-200`)}>
              <div className="flex items-center gap-1.5">
                <Target className={cn("h-3.5 w-3.5", `text-${p.color}-600`)} />
                <span className={cn("text-[9px] font-bold", `text-${p.color}-700`)}>Milestone:</span>
                <span className={cn("text-[9px]", `text-${p.color}-600`)}>{p.milestone}</span>
              </div>
            </div>

            {i < phases.length - 1 && (
              <div className="flex justify-center pt-2">
                <ChevronRight className="h-4 w-4 text-gray-300 rotate-90" />
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ================================================================
// MAIN COMPONENT — Blueprint avec navigation cross-tab
// ================================================================

export function PlaybookUsineBleuePage() {
  const { setActiveView } = useFrameMaster();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [chantierId, setChantierId] = useState<string | null>(null);
  const [projetId, setProjetId] = useState<string | null>(null);
  const [missionIdx, setMissionIdx] = useState<number | null>(null);

  // Navigation cross-tab: cliquer un chantier dans overview → switch vers chantiers tab avec contexte
  const goTo = (tab: TabId, chId?: string | null, pId?: string | null, mIdx?: number | null) => {
    setActiveTab(tab);
    if (chId !== undefined) setChantierId(chId);
    if (pId !== undefined) setProjetId(pId);
    if (mIdx !== undefined) setMissionIdx(mIdx);
  };

  const nav: BlueprintNav = { tab: activeTab, chantierId, projetId, missionIdx, goTo };

  // Resolve selected objects
  const ch = chantierId ? CHANTIERS.find((c) => c.id === chantierId) : null;
  const projet = ch && projetId ? ch.projets.find((p) => p.id === projetId) : null;

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Rocket}
          iconColor="text-blue-600"
          title="Mon Blueprint"
          subtitle={`1 chantier · ${NB_PROJETS} projets · ${NB_MISSIONS} missions`}
          onBack={() => setActiveView("master-roadmap")}
          rightSlot={
            <div className="flex items-center gap-1 flex-wrap">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => goTo(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-colors",
                      activeTab === tab.id
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          }
        />
      }
    >
      {activeTab === "overview" && <TabOverview nav={nav} />}
      {activeTab === "timeline" && <TabTimeline />}
      {activeTab === "chantiers" && <TabChantiers nav={nav} />}
      {activeTab === "projets" && <TabProjets nav={nav} ch={ch} />}
      {activeTab === "missions" && <TabMissionsView nav={nav} ch={ch} projet={projet} />}
      {activeTab === "taches" && <TabTaches nav={nav} ch={ch} projet={projet} missionIdx={missionIdx} />}
      {activeTab === "opportunites" && <TabOpportunites nav={nav} />}
      {activeTab === "equipes" && <TabEquipe />}
    </PageLayout>
  );
}
