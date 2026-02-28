/**
 * SectionOrbit9.tsx — "Mon Reseau Orbit 9"
 * 3 groupes logiques + 10 sous-sections (dont TRG Industrie)
 * Sprint B — Restructuration logique
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Handshake,
  Crown,
  Rocket,
  Store,
  Calendar,
  Newspaper,
  Gauge,
  Network,
  TrendingUp,
  BarChart3,
  Globe,
} from "lucide-react";
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

interface Orbit9Item {
  id: string;
  label: string;
  icon: React.ElementType;
  color?: string;
}

interface Orbit9Group {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: Orbit9Item[];
}

const ORBIT9_GROUPS: Orbit9Group[] = [
  {
    id: "reseau",
    label: "Reseau & Collaboration",
    icon: Network,
    color: "text-emerald-500",
    items: [
      { id: "collaboration", label: "Cercles Orbit9", icon: Handshake, color: "text-emerald-500" },
      { id: "matching", label: "Matching Engine", icon: Search, color: "text-blue-500" },
      { id: "gouvernance", label: "Gouvernance", icon: Crown, color: "text-amber-500" },
    ],
  },
  {
    id: "croissance",
    label: "Croissance",
    icon: Rocket,
    color: "text-indigo-500",
    items: [
      { id: "pionniers", label: "Pionniers Bleus", icon: Rocket, color: "text-indigo-500" },
      { id: "marketplace", label: "Marketplace Experts", icon: Store, color: "text-orange-500" },
      { id: "evenements", label: "Evenements", icon: Calendar, color: "text-rose-500" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence & Donnees",
    icon: BarChart3,
    color: "text-violet-500",
    items: [
      { id: "benchmark", label: "Benchmark", icon: Gauge, color: "text-violet-500" },
      { id: "nouvelles", label: "Nouvelles", icon: Newspaper, color: "text-sky-500" },
      { id: "trg-industrie", label: "TRG Industrie", icon: Globe, color: "text-teal-500" },
    ],
  },
];

// Flat list for collapsed mode
const ALL_ITEMS = ORBIT9_GROUPS.flatMap(g => g.items);

export function SectionOrbit9({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    reseau: true,
    croissance: true,
    intelligence: true,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const { navigateOrbit9 } = useFrameMaster();

  const handleItemClick = (id: string) => {
    setSelected(id);
    navigateOrbit9(id);
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Network className="h-3 w-3 mx-auto" />
        </div>
        {ALL_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                selected === item.id && "bg-accent"
              )}
              title={item.label}
            >
              <Icon className={cn("h-3.5 w-3.5", item.color || "text-muted-foreground")} />
            </button>
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
        Mon Reseau Orbit 9
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-1 px-1">
          {ORBIT9_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isGroupOpen = openGroups[group.id] ?? true;

            return (
              <div key={group.id}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {isGroupOpen ? (
                    <ChevronDown className="h-2.5 w-2.5" />
                  ) : (
                    <ChevronRight className="h-2.5 w-2.5" />
                  )}
                  <GroupIcon className={cn("h-3 w-3", group.color)} />
                  <span className="truncate">{group.label}</span>
                </button>

                {/* Group items */}
                {isGroupOpen && (
                  <div className="space-y-0.5 ml-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                            selected === item.id && "bg-accent font-medium"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color || "text-muted-foreground")} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
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
