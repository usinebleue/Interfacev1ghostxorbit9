/**
 * BubbleActions.tsx — Sprint 2A v2: Cristalliser only
 *
 * Chat = generer. Workspace = travailler.
 * Les bulles n'ont qu'un seul bouton: Cristalliser (capture manuelle).
 * Les sky pills (options backend) sont retirees — Carl feedback 12 mai.
 */

import { Diamond } from "lucide-react";

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

export function BubbleActions({ onCristallise }: BubbleActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        onClick={onCristallise}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer transition-all font-medium"
      >
        <Diamond className="h-2.5 w-2.5" />
        Cristalliser
      </button>
    </div>
  );
}
