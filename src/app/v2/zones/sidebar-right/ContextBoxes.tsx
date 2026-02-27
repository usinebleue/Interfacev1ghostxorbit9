/**
 * ContextBoxes.tsx — Boxes retractables dynamiques (wireframe p.2-3)
 * Contexte adapte selon la vue active :
 *   - Dashboard/Tour de Controle : Alertes, Messages, Projets en cours, A Valider
 *   - Discussion/Department (creation) : Video Chat, Documents en creation, Branches d'idees
 * Sprint A — Frame Master V2
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  MessageCircle,
  FolderKanban,
  Video,
  CheckSquare,
  FileText,
  GitBranch,
  LayoutGrid,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Badge } from "../../../components/ui/badge";
import { useFrameMaster } from "../../context/FrameMasterContext";

interface ContextBox {
  id: string;
  label: string;
  icon: React.ElementType;
  count: number;
  items: string[];
  context: "dashboard" | "work" | "both";
}

const BOXES: ContextBox[] = [
  // --- Contexte Tour de Controle / Dashboard ---
  {
    id: "alertes",
    label: "Alertes",
    icon: AlertTriangle,
    count: 2,
    items: ["Facture #1234 en retard (15j)", "Client ABC inactif depuis 30j"],
    context: "dashboard",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageCircle,
    count: 5,
    items: [
      "CTO: Sprint A 85% complete",
      "CFO: Budget Q1 approuve",
      "CMO: Campagne email prete",
    ],
    context: "dashboard",
  },
  {
    id: "projets",
    label: "Projets en cours",
    icon: FolderKanban,
    count: 3,
    items: [
      "Sprint A — Interface Web",
      "Optimisation pipeline ventes",
      "Integration Stripe",
    ],
    context: "dashboard",
  },
  {
    id: "avalider",
    label: "A Valider",
    icon: CheckSquare,
    count: 2,
    items: [
      "Soumission client XYZ — 45K$",
      "Embauche dev senior — approbation",
    ],
    context: "dashboard",
  },

  // --- Contexte Creation / Developpement ---
  {
    id: "videochat",
    label: "Video Chat",
    icon: Video,
    count: 0,
    items: ["Aucune session active"],
    context: "work",
  },
  {
    id: "documents",
    label: "Documents en creation",
    icon: FileText,
    count: 1,
    items: ["Cahier de Projets — Demo"],
    context: "work",
  },
  {
    id: "branches",
    label: "Branches d'idees",
    icon: GitBranch,
    count: 4,
    items: [
      "Bot Marketplace concept",
      "Modele de pricing V2",
      "Partenariat XYZ",
      "Feature voix ElevenLabs",
    ],
    context: "work",
  },
];

export function ContextBoxes() {
  const { activeView } = useFrameMaster();
  const [openBoxes, setOpenBoxes] = useState<Record<string, boolean>>({
    alertes: true,
    documents: true,
  });

  const toggle = (id: string) => {
    setOpenBoxes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrer les boxes selon le contexte actif
  const isWorkContext = activeView === "discussion" || activeView === "department";
  const filteredBoxes = BOXES.filter((box) =>
    box.context === "both" ||
    (isWorkContext ? box.context === "work" : box.context === "dashboard")
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 px-1 py-1">
        <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
        {isWorkContext ? "Contexte de travail" : "Vue d'ensemble"}
      </div>
      {filteredBoxes.map((box) => (
        <Collapsible
          key={box.id}
          open={openBoxes[box.id] || false}
          onOpenChange={() => toggle(box.id)}
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-semibold text-gray-700 hover:text-gray-900">
            {openBoxes[box.id] ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <box.icon className="h-3.5 w-3.5" />
            {box.label}
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
              {box.count}
            </Badge>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-1 space-y-1 pl-5">
              {box.items.map((item, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground py-1 border-l-2 border-muted pl-2"
                >
                  {item}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
