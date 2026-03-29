/**
 * SimulationSprint1.tsx — Simulation interactive du Sprint 1
 * Split-screen permanent: Desktop / Tablette / Mobile
 * Carl valide visuellement AVANT qu'on code pour vrai
 */

import { useState } from "react";
import {
  Monitor, Tablet, Smartphone, MessageSquare, ChevronRight,
  Bot, Send, Zap, Brain, FileText, FolderKanban, CheckCircle2,
  ArrowLeft, Phone, Menu, User, LayoutDashboard, Home,
  Target, TrendingUp, AlertTriangle, Lightbulb,
} from "lucide-react";

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

const MOCK_MESSAGES = [
  { role: "assistant", agent: "CEOB", content: "Salut Carl! On travaille sur le chantier \"Refonte Site Web\". Le projet Design est en phase Atelier — les maquettes avancent bien. Tu veux qu'on regarde ça ensemble?" },
  { role: "user", content: "Oui montre-moi où on en est" },
  { role: "assistant", agent: "CEOB", content: "Le projet Design a 3 missions: Wireframes (✅ terminé), Maquettes Figma (🟡 en cours, 65%), et Intégration HTML (⬜ pas commencé). Mathilde a poussé 3 variantes de maquettes hier. Tu veux les challenger?" },
  { role: "user", content: "Oui fais venir Mathilde" },
  { role: "assistant", agent: "CMOB", content: "Salut Carl! J'ai 3 directions pour le hero banner: Option A (minimaliste), Option B (storytelling vidéo), Option C (interactive 3D). Mon recommandation: Option B — ça raconte notre histoire et les manufacturiers s'y reconnaissent." },
];

const MOCK_CHANTIERS = [
  { name: "Refonte Site Web", phase: "atelier", progress: 45, projets: 3, missions: 8 },
  { name: "Campagne LinkedIn Q2", phase: "reflexion", progress: 15, projets: 1, missions: 3 },
  { name: "Infrastructure Cloud", phase: "command", progress: 82, projets: 2, missions: 12 },
  { name: "Formation Équipe Ventes", phase: "reflexion", progress: 5, projets: 1, missions: 2 },
];

const MOCK_FEED = [
  { bot: "CTOB", name: "Tim", text: "Mission \"Refonte API\" complétée", time: "5 min", type: "done" },
  { bot: "CMOB", name: "Mathilde", text: "Brainstorm: 3 angles pour LinkedIn Q2", time: "12 min", type: "brainstorm" },
  { bot: "CEOB", name: "CarlOS", text: "COMMAND déployé: backup automatique", time: "1h", type: "command" },
  { bot: "CFOB", name: "Frank", text: "Alerte budget: poste marketing à 92%", time: "2h", type: "alert" },
];

const PHASE_COLORS = {
  reflexion: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Réflexion" },
  atelier: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "Atelier" },
  command: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Exécution" },
};

// ═══════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════

