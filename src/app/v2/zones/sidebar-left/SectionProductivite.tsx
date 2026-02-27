/**
 * SectionProductivite.tsx — "Ma Productivite" — 6 items
 * Mode collapsed = icones seulement
 * Mode fixe (sidebar droite) = toujours ouvert, pas collapsible
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Briefcase,
  Sparkles,
  FolderKanban,
  FileText,
  MessageSquare,
  CheckSquare,
  Wrench,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { cn } from "../../../components/ui/utils";

interface Props {
  collapsed: boolean;
  /** Mode fixe = toujours ouvert, pas collapsible (sidebar droite) */
  fixed?: boolean;
}

const PROD_ITEMS = [
  { id: "idees", label: "Mes Idees", icon: Sparkles },
  { id: "projets", label: "Projets", icon: FolderKanban },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "taches", label: "Taches", icon: CheckSquare },
  { id: "outils", label: "Outils", icon: Wrench },
];

export function SectionProductivite({ collapsed, fixed = false }: Props) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  if (collapsed) {
    return (
      <div className="space-y-1 px-1">
        {PROD_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item.id)}
            className={cn(
              "w-full flex justify-center py-1.5 rounded hover:bg-accent transition-colors",
              selected === item.id && "bg-accent"
            )}
            title={item.label}
          >
            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>
    );
  }

  // Mode fixe — grille compacte, meme hauteur que InputBar
  if (fixed) {
    return (
      <div>
        <div className="flex items-center gap-2 px-2 mb-2">
          <Briefcase className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Productivite
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-1 gap-y-2 px-1">
          {PROD_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-2 rounded text-xs hover:bg-gray-50 transition-colors",
                selected === item.id && "bg-gray-100 font-medium"
              )}
            >
              <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Mode collapsible (sidebar gauche)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wide">
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Ma Productivite
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5 px-1">
          {PROD_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                selected === item.id && "bg-accent font-medium"
              )}
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
