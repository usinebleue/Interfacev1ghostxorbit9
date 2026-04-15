/**
 * WorkspaceEditor.tsx — Renderer éditeur texte V1
 *
 * Éditeur texte simple. Sections vides à remplir manuellement (Carl Q5 = vide).
 * Pattern: zone de texte libre avec placeholder contextuel.
 * Basé sur le pattern DocForge section editor.
 */

import { useState } from "react";
import { FileText, Pencil } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import type { RendererProps } from "../types";

export function WorkspaceEditor({ sectionConfig }: RendererProps) {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-3">
      {/* Zone éditeur */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">{sectionConfig.label}</span>
          <div className="flex-1" />
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1.5 cursor-pointer transition-all",
              isEditing
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            {isEditing ? "Édition" : "Éditer"}
          </button>
        </div>
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Rédigez le contenu de "${sectionConfig.label}" ici...\n\nCette section sera remplie au fur et à mesure de votre travail avec l'équipe Brain Team.`}
              className="w-full min-h-[200px] text-sm text-gray-700 leading-relaxed resize-y border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
          ) : content ? (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic py-8 text-center">
              Section vide — cliquez "Éditer" pour commencer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
