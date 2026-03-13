/**
 * CarlOsPulse.tsx — "CarlOS Pulse" — alertes intelligentes
 * Agrege tensions actives, chantiers brulants, VITAA scores faibles
 * 3 types : critique (rouge), suggestion (bleu), confirmation (vert)
 * Branche sur /api/v1/pulse — polling 60s
 */

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Activity,
  XCircle,
  Lightbulb,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import { api } from "../../api/client";

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

export function CarlOsPulse({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState<PulseItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchPulse = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.pulse();
      if (data?.items) {
        const typed = data.items.map((i) => ({
          ...i,
          type: (["critical", "suggestion", "confirmation"].includes(i.type) ? i.type : "suggestion") as PulseType,
        }));
        setItems(typed);
      }
    } catch {
      // silently fail — pulse is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPulse();
    const interval = setInterval(fetchPulse, 60_000);
    return () => clearInterval(interval);
  }, [fetchPulse]);

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visibleItems = items.filter((i) => !dismissed.has(i.id));
  const criticalCount = visibleItems.filter((i) => i.type === "critical").length;
  const suggestionCount = visibleItems.filter((i) => i.type === "suggestion").length;
  const totalCount = visibleItems.length;

  const statusDot = criticalCount > 0 ? "bg-red-500 animate-pulse" : suggestionCount > 0 ? "bg-amber-400 animate-pulse" : "bg-green-500 animate-pulse";
  const statusText = criticalCount > 0
    ? `${criticalCount} urgence${criticalCount > 1 ? "s" : ""}`
    : suggestionCount > 0
      ? `${suggestionCount} action${suggestionCount > 1 ? "s" : ""} requise${suggestionCount > 1 ? "s" : ""}`
      : "Tout est calme";
  const statusTextColor = criticalCount > 0 ? "text-red-600" : suggestionCount > 0 ? "text-amber-600" : "text-green-600";

  if (compact) {
    return (
      <div className="flex items-center gap-2 h-7">
        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", statusDot)} />
        <span className={cn("text-[11px] font-semibold truncate", statusTextColor)}>
          {statusText}
        </span>
        {criticalCount > 0 && (
          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4 ml-auto shrink-0">
            {criticalCount} urgent
          </Badge>
        )}
      </div>
    );
  }

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
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[9px] text-gray-400">{totalCount} signal{totalCount !== 1 ? "x" : ""}</span>
            <button
              onClick={(e) => { e.stopPropagation(); fetchPulse(); }}
              className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </button>
          </div>
          {visibleItems.length === 0 ? (
            <div className="flex items-center gap-2 px-2 py-2 text-xs">
              <span className={cn("w-2 h-2 rounded-full shrink-0", statusDot)} />
              <span className={statusTextColor}>{statusText} — CarlOS veille.</span>
            </div>
          ) : (
            visibleItems.map((item) => {
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
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {item.source}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all p-0.5 shrink-0 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
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
