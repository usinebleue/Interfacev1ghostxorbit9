/**
 * MasterRoutinePage.tsx — Routine Dev & Protocole COMMAND
 * 6 tabs: Pipeline | Mots-Cles | Garde-Fous | Securite | Equipe Dev | References
 * Structure keyword-driven: Carl dit un mot-cle → Claude sait exactement quoi faire
 * Applique la chaine COMMAND (SCAN → STRATEGY → EXECUTION → BILAN)
 * Prototype pour l'encadrement des bots clients
 */

import { useState } from "react";
import {
  Shield, Users, Lock, CheckCircle2, Play,
  Search, FileText, Code2, Eye, AlertTriangle,
  Terminal, ArrowRight, Zap, Server,
  BookOpen, AlertOctagon,
  Rocket, Database, Globe,
  Activity, Gauge, Target,
  Layers, Bot, Cpu,
  XCircle, Hash,
  ChevronRight, Crosshair,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// TYPES
// ================================================================

type TabId = "pipeline" | "keywords" | "guardrails" | "security" | "team" | "references";

interface Keyword {
  id: string;
  label: string;
  stage: "SCAN" | "STRATEGY" | "EXECUTION" | "BILAN";
  category: "frontend" | "backend" | "infra" | "docs" | "process";
  steps: string[];
  guardrails: string[];
  files?: string[];
  commands?: string[];
}

// ================================================================
// TABS
// ================================================================

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "pipeline", label: "Pipeline", icon: Layers },
  { id: "keywords", label: "Mots-Cles", icon: Hash },
  { id: "guardrails", label: "Garde-Fous", icon: Shield },
  { id: "security", label: "Securite", icon: Lock },
  { id: "team", label: "Equipe Dev", icon: Users },
  { id: "references", label: "References", icon: BookOpen },
];

// ================================================================
// DATA — COMMAND Pipeline (4 stages)
// ================================================================

const COMMAND_STAGES = [
  {
    stage: "SCAN",
    label: "Recherche & Analyse",
    color: "blue",
    icon: Search,
    degre: "D1 — Soldat",
    desc: "Analyser AVANT d'agir. Lire les docs, chercher ce qui existe, identifier les patterns.",
    actions: [
      "Lire MEMORY.md + dev-routine.md + design-system.md",
      "Grep/Glob pour le concept dans le code",
      "Lire les fichiers cibles en entier",
      "Verifier Bible Produit / Roadmap si Carl a conceptualise",
      "Lister les fichiers qui seront impactes",
    ],
    gate: "GATE 1 — research",
  },
  {
    stage: "STRATEGY",
    label: "Planification",
    color: "violet",
    icon: Target,
    degre: "D2 — Lieutenant",
    desc: "Planifier le travail. Presenter le plan a Carl. Attendre le GO.",
    actions: [
      "Ecrire le plan (fichiers, patterns, approche)",
      "Gemini PRE-VOL: python3 gemini_sentinel.py pre \"plan\"",
      "Si frontend: identifier patterns dans design-system.md",
      "Presenter a Carl: fichiers touches, risques, approche",
      "Attendre GO explicite de Carl",
    ],
    gate: "GATE 2 — plan",
  },
  {
    stage: "EXECUTION",
    label: "Codage",
    color: "emerald",
    icon: Play,
    degre: "D1-D2 (selon complexite)",
    desc: "Coder UNIQUEMENT ce qui est demande. Copier-coller depuis design-system.md.",
    actions: [
      "COPIER patterns depuis design-system.md (jamais de memoire)",
      "Respecter TOUS les garde-fous (voir onglet Garde-Fous)",
      "Build apres chaque bloc: npx vite build / python3 -c import",
      "Audit cross-page si frontend modifie",
      "Zero improvisation — si pattern manque → STOP → demander Carl",
    ],
    gate: "GATE 3 — design-system lu",
  },
  {
    stage: "BILAN",
    label: "Verification & Propagation",
    color: "amber",
    icon: Eye,
    degre: "D2 — Lieutenant",
    desc: "Verifier le travail. Propager dans les docs. Confirmer a Carl.",
    actions: [
      "Build final: npx vite build && python3 -m pytest test_*.py",
      "Gemini POST-VOL: python3 gemini_sentinel.py post \"fichiers\"",
      "Propager: MEMORY.md, Sprint Tracker, JOURNAL-DECISIONS.md",
      "git commit + deploy.sh si applicable",
      "Confirmer a Carl: fichiers, build, deploy, standards",
    ],
    gate: "GATE 4 — verification",
  },
];

// ================================================================
// DATA — 22 Keywords
// ================================================================

