/**
 * SimulationVideoS74.tsx — Simulations interactives du plan vidéo S74
 * 9 concepts: Carl navigue entre les tabs, voit le before/after, clique partout.
 * Pattern: SimulationSprint1.tsx — composant React dans l'app, mock interactif.
 */

import { useState } from "react";
import {
  Eye, ChevronRight, Bot, Send, Brain, FileText, FolderKanban,
  CheckCircle2, Home, Target, TrendingUp, AlertTriangle, Lightbulb,
  Zap, Search, Layers, MessageSquare, BarChart3,
  Shield, Flame, Star, Clock, X, ArrowLeft,
  User, Heart, Compass, BookOpen, Play, Lock,
} from "lucide-react";

// ═══════════════════════════════════════
// SHARED CONSTANTS
// ═══════════════════════════════════════

const UB_BLUE = "#073E5A";

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Réflexion", ring: "ring-red-200" },
  atelier: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "Atelier", ring: "ring-amber-200" },
  command: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "COMMAND", ring: "ring-emerald-200" },
};

type Phase = keyof typeof PHASE_COLORS;

const TABS = [
  { id: "layout", label: "1. Layout Actuel", icon: Eye },
  { id: "cascade", label: "2. Cascade", icon: Layers },
  { id: "phases", label: "3. Phases", icon: Flame },
  { id: "modal", label: "4. Modal Phase", icon: Target },
  { id: "feed", label: "5. Home Feed", icon: Home },
  { id: "blueprint", label: "6. Blueprint", icon: BookOpen },
  { id: "discussion", label: "7. Discussion", icon: MessageSquare },
  { id: "vitaa", label: "8. VITAA", icon: Shield },
  { id: "perso", label: "9. Perso", icon: User },
] as const;

type TabId = typeof TABS[number]["id"];

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

const MOCK_CHANTIERS = [
  { id: 1, name: "Refonte Site Web", phase: "atelier" as Phase, progress: 45, projets: 3, missions: 8, dept: "Marketing" },
  { id: 2, name: "Campagne LinkedIn Q2", phase: "reflexion" as Phase, progress: 15, projets: 1, missions: 3, dept: "Marketing" },
  { id: 3, name: "Infrastructure Cloud", phase: "command" as Phase, progress: 82, projets: 2, missions: 12, dept: "Technologie" },
  { id: 4, name: "Formation Ventes", phase: "reflexion" as Phase, progress: 5, projets: 1, missions: 2, dept: "Ventes" },
];

const MOCK_PROJETS = [
  { id: 1, chantierId: 1, name: "Design UI/UX", phase: "atelier" as Phase, progress: 65, missions: 3 },
  { id: 2, chantierId: 1, name: "Backend API", phase: "command" as Phase, progress: 90, missions: 4 },
  { id: 3, chantierId: 1, name: "Contenu Marketing", phase: "reflexion" as Phase, progress: 10, missions: 1 },
];

const MOCK_MISSIONS = [
  { id: 1, projetId: 1, name: "Wireframes", done: true, phase: "command" as Phase },
  { id: 2, projetId: 1, name: "Maquettes Figma", done: false, phase: "atelier" as Phase, progress: 65 },
  { id: 3, projetId: 1, name: "Intégration HTML", done: false, phase: "reflexion" as Phase, progress: 0 },
];

const MOCK_FEED_ITEMS = [
  { bot: "CTOB", name: "Tim", text: "Mission \"Refonte API\" complétée — déployé en staging", time: "5 min", type: "done" as const, icon: CheckCircle2 },
  { bot: "CMOB", name: "Mathilde", text: "Brainstorm: 3 angles pour la campagne LinkedIn Q2", time: "12 min", type: "brainstorm" as const, icon: Brain },
  { bot: "CEOB", name: "CarlOS", text: "Chantier \"Infrastructure Cloud\" passé en COMMAND", time: "1h", type: "command" as const, icon: Zap },
  { bot: "CFOB", name: "Frank", text: "Alerte budget: poste marketing Q2 à 92%", time: "2h", type: "alert" as const, icon: AlertTriangle },
  { bot: "CSOB", name: "Simone", text: "Analyse concurrentielle: 3 nouveaux entrants détectés", time: "3h", type: "insight" as const, icon: Search },
  { bot: "COOB", name: "Olivier", text: "Process onboarding mis à jour — 12 étapes → 8", time: "5h", type: "done" as const, icon: CheckCircle2 },
];

const MOCK_MESSAGES: Record<string, Array<{ role: string; agent?: string; content: string }>> = {
  home: [
    { role: "assistant", agent: "CEOB", content: "Salut Carl! Aujourd'hui: Tim a terminé la refonte API, Mathilde brainstorme sur LinkedIn Q2. Tu veux qu'on regarde un chantier en particulier?" },
    { role: "user", content: "Montre-moi où on en est sur le site web" },
    { role: "assistant", agent: "CEOB", content: "Le chantier \"Refonte Site Web\" est en phase Atelier (45%). Le design UI/UX avance bien — Mathilde a poussé 3 maquettes. Tu veux qu'on drill dedans?" },
  ],
  chantier: [
    { role: "assistant", agent: "CEOB", content: "On est dans le chantier \"Refonte Site Web\". 3 projets: Design UI/UX (65%, Atelier), Backend API (90%, COMMAND), Contenu Marketing (10%, Réflexion). Par où tu veux commencer?" },
    { role: "user", content: "Le design, fais venir Mathilde" },
    { role: "assistant", agent: "CMOB", content: "Salut Carl! Le projet Design a 3 missions: Wireframes ✅, Maquettes Figma (65%), Intégration HTML (pas commencé). J'ai 3 variantes de hero banner prêtes. Option B storytelling vidéo est ma recommandation." },
  ],
  projet: [
    { role: "assistant", agent: "CMOB", content: "On est dans le projet \"Design UI/UX\" — chantier Refonte Site Web. 3 missions en cours. Les wireframes sont terminés, les maquettes à 65%." },
    { role: "user", content: "Montre-moi les maquettes" },
    { role: "assistant", agent: "CMOB", content: "Option A: Minimaliste — hero sobre, typo grande. Option B: Storytelling vidéo — démo produit en boucle. Option C: Interactive 3D — modèle usine navigable. Mon choix: Option B, ça raconte notre histoire." },
  ],
};

