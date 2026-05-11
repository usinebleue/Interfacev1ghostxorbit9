/**
 * MobileHeaderV3.tsx — Header compact mobile V3
 * Affiche avatar bot actif + nom + role + badge phase CREDO
 * Pattern copie de v2/layout/FrameMasterMobile.tsx header
 */

import { useAmorcer } from "./AmorcerContext";
import { BOT_AVATAR, BOT_NAME, BOT_ROLE } from "../v2/api/types";
import { cn } from "../components/ui/utils";

const CREDO_LABELS: Record<string, string> = {
  C: "Connecter",
  R: "Rechercher",
  E: "Exposer",
  D: "Demontrer",
  O: "Obtenir",
};

export function MobileHeaderV3() {
  const { activeBotCode, credoPhase } = useAmorcer();
  const name = BOT_NAME[activeBotCode] || "CarlOS";
  const role = BOT_ROLE[activeBotCode] || "CEO";
  const avatar = BOT_AVATAR[activeBotCode];
  const credoLabel = CREDO_LABELS[credoPhase];

  return (
    <header className="h-12 border-b flex items-center px-3 gap-2 shrink-0 bg-white">
      {/* Avatar bot */}
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-7 w-7 rounded-full object-cover"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
          {name[0]}
        </div>
      )}

      {/* Nom + role */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-sm font-medium truncate">{name}</span>
        <span className="text-[10px] text-muted-foreground">{role}</span>
      </div>

      {/* Badge phase CREDO */}
      {credoLabel && (
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
          "bg-blue-50 text-blue-600"
        )}>
          {credoPhase}
        </span>
      )}
    </header>
  );
}
