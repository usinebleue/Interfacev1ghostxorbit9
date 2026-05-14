/**
 * BubbleActions.tsx — S1.4: Multi-select options + Cristalliser
 *
 * Chat = generer. Workspace = travailler.
 * Les bulles ont:
 *   1. Les options backend (3 choix proposes par le bot) — multi-select
 *      - Click = toggle selection (checkbox)
 *      - Double-click = envoi immediat (retro-compatible)
 *      - Bouton "Envoyer N choix" quand >= 1 selectionne
 *   2. Cristalliser (capture manuelle vers workspace)
 */

import { useState, useCallback, useRef } from "react";
import { Diamond, ArrowRight, CheckCircle2, Send } from "lucide-react";

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
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOptionClick = useCallback((i: number, opt: string) => {
    // Double-click detection: if second click within 300ms, send immediately
    if (clickTimerRef.current !== null) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      // Double-click = envoi immediat (1 seul choix, comportement legacy)
      onAction(opt);
      setSelected(new Set());
      return;
    }
    // Single click = toggle selection after 300ms delay
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i); else next.add(i);
        return next;
      });
    }, 300);
  }, [onAction]);

  const handleSendSelected = useCallback(() => {
    if (!backendOptions || selected.size === 0) return;
    const combined = [...selected].sort()
      .map(i => backendOptions[i])
      .join("\n\n");
    onAction(combined);
    setSelected(new Set());
  }, [selected, backendOptions, onAction]);

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {/* Backend options — multi-select */}
      {backendOptions && backendOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {backendOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(i, opt)}
              style={{ animation: `fadeSlideUp 0.3s ease-out ${i * 0.08}s both` }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] border cursor-pointer transition-all font-medium max-w-[180px] text-left ${
                selected.has(i)
                  ? "text-sky-800 border-sky-400 bg-sky-100 ring-1 ring-sky-300"
                  : "text-sky-700 border-sky-200 bg-sky-50 hover:bg-sky-100 hover:border-sky-300"
              }`}
            >
              {selected.has(i)
                ? <CheckCircle2 className="h-2.5 w-2.5 flex-shrink-0 text-sky-600" />
                : <ArrowRight className="h-2.5 w-2.5 flex-shrink-0" />
              }
              <span className="line-clamp-2">{opt}</span>
            </button>
          ))}
          {/* Bouton envoi combine */}
          {selected.size > 0 && (
            <button
              onClick={handleSendSelected}
              style={{ animation: "fadeSlideUp 0.2s ease-out both" }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-white bg-sky-600 hover:bg-sky-700 cursor-pointer transition-all font-medium"
            >
              <Send className="h-2.5 w-2.5" />
              Envoyer {selected.size} choix
            </button>
          )}
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
