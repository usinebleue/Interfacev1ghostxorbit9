/**
 * SectionMasterGHML.tsx — "Master GHML"
 * 31 sous-sections organisees en 4 blocs (FE/BE/RD/SA)
 * Frontend (7) + Backend (10) + Roadmap Dev (6) + Strategies Affaires (8)
 * Reorganisation S51
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
    bloc: "FE",
    label: "Frontend",
    items: [
      { id: "bible-officielle", label: "Bible Visuelle Officielle", icon: BookOpen, color: "text-emerald-500" },
      { id: "bible-visuelle", label: "Vieille Bible 1", icon: BookOpen, color: "text-gray-400" },
      { id: "master-bible-live", label: "Vieille Bible 2", icon: Sparkles, color: "text-gray-400" },
      { id: "bible-visuelle-cible", label: "Vieille Bible 3", icon: Crosshair, color: "text-gray-400" },
      { id: "animation-showcase", label: "FE.4 Lab Animations", icon: Sparkles, color: "text-amber-500" },
      { id: "agent-gallery", label: "FE.4b Galerie Agents AI", icon: Users, color: "text-blue-500" },
      { id: "master-navigation", label: "FE.5 Structure Navigation", icon: Map, color: "text-slate-600" },
      { id: "master-flows", label: "FE.6 Atlas des Flows", icon: Route, color: "text-cyan-600" },
      { id: "master-parcours", label: "FE.7 Parcours Client", icon: Route, color: "text-pink-500" },
      { id: "fe-sidebar-droite", label: "FE.8 Console Droite", icon: Map, color: "text-indigo-500" },
      { id: "fe-mon-reseau", label: "FE.9 Mon Réseau", icon: Network, color: "text-orange-600" },
      { id: "accueil-hero", label: "FE.10 Accueil Hero", icon: Rocket, color: "text-blue-600" },
    ],
  },
  {
    bloc: "BE",
    label: "Backend",
    items: [
      { id: "bible-technique", label: "BE.1 Bible Technique", icon: Server, color: "text-emerald-500" },
      { id: "bible-ghml", label: "BE.2 Bible GHML Complete", icon: Atom, color: "text-violet-500" },
      { id: "master-communication", label: "BE.3 Stack Communication", icon: Radio, color: "text-teal-500" },
      { id: "master-dette", label: "BE.4 Dette Technique", icon: AlertTriangle, color: "text-rose-500" },
      { id: "master-training", label: "BE.5 Entrainement Agents", icon: GraduationCap, color: "text-purple-500" },
      { id: "master-cortex-robot", label: "BE.6 Cortex Robot Humanoide", icon: Bot, color: "text-gray-700" },
      { id: "master-minedor", label: "BE.7 Mine d'Or & Data", icon: Gem, color: "text-yellow-500" },
      { id: "master-cartographie", label: "BE.8 Cartographie Industrielle", icon: Map, color: "text-cyan-600" },
      { id: "master-hydro-quebec", label: "BE.9 Hydro-Quebec & Multi-Agent", icon: Zap, color: "text-cyan-600" },
      { id: "master-guides-legaux", label: "BE.10 Guides Legaux & C-Level", icon: Scale, color: "text-slate-700" },
    ],
  },
  {
    bloc: "RD",
    label: "Roadmap Dev",
    items: [
      { id: "master-roadmap", label: "RD.1 Roadmap & Decisions", icon: Map, color: "text-amber-500" },
      { id: "master-routine", label: "RD.2 Routine de Dev", icon: Shield, color: "text-cyan-500" },
      { id: "master-diagnostics", label: "RD.3 Diagnostics (54)", icon: Stethoscope, color: "text-orange-600" },
      { id: "master-playbooks", label: "RD.4 Playbooks & Missions", icon: Play, color: "text-violet-600" },
      { id: "master-bibliotheque-exec", label: "RD.5 Bibliotheque Execution", icon: Library, color: "text-indigo-600" },
      { id: "master-angles-morts", label: "RD.6 Angles Morts & Risques", icon: EyeOff, color: "text-red-600" },
      { id: "playbook-usine-bleue", label: "RD.7 Mon Blueprint", icon: Rocket, color: "text-blue-600" },
      { id: "blueprint-reseau", label: "RD.8 Blueprint Reseau", icon: Network, color: "text-orange-600" },
    ],
  },
  {
    bloc: "SA",
    label: "Strategies Affaires",
    items: [
      { id: "master-strategie", label: "SA.1 Vision & Strategie", icon: Rocket, color: "text-red-500" },
      { id: "master-instance-fonds", label: "SA.2 Instance Fonds & Investissement", icon: Landmark, color: "text-emerald-600" },
      { id: "master-orbit9", label: "SA.3 Orbit9 & Reseau", icon: Network, color: "text-orange-500" },
      { id: "master-profils", label: "SA.4 Profils & Demos", icon: Users, color: "text-sky-500" },
      { id: "master-marketing-360", label: "SA.5 Marketing 360", icon: Megaphone, color: "text-pink-600" },
      { id: "master-oracle9", label: "SA.6 Oracle9", icon: Radio, color: "text-amber-600" },
      { id: "flow-usine-bleue", label: "SA.7 Flow Transformation", icon: Rocket, color: "text-blue-500" },
      { id: "master-capacites", label: "SA.8 Capacites & ROI", icon: Gauge, color: "text-blue-600" },
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
