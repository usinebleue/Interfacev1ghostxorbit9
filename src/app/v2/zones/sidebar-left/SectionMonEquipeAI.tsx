/**
 * SectionMonEquipeAI.tsx — [4] Mon Equipe AI
 * 11 agents (sans CEOB qui est dans Mon Cockpit > Direction)
 * Click agent → vue departement avec 4 tabs
 * Sprint C — Restructuration Plateforme
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Bot,
  DollarSign,
  Cpu,
  Factory,
  Settings,
  TrendingUp,
  Megaphone,
  Target,
  Users,
  Shield,
  Scale,
  Lightbulb,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useBots } from "../../api/hooks";
import type { BotInfo } from "../../api/types";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

// 11 agents — CEOB exclus (il est dans Mon Cockpit > Direction)
const AGENTS: { label: string; icon: React.ElementType; code: string }[] = [
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

const BOT_ICON_COLOR: Record<string, string> = {
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
  CINOB: "text-rose-600",
};

const BOT_COLOR: Record<string, string> = {
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

export function SectionMonEquipeAI({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { bots } = useBots();
  const { activeBotCode, activeView, setActiveBot, setActiveView } = useFrameMaster();

  const botsByCode: Record<string, BotInfo> = {};
  for (const bot of bots) {
    botsByCode[bot.code] = bot;
  }

  const handleSelect = (code: string) => {
    const bot = botsByCode[code];
    const agent = AGENTS.find((a) => a.code === code);
    const botInfo: BotInfo = bot || {
      code,
      nom: agent?.label || code,
      titre: agent?.label || code,
      role: agent?.label || "",
      departement: agent?.label || "",
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
          <Bot className="h-3.5 w-3.5 mx-auto" />
        </div>
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeBotCode === agent.code && activeView === "department";
          const iconColor = BOT_ICON_COLOR[agent.code] || "text-muted-foreground";
          return (
            <div key={agent.code}>
              <button
                onClick={() => handleSelect(agent.code)}
                className={cn(
                  "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                  isActive && "bg-accent"
                )}
                title={agent.label}
              >
                <Icon className={cn("h-3.5 w-3.5", iconColor)} />
              </button>
              {isActive && (
                <div className={cn("h-0.5 mx-1 rounded-full", BOT_COLOR[agent.code] || "bg-gray-400")} />
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
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Mon Equipe AI
        <Badge variant="secondary" className="ml-auto text-[9px] px-1.5">
          {AGENTS.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {AGENTS.map((agent) => {
            const bot = botsByCode[agent.code];
            const isActive = activeBotCode === agent.code && activeView === "department";
            const isLive = bot?.actif;
            const Icon = agent.icon;
            const iconColor = BOT_ICON_COLOR[agent.code] || "text-muted-foreground";

            return (
              <div key={agent.code}>
                <button
                  onClick={() => handleSelect(agent.code)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                    isActive && "bg-accent font-medium"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
                  <span className="flex-1 text-left truncate">{agent.label}</span>
                  {isLive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  )}
                </button>
                {isActive && (
                  <div className={cn("h-0.5 mx-2 rounded-full", BOT_COLOR[agent.code] || "bg-gray-400")} />
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