function PhaseBar({ phase }: { phase: keyof typeof PHASE_COLORS }) {
  const p = PHASE_COLORS[phase];
  return (
    <div className={`flex items-center gap-3 px-4 py-2 ${p.bg} border-b ${p.border}`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-xs font-bold text-gray-800">CarlOS</span>
      </div>
      <div className="flex items-center gap-1.5">
        {(["reflexion", "atelier", "command"] as const).map((ph, i) => {
          const isActive = ph === phase;
          const isPast = (["reflexion", "atelier", "command"] as const).indexOf(ph) < (["reflexion", "atelier", "command"] as const).indexOf(phase);
          const c = PHASE_COLORS[ph];
          return (
            <div key={ph} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${
                isActive ? `${c.bg} ${c.text} ring-1 ${c.border}` : isPast ? "bg-gray-100 text-gray-400" : "text-gray-300"
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

function MockChat({ compact = false, phase = "atelier" as keyof typeof PHASE_COLORS }) {
  const msgs = compact ? MOCK_MESSAGES.slice(0, 3) : MOCK_MESSAGES;
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {m.role === "assistant" && (
                <span className="text-[9px] font-bold text-blue-600 block mb-0.5">
                  {m.agent === "CMOB" ? "Mathilde (CMO)" : "CarlOS"}
                </span>
              )}
              {m.content}
            </div>
          </div>
        ))}
      </div>
      {/* Action buttons par phase */}
      <div className="px-3 py-1.5 border-t border-gray-100">
        <div className="flex gap-1.5 flex-wrap">
          {phase === "reflexion" && (
            <>
              <PhaseButton icon={Brain} label="Brainstorm" />
              <PhaseButton icon={Target} label="Analyser" />
              <PhaseButton icon={Zap} label="Challenger" />
            </>
          )}
          {phase === "atelier" && (
            <>
              <PhaseButton icon={FileText} label="Cristalliser" />
              <PhaseButton icon={Lightbulb} label="Synthétiser" />
              <PhaseButton icon={FolderKanban} label="Plan d'action" />
            </>
          )}
          {phase === "command" && (
            <>
              <PhaseButton icon={Zap} label="Exécuter" />
              <PhaseButton icon={Bot} label="Déléguer" />
              <PhaseButton icon={TrendingUp} label="Prochaine étape" />
            </>
          )}
        </div>
      </div>
      {/* Input */}
      <div className="px-3 py-2 border-t">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <input className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400" placeholder="Message à CarlOS..." readOnly />
          <Send className="h-3.5 w-3.5 text-gray-300" />
        </div>
      </div>
    </div>
  );
}

function PhaseButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-[9px] text-gray-600 font-medium transition-colors">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function MockContent({ view, onDrill }: { view: string; onDrill?: (v: string) => void }) {
  if (view === "chantiers") {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-800">Pipeline — Chantiers</span>
        </div>
        {MOCK_CHANTIERS.map((ch) => {
          const p = PHASE_COLORS[ch.phase as keyof typeof PHASE_COLORS];
          return (
            <div
              key={ch.name}
              onClick={() => onDrill?.("projet")}
              className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800">{ch.name}</span>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
                  {p.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[9px] text-gray-400 mb-2">
                <span>{ch.projets} projets</span>
                <span>{ch.missions} missions</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${ch.phase === "command" ? "bg-emerald-500" : ch.phase === "atelier" ? "bg-amber-500" : "bg-red-400"}`}
                  style={{ width: `${ch.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (view === "projet") {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-[9px] text-gray-400 mb-1">
          <button onClick={() => onDrill?.("chantiers")} className="hover:text-blue-600 cursor-pointer">Pipeline</button>
          <ChevronRight className="h-3.5 w-3.5" />
          <button onClick={() => onDrill?.("chantiers")} className="hover:text-blue-600 cursor-pointer">Refonte Site Web</button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-700 font-medium">Projet Design</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800">Projet Design</span>
            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Atelier</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full bg-amber-500" style={{ width: "65%" }} />
          </div>
          <div className="space-y-2">
            {[
              { name: "Wireframes", done: true, phase: "command" },
              { name: "Maquettes Figma", done: false, phase: "atelier", progress: 65 },
              { name: "Intégration HTML", done: false, phase: "reflexion", progress: 0 },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                {m.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                    m.phase === "atelier" ? "border-amber-400" : "border-gray-300"
                  }`} />
                )}
                <div className="flex-1">
                  <span className={`text-xs font-medium ${m.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{m.name}</span>
                  {!m.done && m.progress !== undefined && m.progress > 0 && (
                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${m.progress}%` }} />
                    </div>
                  )}
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard / feed
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Home className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-bold text-gray-800">Fil d'actualité</span>
      </div>
      {MOCK_FEED.map((item, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              item.bot === "CTOB" ? "bg-violet-600" : item.bot === "CMOB" ? "bg-pink-600" : item.bot === "CFOB" ? "bg-emerald-600" : "bg-blue-600"
            }`}>
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[9px] font-bold text-gray-700">{item.name}</span>
            <span className="text-[9px] text-gray-400 ml-auto">{item.time}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.type === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
            {item.type === "brainstorm" && <Brain className="h-3.5 w-3.5 text-violet-500 shrink-0" />}
            {item.type === "command" && <Zap className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
            {item.type === "alert" && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
            <span className="text-xs text-gray-600">{item.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// DESKTOP SIMULATION
// ═══════════════════════════════════════

function DesktopSim() {
  const [contentView, setContentView] = useState("feed");
  const [phase, setPhase] = useState<keyof typeof PHASE_COLORS>("atelier");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-gray-500">PHASE:</span>
        {(["reflexion", "atelier", "command"] as const).map((ph) => {
          const p = PHASE_COLORS[ph];
          return (
            <button
              key={ph}
              onClick={() => setPhase(ph)}
              className={`text-[9px] font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${
                phase === ph ? `${p.bg} ${p.text} ring-1 ${p.border}` : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          );
        })}
        <span className="text-[9px] text-gray-400 ml-2">← clique pour changer la phase</span>
      </div>

      {/* Simulated screen */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg" style={{ height: 520 }}>
        {/* TopBar simulation */}
        <div className="h-10 bg-gray-900 flex items-center px-3 gap-4">
          <span className="text-[9px] font-bold text-white">CarlOS</span>
          <div className="flex-1" />
          {["Mon Département", "Mes Salles", "Mon Équipe", "Mon Réseau"].map((n) => (
            <span key={n} className="text-[9px] text-white/60 hover:text-white/90 cursor-pointer">{n}</span>
          ))}
        </div>

        {/* Sub-nav */}
        <div className="h-8 bg-gray-50 border-b flex items-center px-3 gap-2">
          {["Vue d'ensemble", "Blueprint", "Pipeline", "Documents", "Diagnostics"].map((n) => (
            <button
              key={n}
              onClick={() => setContentView(n === "Pipeline" ? "chantiers" : "feed")}
              className={`text-[9px] px-2 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                (n === "Pipeline" && (contentView === "chantiers" || contentView === "projet"))
                  ? "bg-gray-900 text-white shadow-sm"
                  : n === "Vue d'ensemble" && contentView === "feed"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Phase bar */}
        <PhaseBar phase={phase} />

        {/* Split screen */}
        <div className="flex" style={{ height: 420 }}>
          {/* LEFT — Discussion 40% */}
          <div className="border-r border-gray-200" style={{ width: "40%" }}>
            <MockChat phase={phase} />
          </div>
          {/* RIGHT — Content 60% */}
          <div className="overflow-auto bg-gray-50" style={{ width: "60%" }}>
            <MockContent view={contentView} onDrill={setContentView} />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1">
        <p className="font-bold">Ce que tu vois:</p>
        <p>• <strong>Split permanent 40/60</strong> — Discussion à gauche, contenu à droite. Toujours.</p>
        <p>• <strong>Phase bar</strong> — Clique les boutons phase en haut pour voir le changement de couleur + boutons</p>
        <p>• <strong>Boutons dynamiques</strong> — Brainstorm en Réflexion, Cristalliser en Atelier, Exécuter en COMMAND</p>
        <p>• <strong>Drill-down</strong> — Clique "Pipeline" puis clique un chantier pour voir la cascade</p>
        <p>• <strong>Le chat reste</strong> — Quand tu navigues à droite, la discussion ne bouge pas</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TABLET SIMULATION
// ═══════════════════════════════════════

function TabletSim() {
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [contentView, setContentView] = useState("chantiers");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setChatCollapsed(!chatCollapsed)}
          className={`text-[9px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            chatCollapsed ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {chatCollapsed ? "Chat caché — cliquer pour montrer" : "Chat visible — cliquer pour cacher"}
        </button>
      </div>

      {/* Simulated tablet screen */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg mx-auto" style={{ height: 440, maxWidth: 700 }}>
        {/* TopBar */}
        <div className="h-9 bg-gray-900 flex items-center px-3 gap-3">
          <span className="text-[9px] font-bold text-white">CarlOS</span>
          <div className="flex-1" />
          {["Dept", "Salles", "Équipe", "Réseau"].map((n) => (
            <span key={n} className="text-[9px] text-white/60">{n}</span>
          ))}
        </div>

        <PhaseBar phase="atelier" />

        {/* Split */}
        <div className="flex" style={{ height: 370 }}>
          {!chatCollapsed && (
            <div className="border-r border-gray-200" style={{ width: "30%" }}>
              <MockChat compact phase="atelier" />
            </div>
          )}
          <div className="overflow-auto bg-gray-50 flex-1">
            <MockContent view={contentView} onDrill={setContentView} />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1">
        <p className="font-bold">Tablette (768-1023px):</p>
        <p>• <strong>Split 30/70</strong> — Chat plus compact mais toujours visible</p>
        <p>• <strong>Collapsible</strong> — Clique le bouton pour voir avec/sans chat</p>
        <p>• Quand le chat est caché, le contenu prend 100% — la mini-bulle apparaîtrait en bas</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MOBILE SIMULATION
// ═══════════════════════════════════════

function MobileSim() {
  const [mode, setMode] = useState<"content" | "chat">("content");
  const [contentView, setContentView] = useState("chantiers");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-gray-500">Simule le swipe:</span>
        <button
          onClick={() => setMode("content")}
          className={`text-[9px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            mode === "content" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Contenu
        </button>
        <button
          onClick={() => setMode("chat")}
          className={`text-[9px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            mode === "chat" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Discussion
        </button>
      </div>

      {/* Simulated phone screen */}
      <div className="border-2 border-gray-300 rounded-[24px] overflow-hidden shadow-xl mx-auto bg-white" style={{ width: 320, height: 580 }}>
        {/* Status bar fake */}
        <div className="h-6 bg-gray-900 flex items-center justify-between px-4">
          <span className="text-[9px] text-white/60">9:41</span>
          <span className="text-[9px] text-white/60">●●●</span>
        </div>

        {/* Header */}
        <div className="h-11 bg-white border-b flex items-center px-3 gap-2">
          <Menu className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-1.5 flex-1">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-gray-800">CarlOS</span>
          </div>
          <Phone className="h-4 w-4 text-blue-600" />
        </div>

        {/* Phase bar mobile */}
        <div className="h-7 bg-amber-50 border-b border-amber-200 flex items-center px-3 gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[9px] font-medium text-amber-700">Phase: Atelier</span>
          <div className="flex-1" />
          <span className="text-[9px] text-amber-600/50">Site Web</span>
        </div>

        {/* Main content area */}
        <div className="overflow-auto" style={{ height: 370 }}>
          {mode === "content" ? (
            <div>
              {/* Sub-nav mobile */}
              <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b overflow-x-auto">
                {["Aperçu", "Pipeline", "Documents"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setContentView(n === "Pipeline" ? "chantiers" : "feed")}
                    className={`text-[9px] px-2 py-1 rounded-md font-medium whitespace-nowrap cursor-pointer ${
                      (n === "Pipeline" && contentView === "chantiers") || (n === "Aperçu" && contentView === "feed")
                        ? "bg-gray-900 text-white" : "text-gray-500"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <MockContent view={contentView} onDrill={setContentView} />
            </div>
          ) : (
            <MockChat phase="atelier" />
          )}
        </div>

        {/* Mini-bulle CarlOS (visible en mode contenu) */}
        {mode === "content" && (
          <div
            onClick={() => setMode("chat")}
            className="h-10 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center px-3 gap-2 cursor-pointer hover:from-blue-700 hover:to-blue-600 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[9px] text-white truncate flex-1">"Les maquettes avancent bien. Tu veux les challenger?"</span>
            <MessageSquare className="h-3.5 w-3.5 text-white/60" />
          </div>
        )}

        {/* Back to content (en mode chat) */}
        {mode === "chat" && (
          <div
            onClick={() => setMode("content")}
            className="h-10 bg-gray-50 border-t flex items-center px-3 gap-2 cursor-pointer hover:bg-gray-100"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[9px] text-gray-500">Retour au contenu</span>
          </div>
        )}

        {/* Tab bar */}
        <div className="h-12 bg-white border-t flex items-center">
          {[
            { icon: LayoutDashboard, label: "Board", active: mode === "content" },
            { icon: MessageSquare, label: "Chat", active: mode === "chat" },
            { icon: Bot, label: "Bots", active: false },
            { icon: User, label: "Profil", active: false },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setMode(tab.label === "Chat" ? "chat" : "content")}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1 cursor-pointer ${
                tab.active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-[9px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1">
        <p className="font-bold">Mobile (&lt;768px):</p>
        <p>• <strong>Pas de split</strong> — Plein écran contenu OU plein écran chat</p>
        <p>• <strong>Mini-bulle bleue</strong> — CarlOS toujours visible en bas du contenu. Tap pour ouvrir le chat</p>
        <p>• <strong>Tab bar</strong> — "Board" = contenu, "Chat" = discussion. Toggle rapide</p>
        <p>• <strong>Phase bar compacte</strong> — Juste la couleur + label, pas de stepper</p>
        <p>• <strong>Le chat ne reset pas</strong> — Messages conservés même après retour au contenu</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════

export function SimulationSprint1() {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 text-white">
        <h2 className="text-lg font-bold mb-1">Simulation Sprint 1 — Split-Screen Permanent</h2>
        <p className="text-xs text-white/70">
          Valide visuellement AVANT qu'on code. Clique partout, change de phase, navigue dans le drill-down.
          Rien n'est connecté au backend — c'est du mock interactif.
        </p>
      </div>

      {/* Device picker — uses official sub-tab pattern */}
      <div className="flex items-center gap-2">
        {([
          { id: "desktop", icon: Monitor, label: "Desktop (≥1024px)" },
          { id: "tablet", icon: Tablet, label: "Tablette (768-1023px)" },
          { id: "mobile", icon: Smartphone, label: "Mobile (<768px)" },
        ] as const).map((d) => (
          <button
            key={d.id}
            onClick={() => setDevice(d.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
              device === d.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <d.icon className="h-3.5 w-3.5" />
            {d.label}
          </button>
        ))}
      </div>

      {/* Simulation */}
      {device === "desktop" && <DesktopSim />}
      {device === "tablet" && <TabletSim />}
      {device === "mobile" && <MobileSim />}
    </div>
  );
}
