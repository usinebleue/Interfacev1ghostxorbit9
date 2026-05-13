/**
 * DocForgeActionButtons.tsx — 5 boutons ronds toggle DocForge
 *
 * Port depuis SimAmorcer L6376-6401:
 * - Epingler (Pin, blue toggle)
 * - Approfondir (BookOpen, violet toggle)
 * - Reformuler (RefreshCw, amber toggle)
 * - Challenger (AlertTriangle, red)
 * - Fusionner (Layers, green)
 *
 * Pattern: rounded-full px-2 py-0.5 text-xs font-medium
 */

import { Pin, BookOpen, RefreshCw, AlertTriangle, Layers } from "lucide-react";
import { cn } from "../../components/ui/utils";
import type { L2Theme } from "./docforge-config";

interface DocForgeActionButtonsProps {
  sectionTitle: string;
  theme: L2Theme;
  onPin: () => void;
  onApprofondir: () => void;
  onReformuler: () => void;
  onChallenger: () => void;
  onFusionner: () => void;
  pinnedFeedback?: boolean;
  activeAction?: string | null;
}

const BASE = "text-xs font-medium cursor-pointer flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors border";
const INACTIVE = "text-gray-500 bg-white border-gray-200 hover:bg-gray-50";

export function DocForgeActionButtons({
  onPin, onApprofondir, onReformuler, onChallenger, onFusionner,
  pinnedFeedback, activeAction,
}: DocForgeActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {/* Epingler */}
      <button onClick={onPin} className={cn(BASE,
        pinnedFeedback ? "text-blue-700 bg-blue-100 border-blue-300" : INACTIVE
      )}>
        <Pin className="h-3.5 w-3.5" /> {pinnedFeedback ? "Epingle!" : "Epingler"}
      </button>

      {/* Approfondir */}
      <button onClick={onApprofondir} className={cn(BASE,
        activeAction === "approfondir" ? "text-violet-700 bg-violet-100 border-violet-300" : INACTIVE
      )}>
        <BookOpen className="h-3.5 w-3.5" /> Approfondir
      </button>

      {/* Reformuler */}
      <button onClick={onReformuler} className={cn(BASE,
        activeAction === "reformuler" ? "text-amber-700 bg-amber-100 border-amber-300" : INACTIVE
      )}>
        <RefreshCw className="h-3.5 w-3.5" /> Reformuler
      </button>

      {/* Challenger */}
      <button onClick={onChallenger} className={cn(BASE,
        activeAction === "challenger" ? "text-red-700 bg-red-100 border-red-300" : INACTIVE
      )}>
        <AlertTriangle className="h-3.5 w-3.5" /> Challenger
      </button>

      {/* Fusionner */}
      <button onClick={onFusionner} className={cn(BASE,
        activeAction === "fusionner" ? "text-green-700 bg-green-100 border-green-300" : INACTIVE
      )}>
        <Layers className="h-3.5 w-3.5" /> Fusionner
      </button>
    </div>
  );
}