const KEYWORDS: Keyword[] = [
  // FRONTEND
  {
    id: "frontend",
    label: "Frontend",
    stage: "SCAN",
    category: "frontend",
    steps: [
      "Lire design-system.md (189 lignes)",
      "Lire le fichier cible en entier",
      "Identifier le pattern exact dans design-system.md",
      "COPIER-COLLER le pattern (JAMAIS de memoire)",
      "Verifier coherence avec 1-2 pages existantes",
      "npx vite build",
      "Audit cross-page",
    ],
    guardrails: [
      "JAMAIS ecrire de style de memoire",
      "JAMAIS inventer un pattern similaire",
      "Icons: h-3.5 w-3.5 ou h-4 w-4 — JAMAIS h-3",
      "Badges: text-[9px] — JAMAIS text-10",
    ],
    files: ["memory/design-system.md", "layouts/PageLayout.tsx", "layouts/PageHeader.tsx"],
  },
  {
    id: "backend",
    label: "Backend",
    stage: "SCAN",
    category: "backend",
    steps: [
      "Lire le fichier cible en entier",
      "Verifier dans Bible Produit si Carl a conceptualise",
      "Backup si fichier critique (bridge_*.py)",
      "Coder le changement",
      "python3 -c \"import module\"",
      "python3 -m pytest test_*.py -v",
    ],
    guardrails: [
      "JAMAIS modifier bridge_btml_connector.py sans backup",
      "JAMAIS mettre credentials en dur",
      "SQL: parametres bind — JAMAIS f-string",
    ],
    files: ["docs/Bible-Produit-GhostX.md", "docs/Architecture-Globale-GhostX.md"],
  },
  {
    id: "new-page",
    label: "Nouvelle Page",
    stage: "STRATEGY",
    category: "frontend",
    steps: [
      "Grep pages existantes pour le pattern",
      "Utiliser PageLayout + PageHeader (design-system.md lignes 26-67)",
      "Definir maxWidth: 4xl (contenu) ou 5xl (grille)",
      "Ajouter ActiveView dans FrameMasterContext",
      "Ajouter dans SectionMasterGHML ou sidebar",
      "Wirer dans CenterZone.tsx",
      "npx vite build",
    ],
    guardrails: [
      "JAMAIS ecrire le squelette inline — utiliser PageLayout",
      "JAMAIS oublier d'ajouter dans CenterZone",
    ],
    files: ["layouts/PageLayout.tsx", "context/FrameMasterContext.tsx", "zones/center/CenterZone.tsx"],
  },
  {
    id: "new-endpoint",
    label: "Nouvel Endpoint",
    stage: "STRATEGY",
    category: "backend",
    steps: [
      "Verifier si endpoint similaire existe dans api_rest.py",
      "Ajouter route avec prefix /api/v1/",
      "Input validation (max chars, regex slug)",
      "Rate limiting si public",
      "Tester avec curl",
      "Ajouter dans CODE_STATE.md",
    ],
    guardrails: [
      "JAMAIS sans validation input",
      "JAMAIS sans rate limiting sur endpoint public",
      "JAMAIS exposer swagger en prod",
    ],
    files: ["api_rest.py", "bridge_database.py"],
  },
  // BUILD & DEPLOY
  {
    id: "build",
    label: "Build",
    stage: "EXECUTION",
    category: "frontend",
    steps: [
      "cd Interfacev1ghostxorbit9 && npx vite build",
      "Verifier taille bundle (< 4MB)",
      "Si erreur → corriger le fichier source",
    ],
    guardrails: ["JAMAIS deployer si build echoue"],
    commands: ["cd Interfacev1ghostxorbit9 && npx vite build"],
  },
  {
    id: "deploy",
    label: "Deploy",
    stage: "BILAN",
    category: "infra",
    steps: [
      "Verifier build passe",
      "bash deploy.sh",
      "Verifier app.usinebleue.ai accessible",
      "Si backend: sudo systemctl status brain-bridge",
    ],
    guardrails: [
      "JAMAIS deploy sans build qui passe",
      "deploy.sh exclut .env et credentials du git add",
    ],
    commands: ["bash deploy.sh", "sudo systemctl status brain-bridge"],
  },
  {
    id: "rollback",
    label: "Rollback",
    stage: "EXECUTION",
    category: "infra",
    steps: [
      "git checkout -- . (annuler changements locaux)",
      "OU cp -r ~/brain-dev-backup-DERNIER/* ~/brain-dev/",
      "sudo systemctl restart brain-bridge",
      "Verifier CarlOS repond dans Telegram",
    ],
    guardrails: ["JAMAIS rollback sans verifier quel backup restaurer"],
    commands: ["git checkout -- .", "sudo systemctl restart brain-bridge"],
  },
  // AUDIT & SECURITE
  {
    id: "audit",
    label: "Audit",
    stage: "BILAN",
    category: "process",
    steps: [
      "python3 test_invariants.py",
      "python3 gemini_sentinel.py post \"fichiers modifies\"",
      "Grep cross-page pour patterns modifies",
      "Verifier CORS restrictif, .env 600, pas de credentials en dur",
    ],
    guardrails: ["JAMAIS ignorer un score Gemini < 8/10"],
    commands: ["python3 test_invariants.py", "python3 gemini_sentinel.py post"],
  },
  {
    id: "security-review",
    label: "Security Review",
    stage: "BILAN",
    category: "infra",
    steps: [
      "Scan CORS (app.usinebleue.ai only)",
      "Scan credentials (pas en dur dans le code)",
      "Scan .env permissions (chmod 600)",
      "Scan SQL (bind params, pas f-string)",
      "Rate limiting actif sur endpoints publics",
      "UFW actif (deny incoming sauf 2222/80/443)",
    ],
    guardrails: ["JAMAIS skip security review en fin de sprint"],
    commands: ["python3 test_invariants.py --strict"],
  },
  // PROCESS
  {
    id: "boot",
    label: "Boot Session",
    stage: "SCAN",
    category: "process",
    steps: [
      "Lire MEMORY.md (sprint tracker, decisions recentes)",
      "Lire dev-routine.md (routine beton arme)",
      "python3 test_invariants.py",
      "Si erreurs critiques → corriger AVANT de coder",
      "Identifier la tache: frontend / backend / docs / infra",
    ],
    guardrails: ["JAMAIS coder avant d'avoir lu MEMORY.md"],
    commands: ["python3 test_invariants.py"],
  },
  {
    id: "fin",
    label: "Fin Session",
    stage: "BILAN",
    category: "process",
    steps: [
      "git commit avec message descriptif",
      "deploy.sh si applicable",
      "Mettre a jour MEMORY.md (Sprint Tracker)",
      "Mettre a jour sessions-archive.md",
      "Verifier coherence CLAUDE.md ↔ MEMORY.md",
      "Confirmer a Carl: fichiers, build, deploy, standards",
    ],
    guardrails: ["JAMAIS terminer sans mettre a jour MEMORY.md"],
  },
  {
    id: "save",
    label: "Save (Pre-Compression)",
    stage: "BILAN",
    category: "process",
    steps: [
      "Sauvegarder etat dans MEMORY.md",
      "Sauvegarder decisions dans JOURNAL-DECISIONS.md",
      "Lister les fichiers modifies cette session",
      "Noter le prochain pas a faire",
    ],
    guardrails: ["JAMAIS perdre le contexte sans sauvegarder"],
  },
  {
    id: "decision",
    label: "Decision (D-xxx)",
    stage: "STRATEGY",
    category: "docs",
    steps: [
      "ATTENDRE le GO de Carl (JAMAIS creer sans autorisation)",
      "Ajouter dans JOURNAL-DECISIONS.md",
      "Propager dans MEMORY.md Sprint Tracker",
      "Propager dans Roadmap-V3.0.md",
      "Verifier coherence CLAUDE.md priorites",
    ],
    guardrails: ["JAMAIS creer une Decision sans le GO de Carl"],
  },
  {
    id: "roadmap-update",
    label: "Roadmap Update",
    stage: "BILAN",
    category: "docs",
    steps: [
      "Mettre a jour MEMORY.md Sprint Tracker",
      "Verifier Roadmap-V3.0.md est coherent",
      "Verifier CLAUDE.md priorites actives",
      "Les 3 fichiers DOIVENT etre synchronises",
    ],
    guardrails: ["Les 3 sources (MEMORY, Roadmap, CLAUDE.md) doivent dire la meme chose"],
  },
  {
    id: "idea",
    label: "Idee (Parking)",
    stage: "SCAN",
    category: "docs",
    steps: [
      "Ajouter dans IDEAS.md (pas dans le code)",
      "OU dans MEMORY.md section IDEE EN MATURATION",
      "NE PAS implementer — juste capturer",
    ],
    guardrails: ["JAMAIS implementer une idee sans Decision formelle"],
  },
  {
    id: "hotfix",
    label: "Hotfix (Urgent)",
    stage: "EXECUTION",
    category: "infra",
    steps: [
      "python3 .claude/hooks/gate.py fast-track \"hotfix: description\"",
      "Corriger le bug specifique (minimum de changements)",
      "Build + test",
      "Deploy immediat",
      "Confirmer a Carl",
    ],
    guardrails: ["JAMAIS ajouter des features dans un hotfix"],
    commands: ["python3 .claude/hooks/gate.py fast-track"],
  },
  {
    id: "refactor",
    label: "Refactor",
    stage: "STRATEGY",
    category: "process",
    steps: [
      "Lister TOUS les fichiers impactes",
      "Plan ecrit: avant/apres pour chaque fichier",
      "Gemini pre-vol obligatoire",
      "Presenter a Carl",
      "Coder par petits blocs (build entre chaque)",
      "Gemini post-vol",
    ],
    guardrails: [
      "JAMAIS refactor + feature dans le meme commit",
      "JAMAIS renommer des fichiers sans plan",
    ],
  },
  {
    id: "backup",
    label: "Backup",
    stage: "EXECUTION",
    category: "infra",
    steps: [
      "cp -r ~/brain-dev ~/brain-dev-backup-$(date +%Y%m%d_%H%M)",
      "Verifier le backup existe: ls ~/brain-dev-backup-*",
    ],
    guardrails: ["TOUJOURS backup avant changement majeur"],
    commands: ["cp -r ~/brain-dev ~/brain-dev-backup-$(date +%Y%m%d_%H%M)"],
  },
  {
    id: "crash",
    label: "Crash Recovery",
    stage: "EXECUTION",
    category: "infra",
    steps: [
      "sudo systemctl status brain-bridge",
      "sudo journalctl -u brain-bridge --tail 50",
      "Identifier le bug dans les logs",
      "Restaurer backup si necessaire",
      "sudo systemctl restart brain-bridge",
      "Verifier CarlOS repond",
    ],
    guardrails: ["JAMAIS restart en boucle sans lire les logs"],
    commands: ["sudo systemctl status brain-bridge", "sudo journalctl -u brain-bridge --tail 50"],
  },
  {
    id: "sprint-done",
    label: "Sprint Done",
    stage: "BILAN",
    category: "process",
    steps: [
      "Marquer DONE dans MEMORY.md Sprint Tracker",
      "Marquer DONE dans Roadmap-V3.0.md",
      "3 audits: security-review + gemini sprint + test_invariants --strict",
      "deploy.sh",
      "Confirmer a Carl",
    ],
    guardrails: ["JAMAIS marquer DONE sans les 3 audits"],
  },
  {
    id: "gemini-scan",
    label: "Gemini Scan",
    stage: "BILAN",
    category: "process",
    steps: [
      "python3 gemini_sentinel.py [pre|post|sprint] \"description\"",
      "Lire /tmp/gemini_sentinel_result.md",
      "Score >= 9/10 → GO",
      "Score < 9/10 → corriger toutes les deviations",
      "Verdict STOP → revoir le plan avec Carl",
    ],
    guardrails: ["JAMAIS ignorer un verdict STOP de Gemini"],
    commands: ["python3 gemini_sentinel.py"],
  },
  {
    id: "command",
    label: "COMMAND (Full Pipeline)",
    stage: "SCAN",
    category: "process",
    steps: [
      "SCAN: Lire docs + grep code + identifier patterns",
      "STRATEGY: Plan ecrit + Gemini pre-vol + GO Carl",
      "EXECUTION: Coder + build + audit cross-page",
      "BILAN: Gemini post-vol + propager docs + confirmer",
    ],
    guardrails: ["Suivre les 4 etapes dans l'ordre — JAMAIS sauter"],
  },
];

