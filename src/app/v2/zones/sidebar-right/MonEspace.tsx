/**
 * MonEspace.tsx — "Mon Espace" — raccourcis productivite
 * Remplace SectionProductivite (6 items) + ContextBoxes (fourre-tout)
 * 5 items collapsibles : Idees, Projets, Documents, Taches, Outils Factory
 * Chaque item montre son contenu quand il y en a, sinon compteur 0
 * Sprint B — Reorganisation sidebar droite
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  FolderKanban,
  FileText,
  CheckSquare,
  Wrench,
  Briefcase,
  Plus,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";

interface EspaceItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: string[];
  emptyMessage: string;
}

const ESPACE_SECTIONS: EspaceItem[] = [
  {
    id: "idees",
    label: "Mes Idees",
    icon: Sparkles,
    color: "text-amber-500",
    items: [],
    emptyMessage: "Les idees generees par CarlOS apparaitront ici.",
  },
  {
    id: "projets",
    label: "Mes Projets",
    icon: FolderKanban,
    color: "text-blue-500",
    items: [],
    emptyMessage: "Les cahiers SMART et projets en cours.",
  },
  {
    id: "documents",
    label: "Mes Documents",
    icon: FileText,
    color: "text-green-500",
    items: [],
    emptyMessage: "PDF, exports et documents generes.",
  },
  {
    id: "taches",
    label: "Mes Taches",
    icon: CheckSquare,
    color: "text-purple-500",
    items: [],
    emptyMessage: "Actions a valider et taches en attente.",
  },
  {
    id: "outils",
    label: "Outils Factory",
    icon: Wrench,
    color: "text-orange-500",
    items: [],
    emptyMessage: "Calculateurs, estimateurs et skills du Factory Bot.",
  },
];

export function MonEspace() {
  const [sectionOpen, setSectionOpen] = useState(true);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = ESPACE_SECTIONS.reduce(
    (sum, s) => sum + s.items.length,
    0
  );

  return (
    <Collapsible open={sectionOpen} onOpenChange={setSectionOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-semibold text-gray-700 hover:text-gray-900">
        {sectionOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <Briefcase className="h-3.5 w-3.5 text-orange-500" />
        Mon Espace
        {totalItems > 0 && (
          <Badge
            variant="secondary"
            className="ml-auto text-[10px] px-1.5 bg-orange-100 text-orange-700"
          >
            {totalItems}
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-1">
          {ESPACE_SECTIONS.map((section) => (
            <Collapsible
              key={section.id}
              open={openItems[section.id] || false}
              onOpenChange={() => toggleItem(section.id)}
            >
              <CollapsibleTrigger
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors",
                  "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                )}
              >
                <section.icon
                  className={cn("h-3.5 w-3.5 shrink-0", section.color)}
                />
                <span className="flex-1 text-left font-medium">
                  {section.label}
                </span>
                {section.items.length > 0 ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 h-4"
                  >
                    {section.items.length}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-gray-300">0</span>
                )}
                {openItems[section.id] ? (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                )}
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="pl-7 pr-2 py-1 space-y-1">
                  {section.items.length === 0 ? (
                    <p className="text-[10px] text-gray-400 py-1">
                      {section.emptyMessage}
                    </p>
                  ) : (
                    section.items.map((item, i) => (
                      <div
                        key={i}
                        className="text-xs text-gray-600 py-1 border-l-2 border-gray-200 pl-2 hover:border-blue-400 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
