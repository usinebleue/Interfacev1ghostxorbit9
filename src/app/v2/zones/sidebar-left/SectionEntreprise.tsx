/**
 * SectionEntreprise.tsx — "Mon Entreprise" — 12 departements (wireframe p.2)
 * Direction, Finance, Technologie, Production, Operation, Vente, Marketing,
 * Strategie, RH, Securite, Legal, Innovation
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import { ChevronDown, ChevronRight, Briefcase, DollarSign, Cpu, Factory, Settings, TrendingUp, Megaphone, Target, Users, Shield, Scale, Lightbulb } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { useBots } from "../../api/hooks";
import type { BotInfo } from "../../api/types";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { cn } from "../../../components/ui/utils";

interface Props {
  collapsed: boolean;
}

// Departements fixes du wireframe, mappes au code bot correspondant
const DEPARTEMENTS: { label: string; icon: React.ElementType; code: string }[] = [
  { label: "Direction", icon: Briefcase, code: "BCO" },
  { label: "Finance", icon: DollarSign, code: "BCF" },
  { label: "Technologie", icon: Cpu, code: "BCT" },
  { label: "Production", icon: Factory, code: "BFA" },
  { label: "Operation", icon: Settings, code: "BOO" },
  { label: "Vente", icon: TrendingUp, code: "BRO" },
  { label: "Marketing", icon: Megaphone, code: "BCM" },
  { label: "Strategie", icon: Target, code: "BCS" },
  { label: "RH", icon: Users, code: "BHR" },
  { label: "Securite", icon: Shield, code: "BSE" },
  { label: "Legal", icon: Scale, code: "BLE" },
  { label: "Innovation", icon: Lightbulb, code: "BPO" },
];

// Couleur identitaire par bot — ligne sous le departement actif
const BOT_COLOR: Record<string, string> = {
  BCO: "bg-blue-600",
  BCF: "bg-emerald-600",
  BCT: "bg-violet-600",
  BFA: "bg-slate-600",
  BOO: "bg-orange-600",
  BRO: "bg-amber-600",
  BCM: "bg-pink-600",
  BCS: "bg-red-600",
  BHR: "bg-teal-600",
  BSE: "bg-zinc-700",
  BLE: "bg-indigo-600",
  BPO: "bg-fuchsia-600",
};

// Couleur identitaire pour les icones sidebar (Design System: sidebar = couleur)
const BOT_ICON_COLOR: Record<string, string> = {
  BCO: "text-blue-600",
  BCF: "text-emerald-600",
  BCT: "text-violet-600",
  BFA: "text-slate-600",
  BOO: "text-orange-600",
  BRO: "text-amber-600",
  BCM: "text-pink-600",
  BCS: "text-red-600",
  BHR: "text-teal-600",
  BSE: "text-zinc-600",
  BLE: "text-indigo-600",
  BPO: "text-fuchsia-600",
};

// Notifications simulees par departement (taches completees, alertes, approbations)
// TODO: brancher sur l'API quand le backend sera pret
const DEPT_NOTIFICATIONS: Record<string, number> = {
  BCO: 3,   // 3 decisions en attente
  BCF: 1,   // 1 rapport a approuver
  BCT: 2,   // 2 deploiements termines
  BOO: 5,   // 5 alertes production
  BRO: 2,   // 2 deals a valider
  BHR: 1,   // 1 embauche a confirmer
  BSE: 4,   // 4 alertes securite
};

export function SectionEntreprise({ collapsed }: Props) {
  const [open, setOpen] = useState(true);
  const { bots } = useBots();
  const { activeBotCode, setActiveBot, setActiveView } = useFrameMaster();

  // Indexer les bots par code pour lookup rapide
  const botsByCode: Record<string, BotInfo> = {};
  for (const bot of bots) {
    botsByCode[bot.code] = bot;
  }

  const handleSelect = (code: string | null) => {
    if (!code) return;
    const bot = botsByCode[code];
    // Fallback: creer un BotInfo minimal si l'API n'a pas repondu
    const dept = DEPARTEMENTS.find((d) => d.code === code);
    const botInfo: BotInfo = bot || {
      code,
      nom: dept?.label || code,
      titre: dept?.label || code,
      role: dept?.label || "",
      departement: dept?.label || "",
      emoji: "",
      ghosts: [],
      formule: "",
      actif: true,
    };
    setActiveBot(botInfo);
    setActiveView("department");
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Briefcase className="h-3 w-3 mx-auto" />
        </div>
        {DEPARTEMENTS.map((dept) => {
          const Icon = dept.icon;
          const notifCount = DEPT_NOTIFICATIONS[dept.code] || 0;
          const isActive = dept.code && activeBotCode === dept.code;
          const botColor = BOT_COLOR[dept.code] || "bg-gray-400";
          const iconColor = BOT_ICON_COLOR[dept.code] || "text-muted-foreground";
          return (
            <div key={dept.label}>
              <button
                onClick={() => handleSelect(dept.code)}
                className={cn(
                  "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors relative",
                  isActive && "bg-accent"
                )}
                title={dept.label}
              >
                <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {notifCount}
                  </span>
                )}
              </button>
              {isActive && (
                <div className={cn("h-0.5 mx-1 rounded-full", botColor)} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wide">
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Mon Entreprise
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
          {DEPARTEMENTS.length}
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {DEPARTEMENTS.map((dept) => {
            const bot = dept.code ? botsByCode[dept.code] : null;
            const isActive = dept.code && activeBotCode === dept.code;
            const isLive = bot?.actif;
            const Icon = dept.icon;
            const notifCount = DEPT_NOTIFICATIONS[dept.code] || 0;

            const botColor = BOT_COLOR[dept.code] || "bg-gray-400";
            const iconColor = BOT_ICON_COLOR[dept.code] || "text-muted-foreground";

            return (
              <div key={dept.label}>
                <button
                  onClick={() => handleSelect(dept.code)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                    isActive && "bg-accent font-medium"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
                  <span className="flex-1 text-left truncate">{dept.label}</span>
                  {notifCount > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shrink-0">
                      {notifCount}
                    </span>
                  )}
                  {isLive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  ) : dept.code ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  ) : null}
                </button>
                {/* Ligne couleur agent sous le departement actif */}
                {isActive && (
                  <div className={cn("h-0.5 mx-2 rounded-full", botColor)} />
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
