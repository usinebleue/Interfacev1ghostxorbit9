/**
 * SidebarRight.tsx — Bac CarlOS V8 (D-115 Phase 3)
 * 4 tabs: Recap | Discussions | Signaux | Actions
 * Pattern mobile-ready — meme layout sur web et futur app
 */

import { useState, useMemo } from "react";
import {
  BarChart3,
  MessageSquare,
  Activity,
  Zap,
  Flame,
  Video,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import { cn } from "../../../components/ui/utils";
import { CarlOsPulse } from "./CarlOsPulse";
import { VideoCallWidget } from "./VideoCallWidget";
import { ChatBox } from "./ChatBox";
import { MemoryPanel } from "./MemoryPanel";
import { useChantiers, useMissions, useDiscussions, useTaches, useBureau } from "../../api/hooks";

interface Props {
  collapsed?: boolean;
}

type SidebarTab = "recap" | "signaux" | "actions";

const TABS: { id: SidebarTab; label: string; icon: React.ElementType }[] = [
  { id: "recap", label: "Recap", icon: BarChart3 },
  { id: "signaux", label: "Signaux", icon: Activity },
  { id: "actions", label: "Actions", icon: Zap },
];

/* ─── Tab Recap ─── */
function TabRecap() {
  const { chantiers } = useChantiers();
  const { missions } = useMissions();
  const { discussions } = useDiscussions();
  const { taches } = useTaches();
  const { items: bureauItems } = useBureau();

  const stats = useMemo(() => {
    const brulants = chantiers.filter((c) => c.chaleur === "brule");
    const actives = missions.filter((m) => m.statut === "en_cours");
    const done = missions.filter((m) => m.statut === "termine");
    const tachesOpen = taches.filter((t: any) => t.state_detail?.group !== "completed");
    const tachesDone = taches.filter((t: any) => t.state_detail?.group === "completed");
    const docs = bureauItems.filter((b: any) => b.type_item === "document");
    const outils = bureauItems.filter((b: any) => b.type_item === "outil");
    return { brulants, actives, done, total: missions.length, tachesOpen, tachesDone, docs, outils };
  }, [chantiers, missions, taches, bureauItems]);

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full text-[9px]">
      {/* KPI grid 2x3 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-700">{chantiers.length}</div>
          <div className="text-gray-500">Chantiers</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-purple-700">{stats.total}</div>
          <div className="text-gray-500">Missions</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-700">{stats.done.length}</div>
          <div className="text-gray-500">Terminees</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-amber-700">{stats.tachesOpen.length}</div>
          <div className="text-gray-500">Taches</div>
        </div>
        <div className="bg-teal-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-teal-700">{stats.docs.length}</div>
          <div className="text-gray-500">Documents</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-gray-700">{stats.outils.length}</div>
          <div className="text-gray-500">Outils</div>
        </div>
      </div>

      {/* Chantiers brulants */}
      {stats.brulants.length > 0 && (
        <div>
          <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            Chantiers brulants
          </div>
          <div className="space-y-1">
            {stats.brulants.slice(0, 3).map((c) => (
              <div key={c.id} className="bg-orange-50 rounded px-2 py-1 text-gray-700 truncate">
                {c.titre || c.nom}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Taches ouvertes */}
      {stats.tachesOpen.length > 0 && (
        <div>
          <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Taches ouvertes ({stats.tachesOpen.length})
          </div>
          <div className="space-y-1">
            {stats.tachesOpen.slice(0, 4).map((t: any) => (
              <div key={t.id} className="flex items-center gap-1.5 bg-amber-50 rounded px-2 py-1">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                  t.priority === "urgent" ? "bg-red-500" : t.priority === "high" ? "bg-orange-500" : "bg-gray-400"
                )} />
                <span className="text-gray-700 truncate flex-1">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents recents */}
      {stats.docs.length > 0 && (
        <div>
          <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
            Documents recents
          </div>
          <div className="space-y-1">
            {stats.docs.slice(0, 3).map((d: any) => (
              <div key={d.id} className="bg-teal-50 rounded px-2 py-1 text-gray-700 truncate">
                {d.titre}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progression */}
      {stats.total > 0 && (
        <div>
          <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Progression
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all"
              style={{ width: `${Math.round((stats.done.length / stats.total) * 100)}%` }}
            />
          </div>
          <div className="text-gray-400 mt-0.5">
            {stats.done.length}/{stats.total} missions terminees ({Math.round((stats.done.length / stats.total) * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Tab Actions (CarlOS nudges) ─── */
function TabActions() {
  const { chantiers } = useChantiers();
  const { missions } = useMissions();
  const { discussions } = useDiscussions();

  const nudges = useMemo(() => {
    const items: { icon: React.ElementType; color: string; text: string; priority: number }[] = [];

    // Chantiers brulants
    const brulants = chantiers.filter((c) => c.chaleur === "brule");
    if (brulants.length > 0) {
      items.push({
        icon: Flame,
        color: "text-orange-500",
        text: `${brulants.length} chantier${brulants.length > 1 ? "s" : ""} en feu`,
        priority: 1,
      });
    }

    // Missions stagnantes
    const stagnantes = missions.filter((m) => m.statut === "en_cours");
    if (stagnantes.length > 5) {
      items.push({
        icon: Clock,
        color: "text-amber-500",
        text: `${stagnantes.length} missions actives — prioriser`,
        priority: 2,
      });
    }

    // Discussions ouvertes
    const orphelines = discussions.filter((d) => !d.statut || d.statut === "ouvert");
    if (orphelines.length > 0) {
      items.push({
        icon: AlertTriangle,
        color: "text-yellow-500",
        text: `${orphelines.length} discussion${orphelines.length > 1 ? "s" : ""} en attente`,
        priority: 3,
      });
    }

    // Missions terminees
    const done = missions.filter((m) => m.statut === "termine");
    if (done.length > 0) {
      items.push({
        icon: CheckCircle2,
        color: "text-green-500",
        text: `${done.length} mission${done.length > 1 ? "s" : ""} completee${done.length > 1 ? "s" : ""}`,
        priority: 4,
      });
    }

    return items.sort((a, b) => a.priority - b.priority);
  }, [chantiers, missions, discussions]);

  if (nudges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs p-4">
        <CheckCircle2 className="h-8 w-8 mb-2 text-green-300" />
        <div className="font-medium">Tout roule!</div>
        <div>Aucune action urgente</div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2 overflow-y-auto h-full text-[9px]">
      <div className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
        <Zap className="h-3.5 w-3.5 text-yellow-500" />
        CarlOS recommande
      </div>
      {nudges.map((n, i) => (
        <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
          <n.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", n.color)} />
          <div className="text-gray-700 flex-1">{n.text}</div>
          <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
        </div>
      ))}
    </div>
  );
}

/* ─── Tab Signaux ─── */
function TabSignaux() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 shrink-0">
        <CarlOsPulse compact />
      </div>
      <div className="flex-1 overflow-hidden">
        <MemoryPanel />
      </div>
    </div>
  );
}

/* ─── Main Sidebar ─── */
export function SidebarRight({ collapsed = false }: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab | null>(null);

  // Mode collapsed — icones seulement
  if (collapsed) {
    return (
      <div className="h-full flex flex-col bg-white py-2 overflow-hidden">
        <div className="flex-1 space-y-1 px-1 overflow-hidden">
          {TABS.map((tab) => (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                  className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors"
                >
                  <tab.icon className={cn(
                    "h-4 w-4",
                    activeTab === tab.id ? "text-blue-600" : "text-gray-400"
                  )} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">{tab.label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full flex justify-center py-2 rounded hover:bg-accent transition-colors">
                <Video className="h-4 w-4 text-purple-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">CarlOS Live</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Mode ouvert — VideoWidget + ChatBox seulement
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Video/Voice compact */}
      <div className="mx-3 mt-3 shrink-0">
        <VideoCallWidget />
      </div>

      {/* ChatBox — toujours visible (comme Telegram) */}
      <div className="flex-1 overflow-hidden">
        <ChatBox />
      </div>
    </div>
  );
}
