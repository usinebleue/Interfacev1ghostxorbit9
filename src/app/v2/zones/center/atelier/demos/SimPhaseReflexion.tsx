"use client";

/**
 * SimPhaseReflexion.tsx — Phase Reflexion (rouge pastel) — SIMULATION COMPLETE
 * Meme cadre que SimRefonteFrontendDemo: TopBar 6 sections, sub-tabs, breadcrumb, phase indicator
 * Flow: Mon Departement → Chantier Marketing Q2 → Projet Refonte site web → Mission Integration → Phase Reflexion
 * Puis: diagnostic, multi-bot, brainstorm, 5 pourquoi, deep search, challenge, pre-rapport DocForge
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
  Play,
  Lock,
  Mic,
  Send,
  Compass,
  Navigation,
  Star,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Pin,
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
  Crosshair,
  BookOpen,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../../components/ui/resizable";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "dept-overview"
  | "dept-chantiers"
  | "drill-chantier"
  | "drill-projet"
  | "drill-mission"
  | "phase-choice"
  | "reflexion-start"
  | "diagnostic"
  | "multi-consult"
  | "perspective-cmo"
  | "perspective-cfo"
  | "perspective-cto"
  | "synthese"
  | "brainstorm"
  | "synthese-brainstorm"
  | "cinq-pourquoi"
  | "deep-search"
  | "synthese-recherche"
  | "challenge"
  | "pre-rapport"
  | "extraction"
  | "transition";

const STAGE_ORDER: Stage[] = [
  "dept-overview", "dept-chantiers", "drill-chantier", "drill-projet", "drill-mission",
  "phase-choice", "reflexion-start", "diagnostic", "multi-consult",
  "perspective-cmo", "perspective-cfo", "perspective-cto", "synthese",
  "brainstorm", "synthese-brainstorm", "cinq-pourquoi", "deep-search",
  "synthese-recherche", "challenge", "pre-rapport",
  "extraction", "transition",
];

const STAGE_LABELS: Record<Stage, string> = {
  "dept-overview": "Vue d'ensemble",
  "dept-chantiers": "Chantiers",
  "drill-chantier": "Chantier Marketing Q2",
  "drill-projet": "Projet Refonte site web",
  "drill-mission": "Missions du projet",
  "phase-choice": "Choix de phase",
  "reflexion-start": "Demarrage Analyse",
  diagnostic: "Diagnostic initial",
  "multi-consult": "Consultation multi-bot",
  "perspective-cmo": "Perspective CMO",
  "perspective-cfo": "Perspective CFO",
  "perspective-cto": "Perspective CTO",
  synthese: "Synthese croisee",
  brainstorm: "Brainstorm",
  "synthese-brainstorm": "Synthese + Bonification",
  "cinq-pourquoi": "5 Pourquoi",
  "deep-search": "Deep Search",
  "synthese-recherche": "Synthese des recherches",
  challenge: "Challenge",
  "pre-rapport": "Pre-rapport",
  extraction: "Extraction",
  transition: "Transition Creer",
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

const BRAINSTORM_IDEAS = [
  { id: 1, text: "Campagne micro-influenceurs regionale", bot: "CMOB", tag: "Marketing", color: "bg-yellow-100 border-yellow-300" },
  { id: 2, text: "Partenariat distributeurs automatisation", bot: "CSOB", tag: "Strategie", color: "bg-blue-100 border-blue-300" },
  { id: 3, text: "Webinaires VITAA pour prospects", bot: "CEOB", tag: "Contenu", color: "bg-green-100 border-green-300" },
  { id: 4, text: "Programme referral clients existants", bot: "CFOB", tag: "Finance", color: "bg-pink-100 border-pink-300" },
  { id: 5, text: "Contenu educatif LinkedIn serie", bot: "CMOB", tag: "Marketing", color: "bg-purple-100 border-purple-300" },
  { id: 6, text: "Salon virtuel manufacturiers Q3", bot: "COOB", tag: "Operations", color: "bg-orange-100 border-orange-300" },
];

const DEEP_SEARCH_SOURCES = [
  { icon: FileText, title: "Rapport MESI 2025", detail: "Tendances numeriques PME manufacturieres", score: 94 },
  { icon: BarChart3, title: "Benchmark secteur", detail: "Cout acquisition client SaaS B2B: 340-890$", score: 87 },
  { icon: TrendingUp, title: "Etude CEFRIO", detail: "72% des PME sous-investissent en marketing digital", score: 91 },
  { icon: Target, title: "Analyse concurrents", detail: "3 solutions comparables, aucune avec AI CEO integree", score: 82 },
];

const REPORT_SECTIONS = [
  { id: 1, title: "Contexte et enjeux", content: "Le chantier Marketing Q2 vise a augmenter la visibilite d'Usine Bleue aupres des PME manufacturieres du Quebec. Budget actuel: 12K$/mois. Objectif: +40% de leads qualifies." },
  { id: 2, title: "Diagnostic initial", content: "3 tensions identifiees: cout acquisition eleve (780$/lead), faible conversion site web (1.2%), pipeline trop dependant du bouche-a-oreille (65%)." },
  { id: 3, title: "Perspectives multi-bot", content: "CMO: repositionner le message sur le ROI concret. CFO: budget reallocation content vs ads. CTO: automatiser le nurturing email." },
  { id: 4, title: "Brainstorm — 6 idees", content: "Micro-influenceurs, partenariats distributeurs, webinaires VITAA, referral program, content LinkedIn, salon virtuel Q3." },
  { id: 5, title: "Analyse 5 Pourquoi", content: "Cause racine: le messaging actuel parle de technologie, pas de resultats business. Les PME ne se reconnaissent pas." },
  { id: 6, title: "Deep Search — 4 sources", content: "MESI 2025, benchmark SaaS B2B, etude CEFRIO, analyse concurrentielle. Consensus: le marche est pret mais mal adresse." },
  { id: 7, title: "Challenge et defense", content: "Challenge sur le budget: Frank demontre ROI > 3x avec le programme referral seul. Risque identifie: timeline agressive pour Q2." },
  { id: 8, title: "Recommandations", content: "Prioriser: (1) Programme referral (quick win), (2) Content LinkedIn (moyen terme), (3) Webinaires VITAA (long terme). Budget total: 3,800$/mois." },
];

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimPhaseReflexion({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("dept-overview");
  const [typed, setTyped] = useState(false);
  const [brainstormVotes, setBrainstormVotes] = useState<Record<number, "up" | "down" | null>>({});
  const [sectionsFilled, setSectionsFilled] = useState<number[]>([]);
  const [extractedInsights, setExtractedInsights] = useState<string[]>([]);
  const [showDefense, setShowDefense] = useState(false);
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
    setStage("dept-overview");
    setTyped(false);
    setBrainstormVotes({});
    setSectionsFilled([]);
    setExtractedInsights([]);
    setShowDefense(false);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };
  const fillSection = (num: number) => { if (!sectionsFilled.includes(num)) setSectionsFilled(prev => [...prev, num]); };
  const addInsight = (text: string) => { if (!extractedInsights.includes(text)) setExtractedInsights(prev => [...prev, text]); };

  // Phase active — reflexion once entered, but phase bar ALWAYS visible (Carl's request)
  const currentPhase: Phase | null =
    si >= STAGE_ORDER.indexOf("reflexion-start") ? "reflexion" : null;
  const showPhaseBar = true; // Phase bar permanente — Carl veut toujours la voir

  // Discussion context changes with navigation
  const discussionContext =
    si <= STAGE_ORDER.indexOf("dept-chantiers") ? "CarlOS — Direction" :
    si <= STAGE_ORDER.indexOf("drill-chantier") ? "Chantier Marketing Q2" :
    si <= STAGE_ORDER.indexOf("drill-mission") ? "Projet Refonte site web" :
    "Analyse — Integration front-end";

  // Active nav
  const activeNav = "dept";

  // Active sub-tab
  const activeSubTab =
    si <= STAGE_ORDER.indexOf("dept-overview") ? 0 :
    si <= STAGE_ORDER.indexOf("dept-chantiers") ? 3 :
    si >= STAGE_ORDER.indexOf("reflexion-start") ? -1 : 3;

  // Breadcrumb
  const breadcrumb: string[] =
    stage === "dept-chantiers" ? ["Direction", "Chantiers"] :
    stage === "drill-chantier" ? ["Direction", "Marketing Q2"] :
    stage === "drill-projet" ? ["Direction", "Marketing Q2", "Refonte site web"] :
    stage === "drill-mission" || stage === "phase-choice" ? ["Direction", "Marketing Q2", "Refonte site web", "Missions"] :
    si >= STAGE_ORDER.indexOf("reflexion-start") ? ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end"] :
    [];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* Stage: dept-overview */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text="Bonjour Carl. Ton departement Direction a 4 chantiers actifs, 11 projets et 28 missions. 2 chantiers sont encore en phase Reflexion. On va regarder ca ensemble."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("dept-chantiers")} icon={FolderOpen} label="Voir les chantiers" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Vue d'ensemble departement — 4 chantiers, 28 missions</p>}
        </SBubble>
      )}

      {/* Stage: dept-chantiers */}
      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          {si === 1 ? (
            <>
              <TypewriterText
                text="Voici tes 4 chantiers actifs. Marketing Q2 est le plus avance a 65%, en phase Atelier. Infrastructure Tech et RH sont en Reflexion. Clique sur Marketing Q2 pour voir ses projets."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("drill-chantier")} icon={Target} label="Ouvrir: Marketing Q2" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">4 chantiers — Marketing Q2 selectionne</p>}
        </SBubble>
      )}

      {/* Stage: drill-chantier */}
      {si >= 2 && (
        <>
          {si === 2 && (
            <div className="flex items-center gap-1.5 ml-10 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[9px] text-blue-600 font-medium">Discussion: Chantier Marketing Q2</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 2}>
            {si === 2 ? (
              <>
                <TypewriterText
                  text="Le chantier Marketing Q2 a 3 projets. Campagne SEO est en COMMAND (80%), Refonte site web en Atelier (45%), et Strategie reseaux en Reflexion (10%). Chaque projet montre sa phase, son bot responsable, et sa progression. On drill dans Refonte site web?"
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("drill-projet")} icon={Layers} label="Ouvrir: Refonte site web" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">3 projets — Refonte site web selectionne</p>}
          </SBubble>
        </>
      )}

      {/* Stage: drill-projet */}
      {si >= 3 && (
        <>
          {si === 3 && (
            <div className="flex items-center gap-1.5 ml-10 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[9px] text-blue-600 font-medium">Discussion: Projet Refonte site web</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 3}>
            {si === 3 ? (
              <>
                <TypewriterText
                  text="Voila les 4 missions du projet. Maquettes UX presque finies (85% en COMMAND), Integration front-end en Atelier (50%), et Migration CMS + Tests encore en Reflexion. Les bots sont assignes a chaque mission. On va travailler sur l'integration front-end."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("drill-mission")} icon={Target} label="Voir les missions" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">4 missions — Integration front-end selectionnee</p>}
          </SBubble>
        </>
      )}

      {/* Stage: drill-mission — show taches */}
      {si >= 4 && (
        <SBubble code="CEOB" collapsed={si > 4}>
          {si === 4 ? (
            <>
              <TypewriterText
                text="L'Integration front-end a 8 taches — 3 completees, 2 en cours, 3 a faire. Tim (CTO) est le bot responsable. Tu veux Analyser plus en profondeur, Creer le plan, ou Executer?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("phase-choice")} icon={Crosshair} label="Choisir une phase" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">8 taches — choix de phase</p>}
        </SBubble>
      )}

      {/* Stage: phase-choice */}
      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          {si === 5 ? (
            <>
              <TypewriterText
                text="3 modes disponibles. Analyser est ouvert — tu peux brainstormer, diagnostiquer, chercher. Creer est accessible pour cristalliser le plan. Executer est verrouille tant qu'on n'a pas fini de Creer. On commence l'analyse?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("reflexion-start")} icon={Search} label="Commencer l'analyse" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Phase Reflexion choisie</p>}
        </SBubble>
      )}

      {/* Stage: reflexion-start — Animation invitation bots (Carl vocal 20:09: "voir CarlOS inviter les bots") */}
      {si >= 6 && (
        <>
          {si === 6 && (
            <div className="flex items-center gap-1.5 ml-10 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-red-600 font-medium">Mode Analyse actif</span>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 6}>
            {si === 6 ? (
              <>
                <TypewriterText
                  text="Mode Analyse active sur l'integration front-end. Je mobilise 3 specialistes pour cette mission."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {/* Bot invitation animation (Carl: "avant il y avait un mode d'invitation... au lieu de juste les ajouter en haut") */}
                {typed && (
                  <div className="mt-3 space-y-1.5">
                    {[
                      { code: "CMOB", name: "Mathilde", role: "CMO — Analyse marche", delay: "0ms" },
                      { code: "CFOB", name: "Frank", role: "CFO — Budget et ROI", delay: "400ms" },
                      { code: "CTOB", name: "Tim", role: "CTO — Faisabilite technique", delay: "800ms" },
                    ].map(bot => (
                      <div key={bot.code} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: bot.delay, animationFillMode: "both", animationDuration: "500ms" }}>
                        <BotAvatar code={bot.code} size="sm" />
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-gray-700">{bot.name}</span>
                          <span className="text-[8px] text-gray-500 ml-1.5">{bot.role}</span>
                        </div>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[8px] text-emerald-600 font-medium">Rejoint</span>
                      </div>
                    ))}
                  </div>
                )}
                {typed && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {["Brainstorm", "Analyser", "Rechercher", "Challenger", "Deep Search", "5 Pourquoi"].map(b => (
                      <span key={b} className="text-[9px] bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-full font-medium">{b}</span>
                    ))}
                  </div>
                )}
                {typed && <SBtn onClick={() => goNext("diagnostic")} icon={Search} label="Commencer l'analyse" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Analyse demarree — 3 bots mobilises</p>}
          </SBubble>
        </>
      )}

      {/* Stage: diagnostic */}
      {si >= 7 && (
        <>
          <SBubble code="CEOB" collapsed={si > 7}>
            {si === 7 ? (
              <>
                <TypewriterText
                  text="Diagnostic initial — 3 questions de cadrage rapides pour orienter la reflexion:"
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && (
                  <div className="mt-2 space-y-1.5">
                    {[
                      { q: "Q1", text: "Quel est votre cout d'acquisition actuel par lead?" },
                      { q: "Q2", text: "D'ou viennent vos leads aujourd'hui (%, par canal)?" },
                      { q: "Q3", text: "Quel budget mensuel marketing total?" },
                    ].map(item => (
                      <div key={item.q} className="text-sm text-gray-700 bg-red-50 rounded-lg px-3 py-1.5 border-l-2 border-red-400">
                        <span className="font-semibold text-red-700">{item.q}.</span> {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Diagnostic — 3 questions de cadrage</p>}
          </SBubble>
          {si === 7 && typed && (
            <>
              <div className="flex justify-end">
                <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                  <p className="text-sm text-blue-900">780$/lead environ. 65% bouche-a-oreille, 20% site web, 15% salons. Budget: 12K$/mois.</p>
                </div>
              </div>
              <SBtn onClick={() => goNext("multi-consult")} icon={Users} label="Lancer la consultation multi-bot" />
            </>
          )}
        </>
      )}

      {/* Stage: multi-consult — animation */}
      {stage === "multi-consult" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[9px] text-red-600 font-medium">3 bots analysent en parallele...</span>
          </div>
          <div className="space-y-1">
            {[
              { code: "CMOB", text: "Mathilde analyse le positionnement marche..." },
              { code: "CFOB", text: "Frank modele le budget et le ROI..." },
              { code: "CTOB", text: "Tim evalue la faisabilite technique..." },
            ].map(b => (
              <div key={b.code} className="flex items-center gap-2 text-[9px] text-gray-600">
                <BotAvatar code={b.code} size="sm" />
                <span>{b.text}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />
              </div>
            ))}
          </div>
          {/* Auto-advance after 2s */}
          <AutoAdvance onComplete={() => { fillSection(1); goNext("perspective-cmo"); }} delay={2500} />
        </div>
      )}

      {/* Perspective CMO */}
      {si >= STAGE_ORDER.indexOf("perspective-cmo") && (
        <SBubble code="CMOB" collapsed={si > STAGE_ORDER.indexOf("perspective-cmo")}>
          {si === STAGE_ORDER.indexOf("perspective-cmo") ? (
            <>
              <TypewriterText
                text="3 insights marche: (1) Le message actuel parle de technologie, pas de ROI — les PME decrochent. (2) Le canal LinkedIn est sous-exploite — 0 contenu organique depuis 3 mois. (3) Les concurrents investissent 3x plus en content marketing. Recommendation: pivoter le messaging vers les resultats business concrets."
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(2); }}
              />
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => addInsight("Pivoter le messaging vers ROI concret")}
                    className="flex items-center gap-1 text-[9px] text-pink-600 hover:text-pink-700 font-medium cursor-pointer bg-pink-50 px-2 py-1 rounded-full border border-pink-200"
                  >
                    <Pin className="h-3.5 w-3.5" /> Epingler dans le pre-rapport
                  </button>
                  <button className="flex items-center gap-1 text-[9px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ajouter cette perspective
                  </button>
                  <button className="flex items-center gap-1 text-[9px] text-amber-600 hover:text-amber-700 font-medium cursor-pointer bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5" /> Challenger
                  </button>
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("perspective-cfo")} icon={DollarSign} label="Perspective CFO" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mathilde — messaging ROI, LinkedIn, concurrence</p>}
        </SBubble>
      )}

      {/* Perspective CFO */}
      {si >= STAGE_ORDER.indexOf("perspective-cfo") && (
        <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("perspective-cfo")}>
          {si === STAGE_ORDER.indexOf("perspective-cfo") ? (
            <>
              <TypewriterText
                text="Analyse financiere: Le CAC de 780$ est 2.3x au-dessus du benchmark SaaS B2B (340$). Le ROI marketing est de 1.8x — sous le seuil de 3x recommande. Proposition: reallouer 40% du budget salons vers digital. Economie projetee: 2,880$/mois. ROI projete: 3.2x en 6 mois."
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(3); }}
              />
              {typed && (
                <div className="mt-2 bg-emerald-50 rounded-lg px-3 py-2 text-[9px]">
                  <div className="flex items-center gap-4">
                    <div><span className="font-bold text-emerald-700">CAC actuel:</span> 780$</div>
                    <div><span className="font-bold text-emerald-700">Cible:</span> 340$</div>
                    <div><span className="font-bold text-emerald-700">ROI projete:</span> 3.2x</div>
                  </div>
                </div>
              )}
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => addInsight("CAC 780$ → cible 340$, ROI 3.2x")}
                    className="flex items-center gap-1 text-[9px] text-pink-600 hover:text-pink-700 font-medium cursor-pointer bg-pink-50 px-2 py-1 rounded-full border border-pink-200"
                  >
                    <Pin className="h-3.5 w-3.5" /> Epingler dans le pre-rapport
                  </button>
                  <button className="flex items-center gap-1 text-[9px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ajouter cette perspective
                  </button>
                  <button className="flex items-center gap-1 text-[9px] text-amber-600 hover:text-amber-700 font-medium cursor-pointer bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5" /> Challenger
                  </button>
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("perspective-cto")} icon={Brain} label="Perspective CTO" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Frank — CAC 780$ vs 340$, ROI 3.2x</p>}
        </SBubble>
      )}

      {/* Perspective CTO */}
      {si >= STAGE_ORDER.indexOf("perspective-cto") && (
        <SBubble code="CTOB" collapsed={si > STAGE_ORDER.indexOf("perspective-cto")}>
          {si === STAGE_ORDER.indexOf("perspective-cto") ? (
            <>
              <TypewriterText
                text="Faisabilite technique: (1) Le site web convertit a 1.2% — deployer un chatbot AI augmenterait a 3-4%. (2) Email nurturing inexistant — on peut automatiser 80% avec les outils deja builtes. (3) Risque: timeline agressive pour Q2, je recommande Q2+Q3 pour les automatisations lourdes."
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(3); }}
              />
              {typed && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Conversion: 1.2% → 3-4%</span>
                  <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Risque: timeline Q2</span>
                </div>
              )}
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => addInsight("Conversion 1.2%→3-4% via chatbot AI")}
                    className="flex items-center gap-1 text-[9px] text-pink-600 hover:text-pink-700 font-medium cursor-pointer bg-pink-50 px-2 py-1 rounded-full border border-pink-200"
                  >
                    <Pin className="h-3.5 w-3.5" /> Epingler dans le pre-rapport
                  </button>
                  <button className="flex items-center gap-1 text-[9px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ajouter cette perspective
                  </button>
                  <button className="flex items-center gap-1 text-[9px] text-amber-600 hover:text-amber-700 font-medium cursor-pointer bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5" /> Challenger
                  </button>
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("synthese")} icon={Layers} label="Voir la synthese" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tim — conversion 1.2%→3-4%, nurturing auto</p>}
        </SBubble>
      )}

      {/* Synthese */}
      {si >= STAGE_ORDER.indexOf("synthese") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("synthese")}>
          {si === STAGE_ORDER.indexOf("synthese") ? (
            <>
              <TypewriterText
                text="Synthese des 3 perspectives: Consensus sur le pivot messaging (ROI > tech). Divergence sur la timeline — Mathilde veut Q2 agressif, Tim recommande Q2+Q3. Frank confirme le budget est la si on realloue les salons. Je recommande le brainstorm pour generer des idees concretes."
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(4); }}
              />
              {typed && (
                <div className="mt-2 flex gap-1.5">
                  <SBtn onClick={() => goNext("brainstorm")} icon={Lightbulb} label="Lancer le Brainstorm" />
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Consensus messaging, divergence timeline</p>}
        </SBubble>
      )}

      {/* Brainstorm */}
      {si >= STAGE_ORDER.indexOf("brainstorm") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("brainstorm")}>
          {si === STAGE_ORDER.indexOf("brainstorm") ? (
            <>
              <TypewriterText
                text="Mode Brainstorm active. 6 idees generees par l'equipe. Votez a droite pour prioriser — les idees plebiscitees seront integrees au plan d'action. Chaque bot a contribue selon sa specialite."
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(5); }}
              />
              {typed && <SBtn onClick={() => goNext("synthese-brainstorm")} icon={Layers} label="Synthetiser les idees" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">6 idees, votes en cours</p>}
        </SBubble>
      )}

      {/* Synthese Brainstorm — bonification iterative (Carl video S76) */}
      {si >= STAGE_ORDER.indexOf("synthese-brainstorm") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("synthese-brainstorm")}>
          {si === STAGE_ORDER.indexOf("synthese-brainstorm") ? (
            <>
              <TypewriterText
                text="Synthese des 6 idees + perspectives des 3 bots. Je combine les idees les plus votees avec les insights du diagnostic. Voici une proposition bonifiee a droite — on fusionne le referral program de Frank avec le contenu LinkedIn de Mathilde pour un plan integre. Tu veux qu'on rechallenge ou qu'on creuse?"
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(5); }}
              />
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[9px] bg-red-600 text-white px-2.5 py-1 rounded-full font-medium cursor-pointer">Rechallenger</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium cursor-pointer">Approfondir une idee</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium cursor-pointer">Ajouter mes idees</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium cursor-pointer">Valider et continuer</span>
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("cinq-pourquoi")} icon={Search} label="Creuser avec les 5 Pourquoi" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Synthese brainstorm — plan integre referral + LinkedIn</p>}
        </SBubble>
      )}

      {/* 5 Pourquoi */}
      {si >= STAGE_ORDER.indexOf("cinq-pourquoi") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("cinq-pourquoi")}>
          {si === STAGE_ORDER.indexOf("cinq-pourquoi") ? (
            <>
              <TypewriterText
                text="Methode 5 Pourquoi — on creuse la cause racine du probleme de performance marketing. Le resultat est a droite dans l'arbre de causes."
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(5); }}
              />
              {typed && <SBtn onClick={() => goNext("deep-search")} icon={Globe} label="Lancer le Deep Search" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Cause racine: messaging technique vs resultats</p>}
        </SBubble>
      )}

      {/* Deep Search */}
      {si >= STAGE_ORDER.indexOf("deep-search") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("deep-search")}>
          {si === STAGE_ORDER.indexOf("deep-search") ? (
            <>
              <TypewriterText
                text="Deep Search lance. Je cherche des donnees externes pour valider nos hypotheses. 4 sources trouvees avec des scores de pertinence. Les resultats s'affichent a droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(6); }}
              />
              {typed && <SBtn onClick={() => goNext("synthese-recherche")} icon={Layers} label="Synthetiser les recherches" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">4 sources externes validees</p>}
        </SBubble>
      )}

      {/* Synthese Recherche — consolider les decouvertes (Carl video S76) */}
      {si >= STAGE_ORDER.indexOf("synthese-recherche") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("synthese-recherche")}>
          {si === STAGE_ORDER.indexOf("synthese-recherche") ? (
            <>
              <TypewriterText
                text="Synthese complete — je combine les 4 sources du Deep Search avec la cause racine des 5 Pourquoi et les idees du brainstorm. Resultats consolides a droite: 3 constats valides, 2 hypotheses a verifier, 1 risque identifie. On est pret pour challenger les conclusions?"
                speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(6); }}
              />
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[9px] bg-red-600 text-white px-2.5 py-1 rounded-full font-medium cursor-pointer">Challenger les conclusions</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium cursor-pointer">Relancer le Deep Search</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium cursor-pointer">Demander un 2e avis</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium cursor-pointer">Ajouter mes observations</span>
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("challenge")} icon={AlertTriangle} label="Challenger les conclusions" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Synthese recherche — 3 constats, 2 hypotheses, 1 risque</p>}
        </SBubble>
      )}

      {/* Challenge */}
      {si >= STAGE_ORDER.indexOf("challenge") && (
        <>
          {si === STAGE_ORDER.indexOf("challenge") && (
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                <p className="text-sm text-blue-900">Je challenge le budget: 8K$/mois ca semble trop agressif vu notre taille.</p>
              </div>
            </div>
          )}
          <SBubble code="CFOB" collapsed={si > STAGE_ORDER.indexOf("challenge")}>
            {si === STAGE_ORDER.indexOf("challenge") ? (
              <>
                <TypewriterText
                  text="Challenge accepte. Le programme referral seul coute 1,200$/mois et genere un ROI de 4.2x. Si on priorise referral + contenu LinkedIn (budget combine: 3,800$/mois), le ROI projete est de 3.6x. C'est plus conservateur que le plan complet a 8K$, et on peut scaler apres validation Q2."
                  speed={8} className="text-sm text-gray-700" onComplete={() => { setTyped(true); fillSection(7); setShowDefense(true); }}
                />
                {showDefense && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-[9px]">
                    <div className="font-semibold text-emerald-700 mb-1">Plan revise (conservateur):</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Referral: 1,200$/mois → ROI 4.2x</div>
                      <div>LinkedIn: 2,600$/mois → ROI 2.8x</div>
                      <div className="font-bold text-emerald-800 col-span-2">Total: 3,800$/mois → ROI combine 3.6x</div>
                    </div>
                  </div>
                )}
                {typed && <SBtn onClick={() => goNext("pre-rapport")} icon={FileText} label="Generer le pre-rapport" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Challenge budget — plan revise 3,800$/mois</p>}
          </SBubble>
        </>
      )}

      {/* Pre-rapport */}
      {si >= STAGE_ORDER.indexOf("pre-rapport") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("pre-rapport")}>
          {si === STAGE_ORDER.indexOf("pre-rapport") ? (
            <>
              <TypewriterText
                text="Le pre-rapport se construit a droite avec les 8 sections remplies durant cette Reflexion. Table des matieres sur le cote, contenu a droite. Tu peux revoir chaque section. Quand tu es pret, on cristallise en document ou on passe en Atelier."
                speed={8} className="text-sm text-gray-700" onComplete={() => {
                  setTyped(true);
                  REPORT_SECTIONS.forEach((_, i) => fillSection(i + 1));
                }}
              />
              {typed && <SBtn onClick={() => goNext("extraction")} icon={Pin} label="Extraire et finaliser" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Pre-rapport 8 sections</p>}
        </SBubble>
      )}

      {/* Extraction */}
      {si >= STAGE_ORDER.indexOf("extraction") && (
        <SBubble code="CEOB" collapsed={si > STAGE_ORDER.indexOf("extraction")}>
          {si === STAGE_ORDER.indexOf("extraction") ? (
            <>
              <TypewriterText
                text="Rapport complet. 3 options: cristalliser en document formel, passer en Atelier pour creer le plan d'action, ou continuer l'analyse avec d'autres outils."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: "Cristalliser en document", desc: "Genere un PDF avec les 8 sections", icon: FileText },
                    { label: "Passer en Atelier", desc: "Creer le plan d'action concret", icon: Zap },
                    { label: "Continuer l'analyse", desc: "SWOT, scenarios, benchmarks", icon: Search },
                  ].map(opt => (
                    <button key={opt.label} onClick={() => goNext("transition")}
                      className="w-full flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-left hover:bg-red-100 cursor-pointer transition-colors"
                    >
                      <opt.icon className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[9px] font-semibold text-gray-800">{opt.label}</p>
                        <p className="text-[8px] text-gray-500">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">3 options finales</p>}
        </SBubble>
      )}

      {/* Transition */}
      {stage === "transition" && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-xl px-4 py-3">
          <TypewriterText
            text="Pret pour Creer! Les 8 sections sont sauvegardees. On va maintenant cristalliser le plan d'action concret a partir de tout ce qu'on a analyse."
            speed={10} className="text-sm text-amber-800 font-medium" onComplete={() => setTyped(true)}
          />
          {typed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] text-amber-700 font-semibold ml-1">Analyser → Creer</span>
            </div>
          )}
        </div>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT (same frame as SimRefonteFrontendDemo)
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Brain className="h-4 w-4 text-red-600" />
        <span className="text-sm font-bold text-gray-800">Phase Reflexion</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-red-500" : i < si ? "w-2 bg-red-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Ligne de couleur du bot actif (Carl vocal S76: "ça pourrait être la couleur du bot") */}
      <div className={cn("h-1 shrink-0", currentPhase ? PHASE_COLORS[currentPhase].dot : "bg-blue-600")} />

      <ResizablePanelGroup direction="horizontal" autoSaveId="sim-reflexion-split" className="flex-1">
        {/* LEFT — Discussion */}
        <ResizablePanel defaultSize={40} minSize={20} maxSize={60}>
        <div className="h-full flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header — avatar LEFT, name CENTER, MessageSquare RIGHT */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar + bot avatars — TOUJOURS visible (Carl vocal S76: phases à DROITE, bots = juste l'équipe, PAS CarlOS) */}
          {showPhaseBar && (
            <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2",
              currentPhase ? cn(PHASE_COLORS[currentPhase].bg, PHASE_COLORS[currentPhase].border) : "bg-gray-50 border-gray-200"
            )}>
              {/* Bot team avatars à GAUCHE — seulement les 3 membres (CarlOS = porteur de ballon en haut) */}
              {currentPhase && (
                <div className="flex items-center gap-1.5">
                  {[
                    { code: "CMOB" },
                    { code: "CFOB" },
                    { code: "CTOB" },
                  ].map(b => (
                    <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                      <BotAvatar code={b.code} size="sm" />
                      <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b.code]?.name}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                  ))}
                </div>
              )}
              {/* Phase badges à DROITE (Carl: "je les mettrais à droite") */}
              <div className="flex gap-1 ml-auto">
                {(["reflexion", "atelier", "command"] as Phase[]).map(p => (
                  <span key={p} className={cn(
                    "px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-1 transition-all",
                    currentPhase === p ? PHASE_COLORS[p].badge : "bg-gray-100 text-gray-400"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full transition-all", currentPhase === p ? PHASE_COLORS[p].dot : "bg-gray-300")} />
                    {PHASE_COLORS[p].label}
                    {p === "command" && <Lock className="h-2.5 w-2.5 ml-0.5 opacity-50" />}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>
        </div>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize" />

        {/* RIGHT — Content */}
        <ResizablePanel defaultSize={60} minSize={30}>
        <div className="h-full flex flex-col overflow-hidden">
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
          {activeNav === "dept" && activeSubTab >= 0 && (
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
            <RightContent
              stage={stage}
              brainstormVotes={brainstormVotes}
              setBrainstormVotes={setBrainstormVotes}
              sectionsFilled={sectionsFilled}
              extractedInsights={extractedInsights}
            />
          </div>
        </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT
// ═══════════════════════════════════════

interface RightContentProps {
  stage: Stage;
  brainstormVotes: Record<number, "up" | "down" | null>;
  setBrainstormVotes: React.Dispatch<React.SetStateAction<Record<number, "up" | "down" | null>>>;
  sectionsFilled: number[];
  extractedInsights: string[];
}

function RightContent({ stage, brainstormVotes, setBrainstormVotes, sectionsFilled, extractedInsights }: RightContentProps) {
  const si = STAGE_ORDER.indexOf(stage);

  if (stage === "dept-overview") return <ContentDeptOverview />;
  if (stage === "dept-chantiers") return <ContentChantiers />;
  if (stage === "drill-chantier") return <ContentChantierDetail />;
  if (stage === "drill-projet") return <ContentProjetMissions />;
  if (stage === "drill-mission") return <ContentMissionTaches />;
  if (stage === "phase-choice") return <ContentPhaseChoice />;
  if (si >= STAGE_ORDER.indexOf("reflexion-start") && si < STAGE_ORDER.indexOf("brainstorm")) {
    return <ContentReflexionWork stage={stage} extractedInsights={extractedInsights} />;
  }
  if (stage === "brainstorm") return <ContentBrainstorm brainstormVotes={brainstormVotes} setBrainstormVotes={setBrainstormVotes} />;
  if (stage === "synthese-brainstorm") return <ContentSyntheseBrainstorm />;
  if (stage === "cinq-pourquoi") return <ContentCinqPourquoi />;
  if (stage === "deep-search") return <ContentDeepSearch />;
  if (stage === "synthese-recherche") return <ContentSyntheseRecherche />;
  if (stage === "challenge") return <ContentChallenge />;
  if (stage === "pre-rapport" || stage === "extraction") return <ContentPreRapport sectionsFilled={sectionsFilled} extractedInsights={extractedInsights} />;
  if (stage === "transition") return <ContentTransition />;
  return null;
}

// ═══════════════════════════════════════
// CONTENT COMPONENTS
// ═══════════════════════════════════════

function ContentDeptOverview() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_DATA.map(kpi => (
          <div key={kpi.label} className={cn("rounded-xl border shadow-sm", kpi.borderColor)}>
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-t-xl", kpi.bgColor)}>
              <kpi.icon className={cn("h-4 w-4", kpi.iconColor)} />
              <span className={cn("text-xs font-bold", kpi.textColor)}>{kpi.label}</span>
            </div>
            <div className="px-3 py-3 bg-white rounded-b-xl">
              <p className={cn("text-2xl font-extrabold", kpi.textColor)}>{kpi.value}</p>
              <p className="text-[9px] text-gray-500">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { code: "CEOB", name: "CarlOS", role: "CEO", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
          { code: "CTOB", name: "Tim", role: "CTO", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
          { code: "CFOB", name: "Frank", role: "CFO", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
          { code: "CMOB", name: "Mathilde", role: "CMO", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
          { code: "CSOB", name: "Simone", role: "CSO", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
          { code: "COOB", name: "Olivier", role: "COO", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
        ].map(bot => (
          <div key={bot.code} className={cn("rounded-xl overflow-hidden shadow-sm border", bot.border, bot.bg)}>
            <div className="flex items-center gap-2 px-3 py-2.5">
              <BotAvatar code={bot.code} size="sm" />
              <div>
                <p className={cn("text-xs font-bold", bot.text)}>{bot.name}</p>
                <p className="text-[9px] text-gray-500">{bot.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentChantiers() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-amber-500" /> Chantiers actifs — Direction
      </h3>
      {CHANTIERS.map((c, i) => {
        const pc = PHASE_COLORS[c.phase];
        return (
          <div key={c.name} className={cn("rounded-xl shadow-sm border", i === 0 ? "border-blue-300 ring-1 ring-blue-100" : c.borderColor)}>
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-t-xl", c.bgColor)}>
              <FolderOpen className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-bold text-gray-800 flex-1">{c.name}</span>
              <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", pc.badge)}>{c.projets} projets</span>
            </div>
            <div className="px-3 py-2.5 flex items-center gap-3">
              <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", pc.dot)} />
              <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", pc.badge)}>{pc.label}</span>
              <BotAvatar code={c.bot} size="sm" />
              <span className="text-[9px] text-gray-500">{BOT_COLORS[c.bot]?.name}</span>
              <div className="flex-1" />
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", pc.dot)} style={{ width: `${c.progress}%` }} />
              </div>
              <span className="text-[9px] text-gray-400">{c.progress}%</span>
              {i === 0 && <ChevronRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContentChantierDetail() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      {/* Header léger style CarlOS GPS (Carl vocal S76: "petit stroke avec couleur pâle, pas trop chargé") */}
      <div className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 flex items-center gap-2">
        <FolderOpen className="h-5 w-5 text-pink-600" />
        <div>
          <p className="text-sm font-bold text-gray-800">Chantier Marketing Q2</p>
          <p className="text-[9px] text-gray-500">3 projets — 8 missions — 65% complete</p>
        </div>
        <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Atelier</span>
      </div>

      <div className="flex gap-4">
        <div className="w-48 shrink-0 space-y-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Projets</p>
          {PROJETS_MARKETING.map((p, i) => {
            const pc = PHASE_COLORS[p.phase];
            return (
              <div key={p.name} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs",
                i === 1 ? cn(pc.bg, pc.border, "border font-medium") : "hover:bg-gray-50 text-gray-600"
              )}>
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", pc.dot)} />
                <span className="truncate">{p.name}</span>
              </div>
            );
          })}
        </div>
        <div className="flex-1 space-y-3">
          {PROJETS_MARKETING.map((p, i) => {
            const pc = PHASE_COLORS[p.phase];
            return (
              <div key={p.name} className={cn("rounded-xl border p-3", i === 1 ? "border-blue-300 bg-blue-50/30" : "border-gray-200")}>
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
    </div>
  );
}

function ContentProjetMissions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-amber-600" />
        <div>
          <p className="text-sm font-bold text-gray-800">Projet: Refonte site web</p>
          <p className="text-[9px] text-gray-500">Chantier Marketing Q2 — 4 missions — 45% complete</p>
        </div>
        <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Atelier</span>
      </div>

      <div className="flex gap-4">
        <div className="w-48 shrink-0 space-y-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Missions</p>
          {MISSIONS_REFONTE.map((m, i) => {
            const pc = PHASE_COLORS[m.phase];
            return (
              <div key={m.name} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs",
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
              <div key={m.name} className={cn("rounded-xl border p-3", i === 1 ? "border-blue-300 bg-blue-50/30" : "border-gray-200")}>
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContentMissionTaches() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2">
        <Crosshair className="h-5 w-5 text-amber-600" />
        <div>
          <p className="text-sm font-bold text-gray-800">Mission: Integration front-end</p>
          <p className="text-[9px] text-gray-500">Projet Refonte site web — 8 taches — 50% complete</p>
        </div>
        <BotAvatar code="CTOB" size="sm" />
        <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Atelier</span>
      </div>
      <div className="space-y-1.5">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Taches (8)</p>
        {[
          { name: "Composants header/footer", done: true },
          { name: "Pages principales (6)", done: true },
          { name: "Formulaires dynamiques", done: true },
          { name: "Integration API", progress: true },
          { name: "Animations + micro-interactions", progress: true },
          { name: "Responsive mobile", done: false },
          { name: "Tests cross-browser", done: false },
          { name: "Performance audit", done: false },
        ].map((t, j) => (
          <div key={j} className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2">
            {t.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> :
             t.progress ? <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 shrink-0" /> :
             <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />}
            <span className={cn("flex-1", t.done ? "text-gray-500 line-through" : "text-gray-700")}>{t.name}</span>
            {t.progress && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">En cours</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentPhaseChoice() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2">
        <Crosshair className="h-5 w-5 text-amber-600" />
        <div>
          <p className="text-sm font-bold text-gray-800">Integration front-end</p>
          <p className="text-[9px] text-gray-500">Que veux-tu faire avec cette mission?</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { phase: "reflexion" as Phase, label: "Analyser", desc: "Defricher les idees, brainstormer, diagnostiquer, chercher", icon: Search, enabled: true, highlight: true },
          { phase: "atelier" as Phase, label: "Creer", desc: "Cristalliser les idees, creer le plan d'action concret", icon: FileText, enabled: true, highlight: false },
          { phase: "command" as Phase, label: "Executer", desc: "Lancer les missions, deployer, suivre l'avancement", icon: Play, enabled: false, highlight: false },
        ].map(opt => {
          const pc = PHASE_COLORS[opt.phase];
          return (
            <div key={opt.phase} className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all",
              opt.enabled ? cn("cursor-pointer hover:shadow-sm", pc.bg, pc.border) : "bg-gray-50 border-gray-200 opacity-50",
              opt.highlight ? "ring-2 ring-red-300" : ""
            )}>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", opt.enabled ? pc.dot : "bg-gray-300")}>
                <opt.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-bold", opt.enabled ? pc.text : "text-gray-400")}>{opt.label}</p>
                <p className="text-[9px] text-gray-500">{opt.desc}</p>
              </div>
              {!opt.enabled && (
                <div className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-gray-300" />
                  <span className="text-[9px] text-gray-400">Finir l'Atelier</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContentReflexionWork({ stage, extractedInsights }: { stage: Stage; extractedInsights: string[] }) {
  const [expandedDiag, setExpandedDiag] = useState<string | null>(null);

  const DIAG_ITEMS = [
    { label: "Presence web", what: "Qualite et modernite du site", score: 45, detail: "Site vieillissant, pas mobile-first", action: "Lancer un audit UX", bot: "CMOB",
      expanded: { gap: "55% a combler", actions: ["Refonte mobile-first (priorite 1)", "Moderniser le design (UI/UX)", "Ajouter un chatbot de conversion"], impact: "Conversion +2.5% estimee", effort: "Moyen — 3-4 semaines" } },
    { label: "SEO technique", what: "Visibilite dans les moteurs de recherche", score: 80, detail: "Bonne base, 47 optimisations", action: "Voir les recommandations", bot: "CTOB",
      expanded: { gap: "20% a combler", actions: ["47 optimisations mineures identifiees", "Corriger les balises meta manquantes", "Ameliorer le sitemap XML"], impact: "Trafic organique +15%", effort: "Faible — 1 semaine" } },
    { label: "Conversion", what: "Taux de visiteurs qui deviennent clients", score: 32, detail: "Aucun CTA clair, pas de funnel", action: "Analyser le funnel", bot: "CMOB",
      expanded: { gap: "68% a combler — CRITIQUE", actions: ["Creer un funnel de conversion 5 etapes", "Ajouter des CTA clairs sur chaque page", "Deployer un chatbot AI (conversion 3-4%)", "A/B tester les landing pages"], impact: "Conversion 1.2% → 3-4%", effort: "Eleve — 4-6 semaines" } },
    { label: "Mobile", what: "Experience sur telephone et tablette", score: 65, detail: "Responsive basic, pas natif", action: "Test responsive", bot: "CTOB",
      expanded: { gap: "35% a combler", actions: ["Optimiser le responsive (breakpoints)", "Tester sur 5 appareils cibles", "PWA pour experience native"], impact: "Engagement mobile +40%", effort: "Moyen — 2-3 semaines" } },
    { label: "Vitesse", what: "Temps de chargement des pages", score: 38, detail: "Bundle 4.2MB, images non opt.", action: "Optimiser le bundle", bot: "CTOB",
      expanded: { gap: "62% a combler — CRITIQUE", actions: ["Reduire le bundle JS (code splitting)", "Optimiser les images (WebP, lazy load)", "CDN pour les assets statiques", "Cache navigateur agressif"], impact: "Temps chargement 4.8s → 1.5s", effort: "Moyen — 2 semaines" } },
    { label: "Accessibilite", what: "Conformite aux standards d'accessibilite", score: 55, detail: "WCAG AA partiel", action: "Audit WCAG", bot: "COOB",
      expanded: { gap: "45% a combler", actions: ["Audit WCAG 2.1 AA complet", "Corriger les contrastes de couleur", "Ajouter les attributs ARIA manquants"], impact: "Conformite legale + SEO bonus", effort: "Faible — 1-2 semaines" } },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      {/* Zone titre */}
      <div className="flex items-center gap-2 pb-2 border-b border-red-200">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-sm font-bold text-gray-800">Zone d'analyse — Integration front-end</h3>
        <span className="text-[9px] text-red-600 ml-auto font-medium">Mode Analyse actif</span>
      </div>

      {/* Boutons d'action dans le panel droit */}
      <div className="flex flex-wrap gap-1.5">
        {["Brainstorm", "Analyser", "Rechercher", "Challenger", "Deep Search", "5 Pourquoi"].map((b, i) => (
          <span key={b} className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors",
            i === 0 ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"
          )}>{b}</span>
        ))}
      </div>

      {/* CarlOS GPS */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
        <Compass className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" /> CarlOS GPS — Lacune detectee
          </p>
          <p className="text-[9px] text-amber-700 mt-1">Ton Blueprint manque l'analyse SWOT web et les personas utilisateurs. Je te recommande de completer ces sections.</p>
          <div className="flex gap-1.5 mt-2">
            <span className="text-[9px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-300">Completer le SWOT</span>
            <span className="text-[9px] bg-white text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200 cursor-pointer hover:bg-amber-50">Plus tard</span>
          </div>
        </div>
      </div>

      {/* Diagnostic integre — bots VISIBLES par defaut + CLIQUABLE pour developper (Carl vocal 20:09) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-red-600" />
          <p className="text-xs font-bold text-gray-800">Diagnostic integre — Pre-analyse systeme</p>
        </div>
        <p className="text-[9px] text-gray-500 leading-relaxed">Les bots analysent en temps reel l'etat de votre mission. Cliquez sur un indicateur pour voir le detail et les actions recommandees.</p>
        <div className="grid grid-cols-2 gap-2">
          {DIAG_ITEMS.map(d => (
            <div key={d.label}
              onClick={() => setExpandedDiag(expandedDiag === d.label ? null : d.label)}
              className={cn("bg-white border rounded-lg p-2 cursor-pointer transition-all",
                expandedDiag === d.label ? "border-red-300 bg-red-50/30 ring-1 ring-red-200" : "border-gray-200 hover:border-red-300 hover:bg-red-50/20"
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] text-gray-700 font-medium">{d.label}</span>
                <span className={cn("text-[9px] font-bold", d.score >= 70 ? "text-emerald-600" : d.score >= 50 ? "text-amber-600" : "text-red-600")}>{d.score}%</span>
              </div>
              <p className="text-[8px] text-gray-400 mb-1">{d.what}</p>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", d.score >= 70 ? "bg-emerald-500" : d.score >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${d.score}%` }} />
              </div>
              <p className="text-[8px] text-gray-500 mt-1 font-medium">{d.detail}</p>
              {/* Bot + action TOUJOURS visible (Carl: "ils devraient apparaître par défaut") */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <BotAvatar code={d.bot} size="sm" />
                <span className="text-[8px] text-gray-500">{BOT_COLORS[d.bot]?.name}</span>
                <button className="text-[8px] bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full font-medium hover:bg-red-100 cursor-pointer ml-auto">{d.action}</button>
              </div>

              {/* Expanded detail (Carl: "clicker dessus pour développer") */}
              {expandedDiag === d.label && (
                <div className="mt-2 pt-2 border-t border-red-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full",
                      d.score < 40 ? "bg-red-100 text-red-700" : d.score < 60 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    )}>{d.expanded.gap}</span>
                    <span className="text-[8px] text-gray-400">Effort: {d.expanded.effort}</span>
                  </div>
                  <div className="space-y-0.5">
                    {d.expanded.actions.map((a, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-[8px] text-gray-600">
                        <div className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[8px] text-emerald-700 font-medium">Impact: {d.expanded.impact}</span>
                  </div>
                  <div className="flex gap-1">
                    <button className="text-[7px] bg-red-600 text-white px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-red-700">Lancer un chantier</button>
                    <button className="text-[7px] bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Epingler</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Extracted insights */}
      {extractedInsights.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <Pin className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-bold text-gray-800">Insights extraits ({extractedInsights.length})</span>
          </div>
          <div className="space-y-1">
            {extractedInsights.map((insight, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] bg-blue-50 rounded px-2.5 py-1.5 border border-blue-200">
                <Pin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="text-blue-800">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentBrainstorm({ brainstormVotes, setBrainstormVotes }: { brainstormVotes: Record<number, "up" | "down" | null>; setBrainstormVotes: React.Dispatch<React.SetStateAction<Record<number, "up" | "down" | null>>> }) {
  const [activeStep, setActiveStep] = useState(2); // Start at SCAMPER step
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);

  const STEPS = [
    { label: "Cadrage", desc: "Definir le probleme et les contraintes avant de generer des idees." },
    { label: "Vague 1", desc: "Generation libre — chaque bot propose des idees sans filtre, quantite > qualite." },
    { label: "SCAMPER", desc: "Methode creative: Substituer, Combiner, Adapter, Modifier, Put to other use, Eliminer, Reorganiser." },
    { label: "Clusters", desc: "Regrouper les idees par theme, identifier les convergences entre bots." },
    { label: "Synthese", desc: "Fusionner les meilleures idees en propositions actionnables et budgetees." },
  ];

  const CLUSTERS = [
    { theme: "Acquisition digitale", idees: ["Content LinkedIn", "Chatbot AI site web", "Mini-serie YouTube"], bot: "CMOB", score: 87, color: "border-pink-200 bg-pink-50" },
    { theme: "Referral & reseau", idees: ["Programme referral", "Ambassadeurs clients", "Partenariat distributeurs"], bot: "CFOB", score: 92, color: "border-emerald-200 bg-emerald-50" },
    { theme: "Evenements repenses", idees: ["Demo AI live mensuelle", "Salon virtuel Q3", "Webinaires VITAA"], bot: "COOB", score: 78, color: "border-orange-200 bg-orange-50" },
  ];

  const SYNTHESIS = [
    { title: "Axe 1: Referral + Ambassadeurs", budget: "1,200$/mois", roi: "4.2x", timeline: "Semaine 1-2", priority: "QUICK WIN", color: "bg-emerald-50 border-emerald-200" },
    { title: "Axe 2: Content LinkedIn + YouTube", budget: "2,600$/mois", roi: "2.8x", timeline: "Mois 1-3", priority: "MOYEN TERME", color: "bg-pink-50 border-pink-200" },
    { title: "Axe 3: Demo AI live mensuelle", budget: "800$/mois", roi: "3.1x", timeline: "Mois 2", priority: "DIFFERENCIANT", color: "bg-violet-50 border-violet-200" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-bold text-gray-800">Brainstorm — Methode SCAMPER</h3>
        <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium animate-pulse ml-auto">Live</span>
      </div>

      {/* Pipeline etapes SCAMPER — CLIQUABLE (Carl: "il manque les 2 dernières étapes") */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <div className={cn("w-4 h-0.5", i <= activeStep ? "bg-red-400" : "bg-gray-200")} />}
            <button
              onClick={() => setActiveStep(i)}
              className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium cursor-pointer transition-all",
                i < activeStep ? "bg-red-100 text-red-700" : i === activeStep ? "bg-red-500 text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
            >
              {i < activeStep && <CheckCircle2 className="h-3.5 w-3.5" />}
              {i === activeStep && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {step.label}
            </button>
          </div>
        ))}
      </div>

      {/* Step description — texte explicatif (Carl: "mettre un peu de texte, section aide") */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <p className="text-[8px] text-gray-500">{STEPS[activeStep].desc}</p>
      </div>

      {/* === STEP 0-1: Cadrage + Vague 1 === */}
      {activeStep <= 1 && (
        <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> {activeStep === 0 ? "Cadrage — Probleme a resoudre" : "Vague 1 — 6 idees brutes (zero filtre)"}
          </p>
          {activeStep === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-800 mb-2">Probleme: Comment augmenter les leads qualifies de 40% en Q2?</p>
              <div className="space-y-1 text-[9px] text-gray-600">
                <p>Contrainte budget: max 8K$/mois</p>
                <p>Contrainte temps: resultats mesurables avant fin Q2</p>
                <p>Equipe: 3 bots mobilises (Mathilde, Frank, Tim)</p>
              </div>
              <button onClick={() => setActiveStep(1)} className="mt-3 text-[9px] bg-red-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-700">Lancer la generation d'idees</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {BRAINSTORM_IDEAS.map(idea => (
                <div key={idea.id}
                  onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                  className={cn("border rounded-lg px-3 py-2.5 cursor-pointer transition-all", idea.color,
                    expandedIdea === idea.id ? "ring-1 ring-red-300 shadow-sm" : "hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BotAvatar code={idea.bot} size="sm" />
                    <span className="text-[9px] font-medium text-gray-700">{BOT_COLORS[idea.bot]?.name}</span>
                    <span className="text-[8px] bg-white/60 text-gray-600 px-1.5 py-0.5 rounded ml-auto">{idea.tag}</span>
                  </div>
                  <p className="text-[9px] text-gray-800 mb-2">{idea.text}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setBrainstormVotes(prev => ({ ...prev, [idea.id]: prev[idea.id] === "up" ? null : "up" })); }}
                      className={cn("p-0.5 rounded cursor-pointer transition-colors",
                        brainstormVotes[idea.id] === "up" ? "text-green-600 bg-green-100" : "text-gray-400 hover:text-green-500"
                      )}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setBrainstormVotes(prev => ({ ...prev, [idea.id]: prev[idea.id] === "down" ? null : "down" })); }}
                      className={cn("p-0.5 rounded cursor-pointer transition-colors",
                        brainstormVotes[idea.id] === "down" ? "text-red-600 bg-red-100" : "text-gray-400 hover:text-red-500"
                      )}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] text-gray-400 ml-auto">
                      {brainstormVotes[idea.id] === "up" ? "+1" : brainstormVotes[idea.id] === "down" ? "-1" : ""}
                    </span>
                  </div>
                  {/* Expanded idea detail (Carl: "rien de cliquable, j'aimerais voir plus") */}
                  {expandedIdea === idea.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      <p className="text-[8px] text-gray-600">Impact estime: eleve | Effort: moyen | Delai: 2-4 semaines</p>
                      <div className="flex gap-1">
                        <button className="text-[7px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-50">Developper</button>
                        <button className="text-[7px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-50">Combiner</button>
                        <button className="text-[7px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-50">Challenger</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === STEP 2: SCAMPER Challenge === */}
      {activeStep === 2 && (
        <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-red-500" /> SCAMPER Challenge — COMBINER + ADAPTER + SUBSTITUER
          </p>
          <p className="text-[8px] text-gray-500 mb-2">Les bots appliquent les 7 leviers SCAMPER aux idees de la Vague 1 pour creer des combinaisons innovantes.</p>
          <div className="space-y-1.5">
            {[
              { letter: "C", method: "Combiner", text: "Referral + LinkedIn: programme ambassadeur avec contenu co-cree par les clients satisfaits", bot: "CMOB", votes: 4, color: "bg-pink-50 border-pink-200" },
              { letter: "A", method: "Adapter", text: "Adapter webinaire VITAA en mini-serie YouTube (5 episodes, 10min) — format snackable", bot: "CEOB", votes: 3, color: "bg-blue-50 border-blue-200" },
              { letter: "S", method: "Substituer", text: "Remplacer les salons physiques par une demo AI live mensuelle — cout 10x moins cher", bot: "CTOB", votes: 5, color: "bg-violet-50 border-violet-200" },
              { letter: "M", method: "Modifier", text: "Modifier le messaging: au lieu de 'AI CEO Bot', dire '40% plus de leads en 90 jours'", bot: "CMOB", votes: 6, color: "bg-amber-50 border-amber-200" },
              { letter: "E", method: "Eliminer", text: "Eliminer les salons sans ROI mesurable — economie de 4,800$/trimestre", bot: "CFOB", votes: 4, color: "bg-emerald-50 border-emerald-200" },
            ].map((note, i) => (
              <div key={i} className={cn("rounded-lg p-2.5 border cursor-pointer hover:shadow-sm transition-all", note.color)}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">{note.letter}</span>
                  <span className="text-[8px] font-bold text-red-700">{note.method}</span>
                  <BotAvatar code={note.bot} size="sm" />
                  <span className="text-[8px] font-medium text-gray-500">{BOT_COLORS[note.bot]?.name}</span>
                  <span className="flex items-center gap-0.5 text-[9px] text-amber-600 ml-auto">
                    <Star className="h-3.5 w-3.5" /> {note.votes}
                  </span>
                </div>
                <p className="text-[9px] text-gray-800">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 3: Clusters === */}
      {activeStep === 3 && (
        <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-blue-500" /> Clusters — 3 themes identifies
          </p>
          <p className="text-[8px] text-gray-500 mb-2">Les idees convergent autour de 3 axes strategiques. Chaque cluster regroupe les propositions complementaires.</p>
          <div className="space-y-2">
            {CLUSTERS.map((cluster, i) => (
              <div key={i} className={cn("rounded-xl p-3 border", cluster.color)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-700">{i + 1}</span>
                  <span className="text-xs font-bold text-gray-800">{cluster.theme}</span>
                  <BotAvatar code={cluster.bot} size="sm" />
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${cluster.score}%` }} />
                    </div>
                    <span className="text-[8px] font-bold text-gray-600">{cluster.score}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cluster.idees.map((idee, j) => (
                    <span key={j} className="text-[8px] bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{idee}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 4: Synthese === */}
      {activeStep === 4 && (
        <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Synthese — 3 axes actionnables
          </p>
          <p className="text-[8px] text-gray-500 mb-2">Les clusters sont consolides en axes strategiques budgetes et planifies. Pret a passer en phase Creer.</p>
          <div className="space-y-2">
            {SYNTHESIS.map((axe, i) => (
              <div key={i} className={cn("rounded-xl border p-3", axe.color)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-800">{axe.title}</span>
                  <span className="text-[7px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold ml-auto">{axe.priority}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[8px] text-gray-400">Budget</p>
                    <p className="text-[9px] font-bold text-gray-800">{axe.budget}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-gray-400">ROI</p>
                    <p className="text-[9px] font-bold text-emerald-700">{axe.roi}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-gray-400">Timeline</p>
                    <p className="text-[9px] font-bold text-gray-800">{axe.timeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 mt-2">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-[9px] font-bold text-emerald-700">Budget total: 4,600$/mois — ROI combine: 3.4x</span>
          </div>
        </div>
      )}

      {/* Action buttons — toujours visibles */}
      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-red-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-700">Ajouter une idee</button>
        <button className="text-[9px] bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-100">Combiner 2 idees</button>
        <button className="text-[9px] bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-100">Prioriser par votes</button>
        <button className="text-[9px] bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-100">Challenger une idee</button>
        <button className="text-[9px] bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-100">Epingler au rapport</button>
      </div>
    </div>
  );
}

function ContentSyntheseBrainstorm() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-red-600" />
        <h3 className="text-sm font-bold text-gray-800">Synthese + Bonification — Idees consolidees</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">Iteration 1</span>
      </div>
      <p className="text-[9px] text-gray-500">Les idees du brainstorm ont ete combinees avec les perspectives des 3 bots pour creer un plan integre.</p>

      {/* Plan integre */}
      <div className="bg-white border-2 border-red-200 rounded-xl overflow-hidden">
        <div className="bg-red-50 px-4 py-2 border-b border-red-200 flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-red-600" />
          <span className="text-xs font-bold text-red-800">Plan integre — Referral + Content LinkedIn</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { title: "Programme Referral", source: "Frank (CFO)", detail: "1,200$/mois, ROI 4.2x, lancement Q2 semaine 1", color: "border-emerald-300 bg-emerald-50" },
            { title: "Content LinkedIn Educatif", source: "Mathilde (CMO)", detail: "Serie 12 posts, 1 webinaire/mois, budget 2,600$/mois", color: "border-pink-300 bg-pink-50" },
            { title: "Chatbot AI site web", source: "Tim (CTO)", detail: "Deploiement semaine 3, conversion cible 3-4%", color: "border-violet-300 bg-violet-50" },
          ].map((item, i) => (
            <div key={i} className={cn("border rounded-lg p-3", item.color)}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-800">{item.title}</span>
                <span className="text-[8px] bg-white/70 text-gray-600 px-1.5 py-0.5 rounded ml-auto">{item.source}</span>
              </div>
              <p className="text-[9px] text-gray-700">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparaison avant/apres */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-[9px] text-gray-400 mb-1">AVANT bonification</p>
          <p className="text-lg font-extrabold text-gray-400">6 idees</p>
          <p className="text-[8px] text-gray-400">separees, non priorisees</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-[9px] text-red-600 mb-1">APRES bonification</p>
          <p className="text-lg font-extrabold text-red-700">3 axes</p>
          <p className="text-[8px] text-red-600">integres, budgetes, planifies</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-red-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-700">Rechallenger le plan</button>
        <button className="text-[9px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Re-synthetiser</button>
        <button className="text-[9px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Ajouter un axe</button>
        <button className="text-[9px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Affiner les budgets</button>
      </div>
    </div>
  );
}

function ContentSyntheseRecherche() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Synthese des recherches — Consolidation</h3>
        <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-auto">Tous les resultats</span>
      </div>
      <p className="text-[9px] text-gray-500">Consolidation du Deep Search, des 5 Pourquoi et du brainstorm bonifie en 3 constats actionnables.</p>

      {/* 3 constats */}
      <div className="space-y-2">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Constats valides (3)
        </p>
        {[
          { id: 1, text: "Le marche est pret (MESI + CEFRIO confirment): 72% des PME sous-investissent en marketing digital", score: 94 },
          { id: 2, text: "Le messaging technique = cause racine du faible taux de conversion (1.2%)", score: 91 },
          { id: 3, text: "Le programme referral est le quick win le plus rentable (ROI 4.2x confirme par benchmark)", score: 87 },
        ].map(c => (
          <div key={c.id} className="bg-white border border-emerald-200 rounded-lg p-3 flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold">{c.id}</span>
            <p className="text-[9px] text-gray-700 flex-1">{c.text}</p>
            <span className="text-[9px] font-bold text-emerald-600 shrink-0">{c.score}%</span>
          </div>
        ))}
      </div>

      {/* Hypotheses */}
      <div className="space-y-2">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <Search className="h-3.5 w-3.5 text-amber-500" /> Hypotheses a verifier (2)
        </p>
        {[
          { text: "Le chatbot AI peut reellement tripler la conversion (besoin A/B test)", action: "Lancer un test" },
          { text: "Le contenu LinkedIn educatif va generer des leads qualifies (3 mois minimum)", action: "Definir les KPIs" },
        ].map((h, i) => (
          <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <p className="text-[9px] text-gray-700 flex-1">{h.text}</p>
            <button className="text-[8px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-300 shrink-0">{h.action}</button>
          </div>
        ))}
      </div>

      {/* Risque */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        <div className="flex-1">
          <p className="text-[9px] font-bold text-red-800">Risque identifie</p>
          <p className="text-[9px] text-red-700">Timeline Q2 agressive pour tout deployer — Tim recommande Q2+Q3</p>
        </div>
        <button className="text-[8px] bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-red-300 shrink-0">Mitiger</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-700">Challenger ces conclusions</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Relancer le Deep Search</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Combiner avec d'autres donnees</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Exporter la synthese</button>
      </div>
    </div>
  );
}

function ContentCinqPourquoi() {
  const [revealedLevel, setRevealedLevel] = useState(0);
  const [showDebate, setShowDebate] = useState<number | null>(null);

  const questions = [
    {
      q: "les leads ne convertissent pas",
      a: "Le message ne resonne pas avec les PME.",
      reflexion: "Est-ce que le probleme est le canal ou le message? Mathilde a valide: c'est le message.",
      bot: "CMOB",
      debate: {
        challenger: "CFOB",
        challengeText: "Et si c'etait le prix plutot que le message? Nos tarifs sont 20% au-dessus du marche.",
        defense: "CMOB",
        defenseText: "Non — les clients qui signent ne mentionnent jamais le prix. C'est le messaging: ils ne comprennent pas la valeur avant la demo.",
        verdict: "Mathilde a raison. Le prix n'est pas le bloqueur — c'est la comprehension de la valeur.",
      },
    },
    {
      q: "le message ne resonne pas",
      a: "On parle de features AI, pas de resultats business.",
      reflexion: "Frank confirme: les clients actuels mentionnent toujours le ROI comme facteur #1 de decision.",
      bot: "CFOB",
      debate: {
        challenger: "CTOB",
        challengeText: "Les features sont quand meme importantes — c'est ce qui nous differencie techniquement.",
        defense: "CFOB",
        defenseText: "Tim, les PME n'achetent pas de la tech. Elles achetent du temps gagne et de l'argent economise. Le ROI, pas les specs.",
        verdict: "Consensus: communiquer en resultats business, pas en features techniques.",
      },
    },
    {
      q: "parle-t-on de features",
      a: "Le contenu est ecrit par des devs, pas par le marketing.",
      reflexion: "Tim admet: l'equipe tech produit du contenu sans brief marketing. Aucun processus editorial.",
      bot: "CTOB",
      debate: {
        challenger: "CMOB",
        challengeText: "On pourrait former les devs a ecrire differemment plutot que tout centraliser au marketing.",
        defense: "CTOB",
        defenseText: "Realiste? Non. Les devs ecrivent du code, pas du copywriting. Il faut un processus: dev fournit les facts, marketing ecrit le message.",
        verdict: "Processus editorial necessaire: separation faits techniques / messaging client.",
      },
    },
    {
      q: "les devs ecrivent le contenu",
      a: "Pas de ressource marketing dediee, l'equipe est trop petite.",
      reflexion: "CarlOS note: le budget marketing existe (12K$/mois) mais est mal alloue — 65% en salons.",
      bot: "CEOB",
      debate: {
        challenger: "CFOB",
        challengeText: "Les salons generent quand meme 35% de nos leads actuels. On ne peut pas tout couper.",
        defense: "CEOB",
        defenseText: "Pas tout couper — reallouer. 65% en salons = 7,800$/mois pour 35% des leads. Si on met la moitie en digital, on double potentiellement pour moins cher.",
        verdict: "Reallocation progressive: garder les 2 meilleurs salons, basculer le reste en digital.",
      },
    },
  ];

  // Auto-reveal levels progressively
  useEffect(() => {
    if (revealedLevel < questions.length + 1) {
      const timer = setTimeout(() => setRevealedLevel(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [revealedLevel, questions.length]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-red-500" />
        <h3 className="text-sm font-bold text-gray-800">Analyse 5 Pourquoi — Cause racine</h3>
        <span className="text-[9px] text-gray-400 ml-auto">Methode Ishikawa + Bonification</span>
      </div>

      {/* Progress indicator — levels revealed */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className="flex items-center gap-1">
            {n > 1 && <div className={cn("w-6 h-0.5 transition-all duration-500", n <= revealedLevel ? "bg-red-400" : "bg-gray-200")} />}
            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all duration-500",
              n <= revealedLevel ? (n === 5 ? "bg-red-500 text-white scale-110" : "bg-red-100 text-red-700") : "bg-gray-100 text-gray-300"
            )}>
              {n <= revealedLevel && n < 5 ? <CheckCircle2 className="h-3.5 w-3.5 text-red-500" /> : n}
            </div>
          </div>
        ))}
        <span className="text-[8px] text-gray-400 ml-2">{Math.min(revealedLevel, 5)}/5 niveaux explores</span>
      </div>

      <div className="bg-white border rounded-xl px-4 py-3 space-y-1">
        {questions.map((item, i) => (
          <div key={i} className={cn("transition-all duration-700", i < revealedLevel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0 overflow-hidden")}>
            {/* Question + Answer */}
            <div className="flex items-start gap-3 py-1.5">
              <span className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all",
                i < revealedLevel - 1 ? "bg-red-100 text-red-700" : "bg-red-500 text-white animate-pulse"
              )}>{i + 1}</span>
              <div className="flex-1">
                <p className="text-xs"><span className="font-semibold text-red-700">Pourquoi</span> {item.q}?</p>
                <p className="text-[9px] text-gray-600 mt-0.5">→ {item.a}</p>
              </div>
              {i < questions.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-1" />}
            </div>

            {/* Intermediate reflexion with debate toggle */}
            <div className="ml-9 mt-0.5 mb-2">
              <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border-l-2 border-gray-300">
                <BotAvatar code={item.bot} size="sm" />
                <div className="flex-1">
                  <p className="text-[8px] text-gray-500 italic">{item.reflexion}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setShowDebate(showDebate === i ? null : i)}
                    className={cn("text-[7px] px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors",
                      showDebate === i ? "bg-red-100 border border-red-200 text-red-700" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    {showDebate === i ? "Fermer" : "Voir le debat"}
                  </button>
                  <button className="text-[7px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-100">Creuser</button>
                  <button className="text-[7px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-gray-100">Pivoter</button>
                </div>
              </div>

              {/* Debate animation (Carl: "plus d'animation, montrer le débat") */}
              {showDebate === i && (
                <div className="mt-1.5 ml-2 space-y-1.5 border-l-2 border-red-200 pl-3 animate-in fade-in duration-300">
                  {/* Challenger */}
                  <div className="flex items-start gap-2">
                    <BotAvatar code={item.debate.challenger} size="sm" />
                    <div className="bg-amber-50 border border-amber-200 rounded-lg rounded-tl-none px-2.5 py-1.5 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[8px] font-bold text-amber-700">{BOT_COLORS[item.debate.challenger]?.name}</span>
                        <span className="text-[7px] bg-amber-200 text-amber-800 px-1 py-0.5 rounded">Challenge</span>
                      </div>
                      <p className="text-[8px] text-gray-700">{item.debate.challengeText}</p>
                    </div>
                  </div>
                  {/* Defense */}
                  <div className="flex items-start gap-2">
                    <BotAvatar code={item.debate.defense} size="sm" />
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg rounded-tl-none px-2.5 py-1.5 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[8px] font-bold text-emerald-700">{BOT_COLORS[item.debate.defense]?.name}</span>
                        <span className="text-[7px] bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded">Defense</span>
                      </div>
                      <p className="text-[8px] text-gray-700">{item.debate.defenseText}</p>
                    </div>
                  </div>
                  {/* Verdict */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <p className="text-[8px] text-blue-700 font-medium">{item.debate.verdict}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Cause racine — revealed last */}
        <div className={cn("pt-2 border-t border-red-200 transition-all duration-700",
          revealedLevel >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">5</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-red-800">CAUSE RACINE</p>
              <p className="text-[9px] text-red-700 mt-0.5">L'absence de strategie de contenu structuree fait que le messaging reste technique au lieu d'etre oriente resultats business.</p>
            </div>
          </div>
          {/* Bonification finale */}
          <div className="ml-9 mt-2 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            <p className="text-[9px] font-bold text-red-700 mb-1">Bonification — Synthese des 4 debats:</p>
            <div className="space-y-1">
              {questions.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[8px] text-red-600">
                  <span className="w-3 h-3 rounded-full bg-red-200 flex items-center justify-center text-[7px] font-bold text-red-700 shrink-0">{i + 1}</span>
                  <span>{item.debate.verdict}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <button className="text-[8px] bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-red-300">Epingler cette synthese</button>
              <button className="text-[8px] bg-white text-red-700 px-2 py-0.5 rounded-full font-medium border border-red-200 cursor-pointer hover:bg-red-50">Relancer un 5 Pourquoi</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-red-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-700">Creuser cette cause</button>
        <button className="text-[9px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Pivoter l'analyse</button>
        <button className="text-[9px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Synthese des causes</button>
        <button className="text-[9px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Challenger la conclusion</button>
        <button className="text-[9px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-red-50">Combiner avec le brainstorm</button>
      </div>
    </div>
  );
}

function ContentDeepSearch() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Deep Search — 4 sources validees</h3>
        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto">Recherche terminee</span>
      </div>
      <p className="text-[9px] text-gray-500">Sources externes trouvees pour valider les hypotheses du diagnostic. Chaque source a un score de pertinence.</p>
      <div className="space-y-2">
        {DEEP_SEARCH_SOURCES.map((src, i) => {
          const Icon = src.icon;
          return (
            <div key={i} className="bg-white border border-blue-200 rounded-xl p-3 flex items-start gap-3 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">{src.title}</p>
                <p className="text-[9px] text-gray-600 mt-0.5">{src.detail}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-blue-600">{src.score}%</span>
                </div>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-700">Approfondir une source</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Relancer la recherche</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Combiner les sources</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Synthese des donnees</button>
        <button className="text-[9px] bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-blue-50">Extraire les chiffres cles</button>
      </div>
    </div>
  );
}

function ContentChallenge() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Challenge / Defense</h3>
      </div>
      <div className="bg-white border-2 border-amber-300 rounded-xl overflow-hidden">
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">Challenge: Budget trop agressif (8K$/mois)</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <BotAvatar code="CFOB" size="sm" />
            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-xs text-gray-700">Defense par <span className="font-bold text-emerald-700">Frank (CFO)</span>:</p>
              <p className="text-[9px] text-gray-600 mt-1">Le programme referral seul coute 1,200$/mois avec un ROI de 4.2x. Plan revise a 3,800$/mois pour un ROI de 3.6x. Conservateur et validable en Q2.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-white border border-gray-200 rounded-lg p-2">
              <p className="text-lg font-extrabold text-emerald-600">3.6x</p>
              <p className="text-[9px] text-gray-500">ROI projete</p>
            </div>
            <div className="text-center bg-white border border-gray-200 rounded-lg p-2">
              <p className="text-lg font-extrabold text-blue-600">3,800$</p>
              <p className="text-[9px] text-gray-500">/mois revise</p>
            </div>
            <div className="text-center bg-white border border-gray-200 rounded-lg p-2">
              <p className="text-lg font-extrabold text-amber-600">-53%</p>
              <p className="text-[9px] text-gray-500">vs plan initial</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-emerald-700">Accepter le plan revise</button>
        <button className="text-[9px] bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-amber-50">Re-challenger</button>
        <button className="text-[9px] bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-gray-50">Demander un 2e avis</button>
        <button className="text-[9px] bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-gray-50">Synthese des arguments</button>
      </div>
    </div>
  );
}

function ContentPreRapport({ sectionsFilled, extractedInsights }: { sectionsFilled: number[]; extractedInsights: string[] }) {
  // State for interactive action buttons (Carl: "j'aimerais voir qu'est-ce que ça a l'air quand on approfondit/reformule")
  const [activeAction, setActiveAction] = useState<{ sectionId: number; action: string } | null>(null);
  const [pinnedSection, setPinnedSection] = useState<number | null>(null);

  // Mock data for action results
  const APPROFONDIR_RESULTS: Record<number, { bot: string; expanded: string; data: string[] }> = {
    2: {
      bot: "CEOB",
      expanded: "Analyse approfondie des 3 tensions: Le cout d'acquisition de 780$/lead est 2.3x le benchmark SaaS B2B (340$). La conversion de 1.2% est critique — la moyenne secteur est 2.8%. La dependance au bouche-a-oreille (65%) rend le pipeline fragile et imprevisible.",
      data: ["CAC: 780$ vs 340$ benchmark (-56% a atteindre)", "Conversion: 1.2% vs 2.8% secteur (+133% requis)", "Pipeline: 65% referral = risque concentration"],
    },
    3: {
      bot: "CMOB",
      expanded: "Chaque perspective apporte un axe complementaire. Mathilde cible le messaging (ROI > tech), Frank optimise l'allocation budget, Tim identifie les leviers techniques. Les 3 convergent sur un point: le contenu doit parler resultats, pas features.",
      data: ["Messaging: 0 mention ROI sur le site actuel", "Budget: 7,800$/mois en salons (65%), 0$/mois en digital", "Tech: chatbot AI = conversion 3-4% (vs 1.2% actuel)"],
    },
  };

  const REFORMULER_RESULTS: Record<number, { before: string; after: string; bot: string }> = {
    2: {
      before: "3 tensions identifiees: cout acquisition eleve (780$/lead), faible conversion site web (1.2%), pipeline trop dependant du bouche-a-oreille (65%).",
      after: "Le pipeline marketing presente 3 failles structurelles: un cout d'acquisition 2.3x au-dessus du benchmark (780$ vs 340$), un tunnel de conversion defaillant (1.2% vs 2.8% secteur), et une dependance critique au bouche-a-oreille (65%) qui fragilise la previsibilite.",
      bot: "CEOB",
    },
    5: {
      before: "Cause racine: le messaging actuel parle de technologie, pas de resultats business. Les PME ne se reconnaissent pas.",
      after: "La cause fondamentale est un desalignement entre le discours (features technologiques) et ce que les decideurs PME recherchent (ROI mesurable, temps gagne, risques reduits). Ce gap messaging → attentes client explique 80% de la perte de leads qualifies.",
      bot: "CMOB",
    },
  };

  const handleAction = (sectionId: number, action: string) => {
    if (activeAction?.sectionId === sectionId && activeAction?.action === action) {
      setActiveAction(null);
    } else {
      setActiveAction({ sectionId, action });
    }
  };

  const handlePin = (sectionId: number) => {
    setPinnedSection(sectionId);
    setTimeout(() => setPinnedSection(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-red-600" />
        <h3 className="text-sm font-bold text-gray-800">Pre-rapport — Analyse Marketing Q2</h3>
        <span className="text-[9px] text-gray-500 ml-auto">{sectionsFilled.length} / {REPORT_SECTIONS.length} sections</span>
      </div>

      {/* Insight flow banner — visual link insight → pre-rapport (Carl: "c'est quoi le lien avec les insight puis ça ici?") */}
      {extractedInsights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Pin className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[9px] font-bold text-blue-800">Insights epingles → integres dans le document</span>
            <span className="text-[8px] bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full ml-auto">{extractedInsights.length} insight{extractedInsights.length > 1 ? "s" : ""}</span>
          </div>
          {/* Concrete insertion map (Carl: "où est-ce qu'on les insère-tu dedans?") */}
          <div className="space-y-1">
            {extractedInsights.map((ins, i) => {
              const targetSection = i < 3 ? i + 2 : 6;
              const sectionTitle = REPORT_SECTIONS.find(s => s.id === targetSection)?.title || "";
              return (
                <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-1.5">
                  <Pin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-[8px] text-blue-700 flex-1 truncate">{ins}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <div className="flex items-center gap-1 shrink-0 bg-blue-100 rounded px-1.5 py-0.5">
                    <span className="text-[7px] font-bold text-blue-800">§{targetSection}</span>
                    <span className="text-[7px] text-blue-600 truncate max-w-20">{sectionTitle}</span>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* TOC sidebar */}
        <div className="w-44 shrink-0 space-y-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Table des matieres</p>
          {REPORT_SECTIONS.map(s => {
            const filled = sectionsFilled.includes(s.id);
            const isActive = activeAction?.sectionId === s.id;
            return (
              <div key={s.id} className={cn("flex items-center gap-1.5 text-[9px] px-2 py-1 rounded cursor-pointer transition-all",
                isActive ? "bg-red-100 text-red-700 font-medium ring-1 ring-red-300" :
                filled ? "bg-green-50 text-green-700 font-medium" : "text-gray-400 hover:bg-gray-50",
                pinnedSection === s.id ? "animate-pulse ring-2 ring-blue-400" : ""
              )}>
                {filled ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />}
                <span className="truncate">{s.id}. {s.title}</span>
              </div>
            );
          })}
          <div className="mt-3 text-[9px] text-gray-500 px-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(sectionsFilled.length / REPORT_SECTIONS.length) * 100}%` }} />
            </div>
            <span className="mt-1 block">{Math.round((sectionsFilled.length / REPORT_SECTIONS.length) * 100)}% complet</span>
          </div>

          {/* Document-level actions */}
          <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Actions</p>
            {[
              { label: "Re-synthetiser tout", icon: RefreshCw },
              { label: "Reorganiser les sections", icon: Layers },
              { label: "Fusionner 2 sections", icon: Zap },
              { label: "Ajouter une section", icon: Lightbulb },
            ].map(a => (
              <button key={a.label} className="w-full flex items-center gap-1.5 text-[8px] text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded cursor-pointer transition-colors text-left">
                <a.icon className="h-3.5 w-3.5 shrink-0" /> {a.label}
              </button>
            ))}
          </div>

          {extractedInsights.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Insights ({extractedInsights.length})</p>
              {extractedInsights.map((ins, i) => (
                <div key={i} className="text-[8px] text-blue-600 py-0.5 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5 shrink-0" /> {ins}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 space-y-3">
          {REPORT_SECTIONS.filter(s => sectionsFilled.includes(s.id)).map(s => (
            <div key={s.id} className={cn("border-l-[3px] rounded-r-lg px-3 py-2.5 group transition-all",
              activeAction?.sectionId === s.id ? "border-red-500 bg-red-50 ring-1 ring-red-200" : "border-red-400 bg-red-50/50",
              pinnedSection === s.id ? "ring-2 ring-blue-400 animate-pulse" : ""
            )}>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[9px] font-bold text-red-700">{s.id}. {s.title}</h4>
                <span className="text-[7px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">
                  {s.id <= 2 ? "CarlOS" : s.id === 3 ? "Multi-bot" : s.id === 4 ? "Brainstorm" : s.id === 5 ? "5 Pourquoi" : s.id === 6 ? "Deep Search" : s.id === 7 ? "Frank" : "CarlOS"}
                </span>
              </div>
              <p className="text-[9px] text-gray-700 leading-relaxed">{s.content}</p>

              {/* Action buttons (Carl: "brasser des choses ici") */}
              <div className="flex flex-wrap gap-1.5 mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handlePin(s.id)}
                  className={cn("text-[8px] font-medium cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                    pinnedSection === s.id ? "text-blue-700 bg-blue-100 border border-blue-300" : "text-red-600 hover:text-red-700 bg-white border border-red-200 hover:bg-red-50"
                  )}>
                  <Pin className="h-3.5 w-3.5" /> {pinnedSection === s.id ? "Epingle!" : "Epingler"}
                </button>
                <button onClick={() => handleAction(s.id, "approfondir")}
                  className={cn("text-[8px] font-medium cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                    activeAction?.sectionId === s.id && activeAction?.action === "approfondir" ? "text-violet-700 bg-violet-100 border border-violet-300" : "text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                  )}>
                  <BookOpen className="h-3.5 w-3.5" /> Approfondir
                </button>
                <button onClick={() => handleAction(s.id, "reformuler")}
                  className={cn("text-[8px] font-medium cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors",
                    activeAction?.sectionId === s.id && activeAction?.action === "reformuler" ? "text-amber-700 bg-amber-100 border border-amber-300" : "text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                  )}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reformuler
                </button>
                <button className="text-[8px] text-gray-500 hover:text-gray-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-50">
                  <AlertTriangle className="h-3.5 w-3.5" /> Challenger
                </button>
                <button className="text-[8px] text-gray-500 hover:text-gray-700 font-medium cursor-pointer flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-50">
                  <Layers className="h-3.5 w-3.5" /> Fusionner
                </button>
              </div>

              {/* APPROFONDIR result (Carl: "j'aimerais ça que tu me montres qu'est-ce que ça a l'air") */}
              {activeAction?.sectionId === s.id && activeAction?.action === "approfondir" && (
                <div className="mt-3 border-t border-red-200 pt-3 space-y-2">
                  {APPROFONDIR_RESULTS[s.id] ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <BotAvatar code={APPROFONDIR_RESULTS[s.id].bot} size="sm" />
                        <span className="text-[8px] font-bold text-violet-700">Analyse approfondie par {BOT_COLORS[APPROFONDIR_RESULTS[s.id].bot]?.name}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse ml-auto" />
                      </div>
                      <p className="text-[9px] text-gray-700 leading-relaxed bg-violet-50 rounded-lg px-3 py-2 border border-violet-200">
                        {APPROFONDIR_RESULTS[s.id].expanded}
                      </p>
                      <div className="space-y-1">
                        {APPROFONDIR_RESULTS[s.id].data.map((d, j) => (
                          <div key={j} className="flex items-center gap-2 text-[8px] text-violet-700 bg-white rounded px-2.5 py-1 border border-violet-100">
                            <BarChart3 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <button className="text-[8px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-violet-700">Integrer au rapport</button>
                        <button className="text-[8px] bg-white text-violet-700 px-2 py-0.5 rounded-full font-medium border border-violet-200 cursor-pointer hover:bg-violet-50">Encore plus profond</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2 border border-violet-200">
                      <BotAvatar code="CEOB" size="sm" />
                      <div className="flex-1">
                        <p className="text-[8px] text-violet-700 font-medium">CarlOS analyse cette section en profondeur...</p>
                        <div className="flex gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REFORMULER result (Carl: "si on décide de reformuler... qu'est-ce que ça a l'air") */}
              {activeAction?.sectionId === s.id && activeAction?.action === "reformuler" && (
                <div className="mt-3 border-t border-red-200 pt-3 space-y-2">
                  {REFORMULER_RESULTS[s.id] ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <BotAvatar code={REFORMULER_RESULTS[s.id].bot} size="sm" />
                        <span className="text-[8px] font-bold text-amber-700">Reformulation par {BOT_COLORS[REFORMULER_RESULTS[s.id].bot]?.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                          <p className="text-[7px] text-gray-400 font-bold uppercase mb-1">Avant</p>
                          <p className="text-[8px] text-gray-500 line-through leading-relaxed">{REFORMULER_RESULTS[s.id].before}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                          <p className="text-[7px] text-amber-600 font-bold uppercase mb-1">Apres</p>
                          <p className="text-[8px] text-amber-800 leading-relaxed">{REFORMULER_RESULTS[s.id].after}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="text-[8px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-700">Appliquer la reformulation</button>
                        <button className="text-[8px] bg-white text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200 cursor-pointer hover:bg-amber-50">Autre version</button>
                        <button onClick={() => setActiveAction(null)} className="text-[8px] bg-white text-gray-500 px-2 py-0.5 rounded-full font-medium border border-gray-200 cursor-pointer hover:bg-gray-50">Garder l'original</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                      <BotAvatar code="CEOB" size="sm" />
                      <div className="flex-1">
                        <p className="text-[8px] text-amber-700 font-medium">CarlOS reformule cette section...</p>
                        <div className="flex gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
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

function ContentTransition() {
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-xl px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <ArrowRight className="h-5 w-5 text-amber-600" />
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
            <Target className="h-5 w-5 text-white" />
          </div>
        </div>
        <p className="text-sm font-bold text-amber-800">Pret pour Creer</p>
        <p className="text-xs text-amber-600 mt-1">8 sections d'analyse sauvegardees — Phase Analyse completee</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button className="text-xs bg-amber-600 text-white px-4 py-2 rounded-full font-bold cursor-pointer hover:bg-amber-700">Passer en mode Creer</button>
          <button className="text-xs bg-white text-amber-700 px-4 py-2 rounded-full font-bold border border-amber-300 cursor-pointer hover:bg-amber-50">Cristalliser d'abord</button>
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

function AutoAdvance({ onComplete, delay }: { onComplete: () => void; delay: number }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, delay);
    return () => clearTimeout(timer);
  }, [onComplete, delay]);
  return null;
}
