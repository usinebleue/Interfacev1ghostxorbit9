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
  Phone, Send, Mic, Video,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { BOT_AVATAR } from "../../../api/types";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ================================================================
// TABS — 17 sections numerotees
// ================================================================

const TABS = [
  { id: "identite", label: "1. Identite", icon: Fingerprint },
  { id: "avatars", label: "2. Avatars", icon: UserCircle },
  { id: "layouts", label: "3. Layouts", icon: Layout },
  { id: "headers", label: "4. Headers", icon: PanelTop },
  { id: "tabs", label: "5. Tabs", icon: ToggleLeft },
  { id: "cards", label: "6. Cards", icon: CreditCard },
  { id: "typo", label: "7. Typo", icon: Type },
  { id: "boutons", label: "8. Boutons", icon: ChevronRight },
  { id: "badges", label: "9. Badges", icon: Gauge },
  { id: "bulles", label: "10. Bulles", icon: MessageSquare },
  { id: "indicateurs", label: "11. Status", icon: Activity },
  { id: "couleurs", label: "12. Couleurs", icon: Palette },
  { id: "doublons", label: "13. Doublons", icon: Copy },
  { id: "ecarts", label: "14. Ecarts", icon: AlertTriangle },
  { id: "skins", label: "15. Skins", icon: Brain },
  { id: "menu-gauche", label: "16. Menu", icon: PanelLeft },
  { id: "console-droite", label: "17. Console", icon: PanelRight },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ================================================================
// DATA — Bot identity system
// ================================================================

const BOTS_12 = [
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

const MODES_REFLEXION = [
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

const SIDEBAR_PIPELINE = [
  { label: "Discussions", icon: MessageSquare, color: "text-violet-500" },
  { label: "Missions",    icon: Target,        color: "text-green-500" },
  { label: "Projets",     icon: FolderKanban,  color: "text-indigo-500" },
  { label: "Chantiers",   icon: Flame,         color: "text-red-500" },
];

const SIDEBAR_RESSOURCES = [
  { label: "Idees",     icon: Sparkles,    color: "text-amber-500" },
  { label: "Documents", icon: FileText,    color: "text-green-500" },
  { label: "Outils",    icon: Wrench,      color: "text-orange-500" },
  { label: "Taches",    icon: CheckSquare, color: "text-purple-500" },
  { label: "Agenda",    icon: CalendarDays, color: "text-rose-500" },
];

// ================================================================
// HELPERS
// ================================================================

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[9px] font-bold text-white bg-gray-800 px-2 py-0.5 rounded">{num}</span>
      <span className="text-sm font-bold text-gray-800">{title}</span>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-gray-900 text-green-400 text-[9px] font-mono px-3 py-2 rounded-lg overflow-x-auto whitespace-pre">
      {code}
    </div>
  );
}

function PatternCard({ title, where, code, children }: {
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

function Tab1Identite() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.1" title="Identite des 12 Bots C-Level" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Chaque bot a UN systeme d'identite complet: code, nom, role, icone, couleur, emoji, avatar, gradient.
        Voici les 12 bots officiels de la plateforme (BCC et BPO sont des intrus a retirer).
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5">
          <span className="text-sm font-bold text-white">Systeme d'identite — 12 Bots</span>
        </div>
        <div className="divide-y">
          {BOTS_12.map((bot) => {
            const Icon = bot.icon;
            const avatarSrc = BOT_AVATAR[bot.code];
            return (
              <div key={bot.code} className="px-4 py-2.5 flex items-center gap-3">
                {/* Avatar image */}
                {avatarSrc ? (
                  <img src={avatarSrc} alt={bot.nom} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 shrink-0" />
                ) : (
                  <div className={`w-8 h-8 rounded-full bg-${bot.color}-100 flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 text-${bot.color}-600`} />
                  </div>
                )}
                {/* Gradient swatch */}
                <div className={`w-14 h-6 rounded bg-gradient-to-r from-${bot.color}-600 to-${bot.color}-500 shrink-0`} />
                {/* Icon departement */}
                <Icon className={`h-4 w-4 text-${bot.color}-500 shrink-0`} />
                {/* Code */}
                <span className="text-xs font-bold text-gray-800 w-8 shrink-0">{bot.code}</span>
                {/* Nom */}
                <span className="text-xs text-gray-700 w-20 shrink-0">{bot.nom}</span>
                {/* Role */}
                <span className="text-[9px] text-gray-400 w-12 shrink-0">{bot.role}</span>
                {/* Emoji */}
                <span className="text-sm shrink-0">{bot.emoji}</span>
                {/* Dept */}
                <span className="text-[9px] text-gray-400 truncate">{bot.dept}</span>
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

      <SectionTitle num="A.4.1.2" title="Icones de menu par bot (sidebar gauche)" />
      <div className="grid grid-cols-6 gap-2">
        {BOTS_12.map((bot) => {
          const Icon = bot.icon;
          return (
            <Card key={bot.code} className="p-2 text-center">
              <Icon className={`h-4 w-4 text-${bot.color}-500 mx-auto mb-1`} />
              <div className="text-[9px] font-bold text-gray-700">{bot.code}</div>
              <div className="text-[9px] text-gray-400">{bot.role}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// 2. AVATARS
// ================================================================

function Tab2Avatars() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.2" title="Systeme d'avatars" />
      <div className="text-xs text-gray-600 leading-relaxed">
        4 tailles d'avatars utilisees dans la plateforme. Chaque bot a une image generee (v3).
      </div>

      <SectionTitle num="A.4.2.1" title="Galerie des 12 avatars" />
      <div className="grid grid-cols-4 gap-3">
        {BOTS_12.map((bot) => {
          const avatarSrc = BOT_AVATAR[bot.code];
          return (
            <Card key={bot.code} className="p-3 text-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={bot.nom} className="w-14 h-14 rounded-full object-cover ring-3 ring-gray-200 mx-auto shadow-md" />
              ) : (
                <div className={`w-14 h-14 rounded-full bg-${bot.color}-100 flex items-center justify-center mx-auto`}>
                  <bot.icon className={`h-6 w-6 text-${bot.color}-600`} />
                </div>
              )}
              <div className="text-xs font-bold text-gray-800 mt-2">{bot.nom}</div>
              <div className="text-[9px] text-gray-400">{bot.role} — {bot.code}</div>
            </Card>
          );
        })}
      </div>

      <SectionTitle num="A.4.2.2" title="4 tailles d'avatar" />
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

      <SectionTitle num="A.4.2.3" title="Avatar avec ring couleur bot" />
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

      <SectionTitle num="A.4.2.4" title="Formes d'avatar (inconsistance)" />
      <Card className="p-3 border-amber-200 bg-amber-50/50">
        <div className="text-xs text-gray-700 space-y-1">
          <p><strong>Departement detail:</strong> rounded-full (cercle)</p>
          <p><strong>Health/Diagnostics:</strong> rounded-lg (carre arrondi)</p>
          <p>A standardiser vers UNE forme unique.</p>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// 3. LAYOUTS
// ================================================================

function Tab3Layouts() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.3" title="8 types de layouts" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Chaque page utilise PageLayout + PageHeader. Voici les wireframes visuels de chaque layout actif.
      </div>

      {/* A.4.3.1 — Frame Master (global 3 panels) */}
      <PatternCard title="A.4.3.1 Frame Master — Shell 3 panneaux" where="TOUTE l'app (FrameMaster.tsx)">
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

      {/* A.4.3.2 — Grille 5xl */}
      <PatternCard title="A.4.3.2 GRILLE — maxWidth 5xl" where="Dashboard, TRG, Cockpit, Sante, Reglages">
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

      {/* A.4.3.3 — Contenu 4xl */}
      <PatternCard title="A.4.3.3 CONTENU — maxWidth 4xl" where="Bureau, Blueprint, Chantiers, Master GHML">
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

      {/* A.4.3.4 — Chat 2xl */}
      <PatternCard title="A.4.3.4 CHAT — maxWidth 2xl" where="LiveChat, Discussions">
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

      {/* A.4.3.5 — 3 Rooms (D-109) */}
      <PatternCard title="A.4.3.5 ROOMS — 3 layouts distincts (D-109)" where="BoardRoom, WarRoom, ThinkRoom">
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

      {/* A.4.3.6 — Focus */}
      <PatternCard title="A.4.3.6 FOCUS — Plein ecran dedie" where="FocusModeLayout (click → immersion)">
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

      {/* A.4.3.7 — Department Detail */}
      <PatternCard title="A.4.3.7 DEPARTEMENT — Gradient header + 4 tabs" where="DepartmentTourDeControle (12 depts)">
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

      {/* A.4.3.8 — Agent Settings */}
      <PatternCard title="A.4.3.8 REGLAGES AGENT — Banniere + 2 colonnes" where="AgentSettingsView (profil bot)">
        <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-sm">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 h-10 relative">
            <div className="absolute bottom-1 left-2 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/30 ring-1 ring-white/50" />
              <div><div className="h-1.5 bg-white/80 rounded w-12" /><div className="h-1 bg-white/40 rounded w-16 mt-0.5" /></div>
            </div>
          </div>
          <div className="p-2 grid grid-cols-2 gap-1.5">
            <div className="bg-white rounded border p-1.5 space-y-1"><div className="text-[7px] font-bold text-gray-400">Fiche Technique</div>{[1,2].map(i=><div key={i} className="h-1 bg-gray-100 rounded" />)}</div>
            <div className="bg-white rounded border p-1.5 space-y-1"><div className="text-[7px] font-bold text-gray-400">Trisociation</div><div className="grid grid-cols-3 gap-0.5">{["bg-blue-100","bg-violet-100","bg-amber-100"].map((c,i)=><div key={i} className={cn("h-3.5 rounded",c)} />)}</div></div>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 mt-1">Banniere 3:1 + 2 colonnes (technique | cognitif)</div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 4. HEADERS
// ================================================================

function Tab4Headers() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.4" title="17 types de headers dans le canvas central" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Inventaire complet de TOUS les headers utilises dans la zone centrale. Certains sont standardises (PageHeader), d'autres sont uniques a leur contexte.
      </div>

      {/* A.4.4.1 — PageHeader standard */}
      <PatternCard title="A.4.4.1 PageHeader — composant reutilisable" where="PageHeader.tsx → Bureau, Blueprint, Orbit9, Rooms, Master GHML (24 pages)">
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

      {/* A.4.4.2 — LiveChat Header */}
      <PatternCard title="A.4.4.2 LiveChat Header — barre contextuelle translucide" where="LiveChat.tsx — ZONE CHAT">
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-white/80 backdrop-blur-sm border-b px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <button className="text-gray-400 p-1 rounded-lg hover:bg-gray-100"><ChevronRight className="h-3.5 w-3.5 rotate-180" /></button>
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
        <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
          <div className="bg-blue-50 rounded p-1.5"><strong>Fond:</strong> bg-white/80 backdrop-blur-sm</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Ligne 2:</strong> nom bot + badge mode</div>
          <div className="bg-blue-50 rounded p-1.5"><strong>Droite:</strong> Park, Idees, Threads, +, LIVE</div>
        </div>
      </PatternCard>

      {/* A.4.4.3 — LiveChat Mode Bar */}
      <PatternCard title="A.4.4.3 Mode Bar — 8 modes de reflexion" where="LiveChat.tsx — sous le header chat (BLOC 2)">
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-white/60 border-b px-3 py-1.5">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: "brainstorm", label: "Brain", Icon: Brain, color: "text-amber-600 bg-amber-50 border-amber-200", active: false },
                { id: "crise", label: "Crise", Icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200", active: true },
                { id: "decision", label: "Decision", Icon: Scale, color: "text-indigo-600 bg-indigo-50 border-indigo-200", active: false },
                { id: "analyse", label: "Analyse", Icon: Search, color: "text-green-600 bg-green-50 border-green-200", active: false },
                { id: "strategie", label: "Strat.", Icon: Target, color: "text-emerald-600 bg-emerald-50 border-emerald-200", active: false },
                { id: "innovation", label: "Innov.", Icon: Sparkles, color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200", active: false },
                { id: "deep", label: "Deep", Icon: Brain, color: "text-cyan-600 bg-cyan-50 border-cyan-200", active: false },
                { id: "debat", label: "Debat", Icon: MessageSquare, color: "text-violet-600 bg-violet-50 border-violet-200", active: false },
              ].map((m) => (
                <button key={m.id} className={cn(
                  "flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border font-medium shrink-0",
                  m.active ? cn(m.color, "shadow-sm") : "bg-white border-gray-200 text-gray-500"
                )}>
                  <m.Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              ))}
            </div>
            {/* Branch progress indicator */}
            <div className="flex items-center gap-2 mt-1.5 px-1">
              <span className="text-[9px] font-semibold text-blue-600">Mode CRISE — Etape 2/4</span>
              <div className="flex-1 h-1 rounded-full bg-gray-200 max-w-[100px]">
                <div className="h-full rounded-full bg-blue-500 w-1/2" />
              </div>
              <div className="flex gap-1">
                <button className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 font-medium">Avancer</button>
                <button className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">Terminer</button>
                <button className="text-[9px] px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200 font-medium">Annuler</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          bg-white/60 — 8 pills colorees par mode + barre de progression quand un mode est lance (etapes sequentielles).
        </div>
      </PatternCard>

      {/* A.4.4.4 — Bot Roster Bar */}
      <PatternCard title="A.4.4.4 Bot Roster Bar — equipe active dans le chat" where="LiveChat.tsx — sous la ModeBar">
        <div className="border rounded-xl overflow-hidden shadow-sm p-3">
          <div className="flex items-center gap-2 py-2 px-3 bg-white/60 rounded-xl border border-gray-100">
            <Bot className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-[9px] text-gray-400 font-medium shrink-0">Equipe active :</span>
            <div className="flex gap-1.5 flex-wrap flex-1">
              {[
                { code: "BCO", emoji: "👔", name: "CarlOS", text: "text-blue-600", border: "border-blue-200" },
                { code: "BCT", emoji: "💻", name: "Thierry", text: "text-violet-600", border: "border-violet-200" },
              ].map((bot) => (
                <div key={bot.code} className={cn("flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white border", bot.text, bot.border)}>
                  <span>{bot.emoji}</span>
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
        <div className="mt-2 text-[9px] text-gray-500">
          Apparait quand CarlOS propose une equipe ou quand le user ajoute des bots manuellement. Max 3 bots. Pills avec emoji + nom + bouton retirer.
        </div>
      </PatternCard>

      {/* A.4.4.5 — Gradient Header Departement */}
      <PatternCard title="A.4.4.5 Gradient Header Departement — avatar + 4 tabs" where="DepartmentTourDeControle — 12 departements">
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 rounded-xl flex items-center gap-3">
          <img src={BOT_AVATAR["BCT"] || ""} alt="BCT" className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/30" />
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Technologie & Innovation</div>
            <div className="text-[9px] text-white/60">Thierry — CTO</div>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Vue d'ensemble</span>
            <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Pipeline</span>
            <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Documents</span>
            <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Diagnostics</span>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-500">
          Gradient couleur du bot + avatar arrondi-lg + 4 sub-tabs (actif = bg-white/20, inactif = text-white/60). 12 couleurs differentes.
        </div>
      </PatternCard>

      {/* A.4.4.6 — BlockHeader Dashboard */}
      <PatternCard title="A.4.4.6 BlockHeader — gradient dans les cards (margins negatives)" where="DashboardView.tsx — 12 blocs C-Level">
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

      {/* A.4.4.7 — Room headers */}
      <PatternCard title="A.4.4.7 Room Headers — PageHeader avec icone et couleur" where="BoardRoom, WarRoom, ThinkRoom">
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

      {/* A.4.4.8 — Room card headers */}
      <PatternCard title="A.4.4.8 Room Card Headers — gradient dans les sections internes" where="BoardRoom, WarRoom, ThinkRoom — cards internes">
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

      {/* A.4.4.9 — Agent Settings Banner */}
      <PatternCard title="A.4.4.9 Agent Settings Banner — standby image pleine largeur" where="AgentSettingsView.tsx — profil bot">
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

      {/* A.4.4.10 — KPI Card Header (Health) */}
      <PatternCard title="A.4.4.10 KPI Card Header — gradient + trend indicator" where="HealthView.tsx, CockpitView.tsx">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Score VITAA", value: "78", gradient: "from-blue-600 to-blue-500", trend: "up" },
            { label: "Chantiers actifs", value: "12", gradient: "from-emerald-600 to-emerald-500", trend: "up" },
            { label: "Risques detectes", value: "3", gradient: "from-red-600 to-red-500", trend: "down" },
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

      {/* A.4.4.11 — Diagnostic Card Header */}
      <PatternCard title="A.4.4.11 Diagnostic Card Header — gradient departement sans icone" where="DepartmentTourDeControle.tsx — onglet Diagnostics">
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

      {/* A.4.4.12 — Comparaison Bloc vs Diagnostic header */}
      <PatternCard title="A.4.4.12 Comparaison — Bloc header vs Diagnostic header" where="DepartmentTourDeControle.tsx">
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

      {/* A.4.4.13 — HealthView Tab Header (3 etats dynamiques) */}
      <PatternCard title="A.4.4.13 HealthView Tab Header — gradient dynamique 3 etats" where="HealthView.tsx — header principal (PAS un PageHeader!)">
        <div className="space-y-2">
          {[
            { label: "Etat General", sub: "Vue globale VITAA + Quick Wins", gradient: "from-orange-600 to-amber-500", Icon: Activity },
            { label: "Diagnostics", sub: "54 diagnostics par departement", gradient: "from-violet-600 to-purple-500", Icon: Search },
            { label: "Departements", sub: "Sante par departement", gradient: "from-emerald-600 to-teal-500", Icon: BarChart3 },
          ].map((tab, i) => (
            <div key={tab.label} className={cn("bg-gradient-to-r rounded-xl p-3 flex items-center gap-3", tab.gradient)}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <tab.Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{tab.label}</div>
                <div className="text-[9px] text-white/70">{tab.sub}</div>
              </div>
              <div className="flex gap-1">
                {["Etat", "Diag", "Depts"].map((t, j) => (
                  <span key={t} className={cn("px-2 py-1 text-[9px] font-medium rounded", j === i ? "bg-white/25 text-white" : "text-white/50")}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Card className="p-2 mt-2 border-amber-200 bg-amber-50/50">
          <div className="text-[9px] text-gray-700">
            <strong>Incoherence:</strong> Ce header est CUSTOM (pas PageHeader). Il change de couleur selon l'onglet actif. Le gradient, l'icone ET le sous-titre changent — 3 etats differents dans le meme composant.
          </div>
        </Card>
      </PatternCard>

      {/* A.4.4.14 — HealthView Diagnostic Card (avec avatar bot + gradient) */}
      <PatternCard title="A.4.4.14 HealthView Diagnostic Card — avatar bot + gradient bleu" where="HealthView.tsx — onglet Diagnostics (LE header bleu que Carl a vu)">
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

      {/* A.4.4.15 — Pastel Sub-section Headers */}
      <PatternCard title="A.4.4.15 Pastel Sub-section Headers — 4 variantes dans HealthView" where="HealthView.tsx — interieur des cards">
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

      {/* A.4.4.16 — AgentSettings Card Headers (10+ gradients) */}
      <PatternCard title="A.4.4.16 AgentSettings Card Headers — 10 gradients differents!" where="AgentSettingsView.tsx — CHAQUE section a son gradient">
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

      {/* A.4.4.17 — Trisociation Slot Mini-Header */}
      <PatternCard title="A.4.4.17 Trisociation Slot Mini-Header — 3 slots colores" where="AgentSettingsView.tsx — nested dans les trisociation cards">
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

      {/* A.4.4.18 — Synthese : carte de coherence */}
      <SectionTitle num="A.4.4.18" title="Synthese — le chaos des headers" />
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
            { num: "3", type: "Mode Bar", bg: "bg-white/60", padding: "px-3 py-1.5", usage: "Chat (modes)", ok: false },
            { num: "4", type: "Roster Bar", bg: "bg-white/60 border", padding: "py-2 px-3", usage: "Chat (equipe)", ok: false },
            { num: "5", type: "Dept Gradient", bg: "gradient bot-color", padding: "px-4 py-3", usage: "12 depts", ok: true },
            { num: "6", type: "BlockHeader (-mx)", bg: "gradient margins neg.", padding: "px-4 py-2.5", usage: "Dashboard", ok: false },
            { num: "7", type: "Room PageHeader", bg: "bg-white opaque", padding: "px-4 py-3", usage: "3 rooms", ok: true },
            { num: "8", type: "Room Card Header", bg: "gradient card", padding: "px-3 py-2", usage: "Rooms int.", ok: false },
            { num: "9", type: "Agent Banner", bg: "image 3:1", padding: "overlay", usage: "Settings", ok: false },
            { num: "10", type: "KPI Card", bg: "gradient + trend", padding: "px-3 py-2", usage: "Health", ok: false },
            { num: "11", type: "Diag Card (dept)", bg: "gradient sans icone", padding: "px-3 py-2.5", usage: "Dept diag", ok: false },
            { num: "12", type: "Bloc Header (dept)", bg: "gradient + icone", padding: "px-4 py-2.5", usage: "Dept blocs", ok: false },
            { num: "13", type: "Health Tab Header", bg: "3 etats dynamiques", padding: "p-4", usage: "Sante", ok: false },
            { num: "14", type: "Health Diag Card", bg: "gradient + avatar bot", padding: "px-3 py-2.5", usage: "Sante diag", ok: false },
            { num: "15", type: "Pastel Sub-header", bg: "from-xxx-50 clair", padding: "px-2.5 py-1.5", usage: "Sante int.", ok: false },
            { num: "16", type: "Agent Card Headers", bg: "12 gradients!", padding: "px-4 py-2.5", usage: "Settings", ok: false },
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
// 5. TABS
// ================================================================

function Tab5Tabs() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.5" title="3 patterns de tabs" />

      <PatternCard title="A.4.5.1 Tabs standard (fond clair)" where="Master GHML, Bureau, Chantiers, Blueprint">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <span className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg shadow-sm">Actif</span>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Inactif</span>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Inactif</span>
        </div>
      </PatternCard>

      <PatternCard title="A.4.5.2 Sub-tabs dans gradient (fond fonce)" where="DepartmentTourDeControle (12 depts)">
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 rounded-lg flex gap-1 w-fit">
          <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Actif</span>
          <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
          <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
        </div>
      </PatternCard>

      <PatternCard title="A.4.5.3 Tabs avec icones + bordure couleur" where="EspaceBureauView — 7 sections">
        <div className="flex gap-1">
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
            <Lightbulb className="h-3.5 w-3.5" /> Actif
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">
            <Briefcase className="h-3.5 w-3.5" /> Inactif
          </span>
        </div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 6. CARDS
// ================================================================

function Tab6Cards() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.6" title="8 types de cards" />

      <PatternCard title="A.4.6.1 KPI Card standard (Cockpit)" where="Cockpit, Dashboard, Departments">
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

      <PatternCard title="A.4.6.2 Card departement 5 colonnes (TRG)" where="DashboardView Tour de Controle">
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

      <PatternCard title="A.4.6.3 Card proposition bot (bordure gauche)" where="LiveChat, InnovationDemo, scenarios">
        <div className="space-y-2">
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-blue-400 bg-blue-50/30">
            <p className="text-sm text-gray-700 leading-relaxed">Message du bot avec bordure identitaire couleur...</p>
          </div>
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-violet-400 bg-violet-50/30">
            <p className="text-sm text-gray-700 leading-relaxed">Autre bot, autre couleur...</p>
          </div>
        </div>
      </PatternCard>

      <PatternCard title="A.4.6.4 Card gradient content (InnovationDemo)" where="Scenarios, Orbit9 sections">
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

      <PatternCard title="A.4.6.5 Card Cockpit bot (4 colonnes compactes)" where="CockpitView">
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

      <PatternCard title="A.4.6.6 Card Chantier (statut + chaleur)" where="MesChantiersView, sidebar droite">
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

      <PatternCard title="A.4.6.7 Card Board Room (avatar + citation)" where="BoardRoomView — 6 membres">
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

      <PatternCard title="A.4.6.8 Card Team Proposal (equipe 3 bots)" where="LiveChat — suggestion d'equipe">
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
    </div>
  );
}

// ================================================================
// 7. TYPO
// ================================================================

function Tab7Typo() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.7" title="Echelle typographique" />

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
// 8. BOUTONS
// ================================================================

function Tab8Boutons() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.8" title="Types de boutons" />

      <PatternCard title="A.4.8.1 Primary" where="CTA principales">
        <div className="flex gap-2">
          <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
            <ArrowRight className="h-3.5 w-3.5" /> Action
          </button>
          <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Valider
          </button>
        </div>
      </PatternCard>

      <PatternCard title="A.4.8.2 Pilule d'action (transitions/flows)" where="InnovationDemo, scenarios">
        <div className="flex gap-2">
          <button className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
            <ArrowRight className="h-3.5 w-3.5" /> Explorer
          </button>
          <button className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
            <Zap className="h-3.5 w-3.5" /> Activer
          </button>
        </div>
      </PatternCard>

      <PatternCard title="A.4.8.3 Actions LiveChat (6 boutons couleur)" where="Sous chaque bulle bot">
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

      <PatternCard title="A.4.8.4 Start CTA (gros bouton Room)" where="Rooms, Onboarding">
        <div className="flex gap-3">
          <button className="bg-amber-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-2">
            <Crown className="h-5 w-5" /> Lancer Board Room
          </button>
          <button className="bg-red-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Lancer War Room
          </button>
        </div>
      </PatternCard>

      <PatternCard title="A.4.8.5 Pilule completion (fin de flow)" where="Apres une action reussie">
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs text-emerald-700 font-medium">Mission completee avec succes</span>
        </div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 9. BADGES
// ================================================================

function Tab9Badges() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.9" title="Types de badges" />

      <PatternCard title="A.4.9.1 Badge status (outline)" where="Chantiers, missions, alerts">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-[9px] text-emerald-600 bg-emerald-50">Actif</Badge>
          <Badge variant="outline" className="text-[9px] text-amber-600 bg-amber-50">En cours</Badge>
          <Badge variant="outline" className="text-[9px] text-red-600 bg-red-50">Urgent</Badge>
          <Badge variant="outline" className="text-[9px] text-blue-600 bg-blue-50">Nouveau</Badge>
          <Badge variant="outline" className="text-[9px] text-gray-600 bg-gray-50">Archive</Badge>
        </div>
      </PatternCard>

      <PatternCard title="A.4.9.2 Badge type (fond colore)" where="Categories, tags departement">
        <div className="flex gap-2 flex-wrap">
          {BOTS_12.slice(0, 6).map((b) => (
            <span key={b.code} className={`bg-${b.color}-100 text-${b.color}-700 text-[9px] px-1.5 py-0.5 rounded font-medium`}>
              {b.dept.split(" ")[0]}
            </span>
          ))}
        </div>
      </PatternCard>

      <PatternCard title="A.4.9.3 Badge inline (dans gradient header)" where="Cards gradient, KPI headers">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 flex items-center gap-2 rounded-lg">
          <span className="text-sm font-bold text-white">Direction</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-blue-800">12 blocs</span>
        </div>
      </PatternCard>

      <PatternCard title="A.4.9.4 Badge mode reflexion (pill)" where="LiveChat header, bulles">
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
// 10. BULLES
// ================================================================

function Tab10Bulles() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.10" title="Bulles de chat — 14 variantes + footers" />
      <div className="text-xs text-gray-600 leading-relaxed">Tous les types de bulles actifs dans le LiveChat et CarlOSPresence.</div>

      {/* A.4.10.1 — Bot standard */}
      <PatternCard title="A.4.10.1 Bulle bot standard (bordure couleur)" where="LiveChat — chaque message bot">
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

      {/* A.4.10.2 — Utilisateur */}
      <PatternCard title="A.4.10.2 Bulle utilisateur (droite)" where="LiveChat — messages user">
        <div className="flex justify-end">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm">
            <div className="text-sm leading-relaxed">Comment optimiser mes ventes?</div>
          </div>
        </div>
      </PatternCard>

      {/* A.4.10.3 — Challenge */}
      <PatternCard title="A.4.10.3 Bulle Challenge (bordure rouge + branch)" where="LiveChat — bouton Challenger">
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

      {/* A.4.10.4 — Consultation */}
      <PatternCard title="A.4.10.4 Bulle Consultation (bordure violet + branch)" where="LiveChat — bouton Consulter">
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

      {/* A.4.10.5 — Synthese */}
      <PatternCard title="A.4.10.5 Bulle Synthese (ambre, shadow-md)" where="LiveChat — bouton Cristalliser">
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

      {/* A.4.10.6 — Coaching */}
      <PatternCard title="A.4.10.6 Bulle Coaching / System (bleue)" where="LiveChat — messages systeme">
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

      {/* A.4.10.7 — Team Proposal */}
      <PatternCard title="A.4.10.7 Bulle Team Proposal (equipe 3 bots)" where="LiveChat — CarlOS compose l'equipe">
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

      {/* A.4.10.8 — Thinking */}
      <PatternCard title="A.4.10.8 Animation de reflexion (thinking)" where="LiveChat — pendant la reponse">
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

      {/* A.4.10.9 — Sentinelle */}
      <PatternCard title="A.4.10.9 Bulle Sentinelle (alerte ambre)" where="LiveChat — anti-boucle / alerte">
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

      {/* A.4.10.10 — COMMAND progress */}
      <PatternCard title="A.4.10.10 COMMAND Progress (4 etapes pipeline)" where="LiveChat — mission COMMAND">
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

      {/* A.4.10.11 — CarlOS Presence */}
      <PatternCard title="A.4.10.11 CarlOS Presence (bulle d'aide contextuelle)" where="CarlOSPresence.tsx — toutes les pages">
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

      {/* A.4.10.12 — Multi-consult animation */}
      <PatternCard title="A.4.10.12 Multi-Consult (animation consultation)" where="LiveChat — consultation multi-bots">
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

      {/* A.4.10.13 — Roster bar */}
      <PatternCard title="A.4.10.13 Bot Roster Bar (equipe active)" where="LiveChat — sous les messages">
        <div className="flex items-center gap-2 py-2 px-3 bg-white/60 rounded-xl border border-gray-100">
          <Bot className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="text-[9px] text-gray-400 font-medium shrink-0">Equipe active :</span>
          <div className="flex gap-1.5">
            {BOTS_12.slice(0, 2).map(b => (
              <span key={b.code} className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white border text-${b.color}-600 border-${b.color}-200`}>
                {b.emoji} {b.nom} <span className="text-gray-300 ml-0.5">x</span>
              </span>
            ))}
          </div>
          <span className="text-[9px] text-blue-500 ml-auto">+ Bot</span>
        </div>
      </PatternCard>

      {/* A.4.10.14 — Footer structure */}
      <SectionTitle num="A.4.10.14" title="Structure Footer de bulle" />
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

      {/* A.4.10.15 — Action buttons rows */}
      <PatternCard title="A.4.10.15 Boutons d'action sous bulle (2 rangees)" where="LiveChat — sous le dernier message bot">
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

      {/* A.4.10.16 — Welcome suggestions */}
      <PatternCard title="A.4.10.16 Suggestions d'accueil (chat vide)" where="LiveChat — quand aucun message">
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
    </div>
  );
}

// ================================================================
// 11. INDICATEURS DE STATUT
// ================================================================

function Tab11Indicateurs() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.11" title="Indicateurs de statut et progression" />

      <PatternCard title="A.4.11.1 Chaleur / Triangle du Feu (3 etats)" where="Chantiers, sidebar droite, diagnostics">
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

      <PatternCard title="A.4.11.2 LIVE indicator (pastille verte)" where="LiveChat header">
        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-green-600 font-medium">LIVE</span>
        </div>
      </PatternCard>

      <PatternCard title="A.4.11.3 Online dot (presence bot)" where="DepartmentDetailView header">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Bot en ligne</span>
        </div>
      </PatternCard>

      <PatternCard title="A.4.11.4 Barres de progression (3 epaisseurs)" where="TRG, Orbit9, Cockpit">
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

      <PatternCard title="A.4.11.5 VITAA pilier (lettre + barre + score)" where="HealthView">
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

      <PatternCard title="A.4.11.6 CREDO phase indicator (5 dots)" where="Bulle footer LiveChat">
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

      <PatternCard title="A.4.11.7 COMMAND pipeline (4 etapes)" where="LiveChat — missions COMMAND">
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

      <PatternCard title="A.4.11.8 Etat vide (empty state)" where="Bureau, listes vides">
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-gray-100">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Aucun document</p>
          <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier document</p>
        </div>
      </PatternCard>

      <PatternCard title="A.4.11.9 Zone upload (drop zone)" where="Bureau documents">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 font-medium">Glissez vos fichiers ici ou cliquez</p>
        </div>
      </PatternCard>
    </div>
  );
}

// ================================================================
// 12. COULEURS
// ================================================================

function Tab12Couleurs() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.12" title="Palette couleurs complete" />

      <SectionTitle num="A.4.12.1" title="12 Bots — Gradients officiels" />
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

      <SectionTitle num="A.4.12.2" title="Couleurs systeme" />
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

      <SectionTitle num="A.4.12.3" title="Sidebar gauche — icones colorees" />
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

      <SectionTitle num="A.4.12.4" title="Separateur gradient (sidebar droite)" />
      <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mx-3 my-1 rounded-full" />
      <div className="text-[9px] text-gray-400 text-center">Separateur entre Video/Activity et InputBar</div>
    </div>
  );
}

// ================================================================
// 13. DOUBLONS
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

function Tab13Doublons() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.13" title="Doublons identifies" />
      <div className="text-xs text-gray-600 leading-relaxed">
        8 doublons — memes elements visuels avec des variantes differentes. Chaque doublon montre les variantes cote a cote.
      </div>

      <VisualDuplicate num="A.4.13.1" title="Tabs navigation — 3 variantes" recommendation="Unifier en 2 max: tabs fond clair + tabs dans gradient">
        <div className="space-y-3">
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Variante A — Fond clair (Master GHML, Bureau)</div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              <span className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg shadow-sm">Actif</span>
              <span className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">Inactif</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Variante B — Dans gradient (Departements)</div>
            <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 rounded-lg flex gap-1 w-fit">
              <span className="px-2 py-1 text-[9px] font-medium bg-white/20 text-white rounded">Actif</span>
              <span className="px-2 py-1 text-[9px] font-medium text-white/60 rounded">Inactif</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Variante C — Avec icones + bordure (Bureau)</div>
            <div className="flex gap-1 w-fit">
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                <Lightbulb className="h-3.5 w-3.5" /> Actif
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg">
                <Briefcase className="h-3.5 w-3.5" /> Inactif
              </span>
            </div>
          </div>
        </div>
      </VisualDuplicate>

      <VisualDuplicate num="A.4.13.2" title="Gradient headers — 2 tailles" recommendation="Grande partout, sauf cockpit compact">
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
      </VisualDuplicate>

      <VisualDuplicate num="A.4.13.3" title="Barres de progression — 3 epaisseurs" recommendation="Garder 2: epaisse (standard) et fine (grilles compactes)">
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
      </VisualDuplicate>

      <VisualDuplicate num="A.4.13.4" title="Forme avatar — cercle vs carre arrondi" recommendation="Standardiser vers UNE forme unique">
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Cercle (LiveChat, Board Room)</div>
            <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 mx-auto" />
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Carre arrondi (Health, Diagnostics)</div>
            <img src={BOT_AVATAR["BCO"] || ""} alt="CarlOS" className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/30 mx-auto" />
          </div>
        </div>
      </VisualDuplicate>

      <VisualDuplicate num="A.4.13.5" title="Avatars bot — 4 tailles" recommendation="Garder les 4, chaque contexte justifie sa taille">
        <div className="flex items-end gap-6">
          {[
            { label: "Grand (10)", size: "w-10 h-10" },
            { label: "Moyen (8)", size: "w-8 h-8" },
            { label: "Cockpit (6)", size: "w-6 h-6" },
            { label: "Inline (5)", size: "w-5 h-5" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">{s.label}</div>
              <img src={BOT_AVATAR["BCO"] || ""} alt="" className={cn(s.size, "rounded-full object-cover ring-2 ring-gray-200 mx-auto")} />
            </div>
          ))}
        </div>
      </VisualDuplicate>

      <VisualDuplicate num="A.4.13.6" title="Coins de cards — 2 arrondis" recommendation="rounded-xl pour gradient cards, rounded-lg pour le reste">
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
      </VisualDuplicate>

      <VisualDuplicate num="A.4.13.7" title="Espacement pages — 3 variantes" recommendation="TOUT par PageLayout, eliminer les marges manuelles">
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
      </VisualDuplicate>

      <VisualDuplicate num="A.4.13.8" title="Grilles — 4 formats" recommendation="OK tel quel, chaque format est justifie">
        <div className="space-y-3">
          {[
            { label: "4 colonnes — KPI", cols: 4, color: "blue", items: ["Revenus", "Clients", "Pipeline", "Marge"] },
            { label: "5 colonnes — TRG", cols: 5, color: "violet", items: ["Direction", "Tech", "Finance", "Marketing", "Ventes"] },
            { label: "3 colonnes — Comparaisons", cols: 3, color: "emerald", items: ["Option A", "Option B", "Option C"] },
            { label: "2 colonnes — Listes", cols: 2, color: "amber", items: ["Element 1", "Element 2"] },
          ].map((g) => (
            <div key={g.label}>
              <div className="text-[9px] font-bold text-gray-500 uppercase mb-1">{g.label}</div>
              <div className={`grid grid-cols-${g.cols} gap-3`}>
                {g.items.map((item) => (
                  <div key={item} className={`bg-${g.color}-50 border border-${g.color}-200 rounded-lg p-2 text-center text-[9px] text-${g.color}-700 font-medium`}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </VisualDuplicate>
    </div>
  );
}

// ================================================================
// 14. ECARTS
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

function Tab14Ecarts() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.14" title="Ecarts identifies" />
      <div className="text-xs text-gray-600 leading-relaxed">
        10 ecarts entre le design-system.md et ce qui est reellement code.
      </div>

      <div className="grid grid-cols-1 gap-3">
        <InconsistencyCard id="A.4.14.1" title="BCC + BPO fantomes" problem="~111 occurrences de 2 bots qui n'existent PAS dans la plateforme"
          pages={["simulation-data.ts", "CarlOSPresence.tsx", "types.ts", "agents.py", "LiveChat.tsx"]} fix="Sprint nettoyage dedie — supprimer TOUTES les references" />
        <InconsistencyCard id="A.4.14.2" title="Forme avatar mixte" problem="rounded-full (cercle) dans LiveChat/BoardRoom, rounded-lg (carre) dans Health/Diagnostics"
          pages={["DepartmentDetailView", "HealthView", "LiveChat", "BoardRoom"]} fix="Standardiser vers UNE forme (recommande: rounded-full)" />
        <InconsistencyCard id="A.4.14.3" title="Font sizes meta non uniformes" problem="Mix de text-[9px] et taille 10px pour le meme type de contenu"
          pages={["KPI cards", "Badges", "Cockpit", "DepartmentDetailView"]} fix="Choisir UN seul standard" />
        <InconsistencyCard id="A.4.14.4" title="Cards shadow inconsistantes" problem="Mix de shadow-sm, shadow-md, et aucune shadow"
          pages={["DashboardView", "CockpitView", "InnovationDemo"]} fix="shadow-sm par defaut, shadow-md au hover" />
        <InconsistencyCard id="A.4.14.5" title="Score bars 3 hauteurs" problem="h-1.5, h-2, h-2.5 utilises selon les pages"
          pages={["TRG", "Orbit9", "InnovationDemo", "HealthView"]} fix="2 tailles: h-2.5 (standard) et h-1.5 (compact)" />
        <InconsistencyCard id="A.4.14.6" title="Boutons CTA heterogenes" problem="Les gros boutons Room/CTA varient en padding et border-radius"
          pages={["BoardRoom", "WarRoom", "ThinkRoom"]} fix="UN pattern: px-8 py-4 rounded-2xl text-sm font-semibold shadow-lg" />
        <InconsistencyCard id="A.4.14.7" title="BCC/BPO dans palette design-system.md" problem="design-system.md liste rose pour BCC et fuchsia pour BPO"
          pages={["memory/design-system.md"]} fix="Retirer les 2 intrus, garder seulement les 12 vrais bots" />
        <InconsistencyCard id="A.4.14.8" title="Padding manuels legacy" problem="Certaines pages utilisent p-4/px-6 au lieu de PageLayout"
          pages={["TemplatesPage (fixe S44)", "sous-composants legacy"]} fix="Migrer vers PageLayout" />
        <InconsistencyCard id="A.4.14.9" title="Gradient direction variable" problem="Mix de to-r et to-br pour les headers"
          pages={["PageHeader (to-br icone)", "Cards (to-r header)"]} fix="to-r pour headers, to-br pour fonds d'icone uniquement" />
        <InconsistencyCard id="A.4.14.10" title="Border-t-[3px] legacy" problem="Vieux composants utilisent border-top au lieu de gradient header"
          pages={["Legacy cards pre-design-system"]} fix="Migrer vers gradient header standard" />
      </div>
    </div>
  );
}

// ================================================================
// 15. SKINS COGNITIFS
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

function Tab15Skins() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.15" title="Skins Cognitifs (Reglages Agent IA)" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Patterns visuels de la page AgentSettingsView — profil psychometrique, trisociation, modes decisionnels et catalogue de Ghosts.
      </div>

      {/* A.4.15.1 — Banner agent */}
      <PatternCard title="A.4.15.1 Banniere Agent (standby image 3:1)" where="AgentSettingsView — haut de page">
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

      {/* A.4.15.2 — Trisociation 3 slots */}
      <PatternCard title="A.4.15.2 Trisociation — 3 slots cognitifs" where="AgentSettingsView — colonne droite">
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

      {/* A.4.15.3 — Score bars psychometrie */}
      <PatternCard title="A.4.15.3 Profil Psychometrique (5 barres de score)" where="AgentSettingsView — colonne droite">
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

      {/* A.4.15.4 — Decision modes */}
      <PatternCard title="A.4.15.4 Modes Decisionnels (5 boutons toggle)" where="AgentSettingsView — colonne gauche">
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

      {/* A.4.15.5 — Competences cles */}
      <PatternCard title="A.4.15.5 Competences Cles (grille 2 colonnes)" where="AgentSettingsView — colonne gauche">
        <div className="grid grid-cols-2 gap-2">
          {["Vision strategique", "Prise de decision", "Gestion d'equipe", "Analyse financiere", "Communication", "Innovation produit"].map(comp => (
            <div key={comp} className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-700">{comp}</span>
            </div>
          ))}
        </div>
      </PatternCard>

      {/* A.4.15.6 — Ghost catalogue */}
      <PatternCard title="A.4.15.6 Catalogue des Ghosts (14 archetypes, 7 categories)" where="AgentSettingsView — bas de page">
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

      {/* A.4.15.7 — Style de communication */}
      <PatternCard title="A.4.15.7 Style de Communication" where="AgentSettingsView — colonne gauche">
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
// 16. MENU SIDEBAR GAUCHE
// ================================================================

function Tab16MenuGauche() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.16" title="Menu Sidebar Gauche — 6 sections" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Navigation principale — 6 sections collapsibles. Deux modes : expanded (labels) et collapsed (icones seulement).
      </div>

      {/* A.4.16.1 — Expanded vs Collapsed */}
      <PatternCard title="A.4.16.1 Deux modes — Expanded vs Collapsed" where="SidebarLeft (FrameMaster.tsx)">
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

      {/* A.4.16.2 — Les 6 sections */}
      <PatternCard title="A.4.16.2 Les 6 sections de navigation" where="SidebarLeft — composants dedies">
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

      {/* A.4.16.3 — Department item pattern */}
      <PatternCard title="A.4.16.3 Item departement — pattern complet" where="SectionEntreprise.tsx">
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

      {/* A.4.16.4 — Collapsible trigger */}
      <PatternCard title="A.4.16.4 Collapsible trigger — ouvert vs ferme" where="Toutes les sections sidebar">
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

      {/* A.4.16.5 — Separateur + bottom zone */}
      <PatternCard title="A.4.16.5 Separateurs et zone bottom" where="SidebarLeft — entre sections + bas">
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
// 17. CONSOLE SIDEBAR DROITE
// ================================================================

function Tab17ConsoleDroite() {
  return (
    <div className="space-y-4">
      <SectionTitle num="A.4.17" title="Console Sidebar Droite" />
      <div className="text-xs text-gray-600 leading-relaxed">
        Console de communication — CarlOsPulse, VideoCallWidget, InputBar, DiscussionsPanel avec systeme de chaleur.
      </div>

      {/* A.4.17.1 — Vue d'ensemble sidebar droite */}
      <PatternCard title="A.4.17.1 Structure complete — sidebar droite" where="SidebarRight (FrameMaster.tsx)">
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

      {/* A.4.17.2 — CarlOsPulse */}
      <PatternCard title="A.4.17.2 CarlOsPulse — 3 niveaux de severite" where="CarlOsPulse.tsx">
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

      {/* A.4.17.3 — VideoCallWidget */}
      <PatternCard title="A.4.17.3 VideoCallWidget — standby + en appel" where="VideoCallWidget.tsx">
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

      {/* A.4.17.4 — Gradient separator */}
      <PatternCard title="A.4.17.4 Gradient separator — signature visuelle" where="SidebarRight — entre VideoWidget et InputBar">
        <div className="space-y-3">
          <div>
            <div className="text-[9px] font-bold text-gray-400 mb-1.5">Gradient tricolore (standard)</div>
            <div className="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full" />
          </div>
          <CodeBlock code="h-[2px] bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" />
          <div className="text-[9px] text-gray-500">Separateur signature entre le widget video et la zone input — toujours present.</div>
        </div>
      </PatternCard>

      {/* A.4.17.5 — DiscussionsPanel 3 tabs */}
      <PatternCard title="A.4.17.5 DiscussionsPanel — 3 onglets avec couleurs" where="DiscussionsPanel.tsx">
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

      {/* A.4.17.6 — Chaleur / Heat system */}
      <PatternCard title="A.4.17.6 Systeme de chaleur — 3 etats pour chantiers" where="DiscussionsPanel.tsx — chaleur picker">
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

      {/* A.4.17.7 — InputBar compact */}
      <PatternCard title="A.4.17.7 InputBar — mode compact sidebar" where="InputBar.tsx">
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

      {/* A.4.17.8 — Sentinel alerts */}
      <PatternCard title="A.4.17.8 Alertes Sentinelle — 4 niveaux" where="ActiveAgentsPanel.tsx">
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

      {/* A.4.17.9 — Voice Streaming — etats detailles */}
      <PatternCard title="A.4.17.9 Voice Streaming — 4 etats LiveKit" where="VideoCallWidget.tsx + carlos_livekit_agent.py">
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

      {/* A.4.17.10 — CarlOS Avatar — mode premium */}
      <PatternCard title="A.4.17.10 CarlOS Avatar — video + audio bars" where="CarlOSAvatar.tsx">
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

      {/* A.4.17.11 — Conference Jitsi */}
      <PatternCard title="A.4.17.11 Conference Jitsi — mode multi-participants" where="VideoCallWidget.tsx — Jitsi overlay">
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

      {/* A.4.17.12 — RayBan Meta Vision */}
      <PatternCard title="A.4.17.12 Vision RayBan Meta — lunettes connectees" where="useGlassesEvents.ts + MobileCallFAB.tsx">
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

      {/* A.4.17.13 — YouTube Video Push */}
      <PatternCard title="A.4.17.13 YouTube Video Push — contexte multimedia" where="Zone 16:9 — VideoCallWidget / Canvas">
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
// MAIN COMPONENT
// ================================================================

export function MasterBibleVisuelleLivePage() {
  const [activeTab, setActiveTab] = useState<TabId>("identite");
  const { setActiveView } = useFrameMaster();

  const renderTab = () => {
    switch (activeTab) {
      case "identite": return <Tab1Identite />;
      case "avatars": return <Tab2Avatars />;
      case "layouts": return <Tab3Layouts />;
      case "headers": return <Tab4Headers />;
      case "tabs": return <Tab5Tabs />;
      case "cards": return <Tab6Cards />;
      case "typo": return <Tab7Typo />;
      case "boutons": return <Tab8Boutons />;
      case "badges": return <Tab9Badges />;
      case "bulles": return <Tab10Bulles />;
      case "indicateurs": return <Tab11Indicateurs />;
      case "couleurs": return <Tab12Couleurs />;
      case "doublons": return <Tab13Doublons />;
      case "ecarts": return <Tab14Ecarts />;
      case "skins": return <Tab15Skins />;
      case "menu-gauche": return <Tab16MenuGauche />;
      case "console-droite": return <Tab17ConsoleDroite />;
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
          title="A.4 Bible Visuelle Live"
          subtitle="Inventaire complet — 17 sections numerotees"
          onBack={() => setActiveView("bible-visuelle")}
          rightSlot={
            <div className="flex gap-1 flex-wrap">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-[9px] font-medium rounded-lg transition-colors",
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
      {renderTab()}
    </PageLayout>
  );
}

export default MasterBibleVisuelleLivePage;