const VITAA_CRITERIA = [
  { label: "Alignement Mission", score: 92, status: "ok" as const, detail: "Le chantier est directement lié à la mission principale de l'entreprise" },
  { label: "Cohérence Valeurs", score: 88, status: "ok" as const, detail: "Les approches proposées respectent les valeurs fondatrices" },
  { label: "Analyse SWOT", score: 65, status: "warn" as const, detail: "La menace concurrentielle n'est pas suffisamment adressée" },
  { label: "Piliers VITAA", score: 78, status: "ok" as const, detail: "4/5 piliers bien couverts — le pilier Temps mérite attention" },
  { label: "Blueprint enrichi", score: 45, status: "fail" as const, detail: "Les sections Risques et Plan B ne sont pas complétées" },
];

// ═══════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════

function SimScreen({ children, height = 480 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg" style={{ height }}>
      {children}
    </div>
  );
}

function SimTopBar({ nav, activeNav, onNavChange }: { nav: string[]; activeNav: string; onNavChange: (n: string) => void }) {
  return (
    <div className="h-10 flex items-center px-3 gap-4" style={{ backgroundColor: UB_BLUE }}>
      <span className="text-xs font-bold text-white tracking-wide">CarlOS</span>
      <div className="flex-1" />
      {nav.map((n) => (
        <button
          key={n}
          onClick={() => onNavChange(n)}
          className={`text-xs cursor-pointer transition-colors ${
            activeNav === n ? "text-white font-medium" : "text-white/50 hover:text-white/80"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function SimSubTabs({ tabs, active, onTabChange }: { tabs: string[]; active: string; onTabChange: (t: string) => void }) {
  return (
    <div className="h-8 bg-gray-50 border-b flex items-center px-3 gap-1.5 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onTabChange(t)}
          className={`text-[9px] px-2 py-1 rounded-md font-medium cursor-pointer transition-colors whitespace-nowrap ${
            active === t ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SimPhaseBar({ phase }: { phase: Phase }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-1.5 ${PHASE_COLORS[phase].bg} border-b ${PHASE_COLORS[phase].border}`}>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[9px] font-bold text-gray-800">CarlOS</span>
      </div>
      <div className="flex items-center gap-1">
        {(["reflexion", "atelier", "command"] as const).map((ph, i) => {
          const isActive = ph === phase;
          const isPast = (["reflexion", "atelier", "command"] as const).indexOf(ph) < (["reflexion", "atelier", "command"] as const).indexOf(phase);
          const c = PHASE_COLORS[ph];
          return (
            <div key={ph} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                isActive ? `${c.bg} ${c.text} ring-1 ${c.ring}` : isPast ? "bg-gray-100 text-gray-400" : "text-gray-300"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? c.dot : isPast ? "bg-gray-300" : "bg-gray-200"}`} />
                {c.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SimChat({ messages, phase = "atelier" as Phase, context = "" }: { messages: Array<{ role: string; agent?: string; content: string }>; phase?: Phase; context?: string }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-8 border-b flex items-center px-3 gap-2" style={{ backgroundColor: UB_BLUE }}>
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[9px] font-bold text-white">CarlOS</span>
        {context && <span className="text-[8px] text-white/50 ml-1">• {context}</span>}
      </div>
      <div className="flex-1 overflow-auto p-2.5 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mr-1.5 shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {m.role === "assistant" && m.agent && (
                <span className="text-[8px] font-bold text-blue-600 block mb-0.5">
                  {m.agent === "CMOB" ? "Mathilde (CMO)" : m.agent === "CTOB" ? "Tim (CTO)" : "CarlOS"}
                </span>
              )}
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="px-2.5 py-1 border-t border-gray-100">
        <div className="flex gap-1 flex-wrap">
          {phase === "reflexion" && <><ActionBtn icon={Brain} label="Brainstorm" /><ActionBtn icon={Search} label="Analyser" /><ActionBtn icon={Target} label="Challenger" /></>}
          {phase === "atelier" && <><ActionBtn icon={FileText} label="Cristalliser" /><ActionBtn icon={Lightbulb} label="Synthétiser" /><ActionBtn icon={FolderKanban} label="Plan d'action" /></>}
          {phase === "command" && <><ActionBtn icon={Zap} label="Exécuter" /><ActionBtn icon={Bot} label="Déléguer" /><ActionBtn icon={TrendingUp} label="Tracker" /></>}
        </div>
      </div>
      <div className="px-2.5 py-1.5 border-t">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
          <input className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" placeholder="Message à CarlOS..." readOnly />
          <Send className="h-3.5 w-3.5 text-gray-300" />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-[8px] text-gray-600 font-medium transition-colors cursor-pointer">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function SimBreadcrumb({ path, onNavigate }: { path: string[]; onNavigate: (idx: number) => void }) {
  return (
    <div className="h-7 bg-gray-50/80 border-b flex items-center px-3 gap-1">
      {path.map((p, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
          <button
            onClick={() => onNavigate(i)}
            className={`text-[9px] cursor-pointer transition-colors ${
              i === path.length - 1 ? "text-gray-800 font-medium" : "text-gray-400 hover:text-blue-600"
            }`}
          >
            {p}
          </button>
        </div>
      ))}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1 mt-4">
      {children}
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 1 — LAYOUT ACTUEL (Baseline)
// ═══════════════════════════════════════

function Sim01Layout() {
  const [deptTab, setDeptTab] = useState("Vue d'ensemble");

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">L'état actuel de l'app tel que tu le vois. Split-screen permanent: discussion à gauche, contenu à droite.</p>
      <SimScreen height={460}>
        <SimTopBar nav={["Mon Département", "Mes Salles", "Mon Équipe", "Mon Réseau"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimSubTabs tabs={["Vue d'ensemble", "Blueprint", "Santé", "Chantiers", "Projets", "Missions", "Tâches", "Documents"]} active={deptTab} onTabChange={setDeptTab} />
        <div className="flex" style={{ height: 380 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={MOCK_MESSAGES.home} context="Direction" />
          </div>
          <div className="overflow-auto bg-gray-50" style={{ width: "60%" }}>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[{ label: "Chantiers", value: "4", color: "text-blue-600" }, { label: "Projets", value: "7", color: "text-violet-600" }, { label: "Missions", value: "25", color: "text-amber-600" }, { label: "Tâches", value: "48", color: "text-emerald-600" }].map((k) => (
                  <div key={k.label} className="bg-white rounded-lg border p-2 text-center">
                    <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
                    <div className="text-[8px] text-gray-500">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">Chantiers actifs</div>
              {MOCK_CHANTIERS.map((ch) => {
                const p = PHASE_COLORS[ch.phase];
                return (
                  <div key={ch.id} className="bg-white border rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-800">{ch.name}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ch.phase === "command" ? "bg-emerald-500" : ch.phase === "atelier" ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${ch.progress}%` }} />
                    </div>
                    <div className="flex gap-3 mt-1 text-[8px] text-gray-400">
                      <span>{ch.projets} projets</span><span>{ch.missions} missions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Ce que tu vois (état actuel):</p>
        <p>• <strong>TopBar</strong> — Navigation principale (Mon Département, Mes Salles, etc.)</p>
        <p>• <strong>Sub-tabs</strong> — Sections du département (Vue d'ensemble, Blueprint, etc.)</p>
        <p>• <strong>Split 40/60</strong> — Discussion CarlOS à gauche, contenu à droite — PERMANENT</p>
        <p>• <strong>KPI + Chantiers</strong> — Dashboard avec résumé des activités</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 2 — NAVIGATION CASCADE
// ═══════════════════════════════════════

function Sim02Cascade() {
  const [drillLevel, setDrillLevel] = useState<"dept" | "chantier" | "projet" | "mission">("dept");
  const [breadcrumb, setBreadcrumb] = useState(["Direction"]);

  const drillTo = (level: "dept" | "chantier" | "projet" | "mission", label: string) => {
    setDrillLevel(level);
    if (level === "dept") setBreadcrumb(["Direction"]);
    else if (level === "chantier") setBreadcrumb(["Direction", label]);
    else if (level === "projet") setBreadcrumb(prev => [...prev.slice(0, 2), label]);
    else setBreadcrumb(prev => [...prev.slice(0, 3), label]);
  };

  const navigateBreadcrumb = (idx: number) => {
    const levels: Array<"dept" | "chantier" | "projet" | "mission"> = ["dept", "chantier", "projet", "mission"];
    setDrillLevel(levels[idx]);
    setBreadcrumb(prev => prev.slice(0, idx + 1));
  };

  const chatMessages = drillLevel === "dept" ? MOCK_MESSAGES.home : drillLevel === "chantier" ? MOCK_MESSAGES.chantier : MOCK_MESSAGES.projet;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Clique sur un chantier → projet → mission. Le breadcrumb se construit. Clique le breadcrumb pour remonter.</p>
      <SimScreen height={480}>
        <SimTopBar nav={["Mon Département", "Mes Salles", "Mon Équipe", "Mon Réseau"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimSubTabs
          tabs={["Vue d'ensemble", "Blueprint", "Chantiers", "Projets", "Missions", "Tâches"]}
          active={drillLevel === "dept" ? "Chantiers" : drillLevel === "chantier" ? "Projets" : drillLevel === "projet" ? "Missions" : "Tâches"}
          onTabChange={() => {}}
        />
        <SimBreadcrumb path={breadcrumb} onNavigate={navigateBreadcrumb} />
        <div className="flex" style={{ height: 365 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={chatMessages} context={breadcrumb[breadcrumb.length - 1]} />
          </div>
          <div className="overflow-auto bg-gray-50" style={{ width: "60%" }}>
            <div className="p-3 space-y-2">
              {drillLevel === "dept" && (
                <>
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-2">Chantiers — Direction</div>
                  {MOCK_CHANTIERS.map((ch) => {
                    const p = PHASE_COLORS[ch.phase];
                    return (
                      <div key={ch.id} onClick={() => drillTo("chantier", ch.name)} className="bg-white border rounded-lg p-2.5 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600">{ch.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400" />
                          </div>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ch.phase === "command" ? "bg-emerald-500" : ch.phase === "atelier" ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${ch.progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {drillLevel === "chantier" && (
                <>
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-2">Projets — {breadcrumb[1]}</div>
                  {MOCK_PROJETS.map((pr) => {
                    const p = PHASE_COLORS[pr.phase];
                    return (
                      <div key={pr.id} onClick={() => drillTo("projet", pr.name)} className="bg-white border rounded-lg p-2.5 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600">{pr.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400" />
                          </div>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pr.phase === "command" ? "bg-emerald-500" : pr.phase === "atelier" ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${pr.progress}%` }} />
                        </div>
                        <div className="text-[8px] text-gray-400 mt-1">{pr.missions} missions</div>
                      </div>
                    );
                  })}
                </>
              )}
              {drillLevel === "projet" && (
                <>
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-2">Missions — {breadcrumb[2]}</div>
                  {MOCK_MISSIONS.map((m) => {
                    const p = PHASE_COLORS[m.phase];
                    return (
                      <div key={m.id} onClick={() => drillTo("mission", m.name)} className="bg-white border rounded-lg p-2.5 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-center gap-2">
                          {m.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${m.phase === "atelier" ? "border-amber-400" : "border-gray-300"}`} />}
                          <div className="flex-1">
                            <span className={`text-xs font-medium ${m.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{m.name}</span>
                            {!m.done && m.progress !== undefined && m.progress > 0 && (
                              <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${m.progress}%` }} />
                              </div>
                            )}
                          </div>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400" />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {drillLevel === "mission" && (
                <div className="p-3 space-y-3">
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold text-gray-800">{breadcrumb[3]}</span>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">Atelier</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1.5">
                      <p>Assignée à: Mathilde (CMO)</p>
                      <p>Progression: 65%</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: "65%" }} />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">3 documents attachés • 12 messages • Dernière activité: il y a 2h</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Navigation cascade (poupées russes):</p>
        <p>• <strong>Clique un chantier</strong> → les projets apparaissent dans le même panel</p>
        <p>• <strong>Breadcrumb</strong> — Se construit à chaque drill-down. Clique pour remonter</p>
        <p>• <strong>Le chat suit</strong> — La discussion change de contexte à chaque niveau</p>
        <p>• <strong>Sub-tabs synchronisées</strong> — "Chantiers" → "Projets" → "Missions" se met à jour</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 3 — 3 PHASES VISUELLES
// ═══════════════════════════════════════

function Sim03Phases() {
  const [phase, setPhase] = useState<Phase>("reflexion");
  const p = PHASE_COLORS[phase];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Clique les boutons de phase pour voir le changement de couleur, de fond, et de boutons d'action.</p>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-gray-500">PHASE:</span>
        {(["reflexion", "atelier", "command"] as const).map((ph) => {
          const c = PHASE_COLORS[ph];
          return (
            <button key={ph} onClick={() => setPhase(ph)} className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${phase === ph ? `${c.bg} ${c.text} ring-1 ${c.ring}` : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
              {c.label}
            </button>
          );
        })}
      </div>
      <SimScreen height={480}>
        <SimTopBar nav={["Mon Département", "Mes Salles"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimSubTabs tabs={["Vue d'ensemble", "Blueprint", "Chantiers"]} active="Chantiers" onTabChange={() => {}} />
        <SimPhaseBar phase={phase} />
        <div className="flex" style={{ height: 370 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={MOCK_MESSAGES.chantier} phase={phase} context="Refonte Site Web" />
          </div>
          <div className={`overflow-auto ${p.bg}`} style={{ width: "60%" }}>
            <div className="p-3 space-y-2">
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-2">Chantiers actifs</div>
              {MOCK_CHANTIERS.map((ch) => {
                const cp = PHASE_COLORS[ch.phase];
                return (
                  <div key={ch.id} className={`bg-white/90 border rounded-lg p-2.5 ${ch.phase === phase ? `ring-2 ${p.ring}` : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-800">{ch.name}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${cp.bg} ${cp.text}`}>{cp.label}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ch.phase === "command" ? "bg-emerald-500" : ch.phase === "atelier" ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${ch.progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">3 Phases visuelles:</p>
        <p>• <strong>Réflexion (rouge)</strong> — Boutons: Brainstorm, Analyser, Challenger</p>
        <p>• <strong>Atelier (jaune)</strong> — Boutons: Cristalliser, Synthétiser, Plan d'action</p>
        <p>• <strong>COMMAND (vert)</strong> — Boutons: Exécuter, Déléguer, Tracker</p>
        <p>• <strong>Phase bar</strong> — Stepper Réflexion → Atelier → COMMAND en haut</p>
        <p>• <strong>Background tint + Ring</strong> — Le fond et les cards changent selon la phase</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 4 — MODAL CHOIX DE PHASE
// ═══════════════════════════════════════

function Sim04Modal() {
  const [popoverTarget, setPopoverTarget] = useState<number | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Clique un chantier → popover 3 choix. Options grisées si phase précédente pas complétée.</p>
      <SimScreen height={460}>
        <SimTopBar nav={["Mon Département"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimSubTabs tabs={["Chantiers"]} active="Chantiers" onTabChange={() => {}} />
        <div className="flex" style={{ height: 400 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={MOCK_MESSAGES.home} context="Direction" />
          </div>
          <div className="overflow-auto bg-gray-50 relative" style={{ width: "60%" }}>
            <div className="p-3 space-y-2">
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-2">Clique un chantier pour choisir la phase</div>
              {MOCK_CHANTIERS.map((ch, idx) => {
                const p = PHASE_COLORS[ch.phase];
                const isOpen = popoverTarget === idx;
                const phaseIdx = ["reflexion", "atelier", "command"].indexOf(ch.phase);
                return (
                  <div key={ch.id} className="relative">
                    <div onClick={() => setPopoverTarget(isOpen ? null : idx)} className={`bg-white border rounded-lg p-2.5 cursor-pointer transition-all ${isOpen ? "ring-2 ring-blue-300 shadow-md" : "hover:shadow-md"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-800">{ch.name}</span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${ch.phase === "command" ? "bg-emerald-500" : ch.phase === "atelier" ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${ch.progress}%` }} />
                      </div>
                    </div>
                    {isOpen && (
                      <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-52">
                        <div className="text-[8px] font-bold text-gray-400 uppercase px-2 mb-1.5">Ouvrir en mode...</div>
                        {([
                          { phase: "reflexion" as Phase, label: "Analyser", icon: Search, desc: "Mode Réflexion" },
                          { phase: "atelier" as Phase, label: "Construire", icon: Lightbulb, desc: "Mode Atelier" },
                          { phase: "command" as Phase, label: "Exécuter", icon: Play, desc: "Mode COMMAND" },
                        ]).map((opt, optIdx) => {
                          const c = PHASE_COLORS[opt.phase];
                          const isAvailable = optIdx <= phaseIdx;
                          const isLocked = optIdx > phaseIdx + 1;
                          return (
                            <button key={opt.phase} onClick={() => { if (!isLocked) { setSelectedPhase(`${ch.name} → ${opt.label}`); setPopoverTarget(null); }}} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${isAvailable ? "hover:bg-gray-50 cursor-pointer" : isLocked ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer opacity-60"}`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isAvailable ? c.bg : "bg-gray-100"}`}>
                                {isLocked ? <Lock className="h-3.5 w-3.5 text-gray-400" /> : <opt.icon className={`h-3.5 w-3.5 ${isAvailable ? c.text : "text-gray-400"}`} />}
                              </div>
                              <div>
                                <div className={`text-[9px] font-bold ${isAvailable ? "text-gray-800" : "text-gray-400"}`}>{opt.label}</div>
                                <div className="text-[8px] text-gray-400">{opt.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedPhase && (
              <div className="absolute bottom-2 left-2 right-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Navigation: {selectedPhase}
                <button onClick={() => setSelectedPhase(null)} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Modal de choix de phase:</p>
        <p>• <strong>Clic chantier</strong> → Popover 3 options (Analyser / Construire / Exécuter)</p>
        <p>• <strong>Options grisées</strong> — Pas de COMMAND sans Atelier terminé</p>
        <p>• <strong>Cadenas</strong> — Phase verrouillée si trop éloignée</p>
        <p>• <strong>Transition séquentielle</strong> obligatoire</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 5 — HOME FEED VIVANT
// ═══════════════════════════════════════

function Sim05Feed() {
  const [view, setView] = useState<"before" | "after">("after");
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">AVANT: Dashboard statique. APRÈS: Fil d'actualité dynamique — bots actifs, phases, docs.</p>
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setView("before")} className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${view === "before" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>AVANT</button>
        <button onClick={() => setView("after")} className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${view === "after" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>APRÈS</button>
      </div>
      <SimScreen height={480}>
        <SimTopBar nav={["Mon Département", "Mes Salles"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimSubTabs tabs={["Vue d'ensemble"]} active="Vue d'ensemble" onTabChange={() => {}} />
        <div className="flex" style={{ height: 410 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={MOCK_MESSAGES.home} context="Direction" />
          </div>
          <div className="overflow-auto bg-gray-50" style={{ width: "60%" }}>
            {view === "before" ? (
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "Chantiers", v: "4" }, { l: "Missions", v: "25" }, { l: "Tâches", v: "48" }].map((k) => (
                    <div key={k.l} className="bg-white rounded-lg border p-2 text-center"><div className="text-lg font-bold text-gray-600">{k.v}</div><div className="text-[8px] text-gray-500">{k.l}</div></div>
                  ))}
                </div>
                <div className="bg-white border rounded-lg p-3 text-center text-xs text-gray-400"><BarChart3 className="h-8 w-8 mx-auto text-gray-200 mb-1" />Graphique statique</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {["CarlOS", "Tim", "Mathilde", "Frank"].map((b) => (<div key={b} className="bg-white border rounded-lg p-2 text-center"><div className="w-6 h-6 rounded-full bg-gray-200 mx-auto mb-1" /><div className="text-[8px] text-gray-500">{b}</div></div>))}
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fil d'actualité
                </div>
                {MOCK_FEED_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white border rounded-lg p-2.5 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.bot === "CTOB" ? "bg-violet-600" : item.bot === "CMOB" ? "bg-pink-600" : item.bot === "CFOB" ? "bg-emerald-600" : item.bot === "CSOB" ? "bg-orange-600" : item.bot === "COOB" ? "bg-teal-600" : "bg-blue-600"}`}>
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-700">{item.name}</span>
                        <span className="text-[8px] text-gray-400 ml-auto">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-7">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${item.type === "done" ? "text-emerald-500" : item.type === "brainstorm" ? "text-violet-500" : item.type === "command" ? "text-emerald-500" : item.type === "alert" ? "text-amber-500" : "text-blue-500"}`} />
                        <span className="text-xs text-gray-600">{item.text}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="bg-white border rounded-lg p-2.5 mt-3">
                  <div className="text-[9px] font-bold text-gray-600 mb-2">Chantiers en cours</div>
                  {MOCK_CHANTIERS.slice(0, 3).map((ch) => {
                    const cp = PHASE_COLORS[ch.phase];
                    return (<div key={ch.id} className="flex items-center gap-2 py-1"><div className={`w-1.5 h-1.5 rounded-full ${cp.dot}`} /><span className="text-[9px] text-gray-700 flex-1">{ch.name}</span><div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${ch.phase === "command" ? "bg-emerald-500" : ch.phase === "atelier" ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${ch.progress}%` }} /></div><span className="text-[8px] text-gray-400">{ch.progress}%</span></div>);
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Home Feed Vivant (AVANT → APRÈS):</p>
        <p>• <strong>AVANT</strong> — KPI statiques + graphique mort + cards bots sans activité</p>
        <p>• <strong>APRÈS</strong> — Feed temps réel: qui fait quoi, missions complétées, alertes</p>
        <p>• <strong>Pastille verte</strong> — Indicateur "live" clignotant</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 6 — CHANTIER = BLUEPRINT
// ═══════════════════════════════════════

function Sim06Blueprint() {
  const [view, setView] = useState<"before" | "after">("after");
  const [activeSection, setActiveSection] = useState("objectifs");
  const tocSections = [
    { id: "objectifs", label: "Objectifs", phase: "command" as Phase },
    { id: "swot", label: "Analyse SWOT", phase: "atelier" as Phase },
    { id: "ressources", label: "Ressources", phase: "atelier" as Phase },
    { id: "risques", label: "Risques", phase: "reflexion" as Phase },
    { id: "plan-b", label: "Plan B", phase: "reflexion" as Phase },
    { id: "budget", label: "Budget", phase: "command" as Phase },
    { id: "timeline", label: "Timeline", phase: "atelier" as Phase },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">AVANT: Liste projets. APRÈS: Blueprint DocForge avec table des matières et sections éditables.</p>
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setView("before")} className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${view === "before" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>AVANT</button>
        <button onClick={() => setView("after")} className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${view === "after" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>APRÈS</button>
      </div>
      <SimScreen height={480}>
        <SimTopBar nav={["Mon Département"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimSubTabs tabs={["Blueprint"]} active="Blueprint" onTabChange={() => {}} />
        <SimBreadcrumb path={["Direction", "Refonte Site Web"]} onNavigate={() => {}} />
        <div className="flex" style={{ height: 380 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={MOCK_MESSAGES.chantier} phase="atelier" context="Blueprint — Refonte Site Web" />
          </div>
          <div className="overflow-auto bg-gray-50" style={{ width: "60%" }}>
            {view === "before" ? (
              <div className="p-3 space-y-2">
                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-2">Projets du chantier</div>
                {MOCK_PROJETS.map((pr) => (<div key={pr.id} className="bg-white border rounded-lg p-2.5"><span className="text-xs font-bold text-gray-800">{pr.name}</span><div className="text-[8px] text-gray-400 mt-0.5">{pr.missions} missions</div></div>))}
              </div>
            ) : (
              <div className="flex h-full">
                <div className="w-32 bg-white border-r p-2 space-y-0.5 shrink-0">
                  <div className="text-[8px] font-bold text-gray-400 uppercase mb-2 px-1">Sections</div>
                  {tocSections.map((s) => {
                    const p = PHASE_COLORS[s.phase];
                    return (<button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full text-left px-2 py-1 rounded-md text-[9px] transition-colors cursor-pointer flex items-center gap-1.5 ${activeSection === s.id ? "bg-gray-900 text-white font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${activeSection === s.id ? "bg-white" : p.dot}`} />{s.label}
                    </button>);
                  })}
                </div>
                <div className="flex-1 p-3">
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-800">{tocSections.find(s => s.id === activeSection)?.label}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${PHASE_COLORS[tocSections.find(s => s.id === activeSection)?.phase || "reflexion"].bg} ${PHASE_COLORS[tocSections.find(s => s.id === activeSection)?.phase || "reflexion"].text}`}>
                        {PHASE_COLORS[tocSections.find(s => s.id === activeSection)?.phase || "reflexion"].label}
                      </span>
                    </div>
                    {activeSection === "objectifs" && (
                      <div className="text-xs text-gray-600 space-y-2">
                        <p>• Augmenter le taux de conversion de 2.1% → 3.5% en 6 mois</p>
                        <p>• Réduire le temps de chargement sous 2 secondes</p>
                        <p>• Intégrer le catalogue produits avec l'API Orbit9</p>
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-md text-[9px] text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Section complétée</div>
                      </div>
                    )}
                    {activeSection === "swot" && (
                      <div className="text-xs text-gray-600 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-emerald-50 rounded-md p-2"><div className="text-[8px] font-bold text-emerald-700 mb-1">Forces</div><p className="text-[9px]">Expertise technique, réseau 130+ manufacturiers</p></div>
                          <div className="bg-red-50 rounded-md p-2"><div className="text-[8px] font-bold text-red-700 mb-1">Faiblesses</div><p className="text-[9px]">Site actuel vieillissant, SEO faible</p></div>
                          <div className="bg-blue-50 rounded-md p-2"><div className="text-[8px] font-bold text-blue-700 mb-1">Opportunités</div><p className="text-[9px]">IA en demande, peu de compétiteurs directs</p></div>
                          <div className="bg-amber-50 rounded-md p-2"><div className="text-[8px] font-bold text-amber-700 mb-1">Menaces</div><p className="text-[9px]">3 nouveaux entrants détectés</p></div>
                        </div>
                        <button className="w-full mt-1 text-[9px] text-blue-600 font-medium flex items-center gap-1 justify-center py-1 border border-blue-100 rounded-md bg-blue-50/50"><MessageSquare className="h-3.5 w-3.5" /> Compléter avec CarlOS</button>
                      </div>
                    )}
                    {activeSection !== "objectifs" && activeSection !== "swot" && (
                      <div className="text-xs text-gray-400 italic py-4 text-center">
                        <FileText className="h-5 w-5 mx-auto text-gray-200 mb-1" />Section à remplir via CarlOS
                        <button className="block mx-auto mt-2 text-[9px] text-blue-600 font-medium">Ouvrir en Atelier →</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Chantier = Blueprint DocForge:</p>
        <p>• <strong>AVANT</strong> — Simple liste de projets</p>
        <p>• <strong>APRÈS</strong> — TOC à gauche + sections éditables à droite + phase par section</p>
        <p>• <strong>Bouton "Compléter avec CarlOS"</strong> — Guide pour remplir chaque section</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 7 — DISCUSSION CONTEXTUELLE
// ═══════════════════════════════════════

function Sim07Discussion() {
  const [context, setContext] = useState<"home" | "chantier" | "projet">("home");
  const contextLabels = { home: "Direction (général)", chantier: "Refonte Site Web", projet: "Design UI/UX" };
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Clique les boutons — la discussion change automatiquement de contexte. L'historique persiste.</p>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-gray-500">Naviguer vers:</span>
        {(["home", "chantier", "projet"] as const).map((c) => (
          <button key={c} onClick={() => setContext(c)} className={`text-xs font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${context === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {c === "home" ? "Home" : c === "chantier" ? "Chantier" : "Projet"}
          </button>
        ))}
      </div>
      <SimScreen height={460}>
        <SimTopBar nav={["Mon Département"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimSubTabs tabs={context === "home" ? ["Vue d'ensemble"] : context === "chantier" ? ["Chantiers"] : ["Missions"]} active={context === "home" ? "Vue d'ensemble" : context === "chantier" ? "Chantiers" : "Missions"} onTabChange={() => {}} />
        <div className="flex" style={{ height: 390 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <div className="px-2.5 py-1 bg-blue-50 border-b border-blue-100 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[9px] font-medium text-blue-700">Discussion: {contextLabels[context]}</span>
              {context !== "home" && <span className="text-[8px] text-blue-400 ml-auto">Historique conservé</span>}
            </div>
            <SimChat messages={MOCK_MESSAGES[context]} context={contextLabels[context]} />
          </div>
          <div className="overflow-auto bg-gray-50" style={{ width: "60%" }}>
            <div className="p-3">
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-2">
                  {context === "home" && "🏠 Vue d'ensemble — Dashboard général"}
                  {context === "chantier" && "📁 Chantier: Refonte Site Web"}
                  {context === "projet" && "📋 Projet: Design UI/UX"}
                </div>
                <div className="text-[9px] text-gray-400">Le contenu change ici. La discussion à gauche suit automatiquement.</div>
              </div>
            </div>
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Discussion contextuelle:</p>
        <p>• <strong>Home → Chantier → Projet</strong> — Le chat change automatiquement</p>
        <p>• <strong>Indicateur bleu</strong> — Montre dans quelle discussion on est</p>
        <p>• <strong>Historique persiste</strong> — Les messages restent quand on revient</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 8 — SCAN VITAA
// ═══════════════════════════════════════

function Sim08Vitaa() {
  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);
  const passed = VITAA_CRITERIA.filter(c => c.status === "ok").length;
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Fin de l'Atelier → CarlOS lance un scan VITAA pour valider avant le passage en COMMAND.</p>
      <button onClick={() => { setShowModal(true); setDecision(null); }} className="text-xs font-medium px-4 py-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 cursor-pointer transition-colors">Lancer le Scan VITAA →</button>
      <SimScreen height={460}>
        <SimTopBar nav={["Mon Département"]} activeNav="Mon Département" onNavChange={() => {}} />
        <SimPhaseBar phase="atelier" />
        <div className="flex relative" style={{ height: 410 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={[
              { role: "assistant", agent: "CEOB", content: "La phase Atelier du chantier \"Refonte Site Web\" est terminée. Je lance le scan VITAA." },
              { role: "user", content: "OK vas-y" },
              ...(decision ? [{ role: "assistant" as const, agent: "CEOB", content: decision === "continue" ? "Scan validé! On passe en COMMAND. Tim et Mathilde sont notifiés." : "Retour en Atelier. Brainstorm risques schedulé avec Simone." }] : []),
            ]} phase="atelier" context="Scan VITAA" />
          </div>
          <div className="overflow-auto bg-gray-50 relative" style={{ width: "60%" }}>
            {showModal && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-4 bg-black/20">
                <div className="bg-white rounded-xl shadow-2xl border w-[90%] max-w-sm">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl px-4 py-2.5 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">Scan VITAA</span>
                    <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full ml-auto">{passed}/{VITAA_CRITERIA.length} OK</span>
                  </div>
                  <div className="p-3 space-y-2">
                    {VITAA_CRITERIA.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${c.status === "ok" ? "bg-emerald-100" : c.status === "warn" ? "bg-amber-100" : "bg-red-100"}`}>
                          {c.status === "ok" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          {c.status === "warn" && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                          {c.status === "fail" && <X className="h-3.5 w-3.5 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-gray-800">{c.label}</span><span className={`text-[9px] font-bold ${c.score >= 80 ? "text-emerald-600" : c.score >= 60 ? "text-amber-600" : "text-red-600"}`}>{c.score}%</span></div>
                          <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${c.score >= 80 ? "bg-emerald-500" : c.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${c.score}%` }} /></div>
                          <p className="text-[8px] text-gray-500 mt-0.5">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2.5 border-t flex gap-2">
                    <button onClick={() => { setDecision("revise"); setShowModal(false); }} className="flex-1 text-[9px] font-medium py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 cursor-pointer">Réviser en Atelier</button>
                    <button onClick={() => { setDecision("continue"); setShowModal(false); }} className="flex-1 text-[9px] font-medium py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">Justifier et continuer →</button>
                  </div>
                </div>
              </div>
            )}
            {!showModal && !decision && (<div className="p-3 text-center text-xs text-gray-400 pt-12"><Shield className="h-8 w-8 mx-auto text-gray-200 mb-2" />Clique "Lancer le Scan VITAA"</div>)}
            {decision && (
              <div className={`p-3 text-center text-xs pt-8 ${decision === "continue" ? "text-emerald-600" : "text-amber-600"}`}>
                {decision === "continue" ? (<><Zap className="h-8 w-8 mx-auto text-emerald-400 mb-2" /><p className="font-bold">Passage en COMMAND confirmé!</p></>) : (<><ArrowLeft className="h-8 w-8 mx-auto text-amber-400 mb-2" /><p className="font-bold">Retour en Atelier</p></>)}
              </div>
            )}
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Scan VITAA Post-Atelier:</p>
        <p>• <strong>5 critères</strong> — Alignement, Valeurs, SWOT, Piliers, Blueprint</p>
        <p>• <strong>Scores visuels</strong> — ✅ / ⚠️ / ❌ + progress bars</p>
        <p>• <strong>2 choix</strong> — "Justifier et continuer" ou "Réviser en Atelier"</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// SIM 9 — BLUEPRINT PERSONNEL
// ═══════════════════════════════════════

function Sim09Personnel() {
  const [activeSection, setActiveSection] = useState("pourquoi");
  const sections = [
    { id: "pourquoi", label: "Mon Pourquoi", icon: Heart, filled: true },
    { id: "mission", label: "Ma Mission", icon: Target, filled: true },
    { id: "valeurs", label: "Mes Valeurs", icon: Star, filled: false },
    { id: "forces", label: "Mes Forces", icon: Zap, filled: false },
    { id: "objectifs", label: "Mes Objectifs", icon: Compass, filled: false },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Blueprint personnel: ton profil comme dirigeant. Sections remplies via discussion CarlOS.</p>
      <SimScreen height={480}>
        <SimTopBar nav={["Mon Bureau"]} activeNav="Mon Bureau" onNavChange={() => {}} />
        <SimSubTabs tabs={["Mon Blueprint"]} active="Mon Blueprint" onTabChange={() => {}} />
        <div className="flex" style={{ height: 410 }}>
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <SimChat messages={[
              { role: "assistant", agent: "CEOB", content: activeSection === "pourquoi" ? "Carl, parlons de ton Pourquoi. Qu'est-ce qui te drive le matin?" : activeSection === "mission" ? "Ta mission — en une phrase, c'est quoi l'impact que tu veux avoir?" : "Cette section est à remplir. Dis-moi quand tu veux qu'on en parle!" },
              ...(activeSection === "pourquoi" ? [
                { role: "user", content: "Je veux aider les PME manufacturières à se transformer avec l'IA" },
                { role: "assistant", agent: "CEOB", content: "Puissant. 26 ans d'entrepreneuriat, le REAI, 130+ manufacturiers... Ton Pourquoi c'est la démocratisation de l'IA. Je note ça dans ton Blueprint." },
              ] : []),
            ]} phase="atelier" context={`Blueprint — ${sections.find(s => s.id === activeSection)?.label}`} />
          </div>
          <div className="overflow-auto bg-gray-50" style={{ width: "60%" }}>
            <div className="flex h-full">
              <div className="w-36 bg-white border-r p-2 space-y-0.5 shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center"><User className="h-4 w-4 text-white" /></div>
                  <div><div className="text-[9px] font-bold text-gray-800">Carl Fugère</div><div className="text-[8px] text-gray-400">CEO — Usine Bleue</div></div>
                </div>
                <div className="text-[8px] font-bold text-gray-400 uppercase mb-1 px-1">Sections</div>
                {sections.map((s) => (
                  <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full text-left px-2 py-1.5 rounded-md text-[9px] transition-colors cursor-pointer flex items-center gap-1.5 ${activeSection === s.id ? "bg-gray-900 text-white font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                    <s.icon className={`h-3.5 w-3.5 ${activeSection === s.id ? "text-white" : s.filled ? "text-emerald-500" : "text-gray-300"}`} />{s.label}
                    {s.filled && activeSection !== s.id && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
                  </button>
                ))}
                <div className="mt-3 px-1"><div className="text-[8px] text-gray-400 mb-1">Complété: 2/5</div><div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "40%" }} /></div></div>
              </div>
              <div className="flex-1 p-3">
                {sections.find(s => s.id === activeSection)?.filled ? (
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => { const Icon = sections.find(s => s.id === activeSection)!.icon; return <Icon className="h-4 w-4 text-blue-600" />; })()}
                      <span className="text-xs font-bold text-gray-800">{sections.find(s => s.id === activeSection)?.label}</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full ml-auto">Complété</span>
                    </div>
                    {activeSection === "pourquoi" && (
                      <div className="text-xs text-gray-600 space-y-2">
                        <p className="italic border-l-2 border-blue-300 pl-2">"Démocratiser l'IA pour les PME manufacturières qui font de vrais produits."</p>
                        <p>26 ans d'entrepreneuriat. 7 entreprises. 50M+ en ventes. Le REAI avec 130+ manufacturiers.</p>
                      </div>
                    )}
                    {activeSection === "mission" && (
                      <div className="text-xs text-gray-600 space-y-2">
                        <p className="italic border-l-2 border-blue-300 pl-2">"Construire un écosystème IA qui fait gagner du temps et de l'argent aux manufacturiers québécois."</p>
                        <p>CarlOS + GhostX = le CEO bot qui comprend la réalité terrain.</p>
                      </div>
                    )}
                    <button className="mt-3 text-[9px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Modifier via CarlOS</button>
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-6 w-6 mx-auto text-gray-200 mb-2" />
                    <p className="text-xs text-gray-500 mb-2">Section à remplir</p>
                    <button className="text-[9px] font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 cursor-pointer flex items-center gap-1 mx-auto"><MessageSquare className="h-3.5 w-3.5" /> Remplir avec CarlOS</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SimScreen>
      <InfoBox>
        <p className="font-bold">Blueprint Personnel:</p>
        <p>• <strong>5 sections</strong> — Pourquoi, Mission, Valeurs, Forces, Objectifs</p>
        <p>• <strong>Remplissage via CarlOS</strong> — Discussion guidée pour chaque section</p>
        <p>• <strong>Progression 2/5</strong> — Progress bar visible</p>
      </InfoBox>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════

export function SimulationVideoS74() {
  const [activeTab, setActiveTab] = useState<TabId>("layout");

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">Simulations Plan Vidéo S74</h2>
            <p className="text-xs text-white/60">Valide visuellement AVANT qu'on code. Clique partout, tout est interactif.</p>
          </div>
        </div>
      </div>
      <div className="bg-white border-b px-3 py-2 flex gap-1 overflow-x-auto shrink-0">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors whitespace-nowrap ${activeTab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-4 pb-12">
          {activeTab === "layout" && <Sim01Layout />}
          {activeTab === "cascade" && <Sim02Cascade />}
          {activeTab === "phases" && <Sim03Phases />}
          {activeTab === "modal" && <Sim04Modal />}
          {activeTab === "feed" && <Sim05Feed />}
          {activeTab === "blueprint" && <Sim06Blueprint />}
          {activeTab === "discussion" && <Sim07Discussion />}
          {activeTab === "vitaa" && <Sim08Vitaa />}
          {activeTab === "perso" && <Sim09Personnel />}
        </div>
      </div>
    </div>
  );
}
