/**
 * ActionBar.tsx — Barre d'actions universelle
 * Presente en bas de chaque mode de reflexion
 * Actions : Hub, Back, Pause, Export, Breadcrumb
 * Sprint A — Frame Master V2
 */

"use client";

import {
  Home,
  ArrowLeft,
  Pause,
  Play,
  Download,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import type { BreadcrumbEntry, ModeId } from "../context/TransitionContext";

interface ActionBarProps {
  /** Retour au Hub */
  onHub: () => void;
  /** Retour a l'etape precedente */
  onBack?: () => void;
  /** Peut-on reculer ? */
  canGoBack?: boolean;
  /** Pause/Resume timer */
  onTogglePause?: () => void;
  /** Est-ce que le timer est en pause ? */
  isPaused?: boolean;
  /** Exporter (visible quand stage >= synthese) */
  onExport?: () => void;
  /** Afficher le bouton export ? */
  showExport?: boolean;
  /** Breadcrumb — transitions inter-modes */
  breadcrumb?: BreadcrumbEntry[];
  /** Message d'anti-boucle */
  antiLoopMessage?: string | null;
  /** Mode actuel pour le breadcrumb */
  currentModeLabel?: string;
}

export function ActionBar({
  onHub,
  onBack,
  canGoBack = false,
  onTogglePause,
  isPaused,
  onExport,
  showExport = false,
  breadcrumb = [],
  antiLoopMessage,
  currentModeLabel,
}: ActionBarProps) {
  return (
    <div className="shrink-0 border-t bg-white px-3 py-2 space-y-1">
      {/* Breadcrumb si transitions inter-modes */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1 overflow-x-auto">
          {breadcrumb.map((entry, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <span className="text-gray-500">{entry.label}</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          ))}
          {currentModeLabel && (
            <span className="text-blue-600 font-medium">{currentModeLabel}</span>
          )}
        </div>
      )}

      {/* Anti-loop warning */}
      {antiLoopMessage && (
        <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-1">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{antiLoopMessage}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Hub */}
        <button
          onClick={onHub}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Home className="h-3.5 w-3.5" /> Hub
        </button>

        {/* Back */}
        {canGoBack && onBack && (
          <button
            onClick={onBack}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pause/Resume */}
        {onTogglePause && (
          <button
            onClick={onTogglePause}
            className={cn(
              "text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer",
              isPaused
                ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            )}
          >
            {isPaused ? (
              <><Play className="h-3.5 w-3.5" /> Reprendre</>
            ) : (
              <><Pause className="h-3.5 w-3.5" /> Pause</>
            )}
          </button>
        )}

        {/* Export */}
        {showExport && onExport && (
          <button
            onClick={onExport}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Exporter
          </button>
        )}
      </div>
    </div>
  );
}
