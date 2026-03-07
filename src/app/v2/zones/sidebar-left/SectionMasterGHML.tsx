/**
 * SectionMasterGHML.tsx — "Master GHML"
 * Bible Visuelle + Bible Technique dans une section dédiée
 * Sprint — Session 47
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
  ScrollText,
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
  LayoutGrid,
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

const GHML_ITEMS: { id: ActiveView; label: string; icon: React.ElementType; color: string }[] = [
  { id: "bible-visuelle", label: "Bible Visuelle", icon: BookOpen, color: "text-indigo-500" },
  { id: "bible-technique", label: "Bible Technique", icon: Server, color: "text-emerald-500" },
  { id: "bible-ghml", label: "Bible GHML", icon: Atom, color: "text-violet-500" },
  { id: "master-roadmap", label: "Roadmap & Décisions", icon: Map, color: "text-amber-500" },
  { id: "master-strategie", label: "Stratégie & Lancement", icon: Rocket, color: "text-red-500" },
  { id: "master-orbit9", label: "Orbit9 & Réseau", icon: Network, color: "text-orange-500" },
  { id: "master-communication", label: "Stack Communication", icon: Radio, color: "text-teal-500" },
  { id: "master-dette", label: "Dette Technique", icon: AlertTriangle, color: "text-rose-500" },
  { id: "master-routine", label: "Routine & Flow", icon: Shield, color: "text-cyan-500" },
  { id: "master-minedor", label: "Mine d'Or & Data", icon: Gem, color: "text-yellow-500" },
  { id: "master-training", label: "Entraînement Agents", icon: GraduationCap, color: "text-purple-500" },
  { id: "master-profils", label: "Profils & Démos", icon: Users, color: "text-sky-500" },
  { id: "master-parcours", label: "Parcours Client", icon: Route, color: "text-pink-500" },
  { id: "master-protocoles", label: "Protocoles & Acronymes", icon: ScrollText, color: "text-fuchsia-500" },
  { id: "master-vision-affaires", label: "Vision d'Affaires & Produit", icon: TrendingUp, color: "text-green-600" },
  { id: "master-navigation", label: "Structure Navigation", icon: Map, color: "text-slate-600" },
  // ── Nouvelles sections (Session 48) ──
  { id: "master-angles-morts", label: "Angles Morts & Risques", icon: EyeOff, color: "text-red-600" },
  { id: "master-capacites", label: "Capacités & ROI", icon: Gauge, color: "text-blue-600" },
  { id: "master-instance-fonds", label: "Instance Fonds & Investissement", icon: Landmark, color: "text-emerald-600" },
  { id: "master-diagnostics", label: "Diagnostics (54)", icon: Stethoscope, color: "text-orange-600" },
  { id: "master-playbooks", label: "Playbooks & Missions", icon: Play, color: "text-violet-600" },
  { id: "master-bibliotheque-exec", label: "Bibliothèque Exécution", icon: Library, color: "text-indigo-600" },
  { id: "master-marketing-360", label: "Marketing 360", icon: Megaphone, color: "text-pink-600" },
  { id: "master-guides-legaux", label: "Guides Légaux & C-Level", icon: Scale, color: "text-slate-700" },
  { id: "master-cortex-robot", label: "Cortex Robot Humanoïde", icon: Bot, color: "text-gray-700" },
  { id: "master-hydro-quebec", label: "Hydro-Québec & Multi-Agent", icon: Zap, color: "text-cyan-600" },
  { id: "master-tableau-periodique", label: "Tableau Périodique Visuel", icon: LayoutGrid, color: "text-purple-600" },
];

export function SectionMasterGHML({ collapsed }: Props) {
  const [open, setOpen] = useState(false);
  const { activeView, setActiveView } = useFrameMaster();

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        <div className="text-center text-xs text-muted-foreground py-1">
          <Sparkles className="h-3.5 w-3.5 mx-auto" />
        </div>
        {GHML_ITEMS.map((item) => {
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
          {GHML_ITEMS.map((item) => {
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
      </CollapsibleContent>
    </Collapsible>
  );
}
