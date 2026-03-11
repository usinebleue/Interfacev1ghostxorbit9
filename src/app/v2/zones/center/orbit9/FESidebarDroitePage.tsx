/**
 * FESidebarDroitePage.tsx — FE.8 Console Droite (Sidebar Droit V6)
 * Modelisation visuelle du nouveau sidebar droit
 * CarlOS Premier Contact → hooks contextuels → canvas pour approfondir
 * Session 51
 */

import { useState } from "react";
import {
  PanelRight,
  Video,
  Activity,
  MessageSquare,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Target,
  ArrowRight,
  ChevronRight,
  X,
  Mic,
  Send,
  Paperclip,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// WIREFRAME COMPONENTS
// ================================================================

function WireframeHook({ type, message, action }: {
  type: "greeting" | "suggestion" | "alert" | "nudge" | "insight";
  message: string;
  action?: string;
}) {
  const cfg = {
    greeting:   { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
    suggestion: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
    alert:      { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
    nudge:      { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", dot: "bg-violet-500" },
    insight:    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  }[type];
  return (
    <div className={cn("rounded-lg border p-2 flex items-start gap-2", cfg.bg, cfg.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full mt-1 shrink-0", cfg.dot)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-[9px] leading-relaxed", cfg.text)}>{message}</p>
        {action && (
          <div className={cn("mt-1 flex items-center gap-1 text-[9px] font-bold", cfg.text)}>
            {action} <ArrowRight className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <X className="h-3.5 w-3.5 text-gray-300 shrink-0" />
    </div>
  );
}

// ================================================================
// PAGE PRINCIPALE
// ================================================================

export function FESidebarDroitePage() {
  const { setActiveView } = useFrameMaster();
  const [activeSection, setActiveSection] = useState<string>("overview");

  const SECTIONS = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "layout", label: "Layout V6" },
    { id: "hooks", label: "CarlOS Hooks" },
    { id: "flow", label: "Flow Utilisateur" },
    { id: "collapsed", label: "Mode Collapse" },
  ];

  return (
    <PageLayout
      maxWidth="5xl"
      showPresence={false}
      header={
        <PageHeader
          icon={PanelRight}
          iconColor="text-indigo-600"
          title="FE.8 Console Droite"
          subtitle="Sidebar Droit V6 — CarlOS Premier Contact"
          onBack={() => setActiveView("master-bible-live")}
          rightSlot={
            <div className="flex items-center gap-1 flex-wrap">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-colors",
                    activeSection === s.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          }
        />
      }
    >
      {activeSection === "overview" && <SectionOverview />}
      {activeSection === "layout" && <SectionLayout />}
      {activeSection === "hooks" && <SectionHooks />}
      {activeSection === "flow" && <SectionFlow />}
      {activeSection === "collapsed" && <SectionCollapsed />}
    </PageLayout>
  );
}

// ================================================================
// VUE D'ENSEMBLE
// ================================================================

function SectionOverview() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-0 overflow-hidden border border-gray-200">
          <div className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-400">
            <span className="text-sm font-bold text-white">AVANT — Sidebar V5</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="rounded border border-green-200 bg-green-50 px-3 py-1.5 text-[9px] text-green-700 font-bold">1. CarlOS Pulse</div>
            <div className="rounded border border-purple-200 bg-purple-50 px-3 py-2 text-[9px] text-purple-700 font-bold">2. Video / Voice Widget</div>
            <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
            <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-[9px] text-blue-700 font-bold">3. InputBar (chatbox + 3 boutons)</div>
            <div className="h-[1px] bg-gray-200" />
            <div className="rounded border-2 border-red-300 bg-red-50 px-3 py-6 text-center">
              <span className="text-xs font-bold text-red-600">4. DiscussionsPanel</span>
              <div className="mt-2 space-y-1">
                <div className="text-[9px] text-red-500">Tab Discussions | Tab Missions | Tab Chantiers</div>
                <div className="text-[9px] text-red-400 font-bold mt-1">RETIRE — CarlOS = GPS</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden border-2 border-emerald-300">
          <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <span className="text-sm font-bold text-white">APRES — Sidebar V6 (ACTIF)</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="rounded border border-green-200 bg-green-50 px-3 py-1.5 text-[9px] text-green-700 font-bold">1. CarlOS Pulse (alertes)</div>
            <div className="rounded border border-purple-200 bg-purple-50 px-3 py-2 text-[9px] text-purple-700 font-bold">2. Video / Voice Widget</div>
            <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
            <div className="rounded border-2 border-emerald-300 bg-emerald-50 px-3 py-6 text-center">
              <span className="text-xs font-bold text-emerald-700">3. CarlOS Hooks — NOUVEAU</span>
              <div className="mt-2 space-y-1">
                <div className="text-[9px] text-emerald-600">Premier contact contextuel</div>
                <div className="text-[9px] text-emerald-500 font-bold">Si plus profond → canvas</div>
              </div>
            </div>
            <div className="h-[1px] bg-gray-200" />
            <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-[9px] text-blue-700 font-bold">4. InputBar — EN BAS</div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border border-indigo-200">
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-600 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Philosophie — CarlOS = GPS</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Premier Contact", desc: "Messages courts et contextuels. Pas de longs threads — juste le hook initial.", color: "blue", icon: MessageSquare },
            { title: "Contextuel", desc: "Les hooks changent selon la vue active. CarlOS sait ou vous etes.", color: "violet", icon: Target },
            { title: "Escalade Canvas", desc: "Discussion approfondie → canvas central avec bots specialistes.", color: "emerald", icon: ArrowRight },
          ].map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className={cn("p-3 rounded-lg border", `border-${p.color}-200 bg-${p.color}-50`)}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("h-4 w-4", `text-${p.color}-600`)} />
                  <span className={cn("text-xs font-bold", `text-${p.color}-700`)}>{p.title}</span>
                </div>
                <p className="text-[9px] text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border border-gray-200">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700">
          <span className="text-sm font-bold text-white">5 Types de Hooks</span>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: "Greeting", desc: "Accueil", color: "blue" },
            { label: "Suggestion", desc: "Idees", color: "amber" },
            { label: "Alerte", desc: "Urgences", color: "red" },
            { label: "Nudge", desc: "Rappels", color: "violet" },
            { label: "Insight", desc: "Tendances", color: "emerald" },
          ].map((t) => (
            <div key={t.label} className={cn("p-3 rounded-lg border text-center", `border-${t.color}-200 bg-${t.color}-50`)}>
              <div className={cn("w-3.5 h-3.5 rounded-full mx-auto mb-2", `bg-${t.color}-500`)} />
              <div className={cn("text-xs font-bold", `text-${t.color}-700`)}>{t.label}</div>
              <div className="text-[9px] text-gray-500 mt-1">{t.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// LAYOUT V6 — Wireframe complet
// ================================================================

function SectionLayout() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card className="p-0 overflow-hidden border-2 border-gray-300">
            <div className="px-3 py-1.5 bg-gray-800 text-[9px] font-bold text-white text-center">
              SIDEBAR DROIT — 22% (~280px)
            </div>
            <div className="bg-white flex flex-col" style={{ minHeight: 600 }}>
              <div className="px-3 py-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[9px] text-gray-500">Tout est calme</span>
                </div>
              </div>
              <div className="mx-3 shrink-0">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
                  <div className="aspect-video flex items-center justify-center relative">
                    <Video className="h-8 w-8 text-gray-600" />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded px-2 py-1">
                      <div className="text-[8px] text-white font-bold">CarlOS</div>
                      <div className="text-[7px] text-white/60">CEO — Agent AI</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[8px] text-gray-500">A l'ecoute</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 bg-blue-500 rounded text-[7px] text-white font-bold">Discuter</span>
                      <span className="px-2 py-0.5 bg-green-500 rounded text-[7px] text-white font-bold">Visio</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mx-3 my-1.5 shrink-0" />
              <div className="flex-1 min-h-0 overflow-auto mx-3 space-y-1.5 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                  <span className="text-[8px] font-bold text-gray-400 uppercase">CarlOS — Premier contact</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <WireframeHook type="greeting" message="Bonjour! Vos KPIs sont stables." />
                <WireframeHook type="alert" message="Discussion qui traine depuis 3 jours." action="Resoudre" />
                <WireframeHook type="suggestion" message="3 discussions → missions. On qualifie?" action="Voir" />
                <WireframeHook type="insight" message="Ventes +12%. Sophie a des recommandations." action="Voir" />
                <WireframeHook type="nudge" message="Audit securite en attente d'assignation." action="Assigner" />
                <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-dashed border-blue-200 bg-blue-50/50">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[8px] text-blue-500 flex-1">Discussion approfondie...</span>
                  <ChevronRight className="h-3.5 w-3.5 text-blue-300" />
                </div>
              </div>
              <div className="h-[1px] bg-gray-200 mx-3 shrink-0" />
              <div className="shrink-0 mx-3 my-1.5">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-white">
                    <div className="text-[8px] text-gray-300">Exprime une tension...</div>
                  </div>
                  <div className="flex border-t border-gray-100">
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[8px] font-bold text-white bg-blue-500">
                      <Send className="h-3.5 w-3.5" /> Envoyer
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[8px] font-bold text-gray-500 border-l border-gray-100">
                      <Mic className="h-3.5 w-3.5" /> Vocal
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[8px] font-bold text-gray-500 border-l border-gray-100">
                      <Paperclip className="h-3.5 w-3.5" /> Fichier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-3">
          <Card className="p-4 border border-gray-200">
            <div className="text-xs font-bold text-gray-800 mb-3">Architecture Layout V6</div>
            <div className="space-y-3">
              {[
                { num: "1", label: "CarlOS Pulse", desc: "Bande mince. Vert/jaune/rouge. Click expand.", color: "green", h: "shrink-0 ~20px" },
                { num: "2", label: "Video/Voice", desc: "16:9 standby. Tavus lip-sync. LiveKit + Deepgram + ElevenLabs.", color: "purple", h: "shrink-0 ~200px" },
                { num: "3", label: "CarlOS Hooks", desc: "NOUVEAU. flex-1. Cards contextuelles dismissables. Actions → canvas.", color: "emerald", h: "flex-1" },
                { num: "4", label: "InputBar", desc: "EN BAS. Textarea 4 lignes. Envoyer/Vocal/Fichier → LiveChat canvas.", color: "blue", h: "shrink-0 ~80px" },
              ].map((s) => (
                <div key={s.num} className={cn("flex gap-3 p-3 rounded-lg border", `border-${s.color}-200 bg-${s.color}-50/30`)}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", `bg-${s.color}-500`)}>{s.num}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-bold", `text-${s.color}-700`)}>{s.label}</span>
                      <span className="text-[9px] text-gray-400">{s.h}</span>
                    </div>
                    <p className="text-[9px] text-gray-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-xs font-bold text-gray-800 mb-2">Separateurs</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-24 h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
                <span className="text-[9px] text-gray-500">Gradient (Video → Hooks)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-[1px] bg-gray-200" />
                <span className="text-[9px] text-gray-500">Gray (Hooks → InputBar)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// CARLOS HOOKS
// ================================================================

function SectionHooks() {
  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden border-2 border-emerald-300">
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-600">
          <span className="text-sm font-bold text-white">3. CarlOS Hooks — Zone Premier Contact</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs text-emerald-700 leading-relaxed">
              <span className="font-bold">Principe:</span> CarlOS ne fait PAS de discussion ici.
              Il accroche avec des messages courts. Si plus profond → canvas central avec bots specialistes.
            </p>
          </div>

          <div className="text-xs font-bold text-gray-700">Exemples par vue active:</div>
          <div className="space-y-3">
            {[
              { vue: "Dashboard", hooks: [
                { type: "greeting" as const, msg: "Bonjour! Vos KPIs sont stables. On regarde les tendances?" },
                { type: "suggestion" as const, msg: "3 discussions en attente de verdict." },
                { type: "insight" as const, msg: "Ventes +12%. Sophie (CSO) a des recommandations." },
              ]},
              { vue: "Sante Globale", hooks: [
                { type: "greeting" as const, msg: "Portrait sante transversal. 5 dimensions surveillees." },
                { type: "alert" as const, msg: "Dimension 'Temps' en zone orange — 3 projets en retard." },
              ]},
              { vue: "Pipeline", hooks: [
                { type: "nudge" as const, msg: "Chantier 'Securite' brule — 2 taches bloquees." },
                { type: "suggestion" as const, msg: "5 discussions pourraient devenir des missions." },
              ]},
              { vue: "War Room", hooks: [
                { type: "alert" as const, msg: "War Room activee. Decrivez la situation." },
              ]},
            ].map((group) => (
              <div key={group.vue}>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">{group.vue}</div>
                <div className="space-y-1.5">
                  {group.hooks.map((h, i) => (
                    <WireframeHook key={i} type={h.type} message={h.msg} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Generiques</div>
            <div className="space-y-1.5">
              <WireframeHook type="alert" message="Discussion qui traine depuis 3 jours." action="Resoudre" />
              <WireframeHook type="nudge" message="Mission en attente d'assignation." action="Assigner" />
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-blue-200 bg-blue-50/50">
            <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[9px] text-blue-500 flex-1">Ouvrir une discussion approfondie...</span>
            <ChevronRight className="h-3.5 w-3.5 text-blue-300" />
          </div>
          <p className="text-[9px] text-gray-400">→ Ouvre le LiveChat dans le canvas central.</p>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// FLOW UTILISATEUR
// ================================================================

function SectionFlow() {
  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden border border-indigo-200">
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-600">
          <span className="text-sm font-bold text-white">Flow — Sidebar → Canvas</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { step: "1", label: "Arrivee", desc: "Page quelconque", color: "gray" },
              { step: "2", label: "Hook", desc: "Message sidebar", color: "blue" },
              { step: "3a", label: "Dismiss", desc: "Ferme (X)", color: "gray" },
              { step: "3b", label: "Action", desc: "Clique", color: "emerald" },
              { step: "4", label: "Canvas", desc: "Section cible", color: "violet" },
              { step: "5", label: "Chat", desc: "LiveChat + bots", color: "indigo" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />}
                <div className="text-center min-w-[60px]">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white mx-auto mb-1", `bg-${s.color}-500`)}>{s.step}</div>
                  <div className="text-[9px] font-bold text-gray-700">{s.label}</div>
                  <div className="text-[8px] text-gray-400">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
              <div className="text-xs font-bold text-blue-700 mb-1">Hook simple</div>
              <div className="text-[9px] text-blue-600 space-y-0.5">
                <p>1. Dashboard</p>
                <p>2. CarlOS: "3 discussions en attente"</p>
                <p>3. Click → Pipeline</p>
                <p>4. Traitement dans le canvas</p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-violet-200 bg-violet-50">
              <div className="text-xs font-bold text-violet-700 mb-1">Escalade avec bots</div>
              <div className="text-[9px] text-violet-600 space-y-0.5">
                <p>1. Sante Globale</p>
                <p>2. CarlOS: "Temps en zone orange"</p>
                <p>3. User tape "Explique pourquoi"</p>
                <p>4. LiveChat + invite BOO (COO)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// MODE COLLAPSED
// ================================================================

function SectionCollapsed() {
  return (
    <div className="space-y-4">
      <Card className="p-4 border border-gray-200">
        <div className="text-xs font-bold text-gray-700 mb-3">Mode Collapse — 4% = 56px</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-center">
            <div className="w-14 bg-white border-2 border-gray-300 rounded-lg" style={{ minHeight: 250 }}>
              <div className="py-3 space-y-3 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Video className="h-4 w-4 text-purple-500" />
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-500" />
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            {[
              { icon: Video, color: "purple", label: "CarlOS Live", desc: "Tooltip → communication vocale/video" },
              { icon: Activity, color: "green", label: "CarlOS Pulse", desc: "Tooltip → alertes en cours" },
              { icon: Sparkles, color: "blue", label: "CarlOS Hooks", desc: "Tooltip → hooks contextuels" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 p-2 rounded border border-gray-100">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", `bg-${item.color}-100`)}>
                    <Icon className={cn("h-4 w-4", `text-${item.color}-500`)} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-700">{item.label}</div>
                    <div className="text-[9px] text-gray-500">{item.desc}</div>
                  </div>
                </div>
              );
            })}
            <p className="text-[9px] text-gray-400 mt-2">Collapse = 3 icones + tooltips. Expand pour interagir.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
