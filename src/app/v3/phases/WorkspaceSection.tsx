/**
 * WorkspaceSection.tsx — Composant universel pour UNE section de phase
 *
 * 3 états visuels:
 * - Vide: description + bouton "Lancer"
 * - En attente: skeleton pulse (bot en train de répondre)
 * - Cristallisé: contenu markdown du bot + boutons d'action + hover "Modifier"
 *
 * Les actions re-envoient un prompt avec le contenu actuel → remplace le cristallisé.
 * "Épingler" = action locale (pas de prompt, gérée par le parent).
 */

import { useState } from "react";
import { Rocket, Pencil, Mic, Users, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import type { PhaseSection, SectionAction } from "./phase-sections";

interface WorkspaceSectionProps {
  section: PhaseSection;
  cristallise: string | null;
  isPending: boolean;
  phaseColor: string; // "orange" | "yellow"
  onLaunch: (sectionId: string, prompt: string) => void;
  onAction: (sectionId: string, action: SectionAction) => void;
  onEditSave?: (sectionId: string, newText: string) => void;
  sourceType?: "chat" | "voice" | "meeting";
  sourceBotName?: string;
}

export function WorkspaceSection({
  section,
  cristallise,
  isPending,
  phaseColor,
  onLaunch,
  onAction,
  onEditSave,
  sourceType,
  sourceBotName,
}: WorkspaceSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const colorMap: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", hoverBg: "hover:bg-orange-100" },
    yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", hoverBg: "hover:bg-yellow-100" },
  };
  const c = colorMap[phaseColor] || colorMap.orange;

  const startEdit = () => {
    if (cristallise) {
      setEditText(cristallise);
      setIsEditing(true);
    }
  };

  const saveEdit = () => {
    if (onEditSave && editText.trim()) {
      onEditSave(section.id, editText.trim());
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText("");
  };

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
        <section.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <h3 className="text-sm font-bold text-gray-900 flex-1">{section.title}</h3>
        {!cristallise && !isPending && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">À faire</span>
        )}
        {isPending && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} animate-pulse`}>En cours</span>
        )}
        {cristallise && !isPending && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Cristallisé</span>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* État: Vide */}
        {!cristallise && !isPending && (
          <>
            <p className="text-sm text-gray-600 leading-relaxed">{section.description}</p>
            <button
              onClick={() => onLaunch(section.id, section.prompt)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${c.bg} border ${c.border} ${c.text} text-sm font-bold ${c.hoverBg} transition-colors`}
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
            <p className="text-[10px] text-gray-400 italic mt-3">L'équipe AI répond...</p>
          </div>
        )}

        {/* État: Cristallisé */}
        {cristallise && !isPending && (
          <>
            {isEditing ? (
              /* Mode édition inline */
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full min-h-[160px] text-sm text-gray-700 leading-relaxed p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                  autoFocus
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 text-[10px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1.5 text-[10px] font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            ) : (
              /* Contenu cristallisé avec hover "Modifier" */
              <div className="relative group/edit">
                <div
                  className="absolute top-1.5 right-2 opacity-0 group-hover/edit:opacity-100 transition-opacity z-10
                    flex items-center gap-1 bg-white/90 border border-blue-200 rounded px-1.5 py-0.5 shadow-sm cursor-pointer"
                  onClick={startEdit}
                >
                  <Pencil className="h-3 w-3 text-blue-400" />
                  <span className="text-[9px] text-blue-400 font-medium">Modifier</span>
                </div>
                <div className="group-hover/edit:ring-1 group-hover/edit:ring-blue-200 rounded-lg transition-all">
                  <div
                    className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: (cristallise || "")
                      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em class="text-gray-600 italic">$1</em>')
                    }}
                  />
                </div>
              </div>
            )}

            {/* Source badge */}
            {!isEditing && sourceType && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                {sourceType === "voice" && <Mic className="h-3 w-3 text-blue-400" />}
                {sourceType === "meeting" && <Users className="h-3 w-3 text-purple-400" />}
                {sourceType === "chat" && <MessageSquare className="h-3 w-3 text-gray-400" />}
                <span className="text-[9px] text-gray-400">
                  {sourceBotName || "CarlOS"} — {sourceType === "voice" ? "Vocal" : sourceType === "meeting" ? "Réunion" : "Chat"}
                </span>
              </div>
            )}

            {/* Action buttons + feedback */}
            {!isEditing && (
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
                      onClick={() => onAction(section.id, action)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors ${variantClass}`}
                    >
                      <action.icon className="h-3 w-3" />
                      {action.label}
                    </button>
                  );
                })}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => setFeedback(feedback === "up" ? null : "up")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${feedback === "up" ? "text-emerald-600 bg-emerald-50" : "text-gray-300 hover:text-emerald-500 hover:bg-emerald-50"}`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setFeedback(feedback === "down" ? null : "down")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${feedback === "down" ? "text-red-500 bg-red-50" : "text-gray-300 hover:text-red-400 hover:bg-red-50"}`}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
