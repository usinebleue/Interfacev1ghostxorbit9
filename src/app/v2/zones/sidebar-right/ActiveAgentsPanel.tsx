/**
 * ActiveAgentsPanel.tsx — Remplace par "Sentinel — Alertes Bot"
 * Watchdog securite en haut du sidebar droit, bien visible
 * Badge rouge sur le shield quand il y a des alertes non lues
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";

type AlertSeverity = "critical" | "warning" | "info" | "resolved";

interface SentinelAlert {
  id: string;
  message: string;
  severity: AlertSeverity;
  dept: string;
  time: string;
}

// Alertes simulees du Bot Sentinel (BSE)
// TODO: brancher sur l'API /api/v1/sentinel/alerts
const SENTINEL_ALERTS: SentinelAlert[] = [
  {
    id: "s1",
    message: "Tentative de connexion suspecte detectee",
    severity: "critical",
    dept: "Securite",
    time: "il y a 12 min",
  },
  {
    id: "s2",
    message: "Budget marketing depasse de 15%",
    severity: "warning",
    dept: "Finance",
    time: "il y a 34 min",
  },
  {
    id: "s3",
    message: "Deploiement CTO en attente d'approbation",
    severity: "warning",
    dept: "Technologie",
    time: "il y a 1h",
  },
  {
    id: "s4",
    message: "Backup base de donnees complete",
    severity: "resolved",
    dept: "Systemes",
    time: "il y a 2h",
  },
  {
    id: "s5",
    message: "3 contrats en attente de signature",
    severity: "info",
    dept: "Legal",
    time: "il y a 3h",
  },
];

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { icon: React.ElementType; color: string; bg: string; dot: string }
> = {
  critical: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },
  info: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  resolved: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
};

export function ActiveAgentsPanel() {
  const [open, setOpen] = useState(true);

  const unresolvedCount = SENTINEL_ALERTS.filter(
    (a) => a.severity !== "resolved"
  ).length;
  const criticalCount = SENTINEL_ALERTS.filter(
    (a) => a.severity === "critical"
  ).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-semibold text-gray-700 hover:text-gray-900">
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <div className="relative">
          <ShieldAlert
            className={cn(
              "h-3.5 w-3.5",
              criticalCount > 0 ? "text-red-500" : "text-purple-500"
            )}
          />
          {unresolvedCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
              {unresolvedCount}
            </span>
          )}
        </div>
        <span className="ml-1">Sentinel</span>
        {criticalCount > 0 && (
          <Badge
            variant="destructive"
            className="ml-auto text-[9px] px-1 py-0 h-4"
          >
            {criticalCount} critique
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-1">
          {SENTINEL_ALERTS.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-2 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer hover:opacity-80",
                  config.bg
                )}
              >
                <Icon
                  className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", config.color)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 leading-tight truncate">
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {alert.dept} &middot; {alert.time}
                  </p>
                </div>
                <span
                  className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", config.dot)}
                />
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
