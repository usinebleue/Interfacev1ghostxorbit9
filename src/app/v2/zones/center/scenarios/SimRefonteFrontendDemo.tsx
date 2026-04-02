"use client";

/**
 * SimRefonteFrontendDemo.tsx — Simulation Refonte Frontend CarlOS S74
 * VISION UNIFIÉE: Journée type de Carl dans CarlOS transformé
 * Layout IDENTIQUE à l'app réelle: Discussion (40%) | Contenu + TopBar (60%)
 * Démontre les 13 transformations de la vidéo S74 comme UN FLOW naturel
 * Pattern: même split-screen que CenterZone (LiveChat gauche, Content droite)
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Building2,
  FolderOpen,
  Target,
  CheckCircle2,
  Home,
  Layers,
  Shield,
  MessageSquare,
  BarChart3,
  Play,
  Brain,
  Activity,
  Users,
  Send,
  Mic,
  ClipboardList,
  AlertTriangle,
  Globe,
  Search,
  FileText,
  Video,
  Compass,
  RefreshCw,
  Zap,
  Lock,
  Eye,
  Lightbulb,
  Star,
  Heart,
  MapPin,
  UserCircle,
  Camera,
  Repeat,
  Navigation,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../shared/simulation-components";
import { BOT_COLORS } from "../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "welcome"
  | "home-feed"
  | "feed-click"
  | "chantier-blueprint"
  | "project-missions"
  | "phase-choice"
  | "reflexion-work"
  | "atelier-transition"
  | "atelier-build"
  | "vitaa-scan"
  | "command-execute"
  | "conference"
  | "blueprint-perso"
  | "conclusion";

const STAGE_ORDER: Stage[] = [
  "welcome", "home-feed", "feed-click", "chantier-blueprint",
  "project-missions", "phase-choice", "reflexion-work", "atelier-transition", "atelier-build",
  "vitaa-scan", "command-execute", "conference", "blueprint-perso", "conclusion",
];

const STAGE_LABELS: Record<Stage, string> = {
  welcome: "Bienvenue",
  "home-feed": "Accueil vivant",
  "feed-click": "Navigation cascade",
  "chantier-blueprint": "Chantier = Blueprint",
  "project-missions": "Missions du projet",
  "phase-choice": "Choix de phase",
  "reflexion-work": "Reflexion + GPS",
  "atelier-transition": "Passage Atelier",
  "atelier-build": "Cristallisation",
  "vitaa-scan": "Scan VITAA",
  "command-execute": "COMMAND",
  conference: "Conference travail",
  "blueprint-perso": "Blueprint personnel",
  conclusion: "Vision complete",
};

type Phase = "reflexion" | "atelier" | "command";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Reflexion" },
  atelier: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "Atelier" },
  command: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "COMMAND" },
};

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

const MOCK_FEED = [
  { bot: "CTOB", text: "Audit SEO technique complete — 47 recommandations generees, rapport disponible", time: "il y a 5 min", icon: CheckCircle2, type: "command" as Phase },
  { bot: "CFOB", text: "Budget Q2 : 3 scenarios modelises (conservateur 45K$, normal 65K$, agressif 95K$)", time: "il y a 12 min", icon: BarChart3, type: "atelier" as Phase },
  { bot: "CMOB", text: "Brainstorm 'Strategie reseaux sociaux' avec Simone — 14 idees, 4 retenues", time: "il y a 25 min", icon: Sparkles, type: "reflexion" as Phase },
  { bot: "COOB", text: "Mission 'Optimisation Ligne 3' passee en COMMAND — Tim deploie les correctifs", time: "il y a 1h", icon: Play, type: "command" as Phase },
  { bot: "CEOB", text: "Chantier Marketing Q2 : 65% complete, 2 projets en Atelier, scan VITAA prevu demain", time: "il y a 2h", icon: Activity, type: "atelier" as Phase },
  { bot: "CSOB", text: "Veille concurrentielle : 3 menaces detectees (Ontario), rapport strategique genere", time: "il y a 3h", icon: Search, type: "reflexion" as Phase },
  { bot: "CPOB", text: "Cellule Orbit9 #12 : match 87% avec Automatech — session trisociation planifiee", time: "il y a 4h", icon: Users, type: "atelier" as Phase },
  { bot: "CHROB", text: "Onboarding nouveau membre equipe : Blueprint personnel initie, 3/7 sections remplies", time: "hier", icon: UserCircle, type: "reflexion" as Phase },
];

const CHANTIER_PROJETS = [
  { id: 1, name: "Campagne SEO", missions: 3, progress: 80, phase: "command" as Phase, bot: "CTOB", desc: "Audit technique + mots-cles + contenu" },
  { id: 2, name: "Refonte site web", missions: 4, progress: 45, phase: "atelier" as Phase, bot: "CMOB", desc: "Design + integration + CMS + tests" },
  { id: 3, name: "Strategie reseaux sociaux", missions: 2, progress: 10, phase: "reflexion" as Phase, bot: "CEOB", desc: "Analyse + calendrier editorial" },
];

const MISSIONS_SEO = [
  { name: "Audit technique", taches: 5, progress: 100, phase: "command" as Phase },
  { name: "Recherche mots-cles", taches: 3, progress: 60, phase: "atelier" as Phase },
  { name: "Creation contenu", taches: 8, progress: 20, phase: "reflexion" as Phase },
];

const MISSIONS_REFONTE = [
  { name: "Maquettes UX/UI", taches: 6, progress: 85, phase: "command" as Phase, bot: "CMOB", desc: "Wireframes, prototypes Figma, tests utilisateurs" },
  { name: "Integration front-end", taches: 8, progress: 50, phase: "atelier" as Phase, bot: "CTOB", desc: "HTML/CSS, responsive, composants React" },
  { name: "Migration CMS", taches: 4, progress: 15, phase: "reflexion" as Phase, bot: "CTOB", desc: "WordPress → headless CMS, migration contenu" },
  { name: "Tests et lancement", taches: 5, progress: 0, phase: "reflexion" as Phase, bot: "COOB", desc: "QA, performances, SEO check, go-live plan" },
];

const KPI_DATA = [
  { label: "Chantiers", value: "3", sub: "1 en COMMAND", gradient: "from-amber-600 to-orange-500", icon: FolderOpen },
  { label: "Projets", value: "9", sub: "3 actifs", gradient: "from-blue-600 to-blue-500", icon: Target },
  { label: "Missions", value: "25", sub: "8 en cours", gradient: "from-violet-600 to-violet-500", icon: ClipboardList },
  { label: "Taches", value: "67", sub: "12 completees", gradient: "from-emerald-600 to-emerald-500", icon: CheckCircle2 },
];

const VITAA_SCORES = [
  { label: "Alignement mission", score: 92, ok: true },
  { label: "Coherence valeurs", score: 88, ok: true },
  { label: "Piliers VITAA (V-I-T-A-A)", score: 95, ok: true },
  { label: "Analyse SWOT", score: 72, ok: false },
  { label: "Enrichissement Blueprint", score: 85, ok: true },
];

const BLUEPRINT_SECTIONS = [
  { label: "Mon Pourquoi", filled: true, content: "Transformer les PME manufacturieres par l'intelligence collective" },
  { label: "Ma Mission", filled: true, content: "Faire d'Usine Bleue la reference en innovation manufacturing" },
  { label: "Mes Valeurs", filled: true, content: "Authenticite, Impact, Resilience, Collaboration" },
  { label: "Mes Forces", filled: true, content: "26 ans entrepreneuriat, 7 entreprises, reseau 130+ integrateurs" },
  { label: "Mon Style leadership", filled: false, content: "" },
  { label: "Mes Competences cles", filled: false, content: "" },
  { label: "Mes Objectifs Q2", filled: false, content: "" },
];

const DOC_SECTIONS = [
  { label: "Objectifs business", filled: true, phase: "command" as Phase, author: "CEOB" },
  { label: "Public cible + personas", filled: true, phase: "command" as Phase, author: "CMOB" },
  { label: "Architecture technique", filled: true, phase: "atelier" as Phase, author: "CTOB" },
  { label: "Strategie SEO", filled: true, phase: "atelier" as Phase, author: "CTOB" },
  { label: "Calendrier editorial", filled: false, phase: "atelier" as Phase, author: "CMOB" },
  { label: "Design et UX", filled: false, phase: "atelier" as Phase, author: "CMOB" },
  { label: "Budget et ressources", filled: false, phase: "reflexion" as Phase, author: "CFOB" },
  { label: "KPIs et suivi", filled: false, phase: "reflexion" as Phase, author: "CEOB" },
];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

interface SimRefonteFrontendDemoProps {
  onTransition?: (id: string) => void;
}

export function SimRefonteFrontendDemo({ onTransition }: SimRefonteFrontendDemoProps) {
  const [stage, setStage] = useState<Stage>("welcome");
  const [typed, setTyped] = useState(false);
  const [feedIdx, setFeedIdx] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const si = STAGE_ORDER.indexOf(stage);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, typed, feedIdx]);

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = 0;
  }, [stage]);

  useEffect(() => {
    if (stage !== "home-feed" || feedIdx >= MOCK_FEED.length) return;
    const timer = setTimeout(() => setFeedIdx(i => i + 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, feedIdx]);

  const handleReset = () => { setStage("welcome"); setTyped(false); setFeedIdx(0); };
  const handleBack = () => { if (onTransition) onTransition("hub"); };
  const goNext = (s: Stage) => { setTyped(false); setStage(s); };

  const currentPhase: Phase | null =
    stage === "project-missions" || stage === "reflexion-work" ? "reflexion" :
    stage === "atelier-transition" || stage === "atelier-build" ? "atelier" :
    stage === "vitaa-scan" || stage === "command-execute" ? "command" : null;

  const discussionContext =
    stage === "welcome" || stage === "home-feed" ? "CarlOS — General" :
    stage === "feed-click" || stage === "chantier-blueprint" ? "Chantier Marketing Q2" :
    stage === "project-missions" || stage === "phase-choice" || stage === "reflexion-work" || stage === "atelier-transition" || stage === "atelier-build" || stage === "vitaa-scan" || stage === "command-execute" ? "Projet Refonte site web" :
    stage === "conference" ? "Conference — Cahier de projet" :
    stage === "blueprint-perso" ? "Mon Blueprint personnel" : "CarlOS";

  const activeNav =
    stage === "welcome" || stage === "home-feed" ? "home" :
    stage === "conference" ? "salles" :
    stage === "blueprint-perso" ? "equipe" : "dept";

  const breadcrumb: string[] =
    stage === "feed-click" ? ["Direction", "Chantiers"] :
    stage === "chantier-blueprint" ? ["Direction", "Marketing Q2"] :
    stage === "project-missions" || stage === "phase-choice" ? ["Direction", "Marketing Q2", "Refonte site web"] :
    ["reflexion-work", "atelier-transition", "atelier-build", "vitaa-scan", "command-execute"].includes(stage) ? ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end"] :
    [];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text="Carl, je vais te montrer ta journee type dans CarlOS transforme. On part d'ou on est, meme layout, memes couleurs — et je te montre comment les 13 changements de ta video s'integrent dans un flow naturel. C'est pas des features separees, c'est UNE vision. Pret?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("home-feed")} icon={Sparkles} label="Montre-moi ma journee" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Introduction — vision unifiee</p>}
        </SBubble>
      )}

      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          {si === 1 ? (
            <>
              <TypewriterText
                text="Tu arrives le matin. Ton Home n'est plus un dashboard statique — c'est un fil d'actualite vivant. Regarde a droite: tes bots ont travaille cette nuit. Tim a fini l'audit SEO, Frank a modelise le budget, Mathilde et Simone ont brainstorme ensemble. C'est CA la vie de ta plateforme."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              {feedIdx >= MOCK_FEED.length && <SBtn onClick={() => goNext("feed-click")} icon={FolderOpen} label="Cliquer sur Marketing Q2" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Home vivant — bots actifs</p>}
        </SBubble>
      )}

      {si >= 2 && (
        <>
          {si === 2 && (
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                <p className="text-sm text-blue-900">Je veux voir le chantier Marketing Q2</p>
              </div>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 2}>
            {si === 2 ? (
              <>
                <div className="flex items-center gap-1.5 mb-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                  <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[9px] text-blue-600 font-medium">Discussion: Chantier Marketing Q2</span>
                </div>
                <TypewriterText
                  text="Je switch automatiquement sur la discussion du chantier Marketing Q2. Tout l'historique de ce chantier est la — nos brainstorms precedents, les decisions, tout. Regarde la cascade a droite: le breadcrumb te montre ou tu es. Clique sur le chantier pour voir ses projets."
                  speed={8} className="text-sm text-gray-700" onComplete={() => {}}
                />
                <SBtn onClick={() => goNext("chantier-blueprint")} icon={Layers} label="Ouvrir le chantier" />
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Navigation + discussion contextuelle</p>}
          </SBubble>
        </>
      )}

      {si >= 3 && (
        <SBubble code="CEOB" collapsed={si > 3}>
          {si === 3 ? (
            <>
              <TypewriterText
                text="Le chantier s'ouvre comme un Blueprint — table des matieres avec les 3 projets. Chaque projet affiche sa phase: SEO en vert (COMMAND), site web en jaune (Atelier), reseaux en rouge (Reflexion). C'est les poupees russes — on drill dans le meme panneau. Clique sur Refonte site web pour voir ses missions."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              <SBtn onClick={() => goNext("project-missions")} icon={Target} label="Ouvrir: Refonte site web" />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Chantier = Blueprint des projets</p>}
        </SBubble>
      )}

      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          {si === 4 ? (
            <>
              <div className="flex items-center gap-1.5 mb-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] text-blue-600 font-medium">Discussion: Projet Refonte site web</span>
              </div>
              <TypewriterText
                text="Voila les 4 missions du projet Refonte site web. Maquettes UX presque finies (85%), Integration en Atelier avec Tim (50%), Migration CMS et Tests encore en Reflexion. Tu vois les bots assignes, les taches, la progression. Clique sur une mission pour choisir ta phase de travail."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              <SBtn onClick={() => goNext("phase-choice")} icon={Target} label="Cliquer sur Integration front-end" />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Missions du projet — drill-down</p>}
        </SBubble>
      )}

      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          {si === 5 ? (
            <>
              <TypewriterText
                text="Tu cliques sur la mission Integration — je te demande: tu veux analyser, construire ou executer? L'integration est en Atelier, mais tu peux revenir en Reflexion si tu veux. Par contre, COMMAND est verouille — faut finir l'Atelier d'abord. C'est sequentiel, pas de raccourci."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              <SBtn onClick={() => goNext("reflexion-work")} icon={Search} label="Choisir: Analyser (Reflexion)" />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Choix de phase — sequentiel</p>}
        </SBubble>
      )}

      {si >= 6 && (
        <>
          {si === 6 && (
            <div className="flex items-center gap-1.5 ml-10 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[9px] text-red-600 font-medium">Phase Reflexion active</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 6}>
            {si === 6 ? (
              <>
                <TypewriterText
                  text="On est en Reflexion sur l'integration front-end. Mes boutons de reflexion apparaissent: Brainstorm, Analyser, Rechercher, Challenger, Deep Search. Je detecte 2 lacunes dans ton Blueprint — l'analyse SWOT web est incomplete et les personas utilisateurs manquent. Je te guide comme un GPS."
                  speed={8} className="text-sm text-gray-700" onComplete={() => {}}
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Brainstorm", "Analyser", "Rechercher", "Challenger", "Deep Search"].map(b => (
                    <span key={b} className="text-[9px] bg-red-600 text-white px-2.5 py-1 rounded-full font-medium">{b}</span>
                  ))}
                </div>
                <SBtn onClick={() => goNext("atelier-transition")} icon={Lightbulb} label="On a assez reflechi — Atelier" />
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Reflexion + CarlOS GPS</p>}
          </SBubble>
          {si === 6 && (
            <>
              <SBubble code="CMOB" collapsed={false}>
                <p className="text-sm text-gray-700">
                  <b>Mathilde (CMO):</b> J'ai fait une veille — 3 competiteurs ont refait leur site en Q1. Je suggere d'integrer un chat IA sur la landing + une page diagnostics gratuite pour generer des leads.
                </p>
              </SBubble>
              <SBubble code="CTOB" collapsed={false}>
                <p className="text-sm text-gray-700">
                  <b>Tim (CTO):</b> Cote technique, React + headless CMS serait optimal. Le bundle actuel est trop lourd — j'ai identifie 12 optimisations qui couperaient le temps de chargement de 60%.
                </p>
              </SBubble>
            </>
          )}
        </>
      )}

      {si >= 7 && (
        <>
          {si === 7 && (
            <div className="flex items-center gap-1.5 ml-10 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[9px] text-amber-600 font-medium">Transition vers Atelier</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 7}>
            {si === 7 ? (
              <>
                <TypewriterText
                  text="On passe en Atelier. Les boutons changent: Cristalliser, Synthetiser, Plan d'action, Fil parallele, Cruncher. C'est le passage du chaos a la structure. On prend les idees de la reflexion (Mathilde: chat IA + leads, Tim: React + optimisations) et on les cristallise en plan d'action concret."
                  speed={8} className="text-sm text-gray-700" onComplete={() => {}}
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Cristalliser", "Synthetiser", "Plan d'action", "Fil parallele", "Cruncher"].map(b => (
                    <span key={b} className="text-[9px] bg-amber-600 text-white px-2.5 py-1 rounded-full font-medium">{b}</span>
                  ))}
                </div>
                <SBtn onClick={() => goNext("atelier-build")} icon={FileText} label="Cristalliser le plan" />
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Boutons Atelier — cristalliser</p>}
          </SBubble>
        </>
      )}

      {si >= 8 && (
        <SBubble code="CEOB" collapsed={si > 8}>
          {si === 8 ? (
            <>
              <TypewriterText
                text="Regarde a droite — le cahier de specs se construit en temps reel. 8 sections, chacune avec sa phase. Tim populera la section technique, Mathilde le volet marketing. Moi je supervise et je m'assure que ca tient avec ton Blueprint. Tu peux me dire 'branche mon Drive' et je vais chercher les infos automatiquement."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              <SBtn onClick={() => goNext("vitaa-scan")} icon={Shield} label="Atelier termine — lancer le scan" />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">DocForge en temps reel</p>}
        </SBubble>
      )}

      {si >= 9 && (
        <SBubble code="CEOB" collapsed={si > 9}>
          {si === 9 ? (
            <>
              <TypewriterText
                text="Avant de passer en COMMAND, scan VITAA automatique. Je valide 5 criteres: alignement mission (92%), coherence valeurs (88%), piliers VITAA (95%), analyse SWOT (72% — attention!), et enrichissement Blueprint (85%). L'analyse SWOT est faible — je te recommande de la completer ou de justifier pourquoi on avance quand meme."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              <SBtn onClick={() => goNext("command-execute")} icon={Play} label="Score 4/5 — passer en COMMAND" />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Validation VITAA</p>}
        </SBubble>
      )}

      {si >= 10 && (
        <>
          {si === 10 && (
            <div className="flex items-center gap-1.5 ml-10 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-emerald-600 font-medium">Phase COMMAND active</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 10}>
            {si === 10 ? (
              <>
                <TypewriterText
                  text="COMMAND active! Boutons d'execution: Executer, Deployer, Tracker, Deleguer, Rapport, Automatiser. Tim lance le deploiement technique, Mathilde prepare le contenu. Ce chantier Marketing est recurrent — dans 3 mois, on relance le cycle Q3 avec les apprentissages de Q2. Les commandes recurrentes se declenchent automatiquement."
                  speed={8} className="text-sm text-gray-700" onComplete={() => {}}
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Executer", "Deployer", "Tracker", "Deleguer", "Rapport", "Automatiser"].map(b => (
                    <span key={b} className="text-[9px] bg-emerald-600 text-white px-2.5 py-1 rounded-full font-medium">{b}</span>
                  ))}
                </div>
                <SBtn onClick={() => goNext("conference")} icon={Video} label="Rejoindre la conference equipe" />
              </>
            ) : <p className="text-[9px] text-gray-400 italic">COMMAND + chantier recurrent</p>}
          </SBubble>
        </>
      )}

      {si >= 11 && (
        <SBubble code="CEOB" collapsed={si > 11}>
          {si === 11 ? (
            <>
              <div className="flex items-center gap-1.5 mb-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] text-blue-600 font-medium">Discussion: Conference — Cahier de projet</span>
              </div>
              <TypewriterText
                text="En conference, les cameras sont petites en haut — l'important c'est de TRAVAILLER ensemble, pas de se voir. Meme split-screen: discussion a gauche + zone de travail a droite. On construit le cahier de projet ensemble en temps reel. Chaque participant contribue a sa section."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              <SBtn onClick={() => goNext("blueprint-perso")} icon={UserCircle} label="Voir mon Blueprint personnel" />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Conference = travail en equipe</p>}
        </SBubble>
      )}

      {si >= 12 && (
        <SBubble code="CEOB" collapsed={si > 12}>
          {si === 12 ? (
            <>
              <div className="flex items-center gap-1.5 mb-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] text-blue-600 font-medium">Discussion: Mon Blueprint personnel</span>
              </div>
              <TypewriterText
                text="Chaque humain a son Blueprint personnel — Pourquoi, Mission, Valeurs, Forces, Objectifs, Style de leadership, Competences cles. C'est la fondation. Aussitot que c'est rempli, moi et les 11 bots on a tout pour te connaitre, te guider et aligner chaque decision avec qui tu es vraiment."
                speed={8} className="text-sm text-gray-700" onComplete={() => {}}
              />
              <SBtn onClick={() => goNext("conclusion")} icon={CheckCircle2} label="Voir le resume complet" />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Blueprint — fondation personnelle</p>}
        </SBubble>
      )}

      {stage === "conclusion" && (
        <SBubble code="CEOB" collapsed={false}>
          <TypewriterText
            text="13 transformations, UNE vision. C'est pas des features separees — c'est ta journee de travail qui devient naturellement plus puissante. SaaS + layer agentique. Le chaos organise qui cristallise de l'information. Meme app, 10x plus puissante."
            speed={8} className="text-sm text-gray-700" onComplete={() => {}}
          />
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            <button onClick={handleReset}
              className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer border border-gray-200 hover:bg-gray-200">
              <RotateCcw className="h-3.5 w-3.5" /> Recommencer
            </button>
          </div>
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
        <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Brain className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-bold text-gray-800">Refonte Frontend</span>
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

      <div className="h-1 bg-blue-600 shrink-0" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate">{discussionContext}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-white/70" />
            </div>
          </div>
          {/* Phase indicator — dans le header du chat */}
          {currentPhase && (
            <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-3", PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border)}>
              <div className="flex gap-1">
                {(["reflexion", "atelier", "command"] as Phase[]).map(p => (
                  <span key={p} className={cn(
                    "px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-1",
                    currentPhase === p ? PHASE_COLORS[p].badge : "bg-gray-100 text-gray-400"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full", PHASE_COLORS[p].dot)} />
                    {PHASE_COLORS[p].label}
                    {p === "command" && currentPhase !== "command" && <Lock className="h-2.5 w-2.5 ml-0.5 opacity-50" />}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>
          <div className="shrink-0 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-400">Ecrivez un message...</div>
            <button className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100"><Mic className="h-4 w-4" /></button>
            <button className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50"><Send className="h-4 w-4" /></button>
          </div>
        </div>

        {/* RIGHT — Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar */}
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

          {/* Sub-navigation Mon Département */}
          {activeNav === "dept" && (
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
              {["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"].map((tab, i) => (
                <button key={tab} className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                  (i === 3 && breadcrumb.length > 0) ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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

          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            <RightContent stage={stage} feedIdx={feedIdx} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT
// ═══════════════════════════════════════

function RightContent({ stage, feedIdx }: { stage: Stage; feedIdx: number }) {
  switch (stage) {
    case "welcome": return <ContentDashboard />;
    case "home-feed": return <ContentHomeFeed feedIdx={feedIdx} />;
    case "feed-click": return <ContentChantiersList />;
    case "chantier-blueprint": return <ContentChantierBlueprint showModal={false} />;
    case "project-missions": return <ContentProjectMissions />;
    case "phase-choice": return <ContentChantierBlueprint showModal={true} />;
    case "reflexion-work": return <ContentReflexion />;
    case "atelier-transition":
    case "atelier-build": return <ContentAtelier showDoc={stage === "atelier-build"} />;
    case "vitaa-scan": return <ContentVitaa />;
    case "command-execute": return <ContentCommand />;
    case "conference": return <ContentConference />;
    case "blueprint-perso": return <ContentBlueprintPerso />;
    case "conclusion": return <ContentConclusion />;
    default: return null;
  }
}

// ═══════════════════════════════════════
// CONTENT COMPONENTS
// ═══════════════════════════════════════

function ContentDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
        <Eye className="h-4 w-4 text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700"><b>Etat actuel:</b> Dashboard statique avec KPIs + bot cards. La refonte transforme ca en fil d'actualite vivant.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_DATA.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { code: "CEOB", name: "CarlOS", role: "CEO", gradient: "from-blue-600 to-blue-500" },
          { code: "CTOB", name: "Tim", role: "CTO", gradient: "from-violet-600 to-violet-500" },
          { code: "CFOB", name: "Frank", role: "CFO", gradient: "from-emerald-600 to-emerald-500" },
          { code: "CMOB", name: "Mathilde", role: "CMO", gradient: "from-pink-600 to-pink-500" },
          { code: "CSOB", name: "Simone", role: "CSO", gradient: "from-red-600 to-red-500" },
          { code: "COOB", name: "Olivier", role: "COO", gradient: "from-orange-600 to-orange-500" },
        ].map(bot => (
          <div key={bot.code} className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className={cn("flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r text-white", bot.gradient)}>
              <BotAvatar code={bot.code} size="sm" />
              <div>
                <p className="text-xs font-bold text-white">{bot.name}</p>
                <p className="text-[9px] text-white/70">{bot.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentHomeFeed({ feedIdx }: { feedIdx: number }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Fil d'actualite</h3>
        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium animate-pulse">En direct</span>
      </div>
      <div className="space-y-2">
        {MOCK_FEED.slice(0, feedIdx).map((item, i) => {
          const bot = BOT_COLORS[item.bot];
          const FeedIcon = item.icon;
          const pc = PHASE_COLORS[item.type];
          return (
            <div key={i} className={cn("bg-white border rounded-xl p-3 flex gap-3 cursor-pointer hover:shadow-sm transition-shadow",
              i === 4 ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
            )}>
              <BotAvatar code={item.bot} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700">{item.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-gray-400">{item.time}</span>
                  <span className={cn("text-[9px] font-medium", bot?.text)}>{bot?.name}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium", pc.badge)}>{pc.label}</span>
                </div>
              </div>
              <FeedIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            </div>
          );
        })}
        {feedIdx < MOCK_FEED.length && (
          <div className="flex items-center gap-2 py-2 pl-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-gray-400">Nouvelles activites...</span>
          </div>
        )}
      </div>
      {feedIdx >= MOCK_FEED.length && (
        <>
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-gray-700">Progression chantiers</h4>
            {[
              { name: "Marketing Q2", progress: 65, phase: "atelier" as Phase },
              { name: "Automatisation Usine", progress: 40, phase: "reflexion" as Phase },
              { name: "Expansion Ontario", progress: 20, phase: "reflexion" as Phase },
            ].map(c => {
              const pc = PHASE_COLORS[c.phase];
              return (
                <div key={c.name} className="flex items-center gap-2 py-1">
                  <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", pc.dot)} />
                  <span className="text-xs text-gray-700 flex-1">{c.name}</span>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", pc.dot)} style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400 w-8 text-right">{c.progress}%</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" /> Nouvelles industrie
            </h4>
            {[
              { title: "Subvention CDPQ 2.5M$ pour l'automatisation manufacturiere", source: "Les Affaires", time: "8h" },
              { title: "Nouveau corridor d'export Quebec-Michigan pour PME", source: "MEI", time: "hier" },
            ].map((n, i) => (
              <div key={i} className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-50">
                <p className="text-xs text-gray-700">{n.title}</p>
                <p className="text-[8px] text-gray-400 mt-0.5">{n.source} — {n.time}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-500" /> Bots actifs maintenant
            </h4>
            <div className="flex gap-2">
              {[
                { code: "CTOB", task: "Audit SEO", status: "en cours" },
                { code: "CFOB", task: "Modele budget", status: "termine" },
                { code: "CSOB", task: "Veille concurrence", status: "en cours" },
              ].map(b => (
                <div key={b.code} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                  <BotAvatar code={b.code} size="sm" />
                  <div>
                    <p className="text-[9px] font-medium text-gray-700">{BOT_COLORS[b.code]?.name}</p>
                    <p className="text-[8px] text-gray-400">{b.task}</p>
                  </div>
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", b.status === "en cours" ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ContentChantiersList() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-amber-500" /> Chantiers actifs — Direction
      </h3>
      {[
        { name: "Marketing Q2", projets: 3, progress: 65, phase: "atelier" as Phase, gradient: "from-pink-600 to-pink-500", highlight: true },
        { name: "Automatisation Usine", projets: 2, progress: 40, phase: "reflexion" as Phase, gradient: "from-orange-600 to-orange-500", highlight: false },
        { name: "Expansion Ontario", projets: 4, progress: 20, phase: "reflexion" as Phase, gradient: "from-red-600 to-red-500", highlight: false },
      ].map(c => {
        const pc = PHASE_COLORS[c.phase];
        return (
          <div key={c.name} className={cn("rounded-xl overflow-hidden shadow-sm border", c.highlight ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-100")}>
            <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r text-white", c.gradient)}>
              <FolderOpen className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white flex-1">{c.name}</span>
              <span className="text-[9px] bg-white/25 text-white px-2 py-0.5 rounded-full font-bold">{c.projets} projets</span>
            </div>
            <div className="px-3 py-2.5 flex items-center gap-3">
              <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", pc.dot)} />
              <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", pc.badge)}>{pc.label}</span>
              <div className="flex-1" />
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", pc.dot)} style={{ width: `${c.progress}%` }} />
              </div>
              <span className="text-[9px] text-gray-400">{c.progress}%</span>
              {c.highlight && <ChevronRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContentChantierBlueprint({ showModal }: { showModal: boolean }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4 relative">
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white">
          <FolderOpen className="h-5 w-5 text-white" />
          <div>
            <p className="text-sm font-bold text-white">Chantier Marketing Q2</p>
            <p className="text-[9px] text-white/70">3 projets — 8 missions — 65% complete</p>
          </div>
          <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Atelier</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-48 shrink-0 space-y-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Projets</p>
          {CHANTIER_PROJETS.map(p => {
            const pc = PHASE_COLORS[p.phase];
            return (
              <div key={p.id} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs",
                p.id === 2 ? cn(pc.bg, pc.border, "border font-medium") : "hover:bg-gray-50 text-gray-600"
              )}>
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", pc.dot)} />
                <span className="truncate">{p.name}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 space-y-3">
          {CHANTIER_PROJETS.map(p => {
            const pc = PHASE_COLORS[p.phase];
            return (
              <div key={p.id} className={cn("rounded-xl border p-3", p.id === 2 ? "border-blue-300 bg-blue-50/30" : "border-gray-200")}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", pc.dot)} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{p.name}</p>
                    <p className="text-[9px] text-gray-400">{p.desc}</p>
                  </div>
                  <BotAvatar code={p.bot} size="sm" />
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", pc.badge)}>{pc.label}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", pc.dot)} style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400">{p.progress}%</span>
                  <span className="text-[9px] text-gray-400">{p.missions} missions</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-80">
            <div className="flex items-center gap-2 mb-3">
              <BotAvatar code="CEOB" size="sm" />
              <div>
                <p className="text-sm font-bold text-gray-800">Refonte site web</p>
                <p className="text-[9px] text-gray-400">Que veux-tu faire?</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { phase: "reflexion" as Phase, label: "Analyser", desc: "Defricher les idees, brainstormer", icon: Search, enabled: true },
                { phase: "atelier" as Phase, label: "Construire", desc: "Cristalliser, creer le plan", icon: FileText, enabled: true },
                { phase: "command" as Phase, label: "Executer", desc: "Lancer les missions", icon: Play, enabled: false },
              ].map(opt => {
                const pc = PHASE_COLORS[opt.phase];
                return (
                  <div key={opt.phase} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all",
                    opt.enabled ? cn("cursor-pointer hover:shadow-sm", pc.bg, pc.border) : "bg-gray-50 border-gray-200 opacity-50"
                  )}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", opt.enabled ? pc.dot : "bg-gray-300")}>
                      <opt.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-xs font-bold", opt.enabled ? pc.text : "text-gray-400")}>{opt.label}</p>
                      <p className="text-[9px] text-gray-400">{opt.desc}</p>
                    </div>
                    {!opt.enabled && (
                      <div className="flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5 text-gray-300" />
                        <span className="text-[8px] text-gray-300">Finir l'Atelier</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentProjectMissions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white">
          <Target className="h-5 w-5 text-white" />
          <div>
            <p className="text-sm font-bold text-white">Projet: Refonte site web</p>
            <p className="text-[9px] text-white/70">Chantier Marketing Q2 — 4 missions — 45% complete</p>
          </div>
          <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Atelier</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-48 shrink-0 space-y-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Missions</p>
          {MISSIONS_REFONTE.map((m, i) => {
            const pc = PHASE_COLORS[m.phase];
            return (
              <div key={i} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs",
                i === 1 ? cn(pc.bg, pc.border, "border font-medium") : "hover:bg-gray-50 text-gray-600"
              )}>
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", pc.dot)} />
                <span className="truncate">{m.name}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 space-y-3">
          {MISSIONS_REFONTE.map((m, i) => {
            const pc = PHASE_COLORS[m.phase];
            return (
              <div key={i} className={cn("rounded-xl border p-3", i === 1 ? "border-blue-300 bg-blue-50/30" : "border-gray-200")}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", pc.dot)} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{m.name}</p>
                    <p className="text-[9px] text-gray-400">{m.desc}</p>
                  </div>
                  <BotAvatar code={m.bot} size="sm" />
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", pc.badge)}>{pc.label}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", pc.dot)} style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400">{m.progress}%</span>
                  <span className="text-[9px] text-gray-400">{m.taches} taches</span>
                </div>
                {i === 1 && (
                  <div className="mt-2 pt-2 border-t border-blue-200 space-y-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Taches</p>
                    {["Composants header/footer", "Pages principales (6)", "Formulaires dynamiques", "Integration API", "Animations + micro-interactions", "Responsive mobile", "Tests cross-browser", "Performance audit"].map((t, j) => (
                      <div key={j} className="flex items-center gap-2 text-[9px]">
                        {j < 3 ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : j < 5 ? <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />}
                        <span className={j < 3 ? "text-gray-500 line-through" : "text-gray-700"}>{t}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContentReflexion() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
        <Search className="h-4 w-4 text-red-500" /> Reflexion — Integration front-end
      </h3>

      <div className="flex gap-2">
        {[
          { code: "CMOB", focus: "UX + Marketing" },
          { code: "CTOB", focus: "Architecture technique" },
          { code: "CSOB", focus: "Strategie acquisition" },
          { code: "CEOB", focus: "Vision d'ensemble" },
        ].map(b => (
          <div key={b.code} className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
            <BotAvatar code={b.code} size="sm" />
            <div>
              <p className="text-[9px] font-medium text-gray-700">{BOT_COLORS[b.code]?.name}</p>
              <p className="text-[8px] text-red-600">{b.focus}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-3">
        <Compass className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" /> CarlOS GPS — Lacune detectee
          </p>
          <p className="text-[9px] text-amber-700 mt-1">Ton Blueprint manque l'analyse SWOT pour le secteur web. Je te recommande de la completer avant d'avancer.</p>
          <div className="flex gap-1.5 mt-2">
            <span className="text-[9px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-300">Completer le SWOT</span>
            <span className="text-[9px] bg-white text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-300 cursor-pointer hover:bg-amber-50">Plus tard</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Brainstorm en cours — 6 idees de 4 bots</p>
          <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium animate-pulse">Live</span>
        </div>
        {[
          { text: "Integrer un chat IA (CarlOS) sur la landing page pour qualifier les visiteurs 24/7", bot: "CMOB", votes: 4, tag: "UX" },
          { text: "Calculateur ROI automatisation (Orbit9) — convertit les visiteurs en leads qualifies", bot: "CTOB", votes: 5, tag: "Tech" },
          { text: "Page diagnostics gratuite: 5 questions VITAA → score instantane → lead capture", bot: "CSOB", votes: 3, tag: "Strategie" },
          { text: "Section temoignages video clients + etudes de cas interactives", bot: "CEOB", votes: 2, tag: "Contenu" },
          { text: "Parcours personnalise selon le secteur: manufacturier, services, commerce", bot: "CMOB", votes: 4, tag: "UX" },
          { text: "API catalogue produits pour chaque client — marketplace integree", bot: "CTOB", votes: 3, tag: "Tech" },
        ].map((idea, i) => (
          <div key={i} className="bg-red-50/50 border border-red-100 rounded-lg p-2.5 flex items-center gap-2">
            <BotAvatar code={idea.bot} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700">{idea.text}</p>
              <span className="text-[8px] bg-red-200/50 text-red-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">{idea.tag}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[9px] text-gray-400">{idea.votes}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
          <Brain className="h-3.5 w-3.5" /> Diagnostic integre — analyse automatique
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Presence web", score: 45, detail: "Site vieillissant, pas mobile-first" },
            { label: "SEO technique", score: 80, detail: "Bonne base, 47 optimisations identifiees" },
            { label: "Conversion", score: 32, detail: "Aucun CTA clair, pas de funnel" },
            { label: "Mobile", score: 65, detail: "Responsive basic, pas natif" },
            { label: "Vitesse", score: 38, detail: "Bundle 4.2MB, images non optimisees" },
            { label: "Accessibilite", score: 55, detail: "WCAG AA partiel, contrastes faibles" },
          ].map(d => (
            <div key={d.label} className="bg-white border border-gray-200 rounded-lg p-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] text-gray-600">{d.label}</span>
                <span className={cn("text-[9px] font-bold", d.score >= 70 ? "text-emerald-600" : d.score >= 50 ? "text-amber-600" : "text-red-600")}>{d.score}%</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", d.score >= 70 ? "bg-emerald-500" : d.score >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${d.score}%` }} />
              </div>
              <p className="text-[8px] text-gray-400 mt-0.5">{d.detail}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function ContentAtelier({ showDoc }: { showDoc: boolean }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
        <FileText className="h-4 w-4 text-amber-500" /> Atelier — Refonte site web
      </h3>

      {showDoc ? (
        <div className="flex gap-4">
          <div className="w-44 shrink-0 space-y-1">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Sections</p>
            {DOC_SECTIONS.map((s, i) => {
              const pc = PHASE_COLORS[s.phase];
              return (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-gray-50 cursor-pointer">
                  {s.filled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <div className={cn("w-3.5 h-3.5 rounded-full shrink-0 border-2", pc.border)} />}
                  <span className={cn("truncate flex-1", s.filled ? "text-gray-700" : "text-gray-400")}>{s.label}</span>
                  <BotAvatar code={s.author} size="sm" />
                </div>
              );
            })}
          </div>

          <div className="flex-1 space-y-3">
            <div className="bg-white border border-amber-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-800 mb-2">Strategie SEO</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <p>1. Audit technique complet (Tim a identifie 47 points)</p>
                <p>2. Recherche mots-cles: 150 keywords strategiques identifies</p>
                <p>3. Architecture de contenu: hub &amp; spoke model</p>
                <p>4. Objectif: +40% trafic organique en 6 mois</p>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> Cristallise</span>
              </div>
            </div>
            <div className="bg-white border border-amber-200 border-dashed rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-400 mb-1">Calendrier editorial</h4>
              <p className="text-[9px] text-gray-400 italic">En cours de cristallisation...</p>
              <div className="mt-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <Zap className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-amber-800">Passage en mode Atelier</p>
            <p className="text-xs text-amber-600 mt-1">Les boutons de reflexion sont remplaces par les boutons d'action Atelier</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FileText, label: "Cristalliser un document", desc: "Transformer les idees en plan" },
              { icon: ClipboardList, label: "Plan d'action", desc: "Definir les etapes concretes" },
              { icon: Users, label: "Fil parallele", desc: "Faire venir d'autres bots" },
              { icon: Layers, label: "Synthetiser", desc: "Cruncher l'info de la reflexion" },
            ].map(a => (
              <div key={a.label} className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 cursor-pointer hover:shadow-sm transition-shadow">
                <a.icon className="h-4 w-4 text-amber-600 mb-1.5" />
                <p className="text-xs font-bold text-gray-800">{a.label}</p>
                <p className="text-[9px] text-gray-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentVitaa() {
  return (
    <div className="max-w-xl mx-auto px-6 py-4">
      <div className="bg-white border-2 border-amber-300 rounded-xl overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-200 flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-800">Scan VITAA — Validation post-Atelier</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">Validation automatique d'alignement avec ton Blueprint avant COMMAND.</p>
          {VITAA_SCORES.map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              {v.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-700">{v.label}</span>
                  <span className={cn("text-xs font-bold", v.ok ? "text-emerald-600" : "text-amber-600")}>{v.score}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", v.ok ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${v.score}%` }} />
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Score global</span>
              <span className="text-lg font-black text-emerald-600">4/5</span>
            </div>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Analyse SWOT incomplete — CarlOS recommande de la completer
            </p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 text-xs bg-emerald-600 text-white py-2 rounded-lg font-bold cursor-pointer hover:bg-emerald-700">Justifier et continuer</button>
              <button className="flex-1 text-xs bg-amber-100 text-amber-700 py-2 rounded-lg font-bold cursor-pointer hover:bg-amber-200 border border-amber-300">Reviser en Atelier</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentCommand() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
        <Play className="h-4 w-4 text-emerald-500" /> COMMAND — Refonte site web
      </h3>

      <div className="space-y-2">
        {MISSIONS_SEO.map((m, i) => {
          const pc = PHASE_COLORS[m.phase];
          return (
            <div key={i} className={cn("rounded-xl border p-3 flex items-center gap-3", pc.bg, pc.border)}>
              <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", pc.dot)} />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{m.name}</p>
                <p className="text-[9px] text-gray-400">{m.taches} taches — {m.progress}%</p>
              </div>
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", pc.dot)} style={{ width: `${m.progress}%` }} />
              </div>
              <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", pc.badge)}>{pc.label}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Types d'actions COMMAND</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Play, label: "Executer", desc: "Lancer une mission", active: true },
            { icon: Users, label: "Deleguer", desc: "Assigner a un bot", active: true },
            { icon: BarChart3, label: "Tracker", desc: "Suivre l'avancement", active: true },
            { icon: FileText, label: "Rapport", desc: "Generer un livrable", active: false },
            { icon: RefreshCw, label: "Relancer", desc: "Declencher un cycle", active: false },
            { icon: Zap, label: "Automatiser", desc: "Creer une commande recurrente", active: false },
          ].map(a => (
            <div key={a.label} className={cn("rounded-xl border p-2.5 cursor-pointer transition-all",
              a.active ? "bg-emerald-50 border-emerald-200 hover:shadow-sm" : "bg-gray-50 border-gray-200 opacity-60"
            )}>
              <a.icon className={cn("h-3.5 w-3.5 mb-1", a.active ? "text-emerald-600" : "text-gray-400")} />
              <p className="text-[9px] font-bold text-gray-800">{a.label}</p>
              <p className="text-[8px] text-gray-400">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
        <Repeat className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-emerald-800">Chantier recurrent — Marketing trimestriel</p>
          <p className="text-[9px] text-emerald-600 mt-1">Ce chantier se repete chaque trimestre. Les apprentissages de Q2 nourrissent le prochain cycle Q3.</p>
          <div className="flex gap-3 mt-2">
            {["Q1 ✅", "Q2 ← actif", "Q3 (juil)", "Q4 (oct)"].map((q, i) => (
              <span key={i} className={cn("text-[8px] px-2 py-0.5 rounded-full font-medium",
                i === 0 ? "bg-emerald-200 text-emerald-800" : i === 1 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
              )}>{q}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Bots en execution</p>
        <div className="space-y-2">
          {[
            { code: "CTOB", task: "Deploiement front-end React", progress: 50, eta: "3 jours" },
            { code: "CMOB", task: "Creation contenu pages", progress: 30, eta: "5 jours" },
            { code: "COOB", task: "Plan de tests QA", progress: 10, eta: "1 semaine" },
          ].map(b => (
            <div key={b.code} className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <BotAvatar code={b.code} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-medium text-gray-700">{BOT_COLORS[b.code]?.name}</p>
                  <p className="text-[9px] text-emerald-600">{b.task}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${b.progress}%` }} />
                  </div>
                  <span className="text-[8px] text-gray-400">{b.progress}% — ETA {b.eta}</span>
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Protocole COMMAND — 5 etapes</p>
        <div className="flex items-center gap-1">
          {[
            { label: "Briefing", done: true },
            { label: "Assignation", done: true },
            { label: "Execution", done: false, active: true },
            { label: "Validation", done: false },
            { label: "Livraison", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={cn("flex-1 rounded-full h-1.5",
                step.done ? "bg-emerald-500" : step.active ? "bg-emerald-300 animate-pulse" : "bg-gray-200"
              )} />
              <span className={cn("text-[8px]", step.done ? "text-emerald-600 font-bold" : step.active ? "text-emerald-500" : "text-gray-400")}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentConference() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      <div className="bg-gray-900 rounded-xl p-2 flex items-center gap-2">
        <div className="flex gap-2 flex-1">
          {[
            { name: "Carl", avatar: "/agents/carl-fugere.jpg" },
            { name: "Sophie", avatar: "/agents/generated/cso-sophie-profil-v3.png" },
            { name: "Martin", code: "CTOB" },
          ].map((p, i) => (
            <div key={i} className="relative">
              <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BotAvatar code={p.code!} size="sm" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-white bg-gray-800 px-1.5 rounded">{p.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Camera className="h-3.5 w-3.5 text-gray-400" />
          <Mic className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[9px] text-gray-400">3 participants</span>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-amber-600" />
          <h4 className="text-sm font-bold text-gray-800">Cahier de projet — Refonte site web</h4>
          <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Construction en equipe</span>
        </div>
        <div className="space-y-2">
          {[
            { section: "Objectifs business", status: "complete", author: "Carl" },
            { section: "Architecture technique", status: "en cours", author: "Sophie" },
            { section: "Budget et timeline", status: "a faire", author: "" },
          ].map(s => (
            <div key={s.section} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
              {s.status === "complete" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> :
               s.status === "en cours" ? <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 shrink-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /></div> :
               <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />}
              <span className="text-xs text-gray-700 flex-1">{s.section}</span>
              {s.author && <span className="text-[9px] text-gray-400">{s.author}</span>}
            </div>
          ))}
        </div>
        <p className="text-[9px] text-amber-600 mt-3 italic">L'important c'est de travailler ensemble — pas de se voir. Les cameras sont en support, le vrai focus c'est le document.</p>
      </div>
    </div>
  );
}

function ContentBlueprintPerso() {
  return (
    <div className="max-w-xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-300">
          <img src="/agents/carl-fugere.jpg" alt="Carl" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">Blueprint personnel — Carl Fugere</h3>
          <p className="text-[9px] text-gray-400">La fondation de ton Brain Team</p>
        </div>
      </div>

      <div className="space-y-2">
        {BLUEPRINT_SECTIONS.map((s, i) => (
          <div key={i} className={cn("rounded-xl border p-3", s.filled ? "border-blue-200 bg-blue-50/30" : "border-gray-200 border-dashed")}>
            <div className="flex items-center gap-2 mb-1">
              {s.filled ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" /> : <Heart className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
              <span className={cn("text-xs font-bold", s.filled ? "text-gray-800" : "text-gray-400")}>{s.label}</span>
            </div>
            {s.filled ? (
              <p className="text-[9px] text-gray-600 ml-5">{s.content}</p>
            ) : (
              <div className="ml-5 flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 italic">A remplir avec CarlOS</span>
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          <b>CarlOS GPS:</b> Aussitot que ton Blueprint est complet, moi et les 11 bots on a tout pour te connaitre et te guider. Chaque decision sera alignee avec tes valeurs et ta mission.
        </p>
      </div>
    </div>
  );
}

function ContentConclusion() {
  const changes = [
    { icon: Activity, label: "#4 Home = Fil d'actualite vivant", desc: "Feed dynamique, bots actifs en temps reel" },
    { icon: Layers, label: "#1 Navigation cascade", desc: "Poupees russes — drill-down sans changer de page" },
    { icon: MessageSquare, label: "#8 Discussion par entite", desc: "Le chat change selon la navigation" },
    { icon: FolderOpen, label: "#1b Chantier = Blueprint projets", desc: "Table des matieres + sections" },
    { icon: Target, label: "#3 Choix de phase au clic", desc: "Analyser / Construire / Executer" },
    { icon: Search, label: "#3+5 Reflexion + boutons", desc: "Brainstorm, Analyser, Rechercher, Challenger" },
    { icon: Compass, label: "#7 CarlOS GPS", desc: "Detecte les lacunes, guide proactivement" },
    { icon: FileText, label: "#5 Atelier + boutons", desc: "Cristalliser, Synthetiser, Plan d'action" },
    { icon: Lightbulb, label: "#2 Cristallisation", desc: "DocForge applique a tout" },
    { icon: Shield, label: "#6 Scan VITAA", desc: "Validation automatique avant COMMAND" },
    { icon: Play, label: "#3+5+11 COMMAND + recurrence", desc: "Executer, Deployer + chantiers cycliques" },
    { icon: Video, label: "#9 Conference = travail", desc: "Cameras petites, split-screen de travail" },
    { icon: UserCircle, label: "#12 Blueprint personnel", desc: "Chaque humain a sa fondation" },
    { icon: Globe, label: "#13+10 Layer agentique + design", desc: "SaaS + agent intelligent, pastel" },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-4 space-y-3">
      <div className="text-center mb-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mx-auto mb-2">
          <Brain className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">13 transformations, 1 vision</h2>
        <p className="text-sm text-gray-500">Ta journee type dans CarlOS transforme</p>
      </div>
      <div className="space-y-1.5">
        {changes.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-gray-200 p-2.5 flex items-center gap-2.5 hover:bg-gray-50 transition-colors">
              <Icon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-gray-800">{item.label}</p>
                <p className="text-[9px] text-gray-400">{item.desc}</p>
              </div>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════

function KPICard({ label, value, sub, gradient, icon: Icon }: typeof KPI_DATA[0]) {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r text-white", gradient)}>
        <Icon className="h-4 w-4 text-white" />
        <span className="text-xs font-bold text-white">{label}</span>
      </div>
      <div className="px-3 py-3">
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        <p className="text-[9px] text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

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
