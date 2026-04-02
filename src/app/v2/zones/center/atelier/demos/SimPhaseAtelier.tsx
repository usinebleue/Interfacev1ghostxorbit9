"use client";

/**
 * SimPhaseAtelier.tsx — Phase Creation (ambre pastel) — SIMULATION COMPLETE V2
 * 6 livrables: Document (avec enrichissement images/videos/tables), Budget, Presentation,
 * Template Lego, Tableur, Code avec Tim (terminal LIVE character-by-character)
 * Meme cadre que SimPhaseReflexion: TopBar 6 sections, sub-tabs, breadcrumb, phase indicator
 * 23 stages, continuité Marketing Q2, VITAA scan
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
  CheckCircle2,
  FileText,
  Target,
  Lock,
  Mic,
  Send,
  ArrowRight,
  Zap,
  Play,
  DollarSign,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Layers,
  Code2,
  Bug,
  FlaskConical,
  Terminal,
  Hammer,
  Sparkles,
  Grid3X3,
  Table2,
  Presentation,
  Pin,
  Download,
  Eye,
  Wrench,
  Clock,
  Image,
  Video,
  PenLine,
  GripVertical,
  Upload,
  Plus,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { TypewriterText, BotAvatar } from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

type Stage =
  | "entree"
  | "accueil"
  | "type-selection"
  | "doc-toc"
  | "doc-contexte"
  | "doc-objectifs"
  | "doc-swot"
  | "doc-plan"
  | "doc-enrich"
  | "budget-creation"
  | "presentation-creation"
  | "template-creation"
  | "tableur-creation"
  | "code-intro"
  | "code-live"
  | "code-debug"
  | "code-test"
  | "cristallisation"
  | "cruncher"
  | "revue"
  | "challenge-final"
  | "scan-vitaa"
  | "resultat-scan"
  | "transition";

const STAGE_ORDER: Stage[] = [
  "entree", "accueil", "type-selection",
  "doc-toc", "doc-contexte", "doc-objectifs", "doc-swot", "doc-plan", "doc-enrich",
  "budget-creation", "presentation-creation", "template-creation", "tableur-creation",
  "code-intro", "code-live", "code-debug", "code-test",
  "cristallisation", "cruncher", "revue", "challenge-final",
  "scan-vitaa", "resultat-scan", "transition",
];

const STAGE_LABELS: Record<Stage, string> = {
  entree: "Entree",
  accueil: "Accueil Creation",
  "type-selection": "Types de creation",
  "doc-toc": "Document — Table des matieres",
  "doc-contexte": "1. Contexte",
  "doc-objectifs": "2. Objectifs SMART",
  "doc-swot": "3. SWOT",
  "doc-plan": "4. Plan d'action",
  "doc-enrich": "Enrichissement document",
  "budget-creation": "Budget & Finances",
  "presentation-creation": "Presentation",
  "template-creation": "Template Lego",
  "tableur-creation": "Tableur & Donnees",
  "code-intro": "Tim Code — Intro",
  "code-live": "Tim Code — Codage live",
  "code-debug": "Tim Code — Debug",
  "code-test": "Tim Code — Tests",
  cristallisation: "Cristallisation",
  cruncher: "Cruncher financier",
  revue: "Revue collaborative",
  "challenge-final": "Challenge final",
  "scan-vitaa": "Scan VITAA",
  "resultat-scan": "Resultat scan",
  transition: "Transition Executer",
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

const DOC_SECTIONS = [
  { id: 1, title: "Contexte", icon: FileText },
  { id: 2, title: "Objectifs SMART", icon: Target },
  { id: 3, title: "Strategie SWOT", icon: Shield },
  { id: 4, title: "Plan d'action", icon: Wrench },
  { id: 5, title: "Budget", icon: DollarSign },
  { id: 6, title: "Timeline", icon: Clock },
  { id: 7, title: "Indicateurs", icon: BarChart3 },
];

const CREATION_TYPES = [
  { id: "document", icon: FileText, label: "Document strategique", desc: "Cahier de projet, plan marketing, rapport", color: "border-amber-200 bg-amber-50", text: "text-amber-700" },
  { id: "code", icon: Code2, label: "Code avec Tim", desc: "Scripts, automatisations, integrations", color: "border-violet-200 bg-violet-50", text: "text-violet-700" },
  { id: "budget", icon: DollarSign, label: "Budget & Finances", desc: "Previsions, ROI, analyse de couts", color: "border-emerald-200 bg-emerald-50", text: "text-emerald-700" },
  { id: "presentation", icon: Presentation, label: "Presentation", desc: "Pitch deck, slides CA, rapport au board", color: "border-blue-200 bg-blue-50", text: "text-blue-700" },
  { id: "template", icon: Grid3X3, label: "Template Lego", desc: "Gabarit reutilisable, processus standard", color: "border-pink-200 bg-pink-50", text: "text-pink-700" },
  { id: "spreadsheet", icon: Table2, label: "Tableur & Donnees", desc: "Analyse CSV, tableaux, dashboards", color: "border-teal-200 bg-teal-50", text: "text-teal-700" },
];

const SWOT_DATA = {
  forces: ["Reseau REAI 130+ membres", "AI CEO unique sur le marche", "Pipeline vocal+video operationnel"],
  faiblesses: ["Equipe marketing 1 personne", "Brand awareness faible hors REAI", "Dependance bouche-a-oreille 65%"],
  opportunites: ["72% PME sous-investissent en digital", "0 concurrent avec AI CEO integree", "Subventions MESI numerisation"],
  menaces: ["Concurrents SaaS bien finances", "Resistance au changement PME", "Budget marketing limite 12K$/mois"],
};

const GANTT_MILESTONES = [
  { id: 1, label: "Programme referral", bot: "CMOB", start: "S1", end: "S4", progress: 0 },
  { id: 2, label: "Content LinkedIn", bot: "CMOB", start: "S2", end: "S8", progress: 0 },
  { id: 3, label: "Chatbot site web", bot: "CTOB", start: "S3", end: "S6", progress: 0 },
  { id: 4, label: "Email nurturing", bot: "CTOB", start: "S5", end: "S10", progress: 0 },
];

const VITAA_SCORES = [
  { label: "Alignement Blueprint", score: 92, color: "bg-green-500" },
  { label: "Valeurs coherentes", score: 88, color: "bg-green-500" },
  { label: "SWOT valide", score: 85, color: "bg-green-500" },
  { label: "Piliers couverts", score: 75, color: "bg-amber-500" },
  { label: "Budget realiste", score: 45, color: "bg-red-500" },
];

const CODE_STEPS = [
  { id: "plan", label: "Plan", icon: FileText },
  { id: "code", label: "Code", icon: Code2 },
  { id: "debug", label: "Debug", icon: Bug },
  { id: "test", label: "Test", icon: FlaskConical },
  { id: "done", label: "Done", icon: CheckCircle2 },
];

const BUDGET_ROWS = [
  { poste: "Programme referral", mensuel: "1,200$", annuel: "14,400$", pct: 31 },
  { poste: "Content LinkedIn", mensuel: "1,400$", annuel: "16,800$", pct: 37 },
  { poste: "Chatbot AI (maintenance)", mensuel: "400$", annuel: "4,800$", pct: 11 },
  { poste: "Email nurturing", mensuel: "800$", annuel: "9,600$", pct: 21 },
];

const PRESENTATION_SLIDES = [
  { id: 1, title: "Enjeu Marketing Q2", bullets: ["CAC actuel: 780$/lead", "65% bouche-a-oreille", "Objectif: +40% leads"], color: "bg-red-50 border-red-200" },
  { id: 2, title: "Strategie proposee", bullets: ["Programme referral REAI", "Content LinkedIn + SEO", "Chatbot AI site web"], color: "bg-amber-50 border-amber-200" },
  { id: 3, title: "Budget & ROI", bullets: ["3,800$/mois total", "ROI projete: 3.6x", "Point mort: mois 4"], color: "bg-emerald-50 border-emerald-200" },
  { id: 4, title: "Timeline & Equipe", bullets: ["S1-S14, checkpoint S7", "Mathilde + Tim + Frank", "4 jalons majeurs"], color: "bg-blue-50 border-blue-200" },
];

const TEMPLATE_BLOCKS = [
  { id: 1, title: "Diagnostic initial", desc: "Analyse VITAA + Triangle du feu", icon: Eye },
  { id: 2, title: "Objectifs SMART", desc: "3-5 objectifs mesurables", icon: Target },
  { id: 3, title: "Plan d'action", desc: "Jalons + bots assignes", icon: Wrench },
  { id: 4, title: "Budget previsionnel", desc: "Ventilation + ROI", icon: DollarSign },
  { id: 5, title: "Indicateurs de suivi", desc: "KPIs + tableaux de bord", icon: BarChart3 },
];

const TABLEUR_DATA = [
  { mois: "Avril", leads: 45, cac: "650$", conv: "1.8%", rev: "29,250$" },
  { mois: "Mai", leads: 62, cac: "520$", conv: "2.1%", rev: "40,300$" },
  { mois: "Juin", leads: 78, cac: "420$", conv: "2.6%", rev: "50,700$" },
  { mois: "Juillet", leads: 95, cac: "350$", conv: "3.0%", rev: "61,750$" },
];

const TIM_LIVE_CODE = `$ tim create ChatWidget.tsx
[Tim] Analyzing requirements...
[Tim] Creating component structure...

import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface ChatWidgetProps {
  apiEndpoint: string;
  botCode?: string;
}

export function ChatWidget({ apiEndpoint, botCode = 'CEOB' }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const initSession = async () => {
      const res = await fetch(\`\${apiEndpoint}/chat/init\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botCode }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
    };
    initSession();
    return () => { abortRef.current?.abort(); };
  }, [apiEndpoint, botCode]);

  const sendMessage = async (text: string) => {
    if (!sessionId || isStreaming) return;
    setIsStreaming(true);
    abortRef.current = new AbortController();
    const sanitized = DOMPurify.sanitize(text);
    // ... streaming + DOMPurify sanitization
    setIsStreaming(false);
  };

  return <div className="chat-widget">{ /* UI */ }</div>;
}