// ================================================================
// DATA — Guard Rails
// ================================================================

const JAMAIS_RULES = [
  "Ecrire un style CSS de memoire",
  "Inventer un pattern qui n'est pas dans design-system.md",
  "Modifier bridge_btml_connector.py sans backup",
  "Mettre des credentials/API keys en dur dans le code",
  "Utiliser CORS wildcard (allow_origins=[\"*\"])",
  "Deployer sans build qui passe",
  "Creer une Decision (D-xxx) sans le GO de Carl",
  "Modifier des docs strategiques sans approbation",
  "Ajouter des features non demandees",
  "Coder avant d'avoir lu les docs pertinentes",
  "Ignorer un score Gemini < 8/10",
  "Terminer une session sans mettre a jour MEMORY.md",
  "Utiliser SQL f-string (toujours bind params)",
  "Skip l'audit cross-page apres modif frontend",
  "Presumer ce qui est builte (verifier CODE_STATE.md)",
  "Icons h-3 ou text-10px (standard: h-3.5/h-4 et text-[9px])",
];

const TOUJOURS_RULES = [
  "Lire design-system.md AVANT chaque edit frontend",
  "Copier-coller les patterns depuis la source",
  "Build apres chaque bloc de code",
  "Audit cross-page apres modification frontend",
  "Backup avant changement de fichier critique",
  "Propager les changements dans MEMORY.md + Roadmap + CLAUDE.md",
  "Verifier coherence entre les 3 sources de verite",
  "Dire la verite (obstacles, manques, incertitudes)",
  "Chercher ce qui existe AVANT de coder",
  "Presenter le plan a Carl AVANT d'executer",
  "Utiliser PageLayout + PageHeader pour les pages",
  "Confirmer a Carl en fin de session",
];

