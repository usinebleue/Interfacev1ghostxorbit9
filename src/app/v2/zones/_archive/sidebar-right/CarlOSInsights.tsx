/**
 * CarlOSInsights.tsx — Coaching proactif de CarlOS
 * Positionné ENTRE CarlOS Pulse et Mes Missions dans la sidebar droite.
 *
 * Affiche les insights de CarlOS:
 * - Discussions en suspens (actives mais silencieuses > 2h)
 * - Missions parkées depuis > 24h
 *
 * Nomenclature sidebar droite:
 *   CarlOS Pulse = alertes système (critiques, confirmations)
 *   CarlOS Insights = coaching proactif (suggestions, suivis, relances)
 *   Mes Missions = liste structurée des missions et discussions
 *
 * Sprint C — D-101 GPS du Flow
 */

import { useMemo } from "react";
import {
  Zap,
  Archive,
  CalendarDays,
  Play,
  GitBranch,
  Target,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useChatContext } from "../../context/ChatContext";
import { useFrameMaster } from "../../context/FrameMasterContext";

function threadAgeHours(thread: { updatedAt: string }): number {
  return (Date.now() - new Date(thread.updatedAt).getTime()) / (1000 * 60 * 60);
}

function formatAge(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

export function CarlOSInsights() {
  const { threads, resumeThread, completeThread } = useChatContext();
  const { setActiveView } = useFrameMaster();

  const staleThreads = useMemo(() => {
    return threads
      .filter((t) => t.status === "parked" && threadAgeHours(t) > 24)
      .sort((a, b) => threadAgeHours(b) - threadAgeHours(a));
  }, [threads]);

  const suspendedThreads = useMemo(() => {
    return threads
      .filter((t) => t.status === "active" && threadAgeHours(t) > 2)
      .sort((a, b) => threadAgeHours(b) - threadAgeHours(a));
  }, [threads]);

  const totalInsights = staleThreads.length + suspendedThreads.length;

  if (totalInsights === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        CarlOS Insights
        <span className="ml-auto bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          {totalInsights}
        </span>
      </div>

      {suspendedThreads.length > 0 && (
        <InsightCard
          icon={<Target className="h-3.5 w-3.5 text-blue-500" />}
          color="blue"
          title={suspendedThreads.length === 1
            ? "1 discussion en suspens"
            : `${suspendedThreads.length} discussions en suspens`
          }
          description={
            suspendedThreads.length === 1
              ? `"${suspendedThreads[0].title}" attend depuis ${formatAge(threadAgeHours(suspendedThreads[0]))}`
              : `Discussions silencieuses depuis ${formatAge(threadAgeHours(suspendedThreads[0]))}+`
          }
          actions={[
            {
              label: "Reprendre",
              icon: <Play className="h-3.5 w-3.5" />,
              onClick: () => {
                resumeThread(suspendedThreads[0].id);
                setActiveView("live-chat");
              },
            },
          ]}
        />
      )}

      {staleThreads.length > 0 && (
        <InsightCard
          icon={<GitBranch className="h-3.5 w-3.5 text-amber-500" />}
          color="amber"
          title={staleThreads.length === 1
            ? "1 mission parkee"
            : `${staleThreads.length} missions parkees`
          }
          description={
            staleThreads.length === 1
              ? `"${staleThreads[0].title}" est parkee depuis ${formatAge(threadAgeHours(staleThreads[0]))}`
              : `${staleThreads.length} missions attendent depuis ${formatAge(threadAgeHours(staleThreads[staleThreads.length - 1]))}+`
          }
          actions={[
            {
              label: "Reprendre",
              icon: <ArrowRight className="h-3.5 w-3.5" />,
              onClick: () => {
                resumeThread(staleThreads[0].id);
                setActiveView("live-chat");
              },
            },
            {
              label: "Archiver",
              icon: <Archive className="h-3.5 w-3.5" />,
              onClick: () => {
                staleThreads.forEach((t) => {
                  resumeThread(t.id);
                  setTimeout(() => completeThread(), 50);
                });
              },
            },
            {
              label: "Lundi",
              icon: <CalendarDays className="h-3.5 w-3.5" />,
              onClick: () => { /* TODO: agenda integration */ },
            },
          ]}
        />
      )}
    </div>
  );
}

// ─── Insight Card ────────────────────────────────────────────

interface InsightAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface InsightCardProps {
  icon: React.ReactNode;
  color: "amber" | "blue" | "green" | "red";
  title: string;
  description: string;
  actions: InsightAction[];
}

const COLOR_MAP = {
  amber: { bg: "bg-amber-50", border: "border-amber-200", btn: "border-amber-300 text-amber-700 hover:bg-amber-100" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", btn: "border-blue-300 text-blue-700 hover:bg-blue-100" },
  green: { bg: "bg-green-50", border: "border-green-200", btn: "border-green-300 text-green-700 hover:bg-green-100" },
  red: { bg: "bg-red-50", border: "border-red-200", btn: "border-red-300 text-red-700 hover:bg-red-100" },
};

function InsightCard({ icon, color, title, description, actions }: InsightCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={cn("rounded-lg p-2.5 space-y-1.5", c.bg, "border", c.border)}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-medium text-gray-700">{title}</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-tight">{description}</p>
      <div className="flex flex-wrap gap-1">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "text-[9px] px-2 py-1 bg-white border rounded-full transition-colors cursor-pointer flex items-center gap-1",
              c.btn
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
