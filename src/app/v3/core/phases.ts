/**
 * phases.ts — Configuration des 8 phases AMORCER + couleurs identitaires
 *
 * COPIE EXACTE de PC depuis SimAmorcer.tsx L183-192
 * RÈGLE: JAMAIS redéfinir les couleurs de phase ailleurs.
 */

import {
  MessageCircle,
  AlertTriangle,
  Scale,
  Eye,
  Brain,
  Hammer,
  Rocket,
  BarChart3,
  Repeat,
} from "lucide-react";
import type { PhaseKey, PhaseStyle } from "./types";

// ═══ Couleurs Usine Bleue — identité visuelle ═══
export const UB_BLUE = "#073E5A";
export const UB_CYAN = "#00B4D8";

// ═══ Phase Config — source unique (ex-PC de SimAmorcer) ═══
export const PHASE_CONFIG: Record<PhaseKey, PhaseStyle> = {
  discussion:  { label: "Discussion",   letter: "D", Icon: MessageCircle,  dot: "bg-sky-500",     badge: "bg-sky-100 text-sky-700",         bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     btnBg: "bg-sky-50",     btnText: "text-sky-700",     btnBorder: "border-sky-200",     btnHover: "hover:bg-sky-100",     line: "bg-sky-500" },
  attention:   { label: "Attention",     letter: "A", Icon: AlertTriangle,  dot: "bg-red-500",     badge: "bg-red-100 text-red-700",         bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     btnBg: "bg-red-50",     btnText: "text-red-700",     btnBorder: "border-red-200",     btnHover: "hover:bg-red-100",     line: "bg-red-500" },
  moderation:  { label: "Modération",    letter: "M", Icon: Scale,          dot: "bg-pink-500",    badge: "bg-pink-100 text-pink-700",       bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    btnBg: "bg-pink-50",    btnText: "text-pink-700",    btnBorder: "border-pink-200",    btnHover: "hover:bg-pink-100",    line: "bg-pink-500" },
  observation: { label: "Observation",   letter: "O", Icon: Eye,            dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700",       bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    btnBg: "bg-blue-50",    btnText: "text-blue-700",    btnBorder: "border-blue-200",    btnHover: "hover:bg-blue-100",    line: "bg-blue-500" },
  reflexion:   { label: "Réflexion",     letter: "R", Icon: Brain,          dot: "bg-orange-500",  badge: "bg-orange-100 text-orange-700",   bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  btnBg: "bg-orange-50",  btnText: "text-orange-700",  btnBorder: "border-orange-200",  btnHover: "hover:bg-orange-100",  line: "bg-orange-500" },
  creation:    { label: "Conception",    letter: "C", Icon: Hammer,         dot: "bg-yellow-500",  badge: "bg-yellow-100 text-yellow-700",   bg: "bg-yellow-50",  border: "border-yellow-200",  text: "text-yellow-700",  btnBg: "bg-yellow-50",  btnText: "text-yellow-700",  btnBorder: "border-yellow-200",  btnHover: "hover:bg-yellow-100",  line: "bg-yellow-500" },
  execution:   { label: "Exécution",     letter: "E", Icon: Rocket,         dot: "bg-green-500",   badge: "bg-green-100 text-green-700",     bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700",   btnBg: "bg-green-50",   btnText: "text-green-700",   btnBorder: "border-green-200",   btnHover: "hover:bg-green-100",   line: "bg-green-500" },
  retroaction: { label: "Rétroaction",   letter: "R", Icon: BarChart3,      dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", btnBg: "bg-emerald-50", btnText: "text-emerald-700", btnBorder: "border-emerald-200", btnHover: "hover:bg-emerald-100", line: "bg-emerald-500" },
  operations:  { label: "Opérations",    letter: "P", Icon: Repeat,         dot: "bg-cyan-500",    badge: "bg-cyan-100 text-cyan-700",       bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    btnBg: "bg-cyan-50",    btnText: "text-cyan-700",    btnBorder: "border-cyan-200",    btnHover: "hover:bg-cyan-100",    line: "bg-cyan-500" },
};
