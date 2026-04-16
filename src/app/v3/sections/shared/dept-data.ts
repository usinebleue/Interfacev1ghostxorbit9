/**
 * dept-data.ts — Données département partagées entre les section views
 *
 * Extrait de BlueprintDepartement.tsx
 * Utilisé par: CockpitView, BlueprintView, DataRoomView, PlaybookStoreView, ConferenceAIView, ChantierView
 */

import {
  Crown, DollarSign, Cpu, Factory, Settings, TrendingUp,
  Megaphone, Compass, Users, ShieldCheck, Scale, Lightbulb,
} from "lucide-react";

// ═══ Couleurs département (source: BlueprintDepartement L405-419) ═══
export const DEPT_COLORS: Record<string, { gradient: string; text: string }> = {
  CEOB: { gradient: "from-blue-600 to-blue-500", text: "text-blue-600" },
  CTOB: { gradient: "from-violet-600 to-violet-500", text: "text-violet-600" },
  CFOB: { gradient: "from-emerald-600 to-emerald-500", text: "text-emerald-600" },
  CMOB: { gradient: "from-pink-600 to-pink-500", text: "text-pink-600" },
  CSOB: { gradient: "from-red-600 to-red-500", text: "text-red-600" },
  COOB: { gradient: "from-orange-600 to-orange-500", text: "text-orange-600" },
  CPOB: { gradient: "from-amber-600 to-amber-500", text: "text-amber-600" },
  CHROB: { gradient: "from-teal-600 to-teal-500", text: "text-teal-600" },
  CINOB: { gradient: "from-rose-600 to-rose-500", text: "text-rose-600" },
  CROB: { gradient: "from-amber-600 to-amber-500", text: "text-amber-700" },
  CLOB: { gradient: "from-indigo-600 to-indigo-500", text: "text-indigo-600" },
  CISOB: { gradient: "from-gray-600 to-gray-500", text: "text-gray-600" },
  ORBIT9: { gradient: "from-cyan-600 to-blue-500", text: "text-cyan-600" },
};

// ═══ Labels courts département (source: BlueprintDepartement L422-428) ═══
export const DEPT_SHORT_LABEL: Record<string, string> = {
  CEOB: "Direction", CROB: "Ventes", CFOB: "Finance",
  CMOB: "Marketing", CTOB: "Technologie", COOB: "Opérations",
  CPOB: "Production", CHROB: "RH", CINOB: "Innovation",
  CSOB: "Stratégie", CLOB: "Juridique", CISOB: "Sécurité",
  ORBIT9: "Collaboration Orbit⁹",
};

// ═══ Labels complets département (source: BlueprintDepartement L8560-8566) ═══
export const DEPT_FULL_LABEL: Record<string, string> = {
  CEOB: "de la direction", CROB: "des ventes", CFOB: "des finances",
  CMOB: "marketing", CTOB: "de la technologie", COOB: "des opérations",
  CPOB: "de la production", CHROB: "des ressources humaines",
  CINOB: "de l'innovation & R&D", CSOB: "de la stratégie",
  CLOB: "juridique", CISOB: "de la sécurité",
};

// ═══ Gradients département (source: BlueprintDepartement L8543-8556) ═══
export const DEPT_GRADIENT: Record<string, string> = {
  CEOB: "from-blue-700 to-blue-500",
  CFOB: "from-emerald-600 to-emerald-500",
  CTOB: "from-violet-600 to-violet-500",
  CPOB: "from-slate-700 to-slate-600",
  COOB: "from-orange-600 to-orange-500",
  CROB: "from-amber-600 to-amber-500",
  CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500",
  CHROB: "from-teal-600 to-teal-500",
  CISOB: "from-zinc-700 to-zinc-600",
  CLOB: "from-indigo-600 to-indigo-500",
  CINOB: "from-rose-600 to-rose-500",
};

// ═══ Icônes département dashboard (source: BlueprintDepartement L5797-5801) ═══
export const DEPT_DASH_ICON: Record<string, React.ElementType> = {
  CEOB: Crown, CFOB: DollarSign, CTOB: Cpu, CPOB: Factory, COOB: Settings,
  CROB: TrendingUp, CMOB: Megaphone, CSOB: Compass, CHROB: Users,
  CISOB: ShieldCheck, CLOB: Scale, CINOB: Lightbulb,
};

// ═══ Phase colors (source: BlueprintDepartement L8495-8504) ═══
// PhaseKey importé depuis core/types.ts (source unique)
import type { PhaseKey } from "../../core/types";
export type { PhaseKey };

