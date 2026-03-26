/**
 * SectionMonEquipe.tsx — [4] Mon Equipe
 * 11 bots C-Level — click → navigateToDepartment(botCode)
 * V2 — Restructure 12 departements identiques
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Cpu,
  DollarSign,
  Megaphone,
  Target,
  Settings,
  Factory,
  Lightbulb,
  TrendingUp,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

const BOT_ITEMS: { code: string; label: string; icon: React.ElementType; color: string }[] = [
  { code: "CTOB", label: "Tim — CTO", icon: Cpu, color: "text-violet-500" },
  { code: "CFOB", label: "Frank — CFO", icon: DollarSign, color: "text-emerald-500" },
  { code: "CMOB", label: "Mathilde — CMO", icon: Megaphone, color: "text-pink-500" },
  { code: "CSOB", label: "Simone — CSO", icon: Target, color: "text-red-500" },
  { code: "COOB", label: "Olivier — COO", icon: Settings, color: "text-orange-500" },
  { code: "CPOB", label: "Paco — CPO", icon: Factory, color: "text-slate-500" },
  { code: "CHROB", label: "Helene — CHRO", icon: Users, color: "text-teal-500" },
  { code: "CINOB", label: "Ines — CINO", icon: Lightbulb, color: "text-rose-500" },
  { code: "CROB", label: "Rich — CRO", icon: TrendingUp, color: "text-amber-500" },
  { code: "CLOB", label: "Loulou — CLO", icon: Scale, color: "text-indigo-500" },
  { code: "CISOB", label: "Sebastien — CISO", icon: ShieldCheck, color: "text-zinc-500" },
];

export function SectionMonEquipe({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, activeBotCode, navigateToDepartment } = useFrameMaster();

  const isActive = (code: string) => {
    return activeView === "department" && activeBotCode === code;
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Users className="h-3.5 w-3.5 mx-auto" />
        </div>
        {BOT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.code}
              onClick={() => navigateToDepartment(item.code)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                isActive(item.code) && "bg-accent"
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
          11
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {BOT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.code}
                onClick={() => navigateToDepartment(item.code)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  isActive(item.code) && "bg-accent font-medium"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
