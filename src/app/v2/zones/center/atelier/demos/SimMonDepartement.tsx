"use client";

/**
 * SimMonDepartement.tsx — B1: Navigation cascade complete (Mon Departement)
 * Self-contained simulation — meme pattern que SimPhaseReflexion/Atelier/COMMAND
 * 16 stages: vue ensemble → sub-tabs → chantiers → drill chantier → breadcrumb → drill projet → drill mission → drill tache → discussion change → phase choice → blueprint → sante → documents → performance → agenda → carlos-gps
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Building2,
  Users,
  Brain,
  Globe,
  Shield,
  MessageSquare,
  FolderOpen,
  Target,
  CheckCircle2,
  Search,
  FileText,
  Mic,
  Send,
  Crosshair,
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
  Heart,
  DollarSign,
  Clock,
  ListTodo,
  Eye,
  PenTool,
  Star,
  ChevronDown,
  Activity,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "vue-ensemble"
  | "sub-tabs"
  | "tab-chantiers"
  | "drill-chantier"
  | "breadcrumb"
  | "drill-projet"
  | "drill-mission"
  | "drill-tache"
  | "discussion-change"
  | "phase-choice"
  | "tab-blueprint"
  | "tab-sante"
  | "tab-documents"
  | "tab-performance"
  | "tab-agenda"
  | "carlos-gps";

const STAGE_ORDER: Stage[] = [
  "vue-ensemble", "sub-tabs", "tab-chantiers", "drill-chantier", "breadcrumb",
  "drill-projet", "drill-mission", "drill-tache", "discussion-change", "phase-choice",
  "tab-blueprint", "tab-sante", "tab-documents", "tab-performance", "tab-agenda", "carlos-gps",
];

const STAGE_LABELS: Record<Stage, string> = {
  "vue-ensemble": "Vue d'ensemble",
  "sub-tabs": "11 tabs",
  "tab-chantiers": "Chantiers",
  "drill-chantier": "Drill: Chantier",
  breadcrumb: "Breadcrumb",
  "drill-projet": "Drill: Projet",
  "drill-mission": "Drill: Mission",
  "drill-tache": "Drill: Tache",
  "discussion-change": "Discussion contextuelle",
  "phase-choice": "Choix de phase",
  "tab-blueprint": "Blueprint",
  "tab-sante": "Sante",
  "tab-documents": "Documents",
  "tab-performance": "Performance",
  "tab-agenda": "Agenda",
  "carlos-gps": "CarlOS GPS",
};

type Phase = "reflexion" | "atelier" | "command";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Analyser" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Creer" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Executer" },
};

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

const KPI_DATA = [
  { label: "Chantiers", value: "4", sub: "2 en Reflexion", borderColor: "border-amber-200", bgColor: "bg-amber-50", textColor: "text-amber-700", iconColor: "text-amber-500", icon: FolderOpen },
  { label: "Projets", value: "11", sub: "3 actifs", borderColor: "border-blue-200", bgColor: "bg-blue-50", textColor: "text-blue-700", iconColor: "text-blue-500", icon: Target },
  { label: "Missions", value: "28", sub: "8 en cours", borderColor: "border-violet-200", bgColor: "bg-violet-50", textColor: "text-violet-700", iconColor: "text-violet-500", icon: Crosshair },
  { label: "Taches", value: "73", sub: "15 completees", borderColor: "border-emerald-200", bgColor: "bg-emerald-50", textColor: "text-emerald-700", iconColor: "text-emerald-500", icon: CheckCircle2 },
];

const CHANTIERS = [
  { name: "Marketing Q2", projets: 3, progress: 65, phase: "atelier" as Phase, bot: "CMOB", gradient: "from-pink-300 to-pink-200", borderColor: "border-pink-200", bgColor: "bg-pink-50" },
  { name: "Infrastructure Tech", projets: 2, progress: 40, phase: "reflexion" as Phase, bot: "CTOB", gradient: "from-violet-300 to-violet-200", borderColor: "border-violet-200", bgColor: "bg-violet-50" },
  { name: "RH — Recrutement", projets: 3, progress: 25, phase: "reflexion" as Phase, bot: "CHROB", gradient: "from-orange-300 to-orange-200", borderColor: "border-orange-200", bgColor: "bg-orange-50" },
  { name: "Finance Budget Q3", projets: 2, progress: 10, phase: "reflexion" as Phase, bot: "CFOB", gradient: "from-emerald-300 to-emerald-200", borderColor: "border-emerald-200", bgColor: "bg-emerald-50" },
];

const PROJETS_MARKETING = [
  { name: "Campagne SEO", missions: 3, progress: 80, phase: "command" as Phase, bot: "CTOB", desc: "Audit technique + mots-cles + contenu" },
  { name: "Refonte site web", missions: 4, progress: 45, phase: "atelier" as Phase, bot: "CMOB", desc: "Design + integration + CMS + tests" },
  { name: "Strategie reseaux sociaux", missions: 2, progress: 10, phase: "reflexion" as Phase, bot: "CEOB", desc: "Analyse + calendrier editorial" },
];

const MISSIONS_REFONTE = [
  { name: "Maquettes UX/UI", taches: 6, progress: 85, phase: "command" as Phase, bot: "CMOB", desc: "Wireframes, prototypes, tests utilisateurs" },
  { name: "Integration front-end", taches: 8, progress: 50, phase: "atelier" as Phase, bot: "CTOB", desc: "HTML/CSS, responsive, composants React" },
  { name: "Migration CMS", taches: 4, progress: 15, phase: "reflexion" as Phase, bot: "CTOB", desc: "WordPress vers headless CMS" },
  { name: "Tests et lancement", taches: 5, progress: 0, phase: "reflexion" as Phase, bot: "COOB", desc: "QA, performances, go-live" },
];

const TACHES_INTEGRATION = [
  { name: "Setup projet React + Vite", done: true, priority: "haute" },
  { name: "Composants de base (Header, Footer, Nav)", done: true, priority: "haute" },
  { name: "Pages principales (Home, About, Contact)", done: true, priority: "haute" },
  { name: "Integration API backend", done: false, priority: "haute", active: true },
  { name: "Responsive mobile/tablet", done: false, priority: "moyenne" },
  { name: "Tests unitaires composants", done: false, priority: "moyenne" },
  { name: "Optimisation performances", done: false, priority: "basse" },
  { name: "Documentation technique", done: false, priority: "basse" },
];

const BLUEPRINT_SECTIONS = [
  { id: 1, title: "Vision et mission", filled: true, content: "Positionner Usine Bleue comme le leader AI pour PME manufacturieres au Quebec." },
  { id: 2, title: "Objectifs Q2 2026", filled: true, content: "Augmenter les leads qualifies de 40%, reduire le CAC de 30%, lancer 3 campagnes digitales." },
  { id: 3, title: "SWOT departement", filled: false, content: "" },
  { id: 4, title: "Equipe et responsabilites", filled: true, content: "CarlOS (CEO), Mathilde (CMO), Tim (CTO), Frank (CFO), Helene (CHRO)." },
  { id: 5, title: "Budget et ressources", filled: false, content: "" },
  { id: 6, title: "KPIs et metriques", filled: true, content: "CAC < 500$, conversion > 3%, pipeline > 50 leads/mois, NPS > 8." },
  { id: 7, title: "Risques et mitigations", filled: false, content: "" },
];

const VITAA_SCORES = [
  { label: "Vente", score: 72, color: "bg-emerald-500", textColor: "text-emerald-700", icon: DollarSign },
  { label: "Idee", score: 85, color: "bg-blue-500", textColor: "text-blue-700", icon: Brain },
  { label: "Temps", score: 45, color: "bg-red-500", textColor: "text-red-700", icon: Clock },
  { label: "Argent", score: 60, color: "bg-amber-500", textColor: "text-amber-700", icon: DollarSign },
  { label: "Actif", score: 78, color: "bg-violet-500", textColor: "text-violet-700", icon: Star },
];

const DOCUMENTS = [
  { title: "Rapport Marketing Q1", type: "rapport", date: "15 mars 2026", bot: "CMOB", pages: 12 },
  { title: "Blueprint Direction V2", type: "blueprint", date: "10 mars 2026", bot: "CEOB", pages: 8 },
  { title: "Budget previsionnel Q2", type: "budget", date: "8 mars 2026", bot: "CFOB", pages: 5 },
  { title: "Plan recrutement tech", type: "plan", date: "5 mars 2026", bot: "CHROB", pages: 6 },
  { title: "Audit SEO technique", type: "audit", date: "1 mars 2026", bot: "CTOB", pages: 15 },
  { title: "Cahier de projet Refonte", type: "cahier", date: "28 fev 2026", bot: "CMOB", pages: 22 },
];

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents", "Performance", "Agenda"];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimMonDepartement({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("vue-ensemble");
  const [typed, setTyped] = useState(false);
  const [expandedBlueprint, setExpandedBlueprint] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  const handleReset = () => {
    setStage("vue-ensemble");
    setTyped(false);
    setExpandedBlueprint(null);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  // Discussion context changes with navigation
  const discussionContext =
    si <= STAGE_ORDER.indexOf("sub-tabs") ? "CarlOS — Direction" :
    si <= STAGE_ORDER.indexOf("tab-chantiers") ? "CarlOS — Direction" :
    si <= STAGE_ORDER.indexOf("drill-chantier") ? "Chantier Marketing Q2" :
    si <= STAGE_ORDER.indexOf("drill-projet") ? "Projet Refonte site web" :
    si <= STAGE_ORDER.indexOf("drill-tache") ? "Mission Integration front-end" :
    si <= STAGE_ORDER.indexOf("phase-choice") ? "Mission Integration front-end" :
    "CarlOS — Direction";

  // Active nav
  const activeNav = "dept";

  // Active sub-tab
  const activeSubTab =
    stage === "vue-ensemble" ? 0 :
    stage === "sub-tabs" ? 0 :
    stage === "tab-chantiers" ? 3 :
    stage === "tab-blueprint" ? 1 :
    stage === "tab-sante" ? 2 :
    stage === "tab-documents" ? 8 :
    stage === "tab-performance" ? 9 :
    stage === "tab-agenda" ? 10 :
    si >= STAGE_ORDER.indexOf("drill-chantier") && si <= STAGE_ORDER.indexOf("phase-choice") ? 3 :
    stage === "carlos-gps" ? 0 :
    -1;

  // Breadcrumb
  const breadcrumb: string[] =
    stage === "tab-chantiers" ? ["Direction", "Chantiers"] :
    stage === "drill-chantier" ? ["Direction", "Chantiers", "Marketing Q2"] :
    stage === "breadcrumb" ? ["Direction", "Chantiers", "Marketing Q2"] :
    stage === "drill-projet" ? ["Direction", "Marketing Q2", "Refonte site web"] :
    stage === "drill-mission" ? ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end"] :
    stage === "drill-tache" ? ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end", "Tache #4"] :
    stage === "discussion-change" ? ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end"] :
    stage === "phase-choice" ? ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end"] :
    [];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* Stage: vue-ensemble */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text="Bienvenue dans Mon Departement. Tu as 4 chantiers actifs, 11 projets, 28 missions et 73 taches. 2 chantiers sont en Reflexion, 1 en Atelier et 1 en COMMAND. Regarde les 11 sous-tabs disponibles."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("sub-tabs")} icon={Eye} label="Voir les 11 sous-tabs" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Vue d'ensemble — 4 chantiers, 73 taches</p>}
        </SBubble>
      )}

      {/* Stage: sub-tabs */}
      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          {si === 1 ? (
            <>
              <TypewriterText
                text="Ton departement a 11 sous-tabs: Vue d'ensemble, Blueprint, Sante, Chantiers, Projets, Missions, Taches, Discussions, Documents, Performance et Agenda. Chaque tab donne une vue specialisee. On va regarder les Chantiers."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("tab-chantiers")} icon={FolderOpen} label="Ouvrir: Chantiers" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">11 sous-tabs disponibles</p>}
        </SBubble>
      )}

      {/* Stage: tab-chantiers */}
      {si >= 2 && (
        <SBubble code="CEOB" collapsed={si > 2}>
          {si === 2 ? (
            <>
              <TypewriterText
                text="Voici tes 4 chantiers. Marketing Q2 est le plus avance (65%, Atelier). Infrastructure Tech et RH en Reflexion, Finance aussi. Chaque chantier montre sa phase, son bot responsable et sa progression. Clique sur Marketing Q2."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("drill-chantier")} icon={Target} label="Ouvrir: Marketing Q2" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">4 chantiers — Marketing Q2 selectionne</p>}
        </SBubble>
      )}

      {/* Stage: drill-chantier */}
      {si >= 3 && (
        <>
          {si === 3 && (
            <div className="flex items-center gap-1.5 ml-10 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[9px] text-blue-600 font-medium">Discussion: Chantier Marketing Q2</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 3}>
            {si === 3 ? (
              <>
                <TypewriterText
                  text="Marketing Q2 a 3 projets: Campagne SEO (80%, COMMAND), Refonte site web (45%, Atelier), Strategie reseaux (10%, Reflexion). Le breadcrumb montre ta position: Direction > Marketing Q2. On drill dans Refonte site web?"
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("breadcrumb")} icon={ChevronRight} label="Voir le breadcrumb" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">3 projets — Refonte site web selectionnee</p>}
          </SBubble>
        </>
      )}

      {/* Stage: breadcrumb */}
      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          {si === 4 ? (
            <>
              <TypewriterText
                text="Le breadcrumb te montre exactement ou tu es dans la hierarchie: Direction > Chantiers > Marketing Q2. Chaque element est cliquable pour remonter. C'est la navigation poupees russes. On descend dans Refonte site web."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("drill-projet")} icon={Layers} label="Drill: Refonte site web" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Breadcrumb: Direction &gt; Marketing Q2</p>}
        </SBubble>
      )}

      {/* Stage: drill-projet */}
      {si >= 5 && (
        <>
          {si === 5 && (
            <div className="flex items-center gap-1.5 ml-10 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[9px] text-blue-600 font-medium">Discussion: Projet Refonte site web</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 5}>
            {si === 5 ? (
              <>
                <TypewriterText
                  text="Le projet Refonte site web a 4 missions. Maquettes UX presque finies (85%, COMMAND). Integration front-end en Atelier (50%). Migration CMS et Tests en Reflexion. On va dans Integration front-end."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("drill-mission")} icon={Crosshair} label="Drill: Integration front-end" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">4 missions — Integration front-end selectionnee</p>}
          </SBubble>
        </>
      )}

      {/* Stage: drill-mission */}
      {si >= 6 && (
        <SBubble code="CTOB" collapsed={si > 6}>
          {si === 6 ? (
            <>
              <TypewriterText
                text="Integration front-end: 8 taches, 3 completees, 1 en cours, 4 a faire. Tim est responsable. La tache #4 (Integration API) est en cours. Clique dessus pour voir le detail."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("drill-tache")} icon={ListTodo} label="Drill: Tache #4 — API" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">8 taches — #4 Integration API selectionnee</p>}
        </SBubble>
      )}

      {/* Stage: drill-tache */}
      {si >= 7 && (
        <SBubble code="CTOB" collapsed={si > 7}>
          {si === 7 ? (
            <>
              <TypewriterText
                text="Tache #4: Integration API backend. Statut: en cours, priorite haute, assignee a Tim. Description: connecter les endpoints REST, gerer l'authentification, mapper les modeles de donnees. La discussion change automatiquement quand tu navigues."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("discussion-change")} icon={MessageSquare} label="Voir le changement de discussion" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tache #4 — Integration API en detail</p>}
        </SBubble>
      )}

      {/* Stage: discussion-change */}
      {si >= 8 && (
        <>
          <div className="flex items-center gap-1.5 ml-10 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
            <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[9px] text-blue-600 font-medium">Discussion: Mission Integration front-end</span>
          </div>
          <SBubble code="CEOB" collapsed={si > 8}>
            {si === 8 ? (
              <>
                <TypewriterText
                  text="La discussion a change automatiquement — tu es maintenant dans le contexte de la mission Integration front-end. Chaque entite (chantier, projet, mission) a sa propre discussion avec CarlOS. Tu veux choisir une phase pour cette mission?"
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("phase-choice")} icon={Zap} label="Choisir une phase" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Discussion contextuelle activee</p>}
          </SBubble>
        </>
      )}

      {/* Stage: phase-choice */}
      {si >= 9 && (
        <SBubble code="CEOB" collapsed={si > 9}>
          {si === 9 ? (
            <>
              <TypewriterText
                text="Voici les 3 phases disponibles pour cette mission: Analyser (Reflexion), Creer (Atelier), ou Executer (COMMAND). Chaque phase active des outils differents et mobilise des bots specialises. Maintenant on va explorer les autres tabs du departement."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("tab-blueprint")} icon={FileText} label="Voir: Blueprint" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">3 phases — Analyser / Creer / Executer</p>}
        </SBubble>
      )}

      {/* Stage: tab-blueprint */}
      {si >= 10 && (
        <SBubble code="CEOB" collapsed={si > 10}>
          {si === 10 ? (
            <>
              <TypewriterText
                text="Le Blueprint du departement est un document vivant avec 7 sections. 4 sont remplies, 3 restent a completer. Tu peux cliquer sur une section pour l'editer avec mon aide dans l'Atelier. C'est le DocForge en action."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("tab-sante")} icon={Heart} label="Voir: Sante" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Blueprint — 4/7 sections remplies</p>}
        </SBubble>
      )}

      {/* Stage: tab-sante */}
      {si >= 11 && (
        <SBubble code="CEOB" collapsed={si > 11}>
          {si === 11 ? (
            <>
              <TypewriterText
                text="La Sante du departement montre les 5 piliers VITAA: Vente (72%), Idee (85%), Temps (45% — alerte!), Argent (60%), Actif (78%). Le pilier Temps est critique — trop de missions en retard. Le Triangle du Feu indique que le departement COUVE."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("tab-documents")} icon={FolderOpen} label="Voir: Documents" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Sante VITAA — Temps en alerte (45%)</p>}
        </SBubble>
      )}

      {/* Stage: tab-documents */}
      {si >= 12 && (
        <SBubble code="CEOB" collapsed={si > 12}>
          {si === 12 ? (
            <>
              <TypewriterText
                text="6 documents dans le departement. Tu peux les voir en cards, liste, kanban ou tableur (4 vues). Chaque document montre le bot auteur, la date, et le nombre de pages. Le Cahier de projet Refonte est le plus volumineux (22 pages)."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("tab-performance")} icon={BarChart3} label="Voir: Performance" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">6 documents — 4 vues disponibles</p>}
        </SBubble>
      )}

      {/* Stage: tab-performance */}
      {si >= 13 && (
        <SBubble code="CEOB" collapsed={si > 13}>
          {si === 13 ? (
            <>
              <TypewriterText
                text="La Performance montre les metriques cles: velocite des missions (+12%), taux de completion (68%), temps moyen par tache (2.3 jours), et la tendance mensuelle. Le departement Direction est au-dessus de la moyenne sur l'Idee, mais en retard sur le Temps."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("tab-agenda")} icon={Calendar} label="Voir: Agenda" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Performance — velocite +12%, completion 68%</p>}
        </SBubble>
      )}

      {/* Stage: tab-agenda */}
      {si >= 14 && (
        <SBubble code="CEOB" collapsed={si > 14}>
          {si === 14 ? (
            <>
              <TypewriterText
                text="L'Agenda du departement montre les echeances des chantiers, les jalons des projets, et les deadlines des missions. Cette semaine: revue SEO mardi, point Refonte mercredi, board Finance vendredi. Tout est synchronise avec les missions actives."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("carlos-gps")} icon={Zap} label="Voir: CarlOS GPS" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Agenda — 3 echeances cette semaine</p>}
        </SBubble>
      )}

      {/* Stage: carlos-gps */}
      {si >= 15 && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText
            text="CarlOS GPS est mon systeme de detection proactive. J'ai identifie 3 alertes: le Blueprint a des sections vides, le pilier Temps est critique, et la mission Migration CMS n'a pas bouge depuis 5 jours. Je te guide pour resoudre chaque point. C'est la navigation cascade complete — 16 vues, tout interconnecte."
            speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
          />
          {typed && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button onClick={handleReset}
                className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700">
                <RotateCcw className="h-3.5 w-3.5" /> Recommencer la demo
              </button>
            </div>
          )}
        </SBubble>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Building2 className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-bold text-gray-800">Mon Departement</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-blue-500" : i < si ? "w-2 bg-blue-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className="h-1 shrink-0 bg-blue-600" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>

          {/* Message input */}
          <div className="shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-400">Ecrivez un message...</div>
            <button className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"><Mic className="h-4 w-4" /></button>
            <button className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"><Send className="h-4 w-4" /></button>
          </div>
        </div>

        {/* RIGHT — Content (60%) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar — 6 sections */}
          <div className="h-12 px-2 shrink-0 flex items-center" style={{ backgroundColor: UB_BLUE }}>
            <div className="flex-1 flex items-center gap-0.5">
              {[
                { id: "home", icon: Home, label: "Accueil" },
                { id: "dept", icon: Building2, label: "Mon Departement" },
                { id: "salles", icon: Users, label: "Mes Salles" },
                { id: "equipe", icon: Brain, label: "Mon Equipe" },
                { id: "reseau", icon: Globe, label: "Mon Reseau" },
                { id: "admin", icon: Shield, label: "Admin" },
              ].map(nav => (
                <button key={nav.id} className={cn(
                  "h-8 gap-1 px-2 text-[11px] rounded-md flex items-center transition-all",
                  activeNav === nav.id ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs Mon Departement */}
          {activeSubTab >= 0 && (
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
              {DEPT_SUBTABS.map((tab, i) => (
                <button key={tab} className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                  i === activeSubTab ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 flex items-center gap-1.5">
              {breadcrumb.map((c, i, arr) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                  <span className={cn("text-[11px]", i === arr.length - 1 ? "text-gray-800 font-medium" : "text-gray-400 hover:text-gray-600 cursor-pointer")}>{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Right panel content */}
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            <RightContent stage={stage} expandedBlueprint={expandedBlueprint} setExpandedBlueprint={setExpandedBlueprint} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT ROUTER
// ═══════════════════════════════════════

function RightContent({ stage, expandedBlueprint, setExpandedBlueprint }: {
  stage: Stage;
  expandedBlueprint: number | null;
  setExpandedBlueprint: (v: number | null) => void;
}) {
  if (stage === "vue-ensemble" || stage === "sub-tabs") return <ContentDeptOverview />;
  if (stage === "tab-chantiers") return <ContentChantiers />;
  if (stage === "drill-chantier" || stage === "breadcrumb") return <ContentChantierDetail />;
  if (stage === "drill-projet") return <ContentProjetDetail />;
  if (stage === "drill-mission") return <ContentMissionDetail />;
  if (stage === "drill-tache") return <ContentTacheDetail />;
  if (stage === "discussion-change") return <ContentDiscussionChange />;
  if (stage === "phase-choice") return <ContentPhaseChoice />;
  if (stage === "tab-blueprint") return <ContentBlueprint expanded={expandedBlueprint} setExpanded={setExpandedBlueprint} />;
  if (stage === "tab-sante") return <ContentSante />;
  if (stage === "tab-documents") return <ContentDocuments />;
  if (stage === "tab-performance") return <ContentPerformance />;
  if (stage === "tab-agenda") return <ContentAgenda />;
  if (stage === "carlos-gps") return <ContentCarlOSGPS />;
  return null;
}

// ═══════════════════════════════════════
// CONTENT COMPONENTS
// ═══════════════════════════════════════

function ContentDeptOverview() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_DATA.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={cn("border rounded-xl p-3", kpi.borderColor, kpi.bgColor)}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("h-4 w-4", kpi.iconColor)} />
                <span className="text-[9px] text-gray-500 font-medium">{kpi.label}</span>
              </div>
              <p className={cn("text-xl font-extrabold", kpi.textColor)}>{kpi.value}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Bot team grid */}
      <div>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Equipe active — 12 bots</p>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB", "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB"].map(code => (
            <div key={code} className="flex flex-col items-center gap-1 bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow cursor-pointer">
              <BotAvatar code={code} size="md" />
              <span className="text-[9px] font-medium text-gray-700">{BOT_COLORS[code]?.name || code}</span>
              <span className="text-[8px] text-gray-400">{BOT_COLORS[code]?.role || ""}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Chantiers summary */}
      <div>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Progression des chantiers</p>
        <div className="space-y-2">
          {CHANTIERS.map(ch => (
            <div key={ch.name} className={cn("flex items-center gap-3 border rounded-lg p-2.5 cursor-pointer hover:shadow-sm transition-shadow", ch.borderColor, ch.bgColor)}>
              <BotAvatar code={ch.bot} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{ch.name}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold", PHASE_COLORS[ch.phase].badge)}>{PHASE_COLORS[ch.phase].label}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", PHASE_COLORS[ch.phase].dot)} style={{ width: `${ch.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-500 font-medium">{ch.progress}%</span>
                </div>
              </div>
              <span className="text-[9px] text-gray-400">{ch.projets} projets</span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentChantiers() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Chantiers — Departement Direction</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">4 chantiers</span>
      </div>

      <div className="space-y-3">
        {CHANTIERS.map((ch, idx) => (
          <div key={ch.name} className={cn(
            "border-2 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all",
            idx === 0 ? "border-pink-300 ring-2 ring-pink-200" : ch.borderColor
          )}>
            <div className={cn("h-2 bg-gradient-to-r", ch.gradient)} />
            <div className="p-4">
              <div className="flex items-center gap-3">
                <BotAvatar code={ch.bot} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{ch.name}</span>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", PHASE_COLORS[ch.phase].badge)}>{PHASE_COLORS[ch.phase].label}</span>
                    {idx === 0 && <span className="text-[8px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-medium">Selectionne</span>}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">{BOT_COLORS[ch.bot]?.name} ({BOT_COLORS[ch.bot]?.role}) · {ch.projets} projets</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-gray-800">{ch.progress}%</p>
                  <p className="text-[8px] text-gray-400">completion</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", PHASE_COLORS[ch.phase].dot)} style={{ width: `${ch.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentChantierDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-pink-600" />
        <h3 className="text-sm font-bold text-gray-800">Chantier Marketing Q2 — Projets</h3>
        <span className="text-[9px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium ml-auto">3 projets</span>
      </div>

      <div className="space-y-3">
        {PROJETS_MARKETING.map((proj, idx) => (
          <div key={proj.name} className={cn(
            "border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all",
            idx === 1 ? "border-pink-300 bg-pink-50/50 ring-1 ring-pink-200" : "border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <BotAvatar code={proj.bot} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{proj.name}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", PHASE_COLORS[proj.phase].badge)}>{PHASE_COLORS[proj.phase].label}</span>
                </div>
                <p className="text-[9px] text-gray-500 mt-0.5">{proj.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{proj.progress}%</p>
                <p className="text-[8px] text-gray-400">{proj.missions} missions</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", PHASE_COLORS[proj.phase].dot)} style={{ width: `${proj.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentProjetDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-pink-600" />
        <h3 className="text-sm font-bold text-gray-800">Projet Refonte site web — Missions</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">Phase Atelier · 45%</span>
      </div>

      <div className="space-y-2">
        {MISSIONS_REFONTE.map((m, idx) => (
          <div key={m.name} className={cn(
            "border rounded-xl p-3 cursor-pointer hover:shadow-sm transition-all",
            idx === 1 ? "border-violet-300 bg-violet-50/50 ring-1 ring-violet-200" : "border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <BotAvatar code={m.bot} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">{m.name}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold", PHASE_COLORS[m.phase].badge)}>{PHASE_COLORS[m.phase].label}</span>
                </div>
                <p className="text-[9px] text-gray-500">{m.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{m.progress}%</p>
                <p className="text-[8px] text-gray-400">{m.taches} taches</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", PHASE_COLORS[m.phase].dot)} style={{ width: `${m.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentMissionDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Mission: Integration front-end</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">Phase Atelier · 50%</span>
      </div>

      <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-lg p-3">
        <BotAvatar code="CTOB" size="md" />
        <div>
          <p className="text-xs font-bold text-gray-800">Tim — CTO</p>
          <p className="text-[9px] text-gray-500">Bot responsable · HTML/CSS, responsive, composants React</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-lg font-extrabold text-violet-700">50%</p>
          <p className="text-[8px] text-gray-400">3/8 taches completees</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {TACHES_INTEGRATION.map((t, i) => (
          <div key={i} className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 border cursor-pointer transition-all",
            t.done ? "bg-emerald-50/50 border-emerald-200" :
            t.active ? "bg-amber-50 border-amber-300 ring-1 ring-amber-200" :
            "bg-white border-gray-200 hover:bg-gray-50"
          )}>
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0",
              t.done ? "bg-emerald-500" : t.active ? "bg-amber-500 animate-pulse" : "bg-gray-200"
            )}>
              {t.done ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> :
               t.active ? <Activity className="h-3.5 w-3.5 text-white" /> :
               <span className="text-[8px] text-gray-500">{i + 1}</span>}
            </div>
            <span className={cn("text-[9px] flex-1", t.done ? "text-gray-400 line-through" : "text-gray-700 font-medium")}>{t.name}</span>
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium",
              t.priority === "haute" ? "bg-red-100 text-red-700" :
              t.priority === "moyenne" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-500"
            )}>{t.priority}</span>
            {t.active && <span className="text-[8px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium">En cours</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTacheDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <ListTodo className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Tache #4 — Integration API backend</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">En cours</span>
      </div>

      <div className="bg-white border-2 border-amber-200 rounded-xl overflow-hidden">
        <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">Detail de la tache</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Assignee a</p>
              <div className="flex items-center gap-1.5">
                <BotAvatar code="CTOB" size="sm" />
                <span className="text-[9px] font-medium text-gray-700">Tim (CTO)</span>
              </div>
            </div>
            <div>
              <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Priorite</p>
              <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Haute</span>
            </div>
            <div>
              <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Echeance</p>
              <span className="text-[9px] text-gray-700 font-medium">2 avril 2026</span>
            </div>
            <div>
              <p className="text-[8px] text-gray-400 uppercase font-bold mb-0.5">Temps estime</p>
              <span className="text-[9px] text-gray-700 font-medium">3 jours</span>
            </div>
          </div>

          <div>
            <p className="text-[8px] text-gray-400 uppercase font-bold mb-1">Description</p>
            <p className="text-[9px] text-gray-700 leading-relaxed">Connecter les endpoints REST du backend FastAPI avec le frontend React. Inclut: configuration axios, gestion tokens JWT, mapping des modeles de donnees, gestion des erreurs, et retry logic.</p>
          </div>

          <div>
            <p className="text-[8px] text-gray-400 uppercase font-bold mb-1">Sous-taches</p>
            <div className="space-y-1">
              {[
                { text: "Configurer le client axios avec interceptors", done: true },
                { text: "Mapper les endpoints auth (login, refresh, logout)", done: true },
                { text: "Mapper les endpoints CRUD chantiers/projets", done: false, active: true },
                { text: "Gestion des erreurs centralisee", done: false },
                { text: "Tests integration API", done: false },
              ].map((st, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px]">
                  {st.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> :
                   st.active ? <Activity className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" /> :
                   <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />}
                  <span className={st.done ? "text-gray-400 line-through" : "text-gray-700"}>{st.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discussion contextuelle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[9px] font-bold text-blue-800">Discussion liee a cette tache</span>
        </div>
        <div className="space-y-1.5">
          {[
            { bot: "CTOB", text: "J'ai configure axios avec les interceptors. Le refresh token fonctionne.", time: "il y a 2h" },
            { bot: "CEOB", text: "Excellent. Assure-toi de gerer le cas ou le refresh echoue aussi.", time: "il y a 1h" },
          ].map((msg, i) => (
            <div key={i} className="flex items-start gap-2">
              <BotAvatar code={msg.bot} size="sm" />
              <div className="flex-1">
                <p className="text-[9px] text-gray-700">{msg.text}</p>
                <p className="text-[8px] text-gray-400">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentDiscussionChange() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Discussion contextuelle — Comment ca marche</h3>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
        <p className="text-[9px] text-blue-800 font-medium">Quand tu navigues dans la hierarchie, la discussion change automatiquement pour correspondre a l'entite active.</p>

        <div className="space-y-2">
          {[
            { level: "Departement", context: "CarlOS — Direction", icon: Building2, color: "bg-blue-100 border-blue-300" },
            { level: "Chantier", context: "Chantier Marketing Q2", icon: FolderOpen, color: "bg-pink-100 border-pink-300" },
            { level: "Projet", context: "Projet Refonte site web", icon: Target, color: "bg-amber-100 border-amber-300" },
            { level: "Mission", context: "Mission Integration front-end", icon: Crosshair, color: "bg-violet-100 border-violet-300" },
            { level: "Tache", context: "Tache #4 — Integration API", icon: ListTodo, color: "bg-emerald-100 border-emerald-300" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-gray-300 ml-4" />}
                <div className={cn("flex items-center gap-2 border rounded-lg px-3 py-2 flex-1", item.color)}>
                  <Icon className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-gray-700">{item.level}</p>
                    <p className="text-[8px] text-gray-500">{item.context}</p>
                  </div>
                  <MessageSquare className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <p className="text-[9px] text-gray-700">
            <span className="font-bold text-blue-700">Principe:</span> Chaque entite a sa propre conversation avec CarlOS. Les insights et decisions sont sauvegardes au bon niveau. Quand tu remontes dans la hierarchie, tu retrouves la discussion du niveau parent.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContentPhaseChoice() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Choisir une phase — Integration front-end</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { phase: "reflexion" as Phase, icon: Brain, title: "Analyser", desc: "Diagnostic, consultation multi-bot, brainstorm, 5 Pourquoi, Deep Search, pre-rapport", tools: ["Brainstorm", "5 Pourquoi", "Deep Search", "Challenge"] },
          { phase: "atelier" as Phase, icon: PenTool, title: "Creer", desc: "Document DocForge, SWOT, plan d'action, budget, timeline, scan VITAA", tools: ["DocForge", "SWOT", "Cruncher", "Scan VITAA"] },
          { phase: "command" as Phase, icon: Zap, title: "Executer", desc: "Missions auto-generees, tracking live, delegation, automatisation, rapport", tools: ["Tracker", "Deleguer", "Automatiser", "Rapport"] },
        ].map(p => {
          const Icon = p.icon;
          return (
            <div key={p.phase} className={cn(
              "border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all",
              PHASE_COLORS[p.phase].border, PHASE_COLORS[p.phase].bg
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", PHASE_COLORS[p.phase].dot)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className={cn("text-sm font-bold", PHASE_COLORS[p.phase].text)}>{p.title}</p>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold", PHASE_COLORS[p.phase].badge)}>{p.phase}</span>
                </div>
              </div>
              <p className="text-[9px] text-gray-600 mb-3">{p.desc}</p>
              <div className="space-y-1">
                <p className="text-[8px] text-gray-400 font-bold uppercase">Outils disponibles:</p>
                <div className="flex flex-wrap gap-1">
                  {p.tools.map(t => (
                    <span key={t} className="text-[8px] bg-white/70 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
        <Briefcase className="h-3.5 w-3.5 text-gray-500 shrink-0" />
        <p className="text-[9px] text-gray-600">Les phases sont sequentielles: <span className="font-bold text-red-600">Analyser</span> → <span className="font-bold text-amber-600">Creer</span> → <span className="font-bold text-emerald-600">Executer</span>. Chaque phase alimente la suivante avec les resultats cristallises.</p>
      </div>
    </div>
  );
}

function ContentBlueprint({ expanded, setExpanded }: { expanded: number | null; setExpanded: (v: number | null) => void }) {
  const filledCount = BLUEPRINT_SECTIONS.filter(s => s.filled).length;
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Blueprint — Departement Direction</h3>
        <span className="text-[9px] text-gray-500 ml-auto">{filledCount}/{BLUEPRINT_SECTIONS.length} sections</span>
      </div>

      <div className="flex gap-4">
        {/* TOC sidebar */}
        <div className="w-44 shrink-0 space-y-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Table des matieres</p>
          {BLUEPRINT_SECTIONS.map(s => (
            <button key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className={cn("w-full flex items-center gap-1.5 text-[9px] px-2 py-1.5 rounded cursor-pointer transition-all text-left",
                expanded === s.id ? "bg-blue-100 text-blue-700 font-medium ring-1 ring-blue-300" :
                s.filled ? "bg-green-50 text-green-700 font-medium hover:bg-green-100" :
                "text-gray-400 hover:bg-gray-50"
              )}>
              {s.filled ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />}
              <span className="truncate">{s.id}. {s.title}</span>
            </button>
          ))}
          <div className="mt-3 text-[9px] text-gray-500 px-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(filledCount / BLUEPRINT_SECTIONS.length) * 100}%` }} />
            </div>
            <span className="mt-1 block">{Math.round((filledCount / BLUEPRINT_SECTIONS.length) * 100)}% complet</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {BLUEPRINT_SECTIONS.map(s => (
            <div key={s.id} className={cn(
              "border-l-[3px] rounded-r-lg px-3 py-2.5 transition-all",
              s.filled ? "border-blue-400 bg-blue-50/50" : "border-gray-300 bg-gray-50/50",
              expanded === s.id ? "ring-1 ring-blue-200 bg-blue-50" : ""
            )}>
              <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <h4 className={cn("text-[9px] font-bold", s.filled ? "text-blue-700" : "text-gray-500")}>{s.id}. {s.title}</h4>
                {!s.filled && <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium ml-auto">A completer</span>}
                <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform ml-auto shrink-0", expanded === s.id ? "rotate-180" : "")} />
              </div>
              {expanded === s.id && (
                <div className="mt-2">
                  {s.filled ? (
                    <p className="text-[9px] text-gray-700 leading-relaxed">{s.content}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-400 italic">Section vide — </p>
                      <button className="text-[8px] bg-blue-600 text-white px-2.5 py-1 rounded-full font-medium cursor-pointer hover:bg-blue-700">Remplir avec CarlOS</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentSante() {
  const avgScore = Math.round(VITAA_SCORES.reduce((a, v) => a + v.score, 0) / VITAA_SCORES.length);
  const triangleStatus = avgScore > 70 ? "BRULE" : avgScore > 50 ? "COUVE" : "MEURT";
  const triangleColor = avgScore > 70 ? "text-emerald-700 bg-emerald-100" : avgScore > 50 ? "text-amber-700 bg-amber-100" : "text-red-700 bg-red-100";

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-red-500" />
        <h3 className="text-sm font-bold text-gray-800">Sante — Departement Direction</h3>
        <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto", triangleColor)}>{triangleStatus} · {avgScore}%</span>
      </div>

      {/* VITAA scores */}
      <div className="space-y-2">
        {VITAA_SCORES.map(v => {
          const Icon = v.icon;
          return (
            <div key={v.label} className="flex items-center gap-3">
              <div className="w-16 flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5", v.textColor)} />
                <span className="text-[9px] font-bold text-gray-700">{v.label}</span>
              </div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", v.color)} style={{ width: `${v.score}%` }} />
              </div>
              <span className={cn("text-[9px] font-bold w-8 text-right", v.score < 50 ? "text-red-600" : v.score < 70 ? "text-amber-600" : "text-emerald-600")}>{v.score}%</span>
            </div>
          );
        })}
      </div>

      {/* Triangle du feu */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">Triangle du Feu — Diagnostic</span>
        </div>
        <p className="text-[9px] text-amber-700 mb-3">Le departement COUVE: 3 piliers au-dessus de 60%, mais le Temps (45%) est critique. Les missions prennent trop de temps a completer.</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-[8px] text-red-600 font-bold">ALERTE: Temps (45%)</p>
            <p className="text-[8px] text-red-500">5 missions en retard, 3 taches bloquees depuis 5+ jours</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-[8px] text-amber-600 font-bold">A SURVEILLER: Argent (60%)</p>
            <p className="text-[8px] text-amber-500">Budget Q2 utilise a 55%, marge de manoeuvre limitee</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-1.5">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Recommandations CarlOS</p>
        {[
          { text: "Reorganiser les priorites de la mission Migration CMS — bloquee depuis 5 jours", urgency: "haute" },
          { text: "Ajouter des ressources Tim sur l'integration front-end", urgency: "moyenne" },
          { text: "Reviser le budget allocation pour Q3 avec Frank", urgency: "basse" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0",
              r.urgency === "haute" ? "bg-red-100 text-red-700" : r.urgency === "moyenne" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
            )}>{r.urgency}</span>
            <p className="text-[9px] text-gray-700">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentDocuments() {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Documents — Departement Direction</h3>
        <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-auto">{DOCUMENTS.length} documents</span>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-1">
        {(["cards", "list", "kanban", "spreadsheet"] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={cn("text-[9px] px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer",
              viewMode === mode ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}>
            {mode === "cards" ? "Cards" : mode === "list" ? "Liste" : mode === "kanban" ? "Kanban" : "Tableur"}
          </button>
        ))}
      </div>

      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-2 gap-3">
          {DOCUMENTS.map((doc, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold text-gray-800 flex-1 truncate">{doc.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <BotAvatar code={doc.bot} size="sm" />
                <span className="text-[8px] text-gray-400">{BOT_COLORS[doc.bot]?.name}</span>
                <span className="text-[8px] text-gray-300 ml-auto">{doc.date}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{doc.type}</span>
                <span className="text-[8px] text-gray-400 ml-auto">{doc.pages} pages</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="space-y-1">
          {DOCUMENTS.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-[9px] font-medium text-gray-800 flex-1">{doc.title}</span>
              <BotAvatar code={doc.bot} size="sm" />
              <span className="text-[8px] text-gray-400 w-20">{doc.date}</span>
              <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{doc.type}</span>
              <span className="text-[8px] text-gray-400">{doc.pages}p</span>
            </div>
          ))}
        </div>
      )}

      {/* Kanban view */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-3 gap-3">
          {["rapport", "plan", "autre"].map(cat => (
            <div key={cat} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] font-bold text-gray-600 uppercase mb-2">{cat === "autre" ? "Autres" : cat + "s"}</p>
              <div className="space-y-2">
                {DOCUMENTS.filter(d => cat === "autre" ? !["rapport", "plan"].includes(d.type) : d.type === cat).map((doc, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 cursor-pointer hover:shadow-sm">
                    <p className="text-[9px] font-medium text-gray-800">{doc.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <BotAvatar code={doc.bot} size="sm" />
                      <span className="text-[8px] text-gray-400">{doc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spreadsheet view */}
      {viewMode === "spreadsheet" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-100 px-3 py-1.5 flex items-center gap-4 text-[8px] font-bold text-gray-500 uppercase border-b border-gray-200">
            <span className="flex-1">Titre</span>
            <span className="w-16">Type</span>
            <span className="w-16">Auteur</span>
            <span className="w-20">Date</span>
            <span className="w-10 text-right">Pages</span>
          </div>
          {DOCUMENTS.map((doc, i) => (
            <div key={i} className={cn("px-3 py-1.5 flex items-center gap-4 text-[9px] border-b border-gray-100 hover:bg-blue-50 cursor-pointer", i % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
              <span className="flex-1 font-medium text-gray-800 truncate">{doc.title}</span>
              <span className="w-16 text-gray-500">{doc.type}</span>
              <span className="w-16 text-gray-500">{BOT_COLORS[doc.bot]?.name}</span>
              <span className="w-20 text-gray-400">{doc.date}</span>
              <span className="w-10 text-right text-gray-500">{doc.pages}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentPerformance() {
  const metrics = [
    { label: "Velocite missions", value: "+12%", trend: "up", detail: "vs mois dernier", color: "text-emerald-600" },
    { label: "Taux completion", value: "68%", trend: "up", detail: "50/73 taches", color: "text-blue-600" },
    { label: "Temps moyen/tache", value: "2.3j", trend: "down", detail: "vs 3.1j le mois dernier", color: "text-emerald-600" },
    { label: "Missions en retard", value: "5", trend: "up", detail: "vs 2 le mois dernier", color: "text-red-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Performance — Departement Direction</h3>
        <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium ml-auto">Mars 2026</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="border border-gray-200 rounded-xl p-3">
            <p className="text-[9px] text-gray-500 font-medium mb-1">{m.label}</p>
            <div className="flex items-baseline gap-1.5">
              <p className={cn("text-xl font-extrabold", m.color)}>{m.value}</p>
              <TrendingUp className={cn("h-3.5 w-3.5", m.trend === "up" && m.label !== "Missions en retard" ? "text-emerald-500" : "text-red-500",
                m.trend === "down" ? "rotate-180" : "")} />
            </div>
            <p className="text-[8px] text-gray-400 mt-0.5">{m.detail}</p>
          </div>
        ))}
      </div>

      {/* Chart mockup */}
      <div className="border border-gray-200 rounded-xl p-4">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-3">Progression des chantiers — 6 derniers mois</p>
        <div className="space-y-3">
          {CHANTIERS.map(ch => (
            <div key={ch.name} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-medium text-gray-700 w-32">{ch.name}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  {[20, 15, 30].map((segment, j) => (
                    <div key={j} className={cn("h-full",
                      j === 0 ? "bg-red-300" : j === 1 ? "bg-amber-300" : "bg-emerald-300"
                    )} style={{ width: `${Math.min(segment, ch.progress / 3)}%` }} />
                  ))}
                  <div className={cn("h-full", PHASE_COLORS[ch.phase].dot)} style={{ width: `${ch.progress - 65 > 0 ? ch.progress - 65 : 0}%` }} />
                </div>
                <span className="text-[9px] text-gray-500 font-medium w-8 text-right">{ch.progress}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3">
          {[
            { color: "bg-red-300", label: "Analyser" },
            { color: "bg-amber-300", label: "Creer" },
            { color: "bg-emerald-300", label: "Executer" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={cn("w-3 h-3 rounded", l.color)} />
              <span className="text-[8px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bot performance */}
      <div>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Performance par bot</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { code: "CTOB", missions: 12, completed: 9, avgTime: "1.8j" },
            { code: "CMOB", missions: 8, completed: 5, avgTime: "2.5j" },
            { code: "CFOB", missions: 6, completed: 4, avgTime: "3.2j" },
          ].map(b => (
            <div key={b.code} className="border border-gray-200 rounded-lg p-2.5 flex items-center gap-2">
              <BotAvatar code={b.code} size="sm" />
              <div>
                <p className="text-[9px] font-bold text-gray-700">{BOT_COLORS[b.code]?.name}</p>
                <p className="text-[8px] text-gray-400">{b.completed}/{b.missions} missions · {b.avgTime} avg</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentAgenda() {
  const events = [
    { day: "Lun 31", title: "Sprint planning Q2", time: "9h00", bot: "CEOB", type: "meeting" },
    { day: "Mar 1", title: "Revue SEO avec Tim", time: "10h30", bot: "CTOB", type: "review" },
    { day: "Mer 2", title: "Point Refonte site web", time: "14h00", bot: "CMOB", type: "meeting" },
    { day: "Jeu 3", title: "Deadline: maquettes UX finales", time: "17h00", bot: "CMOB", type: "deadline" },
    { day: "Ven 4", title: "Board Finance Q2-Q3", time: "11h00", bot: "CFOB", type: "board" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Agenda — Semaine du 31 mars 2026</h3>
        <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-auto">{events.length} evenements</span>
      </div>

      <div className="space-y-2">
        {events.map((ev, i) => (
          <div key={i} className={cn("border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all",
            ev.type === "deadline" ? "border-red-200 bg-red-50/50" :
            ev.type === "board" ? "border-amber-200 bg-amber-50/50" :
            "border-gray-200"
          )}>
            <div className="w-16 shrink-0 text-center">
              <p className="text-[9px] text-gray-400 font-medium">{ev.day.split(" ")[0]}</p>
              <p className="text-lg font-extrabold text-gray-800">{ev.day.split(" ")[1]}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">{ev.title}</p>
              <p className="text-[9px] text-gray-500">{ev.time}</p>
            </div>
            <BotAvatar code={ev.bot} size="sm" />
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium",
              ev.type === "deadline" ? "bg-red-100 text-red-700" :
              ev.type === "board" ? "bg-amber-100 text-amber-700" :
              ev.type === "review" ? "bg-violet-100 text-violet-700" :
              "bg-blue-100 text-blue-700"
            )}>{ev.type}</span>
          </div>
        ))}
      </div>

      {/* Jalons */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Prochains jalons</p>
        <div className="space-y-1.5">
          {[
            { text: "Fin phase Atelier — Refonte site web", date: "10 avril", phase: "atelier" as Phase },
            { text: "Lancement COMMAND — Campagne SEO", date: "15 avril", phase: "command" as Phase },
            { text: "Board trimestriel Finance", date: "30 avril", phase: "reflexion" as Phase },
          ].map((j, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", PHASE_COLORS[j.phase].dot)} />
              <span className="text-[9px] text-gray-700 flex-1">{j.text}</span>
              <span className="text-[8px] text-gray-400">{j.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentCarlOSGPS() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">CarlOS GPS — Detection proactive</h3>
        <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium ml-auto">3 alertes</span>
      </div>

      <div className="space-y-3">
        {/* Alert 1 */}
        <div className="border-2 border-red-200 bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-bold text-red-800">Blueprint incomplet</span>
            <span className="text-[8px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full font-medium ml-auto">Haute</span>
          </div>
          <p className="text-[9px] text-red-700 mb-2">3 sections du Blueprint sont vides: SWOT departement, Budget et ressources, Risques et mitigations. Sans ces sections, les decisions manquent de contexte strategique.</p>
          <button className="text-[8px] bg-red-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-700">Remplir les sections manquantes</button>
        </div>

        {/* Alert 2 */}
        <div className="border-2 border-amber-200 bg-amber-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Pilier Temps critique (45%)</span>
            <span className="text-[8px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium ml-auto">Moyenne</span>
          </div>
          <p className="text-[9px] text-amber-700 mb-2">5 missions en retard dans le departement. La principale cause: Migration CMS bloquee depuis 5 jours sans action. Le bot Tim peut reprendre l'analyse si tu le souhaites.</p>
          <div className="flex gap-2">
            <button className="text-[8px] bg-amber-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-amber-700">Relancer Tim sur Migration CMS</button>
            <button className="text-[8px] bg-white text-amber-700 px-3 py-1.5 rounded-full font-medium border border-amber-300 cursor-pointer hover:bg-amber-100">Reprioriser les missions</button>
          </div>
        </div>

        {/* Alert 3 */}
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-800">Opportunite detectee</span>
            <span className="text-[8px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-medium ml-auto">Info</span>
          </div>
          <p className="text-[9px] text-blue-700 mb-2">Le programme referral propose dans le brainstorm Marketing Q2 pourrait generer 15 leads/mois avec un investissement minimal (1,200$/mois). Frank a valide le ROI a 4.2x. Pret pour COMMAND?</p>
          <button className="text-[8px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-700">Creer une mission pour le referral</button>
        </div>
      </div>

      {/* Navigation cascade recap */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-gray-600" />
          <span className="text-xs font-bold text-gray-800">Navigation cascade — Resume</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["Vue d'ensemble", "11 tabs", "Chantiers", "Drill chantier", "Breadcrumb", "Drill projet", "Drill mission", "Drill tache", "Discussion contextuelle", "Phase choice", "Blueprint", "Sante", "Documents", "Performance", "Agenda", "CarlOS GPS"].map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-gray-300" />}
              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-0.5" />{step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════

function SBubble({ code, children, collapsed }: { code: string; children: React.ReactNode; collapsed: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  if (collapsed) {
    return (
      <div className="flex gap-2 items-center opacity-60">
        <BotAvatar code={code} size="sm" />
        <div className="text-[9px] text-gray-400">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[88%] shadow-sm border-l-2", bot.border)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[11px] font-semibold", bot.text)}>{bot.name}</span>
          <span className="text-[9px] text-gray-400">{bot.role}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function SBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onClick}
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700">
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
    </div>
  );
}