[Tim] ✓ Component created — 42 lines
[Tim] Integrating DOMPurify sanitizer...
[Tim] ✓ Security patch applied
[Tim] Adding rate limiter (5 init/min per fingerprint)...
[Tim] ✓ Rate limiter added`;

const TIM_DEBUG_OUTPUT = `$ tim debug ChatWidget.tsx
[Tim] Running static analysis...
[Tim] Scanning 42 lines for issues...

[WARN] Line 28: Timeout at 30s with no fallback message
  → Fix: Adding fallback "Je reflechis encore..." after 15s
  → Applied: setTimeout(() => setFallback(true), 15000)

[WARN] Line 35: useEffect cleanup missing on unmount
  → Fix: Adding AbortController cleanup
  → Applied: return () => abortRef.current?.abort()

[Tim] Re-scanning...
[Tim] ✓ 0 issues remaining
[Tim] ✓ 2 bugs fixed — code is clean`;

const TIM_TEST_OUTPUT = `$ tim test ChatWidget.test.tsx
Running 4 tests...

  ✓ test_init_session         ████████████████████ 25%   (12ms)
  ✓ test_send_message         ████████████████████ 50%   (8ms)
  ✓ test_stream_response      ████████████████████ 75%   (15ms)
  ✓ test_timeout_fallback     ████████████████████ 100%  (6ms)

