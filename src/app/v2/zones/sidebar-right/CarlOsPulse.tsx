/**
 * CarlOsPulse.tsx — "CarlOS Pulse" — alertes intelligentes
 * Remplace ActiveAgentsPanel (Sentinel) + alertes de ContextBoxes
 * Vide par defaut — CarlOS montre seulement quand il y a quelque chose a dire
 * 3 types : critique (rouge), suggestion (bleu), confirmation (vert)
 * Sprint B — Reorganisation sidebar droite
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Activity,
  XCircle,
  Lightbulb,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";

type PulseType = "critical" | "suggestion" | "confirmation";

interface PulseItem {
  id: string;
  message: string;
  type: PulseType;
  source: string;
  time: string;
}

const PULSE_CONFIG: Record<
  PulseType,
  { icon: React.ElementType; color: string; bg: string; dot: string }
> = {
  critical: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
  suggestion: {
    icon: Lightbulb,
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  confirmation: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
};

export function CarlOsPulse() {
  const [open, setOpen] = useState(true);

  // TODO: brancher sur l'API /api/v1/pulse — pour l'instant, liste vide par defaut
  // Les items seront pousses par CarlOS quand il detecte quelque chose
  const [items, setItems] = useState<PulseItem[]>([]);

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const criticalCount = items.filter((i) => i.type === "critical").length;
  const totalCount = items.length;

  // Si aucun item, afficher juste le header avec "Tout est calme"
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-semibold text-gray-700 hover:text-gray-900">
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <div className="relative">
          <Activity
            className={cn(
              "h-3.5 w-3.5",
              criticalCount > 0 ? "text-red-500" : "text-green-500"
            )}
          />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
              {totalCount}
            </span>
          )}
        </div>
        <span className="ml-1">CarlOS Pulse</span>
        {criticalCount > 0 && (
          <Badge
            variant="destructive"
            className="ml-auto text-[9px] px-1 py-0 h-4"
          >
            {criticalCount} urgent
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-1">
          {items.length === 0 ? (
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-gray-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              Tout est calme — CarlOS veille.
            </div>
          ) : (
            items.map((item) => {
              const config = PULSE_CONFIG[item.type];
              const Icon = config.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-start gap-2 px-2 py-1.5 rounded text-xs transition-colors",
                    config.bg
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 mt-0.5",
                      config.color
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 leading-tight">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {item.source} &middot; {item.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all p-0.5 shrink-0 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
