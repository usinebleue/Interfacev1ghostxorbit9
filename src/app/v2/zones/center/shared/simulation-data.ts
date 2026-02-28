/**
 * simulation-data.ts — Donnees partagees (BOT_COLORS, USER_AVATAR, REFLECTION_MODES)
 * Sprint A — Frame Master V2
 */

import {
  Eye,
  Swords,
  Lightbulb,
  Target,
  Sparkles,
  CheckCircle2,
  Zap,
  Brain,
} from "lucide-react";
import type { BotColorConfig, ReflectionMode } from "./simulation-types";

// ========== BOT C-LEVEL COLORS (14 bots) ==========

export const BOT_COLORS: Record<string, BotColorConfig> = {
  BCO: { bg: "bg-blue-600", bgLight: "bg-blue-50", text: "text-blue-700", border: "border-blue-400", ring: "ring-blue-300", dot: "bg-blue-500", emoji: "\u{1F454}", name: "CarlOS", role: "CEO", avatar: "/agents/ceo-carlos.png" },
  BCT: { bg: "bg-violet-600", bgLight: "bg-violet-50", text: "text-violet-700", border: "border-violet-400", ring: "ring-violet-300", dot: "bg-violet-500", emoji: "\u{1F4BB}", name: "Thomas", role: "CTO", avatar: "/agents/cto-thomas.png" },
  BCF: { bg: "bg-emerald-600", bgLight: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-400", ring: "ring-emerald-300", dot: "bg-emerald-500", emoji: "\u{1F4B0}", name: "Fran\u00e7ois", role: "CFO", avatar: "/agents/cfo-francois.png" },
  BCM: { bg: "bg-pink-600", bgLight: "bg-pink-50", text: "text-pink-700", border: "border-pink-400", ring: "ring-pink-300", dot: "bg-pink-500", emoji: "\u{1F4E3}", name: "Sofia", role: "CMO", avatar: "/agents/cmo-sofia.png" },
  BCS: { bg: "bg-red-600", bgLight: "bg-red-50", text: "text-red-700", border: "border-red-400", ring: "ring-red-300", dot: "bg-red-500", emoji: "\u{1F3AF}", name: "Marc", role: "CSO", avatar: "/agents/cso-marc.png" },
  BOO: { bg: "bg-orange-600", bgLight: "bg-orange-50", text: "text-orange-700", border: "border-orange-400", ring: "ring-orange-300", dot: "bg-orange-500", emoji: "\u2699\uFE0F", name: "Lise", role: "COO", avatar: "/agents/coo-lise.png" },
  BFA: { bg: "bg-slate-600", bgLight: "bg-slate-50", text: "text-slate-700", border: "border-slate-400", ring: "ring-slate-300", dot: "bg-slate-500", emoji: "\u{1F3ED}", name: "FactoryBot", role: "Factory", avatar: "" },
  BHR: { bg: "bg-teal-600", bgLight: "bg-teal-50", text: "text-teal-700", border: "border-teal-400", ring: "ring-teal-300", dot: "bg-teal-500", emoji: "\u{1F91D}", name: "David", role: "CHRO", avatar: "/agents/David - CHRO.png" },
  BIO: { bg: "bg-cyan-600", bgLight: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-400", ring: "ring-cyan-300", dot: "bg-cyan-500", emoji: "\u{1F4CA}", name: "H\u00e9l\u00e8ne", role: "CIO", avatar: "/agents/Helene - CIO.png" },
  BCC: { bg: "bg-rose-600", bgLight: "bg-rose-50", text: "text-rose-700", border: "border-rose-400", ring: "ring-rose-300", dot: "bg-rose-500", emoji: "\u{1F4E2}", name: "\u00c9milie", role: "CCO", avatar: "/agents/CCO - Emilie2.png" },
  BPO: { bg: "bg-fuchsia-600", bgLight: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-400", ring: "ring-fuchsia-300", dot: "bg-fuchsia-500", emoji: "\u{1F680}", name: "Alex", role: "CPO", avatar: "/agents/CPO - Alex2.png" },
  BRO: { bg: "bg-amber-600", bgLight: "bg-amber-50", text: "text-amber-700", border: "border-amber-400", ring: "ring-amber-300", dot: "bg-amber-500", emoji: "\u{1F4C8}", name: "Julien", role: "CRO", avatar: "/agents/CRO - Julien2.png" },
  BLE: { bg: "bg-indigo-600", bgLight: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-400", ring: "ring-indigo-300", dot: "bg-indigo-500", emoji: "\u2696\uFE0F", name: "Isabelle", role: "Legal", avatar: "/agents/CLO - Isabelle3.png" },
  BSE: { bg: "bg-zinc-700", bgLight: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-400", ring: "ring-zinc-300", dot: "bg-zinc-500", emoji: "\u{1F6E1}\uFE0F", name: "SecBot", role: "CISO", avatar: "" },
};

export const USER_AVATAR = "/agents/carl-fugere.jpg";

// ========== REFLECTION MODES (8+1) ==========

export const REFLECTION_MODES: ReflectionMode[] = [
  { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-300" },
  { id: "debat", label: "D\u00e9bat", icon: Swords, bg: "bg-red-100", text: "text-red-700", ring: "ring-red-300" },
  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-300" },
  { id: "strategie", label: "Strat\u00e9gie", icon: Target, bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-300" },
  { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-700", ring: "ring-pink-300" },
  { id: "decision", label: "D\u00e9cision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700", ring: "ring-green-300" },
  { id: "crise", label: "Crise", icon: Zap, bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-300" },
  { id: "deep", label: "Deep", icon: Brain, bg: "bg-indigo-100", text: "text-indigo-700", ring: "ring-indigo-300" },
];

// ========== SOURCE ICON CONFIG ==========

import { FileText, BarChart3, Database } from "lucide-react";

export const SOURCE_ICONS = {
  doc: { icon: FileText, color: "text-blue-500" },
  stat: { icon: BarChart3, color: "text-emerald-500" },
  data: { icon: Database, color: "text-purple-500" },
};