=================== 4 passed in 0.041s ===================
All tests green!`;

const DEPT_SUBTABS = ["Vue d'ensemble", "Blueprint", "Sante", "Chantiers", "Projets", "Missions", "Taches", "Discussions", "Documents"];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function SimPhaseAtelier({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("entree");
  const [typed, setTyped] = useState(false);
  const [sectionsFilled, setSectionsFilled] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [codeStepActive, setCodeStepActive] = useState("plan");
  const [expandedSwot, setExpandedSwot] = useState<string | null>(null);
  const [terminalDone, setTerminalDone] = useState(false);
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
    setStage("entree");
    setTyped(false);
    setSectionsFilled([]);
    setActiveSection(1);
    setSelectedTypes([]);
    setCodeStepActive("plan");
    setExpandedSwot(null);
    setTerminalDone(false);
  };

  const goNext = (s: Stage) => { setTyped(false); setStage(s); };
  const fillSection = (num: number) => { if (!sectionsFilled.includes(num)) setSectionsFilled(prev => [...prev, num]); };

  const currentPhase: Phase = "atelier";
  const discussionContext =
    si <= 0 ? "Transition Analyse → Creation" :
    si <= 2 ? "Creation — Chantier Marketing Q2" :
    stage === "budget-creation" ? "Frank — Budget & Finances" :
    stage === "presentation-creation" ? "Mathilde — Pitch Deck" :
    stage === "template-creation" ? "Paco — Template Lego" :
    stage === "tableur-creation" ? "Tableur de suivi Q2" :
    si >= STAGE_ORDER.indexOf("code-intro") && si <= STAGE_ORDER.indexOf("code-test") ? "Tim Code — Chatbot site web" :
    "Atelier — Marketing Q2";

  const breadcrumb = ["Direction", "Marketing Q2", "Refonte site web", "Integration front-end"];

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════

  const chatContent = (
    <>
      {/* Stage: entree — transition from Reflexion */}
      {si >= 0 && (
        <SBubble code="CEOB" collapsed={si > 0}>
          {si === 0 ? (
            <>
              <TypewriterText
                text="Analyse terminee — 8 sections completees, 3 constats valides, cause racine identifiee. On passe en mode Creation pour construire le plan d'action concret."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-3 space-y-1.5">
                  {[
                    { code: "CMOB", name: "Mathilde", role: "CMO — Plan marketing", delay: "0ms" },
                    { code: "CFOB", name: "Frank", role: "CFO — Budget et ROI", delay: "400ms" },
                    { code: "CTOB", name: "Tim", role: "CTO — Code et integrations", delay: "800ms" },
                  ].map(bot => (
                    <div key={bot.code} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: bot.delay, animationFillMode: "both", animationDuration: "500ms" }}>
                      <BotAvatar code={bot.code} size="sm" />
                      <div className="flex-1">
                        <span className="text-[9px] font-bold text-gray-700">{bot.name}</span>
                        <span className="text-[8px] text-gray-500 ml-1.5">{bot.role}</span>
                      </div>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[8px] text-emerald-600 font-medium">Pret</span>
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("accueil")} icon={Hammer} label="Commencer a creer" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Transition Analyse → Creation — 3 bots mobilises</p>}
        </SBubble>
      )}

      {/* Stage: accueil */}
      {si >= 1 && (
        <SBubble code="CEOB" collapsed={si > 1}>
          {si === 1 ? (
            <>
              <TypewriterText
                text="Mode Creation active. Ici, on construit — documents, plans, code, budgets, presentations. Tout ce qui sort de l'analyse se cristallise en livrables concrets. Qu'est-ce que tu veux creer?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Document", "Code", "Plan d'action", "Budget", "Presentation", "Template", "SWOT", "Cristalliser"].map(b => (
                    <span key={b} className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-medium">{b}</span>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("type-selection")} icon={Layers} label="Voir les types de creation" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mode Creation active — types de livrables</p>}
        </SBubble>
      )}

      {/* Stage: type-selection */}
      {si >= 2 && (
        <>
          {si === 2 && (
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                <p className="text-sm text-blue-900">On fait tout — document d'abord, puis budget, presentation, template, tableur, et Tim code le chatbot a la fin.</p>
              </div>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 2}>
            {si === 2 ? (
              <>
                <TypewriterText
                  text="Parfait — 6 livrables a creer: document strategique, budget, presentation, template lego, tableur de suivi, et le chatbot AI avec Tim. On commence par le document — les insights de l'Analyse sont pre-charges."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("doc-toc")} icon={FileText} label="Ouvrir le document" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Document strategique + Tim Code selectionnes</p>}
          </SBubble>
        </>
      )}

      {/* Stage: doc-toc */}
      {si >= 3 && (
        <SBubble code="CEOB" collapsed={si > 3}>
          {si === 3 ? (
            <>
              <TypewriterText
                text="Table des matieres creee — 7 sections a remplir. Je pre-remplis chaque section avec les donnees de l'Analyse. Tu valides, modifies, ou on passe a la suivante. Section 1: Contexte?"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => { fillSection(1); setActiveSection(2); goNext("doc-contexte"); }} icon={Play} label="Remplir Section 1" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Table des matieres — 7 sections</p>}
        </SBubble>
      )}

      {/* Stage: doc-contexte */}
      {si >= 4 && (
        <>
          <SBubble code="CEOB" collapsed={si > 4}>
            {si === 4 ? (
              <>
                <TypewriterText
                  text="Section 1 pre-remplie depuis l'Analyse. Le chantier Marketing Q2 vise +40% de leads qualifies avec un budget de 12K$/mois. 3 tensions identifiees: CAC eleve (780$/lead), faible conversion web (1.2%), dependance bouche-a-oreille (65%). Validez ou modifiez."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
              </>
            ) : <p className="text-[9px] text-gray-400 italic">§1 Contexte pre-rempli et valide</p>}
          </SBubble>
          {si === 4 && typed && (
            <>
              <div className="flex justify-end">
                <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                  <p className="text-sm text-blue-900">C'est bon, je valide le contexte.</p>
                </div>
              </div>
              <SBtn onClick={() => { fillSection(2); setActiveSection(3); goNext("doc-objectifs"); }} icon={Target} label="Section 2: Objectifs" />
            </>
          )}
        </>
      )}

      {/* Stage: doc-objectifs */}
      {si >= 5 && (
        <SBubble code="CEOB" collapsed={si > 5}>
          {si === 5 ? (
            <>
              <TypewriterText
                text="3 objectifs SMART proposes a partir de l'analyse:"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1.5">
                  {[
                    { n: 1, text: "Reduire le CAC de 780$ a 400$ d'ici fin Q3" },
                    { n: 2, text: "Augmenter la conversion web de 1.2% a 3% d'ici fin Q2" },
                    { n: 3, text: "Diversifier les sources: bouche-a-oreille < 40% d'ici Q4" },
                  ].map(obj => (
                    <div key={obj.n} className="flex items-center gap-2 text-[9px] text-gray-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => setSelectedTypes(prev => prev.includes(`obj-${obj.n}`) ? prev : [...prev, `obj-${obj.n}`])}
                    >
                      <span className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold",
                        selectedTypes.includes(`obj-${obj.n}`) ? "bg-amber-500 text-white" : "bg-amber-200 text-amber-700"
                      )}>{selectedTypes.includes(`obj-${obj.n}`) ? "✓" : obj.n}</span>
                      <span className="flex-1">{obj.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => { fillSection(3); setActiveSection(4); goNext("doc-swot"); }} icon={Shield} label="Section 3: SWOT" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">§2 Objectifs SMART — 3 valides</p>}
        </SBubble>
      )}

      {/* Stage: doc-swot */}
      {si >= 6 && (
        <SBubble code="CSOB" collapsed={si > 6}>
          {si === 6 ? (
            <>
              <TypewriterText
                text="Matrice SWOT completee par 4 specialistes. Forces: reseau REAI unique. Faiblesses: equipe marketing trop petite. Opportunites: marche sous-adresse. Menaces: concurrents bien finances. La matrice interactive est a droite — cliquez pour detailler."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => { fillSection(4); setActiveSection(5); goNext("doc-plan"); }} icon={Wrench} label="Section 4: Plan d'action" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">§3 SWOT — matrice completee</p>}
        </SBubble>
      )}

      {/* Stage: doc-plan */}
      {si >= 7 && (
        <SBubble code="CEOB" collapsed={si > 7}>
          {si === 7 ? (
            <>
              <TypewriterText
                text="Plan d'action en 4 jalons avec bots assignes. Mathilde gere le referral et LinkedIn, Tim deploie le chatbot et le nurturing. Timeline: S1 a S10. La Gantt est a droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => { fillSection(5); fillSection(6); fillSection(7); goNext("doc-enrich"); }} icon={PenLine} label="Enrichir le document" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">§4 Plan — 4 jalons, bots assignes</p>}
        </SBubble>
      )}

      {/* Stage: doc-enrich — Enrichir le document (images, videos, tables, modification) */}
      {si >= 8 && (
        <SBubble code="CEOB" collapsed={si > 8}>
          {si === 8 ? (
            <>
              <TypewriterText
                text="7 sections remplies! Maintenant enrichis ton document: modifie le contenu des sections, ajoute des images, videos, tableaux, graphiques. Clique sur une section pour la modifier, ou utilise la barre d'outils media a droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    { icon: Image, label: "Image AI", bg: "bg-pink-50 text-pink-700 border-pink-200" },
                    { icon: Upload, label: "Upload fichier", bg: "bg-blue-50 text-blue-700 border-blue-200" },
                    { icon: Video, label: "Video", bg: "bg-purple-50 text-purple-700 border-purple-200" },
                    { icon: Table2, label: "Tableau", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { icon: BarChart3, label: "Graphique", bg: "bg-amber-50 text-amber-700 border-amber-200" },
                  ].map(m => (
                    <span key={m.label} className={cn("text-[9px] px-2 py-1 rounded-full border flex items-center gap-1 font-medium", m.bg)}>
                      <m.icon className="h-3.5 w-3.5" /> {m.label}
                    </span>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => goNext("budget-creation")} icon={DollarSign} label="Livrable suivant: Budget" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Document enrichi — images, videos, tableaux</p>}
        </SBubble>
      )}

      {/* Stage: budget-creation — Frank cree le budget */}
      {si >= 9 && (
        <SBubble code="CFOB" collapsed={si > 9}>
          {si === 9 ? (
            <>
              <TypewriterText
                text="Budget consolide. J'ai ventile les 3,800$/mois en 4 postes avec les projections annuelles et les pourcentages. Le tableur interactif est a droite — chaque ligne est modifiable. ROI projete: 3.6x en 6 mois."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("presentation-creation")} icon={Presentation} label="Livrable suivant: Presentation" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Frank: Budget 3,800$/mois consolide</p>}
        </SBubble>
      )}

      {/* Stage: presentation-creation — Mathilde cree le pitch deck */}
      {si >= 10 && (
        <SBubble code="CMOB" collapsed={si > 10}>
          {si === 10 ? (
            <>
              <TypewriterText
                text="Pitch deck pret — 4 slides pour le board. Slide 1: l'enjeu Marketing Q2. Slide 2: la strategie proposee. Slide 3: budget et ROI. Slide 4: timeline et equipe. Tu peux modifier chaque slide en cliquant dessus a droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("template-creation")} icon={Grid3X3} label="Livrable suivant: Template Lego" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Mathilde: Pitch deck 4 slides</p>}
        </SBubble>
      )}

      {/* Stage: template-creation — Paco cree le template */}
      {si >= 11 && (
        <SBubble code="CPOB" collapsed={si > 11}>
          {si === 11 ? (
            <>
              <TypewriterText
                text="Template Lego cree — reutilisable pour tous les projets marketing. 5 blocs modulaires: Diagnostic, Objectifs, Plan, Budget, Indicateurs. Chaque bloc peut etre reorganise, ajoute ou retire. C'est le gabarit standard Usine Bleue."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("tableur-creation")} icon={Table2} label="Livrable suivant: Tableur" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Paco: Template Lego 5 blocs</p>}
        </SBubble>
      )}

      {/* Stage: tableur-creation — Tableur de donnees */}
      {si >= 12 && (
        <SBubble code="CEOB" collapsed={si > 12}>
          {si === 12 ? (
            <>
              <TypewriterText
                text="Tableur de suivi avec projections mensuelles Q2. 4 mois de donnees: leads, cout d'acquisition, taux de conversion, et revenus projetes. Les tendances sont positives — on passe de 45 leads en avril a 95 en juillet."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => { setCodeStepActive("plan"); goNext("code-intro"); }} icon={Code2} label="Tim Code: chatbot AI" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tableur: projections Q2 en hausse</p>}
        </SBubble>
      )}

      {/* Stage: code-intro — Tim prend le lead */}
      {si >= 13 && (
        <SBubble code="CTOB" collapsed={si > 13}>
          {si === 13 ? (
            <>
              <TypewriterText
                text="Je prends le lead sur le chatbot AI pour le site web. Mon plan en 3 etapes: coder le composant React, debugger les edge cases, puis valider avec des tests. Regarde le terminal a droite — tu vas me voir travailler en temps reel."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 bg-violet-50 border border-violet-200 rounded-lg p-2">
                  {[
                    { text: "1. Codage — composant React + CarlOS API + DOMPurify" },
                    { text: "2. Debug — static analysis + fixes automatiques" },
                    { text: "3. Tests — 4 tests unitaires + integration" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 text-[9px] text-violet-700">
                      <span className="font-bold w-4">○</span>
                      <span>{step.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {typed && <SBtn onClick={() => { setCodeStepActive("code"); goNext("code-live"); }} icon={Terminal} label="Lancer le codage live" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Tim Code — plan chatbot AI</p>}
        </SBubble>
      )}

      {/* Stage: code-live — Tim code en temps reel (terminal live a droite) */}
      {si >= 14 && (
        <SBubble code="CTOB" collapsed={si > 14}>
          {si === 14 ? (
            <>
              <TypewriterText
                text="Code en cours... Regarde le terminal. Je suis en train d'ecrire le composant ChatWidget avec l'integration CarlOS API, le sanitizer DOMPurify et le rate limiter."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-[9px] text-violet-700 font-medium">Tim travaille...</span>
                  <Terminal className="h-3.5 w-3.5 text-violet-500 ml-auto" />
                </div>
              )}
              {typed && <SBtn onClick={() => { setCodeStepActive("debug"); goNext("code-debug"); }} icon={Bug} label="Passer au debug" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">ChatWidget code — terminal live</p>}
        </SBubble>
      )}

      {/* Stage: code-debug — Debug live */}
      {si >= 15 && (
        <>
          <SBubble code="CISOB" collapsed={si > 15}>
            {si === 15 ? (
              <p className="text-sm text-gray-800">J'ai repere 2 vecteurs: pas de fallback timeout et pas de cleanup useEffect. Tim, corrige ca avant les tests.</p>
            ) : <p className="text-[9px] text-gray-400 italic">Sebastien: 2 issues securite</p>}
          </SBubble>
          <SBubble code="CTOB" collapsed={si > 15}>
            {si === 15 ? (
              <>
                <TypewriterText
                  text="Debug en cours... 2 bugs trouves par Sebastien, je les corrige en direct. Regarde le terminal — les fixes s'appliquent automatiquement."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => { setCodeStepActive("test"); goNext("code-test"); }} icon={FlaskConical} label="Lancer les tests" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">2 bugs corriges en live</p>}
          </SBubble>
        </>
      )}

      {/* Stage: code-test — Tests live */}
      {si >= 16 && (
        <SBubble code="CTOB" collapsed={si > 16}>
          {si === 16 ? (
            <>
              <TypewriterText
                text="Tests en cours... 4 tests unitaires executes. Regarde les resultats defiler dans le terminal. Tout est vert!"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => { setCodeStepActive("done"); goNext("cristallisation"); }} className="text-[9px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 flex items-center gap-1 cursor-pointer">
                    <Sparkles className="h-3.5 w-3.5" /> Cristalliser les 6 livrables
                  </button>
                  <button className="text-[9px] px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 flex items-center gap-1 cursor-pointer">
                    <Download className="h-3.5 w-3.5" /> Exporter le code .tsx
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">4/4 tests passent — tout vert</p>}
        </SBubble>
      )}

      {/* Stage: cristallisation */}
      {si >= 17 && (
        <SBubble code="CEOB" collapsed={si > 17}>
          {si === 17 ? (
            <>
              <div className="space-y-1.5">
                {[
                  { icon: FileText, text: "Assemblage document strategique (7 sections)..." },
                  { icon: DollarSign, text: "Integration budget & finances..." },
                  { icon: Presentation, text: "Compilation pitch deck (4 slides)..." },
                  { icon: Grid3X3, text: "Enregistrement template lego..." },
                  { icon: Table2, text: "Consolidation tableur de suivi..." },
                  { icon: Code2, text: "Integration code Tim (ChatWidget)..." },
                  { icon: CheckCircle2, text: "6 livrables cristallises!" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600 animate-in fade-in" style={{ animationDelay: `${i * 400}ms`, animationFillMode: "both" }}>
                    <step.icon className="h-3.5 w-3.5 text-amber-500" />
                    <span>{step.text}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />
                  </div>
                ))}
              </div>
              <AutoAdvance onComplete={() => setTyped(true)} delay={2500} />
              {typed && <SBtn onClick={() => goNext("cruncher")} icon={DollarSign} label="Cruncher les chiffres" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">6 livrables cristallises</p>}
        </SBubble>
      )}

      {/* Stage: cruncher */}
      {si >= 18 && (
        <SBubble code="CFOB" collapsed={si > 18}>
          {si === 18 ? (
            <>
              <TypewriterText
                text="Analyse financiere complete. Budget total: 3,800$/mois. ROI projete en 6 mois: 3.6x. Cout par lead projete: 320$ (vs 780$ actuel). Point mort: mois 4. Le detail est a droite."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("revue")} icon={Users} label="Revue collaborative" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Frank: Budget 3,800$/mois, ROI 3.6x</p>}
        </SBubble>
      )}

      {/* Stage: revue */}
      {si >= 19 && (
        <SBubble code="CEOB" collapsed={si > 19}>
          {si === 19 ? (
            <>
              <TypewriterText
                text="Avis final de l'equipe — Frank: POUR (budget solide). Tim: POUR avec reserve (timeline serree pour le chatbot). Simone: NUANCE (surveiller la concurrence). Vote: 2 pour, 1 nuance."
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && <SBtn onClick={() => goNext("challenge-final")} icon={AlertTriangle} label="Challenger" />}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Revue: 2 pour, 1 nuance</p>}
        </SBubble>
      )}

      {/* Stage: challenge-final */}
      {si >= 20 && (
        <>
          {si === 20 && (
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-xl rounded-tr-none px-3 py-2 max-w-[80%]">
                <p className="text-sm text-blue-900">Je challenge la timeline: S1-S10 c'est serre avec le chatbot en plus. On peut etaler?</p>
              </div>
            </div>
          )}
          <SBubble code="CEOB" collapsed={si > 20}>
            {si === 20 ? (
              <>
                <TypewriterText
                  text="Bonne question. Tim confirme: le referral peut demarrer S1 sans risque, mais le chatbot AI necessite 2 semaines de test. Proposition: etaler sur S1-S14 avec un checkpoint S7 pour valider les premiers resultats avant d'investir dans le nurturing."
                  speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
                />
                {typed && <SBtn onClick={() => goNext("scan-vitaa")} icon={Shield} label="Lancer le scan VITAA" />}
              </>
            ) : <p className="text-[9px] text-gray-400 italic">Timeline etalee S1-S14 avec checkpoint</p>}
          </SBubble>
        </>
      )}

      {/* Stage: scan-vitaa */}
      {si >= 21 && (
        <SBubble code="CEOB" collapsed={si > 21}>
          {si === 21 ? (
            <>
              <div className="space-y-1.5">
                {[
                  { icon: Target, text: "Verification alignement Blueprint..." },
                  { icon: Shield, text: "Validation valeurs coherentes..." },
                  { icon: BarChart3, text: "Analyse couverture SWOT..." },
                  { icon: TrendingUp, text: "Verification piliers couverts..." },
                  { icon: DollarSign, text: "Validation budget realiste..." },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] text-gray-600 animate-in fade-in" style={{ animationDelay: `${i * 500}ms`, animationFillMode: "both" }}>
                    <step.icon className="h-3.5 w-3.5 text-amber-500" />
                    <span>{step.text}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-auto" />
                  </div>
                ))}
              </div>
              <AutoAdvance onComplete={() => { setTyped(true); goNext("resultat-scan"); }} delay={3000} />
            </>
          ) : <p className="text-[9px] text-gray-400 italic">Scan VITAA — 5 criteres</p>}
        </SBubble>
      )}

      {/* Stage: resultat-scan */}
      {si >= 22 && (
        <SBubble code="CEOB" collapsed={si > 22}>
          {si === 22 ? (
            <>
              <TypewriterText
                text="Scan VITAA: 4/5 criteres alignes. Point a verifier: le budget est en-dessous du seuil recommande pour un impact Q2. Options:"
                speed={8} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
              />
              {typed && (
                <div className="mt-2 space-y-1.5">
                  <button onClick={() => goNext("transition")} className="w-full text-left text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-100 cursor-pointer transition-colors">
                    <span className="font-bold">Option 1:</span> Justifier — le budget conservateur est voulu
                  </button>
                  <button className="w-full text-left text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors">
                    <span className="font-bold">Option 2:</span> Reviser — augmenter a 5,500$/mois
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-[9px] text-gray-400 italic">VITAA 4/5 — budget a justifier</p>}
        </SBubble>
      )}

      {/* Stage: transition */}
      {stage === "transition" && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl px-4 py-3">
          <TypewriterText
            text="Document valide! Pret pour l'execution. 4 missions vont etre creees automatiquement a partir du plan d'action + le chatbot de Tim."
            speed={8} className="text-sm text-emerald-800 font-medium"
            onComplete={() => setTyped(true)}
          />
          {typed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-700 font-semibold ml-1">Creer → Executer</span>
            </div>
          )}
        </div>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ROOT LAYOUT (same frame as SimPhaseReflexion)
  // ═══════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sim header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Hammer className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-bold text-gray-800">Phase Creation</span>
        <span className="text-xs text-gray-400">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {STAGE_ORDER.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-amber-500" : i < si ? "w-2 bg-amber-300" : "w-2 bg-gray-200"
            )} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-1" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color line */}
      <div className="h-1 shrink-0 bg-amber-500" />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Discussion (40%) */}
        <div className="w-[40%] min-w-[280px] flex flex-col border-r border-gray-200 bg-white">
          {/* Chat header */}
          <div className="h-12 px-3 shrink-0 flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
            <BotAvatar code="CEOB" size="sm" />
            <span className="text-[11px] text-white font-medium truncate flex-1">{discussionContext}</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/70" />
          </div>

          {/* Phase bar — bots LEFT, badges RIGHT */}
          <div className={cn("shrink-0 border-b px-3 py-1.5 flex items-center gap-2", PHASE_COLORS.atelier.bg, PHASE_COLORS.atelier.border)}>
            <div className="flex items-center gap-1.5">
              {[
                { code: "CMOB" },
                { code: "CFOB" },
                { code: "CTOB" },
              ].map(b => (
                <div key={b.code} className="flex items-center gap-1 bg-white/70 rounded-full px-1.5 py-0.5">
                  <BotAvatar code={b.code} size="sm" />
                  <span className="text-[8px] font-medium text-gray-600">{BOT_COLORS[b.code]?.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {(["reflexion", "atelier", "command"] as Phase[]).map(p => (
                <span key={p} className={cn(
                  "px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-1 transition-all",
                  currentPhase === p ? PHASE_COLORS[p].badge : "bg-gray-100 text-gray-400"
                )}>
                  <span className={cn("w-2 h-2 rounded-full transition-all", currentPhase === p ? PHASE_COLORS[p].dot : "bg-gray-300")} />
                  {PHASE_COLORS[p].label}
                  {p === "reflexion" && <CheckCircle2 className="h-2.5 w-2.5 ml-0.5 text-emerald-500" />}
                  {p === "command" && <Lock className="h-2.5 w-2.5 ml-0.5 opacity-50" />}
                </span>
              ))}
            </div>
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
                  nav.id === "dept" ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                  <nav.icon className="h-3.5 w-3.5" />
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs (hidden when in deep atelier stages) */}
          {si <= 2 && (
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
              {DEPT_SUBTABS.map((tab, i) => (
                <button key={tab} className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all",
                  i === 3 ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Breadcrumb */}
          <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 flex items-center gap-1.5">
            {breadcrumb.map((c, i, arr) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                <span className={cn("text-[11px]", i === arr.length - 1 ? "text-gray-800 font-medium" : "text-gray-400 hover:text-gray-600 cursor-pointer")}>{c}</span>
              </div>
            ))}
          </div>

          {/* Right panel content */}
          <div ref={rightRef} className="flex-1 overflow-auto bg-white">
            <RightContent
              stage={stage}
              sectionsFilled={sectionsFilled}
              activeSection={activeSection}
              codeStepActive={codeStepActive}
              expandedSwot={expandedSwot}
              setExpandedSwot={setExpandedSwot}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// RIGHT PANEL CONTENT ROUTER
// ═══════════════════════════════════════

interface RightContentProps {
  stage: Stage;
  sectionsFilled: number[];
  activeSection: number;
  codeStepActive: string;
  expandedSwot: string | null;
  setExpandedSwot: (v: string | null) => void;
}

function RightContent({ stage, sectionsFilled, activeSection, codeStepActive, expandedSwot, setExpandedSwot }: RightContentProps) {
  const si = STAGE_ORDER.indexOf(stage);

  if (si <= 1) return <ContentCreationHub />;
  if (stage === "type-selection") return <ContentTypeSelection />;
  if (si >= STAGE_ORDER.indexOf("doc-toc") && si <= STAGE_ORDER.indexOf("doc-plan")) {
    return <ContentDocForge sectionsFilled={sectionsFilled} activeSection={activeSection} expandedSwot={expandedSwot} setExpandedSwot={setExpandedSwot} />;
  }
  if (stage === "doc-enrich") return <ContentDocEnrich sectionsFilled={sectionsFilled} />;
  if (stage === "budget-creation") return <ContentBudget />;
  if (stage === "presentation-creation") return <ContentPresentation />;
  if (stage === "template-creation") return <ContentTemplate />;
  if (stage === "tableur-creation") return <ContentTableur />;
  if (si >= STAGE_ORDER.indexOf("code-intro") && si <= STAGE_ORDER.indexOf("code-test")) {
    return <ContentTimCode stage={stage} codeStepActive={codeStepActive} />;
  }
  if (stage === "cristallisation") return <ContentCristallisation sectionsFilled={sectionsFilled} />;
  if (stage === "cruncher") return <ContentCruncher />;
  if (stage === "revue") return <ContentRevue />;
  if (stage === "challenge-final") return <ContentChallengeFinal />;
  if (stage === "scan-vitaa" || stage === "resultat-scan") return <ContentVITAA />;
  if (stage === "transition") return <ContentTransition />;
  return null;
}

// ═══════════════════════════════════════
// CONTENT COMPONENTS
// ═══════════════════════════════════════

function ContentCreationHub() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Hammer className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Phase Creation — Chantier Marketing Q2</h3>
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">Transition depuis Analyse</span>
      </div>

      {/* Insights from Reflexion */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-red-500" />
          <span className="text-xs font-bold text-red-800">Insights de l'Analyse (pre-charges)</span>
        </div>
        <div className="space-y-1.5">
          {[
            "Cause racine: messaging technique au lieu de resultats business",
            "Quick win identifie: programme referral (ROI 4.2x)",
            "Marche pret: 72% des PME sous-investissent en digital",
          ].map((insight, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px] text-red-700">
              <Pin className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What can be created */}
      <div className="bg-white border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-bold text-gray-800">Types de livrables a creer</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CREATION_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <div key={type.id} className={cn("border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all", type.color)}>
                <Icon className={cn("h-5 w-5 mb-1.5", type.text)} />
                <p className={cn("text-[9px] font-bold", type.text)}>{type.label}</p>
                <p className="text-[8px] text-gray-500 mt-0.5">{type.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      <div className="bg-amber-50 border border-dashed border-amber-300 rounded-xl p-6 text-center">
        <Hammer className="h-8 w-8 text-amber-300 mx-auto mb-2" />
        <p className="text-xs text-amber-600 font-medium">L'atelier de creation est pret</p>
        <p className="text-[9px] text-amber-500 mt-1">Selectionnez un type de livrable pour commencer</p>
      </div>
    </div>
  );
}

function ContentTypeSelection() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Livrables selectionnes</h3>
      </div>

      {/* Selected: Document + Code */}
      <div className="space-y-3">
        <div className="border-2 border-amber-300 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-800">1. Document strategique</p>
            <p className="text-[9px] text-amber-600 mt-0.5">7 sections: Contexte, Objectifs, SWOT, Plan, Budget, Timeline, Indicateurs</p>
            <div className="mt-2 flex items-center gap-2">
              <BotAvatar code="CEOB" size="sm" />
              <span className="text-[8px] text-gray-500">CarlOS guide + pre-remplissage depuis l'Analyse</span>
            </div>
          </div>
          <span className="text-[9px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold shrink-0">En premier</span>
        </div>

        <div className="border-2 border-violet-300 bg-violet-50 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Code2 className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-violet-800">2. Code avec Tim — Chatbot AI</p>
            <p className="text-[9px] text-violet-600 mt-0.5">Pipeline: Plan → Code → Debug → Test → Deploy</p>
            <div className="mt-2 flex items-center gap-2">
              <BotAvatar code="CTOB" size="sm" />
              <span className="text-[8px] text-gray-500">Tim lead, review securite par Sebastien (CISO)</span>
            </div>
          </div>
          <span className="text-[9px] bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-bold shrink-0">Ensuite</span>
        </div>
      </div>

      {/* Other types available */}
      <div className="border border-gray-200 rounded-xl p-3">
        <p className="text-[9px] text-gray-500 font-medium mb-2">Autres types disponibles:</p>
        <div className="flex flex-wrap gap-1.5">
          {CREATION_TYPES.filter(t => t.id !== "document" && t.id !== "code").map(type => {
            const Icon = type.icon;
            return (
              <div key={type.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-[9px] text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                <Icon className="h-3.5 w-3.5" />
                <span>{type.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContentDocForge({ sectionsFilled, activeSection, expandedSwot, setExpandedSwot }: {
  sectionsFilled: number[];
  activeSection: number;
  expandedSwot: string | null;
  setExpandedSwot: (v: string | null) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      {/* Pipeline steps */}
      <div className="flex items-center gap-1 bg-white rounded-xl px-4 py-2.5 border border-amber-200 shadow-sm overflow-x-auto">
        {DOC_SECTIONS.map((sec, i) => {
          const filled = sectionsFilled.includes(sec.id);
          const isActive = sec.id === activeSection;
          const Icon = sec.icon;
          return (
            <div key={sec.id} className="flex items-center gap-1 shrink-0">
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all",
                filled ? "bg-emerald-500 text-white" : isActive ? "bg-amber-500 text-white scale-110" : "bg-gray-200 text-gray-500"
              )}>
                {filled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={cn("text-[9px]", filled ? "text-emerald-700" : isActive ? "text-amber-700 font-semibold" : "text-gray-400")}>{sec.title}</span>
              {i < DOC_SECTIONS.length - 1 && <div className={cn("w-3.5 h-0.5", filled ? "bg-emerald-300" : "bg-gray-200")} />}
            </div>
          );
        })}
      </div>

      {/* DocForge — TOC + Content */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-bold text-gray-800">Document Strategique — Marketing Q2</span>
          <span className="text-[9px] text-gray-500 ml-auto">{sectionsFilled.length} / {DOC_SECTIONS.length} sections</span>
        </div>
        <div className="flex gap-4">
          {/* TOC sidebar */}
          <div className="w-40 shrink-0 space-y-1">
            {DOC_SECTIONS.map(s => {
              const filled = sectionsFilled.includes(s.id);
              const isActive = s.id === activeSection;
              const Icon = s.icon;
              return (
                <div key={s.id} className={cn("flex items-center gap-1.5 text-[9px] px-2 py-1 rounded cursor-pointer transition-colors",
                  isActive ? "bg-amber-50 text-amber-700 font-semibold" : filled ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-400 hover:bg-gray-50"
                )}>
                  {filled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : isActive ? <Icon className="h-3.5 w-3.5 text-amber-500 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />}
                  <span className="truncate">{s.id}. {s.title}</span>
                </div>
              );
            })}
            <div className="mt-2 text-[9px] text-gray-500 px-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(sectionsFilled.length / DOC_SECTIONS.length) * 100}%` }} />
              </div>
              <span className="mt-1 block">{Math.round((sectionsFilled.length / DOC_SECTIONS.length) * 100)}% complet</span>
            </div>
          </div>

          {/* Active section content */}
          <div className="flex-1 space-y-3">
            {sectionsFilled.includes(1) && (
              <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
                <h4 className="text-[9px] font-bold text-amber-700 mb-1 flex items-center gap-1.5">
                  1. Contexte
                  <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">depuis Analyse</span>
                </h4>
                <p className="text-[9px] text-gray-700 leading-relaxed">Chantier Marketing Q2 — Augmenter la visibilite d'Usine Bleue. Budget: 12K$/mois. CAC actuel: 780$. Sources: 65% bouche-a-oreille, 20% web, 15% salons.</p>
                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-gray-400">
                  <BotAvatar code="CEOB" size="sm" />
                  <span>Pre-rempli depuis l'Analyse</span>
                </div>
              </div>
            )}

            {sectionsFilled.includes(2) && (
              <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
                <h4 className="text-[9px] font-bold text-amber-700 mb-1">2. Objectifs SMART</h4>
                <div className="space-y-1">
                  {["Reduire le CAC de 780$ a 400$ d'ici fin Q3", "Augmenter la conversion web de 1.2% a 3% d'ici fin Q2", "Diversifier les sources: bouche-a-oreille < 40% d'ici Q4"].map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sectionsFilled.includes(3) && (
              <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
                <h4 className="text-[9px] font-bold text-amber-700 mb-2">3. Matrice SWOT</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "forces", label: "Forces", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", content: "text-emerald-800" },
                    { key: "faiblesses", label: "Faiblesses", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", content: "text-red-800" },
                    { key: "opportunites", label: "Opportunites", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", content: "text-blue-800" },
                    { key: "menaces", label: "Menaces", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", content: "text-orange-800" },
                  ].map(quad => (
                    <div
                      key={quad.key}
                      className={cn("border rounded-lg px-2 py-1.5 cursor-pointer transition-all", quad.bg, quad.border,
                        expandedSwot === quad.key ? "ring-2 ring-amber-300 shadow-md" : "hover:shadow-sm"
                      )}
                      onClick={() => setExpandedSwot(expandedSwot === quad.key ? null : quad.key)}
                    >
                      <div className={cn("text-[9px] font-bold mb-1", quad.text)}>{quad.label}</div>
                      {(SWOT_DATA as Record<string, string[]>)[quad.key].map((f: string, i: number) => (
                        <div key={i} className={cn("text-[9px]", quad.content,
                          expandedSwot === quad.key ? "" : i > 0 ? "hidden" : ""
                        )}>• {f}</div>
                      ))}
                      {expandedSwot !== quad.key && (SWOT_DATA as Record<string, string[]>)[quad.key].length > 1 && (
                        <p className="text-[8px] text-gray-400 mt-0.5">+{(SWOT_DATA as Record<string, string[]>)[quad.key].length - 1} autres...</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-gray-400">
                  <BotAvatar code="CSOB" size="sm" />
                  <span>Simone (CSO) — analyse strategique</span>
                </div>
              </div>
            )}

            {sectionsFilled.includes(4) && (
              <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
                <h4 className="text-[9px] font-bold text-amber-700 mb-2">4. Plan d'action</h4>
                <div className="space-y-2">
                  {GANTT_MILESTONES.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <BotAvatar code={m.bot} size="sm" />
                      <div className="flex-1">
                        <div className="text-[9px] font-medium text-gray-800">{m.label}</div>
                        <div className="text-[9px] text-gray-500">{m.start} → {m.end}</div>
                      </div>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sectionsFilled.includes(5) && (
              <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
                <h4 className="text-[9px] font-bold text-amber-700 mb-1">5. Budget</h4>
                <p className="text-[9px] text-gray-700">Total: 3,800$/mois. Referral: 1,200$. LinkedIn: 2,600$. ROI projete: 3.6x en 6 mois.</p>
              </div>
            )}
            {sectionsFilled.includes(6) && (
              <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
                <h4 className="text-[9px] font-bold text-amber-700 mb-1">6. Timeline</h4>
                <p className="text-[9px] text-gray-700">S1-S14 avec checkpoint S7. Phase 1 (S1-S4): referral + LinkedIn. Phase 2 (S5-S10): chatbot + nurturing. Phase 3 (S11-S14): optimisation.</p>
              </div>
            )}
            {sectionsFilled.includes(7) && (
              <div className="border-l-[3px] border-amber-400 bg-amber-50/50 rounded-r-lg px-3 py-2">
                <h4 className="text-[9px] font-bold text-amber-700 mb-1">7. Indicateurs</h4>
                <p className="text-[9px] text-gray-700">KPIs: CAC (cible 400$), conversion web (cible 3%), part bouche-a-oreille (cible &lt;40%), ROI marketing (cible 3x+).</p>
              </div>
            )}

            {sectionsFilled.length < DOC_SECTIONS.length && (
              <button className="w-full border-2 border-dashed border-amber-300 rounded-lg px-4 py-3 text-[9px] text-amber-600 font-medium hover:bg-amber-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Play className="h-3.5 w-3.5" /> Remplir avec CarlOS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// LIVE TERMINAL — Tim travaille en temps reel
// ═══════════════════════════════════════

function LiveTerminal({ content, speed = 12 }: { content: string; speed?: number }) {
  const [chars, setChars] = useState(0);
  useEffect(() => {
    setChars(0);
  }, [content]);
  useEffect(() => {
    if (chars < content.length) {
      const nextChar = content[chars];
      const delay = nextChar === '\n' ? speed * 4 : speed;
      const timer = setTimeout(() => setChars(prev => prev + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [chars, content.length, speed, content]);
  const done = chars >= content.length;
  return (
    <div className="bg-gray-950 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 flex items-center gap-2 border-b border-gray-800">
        <Terminal className="h-3.5 w-3.5 text-green-400" />
        <span className="text-[9px] font-bold text-green-300">Tim — Terminal</span>
        {!done && <div className="flex items-center gap-1.5 ml-auto"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-[8px] text-green-400/70">En cours...</span></div>}
        {done && <CheckCircle2 className="h-3.5 w-3.5 text-green-400 ml-auto" />}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <pre className="p-3 text-[9px] leading-relaxed font-mono max-h-[280px] overflow-y-auto">
        <code className="text-green-400">{content.slice(0, chars)}</code>
        {!done && <span className="text-green-300 animate-pulse">▊</span>}
      </pre>
    </div>
  );
}

// ═══════════════════════════════════════
// NEW CONTENT COMPONENTS — 5 livrables + Tim Code refait
// ═══════════════════════════════════════

function ContentDocEnrich({ sectionsFilled }: { sectionsFilled: number[] }) {
  const [editingSection, setEditingSection] = useState<number | null>(2);
  const [insertedMedia, setInsertedMedia] = useState<string[]>(["image-1"]);
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <PenLine className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Enrichir le document</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-auto">7/7 sections</span>
      </div>

      {/* Media toolbar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-[9px] font-bold text-amber-800 mb-2">Inserer dans le document:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Image, label: "Image AI", desc: "Generer avec DALL-E", bg: "bg-pink-50 border-pink-200 text-pink-700" },
            { icon: Upload, label: "Upload", desc: "Depuis votre ordinateur", bg: "bg-blue-50 border-blue-200 text-blue-700" },
            { icon: Video, label: "Video", desc: "YouTube, Loom, Vimeo", bg: "bg-purple-50 border-purple-200 text-purple-700" },
            { icon: Table2, label: "Tableau", desc: "Donnees structurees", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            { icon: BarChart3, label: "Graphique", desc: "Visualisation de donnees", bg: "bg-amber-50 border-amber-200 text-amber-700" },
          ].map(m => (
            <button key={m.label} onClick={() => setInsertedMedia(prev => [...prev, m.label])} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-medium cursor-pointer hover:shadow-sm transition-all", m.bg)}>
              <m.icon className="h-3.5 w-3.5" /> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections editables */}
      <div className="space-y-2">
        {DOC_SECTIONS.map(sec => {
          const isEditing = editingSection === sec.id;
          return (
            <div key={sec.id} className={cn("border rounded-xl p-3 transition-all cursor-pointer",
              isEditing ? "border-amber-400 bg-amber-50/50 ring-2 ring-amber-200 shadow-md" : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
            )} onClick={() => setEditingSection(isEditing ? null : sec.id)}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-[9px] font-bold text-gray-800 flex-1">{sec.id}. {sec.title}</span>
                <PenLine className={cn("h-3.5 w-3.5 transition-colors", isEditing ? "text-amber-600" : "text-gray-300")} />
              </div>
              {isEditing && (
                <div className="mt-2 space-y-2">
                  <div className="bg-white border border-amber-300 rounded-lg p-2.5 min-h-[60px]">
                    <p className="text-[9px] text-gray-700 leading-relaxed">
                      {sec.id === 2 ? "Objectif 1: Reduire le CAC de 780$ a 400$ d'ici fin Q3\nObjectif 2: Augmenter la conversion web de 1.2% a 3%" : "Contenu de la section..."}
                    </p>
                    <div className="w-0.5 h-3 bg-amber-500 animate-pulse inline-block ml-0.5" />
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-gray-400">
                    <span>Modifie par CarlOS</span>
                    <span className="mx-1">•</span>
                    <span>Cliquer pour editer le contenu</span>
                  </div>
                </div>
              )}
              {sec.id === 1 && insertedMedia.includes("image-1") && (
                <div className="mt-2 bg-gray-100 rounded-lg p-2 flex items-center gap-2">
                  <div className="w-16 h-10 rounded bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
                    <Image className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-medium text-gray-700">infographie-marche-pme.png</p>
                    <p className="text-[8px] text-gray-400">Image AI generee — 72% PME sous-investissent</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inserted media summary */}
      {insertedMedia.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="text-[9px] font-bold text-gray-600 mb-1">Media inseres: {insertedMedia.length}</p>
          <div className="flex gap-1.5">
            {insertedMedia.map((m, i) => (
              <span key={i} className="text-[8px] bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-500">{m}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentBudget() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Budget & Finances — Marketing Q2</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CFOB" size="sm" />
          <span className="text-[9px] text-gray-500">Frank (CFO)</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Budget mensuel", value: "3,800$", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
          { label: "ROI projete", value: "3.6x", color: "border-blue-200 bg-blue-50 text-blue-700" },
          { label: "Point mort", value: "Mois 4", color: "border-amber-200 bg-amber-50 text-amber-700" },
        ].map(kpi => (
          <div key={kpi.label} className={cn("border rounded-xl", kpi.color)}>
            <div className="px-3 py-1.5 rounded-t-xl"><span className="text-[9px] font-bold">{kpi.label}</span></div>
            <div className="px-3 py-2.5 bg-white rounded-b-xl text-center"><p className="text-lg font-extrabold">{kpi.value}</p></div>
          </div>
        ))}
      </div>

      {/* Spreadsheet */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-emerald-50 border-b border-emerald-200">
              {["Poste", "Mensuel", "Annuel", "% Budget"].map(h => (
                <th key={h} className="text-[9px] font-bold text-emerald-800 px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUDGET_ROWS.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                <td className="text-[9px] text-gray-700 px-3 py-2 font-medium">{row.poste}</td>
                <td className="text-[9px] text-gray-700 px-3 py-2">{row.mensuel}</td>
                <td className="text-[9px] text-gray-700 px-3 py-2">{row.annuel}</td>
                <td className="text-[9px] px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="text-gray-600 font-medium">{row.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-100/50 font-bold">
              <td className="text-[9px] text-emerald-800 px-3 py-2">Total</td>
              <td className="text-[9px] text-emerald-800 px-3 py-2">3,800$</td>
              <td className="text-[9px] text-emerald-800 px-3 py-2">45,600$</td>
              <td className="text-[9px] text-emerald-800 px-3 py-2">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-[9px] text-gray-400">
        <PenLine className="h-3.5 w-3.5" />
        <span>Cliquer sur une ligne pour modifier les montants</span>
      </div>
    </div>
  );
}

function ContentPresentation() {
  const [activeSlide, setActiveSlide] = useState(1);
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Presentation className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Pitch Deck — Marketing Q2</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CMOB" size="sm" />
          <span className="text-[9px] text-gray-500">Mathilde (CMO)</span>
        </div>
      </div>

      {/* Slide thumbnails */}
      <div className="flex gap-2">
        {PRESENTATION_SLIDES.map(slide => (
          <button key={slide.id} onClick={() => setActiveSlide(slide.id)}
            className={cn("flex-1 border-2 rounded-lg p-2 cursor-pointer transition-all",
              activeSlide === slide.id ? "border-blue-500 shadow-md scale-105" : "border-gray-200 hover:border-blue-300",
              slide.color
            )}>
            <p className="text-[8px] font-bold text-gray-800 truncate">{slide.id}. {slide.title}</p>
          </button>
        ))}
      </div>

      {/* Active slide */}
      {PRESENTATION_SLIDES.filter(s => s.id === activeSlide).map(slide => (
        <div key={slide.id} className={cn("border-2 rounded-xl p-6", slide.color)}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Slide {slide.id}/4</span>
            <PenLine className="h-3.5 w-3.5 text-gray-400 ml-auto cursor-pointer hover:text-blue-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-3">{slide.title}</h4>
          <div className="space-y-2">
            {slide.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-white/50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Image className="h-5 w-5 text-gray-300 mx-auto mb-1" />
            <p className="text-[8px] text-gray-400">Zone visuelle — graphique ou image</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentTemplate() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Grid3X3 className="h-4 w-4 text-pink-600" />
        <h3 className="text-sm font-bold text-gray-800">Template Lego — Marketing</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CPOB" size="sm" />
          <span className="text-[9px] text-gray-500">Paco (CPO)</span>
        </div>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
        <p className="text-[9px] text-pink-700">Template reutilisable pour tous les projets marketing. Reorganisez les blocs par glisser-deposer.</p>
      </div>

      {/* Template blocks */}
      <div className="space-y-2">
        {TEMPLATE_BLOCKS.map((block, i) => {
          const Icon = block.icon;
          return (
            <div key={block.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-pink-300 hover:shadow-sm transition-all cursor-pointer group">
              <GripVertical className="h-3.5 w-3.5 text-gray-300 group-hover:text-pink-400 shrink-0" />
              <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-pink-600" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-gray-800">Bloc {block.id}: {block.title}</p>
                <p className="text-[8px] text-gray-500">{block.desc}</p>
              </div>
              <span className="text-[8px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">Requis</span>
            </div>
          );
        })}
      </div>

      <button className="w-full border-2 border-dashed border-pink-300 rounded-xl p-3 text-[9px] text-pink-600 font-medium hover:bg-pink-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
        <Plus className="h-3.5 w-3.5" /> Ajouter un bloc personnalise
      </button>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="text-[9px] text-emerald-700 font-medium">Ce template sera disponible dans la bibliotheque pour tous les futurs projets marketing.</span>
      </div>
    </div>
  );
}

function ContentTableur() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Table2 className="h-4 w-4 text-teal-600" />
        <h3 className="text-sm font-bold text-gray-800">Tableur de suivi — Projections Q2</h3>
      </div>

      {/* Data table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-teal-50 border-b border-teal-200">
              {["Mois", "Leads", "CAC", "Conversion", "Revenue"].map(h => (
                <th key={h} className="text-[9px] font-bold text-teal-800 px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLEUR_DATA.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-teal-50/30 transition-colors">
                <td className="text-[9px] text-gray-700 px-3 py-2 font-medium">{row.mois}</td>
                <td className="text-[9px] px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-700">{row.leads}</span>
                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(row.leads / 95) * 100}%` }} />
                    </div>
                  </div>
                </td>
                <td className="text-[9px] text-gray-700 px-3 py-2">{row.cac}</td>
                <td className="text-[9px] text-gray-700 px-3 py-2">{row.conv}</td>
                <td className="text-[9px] text-gray-700 px-3 py-2 font-medium">{row.rev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trend summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Leads", trend: "+111%", dir: "up", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "CAC", trend: "-46%", dir: "down", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "Revenue", trend: "+111%", dir: "up", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
        ].map(t => (
          <div key={t.label} className={cn("border rounded-xl p-2.5 text-center", t.color)}>
            <p className="text-[9px] font-bold">{t.label}</p>
            <p className="text-sm font-extrabold">{t.trend}</p>
            <TrendingUp className={cn("h-3.5 w-3.5 mx-auto mt-0.5", t.dir === "down" ? "rotate-180" : "")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTimCode({ stage, codeStepActive }: { stage: Stage; codeStepActive: string }) {
  const codeStepOrder = ["plan", "code", "debug", "test", "done"];
  const activeIdx = codeStepOrder.indexOf(codeStepActive);

  const terminalContent = codeStepActive === "code" ? TIM_LIVE_CODE :
    codeStepActive === "debug" ? TIM_DEBUG_OUTPUT :
    codeStepActive === "test" ? TIM_TEST_OUTPUT : "";

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Code2 className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Tim Code — Chatbot AI Site Web</h3>
        <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium ml-auto">
          {codeStepActive === "done" ? "Termine" : `Etape: ${codeStepActive}`}
        </span>
      </div>

      {/* Pipeline steps */}
      <div className="flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5">
        {CODE_STEPS.map((step, i) => {
          const stepIdx = codeStepOrder.indexOf(step.id);
          const status = stepIdx < activeIdx ? "done" : stepIdx === activeIdx ? "active" : "pending";
          const StepIcon = step.icon;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-all",
                  status === "done" ? "bg-emerald-500 text-white" :
                  status === "active" ? "bg-violet-600 text-white scale-110" :
                  "bg-gray-200 text-gray-400"
                )}>
                  {status === "done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                </div>
                <span className={cn("text-[8px] font-medium",
                  status === "done" ? "text-emerald-700" :
                  status === "active" ? "text-violet-700 font-bold" :
                  "text-gray-400"
                )}>{step.label}</span>
              </div>
              {i < CODE_STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-1",
                  stepIdx < activeIdx ? "bg-emerald-400" :
                  stepIdx === activeIdx ? "bg-violet-300" :
                  "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-violet-200/50 rounded-full h-2 overflow-hidden">
          <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${(activeIdx / (codeStepOrder.length - 1)) * 100}%` }} />
        </div>
        <span className="text-[9px] font-bold text-violet-700">{activeIdx}/{codeStepOrder.length - 1}</span>
      </div>

      {/* LIVE Terminal — le WOW factor */}
      {terminalContent && <LiveTerminal content={terminalContent} speed={codeStepActive === "code" ? 8 : 15} />}

      {/* Empty state for intro */}
      {stage === "code-intro" && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <Terminal className="h-8 w-8 text-violet-300" />
          <p className="text-xs font-medium">Le terminal s'activera au prochain clic</p>
          <p className="text-[9px]">Tu vas voir Tim coder en temps reel</p>
        </div>
      )}

      {/* Test results summary (after tests) */}
      {activeIdx >= 3 && (
        <div className="grid grid-cols-4 gap-2">
          {["Init", "Message", "Stream", "Timeout"].map(t => (
            <div key={t} className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center">
              <p className="text-[9px] text-emerald-600 font-bold">{t}</p>
              <p className="text-[9px] font-bold text-emerald-800">PASSED</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentCristallisation({ sectionsFilled }: { sectionsFilled: number[] }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Cristallisation — Document complet</h3>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-auto">7 sections + code</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">Plan Marketing Q2 — Usine Bleue</p>
            <p className="text-[9px] text-gray-500 mt-0.5">Document strategique + code ChatWidget</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
          </div>
        </div>

        <div className="space-y-1.5">
          {[
            { title: "Document strategique (7 sections)", done: true, type: "doc", icon: FileText, color: "bg-amber-100 text-amber-700" },
            { title: "Budget & Finances", done: true, type: "budget", icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
            { title: "Pitch Deck (4 slides)", done: true, type: "presentation", icon: Presentation, color: "bg-blue-100 text-blue-700" },
            { title: "Template Lego (5 blocs)", done: true, type: "template", icon: Grid3X3, color: "bg-pink-100 text-pink-700" },
            { title: "Tableur de suivi Q2", done: true, type: "tableur", icon: Table2, color: "bg-teal-100 text-teal-700" },
            { title: "ChatWidget.tsx — Code Tim", done: true, type: "code", icon: Code2, color: "bg-violet-100 text-violet-700" },
          ].map((section, i) => {
            const Icon = section.icon;
            return (
            <div key={i} className="flex items-center gap-2 text-[9px] px-2 py-1.5 rounded-lg bg-white border border-gray-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="flex-1 text-gray-700">{section.title}</span>
              <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium", section.color)}>{section.type}</span>
            </div>
          );})}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: "100%" }} />
          </div>
          <span className="text-[9px] font-bold text-amber-700">100%</span>
        </div>
      </div>
    </div>
  );
}

function ContentCruncher() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Cruncher — Analyse financiere</h3>
        <div className="flex items-center gap-1 ml-auto">
          <BotAvatar code="CFOB" size="sm" />
          <span className="text-[9px] text-gray-500">Frank (CFO)</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Budget/mois", value: "3,800$", borderColor: "border-emerald-200", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
          { label: "ROI projete", value: "3.6x", borderColor: "border-blue-200", bgColor: "bg-blue-50", textColor: "text-blue-700" },
          { label: "CAC cible", value: "320$", borderColor: "border-violet-200", bgColor: "bg-violet-50", textColor: "text-violet-700" },
          { label: "Point mort", value: "Mois 4", borderColor: "border-amber-200", bgColor: "bg-amber-50", textColor: "text-amber-700" },
        ].map(kpi => (
          <div key={kpi.label} className={cn("rounded-xl border shadow-sm", kpi.borderColor)}>
            <div className={cn("px-3 py-2 rounded-t-xl", kpi.bgColor)}>
              <span className={cn("text-[9px] font-bold", kpi.textColor)}>{kpi.label}</span>
            </div>
            <div className="px-3 py-3 bg-white rounded-b-xl text-center">
              <p className={cn("text-lg font-extrabold", kpi.textColor)}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-[9px] font-bold text-gray-700 mb-2">Ventilation du budget mensuel</p>
        <div className="space-y-2">
          {[
            { label: "Programme referral", amount: "1,200$", pct: 31, color: "bg-pink-400" },
            { label: "Content LinkedIn", amount: "1,400$", pct: 37, color: "bg-blue-400" },
            { label: "Chatbot AI (maintenance)", amount: "400$", pct: 11, color: "bg-violet-400" },
            { label: "Email nurturing", amount: "800$", pct: 21, color: "bg-emerald-400" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-[9px] text-gray-700 w-36 shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
              </div>
              <span className="text-[9px] font-bold text-gray-700 w-14 text-right">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentRevue() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Revue collaborative — Votes de l'equipe</h3>
      </div>

      <div className="space-y-2">
        {[
          { code: "CFOB", name: "Frank", role: "CFO", vote: "POUR", reason: "Budget solide, ROI 3.6x valide par benchmark. Point mort a mois 4 = acceptable.", color: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
          { code: "CTOB", name: "Tim", role: "CTO", vote: "POUR (reserve)", reason: "Le code est pret mais la timeline est serree. Recommande un buffer de 2 semaines pour le chatbot.", color: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700" },
          { code: "CSOB", name: "Simone", role: "CSO", vote: "NUANCE", reason: "Le plan est bon mais il faut surveiller les concurrents SaaS bien finances. Prevoir un plan B si le referral demarre lentement.", color: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700" },
        ].map(review => (
          <div key={review.code} className={cn("border rounded-xl p-3 flex items-start gap-3", review.color)}>
            <BotAvatar code={review.code} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold text-gray-800">{review.name}</span>
                <span className="text-[8px] text-gray-500">{review.role}</span>
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold ml-auto", review.badge)}>{review.vote}</span>
              </div>
              <p className="text-[9px] text-gray-700">{review.reason}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-emerald-700">2</span>
          <span className="text-[9px] text-gray-500">pour</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-amber-700">1</span>
          <span className="text-[9px] text-gray-500">nuance</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-gray-400">0</span>
          <span className="text-[9px] text-gray-400">contre</span>
        </div>
        <span className="text-[9px] text-amber-700 font-medium ml-auto">→ Plan approuve avec reserves</span>
      </div>
    </div>
  );
}

function ContentChallengeFinal() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-gray-800">Challenge — Timeline et budget</h3>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[8px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">CHALLENGE</span>
          <span className="text-[9px] text-gray-500">Carl</span>
        </div>
        <p className="text-[9px] text-gray-700">S1-S10 c'est serre avec le chatbot en plus. On peut etaler?</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <BotAvatar code="CEOB" size="sm" />
          <span className="text-[8px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">DEFENSE</span>
        </div>
        <p className="text-[9px] text-gray-700">Tim confirme: le referral peut demarrer S1 sans risque, mais le chatbot AI necessite 2 semaines de test.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[8px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">RESOLUTION</span>
        </div>
        <p className="text-[9px] text-gray-700 font-medium">Etaler sur S1-S14 avec un checkpoint S7 pour valider les premiers resultats avant d'investir dans le nurturing.</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-1 bg-gray-200 rounded-full relative">
            <div className="absolute left-0 h-full w-[50%] bg-amber-400 rounded-full" />
            <div className="absolute left-[50%] top-[-4px] w-2 h-2 rounded-full bg-amber-600 border-2 border-white" />
            <div className="absolute left-[50%] top-[8px] text-[7px] text-amber-700 font-bold">S7</div>
          </div>
          <span className="text-[8px] text-gray-500">S1 → S14</span>
        </div>
      </div>
    </div>
  );
}

function ContentVITAA() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Scan VITAA</h3>
        <span className="text-[9px] text-amber-600 font-medium ml-auto">4/5 alignes</span>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-2">
        {VITAA_SCORES.map(v => (
          <div key={v.label} className="flex items-center gap-3">
            <span className="text-[9px] text-gray-700 w-36 shrink-0">{v.label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", v.color)} style={{ width: `${v.score}%` }} />
            </div>
            <span className={cn("text-[9px] font-bold", v.score >= 80 ? "text-emerald-700" : v.score >= 60 ? "text-amber-700" : "text-red-700")}>{v.score}%</span>
          </div>
        ))}
      </div>

      {VITAA_SCORES.some(v => v.score < 60) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-[9px] font-bold text-red-800">Budget en-dessous du seuil recommande</p>
            <p className="text-[8px] text-red-700 mt-0.5">3,800$/mois vs 5,000$ recommande — justification requise ou revision</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button className="text-[9px] bg-amber-600 text-white px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-amber-700">Justifier le budget</button>
        <button className="text-[9px] bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-amber-50">Reviser a la hausse</button>
        <button className="text-[9px] bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-amber-50">Voir les details</button>
      </div>
    </div>
  );
}

function ContentTransition() {
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300 rounded-xl px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          <ArrowRight className="h-5 w-5 text-emerald-600" />
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
            <Zap className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-sm font-bold text-emerald-800">Document valide — Pret pour Executer</p>
        <p className="text-xs text-emerald-600 mt-1">7 sections document + ChatWidget.tsx — 4 missions a creer</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-full font-bold cursor-pointer hover:bg-emerald-700">Passer en mode Executer</button>
          <button className="text-xs bg-white text-emerald-700 px-4 py-2 rounded-full font-bold border border-emerald-300 cursor-pointer hover:bg-emerald-50">Exporter le document</button>
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
        className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-amber-600 hover:bg-amber-700">
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