export const PHASE_COLORS: Record<PhaseKey, { label: string; badge: string; dot: string }> = {
  discussion:   { label: "Discussion",   badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  attention:    { label: "Attention",    badge: "bg-red-100 text-red-700",       dot: "bg-red-500" },
  moderation:   { label: "Modération",   badge: "bg-pink-100 text-pink-700",     dot: "bg-pink-500" },
  observation:  { label: "Observation",  badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  reflexion:    { label: "Réflexion",    badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  creation:     { label: "Conception",   badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  execution:    { label: "Exécution",    badge: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  retroaction:  { label: "Rétroaction",  badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

// ═══ Alias backward-compat ═══
export const DEPT_LABELS = DEPT_SHORT_LABEL;
export const DEPT_ICONS = DEPT_DASH_ICON;

// ═══ BOT_AVATAR_MAP — Avatars profil par bot (source: BlueprintDepartement L1947-1960) ═══
export const BOT_AVATAR_MAP: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-profil-v3.png",
  CTOB: "/agents/generated/cto-thierry-profil-v3.png",
  CFOB: "/agents/generated/cfo-francois-profil-v3.png",
  CMOB: "/agents/generated/cmo-martine-profil-v3.png",
  CSOB: "/agents/generated/cso-sophie-profil-v3.png",
  COOB: "/agents/generated/coo-olivier-profil-v3.png",
  CPOB: "/agents/generated/factory-bot-profil-v3.png",
  CHROB: "/agents/generated/chro-helene-profil-v3.png",
  CINOB: "/agents/generated/cino-ines-profil-v3.png",
  CROB: "/agents/generated/cro-raphael-profil-v3.png",
  CLOB: "/agents/generated/clo-louise-profil-v3.png",
  CISOB: "/agents/generated/ciso-secbot-profil-v3.png",
};

// ═══ BOT_DISPLAY — Nom, rôle, département par bot (source: BlueprintDepartement L1962-1975) ═══
export const BOT_DISPLAY: Record<string, { name: string; role: string; dept: string }> = {
  CEOB: { name: "CarlOS", role: "CEO", dept: "Direction" },
  CTOB: { name: "Tim", role: "CTO", dept: "Technologie & Innovation" },
  CFOB: { name: "Frank", role: "CFO", dept: "Finance & Tresorerie" },
  CMOB: { name: "Mathilde", role: "CMO", dept: "Marketing & Croissance" },
  CSOB: { name: "Simone", role: "CSO", dept: "Strategie & Ventes" },
  COOB: { name: "Olivier", role: "COO", dept: "Operations & Production" },
  CPOB: { name: "Paco", role: "CPO", dept: "Automatisation & Usine" },
  CHROB: { name: "Helene", role: "CHRO", dept: "Ressources Humaines" },
  CINOB: { name: "Ines", role: "CINO", dept: "Innovation & R&D" },
  CROB: { name: "Rich", role: "CRO", dept: "Revenus & Croissance" },
  CLOB: { name: "Loulou", role: "CLO", dept: "Juridique & Conformite" },
  CISOB: { name: "Sebastien", role: "CISO", dept: "Securite & Cyber" },
};

// ═══ OTHER_BOTS — 11 bots (sans CEOB) pour les vues consolidées Direction ═══
export const OTHER_BOTS: { code: string; label: string; bot: string; short: string; gradient: string }[] = [
  { code: "CTOB", label: "Technologie", bot: "Tim", short: "CTO", gradient: "from-violet-600 to-violet-500" },
  { code: "CFOB", label: "Finance", bot: "Frank", short: "CFO", gradient: "from-emerald-600 to-emerald-500" },
  { code: "CMOB", label: "Marketing", bot: "Mathilde", short: "CMO", gradient: "from-pink-600 to-pink-500" },
  { code: "CSOB", label: "Strategie", bot: "Simone", short: "CSO", gradient: "from-red-600 to-red-500" },
  { code: "COOB", label: "Operations", bot: "Olivier", short: "COO", gradient: "from-orange-600 to-orange-500" },
  { code: "CPOB", label: "Production", bot: "Paco", short: "CPO", gradient: "from-amber-600 to-amber-500" },
  { code: "CHROB", label: "RH", bot: "Helene", short: "CHRO", gradient: "from-teal-600 to-teal-500" },
  { code: "CINOB", label: "Innovation", bot: "Ines", short: "CINO", gradient: "from-rose-600 to-rose-500" },
  { code: "CROB", label: "Ventes", bot: "Rich", short: "CRO", gradient: "from-amber-600 to-amber-500" },
  { code: "CLOB", label: "Legal", bot: "Loulou", short: "CLO", gradient: "from-indigo-600 to-indigo-500" },
  { code: "CISOB", label: "Securite", bot: "Sebastien", short: "CISO", gradient: "from-gray-600 to-gray-500" },
];
