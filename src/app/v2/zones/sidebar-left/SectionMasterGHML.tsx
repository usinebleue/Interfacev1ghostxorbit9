/**
 * SectionMasterGHML.tsx — "Master GHML"
 * 24 sous-sections organisees en 7 blocs (A-G)
 * Consolidation 27→24 — Session 49
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  BookOpen,
  Server,
  Atom,
  Map,
  Rocket,
  Network,
  Radio,
  AlertTriangle,
  Shield,
  Gem,
  GraduationCap,
  Users,
  Route,
  TrendingUp,
  EyeOff,
  Gauge,
  Landmark,
  Stethoscope,
  Play,
  Library,
  Megaphone,
  Scale,
  Bot,
  Zap,
  Crosshair,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import type { ActiveView } from "../../context/FrameMasterContext";

interface Props {
  collapsed: boolean;
}

interface GHMLItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface GHMLBloc {
  bloc: string;
  label: string;
  items: GHMLItem[];
}

const GHML_BLOCS: GHMLBloc[] = [
  {
    bloc: "A",
    label: "Fondations",
    items: [
      { id: "bible-visuelle", label: "A.1 Bible Visuelle", icon: BookOpen, color: "text-indigo-500" },
      { id: "bible-technique", label: "A.2 Bible Technique", icon: Server, color: "text-emerald-500" },
      { id: "bible-ghml", label: "A.3 Bible GHML Complete", icon: Atom, color: "text-violet-500" },
      { id: "master-bible-live", label: "A.4 Bible Visuelle Live", icon: Sparkles, color: "text-indigo-500" },
      { id: "bible-visuelle-cible", label: "A.5 Bible Visuelle Cible", icon: Crosshair, color: "text-rose-500" },
    ],
  },
  {
    bloc: "B",
    label: "Strategie & Direction",
    items: [
      { id: "master-roadmap", label: "B.1 Roadmap & Decisions", icon: Map, color: "text-amber-500" },
      { id: "master-strategie", label: "B.2 Vision & Strategie", icon: Rocket, color: "text-red-500" },
      { id: "master-instance-fonds", label: "B.3 Instance Fonds & Investissement", icon: Landmark, color: "text-emerald-600" },
    ],
  },
  {
    bloc: "C",
    label: "Produit & Architecture",
    items: [
      { id: "master-communication", label: "C.1 Stack Communication", icon: Radio, color: "text-teal-500" },
      { id: "master-navigation", label: "C.2 Structure Navigation", icon: Map, color: "text-slate-600" },
      { id: "master-routine", label: "C.3 Routine & Flow", icon: Shield, color: "text-cyan-500" },
      { id: "master-capacites", label: "C.4 Capacites & ROI", icon: Gauge, color: "text-blue-600" },
      { id: "master-dette", label: "C.5 Dette Technique", icon: AlertTriangle, color: "text-rose-500" },
      { id: "master-flows", label: "C.6 Atlas des Flows", icon: Route, color: "text-cyan-600" },
    ],
  },
  {
    bloc: "D",
    label: "Intelligence & Protocoles",
    items: [
      { id: "master-training", label: "D.1 Entrainement Agents", icon: GraduationCap, color: "text-purple-500" },
      { id: "master-cortex-robot", label: "D.2 Cortex Robot Humanoide", icon: Bot, color: "text-gray-700" },
      { id: "master-minedor", label: "D.3 Mine d'Or & Data", icon: Gem, color: "text-yellow-500" },
    ],
  },
  {
    bloc: "E",
    label: "Reseau & Ecosysteme",
    items: [
      { id: "master-orbit9", label: "E.1 Orbit9 & Reseau", icon: Network, color: "text-orange-500" },
      { id: "master-profils", label: "E.2 Profils & Demos", icon: Users, color: "text-sky-500" },
      { id: "master-parcours", label: "E.3 Parcours Client", icon: Route, color: "text-pink-500" },
      { id: "master-marketing-360", label: "E.4 Marketing 360", icon: Megaphone, color: "text-pink-600" },
      { id: "master-cartographie", label: "E.5 Cartographie Industrielle", icon: Map, color: "text-cyan-600" },
      { id: "master-oracle9", label: "E.6 Oracle9", icon: Radio, color: "text-amber-600" },
    ],
  },
  {
    bloc: "F",
    label: "Operationnel & Execution",
    items: [
      { id: "master-diagnostics", label: "F.1 Diagnostics (54)", icon: Stethoscope, color: "text-orange-600" },
      { id: "master-playbooks", label: "F.2 Playbooks & Missions", icon: Play, color: "text-violet-600" },
      { id: "master-bibliotheque-exec", label: "F.3 Bibliotheque Execution", icon: Library, color: "text-indigo-600" },
      { id: "master-guides-legaux", label: "F.4 Guides Legaux & C-Level", icon: Scale, color: "text-slate-700" },
    ],
  },
  {
    bloc: "G",
    label: "Risques & Cas Speciaux",
    items: [
      { id: "master-angles-morts", label: "G.1 Angles Morts & Risques", icon: EyeOff, color: "text-red-600" },
      { id: "master-hydro-quebec", label: "G.2 Hydro-Quebec & Multi-Agent", icon: Zap, color: "text-cyan-600" },
    ],
  },
];

// Flat list for collapsed mode
const ALL_ITEMS = GHML_BLOCS.flatMap((b) => b.items);

export function SectionMasterGHML({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, setActiveView } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Sparkles className="h-3.5 w-3.5 mx-auto" />
        </div>
        {ALL_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
                activeView === item.id && "bg-accent"
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
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Master GHML
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {GHML_BLOCS.map((bloc) => (
            <div key={bloc.bloc}>
              {/* Bloc header */}
              <div className="flex items-center gap-1.5 px-2 pt-3 pb-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {bloc.bloc} — {bloc.label}
                </span>
              </div>

              {/* Bloc items */}
              {bloc.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                      activeView === item.id && "bg-accent font-medium"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