const STOP_CONDITIONS = [
  { trigger: "Pattern pas dans design-system.md", action: "STOP → demander a Carl" },
  { trigger: "Fichier critique (bridge_*.py)", action: "STOP → backup AVANT" },
  { trigger: "Docs strategiques a modifier", action: "STOP → presenter a Carl, attendre OK" },
  { trigger: "Build qui echoue", action: "STOP → corriger avant de continuer" },
  { trigger: "Gemini sentinel verdict STOP", action: "STOP → revoir le plan avec Carl" },
  { trigger: "Credential en dur dans le code", action: "STOP → deplacer dans .env" },
  { trigger: "Doute sur ce que Carl veut", action: "STOP → demander clarification" },
];

const ANTI_PATTERNS = [
  { bad: "Ecrire un style de memoire", good: "COPIER-COLLER depuis design-system.md" },
  { bad: "Inventer un pattern similaire", good: "Utiliser le pattern EXACT ou demander Carl" },
  { bad: "Ajouter des ameliorations non demandees", good: "Modifier UNIQUEMENT ce qui est demande" },
  { bad: "Skip l'audit cross-page", good: "Grep + verifier CHAQUE page touchee" },
  { bad: "Icons trop petites (3x3)", good: "Icons: toujours h-3.5 w-3.5 ou h-4 w-4" },
  { bad: "Wrapper sans PageLayout", good: "Utiliser PageLayout + PageHeader" },
  { bad: "Presumer ce qui est builte", good: "Verifier CODE_STATE.md ou le code" },
];

// ================================================================
// DATA — Team
// ================================================================

