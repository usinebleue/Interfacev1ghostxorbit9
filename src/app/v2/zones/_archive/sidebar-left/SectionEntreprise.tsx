/**
 * SectionEntreprise.tsx — "Mon Entreprise" — 12 departements (wireframe p.2)
 * Direction, Finance, Technologie, Production, Operation, Vente, Marketing,
 * Strategie, RH, Securite, Legal, Innovation
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import { ChevronDown, ChevronRight, Briefcase, DollarSign, Cpu, Factory, Settings, TrendingUp, Megaphone, Target, Users, Shield, Scale, Lightbulb, Activity } from "lucide-react";
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
  { label: "Direction", icon: Briefcase, code: "CEOB" },
  { label: "Finance", icon: DollarSign, code: "CFOB" },
  { label: "Technologie", icon: Cpu, code: "CTOB" },
  { label: "Production", icon: Factory, code: "CPOB" },
  { label: "Operation", icon: Settings, code: "COOB" },
  { label: "Vente", icon: TrendingUp, code: "CROB" },
  { label: "Marketing", icon: Megaphone, code: "CMOB" },
  { label: "Strategie", icon: Target, code: "CSOB" },
  { label: "RH", icon: Users, code: "CHROB" },
  { label: "Securite", icon: Shield, code: "CISOB" },
  { label: "Legal", icon: Scale, code: "CLOB" },
  { label: "Innovation", icon: Lightbulb, code: "CINOB" },
];

// Couleur identitaire par bot — ligne sous le departement actif
const BOT_COLOR: Record<string, string> = {
  CEOB: "bg-blue-600",
  CFOB: "bg-emerald-600",
  CTOB: "bg-violet-600",
  CPOB: "bg-slate-600",
  COOB: "bg-orange-600",
  CROB: "bg-amber-600",
  CMOB: "bg-pink-600",
  CSOB: "bg-red-600",
  CHROB: "bg-teal-600",
  CISOB: "bg-zinc-700",
  CLOB: "bg-indigo-600",
  CINOB: "bg-rose-600",
};

// Couleur identitaire pour les icones sidebar (Design System: sidebar = couleur)
const BOT_ICON_COLOR: Record<string, string> = {
  CEOB: "text-blue-600",
  CFOB: "text-emerald-600",
  CTOB: "text-violet-600",
  CPOB: "text-slate-600",
  COOB: "text-orange-600",
  CROB: "text-amber-600",
  CMOB: "text-pink-600",
  CSOB: "text-red-600",
  CHROB: "text-teal-600",
  CISOB: "text-zinc-600",
  CLOB: "text-indigo-600",
};

// Notifications par departement — desactivees tant que pas branchees au backend
// Carl: "je ne sais toujours pas à quoi va servir ce chiffre-là, on les fait apparaître juste quand ils vont marcher pour de vrai"
const DEPT_NOTIFICATIONS: Record<string, number> = {};

export function SectionEntreprise({ collapsed }: Props) {
  const [open, setOpen] = useState(true);
  const { bots } = useBots();
  const { activeBotCode, activeView, setActiveBot, setActiveView } = useFrameMaster();

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
        {/* Blue Print — systeme nerveux central */}
        <hr className="border-gray-200 mx-1" />
        <button
          onClick={() => setActiveView("blueprint")}
          className={cn(
            "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
            activeView === "blueprint" && "bg-accent"
          )}
          title="Blue Print"
        >
          <Activity className="h-3.5 w-3.5 text-cyan-500" />
        </button>
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
        Mon Équipe
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
          {/* Blue Print — systeme nerveux central */}
          <hr className="border-gray-200 mx-2 my-1" />
          <button
            onClick={() => setActiveView("blueprint")}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
              activeView === "blueprint" && "bg-accent font-medium"
            )}
          >
            <Activity className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
            <span className="flex-1 text-left truncate">Blue Print</span>
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
