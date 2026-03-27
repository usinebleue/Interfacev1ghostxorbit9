/**
 * BotBadgeFull.tsx — Badge unifie "Tim — CTO" avec couleur du bot
 * Remplace tous les badges bot inline dans DiscussionView et DocumentsUnifie
 */

import { cn } from "../../../../components/ui/utils";
import { BOT_NAME, BOT_ROLE } from "../../../api/types";

const BOT_DOT_COLORS: Record<string, string> = {
  CEOB: "bg-blue-500", CTOB: "bg-violet-500", CFOB: "bg-emerald-500",
  CMOB: "bg-pink-500", CSOB: "bg-red-500", COOB: "bg-orange-500",
  CPOB: "bg-slate-500", CHROB: "bg-teal-500", CINOB: "bg-rose-500",
  CROB: "bg-amber-500", CLOB: "bg-indigo-500", CISOB: "bg-zinc-500",
};

const BOT_BADGE_COLORS: Record<string, string> = {
  CEOB: "text-blue-700 bg-blue-50 border-blue-200",
  CTOB: "text-violet-700 bg-violet-50 border-violet-200",
  CFOB: "text-emerald-700 bg-emerald-50 border-emerald-200",
  CMOB: "text-pink-700 bg-pink-50 border-pink-200",
  CSOB: "text-red-700 bg-red-50 border-red-200",
  COOB: "text-orange-700 bg-orange-50 border-orange-200",
  CPOB: "text-slate-700 bg-slate-50 border-slate-200",
  CHROB: "text-teal-700 bg-teal-50 border-teal-200",
  CINOB: "text-rose-700 bg-rose-50 border-rose-200",
  CROB: "text-amber-700 bg-amber-50 border-amber-200",
  CLOB: "text-indigo-700 bg-indigo-50 border-indigo-200",
  CISOB: "text-zinc-700 bg-zinc-50 border-zinc-200",
};

interface BotBadgeFullProps {
  botCode: string;
  /** Compact mode: just the name without role */
  compact?: boolean;
  className?: string;
}

export function BotBadgeFull({ botCode, compact, className }: BotBadgeFullProps) {
  const name = BOT_NAME[botCode] || botCode;
  const role = BOT_ROLE[botCode] || "";
  const dotColor = BOT_DOT_COLORS[botCode] || "bg-gray-400";
  const badgeColor = BOT_BADGE_COLORS[botCode] || "text-gray-700 bg-gray-50 border-gray-200";

  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-medium", badgeColor, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      {compact ? name : `${name} — ${role}`}
    </span>
  );
}