const TEAM_MEMBERS = [
  {
    role: "Carl",
    code: "BCO / N1",
    degre: "Commandant",
    color: "cyan",
    icon: Users,
    desc: "Vision, decisions, validation. TOUT passe par Carl.",
    responsabilites: [
      "Definir les objectifs et priorites",
      "Valider les plans avant execution",
      "Creer les Decisions (D-xxx)",
      "Approuver les modifications de docs strategiques",
      "Dire GO ou STOP sur chaque plan",
    ],
  },
  {
    role: "Claude Code",
    code: "BCT / D1-D2",
    degre: "CTO — Soldat/Lieutenant",
    color: "violet",
    icon: Code2,
    desc: "Code, execution, deploy. Suit les ordres de Carl. Ne prend JAMAIS de decisions strategiques.",
    responsabilites: [
      "Coder exactement ce qui est demande",
      "Respecter design-system.md a la lettre",
      "Build + tests apres chaque modification",
      "Deploy quand Carl dit GO",
      "Propager les changements dans les docs",
      "Signaler les obstacles honnetement",
    ],
  },
  {
    role: "Gemini",
    code: "PM / D2",
    degre: "Sentinelle — Lieutenant",
    color: "amber",
    icon: Eye,
    desc: "Audit independant. Deuxieme regard sur le code de Claude. Pre-vol et post-vol.",
    responsabilites: [
      "PRE-VOL: Evaluer le plan avant execution",
      "POST-VOL: Auditer le code apres execution",
      "SPRINT: Audit complet en fin de sprint",
      "Detecter les angles morts de Claude",
      "Score 1-10 + verdict GO/STOP",
    ],
  },
  {
    role: "Sub-agents",
    code: "D1 — Specialistes",
    degre: "Soldats",
    color: "gray",
    icon: Bot,
    desc: "Agents Claude parallelises pour taches specifiques. Lancees par Claude Code.",
    responsabilites: [
      "Recherche codebase (Explore agent)",
      "Execution bash (commandes build/test)",
      "Lecture fichiers en parallele",
      "NE prennent JAMAIS de decisions",
      "Rapportent les resultats a Claude Code",
    ],
  },
];

const DELEGATION_RULES = [
  { quoi: "bridge_*.py, api_rest.py, config", qui: "Claude Code SEULEMENT", raison: "Fichiers critiques — pas de delegation" },
  { quoi: "Decisions strategiques (D-xxx)", qui: "Carl SEULEMENT", raison: "JAMAIS creer sans GO de Carl" },
  { quoi: "Security review, CORS, credentials", qui: "Claude Code + Gemini audit", raison: "Double verification obligatoire" },
  { quoi: "Contexte cross-session", qui: "Claude Code SEULEMENT", raison: "Les sub-agents perdent le contexte" },
  { quoi: "Audits pre/post-vol", qui: "Gemini SEULEMENT", raison: "Regard independant, pas Claude qui s'audite" },
  { quoi: "Generation contenu (mega prompts)", qui: "Gemini Flash", raison: "Gratuit + bon pour generation bulk" },
  { quoi: "Analyses codebase paralleles", qui: "Sub-agents (Explore)", raison: "Parallelisation — plus rapide" },
  { quoi: "Frontend patterns, design system", qui: "Claude Code (apres lecture DS)", raison: "Un seul agent pour coherence" },
];

const TEAM_WORKFLOW = [
  { phase: "SCAN", carl: "Donne le contexte / la demande", claude: "Lit docs + grep code + identifie patterns", gemini: "—" },
  { phase: "STRATEGY", carl: "Valide le plan (GO/STOP)", claude: "Ecrit le plan + presente a Carl", gemini: "PRE-VOL: evalue le plan" },
  { phase: "EXECUTION", carl: "Disponible pour questions", claude: "Code + build + audit cross-page", gemini: "—" },
  { phase: "BILAN", carl: "Confirme reception", claude: "Propage docs + deploy + confirme", gemini: "POST-VOL: audite le code" },
];

// ================================================================
// DATA — Security
// ================================================================

const CRITICAL_FILES = [
  { file: "bridge_btml_connector.py", risk: "Point d'entree Telegram — si casse, TOUT tombe", action: "Backup OBLIGATOIRE avant modif" },
  { file: "bridge.py", risk: "Polling Telegram + routage", action: "Backup + test immediat" },
  { file: "api_rest.py", risk: "API REST FastAPI — tous les endpoints", action: "Backup + tester curl" },
  { file: "config_bridge.py", risk: "Config centrale — API keys, tiers", action: "JAMAIS modifier sans backup" },
  { file: "carlos_livekit_agent.py", risk: "Agent vocal LiveKit", action: "Tester appel vocal apres" },
  { file: ".env", risk: "Tous les secrets (API keys, tokens)", action: "chmod 600, JAMAIS dans git" },
  { file: "bridge_database.py", risk: "Wrapper PostgreSQL", action: "Tester queries apres modif" },
  { file: "bridge_command.py", risk: "Moteur COMMAND", action: "94 tests doivent passer" },
];

const SOURCES_VERITE = [
  { sujet: "Decisions", fichier: "JOURNAL-DECISIONS.md" },
  { sujet: "Sprint status", fichier: "memory/MEMORY.md → Sprint Tracker" },
  { sujet: "Sprint details", fichier: "docs/Roadmap-V3.0.md" },
  { sujet: "Standards UI", fichier: "memory/design-system.md" },
  { sujet: "Produit/vision", fichier: "docs/Bible-Produit-GhostX.md" },
  { sujet: "Workflow dev", fichier: "memory/dev-routine.md" },
  { sujet: "Config projet", fichier: "CLAUDE.md" },
  { sujet: "Architecture", fichier: "docs/Architecture-Globale-GhostX.md" },
  { sujet: "Sessions", fichier: "memory/sessions-archive.md" },
];

