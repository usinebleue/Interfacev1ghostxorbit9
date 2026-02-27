/**
 * BotPresenceIndicator.tsx — Photo du bot actif + nom + subtitle
 * Supporte mode dark (fond Midnight Blue)
 * Sprint A — Frame Master V2
 */

import type { BotInfo } from "../../api/types";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";
import { Briefcase } from "lucide-react";

interface Props {
  bot: BotInfo | null;
  dark?: boolean;
}

export function BotPresenceIndicator({ bot, dark = false }: Props) {
  if (!bot) {
    return (
      <div className="flex items-center gap-2.5 text-sm">
        <img src="/agents/ceo-carlos.png" alt="CarlOS" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30" />
        <span className={dark ? "font-semibold text-white" : "font-semibold"}>CarlOS</span>
        <span className={dark ? "text-xs text-white/60" : "text-xs text-muted-foreground"}>— Agent AI manufacturier</span>
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
      </div>
    );
  }

  const avatar = BOT_AVATAR[bot.code];
  const subtitle = BOT_SUBTITLE[bot.code] || bot.titre;

  return (
    <div className="flex items-center gap-2.5">
      {avatar ? (
        <img src={avatar} alt={bot.nom} className={`w-8 h-8 rounded-full object-cover ring-2 ${dark ? "ring-white/30" : "ring-gray-200"}`} />
      ) : (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ${dark ? "bg-white/10 ring-white/30" : "bg-gray-100 ring-gray-200"}`}>
          <Briefcase className={`h-4 w-4 ${dark ? "text-white/70" : "text-gray-500"}`} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${dark ? "text-white" : ""}`}>{bot.nom}</span>
        <span className={`text-xs ${dark ? "text-white/60" : "text-muted-foreground"}`}>— {subtitle}</span>
        {bot.actif && (
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        )}
      </div>
    </div>
  );
}
