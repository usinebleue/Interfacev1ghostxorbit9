/**
 * MasterBibleVisuelleLivePage.tsx — A.4 Bible Visuelle Live
 * Inventaire COMPLET de tous les patterns visuels actifs dans la plateforme
 * + identification des doublons et incoherences
 * Session 49 — Audit plateforme pour Carl
 */

import { useState } from "react";
import {
  Eye, Layout, Type, CreditCard, ToggleLeft,
  MessageSquare, Search, Palette, Copy, AlertTriangle,
  PanelTop, ChevronRight, CheckCircle2,
  Briefcase, Cpu, DollarSign, Megaphone, Target, Settings,
  Factory, Users, Lightbulb, TrendingUp, Scale, Shield,
  Gauge, ArrowRight, Bot, Zap, BarChart3,
  Brain, Sparkles, Crown, Flame, Clock,
  FileText, Wrench, CalendarDays, CheckSquare, FolderKanban,
  Activity, Loader2, Upload, Bookmark, Plus,
  UserCircle, Fingerprint, Volume2, Check, Pencil,
  Network, GripVertical, PanelLeft, PanelRight,
  Phone, Send, Mic, Video, ArrowDown,
  Map, Store, Handshake, Rocket, Newspaper, Calendar, Globe, BookOpen, Server, Package, Atom, Radio, GitBranch, Gem, GraduationCap, Route, Monitor, Smartphone, DoorOpen, User, HelpCircle,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { BOT_AVATAR } from "../../../api/types";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";
import { OFFICIAL_BOTS } from "./PageTypePage";
import { AG_KEYFRAMES, AGENTS, AgentAnimatedCard } from "./AgentGalleryPage";

// ================================================================
// TABS — 17 sections numerotees
// ================================================================

const TABS = [
  { id: "structure", label: "1. Structure App", icon: Layout },
  { id: "identite", label: "2. Identite & Couleurs", icon: Fingerprint },
  { id: "primitives", label: "3. Primitives", icon: ToggleLeft },
  { id: "entreprise", label: "4. Mon Entreprise", icon: Crown },
  { id: "bureau", label: "5. Mon Bureau", icon: Briefcase },
  { id: "salles", label: "6. Mes Salles", icon: Users },
  { id: "reseau", label: "7. Mon Reseau", icon: Network },
  { id: "reglages", label: "8. Reglages", icon: Settings },
  { id: "livechat", label: "9. LiveChat & Bulles", icon: MessageSquare },
  { id: "audit", label: "10. Audit", icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ================================================================
// DATA — Bot identity system
// ================================================================

export const BOTS_12 = [
  { code: "BCO", nom: "CarlOS",    role: "CEO",  dept: "Direction Generale",    icon: Briefcase,  color: "blue",    emoji: "👔" },
  { code: "BCT", nom: "Thierry",   role: "CTO",  dept: "Technologie",           icon: Cpu,        color: "violet",  emoji: "💻" },
  { code: "BCF", nom: "François",  role: "CFO",  dept: "Finance & Tresorerie",  icon: DollarSign, color: "emerald", emoji: "💰" },
  { code: "BCM", nom: "Martine",   role: "CMO",  dept: "Marketing & Croissance", icon: Megaphone, color: "pink",    emoji: "📢" },
  { code: "BCS", nom: "Sophie",    role: "CSO",  dept: "Strategie & Ventes",    icon: Target,     color: "red",     emoji: "🎯" },
  { code: "BOO", nom: "Olivier",   role: "COO",  dept: "Operations & Production", icon: Settings, color: "orange",  emoji: "⚙️" },
  { code: "BFA", nom: "Fabien",    role: "Usine", dept: "Automatisation & Usine", icon: Factory,  color: "slate",   emoji: "🏭" },
  { code: "BHR", nom: "Helene",    role: "CHRO", dept: "Ressources Humaines",   icon: Users,      color: "teal",    emoji: "🤝" },
  { code: "BIO", nom: "Ines",      role: "CINO", dept: "Innovation & R&D",      icon: Lightbulb,  color: "cyan",    emoji: "🔬" },
  { code: "BRO", nom: "Raphael",   role: "CRO",  dept: "Revenus & Croissance",  icon: TrendingUp, color: "amber",   emoji: "📈" },
  { code: "BLE", nom: "Louise",    role: "CLO",  dept: "Juridique & Conformite", icon: Scale,     color: "indigo",  emoji: "⚖️" },
  { code: "BSE", nom: "Sebastien", role: "CISO", dept: "Securite & Cyber",      icon: Shield,     color: "zinc",    emoji: "🛡️" },
];

export const MODES_REFLEXION = [
  { id: "credo",      label: "Standard",    icon: Zap,          color: "blue" },
  { id: "analyse",    label: "Analyse",     icon: Search,       color: "red" },
  { id: "brainstorm", label: "Brainstorm",  icon: Brain,        color: "amber" },
  { id: "decision",   label: "Decision",    icon: Scale,        color: "indigo" },
  { id: "crise",      label: "Crise",       icon: AlertTriangle, color: "red" },
  { id: "strategie",  label: "Strategie",   icon: Target,       color: "emerald" },
  { id: "debat",      label: "Debat",       icon: MessageSquare, color: "violet" },
  { id: "innovation", label: "Innovation",  icon: Sparkles,     color: "fuchsia" },
  { id: "deep",       label: "Deep Resonance", icon: Brain,     color: "cyan" },
];

export const SIDEBAR_PIPELINE = [
  { label: "Discussions", icon: MessageSquare, color: "text-violet-500" },
  { label: "Missions",    icon: Target,        color: "text-green-500" },
  { label: "Projets",     icon: FolderKanban,  color: "text-indigo-500" },
  { label: "Chantiers",   icon: Flame,         color: "text-red-500" },
];

export const SIDEBAR_RESSOURCES = [
  { label: "Idees",     icon: Sparkles,    color: "text-amber-500" },
  { label: "Documents", icon: FileText,    color: "text-green-500" },
  { label: "Outils",    icon: Wrench,      color: "text-orange-500" },
  { label: "Taches",    icon: CheckSquare, color: "text-purple-500" },
  { label: "Agenda",    icon: CalendarDays, color: "text-rose-500" },
];

// ================================================================
// HELPERS
// ================================================================

export function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">{num}</span>
      <span className="text-sm font-bold text-gray-800">{title}</span>
    </div>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-gray-900 text-green-400 text-[9px] font-mono px-3 py-2 rounded-lg overflow-x-auto whitespace-pre">
      {code}
    </div>
  );
}

export function PatternCard({ title, where, code, children }: {
  title: string;
  where: string;
  code?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-3 py-2 border-b bg-gray-50">
        <div className="text-xs font-bold text-gray-800">{title}</div>
        <div className="text-[9px] text-gray-400 mt-0.5">Utilise dans: {where}</div>
      </div>
      <div className="p-3 space-y-2">
        {children}
        {code && <CodeBlock code={code} />}
      </div>
    </Card>
  );
}

// ================================================================
// 1. IDENTITE BOTS
// ================================================================

export function Tab1Identite() {
  return (
    <div className="space-y-4">
      <SectionTitle num="1" title="Identite des 12 Bots C-Level" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Chaque bot a UN systeme d'identite complet: code, nom, role, icone, couleur, avatar, gradient.
        Voici les 12 bots officiels de la plateforme (BCC et BPO sont des intrus a retirer).
      </div>

      {/* --- 1.1 — 4 tailles d'avatar --- */}
      <SectionTitle num="1.1" title="4 tailles d'avatar" />
      <div className="flex items-end gap-6">
        {[
          { label: "Grand (LiveChat)", size: "w-10 h-10", ring: "ring-2" },
          { label: "Moyen (Cards/Headers)", size: "w-8 h-8", ring: "ring-2" },
          { label: "Cockpit (Grilles)", size: "w-6 h-6", ring: "ring-2 ring-white/30" },
          { label: "Petit (Presence)", size: "w-5 h-5", ring: "ring-1" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">{s.label}</div>
            <img
              src={BOT_AVATAR["BCO"] || ""}
              alt="CarlOS"
              className={cn(s.size, "rounded-full object-cover ring-gray-200 mx-auto", s.ring)}
            />
            <div className="text-[9px] text-gray-400 mt-1 font-mono">{s.size}</div>
          </div>
        ))}
      </div>

      {/* --- 1.2 — Avatar avec ring couleur bot --- */}
      <SectionTitle num="1.2" title="Avatar avec ring couleur bot" />
      <div className="flex items-center gap-4">
        {BOTS_12.slice(0, 6).map((bot) => {
          const avatarSrc = BOT_AVATAR[bot.code];
          return (
            <div key={bot.code} className="text-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={bot.nom} className={`w-10 h-10 rounded-full object-cover ring-3 ring-${bot.color}-300 shadow-md`} />
              ) : (
                <div className={`w-10 h-10 rounded-full bg-${bot.color}-100 ring-3 ring-${bot.color}-300 flex items-center justify-center`}>
                  <bot.icon className={`h-4 w-4 text-${bot.color}-600`} />
                </div>
              )}
              <div className="text-[9px] text-gray-500 mt-1">{bot.code}</div>
            </div>
          );
        })}
      </div>

      {/* --- 1.3 — Tableau systeme d'identite (titre officiel = AGENTS.role) --- */}
      <SectionTitle num="1.3" title="Tableau systeme d'identite — 12 Bots" />
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5">
          <span className="text-sm font-bold text-white">Systeme d'identite — 12 Bots</span>
        </div>
        <div className="divide-y">
          {BOTS_12.map((bot) => {
            const Icon = bot.icon;
            const avatarSrc = BOT_AVATAR[bot.code];
            const agentData = AGENTS.find(a => a.code === bot.code);
            const fullRole = agentData?.role || bot.role;
            return (
              <div key={bot.code} className="px-4 py-2.5 flex items-center gap-3">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={bot.nom} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 shrink-0" />
                ) : (
                  <div className={`w-8 h-8 rounded-full bg-${bot.color}-100 flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 text-${bot.color}-600`} />
                  </div>
                )}
                <div className={`w-14 h-6 rounded bg-gradient-to-r from-${bot.color}-600 to-${bot.color}-500 shrink-0`} />
                <span className="text-xs font-bold text-gray-800 w-8 shrink-0">{bot.code}</span>
                <span className="text-xs text-gray-700 w-20 shrink-0">{bot.nom}</span>
                <span className="text-[9px] text-gray-500 truncate">{fullRole}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">Intrus a retirer</span>
        </div>
        <div className="text-xs text-gray-700">
          <strong>BCC</strong> (Catherine/CCO) et <strong>BPO</strong> (Philippe/CPO) existent dans le code (~111 occurrences) mais ne font PAS partie de la plateforme. Sprint nettoyage requis.
        </div>
      </Card>

      {/* --- 1.4 — Galerie Agents Animee --- */}
      <SectionTitle num="1.4" title="Galerie Agents AI — 12 cartes animees (source: FE.4b)" />
      <p className="text-xs text-gray-400 mb-3">VRAIS composants de AgentGalleryPage — circuits SVG animes, waveform, dots, elements uniques par bot</p>
      <style>{AG_KEYFRAMES}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {AGENTS.map((agent, i) => (
          <AgentAnimatedCard key={agent.code} agent={agent} index={i} />
        ))}
      </div>
    </div>
  );
}

// ================================================================
// 2. LAYOUTS (ex-section 2 Avatars supprimee)
// ================================================================

// Tab2Avatars SUPPRIME — contenu migre vers Tab1 Identite (1.1, 1.2)

// ================================================================
// 2. LAYOUTS
// ================================================================

export function Tab3Layouts() {
  return (
    <div className="space-y-4">
      <SectionTitle num="2" title="8 types de layouts" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Chaque page utilise PageLayout + PageHeader. Voici les wireframes visuels de chaque layout actif.
      </div>

      {/* 2.1 — Frame Master (global 3 panels) */}
      <PatternCard title="2.1 Frame Master — Shell 3 panneaux" where="TOUTE l'app (FrameMaster.tsx)">
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-white border-b px-3 py-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1.5"><PanelLeft className="h-3.5 w-3.5 text-gray-400" /><div className="w-16 h-2 rounded bg-gray-200" /></div>
            <div className="flex-1 text-center"><div className="w-20 h-2 rounded bg-gray-300 mx-auto" /></div>
            <div className="flex items-center gap-1.5"><div className="w-16 h-2 rounded bg-gray-200" /><PanelRight className="h-3.5 w-3.5 text-gray-400" /></div>
          </div>
          <div className="flex h-32">
            <div className="w-[18%] border-r bg-white p-1.5 space-y-1">
              <div className="text-[8px] font-bold text-gray-400 uppercase">Sidebar</div>
              {[1,2,3,4,5].map(i => <div key={i} className={cn("h-2 rounded", i===1 ? "bg-blue-200 w-full" : "bg-gray-100 w-4/5")} />)}
              <div className="h-px bg-gray-100 my-1" />
              {[1,2,3].map(i => <div key={i} className="h-2 rounded bg-gray-100 w-3/4" />)}
            </div>
            <div className="flex-1 bg-gray-50 p-2 flex flex-col">
              <div className="text-[8px] font-bold text-gray-400 uppercase mb-1">Centre</div>
              <div className="flex-1 bg-white rounded border border-gray-100 p-1.5">
                <div className="h-2 bg-gray-200 rounded w-1/2 mb-1" />
                <div className="grid grid-cols-3 gap-1 flex-1">{[1,2,3].map(i => <div key={i} className="bg-gray-100 rounded h-6" />)}</div>
              </div>
            </div>
            <div className="w-[20%] border-l bg-white p-1.5 space-y-1">
              <div className="text-[8px] font-bold text-gray-400 uppercase">Droite</div>
              <div className="h-4 rounded bg-blue-50 border border-blue-100" />
              <div className="h-3.5 rounded bg-gray-100" />
              <div className="h-px bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 mx-1" />
              <div className="h-6 rounded bg-gray-50 border" />
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Gauche:</strong> 16% default, 4-25%, collapsible</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Centre:</strong> 60% default, min 35%</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Droite:</strong> ~20%, Pulse + Input + Discussions</div>
        </div>
      </PatternCard>

      {/* 2.2 — Grille 5xl */}
      <PatternCard title="4.1 GRILLE — maxWidth 5xl" where="Dashboard, TRG, Cockpit, Sante, Reglages">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-white border-b px-3 py-1.5 flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-blue-100" /><div className="h-2 bg-gray-200 rounded w-32" /></div>
          <div className="p-3 max-w-xs mx-auto">
            <div className="grid grid-cols-4 gap-1.5">
              {BOTS_12.slice(0, 8).map((b) => (
                <div key={b.code} className="rounded overflow-hidden border">
                  <div className={`h-2 bg-gradient-to-r from-${b.color}-600 to-${b.color}-500`} />
                  <div className="p-1 bg-white space-y-0.5"><div className="h-1.5 bg-gray-100 rounded w-full" /><div className="h-1 bg-gray-50 rounded w-3/4" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">max-w-5xl — Grilles 4-5 colonnes de KPI cards avec gradient headers</div>
      </PatternCard>

      {/* 2.3 — Contenu 4xl */}
      <PatternCard title="5.1 CONTENU — maxWidth 4xl" where="Bureau, Blueprint, Chantiers, Master GHML">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-white border-b px-3 py-2 flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 rotate-180" />
            <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center"><Briefcase className="h-3.5 w-3.5 text-blue-600" /></div>
            <div><div className="h-2 bg-gray-800 rounded w-20" /><div className="h-1.5 bg-gray-200 rounded w-14 mt-0.5" /></div>
            <div className="ml-auto flex gap-0.5">
              <span className="px-1.5 py-0.5 text-[8px] bg-gray-900 text-white rounded">Tab 1</span>
              <span className="px-1.5 py-0.5 text-[8px] text-gray-400 rounded">Tab 2</span>
            </div>
          </div>
          <div className="p-3 max-w-[200px] mx-auto space-y-1.5">
            <div className="bg-white rounded border p-2 space-y-1"><div className="h-2 bg-gray-200 rounded w-3/4" /><div className="h-1.5 bg-gray-100 rounded w-full" /><div className="h-1.5 bg-gray-100 rounded w-5/6" /></div>
            <div className="bg-white rounded border p-2 space-y-1"><div className="h-2 bg-gray-200 rounded w-1/2" /><div className="h-1.5 bg-gray-100 rounded w-full" /></div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">max-w-4xl mx-auto px-10 py-5 — PageHeader + tabs + contenu scrollable</div>
      </PatternCard>

      {/* 2.4 — Chat 2xl */}
      <PatternCard title="2.4 CHAT — maxWidth 2xl" where="LiveChat, Discussions">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-white/80 border-b px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="h-2 bg-gray-300 rounded w-20" /><span className="text-[8px] bg-blue-50 text-blue-600 px-1 rounded-full">Standard</span></div>
            <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-[8px] text-green-600">LIVE</span></div>
          </div>
          <div className="p-3 max-w-[180px] mx-auto space-y-2">
            <div className="flex gap-1.5 items-start">
              <div className="w-4 h-4 rounded-full bg-blue-200 shrink-0 mt-0.5" />
              <div className="bg-white border border-l-2 border-l-blue-400 rounded-lg px-2 py-1.5 flex-1">
                <div className="h-1 bg-blue-200 rounded w-8 mb-1" /><div className="h-1 bg-gray-100 rounded w-full mb-0.5" /><div className="h-1 bg-gray-100 rounded w-3/4" />
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex gap-1"><div className="h-1 bg-gray-200 rounded w-6" /><div className="h-1 bg-blue-100 rounded w-8" /></div>
              </div>
            </div>
            <div className="flex justify-end"><div className="bg-blue-600 rounded-lg px-2 py-1.5 max-w-[80%]"><div className="h-1 bg-white/50 rounded w-full mb-0.5" /><div className="h-1 bg-white/30 rounded w-3/4" /></div></div>
            <div className="flex gap-0.5 ml-5">{["bg-red-100","bg-amber-100","bg-violet-100","bg-emerald-100"].map((c,i) => <div key={i} className={cn("h-2 rounded-full w-8", c)} />)}</div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">max-w-2xl — Bulles + footer contextuel + boutons d'action</div>
      </PatternCard>

      {/* 2.5 — 3 Rooms (D-109) */}
      <PatternCard title="6.1 ROOMS — 3 layouts distincts (D-109)" where="BoardRoom, WarRoom, ThinkRoom">
        <div className="grid grid-cols-3 gap-3">
          {/* Board Room — amber/gold */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-2 py-1.5 flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-white/80" />
              <div className="flex-1"><div className="h-1.5 bg-white/70 rounded w-12" /><div className="h-1 bg-white/30 rounded w-16 mt-0.5" /></div>
            </div>
            <div className="p-2 space-y-1.5">
              <div className="text-[7px] font-bold text-gray-400 uppercase">Membres CA (6)</div>
              <div className="grid grid-cols-3 gap-1">
                {BOTS_12.slice(0, 6).map(b => <div key={b.code} className="text-center"><div className={`w-4 h-4 rounded-full bg-${b.color}-100 mx-auto`} /><div className="text-[6px] text-gray-400 mt-0.5">{b.code}</div></div>)}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-[7px] font-bold text-gray-400 uppercase">Agenda + Resolutions</div>
              <div className="space-y-0.5">{[1,2].map(i => <div key={i} className="h-2 bg-amber-50 border border-amber-100 rounded" />)}</div>
              <div className="flex justify-center"><div className="bg-amber-500 rounded-full px-2.5 py-0.5"><div className="h-1 bg-white/60 rounded w-8" /></div></div>
            </div>
          </div>

          {/* War Room — red */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-2 py-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-white/80" />
              <div className="flex-1"><div className="h-1.5 bg-white/70 rounded w-10" /><div className="h-1 bg-white/30 rounded w-14 mt-0.5" /></div>
            </div>
            <div className="p-2 space-y-1.5">
              <div className="text-[7px] font-bold text-gray-400 uppercase">Equipe Crise</div>
              <div className="flex gap-1">
                {BOTS_12.slice(0, 3).map(b => <div key={b.code} className={`w-5 h-5 rounded-full bg-${b.color}-100 ring-1 ring-red-200`} />)}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-[7px] font-bold text-gray-400 uppercase">Diagnostic Urgence</div>
              <div className="space-y-0.5">
                {["bg-red-200 w-full","bg-red-100 w-4/5","bg-red-50 w-3/5"].map((c,i) => <div key={i} className={cn("h-1.5 rounded", c)} />)}
              </div>
              <div className="flex justify-center"><div className="bg-red-500 rounded-full px-2.5 py-0.5"><div className="h-1 bg-white/60 rounded w-8" /></div></div>
            </div>
          </div>

          {/* Think Room — cyan */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-2 py-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-white/80" />
              <div className="flex-1"><div className="h-1.5 bg-white/70 rounded w-12" /><div className="h-1 bg-white/30 rounded w-14 mt-0.5" /></div>
            </div>
            <div className="p-2 space-y-1.5">
              <div className="text-[7px] font-bold text-gray-400 uppercase">Equipe Creation</div>
              <div className="flex gap-1">
                {BOTS_12.slice(6, 9).map(b => <div key={b.code} className={`w-5 h-5 rounded-full bg-${b.color}-100 ring-1 ring-cyan-200`} />)}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-[7px] font-bold text-gray-400 uppercase">Processus Creatif</div>
              <div className="flex gap-1 items-center">
                {["Ideation","Prototypage","Validation"].map((s,i) => (
                  <div key={s} className="flex items-center gap-0.5">
                    {i > 0 && <ArrowRight className="h-2.5 w-2.5 text-gray-300" />}
                    <div className="bg-cyan-50 border border-cyan-100 rounded px-1 py-0.5 text-[6px] text-cyan-700">{s}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center"><div className="bg-cyan-500 rounded-full px-2.5 py-0.5"><div className="h-1 bg-white/60 rounded w-8" /></div></div>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-amber-50 rounded p-1.5"><strong>Board:</strong> amber — CA, agenda, resolutions</div>
          <div className="bg-red-50 rounded p-1.5"><strong>War:</strong> red — crise, diagnostic urgent</div>
          <div className="bg-cyan-50 rounded p-1.5"><strong>Think:</strong> cyan — creation, processus</div>
        </div>
      </PatternCard>

      {/* 2.6 — Focus */}
      <PatternCard title="5.4 FOCUS — Plein ecran dedie" where="FocusModeLayout (click → immersion)">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/20" />
            <div className="flex-1"><div className="h-2 bg-white/80 rounded w-20" /><div className="h-1.5 bg-white/30 rounded w-28 mt-0.5" /></div>
          </div>
          <div className="bg-gray-50 border-b px-3 py-1 flex items-center gap-3">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span className="text-[8px] text-gray-400">CarlOS</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-violet-400" /><span className="text-[8px] text-gray-400">Specialiste</span></div>
          </div>
          <div className="h-16 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mx-auto mb-1 flex items-center justify-center"><BarChart3 className="h-3.5 w-3.5 text-blue-600" /></div>
              <div className="h-1.5 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">Header gradient bot + Trio bandeau + contenu centre</div>
      </PatternCard>

      {/* 2.7 — Department Detail */}
      <PatternCard title="4.7 DEPARTEMENT — Gradient header + 4 tabs" where="DepartmentTourDeControle (12 depts)">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-white/20" />
            <div className="flex-1"><div className="h-2 bg-white/80 rounded w-24" /><div className="h-1.5 bg-white/40 rounded w-16 mt-0.5" /></div>
            <div className="flex gap-0.5">
              {["Vue","Pipeline","Docs","Diag"].map(t => <span key={t} className={cn("px-1.5 py-0.5 text-[8px] rounded", t==="Vue" ? "bg-white/20 text-white" : "text-white/50")}>{t}</span>)}
            </div>
          </div>
          <div className="p-3 max-w-[200px] mx-auto grid grid-cols-2 gap-1.5">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded border p-1.5"><div className="h-1 bg-gray-200 rounded w-10 mb-0.5" /><div className="h-1 bg-gray-100 rounded w-full" /></div>)}
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">Avatar + gradient + 4 sub-tabs dans le header</div>
      </PatternCard>

      {/* 2.8 — Agent Settings */}
      <PatternCard title="8.4 REGLAGES AGENT — Banniere + Tabs + Contenu" where="AgentSettingsView (profil bot)">
        {/* Wireframe layout avec tabs */}
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          {/* Banniere agent */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 h-10 relative">
            <div className="absolute bottom-1 left-2 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/30 ring-1 ring-white/50" />
              <div><div className="h-1.5 bg-white/80 rounded w-12" /><div className="h-1 bg-white/40 rounded w-16 mt-0.5" /></div>
            </div>
          </div>
          {/* Tabs navigation */}
          <div className="flex gap-1 px-2 py-1.5 border-b bg-white">
            {["Vue d'ensemble", "Teintures", "Profil & Modes", "Performance", "Parametres"].map((t, i) => (
              <div key={t} className={cn("px-1.5 py-0.5 rounded text-[6px] font-bold", i === 0 ? "bg-gray-900 text-white" : "text-gray-400 bg-gray-50")}>{t}</div>
            ))}
          </div>
          {/* Contenu tab actif (Vue d'ensemble) */}
          <div className="p-2 space-y-1.5">
            <div className="grid grid-cols-4 gap-1">
              {["Missions", "Succes", "Temps moy.", "Actives"].map(k => (
                <div key={k} className="bg-white rounded border p-1 text-center"><div className="text-[6px] text-gray-400">{k}</div><div className="text-[8px] font-bold text-gray-700">—</div></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-white rounded border p-1 space-y-0.5"><div className="text-[6px] font-bold text-gray-400">Activite recente</div>{[1,2].map(i=><div key={i} className="h-1 bg-gray-100 rounded" />)}</div>
              <div className="bg-white rounded border p-1 space-y-0.5"><div className="text-[6px] font-bold text-gray-400">Collaboration</div>{[1,2].map(i=><div key={i} className="h-1 bg-gray-100 rounded" />)}</div>
            </div>
          </div>
        </div>

        {/* 5 tabs documentes */}
        <div className="mt-3 space-y-2">
          <div className="text-[9px] font-bold text-gray-700 uppercase">5 tabs — Structure Reglages Agent</div>
          <div className="space-y-1.5">
            {[
              { tab: "1. Vue d'ensemble", desc: "Banniere identite + 4 KPIs (missions, succes, temps, actives) + statut en ligne + activite recente + collaboration equipe", type: "DATA" },
              { tab: "2. Teintures cognitives", desc: "Trisociation 3 slots (Primaire/Calibrateur/Amplificateur) + catalogue 21 Ghosts (7 categories) + assignation interactive", type: "ACTION" },
              { tab: "3. Profil & Modes", desc: "Profil psychometrique (5 barres 0-100) + 5 modes decisionnels (toggles) + competences cles + style communication", type: "DATA + ACTION" },
              { tab: "4. Performance", desc: "Historique decisionnel + documents generes + missions completees + metriques detaillees", type: "DATA" },
              { tab: "5. Parametres", desc: "Voix ElevenLabs, permissions, integrations API, config technique, seuils d'activation", type: "ACTION" },
            ].map((t) => (
              <div key={t.tab} className="flex items-start gap-2 bg-white rounded border px-2 py-1.5">
                <span className={cn("text-[8px] font-bold px-1 py-0.5 rounded shrink-0", t.type === "ACTION" ? "bg-blue-100 text-blue-700" : t.type === "DATA" ? "bg-gray-100 text-gray-600" : "bg-violet-100 text-violet-700")}>{t.type}</span>
                <div>
                  <div className="text-[9px] font-bold text-gray-800">{t.tab}</div>
                  <div className="text-[8px] text-gray-500">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PatternCard>

      {/* 2.9 — Espacement pages standard (ex-12.7) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Espacement pages 3 variantes</div>
        <div className="space-y-3">
          <div>
            <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Standard PageLayout (la bonne)</div>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-10 py-5">
                <div className="max-w-4xl mx-auto bg-white rounded-lg p-3 border text-xs text-gray-500">Marges larges uniformes</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] font-bold text-red-500 uppercase mb-1">Trop serre (legacy)</div>
              <div className="border rounded-lg overflow-hidden border-red-200">
                <div className="bg-gray-50 p-4">
                  <div className="bg-white rounded-lg p-3 border text-xs text-gray-500">Colle aux bords</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-red-500 uppercase mb-1">Marges moyennes (legacy)</div>
              <div className="border rounded-lg overflow-hidden border-red-200">
                <div className="bg-gray-50 px-6 py-4">
                  <div className="bg-white rounded-lg p-3 border text-xs text-gray-500">Marges moyennes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> TOUT par PageLayout, eliminer les marges manuelles.</div>
      </Card>

      {/* 2.10 — Grilles 4 formats (ex-12.8) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Grilles 4 formats</div>
        <div className="space-y-3">
          {[
            { label: "4 colonnes — KPI", cols: "grid-cols-4", color: "blue", items: ["Revenus", "Clients", "Pipeline", "Marge"] },
            { label: "5 colonnes — TRG", cols: "grid-cols-5", color: "violet", items: ["Direction", "Tech", "Finance", "Marketing", "Ventes"] },
            { label: "3 colonnes — Comparaisons", cols: "grid-cols-3", color: "emerald", items: ["Option A", "Option B", "Option C"] },
            { label: "2 colonnes — Listes", cols: "grid-cols-2", color: "amber", items: ["Element 1", "Element 2"] },
          ].map((g) => (
            <div key={g.label}>
              <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">{g.label}</div>
              <div className={cn("grid gap-3", g.cols)}>
                {g.items.map((item) => (
                  <div key={item} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center text-[9px] text-gray-700 font-medium">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> OK tel quel, chaque format est justifie.</div>
      </Card>
    </div>
  );
}

// ================================================================
// 3. HEADERS
// ================================================================

export function Tab4Headers() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Headers de pages</span></div>
      <div className="text-xs text-gray-600 leading-relaxed">
        Inventaire complet de TOUS les headers utilises dans la zone centrale. Certains sont standardises (PageHeader), d'autres sont uniques a leur contexte.
      </div>

      {/* 3.1 — PageHeader standard */}
      <PatternCard title="2.13 PageHeader — composant reutilisable" where="PageHeader.tsx → Bureau, Blueprint, Orbit9, Rooms, Master GHML (24 pages)">
        <div className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
          </button>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-1.5 rounded-lg">
            <Eye className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Titre Page</div>
            <div className="text-[9px] text-gray-400">Sous-titre descriptif</div>
          </div>
          <div className="ml-auto flex gap-1">
            <span className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg">Tab 1</span>
            <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Tab 2</span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Back:</strong> ArrowLeft h-4 w-4</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Icon:</strong> h-4 w-4 + couleur variable</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Title:</strong> text-sm font-bold</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>rightSlot:</strong> tabs ou actions</div>
        </div>
      </PatternCard>

      {/* 3.2 — LiveChat Header */}
      <PatternCard title="2.14 LiveChat Header — barre contextuelle translucide" where="LiveChat.tsx — ZONE CHAT">
        <div className="border rounded-xl shadow-sm">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <button className="text-gray-400 p-1 rounded-lg hover:bg-gray-100"><ChevronRight className="h-3.5 w-3.5 rotate-180" /></button>
              <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-200 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">Nouvelle mission</div>
                <div className="text-[9px] text-gray-400 flex items-center gap-1.5">
                  CarlOS — Direction Generale
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-600">
                    <Zap className="h-2.5 w-2.5" /> Standard
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><Clock className="h-3.5 w-3.5" /></button>
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><Bookmark className="h-3.5 w-3.5" /></button>
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><MessageSquare className="h-3.5 w-3.5" /></button>
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><Plus className="h-3.5 w-3.5" /></button>
              <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-green-600 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-[9px]">
          <div className="bg-blue-50 rounded p-1.5"><strong>Fond:</strong> bg-white/80 backdrop-blur-sm</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Avatar:</strong> w-7 h-7 photo bot actif (dynamique)</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Ligne 2:</strong> nom bot + badge mode</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Droite:</strong> Park, Idees, Threads, +, LIVE</div>
        </div>
      </PatternCard>

      {/* 3.3 — Bot Roster Bar */}
      <PatternCard title="2.15 Bot Roster Bar — equipe active dans le chat" where="LiveChat.tsx — sous le LiveChat Header (2.14)">
        <div className="border rounded-xl shadow-sm">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-[9px] text-gray-400 font-medium shrink-0">Equipe active :</span>
            <div className="flex gap-1.5 flex-wrap flex-1">
              {[
                { code: "BCO", name: "CarlOS", text: "text-blue-600", border: "border-blue-200", ring: "ring-blue-300" },
                { code: "BCT", name: "Thierry", text: "text-violet-600", border: "border-violet-200", ring: "ring-violet-300" },
              ].map((bot) => (
                <div key={bot.code} className={cn("flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white border", bot.text, bot.border)}>
                  <img src={BOT_AVATAR[bot.code] || ""} alt={bot.name} className={cn("w-4 h-4 rounded-full object-cover ring-1", bot.ring)} />
                  <span>{bot.name}</span>
                  <button className="ml-0.5 text-gray-300 hover:text-red-400">x</button>
                </div>
              ))}
            </div>
            <select className="text-[9px] text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-full px-2 py-0.5">
              <option>+ Bot</option>
            </select>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-blue-50 rounded p-1.5"><strong>Fond:</strong> bg-white/80 backdrop-blur-sm</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Position:</strong> sous 3.2 quand equipe proposee</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Avatar:</strong> w-4 h-4 rounded-full + ring couleur bot</div>
        </div>
      </PatternCard>

      {/* 3.4 — Gradient Header Departement — 12 bots officiels */}
      <PatternCard title="4.8 Gradient Header Departement — 12 bots, 12 couleurs" where="DepartmentTourDeControle — 12 departements">
        <div className="space-y-2">
          {[
            { code: "BCO", nom: "CarlOS",    role: "CEO",  dept: "Direction Generale",      from: "from-blue-600",    to: "to-blue-500" },
            { code: "BCT", nom: "Thierry",   role: "CTO",  dept: "Technologie & Innovation", from: "from-violet-600",  to: "to-violet-500" },
            { code: "BCF", nom: "François",  role: "CFO",  dept: "Finance & Tresorerie",    from: "from-emerald-600", to: "to-emerald-500" },
            { code: "BCM", nom: "Martine",   role: "CMO",  dept: "Marketing & Croissance",  from: "from-pink-600",    to: "to-pink-500" },
            { code: "BCS", nom: "Sophie",    role: "CSO",  dept: "Strategie & Ventes",      from: "from-red-600",     to: "to-red-500" },
            { code: "BOO", nom: "Olivier",   role: "COO",  dept: "Operations & Production", from: "from-orange-600",  to: "to-orange-500" },
            { code: "BFA", nom: "Fabien",    role: "Usine", dept: "Automatisation & Usine",  from: "from-slate-600",   to: "to-slate-500" },
            { code: "BHR", nom: "Helene",    role: "CHRO", dept: "Ressources Humaines",     from: "from-teal-600",    to: "to-teal-500" },
            { code: "BIO", nom: "Ines",      role: "CINO", dept: "Innovation & R&D",        from: "from-cyan-600",    to: "to-cyan-500" },
            { code: "BRO", nom: "Raphael",   role: "CRO",  dept: "Revenus & Croissance",    from: "from-amber-600",   to: "to-amber-500" },
            { code: "BLE", nom: "Louise",    role: "CLO",  dept: "Juridique & Conformite",  from: "from-indigo-600",  to: "to-indigo-500" },
            { code: "BSE", nom: "Sebastien", role: "CISO", dept: "Securite & Cyber",        from: "from-zinc-600",    to: "to-zinc-500" },
          ].map((bot) => (
            <div key={bot.code} className={cn("bg-gradient-to-r px-4 py-3 rounded-xl flex items-center gap-3", bot.from, bot.to)}>
              <img src={BOT_AVATAR[bot.code] || ""} alt={bot.code} className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/30" />
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{bot.dept}</div>
                <div className="text-[9px] text-white/60">{bot.nom} — {bot.role}</div>
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Vue d'ensemble</span>
                <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Pipeline</span>
                <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Documents</span>
                <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Diagnostics</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient couleur unique par bot + avatar arrondi-lg + 4 sub-tabs (actif = bg-white/20, inactif = text-white/60). Pattern identique pour les 12 departements.
        </div>
      </PatternCard>

      {/* 3.5 — BlockHeader Dashboard */}
      <PatternCard title="4.2 BlockHeader — gradient dans les cards (margins negatives)" where="DashboardView.tsx — 12 blocs C-Level">
        <div className="space-y-2">
          <Card className="p-4 overflow-hidden">
            <div className="flex items-center gap-2.5 -mx-4 -mt-4 mb-3 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white flex-1">CarlOS — CEO</span>
              <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">5</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
            </div>
          </Card>
          <div className="flex gap-2">
            {[
              { label: "CEO", color: "from-blue-600 to-blue-500" },
              { label: "CFO", color: "from-emerald-600 to-emerald-500" },
              { label: "CTO", color: "from-violet-600 to-violet-500" },
              { label: "CMO", color: "from-pink-600 to-pink-500" },
              { label: "CSO", color: "from-red-600 to-red-500" },
              { label: "COO", color: "from-orange-600 to-orange-500" },
            ].map((b) => (
              <div key={b.label} className={cn("flex-1 h-5 rounded bg-gradient-to-r", b.color)}>
                <span className="text-[7px] text-white/80 font-bold px-1.5 leading-5">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <CodeBlock code={`-mx-4 -mt-4 mb-3 px-4 py-2.5 bg-gradient-to-r\nw-7 h-7 bg-white/20 rounded-lg\ntext-xs font-bold uppercase tracking-wider text-white\nbg-white/25 text-white px-2 py-0.5 rounded-full`} />
      </PatternCard>

      {/* 3.6 — Room headers */}
      <PatternCard title="6.2 Room Headers — PageHeader avec icone et couleur" where="BoardRoom, WarRoom, ThinkRoom">
        <div className="space-y-2">
          {[
            { Icon: Crown, color: "amber", label: "Board Room", sub: "Conseil d'Administration — 6 C-Level" },
            { Icon: AlertTriangle, color: "red", label: "War Room", sub: "Gestion de crise — Mode COMMAND urgent" },
            { Icon: Lightbulb, color: "cyan", label: "Think Room", sub: "Lancement de projet — Vision au Go/No-Go" },
          ].map((room) => (
            <div key={room.label} className="border rounded-lg px-4 py-2.5 flex items-center gap-3">
              <button className="text-gray-400 p-1 rounded-lg"><ChevronRight className="h-3.5 w-3.5 rotate-180" /></button>
              <div className={`bg-gradient-to-br from-${room.color}-100 to-${room.color}-50 p-1.5 rounded-lg`}>
                <room.Icon className={`h-4 w-4 text-${room.color}-600`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800">{room.label}</div>
                <div className="text-[9px] text-gray-400">{room.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">Utilisent PageHeader standard — seules l'icone et la couleur changent. Le contenu de la page est different.</div>
      </PatternCard>

      {/* 3.7 — Room card headers */}
      <PatternCard title="6.3 Room Card Headers — gradient dans les sections internes" where="BoardRoom, WarRoom, ThinkRoom — cards internes">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Ordre du jour", color: "from-amber-600 to-amber-500", Icon: Crown },
            { label: "Protocole crise", color: "from-red-600 to-red-500", Icon: AlertTriangle },
            { label: "Processus creatif", color: "from-cyan-600 to-cyan-500", Icon: Lightbulb },
          ].map((c) => (
            <Card key={c.label} className="p-0 overflow-hidden">
              <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-1.5 border-b", c.color)}>
                <c.Icon className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">{c.label}</span>
              </div>
              <div className="p-2 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Similaire a BlockHeader mais sans margins negatives. Gradient + icone blanche + texte bold. Badge optionnel bg-white/90.
        </div>
      </PatternCard>

      {/* 3.8 — Agent Settings Banner */}
      <PatternCard title="8.5 Agent Settings Banner — standby image pleine largeur" where="AgentSettingsView.tsx — profil bot">
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 h-24 relative">
            <div className="absolute bottom-2 left-3 flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-500 ring-3 ring-white/50 shadow-lg" />
              <div>
                <div className="text-sm font-bold text-white">CarlOS</div>
                <div className="text-[9px] text-white/60">CEO — Direction Generale</div>
              </div>
            </div>
            <div className="absolute top-2 right-3">
              <button className="text-[9px] px-2 py-1 rounded-lg bg-white/10 text-white/70 border border-white/20">Modifier</button>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Image:</strong> aspect-[3/1] standby</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Avatar:</strong> w-16 h-16 ring-3 ring-white/50</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Position:</strong> absolute bottom-left overlay</div>
        </div>
      </PatternCard>

      {/* 3.9 — KPI Card Header (Health) */}
      <PatternCard title="4.3 KPI Card Header — gradient + trend indicator" where="HealthView.tsx, CockpitView.tsx">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Score VITAA", value: "78", gradient: "from-blue-600 to-blue-500", trend: "up" },
            { label: "Chantiers actifs", value: "6.DB", gradient: "from-emerald-600 to-emerald-500", trend: "up" },
            { label: "Risques detectes", value: "2.H", gradient: "from-red-600 to-red-500", trend: "down" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r", kpi.gradient)}>
                <Gauge className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white flex-1">{kpi.label}</span>
                <TrendingUp className={cn("h-3.5 w-3.5", kpi.trend === "up" ? "text-green-300" : "text-red-300 rotate-180")} />
              </div>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient header compact (py-2) + icone trend en haut a droite (vert = hausse, rouge = baisse). Valeur large en dessous.
        </div>
      </PatternCard>

      {/* 3.10 — Diagnostic Card Header */}
      <PatternCard title="4.9 Diagnostic Card Header — gradient departement sans icone" where="DepartmentTourDeControle.tsx — onglet Diagnostics">
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Diagnostic Ventes Q2", color: "from-red-600 to-red-500", kpis: 8, duree: "15 min", questions: 12 },
            { title: "Audit Processus Prod.", color: "from-orange-600 to-orange-500", kpis: 5, duree: "20 min", questions: 18 },
          ].map((diag) => (
            <Card key={diag.title} className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
              <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center justify-between", diag.color)}>
                <p className="text-xs font-bold text-white truncate flex-1">{diag.title}</p>
                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0">{diag.kpis} KPIs</span>
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{diag.duree}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{diag.questions} questions</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-amber-50 rounded p-1.5"><strong>Difference vs Bloc:</strong> PAS d'icone dans le header — juste titre + badge KPIs</div>
          <div className="bg-amber-50 rounded p-1.5"><strong>Gradient:</strong> Herite de DEPT_HEADER_GRADIENT (couleur du bot/dept)</div>
        </div>
      </PatternCard>

      {/* 3.11 — Comparaison Bloc vs Diagnostic header */}
      <PatternCard title="4.10 Comparaison — Bloc header vs Diagnostic header" where="DepartmentTourDeControle.tsx">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1.5">Bloc (10 par dept) — AVEC icone</div>
            <Card className="p-3 overflow-hidden">
              <div className="flex items-center gap-2.5 -mx-3 -mt-3 mb-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Cpu className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white flex-1">Stack Technique</span>
                <span className="text-[9px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full">3</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1.5">Diagnostic — SANS icone</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2.5 flex items-center justify-between">
                <p className="text-[9px] font-bold text-white truncate flex-1">Audit Infrastructure Cloud</p>
                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">5 KPIs</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          </div>
        </div>
        <Card className="p-2 mt-2 border-amber-200 bg-amber-50/50">
          <div className="text-[9px] text-gray-700">
            <strong>Incoherence:</strong> Meme gradient, mais les Blocs ont une icone (w-7 h-7 bg-white/20 rounded-lg) et le titre en UPPERCASE. Les Diagnostics ont un titre normal sans icone. A standardiser.
          </div>
        </Card>
      </PatternCard>

      {/* 3.12 — REMPLACE par pattern 3.4 standard */}
      <PatternCard title="4.12 HealthView Header — NORMALISE vers pattern 3.4" where="HealthView.tsx — utiliser le meme pattern gradient que les 12 departements">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 rounded-xl flex items-center gap-3">
          <img src={BOT_AVATAR["BCO"] || ""} alt="BCO" className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/30" />
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Sante de l'Entreprise</div>
            <div className="text-[9px] text-white/60">CarlOS — CEO</div>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Etat General</span>
            <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Diagnostics</span>
            <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Departements</span>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Normalise vers le pattern 3.4 — meme gradient + avatar + sub-tabs. Remplace l'ancien header custom a 3 etats dynamiques.
        </div>
      </PatternCard>

      {/* 3.13 — HealthView Diagnostic Card (avec avatar bot + gradient) */}
      <PatternCard title="4.13 HealthView Diagnostic Card — avatar bot + gradient bleu" where="HealthView.tsx — onglet Diagnostics (LE header bleu que Carl a vu)">
        <div className="grid grid-cols-2 gap-3">
          {[
            { bot: "BCT", label: "Audit Infrastructure", dept: "Technologie", gradient: "from-blue-700 to-indigo-600", kpis: 5 },
            { bot: "BCF", label: "Sante Financiere", dept: "Finance", gradient: "from-emerald-600 to-teal-500", kpis: 8 },
          ].map((d) => (
            <Card key={d.label} className="p-0 overflow-hidden">
              <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", d.gradient)}>
                <img src={BOT_AVATAR[d.bot] || ""} alt={d.bot} className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-white/30" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{d.label}</div>
                  <div className="text-[9px] text-white/60">{d.dept}</div>
                </div>
                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0">{d.kpis} KPIs</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient = couleur du bot (BLUE pour CTO!). Avatar rounded-lg w-8 h-8 ring-1 ring-white/30. C'est le header que Carl a identifie.
        </div>
      </PatternCard>

      {/* 3.14 — Pastel Sub-section Headers */}
      <PatternCard title="4.14 Pastel Sub-section Headers — 4 variantes dans HealthView" where="HealthView.tsx — interieur des cards">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "VITAA SCORES", gradient: "from-orange-50 to-amber-50", border: "border-orange-100", iconColor: "text-orange-500" },
            { label: "QUICK WINS", gradient: "from-red-50 to-rose-50", border: "border-red-100", iconColor: "text-red-500" },
            { label: "BENCHMARKS", gradient: "from-blue-50 to-indigo-50", border: "border-blue-100", iconColor: "text-blue-500" },
            { label: "DEPARTEMENTS", gradient: "from-green-50 to-emerald-50", border: "border-green-100", iconColor: "text-green-500" },
          ].map((h) => (
            <div key={h.label} className={cn("bg-gradient-to-r px-2.5 py-1.5 border-b flex items-center gap-1.5 rounded-t-lg", h.gradient, h.border)}>
              <Activity className={cn("h-3.5 w-3.5", h.iconColor)} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">{h.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient PASTEL clair (from-xxx-50 to-yyy-50). py-1.5 px-2.5 — plus petit que les card headers. Texte gray-700 (pas blanc). UNIQUE a HealthView.
        </div>
      </PatternCard>

      {/* 3.15 — AgentSettings Card Headers (10+ gradients) */}
      <PatternCard title="8.6 AgentSettings Card Headers — 10 gradients differents!" where="AgentSettingsView.tsx — CHAQUE section a son gradient">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Mode Decision", gradient: "from-blue-600 to-blue-500" },
            { label: "Competences", gradient: "from-gray-700 to-gray-600" },
            { label: "Style Comm.", gradient: "from-indigo-600 to-indigo-500" },
            { label: "Psychometrie", gradient: "from-violet-600 to-purple-500" },
            { label: "Teintures Cog.", gradient: "from-violet-600 to-purple-500" },
            { label: "Points Forts", gradient: "from-emerald-600 to-emerald-500" },
            { label: "Stats Missions", gradient: "from-cyan-600 to-blue-500" },
            { label: "Activite", gradient: "from-slate-700 to-slate-600" },
            { label: "Collaboration", gradient: "from-rose-600 to-pink-500" },
            { label: "Historique", gradient: "from-amber-600 to-orange-500" },
            { label: "Documents", gradient: "from-teal-600 to-cyan-500" },
            { label: "Catalogue", gradient: "from-indigo-600 to-violet-500" },
          ].map((h) => (
            <div key={h.label} className={cn("bg-gradient-to-r px-2.5 py-1.5 rounded flex items-center gap-1.5", h.gradient)}>
              <span className="text-[8px] font-bold text-white truncate">{h.label}</span>
            </div>
          ))}
        </div>
        <Card className="p-2 mt-2 border-red-200 bg-red-50/50">
          <div className="text-[9px] text-gray-700">
            <strong>PROBLEME MAJEUR:</strong> 12 card headers avec CHACUN un gradient different improvise. Aucune logique de couleur. Meme pattern CSS (px-4 py-2.5) mais couleurs aleatoires. A normaliser vers 3-4 palettes max.
          </div>
        </Card>
      </PatternCard>

      {/* 3.16 — Trisociation Slot Mini-Header */}
      <PatternCard title="8.7 Trisociation Slot Mini-Header — 3 slots colores" where="AgentSettingsView.tsx — nested dans les trisociation cards">
        <div className="space-y-1.5">
          {[
            { label: "PRIMAIRE", role: "Base cognitive", gradient: "from-blue-600 to-blue-500" },
            { label: "CALIBRATEUR", role: "Equilibre", gradient: "from-violet-600 to-violet-500" },
            { label: "AMPLIFICATEUR", role: "Renforcement", gradient: "from-amber-600 to-amber-500" },
          ].map((slot) => (
            <div key={slot.label} className={cn("bg-gradient-to-r px-3 py-1.5 flex items-center gap-2 rounded", slot.gradient)}>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">{slot.label}</span>
              <span className="text-[9px] text-white/60 ml-auto">{slot.role}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          py-1.5 — PLUS PETIT que les card headers (py-2.5). Texte uppercase tracking-widest. 3 gradients fixes (blue/violet/amber).
        </div>
      </PatternCard>

      {/* 3.17 — Synthese : carte de coherence */}
      <SectionTitle num="2.29" title="Synthese — le chaos des headers" />
      <Card className="p-3 border-red-200 bg-red-50/50">
        <div className="text-xs font-bold text-red-800 mb-2">Diagnostic: headers improvises</div>
        <div className="space-y-1.5 text-[9px] text-gray-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>17+ types de headers differents</strong> dans le canvas central. Aucune logique unifiee.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>LiveChat vs PageHeader vs HealthView:</strong> 3 composants header differents pour la meme zone. Backdrop-blur vs opaque vs gradient.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>AgentSettings = 12 gradients:</strong> Chaque section a un gradient unique. Aucune palette partagee.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>HealthView Diagnostic Cards:</strong> Avatar BOT + gradient bleu — pattern qui n'existe nulle part ailleurs.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>3 tailles de padding:</strong> py-1.5 (mini) vs py-2.5 (card) vs py-3 (page). Melangees partout.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>Pastel headers UNIQUES a HealthView:</strong> from-xxx-50 (clair) vs from-xxx-600 (fonce) — 2 systemes incompatibles.</span>
          </div>
        </div>
      </Card>
      <Card className="p-3">
        <div className="text-xs font-bold text-gray-800 mb-2">Recapitulatif — 17 types de headers</div>
        <div className="space-y-1 text-[9px]">
          {[
            { num: "1", type: "PageHeader", bg: "bg-white opaque", padding: "px-4 py-3", usage: "~30 pages", ok: true },
            { num: "2", type: "LiveChat Header", bg: "bg-white/80 blur", padding: "px-4 py-2.5", usage: "Chat", ok: false },
            { num: "2.H", type: "Mode Bar", bg: "bg-white/60", padding: "px-3 py-1.5", usage: "Chat (modes)", ok: false },
            { num: "2.T", type: "Roster Bar", bg: "bg-white/60 border", padding: "py-2 px-3", usage: "Chat (equipe)", ok: false },
            { num: "2.C", type: "Dept Gradient", bg: "gradient bot-color", padding: "px-4 py-3", usage: "12 depts", ok: true },
            { num: "3.TY", type: "BlockHeader (-mx)", bg: "gradient margins neg.", padding: "px-4 py-2.5", usage: "Dashboard", ok: false },
            { num: "3.BT", type: "Room PageHeader", bg: "bg-white opaque", padding: "px-4 py-3", usage: "3 rooms", ok: true },
            { num: "3.BA", type: "Room Card Header", bg: "gradient card", padding: "px-3 py-2", usage: "Rooms int.", ok: false },
            { num: "4", type: "Agent Banner", bg: "image 3:1", padding: "overlay", usage: "Settings", ok: false },
            { num: "3.ST", type: "KPI Card", bg: "gradient + trend", padding: "px-3 py-2", usage: "Health", ok: false },
            { num: "1.CL", type: "Diag Card (dept)", bg: "gradient sans icone", padding: "px-3 py-2.5", usage: "Dept diag", ok: false },
            { num: "6.DB", type: "Bloc Header (dept)", bg: "gradient + icone", padding: "px-4 py-2.5", usage: "Dept blocs", ok: false },
            { num: "6.EC", type: "Health Tab Header", bg: "3 etats dynamiques", padding: "p-4", usage: "Sante", ok: false },
            { num: "2.S", type: "Health Diag Card", bg: "gradient + avatar bot", padding: "px-3 py-2.5", usage: "Sante diag", ok: false },
            { num: "5.MG", type: "Pastel Sub-header", bg: "from-xxx-50 clair", padding: "px-2.5 py-1.5", usage: "Sante int.", ok: false },
            { num: "5.CD", type: "Agent Card Headers", bg: "12 gradients!", padding: "px-4 py-2.5", usage: "Settings", ok: false },
            { num: "17", type: "Trisociation Slot", bg: "blue/violet/amber", padding: "px-3 py-1.5", usage: "Settings", ok: false },
          ].map((h) => (
            <div key={h.num} className={cn("grid grid-cols-5 gap-2 py-1 border-b border-gray-50 last:border-0", !h.ok && "bg-red-50/30")}>
              <span className="font-bold text-gray-800">{h.num}. {h.type}</span>
              <span className="text-gray-500 font-mono">{h.bg}</span>
              <span className="text-gray-500 font-mono">{h.padding}</span>
              <span className="text-gray-400">{h.usage}</span>
              <span className={h.ok ? "text-green-500" : "text-red-500"}>{h.ok ? "Standard" : "Improvise"}</span>
            </div>
          ))}
        </div>
      </Card>
      {/* 3.17 — Comparaison: Gradient headers 2 tailles (ex-12.2) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Gradient headers 2 tailles</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Grande (KPI, Departements)</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Direction</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-blue-600">2.4M$</div>
              </div>
            </Card>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Compacte (Cockpit bots)</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1.5 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[9px] font-bold text-white">CarlOS</span>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-[9px] text-gray-500">Score: 85</div>
              </div>
            </Card>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> Grande partout, sauf cockpit compact.</div>
      </Card>

      <Card className="p-3 border-blue-200 bg-blue-50/50">
        <div className="text-xs font-bold text-blue-800 mb-1.5">Recommendation: 4 headers standard a definir</div>
        <div className="space-y-1 text-[9px] text-gray-700">
          <div><strong>1. PageHeader</strong> — bg-white opaque, px-4 py-3 (deja standard, garder tel quel)</div>
          <div><strong>2. CardHeader gradient</strong> — px-4 py-2.5, gradient bot-color, icone w-7 h-7 (unifier BlockHeader + Room + Agent + Diag)</div>
          <div><strong>3. Mini-header</strong> — px-3 py-1.5, pour les sous-sections internes (trisociation, pastel, etc.)</div>
          <div><strong>4. ChatHeader</strong> — backdrop-blur, specifique au LiveChat (mode bar + roster = sous-composants)</div>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// 4. TABS
// ================================================================

export function Tab5Tabs() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tabs & Navigation</span></div>

      <PatternCard title="5.2 Tabs standard (fond clair)" where="Master GHML, Bureau, Chantiers, Blueprint">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <span className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg shadow-sm">Actif</span>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Inactif</span>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Inactif</span>
        </div>
      </PatternCard>

      <PatternCard title="4.11 Sub-tabs dans gradient (fond fonce)" where="DepartmentTourDeControle (12 depts)">
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 rounded-lg flex gap-1 w-fit">
          <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Actif</span>
          <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
          <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
        </div>
      </PatternCard>

      <PatternCard title="8.8 Tabs avec icones + bordure couleur" where="EspaceBureauView — 7 sections">
        <div className="flex gap-1">
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
            <Lightbulb className="h-3.5 w-3.5" /> Actif
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">
            <Briefcase className="h-3.5 w-3.5" /> Inactif
          </span>
        </div>
      </PatternCard>

      {/* 4.4 — Comparaison des 3 variantes (ex-12.1) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Comparaison — 3 variantes cote a cote</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">A — Fond clair</div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              <span className="px-2 py-1 text-[9px] font-medium bg-gray-900 text-white rounded-lg">Actif</span>
              <span className="px-2 py-1 text-[9px] font-medium text-gray-500 rounded-lg">Inactif</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">B — Gradient</div>
            <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-2 py-1 rounded-lg flex gap-1 w-fit">
              <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Actif</span>
              <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">C — Icones</div>
            <div className="flex gap-1 w-fit">
              <span className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                <Lightbulb className="h-3.5 w-3.5" /> Actif
              </span>
            </div>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> Unifier en 2 max: tabs fond clair + tabs dans gradient.</div>
      </Card>
    </div>
  );
}

// ================================================================
// 5. CARDS
// ================================================================

export function Tab6Cards() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cards</span></div>

      <PatternCard title="4.4 KPI Card standard (Cockpit)" where="Cockpit, Dashboard, Departments">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: BarChart3, label: "Revenus", value: "2.4M$", color: "emerald" },
            { icon: TrendingUp, label: "Croissance", value: "+18%", color: "blue" },
            { icon: Users, label: "Clients", value: "142", color: "violet" },
            { icon: Target, label: "Pipeline", value: "890K$", color: "amber" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-${kpi.color}-600 to-${kpi.color}-500`}>
                <kpi.icon className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{kpi.label}</span>
              </div>
              <div className="px-3 py-2">
                <div className={`text-2xl font-bold text-${kpi.color}-600`}>{kpi.value}</div>
                <div className="text-[9px] text-gray-500">vs trimestre precedent</div>
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="4.5 Card departement 5 colonnes (TRG)" where="DashboardView Tour de Controle">
        <div className="grid grid-cols-5 gap-3">
          {BOTS_12.slice(0, 5).map((d) => (
            <Card key={d.code} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-r from-${d.color}-600 to-${d.color}-500 px-3 py-2 flex items-center gap-2`}>
                <d.icon className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white truncate">{d.dept.split(" ")[0]}</span>
              </div>
              <div className="p-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-${d.color}-500 rounded-full`} style={{ width: "65%" }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="2.36 Card proposition bot (bordure gauche)" where="LiveChat, InnovationDemo, scenarios">
        <div className="space-y-2">
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-blue-400 bg-blue-50/30">
            <p className="text-sm text-gray-700 leading-relaxed">Message du bot avec bordure identitaire couleur...</p>
          </div>
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-violet-400 bg-violet-50/30">
            <p className="text-sm text-gray-700 leading-relaxed">Autre bot, autre couleur...</p>
          </div>
        </div>
      </PatternCard>

      <PatternCard title="5.5 Card gradient content (InnovationDemo)" where="Scenarios, Orbit9 sections">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 flex items-center gap-2">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Titre Section</span>
          </div>
          <div className="p-4 text-xs text-gray-600">Contenu de la card...</div>
          <div className="bg-gray-50 px-4 py-2.5 border-t flex items-center justify-center">
            <button className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-medium">
              <ArrowRight className="h-3.5 w-3.5" /> Action
            </button>
          </div>
        </div>
      </PatternCard>

      <PatternCard title="4.6 Card Cockpit bot (4 colonnes compactes)" where="CockpitView">
        <div className="grid grid-cols-4 gap-2">
          {BOTS_12.slice(0, 4).map((b) => (
            <Card key={b.code} className="p-0 overflow-hidden">
              <div className={`bg-gradient-to-r from-${b.color}-600 to-${b.color}-500 px-2 py-1.5 flex items-center gap-1.5`}>
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[9px] font-bold text-white">{b.nom}</span>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-[9px] text-gray-500">Score: 85/100</div>
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="5.3 Card Chantier (statut + chaleur)" where="MesChantiersView, sidebar droite">
        <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-gray-800">Nom du chantier</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Mis a jour il y a 2h</div>
            </div>
            <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50">Actif</Badge>
          </div>
        </Card>
      </PatternCard>

      <PatternCard title="2.40 Card Board Room (avatar + citation)" where="BoardRoomView — 6 membres">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-14 h-14 rounded-full ring-3 ring-blue-300 shadow-md" />
            <div>
              <p className="text-sm font-bold text-gray-800">CarlOS</p>
              <p className="text-[9px] text-gray-400">CEO — Direction Generale</p>
            </div>
          </div>
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-gray-300 bg-gray-50/50">
            <p className="text-xs text-gray-600 leading-relaxed italic">"Position du conseil sur ce sujet..."</p>
          </div>
        </Card>
      </PatternCard>

      <PatternCard title="2.41 Card Team Proposal (equipe 3 bots)" where="LiveChat — suggestion d'equipe">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl px-5 py-4">
          <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5" /> CarlOS compose votre equipe
          </div>
          <div className="grid grid-cols-3 gap-2">
            {BOTS_12.slice(0, 3).map((bot) => (
              <div key={bot.code} className="bg-white rounded-xl p-3 border text-center">
                <div className="text-xl mb-1">{bot.emoji}</div>
                <div className="text-xs font-bold">{bot.nom}</div>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border">{bot.role}</span>
              </div>
            ))}
          </div>
        </div>
      </PatternCard>

      {/* 5.9 — Comparaison: coins de cards (ex-12.6) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Coins de cards 2 arrondis</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">rounded-xl (InnovationDemo)</div>
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5">
                <span className="text-sm font-bold text-white">Titre</span>
              </div>
              <div className="p-3 text-xs text-gray-600">Contenu</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">rounded-lg (KPI, standard)</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5">
                <span className="text-sm font-bold text-white">Titre</span>
              </div>
              <div className="p-3 text-xs text-gray-600">Contenu</div>
            </Card>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> rounded-xl pour gradient cards, rounded-lg pour le reste.</div>
      </Card>
    </div>
  );
}

// ================================================================
// 6. TYPO
// ================================================================

export function Tab7Typo() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Typographie</span></div>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5">
          <span className="text-sm font-bold text-white">Echelle Typographique Complete</span>
        </div>
        <div className="divide-y">
          {[
            { usage: "Titre page", classes: "text-lg font-bold", ex: "Mon Espace" },
            { usage: "Titre section", classes: "text-sm font-bold text-gray-800", ex: "Direction Generale" },
            { usage: "Header card", classes: "text-xs font-bold uppercase tracking-wider", ex: "REVENUS ANNUELS" },
            { usage: "Body texte", classes: "text-xs text-gray-600", ex: "Description standard" },
            { usage: "Body long", classes: "text-sm text-gray-700 leading-relaxed", ex: "Paragraphe confortable" },
            { usage: "Meta/secondary", classes: "text-[9px] text-gray-400", ex: "Il y a 2 heures" },
            { usage: "Badge texte", classes: "text-[9px] font-bold", ex: "ACTIF" },
            { usage: "KPI valeur", classes: "text-2xl font-bold", ex: "2.4M$" },
            { usage: "KPI label", classes: "text-[9px] text-gray-500", ex: "vs trimestre precedent" },
            { usage: "Score global", classes: "text-4xl font-bold", ex: "87" },
          ].map((row) => (
            <div key={row.usage} className="px-4 py-2.5 flex items-center gap-4">
              <div className="w-28 shrink-0">
                <div className="text-[9px] font-bold text-gray-500 uppercase">{row.usage}</div>
              </div>
              <div className="w-64 shrink-0">
                <code className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">{row.classes}</code>
              </div>
              <div className={row.classes}>{row.ex}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// 7. BOUTONS
// ================================================================

export function Tab8Boutons() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Boutons</span></div>

      <PatternCard title="3.5 Primary" where="CTA principales">
        <div className="flex gap-2">
          <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
            <ArrowRight className="h-3.5 w-3.5" /> Action
          </button>
          <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Valider
          </button>
        </div>
      </PatternCard>

      <PatternCard title="3.6 Pilule d'action (transitions/flows)" where="InnovationDemo, scenarios">
        <div className="flex gap-2">
          <button className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
            <ArrowRight className="h-3.5 w-3.5" /> Explorer
          </button>
          <button className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
            <Zap className="h-3.5 w-3.5" /> Activer
          </button>
        </div>
      </PatternCard>

      <PatternCard title="3.7 Actions LiveChat (6 boutons couleur)" where="Sous chaque bulle bot">
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Challenger", color: "red" },
            { label: "Approfondir", color: "amber" },
            { label: "Consulter", color: "violet" },
            { label: "Cristalliser", color: "emerald" },
            { label: "Nuancer", color: "sky" },
            { label: "Plan d'action", color: "green" },
          ].map((a) => (
            <button key={a.label} className={`text-[9px] px-2 py-1 rounded-full border font-medium bg-${a.color}-50 text-${a.color}-700 border-${a.color}-200`}>
              {a.label}
            </button>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="3.8 Start CTA (gros bouton Room)" where="Rooms, Onboarding">
        <div className="flex gap-3">
          <button className="bg-amber-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-2">
            <Crown className="h-5 w-5" /> Lancer Board Room
          </button>
          <button className="bg-red-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Lancer War Room
          </button>
        </div>
      </PatternCard>

      <PatternCard title="3.9 Pilule completion (fin de flow)" where="Apres une action reussie">
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs text-emerald-700 font-medium">Mission completee avec succes</span>
        </div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 8. BADGES
// ================================================================

export function Tab9Badges() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Badges</span></div>

      <PatternCard title="3.10 Badge status (outline)" where="Chantiers, missions, alerts">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50">Actif</Badge>
          <Badge variant="outline" className="text-[9px] text-amber-600 bg-amber-50">En cours</Badge>
          <Badge variant="outline" className="text-[9px] text-red-600 bg-red-50">Urgent</Badge>
          <Badge variant="outline" className="text-[9px] text-blue-600 bg-blue-50">Nouveau</Badge>
          <Badge variant="outline" className="text-[9px] text-gray-600 bg-gray-50">Archive</Badge>
        </div>
      </PatternCard>

      <PatternCard title="3.11 Badge type (fond colore)" where="Categories, tags departement">
        <div className="flex gap-2 flex-wrap">
          {BOTS_12.slice(0, 6).map((b) => (
            <span key={b.code} className={`bg-${b.color}-100 text-${b.color}-700 text-[9px] px-1.5 py-0.5 rounded font-medium`}>
              {b.dept.split(" ")[0]}
            </span>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="3.12 Badge inline (dans gradient header)" where="Cards gradient, KPI headers">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 flex items-center gap-2 rounded-lg">
          <span className="text-sm font-bold text-white">Direction</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-blue-800">12 blocs</span>
        </div>
      </PatternCard>

      <PatternCard title="3.13 Badge mode reflexion (pill)" where="LiveChat header, bulles">
        <div className="flex gap-1.5 flex-wrap">
          {MODES_REFLEXION.map((m) => {
            const Icon = m.icon;
            return (
              <span key={m.id} className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border font-medium bg-${m.color}-50 text-${m.color}-600 border-${m.color}-200`}>
                <Icon className="h-3.5 w-3.5" /> {m.label}
              </span>
            );
          })}
        </div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 9. BULLES
// ================================================================

export 
function TabReglages() {
  return (
    <div className="space-y-4">
      <SectionTitle num="8" title="Reglages — Profil, Parametres, FAQ" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Section Reglages accessible via Top Bar droite (icone utilisateur). Structure FE.5 C.2.2.7.
        Sources: AgentSettingsView.tsx (737 lignes), TopBar zone droite
      </div>

      {/* ══════ C.2.2.7 — COPIE FIDELE de MasterNavigationPage.tsx ══════ */}
      <Card className="p-4 bg-gray-50/50 border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-gray-600 shrink-0" />
          <span className="text-sm font-semibold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.7</span>Réglages</span>
          <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200">DÉPLACÉ → Top Bar droite</Badge>
        </div>
        <p className="text-xs text-gray-500 mb-2 italic">Les réglages sont maintenant accessibles via l'icône utilisateur dans la Top Bar (zone droite).</p>
        <NavLevel>
          <NavItem icon={User} label="Mon Profil" status="planifie" color="text-gray-500" sub="Informations personnelles, photo, préférences" />
          <NavItem icon={Settings} label="Réglages Généraux" status="planifie" color="text-gray-500" sub="Paramètres de l'instance, notifications" />
          <NavItem icon={Settings} label="Réglages Agents AI" viewId="agent-settings" status="live" color="text-violet-500" sub="Configuration voix, modèles, comportement (ex-sidebar)" />
          <NavItem icon={HelpCircle} label="FAQ CarlOS" status="planifie" color="text-blue-500" sub="CarlOS répond aux questions — guide contextuel" />
        </NavLevel>
        <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-dashed border-blue-200">
          <p className="text-[9px] text-blue-700 font-medium">
            SPRINT DÉDIÉ: Détailler le contenu exact des réglages (standards).
            Ne pas réinventer la roue — éléments de base classiques.
            Retirer le bouton "Mes Réglages" fixe en bas de la sidebar gauche.
          </p>
        </div>
      </Card>

      {/* ══════ PATTERNS VISUELS ══════ */}
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patterns visuels — Reglages</span>
      </div>

      <PatternCard title="8.1 Menu deroulant utilisateur (Top Bar)" where="TopBar.tsx — zone droite, icone utilisateur">
        <div className="flex justify-end">
          <Card className="w-56 p-0 overflow-hidden shadow-lg border">
            <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">CF</div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Carl Fugere</div>
                <div className="text-[9px] text-gray-400">CEO — Usine Bleue AI</div>
              </div>
            </div>
            <div className="py-1">
              {[
                { label: "Mon Profil", icon: "👤" },
                { label: "Reglages Generaux", icon: "⚙️" },
                { label: "Reglages Agents AI", icon: "🤖" },
                { label: "FAQ", icon: "❓" },
                { label: "Abonnement", icon: "💳" },
              ].map(item => (
                <div key={item.label} className="px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                  <span className="text-xs">{item.icon}</span>
                  <span className="text-xs text-gray-700">{item.label}</span>
                </div>
              ))}
              <div className="border-t mt-1 pt-1">
                <div className="px-3 py-2 hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                  <span className="text-xs">🚪</span>
                  <span className="text-xs text-red-600">Deconnexion</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Dropdown standard: avatar + nom en haut, 5 liens, separateur, deconnexion en rouge. Shadow-lg, w-56, border, rounded.
        </div>
      </PatternCard>

      <PatternCard title="8.2 Page Profil Utilisateur (a construire)" where="ProfilView.tsx — sprint dedie">
        <Card className="p-4 border-dashed border-gray-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-blue-400" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
              <div className="h-2 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Nom complet", "Courriel", "Telephone", "Entreprise"].map(f => (
              <div key={f} className="space-y-1">
                <div className="text-[9px] font-medium text-gray-500 uppercase">{f}</div>
                <div className="h-7 bg-gray-100 rounded border border-gray-200" />
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-2 text-[9px] text-gray-500">
          Page profil standard: avatar editable, champs formulaire. Sprint dedie — elements classiques.
        </div>
      </PatternCard>

      <PatternCard title="8.3 Page Reglages Generaux (a construire)" where="ReglagesView.tsx — sprint dedie">
        <Card className="p-4 border-dashed border-gray-300">
          <div className="space-y-3">
            {[
              { section: "Notifications", items: ["Email", "Push", "Telegram"] },
              { section: "Langue & Region", items: ["Francais (QC)", "Fuseau horaire"] },
              { section: "Securite", items: ["Mot de passe", "2FA"] },
            ].map(s => (
              <div key={s.section}>
                <div className="text-[9px] font-bold text-gray-600 uppercase mb-1.5">{s.section}</div>
                <div className="space-y-1">
                  {s.items.map(item => (
                    <div key={item} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-700">{item}</span>
                      <div className="w-8 h-4 bg-gray-200 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-2 text-[9px] text-gray-500">
          Sections groupees avec toggles/selects. Pattern standard settings. Sprint dedie.
        </div>
      </PatternCard>

      {/* ══════ REGLAGES AGENTS AI — Patterns visuels complets ══════ */}
      <TabMonEquipeAI />

      {/* ══════ NOTE ══════ */}
      <Card className="p-3 bg-blue-50 border-blue-200 border-dashed">
        <div className="text-[9px] text-blue-700 font-medium leading-relaxed">
          SPRINT DEDIE: Detailler le contenu exact des reglages (standards — pas reinventer la roue).
          CarlOS est disponible en FAQ contextuelle — il repond aux questions de l'utilisateur directement.
        </div>
      </Card>
    </div>
  );
}

export function Tab10Bulles() {
  return (
    <div className="space-y-4">
      <SectionTitle num="4" title="LiveChat & Bulles — layout, headers, cards, bulles" />
      <div className="text-xs text-gray-600 leading-relaxed">Tout ce qui compose le LiveChat : layout, headers, cards et toutes les variantes de bulles.</div>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Layout & Headers LiveChat</span></div>

      {/* 2.4 — Chat 2xl */}
      <PatternCard title="4.LC1 CHAT — maxWidth 2xl" where="LiveChat, Discussions">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-white/80 border-b px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="h-2 bg-gray-300 rounded w-20" /><span className="text-[8px] bg-blue-50 text-blue-600 px-1 rounded-full">Standard</span></div>
            <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-[8px] text-green-600">LIVE</span></div>
          </div>
          <div className="p-3 max-w-[180px] mx-auto space-y-2">
            <div className="flex gap-1.5 items-start">
              <div className="w-4 h-4 rounded-full bg-blue-200 shrink-0 mt-0.5" />
              <div className="bg-white border border-l-2 border-l-blue-400 rounded-lg px-2 py-1.5 flex-1">
                <div className="h-1 bg-blue-200 rounded w-8 mb-1" /><div className="h-1 bg-gray-100 rounded w-full mb-0.5" /><div className="h-1 bg-gray-100 rounded w-3/4" />
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex gap-1"><div className="h-1 bg-gray-200 rounded w-6" /><div className="h-1 bg-blue-100 rounded w-8" /></div>
              </div>
            </div>
            <div className="flex justify-end"><div className="bg-blue-600 rounded-lg px-2 py-1.5 max-w-[80%]"><div className="h-1 bg-white/50 rounded w-full mb-0.5" /><div className="h-1 bg-white/30 rounded w-3/4" /></div></div>
            <div className="flex gap-0.5 ml-5">{["bg-red-100","bg-amber-100","bg-violet-100","bg-emerald-100"].map((c,i) => <div key={i} className={cn("h-2 rounded-full w-8", c)} />)}</div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">max-w-2xl — Bulles + footer contextuel + boutons d'action</div>
      </PatternCard>

      <PatternCard title="4.LC2 LiveChat Header — barre contextuelle translucide" where="LiveChat.tsx — ZONE CHAT">
        <div className="border rounded-xl shadow-sm">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <button className="text-gray-400 p-1 rounded-lg hover:bg-gray-100"><ChevronRight className="h-3.5 w-3.5 rotate-180" /></button>
              <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-200 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">Nouvelle mission</div>
                <div className="text-[9px] text-gray-400 flex items-center gap-1.5">
                  CarlOS — Direction Generale
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-600">
                    <Zap className="h-2.5 w-2.5" /> Standard
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><Clock className="h-3.5 w-3.5" /></button>
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><Bookmark className="h-3.5 w-3.5" /></button>
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><MessageSquare className="h-3.5 w-3.5" /></button>
              <button className="text-gray-400 p-1.5 rounded-lg hover:bg-gray-100"><Plus className="h-3.5 w-3.5" /></button>
              <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-green-600 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-[9px]">
          <div className="bg-blue-50 rounded p-1.5"><strong>Fond:</strong> bg-white/80 backdrop-blur-sm</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Avatar:</strong> w-7 h-7 photo bot actif (dynamique)</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Ligne 2:</strong> nom bot + badge mode</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Droite:</strong> Park, Idees, Threads, +, LIVE</div>
        </div>
      </PatternCard>

      <PatternCard title="4.LC3 Bot Roster Bar — equipe active dans le chat" where="LiveChat.tsx — sous le LiveChat Header">
        <div className="border rounded-xl shadow-sm">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-[9px] text-gray-400 font-medium shrink-0">Equipe active :</span>
            <div className="flex gap-1.5 flex-wrap flex-1">
              {[
                { code: "BCO", name: "CarlOS", text: "text-blue-600", border: "border-blue-200", ring: "ring-blue-300" },
                { code: "BCT", name: "Thierry", text: "text-violet-600", border: "border-violet-200", ring: "ring-violet-300" },
              ].map((bot) => (
                <div key={bot.code} className={cn("flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white border", bot.text, bot.border)}>
                  <img src={BOT_AVATAR[bot.code] || ""} alt={bot.name} className={cn("w-4 h-4 rounded-full object-cover ring-1", bot.ring)} />
                  <span>{bot.name}</span>
                  <button className="ml-0.5 text-gray-300 hover:text-red-400">x</button>
                </div>
              ))}
            </div>
            <select className="text-[9px] text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-full px-2 py-0.5">
              <option>+ Bot</option>
            </select>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-blue-50 rounded p-1.5"><strong>Fond:</strong> bg-white/80 backdrop-blur-sm</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Position:</strong> sous header quand equipe proposee</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Avatar:</strong> w-4 h-4 rounded-full + ring couleur bot</div>
        </div>
      </PatternCard>

      <PatternCard title="4.LC4 Card proposition bot (bordure gauche)" where="LiveChat, InnovationDemo, scenarios">
        <div className="space-y-2">
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-blue-400 bg-blue-50/30">
            <p className="text-sm text-gray-700 leading-relaxed">Message du bot avec bordure identitaire couleur...</p>
          </div>
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-violet-400 bg-violet-50/30">
            <p className="text-sm text-gray-700 leading-relaxed">Autre bot, autre couleur...</p>
          </div>
        </div>
      </PatternCard>

      <PatternCard title="4.LC5 Card Team Proposal (equipe 3 bots)" where="LiveChat — suggestion d'equipe">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl px-5 py-4">
          <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5" /> CarlOS compose votre equipe
          </div>
          <div className="grid grid-cols-3 gap-2">
            {BOTS_12.slice(0, 3).map((bot) => (
              <div key={bot.code} className="bg-white rounded-xl p-3 border text-center">
                <div className="text-xl mb-1">{bot.emoji}</div>
                <div className="text-xs font-bold">{bot.nom}</div>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border">{bot.role}</span>
              </div>
            ))}
          </div>
        </div>
      </PatternCard>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bulles de chat</span></div>

      {/* 9.1 — Bot standard */}
      <PatternCard title="4.1 Bulle bot standard (bordure couleur)" where="LiveChat — chaque message bot">
        <div className="flex gap-2 items-start">
          <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-300 mt-1" />
          <div className="bg-white border border-gray-100 border-l-[3px] border-l-blue-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm max-w-[85%]">
            <div className="text-xs font-semibold text-blue-600 mb-1">CarlOS</div>
            <div className="text-sm text-gray-700 leading-relaxed">Voici ma recommandation pour votre situation...</div>
            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">Direction</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span className="text-[9px] text-gray-400">Connecter</span></span>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5 text-gray-400" />
                <Copy className="h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.2 — Utilisateur */}
      <PatternCard title="4.2 Bulle utilisateur (droite)" where="LiveChat — messages user">
        <div className="flex justify-end">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm">
            <div className="text-sm leading-relaxed">Comment optimiser mes ventes?</div>
          </div>
        </div>
      </PatternCard>

      {/* 9.3 — Challenge */}
      <PatternCard title="4.3 Bulle Challenge (bordure rouge + branch)" where="LiveChat — bouton Challenger">
        <div className="space-y-2">
          <div className="flex items-center gap-2 ml-10">
            <div className="w-6 h-px bg-red-300" />
            <span className="text-[9px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Challenge</span>
            <div className="flex-1 h-px bg-red-200" />
          </div>
          <div className="flex gap-2 items-start ml-10">
            <img src={BOT_AVATAR["BCS"] || ""} alt="Sophie" className="w-8 h-8 rounded-full object-cover ring-2 ring-red-300 mt-1" />
            <div className="bg-white border border-red-100 border-l-[3px] border-l-red-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold text-red-600 mb-1">Sophie — CSO</div>
              <div className="text-sm text-gray-700 leading-relaxed">Je conteste cette approche. Avez-vous considere...</div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.4 — Consultation */}
      <PatternCard title="4.4 Bulle Consultation (bordure violet + branch)" where="LiveChat — bouton Consulter">
        <div className="space-y-2">
          <div className="flex items-center gap-2 ml-10">
            <div className="w-6 h-px bg-violet-300" />
            <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Consultation — Thierry</span>
            <div className="flex-1 h-px bg-violet-200" />
          </div>
          <div className="flex gap-2 items-start ml-10">
            <img src={BOT_AVATAR["BCT"] || ""} alt="Thierry" className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-300 mt-1" />
            <div className="bg-white border border-violet-100 border-l-[3px] border-l-violet-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold text-violet-600 mb-1">Thierry — CTO</div>
              <div className="text-sm text-gray-700 leading-relaxed">D'un point de vue technique, je recommande...</div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.5 — Synthese */}
      <PatternCard title="4.5 Bulle Synthese (ambre, shadow-md)" where="LiveChat — bouton Cristalliser">
        <div className="space-y-2">
          <div className="flex items-center gap-2 ml-10">
            <div className="w-6 h-px bg-amber-300" />
            <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Synthese</span>
            <div className="flex-1 h-px bg-amber-200" />
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md ml-10">
            <div className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Synthese CarlOS</div>
            <div className="text-sm text-amber-900 leading-relaxed">Resume structure de la conversation avec points cles...</div>
          </div>
        </div>
      </PatternCard>

      {/* 9.6 — Coaching */}
      <PatternCard title="4.6 Bulle Coaching / System (bleue)" where="LiveChat — messages systeme">
        <div className="flex gap-2 items-start">
          <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-300 mt-1" />
          <div className="bg-blue-50 border border-blue-200 border-l-[3px] border-l-blue-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
            <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> CarlOS — Coaching</div>
            <div className="text-sm text-blue-800 leading-relaxed">Conseil proactif pour votre situation...</div>
            <div className="mt-2 flex gap-1.5">
              <button className="text-[9px] px-2 py-1 rounded-lg bg-white border border-blue-300 text-blue-700 font-medium">Option A</button>
              <button className="text-[9px] px-2 py-1 rounded-lg bg-white border border-blue-300 text-blue-700 font-medium">Option B</button>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.7 — Team Proposal */}
      <PatternCard title="4.7 Bulle Team Proposal (equipe 3 bots)" where="LiveChat — CarlOS compose l'equipe">
        <div className="space-y-2">
          <div className="flex items-center gap-2 ml-10">
            <div className="w-6 h-px bg-blue-300" />
            <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Equipe proposee</span>
            <div className="flex-1 h-px bg-blue-200" />
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md ml-10 max-w-[90%]">
            <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5"><Brain className="h-3.5 w-3.5" /> CarlOS compose votre equipe</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {BOTS_12.slice(0, 3).map(bot => (
                <div key={bot.code} className="bg-white rounded-xl p-3 border text-center">
                  <div className="text-xl mb-1">{bot.emoji}</div>
                  <div className="text-xs font-bold">{bot.nom}</div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-blue-100 text-blue-700 border-blue-300">PRIMAIRE</span>
                </div>
              ))}
            </div>
            <button className="w-full py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white flex items-center justify-center gap-2"><Users className="h-4 w-4" /> Activer cette equipe</button>
          </div>
        </div>
      </PatternCard>

      {/* 9.8 — Thinking */}
      <PatternCard title="4.8 Animation de reflexion (thinking)" where="LiveChat — pendant la reponse">
        <div className="flex gap-2 items-start">
          <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-300 mt-1" />
          <div className="bg-white border border-l-[3px] border-l-blue-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
            <div className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 animate-pulse" /> CarlOS reflechit...</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-green-600 opacity-60"><CheckCircle2 className="h-3.5 w-3.5" /><span className="line-through">Consultation du C-Level...</span></div>
              <div className="flex items-center gap-2.5 text-sm text-blue-600"><Loader2 className="h-3.5 w-3.5 animate-spin" /><Search className="h-3.5 w-3.5" /><span>Analyse de la tension...</span></div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.9 — Sentinelle */}
      <PatternCard title="4.9 Bulle Sentinelle (alerte ambre)" where="LiveChat — anti-boucle / alerte">
        <div className="flex gap-2 items-start">
          <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300 mt-1" />
          <div className="bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-400 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
            <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Sentinelle CarlOS</div>
            <div className="text-sm text-amber-800 leading-relaxed">Je detecte une boucle repetitive. Voulez-vous cristalliser ou changer d'angle?</div>
            <div className="mt-2 flex gap-1.5">
              <button className="text-[9px] px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-700 font-medium">Cristalliser</button>
              <button className="text-[9px] px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-700 font-medium">Changer d'angle</button>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.10 — COMMAND progress */}
      <PatternCard title="4.10 COMMAND Progress (4 etapes pipeline)" where="LiveChat — mission COMMAND">
        <div className="flex gap-2 items-start">
          <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-300 mt-1" />
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 border-l-[3px] border-l-blue-500 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
            <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 animate-pulse" /> COMMAND en cours</div>
            <div className="flex items-center gap-1">
              {[{l:"SCAN",c:"bg-blue-500"},{l:"STRATEGIE",c:"bg-violet-500"},{l:"EXECUTION",c:"bg-gray-200"},{l:"BILAN",c:"bg-gray-200"}].map((s,i) => (
                <div key={s.l} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn("w-full h-1.5 rounded-full", s.c)} />
                  <span className={cn("text-[9px] font-semibold", i < 2 ? "text-blue-600" : "text-gray-300")}>{s.l}{i < 2 && " ✓"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.11 — CarlOS Presence */}
      <PatternCard title="4.11 CarlOS Presence (bulle d'aide contextuelle)" where="CarlOSPresence.tsx — toutes les pages">
        <div className="flex items-start gap-3">
          <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
          <div>
            <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-gray-800">CarlOS</span><span className="text-[9px] text-gray-400">CEO</span></div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="text-sm text-gray-700 leading-relaxed">Je suis pret a vous accompagner...</div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.12 — Multi-consult animation */}
      <PatternCard title="4.12 Multi-Consult (animation consultation)" where="LiveChat — consultation multi-bots">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border rounded-xl px-4 py-3">
          <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Network className="h-3.5 w-3.5 animate-pulse text-blue-500" /> Consultation en cours...</div>
          <div className="flex items-center gap-3">
            {BOTS_12.slice(0, 3).map((b, i) => (
              <div key={b.code} className="text-center">
                <img src={BOT_AVATAR[b.code] || ""} alt={b.nom} className={cn("w-8 h-8 rounded-full object-cover mx-auto", i === 1 ? "ring-2 ring-blue-400 scale-110 shadow-md" : i === 0 ? "ring-2 ring-green-400" : "opacity-30 ring-2 ring-gray-200")} />
                <div className="text-[9px] text-gray-500 mt-0.5">{b.nom}</div>
              </div>
            ))}
            <ArrowRight className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </div>
        </div>
      </PatternCard>

      {/* 9.13 — SUPPRIME (doublon de 3.3 dans Tab Headers) */}

      {/* 9.13 — Footer structure */}
      <SectionTitle num="4.13" title="Structure Footer de bulle" />
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5">
          <span className="text-sm font-bold text-white">Anatomie du footer de bulle</span>
        </div>
        <div className="p-4 space-y-4">
          {/* Live footer example */}
          <div className="border rounded-xl px-5 py-4 bg-white shadow-sm">
            <div className="text-sm text-gray-500 mb-2 italic">...contenu du message...</div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">Direction</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span className="text-[9px] text-gray-400">Connecter</span></span>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-500">Brainstorm</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span className="text-[9px] text-gray-500 font-medium">COMMAND</span></span>
                <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-emerald-50 text-emerald-600">VERITE 2/3</span>
                <span className="text-[9px] text-amber-500 font-medium truncate max-w-[70px]">Mon Chantier</span>
                <span className="text-[9px] text-gray-300 ml-auto">87%</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Volume2 className="h-3.5 w-3.5 text-gray-400" />
                <Copy className="h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div className="bg-gray-50 rounded p-2 space-y-1.5">
              <div className="font-bold text-gray-700 uppercase">Gauche — BubbleFooterContext</div>
              <div className="flex items-center gap-1"><span className="bg-gray-100 px-1 rounded text-gray-600">Section</span> GPS de la page active</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span className="text-gray-600">Phase CREDO (C/R/E/D/O)</span></div>
              <div className="flex items-center gap-1"><span className="bg-amber-50 text-amber-500 px-1 rounded">Mode</span> Reflexion active (si pas Standard)</div>
              <div className="flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 text-violet-400" /><span className="text-gray-600">Indicateur branche (si fil parallele)</span></div>
              <div className="flex items-center gap-1"><span className="text-amber-500 font-medium">Chantier</span> Nom du chantier lie</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-gray-600">COMMAND dot (crise=rouge pulse, tactique=ambre, routine=bleu)</span></div>
              <div className="flex items-center gap-1"><span className="bg-emerald-50 text-emerald-600 px-1 rounded">VERITE X/3</span> QC Sentinel (ancrage/intention/contraintes)</div>
              <div className="flex items-center gap-1"><span className="text-gray-300">87%</span> Precision pourcentage</div>
            </div>
            <div className="bg-gray-50 rounded p-2 space-y-1.5">
              <div className="font-bold text-gray-700 uppercase">Droite — Actions</div>
              <div className="flex items-center gap-1"><Volume2 className="h-3.5 w-3.5 text-gray-400" /><span className="text-gray-600">TTS — Ecouter le message (toggle)</span></div>
              <div className="flex items-center gap-1"><Copy className="h-3.5 w-3.5 text-gray-400" /><span className="text-gray-600">Copier le contenu</span></div>
              <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-500" /><span className="text-gray-600">Confirmation copie (temporaire)</span></div>
              <div className="font-bold text-gray-700 uppercase mt-3">Sous le footer — Badges inline</div>
              <div className="flex items-center gap-1"><span className="bg-blue-50 text-blue-700 text-[8px] px-1 rounded-full border border-blue-200">Canvas Action</span><span className="text-gray-600">Navigate, push, annotate</span></div>
              <div className="flex items-center gap-1"><span className="bg-emerald-50 text-emerald-700 text-[8px] px-1 rounded-full border border-emerald-200">Cascade</span><span className="text-gray-600">Suggestions inter-departement</span></div>
            </div>
          </div>
        </div>
      </Card>

      {/* 9.14 — Action buttons rows */}
      <PatternCard title="4.14 Boutons d'action sous bulle (2 rangees)" where="LiveChat — sous le dernier message bot">
        <div className="space-y-2">
          <div className="text-[9px] font-bold text-gray-500 uppercase">Rangee 1 — Toujours visible</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Challenger", color: "red" },
              { label: "Approfondir", color: "amber" },
              { label: "Consulter", color: "violet" },
              { label: "Cristalliser", color: "emerald" },
            ].map(a => <button key={a.label} className={`text-[9px] px-2 py-1 rounded-full border font-medium bg-${a.color}-50 text-${a.color}-700 border-${a.color}-200`}>{a.label}</button>)}
          </div>
          <div className="text-[9px] font-bold text-gray-500 uppercase mt-2">Rangee 2 — Avancee (filtre protocole)</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Nuancer", color: "sky" },
              { label: "Fil parallele", color: "teal" },
              { label: "Plan d'action", color: "green" },
              { label: "Risques", color: "orange" },
              { label: "Et si?", color: "purple" },
              { label: "Deleguer", color: "indigo" },
            ].map(a => <button key={a.label} className={`text-[9px] px-2 py-1 rounded-full border font-medium bg-${a.color}-50 text-${a.color}-700 border-${a.color}-200`}>{a.label}</button>)}
          </div>
        </div>
      </PatternCard>

      {/* 9.15 — Welcome suggestions */}
      <PatternCard title="4.15 Suggestions d'accueil (chat vide)" where="LiveChat — quand aucun message">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-3 flex items-center justify-center shadow-xl">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="text-sm font-bold text-gray-800 mb-3">Comment puis-je vous aider?</div>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-xs mx-auto">
            {[
              { label: "Analyser mes ventes", color: "red" },
              { label: "Brainstorm produit", color: "amber" },
              { label: "Plan strategique", color: "indigo" },
              { label: "Diagnostiquer", color: "emerald" },
            ].map(s => <button key={s.label} className={`flex items-center gap-1 text-xs px-3 py-2 rounded-xl border font-medium bg-${s.color}-50 border-${s.color}-200 text-${s.color}-700`}>{s.label}</button>)}
          </div>
        </div>
      </PatternCard>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SECTIONS IMPORTEES DE FE.1 (PageTypePage — FE1TabBullesActions) */}
      {/* ════════════════════════════════════════════════════════════ */}

      {/* 9.16 — Taxonomie & Regles */}
      <PatternCard title="4.16 Taxonomie Bulles & Actions — Regles" where="Design ref — regles globales de conception des bulles">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-800">Taxonomie Bulles & Actions — v2</span>
            </div>
            <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Validée Gemini + audit complet</span>
          </div>
          <p className="text-xs text-indigo-700 mb-2">
            Chaque bulle = une responsabilité. Chaque bouton répond à : <strong>"Quelle est ma prochaine action cognitive?"</strong>
          </p>
          <div className="grid grid-cols-3 gap-2 text-[9px]">
            <div className="bg-white rounded-lg px-2 py-1.5 border border-indigo-100">
              <span className="font-semibold text-indigo-700">Règle #1</span>
              <p className="text-gray-500 mt-0.5">Max 3 boutons visibles → menu "..." pour le reste</p>
            </div>
            <div className="bg-white rounded-lg px-2 py-1.5 border border-indigo-100">
              <span className="font-semibold text-indigo-700">Règle #2</span>
              <p className="text-gray-500 mt-0.5">Jamais suggérer un bouton qui crée une boucle</p>
            </div>
            <div className="bg-white rounded-lg px-2 py-1.5 border border-indigo-100">
              <span className="font-semibold text-indigo-700">Naming</span>
              <p className="text-gray-500 mt-0.5">"Fil parallèle" ✓ · "Nuancer" (≠ Contre-argument)</p>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.17 — Catalogue complet des actions */}
      <PatternCard title="4.17 Catalogue complet des actions (4 familles)" where="Design ref — toutes les actions disponibles dans les bulles">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
            <div className="text-[9px] font-bold text-blue-700 uppercase tracking-wide">Branches & Workflow</div>
            {[
              ["🌿", "Fil parallèle", "Ouvrir un sous-fil sans quitter le principal"],
              ["📋", "Synthétiser", "Résumer & extraire les points clés du fil"],
              ["⏸", "Parker ce fil", "Mettre en pause pour revenir plus tard"],
              ["🎯", "Promouvoir en projet", "Transformer en action concrète (Cahier SMART)"],
              ["📤", "Exporter / Partager", "Copier, télécharger ou envoyer à l'équipe"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[9px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
            <div className="text-[9px] font-bold text-red-700 uppercase tracking-wide">Confrontation & Profondeur</div>
            {[
              ["⚔️", "Challenger", "Défier la réponse du bot (max 2/bulle, 4/fil)"],
              ["💬", "Nuancer", "Apporter une perspective alternative (≠ Contre-argument)"],
              ["🔀", "Fusionner", "Réconcilier plusieurs perspectives en une synthèse"],
              ["💬", "Débat entre bots", "Lancer un débat structuré entre 2+ bots"],
              ["👥", "Consulter [bot]", "Inviter un autre bot sur la question en cours"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[9px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">Conservation & Mémoire</div>
            {[
              ["💎", "Cristalliser", "Sauvegarder l'insight dans la banque d'idées"],
              ["📌", "Extraire → rapport", "Pousser vers un pré-rapport ou document"],
              ["🔁", "Approfondir", "Demander plus de détail sur ce point spécifique"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[9px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
            <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
              Actions futures <span className="bg-emerald-200 text-emerald-800 px-1 rounded text-[9px]">Gemini suggest.</span>
            </div>
            {[
              ["⚡", "Plan d'action", "Générer un plan actionnable immédiat"],
              ["🛡️", "Évaluer les risques", "Matrice de risques sur la situation"],
              ["👤", "Déléguer", "Assigner à un membre de l'équipe"],
              ["🔮", "Scénario Et si?", "Explorer des hypothèses alternatives"],
            ].map(([e, l, d]) => (
              <div key={String(l)} className="flex items-start gap-2">
                <span className="text-base shrink-0 leading-none">{e}</span>
                <div><div className="text-[11px] font-semibold text-gray-800">{l}</div><div className="text-[9px] text-gray-400">{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </PatternCard>

      {/* 9.18 — Options textuelles vs Boutons d'action */}
      <PatternCard title="4.18 Options textuelles vs Boutons d'action (2 niveaux)" where="LiveChat — hierarchie visuelle dans chaque bulle bot">
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-3">
          <p className="text-xs text-violet-800 leading-relaxed">
            <strong>Ce sont deux niveaux distincts.</strong> Les options textuelles répondent à <em>"de quoi on parle?"</em> (contexte-spécifique, générées par le bot).
            Les boutons d'action répondent à <em>"comment je veux traiter ça?"</em> (toujours disponibles, structurels).
            Ils coexistent avec une hiérarchie visuelle claire — options en premier (plus grosses), actions en dessous (plus discrètes).
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm shrink-0 mt-1 ring-2 ring-blue-300">🎩</div>
            <div className="bg-white border border-l-[3px] border-blue-200 border-l-blue-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-sm">
              <div className="text-xs font-semibold text-blue-700 mb-1">CarlOS — CEO</div>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">Le pipeline affiche $73K en attente. Y'a-t-il un prospect sur lequel on devrait accélérer?</p>
              <div className="mb-2.5">
                <div className="text-[9px] text-gray-400 font-medium mb-1">Options (générées par le bot) :</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Bauches — $45K", "Pourquoi ça stagne?", "Plan closing Q2"].map(o => (
                    <button key={o} className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-300 text-blue-700 font-medium cursor-pointer hover:bg-blue-100">{o}</button>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <div className="text-[9px] text-gray-400 font-medium mb-1">Actions (toujours disponibles) :</div>
                <div className="flex flex-wrap gap-1.5">
                  <button className="text-[9px] px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium cursor-pointer">🌿 Fil parallèle</button>
                  <button className="text-[9px] px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-medium cursor-pointer">⚔️ Challenger</button>
                  <button className="text-[9px] px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium cursor-pointer">💎 Cristalliser</button>
                  <button className="text-[9px] px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 font-medium cursor-pointer">···</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-[9px]">
            <span className="text-green-600">✅ Deux niveaux clairs — pas de confusion</span>
            <span className="text-gray-400">Options au-dessus = contenu · Actions en dessous = structure</span>
          </div>
        </div>
      </PatternCard>

      {/* 9.19 — Focus Card */}
      <PatternCard title="4.19 Focus Card (clic dashboard → nouvelle discussion)" where="LiveChat — ouverture depuis un bloc dashboard">
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 ring-2 ring-blue-300 mt-1">🎩</div>
            <div className="bg-white border border-l-[3px] border-blue-200 border-l-blue-400 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-md">
              <div className="flex items-center gap-1.5 mb-2"><span className="text-xs font-bold text-blue-700">CarlOS</span><span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold">CEO</span></div>
              <div className="space-y-1 mb-2 pb-2 border-b border-gray-100 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Bauches inc.</span><span className="font-semibold text-blue-700">$45 000</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Innovtech</span><span className="font-semibold text-blue-700">$28 500</span></div>
              </div>
              <p className="text-sm text-blue-800 mb-3">Le pipeline montre 73K$ en attente. Y'a-t-il un prospect à accélérer?</p>
              <div className="mb-2">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5">Options (bot) :</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Top opportunités", "Pourquoi ça stagne?", "Plan closing"].map(o => (
                    <button key={o} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-700 font-medium cursor-pointer">"{o}"</button>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5">Actions :</div>
                <div className="flex flex-wrap gap-1.5">
                  <button className="text-[9px] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-700 font-medium cursor-pointer">🔍 Analyser</button>
                  <button className="text-[9px] px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-300 text-indigo-700 font-medium cursor-pointer">🎯 Décider</button>
                  <button className="text-[9px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-medium cursor-pointer">⚡ Plan d'action</button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <div className="text-[9px] text-gray-400 font-medium w-full mb-1">Mode :</div>
                  {[["👁","Analyse"],["🎯","Stratégie"],["⚖️","Décision"],["🔥","Crise"]].map(([e,l]) => (
                    <button key={String(l)} className="text-[9px] px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-600 font-medium cursor-pointer">{e} {l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.20 — Voice bubble */}
      <PatternCard title="4.20 Voice bubble (transcript vocal LiveKit)" where="LiveChat — messages vocaux transcrits">
        <p className="text-xs text-gray-600">Même boutons que <strong>Normal Bot</strong> + icône 🎙️ Vocal visible. Pas de traitement différent. Le transcript est injecté comme message assistant standard.</p>
      </PatternCard>

      {/* 9.21 — Verdict Card */}
      <PatternCard title="4.21 Verdict Card (Go/No-Go)" where="Design ref — conclusion mode Decision">
        <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-800">8 — Verdict Card (Go/No-Go)</span>
          </div>
          <p className="text-[9px] text-gray-500 mb-2">Conclusion structurée d'un mode Décision — matrice pondérée + consensus + plan</p>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {["⚔️ Challenger verdict (max 1)", "💬 Nuancer", "📋 Cahier SMART", "📤 Exporter"].map(a => (
              <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">{a}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 font-medium">Modes :</span>
            {["Débat", "Crise", "Analyse"].map(m => <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">{m}</span>)}
          </div>
          <p className="text-[9px] text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Max 1 challenge du verdict — après : actions concrètes seulement</p>
        </div>
      </PatternCard>

      {/* 9.22 — Perspectives Card */}
      <PatternCard title="4.22 Perspectives Card (multi-bots)" where="Design ref — consultation simultanee 2+ bots">
        <div className="border border-violet-200 bg-violet-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-violet-800">9 — Perspectives Card (multi-bots)</span>
          </div>
          <p className="text-[9px] text-gray-500 mb-2">Résultat d'une consultation simultanée de 2+ bots — perspectives juxtaposées</p>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {["⚔️ Challenger [bot]", "💬 Débat entre bots", "🔀 Fusionner", "▶ Synthétiser"].map(a => (
              <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">{a}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 font-medium">Modes :</span>
            {["Débat", "Analyse", "Deep"].map(m => <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">{m}</span>)}
          </div>
        </div>
      </PatternCard>

      {/* 9.23 — Pre-rapport Card */}
      <PatternCard title="4.23 Pré-rapport Card (lecture seule)" where="Design ref — document genere apres diagnostic">
        <div className="border border-gray-200 bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-800">11 — Pré-rapport Card</span>
          </div>
          <p className="text-[9px] text-gray-500 mb-2">Document structuré généré après un diagnostic — prêt à exporter</p>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {["📤 Exporter (.md / PDF)", "▶ Voir la suite"].map(a => (
              <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">{a}</span>
            ))}
          </div>
          <p className="text-[9px] text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Lecture seule — pas d'interaction cognitive</p>
        </div>
      </PatternCard>

      {/* 9.24 — Anti-boucle 5 regles detaillees */}
      <PatternCard title="4.24 Anti-boucle — 5 regles Sentinelle detaillees" where="LiveChat — interventions automatiques CarlOS">
        <div className="space-y-2">
          {[
            {
              id: "a", trigger: "3× même question user", color: "amber",
              msg: "On tourne autour du même angle depuis un moment. Changeons d'approche.",
              actions: ["Reformuler", "Fil parallèle", "Nuancer"],
            },
            {
              id: "b", trigger: ">4 challenges total dans le fil", color: "red",
              msg: "Les positions sont claires — il n'y a rien de plus qui va sortir. C'est le moment de trancher.",
              actions: ["Synthèse finale", "Décider Go/No-Go", "Cristalliser"],
            },
            {
              id: "c", trigger: ">8 échanges bot sans synthèse", color: "orange",
              msg: "On a bien exploré. Veux-tu synthétiser ou passer à l'action?",
              actions: ["Synthétiser", "Cahier SMART", "Cristalliser et continuer"],
            },
            {
              id: "d", trigger: "Branche à >2 niveaux de profondeur", color: "purple",
              msg: "Tu es à 2+ niveaux de branche. Finalise ou remonte vers le fil principal.",
              actions: ["Synthétiser cette branche", "Retour au fil principal"],
            },
            {
              id: "e", trigger: ">20 min dans un fil sans décision (futur)", color: "gray",
              msg: "Ça fait 20 min sur ce sujet. On synthétise, on parke, ou on force une décision?",
              actions: ["Synthétiser", "Parker ce fil", "Forcer une décision"],
              future: true,
            },
          ].map((r) => (
            <div key={r.id} className={cn("border rounded-xl p-3", r.future ? "border-dashed border-gray-300 bg-gray-50 opacity-60" : `border-${r.color}-200 bg-${r.color}-50`)}>
              <div className="flex items-start gap-3">
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5", r.future ? "bg-gray-200 text-gray-500" : `bg-${r.color}-200 text-${r.color}-800`)}>
                  {r.id.toUpperCase()}{r.future ? " — futur" : ""}
                </span>
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-gray-700 mb-0.5">Déclencheur : <span className="font-normal">{r.trigger}</span></div>
                  <p className="text-[9px] text-gray-500 italic mb-2">"{r.msg}"</p>
                  <div className="flex flex-wrap gap-1">
                    {r.actions.map(a => (
                      <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PatternCard>

      {/* 9.25 — Template ajout actions */}
      <PatternCard title="4.25 Template — Ajouter une nouvelle action" where="Design ref — quand une nouvelle action emerge en utilisation reelle">
        <div className="bg-emerald-50 border border-dashed border-emerald-300 rounded-xl p-4">
          <p className="text-xs text-emerald-800 mb-3">Pour ajouter une action, documenter ici :</p>
          <div className="grid grid-cols-4 gap-2 text-[9px] mb-3">
            {["Emoji + Nom", "Rôle (1 phrase)", "Sur quelle(s) bulle(s)", "Règle anti-boucle si applicable"].map(h => (
              <div key={h} className="bg-white border border-emerald-200 rounded-lg px-2 py-1.5 font-semibold text-emerald-700">{h}</div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              ["⚡ Plan d'action", "Générer un plan actionnable immédiat", "Focus Card · Verdict Card", "—"],
              ["🛡️ Évaluer les risques", "Matrice de risques sur la situation", "Focus Card · Normal Bot", "1 seul par fil"],
              ["👤 Déléguer", "Assigner à un membre de l'équipe", "Synthesis · Verdict Card", "—"],
              ["🔮 Scénario Et si?", "Explorer des hypothèses alternatives", "Normal Bot (mode Brainstorm)", "Max 2/fil"],
            ].map(([n, r, b, anti]) => (
              <div key={String(n)} className="grid grid-cols-4 gap-2 text-[9px]">
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-medium text-gray-800">{n}</div>
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-500">{r}</div>
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-500">{b}</div>
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-400">{anti}</div>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2 text-[9px]">
              {["+ Nouvelle action", "...", "...", "..."].map((v, i) => (
                <div key={i} className="bg-emerald-50 border border-dashed border-emerald-300 rounded-lg px-2 py-1 text-emerald-400 italic">{v}</div>
              ))}
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.26 — Questions diagnostiques */}
      <PatternCard title="4.26 Questions diagnostiques avant de repondre (3 mocks)" where="LiveChat — message vague < 20 mots → CarlOS pose des questions">
        <p className="text-[9px] text-gray-400 mb-3">
          Règle : si message &lt; 20 mots <strong>sans contexte actionnable</strong> → CarlOS pose 2-3 questions ciblées AVANT de répondre.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
            <div className="text-[9px] font-bold text-orange-600 mb-2 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" /> Crise — User dit "allo"
            </div>
            <div className="flex justify-end mb-2">
              <div className="bg-blue-600 text-white text-[9px] rounded-xl px-2.5 py-1.5 max-w-[70%]">allo</div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] shrink-0 mt-0.5">🎩</div>
              <div className="bg-white border border-blue-100 rounded-xl px-2.5 py-2 text-[9px] text-gray-700 shadow-sm">
                <p className="font-semibold text-blue-700 mb-1.5">Avant d'aller plus loin :</p>
                <p className="mb-1">1. Quelle est la situation d'urgence?</p>
                <p className="mb-1">2. Impact estimé en $$ ou en clients?</p>
                <p>3. Actions déjà prises?</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
            <div className="text-[9px] font-bold text-blue-600 mb-2 flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> Analyse — User dit "pipeline?"
            </div>
            <div className="flex justify-end mb-2">
              <div className="bg-blue-600 text-white text-[9px] rounded-xl px-2.5 py-1.5 max-w-[70%]">pipeline?</div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] shrink-0 mt-0.5">🎩</div>
              <div className="bg-white border border-blue-100 rounded-xl px-2.5 py-2 text-[9px] text-gray-700 shadow-sm">
                <p className="font-semibold text-blue-700 mb-1.5">Ciblons :</p>
                <p className="mb-1">1. Quel aspect t'inquiète — volume, conversion, vitesse?</p>
                <p className="mb-1">2. Sur quel horizon — Q1, Q2 ou annuel?</p>
                <p>3. Un prospect spécifique ou tout le pipe?</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
            <div className="text-[9px] font-bold text-violet-600 mb-2 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" /> Débat — User dit "débat"
            </div>
            <div className="flex justify-end mb-2">
              <div className="bg-blue-600 text-white text-[9px] rounded-xl px-2.5 py-1.5 max-w-[70%]">débat</div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] shrink-0 mt-0.5">🎩</div>
              <div className="bg-white border border-blue-100 rounded-xl px-2.5 py-2 text-[9px] text-gray-700 shadow-sm">
                <p className="font-semibold text-blue-700 mb-1.5">Sur quoi on se bat?</p>
                <p className="mb-1">1. Le sujet à débattre?</p>
                <p className="mb-1">2. Ta position de départ?</p>
                <p>3. Tu veux qu'on soit 2 ou 3 dans ce débat?</p>
              </div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 9.27 — Moteur scoring equipe */}
      <SectionTitle num="4.27" title="Moteur scoring equipe — Comment CarlOS choisit les 3 bots" />
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Moteur de raisonnement — Comment CarlOS choisit son équipe</span>
          <span className="ml-auto text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">Avenue 2 + pincée Avenue 3</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[9px] font-bold text-purple-700 shrink-0">1</div>
              <span className="text-[11px] font-bold text-gray-700">Avenue 2 — Score par bot</span>
              <span className="text-[9px] text-gray-400">≤50ms · déterministe · sans LLM</span>
            </div>
            <div className="bg-gray-900 text-green-300 rounded-lg px-3 py-2 text-[9px] font-mono mb-2">
              <span className="text-gray-400"># Formule pour chacun des 12 bots :</span><br/>
              Score = (mots_clés_détectés × <span className="text-yellow-300">3</span>) + affinité_mode + fit_domaine<br/>
              <span className="text-gray-400"># → Top 3 = Bot primaire + 2 angles morts</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[9px] text-gray-400 mb-2 italic">Ex: message = "notre pipeline est brisé technologiquement"</div>
              <div className="space-y-1">
                {[
                  { code: "BCT", name: "Thierry CTO", kw: 3, mode: 2, dom: 3, total: 8, tag: "PRIMAIRE", color: "violet", stars: "★★★" },
                  { code: "BCF", name: "François CFO", kw: 1, mode: 1, dom: 2, total: 4, tag: "ANGLE MORT", color: "emerald", stars: "★★" },
                  { code: "BOO", name: "Olivier COO", kw: 1, mode: 1, dom: 2, total: 4, tag: "ANGLE MORT", color: "orange", stars: "★★" },
                  { code: "BCO", name: "CarlOS CEO", kw: 0, mode: 2, dom: 1, total: 3, tag: "écarté", color: "gray", stars: "★" },
                ].map(({ code, name, kw, mode, dom, total, tag, color, stars }) => (
                  <div key={code} className={`flex items-center gap-2 text-[9px] ${color === "gray" ? "opacity-40" : ""}`}>
                    <span className="w-16 font-mono text-gray-500">{code}</span>
                    <span className="w-28 font-medium text-gray-700">{name}</span>
                    <div className="flex gap-1 items-center flex-1">
                      <span className="text-gray-400">kw=</span><span className="font-bold text-purple-700">{kw}×3</span>
                      <span className="text-gray-300 mx-1">+</span>
                      <span className="text-gray-400">mode=</span><span className="font-bold text-blue-600">{mode}</span>
                      <span className="text-gray-300 mx-1">+</span>
                      <span className="text-gray-400">dom=</span><span className="font-bold text-indigo-600">{dom}</span>
                      <span className="text-gray-300 mx-1">=</span>
                      <span className="font-bold text-gray-800 w-4">{total}</span>
                      <span className="text-amber-500 ml-1">{stars}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      tag === "PRIMAIRE" ? "bg-violet-100 text-violet-700" :
                      tag === "ANGLE MORT" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-400"
                    }`}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <ArrowDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700 shrink-0">2</div>
              <span className="text-[11px] font-bold text-gray-700">Pincée Avenue 3 — Explication LLM</span>
              <span className="text-[9px] text-gray-400">~300ms · Gemini Flash T1 · ~$0.001/req</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[9px] text-gray-400 mb-1 font-medium">Prompt micro envoyé à Gemini Flash :</div>
                <div className="bg-gray-900 text-green-300 rounded-lg px-3 py-2 text-[9px] font-mono leading-relaxed">
                  <span className="text-gray-400">Explique en 1 phrase claire</span><br/>
                  <span className="text-gray-400">pourquoi [BCT, BCF, BOO]</span><br/>
                  <span className="text-gray-400">sont les bons bots pour:</span><br/>
                  <span className="text-yellow-300">"pipeline techniquement brisé"</span><br/>
                  <span className="text-gray-400">Réponse JSON:</span><br/>
                  <span className="text-blue-300">{"{"}"raison": "..."{"}"}</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-400 mb-1 font-medium">Ce que CarlOS affiche à l'utilisateur :</div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-[9px] text-blue-800 leading-relaxed">
                  <span className="font-semibold">J'ai choisi Thierry</span> car le problème est technique et il doit diagnostiquer la racine. <span className="font-semibold">François</span> couvre l'impact sur le cash-flow si ça dure. <span className="font-semibold">Olivier</span> s'assure que la production ne s'arrête pas pendant qu'on répare.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="text-[9px] font-bold text-gray-600 mb-2 uppercase tracking-wide">Mapping tensions → équipes types</div>
            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 text-[9px] font-bold text-gray-400 bg-gray-50 border-b px-2 py-1.5">
                <div>Tension détectée</div>
                <div>Bot Primaire</div>
                <div>Angle Mort #1</div>
                <div>Angle Mort #2</div>
              </div>
              {[
                ["Pipeline / ventes / closing", "Sophie CSO 🎯", "François CFO 💰", "Martine CMO 📢"],
                ["Budget / tréso / coûts / DSO", "François CFO 💰", "CarlOS CEO 🎩", "Olivier COO ⚙️"],
                ["Serveur / tech / système brisé", "Thierry CTO 💻", "François CFO 💰", "Olivier COO ⚙️"],
                ["Équipe / culture / RH / conflit", "Hélène CHRO 👥", "CarlOS CEO 🎩", "Olivier COO ⚙️"],
                ["Marketing / marque / campagne", "Martine CMO 📢", "Sophie CSO 🎯", "François CFO 💰"],
                ["Stratégie / expansion / M&A", "CarlOS CEO 🎩", "Sophie CSO 🎯", "François CFO 💰"],
                ["Légal / conformité / risque", "Louise CLO ⚖️", "François CFO 💰", "CarlOS CEO 🎩"],
                ["Opérations / production / livraison", "Olivier COO ⚙️", "Thierry CTO 💻", "François CFO 💰"],
              ].map(([tension, p, a1, a2], i) => (
                <div key={String(tension)} className={`grid grid-cols-4 text-[9px] px-2 py-1.5 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                  <div className="text-gray-600 font-medium">{tension}</div>
                  <div className="text-violet-700 font-semibold">{p}</div>
                  <div className="text-blue-600">{a1}</div>
                  <div className="text-indigo-600">{a2}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[9px] text-gray-400">
              Ces équipes sont les <strong>valeurs par défaut</strong> du scoring. Le LLM peut affiner selon le contexte précis.
            </div>
          </div>
        </div>
      </Card>

      {/* 9.28 — Ajout/retrait bots en live */}
      <PatternCard title="4.28 Ajout / retrait de bots en cours de conversation" where="LiveChat — gestion equipe en temps reel">
        <p className="text-[9px] text-gray-400 mb-3">
          Si la conversation révèle un angle mort imprévu → l'utilisateur peut ajouter un bot. Limite : toujours max 3 bots actifs. CarlOS orchestre qui parle.
        </p>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="text-[9px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Interface — Gestion de l'équipe en live</div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[9px] text-gray-500 font-medium">Équipe active :</span>
            {[
              { emoji: "💻", name: "Thierry CTO", color: "violet" },
              { emoji: "💰", name: "François CFO", color: "emerald" },
            ].map(({ emoji, name, color }) => (
              <div key={name} className={`flex items-center gap-1.5 bg-${color}-50 border border-${color}-200 rounded-full px-2.5 py-1 text-[9px]`}>
                <span>{emoji}</span>
                <span className={`font-medium text-${color}-700`}>{name}</span>
                <button className={`text-${color}-400 hover:text-red-500 cursor-pointer ml-0.5`}>×</button>
              </div>
            ))}
            <div className="flex items-center gap-1 border border-dashed border-gray-300 rounded-full px-2.5 py-1 text-[9px] text-gray-400">
              <Plus className="h-3.5 w-3.5" /> Inviter un 3e bot
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[9px] text-gray-400 w-full">Disponibles :</span>
            {[
              ["🎩","CarlOS CEO","blue"],["⚙️","Olivier COO","orange"],
              ["📢","Martine CMO","pink"],["🎯","Sophie CSO","red"],
            ].map(([e,n,c]) => (
              <button key={String(n)} className={`flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-${c}-50 hover:border-${c}-200 cursor-pointer transition-colors`}>
                <Plus className="h-3.5 w-3.5" /> {e} {n}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex gap-4 text-[9px]">
            <span className="text-green-600">✅ Max 3 bots — au-delà c'est du bruit</span>
            <span className="text-blue-600">✅ CarlOS orchestre qui parle — pas un chat room</span>
            <span className="text-amber-600">⚠️ Brief auto quand un bot rejoint la convo</span>
          </div>
        </div>
      </PatternCard>

    </div>
  );
}

// ================================================================
// 10. INDICATEURS DE STATUT
// ================================================================

export function Tab11Indicateurs() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Indicateurs & Status</span></div>

      <PatternCard title="3.14 Chaleur / Triangle du Feu (3 etats)" where="Chantiers, sidebar droite, diagnostics">
        <div className="flex gap-4">
          {[
            { label: "Brule", dot: "bg-red-500", emoji: "🔥", gradient: "from-red-600 to-orange-500" },
            { label: "Couve", dot: "bg-amber-400", emoji: "🟡", gradient: "from-amber-500 to-yellow-400" },
            { label: "Meurt", dot: "bg-gray-300", emoji: "⚪", gradient: "from-gray-400 to-gray-300" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", c.dot)} />
              <span className="text-xs font-medium text-gray-700">{c.label}</span>
              <span>{c.emoji}</span>
              <div className={`w-16 h-4 rounded bg-gradient-to-r ${c.gradient}`} />
            </div>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="3.15 LIVE indicator (pastille verte)" where="LiveChat header">
        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-green-600 font-medium">LIVE</span>
        </div>
      </PatternCard>

      <PatternCard title="3.16 Online dot (presence bot)" where="DepartmentDetailView header">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Bot en ligne</span>
        </div>
      </PatternCard>

      <PatternCard title="3.17 Barres de progression (3 epaisseurs)" where="TRG, Orbit9, Cockpit">
        <div className="space-y-3">
          {[
            { label: "Epaisse (standard)", height: "h-2.5", color: "bg-blue-500" },
            { label: "Moyenne", height: "h-2", color: "bg-emerald-500" },
            { label: "Fine (compact)", height: "h-1.5", color: "bg-violet-500" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">{bar.label}</div>
              <div className={cn(bar.height, "bg-gray-100 rounded-full overflow-hidden w-48")}>
                <div className={cn("h-full rounded-full", bar.color)} style={{ width: "72%" }} />
              </div>
            </div>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="3.18 VITAA pilier (lettre + barre + score)" where="HealthView">
        <div className="space-y-2">
          {[
            { letter: "V", label: "Vente", score: 72, color: "bg-blue-500" },
            { letter: "I", label: "Idee", score: 45, color: "bg-purple-500" },
            { letter: "T", label: "Temps", score: 88, color: "bg-emerald-500" },
            { letter: "A", label: "Argent", score: 31, color: "bg-amber-500" },
            { letter: "A", label: "Actif", score: 62, color: "bg-red-500" },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>
                {p.letter}
              </div>
              <span className="text-xs font-medium text-gray-800 w-14">{p.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", p.color)} style={{ width: `${p.score}%` }} />
              </div>
              <span className={cn("text-xs font-bold w-7 text-right", p.score >= 50 ? "text-green-600" : "text-red-600")}>{p.score}</span>
            </div>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="3.19 CREDO phase indicator (5 dots)" where="Bulle footer LiveChat">
        <div className="flex items-center gap-3">
          {[
            { letter: "C", label: "Connecter", color: "bg-blue-400" },
            { letter: "R", label: "Rechercher", color: "bg-purple-400" },
            { letter: "E", label: "Exposer", color: "bg-amber-400" },
            { letter: "D", label: "Demontrer", color: "bg-green-400" },
            { letter: "O", label: "Obtenir", color: "bg-red-400" },
          ].map((phase, i) => (
            <div key={phase.letter} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", i === 0 ? phase.color : "bg-gray-200")} />
              <span className={cn("text-[9px]", i === 0 ? "text-gray-700 font-medium" : "text-gray-300")}>{phase.letter}</span>
            </div>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="3.20 COMMAND pipeline (4 etapes)" where="LiveChat — missions COMMAND">
        <div className="flex items-center gap-1">
          {[
            { label: "SCAN", color: "bg-blue-500", textColor: "text-blue-600" },
            { label: "STRATEGIE", color: "bg-violet-500", textColor: "text-violet-600" },
            { label: "EXECUTION", color: "bg-orange-500", textColor: "text-orange-600" },
            { label: "BILAN", color: "bg-emerald-500", textColor: "text-emerald-600" },
          ].map((stage, i) => (
            <div key={stage.label} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn("w-full h-1.5 rounded-full", i < 2 ? stage.color : "bg-gray-200")} />
              <span className={cn("text-[9px] font-semibold", i < 2 ? stage.textColor : "text-gray-300")}>
                {stage.label} {i < 2 && "✓"}
              </span>
            </div>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="3.21 Etat vide (empty state)" where="Bureau, listes vides">
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-gray-100">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Aucun document</p>
          <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier document</p>
        </div>
      </PatternCard>

      <PatternCard title="3.22 Zone upload (drop zone)" where="Bureau documents">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 font-medium">Glissez vos fichiers ici ou cliquez</p>
        </div>
      </PatternCard>

      {/* 10.10 — Comparaison: 3 epaisseurs de barres (ex-12.3) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Barres de progression 3 epaisseurs</div>
        <div className="space-y-3">
          {[
            { label: "Epaisse (Orbit9, InnovationDemo)", h: "h-2.5", color: "bg-blue-500" },
            { label: "Moyenne (quelques pages)", h: "h-2", color: "bg-emerald-500" },
            { label: "Fine (Tour de Controle)", h: "h-1.5", color: "bg-violet-500" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">{bar.label}</div>
              <div className={cn(bar.h, "bg-gray-100 rounded-full overflow-hidden w-48")}>
                <div className={cn("h-full rounded-full", bar.color)} style={{ width: "72%" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> Garder 2: epaisse (standard) et fine (grilles compactes).</div>
      </Card>
    </div>
  );
}

// ================================================================
// 11. COULEURS
// ================================================================

export function Tab12Couleurs() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Palette Couleurs</span></div>

      <SectionTitle num="1.5" title="12 Bots — Gradients officiels" />
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5">
          <span className="text-sm font-bold text-white">Gradients departements</span>
        </div>
        <div className="divide-y">
          {BOTS_12.map((bot) => (
            <div key={bot.code} className="px-4 py-2 flex items-center gap-3">
              <div className={`w-20 h-6 rounded bg-gradient-to-r from-${bot.color}-600 to-${bot.color}-500`} />
              <bot.icon className={`h-4 w-4 text-${bot.color}-500`} />
              <span className="text-xs font-bold text-gray-800 w-10">{bot.code}</span>
              <span className="text-[9px] text-gray-500 w-12">{bot.role}</span>
              <code className="text-[9px] text-gray-400 font-mono ml-auto">from-{bot.color}-600 to-{bot.color}-500</code>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle num="1.6" title="Couleurs systeme" />
      <div className="grid grid-cols-4 gap-3">
        {[
          { swatch: "bg-gray-50", label: "Fond page", code: "bg-gray-50" },
          { swatch: "bg-white border", label: "Cards", code: "bg-white" },
          { swatch: "bg-gray-900", label: "Tab actif", code: "bg-gray-900" },
          { swatch: "bg-gray-100", label: "Fond tab bar", code: "bg-gray-100" },
        ].map((c) => (
          <div key={c.label} className="text-center">
            <div className={cn("h-8 rounded", c.swatch)} />
            <div className="text-[9px] text-gray-500 mt-1">{c.label}</div>
            <code className="text-[9px] text-gray-400 font-mono">{c.code}</code>
          </div>
        ))}
      </div>

      <SectionTitle num="1.7" title="Sidebar gauche — icones colorees" />
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="text-[9px] font-bold text-gray-500 uppercase mb-2">Pipeline</div>
          {SIDEBAR_PIPELINE.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 py-1">
                <Icon className={cn("h-3.5 w-3.5", item.color)} />
                <span className="text-xs text-gray-700">{item.label}</span>
              </div>
            );
          })}
        </Card>
        <Card className="p-3">
          <div className="text-[9px] font-bold text-gray-500 uppercase mb-2">Ressources</div>
          {SIDEBAR_RESSOURCES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 py-1">
                <Icon className={cn("h-3.5 w-3.5", item.color)} />
                <span className="text-xs text-gray-700">{item.label}</span>
              </div>
            );
          })}
        </Card>
      </div>

      <SectionTitle num="1.8" title="Separateur gradient (sidebar droite)" />
      <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mx-3 my-1 rounded-full" />
      <div className="text-[9px] text-gray-400 text-center">Separateur entre Video/Activity et InputBar</div>
    </div>
  );
}

// ================================================================
// 12. DOUBLONS
// ================================================================

function VisualDuplicate({ num, title, recommendation, children }: {
  num: string;
  title: string;
  recommendation: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-0 overflow-hidden border-amber-200">
      <div className="bg-amber-50 px-3 py-2 border-b border-amber-200 flex items-center gap-2">
        <Copy className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-xs font-bold text-amber-800">{num} — {title}</span>
      </div>
      <div className="p-4 space-y-3">
        {children}
        <div className="border-t pt-3 mt-3">
          <div className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Recommandation:</div>
          <div className="text-xs text-gray-700">{recommendation}</div>
        </div>
      </div>
    </Card>
  );
}

export function Tab13Doublons() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Doublons identifies</span></div>
      <div className="text-xs text-gray-600 leading-relaxed">
        Les 8 doublons ont ete deplaces dans leur tab officiel. Chaque element est maintenant AU BON ENDROIT avec un bandeau ambre "Doublon identifie".
      </div>

      <Card className="p-4">
        <div className="text-xs font-bold text-gray-800 mb-3">Ou trouver chaque doublon :</div>
        <div className="space-y-2 text-[9px]">
          {[
            { ancien: "3.1", nouveau: "2.33", tab: "4. Tabs", titre: "Tabs navigation — 3 variantes" },
            { ancien: "3.2", nouveau: "2.29", tab: "3. Headers", titre: "Gradient headers — 2 tailles" },
            { ancien: "3.3", nouveau: "3.23", tab: "11. Indicateurs", titre: "Barres de progression — 3 epaisseurs" },
            { ancien: "3.4", nouveau: "2.4", tab: "2. Avatars", titre: "Forme avatar — cercle vs carre arrondi" },
            { ancien: "6.5", nouveau: "2.2", tab: "2. Avatars", titre: "Avatars bot — 4 tailles" },
            { ancien: "6.6", nouveau: "2.42", tab: "5. Cards", titre: "Coins de cards — 2 arrondis" },
            { ancien: "6.7", nouveau: "2.9", tab: "2. Layouts", titre: "Espacement pages — 3 variantes" },
            { ancien: "6.8", nouveau: "2.10", tab: "2. Layouts", titre: "Grilles — 4 formats" },
          ].map((d) => (
            <div key={d.ancien} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-400 line-through w-16">{d.ancien}</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="font-bold text-emerald-600 w-20">{d.nouveau}</span>
              <span className="text-gray-400 w-24">Tab {d.tab}</span>
              <span className="text-gray-700 flex-1">{d.titre}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] text-amber-800">
          <strong>Aussi supprime:</strong> 9.13 (Bot Roster Bar) — etait un doublon exact de 3.3 dans Tab Headers.
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// 13. ECARTS
// ================================================================

function InconsistencyCard({ id, title, problem, pages, fix }: {
  id: string;
  title: string;
  problem: string;
  pages: string[];
  fix: string;
}) {
  return (
    <Card className="p-0 overflow-hidden border-red-200">
      <div className="bg-red-50 px-3 py-2 border-b border-red-200 flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
        <span className="text-xs font-bold text-red-800">{id} — {title}</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="text-xs text-gray-700">{problem}</div>
        <div className="text-[9px] font-bold text-gray-500 uppercase">Pages affectees:</div>
        <div className="flex flex-wrap gap-1">
          {pages.map((p) => (
            <span key={p} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p}</span>
          ))}
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="text-[9px] font-bold text-blue-600 uppercase">Fix propose:</div>
          <div className="text-xs text-gray-700">{fix}</div>
        </div>
      </div>
    </Card>
  );
}

export function Tab14Ecarts() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ecarts identifies</span></div>
      <div className="text-xs text-gray-600 leading-relaxed">
        10 ecarts entre le design-system.md et ce qui est reellement code.
      </div>

      <div className="grid grid-cols-1 gap-3">
        <InconsistencyCard id="6.9" title="BCC + BPO fantomes" problem="~111 occurrences de 2 bots qui n'existent PAS dans la plateforme"
          pages={["simulation-data.ts", "CarlOSPresence.tsx", "types.ts", "agents.py", "LiveChat.tsx"]} fix="Sprint nettoyage dedie — supprimer TOUTES les references" />
        <InconsistencyCard id="6.10" title="Forme avatar mixte" problem="rounded-full (cercle) dans LiveChat/BoardRoom, rounded-lg (carre) dans Health/Diagnostics"
          pages={["DepartmentDetailView", "HealthView", "LiveChat", "BoardRoom"]} fix="Standardiser vers UNE forme (recommande: rounded-full)" />
        <InconsistencyCard id="6.11" title="Font sizes meta non uniformes" problem="Mix de text-[9px] et taille 10px pour le meme type de contenu"
          pages={["KPI cards", "Badges", "Cockpit", "DepartmentDetailView"]} fix="Choisir UN seul standard" />
        <InconsistencyCard id="6.12" title="Cards shadow inconsistantes" problem="Mix de shadow-sm, shadow-md, et aucune shadow"
          pages={["DashboardView", "CockpitView", "InnovationDemo"]} fix="shadow-sm par defaut, shadow-md au hover" />
        <InconsistencyCard id="6.13" title="Score bars 3 hauteurs" problem="h-1.5, h-2, h-2.5 utilises selon les pages"
          pages={["TRG", "Orbit9", "InnovationDemo", "HealthView"]} fix="2 tailles: h-2.5 (standard) et h-1.5 (compact)" />
        <InconsistencyCard id="6.14" title="Boutons CTA heterogenes" problem="Les gros boutons Room/CTA varient en padding et border-radius"
          pages={["BoardRoom", "WarRoom", "ThinkRoom"]} fix="UN pattern: px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg" />
        <InconsistencyCard id="6.15" title="BCC/BPO dans palette design-system.md" problem="design-system.md liste rose pour BCC et fuchsia pour BPO"
          pages={["memory/design-system.md"]} fix="Retirer les 2 intrus, garder seulement les 12 vrais bots" />
        <InconsistencyCard id="6.16" title="Padding manuels legacy" problem="Certaines pages utilisent p-4/px-6 au lieu de PageLayout"
          pages={["TemplatesPage (fixe S44)", "sous-composants legacy"]} fix="Migrer vers PageLayout" />
        <InconsistencyCard id="6.17" title="Gradient direction variable" problem="Mix de to-r et to-br pour les headers"
          pages={["PageHeader (to-br icone)", "Cards (to-r header)"]} fix="to-r pour headers, to-br pour fonds d'icone uniquement" />
        <InconsistencyCard id="6.18" title="Border-t-[3px] legacy" problem="Vieux composants utilisent border-top au lieu de gradient header"
          pages={["Legacy cards pre-design-system"]} fix="Migrer vers gradient header standard" />
      </div>
    </div>
  );
}

// ================================================================
// 14. SKINS COGNITIFS
// ================================================================

const GHOST_ARCHETYPES = [
  { emoji: "📦", nom: "Bezos", categorie: "Strategie", signature: "L'Architecte Client" },
  { emoji: "⚔️", nom: "Sun Tzu", categorie: "Strategie", signature: "Le Stratege Silencieux" },
  { emoji: "🧠", nom: "Munger", categorie: "Strategie", signature: "L'Inverseur" },
  { emoji: "🍎", nom: "Jobs", categorie: "Innovation", signature: "L'Epureur" },
  { emoji: "🚀", nom: "Musk", categorie: "Innovation", signature: "Le Disrupteur" },
  { emoji: "⚡", nom: "Tesla", categorie: "Innovation", signature: "Le Catalyseur" },
  { emoji: "🎨", nom: "Vinci", categorie: "Creativite", signature: "L'Universel" },
  { emoji: "🏛️", nom: "Marc Aurele", categorie: "Leadership", signature: "Le Stoique" },
  { emoji: "🎩", nom: "Churchill", categorie: "Leadership", signature: "L'Inebranlable" },
  { emoji: "💜", nom: "Oprah", categorie: "Leadership", signature: "L'Authentique" },
  { emoji: "💰", nom: "Buffett", categorie: "Finance", signature: "Le Gardien de Valeur" },
  { emoji: "🔬", nom: "Curie", categorie: "Analyse", signature: "La Methodique" },
  { emoji: "📊", nom: "Deming", categorie: "Operations", signature: "Le Mesureur" },
  { emoji: "🏭", nom: "Ohno", categorie: "Operations", signature: "Le Flux" },
];

const DECISION_MODES_DATA = [
  { id: "strategique", label: "Strategique", icon: Target, color: "blue" },
  { id: "tactique", label: "Tactique", icon: Zap, color: "amber" },
  { id: "analytique", label: "Analytique", icon: BarChart3, color: "emerald" },
  { id: "creatif", label: "Creatif", icon: Lightbulb, color: "purple" },
  { id: "crise", label: "Crise", icon: AlertTriangle, color: "red" },
];

const TRISOCIATION_EXAMPLES = [
  { bot: "BCO", slots: [{ ghost: "Bezos", emoji: "📦", role: "Primaire", color: "blue" }, { ghost: "Munger", emoji: "🧠", role: "Calibrateur", color: "violet" }, { ghost: "Churchill", emoji: "🎩", role: "Amplificateur", color: "amber" }] },
  { bot: "BCT", slots: [{ ghost: "Musk", emoji: "🚀", role: "Primaire", color: "blue" }, { ghost: "Curie", emoji: "🔬", role: "Calibrateur", color: "violet" }, { ghost: "Vinci", emoji: "🎨", role: "Amplificateur", color: "amber" }] },
  { bot: "BCF", slots: [{ ghost: "Buffett", emoji: "💰", role: "Primaire", color: "blue" }, { ghost: "Munger", emoji: "🧠", role: "Calibrateur", color: "violet" }, { ghost: "Franklin", emoji: "📜", role: "Amplificateur", color: "amber" }] },
];

const CATEGORY_COLORS: Record<string, string> = {
  Strategie: "bg-blue-100 text-blue-700",
  Innovation: "bg-violet-100 text-violet-700",
  Leadership: "bg-amber-100 text-amber-700",
  Finance: "bg-emerald-100 text-emerald-700",
  Analyse: "bg-cyan-100 text-cyan-700",
  Creativite: "bg-pink-100 text-pink-700",
  Operations: "bg-orange-100 text-orange-700",
};

export function Tab15Skins() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skins Cognitifs — Reglages Agent</span></div>
      <div className="text-xs text-gray-600 leading-relaxed">
        Patterns visuels de la page AgentSettingsView — profil psychometrique, trisociation, modes decisionnels et catalogue de Ghosts.
      </div>

      {/* 14.1 — Banner agent */}
      <PatternCard title="8.9 Banniere Agent (standby image 3:1)" where="AgentSettingsView — haut de page">
        <div className="relative rounded-xl overflow-hidden shadow-sm">
          <div className="w-full aspect-[3/1] bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-4">
            <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-16 h-16 rounded-full object-cover ring-3 ring-white/50 shadow-xl" />
            <div className="flex-1">
              <div className="text-xl font-extrabold text-white">CarlOS</div>
              <div className="text-sm text-white/80 font-medium">CEO — Direction Generale</div>
            </div>
            <span className="text-[9px] font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">Trisociation active</span>
            <span className="text-[9px] font-semibold text-green-300 bg-green-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> En ligne
            </span>
          </div>
        </div>
      </PatternCard>

      {/* 14.2 — Trisociation 3 slots */}
      <PatternCard title="8.10 Trisociation — 3 slots cognitifs" where="AgentSettingsView — colonne droite">
        <div className="text-xs text-gray-600 mb-2">Chaque bot a 3 Ghosts: Primaire (modele dominant), Calibrateur (regulateur), Amplificateur (catalyseur).</div>
        <div className="space-y-3">
          {TRISOCIATION_EXAMPLES.map(tri => {
            const botInfo = BOTS_12.find(b => b.code === tri.bot);
            return (
              <div key={tri.bot}>
                <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">{botInfo?.nom} — {botInfo?.role}</div>
                <div className="grid grid-cols-3 gap-2">
                  {tri.slots.map(slot => (
                    <Card key={slot.role} className="p-0 overflow-hidden">
                      <div className={`bg-gradient-to-r from-${slot.color}-600 to-${slot.color}-500 px-3 py-1.5`}>
                        <div className="text-[9px] font-bold text-white uppercase">{slot.role}</div>
                        <div className="text-[8px] text-white/60">{slot.role === "Primaire" ? "Modele dominant" : slot.role === "Calibrateur" ? "Regulateur" : "Catalyseur"}</div>
                      </div>
                      <div className="px-3 py-2 flex items-center gap-2">
                        <span className="text-lg">{slot.emoji}</span>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{slot.ghost}</div>
                        </div>
                        <Pencil className="h-3.5 w-3.5 text-gray-300 ml-auto" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PatternCard>

      {/* 14.3 — Score bars psychometrie */}
      <PatternCard title="8.11 Profil Psychometrique (5 barres de score)" where="AgentSettingsView — colonne droite">
        <div className="space-y-2">
          {[
            { label: "Strategique", value: 95, color: "bg-blue-500" },
            { label: "Analytique", value: 70, color: "bg-emerald-500" },
            { label: "Creatif", value: 60, color: "bg-purple-500" },
            { label: "Operationnel", value: 50, color: "bg-orange-500" },
            { label: "Relationnel", value: 85, color: "bg-pink-500" },
          ].map(bar => (
            <div key={bar.label} className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500 w-24 shrink-0 text-right">{bar.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", bar.color)} style={{ width: `${bar.value}%` }} />
              </div>
              <span className="text-[9px] font-bold text-gray-600 w-8">{bar.value}</span>
            </div>
          ))}
        </div>
      </PatternCard>

      {/* 14.4 — Decision modes */}
      <PatternCard title="8.12 Modes Decisionnels (5 boutons toggle)" where="AgentSettingsView — colonne gauche">
        <div className="grid grid-cols-5 gap-2">
          {DECISION_MODES_DATA.map((mode, i) => {
            const Icon = mode.icon;
            const isActive = i === 0;
            return (
              <div key={mode.id} className={cn(
                "rounded-xl p-3 text-center border cursor-pointer transition-all",
                isActive
                  ? `bg-gradient-to-b from-${mode.color}-50 to-white border-${mode.color}-300 shadow-sm`
                  : "bg-white border-gray-200 hover:bg-gray-50"
              )}>
                <Icon className={cn("h-4 w-4 mx-auto mb-1", isActive ? `text-${mode.color}-600` : "text-gray-400")} />
                <div className={cn("text-[9px] font-bold", isActive ? `text-${mode.color}-700` : "text-gray-500")}>{mode.label}</div>
              </div>
            );
          })}
        </div>
      </PatternCard>

      {/* 14.5 — Competences cles */}
      <PatternCard title="8.13 Competences Cles (grille 2 colonnes)" where="AgentSettingsView — colonne gauche">
        <div className="grid grid-cols-2 gap-2">
          {["Vision strategique", "Prise de decision", "Gestion d'equipe", "Analyse financiere", "Communication", "Innovation produit"].map(comp => (
            <div key={comp} className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-700">{comp}</span>
            </div>
          ))}
        </div>
      </PatternCard>

      {/* 14.6 — Ghost catalogue */}
      <PatternCard title="8.14 Catalogue des Ghosts (14 archetypes, 7 categories)" where="AgentSettingsView — bas de page">
        <div className="space-y-2">
          {Object.entries(
            GHOST_ARCHETYPES.reduce<Record<string, typeof GHOST_ARCHETYPES>>((acc, g) => {
              (acc[g.categorie] = acc[g.categorie] || []).push(g);
              return acc;
            }, {})
          ).map(([cat, ghosts]) => (
            <Card key={cat} className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", CATEGORY_COLORS[cat])}>{cat}</span>
                <span className="text-[9px] text-gray-400">{ghosts.length} archetype{ghosts.length > 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y">
                {ghosts.map(g => (
                  <div key={g.nom} className="px-3 py-2 flex items-center gap-3">
                    <span className="text-lg shrink-0">{g.emoji}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">{g.nom}</div>
                      <div className="text-[9px] text-gray-400 italic">{g.signature}</div>
                    </div>
                    <button className="text-[9px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Assigner</button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      {/* 14.7 — Style de communication */}
      <PatternCard title="8.15 Style de Communication" where="AgentSettingsView — colonne gauche">
        <Card className="p-3">
          <div className="text-xs font-bold text-gray-800 mb-2">Style: Directif et visionnaire</div>
          <div className="bg-indigo-50/50 rounded-lg px-3 py-2">
            <div className="text-xs text-gray-700 leading-relaxed">
              Approche: Communication directe, orientee resultats. Utilise des analogies business pour illustrer les concepts complexes.
            </div>
          </div>
        </Card>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 15. MENU SIDEBAR GAUCHE
// ================================================================

export function Tab16MenuGauche() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Menu Gauche</span></div>
      <div className="text-xs text-gray-600 leading-relaxed">
        Navigation principale — 6 sections collapsibles. Deux modes : expanded (labels) et collapsed (icones seulement).
      </div>

      {/* 15.1 — Expanded vs Collapsed */}
      <PatternCard title="5.1 Deux modes — Expanded vs Collapsed" where="SidebarLeft (FrameMaster.tsx)">
        <div className="flex gap-4">
          {/* Expanded */}
          <div className="flex-1 border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 border-b px-3 py-1.5 text-[8px] font-bold text-gray-400 uppercase">Expanded (~200px)</div>
            <div className="p-2 space-y-2 w-48">
              <div>
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 rotate-90" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Mon Espace</span>
                </div>
                <div className="space-y-0.5 ml-1">
                  {["Dashboard", "Mon Bureau", "Mes Chantiers"].map((label, i) => (
                    <div key={label} className={cn("flex items-center gap-2 px-2 py-1 rounded text-[9px]", i === 0 ? "bg-accent font-medium" : "text-gray-600")}>
                      <div className={cn("w-3.5 h-3.5 rounded", i === 0 ? "bg-blue-200" : "bg-gray-100")} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-px bg-gray-100 mx-2" />
              <div>
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Rooms</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 rotate-90" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Mon Equipe</span>
                </div>
                <div className="space-y-0.5 ml-1">
                  {BOTS_12.slice(0, 3).map((bot) => (
                    <div key={bot.code} className="flex items-center gap-2 px-2 py-0.5 text-[9px] text-gray-600">
                      <bot.icon className={cn("h-3.5 w-3.5 shrink-0", `text-${bot.color}-500`)} />
                      <span className="truncate flex-1">{bot.dept}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    </div>
                  ))}
                  <div className="px-2 py-0.5 text-[8px] text-gray-300 italic">... 9 autres</div>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsed */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm w-14">
            <div className="bg-gray-50 border-b px-1 py-1.5 text-center text-[7px] font-bold text-gray-400 uppercase">Mini</div>
            <div className="p-1 space-y-0.5">
              {[
                { Icon: Briefcase, color: "text-blue-500", active: true },
                { Icon: Crown, color: "text-amber-500", active: false },
                { Icon: Users, color: "text-violet-500", active: false },
                { Icon: Network, color: "text-orange-500", active: false },
                { Icon: TrendingUp, color: "text-cyan-500", active: false },
                { Icon: Sparkles, color: "text-indigo-500", active: false },
              ].map((item, i) => (
                <button key={i} className={cn("w-full flex justify-center py-1.5 rounded", item.active && "bg-accent")}>
                  <item.Icon className={cn("h-3.5 w-3.5", item.color)} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Expanded:</strong> 16-25% largeur, labels + icones</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Collapsed:</strong> ~56px, icones seules, tooltips</div>
        </div>
      </PatternCard>

      {/* 15.2 — Les 6 sections */}
      <PatternCard title="5.2 Les 6 sections de navigation" where="SidebarLeft — composants dedies">
        <div className="space-y-2">
          {[
            { section: "Mon Espace", items: ["Dashboard", "Mon Bureau (6 tabs)", "Mes Chantiers (4 tabs)"], Icon: Briefcase, color: "blue", file: "SectionEspaceBureau.tsx" },
            { section: "Rooms", items: ["Board Room (amber)", "War Room (red)", "Think Room (cyan)"], Icon: Crown, color: "amber", file: "SectionRooms.tsx" },
            { section: "Mon Equipe", items: ["12 departements", "Live dots verts", "Badges notification rouge"], Icon: Users, color: "violet", file: "SectionEntreprise.tsx" },
            { section: "Mon Reseau", items: ["Marketplace", "Cellules", "Jumelage", "Gouvernance", "Pionniers"], Icon: Network, color: "orange", file: "SectionOrbit9.tsx" },
            { section: "Mon Industrie", items: ["Nouvelles", "Evenements", "Dashboard Industrie"], Icon: TrendingUp, color: "cyan", file: "SectionTrgIndustries.tsx" },
            { section: "Master GHML", items: ["7 blocs (A-G)", "24 sous-sections numerotees"], Icon: Sparkles, color: "indigo", file: "SectionMasterGHML.tsx" },
          ].map((s) => (
            <Card key={s.section} className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                <s.Icon className={cn("h-3.5 w-3.5", `text-${s.color}-500`)} />
                <span className="text-xs font-bold text-gray-800">{s.section}</span>
                <span className="text-[9px] text-gray-400 ml-auto">{s.items.length} items</span>
              </div>
              <div className="px-3 py-2 flex items-start gap-3">
                <div className="flex-1 space-y-0.5">
                  {s.items.map((item, i) => (
                    <div key={i} className="text-[9px] text-gray-600 py-0.5 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <span className="text-[8px] text-gray-300 font-mono shrink-0">{s.file}</span>
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      {/* 15.3 — Department item pattern */}
      <PatternCard title="5.3 Item departement — pattern complet" where="SectionEntreprise.tsx">
        <Card className="p-0 overflow-hidden w-56">
          <div className="divide-y">
            {BOTS_12.slice(0, 5).map((bot, i) => (
              <div key={bot.code} className={cn("px-3 py-2 flex items-center gap-2 text-xs", i === 1 && "bg-accent border-l-2 border-l-blue-500")}>
                <bot.icon className={cn("h-3.5 w-3.5 shrink-0", `text-${bot.color}-500`)} />
                <span className={cn("truncate flex-1", i === 1 ? "font-medium" : "text-gray-600")}>{bot.dept}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                {i === 2 && <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 rounded-full shrink-0">3</span>}
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Actif:</strong> bg-accent + border-l-2 bleu</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Live dot:</strong> w-1.5 h-1.5 bg-green-400</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Badge:</strong> bg-red-500 rounded-full</div>
        </div>
      </PatternCard>

      {/* 15.4 — Collapsible trigger */}
      <PatternCard title="5.4 Collapsible trigger — ouvert vs ferme" where="Toutes les sections sidebar">
        <div className="space-y-2 w-56">
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 rotate-90" />
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Mon Espace</span>
            </div>
            <div className="p-1.5 space-y-0.5">
              {["Item actif", "Item normal"].map((l, i) => (
                <div key={l} className={cn("px-2 py-1 rounded text-[9px]", i === 0 ? "bg-accent font-medium" : "text-gray-600")}>{l}</div>
              ))}
            </div>
          </div>
          <div className="border rounded-lg">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Rooms</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Composant: Collapsible + CollapsibleTrigger + CollapsibleContent (shadcn/ui)
        </div>
      </PatternCard>

      {/* 15.5 — Separateur + bottom zone */}
      <PatternCard title="5.5 Separateurs et zone bottom" where="SidebarLeft — entre sections + bas">
        <div className="w-56 space-y-3">
          <div>
            <div className="text-[9px] font-bold text-gray-400 mb-1">Separateur entre sections</div>
            <div className="h-px bg-gray-100 w-full" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-400 mb-1">Zone bottom (toujours visible)</div>
            <div className="border rounded-lg p-2 flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[9px] text-gray-600">Reglages</span>
            </div>
          </div>
        </div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 16. CONSOLE SIDEBAR DROITE
// ================================================================

export function Tab17ConsoleDroite() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-6"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Console Droite</span></div>
      <div className="text-xs text-gray-600 leading-relaxed">
        Console de communication — CarlOsPulse, VideoCallWidget, InputBar, DiscussionsPanel avec systeme de chaleur.
      </div>

      {/* 16.1 — Vue d'ensemble sidebar droite */}
      <PatternCard title="5.6 Structure complete — sidebar droite" where="SidebarRight (FrameMaster.tsx)">
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm w-64 mx-auto">
          {/* CarlOsPulse */}
          <div className="px-3 py-2 border-b flex items-center gap-2">
            <div className="relative">
              <Activity className="h-3.5 w-3.5 text-green-500" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
            <span className="text-[9px] font-bold text-gray-700">CarlOS Pulse</span>
            <span className="text-[8px] text-green-500 ml-auto">En ligne</span>
          </div>

          {/* Video Widget */}
          <div className="px-2 py-2 border-b">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-600 ring-2 ring-white/20" />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[7px] text-white/80">Pret</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Phone className="h-2.5 w-2.5 text-white" /></div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Video className="h-2.5 w-2.5 text-white" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient separator */}
          <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />

          {/* Input Bar */}
          <div className="px-2 py-2 border-b">
            <div className="flex items-end gap-1.5">
              <div className="flex-1 bg-gray-50 border rounded-lg px-2 py-1.5 min-h-[28px]">
                <span className="text-[8px] text-gray-300">Parler a CarlOS...</span>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center"><Mic className="h-3.5 w-3.5 text-gray-400" /></div>
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center"><Upload className="h-3.5 w-3.5 text-gray-400" /></div>
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center"><Send className="h-3.5 w-3.5 text-white" /></div>
              </div>
            </div>
          </div>

          {/* Discussions Panel header */}
          <div className="px-2 pt-2 pb-1">
            <div className="flex gap-1">
              {[
                { label: "Discussions", active: true, color: "bg-violet-100 text-violet-700" },
                { label: "Missions", active: false, color: "text-gray-400" },
                { label: "Chantiers", active: false, color: "text-gray-400" },
              ].map((t) => (
                <span key={t.label} className={cn("text-[8px] font-medium px-1.5 py-0.5 rounded", t.color)}>{t.label}</span>
              ))}
            </div>
          </div>

          {/* Discussions items */}
          <div className="px-2 pb-2 space-y-1">
            {[
              { title: "Strategie Q2", time: "il y a 2h" },
              { title: "Budget formation", time: "hier" },
            ].map((d) => (
              <div key={d.title} className="bg-gray-50 rounded-lg px-2 py-1.5 flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-medium text-gray-700 truncate">{d.title}</div>
                  <div className="text-[8px] text-gray-400">{d.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PatternCard>

      {/* 16.2 — CarlOsPulse */}
      <PatternCard title="5.7 CarlOsPulse — 3 niveaux de severite" where="CarlOsPulse.tsx">
        <div className="flex gap-4">
          {[
            { level: "Calm", color: "bg-green-400", textColor: "text-green-600", label: "Aucun probleme detecte" },
            { level: "Suggestion", color: "bg-amber-400", textColor: "text-amber-600", label: "2 alertes a consulter" },
            { level: "Critical", color: "bg-red-500", textColor: "text-red-600", label: "Action requise!" },
          ].map((p) => (
            <Card key={p.level} className="flex-1 p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative">
                  <Activity className={cn("h-3.5 w-3.5", p.textColor)} />
                  <div className={cn("absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full", p.color, p.level === "Critical" && "animate-pulse")} />
                </div>
                <span className={cn("text-[9px] font-bold", p.textColor)}>{p.level}</span>
              </div>
              <div className="text-[8px] text-gray-500">{p.label}</div>
            </Card>
          ))}
        </div>
      </PatternCard>

      {/* 16.3 — VideoCallWidget */}
      <PatternCard title="5.8 VideoCallWidget — standby + en appel" where="VideoCallWidget.tsx">
        <div className="grid grid-cols-2 gap-3">
          {/* Standby */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">Etat: Standby</div>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gray-600/80 ring-2 ring-white/20" />
              </div>
              <div className="absolute bottom-1 left-1.5 bg-black/40 rounded px-1.5 py-0.5 backdrop-blur-sm">
                <div className="text-[7px] text-white font-medium">CarlOS</div>
                <div className="text-[6px] text-white/60">CEO — Direction</div>
              </div>
              <div className="absolute bottom-1 right-1.5 flex gap-1">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow"><Phone className="h-3.5 w-3.5 text-white" /></div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow"><Video className="h-3.5 w-3.5 text-white" /></div>
              </div>
            </div>
          </div>
          {/* En appel */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">Etat: En appel</div>
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg relative overflow-hidden ring-2 ring-green-400">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gray-600/80 ring-2 ring-green-400/40" />
              </div>
              <div className="absolute top-1 right-1.5 flex items-center gap-1 bg-green-500/80 rounded-full px-1.5 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[7px] text-white font-medium">02:34</span>
              </div>
              <div className="absolute bottom-1 inset-x-1.5 flex justify-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center"><Mic className="h-3.5 w-3.5 text-white" /></div>
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"><Phone className="h-3.5 w-3.5 text-white rotate-[135deg]" /></div>
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center"><Volume2 className="h-3.5 w-3.5 text-white" /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Images standby generees par bot (3:1 aspect ratio). Overlay identity card + barre statut + boutons vocal/video.
        </div>
      </PatternCard>

      {/* 16.4 — Gradient separator */}
      <PatternCard title="5.9 Gradient separator — signature visuelle" where="SidebarRight — entre VideoWidget et InputBar">
        <div className="space-y-3">
          <div>
            <div className="text-[9px] font-bold text-gray-400 mb-1.5">Gradient tricolore (standard)</div>
            <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full" />
          </div>
          <CodeBlock code="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
          <div className="text-[9px] text-gray-500">Separateur signature entre le widget video et la zone input — toujours present.</div>
        </div>
      </PatternCard>

      {/* 16.5 — DiscussionsPanel 3 tabs */}
      <PatternCard title="5.10 DiscussionsPanel — 3 onglets avec couleurs" where="DiscussionsPanel.tsx">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[
              { label: "Discussions", color: "violet", Icon: MessageSquare, count: 4 },
              { label: "Missions", color: "blue", Icon: Target, count: 2 },
              { label: "Chantiers", color: "orange", Icon: Flame, count: 3 },
            ].map((tab, i) => (
              <Card key={tab.label} className={cn("flex-1 p-2.5 overflow-hidden", i === 0 && `ring-1 ring-${tab.color}-300`)}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <tab.Icon className={cn("h-3.5 w-3.5", `text-${tab.color}-500`)} />
                  <span className={cn("text-[9px] font-bold", `text-${tab.color}-700`)}>{tab.label}</span>
                </div>
                <div className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded inline-block", i === 0 ? `bg-${tab.color}-100 text-${tab.color}-700` : "bg-gray-100 text-gray-500")}>
                  {tab.count} actifs
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PatternCard>

      {/* 16.6 — Chaleur / Heat system */}
      <PatternCard title="5.11 Systeme de chaleur — 3 etats pour chantiers" where="DiscussionsPanel.tsx — chaleur picker">
        <div className="space-y-3">
          <div className="text-[9px] text-gray-600">Chaque chantier a un etat de chaleur qui determine son urgence visuelle.</div>
          <div className="space-y-2">
            {[
              { emoji: "fire", label: "Brule", desc: "Urgence maximale — action immediate", borderColor: "border-l-red-500", bgColor: "bg-red-50", dotColor: "bg-red-500", textColor: "text-red-700" },
              { emoji: "yellow", label: "Couve", desc: "En progression — surveiller", borderColor: "border-l-amber-400", bgColor: "bg-amber-50", dotColor: "bg-amber-400", textColor: "text-amber-700" },
              { emoji: "white", label: "Meurt", desc: "Inactif ou abandonne", borderColor: "border-l-gray-300", bgColor: "bg-gray-50", dotColor: "bg-gray-300", textColor: "text-gray-500" },
            ].map((heat) => (
              <Card key={heat.label} className={cn("p-0 overflow-hidden border-l-4", heat.borderColor)}>
                <div className={cn("px-3 py-2.5 flex items-center gap-3", heat.bgColor)}>
                  <div className={cn("w-2 h-2 rounded-full shrink-0", heat.dotColor)} />
                  <div className="flex-1">
                    <div className={cn("text-xs font-bold", heat.textColor)}>{heat.label}</div>
                    <div className="text-[9px] text-gray-500">{heat.desc}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {["fire","yellow","white"].map((e) => (
                      <button key={e} className={cn("w-5 h-5 rounded flex items-center justify-center text-xs", e === heat.emoji ? "bg-white shadow-sm ring-1 ring-gray-200" : "text-gray-300")}>
                        {e === "fire" ? "🔥" : e === "yellow" ? "🟡" : "⚪"}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[9px]">
            <div className="bg-red-50 rounded p-1.5"><strong>Brule:</strong> border-l-red-500 + bg-red-50</div>
            <div className="bg-amber-50 rounded p-1.5"><strong>Couve:</strong> border-l-amber-400 + bg-amber-50</div>
            <div className="bg-gray-50 rounded p-1.5"><strong>Meurt:</strong> border-l-gray-300 + bg-gray-50</div>
          </div>
        </div>
      </PatternCard>

      {/* 16.7 — InputBar compact */}
      <PatternCard title="5.12 InputBar — mode compact sidebar" where="InputBar.tsx">
        <div className="w-64 mx-auto space-y-2">
          <div className="border rounded-lg p-2">
            <div className="flex items-end gap-1.5">
              <div className="flex-1 bg-gray-50 border rounded-lg px-2.5 py-2 min-h-[32px]">
                <span className="text-[9px] text-gray-300">Parler a CarlOS...</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Mic className="h-3.5 w-3.5 text-gray-500" /></div>
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Upload className="h-3.5 w-3.5 text-gray-500" /></div>
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center"><Send className="h-3.5 w-3.5 text-white" /></div>
              </div>
            </div>
          </div>
          <div className="text-[9px] text-gray-500">3 boutons: Vocal (Mic) + Fichier (Upload) + Envoyer (Send bleu). Textarea auto-resize.</div>
        </div>
      </PatternCard>

      {/* 16.8 — Sentinel alerts */}
      <PatternCard title="5.13 Alertes Sentinelle — 4 niveaux" where="ActiveAgentsPanel.tsx">
        <div className="space-y-1.5">
          {[
            { level: "CRITIQUE", color: "border-l-red-500 bg-red-50", badge: "bg-red-500 text-white" },
            { level: "IMPORTANT", color: "border-l-amber-400 bg-amber-50", badge: "bg-amber-400 text-white" },
            { level: "INFO", color: "border-l-blue-400 bg-blue-50", badge: "bg-blue-400 text-white" },
            { level: "SUCCES", color: "border-l-green-400 bg-green-50", badge: "bg-green-400 text-white" },
          ].map((a) => (
            <div key={a.level} className={cn("border-l-4 rounded-r-lg px-3 py-2 flex items-center gap-2", a.color)}>
              <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", a.badge)}>{a.level}</span>
              <div className="flex-1"><div className="h-1.5 bg-gray-200 rounded w-3/4" /></div>
            </div>
          ))}
        </div>
      </PatternCard>

      {/* 16.9 — Voice Streaming — etats detailles */}
      <PatternCard title="5.14 Voice Streaming — 4 etats LiveKit" where="VideoCallWidget.tsx + carlos_livekit_agent.py">
        <div className="grid grid-cols-2 gap-3">
          {[
            { state: "Idle", desc: "Bouton bleu, pret a appeler", ring: "ring-blue-400", bg: "bg-blue-500", icon: <Phone className="h-3.5 w-3.5 text-white" />, dot: "bg-blue-400" },
            { state: "Connecting", desc: "Pulse, connexion LiveKit", ring: "ring-amber-400", bg: "bg-amber-500", icon: <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />, dot: "bg-amber-400" },
            { state: "Connected", desc: "Timer, micro, speaker", ring: "ring-green-400", bg: "bg-green-500", icon: <Phone className="h-3.5 w-3.5 text-white" />, dot: "bg-green-400" },
            { state: "Error", desc: "Reconnexion auto 5s", ring: "ring-red-400", bg: "bg-red-500", icon: <AlertTriangle className="h-3.5 w-3.5 text-white" />, dot: "bg-red-400" },
          ].map((s) => (
            <div key={s.state} className="text-center">
              <div className={cn("w-10 h-10 rounded-full mx-auto flex items-center justify-center shadow ring-2", s.bg, s.ring)}>{s.icon}</div>
              <div className="text-[9px] font-bold mt-1">{s.state}</div>
              <div className="text-[8px] text-gray-400">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 text-[9px] text-gray-500">
          <div><span className="font-bold">Pipeline:</span> Deepgram STT (nova-3 fr) → CarlOS API → ElevenLabs TTS (Chris voice)</div>
          <div><span className="font-bold">Room:</span> <span className="font-mono text-[8px]">carlos-{'{'} botCode {'}'}-{'{'} user {'}'}-{'{'} uuid {'}'}</span></div>
          <div><span className="font-bold">Pont vocal:</span> Transcripts POST /voice/event → frontend poll /voice/events toutes 2s</div>
          <div><span className="font-bold">Son connexion:</span> Web Audio API — sub bass + resonant filter + accord A majeur</div>
          <div><span className="font-bold">Greeting:</span> &quot;Salut Carl! Qu est-ce que je peux faire pour toi?&quot;</div>
        </div>
      </PatternCard>

      {/* 16.10 — CarlOS Avatar — mode premium */}
      <PatternCard title="5.15 CarlOS Avatar — video + audio bars" where="CarlOSAvatar.tsx">
        <div className="flex gap-3">
          {/* Avatar preview */}
          <div className="w-28 shrink-0">
            <div className="aspect-[3/4] bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl relative overflow-hidden ring-2 ring-blue-400/30">
              {/* Glow pulse */}
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-xl" />
              {/* Avatar placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-600 ring-2 ring-blue-400/40" />
              </div>
              {/* Wave rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-blue-400/20" />
                <div className="absolute w-24 h-24 rounded-full border border-blue-400/10" />
              </div>
              {/* Toolbar bottom */}
              <div className="absolute bottom-1 inset-x-1 flex justify-center gap-1">
                <div className="w-5 h-5 rounded-full bg-gray-700/80 flex items-center justify-center">
                  <Volume2 className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="w-5 h-5 rounded-full bg-gray-700/80 flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
          {/* Specs */}
          <div className="flex-1 space-y-2 text-[9px]">
            <div className="font-bold text-gray-700">Composantes visuelles</div>
            {[
              { label: "Container", val: "320px tall, gradient from-gray-800 to-gray-900" },
              { label: "Speaking glow", val: "Pulse ring bleu quand audio actif" },
              { label: "Wave rings", val: "2 cercles concentriques (20/10% opacite)" },
              { label: "Audio bars", val: "40 barres — vert (parle) / ambre (tape) / blanc (idle)" },
              { label: "Auto-TTS", val: "Toggle on/off — lecture auto des reponses" },
              { label: "Tavus lip-sync", val: "Replica Lucas Studio (r5f0577fc829), $0.37/min" },
            ].map((spec) => (
              <div key={spec.label} className="flex gap-1.5">
                <span className="font-bold text-gray-500 w-20 shrink-0">{spec.label}</span>
                <span className="text-gray-400">{spec.val}</span>
              </div>
            ))}
            {/* Audio visualizer mini */}
            <div className="pt-1">
              <div className="text-[8px] font-bold text-gray-400 mb-1">Audio Visualizer (40 barres)</div>
              <div className="flex items-end gap-px h-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-green-400 rounded-t" style={{ height: `${Math.random() * 100}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 16.11 — Conference Jitsi */}
      <PatternCard title="5.16 Conference Jitsi — mode multi-participants" where="VideoCallWidget.tsx — Jitsi overlay">
        <div className="space-y-3">
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden ring-2 ring-emerald-400/40">
            {/* Jitsi 4-grid mock */}
            <div className="grid grid-cols-2 grid-rows-2 gap-px absolute inset-0">
              {["Carl", "Invité 1", "Invité 2", "CarlOS"].map((nom, i) => (
                <div key={nom} className="bg-gray-800 flex items-center justify-center relative">
                  <div className="w-8 h-8 rounded-full bg-gray-600" />
                  <div className="absolute bottom-0.5 left-1 text-[6px] text-white/80 bg-black/40 px-1 rounded">{nom}</div>
                  {i === 3 && <div className="absolute top-0.5 right-0.5"><Bot className="h-2.5 w-2.5 text-blue-400" /></div>}
                </div>
              ))}
            </div>
            {/* Close button */}
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">X</span>
            </div>
            {/* Bottom toolbar */}
            <div className="absolute bottom-1 inset-x-0 flex justify-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-700/80 flex items-center justify-center"><Mic className="h-3.5 w-3.5 text-white" /></div>
              <div className="w-6 h-6 rounded-full bg-gray-700/80 flex items-center justify-center"><Video className="h-3.5 w-3.5 text-white" /></div>
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"><Phone className="h-3.5 w-3.5 text-white rotate-[135deg]" /></div>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 space-y-1">
            <div><span className="font-bold">Bouton:</span> Icone Video emerald (idle) → red (actif) dans VideoCallWidget</div>
            <div><span className="font-bold">iframe:</span> z-30 full-screen overlay meet.jit.si</div>
            <div><span className="font-bold">Room:</span> <span className="font-mono text-[8px]">ghostx-{'{'} botCode {'}'}-{'{'} hash {'}'}</span></div>
            <div><span className="font-bold">Controles:</span> Micro, Camera, Raccrocher — toolbar intégrée Jitsi</div>
          </div>
        </div>
      </PatternCard>

      {/* 16.12 — RayBan Meta Vision */}
      <PatternCard title="5.17 Vision RayBan Meta — lunettes connectees" where="useGlassesEvents.ts + MobileCallFAB.tsx">
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            {/* Glasses mockup */}
            <div className="w-24 shrink-0 aspect-[2/1] bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl border border-gray-300 flex items-center justify-center relative overflow-hidden">
              <Eye className="h-5 w-5 text-gray-400" />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            {/* Description */}
            <div className="flex-1 space-y-1.5 text-[9px]">
              <div className="font-bold text-gray-700">Push Events Polling</div>
              <div className="text-gray-500">GET /api/v1/glasses/events toutes les 3s</div>
              <div className="text-gray-500">Commande vocale → section routing automatique</div>
            </div>
          </div>
          {/* Section routing map */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1.5">Routage vocal → navigation</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { voice: "finances", target: "BCF dept" },
                { voice: "marketing", target: "BCM dept" },
                { voice: "operations", target: "BOO dept" },
                { voice: "strategie", target: "BCS dept" },
                { voice: "dashboard", target: "Dashboard" },
                { voice: "bureau", target: "Mon Bureau" },
              ].map((r) => (
                <div key={r.voice} className="flex items-center gap-1 bg-gray-50 rounded px-1.5 py-1">
                  <span className="text-[8px] font-mono text-violet-600">&quot;{r.voice}&quot;</span>
                  <ArrowRight className="h-2 w-2 text-gray-400" />
                  <span className="text-[8px] text-gray-500">{r.target}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile FAB */}
          <div className="flex items-center gap-2 pt-1 border-t border-dashed">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div className="text-[9px] text-gray-500">
              <div className="font-bold">MobileCallFAB</div>
              <div>Bouton flottant mobile — 4 etats (idle/connecting/connected/error)</div>
            </div>
          </div>
        </div>
      </PatternCard>

      {/* 16.13 — YouTube Video Push */}
      <PatternCard title="5.18 YouTube Video Push — contexte multimedia" where="Zone 16:9 — VideoCallWidget / Canvas">
        <div className="space-y-3">
          <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden ring-1 ring-gray-700">
            {/* YouTube player mock */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="w-12 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent ml-1" />
              </div>
            </div>
            {/* Title overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="text-[8px] text-white font-medium">Automatisation usine 4.0 — Cas client XYZ</div>
              <div className="text-[7px] text-white/60">Pousse par CarlOS en contexte de discussion</div>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gray-700">
              <div className="h-full w-1/3 bg-red-500 rounded-r" />
            </div>
          </div>
          <div className="text-[9px] text-gray-500 space-y-1">
            <div><span className="font-bold">Concept:</span> CarlOS pousse des videos YouTube pertinentes pendant une discussion sur un projet</div>
            <div><span className="font-bold">Zone:</span> Format 16:9 dans la console droite (meme espace que VideoCallWidget)</div>
            <div><span className="font-bold">Declencheur:</span> Sujet de discussion → match avec bibliotheque de videos curatees</div>
            <div><span className="font-bold">Objectif:</span> Alimenter la reflexion avec du contenu video en lien direct avec le sujet en cours</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <div className="text-[9px] font-bold text-amber-700">A DEVELOPPER</div>
            <div className="text-[8px] text-amber-600 mt-0.5">Feature planifiee — bibliotheque de videos indexees par sujet + push contextuel automatique par CarlOS</div>
          </div>
        </div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// HELPERS — From MasterNavigationPage.tsx (used by Tab1Structure)
// ================================================================

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

function StatusBadge({ status }: { status: "live" | "partiel" | "planifie" | "futur" }) {
  const styles = {
    live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partiel: "bg-amber-50 text-amber-700 border-amber-200",
    planifie: "bg-blue-50 text-blue-700 border-blue-200",
    futur: "bg-gray-50 text-gray-500 border-gray-200",
  };
  const labels = { live: "Live", partiel: "Partiel", planifie: "Planifié", futur: "Futur" };
  return (
    <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full border", styles[status])}>
      {labels[status]}
    </span>
  );
}

function NavLevel({ depth = 0, children }: { depth?: number; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1", depth > 0 && "ml-4 pl-3 border-l-2 border-gray-100")}>
      {children}
    </div>
  );
}

function NavItem({ icon: Icon, label, viewId, status, color, sub, tabs }: {
  icon: React.ElementType;
  label: string;
  viewId?: string;
  status: "live" | "partiel" | "planifie" | "futur";
  color: string;
  sub?: string;
  tabs?: string[];
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <StatusBadge status={status} />
          {viewId && (
            <code className="text-[9px] text-gray-400 font-mono bg-gray-50 px-1 rounded">{viewId}</code>
          )}
        </div>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        {tabs && tabs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tabs.map((t) => (
              <span key={t} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================================
// DATA — Navigation Stats
// ======================================================================

const NAV_STATS = [
  { label: "Routes ActiveView", value: "48", color: "blue" },
  { label: "Sections Sidebar", value: "6", color: "violet" },
  { label: "Sous-tabs", value: "20+", color: "emerald" },
  { label: "Pages Master GHML", value: "18", color: "amber" },
  { label: "State Variables", value: "12", color: "rose" },
  { label: "Navigate Methods", value: "10", color: "teal" },
];

// ======================================================================
// DATA — Context State
// ======================================================================

const CONTEXT_VARS = [
  { name: "activeView", type: "ActiveView (48 values)", desc: "Route principale du canvas central", scope: "Global" },
  { name: "activeBotCode", type: "string", desc: "Bot actif (BCO, BCT, etc.) — couleur bande + contexte", scope: "Global" },
  { name: "activeEspaceSection", type: "EspaceSection", desc: "Sous-tab dans EspaceBureauView", scope: "Mon Espace" },
  { name: "activeDiscussionTab", type: "DiscussionTab", desc: "Sous-tab dans MesChantiersView", scope: "Mon Espace" },
  { name: "activeBlueprintSection", type: "BlueprintSection", desc: "Sous-tab dans BluePrintView", scope: "Mon Équipe" },
  { name: "activeOrbit9Section", type: "string", desc: "Section Orbit9 active", scope: "Mon Réseau" },
  { name: "chatSourceView", type: "string", desc: "Vue source quand LiveChat ouvre depuis Room (D-109)", scope: "Rooms" },
  { name: "leftSidebarCollapsed", type: "boolean", desc: "Sidebar gauche réduite (icônes seulement)", scope: "UI" },
  { name: "rightSidebarCollapsed", type: "boolean", desc: "Sidebar droite (LiveChat) visible/cachée", scope: "UI" },
  { name: "isAuthenticated", type: "boolean", desc: "Login state (localStorage)", scope: "Auth" },
  { name: "isOnboarded", type: "boolean", desc: "Onboarding complété", scope: "Auth" },
  { name: "hasSeenSimulation", type: "boolean", desc: "Simulation CREDO vue (tutorial)", scope: "Auth" },
];

const NAV_METHODS = [
  { name: "setActiveView", signature: "(view: ActiveView)", desc: "Change la route principale du canvas" },
  { name: "setActiveBot", signature: "(bot: BotInfo)", desc: "Change le bot actif + code bot" },
  { name: "navigateToDepartment", signature: "(code: string, view?)", desc: "Bot + vue département (défaut: tour de contrôle)" },
  { name: "navigateOrbit9", signature: "(sectionId: string)", desc: "Section Orbit9 + vue orbit9-detail" },
  { name: "navigateEspace", signature: "(section: EspaceSection)", desc: "Sous-section bureau + vue espace-bureau" },
  { name: "navigateBlueprint", signature: "(section: BlueprintSection)", desc: "Sous-section blueprint + vue blueprint" },
  { name: "navigateDiscussionTab", signature: "(tab: DiscussionTab)", desc: "Change le tab dans MesChantiersView" },
  { name: "navigateToChat", signature: "(sourceView: string)", desc: "Ouvre LiveChat avec source (D-109 Rooms)" },
  { name: "toggleLeftSidebar", signature: "()", desc: "Collapse/expand sidebar gauche" },
  { name: "toggleRightSidebar", signature: "()", desc: "Collapse/expand sidebar droite (LiveChat)" },
];

// ======================================================================
// DATA — Bot Identity Colors
// ======================================================================

const BOT_COLORS = [
  { code: "BCO", role: "CEO — Direction", band: "bg-blue-500", text: "text-blue-600" },
  { code: "BCT", role: "CTO — Technologie", band: "bg-violet-500", text: "text-violet-600" },
  { code: "BCF", role: "CFO — Finance", band: "bg-emerald-500", text: "text-emerald-600" },
  { code: "BCM", role: "CMO — Marketing", band: "bg-pink-500", text: "text-pink-600" },
  { code: "BCS", role: "CSO — Stratégie", band: "bg-red-500", text: "text-red-600" },
  { code: "BOO", role: "COO — Opérations", band: "bg-orange-500", text: "text-orange-600" },
  { code: "BFA", role: "CPO — Production", band: "bg-slate-400", text: "text-slate-600" },
  { code: "BHR", role: "CHRO — RH", band: "bg-teal-500", text: "text-teal-600" },
  { code: "BIO", role: "CINO — Innovation", band: "bg-rose-500", text: "text-rose-600" },
  { code: "BRO", role: "CRO — Ventes", band: "bg-amber-500", text: "text-amber-600" },
  { code: "BLE", role: "CLO — Légal", band: "bg-indigo-500", text: "text-indigo-600" },
  { code: "BSE", role: "CISO — Sécurité", band: "bg-zinc-400", text: "text-zinc-600" },
];


// ================================================================
// 9 TABS — Fonctions par section de navigation
// ================================================================

function Tab1Structure() {
  return (
    <div className="space-y-4">
      <SectionTitle num="1" title="Structure App — Navigation Complete (FE.5)" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Copie fidele de MasterNavigationPage.tsx (C.2.1-C.2.10). 48 routes, 6 sections sidebar, context state, 12 bots.
      </div>

      {/* ============================================================ */}
      {/* VUE D'ENSEMBLE — Stats */}
      {/* ============================================================ */}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {NAV_STATS.map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <div className={cn("text-2xl font-bold", `text-${s.color}-600`)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ============================================================ */}
      {/* SECTION 1 — Architecture 3 Zones */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="h-4 w-4 text-slate-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.1</span>Architecture — Top Bar + 3 Zones</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          L'interface CarlOS suit un layout <strong>Top Bar fixe + 3 colonnes</strong>. La barre du haut est
          la navigation CEO-level. La zone centrale est le canvas principal,
          contrôlé par <code className="text-xs bg-gray-100 px-1 rounded">activeView</code> dans FrameMasterContext.
        </p>

        {/* === TOP BAR — 3 sous-zones === */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Top Bar — Barre Supérieure</div>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <Card className="p-3 border-t-4 border-t-blue-500">
              <div className="text-xs font-semibold text-blue-700 mb-1">Zone Gauche</div>
              <div className="text-[9px] text-gray-500 space-y-0.5">
                <div className="font-medium text-gray-700">Logo Usine Bleue</div>
                <div>Logo de l'instance client</div>
                <div>Click → retour Tour de Contrôle</div>
              </div>
            </Card>
            <Card className="p-3 border-t-4 border-t-emerald-500">
              <div className="text-xs font-semibold text-emerald-700 mb-1">Zone Centre</div>
              <div className="text-[9px] text-gray-500 space-y-0.5">
                <div className="font-medium text-gray-700">Niveau Entreprise — CEO + CarlOS</div>
                <div>Tour de Contrôle</div>
                <div>Cockpit</div>
                <div>Blueprint</div>
                <div>Santé Globale</div>
                <div className="text-gray-400 italic">= raccourcis vers Mon Entreprise (C.2.2.1)</div>
              </div>
            </Card>
            <Card className="p-3 border-t-4 border-t-violet-500">
              <div className="text-xs font-semibold text-violet-700 mb-1">Zone Droite</div>
              <div className="text-[9px] text-gray-500 space-y-0.5">
                <div className="font-medium text-gray-700">Instance + Utilisateur</div>
                <div>Nom instance client (ex: "Couche-Tard")</div>
                <div>Icône utilisateur → menu déroulant:</div>
                <div className="ml-2">• Mon Profil</div>
                <div className="ml-2">• Réglages Généraux</div>
                <div className="ml-2">• Réglages Agents AI (ex-sidebar)</div>
                <div className="ml-2">• FAQ (CarlOS répond)</div>
                <div className="ml-2">• Abonnement</div>
                <div className="ml-2">• Déconnexion</div>
              </div>
            </Card>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-lg border border-dashed border-blue-200">
            <p className="text-[9px] text-blue-700 font-medium">
              SPRINT DÉDIÉ: La section Réglages (profil, agents AI, FAQ, abonnement) sera détaillée dans un sprint dédié.
              Éléments standards — pas réinventer la roue. CarlOS disponible en FAQ contextuelle.
            </p>
          </div>
        </div>

        {/* === 3 ZONES COLONNES === */}
        <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">3 Zones Colonnes</div>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 border-l-4 border-l-blue-400">
            <div className="text-xs font-semibold text-blue-700 mb-1">Sidebar Gauche</div>
            <div className="text-[9px] text-gray-500 space-y-0.5">
              <div>6 sections collapsibles</div>
              <div>Navigation principale</div>
              <div>Mode collapsed = icônes</div>
              <div className="font-mono text-gray-400">SidebarLeft.tsx</div>
            </div>
          </Card>
          <Card className="p-3 border-l-4 border-l-emerald-400">
            <div className="text-xs font-semibold text-emerald-700 mb-1">Canvas Central</div>
            <div className="text-[9px] text-gray-500 space-y-0.5">
              <div>48 routes ActiveView</div>
              <div>Router conditionnel</div>
              <div>Bande couleur par bot</div>
              <div className="font-mono text-gray-400">CenterZone.tsx</div>
            </div>
          </Card>
          <Card className="p-3 border-l-4 border-l-violet-400">
            <div className="text-xs font-semibold text-violet-700 mb-1">Sidebar Droite</div>
            <div className="text-[9px] text-gray-500 space-y-0.5">
              <div>LiveChat permanent</div>
              <div>Alertes + contexte</div>
              <div>CarlOS Presence</div>
              <div className="font-mono text-gray-400">SidebarRight.tsx</div>
            </div>
          </Card>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* SECTION 2 — Sidebar Gauche — 7 Sections */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2</span>Sidebar Gauche — 6 Sections + Réglages Top Bar</h2>
        </div>

        {/* === PATTERN UNIVERSEL DE NAVIGATION === */}
        <Card className="p-4 mb-4 bg-slate-50/50 border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Route className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-800">Pattern Universel: Sidebar → Tabs Centre</span>
            <Badge className="text-[9px] bg-slate-100 text-slate-700 border-slate-200">CONVENTION</Badge>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            <strong>Réflexe gauche → droite:</strong> Chaque section master dans la sidebar gauche ouvre une vue
            dans le canvas central avec des <strong>tabs horizontaux</strong> pour ses sous-sections.
            Les sous-sections listées dans le sidebar = les mêmes tabs affichés dans le centre.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-emerald-700 uppercase">Sections avec tabs centre</div>
              <div className="text-[9px] text-gray-600 space-y-0.5">
                <div>Mon Entreprise → 5 tabs (Direction, TdC, Cockpit, Blueprint, Santé)</div>
                <div>Mon Bureau → 5 tabs (Idées, Documents, Outils, Tâches, Agenda)</div>
                <div>Mes Salles → 3 tabs (Board, War, Think Room)</div>
                <div>Mon Réseau → 7 tabs (Profil, Cellules, Jumelage, Pionniers, Gouvernance, Dashboard, Industrie)</div>
                <div>Master GHML → 4 blocs (FE, BE, RD, SA)</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-violet-700 uppercase">Exception: Mon Équipe AI</div>
              <div className="text-[9px] text-gray-600 space-y-0.5">
                <div>Sidebar = liste des 11 agents AI</div>
                <div>Click agent → vue intro agent avec ses propres tabs</div>
                <div>Tabs agent: Vue d'ensemble | Pipeline | Documents | Diagnostics</div>
                <div className="italic text-gray-400">Les tabs ne sont PAS dans la sidebar mais dans la vue agent</div>
              </div>
            </div>
          </div>
        </Card>

        {/* === 2.1 Mon Entreprise (CEO + CarlOS) === */}
        <Card className="p-4 mb-4 bg-blue-50/30 border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-semibold text-blue-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.1</span>Mon Entreprise</span>
            <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200">NOUVEAU</Badge>
            <StatusBadge status="planifie" />
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">Vue CEO — CarlOS est le OS, il gouverne tout en dessous. Carl + CarlOS au sommet.</p>
          <NavLevel>
            <NavItem icon={Crown} label="Direction (CarlOS)" viewId="department → BCO" status="live" color="text-blue-600" sub="Le CEO Bot — département Direction. CarlOS = le OS au sommet de tout." tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Layout} label="Tour de Contrôle" viewId="dashboard" status="live" color="text-blue-500" sub="Dashboard principal — 10 blocs KPI" />
            <NavItem icon={Eye} label="Cockpit" viewId="cockpit" status="live" color="text-violet-500" sub="Vue opérationnelle 360° — tous les bots" />
            <NavItem icon={Activity} label="Blueprint" viewId="blueprint" status="live" color="text-cyan-500" sub="Schéma directeur — Chantiers/Projets/Missions/Tâches" tabs={["Vue d'ensemble", "Timeline", "Chantiers", "Projets", "Missions", "Tâches", "Opportunités", "Équipes"]} />
            <NavItem icon={Activity} label="Santé Globale" viewId="health" status="live" color="text-emerald-500" sub="Métriques système, uptime, API stats" />
          </NavLevel>
        </Card>

        {/* === 2.2 Mon Bureau (workspace perso) === */}
        <Card className="p-4 mb-4 bg-indigo-50/30 border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-sm font-semibold text-indigo-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.2</span>Mon Bureau</span>
            <Badge className="text-[9px] bg-indigo-100 text-indigo-700 border-indigo-200">SectionEspaceBureau.tsx</Badge>
            <StatusBadge status="planifie" />
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">Espace personnel du CEO — ressources et organisation quotidienne.</p>
          <NavLevel>
            <NavItem icon={Sparkles} label="Idées" viewId="espace-bureau → idees" status="live" color="text-amber-500" sub="Capture d'idées rapide (localStorage)" />
            <NavItem icon={FileText} label="Documents" viewId="espace-bureau → documents" status="live" color="text-blue-500" sub="Upload + PostgreSQL réel" />
            <NavItem icon={Wrench} label="Outils" viewId="espace-bureau → outils" status="live" color="text-slate-500" sub="Outils intégrés" />
            <NavItem icon={CheckSquare} label="Tâches" viewId="espace-bureau → taches" status="live" color="text-emerald-500" sub="Option C: Plane.so perso + Tâches Blueprint assignées à l'humain (liées)" />
            <NavItem icon={CalendarDays} label="Agenda" viewId="espace-bureau → agenda" status="partiel" color="text-rose-500" sub="Mock — Google Calendar à connecter" />
          </NavLevel>
          <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-dashed border-amber-200">
            <p className="text-[9px] text-amber-700 font-medium">
              OPTION C APPROUVÉE: Les Tâches Mon Bureau seront liées aux Tâches Blueprint.
              2 sous-onglets: "Mes Tâches" (Plane.so perso) + "Tâches Projet" (Blueprint filtrées pour l'utilisateur humain).
              Sprint dédié — pas dans le sprint actuel.
            </p>
          </div>
        </Card>

        {/* === 2.3 Mes Salles (ex-Rooms) === */}
        <Card className="p-4 mb-4 bg-amber-50/30 border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <DoorOpen className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.3</span>Mes Salles (ex-Rooms, D-109)</span>
            <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200">SectionRooms.tsx → renommer</Badge>
          </div>
          <NavLevel>
            <NavItem icon={Crown} label="Board Room" viewId="board-room" status="live" color="text-amber-600" sub="CA robotique — décisions stratégiques" />
            <NavItem icon={AlertTriangle} label="War Room" viewId="war-room" status="live" color="text-red-500" sub="Gestion de crise — mode urgence" />
            <NavItem icon={Lightbulb} label="Think Room" viewId="think-room" status="live" color="text-amber-500" sub="Innovation — brainstorm libre" />
          </NavLevel>
          <p className="text-xs text-gray-500 mt-2 italic">Chaque Room → navigateToChat() avec chatSourceView pour retour contextuel</p>
        </Card>

        {/* === 2.4 Mon Équipe AI — 12 Départements === */}
        <Card className="p-4 mb-4 bg-violet-50/30 border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-violet-600 shrink-0" />
            <span className="text-sm font-semibold text-violet-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.4</span>Mon Équipe AI — 11 Départements</span>
            <Badge className="text-[9px] bg-violet-100 text-violet-700 border-violet-200">SectionEntreprise.tsx → renommer</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">11 C-Level bots (Direction/BCO retiré → Mon Entreprise). Blueprint retiré d'ici → Mon Entreprise.</p>
          <NavLevel>
            <NavItem icon={DollarSign} label="Finance" viewId="department → BCF" status="live" color="text-emerald-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Cpu} label="Technologie" viewId="department → BCT" status="live" color="text-violet-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Factory} label="Production" viewId="department → BFA" status="live" color="text-slate-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Settings} label="Opérations" viewId="department → BOO" status="live" color="text-orange-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={TrendingUp} label="Ventes" viewId="department → BRO" status="live" color="text-amber-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Megaphone} label="Marketing" viewId="department → BCM" status="live" color="text-pink-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Target} label="Stratégie" viewId="department → BCS" status="live" color="text-red-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Users} label="RH" viewId="department → BHR" status="live" color="text-teal-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Shield} label="Sécurité" viewId="department → BSE" status="live" color="text-zinc-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Scale} label="Légal" viewId="department → BLE" status="live" color="text-indigo-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Lightbulb} label="Innovation" viewId="department → BIO" status="live" color="text-rose-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
          </NavLevel>
        </Card>

        {/* === 2.5 Mon Réseau — Centre Nerveux Orbit9 (7 tabs) === */}
        <Card className="p-4 mb-4 bg-orange-50/30 border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="text-sm font-semibold text-orange-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.5</span>Mon Réseau — Centre Nerveux Orbit9</span>
            <Badge className="text-[9px] bg-orange-100 text-orange-700 border-orange-200">7 tabs — Réseau élite augmenté AI</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">
            Réseau élite de collaborateurs vérifiés. Pas n'importe qui entre — processus de sélection rigoureux (inspiré REAI).
            CarlOS = médiateur proactif entre membres. Meetings sur la plateforme, interventions temps réel.
          </p>

          {/* ——— TAB 1: MON PROFIL RÉSEAU ——— */}
          <div className="mt-3 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 1</span>
              <span className="text-xs font-bold text-gray-800">Mon Profil Réseau</span>
              <span className="text-[9px] text-gray-400">— Crédibilité = monnaie d'échange</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={User} label="Fiche Entreprise" viewId="orbit9 → profil → fiche" status="planifie" color="text-sky-600" sub="CV entreprise vérifié: nom, secteur, spécialités, taille, stade Orbit9, VITAA score" />
            <NavItem icon={Shield} label="Certifications & Sceaux" viewId="orbit9 → profil → certifications" status="planifie" color="text-emerald-600" sub="ISO, RBQ, HACCP, C-TPAT, MEI, licences — validées par CarlOS via documents. Chaque sceau = confiance accrue" />
            <NavItem icon={TrendingUp} label="Score Réputation" viewId="orbit9 → profil → reputation" status="planifie" color="text-amber-600" sub="Calculé sur: collaborations terminées, avis vérifiés, respect engagements, délais, qualité. Visible aux partenaires potentiels" />
            <NavItem icon={Eye} label="Avis & Références" viewId="orbit9 → profil → avis" status="planifie" color="text-violet-500" sub="Avis vérifiés post-collaboration. Étoiles + commentaire. Confiance bidirectionnelle: donneur d'ordre ET fournisseur se notent mutuellement" />
            <NavItem icon={Settings} label="Visibilité & Contrôle" viewId="orbit9 → profil → visibilite" status="planifie" color="text-gray-600" sub="Contrôle ce que les autres voient AVANT matching. Données privées révélées seulement après accord mutuel — dating professionnel progressif" />
          </NavLevel>

          {/* ——— PROCESSUS DE SÉLECTION RIGOUREUX ——— */}
          <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-700" />
              <span className="text-xs font-bold text-orange-800">Processus de Sélection Rigoureux (inspiré REAI)</span>
            </div>
            <p className="text-[9px] text-gray-600 mb-2 italic">
              Réseau élite augmenté AI — on ne prend pas n'importe qui. La crédibilité est la monnaie d'échange.
              Même les fournisseurs invités gratuitement passent par le processus complet.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">1. INVITATION & QUALIFICATION AUTO</div>
                <div className="text-[9px] text-gray-600">
                  Client UB a besoin d'un fournisseur → CarlOS invite le prospect gratuitement →
                  Le prospect démarre le processus de qualification automatisé par AI.
                </div>
              </div>
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">2. VALIDATION AI</div>
                <div className="text-[9px] text-gray-600">
                  CarlOS valide automatiquement: réputation web (Google Reviews, LinkedIn, NEQ),
                  références vérifiables, certifications documentées, historique litiges, santé financière.
                </div>
              </div>
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">3. CRITÈRES D'ADMISSION (style REAI)</div>
                <div className="text-[9px] text-gray-600">
                  ✓ Entreprise active 2+ ans · ✓ Assurances valides · ✓ Aucun litige majeur ouvert ·
                  ✓ Minimum 1 certification pertinente · ✓ Références vérifiées (2+) · ✓ Engagement charte réseau
                </div>
              </div>
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">4. ADMISSION & ONBOARDING</div>
                <div className="text-[9px] text-gray-600">
                  Score de qualification calculé → Profil créé avec sceaux vérifiés →
                  Accès au réseau → CarlOS assigne comme agent personnel → Premier jumelage possible.
                </div>
              </div>
            </div>
            <div className="mt-2 p-1.5 bg-orange-100/50 rounded">
              <p className="text-[9px] text-orange-800 font-medium text-center">
                STRATÉGIE ACQUISITION: Le fournisseur invité gratuitement découvre CarlOS → devient client lui-même → invite SES fournisseurs → flywheel
              </p>
            </div>
          </div>

          {/* ——— TAB 2: MES CELLULES ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 2</span>
              <span className="text-xs font-bold text-gray-800">Mes Cellules</span>
              <span className="text-[9px] text-gray-400">— Drill-down imbriqué + Opportunités</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Handshake} label="Mes Cellules Actives" viewId="orbit9 → cellules" status="live" color="text-emerald-600" sub="Groupes de 3 entreprises complémentaires. Drill-down: Cellule → Chantiers → Projets → Missions → Tâches. Même hiérarchie que Blueprint interne" />
            <NavItem icon={Sparkles} label="Opportunités" viewId="orbit9 → cellules → opportunites" status="planifie" color="text-amber-500" sub="Missions ouvertes dans le réseau, besoins détectés par CarlOS, appels d'offres internes. Aussi visible sur Tour de Contrôle (widget)" />
            <NavItem icon={MessageSquare} label="Meetings Cellule" viewId="orbit9 → cellules → meetings" status="planifie" color="text-blue-500" sub="Meetings SUR la plateforme (LiveKit). CarlOS = médiateur proactif: transcription live, détection tensions, interventions temps réel, action items auto-générés" />
            <NavItem icon={BarChart3} label="Performance Cellule" viewId="orbit9 → cellules → performance" status="planifie" color="text-indigo-500" sub="Heures sauvées par CarlOS, livrables à temps, ROI par chantier, score confiance inter-membres" />
          </NavLevel>

          {/* ——— TAB 3: JUMELAGE ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 3</span>
              <span className="text-xs font-bold text-gray-800">Jumelage</span>
              <span className="text-[9px] text-gray-400">— ACTION: Pipeline CarlOS → Cahier → Expert → Contrat</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Sparkles} label="Détection CarlOS" viewId="orbit9 → jumelage → detection" status="planifie" color="text-amber-500" sub="CarlOS détecte le bon moment (diagnostic VITAA, conversations, besoin identifié). Propose le jumelage quand le client est prêt" />
            <NavItem icon={FileText} label="Qualification & Upload" viewId="orbit9 → jumelage → qualification" status="planifie" color="text-blue-600" sub="CarlOS demande le kit complet: specs, budgets, dessins, échéancier. Évalue si tout est en main. 'Il te manque X' ou 'T'es complet'" />
            <NavItem icon={BookOpen} label="Cahier de Jumelage" viewId="orbit9 → jumelage → cahier" status="planifie" color="text-violet-600" sub="CarlOS génère le document structuré pour le fournisseur. Cahier pro = contrat pro. Qualité du cahier = qualité du résultat" />
            <NavItem icon={CheckCircle2} label="Validation Expert" viewId="orbit9 → jumelage → validation" status="planifie" color="text-emerald-600" sub="Expert humain valide le cahier avant envoi. Contrôle qualité final. Le réseau élite ne laisse rien passer de broche-à-foin" />
            <NavItem icon={Handshake} label="Match & Contrat" viewId="orbit9 → jumelage → match" status="planifie" color="text-green-600" sub="Rencontre organisée par CarlOS → Négociation assistée → Contrat réel signé. CarlOS reste médiateur pendant toute l'exécution" />
          </NavLevel>
          <div className="mt-2 p-2 bg-amber-50 rounded border border-dashed border-amber-200">
            <p className="text-[9px] text-amber-800 font-medium">
              FLOW ACTION: CarlOS détecte → Qualification kit → Cahier généré → Expert valide → Match → Contrat signé → CarlOS médie l'exécution.
              Chaque étape visible dans le pipeline. Le fournisseur invité gratuitement entre par ici.
            </p>
          </div>

          {/* ——— TAB 4: PIONNIERS ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 4</span>
              <span className="text-xs font-bold text-gray-800">Pionniers</span>
              <span className="text-[9px] text-gray-400">— Mouvement AI + Franchise Intelligente</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Crown} label="Mouvement Pionniers AI" viewId="orbit9 → pionniers → mouvement" status="planifie" color="text-violet-600" sub="Leaders de l'automatisation du Québec qui prennent le virage AI avec CarlOS. Même les intégrateurs ont besoin du virage" />
            <NavItem icon={Rocket} label="Franchise Intelligente" viewId="orbit9 → pionniers → franchise" status="planifie" color="text-orange-600" sub="Modèle: intégrateur rejoint → reçoit CarlOS pour SES clients → ses clients embarquent → réseau grossit de l'intérieur. Scale sans vendre direct" />
            <NavItem icon={Users} label="Programme Partenaires" viewId="orbit9 → pionniers → partenaires" status="planifie" color="text-sky-600" sub="Onboarding partenaires-intégrateurs: formation CarlOS, certification, outils de vente, territoire, revenus partagés" />
            <NavItem icon={TrendingUp} label="Tableau Pionniers" viewId="orbit9 → pionniers → tableau" status="planifie" color="text-emerald-600" sub="Classement des pionniers actifs, contributions au réseau, cellules créées, valeur générée. Reconnaissance publique" />
          </NavLevel>

          {/* ——— TAB 5: GOUVERNANCE ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 5</span>
              <span className="text-xs font-bold text-gray-800">Gouvernance</span>
              <span className="text-[9px] text-gray-400">— Règles du réseau élite</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Scale} label="Charte du Réseau" viewId="orbit9 → gouvernance → charte" status="planifie" color="text-slate-700" sub="Engagement qualité, respect des délais, confidentialité, résolution conflits. Signée à l'admission" />
            <NavItem icon={Shield} label="Standards Qualité" viewId="orbit9 → gouvernance → standards" status="planifie" color="text-emerald-600" sub="Seuils minimaux: certifications, assurances, historique, comportement réseau. Réévaluation annuelle" />
            <NavItem icon={AlertTriangle} label="Litiges & Sanctions" viewId="orbit9 → gouvernance → litiges" status="planifie" color="text-red-500" sub="Processus résolution: CarlOS médiation → Comité → Avertissement → Suspension → Exclusion. Tolérance zéro comportement toxique" />
          </NavLevel>

          {/* ——— TAB 6: DASHBOARD ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 6</span>
              <span className="text-xs font-bold text-gray-800">Dashboard Réseau</span>
              <span className="text-[9px] text-gray-400">— ROI, heures sauvées, santé cellules</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={BarChart3} label="Métriques Réseau" viewId="orbit9 → dashboard → metriques" status="planifie" color="text-blue-600" sub="Membres actifs, cellules formées, chantiers en cours, valeur totale générée, contrats signés ce mois" />
            <NavItem icon={Gauge} label="ROI & Temps Sauvé" viewId="orbit9 → dashboard → roi" status="planifie" color="text-emerald-600" sub="Heures sauvées par CarlOS (médiations, interventions proactives), coûts évités (retards interceptés), valeur des contrats facilités" />
            <NavItem icon={Activity} label="Santé des Cellules" viewId="orbit9 → dashboard → sante" status="planifie" color="text-orange-500" sub="Score santé par cellule: communication, livrables, tensions, satisfaction. Triangle du Feu appliqué aux collaborations" />
          </NavLevel>

          {/* ——— TAB 7: INDUSTRIE ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 7</span>
              <span className="text-xs font-bold text-gray-800">Industrie</span>
              <span className="text-[9px] text-gray-400">— Nouvelles + Événements + Veille (3-en-1)</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Newspaper} label="Nouvelles" viewId="orbit9 → industrie → nouvelles" status="live" color="text-blue-500" sub="Fil d'actualité sectoriel automatisation, robotique, IA industrielle" />
            <NavItem icon={Calendar} label="Événements" viewId="orbit9 → industrie → evenements" status="live" color="text-rose-500" sub="Calendrier industrie: salons, formations, webinaires, meetups REAI" />
            <NavItem icon={Globe} label="Veille Industrie" viewId="orbit9 → industrie → veille" status="live" color="text-indigo-500" sub="Vue macro: tendances sectorielles, subventions disponibles, réglementations, signaux marché" />
          </NavLevel>

          {/* ——— NOTE ARCHITECTURALE ——— */}
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-dashed border-orange-200">
            <p className="text-[9px] text-orange-700 font-medium leading-relaxed">
              ARCHITECTURE: Même frame que Blueprint (RD.7) — Cellule → Chantiers → Projets → Missions → Tâches (drill-down imbriqué).
              CarlOS = médiateur proactif dans CHAQUE interaction entre membres (meetings live, détection tensions, action items auto).
              Processus de sélection rigoureux inspiré REAI — réseau élite, pas n'importe qui entre.
              Stratégie acquisition: invitation gratuite fournisseur → qualification AI → découvre CarlOS → devient client → invite SES fournisseurs → flywheel.
              Widget Opportunités aussi sur Tour de Contrôle pour ne rien rater.
              Modélisé en détail dans RD.8 Blueprint Réseau.
            </p>
          </div>
        </Card>

        {/* === 2.6 Master GHML === */}
        <Card className="p-4 mb-4 bg-purple-50/30 border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-sm font-semibold text-purple-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.6</span>Master GHML — 32 Sous-sections</span>
            <Badge className="text-[9px] bg-purple-100 text-purple-700 border-purple-200">SectionMasterGHML.tsx</Badge>
          </div>
          <NavLevel>
            <NavItem icon={BookOpen} label="Bible Visuelle" viewId="bible-visuelle" status="live" color="text-indigo-500" />
            <NavItem icon={Server} label="Bible Technique" viewId="bible-technique" status="live" color="text-emerald-500" />
            <NavItem icon={Atom} label="Bible GHML" viewId="bible-ghml" status="live" color="text-violet-500" />
            <NavItem icon={Map} label="Roadmap & Décisions" viewId="master-roadmap" status="live" color="text-amber-500" />
            <NavItem icon={Rocket} label="Stratégie & Lancement" viewId="master-strategie" status="live" color="text-red-500" />
            <NavItem icon={Network} label="Orbit9 & Réseau" viewId="master-orbit9" status="live" color="text-orange-500" />
            <NavItem icon={Radio} label="Stack Communication" viewId="master-communication" status="live" color="text-teal-500" />
            <NavItem icon={AlertTriangle} label="Dette Technique" viewId="master-dette" status="live" color="text-rose-500" />
            <NavItem icon={Shield} label="Routine & Flow" viewId="master-routine" status="live" color="text-cyan-500" />
            <NavItem icon={Gem} label="Mine d'Or & Data" viewId="master-minedor" status="live" color="text-yellow-500" />
            <NavItem icon={GraduationCap} label="Entraînement Agents" viewId="master-training" status="live" color="text-purple-500" />
            <NavItem icon={Users} label="Profils & Démos" viewId="master-profils" status="live" color="text-sky-500" />
            <NavItem icon={Route} label="Parcours Client" viewId="master-parcours" status="live" color="text-pink-500" />
            <NavItem icon={Gauge} label="Capacités & ROI" viewId="master-capacites" status="live" color="text-blue-600" />
            <NavItem icon={Map} label="Structure Navigation" viewId="master-navigation" status="live" color="text-slate-600" sub="Cette page (méta-navigation)" />
          </NavLevel>
        </Card>

        {/* === 2.8 Réglages — DÉPLACÉ vers Top Bar droite === */}
        <Card className="p-4 bg-gray-50/50 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-gray-600 shrink-0" />
            <span className="text-sm font-semibold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.7</span>Réglages</span>
            <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200">DÉPLACÉ → Top Bar droite</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">Les réglages sont maintenant accessibles via l'icône utilisateur dans la Top Bar (zone droite).</p>
          <NavLevel>
            <NavItem icon={User} label="Mon Profil" status="planifie" color="text-gray-500" sub="Informations personnelles, photo, préférences" />
            <NavItem icon={Settings} label="Réglages Généraux" status="planifie" color="text-gray-500" sub="Paramètres de l'instance, notifications" />
            <NavItem icon={Settings} label="Réglages Agents AI" viewId="agent-settings" status="live" color="text-violet-500" sub="Configuration voix, modèles, comportement (ex-sidebar)" />
            <NavItem icon={HelpCircle} label="FAQ CarlOS" status="planifie" color="text-blue-500" sub="CarlOS répond aux questions — guide contextuel" />
          </NavLevel>
          <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-dashed border-blue-200">
            <p className="text-[9px] text-blue-700 font-medium">
              SPRINT DÉDIÉ: Détailler le contenu exact des réglages (standards).
              Ne pas réinventer la roue — éléments de base classiques.
              Retirer le bouton "Mes Réglages" fixe en bas de la sidebar gauche.
            </p>
          </div>
        </Card>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Routes Core (hors sidebar) */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-4 w-4 text-emerald-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.3</span>Routes Core (canvas principal)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Routes accessibles par clic direct (dashboard blocks, boutons) — pas dans la sidebar.
        </p>
        <NavLevel>
          <NavItem icon={Layout} label="Dashboard" viewId="dashboard" status="live" color="text-blue-500" sub="Page d'accueil — 10 blocs KPI cliquables → navigation directe" />
          <NavItem icon={Eye} label="Cockpit" viewId="cockpit" status="live" color="text-violet-500" sub="Vue opérationnelle 360° — tous les bots en un coup d'oeil" />
          <NavItem icon={Activity} label="Santé" viewId="health" status="live" color="text-emerald-500" sub="Métriques système, uptime, API stats" />
          <NavItem icon={MessageSquare} label="LiveChat" viewId="live-chat" status="live" color="text-indigo-500" sub="Chat centré (aussi dans sidebar droite) — branches, perspectives, sentinelle" />
          <NavItem icon={FileText} label="Cahier Smart" viewId="cahier" status="live" color="text-amber-500" sub="Cahier de projet interactif — données entreprise réelles" />
          <NavItem icon={GitBranch} label="Branch Patterns" viewId="branches" status="live" color="text-pink-500" sub="Démo des patterns de branches conversationnelles" />
          <NavItem icon={Rocket} label="Scénarios" viewId="scenarios" status="live" color="text-red-500" sub="Hub de scénarios de démonstration" />
          <NavItem icon={Monitor} label="Smart Canvas" viewId="canvas" status="live" color="text-teal-500" sub="Canvas interactif — push_content depuis vocal/chat" />
        </NavLevel>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Dashboard → Action Map */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="h-4 w-4 text-blue-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.4</span>Dashboard — Carte d'Actions</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chaque bloc du Dashboard est cliquable et mène à une vue spécifique.
        </p>

        <div className="space-y-2">
          {[
            { bloc: "Bloc CEO (Direction)", target: "department → BCO", icon: Briefcase, color: "text-blue-500" },
            { bloc: "Bloc CFO (Finance)", target: "department → BCF", icon: DollarSign, color: "text-emerald-500" },
            { bloc: "Bloc CTO (Technologie)", target: "department → BCT", icon: Cpu, color: "text-violet-500" },
            { bloc: "Bloc CMO (Marketing)", target: "department → BCM", icon: Megaphone, color: "text-pink-500" },
            { bloc: "Bloc CSO (Stratégie)", target: "department → BCS", icon: Target, color: "text-red-500" },
            { bloc: "Mes Priorités", target: "mes-chantiers → chantiers", icon: Flame, color: "text-orange-500" },
            { bloc: "Pipeline Vente", target: "mes-chantiers → missions", icon: TrendingUp, color: "text-green-500" },
            { bloc: "Mes Projets", target: "mes-chantiers → projets", icon: FolderKanban, color: "text-indigo-500" },
            { bloc: "Mon Réseau", target: "orbit9-detail → marketplace", icon: Network, color: "text-amber-500" },
            { bloc: "Mon Blue Print", target: "blueprint → live", icon: Activity, color: "text-cyan-500" },
          ].map((a) => (
            <div key={a.bloc} className="flex items-center gap-3 py-1.5">
              <a.icon className={cn("h-4 w-4 shrink-0", a.color)} />
              <span className="text-sm text-gray-800 w-40">{a.bloc}</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
              <code className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded">{a.target}</code>
            </div>
          ))}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Context State Variables */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-violet-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.5</span>FrameMasterContext — State Variables</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Toute la navigation est pilotée par React Context (pas d'URL routing). Fichier source :
          <code className="text-xs bg-gray-100 px-1 rounded ml-1">FrameMasterContext.tsx</code>
        </p>

        <div className="space-y-2">
          {CONTEXT_VARS.map((v) => (
            <div key={v.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <code className="text-xs font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded shrink-0 mt-0.5">{v.name}</code>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-mono">{v.type}</span>
                  <Badge className="text-[9px] bg-gray-100 text-gray-500 border-gray-200">{v.scope}</Badge>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ============================================================ */}
      {/* SECTION 6 — Navigation Methods */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight className="h-4 w-4 text-teal-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.6</span>Méthodes de Navigation</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          10 méthodes exposées par FrameMasterContext pour naviguer entre les vues.
        </p>

        <div className="space-y-2">
          {NAV_METHODS.map((m) => (
            <div key={m.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <div className="shrink-0 mt-0.5">
                <code className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{m.name}</code>
              </div>
              <div className="flex-1 min-w-0">
                <code className="text-[9px] text-gray-400 font-mono">{m.signature}</code>
                <p className="text-xs text-gray-600 mt-0.5">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 7 — Bot Identity Colors */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4 text-pink-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.7</span>Identité Visuelle — 12 Bots</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chaque bot a une couleur unique utilisée pour la bande du canvas, la sidebar, et les gradient headers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BOT_COLORS.map((b) => (
            <div key={b.code} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100">
              <div className={cn("w-6 h-6 rounded-md", b.band)} />
              <div>
                <code className="text-xs font-mono font-semibold text-gray-700">{b.code}</code>
                <div className="text-[9px] text-gray-500">{b.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 8 — Couches d'Instances */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-indigo-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8</span>Couches d'Instances (Multi-Tenant)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Architecture prévue pour supporter N instances (1 par entreprise/CEO).
          Actuellement: instance unique "Usine Bleue".
        </p>

        <div className="space-y-3">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm font-semibold text-blue-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.1</span>Couche 1 — Instance Entreprise</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 1 instance = 1 entreprise = 1 CEO</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Kit entreprise chargé au login (usine-bleue.json)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 12 départements + data KPI par instance</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> SOULs personnalisées par instance (14 fichiers)</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500">
            <div className="text-sm font-semibold text-emerald-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.2</span>Couche 2 — Réseau Orbit9</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Cross-instance: Marketplace, Cellules, Jumelage</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> orbit9_members + orbit9_cellules + orbit9_matches (PostgreSQL)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Matching scoring Gemini Flash + trisociation LiveKit</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-violet-500">
            <div className="text-sm font-semibold text-violet-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.3</span>Couche 3 — Plateforme GhostX</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Templates partagés (141 templates, 12 départements)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> GHML Engine commun (tableau périodique, protocoles)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Routage IA 5-tiers partagé entre instances</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="text-sm font-semibold text-amber-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.4</span>Couche 4 — Industrie (TRG)</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-amber-500" /> Nouvelles sectorielles partagées</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-amber-500" /> Événements industrie (calendrier commun)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-amber-500" /> Dashboard industrie agrégé</div>
            </div>
          </Card>
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 9 — Flow Diagram */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-4 w-4 text-lime-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.9</span>Arborescence Complète</h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 overflow-x-auto whitespace-pre leading-relaxed">
{`TOP BAR — BARRE SUPÉRIEURE (fixe, pleine largeur)
│
├─ [GAUCHE]  Logo instance client → click = Tour de Contrôle
├─ [CENTRE]  Niveau Entreprise CEO + CarlOS
│  ├─ Tour de Contrôle    → dashboard
│  ├─ Cockpit             → cockpit
│  ├─ Blueprint           → blueprint
│  └─ Santé Globale       → health
└─ [DROITE]  Instance + Utilisateur
   ├─ Nom instance (ex: "Couche-Tard")
   └─ Icône utilisateur → menu:
      ├─ Mon Profil, Réglages Généraux, Réglages Agents AI
      ├─ FAQ (CarlOS répond), Abonnement, Déconnexion
      └─ (Sprint dédié — éléments standards)

PATTERN: Sidebar click → Canvas centre avec TABS (gauche → droite)
Exception: Mon Équipe AI → tabs dans la vue agent, pas dans sidebar

SIDEBAR GAUCHE — 6 SECTIONS
│
├─ [1] MON ENTREPRISE (CEO + CarlOS = le OS)
│  ├─ tabs centre: Direction | TdC | Cockpit | Blueprint | Santé
│  ├─ Direction (CarlOS)  → department → BCO (le OS au sommet)
│  ├─ Tour de Contrôle    → dashboard (10 blocs KPI)
│  ├─ Cockpit             → cockpit (360° tous bots)
│  ├─ Blueprint           → blueprint / playbook-usine-bleue
│  │  └─ 8 tabs: Vue d'ensemble | Timeline | Chantiers | Projets | Missions | Tâches | Opportunités | Équipes
│  └─ Santé Globale       → health
│
├─ [2] MON BUREAU (workspace perso)
│  ├─ tabs centre: Idées | Documents | Outils | Tâches | Agenda
│  ├─ Idées               → espace-bureau → idees
│  ├─ Documents            → espace-bureau → documents (PostgreSQL)
│  ├─ Outils              → espace-bureau → outils
│  ├─ Tâches              → espace-bureau → taches
│  │  ├─ Mes Tâches       (Plane.so perso)
│  │  └─ Tâches Projet    (Blueprint filtrées — Option C)
│  └─ Agenda              → espace-bureau → agenda
│
├─ [3] MES SALLES (ex-Rooms, D-109)
│  ├─ tabs centre: Board Room | War Room | Think Room
│  ├─ Board Room          → board-room (CA robotique)
│  ├─ War Room            → war-room (gestion de crise)
│  └─ Think Room          → think-room (brainstorm)
│
├─ [4] MON ÉQUIPE AI (11 agents — EXCEPTION: tabs dans vue agent)
│  ├─ sidebar = liste 11 agents AI (click → vue agent)
│  ├─ Finance (BCF)       → department + 4 tabs agent
│  ├─ Technologie (BCT)   → department + 4 tabs agent
│  ├─ Production (BFA)    → department + 4 tabs agent
│  ├─ Opérations (BOO)    → department + 4 tabs agent
│  ├─ Ventes (BRO)        → department + 4 tabs agent
│  ├─ Marketing (BCM)     → department + 4 tabs agent
│  ├─ Stratégie (BCS)     → department + 4 tabs agent
│  ├─ RH (BHR)            → department + 4 tabs agent
│  ├─ Sécurité (BSE)      → department + 4 tabs agent
│  ├─ Légal (BLE)         → department + 4 tabs agent
│  └─ Innovation (BIO)    → department + 4 tabs agent
│     └─ 4 tabs par agent: Vue d'ensemble | Pipeline | Documents | Diagnostics
│
├─ [5] MON RÉSEAU — Centre Nerveux Orbit9 (réseau élite augmenté AI)
│  ├─ 7 tabs: Profil | Cellules | Jumelage | Pionniers | Gouvernance | Dashboard | Industrie
│  ├─ [T1] Mon Profil     → CV entreprise vérifié, certifications, sceaux, réputation, visibilité
│  │  └─ Processus sélection rigoureux (inspiré REAI): qualification AI auto + critères admission élite
│  ├─ [T2] Mes Cellules   → drill-down Cellule → Chantiers → Projets → Missions + Opportunités + Meetings live + Performance
│  │  └─ CarlOS = médiateur proactif: transcription, détection tensions, interventions temps réel
│  ├─ [T3] Jumelage       → ACTION: Détection CarlOS → Upload kit → Cahier généré → Expert valide → Match → Contrat signé
│  ├─ [T4] Pionniers      → Mouvement AI Québec, franchise intelligente, programme partenaires-intégrateurs, tableau pionniers
│  ├─ [T5] Gouvernance    → Charte réseau, standards qualité, litiges & sanctions
│  ├─ [T6] Dashboard      → ROI, heures sauvées (CarlOS médiations), santé cellules, valeur contrats
│  └─ [T7] Industrie      → Nouvelles + Événements + Veille (3-en-1)
│
└─ [6] MASTER GHML (dev — 32 sous-sections)
   └─ FE (8) + BE (10) + RD (8) + SA (8)

ROUTES CANVAS ADDITIONNELLES (hors sidebar):
├─ live-chat    → LiveChat (centré ou sidebar droite)
├─ cahier       → CahierSmartDemo
├─ branches     → BranchPatternsDemo
├─ scenarios    → ScenarioHub
└─ canvas       → SmartCanvas`}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 10 — Fichiers Source */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-gray-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.10</span>Fichiers Source Clés</h2>
        </div>

        <div className="space-y-2">
          {[
            { file: "FrameMasterContext.tsx", desc: "State global — ActiveView, navigation methods, 12 variables", lines: "~200" },
            { file: "CenterZone.tsx", desc: "Router central — 48 routes conditionnelles", lines: "~350" },
            { file: "SidebarLeft.tsx", desc: "Sidebar gauche — 7 sections collapsibles", lines: "~100" },
            { file: "TopBar.tsx", desc: "Top Bar — Logo + Nav CEO + Instance/User (À CRÉER)", lines: "~80" },
            { file: "SectionEspaceBureau.tsx", desc: "Mon Espace → à renommer Mon Entreprise + Mon Bureau", lines: "~120" },
            { file: "SectionRooms.tsx", desc: "Mes Rooms — Board/War/Think", lines: "~60" },
            { file: "SectionEntreprise.tsx", desc: "Mon Équipe — 12 départements + Blueprint", lines: "~80" },
            { file: "SectionOrbit9.tsx", desc: "Mon Réseau — 5 sections Orbit9", lines: "~60" },
            { file: "SectionTrgIndustries.tsx", desc: "Mon Industrie — 3 sections TRG", lines: "~50" },
            { file: "SectionMasterGHML.tsx", desc: "Master GHML — 18 sous-sections", lines: "~130" },
          ].map((f) => (
            <div key={f.file} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded shrink-0">{f.file}</code>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">{f.desc}</p>
              </div>
              <span className="text-[9px] text-gray-400 shrink-0">{f.lines} lignes</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Sidebar & Console patterns visuels */}
      <SectionTitle num="1.2" title="Patterns Visuels — Sidebar & Console" />
      <Tab16MenuGauche />
      <Tab17ConsoleDroite />
    </div>
  );
}

function CombinedTab2Identite() {
  return (
    <div className="space-y-6">
      <Tab1Identite />
      <Tab12Couleurs />
    </div>
  );
}

function TabPrimitives() {
  return (
    <div className="space-y-6">
      <SectionTitle num="3" title="Primitives — Composants de base reutilisables" />
      <div className="text-xs text-gray-600 leading-relaxed">Les composants fondamentaux qui construisent TOUTE l'interface. Chaque primitive est paramétrable et utilisée dans plusieurs sections.</div>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Structure universelle</span></div>
      <div className="text-xs text-gray-500 mb-2">Composants fondamentaux utilises dans toute l'application.</div>

      {/* 2.1 — Frame Master (global 3 panels) */}
      <PatternCard title="2.1 Frame Master — Shell 3 panneaux" where="TOUTE l'app (FrameMaster.tsx)">
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-white border-b px-3 py-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1.5"><PanelLeft className="h-3.5 w-3.5 text-gray-400" /><div className="w-16 h-2 rounded bg-gray-200" /></div>
            <div className="flex-1 text-center"><div className="w-20 h-2 rounded bg-gray-300 mx-auto" /></div>
            <div className="flex items-center gap-1.5"><div className="w-16 h-2 rounded bg-gray-200" /><PanelRight className="h-3.5 w-3.5 text-gray-400" /></div>
          </div>
          <div className="flex h-32">
            <div className="w-[18%] border-r bg-white p-1.5 space-y-1">
              <div className="text-[8px] font-bold text-gray-400 uppercase">Sidebar</div>
              {[1,2,3,4,5].map(i => <div key={i} className={cn("h-2 rounded", i===1 ? "bg-blue-200 w-full" : "bg-gray-100 w-4/5")} />)}
              <div className="h-px bg-gray-100 my-1" />
              {[1,2,3].map(i => <div key={i} className="h-2 rounded bg-gray-100 w-3/4" />)}
            </div>
            <div className="flex-1 bg-gray-50 p-2 flex flex-col">
              <div className="text-[8px] font-bold text-gray-400 uppercase mb-1">Centre</div>
              <div className="flex-1 bg-white rounded border border-gray-100 p-1.5">
                <div className="h-2 bg-gray-200 rounded w-1/2 mb-1" />
                <div className="grid grid-cols-3 gap-1 flex-1">{[1,2,3].map(i => <div key={i} className="bg-gray-100 rounded h-6" />)}</div>
              </div>
            </div>
            <div className="w-[20%] border-l bg-white p-1.5 space-y-1">
              <div className="text-[8px] font-bold text-gray-400 uppercase">Droite</div>
              <div className="h-4 rounded bg-blue-50 border border-blue-100" />
              <div className="h-3.5 rounded bg-gray-100" />
              <div className="h-px bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 mx-1" />
              <div className="h-6 rounded bg-gray-50 border" />
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Gauche:</strong> 16% default, 4-25%, collapsible</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Centre:</strong> 60% default, min 35%</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Droite:</strong> ~20%, Pulse + Input + Discussions</div>
        </div>
      </PatternCard>

      {/* 3.1 — PageHeader standard */}
      <PatternCard title="2.13 PageHeader — composant reutilisable" where="PageHeader.tsx → Bureau, Blueprint, Orbit9, Rooms, Master GHML (24 pages)">
        <div className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
          </button>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-1.5 rounded-lg">
            <Eye className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Titre Page</div>
            <div className="text-[9px] text-gray-400">Sous-titre descriptif</div>
          </div>
          <div className="ml-auto flex gap-1">
            <span className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg">Tab 1</span>
            <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Tab 2</span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Back:</strong> ArrowLeft h-4 w-4</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Icon:</strong> h-4 w-4 + couleur variable</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Title:</strong> text-sm font-bold</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>rightSlot:</strong> tabs ou actions</div>
        </div>
      </PatternCard>

      {/* 2.9 — Espacement pages standard (ex-12.7) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Espacement pages 3 variantes</div>
        <div className="space-y-3">
          <div>
            <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Standard PageLayout (la bonne)</div>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-10 py-5">
                <div className="max-w-4xl mx-auto bg-white rounded-lg p-3 border text-xs text-gray-500">Marges larges uniformes</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] font-bold text-red-500 uppercase mb-1">Trop serre (legacy)</div>
              <div className="border rounded-lg overflow-hidden border-red-200">
                <div className="bg-gray-50 p-4">
                  <div className="bg-white rounded-lg p-3 border text-xs text-gray-500">Colle aux bords</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-red-500 uppercase mb-1">Marges moyennes (legacy)</div>
              <div className="border rounded-lg overflow-hidden border-red-200">
                <div className="bg-gray-50 px-6 py-4">
                  <div className="bg-white rounded-lg p-3 border text-xs text-gray-500">Marges moyennes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> TOUT par PageLayout, eliminer les marges manuelles.</div>
      </Card>

      {/* 2.10 — Grilles 4 formats (ex-12.8) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Grilles 4 formats</div>
        <div className="space-y-3">
          {[
            { label: "4 colonnes — KPI", cols: "grid-cols-4", color: "blue", items: ["Revenus", "Clients", "Pipeline", "Marge"] },
            { label: "5 colonnes — TRG", cols: "grid-cols-5", color: "violet", items: ["Direction", "Tech", "Finance", "Marketing", "Ventes"] },
            { label: "3 colonnes — Comparaisons", cols: "grid-cols-3", color: "emerald", items: ["Option A", "Option B", "Option C"] },
            { label: "2 colonnes — Listes", cols: "grid-cols-2", color: "amber", items: ["Element 1", "Element 2"] },
          ].map((g) => (
            <div key={g.label}>
              <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">{g.label}</div>
              <div className={cn("grid gap-3", g.cols)}>
                {g.items.map((item) => (
                  <div key={item} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center text-[9px] text-gray-700 font-medium">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> OK tel quel, chaque format est justifie.</div>
      </Card>

      <Tab7Typo />
      <Tab8Boutons />
      <Tab9Badges />
      <Tab11Indicateurs />
    </div>
  );
}

function TabMonEntreprise() {
  return (
    <div className="space-y-4">
      <SectionTitle num="4" title="Mon Entreprise — 12 Departements, Dashboard, Sante" />
      <div className="text-xs text-gray-600 leading-relaxed">Composants visuels du Tour de Controle, Cockpit, 12 departements et sante de l'entreprise.
      Sources: DepartmentTourDeControle.tsx, DepartmentView.tsx, DepartmentDetailView.tsx, HealthView.tsx, CockpitView.tsx</div>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dashboard & Cockpit</span></div>
      <div className="text-xs text-gray-500 mb-2">Tour de controle, KPI, blocs departements, cockpit bots.</div>

      {/* 2.2 — Grille 5xl */}
      <PatternCard title="4.1 GRILLE — maxWidth 5xl" where="Dashboard, TRG, Cockpit, Sante, Reglages">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-white border-b px-3 py-1.5 flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-blue-100" /><div className="h-2 bg-gray-200 rounded w-32" /></div>
          <div className="p-3 max-w-xs mx-auto">
            <div className="grid grid-cols-4 gap-1.5">
              {BOTS_12.slice(0, 8).map((b) => (
                <div key={b.code} className="rounded overflow-hidden border">
                  <div className={`h-2 bg-gradient-to-r from-${b.color}-600 to-${b.color}-500`} />
                  <div className="p-1 bg-white space-y-0.5"><div className="h-1.5 bg-gray-100 rounded w-full" /><div className="h-1 bg-gray-50 rounded w-3/4" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">max-w-5xl — Grilles 4-5 colonnes de KPI cards avec gradient headers</div>
      </PatternCard>

      {/* 3.5 — BlockHeader Dashboard */}
      <PatternCard title="4.2 BlockHeader — gradient dans les cards (margins negatives)" where="DashboardView.tsx — 12 blocs C-Level">
        <div className="space-y-2">
          <Card className="p-4 overflow-hidden">
            <div className="flex items-center gap-2.5 -mx-4 -mt-4 mb-3 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white flex-1">CarlOS — CEO</span>
              <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">5</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
            </div>
          </Card>
          <div className="flex gap-2">
            {[
              { label: "CEO", color: "from-blue-600 to-blue-500" },
              { label: "CFO", color: "from-emerald-600 to-emerald-500" },
              { label: "CTO", color: "from-violet-600 to-violet-500" },
              { label: "CMO", color: "from-pink-600 to-pink-500" },
              { label: "CSO", color: "from-red-600 to-red-500" },
              { label: "COO", color: "from-orange-600 to-orange-500" },
            ].map((b) => (
              <div key={b.label} className={cn("flex-1 h-5 rounded bg-gradient-to-r", b.color)}>
                <span className="text-[7px] text-white/80 font-bold px-1.5 leading-5">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <CodeBlock code={`-mx-4 -mt-4 mb-3 px-4 py-2.5 bg-gradient-to-r\nw-7 h-7 bg-white/20 rounded-lg\ntext-xs font-bold uppercase tracking-wider text-white\nbg-white/25 text-white px-2 py-0.5 rounded-full`} />
      </PatternCard>

      {/* 3.9 — KPI Card Header (Health) */}
      <PatternCard title="4.3 KPI Card Header — gradient + trend indicator" where="HealthView.tsx, CockpitView.tsx">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Score VITAA", value: "78", gradient: "from-blue-600 to-blue-500", trend: "up" },
            { label: "Chantiers actifs", value: "6.DB", gradient: "from-emerald-600 to-emerald-500", trend: "up" },
            { label: "Risques detectes", value: "2.H", gradient: "from-red-600 to-red-500", trend: "down" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r", kpi.gradient)}>
                <Gauge className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white flex-1">{kpi.label}</span>
                <TrendingUp className={cn("h-3.5 w-3.5", kpi.trend === "up" ? "text-green-300" : "text-red-300 rotate-180")} />
              </div>
              <div className="px-3 py-2">
                <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient header compact (py-2) + icone trend en haut a droite (vert = hausse, rouge = baisse). Valeur large en dessous.
        </div>
      </PatternCard>

      <PatternCard title="4.4 KPI Card standard (Cockpit)" where="Cockpit, Dashboard, Departments">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: BarChart3, label: "Revenus", value: "2.4M$", color: "emerald" },
            { icon: TrendingUp, label: "Croissance", value: "+18%", color: "blue" },
            { icon: Users, label: "Clients", value: "142", color: "violet" },
            { icon: Target, label: "Pipeline", value: "890K$", color: "amber" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-${kpi.color}-600 to-${kpi.color}-500`}>
                <kpi.icon className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{kpi.label}</span>
              </div>
              <div className="px-3 py-2">
                <div className={`text-2xl font-bold text-${kpi.color}-600`}>{kpi.value}</div>
                <div className="text-[9px] text-gray-500">vs trimestre precedent</div>
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="4.5 Card departement 5 colonnes (TRG)" where="DashboardView Tour de Controle">
        <div className="grid grid-cols-5 gap-3">
          {BOTS_12.slice(0, 5).map((d) => (
            <Card key={d.code} className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-r from-${d.color}-600 to-${d.color}-500 px-3 py-2 flex items-center gap-2`}>
                <d.icon className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white truncate">{d.dept.split(" ")[0]}</span>
              </div>
              <div className="p-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-${d.color}-500 rounded-full`} style={{ width: "65%" }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="4.6 Card Cockpit bot (4 colonnes compactes)" where="CockpitView">
        <div className="grid grid-cols-4 gap-2">
          {BOTS_12.slice(0, 4).map((b) => (
            <Card key={b.code} className="p-0 overflow-hidden">
              <div className={`bg-gradient-to-r from-${b.color}-600 to-${b.color}-500 px-2 py-1.5 flex items-center gap-1.5`}>
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[9px] font-bold text-white">{b.nom}</span>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-[9px] text-gray-500">Score: 85/100</div>
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Departements (12)</span></div>
      <div className="text-xs text-gray-500 mb-2">Tour de controle departement — gradient headers, diagnostics, sub-tabs.</div>

      {/* 2.7 — Department Detail */}
      <PatternCard title="4.7 DEPARTEMENT — Gradient header + 4 tabs" where="DepartmentTourDeControle (12 depts)">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-white/20" />
            <div className="flex-1"><div className="h-2 bg-white/80 rounded w-24" /><div className="h-1.5 bg-white/40 rounded w-16 mt-0.5" /></div>
            <div className="flex gap-0.5">
              {["Vue","Pipeline","Docs","Diag"].map(t => <span key={t} className={cn("px-1.5 py-0.5 text-[8px] rounded", t==="Vue" ? "bg-white/20 text-white" : "text-white/50")}>{t}</span>)}
            </div>
          </div>
          <div className="p-3 max-w-[200px] mx-auto grid grid-cols-2 gap-1.5">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded border p-1.5"><div className="h-1 bg-gray-200 rounded w-10 mb-0.5" /><div className="h-1 bg-gray-100 rounded w-full" /></div>)}
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">Avatar + gradient + 4 sub-tabs dans le header</div>
      </PatternCard>

      {/* 3.4 — Gradient Header Departement — 12 bots officiels */}
      <PatternCard title="4.8 Gradient Header Departement — 12 bots, 12 couleurs" where="DepartmentTourDeControle — 12 departements">
        <div className="space-y-2">
          {[
            { code: "BCO", nom: "CarlOS",    role: "CEO",  dept: "Direction Generale",      from: "from-blue-600",    to: "to-blue-500" },
            { code: "BCT", nom: "Thierry",   role: "CTO",  dept: "Technologie & Innovation", from: "from-violet-600",  to: "to-violet-500" },
            { code: "BCF", nom: "François",  role: "CFO",  dept: "Finance & Tresorerie",    from: "from-emerald-600", to: "to-emerald-500" },
            { code: "BCM", nom: "Martine",   role: "CMO",  dept: "Marketing & Croissance",  from: "from-pink-600",    to: "to-pink-500" },
            { code: "BCS", nom: "Sophie",    role: "CSO",  dept: "Strategie & Ventes",      from: "from-red-600",     to: "to-red-500" },
            { code: "BOO", nom: "Olivier",   role: "COO",  dept: "Operations & Production", from: "from-orange-600",  to: "to-orange-500" },
            { code: "BFA", nom: "Fabien",    role: "Usine", dept: "Automatisation & Usine",  from: "from-slate-600",   to: "to-slate-500" },
            { code: "BHR", nom: "Helene",    role: "CHRO", dept: "Ressources Humaines",     from: "from-teal-600",    to: "to-teal-500" },
            { code: "BIO", nom: "Ines",      role: "CINO", dept: "Innovation & R&D",        from: "from-cyan-600",    to: "to-cyan-500" },
            { code: "BRO", nom: "Raphael",   role: "CRO",  dept: "Revenus & Croissance",    from: "from-amber-600",   to: "to-amber-500" },
            { code: "BLE", nom: "Louise",    role: "CLO",  dept: "Juridique & Conformite",  from: "from-indigo-600",  to: "to-indigo-500" },
            { code: "BSE", nom: "Sebastien", role: "CISO", dept: "Securite & Cyber",        from: "from-zinc-600",    to: "to-zinc-500" },
          ].map((bot) => (
            <div key={bot.code} className={cn("bg-gradient-to-r px-4 py-3 rounded-xl flex items-center gap-3", bot.from, bot.to)}>
              <img src={BOT_AVATAR[bot.code] || ""} alt={bot.code} className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/30" />
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{bot.dept}</div>
                <div className="text-[9px] text-white/60">{bot.nom} — {bot.role}</div>
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Vue d'ensemble</span>
                <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Pipeline</span>
                <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Documents</span>
                <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Diagnostics</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient couleur unique par bot + avatar arrondi-lg + 4 sub-tabs (actif = bg-white/20, inactif = text-white/60). Pattern identique pour les 12 departements.
        </div>
      </PatternCard>

      {/* 3.10 — Diagnostic Card Header */}
      <PatternCard title="4.9 Diagnostic Card Header — gradient departement sans icone" where="DepartmentTourDeControle.tsx — onglet Diagnostics">
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Diagnostic Ventes Q2", color: "from-red-600 to-red-500", kpis: 8, duree: "15 min", questions: 12 },
            { title: "Audit Processus Prod.", color: "from-orange-600 to-orange-500", kpis: 5, duree: "20 min", questions: 18 },
          ].map((diag) => (
            <Card key={diag.title} className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
              <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center justify-between", diag.color)}>
                <p className="text-xs font-bold text-white truncate flex-1">{diag.title}</p>
                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0">{diag.kpis} KPIs</span>
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">{diag.duree}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">{diag.questions} questions</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-amber-50 rounded p-1.5"><strong>Difference vs Bloc:</strong> PAS d'icone dans le header — juste titre + badge KPIs</div>
          <div className="bg-amber-50 rounded p-1.5"><strong>Gradient:</strong> Herite de DEPT_HEADER_GRADIENT (couleur du bot/dept)</div>
        </div>
      </PatternCard>

      {/* 3.11 — Comparaison Bloc vs Diagnostic header */}
      <PatternCard title="4.10 Comparaison — Bloc header vs Diagnostic header" where="DepartmentTourDeControle.tsx">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1.5">Bloc (10 par dept) — AVEC icone</div>
            <Card className="p-3 overflow-hidden">
              <div className="flex items-center gap-2.5 -mx-3 -mt-3 mb-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Cpu className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white flex-1">Stack Technique</span>
                <span className="text-[9px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full">3</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1.5">Diagnostic — SANS icone</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2.5 flex items-center justify-between">
                <p className="text-[9px] font-bold text-white truncate flex-1">Audit Infrastructure Cloud</p>
                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">5 KPIs</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          </div>
        </div>
        <Card className="p-2 mt-2 border-amber-200 bg-amber-50/50">
          <div className="text-[9px] text-gray-700">
            <strong>Incoherence:</strong> Meme gradient, mais les Blocs ont une icone (w-7 h-7 bg-white/20 rounded-lg) et le titre en UPPERCASE. Les Diagnostics ont un titre normal sans icone. A standardiser.
          </div>
        </Card>
      </PatternCard>

      <PatternCard title="4.11 Sub-tabs dans gradient (fond fonce)" where="DepartmentTourDeControle (12 depts)">
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 rounded-lg flex gap-1 w-fit">
          <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Actif</span>
          <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
          <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
        </div>
      </PatternCard>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sante de l'entreprise</span></div>
      <div className="text-xs text-gray-500 mb-2">HealthView — KPI, diagnostics, headers pastels.</div>

      {/* 3.12 — REMPLACE par pattern 3.4 standard */}
      <PatternCard title="4.12 HealthView Header — NORMALISE vers pattern 3.4" where="HealthView.tsx — utiliser le meme pattern gradient que les 12 departements">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 rounded-xl flex items-center gap-3">
          <img src={BOT_AVATAR["BCO"] || ""} alt="BCO" className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/30" />
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Sante de l'Entreprise</div>
            <div className="text-[9px] text-white/60">CarlOS — CEO</div>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Etat General</span>
            <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Diagnostics</span>
            <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Departements</span>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Normalise vers le pattern 3.4 — meme gradient + avatar + sub-tabs. Remplace l'ancien header custom a 3 etats dynamiques.
        </div>
      </PatternCard>

      {/* 3.13 — HealthView Diagnostic Card (avec avatar bot + gradient) */}
      <PatternCard title="4.13 HealthView Diagnostic Card — avatar bot + gradient bleu" where="HealthView.tsx — onglet Diagnostics (LE header bleu que Carl a vu)">
        <div className="grid grid-cols-2 gap-3">
          {[
            { bot: "BCT", label: "Audit Infrastructure", dept: "Technologie", gradient: "from-blue-700 to-indigo-600", kpis: 5 },
            { bot: "BCF", label: "Sante Financiere", dept: "Finance", gradient: "from-emerald-600 to-teal-500", kpis: 8 },
          ].map((d) => (
            <Card key={d.label} className="p-0 overflow-hidden">
              <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", d.gradient)}>
                <img src={BOT_AVATAR[d.bot] || ""} alt={d.bot} className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-white/30" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{d.label}</div>
                  <div className="text-[9px] text-white/60">{d.dept}</div>
                </div>
                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0">{d.kpis} KPIs</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient = couleur du bot (BLUE pour CTO!). Avatar rounded-lg w-8 h-8 ring-1 ring-white/30. C'est le header que Carl a identifie.
        </div>
      </PatternCard>

      {/* 3.14 — Pastel Sub-section Headers */}
      <PatternCard title="4.14 Pastel Sub-section Headers — 4 variantes dans HealthView" where="HealthView.tsx — interieur des cards">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "VITAA SCORES", gradient: "from-orange-50 to-amber-50", border: "border-orange-100", iconColor: "text-orange-500" },
            { label: "QUICK WINS", gradient: "from-red-50 to-rose-50", border: "border-red-100", iconColor: "text-red-500" },
            { label: "BENCHMARKS", gradient: "from-blue-50 to-indigo-50", border: "border-blue-100", iconColor: "text-blue-500" },
            { label: "DEPARTEMENTS", gradient: "from-green-50 to-emerald-50", border: "border-green-100", iconColor: "text-green-500" },
          ].map((h) => (
            <div key={h.label} className={cn("bg-gradient-to-r px-2.5 py-1.5 border-b flex items-center gap-1.5 rounded-t-lg", h.gradient, h.border)}>
              <Activity className={cn("h-3.5 w-3.5", h.iconColor)} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">{h.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient PASTEL clair (from-xxx-50 to-yyy-50). py-1.5 px-2.5 — plus petit que les card headers. Texte gray-700 (pas blanc). UNIQUE a HealthView.
        </div>
      </PatternCard>

    </div>
  );
}

function TabMonBureau() {
  return (
    <div className="space-y-4">
      <SectionTitle num="5" title="Mon Bureau — Blueprint, Chantiers, Focus" />
      <div className="text-xs text-gray-600 leading-relaxed">Composants visuels de l'espace de travail — 5 tabs (Idees, Documents, Outils, Taches, Agenda).
      Sources: EspaceBureauView.tsx (2284 lignes), SectionEspaceBureau.tsx</div>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bureau / Blueprint / Chantiers</span></div>
      <div className="text-xs text-gray-500 mb-2">Espace de travail — contenu, tabs, cards chantier.</div>

      {/* 2.3 — Contenu 4xl */}
      <PatternCard title="5.1 CONTENU — maxWidth 4xl" where="Bureau, Blueprint, Chantiers, Master GHML">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-white border-b px-3 py-2 flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 rotate-180" />
            <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center"><Briefcase className="h-3.5 w-3.5 text-blue-600" /></div>
            <div><div className="h-2 bg-gray-800 rounded w-20" /><div className="h-1.5 bg-gray-200 rounded w-14 mt-0.5" /></div>
            <div className="ml-auto flex gap-0.5">
              <span className="px-1.5 py-0.5 text-[8px] bg-gray-900 text-white rounded">Tab 1</span>
              <span className="px-1.5 py-0.5 text-[8px] text-gray-400 rounded">Tab 2</span>
            </div>
          </div>
          <div className="p-3 max-w-[200px] mx-auto space-y-1.5">
            <div className="bg-white rounded border p-2 space-y-1"><div className="h-2 bg-gray-200 rounded w-3/4" /><div className="h-1.5 bg-gray-100 rounded w-full" /><div className="h-1.5 bg-gray-100 rounded w-5/6" /></div>
            <div className="bg-white rounded border p-2 space-y-1"><div className="h-2 bg-gray-200 rounded w-1/2" /><div className="h-1.5 bg-gray-100 rounded w-full" /></div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">max-w-4xl mx-auto px-10 py-5 — PageHeader + tabs + contenu scrollable</div>
      </PatternCard>

      <PatternCard title="5.2 Tabs standard (fond clair)" where="Master GHML, Bureau, Chantiers, Blueprint">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <span className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg shadow-sm">Actif</span>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Inactif</span>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Inactif</span>
        </div>
      </PatternCard>

      <PatternCard title="5.3 Card Chantier (statut + chaleur)" where="MesChantiersView, sidebar droite">
        <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-gray-800">Nom du chantier</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Mis a jour il y a 2h</div>
            </div>
            <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50">Actif</Badge>
          </div>
        </Card>
      </PatternCard>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Focus Mode & Scenarios</span></div>
      <div className="text-xs text-gray-500 mb-2">Mode immersion plein ecran et cards scenario.</div>

      {/* 2.6 — Focus */}
      <PatternCard title="5.4 FOCUS — Plein ecran dedie" where="FocusModeLayout (click → immersion)">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/20" />
            <div className="flex-1"><div className="h-2 bg-white/80 rounded w-20" /><div className="h-1.5 bg-white/30 rounded w-28 mt-0.5" /></div>
          </div>
          <div className="bg-gray-50 border-b px-3 py-1 flex items-center gap-3">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span className="text-[8px] text-gray-400">CarlOS</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-violet-400" /><span className="text-[8px] text-gray-400">Specialiste</span></div>
          </div>
          <div className="h-16 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mx-auto mb-1 flex items-center justify-center"><BarChart3 className="h-3.5 w-3.5 text-blue-600" /></div>
              <div className="h-1.5 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">Header gradient bot + Trio bandeau + contenu centre</div>
      </PatternCard>

      <PatternCard title="5.5 Card gradient content (InnovationDemo)" where="Scenarios, Orbit9 sections">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 flex items-center gap-2">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Titre Section</span>
          </div>
          <div className="p-4 text-xs text-gray-600">Contenu de la card...</div>
          <div className="bg-gray-50 px-4 py-2.5 border-t flex items-center justify-center">
            <button className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-medium">
              <ArrowRight className="h-3.5 w-3.5" /> Action
            </button>
          </div>
        </div>
      </PatternCard>

      {/* ══════ PATTERNS MANQUANTS — Code reel EspaceBureauView.tsx ══════ */}
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patterns additionnels (code reel)</span></div>

      <PatternCard title="5.6 SearchBar — Recherche + Filtres + Toggle vue" where="EspaceBureauView.tsx — en-tete de chaque tab">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <div className="pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-400">Rechercher...</div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg"><Plus className="h-3.5 w-3.5" /> Ajouter</div>
          <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg"><Filter className="h-3.5 w-3.5" /> Filtrer</div>
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-2 bg-gray-900 text-white"><LayoutGrid className="h-3.5 w-3.5" /></div>
            <div className="p-2 text-gray-400"><List className="h-3.5 w-3.5" /></div>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Pattern reutilise dans les 5 tabs. Input avec icone Search a gauche (pl-9). Bouton Ajouter bg-gray-900. Toggle Grid/List.
        </div>
      </PatternCard>

      <PatternCard title="5.7 Gradient Card avec header bot" where="EspaceBureauView.tsx — Idees, Documents, Templates (grid 2 colonnes)">
        <div className="grid grid-cols-2 gap-3">
          {[
            { bot: "CarlOS", gradient: "from-blue-600 to-blue-500", titre: "Plan strategique Q3" },
            { bot: "Martine", gradient: "from-pink-600 to-pink-500", titre: "Campagne marketing" },
          ].map(item => (
            <Card key={item.titre} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
              <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center gap-2.5", item.gradient)}>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center"><Bot className="h-3.5 w-3.5 text-white" /></div>
                <span className="text-xs font-bold text-white flex-1">{item.bot}</span>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="text-xs font-bold text-gray-800">{item.titre}</div>
                <div className="text-[9px] text-gray-500">Description du contenu...</div>
                <div className="flex gap-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">en-cours</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          grid grid-cols-2 gap-3. Header gradient avec avatar bot (w-7 h-7 bg-white/20 rounded-lg). Body: titre + description + tags colores.
        </div>
      </PatternCard>

      <PatternCard title="5.8 Upload Zone (drag-drop)" where="EspaceBureauView.tsx — tab Importes">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer">
          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 font-medium">Glissez vos fichiers ici ou cliquez</p>
          <p className="text-[9px] text-gray-400 mt-1">PDF, DOCX, XLSX, images — max 50 MB</p>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          border-2 border-dashed border-gray-300 rounded-xl. Hover: border-blue-400 bg-blue-50/30. Icone Upload centree.
        </div>
      </PatternCard>

      <PatternCard title="5.9 Kanban Taches (4 colonnes priorite)" where="EspaceBureauView.tsx — tab Taches (Plane.so)">
        <div className="grid grid-cols-4 gap-3">
          {[
            { title: "Urgentes", gradient: "from-red-600 to-red-500", border: "border-l-red-400", count: 2 },
            { title: "Hautes", gradient: "from-orange-600 to-orange-500", border: "border-l-orange-400", count: 5 },
            { title: "Moyennes", gradient: "from-blue-600 to-blue-500", border: "border-l-blue-400", count: 8 },
            { title: "Basses", gradient: "from-green-600 to-green-500", border: "border-l-green-400", count: 3 },
          ].map(col => (
            <Card key={col.title} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", col.gradient)}>
                <span className="text-sm font-bold text-white">{col.title}</span>
                <span className="ml-auto text-xs bg-white/25 text-white rounded-full px-1.5 py-0.5 font-bold">{col.count}</span>
              </div>
              <div className="p-2 space-y-1">
                {[1, 2].map(i => (
                  <div key={i} className={cn("px-2.5 py-2 rounded-lg border-l-[3px] bg-gray-50", col.border)}>
                    <div className="text-xs font-medium text-gray-800">Tache exemple {i}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Bot label | #12{i}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          grid grid-cols-4 gap-3. Chaque colonne = gradient header + liste taches avec border-l-[3px] colore. Donnees Plane.so.
        </div>
      </PatternCard>

      <PatternCard title="5.10 Calendrier hebdo (5 colonnes jours)" where="EspaceBureauView.tsx — tab Agenda">
        <div className="grid grid-cols-5 gap-3">
          {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((jour, i) => (
            <div key={jour}>
              <div className="text-xs font-bold text-gray-600 mb-2 px-1">{jour}</div>
              {i === 1 ? (
                <Card className="p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-gray-400">10:00</span>
                  </div>
                  <p className="text-[11px] font-medium text-gray-800 leading-tight mb-1.5">Reunion strategique</p>
                  <Badge variant="outline" className="text-[9px]">60 min</Badge>
                </Card>
              ) : (
                <div className="p-3 border border-dashed border-gray-200 rounded-lg text-center">
                  <p className="text-[10px] text-gray-400">Aucun</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          grid grid-cols-5 gap-3. Chaque jour = titre + liste events OU placeholder dashed. Event card: avatar bot + heure + titre + badge duree.
        </div>
      </PatternCard>

      <PatternCard title="5.11 Outils Manufacturiers (grille 2 colonnes)" where="EspaceBureauView.tsx — tab Outils">
        <div className="grid grid-cols-2 gap-3">
          {[
            { titre: "OEE / TRS Calculator", gradient: "from-orange-600 to-amber-600", icon: "⚙️" },
            { titre: "ROI Automatisation", gradient: "from-blue-600 to-blue-500", icon: "📊" },
          ].map(outil => (
            <Card key={outil.titre} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className={cn("flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r", outil.gradient)}>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center"><Wrench className="h-3.5 w-3.5 text-white" /></div>
                <span className="text-xs font-bold uppercase tracking-wider text-white flex-1 truncate">{outil.titre}</span>
              </div>
              <div className="px-4 py-3">
                <p className="text-[9px] text-gray-500">Description de l'outil...</p>
                <span className="text-[9px] text-gray-400 flex items-center gap-0.5 mt-1"><ChevronRight className="h-3.5 w-3.5" /> Lancer</span>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          grid grid-cols-2 gap-3. Header gradient + icone (w-7 h-7 bg-white/20). Titre uppercase tracking-wider. 8 outils manufacturiers.
        </div>
      </PatternCard>


    </div>
  );
}

function TabMesSalles() {
  return (
    <div className="space-y-4">
      <SectionTitle num="6" title="Mes Salles — Board Room, War Room, Think Room" />
      <div className="text-xs text-gray-600 leading-relaxed">Composants visuels des 3 salles de decision (D-109).
      Sources: ThinkRoomView.tsx, WarRoomView.tsx, BoardRoomView.tsx, SectionRooms.tsx</div>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">3 Rooms (Board / War / Think)</span></div>
      <div className="text-xs text-gray-500 mb-2">Salles de decision — layouts, headers et cards specifiques.</div>

      {/* 2.5 — 3 Rooms (D-109) */}
      <PatternCard title="6.1 ROOMS — 3 layouts distincts (D-109)" where="BoardRoom, WarRoom, ThinkRoom">
        <div className="grid grid-cols-3 gap-3">
          {/* Board Room — amber/gold */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-2 py-1.5 flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-white/80" />
              <div className="flex-1"><div className="h-1.5 bg-white/70 rounded w-12" /><div className="h-1 bg-white/30 rounded w-16 mt-0.5" /></div>
            </div>
            <div className="p-2 space-y-1.5">
              <div className="text-[7px] font-bold text-gray-400 uppercase">Membres CA (6)</div>
              <div className="grid grid-cols-3 gap-1">
                {BOTS_12.slice(0, 6).map(b => <div key={b.code} className="text-center"><div className={`w-4 h-4 rounded-full bg-${b.color}-100 mx-auto`} /><div className="text-[6px] text-gray-400 mt-0.5">{b.code}</div></div>)}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-[7px] font-bold text-gray-400 uppercase">Agenda + Resolutions</div>
              <div className="space-y-0.5">{[1,2].map(i => <div key={i} className="h-2 bg-amber-50 border border-amber-100 rounded" />)}</div>
              <div className="flex justify-center"><div className="bg-amber-500 rounded-full px-2.5 py-0.5"><div className="h-1 bg-white/60 rounded w-8" /></div></div>
            </div>
          </div>

          {/* War Room — red */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-2 py-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-white/80" />
              <div className="flex-1"><div className="h-1.5 bg-white/70 rounded w-10" /><div className="h-1 bg-white/30 rounded w-14 mt-0.5" /></div>
            </div>
            <div className="p-2 space-y-1.5">
              <div className="text-[7px] font-bold text-gray-400 uppercase">Equipe Crise</div>
              <div className="flex gap-1">
                {BOTS_12.slice(0, 3).map(b => <div key={b.code} className={`w-5 h-5 rounded-full bg-${b.color}-100 ring-1 ring-red-200`} />)}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-[7px] font-bold text-gray-400 uppercase">Diagnostic Urgence</div>
              <div className="space-y-0.5">
                {["bg-red-200 w-full","bg-red-100 w-4/5","bg-red-50 w-3/5"].map((c,i) => <div key={i} className={cn("h-1.5 rounded", c)} />)}
              </div>
              <div className="flex justify-center"><div className="bg-red-500 rounded-full px-2.5 py-0.5"><div className="h-1 bg-white/60 rounded w-8" /></div></div>
            </div>
          </div>

          {/* Think Room — cyan */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-2 py-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-white/80" />
              <div className="flex-1"><div className="h-1.5 bg-white/70 rounded w-12" /><div className="h-1 bg-white/30 rounded w-14 mt-0.5" /></div>
            </div>
            <div className="p-2 space-y-1.5">
              <div className="text-[7px] font-bold text-gray-400 uppercase">Equipe Creation</div>
              <div className="flex gap-1">
                {BOTS_12.slice(6, 9).map(b => <div key={b.code} className={`w-5 h-5 rounded-full bg-${b.color}-100 ring-1 ring-cyan-200`} />)}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="text-[7px] font-bold text-gray-400 uppercase">Processus Creatif</div>
              <div className="flex gap-1 items-center">
                {["Ideation","Prototypage","Validation"].map((s,i) => (
                  <div key={s} className="flex items-center gap-0.5">
                    {i > 0 && <ArrowRight className="h-2.5 w-2.5 text-gray-300" />}
                    <div className="bg-cyan-50 border border-cyan-100 rounded px-1 py-0.5 text-[6px] text-cyan-700">{s}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center"><div className="bg-cyan-500 rounded-full px-2.5 py-0.5"><div className="h-1 bg-white/60 rounded w-8" /></div></div>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-amber-50 rounded p-1.5"><strong>Board:</strong> amber — CA, agenda, resolutions</div>
          <div className="bg-red-50 rounded p-1.5"><strong>War:</strong> red — crise, diagnostic urgent</div>
          <div className="bg-cyan-50 rounded p-1.5"><strong>Think:</strong> cyan — creation, processus</div>
        </div>
      </PatternCard>

      {/* 3.6 — Room headers */}
      <PatternCard title="6.2 Room Headers — PageHeader avec icone et couleur" where="BoardRoom, WarRoom, ThinkRoom">
        <div className="space-y-2">
          {[
            { Icon: Crown, color: "amber", label: "Board Room", sub: "Conseil d'Administration — 6 C-Level" },
            { Icon: AlertTriangle, color: "red", label: "War Room", sub: "Gestion de crise — Mode COMMAND urgent" },
            { Icon: Lightbulb, color: "cyan", label: "Think Room", sub: "Lancement de projet — Vision au Go/No-Go" },
          ].map((room) => (
            <div key={room.label} className="border rounded-lg px-4 py-2.5 flex items-center gap-3">
              <button className="text-gray-400 p-1 rounded-lg"><ChevronRight className="h-3.5 w-3.5 rotate-180" /></button>
              <div className={`bg-gradient-to-br from-${room.color}-100 to-${room.color}-50 p-1.5 rounded-lg`}>
                <room.Icon className={`h-4 w-4 text-${room.color}-600`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800">{room.label}</div>
                <div className="text-[9px] text-gray-400">{room.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">Utilisent PageHeader standard — seules l'icone et la couleur changent. Le contenu de la page est different.</div>
      </PatternCard>

      {/* 3.7 — Room card headers */}
      <PatternCard title="6.3 Room Card Headers — gradient dans les sections internes" where="BoardRoom, WarRoom, ThinkRoom — cards internes">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Ordre du jour", color: "from-amber-600 to-amber-500", Icon: Crown },
            { label: "Protocole crise", color: "from-red-600 to-red-500", Icon: AlertTriangle },
            { label: "Processus creatif", color: "from-cyan-600 to-cyan-500", Icon: Lightbulb },
          ].map((c) => (
            <Card key={c.label} className="p-0 overflow-hidden">
              <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-1.5 border-b", c.color)}>
                <c.Icon className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">{c.label}</span>
              </div>
              <div className="p-2 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Similaire a BlockHeader mais sans margins negatives. Gradient + icone blanche + texte bold. Badge optionnel bg-white/90.
        </div>
      </PatternCard>

      <PatternCard title="2.40 Card Board Room (avatar + citation)" where="BoardRoomView — 6 membres">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-14 h-14 rounded-full ring-3 ring-blue-300 shadow-md" />
            <div>
              <p className="text-sm font-bold text-gray-800">CarlOS</p>
              <p className="text-[9px] text-gray-400">CEO — Direction Generale</p>
            </div>
          </div>
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-gray-300 bg-gray-50/50">
            <p className="text-xs text-gray-600 leading-relaxed italic">"Position du conseil sur ce sujet..."</p>
          </div>
        </Card>
      </PatternCard>

    </div>
  );
}

function TabMonEquipeAI() {
  return (
    <div className="space-y-4">
      <SectionTitle num="8.A" title="Reglages Agents AI — Skins Cognitifs, Profils, Trisociation" />
      <div className="text-xs text-gray-600 leading-relaxed">Composants visuels des profils agents: banniere, trisociation, profil psychometrique, modes decisionnels.</div>

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reglages Agent (Profil Bot)</span></div>
      <div className="text-xs text-gray-500 mb-2">AgentSettingsView — banniere, skins cognitifs, trisociation, profil.</div>

      {/* 2.8 — Agent Settings */}
      <PatternCard title="8.4 REGLAGES AGENT — Banniere + Tabs + Contenu" where="AgentSettingsView (profil bot)">
        {/* Wireframe layout avec tabs */}
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          {/* Banniere agent */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 h-10 relative">
            <div className="absolute bottom-1 left-2 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/30 ring-1 ring-white/50" />
              <div><div className="h-1.5 bg-white/80 rounded w-12" /><div className="h-1 bg-white/40 rounded w-16 mt-0.5" /></div>
            </div>
          </div>
          {/* Tabs navigation */}
          <div className="flex gap-1 px-2 py-1.5 border-b bg-white">
            {["Vue d'ensemble", "Teintures", "Profil & Modes", "Performance", "Parametres"].map((t, i) => (
              <div key={t} className={cn("px-1.5 py-0.5 rounded text-[6px] font-bold", i === 0 ? "bg-gray-900 text-white" : "text-gray-400 bg-gray-50")}>{t}</div>
            ))}
          </div>
          {/* Contenu tab actif (Vue d'ensemble) */}
          <div className="p-2 space-y-1.5">
            <div className="grid grid-cols-4 gap-1">
              {["Missions", "Succes", "Temps moy.", "Actives"].map(k => (
                <div key={k} className="bg-white rounded border p-1 text-center"><div className="text-[6px] text-gray-400">{k}</div><div className="text-[8px] font-bold text-gray-700">—</div></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-white rounded border p-1 space-y-0.5"><div className="text-[6px] font-bold text-gray-400">Activite recente</div>{[1,2].map(i=><div key={i} className="h-1 bg-gray-100 rounded" />)}</div>
              <div className="bg-white rounded border p-1 space-y-0.5"><div className="text-[6px] font-bold text-gray-400">Collaboration</div>{[1,2].map(i=><div key={i} className="h-1 bg-gray-100 rounded" />)}</div>
            </div>
          </div>
        </div>

        {/* 5 tabs documentes */}
        <div className="mt-3 space-y-2">
          <div className="text-[9px] font-bold text-gray-700 uppercase">5 tabs — Structure Reglages Agent</div>
          <div className="space-y-1.5">
            {[
              { tab: "1. Vue d'ensemble", desc: "Banniere identite + 4 KPIs (missions, succes, temps, actives) + statut en ligne + activite recente + collaboration equipe", type: "DATA" },
              { tab: "2. Teintures cognitives", desc: "Trisociation 3 slots (Primaire/Calibrateur/Amplificateur) + catalogue 21 Ghosts (7 categories) + assignation interactive", type: "ACTION" },
              { tab: "3. Profil & Modes", desc: "Profil psychometrique (5 barres 0-100) + 5 modes decisionnels (toggles) + competences cles + style communication", type: "DATA + ACTION" },
              { tab: "4. Performance", desc: "Historique decisionnel + documents generes + missions completees + metriques detaillees", type: "DATA" },
              { tab: "5. Parametres", desc: "Voix ElevenLabs, permissions, integrations API, config technique, seuils d'activation", type: "ACTION" },
            ].map((t) => (
              <div key={t.tab} className="flex items-start gap-2 bg-white rounded border px-2 py-1.5">
                <span className={cn("text-[8px] font-bold px-1 py-0.5 rounded shrink-0", t.type === "ACTION" ? "bg-blue-100 text-blue-700" : t.type === "DATA" ? "bg-gray-100 text-gray-600" : "bg-violet-100 text-violet-700")}>{t.type}</span>
                <div>
                  <div className="text-[9px] font-bold text-gray-800">{t.tab}</div>
                  <div className="text-[8px] text-gray-500">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PatternCard>

      {/* 3.8 — Agent Settings Banner */}
      <PatternCard title="8.5 Agent Settings Banner — standby image pleine largeur" where="AgentSettingsView.tsx — profil bot">
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 h-24 relative">
            <div className="absolute bottom-2 left-3 flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-500 ring-3 ring-white/50 shadow-lg" />
              <div>
                <div className="text-sm font-bold text-white">CarlOS</div>
                <div className="text-[9px] text-white/60">CEO — Direction Generale</div>
              </div>
            </div>
            <div className="absolute top-2 right-3">
              <button className="text-[9px] px-2 py-1 rounded-lg bg-white/10 text-white/70 border border-white/20">Modifier</button>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-gray-50 rounded p-1.5"><strong>Image:</strong> aspect-[3/1] standby</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Avatar:</strong> w-16 h-16 ring-3 ring-white/50</div>
          <div className="bg-gray-50 rounded p-1.5"><strong>Position:</strong> absolute bottom-left overlay</div>
        </div>
      </PatternCard>

      {/* 3.15 — AgentSettings Card Headers (10+ gradients) */}
      <PatternCard title="8.6 AgentSettings Card Headers — 10 gradients differents!" where="AgentSettingsView.tsx — CHAQUE section a son gradient">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Mode Decision", gradient: "from-blue-600 to-blue-500" },
            { label: "Competences", gradient: "from-gray-700 to-gray-600" },
            { label: "Style Comm.", gradient: "from-indigo-600 to-indigo-500" },
            { label: "Psychometrie", gradient: "from-violet-600 to-purple-500" },
            { label: "Teintures Cog.", gradient: "from-violet-600 to-purple-500" },
            { label: "Points Forts", gradient: "from-emerald-600 to-emerald-500" },
            { label: "Stats Missions", gradient: "from-cyan-600 to-blue-500" },
            { label: "Activite", gradient: "from-slate-700 to-slate-600" },
            { label: "Collaboration", gradient: "from-rose-600 to-pink-500" },
            { label: "Historique", gradient: "from-amber-600 to-orange-500" },
            { label: "Documents", gradient: "from-teal-600 to-cyan-500" },
            { label: "Catalogue", gradient: "from-indigo-600 to-violet-500" },
          ].map((h) => (
            <div key={h.label} className={cn("bg-gradient-to-r px-2.5 py-1.5 rounded flex items-center gap-1.5", h.gradient)}>
              <span className="text-[8px] font-bold text-white truncate">{h.label}</span>
            </div>
          ))}
        </div>
        <Card className="p-2 mt-2 border-red-200 bg-red-50/50">
          <div className="text-[9px] text-gray-700">
            <strong>PROBLEME MAJEUR:</strong> 12 card headers avec CHACUN un gradient different improvise. Aucune logique de couleur. Meme pattern CSS (px-4 py-2.5) mais couleurs aleatoires. A normaliser vers 3-4 palettes max.
          </div>
        </Card>
      </PatternCard>

      {/* 3.16 — Trisociation Slot Mini-Header */}
      <PatternCard title="8.7 Trisociation Slot Mini-Header — 3 slots colores" where="AgentSettingsView.tsx — nested dans les trisociation cards">
        <div className="space-y-1.5">
          {[
            { label: "PRIMAIRE", role: "Base cognitive", gradient: "from-blue-600 to-blue-500" },
            { label: "CALIBRATEUR", role: "Equilibre", gradient: "from-violet-600 to-violet-500" },
            { label: "AMPLIFICATEUR", role: "Renforcement", gradient: "from-amber-600 to-amber-500" },
          ].map((slot) => (
            <div key={slot.label} className={cn("bg-gradient-to-r px-3 py-1.5 flex items-center gap-2 rounded", slot.gradient)}>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">{slot.label}</span>
              <span className="text-[9px] text-white/60 ml-auto">{slot.role}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          py-1.5 — PLUS PETIT que les card headers (py-2.5). Texte uppercase tracking-widest. 3 gradients fixes (blue/violet/amber).
        </div>
      </PatternCard>

      <PatternCard title="8.8 Tabs avec icones + bordure couleur" where="EspaceBureauView — 7 sections">
        <div className="flex gap-1">
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
            <Lightbulb className="h-3.5 w-3.5" /> Actif
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">
            <Briefcase className="h-3.5 w-3.5" /> Inactif
          </span>
        </div>
      </PatternCard>

      {/* 14.1 — Banner agent */}
      <PatternCard title="8.9 Banniere Agent (standby image 3:1)" where="AgentSettingsView — haut de page">
        <div className="relative rounded-xl overflow-hidden shadow-sm">
          <div className="w-full aspect-[3/1] bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-4">
            <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-16 h-16 rounded-full object-cover ring-3 ring-white/50 shadow-xl" />
            <div className="flex-1">
              <div className="text-xl font-extrabold text-white">CarlOS</div>
              <div className="text-sm text-white/80 font-medium">CEO — Direction Generale</div>
            </div>
            <span className="text-[9px] font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">Trisociation active</span>
            <span className="text-[9px] font-semibold text-green-300 bg-green-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> En ligne
            </span>
          </div>
        </div>
      </PatternCard>

      {/* 14.2 — Trisociation 3 slots */}
      <PatternCard title="8.10 Trisociation — 3 slots cognitifs" where="AgentSettingsView — colonne droite">
        <div className="text-xs text-gray-600 mb-2">Chaque bot a 3 Ghosts: Primaire (modele dominant), Calibrateur (regulateur), Amplificateur (catalyseur).</div>
        <div className="space-y-3">
          {TRISOCIATION_EXAMPLES.map(tri => {
            const botInfo = BOTS_12.find(b => b.code === tri.bot);
            return (
              <div key={tri.bot}>
                <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">{botInfo?.nom} — {botInfo?.role}</div>
                <div className="grid grid-cols-3 gap-2">
                  {tri.slots.map(slot => (
                    <Card key={slot.role} className="p-0 overflow-hidden">
                      <div className={`bg-gradient-to-r from-${slot.color}-600 to-${slot.color}-500 px-3 py-1.5`}>
                        <div className="text-[9px] font-bold text-white uppercase">{slot.role}</div>
                        <div className="text-[8px] text-white/60">{slot.role === "Primaire" ? "Modele dominant" : slot.role === "Calibrateur" ? "Regulateur" : "Catalyseur"}</div>
                      </div>
                      <div className="px-3 py-2 flex items-center gap-2">
                        <span className="text-lg">{slot.emoji}</span>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{slot.ghost}</div>
                        </div>
                        <Pencil className="h-3.5 w-3.5 text-gray-300 ml-auto" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PatternCard>

      {/* 14.3 — Score bars psychometrie */}
      <PatternCard title="8.11 Profil Psychometrique (5 barres de score)" where="AgentSettingsView — colonne droite">
        <div className="space-y-2">
          {[
            { label: "Strategique", value: 95, color: "bg-blue-500" },
            { label: "Analytique", value: 70, color: "bg-emerald-500" },
            { label: "Creatif", value: 60, color: "bg-purple-500" },
            { label: "Operationnel", value: 50, color: "bg-orange-500" },
            { label: "Relationnel", value: 85, color: "bg-pink-500" },
          ].map(bar => (
            <div key={bar.label} className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500 w-24 shrink-0 text-right">{bar.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", bar.color)} style={{ width: `${bar.value}%` }} />
              </div>
              <span className="text-[9px] font-bold text-gray-600 w-8">{bar.value}</span>
            </div>
          ))}
        </div>
      </PatternCard>

      {/* 14.4 — Decision modes */}
      <PatternCard title="8.12 Modes Decisionnels (5 boutons toggle)" where="AgentSettingsView — colonne gauche">
        <div className="grid grid-cols-5 gap-2">
          {DECISION_MODES_DATA.map((mode, i) => {
            const Icon = mode.icon;
            const isActive = i === 0;
            return (
              <div key={mode.id} className={cn(
                "rounded-xl p-3 text-center border cursor-pointer transition-all",
                isActive
                  ? `bg-gradient-to-b from-${mode.color}-50 to-white border-${mode.color}-300 shadow-sm`
                  : "bg-white border-gray-200 hover:bg-gray-50"
              )}>
                <Icon className={cn("h-4 w-4 mx-auto mb-1", isActive ? `text-${mode.color}-600` : "text-gray-400")} />
                <div className={cn("text-[9px] font-bold", isActive ? `text-${mode.color}-700` : "text-gray-500")}>{mode.label}</div>
              </div>
            );
          })}
        </div>
      </PatternCard>

      {/* 14.5 — Competences cles */}
      <PatternCard title="8.13 Competences Cles (grille 2 colonnes)" where="AgentSettingsView — colonne gauche">
        <div className="grid grid-cols-2 gap-2">
          {["Vision strategique", "Prise de decision", "Gestion d'equipe", "Analyse financiere", "Communication", "Innovation produit"].map(comp => (
            <div key={comp} className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-700">{comp}</span>
            </div>
          ))}
        </div>
      </PatternCard>

      {/* 14.6 — Ghost catalogue */}
      <PatternCard title="8.14 Catalogue des Ghosts (14 archetypes, 7 categories)" where="AgentSettingsView — bas de page">
        <div className="space-y-2">
          {Object.entries(
            GHOST_ARCHETYPES.reduce<Record<string, typeof GHOST_ARCHETYPES>>((acc, g) => {
              (acc[g.categorie] = acc[g.categorie] || []).push(g);
              return acc;
            }, {})
          ).map(([cat, ghosts]) => (
            <Card key={cat} className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", CATEGORY_COLORS[cat])}>{cat}</span>
                <span className="text-[9px] text-gray-400">{ghosts.length} archetype{ghosts.length > 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y">
                {ghosts.map(g => (
                  <div key={g.nom} className="px-3 py-2 flex items-center gap-3">
                    <span className="text-lg shrink-0">{g.emoji}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">{g.nom}</div>
                      <div className="text-[9px] text-gray-400 italic">{g.signature}</div>
                    </div>
                    <button className="text-[9px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Assigner</button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </PatternCard>

      {/* 14.7 — Style de communication */}
      <PatternCard title="8.15 Style de Communication" where="AgentSettingsView — colonne gauche">
        <Card className="p-3">
          <div className="text-xs font-bold text-gray-800 mb-2">Style: Directif et visionnaire</div>
          <div className="bg-indigo-50/50 rounded-lg px-3 py-2">
            <div className="text-xs text-gray-700 leading-relaxed">
              Approche: Communication directe, orientee resultats. Utilise des analogies business pour illustrer les concepts complexes.
            </div>
          </div>
        </Card>
      </PatternCard>

    </div>
  );
}


function TabMonReseau() {
  return (
    <div className="space-y-4">
      <SectionTitle num="7" title="Mon Reseau — Centre Nerveux Orbit9" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Reseau elite augmente AI — 7 tabs. Processus de selection rigoureux (inspire REAI). CarlOS = mediateur proactif entre membres.
        Sources: FEMonReseauPage.tsx, MarketplacePage.tsx, CellulesPage.tsx, JumelageLivePage.tsx, PionniersPage.tsx, GouvernancePage.tsx, NouvellesPage.tsx, EvenementsPage.tsx, TrgIndustriePage.tsx
      </div>

      {/* ══════ STRUCTURE 7 TABS ══════ */}
      <div className="bg-gradient-to-r from-orange-100 to-transparent rounded-lg px-4 py-2 mt-6 mb-2">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">7 Tabs — Mon Reseau</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          { tab: "T1", label: "Mon Profil Reseau", desc: "CV entreprise verifie, certifications, sceaux, reputation, visibilite", status: "planifie", color: "sky" },
          { tab: "T2", label: "Mes Cellules", desc: "Drill-down: Cellule → Chantiers → Projets → Missions. Opportunites + Meetings live + Performance", status: "live", color: "emerald" },
          { tab: "T3", label: "Jumelage", desc: "ACTION: Detection CarlOS → Upload kit → Cahier genere → Expert valide → Match → Contrat signe", status: "planifie", color: "amber" },
          { tab: "T4", label: "Pionniers", desc: "Mouvement AI Quebec, franchise intelligente, programme partenaires-integrateurs, tableau pionniers", status: "planifie", color: "violet" },
          { tab: "T5", label: "Gouvernance", desc: "Charte reseau, standards qualite, litiges & sanctions. Tolerance zero comportement toxique", status: "planifie", color: "slate" },
          { tab: "T6", label: "Dashboard Reseau", desc: "ROI, heures sauvees (CarlOS mediations), sante cellules, valeur contrats facilites", status: "planifie", color: "blue" },
          { tab: "T7", label: "Industrie", desc: "Nouvelles + Evenements + Veille sectorielle (3-en-1)", status: "live", color: "indigo" },
        ].map(item => (
          <Card key={item.tab} className={cn("p-4 border-l-4", `border-l-${item.color}-400`)}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">{item.tab}</span>
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
              <StatusBadge status={item.status as "live" | "planifie"} />
            </div>
            <p className="text-xs text-gray-500 ml-8">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* ══════ PATTERNS VISUELS APPLICABLES ══════ */}
      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patterns visuels — Mon Reseau</span>
      </div>

      <Card className="p-4 bg-orange-50/30 border-orange-100">
        <div className="text-xs font-semibold text-orange-800 mb-3">Composants utilises dans Mon Reseau</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-[9px] font-bold text-gray-600 uppercase">Reutilises (existants)</div>
            <div className="space-y-1">
              {[
                { pattern: "PageHeader standard", ref: "Tab 3 — 2.13", status: "live" },
                { pattern: "Gradient sub-tabs", ref: "Tab 3 — 2.31", status: "live" },
                { pattern: "Card gradient content", ref: "Tab 3 — 2.37", status: "live" },
                { pattern: "KPI Card standard", ref: "Tab 3 — 2.34", status: "live" },
                { pattern: "Barres de progression", ref: "Tab 3 — 3.17", status: "live" },
                { pattern: "Status badges", ref: "Tab 3 — 3.10+", status: "live" },
              ].map(p => (
                <div key={p.pattern} className="flex items-center gap-2 text-[9px]">
                  <span className="text-emerald-600 font-medium">{p.pattern}</span>
                  <span className="text-gray-400">→ {p.ref}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[9px] font-bold text-gray-600 uppercase">A documenter (specifiques Orbit9)</div>
            <div className="space-y-1">
              {[
                { pattern: "Fiche Membre Orbit9", desc: "Card profil entreprise avec sceaux" },
                { pattern: "Card Cellule (3 membres)", desc: "Trio visualise avec liens" },
                { pattern: "Pipeline Jumelage", desc: "5 etapes horizontales avec progression" },
                { pattern: "Score Matching", desc: "Jauge circulaire + breakdown VITAA" },
                { pattern: "Meeting Card (LiveKit)", desc: "Card avec participants + transcription" },
                { pattern: "Tableau Pionniers", desc: "Classement avec badges et contributions" },
              ].map(p => (
                <div key={p.pattern} className="text-[9px]">
                  <span className="text-blue-600 font-medium">{p.pattern}</span>
                  <span className="text-gray-400 ml-1">— {p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ══════ SPECIMEN: MARKETPLACE CARD (existant) ══════ */}
      <PatternCard title="7.1 Card Membre Orbit9 (existant)" where="Orbit9 Marketplace — grille de membres">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Usine Bleue AI", sector: "Automatisation", score: 92, color: "blue" },
            { name: "Boreal Alimentaire", sector: "Agroalimentaire", score: 78, color: "emerald" },
            { name: "TechFab Industries", sector: "Fabrication", score: 85, color: "violet" },
          ].map(m => (
            <Card key={m.name} className="p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-[9px] font-bold", `bg-${m.color}-500`)}>
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-800">{m.name}</div>
                  <div className="text-[9px] text-gray-400">{m.sector}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", `bg-${m.color}-500`)} style={{ width: `${m.score}%` }} />
                </div>
                <span className="text-[9px] font-bold text-gray-600">{m.score}</span>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Card standard avec initiale coloree, nom, secteur, score VITAA. Hover shadow. Grille responsive 3 colonnes.
        </div>
      </PatternCard>

      {/* ══════ SPECIMEN: CELLULE TRIO ══════ */}
      <PatternCard title="7.2 Card Cellule — Trio 3 entreprises" where="Orbit9 Cellules — groupes de collaboration">
        <Card className="p-4 border-l-4 border-l-orange-400">
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-800">Cellule Alpha</span>
            <StatusBadge status="live" />
          </div>
          <div className="flex items-center justify-center gap-4 my-3">
            {[
              { name: "Usine Bleue", color: "blue" },
              { name: "Boreal", color: "emerald" },
              { name: "TechFab", color: "violet" },
            ].map((m, i) => (
              <div key={m.name} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px bg-orange-300" />}
                <div className="text-center">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto", `bg-${m.color}-500`)}>
                    {m.name.charAt(0)}
                  </div>
                  <div className="text-[8px] text-gray-500 mt-1">{m.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
            <div className="bg-emerald-50 rounded p-1.5"><strong className="text-emerald-700">3</strong> <span className="text-gray-500">chantiers</span></div>
            <div className="bg-blue-50 rounded p-1.5"><strong className="text-blue-700">12h</strong> <span className="text-gray-500">sauvees</span></div>
            <div className="bg-amber-50 rounded p-1.5"><strong className="text-amber-700">89%</strong> <span className="text-gray-500">sante</span></div>
          </div>
        </Card>
        <div className="mt-2 text-[9px] text-gray-500">
          3 membres visualises en cercle avec liens. KPI: chantiers actifs, heures sauvees, score sante. Border-left orange.
        </div>
      </PatternCard>

      {/* ══════ SPECIMEN: JUMELAGE PIPELINE ══════ */}
      <PatternCard title="7.3 Pipeline Jumelage — 5 etapes horizontales" where="Orbit9 Jumelage — flow ACTION">
        <div className="flex items-center gap-1">
          {[
            { step: "1", label: "Detection", color: "amber", active: true },
            { step: "2", label: "Qualification", color: "blue", active: true },
            { step: "3", label: "Cahier", color: "violet", active: false },
            { step: "4", label: "Expert", color: "emerald", active: false },
            { step: "5", label: "Match", color: "green", active: false },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-1 flex-1">
              {i > 0 && <ArrowRight className="h-3 w-3 text-gray-300 shrink-0" />}
              <div className={cn(
                "flex-1 text-center rounded-lg py-2 px-1 border",
                s.active ? `bg-${s.color}-50 border-${s.color}-200` : "bg-gray-50 border-gray-200"
              )}>
                <div className={cn("text-[9px] font-bold", s.active ? `text-${s.color}-700` : "text-gray-400")}>{s.step}</div>
                <div className={cn("text-[8px]", s.active ? `text-${s.color}-600` : "text-gray-400")}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Pipeline horizontal 5 etapes. Etapes actives = couleur, inactives = gris. Fleches entre etapes.
          Flow: Detection CarlOS → Qualification kit → Cahier genere → Expert valide → Match & Contrat.
        </div>
      </PatternCard>

      {/* ══════ NOTE ARCHITECTURALE ══════ */}
      <Card className="p-3 bg-orange-50 border-orange-200 border-dashed">
        <div className="text-[9px] text-orange-700 font-medium leading-relaxed">
          ARCHITECTURE: Meme frame que Blueprint (RD.7) — Cellule → Chantiers → Projets → Missions → Taches (drill-down imbrique).
          CarlOS = mediateur proactif dans CHAQUE interaction entre membres (meetings live, detection tensions, action items auto).
          Processus de selection rigoureux inspire REAI — reseau elite, pas n'importe qui entre.
          Strategie acquisition: invitation gratuite fournisseur → qualification AI → decouvre CarlOS → devient client → invite SES fournisseurs → flywheel.
        </div>
      </Card>
    </div>
  );
}

function CombinedTab9Audit() {
  return (
    <div className="space-y-6">
      <Tab13Doublons />
      <Tab14Ecarts />

      <div className="bg-gradient-to-r from-gray-100 to-transparent rounded-lg px-4 py-2 mt-8 mb-2"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audit & Synthese</span></div>
      <div className="text-xs text-gray-500 mb-2">Diagnostic des incoherences visuelles identifiees.</div>

      {/* 3.17 — Synthese : carte de coherence */}
      <SectionTitle num="2.29" title="Synthese — le chaos des headers" />
      <Card className="p-3 border-red-200 bg-red-50/50">
        <div className="text-xs font-bold text-red-800 mb-2">Diagnostic: headers improvises</div>
        <div className="space-y-1.5 text-[9px] text-gray-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>17+ types de headers differents</strong> dans le canvas central. Aucune logique unifiee.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>LiveChat vs PageHeader vs HealthView:</strong> 3 composants header differents pour la meme zone. Backdrop-blur vs opaque vs gradient.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>AgentSettings = 12 gradients:</strong> Chaque section a un gradient unique. Aucune palette partagee.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>HealthView Diagnostic Cards:</strong> Avatar BOT + gradient bleu — pattern qui n'existe nulle part ailleurs.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>3 tailles de padding:</strong> py-1.5 (mini) vs py-2.5 (card) vs py-3 (page). Melangees partout.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <span><strong>Pastel headers UNIQUES a HealthView:</strong> from-xxx-50 (clair) vs from-xxx-600 (fonce) — 2 systemes incompatibles.</span>
          </div>
        </div>
      </Card>
      <Card className="p-3">
        <div className="text-xs font-bold text-gray-800 mb-2">Recapitulatif — 17 types de headers</div>
        <div className="space-y-1 text-[9px]">
          {[
            { num: "1", type: "PageHeader", bg: "bg-white opaque", padding: "px-4 py-3", usage: "~30 pages", ok: true },
            { num: "2", type: "LiveChat Header", bg: "bg-white/80 blur", padding: "px-4 py-2.5", usage: "Chat", ok: false },
            { num: "2.H", type: "Mode Bar", bg: "bg-white/60", padding: "px-3 py-1.5", usage: "Chat (modes)", ok: false },
            { num: "2.T", type: "Roster Bar", bg: "bg-white/60 border", padding: "py-2 px-3", usage: "Chat (equipe)", ok: false },
            { num: "2.C", type: "Dept Gradient", bg: "gradient bot-color", padding: "px-4 py-3", usage: "12 depts", ok: true },
            { num: "3.TY", type: "BlockHeader (-mx)", bg: "gradient margins neg.", padding: "px-4 py-2.5", usage: "Dashboard", ok: false },
            { num: "3.BT", type: "Room PageHeader", bg: "bg-white opaque", padding: "px-4 py-3", usage: "3 rooms", ok: true },
            { num: "3.BA", type: "Room Card Header", bg: "gradient card", padding: "px-3 py-2", usage: "Rooms int.", ok: false },
            { num: "4", type: "Agent Banner", bg: "image 3:1", padding: "overlay", usage: "Settings", ok: false },
            { num: "3.ST", type: "KPI Card", bg: "gradient + trend", padding: "px-3 py-2", usage: "Health", ok: false },
            { num: "1.CL", type: "Diag Card (dept)", bg: "gradient sans icone", padding: "px-3 py-2.5", usage: "Dept diag", ok: false },
            { num: "6.DB", type: "Bloc Header (dept)", bg: "gradient + icone", padding: "px-4 py-2.5", usage: "Dept blocs", ok: false },
            { num: "6.EC", type: "Health Tab Header", bg: "3 etats dynamiques", padding: "p-4", usage: "Sante", ok: false },
            { num: "2.S", type: "Health Diag Card", bg: "gradient + avatar bot", padding: "px-3 py-2.5", usage: "Sante diag", ok: false },
            { num: "5.MG", type: "Pastel Sub-header", bg: "from-xxx-50 clair", padding: "px-2.5 py-1.5", usage: "Sante int.", ok: false },
            { num: "5.CD", type: "Agent Card Headers", bg: "12 gradients!", padding: "px-4 py-2.5", usage: "Settings", ok: false },
            { num: "17", type: "Trisociation Slot", bg: "blue/violet/amber", padding: "px-3 py-1.5", usage: "Settings", ok: false },
          ].map((h) => (
            <div key={h.num} className={cn("grid grid-cols-5 gap-2 py-1 border-b border-gray-50 last:border-0", !h.ok && "bg-red-50/30")}>
              <span className="font-bold text-gray-800">{h.num}. {h.type}</span>
              <span className="text-gray-500 font-mono">{h.bg}</span>
              <span className="text-gray-500 font-mono">{h.padding}</span>
              <span className="text-gray-400">{h.usage}</span>
              <span className={h.ok ? "text-green-500" : "text-red-500"}>{h.ok ? "Standard" : "Improvise"}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3.17 — Comparaison: Gradient headers 2 tailles (ex-12.2) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Gradient headers 2 tailles</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Grande (KPI, Departements)</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Direction</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-blue-600">2.4M$</div>
              </div>
            </Card>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Compacte (Cockpit bots)</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1.5 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[9px] font-bold text-white">CarlOS</span>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-[9px] text-gray-500">Score: 85</div>
              </div>
            </Card>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> Grande partout, sauf cockpit compact.</div>
      </Card>

      <Card className="p-3 border-blue-200 bg-blue-50/50">
        <div className="text-xs font-bold text-blue-800 mb-1.5">Recommendation: 4 headers standard a definir</div>
        <div className="space-y-1 text-[9px] text-gray-700">
          <div><strong>1. PageHeader</strong> — bg-white opaque, px-4 py-3 (deja standard, garder tel quel)</div>
          <div><strong>2. CardHeader gradient</strong> — px-4 py-2.5, gradient bot-color, icone w-7 h-7 (unifier BlockHeader + Room + Agent + Diag)</div>
          <div><strong>3. Mini-header</strong> — px-3 py-1.5, pour les sous-sections internes (trisociation, pastel, etc.)</div>
          <div><strong>4. ChatHeader</strong> — backdrop-blur, specifique au LiveChat (mode bar + roster = sous-composants)</div>
        </div>
      </Card>

      {/* 4.4 — Comparaison des 3 variantes (ex-12.1) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Comparaison — 3 variantes cote a cote</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">A — Fond clair</div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              <span className="px-2 py-1 text-[9px] font-medium bg-gray-900 text-white rounded-lg">Actif</span>
              <span className="px-2 py-1 text-[9px] font-medium text-gray-500 rounded-lg">Inactif</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">B — Gradient</div>
            <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-2 py-1 rounded-lg flex gap-1 w-fit">
              <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Actif</span>
              <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 mb-1">C — Icones</div>
            <div className="flex gap-1 w-fit">
              <span className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                <Lightbulb className="h-3.5 w-3.5" /> Actif
              </span>
            </div>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> Unifier en 2 max: tabs fond clair + tabs dans gradient.</div>
      </Card>

      {/* 5.9 — Comparaison: coins de cards (ex-12.6) */}
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-[9px] font-bold text-amber-800 uppercase mb-2">Doublon identifie — Coins de cards 2 arrondis</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">rounded-xl (InnovationDemo)</div>
            <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5">
                <span className="text-sm font-bold text-white">Titre</span>
              </div>
              <div className="p-3 text-xs text-gray-600">Contenu</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">rounded-lg (KPI, standard)</div>
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5">
                <span className="text-sm font-bold text-white">Titre</span>
              </div>
              <div className="p-3 text-xs text-gray-600">Contenu</div>
            </Card>
          </div>
        </div>
        <div className="text-[9px] text-amber-700 mt-2"><strong>Recommandation:</strong> rounded-xl pour gradient cards, rounded-lg pour le reste.</div>
      </Card>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function MasterBibleVisuelleLivePage() {
  const [activeTab, setActiveTab] = useState<TabId>("structure");
  const { setActiveView } = useFrameMaster();

  const renderTab = () => {
    switch (activeTab) {
      case "structure": return <Tab1Structure />;
      case "identite": return <CombinedTab2Identite />;
      case "primitives": return <TabPrimitives />;
      case "entreprise": return <TabMonEntreprise />;
      case "bureau": return <TabMonBureau />;
      case "salles": return <TabMesSalles />;
      case "reseau": return <TabMonReseau />;
      case "reglages": return <TabReglages />;
      case "livechat": return <Tab10Bulles />;
      case "audit": return <CombinedTab9Audit />;
      default: return null;
    }
  };

  return (
    <PageLayout
      maxWidth="4xl"
      header={
        <PageHeader
          icon={Eye}
          iconColor="text-indigo-600"
          title="Bible Visuelle Officielle"
          subtitle="Bibliotheque de composants — 9 sections"
          onBack={() => setActiveView("bible-visuelle")}
        />
      }
    >
      {/* Sub-tabs standard — fond clair, flex-wrap, tout visible */}
      <div className="flex gap-1 flex-wrap mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-medium rounded-lg transition-colors",
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
      {renderTab()}
    </PageLayout>
  );
}

export default MasterBibleVisuelleLivePage;