const QUALITY_METRICS = [
  "Lu design-system.md avant frontend?",
  "Copie patterns depuis source (pas de memoire)?",
  "Verifie coherence cross-page?",
  "Build passe (vite build / import)?",
  "Mis a jour MEMORY.md Sprint Tracker?",
  "SPRINT TRACKER = CLAUDE.md priorites = Roadmap?",
  "Gemini sentinel appele (pre + post)?",
  "Aucun credential en dur dans le code modifie?",
  "test_invariants.py roule en debut de session?",
  "Confirme a Carl en fin de session?",
];

// ================================================================
// STAGE COLOR HELPERS
// ================================================================

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SCAN: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  STRATEGY: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  EXECUTION: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  BILAN: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  frontend: { bg: "bg-violet-50", text: "text-violet-600" },
  backend: { bg: "bg-blue-50", text: "text-blue-600" },
  infra: { bg: "bg-red-50", text: "text-red-600" },
  docs: { bg: "bg-cyan-50", text: "text-cyan-600" },
  process: { bg: "bg-gray-50", text: "text-gray-600" },
};

// ================================================================
// TAB COMPONENTS
// ================================================================

function TabPipeline() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Chaine COMMAND appliquee au dev. Chaque tache passe par 4 stages obligatoires.
      </p>

      {/* 4 Stages */}
      <div className="space-y-3">
        {COMMAND_STAGES.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.stage}>
              <Card className={cn("p-0 overflow-hidden border shadow-sm")}>
                {/* Header gradient */}
                <div className={cn(
                  "px-4 py-2.5 flex items-center gap-2 border-b",
                  `bg-gradient-to-r from-${s.color}-600 to-${s.color}-500`
                )}>
                  <Icon className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{s.stage}</span>
                  <span className="text-xs text-white/80">— {s.label}</span>
                  <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">
                    {s.degre}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-600 mb-3">{s.desc}</p>

                  <div className="space-y-1.5">
                    {s.actions.map((action, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-[9px] font-bold text-gray-400 w-4 text-right shrink-0 mt-0.5">{j + 1}</span>
                        <span className="text-xs text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                    <code className="text-[9px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{s.gate}</code>
                  </div>
                </div>
              </Card>

              {i < COMMAND_STAGES.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronRight className="h-4 w-4 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fast Track */}
      <Card className="p-3 bg-amber-50 border-amber-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">FAST-TRACK</span>
          <Badge variant="outline" className="text-[9px] font-bold bg-amber-100 text-amber-600 border-amber-200">Carl dit "fast-track"</Badge>
        </div>
        <div className="text-[9px] text-amber-700">
          Skip SCAN + STRATEGY. Gate design-system.md toujours requis.
          <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded block mt-1">
            python3 .claude/hooks/gate.py fast-track "description"
          </code>
        </div>
      </Card>
    </div>
  );
}

function TabKeywords() {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? KEYWORDS : KEYWORDS.filter((k) => k.stage === filter || k.category === filter);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        {KEYWORDS.length} mots-cles. Carl dit le mot → Claude execute le protocole exact.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {["all", "SCAN", "STRATEGY", "EXECUTION", "BILAN", "frontend", "backend", "infra", "docs", "process"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              filter === f
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            {f === "all" ? "Tous" : f}
          </button>
        ))}
      </div>

      {/* Keywords Grid */}
      <div className="space-y-3">
        {filtered.map((kw) => {
          const sc = STAGE_COLORS[kw.stage];
          const cc = CATEGORY_COLORS[kw.category];
          return (
            <Card key={kw.id} className="p-0 overflow-hidden border shadow-sm">
              {/* Keyword header */}
              <div className="px-4 py-2.5 bg-gray-50 border-b flex items-center gap-2">
                <code className="text-sm font-bold font-mono text-gray-900">{kw.id}</code>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", sc.bg, sc.text, sc.border)}>
                  {kw.stage}
                </span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", cc.bg, cc.text)}>
                  {kw.category}
                </span>
                <span className="ml-auto text-xs text-gray-500">{kw.label}</span>
              </div>

              <div className="p-4 space-y-3">
                {/* Steps */}
                <div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Etapes</div>
                  <div className="space-y-1">
                    {kw.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[9px] font-bold text-gray-400 w-4 text-right shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-xs text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guardrails */}
                <div>
                  <div className="text-[9px] font-bold text-red-500 uppercase tracking-wide mb-1.5">Garde-fous</div>
                  <div className="space-y-1">
                    {kw.guardrails.map((g, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-red-600">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Files */}
                {kw.files && kw.files.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Fichiers</div>
                    <div className="flex flex-wrap gap-1">
                      {kw.files.map((f) => (
                        <code key={f} className="text-[9px] font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">{f}</code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commands */}
                {kw.commands && kw.commands.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Commandes</div>
                    <div className="space-y-0.5">
                      {kw.commands.map((c) => (
                        <div key={c} className="flex items-center gap-1.5">
                          <Terminal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <code className="text-[9px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{c}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TabGuardrails() {
  return (
    <div className="space-y-5">
      {/* JAMAIS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-bold text-red-800">JAMAIS ({JAMAIS_RULES.length})</span>
        </div>
        <Card className="p-4 bg-red-50/50 border-red-200 shadow-sm">
          <div className="space-y-1.5">
            {JAMAIS_RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-700">{rule}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* TOUJOURS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-bold text-emerald-800">TOUJOURS ({TOUJOURS_RULES.length})</span>
        </div>
        <Card className="p-4 bg-emerald-50/50 border-emerald-200 shadow-sm">
          <div className="space-y-1.5">
            {TOUJOURS_RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs text-emerald-700">{rule}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* STOP CONDITIONS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertOctagon className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-800">STOP ({STOP_CONDITIONS.length} conditions)</span>
        </div>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr] gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Declencheur</span>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Action</span>
          </div>
          <div className="divide-y divide-gray-50">
            {STOP_CONDITIONS.map((sc) => (
              <div key={sc.trigger} className="grid grid-cols-[1fr_1fr] gap-2 px-4 py-2 items-center">
                <span className="text-xs text-gray-700">{sc.trigger}</span>
                <span className="text-xs font-medium text-amber-700">{sc.action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ANTI-PATTERNS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertOctagon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-800">Anti-Patterns ({ANTI_PATTERNS.length})</span>
        </div>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {ANTI_PATTERNS.map((ap) => (
              <div key={ap.bad} className="flex items-center gap-3 py-1">
                <div className="flex-1 flex items-start gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-600 line-through">{ap.bad}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                <div className="flex-1 flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-700 font-medium">{ap.good}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TabSecurity() {
  return (
    <div className="space-y-5">
      {/* Critical Files */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-bold text-gray-800">Fichiers Critiques ({CRITICAL_FILES.length})</span>
        </div>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2 bg-red-50 border-b border-red-100">
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide">Fichier</span>
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide">Risque</span>
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide">Action</span>
          </div>
          <div className="divide-y divide-gray-50">
            {CRITICAL_FILES.map((cf) => (
              <div key={cf.file} className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2 items-center">
                <code className="text-[9px] font-mono text-gray-700">{cf.file}</code>
                <span className="text-[9px] text-gray-600">{cf.risk}</span>
                <span className="text-[9px] font-medium text-red-600">{cf.action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Security Checklist */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-bold text-gray-800">Checklist Securite</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "CORS", check: "allow_origins=[\"https://app.usinebleue.ai\"]", icon: Globe },
            { label: "Credentials", check: "Toujours dans .env, chmod 600", icon: Lock },
            { label: "SQL", check: "Bind params ($1, $2) — jamais f-string", icon: Database },
            { label: "Rate Limit", check: "30 req/min par API key", icon: Gauge },
            { label: "UFW", check: "deny incoming, allow 2222/80/443", icon: Shield },
            { label: "Swagger", check: "Desactive en prod (_DEBUG env var)", icon: Server },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="p-3 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs font-bold text-gray-800">{item.label}</span>
                </div>
                <span className="text-[9px] text-gray-600">{item.check}</span>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Emergency Commands */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-800">Commandes d'Urgence</span>
        </div>
        <Card className="p-4 bg-gray-50 border-gray-200 shadow-sm">
          <div className="space-y-2">
            {[
              { label: "CarlOS mort?", cmd: "sudo systemctl restart brain-bridge" },
              { label: "Logs en temps reel", cmd: "sudo journalctl -u brain-bridge -f" },
              { label: "Annuler changements", cmd: "git checkout -- ." },
              { label: "Restaurer backup", cmd: "cp -r ~/brain-dev-backup-DERNIER/* ~/brain-dev/" },
              { label: "Build frontend", cmd: "cd Interfacev1ghostxorbit9 && npx vite build" },
              { label: "Deploy", cmd: "bash deploy.sh" },
              { label: "Status API", cmd: "curl -s https://app.usinebleue.ai/api/v1/health | jq" },
              { label: "Invariants", cmd: "python3 test_invariants.py" },
            ].map((item) => (
              <div key={item.cmd} className="flex items-center gap-3 py-1">
                <Terminal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600 min-w-[140px]">{item.label}</span>
                <code className="text-[9px] bg-white px-1.5 py-0.5 rounded font-mono text-gray-700 border border-gray-200">{item.cmd}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TabTeam() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-500">
        Equipe de dev: Carl commande, Claude execute, Gemini audite. Prototype pour les bots clients.
      </p>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TEAM_MEMBERS.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.role} className="p-0 overflow-hidden border shadow-sm">
              <div className={cn(
                "px-4 py-2.5 flex items-center gap-2 border-b",
                `bg-gradient-to-r from-${m.color}-600 to-${m.color}-500`
              )}>
                <Icon className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{m.role}</span>
                <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">{m.code}</span>
              </div>
              <div className="p-4">
                <p className="text-[9px] text-gray-500 mb-1">{m.degre}</p>
                <p className="text-xs text-gray-700 mb-3">{m.desc}</p>
                <div className="space-y-1">
                  {m.responsabilites.map((r, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-[9px] text-gray-600">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Team Workflow Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-800">Workflow par Phase</span>
        </div>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-2 px-4 py-2 bg-gray-50 border-b">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Phase</span>
            <span className="text-[9px] font-bold text-cyan-600 uppercase tracking-wide">Carl</span>
            <span className="text-[9px] font-bold text-violet-600 uppercase tracking-wide">Claude</span>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Gemini</span>
          </div>
          <div className="divide-y divide-gray-50">
            {TEAM_WORKFLOW.map((w) => {
              const sc = STAGE_COLORS[w.phase];
              return (
                <div key={w.phase} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-2 px-4 py-2.5 items-center">
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded text-center", sc.bg, sc.text)}>{w.phase}</span>
                  <span className="text-[9px] text-gray-700">{w.carl}</span>
                  <span className="text-[9px] text-gray-700">{w.claude}</span>
                  <span className="text-[9px] text-gray-500">{w.gemini}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Delegation Rules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crosshair className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-800">Regles de Delegation ({DELEGATION_RULES.length})</span>
        </div>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2 bg-gray-50 border-b">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Quoi</span>
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Qui</span>
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Raison</span>
          </div>
          <div className="divide-y divide-gray-50">
            {DELEGATION_RULES.map((d) => (
              <div key={d.quoi} className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-2 items-center">
                <span className="text-xs text-gray-800 font-medium">{d.quoi}</span>
                <span className="text-xs text-gray-700">{d.qui}</span>
                <span className="text-[9px] text-gray-500">{d.raison}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TabReferences() {
  return (
    <div className="space-y-5">
      {/* Sources de Verite */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-bold text-gray-800">Sources de Verite ({SOURCES_VERITE.length})</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Chaque sujet a UNE source unique. Ne JAMAIS confondre.
        </p>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[120px_1fr] gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Sujet</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Fichier</span>
          </div>
          <div className="divide-y divide-gray-50">
            {SOURCES_VERITE.map((sv) => (
              <div key={sv.sujet} className="grid grid-cols-[120px_1fr] gap-2 px-4 py-2 items-center">
                <span className="text-xs font-medium text-gray-800">{sv.sujet}</span>
                <code className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{sv.fichier}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quality Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-bold text-gray-800">Metriques de Qualite ({QUALITY_METRICS.length})</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Questions en fin de session. {QUALITY_METRICS.length}/{QUALITY_METRICS.length} = excellent.
        </p>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            {QUALITY_METRICS.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs text-gray-700">{q}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Score Legend */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Card className="p-2.5 bg-emerald-50 border-emerald-200 text-center">
            <div className="text-lg font-bold text-emerald-700">{QUALITY_METRICS.length}/{QUALITY_METRICS.length}</div>
            <div className="text-[9px] font-bold text-emerald-600">EXCELLENT</div>
          </Card>
          <Card className="p-2.5 bg-amber-50 border-amber-200 text-center">
            <div className="text-lg font-bold text-amber-700">8-9</div>
            <div className="text-[9px] font-bold text-amber-600">ACCEPTABLE</div>
          </Card>
          <Card className="p-2.5 bg-red-50 border-red-200 text-center">
            <div className="text-lg font-bold text-red-700">&lt;8</div>
            <div className="text-[9px] font-bold text-red-600">PROBLEME</div>
          </Card>
        </div>
      </div>

      {/* Key Commands */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-800">Commandes Cles</span>
        </div>
        <Card className="p-4 bg-gray-50 border-gray-200 shadow-sm">
          <div className="space-y-1.5">
            {[
              { tool: "python3 test_invariants.py", desc: "14 SOULs, endpoints, tables, permissions" },
              { tool: "python3 gemini_sentinel.py [pre|post|sprint]", desc: "Audit Gemini independant" },
              { tool: ".claude/hooks/frontend-gate.sh", desc: "Hook auto — bloque Edit/Write violations" },
              { tool: ".claude/hooks/gate.py [status|open|reset]", desc: "Gestion des 4 gates" },
              { tool: "npx vite build", desc: "Build frontend (cd Interfacev1ghostxorbit9)" },
              { tool: "bash deploy.sh", desc: "Deploy VPS2 (frontend + API)" },
            ].map((t) => (
              <div key={t.tool} className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <code className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded text-gray-700 border border-gray-200">{t.tool}</code>
                <span className="text-[9px] text-gray-500">{t.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterRoutinePage() {
  const { setActiveView } = useFrameMaster();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Shield}
          iconColor="text-cyan-600"
          title="Routine Dev & Protocole"
          subtitle="Pipeline COMMAND, mots-cles, garde-fous, equipe"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <div className="flex items-center gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
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
      {activeTab === "pipeline" && <TabPipeline />}
      {activeTab === "keywords" && <TabKeywords />}
      {activeTab === "guardrails" && <TabGuardrails />}
      {activeTab === "security" && <TabSecurity />}
      {activeTab === "team" && <TabTeam />}
      {activeTab === "references" && <TabReferences />}

      {/* Footer Stats */}
      <div className="border-t border-gray-100 pt-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Mots-cles", value: String(KEYWORDS.length), icon: Hash, color: "blue" },
            { label: "Garde-fous", value: String(JAMAIS_RULES.length + TOUJOURS_RULES.length), icon: Shield, color: "red" },
            { label: "Fichiers critiques", value: String(CRITICAL_FILES.length), icon: AlertTriangle, color: "amber" },
            { label: "Sources verite", value: String(SOURCES_VERITE.length), icon: BookOpen, color: "cyan" },
          ].map((stat) => {
            const SIcon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
                <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
