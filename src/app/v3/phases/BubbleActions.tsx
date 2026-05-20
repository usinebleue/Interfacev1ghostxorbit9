/**
 * BubbleActions.tsx — S1.4 + S117: Double-section options sous les bulles
 *
 * Chat = generer. Workspace = travailler.
 * Les bulles ont 2 sections:
 *   1. "Continuer la discussion" (gris) — options backend (3 choix proposes par le bot)
 *      - Click = toggle selection (checkbox)
 *      - Double-click = envoi immediat (retro-compatible)
 *      - Bouton "Envoyer N choix" quand >= 1 selectionne
 *   2. "Actions suggerees" (bleu, border dashed) — mobilisation bots + modes reflexion
 *      - consultationSuggestions = experts a consulter
 *      - cascadeSuggestions = modes de reflexion / sections workspace
 *   (Cristallisation automatique via useWorkspaceCapture — pas de bouton manuel)
 */

import { useState, useCallback, useRef } from "react";
import { ArrowRight, CheckCircle2, Send, Users, Brain, Zap } from "lucide-react";

export interface CascadeSuggestion {
  label: string;
  prompt: string;
  target_section?: string;
  view?: string;
  icon?: string;
}

export interface ConsultationSuggestion {
  consult: string;       // bot code
  consult_nom: string;
  consult_titre: string;
  consult_emoji: string;
  raison: string;
}

interface BubbleActionsProps {
  onAction: (prompt: string) => void;
  chatStage: number;
  messageContent: string;
  backendOptions?: string[];
  phaseTransition?: string | null;
  onPhaseTransition?: () => void;
  gpsSuggestion?: { section_id: string; section_label: string; confidence: number } | null;
  onGpsCristallise?: () => void;
  consultationSuggestions?: ConsultationSuggestion[];
  cascadeSuggestions?: CascadeSuggestion[];
  onConsultBot?: (suggestion: ConsultationSuggestion) => void;
  onCascadeAction?: (suggestion: CascadeSuggestion) => void;
}

export function BubbleActions({
  onAction,
  backendOptions,
  consultationSuggestions,
  cascadeSuggestions,
  onConsultBot,
  onCascadeAction,
}: BubbleActionsProps) {
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

  const hasBackendOptions = backendOptions && backendOptions.length > 0;
  const hasConsultations = consultationSuggestions && consultationSuggestions.length > 0;
  const hasCascades = cascadeSuggestions && cascadeSuggestions.length > 0;
  const hasSuggestedActions = hasConsultations || hasCascades;

  return (
    <div className="flex flex-col gap-2 mt-1">
      {/* Section 1: Continuer la discussion (gris) — backend options */}
      {hasBackendOptions && (
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide px-0.5">Continuer la discussion</span>
          <div className="flex flex-wrap items-center gap-1">
            {backendOptions!.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(i, opt)}
                style={{ animation: `fadeSlideUp 0.3s ease-out ${i * 0.08}s both` }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] border cursor-pointer transition-all font-medium max-w-[180px] text-left ${
                  selected.has(i)
                    ? "text-gray-800 border-gray-400 bg-gray-100 ring-1 ring-gray-300"
                    : "text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                {selected.has(i)
                  ? <CheckCircle2 className="h-2.5 w-2.5 flex-shrink-0 text-gray-600" />
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
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-white bg-gray-700 hover:bg-gray-800 cursor-pointer transition-all font-medium"
              >
                <Send className="h-2.5 w-2.5" />
                Envoyer {selected.size} choix
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section 2: Actions suggerees (bleu, border dashed) — bots + modes reflexion */}
      {hasSuggestedActions && (
        <div className="flex flex-col gap-1 border border-dashed border-blue-200 rounded-lg p-2 bg-blue-50/30">
          <span className="text-[9px] text-blue-500 font-medium uppercase tracking-wide flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" />
            Actions suggerees
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {/* Consultation suggestions — mobiliser un expert */}
            {hasConsultations && consultationSuggestions!.map((s, i) => (
              <button
                key={`consult-${i}`}
                onClick={() => onConsultBot?.(s)}
                style={{ animation: `fadeSlideUp 0.3s ease-out ${i * 0.08}s both` }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all font-medium"
              >
                <Users className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="line-clamp-1">{s.consult_emoji} {s.consult_nom}</span>
              </button>
            ))}
            {/* Cascade suggestions — modes de reflexion / workspace actions */}
            {hasCascades && cascadeSuggestions!.map((s, i) => (
              <button
                key={`cascade-${i}`}
                onClick={() => onCascadeAction?.(s)}
                style={{ animation: `fadeSlideUp 0.3s ease-out ${(i + (consultationSuggestions?.length || 0)) * 0.08}s both` }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all font-medium"
              >
                <Brain className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="line-clamp-1">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
