/**
 * CollaborateursPanel.tsx — "Mes Collaborateurs"
 * Icones harmonisees avec le reste de la sidebar droite
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import { ChevronDown, ChevronRight, UserCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";

const COLLABORATEURS = [
  { nom: "Carl Fugere", role: "CEO", interne: true, en_ligne: true },
  { nom: "Equipe Dev", role: "Technique", interne: true, en_ligne: true },
  { nom: "Comptable ABC", role: "Finance", interne: false, en_ligne: false },
  { nom: "Agence XYZ", role: "Marketing", interne: false, en_ligne: false },
];

export function CollaborateursPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-semibold text-gray-700 hover:text-gray-900">
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <UserCircle className="h-3.5 w-3.5 text-green-500" />
        Mes Collaborateurs
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
          {COLLABORATEURS.length}
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-1">
          {COLLABORATEURS.map((collab) => (
            <div
              key={collab.nom}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                {collab.nom
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">
                  {collab.nom}
                </div>
                <div className="text-[10px] text-gray-400">
                  {collab.role}
                  {!collab.interne && " (ext.)"}
                </div>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${collab.en_ligne ? "bg-green-500" : "bg-gray-300"}`}
              />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
