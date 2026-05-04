/**
 * WorkspaceSection.tsx — Composant universel pour UNE section de phase
 *
 * 3 états visuels:
 * - Vide: description + bouton "Lancer"
 * - En attente: skeleton pulse (bot en train de répondre)
 * - Cristallisé: contenu markdown du bot + boutons d'action
 *
 * Les actions re-envoient un prompt avec le contenu actuel → remplace le cristallisé.
 */

import { Rocket } from "lucide-react";
import type { PhaseSection, SectionAction } from "./phase-sections";

interface WorkspaceSectionProps {
  section: PhaseSection;
  cristallise: string | null;
  isPending: boolean;
  phaseColor: string; // "orange" | "yellow"
  onLaunch: (sectionId: string, prompt: string) => void;
  onAction: (sectionId: string, prompt: string) => void;
}

export function WorkspaceSection({
  section,
  cristallise,
  isPending,
  phaseColor,
  onLaunch,
  onAction,
}: WorkspaceSectionProps) {
  const colorMap: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", hoverBg: "hover:bg-orange-100" },
    yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", hoverBg: "hover:bg-yellow-100" },
  };
  const c = colorMap[phaseColor] || colorMap.orange;

  const handleAction = (action: SectionAction) => {
    const prompt = cristallise
      ? action.promptTemplate.replace("{content}", cristallise.slice(0, 800))
      : action.promptTemplate.replace("{content}", "");
    onAction(section.id, prompt);
  };

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
        <section.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <h3 className="text-sm font-bold text-gray-900 flex-1">{section.title}</h3>
        {!cristallise && !isPending && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{"\u00c0"} faire</span>
        )}
        {isPending && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} animate-pulse`}>En cours</span>
        )}
        {cristallise && !isPending && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Cristallis\u00e9</span>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* État: Vide */}
        {!cristallise && !isPending && (
          <>
            <p className="text-xs text-gray-600 leading-relaxed">{section.description}</p>
            <button
              onClick={() => onLaunch(section.id, section.prompt)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${c.bg} border ${c.border} ${c.text} text-xs font-bold ${c.hoverBg} transition-colors`}
            >
              <Rocket className="h-3.5 w-3.5" />
              Lancer {section.title.toLowerCase()}
            </button>
          </>
        )}

        {/* État: En attente (skeleton) */}
        {isPending && (
          <div className="space-y-2">
            <div className={`h-3 ${c.bg} rounded animate-pulse w-full`} />
            <div className={`h-3 ${c.bg} rounded animate-pulse w-5/6`} />
            <div className={`h-3 ${c.bg} rounded animate-pulse w-4/6`} />
            <div className={`h-3 ${c.bg} rounded animate-pulse w-full`} />
            <div className={`h-3 ${c.bg} rounded animate-pulse w-3/6`} />
            <p className="text-[10px] text-gray-400 italic mt-3">L{"\u2019"}\u00e9quipe AI r\u00e9pond...</p>
          </div>
        )}

        {/* État: Cristallisé */}
        {cristallise && !isPending && (
          <>
            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {cristallise}
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
              {section.actions.map((action, i) => {
                const variantClass = action.variant === "warning"
                  ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                  : action.variant === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50";
                return (
                  <button
                    key={i}
                    onClick={() => handleAction(action)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors ${variantClass}`}
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
