/**
 * SectionMonEquipe.tsx — [4] Mon Equipe
 * 5 items: Equipe Humaine, Bots C-Level, Composition, Roles, Performance
 * Plan V6 — Sprint F1
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Bot,
  Layers,
  Shield,
  BarChart3,
} from "lucide-react";
import { PixelAgent } from "../center/shared/PixelAgent";
import { Badge } from "../../../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { EquipeSection } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const ITEMS: { id: EquipeSection; label: string; icon: React.ElementType; color: string }[] = [
  { id: "humains", label: "Equipe Humaine", icon: Users, color: "text-blue-500" },
  { id: "bots", label: "Bots C-Level", icon: Bot, color: "text-violet-500" },
  { id: "composition", label: "Composition", icon: Layers, color: "text-emerald-500" },
  { id: "roles", label: "Roles & Permissions", icon: Shield, color: "text-amber-500" },
  { id: "performance", label: "Performance", icon: BarChart3, color: "text-cyan-500" },
];

const PREVIEW_BOTS = ["CEOB", "CTOB", "CFOB"] as const;

export function SectionMonEquipe({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const [hoverBots, setHoverBots] = useState(false);
  const { activeView, activeEquipeSection, navigateEquipe } = useFrameMaster();

  const isActive = (itemId: EquipeSection) => {
    if (itemId === "bots") {
      return (activeView === "mon-equipe" && activeEquipeSection === "bots") || activeView === "agent-gallery" || activeView === "department";
    }
    return activeView === "mon-equipe" && activeEquipeSection === itemId;
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Users className="h-3.5 w-3.5 mx-auto" />
        </div>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateEquipe(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                isActive(item.id) && "bg-accent"
              )}
              title={item.label}
            >
              <Icon className={cn("h-3.5 w-3.5", item.color)} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wide">
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Mon Equipe
        <Badge variant="secondary" className="ml-auto text-[9px] px-1.5">
          {ITEMS.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={() => navigateEquipe(item.id)}
                  onMouseEnter={() => item.id === "bots" && setHoverBots(true)}
                  onMouseLeave={() => item.id === "bots" && setHoverBots(false)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                    isActive(item.id) && "bg-accent font-medium"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                  <span className="truncate">{item.label}</span>
                </button>
                {/* Mini pixel agents preview sous Bots C-Level */}
                {item.id === "bots" && (
                  <div className="flex items-center gap-1.5 px-3 py-1">
                    {PREVIEW_BOTS.map((code) => (
                      <PixelAgent
                        key={code}
                        botCode={code}
                        state={hoverBots ? "celebrating" : "idle"}
                        size="sm"
                      />
                    ))}
                    <span className="text-[8px] text-gray-400 ml-1">+9</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
