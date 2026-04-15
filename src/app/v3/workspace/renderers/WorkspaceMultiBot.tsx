/**
 * WorkspaceMultiBot.tsx — Renderer consultation multi-bot V1
 *
 * Grille multi-perspectives (3+ bots). Sections vides à remplir manuellement.
 * Pattern: basé sur SimPhaseReflexion grille — cards par bot avec perspective.
 * Basé sur le design-system.md cards pattern.
 */

import { useState } from "react";
import { Users, MessageSquare, Pencil } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { BOT_NAME, BOT_ROLE, BOT_AVATAR } from "../../constants";
import type { RendererProps } from "../types";

// 6 bots principaux pour la consultation multi-bot
const CONSULTATION_BOTS = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB"];

const BOT_COLORS: Record<string, string> = {
  CEOB: "blue", CTOB: "violet", CFOB: "emerald", CMOB: "pink",
  CSOB: "red", COOB: "orange",
};

export function WorkspaceMultiBot({ sectionConfig, botCode }: RendererProps) {
  const [perspectives, setPerspectives] = useState<Record<string, string>>({});
  const [editingBot, setEditingBot] = useState<string | null>(null);

  // Filtrer: le département actif en premier, puis les autres
  const orderedBots = [
    botCode,
    ...CONSULTATION_BOTS.filter((b) => b !== botCode),
  ].slice(0, 6);

  function updatePerspective(code: string, text: string) {
    setPerspectives((prev) => ({ ...prev, [code]: text }));
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">{sectionConfig.label}</span>
          <div className="flex-1" />
          <span className="text-[10px] text-gray-500">
            {Object.keys(perspectives).filter((k) => perspectives[k]).length}/{orderedBots.length} perspectives
          </span>
        </div>
      </div>

      {/* Grille de bots */}
      <div className="grid grid-cols-2 gap-3">
        {orderedBots.map((code) => {
          const color = BOT_COLORS[code] || "gray";
          const name = BOT_NAME[code] || code;
          const role = BOT_ROLE[code] || "";
          const avatar = BOT_AVATAR[code];
          const perspective = perspectives[code] || "";
          const isEditing = editingBot === code;

          return (
            <div
              key={code}
              className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-all"
            >
              {/* Bot header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-gray-800 block truncate">{name}</span>
                  <span className="text-[9px] text-gray-400">{role}</span>
                </div>
                <button
                  onClick={() => setEditingBot(isEditing ? null : code)}
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all",
                    isEditing
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Perspective */}
              <div className="p-3 min-h-[80px]">
                {isEditing ? (
                  <textarea
                    value={perspective}
                    onChange={(e) => updatePerspective(code, e.target.value)}
                    placeholder={`Perspective de ${name} sur ce sujet...`}
                    className="w-full min-h-[80px] text-xs text-gray-700 leading-relaxed resize-y border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    autoFocus
                  />
                ) : perspective ? (
                  <div className={`text-xs text-gray-700 leading-relaxed border-l-[3px] border-l-${color}-400 pl-2.5`}>
                    {perspective}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[80px]">
                    <span className="text-[10px] text-gray-300 italic flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      En attente
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
