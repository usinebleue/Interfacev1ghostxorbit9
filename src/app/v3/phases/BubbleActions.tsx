/**
 * BubbleActions.tsx — Sprint 2A v3: Cristalliser + Backend Options
 *
 * Chat = generer. Workspace = travailler.
 * Les bulles ont:
 *   1. Les options backend (3 choix proposes par le bot) — cliquables
 *   2. Cristalliser (capture manuelle vers workspace)
 */

import { Diamond, ArrowRight } from "lucide-react";

interface BubbleActionsProps {
  onAction: (prompt: string) => void;
  onCristallise: () => void;
  chatStage: number;
  messageContent: string;
  backendOptions?: string[];
  phaseTransition?: string | null;
  onPhaseTransition?: () => void;
  gpsSuggestion?: { section_id: string; section_label: string; confidence: number } | null;
  onGpsCristallise?: () => void;
}

export function BubbleActions({ onAction, onCristallise, backendOptions }: BubbleActionsProps) {
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {/* Backend options — les 3 choix proposes par le bot */}
      {backendOptions && backendOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {backendOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAction(opt)}
              style={{ animation: `fadeSlideUp 0.3s ease-out ${i * 0.08}s both` }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-sky-700 border border-sky-200 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 cursor-pointer transition-all font-medium max-w-[180px] text-left"
            >
              <ArrowRight className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="line-clamp-2">{opt}</span>
            </button>
          ))}
        </div>
      )}
      {/* Cristalliser — capture manuelle */}
      <div className="flex flex-wrap items-center gap-1">
        <button
          onClick={onCristallise}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer transition-all font-medium"
        >
          <Diamond className="h-2.5 w-2.5" />
          Cristalliser
        </button>
      </div>
    </div>
  );
}
